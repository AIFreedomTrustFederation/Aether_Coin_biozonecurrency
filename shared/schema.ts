import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, primaryKey, uniqueIndex, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Import and re-export bridge schemas
import { 
  BridgeStatus,
  BridgeStatusEnum,
  BridgeTransactionStatus,
  BridgeTransactionStatusEnum,
  BridgeNetwork,
  BridgeNetworkEnum,
  bridgeConfigurations,
  bridgeValidators,
  bridgeSupportedTokens,
  bridgeTransactions,
  BridgeConfigurationType,
  BridgeValidatorType,
  BridgeSupportedTokenType,
  BridgeTransactionType,
  BridgeHealthType,
  FeeEstimateType
} from "./bridge-schema";

// Import interface types
import type {
  BridgeHealth,
  FeeEstimate
} from "./bridge-schema";

// Import types
import type {
  BridgeConfiguration, 
  InsertBridgeConfiguration,
  BridgeValidator, 
  InsertBridgeValidator,
  BridgeSupportedToken, 
  InsertBridgeSupportedToken,
  BridgeTransaction, 
  InsertBridgeTransaction
} from "./bridge-schema";

// Re-export bridge types
export {
  // Types
  BridgeConfiguration, 
  InsertBridgeConfiguration,
  BridgeValidator, 
  InsertBridgeValidator,
  BridgeSupportedToken, 
  InsertBridgeSupportedToken,
  BridgeTransaction, 
  InsertBridgeTransaction,
  
  // Enums and values
  BridgeStatus,
  BridgeStatusEnum,
  BridgeTransactionStatus,
  BridgeTransactionStatusEnum,
  BridgeNetwork,
  BridgeNetworkEnum,
  BridgeHealth,
  FeeEstimate,
  
  // Tables
  bridgeConfigurations,
  bridgeValidators,
  bridgeSupportedTokens,
  bridgeTransactions,
  
  // Type values
  BridgeConfigurationType,
  BridgeValidatorType,
  BridgeSupportedTokenType,
  BridgeTransactionType
};

// Import all DApp Builder and Marketplace schema elements
import {
  dappTemplates,
  userDapps,
  dappCreationChats,
  contractSchemas,
  conversationMessages,
  dappVersions,
  dappFiles,
  marketplaceListings,
  dappPurchases,
  dappReviews,
  securityAuditTemplates,
  browserUsers,
  sandboxEnvironments,
  CodeGenResult
} from './dapp-schema';

// Escrow system types
export enum EscrowStatus {
  INITIATED = 'initiated',
  FUNDED = 'funded',
  EVIDENCE_SUBMITTED = 'evidence_submitted',
  VERIFIED = 'verified',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export enum EvidenceType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio',
  CHAT_LOG = 'chat_log',
  OTHER = 'other'
}

export enum DisputeStatus {
  OPENED = 'opened',
  REVIEWING = 'reviewing',
  EVIDENCE_REQUESTED = 'evidence_requested',
  RESOLVED_BUYER = 'resolved_buyer',
  RESOLVED_SELLER = 'resolved_seller',
  RESOLVED_SPLIT = 'resolved_split',
  CLOSED = 'closed'
}

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // 'user', 'admin', 'super_admin'
  isTrustMember: boolean("is_trust_member").default(false), // Whether this user is an AI Freedom Trust member
  trustMemberSince: timestamp("trust_member_since"), // When the user became a trust member
  trustMemberLevel: text("trust_member_level"), // Level of trust membership: 'associate', 'full', 'governing'
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
  apiKeys: many(userApiKeys),
  bridgeTransactions: many(bridgeTransactions),
  // New relations will be added in usersExtendedRelations after schema initialization
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
  isActive: true,
  trustMemberSince: true,
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
  bridgeTransactions: many(bridgeTransactions),
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
  plainDescription: text("plain_description"), // Human-readable description
  isLayer2: boolean("is_layer2").default(false), // Whether this is a Layer 2 transaction
  layer2Type: text("layer2_type"), // e.g., 'optimism', 'arbitrum', 'polygon', 'zksync'
  layer2Data: jsonb("layer2_data"), // Additional Layer 2 specific information
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

