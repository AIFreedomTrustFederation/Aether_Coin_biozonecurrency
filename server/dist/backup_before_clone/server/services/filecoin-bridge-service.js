"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilecoinBridgeService = void 0;
exports.getFilecoinBridge = getFilecoinBridge;
const crypto_1 = __importDefault(require("crypto"));
const fractalcoin_api_1 = require("./fractalcoin-api");
// Environment variables
const DEBUG = process.env.DEBUG === 'true';
// Debug logging
function log(...args) {
    if (DEBUG) {
        console.log('[FractalCoin-Filecoin Bridge]', ...args);
    }
}
/**
 * FractalCoin-Filecoin Bridge Service
 * Manages the bridge between FractalCoin's sharded storage network and Filecoin
 */
class FilecoinBridgeService {
    constructor() {
        // Get the FractalCoin API client
        this.fractalCoinAPI = (0, fractalcoin_api_1.getFractalCoinAPI)();
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
    async allocateFractalCoinStorage(bytes = 104857600) {
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
        }
        catch (error) {
            console.error('Error allocating FractalCoin storage:', error.message);
            throw error;
        }
    }
    /**
     * Register FractalCoin storage with Filecoin network
     * @param allocation Result from allocateFractalCoinStorage()
     * @returns Filecoin bridge CID
     */
    async registerWithFilecoin(allocation) {
        try {
            log('Registering FractalCoin storage with Filecoin network...');
            // Generate a unique identifier for this bridge
            const bridgeId = crypto_1.default.randomBytes(16).toString('hex');
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
        }
        catch (error) {
            console.error('Error registering with Filecoin:', error.message);
            throw error;
        }
    }
    /**
     * Mock allocation for testing/development
     */
    mockAllocation(bytes) {
        const nodeCount = Math.min(Math.max(Math.floor(bytes / (10 * 1024 * 1024)), 1), 5);
        const nodeIds = Array.from({ length: nodeCount }, () => crypto_1.default.randomBytes(16).toString('hex'));
        console.log(`[MOCK] Allocated ${this.formatBytes(bytes)} across ${nodeCount} nodes`);
        return {
            allocatedBytes: bytes,
            nodeIds
        };
    }
    /**
     * Mock bridge registration for testing/development
     */
    mockRegistration(allocation) {
        // Create a deterministic CID-like string based on allocation details
        const hash = crypto_1.default.createHash('sha256')
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
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}
exports.FilecoinBridgeService = FilecoinBridgeService;
// Singleton instance
let bridgeInstance = null;
/**
 * Get the Filecoin bridge service instance
 */
function getFilecoinBridge() {
    if (!bridgeInstance) {
        bridgeInstance = new FilecoinBridgeService();
    }
    return bridgeInstance;
}
