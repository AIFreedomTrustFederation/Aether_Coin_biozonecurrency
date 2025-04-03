/**
 * AI Assistant Types
 */

// Configuration for the AI Assistant
export interface AIConfig {
  enableVoice: boolean;
  language: string;
  aiResponseStyle: 'concise' | 'detailed';
  notificationLevel: 'all' | 'important' | 'minimal';
  maxAlertThreshold: number;
  enablePhishingDetection: boolean;
  autoVerifyTransactions: boolean;
}

// Chat message structure
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Transaction structure
export interface Transaction {
  id: number;
  type: 'send' | 'receive' | 'swap' | 'stake';
  status: 'pending' | 'confirmed' | 'failed' | 'held';
  timestamp: Date;
  walletId: number;
  amount: string;
  tokenSymbol: string;
  txHash: string;
  fromAddress: string;
  toAddress: string;
  fee?: string;
  blockNumber?: number;
  aiVerified?: boolean;
  riskReason?: string;
  escrowEndsAt?: Date;
}

// Security issue structure
export interface SecurityIssue {
  id: number;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  recommendation: string;
  resolved: boolean;
  resolvedAt?: Date;
  detectedAt: Date;
}

// Security scan structure
export interface SecurityScan {
  id: number;
  timestamp: Date;
  walletId: number;
  overallScore: number;
  securityScore: number;
  diversificationScore: number;
  activityScore: number;
  gasOptimizationScore: number;
  issues: SecurityIssue[];
}

// Credential storage
export interface SecureCredential {
  id: string;
  name: string;
  type: 'password' | 'apiKey' | 'privateKey' | 'mnemonic' | 'other';
  createdAt: Date;
  lastAccessed?: Date;
  service?: string;
  tags?: string[];
  isEncrypted: boolean;
}

// AI Assistant State
export interface AIState {
  config: AIConfig;
  chatHistory: ChatMessage[];
  pendingTransactions: Transaction[];
  securityScans: SecurityScan[];
  storedCredentials: string[];
  isAssistantActive: boolean;
  currentView: 'chat' | 'security' | 'transactions' | 'credentials' | 'settings';
}

// Actions for the reducer
export type AIAction =
  | { type: 'UPDATE_CONFIG'; payload: Partial<AIConfig> }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'ADD_PENDING_TRANSACTION'; payload: Transaction }
  | { type: 'REMOVE_PENDING_TRANSACTION'; payload: number }
  | { type: 'ADD_SECURITY_SCAN'; payload: SecurityScan }
  | { type: 'RESOLVE_SECURITY_ISSUE'; payload: { scanId: number; issueId: number } }
  | { type: 'SET_ACTIVE'; payload: boolean }
  | { type: 'SET_VIEW'; payload: AIState['currentView'] }
  | { type: 'ADD_CREDENTIAL'; payload: string }
  | { type: 'REMOVE_CREDENTIAL'; payload: string };

// Component Props
export interface AIAssistantProps {
  userId: number;
  className?: string;
}

export interface ChatInterfaceProps {
  className?: string;
  onSendMessage?: (message: string) => void;
  inputPlaceholder?: string;
  showTimestamps?: boolean;
  autoFocus?: boolean;
}

export interface SecurityHistoryProps {
  className?: string;
}

export interface TransactionHoldProps {
  className?: string;
}

export interface AISettingsProps {
  className?: string;
}

export interface CredentialManagerProps {
  className?: string;
}