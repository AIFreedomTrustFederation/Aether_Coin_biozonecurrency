import { v4 as uuidv4 } from 'uuid';
import { 
  EscrowTransaction,
  EscrowStatus,
  EscrowEvent,
  EscrowDispute,
  EscrowTemplate,
  EscrowCondition,
  EscrowStats
} from '../types';

/**
 * EscrowService utility for managing escrow transactions
 * Handles creation, management, and resolution of escrow transactions
 */
class EscrowService {
  private apiEndpoint: string = '/api/escrow';
  private isInitialized: boolean = false;
  private defaultHoldingPeriod: number = 24; // Default: 24 hours
  
  // Storage for escrow data (in a real app, this would be through an API)
  private transactions: EscrowTransaction[] = [];
  private disputes: EscrowDispute[] = [];
  private events: EscrowEvent[] = [];
  private templates: EscrowTemplate[] = [];

  /**
   * Initialize the escrow service
   * @param apiEndpoint - Optional custom API endpoint
   * @param defaultHoldingPeriod - Default holding period in hours
   */
  initialize(apiEndpoint?: string, defaultHoldingPeriod?: number): void {
    if (apiEndpoint) {
      this.apiEndpoint = apiEndpoint;
    }
    
    if (defaultHoldingPeriod !== undefined) {
      this.defaultHoldingPeriod = defaultHoldingPeriod;
    }
    
    this.loadDefaultTemplates();
    this.isInitialized = true;
  }

  /**
   * Create a new escrow transaction
   * @param senderAddress - Address of the sender
   * @param recipientAddress - Address of the recipient
   * @param amount - Amount to be held in escrow
   * @param tokenSymbol - Symbol of the token
   * @param network - Blockchain network
   * @param holdingPeriod - Optional custom holding period in hours
   * @param conditions - Optional custom conditions
   * @returns Promise resolving to the created escrow transaction
   */
  async createEscrow(
    senderAddress: string,
    recipientAddress: string,
    amount: string,
    tokenSymbol: string,
    network: string,
    holdingPeriod?: number,
    conditions?: Omit<EscrowCondition, 'id' | 'isMet' | 'metAt'>[]
  ): Promise<EscrowTransaction> {
    if (!this.isInitialized) {
      console.warn('Escrow service not initialized, using default settings');
      this.isInitialized = true;
    }

    try {
      // In production, this would call the backend API
      // For now, we'll simulate the creation process
      
      // Calculate completion time
      const completionHours = holdingPeriod !== undefined ? holdingPeriod : this.defaultHoldingPeriod;
      const completesAt = new Date();
      completesAt.setHours(completesAt.getHours() + completionHours);
      
      // Create escrow conditions
      const escrowConditions: EscrowCondition[] = [
        {
          id: uuidv4(),
          type: 'time',
          description: `Automatic release after ${completionHours} hours`,
          isMet: false,
          requirementData: { hours: completionHours }
        }
      ];
      
      // Add any custom conditions
      if (conditions && conditions.length > 0) {
        escrowConditions.push(
          ...conditions.map(condition => ({
            ...condition,
            id: uuidv4(),
            isMet: false
          }))
        );
      }
      
      // Create the escrow transaction
      const now = new Date();
      const escrow: EscrowTransaction = {
        id: uuidv4(),
        senderAddress,
        recipientAddress,
        amount,
        tokenSymbol,
        network,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        completesAt,
        conditions: escrowConditions
      };
      
      // Add to local storage
      this.transactions.push(escrow);
      
      // Record the creation event
      this.recordEvent({
        id: uuidv4(),
        escrowId: escrow.id,
        type: 'created',
        timestamp: now,
        performedBy: senderAddress
      });
      
      return escrow;
    } catch (error) {
      console.error('Failed to create escrow:', error);
      throw new Error('Failed to create escrow transaction');
    }
  }

  /**
   * Get an escrow transaction by ID
   * @param id - The ID of the escrow transaction
   * @returns The escrow transaction if found, undefined otherwise
   */
  getEscrow(id: string): EscrowTransaction | undefined {
    return this.transactions.find(tx => tx.id === id);
  }

