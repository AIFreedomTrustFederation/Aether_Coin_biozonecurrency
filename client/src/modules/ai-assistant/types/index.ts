// Common types

// Provider props
export interface AIProviderProps {
  children: React.ReactNode;
  userId?: number;
  initialState?: Partial<AIState>;
}

export interface AIAssistantProps {
  userId: number;
  className?: string;
}

// AI State
export interface AIState {
  isEnabled: boolean;
  isProcessing: boolean;
  messages: ChatMessage[];
  securityScans: SecurityScan[];
  credentials: Credential[];
  heldTransactions: Transaction[];
  config: AIConfig;
}

// AI Config
export interface AIConfig {
  automaticScanning: boolean;
  transactionVerification: boolean;
  maxStoredMessages: number;
  matrixNotifications: boolean;
  notificationThreshold: SecurityThreshold;
}

// Chat Messages
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  type?: string;
  isLoading?: boolean;
  actionData?: any;
}

// Security Categories
export type SecurityCategory = 
  | 'phishing'
  | 'smart_contract'
  | 'transaction'
  | 'gas_optimization'
  | 'privacy'
  | 'general';

export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type SecurityThreshold = 'high' | 'medium' | 'low' | 'info';

export interface SecurityIssue {
  id: string;
  title: string;
  description: string;
  category: SecurityCategory | string;
  severity: SecuritySeverity;
  recommendation?: string;
  resolved: boolean;
}

export interface SecurityScan {
  id: string;
  timestamp: Date;
  type: string;
  status: 'pending' | 'complete' | 'error' | 'skipped';
  focus: string;
  durationMs: number;
  issues: SecurityIssue[];
}

// Transactions
export interface Transaction {
  id?: string | number;
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
  amount?: string;
  tokenSymbol?: string;
  network?: string;
  timestamp?: Date | string;
  status?: string;
  holdReason?: string;
  holdUntil?: string;
  gasPrice?: string;
}

// Credentials
export interface Credential {
  id: string;
  name: string;
  type: string;
  data: any;
  createdAt: Date;
}

// Context
export interface AIContextType {
  state: AIState;
  dispatch: React.Dispatch<AIAction>;
  verifyTransaction: (tx: Transaction) => Promise<SecurityScan>;
  shouldHoldTransaction: (scan: SecurityScan) => boolean;
  getHoldReason: (scan: SecurityScan) => string;
  getIssuesByCategory: (scan: SecurityScan) => Record<SecurityCategory, SecurityIssue[]>;
  getRiskScore: (scan: SecurityScan) => number;
  saveCredential: (credential: any) => Promise<Credential>;
  getCredential: (id: string) => Promise<any>;
  handleChatMessage: (message: string) => void;
  holdTransaction: (tx: Transaction, reason: string, duration?: number) => Transaction;
  releaseTransaction: (txId: number) => void;
  clearChat: () => void;
  openTutorialSection: (section: string) => void;
  closeTutorial: () => void;
}

// AI Actions
export type AIAction =
  | { type: 'TOGGLE_AI'; payload: boolean }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'ADD_SCAN'; payload: SecurityScan }
  | { type: 'RESOLVE_ISSUE'; payload: { scanId: string; issueId: string } }
  | { type: 'SAVE_CREDENTIAL'; payload: Credential }
  | { type: 'REMOVE_CREDENTIAL'; payload: string }
  | { type: 'HOLD_TRANSACTION'; payload: Transaction }
  | { type: 'RELEASE_TRANSACTION'; payload: number }
  | { type: 'UPDATE_CONFIG'; payload: Partial<AIConfig> };