/**
 * Database Storage Implementation
 * 
 * This class provides a database implementation of the IStorage interface
 * using Drizzle ORM and PostgreSQL.
 */

import { eq, sql, desc, and, isNull } from "drizzle-orm";
import { db } from "./db";
import { IStorage } from "./storage";
import {
  users,
  llmApiKeys,
  llmApiConnections,
  llmApiUsage,
  llmPromptTemplates,
  type User,
  type InsertUser,
  type LlmApiKey,
  type InsertLlmApiKey,
  type LlmApiConnection,
  type InsertLlmApiConnection,
  type LlmApiUsage,
  type InsertLlmApiUsage,
  type LlmPromptTemplate,
  type InsertLlmPromptTemplate
} from "@shared/schema-proxy";

/**
 * DatabaseStorage implements IStorage using PostgreSQL through Drizzle ORM
 * This replaces the MemStorage implementation with a persistent database
 */
export class DatabaseStorage implements IStorage {
  /**
   * Get a user by ID
   * @param id User ID
   * @returns User or undefined if not found
   */
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, id));
    
    return user;
  }

  /**
   * Get a user by ID (alias for getUser)
   * @param id User ID
   * @returns User or undefined if not found
   */
  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id);
  }

  /**
   * Get a user by username
   * @param username Username to look up
   * @returns User or undefined if not found
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.username, username));
    
    return user;
  }

  /**
   * Get a user by email
   * @param email Email to look up
   * @returns User or undefined if not found
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email));
    
    return user;
  }

  /**
   * Get all users
   * @returns Array of all users
   */
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  /**
   * Create a new user
   * @param insertUser User data to insert
   * @returns The created user
   */
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    return user;
  }

  /**
   * Update user's last login time
   * @param id User ID
   * @returns Updated user or undefined if not found
   */
  async updateUserLastLogin(id: number): Promise<User | undefined> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set({ 
          lastLogin: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, id))
        .returning();
      
      return updatedUser;
    } catch (error) {
      console.error(`Error updating last login for user ${id}:`, error);
      // Fall back to just returning the user
      return this.getUser(id);
    }
  }

  /**
   * Check if a user is a trust member
   * @param id User ID
   * @returns Boolean indicating trust membership status
   */
  async isTrustMember(id: number): Promise<boolean> {
    const user = await this.getUser(id);
    return !!user?.isTrustMember;
  }

  /**
   * Get all trust members
   * @returns Array of users who are trust members
   */
  async getTrustMembers(): Promise<User[]> {
    return db.select()
      .from(users)
      .where(eq(users.isTrustMember, true));
  }

  /**
   * Set a user as a trust member
   * @param id User ID
   * @param level Trust membership level
   * @returns Updated user or undefined if not found
   */
  async setUserAsTrustMember(id: number, level: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        isTrustMember: true,
        trustMemberLevel: level,
        trustMemberSince: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  // LLM API Key Methods

  /**
   * Get an LLM API key by ID
   * @param id LLM API key ID
   * @returns LlmApiKey or undefined if not found
   */
  async getLlmApiKey(id: number): Promise<LlmApiKey | undefined> {
    const [apiKey] = await db.select()
      .from(llmApiKeys)
      .where(eq(llmApiKeys.id, id));
    
    return apiKey;
  }

  /**
   * Get an LLM API key by its key string
   * @param key API key string
   * @returns LlmApiKey or undefined if not found
   */
  async getLlmApiKeyByKey(key: string): Promise<LlmApiKey | undefined> {
    const [apiKey] = await db.select()
      .from(llmApiKeys)
      .where(eq(llmApiKeys.key, key));
    
    return apiKey;
  }

  /**
   * Get all LLM API keys belonging to a user
   * @param userId User ID
   * @returns Array of LlmApiKey objects
   */
  async getLlmApiKeysByUserId(userId: number): Promise<LlmApiKey[]> {
    return db.select()
      .from(llmApiKeys)
      .where(and(
        eq(llmApiKeys.userId, userId),
        eq(llmApiKeys.isActive, true),
        isNull(llmApiKeys.revokedAt)
      ));
  }

  /**
   * Create a new LLM API key
   * @param apiKey LLM API key data
   * @returns The created LlmApiKey
   */
  async createLlmApiKey(apiKey: InsertLlmApiKey): Promise<LlmApiKey> {
    const [createdKey] = await db
      .insert(llmApiKeys)
      .values(apiKey)
      .returning();
    
    return createdKey;
  }

  /**
   * Update an LLM API key
   * @param id LLM API key ID
   * @param apiKey Partial LLM API key data
   * @returns The updated LlmApiKey or undefined if not found
   */
  async updateLlmApiKey(id: number, apiKey: Partial<InsertLlmApiKey>): Promise<LlmApiKey | undefined> {
    const [updatedKey] = await db
      .update(llmApiKeys)
      .set(apiKey)
      .where(eq(llmApiKeys.id, id))
      .returning();
    
    return updatedKey;
  }

  /**
   * Revoke an LLM API key
   * @param id LLM API key ID
   * @returns The revoked LlmApiKey or undefined if not found
   */
  async revokeLlmApiKey(id: number): Promise<LlmApiKey | undefined> {
    const [revokedKey] = await db
      .update(llmApiKeys)
      .set({ 
        revokedAt: new Date(),
        isActive: false
      })
      .where(eq(llmApiKeys.id, id))
      .returning();
    
    return revokedKey;
  }

  // LLM API Connection Methods

  /**
   * Get an LLM API connection by ID
   * @param id LLM API connection ID
   * @returns LlmApiConnection or undefined if not found
   */
  async getLlmApiConnection(id: string): Promise<LlmApiConnection | undefined> {
    const [connection] = await db.select()
      .from(llmApiConnections)
      .where(eq(llmApiConnections.id, id));
    
    return connection;
  }

  /**
   * Get all LLM API connections for a key
   * @param keyId LLM API key ID
   * @returns Array of LlmApiConnection objects
   */
  async getLlmApiConnectionsByKeyId(keyId: number): Promise<LlmApiConnection[]> {
    return db.select()
      .from(llmApiConnections)
      .where(and(
        eq(llmApiConnections.keyId, keyId),
        isNull(llmApiConnections.disconnectedAt)
      ));
  }

  /**
   * Create a new LLM API connection
   * @param connection LLM API connection data
   * @returns The created LlmApiConnection
   */
  async createLlmApiConnection(connection: InsertLlmApiConnection): Promise<LlmApiConnection> {
    const [createdConnection] = await db
      .insert(llmApiConnections)
      .values(connection)
      .returning();
    
    return createdConnection;
  }

  /**
   * Update the last ping time for an LLM API connection
   * @param id LLM API connection ID
   * @returns The updated LlmApiConnection or undefined if not found
   */
  async updateLlmApiConnectionLastPing(id: string): Promise<LlmApiConnection | undefined> {
    const [updatedConnection] = await db
      .update(llmApiConnections)
      .set({ lastPingAt: new Date() })
      .where(eq(llmApiConnections.id, id))
      .returning();
    
    return updatedConnection;
  }

  /**
   * Close an LLM API connection
   * @param id LLM API connection ID
   * @returns The closed LlmApiConnection or undefined if not found
   */
  async closeLlmApiConnection(id: string): Promise<LlmApiConnection | undefined> {
    const [closedConnection] = await db
      .update(llmApiConnections)
      .set({ disconnectedAt: new Date() })
      .where(eq(llmApiConnections.id, id))
      .returning();
    
    return closedConnection;
  }

  // LLM API Usage Methods

  /**
   * Get an LLM API usage log by ID
   * @param id LLM API usage log ID
   * @returns LlmApiUsage or undefined if not found
   */
  async getLlmApiUsage(id: string): Promise<LlmApiUsage | undefined> {
    const [usage] = await db.select()
      .from(llmApiUsage)
      .where(eq(llmApiUsage.id, id));
    
    return usage;
  }

  /**
   * Get all LLM API usage logs for a key
   * @param keyId LLM API key ID
   * @param limit Optional limit on number of results
   * @returns Array of LlmApiUsage objects
   */
  async getLlmApiUsageByKeyId(keyId: number, limit?: number): Promise<LlmApiUsage[]> {
    const query = db.select()
      .from(llmApiUsage)
      .where(eq(llmApiUsage.keyId, keyId))
      .orderBy(desc(llmApiUsage.timestamp));
    
    if (limit) {
      query.limit(limit);
    }
    
    return query;
  }

  /**
   * Create a new LLM API usage log
   * @param usage LLM API usage data
   * @returns The created LlmApiUsage
   */
  async createLlmApiUsage(usage: InsertLlmApiUsage): Promise<LlmApiUsage> {
    const [createdUsage] = await db
      .insert(llmApiUsage)
      .values(usage)
      .returning();
    
    return createdUsage;
  }

  /**
   * Get a summary of usage statistics for an LLM API key
   * @param keyId LLM API key ID
   * @returns Usage summary statistics
   */
  async getLlmApiUsageSummary(keyId: number): Promise<{ 
    totalTokens: number, 
    totalRequests: number, 
    averageTokensPerRequest: number,
    successRate: number
  }> {
    // Get the total number of requests
    const [requestsResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(llmApiUsage)
      .where(eq(llmApiUsage.keyId, keyId));
    
    const totalRequests = requestsResult?.count || 0;
    
    if (totalRequests === 0) {
      return {
        totalTokens: 0,
        totalRequests: 0,
        averageTokensPerRequest: 0,
        successRate: 0
      };
    }
    
    // Get the total number of tokens
    const [tokensResult] = await db
      .select({ total: sql<number>`SUM(${llmApiUsage.totalTokens})` })
      .from(llmApiUsage)
      .where(eq(llmApiUsage.keyId, keyId));
    
    const totalTokens = tokensResult?.total || 0;
    
    // Get the number of successful requests
    const [successResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(llmApiUsage)
      .where(and(
        eq(llmApiUsage.keyId, keyId),
        sql`${llmApiUsage.responseCode} >= 200 AND ${llmApiUsage.responseCode} < 300`
      ));
    
    const successfulRequests = successResult?.count || 0;
    
    return {
      totalTokens,
      totalRequests,
      averageTokensPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0
    };
  }

  // LLM Prompt Template Methods

  /**
   * Get an LLM prompt template by ID
   * @param id LLM prompt template ID
   * @returns LlmPromptTemplate or undefined if not found
   */
  async getLlmPromptTemplate(id: number): Promise<LlmPromptTemplate | undefined> {
    const [template] = await db.select()
      .from(llmPromptTemplates)
      .where(eq(llmPromptTemplates.id, id));
    
    return template;
  }

  /**
   * Get all LLM prompt templates in a category
   * @param category Category name
   * @returns Array of LlmPromptTemplate objects
   */
  async getLlmPromptTemplatesByCategory(category: string): Promise<LlmPromptTemplate[]> {
    return db.select()
      .from(llmPromptTemplates)
      .where(eq(llmPromptTemplates.category, category));
  }

  /**
   * Get all LLM prompt templates created by a user
   * @param userId User ID
   * @returns Array of LlmPromptTemplate objects
   */
  async getLlmPromptTemplatesByUserId(userId: number): Promise<LlmPromptTemplate[]> {
    return db.select()
      .from(llmPromptTemplates)
      .where(eq(llmPromptTemplates.createdBy, userId));
  }

  /**
   * Create a new LLM prompt template
   * @param template LLM prompt template data
   * @returns The created LlmPromptTemplate
   */
  async createLlmPromptTemplate(template: InsertLlmPromptTemplate): Promise<LlmPromptTemplate> {
    const [createdTemplate] = await db
      .insert(llmPromptTemplates)
      .values(template)
      .returning();
    
    return createdTemplate;
  }

  /**
   * Update an LLM prompt template
   * @param id LLM prompt template ID
   * @param template Partial LLM prompt template data
   * @returns The updated LlmPromptTemplate or undefined if not found
   */
  async updateLlmPromptTemplate(id: number, template: Partial<InsertLlmPromptTemplate>): Promise<LlmPromptTemplate | undefined> {
    const [updatedTemplate] = await db
      .update(llmPromptTemplates)
      .set({
        ...template,
        updatedAt: new Date()
      })
      .where(eq(llmPromptTemplates.id, id))
      .returning();
    
    return updatedTemplate;
  }

  // Placeholder implementations for required interface methods
  
  // These will need to be properly implemented based on actual schemas
  // and requirements for your application
  
  async getLlmPrompt(id: number): Promise<any | undefined> {
    // TODO: Implement
    return undefined;
  }

  async getLlmPromptsByCategory(category: string): Promise<any[]> {
    // TODO: Implement
    return [];
  }

  async createLlmPrompt(prompt: any): Promise<any> {
    // TODO: Implement
    return { id: 0 };
  }

  async updateLlmPrompt(id: number, prompt: any): Promise<any | undefined> {
    // TODO: Implement
    return undefined;
  }

  async getLlmConversation(id: number): Promise<any | undefined> {
    // TODO: Implement
    return undefined;
  }

  async getLlmConversationsByUserId(userId: number): Promise<any[]> {
    // TODO: Implement
    return [];
  }

  async createLlmConversation(conversation: any): Promise<any> {
    // TODO: Implement
    return { id: 0 };
  }

  async updateLlmConversation(id: number, conversation: any): Promise<any | undefined> {
    // TODO: Implement
    return undefined;
  }

  async getLlmMessage(id: number): Promise<any | undefined> {
    // TODO: Implement
    return undefined;
  }

  async getLlmMessagesByConversationId(conversationId: number): Promise<any[]> {
    // TODO: Implement
    return [];
  }

  async createLlmMessage(message: any): Promise<any> {
    // TODO: Implement
    return { id: 0 };
  }

  async getLlmConversationWithMessages(conversationId: number): Promise<any | undefined> {
    // TODO: Implement
    return undefined;
  }

  async getLlmFineTuningJob(id: number): Promise<any | undefined> {
    // TODO: Implement
    return undefined;
  }

  async getLlmFineTuningJobsByUserId(userId: number): Promise<any[]> {
    // TODO: Implement
    return [];
  }

  async createLlmFineTuningJob(job: any): Promise<any> {
    // TODO: Implement
    return { id: 0 };
  }

  async updateLlmFineTuningJobStatus(id: number, status: string, metrics?: any): Promise<any | undefined> {
    // TODO: Implement
    return undefined;
  }

  async getSacredPatternRecord(id: number): Promise<any | undefined> {
    // TODO: Implement
    return undefined;
  }

  async getSacredPatternRecordsByUserId(userId: number): Promise<any[]> {
    // TODO: Implement
    return [];
  }

  async createSacredPatternRecord(record: any): Promise<any> {
    // TODO: Implement
    return { id: 0 };
  }

  async getSacredPatternAnalytics(userId: number): Promise<any> {
    // TODO: Implement
    return { 
      averageGoldenRatio: 1.618, 
      averageHarmonicScore: 0.85, 
      dominantPrinciples: ["harmony", "unity", "balance"] 
    };
  }

  async logAiActivity(userId: number, action: string, details: any): Promise<void> {
    // TODO: Implement
  }

  async getAiActivityLogsByUserId(userId: number, limit?: number): Promise<any[]> {
    // TODO: Implement
    return [];
  }

  async getAiActivitySummary(userId: number): Promise<any> {
    // TODO: Implement
    return { 
      totalInteractions: 0, 
      lastInteractionDate: null 
    };
  }

  async getSmartContractsByUserId(userId: number): Promise<any[]> {
    // TODO: Implement
    return [];
  }

  async createSmartContract(data: any): Promise<any> {
    // TODO: Implement
    return { id: 0 };
  }

  async updateSmartContractStatus(id: number, status: string): Promise<any> {
    // TODO: Implement
    return { id, status };
  }

  async getCidEntriesByUserId(userId: number): Promise<any[]> {
    // TODO: Implement
    return [];
  }

  async createCidEntry(data: any): Promise<any> {
    // TODO: Implement
    return { id: 0 };
  }

  async updateCidEntryMetadata(id: number, metadata: any): Promise<any> {
    // TODO: Implement
    return { id, metadata };
  }

  async getPaymentMethodsByUserId(userId: number): Promise<any[]> {
    // TODO: Implement
    return [];
  }

  async createPaymentMethod(data: any): Promise<any> {
    // TODO: Implement
    return { id: 0 };
  }

  async getPaymentHistory(userId: number, limit?: number): Promise<any[]> {
    // TODO: Implement
    return [];
  }
}

// Create and export a singleton instance
export const databaseStorage = new DatabaseStorage();