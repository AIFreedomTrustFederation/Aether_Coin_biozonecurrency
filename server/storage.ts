/**
 * Storage interface for AI Freedom Trust Framework
 */

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import dotenv from 'dotenv';
import {
  mysterionKnowledgeNode,
  mysterionKnowledgeEdge,
  mysterionImprovement,
  agentType,
  agentInstance,
  agentTask,
  computationContribution,
  rewardDistribution,
  trainingDataset,
  trainingDataFragment,
  MysterionKnowledgeNode,
  MysterionKnowledgeEdge,
  MysterionImprovement,
  AgentType,
  AgentInstance,
  AgentTask,
  ComputationContribution,
  RewardDistribution,
  TrainingDataset,
  TrainingDataFragment,
  MysterionKnowledgeNodeInsert,
  MysterionKnowledgeEdgeInsert,
  MysterionImprovementInsert,
  AgentTypeInsert,
  AgentInstanceInsert,
  AgentTaskInsert,
  ComputationContributionInsert,
  RewardDistributionInsert,
  TrainingDatasetInsert,
  TrainingDataFragmentInsert
} from '../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Storage interface
 */
export interface IStorage {
  // Mysterion Knowledge System
  getAllKnowledgeNodes(): Promise<MysterionKnowledgeNode[]>;
  getKnowledgeNode(id: number): Promise<MysterionKnowledgeNode | null>;
  createKnowledgeNode(node: MysterionKnowledgeNodeInsert): Promise<MysterionKnowledgeNode>;
  updateKnowledgeNode(id: number, updates: Partial<MysterionKnowledgeNode>): Promise<MysterionKnowledgeNode | null>;
  deleteKnowledgeNode(id: number): Promise<boolean>;
  
  // Knowledge Edges
  getAllKnowledgeEdges(): Promise<MysterionKnowledgeEdge[]>;
  getKnowledgeEdge(id: number): Promise<MysterionKnowledgeEdge | null>;
  createKnowledgeEdge(edge: MysterionKnowledgeEdgeInsert): Promise<MysterionKnowledgeEdge>;
  updateKnowledgeEdge(id: number, updates: Partial<MysterionKnowledgeEdge>): Promise<MysterionKnowledgeEdge | null>;
  deleteKnowledgeEdge(id: number): Promise<boolean>;
  
  // Improvements
  getAllImprovements(): Promise<MysterionImprovement[]>;
  getImprovement(id: number): Promise<MysterionImprovement | null>;
  createImprovement(improvement: MysterionImprovementInsert): Promise<MysterionImprovement>;
  updateImprovementStatus(id: number, status: string): Promise<MysterionImprovement | null>;
  
  // Agent System
  getAllAgentTypes(): Promise<AgentType[]>;
  getAgentType(id: number): Promise<AgentType | null>;
  createAgentType(type: AgentTypeInsert): Promise<AgentType>;
  
  getAllAgents(): Promise<AgentInstance[]>;
  getAgent(id: number): Promise<AgentInstance | null>;
  createAgent(agent: AgentInstanceInsert): Promise<AgentInstance>;
  updateAgentConfig(id: number, config: any): Promise<AgentInstance | null>;
  
  getAgentTasks(agentId: number): Promise<AgentTask[]>;
  getTask(id: number): Promise<AgentTask | null>;
  createAgentTask(agentId: number, task: AgentTaskInsert): Promise<AgentTask>;
  updateTaskStatus(id: number, status: string, result?: any): Promise<AgentTask | null>;
  
  // Rewards System
  getAllContributions(): Promise<ComputationContribution[]>;
  getContribution(id: number): Promise<ComputationContribution | null>;
  createContribution(contribution: ComputationContributionInsert): Promise<ComputationContribution>;
  updateContribution(id: number, updates: Partial<ComputationContribution>): Promise<ComputationContribution | null>;
  
  getAllDistributions(): Promise<RewardDistribution[]>;
  getDistribution(id: number): Promise<RewardDistribution | null>;
  createDistribution(distribution: RewardDistributionInsert): Promise<RewardDistribution>;
  updateDistributionStatus(id: number, status: string, txHash?: string): Promise<RewardDistribution | null>;
  
