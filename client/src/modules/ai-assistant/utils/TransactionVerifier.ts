import { TransactionToVerify, VerificationResult } from '../types';

/**
 * Transaction Verifier utility
 * Analyzes blockchain transactions for potential risks and fraud
 */
class TransactionVerifier {
  private apiEndpoint: string = '/api/transaction-verification';
  private initialized: boolean = false;
  private securityLevel: 'standard' | 'high' | 'paranoid' = 'standard';
  private holdingPeriod: number = 24; // Default: 24 hours

  /**
   * Initialize the transaction verifier
   * @param apiEndpoint - Optional custom API endpoint
   * @param securityLevel - Security level for verification
   * @param holdingPeriod - Holding period in hours for reversals
   */
  initialize(
    apiEndpoint?: string,
    securityLevel?: 'standard' | 'high' | 'paranoid',
    holdingPeriod?: number
  ): void {
    if (apiEndpoint) {
      this.apiEndpoint = apiEndpoint;
    }
    
    if (securityLevel) {
      this.securityLevel = securityLevel;
    }
    
    if (holdingPeriod) {
      this.holdingPeriod = holdingPeriod;
    }
    
    this.initialized = true;
  }

  /**
   * Verify a transaction for potential risks
   * @param transaction - The transaction to verify
   * @returns Promise resolving to verification result
   */
  async verifyTransaction(transaction: TransactionToVerify): Promise<VerificationResult> {
    if (!this.initialized) {
      console.warn('Transaction verifier not initialized, using default settings');
      this.initialized = true;
    }

    try {
      // In production, this would call the backend API
      // For now, we'll simulate the verification process
      return await this.simulateVerification(transaction);
    } catch (error) {
      console.error('Transaction verification failed:', error);
      
      // Return a default error result
      return {
        transactionId: transaction.id,
        isVerified: false,
        riskLevel: 'high',
        issues: ['Verification service error'],
        recommendations: ['Try again later or contact support'],
        canBeReversed: this.isWithinHoldingPeriod(transaction.timestamp)
      };
    }
  }

  /**
   * Request a transaction reversal
   * @param transactionId - ID of the transaction to reverse
   * @returns Promise resolving to boolean indicating success
   */
  async reverseTransaction(transactionId: string): Promise<boolean> {
    if (!this.initialized) {
      console.warn('Transaction verifier not initialized, using default settings');
      this.initialized = true;
    }

    try {
      // In production, this would call the backend API
      // For now, we'll simulate the reversal process
      await this.simulateReversal(transactionId);
      return true;
    } catch (error) {
      console.error('Transaction reversal failed:', error);
      return false;
    }
  }

  /**
   * Check if transaction is within holding period for reversal
   * @param timestamp - Transaction timestamp
   * @returns boolean indicating if transaction is within holding period
   */
  isWithinHoldingPeriod(timestamp: Date): boolean {
    const currentTime = new Date().getTime();
    const transactionTime = new Date(timestamp).getTime();
    const timeDifferenceHours = (currentTime - transactionTime) / (1000 * 60 * 60);
    
    return timeDifferenceHours <= this.holdingPeriod;
  }

  /**
   * Update verifier configuration
   * @param securityLevel - New security level
   * @param holdingPeriod - New holding period in hours
   */
  updateConfig(securityLevel?: 'standard' | 'high' | 'paranoid', holdingPeriod?: number): void {
    if (securityLevel) {
      this.securityLevel = securityLevel;
    }
    
    if (holdingPeriod) {
      this.holdingPeriod = holdingPeriod;
    }
  }

  /**
   * Get current configuration
   * @returns Current verifier configuration
   */
  getConfig(): { securityLevel: string, holdingPeriod: number } {
    return {
      securityLevel: this.securityLevel,
      holdingPeriod: this.holdingPeriod
    };
  }

  /**
   * Simulate transaction verification (for demo purposes)
   * Will be replaced with actual API calls in production
   */
  private async simulateVerification(transaction: TransactionToVerify): Promise<VerificationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Risk factors to check
    const highRiskAmount = parseFloat(transaction.amount) > 1000;
    const unknownAddress = !transaction.toAddress.startsWith('0x') || transaction.toAddress.length !== 42;
    const newTransaction = this.isWithinHoldingPeriod(new Date(Date.now() - 1000 * 60 * 5)); // Within 5 minutes
    
    // Adjust checks based on security level
    const issues: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    // Check for issues based on security level
    if (this.securityLevel === 'standard' || this.securityLevel === 'high' || this.securityLevel === 'paranoid') {
      if (highRiskAmount) {
        issues.push('Large transaction amount detected');
        riskLevel = 'medium';
      }
      
      if (unknownAddress) {
        issues.push('Recipient address has unusual format');
        riskLevel = 'high';
      }
    }
    
    // Additional checks for higher security levels
    if (this.securityLevel === 'high' || this.securityLevel === 'paranoid') {
      if (transaction.network !== 'Ethereum' && transaction.network !== 'Bitcoin') {
        issues.push('Non-standard blockchain network');
        riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      }
    }
    
    // Paranoid mode additional checks
    if (this.securityLevel === 'paranoid') {
      if (!newTransaction) {
        issues.push('Transaction not initiated recently');
        riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      }
      
      // Add time-based warning
      const currentHour = new Date().getHours();
      if (currentHour < 6 || currentHour > 22) {
        issues.push('Transaction initiated outside normal hours');
        riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      }
    }
    
    // Generate recommendations based on issues
    const recommendations: string[] = [];
    
    if (issues.length > 0) {
      recommendations.push('Verify recipient address and transaction details');
      
      if (highRiskAmount) {
        recommendations.push('Consider breaking into smaller transactions');
      }
      
      if (unknownAddress) {
        recommendations.push('Double-check the recipient address format');
      }
      
      if (riskLevel === 'high' || riskLevel === 'critical') {
        recommendations.push('Contact support before proceeding');
      }
    }
    
    return {
      transactionId: transaction.id,
      isVerified: issues.length === 0,
      riskLevel,
      issues,
      recommendations,
      canBeReversed: this.isWithinHoldingPeriod(transaction.timestamp)
    };
  }

  /**
   * Simulate transaction reversal (for demo purposes)
   * Will be replaced with actual API calls in production
   */
  private async simulateReversal(transactionId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real implementation, we would call the backend to initiate reversal
    console.log(`Transaction ${transactionId} reversal initiated`);
    
    // Random success rate for simulation
    const success = Math.random() > 0.2; // 80% success rate
    
    if (!success) {
      throw new Error('Transaction reversal failed');
    }
  }
}

// Export singleton instance
export default new TransactionVerifier();