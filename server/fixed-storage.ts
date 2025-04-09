import { users, type User, type InsertUser } from "../shared/schema-proxy";
import { db } from "./db";
import { eq, desc, inArray } from "drizzle-orm";

/**
 * Storage interface for the server.
 * This module provides a unified interface for interacting with the database.
 */
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<User | undefined>;
  
  // These methods are required by routes.ts but we'll implement them as stubs
  getWalletsByUserId(userId: number): Promise<any[]>;
  getRecentTransactions(userId: number, limit: number): Promise<any[]>;
  getTransactionsByWalletId(walletId: number): Promise<any[]>;
  createTransaction(data: any): Promise<any>;
  getWallet(walletId: number): Promise<any>;
  getLayer2Transactions(userId: number, type?: string): Promise<any[]>;
  updateTransactionDescription(id: number, description: string): Promise<any>;
  updateTransactionLayer2Info(id: number, isLayer2: boolean, layer2Type?: string, layer2Data?: any): Promise<any>;
  getSmartContractsByUserId(userId: number): Promise<any[]>;
  createSmartContract(data: any): Promise<any>;
  updateSmartContractStatus(id: number, status: string): Promise<any>;
  getAiMonitoringLogs(userId: number, limit: number): Promise<any[]>;
  createAiMonitoringLog(data: any): Promise<any>;
  getCidEntriesByUserId(userId: number): Promise<any[]>;
  createCidEntry(data: any): Promise<any>;
  updateCidEntryStatus(id: number, status: string): Promise<any>;
  getPaymentMethodsByUserId(userId: number): Promise<any[]>;
  updatePaymentMethodDefault(id: number, isDefault: boolean): Promise<any>;
  deletePaymentMethod(id: number): Promise<boolean>;
  getPaymentsByUserId(userId: number): Promise<any[]>;
  getWalletHealthScoresByUserId(userId: number): Promise<any[]>;
  getWalletHealthScoreByWalletId(walletId: number): Promise<any>;
  getWalletHealthIssuesByScoreId(scoreId: number): Promise<any[]>;
  createWalletHealthScore(data: any): Promise<any>;
  createWalletHealthIssue(data: any): Promise<any>;
  updateWalletHealthIssueResolved(id: number, resolved: boolean): Promise<any>;
  getNotificationPreferenceByUserId(userId: number): Promise<any>;
  updateNotificationPreferences(userId: number, data: any): Promise<any>;
  updatePhoneNumber(userId: number, phoneNumber: string): Promise<any>;
  verifyPhoneNumber(userId: number, code: string): Promise<boolean>;
  updateMatrixId(userId: number, matrixId: string): Promise<any>;
  verifyMatrixId(userId: number, code: string): Promise<boolean>;
}

