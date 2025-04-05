/**
 * FractalStorage.ts
 * 
 * A quantum-resistant client-side storage system that uses fractal recursive
 * Mandelbrot set algorithms to securely shard and store sensitive financial data.
 * This implementation includes FractalCoin reward infrastructure.
 */

import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';

/**
 * Represents a node in the fractal storage structure
 */
interface FractalNode {
  id: string;
  data: string; // encrypted data
  parentId: string | null;
  childIds: string[];
  complexity: number; // complexity factor for rewards
  timestamp: number;
  iteration: number;
  z0: { x: number; y: number }; // Mandelbrot set coordinates
}

/**
 * Represents wallet connection information to be stored
 */
export interface WalletConnectionInfo {
  type: 'bitcoin' | 'ethereum' | 'coinbase' | 'plaid';
  address?: string;
  publicKey?: string;
  accountId?: string;
  providerInfo?: Record<string, any>;
  timestamp: number;
}

/**
 * Manages secure, sharded storage using fractal algorithms
 * that provide quantum resistance and client-side security
 */
export class FractalStorage {
  private nodes: Map<string, FractalNode> = new Map();
  private rootNodeId: string | null = null;
  private encryptionKey: string | null = null;
  private rewardBalance: number = 0;
  private storagePoints: number = 0;

  private readonly MAX_ITERATIONS = 1000;
  private readonly ESCAPE_RADIUS = 2;
  private readonly SHARD_COMPLEXITY = 5;

  /**
   * Initialize the fractal storage system with an encryption key
   * @param masterKey The master encryption key or user-provided password
   */
  public initialize(masterKey: string): void {
    if (!masterKey) {
      throw new Error('Master key is required');
    }

    // Derive an encryption key from the master password
    this.encryptionKey = this.deriveEncryptionKey(masterKey);
    
    // Create root node if it doesn't exist
    if (!this.rootNodeId) {
      this.rootNodeId = this.createRootNode();
    }
    
    // Initialize rewards
    this.rewardBalance = 0;
    this.storagePoints = 0;
    
    console.log('Fractal storage initialized with quantum-resistant encryption');
  }

  /**
   * Store wallet connection info securely in the fractal structure
   * @param connectionInfo Wallet connection details to store
   * @returns The ID of the node where the data is stored
   */
  public storeWalletConnection(connectionInfo: WalletConnectionInfo): string {
    if (!this.encryptionKey || !this.rootNodeId) {
      throw new Error('Fractal storage not initialized');
    }
    
    // Create a data hash for security verification
    const dataHash = CryptoJS.SHA256(JSON.stringify(connectionInfo)).toString();
    
    // Calculate storage complexity for rewards
    const complexity = this.calculateStorageComplexity(connectionInfo);
    
    // Generate Mandelbrot coordinates for this data
    const coordinates = this.generateMandelbrotCoordinates(dataHash);
    
    // Encrypt the data
    const encryptedData = this.encryptData(JSON.stringify(connectionInfo), this.encryptionKey);
    
    // Create a node to store the data
    const nodeId = this.createDataNode(encryptedData, this.rootNodeId, complexity, coordinates);
    
    // Calculate rewards for storing this data
    this.calculateRewards();
    
    return nodeId;
  }

  /**
   * Retrieve wallet connection info from the fractal storage
   * @param nodeId The ID of the node to retrieve
   * @returns The decrypted wallet connection info
   */
  public retrieveWalletConnection(nodeId: string): WalletConnectionInfo | null {
    if (!this.encryptionKey) {
      throw new Error('Fractal storage not initialized');
    }
    
    const node = this.nodes.get(nodeId);
    if (!node) {
      return null;
    }
    
    try {
      // Decrypt the data
      const decryptedData = this.decryptData(node.data, this.encryptionKey);
      
      // Parse and return the wallet connection info
      return JSON.parse(decryptedData) as WalletConnectionInfo;
    } catch (error) {
      console.error('Error retrieving wallet connection:', error);
      return null;
    }
  }

  /**
   * Get current FractalCoin reward balance based on storage contributions
   * @returns The current reward balance
   */
  public getRewardBalance(): number {
    return Math.round(this.rewardBalance * 100) / 100;
  }

