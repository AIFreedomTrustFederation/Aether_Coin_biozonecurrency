/**
 * AI Freedom Trust Framework - Storage Interface
 * Provides database access for all components of the framework
 */

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, desc, sql } from 'drizzle-orm';
import * as schema from '../shared/schema';

// Initialize database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const db = drizzle(pool, { schema });

/**
 * Storage interface for the AI Freedom Trust Framework
 * Handles all database operations
 */
export interface IStorage {
  // Mysterion Knowledge System
  createKnowledgeNode: (data: schema.InsertMysterionKnowledgeNode) => Promise<schema.MysterionKnowledgeNode>;
  getKnowledgeNode: (id: number) => Promise<schema.MysterionKnowledgeNode | null>;
  updateKnowledgeNode: (id: number, data: Partial<schema.InsertMysterionKnowledgeNode>) => Promise<schema.MysterionKnowledgeNode | null>;
  deleteKnowledgeNode: (id: number) => Promise<boolean>;
  listKnowledgeNodes: (nodeType?: string, limit?: number) => Promise<schema.MysterionKnowledgeNode[]>;
  
  createKnowledgeEdge: (data: schema.InsertMysterionKnowledgeEdge) => Promise<schema.MysterionKnowledgeEdge>;
  getKnowledgeEdge: (id: number) => Promise<schema.MysterionKnowledgeEdge | null>;
  deleteKnowledgeEdge: (id: number) => Promise<boolean>;
  getNodeConnections: (nodeId: number) => Promise<{ incoming: schema.MysterionKnowledgeEdge[], outgoing: schema.MysterionKnowledgeEdge[] }>;
  
  createImprovement: (data: schema.InsertMysterionImprovement) => Promise<schema.MysterionImprovement>;
  getImprovement: (id: number) => Promise<schema.MysterionImprovement | null>;
  updateImprovementStatus: (id: number, status: string, implementedAt?: Date) => Promise<schema.MysterionImprovement | null>;
  listImprovements: (status?: string, limit?: number) => Promise<schema.MysterionImprovement[]>;
  
  // Autonomous Agent System
  createAgentType: (data: schema.InsertAgentType) => Promise<schema.AgentType>;
  getAgentType: (id: number) => Promise<schema.AgentType | null>;
  listAgentTypes: (category?: string) => Promise<schema.AgentType[]>;
  
  createAgentInstance: (data: schema.InsertAgentInstance) => Promise<schema.AgentInstance>;
  getAgentInstance: (id: number) => Promise<schema.AgentInstance | null>;
  updateAgentInstance: (id: number, data: Partial<schema.InsertAgentInstance>) => Promise<schema.AgentInstance | null>;
  listAgentInstances: (status?: string, owner?: string) => Promise<schema.AgentInstance[]>;
  
  createAgentTask: (data: schema.InsertAgentTask) => Promise<schema.AgentTask>;
  getAgentTask: (id: number) => Promise<schema.AgentTask | null>;
  updateAgentTaskStatus: (id: number, status: string, result?: any) => Promise<schema.AgentTask | null>;
  listAgentTasks: (agentInstanceId: number, status?: string) => Promise<schema.AgentTask[]>;
  
  // Computational Rewards System
  createComputationContribution: (data: schema.InsertComputationContribution) => Promise<schema.ComputationContribution>;
  getComputationContribution: (id: number) => Promise<schema.ComputationContribution | null>;
  updateComputationContribution: (id: number, endTime: Date, resourceAmount: number, quality: number) => Promise<schema.ComputationContribution | null>;
  verifyComputationContribution: (id: number, verified: boolean, method: string) => Promise<schema.ComputationContribution | null>;
  listComputationContributions: (userId?: string, nodeId?: string) => Promise<schema.ComputationContribution[]>;
  
  createRewardDistribution: (data: schema.InsertRewardDistribution) => Promise<schema.RewardDistribution>;
  getRewardDistribution: (id: number) => Promise<schema.RewardDistribution | null>;
  updateRewardDistributionStatus: (id: number, status: string, transactionHash?: string) => Promise<schema.RewardDistribution | null>;
  listRewardDistributions: (contributionId?: number) => Promise<schema.RewardDistribution[]>;
  
