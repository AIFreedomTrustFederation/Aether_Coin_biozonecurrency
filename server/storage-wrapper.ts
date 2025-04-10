/**
 * StorageWrapper
 * 
 * This class provides a wrapper around the storage interface to make it easy to use.
 * It has methods that match those needed by services like LlmApiService.
 */

import { storage, IStorage } from './storage';
import { 
  User, 
  LlmApiKey, 
  InsertLlmApiKey, 
  LlmApiConnection, 
  InsertLlmApiConnection,
  LlmApiUsage,
  InsertLlmApiUsage,
  LlmPromptTemplate,
  InsertLlmPromptTemplate
} from '../shared/schema-proxy';

export class StorageWrapper {
  private storage: IStorage;

  constructor() {
    this.storage = storage;
  }

  /**
   * Get a user by ID
   * @param id User ID
   * @returns User object or undefined if not found
   */
  async getUserById(id: number): Promise<User | undefined> {
    return this.storage.getUserById(id);
  }

  /**
   * Get a user by username
   * @param username Username
   * @returns User object or undefined if not found
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.storage.getUserByUsername(username);
  }

  /**
   * Update the last login timestamp for a user
   * @param id User ID
   * @returns Updated user object or undefined if not found
   */
  async updateUserLastLogin(id: number): Promise<User | undefined> {
    return this.storage.updateUserLastLogin(id);
  }

  // LLM API Key methods
  
  /**
   * Get an LLM API key by ID
   * @param id LLM API key ID
   * @returns LlmApiKey or undefined if not found
   */
  async getLlmApiKey(id: number): Promise<LlmApiKey | undefined> {
    return this.storage.getLlmApiKey(id);
  }

  /**
   * Get an LLM API key by key string
   * @param key The API key string
   * @returns LlmApiKey or undefined if not found
   */
  async getLlmApiKeyByKey(key: string): Promise<LlmApiKey | undefined> {
    return this.storage.getLlmApiKeyByKey(key);
  }

  /**
   * Get all LLM API keys for a user
   * @param userId User ID
   * @returns Array of LlmApiKey objects
   */
  async getLlmApiKeysByUserId(userId: number): Promise<LlmApiKey[]> {
    return this.storage.getLlmApiKeysByUserId(userId);
  }

  /**
   * Create a new LLM API key
   * @param apiKey The API key data
   * @returns The created LlmApiKey
   */
  async createLlmApiKey(apiKey: InsertLlmApiKey): Promise<LlmApiKey> {
    return this.storage.createLlmApiKey(apiKey);
  }

  /**
   * Update an LLM API key
   * @param id LLM API key ID
   * @param apiKey Partial API key data
   * @returns The updated LlmApiKey or undefined if not found
   */
  async updateLlmApiKey(id: number, apiKey: Partial<InsertLlmApiKey>): Promise<LlmApiKey | undefined> {
    return this.storage.updateLlmApiKey(id, apiKey);
  }

  /**
   * Revoke an LLM API key
   * @param id LLM API key ID
   * @returns The revoked LlmApiKey or undefined if not found
   */
  async revokeLlmApiKey(id: number): Promise<LlmApiKey | undefined> {
    return this.storage.revokeLlmApiKey(id);
  }

  // LLM API Connection methods

  /**
   * Get an LLM API connection by ID
   * @param id Connection ID
   * @returns LlmApiConnection or undefined if not found
   */
  async getLlmApiConnection(id: string): Promise<LlmApiConnection | undefined> {
    return this.storage.getLlmApiConnection(id);
  }

  /**
   * Get all connections for a key
   * @param keyId API key ID
   * @returns Array of LlmApiConnection objects
   */
  async getLlmApiConnectionsByKeyId(keyId: number): Promise<LlmApiConnection[]> {
    return this.storage.getLlmApiConnectionsByKeyId(keyId);
  }

  /**
   * Create a new connection
   * @param connection Connection data
   * @returns The created LlmApiConnection
   */
  async createLlmApiConnection(connection: InsertLlmApiConnection): Promise<LlmApiConnection> {
    return this.storage.createLlmApiConnection(connection);
  }

  /**
   * Update a connection's last ping time
   * @param id Connection ID
   * @returns The updated LlmApiConnection or undefined if not found
   */
  async updateLlmApiConnectionLastPing(id: string): Promise<LlmApiConnection | undefined> {
    return this.storage.updateLlmApiConnectionLastPing(id);
  }

  /**
   * Close a connection
   * @param id Connection ID
   * @returns The closed LlmApiConnection or undefined if not found
   */
  async closeLlmApiConnection(id: string): Promise<LlmApiConnection | undefined> {
    return this.storage.closeLlmApiConnection(id);
  }

  // LLM API Usage methods

  /**
   * Record API usage
   * @param usage Usage data
   * @returns The created LlmApiUsage
   */
  async createLlmApiUsage(usage: InsertLlmApiUsage): Promise<LlmApiUsage> {
    return this.storage.createLlmApiUsage(usage);
  }

  /**
   * Get usage for a key
   * @param keyId API key ID
   * @param limit Maximum number of records to return
   * @returns Array of LlmApiUsage objects
   */
  async getLlmApiUsageByKeyId(keyId: number, limit?: number): Promise<LlmApiUsage[]> {
    return this.storage.getLlmApiUsageByKeyId(keyId, limit);
  }

  /**
   * Get usage summary for a key
   * @param keyId API key ID
   * @returns Usage summary statistics
   */
  async getLlmApiUsageSummary(keyId: number): Promise<{ 
    totalTokens: number, 
    totalRequests: number, 
    averageTokensPerRequest: number,
    successRate: number
  }> {
    return this.storage.getLlmApiUsageSummary(keyId);
  }

  // LLM Prompt Template methods

  /**
   * Get a prompt template by ID
   * @param id Template ID
   * @returns LlmPromptTemplate or undefined if not found
   */
  async getLlmPromptTemplate(id: number): Promise<LlmPromptTemplate | undefined> {
    return this.storage.getLlmPromptTemplate(id);
  }

  /**
   * Get templates by category
   * @param category Template category
   * @returns Array of LlmPromptTemplate objects
   */
  async getLlmPromptTemplatesByCategory(category: string): Promise<LlmPromptTemplate[]> {
    return this.storage.getLlmPromptTemplatesByCategory(category);
  }

  /**
   * Get templates created by a user
   * @param userId User ID
   * @returns Array of LlmPromptTemplate objects
   */
  async getLlmPromptTemplatesByUserId(userId: number): Promise<LlmPromptTemplate[]> {
    return this.storage.getLlmPromptTemplatesByUserId(userId);
  }

  /**
   * Create a new prompt template
   * @param template Template data
   * @returns The created LlmPromptTemplate
   */
  async createLlmPromptTemplate(template: InsertLlmPromptTemplate): Promise<LlmPromptTemplate> {
    return this.storage.createLlmPromptTemplate(template);
  }

  /**
   * Update a prompt template
   * @param id Template ID
   * @param template Partial template data
   * @returns The updated LlmPromptTemplate or undefined if not found
   */
  async updateLlmPromptTemplate(id: number, template: Partial<InsertLlmPromptTemplate>): Promise<LlmPromptTemplate | undefined> {
    return this.storage.updateLlmPromptTemplate(id, template);
  }
}