  // Training Data
  getAllDatasets(): Promise<TrainingDataset[]>;
  getDataset(id: number): Promise<TrainingDataset | null>;
  createDataset(dataset: TrainingDatasetInsert): Promise<TrainingDataset>;
  updateDataset(id: number, updates: Partial<TrainingDataset>): Promise<TrainingDataset | null>;
  
  getAllDatasetFragments(datasetId: number): Promise<TrainingDataFragment[]>;
  getFragment(id: number): Promise<TrainingDataFragment | null>;
  createFragment(fragment: TrainingDataFragmentInsert): Promise<TrainingDataFragment>;
  updateFragment(id: number, updates: Partial<TrainingDataFragment>): Promise<TrainingDataFragment | null>;
}

/**
 * PostgreSQL storage implementation
 */
/**
 * In-memory storage implementation for development/testing
 */
export class MemStorage implements IStorage {
  private knowledgeNodes: Map<number, MysterionKnowledgeNode> = new Map();
  private knowledgeEdges: Map<number, MysterionKnowledgeEdge> = new Map();
  private improvements: Map<number, MysterionImprovement> = new Map();
  private agentTypes: Map<number, AgentType> = new Map();
  private agents: Map<number, AgentInstance> = new Map();
  private tasks: Map<number, AgentTask> = new Map();
  private contributions: Map<number, ComputationContribution> = new Map();
  private distributions: Map<number, RewardDistribution> = new Map();
  private datasets: Map<number, TrainingDataset> = new Map();
  private fragments: Map<number, TrainingDataFragment> = new Map();
  
  private nextId: Record<string, number> = {
    knowledgeNode: 1,
    knowledgeEdge: 1,
    improvement: 1,
    agentType: 1,
    agent: 1,
    task: 1,
    contribution: 1,
    distribution: 1,
    dataset: 1,
    fragment: 1
  };
  
  constructor() {
    console.log('Using in-memory storage for development/testing');
  }
  
  // Knowledge System
  
  async getAllKnowledgeNodes(): Promise<MysterionKnowledgeNode[]> {
    return Array.from(this.knowledgeNodes.values());
  }
  
  async getKnowledgeNode(id: number): Promise<MysterionKnowledgeNode | null> {
    return this.knowledgeNodes.get(id) || null;
  }
  
  async createKnowledgeNode(node: MysterionKnowledgeNodeInsert): Promise<MysterionKnowledgeNode> {
    const id = this.nextId.knowledgeNode++;
    const now = new Date();
    
    const newNode: MysterionKnowledgeNode = {
      id,
      ...node,
      createdAt: now,
      updatedAt: now
    } as MysterionKnowledgeNode;
    
    this.knowledgeNodes.set(id, newNode);
    return newNode;
  }
  
  async updateKnowledgeNode(id: number, updates: Partial<MysterionKnowledgeNode>): Promise<MysterionKnowledgeNode | null> {
    const node = this.knowledgeNodes.get(id);
    if (!node) return null;
    
    const updatedNode: MysterionKnowledgeNode = {
      ...node,
      ...updates,
      id, // Ensure id is not changed
      updatedAt: new Date()
    };
    
    this.knowledgeNodes.set(id, updatedNode);
    return updatedNode;
  }
  
  async deleteKnowledgeNode(id: number): Promise<boolean> {
    return this.knowledgeNodes.delete(id);
  }
  
  // Knowledge Edges
  
  async getAllKnowledgeEdges(): Promise<MysterionKnowledgeEdge[]> {
    return Array.from(this.knowledgeEdges.values());
  }
  
  async getKnowledgeEdge(id: number): Promise<MysterionKnowledgeEdge | null> {
    return this.knowledgeEdges.get(id) || null;
  }
  
  async createKnowledgeEdge(edge: MysterionKnowledgeEdgeInsert): Promise<MysterionKnowledgeEdge> {
    const id = this.nextId.knowledgeEdge++;
    const now = new Date();
    
    const newEdge: MysterionKnowledgeEdge = {
      id,
      ...edge,
      createdAt: now,
      updatedAt: now
    } as MysterionKnowledgeEdge;
    
    this.knowledgeEdges.set(id, newEdge);
    return newEdge;
  }
  
