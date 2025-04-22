"use strict";
/**
 * PlaidConnector.ts
 *
 * Module for KYC (Know Your Customer) verification and bank account connections via Plaid
 * This provides a simplified interface for the test mode
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.plaidConnector = void 0;
class PlaidConnector {
    constructor() {
        this.initialized = false;
        this.verifications = {};
    }
    /**
     * Initialize the Plaid connector
     */
    initialize() {
        if (this.initialized)
            return;
        this.initialized = true;
    }
    /**
     * Initiate a KYC verification process
     * @param userId - User ID for the verification
     * @param requiredLevel - Required KYC level
     * @returns Verification ID
     */
    async initiateKycVerification(userId, requiredLevel = 'basic') {
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
    async submitKycInformation(verificationId, customerInfo) {
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
    getVerificationStatus(verificationId) {
        this.checkInitialized();
        return this.verifications[verificationId];
    }
    /**
     * Determine if Plaid connector is initialized
     * @returns True if initialized, false otherwise
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Private method to check if Plaid connector is initialized
     * @throws Error if not initialized
     */
    checkInitialized() {
        if (!this.initialized) {
            throw new Error('PlaidConnector not initialized. Call initialize() first.');
        }
    }
    /**
     * Simulate a delay for async operations
     * @param ms - Milliseconds to delay
     * @returns Promise that resolves after the delay
     */
    simulateDelay(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}
// Export singleton instance
exports.plaidConnector = new PlaidConnector();
