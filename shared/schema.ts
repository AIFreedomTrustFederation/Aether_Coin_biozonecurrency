import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // 'user', 'admin', 'super_admin'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  isActive: boolean("is_active").default(true),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  wallets: many(wallets),
  smartContracts: many(smartContracts),
  aiMonitoringLogs: many(aiMonitoringLogs),
  cidEntries: many(cidEntries),
  paymentMethods: many(paymentMethods),
  payments: many(payments),
  stakingPositions: many(stakingPositions),
  stakingRecords: many(stakingRecords),
  icoParticipations: many(icoParticipations),
  createdProposals: many(proposals, { relationName: "createdProposals" }),
  votes: many(votes),
  governanceRewards: many(governanceRewards),
  notificationPreference: one(notificationPreferences),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
  isActive: true,
});

// Wallets schema
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  chain: text("chain").notNull(), // e.g., 'ethereum', 'bitcoin', 'solana'
  name: text("name").notNull(),
  address: text("address").notNull(),
  balance: text("balance").notNull(),
  type: text("type").notNull(), // e.g., 'native', 'token', 'nft'
  symbol: text("symbol").notNull(),
  dollarValue: decimal("dollar_value").notNull(),
  percentChange: decimal("percent_change").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  stakingPositions: many(stakingPositions),
  stakingRecords: many(stakingRecords),
  votes: many(votes),
}));

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
});

// Transactions schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  txHash: text("tx_hash").notNull(),
  type: text("type").notNull(), // 'send', 'receive', 'contract_interaction'
  amount: text("amount").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  fromAddress: text("from_address"),
  toAddress: text("to_address"),
  status: text("status").notNull(), // 'pending', 'confirmed', 'failed'
  timestamp: timestamp("timestamp").defaultNow(),
  fee: text("fee"),
  blockNumber: integer("block_number"),
  aiVerified: boolean("ai_verified").default(false),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
}));

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  timestamp: true,
});

// Smart Contracts schema
export const smartContracts = pgTable("smart_contracts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  address: text("address").notNull(),
  chain: text("chain").notNull(),
  status: text("status").notNull(), // 'active', 'pending', 'inactive'
  lastInteraction: timestamp("last_interaction"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const smartContractsRelations = relations(smartContracts, ({ one }) => ({
  user: one(users, {
    fields: [smartContracts.userId],
    references: [users.id],
  }),
}));

export const insertSmartContractSchema = createInsertSchema(smartContracts).omit({
  id: true,
  lastInteraction: true,
  createdAt: true,
});

// AI Monitoring Logs schema
export const aiMonitoringLogs = pgTable("ai_monitoring_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(), // 'threat_detected', 'transaction_verified', 'gas_optimization'
  description: text("description").notNull(),
  severity: text("severity").notNull(), // 'info', 'warning', 'critical'
  timestamp: timestamp("timestamp").defaultNow(),
  relatedEntityId: integer("related_entity_id"), // Can link to tx, contract, etc.
  relatedEntityType: text("related_entity_type"), // 'transaction', 'contract', etc.
});

export const aiMonitoringLogsRelations = relations(aiMonitoringLogs, ({ one }) => ({
  user: one(users, {
    fields: [aiMonitoringLogs.userId],
    references: [users.id],
  }),
}));

export const insertAiMonitoringLogSchema = createInsertSchema(aiMonitoringLogs).omit({
  id: true,
  timestamp: true,
});

// CID Management schema
export const cidEntries = pgTable("cid_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  cid: text("cid").notNull(),
  type: text("type").notNull(), // 'wallet_backup', 'smart_contract', 'transaction_log'
  status: text("status").notNull(), // 'active', 'syncing', 'inactive'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCidEntrySchema = createInsertSchema(cidEntries).omit({
  id: true,
  createdAt: true,
});

// Types exported from schemas
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type SmartContract = typeof smartContracts.$inferSelect;
export type InsertSmartContract = z.infer<typeof insertSmartContractSchema>;

export type AiMonitoringLog = typeof aiMonitoringLogs.$inferSelect;
export type InsertAiMonitoringLog = z.infer<typeof insertAiMonitoringLogSchema>;

