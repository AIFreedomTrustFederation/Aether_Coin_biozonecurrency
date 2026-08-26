/**
 * LEGACY LOCAL BLOCKCHAIN SIMULATION
 *
 * This service predates the canonical Aetherion Biozoe protocol under
 * `protocol/`. It exists only to keep historical dashboard components usable
 * during migration. It is NOT the Aetherion Layer 1, does not provide real
 * consensus, does not sign production transactions, and must not be used as a
 * source of canonical ATC balances or mainnet status.
 */

import { EventEmitter } from 'events';
import SHA256 from 'crypto-js/sha256';
import {
  Block,
  Transaction,
  BlockchainConfig,
  WalletConnectionStatus,
  BlockchainNetworkType,
  BlockchainEventListener,
} from './types';

const DEFAULT_CONFIG: BlockchainConfig = {
  networkId: 0,
  chainId: 161803, // legacy simulation identifier only; canonical L1 id is aetherion-1
  difficulty: 2,
  blockTime: 10000,
  genesisTimestamp: Date.now(),
};

export class BlockchainService extends EventEmitter {
  public readonly implementationStatus = 'legacy-local-simulation' as const;
  public readonly canonicalLayer1 = false;

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

  private initializeChain(): void {
    this.chain = [this.createGenesisBlock()];
  }

  private createGenesisBlock(): Block {
    const genesisData = {
      message: 'LEGACY LOCAL SIMULATION — NOT AETHERION MAINNET GENESIS',
      canonicalChainId: 'aetherion-1',
      timestamp: this.config.genesisTimestamp,
    };

    return {
      index: 0,
      timestamp: this.config.genesisTimestamp,
      transactions: [],
      previousHash: '0',
      hash: SHA256(JSON.stringify(genesisData)).toString(),
      nonce: 0,
      difficulty: this.config.difficulty,
    };
  }

