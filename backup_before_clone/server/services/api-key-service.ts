/**
 * API Key Service
 * 
 * This service manages API keys for external applications to access
 * the FractalCoin API. It provides functionality for creating, validating,
 * revoking, and tracking API keys.
 */

import { v4 as uuidv4 } from "uuid";
import { db } from "../db";
import { 
  apiKeys, 
  apiKeyUsage, 
  apiKeyConnections,
  type ApiKey,
  type InsertApiKey,
  type ApiKeyUsage,
  type ApiKeyConnection,
  type InsertApiKeyConnection
} from "@shared/api-key-schema";
import { eq, and, desc, sql, isNull } from "drizzle-orm";

class ApiKeyService {
  /**
   * Create a new API key for a user
   * @param data API key data
   * @returns The created API key
   */
  async createApiKey(data: InsertApiKey): Promise<ApiKey> {
    // Generate unique API key based on UUID
    const key = `frac_${uuidv4().replace(/-/g, '')}`;
    
    // Insert the new API key
    const [apiKey] = await db.insert(apiKeys)
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
  async getApiKeyById(id: number): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select()
      .from(apiKeys)
      .where(eq(apiKeys.id, id));
    
    return apiKey;
  }
  
  /**
   * Get all API keys for a user
   * @param userId User ID
   * @returns Array of API keys
   */
  async getApiKeysByUserId(userId: number): Promise<ApiKey[]> {
    return db.select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  }
  
  /**
   * Validate an API key
   * @param key API key string
   * @returns API key details if valid, undefined if invalid
   */
  async validateApiKey(key: string): Promise<ApiKey | undefined> {
    // Get the API key
    const [apiKey] = await db.select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.key, key),
          eq(apiKeys.isActive, true),
          isNull(apiKeys.revokedAt)
        )
      );
    
    if (!apiKey) {
      return undefined;
    }
    
    // Check if expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return undefined;
    }
    
    // Update last used timestamp
    await db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKey.id));
    
    return apiKey;
  }
  
  /**
   * Revoke an API key
   * @param id API key ID
   * @returns The revoked API key
   */
  async revokeApiKey(id: number): Promise<ApiKey> {
    // Update the API key
    const [updatedKey] = await db.update(apiKeys)
      .set({ 
        isActive: false,
        revokedAt: new Date()
      })
      .where(eq(apiKeys.id, id))
      .returning();
    
    // Terminate all active connections for this key
    await db.update(apiKeyConnections)
      .set({
        isActive: false,
        disconnectedAt: new Date()
      })
      .where(
        and(
          eq(apiKeyConnections.keyId, id),
          eq(apiKeyConnections.isActive, true)
        )
      );
    
    return updatedKey;
  }
  
  /**
   * Track API key usage
   * @param keyId API key ID
   * @param endpoint Endpoint that was accessed
   * @param ipAddress IP address that made the request
   * @returns The created usage record
   */
  async trackApiKeyUsage(
    keyId: number, 
    endpoint: string, 
    ipAddress?: string
  ): Promise<ApiKeyUsage> {
    const [usage] = await db.insert(apiKeyUsage)
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
  async getApiKeyUsage(keyId: number): Promise<ApiKeyUsage[]> {
    return db.select()
      .from(apiKeyUsage)
      .where(eq(apiKeyUsage.keyId, keyId))
      .orderBy(desc(apiKeyUsage.timestamp));
  }
  
  /**
   * Record a new connection for an API key
   * @param data Connection data
   * @returns The created connection
   */
  async recordConnection(data: InsertApiKeyConnection): Promise<ApiKeyConnection> {
    const [connection] = await db.insert(apiKeyConnections)
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
  async getApiKeyConnections(
    keyId: number, 
    activeOnly: boolean = true
  ): Promise<ApiKeyConnection[]> {
    let query = db.select()
      .from(apiKeyConnections)
      .where(eq(apiKeyConnections.keyId, keyId));
    
    if (activeOnly) {
      query = query.where(eq(apiKeyConnections.isActive, true));
    }
    
    return query.orderBy(desc(apiKeyConnections.lastPingAt));
  }
  
  /**
   * Update the last ping time for a connection
   * @param connectionId Connection ID
   * @returns True if the connection was updated
   */
  async updateConnectionPing(connectionId: string): Promise<boolean> {
    const result = await db.update(apiKeyConnections)
      .set({ lastPingAt: new Date() })
      .where(
        and(
          eq(apiKeyConnections.connectionId, connectionId),
          eq(apiKeyConnections.isActive, true)
        )
      );
    
    return result.rowCount > 0;
  }
  
  /**
   * Terminate a connection
   * @param connectionId Connection ID
   * @returns True if the connection was terminated
   */
  async terminateConnection(connectionId: string): Promise<boolean> {
    const result = await db.update(apiKeyConnections)
      .set({
        isActive: false,
        disconnectedAt: new Date()
      })
      .where(
        and(
          eq(apiKeyConnections.connectionId, connectionId),
          eq(apiKeyConnections.isActive, true)
        )
      );
    
    return result.rowCount > 0;
  }
  
  /**
   * Find inactive connections (no ping for X minutes) and terminate them
   * @param minutes Minutes of inactivity before terminating
   * @returns Number of connections terminated
   */
  async cleanupInactiveConnections(minutes: number = 15): Promise<number> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - minutes);
    
    const result = await db.update(apiKeyConnections)
      .set({
        isActive: false,
        disconnectedAt: new Date()
      })
      .where(
        and(
          eq(apiKeyConnections.isActive, true),
          sql`${apiKeyConnections.lastPingAt} < ${cutoffTime}`
        )
      );
    
    return result.rowCount;
  }
}

export const apiKeyService = new ApiKeyService();