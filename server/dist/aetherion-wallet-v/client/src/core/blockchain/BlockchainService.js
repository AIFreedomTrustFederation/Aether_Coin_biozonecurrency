"use strict";
/**
 * Blockchain Service
 *
 * Provides core blockchain functionality for the AetherCoin ecosystem.
 * Integrates with Web3 providers and manages blocks, transactions,
 * and blockchain events.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockchainService = void 0;
const events_1 = require("events");
const crypto_js_1 = require("crypto-js");
const types_1 = require("./types");
const FractalAlgorithms_1 = require("../biozoe/FractalAlgorithms");
// Default configuration using Golden Ratio for Chain ID
const DEFAULT_CONFIG = {
    networkId: 1,
    chainId: Math.round(FractalAlgorithms_1.GOLDEN_RATIO * 100000), // 161803
    difficulty: 4,
    blockTime: 10000, // 10 seconds
    genesisTimestamp: Date.now()
};
/**
 * BlockchainService - Core blockchain functionality for AetherCoin
 */
class BlockchainService extends events_1.EventEmitter {
    constructor(config = DEFAULT_CONFIG) {
        super();
        this.chain = [];
        this.pendingTransactions = [];
        this.walletStatus = types_1.WalletConnectionStatus.DISCONNECTED;
        this.walletAddress = null;
        this.networkType = types_1.BlockchainNetworkType.MAINNET;
        this.blockInterval = null;
        this.eventListeners = new Map();
        this.config = config;
        this.initializeChain();
        this.setupWeb3Listeners();
    }
    /**
     * Initialize blockchain with genesis block
     */
    initializeChain() {
        const genesisBlock = this.createGenesisBlock();
        this.chain = [genesisBlock];
    }
    /**
     * Create genesis block for the chain
     */
    createGenesisBlock() {
        const genesisData = {
            message: "AetherCoin Genesis Block - BioZoeCurrency Ecosystem",
            goldenRatio: FractalAlgorithms_1.GOLDEN_RATIO,
            timestamp: this.config.genesisTimestamp
        };
        const hash = (0, crypto_js_1.SHA256)(JSON.stringify(genesisData)).toString();
        return {
            index: 0,
            timestamp: this.config.genesisTimestamp,
            transactions: [],
            previousHash: "0",
            hash,
            nonce: 0,
            difficulty: this.config.difficulty
        };
    }
    /**
     * Set up listeners for Web3 wallet events
     */
    setupWeb3Listeners() {
        if (typeof window !== 'undefined' && window.ethereum) {
            // Setup metamask/web3 event listeners
            window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
            window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));
            window.ethereum.on('connect', this.handleConnect.bind(this));
            window.ethereum.on('disconnect', this.handleDisconnect.bind(this));
        }
    }
    /**
     * Handle wallet account changes
     */
    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.walletAddress = null;
            this.walletStatus = types_1.WalletConnectionStatus.DISCONNECTED;
        }
        else {
            this.walletAddress = accounts[0];
            this.walletStatus = types_1.WalletConnectionStatus.CONNECTED;
        }
        this.emit('accountsChanged', { accounts, walletStatus: this.walletStatus });
        this.notifyListeners('accountsChanged', { accounts, walletStatus: this.walletStatus });
    }
    /**
     * Handle blockchain network changes
     */
    handleChainChanged(chainId) {
        this.emit('chainChanged', { chainId });
        this.notifyListeners('chainChanged', { chainId });
        // Update network type based on chain ID
        const chainIdNum = parseInt(chainId, 16);
        if (chainIdNum === this.config.chainId) {
            this.networkType = types_1.BlockchainNetworkType.MAINNET;
        }
        else if (chainIdNum === 314159) { // Pi-based testnet
            this.networkType = types_1.BlockchainNetworkType.TESTNET;
        }
        else if (chainIdNum === 161803) { // Golden ratio
            this.networkType = types_1.BlockchainNetworkType.GOLDEN;
        }
        else {
            this.networkType = types_1.BlockchainNetworkType.CUSTOM;
        }
        this.emit('networkTypeChanged', { networkType: this.networkType });
        this.notifyListeners('networkTypeChanged', { networkType: this.networkType });
    }
    /**
     * Handle wallet connection
     */
    handleConnect(connectInfo) {
        this.walletStatus = types_1.WalletConnectionStatus.CONNECTED;
        this.emit('connect', { ...connectInfo, walletStatus: this.walletStatus });
        this.notifyListeners('connect', { ...connectInfo, walletStatus: this.walletStatus });
    }
    /**
     * Handle wallet disconnection
     */
    handleDisconnect(error) {
        this.walletStatus = types_1.WalletConnectionStatus.DISCONNECTED;
        this.walletAddress = null;
        this.emit('disconnect', { error, walletStatus: this.walletStatus });
        this.notifyListeners('disconnect', { error, walletStatus: this.walletStatus });
    }
    /**
     * Get the latest block in the chain
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    /**
     * Get the current block height (chain length)
     */
    getBlockHeight() {
        return this.chain.length;
    }
    /**
     * Generate a new block with current pending transactions
     */
    generateBlock() {
        const latestBlock = this.getLatestBlock();
        const newIndex = latestBlock.index + 1;
        const timestamp = Date.now();
        const transactions = [...this.pendingTransactions];
        const newBlock = {
            index: newIndex,
            timestamp,
            transactions,
            previousHash: latestBlock.hash,
            hash: "",
            nonce: 0,
            difficulty: this.config.difficulty
        };
        // Mine the block (find valid hash)
        const minedBlock = this.mineBlock(newBlock);
        // Clear pending transactions
        this.pendingTransactions = [];
        // Add the new block to the chain
        this.chain.push(minedBlock);
        // Emit block added event
        this.emit('blockAdded', minedBlock);
        this.notifyListeners('blockAdded', minedBlock);
        return minedBlock;
    }
    /**
     * Mine a block to find a valid hash (proof-of-work)
     */
    mineBlock(block) {
        const target = "0".repeat(this.config.difficulty);
        const blockData = this.getBlockData(block);
        let nonce = 0;
        let hash = "";
        while (true) {
            nonce++;
            hash = (0, crypto_js_1.SHA256)(blockData + nonce).toString();
            if (hash.substring(0, this.config.difficulty) === target) {
                break;
            }
        }
        block.nonce = nonce;
        block.hash = hash;
        return block;
    }
    /**
     * Get block data as string for hashing
     */
    getBlockData(block) {
        return block.index +
            block.timestamp +
            JSON.stringify(block.transactions) +
            block.previousHash +
            block.difficulty;
    }
    /**
     * Create and add a new transaction to pending
     */
    createTransaction(from, to, amount, data) {
        const transaction = {
            id: this.generateTransactionId(from, to, amount),
            from,
            to,
            amount,
            timestamp: Date.now(),
            signature: this.signTransaction(from, to, amount),
            data
        };
        this.pendingTransactions.push(transaction);
        this.emit('transactionCreated', transaction);
        this.notifyListeners('transactionCreated', transaction);
        return transaction;
    }
    /**
     * Generate unique transaction ID
     */
    generateTransactionId(from, to, amount) {
        return (0, crypto_js_1.SHA256)(from + to + amount + Date.now() + Math.random()).toString();
    }
    /**
     * Sign a transaction (placeholder for actual wallet signing)
     */
    signTransaction(from, to, amount) {
        // In a real implementation, this would use the wallet's signing capability
        return (0, crypto_js_1.SHA256)(from + to + amount + this.config.chainId + Date.now()).toString();
    }
    /**
     * Verify the integrity of the entire blockchain
     */
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            // Check if hash is correct
            const blockData = this.getBlockData(currentBlock);
            if ((0, crypto_js_1.SHA256)(blockData + currentBlock.nonce).toString() !== currentBlock.hash) {
                return false;
            }
            // Check if previous hash reference is correct
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
    /**
     * Start automatic block generation at specified interval
     */
    startBlockGeneration() {
        if (this.blockInterval) {
            clearInterval(this.blockInterval);
        }
        this.blockInterval = setInterval(() => {
            if (this.pendingTransactions.length > 0) {
                this.generateBlock();
            }
        }, this.config.blockTime);
    }
    /**
     * Stop automatic block generation
     */
    stopBlockGeneration() {
        if (this.blockInterval) {
            clearInterval(this.blockInterval);
            this.blockInterval = null;
        }
    }
    /**
     * Connect to wallet (simulate Web3 wallet connection)
     */
    async connectWallet() {
        if (typeof window === 'undefined' || !window.ethereum) {
            this.walletStatus = types_1.WalletConnectionStatus.ERROR;
            this.emit('error', { message: "Web3 provider not available" });
            this.notifyListeners('error', { message: "Web3 provider not available" });
            return null;
        }
        try {
            this.walletStatus = types_1.WalletConnectionStatus.CONNECTING;
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
                this.walletAddress = accounts[0];
                this.walletStatus = types_1.WalletConnectionStatus.CONNECTED;
                // Check current chain
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                this.handleChainChanged(chainId);
                this.emit('walletConnected', {
                    address: this.walletAddress,
                    chainId,
                    networkType: this.networkType
                });
                this.notifyListeners('walletConnected', {
                    address: this.walletAddress,
                    chainId,
                    networkType: this.networkType
                });
                return this.walletAddress;
            }
            this.walletStatus = types_1.WalletConnectionStatus.ERROR;
            return null;
        }
        catch (error) {
            this.walletStatus = types_1.WalletConnectionStatus.ERROR;
            this.emit('error', error);
            this.notifyListeners('error', error);
            return null;
        }
    }
    /**
     * Disconnect from wallet
     */
    disconnectWallet() {
        this.walletAddress = null;
        this.walletStatus = types_1.WalletConnectionStatus.DISCONNECTED;
        this.emit('walletDisconnected');
        this.notifyListeners('walletDisconnected', {});
    }
    /**
     * Get current wallet connection status
     */
    getWalletStatus() {
        return this.walletStatus;
    }
    /**
     * Get current wallet address
     */
    getWalletAddress() {
        return this.walletAddress;
    }
    /**
     * Get current blockchain network type
     */
    getNetworkType() {
        return this.networkType;
    }
    /**
     * Switch to a different blockchain network
     */
    async switchNetwork(networkType) {
        if (typeof window === 'undefined' || !window.ethereum) {
            return false;
        }
        let targetChainId;
        switch (networkType) {
            case types_1.BlockchainNetworkType.MAINNET:
                targetChainId = `0x${this.config.chainId.toString(16)}`;
                break;
            case types_1.BlockchainNetworkType.TESTNET:
                targetChainId = "0x4ccff"; // 314159 in hex (Pi-based ID)
                break;
            case types_1.BlockchainNetworkType.GOLDEN:
                targetChainId = "0x2785b"; // 161803 in hex (Golden Ratio ID)
                break;
            default:
                return false;
        }
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainId }]
            });
            return true;
        }
        catch (error) {
            if (error.code === 4902) {
                // Chain doesn't exist, add it
                try {
                    const networkParams = this.getNetworkParams(networkType);
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [networkParams]
                    });
                    return true;
                }
                catch (addError) {
                    this.emit('error', addError);
                    this.notifyListeners('error', addError);
                    return false;
                }
            }
            this.emit('error', error);
            this.notifyListeners('error', error);
            return false;
        }
    }
    /**
     * Get network parameters for adding to wallet
     */
    getNetworkParams(networkType) {
        switch (networkType) {
            case types_1.BlockchainNetworkType.MAINNET:
                return {
                    chainId: `0x${this.config.chainId.toString(16)}`,
                    chainName: 'AetherCoin BioZoe Network',
                    nativeCurrency: {
                        name: 'AetherCoin',
                        symbol: 'ATC',
                        decimals: 18
                    },
                    rpcUrls: ['https://rpc.aethercoin.network'],
                    blockExplorerUrls: ['https://explorer.aethercoin.network']
                };
            case types_1.BlockchainNetworkType.TESTNET:
                return {
                    chainId: "0x4ccff", // 314159 in hex
                    chainName: 'AetherCoin BioZoe Testnet',
                    nativeCurrency: {
                        name: 'Test AetherCoin',
                        symbol: 'tATC',
                        decimals: 18
                    },
                    rpcUrls: ['https://testnet-rpc.aethercoin.network'],
                    blockExplorerUrls: ['https://testnet-explorer.aethercoin.network']
                };
            case types_1.BlockchainNetworkType.GOLDEN:
                return {
                    chainId: "0x2785b", // 161803 in hex
                    chainName: 'AetherCoin Golden Network',
                    nativeCurrency: {
                        name: 'AetherCoin',
                        symbol: 'ATC',
                        decimals: 18
                    },
                    rpcUrls: ['https://golden-rpc.aethercoin.network'],
                    blockExplorerUrls: ['https://golden-explorer.aethercoin.network']
                };
            default:
                throw new Error("Invalid network type");
        }
    }
    /**
     * Get the entire blockchain
     */
    getChain() {
        return [...this.chain];
    }
    /**
     * Get current pending transactions
     */
    getPendingTransactions() {
        return [...this.pendingTransactions];
    }
    /**
     * Get transaction history for an address
     */
    getAddressTransactions(address) {
        const transactions = [];
        // Check all blocks for transactions involving this address
        for (const block of this.chain) {
            for (const tx of block.transactions) {
                if (tx.from === address || tx.to === address) {
                    transactions.push(tx);
                }
            }
        }
        // Add any pending transactions too
        for (const tx of this.pendingTransactions) {
            if (tx.from === address || tx.to === address) {
                transactions.push(tx);
            }
        }
        return transactions;
    }
    /**
     * Get block by index
     */
    getBlockByIndex(index) {
        return (index >= 0 && index < this.chain.length) ? this.chain[index] : null;
    }
    /**
     * Get block by hash
     */
    getBlockByHash(hash) {
        return this.chain.find(block => block.hash === hash) || null;
    }
    /**
     * Get transaction by ID
     */
    getTransactionById(id) {
        // Check pending transactions
        let transaction = this.pendingTransactions.find(tx => tx.id === id);
        if (transaction)
            return transaction;
        // Check all blocks
        for (const block of this.chain) {
            transaction = block.transactions.find(tx => tx.id === id);
            if (transaction)
                return transaction;
        }
        return null;
    }
    /**
     * Register event listener
     */
    registerListener(eventName, listener) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, new Set());
        }
        this.eventListeners.get(eventName)?.add(listener);
    }
    /**
     * Unregister event listener
     */
    unregisterListener(eventName, listener) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName)?.delete(listener);
        }
    }
    /**
     * Notify all listeners for an event
     */
    notifyListeners(eventName, data) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName)?.forEach(listener => {
                try {
                    listener(data);
                }
                catch (error) {
                    console.error(`Error in blockchain event listener for ${eventName}:`, error);
                }
            });
        }
    }
    /**
     * Update blockchain configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        // If block generation is running, restart it with new timing
        if (this.blockInterval) {
            this.stopBlockGeneration();
            this.startBlockGeneration();
        }
    }
    /**
     * Get complete blockchain state including chain and pending transactions
     */
    /**
     * Get current blockchain state
     * @returns Current blockchain state object
     */
    getBlockchainState() {
        return {
            chain: this.getChain(),
            pendingTransactions: this.getPendingTransactions(),
            latestBlock: this.getLatestBlock(),
            blockHeight: this.getBlockHeight(),
            walletStatus: this.getWalletStatus(),
            networkType: this.getNetworkType(),
            currentDifficulty: this.config.difficulty,
            isValid: this.isChainValid(),
            difficulty: this.config.difficulty,
            miningReward: 5.0, // Default mining reward
            lastBlockTime: this.getLatestBlock().timestamp,
            nodes: [], // No peer nodes in this implementation
            isMining: this.blockInterval !== null,
            syncStatus: 'synchronized',
            consensusType: 'proof-of-work',
            networkHashrate: this.getEstimatedHashrate(),
            version: '1.0.0',
            genesisBlock: this.chain[0]
        };
    }
    /**
     * Estimate the network hashrate based on recent blocks
     * @returns Estimated hashrate in hashes per second
     */
    getEstimatedHashrate() {
        if (this.chain.length < 2) {
            return 0;
        }
        // Use the last few blocks to estimate hashrate
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
        // Estimate hashrate based on difficulty
        const difficulty = this.config.difficulty;
        const hashesPerBlock = Math.pow(2, difficulty * 4); // Approximate hashes needed
        return Math.floor(hashesPerBlock / (avgTimeMs / 1000));
    }
    /**
     * Get all available wallets
     */
    getAllWallets() {
        // In a full implementation, this would retrieve actual wallets
        // For now, return a mock wallet if connected
        const wallets = [];
        if (this.walletAddress) {
            wallets.push({
                address: this.walletAddress,
                balance: 1000, // Mock balance
                type: 'primary',
                label: 'Main Wallet'
            });
            // Add some mock additional wallets for demo purposes
            wallets.push({
                address: '0x' + (0, crypto_js_1.SHA256)('secondary-wallet').toString().substring(0, 40),
                balance: 250,
                type: 'secondary',
                label: 'Savings Wallet'
            });
        }
        return wallets;
    }
    /**
     * Initialize the blockchain service
     */
    initialize() {
        // Reset to initial state
        this.chain = [];
        this.pendingTransactions = [];
        this.walletStatus = types_1.WalletConnectionStatus.DISCONNECTED;
        this.walletAddress = null;
        // Create genesis block
        this.initializeChain();
        // Set up Web3 listeners
        this.setupWeb3Listeners();
        // Start block generation
        this.startBlockGeneration();
        // Emit initialization event
        this.emit('initialized', {
            blockHeight: this.getBlockHeight(),
            genesisBlock: this.chain[0],
            timestamp: Date.now()
        });
        this.notifyListeners('initialized', {
            blockHeight: this.getBlockHeight(),
            genesisBlock: this.chain[0],
            timestamp: Date.now()
        });
        return true;
    }
}
// Export singleton instance
exports.blockchainService = new BlockchainService();
