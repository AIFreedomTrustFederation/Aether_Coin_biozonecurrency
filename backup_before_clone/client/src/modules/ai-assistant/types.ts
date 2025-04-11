// AI Assistant Types

// Credential handling
export type CredentialType = 'api_key' | 'private_key' | 'password' | 'seed' | 'other';

export interface SecureCredential {
  id: string;
  type: CredentialType;
  name: string;
  createdAt: string;
  lastUsed: string | null;
  label?: string | null;
  isEncrypted: boolean;
  data?: string; // The actual sensitive data (only included when needed)
}

// Transaction Types
export interface Transaction {
  id: number;
  txHash: string;
  type: string;
  status: string;
  amount: string;
  tokenSymbol: string;
  fromAddress: string;
  toAddress: string;
  fee?: string;
  blockNumber?: number;
  timestamp: Date;
  holdUntil?: Date;
  holdReason?: string;
  walletId: number;
  aiVerified?: boolean;
}

// Security Scan Types
export enum SecurityCategory {
  PHISHING = 'phishing',
  CONTRACT_SECURITY = 'contract_security',
  UNUSUAL_ACTIVITY = 'unusual_activity',
  GAS_OPTIMIZATION = 'gas_optimization',
  SYSTEM = 'system',
  PERMISSIONS = 'permissions'
}

export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface SecurityIssue {
  id: string;
  title: string;
  description: string;
  severity: SecuritySeverity;
  category: SecurityCategory;
  recommendation: string;
  resolved: boolean;
}

export interface SecurityScan {
  id: string;
  timestamp: Date;
  type: string;
  status: 'pending' | 'complete' | 'error';
  focus: string; // Transaction hash, address, etc.
  issues: SecurityIssue[];
  durationMs: number;
}

// Chat Interface Types
export type MessageSender = 'user' | 'ai' | 'system';
export type MessageType = 'text' | 'security_alert' | 'notification' | 'transaction';

export interface ChatMessage {
  id: string;
  content: string;
  sender: MessageSender;
  timestamp: Date;
  type?: MessageType;
  isLoading?: boolean;
  metadata?: Record<string, any>;
}

// Component Props
export interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isProcessing?: boolean;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export interface TransactionHoldProps {
  transaction: Transaction;
  className?: string;
  title?: string;
}

// Formatter utils
export interface FormatAddressOptions {
  startChars?: number;
  endChars?: number;
  separator?: string;
}

export interface FormatDateOptions {
  includeTime?: boolean;
  includeSeconds?: boolean;
  format?: string;
}

export interface FormatTokenAmountOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  includeCurrency?: boolean;
}