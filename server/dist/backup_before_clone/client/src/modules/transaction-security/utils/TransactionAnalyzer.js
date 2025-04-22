"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * TransactionAnalyzer utility for analyzing and scoring transaction risks
 * Evaluates transactions based on multiple risk factors and security rules
 */
class TransactionAnalyzer {
    constructor() {
        this.apiEndpoint = '/api/security/transaction-analysis';
        this.securityLevel = 'standard';
        this.holdingPeriod = 24; // Default: 24 hours
        this.isInitialized = false;
        // Address reputation cache (in a real app, this would be synced with backend)
        this.addressReputationCache = new Map();
        // Known high-risk addresses (in a real app, this would come from an API)
        this.knownRiskyAddresses = [
            '0x0000000000000000000000000000000000000000', // Null address
            '0x000000000000000000000000000000000000dead' // Burn address
        ];
        // Transaction history for user (in a real app, this would come from an API)
        this.userTransactionHistory = [];
    }
    /**
     * Initialize the transaction analyzer
     * @param apiEndpoint - Optional custom API endpoint
     * @param securityLevel - Security level for analysis
     * @param holdingPeriod - Holding period in hours
     */
    initialize(apiEndpoint, securityLevel, holdingPeriod) {
        if (apiEndpoint) {
            this.apiEndpoint = apiEndpoint;
        }
        if (securityLevel) {
            this.securityLevel = securityLevel;
        }
        if (holdingPeriod !== undefined) {
            this.holdingPeriod = holdingPeriod;
        }
        this.isInitialized = true;
    }
    /**
     * Analyze a transaction for risks
     * @param transaction - The transaction to analyze
     * @returns Promise resolving to transaction analysis result
     */
    async analyzeTransaction(transaction) {
        if (!this.isInitialized) {
            console.warn('Transaction analyzer not initialized, using default settings');
            this.isInitialized = true;
        }
        try {
            // In production, this would call the backend API
            // For now, we'll simulate the analysis process
            const riskAssessment = await this.simulateRiskAssessment(transaction);
            // Determine if transaction should be held based on risk level
            const isHeld = riskAssessment.level === 'high' || riskAssessment.level === 'critical';
            // Determine if transaction can be reversed (within holding period)
            const canBeReversed = this.isWithinHoldingPeriod(transaction.timestamp);
            // Determine recommended action based on risk assessment
            let recommendedAction;
            switch (riskAssessment.level) {
                case 'none':
                case 'low':
                    recommendedAction = 'proceed';
                    break;
                case 'medium':
                    recommendedAction = 'review';
                    break;
                case 'high':
                case 'critical':
                    recommendedAction = 'block';
                    break;
                default:
                    recommendedAction = 'review';
            }
            return {
                transaction,
                riskAssessment,
                isHeld,
                holdingPeriod: isHeld ? this.holdingPeriod : undefined,
                canBeReversed,
                recommendedAction
            };
        }
        catch (error) {
            console.error('Transaction analysis failed:', error);
            // Return a default error result
            const defaultRiskAssessment = {
                transactionId: transaction.id,
                level: 'medium',
                score: 50,
                factors: [{
                        id: 'error-factor',
                        type: 'other',
                        description: 'Analysis service error',
                        impact: 50
                    }],
                timestamp: new Date(),
                recommendation: 'Service error. Proceed with caution or try again later.'
            };
            return {
                transaction,
                riskAssessment: defaultRiskAssessment,
                isHeld: false,
                canBeReversed: this.isWithinHoldingPeriod(transaction.timestamp),
                recommendedAction: 'review'
            };
        }
    }
    /**
     * Check if a transaction is within the configured holding period
     * @param timestamp - Transaction timestamp
     * @returns boolean indicating if transaction is within holding period
     */
    isWithinHoldingPeriod(timestamp) {
        const currentTime = new Date().getTime();
        const transactionTime = new Date(timestamp).getTime();
        const timeDifferenceHours = (currentTime - transactionTime) / (1000 * 60 * 60);
        return timeDifferenceHours <= this.holdingPeriod;
    }
    /**
     * Update transaction analyzer configuration
     * @param securityLevel - New security level
     * @param holdingPeriod - New holding period in hours
     */
    updateConfig(securityLevel, holdingPeriod) {
        if (securityLevel) {
            this.securityLevel = securityLevel;
        }
        if (holdingPeriod !== undefined) {
            this.holdingPeriod = holdingPeriod;
        }
    }
    /**
     * Check address reputation
     * @param address - Blockchain address to check
     * @returns Promise resolving to risk level
     */
    async checkAddressReputation(address) {
        try {
            // Check cache first
            const cached = this.addressReputationCache.get(address);
            const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            if (cached && (new Date().getTime() - cached.lastUpdated.getTime() < cacheExpiry)) {
                return cached.riskLevel;
            }
            // In production, this would call an API
            // For now, check against known risky addresses
            let riskLevel = 'none';
            if (this.knownRiskyAddresses.includes(address)) {
                riskLevel = 'high';
            }
            else if (address.startsWith('0x0000')) {
                // Addresses starting with multiple zeros might be suspicious
                riskLevel = 'medium';
            }
            else if (!address.startsWith('0x') || address.length !== 42) {
                // Invalid Ethereum address format
                riskLevel = 'high';
            }
            // Update cache
            this.addressReputationCache.set(address, {
                riskLevel,
                lastUpdated: new Date()
            });
            return riskLevel;
        }
        catch (error) {
            console.error('Address reputation check failed:', error);
            return 'medium'; // Default to medium risk on error
        }
    }
    /**
     * Set user transaction history for pattern analysis
     * @param transactions - User's historical transactions
     */
    setTransactionHistory(transactions) {
        this.userTransactionHistory = transactions;
    }
    /**
     * Get current configuration
     * @returns Current analyzer configuration
     */
    getConfig() {
        return {
            securityLevel: this.securityLevel,
            holdingPeriod: this.holdingPeriod
        };
    }
    /**
     * Simulate risk assessment (for demo purposes)
     * Will be replaced with actual API calls in production
     */
    async simulateRiskAssessment(transaction) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Risk factors to analyze
        const factors = [];
        let totalRiskScore = 0;
        // 1. Amount analysis
        const amount = parseFloat(transaction.amount);
        if (!isNaN(amount)) {
            let amountImpact = 0;
            let amountDescription = '';
            if (amount > 10000) {
                amountImpact = 80;
                amountDescription = 'Very large transaction amount';
            }
            else if (amount > 1000) {
                amountImpact = 40;
                amountDescription = 'Large transaction amount';
            }
            else if (amount > 100) {
                amountImpact = 10;
                amountDescription = 'Moderate transaction amount';
            }
            if (amountImpact > 0) {
                factors.push({
                    id: `amount-factor-${transaction.id}`,
                    type: 'amount',
                    description: amountDescription,
                    impact: amountImpact,
                    mitigations: ['Consider breaking into smaller transactions', 'Verify recipient details']
                });
                totalRiskScore += amountImpact;
            }
        }
        // 2. Address reputation analysis
        const addressRiskLevel = await this.checkAddressReputation(transaction.toAddress);
        if (addressRiskLevel !== 'none') {
            let addressImpact = 0;
            switch (addressRiskLevel) {
                case 'low':
                    addressImpact = 20;
                    break;
                case 'medium':
                    addressImpact = 50;
                    break;
                case 'high':
                    addressImpact = 80;
                    break;
                case 'critical':
                    addressImpact = 100;
                    break;
            }
            factors.push({
                id: `address-factor-${transaction.id}`,
                type: 'address',
                description: `Recipient address has ${addressRiskLevel} risk level`,
                impact: addressImpact,
                mitigations: ['Verify recipient identity', 'Confirm transaction details through a secondary channel']
            });
            totalRiskScore += addressImpact;
        }
        // 3. Transaction timing analysis
        const hour = new Date(transaction.timestamp).getHours();
        if (hour < 6 || hour > 22) {
            // Transactions outside normal hours might be suspicious
            const timingImpact = 15;
            factors.push({
                id: `timing-factor-${transaction.id}`,
                type: 'timing',
                description: 'Transaction initiated outside normal hours',
                impact: timingImpact,
                mitigations: ['Confirm that you initiated this transaction']
            });
            totalRiskScore += timingImpact;
        }
        // 4. Network analysis
        const nonStandardNetwork = transaction.network !== 'Ethereum' &&
            transaction.network !== 'Bitcoin' &&
            transaction.network !== 'Polygon';
        if (nonStandardNetwork) {
            const networkImpact = 10;
            factors.push({
                id: `network-factor-${transaction.id}`,
                type: 'network',
                description: 'Transaction on less common network',
                impact: networkImpact
            });
            totalRiskScore += networkImpact;
        }
        // 5. Pattern analysis (if we have history)
        if (this.userTransactionHistory.length > 0) {
            // Check if this transaction is unusual compared to history
            const hasHistoryWithAddress = this.userTransactionHistory.some(tx => tx.toAddress === transaction.toAddress);
            if (!hasHistoryWithAddress) {
                const patternImpact = 25;
                factors.push({
                    id: `pattern-factor-${transaction.id}`,
                    type: 'pattern',
                    description: 'First transaction to this recipient address',
                    impact: patternImpact,
                    mitigations: ['Verify recipient address is correct']
                });
                totalRiskScore += patternImpact;
            }
        }
        // Additional checks based on security level
        if (this.securityLevel === 'high' || this.securityLevel === 'paranoid') {
            // For high security, add checks for gas price manipulation
            if (transaction.gasPrice && parseFloat(transaction.gasPrice) > 100) {
                const gasImpact = 30;
                factors.push({
                    id: `gas-factor-${transaction.id}`,
                    type: 'gas',
                    description: 'High gas price might indicate priority manipulation',
                    impact: gasImpact
                });
                totalRiskScore += gasImpact;
            }
        }
        if (this.securityLevel === 'paranoid') {
            // For paranoid security, even normal transactions get some risk
            if (factors.length === 0) {
                factors.push({
                    id: `paranoid-factor-${transaction.id}`,
                    type: 'other',
                    description: 'Standard security verification',
                    impact: 10
                });
                totalRiskScore += 10;
            }
        }
        // Calculate final risk score (0-100)
        const finalScore = Math.min(100, totalRiskScore);
        // Determine risk level based on score
        let riskLevel;
        if (finalScore >= 80) {
            riskLevel = 'critical';
        }
        else if (finalScore >= 50) {
            riskLevel = 'high';
        }
        else if (finalScore >= 30) {
            riskLevel = 'medium';
        }
        else if (finalScore > 0) {
            riskLevel = 'low';
        }
        else {
            riskLevel = 'none';
        }
        // Generate recommendation based on risk level
        let recommendation;
        switch (riskLevel) {
            case 'critical':
                recommendation = 'Transaction blocked due to critical security risk. Contact support for assistance.';
                break;
            case 'high':
                recommendation = 'High risk detected. Verify all transaction details carefully before proceeding.';
                break;
            case 'medium':
                recommendation = 'Some risk factors detected. Review transaction details before confirming.';
                break;
            case 'low':
                recommendation = 'Low risk detected. Proceed with normal caution.';
                break;
            case 'none':
                recommendation = 'No risk factors detected. Safe to proceed.';
                break;
        }
        return {
            transactionId: transaction.id,
            level: riskLevel,
            score: finalScore,
            factors,
            timestamp: new Date(),
            recommendation
        };
    }
}
// Export singleton instance
exports.default = new TransactionAnalyzer();
