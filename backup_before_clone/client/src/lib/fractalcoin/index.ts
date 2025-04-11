/**
 * FractalCoin Layer 2 Blockchain Module
 * 
 * This module implements the foundation for FractalCoin (FRC),
 * a Layer 2 blockchain designed for recursive fractal sharding rewards,
 * enhancing network efficiency and scalability.
 * 
 * Important: This is Phase 1 implementation - to be expanded into a full
 * Layer 2 blockchain after Singularity Coin is fully implemented.
 */

import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { fractalShardManager } from '../quantum-vault/fractal-sharding';
import { singularityCoin, SingularityTransaction } from '../singularity-coin';

/**
 * Types of fractal sharding patterns for optimization
 */
export enum FractalPattern {
  MANDELBROT = 'mandelbrot',
  JULIA = 'julia',
  SIERPINSKI = 'sierpinski',
  MENGER = 'menger',
  HEXAGONAL = 'hexagonal',
}

/**
 * Types of Layer 2 operations
 */
export enum L2OperationType {
  SHARD_CREATION = 'shard_creation',
  SHARD_VALIDATION = 'shard_validation',
  SHARD_MERGE = 'shard_merge',
  STORAGE_CONTRIBUTION = 'storage_contribution',
  COMPUTATION_CONTRIBUTION = 'computation_contribution',
  REWARD_DISTRIBUTION = 'reward_distribution',
}

/**
 * Fractal shard node in the network
 */
export interface FractalShardNode {
  id: string;
  parentId?: string;
  childrenIds: string[];
  ownerAddress: string;
  pattern: FractalPattern;
  complexity: number;       // Computational complexity for rewards calculation
  storageSize: number;      // In bytes
  creationTimestamp: number;
  lastModified: number;
  rewardRate: number;       // FRC tokens per day
  validationCount: number;  // Number of validations received
  data?: any;               // Actual data or reference to it
}

/**
 * Layer 2 operation record
 */
export interface L2Operation {
  id: string;
  type: L2OperationType;
  timestamp: number;
  performedBy: string;      // Address of the operator
  shardIds: string[];       // IDs of affected shards
  rewardAmount?: string;    // Reward in FRC tokens
  computationUnits?: number; // For computation contributions
  storageUnits?: number;     // For storage contributions
  signature: string;        // Signature of the operator
}

/**
 * FractalCoin account
 */
export interface FractalCoinAccount {
  address: string;          // Same as Singularity Coin address
  balance: string;          // FRC token balance
  contributedStorage: number; // In bytes
  contributedComputation: number; // Normalized computation units
  shardIds: string[];       // Owned shards
  rewardRate: number;       // FRC tokens earned per day
  lastRewardClaim: number;  // Timestamp of last reward claim
}

/**
 * Network statistics
 */
export interface FractalNetworkStats {
  totalNodes: number;
  totalShards: number;
  totalStorage: number;     // In bytes
  totalComputation: number; // Normalized computation units
  activeContributors: number;
  circulatingSupply: string; // Total FRC in circulation
  rewardPool: string;       // Available rewards
  averageRewardRate: number; // Average FRC per day per contributor
  fractalDepth: number;     // Maximum recursive depth
}

/**
 * FractalCoin - Layer 2 blockchain for fractal sharding rewards
 * 
 * Note: In Phase 1, this is primarily designed to interface with 
 * Singularity Coin (Layer 1) and manage the foundational components
 * for fractal sharding. Phase 2 will expand this into a complete
 * Layer 2 blockchain system.
 */
export class FractalCoin {
  private static instance: FractalCoin;
  private accounts: Map<string, FractalCoinAccount> = new Map();
  private shardNodes: Map<string, FractalShardNode> = new Map();
  private operations: L2Operation[] = [];
  
  private networkStats: FractalNetworkStats = {
    totalNodes: 0,
    totalShards: 0,
    totalStorage: 0,
    totalComputation: 0,
    activeContributors: 0,
    circulatingSupply: '1000000',  // Initial supply
    rewardPool: '500000',          // Initial reward pool
    averageRewardRate: 0,
    fractalDepth: 0,
  };
  
  /**
   * Get singleton instance
   */
  public static getInstance(): FractalCoin {
    if (!FractalCoin.instance) {
      FractalCoin.instance = new FractalCoin();
    }
    return FractalCoin.instance;
  }
  
  private constructor() {
    // Initialize with foundational data structures
    this.initializeSystem();
  }
  
  /**
   * Initialize the basic system
   * @private
   */
  private initializeSystem(): void {
    console.log('Initializing FractalCoin Layer 2 system...');
    
    // In a real implementation, this would connect to Singularity Coin
    // and initialize the fractal network
  }
  
