// Message types for chat
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  attachments?: Attachment[];
  isRead?: boolean;
  referencedTransaction?: string;
}

// Attachment types for messages
export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'transaction' | 'link';
  url?: string;
  data?: any;
  name?: string;
  size?: number;
  mimeType?: string;
}

// AI Assistant configuration
export interface AIAssistantConfig {
  userId: number;
  theme?: 'light' | 'dark' | 'system';
  enableVoice?: boolean;
  enableNotifications?: boolean;
  securityLevel?: 'standard' | 'high' | 'paranoid';
  language?: string;
  transactionReversal?: boolean;
  holdingPeriod?: number; // in hours
}

// AI Assistant context state
export interface AIContextState {
  messages: Message[];
  isTyping: boolean;
  unreadCount: number;
  lastInteraction: Date | null;
  currentSession: string | null;
  config: AIAssistantConfig;
  isInitialized: boolean;
}

// Transaction to verify
export interface TransactionToVerify {
  id: string;
  fromAddress: string;
  toAddress: string;
  amount: string;
  tokenSymbol: string;
  network: string;
  timestamp: Date;
  status: 'pending' | 'processing' | 'verified' | 'flagged' | 'reversed';
  risk?: {
    level: 'low' | 'medium' | 'high' | 'critical';
    reasons: string[];
  };
}

// Verification result
export interface VerificationResult {
  transactionId: string;
  isVerified: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  issues: string[];
  recommendations: string[];
  canBeReversed: boolean;
}

// AI capability types
export enum AICapability {
  TransactionVerification = 'transaction-verification',
  PhishingDetection = 'phishing-detection',
  TransactionReversal = 'transaction-reversal',
  MarketInsights = 'market-insights',
  PortfolioAnalysis = 'portfolio-analysis',
  SecureStorage = 'secure-storage',
  VoiceCommands = 'voice-commands',
}

// AI Assistant intent types
export enum AIIntent {
  SendTransaction = 'send-transaction',
  CheckBalance = 'check-balance',
  VerifyTransaction = 'verify-transaction',
  ReverseTransaction = 'reverse-transaction',
  GetMarketInfo = 'get-market-info',
  AnalyzePortfolio = 'analyze-portfolio',
  StoreCredential = 'store-credential',
  RetrieveCredential = 'retrieve-credential',
  Help = 'help',
  SmallTalk = 'small-talk',
}

// Credential storage interface
export interface SecureCredential {
  id: string;
  name: string;
  type: 'password' | 'seed' | 'private_key' | 'api_key' | 'other';
  createdAt: Date;
  lastAccessed?: Date;
  metadata?: Record<string, any>;
}