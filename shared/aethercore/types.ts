/**
 * AetherCore Types
 * Type definitions for the AetherCore components
 */

export enum BlockchainNetworkType {
  AETHERCOIN = 'aethercoin',
  FRACTALCOIN = 'fractalcoin',
  FILECOIN = 'filecoin',
  ETHEREUM = 'ethereum',
  OTHER = 'other'
}

export enum BridgeDirection {
  ATC_TO_FRACTALCOIN = 'atc_to_fractalcoin',
  FRACTALCOIN_TO_ATC = 'fractalcoin_to_atc',
  ATC_TO_FILECOIN = 'atc_to_filecoin',
  FILECOIN_TO_ATC = 'filecoin_to_atc',
  FRACTALCOIN_TO_FILECOIN = 'fractalcoin_to_filecoin',
  FILECOIN_TO_FRACTALCOIN = 'filecoin_to_fractalcoin'
}

export enum TokenBridgeStatus {
  INITIATED = 'initiated',
  PENDING = 'pending',
  CONFIRMED_SOURCE = 'confirmed_source',
  MINTING = 'minting',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REVERTING = 'reverting',
  REVERTED = 'reverted'
}

export interface TokenBridgeTransaction {
  id: string;
  sourceNetwork: BlockchainNetworkType;
  destinationNetwork: BlockchainNetworkType;
  sourceAddress: string;
  destinationAddress: string;
  amount: string;
  fee: string;
  direction: BridgeDirection;
  status: TokenBridgeStatus;
  hash: string;
  initiatedAt: number;
  completedAt?: number;
  metadata?: any;
}

export type LlmModelType = 'transformer' | 'moe' | 'fractal-recursive' | 'hybrid';

export interface ShardingStrategy {
  primaryDimension: string;
  secondaryDimension?: string;
  tertiaryDimension?: string;
  shardsCount: number;
  redundancyPattern: 'linear' | 'fibonacci' | 'exponential';
  replicationFactor: number;
  expertGrouping?: 'domain_specific' | 'random' | 'balanced';
  routerReplication?: number;
}

export interface ModelParameters {
  weights: Record<string, any>;
  architecture: {
    type: LlmModelType;
    layerCount?: number;
    parameterCount?: number;
    attentionHeads?: number;
    expertCount?: number;
    contextLength?: number;
    embeddingDimensions?: number;
    shardingStrategy?: ShardingStrategy;
  };
}

export interface BrainStorageRecord {
  brainId: string;
  modelType: LlmModelType;
  shardStrategy: ShardingStrategy;
  filecoinCids: string[];
  fractalCids: string[];
  ipfsCids?: string[];
  distributionPlan: ShardDistributionPlan;
  createdAt: number;
  updatedAt: number;
  metadata: {
    parameterCount: number;
    layerCount: number;
    modelSize: string;
    attentionHeads: number;
    contextLength: number;
    embeddingDimensions: number;
  };
}

export interface ShardDistributionPlan {
  shards: ShardAssignment[];
  networkTopology: NetworkTopology;
  inferenceLatency: number;
  retrievalStrategy: 'sequential_retrieval' | 'parallel_retrieval';
}

export interface ShardAssignment {
  shardIndex: number;
  dimension: string;
  size: number;
  nodeAssignments: string[];
}

export interface NetworkTopology {
  regions: string[];
  nodes: NetworkNode[];
}

export interface NetworkNode {
  id: string;
  region: string;
  capacity: number;
  latency: number;
}

export interface TokenBridgeConfig {
  sourceNetwork: BlockchainNetworkType;
  destinationNetwork: BlockchainNetworkType;
  conversionRate: number;
  bridgeFeePercent: number;
  requiredConfirmations: number;
  maxTransactionAmount: string;
  minTransactionAmount: string;
}

export interface ITokenBridge {
  initialize(): Promise<boolean>;
  createBridgeTransaction(
    userId: number,
    sourceAddress: string,
    destinationAddress: string,
    amount: string,
    direction: BridgeDirection
  ): Promise<TokenBridgeTransaction>;
  getBridgeTransaction(txId: string): Promise<TokenBridgeTransaction | null>;
  getUserBridgeTransactions(userId: number): Promise<TokenBridgeTransaction[]>;
  updateBridgeTransactionStatus(
    txId: string,
    status: TokenBridgeStatus,
    metadata?: any
  ): Promise<TokenBridgeTransaction>;
  getBridgeConfig(
    sourceNetwork: BlockchainNetworkType,
    destinationNetwork: BlockchainNetworkType
  ): Promise<TokenBridgeConfig>;
  calculateBridgeFee(
    amount: string,
    direction: BridgeDirection
  ): Promise<string>;
  verifySourceTransaction(txId: string): Promise<boolean>;
  completeBridgeTransaction(txId: string): Promise<TokenBridgeTransaction>;
  revertBridgeTransaction(
    txId: string,
    reason: string
  ): Promise<TokenBridgeTransaction>;
}

