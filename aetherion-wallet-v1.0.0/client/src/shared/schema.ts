/**
 * Aetherion Wallet Shared Schema
 * 
 * This file provides types and schemas used throughout the application.
 * It resolves the @shared/schema dependency in the bridge component.
 */

// Bridge Enums
export enum BridgeStatus {
  READY = "READY",
  CONNECTING = "CONNECTING",
  DISCONNECTED = "DISCONNECTED",
  ERROR = "ERROR",
  MAINTENANCE = "MAINTENANCE"
}

export enum BridgeTransactionStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELED = "CANCELED"
}

export enum BridgeNetwork {
  ETHEREUM = "ETHEREUM",
  POLYGON = "POLYGON",
  BSC = "BSC",
  ARBITRUM = "ARBITRUM",
  OPTIMISM = "OPTIMISM",
  AVALANCHE = "AVALANCHE",
  SOLANA = "SOLANA",
  AETHERION = "AETHERION",
  FRACTALCHAIN = "FRACTALCHAIN"
}

// Basic Types
export type Transaction = {
  id: string;
  date: string;
  amount: number;
  currency: string;
  type: 'send' | 'receive' | 'exchange' | 'stake';
  status: 'completed' | 'pending' | 'failed';
  from?: string;
  to?: string;
  note?: string;
  hash?: string;
};

export type Wallet = {
  id: string;
  address: string;
  name: string;
  balance: number;
  currency: string;
  icon?: string;
  network?: string;
  transactions?: Transaction[];
};

export type User = {
  id: number;
  username: string;
  email?: string;
  wallets?: Wallet[];
  transactions?: Transaction[];
  createdAt?: string;
  updatedAt?: string;
  role?: 'user' | 'admin' | 'validator';
  securityLevel?: 'standard' | 'enhanced' | 'quantum';
};

// Database and API Types
export type InsertUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertWallet = Omit<Wallet, 'id' | 'transactions'>;
export type InsertTransaction = Omit<Transaction, 'id' | 'date'>;

// Bridge Types
export type BridgeTransaction = Transaction & {
  sourceChain: string;
  destinationChain: string;
  bridgeProvider: string;
  bridgeFee?: number;
  estimatedCompletionTime?: string;
};

export type BridgeConfig = {
  enabled: boolean;
  providers: string[];
  supportedChains: string[];
  feeStructure: Record<string, number>;
};

export function getTransactionById(id: string): Transaction | undefined {
  // This would normally fetch from the database
  // For now, just a mock implementation
  console.log(`Getting transaction ${id}`);
  return undefined;
}

export function formatAddress(address: string): string {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}