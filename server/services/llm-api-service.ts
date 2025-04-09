import { randomBytes, createHash } from 'crypto';
import { 
  LlmApiKey, 
  InsertLlmApiKey, 
  LlmApiConnection,
  LlmApiUsage,
  ModelAccessLevel
} from '@shared/llm-api-schema';
import { db } from '../db';
import { llmApiKeys, llmApiConnections, llmApiUsage } from '@shared/llm-api-schema';
import { eq, and, isNull, gte, or } from 'drizzle-orm';
import { StorageWrapper } from '../storage-wrapper';

class LlmApiService {
  private storageWrapper: StorageWrapper;

  constructor(storageWrapper: StorageWrapper) {
    this.storageWrapper = storageWrapper;
  }

  /**
   * Generate a new LLM API key with secure cryptography
   * The key follows a format similar to sk-fractalllm-xxxxx where xxxxx is a secure token
   */
  private generateApiKey(): string {
    const prefix = 'sk-fractalllm-';
    const randomBytesBuffer = randomBytes(32);
    const hash = createHash('sha256').update(randomBytesBuffer).digest('hex');
    const token = hash.substring(0, 40); // Take first 40 chars for readability
    return `${prefix}${token}`;
  }

  /**
   * Create a new LLM API key for a user
   * @param data The key data to insert
   * @returns The created API key
   */
  async createApiKey(data: Omit<InsertLlmApiKey, 'key'>): Promise<LlmApiKey> {
    const key = this.generateApiKey();
    
    const [newApiKey] = await db.insert(llmApiKeys)
      .values({ ...data, key })
      .returning();
    
    return newApiKey;
  }

  /**
   * Get all API keys for a user
   * @param userId The user ID
   * @returns Array of API keys belonging to the user
   */
  async getApiKeysByUserId(userId: number): Promise<LlmApiKey[]> {
    return db.select().from(llmApiKeys)
      .where(eq(llmApiKeys.userId, userId));
  }

  /**
   * Get all API keys (admin only)
   * @returns Array of all API keys in the system
   */
  async getAllApiKeys(): Promise<LlmApiKey[]> {
    return db.select().from(llmApiKeys);
  }

  /**
   * Get a specific API key by ID
   * @param id The API key ID
   * @returns The API key if found
   */
  async getApiKeyById(id: number): Promise<LlmApiKey | undefined> {
    const [apiKey] = await db.select().from(llmApiKeys)
      .where(eq(llmApiKeys.id, id));
    
    return apiKey;
  }

  /**
   * Get a specific API key by the actual key string
   * @param keyString The API key string
   * @returns The API key if found and active
   */
  async getApiKeyByKeyString(keyString: string): Promise<LlmApiKey | undefined> {
    const [apiKey] = await db.select().from(llmApiKeys)
      .where(
        and(
          eq(llmApiKeys.key, keyString),
          eq(llmApiKeys.isActive, true),
          or(
            isNull(llmApiKeys.expiresAt),
            gte(llmApiKeys.expiresAt, new Date())
          )
        )
      );
    
    return apiKey;
  }

  /**
   * Revoke an API key
   * @param id The API key ID
   * @returns The updated API key
   */
  async revokeApiKey(id: number): Promise<LlmApiKey | undefined> {
    const [updatedApiKey] = await db.update(llmApiKeys)
      .set({ 
        isActive: false,
        revokedAt: new Date()
      })
      .where(eq(llmApiKeys.id, id))
      .returning();
    
    return updatedApiKey;
  }

  /**
   * Update the access level of an API key
   * @param id The API key ID
   * @param accessLevel The new access level
   * @returns The updated API key
   */
  async updateApiKeyAccessLevel(id: number, accessLevel: ModelAccessLevel): Promise<LlmApiKey | undefined> {
    const [updatedApiKey] = await db.update(llmApiKeys)
      .set({ modelAccessLevel: accessLevel })
      .where(eq(llmApiKeys.id, id))
      .returning();
    
    return updatedApiKey;
  }

  /**
   * Update the usage limit of an API key
   * @param id The API key ID
   * @param usageLimit The new usage limit (null for unlimited)
   * @returns The updated API key
   */
  async updateApiKeyUsageLimit(id: number, usageLimit: number | null): Promise<LlmApiKey | undefined> {
    const [updatedApiKey] = await db.update(llmApiKeys)
      .set({ usageLimit })
      .where(eq(llmApiKeys.id, id))
      .returning();
    
    return updatedApiKey;
  }

  /**
   * Record API key usage
   * @param keyId The API key ID
   * @param usage The usage data to record
   * @returns The created usage record
   */
  async recordApiUsage(keyId: number, usage: Omit<LlmApiUsage, 'id' | 'keyId' | 'timestamp'>): Promise<LlmApiUsage> {
    // Update last used timestamp on the API key
    await db.update(llmApiKeys)
      .set({ 
        lastUsedAt: new Date(),
        usageCount: db.sql`${llmApiKeys.usageCount} + 1`
      })
      .where(eq(llmApiKeys.id, keyId));
    
    // Insert usage record
    const [usageRecord] = await db.insert(llmApiUsage)
      .values({
        keyId,
        ...usage,
        timestamp: new Date()
      })
      .returning();
    
    return usageRecord;
  }

  /**
   * Get usage statistics for an API key
   * @param keyId The API key ID
   * @param limit The maximum number of records to return
   * @returns Array of usage records
   */
  async getApiKeyUsage(keyId: number, limit: number = 100): Promise<LlmApiUsage[]> {
    return db.select().from(llmApiUsage)
      .where(eq(llmApiUsage.keyId, keyId))
      .orderBy(db.sql`${llmApiUsage.timestamp} DESC`)
      .limit(limit);
  }

  /**
   * Create a new API connection
   * @param data The connection data
   * @returns The created connection
   */
  async createApiConnection(data: Omit<LlmApiConnection, 'id' | 'connectedAt' | 'lastPingAt'>): Promise<LlmApiConnection> {
    const [connection] = await db.insert(llmApiConnections)
      .values({
        ...data,
        connectedAt: new Date(),
        lastPingAt: new Date()
      })
      .returning();
    
    return connection;
  }

  /**
   * Get active connections for an API key
   * @param keyId The API key ID
   * @returns Array of active connections
   */
  async getActiveConnections(keyId: number): Promise<LlmApiConnection[]> {
    return db.select().from(llmApiConnections)
      .where(
        and(
          eq(llmApiConnections.keyId, keyId),
          isNull(llmApiConnections.disconnectedAt)
        )
      );
  }

  /**
   * Terminate a connection
   * @param connectionId The connection ID
   * @returns The updated connection
   */
  async terminateConnection(connectionId: string): Promise<LlmApiConnection | undefined> {
    const [connection] = await db.update(llmApiConnections)
      .set({ disconnectedAt: new Date() })
      .where(eq(llmApiConnections.connectionId, connectionId))
      .returning();
    
    return connection;
  }

  /**
   * Update connection last ping time
   * @param connectionId The connection ID
   * @returns True if successful
   */
  async updateConnectionPing(connectionId: string): Promise<boolean> {
    const result = await db.update(llmApiConnections)
      .set({ lastPingAt: new Date() })
      .where(eq(llmApiConnections.connectionId, connectionId));
    
    return result.count > 0;
  }

  /**
   * Check if a user has admin access to LLM services
   * @param userId The user ID
   * @returns True if the user has admin access
   */
  async hasLlmAdminAccess(userId: number): Promise<boolean> {
    const user = await this.storageWrapper.getUserById(userId);
    return user?.role === 'admin' && user?.isTrustMember === true;
  }
}

export default LlmApiService;