  // Training Data Bridge System
  createTrainingDataset: (data: schema.InsertTrainingDataset) => Promise<schema.TrainingDataset>;
  getTrainingDataset: (id: number) => Promise<schema.TrainingDataset | null>;
  updateTrainingDataset: (id: number, data: Partial<schema.InsertTrainingDataset>) => Promise<schema.TrainingDataset | null>;
  setFilecoinCid: (id: number, filecoinCid: string) => Promise<schema.TrainingDataset | null>;
  listTrainingDatasets: (dataType?: string, status?: string) => Promise<schema.TrainingDataset[]>;
  
  createTrainingDataFragment: (data: schema.InsertTrainingDataFragment) => Promise<schema.TrainingDataFragment>;
  getTrainingDataFragment: (id: number) => Promise<schema.TrainingDataFragment | null>;
  updateFragmentStorage: (id: number, filecoinCid: string, fractalShardIds: string[]) => Promise<schema.TrainingDataFragment | null>;
  listTrainingDataFragments: (datasetId: number) => Promise<schema.TrainingDataFragment[]>;
}

/**
 * Implementation of the Storage interface using PostgreSQL and Drizzle ORM
 */
export class PostgresStorage implements IStorage {
  // Mysterion Knowledge System
  async createKnowledgeNode(data: schema.InsertMysterionKnowledgeNode): Promise<schema.MysterionKnowledgeNode> {
    const result = await db.insert(schema.mysterionKnowledgeNode).values(data).returning();
    return result[0];
  }
  
  async getKnowledgeNode(id: number): Promise<schema.MysterionKnowledgeNode | null> {
    const result = await db.select().from(schema.mysterionKnowledgeNode).where(eq(schema.mysterionKnowledgeNode.id, id));
    return result.length ? result[0] : null;
  }
  
  async updateKnowledgeNode(id: number, data: Partial<schema.InsertMysterionKnowledgeNode>): Promise<schema.MysterionKnowledgeNode | null> {
    const updatedData = {
      ...data,
      updatedAt: new Date()
    };
    
    const result = await db.update(schema.mysterionKnowledgeNode)
      .set(updatedData)
      .where(eq(schema.mysterionKnowledgeNode.id, id))
      .returning();
      
    return result.length ? result[0] : null;
  }
  
  async deleteKnowledgeNode(id: number): Promise<boolean> {
    // First delete any edges connected to this node
    await db.delete(schema.mysterionKnowledgeEdge)
      .where(
        sql`${schema.mysterionKnowledgeEdge.sourceId} = ${id} OR ${schema.mysterionKnowledgeEdge.targetId} = ${id}`
      );
    
    const result = await db.delete(schema.mysterionKnowledgeNode)
      .where(eq(schema.mysterionKnowledgeNode.id, id))
      .returning();
      
    return result.length > 0;
  }
  
  async listKnowledgeNodes(nodeType?: string, limit = 100): Promise<schema.MysterionKnowledgeNode[]> {
    let query = db.select().from(schema.mysterionKnowledgeNode);
    
    if (nodeType) {
      query = query.where(eq(schema.mysterionKnowledgeNode.nodeType, nodeType));
    }
    
    return await query.limit(limit).orderBy(desc(schema.mysterionKnowledgeNode.updatedAt));
  }
  
  async createKnowledgeEdge(data: schema.InsertMysterionKnowledgeEdge): Promise<schema.MysterionKnowledgeEdge> {
    const result = await db.insert(schema.mysterionKnowledgeEdge).values(data).returning();
    return result[0];
  }
  
  async getKnowledgeEdge(id: number): Promise<schema.MysterionKnowledgeEdge | null> {
    const result = await db.select().from(schema.mysterionKnowledgeEdge).where(eq(schema.mysterionKnowledgeEdge.id, id));
    return result.length ? result[0] : null;
  }
  
