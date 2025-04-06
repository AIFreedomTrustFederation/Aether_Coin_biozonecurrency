import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { pgTable, serial, text, timestamp, boolean, integer, varchar, json } from 'drizzle-orm/pg-core';

// Enums
export enum BridgeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  DEPRECATED = 'DEPRECATED'
}

export enum BridgeTransactionStatus {
  INITIATED = 'INITIATED',
  PENDING_SOURCE_CONFIRMATION = 'PENDING_SOURCE_CONFIRMATION',
  SOURCE_CONFIRMED = 'SOURCE_CONFIRMED',
  PENDING_VALIDATION = 'PENDING_VALIDATION',
  VALIDATED = 'VALIDATED',
  PENDING_TARGET_EXECUTION = 'PENDING_TARGET_EXECUTION',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERTED = 'REVERTED'
}

export enum BridgeNetwork {
  AETHERION = 'aetherion',
  ETHEREUM = 'ethereum',
  SOLANA = 'solana',
  BINANCE = 'binance',
  POLYGON = 'polygon',
  FILECOIN = 'filecoin',
  AVALANCHE = 'avalanche',
  OPTIMISM = 'optimism',
  ARBITRUM = 'arbitrum'
}

// Bridge Configuration
export const bridgeConfigurations = pgTable('bridge_configurations', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  name: text('name').notNull(),
  sourceNetwork: text('source_network').notNull(),
  targetNetwork: text('target_network').notNull(),
  contractAddress: text('contract_address'),
  validatorThreshold: integer('validator_threshold').default(3),
  status: text('status').default(BridgeStatus.ACTIVE),
  fee: text('fee').default('0.001'),
  minAmount: text('min_amount').default('0.01'),
  maxAmount: text('max_amount').default('1000'),
  processingTime: integer('processing_time').default(60), // in seconds
  description: text('description'),
  logoUrl: text('logo_url'),
  securityLevel: integer('security_level').default(8) // 1-10 scale
});

export const insertBridgeConfigurationSchema = createInsertSchema(bridgeConfigurations, {
  sourceNetwork: z.nativeEnum(BridgeNetwork),
  targetNetwork: z.nativeEnum(BridgeNetwork),
  status: z.nativeEnum(BridgeStatus)
}).omit({ id: true });

export type BridgeConfiguration = typeof bridgeConfigurations.$inferSelect;
export type InsertBridgeConfiguration = z.infer<typeof insertBridgeConfigurationSchema>;

// Bridge Validators
export const bridgeValidators = pgTable('bridge_validators', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  bridgeId: integer('bridge_id').notNull(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  publicKey: text('public_key').notNull(),
  isActive: boolean('is_active').default(true),
  reputation: integer('reputation').default(100), // 0-100 scale
  lastSeenAt: timestamp('last_seen_at').defaultNow(),
  stake: text('stake').default('0'),
  validatedTransactions: integer('validated_transactions').default(0)
});

export const insertBridgeValidatorSchema = createInsertSchema(bridgeValidators).omit({ id: true });
export type BridgeValidator = typeof bridgeValidators.$inferSelect;
export type InsertBridgeValidator = z.infer<typeof insertBridgeValidatorSchema>;

// Bridge Supported Tokens
export const bridgeSupportedTokens = pgTable('bridge_supported_tokens', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  bridgeId: integer('bridge_id').notNull(),
  symbol: text('symbol').notNull(),
  name: text('name').notNull(),
  sourceTokenAddress: text('source_token_address'),
  targetTokenAddress: text('target_token_address'),
  decimals: integer('decimals').default(18),
  isActive: boolean('is_active').default(true),
  minTransferAmount: text('min_transfer_amount'),
  maxTransferAmount: text('max_transfer_amount'),
  logoUrl: text('logo_url')
});

export const insertBridgeSupportedTokenSchema = createInsertSchema(bridgeSupportedTokens).omit({ id: true });
export type BridgeSupportedToken = typeof bridgeSupportedTokens.$inferSelect;
export type InsertBridgeSupportedToken = z.infer<typeof insertBridgeSupportedTokenSchema>;

// Bridge Transactions
export const bridgeTransactions = pgTable('bridge_transactions', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  bridgeId: integer('bridge_id').notNull(),
  userId: integer('user_id'),
  walletId: integer('wallet_id'),
  sourceNetwork: text('source_network').notNull(),
  targetNetwork: text('target_network').notNull(),
  sourceAddress: text('source_address').notNull(),
  targetAddress: text('target_address').notNull(),
  amount: text('amount').notNull(),
  tokenSymbol: text('token_symbol').notNull(),
  status: text('status').default(BridgeTransactionStatus.INITIATED),
  sourceTransactionHash: text('source_transaction_hash'),
  targetTransactionHash: text('target_transaction_hash'),
  fee: text('fee'),
  validations: json('validations').default([]),
  initiatedAt: timestamp('initiated_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  metadata: json('metadata').default({}),
  errorMessage: text('error_message')
});

export const insertBridgeTransactionSchema = createInsertSchema(bridgeTransactions, {
  sourceNetwork: z.nativeEnum(BridgeNetwork),
  targetNetwork: z.nativeEnum(BridgeNetwork),
  status: z.nativeEnum(BridgeTransactionStatus)
}).omit({ id: true });

export type BridgeTransaction = typeof bridgeTransactions.$inferSelect;
export type InsertBridgeTransaction = z.infer<typeof insertBridgeTransactionSchema>;