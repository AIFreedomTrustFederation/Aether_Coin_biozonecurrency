/**
 * PlaidConnector.ts
 * 
 * Module for KYC (Know Your Customer) verification and bank account connections via Plaid
 * This provides a simplified interface for the test mode
 */

// Define KYC verification status types
export interface KycVerification {
  verificationId: string;
  userId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  kycLevel: 'basic' | 'intermediate' | 'advanced' | 'enhanced';
  identityVerified: boolean;
  addressVerified: boolean;
  documentVerified: boolean;
  timestamp: string;
  metadata: Record<string, any>;
}

// Define customer information structure
export interface CustomerInformation {
  fullName: string;
  address: string;
  dateOfBirth: string;
  socialSecurityNumber: string;
  additionalInfo?: Record<string, any>;
}

class PlaidConnector {
  private initialized: boolean = false;
  private verifications: Record<string, KycVerification> = {};
  
  /**
   * Initialize the Plaid connector
   */
  public initialize(): void {
    if (this.initialized) return;
    this.initialized = true;
  }
  
  /**
   * Initiate a KYC verification process
   * @param userId - User ID for the verification
   * @param requiredLevel - Required KYC level
   * @returns Verification ID
   */
  public async initiateKycVerification(
    userId: string,
    requiredLevel: 'basic' | 'intermediate' | 'advanced' | 'enhanced' = 'basic'
  ): Promise<string> {
    this.checkInitialized();
    
    // Generate a verification ID
    const verificationId = `kyc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Create a new verification record
    this.verifications[verificationId] = {
      verificationId,
      userId: userId,
      status: 'pending',
      kycLevel: requiredLevel,
      identityVerified: false,
      addressVerified: false,
      documentVerified: false,
      timestamp: new Date().toISOString(),
      metadata: {
        requiredLevel,
        initiatedAt: new Date().toISOString()
      }
    };
    
    // Simulate an API delay
    await this.simulateDelay(1000);
    
    return verificationId;
  }
  
  /**
   * Submit customer information for KYC verification
   * @param verificationId - ID of the verification to update
   * @param customerInfo - Customer information for verification
   * @returns Updated verification object
   */
  public async submitKycInformation(
    verificationId: string,
    customerInfo: CustomerInformation
  ): Promise<KycVerification> {
    this.checkInitialized();
    
    // Check if verification exists
    if (!this.verifications[verificationId]) {
      throw new Error(`Verification with ID ${verificationId} not found`);
    }
    
    // Update verification status
    this.verifications[verificationId].status = 'in_progress';
    
    // Simulate verification process
    await this.simulateDelay(2000);
    
    // In test mode, always succeed with the verification
    this.verifications[verificationId] = {
      ...this.verifications[verificationId],
      status: 'completed',
      identityVerified: true,
      addressVerified: true,
      documentVerified: true,
      metadata: {
        ...this.verifications[verificationId].metadata,
        customerInfo: { ...customerInfo, socialSecurityNumber: '***-**-' + customerInfo.socialSecurityNumber.slice(-4) },
        completedAt: new Date().toISOString()
      }
    };
    
    return this.verifications[verificationId];
  }
  
  /**
   * Get verification status
   * @param verificationId - ID of the verification to check
   * @returns Verification object or undefined if not found
   */
  public getVerificationStatus(verificationId: string): KycVerification | undefined {
    this.checkInitialized();
    return this.verifications[verificationId];
  }
  
  /**
   * Determine if Plaid connector is initialized
   * @returns True if initialized, false otherwise
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Private method to check if Plaid connector is initialized
   * @throws Error if not initialized
   */
  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error('PlaidConnector not initialized. Call initialize() first.');
    }
  }
  
  /**
   * Simulate a delay for async operations
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

// Export singleton instance
export const plaidConnector = new PlaidConnector();