"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeeEstimateType = exports.BridgeHealthType = exports.BridgeTransactionType = exports.insertBridgeTransactionSchema = exports.bridgeTransactions = exports.BridgeSupportedTokenType = exports.insertBridgeSupportedTokenSchema = exports.bridgeSupportedTokens = exports.BridgeValidatorType = exports.insertBridgeValidatorSchema = exports.bridgeValidators = exports.BridgeConfigurationType = exports.insertBridgeConfigurationSchema = exports.bridgeConfigurations = exports.BridgeNetworkEnum = exports.BridgeNetwork = exports.BridgeTransactionStatusEnum = exports.BridgeTransactionStatus = exports.BridgeStatusEnum = exports.BridgeStatus = void 0;
const zod_1 = require("zod");
const drizzle_zod_1 = require("drizzle-zod");
const pg_core_1 = require("drizzle-orm/pg-core");
// Enums
var BridgeStatus;
(function (BridgeStatus) {
    BridgeStatus["ACTIVE"] = "ACTIVE";
    BridgeStatus["INACTIVE"] = "INACTIVE";
    BridgeStatus["MAINTENANCE"] = "MAINTENANCE";
    BridgeStatus["DEPRECATED"] = "DEPRECATED";
})(BridgeStatus || (exports.BridgeStatus = BridgeStatus = {}));
// Export for ESM compatibility
exports.BridgeStatusEnum = BridgeStatus;
var BridgeTransactionStatus;
(function (BridgeTransactionStatus) {
    BridgeTransactionStatus["INITIATED"] = "INITIATED";
    BridgeTransactionStatus["PENDING_SOURCE_CONFIRMATION"] = "PENDING_SOURCE_CONFIRMATION";
    BridgeTransactionStatus["SOURCE_CONFIRMED"] = "SOURCE_CONFIRMED";
    BridgeTransactionStatus["PENDING_VALIDATION"] = "PENDING_VALIDATION";
    BridgeTransactionStatus["VALIDATED"] = "VALIDATED";
    BridgeTransactionStatus["PENDING_TARGET_EXECUTION"] = "PENDING_TARGET_EXECUTION";
    BridgeTransactionStatus["COMPLETED"] = "COMPLETED";
    BridgeTransactionStatus["FAILED"] = "FAILED";
    BridgeTransactionStatus["REVERTED"] = "REVERTED";
})(BridgeTransactionStatus || (exports.BridgeTransactionStatus = BridgeTransactionStatus = {}));
// Export for ESM compatibility
exports.BridgeTransactionStatusEnum = BridgeTransactionStatus;
var BridgeNetwork;
(function (BridgeNetwork) {
    BridgeNetwork["AETHERION"] = "aetherion";
    BridgeNetwork["ETHEREUM"] = "ethereum";
    BridgeNetwork["SOLANA"] = "solana";
    BridgeNetwork["BINANCE"] = "binance";
    BridgeNetwork["POLYGON"] = "polygon";
    BridgeNetwork["FILECOIN"] = "filecoin";
    BridgeNetwork["AVALANCHE"] = "avalanche";
    BridgeNetwork["OPTIMISM"] = "optimism";
    BridgeNetwork["ARBITRUM"] = "arbitrum";
})(BridgeNetwork || (exports.BridgeNetwork = BridgeNetwork = {}));
// Export for ESM compatibility
exports.BridgeNetworkEnum = BridgeNetwork;
// Bridge Configuration
exports.bridgeConfigurations = (0, pg_core_1.pgTable)('bridge_configurations', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
    name: (0, pg_core_1.text)('name').notNull(),
    sourceNetwork: (0, pg_core_1.text)('source_network').notNull(),
    targetNetwork: (0, pg_core_1.text)('target_network').notNull(),
    contractAddress: (0, pg_core_1.text)('contract_address'),
    validatorThreshold: (0, pg_core_1.integer)('validator_threshold').default(3),
    status: (0, pg_core_1.text)('status').default(BridgeStatus.ACTIVE),
    fee: (0, pg_core_1.text)('fee').default('0.001'),
    minAmount: (0, pg_core_1.text)('min_amount').default('0.01'),
    maxAmount: (0, pg_core_1.text)('max_amount').default('1000'),
    processingTime: (0, pg_core_1.integer)('processing_time').default(60), // in seconds
    description: (0, pg_core_1.text)('description'),
    logoUrl: (0, pg_core_1.text)('logo_url'),
    securityLevel: (0, pg_core_1.integer)('security_level').default(8) // 1-10 scale
});
exports.insertBridgeConfigurationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bridgeConfigurations, {
    sourceNetwork: zod_1.z.nativeEnum(BridgeNetwork),
    targetNetwork: zod_1.z.nativeEnum(BridgeNetwork),
    status: zod_1.z.nativeEnum(BridgeStatus)
}).omit({ id: true });
// Also export these as values to work with ESM imports
exports.BridgeConfigurationType = {};
// Bridge Validators
exports.bridgeValidators = (0, pg_core_1.pgTable)('bridge_validators', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
    bridgeId: (0, pg_core_1.integer)('bridge_id').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    address: (0, pg_core_1.text)('address').notNull(),
    publicKey: (0, pg_core_1.text)('public_key').notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    reputation: (0, pg_core_1.integer)('reputation').default(100), // 0-100 scale
    lastSeenAt: (0, pg_core_1.timestamp)('last_seen_at').defaultNow(),
    stake: (0, pg_core_1.text)('stake').default('0'),
    validatedTransactions: (0, pg_core_1.integer)('validated_transactions').default(0)
});
exports.insertBridgeValidatorSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bridgeValidators).omit({ id: true });
// Also export these as values to work with ESM imports
exports.BridgeValidatorType = {};
// Bridge Supported Tokens
exports.bridgeSupportedTokens = (0, pg_core_1.pgTable)('bridge_supported_tokens', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
    bridgeId: (0, pg_core_1.integer)('bridge_id').notNull(),
    symbol: (0, pg_core_1.text)('symbol').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    sourceTokenAddress: (0, pg_core_1.text)('source_token_address'),
    targetTokenAddress: (0, pg_core_1.text)('target_token_address'),
    decimals: (0, pg_core_1.integer)('decimals').default(18),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    minTransferAmount: (0, pg_core_1.text)('min_transfer_amount'),
    maxTransferAmount: (0, pg_core_1.text)('max_transfer_amount'),
    logoUrl: (0, pg_core_1.text)('logo_url')
});
exports.insertBridgeSupportedTokenSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bridgeSupportedTokens).omit({ id: true });
// Also export these as values to work with ESM imports 
exports.BridgeSupportedTokenType = {};
// Bridge Transactions
exports.bridgeTransactions = (0, pg_core_1.pgTable)('bridge_transactions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
    bridgeId: (0, pg_core_1.integer)('bridge_id').notNull(),
    userId: (0, pg_core_1.integer)('user_id'),
    walletId: (0, pg_core_1.integer)('wallet_id'),
    sourceNetwork: (0, pg_core_1.text)('source_network').notNull(),
    targetNetwork: (0, pg_core_1.text)('target_network').notNull(),
    sourceAddress: (0, pg_core_1.text)('source_address').notNull(),
    targetAddress: (0, pg_core_1.text)('target_address').notNull(),
    amount: (0, pg_core_1.text)('amount').notNull(),
    tokenSymbol: (0, pg_core_1.text)('token_symbol').notNull(),
    status: (0, pg_core_1.text)('status').default(BridgeTransactionStatus.INITIATED),
    sourceTransactionHash: (0, pg_core_1.text)('source_transaction_hash'),
    targetTransactionHash: (0, pg_core_1.text)('target_transaction_hash'),
    fee: (0, pg_core_1.text)('fee'),
    validations: (0, pg_core_1.json)('validations').default([]),
    initiatedAt: (0, pg_core_1.timestamp)('initiated_at').defaultNow(),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
    metadata: (0, pg_core_1.json)('metadata').default({}),
    errorMessage: (0, pg_core_1.text)('error_message')
});
exports.insertBridgeTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.bridgeTransactions, {
    sourceNetwork: zod_1.z.nativeEnum(BridgeNetwork),
    targetNetwork: zod_1.z.nativeEnum(BridgeNetwork),
    status: zod_1.z.nativeEnum(BridgeTransactionStatus)
}).omit({ id: true });
// Also export these as values to work with ESM imports
exports.BridgeTransactionType = {};
// Also export as const for ESM compatibility
exports.BridgeHealthType = {};
// Also export as const for ESM compatibility
exports.FeeEstimateType = {};
