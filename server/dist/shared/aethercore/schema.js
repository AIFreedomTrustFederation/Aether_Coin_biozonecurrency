"use strict";
/**
 * AetherCore Schema
 * Database schema definitions for AetherCore components
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertFractalGovernanceVoteSchema = exports.insertQuantumIdentitySchema = exports.insertBrainNetworkShardSchema = exports.insertLlmBrainRecordSchema = exports.insertAetherBridgeTransactionSchema = exports.brainShardsRelations = exports.brainRecordsRelations = exports.fractalGovernanceVotes = exports.quantumIdentities = exports.brainNetworkShards = exports.llmBrainRecords = exports.aetherBridgeTransactions = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
/**
 * Token Bridge Transactions Table
 * Stores cross-chain token bridge transactions
 */
exports.aetherBridgeTransactions = (0, pg_core_1.pgTable)('aethercore_bridge_transactions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    sourceNetwork: (0, pg_core_1.text)('source_network').notNull(),
    destinationNetwork: (0, pg_core_1.text)('destination_network').notNull(),
    tokenSymbol: (0, pg_core_1.text)('token_symbol').notNull(),
    amount: (0, pg_core_1.text)('amount').notNull(),
    fee: (0, pg_core_1.text)('fee').notNull(),
    direction: (0, pg_core_1.text)('direction').notNull(), // 'inbound' or 'outbound'
    status: (0, pg_core_1.text)('status').notNull().default('pending'),
    sourceTxHash: (0, pg_core_1.text)('source_tx_hash'),
    destinationTxHash: (0, pg_core_1.text)('destination_tx_hash'),
    sourceAddress: (0, pg_core_1.text)('source_address').notNull(),
    destinationAddress: (0, pg_core_1.text)('destination_address').notNull(),
    validations: (0, pg_core_1.jsonb)('validations').default({}),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow()
});
/**
 * LLM Brain Records Table
 * Stores metadata for neural network models
 */
exports.llmBrainRecords = (0, pg_core_1.pgTable)('aethercore_llm_brain_records', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    brainId: (0, pg_core_1.uuid)('brain_id').notNull().unique(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    modelType: (0, pg_core_1.text)('model_type').notNull(),
    parameterCount: (0, pg_core_1.integer)('parameter_count').notNull(),
    layerCount: (0, pg_core_1.integer)('layer_count').notNull(),
    modelSize: (0, pg_core_1.text)('model_size').notNull(),
    attentionHeads: (0, pg_core_1.integer)('attention_heads').notNull(),
    contextLength: (0, pg_core_1.integer)('context_length').notNull(),
    embeddingDimensions: (0, pg_core_1.integer)('embedding_dimensions').notNull(),
    totalShards: (0, pg_core_1.integer)('total_shards').notNull(),
    shardingStrategy: (0, pg_core_1.jsonb)('sharding_strategy').notNull(),
    distributionPlan: (0, pg_core_1.jsonb)('distribution_plan').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true)
});
/**
 * Brain Network Shards Table
 * Stores individual shards of neural networks
 */
exports.brainNetworkShards = (0, pg_core_1.pgTable)('aethercore_brain_network_shards', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    brainId: (0, pg_core_1.uuid)('brain_id').notNull(),
    shardIndex: (0, pg_core_1.integer)('shard_index').notNull(),
    layerRange: (0, pg_core_1.jsonb)('layer_range').notNull(),
    dimension: (0, pg_core_1.text)('dimension').notNull(),
    size: (0, pg_core_1.integer)('size').notNull(),
    storageLocation: (0, pg_core_1.text)('storage_location').notNull(),
    storageType: (0, pg_core_1.text)('storage_type').notNull(),
    cid: (0, pg_core_1.text)('cid'),
    encryptionKey: (0, pg_core_1.text)('encryption_key'),
    healthStatus: (0, pg_core_1.jsonb)('health_status').default({}),
    replicas: (0, pg_core_1.jsonb)('replicas').default([]),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow()
});
/**
 * Quantum-Resistant Identity Table
 * Stores cross-chain quantum-resistant identities
 */
exports.quantumIdentities = (0, pg_core_1.pgTable)('aethercore_quantum_identities', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').notNull(),
    publicKey: (0, pg_core_1.text)('public_key').notNull(),
    atcAddress: (0, pg_core_1.text)('atc_address').notNull(),
    fractalAddress: (0, pg_core_1.text)('fractal_address').notNull(),
    filecoinAddress: (0, pg_core_1.text)('filecoin_address'),
    ethereumAddress: (0, pg_core_1.text)('ethereum_address'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    metadata: (0, pg_core_1.jsonb)('metadata')
});
/**
 * Fractal Governance Votes Table
 * Stores governance votes with fractal weight
 */
exports.fractalGovernanceVotes = (0, pg_core_1.pgTable)('aethercore_fractal_governance_votes', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    proposalId: (0, pg_core_1.uuid)('proposal_id').notNull(),
    title: (0, pg_core_1.text)('title').notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    createdBy: (0, pg_core_1.integer)('created_by').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    closesAt: (0, pg_core_1.timestamp)('closes_at').notNull(),
    votingStrategy: (0, pg_core_1.jsonb)('voting_strategy').notNull(),
    threshold: (0, pg_core_1.integer)('threshold').notNull(),
    status: (0, pg_core_1.text)('status').notNull().default('active'),
    result: (0, pg_core_1.text)('result'),
    votesFor: (0, pg_core_1.integer)('votes_for').notNull().default(0),
    votesAgainst: (0, pg_core_1.integer)('votes_against').notNull().default(0),
    metadata: (0, pg_core_1.jsonb)('metadata')
});
// Define relationships
exports.brainRecordsRelations = (0, drizzle_orm_1.relations)(exports.llmBrainRecords, ({ many }) => ({
    shards: many(exports.brainNetworkShards)
}));
exports.brainShardsRelations = (0, drizzle_orm_1.relations)(exports.brainNetworkShards, ({ one }) => ({
    brain: one(exports.llmBrainRecords, {
        fields: [exports.brainNetworkShards.brainId],
        references: [exports.llmBrainRecords.brainId],
    }),
}));
// Create Zod schemas for validation & type generation
exports.insertAetherBridgeTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.aetherBridgeTransactions, {
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    validations: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.insertLlmBrainRecordSchema = (0, drizzle_zod_1.createInsertSchema)(exports.llmBrainRecords, {
    brainId: zod_1.z.string().uuid(),
    shardingStrategy: zod_1.z.record(zod_1.z.any()),
    distributionPlan: zod_1.z.record(zod_1.z.any()),
});
exports.insertBrainNetworkShardSchema = (0, drizzle_zod_1.createInsertSchema)(exports.brainNetworkShards, {
    brainId: zod_1.z.string().uuid(),
    layerRange: zod_1.z.object({
        start: zod_1.z.number(),
        end: zod_1.z.number(),
    }),
    healthStatus: zod_1.z.record(zod_1.z.any()).optional(),
    replicas: zod_1.z.array(zod_1.z.any()).optional(),
});
exports.insertQuantumIdentitySchema = (0, drizzle_zod_1.createInsertSchema)(exports.quantumIdentities, {
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.insertFractalGovernanceVoteSchema = (0, drizzle_zod_1.createInsertSchema)(exports.fractalGovernanceVotes, {
    proposalId: zod_1.z.string().uuid(),
    votingStrategy: zod_1.z.record(zod_1.z.any()),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
