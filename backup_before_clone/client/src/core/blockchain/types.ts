/**
 * Blockchain Types
 * 
 * Defines types for the blockchain integration
 */

/**
 * Block type for AetherCoin blockchain
 */
export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  difficulty: number;
  // Additional properties used in BlockchainExplorer
  merkleRoot?: string;
  minerAddress?: string;
  miningMethod?: string;
  miningTime?: number;
  hashrate?: number;
}

/**
 * Transaction type for blockchain
 */
export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  signature: string;
  data?: any;
  // Additional fields used in the BlockchainExplorer
  fromAddress?: string;
  toAddress?: string;
  fee?: number;
  status?: 'pending' | 'confirmed' | 'failed';
}

/**
 * Blockchain configuration
 */
export interface BlockchainConfig {
  networkId: number;
  chainId: number;
  difficulty: number;
  blockTime: number;
  genesisTimestamp: number;
}

/**
 * Wallet connection status
 */
export enum WalletConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

/**
 * Blockchain network type
 */
export enum BlockchainNetworkType {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  GOLDEN = 'golden',
  CUSTOM = 'custom'
}

/**
 * Mining algorithm types for Aetherion blockchain
 */
export enum MiningAlgorithm {
  MANDELBROT_FIBONACCI = 'mandelbrot-fibonacci',
  QUANTUM_RESISTANT_PROOF_OF_WORK = 'quantum-resistant-pow',
  RECURVE_FRACTAL = 'recurve-fractal',
  TOROIDAL_WAVE = 'toroidal-wave',
  BIOZOE_CONSENSUS = 'biozoe-consensus'
}

/**
 * Consensus types for Aetherion blockchain
 */
export enum ConsensusType {
  PROOF_OF_WORK = 'proof-of-work',
  PROOF_OF_STAKE = 'proof-of-stake',
  PROOF_OF_AUTHORITY = 'proof-of-authority',
  QUANTUM_PROOF_OF_SIGNATURE = 'quantum-proof-of-signature',
  RECURSIVE_CONSENSUS = 'recursive-consensus',
  MANDELBROT_CONSENSUS = 'mandelbrot-consensus',
  BIOZOE_CONSENSUS = 'biozoe-consensus'
}

/**
 * Blockchain listener type
 */
export type BlockchainEventListener = (data: any) => void;

/**
 * Mining configuration interface
 */
export interface MiningConfig {
  enabled: boolean;
  threads: number;
  gpuMining: boolean;
  gpuDevices: number[];
  algorithm: MiningAlgorithm;
  miningAddress: string;
  autoAdjustDifficulty: boolean;
  targetBlockTime: number;
  minimumTransactionFee: number;
  maxTransactionsPerBlock: number;
}

/**
 * Sync status interface
 */
export interface SyncStatus {
  isSyncing: boolean;
  currentBlock: number;
  highestBlock: number;
  startingBlock: number;
}

/**
 * Blockchain state interface
 */
export interface BlockchainState {
  chain: Block[];
  pendingTransactions: Transaction[];
  latestBlock?: Block;
  blockHeight?: number;
  walletStatus?: WalletConnectionStatus;
  networkType?: BlockchainNetworkType;
  currentDifficulty?: number;
  isValid?: boolean;
  difficulty?: number;
  miningReward?: number;
  lastBlockTime?: number;
  nodes?: string[];
  isMining?: boolean;
  syncStatus?: SyncStatus;
  consensusType?: ConsensusType;
  networkHashrate?: number;
  version?: string;
  genesisBlock?: Block;
}