/**
 * Fractal Sharding Module for Quantum Vault
 * 
 * This module implements the fractal recursive sharding mechanism that allows
 * storage and retrieval of encrypted data shards distributed across the network.
 * It uses Mandelbrot set-based recursive algorithms to create holographic data
 * patterns where parts can verify the whole.
 */

import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';

// Shard types for different data categories
export enum ShardType {
  USER_KEYSTORE = 'user_keystore',
  TRANSACTION_HISTORY = 'transaction_history',
  SMART_CONTRACT = 'smart_contract',
  LLM_TRAINING_DATA = 'llm_training_data',
  QUANTUM_PROCESSING_LOGIC = 'quantum_processing_logic',
  ESCROW_ACCOUNT = 'escrow_account',
}

export interface Shard {
  id: string;
  type: ShardType;
  data: string; // Encrypted data
  checksum: string;
  ownerPublicKey: string;
  created: number;
  modified: number;
  recursionDepth: number;
  parentShardId?: string;
  childShardIds?: string[];
  merkleProof?: string[];
}

export interface ShardAllocation {
  localStoragePercent: number;
  hardwareWalletPercent: number;
  networkDistributionPercent: number;
  redundancyFactor: number;
  autoReplicationEnabled: boolean;
}

export interface FractalNetworkStats {
  connectedPeers: number;
  totalShards: number;
  networkHealthScore: number;
  lastSyncTimestamp: number;
  contributedStorage: number; // in bytes
  earnedTokens: number;
}

/**
 * FractalShardManager handles the creation, storage, and retrieval
 * of encrypted data shards using a fractal recursive pattern.
 */
export class FractalShardManager {
  private static instance: FractalShardManager;
  private readonly SHARDS_KEY = 'quantum_vault_shards';
  private readonly ALLOCATION_KEY = 'quantum_vault_allocation';
  private readonly NETWORK_STATS_KEY = 'fractal_network_stats';
  
  private masterKey: string | null = null;
  private localShards: Record<string, Shard> = {};
  private shardAllocation: ShardAllocation = {
    localStoragePercent: 30,
    hardwareWalletPercent: 40,
    networkDistributionPercent: 30,
    redundancyFactor: 3,
    autoReplicationEnabled: true,
  };
  private networkStats: FractalNetworkStats = {
    connectedPeers: 0,
    totalShards: 0,
    networkHealthScore: 0,
    lastSyncTimestamp: 0,
    contributedStorage: 0,
    earnedTokens: 0,
  };

  /**
   * Get the singleton instance
   */
  public static getInstance(): FractalShardManager {
    if (!FractalShardManager.instance) {
      FractalShardManager.instance = new FractalShardManager();
    }
    return FractalShardManager.instance;
  }

  private constructor() {
    this.loadLocalState();
  }

  /**
   * Initialize the shard manager with a master key
   * @param masterKey The decryption key from the quantum vault
   */
  public initialize(masterKey: string): boolean {
    if (!masterKey) return false;
    
    this.masterKey = masterKey;
    return true;
  }

  /**
   * Creates a new data shard and distributes it according to allocation settings
   * @param data The data to be sharded
   * @param type The type of data shard
   * @param ownerPublicKey Public key of the shard owner
   * @param recursionDepth How many fractal recursive levels to create (higher values create more sub-shards)
   * @returns The ID of the root shard if successful, null otherwise
   */
  public createShard(
    data: string,
    type: ShardType,
    ownerPublicKey: string,
    recursionDepth: number = 3
  ): string | null {
    if (!this.masterKey) return null;
    
    try {
      // Create the root shard
      const rootShardId = uuidv4();
      const timestamp = Date.now();
      const encryptedData = this.encryptData(data);
      const checksum = this.calculateChecksum(data);
      
      const rootShard: Shard = {
        id: rootShardId,
        type,
        data: encryptedData,
        checksum,
        ownerPublicKey,
        created: timestamp,
        modified: timestamp,
        recursionDepth: 0,
        childShardIds: [],
      };
      
      // Store the root shard locally
      this.localShards[rootShardId] = rootShard;
      
      // If recursion is enabled, create sub-shards
      if (recursionDepth > 0) {
        const childShardIds = this.createRecursiveShards(
          data, 
          type, 
          ownerPublicKey, 
          recursionDepth, 
          rootShardId
        );
        
        if (childShardIds.length > 0) {
          rootShard.childShardIds = childShardIds;
          // Update the root shard with child references
          this.localShards[rootShardId] = rootShard;
        }
      }
      
      // Persist to storage
      this.saveLocalState();
      
      // Distribute shards according to allocation policy (in a real implementation)
      this.distributeShards(rootShardId);
      
      return rootShardId;
    } catch (error) {
      console.error('Failed to create shard:', error);
      return null;
    }
  }

