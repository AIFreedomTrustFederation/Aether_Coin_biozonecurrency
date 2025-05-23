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

export interface PaymentMethod {
  id: number;
  userId: number;
  type: 'card' | 'bank_account';
  provider: 'stripe' | 'paypal';
  providerPaymentId: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  status: 'active' | 'expired' | 'invalid';
  createdAt: Date;
}

export interface Payment {
  id: number;
  userId: number;
  paymentMethodId?: number;
  walletId?: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  providerPaymentId?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  processedAt?: Date;
}

export interface WalletHealthScore {
  id: number;
  userId: number;
  walletId: number;
  createdAt: Date | null;
  overallScore: number; // 0-100
  securityScore: number; // 0-100
  diversificationScore: number; // 0-100
  activityScore: number; // 0-100
  gasOptimizationScore: number; // 0-100
  backgroundScanTimestamp: Date | null;
}

export interface WalletHealthIssue {
  id: number;
  healthScoreId: number;
  createdAt: Date | null;
  category: 'security' | 'diversification' | 'activity' | 'gasOptimization';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  resolved: boolean;
  resolvedAt: Date | null;
}
