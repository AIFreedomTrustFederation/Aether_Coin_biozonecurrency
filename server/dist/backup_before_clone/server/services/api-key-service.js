"use strict";
/**
 * API Key Service
 *
 * This service manages API keys for external applications to access
 * the FractalCoin API. It provides functionality for creating, validating,
 * revoking, and tracking API keys.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyService = void 0;
const uuid_1 = require("uuid");
const db_1 = require("../db");
const api_key_schema_1 = require("@shared/api-key-schema");
const drizzle_orm_1 = require("drizzle-orm");
class ApiKeyService {
    /**
     * Create a new API key for a user
     * @param data API key data
     * @returns The created API key
     */
    async createApiKey(data) {
        // Generate unique API key based on UUID
        const key = `frac_${(0, uuid_1.v4)().replace(/-/g, '')}`;
        // Insert the new API key
        const [apiKey] = await db_1.db.insert(api_key_schema_1.apiKeys)
            .values({
            ...data,
            key,
        })
            .returning();
        return apiKey;
    }
    /**
     * Get an API key by its ID
     * @param id API key ID
     * @returns API key or undefined if not found
     */
    async getApiKeyById(id) {
        const [apiKey] = await db_1.db.select()
            .from(api_key_schema_1.apiKeys)
            .where((0, drizzle_orm_1.eq)(api_key_schema_1.apiKeys.id, id));
        return apiKey;
    }
    /**
     * Get all API keys for a user
     * @param userId User ID
     * @returns Array of API keys
     */
    async getApiKeysByUserId(userId) {
        return db_1.db.select()
            .from(api_key_schema_1.apiKeys)
            .where((0, drizzle_orm_1.eq)(api_key_schema_1.apiKeys.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(api_key_schema_1.apiKeys.createdAt));
    }
    /**
     * Validate an API key
     * @param key API key string
     * @returns API key details if valid, undefined if invalid
     */
    async validateApiKey(key) {
        // Get the API key
        const [apiKey] = await db_1.db.select()
            .from(api_key_schema_1.apiKeys)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(api_key_schema_1.apiKeys.key, key), (0, drizzle_orm_1.eq)(api_key_schema_1.apiKeys.isActive, true), (0, drizzle_orm_1.isNull)(api_key_schema_1.apiKeys.revokedAt)));
        if (!apiKey) {
            return undefined;
        }
        // Check if expired
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            return undefined;
        }
        // Update last used timestamp
        await db_1.db.update(api_key_schema_1.apiKeys)
            .set({ lastUsedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(api_key_schema_1.apiKeys.id, apiKey.id));
        return apiKey;
    }
    /**
     * Revoke an API key
     * @param id API key ID
     * @returns The revoked API key
     */
    async revokeApiKey(id) {
        // Update the API key
        const [updatedKey] = await db_1.db.update(api_key_schema_1.apiKeys)
            .set({
            isActive: false,
            revokedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(api_key_schema_1.apiKeys.id, id))
            .returning();
        // Terminate all active connections for this key
        await db_1.db.update(api_key_schema_1.apiKeyConnections)
            .set({
            isActive: false,
            disconnectedAt: new Date()
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(api_key_schema_1.apiKeyConnections.keyId, id), (0, drizzle_orm_1.eq)(api_key_schema_1.apiKeyConnections.isActive, true)));
        return updatedKey;
    }
    /**
     * Track API key usage
     * @param keyId API key ID
     * @param endpoint Endpoint that was accessed
     * @param ipAddress IP address that made the request
     * @returns The created usage record
     */
    async trackApiKeyUsage(keyId, endpoint, ipAddress) {
        const [usage] = await db_1.db.insert(api_key_schema_1.apiKeyUsage)
            .values({
            keyId,
            endpoint,
            ipAddress
        })
            .returning();
        return usage;
    }
    /**
     * Get usage statistics for an API key
     * @param keyId API key ID
     * @returns Array of usage records
     */
    async getApiKeyUsage(keyId) {
        return db_1.db.select()
            .from(api_key_schema_1.apiKeyUsage)
            .where((0, drizzle_orm_1.eq)(api_key_schema_1.apiKeyUsage.keyId, keyId))
            .orderBy((0, drizzle_orm_1.desc)(api_key_schema_1.apiKeyUsage.timestamp));
    }
    /**
     * Record a new connection for an API key
     * @param data Connection data
     * @returns The created connection
     */
    async recordConnection(data) {
        const [connection] = await db_1.db.insert(api_key_schema_1.apiKeyConnections)
            .values(data)
            .returning();
        return connection;
    }
    /**
     * Get all connections for an API key
     * @param keyId API key ID
     * @param activeOnly Only return active connections
     * @returns Array of connections
     */
    async getApiKeyConnections(keyId, activeOnly = true) {
        let query = db_1.db.select()
            .from(api_key_schema_1.apiKeyConnections)
            .where((0, drizzle_orm_1.eq)(api_key_schema_1.apiKeyConnections.keyId, keyId));
        if (activeOnly) {
            query = query.where((0, drizzle_orm_1.eq)(api_key_schema_1.apiKeyConnections.isActive, true));
        }
        return query.orderBy((0, drizzle_orm_1.desc)(api_key_schema_1.apiKeyConnections.lastPingAt));
    }
    /**
     * Update the last ping time for a connection
     * @param connectionId Connection ID
     * @returns True if the connection was updated
     */
    async updateConnectionPing(connectionId) {
        const result = await db_1.db.update(api_key_schema_1.apiKeyConnections)
            .set({ lastPingAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(api_key_schema_1.apiKeyConnections.connectionId, connectionId), (0, drizzle_orm_1.eq)(api_key_schema_1.apiKeyConnections.isActive, true)));
        return result.rowCount > 0;
    }
    /**
     * Terminate a connection
     * @param connectionId Connection ID
     * @returns True if the connection was terminated
     */
    async terminateConnection(connectionId) {
        const result = await db_1.db.update(api_key_schema_1.apiKeyConnections)
            .set({
            isActive: false,
            disconnectedAt: new Date()
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(api_key_schema_1.apiKeyConnections.connectionId, connectionId), (0, drizzle_orm_1.eq)(api_key_schema_1.apiKeyConnections.isActive, true)));
        return result.rowCount > 0;
    }
    /**
     * Find inactive connections (no ping for X minutes) and terminate them
     * @param minutes Minutes of inactivity before terminating
     * @returns Number of connections terminated
     */
    async cleanupInactiveConnections(minutes = 15) {
        const cutoffTime = new Date();
        cutoffTime.setMinutes(cutoffTime.getMinutes() - minutes);
        const result = await db_1.db.update(api_key_schema_1.apiKeyConnections)
            .set({
            isActive: false,
            disconnectedAt: new Date()
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(api_key_schema_1.apiKeyConnections.isActive, true), (0, drizzle_orm_1.sql) `${api_key_schema_1.apiKeyConnections.lastPingAt} < ${cutoffTime}`));
        return result.rowCount;
    }
}
exports.apiKeyService = new ApiKeyService();