  async updateKnowledgeEdge(id: number, updates: Partial<MysterionKnowledgeEdge>): Promise<MysterionKnowledgeEdge | null> {
    const edge = this.knowledgeEdges.get(id);
    if (!edge) return null;
    
    const updatedEdge: MysterionKnowledgeEdge = {
      ...edge,
      ...updates,
      id, // Ensure id is not changed
      updatedAt: new Date()
    };
    
    this.knowledgeEdges.set(id, updatedEdge);
    return updatedEdge;
  }
  
  async deleteKnowledgeEdge(id: number): Promise<boolean> {
    return this.knowledgeEdges.delete(id);
  }
  
  // Improvements
  
  async getAllImprovements(): Promise<MysterionImprovement[]> {
    return Array.from(this.improvements.values());
  }
  
  async getImprovement(id: number): Promise<MysterionImprovement | null> {
    return this.improvements.get(id) || null;
  }
  
  async createImprovement(improvement: MysterionImprovementInsert): Promise<MysterionImprovement> {
    const id = this.nextId.improvement++;
    const now = new Date();
    
    const newImprovement: MysterionImprovement = {
      id,
      ...improvement,
      status: improvement.status || 'proposed',
      proposedAt: now,
      createdAt: now,
      updatedAt: now
    } as MysterionImprovement;
    
    this.improvements.set(id, newImprovement);
    return newImprovement;
  }
  
  async updateImprovementStatus(id: number, status: string): Promise<MysterionImprovement | null> {
    const improvement = this.improvements.get(id);
    if (!improvement) return null;
    
    const updatedImprovement: MysterionImprovement = {
      ...improvement,
      status: status as any,
      updatedAt: new Date()
    };
    
    // If status is 'implemented', set implementedAt
    if (status === 'implemented') {
      updatedImprovement.implementedAt = new Date();
    }
    
    this.improvements.set(id, updatedImprovement);
    return updatedImprovement;
  }
  
  // Agent Types
  
  async getAllAgentTypes(): Promise<AgentType[]> {
    return Array.from(this.agentTypes.values());
  }
  
  async getAgentType(id: number): Promise<AgentType | null> {
    return this.agentTypes.get(id) || null;
  }
  
  async createAgentType(type: AgentTypeInsert): Promise<AgentType> {
    const id = this.nextId.agentType++;
    const now = new Date();
    
    const newType: AgentType = {
      id,
      ...type,
      createdAt: now,
      updatedAt: now
    } as AgentType;
    
    this.agentTypes.set(id, newType);
    return newType;
  }
  
  // Agents
  
  async getAllAgents(): Promise<AgentInstance[]> {
    return Array.from(this.agents.values());
  }
  
  async getAgent(id: number): Promise<AgentInstance | null> {
    return this.agents.get(id) || null;
  }
  
  async createAgent(agent: AgentInstanceInsert): Promise<AgentInstance> {
    const id = this.nextId.agent++;
    const now = new Date();
    
    const newAgent: AgentInstance = {
      id,
      ...agent,
      status: agent.status || 'inactive',
      createdAt: now,
      updatedAt: now
    } as AgentInstance;
    
    this.agents.set(id, newAgent);
    return newAgent;
  }
  
  async updateAgentConfig(id: number, config: any): Promise<AgentInstance | null> {
    const agent = this.agents.get(id);
    if (!agent) return null;
    
    const now = new Date();
    const updatedAgent: AgentInstance = {
      ...agent,
      configuration: config,
      lastActive: now,
      updatedAt: now
    };
    
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }
  
  // Tasks
  
  async getAgentTasks(agentId: number): Promise<AgentTask[]> {
    return Array.from(this.tasks.values()).filter(task => task.agentId === agentId);
  }
  
  async getTask(id: number): Promise<AgentTask | null> {
    return this.tasks.get(id) || null;
  }
  
  async createAgentTask(agentId: number, task: AgentTaskInsert): Promise<AgentTask> {
    const id = this.nextId.task++;
    const now = new Date();
    
    const newTask: AgentTask = {
      id,
      agentId,
      ...task,
      status: task.status || 'pending',
      createdAt: now,
      updatedAt: now
    } as AgentTask;
    
    this.tasks.set(id, newTask);
    return newTask;
  }
  
