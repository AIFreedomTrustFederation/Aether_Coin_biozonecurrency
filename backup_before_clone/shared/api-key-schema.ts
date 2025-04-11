/**
 * API Key Schema
 * 
 * This schema defines the structure for API keys, their usage tracking,
 * and active connections. It enables the FractalCoin API gateway to
 * authenticate and manage external service connections.
 */

import { text, integer, timestamp, boolean, pgTable, uniqueIndex, json, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema-proxy";

/**
 * API Keys table for authenticating external applications to FractalCoin services
 */
export const apiKeys = pgTable("api_keys", {
  id: integer("id").primaryKey().notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  key: text("key").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  revokedAt: timestamp("revoked_at"),
  isActive: boolean("is_active").default(true).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  scopes: text("scopes").array().default([]).notNull(),
}, (table) => {
  return {
    keyIdx: uniqueIndex("key_idx").on(table.key),
    emailIdx: uniqueIndex("email_idx").on(table.email),
  };
});

/**
 * API Key Usage tracking for monitoring and rate limiting
 */
export const apiKeyUsage = pgTable("api_key_usage", {
  id: integer("id").primaryKey().notNull(),
  keyId: integer("key_id").references(() => apiKeys.id).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  endpoint: text("endpoint").notNull(),
  ipAddress: text("ip_address"),
  responseCode: integer("response_code"),
  responseTime: integer("response_time") // in milliseconds
});

/**
 * API Key Connections to track real-time services
 * (e.g., websocket connections, streaming services)
 */
export const apiKeyConnections = pgTable("api_key_connections", {
  id: integer("id").primaryKey().notNull(),
  keyId: integer("key_id").references(() => apiKeys.id).notNull(),
  serviceType: text("service_type").notNull(), // e.g., 'websocket', 'fractal-node', 'fractal-storage'
  connectionId: text("connection_id").notNull(),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
  disconnectedAt: timestamp("disconnected_at"),
  isActive: boolean("is_active").default(true).notNull(),
  lastPingAt: timestamp("last_ping_at").defaultNow().notNull(),
  metadata: json("metadata").default({}).notNull()
}, (table) => {
  return {
    connectionIdx: uniqueIndex("connection_idx").on(table.connectionId),
  };
});

/**
 * Schema for inserting a new API key
 */
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});

/**
 * Schema for inserting API key usage
 */
export const insertApiKeyUsageSchema = createInsertSchema(apiKeyUsage).omit({
  id: true,
  timestamp: true
});

/**
 * Schema for inserting API key connections
 */
export const insertApiKeyConnectionSchema = createInsertSchema(apiKeyConnections).omit({
  id: true,
  connectedAt: true,
  lastPingAt: true
});

/**
 * Type definitions for database operations
 */
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type ApiKeyUsage = typeof apiKeyUsage.$inferSelect;
export type InsertApiKeyUsage = z.infer<typeof insertApiKeyUsageSchema>;

export type ApiKeyConnection = typeof apiKeyConnections.$inferSelect;
export type InsertApiKeyConnection = z.infer<typeof insertApiKeyConnectionSchema>;