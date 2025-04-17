/**
 * Shared types and database schema for AI Freedom Trust Framework
 */

import { z } from 'zod';
import { pgTable, serial, text, timestamp, integer, pgEnum, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

// --- Enums ---

export const nodeTypeEnum = pgEnum('node_type', [
  'concept', 
  'code', 
  'protocol', 
  'agent', 
  'system', 
  'documentation',
  'error-pattern',
  'refactor-action',
  'code-improvement'
]);

export const relationshipTypeEnum = pgEnum('relationship_type', [
  'contains', 
  'implements', 
  'depends_on', 
  'extends',
  'visualizes',
  'interacts_with',
  'influences'
]);

export const improvementStatusEnum = pgEnum('improvement_status', [
  'proposed',
  'reviewing',
  'approved',
  'rejected',
  'implemented',
  'verified'
]);

export const improvementImpactEnum = pgEnum('improvement_impact', [
  'low',
  'medium',
  'high',
  'critical'
]);

export const agentCategoryEnum = pgEnum('agent_category', [
  'economic',
  'security',
  'development',
  'governance',
  'data'
]);

export const taskStatusEnum = pgEnum('task_status', [
  'pending',
  'in_progress',
  'completed',
  'failed',
  'canceled'
]);

export const contributionTypeEnum = pgEnum('contribution_type', [
  'cpu',
  'gpu',
  'storage',
  'data',
  'validation'
]);

export const datasetStatusEnum = pgEnum('dataset_status', [
  'processing',
  'available',
  'verified',
  'archived',
  'error'
]);

// --- Tables ---

// Mysterion Knowledge System

export const mysterionKnowledgeNode = pgTable('mysterion_knowledge_node', {
  id: serial('id').primaryKey(),
  nodeType: nodeTypeEnum('node_type').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  confidence: integer('confidence').default(100),
  version: integer('version').default(1),
  parentId: integer('parent_id').references(() => mysterionKnowledgeNode.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const mysterionKnowledgeEdge = pgTable('mysterion_knowledge_edge', {
  id: serial('id').primaryKey(),
  sourceId: integer('source_id').notNull().references(() => mysterionKnowledgeNode.id),
  targetId: integer('target_id').notNull().references(() => mysterionKnowledgeNode.id),
  relationshipType: relationshipTypeEnum('relationship_type').notNull(),
  weight: integer('weight').default(100),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const mysterionImprovement = pgTable('mysterion_improvement', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  codeChanges: jsonb('code_changes').notNull(),
  status: improvementStatusEnum('status').default('proposed').notNull(),
  impact: improvementImpactEnum('impact').default('medium').notNull(),
  confidence: integer('confidence').default(70),
  targetRepository: text('target_repository'),
  targetFiles: text('target_files').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  implementedAt: timestamp('implemented_at')
});

// Agent System

export const agentType = pgTable('agent_type', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  capabilities: jsonb('capabilities').notNull(),
  baseRewardRate: integer('base_reward_rate').default(100),
  category: agentCategoryEnum('category').notNull(),
  version: text('version').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const agentInstance = pgTable('agent_instance', {
  id: serial('id').primaryKey(),
  typeId: integer('type_id').notNull().references(() => agentType.id),
  name: text('name').notNull(),
  configuration: jsonb('configuration').notNull(),
  status: text('status').default('active').notNull(),
  owner: text('owner').default('system').notNull(),
  lastActive: timestamp('last_active').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const agentTask = pgTable('agent_task', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').notNull().references(() => agentInstance.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  priority: integer('priority').default(5),
  status: taskStatusEnum('status').default('pending').notNull(),
  parameters: jsonb('parameters'),
  result: jsonb('result'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Reward System

export const computationContribution = pgTable('computation_contribution', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  nodeId: text('node_id').notNull(),
  contributionType: contributionTypeEnum('contribution_type').notNull(),
  resourceAmount: integer('resource_amount').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  qualityFactor: integer('quality_factor').default(100),
  verified: boolean('verified').default(false),
  verificationMethod: text('verification_method'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const rewardDistribution = pgTable('reward_distribution', {
  id: serial('id').primaryKey(),
  contributionId: integer('contribution_id').references(() => computationContribution.id),
  amount: integer('amount').notNull(),
  tokenType: text('token_type').notNull(),
  status: text('status').default('pending').notNull(),
  transactionHash: text('transaction_hash'),
  distributedAt: timestamp('distributed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Training Data

export const trainingDataset = pgTable('training_dataset', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  dataType: text('data_type').notNull(),
  size: integer('size').notNull(),
  recordCount: integer('record_count').notNull(),
  quality: integer('quality').default(100),
  contentHash: text('content_hash').notNull(),
  status: datasetStatusEnum('status').default('processing').notNull(),
  fractalShardConfig: jsonb('fractal_shard_config'),
  filecoinCid: text('filecoin_cid'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const trainingDataFragment = pgTable('training_data_fragment', {
  id: serial('id').primaryKey(),
  datasetId: integer('dataset_id').notNull().references(() => trainingDataset.id),
  fragmentIndex: integer('fragment_index').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  contentHash: text('content_hash').notNull(),
  encryptionMethod: text('encryption_method'),
  metadata: jsonb('metadata'),
  filecoinCid: text('filecoin_cid'),
  fractalShardIds: text('fractal_shard_ids').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// --- Insert Types ---

// Remove auto-generated fields
export const mysterionKnowledgeNodeInsertSchema = createInsertSchema(mysterionKnowledgeNode)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const mysterionKnowledgeEdgeInsertSchema = createInsertSchema(mysterionKnowledgeEdge)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const mysterionImprovementInsertSchema = createInsertSchema(mysterionImprovement)
  .omit({ id: true, createdAt: true, updatedAt: true, implementedAt: true });

export const agentTypeInsertSchema = createInsertSchema(agentType)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const agentInstanceInsertSchema = createInsertSchema(agentInstance)
  .omit({ id: true, lastActive: true, createdAt: true, updatedAt: true });

export const agentTaskInsertSchema = createInsertSchema(agentTask)
  .omit({ id: true, startedAt: true, completedAt: true, createdAt: true, updatedAt: true });

export const computationContributionInsertSchema = createInsertSchema(computationContribution)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const rewardDistributionInsertSchema = createInsertSchema(rewardDistribution)
  .omit({ id: true, distributedAt: true, createdAt: true, updatedAt: true });

export const trainingDatasetInsertSchema = createInsertSchema(trainingDataset)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const trainingDataFragmentInsertSchema = createInsertSchema(trainingDataFragment)
  .omit({ id: true, createdAt: true, updatedAt: true });

// --- Infer Types ---

// Insert Types
export type MysterionKnowledgeNodeInsert = z.infer<typeof mysterionKnowledgeNodeInsertSchema>;
export type MysterionKnowledgeEdgeInsert = z.infer<typeof mysterionKnowledgeEdgeInsertSchema>;
export type MysterionImprovementInsert = z.infer<typeof mysterionImprovementInsertSchema>;
export type AgentTypeInsert = z.infer<typeof agentTypeInsertSchema>;
export type AgentInstanceInsert = z.infer<typeof agentInstanceInsertSchema>;
export type AgentTaskInsert = z.infer<typeof agentTaskInsertSchema>;
export type ComputationContributionInsert = z.infer<typeof computationContributionInsertSchema>;
export type RewardDistributionInsert = z.infer<typeof rewardDistributionInsertSchema>;
export type TrainingDatasetInsert = z.infer<typeof trainingDatasetInsertSchema>;
export type TrainingDataFragmentInsert = z.infer<typeof trainingDataFragmentInsertSchema>;

// Select Types
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