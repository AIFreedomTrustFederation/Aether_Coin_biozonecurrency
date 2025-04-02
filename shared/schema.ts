import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
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

export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  smartContracts: many(smartContracts),
  aiMonitoringLogs: many(aiMonitoringLogs),
  cidEntries: many(cidEntries),
  paymentMethods: many(paymentMethods),
  payments: many(payments),
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
