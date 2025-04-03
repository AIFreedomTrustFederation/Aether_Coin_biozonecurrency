import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  wallets: many(wallets),
  smartContracts: many(smartContracts),
  aiMonitoringLogs: many(aiMonitoringLogs),
  cidEntries: many(cidEntries),
  paymentMethods: many(paymentMethods),
  payments: many(payments),
  stakingPositions: many(stakingPositions),
  createdProposals: many(proposals, { relationName: "createdProposals" }),
  votes: many(votes),
  governanceRewards: many(governanceRewards),
  notificationPreference: one(notificationPreferences),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
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
  providerPaymentId: text("provider_payment_id"), // Stripe payment intent ID
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
  phoneNumber: text("phone_number"),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  smsEnabled: boolean("sms_enabled").default(false),
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
