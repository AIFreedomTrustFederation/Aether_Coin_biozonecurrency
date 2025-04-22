"use strict";
/**
 * AI Freedom Trust Framework - Shared Schema
 * Core types and schemas for the integrated ecosystem components
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTrainingDataFragmentSchema = exports.insertTrainingDatasetSchema = exports.insertRewardDistributionSchema = exports.insertComputationContributionSchema = exports.insertAgentTaskSchema = exports.insertAgentInstanceSchema = exports.insertAgentTypeSchema = exports.insertMysterionImprovementSchema = exports.insertMysterionKnowledgeEdgeSchema = exports.insertMysterionKnowledgeNodeSchema = exports.trainingDataFragment = exports.trainingDataset = exports.rewardDistribution = exports.computationContribution = exports.agentTask = exports.agentInstance = exports.agentType = exports.mysterionImprovement = exports.mysterionKnowledgeEdge = exports.mysterionKnowledgeNode = void 0;
const drizzle_zod_1 = require("drizzle-zod");
const pg_core_1 = require("drizzle-orm/pg-core");
// ==================== MYSTERION INTELLIGENCE SYSTEM ====================
exports.mysterionKnowledgeNode = (0, pg_core_1.pgTable)('mysterion_knowledge_node', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    nodeType: (0, pg_core_1.text)('node_type').notNull(), // 'concept', 'code', 'protocol', 'agent', 'system'
    title: (0, pg_core_1.text)('title').notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
    version: (0, pg_core_1.integer)('version').default(1).notNull(),
    confidence: (0, pg_core_1.real)('confidence').default(0.8).notNull(),
    parentId: (0, pg_core_1.integer)('parent_id').references(() => exports.mysterionKnowledgeNode.id),
});
exports.mysterionKnowledgeEdge = (0, pg_core_1.pgTable)('mysterion_knowledge_edge', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    sourceId: (0, pg_core_1.integer)('source_id').references(() => exports.mysterionKnowledgeNode.id).notNull(),
    targetId: (0, pg_core_1.integer)('target_id').references(() => exports.mysterionKnowledgeNode.id).notNull(),
    relationshipType: (0, pg_core_1.text)('relationship_type').notNull(), // 'contains', 'implements', 'depends_on', 'extends'
    weight: (0, pg_core_1.real)('weight').default(1.0).notNull(),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.mysterionImprovement = (0, pg_core_1.pgTable)('mysterion_improvement', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    title: (0, pg_core_1.text)('title').notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    codeChanges: (0, pg_core_1.jsonb)('code_changes').notNull(),
    status: (0, pg_core_1.text)('status').default('proposed').notNull(), // 'proposed', 'approved', 'implemented', 'rejected'
    confidence: (0, pg_core_1.real)('confidence').default(0.7).notNull(),
    impact: (0, pg_core_1.text)('impact').default('medium').notNull(), // 'low', 'medium', 'high', 'critical'
    targetRepository: (0, pg_core_1.text)('target_repository').notNull(),
    targetFiles: (0, pg_core_1.jsonb)('target_files').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    implementedAt: (0, pg_core_1.timestamp)('implemented_at'),
});
// ==================== AUTONOMOUS AGENT SYSTEM ====================
exports.agentType = (0, pg_core_1.pgTable)('agent_type', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull().unique(),
    description: (0, pg_core_1.text)('description').notNull(),
    capabilities: (0, pg_core_1.jsonb)('capabilities').notNull(),
    baseRewardRate: (0, pg_core_1.real)('base_reward_rate').default(1.0).notNull(),
    category: (0, pg_core_1.text)('category').notNull(), // 'economic', 'security', 'development', 'governance'
    version: (0, pg_core_1.text)('version').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
exports.agentInstance = (0, pg_core_1.pgTable)('agent_instance', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    agentTypeId: (0, pg_core_1.integer)('agent_type_id').references(() => exports.agentType.id).notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    status: (0, pg_core_1.text)('status').default('active').notNull(), // 'initializing', 'active', 'paused', 'terminated'
    configuration: (0, pg_core_1.jsonb)('configuration').notNull(),
    performanceMetrics: (0, pg_core_1.jsonb)('performance_metrics'),
    owner: (0, pg_core_1.text)('owner'), // Can be null for system-owned agents
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    lastActive: (0, pg_core_1.timestamp)('last_active').defaultNow().notNull(),
    reputation: (0, pg_core_1.real)('reputation').default(0.5).notNull(),
    fractalCoinBalance: (0, pg_core_1.real)('fractal_coin_balance').default(0).notNull(),
    aiCoinBalance: (0, pg_core_1.real)('ai_coin_balance').default(0).notNull(),
});
exports.agentTask = (0, pg_core_1.pgTable)('agent_task', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    agentInstanceId: (0, pg_core_1.integer)('agent_instance_id').references(() => exports.agentInstance.id).notNull(),
    title: (0, pg_core_1.text)('title').notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    status: (0, pg_core_1.text)('status').default('pending').notNull(), // 'pending', 'in_progress', 'completed', 'failed'
    priority: (0, pg_core_1.integer)('priority').default(5).notNull(), // 1-10 scale
    result: (0, pg_core_1.jsonb)('result'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    startedAt: (0, pg_core_1.timestamp)('started_at'),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
    resourceUsage: (0, pg_core_1.jsonb)('resource_usage'),
    rewardAmount: (0, pg_core_1.real)('reward_amount'),
});
// ==================== COMPUTATIONAL REWARDS SYSTEM ====================
exports.computationContribution = (0, pg_core_1.pgTable)('computation_contribution', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.text)('user_id'), // Can be null for anonymous contributions
    nodeId: (0, pg_core_1.text)('node_id').notNull(), // Unique identifier for the contributing node
    contributionType: (0, pg_core_1.text)('contribution_type').notNull(), // 'cpu', 'gpu', 'storage', 'bandwidth', 'data'
    startTime: (0, pg_core_1.timestamp)('start_time').defaultNow().notNull(),
    endTime: (0, pg_core_1.timestamp)('end_time'),
    resourceAmount: (0, pg_core_1.real)('resource_amount').notNull(), // Standardized units based on type
    quality: (0, pg_core_1.real)('quality').default(1.0).notNull(), // Quality multiplier
    verified: (0, pg_core_1.boolean)('verified').default(false).notNull(),
    verificationMethod: (0, pg_core_1.text)('verification_method'),
    metadata: (0, pg_core_1.jsonb)('metadata'),
});
exports.rewardDistribution = (0, pg_core_1.pgTable)('reward_distribution', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    contributionId: (0, pg_core_1.integer)('contribution_id').references(() => exports.computationContribution.id).notNull(),
    fractalCoinAmount: (0, pg_core_1.real)('fractal_coin_amount').default(0).notNull(),
    aiCoinAmount: (0, pg_core_1.real)('ai_coin_amount').default(0).notNull(),
    computeCredits: (0, pg_core_1.integer)('compute_credits').default(0).notNull(),
    distributionTime: (0, pg_core_1.timestamp)('distribution_time').defaultNow().notNull(),
    transactionHash: (0, pg_core_1.text)('transaction_hash'),
    status: (0, pg_core_1.text)('status').default('pending').notNull(), // 'pending', 'processed', 'failed'
});
// ==================== TRAINING DATA BRIDGE SYSTEM ====================
exports.trainingDataset = (0, pg_core_1.pgTable)('training_dataset', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    dataType: (0, pg_core_1.text)('data_type').notNull(), // 'text', 'image', 'code', 'mixed'
    size: (0, pg_core_1.integer)('size').notNull(), // Size in bytes
    recordCount: (0, pg_core_1.integer)('record_count').notNull(),
    quality: (0, pg_core_1.real)('quality').default(0.8).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
    status: (0, pg_core_1.text)('status').default('active').notNull(), // 'processing', 'active', 'archived', 'deprecated'
    contentHash: (0, pg_core_1.text)('content_hash').notNull(),
    filecoinCid: (0, pg_core_1.text)('filecoin_cid'),
    fractalShardConfig: (0, pg_core_1.jsonb)('fractal_shard_config'),
});
exports.trainingDataFragment = (0, pg_core_1.pgTable)('training_data_fragment', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    datasetId: (0, pg_core_1.integer)('dataset_id').references(() => exports.trainingDataset.id).notNull(),
    fragmentIndex: (0, pg_core_1.integer)('fragment_index').notNull(),
    contentType: (0, pg_core_1.text)('content_type').notNull(),
    size: (0, pg_core_1.integer)('size').notNull(),
    contentHash: (0, pg_core_1.text)('content_hash').notNull(),
    encryptionMethod: (0, pg_core_1.text)('encryption_method'),
    filecoinCid: (0, pg_core_1.text)('filecoin_cid'),
    fractalShardIds: (0, pg_core_1.jsonb)('fractal_shard_ids'),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Create Zod schemas for data validation
// Mysterion Intelligence
exports.insertMysterionKnowledgeNodeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mysterionKnowledgeNode).omit({ id: true });
exports.insertMysterionKnowledgeEdgeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mysterionKnowledgeEdge).omit({ id: true });
exports.insertMysterionImprovementSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mysterionImprovement).omit({ id: true, implementedAt: true });
// Autonomous Agents
exports.insertAgentTypeSchema = (0, drizzle_zod_1.createInsertSchema)(exports.agentType).omit({ id: true });
exports.insertAgentInstanceSchema = (0, drizzle_zod_1.createInsertSchema)(exports.agentInstance).omit({ id: true });
exports.insertAgentTaskSchema = (0, drizzle_zod_1.createInsertSchema)(exports.agentTask).omit({ id: true, startedAt: true, completedAt: true, result: true, resourceUsage: true, rewardAmount: true });
// Computational Rewards
exports.insertComputationContributionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.computationContribution).omit({ id: true, endTime: true, verified: true, verificationMethod: true });
exports.insertRewardDistributionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.rewardDistribution).omit({ id: true, transactionHash: true });
// Training Data Bridge
exports.insertTrainingDatasetSchema = (0, drizzle_zod_1.createInsertSchema)(exports.trainingDataset).omit({ id: true, filecoinCid: true });
exports.insertTrainingDataFragmentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.trainingDataFragment).omit({ id: true, filecoinCid: true });
