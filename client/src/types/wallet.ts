export interface WalletBalance {
  id: number;
  chain: string;
  name: string;
  address: string;
  balance: string;
  type: string;
  symbol: string;
  dollarValue: number;
  percentChange: number;
}

export interface Transaction {
  id: number;
  walletId: number;
  txHash: string;
  type: 'send' | 'receive' | 'contract_interaction';
  amount: string;
  tokenSymbol: string;
  fromAddress?: string;
  toAddress?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  fee?: string;
  blockNumber?: number;
  aiVerified: boolean;
}

export interface SmartContract {
  id: number;
  userId: number;
  name: string;
  address: string;
  chain: string;
  status: 'active' | 'pending' | 'inactive';
  lastInteraction?: Date;
  createdAt: Date;
}

export interface AiMonitoringLog {
  id: number;
  userId: number;
  action: 'threat_detected' | 'transaction_verified' | 'gas_optimization';
  description: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

export interface CidEntry {
  id: number;
  userId: number;
  cid: string;
  type: 'wallet_backup' | 'smart_contract' | 'transaction_log';
  status: 'active' | 'syncing' | 'inactive';
  createdAt: Date;
}

export interface FractalNode {
  id: string;
  name: string;
  path: string;
  x: number;
  y: number;
  connections: string[];
}
