/**
 * Blockchain Service
 * 
 * Provides core blockchain functionality for the AetherCoin ecosystem.
 * Integrates with Web3 providers and manages blocks, transactions,
 * and blockchain events.
 */

import { EventEmitter } from 'events';
import { SHA256 } from 'crypto-js';
import { 
  Block, 
  Transaction, 
  BlockchainConfig,
  WalletConnectionStatus,
  BlockchainNetworkType,
  BlockchainEventListener
} from './types';
import { GOLDEN_RATIO } from '../biozoe/FractalAlgorithms';

// Default configuration using Golden Ratio for Chain ID
const DEFAULT_CONFIG: BlockchainConfig = {
  networkId: 1,
  chainId: Math.round(GOLDEN_RATIO * 100000), // 161803
  difficulty: 4,
  blockTime: 10000, // 10 seconds
  genesisTimestamp: Date.now()
};

/**
 * BlockchainService - Core blockchain functionality for AetherCoin
 */
class BlockchainService extends EventEmitter {
  private chain: Block[] = [];
  private pendingTransactions: Transaction[] = [];
  private config: BlockchainConfig;
  private walletStatus: WalletConnectionStatus = WalletConnectionStatus.DISCONNECTED;
  private walletAddress: string | null = null;
  private networkType: BlockchainNetworkType = BlockchainNetworkType.MAINNET;
  private blockInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Set<BlockchainEventListener>> = new Map();
  
  constructor(config: BlockchainConfig = DEFAULT_CONFIG) {
    super();
    this.config = config;
    this.initializeChain();
    this.setupWeb3Listeners();
  }
  
  /**
   * Initialize blockchain with genesis block
   */
  private initializeChain(): void {
    const genesisBlock = this.createGenesisBlock();
    this.chain = [genesisBlock];
  }
  
  /**
   * Create genesis block for the chain
   */
  private createGenesisBlock(): Block {
    const genesisData = {
      message: "AetherCoin Genesis Block - BioZoeCurrency Ecosystem",
      goldenRatio: GOLDEN_RATIO,
      timestamp: this.config.genesisTimestamp
    };
    
    const hash = SHA256(JSON.stringify(genesisData)).toString();
    
    return {
      index: 0,
      timestamp: this.config.genesisTimestamp,
      transactions: [],
      previousHash: "0",
      hash,
      nonce: 0,
      difficulty: this.config.difficulty
    };
  }
  