// Payment Methods schema
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'card', 'bank_account', etc.
  provider: text("provider").notNull(), // 'stripe', 'paypal', etc.
  providerPaymentId: text("provider_payment_id").notNull(), // Stripe payment method ID, etc.
  last4: text("last4"), // Last 4 digits of the card or account
  expiryMonth: integer("expiry_month"), // Card expiry month
  expiryYear: integer("expiry_year"), // Card expiry year
  isDefault: boolean("is_default").default(false),
  status: text("status").notNull(), // 'active', 'expired', 'invalid'
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}));

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

// Payments schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  paymentMethodId: integer("payment_method_id").references(() => paymentMethods.id),
  walletId: integer("wallet_id").references(() => wallets.id),
  amount: decimal("amount").notNull(),
  currency: text("currency").notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'failed', 'refunded'
  provider: text("provider").notNull().default('stripe'), // 'stripe', 'open_collective', etc.
  providerPaymentId: text("provider_payment_id"), // Stripe payment intent ID or other provider's ID
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [payments.paymentMethodId],
    references: [paymentMethods.id],
  }),
  wallet: one(wallets, {
    fields: [payments.walletId],
    references: [wallets.id],
  }),
}));

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  processedAt: true,
}).extend({
  // We need to extend this because the provider field is added to the schema
  provider: z.string().default('stripe'),
});

export type CidEntry = typeof cidEntries.$inferSelect;
export type InsertCidEntry = z.infer<typeof insertCidEntrySchema>;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// Governance Schemas

// Staking schema
export const stakingPositions = pgTable("staking_positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  amount: decimal("amount").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  status: text("status").notNull(), // 'active', 'ended', 'canceled'
  rewardsEarned: decimal("rewards_earned").default("0"),
  lockPeriodDays: integer("lock_period_days"),
  stakingPoolId: text("staking_pool_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const stakingPositionsRelations = relations(stakingPositions, ({ one }) => ({
  user: one(users, {
    fields: [stakingPositions.userId],
    references: [users.id],
  }),
  wallet: one(wallets, {
    fields: [stakingPositions.walletId],
    references: [wallets.id],
  }),
}));

export const insertStakingPositionSchema = createInsertSchema(stakingPositions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rewardsEarned: true,
});

// Proposals schema
export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  creatorId: integer("creator_id").notNull().references(() => users.id),
  status: text("status").notNull(), // 'draft', 'active', 'passed', 'rejected', 'expired'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  contractAddress: text("contract_address"),
  chain: text("chain").notNull(),
  proposalType: text("proposal_type").notNull(), // 'parameter_change', 'treasury', 'upgrade', 'text'
  requiredQuorum: decimal("required_quorum").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const proposalsRelations = relations(proposals, ({ one, many }) => ({
  creator: one(users, {
    fields: [proposals.creatorId],
    references: [users.id],
  }),
  votes: many(votes),
  options: many(proposalOptions),
}));

export const insertProposalSchema = createInsertSchema(proposals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Proposal Options schema
export const proposalOptions = pgTable("proposal_options", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").notNull().references(() => proposals.id),
  optionText: text("option_text").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const proposalOptionsRelations = relations(proposalOptions, ({ one, many }) => ({
  proposal: one(proposals, {
    fields: [proposalOptions.proposalId],
    references: [proposals.id],
  }),
  votes: many(votes),
}));

export const insertProposalOptionSchema = createInsertSchema(proposalOptions).omit({
  id: true,
  createdAt: true,
});

// Votes schema
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  proposalId: integer("proposal_id").notNull().references(() => proposals.id),
  optionId: integer("option_id").notNull().references(() => proposalOptions.id),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  votePower: decimal("vote_power").notNull(),
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  proposal: one(proposals, {
    fields: [votes.proposalId],
    references: [proposals.id],
  }),
  option: one(proposalOptions, {
    fields: [votes.optionId],
    references: [proposalOptions.id],
  }),
  wallet: one(wallets, {
    fields: [votes.walletId],
    references: [wallets.id],
  }),
}));

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

// Governance Rewards schema
export const governanceRewards = pgTable("governance_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  rewardType: text("reward_type").notNull(), // 'voting', 'staking', 'proposal_creation'
  status: text("status").notNull(), // 'pending', 'claimed', 'expired'
  relatedEntityId: integer("related_entity_id"), // ID of proposal, vote, or staking position
  relatedEntityType: text("related_entity_type"), // 'proposal', 'vote', 'staking'
  createdAt: timestamp("created_at").defaultNow(),
  claimedAt: timestamp("claimed_at"),
});

