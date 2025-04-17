/**
 * Storage interface for AI Freedom Trust Framework
 */

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
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
export const storage = new PgStorage();
export default storage;