// Tokenomics Management - moving declaration up before references
// Token Distribution forward declaration
let tokenDistributions: any;

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
tokenDistributions = pgTable("token_distributions", {
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

// Export tokenDistributions after initialization
export { tokenDistributions };

export const tokenomicsConfigRelations = relations(tokenomicsConfig, ({ one, many }) => ({
  updater: one(users, {
    fields: [tokenomicsConfig.updatedBy],
    references: [users.id],
  }),
  distributions: many(tokenDistributions),
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
// Escrow Transactions schema
export const escrowTransactions = pgTable("escrow_transactions", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  amount: decimal("amount").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // 'created', 'funded', 'in_progress', 'completed', 'disputed', 'refunded', 'canceled'
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  disputedAt: timestamp("disputed_at"),
  transactionHash: text("transaction_hash"),
  contractAddress: text("contract_address"),
  chain: text("chain").notNull(),
  escrowFee: decimal("escrow_fee"),
  releasedAt: timestamp("released_at"),
  metadata: jsonb("metadata"), // For storing additional escrow specific data
});

// Escrow Proofs schema (for pictures, delivery confirmation, etc.)
export const escrowProofs = pgTable("escrow_proofs", {
  id: serial("id").primaryKey(),
  escrowTransactionId: integer("escrow_transaction_id").notNull().references(() => escrowTransactions.id),
  userId: integer("user_id").notNull().references(() => users.id), // Who uploaded the proof
  proofType: text("proof_type").notNull(), // 'delivery_confirmation', 'condition_picture', 'tracking_info', etc.
  description: text("description"),
  fileUrl: text("file_url"), // IPFS/Web3.Storage URL to the proof file
  fileCid: text("file_cid"), // IPFS CID of the proof file
  timestamp: timestamp("timestamp").defaultNow(),
  verified: boolean("verified").default(false),
  verificationNotes: text("verification_notes"),
});

// Matrix Chat Rooms for Escrow Transactions
export const matrixRooms = pgTable("matrix_rooms", {
  id: serial("id").primaryKey(),
  roomId: text("room_id").notNull().unique(), // Matrix room ID
  escrowTransactionId: integer("escrow_transaction_id").notNull().references(() => escrowTransactions.id).unique(),
  createdAt: timestamp("created_at").defaultNow(),
  status: text("status").notNull(), // 'active', 'archived', 'deleted'
  lastActivity: timestamp("last_activity").defaultNow(),
  encryptionEnabled: boolean("encryption_enabled").default(true),
});

// Matrix Messages for Audit Trail
export const matrixMessages = pgTable("matrix_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => matrixRooms.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  eventId: text("event_id").notNull(), // Matrix event ID
  messageType: text("message_type").notNull(), // 'text', 'image', 'file', 'system'
  metadata: jsonb("metadata"), // Additional message metadata
});

// Mysterion AI Ethics Assessment
export const mysterionAssessments = pgTable("mysterion_assessments", {
  id: serial("id").primaryKey(),
  relatedEntityId: integer("related_entity_id").notNull(), // ID of escrow transaction, dispute, etc.
  relatedEntityType: text("related_entity_type").notNull(), // 'escrow_transaction', 'dispute', etc.
  assessmentType: text("assessment_type").notNull(), // 'ethics', 'fraud_detection', 'dispute_resolution', etc.
  assessmentDate: timestamp("assessment_date").defaultNow(),
  confidence: decimal("confidence").notNull(), // 0-1 confidence score
  decision: text("decision").notNull(), // 'buyer_favor', 'seller_favor', 'split', 'inconclusive', etc.
  rationale: text("rationale").notNull(),
  ethicalPrinciples: text("ethical_principles").array(), // Array of ethical principles applied
  precedents: jsonb("precedents"), // JSON of similar cases used as precedent
  compensationAmount: decimal("compensation_amount"), // Optional AiCoin compensation
  compensationReason: text("compensation_reason"),
});

// Escrow Disputes
export const escrowDisputes = pgTable("escrow_disputes", {
  id: serial("id").primaryKey(),
  escrowTransactionId: integer("escrow_transaction_id").notNull().references(() => escrowTransactions.id),
  initiatorId: integer("initiator_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // 'opened', 'investigating', 'resolved_buyer', 'resolved_seller', 'split', 'escalated'
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolution: text("resolution"),
  resolutionDetail: text("resolution_detail"),
  mysterionAssessmentId: integer("mysterion_assessment_id").references(() => mysterionAssessments.id),
});

// User Reputation System
export const userReputation = pgTable("user_reputation", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  overallScore: decimal("overall_score").notNull().default("0.5"), // 0-1 scale
  transactionCount: integer("transaction_count").notNull().default(0),
  positiveRatings: integer("positive_ratings").notNull().default(0),
  negativeRatings: integer("negative_ratings").notNull().default(0),
  disputesInitiated: integer("disputes_initiated").notNull().default(0),
  disputesLost: integer("disputes_lost").notNull().default(0),
  cooldownUntil: timestamp("cooldown_until"), // If user is in cooldown period
  lastUpdated: timestamp("last_updated").defaultNow(),
  trustLevel: text("trust_level").notNull().default("new"), // 'new', 'trusted', 'verified', 'elite', 'flagged'
  verificationStatus: text("verification_status").notNull().default("none"), // 'none', 'basic', 'advanced', 'premium'
  strikeCounts: integer("strike_counts").notNull().default(0), // Number of policy violations
});

// Transaction Ratings
export const transactionRatings = pgTable("transaction_ratings", {
  id: serial("id").primaryKey(),
  escrowTransactionId: integer("escrow_transaction_id").notNull().references(() => escrowTransactions.id),
  raterId: integer("rater_id").notNull().references(() => users.id),
  ratedUserId: integer("rated_user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 scale
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  flagged: boolean("flagged").default(false),
  flagReason: text("flag_reason"),
});

// Recursion Logs for Transaction Reversals
export const recursionLogs = pgTable("recursion_logs", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull().references(() => transactions.id),
  requesterId: integer("requester_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  status: text("status").notNull(), // 'requested', 'processing', 'approved', 'denied', 'completed'
  requestedAt: timestamp("requested_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  networkFee: decimal("network_fee"),
  recursionDepth: integer("recursion_depth").notNull().default(1), // Mandelbrot recursion depth applied
  originalHash: text("original_hash").notNull(), // Original transaction hash
  reversalHash: text("reversal_hash"), // Reversal transaction hash if processed
  mysterionNotes: text("mysterion_notes"), // Notes from Mysterion AI about the reversal
  approved: boolean("approved"),
  approvalReason: text("approval_reason"),
});

// AiCoin Compensation Records
export const aiCoinCompensation = pgTable("ai_coin_compensation", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount").notNull(),
  reason: text("reason").notNull(),
  relatedEntityId: integer("related_entity_id"), // ID of escrow transaction, dispute, etc.
  relatedEntityType: text("related_entity_type"), // 'escrow_transaction', 'dispute', etc.
  status: text("status").notNull(), // 'pending', 'processed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
  transactionHash: text("transaction_hash"),
  mysterionAssessmentId: integer("mysterion_assessment_id").references(() => mysterionAssessments.id),
});

// Relations for new tables
export const escrowTransactionsRelations = relations(escrowTransactions, ({ one, many }) => ({
  seller: one(users, {
    fields: [escrowTransactions.sellerId],
    references: [users.id],
    relationName: "seller_escrows"
  }),
  buyer: one(users, {
    fields: [escrowTransactions.buyerId],
    references: [users.id],
    relationName: "buyer_escrows"
  }),
  proofs: many(escrowProofs),
  matrixRoom: one(matrixRooms, {
    fields: [escrowTransactions.id],
    references: [matrixRooms.escrowTransactionId]
  }),
  disputes: many(escrowDisputes)
}));

export const escrowProofsRelations = relations(escrowProofs, ({ one }) => ({
  escrowTransaction: one(escrowTransactions, {
    fields: [escrowProofs.escrowTransactionId],
    references: [escrowTransactions.id]
  }),
  user: one(users, {
    fields: [escrowProofs.userId],
    references: [users.id]
  })
}));

export const matrixRoomsRelations = relations(matrixRooms, ({ one }) => ({
  escrowTransaction: one(escrowTransactions, {
    fields: [matrixRooms.escrowTransactionId],
    references: [escrowTransactions.id]
  })
}));

export const matrixMessagesRelations = relations(matrixMessages, ({ one }) => ({
  room: one(matrixRooms, {
    fields: [matrixMessages.roomId],
    references: [matrixRooms.id]
  }),
  sender: one(users, {
    fields: [matrixMessages.senderId],
    references: [users.id]
  })
}));

export const escrowDisputesRelations = relations(escrowDisputes, ({ one }) => ({
  escrowTransaction: one(escrowTransactions, {
    fields: [escrowDisputes.escrowTransactionId],
    references: [escrowTransactions.id]
  }),
  initiator: one(users, {
    fields: [escrowDisputes.initiatorId],
    references: [users.id]
  }),
  mysterionAssessment: one(mysterionAssessments, {
    fields: [escrowDisputes.mysterionAssessmentId],
    references: [mysterionAssessments.id]
  })
}));

export const mysterionAssessmentsRelations = relations(mysterionAssessments, ({ many }) => ({
  disputes: many(escrowDisputes)
}));

export const userReputationRelations = relations(userReputation, ({ one }) => ({
  user: one(users, {
    fields: [userReputation.userId],
    references: [users.id]
  })
}));

export const transactionRatingsRelations = relations(transactionRatings, ({ one }) => ({
  escrowTransaction: one(escrowTransactions, {
    fields: [transactionRatings.escrowTransactionId],
    references: [escrowTransactions.id]
  }),
  rater: one(users, {
    fields: [transactionRatings.raterId],
    references: [users.id],
    relationName: "given_ratings"
  }),
  ratedUser: one(users, {
    fields: [transactionRatings.ratedUserId],
    references: [users.id],
    relationName: "received_ratings"
  })
}));

export const recursionLogsRelations = relations(recursionLogs, ({ one }) => ({
  transaction: one(transactions, {
    fields: [recursionLogs.transactionId],
    references: [transactions.id]
  }),
  requester: one(users, {
    fields: [recursionLogs.requesterId],
    references: [users.id]
  })
}));

export const aiCoinCompensationRelations = relations(aiCoinCompensation, ({ one }) => ({
  user: one(users, {
    fields: [aiCoinCompensation.userId],
    references: [users.id]
  }),
  mysterionAssessment: one(mysterionAssessments, {
    fields: [aiCoinCompensation.mysterionAssessmentId],
    references: [mysterionAssessments.id]
  })
}));

// Insert schemas for new tables
export const insertEscrowTransactionSchema = createInsertSchema(escrowTransactions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  disputedAt: true,
  releasedAt: true,
});

export const insertEscrowProofSchema = createInsertSchema(escrowProofs).omit({
  id: true,
  timestamp: true,
  verified: true,
  verificationNotes: true,
});

export const insertMatrixRoomSchema = createInsertSchema(matrixRooms).omit({
  id: true,
  createdAt: true,
  lastActivity: true,
});

export const insertMatrixMessageSchema = createInsertSchema(matrixMessages).omit({
  id: true,
  sentAt: true,
});

export const insertEscrowDisputeSchema = createInsertSchema(escrowDisputes).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
  mysterionAssessmentId: true,
});

export const insertMysterionAssessmentSchema = createInsertSchema(mysterionAssessments).omit({
  id: true,
  assessmentDate: true,
});

export const insertUserReputationSchema = createInsertSchema(userReputation).omit({
  id: true,
  lastUpdated: true,
  overallScore: true,
  transactionCount: true,
  positiveRatings: true,
  negativeRatings: true,
  disputesInitiated: true,
  disputesLost: true,
  trustLevel: true,
  verificationStatus: true,
  strikeCounts: true,
});

export const insertTransactionRatingSchema = createInsertSchema(transactionRatings).omit({
  id: true,
  createdAt: true,
  flagged: true,
  flagReason: true,
});

export const insertRecursionLogSchema = createInsertSchema(recursionLogs).omit({
  id: true,
  requestedAt: true,
  processedAt: true,
  reversalHash: true,
  mysterionNotes: true,
  approved: true,
  approvalReason: true,
});

export const insertAiCoinCompensationSchema = createInsertSchema(aiCoinCompensation).omit({
  id: true,
  createdAt: true,
  processedAt: true,
  transactionHash: true,
});

// Types for the new schemas
export type EscrowTransaction = typeof escrowTransactions.$inferSelect;
export type InsertEscrowTransaction = z.infer<typeof insertEscrowTransactionSchema>;

export type EscrowProof = typeof escrowProofs.$inferSelect;
export type InsertEscrowProof = z.infer<typeof insertEscrowProofSchema>;

export type MatrixRoom = typeof matrixRooms.$inferSelect;
export type InsertMatrixRoom = z.infer<typeof insertMatrixRoomSchema>;

export type MatrixMessage = typeof matrixMessages.$inferSelect;
export type InsertMatrixMessage = z.infer<typeof insertMatrixMessageSchema>;

export type EscrowDispute = typeof escrowDisputes.$inferSelect;
export type InsertEscrowDispute = z.infer<typeof insertEscrowDisputeSchema>;

export type MysterionAssessment = typeof mysterionAssessments.$inferSelect;
export type InsertMysterionAssessment = z.infer<typeof insertMysterionAssessmentSchema>;

export type UserReputation = typeof userReputation.$inferSelect;
export type InsertUserReputation = z.infer<typeof insertUserReputationSchema>;

export type TransactionRating = typeof transactionRatings.$inferSelect;
export type InsertTransactionRating = z.infer<typeof insertTransactionRatingSchema>;

export type RecursionLog = typeof recursionLogs.$inferSelect;
export type InsertRecursionLog = z.infer<typeof insertRecursionLogSchema>;

export type AiCoinCompensation = typeof aiCoinCompensation.$inferSelect;
export type InsertAiCoinCompensation = z.infer<typeof insertAiCoinCompensationSchema>;

// Extended user relations to include the new tables
export const usersExtendedRelations = relations(users, ({ many, one }) => ({
  sellerEscrows: many(escrowTransactions, { relationName: "seller_escrows" }),
  buyerEscrows: many(escrowTransactions, { relationName: "buyer_escrows" }),
  escrowProofs: many(escrowProofs),
  matrixMessages: many(matrixMessages),
  initiatedDisputes: many(escrowDisputes),
  reputation: one(userReputation),
  givenRatings: many(transactionRatings, { relationName: "given_ratings" }),
  receivedRatings: many(transactionRatings, { relationName: "received_ratings" }),
  recursionRequests: many(recursionLogs),
  aiCoinCompensations: many(aiCoinCompensation),
  
  // DApp Builder and Marketplace relations
  userDapps: many(userDapps),
  dappListings: many(marketplaceListings),
  dappPurchases: many(dappPurchases),
  dappReviews: many(dappReviews),
  dappCreationChats: many(dappCreationChats),
  browserSettings: one(browserUsers),
  sandboxEnvironments: many(sandboxEnvironments),
}));

// User API Keys for Mysterion distributed LLM training
export const userApiKeys = pgTable("user_api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  service: text("service").notNull(), // 'openai', 'anthropic', etc.
  keyName: text("key_name").notNull(), // User-defined name for the key
  keyIdentifier: text("key_identifier"), // First few chars of the key for identification
  encryptedKey: text("encrypted_key").notNull(), // Encrypted API key
  isActive: boolean("is_active").notNull().default(true),
  isTrainingEnabled: boolean("is_training_enabled").notNull().default(true), // Whether to use for training
  usageCount: integer("usage_count").notNull().default(0),
  lastUsed: timestamp("last_used"),
  lastContribution: timestamp("last_contribution"), // Last time contributed to training
  contributionPoints: integer("contribution_points").notNull().default(0), // Points earned by contributing
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userApiKeysRelations = relations(userApiKeys, ({ one }) => ({
  user: one(users, {
    fields: [userApiKeys.userId],
    references: [users.id],
  }),
}));

export const insertUserApiKeySchema = createInsertSchema(userApiKeys).omit({
  id: true,
  usageCount: true,
  lastUsed: true,
  lastContribution: true,
  contributionPoints: true,
  createdAt: true,
  updatedAt: true,
});

export type UserApiKey = typeof userApiKeys.$inferSelect;
export type InsertUserApiKey = z.infer<typeof insertUserApiKeySchema>;

// Mysterion LLM Training Contributions
export const mysterionTrainingData = pgTable("mysterion_training_data", {
  id: serial("id").primaryKey(),
  userApiKeyId: integer("user_api_key_id").notNull().references(() => userApiKeys.id),
  dataSizeBytes: integer("data_size_bytes").notNull(),
  dataHash: text("data_hash").notNull(), // Hash of the training data for deduplication
  dataType: text("data_type").notNull(), // 'conversation', 'transaction', 'code', etc.
  contributionDate: timestamp("contribution_date").defaultNow(),
  processingStatus: text("processing_status").notNull().default("queued"), // 'queued', 'processing', 'completed', 'failed'
  processingNotes: text("processing_notes"),
  pointsAwarded: integer("points_awarded").notNull().default(0),
});

export const mysterionTrainingDataRelations = relations(mysterionTrainingData, ({ one }) => ({
  userApiKey: one(userApiKeys, {
    fields: [mysterionTrainingData.userApiKeyId],
    references: [userApiKeys.id],
  }),
}));

export const insertMysterionTrainingDataSchema = createInsertSchema(mysterionTrainingData).omit({
  id: true,
  contributionDate: true,
  processingStatus: true,
  pointsAwarded: true,
});

export type MysterionTrainingData = typeof mysterionTrainingData.$inferSelect;
export type InsertMysterionTrainingData = z.infer<typeof insertMysterionTrainingDataSchema>;

// Types are now imported at the top of the file

// FractalCoin Domain Hosting Schemas
export const domainConfigurations = pgTable("domain_configurations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  domainName: text("domain_name").notNull().unique(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  nameservers: text("nameservers").array(),
  contentCid: text("content_cid"), // IPFS CID for website content
  ensRegistered: boolean("ens_registered").default(false),
  domainType: text("domain_type").default("standard").notNull(), // standard, premium, enterprise
  paymentStatus: text("payment_status").default("pending").notNull(), // pending, paid, failed, refunded
  autoRenew: boolean("auto_renew").default(true),
  domainRegistrationType: text("domain_registration_type").default("fractalcoin").notNull(), // fractalcoin, trust, traditional
  registrarInfo: jsonb("registrar_info"), // Information about the registrar service
  dnsConfiguration: jsonb("dns_configuration"), // DNS record configurations
  trustCredentials: jsonb("trust_credentials"), // For .trust domain integration
  sslCertificate: jsonb("ssl_certificate"), // SSL certificate information
  customDomainSettings: jsonb("custom_domain_settings"), // Settings for traditional domains
});

export const domainConfigurationsRelations = relations(domainConfigurations, ({ one, many }) => ({
  user: one(users, {
    fields: [domainConfigurations.userId],
    references: [users.id],
  }),
  filecoinStorageAllocations: many(filecoinStorageAllocations),
  domainDeployments: many(domainDeployments),
}));

export const insertDomainConfigurationSchema = createInsertSchema(domainConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DomainConfiguration = typeof domainConfigurations.$inferSelect;
export type InsertDomainConfiguration = z.infer<typeof insertDomainConfigurationSchema>;

export const filecoinStorageAllocations = pgTable("filecoin_storage_allocations", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull().references(() => domainConfigurations.id),
  storageBytes: integer("storage_bytes").notNull(),
  allocationDate: timestamp("allocation_date").defaultNow().notNull(),
  expirationDate: timestamp("expiration_date"),
  bridgeCid: text("bridge_cid").notNull(), // Reference to the Filecoin-FractalCoin bridge
  nodeCount: integer("node_count").default(3).notNull(), // Number of storage nodes
  status: text("status").default("active").notNull(), // active, expired, pending, failed
  bridgeConfig: jsonb("bridge_config").notNull(), // Configuration settings for the bridge
  cost: decimal("cost", { precision: 18, scale: 6 }).notNull(), // Cost in FractalCoin
});

export const filecoinStorageAllocationsRelations = relations(filecoinStorageAllocations, ({ one }) => ({
  domain: one(domainConfigurations, {
    fields: [filecoinStorageAllocations.domainId],
    references: [domainConfigurations.id],
  }),
}));

export const insertFilecoinStorageAllocationSchema = createInsertSchema(filecoinStorageAllocations).omit({
  id: true,
  allocationDate: true,
});

export type FilecoinStorageAllocation = typeof filecoinStorageAllocations.$inferSelect;
export type InsertFilecoinStorageAllocation = z.infer<typeof insertFilecoinStorageAllocationSchema>;

export const domainDeployments = pgTable("domain_deployments", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull().references(() => domainConfigurations.id),
  deploymentCid: text("deployment_cid").notNull(), // IPFS CID of the deployed website
  deploymentDate: timestamp("deployment_date").defaultNow().notNull(),
  status: text("status").default("processing").notNull(), // processing, success, failed
  ipfsGatewayUrl: text("ipfs_gateway_url"), // Gateway URL for accessing the content
  fileCounts: jsonb("file_counts"), // JSON object with file type counts
  totalSizeBytes: integer("total_size_bytes"),
  deploymentConfig: jsonb("deployment_config"), // Custom configuration for this deployment
});

