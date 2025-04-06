import { IStorage } from "./storage";
import {
  User, InsertUser,
  Wallet, InsertWallet,
  Transaction, InsertTransaction,
  SmartContract, InsertSmartContract,
  AiMonitoringLog, InsertAiMonitoringLog,
  CidEntry, InsertCidEntry,
  PaymentMethod, InsertPaymentMethod,
  Payment, InsertPayment,
  WalletHealthScore, InsertWalletHealthScore,
  WalletHealthIssue, InsertWalletHealthIssue,
  NotificationPreference, InsertNotificationPreference,
  UserApiKey, InsertUserApiKey,
  MysterionTrainingData, InsertMysterionTrainingData,
  users, wallets, transactions, smartContracts, aiMonitoringLogs, cidEntries,
  paymentMethods, payments, walletHealthScores, walletHealthIssues, notificationPreferences,
  userApiKeys, mysterionTrainingData
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, inArray } from "drizzle-orm";

export class PgStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length ? result[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result.length ? result[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Wallet methods
  async getWallet(id: number): Promise<Wallet | undefined> {
    const result = await db.select().from(wallets).where(eq(wallets.id, id)).limit(1);
    return result.length ? result[0] : undefined;
  }

  async getWalletsByUserId(userId: number): Promise<Wallet[]> {
    const result = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return result;
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const result = await db.insert(wallets).values(insertWallet).returning();
    return result[0];
  }

  async updateWalletBalance(id: number, balance: string): Promise<Wallet | undefined> {
    const result = await db
      .update(wallets)
      .set({ balance })
      .where(eq(wallets.id, id))
      .returning();
    
    return result.length ? result[0] : undefined;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const result = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    return result.length ? result[0] : undefined;
  }

  async getTransactionsByWalletId(walletId: number): Promise<Transaction[]> {
    const result = await db
      .select()
      .from(transactions)
      .where(eq(transactions.walletId, walletId))
      .orderBy(desc(transactions.timestamp));
    
    return result;
  }

  async getRecentTransactions(userId: number, limit: number): Promise<Transaction[]> {
    // Get all transactions from wallets owned by the user
    const userWallets = await this.getWalletsByUserId(userId);
    
    if (userWallets.length === 0) {
      return [];
    }
    
    const walletIds = userWallets.map(wallet => wallet.id);
    
    // Query transactions from user's wallets, limited by the count and ordered by timestamp
    // Create a where condition that handles multiple wallet IDs
    const whereCondition = walletIds.length === 1
      ? eq(transactions.walletId, walletIds[0])
      : sql`${transactions.walletId} IN (${sql.join(walletIds, sql`, `)})`;
    
    const query = db
      .select()
      .from(transactions)
      .where(whereCondition)
      .orderBy(desc(transactions.timestamp))
      .limit(limit);
    
    const result = await query;
    return result;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(insertTransaction).returning();
    return result[0];
  }
  
  // Get transactions with layer 2 filtering
  async getLayer2Transactions(userId: number, layer2Type?: string): Promise<Transaction[]> {
    // Get all transactions from wallets owned by the user
    const userWallets = await this.getWalletsByUserId(userId);
    
    if (userWallets.length === 0) {
      return [];
    }
    
    const walletIds = userWallets.map(wallet => wallet.id);
    
    // Base condition: layer 2 transactions
    let whereCondition = and(
      sql`${transactions.walletId} IN (${sql.join(walletIds, sql`, `)})`,
      eq(transactions.isLayer2, true)
    );
    
    // Add layer2Type filter if provided
    if (layer2Type) {
      whereCondition = and(
        whereCondition,
        eq(transactions.layer2Type, layer2Type)
      );
    }
    
    const query = db
      .select()
      .from(transactions)
      .where(whereCondition)
      .orderBy(desc(transactions.timestamp));
    
    const result = await query;
    return result;
  }
  
  // Update transaction description
  async updateTransactionDescription(id: number, description: string): Promise<Transaction | undefined> {
    const result = await db
      .update(transactions)
      .set({ plainDescription: description })
      .where(eq(transactions.id, id))
      .returning();
    
    return result.length ? result[0] : undefined;
  }
  
  // Update transaction layer 2 information
  async updateTransactionLayer2Info(
    id: number, 
    isLayer2: boolean, 
    layer2Type?: string, 
    layer2Data?: Record<string, any>
  ): Promise<Transaction | undefined> {
    const result = await db
      .update(transactions)
      .set({ 
        isLayer2, 
        layer2Type: layer2Type || null,
        layer2Data: layer2Data ? sql`${JSON.stringify(layer2Data)}` : null
      })
      .where(eq(transactions.id, id))
      .returning();
    
    return result.length ? result[0] : undefined;
  }

  // Smart Contract methods
  async getSmartContract(id: number): Promise<SmartContract | undefined> {
    const result = await db.select().from(smartContracts).where(eq(smartContracts.id, id)).limit(1);
    return result.length ? result[0] : undefined;
  }

  async getSmartContractsByUserId(userId: number): Promise<SmartContract[]> {
    const result = await db
      .select()
      .from(smartContracts)
      .where(eq(smartContracts.userId, userId))
      .orderBy(desc(smartContracts.createdAt));
    
    return result;
  }

  async createSmartContract(insertContract: InsertSmartContract): Promise<SmartContract> {
    const result = await db.insert(smartContracts).values(insertContract).returning();
    return result[0];
  }

  async updateSmartContractStatus(id: number, status: string): Promise<SmartContract | undefined> {
    const result = await db
      .update(smartContracts)
      .set({ status })
      .where(eq(smartContracts.id, id))
      .returning();
    
    return result.length ? result[0] : undefined;
  }

  // AI Monitoring methods
  async getAiMonitoringLogs(userId: number, limit: number): Promise<AiMonitoringLog[]> {
    const result = await db
      .select()
      .from(aiMonitoringLogs)
      .where(eq(aiMonitoringLogs.userId, userId))
      .orderBy(desc(aiMonitoringLogs.timestamp))
      .limit(limit);
    
    return result;
  }

  async createAiMonitoringLog(insertLog: InsertAiMonitoringLog): Promise<AiMonitoringLog> {
    const result = await db.insert(aiMonitoringLogs).values(insertLog).returning();
    return result[0];
  }

  // CID Management methods
  async getCidEntry(id: number): Promise<CidEntry | undefined> {
    const result = await db.select().from(cidEntries).where(eq(cidEntries.id, id)).limit(1);
    return result.length ? result[0] : undefined;
  }

  async getCidEntriesByUserId(userId: number): Promise<CidEntry[]> {
    const result = await db
      .select()
      .from(cidEntries)
      .where(eq(cidEntries.userId, userId))
      .orderBy(desc(cidEntries.createdAt));
    
    return result;
  }

  async createCidEntry(insertEntry: InsertCidEntry): Promise<CidEntry> {
    const result = await db.insert(cidEntries).values(insertEntry).returning();
    return result[0];
  }

  async updateCidEntryStatus(id: number, status: string): Promise<CidEntry | undefined> {
    const result = await db
      .update(cidEntries)
      .set({ status })
      .where(eq(cidEntries.id, id))
      .returning();
    
    return result.length ? result[0] : undefined;
  }

  // Payment Methods methods
  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    const result = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id)).limit(1);
    return result.length ? result[0] : undefined;
  }

  async getPaymentMethodsByUserId(userId: number): Promise<PaymentMethod[]> {
    const result = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, userId))
      .orderBy(desc(paymentMethods.createdAt));
    
    return result;
  }

  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    // If this is set as the default payment method, unset any existing default methods for this user
    if (method.isDefault) {
      await db
        .update(paymentMethods)
        .set({ isDefault: false })
        .where(and(
          eq(paymentMethods.userId, method.userId),
          eq(paymentMethods.isDefault, true)
        ));
    }

    const result = await db.insert(paymentMethods).values(method).returning();
    return result[0];
  }

  async updatePaymentMethodDefault(id: number, isDefault: boolean): Promise<PaymentMethod | undefined> {
    // Get the payment method first to get the userId
    const paymentMethod = await this.getPaymentMethod(id);
    if (!paymentMethod) return undefined;

    // If setting as default, unset any existing default methods for this user
    if (isDefault) {
      await db
        .update(paymentMethods)
        .set({ isDefault: false })
        .where(and(
          eq(paymentMethods.userId, paymentMethod.userId),
          eq(paymentMethods.isDefault, true)
        ));
    }

    const result = await db
      .update(paymentMethods)
      .set({ isDefault })
      .where(eq(paymentMethods.id, id))
      .returning();
    
    return result.length ? result[0] : undefined;
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    const result = await db
      .delete(paymentMethods)
      .where(eq(paymentMethods.id, id))
      .returning({ id: paymentMethods.id });
    
    return result.length > 0;
  }

  // Payments methods
  async getPayment(id: number): Promise<Payment | undefined> {
    const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return result.length ? result[0] : undefined;
  }

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
    
    return result;
  }
  
  async getPaymentsByProviderPaymentId(providerPaymentId: string): Promise<Payment[]> {
    const result = await db
      .select()
      .from(payments)
      .where(eq(payments.providerPaymentId, providerPaymentId))
      .orderBy(desc(payments.createdAt));
    
    return result;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const result = await db.insert(payments).values(payment).returning();
    return result[0];
  }

  async updatePaymentStatus(id: number, status: string, processedAt?: Date): Promise<Payment | undefined> {
    const updates: Partial<Payment> = { status };
    if (processedAt) {
      updates.processedAt = processedAt;
    }

    const result = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    
    return result.length ? result[0] : undefined;
  }

  // Wallet Health Score methods
  async getWalletHealthScoresByUserId(userId: number): Promise<WalletHealthScore[]> {
    try {
      // First get the user's wallets
      const userWallets = await this.getWalletsByUserId(userId);
      if (userWallets.length === 0) {
        return [];
      }
      
      const walletIds = userWallets.map(wallet => wallet.id);
      
      // Get health scores for these wallets
      const scores = await db.select()
        .from(walletHealthScores)
        .where(inArray(walletHealthScores.walletId, walletIds))
        .orderBy(desc(walletHealthScores.createdAt));
      
      return scores;
    } catch (error) {
      console.error('Error getting wallet health scores by user ID:', error);
      return [];
    }
  }
  
  async getWalletHealthScoreByWalletId(walletId: number): Promise<WalletHealthScore | undefined> {
    try {
      const scores = await db.select()
        .from(walletHealthScores)
        .where(eq(walletHealthScores.walletId, walletId))
        .orderBy(desc(walletHealthScores.createdAt))
        .limit(1);
      
      return scores.length ? scores[0] : undefined;
    } catch (error) {
      console.error('Error getting wallet health score by wallet ID:', error);
      return undefined;
    }
  }
  
  async createWalletHealthScore(insertScore: InsertWalletHealthScore): Promise<WalletHealthScore> {
    try {
      const result = await db.insert(walletHealthScores)
        .values(insertScore)
        .returning();
        
      return result[0];
    } catch (error) {
      console.error('Error creating wallet health score:', error);
      throw error;
    }
  }
  
  // Wallet Health Issue methods
  async getWalletHealthIssuesByScoreId(healthScoreId: number): Promise<WalletHealthIssue[]> {
    try {
      const issues = await db.select()
        .from(walletHealthIssues)
        .where(eq(walletHealthIssues.healthScoreId, healthScoreId))
        .orderBy(
          // Order by severity first (critical, high, medium, low)
          sql`CASE 
            WHEN ${walletHealthIssues.severity} = 'critical' THEN 1
            WHEN ${walletHealthIssues.severity} = 'high' THEN 2
            WHEN ${walletHealthIssues.severity} = 'medium' THEN 3
            WHEN ${walletHealthIssues.severity} = 'low' THEN 4
            ELSE 5
          END`,
          // Then by creation date (newest first)
          desc(walletHealthIssues.createdAt)
        );
      
      return issues;
    } catch (error) {
      console.error('Error getting wallet health issues by score ID:', error);
      return [];
    }
  }
  
  async createWalletHealthIssue(insertIssue: InsertWalletHealthIssue): Promise<WalletHealthIssue> {
    try {
      const result = await db.insert(walletHealthIssues)
        .values(insertIssue)
        .returning();
        
      return result[0];
    } catch (error) {
      console.error('Error creating wallet health issue:', error);
      throw error;
    }
  }
  
  async updateWalletHealthIssueResolved(id: number, resolved: boolean): Promise<WalletHealthIssue | undefined> {
    try {
      const now = new Date();
      const updates: Partial<WalletHealthIssue> = { 
        resolved, 
        resolvedAt: resolved ? now : null 
      };
      
      const result = await db.update(walletHealthIssues)
        .set(updates)
        .where(eq(walletHealthIssues.id, id))
        .returning();
      
      return result.length ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating wallet health issue resolved status:', error);
      return undefined;
    }
  }

  // Notification Preference methods
  async getNotificationPreference(id: number): Promise<NotificationPreference | undefined> {
    try {
      const result = await db.select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.id, id))
        .limit(1);
      
      return result.length ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting notification preference:', error);
      return undefined;
    }
  }
  
  async getNotificationPreferenceByUserId(userId: number): Promise<NotificationPreference | undefined> {
    try {
      const result = await db.select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId))
        .limit(1);
      
      return result.length ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting notification preference by user ID:', error);
      return undefined;
    }
  }
  
  async createNotificationPreference(preference: InsertNotificationPreference): Promise<NotificationPreference> {
    try {
      const result = await db.insert(notificationPreferences)
        .values(preference)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error creating notification preference:', error);
      throw error;
    }
  }
  
  async updateNotificationPreference(id: number, updates: Partial<NotificationPreference>): Promise<NotificationPreference | undefined> {
    try {
      const now = new Date();
      const updatesWithTimestamp = { 
        ...updates, 
        updatedAt: now 
      };
      
      const result = await db.update(notificationPreferences)
        .set(updatesWithTimestamp)
        .where(eq(notificationPreferences.id, id))
        .returning();
      
      return result.length ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating notification preference:', error);
      return undefined;
    }
  }
  
  async updateNotificationPreferences(userId: number, data: Partial<NotificationPreference>): Promise<NotificationPreference | undefined> {
    try {
      // Find the user's notification preference
      const preference = await this.getNotificationPreferenceByUserId(userId);
      if (!preference) return undefined;
      
      const now = new Date();
      const updates = { 
        ...data, 
        updatedAt: now 
      };
      
      const result = await db.update(notificationPreferences)
        .set(updates)
        .where(eq(notificationPreferences.id, preference.id))
        .returning();
      
      return result.length ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return undefined;
    }
  }
  
  async updatePhoneNumber(userId: number, phoneNumber: string, isVerified: boolean = false): Promise<NotificationPreference | undefined> {
    try {
      // Find the user's notification preference
      const preference = await this.getNotificationPreferenceByUserId(userId);
      if (!preference) return undefined;
      
      const now = new Date();
      const updates = { 
        phoneNumber, 
        isPhoneVerified: isVerified,
        updatedAt: now
      };
      
      const result = await db.update(notificationPreferences)
        .set(updates)
        .where(eq(notificationPreferences.id, preference.id))
        .returning();
      
      return result.length ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating phone number:', error);
      return undefined;
    }
  }
  
  async verifyPhoneNumber(userId: number, isVerified: boolean): Promise<NotificationPreference | undefined> {
    try {
      // Find the user's notification preference
      const preference = await this.getNotificationPreferenceByUserId(userId);
      if (!preference) return undefined;
      
      // If user doesn't have a phone number, we can't verify
      if (!preference.phoneNumber) return undefined;
      
      const now = new Date();
      const updates = { 
        isPhoneVerified: isVerified,
        updatedAt: now
      };
      
      const result = await db.update(notificationPreferences)
        .set(updates)
        .where(eq(notificationPreferences.id, preference.id))
        .returning();
      
      return result.length ? result[0] : undefined;
    } catch (error) {
      console.error('Error verifying phone number:', error);
      return undefined;
    }
  }
  
  async updateMatrixId(userId: number, matrixId: string, isVerified: boolean = false): Promise<NotificationPreference | undefined> {
    try {
      // Find the user's notification preference
      const preference = await this.getNotificationPreferenceByUserId(userId);
      if (!preference) return undefined;
      
      const now = new Date();
      const updates = { 
        matrixId: matrixId, 
        isMatrixVerified: isVerified,
        updatedAt: now
      };
      
      const result = await db.update(notificationPreferences)
        .set(updates)
        .where(eq(notificationPreferences.id, preference.id))
        .returning();
      
      return result.length ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating Matrix ID:', error);
      return undefined;
    }
  }
  
  async verifyMatrixId(userId: number, isVerified: boolean): Promise<NotificationPreference | undefined> {
    try {
      // Find the user's notification preference
      const preference = await this.getNotificationPreferenceByUserId(userId);
      if (!preference) return undefined;
      
      // If user doesn't have a Matrix ID, we can't verify
      if (!preference.matrixId) return undefined;
      
      const now = new Date();
      const updates = { 
        isMatrixVerified: isVerified,
        updatedAt: now
      };
      
      const result = await db.update(notificationPreferences)
        .set(updates)
        .where(eq(notificationPreferences.id, preference.id))
        .returning();
      
      return result.length ? result[0] : undefined;
    } catch (error) {
      console.error('Error verifying Matrix ID:', error);
      return undefined;
    }
  }

  // User API Keys for Mysterion LLM training
  async getUserApiKey(id: number): Promise<UserApiKey | undefined> {
    try {
      const result = await db.select()
        .from(userApiKeys)
        .where(eq(userApiKeys.id, id))
        .limit(1);
      
      return result.length ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting user API key:', error);
      return undefined;
    }
  }

  async getUserApiKeysByUserId(userId: number): Promise<UserApiKey[]> {
    try {
      const result = await db.select()
        .from(userApiKeys)
        .where(eq(userApiKeys.userId, userId))
        .orderBy(desc(userApiKeys.createdAt));
      
      return result;
    } catch (error) {
      console.error('Error getting user API keys by user ID:', error);
      return [];
    }
  }

  async getUserApiKeysByService(userId: number, service: string): Promise<UserApiKey[]> {
    try {
      const result = await db.select()
        .from(userApiKeys)
        .where(and(
          eq(userApiKeys.userId, userId),
          eq(userApiKeys.service, service)
        ))
        .orderBy(desc(userApiKeys.createdAt));
      
      return result;
    } catch (error) {
      console.error('Error getting user API keys by service:', error);
      return [];
    }
  }
  
  async createUserApiKey(insertUserApiKey: InsertUserApiKey): Promise<UserApiKey> {
    try {
      // Import the vault service here to avoid circular dependencies
      const { storeApiKey } = await import('./services/quantum-vault');
      
      // First store the API key in the quantum vault
      const { keyId, isSuccess } = await storeApiKey(
        insertUserApiKey.userId,
        insertUserApiKey.service,
        insertUserApiKey.apiKey || ''
      );
      
      if (!isSuccess) {
        throw new Error('Failed to store API key in quantum vault');
      }
      
      // Store a reference in the database without the actual API key
      const dbRecord = {
        ...insertUserApiKey,
        apiKey: undefined, // Remove the key from the database record
        vaultKeyId: keyId, // Store the vault reference instead
      };
      
      const result = await db.insert(userApiKeys).values(dbRecord).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user API key:', error);
      throw error;
    }
  }
  
  async updateUserApiKeyStatus(id: number, isActive: boolean): Promise<UserApiKey | undefined> {
    try {
      const result = await db.update(userApiKeys)
        .set({ isActive, updatedAt: new Date() })
        .where(eq(userApiKeys.id, id))
        .returning();
      
      return result.length ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating user API key status:', error);
      return undefined;
    }
  }
  
  async updateUserApiKeyTrainingStatus(id: number, isTrainingEnabled: boolean): Promise<UserApiKey | undefined> {
    try {
      const result = await db.update(userApiKeys)
        .set({ isTrainingEnabled, updatedAt: new Date() })
        .where(eq(userApiKeys.id, id))
        .returning();
      
      return result.length ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating user API key training status:', error);
      return undefined;
    }
  }
  
  async incrementUserApiKeyUsage(id: number): Promise<UserApiKey | undefined> {
    try {
      // Get the current API key to get the current usage count
      const currentKey = await this.getUserApiKey(id);
      if (!currentKey) return undefined;
      
      const result = await db.update(userApiKeys)
        .set({ 
          usageCount: (currentKey.usageCount || 0) + 1,
          lastUsedAt: new Date()
        })
        .where(eq(userApiKeys.id, id))
        .returning();
      
      return result.length ? result[0] : undefined;
    } catch (error) {
      console.error('Error incrementing user API key usage:', error);
      return undefined;
    }
  }
  
  async deleteUserApiKey(id: number): Promise<boolean> {
    try {
      // Import the vault service here to avoid circular dependencies
      const { deleteApiKey } = await import('./services/quantum-vault');
      
      // Get the API key record to get the vault key ID
      const apiKey = await this.getUserApiKey(id);
      if (!apiKey) return false;
      
      // Delete the API key from the vault
      if (apiKey.vaultKeyId) {
        await deleteApiKey(apiKey.userId, apiKey.vaultKeyId);
      }
      
      // Delete the database record
      const result = await db.delete(userApiKeys)
        .where(eq(userApiKeys.id, id))
        .returning({ id: userApiKeys.id });
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting user API key:', error);
      return false;
    }
  }
  
  // Mysterion Training Data
  async getMysterionTrainingData(id: number): Promise<MysterionTrainingData | undefined> {
    try {
      const result = await db.select()
        .from(mysterionTrainingData)
        .where(eq(mysterionTrainingData.id, id))
        .limit(1);
      
      return result.length ? result[0] : undefined;
    } catch (error) {
      console.error('Error getting mysterion training data:', error);
      return undefined;
    }
  }
  
  async getMysterionTrainingDataByApiKeyId(apiKeyId: number): Promise<MysterionTrainingData[]> {
    try {
      const result = await db.select()
        .from(mysterionTrainingData)
        .where(eq(mysterionTrainingData.apiKeyId, apiKeyId))
        .orderBy(desc(mysterionTrainingData.createdAt));
      
      return result;
    } catch (error) {
      console.error('Error getting mysterion training data by API key ID:', error);
      return [];
    }
  }
  
  async createMysterionTrainingData(insertTrainingData: InsertMysterionTrainingData): Promise<MysterionTrainingData> {
    try {
      const result = await db.insert(mysterionTrainingData)
        .values(insertTrainingData)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error creating mysterion training data:', error);
      throw error;
    }
  }
  
  async updateMysterionTrainingDataStatus(id: number, status: string, notes?: string): Promise<MysterionTrainingData | undefined> {
    try {
      const updates: any = { 
        status, 
        updatedAt: new Date() 
      };
      
      if (notes !== undefined) {
        updates.notes = notes;
      }
      
      const result = await db.update(mysterionTrainingData)
        .set(updates)
        .where(eq(mysterionTrainingData.id, id))
        .returning();
      
      return result.length ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating mysterion training data status:', error);
      return undefined;
    }
  }
  
  async updateMysterionTrainingDataPoints(id: number, points: number): Promise<MysterionTrainingData | undefined> {
    try {
      // Get the current training data to get the current points
      const currentData = await this.getMysterionTrainingData(id);
      if (!currentData) return undefined;
      
      const result = await db.update(mysterionTrainingData)
        .set({ 
          points: (currentData.points || 0) + points,
          updatedAt: new Date()
        })
        .where(eq(mysterionTrainingData.id, id))
        .returning();
      
      return result.length ? result[0] : undefined;
    } catch (error) {
      console.error('Error updating mysterion training data points:', error);
      return undefined;
    }
  }
}