  private setupWeb3Listeners(): void {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on?.('accountsChanged', this.handleAccountsChanged.bind(this));
      window.ethereum.on?.('chainChanged', this.handleChainChanged.bind(this));
      window.ethereum.on?.('connect', this.handleConnect.bind(this));
      window.ethereum.on?.('disconnect', this.handleDisconnect.bind(this));
    }
  }

  private handleAccountsChanged(accounts?: string[]): void {
    this.walletAddress = accounts?.[0] ?? null;
    this.walletStatus = this.walletAddress
      ? WalletConnectionStatus.CONNECTED
      : WalletConnectionStatus.DISCONNECTED;
  }

  private handleChainChanged(chainId: string): void {
    this.emit('externalWalletChainChanged', {
      chainId,
      notice: 'External wallet chain change only; not canonical Aetherion state.',
    });
  }

  private handleConnect(): void {
    this.emit('externalWalletProviderConnected');
  }

  private handleDisconnect(): void {
    this.walletAddress = null;
    this.walletStatus = WalletConnectionStatus.DISCONNECTED;
  }

  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  public getBlockHeight(): number {
    return this.chain.length;
  }

  /**
   * Generate a local demonstration block. This has no Layer 1 finality.
   */
  public generateBlock(): Block {
    const latestBlock = this.getLatestBlock();
    const newBlock: Block = {
      index: latestBlock.index + 1,
      timestamp: Date.now(),
      transactions: [...this.pendingTransactions],
      previousHash: latestBlock.hash,
      hash: '',
      nonce: 0,
      difficulty: this.config.difficulty,
    };

    const minedBlock = this.mineBlock(newBlock);
    this.pendingTransactions = [];
    this.chain.push(minedBlock);
    this.emit('blockAdded', minedBlock);
    this.notifyListeners('blockAdded', minedBlock);
    return minedBlock;
  }

  /** Local educational proof-of-work only. */
  private mineBlock(block: Block): Block {
    const target = '0'.repeat(this.config.difficulty);
    const blockData = this.getBlockData(block);
    let nonce = 0;
    let hash = '';

    while (true) {
      nonce += 1;
      hash = SHA256(blockData + nonce).toString();
      if (hash.startsWith(target)) break;
    }

    block.nonce = nonce;
    block.hash = hash;
    return block;
  }

  private getBlockData(block: Block): string {
    return [
      block.index,
      block.timestamp,
      JSON.stringify(block.transactions),
      block.previousHash,
      block.difficulty,
    ].join(':');
  }

  /**
   * Create a LOCAL SIMULATION transaction.
   *
   * The signature field is intentionally prefixed `SIMULATION_ONLY:` so it
   * cannot reasonably be mistaken for wallet cryptographic authorization.
   */
  public createTransaction(from: string, to: string, amount: number, data?: any): Transaction {
    const timestamp = Date.now();
    const transaction: Transaction = {
      id: this.generateTransactionId(from, to, amount, timestamp),
      from,
      to,
      amount,
      timestamp,
      signature: this.simulationSignature(from, to, amount, timestamp),
      data: {
        ...(data ?? {}),
        implementationStatus: this.implementationStatus,
        canonical: false,
      },
    };

    this.pendingTransactions.push(transaction);
    this.emit('transactionCreated', transaction);
    this.notifyListeners('transactionCreated', transaction);
    return transaction;
  }

  private generateTransactionId(from: string, to: string, amount: number, timestamp: number): string {
    return `simulation:${SHA256(`${from}:${to}:${amount}:${timestamp}:${this.pendingTransactions.length}`).toString()}`;
  }

  private simulationSignature(from: string, to: string, amount: number, timestamp: number): string {
    const digest = SHA256(`${from}:${to}:${amount}:${this.config.chainId}:${timestamp}`).toString();
    return `SIMULATION_ONLY:${digest}`;
  }

  public isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i += 1) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      const blockData = this.getBlockData(currentBlock);
      if (SHA256(blockData + currentBlock.nonce).toString() !== currentBlock.hash) return false;
      if (currentBlock.previousHash !== previousBlock.hash) return false;
    }
    return true;
  }

  public startBlockGeneration(): void {
    if (this.blockInterval) clearInterval(this.blockInterval);
    this.blockInterval = setInterval(() => {
      if (this.pendingTransactions.length > 0) this.generateBlock();
    }, this.config.blockTime);
  }

  public stopBlockGeneration(): void {
    if (this.blockInterval) {
      clearInterval(this.blockInterval);
      this.blockInterval = null;
    }
  }

  /**
   * Connect only to the browser's external wallet ACCOUNT. This does not add,
   * switch, or validate an Aetherion network.
   */
  public async connectWallet(): Promise<string | null> {
    if (typeof window === 'undefined' || !window.ethereum) {
      this.walletStatus = WalletConnectionStatus.ERROR;
      const error = { message: 'Web3 provider not available' };
      this.emit('error', error);
      this.notifyListeners('error', error);
      return null;
    }

    try {
      this.walletStatus = WalletConnectionStatus.CONNECTING;
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts?.length) {
        this.walletStatus = WalletConnectionStatus.ERROR;
        return null;
      }

      this.walletAddress = accounts[0];
      this.walletStatus = WalletConnectionStatus.CONNECTED;
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      this.emit('walletConnected', {
        address: this.walletAddress,
        externalChainId: chainId,
        implementationStatus: this.implementationStatus,
        canonicalAetherionConnection: false,
      });
      this.notifyListeners('walletConnected', {
        address: this.walletAddress,
        externalChainId: chainId,
        implementationStatus: this.implementationStatus,
        canonicalAetherionConnection: false,
      });
      return this.walletAddress;
    } catch (error) {
      this.walletStatus = WalletConnectionStatus.ERROR;
      this.emit('error', error);
      this.notifyListeners('error', error);
      return null;
    }
  }

  public disconnectWallet(): void {
    this.walletAddress = null;
    this.walletStatus = WalletConnectionStatus.DISCONNECTED;
    this.emit('walletDisconnected');
    this.notifyListeners('walletDisconnected', {});
  }

  public getWalletStatus(): WalletConnectionStatus {
    return this.walletStatus;
  }

  public getWalletAddress(): string | null {
    return this.walletAddress;
  }

  public getNetworkType(): BlockchainNetworkType {
    return this.networkType;
  }

  /**
   * Legacy automatic network switching is intentionally disabled.
   * Use the evidence-aware wallet adapter/configuration once a real testnet
   * exists. Canonical Aetherion is not defined by these historical EVM enums.
   */
  public async switchNetwork(_networkType: BlockchainNetworkType): Promise<boolean> {
    const error = {
      message: 'Legacy EVM network switching is disabled. No live Aetherion network is configured by this service.',
      implementationStatus: this.implementationStatus,
    };
    this.emit('networkSwitchBlocked', error);
    this.notifyListeners('networkSwitchBlocked', error);
    return false;
  }

  public getChain(): Block[] {
    return [...this.chain];
  }

  public getPendingTransactions(): Transaction[] {
    return [...this.pendingTransactions];
  }

  public getAddressTransactions(address: string): Transaction[] {
    const transactions: Transaction[] = [];
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.from === address || tx.to === address) transactions.push(tx);
      }
    }
    for (const tx of this.pendingTransactions) {
      if (tx.from === address || tx.to === address) transactions.push(tx);
    }
    return transactions;
  }

  public getBlockByIndex(index: number): Block | null {
    return index >= 0 && index < this.chain.length ? this.chain[index] : null;
  }

  public getBlockByHash(hash: string): Block | null {
    return this.chain.find((block) => block.hash === hash) ?? null;
  }

  public getTransactionById(id: string): Transaction | null {
    const pending = this.pendingTransactions.find((tx) => tx.id === id);
    if (pending) return pending;
    for (const block of this.chain) {
      const transaction = block.transactions.find((tx) => tx.id === id);
      if (transaction) return transaction;
    }
    return null;
  }

  public registerListener(eventName: string, listener: BlockchainEventListener): void {
    if (!this.eventListeners.has(eventName)) this.eventListeners.set(eventName, new Set());
    this.eventListeners.get(eventName)?.add(listener);
  }

  public unregisterListener(eventName: string, listener: BlockchainEventListener): void {
    this.eventListeners.get(eventName)?.delete(listener);
  }

  private notifyListeners(eventName: string, data: any): void {
    this.eventListeners.get(eventName)?.forEach((listener) => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in legacy blockchain simulation listener for ${eventName}:`, error);
      }
    });
  }

  public updateConfig(newConfig: Partial<BlockchainConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.blockInterval) {
      this.stopBlockGeneration();
      this.startBlockGeneration();
    }
  }

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
      miningReward: 0,
      lastBlockTime: this.getLatestBlock().timestamp,
      nodes: [],
      isMining: this.blockInterval !== null,
      syncStatus: 'local-simulation',
      consensusType: 'legacy-local-proof-of-work-simulation',
      networkHashrate: this.getEstimatedHashrate(),
      version: 'legacy-simulation-2',
      genesisBlock: this.chain[0],
      implementationStatus: this.implementationStatus,
      canonicalLayer1: false,
      canonicalChainId: 'aetherion-1',
    };
  }

  private getEstimatedHashrate(): number {
    if (this.chain.length < 2) return 0;
    const numBlocks = Math.min(10, this.chain.length - 1);
    const recentBlocks = this.chain.slice(-numBlocks - 1);
    let totalTime = 0;
    for (let i = 1; i < recentBlocks.length; i += 1) {
      totalTime += recentBlocks[i].timestamp - recentBlocks[i - 1].timestamp;
    }
    const avgTimeMs = totalTime / numBlocks;
    if (avgTimeMs <= 0) return 0;
    const hashesPerBlock = Math.pow(2, this.config.difficulty * 4);
    return Math.floor(hashesPerBlock / (avgTimeMs / 1000));
  }

  /**
   * Do not fabricate balances. Until a canonical node API exists this legacy
   * service can identify the connected external wallet only.
   */
  public getAllWallets() {
    if (!this.walletAddress) return [];
    return [{
      address: this.walletAddress,
      balance: 0,
      type: 'external-account',
      label: 'Connected wallet — canonical ATC balance unavailable',
      canonicalBalanceKnown: false,
    }];
  }

  public initialize() {
    this.chain = [];
    this.pendingTransactions = [];
    this.walletStatus = WalletConnectionStatus.DISCONNECTED;
    this.walletAddress = null;
    this.initializeChain();
    this.setupWeb3Listeners();
    this.startBlockGeneration();

    const event = {
      blockHeight: this.getBlockHeight(),
      genesisBlock: this.chain[0],
      timestamp: Date.now(),
      implementationStatus: this.implementationStatus,
      canonicalLayer1: false,
    };
    this.emit('initialized', event);
    this.notifyListeners('initialized', event);
    return true;
  }

  /**
   * Historical compatibility hook. It does not apply a cryptographic security
   * upgrade and deliberately refuses to claim otherwise.
   */
  public enhanceSecurityLayer(algorithm: string) {
    const result = {
      applied: false,
      algorithm,
      notice: 'Legacy simulation cannot apply production security layers.',
    };
    this.emit('securityEnhancementNotApplied', result);
    return result;
  }

  public hashData(data: string): string {
    return SHA256(data).toString();
  }

  public exampleUsage() {
    const hash = SHA256('simulation-example').toString();
    console.log(hash);
  }
}

export const blockchainService = new BlockchainService();
