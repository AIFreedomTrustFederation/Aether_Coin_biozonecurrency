/**
 * LLM API Service
 * 
 * Provides business logic for managing LLM API Keys, Connections, 
 * Usage Tracking, and Prompt Templates with quantum security integration.
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { StorageWrapper } from '../storage-wrapper';
import {
  InsertLlmApiKey,
  InsertLlmApiConnection,
  InsertLlmApiUsage,
  InsertLlmPromptTemplate,
} from '../../shared/schema-proxy';

// Quantum security utilities
import { QuantumSecurityService } from './quantum-security-service';

export class LlmApiService {
  private storage: StorageWrapper;
  private quantum: QuantumSecurityService;

  constructor() {
    this.storage = new StorageWrapper();
    this.quantum = new QuantumSecurityService();
  }

  /**
   * Generate a new API Key with quantum-resistant encoding
   * @returns A secure, quantum-resistant API key
   */
  private generateApiKey(): string {
    // Standard UUID as base
    const uuid = uuidv4();
    
    // Add quantum resistant padding using our custom implementation
    const quantumSalt = this.quantum.generateQuantumSalt();
    
    // Create a time-based component for temporal security
    const timeComponent = Date.now().toString(36);
    
    // Combine components with our fractal hashing technique
    const baseString = `${uuid}_${quantumSalt}_${timeComponent}`;
    const fractalHash = this.quantum.applyFractalHash(baseString);
    
    // Format as a friendly API key
    // llm_quantum_{first8CharsOfUuid}_{fractalHashFirst16}
    return `llm_quantum_${uuid.substring(0, 8)}_${fractalHash.substring(0, 16)}`;
  }

  /**
   * Create a new LLM API Key
   * @param userId User ID
   * @param email User email
   * @param data API key creation parameters
   * @returns The created API key
   */
  async createApiKey(userId: number, email: string, data: {
    name: string;
    modelAccessLevel?: string;
    usageLimit?: number | null;
    callsPerMinuteLimit?: number;
    expiresAt?: Date | null;
  }) {
    // Generate a quantum-resistant API key
    const apiKey = this.generateApiKey();
    
    // Apply quantum security validation to ensure key integrity
    const securitySignature = this.quantum.generateSecuritySignature(apiKey);
    
    // Create API key in database
    const insertData: InsertLlmApiKey = {
      userId,
      email,
      name: data.name,
      key: apiKey,
      modelAccessLevel: data.modelAccessLevel || 'standard',
      usageLimit: data.usageLimit || null,
      callsPerMinuteLimit: data.callsPerMinuteLimit || 60,
      expiresAt: data.expiresAt || null,
      isActive: true,
      // Quantum security metadata is embedded as a Base64 string
      // This is stored but not exposed to clients directly
      quantumSecurityData: Buffer.from(JSON.stringify({
        signature: securitySignature,
        timestamp: Date.now(),
        fractalDepth: this.quantum.getCurrentFractalDepth(),
      })).toString('base64')
    };
    
    return this.storage.createLlmApiKey(insertData);
  }

  /**
   * Validate an API key to ensure it hasn't been tampered with
   * @param apiKey The API key string
   * @returns Boolean indicating if the key is valid
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    // First lookup the key in the database
    const keyData = await this.storage.getLlmApiKeyByKey(apiKey);
    if (!keyData) return false;
    
    // Check if key is active
    if (!keyData.isActive) return false;
    
    // Check if key has expired
    if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) return false;
    
    // Quantum security validation
    try {
      // Decode quantum security data
      const securityData = JSON.parse(
        Buffer.from(keyData.quantumSecurityData as string, 'base64').toString()
      );
      
      // Verify signature with quantum security service
      const isValidSignature = this.quantum.verifySecuritySignature(
        apiKey, 
        securityData.signature
      );
      
      return isValidSignature;
    } catch (error) {
      console.error('Error validating quantum security signature:', error);
      return false;
    }
  }

  /**
   * Revoke an API key
   * @param keyId API key ID
   * @param userId User ID (for authorization)
   * @returns The revoked API key
   */
  async revokeApiKey(keyId: number, userId: number) {
    // Verify ownership
    const key = await this.storage.getLlmApiKey(keyId);
    if (!key || key.userId !== userId) {
      throw new Error('Not authorized to revoke this API key');
    }
    
    // Revoke the key
    return this.storage.revokeLlmApiKey(keyId);
  }

  /**
   * Get all API keys for a user
   * @param userId User ID
   * @returns Array of API keys
   */
  async getApiKeysForUser(userId: number) {
    return this.storage.getLlmApiKeysByUserId(userId);
  }

  /**
   * Create a new API connection
   * @param keyId API key ID
   * @param connectionData Connection data
   * @returns The created connection
   */
  async createApiConnection(keyId: number, connectionData: {
    serviceType: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    // Verify the API key exists and is active
    const key = await this.storage.getLlmApiKey(keyId);
    if (!key || !key.isActive) {
      throw new Error('Invalid or inactive API key');
    }
    
    // Create a new connection ID with quantum security
    const connectionId = `conn_${uuidv4()}`;
    
    const insertData: InsertLlmApiConnection = {
      keyId,
      connectionId,
      serviceType: connectionData.serviceType,
      ipAddress: connectionData.ipAddress || null,
      userAgent: connectionData.userAgent || null,
      connectedAt: new Date(),
      lastPingAt: new Date(),
      disconnectedAt: null,
      sessionData: null
    };
    
    return this.storage.createLlmApiConnection(insertData);
  }

  /**
   * Update the last ping time for a connection
   * @param connectionId Connection ID
   * @returns The updated connection
   */
  async updateConnectionPing(connectionId: string) {
    const connection = await this.storage.getLlmApiConnection(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }
    
    return this.storage.updateLlmApiConnectionLastPing(connectionId);
  }

  /**
   * Close a connection
   * @param connectionId Connection ID
   * @returns The closed connection
   */
  async closeConnection(connectionId: string) {
    const connection = await this.storage.getLlmApiConnection(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }
    
    return this.storage.closeLlmApiConnection(connectionId);
  }

  /**
   * Record API usage
   * @param keyId API key ID
   * @param usageData Usage data
   * @returns The created usage record
   */
  async recordApiUsage(keyId: number, usageData: {
    promptTokens: number;
    completionTokens: number;
    endpoint: string;
    modelUsed: string;
    ipAddress?: string | null;
    duration?: number | null;
    responseCode?: number | null;
    errorMessage?: string | null;
    requestId?: string | null;
  }) {
    // Verify the API key exists
    const key = await this.storage.getLlmApiKey(keyId);
    if (!key) {
      throw new Error('Invalid API key');
    }
    
    // Calculate total tokens
    const totalTokens = usageData.promptTokens + usageData.completionTokens;
    
    const insertData: InsertLlmApiUsage = {
      keyId,
      timestamp: new Date(),
      promptTokens: usageData.promptTokens,
      completionTokens: usageData.completionTokens,
      totalTokens,
      endpoint: usageData.endpoint,
      modelUsed: usageData.modelUsed,
      ipAddress: usageData.ipAddress || null,
      duration: usageData.duration || null,
      responseCode: usageData.responseCode || null,
      errorMessage: usageData.errorMessage || null,
      requestId: usageData.requestId || null
    };
    
    return this.storage.createLlmApiUsage(insertData);
  }

  /**
   * Get usage history for an API key
   * @param keyId API key ID
   * @param limit Optional limit
   * @returns Array of usage records
   */
  async getApiUsage(keyId: number, limit?: number) {
    return this.storage.getLlmApiUsageByKeyId(keyId, limit);
  }

  /**
   * Get usage summary for an API key
   * @param keyId API key ID
   * @returns Usage summary statistics
   */
  async getApiUsageSummary(keyId: number) {
    return this.storage.getLlmApiUsageSummary(keyId);
  }

  /**
   * Create a new prompt template
   * @param userId User ID
   * @param templateData Template data
   * @returns The created template
   */
  async createPromptTemplate(userId: number, templateData: {
    name: string;
    description?: string | null;
    category: string;
    tags?: string[] | null;
    templateText: string;
    isPublic?: boolean;
    modelRecommendation?: string | null;
  }) {
    const insertData: InsertLlmPromptTemplate = {
      name: templateData.name,
      description: templateData.description || null,
      category: templateData.category,
      tags: templateData.tags || null,
      templateText: templateData.templateText,
      createdBy: userId,
      isPublic: templateData.isPublic || false,
      version: 1,
      modelRecommendation: templateData.modelRecommendation || null
    };
    
    return this.storage.createLlmPromptTemplate(insertData);
  }

  /**
   * Get all prompt templates for a category
   * @param category Category name
   * @returns Array of prompt templates
   */
  async getPromptTemplatesByCategory(category: string) {
    return this.storage.getLlmPromptTemplatesByCategory(category);
  }

  /**
   * Get all prompt templates created by a user
   * @param userId User ID
   * @returns Array of prompt templates
   */
  async getPromptTemplatesByUser(userId: number) {
    return this.storage.getLlmPromptTemplatesByUserId(userId);
  }

  /**
   * Update a prompt template
   * @param templateId Template ID
   * @param userId User ID (for authorization)
   * @param updateData Update data
   * @returns The updated template
   */
  async updatePromptTemplate(
    templateId: number,
    userId: number,
    updateData: Partial<InsertLlmPromptTemplate>
  ) {
    // Verify ownership
    const template = await this.storage.getLlmPromptTemplate(templateId);
    if (!template || template.createdBy !== userId) {
      throw new Error('Not authorized to update this template');
    }
    
    // Increment version if template text changes
    if (updateData.templateText && updateData.templateText !== template.templateText) {
      updateData.version = template.version + 1;
    }
    
    return this.storage.updateLlmPromptTemplate(templateId, updateData);
  }
}

// Export a singleton instance
export const llmApiService = new LlmApiService();