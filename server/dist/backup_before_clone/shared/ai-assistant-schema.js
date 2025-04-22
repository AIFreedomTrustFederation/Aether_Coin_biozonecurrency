"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertAiTrainingContributorSchema = exports.insertAiTrainingJobSchema = exports.insertAiTrainingDataSchema = exports.aiTrainingContributorsRelations = exports.aiTrainingContributors = exports.aiTrainingJobs = exports.aiTrainingDataRelations = exports.aiTrainingData = exports.TrainingProcessingStatus = exports.TrainingFeedbackType = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const drizzle_orm_1 = require("drizzle-orm");
const base_schema_1 = require("./base-schema");
// Training feedback types
var TrainingFeedbackType;
(function (TrainingFeedbackType) {
    TrainingFeedbackType["HELPFUL"] = "helpful";
    TrainingFeedbackType["NOT_HELPFUL"] = "not_helpful";
    TrainingFeedbackType["INCORRECT"] = "incorrect";
    TrainingFeedbackType["OFFENSIVE"] = "offensive";
    TrainingFeedbackType["OTHER"] = "other";
})(TrainingFeedbackType || (exports.TrainingFeedbackType = TrainingFeedbackType = {}));
// Training data status types
var TrainingProcessingStatus;
(function (TrainingProcessingStatus) {
    TrainingProcessingStatus["QUEUED"] = "queued";
    TrainingProcessingStatus["PROCESSING"] = "processing";
    TrainingProcessingStatus["COMPLETED"] = "completed";
    TrainingProcessingStatus["FAILED"] = "failed";
    TrainingProcessingStatus["REJECTED"] = "rejected"; // For content that doesn't meet quality guidelines
})(TrainingProcessingStatus || (exports.TrainingProcessingStatus = TrainingProcessingStatus = {}));
// AI Assistant training data
exports.aiTrainingData = (0, pg_core_1.pgTable)("ai_training_data", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => base_schema_1.users.id), // Can be null for anonymous contributions
    userApiKeyId: (0, pg_core_1.integer)("user_api_key_id").references(() => base_schema_1.userApiKeys.id), // Can be null if direct user contribution
    // Source data
    userQuery: (0, pg_core_1.text)("user_query").notNull(),
    aiResponse: (0, pg_core_1.text)("ai_response").notNull(),
    context: (0, pg_core_1.jsonb)("context"), // Context in which interaction happened
    // Metadata
    dataHash: (0, pg_core_1.text)("data_hash").notNull(), // Hash for deduplication
    interactionId: (0, pg_core_1.text)("interaction_id"), // ID of the original interaction
    // Feedback and rating
    feedbackType: (0, pg_core_1.text)("feedback_type").notNull(), // From TrainingFeedbackType enum
    feedbackDetails: (0, pg_core_1.text)("feedback_details"), // Optional explanation
    qualityRating: (0, pg_core_1.integer)("quality_rating"), // 1-5 rating
    // Processing fields
    dataSizeBytes: (0, pg_core_1.integer)("data_size_bytes").notNull(),
    contributionDate: (0, pg_core_1.timestamp)("contribution_date").defaultNow(),
    processingStatus: (0, pg_core_1.text)("processing_status").notNull().default(TrainingProcessingStatus.QUEUED),
    processingNotes: (0, pg_core_1.text)("processing_notes"),
    // SING coin rewards
    pointsAwarded: (0, pg_core_1.integer)("points_awarded").notNull().default(0),
    singTokensAwarded: (0, pg_core_1.integer)("sing_tokens_awarded").default(0), // Actual SING token rewards
    // System fields
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Relations for the AI training data
exports.aiTrainingDataRelations = (0, drizzle_orm_1.relations)(exports.aiTrainingData, ({ one }) => ({
    user: one(base_schema_1.users, {
        fields: [exports.aiTrainingData.userId],
        references: [base_schema_1.users.id],
    }),
    userApiKey: one(base_schema_1.userApiKeys, {
        fields: [exports.aiTrainingData.userApiKeyId],
        references: [base_schema_1.userApiKeys.id],
    }),
}));
// AI Training jobs to track model fine-tuning
exports.aiTrainingJobs = (0, pg_core_1.pgTable)("ai_training_jobs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    jobName: (0, pg_core_1.text)("job_name").notNull(),
    modelName: (0, pg_core_1.text)("model_name").notNull(),
    trainingSetSize: (0, pg_core_1.integer)("training_set_size").notNull(),
    validationSetSize: (0, pg_core_1.integer)("validation_set_size").notNull(),
    status: (0, pg_core_1.text)("status").notNull().default("pending"), // pending, in_progress, completed, failed
    startTime: (0, pg_core_1.timestamp)("start_time"),
    endTime: (0, pg_core_1.timestamp)("end_time"),
    validationLoss: (0, pg_core_1.text)("validation_loss"),
    trainingLoss: (0, pg_core_1.text)("training_loss"),
    metrics: (0, pg_core_1.jsonb)("metrics"), // Various training metrics
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Table to track contributors to AI training
exports.aiTrainingContributors = (0, pg_core_1.pgTable)("ai_training_contributors", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => base_schema_1.users.id),
    totalContributions: (0, pg_core_1.integer)("total_contributions").notNull().default(0),
    totalPointsEarned: (0, pg_core_1.integer)("total_points_earned").notNull().default(0),
    totalSingTokens: (0, pg_core_1.integer)("total_sing_tokens").notNull().default(0),
    contributorTier: (0, pg_core_1.text)("contributor_tier").notNull().default("bronze"), // bronze, silver, gold, platinum
    contributorRank: (0, pg_core_1.integer)("contributor_rank"), // Leaderboard position
    lastContribution: (0, pg_core_1.timestamp)("last_contribution"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Define the relationships
exports.aiTrainingContributorsRelations = (0, drizzle_orm_1.relations)(exports.aiTrainingContributors, ({ one }) => ({
    user: one(base_schema_1.users, {
        fields: [exports.aiTrainingContributors.userId],
        references: [base_schema_1.users.id],
    }),
}));
// Schema for inserting AI training data
exports.insertAiTrainingDataSchema = (0, drizzle_zod_1.createInsertSchema)(exports.aiTrainingData).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
}).extend({
    // Custom validations
    userQuery: zod_1.z.string().min(1, "User query is required"),
    aiResponse: zod_1.z.string().min(1, "AI response is required"),
    feedbackType: zod_1.z.enum([
        TrainingFeedbackType.HELPFUL,
        TrainingFeedbackType.NOT_HELPFUL,
        TrainingFeedbackType.INCORRECT,
        TrainingFeedbackType.OFFENSIVE,
        TrainingFeedbackType.OTHER
    ]),
    qualityRating: zod_1.z.number().min(1).max(5).optional(),
});
// Schema for inserting AI training jobs
exports.insertAiTrainingJobSchema = (0, drizzle_zod_1.createInsertSchema)(exports.aiTrainingJobs).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    startTime: true,
    endTime: true,
});
// Schema for inserting AI training contributors
exports.insertAiTrainingContributorSchema = (0, drizzle_zod_1.createInsertSchema)(exports.aiTrainingContributors).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastContribution: true,
    contributorRank: true,
});
