/**
 * Autonomous Agent System
 * Core component of the AI Freedom Trust Framework that manages
 * specialized autonomous agents for various tasks
 */

import { 
  AgentType, 
  AgentInstance, 
  AgentTask,
  InsertAgentTask
} from '../../../shared/schema';

/**
 * Interface for the Autonomous Agent System
 */
export interface IAgentSystem {
  // Agent Type Management
  getAgentTypes(): Promise<AgentType[]>;
  getAgentTypeById(id: number): Promise<AgentType | null>;
  getAgentTypesByCategory(category: string): Promise<AgentType[]>;
  
  // Agent Instance Management
  createAgentInstance(agentTypeId: number, name: string, config: any, owner?: string): Promise<AgentInstance>;
  getAgentById(id: number): Promise<AgentInstance | null>;
  updateAgentStatus(id: number, status: 'active' | 'paused' | 'terminated'): Promise<AgentInstance | null>;
  updateAgentConfiguration(id: number, config: any): Promise<AgentInstance | null>;
  getAllAgents(status?: string): Promise<AgentInstance[]>;
  getUserAgents(owner: string): Promise<AgentInstance[]>;
  getSystemAgents(): Promise<AgentInstance[]>;
  
  // Agent Task Management
  assignTask(agentId: number, task: InsertAgentTask): Promise<AgentTask>;
  getAgentTasks(agentId: number, status?: string): Promise<AgentTask[]>;
  getTaskById(taskId: number): Promise<AgentTask | null>;
  updateTaskStatus(taskId: number, status: string, result?: any): Promise<AgentTask | null>;
  
  // Agent Coordination
  delegateTaskToOptimalAgent(taskDescription: string, category?: string): Promise<AgentTask>;
  formAgentTeam(taskDescription: string, teamSize: number): Promise<{teamId: string, agents: AgentInstance[]}>;
  monitorTeamProgress(teamId: string): Promise<{progress: number, status: string, results: any[]}>;
  
  // Agent Resource Management
  allocateResources(agentId: number, resources: {cpu?: number, memory?: number, storage?: number}): Promise<boolean>;
  trackResourceUsage(agentId: number): Promise<{cpu: number, memory: number, storage: number, utilization: number}>;
  optimizeResourceAllocation(): Promise<boolean>;
}

/**
 * Implementation of the Autonomous Agent System
 */
export class AutonomousAgentSystem implements IAgentSystem {
  private apiBaseUrl: string;
  
  constructor(apiBaseUrl: string = '/api/agents') {
    this.apiBaseUrl = apiBaseUrl;
  }
  
  // Agent Type Management
  
  async getAgentTypes(): Promise<AgentType[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/types`);
      
      if (!response.ok) {
        throw new Error(`Failed to get agent types: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching agent types:', error);
      return [];
    }
  }
  
  async getAgentTypeById(id: number): Promise<AgentType | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/types/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get agent type: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching agent type ${id}:`, error);
      return null;
    }
  }
  
  async getAgentTypesByCategory(category: string): Promise<AgentType[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/types?category=${encodeURIComponent(category)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get agent types by category: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching agent types for category ${category}:`, error);
      return [];
    }
  }
  
  // Agent Instance Management
  
  async createAgentInstance(agentTypeId: number, name: string, config: any, owner?: string): Promise<AgentInstance> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/instances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentTypeId,
          name,
          configuration: config,
          owner,
          status: 'initializing'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create agent instance: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating agent instance:', error);
      throw error;
    }
  }
  
  async getAgentById(id: number): Promise<AgentInstance | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/instances/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get agent: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching agent ${id}:`, error);
      return null;
    }
  }
  
  async updateAgentStatus(id: number, status: 'active' | 'paused' | 'terminated'): Promise<AgentInstance | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/instances/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to update agent status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating agent ${id} status:`, error);
      return null;
    }
  }
  
  async updateAgentConfiguration(id: number, config: any): Promise<AgentInstance | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/instances/${id}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configuration: config })
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to update agent configuration: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating agent ${id} configuration:`, error);
      return null;
    }
  }
  
  async getAllAgents(status?: string): Promise<AgentInstance[]> {
    try {
      let url = `${this.apiBaseUrl}/instances`;
      if (status) {
        url += `?status=${encodeURIComponent(status)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to get all agents: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching all agents:', error);
      return [];
    }
  }
  
  async getUserAgents(owner: string): Promise<AgentInstance[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/instances?owner=${encodeURIComponent(owner)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get user agents: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching agents for owner ${owner}:`, error);
      return [];
    }
  }
  
  async getSystemAgents(): Promise<AgentInstance[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/instances/system`);
      
      if (!response.ok) {
        throw new Error(`Failed to get system agents: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching system agents:', error);
      return [];
    }
  }
  
  // Agent Task Management
  
  async assignTask(agentId: number, task: InsertAgentTask): Promise<AgentTask> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/instances/${agentId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to assign task: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error assigning task:', error);
      throw error;
    }
  }
  
  async getAgentTasks(agentId: number, status?: string): Promise<AgentTask[]> {
    try {
      let url = `${this.apiBaseUrl}/instances/${agentId}/tasks`;
      if (status) {
        url += `?status=${encodeURIComponent(status)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to get agent tasks: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching tasks for agent ${agentId}:`, error);
      return [];
    }
  }
  
  async getTaskById(taskId: number): Promise<AgentTask | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/tasks/${taskId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get task: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
      return null;
    }
  }
  
  async updateTaskStatus(taskId: number, status: string, result?: any): Promise<AgentTask | null> {
    try {
      const body: any = { status };
      if (result !== undefined) {
        body.result = result;
      }
      
      const response = await fetch(`${this.apiBaseUrl}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to update task status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating task ${taskId} status:`, error);
      return null;
    }
  }
  
  // Agent Coordination
  
  async delegateTaskToOptimalAgent(taskDescription: string, category?: string): Promise<AgentTask> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/delegate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: taskDescription,
          category
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delegate task: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error delegating task to optimal agent:', error);
      throw error;
    }
  }
  
  async formAgentTeam(taskDescription: string, teamSize: number): Promise<{teamId: string, agents: AgentInstance[]}> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/teams/form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskDescription,
          teamSize
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to form agent team: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error forming agent team:', error);
      throw error;
    }
  }
  
  async monitorTeamProgress(teamId: string): Promise<{progress: number, status: string, results: any[]}> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/teams/${teamId}/progress`);
      
      if (!response.ok) {
        throw new Error(`Failed to monitor team progress: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error monitoring team ${teamId} progress:`, error);
      throw error;
    }
  }
  
  // Agent Resource Management
  
  async allocateResources(agentId: number, resources: {cpu?: number, memory?: number, storage?: number}): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/instances/${agentId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resources)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to allocate resources: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Error allocating resources for agent ${agentId}:`, error);
      return false;
    }
  }
  
  async trackResourceUsage(agentId: number): Promise<{cpu: number, memory: number, storage: number, utilization: number}> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/instances/${agentId}/resources/usage`);
      
      if (!response.ok) {
        throw new Error(`Failed to track resource usage: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error tracking resource usage for agent ${agentId}:`, error);
      return { cpu: 0, memory: 0, storage: 0, utilization: 0 };
    }
  }
  
  async optimizeResourceAllocation(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/resources/optimize`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to optimize resource allocation: ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error optimizing resource allocation:', error);
      return false;
    }
  }
}

// Singleton instance
export const agentSystem = new AutonomousAgentSystem();
export default agentSystem;