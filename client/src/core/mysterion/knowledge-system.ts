/**
 * Mysterion Knowledge System
 * 
 * Core knowledge graph implementation for the Mysterion Intelligence System
 */

import { 
  MysterionKnowledgeNode, 
  MysterionKnowledgeEdge, 
  MysterionImprovement,
  MysterionImprovementInsert
} from '../../../shared/schema';

/**
 * Interface for interacting with the Mysterion Knowledge Graph
 */
export interface MysterionKnowledgeSystem {
  // Node operations
  addNode(
    nodeType: string, 
    title: string, 
    content: string, 
    metadata?: any
  ): Promise<MysterionKnowledgeNode>;
  
  getNode(id: number): Promise<MysterionKnowledgeNode | null>;
  
  listKnowledgeNodes(
    nodeType?: string,
    limit?: number,
    offset?: number
  ): Promise<MysterionKnowledgeNode[]>;
  
  findNodes(
    query: string,
    nodeType?: string,
    limit?: number
  ): Promise<MysterionKnowledgeNode[]>;
  
  updateNode(
    id: number, 
    updates: Partial<MysterionKnowledgeNode>
  ): Promise<MysterionKnowledgeNode | null>;
  
  deleteNode(id: number): Promise<boolean>;
  
  // Edge operations
  connectNodes(
    sourceId: number,
    targetId: number,
    relationshipType: string,
    weight?: number,
    metadata?: any
  ): Promise<MysterionKnowledgeEdge>;
  
  getNodeConnections(
    nodeId: number
  ): Promise<{
    incoming: MysterionKnowledgeEdge[],
    outgoing: MysterionKnowledgeEdge[]
  }>;
  
  updateEdge(
    id: number,
    updates: Partial<MysterionKnowledgeEdge>
  ): Promise<MysterionKnowledgeEdge | null>;
  
  deleteEdge(id: number): Promise<boolean>;
  
  // Graph operations
  traverseGraph(
    startNodeId: number,
    depth: number,
    relationshipType?: string
  ): Promise<MysterionKnowledgeNode[]>;
  
  findPath(
    startNodeId: number,
    endNodeId: number,
    maxDepth?: number
  ): Promise<{
    nodes: MysterionKnowledgeNode[],
    edges: MysterionKnowledgeEdge[]
  } | null>;
  
  // Knowledge operations
  queryKnowledge(query: string): Promise<string>;
  
  // Improvement operations
  createImprovement(
    improvement: MysterionImprovementInsert
  ): Promise<MysterionImprovement>;
  
  getImprovement(id: number): Promise<MysterionImprovement | null>;
  
  listImprovements(
    status?: string,
    limit?: number,
    offset?: number
  ): Promise<MysterionImprovement[]>;
  
  updateImprovementStatus(
    id: number,
    status: string
  ): Promise<MysterionImprovement | null>;
}

/**
 * Implementation of the Mysterion Knowledge System using API calls
 */
class ApiKnowledgeSystem implements MysterionKnowledgeSystem {
  private apiBase: string;
  
  constructor(apiBase: string = '/api/mysterion/knowledge') {
    this.apiBase = apiBase;
  }
  