export const governanceRewardsRelations = relations(governanceRewards, ({ one }) => ({
  user: one(users, {
    fields: [governanceRewards.userId],
    references: [users.id],
  }),
}));

export const insertGovernanceRewardSchema = createInsertSchema(governanceRewards).omit({
  id: true,
  createdAt: true,
  claimedAt: true,
});

// Export the governance types
export type StakingPosition = typeof stakingPositions.$inferSelect;
export type InsertStakingPosition = z.infer<typeof insertStakingPositionSchema>;

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;

export type ProposalOption = typeof proposalOptions.$inferSelect;
export type InsertProposalOption = z.infer<typeof insertProposalOptionSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

export type GovernanceReward = typeof governanceRewards.$inferSelect;
export type InsertGovernanceReward = z.infer<typeof insertGovernanceRewardSchema>;

// Wallet Health Score Tables
export const walletHealthScores = pgTable("wallet_health_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  overallScore: integer("overall_score").notNull(), // 0-100
  securityScore: integer("security_score").notNull(), // 0-100
  diversificationScore: integer("diversification_score").notNull(), // 0-100
  activityScore: integer("activity_score").notNull(), // 0-100
  gasOptimizationScore: integer("gas_optimization_score").notNull(), // 0-100
  backgroundScanTimestamp: timestamp("background_scan_timestamp", { mode: "date" }),
});

export const walletHealthScoresRelations = relations(walletHealthScores, ({ one }) => ({
  user: one(users, {
    fields: [walletHealthScores.userId],
    references: [users.id],
  }),
  wallet: one(wallets, {
    fields: [walletHealthScores.walletId],
    references: [wallets.id],
  }),
}));

export const insertWalletHealthScoreSchema = createInsertSchema(walletHealthScores).omit({
  id: true,
  createdAt: true,
});

export const walletHealthIssues = pgTable("wallet_health_issues", {
  id: serial("id").primaryKey(),
  healthScoreId: integer("health_score_id").notNull().references(() => walletHealthScores.id),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  category: text("category").notNull(), // security, diversification, activity, gasOptimization
  severity: text("severity").notNull(), // low, medium, high, critical
  title: text("title").notNull(),
  description: text("description").notNull(),
  recommendation: text("recommendation").notNull(),
  resolved: boolean("resolved").default(false),
  resolvedAt: timestamp("resolved_at", { mode: "date" }),
});

export const walletHealthIssuesRelations = relations(walletHealthIssues, ({ one }) => ({
  healthScore: one(walletHealthScores, {
    fields: [walletHealthIssues.healthScoreId],
    references: [walletHealthScores.id],
  }),
}));

export const insertWalletHealthIssueSchema = createInsertSchema(walletHealthIssues).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export type WalletHealthScore = typeof walletHealthScores.$inferSelect;
export type InsertWalletHealthScore = z.infer<typeof insertWalletHealthScoreSchema>;
export type WalletHealthIssue = typeof walletHealthIssues.$inferSelect;
export type InsertWalletHealthIssue = z.infer<typeof insertWalletHealthIssueSchema>;

// Notification preferences schema
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  // Phone notification fields
  phoneNumber: text("phone_number"),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  smsEnabled: boolean("sms_enabled").default(false),
  // Matrix notification fields (open-source alternative to Twilio)
  matrixId: text("matrix_id"), // Format: @username:homeserver.org
  isMatrixVerified: boolean("is_matrix_verified").default(false),
  matrixEnabled: boolean("matrix_enabled").default(false),
  // Alert types
  transactionAlerts: boolean("transaction_alerts").default(true),
  securityAlerts: boolean("security_alerts").default(true), 
  priceAlerts: boolean("price_alerts").default(false),
  marketingUpdates: boolean("marketing_updates").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;

