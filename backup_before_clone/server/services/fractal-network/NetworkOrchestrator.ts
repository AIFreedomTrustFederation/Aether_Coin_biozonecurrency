/**
 * NetworkOrchestrator.ts
 * 
 * This service manages the FractalCoin distributed network,
 * handling node registration, shard allocation, and high-availability
 * functionality across the fractal sharded network.
 */

import crypto from 'crypto';

// Node types in the fractal network
export enum NodeType {
  VALIDATOR = 'validator',
  STORAGE = 'storage',
  COMPUTE = 'compute',
  HYBRID = 'hybrid',
  GATEWAY = 'gateway'
}

// Node status in the network
export enum NodeStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  ACTIVE = 'active',
  STANDBY = 'standby',
  OFFLINE = 'offline',
  PENALIZED = 'penalized'
}

// Node resources and capabilities
export interface NodeResources {
  storageCapacity: number; // in MB
  computeUnits: number;
  bandwidth: number; // in Mbps
  reliability: number; // 0-1 score
  uptime: number; // seconds
}

// Network node definition
export interface NetworkNode {
  id: string;
  owner: string; // wallet address
  nodeType: NodeType;
  status: NodeStatus;
  shardId: string;
  fractalLevel: number;
  resources: NodeResources;
  lastSeen: Date;
  firstSeen: Date;
  publicKey: string;
  quantumSecureKey?: string;
  highAvailability: boolean;
  peers: string[]; // array of peer node IDs
  rewards: {
    total: number;
    lastClaim: Date;
    rate: number; // rewards per hour
  };
}

// Network shard definition
export interface NetworkShard {
  id: string;
  level: number;
  parentId: string | null;
  childShards: string[];
  nodes: {
    total: number;
    active: number;
    standby: number;
  };
  capacity: {
    max: number;
    current: number;
  };
  metrics: {
    availability: number; // percentage
    reliability: number; // 0-1 score
    performance: number; // 0-1 score
    latency: number; // milliseconds
  };
  createdAt: Date;
  lastRebalanced: Date;
}

/**
 * Network Orchestrator Service
 * Manages the FractalCoin distributed network and fractal sharding
 */
export class NetworkOrchestrator {
  private shards: Map<string, NetworkShard>;
  private nodes: Map<string, NetworkNode>;
  private pendingRegistrations: Map<string, any>;
  private shardRebalanceInterval: NodeJS.Timeout | null;
  private highAvailabilityMonitorInterval: NodeJS.Timeout | null;
  
  constructor() {
    this.shards = new Map();
    this.nodes = new Map();
    this.pendingRegistrations = new Map();
    this.shardRebalanceInterval = null;
    this.highAvailabilityMonitorInterval = null;
    
    // Initialize with genesis shard
    this.initializeGenesisNetwork();
    
    // Set up monitoring intervals
    this.setupIntervals();
  }
  
  /**
   * Initialize the genesis network with base shards
   */
  private initializeGenesisNetwork() {
    // Create genesis shard
    const genesisShard: NetworkShard = {
      id: 'genesis',
      level: 0,
      parentId: null,
      childShards: ['alpha-1', 'beta-1', 'gamma-1'],
      nodes: {
        total: 1,
        active: 1,
        standby: 0
      },
      capacity: {
        max: 100,
        current: 1
      },
      metrics: {
        availability: 100,
        reliability: 1,
        performance: 1,
        latency: 1
      },
      createdAt: new Date(),
      lastRebalanced: new Date()
    };
    
    // Add genesis shard
    this.shards.set('genesis', genesisShard);
    
    // Create level 1 shards
    const level1Shards = [
      {
        id: 'alpha-1',
        parentId: 'genesis',
        childShards: ['alpha-1-1', 'alpha-1-2', 'alpha-1-3']
      },
      {
        id: 'beta-1',
        parentId: 'genesis',
        childShards: ['beta-1-1', 'beta-1-2', 'beta-1-3']
      },
      {
        id: 'gamma-1',
        parentId: 'genesis',
        childShards: ['gamma-1-1', 'gamma-1-2', 'gamma-1-3']
      }
    ];
    
    // Add level 1 shards
    for (const shardData of level1Shards) {
      const shard: NetworkShard = {
        id: shardData.id,
        level: 1,
        parentId: shardData.parentId,
        childShards: shardData.childShards,
        nodes: {
          total: 0,
          active: 0,
          standby: 0
        },
        capacity: {
          max: 75,
          current: 0
        },
        metrics: {
          availability: 99.9,
          reliability: 0.99,
          performance: 0.95,
          latency: 5
        },
        createdAt: new Date(),
        lastRebalanced: new Date()
      };
      
      this.shards.set(shardData.id, shard);
    }
    
    // Create some level 2 shards
    const level2ShardIds = [
      'alpha-1-1', 'alpha-1-2', 'alpha-1-3',
      'beta-1-1', 'beta-1-2', 'beta-1-3',
      'gamma-1-1', 'gamma-1-2', 'gamma-1-3'
    ];
    
    for (const shardId of level2ShardIds) {
      const parentId = shardId.split('-').slice(0, 2).join('-');
      
      const shard: NetworkShard = {
        id: shardId,
        level: 2,
        parentId: parentId,
        childShards: [],
        nodes: {
          total: 0,
          active: 0,
          standby: 0
        },
        capacity: {
          max: 50,
          current: 0
        },
        metrics: {
          availability: 99.5,
          reliability: 0.95,
          performance: 0.9,
          latency: 15
        },
        createdAt: new Date(),
        lastRebalanced: new Date()
      };
      
      this.shards.set(shardId, shard);
    }
    
    console.log(`Initialized genesis network with ${this.shards.size} shards`);
  }
  
