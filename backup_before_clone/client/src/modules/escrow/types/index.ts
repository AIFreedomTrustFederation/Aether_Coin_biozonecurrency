// Escrow module types

// Escrow status types
export type EscrowStatus = 
  | 'pending' 
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'disputed'
  | 'refunded';

// Escrow transaction
export interface EscrowTransaction {
  id: string;
  senderAddress: string;
  recipientAddress: string;
  amount: string;
  tokenSymbol: string;
  network: string;
  status: EscrowStatus;
  createdAt: Date;
  updatedAt: Date;
  completesAt?: Date;
  conditions?: EscrowCondition[];
  disputeReason?: string;
  metadata?: Record<string, any>;
}

// Escrow condition
export interface EscrowCondition {
  id: string;
  type: EscrowConditionType;
  description: string;
  isMet: boolean;
  metAt?: Date;
  requirementData?: any;
}

// Escrow condition types
export type EscrowConditionType = 
  | 'time'
  | 'approval'
  | 'verification'
  | 'external'
  | 'document'
  | 'payment'
  | 'custom';

// Escrow event
export interface EscrowEvent {
  id: string;
  escrowId: string;
  type: EscrowEventType;
  timestamp: Date;
  data?: any;
  performedBy?: string;
}

// Escrow event types
export type EscrowEventType = 
  | 'created'
  | 'funded'
  | 'approved'
  | 'disputed'
  | 'resolved'
  | 'cancelled'
  | 'completed'
  | 'refunded'
  | 'condition_met'
  | 'extended';

// Escrow agent
export interface EscrowAgent {
  id: string;
  address: string;
  name?: string;
  isVerified: boolean;
  disputesResolved: number;
  rating: number; // 0-5
}

// Escrow dispute
export interface EscrowDispute {
  id: string;
  escrowId: string;
  reason: string;
  details: string;
  status: 'open' | 'under_review' | 'resolved';
  resolvedAt?: Date;
  resolution?: EscrowDisputeResolution;
  evidence?: EscrowDisputeEvidence[];
  createdAt: Date;
  updatedAt: Date;
}

// Escrow dispute resolution
export interface EscrowDisputeResolution {
  outcome: 'sender' | 'recipient' | 'split';
  splitRatio?: number; // If outcome is 'split', percentage to sender (0-100)
  reason: string;
  resolvedBy: string;
  timestamp: Date;
}

// Escrow dispute evidence
export interface EscrowDisputeEvidence {
  id: string;
  type: 'document' | 'image' | 'video' | 'text' | 'link';
  description: string;
  data: any;
  submittedBy: string;
  timestamp: Date;
}

// Escrow statistics
export interface EscrowStats {
  totalTransactions: number;
  activeTransactions: number;
  completedTransactions: number;
  disputedTransactions: number;
  totalValueLocked: string;
  averageEscrowDuration: number; // In hours
  disputeRate: number; // Percentage
}

// Escrow template
export interface EscrowTemplate {
  id: string;
  name: string;
  description: string;
  defaultConditions: Omit<EscrowCondition, 'id' | 'isMet' | 'metAt'>[];
  suggestedDuration: number; // In hours
  category: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  usageCount: number;
}

// Escrow context state
export interface EscrowContextState {
  transactions: EscrowTransaction[];
  disputes: EscrowDispute[];
  templates: EscrowTemplate[];
  stats: EscrowStats;
  isInitialized: boolean;
  defaultHoldingPeriod: number; // In hours
}