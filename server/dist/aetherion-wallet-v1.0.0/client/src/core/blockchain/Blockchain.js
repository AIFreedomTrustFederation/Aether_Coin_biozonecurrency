"use strict";
/**
 * Aetherion Blockchain Core Implementation
 *
 * This file contains the main blockchain implementation with support for:
 * - Block creation and validation
 * - Transaction processing
 * - Proof of Work consensus with CPU/GPU mining
 * - Difficulty adjustment
 * - Chain validation and consensus rules
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockchain = exports.Blockchain = void 0;
const crypto_js_1 = require("crypto-js");
const events_1 = require("events");
const types_1 = require("./types");
const merkle_1 = require("./utils/merkle");
const CPUMiner_1 = require("./mining/CPUMiner");
const GPUMiner_1 = require("./mining/GPUMiner");
const wallet_1 = require("./crypto/wallet");
// Constants
const INITIAL_DIFFICULTY = 4; // Starting difficulty (number of leading zeros)
const BLOCK_REWARD = 50; // Initial mining reward
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10; // Adjust difficulty every N blocks
const TARGET_BLOCK_TIME = 60; // Target time between blocks in seconds
class Blockchain extends events_1.EventEmitter {
    constructor() {
        super();
        this.chain = [];
        this.pendingTransactions = [];
        this.difficulty = INITIAL_DIFFICULTY;
        this.miningReward = BLOCK_REWARD;
        this.nodes = [];
        this.isMining = false;
        this.miningInterval = null;
        this.cpuMiner = null;
        this.gpuMiner = null;
        this.miningAddress = '';
        this.syncStatus = {
            isSyncing: false,
            currentBlock: 0,
            highestBlock: 0,
            startingBlock: 0
        };
        this.consensusType = types_1.ConsensusType.PROOF_OF_WORK;
        this.miningConfig = {
            enabled: false,
            threads: 1,
            gpuMining: false,
            gpuDevices: [0],
            algorithm: types_1.MiningAlgorithm.SHA256,
            miningAddress: '',
            autoAdjustDifficulty: true,
            targetBlockTime: TARGET_BLOCK_TIME,
            minimumTransactionFee: 0.0001,
            maxTransactionsPerBlock: 2000
        };
        this.setMaxListeners(50); // Increase max listeners to avoid memory leak warnings
        this.createGenesisBlock();
    }
    /**
     * Creates the initial genesis block
     */
    createGenesisBlock() {
        const genesisTimestamp = 1743832800000; // Current timestamp
        const genesisBlock = {
            index: 0,
            timestamp: genesisTimestamp,
            transactions: [],
            previousHash: '0',
            hash: '',
            nonce: 0,
            difficulty: this.difficulty,
            merkleRoot: '0000000000000000000000000000000000000000000000000000000000000000',
            miner: 'Aetherion Genesis',
            reward: 0,
            size: 0,
            version: 1,
            extraData: 'Aetherion Genesis Block - The Future of Quantum-Resistant Blockchain'
        };
        // Calculate the hash of the genesis block
        genesisBlock.hash = this.calculateBlockHash(genesisBlock);
        // Add genesis block to the chain
        this.chain.push(genesisBlock);
        this.emit('blockAdded', genesisBlock);
    }
    /**
     * Calculate a block hash
     * @param block Block to calculate hash for
     * @returns The hash of the block
     */
    calculateBlockHash(block) {
        // Create a string representation of the block data
        const blockData = block.index.toString() +
            block.timestamp.toString() +
            block.previousHash +
            block.merkleRoot +
            block.nonce.toString() +
            block.difficulty.toString() +
            block.version.toString() +
            (block.extraData || '');
        // Hash the block data
        return (0, crypto_js_1.SHA256)(blockData).toString();
    }
    /**
     * Get the latest block in the chain
     * @returns The most recent block
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    /**
     * Add a new transaction to the pending transactions pool
     * @param transaction Transaction to add
     * @returns ID of the added transaction
     */
    addTransaction(transaction) {
        // Create a complete transaction with ID and timestamp
        const newTransaction = {
            ...transaction,
            id: (0, crypto_js_1.SHA256)(transaction.fromAddress +
                transaction.toAddress +
                transaction.amount.toString() +
                Date.now().toString()).toString(),
            timestamp: Date.now(),
            status: 'pending',
            confirmations: 0
        };
        // Validate the transaction
        if (!this.isValidTransaction(newTransaction)) {
            throw new Error('Invalid transaction');
        }
        // Add to pending transactions
        this.pendingTransactions.push(newTransaction);
        // Emit event
        this.emit('transactionAdded', newTransaction);
        return newTransaction.id;
    }
    /**
     * Check if a transaction is valid
     * @param transaction Transaction to validate
     * @returns True if valid, false otherwise
     */
    isValidTransaction(transaction) {
        // Mining rewards don't need validation
        if (transaction.fromAddress === null) {
            return true;
        }
        // Check if transaction has a signature
        if (!transaction.signature) {
            return false;
        }
        // Verify the signature
        return (0, wallet_1.verifyTransaction)(transaction);
    }
    /**
     * Start mining process
     * @param minerAddress Address to receive mining rewards
     */
    startMining(minerAddress) {
        if (this.isMining) {
            return; // Already mining
        }
        this.miningAddress = minerAddress;
        this.isMining = true;
        this.miningConfig.miningAddress = minerAddress;
        // Initialize miners based on configuration
        if (this.miningConfig.gpuMining) {
            this.gpuMiner = new GPUMiner_1.GPUMiner(this.miningConfig);
            this.gpuMiner.onSolution(this.handleMinedBlock.bind(this));
            this.gpuMiner.start();
        }
        else {
            this.cpuMiner = new CPUMiner_1.CPUMiner(this.miningConfig);
            this.cpuMiner.onSolution(this.handleMinedBlock.bind(this));
            this.cpuMiner.start();
        }
        this.emit('miningStarted', this.miningConfig);
    }
    /**
     * Stop mining process
     */
    stopMining() {
        if (!this.isMining) {
            return; // Not mining
        }
        this.isMining = false;
        // Stop miners
        if (this.cpuMiner) {
            this.cpuMiner.stop();
            this.cpuMiner = null;
        }
        if (this.gpuMiner) {
            this.gpuMiner.stop();
            this.gpuMiner = null;
        }
        this.emit('miningStopped');
    }
    /**
     * Handle a mined block solution
     * @param minedBlock Block that was mined
     */
    handleMinedBlock(minedBlock) {
        // Validate the mined block
        if (this.isValidBlock(minedBlock, this.getLatestBlock())) {
            // Add the block to the chain
            this.chain.push(minedBlock);
            // Clear pending transactions that were included in this block
            const txIds = minedBlock.transactions.map(tx => tx.id);
            this.pendingTransactions = this.pendingTransactions.filter(tx => !txIds.includes(tx.id));
            // Emit event
            this.emit('blockMined', minedBlock);
            // Adjust difficulty if needed
            if (minedBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
                this.miningConfig.autoAdjustDifficulty) {
                this.adjustDifficulty();
            }
        }
        else {
            // Invalid block
            this.emit('invalidBlock', minedBlock);
        }
    }
    /**
     * Prepares a block to be mined
     * @returns Block template ready for mining
     */
    prepareBlockTemplate() {
        const latestBlock = this.getLatestBlock();
        const transactions = this.getTransactionsForNextBlock();
        // Create a mining reward transaction
        const rewardTransaction = {
            id: (0, crypto_js_1.SHA256)('reward' + Date.now().toString()).toString(),
            fromAddress: null, // Mining rewards have no sender
            toAddress: this.miningAddress,
            amount: this.miningReward,
            timestamp: Date.now(),
            fee: 0,
            status: 'pending'
        };
        // Add mining reward transaction
        transactions.push(rewardTransaction);
        // Calculate merkle root
        const merkleRoot = (0, merkle_1.calculateMerkleRoot)(transactions);
        // Prepare block template
        const block = {
            index: latestBlock.index + 1,
            timestamp: Date.now(),
            transactions: transactions,
            previousHash: latestBlock.hash,
            hash: '', // Will be calculated during mining
            nonce: 0, // Will be incremented during mining
            difficulty: this.difficulty,
            merkleRoot,
            miner: this.miningAddress,
            reward: this.miningReward,
            size: JSON.stringify(transactions).length, // Simple size estimation
            version: 1,
            extraData: ''
        };
        return block;
    }
    /**
     * Gets transactions to include in the next block
     * @returns Array of transactions to include
     */
    getTransactionsForNextBlock() {
        // Sort by fee (highest first) to maximize mining revenue
        const sortedTransactions = [...this.pendingTransactions]
            .sort((a, b) => b.fee - a.fee);
        // Take only what fits in a block
        return sortedTransactions.slice(0, this.miningConfig.maxTransactionsPerBlock);
    }
    /**
     * Validate a block
     * @param newBlock Block to validate
     * @param previousBlock Previous block in the chain
     * @returns True if valid, false otherwise
     */
    isValidBlock(newBlock, previousBlock) {
        // Check index
        if (previousBlock.index + 1 !== newBlock.index) {
            return false;
        }
        // Check previous hash
        if (previousBlock.hash !== newBlock.previousHash) {
            return false;
        }
        // Validate hash
        if (this.calculateBlockHash(newBlock) !== newBlock.hash) {
            return false;
        }
        // Check difficulty (proof of work)
        const difficultyString = '0'.repeat(newBlock.difficulty);
        if (newBlock.hash.substring(0, newBlock.difficulty) !== difficultyString) {
            return false;
        }
        // Validate transactions
        for (const tx of newBlock.transactions) {
            if (!this.isValidTransaction(tx)) {
                return false;
            }
        }
        // Validate merkle root
        if ((0, merkle_1.calculateMerkleRoot)(newBlock.transactions) !== newBlock.merkleRoot) {
            return false;
        }
        return true;
    }
    /**
     * Check if the entire blockchain is valid
     * @returns True if valid, false otherwise
     */
    isValidChain() {
        // Loop through the chain and validate each block
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            if (!this.isValidBlock(currentBlock, previousBlock)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Adjust the mining difficulty based on block times
     */
    adjustDifficulty() {
        const latestBlock = this.getLatestBlock();
        if (latestBlock.index < DIFFICULTY_ADJUSTMENT_INTERVAL) {
            return; // Not enough blocks to adjust
        }
        // Get block from DIFFICULTY_ADJUSTMENT_INTERVAL blocks ago
        const prevAdjustmentBlock = this.chain[this.chain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
        // Calculate expected time vs actual time
        const expectedTime = DIFFICULTY_ADJUSTMENT_INTERVAL * TARGET_BLOCK_TIME * 1000;
        const actualTime = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
        // If block generation is too fast, increase difficulty
        if (actualTime < expectedTime / 2) {
            this.difficulty++;
            this.emit('difficultyAdjusted', this.difficulty, 'increased');
        }
        // If block generation is too slow, decrease difficulty
        else if (actualTime > expectedTime * 2) {
            this.difficulty = Math.max(1, this.difficulty - 1); // Minimum difficulty of 1
            this.emit('difficultyAdjusted', this.difficulty, 'decreased');
        }
        // Otherwise, difficulty remains the same
    }
    /**
     * Get entire blockchain state
     * @returns Current blockchain state
     */
    getBlockchainState() {
        return {
            chain: this.chain,
            pendingTransactions: this.pendingTransactions,
            difficulty: this.difficulty,
            miningReward: this.miningReward,
            lastBlockTime: this.getLatestBlock().timestamp,
            nodes: [],
            isMining: this.isMining,
            syncStatus: this.syncStatus,
            consensusType: this.consensusType,
            networkHashrate: this.getNetworkHashrate(),
            version: '1.0.0',
            genesisBlock: this.chain[0]
        };
    }
    /**
     * Estimate the network hashrate
     * @returns Estimated hashrate in hashes per second
     */
    getNetworkHashrate() {
        if (this.chain.length < 2) {
            return 0;
        }
        // Get the most recent blocks
        const numBlocks = Math.min(10, this.chain.length - 1);
        const recentBlocks = this.chain.slice(-numBlocks - 1);
        // Calculate average time between blocks
        let totalTime = 0;
        for (let i = 1; i < recentBlocks.length; i++) {
            totalTime += recentBlocks[i].timestamp - recentBlocks[i - 1].timestamp;
        }
        const avgTimeMs = totalTime / numBlocks;
        if (avgTimeMs <= 0)
            return 0;
        // Estimate hashrate from difficulty and average time
        const difficulty = this.difficulty;
        const hashesPerBlock = Math.pow(2, difficulty * 4); // Approximate hashes needed
        return Math.floor(hashesPerBlock / (avgTimeMs / 1000));
    }
    /**
     * Update mining configuration
     * @param config New mining configuration
     */
    updateMiningConfig(config) {
        const wasMining = this.isMining;
        // Stop mining if already running
        if (wasMining) {
            this.stopMining();
        }
        // Update configuration
        this.miningConfig = {
            ...this.miningConfig,
            ...config
        };
        // Restart mining if it was running
        if (wasMining) {
            this.startMining(this.miningConfig.miningAddress);
        }
        this.emit('miningConfigUpdated', this.miningConfig);
    }
    /**
     * Get transaction by ID
     * @param id Transaction ID
     * @returns Transaction or undefined if not found
     */
    getTransactionById(id) {
        // Check pending transactions
        const pendingTx = this.pendingTransactions.find(tx => tx.id === id);
        if (pendingTx) {
            return pendingTx;
        }
        // Check transactions in blocks
        for (const block of this.chain.reverse()) { // Start from the newest blocks
            const tx = block.transactions.find(tx => tx.id === id);
            if (tx) {
                // Calculate confirmations
                const confirmations = this.chain.length - block.index;
                return {
                    ...tx,
                    confirmations,
                    status: 'confirmed'
                };
            }
        }
        return undefined;
    }
    /**
     * Get block by hash
     * @param hash Block hash
     * @returns Block or undefined if not found
     */
    getBlockByHash(hash) {
        return this.chain.find(block => block.hash === hash);
    }
    /**
     * Get block by index
     * @param index Block index
     * @returns Block or undefined if not found
     */
    getBlockByIndex(index) {
        return this.chain[index];
    }
    /**
     * Get balance for an address
     * @param address Wallet address
     * @returns Balance
     */
    getBalanceForAddress(address) {
        let balance = 0;
        // Go through all blocks to find transactions for this address
        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                // If this address is the sender, subtract the amount
                if (transaction.fromAddress === address) {
                    balance -= transaction.amount;
                    balance -= transaction.fee;
                }
                // If this address is the recipient, add the amount
                if (transaction.toAddress === address) {
                    balance += transaction.amount;
                }
            }
        }
        return balance;
    }
    /**
     * Get all transactions for an address
     * @param address Wallet address
     * @returns Array of transactions
     */
    getTransactionsForAddress(address) {
        const transactions = [];
        // Check pending transactions
        for (const tx of this.pendingTransactions) {
            if (tx.fromAddress === address || tx.toAddress === address) {
                transactions.push({
                    ...tx,
                    status: 'pending',
                    confirmations: 0
                });
            }
        }
        // Check transactions in blocks
        for (const block of this.chain) {
            for (const tx of block.transactions) {
                if (tx.fromAddress === address || tx.toAddress === address) {
                    transactions.push({
                        ...tx,
                        status: 'confirmed',
                        confirmations: this.chain.length - block.index
                    });
                }
            }
        }
        return transactions;
    }
}
exports.Blockchain = Blockchain;
// Export singleton instance
exports.blockchain = new Blockchain();