  /**
   * Creates a new FractalCoin account linked to a Singularity account
   * @param singularityAddress The Singularity Coin address to link
   * @returns The new FractalCoin account or null if creation failed
   */
  public createAccount(singularityAddress: string): FractalCoinAccount | null {
    // Check if the Singularity address exists
    const singularityAccount = singularityCoin.getAccount(singularityAddress);
    if (!singularityAccount) return null;
    
    // Check if account already exists for this address
    if (this.accounts.has(singularityAddress)) {
      return this.accounts.get(singularityAddress) || null;
    }
    
    // Create new account
    const newAccount: FractalCoinAccount = {
      address: singularityAddress,
      balance: '0',
      contributedStorage: 0,
      contributedComputation: 0,
      shardIds: [],
      rewardRate: 0,
      lastRewardClaim: Math.floor(Date.now() / 1000),
    };
    
    this.accounts.set(singularityAddress, newAccount);
    this.networkStats.activeContributors += 1;
    
    return newAccount;
  }
  
  /**
   * Gets account information
   * @param address The account address
   */
  public getAccount(address: string): FractalCoinAccount | undefined {
    return this.accounts.get(address);
  }
  
  /**
   * Creates a new fractal shard node in the network
   * @param ownerAddress Address of the shard owner
   * @param pattern Fractal pattern to use for this shard
   * @param parentId Optional parent shard ID for nesting
   * @param storageSize Storage size in bytes
   * @param data Optional data or reference
   */
  public createShardNode(
    ownerAddress: string,
    pattern: FractalPattern = FractalPattern.MANDELBROT,
    parentId?: string,
    storageSize: number = 1024,
    data?: any,
  ): FractalShardNode | null {
    // Check if owner exists
    const account = this.accounts.get(ownerAddress);
    if (!account) return null;
    
    // Check parent if specified
    let parent: FractalShardNode | undefined;
    if (parentId) {
      parent = this.shardNodes.get(parentId);
      if (!parent) return null;
    }
    
    const now = Math.floor(Date.now() / 1000);
    const complexity = this.calculateComplexity(pattern, parentId ? 1 : 0);
    
    // Create the shard node
    const shardNode: FractalShardNode = {
      id: uuidv4(),
      parentId,
      childrenIds: [],
      ownerAddress,
      pattern,
      complexity,
      storageSize,
      creationTimestamp: now,
      lastModified: now,
      rewardRate: this.calculateRewardRate(complexity, storageSize),
      validationCount: 0,
      data,
    };
    
    // Add to shard nodes map
    this.shardNodes.set(shardNode.id, shardNode);
    
    // Update parent if it exists
    if (parent) {
      parent.childrenIds.push(shardNode.id);
      parent.lastModified = now;
      this.shardNodes.set(parentId!, parent);
    }
    
    // Update owner's account
    account.shardIds.push(shardNode.id);
    account.contributedStorage += storageSize;
    account.rewardRate += shardNode.rewardRate;
    this.accounts.set(ownerAddress, account);
    
    // Update network stats
    this.networkStats.totalNodes += 1;
    this.networkStats.totalShards += 1;
    this.networkStats.totalStorage += storageSize;
    
    // Record the operation
    this.recordOperation(
      L2OperationType.SHARD_CREATION,
      ownerAddress,
      [shardNode.id],
    );
    
    return shardNode;
  }
  
  /**
   * Gets information about a shard node
   * @param shardId ID of the shard
   */
  public getShardNode(shardId: string): FractalShardNode | undefined {
    return this.shardNodes.get(shardId);
  }
  
  /**
   * Gets all shard nodes owned by an address
   * @param ownerAddress The owner's address
   */
  public getShardsByOwner(ownerAddress: string): FractalShardNode[] {
    const account = this.accounts.get(ownerAddress);
    if (!account) return [];
    
    return account.shardIds
      .map(id => this.shardNodes.get(id))
      .filter((shard): shard is FractalShardNode => shard !== undefined);
  }
  
  /**
   * Records a contribution to the fractal network (storage or computation)
   * @param contributorAddress Address of the contributor
   * @param type Type of contribution
   * @param units Number of units contributed
   * @param affectedShards Shards affected by the contribution
   */
  public recordContribution(
    contributorAddress: string,
    type: L2OperationType.STORAGE_CONTRIBUTION | L2OperationType.COMPUTATION_CONTRIBUTION,
    units: number,
    affectedShards: string[],
  ): boolean {
    const account = this.accounts.get(contributorAddress);
    if (!account) return false;
    
    // Check if shards exist
    const validShards = affectedShards.filter(id => this.shardNodes.has(id));
    if (validShards.length === 0) return false;
    
    // Record operation
    this.recordOperation(
      type,
      contributorAddress,
      validShards,
      undefined,
      type === L2OperationType.COMPUTATION_CONTRIBUTION ? units : undefined,
      type === L2OperationType.STORAGE_CONTRIBUTION ? units : undefined,
    );
    
    // Update account
    if (type === L2OperationType.STORAGE_CONTRIBUTION) {
      account.contributedStorage += units;
      this.networkStats.totalStorage += units;
    } else {
      account.contributedComputation += units;
      this.networkStats.totalComputation += units;
    }
    
    // Update reward rate
    const additionalReward = this.calculateRewardRateForContribution(type, units);
    account.rewardRate += additionalReward;
    
    // Save updates
    this.accounts.set(contributorAddress, account);
    
    return true;
  }
  
