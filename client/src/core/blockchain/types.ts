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
 * Blockchain listener type
 */
export type BlockchainEventListener = (data: any) => void;

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
  syncStatus?: string;
  consensusType?: string;
  networkHashrate?: number;
  version?: string;
  genesisBlock?: Block;
}