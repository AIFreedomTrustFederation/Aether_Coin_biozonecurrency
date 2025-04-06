import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users, wallets } from "./schema";

// Bridge Networks Enum
export enum BridgeNetwork {
  ETHEREUM = 'ethereum',
  SOLANA = 'solana',
  POLYGON = 'polygon',
  BINANCE_SMART_CHAIN = 'binance_smart_chain',
  NEAR = 'near',
  FILECOIN = 'filecoin',
  ARBITRUM = 'arbitrum',
  OPTIMISM = 'optimism',
  AVALANCHE = 'avalanche',
  POLKADOT = 'polkadot',
  COSMOS = 'cosmos',
  AETHERION = 'aetherion'
}

// Bridge Status Enum
export enum BridgeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PAUSED = 'paused',
  UPGRADING = 'upgrading',
  DEPRECATED = 'deprecated'
}

// Transaction Status Enum
export enum BridgeTransactionStatus {
  INITIATED = 'initiated',
  PENDING_SOURCE_CONFIRMATION = 'pending_source_confirmation',
  SOURCE_CONFIRMED = 'source_confirmed',
  PENDING_VALIDATION = 'pending_validation',
  VALIDATED = 'validated',
  PENDING_TARGET_EXECUTION = 'pending_target_execution',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERTED = 'reverted'
}

// Bridge Configuration Table
export const bridgeConfigurations = pgTable("bridge_configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sourceNetwork: text("source_network").notNull(),
  targetNetwork: text("target_network").notNull(),
  contractAddressSource: text("contract_address_source"),
  contractAddressTarget: text("contract_address_target"),
  status: text("status").notNull().default(BridgeStatus.ACTIVE),
  feePercentage: text("fee_percentage").notNull().default("0.1"),
  minTransferAmount: text("min_transfer_amount"),
  maxTransferAmount: text("max_transfer_amount"),
  requiredConfirmations: integer("required_confirmations").notNull().default(5),
  validatorThreshold: integer("validator_threshold").notNull().default(3),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  config: jsonb("config").notNull().default({}), // Specific configuration for this bridge
  securityLevel: text("security_level").notNull().default("standard"), // low, standard, high
});

export const bridgeConfigurationsRelations = relations(bridgeConfigurations, ({ many }) => ({
  validators: many(bridgeValidators),
  transactions: many(bridgeTransactions),
  supportedTokens: many(bridgeSupportedTokens),
}));

export const insertBridgeConfigurationSchema = createInsertSchema(bridgeConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Bridge Validators Table
export const bridgeValidators = pgTable("bridge_validators", {
  id: serial("id").primaryKey(),
  bridgeId: integer("bridge_id").notNull().references(() => bridgeConfigurations.id),
  name: text("name").notNull(),
  address: text("address").notNull(),
  publicKey: text("public_key").notNull(),
  status: text("status").notNull().default("active"), // active, inactive, suspended
  lastHeartbeat: timestamp("last_heartbeat"),
  isActive: boolean("is_active").default(true),
  reputation: integer("reputation").default(100),
  network: text("network").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: jsonb("metadata").default({}),
});

export const bridgeValidatorsRelations = relations(bridgeValidators, ({ one }) => ({
  bridge: one(bridgeConfigurations, {
    fields: [bridgeValidators.bridgeId],
    references: [bridgeConfigurations.id],
  }),
}));

export const insertBridgeValidatorSchema = createInsertSchema(bridgeValidators).omit({
  id: true,
  createdAt: true,
  lastHeartbeat: true,
  reputation: true,
});

// Bridge Supported Tokens Table
export const bridgeSupportedTokens = pgTable("bridge_supported_tokens", {
  id: serial("id").primaryKey(),
  bridgeId: integer("bridge_id").notNull().references(() => bridgeConfigurations.id),
  tokenSymbol: text("token_symbol").notNull(),
  tokenName: text("token_name").notNull(),
  sourceTokenAddress: text("source_token_address"),
  targetTokenAddress: text("target_token_address"),
  decimals: integer("decimals").notNull().default(18),
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata").default({}),
});

export const bridgeSupportedTokensRelations = relations(bridgeSupportedTokens, ({ one }) => ({
  bridge: one(bridgeConfigurations, {
    fields: [bridgeSupportedTokens.bridgeId],
    references: [bridgeConfigurations.id],
  }),
}));

export const insertBridgeSupportedTokenSchema = createInsertSchema(bridgeSupportedTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Bridge Transactions Table
export const bridgeTransactions = pgTable("bridge_transactions", {
  id: serial("id").primaryKey(),
  bridgeId: integer("bridge_id").notNull().references(() => bridgeConfigurations.id),
  userId: integer("user_id").references(() => users.id),
  walletId: integer("wallet_id").references(() => wallets.id),
  sourceTransactionHash: text("source_transaction_hash"),
  targetTransactionHash: text("target_transaction_hash"),
  sourceNetwork: text("source_network").notNull(),
  targetNetwork: text("target_network").notNull(),
  sourceAddress: text("source_address").notNull(),
  targetAddress: text("target_address").notNull(),
  amount: text("amount").notNull(),
  fee: text("fee"),
  tokenSymbol: text("token_symbol").notNull(),
  status: text("status").notNull().default(BridgeTransactionStatus.INITIATED),
  initiatedAt: timestamp("initiated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  validations: jsonb("validations").default([]), // Array of validator signatures
  metadata: jsonb("metadata").default({}),
  errorMessage: text("error_message"),
});

export const bridgeTransactionsRelations = relations(bridgeTransactions, ({ one }) => ({
  bridge: one(bridgeConfigurations, {
    fields: [bridgeTransactions.bridgeId],
    references: [bridgeConfigurations.id],
  }),
  user: one(users, {
    fields: [bridgeTransactions.userId],
    references: [users.id],
  }),
  wallet: one(wallets, {
    fields: [bridgeTransactions.walletId],
    references: [wallets.id],
  }),
}));

export const insertBridgeTransactionSchema = createInsertSchema(bridgeTransactions).omit({
  id: true,
  initiatedAt: true,
  completedAt: true,
});

// Type exports
export type BridgeConfiguration = typeof bridgeConfigurations.$inferSelect;
export type InsertBridgeConfiguration = z.infer<typeof insertBridgeConfigurationSchema>;

export type BridgeValidator = typeof bridgeValidators.$inferSelect;
export type InsertBridgeValidator = z.infer<typeof insertBridgeValidatorSchema>;

export type BridgeSupportedToken = typeof bridgeSupportedTokens.$inferSelect;
export type InsertBridgeSupportedToken = z.infer<typeof insertBridgeSupportedTokenSchema>;

export type BridgeTransaction = typeof bridgeTransactions.$inferSelect;
export type InsertBridgeTransaction = z.infer<typeof insertBridgeTransactionSchema>;