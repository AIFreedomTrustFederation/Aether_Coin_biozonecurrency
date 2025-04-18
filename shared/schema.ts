/**
 * AI Freedom Trust Framework - Shared Schema
 * Core types and schemas for the integrated ecosystem components
 */

import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { integer, pgTable, serial, text, timestamp, boolean, jsonb, real } from 'drizzle-orm/pg-core';

// ==================== MYSTERION INTELLIGENCE SYSTEM ====================

export const mysterionKnowledgeNode = pgTable('mysterion_knowledge_node', {
  id: serial('id').primaryKey(),
  nodeType: text('node_type').notNull(), // 'concept', 'code', 'protocol', 'agent', 'system'
  title: text('title').notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  version: integer('version').default(1).notNull(),
  confidence: real('confidence').default(0.8).notNull(),
  parentId: integer('parent_id').references(() => mysterionKnowledgeNode.id),
});

export const mysterionKnowledgeEdge = pgTable('mysterion_knowledge_edge', {
  id: serial('id').primaryKey(),
  sourceId: integer('source_id').references(() => mysterionKnowledgeNode.id).notNull(),
  targetId: integer('target_id').references(() => mysterionKnowledgeNode.id).notNull(),
  relationshipType: text('relationship_type').notNull(), // 'contains', 'implements', 'depends_on', 'extends'
  weight: real('weight').default(1.0).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const mysterionImprovement = pgTable('mysterion_improvement', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  codeChanges: jsonb('code_changes').notNull(),
  status: text('status').default('proposed').notNull(), // 'proposed', 'approved', 'implemented', 'rejected'
  confidence: real('confidence').default(0.7).notNull(),
  impact: text('impact').default('medium').notNull(), // 'low', 'medium', 'high', 'critical'
  targetRepository: text('target_repository').notNull(),
  targetFiles: jsonb('target_files').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  implementedAt: timestamp('implemented_at'),
});

// ==================== AUTONOMOUS AGENT SYSTEM ====================

export const agentType = pgTable('agent_type', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description').notNull(),
  capabilities: jsonb('capabilities').notNull(),
  baseRewardRate: real('base_reward_rate').default(1.0).notNull(),
  category: text('category').notNull(), // 'economic', 'security', 'development', 'governance'
  version: text('version').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const agentInstance = pgTable('agent_instance', {
  id: serial('id').primaryKey(),
  agentTypeId: integer('agent_type_id').references(() => agentType.id).notNull(),
  name: text('name').notNull(),
  status: text('status').default('active').notNull(), // 'initializing', 'active', 'paused', 'terminated'
  configuration: jsonb('configuration').notNull(),
  performanceMetrics: jsonb('performance_metrics'),
  owner: text('owner'), // Can be null for system-owned agents
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastActive: timestamp('last_active').defaultNow().notNull(),
  reputation: real('reputation').default(0.5).notNull(),
  fractalCoinBalance: real('fractal_coin_balance').default(0).notNull(),
  aiCoinBalance: real('ai_coin_balance').default(0).notNull(),
});

export const agentTask = pgTable('agent_task', {
  id: serial('id').primaryKey(),
  agentInstanceId: integer('agent_instance_id').references(() => agentInstance.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status').default('pending').notNull(), // 'pending', 'in_progress', 'completed', 'failed'
  priority: integer('priority').default(5).notNull(), // 1-10 scale
  result: jsonb('result'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  resourceUsage: jsonb('resource_usage'),
  rewardAmount: real('reward_amount'),
});

// ==================== COMPUTATIONAL REWARDS SYSTEM ====================

export const computationContribution = pgTable('computation_contribution', {
  id: serial('id').primaryKey(),
  userId: text('user_id'), // Can be null for anonymous contributions
  nodeId: text('node_id').notNull(), // Unique identifier for the contributing node
  contributionType: text('contribution_type').notNull(), // 'cpu', 'gpu', 'storage', 'bandwidth', 'data'
  startTime: timestamp('start_time').defaultNow().notNull(),
  endTime: timestamp('end_time'),
  resourceAmount: real('resource_amount').notNull(), // Standardized units based on type
  quality: real('quality').default(1.0).notNull(), // Quality multiplier
  verified: boolean('verified').default(false).notNull(),
  verificationMethod: text('verification_method'),
  metadata: jsonb('metadata'),
});

export const rewardDistribution = pgTable('reward_distribution', {
  id: serial('id').primaryKey(),
  contributionId: integer('contribution_id').references(() => computationContribution.id).notNull(),
  fractalCoinAmount: real('fractal_coin_amount').default(0).notNull(),
  aiCoinAmount: real('ai_coin_amount').default(0).notNull(),
  computeCredits: integer('compute_credits').default(0).notNull(),
  distributionTime: timestamp('distribution_time').defaultNow().notNull(),
  transactionHash: text('transaction_hash'),
  status: text('status').default('pending').notNull(), // 'pending', 'processed', 'failed'
});

// ==================== TRAINING DATA BRIDGE SYSTEM ====================

export const trainingDataset = pgTable('training_dataset', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  dataType: text('data_type').notNull(), // 'text', 'image', 'code', 'mixed'
  size: integer('size').notNull(), // Size in bytes
  recordCount: integer('record_count').notNull(),
  quality: real('quality').default(0.8).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  status: text('status').default('active').notNull(), // 'processing', 'active', 'archived', 'deprecated'
  contentHash: text('content_hash').notNull(),
  filecoinCid: text('filecoin_cid'),
  fractalShardConfig: jsonb('fractal_shard_config'),
});

export const trainingDataFragment = pgTable('training_data_fragment', {
  id: serial('id').primaryKey(),
  datasetId: integer('dataset_id').references(() => trainingDataset.id).notNull(),
  fragmentIndex: integer('fragment_index').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  contentHash: text('content_hash').notNull(),
  encryptionMethod: text('encryption_method'),
  filecoinCid: text('filecoin_cid'),
  fractalShardIds: jsonb('fractal_shard_ids'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Create Zod schemas for data validation

// Mysterion Intelligence
export const insertMysterionKnowledgeNodeSchema = createInsertSchema(mysterionKnowledgeNode).omit({ id: true });
export const insertMysterionKnowledgeEdgeSchema = createInsertSchema(mysterionKnowledgeEdge).omit({ id: true });
export const insertMysterionImprovementSchema = createInsertSchema(mysterionImprovement).omit({ id: true, implementedAt: true });

// Autonomous Agents
export const insertAgentTypeSchema = createInsertSchema(agentType).omit({ id: true });
export const insertAgentInstanceSchema = createInsertSchema(agentInstance).omit({ id: true });
export const insertAgentTaskSchema = createInsertSchema(agentTask).omit({ id: true, startedAt: true, completedAt: true, result: true, resourceUsage: true, rewardAmount: true });

// Computational Rewards
export const insertComputationContributionSchema = createInsertSchema(computationContribution).omit({ id: true, endTime: true, verified: true, verificationMethod: true });
export const insertRewardDistributionSchema = createInsertSchema(rewardDistribution).omit({ id: true, transactionHash: true });

// Training Data Bridge
export const insertTrainingDatasetSchema = createInsertSchema(trainingDataset).omit({ id: true, filecoinCid: true });
export const insertTrainingDataFragmentSchema = createInsertSchema(trainingDataFragment).omit({ id: true, filecoinCid: true });

// TypeScript type definitions for use in the application
export type MysterionKnowledgeNode = typeof mysterionKnowledgeNode.$inferSelect;
export type MysterionKnowledgeEdge = typeof mysterionKnowledgeEdge.$inferSelect;
export type MysterionImprovement = typeof mysterionImprovement.$inferSelect;

export type AgentType = typeof agentType.$inferSelect;
export type AgentInstance = typeof agentInstance.$inferSelect;
export type AgentTask = typeof agentTask.$inferSelect;

export type ComputationContribution = typeof computationContribution.$inferSelect;
export type RewardDistribution = typeof rewardDistribution.$inferSelect;

export type TrainingDataset = typeof trainingDataset.$inferSelect;
export type TrainingDataFragment = typeof trainingDataFragment.$inferSelect;

// Insert types for use with forms and API endpoints
export type InsertMysterionKnowledgeNode = z.infer<typeof insertMysterionKnowledgeNodeSchema>;
export type InsertMysterionKnowledgeEdge = z.infer<typeof insertMysterionKnowledgeEdgeSchema>;
export type InsertMysterionImprovement = z.infer<typeof insertMysterionImprovementSchema>;

export type InsertAgentType = z.infer<typeof insertAgentTypeSchema>;
export type InsertAgentInstance = z.infer<typeof insertAgentInstanceSchema>;
export type InsertAgentTask = z.infer<typeof insertAgentTaskSchema>;

export type InsertComputationContribution = z.infer<typeof insertComputationContributionSchema>;
export type InsertRewardDistribution = z.infer<typeof insertRewardDistributionSchema>;

export type InsertTrainingDataset = z.infer<typeof insertTrainingDatasetSchema>;
export type InsertTrainingDataFragment = z.infer<typeof insertTrainingDataFragmentSchema>;