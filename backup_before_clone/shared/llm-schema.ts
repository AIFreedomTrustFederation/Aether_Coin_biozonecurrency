/**
 * LLM Schema
 * 
 * This schema defines the database tables related to LLM functionality
 * in the AetherCoin ecosystem.
 */

import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

/**
 * LLM Prompts - Stores predefined prompts for various LLM operations
 */
export const llmPrompts = pgTable("llm_prompts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  promptTemplate: text("prompt_template").notNull(),
  category: text("category"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdById: integer("created_by_id").references(() => users.id)
});

/**
 * LLM Conversations - Tracks ongoing conversations with the LLM
 */
export const llmConversations = pgTable("llm_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
  tags: text("tags").array(),
  metadata: jsonb("metadata")
});

/**
 * LLM Messages - Individual messages in LLM conversations
 */
export const llmMessages = pgTable("llm_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => llmConversations.id).notNull(),
  userId: integer("user_id").references(() => users.id),
  role: text("role").notNull().default("user"), // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  totalTokens: integer("total_tokens"),
  metadata: jsonb("metadata")
});

/**
 * LLM Fine-tuning Jobs - Tracks model fine-tuning operations
 */
export const llmFineTuningJobs = pgTable("llm_fine_tuning_jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  baseModel: text("base_model").notNull(),
  fineTunedModelName: text("fine_tuned_model_name"),
  status: text("status").notNull(), // 'queued', 'processing', 'succeeded', 'failed'
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  trainingFileUrl: text("training_file_url"),
  validationFileUrl: text("validation_file_url"),
  epochs: integer("epochs"),
  batchSize: integer("batch_size"),
  learningRate: text("learning_rate"),
  parameters: jsonb("parameters"),
  metrics: jsonb("metrics")
});

/**
 * Sacred Pattern Records - Stores sacred pattern analyses from the LLM
 */
export const sacredPatternRecords = pgTable("sacred_pattern_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  input: text("input").notNull(),
  analysis: jsonb("analysis").notNull(),
  divinePrinciple: text("divine_principle"),
  goldenRatioAlignment: integer("golden_ratio_alignment"),
  temporalHarmonicScore: integer("temporal_harmonic_score"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  category: text("category"),
  linkedEntityType: text("linked_entity_type"),
  linkedEntityId: integer("linked_entity_id")
});

// Relations

// Prompt relations
export const promptRelations = relations(llmPrompts, ({ one }) => ({
  createdBy: one(users, {
    fields: [llmPrompts.createdById],
    references: [users.id]
  })
}));

// Conversation relations
export const conversationRelations = relations(llmConversations, ({ one, many }) => ({
  user: one(users, {
    fields: [llmConversations.userId],
    references: [users.id]
  }),
  messages: many(llmMessages)
}));

// Message relations
export const messageRelations = relations(llmMessages, ({ one }) => ({
  conversation: one(llmConversations, {
    fields: [llmMessages.conversationId],
    references: [llmConversations.id]
  }),
  user: one(users, {
    fields: [llmMessages.userId],
    references: [users.id]
  })
}));

// Fine-tuning job relations
export const fineTuningRelations = relations(llmFineTuningJobs, ({ one }) => ({
  user: one(users, {
    fields: [llmFineTuningJobs.userId],
    references: [users.id]
  })
}));

// Sacred pattern relations
export const sacredPatternRelations = relations(sacredPatternRecords, ({ one }) => ({
  user: one(users, {
    fields: [sacredPatternRecords.userId],
    references: [users.id]
  })
}));

// Zod Schemas for validation

export const insertLlmPromptSchema = createInsertSchema(llmPrompts);
export const selectLlmPromptSchema = createSelectSchema(llmPrompts);

export const insertLlmConversationSchema = createInsertSchema(llmConversations);
export const selectLlmConversationSchema = createSelectSchema(llmConversations);

export const insertLlmMessageSchema = createInsertSchema(llmMessages);
export const selectLlmMessageSchema = createSelectSchema(llmMessages);

export const insertLlmFineTuningJobSchema = createInsertSchema(llmFineTuningJobs);
export const selectLlmFineTuningJobSchema = createSelectSchema(llmFineTuningJobs);

export const insertSacredPatternRecordSchema = createInsertSchema(sacredPatternRecords);
export const selectSacredPatternRecordSchema = createSelectSchema(sacredPatternRecords);

// Type definitions
export type LlmPrompt = z.infer<typeof selectLlmPromptSchema>;
export type InsertLlmPrompt = z.infer<typeof insertLlmPromptSchema>;

export type LlmConversation = z.infer<typeof selectLlmConversationSchema>;
export type InsertLlmConversation = z.infer<typeof insertLlmConversationSchema>;

export type LlmMessage = z.infer<typeof selectLlmMessageSchema>;
export type InsertLlmMessage = z.infer<typeof insertLlmMessageSchema>;

export type LlmFineTuningJob = z.infer<typeof selectLlmFineTuningJobSchema>;
export type InsertLlmFineTuningJob = z.infer<typeof insertLlmFineTuningJobSchema>;

export type SacredPatternRecord = z.infer<typeof selectSacredPatternRecordSchema>;
export type InsertSacredPatternRecord = z.infer<typeof insertSacredPatternRecordSchema>;