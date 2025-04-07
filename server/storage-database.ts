/**
 * Database Storage implementation for the server.
 * This module implements the IStorage interface using Drizzle ORM.
 */

import bcrypt from 'bcryptjs';
import * as schema from '../shared/schema';
import { db } from './db';
import { eq, desc, and, or, gte, lte, isNull, asc, sql } from 'drizzle-orm';
import { IStorage } from './storage';
import { 
  users, wallets, transactions, smartContracts, aiMonitoringLogs, cidEntries,
  paymentMethods, payments, userApiKeys, mysterionTrainingData,
  bridgeConfigurations, bridgeValidators, bridgeSupportedTokens, bridgeTransactions,
  insurancePolicies, recurveTokens, fractalLoans, torusSecurityNodes, 
  networkInsurancePolicies, mandelbrotRecursionEvents
  // Temporarily commented out to resolve circular dependency
  // AI Training tables
  // aiTrainingData, aiTrainingJobs, aiTrainingContributors,
  // TrainingFeedbackType, TrainingProcessingStatus,
  // AiTrainingData, InsertAiTrainingData,
  // AiTrainingJob, InsertAiTrainingJob,
  // AiTrainingContributor, InsertAiTrainingContributor
} from '../shared/schema';

/**
 * DatabaseStorage implementation using Drizzle ORM
 */
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<schema.User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: number): Promise<schema.User | undefined> {
    return this.getUser(id);
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: schema.InsertUser): Promise<schema.User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<schema.User>): Promise<schema.User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserLastLogin(id: number): Promise<schema.User | undefined> {
    const [user] = await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async verifyUserPassword(username: string, password: string): Promise<schema.User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    return passwordMatch ? user : null;
  }

  async getTrustMembers(): Promise<schema.User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.isTrustMember, true));
  }

  async setUserAsTrustMember(id: number, level: string): Promise<schema.User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        isTrustMember: true,
        trustMemberSince: new Date(),
        trustMemberLevel: level,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async isTrustMember(id: number): Promise<boolean> {
    const user = await this.getUser(id);
    return user?.isTrustMember || false;
  }

  // Wallet methods
  async getWallet(id: number): Promise<schema.Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet;
  }

  async getWalletsByUserId(userId: number): Promise<schema.Wallet[]> {
    return db.select().from(wallets).where(eq(wallets.userId, userId));
  }

  async createWallet(insertWallet: schema.InsertWallet): Promise<schema.Wallet> {
    const [wallet] = await db.insert(wallets).values(insertWallet).returning();
    return wallet;
  }

  async updateWalletBalance(id: number, balance: string): Promise<schema.Wallet | undefined> {
    const [wallet] = await db
      .update(wallets)
      .set({ balance })
      .where(eq(wallets.id, id))
      .returning();
    return wallet;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<schema.Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getTransactionsByWalletId(walletId: number): Promise<schema.Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.walletId, walletId))
      .orderBy(desc(transactions.timestamp));
  }

  async getRecentTransactions(userId: number, limit: number): Promise<schema.Transaction[]> {
    // Get wallets of the user
    const userWallets = await this.getWalletsByUserId(userId);
    if (userWallets.length === 0) return [];

    // Get transactions for all wallets of the user
    return db
      .select()
      .from(transactions)
      .where(
        or(...userWallets.map(wallet => eq(transactions.walletId, wallet.id)))
      )
      .orderBy(desc(transactions.timestamp))
      .limit(limit);
  }

  async createTransaction(insertTransaction: schema.InsertTransaction): Promise<schema.Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async getLayer2Transactions(userId: number, layer2Type?: string): Promise<schema.Transaction[]> {
    // Get wallets of the user
    const userWallets = await this.getWalletsByUserId(userId);
    if (userWallets.length === 0) return [];

    // Query builder base
    let query = db
      .select()
      .from(transactions)
      .where(
        and(
          or(...userWallets.map(wallet => eq(transactions.walletId, wallet.id))),
          eq(transactions.isLayer2, true)
        )
      );

    // Add layer2Type filter if provided
    if (layer2Type) {
      query = query.where(eq(transactions.layer2Type, layer2Type));
    }

    return query.orderBy(desc(transactions.timestamp));
  }

  async updateTransactionDescription(id: number, description: string): Promise<schema.Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ plainDescription: description })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async updateTransactionLayer2Info(
    id: number,
    isLayer2: boolean,
    layer2Type?: string,
    layer2Data?: Record<string, any>
  ): Promise<schema.Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({
        isLayer2,
        layer2Type,
        layer2Data
      })
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  // Payment methods
  async getPayment(id: number): Promise<schema.Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentsByUserId(userId: number): Promise<schema.Payment[]> {
    return db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  async getPaymentsByProviderPaymentId(providerPaymentId: string): Promise<schema.Payment[]> {
    return db
      .select()
      .from(payments)
      .where(eq(payments.providerPaymentId, providerPaymentId));
  }

  async createPayment(payment: schema.InsertPayment): Promise<schema.Payment> {
    const [result] = await db.insert(payments).values(payment).returning();
    return result;
  }

  async updatePaymentStatus(id: number, status: string, processedAt?: Date): Promise<schema.Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set({
        status,
        processedAt: processedAt || new Date()
      })
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  // User API Keys
  async getUserApiKey(id: number): Promise<schema.UserApiKey | undefined> {
    const [key] = await db.select().from(userApiKeys).where(eq(userApiKeys.id, id));
    return key;
  }

  async getUserApiKeysByUserId(userId: number): Promise<schema.UserApiKey[]> {
    return db
      .select()
      .from(userApiKeys)
      .where(eq(userApiKeys.userId, userId))
      .orderBy(desc(userApiKeys.createdAt));
  }

  async getUserApiKeysByService(userId: number, service: string): Promise<schema.UserApiKey[]> {
    return db
      .select()
      .from(userApiKeys)
      .where(
        and(
          eq(userApiKeys.userId, userId),
          eq(userApiKeys.service, service)
        )
      )
      .orderBy(desc(userApiKeys.createdAt));
  }

  async createUserApiKey(insertUserApiKey: schema.InsertUserApiKey): Promise<schema.UserApiKey> {
    const [key] = await db.insert(userApiKeys).values(insertUserApiKey).returning();
    return key;
  }

  async updateUserApiKeyStatus(id: number, isActive: boolean): Promise<schema.UserApiKey | undefined> {
    const [key] = await db
      .update(userApiKeys)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(userApiKeys.id, id))
      .returning();
    return key;
  }

  async updateUserApiKeyTrainingStatus(id: number, isTrainingEnabled: boolean): Promise<schema.UserApiKey | undefined> {
    const [key] = await db
      .update(userApiKeys)
      .set({ isTrainingEnabled, updatedAt: new Date() })
      .where(eq(userApiKeys.id, id))
      .returning();
    return key;
  }

  async incrementUserApiKeyUsage(id: number): Promise<schema.UserApiKey | undefined> {
    const [key] = await db
      .update(userApiKeys)
      .set({
        usageCount: sql`${userApiKeys.usageCount} + 1`,
        lastUsed: new Date()
      })
      .where(eq(userApiKeys.id, id))
      .returning();
    return key;
  }

  async deleteUserApiKey(id: number): Promise<boolean> {
    const result = await db
      .delete(userApiKeys)
      .where(eq(userApiKeys.id, id));
    return true; // Return success since we don't have a result count
  }

  // Mysterion Training Data
  async getMysterionTrainingData(id: number): Promise<schema.MysterionTrainingData | undefined> {
    const [data] = await db.select().from(mysterionTrainingData).where(eq(mysterionTrainingData.id, id));
    return data;
  }

  async getMysterionTrainingDataByApiKeyId(apiKeyId: number): Promise<schema.MysterionTrainingData[]> {
    return db
      .select()
      .from(mysterionTrainingData)
      .where(eq(mysterionTrainingData.apiKeyId, apiKeyId))
      .orderBy(desc(mysterionTrainingData.createdAt));
  }

  async createMysterionTrainingData(insertTrainingData: schema.InsertMysterionTrainingData): Promise<schema.MysterionTrainingData> {
    const [data] = await db.insert(mysterionTrainingData).values(insertTrainingData).returning();
    return data;
  }

  async updateMysterionTrainingDataStatus(id: number, status: string, notes?: string): Promise<schema.MysterionTrainingData | undefined> {
    const [data] = await db
      .update(mysterionTrainingData)
      .set({
        status,
        notes: notes || mysterionTrainingData.notes,
        updatedAt: new Date()
      })
      .where(eq(mysterionTrainingData.id, id))
      .returning();
    return data;
  }

  async updateMysterionTrainingDataPoints(id: number, points: number): Promise<schema.MysterionTrainingData | undefined> {
    const [data] = await db
      .update(mysterionTrainingData)
      .set({
        singPoints: points,
        updatedAt: new Date()
      })
      .where(eq(mysterionTrainingData.id, id))
      .returning();
    return data;
  }

  // Multi-Chain Bridge methods

  // Bridge Configuration
  async getBridgeConfiguration(id: number): Promise<schema.BridgeConfiguration | undefined> {
    const [config] = await db.select().from(bridgeConfigurations).where(eq(bridgeConfigurations.id, id));
    return config;
  }

  async getBridgeConfigurations(status?: schema.BridgeStatus): Promise<schema.BridgeConfiguration[]> {
    if (status) {
      return db
        .select()
        .from(bridgeConfigurations)
        .where(eq(bridgeConfigurations.status, status));
    }
    return db.select().from(bridgeConfigurations);
  }

  async getBridgeConfigurationByNetworks(sourceNetwork: string, targetNetwork: string): Promise<schema.BridgeConfiguration | undefined> {
    const [config] = await db
      .select()
      .from(bridgeConfigurations)
      .where(
        and(
          eq(bridgeConfigurations.sourceNetwork, sourceNetwork),
          eq(bridgeConfigurations.targetNetwork, targetNetwork),
          eq(bridgeConfigurations.status, schema.BridgeStatus.ACTIVE)
        )
      );
    return config;
  }

  async createBridgeConfiguration(config: schema.InsertBridgeConfiguration): Promise<schema.BridgeConfiguration> {
    const [result] = await db.insert(bridgeConfigurations).values(config).returning();
    return result;
  }

  async updateBridgeConfigurationStatus(id: number, status: schema.BridgeStatus): Promise<schema.BridgeConfiguration | undefined> {
    const [config] = await db
      .update(bridgeConfigurations)
      .set({ status, updatedAt: new Date() })
      .where(eq(bridgeConfigurations.id, id))
      .returning();
    return config;
  }

  async updateBridgeConfiguration(id: number, updates: Partial<schema.BridgeConfiguration>): Promise<schema.BridgeConfiguration | undefined> {
    const [config] = await db
      .update(bridgeConfigurations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bridgeConfigurations.id, id))
      .returning();
    return config;
  }

  // Bridge Validators
  async getBridgeValidator(id: number): Promise<schema.BridgeValidator | undefined> {
    const [validator] = await db.select().from(bridgeValidators).where(eq(bridgeValidators.id, id));
    return validator;
  }

  async getBridgeValidatorsByBridgeId(bridgeId: number): Promise<schema.BridgeValidator[]> {
    return db
      .select()
      .from(bridgeValidators)
      .where(eq(bridgeValidators.bridgeId, bridgeId));
  }

  async createBridgeValidator(validator: schema.InsertBridgeValidator): Promise<schema.BridgeValidator> {
    const [result] = await db.insert(bridgeValidators).values(validator).returning();
    return result;
  }

  async updateBridgeValidatorStatus(id: number, status: string): Promise<schema.BridgeValidator | undefined> {
    const [validator] = await db
      .update(bridgeValidators)
      .set({ status, updatedAt: new Date() })
      .where(eq(bridgeValidators.id, id))
      .returning();
    return validator;
  }

  async updateBridgeValidatorHeartbeat(id: number): Promise<schema.BridgeValidator | undefined> {
    const [validator] = await db
      .update(bridgeValidators)
      .set({ lastHeartbeat: new Date(), updatedAt: new Date() })
      .where(eq(bridgeValidators.id, id))
      .returning();
    return validator;
  }

  async updateBridgeValidatorReputation(id: number, reputation: number): Promise<schema.BridgeValidator | undefined> {
    const [validator] = await db
      .update(bridgeValidators)
      .set({ reputation, updatedAt: new Date() })
      .where(eq(bridgeValidators.id, id))
      .returning();
    return validator;
  }

  // Bridge Supported Tokens
  async getBridgeSupportedToken(id: number): Promise<schema.BridgeSupportedToken | undefined> {
    const [token] = await db.select().from(bridgeSupportedTokens).where(eq(bridgeSupportedTokens.id, id));
    return token;
  }

  async getBridgeSupportedTokensByBridgeId(bridgeId: number): Promise<schema.BridgeSupportedToken[]> {
    return db
      .select()
      .from(bridgeSupportedTokens)
      .where(eq(bridgeSupportedTokens.bridgeId, bridgeId));
  }

  async getBridgeSupportedTokenBySymbol(bridgeId: number, tokenSymbol: string): Promise<schema.BridgeSupportedToken | undefined> {
    const [token] = await db
      .select()
      .from(bridgeSupportedTokens)
      .where(
        and(
          eq(bridgeSupportedTokens.bridgeId, bridgeId),
          eq(bridgeSupportedTokens.tokenSymbol, tokenSymbol)
        )
      );
    return token;
  }

  async createBridgeSupportedToken(token: schema.InsertBridgeSupportedToken): Promise<schema.BridgeSupportedToken> {
    const [result] = await db.insert(bridgeSupportedTokens).values(token).returning();
    return result;
  }

  async updateBridgeSupportedTokenStatus(id: number, isEnabled: boolean): Promise<schema.BridgeSupportedToken | undefined> {
    const [token] = await db
      .update(bridgeSupportedTokens)
      .set({ isEnabled, updatedAt: new Date() })
      .where(eq(bridgeSupportedTokens.id, id))
      .returning();
    return token;
  }

  // Bridge Transactions
  async getBridgeTransaction(id: number): Promise<schema.BridgeTransaction | undefined> {
    const [transaction] = await db.select().from(bridgeTransactions).where(eq(bridgeTransactions.id, id));
    return transaction;
  }

  async getBridgeTransactionsByBridgeId(bridgeId: number, limit?: number): Promise<schema.BridgeTransaction[]> {
    let query = db
      .select()
      .from(bridgeTransactions)
      .where(eq(bridgeTransactions.bridgeId, bridgeId))
      .orderBy(desc(bridgeTransactions.createdAt));

    if (limit) {
      query = query.limit(limit);
    }

    return query;
  }

  async getBridgeTransactionsByUserId(userId: number, limit?: number): Promise<schema.BridgeTransaction[]> {
    let query = db
      .select()
      .from(bridgeTransactions)
      .where(eq(bridgeTransactions.userId, userId))
      .orderBy(desc(bridgeTransactions.createdAt));

    if (limit) {
      query = query.limit(limit);
    }

    return query;
  }

  async getBridgeTransactionsBySourceHash(sourceTransactionHash: string): Promise<schema.BridgeTransaction | undefined> {
    const [transaction] = await db
      .select()
      .from(bridgeTransactions)
      .where(eq(bridgeTransactions.sourceTransactionHash, sourceTransactionHash));
    return transaction;
  }

  async getBridgeTransactionsByStatus(status: schema.BridgeTransactionStatus, limit?: number): Promise<schema.BridgeTransaction[]> {
    let query = db
      .select()
      .from(bridgeTransactions)
      .where(eq(bridgeTransactions.status, status))
      .orderBy(desc(bridgeTransactions.createdAt));

    if (limit) {
      query = query.limit(limit);
    }

    return query;
  }

  async createBridgeTransaction(transaction: schema.InsertBridgeTransaction): Promise<schema.BridgeTransaction> {
    const [result] = await db.insert(bridgeTransactions).values(transaction).returning();
    return result;
  }

  async updateBridgeTransactionStatus(id: number, status: schema.BridgeTransactionStatus, errorMessage?: string): Promise<schema.BridgeTransaction | undefined> {
    const [transaction] = await db
      .update(bridgeTransactions)
      .set({
        status,
        errorMessage,
        updatedAt: new Date()
      })
      .where(eq(bridgeTransactions.id, id))
      .returning();
    return transaction;
  }

  async updateBridgeTransactionTargetHash(id: number, targetTransactionHash: string): Promise<schema.BridgeTransaction | undefined> {
    const [transaction] = await db
      .update(bridgeTransactions)
      .set({
        targetTransactionHash,
        updatedAt: new Date()
      })
      .where(eq(bridgeTransactions.id, id))
      .returning();
    return transaction;
  }

  async addBridgeTransactionValidation(id: number, validatorId: number, signature: string): Promise<schema.BridgeTransaction | undefined> {
    const transaction = await this.getBridgeTransaction(id);
    if (!transaction) return undefined;

    // Update the validations array or initialize it
    const validations = transaction.validations || [];
    validations.push({
      validatorId,
      signature,
      timestamp: new Date()
    });

    const [updatedTransaction] = await db
      .update(bridgeTransactions)
      .set({
        validations,
        updatedAt: new Date()
      })
      .where(eq(bridgeTransactions.id, id))
      .returning();
    return updatedTransaction;
  }

  async completeBridgeTransaction(id: number, targetTransactionHash: string): Promise<schema.BridgeTransaction | undefined> {
    const [transaction] = await db
      .update(bridgeTransactions)
      .set({
        targetTransactionHash,
        status: schema.BridgeTransactionStatus.COMPLETED,
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(bridgeTransactions.id, id))
      .returning();
    return transaction;
  }

  // Recurve Fractal Reserve System methods

  // Insurance Policy methods
  async getInsurancePolicy(id: number): Promise<schema.InsurancePolicy | undefined> {
    const [policy] = await db.select().from(insurancePolicies).where(eq(insurancePolicies.id, id));
    return policy;
  }

  async getInsurancePoliciesByUserId(userId: number): Promise<schema.InsurancePolicy[]> {
    return db
      .select()
      .from(insurancePolicies)
      .where(eq(insurancePolicies.userId, userId))
      .orderBy(desc(insurancePolicies.createdAt));
  }

  async getInsurancePoliciesByStatus(status: schema.InsurancePolicyStatus): Promise<schema.InsurancePolicy[]> {
    return db
      .select()
      .from(insurancePolicies)
      .where(eq(insurancePolicies.status, status));
  }

  async createInsurancePolicy(policy: schema.InsertInsurancePolicy): Promise<schema.InsurancePolicy> {
    const [result] = await db.insert(insurancePolicies).values(policy).returning();
    return result;
  }

  async updateInsurancePolicyStatus(id: number, status: schema.InsurancePolicyStatus): Promise<schema.InsurancePolicy | undefined> {
    const [policy] = await db
      .update(insurancePolicies)
      .set({
        status,
        lastUpdated: new Date()
      })
      .where(eq(insurancePolicies.id, id))
      .returning();
    return policy;
  }

  async updateInsuranceCashValue(id: number, cashValue: number): Promise<schema.InsurancePolicy | undefined> {
    const [policy] = await db
      .update(insurancePolicies)
      .set({
        cashValue,
        lastUpdated: new Date()
      })
      .where(eq(insurancePolicies.id, id))
      .returning();
    return policy;
  }

  async updateInsuranceSyncStatus(id: number, status: schema.RecurveSyncStatus): Promise<schema.InsurancePolicy | undefined> {
    const [policy] = await db
      .update(insurancePolicies)
      .set({
        onchainSyncStatus: status,
        lastUpdated: new Date()
      })
      .where(eq(insurancePolicies.id, id))
      .returning();
    return policy;
  }

  // Recurve Tokens methods
  async getRecurveToken(id: number): Promise<schema.RecurveToken | undefined> {
    const [token] = await db.select().from(recurveTokens).where(eq(recurveTokens.id, id));
    return token;
  }

  async getRecurveTokensByUserId(userId: number): Promise<schema.RecurveToken[]> {
    return db
      .select()
      .from(recurveTokens)
      .where(eq(recurveTokens.userId, userId))
      .orderBy(desc(recurveTokens.mintedAt));
  }

  async getRecurveTokensByPolicyId(policyId: number): Promise<schema.RecurveToken[]> {
    return db
      .select()
      .from(recurveTokens)
      .where(eq(recurveTokens.policyId, policyId));
  }

  async getRecurveTokensByTier(tier: schema.RecurveTokenTier): Promise<schema.RecurveToken[]> {
    return db
      .select()
      .from(recurveTokens)
      .where(eq(recurveTokens.tier, tier));
  }

  async createRecurveToken(token: schema.InsertRecurveToken): Promise<schema.RecurveToken> {
    const [result] = await db.insert(recurveTokens).values(token).returning();
    return result;
  }

  async updateRecurveTokenStatus(id: number, status: string): Promise<schema.RecurveToken | undefined> {
    const [token] = await db
      .update(recurveTokens)
      .set({
        status,
        lastRecalculation: new Date()
      })
      .where(eq(recurveTokens.id, id))
      .returning();
    return token;
  }

  async updateRecurveTokenAmount(id: number, amount: number): Promise<schema.RecurveToken | undefined> {
    const [token] = await db
      .update(recurveTokens)
      .set({
        tokenAmount: amount,
        lastRecalculation: new Date()
      })
      .where(eq(recurveTokens.id, id))
      .returning();
    return token;
  }

  // Fractal Loans methods
  async getFractalLoan(id: number): Promise<schema.FractalLoan | undefined> {
    const [loan] = await db.select().from(fractalLoans).where(eq(fractalLoans.id, id));
    return loan;
  }

  async getFractalLoansByUserId(userId: number): Promise<schema.FractalLoan[]> {
    return db
      .select()
      .from(fractalLoans)
      .where(eq(fractalLoans.userId, userId))
      .orderBy(desc(fractalLoans.originationDate));
  }

  async getFractalLoansByStatus(status: schema.FractalLoanStatus): Promise<schema.FractalLoan[]> {
    return db
      .select()
      .from(fractalLoans)
      .where(eq(fractalLoans.status, status));
  }

  async getFractalLoansByPolicyId(policyId: number): Promise<schema.FractalLoan[]> {
    return db
      .select()
      .from(fractalLoans)
      .where(eq(fractalLoans.policyId, policyId));
  }

  async createFractalLoan(loan: schema.InsertFractalLoan): Promise<schema.FractalLoan> {
    const [result] = await db.insert(fractalLoans).values(loan).returning();
    return result;
  }

  async updateFractalLoanStatus(id: number, status: schema.FractalLoanStatus): Promise<schema.FractalLoan | undefined> {
    const [loan] = await db
      .update(fractalLoans)
      .set({
        status,
        lastRecalculation: new Date()
      })
      .where(eq(fractalLoans.id, id))
      .returning();
    return loan;
  }

  // Torus Security nodes methods
  async getTorusSecurityNode(id: number): Promise<schema.TorusSecurityNode | undefined> {
    const [node] = await db.select().from(torusSecurityNodes).where(eq(torusSecurityNodes.id, id));
    return node;
  }

  async getTorusSecurityNodesByUserId(userId: number): Promise<schema.TorusSecurityNode[]> {
    return db
      .select()
      .from(torusSecurityNodes)
      .where(eq(torusSecurityNodes.userId, userId));
  }

  async getTorusSecurityNodesByTokenId(tokenId: number): Promise<schema.TorusSecurityNode[]> {
    return db
      .select()
      .from(torusSecurityNodes)
      .where(eq(torusSecurityNodes.recurveTokenId, tokenId));
  }

  async getTorusSecurityNodesByType(nodeType: schema.TorusNodeType): Promise<schema.TorusSecurityNode[]> {
    return db
      .select()
      .from(torusSecurityNodes)
      .where(eq(torusSecurityNodes.nodeType, nodeType));
  }

  async createTorusSecurityNode(node: schema.InsertTorusSecurityNode): Promise<schema.TorusSecurityNode> {
    const [result] = await db.insert(torusSecurityNodes).values(node).returning();
    return result;
  }

  async updateTorusSecurityNodeStatus(id: number, status: string): Promise<schema.TorusSecurityNode | undefined> {
    const [node] = await db
      .update(torusSecurityNodes)
      .set({
        status,
        lastVerified: new Date()
      })
      .where(eq(torusSecurityNodes.id, id))
      .returning();
    return node;
  }

  async updateTorusNodeLastVerified(id: number): Promise<schema.TorusSecurityNode | undefined> {
    const [node] = await db
      .update(torusSecurityNodes)
      .set({
        lastVerified: new Date()
      })
      .where(eq(torusSecurityNodes.id, id))
      .returning();
    return node;
  }

  // Network Insurance Policies methods
  async getNetworkInsurancePolicy(id: number): Promise<schema.NetworkInsurancePolicy | undefined> {
    const [policy] = await db.select().from(networkInsurancePolicies).where(eq(networkInsurancePolicies.id, id));
    return policy;
  }

  async getNetworkInsurancePoliciesByStatus(status: schema.InsurancePolicyStatus): Promise<schema.NetworkInsurancePolicy[]> {
    return db
      .select()
      .from(networkInsurancePolicies)
      .where(eq(networkInsurancePolicies.status, status));
  }

  async getNetworkInsurancePoliciesByPurpose(purpose: string): Promise<schema.NetworkInsurancePolicy[]> {
    return db
      .select()
      .from(networkInsurancePolicies)
      .where(eq(networkInsurancePolicies.policyPurpose, purpose));
  }

  async createNetworkInsurancePolicy(policy: schema.InsertNetworkInsurancePolicy): Promise<schema.NetworkInsurancePolicy> {
    const [result] = await db.insert(networkInsurancePolicies).values(policy).returning();
    return result;
  }

  async updateNetworkInsurancePolicyStatus(id: number, status: schema.InsurancePolicyStatus): Promise<schema.NetworkInsurancePolicy | undefined> {
    const [policy] = await db
      .update(networkInsurancePolicies)
      .set({
        status
      })
      .where(eq(networkInsurancePolicies.id, id))
      .returning();
    return policy;
  }

  // Mandelbrot Recursion Events methods
  async getMandelbrotRecursionEvent(id: number): Promise<schema.MandelbrotRecursionEvent | undefined> {
    const [event] = await db.select().from(mandelbrotRecursionEvents).where(eq(mandelbrotRecursionEvents.id, id));
    return event;
  }

  async getMandelbrotRecursionEventsByType(type: string): Promise<schema.MandelbrotRecursionEvent[]> {
    return db
      .select()
      .from(mandelbrotRecursionEvents)
      .where(eq(mandelbrotRecursionEvents.recursionType, type))
      .orderBy(desc(mandelbrotRecursionEvents.timestamp));
  }

  async createMandelbrotRecursionEvent(event: schema.InsertMandelbrotRecursionEvent): Promise<schema.MandelbrotRecursionEvent> {
    const [result] = await db.insert(mandelbrotRecursionEvents).values(event).returning();
    return result;
  }

  // AI Assistant Training Data methods - temporarily commented out to resolve circular dependency
  /*
  async getAiTrainingData(id: number): Promise<schema.AiTrainingData | undefined> {
    const [data] = await db.select().from(aiTrainingData).where(eq(aiTrainingData.id, id));
    return data;
  }

  async getAiTrainingDataByUserId(userId: number): Promise<schema.AiTrainingData[]> {
    return db
      .select()
      .from(aiTrainingData)
      .where(eq(aiTrainingData.userId, userId))
      .orderBy(desc(aiTrainingData.contributionDate));
  }

  async getAiTrainingDataByStatus(status: schema.TrainingProcessingStatus): Promise<schema.AiTrainingData[]> {
    return db
      .select()
      .from(aiTrainingData)
      .where(eq(aiTrainingData.processingStatus, status))
      .orderBy(desc(aiTrainingData.contributionDate));
  }

  async getAiTrainingDataByFeedbackType(feedbackType: schema.TrainingFeedbackType): Promise<schema.AiTrainingData[]> {
    return db
      .select()
      .from(aiTrainingData)
      .where(eq(aiTrainingData.feedbackType, feedbackType))
      .orderBy(desc(aiTrainingData.contributionDate));
  }

  async createAiTrainingData(data: schema.InsertAiTrainingData): Promise<schema.AiTrainingData> {
    const [result] = await db.insert(aiTrainingData).values(data).returning();
    return result;
  }
  */

  /*
  async updateAiTrainingDataStatus(
    id: number, 
    status: schema.TrainingProcessingStatus, 
    notes?: string
  ): Promise<schema.AiTrainingData | undefined> {
    const [data] = await db
      .update(aiTrainingData)
      .set({
        processingStatus: status,
        processingNotes: notes,
        updatedAt: new Date()
      })
      .where(eq(aiTrainingData.id, id))
      .returning();
    return data;
  }

  async updateAiTrainingDataRewards(
    id: number, 
    points: number, 
    singTokens?: number
  ): Promise<schema.AiTrainingData | undefined> {
    const updates: any = {
      pointsAwarded: points,
      updatedAt: new Date()
    };
    
    if (singTokens !== undefined) {
      updates.singTokensAwarded = singTokens;
    }
    
    const [data] = await db
      .update(aiTrainingData)
      .set(updates)
      .where(eq(aiTrainingData.id, id))
      .returning();
    return data;
  }
  
  // AI Training Jobs methods
  async getAiTrainingJob(id: number): Promise<schema.AiTrainingJob | undefined> {
    const [job] = await db.select().from(aiTrainingJobs).where(eq(aiTrainingJobs.id, id));
    return job;
  }

  async getAiTrainingJobsByStatus(status: string): Promise<schema.AiTrainingJob[]> {
    return db
      .select()
      .from(aiTrainingJobs)
      .where(eq(aiTrainingJobs.status, status))
      .orderBy(desc(aiTrainingJobs.createdAt));
  }

  async createAiTrainingJob(job: schema.InsertAiTrainingJob): Promise<schema.AiTrainingJob> {
    const [result] = await db.insert(aiTrainingJobs).values(job).returning();
    return result;
  }

  async updateAiTrainingJobStatus(id: number, status: string): Promise<schema.AiTrainingJob | undefined> {
    const [job] = await db
      .update(aiTrainingJobs)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(aiTrainingJobs.id, id))
      .returning();
    return job;
  }

  async completeAiTrainingJob(id: number, metrics: Record<string, any>): Promise<schema.AiTrainingJob | undefined> {
    const [job] = await db
      .update(aiTrainingJobs)
      .set({
        status: 'completed',
        endTime: new Date(),
        metrics,
        updatedAt: new Date()
      })
      .where(eq(aiTrainingJobs.id, id))
      .returning();
    return job;
  }
  
  // AI Training Contributors methods
  async getAiTrainingContributor(id: number): Promise<schema.AiTrainingContributor | undefined> {
    const [contributor] = await db.select().from(aiTrainingContributors).where(eq(aiTrainingContributors.id, id));
    return contributor;
  }

  async getAiTrainingContributorByUserId(userId: number): Promise<schema.AiTrainingContributor | undefined> {
    const [contributor] = await db
      .select()
      .from(aiTrainingContributors)
      .where(eq(aiTrainingContributors.userId, userId));
    return contributor;
  }

  async getTopAiTrainingContributors(limit: number): Promise<schema.AiTrainingContributor[]> {
    return db
      .select()
      .from(aiTrainingContributors)
      .orderBy(desc(aiTrainingContributors.totalPointsEarned))
      .limit(limit);
  }

  async createAiTrainingContributor(contributor: schema.InsertAiTrainingContributor): Promise<schema.AiTrainingContributor> {
    const [result] = await db.insert(aiTrainingContributors).values(contributor).returning();
    return result;
  }

  async updateAiTrainingContributor(
    id: number,
    contributions: number,
    points: number,
    singTokens: number
  ): Promise<schema.AiTrainingContributor | undefined> {
    const [contributor] = await db
      .update(aiTrainingContributors)
      .set({
        totalContributions: contributions,
        totalPointsEarned: points,
        totalSingTokens: singTokens,
        lastContribution: new Date(),
        updatedAt: new Date()
      })
      .where(eq(aiTrainingContributors.id, id))
      .returning();
    return contributor;
  }

  async updateAiTrainingContributorTier(id: number, tier: string): Promise<schema.AiTrainingContributor | undefined> {
    const [contributor] = await db
      .update(aiTrainingContributors)
      .set({
        contributorTier: tier,
        updatedAt: new Date()
      })
      .where(eq(aiTrainingContributors.id, id))
      .returning();
    return contributor;
  }

  async updateAiTrainingContributorRank(id: number, rank: number): Promise<schema.AiTrainingContributor | undefined> {
    const [contributor] = await db
      .update(aiTrainingContributors)
      .set({
        contributorRank: rank,
        updatedAt: new Date()
      })
      .where(eq(aiTrainingContributors.id, id))
      .returning();
    return contributor;
  }
  */
}