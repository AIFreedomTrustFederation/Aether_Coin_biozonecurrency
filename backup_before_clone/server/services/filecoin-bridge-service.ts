import crypto from 'crypto';
import { getFractalCoinAPI } from './fractalcoin-api';

// Environment variables
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
  private fractalCoinAPI;
  private mockMode: boolean;

  constructor() {
    // Get the FractalCoin API client
    this.fractalCoinAPI = getFractalCoinAPI();
    
    // Check if we're in mock mode (will be handled by the API client)
    this.mockMode = !process.env.FRACTALCOIN_API_KEY || process.env.FRACTALCOIN_API_KEY === 'localhost-dev-key';

    if (this.mockMode) {
      console.warn('FRACTALCOIN_API_KEY not found in environment or set to development key, FractalCoin-Filecoin Bridge will run in simulation mode');
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
    try {
      log('Allocating storage from FractalCoin network...');
      
      // Use the FractalCoin API client to allocate storage
      const allocationResult = await this.fractalCoinAPI.allocateStorage(bytes, {
        purpose: 'filecoin-bridge',
        redundancy: 3,
        encryption: 'aes-256-gcm'
      });
      
      log('Storage allocation response:', allocationResult);
      
      if (!allocationResult.success) {
        throw new Error(`Failed to allocate storage: ${allocationResult.message}`);
      }
      
      console.log(`✅ Successfully allocated ${this.formatBytes(bytes)} of storage from FractalCoin network`);
      console.log(`📊 Distributed across ${allocationResult.nodes.length} nodes`);
      
      return {
        allocatedBytes: bytes,
        nodeIds: allocationResult.nodes.map(node => node.id)
      };
    } catch (error: any) {
      console.error('Error allocating FractalCoin storage:', error.message);
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
      
      // Use the FractalCoin API client to register the bridge
      const registerResponse = await this.fractalCoinAPI.registerBridge({
        type: 'filecoin',
        config: bridgeConfig
      });
      
      log('Bridge registration response:', registerResponse);
      
      if (!registerResponse.success) {
        throw new Error(`Failed to register bridge: ${registerResponse.message}`);
      }
      
      const bridgeCid = registerResponse.cid;
      
      console.log(`✅ Successfully registered FractalCoin-Filecoin bridge`);
      console.log(`🔗 Bridge CID: ${bridgeCid}`);
      console.log(`📊 Allocated storage: ${this.formatBytes(allocation.allocatedBytes)}`);
      console.log(`🖥️  Nodes: ${allocation.nodeIds.length}`);
      
      return bridgeCid;
    } catch (error: any) {
      console.error('Error registering with Filecoin:', error.message);
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