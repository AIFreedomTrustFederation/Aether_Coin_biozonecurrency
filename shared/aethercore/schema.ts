/**
 * AetherCore Schema
 * Database schema definitions for AetherCore components
 */

import { relations } from 'drizzle-orm';
import { pgTable, serial, uuid, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Token Bridge Transactions Table
 * Stores cross-chain token bridge transactions
 */
export const aetherBridgeTransactions = pgTable('aethercore_bridge_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  sourceNetwork: text('source_network').notNull(),
  destinationNetwork: text('destination_network').notNull(),
  tokenSymbol: text('token_symbol').notNull(),
  amount: text('amount').notNull(),
  fee: text('fee').notNull(),
  direction: text('direction').notNull(), // 'inbound' or 'outbound'
  status: text('status').notNull().default('pending'),
  sourceTxHash: text('source_tx_hash'),
  destinationTxHash: text('destination_tx_hash'),
  sourceAddress: text('source_address').notNull(),
  destinationAddress: text('destination_address').notNull(),
  validations: jsonb('validations').default({}),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * LLM Brain Records Table
 * Stores metadata for neural network models
 */
export const llmBrainRecords = pgTable('aethercore_llm_brain_records', {
  id: serial('id').primaryKey(),
  brainId: uuid('brain_id').notNull().unique(),
  userId: integer('user_id').notNull(),
  modelType: text('model_type').notNull(),
  parameterCount: integer('parameter_count').notNull(),
  layerCount: integer('layer_count').notNull(),
  modelSize: text('model_size').notNull(),
  attentionHeads: integer('attention_heads').notNull(),
  contextLength: integer('context_length').notNull(),
  embeddingDimensions: integer('embedding_dimensions').notNull(),
  totalShards: integer('total_shards').notNull(),
  shardingStrategy: jsonb('sharding_strategy').notNull(),
  distributionPlan: jsonb('distribution_plan').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true)
});

/**
 * Brain Network Shards Table
 * Stores individual shards of neural networks
 */
export const brainNetworkShards = pgTable('aethercore_brain_network_shards', {
  id: serial('id').primaryKey(),
  brainId: uuid('brain_id').notNull(),
  shardIndex: integer('shard_index').notNull(),
  layerRange: jsonb('layer_range').notNull(),
  dimension: text('dimension').notNull(),
  size: integer('size').notNull(),
  storageLocation: text('storage_location').notNull(),
  storageType: text('storage_type').notNull(),
  cid: text('cid'),
  encryptionKey: text('encryption_key'),
  healthStatus: jsonb('health_status').default({}),
  replicas: jsonb('replicas').default([]),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

/**
 * Quantum-Resistant Identity Table
 * Stores cross-chain quantum-resistant identities
 */
export const quantumIdentities = pgTable('aethercore_quantum_identities', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  publicKey: text('public_key').notNull(),
  atcAddress: text('atc_address').notNull(),
  fractalAddress: text('fractal_address').notNull(),
  filecoinAddress: text('filecoin_address'),
  ethereumAddress: text('ethereum_address'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  metadata: jsonb('metadata')
});

/**
 * Fractal Governance Votes Table
 * Stores governance votes with fractal weight
 */
export const fractalGovernanceVotes = pgTable('aethercore_fractal_governance_votes', {
  id: serial('id').primaryKey(),
  proposalId: uuid('proposal_id').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  closesAt: timestamp('closes_at').notNull(),
  votingStrategy: jsonb('voting_strategy').notNull(),
  threshold: integer('threshold').notNull(),
  status: text('status').notNull().default('active'),
  result: text('result'),
  votesFor: integer('votes_for').notNull().default(0),
  votesAgainst: integer('votes_against').notNull().default(0),
  metadata: jsonb('metadata')
});

// Define relationships
export const brainRecordsRelations = relations(llmBrainRecords, ({ many }) => ({
  shards: many(brainNetworkShards)
}));

export const brainShardsRelations = relations(brainNetworkShards, ({ one }) => ({
  brain: one(llmBrainRecords, {
    fields: [brainNetworkShards.brainId],
    references: [llmBrainRecords.brainId],
  }),
}));

// Create Zod schemas for validation & type generation
export const insertAetherBridgeTransactionSchema = createInsertSchema(aetherBridgeTransactions, {
  metadata: z.record(z.any()).optional(),
  validations: z.record(z.any()).optional(),
});

export const insertLlmBrainRecordSchema = createInsertSchema(llmBrainRecords, {
  brainId: z.string().uuid(),
  shardingStrategy: z.record(z.any()),
  distributionPlan: z.record(z.any()),
});

export const insertBrainNetworkShardSchema = createInsertSchema(brainNetworkShards, {
  brainId: z.string().uuid(),
  layerRange: z.object({
    start: z.number(),
    end: z.number(),
  }),
  healthStatus: z.record(z.any()).optional(),
  replicas: z.array(z.any()).optional(),
});

export const insertQuantumIdentitySchema = createInsertSchema(quantumIdentities, {
  metadata: z.record(z.any()).optional(),
});

export const insertFractalGovernanceVoteSchema = createInsertSchema(fractalGovernanceVotes, {
  proposalId: z.string().uuid(),
  votingStrategy: z.record(z.any()),
  metadata: z.record(z.any()).optional(),
});

// Export types
export type AetherBridgeTransaction = typeof aetherBridgeTransactions.$inferSelect;
export type LlmBrainRecord = typeof llmBrainRecords.$inferSelect;
export type BrainNetworkShard = typeof brainNetworkShards.$inferSelect;
export type QuantumIdentity = typeof quantumIdentities.$inferSelect;
export type FractalGovernanceVote = typeof fractalGovernanceVotes.$inferSelect;

export type InsertAetherBridgeTransaction = z.infer<typeof insertAetherBridgeTransactionSchema>;
export type InsertLlmBrainRecord = z.infer<typeof insertLlmBrainRecordSchema>;
export type InsertBrainNetworkShard = z.infer<typeof insertBrainNetworkShardSchema>;
export type InsertQuantumIdentity = z.infer<typeof insertQuantumIdentitySchema>;
export type InsertFractalGovernanceVote = z.infer<typeof insertFractalGovernanceVoteSchema>;

// Additional type definitions for use in the services
export type LlmModelType = 'transformer' | 'moe' | 'fractal-recursive' | 'hybrid';

export interface ModelParameters {
  weights: Buffer | string;
  architecture: Record<string, any>;
}

export interface BrainStorageRecord {
  id: string;
  userId: number;
  modelType: LlmModelType;
  parameterCount: number;
  totalShards: number;
  distributionPlan: ShardDistributionPlan;
}

export interface ShardDistributionPlan {
  shards: Array<{
    shardIndex: number;
    dimension: string;
    size: number;
    nodeAssignments: string[];
  }>;
  networkTopology: {
    regions: string[];
    nodes: Array<{
      id: string;
      region: string;
      capacity: number;
      latency: number;
    }>;
  };
  inferenceLatency: number;
  retrievalStrategy: 'sequential_retrieval' | 'parallel_retrieval';
}