  /**
   * Set up monitoring intervals
   */
  private setupIntervals() {
    // Rebalance shards every 30 minutes
    this.shardRebalanceInterval = setInterval(() => {
      this.rebalanceShards();
    }, 30 * 60 * 1000);
    
    // Monitor high availability every 5 minutes
    this.highAvailabilityMonitorInterval = setInterval(() => {
      this.monitorHighAvailability();
    }, 5 * 60 * 1000);
  }
  
  /**
   * Register a new node in the network
   * @param registrationData Node registration data
   * @returns Registration result
   */
  public async registerNode(registrationData: any): Promise<any> {
    try {
      // Validate registration data
      if (!registrationData.owner || !registrationData.publicKey) {
        throw new Error('Missing required registration data');
      }
      
      // Verify owner signature if provided
      if (registrationData.signature) {
        const isValid = this.verifySignature(
          JSON.stringify({ owner: registrationData.owner, timestamp: registrationData.timestamp }),
          registrationData.signature
        );
        
        if (!isValid) {
          throw new Error('Invalid signature');
        }
      }
      
      // Generate node ID
      const nodeId = `node-${this.generateHash(registrationData.owner + Date.now()).substring(0, 16)}`;
      
      // Find optimal shard using fractal allocation algorithm
      const optimalShard = this.findOptimalShard(registrationData);
      
      if (!optimalShard) {
        throw new Error('No suitable shard found');
      }
      
      // Create new node
      const newNode: NetworkNode = {
        id: nodeId,
        owner: registrationData.owner,
        nodeType: registrationData.nodeType || NodeType.HYBRID,
        status: NodeStatus.PENDING,
        shardId: optimalShard.id,
        fractalLevel: optimalShard.level,
        resources: {
          storageCapacity: registrationData.resources?.storageCapacity || 512,
          computeUnits: registrationData.resources?.computeUnits || 4,
          bandwidth: registrationData.resources?.bandwidth || 50,
          reliability: 0.5, // Initial reliability score
          uptime: 0
        },
        lastSeen: new Date(),
        firstSeen: new Date(),
        publicKey: registrationData.publicKey,
        quantumSecureKey: registrationData.quantumSecureKey,
        highAvailability: registrationData.highAvailability || false,
        peers: [],
        rewards: {
          total: 0,
          lastClaim: new Date(),
          rate: this.calculateRewardRate(optimalShard.level, false)
        }
      };
      
      // Add node to the network
      this.nodes.set(nodeId, newNode);
      
      // Update shard capacity
      const shard = this.shards.get(optimalShard.id);
      if (shard) {
        shard.nodes.total += 1;
        shard.capacity.current += 1;
      }
      
      console.log(`Registered new node ${nodeId} in shard ${optimalShard.id}`);
      
      // Return registration information
      return {
        success: true,
        nodeId,
        shardId: optimalShard.id,
        fractalLevel: optimalShard.level,
        status: NodeStatus.PENDING,
        nextSteps: [
          {
            action: 'sync',
            description: 'Synchronize with the network',
            estimatedTimeSeconds: 300
          },
          {
            action: 'activate',
            description: 'Activate node for the network',
            estimatedTimeSeconds: 60
          }
        ]
      };
    } catch (error) {
      console.error('Error registering node:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Find the optimal shard for a node using fractal allocation
   * @param nodeData Node data for allocation
   * @returns Optimal shard
   */
  private findOptimalShard(nodeData: any): NetworkShard | null {
    // Algorithm parameters
    const parameters = {
      capacityWeight: 0.4,
      reliabilityWeight: 0.3,
      latencyWeight: 0.2,
      geographicWeight: 0.1
    };
    
    // Get all available shards
    const availableShards = Array.from(this.shards.values())
      .filter(shard => shard.capacity.current < shard.capacity.max);
    
    if (availableShards.length === 0) {
      return null;
    }
    
    // Score each shard
    const scoredShards = availableShards.map(shard => {
      // Capacity score (lower is better)
      const capacityScore = (shard.capacity.current / shard.capacity.max);
      
      // Reliability score (higher is better)
      const reliabilityScore = shard.metrics.reliability;
      
      // Latency score (lower is better, normalize to 0-1)
      const latencyScore = 1 - (shard.metrics.latency / 100);
      
      // Geographic score (mocked for now)
      const geographicScore = Math.random();
      
      // Calculate combined score (higher is better)
      const score = 
        ((1 - capacityScore) * parameters.capacityWeight) +
        (reliabilityScore * parameters.reliabilityWeight) +
        (latencyScore * parameters.latencyWeight) +
        (geographicScore * parameters.geographicWeight);
      
      return { shard, score };
    });
    
    // Sort by score (descending)
    scoredShards.sort((a, b) => b.score - a.score);
    
    // Return the highest scoring shard
    return scoredShards[0]?.shard || null;
  }
  
  /**
   * Get node status
   * @param nodeId Node ID
   * @returns Node status
   */
  public getNodeStatus(nodeId: string): any {
    const node = this.nodes.get(nodeId);
    
    if (!node) {
      return {
        exists: false,
        message: 'Node not found'
      };
    }
    
    const shard = this.shards.get(node.shardId);
    
    return {
      exists: true,
      id: node.id,
      status: node.status,
      shardId: node.shardId,
      fractalLevel: node.fractalLevel,
      highAvailability: node.highAvailability,
      resources: node.resources,
      rewards: node.rewards,
      shard: shard ? {
        id: shard.id,
        level: shard.level,
        metrics: shard.metrics
      } : null
    };
  }
  
  /**
   * Update node status
   * @param nodeId Node ID
   * @param status New status
   * @param additionalData Additional update data
   * @returns Update result
   */
  public updateNodeStatus(nodeId: string, status: NodeStatus, additionalData: any = {}): boolean {
    const node = this.nodes.get(nodeId);
    
    if (!node) {
      return false;
    }
    
    // Update node status
    node.status = status;
    node.lastSeen = new Date();
    
    // Update additional fields
    if (additionalData.resources) {
      node.resources = {
        ...node.resources,
        ...additionalData.resources
      };
    }
    
    if (additionalData.highAvailability !== undefined) {
      node.highAvailability = additionalData.highAvailability;
      
      // Update reward rate for high availability
      node.rewards.rate = this.calculateRewardRate(node.fractalLevel, node.highAvailability);
    }
    
    // Update uptime
    if (status === NodeStatus.ACTIVE) {
      const lastSeenDiff = Date.now() - node.lastSeen.getTime();
      node.resources.uptime += Math.floor(lastSeenDiff / 1000);
    }
    
    // Update shard node counts
    this.updateShardNodeCounts(node.shardId);
    
    return true;
  }
  
  /**
   * Update shard node counts
   * @param shardId Shard ID
   */
  private updateShardNodeCounts(shardId: string): void {
    const shard = this.shards.get(shardId);
    
    if (!shard) {
      return;
    }
    
    // Count active and standby nodes in this shard
    let activeCount = 0;
    let standbyCount = 0;
    
    for (const node of this.nodes.values()) {
      if (node.shardId === shardId) {
        if (node.status === NodeStatus.ACTIVE) {
          activeCount++;
        } else if (node.status === NodeStatus.STANDBY) {
          standbyCount++;
        }
      }
    }
    
    // Update shard node counts
    shard.nodes.active = activeCount;
    shard.nodes.standby = standbyCount;
  }
  
  /**
   * Rebalance shards to maintain optimal network distribution
   */
  private rebalanceShards(): void {
    console.log('Rebalancing shards...');
    
    // Get all shards
    const allShards = Array.from(this.shards.values());
    
    // Find imbalanced shards
    const overloadedShards = allShards.filter(shard => 
      shard.capacity.current > (shard.capacity.max * 0.9)
    );
    
    // Rebalance overloaded shards
    for (const shard of overloadedShards) {
      this.expandShard(shard);
    }
    
    // Update last rebalanced timestamp
    for (const shard of allShards) {
      shard.lastRebalanced = new Date();
    }
    
    console.log(`Rebalanced ${overloadedShards.length} shards`);
  }
  
  /**
   * Expand a shard by creating child shards or migrating nodes
   * @param shard Shard to expand
   */
  private expandShard(shard: NetworkShard): void {
    // If this shard has fewer than 3 child shards, create a new one
    if (shard.childShards.length < 3) {
      const newShardId = `${shard.id}-${shard.childShards.length + 1}`;
      
      // Create new child shard
      const newShard: NetworkShard = {
        id: newShardId,
        level: shard.level + 1,
        parentId: shard.id,
        childShards: [],
        nodes: {
          total: 0,
          active: 0,
          standby: 0
        },
        capacity: {
          max: Math.floor(shard.capacity.max * 0.7), // Child shards have 70% of parent capacity
          current: 0
        },
        metrics: {
          availability: 99.5,
          reliability: 0.95,
          performance: 0.9,
          latency: shard.metrics.latency + 5
        },
        createdAt: new Date(),
        lastRebalanced: new Date()
      };
      
      // Add new shard
      this.shards.set(newShardId, newShard);
      
      // Update parent's child shards
      shard.childShards.push(newShardId);
      
      console.log(`Created new shard ${newShardId}`);
      
      // Migrate some nodes to the new shard
      this.migrateNodesToShard(shard.id, newShardId, Math.floor(shard.capacity.current * 0.3));
    } else {
      // Migrate nodes to existing child shards
      const childShards = shard.childShards
        .map(id => this.shards.get(id))
        .filter(s => s && s.capacity.current < s.capacity.max);
      
      if (childShards.length > 0) {
        // Find child shard with most capacity
        childShards.sort((a, b) => 
          (b.capacity.max - b.capacity.current) - (a.capacity.max - a.capacity.current)
        );
        
        const targetShard = childShards[0];
        
        // Migrate some nodes
        this.migrateNodesToShard(
          shard.id, 
          targetShard.id,
          Math.min(
            Math.floor(shard.capacity.current * 0.2),
            targetShard.capacity.max - targetShard.capacity.current
          )
        );
      }
    }
  }
  
  /**
   * Migrate nodes from one shard to another
   * @param fromShardId Source shard ID
   * @param toShardId Destination shard ID
   * @param count Number of nodes to migrate
   */
  private migrateNodesToShard(fromShardId: string, toShardId: string, count: number): void {
    // Get source and destination shards
    const sourceShard = this.shards.get(fromShardId);
    const destShard = this.shards.get(toShardId);
    
    if (!sourceShard || !destShard || count <= 0) {
      return;
    }
    
    // Get nodes from source shard, prioritizing standby nodes
    const candidateNodes = Array.from(this.nodes.values())
      .filter(node => node.shardId === fromShardId)
      .sort((a, b) => {
        // Standby nodes first, then by uptime (less uptime first)
        if (a.status === NodeStatus.STANDBY && b.status !== NodeStatus.STANDBY) {
          return -1;
        }
        if (a.status !== NodeStatus.STANDBY && b.status === NodeStatus.STANDBY) {
          return 1;
        }
        return a.resources.uptime - b.resources.uptime;
      })
      .slice(0, count);
    
    // Migrate nodes
    let migratedCount = 0;
    
    for (const node of candidateNodes) {
      // Update node's shard
      node.shardId = toShardId;
      node.fractalLevel = destShard.level;
      
      // Update reward rate based on new level
      node.rewards.rate = this.calculateRewardRate(node.fractalLevel, node.highAvailability);
      
      migratedCount++;
    }
    
    // Update shard capacities
    if (sourceShard) {
      sourceShard.capacity.current -= migratedCount;
      sourceShard.nodes.total -= migratedCount;
    }
    
    if (destShard) {
      destShard.capacity.current += migratedCount;
      destShard.nodes.total += migratedCount;
    }
    
    // Update node counts
    this.updateShardNodeCounts(fromShardId);
    this.updateShardNodeCounts(toShardId);
    
    console.log(`Migrated ${migratedCount} nodes from ${fromShardId} to ${toShardId}`);
  }
  
  /**
   * Monitor high availability nodes
   */
  private monitorHighAvailability(): void {
    console.log('Monitoring high availability nodes...');
    
    // Get all high availability nodes
    const haNodes = Array.from(this.nodes.values())
      .filter(node => node.highAvailability && node.status === NodeStatus.ACTIVE);
    
    console.log(`Found ${haNodes.length} active high availability nodes`);
    
    // Process offline nodes
    const offlineNodes = Array.from(this.nodes.values())
      .filter(node => 
        node.status !== NodeStatus.ACTIVE && 
        (Date.now() - node.lastSeen.getTime()) > 30 * 60 * 1000 // 30 minutes
      );
    
    // Trigger "Death & Resurrection" model for offline nodes
    for (const node of offlineNodes) {
      // Update status to offline
      if (node.status !== NodeStatus.OFFLINE) {
        node.status = NodeStatus.OFFLINE;
        console.log(`Node ${node.id} marked as offline`);
        
        // Find standby node to activate
        this.activateStandbyNode(node.shardId);
      }
    }
  }
  
  /**
   * Activate a standby node in a shard
   * @param shardId Shard ID
   */
  private activateStandbyNode(shardId: string): void {
    // Get standby nodes in this shard
    const standbyNodes = Array.from(this.nodes.values())
      .filter(node => 
        node.shardId === shardId && 
        node.status === NodeStatus.STANDBY
      );
    
    if (standbyNodes.length === 0) {
      console.log(`No standby nodes available in shard ${shardId}`);
      return;
    }
    
    // Activate the first standby node
    const nodeToActivate = standbyNodes[0];
    nodeToActivate.status = NodeStatus.ACTIVE;
    
    console.log(`Activated standby node ${nodeToActivate.id} in shard ${shardId}`);
    
    // Update shard node counts
    this.updateShardNodeCounts(shardId);
  }
  
  /**
   * Calculate reward rate based on fractal level and high availability
   * @param level Fractal level
   * @param highAvailability Whether high availability is enabled
   * @returns Reward rate per hour
   */
  private calculateRewardRate(level: number, highAvailability: boolean): number {
    // Base reward rate is higher for deeper levels in the fractal
    let baseRate = 0;
    
    // Apply Fibonacci sequence for rewards
    switch (level) {
      case 0: baseRate = 1; break;
      case 1: baseRate = 1; break;
      case 2: baseRate = 2; break;
      case 3: baseRate = 3; break;
      case 4: baseRate = 5; break;
      case 5: baseRate = 8; break;
      default: baseRate = 13; break;
    }
    
    // High availability nodes get 60% more rewards
    if (highAvailability) {
      baseRate *= 1.6;
    }
    
    return baseRate;
  }
  
  /**
   * Get all network shards
   * @returns Array of network shards
   */
  public getAllShards(): NetworkShard[] {
    return Array.from(this.shards.values());
  }
  
  /**
   * Get network statistics
   * @returns Network statistics
   */
  public getNetworkStatistics(): any {
    const totalNodes = this.nodes.size;
    const activeNodes = Array.from(this.nodes.values())
      .filter(node => node.status === NodeStatus.ACTIVE).length;
    const standbyNodes = Array.from(this.nodes.values())
      .filter(node => node.status === NodeStatus.STANDBY).length;
    const haNodes = Array.from(this.nodes.values())
      .filter(node => node.highAvailability).length;
    const totalRewards = Array.from(this.nodes.values())
      .reduce((sum, node) => sum + node.rewards.total, 0);
    
    return {
      nodes: {
        total: totalNodes,
        active: activeNodes,
        standby: standbyNodes,
        highAvailability: haNodes
      },
      shards: {
        total: this.shards.size,
        byLevel: Array.from(this.shards.values()).reduce((acc, shard) => {
          acc[shard.level] = (acc[shard.level] || 0) + 1;
          return acc;
        }, {})
      },
      rewards: {
        total: totalRewards,
        averagePerNode: totalNodes > 0 ? totalRewards / totalNodes : 0
      }
    };
  }
  
  /**
   * Generate a hash for the given data
   * @param data Data to hash
   * @returns Hash string
   */
  private generateHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  /**
   * Verify a signature
   * @param message Original message
   * @param signature Signature to verify
   * @returns Whether the signature is valid
   */
  private verifySignature(message: string, signature: string): boolean {
    // In a real implementation, this would verify using the appropriate algorithm
    // For now, we'll consider any non-empty signature valid
    return signature && signature.length > 0;
  }
  
  /**
   * Clean up when shutting down
   */
  public cleanup(): void {
    // Clear intervals
    if (this.shardRebalanceInterval) {
      clearInterval(this.shardRebalanceInterval);
    }
    
    if (this.highAvailabilityMonitorInterval) {
      clearInterval(this.highAvailabilityMonitorInterval);
    }
    
    console.log('Network orchestrator cleaned up');
  }
}

// Create singleton instance
export const networkOrchestrator = new NetworkOrchestrator();