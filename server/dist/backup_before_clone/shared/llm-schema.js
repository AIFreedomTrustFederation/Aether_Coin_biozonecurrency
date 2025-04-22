"use strict";
/**
 * LLM Schema
 *
 * This schema defines the database tables related to LLM functionality
 * in the AetherCoin ecosystem.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectSacredPatternRecordSchema = exports.insertSacredPatternRecordSchema = exports.selectLlmFineTuningJobSchema = exports.insertLlmFineTuningJobSchema = exports.selectLlmMessageSchema = exports.insertLlmMessageSchema = exports.selectLlmConversationSchema = exports.insertLlmConversationSchema = exports.selectLlmPromptSchema = exports.insertLlmPromptSchema = exports.sacredPatternRelations = exports.fineTuningRelations = exports.messageRelations = exports.conversationRelations = exports.promptRelations = exports.sacredPatternRecords = exports.llmFineTuningJobs = exports.llmMessages = exports.llmConversations = exports.llmPrompts = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const schema_1 = require("./schema");
/**
 * LLM Prompts - Stores predefined prompts for various LLM operations
 */
exports.llmPrompts = (0, pg_core_1.pgTable)("llm_prompts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    promptTemplate: (0, pg_core_1.text)("prompt_template").notNull(),
    category: (0, pg_core_1.text)("category"),
    tags: (0, pg_core_1.text)("tags").array(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
    createdById: (0, pg_core_1.integer)("created_by_id").references(() => schema_1.users.id)
});
/**
 * LLM Conversations - Tracks ongoing conversations with the LLM
 */
exports.llmConversations = (0, pg_core_1.pgTable)("llm_conversations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => schema_1.users.id).notNull(),
    title: (0, pg_core_1.text)("title"),
    startedAt: (0, pg_core_1.timestamp)("started_at").defaultNow().notNull(),
    lastMessageAt: (0, pg_core_1.timestamp)("last_message_at").defaultNow().notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    tags: (0, pg_core_1.text)("tags").array(),
    metadata: (0, pg_core_1.jsonb)("metadata")
});
/**
 * LLM Messages - Individual messages in LLM conversations
 */
exports.llmMessages = (0, pg_core_1.pgTable)("llm_messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    conversationId: (0, pg_core_1.integer)("conversation_id").references(() => exports.llmConversations.id).notNull(),
    userId: (0, pg_core_1.integer)("user_id").references(() => schema_1.users.id),
    role: (0, pg_core_1.text)("role").notNull().default("user"), // 'user', 'assistant', 'system'
    content: (0, pg_core_1.text)("content").notNull(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow().notNull(),
    promptTokens: (0, pg_core_1.integer)("prompt_tokens"),
    completionTokens: (0, pg_core_1.integer)("completion_tokens"),
    totalTokens: (0, pg_core_1.integer)("total_tokens"),
    metadata: (0, pg_core_1.jsonb)("metadata")
});
/**
 * LLM Fine-tuning Jobs - Tracks model fine-tuning operations
 */
exports.llmFineTuningJobs = (0, pg_core_1.pgTable)("llm_fine_tuning_jobs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => schema_1.users.id).notNull(),
    baseModel: (0, pg_core_1.text)("base_model").notNull(),
    fineTunedModelName: (0, pg_core_1.text)("fine_tuned_model_name"),
    status: (0, pg_core_1.text)("status").notNull(), // 'queued', 'processing', 'succeeded', 'failed'
    startedAt: (0, pg_core_1.timestamp)("started_at").defaultNow().notNull(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    trainingFileUrl: (0, pg_core_1.text)("training_file_url"),
    validationFileUrl: (0, pg_core_1.text)("validation_file_url"),
    epochs: (0, pg_core_1.integer)("epochs"),
    batchSize: (0, pg_core_1.integer)("batch_size"),
    learningRate: (0, pg_core_1.text)("learning_rate"),
    parameters: (0, pg_core_1.jsonb)("parameters"),
    metrics: (0, pg_core_1.jsonb)("metrics")
});
/**
 * Sacred Pattern Records - Stores sacred pattern analyses from the LLM
 */
exports.sacredPatternRecords = (0, pg_core_1.pgTable)("sacred_pattern_records", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(() => schema_1.users.id).notNull(),
    input: (0, pg_core_1.text)("input").notNull(),
    analysis: (0, pg_core_1.jsonb)("analysis").notNull(),
    divinePrinciple: (0, pg_core_1.text)("divine_principle"),
    goldenRatioAlignment: (0, pg_core_1.integer)("golden_ratio_alignment"),
    temporalHarmonicScore: (0, pg_core_1.integer)("temporal_harmonic_score"),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow().notNull(),
    category: (0, pg_core_1.text)("category"),
    linkedEntityType: (0, pg_core_1.text)("linked_entity_type"),
    linkedEntityId: (0, pg_core_1.integer)("linked_entity_id")
});
// Relations
// Prompt relations
exports.promptRelations = (0, drizzle_orm_1.relations)(exports.llmPrompts, ({ one }) => ({
    createdBy: one(schema_1.users, {
        fields: [exports.llmPrompts.createdById],
        references: [schema_1.users.id]
    })
}));
// Conversation relations
exports.conversationRelations = (0, drizzle_orm_1.relations)(exports.llmConversations, ({ one, many }) => ({
    user: one(schema_1.users, {
        fields: [exports.llmConversations.userId],
        references: [schema_1.users.id]
    }),
    messages: many(exports.llmMessages)
}));
// Message relations
exports.messageRelations = (0, drizzle_orm_1.relations)(exports.llmMessages, ({ one }) => ({
    conversation: one(exports.llmConversations, {
        fields: [exports.llmMessages.conversationId],
        references: [exports.llmConversations.id]
    }),
    user: one(schema_1.users, {
        fields: [exports.llmMessages.userId],
        references: [schema_1.users.id]
    })
}));
// Fine-tuning job relations
exports.fineTuningRelations = (0, drizzle_orm_1.relations)(exports.llmFineTuningJobs, ({ one }) => ({
    user: one(schema_1.users, {
        fields: [exports.llmFineTuningJobs.userId],
        references: [schema_1.users.id]
    })
}));
// Sacred pattern relations
exports.sacredPatternRelations = (0, drizzle_orm_1.relations)(exports.sacredPatternRecords, ({ one }) => ({
    user: one(schema_1.users, {
        fields: [exports.sacredPatternRecords.userId],
        references: [schema_1.users.id]
    })
}));
// Zod Schemas for validation
exports.insertLlmPromptSchema = (0, drizzle_zod_1.createInsertSchema)(exports.llmPrompts);
exports.selectLlmPromptSchema = (0, drizzle_zod_1.createSelectSchema)(exports.llmPrompts);
exports.insertLlmConversationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.llmConversations);
exports.selectLlmConversationSchema = (0, drizzle_zod_1.createSelectSchema)(exports.llmConversations);
exports.insertLlmMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.llmMessages);
exports.selectLlmMessageSchema = (0, drizzle_zod_1.createSelectSchema)(exports.llmMessages);
exports.insertLlmFineTuningJobSchema = (0, drizzle_zod_1.createInsertSchema)(exports.llmFineTuningJobs);
exports.selectLlmFineTuningJobSchema = (0, drizzle_zod_1.createSelectSchema)(exports.llmFineTuningJobs);
exports.insertSacredPatternRecordSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sacredPatternRecords);
exports.selectSacredPatternRecordSchema = (0, drizzle_zod_1.createSelectSchema)(exports.sacredPatternRecords);