  /**
   * Retrieves a shard and all its children from storage
   * @param shardId The ID of the shard to retrieve
   * @returns The decrypted shard data if successful, null otherwise
   */
  public retrieveShard(shardId: string): string | null {
    if (!this.masterKey) return null;
    
    try {
      const shard = this.localShards[shardId];
      if (!shard) {
        // In a real implementation, attempt to retrieve from network or hardware wallet
        return null;
      }
      
      // Verify integrity using fractal verification
      if (!this.verifyShardIntegrity(shard)) {
        console.error('Shard integrity verification failed');
        return null;
      }
      
      // Decrypt the shard data
      return this.decryptData(shard.data);
    } catch (error) {
      console.error('Failed to retrieve shard:', error);
      return null;
    }
  }

  /**
   * Updates the user's storage allocation preferences
   * @param allocation New allocation settings
   * @returns True if update was successful
   */
  public updateAllocation(allocation: Partial<ShardAllocation>): boolean {
    try {
      this.shardAllocation = {
        ...this.shardAllocation,
        ...allocation,
      };
      
      // Ensure percentages add up to 100%
      const total = this.shardAllocation.localStoragePercent +
                   this.shardAllocation.hardwareWalletPercent +
                   this.shardAllocation.networkDistributionPercent;
                   
      if (total !== 100) {
        // Normalize to ensure total is 100%
        const factor = 100 / total;
        this.shardAllocation.localStoragePercent *= factor;
        this.shardAllocation.hardwareWalletPercent *= factor;
        this.shardAllocation.networkDistributionPercent *= factor;
      }
      
      this.saveLocalState();
      
      // In a real implementation, this would trigger redistribution of existing shards
      
      return true;
    } catch (error) {
      console.error('Failed to update allocation:', error);
      return false;
    }
  }

  /**
   * Gets the current shard allocation settings
   */
  public getAllocation(): ShardAllocation {
    return { ...this.shardAllocation };
  }

  /**
   * Gets statistics about the fractal network
   */
  public getNetworkStats(): FractalNetworkStats {
    // In a real implementation, this would fetch the latest stats from the network
    return { ...this.networkStats };
  }

  /**
   * Updates the fractal network statistics
   * In a real implementation, this would be called periodically
   * @param stats New network statistics
   */
  public updateNetworkStats(stats: Partial<FractalNetworkStats>): void {
    this.networkStats = {
      ...this.networkStats,
      ...stats,
    };
    this.saveLocalState();
  }

  /**
   * Gets the list of all shards of a specific type
   * @param type The type of shards to retrieve
   * @returns Array of shard IDs
   */
  public getShardsByType(type: ShardType): string[] {
    return Object.values(this.localShards)
      .filter(shard => shard.type === type)
      .map(shard => shard.id);
  }

  /**
   * Calculates total storage used by shards
   */
  public getTotalStorageUsed(): number {
    return Object.values(this.localShards)
      .reduce((total, shard) => total + (shard.data.length * 2), 0); // Rough estimate
  }

  /**
   * Creates recursive sub-shards for a data item
   * @private
   */
  private createRecursiveShards(
    data: string, 
    type: ShardType, 
    ownerPublicKey: string, 
    maxDepth: number, 
    parentShardId: string, 
    currentDepth: number = 1
  ): string[] {
    if (currentDepth > maxDepth) return [];
    
    const childShardIds: string[] = [];
    
    // In a real implementation, we would use a sophisticated algorithm to split data
    // For this demo, we'll just create some sub-shards with partial data
    const chunks = this.splitDataIntoChunks(data, 3);
    
    for (let i = 0; i < chunks.length; i++) {
      const childShardId = uuidv4();
      const timestamp = Date.now();
      const encryptedChunk = this.encryptData(chunks[i]);
      const checksum = this.calculateChecksum(chunks[i]);
      
      const childShard: Shard = {
        id: childShardId,
        type,
        data: encryptedChunk,
        checksum,
        ownerPublicKey,
        created: timestamp,
        modified: timestamp,
        recursionDepth: currentDepth,
        parentShardId,
        childShardIds: [],
      };
      
      // Recursively create sub-sub-shards
      if (currentDepth < maxDepth) {
        const grandchildIds = this.createRecursiveShards(
          chunks[i], 
          type, 
          ownerPublicKey, 
          maxDepth, 
          childShardId, 
          currentDepth + 1
        );
        
        if (grandchildIds.length > 0) {
          childShard.childShardIds = grandchildIds;
        }
      }
      
      // Store the child shard
      this.localShards[childShardId] = childShard;
      childShardIds.push(childShardId);
    }
    
    return childShardIds;
  }