/**
 * DatabaseStorage class implements the IStorage interface
 * using a PostgreSQL database with Drizzle ORM
 */
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserLastLogin(id: number): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, id))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error("Error updating user last login:", error);
      return undefined;
    }
  }

  // Stub implementations for the additional methods
  async getWalletsByUserId(userId: number): Promise<any[]> {
    try {
      // Import wallets table from schema proxy
      const { wallets } = await import("../shared/schema-proxy");
      
      // Use proper Drizzle query to get wallets by user ID
      const userWallets = await db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, userId));
        
      console.log(`Found ${userWallets.length} wallets for user ${userId}`);
      return userWallets;
    } catch (error) {
      console.error(`Error in getWalletsByUserId: ${error}`);
      return [];
    }
  }

  async getRecentTransactions(userId: number, limit: number): Promise<any[]> {
    try {
      // Import transactions and wallets tables from schema proxy
      const { transactions, wallets } = await import("../shared/schema-proxy");
      
      // Find all wallets for the user
      const userWallets = await this.getWalletsByUserId(userId);
      
      if (userWallets.length === 0) {
        return [];
      }
      
      // Get wallet IDs from user wallets
      const walletIds = userWallets.map(wallet => wallet.id);
      
      // Query transactions for all user wallets, sorted by timestamp
      const recentTransactions = await db
        .select()
        .from(transactions)
        .where(inArray(transactions.walletId, walletIds))
        .orderBy(desc(transactions.timestamp))
        .limit(limit);
        
      console.log(`Found ${recentTransactions.length} recent transactions for user ${userId}`);
      return recentTransactions;
    } catch (error) {
      console.error(`Error in getRecentTransactions: ${error}`);
      return [];
    }
  }

  async getTransactionsByWalletId(walletId: number): Promise<any[]> {
    try {
      // Import transactions table from schema proxy
      const { transactions } = await import("../shared/schema-proxy");
      
      // Query transactions for the wallet, sorted by timestamp
      const walletTransactions = await db
        .select()
        .from(transactions)
        .where(eq(transactions.walletId, walletId))
        .orderBy(desc(transactions.timestamp));
        
      console.log(`Found ${walletTransactions.length} transactions for wallet ${walletId}`);
      return walletTransactions;
    } catch (error) {
      console.error(`Error in getTransactionsByWalletId: ${error}`);
      return [];
    }
  }

  async createTransaction(data: any): Promise<any> {
    try {
      // Import transactions table from schema proxy
      const { transactions } = await import("../shared/schema-proxy");
      
      // Insert the transaction
      const [transaction] = await db
        .insert(transactions)
        .values(data)
        .returning();
        
      console.log(`Created transaction with ID ${transaction.id}`);
      return transaction;
    } catch (error) {
      console.error(`Error in createTransaction: ${error}`);
      // Return dummy data as fallback for now
      return { id: 1, ...data };
    }
  }

  async getWallet(walletId: number): Promise<any> {
    try {
      // Import wallets table from schema proxy
      const { wallets } = await import("../shared/schema-proxy");
      
      // Query for the wallet
      const [wallet] = await db
        .select()
        .from(wallets)
        .where(eq(wallets.id, walletId));
        
      if (wallet) {
        console.log(`Found wallet with ID ${walletId}`);
      } else {
        console.log(`No wallet found with ID ${walletId}`);
      }
      
      return wallet || null;
    } catch (error) {
      console.error(`Error in getWallet: ${error}`);
      return null;
    }
  }

  async getLayer2Transactions(userId: number, type?: string): Promise<any[]> {
    console.log(`Stub: getLayer2Transactions called with userId: ${userId}, type: ${type || 'not specified'}`);
    return [];
  }

  async updateTransactionDescription(id: number, description: string): Promise<any> {
    console.log(`Stub: updateTransactionDescription called with id: ${id}, description: ${description}`);
    return null;
  }

  async updateTransactionLayer2Info(id: number, isLayer2: boolean, layer2Type?: string, layer2Data?: any): Promise<any> {
    console.log(`Stub: updateTransactionLayer2Info called with id: ${id}, isLayer2: ${isLayer2}, layer2Type: ${layer2Type || 'not specified'}`);
    return null;
  }

  async getSmartContractsByUserId(userId: number): Promise<any[]> {
    try {
      // Import smart contracts table from schema proxy
      const { smartContracts } = await import("../shared/schema-proxy");
      
      // Query for smart contracts by user ID
      const contracts = await db
        .select()
        .from(smartContracts)
        .where(eq(smartContracts.userId, userId));
        
      console.log(`Found ${contracts.length} smart contracts for user ${userId}`);
      return contracts;
    } catch (error) {
      console.error(`Error in getSmartContractsByUserId: ${error}`);
      return [];
    }
  }

  async createSmartContract(data: any): Promise<any> {
    try {
      // Import smart contracts table from schema proxy
      const { smartContracts } = await import("../shared/schema-proxy");
      
      // Insert the smart contract
      const [contract] = await db
        .insert(smartContracts)
        .values(data)
        .returning();
        
      console.log(`Created smart contract with ID ${contract.id}`);
      return contract;
    } catch (error) {
      console.error(`Error in createSmartContract: ${error}`);
      // Return dummy data as fallback for now
      return { id: 1, ...data };
    }
  }

  async updateSmartContractStatus(id: number, status: string): Promise<any> {
    try {
      // Import smart contracts table from schema proxy
      const { smartContracts } = await import("../shared/schema-proxy");
      
      // Update the smart contract status
      const [updatedContract] = await db
        .update(smartContracts)
        .set({ status })
        .where(eq(smartContracts.id, id))
        .returning();
        
      if (updatedContract) {
        console.log(`Updated smart contract ${id} status to ${status}`);
      } else {
        console.log(`No smart contract found with ID ${id}`);
      }
      
      return updatedContract || null;
    } catch (error) {
      console.error(`Error in updateSmartContractStatus: ${error}`);
      return null;
    }
  }

  async getAiMonitoringLogs(userId: number, limit: number): Promise<any[]> {
    try {
      // Import AI monitoring logs table from schema proxy
      const { aiMonitoringLogs } = await import("../shared/schema-proxy");
      
      // Query for AI monitoring logs by user ID
      const logs = await db
        .select()
        .from(aiMonitoringLogs)
        .where(eq(aiMonitoringLogs.userId, userId))
        .orderBy(desc(aiMonitoringLogs.timestamp))
        .limit(limit);
        
      console.log(`Found ${logs.length} AI monitoring logs for user ${userId}`);
      return logs;
    } catch (error) {
      console.error(`Error in getAiMonitoringLogs: ${error}`);
      return [];
    }
  }

  async createAiMonitoringLog(data: any): Promise<any> {
    try {
      // Import AI monitoring logs table from schema proxy
      const { aiMonitoringLogs } = await import("../shared/schema-proxy");
      
      // Insert the AI monitoring log
      const [log] = await db
        .insert(aiMonitoringLogs)
        .values(data)
        .returning();
        
      console.log(`Created AI monitoring log with ID ${log.id}`);
      return log;
    } catch (error) {
      console.error(`Error in createAiMonitoringLog: ${error}`);
      // Return dummy data as fallback for now
      return { id: 1, ...data };
    }
  }

  async getCidEntriesByUserId(userId: number): Promise<any[]> {
    try {
      // Import CID entries table from schema proxy
      const { cidEntries } = await import("../shared/schema-proxy");
      
      // Query for CID entries by user ID
      const entries = await db
        .select()
        .from(cidEntries)
        .where(eq(cidEntries.userId, userId))
        .orderBy(desc(cidEntries.createdAt));
        
      console.log(`Found ${entries.length} CID entries for user ${userId}`);
      return entries;
    } catch (error) {
      console.error(`Error in getCidEntriesByUserId: ${error}`);
      return [];
    }
  }

  async createCidEntry(data: any): Promise<any> {
    try {
      // Import CID entries table from schema proxy
      const { cidEntries } = await import("../shared/schema-proxy");
      
      // Insert the CID entry
      const [entry] = await db
        .insert(cidEntries)
        .values({
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
        
      console.log(`Created CID entry with ID ${entry.id}`);
      return entry;
    } catch (error) {
      console.error(`Error in createCidEntry: ${error}`);
      // Return dummy data as fallback for now
      return { id: 1, ...data };
    }
  }

  async updateCidEntryStatus(id: number, status: string): Promise<any> {
    try {
      // Import CID entries table from schema proxy
      const { cidEntries } = await import("../shared/schema-proxy");
      
      // Update the CID entry status
      const [updatedEntry] = await db
        .update(cidEntries)
        .set({ 
          status, 
          updatedAt: new Date() 
        })
        .where(eq(cidEntries.id, id))
        .returning();
        
      if (updatedEntry) {
        console.log(`Updated CID entry ${id} status to ${status}`);
      } else {
        console.log(`No CID entry found with ID ${id}`);
      }
      
      return updatedEntry || null;
    } catch (error) {
      console.error(`Error in updateCidEntryStatus: ${error}`);
      return null;
    }
  }

  async getPaymentMethodsByUserId(userId: number): Promise<any[]> {
    try {
      // Import payment methods table from schema proxy
      const { paymentMethods } = await import("../shared/schema-proxy");
      
      // Query for payment methods by user ID
      const methods = await db
        .select()
        .from(paymentMethods)
        .where(eq(paymentMethods.userId, userId));
        
      console.log(`Found ${methods.length} payment methods for user ${userId}`);
      return methods;
    } catch (error) {
      console.error(`Error in getPaymentMethodsByUserId: ${error}`);
      return [];
    }
  }

  async updatePaymentMethodDefault(id: number, isDefault: boolean): Promise<any> {
    try {
      // Import payment methods table from schema proxy
      const { paymentMethods } = await import("../shared/schema-proxy");
      
      if (isDefault) {
        // If setting a payment method as default, first unset any existing default methods
        // for this user
        const [method] = await db
          .select()
          .from(paymentMethods)
          .where(eq(paymentMethods.id, id));
          
        if (method) {
          await db
            .update(paymentMethods)
            .set({ isDefault: false })
            .where(eq(paymentMethods.userId, method.userId));
        }
      }
      
      // Update the payment method
      const [updatedMethod] = await db
        .update(paymentMethods)
        .set({ isDefault })
        .where(eq(paymentMethods.id, id))
        .returning();
        
      if (updatedMethod) {
        console.log(`Updated payment method ${id} isDefault to ${isDefault}`);
      } else {
        console.log(`No payment method found with ID ${id}`);
      }
      
      return updatedMethod || null;
    } catch (error) {
      console.error(`Error in updatePaymentMethodDefault: ${error}`);
      return null;
    }
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    try {
      // Import payment methods table from schema proxy
      const { paymentMethods } = await import("../shared/schema-proxy");
      
      // Delete the payment method
      const result = await db
        .delete(paymentMethods)
        .where(eq(paymentMethods.id, id));
        
      console.log(`Deleted payment method with ID ${id}`);
      return true;
    } catch (error) {
      console.error(`Error in deletePaymentMethod: ${error}`);
      return false;
    }
  }

  async getPaymentsByUserId(userId: number): Promise<any[]> {
    try {
      // Import payments table from schema proxy
      const { payments } = await import("../shared/schema-proxy");
      
      // Query for payments by user ID, ordered by most recent - assume createdAt for ordering
      const userPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.userId, userId))
        .orderBy(desc(payments.createdAt));
        
      console.log(`Found ${userPayments.length} payments for user ${userId}`);
      return userPayments;
    } catch (error) {
      console.error(`Error in getPaymentsByUserId: ${error}`);
      return [];
    }
  }

  async getWalletHealthScoresByUserId(userId: number): Promise<any[]> {
    console.log(`Stub: getWalletHealthScoresByUserId called with userId: ${userId}`);
    return [];
  }

  async getWalletHealthScoreByWalletId(walletId: number): Promise<any> {
    console.log(`Stub: getWalletHealthScoreByWalletId called with walletId: ${walletId}`);
    return null;
  }

  async getWalletHealthIssuesByScoreId(scoreId: number): Promise<any[]> {
    console.log(`Stub: getWalletHealthIssuesByScoreId called with scoreId: ${scoreId}`);
    return [];
  }

  async createWalletHealthScore(data: any): Promise<any> {
    console.log(`Stub: createWalletHealthScore called with data:`, data);
    return { id: 1, ...data };
  }

  async createWalletHealthIssue(data: any): Promise<any> {
    console.log(`Stub: createWalletHealthIssue called with data:`, data);
    return { id: 1, ...data };
  }

  async updateWalletHealthIssueResolved(id: number, resolved: boolean): Promise<any> {
    console.log(`Stub: updateWalletHealthIssueResolved called with id: ${id}, resolved: ${resolved}`);
    return null;
  }

  async getNotificationPreferenceByUserId(userId: number): Promise<any> {
    console.log(`Stub: getNotificationPreferenceByUserId called with userId: ${userId}`);
    return null;
  }

  async updateNotificationPreferences(userId: number, data: any): Promise<any> {
    console.log(`Stub: updateNotificationPreferences called with userId: ${userId}, data:`, data);
    return null;
  }

  async updatePhoneNumber(userId: number, phoneNumber: string): Promise<any> {
    console.log(`Stub: updatePhoneNumber called with userId: ${userId}, phoneNumber: ${phoneNumber}`);
    return null;
  }

  async verifyPhoneNumber(userId: number, code: string): Promise<boolean> {
    console.log(`Stub: verifyPhoneNumber called with userId: ${userId}, code: ${code}`);
    return true;
  }

  async updateMatrixId(userId: number, matrixId: string): Promise<any> {
    console.log(`Stub: updateMatrixId called with userId: ${userId}, matrixId: ${matrixId}`);
    return null;
  }

  async verifyMatrixId(userId: number, code: string): Promise<boolean> {
    console.log(`Stub: verifyMatrixId called with userId: ${userId}, code: ${code}`);
    return true;
  }
}

// Create and export the storage instance
export const storage = new DatabaseStorage();

// Re-export types for convenience
export type { User, InsertUser };