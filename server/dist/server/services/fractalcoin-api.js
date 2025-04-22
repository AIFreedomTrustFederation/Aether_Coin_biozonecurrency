"use strict";
/**
 * FractalCoin API Client
 *
 * This service provides an interface for interacting with the FractalCoin API.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFractalCoinAPI = getFractalCoinAPI;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
// Environment variables
const FRACTALCOIN_API_KEY = process.env.FRACTALCOIN_API_KEY;
const FRACTALCOIN_API_ENDPOINT = process.env.FRACTALCOIN_API_ENDPOINT || 'https://api.fractalcoin.network/v1';
const DEBUG = process.env.DEBUG === 'true';
// Debug logging
function log(...args) {
    if (DEBUG) {
        console.log('[FractalCoin API]', ...args);
    }
}
class FractalCoinAPI {
    constructor() {
        this.apiKey = FRACTALCOIN_API_KEY;
        this.apiEndpoint = FRACTALCOIN_API_ENDPOINT;
        this.mockMode = !this.apiKey || this.apiKey === 'localhost-dev-key';
        if (this.mockMode) {
            console.warn('FRACTALCOIN_API_KEY not found in environment or set to development key, FractalCoin API will run in simulation mode');
            // In development mode, we'll use a test endpoint that can still connect to testnet
            if (this.apiKey === 'localhost-dev-key') {
                this.apiEndpoint = 'https://testnet-api.fractalcoin.network/v1';
                console.log(`Using test endpoint: ${this.apiEndpoint} for FractalCoin API`);
            }
        }
    }
    /**
     * Get account information
     */
    async getAccountInfo() {
        if (this.mockMode) {
            return this.mockAccountInfo();
        }
        try {
            const response = await axios_1.default.get(`${this.apiEndpoint}/account/info`, {
                headers: this.getHeaders(),
            });
            return response.data;
        }
        catch (error) {
            this.handleApiError(error, 'Error fetching account info');
        }
    }
    /**
     * Get account balance
     */
    async getBalance() {
        if (this.mockMode) {
            return this.mockBalance();
        }
        try {
            const response = await axios_1.default.get(`${this.apiEndpoint}/account/balance`, {
                headers: this.getHeaders(),
            });
            return response.data;
        }
        catch (error) {
            this.handleApiError(error, 'Error fetching account balance');
        }
    }
    /**
     * Get transaction history
     * @param page Page number
     * @param limit Number of transactions per page
     */
    async getTransactions(page = 1, limit = 20) {
        if (this.mockMode) {
            return this.mockTransactions(page, limit);
        }
        try {
            const response = await axios_1.default.get(`${this.apiEndpoint}/account/transactions`, {
                headers: this.getHeaders(),
                params: { page, limit },
            });
            return response.data;
        }
        catch (error) {
            this.handleApiError(error, 'Error fetching transactions');
        }
    }
    /**
     * Transfer FractalCoin to another address
     * @param to Recipient address
     * @param amount Amount to transfer
     * @param memo Optional memo
     */
    async transfer(to, amount, memo) {
        if (this.mockMode) {
            return this.mockTransfer(to, amount, memo);
        }
        try {
            const response = await axios_1.default.post(`${this.apiEndpoint}/transactions/transfer`, { to, amount, memo }, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            this.handleApiError(error, 'Error transferring FractalCoin');
        }
    }
    /**
     * Get storage metrics
     */
    async getStorageMetrics() {
        if (this.mockMode) {
            return this.mockStorageMetrics();
        }
        try {
            const response = await axios_1.default.get(`${this.apiEndpoint}/storage/metrics`, {
                headers: this.getHeaders(),
            });
            return response.data;
        }
        catch (error) {
            this.handleApiError(error, 'Error fetching storage metrics');
        }
    }
    /**
     * Allocate storage on the FractalCoin network
     * @param bytes Number of bytes to allocate
     * @param options Allocation options
     */
    async allocateStorage(bytes, options) {
        if (this.mockMode) {
            return this.mockAllocateStorage(bytes, options);
        }
        try {
            const response = await axios_1.default.post(`${this.apiEndpoint}/storage/allocate`, {
                bytes,
                purpose: options?.purpose || 'general',
                redundancy: options?.redundancy || 3,
                encryption: options?.encryption || 'aes-256-gcm',
            }, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            this.handleApiError(error, 'Error allocating storage');
        }
    }
    /**
     * List active bridges
     */
    async listBridges() {
        if (this.mockMode) {
            return this.mockListBridges();
        }
        try {
            const response = await axios_1.default.get(`${this.apiEndpoint}/bridges/list`, {
                headers: this.getHeaders(),
            });
            return response.data;
        }
        catch (error) {
            this.handleApiError(error, 'Error listing bridges');
        }
    }
    /**
     * Register a bridge with another network (like Filecoin)
     * @param bridgeData Bridge configuration data
     */
    async registerBridge(bridgeData) {
        if (this.mockMode) {
            return this.mockRegisterBridge(bridgeData);
        }
        try {
            const response = await axios_1.default.post(`${this.apiEndpoint}/bridges/create`, bridgeData, { headers: this.getHeaders() });
            return response.data;
        }
        catch (error) {
            this.handleApiError(error, 'Error registering bridge');
        }
    }
    /**
     * Get authentication headers
     * @private
     */
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    }
    /**
     * Handle API errors
     * @private
     */
    handleApiError(error, defaultMessage) {
        if (error.response) {
            throw new Error(`FractalCoin API Error (${error.response.status}): ${error.response.data.message || 'Unknown error'}`);
        }
        else if (error.request) {
            throw new Error(`No response received from FractalCoin API: ${error.message || 'Check your connection'}`);
        }
        else {
            throw new Error(`${defaultMessage}: ${error.message}`);
        }
    }
    // Mock implementations for development
    /**
     * Mock account info
     * @private
     */
    mockAccountInfo() {
        return {
            address: '0x' + crypto_1.default.randomBytes(20).toString('hex'),
            balance: '1000.0',
            network: 'fractalnet',
            storageAllocated: 1073741824, // 1 GB
            storageUsed: 536870912, // 512 MB
        };
    }
    /**
     * Mock balance
     * @private
     */
    mockBalance() {
        return {
            balance: '1000.0',
            symbol: 'FRC',
            network: 'fractalnet',
        };
    }
    /**
     * Mock transactions
     * @private
     */
    mockTransactions(page, limit) {
        const totalTransactions = 57; // Total mock transactions
        const startIndex = (page - 1) * limit;
        const endIndex = Math.min(startIndex + limit, totalTransactions);
        const actualCount = Math.min(limit, totalTransactions - startIndex);
        const transactions = Array.from({ length: actualCount }, (_, index) => {
            const timestamp = new Date(Date.now() - (index + startIndex) * 3600000).toISOString();
            const isEven = (index + startIndex) % 2 === 0;
            return {
                hash: '0x' + crypto_1.default.randomBytes(32).toString('hex'),
                from: isEven ? '0x' + crypto_1.default.randomBytes(20).toString('hex') : this.mockAccountInfo().address,
                to: isEven ? this.mockAccountInfo().address : '0x' + crypto_1.default.randomBytes(20).toString('hex'),
                value: ((Math.random() * 100) + 1).toFixed(2),
                timestamp,
                status: 'confirmed',
                type: isEven ? 'receive' : 'send',
                blockNumber: 1000000 - (index + startIndex),
                gasPrice: '0.00001',
                gasUsed: '0.00021',
                metadata: {
                    memo: isEven ? 'Payment received' : 'Payment sent',
                },
            };
        });
        return {
            transactions,
            total: totalTransactions,
            page,
            limit,
        };
    }
    /**
     * Mock transfer
     * @private
     */
    mockTransfer(to, amount, memo) {
        const hash = '0x' + crypto_1.default.randomBytes(32).toString('hex');
        return {
            success: true,
            transactionHash: hash,
            message: `Mock transfer of ${amount} FRC to ${to} successful`,
        };
    }
    /**
     * Mock storage metrics
     * @private
     */
    mockStorageMetrics() {
        return {
            allocated: 1073741824, // 1 GB
            used: 536870912, // 512 MB
            available: 536870912, // 512 MB
            nodes: 5,
            regions: [
                { name: 'us-east', nodes: 2 },
                { name: 'eu-central', nodes: 2 },
                { name: 'ap-southeast', nodes: 1 },
            ],
        };
    }
    /**
     * Mock allocate storage
     * @private
     */
    mockAllocateStorage(bytes, options) {
        const nodeCount = Math.min(Math.max(Math.floor(bytes / (100 * 1024 * 1024)), 1), 5);
        const nodes = Array.from({ length: nodeCount }, () => ({
            id: crypto_1.default.randomBytes(16).toString('hex'),
            region: ['us-east', 'eu-central', 'ap-southeast'][Math.floor(Math.random() * 3)],
            endpoint: `https://storage-${crypto_1.default.randomBytes(8).toString('hex')}.fractalcoin.network`,
            status: 'online',
        }));
        return {
            success: true,
            allocatedBytes: bytes,
            nodes,
            message: `Successfully allocated ${this.formatBytes(bytes)} of storage across ${nodeCount} nodes`,
        };
    }
    /**
     * Mock list bridges
     * @private
     */
    mockListBridges() {
        const totalBridges = Math.floor(Math.random() * 3) + 1;
        const bridges = Array.from({ length: totalBridges }, (_, index) => {
            const id = crypto_1.default.randomBytes(16).toString('hex');
            const createdAt = new Date(Date.now() - index * 86400000).toISOString();
            const allocatedBytes = 104857600 * (index + 1); // Multiple of 100 MB
            const nodeCount = Math.min(Math.max(Math.floor(allocatedBytes / (100 * 1024 * 1024)), 1), 5);
            const nodes = Array.from({ length: nodeCount }, () => ({
                id: crypto_1.default.randomBytes(16).toString('hex'),
                region: ['us-east', 'eu-central', 'ap-southeast'][Math.floor(Math.random() * 3)],
                endpoint: `https://storage-${crypto_1.default.randomBytes(8).toString('hex')}.fractalcoin.network`,
                status: 'online',
                usedStorage: allocatedBytes / nodeCount * 0.6,
                totalStorage: allocatedBytes / nodeCount,
            }));
            return {
                id,
                type: index === 0 ? 'filecoin' : 'ipfs',
                cid: 'bafybei' + crypto_1.default.randomBytes(24).toString('hex'),
                createdAt,
                status: 'active',
                allocatedBytes,
                nodes,
            };
        });
        return {
            bridges,
            total: totalBridges,
        };
    }
    /**
     * Mock register bridge
     * @private
     */
    mockRegisterBridge(bridgeData) {
        return {
            success: true,
            cid: 'bafybei' + crypto_1.default.randomBytes(24).toString('hex'),
            message: `Successfully registered ${bridgeData.type} bridge`,
        };
    }
    /**
     * Format bytes to human-readable string
     * @private
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
// Singleton instance
let apiInstance = null;
/**
 * Get the FractalCoin API instance
 */
function getFractalCoinAPI() {
    if (!apiInstance) {
        apiInstance = new FractalCoinAPI();
    }
    return apiInstance;
}