export const domainDeploymentsRelations = relations(domainDeployments, ({ one }) => ({
  domain: one(domainConfigurations, {
    fields: [domainDeployments.domainId],
    references: [domainConfigurations.id],
  }),
}));

export const insertDomainDeploymentSchema = createInsertSchema(domainDeployments).omit({
  id: true,
  deploymentDate: true,
});

export type DomainDeployment = typeof domainDeployments.$inferSelect;
export type InsertDomainDeployment = z.infer<typeof insertDomainDeploymentSchema>;

export const dnsRecords = pgTable("dns_records", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull().references(() => domainConfigurations.id),
  recordType: text("record_type").notNull(), // A, AAAA, CNAME, MX, TXT, etc.
  name: text("name").notNull(), // subdomain or @ for root
  value: text("value").notNull(), // IP, hostname, text value, etc.
  ttl: integer("ttl").default(3600), // Time to live in seconds
  priority: integer("priority"), // For MX and SRV records
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const dnsRecordsRelations = relations(dnsRecords, ({ one }) => ({
  domain: one(domainConfigurations, {
    fields: [dnsRecords.domainId],
    references: [domainConfigurations.id],
  }),
}));

export const insertDnsRecordSchema = createInsertSchema(dnsRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type DnsRecord = typeof dnsRecords.$inferSelect;
export type InsertDnsRecord = z.infer<typeof insertDnsRecordSchema>;

export const domainTrustWalletConnections = pgTable("domain_trust_wallet_connections", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull().references(() => domainConfigurations.id),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  walletAddress: text("wallet_address").notNull(),
  connectionType: text("connection_type").notNull(), // owner, manager, delegate
  isActive: boolean("is_active").default(true).notNull(),
  verificationProof: text("verification_proof"), // Proof of ownership
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const domainTrustWalletConnectionsRelations = relations(domainTrustWalletConnections, ({ one }) => ({
  domain: one(domainConfigurations, {
    fields: [domainTrustWalletConnections.domainId],
    references: [domainConfigurations.id],
  }),
  wallet: one(wallets, {
    fields: [domainTrustWalletConnections.walletId],
    references: [wallets.id],
  }),
}));

export const insertDomainTrustWalletConnectionSchema = createInsertSchema(domainTrustWalletConnections).omit({
  id: true,
  createdAt: true,
});

export type DomainTrustWalletConnection = typeof domainTrustWalletConnections.$inferSelect;
export type InsertDomainTrustWalletConnection = z.infer<typeof insertDomainTrustWalletConnectionSchema>;

export const domainActivityLogs = pgTable("domain_activity_logs", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull().references(() => domainConfigurations.id),
  action: text("action").notNull(), // deploy, renew, update, delete, etc.
  performedBy: integer("performed_by").notNull().references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  details: jsonb("details"), // Additional details about the action
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const domainActivityLogsRelations = relations(domainActivityLogs, ({ one }) => ({
  domain: one(domainConfigurations, {
    fields: [domainActivityLogs.domainId],
    references: [domainConfigurations.id],
  }),
  user: one(users, {
    fields: [domainActivityLogs.performedBy],
    references: [users.id],
  }),
}));

export const insertDomainActivityLogSchema = createInsertSchema(domainActivityLogs).omit({
  id: true,
  timestamp: true,
});

export type DomainActivityLog = typeof domainActivityLogs.$inferSelect;
export type InsertDomainActivityLog = z.infer<typeof insertDomainActivityLogSchema>;

export const storageProviderNodes = pgTable("storage_provider_nodes", {
  id: serial("id").primaryKey(),
  providerId: text("provider_id").notNull().unique(), // Unique ID of the storage provider
  nodeType: text("node_type").notNull(), // fractalcoin, filecoin, hybrid
  availableBytes: integer("available_bytes").notNull(),
  totalBytes: integer("total_bytes").notNull(),
  location: text("location"), // Geographic location
  reliability: decimal("reliability", { precision: 5, scale: 2 }).default("99.9"),
  activeDate: timestamp("active_date").defaultNow().notNull(),
  lastHeartbeat: timestamp("last_heartbeat").defaultNow().notNull(),
  status: text("status").default("active").notNull(), // active, offline, maintenance
  endpoints: jsonb("endpoints").notNull(), // JSON array of endpoints
  ownerAddress: text("owner_address"), // Wallet address of the node owner
  rewards: decimal("rewards", { precision: 18, scale: 6 }).default("0"), // Earned rewards in FractalCoin
});

export const insertStorageProviderNodeSchema = createInsertSchema(storageProviderNodes).omit({
  id: true,
  activeDate: true,
  lastHeartbeat: true,
});

export type StorageProviderNode = typeof storageProviderNodes.$inferSelect;
export type InsertStorageProviderNode = z.infer<typeof insertStorageProviderNodeSchema>;

export const nodeAllocationMapping = pgTable("node_allocation_mapping", {
  id: serial("id").primaryKey(),
  nodeId: integer("node_id").notNull().references(() => storageProviderNodes.id),
  allocationId: integer("allocation_id").notNull().references(() => filecoinStorageAllocations.id),
  allocationDate: timestamp("allocation_date").defaultNow().notNull(),
  bytesAllocated: integer("bytes_allocated").notNull(),
  status: text("status").default("active").notNull(), // active, terminated, error
  shardInfo: jsonb("shard_info"), // Information about the data shards
});

export const nodeAllocationMappingRelations = relations(nodeAllocationMapping, ({ one }) => ({
  node: one(storageProviderNodes, {
    fields: [nodeAllocationMapping.nodeId],
    references: [storageProviderNodes.id],
  }),
  allocation: one(filecoinStorageAllocations, {
    fields: [nodeAllocationMapping.allocationId],
    references: [filecoinStorageAllocations.id],
  }),
}));

export const insertNodeAllocationMappingSchema = createInsertSchema(nodeAllocationMapping).omit({
  id: true,
  allocationDate: true,
});

export type NodeAllocationMapping = typeof nodeAllocationMapping.$inferSelect;
export type InsertNodeAllocationMapping = z.infer<typeof insertNodeAllocationMappingSchema>;

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
  // New schema tables
  escrowTransactions,
  escrowProofs,
  matrixRooms,
  matrixMessages,
  escrowDisputes,
  mysterionAssessments,
  userReputation,
  transactionRatings,
  recursionLogs,
  aiCoinCompensation,
  userApiKeys,
  mysterionTrainingData,
  
  // Bridge infrastructure schemas
  bridgeConfigurations,
  bridgeValidators,
  bridgeSupportedTokens,
  bridgeTransactions,
  
  // Domain hosting schemas
  domainConfigurations,
  filecoinStorageAllocations,
  domainDeployments,
  domainActivityLogs,
  storageProviderNodes,
  nodeAllocationMapping,
  dnsRecords,
  domainTrustWalletConnections,
  
  // DApp Builder and Marketplace schemas (imported from dapp-schema.ts)
  dappTemplates,
  userDapps,
  marketplaceListings,
  dappPurchases,
  dappReviews,
  dappCreationChats,
  contractSchemas,
  conversationMessages,
  dappVersions,
  dappFiles,
  securityAuditTemplates,
  browserUsers,
  sandboxEnvironments,
};
