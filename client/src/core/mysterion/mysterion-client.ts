/**
 * Enhanced Mysterion Client
 * Core AGI component of the AI Freedom Trust Framework
 * Provides integration with the knowledge system, autonomous agents,
 * and code understanding capabilities
 */

import { 
  MysterionKnowledgeNode, 
  MysterionImprovement, 
  AgentInstance 
} from '../../../shared/schema';
import { knowledgeSystem } from './knowledge-system';

/**
 * Interface for the enhanced Mysterion client
 */
export interface IMysterionClient {
  // API key management
  addApiKey(service: string, key: string, nickname: string, enableTraining?: boolean): Promise<any>;
  getApiKeys(): Promise<any[]>;
  updateApiKey(keyId: number, updates: Partial<{isActive: boolean, isTrainingEnabled: boolean}>): Promise<any>;
  deleteApiKey(keyId: number): Promise<boolean>;
  
  // Knowledge System Integration
  addKnowledge(type: string, title: string, content: string, metadata?: any): Promise<MysterionKnowledgeNode>;
  queryKnowledge(query: string): Promise<any>;
  getKnowledgeGraph(depth?: number, rootNodeId?: number): Promise<{nodes: MysterionKnowledgeNode[], edges: any[]}>;
  
  // Code Intelligence 
  analyzeRepository(repositoryUrl: string): Promise<any>;
  analyzeFile(filePath: string, content: string): Promise<any>;
  suggestImprovement(fileContent: string, context: string): Promise<MysterionImprovement>;
  
  // Agent Integration
  delegateTask(agentId: number, task: string, priority?: number): Promise<any>;
  monitorAgents(): Promise<AgentInstance[]>;
  
  // Core Mysterion Functions
  generateText(prompt: string, options?: any): Promise<string>;
  getContributionPoints(): Promise<number>;
  getSystemHealth(): Promise<{status: string, components: {[key: string]: {status: string, metrics: any}}}>;
}

/**
 * Implementation of the enhanced Mysterion client
 */
export class MysterionClient implements IMysterionClient {
  private apiBaseUrl: string;
  
  constructor(apiBaseUrl: string = '/api/mysterion') {
    this.apiBaseUrl = apiBaseUrl;
  }
  
  // API Key Management
  
  async addApiKey(service: string, key: string, nickname: string, enableTraining: boolean = true): Promise<any> {
    try {
      // Use a secure vault for key storage on the client side
      const vaultResponse = await fetch(`${this.apiBaseUrl}/vault/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, key })
      });
      
      if (!vaultResponse.ok) {
        throw new Error('Failed to securely store API key');
      }
      
      const { vaultKeyId } = await vaultResponse.json();
      
      // Register the key with the server (without sending the actual key)
      const response = await fetch(`${this.apiBaseUrl}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service,
          nickname,
          vaultKeyId,
          isActive: true,
          isTrainingEnabled: enableTraining
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to register API key with server');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding API key:', error);
      throw error;
    }
  }
  
  async getApiKeys(): Promise<any[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api-keys`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }
      
      const data = await response.json();
      return data.apiKeys || [];
    } catch (error) {
      console.error('Error fetching API keys:', error);
      return [];
    }
  }
  
  async updateApiKey(
    keyId: number, 
    updates: Partial<{isActive: boolean, isTrainingEnabled: boolean}>
  ): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update API key');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating API key:', error);
      throw error;
    }
  }
  
  async deleteApiKey(keyId: number): Promise<boolean> {
    try {
      // Get the vault key ID associated with this API key
      const keys = await this.getApiKeys();
      const key = keys.find(k => k.id === keyId);
      
      if (!key || !key.vaultKeyId) {
        throw new Error('API key not found or missing vault key ID');
      }
      
      // Delete the key from the server
      const response = await fetch(`${this.apiBaseUrl}/api-keys/${keyId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete API key from server');
      }
      
      // Delete the key from the vault
      const vaultResponse = await fetch(`${this.apiBaseUrl}/vault/delete/${key.vaultKeyId}`, {
        method: 'DELETE'
      });
      
      if (!vaultResponse.ok) {
        console.warn('Failed to delete API key from vault');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting API key:', error);
      throw error;
    }
  }
  
