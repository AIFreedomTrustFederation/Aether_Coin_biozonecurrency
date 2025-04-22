"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openSourcePaymentService = void 0;
const storage_1 = require("../storage");
const uuid_1 = require("uuid");
/**
 * Open Source Payment Service
 * Handles payments through open source / free software funding channels
 * like Open Collective, GitHub Sponsors, etc.
 */
exports.openSourcePaymentService = {
    /**
     * Process an open source payment
     *
     * @param amount The payment amount
     * @param currency The currency code
     * @param description The payment description
     * @param userId The user ID making the payment
     * @param walletId The optional wallet ID to associate with the payment
     * @param metadata Additional metadata
     * @returns Payment details with ID and status
     */
    async processPayment(amount, currency, description, userId, walletId, metadata = {}) {
        try {
            // Generate a unique transaction ID for the open source payment
            const transactionId = (0, uuid_1.v4)();
            // Create the payment record in our database
            const amountAsString = typeof amount === 'number' ? amount.toString() : amount;
            const paymentData = {
                userId,
                amount: amountAsString,
                currency,
                status: 'pending',
                provider: 'open_collective',
                providerPaymentId: `oc_${transactionId}`,
                externalId: transactionId,
                description,
                metadata: {
                    ...metadata,
                    processor: 'open_collective',
                    transactionId,
                    userId: userId.toString(),
                    walletId: walletId ? walletId.toString() : null,
                },
                walletId,
            };
            const payment = await storage_1.storage.createPayment(paymentData);
            // For demo purposes, simulate a payment success
            // In a real implementation, this would interact with the open source
            // payment processor's API or redirect to their payment page
            // Update the payment to completed status
            await storage_1.storage.updatePaymentStatus(payment.id, 'completed', new Date());
            return {
                id: transactionId,
                status: 'completed'
            };
        }
        catch (error) {
            console.error('Error processing open source payment:', error);
            throw error;
        }
    },
    /**
     * Verify an open source payment
     *
     * @param transactionId The payment transaction ID to verify
     * @returns The verification result
     */
    async verifyPayment(transactionId) {
        try {
            // Retrieve the payment by its external transaction ID
            const payments = await storage_1.storage.getPaymentByExternalId(transactionId);
            if (!payments || payments.length === 0) {
                return { verified: false };
            }
            const payment = payments[0];
            // If payment is completed, it's verified
            const verified = payment.status === 'completed';
            return {
                verified,
                payment
            };
        }
        catch (error) {
            console.error('Error verifying open source payment:', error);
            throw error;
        }
    },
    /**
     * Get supported open source funding platforms
     *
     * @returns List of supported platforms with details
     */
    async getSupportedPlatforms() {
        // Return a list of supported open source funding platforms
        return [
            {
                id: 'open_collective',
                name: 'Open Collective',
                description: 'Transparent funding for open source',
                url: 'https://opencollective.com',
                logoUrl: '/assets/logos/opencollective.svg'
            },
            {
                id: 'github_sponsors',
                name: 'GitHub Sponsors',
                description: 'Financially support open source developers',
                url: 'https://github.com/sponsors',
                logoUrl: '/assets/logos/github-sponsors.svg'
            },
            {
                id: 'liberapay',
                name: 'Liberapay',
                description: 'Recurrent donations platform',
                url: 'https://liberapay.com',
                logoUrl: '/assets/logos/liberapay.svg'
            }
        ];
    }
};
