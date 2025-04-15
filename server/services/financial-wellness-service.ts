import { db } from '../db';
import {
  users,
  wallets,
  // Although we import sharedTransactions, we use our local table definition.
  transactions as sharedTransactions,
  walletHealthScores,
  walletHealthIssues,
  payments,
  User,
  Wallet,
  Transaction,
  WalletHealthScore,
  WalletHealthIssue
} from '../../shared/schema';
import { eq, desc, inArray, sql, and, gte, lte } from 'drizzle-orm';
// Import required helpers from Drizzle ORM's pg-core module.
import { pgTable, serial, integer, decimal, text, date } from 'drizzle-orm/pg-core';

// =============================================================================
// Types for the Financial Wellness Report
// =============================================================================

export interface FinancialReport {
  userId: number;
  username: string;
  createdAt: Date;
  overallHealthScore: number; // 0-100
  walletSummary: WalletSummary[];
  recommendations: Recommendation[];
  portfolioDistribution: PortfolioDistribution;
  transactionSummary: TransactionSummary;
  savingsOpportunities: SavingsOpportunity[];
  riskAssessment: RiskAssessment;
  historicalHealthScores?: HistoricalHealthScore[];
}

export interface WalletSummary {
  walletId: number;
  name: string;
  chain: string;
  address: string;
  balance: string;
  dollarValue: number;
  percentChange: number;
  healthScore: number; // 0-100
  issues: WalletIssue[];
}

export interface WalletIssue {
  id: number;
  category: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string;
  resolved: boolean;
}

export interface Recommendation {
  category: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  potentialImpact: string;
}

export interface PortfolioDistribution {
  byChain: {
    chain: string;
    percentage: number;
    dollarValue: number;
  }[];
  byTokenType: {
    type: string;
    percentage: number;
    dollarValue: number;
  }[];
}

export interface TransactionSummary {
  lastMonth: TransactionPeriodSummary;
  lastThreeMonths: TransactionPeriodSummary;
  lastYear: TransactionPeriodSummary;
}

export interface TransactionPeriodSummary {
  period: string;
  totalTransactions: number;
  inflow: number;
  outflow: number;
  netChange: number;
  largestTransaction: {
    amount: string;
    type: string;
    date: Date;
  };
}

export interface SavingsOpportunity {
  category: string;
  title: string;
  description: string;
  estimatedSavings: number;
  implementationDifficulty: 'easy' | 'medium' | 'hard';
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  securityRisk: 'low' | 'medium' | 'high';
  concentrationRisk: 'low' | 'medium' | 'high';
  volatilityRisk: 'low' | 'medium' | 'high';
  explanation: string;
}

export interface HistoricalHealthScore {
  walletId: number;
  date: Date;
  healthScore: number;
}

// =============================================================================
// Local Table Definition for Transactions (Renamed to avoid conflicts)
// =============================================================================

export const transactionsTable = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  walletId: integer('wallet_id').notNull(),
  amount: decimal('amount').notNull(),
  type: text('type').notNull(),
  // Use "timestamp" instead of "date" to match the expected Transaction type
  timestamp: date('timestamp').notNull()
  // Add additional columns as needed.
});

// =============================================================================
// FinancialWellnessService Implementation
// =============================================================================

export class FinancialWellnessService {