  async deleteKnowledgeEdge(id: number): Promise<boolean> {
    const result = await db.delete(schema.mysterionKnowledgeEdge)
      .where(eq(schema.mysterionKnowledgeEdge.id, id))
      .returning();
      
    return result.length > 0;
  }
  
  async getNodeConnections(nodeId: number): Promise<{ incoming: schema.MysterionKnowledgeEdge[], outgoing: schema.MysterionKnowledgeEdge[] }> {
    const incoming = await db.select().from(schema.mysterionKnowledgeEdge).where(eq(schema.mysterionKnowledgeEdge.targetId, nodeId));
    const outgoing = await db.select().from(schema.mysterionKnowledgeEdge).where(eq(schema.mysterionKnowledgeEdge.sourceId, nodeId));
    
    return { incoming, outgoing };
  }
  
  async createImprovement(data: schema.InsertMysterionImprovement): Promise<schema.MysterionImprovement> {
    const result = await db.insert(schema.mysterionImprovement).values(data).returning();
    return result[0];
  }
  
  async getImprovement(id: number): Promise<schema.MysterionImprovement | null> {
    const result = await db.select().from(schema.mysterionImprovement).where(eq(schema.mysterionImprovement.id, id));
    return result.length ? result[0] : null;
  }
  
  async updateImprovementStatus(id: number, status: string, implementedAt?: Date): Promise<schema.MysterionImprovement | null> {
    const updateData: any = { status };
    
    if (status === 'implemented' && implementedAt) {
      updateData.implementedAt = implementedAt;
    }
    
    const result = await db.update(schema.mysterionImprovement)
      .set(updateData)
      .where(eq(schema.mysterionImprovement.id, id))
      .returning();
      
    return result.length ? result[0] : null;
  }
  
  async listImprovements(status?: string, limit = 100): Promise<schema.MysterionImprovement[]> {
    let query = db.select().from(schema.mysterionImprovement);
    
    if (status) {
      query = query.where(eq(schema.mysterionImprovement.status, status));
    }
    
    return await query.limit(limit).orderBy(desc(schema.mysterionImprovement.createdAt));
  }
  
  // Autonomous Agent System
  async createAgentType(data: schema.InsertAgentType): Promise<schema.AgentType> {
    const result = await db.insert(schema.agentType).values(data).returning();
    return result[0];
  }
  
  async getAgentType(id: number): Promise<schema.AgentType | null> {
    const result = await db.select().from(schema.agentType).where(eq(schema.agentType.id, id));
    return result.length ? result[0] : null;
  }
  
  async listAgentTypes(category?: string): Promise<schema.AgentType[]> {
    let query = db.select().from(schema.agentType);
    
    if (category) {
      query = query.where(eq(schema.agentType.category, category));
    }
    
    return await query;
  }
  
  async createAgentInstance(data: schema.InsertAgentInstance): Promise<schema.AgentInstance> {
    const result = await db.insert(schema.agentInstance).values(data).returning();
    return result[0];
  }
  
  async getAgentInstance(id: number): Promise<schema.AgentInstance | null> {
    const result = await db.select().from(schema.agentInstance).where(eq(schema.agentInstance.id, id));
    return result.length ? result[0] : null;
  }
  
  async updateAgentInstance(id: number, data: Partial<schema.InsertAgentInstance>): Promise<schema.AgentInstance | null> {
    const result = await db.update(schema.agentInstance)
      .set({
        ...data,
        lastActive: new Date()
      })
      .where(eq(schema.agentInstance.id, id))
      .returning();
      
    return result.length ? result[0] : null;
  }
  
  async listAgentInstances(status?: string, owner?: string): Promise<schema.AgentInstance[]> {
    let query = db.select().from(schema.agentInstance);
    
    if (status && owner) {
      query = query.where(
        and(
          eq(schema.agentInstance.status, status),
          eq(schema.agentInstance.owner, owner)
        )
      );
    } else if (status) {
      query = query.where(eq(schema.agentInstance.status, status));
    } else if (owner) {
      query = query.where(eq(schema.agentInstance.owner, owner));
    }
    
    return await query.orderBy(desc(schema.agentInstance.lastActive));
  }
  
