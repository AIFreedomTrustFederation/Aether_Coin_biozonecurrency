/**
 * Mysterion Client
 * 
 * Client for interacting with Mysterion Intelligence System
 */

import { knowledgeSystem } from './knowledge-system';
import { 
  MysterionKnowledgeNode,
  MysterionImprovement
} from '../../../shared/schema';

/**
 * Interface for the Mysterion client
 */
export interface MysterionClient {
  // System operations
  getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, {
      status: 'up' | 'down' | 'degraded';
      details?: any;
    }>;
    timestamp: number;
  }>;
  
  // Knowledge operations
  getKnowledgeGraph(
    depth?: number,
    rootNodeId?: number
  ): Promise<{
    nodes: Array<MysterionKnowledgeNode & { label: string }>;
    edges: Array<{
      id: number;
      source: number;
      target: number;
      label: string;
      weight: number;
    }>;
  }>;
  
  queryKnowledge(query: string): Promise<string>;
  
  semanticSearch(
    query: string,
    options?: {
      nodeTypes?: string[];
      threshold?: number;
      limit?: number;
    }
  ): Promise<Array<MysterionKnowledgeNode & { similarity: number }>>;
  
  findSimilarNodes(
    nodeId: number,
    options?: {
      threshold?: number;
      limit?: number;
    }
  ): Promise<Array<MysterionKnowledgeNode & { similarity: number }>>;
  
  // Code analysis operations
  analyzeFile(
    filePath: string,
    fileContent: string
  ): Promise<{
    qualityScore: number;
    complexityMetrics: {
      cyclomatic: number;
      halstead: number;
      maintainability: number;
    };
    issues: Array<{
      type: string;
      description: string;
      line: number;
      column: number;
      severity: 'info' | 'warning' | 'error';
    }>;
    improvements: Array<{
      description: string;
      line: number;
      suggestion: string;
      confidence: number;
    }>;
  }>;
  
  analyzeRepository(
    repositoryUrl: string
  ): Promise<{
    healthScore: number;
    components: Record<string, {
      path: string;
      type: string;
      qualityScore: number;
      issues: number;
    }>;
    dependencies: Array<{
      name: string;
      version: string;
      outdated: boolean;
      vulnerabilities: number;
    }>;
    architecturePatterns: string[];
    suggestedImprovements: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      effort: 'trivial' | 'minor' | 'major';
    }>;
  }>;
  
  suggestImprovement(
    fileContent: string,
    improvementFocus: string
  ): Promise<{
    title: string;
    description: string;
    codeChanges: {
      original: string;
      suggested: string;
    }[];
    impact: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  }>;
  
  // Reasoning operations
  reason(
    question: string,
    options?: {
      steps?: number;
      showWorkings?: boolean;
      confidenceThreshold?: number;
    }
  ): Promise<{
    conclusion: string;
    confidence: number;
    steps: Array<{
      reasoning: string;
      confidence: number;
    }>;
    sources: Array<{
      nodeId: number;
      relevance: number;
      title: string;
    }>;
  }>;
  
  executeReasoningChain(
    options: {
      question: string;
      tools?: string[];
      maxSteps?: number;
      outputFormat?: 'text' | 'structured';
    }
  ): Promise<any>;
  
  // Text generation
  generateText(
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    }
  ): Promise<string>;
  
  generateDocumentation(
    filePath: string,
    fileContent: string,
    options?: {
      format?: 'markdown' | 'html' | 'jsdoc';
      includeExamples?: boolean;
      linkToRelatedDocs?: boolean;
      templateFile?: string;
    }
  ): Promise<string>;
  
  // API key management
  addApiKey(
    service: string,
    key: string,
    label: string,
    trainingEnabled: boolean
  ): Promise<{
    id: string;
    service: string;
    label: string;
    createdAt: string;
    lastUsed: string | null;
    isTrainingEnabled: boolean;
    isActive: boolean;
  }>;
  
  getApiKeys(): Promise<Array<{
    id: string;
    service: string;
    label: string;
    createdAt: string;
    lastUsed: string | null;
    isTrainingEnabled: boolean;
    isActive: boolean;
  }>>;
  
  updateApiKey(
    id: string,
    updates: {
      label?: string;
      isActive?: boolean;
      isTrainingEnabled?: boolean;
    }
  ): Promise<boolean>;
  
  deleteApiKey(id: string): Promise<boolean>;
  
  // Contribution tracking
  getContributionPoints(): Promise<{
    total: number;
    breakdown: Record<string, number>;
    rank: {
      position: number;
      percentile: number;
      total: number;
    };
  }>;
}