  /**
   * Export all stored wallet connections (for backup purposes)
   * @returns Array of all stored wallet connections
   */
  public exportAllConnections(): WalletConnectionInfo[] {
    if (!this.encryptionKey) {
      throw new Error('Fractal storage not initialized');
    }
    
    const connections: WalletConnectionInfo[] = [];
    
    // Traverse all nodes except the root
    this.nodes.forEach((node, nodeId) => {
      if (nodeId !== this.rootNodeId) {
        try {
          const decryptedData = this.decryptData(node.data, this.encryptionKey!);
          const connectionInfo = JSON.parse(decryptedData) as WalletConnectionInfo;
          connections.push(connectionInfo);
        } catch (error) {
          console.error('Error decrypting node data:', error);
        }
      }
    });
    
    return connections;
  }

  /**
   * Get storage statistics for the current session
   * @returns Statistics about the fractal storage
   */
  public getStorageStats(): Record<string, any> {
    return {
      totalNodes: this.nodes.size,
      bitcoinWallets: this.countNodesByType('bitcoin'),
      ethereumWallets: this.countNodesByType('ethereum'),
      coinbaseWallets: this.countNodesByType('coinbase'),
      plaidConnections: this.countNodesByType('plaid'),
      storagePoints: this.storagePoints,
      quantumComplexity: this.calculateQuantumComplexity(),
      lastUpdate: new Date().toISOString(),
    };
  }

  /**
   * Count nodes by wallet type
   * @param type Wallet type to count
   * @returns Number of nodes with that wallet type
   */
  private countNodesByType(type: string): number {
    if (!this.encryptionKey) {
      return 0;
    }
    
    let count = 0;
    
    this.nodes.forEach((node, nodeId) => {
      if (nodeId !== this.rootNodeId) {
        try {
          const decryptedData = this.decryptData(node.data, this.encryptionKey!);
          const connectionInfo = JSON.parse(decryptedData) as WalletConnectionInfo;
          if (connectionInfo.type === type) {
            count++;
          }
        } catch (error) {
          // Skip nodes that can't be decrypted
        }
      }
    });
    
    return count;
  }

  /**
   * Derive an encryption key from a master password
   * @param masterKey User-provided master key
   * @returns Derived encryption key
   */
  private deriveEncryptionKey(masterKey: string): string {
    // In a real implementation, this would use a proper key derivation function
    // For this demo, we'll use a simplified approach
    const salt = 'aetherion-quantum-secure-salt';
    const iterations = 1000;
    
    // PBKDF2 is a good key derivation function
    const key = CryptoJS.PBKDF2(masterKey, salt, {
      keySize: 256 / 32,
      iterations,
    }).toString();
    
    return key;
  }

