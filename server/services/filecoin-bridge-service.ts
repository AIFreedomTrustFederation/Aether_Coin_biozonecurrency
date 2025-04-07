import axios from 'axios';
import crypto from 'crypto';

// Environment variables
const FRACTALCOIN_API_KEY = process.env.FRACTALCOIN_API_KEY;
const FRACTALCOIN_API_ENDPOINT = process.env.FRACTALCOIN_API_ENDPOINT || 'https://api.fractalcoin.network/v1';
const DEBUG = process.env.DEBUG === 'true';

// Debug logging
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[FractalCoin-Filecoin Bridge]', ...args);
  }
}

/**
 * FractalCoin-Filecoin Bridge Service
 * Manages the bridge between FractalCoin's sharded storage network and Filecoin
 */
export class FilecoinBridgeService {
  private apiKey: string | undefined;
  private apiEndpoint: string;
  private mockMode: boolean;

  constructor() {
    this.apiKey = FRACTALCOIN_API_KEY;
    this.apiEndpoint = FRACTALCOIN_API_ENDPOINT;
    this.mockMode = !this.apiKey;

    if (this.mockMode) {
      console.warn('FRACTALCOIN_API_KEY not found in environment, FractalCoin-Filecoin Bridge will run in simulation mode');
    }
  }

  /**
   * Allocate FractalCoin storage to Filecoin network
   * @param bytes Number of bytes to allocate
   * @returns Storage allocation details
   */
  async allocateFractalCoinStorage(bytes: number = 104857600): Promise<{
    allocatedBytes: number;
    nodeIds: string[];
  }> {
    if (this.mockMode) {
      return this.mockAllocation(bytes);
    }

    try {
      log('Allocating storage from FractalCoin network...');
      
      // API call to allocate storage from FractalCoin network
      const response = await axios.post(
        `${this.apiEndpoint}/storage/allocate`,
        {
          bytes,
          purpose: 'filecoin-bridge',
          redundancy: 3, // Number of redundant shards
          encryption: 'aes-256-gcm'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      log('Storage allocation response:', response.data);
      
      if (!response.data.success) {
        throw new Error(`Failed to allocate storage: ${response.data.message}`);
      }
      
      console.log(`✅ Successfully allocated ${this.formatBytes(bytes)} of storage from FractalCoin network`);
      console.log(`📊 Distributed across ${response.data.nodes.length} nodes`);
      
      return {
        allocatedBytes: bytes,
        nodeIds: response.data.nodes.map((node: any) => node.id)
      };
    } catch (error: any) {
      console.error('Error allocating FractalCoin storage:', error.message);
      if (error.response) {
        console.error('API response:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Register FractalCoin storage with Filecoin network
   * @param allocation Result from allocateFractalCoinStorage()
   * @returns Filecoin bridge CID
   */
  async registerWithFilecoin(allocation: {
    allocatedBytes: number;
    nodeIds: string[];
  }): Promise<string> {
    if (this.mockMode) {
      return this.mockRegistration(allocation);
    }

    try {
      log('Registering FractalCoin storage with Filecoin network...');
      
      // Generate a unique identifier for this bridge
      const bridgeId = crypto.randomBytes(16).toString('hex');
      
      // Create storage bridge configuration
      const bridgeConfig = {
        id: bridgeId,
        allocatedBytes: allocation.allocatedBytes,
        nodes: allocation.nodeIds,
        access: {
          protocol: 'fractalcoin-bridge-v1',
          endpoints: allocation.nodeIds.map(id => `https://${id}.storage.fractalcoin.network`),
          retrieval: {
            method: 'http',
            authType: 'bearer'
          }
        },
        metadata: {
          name: 'FractalCoin-Filecoin Bridge',
          description: 'Bidirectional storage bridge between FractalCoin and Filecoin',
          created: new Date().toISOString()
        }
      };
      
      // Register the bridge with FractalCoin network
      const registerResponse = await axios.post(
        `${this.apiEndpoint}/bridges/create`,
        {
          type: 'filecoin',
          config: bridgeConfig
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      log('Bridge registration response:', registerResponse.data);
      
      if (!registerResponse.data.success) {
        throw new Error(`Failed to register bridge: ${registerResponse.data.message}`);
      }
      
      const bridgeCid = registerResponse.data.cid;
      
      console.log(`✅ Successfully registered FractalCoin-Filecoin bridge`);
      console.log(`🔗 Bridge CID: ${bridgeCid}`);
      console.log(`📊 Allocated storage: ${this.formatBytes(allocation.allocatedBytes)}`);
      console.log(`🖥️  Nodes: ${allocation.nodeIds.length}`);
      
      return bridgeCid;
    } catch (error: any) {
      console.error('Error registering with Filecoin:', error.message);
      if (error.response) {
        console.error('API response:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Mock allocation for testing/development
   */
  private mockAllocation(bytes: number): {
    allocatedBytes: number;
    nodeIds: string[];
  } {
    const nodeCount = Math.min(Math.max(Math.floor(bytes / (10 * 1024 * 1024)), 1), 5);
    const nodeIds = Array.from({ length: nodeCount }, () => crypto.randomBytes(16).toString('hex'));
    
    console.log(`[MOCK] Allocated ${this.formatBytes(bytes)} across ${nodeCount} nodes`);
    
    return {
      allocatedBytes: bytes,
      nodeIds
    };
  }

  /**
   * Mock bridge registration for testing/development
   */
  private mockRegistration(allocation: {
    allocatedBytes: number;
    nodeIds: string[];
  }): string {
    // Create a deterministic CID-like string based on allocation details
    const hash = crypto.createHash('sha256')
      .update(JSON.stringify(allocation))
      .update(Date.now().toString())
      .digest('hex');
    
    // Format as a CID v1
    const cid = `bafybeig${hash.substring(0, 38)}`;
    
    console.log(`[MOCK] Registered bridge with CID: ${cid}`);
    console.log(`[MOCK] Storage: ${this.formatBytes(allocation.allocatedBytes)}`);
    console.log(`[MOCK] Nodes: ${allocation.nodeIds.length}`);
    
    return cid;
  }

  /**
   * Utility function to format bytes into human-readable format
   */
  private formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

// Singleton instance
let bridgeInstance: FilecoinBridgeService | null = null;

/**
 * Get the Filecoin bridge service instance
 */
export function getFilecoinBridge(): FilecoinBridgeService {
  if (!bridgeInstance) {
    bridgeInstance = new FilecoinBridgeService();
  }
  return bridgeInstance;
}