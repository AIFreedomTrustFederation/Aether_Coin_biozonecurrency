/**
 * Types for the AI Assistant module
 */

// ProgressCircle Component
export interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  className?: string;
}

// Transaction Hold Component
export interface TransactionHoldProps {
  transaction: Transaction;
  className?: string;
  title?: string;
}

// Security Enums and Types
export enum SecurityCategory {
  PHISHING = 'phishing',
  UNUSUAL_ACTIVITY = 'unusual_activity',
  SMART_CONTRACT = 'smart_contract',
  GAS_OPTIMIZATION = 'gas_optimization',
  PRIVACY = 'privacy',
  NETWORK = 'network'
}

export interface Transaction {
  id: number;
  timestamp: Date;
  type: string;
  status: string;
  walletId: number;
  amount: string;
  tokenSymbol: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  fee?: string;
  blockNumber?: number;
  network?: string;
  aiVerified?: boolean;
  riskScore?: number;
  holdReason?: string;
  holdUntil?: Date;
}

export interface SecurityIssue {
  id: number;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  recommendation: string;
  detectedAt: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface SecurityScan {
  id: number;
  timestamp: Date;
  type: string;
  status: string;
  focus: string;
  durationMs: number;
  issues: SecurityIssue[];
}

// Credential Management
export enum CredentialType {
  API_KEY = 'api_key',
  PASSWORD = 'password',
  PRIVATE_KEY = 'private_key',
  MNEMONIC = 'mnemonic',
  SESSION_TOKEN = 'session_token',
  OAUTH_TOKEN = 'oauth_token'
}

export interface SecureCredential {
  id: number;
  userId: number;
  createdAt: Date;
  updatedAt?: Date;
  name: string;
  type: CredentialType;
  expiresAt?: Date | null;
  lastAccessed?: Date | null;
  isEncrypted: boolean;
  data: string;
  service?: string;
  accessCount: number;
}

// Chat Interface
export interface ChatMessage {
  id: string;
  senderId: string | number;
  senderType: 'user' | 'ai' | 'system';
  timestamp: Date;
  content: string;
  contentType: 'text' | 'transaction' | 'security_report' | 'warning';
  metadata?: {
    transactionId?: number;
    securityScanId?: number;
    [key: string]: any;
  };
  status?: 'sending' | 'sent' | 'delivered' | 'error';
}

// AI Context
export interface AIContextState {
  isInitialized: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  transactionHistory: Transaction[];
  securityScans: SecurityScan[];
  credentials: SecureCredential[];
  activeView: 'chat' | 'settings' | 'security' | 'transactions';
  error: string | null;
}

export type AIAction =
  | { type: 'INITIALIZE'; payload: Partial<AIContextState> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: number; updates: Partial<Transaction> } }
  | { type: 'ADD_SECURITY_SCAN'; payload: SecurityScan }
  | { type: 'ADD_CREDENTIAL'; payload: SecureCredential }
  | { type: 'REMOVE_CREDENTIAL'; payload: number }
  | { type: 'SET_ACTIVE_VIEW'; payload: AIContextState['activeView'] }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_HISTORY' };

export interface AIConfig {
  autoVerifyTransactions: boolean;
  transactionHoldThreshold: number;
  scanFrequency: 'high' | 'medium' | 'low';
  alertLevel: 'all' | 'critical_only' | 'none';
  privacyLevel: 'high' | 'medium' | 'low';
}

export interface AIProviderProps {
  userId: number;
  initialState?: Partial<AIContextState>;
  config?: Partial<AIConfig>;
  children: React.ReactNode;
}

export interface AIContextType {
  state: AIContextState;
  dispatch: React.Dispatch<AIAction>;
  config: AIConfig;
  verifyTransaction: (tx: Transaction) => Promise<SecurityScan>;
  holdTransaction: (tx: Transaction, reason: string, hours: number) => Promise<Transaction>;
  releaseTransaction: (id: number) => Promise<Transaction>;
  cancelTransaction: (id: number) => Promise<boolean>;
  secureCredential: (credential: SecureCredential) => Promise<SecureCredential>;
  getCredential: (id: number) => Promise<SecureCredential | null>;
  removeCredential: (id: number) => Promise<boolean>;
  sendMessage: (content: string) => Promise<void>;
}