  /**
   * Generate a comprehensive financial wellness report for a user.
   */
  async generateFinancialReport(userId: number): Promise<FinancialReport> {
    try {
      // Get user information. Use our storageInstance to guarantee correct type.
      const user = await storageInstance.getUser(userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Retrieve all user wallets.
      const userWallets: Wallet[] = await storageInstance.getWalletsByUserId(userId);
      if (userWallets.length === 0) {
        throw new Error(`No wallets found for user with ID ${userId}`);
      }

      // Get wallet health scores.
      const walletIds = userWallets.map(wallet => wallet.id);
      const healthScores: WalletHealthScore[] = await storageInstance.getWalletHealthScoresByUserId(userId);

      // Fetch historical health scores.
      const historicalScores: HistoricalHealthScore[] = await storageInstance.getWalletHealthScoresHistory(userId);

      // Create wallet summaries with associated health scores and issues.
      const walletSummaries = await this.createWalletSummaries(userWallets, healthScores);

      // Build the financial report.
      const report: FinancialReport = {
        userId: user.id,
        username: user.username,
        createdAt: new Date(),
        overallHealthScore: this.calculateOverallHealthScore(walletSummaries),
        walletSummary: walletSummaries,
        recommendations: await this.generateRecommendations(userId, walletSummaries),
        portfolioDistribution: await this.calculatePortfolioDistribution(userWallets),
        transactionSummary: await this.generateTransactionSummary(userId, walletIds),
        savingsOpportunities: await this.identifySavingsOpportunities(userId, walletIds),
        riskAssessment: await this.generateRiskAssessment(walletSummaries),
        historicalHealthScores: historicalScores
      };

      return report;
    } catch (error) {
      console.error("Error generating financial report:", error);
      throw new Error("Failed to generate financial wellness report");
    }
  }

  /**
   * Create wallet summaries with their health scores and issues.
   */
  private async createWalletSummaries(
    wallets: Wallet[],
    healthScores: WalletHealthScore[]
  ): Promise<WalletSummary[]> {
    const walletSummaries: WalletSummary[] = [];

    for (const wallet of wallets) {
      // Find the health score for the wallet.
      const healthScore = healthScores.find(score => score.walletId === wallet.id);
      let issues: WalletIssue[] = [];

      // If a health score exists, retrieve its health issues.
      if (healthScore) {
        const walletIssues: WalletHealthIssue[] = await storageInstance.getWalletHealthIssuesByScoreId(healthScore.id);
        issues = walletIssues.map((issue: WalletHealthIssue) => ({
          id: issue.id,
          category: issue.category,
          severity: issue.severity,
          title: issue.title,
          description: issue.description,
          recommendation: issue.recommendation,
          // Convert potential null value to a definite boolean.
          resolved: issue.resolved ?? false
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
        healthScore: healthScore ? healthScore.overallScore : 50, // Default if missing.
        issues
      });
    }

    return walletSummaries;
  }

  /**
   * Calculate the overall health score from wallet summaries, weighting each wallet by its relative value.
   */
  private calculateOverallHealthScore(walletSummaries: WalletSummary[]): number {
    if (walletSummaries.length === 0) {
      return 50; // Default value.
    }

    const totalValue = walletSummaries.reduce((sum, wallet) => sum + wallet.dollarValue, 0);
    let weightedScoreSum = 0;
    for (const wallet of walletSummaries) {
      const walletWeight = totalValue > 0 ? wallet.dollarValue / totalValue : 1 / walletSummaries.length;
      weightedScoreSum += wallet.healthScore * walletWeight;
    }

    return Math.round(weightedScoreSum);
  }

  /**
   * Generate personalized recommendations based on wallet issues.
   */
  private async generateRecommendations(
    userId: number,
    walletSummaries: WalletSummary[]
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Gather all unresolved issues.
    const allIssues = walletSummaries.flatMap(wallet => wallet.issues);

    // Group issues by category.
    const issuesByCategory: Record<string, WalletIssue[]> = {};
    for (const issue of allIssues) {
      if (!issue.resolved) {
        if (!issuesByCategory[issue.category]) {
          issuesByCategory[issue.category] = [];
        }
        issuesByCategory[issue.category].push(issue);
      }
    }

    // Create recommendations for each category.
    for (const [category, issues] of Object.entries(issuesByCategory)) {
      // Sort by severity (higher severity first).
      const sortedIssues = [...issues].sort((a: WalletIssue, b: WalletIssue) => {
        const severityMap: Record<string, number> = {
          'critical': 4,
          'high': 3,
          'medium': 2,
          'low': 1
        };
        return severityMap[b.severity] - severityMap[a.severity];
      });

      if (sortedIssues.length > 0) {
        const highestSeverityIssue = sortedIssues[0];
        recommendations.push({
          category,
          title: `Improve your ${category} score`,
          description: `We found ${sortedIssues.length} ${category} issues, with the most critical being: ${highestSeverityIssue.title}`,
          priority: highestSeverityIssue.severity as 'low' | 'medium' | 'high' | 'critical',
          potentialImpact: this.getImpactDescription(category, highestSeverityIssue.severity)
        });
      }
    }

    // Example: Add a diversification recommendation.
    if (walletSummaries.length > 0) {
      recommendations.push({
        category: 'diversification',
        title: 'Consider diversifying your portfolio',
        description: 'We recommend diversifying your holdings to reduce risk exposure to single assets.',
        priority: 'medium',
        potentialImpact: 'Diversification can reduce potential loss during market downturns.'
      });
    }

    return recommendations;
  }

  /**
   * Provide a brief explanation for the impact of addressing an issue.
   */
  private getImpactDescription(category: string, severity: string): string {
    switch (category) {
      case 'security':
        return severity === 'critical'
          ? 'This issue poses a major risk to your assets. Immediate action is needed.'
          : 'Security improvements will help protect your assets from external threats.';
      case 'diversification':
        return 'Diversifying your portfolio can reduce risk and improve returns.';
      case 'optimization':
        return 'Optimizing your portfolio can help you better allocate your resources for growth.';
      default:
        return 'Addressing this issue will improve your financial security.';
    }
  }

  /**
   * Calculate the portfolio distribution by chain and by token type.
   */
  private async calculatePortfolioDistribution(wallets: Wallet[]): Promise<PortfolioDistribution> {
    const byChain = new Map<string, number>();
    const byTokenType = new Map<string, number>();

    for (const wallet of wallets) {
      const balance = parseFloat(wallet.dollarValue.toString());
      // Group by chain.
      byChain.set(wallet.chain, (byChain.get(wallet.chain) || 0) + balance);
      // Use wallet.type (if available) or "unknown" for token type.
      const tokenType = wallet.type || "unknown";
      byTokenType.set(tokenType, (byTokenType.get(tokenType) || 0) + balance);
    }

    const totalPortfolioValue = wallets.reduce(
      (sum, wallet) => sum + parseFloat(wallet.dollarValue.toString()),
      0
    );

    const chainDistribution = Array.from(byChain.entries()).map(([chain, dollarValue]) => ({
      chain,
      percentage: (dollarValue / totalPortfolioValue) * 100,
      dollarValue
    }));

    const tokenTypeDistribution = Array.from(byTokenType.entries()).map(([type, dollarValue]) => ({
      type,
      percentage: (dollarValue / totalPortfolioValue) * 100,
      dollarValue
    }));

    return {
      byChain: chainDistribution,
      byTokenType: tokenTypeDistribution
    };
  }

  /**
   * Generate a summary of transactions for defined periods.
   */
  private async generateTransactionSummary(userId: number, walletIds: number[]): Promise<TransactionSummary> {
    const summaries: TransactionSummary = {
      lastMonth: await this.getTransactionPeriodSummary(userId, walletIds, 'last_month'),
      lastThreeMonths: await this.getTransactionPeriodSummary(userId, walletIds, 'last_three_months'),
      lastYear: await this.getTransactionPeriodSummary(userId, walletIds, 'last_year')
    };
    return summaries;
  }

  /**
   * Get a transaction period summary for a given period.
   */
  private async getTransactionPeriodSummary(
    userId: number,
    walletIds: number[],
    period: string
  ): Promise<TransactionPeriodSummary> {
    const startDate = this.getStartDateForPeriod(period);
    const transactions: Transaction[] = await storageInstance.getTransactionsForUserAndPeriod(userId, walletIds, startDate);

    const inflow: number = transactions
      .filter((tx: Transaction) => tx.type === 'inflow')
      .reduce((sum: number, tx: Transaction) => sum + Number(tx.amount), 0);
    const outflow: number = transactions
      .filter((tx: Transaction) => tx.type === 'outflow')
      .reduce((sum: number, tx: Transaction) => sum + Number(tx.amount), 0);

    return {
      period,
      totalTransactions: transactions.length,
      inflow,
      outflow,
      netChange: inflow - outflow,
      largestTransaction: this.getLargestTransaction(transactions)
    };
  }

  /**
   * Get the start date for a given period.
   */
  private getStartDateForPeriod(period: string): Date {
    const today = new Date();
    let startDate: Date;

    switch (period) {
      case 'last_month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        break;
      case 'last_three_months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        break;
      case 'last_year':
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        break;
      default:
        startDate = new Date();
    }

    return startDate;
  }

  /**
   * Determine the largest transaction from a list.
   */
  private getLargestTransaction(transactions: Transaction[]): { amount: string; type: string; date: Date } {
    if (transactions.length === 0) {
      return { amount: '0', type: 'none', date: new Date() };
    }
    const largestTx = transactions.reduce((prev: Transaction, current: Transaction) =>
      Number(prev.amount) > Number(current.amount) ? prev : current
    );
    return {
      amount: largestTx.amount.toString(),
      type: largestTx.type,
      // Ensure the timestamp is converted to a Date.
      date: largestTx.timestamp ? new Date(largestTx.timestamp) : new Date()
    };
  }

  /**
   * Dummy implementation: Identify savings opportunities.
   */
  private async identifySavingsOpportunities(
    userId: number,
    walletIds: number[]
  ): Promise<SavingsOpportunity[]> {
    // Replace with your own logic.
    return [];
  }

  /**
   * Dummy implementation: Generate a risk assessment for the portfolio.
   */
  private async generateRiskAssessment(walletSummaries: WalletSummary[]): Promise<RiskAssessment> {
    // Replace with your own risk assessment logic.
    return {
      overallRisk: 'low',
      securityRisk: 'low',
      concentrationRisk: 'low',
      volatilityRisk: 'low',
      explanation: 'Your portfolio shows low risk across security, concentration, and volatility factors.'
    };
  }
}

// =============================================================================
// Storage Wrapper with Missing Methods Implemented
// =============================================================================

export class StorageWrapper {
  // These methods currently contain dummy implementations.
  // Replace them with your actual database query logic.

  async getUser(userId: number): Promise<User | null> {
    // Ensure this never returns undefined.
    return null;
  }

  async getWalletsByUserId(userId: number): Promise<Wallet[]> {
    return [];
  }

  async getWalletHealthScoresByUserId(userId: number): Promise<WalletHealthScore[]> {
    return [];
  }

  async getWalletHealthScoresHistory(userId: number): Promise<HistoricalHealthScore[]> {
    return [];
  }

  async getWalletHealthIssuesByScoreId(scoreId: number): Promise<WalletHealthIssue[]> {
    return [];
  }

  /**
   * Fetch transactions for a user and a specific period.
   * The results are mapped to include additional properties expected by the Transaction type.
   */
  async getTransactionsForUserAndPeriod(
    userId: number,
    walletIds: number[],
    startDate: Date
  ): Promise<Transaction[]> {
    const rows: any[] = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.userId, userId),
          inArray(transactionsTable.walletId, walletIds),
          gte(transactionsTable.timestamp, startDate.toISOString())
        )
      );
  
    return rows.map((tx: any) => ({
      id: tx.id,
      walletId: tx.walletId,
      amount: tx.amount?.toString() ?? '0',
      type: tx.type ?? 'unknown',
      timestamp: tx.timestamp ? new Date(tx.timestamp) : null,
      txHash: tx.txHash ?? '',
      tokenSymbol: tx.tokenSymbol ?? '',
      fromAddress: tx.fromAddress ?? null,
      toAddress: tx.toAddress ?? null,
      status: tx.status ?? '',
      fee: tx.fee?.toString() ?? null,
      blockNumber: tx.blockNumber ?? 0,
      aiVerified: tx.aiVerified ?? false,
      plainDescription: tx.plainDescription ?? '',
      isLayer2: tx.isLayer2 ?? false,
      layer2Type: tx.layer2Type ?? '',
      layer2Data: tx.layer2Data ?? null
    }));
  }
}

// =============================================================================
// Export a Singleton Instance of StorageWrapper
// =============================================================================

export const storageInstance = new StorageWrapper();
export default FinancialWellnessService;
// Removed redundant export of transactionsTable as it is already exported earlier.