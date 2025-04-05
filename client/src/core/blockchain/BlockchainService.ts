/**
 * Blockchain Service for Aetherion
 * 
 * This service acts as a facade for the blockchain implementation,
 * providing a simplified interface for the UI and other components
 * to interact with the blockchain.
 */

import { EventEmitter } from 'events';
import { 
  Block, 
  Transaction, 
  BlockchainState, 
  MiningConfig,
  MiningAlgorithm,
  ConsensusType,
  MiningMetrics,
  AetherionWallet
} from './types';
import { Blockchain, blockchain } from './Blockchain';
import { CPUMiner } from './mining/CPUMiner';
import { GPUMiner } from './mining/GPUMiner';
import { 
  createWallet, 
  createWalletFromMnemonic, 
  createWalletFromPrivateKey,
  createKeystore,
  restoreFromKeystore,
  signTransaction
} from './crypto/wallet';

class BlockchainService extends EventEmitter {
  private blockchain: Blockchain;
  private wallets: Map<string, AetherionWallet> = new Map();
  private activeWalletAddress: string | null = null;
  private isTestnet: boolean = true;
  
  constructor() {
    super();
    this.setMaxListeners(50);
    this.blockchain = blockchain;
    
    // Forward blockchain events
    this.blockchain.on('blockAdded', (block) => this.emit('blockAdded', block));
    this.blockchain.on('blockMined', (block) => this.emit('blockMined', block));
    this.blockchain.on('transactionAdded', (tx) => this.emit('transactionAdded', tx));
    this.blockchain.on('miningStarted', (config) => this.emit('miningStarted', config));
    this.blockchain.on('miningStopped', () => this.emit('miningStopped'));
    this.blockchain.on('metricsUpdated', (metrics) => this.emit('metricsUpdated', metrics));
  }
  
  /**
   * Initialize the blockchain service
   */
  public initialize(): void {
    // Create a default wallet if none exists
    if (this.wallets.size === 0) {
      const { wallet, mnemonic } = createWallet();
      this.wallets.set(wallet.address, wallet);
      this.activeWalletAddress = wallet.address;
      
      // Store mnemonic for demo purposes (would be securely handled in production)
      wallet.metadata = {
        mnemonic
      };
    }
  }
  
  /**
   * Get the current blockchain state
   * @returns Current blockchain state
   */
  public getBlockchainState(): BlockchainState {
    return this.blockchain.getBlockchainState();
  }
  
  /**
   * Start mining with the active wallet
   * @param config Mining configuration
   */
  public startMining(config?: Partial<MiningConfig>): void {
    if (!this.activeWalletAddress) {
      throw new Error('No active wallet selected');
    }
    
    // Update mining config if provided
    if (config) {
      this.blockchain.updateMiningConfig(config);
    }
    
    // Start mining using the active wallet
    this.blockchain.startMining(this.activeWalletAddress);
  }
  
  /**
   * Stop mining
   */
  public stopMining(): void {
    this.blockchain.stopMining();
  }
  
  /**
   * Create a new wallet
   * @returns New wallet and mnemonic
   */
  public createNewWallet(): { wallet: AetherionWallet; mnemonic: string } {
    const { wallet, mnemonic } = createWallet();
    this.wallets.set(wallet.address, wallet);
    
    // Store mnemonic for demo purposes (would be securely handled in production)
    wallet.metadata = {
      mnemonic
    };
    
    return { wallet, mnemonic };
  }
  
  /**
   * Import a wallet from a mnemonic phrase
   * @param mnemonic Mnemonic phrase
   * @returns Imported wallet
   */
  public importWalletFromMnemonic(mnemonic: string): AetherionWallet {
    const wallet = createWalletFromMnemonic(mnemonic);
    this.wallets.set(wallet.address, wallet);
    
    // Store mnemonic for demo purposes (would be securely handled in production)
    wallet.metadata = {
      mnemonic
    };
    
    return wallet;
  }
  
  /**
   * Import a wallet from a private key
   * @param privateKey Private key
   * @returns Imported wallet
   */
  public importWalletFromPrivateKey(privateKey: string): AetherionWallet {
    const wallet = createWalletFromPrivateKey(privateKey);
    this.wallets.set(wallet.address, wallet);
    return wallet;
  }
  
  /**
   * Get all wallets
   * @returns Array of wallets
   */
  public getAllWallets(): AetherionWallet[] {
    return Array.from(this.wallets.values());
  }
  
  /**
   * Set the active wallet
   * @param address Wallet address
   */
  public setActiveWallet(address: string): void {
    if (!this.wallets.has(address)) {
      throw new Error(`Wallet with address ${address} not found`);
    }
    
    this.activeWalletAddress = address;
    this.emit('activeWalletChanged', this.wallets.get(address));
  }
  
  /**
   * Get the active wallet
   * @returns Active wallet or null if none selected
   */
  public getActiveWallet(): AetherionWallet | null {
    if (!this.activeWalletAddress) return null;
    return this.wallets.get(this.activeWalletAddress) || null;
  }
  
