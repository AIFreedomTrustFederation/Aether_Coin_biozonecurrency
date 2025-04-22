"use strict";
/**
 * API Key Schema
 *
 * This schema defines the structure for API keys, their usage tracking,
 * and active connections. It enables the FractalCoin API gateway to
 * authenticate and manage external service connections.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertApiKeyConnectionSchema = exports.insertApiKeyUsageSchema = exports.insertApiKeySchema = exports.apiKeyConnections = exports.apiKeyUsage = exports.apiKeys = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const schema_proxy_1 = require("./schema-proxy");
/**
 * API Keys table for authenticating external applications to FractalCoin services
 */
exports.apiKeys = (0, pg_core_1.pgTable)("api_keys", {
    id: (0, pg_core_1.integer)("id").primaryKey().notNull(),
    userId: (0, pg_core_1.integer)("user_id").references(() => schema_proxy_1.users.id).notNull(),
    key: (0, pg_core_1.text)("key").notNull(),
    email: (0, pg_core_1.text)("email").notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"),
    revokedAt: (0, pg_core_1.timestamp)("revoked_at"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    lastUsedAt: (0, pg_core_1.timestamp)("last_used_at"),
    scopes: (0, pg_core_1.text)("scopes").array().default([]).notNull(),
}, (table) => {
    return {
        keyIdx: (0, pg_core_1.uniqueIndex)("key_idx").on(table.key),
        emailIdx: (0, pg_core_1.uniqueIndex)("email_idx").on(table.email),
    };
});
/**
 * API Key Usage tracking for monitoring and rate limiting
 */
exports.apiKeyUsage = (0, pg_core_1.pgTable)("api_key_usage", {
    id: (0, pg_core_1.integer)("id").primaryKey().notNull(),
    keyId: (0, pg_core_1.integer)("key_id").references(() => exports.apiKeys.id).notNull(),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow().notNull(),
    endpoint: (0, pg_core_1.text)("endpoint").notNull(),
    ipAddress: (0, pg_core_1.text)("ip_address"),
    responseCode: (0, pg_core_1.integer)("response_code"),
    responseTime: (0, pg_core_1.integer)("response_time") // in milliseconds
});
/**
 * API Key Connections to track real-time services
 * (e.g., websocket connections, streaming services)
 */
exports.apiKeyConnections = (0, pg_core_1.pgTable)("api_key_connections", {
    id: (0, pg_core_1.integer)("id").primaryKey().notNull(),
    keyId: (0, pg_core_1.integer)("key_id").references(() => exports.apiKeys.id).notNull(),
    serviceType: (0, pg_core_1.text)("service_type").notNull(), // e.g., 'websocket', 'fractal-node', 'fractal-storage'
    connectionId: (0, pg_core_1.text)("connection_id").notNull(),
    connectedAt: (0, pg_core_1.timestamp)("connected_at").defaultNow().notNull(),
    disconnectedAt: (0, pg_core_1.timestamp)("disconnected_at"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    lastPingAt: (0, pg_core_1.timestamp)("last_ping_at").defaultNow().notNull(),
    metadata: (0, pg_core_1.json)("metadata").default({}).notNull()
}, (table) => {
    return {
        connectionIdx: (0, pg_core_1.uniqueIndex)("connection_idx").on(table.connectionId),
    };
});
/**
 * Schema for inserting a new API key
 */
exports.insertApiKeySchema = (0, drizzle_zod_1.createInsertSchema)(exports.apiKeys).omit({
    id: true,
    createdAt: true,
    lastUsedAt: true,
});
/**
 * Schema for inserting API key usage
 */
exports.insertApiKeyUsageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apiKeyUsage).omit({
    id: true,
    timestamp: true
});
/**
 * Schema for inserting API key connections
 */
exports.insertApiKeyConnectionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.apiKeyConnections).omit({
    id: true,
    connectedAt: true,
    lastPingAt: true
});
