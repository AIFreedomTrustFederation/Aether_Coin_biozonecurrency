/**
 * Shared database schema for AI Freedom Trust Framework
 */

import { relations, sql } from 'drizzle-orm';
import { 
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  json,
  integer,
  boolean,
  numeric
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// ======================================================
// Knowledge System Tables
// ======================================================

// Knowledge Node Types
const nodeTypes = [
  'concept',
  'code',
  'protocol',
  'agent',
  'system',
  'documentation',
  'error-pattern',
  'refactor-action',
  'code-improvement'
] as const;

// Knowledge Node Table
export const mysterionKnowledgeNode = pgTable('mysterion_knowledge_node', {
  id: serial('id').primaryKey(),
  nodeType: text('node_type', { enum: nodeTypes }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  metadata: json('metadata').$type<Record<string, any>>(),
  sourceReference: varchar('source_reference', { length: 255 }),
  repositoryUrl: varchar('repository_url', { length: 255 }),
  confidenceScore: numeric('confidence_score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Knowledge Node Insert Schema
export const mysterionKnowledgeNodeInsertSchema = createInsertSchema(mysterionKnowledgeNode)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Knowledge Node Relations
export const mysterionKnowledgeNodeRelations = relations(mysterionKnowledgeNode, ({ many }) => ({
  outgoingEdges: many(mysterionKnowledgeEdge, { relationName: 'source_node' }),
  incomingEdges: many(mysterionKnowledgeEdge, { relationName: 'target_node' })
}));

// Knowledge Edge Table
export const mysterionKnowledgeEdge = pgTable('mysterion_knowledge_edge', {
  id: serial('id').primaryKey(),
  sourceId: integer('source_id').references(() => mysterionKnowledgeNode.id, { onDelete: 'cascade' }).notNull(),
  targetId: integer('target_id').references(() => mysterionKnowledgeNode.id, { onDelete: 'cascade' }).notNull(),
  relationshipType: varchar('relationship_type', { length: 100 }).notNull(),
  weight: integer('weight').default(100),
  metadata: json('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Knowledge Edge Insert Schema
export const mysterionKnowledgeEdgeInsertSchema = createInsertSchema(mysterionKnowledgeEdge)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Knowledge Edge Relations
export const mysterionKnowledgeEdgeRelations = relations(mysterionKnowledgeEdge, ({ one }) => ({
  sourceNode: one(mysterionKnowledgeNode, {
    fields: [mysterionKnowledgeEdge.sourceId],
    references: [mysterionKnowledgeNode.id],
    relationName: 'source_node'
  }),
  targetNode: one(mysterionKnowledgeNode, {
    fields: [mysterionKnowledgeEdge.targetId],
    references: [mysterionKnowledgeNode.id],
    relationName: 'target_node'
  })
}));

// Improvement Status Types
const improvementStatusTypes = [
  'proposed',
  'approved',
  'in_progress',
  'implemented',
  'rejected'
] as const;

// Improvement Table
export const mysterionImprovement = pgTable('mysterion_improvement', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  proposedChanges: text('proposed_changes'),
  status: text('status', { enum: improvementStatusTypes }).default('proposed').notNull(),
  codeReference: json('code_reference').$type<{
    file?: string;
    lines?: [number, number];
    context?: string;
  }>(),
  implementationDetails: text('implementation_details'),
  proposedAt: timestamp('proposed_at').defaultNow().notNull(),
  implementedAt: timestamp('implemented_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Improvement Insert Schema
export const mysterionImprovementInsertSchema = createInsertSchema(mysterionImprovement)
  .omit({ id: true, proposedAt: true, implementedAt: true, createdAt: true, updatedAt: true });

// ======================================================
// Agent System Tables
// ======================================================

// Agent Type Table
export const agentType = pgTable('agent_type', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description').notNull(),
  capabilities: json('capabilities').$type<string[]>().notNull(),
  configSchema: json('config_schema').$type<Record<string, any>>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Agent Type Insert Schema
export const agentTypeInsertSchema = createInsertSchema(agentType)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Agent Type Relations
export const agentTypeRelations = relations(agentType, ({ many }) => ({
  instances: many(agentInstance)
}));

// Agent Instance Table
export const agentInstance = pgTable('agent_instance', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  typeId: integer('type_id').references(() => agentType.id).notNull(),
  status: varchar('status', { length: 50 }).default('inactive').notNull(),
  configuration: json('configuration').$type<Record<string, any>>(),
  lastActive: timestamp('last_active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Agent Instance Insert Schema
export const agentInstanceInsertSchema = createInsertSchema(agentInstance)
  .omit({ id: true, lastActive: true, createdAt: true, updatedAt: true });

// Agent Instance Relations
export const agentInstanceRelations = relations(agentInstance, ({ one, many }) => ({
  type: one(agentType, {
    fields: [agentInstance.typeId],
    references: [agentType.id]
  }),
  tasks: many(agentTask)
}));

// Task Status Types
const taskStatusTypes = [
  'pending',
  'in_progress',
  'completed',
  'failed',
  'cancelled'
] as const;

// Agent Task Table
export const agentTask = pgTable('agent_task', {
  id: serial('id').primaryKey(),
  agentId: integer('agent_id').references(() => agentInstance.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  priority: integer('priority').default(1).notNull(),
  status: text('status', { enum: taskStatusTypes }).default('pending').notNull(),
  parameters: json('parameters').$type<Record<string, any>>(),
  result: json('result').$type<Record<string, any>>(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Agent Task Insert Schema
export const agentTaskInsertSchema = createInsertSchema(agentTask)
  .omit({ id: true, agentId: true, startedAt: true, completedAt: true, createdAt: true, updatedAt: true });

// Agent Task Relations
export const agentTaskRelations = relations(agentTask, ({ one }) => ({
  agent: one(agentInstance, {
    fields: [agentTask.agentId],
    references: [agentInstance.id]
  })
}));

// ======================================================
// Rewards System Tables
// ======================================================

// Computation Types
const computationTypes = [
  'training',
  'inference',
  'storage',
  'validation',
  'data_preparation'
] as const;

// Computation Contribution Table
export const computationContribution = pgTable('computation_contribution', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  computationType: text('computation_type', { enum: computationTypes }).notNull(),
  resourceContribution: json('resource_contribution').$type<{
    cpu?: number;
    gpu?: number;
    ram?: number;
    storage?: number;
    bandwidth?: number;
    duration?: number;
  }>().notNull(),
  rewardAmount: numeric('reward_amount'),
  verificationHash: varchar('verification_hash', { length: 255 }),
  verified: boolean('verified').default(false),
  verifiedAt: timestamp('verified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Computation Contribution Insert Schema
export const computationContributionInsertSchema = createInsertSchema(computationContribution)
  .omit({ id: true, rewardAmount: true, verified: true, verifiedAt: true, createdAt: true, updatedAt: true });

// Distribution Status Types
const distributionStatusTypes = [
  'pending',
  'processing',
  'processed',
  'failed'
] as const;

// Reward Distribution Table
export const rewardDistribution = pgTable('reward_distribution', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  amount: numeric('amount').notNull(),
  tokenType: varchar('token_type', { length: 50 }).notNull(),
  status: text('status', { enum: distributionStatusTypes }).default('pending').notNull(),
  transactionHash: varchar('transaction_hash', { length: 255 }),
  distributedAt: timestamp('distributed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Reward Distribution Insert Schema
export const rewardDistributionInsertSchema = createInsertSchema(rewardDistribution)
  .omit({ id: true, status: true, transactionHash: true, distributedAt: true, createdAt: true, updatedAt: true });

// ======================================================
// Training Data Tables
// ======================================================

// Dataset Status Types
const datasetStatusTypes = [
  'draft',
  'processing',
  'available',
  'archived',
  'rejected'
] as const;

// Training Dataset Table
export const trainingDataset = pgTable('training_dataset', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  dataType: varchar('data_type', { length: 100 }).notNull(),
  status: text('status', { enum: datasetStatusTypes }).default('draft').notNull(),
  metadata: json('metadata').$type<Record<string, any>>(),
  filecoinCid: varchar('filecoin_cid', { length: 255 }),
  totalSize: integer('total_size'),
  fragmentCount: integer('fragment_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Training Dataset Insert Schema
export const trainingDatasetInsertSchema = createInsertSchema(trainingDataset)
  .omit({ id: true, filecoinCid: true, totalSize: true, fragmentCount: true, createdAt: true, updatedAt: true });

// Training Dataset Relations
export const trainingDatasetRelations = relations(trainingDataset, ({ many }) => ({
  fragments: many(trainingDataFragment)
}));

// Fragment Status Types
const fragmentStatusTypes = [
  'pending',
  'processed',
  'verified',
  'uploaded',
  'rejected'
] as const;

// Training Data Fragment Table
export const trainingDataFragment = pgTable('training_data_fragment', {
  id: serial('id').primaryKey(),
  datasetId: integer('dataset_id').references(() => trainingDataset.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: text('status', { enum: fragmentStatusTypes }).default('pending').notNull(),
  fragmentCid: varchar('fragment_cid', { length: 255 }),
  size: integer('size'),
  metadata: json('metadata').$type<Record<string, any>>(),
  verificationHash: varchar('verification_hash', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
});

// Training Data Fragment Insert Schema
export const trainingDataFragmentInsertSchema = createInsertSchema(trainingDataFragment)
  .omit({ id: true, status: true, fragmentCid: true, size: true, verificationHash: true, createdAt: true, updatedAt: true });

// Training Data Fragment Relations
export const trainingDataFragmentRelations = relations(trainingDataFragment, ({ one }) => ({
  dataset: one(trainingDataset, {
    fields: [trainingDataFragment.datasetId],
    references: [trainingDataset.id]
  })
}));

// ======================================================
// Type Exports
// ======================================================

// Knowledge System Types
export type MysterionKnowledgeNode = typeof mysterionKnowledgeNode.$inferSelect;
export type MysterionKnowledgeNodeInsert = z.infer<typeof mysterionKnowledgeNodeInsertSchema>;

export type MysterionKnowledgeEdge = typeof mysterionKnowledgeEdge.$inferSelect;
export type MysterionKnowledgeEdgeInsert = z.infer<typeof mysterionKnowledgeEdgeInsertSchema>;

export type MysterionImprovement = typeof mysterionImprovement.$inferSelect;
export type MysterionImprovementInsert = z.infer<typeof mysterionImprovementInsertSchema>;

// Agent System Types
export type AgentType = typeof agentType.$inferSelect;
export type AgentTypeInsert = z.infer<typeof agentTypeInsertSchema>;

export type AgentInstance = typeof agentInstance.$inferSelect;
export type AgentInstanceInsert = z.infer<typeof agentInstanceInsertSchema>;

export type AgentTask = typeof agentTask.$inferSelect;
export type AgentTaskInsert = z.infer<typeof agentTaskInsertSchema>;

// Rewards System Types
export type ComputationContribution = typeof computationContribution.$inferSelect;
export type ComputationContributionInsert = z.infer<typeof computationContributionInsertSchema>;

export type RewardDistribution = typeof rewardDistribution.$inferSelect;
export type RewardDistributionInsert = z.infer<typeof rewardDistributionInsertSchema>;

// Training Data Types
export type TrainingDataset = typeof trainingDataset.$inferSelect;
export type TrainingDatasetInsert = z.infer<typeof trainingDatasetInsertSchema>;

export type TrainingDataFragment = typeof trainingDataFragment.$inferSelect;
export type TrainingDataFragmentInsert = z.infer<typeof trainingDataFragmentInsertSchema>;