  /**
   * Get all escrow transactions for an address
   * @param address - The address to get transactions for
   * @param role - Optional role filter ('sender', 'recipient', or 'both')
   * @returns Array of escrow transactions
   */
  getEscrowsByAddress(
    address: string, 
    role: 'sender' | 'recipient' | 'both' = 'both'
  ): EscrowTransaction[] {
    return this.transactions.filter(tx => {
      if (role === 'sender') {
        return tx.senderAddress === address;
      } else if (role === 'recipient') {
        return tx.recipientAddress === address;
      } else {
        return tx.senderAddress === address || tx.recipientAddress === address;
      }
    });
  }

  /**
   * Get escrow transactions by status
   * @param status - The status to filter by
   * @returns Array of escrow transactions with the specified status
   */
  getEscrowsByStatus(status: EscrowStatus): EscrowTransaction[] {
    return this.transactions.filter(tx => tx.status === status);
  }

  /**
   * Fund an escrow transaction
   * @param escrowId - The ID of the escrow to fund
   * @param senderAddress - Address of the sender
   * @returns Promise resolving to the updated escrow transaction
   */
  async fundEscrow(escrowId: string, senderAddress: string): Promise<EscrowTransaction> {
    const escrow = this.getEscrow(escrowId);
    
    if (!escrow) {
      throw new Error('Escrow transaction not found');
    }
    
    if (escrow.status !== 'pending') {
      throw new Error(`Cannot fund escrow in ${escrow.status} status`);
    }
    
    if (escrow.senderAddress !== senderAddress) {
      throw new Error('Only the sender can fund this escrow');
    }
    
    try {
      // Update escrow status
      escrow.status = 'active';
      escrow.updatedAt = new Date();
      
      // Record the funding event
      this.recordEvent({
        id: uuidv4(),
        escrowId: escrow.id,
        type: 'funded',
        timestamp: new Date(),
        performedBy: senderAddress
      });
      
      return escrow;
    } catch (error) {
      console.error('Failed to fund escrow:', error);
      throw new Error('Failed to fund escrow transaction');
    }
  }

  /**
   * Approve and complete an escrow transaction
   * @param escrowId - The ID of the escrow to approve
   * @param approverAddress - Address of the approver (usually the sender)
   * @returns Promise resolving to the updated escrow transaction
   */
  async approveEscrow(escrowId: string, approverAddress: string): Promise<EscrowTransaction> {
    const escrow = this.getEscrow(escrowId);
    
    if (!escrow) {
      throw new Error('Escrow transaction not found');
    }
    
    if (escrow.status !== 'active') {
      throw new Error(`Cannot approve escrow in ${escrow.status} status`);
    }
    
    if (escrow.senderAddress !== approverAddress) {
      throw new Error('Only the sender can approve this escrow');
    }
    
    try {
      // Update escrow status
      escrow.status = 'completed';
      escrow.updatedAt = new Date();
      
      // Record the approval event
      this.recordEvent({
        id: uuidv4(),
        escrowId: escrow.id,
        type: 'approved',
        timestamp: new Date(),
        performedBy: approverAddress
      });
      
      // Record the completion event
      this.recordEvent({
        id: uuidv4(),
        escrowId: escrow.id,
        type: 'completed',
        timestamp: new Date()
      });
      
      return escrow;
    } catch (error) {
      console.error('Failed to approve escrow:', error);
      throw new Error('Failed to approve escrow transaction');
    }
  }

  /**
   * Cancel an escrow transaction
   * @param escrowId - The ID of the escrow to cancel
   * @param cancellerAddress - Address of the canceller
   * @returns Promise resolving to the updated escrow transaction
   */
  async cancelEscrow(escrowId: string, cancellerAddress: string): Promise<EscrowTransaction> {
    const escrow = this.getEscrow(escrowId);
    
    if (!escrow) {
      throw new Error('Escrow transaction not found');
    }
    
    if (escrow.status !== 'pending' && escrow.status !== 'active') {
      throw new Error(`Cannot cancel escrow in ${escrow.status} status`);
    }
    
    if (escrow.senderAddress !== cancellerAddress && escrow.recipientAddress !== cancellerAddress) {
      throw new Error('Only the sender or recipient can cancel this escrow');
    }
    
    try {
      // Update escrow status
      escrow.status = 'cancelled';
      escrow.updatedAt = new Date();
      
      // Record the cancellation event
      this.recordEvent({
        id: uuidv4(),
        escrowId: escrow.id,
        type: 'cancelled',
        timestamp: new Date(),
        performedBy: cancellerAddress
      });
      
      return escrow;
    } catch (error) {
      console.error('Failed to cancel escrow:', error);
      throw new Error('Failed to cancel escrow transaction');
    }
  }