  /**
   * Claims accumulated rewards for an account
   * @param address The address claiming rewards
   * @returns The amount claimed or null if claim failed
   */
  public claimRewards(address: string): string | null {
    const account = this.accounts.get(address);
    if (!account) return null;
    
    const now = Math.floor(Date.now() / 1000);
    const secondsSinceLastClaim = now - account.lastRewardClaim;
    const daysElapsed = secondsSinceLastClaim / 86400; // Convert to days
    
    // Calculate rewards
    const rewardAmount = account.rewardRate * daysElapsed;
    
    // Check reward pool
    if (parseFloat(this.networkStats.rewardPool) < rewardAmount) {
      return null; // Not enough in the reward pool
    }
    
    // Update account
    account.balance = (parseFloat(account.balance) + rewardAmount).toString();
    account.lastRewardClaim = now;
    
    // Update network stats
    this.networkStats.rewardPool = (
      parseFloat(this.networkStats.rewardPool) - rewardAmount
    ).toString();
    
    // Record operation
    this.recordOperation(
      L2OperationType.REWARD_DISTRIBUTION,
      address,
      account.shardIds,
      rewardAmount.toString(),
    );
    
    this.accounts.set(address, account);
    
    return rewardAmount.toString();
  }
  
  /**
   * Gets the current network statistics
   */
  public getNetworkStats(): FractalNetworkStats {
    return { ...this.networkStats };
  }
  
  /**
   * Gets recent operations, optionally filtered by type
   * @param limit Maximum number of operations to return
   * @param type Optional operation type filter
   */
  public getRecentOperations(
    limit: number = 10,
    type?: L2OperationType
  ): L2Operation[] {
    const filtered = type 
      ? this.operations.filter(op => op.type === type)
      : this.operations;
    
    return filtered
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
  
  /**
   * Calculate the complexity of a fractal pattern
   * @private
   */
  private calculateComplexity(pattern: FractalPattern, depth: number): number {
    // Base complexities
    const baseComplexity = {
      [FractalPattern.MANDELBROT]: 10,
      [FractalPattern.JULIA]: 8,
      [FractalPattern.SIERPINSKI]: 6,
      [FractalPattern.MENGER]: 9,
      [FractalPattern.HEXAGONAL]: 7,
    };
    
    // Add depth bonus
    const depthMultiplier = 1 + (depth * 0.2); // 20% bonus per depth level
    
    return baseComplexity[pattern] * depthMultiplier;
  }
  
  /**
   * Calculate reward rate for a shard
   * @private
   */
  private calculateRewardRate(complexity: number, storageSize: number): number {
    // Base reward is 0.1 FRC per day
    const baseReward = 0.1;
    
    // Adjust for complexity and storage
    const complexityFactor = complexity / 10;
    const storageFactor = Math.log10(storageSize) / 10;
    
    return baseReward * (complexityFactor + storageFactor);
  }
  
  /**
   * Calculate reward rate for a contribution
   * @private
   */
  private calculateRewardRateForContribution(
    type: L2OperationType.STORAGE_CONTRIBUTION | L2OperationType.COMPUTATION_CONTRIBUTION,
    units: number
  ): number {
    const isStorage = type === L2OperationType.STORAGE_CONTRIBUTION;
    
    // Base rates
    const storageRatePerGB = 0.5; // 0.5 FRC per day per GB
    const computationRatePerUnit = 0.02; // 0.02 FRC per day per computation unit
    
    if (isStorage) {
      const storageGB = units / (1024 * 1024 * 1024); // Convert bytes to GB
      return storageRatePerGB * storageGB;
    } else {
      return computationRatePerUnit * units;
    }
  }
  
  /**
   * Record an operation in the system
   * @private
   */
  private recordOperation(
    type: L2OperationType,
    performedBy: string,
    shardIds: string[],
    rewardAmount?: string,
    computationUnits?: number,
    storageUnits?: number,
  ): void {
    const operation: L2Operation = {
      id: uuidv4(),
      type,
      timestamp: Math.floor(Date.now() / 1000),
      performedBy,
      shardIds,
      rewardAmount,
      computationUnits,
      storageUnits,
      signature: this.signOperation(type, performedBy, shardIds),
    };
    
    this.operations.push(operation);
    
    // Limit operations history (keep last 1000)
    if (this.operations.length > 1000) {
      this.operations = this.operations.slice(-1000);
    }
  }
  
  /**
   * Sign an operation (simulation)
   * @private
   */
  private signOperation(
    type: L2OperationType,
    performedBy: string,
    shardIds: string[],
  ): string {
    // In a real implementation, this would use quantum-resistant signatures
    const payload = JSON.stringify({ type, performedBy, shardIds, timestamp: Date.now() });
    return CryptoJS.SHA256(payload).toString();
  }
}

// Export singleton instance
export const fractalCoin = FractalCoin.getInstance();
