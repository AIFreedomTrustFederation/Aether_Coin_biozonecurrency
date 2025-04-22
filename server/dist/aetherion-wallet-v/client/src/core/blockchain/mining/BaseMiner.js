"use strict";
/**
 * Base Miner Class for Aetherion
 *
 * This abstract class provides the foundation for different mining implementations
 * (CPU, GPU, etc.) and handles common functionality like metric tracking,
 * difficulty calculation, and event handling.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMiner = void 0;
const events_1 = require("events");
const types_1 = require("../types");
const crypto_js_1 = require("crypto-js");
class BaseMiner extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.running = false;
        this.startTime = 0;
        this.currentBlock = null;
        this.hashCount = 0;
        this.lastHashCount = 0;
        this.hashRateUpdateInterval = null;
        this.workers = [];
        this.setMaxListeners(50);
        this.config = config;
        // Initialize metrics
        this.metrics = {
            hashrate: 0,
            acceptedShares: 0,
            rejectedShares: 0,
            blocksFound: 0,
            lastShareTime: 0,
            uptime: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            expectedTimeToFind: 0
        };
    }
    /**
     * Generate a hash using the configured algorithm
     * @param data Data to hash
     * @returns Hash string
     */
    generateHash(data) {
        // In a production system, we would support multiple hash algorithms
        // For this demo, we'll use SHA256 for all algorithms
        switch (this.config.algorithm) {
            case types_1.MiningAlgorithm.SHA256:
                return (0, crypto_js_1.SHA256)(data).toString();
            case types_1.MiningAlgorithm.ETHASH:
                // Simulated ethash (would be much more complex in reality)
                return (0, crypto_js_1.SHA256)(data + 'ethash').toString();
            case types_1.MiningAlgorithm.SCRYPT:
                // Simulated scrypt
                return (0, crypto_js_1.SHA256)(data + 'scrypt').toString();
            case types_1.MiningAlgorithm.CRYPTONIGHT:
                // Simulated cryptonight
                return (0, crypto_js_1.SHA256)(data + 'cryptonight').toString();
            case types_1.MiningAlgorithm.RANDOMX:
                // Simulated randomx
                return (0, crypto_js_1.SHA256)(data + 'randomx').toString();
            case types_1.MiningAlgorithm.QUANTUM:
                // Our simulated quantum-resistant algorithm
                // In a real implementation, this would use a post-quantum
                // cryptographic algorithm like CRYSTALS or FALCON
                return (0, crypto_js_1.SHA256)(data + 'quantum').toString();
            default:
                return (0, crypto_js_1.SHA256)(data).toString();
        }
    }
    /**
     * Check if a hash meets the difficulty requirement
     * @param hash Hash to check
     * @param difficulty Difficulty level
     * @returns True if hash meets difficulty
     */
    meetsTarget(hash, difficulty) {
        // Check if the hash has enough leading zeros to meet the difficulty
        const prefix = '0'.repeat(difficulty);
        return hash.startsWith(prefix);
    }
    /**
     * Set the block to mine
     * @param block Block template to mine
     */
    setBlock(block) {
        this.currentBlock = block;
        this.emit('blockUpdated', block);
    }
    /**
     * Add a callback for when a solution is found
     * @param callback Function to call with the solved block
     */
    onSolution(callback) {
        this.on('solution', callback);
    }
    /**
     * Start tracking hashrate
     */
    startHashrateTracking() {
        this.startTime = Date.now();
        this.hashCount = 0;
        this.lastHashCount = 0;
        // Update hashrate every second
        this.hashRateUpdateInterval = setInterval(() => {
            // Calculate hashrate (hashes per second)
            const newHashes = this.hashCount - this.lastHashCount;
            this.metrics.hashrate = newHashes;
            this.lastHashCount = this.hashCount;
            // Update uptime
            this.metrics.uptime = Math.floor((Date.now() - this.startTime) / 1000);
            // Update expected time to find
            if (this.currentBlock && this.metrics.hashrate > 0) {
                // Calculate probability based on current difficulty
                const difficulty = this.currentBlock.difficulty;
                const probability = 1 / Math.pow(16, difficulty); // For each hex character (2^4)
                const expectedHashes = 1 / probability;
                this.metrics.expectedTimeToFind = expectedHashes / this.metrics.hashrate;
            }
            this.emit('metricsUpdated', { ...this.metrics });
        }, 1000);
    }
    /**
     * Stop tracking hashrate
     */
    stopHashrateTracking() {
        if (this.hashRateUpdateInterval) {
            clearInterval(this.hashRateUpdateInterval);
            this.hashRateUpdateInterval = null;
        }
    }
    /**
     * Get current mining metrics
     * @returns Mining metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Update mining configuration
     * @param config New mining configuration
     */
    updateConfig(config) {
        const wasRunning = this.running;
        // Stop mining if running
        if (wasRunning) {
            this.stop();
        }
        // Update configuration
        this.config = {
            ...this.config,
            ...config
        };
        // Restart mining if it was running
        if (wasRunning) {
            this.start();
        }
        this.emit('configUpdated', this.config);
    }
}
exports.BaseMiner = BaseMiner;