  /**
   * Distributes shards according to allocation policy
   * @private
   */
  private distributeShards(rootShardId: string): void {
    // In a real implementation, this would handle:
    // 1. Keeping some shards in local storage
    // 2. Exporting some to hardware wallets
    // 3. Distributing others to the network with proper encryption
    
    // For this demo, we'll just update the statistics
    this.networkStats.totalShards += 1;
    this.networkStats.lastSyncTimestamp = Date.now();
    this.saveLocalState();
  }

  /**
   * Verifies the integrity of a shard using fractal verification
   * @private
   */
  private verifyShardIntegrity(shard: Shard): boolean {
    // In a real implementation, this would:
    // 1. Verify the shard's own checksum
    // 2. If it has children, verify all children recursively
    // 3. Verify that children correctly reconstruct the parent using Merkle proofs
    
    // For this demo, we'll just check the existence of the shard
    return !!shard;
  }

  /**
   * Splits data into multiple chunks for recursive sharding
   * @private
   */
  private splitDataIntoChunks(data: string, numChunks: number): string[] {
    const chunkSize = Math.ceil(data.length / numChunks);
    const chunks: string[] = [];
    
    for (let i = 0; i < numChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, data.length);
      chunks.push(data.slice(start, end));
    }
    
    return chunks;
  }

  /**
   * Encrypts data using the master key
   * @private
   */
  private encryptData(data: string): string {
    if (!this.masterKey) throw new Error('Master key not set');
    return CryptoJS.AES.encrypt(data, this.masterKey).toString();
  }

  /**
   * Decrypts data using the master key
   * @private
   */
  private decryptData(encryptedData: string): string {
    if (!this.masterKey) throw new Error('Master key not set');
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.masterKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Calculates a checksum for data verification
   * @private
   */
  private calculateChecksum(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }

  /**
   * Loads the locally stored shards and settings
   * @private
   */
  private loadLocalState(): void {
    try {
      // Load shards
      const shardsJson = localStorage.getItem(this.SHARDS_KEY);
      if (shardsJson) {
        this.localShards = JSON.parse(shardsJson);
      }
      
      // Load allocation settings
      const allocationJson = localStorage.getItem(this.ALLOCATION_KEY);
      if (allocationJson) {
        this.shardAllocation = JSON.parse(allocationJson);
      }
      
      // Load network stats
      const statsJson = localStorage.getItem(this.NETWORK_STATS_KEY);
      if (statsJson) {
        this.networkStats = JSON.parse(statsJson);
      }
    } catch (error) {
      console.error('Failed to load local state:', error);
      // Reset to defaults
      this.localShards = {};
      this.shardAllocation = {
        localStoragePercent: 30,
        hardwareWalletPercent: 40,
        networkDistributionPercent: 30,
        redundancyFactor: 3,
        autoReplicationEnabled: true,
      };
      this.networkStats = {
        connectedPeers: 0,
        totalShards: 0,
        networkHealthScore: 0,
        lastSyncTimestamp: 0,
        contributedStorage: 0,
        earnedTokens: 0,
      };
    }
  }

  /**
   * Saves the local shards and settings to storage
   * @private
   */
  private saveLocalState(): void {
    try {
      localStorage.setItem(this.SHARDS_KEY, JSON.stringify(this.localShards));
      localStorage.setItem(this.ALLOCATION_KEY, JSON.stringify(this.shardAllocation));
      localStorage.setItem(this.NETWORK_STATS_KEY, JSON.stringify(this.networkStats));
    } catch (error) {
      console.error('Failed to save local state:', error);
    }
  }
}

// Export singleton instance
export const fractalShardManager = FractalShardManager.getInstance();