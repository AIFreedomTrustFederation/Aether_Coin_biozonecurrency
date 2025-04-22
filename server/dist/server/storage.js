"use strict";
/**
 * AI Freedom Trust Framework - Storage Interface
 * Provides database access for all components of the framework
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.PostgresStorage = exports.db = void 0;
const pg_1 = require("pg");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("../shared/schema"));
// Initialize database connection
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL
});
exports.db = (0, node_postgres_1.drizzle)(pool, { schema });
/**
 * Implementation of the Storage interface using PostgreSQL and Drizzle ORM
 */
class PostgresStorage {
    // Mysterion Knowledge System
    async createKnowledgeNode(data) {
        const result = await exports.db.insert(schema.mysterionKnowledgeNode).values(data).returning();
        return result[0];
    }
    async getKnowledgeNode(id) {
        const result = await exports.db.select().from(schema.mysterionKnowledgeNode).where((0, drizzle_orm_1.eq)(schema.mysterionKnowledgeNode.id, id));
        return result.length ? result[0] : null;
    }
    async updateKnowledgeNode(id, data) {
        const updatedData = {
            ...data,
            updatedAt: new Date()
        };
        const result = await exports.db.update(schema.mysterionKnowledgeNode)
            .set(updatedData)
            .where((0, drizzle_orm_1.eq)(schema.mysterionKnowledgeNode.id, id))
            .returning();
        return result.length ? result[0] : null;
    }
    async deleteKnowledgeNode(id) {
        // First delete any edges connected to this node
        await exports.db.delete(schema.mysterionKnowledgeEdge)
            .where((0, drizzle_orm_1.sql) `${schema.mysterionKnowledgeEdge.sourceId} = ${id} OR ${schema.mysterionKnowledgeEdge.targetId} = ${id}`);
        const result = await exports.db.delete(schema.mysterionKnowledgeNode)
            .where((0, drizzle_orm_1.eq)(schema.mysterionKnowledgeNode.id, id))
            .returning();
        return result.length > 0;
    }
    async listKnowledgeNodes(nodeType, limit = 100) {
        let query = exports.db.select().from(schema.mysterionKnowledgeNode);
        if (nodeType) {
            query = query.where((0, drizzle_orm_1.eq)(schema.mysterionKnowledgeNode.nodeType, nodeType));
        }
        return await query.limit(limit).orderBy((0, drizzle_orm_1.desc)(schema.mysterionKnowledgeNode.updatedAt));
    }
    async createKnowledgeEdge(data) {
        const result = await exports.db.insert(schema.mysterionKnowledgeEdge).values(data).returning();
        return result[0];
    }
    async getKnowledgeEdge(id) {
        const result = await exports.db.select().from(schema.mysterionKnowledgeEdge).where((0, drizzle_orm_1.eq)(schema.mysterionKnowledgeEdge.id, id));
        return result.length ? result[0] : null;
    }
    async deleteKnowledgeEdge(id) {
        const result = await exports.db.delete(schema.mysterionKnowledgeEdge)
            .where((0, drizzle_orm_1.eq)(schema.mysterionKnowledgeEdge.id, id))
            .returning();
        return result.length > 0;
    }
    async getNodeConnections(nodeId) {
        const incoming = await exports.db.select().from(schema.mysterionKnowledgeEdge).where((0, drizzle_orm_1.eq)(schema.mysterionKnowledgeEdge.targetId, nodeId));
        const outgoing = await exports.db.select().from(schema.mysterionKnowledgeEdge).where((0, drizzle_orm_1.eq)(schema.mysterionKnowledgeEdge.sourceId, nodeId));
        return { incoming, outgoing };
    }
    async createImprovement(data) {
        const result = await exports.db.insert(schema.mysterionImprovement).values(data).returning();
        return result[0];
    }
    async getImprovement(id) {
        const result = await exports.db.select().from(schema.mysterionImprovement).where((0, drizzle_orm_1.eq)(schema.mysterionImprovement.id, id));
        return result.length ? result[0] : null;
    }
    async updateImprovementStatus(id, status, implementedAt) {
        const updateData = { status };
        if (status === 'implemented' && implementedAt) {
            updateData.implementedAt = implementedAt;
        }
        const result = await exports.db.update(schema.mysterionImprovement)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema.mysterionImprovement.id, id))
            .returning();
        return result.length ? result[0] : null;
    }
    async listImprovements(status, limit = 100) {
        let query = exports.db.select().from(schema.mysterionImprovement);
        if (status) {
            query = query.where((0, drizzle_orm_1.eq)(schema.mysterionImprovement.status, status));
        }
        return await query.limit(limit).orderBy((0, drizzle_orm_1.desc)(schema.mysterionImprovement.createdAt));
    }
    // Autonomous Agent System
    async createAgentType(data) {
        const result = await exports.db.insert(schema.agentType).values(data).returning();
        return result[0];
    }
    async getAgentType(id) {
        const result = await exports.db.select().from(schema.agentType).where((0, drizzle_orm_1.eq)(schema.agentType.id, id));
        return result.length ? result[0] : null;
    }
    async listAgentTypes(category) {
        let query = exports.db.select().from(schema.agentType);
        if (category) {
            query = query.where((0, drizzle_orm_1.eq)(schema.agentType.category, category));
        }
        return await query;
    }
    async createAgentInstance(data) {
        const result = await exports.db.insert(schema.agentInstance).values(data).returning();
        return result[0];
    }
    async getAgentInstance(id) {
        const result = await exports.db.select().from(schema.agentInstance).where((0, drizzle_orm_1.eq)(schema.agentInstance.id, id));
        return result.length ? result[0] : null;
    }
    async updateAgentInstance(id, data) {
        const result = await exports.db.update(schema.agentInstance)
            .set({
            ...data,
            lastActive: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema.agentInstance.id, id))
            .returning();
        return result.length ? result[0] : null;
    }
    async listAgentInstances(status, owner) {
        let query = exports.db.select().from(schema.agentInstance);
        if (status && owner) {
            query = query.where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.agentInstance.status, status), (0, drizzle_orm_1.eq)(schema.agentInstance.owner, owner)));
        }
        else if (status) {
            query = query.where((0, drizzle_orm_1.eq)(schema.agentInstance.status, status));
        }
        else if (owner) {
            query = query.where((0, drizzle_orm_1.eq)(schema.agentInstance.owner, owner));
        }
        return await query.orderBy((0, drizzle_orm_1.desc)(schema.agentInstance.lastActive));
    }
    async createAgentTask(data) {
        const result = await exports.db.insert(schema.agentTask).values(data).returning();
        return result[0];
    }
    async getAgentTask(id) {
        const result = await exports.db.select().from(schema.agentTask).where((0, drizzle_orm_1.eq)(schema.agentTask.id, id));
        return result.length ? result[0] : null;
    }
    async updateAgentTaskStatus(id, status, result) {
        const updateData = { status };
        if (status === 'in_progress' && !await this.getAgentTask(id)?.startedAt) {
            updateData.startedAt = new Date();
        }
        if (status === 'completed' || status === 'failed') {
            updateData.completedAt = new Date();
            if (result) {
                updateData.result = result;
            }
        }
        const updated = await exports.db.update(schema.agentTask)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema.agentTask.id, id))
            .returning();
        return updated.length ? updated[0] : null;
    }
    async listAgentTasks(agentInstanceId, status) {
        let query = exports.db.select().from(schema.agentTask)
            .where((0, drizzle_orm_1.eq)(schema.agentTask.agentInstanceId, agentInstanceId));
        if (status) {
            query = query.where((0, drizzle_orm_1.eq)(schema.agentTask.status, status));
        }
        return await query.orderBy((0, drizzle_orm_1.desc)(schema.agentTask.createdAt));
    }
    // Computational Rewards System
    async createComputationContribution(data) {
        const result = await exports.db.insert(schema.computationContribution).values(data).returning();
        return result[0];
    }
    async getComputationContribution(id) {
        const result = await exports.db.select().from(schema.computationContribution).where((0, drizzle_orm_1.eq)(schema.computationContribution.id, id));
        return result.length ? result[0] : null;
    }
    async updateComputationContribution(id, endTime, resourceAmount, quality) {
        const result = await exports.db.update(schema.computationContribution)
            .set({ endTime, resourceAmount, quality })
            .where((0, drizzle_orm_1.eq)(schema.computationContribution.id, id))
            .returning();
        return result.length ? result[0] : null;
    }
    async verifyComputationContribution(id, verified, method) {
        const result = await exports.db.update(schema.computationContribution)
            .set({ verified, verificationMethod: method })
            .where((0, drizzle_orm_1.eq)(schema.computationContribution.id, id))
            .returning();
        return result.length ? result[0] : null;
    }
    async listComputationContributions(userId, nodeId) {
        let query = exports.db.select().from(schema.computationContribution);
        if (userId && nodeId) {
            query = query.where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.computationContribution.userId, userId), (0, drizzle_orm_1.eq)(schema.computationContribution.nodeId, nodeId)));
        }
        else if (userId) {
            query = query.where((0, drizzle_orm_1.eq)(schema.computationContribution.userId, userId));
        }
        else if (nodeId) {
            query = query.where((0, drizzle_orm_1.eq)(schema.computationContribution.nodeId, nodeId));
        }
        return await query.orderBy((0, drizzle_orm_1.desc)(schema.computationContribution.startTime));
    }
    async createRewardDistribution(data) {
        const result = await exports.db.insert(schema.rewardDistribution).values(data).returning();
        return result[0];
    }
    async getRewardDistribution(id) {
        const result = await exports.db.select().from(schema.rewardDistribution).where((0, drizzle_orm_1.eq)(schema.rewardDistribution.id, id));
        return result.length ? result[0] : null;
    }
    async updateRewardDistributionStatus(id, status, transactionHash) {
        const updateData = { status };
        if (transactionHash) {
            updateData.transactionHash = transactionHash;
        }
        const result = await exports.db.update(schema.rewardDistribution)
            .set(updateData)
            .where((0, drizzle_orm_1.eq)(schema.rewardDistribution.id, id))
            .returning();
        return result.length ? result[0] : null;
    }
    async listRewardDistributions(contributionId) {
        let query = exports.db.select().from(schema.rewardDistribution);
        if (contributionId) {
            query = query.where((0, drizzle_orm_1.eq)(schema.rewardDistribution.contributionId, contributionId));
        }
        return await query.orderBy((0, drizzle_orm_1.desc)(schema.rewardDistribution.distributionTime));
    }
    // Training Data Bridge System
    async createTrainingDataset(data) {
        const result = await exports.db.insert(schema.trainingDataset).values(data).returning();
        return result[0];
    }
    async getTrainingDataset(id) {
        const result = await exports.db.select().from(schema.trainingDataset).where((0, drizzle_orm_1.eq)(schema.trainingDataset.id, id));
        return result.length ? result[0] : null;
    }
    async updateTrainingDataset(id, data) {
        const result = await exports.db.update(schema.trainingDataset)
            .set({
            ...data,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema.trainingDataset.id, id))
            .returning();
        return result.length ? result[0] : null;
    }
    async setFilecoinCid(id, filecoinCid) {
        const result = await exports.db.update(schema.trainingDataset)
            .set({
            filecoinCid,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema.trainingDataset.id, id))
            .returning();
        return result.length ? result[0] : null;
    }
    async listTrainingDatasets(dataType, status) {
        let query = exports.db.select().from(schema.trainingDataset);
        if (dataType && status) {
            query = query.where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema.trainingDataset.dataType, dataType), (0, drizzle_orm_1.eq)(schema.trainingDataset.status, status)));
        }
        else if (dataType) {
            query = query.where((0, drizzle_orm_1.eq)(schema.trainingDataset.dataType, dataType));
        }
        else if (status) {
            query = query.where((0, drizzle_orm_1.eq)(schema.trainingDataset.status, status));
        }
        return await query.orderBy((0, drizzle_orm_1.desc)(schema.trainingDataset.updatedAt));
    }
    async createTrainingDataFragment(data) {
        const result = await exports.db.insert(schema.trainingDataFragment).values(data).returning();
        return result[0];
    }
    async getTrainingDataFragment(id) {
        const result = await exports.db.select().from(schema.trainingDataFragment).where((0, drizzle_orm_1.eq)(schema.trainingDataFragment.id, id));
        return result.length ? result[0] : null;
    }
    async updateFragmentStorage(id, filecoinCid, fractalShardIds) {
        const result = await exports.db.update(schema.trainingDataFragment)
            .set({
            filecoinCid,
            fractalShardIds
        })
            .where((0, drizzle_orm_1.eq)(schema.trainingDataFragment.id, id))
            .returning();
        return result.length ? result[0] : null;
    }
    async listTrainingDataFragments(datasetId) {
        return await exports.db.select()
            .from(schema.trainingDataFragment)
            .where((0, drizzle_orm_1.eq)(schema.trainingDataFragment.datasetId, datasetId))
            .orderBy(schema.trainingDataFragment.fragmentIndex);
    }
}
exports.PostgresStorage = PostgresStorage;
// Create and export a singleton instance of the storage
exports.storage = new PostgresStorage();
exports.default = exports.storage;
