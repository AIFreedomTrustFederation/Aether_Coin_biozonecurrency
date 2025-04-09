/**
 * Distributed Training Service Interface
 * Defines the interface for LLM training across fractal node network
 */

import { 
  LlmModelType, 
  DistributedTrainingJob, 
  TrainingConfiguration 
} from '@shared/aethercore/types';
import { 
  TrainingJob, 
  TrainingNode 
} from '@shared/aethercore/schema';

export interface ITrainingReward {
  epoch: number;
  nodeId: string;
  amount: string;
  tokenType: 'ATC' | 'FRACTALCOIN';
  transactionHash?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ITrainingProgress {
  epoch: number;
  batchesCompleted: number;
  totalBatches: number;
  currentLoss: number;
  metrics: {
    [key: string]: number;
  };
  timestamp: number;
}

export interface IDistributedTrainingService {
  /**
   * Distribute LLM training across the fractal node network
   * with ATC token incentives
   * @param userId User ID
   * @param modelId Model ID to train
   * @param trainingConfig Training configuration
   * @param rewardPerEpoch ATC tokens per epoch
   */
  distributeTrainingJob(
    userId: number,
    modelId: string,
    trainingConfig: TrainingConfiguration,
    rewardPerEpoch: number
  ): Promise<DistributedTrainingJob>;
  
  /**
   * Aggregate model updates from the fractal network nodes
   * @param jobId Job ID
   * @param epoch Epoch number
   * @param validationScore Validation score
   */
  aggregateModelUpdates(
    jobId: string,
    epoch: number,
    validationScore: number
  ): Promise<{
    updatedModelId: string;
    updatedParameters: any;
    improvements: any;
  }>;
  
  /**
   * Store the trained model parameters in the sharded storage network
   * @param modelId Model ID
   * @param modelParameters Model parameters
   */
  persistModelToShardedStorage(
    modelId: string,
    modelParameters: any
  ): Promise<string>; // Returns CID
  
  /**
   * Get a training job by ID
   * @param jobId Job ID
   */
  getTrainingJob(jobId: string): Promise<TrainingJob | null>;
  
  /**
   * Get all training jobs for a user
   * @param userId User ID
   */
  getUserTrainingJobs(userId: number): Promise<TrainingJob[]>;
  
  /**
   * Get training nodes for a specific job
   * @param jobId Job ID
   */
  getTrainingNodes(jobId: string): Promise<TrainingNode[]>;
  
  /**
   * Get training progress for a job
   * @param jobId Job ID
   */
  getJobProgress(jobId: string): Promise<ITrainingProgress>;
  
  /**
   * Process rewards for nodes that contributed to training
   * @param jobId Job ID
   * @param epoch Epoch number
   */
  processNodeRewards(
    jobId: string,
    epoch: number
  ): Promise<ITrainingReward[]>;
  
  /**
   * Cancel a training job
   * @param jobId Job ID
   * @param reason Reason for cancellation
   */
  cancelTrainingJob(
    jobId: string,
    reason: string
  ): Promise<boolean>;
  
  /**
   * Calculate minimum validation threshold for a given epoch
   * @param epoch Epoch number
   */
  getMinimumValidationThreshold(epoch: number): number;
}