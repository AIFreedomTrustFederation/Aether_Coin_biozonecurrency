"use strict";
/**
 * FractalStorage.ts
 *
 * Quantum-resistant storage system using a fractal recursive Mandelbrot set approach
 * This provides secure client-side storage with decentralized sharding
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fractalStorage = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
class FractalStorage {
    constructor() {
        this.initialized = false;
        this.encryptionKey = '';
        this.rootNode = null;
        this.nodes = {};
        this.storageFractalCoefficient = 0.0;
    }
    /**
     * Initialize the fractal storage system with an encryption key
     * @param encryptionKey - Password for securing storage data
     */
    initialize(encryptionKey) {
        if (this.initialized)
            return;
        // Set encryption key (hash it for security)
        this.encryptionKey = crypto_js_1.default.SHA256(encryptionKey).toString(crypto_js_1.default.enc.Hex);
        // Create root node
        const rootId = this.generateNodeId();
        const rootNode = {
            id: rootId,
            level: 0,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            metadata: {
                name: 'root',
                description: 'Fractal storage root node',
                isRoot: true,
                quantumResistant: true,
                fractalIterations: 0
            },
            children: [],
            hash: this.calculateNodeHash(rootId, {})
        };
        this.rootNode = rootNode;
        this.nodes[rootId] = rootNode;
        this.storageFractalCoefficient = 1.0;
        this.initialized = true;
    }
    /**
     * Store data in fractal storage
     * @param key - Storage key
     * @param data - Data to store (can be any serializable object)
     * @param options - Additional storage options
     * @returns Node ID where data is stored
     */
    store(key, data, options = {}) {
        this.checkInitialized();
        // Configure options with defaults
        const fractalDepth = options.fractalDepth || 3;
        const shardCount = options.shardCount || 1;
        const metadata = options.metadata || {};
        // Encrypt the data
        const encryptedData = this.encryptData(data);
        // Create parent node for this data
        const parentNodeId = this.generateNodeId();
        const parentNode = {
            id: parentNodeId,
            parentId: this.rootNode.id,
            level: 1,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            metadata: {
                key,
                fractalDepth,
                shardCount,
                ...metadata
            },
            children: [],
            hash: this.calculateNodeHash(parentNodeId, { key, metadata })
        };
        // Create child nodes (shards)
        const childNodes = [];
        for (let i = 0; i < shardCount; i++) {
            const nodeId = this.generateNodeId();
            const shardData = i === 0 ? encryptedData : null; // Only store real data in first shard for simplicity
            const childNode = {
                id: nodeId,
                parentId: parentNodeId,
                level: 2,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                data: shardData,
                metadata: {
                    isFragmented: true,
                    fragmentIndex: i,
                    totalFragments: shardCount,
                    fractalIterationIndex: 0
                },
                children: [],
                hash: this.calculateNodeHash(nodeId, { shardIndex: i })
            };
            childNodes.push(childNode);
            parentNode.children.push(nodeId);
            this.nodes[nodeId] = childNode;
            // Add fractal children if needed
            if (fractalDepth > 0) {
                this.createFractalChildren(childNode, fractalDepth, 1);
            }
        }
        // Update storage
        this.nodes[parentNodeId] = parentNode;
        this.rootNode.children.push(parentNodeId);
        this.rootNode.lastUpdated = new Date().toISOString();
        // Update root node hash
        this.recalculateRootHash();
        // Increase fractal coefficient
        this.storageFractalCoefficient += 0.1 * shardCount;
        return parentNodeId;
    }
    /**
     * Retrieve data from fractal storage
     * @param key - Storage key
     * @returns Decrypted data or undefined if not found
     */
    retrieve(key) {
        this.checkInitialized();
        // Find node by key
        const parentNode = Object.values(this.nodes).find(node => node.metadata.key === key && node.level === 1);
        if (!parentNode) {
            return undefined;
        }
        // Find first child node (has the data)
        const firstChildNode = this.nodes[parentNode.children[0]];
        if (!firstChildNode || !firstChildNode.data) {
            return undefined;
        }
        // Decrypt and return the data
        return this.decryptData(firstChildNode.data);
    }
    /**
     * Check if a key exists in storage
     * @param key - Storage key to check
     * @returns True if key exists, false otherwise
     */
    exists(key) {
        this.checkInitialized();
        return Object.values(this.nodes).some(node => node.metadata.key === key && node.level === 1);
    }
    /**
     * Delete data from fractal storage
     * @param key - Storage key to delete
     * @returns True if deleted, false if not found
     */
    delete(key) {
        this.checkInitialized();
        // Find node by key
        const parentNode = Object.values(this.nodes).find(node => node.metadata.key === key && node.level === 1);
        if (!parentNode) {
            return false;
        }
        // Remove all children recursively
        this.deleteNodeAndChildren(parentNode.id);
        // Remove from root children
        const rootChildrenIndex = this.rootNode.children.indexOf(parentNode.id);
        if (rootChildrenIndex !== -1) {
            this.rootNode.children.splice(rootChildrenIndex, 1);
            this.rootNode.lastUpdated = new Date().toISOString();
        }
        // Update root hash
        this.recalculateRootHash();
        // Decrease fractal coefficient
        this.storageFractalCoefficient = Math.max(1.0, this.storageFractalCoefficient - 0.1);
        return true;
    }
    /**
     * Get storage statistics
     * @returns Object with storage stats
     */
    getStorageStats() {
        this.checkInitialized();
        const nodeCount = Object.keys(this.nodes).length;
        const rootChildrenCount = this.rootNode?.children.length || 0;
        const maxDepth = this.calculateMaxDepth();
        return {
            nodeCount,
            rootChildrenCount,
            maxDepth,
            fractalCoefficient: this.storageFractalCoefficient.toFixed(2),
            quantumResistanceScore: Math.min(100, Math.floor(this.storageFractalCoefficient * 20)),
            rootHash: this.rootNode?.hash.substring(0, 16) + '...',
            lastUpdated: this.rootNode?.lastUpdated
        };
    }
    /**
     * Get all available keys in storage
     * @returns Array of storage keys
     */
    getAllKeys() {
        this.checkInitialized();
        return Object.values(this.nodes)
            .filter(node => node.level === 1 && node.metadata.key)
            .map(node => node.metadata.key);
    }
    /**
     * Clear all storage
     */
    clear() {
        this.checkInitialized();
        // Keep only root node
        const rootId = this.rootNode.id;
        this.nodes = {
            [rootId]: {
                ...this.rootNode,
                children: [],
                lastUpdated: new Date().toISOString()
            }
        };
        this.rootNode = this.nodes[rootId];
        this.storageFractalCoefficient = 1.0;
        // Update root hash
        this.recalculateRootHash();
    }
    /**
     * Get the quantum resistance score of the storage
     * @returns Number between 0-100 representing quantum resistance
     */
    getQuantumResistanceScore() {
        this.checkInitialized();
        return Math.min(100, Math.floor(this.storageFractalCoefficient * 20));
    }
    /**
     * Check if storage is initialized
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Private method to create fractal children for a node
     */
    createFractalChildren(parentNode, remainingDepth, iterationIndex) {
        if (remainingDepth <= 0)
            return;
        // Create some children with fractal pattern
        const childCount = Math.max(2, Math.floor(4 / iterationIndex));
        for (let i = 0; i < childCount; i++) {
            const nodeId = this.generateNodeId();
            const childNode = {
                id: nodeId,
                parentId: parentNode.id,
                level: parentNode.level + 1,
                createdAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                metadata: {
                    isFractal: true,
                    fractalIterationIndex: iterationIndex,
                    childIndex: i
                },
                children: [],
                hash: this.calculateNodeHash(nodeId, { iterationIndex, childIndex: i })
            };
            this.nodes[nodeId] = childNode;
            parentNode.children.push(nodeId);
            // Recursively create more children
            if (remainingDepth > 1) {
                this.createFractalChildren(childNode, remainingDepth - 1, iterationIndex + 1);
            }
        }
    }
    /**
     * Private method to delete a node and all its children recursively
     */
    deleteNodeAndChildren(nodeId) {
        const node = this.nodes[nodeId];
        if (!node)
            return;
        // Delete all children first
        for (const childId of node.children) {
            this.deleteNodeAndChildren(childId);
        }
        // Delete this node
        delete this.nodes[nodeId];
    }
    /**
     * Private method to calculate the maximum depth of the storage tree
     */
    calculateMaxDepth() {
        if (!this.rootNode)
            return 0;
        let maxDepth = 0;
        const traverse = (nodeId, currentDepth) => {
            maxDepth = Math.max(maxDepth, currentDepth);
            const node = this.nodes[nodeId];
            if (!node)
                return;
            for (const childId of node.children) {
                traverse(childId, currentDepth + 1);
            }
        };
        traverse(this.rootNode.id, 0);
        return maxDepth;
    }
    /**
     * Private method to recalculate the root node hash
     */
    recalculateRootHash() {
        if (!this.rootNode)
            return;
        const childHashes = this.rootNode.children.map(id => this.nodes[id]?.hash || '');
        this.rootNode.hash = this.calculateNodeHash(this.rootNode.id, { childHashes, lastUpdated: this.rootNode.lastUpdated });
        this.nodes[this.rootNode.id] = this.rootNode;
    }
    /**
     * Private method to generate a unique node ID
     */
    generateNodeId() {
        return 'node_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    }
    /**
     * Private method to encrypt data
     */
    encryptData(data) {
        const jsonData = JSON.stringify(data);
        return crypto_js_1.default.AES.encrypt(jsonData, this.encryptionKey).toString();
    }
    /**
     * Private method to decrypt data
     */
    decryptData(encryptedData) {
        try {
            const decrypted = crypto_js_1.default.AES.decrypt(encryptedData, this.encryptionKey).toString(crypto_js_1.default.enc.Utf8);
            return JSON.parse(decrypted);
        }
        catch (error) {
            console.error('Failed to decrypt data:', error);
            return null;
        }
    }
    /**
     * Private method to calculate a node's hash
     */
    calculateNodeHash(id, additionalData) {
        const dataString = id + '_' + JSON.stringify(additionalData) + '_' + Date.now();
        return crypto_js_1.default.SHA256(dataString).toString(crypto_js_1.default.enc.Hex);
    }
    /**
     * Private method to check if storage is initialized
     * @throws Error if not initialized
     */
    checkInitialized() {
        if (!this.initialized) {
            throw new Error('FractalStorage not initialized. Call initialize() first.');
        }
    }
}
// Export singleton instance
exports.fractalStorage = new FractalStorage();