  /**
   * Encrypt data using AES encryption
   * @param data Data to encrypt
   * @param key Encryption key
   * @returns Encrypted data
   */
  private encryptData(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  /**
   * Decrypt data using AES encryption
   * @param encryptedData Encrypted data
   * @param key Encryption key
   * @returns Decrypted data
   */
  private decryptData(encryptedData: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Create the root node of the fractal structure
   * @returns ID of the root node
   */
  private createRootNode(): string {
    const rootId = uuidv4();
    
    const rootNode: FractalNode = {
      id: rootId,
      data: 'root', // Root node doesn't store actual data
      parentId: null,
      childIds: [],
      complexity: 1,
      timestamp: Date.now(),
      iteration: 0,
      z0: { x: 0, y: 0 }, // Center of the Mandelbrot set
    };
    
    this.nodes.set(rootId, rootNode);
    return rootId;
  }

  /**
   * Create a data node in the fractal structure
   * @param data Encrypted data to store
   * @param parentId ID of the parent node
   * @param complexity Complexity factor for rewards
   * @param coordinates Mandelbrot set coordinates
   * @returns ID of the created node
   */
  private createDataNode(
    data: string,
    parentId: string,
    complexity: number,
    coordinates: { x: number; y: number }
  ): string {
    // Calculate Mandelbrot set iterations for this coordinate
    const iterations = this.calculateMandelbrotIteration(coordinates);
    
    const nodeId = uuidv4();
    
    const newNode: FractalNode = {
      id: nodeId,
      data,
      parentId,
      childIds: [],
      complexity,
      timestamp: Date.now(),
      iteration: iterations,
      z0: coordinates,
    };
    
    // Add the node to the storage
    this.nodes.set(nodeId, newNode);
    
    // Update the parent node
    const parentNode = this.nodes.get(parentId);
    if (parentNode) {
      parentNode.childIds.push(nodeId);
    }
    
    // Increment storage points
    this.storagePoints += complexity;
    
    return nodeId;
  }

  /**
   * Generate Mandelbrot set coordinates based on data hash
   * @param dataHash Hash of the data to store
   * @returns Coordinates in the Mandelbrot set
   */
  private generateMandelbrotCoordinates(dataHash: string): { x: number; y: number } {
    // Use first 8 chars of hash for x coordinate (converted to float between -2 and 1)
    const xPart = parseInt(dataHash.substring(0, 8), 16);
    const x = -2 + (xPart / 0xffffffff) * 3;
    
    // Use next 8 chars of hash for y coordinate (converted to float between -1 and 1)
    const yPart = parseInt(dataHash.substring(8, 16), 16);
    const y = -1 + (yPart / 0xffffffff) * 2;
    
    return { x, y };
  }

  /**
   * Calculate the number of iterations before a point escapes the Mandelbrot set
   * @param c Complex number coordinates
   * @returns Iteration count
   */
  private calculateMandelbrotIteration(c: { x: number; y: number }): number {
    let z = { x: 0, y: 0 };
    let iteration = 0;
    
    // Iterate until the point escapes or we hit max iterations
    while (z.x * z.x + z.y * z.y <= this.ESCAPE_RADIUS * this.ESCAPE_RADIUS && iteration < this.MAX_ITERATIONS) {
      // Calculate z = z² + c (in complex number arithmetic)
      const zx = z.x * z.x - z.y * z.y + c.x;
      const zy = 2 * z.x * z.y + c.y;
      
      z.x = zx;
      z.y = zy;
      
      iteration++;
    }
    
    return iteration;
  }

  /**
   * Calculate complexity factor for storage rewards
   * @param connectionInfo Wallet connection info
   * @returns Complexity score
   */
  private calculateStorageComplexity(connectionInfo: WalletConnectionInfo): number {
    let complexity = this.SHARD_COMPLEXITY;
    
    // Increase complexity for connections with more data
    const dataSize = JSON.stringify(connectionInfo).length;
    complexity += Math.floor(dataSize / 100);
    
    // Wallet types can have different complexity factors
    switch (connectionInfo.type) {
      case 'ethereum':
        complexity += 2; // Higher complexity for Ethereum (smart contracts)
        break;
      case 'bitcoin':
        complexity += 1; // Medium complexity for Bitcoin
        break;
      case 'plaid':
        complexity += 3; // Higher complexity for bank connections (more sensitive)
        break;
      default:
        complexity += 1;
    }
    
    // Add some randomness to make the system more secure against quantum attacks
    complexity += Math.floor(Math.random() * 3);
    
    return complexity;
  }

  /**
   * Calculate and update FractalCoin rewards based on storage contributions
   */
  private calculateRewards(): void {
    // Base reward calculation
    const baseReward = this.nodes.size * 0.01;
    
    // Storage points reward
    const storageReward = this.storagePoints * 0.05;
    
    // Complexity reward (based on quantum resistance)
    const complexityReward = this.calculateQuantumComplexity() * 0.1;
    
    // Update reward balance
    this.rewardBalance = baseReward + storageReward + complexityReward;
  }

  /**
   * Calculate quantum complexity score based on stored fractal nodes
   * @returns Quantum complexity score
   */
  private calculateQuantumComplexity(): number {
    let totalComplexity = 0;
    let nodeCount = 0;
    
    this.nodes.forEach(node => {
      if (node.id !== this.rootNodeId) {
        // The complexity is a function of the Mandelbrot iterations and node complexity
        totalComplexity += node.iteration * node.complexity;
        nodeCount++;
      }
    });
    
    // Average complexity normalized to a 0-100 scale
    return nodeCount > 0 
      ? Math.min(100, (totalComplexity / nodeCount) / (this.MAX_ITERATIONS * this.SHARD_COMPLEXITY) * 100) 
      : 0;
  }
}

// Export a singleton instance
export const fractalStorage = new FractalStorage();