  async updateTaskStatus(id: number, status: string, result?: any): Promise<AgentTask | null> {
    const task = this.tasks.get(id);
    if (!task) return null;
    
    const now = new Date();
    const updatedTask: AgentTask = {
      ...task,
      status: status as any,
      updatedAt: now
    };
    
    if (result) {
      updatedTask.result = result;
    }
    
    // If status is 'in_progress', set startedAt
    if (status === 'in_progress' && !updatedTask.startedAt) {
      updatedTask.startedAt = now;
    }
    
    // If status is 'completed' or 'failed', set completedAt
    if ((status === 'completed' || status === 'failed') && !updatedTask.completedAt) {
      updatedTask.completedAt = now;
    }
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  // Contributions
  
  async getAllContributions(): Promise<ComputationContribution[]> {
    return Array.from(this.contributions.values());
  }
  
  async getContribution(id: number): Promise<ComputationContribution | null> {
    return this.contributions.get(id) || null;
  }
  
  async createContribution(contribution: ComputationContributionInsert): Promise<ComputationContribution> {
    const id = this.nextId.contribution++;
    const now = new Date();
    
    const newContribution: ComputationContribution = {
      id,
      ...contribution,
      verified: false,
      createdAt: now,
      updatedAt: now
    } as ComputationContribution;
    
    this.contributions.set(id, newContribution);
    return newContribution;
  }
  
  async updateContribution(id: number, updates: Partial<ComputationContribution>): Promise<ComputationContribution | null> {
    const contribution = this.contributions.get(id);
    if (!contribution) return null;
    
    const updatedContribution: ComputationContribution = {
      ...contribution,
      ...updates,
      id, // Ensure id is not changed
      updatedAt: new Date()
    };
    
    // If verified is set to true, set verifiedAt
    if (updates.verified && !contribution.verified) {
      updatedContribution.verifiedAt = new Date();
    }
    
    this.contributions.set(id, updatedContribution);
    return updatedContribution;
  }
  
  // Distributions
  
  async getAllDistributions(): Promise<RewardDistribution[]> {
    return Array.from(this.distributions.values());
  }
  
  async getDistribution(id: number): Promise<RewardDistribution | null> {
    return this.distributions.get(id) || null;
  }
  
  async createDistribution(distribution: RewardDistributionInsert): Promise<RewardDistribution> {
    const id = this.nextId.distribution++;
    const now = new Date();
    
    const newDistribution: RewardDistribution = {
      id,
      ...distribution,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    } as RewardDistribution;
    
    this.distributions.set(id, newDistribution);
    return newDistribution;
  }
  
  async updateDistributionStatus(id: number, status: string, txHash?: string): Promise<RewardDistribution | null> {
    const distribution = this.distributions.get(id);
    if (!distribution) return null;
    
    const updatedDistribution: RewardDistribution = {
      ...distribution,
      status: status as any,
      updatedAt: new Date()
    };
    
    if (txHash) {
      updatedDistribution.transactionHash = txHash;
    }
    
    // If status is 'processed', set distributedAt
    if (status === 'processed' && !updatedDistribution.distributedAt) {
      updatedDistribution.distributedAt = new Date();
    }
    
    this.distributions.set(id, updatedDistribution);
    return updatedDistribution;
  }
  
  // Datasets
  
  async getAllDatasets(): Promise<TrainingDataset[]> {
    return Array.from(this.datasets.values());
  }
  
  async getDataset(id: number): Promise<TrainingDataset | null> {
    return this.datasets.get(id) || null;
  }
  
  async createDataset(dataset: TrainingDatasetInsert): Promise<TrainingDataset> {
    const id = this.nextId.dataset++;
    const now = new Date();
    
    const newDataset: TrainingDataset = {
      id,
      ...dataset,
      status: dataset.status || 'draft',
      fragmentCount: 0,
      createdAt: now,
      updatedAt: now
    } as TrainingDataset;
    
    this.datasets.set(id, newDataset);
    return newDataset;
  }
  
  async updateDataset(id: number, updates: Partial<TrainingDataset>): Promise<TrainingDataset | null> {
    const dataset = this.datasets.get(id);
    if (!dataset) return null;
    
    const updatedDataset: TrainingDataset = {
      ...dataset,
      ...updates,
      id, // Ensure id is not changed
      updatedAt: new Date()
    };
    
    this.datasets.set(id, updatedDataset);
    return updatedDataset;
  }
  
  // Fragments
  
  async getAllDatasetFragments(datasetId: number): Promise<TrainingDataFragment[]> {
    return Array.from(this.fragments.values()).filter(fragment => fragment.datasetId === datasetId);
  }
  
  async getFragment(id: number): Promise<TrainingDataFragment | null> {
    return this.fragments.get(id) || null;
  }
  
  async createFragment(fragment: TrainingDataFragmentInsert): Promise<TrainingDataFragment> {
    const id = this.nextId.fragment++;
    const now = new Date();
    
    const newFragment: TrainingDataFragment = {
      id,
      ...fragment,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    } as TrainingDataFragment;
    
    this.fragments.set(id, newFragment);
    
    // Update fragment count in dataset
    const dataset = this.datasets.get(fragment.datasetId);
    if (dataset) {
      this.datasets.set(fragment.datasetId, {
        ...dataset,
        fragmentCount: (dataset.fragmentCount || 0) + 1,
        updatedAt: now
      });
    }
    
    return newFragment;
  }
  
  async updateFragment(id: number, updates: Partial<TrainingDataFragment>): Promise<TrainingDataFragment | null> {
    const fragment = this.fragments.get(id);
    if (!fragment) return null;
    
    const updatedFragment: TrainingDataFragment = {
      ...fragment,
      ...updates,
      id, // Ensure id is not changed
      updatedAt: new Date()
    };
    
    this.fragments.set(id, updatedFragment);
    return updatedFragment;
  }
}

/**
 * PostgreSQL storage implementation
 */
export class PgStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;
  
  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    this.db = drizzle(pool);
  }
  
  // Mysterion Knowledge System
  
  async getAllKnowledgeNodes(): Promise<MysterionKnowledgeNode[]> {
    try {
      return await this.db.select().from(mysterionKnowledgeNode);
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async getKnowledgeNode(id: number): Promise<MysterionKnowledgeNode | null> {
    try {
      const nodes = await this.db.select()
        .from(mysterionKnowledgeNode)
        .where(eq(mysterionKnowledgeNode.id, id));
      
      return nodes.length ? nodes[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async createKnowledgeNode(node: MysterionKnowledgeNodeInsert): Promise<MysterionKnowledgeNode> {
    try {
      const result = await this.db.insert(mysterionKnowledgeNode)
        .values(node)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async updateKnowledgeNode(id: number, updates: Partial<MysterionKnowledgeNode>): Promise<MysterionKnowledgeNode | null> {
    try {
      // Ensure id is not modified
      const { id: _, ...updateValues } = updates;
      
      const result = await this.db.update(mysterionKnowledgeNode)
        .set({
          ...updateValues,
          updatedAt: new Date()
        })
        .where(eq(mysterionKnowledgeNode.id, id))
        .returning();
      
      return result.length ? result[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async deleteKnowledgeNode(id: number): Promise<boolean> {
    try {
      const result = await this.db.delete(mysterionKnowledgeNode)
        .where(eq(mysterionKnowledgeNode.id, id))
        .returning({ id: mysterionKnowledgeNode.id });
      
      return result.length > 0;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  // Knowledge Edges
  
  async getAllKnowledgeEdges(): Promise<MysterionKnowledgeEdge[]> {
    try {
      return await this.db.select().from(mysterionKnowledgeEdge);
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async getKnowledgeEdge(id: number): Promise<MysterionKnowledgeEdge | null> {
    try {
      const edges = await this.db.select()
        .from(mysterionKnowledgeEdge)
        .where(eq(mysterionKnowledgeEdge.id, id));
      
      return edges.length ? edges[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async createKnowledgeEdge(edge: MysterionKnowledgeEdgeInsert): Promise<MysterionKnowledgeEdge> {
    try {
      const result = await this.db.insert(mysterionKnowledgeEdge)
        .values(edge)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async updateKnowledgeEdge(id: number, updates: Partial<MysterionKnowledgeEdge>): Promise<MysterionKnowledgeEdge | null> {
    try {
      // Ensure id is not modified
      const { id: _, ...updateValues } = updates;
      
      const result = await this.db.update(mysterionKnowledgeEdge)
        .set({
          ...updateValues,
          updatedAt: new Date()
        })
        .where(eq(mysterionKnowledgeEdge.id, id))
        .returning();
      
      return result.length ? result[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async deleteKnowledgeEdge(id: number): Promise<boolean> {
    try {
      const result = await this.db.delete(mysterionKnowledgeEdge)
        .where(eq(mysterionKnowledgeEdge.id, id))
        .returning({ id: mysterionKnowledgeEdge.id });
      
      return result.length > 0;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  // Improvements
  
  async getAllImprovements(): Promise<MysterionImprovement[]> {
    try {
      return await this.db.select().from(mysterionImprovement);
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async getImprovement(id: number): Promise<MysterionImprovement | null> {
    try {
      const improvements = await this.db.select()
        .from(mysterionImprovement)
        .where(eq(mysterionImprovement.id, id));
      
      return improvements.length ? improvements[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async createImprovement(improvement: MysterionImprovementInsert): Promise<MysterionImprovement> {
    try {
      const result = await this.db.insert(mysterionImprovement)
        .values(improvement)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async updateImprovementStatus(id: number, status: string): Promise<MysterionImprovement | null> {
    try {
      const updates: any = {
        status,
        updatedAt: new Date()
      };
      
      // If status is 'implemented', set implementedAt
      if (status === 'implemented') {
        updates.implementedAt = new Date();
      }
      
      const result = await this.db.update(mysterionImprovement)
        .set(updates)
        .where(eq(mysterionImprovement.id, id))
        .returning();
      
      return result.length ? result[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  // Agent System
  
  async getAllAgentTypes(): Promise<AgentType[]> {
    try {
      return await this.db.select().from(agentType);
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async getAgentType(id: number): Promise<AgentType | null> {
    try {
      const types = await this.db.select()
        .from(agentType)
        .where(eq(agentType.id, id));
      
      return types.length ? types[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async createAgentType(type: AgentTypeInsert): Promise<AgentType> {
    try {
      const result = await this.db.insert(agentType)
        .values(type)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async getAllAgents(): Promise<AgentInstance[]> {
    try {
      return await this.db.select().from(agentInstance);
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async getAgent(id: number): Promise<AgentInstance | null> {
    try {
      const agents = await this.db.select()
        .from(agentInstance)
        .where(eq(agentInstance.id, id));
      
      return agents.length ? agents[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async createAgent(agent: AgentInstanceInsert): Promise<AgentInstance> {
    try {
      const result = await this.db.insert(agentInstance)
        .values(agent)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async updateAgentConfig(id: number, config: any): Promise<AgentInstance | null> {
    try {
      const result = await this.db.update(agentInstance)
        .set({
          configuration: config,
          updatedAt: new Date(),
          lastActive: new Date()
        })
        .where(eq(agentInstance.id, id))
        .returning();
      
      return result.length ? result[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async getAgentTasks(agentId: number): Promise<AgentTask[]> {
    try {
      return await this.db.select()
        .from(agentTask)
        .where(eq(agentTask.agentId, agentId));
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async getTask(id: number): Promise<AgentTask | null> {
    try {
      const tasks = await this.db.select()
        .from(agentTask)
        .where(eq(agentTask.id, id));
      
      return tasks.length ? tasks[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async createAgentTask(agentId: number, task: AgentTaskInsert): Promise<AgentTask> {
    try {
      const result = await this.db.insert(agentTask)
        .values({
          ...task,
          agentId
        })
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async updateTaskStatus(id: number, status: string, result?: any): Promise<AgentTask | null> {
    try {
      const updates: any = {
        status,
        updatedAt: new Date()
      };
      
      if (result) {
        updates.result = result;
      }
      
      // If status is 'in_progress', set startedAt
      if (status === 'in_progress' && !updates.startedAt) {
        updates.startedAt = new Date();
      }
      
      // If status is 'completed' or 'failed', set completedAt
      if ((status === 'completed' || status === 'failed') && !updates.completedAt) {
        updates.completedAt = new Date();
      }
      
      const updated = await this.db.update(agentTask)
        .set(updates)
        .where(eq(agentTask.id, id))
        .returning();
      
      return updated.length ? updated[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  // Rewards System
  
  async getAllContributions(): Promise<ComputationContribution[]> {
    try {
      return await this.db.select().from(computationContribution);
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async getContribution(id: number): Promise<ComputationContribution | null> {
    try {
      const contributions = await this.db.select()
        .from(computationContribution)
        .where(eq(computationContribution.id, id));
      
      return contributions.length ? contributions[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async createContribution(contribution: ComputationContributionInsert): Promise<ComputationContribution> {
    try {
      const result = await this.db.insert(computationContribution)
        .values(contribution)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async updateContribution(id: number, updates: Partial<ComputationContribution>): Promise<ComputationContribution | null> {
    try {
      // Ensure id is not modified
      const { id: _, ...updateValues } = updates;
      
      const result = await this.db.update(computationContribution)
        .set({
          ...updateValues,
          updatedAt: new Date()
        })
        .where(eq(computationContribution.id, id))
        .returning();
      
      return result.length ? result[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async getAllDistributions(): Promise<RewardDistribution[]> {
    try {
      return await this.db.select().from(rewardDistribution);
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async getDistribution(id: number): Promise<RewardDistribution | null> {
    try {
      const distributions = await this.db.select()
        .from(rewardDistribution)
        .where(eq(rewardDistribution.id, id));
      
      return distributions.length ? distributions[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async createDistribution(distribution: RewardDistributionInsert): Promise<RewardDistribution> {
    try {
      const result = await this.db.insert(rewardDistribution)
        .values(distribution)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async updateDistributionStatus(id: number, status: string, txHash?: string): Promise<RewardDistribution | null> {
    try {
      const updates: any = {
        status,
        updatedAt: new Date()
      };
      
      if (txHash) {
        updates.transactionHash = txHash;
      }
      
      // If status is 'processed', set distributedAt
      if (status === 'processed') {
        updates.distributedAt = new Date();
      }
      
      const result = await this.db.update(rewardDistribution)
        .set(updates)
        .where(eq(rewardDistribution.id, id))
        .returning();
      
      return result.length ? result[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  // Training Data
  
  async getAllDatasets(): Promise<TrainingDataset[]> {
    try {
      return await this.db.select().from(trainingDataset);
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async getDataset(id: number): Promise<TrainingDataset | null> {
    try {
      const datasets = await this.db.select()
        .from(trainingDataset)
        .where(eq(trainingDataset.id, id));
      
      return datasets.length ? datasets[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async createDataset(dataset: TrainingDatasetInsert): Promise<TrainingDataset> {
    try {
      const result = await this.db.insert(trainingDataset)
        .values(dataset)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async updateDataset(id: number, updates: Partial<TrainingDataset>): Promise<TrainingDataset | null> {
    try {
      // Ensure id is not modified
      const { id: _, ...updateValues } = updates;
      
      const result = await this.db.update(trainingDataset)
        .set({
          ...updateValues,
          updatedAt: new Date()
        })
        .where(eq(trainingDataset.id, id))
        .returning();
      
      return result.length ? result[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async getAllDatasetFragments(datasetId: number): Promise<TrainingDataFragment[]> {
    try {
      return await this.db.select()
        .from(trainingDataFragment)
        .where(eq(trainingDataFragment.datasetId, datasetId));
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async getFragment(id: number): Promise<TrainingDataFragment | null> {
    try {
      const fragments = await this.db.select()
        .from(trainingDataFragment)
        .where(eq(trainingDataFragment.id, id));
      
      return fragments.length ? fragments[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async createFragment(fragment: TrainingDataFragmentInsert): Promise<TrainingDataFragment> {
    try {
      const result = await this.db.insert(trainingDataFragment)
        .values(fragment)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
  
  async updateFragment(id: number, updates: Partial<TrainingDataFragment>): Promise<TrainingDataFragment | null> {
    try {
      // Ensure id is not modified
      const { id: _, ...updateValues } = updates;
      
      const result = await this.db.update(trainingDataFragment)
        .set({
          ...updateValues,
          updatedAt: new Date()
        })
        .where(eq(trainingDataFragment.id, id))
        .returning();
      
      return result.length ? result[0] : null;
    } catch (error) {
      console.error('Database operation failed:', error);
      throw error;
    }
  }
}

// Create and export storage instance
// Use environment to determine which storage implementation to use
// For development, use memory storage by default unless specifically set to use the database
const usePostgres = process.env.USE_POSTGRES === 'true';

// Export a storage instance
export const storage = usePostgres ? new PgStorage() : new MemStorage();
export default storage;