  /**
   * Create a dispute for an escrow transaction
   * @param escrowId - The ID of the escrow to dispute
   * @param disputerAddress - Address of the disputer
   * @param reason - Reason for the dispute
   * @param details - Detailed explanation of the dispute
   * @returns Promise resolving to the created dispute
   */
  async createDispute(
    escrowId: string,
    disputerAddress: string,
    reason: string,
    details: string
  ): Promise<EscrowDispute> {
    const escrow = this.getEscrow(escrowId);
    
    if (!escrow) {
      throw new Error('Escrow transaction not found');
    }
    
    if (escrow.status !== 'active') {
      throw new Error(`Cannot dispute escrow in ${escrow.status} status`);
    }
    
    if (escrow.senderAddress !== disputerAddress && escrow.recipientAddress !== disputerAddress) {
      throw new Error('Only the sender or recipient can dispute this escrow');
    }
    
    try {
      // Update escrow status
      escrow.status = 'disputed';
      escrow.disputeReason = reason;
      escrow.updatedAt = new Date();
      
      // Create the dispute
      const now = new Date();
      const dispute: EscrowDispute = {
        id: uuidv4(),
        escrowId,
        reason,
        details,
        status: 'open',
        evidence: [],
        createdAt: now,
        updatedAt: now
      };
      
      // Add to local storage
      this.disputes.push(dispute);
      
      // Record the dispute event
      this.recordEvent({
        id: uuidv4(),
        escrowId,
        type: 'disputed',
        timestamp: now,
        performedBy: disputerAddress,
        data: { reason }
      });
      
      return dispute;
    } catch (error) {
      console.error('Failed to create dispute:', error);
      throw new Error('Failed to create dispute');
    }
  }

  /**
   * Resolve a dispute
   * @param disputeId - The ID of the dispute to resolve
   * @param outcome - The outcome of the dispute ('sender', 'recipient', or 'split')
   * @param reason - Reason for the resolution
   * @param splitRatio - If outcome is 'split', the percentage to the sender (0-100)
   * @param resolverAddress - Address of the resolver
   * @returns Promise resolving to the updated dispute
   */
  async resolveDispute(
    disputeId: string,
    outcome: 'sender' | 'recipient' | 'split',
    reason: string,
    splitRatio?: number,
    resolverAddress?: string
  ): Promise<EscrowDispute> {
    const dispute = this.disputes.find(d => d.id === disputeId);
    
    if (!dispute) {
      throw new Error('Dispute not found');
    }
    
    if (dispute.status === 'resolved') {
      throw new Error('Dispute is already resolved');
    }
    
    const escrow = this.getEscrow(dispute.escrowId);
    
    if (!escrow) {
      throw new Error('Escrow transaction not found');
    }
    
    try {
      // Update dispute status
      const now = new Date();
      dispute.status = 'resolved';
      dispute.resolvedAt = now;
      dispute.resolution = {
        outcome,
        reason,
        splitRatio: outcome === 'split' ? splitRatio || 50 : undefined,
        resolvedBy: resolverAddress || 'system',
        timestamp: now
      };
      dispute.updatedAt = now;
      
      // Update escrow status
      if (outcome === 'sender') {
        escrow.status = 'refunded';
      } else if (outcome === 'recipient') {
        escrow.status = 'completed';
      } else {
        // Split - in a real implementation, this would involve more complex logic
        escrow.status = 'completed';
        escrow.metadata = {
          ...escrow.metadata,
          splitRatio: splitRatio || 50
        };
      }
      
      escrow.updatedAt = now;
      
      // Record the resolution event
      this.recordEvent({
        id: uuidv4(),
        escrowId: escrow.id,
        type: 'resolved',
        timestamp: now,
        performedBy: resolverAddress || 'system',
        data: { outcome, reason, splitRatio }
      });
      
      if (outcome === 'sender') {
        // Record the refund event
        this.recordEvent({
          id: uuidv4(),
          escrowId: escrow.id,
          type: 'refunded',
          timestamp: now
        });
      } else {
        // Record the completion event
        this.recordEvent({
          id: uuidv4(),
          escrowId: escrow.id,
          type: 'completed',
          timestamp: now
        });
      }
      
      return dispute;
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
      throw new Error('Failed to resolve dispute');
    }
  }

