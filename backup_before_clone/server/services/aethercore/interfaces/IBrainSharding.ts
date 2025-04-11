/**
 * Brain Sharding Service Interface
 * Defines the interface for the AetherCore Brain Sharding Service
 */

import {
  BrainNetworkShard,
  BrainStorageRecord,
  LlmBrainRecord,
  LlmModelType,
  ModelParameters,
  ShardDistributionPlan
} from '@shared/aethercore/schema';

/**
 * Interface for Storage Config
 */
export interface IStorageConfig {
  replicationFactor: number;
  persistenceLevel: 'temporary' | 'persistent' | 'permanent';
  storageNetworks: ('filecoin' | 'fractalcoin' | 'ipfs')[];
  encryptionLevel: 'none' | 'standard' | 'quantum-resistant';
}

/**
 * Interface for Shard Distribution Plan
 */
export interface IShardDistributionPlan {
  shards: {
    shardIndex: number;
    dimension: string;
    size: number;
    nodeAssignments: string[];
  }[];
  networkTopology: {
    regions: string[];
    nodes: {
      id: string;
      region: string;
      capacity: number;
      latency: number;
    }[];
  };
  inferenceLatency: number;
  retrievalStrategy: string;
}

/**
 * Brain Sharding Service Interface
 * Defines methods for sharding neural networks across distributed storage
 */
export interface IBrainShardingService {
  /**
   * Shard and store a neural network model
   */
  shardNeuralNetwork(
    modelType: LlmModelType,
    modelParameters: ModelParameters,
    shardsCount?: number,
    userId?: number
  ): Promise<BrainStorageRecord>;

  /**
   * Retrieve a neural network model from sharded storage
   */
  retrieveNeuralNetwork(brainId: string): Promise<ModelParameters>;

  /**
   * Get all brain records for a user
   */
  getUserBrainRecords(userId: number): Promise<LlmBrainRecord[]>;

  /**
   * Get detailed information about a brain's shards
   */
  getBrainShards(brainId: string): Promise<BrainNetworkShard[]>;

  /**
   * Update the sharding distribution for a brain
   */
  updateShardDistribution(
    brainId: string,
    newDistributionPlan: IShardDistributionPlan
  ): Promise<boolean>;

  /**
   * Delete a neural network brain and all its shards
   */
  deleteBrain(brainId: string): Promise<boolean>;

  /**
   * Check the health of a brain's shards
   */
  checkBrainHealth(brainId: string): Promise<{
    totalShards: number;
    healthyShards: number;
    unhealthyShards: number;
    needsReplication: boolean;
    healthDetails: any;
  }>;

  /**
   * Repair unhealthy or missing shards
   */
  repairBrainShards(brainId: string): Promise<boolean>;
}