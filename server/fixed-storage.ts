import { users, type User, type InsertUser } from "../shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
    console.log(`Stub: getWalletsByUserId called with userId: ${userId}`);
    return [];
  }

  async getRecentTransactions(userId: number, limit: number): Promise<any[]> {
    console.log(`Stub: getRecentTransactions called with userId: ${userId}, limit: ${limit}`);
    return [];
  }

  async getTransactionsByWalletId(walletId: number): Promise<any[]> {
    console.log(`Stub: getTransactionsByWalletId called with walletId: ${walletId}`);
    return [];
  }

  async createTransaction(data: any): Promise<any> {
    console.log(`Stub: createTransaction called with data:`, data);
    return { id: 1, ...data };
  }

  async getWallet(walletId: number): Promise<any> {
    console.log(`Stub: getWallet called with walletId: ${walletId}`);
    return null;
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
    console.log(`Stub: getSmartContractsByUserId called with userId: ${userId}`);
    return [];
  }

  async createSmartContract(data: any): Promise<any> {
    console.log(`Stub: createSmartContract called with data:`, data);
    return { id: 1, ...data };
  }

  async updateSmartContractStatus(id: number, status: string): Promise<any> {
    console.log(`Stub: updateSmartContractStatus called with id: ${id}, status: ${status}`);
    return null;
  }

  async getAiMonitoringLogs(userId: number, limit: number): Promise<any[]> {
    console.log(`Stub: getAiMonitoringLogs called with userId: ${userId}, limit: ${limit}`);
    return [];
  }

  async createAiMonitoringLog(data: any): Promise<any> {
    console.log(`Stub: createAiMonitoringLog called with data:`, data);
    return { id: 1, ...data };
  }

  async getCidEntriesByUserId(userId: number): Promise<any[]> {
    console.log(`Stub: getCidEntriesByUserId called with userId: ${userId}`);
    return [];
  }

  async createCidEntry(data: any): Promise<any> {
    console.log(`Stub: createCidEntry called with data:`, data);
    return { id: 1, ...data };
  }

  async updateCidEntryStatus(id: number, status: string): Promise<any> {
    console.log(`Stub: updateCidEntryStatus called with id: ${id}, status: ${status}`);
    return null;
  }

  async getPaymentMethodsByUserId(userId: number): Promise<any[]> {
    console.log(`Stub: getPaymentMethodsByUserId called with userId: ${userId}`);
    return [];
  }

  async updatePaymentMethodDefault(id: number, isDefault: boolean): Promise<any> {
    console.log(`Stub: updatePaymentMethodDefault called with id: ${id}, isDefault: ${isDefault}`);
    return null;
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    console.log(`Stub: deletePaymentMethod called with id: ${id}`);
    return true;
  }

  async getPaymentsByUserId(userId: number): Promise<any[]> {
    console.log(`Stub: getPaymentsByUserId called with userId: ${userId}`);
    return [];
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