"use strict";
/**
 * Financial Wellness Service
 *
 * Provides functionality for generating comprehensive financial wellness reports
 * for users based on their wallet data, transaction history, and other financial metrics.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.financialWellnessService = exports.FinancialWellnessService = void 0;
const db_1 = require("../db");
const schema_1 = require("../../shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
const storage_1 = require("../storage");
class FinancialWellnessService {
    /**
     * Generate a comprehensive financial wellness report for a user
     */
    async generateFinancialReport(userId) {
        try {
            // Get user information
            const user = await storage_1.storage.getUser(userId);
            if (!user) {
                throw new Error(`User with ID ${userId} not found`);
            }
            // Get all user wallets
            const userWallets = await storage_1.storage.getWalletsByUserId(userId);
            if (userWallets.length === 0) {
                throw new Error(`No wallets found for user with ID ${userId}`);
            }
            // Get wallet health scores
            const walletIds = userWallets.map(wallet => wallet.id);
            const healthScores = await storage_1.storage.getWalletHealthScoresByUserId(userId);
            // Create wallet summaries with their health scores and issues
            const walletSummaries = await this.createWalletSummaries(userWallets, healthScores);
            // Build the financial report
            const report = {
                userId: user.id,
                username: user.username,
                createdAt: new Date(),
                overallHealthScore: this.calculateOverallHealthScore(walletSummaries),
                walletSummary: walletSummaries,
                recommendations: await this.generateRecommendations(userId, walletSummaries),
                portfolioDistribution: await this.calculatePortfolioDistribution(userWallets),
                transactionSummary: await this.generateTransactionSummary(userId, walletIds),
                savingsOpportunities: await this.identifySavingsOpportunities(userId, walletIds),
                riskAssessment: await this.generateRiskAssessment(walletSummaries)
            };
            return report;
        }
        catch (error) {
            console.error("Error generating financial report:", error);
            throw new Error("Failed to generate financial wellness report");
        }
    }
    /**
     * Create wallet summaries with their health scores and issues
     */
    async createWalletSummaries(wallets, healthScores) {
        const walletSummaries = [];
        for (const wallet of wallets) {
            // Find the health score for this wallet
            const healthScore = healthScores.find(score => score.walletId === wallet.id);
            let issues = [];
            // If we have a health score, get the issues
            if (healthScore) {
                const walletIssues = await storage_1.storage.getWalletHealthIssuesByScoreId(healthScore.id);
                issues = walletIssues.map(issue => ({
                    id: issue.id,
                    category: issue.category,
                    severity: issue.severity,
                    title: issue.title,
                    description: issue.description,
                    recommendation: issue.recommendation,
                    resolved: issue.resolved
                }));
            }
            walletSummaries.push({
                walletId: wallet.id,
                name: wallet.name,
                chain: wallet.chain,
                address: wallet.address,
                balance: wallet.balance,
                dollarValue: parseFloat(wallet.dollarValue.toString()),
                percentChange: parseFloat(wallet.percentChange.toString()),
                healthScore: healthScore ? healthScore.overallScore : 50, // Default if no score
                issues
            });
        }
        return walletSummaries;
    }
    /**
     * Calculate overall health score from wallet summaries
     */
    calculateOverallHealthScore(walletSummaries) {
        if (walletSummaries.length === 0) {
            return 50; // Default
        }
        // Weight each wallet by its dollar value relative to the total portfolio
        const totalValue = walletSummaries.reduce((sum, wallet) => sum + wallet.dollarValue, 0);
        let weightedScoreSum = 0;
        for (const wallet of walletSummaries) {
            const walletWeight = totalValue > 0 ? wallet.dollarValue / totalValue : 1 / walletSummaries.length;
            weightedScoreSum += wallet.healthScore * walletWeight;
        }
        return Math.round(weightedScoreSum);
    }
    /**
     * Generate personalized recommendations based on health issues
     */
    async generateRecommendations(userId, walletSummaries) {
        const recommendations = [];
        // Collect all issues from all wallets
        const allIssues = walletSummaries.flatMap(wallet => wallet.issues);
        // Group issues by category
        const issuesByCategory = {};
        for (const issue of allIssues) {
            if (!issue.resolved) {
                if (!issuesByCategory[issue.category]) {
                    issuesByCategory[issue.category] = [];
                }
                issuesByCategory[issue.category].push(issue);
            }
        }
        // Generate category-specific recommendations
        for (const [category, issues] of Object.entries(issuesByCategory)) {
            // Sort issues by severity
            const sortedIssues = [...issues].sort((a, b) => {
                const severityMap = {
                    'critical': 4,
                    'high': 3,
                    'medium': 2,
                    'low': 1
                };
                return severityMap[b.severity] - severityMap[a.severity];
            });
            // Take the highest severity issue as the basis for a recommendation
            if (sortedIssues.length > 0) {
                const highestSeverityIssue = sortedIssues[0];
                recommendations.push({
                    category,
                    title: `Improve your ${category} score`,
                    description: `We found ${sortedIssues.length} ${category} issues, with the most critical being: ${highestSeverityIssue.title}`,
                    priority: highestSeverityIssue.severity,
                    potentialImpact: this.getImpactDescription(category, highestSeverityIssue.severity)
                });
            }
        }
        // Add portfolio diversification recommendation if needed
        if (walletSummaries.length > 0) {
            const chains = new Set(walletSummaries.map(w => w.chain));
            if (chains.size < 3) {
                recommendations.push({
                    category: 'diversification',
                    title: 'Diversify your portfolio across more chains',
                    description: `Your portfolio is currently concentrated in ${chains.size} blockchain(s). Consider diversifying across more chains to reduce risk.`,
                    priority: 'medium',
                    potentialImpact: 'Diversification can help protect your assets against chain-specific risks and market volatility.'
                });
            }
        }
        return recommendations;
    }
    /**
     * Calculate portfolio distribution across chains and token types
     */
    async calculatePortfolioDistribution(wallets) {
        // Calculate total portfolio value
        const totalValue = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.dollarValue.toString()), 0);
        // Group by chain
        const chainMap = new Map();
        for (const wallet of wallets) {
            const dollarValue = parseFloat(wallet.dollarValue.toString());
            chainMap.set(wallet.chain, (chainMap.get(wallet.chain) || 0) + dollarValue);
        }
        const byChain = Array.from(chainMap.entries()).map(([chain, value]) => ({
            chain,
            percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
            dollarValue: value
        }));
        // Group by token type
        const typeMap = new Map();
        for (const wallet of wallets) {
            const dollarValue = parseFloat(wallet.dollarValue.toString());
            typeMap.set(wallet.type, (typeMap.get(wallet.type) || 0) + dollarValue);
        }
        const byTokenType = Array.from(typeMap.entries()).map(([type, value]) => ({
            type,
            percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
            dollarValue: value
        }));
        return {
            byChain,
            byTokenType
        };
    }
    /**
     * Generate transaction summary for different time periods
     */
    async generateTransactionSummary(userId, walletIds) {
        // Get current date and calculate period start dates
        const now = new Date();
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        // Get transactions for different time periods
        const lastMonthTxs = await this.getTransactionsForPeriod(walletIds, oneMonthAgo, now);
        const lastThreeMonthsTxs = await this.getTransactionsForPeriod(walletIds, threeMonthsAgo, now);
        const lastYearTxs = await this.getTransactionsForPeriod(walletIds, oneYearAgo, now);
        return {
            lastMonth: this.summarizeTransactionPeriod("Last Month", lastMonthTxs),
            lastThreeMonths: this.summarizeTransactionPeriod("Last 3 Months", lastThreeMonthsTxs),
            lastYear: this.summarizeTransactionPeriod("Last Year", lastYearTxs)
        };
    }
    /**
     * Get transactions for a specific time period
     */
    async getTransactionsForPeriod(walletIds, startDate, endDate) {
        return await db_1.db.select()
            .from(schema_1.transactions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.transactions.walletId, walletIds), (0, drizzle_orm_1.gte)(schema_1.transactions.timestamp, startDate), (0, drizzle_orm_1.lte)(schema_1.transactions.timestamp, endDate)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.timestamp));
    }
    /**
     * Summarize transactions for a specific time period
     */
    summarizeTransactionPeriod(periodName, txs) {
        let inflow = 0;
        let outflow = 0;
        let largestTxAmount = 0;
        let largestTx = null;
        // Calculate inflow and outflow
        for (const tx of txs) {
            const amount = parseFloat(tx.amount);
            if (tx.type === 'receive') {
                inflow += amount;
            }
            else if (tx.type === 'send') {
                outflow += amount;
            }
            // Track largest transaction
            if (Math.abs(amount) > largestTxAmount) {
                largestTxAmount = Math.abs(amount);
                largestTx = tx;
            }
        }
        return {
            period: periodName,
            totalTransactions: txs.length,
            inflow: inflow,
            outflow: outflow,
            netChange: inflow - outflow,
            largestTransaction: largestTx ? {
                amount: largestTx.amount,
                type: largestTx.type,
                date: largestTx.timestamp
            } : {
                amount: '0',
                type: 'none',
                date: new Date()
            }
        };
    }
    /**
     * Identify potential savings opportunities
     */
    async identifySavingsOpportunities(userId, walletIds) {
        const opportunities = [];
        // Get all user transactions for analysis
        const allTxs = await db_1.db.select()
            .from(schema_1.transactions)
            .where((0, drizzle_orm_1.inArray)(schema_1.transactions.walletId, walletIds))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.timestamp));
        // Look for high gas fee transactions
        let totalGasFees = 0;
        let numberOfTxsWithGas = 0;
        for (const tx of allTxs) {
            if (tx.fee) {
                const fee = parseFloat(tx.fee);
                totalGasFees += fee;
                numberOfTxsWithGas++;
            }
        }
        // Calculate average gas fee
        const avgGasFee = numberOfTxsWithGas > 0 ? totalGasFees / numberOfTxsWithGas : 0;
        // Add gas optimization opportunity if average is high
        if (avgGasFee > 5) { // Threshold in dollars
            opportunities.push({
                category: 'gas',
                title: 'Optimize transaction timing for lower gas fees',
                description: `Your average gas fee of $${avgGasFee.toFixed(2)} per transaction is higher than optimal. Consider timing your transactions for periods of lower network congestion.`,
                estimatedSavings: avgGasFee * 0.3 * 12, // Estimated annual savings
                implementationDifficulty: 'medium'
            });
        }
        // Add staking opportunity if there are significant unused funds
        const userWallets = await storage_1.storage.getWalletsByUserId(userId);
        const totalBalance = userWallets.reduce((sum, wallet) => sum + parseFloat(wallet.dollarValue.toString()), 0);
        if (totalBalance > 1000) { // Threshold in dollars
            opportunities.push({
                category: 'yield',
                title: 'Earn yield on idle assets',
                description: `You have approximately $${totalBalance.toFixed(2)} that could be earning yield through staking or DeFi protocols.`,
                estimatedSavings: totalBalance * 0.05, // Estimate 5% APY
                implementationDifficulty: 'easy'
            });
        }
        return opportunities;
    }
    /**
     * Generate risk assessment based on wallet health and portfolio
     */
    async generateRiskAssessment(walletSummaries) {
        // Calculate security risk based on wallet health scores
        const securityScores = walletSummaries.map(w => w.healthScore);
        const avgSecurityScore = securityScores.length > 0
            ? securityScores.reduce((sum, score) => sum + score, 0) / securityScores.length
            : 50;
        const securityRisk = avgSecurityScore > 75 ? 'low' : avgSecurityScore > 50 ? 'medium' : 'high';
        // Calculate concentration risk
        const chains = walletSummaries.map(w => w.chain);
        const uniqueChains = new Set(chains).size;
        const concentrationRisk = uniqueChains >= 3 ? 'low' : uniqueChains === 2 ? 'medium' : 'high';
        // Calculate volatility risk based on percent changes
        const avgPercentChange = walletSummaries.length > 0
            ? Math.abs(walletSummaries.reduce((sum, w) => sum + w.percentChange, 0) / walletSummaries.length)
            : 0;
        const volatilityRisk = avgPercentChange < 5 ? 'low' : avgPercentChange < 15 ? 'medium' : 'high';
        // Determine overall risk (weighted combination of the three factors)
        const riskScores = {
            'low': 1,
            'medium': 2,
            'high': 3
        };
        const combinedRiskScore = (riskScores[securityRisk] * 0.4 +
            riskScores[concentrationRisk] * 0.3 +
            riskScores[volatilityRisk] * 0.3);
        const overallRisk = combinedRiskScore < 1.7 ? 'low' : combinedRiskScore < 2.4 ? 'medium' : 'high';
        // Generate explanation text
        let explanation = `Your overall risk assessment is ${overallRisk.toUpperCase()}. `;
        explanation += `Security risk is ${securityRisk.toUpperCase()} `;
        if (securityRisk === 'high') {
            explanation += `due to several security vulnerabilities in your wallets. `;
        }
        else if (securityRisk === 'medium') {
            explanation += `with some security improvements recommended. `;
        }
        else {
            explanation += `with good security practices in place. `;
        }
        explanation += `Concentration risk is ${concentrationRisk.toUpperCase()} `;
        if (concentrationRisk === 'high') {
            explanation += `as your assets are concentrated in a single blockchain. `;
        }
        else if (concentrationRisk === 'medium') {
            explanation += `with moderate diversification across chains. `;
        }
        else {
            explanation += `with good diversification across multiple chains. `;
        }
        explanation += `Volatility risk is ${volatilityRisk.toUpperCase()} `;
        if (volatilityRisk === 'high') {
            explanation += `with significant recent price movements in your portfolio.`;
        }
        else if (volatilityRisk === 'medium') {
            explanation += `with moderate price fluctuations in your holdings.`;
        }
        else {
            explanation += `with relatively stable assets in your portfolio.`;
        }
        return {
            overallRisk,
            securityRisk,
            concentrationRisk,
            volatilityRisk,
            explanation
        };
    }
    /**
     * Get impact description based on category and severity
     */
    getImpactDescription(category, severity) {
        const impacts = {
            'security': {
                'critical': 'Addressing this could prevent potential loss of funds or unauthorized access.',
                'high': 'This improvement will significantly strengthen your wallet security.',
                'medium': 'This change will enhance your overall security posture.',
                'low': 'A minor security enhancement with limited but positive impact.'
            },
            'diversification': {
                'critical': 'Urgent rebalancing needed to protect against catastrophic portfolio risk.',
                'high': 'Significant diversification could protect against major market swings.',
                'medium': 'Better diversification will help reduce overall portfolio volatility.',
                'low': 'Minor diversification improvements would slightly optimize your portfolio.'
            },
            'activity': {
                'critical': 'Immediate attention needed to restore normal account operations.',
                'high': 'Addressing this would significantly improve your transaction efficiency.',
                'medium': 'This change would optimize your regular transaction patterns.',
                'low': 'A small improvement to your transaction habits.'
            },
            'gasOptimization': {
                'critical': 'You', re, losing, significant, funds, to, excessive, gas, fees, : ., ',: 'high', 'Optimizing gas usage could save you substantial amounts.': ,
                'medium': 'Moderate gas savings possible with these changes.',
                'low': 'Minor gas optimizations available.'
            }
        };
        return impacts[category]?.[severity] ||
            'Addressing this issue will improve your overall financial wellness.';
    }
}
exports.FinancialWellnessService = FinancialWellnessService;
// Export service instance
exports.financialWellnessService = new FinancialWellnessService();
