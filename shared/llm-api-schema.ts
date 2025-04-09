import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './schema';

// LLM API key table
export const llmApiKeys = pgTable('llm_api_keys', {
  id: integer('id').primaryKey().notNull(),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
  revokedAt: timestamp('revoked_at'),
  lastUsedAt: timestamp('last_used_at'),
  modelAccessLevel: text('model_access_level').default('standard').notNull(), // standard, advanced, quantum
  usageLimit: integer('usage_limit'), // null for unlimited
  usageCount: integer('usage_count').default(0).notNull(),
  callsPerMinuteLimit: integer('calls_per_minute').default(60).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
});

// LLM API key connections (for active sessions)
export const llmApiConnections = pgTable('llm_api_connections', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  keyId: integer('key_id').references(() => llmApiKeys.id).notNull(),
  connectionId: text('connection_id').notNull(),
  serviceType: text('service_type').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  connectedAt: timestamp('connected_at').defaultNow().notNull(),
  lastPingAt: timestamp('last_ping_at').defaultNow().notNull(),
  disconnectedAt: timestamp('disconnected_at'),
  sessionData: text('session_data'), // JSON stringified data
});

// LLM API usage logs
export const llmApiUsage = pgTable('llm_api_usage', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  keyId: integer('key_id').references(() => llmApiKeys.id).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  endpoint: text('endpoint').notNull(),
  modelUsed: text('model_used').notNull(),
  promptTokens: integer('prompt_tokens').notNull(),
  completionTokens: integer('completion_tokens').notNull(),
  totalTokens: integer('total_tokens').notNull(),
  duration: integer('duration_ms'), // in milliseconds
  ipAddress: text('ip_address'),
  responseCode: integer('response_code'),
  errorMessage: text('error_message'),
  requestId: text('request_id'),
});

// LLM Prompt templates for specific purposes
export const llmPromptTemplates = pgTable('llm_prompt_templates', {
  id: integer('id').primaryKey().notNull(),
  name: text('name').notNull(),
  description: text('description'),
  templateText: text('template_text').notNull(),
  createdBy: integer('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  category: text('category').notNull(),
  tags: text('tags').array(),
  isPublic: boolean('is_public').default(false).notNull(),
  version: integer('version').default(1).notNull(),
  modelRecommendation: text('model_recommendation'),
});

// Relations
export const llmApiKeysRelations = relations(llmApiKeys, ({ one, many }) => ({
  user: one(users, {
    fields: [llmApiKeys.userId],
    references: [users.id],
  }),
  connections: many(llmApiConnections),
  usageLogs: many(llmApiUsage),
}));

export const llmApiConnectionsRelations = relations(llmApiConnections, ({ one }) => ({
  apiKey: one(llmApiKeys, {
    fields: [llmApiConnections.keyId],
    references: [llmApiKeys.id],
  }),
}));

export const llmApiUsageRelations = relations(llmApiUsage, ({ one }) => ({
  apiKey: one(llmApiKeys, {
    fields: [llmApiUsage.keyId],
    references: [llmApiKeys.id],
  }),
}));

export const llmPromptTemplatesRelations = relations(llmPromptTemplates, ({ one }) => ({
  creator: one(users, {
    fields: [llmPromptTemplates.createdBy],
    references: [users.id],
  }),
}));

// Schemas for inserting data
export const insertLlmApiKeySchema = createInsertSchema(llmApiKeys)
  .omit({ id: true, createdAt: true, lastUsedAt: true, usageCount: true });

export const insertLlmApiConnectionSchema = createInsertSchema(llmApiConnections)
  .omit({ id: true, connectedAt: true, lastPingAt: true });

export const insertLlmApiUsageSchema = createInsertSchema(llmApiUsage)
  .omit({ id: true, timestamp: true });

export const insertLlmPromptTemplateSchema = createInsertSchema(llmPromptTemplates)
  .omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type LlmApiKey = typeof llmApiKeys.$inferSelect;
export type InsertLlmApiKey = z.infer<typeof insertLlmApiKeySchema>;

export type LlmApiConnection = typeof llmApiConnections.$inferSelect;
export type InsertLlmApiConnection = z.infer<typeof insertLlmApiConnectionSchema>;

export type LlmApiUsage = typeof llmApiUsage.$inferSelect;
export type InsertLlmApiUsage = z.infer<typeof insertLlmApiUsageSchema>;

export type LlmPromptTemplate = typeof llmPromptTemplates.$inferSelect;
export type InsertLlmPromptTemplate = z.infer<typeof insertLlmPromptTemplateSchema>;

// Model access level options for type safety
export const modelAccessLevels = ['standard', 'advanced', 'quantum'] as const;
export type ModelAccessLevel = typeof modelAccessLevels[number];