  /**
   * Create and sign a transaction
   * @param toAddress Recipient address
   * @param amount Amount to send
   * @param fee Transaction fee
   * @param data Optional data to include
   * @returns Transaction ID
   */
  public createTransaction(
    toAddress: string,
    amount: number,
    fee: number = 0.0001,
    data?: string
  ): string {
    const activeWallet = this.getActiveWallet();
    if (!activeWallet) {
      throw new Error('No active wallet selected');
    }
    
    if (!activeWallet.privateKey) {
      throw new Error('Private key not available for the active wallet');
    }
    
    // Check balance
    const balance = this.blockchain.getBalanceForAddress(activeWallet.address);
    if (balance < amount + fee) {
      throw new Error('Insufficient balance');
    }
    
    // Create transaction
    const transaction: Omit<Transaction, 'id' | 'signature' | 'timestamp'> = {
      fromAddress: activeWallet.address,
      toAddress,
      amount,
      fee,
      data,
      status: 'pending',
      confirmations: 0
    };
    
    // Add timestamp
    const txWithTimestamp = {
      ...transaction,
      timestamp: Date.now()
    };
    
    // Sign the transaction
    const signedTx = signTransaction(txWithTimestamp, activeWallet.privateKey);
    
    // Add to blockchain
    const txId = this.blockchain.addTransaction(signedTx);
    
    return txId;
  }
  
  /**
   * Get transaction by ID
   * @param id Transaction ID
   * @returns Transaction or undefined if not found
   */
  public getTransaction(id: string): Transaction | undefined {
    return this.blockchain.getTransactionById(id);
  }
  
  /**
   * Get transactions for the active wallet
   * @returns Array of transactions
   */
  public getTransactionsForActiveWallet(): Transaction[] {
    const activeWallet = this.getActiveWallet();
    if (!activeWallet) {
      throw new Error('No active wallet selected');
    }
    
    return this.blockchain.getTransactionsForAddress(activeWallet.address);
  }
  
  /**
   * Get balance for the active wallet
   * @returns Balance
   */
  public getBalanceForActiveWallet(): number {
    const activeWallet = this.getActiveWallet();
    if (!activeWallet) {
      throw new Error('No active wallet selected');
    }
    
    return this.blockchain.getBalanceForAddress(activeWallet.address);
  }
  
  /**
   * Export the active wallet to a keystore file
   * @param password Password to encrypt with
   * @returns Keystore JSON string
   */
  public exportWalletToKeystore(password: string): string {
    const activeWallet = this.getActiveWallet();
    if (!activeWallet) {
      throw new Error('No active wallet selected');
    }
    
    if (!activeWallet.privateKey) {
      throw new Error('Private key not available for the active wallet');
    }
    
    return createKeystore(activeWallet, password);
  }
  
  /**
   * Import a wallet from a keystore file
   * @param keystoreJson Keystore JSON string
   * @param password Password to decrypt with
   * @returns Imported wallet
   */
  public importWalletFromKeystore(keystoreJson: string, password: string): AetherionWallet {
    const wallet = restoreFromKeystore(keystoreJson, password);
    this.wallets.set(wallet.address, wallet);
    return wallet;
  }
  
  /**
   * Get information about available GPU devices
   * @returns Array of GPU devices
   */
  public async getAvailableGPUDevices(): Promise<{id: number, name: string}[]> {
    return GPUMiner.getGPUDevices();
  }
  
  /**
   * Check if GPU mining is supported
   * @returns True if supported
   */
  public isGPUMiningSupported(): boolean {
    return GPUMiner.isSupported();
  }
  
  /**
   * Get recommended CPU thread count
   * @returns Recommended thread count
   */
  public getRecommendedThreadCount(): number {
    return Math.max(1, CPUMiner.getThreadCount() - 1);
  }
  
  /**
   * Determine if the service is running on testnet
   * @returns True if testnet
   */
  public isTestNetwork(): boolean {
    return this.isTestnet;
  }
  
  /**
   * Get mining algorithms information
   * @returns Array of algorithms with details
   */
  public getMiningAlgorithms(): {id: MiningAlgorithm, name: string, description: string}[] {
    return [
      {
        id: MiningAlgorithm.SHA256,
        name: 'SHA-256',
        description: 'Bitcoin\'s algorithm, secure but energy-intensive'
      },
      {
        id: MiningAlgorithm.ETHASH,
        name: 'Ethash',
        description: 'Ethereum\'s algorithm, ASIC-resistant'
      },
      {
        id: MiningAlgorithm.SCRYPT,
        name: 'Scrypt',
        description: 'Memory-hard function used by Litecoin'
      },
      {
        id: MiningAlgorithm.RANDOMX,
        name: 'RandomX',
        description: 'CPU-optimized algorithm used by Monero'
      },
      {
        id: MiningAlgorithm.CRYPTONIGHT,
        name: 'CryptoNight',
        description: 'Originally used by Monero, CPU-friendly'
      },
      {
        id: MiningAlgorithm.QUANTUM,
        name: 'Quantum',
        description: 'Aetherion\'s quantum-resistant algorithm'
      }
    ];
  }
  
  /**
   * Get consensus mechanisms information
   * @returns Array of consensus mechanisms with details
   */
  public getConsensusMechanisms(): {id: ConsensusType, name: string, description: string}[] {
    return [
      {
        id: ConsensusType.PROOF_OF_WORK,
        name: 'Proof of Work',
        description: 'Miners compete to solve mathematical puzzles'
      },
      {
        id: ConsensusType.PROOF_OF_STAKE,
        name: 'Proof of Stake',
        description: 'Validators stake coins to create blocks'
      },
      {
        id: ConsensusType.DELEGATED_PROOF_OF_STAKE,
        name: 'Delegated Proof of Stake',
        description: 'Stakeholders elect delegates to validate blocks'
      },
      {
        id: ConsensusType.QUANTUM_PROOF_OF_WORK,
        name: 'Quantum Proof of Work',
        description: 'Quantum-resistant PoW algorithm'
      },
      {
        id: ConsensusType.PRACTICAL_BYZANTINE_FAULT_TOLERANCE,
        name: 'PBFT',
        description: 'Byzantine fault tolerance for permissioned networks'
      }
    ];
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();