  /**
   * Get escrow events for a transaction
   * @param escrowId - The ID of the escrow
   * @returns Array of events for the escrow
   */
  getEscrowEvents(escrowId: string): EscrowEvent[] {
    return this.events.filter(event => event.escrowId === escrowId);
  }

  /**
   * Get escrow templates
   * @param category - Optional category filter
   * @returns Array of escrow templates
   */
  getEscrowTemplates(category?: string): EscrowTemplate[] {
    if (category) {
      return this.templates.filter(template => template.category === category);
    }
    return this.templates;
  }

  /**
   * Get escrow statistics
   * @returns Escrow statistics
   */
  getEscrowStats(): EscrowStats {
    const completedTransactions = this.transactions.filter(tx => tx.status === 'completed');
    const disputedTransactions = this.transactions.filter(tx => tx.status === 'disputed');
    
    // Calculate total value locked
    const activeTransactions = this.transactions.filter(tx => tx.status === 'active');
    const totalValueLocked = activeTransactions.reduce((total, tx) => {
      return total + parseFloat(tx.amount);
    }, 0).toString();
    
    // Calculate average escrow duration
    let totalDuration = 0;
    let completedCount = 0;
    
    for (const tx of completedTransactions) {
      if (tx.createdAt && tx.updatedAt) {
        const durationHours = (tx.updatedAt.getTime() - tx.createdAt.getTime()) / (1000 * 60 * 60);
        totalDuration += durationHours;
        completedCount++;
      }
    }
    
    const averageDuration = completedCount > 0 ? totalDuration / completedCount : 0;
    
    // Calculate dispute rate
    const disputeRate = this.transactions.length > 0 
      ? (disputedTransactions.length / this.transactions.length) * 100
      : 0;
    
    return {
      totalTransactions: this.transactions.length,
      activeTransactions: activeTransactions.length,
      completedTransactions: completedTransactions.length,
      disputedTransactions: disputedTransactions.length,
      totalValueLocked,
      averageEscrowDuration: averageDuration,
      disputeRate
    };
  }

  /**
   * Update the default holding period
   * @param hours - New holding period in hours
   */
  updateDefaultHoldingPeriod(hours: number): void {
    if (hours > 0) {
      this.defaultHoldingPeriod = hours;
    }
  }

  /**
   * Get the default holding period
   * @returns Default holding period in hours
   */
  getDefaultHoldingPeriod(): number {
    return this.defaultHoldingPeriod;
  }

  /**
   * Record an escrow event
   * @param event - The event to record
   */
  private recordEvent(event: EscrowEvent): void {
    this.events.push(event);
  }

  /**
   * Load default escrow templates
   */
  private loadDefaultTemplates(): void {
    const defaultTemplates: EscrowTemplate[] = [
      {
        id: uuidv4(),
        name: 'Standard Transaction',
        description: 'Basic escrow with 24-hour holding period',
        defaultConditions: [
          {
            type: 'time',
            description: 'Automatic release after 24 hours',
            requirementData: { hours: 24 }
          }
        ],
        suggestedDuration: 24,
        category: 'general',
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 0
      },
      {
        id: uuidv4(),
        name: 'Secure Transaction',
        description: 'Enhanced security with 48-hour holding period and verification',
        defaultConditions: [
          {
            type: 'time',
            description: 'Automatic release after 48 hours',
            requirementData: { hours: 48 }
          },
          {
            type: 'verification',
            description: 'Requires verification of recipient identity',
            requirementData: { verificationLevel: 'standard' }
          }
        ],
        suggestedDuration: 48,
        category: 'security',
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 0
      },
      {
        id: uuidv4(),
        name: 'Goods Exchange',
        description: 'For physical goods transactions with shipping confirmation',
        defaultConditions: [
          {
            type: 'time',
            description: 'Automatic release after 72 hours',
            requirementData: { hours: 72 }
          },
          {
            type: 'approval',
            description: 'Requires confirmation of goods receipt',
            requirementData: { approvalType: 'confirmation' }
          }
        ],
        suggestedDuration: 72,
        category: 'commerce',
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date(),
        usageCount: 0
      }
    ];
    
    this.templates = defaultTemplates;
  }
}

// Export singleton instance
export default new EscrowService();