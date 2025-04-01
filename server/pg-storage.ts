import { IStorage } from "./storage";
import {
  User, InsertUser,
  Wallet, InsertWallet,
  Transaction, InsertTransaction,
  SmartContract, InsertSmartContract,
  AiMonitoringLog, InsertAiMonitoringLog,
  CidEntry, InsertCidEntry,
  users, wallets, transactions, smartContracts, aiMonitoringLogs, cidEntries
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

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
}