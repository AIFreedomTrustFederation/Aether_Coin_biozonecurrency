"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgStorage = void 0;
const schema_1 = require("@shared/schema");
// Import bridge tables directly from shared/bridge-schema.ts
const bridge_schema_1 = require("../shared/bridge-schema");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
class PgStorage {
    // User methods
    async getUser(id) {
        const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id)).limit(1);
        return result.length ? result[0] : undefined;
    }
    async getUserById(id) {
        const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id)).limit(1);
        return result.length ? result[0] : undefined;
    }
    async getUserByUsername(username) {
        const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.username, username)).limit(1);
        return result.length ? result[0] : undefined;
    }
    async getUserByEmail(email) {
        const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email)).limit(1);
        return result.length ? result[0] : undefined;
    }
    async createUser(insertUser) {
        const result = await db_1.db.insert(schema_1.users).values(insertUser).returning();
        return result[0];
    }
    async updateUser(id, updates) {
        const result = await db_1.db.update(schema_1.users)
            .set({
            ...updates,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
            .returning();
        return result.length ? result[0] : undefined;
    }
    async verifyUserPassword(username, password) {
        // In a real implementation, we would hash the password with bcrypt and compare
        // We're simplifying it here for now - we will handle this in the auth route instead
        const user = await this.getUserByUsername(username);
        if (!user)
            return null;
        return user;
    }
    async getTrustMembers() {
        const result = await db_1.db.select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.isTrustMember, true));
        return result;
    }
    async setUserAsTrustMember(id, level) {
        const result = await db_1.db.update(schema_1.users)
            .set({
            isTrustMember: true,
            trustMemberSince: new Date(),
            trustMemberLevel: level,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
            .returning();
        return result.length ? result[0] : undefined;
    }
    async updateUserLastLogin(id) {
        const result = await db_1.db.update(schema_1.users)
            .set({
            lastLogin: new Date(),
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
            .returning();
        return result.length ? result[0] : undefined;
    }
    async isTrustMember(id) {
        const user = await this.getUser(id);
        return user ? user.isTrustMember : false;
    }
    // Wallet methods
    async getWallet(id) {
        const result = await db_1.db.select().from(schema_1.wallets).where((0, drizzle_orm_1.eq)(schema_1.wallets.id, id)).limit(1);
        return result.length ? result[0] : undefined;
    }
    async getWalletsByUserId(userId) {
        const result = await db_1.db.select().from(schema_1.wallets).where((0, drizzle_orm_1.eq)(schema_1.wallets.userId, userId));
        return result;
    }
    async createWallet(insertWallet) {
        const result = await db_1.db.insert(schema_1.wallets).values(insertWallet).returning();
        return result[0];
    }
    async updateWalletBalance(id, balance) {
        const result = await db_1.db
            .update(schema_1.wallets)
            .set({ balance })
            .where((0, drizzle_orm_1.eq)(schema_1.wallets.id, id))
            .returning();
        return result.length ? result[0] : undefined;
    }
    // Transaction methods
    async getTransaction(id) {
        const result = await db_1.db.select().from(schema_1.transactions).where((0, drizzle_orm_1.eq)(schema_1.transactions.id, id)).limit(1);
        return result.length ? result[0] : undefined;
    }
    async getTransactionsByWalletId(walletId) {
        const result = await db_1.db
            .select()
            .from(schema_1.transactions)
            .where((0, drizzle_orm_1.eq)(schema_1.transactions.walletId, walletId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.timestamp));
        return result;
    }
    async getRecentTransactions(userId, limit) {
        // Get all transactions from wallets owned by the user
        const userWallets = await this.getWalletsByUserId(userId);
        if (userWallets.length === 0) {
            return [];
        }
        const walletIds = userWallets.map(wallet => wallet.id);
        // Query transactions from user's wallets, limited by the count and ordered by timestamp
        // Create a where condition that handles multiple wallet IDs
        const whereCondition = walletIds.length === 1
            ? (0, drizzle_orm_1.eq)(schema_1.transactions.walletId, walletIds[0])
            : (0, drizzle_orm_1.sql) `${schema_1.transactions.walletId} IN (${drizzle_orm_1.sql.join(walletIds, (0, drizzle_orm_1.sql) `, `)})`;
        const query = db_1.db
            .select()
            .from(schema_1.transactions)
            .where(whereCondition)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.timestamp))
            .limit(limit);
        const result = await query;
        return result;
    }
    async createTransaction(insertTransaction) {
        const result = await db_1.db.insert(schema_1.transactions).values(insertTransaction).returning();
        return result[0];
    }
    // Get transactions with layer 2 filtering
    async getLayer2Transactions(userId, layer2Type) {
        // Get all transactions from wallets owned by the user
        const userWallets = await this.getWalletsByUserId(userId);
        if (userWallets.length === 0) {
            return [];
        }
        const walletIds = userWallets.map(wallet => wallet.id);
        // Base condition: layer 2 transactions
        let whereCondition = (0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${schema_1.transactions.walletId} IN (${drizzle_orm_1.sql.join(walletIds, (0, drizzle_orm_1.sql) `, `)})`, (0, drizzle_orm_1.eq)(schema_1.transactions.isLayer2, true));
        // Add layer2Type filter if provided
        if (layer2Type) {
            whereCondition = (0, drizzle_orm_1.and)(whereCondition, (0, drizzle_orm_1.eq)(schema_1.transactions.layer2Type, layer2Type));
        }
        const query = db_1.db
            .select()
            .from(schema_1.transactions)
            .where(whereCondition)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.timestamp));
        const result = await query;
        return result;
    }
    // Update transaction description
    async updateTransactionDescription(id, description) {
        const result = await db_1.db
            .update(schema_1.transactions)
            .set({ plainDescription: description })
            .where((0, drizzle_orm_1.eq)(schema_1.transactions.id, id))
            .returning();
        return result.length ? result[0] : undefined;
    }
    // Update transaction layer 2 information
    async updateTransactionLayer2Info(id, isLayer2, layer2Type, layer2Data) {
        const result = await db_1.db
            .update(schema_1.transactions)
            .set({
            isLayer2,
            layer2Type: layer2Type || null,
            layer2Data: layer2Data ? (0, drizzle_orm_1.sql) `${JSON.stringify(layer2Data)}` : null
        })
            .where((0, drizzle_orm_1.eq)(schema_1.transactions.id, id))
            .returning();
        return result.length ? result[0] : undefined;
    }
    // Smart Contract methods
    async getSmartContract(id) {
        const result = await db_1.db.select().from(schema_1.smartContracts).where((0, drizzle_orm_1.eq)(schema_1.smartContracts.id, id)).limit(1);
        return result.length ? result[0] : undefined;
    }
    async getSmartContractsByUserId(userId) {
        const result = await db_1.db
            .select()
            .from(schema_1.smartContracts)
            .where((0, drizzle_orm_1.eq)(schema_1.smartContracts.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.smartContracts.createdAt));
        return result;
    }
    async createSmartContract(insertContract) {
        const result = await db_1.db.insert(schema_1.smartContracts).values(insertContract).returning();
        return result[0];
    }
    async updateSmartContractStatus(id, status) {
        const result = await db_1.db
            .update(schema_1.smartContracts)
            .set({ status })
            .where((0, drizzle_orm_1.eq)(schema_1.smartContracts.id, id))
            .returning();
        return result.length ? result[0] : undefined;
    }
    // AI Monitoring methods
    async getAiMonitoringLogs(userId, limit) {
        const result = await db_1.db
            .select()
            .from(schema_1.aiMonitoringLogs)
            .where((0, drizzle_orm_1.eq)(schema_1.aiMonitoringLogs.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.aiMonitoringLogs.timestamp))
            .limit(limit);
        return result;
    }
    async createAiMonitoringLog(insertLog) {
        const result = await db_1.db.insert(schema_1.aiMonitoringLogs).values(insertLog).returning();
        return result[0];
    }
    // CID Management methods
    async getCidEntry(id) {
        const result = await db_1.db.select().from(schema_1.cidEntries).where((0, drizzle_orm_1.eq)(schema_1.cidEntries.id, id)).limit(1);
        return result.length ? result[0] : undefined;
    }
    async getCidEntriesByUserId(userId) {
        const result = await db_1.db
            .select()
            .from(schema_1.cidEntries)
            .where((0, drizzle_orm_1.eq)(schema_1.cidEntries.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.cidEntries.createdAt));
        return result;
    }
    async createCidEntry(insertEntry) {
        const result = await db_1.db.insert(schema_1.cidEntries).values(insertEntry).returning();
        return result[0];
    }
    async updateCidEntryStatus(id, status) {
        const result = await db_1.db
            .update(schema_1.cidEntries)
            .set({ status })
            .where((0, drizzle_orm_1.eq)(schema_1.cidEntries.id, id))
            .returning();
        return result.length ? result[0] : undefined;
    }
    // Payment Methods methods
    async getPaymentMethod(id) {
        const result = await db_1.db.select().from(schema_1.paymentMethods).where((0, drizzle_orm_1.eq)(schema_1.paymentMethods.id, id)).limit(1);
        return result.length ? result[0] : undefined;
    }
    async getPaymentMethodsByUserId(userId) {
        const result = await db_1.db
            .select()
            .from(schema_1.paymentMethods)
            .where((0, drizzle_orm_1.eq)(schema_1.paymentMethods.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.paymentMethods.createdAt));
        return result;
    }
    async createPaymentMethod(method) {
        // If this is set as the default payment method, unset any existing default methods for this user
        if (method.isDefault) {
            await db_1.db
                .update(schema_1.paymentMethods)
                .set({ isDefault: false })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.paymentMethods.userId, method.userId), (0, drizzle_orm_1.eq)(schema_1.paymentMethods.isDefault, true)));
        }
        const result = await db_1.db.insert(schema_1.paymentMethods).values(method).returning();
        return result[0];
    }
    async updatePaymentMethodDefault(id, isDefault) {
        // Get the payment method first to get the userId
        const paymentMethod = await this.getPaymentMethod(id);
        if (!paymentMethod)
            return undefined;
        // If setting as default, unset any existing default methods for this user
        if (isDefault) {
            await db_1.db
                .update(schema_1.paymentMethods)
                .set({ isDefault: false })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.paymentMethods.userId, paymentMethod.userId), (0, drizzle_orm_1.eq)(schema_1.paymentMethods.isDefault, true)));
        }
        const result = await db_1.db
            .update(schema_1.paymentMethods)
            .set({ isDefault })
            .where((0, drizzle_orm_1.eq)(schema_1.paymentMethods.id, id))
            .returning();
        return result.length ? result[0] : undefined;
    }
    async deletePaymentMethod(id) {
        const result = await db_1.db
            .delete(schema_1.paymentMethods)
            .where((0, drizzle_orm_1.eq)(schema_1.paymentMethods.id, id))
            .returning({ id: schema_1.paymentMethods.id });
        return result.length > 0;
    }
    // Payments methods
    async getPayment(id) {
        const result = await db_1.db.select().from(schema_1.payments).where((0, drizzle_orm_1.eq)(schema_1.payments.id, id)).limit(1);
        return result.length ? result[0] : undefined;
    }
    async getPaymentsByUserId(userId) {
        const result = await db_1.db
            .select()
            .from(schema_1.payments)
            .where((0, drizzle_orm_1.eq)(schema_1.payments.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.payments.createdAt));
        return result;
    }
    async getPaymentsByProviderPaymentId(providerPaymentId) {
        const result = await db_1.db
            .select()
            .from(schema_1.payments)
            .where((0, drizzle_orm_1.eq)(schema_1.payments.providerPaymentId, providerPaymentId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.payments.createdAt));
        return result;
    }
    async createPayment(payment) {
        const result = await db_1.db.insert(schema_1.payments).values(payment).returning();
        return result[0];
    }
    async updatePaymentStatus(id, status, processedAt) {
        const updates = { status };
        if (processedAt) {
            updates.processedAt = processedAt;
        }
        const result = await db_1.db
            .update(schema_1.payments)
            .set(updates)
            .where((0, drizzle_orm_1.eq)(schema_1.payments.id, id))
            .returning();
        return result.length ? result[0] : undefined;
    }
    // Wallet Health Score methods
    async getWalletHealthScoresByUserId(userId) {
        try {
            // First get the user's wallets
            const userWallets = await this.getWalletsByUserId(userId);
            if (userWallets.length === 0) {
                return [];
            }
            const walletIds = userWallets.map(wallet => wallet.id);
            // Get health scores for these wallets
            const scores = await db_1.db.select()
                .from(schema_1.walletHealthScores)
                .where((0, drizzle_orm_1.inArray)(schema_1.walletHealthScores.walletId, walletIds))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.walletHealthScores.createdAt));
            return scores;
        }
        catch (error) {
            console.error('Error getting wallet health scores by user ID:', error);
            return [];
        }
    }
    async getWalletHealthScoreByWalletId(walletId) {
        try {
            const scores = await db_1.db.select()
                .from(schema_1.walletHealthScores)
                .where((0, drizzle_orm_1.eq)(schema_1.walletHealthScores.walletId, walletId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.walletHealthScores.createdAt))
                .limit(1);
            return scores.length ? scores[0] : undefined;
        }
        catch (error) {
            console.error('Error getting wallet health score by wallet ID:', error);
            return undefined;
        }
    }
    async createWalletHealthScore(insertScore) {
        try {
            const result = await db_1.db.insert(schema_1.walletHealthScores)
                .values(insertScore)
                .returning();
            return result[0];
        }
        catch (error) {
            console.error('Error creating wallet health score:', error);
            throw error;
        }
    }
    // Wallet Health Issue methods
    async getWalletHealthIssuesByScoreId(healthScoreId) {
        try {
            const issues = await db_1.db.select()
                .from(schema_1.walletHealthIssues)
                .where((0, drizzle_orm_1.eq)(schema_1.walletHealthIssues.healthScoreId, healthScoreId))
                .orderBy(
            // Order by severity first (critical, high, medium, low)
            (0, drizzle_orm_1.sql) `CASE 
            WHEN ${schema_1.walletHealthIssues.severity} = 'critical' THEN 1
            WHEN ${schema_1.walletHealthIssues.severity} = 'high' THEN 2
            WHEN ${schema_1.walletHealthIssues.severity} = 'medium' THEN 3
            WHEN ${schema_1.walletHealthIssues.severity} = 'low' THEN 4
            ELSE 5
          END`, 
            // Then by creation date (newest first)
            (0, drizzle_orm_1.desc)(schema_1.walletHealthIssues.createdAt));
            return issues;
        }
        catch (error) {
            console.error('Error getting wallet health issues by score ID:', error);
            return [];
        }
    }
    async createWalletHealthIssue(insertIssue) {
        try {
            const result = await db_1.db.insert(schema_1.walletHealthIssues)
                .values(insertIssue)
                .returning();
            return result[0];
        }
        catch (error) {
            console.error('Error creating wallet health issue:', error);
            throw error;
        }
    }
    async updateWalletHealthIssueResolved(id, resolved) {
        try {
            const now = new Date();
            const updates = {
                resolved,
                resolvedAt: resolved ? now : null
            };
            const result = await db_1.db.update(schema_1.walletHealthIssues)
                .set(updates)
                .where((0, drizzle_orm_1.eq)(schema_1.walletHealthIssues.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating wallet health issue resolved status:', error);
            return undefined;
        }
    }
    // Notification Preference methods
    async getNotificationPreference(id) {
        try {
            const result = await db_1.db.select()
                .from(schema_1.notificationPreferences)
                .where((0, drizzle_orm_1.eq)(schema_1.notificationPreferences.id, id))
                .limit(1);
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error getting notification preference:', error);
            return undefined;
        }
    }
    async getNotificationPreferenceByUserId(userId) {
        try {
            const result = await db_1.db.select()
                .from(schema_1.notificationPreferences)
                .where((0, drizzle_orm_1.eq)(schema_1.notificationPreferences.userId, userId))
                .limit(1);
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error getting notification preference by user ID:', error);
            return undefined;
        }
    }
    async createNotificationPreference(preference) {
        try {
            const result = await db_1.db.insert(schema_1.notificationPreferences)
                .values(preference)
                .returning();
            return result[0];
        }
        catch (error) {
            console.error('Error creating notification preference:', error);
            throw error;
        }
    }
    async updateNotificationPreference(id, updates) {
        try {
            const now = new Date();
            const updatesWithTimestamp = {
                ...updates,
                updatedAt: now
            };
            const result = await db_1.db.update(schema_1.notificationPreferences)
                .set(updatesWithTimestamp)
                .where((0, drizzle_orm_1.eq)(schema_1.notificationPreferences.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating notification preference:', error);
            return undefined;
        }
    }
    async updateNotificationPreferences(userId, data) {
        try {
            // Find the user's notification preference
            const preference = await this.getNotificationPreferenceByUserId(userId);
            if (!preference)
                return undefined;
            const now = new Date();
            const updates = {
                ...data,
                updatedAt: now
            };
            const result = await db_1.db.update(schema_1.notificationPreferences)
                .set(updates)
                .where((0, drizzle_orm_1.eq)(schema_1.notificationPreferences.id, preference.id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating notification preferences:', error);
            return undefined;
        }
    }
    async updatePhoneNumber(userId, phoneNumber, isVerified = false) {
        try {
            // Find the user's notification preference
            const preference = await this.getNotificationPreferenceByUserId(userId);
            if (!preference)
                return undefined;
            const now = new Date();
            const updates = {
                phoneNumber,
                isPhoneVerified: isVerified,
                updatedAt: now
            };
            const result = await db_1.db.update(schema_1.notificationPreferences)
                .set(updates)
                .where((0, drizzle_orm_1.eq)(schema_1.notificationPreferences.id, preference.id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating phone number:', error);
            return undefined;
        }
    }
    async verifyPhoneNumber(userId, isVerified) {
        try {
            // Find the user's notification preference
            const preference = await this.getNotificationPreferenceByUserId(userId);
            if (!preference)
                return undefined;
            // If user doesn't have a phone number, we can't verify
            if (!preference.phoneNumber)
                return undefined;
            const now = new Date();
            const updates = {
                isPhoneVerified: isVerified,
                updatedAt: now
            };
            const result = await db_1.db.update(schema_1.notificationPreferences)
                .set(updates)
                .where((0, drizzle_orm_1.eq)(schema_1.notificationPreferences.id, preference.id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error verifying phone number:', error);
            return undefined;
        }
    }
    async updateMatrixId(userId, matrixId, isVerified = false) {
        try {
            // Find the user's notification preference
            const preference = await this.getNotificationPreferenceByUserId(userId);
            if (!preference)
                return undefined;
            const now = new Date();
            const updates = {
                matrixId: matrixId,
                isMatrixVerified: isVerified,
                updatedAt: now
            };
            const result = await db_1.db.update(schema_1.notificationPreferences)
                .set(updates)
                .where((0, drizzle_orm_1.eq)(schema_1.notificationPreferences.id, preference.id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating Matrix ID:', error);
            return undefined;
        }
    }
    async verifyMatrixId(userId, isVerified) {
        try {
            // Find the user's notification preference
            const preference = await this.getNotificationPreferenceByUserId(userId);
            if (!preference)
                return undefined;
            // If user doesn't have a Matrix ID, we can't verify
            if (!preference.matrixId)
                return undefined;
            const now = new Date();
            const updates = {
                isMatrixVerified: isVerified,
                updatedAt: now
            };
            const result = await db_1.db.update(schema_1.notificationPreferences)
                .set(updates)
                .where((0, drizzle_orm_1.eq)(schema_1.notificationPreferences.id, preference.id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error verifying Matrix ID:', error);
            return undefined;
        }
    }
    // User API Keys for Mysterion LLM training
    async getUserApiKey(id) {
        try {
            const result = await db_1.db.select()
                .from(schema_1.userApiKeys)
                .where((0, drizzle_orm_1.eq)(schema_1.userApiKeys.id, id))
                .limit(1);
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error getting user API key:', error);
            return undefined;
        }
    }
    async getUserApiKeysByUserId(userId) {
        try {
            const result = await db_1.db.select()
                .from(schema_1.userApiKeys)
                .where((0, drizzle_orm_1.eq)(schema_1.userApiKeys.userId, userId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.userApiKeys.createdAt));
            return result;
        }
        catch (error) {
            console.error('Error getting user API keys by user ID:', error);
            return [];
        }
    }
    async getUserApiKeysByService(userId, service) {
        try {
            const result = await db_1.db.select()
                .from(schema_1.userApiKeys)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userApiKeys.userId, userId), (0, drizzle_orm_1.eq)(schema_1.userApiKeys.service, service)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.userApiKeys.createdAt));
            return result;
        }
        catch (error) {
            console.error('Error getting user API keys by service:', error);
            return [];
        }
    }
    async createUserApiKey(insertUserApiKey) {
        try {
            // Import the vault service here to avoid circular dependencies
            const { storeApiKey } = await Promise.resolve().then(() => __importStar(require('./services/quantum-vault')));
            // First store the API key in the quantum vault
            const { keyId, isSuccess } = await storeApiKey(insertUserApiKey.userId, insertUserApiKey.service, insertUserApiKey.apiKey || '');
            if (!isSuccess) {
                throw new Error('Failed to store API key in quantum vault');
            }
            // Store a reference in the database without the actual API key
            const dbRecord = {
                ...insertUserApiKey,
                apiKey: undefined, // Remove the key from the database record
                vaultKeyId: keyId, // Store the vault reference instead
            };
            const result = await db_1.db.insert(schema_1.userApiKeys).values(dbRecord).returning();
            return result[0];
        }
        catch (error) {
            console.error('Error creating user API key:', error);
            throw error;
        }
    }
    async updateUserApiKeyStatus(id, isActive) {
        try {
            const result = await db_1.db.update(schema_1.userApiKeys)
                .set({ isActive, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.userApiKeys.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating user API key status:', error);
            return undefined;
        }
    }
    async updateUserApiKeyTrainingStatus(id, isTrainingEnabled) {
        try {
            const result = await db_1.db.update(schema_1.userApiKeys)
                .set({ isTrainingEnabled, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.userApiKeys.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating user API key training status:', error);
            return undefined;
        }
    }
    async incrementUserApiKeyUsage(id) {
        try {
            // Get the current API key to get the current usage count
            const currentKey = await this.getUserApiKey(id);
            if (!currentKey)
                return undefined;
            const result = await db_1.db.update(schema_1.userApiKeys)
                .set({
                usageCount: (currentKey.usageCount || 0) + 1,
                lastUsedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.userApiKeys.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error incrementing user API key usage:', error);
            return undefined;
        }
    }
    async deleteUserApiKey(id) {
        try {
            // Import the vault service here to avoid circular dependencies
            const { deleteApiKey } = await Promise.resolve().then(() => __importStar(require('./services/quantum-vault')));
            // Get the API key record to get the vault key ID
            const apiKey = await this.getUserApiKey(id);
            if (!apiKey)
                return false;
            // Delete the API key from the vault
            if (apiKey.vaultKeyId) {
                await deleteApiKey(apiKey.userId, apiKey.vaultKeyId);
            }
            // Delete the database record
            const result = await db_1.db.delete(schema_1.userApiKeys)
                .where((0, drizzle_orm_1.eq)(schema_1.userApiKeys.id, id))
                .returning({ id: schema_1.userApiKeys.id });
            return result.length > 0;
        }
        catch (error) {
            console.error('Error deleting user API key:', error);
            return false;
        }
    }
    // Mysterion Training Data
    async getMysterionTrainingData(id) {
        try {
            const result = await db_1.db.select()
                .from(schema_1.mysterionTrainingData)
                .where((0, drizzle_orm_1.eq)(schema_1.mysterionTrainingData.id, id))
                .limit(1);
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error getting mysterion training data:', error);
            return undefined;
        }
    }
    async getMysterionTrainingDataByApiKeyId(apiKeyId) {
        try {
            const result = await db_1.db.select()
                .from(schema_1.mysterionTrainingData)
                .where((0, drizzle_orm_1.eq)(schema_1.mysterionTrainingData.apiKeyId, apiKeyId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.mysterionTrainingData.createdAt));
            return result;
        }
        catch (error) {
            console.error('Error getting mysterion training data by API key ID:', error);
            return [];
        }
    }
    async createMysterionTrainingData(insertTrainingData) {
        try {
            const result = await db_1.db.insert(schema_1.mysterionTrainingData)
                .values(insertTrainingData)
                .returning();
            return result[0];
        }
        catch (error) {
            console.error('Error creating mysterion training data:', error);
            throw error;
        }
    }
    async updateMysterionTrainingDataStatus(id, status, notes) {
        try {
            const updates = {
                status,
                updatedAt: new Date()
            };
            if (notes !== undefined) {
                updates.notes = notes;
            }
            const result = await db_1.db.update(schema_1.mysterionTrainingData)
                .set(updates)
                .where((0, drizzle_orm_1.eq)(schema_1.mysterionTrainingData.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating mysterion training data status:', error);
            return undefined;
        }
    }
    async updateMysterionTrainingDataPoints(id, points) {
        try {
            // Get the current training data to get the current points
            const currentData = await this.getMysterionTrainingData(id);
            if (!currentData)
                return undefined;
            const result = await db_1.db.update(schema_1.mysterionTrainingData)
                .set({
                points: (currentData.points || 0) + points,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.mysterionTrainingData.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating mysterion training data points:', error);
            return undefined;
        }
    }
    // Bridge Configuration methods
    async getBridgeConfiguration(id) {
        try {
            const result = await db_1.db.select()
                .from(bridge_schema_1.bridgeConfigurations)
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeConfigurations.id, id))
                .limit(1);
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error getting bridge configuration:', error);
            return undefined;
        }
    }
    async getBridgeConfigurations(status) {
        try {
            let query = db_1.db.select().from(bridge_schema_1.bridgeConfigurations);
            if (status) {
                query = query.where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeConfigurations.status, status));
            }
            return await query.orderBy((0, drizzle_orm_1.desc)(bridge_schema_1.bridgeConfigurations.updatedAt));
        }
        catch (error) {
            console.error('Error getting bridge configurations:', error);
            return [];
        }
    }
    async getBridgeConfigurationByNetworks(sourceNetwork, targetNetwork) {
        try {
            const result = await db_1.db.select()
                .from(bridge_schema_1.bridgeConfigurations)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeConfigurations.sourceNetwork, sourceNetwork), (0, drizzle_orm_1.eq)(bridge_schema_1.bridgeConfigurations.targetNetwork, targetNetwork), (0, drizzle_orm_1.eq)(bridge_schema_1.bridgeConfigurations.status, schema_1.BridgeStatus.ACTIVE)))
                .limit(1);
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error getting bridge configuration by networks:', error);
            return undefined;
        }
    }
    async createBridgeConfiguration(config) {
        try {
            const result = await db_1.db.insert(bridge_schema_1.bridgeConfigurations)
                .values(config)
                .returning();
            return result[0];
        }
        catch (error) {
            console.error('Error creating bridge configuration:', error);
            throw error;
        }
    }
    async updateBridgeConfigurationStatus(id, status) {
        try {
            const result = await db_1.db.update(bridge_schema_1.bridgeConfigurations)
                .set({
                status,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeConfigurations.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating bridge configuration status:', error);
            return undefined;
        }
    }
    async updateBridgeConfiguration(id, updates) {
        try {
            // Add updated timestamp
            const updatesWithTimestamp = {
                ...updates,
                updatedAt: new Date()
            };
            const result = await db_1.db.update(bridge_schema_1.bridgeConfigurations)
                .set(updatesWithTimestamp)
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeConfigurations.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating bridge configuration:', error);
            return undefined;
        }
    }
    // Bridge Validators methods
    async getBridgeValidator(id) {
        try {
            const result = await db_1.db.select()
                .from(bridge_schema_1.bridgeValidators)
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeValidators.id, id))
                .limit(1);
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error getting bridge validator:', error);
            return undefined;
        }
    }
    async getBridgeValidatorsByBridgeId(bridgeId) {
        try {
            return await db_1.db.select()
                .from(bridge_schema_1.bridgeValidators)
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeValidators.bridgeId, bridgeId))
                .orderBy((0, drizzle_orm_1.desc)(bridge_schema_1.bridgeValidators.isActive), (0, drizzle_orm_1.desc)(bridge_schema_1.bridgeValidators.reputation));
        }
        catch (error) {
            console.error('Error getting bridge validators by bridge ID:', error);
            return [];
        }
    }
    async createBridgeValidator(validator) {
        try {
            const result = await db_1.db.insert(bridge_schema_1.bridgeValidators)
                .values(validator)
                .returning();
            return result[0];
        }
        catch (error) {
            console.error('Error creating bridge validator:', error);
            throw error;
        }
    }
    async updateBridgeValidatorStatus(id, status) {
        try {
            const result = await db_1.db.update(bridge_schema_1.bridgeValidators)
                .set({ status })
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeValidators.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating bridge validator status:', error);
            return undefined;
        }
    }
    async updateBridgeValidatorHeartbeat(id) {
        try {
            const now = new Date();
            const result = await db_1.db.update(bridge_schema_1.bridgeValidators)
                .set({ lastHeartbeat: now })
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeValidators.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating bridge validator heartbeat:', error);
            return undefined;
        }
    }
    async updateBridgeValidatorReputation(id, reputation) {
        try {
            const result = await db_1.db.update(bridge_schema_1.bridgeValidators)
                .set({ reputation })
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeValidators.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating bridge validator reputation:', error);
            return undefined;
        }
    }
    // Bridge Supported Tokens methods
    async getBridgeSupportedToken(id) {
        try {
            const result = await db_1.db.select()
                .from(bridge_schema_1.bridgeSupportedTokens)
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeSupportedTokens.id, id))
                .limit(1);
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error getting bridge supported token:', error);
            return undefined;
        }
    }
    async getBridgeSupportedTokensByBridgeId(bridgeId) {
        try {
            return await db_1.db.select()
                .from(bridge_schema_1.bridgeSupportedTokens)
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeSupportedTokens.bridgeId, bridgeId))
                .orderBy((0, drizzle_orm_1.desc)(bridge_schema_1.bridgeSupportedTokens.isEnabled), (0, drizzle_orm_1.asc)(bridge_schema_1.bridgeSupportedTokens.tokenName));
        }
        catch (error) {
            console.error('Error getting bridge supported tokens by bridge ID:', error);
            return [];
        }
    }
    async getBridgeSupportedTokenBySymbol(bridgeId, tokenSymbol) {
        try {
            const result = await db_1.db.select()
                .from(bridge_schema_1.bridgeSupportedTokens)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeSupportedTokens.bridgeId, bridgeId), (0, drizzle_orm_1.eq)(bridge_schema_1.bridgeSupportedTokens.tokenSymbol, tokenSymbol)))
                .limit(1);
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error getting bridge supported token by symbol:', error);
            return undefined;
        }
    }
    async createBridgeSupportedToken(token) {
        try {
            const result = await db_1.db.insert(bridge_schema_1.bridgeSupportedTokens)
                .values(token)
                .returning();
            return result[0];
        }
        catch (error) {
            console.error('Error creating bridge supported token:', error);
            throw error;
        }
    }
    async updateBridgeSupportedTokenStatus(id, isEnabled) {
        try {
            const result = await db_1.db.update(bridge_schema_1.bridgeSupportedTokens)
                .set({
                isEnabled,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeSupportedTokens.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating bridge supported token status:', error);
            return undefined;
        }
    }
    // Bridge Transactions methods
    async getBridgeTransaction(id) {
        try {
            const result = await db_1.db.select()
                .from(bridge_schema_1.bridgeTransactions)
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeTransactions.id, id))
                .limit(1);
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error getting bridge transaction:', error);
            return undefined;
        }
    }
    async getBridgeTransactionsByBridgeId(bridgeId, limit = 50) {
        try {
            return await db_1.db.select()
                .from(bridge_schema_1.bridgeTransactions)
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeTransactions.bridgeId, bridgeId))
                .orderBy((0, drizzle_orm_1.desc)(bridge_schema_1.bridgeTransactions.initiatedAt))
                .limit(limit);
        }
        catch (error) {
            console.error('Error getting bridge transactions by bridge ID:', error);
            return [];
        }
    }
    async getBridgeTransactionsByUserId(userId, limit = 50) {
        try {
            return await db_1.db.select()
                .from(bridge_schema_1.bridgeTransactions)
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeTransactions.userId, userId))
                .orderBy((0, drizzle_orm_1.desc)(bridge_schema_1.bridgeTransactions.initiatedAt))
                .limit(limit);
        }
        catch (error) {
            console.error('Error getting bridge transactions by user ID:', error);
            return [];
        }
    }
    async getBridgeTransactionsBySourceHash(sourceTransactionHash) {
        try {
            const result = await db_1.db.select()
                .from(bridge_schema_1.bridgeTransactions)
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeTransactions.sourceTransactionHash, sourceTransactionHash))
                .limit(1);
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error getting bridge transaction by source hash:', error);
            return undefined;
        }
    }
    async getBridgeTransactionsByStatus(status, limit = 50) {
        try {
            return await db_1.db.select()
                .from(bridge_schema_1.bridgeTransactions)
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeTransactions.status, status))
                .orderBy((0, drizzle_orm_1.desc)(bridge_schema_1.bridgeTransactions.initiatedAt))
                .limit(limit);
        }
        catch (error) {
            console.error('Error getting bridge transactions by status:', error);
            return [];
        }
    }
    async createBridgeTransaction(transaction) {
        try {
            const result = await db_1.db.insert(bridge_schema_1.bridgeTransactions)
                .values(transaction)
                .returning();
            return result[0];
        }
        catch (error) {
            console.error('Error creating bridge transaction:', error);
            throw error;
        }
    }
    async updateBridgeTransactionStatus(id, status, errorMessage) {
        try {
            const updates = { status };
            // Add error message if provided
            if (errorMessage) {
                updates.errorMessage = errorMessage;
            }
            // If the status is COMPLETED, add completion timestamp
            if (status === schema_1.BridgeTransactionStatus.COMPLETED) {
                updates.completedAt = new Date();
            }
            const result = await db_1.db.update(bridge_schema_1.bridgeTransactions)
                .set(updates)
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeTransactions.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating bridge transaction status:', error);
            return undefined;
        }
    }
    async updateBridgeTransactionTargetHash(id, targetTransactionHash) {
        try {
            const result = await db_1.db.update(bridge_schema_1.bridgeTransactions)
                .set({ targetTransactionHash })
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeTransactions.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error updating bridge transaction target hash:', error);
            return undefined;
        }
    }
    async addBridgeTransactionValidation(id, validatorId, signature) {
        try {
            // First get the current validations array
            const transaction = await this.getBridgeTransaction(id);
            if (!transaction) {
                return undefined;
            }
            // Add the new validation
            const validationsArray = Array.isArray(transaction.validations) ? transaction.validations : [];
            validationsArray.push({
                validatorId,
                signature,
                timestamp: new Date()
            });
            // Update the transaction
            const result = await db_1.db.update(bridge_schema_1.bridgeTransactions)
                .set({
                validations: (0, drizzle_orm_1.sql) `${JSON.stringify(validationsArray)}`
            })
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeTransactions.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error adding bridge transaction validation:', error);
            return undefined;
        }
    }
    async completeBridgeTransaction(id, targetTransactionHash) {
        try {
            const now = new Date();
            const result = await db_1.db.update(bridge_schema_1.bridgeTransactions)
                .set({
                status: schema_1.BridgeTransactionStatus.COMPLETED,
                targetTransactionHash,
                completedAt: now
            })
                .where((0, drizzle_orm_1.eq)(bridge_schema_1.bridgeTransactions.id, id))
                .returning();
            return result.length ? result[0] : undefined;
        }
        catch (error) {
            console.error('Error completing bridge transaction:', error);
            return undefined;
        }
    }
}
exports.PgStorage = PgStorage;