export interface IBrainSharding {
  shardNeuralNetwork(
    modelType: LlmModelType,
    modelParameters: ModelParameters,
    shardsCount?: number,
    userId?: number
  ): Promise<BrainStorageRecord>;
  retrieveNeuralNetwork(brainId: string): Promise<ModelParameters>;
  getUserBrainRecords(userId: number): Promise<LlmBrainRecord[]>;
  getBrainShards(brainId: string): Promise<BrainNetworkShard[]>;
  updateShardDistribution(
    brainId: string,
    newDistributionPlan: ShardDistributionPlan
  ): Promise<boolean>;
  deleteBrain(brainId: string): Promise<boolean>;
  checkBrainHealth(brainId: string): Promise<{
    totalShards: number;
    healthyShards: number;
    unhealthyShards: number;
    needsReplication: boolean;
    healthDetails: any;
  }>;
  repairBrainShards(brainId: string): Promise<boolean>;
}

// Interface definitions for distributed AI training
export interface DistributedTrainingJob {
  id: string;
  userId: number;
  modelType: LlmModelType;
  status: 'created' | 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  startedAt: number;
  completedAt?: number;
  nodeCount: number;
  epochsCompleted: number;
  totalEpochs: number;
  trainingLoss: number;
  validationLoss: number;
  metadata: Record<string, any>;
}

export interface TrainingConfiguration {
  batchSize: number;
  learningRate: number;
  optimizerType: string;
  distributionStrategy: 'data_parallel' | 'model_parallel' | 'hybrid';
  checkpointInterval: number;
  gradientAccumulationSteps: number;
  mixedPrecision: boolean;
  nodeRequirements: {
    minGpuMemory: number;
    minVram: number;
    minBandwidth: number;
    preferredRegions?: string[];
  };
  datasetId: string;
  validationSplit: number;
}

// Interface definitions for identity management
export interface CrossChainIdentity {
  id: string;
  userId: number;
  publicKey: string;
  atcAddress: string;
  fractalAddress: string;
  filecoinAddress?: string;
  ethereumAddress?: string;
  recoveryMechanism: RecoveryMechanism;
  createdAt: number;
  lastVerifiedAt: number;
  metadata: Record<string, any>;
}

export enum RecoveryMechanism {
  SOCIAL_RECOVERY = 'social_recovery',
  MULTISIG = 'multisig',
  THRESHOLD = 'threshold',
  FRACTAL_BACKUP = 'fractal_backup'
}

// Interface definitions for governance
export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  proposerId: number;
  status: 'active' | 'passed' | 'rejected' | 'expired';
  votingStrategy: VotingWeightStrategy;
  startTime: number;
  endTime: number;
  forVotes: number;
  againstVotes: number;
  threshold: number;
  execution: {
    targetContract?: string;
    functionSignature?: string;
    parameters?: any[];
    isExecuted: boolean;
    executedAt?: number;
    executionResult?: string;
  };
}

export enum VotingWeightStrategy {
  EQUAL_WEIGHT = 'equal_weight',
  TOKEN_WEIGHTED = 'token_weighted',
  QUADRATIC = 'quadratic',
  CONVICTION = 'conviction',
  FRACTAL_WEIGHTED = 'fractal_weighted'
}

// Re-export interface types from schema.ts
export interface LlmBrainRecord {
  id: number;
  brainId: string;
  modelType: string;
  parameterCount: number;
  layerCount: number;
  modelSize: string;
  attentionHeads: number;
  contextLength: number;
  embeddingDimensions: number;
  totalShards: number;
  shardingStrategy: any;
  distributionPlan: any;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface BrainNetworkShard {
  id: number;
  brainId: string;
  shardIndex: number;
  shardType: string;
  filecoinCid: string;
  fractalCid: string;
  ipfsCid: string | null;
  size: number;
  dimension: string;
  replicationFactor: number;
  nodeAddress: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata: any;
}