  /**
   * Set up listeners for Web3 wallet events
   */
  private setupWeb3Listeners(): void {
    if (typeof window !== 'undefined' && window.ethereum) {
      // Setup metamask/web3 event listeners
      window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
      window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));
      window.ethereum.on('connect', this.handleConnect.bind(this));
      window.ethereum.on('disconnect', this.handleDisconnect.bind(this));
    }
  }
  
  /**
   * Handle wallet account changes
   */
  private handleAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) {
      this.walletAddress = null;
      this.walletStatus = WalletConnectionStatus.DISCONNECTED;
    } else {
      this.walletAddress = accounts[0];
      this.walletStatus = WalletConnectionStatus.CONNECTED;
    }
    
    this.emit('accountsChanged', { accounts, walletStatus: this.walletStatus });
    this.notifyListeners('accountsChanged', { accounts, walletStatus: this.walletStatus });
  }
  
  /**
   * Handle blockchain network changes
   */
  private handleChainChanged(chainId: string): void {
    this.emit('chainChanged', { chainId });
    this.notifyListeners('chainChanged', { chainId });
    
    // Update network type based on chain ID
    const chainIdNum = parseInt(chainId, 16);
    
    if (chainIdNum === this.config.chainId) {
      this.networkType = BlockchainNetworkType.MAINNET;
    } else if (chainIdNum === 314159) { // Pi-based testnet
      this.networkType = BlockchainNetworkType.TESTNET;
    } else if (chainIdNum === 161803) { // Golden ratio
      this.networkType = BlockchainNetworkType.GOLDEN;
    } else {
      this.networkType = BlockchainNetworkType.CUSTOM;
    }
    
    this.emit('networkTypeChanged', { networkType: this.networkType });
    this.notifyListeners('networkTypeChanged', { networkType: this.networkType });
  }
  
  /**
   * Handle wallet connection
   */
  private handleConnect(connectInfo: { chainId: string }): void {
    this.walletStatus = WalletConnectionStatus.CONNECTED;
    this.emit('connect', { ...connectInfo, walletStatus: this.walletStatus });
    this.notifyListeners('connect', { ...connectInfo, walletStatus: this.walletStatus });
  }
  
  /**
   * Handle wallet disconnection
   */
  private handleDisconnect(error: { code: number; message: string }): void {
    this.walletStatus = WalletConnectionStatus.DISCONNECTED;
    this.walletAddress = null;
    this.emit('disconnect', { error, walletStatus: this.walletStatus });
    this.notifyListeners('disconnect', { error, walletStatus: this.walletStatus });
  }
  
  /**
   * Get the latest block in the chain
   */
  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }
  
  /**
   * Get the current block height (chain length)
   */
  public getBlockHeight(): number {
    return this.chain.length;
  }
  
  /**
   * Generate a new block with current pending transactions
   */
  public generateBlock(): Block {
    const latestBlock = this.getLatestBlock();
    const newIndex = latestBlock.index + 1;
    const timestamp = Date.now();
    const transactions = [...this.pendingTransactions];
    
    const newBlock: Block = {
      index: newIndex,
      timestamp,
      transactions,
      previousHash: latestBlock.hash,
      hash: "",
      nonce: 0,
      difficulty: this.config.difficulty
    };
    
    // Mine the block (find valid hash)
    const minedBlock = this.mineBlock(newBlock);
    
    // Clear pending transactions
    this.pendingTransactions = [];
    
    // Add the new block to the chain
    this.chain.push(minedBlock);
    
    // Emit block added event
    this.emit('blockAdded', minedBlock);
    this.notifyListeners('blockAdded', minedBlock);
    
    return minedBlock;
  }
  
  /**
   * Mine a block to find a valid hash (proof-of-work)
   */
  private mineBlock(block: Block): Block {
    const target = "0".repeat(this.config.difficulty);
    const blockData = this.getBlockData(block);
    
    let nonce = 0;
    let hash = "";
    
    while (true) {
      nonce++;
      hash = SHA256(blockData + nonce).toString();
      
      if (hash.substring(0, this.config.difficulty) === target) {
        break;
      }
    }
    
    block.nonce = nonce;
    block.hash = hash;
    
    return block;
  }
  
  /**
   * Get block data as string for hashing
   */
  private getBlockData(block: Block): string {
    return block.index + 
           block.timestamp + 
           JSON.stringify(block.transactions) + 
           block.previousHash + 
           block.difficulty;
  }
  
  /**
   * Create and add a new transaction to pending
   */
  public createTransaction(from: string, to: string, amount: number, data?: any): Transaction {
    const transaction: Transaction = {
      id: this.generateTransactionId(from, to, amount),
      from,
      to,
      amount,
      timestamp: Date.now(),
      signature: this.signTransaction(from, to, amount),
      data
    };
    
    this.pendingTransactions.push(transaction);
    
    this.emit('transactionCreated', transaction);
    this.notifyListeners('transactionCreated', transaction);
    
    return transaction;
  }
  
  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(from: string, to: string, amount: number): string {
    return SHA256(from + to + amount + Date.now() + Math.random()).toString();
  }
  
  /**
   * Sign a transaction (placeholder for actual wallet signing)
   */
  private signTransaction(from: string, to: string, amount: number): string {
    // In a real implementation, this would use the wallet's signing capability
    return SHA256(from + to + amount + this.config.chainId + Date.now()).toString();
  }
  
  /**
   * Verify the integrity of the entire blockchain
   */
  public isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      
      // Check if hash is correct
      const blockData = this.getBlockData(currentBlock);
      if (SHA256(blockData + currentBlock.nonce).toString() !== currentBlock.hash) {
        return false;
      }
      
      // Check if previous hash reference is correct
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Start automatic block generation at specified interval
   */
  public startBlockGeneration(): void {
    if (this.blockInterval) {
      clearInterval(this.blockInterval);
    }
    
    this.blockInterval = setInterval(() => {
      if (this.pendingTransactions.length > 0) {
        this.generateBlock();
      }
    }, this.config.blockTime);
  }
  
  /**
   * Stop automatic block generation
   */
  public stopBlockGeneration(): void {
    if (this.blockInterval) {
      clearInterval(this.blockInterval);
      this.blockInterval = null;
    }
  }
  
  /**
   * Connect to wallet (simulate Web3 wallet connection)
   */
  public async connectWallet(): Promise<string | null> {
    if (typeof window === 'undefined' || !window.ethereum) {
      this.walletStatus = WalletConnectionStatus.ERROR;
      this.emit('error', { message: "Web3 provider not available" });
      this.notifyListeners('error', { message: "Web3 provider not available" });
      return null;
    }
    
    try {
      this.walletStatus = WalletConnectionStatus.CONNECTING;
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        this.walletAddress = accounts[0];
        this.walletStatus = WalletConnectionStatus.CONNECTED;
        
        // Check current chain
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        this.handleChainChanged(chainId);
        
        this.emit('walletConnected', { 
          address: this.walletAddress, 
          chainId,
          networkType: this.networkType
        });
        
        this.notifyListeners('walletConnected', { 
          address: this.walletAddress, 
          chainId,
          networkType: this.networkType
        });
        
        return this.walletAddress;
      }
      
      this.walletStatus = WalletConnectionStatus.ERROR;
      return null;
    } catch (error) {
      this.walletStatus = WalletConnectionStatus.ERROR;
      this.emit('error', error);
      this.notifyListeners('error', error);
      return null;
    }
  }
  
  /**
   * Disconnect from wallet
   */
  public disconnectWallet(): void {
    this.walletAddress = null;
    this.walletStatus = WalletConnectionStatus.DISCONNECTED;
    
    this.emit('walletDisconnected');
    this.notifyListeners('walletDisconnected', {});
  }
  
  /**
   * Get current wallet connection status
   */
  public getWalletStatus(): WalletConnectionStatus {
    return this.walletStatus;
  }
  
  /**
   * Get current wallet address
   */
  public getWalletAddress(): string | null {
    return this.walletAddress;
  }
  
  /**
   * Get current blockchain network type
   */
  public getNetworkType(): BlockchainNetworkType {
    return this.networkType;
  }
  
  /**
   * Switch to a different blockchain network
   */
  public async switchNetwork(networkType: BlockchainNetworkType): Promise<boolean> {
    if (typeof window === 'undefined' || !window.ethereum) {
      return false;
    }
    
    let targetChainId: string;
    
    switch (networkType) {
      case BlockchainNetworkType.MAINNET:
        targetChainId = `0x${this.config.chainId.toString(16)}`;
        break;
      case BlockchainNetworkType.TESTNET:
        targetChainId = "0x4ccff"; // 314159 in hex (Pi-based ID)
        break;
      case BlockchainNetworkType.GOLDEN:
        targetChainId = "0x2785b"; // 161803 in hex (Golden Ratio ID)
        break;
      default:
        return false;
    }
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainId }]
      });
      
      return true;
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain doesn't exist, add it
        try {
          const networkParams = this.getNetworkParams(networkType);
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkParams]
          });
          return true;
        } catch (addError) {
          this.emit('error', addError);
          this.notifyListeners('error', addError);
          return false;
        }
      }
      
      this.emit('error', error);
      this.notifyListeners('error', error);
      return false;
    }
  }
  
  /**
   * Get network parameters for adding to wallet
   */
  private getNetworkParams(networkType: BlockchainNetworkType): any {
    switch (networkType) {
      case BlockchainNetworkType.MAINNET:
        return {
          chainId: `0x${this.config.chainId.toString(16)}`,
          chainName: 'AetherCoin BioZoe Network',
          nativeCurrency: {
            name: 'AetherCoin',
            symbol: 'ATC',
            decimals: 18
          },
          rpcUrls: ['https://rpc.aethercoin.network'],
          blockExplorerUrls: ['https://explorer.aethercoin.network']
        };
        
      case BlockchainNetworkType.TESTNET:
        return {
          chainId: "0x4ccff", // 314159 in hex
          chainName: 'AetherCoin BioZoe Testnet',
          nativeCurrency: {
            name: 'Test AetherCoin',
            symbol: 'tATC',
            decimals: 18
          },
          rpcUrls: ['https://testnet-rpc.aethercoin.network'],
          blockExplorerUrls: ['https://testnet-explorer.aethercoin.network']
        };
        
      case BlockchainNetworkType.GOLDEN:
        return {
          chainId: "0x2785b", // 161803 in hex
          chainName: 'AetherCoin Golden Network',
          nativeCurrency: {
            name: 'AetherCoin',
            symbol: 'ATC',
            decimals: 18
          },
          rpcUrls: ['https://golden-rpc.aethercoin.network'],
          blockExplorerUrls: ['https://golden-explorer.aethercoin.network']
        };
        
      default:
        throw new Error("Invalid network type");
    }
  }
  
  /**
   * Get the entire blockchain
   */
  public getChain(): Block[] {
    return [...this.chain];
  }
  
  /**
   * Get current pending transactions
   */
  public getPendingTransactions(): Transaction[] {
    return [...this.pendingTransactions];
  }
  
  /**
   * Get transaction history for an address
   */
  public getAddressTransactions(address: string): Transaction[] {
    const transactions: Transaction[] = [];
    
    // Check all blocks for transactions involving this address
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.from === address || tx.to === address) {
          transactions.push(tx);
        }
      }
    }
    
    // Add any pending transactions too
    for (const tx of this.pendingTransactions) {
      if (tx.from === address || tx.to === address) {
        transactions.push(tx);
      }
    }
    
    return transactions;
  }
  
  /**
   * Get block by index
   */
  public getBlockByIndex(index: number): Block | null {
    return (index >= 0 && index < this.chain.length) ? this.chain[index] : null;
  }
  
  /**
   * Get block by hash
   */
  public getBlockByHash(hash: string): Block | null {
    return this.chain.find(block => block.hash === hash) || null;
  }
  
  /**
   * Get transaction by ID
   */
  public getTransactionById(id: string): Transaction | null {
    // Check pending transactions
    let transaction = this.pendingTransactions.find(tx => tx.id === id);
    if (transaction) return transaction;
    
    // Check all blocks
    for (const block of this.chain) {
      transaction = block.transactions.find(tx => tx.id === id);
      if (transaction) return transaction;
    }
    
    return null;
  }
  
  /**
   * Register event listener
   */
  public registerListener(eventName: string, listener: BlockchainEventListener): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    
    this.eventListeners.get(eventName)?.add(listener);
  }
  
  /**
   * Unregister event listener
   */
  public unregisterListener(eventName: string, listener: BlockchainEventListener): void {
    if (this.eventListeners.has(eventName)) {
      this.eventListeners.get(eventName)?.delete(listener);
    }
  }
  
  /**
   * Notify all listeners for an event
   */
  private notifyListeners(eventName: string, data: any): void {
    if (this.eventListeners.has(eventName)) {
      this.eventListeners.get(eventName)?.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in blockchain event listener for ${eventName}:`, error);
        }
      });
    }
  }
  
  /**
   * Update blockchain configuration
   */
  public updateConfig(newConfig: Partial<BlockchainConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // If block generation is running, restart it with new timing
    if (this.blockInterval) {
      this.stopBlockGeneration();
      this.startBlockGeneration();
    }
  }

  /**
   * Get complete blockchain state including chain and pending transactions
   */
  /**
   * Get current blockchain state
   * @returns Current blockchain state object
   */
  public getBlockchainState() {
    return {
      chain: this.getChain(),
      pendingTransactions: this.getPendingTransactions(),
      latestBlock: this.getLatestBlock(),
      blockHeight: this.getBlockHeight(),
      walletStatus: this.getWalletStatus(),
      networkType: this.getNetworkType(),
      currentDifficulty: this.config.difficulty,
      isValid: this.isChainValid(),
      difficulty: this.config.difficulty,
      miningReward: 5.0, // Default mining reward
      lastBlockTime: this.getLatestBlock().timestamp,
      nodes: [], // No peer nodes in this implementation
      isMining: this.blockInterval !== null,
      syncStatus: 'synchronized',
      consensusType: 'proof-of-work',
      networkHashrate: this.getEstimatedHashrate(),
      version: '1.0.0',
      genesisBlock: this.chain[0]
    };
  }
  
  /**
   * Estimate the network hashrate based on recent blocks
   * @returns Estimated hashrate in hashes per second
   */
  private getEstimatedHashrate(): number {
    if (this.chain.length < 2) {
      return 0;
    }
    
    // Use the last few blocks to estimate hashrate
    const numBlocks = Math.min(10, this.chain.length - 1);
    const recentBlocks = this.chain.slice(-numBlocks - 1);
    
    // Calculate average time between blocks
    let totalTime = 0;
    for (let i = 1; i < recentBlocks.length; i++) {
      totalTime += recentBlocks[i].timestamp - recentBlocks[i - 1].timestamp;
    }
    
    const avgTimeMs = totalTime / numBlocks;
    if (avgTimeMs <= 0) return 0;
    
    // Estimate hashrate based on difficulty
    const difficulty = this.config.difficulty;
    const hashesPerBlock = Math.pow(2, difficulty * 4); // Approximate hashes needed
    
    return Math.floor(hashesPerBlock / (avgTimeMs / 1000));
  }
  
  /**
   * Get all available wallets
   */
  public getAllWallets() {
    // In a full implementation, this would retrieve actual wallets
    // For now, return a mock wallet if connected
    const wallets = [];
    
    if (this.walletAddress) {
      wallets.push({
        address: this.walletAddress,
        balance: 1000, // Mock balance
        type: 'primary',
        label: 'Main Wallet'
      });
      
      // Add some mock additional wallets for demo purposes
      wallets.push({
        address: '0x' + SHA256('secondary-wallet').toString().substring(0, 40),
        balance: 250,
        type: 'secondary',
        label: 'Savings Wallet'
      });
    }
    
    return wallets;
  }
  
  /**
   * Initialize the blockchain service
   */
  public initialize() {
    // Reset to initial state
    this.chain = [];
    this.pendingTransactions = [];
    this.walletStatus = WalletConnectionStatus.DISCONNECTED;
    this.walletAddress = null;
    
    // Create genesis block
    this.initializeChain();
    
    // Set up Web3 listeners
    this.setupWeb3Listeners();
    
    // Start block generation
    this.startBlockGeneration();
    
    // Emit initialization event
    this.emit('initialized', {
      blockHeight: this.getBlockHeight(),
      genesisBlock: this.chain[0],
      timestamp: Date.now()
    });
    
    this.notifyListeners('initialized', {
      blockHeight: this.getBlockHeight(),
      genesisBlock: this.chain[0],
      timestamp: Date.now()
    });
    
    return true;
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();