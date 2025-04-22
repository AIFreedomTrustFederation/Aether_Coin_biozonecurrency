"use strict";
/**
 * Mysterion Knowledge System
 * Core component of the AI Freedom Trust Framework that maintains
 * a graph-based knowledge representation of the entire ecosystem.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeSystem = exports.MysterionKnowledgeSystem = void 0;
/**
 * Implementation of the Mysterion Knowledge System
 */
class MysterionKnowledgeSystem {
    constructor(apiBaseUrl = '/api/mysterion/knowledge') {
        this.apiBaseUrl = apiBaseUrl;
    }
    /**
     * Adds a new knowledge node to the graph
     */
    async addNode(type, title, content, metadata = {}) {
        const response = await fetch(`${this.apiBaseUrl}/nodes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nodeType: type,
                title,
                content,
                metadata
            })
        });
        if (!response.ok) {
            throw new Error(`Failed to add knowledge node: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Updates an existing knowledge node
     */
    async updateNode(id, updates) {
        const response = await fetch(`${this.apiBaseUrl}/nodes/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Failed to update knowledge node: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Removes a knowledge node and all its connected edges
     */
    async removeNode(id) {
        const response = await fetch(`${this.apiBaseUrl}/nodes/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            if (response.status === 404) {
                return false;
            }
            throw new Error(`Failed to remove knowledge node: ${response.statusText}`);
        }
        return true;
    }
    /**
     * Retrieves a specific knowledge node by ID
     */
    async getNode(id) {
        const response = await fetch(`${this.apiBaseUrl}/nodes/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Failed to get knowledge node: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Finds nodes matching the query string and optional type filter
     */
    async findNodes(query, type, limit = 10) {
        const params = new URLSearchParams({
            query,
            ...(type && { type }),
            limit: limit.toString()
        });
        const response = await fetch(`${this.apiBaseUrl}/nodes/search?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`Failed to search knowledge nodes: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Creates a directed edge connecting two nodes
     */
    async connectNodes(sourceId, targetId, relationship, weight = 1.0, metadata = {}) {
        const response = await fetch(`${this.apiBaseUrl}/edges`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sourceId,
                targetId,
                relationshipType: relationship,
                weight,
                metadata
            })
        });
        if (!response.ok) {
            throw new Error(`Failed to connect nodes: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Removes an edge between nodes
     */
    async disconnectNodes(edgeId) {
        const response = await fetch(`${this.apiBaseUrl}/edges/${edgeId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            if (response.status === 404) {
                return false;
            }
            throw new Error(`Failed to disconnect nodes: ${response.statusText}`);
        }
        return true;
    }
    /**
     * Gets all edges connected to a specific node
     */
    async getNodeConnections(nodeId) {
        const response = await fetch(`${this.apiBaseUrl}/nodes/${nodeId}/connections`);
        if (!response.ok) {
            throw new Error(`Failed to get node connections: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Traverses the graph from a starting node to a specified depth
     */
    async traverseGraph(startNodeId, depth, relationshipFilter) {
        const params = new URLSearchParams({
            depth: depth.toString(),
            ...(relationshipFilter && { relationshipType: relationshipFilter })
        });
        const response = await fetch(`${this.apiBaseUrl}/graph/traverse/${startNodeId}?${params.toString()}`);
        if (!response.ok) {
            throw new Error(`Failed to traverse graph: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Finds the shortest path between two nodes
     */
    async findPath(startNodeId, endNodeId) {
        const response = await fetch(`${this.apiBaseUrl}/graph/path/${startNodeId}/${endNodeId}`);
        if (!response.ok) {
            throw new Error(`Failed to find path between nodes: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Performs a natural language query against the knowledge graph
     */
    async queryKnowledge(query) {
        const response = await fetch(`${this.apiBaseUrl}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        if (!response.ok) {
            throw new Error(`Failed to query knowledge: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Proposes a new self-improvement
     */
    async proposeImprovement(title, description, codeChanges, repository, files) {
        const response = await fetch(`${this.apiBaseUrl}/improvements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                codeChanges,
                targetRepository: repository,
                targetFiles: files,
                impact: 'medium' // Default impact
            })
        });
        if (!response.ok) {
            throw new Error(`Failed to propose improvement: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Gets a specific improvement by ID
     */
    async getImprovement(id) {
        const response = await fetch(`${this.apiBaseUrl}/improvements/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Failed to get improvement: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Updates the status of an improvement
     */
    async updateImprovementStatus(id, status) {
        const response = await fetch(`${this.apiBaseUrl}/improvements/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Failed to update improvement status: ${response.statusText}`);
        }
        return await response.json();
    }
    /**
     * Gets all pending improvements
     */
    async getPendingImprovements() {
        const response = await fetch(`${this.apiBaseUrl}/improvements?status=proposed`);
        if (!response.ok) {
            throw new Error(`Failed to get pending improvements: ${response.statusText}`);
        }
        return await response.json();
    }
}
exports.MysterionKnowledgeSystem = MysterionKnowledgeSystem;
// Singleton instance
exports.knowledgeSystem = new MysterionKnowledgeSystem();
exports.default = exports.knowledgeSystem;
