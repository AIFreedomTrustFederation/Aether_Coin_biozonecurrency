/**
 * AI Freedom Trust Framework - Shared Schema
 * Core types and schemas for the integrated ecosystem components
 */

import { z } from 'zod';
import { createInsertSchema } from 'drizzle-zod';
import { integer, pgTable, serial, text, timestamp, boolean, jsonb, real, date } from 'drizzle-orm/pg-core';

// ==================== BRAND SHOWCASE SYSTEM ====================

// Brand entity schema
export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  shortDescription: text('short_description').notNull(),
  logoPath: text('logo_path'),
  bannerPath: text('banner_path'),
  primaryColor: text('primary_color'),
  secondaryColor: text('secondary_color'),
  category: text('category').notNull(), // ai, blockchain, security, development, infrastructure
  githubRepo: text('github_repo'),
  documentationUrl: text('documentation_url'),
  status: text('status').default('active').notNull(), // active, beta, archived
  featured: boolean('featured').default(false),
  priority: integer('priority').default(10),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Brand features schema
export const brandFeatures = pgTable('brand_features', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id').references(() => brands.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  iconName: text('icon_name'), // name of lucide icon
  priority: integer('priority').default(10),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Technology stack items for brands
export const brandTechnologies = pgTable('brand_technologies', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id').references(() => brands.id).notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(), // frontend, backend, database, infrastructure, ai, blockchain
  logoPath: text('logo_path'),
  isOpenSource: boolean('is_open_source').default(true),
  hasOwnImplementation: boolean('has_own_implementation').default(false),
  openSourceAlternativeId: integer('open_source_alternative_id').references(() => brandTechnologies.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Integration points between brands
export const brandIntegrations = pgTable('brand_integrations', {
  id: serial('id').primaryKey(),
  sourceBrandId: integer('source_brand_id').references(() => brands.id).notNull(),
  targetBrandId: integer('target_brand_id').references(() => brands.id).notNull(),
  integrationType: text('integration_type').notNull(), // uses, enhances, depends_on, extends
  description: text('description').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Team members associated with brands
export const brandTeamMembers = pgTable('brand_team_members', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id').references(() => brands.id).notNull(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  avatarPath: text('avatar_path'),
  bio: text('bio'),
  priority: integer('priority').default(10),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Case studies or examples of brand usage
export const brandCaseStudies = pgTable('brand_case_studies', {
  id: serial('id').primaryKey(),
  brandId: integer('brand_id').references(() => brands.id).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imagePath: text('image_path'),
  url: text('url'),
  featured: boolean('featured').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

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

// ==================== DEVELOPER PRODUCTIVITY DASHBOARD ====================

export const developerActivity = pgTable('developer_activity', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  activityType: text('activity_type').notNull(), // 'coding', 'review', 'testing', 'documentation', 'planning'
  projectId: integer('project_id'),
  description: text('description').notNull(),
  timeSpent: integer('time_spent').notNull(), // in minutes
  codeLines: integer('code_lines'), // number of lines added/modified
  complexity: integer('complexity'), // complexity score if applicable
  date: date('date').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  metadata: jsonb('metadata'),
});

export const productivityMetric = pgTable('productivity_metric', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  date: date('date').notNull(),
  totalTimeSpent: integer('total_time_spent').notNull(), // in minutes
  totalCodeLines: integer('total_code_lines'),
  focusScore: real('focus_score'), // 0-100 score for focus quality
  efficiencyRating: real('efficiency_rating'), // efficiency rating 0-100
  qualityScore: real('quality_score'), // code quality score 0-100
  tasksCompleted: integer('tasks_completed'),
  blockers: integer('blockers'), // number of blockers encountered
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const developerGoal = pgTable('developer_goal', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  targetValue: real('target_value'),
  currentValue: real('current_value').default(0),
  metricType: text('metric_type').notNull(), // 'time', 'code_lines', 'tasks', 'focus_score', 'efficiency'
  timeframe: text('timeframe').notNull(), // 'daily', 'weekly', 'monthly', 'quarterly'
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  status: text('status').default('active').notNull(), // 'active', 'completed', 'abandoned'
  priority: integer('priority').default(1).notNull(), // 1-5 scale
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productivityInsight = pgTable('productivity_insight', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  insightType: text('insight_type').notNull(), // 'pattern', 'suggestion', 'achievement', 'warning'
  title: text('title').notNull(),
  description: text('description').notNull(),
  score: real('score'), // relevance/importance score
  date: date('date').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const timeBlock = pgTable('time_block', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  status: text('status').default('scheduled').notNull(), // 'scheduled', 'in_progress', 'completed', 'canceled'
  category: text('category').notNull(), // 'deep_work', 'meeting', 'learning', 'admin', 'break'
  interruptions: integer('interruptions').default(0),
  productivity: real('productivity'), // self-rated productivity 0-100
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const codeQualityMetric = pgTable('code_quality_metric', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  projectId: integer('project_id'),
  commitId: text('commit_id'),
  date: date('date').notNull(),
  linesOfCode: integer('lines_of_code'),
  cyclomaticComplexity: real('cyclomatic_complexity'),
  commentRatio: real('comment_ratio'),
  testCoverage: real('test_coverage'),
  bugsFixed: integer('bugs_fixed'),
  bugsIntroduced: integer('bugs_introduced'),
  qualityScore: real('quality_score'), // overall quality score 0-100
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Create Zod schemas for data validation

// Brand Showcase
export const insertBrandSchema = createInsertSchema(brands).omit({ id: true });
export const insertBrandFeatureSchema = createInsertSchema(brandFeatures).omit({ id: true });
export const insertBrandTechnologySchema = createInsertSchema(brandTechnologies).omit({ id: true });
export const insertBrandIntegrationSchema = createInsertSchema(brandIntegrations).omit({ id: true });
export const insertBrandTeamMemberSchema = createInsertSchema(brandTeamMembers).omit({ id: true });
export const insertBrandCaseStudySchema = createInsertSchema(brandCaseStudies).omit({ id: true });

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
export type Brand = typeof brands.$inferSelect;
export type BrandFeature = typeof brandFeatures.$inferSelect;
export type BrandTechnology = typeof brandTechnologies.$inferSelect;
export type BrandIntegration = typeof brandIntegrations.$inferSelect;
export type BrandTeamMember = typeof brandTeamMembers.$inferSelect;
export type BrandCaseStudy = typeof brandCaseStudies.$inferSelect;

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
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type InsertBrandFeature = z.infer<typeof insertBrandFeatureSchema>;
export type InsertBrandTechnology = z.infer<typeof insertBrandTechnologySchema>;
export type InsertBrandIntegration = z.infer<typeof insertBrandIntegrationSchema>;
export type InsertBrandTeamMember = z.infer<typeof insertBrandTeamMemberSchema>;
export type InsertBrandCaseStudy = z.infer<typeof insertBrandCaseStudySchema>;

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

// Developer Productivity Dashboard
export const insertDeveloperActivitySchema = createInsertSchema(developerActivity).omit({ id: true });
export const insertProductivityMetricSchema = createInsertSchema(productivityMetric).omit({ id: true });
export const insertDeveloperGoalSchema = createInsertSchema(developerGoal).omit({ id: true, updatedAt: true });
export const insertProductivityInsightSchema = createInsertSchema(productivityInsight).omit({ id: true });
export const insertTimeBlockSchema = createInsertSchema(timeBlock).omit({ id: true, endTime: true });
export const insertCodeQualityMetricSchema = createInsertSchema(codeQualityMetric).omit({ id: true });

// Developer Productivity Dashboard Types
export type DeveloperActivity = typeof developerActivity.$inferSelect;
export type ProductivityMetric = typeof productivityMetric.$inferSelect;
export type DeveloperGoal = typeof developerGoal.$inferSelect;
export type ProductivityInsight = typeof productivityInsight.$inferSelect;
export type TimeBlock = typeof timeBlock.$inferSelect;
export type CodeQualityMetric = typeof codeQualityMetric.$inferSelect;

export type InsertDeveloperActivity = z.infer<typeof insertDeveloperActivitySchema>;
export type InsertProductivityMetric = z.infer<typeof insertProductivityMetricSchema>;
export type InsertDeveloperGoal = z.infer<typeof insertDeveloperGoalSchema>;
export type InsertProductivityInsight = z.infer<typeof insertProductivityInsightSchema>;
export type InsertTimeBlock = z.infer<typeof insertTimeBlockSchema>;
export type InsertCodeQualityMetric = z.infer<typeof insertCodeQualityMetricSchema>;