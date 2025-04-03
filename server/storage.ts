import { 
  users, type User, type InsertUser,
  wallets, type Wallet, type InsertWallet,
  transactions, type Transaction, type InsertTransaction,
  smartContracts, type SmartContract, type InsertSmartContract,
  aiMonitoringLogs, type AiMonitoringLog, type InsertAiMonitoringLog,
  cidEntries, type CidEntry, type InsertCidEntry,
  paymentMethods, type PaymentMethod, type InsertPaymentMethod,
  payments, type Payment, type InsertPayment,
  stakingPositions, type StakingPosition, type InsertStakingPosition,
  proposals, type Proposal, type InsertProposal,
  proposalOptions, type ProposalOption, type InsertProposalOption,
  votes, type Vote, type InsertVote,
  governanceRewards, type GovernanceReward, type InsertGovernanceReward,
  walletHealthScores, type WalletHealthScore, type InsertWalletHealthScore,
  walletHealthIssues, type WalletHealthIssue, type InsertWalletHealthIssue,
  notificationPreferences, type NotificationPreference, type InsertNotificationPreference
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
  
  // Payment Methods methods
  getPaymentMethod(id: number): Promise<PaymentMethod | undefined>;
  getPaymentMethodsByUserId(userId: number): Promise<PaymentMethod[]>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethodDefault(id: number, isDefault: boolean): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: number): Promise<boolean>;
  
  // Payments methods
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string, processedAt?: Date): Promise<Payment | undefined>;
  
  // Staking methods
  getStakingPosition(id: number): Promise<StakingPosition | undefined>;
  getStakingPositionsByUserId(userId: number): Promise<StakingPosition[]>;
  getStakingPositionsByWalletId(walletId: number): Promise<StakingPosition[]>;
  createStakingPosition(position: InsertStakingPosition): Promise<StakingPosition>;
  updateStakingPosition(id: number, updates: Partial<StakingPosition>): Promise<StakingPosition | undefined>;
  
  // Proposal methods
  getProposal(id: number): Promise<Proposal | undefined>;
  getProposalsByChain(chain: string, status?: string): Promise<Proposal[]>;
  getProposalsByCreator(userId: number): Promise<Proposal[]>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  updateProposalStatus(id: number, status: string): Promise<Proposal | undefined>;
  
  // Proposal Options methods
  getProposalOption(id: number): Promise<ProposalOption | undefined>;
  getProposalOptionsByProposalId(proposalId: number): Promise<ProposalOption[]>;
  createProposalOption(option: InsertProposalOption): Promise<ProposalOption>;
  
  // Voting methods
  getVote(id: number): Promise<Vote | undefined>;
  getVotesByProposalId(proposalId: number): Promise<Vote[]>;
  getVotesByUserId(userId: number): Promise<Vote[]>;
  getVotesByProposalAndUser(proposalId: number, userId: number): Promise<Vote[]>;
  createVote(vote: InsertVote): Promise<Vote>;
  
  // Governance Rewards methods
  getGovernanceReward(id: number): Promise<GovernanceReward | undefined>;
  getGovernanceRewardsByUserId(userId: number): Promise<GovernanceReward[]>;
  createGovernanceReward(reward: InsertGovernanceReward): Promise<GovernanceReward>;
  updateGovernanceRewardStatus(id: number, status: string): Promise<GovernanceReward | undefined>;
  
  // Wallet Health Score methods
  getWalletHealthScore(id: number): Promise<WalletHealthScore | undefined>;
  getWalletHealthScoreByWalletId(walletId: number): Promise<WalletHealthScore | undefined>;
  getWalletHealthScoresByUserId(userId: number): Promise<WalletHealthScore[]>;
  createWalletHealthScore(score: InsertWalletHealthScore): Promise<WalletHealthScore>;
  updateWalletHealthScore(id: number, updates: Partial<WalletHealthScore>): Promise<WalletHealthScore | undefined>;
  
  // Wallet Health Issues methods
  getWalletHealthIssue(id: number): Promise<WalletHealthIssue | undefined>;
  getWalletHealthIssuesByScoreId(healthScoreId: number): Promise<WalletHealthIssue[]>;
  createWalletHealthIssue(issue: InsertWalletHealthIssue): Promise<WalletHealthIssue>;
  updateWalletHealthIssueResolved(id: number, resolved: boolean): Promise<WalletHealthIssue | undefined>;
  
  // Notification Preferences methods
  getNotificationPreference(id: number): Promise<NotificationPreference | undefined>;
  getNotificationPreferenceByUserId(userId: number): Promise<NotificationPreference | undefined>;
  createNotificationPreference(preference: InsertNotificationPreference): Promise<NotificationPreference>;
  updateNotificationPreferences(userId: number, data: Partial<NotificationPreference>): Promise<NotificationPreference | undefined>;
  updateNotificationPreference(id: number, updates: Partial<NotificationPreference>): Promise<NotificationPreference | undefined>;
  updatePhoneNumber(userId: number, phoneNumber: string, isVerified: boolean): Promise<NotificationPreference | undefined>;
  verifyPhoneNumber(userId: number, isVerified: boolean): Promise<NotificationPreference | undefined>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private wallets: Map<number, Wallet>;
  private transactions: Map<number, Transaction>;
  private smartContracts: Map<number, SmartContract>;
  private aiMonitoringLogs: Map<number, AiMonitoringLog>;
  private cidEntries: Map<number, CidEntry>;
  private paymentMethods: Map<number, PaymentMethod>;
  private payments: Map<number, Payment>;
  private stakingPositions: Map<number, StakingPosition>;
  private proposals: Map<number, Proposal>;
  private proposalOptions: Map<number, ProposalOption>;
  private votes: Map<number, Vote>;
  private governanceRewards: Map<number, GovernanceReward>;
  private walletHealthScores: Map<number, WalletHealthScore>;
  private walletHealthIssues: Map<number, WalletHealthIssue>;
  private notificationPreferences: Map<number, NotificationPreference>;
  
  private currentUserId: number;
  private currentWalletId: number;
  private currentTransactionId: number;
  private currentSmartContractId: number;
  private currentAiMonitoringLogId: number;
  private currentCidEntryId: number;
  private currentPaymentMethodId: number;
  private currentPaymentId: number;
  private currentStakingPositionId: number;
  private currentProposalId: number;
  private currentProposalOptionId: number;
  private currentVoteId: number;
  private currentGovernanceRewardId: number;
  private currentWalletHealthScoreId: number;
  private currentWalletHealthIssueId: number;
  private currentNotificationPreferenceId: number;

  constructor() {
    this.users = new Map();
    this.wallets = new Map();
    this.transactions = new Map();
    this.smartContracts = new Map();
    this.aiMonitoringLogs = new Map();
    this.cidEntries = new Map();
    this.paymentMethods = new Map();
    this.payments = new Map();
    this.stakingPositions = new Map();
    this.proposals = new Map();
    this.proposalOptions = new Map();
    this.votes = new Map();
    this.governanceRewards = new Map();
    this.walletHealthScores = new Map();
    this.walletHealthIssues = new Map();
    this.notificationPreferences = new Map();
    
    this.currentUserId = 1;
    this.currentWalletId = 1;
    this.currentTransactionId = 1;
    this.currentSmartContractId = 1;
    this.currentAiMonitoringLogId = 1;
    this.currentCidEntryId = 1;
    this.currentPaymentMethodId = 1;
    this.currentPaymentId = 1;
    this.currentStakingPositionId = 1;
    this.currentProposalId = 1;
    this.currentProposalOptionId = 1;
    this.currentVoteId = 1;
    this.currentGovernanceRewardId = 1;
    this.currentWalletHealthScoreId = 1;
    this.currentWalletHealthIssueId = 1;
    this.currentNotificationPreferenceId = 1;
    
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
  
  // Payment Methods methods
  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    return this.paymentMethods.get(id);
  }

  async getPaymentMethodsByUserId(userId: number): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values())
      .filter(method => method.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createPaymentMethod(insertMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.currentPaymentMethodId++;
    const createdAt = new Date();
    
    // If this is set as the default, unset any existing default methods for this user
    if (insertMethod.isDefault) {
      const existingDefaultMethods = await this.getPaymentMethodsByUserId(insertMethod.userId);
      existingDefaultMethods
        .filter(method => method.isDefault)
        .forEach(method => {
          const updated = { ...method, isDefault: false };
          this.paymentMethods.set(method.id, updated);
        });
    }
    
    const paymentMethod: PaymentMethod = { ...insertMethod, id, createdAt };
    this.paymentMethods.set(id, paymentMethod);
    return paymentMethod;
  }

  async updatePaymentMethodDefault(id: number, isDefault: boolean): Promise<PaymentMethod | undefined> {
    const paymentMethod = this.paymentMethods.get(id);
    if (!paymentMethod) return undefined;
    
    // If setting as default, unset any existing default methods for this user
    if (isDefault) {
      const existingDefaultMethods = await this.getPaymentMethodsByUserId(paymentMethod.userId);
      existingDefaultMethods
        .filter(method => method.isDefault && method.id !== id)
        .forEach(method => {
          const updated = { ...method, isDefault: false };
          this.paymentMethods.set(method.id, updated);
        });
    }
    
    const updatedPaymentMethod = { ...paymentMethod, isDefault };
    this.paymentMethods.set(id, updatedPaymentMethod);
    return updatedPaymentMethod;
  }
  
  async deletePaymentMethod(id: number): Promise<boolean> {
    const exists = this.paymentMethods.has(id);
    if (exists) {
      this.paymentMethods.delete(id);
    }
    return exists;
  }
  
  // Payments methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(payment => payment.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const createdAt = new Date();
    const payment: Payment = { ...insertPayment, id, createdAt, processedAt: undefined };
    this.payments.set(id, payment);
    return payment;
  }
  
  async updatePaymentStatus(id: number, status: string, processedAt?: Date): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updates: Partial<Payment> = { status };
    if (processedAt) {
      updates.processedAt = processedAt;
    }
    
    const updatedPayment = { ...payment, ...updates };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // Staking methods
  async getStakingPosition(id: number): Promise<StakingPosition | undefined> {
    return this.stakingPositions.get(id);
  }
  
  async getStakingPositionsByUserId(userId: number): Promise<StakingPosition[]> {
    return Array.from(this.stakingPositions.values())
      .filter(position => position.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getStakingPositionsByWalletId(walletId: number): Promise<StakingPosition[]> {
    return Array.from(this.stakingPositions.values())
      .filter(position => position.walletId === walletId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createStakingPosition(insertPosition: InsertStakingPosition): Promise<StakingPosition> {
    const id = this.currentStakingPositionId++;
    const createdAt = new Date();
    const position: StakingPosition = { ...insertPosition, id, createdAt };
    this.stakingPositions.set(id, position);
    return position;
  }
  
  async updateStakingPosition(id: number, updates: Partial<StakingPosition>): Promise<StakingPosition | undefined> {
    const position = this.stakingPositions.get(id);
    if (!position) return undefined;
    
    const updatedPosition = { ...position, ...updates };
    this.stakingPositions.set(id, updatedPosition);
    return updatedPosition;
  }
  
  // Proposal methods
  async getProposal(id: number): Promise<Proposal | undefined> {
    return this.proposals.get(id);
  }
  
  async getProposalsByChain(chain: string, status?: string): Promise<Proposal[]> {
    let filteredProposals = Array.from(this.proposals.values())
      .filter(proposal => proposal.chain === chain);
      
    if (status) {
      filteredProposals = filteredProposals.filter(proposal => proposal.status === status);
    }
    
    return filteredProposals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getProposalsByCreator(userId: number): Promise<Proposal[]> {
    return Array.from(this.proposals.values())
      .filter(proposal => proposal.creatorId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createProposal(insertProposal: InsertProposal): Promise<Proposal> {
    const id = this.currentProposalId++;
    const createdAt = new Date();
    const proposal: Proposal = { ...insertProposal, id, createdAt };
    this.proposals.set(id, proposal);
    return proposal;
  }
  
  async updateProposalStatus(id: number, status: string): Promise<Proposal | undefined> {
    const proposal = this.proposals.get(id);
    if (!proposal) return undefined;
    
    const updatedProposal = { ...proposal, status };
    this.proposals.set(id, updatedProposal);
    return updatedProposal;
  }
  
  // Proposal Options methods
  async getProposalOption(id: number): Promise<ProposalOption | undefined> {
    return this.proposalOptions.get(id);
  }
  
  async getProposalOptionsByProposalId(proposalId: number): Promise<ProposalOption[]> {
    return Array.from(this.proposalOptions.values())
      .filter(option => option.proposalId === proposalId);
  }
  
  async createProposalOption(insertOption: InsertProposalOption): Promise<ProposalOption> {
    const id = this.currentProposalOptionId++;
    const createdAt = new Date();
    const option: ProposalOption = { 
      ...insertOption, 
      id, 
      createdAt,
      // Map the expected fields based on schema
      optionText: insertOption.text,
      metadata: insertOption.description as unknown
    };
    this.proposalOptions.set(id, option);
    return option;
  }
  
  // Voting methods
  async getVote(id: number): Promise<Vote | undefined> {
    return this.votes.get(id);
  }
  
  async getVotesByProposalId(proposalId: number): Promise<Vote[]> {
    return Array.from(this.votes.values())
      .filter(vote => vote.proposalId === proposalId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  
  async getVotesByUserId(userId: number): Promise<Vote[]> {
    return Array.from(this.votes.values())
      .filter(vote => vote.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  
  async getVotesByProposalAndUser(proposalId: number, userId: number): Promise<Vote[]> {
    return Array.from(this.votes.values())
      .filter(vote => vote.proposalId === proposalId && vote.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }
  
  async createVote(insertVote: InsertVote): Promise<Vote> {
    const id = this.currentVoteId++;
    const createdAt = new Date();
    // Map to the expected schema fields
    const vote: Vote = { 
      ...insertVote, 
      id, 
      createdAt,
      votePower: insertVote.power, // Map power to votePower based on schema
      transactionHash: null
    };
    this.votes.set(id, vote);
    return vote;
  }
  
  // Governance Rewards methods
  async getGovernanceReward(id: number): Promise<GovernanceReward | undefined> {
    return this.governanceRewards.get(id);
  }
  
  async getGovernanceRewardsByUserId(userId: number): Promise<GovernanceReward[]> {
    return Array.from(this.governanceRewards.values())
      .filter(reward => reward.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createGovernanceReward(insertReward: InsertGovernanceReward): Promise<GovernanceReward> {
    const id = this.currentGovernanceRewardId++;
    const createdAt = new Date();
    const reward: GovernanceReward = { ...insertReward, id, createdAt };
    this.governanceRewards.set(id, reward);
    return reward;
  }
  
  async updateGovernanceRewardStatus(id: number, status: string): Promise<GovernanceReward | undefined> {
    const reward = this.governanceRewards.get(id);
    if (!reward) return undefined;
    
    const updatedReward = { ...reward, status };
    this.governanceRewards.set(id, updatedReward);
    return updatedReward;
  }
  
  // Wallet Health Score methods
  async getWalletHealthScore(id: number): Promise<WalletHealthScore | undefined> {
    return this.walletHealthScores.get(id);
  }
  
  async getWalletHealthScoreByWalletId(walletId: number): Promise<WalletHealthScore | undefined> {
    return Array.from(this.walletHealthScores.values())
      .find(score => score.walletId === walletId);
  }
  
  async getWalletHealthScoresByUserId(userId: number): Promise<WalletHealthScore[]> {
    const userWallets = await this.getWalletsByUserId(userId);
    const walletIds = userWallets.map(wallet => wallet.id);
    
    return Array.from(this.walletHealthScores.values())
      .filter(score => walletIds.includes(score.walletId))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async createWalletHealthScore(insertScore: InsertWalletHealthScore): Promise<WalletHealthScore> {
    const id = this.currentWalletHealthScoreId++;
    const timestamp = new Date();
    const score: WalletHealthScore = { 
      ...insertScore, 
      id, 
      timestamp,
      // Ensure all required fields have values
      securityScore: insertScore.securityScore || 0,
      performanceScore: insertScore.performanceScore || 0,
      overallScore: insertScore.overallScore || 0,
      status: insertScore.status || 'active',
      lastScanId: insertScore.lastScanId || null
    };
    this.walletHealthScores.set(id, score);
    return score;
  }
  
  async updateWalletHealthScore(id: number, updates: Partial<WalletHealthScore>): Promise<WalletHealthScore | undefined> {
    const score = this.walletHealthScores.get(id);
    if (!score) return undefined;
    
    const updatedScore = { ...score, ...updates };
    this.walletHealthScores.set(id, updatedScore);
    return updatedScore;
  }
  
  // Wallet Health Issues methods
  async getWalletHealthIssue(id: number): Promise<WalletHealthIssue | undefined> {
    return this.walletHealthIssues.get(id);
  }
  
  async getWalletHealthIssuesByScoreId(healthScoreId: number): Promise<WalletHealthIssue[]> {
    return Array.from(this.walletHealthIssues.values())
      .filter(issue => issue.healthScoreId === healthScoreId)
      .sort((a, b) => {
        // Sort by severity (critical, high, medium, low)
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
        if (severityDiff !== 0) return severityDiff;
        
        // If same severity, sort by timestamp (most recent first)
        return b.detectedAt.getTime() - a.detectedAt.getTime();
      });
  }
  
  async createWalletHealthIssue(insertIssue: InsertWalletHealthIssue): Promise<WalletHealthIssue> {
    const id = this.currentWalletHealthIssueId++;
    const detectedAt = new Date();
    const issue: WalletHealthIssue = {
      ...insertIssue,
      id,
      detectedAt,
      resolvedAt: null,
      resolved: false
    };
    this.walletHealthIssues.set(id, issue);
    return issue;
  }
  
  async updateWalletHealthIssueResolved(id: number, resolved: boolean): Promise<WalletHealthIssue | undefined> {
    const issue = this.walletHealthIssues.get(id);
    if (!issue) return undefined;
    
    const updates: Partial<WalletHealthIssue> = { resolved };
    if (resolved && !issue.resolved) {
      updates.resolvedAt = new Date();
    } else if (!resolved) {
      updates.resolvedAt = null;
    }
    
    const updatedIssue = { ...issue, ...updates };
    this.walletHealthIssues.set(id, updatedIssue);
    return updatedIssue;
  }
  
  // Notification Preferences methods
  async getNotificationPreference(id: number): Promise<NotificationPreference | undefined> {
    return this.notificationPreferences.get(id);
  }
  
  async getNotificationPreferenceByUserId(userId: number): Promise<NotificationPreference | undefined> {
    return Array.from(this.notificationPreferences.values()).find(
      preference => preference.userId === userId
    );
  }
  
  async createNotificationPreference(insertPreference: InsertNotificationPreference): Promise<NotificationPreference> {
    const id = this.currentNotificationPreferenceId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const preference: NotificationPreference = { 
      ...insertPreference, 
      id, 
      createdAt, 
      updatedAt 
    };
    
    this.notificationPreferences.set(id, preference);
    return preference;
  }
  
  async updateNotificationPreference(id: number, updates: Partial<NotificationPreference>): Promise<NotificationPreference | undefined> {
    const preference = this.notificationPreferences.get(id);
    if (!preference) return undefined;
    
    const updatedPreference = { 
      ...preference, 
      ...updates, 
      updatedAt: new Date() 
    };
    
    this.notificationPreferences.set(id, updatedPreference);
    return updatedPreference;
  }
  
  async updatePhoneNumber(userId: number, phoneNumber: string, isVerified: boolean = false): Promise<NotificationPreference | undefined> {
    // Find the user's notification preference
    const preference = await this.getNotificationPreferenceByUserId(userId);
    if (!preference) return undefined;
    
    const updates: Partial<NotificationPreference> = { 
      phoneNumber, 
      isPhoneVerified: isVerified,
      updatedAt: new Date()
    };
    
    const updatedPreference = { ...preference, ...updates };
    this.notificationPreferences.set(preference.id, updatedPreference);
    return updatedPreference;
  }
  
  async updateNotificationPreferences(userId: number, data: Partial<NotificationPreference>): Promise<NotificationPreference | undefined> {
    // Find the user's notification preference
    const preference = await this.getNotificationPreferenceByUserId(userId);
    if (!preference) return undefined;
    
    const updates: Partial<NotificationPreference> = { 
      ...data,
      updatedAt: new Date()
    };
    
    const updatedPreference = { ...preference, ...updates };
    this.notificationPreferences.set(preference.id, updatedPreference);
    return updatedPreference;
  }
  
  async verifyPhoneNumber(userId: number, isVerified: boolean): Promise<NotificationPreference | undefined> {
    // Find the user's notification preference
    const preference = await this.getNotificationPreferenceByUserId(userId);
    if (!preference) return undefined;
    
    // If user doesn't have a phone number, we can't verify
    if (!preference.phoneNumber) return undefined;
    
    const updates: Partial<NotificationPreference> = { 
      isPhoneVerified: isVerified,
      updatedAt: new Date()
    };
    
    const updatedPreference = { ...preference, ...updates };
    this.notificationPreferences.set(preference.id, updatedPreference);
    return updatedPreference;
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
      
      // Create notification preferences for the user
      const notificationPrefs: InsertNotificationPreference = {
        userId: user.id,
        phoneNumber: null,
        isPhoneVerified: false,
        smsEnabled: false,
        transactionAlerts: true,
        securityAlerts: true,
        priceAlerts: false,
        marketingUpdates: false
      };
      
      this.createNotificationPreference(notificationPrefs);
      
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
        
        // Create demo staking positions
        if (wallets.length > 0) {
          const stakingPositions: InsertStakingPosition[] = [
            {
              userId: user.id,
              walletId: wallets[1].id,
              amount: "2.5",
              reward: "0.125",
              chain: "ethereum",
              tokenSymbol: "ETH",
              lockupPeriod: 30, // days
              status: "active",
              apy: "5.2",
            },
            {
              userId: user.id,
              walletId: wallets[2].id,
              amount: "20",
              reward: "0.8",
              chain: "solana",
              tokenSymbol: "SOL",
              lockupPeriod: 90, // days
              status: "active",
              apy: "4.0",
            }
          ];
          
          stakingPositions.forEach(position => this.createStakingPosition(position));
          
          // Create governance proposals
          const proposals: InsertProposal[] = [
            {
              creatorId: user.id,
              title: "Implement Quantum-Resistant Signature Scheme",
              description: "Migrate from current signature scheme to quantum-resistant algorithms to protect against future quantum computing attacks.",
              chain: "ethereum",
              status: "active",
              startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
              endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
              quorum: "1000",
              snapshot: null
            },
            {
              creatorId: user.id,
              title: "Protocol Fee Adjustment",
              description: "Reduce protocol fees from 0.3% to 0.25% to remain competitive with other DeFi platforms.",
              chain: "ethereum",
              status: "active",
              startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
              endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
              quorum: "500",
              snapshot: null
            },
            {
              creatorId: user.id,
              title: "Aetherion Ecosystem Fund Allocation",
              description: "Allocate 5% of treasury funds for grants to developers building on the Aetherion ecosystem.",
              chain: "solana",
              status: "active",
              startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
              endTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
              quorum: "2000",
              snapshot: null
            }
          ];
          
          Promise.all(proposals.map(p => this.createProposal(p))).then(createdProposals => {
            // Create proposal options
            const proposalOptions: InsertProposalOption[] = [
              {
                proposalId: createdProposals[0].id,
                text: "Implement CRYSTALS-Dilithium algorithm",
                description: "NIST approved post-quantum cryptographic signature scheme"
              },
              {
                proposalId: createdProposals[0].id,
                text: "Implement SPHINCS+ algorithm",
                description: "Hash-based stateless signature scheme resistant to quantum attacks"
              },
              {
                proposalId: createdProposals[0].id,
                text: "Maintain current algorithm with extended key length",
                description: "Increase key size to provide temporary resistance"
              },
              {
                proposalId: createdProposals[1].id,
                text: "Approve fee reduction to 0.25%",
                description: "Decrease protocol fee from 0.3% to 0.25%"
              },
              {
                proposalId: createdProposals[1].id,
                text: "Maintain current fee structure",
                description: "Keep the protocol fee at 0.3%"
              },
              {
                proposalId: createdProposals[2].id,
                text: "Approve 5% allocation",
                description: "Allocate 5% of treasury to ecosystem development grants"
              },
              {
                proposalId: createdProposals[2].id,
                text: "Allocate 3% instead",
                description: "More conservative allocation of 3% of treasury"
              },
              {
                proposalId: createdProposals[2].id,
                text: "Do not allocate funds at this time",
                description: "Delay decision on ecosystem fund until market conditions improve"
              }
            ];
            
            Promise.all(proposalOptions.map(option => this.createProposalOption(option))).then(createdOptions => {
              // Create some votes
              const votes: InsertVote[] = [
                {
                  userId: user.id,
                  proposalId: createdProposals[0].id,
                  optionId: createdOptions[0].id,
                  power: "10.5",
                  walletId: wallets[1].id
                },
                {
                  userId: user.id,
                  proposalId: createdProposals[1].id,
                  optionId: createdOptions[3].id,
                  power: "15.3",
                  walletId: wallets[1].id
                }
              ];
              
              votes.forEach(vote => this.createVote(vote));
              
              // Create governance rewards
              const rewards: InsertGovernanceReward[] = [
                {
                  userId: user.id,
                  amount: "0.05",
                  tokenSymbol: "ETH",
                  reason: "Voting participation",
                  proposalId: createdProposals[0].id,
                  status: "pending",
                  walletId: wallets[1].id
                },
                {
                  userId: user.id,
                  amount: "0.08",
                  tokenSymbol: "ETH",
                  reason: "Voting participation",
                  proposalId: createdProposals[1].id,
                  status: "claimed",
                  walletId: wallets[1].id
                }
              ];
              
              rewards.forEach(reward => this.createGovernanceReward(reward));
                
                // Create wallet health scores for each wallet
                for (let i = 0; i < wallets.length; i++) {
                  const wallet = wallets[i];
                  
                  // Create wallet health score
                  const healthScore: InsertWalletHealthScore = {
                    userId: wallet.userId,
                    walletId: wallet.id,
                    overallScore: 82 + Math.floor(Math.random() * 12),
                    securityScore: 85 + Math.floor(Math.random() * 10),
                    diversificationScore: 75 + Math.floor(Math.random() * 15),
                    activityScore: 80 + Math.floor(Math.random() * 10),
                    gasOptimizationScore: 78 + Math.floor(Math.random() * 15),
                    backgroundScanTimestamp: new Date()
                  };
                  
                  this.createWalletHealthScore(healthScore).then(createdScore => {
                    // Create some wallet health issues
                    const issues: InsertWalletHealthIssue[] = [
                      {
                        healthScoreId: createdScore.id,
                        title: 'Insufficient entropy in private key',
                        description: 'Your wallet was created with lower than recommended entropy which could make it vulnerable to brute force attacks.',
                        severity: 'medium',
                        category: 'security',
                        recommendation: 'Consider creating a new wallet with a hardware wallet device that generates high-entropy keys.',
                        resolved: false
                      },
                      {
                        healthScoreId: createdScore.id,
                        title: 'High gas usage patterns',
                        description: 'Your recent transactions show inefficient gas usage patterns that could be optimized.',
                        severity: 'low',
                        category: 'gasOptimization',
                        recommendation: 'Use batch transactions and optimize contract interactions to reduce gas consumption.',
                        resolved: false
                      }
                    ];
                    
                    if (i === 0) {
                      // Add a critical issue for the first wallet
                      issues.push({
                        healthScoreId: createdScore.id,
                        title: 'Interaction with flagged contract',
                        description: 'Your wallet has interacted with a smart contract that has been flagged as potentially malicious by security researchers.',
                        severity: 'critical',
                        category: 'security',
                        recommendation: 'Avoid further interactions with this contract and consider moving funds to a new wallet if you authorized token approvals.',
                        resolved: false
                      });
                    }
                    
                    issues.forEach(issue => this.createWalletHealthIssue(issue));
                  });
                }
            });
          });
        }
      });
    });
  }
}

// Import the PostgreSQL storage implementation
import { PgStorage } from "./pg-storage";

// Comment out the MemStorage and create a new instance of PgStorage
// export const storage = new MemStorage();
export const storage = new PgStorage();
