"use strict";
/**
 * Autonomous Agent System
 * Core component of the AI Freedom Trust Framework that manages
 * specialized autonomous agents for various tasks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentSystem = exports.AutonomousAgentSystem = void 0;
/**
 * Implementation of the Autonomous Agent System
 */
class AutonomousAgentSystem {
    constructor(apiBaseUrl = '/api/agents') {
        this.apiBaseUrl = apiBaseUrl;
    }
    // Agent Type Management
    async getAgentTypes() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/types`);
            if (!response.ok) {
                throw new Error(`Failed to get agent types: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error fetching agent types:', error);
            return [];
        }
    }
    async getAgentTypeById(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/types/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Failed to get agent type: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error fetching agent type ${id}:`, error);
            return null;
        }
    }
    async getAgentTypesByCategory(category) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/types?category=${encodeURIComponent(category)}`);
            if (!response.ok) {
                throw new Error(`Failed to get agent types by category: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error fetching agent types for category ${category}:`, error);
            return [];
        }
    }
    // Agent Instance Management
    async createAgentInstance(agentTypeId, name, config, owner) {
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
        }
        catch (error) {
            console.error('Error creating agent instance:', error);
            throw error;
        }
    }
    async getAgentById(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/instances/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Failed to get agent: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error fetching agent ${id}:`, error);
            return null;
        }
    }
    async updateAgentStatus(id, status) {
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
        }
        catch (error) {
            console.error(`Error updating agent ${id} status:`, error);
            return null;
        }
    }
    async updateAgentConfiguration(id, config) {
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
        }
        catch (error) {
            console.error(`Error updating agent ${id} configuration:`, error);
            return null;
        }
    }
    async getAllAgents(status) {
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
        }
        catch (error) {
            console.error('Error fetching all agents:', error);
            return [];
        }
    }
    async getUserAgents(owner) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/instances?owner=${encodeURIComponent(owner)}`);
            if (!response.ok) {
                throw new Error(`Failed to get user agents: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error fetching agents for owner ${owner}:`, error);
            return [];
        }
    }
    async getSystemAgents() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/instances/system`);
            if (!response.ok) {
                throw new Error(`Failed to get system agents: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Error fetching system agents:', error);
            return [];
        }
    }
    // Agent Task Management
    async assignTask(agentId, task) {
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
        }
        catch (error) {
            console.error('Error assigning task:', error);
            throw error;
        }
    }
    async getAgentTasks(agentId, status) {
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
        }
        catch (error) {
            console.error(`Error fetching tasks for agent ${agentId}:`, error);
            return [];
        }
    }
    async getTaskById(taskId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/tasks/${taskId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Failed to get task: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error fetching task ${taskId}:`, error);
            return null;
        }
    }
    async updateTaskStatus(taskId, status, result) {
        try {
            const body = { status };
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
        }
        catch (error) {
            console.error(`Error updating task ${taskId} status:`, error);
            return null;
        }
    }
    // Agent Coordination
    async delegateTaskToOptimalAgent(taskDescription, category) {
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
        }
        catch (error) {
            console.error('Error delegating task to optimal agent:', error);
            throw error;
        }
    }
    async formAgentTeam(taskDescription, teamSize) {
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
        }
        catch (error) {
            console.error('Error forming agent team:', error);
            throw error;
        }
    }
    async monitorTeamProgress(teamId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/teams/${teamId}/progress`);
            if (!response.ok) {
                throw new Error(`Failed to monitor team progress: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error monitoring team ${teamId} progress:`, error);
            throw error;
        }
    }
    // Agent Resource Management
    async allocateResources(agentId, resources) {
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
        }
        catch (error) {
            console.error(`Error allocating resources for agent ${agentId}:`, error);
            return false;
        }
    }
    async trackResourceUsage(agentId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/instances/${agentId}/resources/usage`);
            if (!response.ok) {
                throw new Error(`Failed to track resource usage: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Error tracking resource usage for agent ${agentId}:`, error);
            return { cpu: 0, memory: 0, storage: 0, utilization: 0 };
        }
    }
    async optimizeResourceAllocation() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/resources/optimize`, {
                method: 'POST'
            });
            if (!response.ok) {
                throw new Error(`Failed to optimize resource allocation: ${response.statusText}`);
            }
            return true;
        }
        catch (error) {
            console.error('Error optimizing resource allocation:', error);
            return false;
        }
    }
}
exports.AutonomousAgentSystem = AutonomousAgentSystem;
// Singleton instance
exports.agentSystem = new AutonomousAgentSystem();
exports.default = exports.agentSystem;