  async createAgentTask(data: schema.InsertAgentTask): Promise<schema.AgentTask> {
    const result = await db.insert(schema.agentTask).values(data).returning();
    return result[0];
  }
  
  async getAgentTask(id: number): Promise<schema.AgentTask | null> {
    const result = await db.select().from(schema.agentTask).where(eq(schema.agentTask.id, id));
    return result.length ? result[0] : null;
  }
  
  async updateAgentTaskStatus(id: number, status: string, result?: any): Promise<schema.AgentTask | null> {
    const updateData: any = { status };
    
    if (status === 'in_progress' && !await this.getAgentTask(id)?.startedAt) {
      updateData.startedAt = new Date();
    }
    
    if (status === 'completed' || status === 'failed') {
      updateData.completedAt = new Date();
      if (result) {
        updateData.result = result;
      }
    }
    
    const updated = await db.update(schema.agentTask)
      .set(updateData)
      .where(eq(schema.agentTask.id, id))
      .returning();
      
    return updated.length ? updated[0] : null;
  }
  
  async listAgentTasks(agentInstanceId: number, status?: string): Promise<schema.AgentTask[]> {
    let query = db.select().from(schema.agentTask)
      .where(eq(schema.agentTask.agentInstanceId, agentInstanceId));
    
    if (status) {
      query = query.where(eq(schema.agentTask.status, status));
    }
    
    return await query.orderBy(desc(schema.agentTask.createdAt));
  }
  
  // Computational Rewards System
  async createComputationContribution(data: schema.InsertComputationContribution): Promise<schema.ComputationContribution> {
    const result = await db.insert(schema.computationContribution).values(data).returning();
    return result[0];
  }
  
  async getComputationContribution(id: number): Promise<schema.ComputationContribution | null> {
    const result = await db.select().from(schema.computationContribution).where(eq(schema.computationContribution.id, id));
    return result.length ? result[0] : null;
  }
  
  async updateComputationContribution(
    id: number, 
    endTime: Date, 
    resourceAmount: number, 
    quality: number
  ): Promise<schema.ComputationContribution | null> {
    const result = await db.update(schema.computationContribution)
      .set({ endTime, resourceAmount, quality })
      .where(eq(schema.computationContribution.id, id))
      .returning();
      
    return result.length ? result[0] : null;
  }
  
  async verifyComputationContribution(
    id: number, 
    verified: boolean, 
    method: string
  ): Promise<schema.ComputationContribution | null> {
    const result = await db.update(schema.computationContribution)
      .set({ verified, verificationMethod: method })
      .where(eq(schema.computationContribution.id, id))
      .returning();
      
    return result.length ? result[0] : null;
  }
  
  async listComputationContributions(userId?: string, nodeId?: string): Promise<schema.ComputationContribution[]> {
    let query = db.select().from(schema.computationContribution);
    
    if (userId && nodeId) {
      query = query.where(
        and(
          eq(schema.computationContribution.userId, userId),
          eq(schema.computationContribution.nodeId, nodeId)
        )
      );
    } else if (userId) {
      query = query.where(eq(schema.computationContribution.userId, userId));
    } else if (nodeId) {
      query = query.where(eq(schema.computationContribution.nodeId, nodeId));
    }
    
    return await query.orderBy(desc(schema.computationContribution.startTime));
  }
  
  async createRewardDistribution(data: schema.InsertRewardDistribution): Promise<schema.RewardDistribution> {
    const result = await db.insert(schema.rewardDistribution).values(data).returning();
    return result[0];
  }
  
  async getRewardDistribution(id: number): Promise<schema.RewardDistribution | null> {
    const result = await db.select().from(schema.rewardDistribution).where(eq(schema.rewardDistribution.id, id));
    return result.length ? result[0] : null;
  }
  
