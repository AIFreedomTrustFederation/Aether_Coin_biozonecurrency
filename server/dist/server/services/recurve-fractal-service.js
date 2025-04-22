"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recurveFractalService = exports.RecurveFractalService = void 0;
const db_1 = require("../db");
const recurve_schema_1 = require("@shared/recurve-schema");
const schema_1 = require("@shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
/**
 * RecurveFractalService
 *
 * Core service for managing the Recurve Fractal Reserve system:
 * - Insurance policy management and integration
 * - Recurve token minting and management
 * - Fractal loan origination and processing
 * - Torus field security node management
 * - Mandelbrot recursion calculations
 */
class RecurveFractalService {
    /**
     * Register a new insurance policy in the system
     */
    async registerInsurancePolicy(userId, policyData) {
        // Generate a verification hash for the policy
        const verificationHash = this.generatePolicyVerificationHash(userId, policyData.policyNumber, policyData.faceValue);
        // Insert the policy record
        const [newPolicy] = await db_1.db.insert(recurve_schema_1.insurancePolicies).values({
            userId,
            policyProvider: policyData.policyProvider,
            policyNumber: policyData.policyNumber,
            policyType: policyData.policyType,
            faceValue: policyData.faceValue.toString(),
            cashValue: policyData.cashValue.toString(),
            premiumAmount: policyData.premiumAmount.toString(),
            premiumFrequency: policyData.premiumFrequency,
            beneficiaryType: policyData.beneficiaryType,
            beneficiaryId: policyData.beneficiaryId,
            beneficiaryPercentage: policyData.beneficiaryPercentage.toString(),
            status: recurve_schema_1.InsurancePolicyStatus.PENDING,
            maturityDate: policyData.maturityDate,
            policyDocumentCid: policyData.policyDocumentCid,
            verificationHash,
            onchainSyncStatus: recurve_schema_1.RecurveSyncStatus.PENDING
        }).returning();
        // If policy is registered with the trust as beneficiary, create a security node
        if (policyData.beneficiaryType === recurve_schema_1.BeneficiaryType.TRUST) {
            await this.createSecurityNodeFromPolicy(newPolicy.id, userId, policyData.faceValue, policyData.beneficiaryPercentage);
        }
        return newPolicy;
    }
    /**
     * Mint Recurve tokens backed by an insurance policy
     */
    async mintRecurveTokens(userId, policyId, options) {
        // Get the policy
        const policy = await db_1.db.query.insurancePolicies.findFirst({
            where: (0, drizzle_orm_1.eq)(recurve_schema_1.insurancePolicies.id, policyId)
        });
        if (!policy) {
            throw new Error('Policy not found');
        }
        if (policy.userId !== userId) {
            throw new Error('Not authorized to mint tokens for this policy');
        }
        if (policy.status !== recurve_schema_1.InsurancePolicyStatus.ACTIVE) {
            throw new Error('Policy must be active to mint tokens');
        }
        // Determine token tier based on face value and collateralization
        const tier = this.determineTokenTier(parseFloat(policy.faceValue), options.collateralizationRatio);
        // Calculate mandelbrot parameters based on policy values
        const mandelbrotParams = this.calculateMandelbrotParameters(parseFloat(policy.faceValue), options.collateralizationRatio, options.fractalRecursionDepth || 3);
        // Generate token address (in a real system, this would involve blockchain operations)
        const tokenAddress = `0x${(0, uuid_1.v4)().replace(/-/g, '')}`;
        // Create the token record
        const [newToken] = await db_1.db.insert(recurve_schema_1.recurveTokens).values({
            userId,
            policyId,
            tokenAddress,
            tokenAmount: options.tokenAmount.toString(),
            tier,
            collateralizationRatio: options.collateralizationRatio.toString(),
            fractalRecursionDepth: options.fractalRecursionDepth || 3,
            mandelbrotParameters: mandelbrotParams,
            status: 'active'
        }).returning();
        // Log a recursion event
        await this.logMandelbrotRecursion('token_minting', options.fractalRecursionDepth || 3, { policyId, faceValue: policy.faceValue }, { tokenId: newToken.id, tokenAmount: options.tokenAmount }, ['tokens'], userId);
        return newToken;
    }
    /**
     * Create a fractal loan using a policy or tokens as collateral
     */
    async createFractalLoan(userId, loanData) {
        // Verify the user has the specified wallet
        const wallet = await db_1.db.query.wallets.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.wallets.id, loanData.walletId), (0, drizzle_orm_1.eq)(schema_1.wallets.userId, userId))
        });
        if (!wallet) {
            throw new Error('Wallet not found or does not belong to user');
        }
        // Calculate fractal model parameters
        const fractalParams = this.calculateFractalLoanParameters(loanData.loanAmount, loanData.collateralPercentage, loanData.collateralType);
        // Create the loan
        const [newLoan] = await db_1.db.insert(recurve_schema_1.fractalLoans).values({
            userId,
            policyId: loanData.policyId,
            recurveTokenId: loanData.recurveTokenId,
            loanAmount: loanData.loanAmount.toString(),
            collateralPercentage: loanData.collateralPercentage.toString(),
            collateralType: loanData.collateralType,
            interestRate: loanData.interestRate.toString(),
            fractalModelParameters: fractalParams,
            maturityDate: loanData.maturityDate,
            walletId: loanData.walletId,
            status: recurve_schema_1.FractalLoanStatus.PENDING,
            loanPurpose: loanData.loanPurpose
        }).returning();
        // Based on collateral type, update the collateral status
        if (loanData.collateralType === recurve_schema_1.FractalLoanCollateralType.POLICY && loanData.policyId) {
            // Mark policy as used for collateral
            await this.updatePolicyCollateralization(loanData.policyId, newLoan.id);
        }
        if ((loanData.collateralType === recurve_schema_1.FractalLoanCollateralType.TOKEN ||
            loanData.collateralType === recurve_schema_1.FractalLoanCollateralType.HYBRID) &&
            loanData.recurveTokenId) {
            // Mark token as used for collateral
            await this.updateTokenCollateralization(loanData.recurveTokenId, newLoan.id);
        }
        // Log the fractal recursion
        await this.logMandelbrotRecursion('loan_origination', 4, // Standard recursion depth for loans
        { loanAmount: loanData.loanAmount, collateralPercentage: loanData.collateralPercentage }, { loanId: newLoan.id, fractalParameters: fractalParams }, ['loans'], userId);
        return newLoan;
    }
    /**
     * Create a torus security node from a policy
     */
    async createSecurityNodeFromPolicy(policyId, userId, faceValue, beneficiaryPercentage) {
        // Determine node type based on face value
        let nodeType = recurve_schema_1.TorusNodeType.TERTIARY;
        if (faceValue > 1000000) {
            nodeType = recurve_schema_1.TorusNodeType.PRIMARY;
        }
        else if (faceValue > 100000) {
            nodeType = recurve_schema_1.TorusNodeType.SECONDARY;
        }
        // Calculate security level based on policy value and percentage
        const securityLevel = Math.floor((faceValue * (beneficiaryPercentage / 100)) / 1000);
        // Calculate appropriate recursion depth based on policy value
        const recursionDepth = Math.max(3, Math.min(12, Math.floor(Math.log10(faceValue) * 2)));
        // Calculate network position using a torus mapping function
        const networkPosition = this.calculateTorusPosition(policyId, faceValue, 0.85);
        // Calculate mandelbrot parameters
        const mandelbrotParams = {
            c: -0.8,
            z0: 0,
            iterations: recursionDepth,
            stabilityThreshold: 0.9
        };
        // Create the security node
        const [node] = await db_1.db.insert(recurve_schema_1.torusSecurityNodes).values({
            nodeType,
            userId,
            securityLevel,
            backingAmount: (faceValue * (beneficiaryPercentage / 100)).toString(),
            recursionDepth,
            mandelbrotParameters: mandelbrotParams,
            networkPosition,
            status: 'active'
        }).returning();
        return node;
    }
    /**
     * Update a policy to show it's being used as collateral
     */
    async updatePolicyCollateralization(policyId, loanId) {
        // In a real implementation, you would update policy status or add a marker
        // For now, we'll just update the policy's last updated timestamp
        await db_1.db.update(recurve_schema_1.insurancePolicies)
            .set({
            lastUpdated: new Date(),
            // Add other fields if needed to track collateralization
        })
            .where((0, drizzle_orm_1.eq)(recurve_schema_1.insurancePolicies.id, policyId));
    }
    /**
     * Update a token to show it's being used as collateral
     */
    async updateTokenCollateralization(tokenId, loanId) {
        // In a real implementation, you would update token status or add a marker
        await db_1.db.update(recurve_schema_1.recurveTokens)
            .set({
            lastRecalculation: new Date(),
            // Add other fields if needed to track collateralization
        })
            .where((0, drizzle_orm_1.eq)(recurve_schema_1.recurveTokens.id, tokenId));
    }
    /**
     * Generate a verification hash for an insurance policy
     */
    generatePolicyVerificationHash(userId, policyNumber, faceValue) {
        // In a production system, this would use a proper cryptographic hash function
        const baseString = `${userId}-${policyNumber}-${faceValue}-${Date.now()}`;
        return Buffer.from(baseString).toString('base64');
    }
    /**
     * Determine token tier based on policy face value and collateralization ratio
     */
    determineTokenTier(faceValue, collateralizationRatio) {
        if (faceValue >= 1000000 && collateralizationRatio >= 150) {
            return recurve_schema_1.RecurveTokenTier.PLATINUM;
        }
        else if (faceValue >= 500000 && collateralizationRatio >= 130) {
            return recurve_schema_1.RecurveTokenTier.GOLD;
        }
        else if (faceValue >= 100000 && collateralizationRatio >= 110) {
            return recurve_schema_1.RecurveTokenTier.SILVER;
        }
        else {
            return recurve_schema_1.RecurveTokenTier.BRONZE;
        }
    }
    /**
     * Calculate mandelbrot parameters for token minting
     */
    calculateMandelbrotParameters(faceValue, collateralizationRatio, recursionDepth) {
        // In a real implementation, this would apply complex fractal mathematics
        // For now, we'll return a simplified set of parameters
        return {
            c: (Math.log10(faceValue) / 10) - 0.75, // Maps the policy value to a suitable c value in the Mandelbrot set
            z0: collateralizationRatio / 200, // Initial z value based on collateralization
            iterations: recursionDepth,
            stabilityThreshold: 0.9 - (recursionDepth / 100), // Higher recursion depth slightly reduces stability threshold
            collateralInfluence: collateralizationRatio / 100
        };
    }
    /**
     * Calculate fractal loan parameters
     */
    calculateFractalLoanParameters(loanAmount, collateralPercentage, collateralType) {
        // Adjust parameters based on collateral type
        const collateralTypeMultiplier = collateralType === recurve_schema_1.FractalLoanCollateralType.POLICY ? 1.0 :
            collateralType === recurve_schema_1.FractalLoanCollateralType.TOKEN ? 0.9 :
                0.95; // HYBRID
        // Calculate fractal parameters
        return {
            recursionBase: Math.log10(loanAmount) / 2,
            collateralWeight: collateralPercentage / 100,
            collateralTypeMultiplier,
            z0: (collateralPercentage / 200) * collateralTypeMultiplier,
            c: -0.8 + (Math.log10(loanAmount) / 20),
            iterations: 4,
            stabilityMetric: Math.min(0.95, 0.7 + (collateralPercentage / 500)),
            loanEfficiency: (collateralPercentage / 100) * collateralTypeMultiplier
        };
    }
    /**
     * Calculate torus field position for a security node
     */
    calculateTorusPosition(entityId, valueContribution, networkSecurityMetric) {
        // In a real implementation, this would use 4D torus mathematics
        // For now, we'll return a simplified position
        const theta = (entityId % 1000) / 1000 * 2 * Math.PI;
        const phi = (valueContribution % 10000) / 10000 * 2 * Math.PI;
        const psi = (networkSecurityMetric * 100) / 100 * 2 * Math.PI;
        const omega = (valueContribution * networkSecurityMetric % 1000) / 1000 * 2 * Math.PI;
        return [theta, phi, psi, omega];
    }
    /**
     * Log a Mandelbrot recursion event
     */
    async logMandelbrotRecursion(recursionType, iterationCount, startValue, endValue, affectedSystems, userId) {
        // Calculate a stability metric (0-1) based on the recursion
        const stabilityMetric = 0.8 + (Math.random() * 0.15); // In a real system, this would be calculated
        await db_1.db.insert(recurve_schema_1.mandelbrotRecursionEvents).values({
            recursionType,
            iterationCount,
            startValue,
            endValue,
            affectedSystems,
            stabilityMetric: stabilityMetric.toString(),
            executionTimeMs: Math.floor(Math.random() * 100) + 50, // Sample execution time
            triggerReason: 'api_request',
            userId
        });
    }
    /**
     * Get a user's policy portfolio
     */
    async getUserPolicies(userId) {
        return await db_1.db.query.insurancePolicies.findMany({
            where: (0, drizzle_orm_1.eq)(recurve_schema_1.insurancePolicies.userId, userId),
            orderBy: (insurancePolicies, { desc }) => [desc(insurancePolicies.createdAt)]
        });
    }
    /**
     * Get a user's Recurve tokens
     */
    async getUserRecurveTokens(userId) {
        return await db_1.db.query.recurveTokens.findMany({
            where: (0, drizzle_orm_1.eq)(recurve_schema_1.recurveTokens.userId, userId),
            orderBy: (recurveTokens, { desc }) => [desc(recurveTokens.mintedAt)]
        });
    }
    /**
     * Get a user's fractal loans
     */
    async getUserFractalLoans(userId) {
        return await db_1.db.query.fractalLoans.findMany({
            where: (0, drizzle_orm_1.eq)(recurve_schema_1.fractalLoans.userId, userId),
            orderBy: (fractalLoans, { desc }) => [desc(fractalLoans.originationDate)]
        });
    }
    /**
     * Get a user's security nodes
     */
    async getUserSecurityNodes(userId) {
        return await db_1.db.query.torusSecurityNodes.findMany({
            where: (0, drizzle_orm_1.eq)(recurve_schema_1.torusSecurityNodes.userId, userId),
            orderBy: (torusSecurityNodes, { desc }) => [desc(torusSecurityNodes.lastVerified)]
        });
    }
    /**
     * Get network security metrics
     */
    async getNetworkSecurityMetrics() {
        // Get all active security nodes
        const nodes = await db_1.db.query.torusSecurityNodes.findMany({
            where: (0, drizzle_orm_1.eq)(recurve_schema_1.torusSecurityNodes.status, 'active')
        });
        // Calculate security metrics
        const totalNodes = nodes.length;
        const totalSecurityLevel = nodes.reduce((sum, node) => sum + node.securityLevel, 0);
        const avgRecursionDepth = nodes.reduce((sum, node) => sum + node.recursionDepth, 0) / (totalNodes || 1);
        // Get primary, secondary, and tertiary node counts
        const primaryNodes = nodes.filter(node => node.nodeType === recurve_schema_1.TorusNodeType.PRIMARY).length;
        const secondaryNodes = nodes.filter(node => node.nodeType === recurve_schema_1.TorusNodeType.SECONDARY).length;
        const tertiaryNodes = nodes.filter(node => node.nodeType === recurve_schema_1.TorusNodeType.TERTIARY).length;
        // Get network policy metrics
        const networkPolicies = await db_1.db.query.networkInsurancePolicies.findMany({
            where: (0, drizzle_orm_1.eq)(recurve_schema_1.networkInsurancePolicies.status, recurve_schema_1.InsurancePolicyStatus.ACTIVE)
        });
        const totalNetworkCoverage = networkPolicies.reduce((sum, policy) => sum + parseFloat(policy.faceValue), 0);
        return {
            nodeStats: {
                total: totalNodes,
                primary: primaryNodes,
                secondary: secondaryNodes,
                tertiary: tertiaryNodes
            },
            securityMetrics: {
                totalSecurityLevel,
                avgRecursionDepth,
                networkStability: Math.min(0.99, 0.7 + (totalSecurityLevel / 10000)),
                torusIntegrity: Math.min(0.99, 0.8 + (primaryNodes / 100))
            },
            policyStats: {
                totalNetworkCoverage,
                policyCount: networkPolicies.length
            }
        };
    }
    /**
     * Get the fractal reserve system status
     */
    async getFractalReserveStatus() {
        // Get all active tokens
        const tokens = await db_1.db.query.recurveTokens.findMany({
            where: (0, drizzle_orm_1.eq)(recurve_schema_1.recurveTokens.status, 'active')
        });
        // Get all active loans
        const loans = await db_1.db.query.fractalLoans.findMany({
            where: (0, drizzle_orm_1.eq)(recurve_schema_1.fractalLoans.status, recurve_schema_1.FractalLoanStatus.ACTIVE)
        });
        // Calculate key metrics
        const totalTokenValue = tokens.reduce((sum, token) => sum + parseFloat(token.tokenAmount), 0);
        const totalLoanValue = loans.reduce((sum, loan) => sum + parseFloat(loan.loanAmount), 0);
        const avgCollateralization = loans.reduce((sum, loan) => sum + parseFloat(loan.collateralPercentage), 0) / (loans.length || 1);
        // Get the latest recursion events
        const recentEvents = await db_1.db.query.mandelbrotRecursionEvents.findMany({
            orderBy: (events, { desc }) => [desc(events.timestamp)],
            limit: 10
        });
        const systemStability = recentEvents.length > 0
            ? recentEvents.reduce((sum, event) => sum + parseFloat(event.stabilityMetric), 0) / recentEvents.length
            : 0.9; // Default stability if no events
        return {
            tokenMetrics: {
                totalTokens: tokens.length,
                totalValue: totalTokenValue,
                tierDistribution: {
                    platinum: tokens.filter(t => t.tier === recurve_schema_1.RecurveTokenTier.PLATINUM).length,
                    gold: tokens.filter(t => t.tier === recurve_schema_1.RecurveTokenTier.GOLD).length,
                    silver: tokens.filter(t => t.tier === recurve_schema_1.RecurveTokenTier.SILVER).length,
                    bronze: tokens.filter(t => t.tier === recurve_schema_1.RecurveTokenTier.BRONZE).length
                }
            },
            loanMetrics: {
                totalLoans: loans.length,
                totalValue: totalLoanValue,
                avgCollateralization,
                collateralTypeDistribution: {
                    policy: loans.filter(l => l.collateralType === recurve_schema_1.FractalLoanCollateralType.POLICY).length,
                    token: loans.filter(l => l.collateralType === recurve_schema_1.FractalLoanCollateralType.TOKEN).length,
                    hybrid: loans.filter(l => l.collateralType === recurve_schema_1.FractalLoanCollateralType.HYBRID).length
                }
            },
            systemStability,
            lastRecalculation: recentEvents.length > 0 ? recentEvents[0].timestamp : new Date()
        };
    }
}
exports.RecurveFractalService = RecurveFractalService;
// Export a singleton instance
exports.recurveFractalService = new RecurveFractalService();
