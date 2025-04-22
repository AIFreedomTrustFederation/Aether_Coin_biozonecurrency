"use strict";
/**
 * Bot Simulation API Client
 *
 * This module provides API clients for bots to interact with the Aetherion platform.
 * It integrates with the actual API endpoints while providing simulation-specific
 * functionality like rate limiting, error handling, and activity logging.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulationApiFactory = exports.SimulationApiClientFactory = exports.NodeMarketplaceApiClient = exports.WalletApiClient = exports.BaseApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("./utils");
// Default configuration
const DEFAULT_CONFIG = {
    baseUrl: '/api', // Will be replaced with actual API URL in production
    timeoutMs: 30000,
    retryAttempts: 3,
    retryDelayMs: 1000,
    userAgent: 'AetherionBotSimulation/1.0'
};
// Base API Client
class BaseApiClient {
    constructor(config = {}, botProfile) {
        this.activityLog = [];
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.botProfile = botProfile;
        // Create axios instance
        this.axiosInstance = axios_1.default.create({
            baseURL: this.config.baseUrl,
            timeout: this.config.timeoutMs,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': this.config.userAgent,
                'X-Bot-Simulation': 'true'
            }
        });
        // Add request interceptor for auth if bot profile is provided
        if (botProfile) {
            this.axiosInstance.interceptors.request.use(config => {
                config.headers = config.headers || {};
                config.headers['X-Bot-ID'] = botProfile.id;
                config.headers['X-Bot-Wallet'] = botProfile.walletAddress;
                return config;
            });
        }
        // Add response interceptor for logging
        this.axiosInstance.interceptors.response.use(this.handleSuccessResponse.bind(this), this.handleErrorResponse.bind(this));
    }
    // Handle successful responses
    handleSuccessResponse(response) {
        const { config, status, headers } = response;
        const startTime = config.metadata?.startTime || Date.now();
        const duration = Date.now() - startTime;
        this.logActivity(config.url || '', config.method || 'GET', status, duration, true);
        return response;
    }
    // Handle error responses with retry logic
    async handleErrorResponse(error) {
        const { config, response } = error;
        const status = response?.status || 0;
        // Set metadata if it doesn't exist
        if (!config.metadata) {
            config.metadata = {
                startTime: Date.now(),
                retryCount: 0
            };
        }
        const { startTime, retryCount } = config.metadata;
        const duration = Date.now() - startTime;
        // Log the error
        this.logActivity(config.url || '', config.method || 'GET', status, duration, false);
        // Don't retry certain status codes
        const noRetryStatuses = [400, 401, 403, 404, 422];
        if (noRetryStatuses.includes(status)) {
            return Promise.reject(error);
        }
        // Check if we should retry
        if (retryCount < this.config.retryAttempts) {
            config.metadata.retryCount = retryCount + 1;
            // Calculate delay with exponential backoff and jitter
            const delay = this.config.retryDelayMs * Math.pow(2, retryCount) + (0, utils_1.getRandomInt)(0, 1000);
            console.log(`Retrying request to ${config.url} (attempt ${retryCount + 1}/${this.config.retryAttempts}) after ${delay}ms`);
            await (0, utils_1.sleep)(delay);
            return this.axiosInstance(config);
        }
        return Promise.reject(error);
    }
    // Log API activity
    logActivity(endpoint, method, status, duration, success) {
        this.activityLog.push({
            timestamp: new Date(),
            endpoint,
            method,
            status,
            duration,
            success
        });
        // Keep log size manageable
        if (this.activityLog.length > 1000) {
            this.activityLog.shift();
        }
    }
    // Get activity log
    getActivityLog() {
        return this.activityLog;
    }
    // Basic request methods
    async get(url, params) {
        try {
            // Track request start time for measurement
            const startTime = Date.now();
            const response = await this.axiosInstance.get(url, { params });
            // Log the activity
            this.logActivity(url, 'GET', response.status, Date.now() - startTime, true);
            return response.data;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    async post(url, data) {
        try {
            // Track request start time for measurement
            const startTime = Date.now();
            const response = await this.axiosInstance.post(url, data);
            // Log the activity
            this.logActivity(url, 'POST', response.status, Date.now() - startTime, true);
            return response.data;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    async put(url, data) {
        try {
            // Track request start time for measurement
            const startTime = Date.now();
            const response = await this.axiosInstance.put(url, data);
            // Log the activity
            this.logActivity(url, 'PUT', response.status, Date.now() - startTime, true);
            return response.data;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    async delete(url) {
        try {
            // Track request start time for measurement
            const startTime = Date.now();
            const response = await this.axiosInstance.delete(url);
            // Log the activity
            this.logActivity(url, 'DELETE', response.status, Date.now() - startTime, true);
            return response.data;
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    // Error handling
    handleError(error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // outside the 2xx range
            return {
                success: false,
                error: error.response.data?.error || 'API request failed',
                timestamp: new Date().toISOString()
            };
        }
        else if (error.request) {
            // The request was made but no response was received
            return {
                success: false,
                error: 'No response received from server',
                timestamp: new Date().toISOString()
            };
        }
        else {
            // Something happened in setting up the request
            return {
                success: false,
                error: error.message || 'Unknown error',
                timestamp: new Date().toISOString()
            };
        }
    }
}
exports.BaseApiClient = BaseApiClient;
// Wallet API Client
class WalletApiClient extends BaseApiClient {
    constructor(config = {}, botProfile) {
        super(config, botProfile);
    }
    // Get wallet balance
    async getBalance(address) {
        return this.get(`/wallet/balance/${address}`);
    }
    // Get transaction history
    async getTransactions(address) {
        return this.get(`/wallet/transactions/${address}`);
    }
    // Transfer funds
    async transfer(fromAddress, toAddress, amount) {
        return this.post('/wallet/send', {
            fromAddress,
            toAddress,
            amount
        });
    }
    // Create new wallet
    async createWallet(userId) {
        // Generate random keys for simulation
        const publicKey = Buffer.from(Math.random().toString()).toString('base64');
        const encryptedPrivateKey = Buffer.from(Math.random().toString()).toString('base64');
        return this.post('/wallet/create', {
            userId,
            publicKey,
            encryptedPrivateKey
        });
    }
}
exports.WalletApiClient = WalletApiClient;
// Node Marketplace API Client
class NodeMarketplaceApiClient extends BaseApiClient {
    constructor(config = {}, botProfile) {
        super(config, botProfile);
    }
    // List available nodes
    async listNodes(page = 1, limit = 10) {
        return this.get('/node-marketplace/list', { page, limit });
    }
    // Get node details
    async getNodeDetails(nodeId) {
        return this.get(`/node-marketplace/node/${nodeId}`);
    }
    // Purchase a node
    async purchaseNode(nodeId, buyerAddress) {
        return this.post('/node-marketplace/purchase', {
            nodeId,
            buyerAddress
        });
    }
    // List a node for sale
    async sellNode(ownerAddress, nodeType, price, description) {
        return this.post('/node-marketplace/sell', {
            ownerAddress,
            nodeType,
            price,
            description
        });
    }
}
exports.NodeMarketplaceApiClient = NodeMarketplaceApiClient;
// API Client Factory
class SimulationApiClientFactory {
    constructor(config = {}) {
        this.config = config;
    }
    // Get singleton instance
    static getInstance(config = {}) {
        if (!SimulationApiClientFactory.instance) {
            SimulationApiClientFactory.instance = new SimulationApiClientFactory(config);
        }
        return SimulationApiClientFactory.instance;
    }
    // Create wallet API client
    createWalletApiClient(botProfile) {
        return new WalletApiClient(this.config, botProfile);
    }
    // Create node marketplace API client
    createNodeMarketplaceApiClient(botProfile) {
        return new NodeMarketplaceApiClient(this.config, botProfile);
    }
}
exports.SimulationApiClientFactory = SimulationApiClientFactory;
// Export factory instance with default configuration
exports.simulationApiFactory = SimulationApiClientFactory.getInstance();
