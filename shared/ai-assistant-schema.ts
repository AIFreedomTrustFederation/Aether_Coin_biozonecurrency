import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users, userApiKeys } from "./base-schema";

// Training feedback types
export enum TrainingFeedbackType {
  HELPFUL = 'helpful',
  NOT_HELPFUL = 'not_helpful',
  INCORRECT = 'incorrect',
  OFFENSIVE = 'offensive',
  OTHER = 'other'
}

// Training data status types
export enum TrainingProcessingStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REJECTED = 'rejected' // For content that doesn't meet quality guidelines
}

// AI Assistant training data
export const aiTrainingData = pgTable("ai_training_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Can be null for anonymous contributions
  userApiKeyId: integer("user_api_key_id").references(() => userApiKeys.id), // Can be null if direct user contribution
  
  // Source data
  userQuery: text("user_query").notNull(),
  aiResponse: text("ai_response").notNull(),
  context: jsonb("context"), // Context in which interaction happened
  
  // Metadata
  dataHash: text("data_hash").notNull(), // Hash for deduplication
  interactionId: text("interaction_id"), // ID of the original interaction
  
  // Feedback and rating
  feedbackType: text("feedback_type").notNull(), // From TrainingFeedbackType enum
  feedbackDetails: text("feedback_details"), // Optional explanation
  qualityRating: integer("quality_rating"), // 1-5 rating
  
  // Processing fields
  dataSizeBytes: integer("data_size_bytes").notNull(),
  contributionDate: timestamp("contribution_date").defaultNow(),
  processingStatus: text("processing_status").notNull().default(TrainingProcessingStatus.QUEUED),
  processingNotes: text("processing_notes"),
  
  // SING coin rewards
  pointsAwarded: integer("points_awarded").notNull().default(0),
  singTokensAwarded: integer("sing_tokens_awarded").default(0), // Actual SING token rewards
  
  // System fields
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations for the AI training data
export const aiTrainingDataRelations = relations(aiTrainingData, ({ one }) => ({
  user: one(users, {
    fields: [aiTrainingData.userId],
    references: [users.id],
  }),
  userApiKey: one(userApiKeys, {
    fields: [aiTrainingData.userApiKeyId],
    references: [userApiKeys.id],
  }),
}));

// AI Training jobs to track model fine-tuning
export const aiTrainingJobs = pgTable("ai_training_jobs", {
  id: serial("id").primaryKey(),
  jobName: text("job_name").notNull(),
  modelName: text("model_name").notNull(),
  trainingSetSize: integer("training_set_size").notNull(),
  validationSetSize: integer("validation_set_size").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, failed
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  validationLoss: text("validation_loss"),
  trainingLoss: text("training_loss"),
  metrics: jsonb("metrics"), // Various training metrics
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Table to track contributors to AI training
export const aiTrainingContributors = pgTable("ai_training_contributors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  totalContributions: integer("total_contributions").notNull().default(0),
  totalPointsEarned: integer("total_points_earned").notNull().default(0),
  totalSingTokens: integer("total_sing_tokens").notNull().default(0),
  contributorTier: text("contributor_tier").notNull().default("bronze"), // bronze, silver, gold, platinum
  contributorRank: integer("contributor_rank"), // Leaderboard position
  lastContribution: timestamp("last_contribution"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define the relationships
export const aiTrainingContributorsRelations = relations(aiTrainingContributors, ({ one }) => ({
  user: one(users, {
    fields: [aiTrainingContributors.userId],
    references: [users.id],
  }),
}));

// Schema for inserting AI training data
export const insertAiTrainingDataSchema = createInsertSchema(aiTrainingData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Custom validations
  userQuery: z.string().min(1, "User query is required"),
  aiResponse: z.string().min(1, "AI response is required"),
  feedbackType: z.enum([
    TrainingFeedbackType.HELPFUL,
    TrainingFeedbackType.NOT_HELPFUL,
    TrainingFeedbackType.INCORRECT,
    TrainingFeedbackType.OFFENSIVE,
    TrainingFeedbackType.OTHER
  ]),
  qualityRating: z.number().min(1).max(5).optional(),
});

// Schema for inserting AI training jobs
export const insertAiTrainingJobSchema = createInsertSchema(aiTrainingJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  startTime: true,
  endTime: true,
});

// Schema for inserting AI training contributors
export const insertAiTrainingContributorSchema = createInsertSchema(aiTrainingContributors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastContribution: true,
  contributorRank: true,
});

// Export types
export type AiTrainingData = typeof aiTrainingData.$inferSelect;
export type InsertAiTrainingData = z.infer<typeof insertAiTrainingDataSchema>;

export type AiTrainingJob = typeof aiTrainingJobs.$inferSelect;
export type InsertAiTrainingJob = z.infer<typeof insertAiTrainingJobSchema>;

export type AiTrainingContributor = typeof aiTrainingContributors.$inferSelect;
export type InsertAiTrainingContributor = z.infer<typeof insertAiTrainingContributorSchema>;