// Admin Action Logs
export const adminActions = pgTable("admin_actions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id), // Admin who performed the action
  actionType: text("action_type").notNull(), // 'user_management', 'fund_allocation', 'tokenomics_update', 'system_config'
  action: text("action").notNull(), // Detailed action e.g. 'update_user_role', 'allocate_funds'
  targetId: integer("target_id"), // ID of the entity being acted upon (if applicable)
  targetType: text("target_type"), // Type of entity e.g. 'user', 'wallet', 'fund'
  details: jsonb("details"), // Additional details about the action
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const adminActionsRelations = relations(adminActions, ({ one }) => ({
  user: one(users, {
    fields: [adminActions.userId],
    references: [users.id],
  }),
}));

export const insertAdminActionSchema = createInsertSchema(adminActions).omit({
  id: true,
  timestamp: true,
});

// Admin Permissions
export const adminPermissions = pgTable("admin_permissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  permissionName: text("permission_name").notNull(), // 'manage_users', 'manage_funds', 'view_reports', etc.
  permissionLevel: text("permission_level").notNull(), // 'read', 'write', 'admin'
  grantedBy: integer("granted_by").references(() => users.id), // Admin who granted this permission
  grantedAt: timestamp("granted_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
});

export const adminPermissionsRelations = relations(adminPermissions, ({ one }) => ({
  user: one(users, {
    fields: [adminPermissions.userId],
    references: [users.id],
  }),
  grantor: one(users, {
    fields: [adminPermissions.grantedBy],
    references: [users.id],
    relationName: "permission_grantor",
  }),
}));

export const insertAdminPermissionSchema = createInsertSchema(adminPermissions).omit({
  id: true,
  grantedAt: true,
});

// Fund Management
export const funds = pgTable("funds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  amount: decimal("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  fundType: text("fund_type").notNull(), // 'operational', 'development', 'marketing', 'reserve'
  status: text("status").notNull().default("active"), // 'active', 'depleted', 'locked'
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fundsRelations = relations(funds, ({ one, many }) => ({
  creator: one(users, {
    fields: [funds.createdBy],
    references: [users.id],
  }),
  allocations: many(fundAllocations),
  transactions: many(fundTransactions),
}));

export const insertFundSchema = createInsertSchema(funds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Fund Allocations
export const fundAllocations = pgTable("fund_allocations", {
  id: serial("id").primaryKey(),
  fundId: integer("fund_id").notNull().references(() => funds.id),
  amount: decimal("amount").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'completed'
  approvedBy: integer("approved_by").references(() => users.id),
  requestedBy: integer("requested_by").notNull().references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const fundAllocationsRelations = relations(fundAllocations, ({ one, many }) => ({
  fund: one(funds, {
    fields: [fundAllocations.fundId],
    references: [funds.id],
  }),
  approver: one(users, {
    fields: [fundAllocations.approvedBy],
    references: [users.id],
    relationName: "allocation_approver",
  }),
  requester: one(users, {
    fields: [fundAllocations.requestedBy],
    references: [users.id],
    relationName: "allocation_requester",
  }),
  transactions: many(fundTransactions),
}));

export const insertFundAllocationSchema = createInsertSchema(fundAllocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

// Fund Transactions
export const fundTransactions = pgTable("fund_transactions", {
  id: serial("id").primaryKey(),
  fundId: integer("fund_id").notNull().references(() => funds.id),
  allocationId: integer("allocation_id").references(() => fundAllocations.id),
  amount: decimal("amount").notNull(),
  transactionType: text("transaction_type").notNull(), // 'deposit', 'withdrawal', 'transfer'
  description: text("description").notNull(),
  executedBy: integer("executed_by").notNull().references(() => users.id),
  recipientType: text("recipient_type"), // 'vendor', 'employee', 'partner', 'project'
  recipientId: text("recipient_id"), // External ID or identifier
  recipientDetails: jsonb("recipient_details"), // Additional details about the recipient
  timestamp: timestamp("timestamp").defaultNow(),
  reference: text("reference"), // Invoice number, PO number, etc.
  status: text("status").notNull().default("completed"), // 'pending', 'completed', 'failed', 'reversed'
  metadata: jsonb("metadata"),
});

export const fundTransactionsRelations = relations(fundTransactions, ({ one }) => ({
  fund: one(funds, {
    fields: [fundTransactions.fundId],
    references: [funds.id],
  }),
  allocation: one(fundAllocations, {
    fields: [fundTransactions.allocationId],
    references: [fundAllocations.id],
  }),
  executor: one(users, {
    fields: [fundTransactions.executedBy],
    references: [users.id],
  }),
}));

export const insertFundTransactionSchema = createInsertSchema(fundTransactions).omit({
  id: true,
  timestamp: true,
});

// Forward declaration for token distributions
const tokenDistributionsRef = () => tokenDistributions;

// Tokenomics Management
export const tokenomicsConfig = pgTable("tokenomics_config", {
  id: serial("id").primaryKey(),
  totalSupply: decimal("total_supply").notNull(),
  circulatingSupply: decimal("circulating_supply").notNull(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  decimals: integer("decimals").notNull(),
  initialPrice: decimal("initial_price").notNull(),
  currentPrice: decimal("current_price").notNull(),
  marketCap: decimal("market_cap").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  updatedBy: integer("updated_by").notNull().references(() => users.id),
  status: text("status").notNull().default("active"), // 'planned', 'active', 'deprecated'
  version: integer("version").notNull().default(1),
  metadata: jsonb("metadata"),
});

export const insertTokenomicsConfigSchema = createInsertSchema(tokenomicsConfig).omit({
  id: true,
  lastUpdated: true,
});

// Token Distribution
export const tokenDistributions = pgTable("token_distributions", {
  id: serial("id").primaryKey(),
  configId: integer("config_id").notNull().references(() => tokenomicsConfig.id),
  name: text("name").notNull(), // 'ICO', 'Team', 'Foundation', 'Ecosystem', 'Development'
  percentage: decimal("percentage").notNull(),
  amount: decimal("amount").notNull(),
  lockupPeriodDays: integer("lockup_period_days"),
  vestingPeriodDays: integer("vesting_period_days"),
  vestingSchedule: jsonb("vesting_schedule"), // Detailed vesting schedule
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").notNull().references(() => users.id),
});

export const tokenomicsConfigRelations = relations(tokenomicsConfig, ({ one, many }) => ({
  updater: one(users, {
    fields: [tokenomicsConfig.updatedBy],
    references: [users.id],
  }),
  distributions: many(tokenDistributionsRef),
}));

export const tokenDistributionsRelations = relations(tokenDistributions, ({ one }) => ({
  config: one(tokenomicsConfig, {
    fields: [tokenDistributions.configId],
    references: [tokenomicsConfig.id],
  }),
  creator: one(users, {
    fields: [tokenDistributions.createdBy],
    references: [users.id],
  }),
}));

export const insertTokenDistributionSchema = createInsertSchema(tokenDistributions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export admin types
export type AdminAction = typeof adminActions.$inferSelect;
export type InsertAdminAction = z.infer<typeof insertAdminActionSchema>;

export type AdminPermission = typeof adminPermissions.$inferSelect;
export type InsertAdminPermission = z.infer<typeof insertAdminPermissionSchema>;

export type Fund = typeof funds.$inferSelect;
export type InsertFund = z.infer<typeof insertFundSchema>;

export type FundAllocation = typeof fundAllocations.$inferSelect;
export type InsertFundAllocation = z.infer<typeof insertFundAllocationSchema>;

export type FundTransaction = typeof fundTransactions.$inferSelect;
export type InsertFundTransaction = z.infer<typeof insertFundTransactionSchema>;

export type TokenomicsConfig = typeof tokenomicsConfig.$inferSelect;
export type InsertTokenomicsConfig = z.infer<typeof insertTokenomicsConfigSchema>;

export type TokenDistribution = typeof tokenDistributions.$inferSelect;
export type InsertTokenDistribution = z.infer<typeof insertTokenDistributionSchema>;

// Widget schema imports
import { 
  widgets, 
  widgetTemplates, 
  dashboards, 
  insertWidgetSchema,
  insertWidgetTemplateSchema,
  insertDashboardSchema
} from './widget-schema';

// Widget relations
export const widgetsRelations = relations(widgets, ({ one }) => ({
  user: one(users, {
    fields: [widgets.userId],
    references: [users.id],
  }),
}));

export const widgetTemplatesRelations = relations(widgetTemplates, ({ many }) => ({
  widgets: many(widgets),
}));

export const dashboardsRelations = relations(dashboards, ({ one, many }) => ({
  user: one(users, {
    fields: [dashboards.userId],
    references: [users.id],
  }),
  widgets: many(widgets),
}));

// Extend user relations with widgets
export const usersWidgetRelations = relations(users, ({ many }) => ({
  widgets: many(widgets),
  dashboards: many(dashboards),
}));

// Export widget types
export type Widget = typeof widgets.$inferSelect;
export type InsertWidget = z.infer<typeof insertWidgetSchema>;

export type WidgetTemplate = typeof widgetTemplates.$inferSelect;
export type InsertWidgetTemplate = z.infer<typeof insertWidgetTemplateSchema>;

export type Dashboard = typeof dashboards.$inferSelect;
export type InsertDashboard = z.infer<typeof insertDashboardSchema>;

// ICO Participation schema
export const icoParticipations = pgTable('ico_participations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  transactionHash: text('transaction_hash').notNull(),
  amountContributed: text('amount_contributed').notNull(), // In source currency
  tokensAllocated: text('tokens_allocated').notNull(),
  purchaseTimestamp: timestamp('purchase_timestamp').defaultNow(),
  phase: text('phase').notNull(), // 'seed', 'private', 'public'
  status: text('status').notNull().default('pending'), // 'pending', 'confirmed', 'distributed'
  sourceWalletAddress: text('source_wallet_address').notNull(),
  destinationWalletAddress: text('destination_wallet_address').notNull(),
  networkFee: text('network_fee'),
  conversionRate: text('conversion_rate'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  referralCode: text('referral_code'),
});

export const icoParticipationsRelations = relations(icoParticipations, ({ one }) => ({
  user: one(users, {
    fields: [icoParticipations.userId],
    references: [users.id],
  }),
}));

export const insertIcoParticipationSchema = createInsertSchema(icoParticipations).omit({
  id: true,
  purchaseTimestamp: true,
});

// ICO Phases schema
export const icoPhases = pgTable('ico_phases', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  hardCap: text('hard_cap').notNull(),
  softCap: text('soft_cap').notNull(),
  tokenPrice: text('token_price').notNull(),
  minContribution: text('min_contribution'),
  maxContribution: text('max_contribution'),
  totalRaised: text('total_raised').default('0'),
  totalParticipants: integer('total_participants').default(0),
  status: text('status').notNull().default('upcoming'), // 'upcoming', 'active', 'completed', 'cancelled'
  bonusPercentage: integer('bonus_percentage').default(0),
});

export const insertIcoPhaseSchema = createInsertSchema(icoPhases).omit({
  id: true,
});

// Enhanced Staking Records schema
export const stakingRecords = pgTable('staking_records', {
  id: serial('id').primaryKey(), 
  userId: integer('user_id').references(() => users.id),
  walletId: integer('wallet_id').references(() => wallets.id),
  amount: text('amount').notNull(),
  startTime: timestamp('start_time').defaultNow(),
  endTime: timestamp('end_time'),
  rewardRate: decimal('reward_rate').notNull(),
  totalReward: text('total_reward').default('0'),
  status: text('status').notNull().default('active'), // 'active', 'completed', 'cancelled'
  lastRewardCalculation: timestamp('last_reward_calculation').defaultNow(),
  nodeContribution: text('node_contribution').default('0'),
  validatorStatus: boolean('validator_status').default(false),
  fractalShardingParticipation: boolean('fractal_sharding_participation').default(false),
});

export const stakingRecordsRelations = relations(stakingRecords, ({ one }) => ({
  user: one(users, {
    fields: [stakingRecords.userId],
    references: [users.id],
  }),
  wallet: one(wallets, {
    fields: [stakingRecords.walletId],
    references: [wallets.id],
  }),
}));

export const insertStakingRecordSchema = createInsertSchema(stakingRecords).omit({
  id: true,
  startTime: true,
  lastRewardCalculation: true,
});

// Export the new types
export type IcoParticipation = typeof icoParticipations.$inferSelect;
export type InsertIcoParticipation = z.infer<typeof insertIcoParticipationSchema>;

export type IcoPhase = typeof icoPhases.$inferSelect;
export type InsertIcoPhase = z.infer<typeof insertIcoPhaseSchema>;

export type StakingRecord = typeof stakingRecords.$inferSelect;
export type InsertStakingRecord = z.infer<typeof insertStakingRecordSchema>;

// Combine all schemas for export
export const schema = {
  users,
  wallets,
  transactions,
  smartContracts,
  aiMonitoringLogs,
  cidEntries,
  paymentMethods,
  payments,
  stakingPositions,
  proposals,
  proposalOptions,
  votes,
  governanceRewards,
  walletHealthScores,
  walletHealthIssues,
  notificationPreferences,
  widgets,
  widgetTemplates,
  dashboards,
  adminActions,
  adminPermissions,
  funds,
  fundAllocations,
  fundTransactions,
  tokenomicsConfig,
  tokenDistributions,
  icoParticipations,
  icoPhases,
  stakingRecords,
};