  // Knowledge System Integration
  
  async addKnowledge(type: string, title: string, content: string, metadata: any = {}): Promise<MysterionKnowledgeNode> {
    return await knowledgeSystem.addNode(type, title, content, metadata);
  }
  
  async queryKnowledge(query: string): Promise<any> {
    return await knowledgeSystem.queryKnowledge(query);
  }
  
  async getKnowledgeGraph(depth: number = 2, rootNodeId?: number): Promise<{nodes: MysterionKnowledgeNode[], edges: any[]}> {
    try {
      let url = `${this.apiBaseUrl}/knowledge/graph`;
      if (rootNodeId) {
        url += `/${rootNodeId}?depth=${depth}`;
      } else {
        url += `?depth=${depth}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to retrieve knowledge graph');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching knowledge graph:', error);
      return { nodes: [], edges: [] };
    }
  }
  
  // Code Intelligence
  
  async analyzeRepository(repositoryUrl: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/code/analyze-repo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryUrl })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze repository');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error analyzing repository:', error);
      throw error;
    }
  }
  
  async analyzeFile(filePath: string, content: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/code/analyze-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath, content })
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze file');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error analyzing file:', error);
      throw error;
    }
  }
  
  async suggestImprovement(fileContent: string, context: string): Promise<MysterionImprovement> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/code/suggest-improvement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileContent, context })
      });
      
      if (!response.ok) {
        throw new Error('Failed to suggest improvement');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error suggesting improvement:', error);
      throw error;
    }
  }
  
  // Agent Integration
  
  async delegateTask(agentId: number, task: string, priority: number = 5): Promise<any> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/agents/${agentId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.substring(0, 50), // Use first 50 chars as title
          description: task,
          priority
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to delegate task to agent');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error delegating task:', error);
      throw error;
    }
  }
  
  async monitorAgents(): Promise<AgentInstance[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/agents`);
      
      if (!response.ok) {
        throw new Error('Failed to monitor agents');
      }
      
      const data = await response.json();
      return data.agents || [];
    } catch (error) {
      console.error('Error monitoring agents:', error);
      return [];
    }
  }
  
  // Core Mysterion Functions
  
  async generateText(prompt: string, options: any = {}): Promise<string> {
    try {
      // Get the first active API key
      const keys = await this.getApiKeys();
      const activeKey = keys.find(k => k.isActive);
      
      if (!activeKey) {
        throw new Error('No active API key found');
      }
      
      // Retrieve the API key from the vault
      const vaultResponse = await fetch(`${this.apiBaseUrl}/vault/retrieve/${activeKey.vaultKeyId}`);
      
      if (!vaultResponse.ok) {
        throw new Error('Could not retrieve API key from vault');
      }
      
      const { key } = await vaultResponse.json();
      
      if (!key) {
        throw new Error('Invalid API key retrieved from vault');
      }
      
      // Make the API request
      const response = await fetch(`${this.apiBaseUrl}/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': key
        },
        body: JSON.stringify({
          prompt,
          keyId: activeKey.id,
          ...options
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate text');
      }
      
      const data = await response.json();
      return data.text || '';
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }
  
  async getContributionPoints(): Promise<number> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/contribution`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contribution points');
      }
      
      const data = await response.json();
      return data.points || 0;
    } catch (error) {
      console.error('Error fetching contribution points:', error);
      return 0;
    }
  }
  
  async getSystemHealth(): Promise<{status: string, components: {[key: string]: {status: string, metrics: any}}}> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/system/health`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch system health');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching system health:', error);
      return {
        status: 'error',
        components: {
          api: { status: 'error', metrics: { error: 'Failed to connect' } }
        }
      };
    }
  }
}

// Create a singleton instance
export const mysterionClient = new MysterionClient();
export default mysterionClient;