/**
 * Implementation of the Mysterion Client
 */
class MysterionClientImpl implements MysterionClient {
  private apiBase: string;
  
  constructor(apiBase: string = '/api/mysterion') {
    this.apiBase = apiBase;
  }
  
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, {
      status: 'up' | 'down' | 'degraded';
      details?: any;
    }>;
    timestamp: number;
  }> {
    const response = await fetch(`${this.apiBase}/health`);
    
    if (!response.ok) {
      throw new Error(`Failed to get system health: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async getKnowledgeGraph(
    depth: number = 2,
    rootNodeId?: number
  ): Promise<{
    nodes: Array<MysterionKnowledgeNode & { label: string }>;
    edges: Array<{
      id: number;
      source: number;
      target: number;
      label: string;
      weight: number;
    }>;
  }> {
    const params = new URLSearchParams();
    params.append('depth', depth.toString());
    if (rootNodeId) params.append('rootNodeId', rootNodeId.toString());
    
    const response = await fetch(`${this.apiBase}/knowledge/graph?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get knowledge graph: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async queryKnowledge(query: string): Promise<string> {
    return await knowledgeSystem.queryKnowledge(query);
  }
  
  async semanticSearch(
    query: string,
    options: {
      nodeTypes?: string[];
      threshold?: number;
      limit?: number;
    } = {}
  ): Promise<Array<MysterionKnowledgeNode & { similarity: number }>> {
    const params = new URLSearchParams();
    params.append('query', query);
    if (options.nodeTypes) options.nodeTypes.forEach(type => params.append('nodeType', type));
    if (options.threshold) params.append('threshold', options.threshold.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    
    const response = await fetch(`${this.apiBase}/knowledge/semantic-search?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to perform semantic search: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async findSimilarNodes(
    nodeId: number,
    options: {
      threshold?: number;
      limit?: number;
    } = {}
  ): Promise<Array<MysterionKnowledgeNode & { similarity: number }>> {
    const params = new URLSearchParams();
    if (options.threshold) params.append('threshold', options.threshold.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    
    const response = await fetch(`${this.apiBase}/knowledge/nodes/${nodeId}/similar?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to find similar nodes: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async analyzeFile(
    filePath: string,
    fileContent: string
  ): Promise<{
    qualityScore: number;
    complexityMetrics: {
      cyclomatic: number;
      halstead: number;
      maintainability: number;
    };
    issues: Array<{
      type: string;
      description: string;
      line: number;
      column: number;
      severity: 'info' | 'warning' | 'error';
    }>;
    improvements: Array<{
      description: string;
      line: number;
      suggestion: string;
      confidence: number;
    }>;
  }> {
    const response = await fetch(`${this.apiBase}/analysis/file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filePath,
        fileContent
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to analyze file: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async analyzeRepository(
    repositoryUrl: string
  ): Promise<{
    healthScore: number;
    components: Record<string, {
      path: string;
      type: string;
      qualityScore: number;
      issues: number;
    }>;
    dependencies: Array<{
      name: string;
      version: string;
      outdated: boolean;
      vulnerabilities: number;
    }>;
    architecturePatterns: string[];
    suggestedImprovements: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      effort: 'trivial' | 'minor' | 'major';
    }>;
  }> {
    const response = await fetch(`${this.apiBase}/analysis/repository`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        repositoryUrl
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to analyze repository: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async suggestImprovement(
    fileContent: string,
    improvementFocus: string
  ): Promise<{
    title: string;
    description: string;
    codeChanges: {
      original: string;
      suggested: string;
    }[];
    impact: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
  }> {
    const response = await fetch(`${this.apiBase}/analysis/suggest-improvement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileContent,
        improvementFocus
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to suggest improvement: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async reason(
    question: string,
    options: {
      steps?: number;
      showWorkings?: boolean;
      confidenceThreshold?: number;
    } = {}
  ): Promise<{
    conclusion: string;
    confidence: number;
    steps: Array<{
      reasoning: string;
      confidence: number;
    }>;
    sources: Array<{
      nodeId: number;
      relevance: number;
      title: string;
    }>;
  }> {
    const response = await fetch(`${this.apiBase}/reasoning/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question,
        steps: options.steps || 5,
        showWorkings: options.showWorkings || true,
        confidenceThreshold: options.confidenceThreshold || 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to reason: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async executeReasoningChain(
    options: {
      question: string;
      tools?: string[];
      maxSteps?: number;
      outputFormat?: 'text' | 'structured';
    }
  ): Promise<any> {
    const response = await fetch(`${this.apiBase}/reasoning/chain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: options.question,
        tools: options.tools || [],
        maxSteps: options.maxSteps || 10,
        outputFormat: options.outputFormat || 'structured'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to execute reasoning chain: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async generateText(
    prompt: string,
    options: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
    } = {}
  ): Promise<string> {
    const response = await fetch(`${this.apiBase}/generate/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 500,
        model: options.model || 'default'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate text: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.text;
  }
  
  async generateDocumentation(
    filePath: string,
    fileContent: string,
    options: {
      format?: 'markdown' | 'html' | 'jsdoc';
      includeExamples?: boolean;
      linkToRelatedDocs?: boolean;
      templateFile?: string;
    } = {}
  ): Promise<string> {
    const response = await fetch(`${this.apiBase}/generate/documentation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filePath,
        fileContent,
        format: options.format || 'markdown',
        includeExamples: options.includeExamples || true,
        linkToRelatedDocs: options.linkToRelatedDocs || true,
        templateFile: options.templateFile
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate documentation: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.documentation;
  }
  
  async addApiKey(
    service: string,
    key: string,
    label: string,
    trainingEnabled: boolean
  ): Promise<{
    id: string;
    service: string;
    label: string;
    createdAt: string;
    lastUsed: string | null;
    isTrainingEnabled: boolean;
    isActive: boolean;
  }> {
    const response = await fetch(`${this.apiBase}/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service,
        key,
        label,
        trainingEnabled
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add API key: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async getApiKeys(): Promise<Array<{
    id: string;
    service: string;
    label: string;
    createdAt: string;
    lastUsed: string | null;
    isTrainingEnabled: boolean;
    isActive: boolean;
  }>> {
    const response = await fetch(`${this.apiBase}/api-keys`);
    
    if (!response.ok) {
      throw new Error(`Failed to get API keys: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  async updateApiKey(
    id: string,
    updates: {
      label?: string;
      isActive?: boolean;
      isTrainingEnabled?: boolean;
    }
  ): Promise<boolean> {
    const response = await fetch(`${this.apiBase}/api-keys/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update API key: ${response.statusText}`);
    }
    
    return true;
  }
  
  async deleteApiKey(id: string): Promise<boolean> {
    const response = await fetch(`${this.apiBase}/api-keys/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete API key: ${response.statusText}`);
    }
    
    return true;
  }
  
  async getContributionPoints(): Promise<{
    total: number;
    breakdown: Record<string, number>;
    rank: {
      position: number;
      percentile: number;
      total: number;
    };
  }> {
    const response = await fetch(`${this.apiBase}/contributions/points`);
    
    if (!response.ok) {
      throw new Error(`Failed to get contribution points: ${response.statusText}`);
    }
    
    return await response.json();
  }
}

// Create singleton instance
export const mysterionClient: MysterionClient = new MysterionClientImpl();
export default mysterionClient;