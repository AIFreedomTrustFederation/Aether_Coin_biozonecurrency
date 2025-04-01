import { 
  users, type User, type InsertUser,
  wallets, type Wallet, type InsertWallet,
  transactions, type Transaction, type InsertTransaction,
  smartContracts, type SmartContract, type InsertSmartContract,
  aiMonitoringLogs, type AiMonitoringLog, type InsertAiMonitoringLog,
  cidEntries, type CidEntry, type InsertCidEntry
} from "@shared/schema";

// Storage interface definition
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Wallet methods
  getWallet(id: number): Promise<Wallet | undefined>;
  getWalletsByUserId(userId: number): Promise<Wallet[]>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(id: number, balance: string): Promise<Wallet | undefined>;
  
  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByWalletId(walletId: number): Promise<Transaction[]>;
  getRecentTransactions(userId: number, limit: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Smart Contract methods
  getSmartContract(id: number): Promise<SmartContract | undefined>;
  getSmartContractsByUserId(userId: number): Promise<SmartContract[]>;
  createSmartContract(contract: InsertSmartContract): Promise<SmartContract>;
  updateSmartContractStatus(id: number, status: string): Promise<SmartContract | undefined>;
  
  // AI Monitoring methods
  getAiMonitoringLogs(userId: number, limit: number): Promise<AiMonitoringLog[]>;
  createAiMonitoringLog(log: InsertAiMonitoringLog): Promise<AiMonitoringLog>;
  
  // CID Management methods
  getCidEntry(id: number): Promise<CidEntry | undefined>;
  getCidEntriesByUserId(userId: number): Promise<CidEntry[]>;
  createCidEntry(entry: InsertCidEntry): Promise<CidEntry>;
  updateCidEntryStatus(id: number, status: string): Promise<CidEntry | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wallets: Map<number, Wallet>;
  private transactions: Map<number, Transaction>;
  private smartContracts: Map<number, SmartContract>;
  private aiMonitoringLogs: Map<number, AiMonitoringLog>;
  private cidEntries: Map<number, CidEntry>;
  
  private currentUserId: number;
  private currentWalletId: number;
  private currentTransactionId: number;
  private currentSmartContractId: number;
  private currentAiMonitoringLogId: number;
  private currentCidEntryId: number;

  constructor() {
    this.users = new Map();
    this.wallets = new Map();
    this.transactions = new Map();
    this.smartContracts = new Map();
    this.aiMonitoringLogs = new Map();
    this.cidEntries = new Map();
    
    this.currentUserId = 1;
    this.currentWalletId = 1;
    this.currentTransactionId = 1;
    this.currentSmartContractId = 1;
    this.currentAiMonitoringLogId = 1;
    this.currentCidEntryId = 1;
    
    // Initialize with some demo data for development
    this.initializeDemoData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  // Wallet methods
  async getWallet(id: number): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }
  
  async getWalletsByUserId(userId: number): Promise<Wallet[]> {
    return Array.from(this.wallets.values()).filter(
      wallet => wallet.userId === userId
    );
  }
  
  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = this.currentWalletId++;
    const createdAt = new Date();
    const wallet: Wallet = { ...insertWallet, id, createdAt };
    this.wallets.set(id, wallet);
    return wallet;
  }
  
  async updateWalletBalance(id: number, balance: string): Promise<Wallet | undefined> {
    const wallet = this.wallets.get(id);
    if (!wallet) return undefined;
    
    const updatedWallet = { ...wallet, balance };
    this.wallets.set(id, updatedWallet);
    return updatedWallet;
  }
  
  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }
  
  async getTransactionsByWalletId(walletId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.walletId === walletId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async getRecentTransactions(userId: number, limit: number): Promise<Transaction[]> {
    const userWallets = await this.getWalletsByUserId(userId);
    const walletIds = userWallets.map(wallet => wallet.id);
    
    return Array.from(this.transactions.values())
      .filter(tx => walletIds.includes(tx.walletId))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const timestamp = new Date();
    const transaction: Transaction = { ...insertTransaction, id, timestamp };
    this.transactions.set(id, transaction);
    return transaction;
  }
  
  // Smart Contract methods
  async getSmartContract(id: number): Promise<SmartContract | undefined> {
    return this.smartContracts.get(id);
  }
  
  async getSmartContractsByUserId(userId: number): Promise<SmartContract[]> {
    return Array.from(this.smartContracts.values())
      .filter(contract => contract.userId === userId)
      .sort((a, b) => {
        const dateA = a.lastInteraction || a.createdAt;
        const dateB = b.lastInteraction || b.createdAt;
        return dateB.getTime() - dateA.getTime();
      });
  }
  
  async createSmartContract(insertContract: InsertSmartContract): Promise<SmartContract> {
    const id = this.currentSmartContractId++;
    const createdAt = new Date();
    const contract: SmartContract = { 
      ...insertContract, 
      id, 
      createdAt,
      lastInteraction: null 
    };
    this.smartContracts.set(id, contract);
    return contract;
  }
  
  async updateSmartContractStatus(id: number, status: string): Promise<SmartContract | undefined> {
    const contract = this.smartContracts.get(id);
    if (!contract) return undefined;
    
    const updatedContract = { ...contract, status, lastInteraction: new Date() };
    this.smartContracts.set(id, updatedContract);
    return updatedContract;
  }
  
  // AI Monitoring methods
  async getAiMonitoringLogs(userId: number, limit: number): Promise<AiMonitoringLog[]> {
    return Array.from(this.aiMonitoringLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async createAiMonitoringLog(insertLog: InsertAiMonitoringLog): Promise<AiMonitoringLog> {
    const id = this.currentAiMonitoringLogId++;
    const timestamp = new Date();
    const log: AiMonitoringLog = { ...insertLog, id, timestamp };
    this.aiMonitoringLogs.set(id, log);
    return log;
  }
  
  // CID Management methods
  async getCidEntry(id: number): Promise<CidEntry | undefined> {
    return this.cidEntries.get(id);
  }
  
  async getCidEntriesByUserId(userId: number): Promise<CidEntry[]> {
    return Array.from(this.cidEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createCidEntry(insertEntry: InsertCidEntry): Promise<CidEntry> {
    const id = this.currentCidEntryId++;
    const createdAt = new Date();
    const entry: CidEntry = { ...insertEntry, id, createdAt };
    this.cidEntries.set(id, entry);
    return entry;
  }
  
  async updateCidEntryStatus(id: number, status: string): Promise<CidEntry | undefined> {
    const entry = this.cidEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, status };
    this.cidEntries.set(id, updatedEntry);
    return updatedEntry;
  }
  
  // Initialize demo data
  private initializeDemoData() {
    // Create a demo user
    const demoUser: InsertUser = {
      username: "demo",
      password: "password123",
      walletSeed: "demo seed phrase",
    };
    this.createUser(demoUser).then(user => {
      // Create wallets for the user
      const btcWallet: InsertWallet = {
        userId: user.id,
        chain: "bitcoin",
        address: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5",
        balance: "1.245",
        name: "Bitcoin Wallet",
        type: "hot",
      };
      
      const ethWallet: InsertWallet = {
        userId: user.id,
        chain: "ethereum",
        address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        balance: "4.532",
        name: "Ethereum Wallet",
        type: "hot",
      };
      
      const solWallet: InsertWallet = {
        userId: user.id,
        chain: "solana",
        address: "G3nF5aVJVhqTdsjrTnZ4wKM8Ptc4uqSH98RTEMkRdm92",
        balance: "85.12",
        name: "Solana Wallet",
        type: "hot",
      };
      
      Promise.all([
        this.createWallet(btcWallet),
        this.createWallet(ethWallet),
        this.createWallet(solWallet)
      ]).then(wallets => {
        // Create transactions
        const transactions: InsertTransaction[] = [
          {
            walletId: wallets[0].id,
            txHash: "7f8e35b48e856bf2b3f9d7253fec496d9f9807a1",
            type: "receive",
            amount: "0.1242",
            tokenSymbol: "BTC",
            fromAddress: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5",
            status: "confirmed",
            fee: "0.00012",
            blockNumber: 800123,
            aiVerified: true,
          },
          {
            walletId: wallets[1].id,
            txHash: "0x8b28fe93e3246df8064d591583516b5395f493fd",
            type: "send",
            amount: "1.5",
            tokenSymbol: "ETH",
            toAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            status: "confirmed",
            fee: "0.0042",
            blockNumber: 18243567,
            aiVerified: true,
          },
          {
            walletId: wallets[1].id,
            txHash: "0x5d91cad6c4e92d370b39a0cb54fb0c8bf32bd8e2",
            type: "contract_interaction",
            amount: "0.1",
            tokenSymbol: "ETH",
            toAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
            status: "confirmed",
            fee: "0.0038",
            blockNumber: 18243498,
            aiVerified: true,
          },
          {
            walletId: wallets[2].id,
            txHash: "3vk343oiVSMPx6tLGT97crfNTk6TD2TMnYxUs8AvTcLFGzP",
            type: "receive",
            amount: "12.5",
            tokenSymbol: "SOL",
            fromAddress: "G3nF5aVJVhqTdsjrTnZ4wKM8Ptc4uqSH98RTEMkRdm92",
            status: "confirmed",
            fee: "0.000005",
            blockNumber: 240789345,
            aiVerified: true,
          }
        ];
        
        transactions.forEach(tx => this.createTransaction(tx));
        
        // Create smart contracts
        const contracts: InsertSmartContract[] = [
          {
            userId: user.id,
            name: "Aetherion NFT Marketplace",
            address: "0x827acb09b59ac90e6c9d42a88a821321",
            chain: "ethereum",
            abi: [],
            status: "active",
          },
          {
            userId: user.id,
            name: "Quantum DeFi Pool",
            address: "0x29b7d83dac8f1cb542dc",
            chain: "polygon",
            abi: [],
            status: "active",
          },
          {
            userId: user.id,
            name: "Fractal DAO Governance",
            address: "8zJBSE9jRd92",
            chain: "solana",
            abi: [],
            status: "pending",
          }
        ];
        
        contracts.forEach(contract => this.createSmartContract(contract));
        
        // Create AI monitoring logs
        const aiLogs: InsertAiMonitoringLog[] = [
          {
            userId: user.id,
            action: "threat_detected",
            description: "Suspicious contract detected - Transaction blocked - potential phishing attempt",
            severity: "warning",
            relatedEntityId: null,
            relatedEntityType: null,
          },
          {
            userId: user.id,
            action: "gas_optimization",
            description: "Gas optimization applied - Saved 0.0032 ETH on recent transaction",
            severity: "info",
            relatedEntityId: null,
            relatedEntityType: null,
          }
        ];
        
        aiLogs.forEach(log => this.createAiMonitoringLog(log));
        
        // Create CID entries
        const cidEntries: InsertCidEntry[] = [
          {
            userId: user.id,
            cid: "bafybeiemxf5abjwjbikoz4",
            type: "wallet_backup",
            status: "active",
            data: {},
          },
          {
            userId: user.id,
            cid: "bafkreieq5jui4j25lacpu",
            type: "smart_contract",
            status: "active",
            data: {},
          },
          {
            userId: user.id,
            cid: "bafybeibljz5z27ujt3g",
            type: "transaction_log",
            status: "syncing",
            data: {},
          }
        ];
        
        cidEntries.forEach(entry => this.createCidEntry(entry));
      });
    });
  }
}

// Import the PostgreSQL storage implementation
import { PgStorage } from "./pg-storage";

// Comment out the MemStorage and create a new instance of PgStorage
// export const storage = new MemStorage();
export const storage = new PgStorage();
