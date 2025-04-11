// Transaction security types

// Base transaction interface
export interface Transaction {
  id: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  tokenSymbol: string;
  network: string;
  timestamp: Date;
  status: TransactionStatus;
  gas?: string;
  gasPrice?: string;
  nonce?: number;
  data?: string;
  metadata?: Record<string, any>;
}

// Transaction status enum
export type TransactionStatus = 
  | 'pending' 
  | 'processing'
  | 'verified'
  | 'completed'
  | 'failed'
  | 'reversed'
  | 'flagged'
  | 'held';

// Risk assessment for transactions
export interface RiskAssessment {
  transactionId: string;
  level: RiskLevel;
  score: number; // 0-100
  factors: RiskFactor[];
  timestamp: Date;
  recommendation: string;
}

// Risk level enum
export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

// Risk factor interface
export interface RiskFactor {
  id: string;
  type: RiskFactorType;
  description: string;
  impact: number; // 0-100
  mitigations?: string[];
}

// Risk factor types
export type RiskFactorType = 
  | 'amount'
  | 'address'
  | 'network'
  | 'timing'
  | 'frequency'
  | 'pattern'
  | 'gas'
  | 'contract'
  | 'phishing'
  | 'other';

// Phishing detection result
export interface PhishingDetectionResult {
  url: string;
  isPhishing: boolean;
  confidence: number; // 0-100
  reasons: string[];
  detectedAt: Date;
  reportUrl?: string;
}

// Security dashboard metrics
export interface SecurityMetrics {
  totalTransactions: number;
  flaggedTransactions: number;
  phishingAttempts: number;
  riskScore: number; // 0-100
  securityScore: number; // 0-100
  lastUpdated: Date;
}

// Security alert
export interface SecurityAlert {
  id: string;
  type: 'transaction' | 'phishing' | 'address' | 'network' | 'other';
  severity: RiskLevel;
  message: string;
  details: string;
  timestamp: Date;
  isRead: boolean;
  relatedTransactionId?: string;
  relatedUrl?: string;
}

// Wallet risk profile
export interface WalletRiskProfile {
  address: string;
  riskScore: number; // 0-100
  transactionVolume: number;
  averageTransactionSize: string;
  commonTokens: string[];
  commonInteractions: string[];
  lastActivity: Date;
}

// Security rule
export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  conditions: SecurityRuleCondition[];
  actions: SecurityRuleAction[];
  priority: number; // 1-100, 1 is highest
  createdAt: Date;
  updatedAt: Date;
}

// Security rule condition
export interface SecurityRuleCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
  valueTwo?: any; // For 'between' operator
}

// Security rule action
export interface SecurityRuleAction {
  type: 'flag' | 'block' | 'notify' | 'hold' | 'requireApproval';
  parameters?: Record<string, any>;
}

// Security context state
export interface SecurityContextState {
  alerts: SecurityAlert[];
  metrics: SecurityMetrics;
  rules: SecurityRule[];
  isMonitoring: boolean;
  securityLevel: 'standard' | 'high' | 'paranoid';
  unreadAlertCount: number;
}

// Transaction analysis result
export interface TransactionAnalysisResult {
  transaction: Transaction;
  riskAssessment: RiskAssessment;
  isHeld: boolean;
  holdingPeriod?: number; // in hours
  canBeReversed: boolean;
  recommendedAction: 'proceed' | 'review' | 'block';
}