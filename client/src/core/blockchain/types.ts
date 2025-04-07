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