  async updateRewardDistributionStatus(
    id: number, 
    status: string, 
    transactionHash?: string
  ): Promise<schema.RewardDistribution | null> {
    const updateData: any = { status };
    
    if (transactionHash) {
      updateData.transactionHash = transactionHash;
    }
    
    const result = await db.update(schema.rewardDistribution)
      .set(updateData)
      .where(eq(schema.rewardDistribution.id, id))
      .returning();
      
    return result.length ? result[0] : null;
  }
  
  async listRewardDistributions(contributionId?: number): Promise<schema.RewardDistribution[]> {
    let query = db.select().from(schema.rewardDistribution);
    
    if (contributionId) {
      query = query.where(eq(schema.rewardDistribution.contributionId, contributionId));
    }
    
    return await query.orderBy(desc(schema.rewardDistribution.distributionTime));
  }
  
  // Training Data Bridge System
  async createTrainingDataset(data: schema.InsertTrainingDataset): Promise<schema.TrainingDataset> {
    const result = await db.insert(schema.trainingDataset).values(data).returning();
    return result[0];
  }
  
  async getTrainingDataset(id: number): Promise<schema.TrainingDataset | null> {
    const result = await db.select().from(schema.trainingDataset).where(eq(schema.trainingDataset.id, id));
    return result.length ? result[0] : null;
  }
  
  async updateTrainingDataset(
    id: number, 
    data: Partial<schema.InsertTrainingDataset>
  ): Promise<schema.TrainingDataset | null> {
    const result = await db.update(schema.trainingDataset)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(schema.trainingDataset.id, id))
      .returning();
      
    return result.length ? result[0] : null;
  }
  
  async setFilecoinCid(id: number, filecoinCid: string): Promise<schema.TrainingDataset | null> {
    const result = await db.update(schema.trainingDataset)
      .set({
        filecoinCid,
        updatedAt: new Date()
      })
      .where(eq(schema.trainingDataset.id, id))
      .returning();
      
    return result.length ? result[0] : null;
  }
  
  async listTrainingDatasets(dataType?: string, status?: string): Promise<schema.TrainingDataset[]> {
    let query = db.select().from(schema.trainingDataset);
    
    if (dataType && status) {
      query = query.where(
        and(
          eq(schema.trainingDataset.dataType, dataType),
          eq(schema.trainingDataset.status, status)
        )
      );
    } else if (dataType) {
      query = query.where(eq(schema.trainingDataset.dataType, dataType));
    } else if (status) {
      query = query.where(eq(schema.trainingDataset.status, status));
    }
    
    return await query.orderBy(desc(schema.trainingDataset.updatedAt));
  }
  
  async createTrainingDataFragment(data: schema.InsertTrainingDataFragment): Promise<schema.TrainingDataFragment> {
    const result = await db.insert(schema.trainingDataFragment).values(data).returning();
    return result[0];
  }
  
  async getTrainingDataFragment(id: number): Promise<schema.TrainingDataFragment | null> {
    const result = await db.select().from(schema.trainingDataFragment).where(eq(schema.trainingDataFragment.id, id));
    return result.length ? result[0] : null;
  }
  
  async updateFragmentStorage(
    id: number, 
    filecoinCid: string, 
    fractalShardIds: string[]
  ): Promise<schema.TrainingDataFragment | null> {
    const result = await db.update(schema.trainingDataFragment)
      .set({
        filecoinCid,
        fractalShardIds
      })
      .where(eq(schema.trainingDataFragment.id, id))
      .returning();
      
    return result.length ? result[0] : null;
  }
  
  async listTrainingDataFragments(datasetId: number): Promise<schema.TrainingDataFragment[]> {
    return await db.select()
      .from(schema.trainingDataFragment)
      .where(eq(schema.trainingDataFragment.datasetId, datasetId))
      .orderBy(schema.trainingDataFragment.fragmentIndex);
  }
}

// Create and export a singleton instance of the storage
export const storage: IStorage = new PostgresStorage();

export default storage;