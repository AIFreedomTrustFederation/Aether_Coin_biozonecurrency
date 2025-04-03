/**
 * Type definitions for the AI Assistant module
 */

// AI Assistant component props
export interface AIAssistantProps {
  userId: number;
  className?: string;
}

// AI configuration options
export interface AIConfig {
  enabled: boolean;
  transactionMonitoring: boolean;
  securityScanning: boolean;
  credentialManagement: boolean;
  holdPeriodHours: number;
  autoVerification: boolean;
  notificationLevel: 'all' | 'important' | 'critical';
  voiceEnabled: boolean;
  personalization: {
    name: string;
    appearance: 'default' | 'minimal' | 'professional';
    responseLength: 'concise' | 'balanced' | 'detailed';
  };
}

// Security issue in a scan
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

// Security scan result
export interface SecurityScan {
  id: number;
  timestamp: Date;
  type: string;
  status: 'in_progress' | 'completed' | 'failed';
  focus: string;
  durationMs: number;
  issues: SecurityIssue[];
}

// Transaction data
export interface Transaction {
  id: number;
  timestamp: Date;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'approve';
  status: 'pending' | 'confirmed' | 'failed' | 'held';
  fromAddress: string;
  toAddress: string;
  amount: string;
  tokenSymbol: string;
  fee?: string;
  txHash: string;
  blockNumber?: number;
  holdUntil?: Date;
  holdReason?: string;
  aiVerified?: boolean;
  riskScore?: number;
  riskFactors?: string[];
}

// Credential data
export interface SecureCredential {
  id: string;
  type: 'password' | 'private_key' | 'seed_phrase' | 'api_key' | 'two_factor';
  name: string;
  service?: string;
  createdAt: Date;
  lastUsed?: Date;
  encryptedData: string;
  tags?: string[];
}

// Chat message
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    relatedEntityId?: number;
    relatedEntityType?: string;
    action?: string;
    suggestions?: string[];
    [key: string]: any;
  };
}

// AI Assistant state
export interface AIState {
  initialized: boolean;
  config: AIConfig;
  messages: ChatMessage[];
  pendingTransactions: Transaction[];
  securityScans: SecurityScan[];
  credentials: SecureCredential[];
  lastScanTimestamp?: Date;
  error?: string;
  isProcessing: boolean;
}

// AI Action for reducer
export type AIAction =
  | { type: 'INITIALIZE_AI'; payload: AIConfig }
  | { type: 'TOGGLE_AI'; payload: boolean }
  | { type: 'UPDATE_CONFIG'; payload: Partial<AIConfig> }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'ADD_PENDING_TRANSACTION'; payload: Transaction }
  | { type: 'REMOVE_PENDING_TRANSACTION'; payload: number }
  | { type: 'ADD_SECURITY_SCAN'; payload: SecurityScan }
  | { type: 'RESOLVE_SECURITY_ISSUE'; payload: { scanId: number; issueId: number } }
  | { type: 'ADD_CREDENTIAL'; payload: SecureCredential }
  | { type: 'REMOVE_CREDENTIAL'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_PROCESSING'; payload: boolean };

// Context value type
export interface AIContextType {
  state: AIState;
  toggleAI: (enabled: boolean) => void;
  updateConfig: (config: Partial<AIConfig>) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  addPendingTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  removePendingTransaction: (id: number) => void;
  addSecurityScan: (scan: Omit<SecurityScan, 'id'>) => void;
  resolveSecurityIssue: (scanId: number, issueId: number) => void;
  addCredential: (credential: Omit<SecureCredential, 'id'>) => void;
  removeCredential: (id: string) => void;
}

// AI Provider props
export interface AIProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<AIConfig>;
}

// Chat Interface component props
export interface ChatInterfaceProps {
  className?: string;
  autoFocus?: boolean;
  inputPlaceholder?: string;
}

// SecurityHistory component props
export interface SecurityHistoryProps {
  className?: string;
}

// TransactionHold component props
export interface TransactionHoldProps {
  className?: string;
  transaction?: Transaction;
}

// AISettings component props
export interface AISettingsProps {
  className?: string;
  onClose?: () => void;
}

// ProgressCircle component props
export interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  className?: string;
}