  async addNode(
    nodeType: string, 
    title: string, 
    content: string, 
    metadata?: any
  ): Promise<MysterionKnowledgeNode> {
    const response = await fetch(`${this.apiBase}/nodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nodeType,
        title,
        content,
        metadata
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add node: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async getNode(id: number): Promise<MysterionKnowledgeNode | null> {
    const response = await fetch(`${this.apiBase}/nodes/${id}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to get node: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async listKnowledgeNodes(
    nodeType?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<MysterionKnowledgeNode[]> {
    const params = new URLSearchParams();
    if (nodeType) params.append('nodeType', nodeType);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    const response = await fetch(`${this.apiBase}/nodes?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to list nodes: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async findNodes(
    query: string,
    nodeType?: string,
    limit: number = 10
  ): Promise<MysterionKnowledgeNode[]> {
    const params = new URLSearchParams();
    params.append('query', query);
    if (nodeType) params.append('nodeType', nodeType);
    params.append('limit', limit.toString());
    
    const response = await fetch(`${this.apiBase}/nodes/search?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to find nodes: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async updateNode(
    id: number, 
    updates: Partial<MysterionKnowledgeNode>
  ): Promise<MysterionKnowledgeNode | null> {
    const response = await fetch(`${this.apiBase}/nodes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to update node: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async deleteNode(id: number): Promise<boolean> {
    const response = await fetch(`${this.apiBase}/nodes/${id}`, {
      method: 'DELETE'
    });
    
    if (response.status === 404) {
      return false;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to delete node: ${response.statusText}`);
    }
    
    return true;
  }
  
  async connectNodes(
    sourceId: number,
    targetId: number,
    relationshipType: string,
    weight: number = 100,
    metadata?: any
  ): Promise<MysterionKnowledgeEdge> {
    const response = await fetch(`${this.apiBase}/edges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sourceId,
        targetId,
        relationshipType,
        weight,
        metadata
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to connect nodes: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async getNodeConnections(
    nodeId: number
  ): Promise<{
    incoming: MysterionKnowledgeEdge[],
    outgoing: MysterionKnowledgeEdge[]
  }> {
    const response = await fetch(`${this.apiBase}/nodes/${nodeId}/connections`);
    
    if (!response.ok) {
      throw new Error(`Failed to get node connections: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async updateEdge(
    id: number,
    updates: Partial<MysterionKnowledgeEdge>
  ): Promise<MysterionKnowledgeEdge | null> {
    const response = await fetch(`${this.apiBase}/edges/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to update edge: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async deleteEdge(id: number): Promise<boolean> {
    const response = await fetch(`${this.apiBase}/edges/${id}`, {
      method: 'DELETE'
    });
    
    if (response.status === 404) {
      return false;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to delete edge: ${response.statusText}`);
    }
    
    return true;
  }
  
  async traverseGraph(
    startNodeId: number,
    depth: number,
    relationshipType?: string
  ): Promise<MysterionKnowledgeNode[]> {
    const params = new URLSearchParams();
    params.append('depth', depth.toString());
    if (relationshipType) params.append('relationshipType', relationshipType);
    
    const response = await fetch(`${this.apiBase}/nodes/${startNodeId}/traverse?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to traverse graph: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async findPath(
    startNodeId: number,
    endNodeId: number,
    maxDepth: number = 5
  ): Promise<{
    nodes: MysterionKnowledgeNode[],
    edges: MysterionKnowledgeEdge[]
  } | null> {
    const params = new URLSearchParams();
    params.append('endNodeId', endNodeId.toString());
    params.append('maxDepth', maxDepth.toString());
    
    const response = await fetch(`${this.apiBase}/nodes/${startNodeId}/path?${params.toString()}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to find path: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async queryKnowledge(query: string): Promise<string> {
    const response = await fetch(`${this.apiBase}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to query knowledge: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.answer;
  }
  
  async createImprovement(
    improvement: MysterionImprovementInsert
  ): Promise<MysterionImprovement> {
    const response = await fetch(`${this.apiBase}/improvements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(improvement)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create improvement: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async getImprovement(id: number): Promise<MysterionImprovement | null> {
    const response = await fetch(`${this.apiBase}/improvements/${id}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to get improvement: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async listImprovements(
    status?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<MysterionImprovement[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    const response = await fetch(`${this.apiBase}/improvements?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to list improvements: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async updateImprovementStatus(
    id: number,
    status: string
  ): Promise<MysterionImprovement | null> {
    const response = await fetch(`${this.apiBase}/improvements/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to update improvement status: ${response.statusText}`);
    }
    
    return await response.json();
  }
}

// Create singleton instance
export const knowledgeSystem: MysterionKnowledgeSystem = new ApiKnowledgeSystem();
export default knowledgeSystem;