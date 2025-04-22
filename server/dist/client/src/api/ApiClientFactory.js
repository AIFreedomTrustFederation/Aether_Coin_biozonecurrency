"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClientFactory = void 0;
const axios_1 = __importDefault(require("axios"));
// Base API Client implementation
class BaseApiClient {
    constructor(baseUrl = '/api', config = {}) {
        this.baseUrl = baseUrl;
        this.client = axios_1.default.create({
            baseURL: baseUrl,
            ...config,
            headers: {
                'Content-Type': 'application/json',
                ...config.headers
            }
        });
        this.setupInterceptors();
    }
    setupInterceptors() {
        // Request interceptor
        this.client.interceptors.request.use((config) => {
            // Add authentication token if available
            const token = localStorage.getItem('auth_token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => Promise.reject(error));
        // Response interceptor
        this.client.interceptors.response.use((response) => {
            // Directly return data from response
            return response.data;
        }, (error) => {
            // Handle common errors
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        // Handle unauthorized
                        console.error('Unauthorized access');
                        // Redirect to login or refresh token
                        break;
                    case 403:
                        // Handle forbidden
                        console.error('Forbidden resource');
                        break;
                    case 404:
                        // Handle not found
                        console.error('Resource not found');
                        break;
                    case 500:
                        // Handle server error
                        console.error('Server error');
                        break;
                    default:
                        console.error(`Error ${error.response.status}`, error.response.data);
                }
            }
            else if (error.request) {
                // Handle network errors
                console.error('Network error', error.request);
            }
            else {
                // Handle other errors
                console.error('Error', error.message);
            }
            return Promise.reject(error);
        });
    }
    get(url, config) {
        return this.client.get(url, config);
    }
    post(url, data, config) {
        return this.client.post(url, data, config);
    }
    put(url, data, config) {
        return this.client.put(url, data, config);
    }
    delete(url, config) {
        return this.client.delete(url, config);
    }
    patch(url, data, config) {
        return this.client.patch(url, data, config);
    }
}
// Specialized API clients for each micro-app
class DashboardApiClient extends BaseApiClient {
    constructor() {
        super('/api/dashboard');
    }
    // Dashboard-specific methods
    getDashboardStats() {
        return this.get('/stats');
    }
    getRecentActivity() {
        return this.get('/activity');
    }
}
class WalletApiClient extends BaseApiClient {
    constructor() {
        super('/api/wallet');
    }
    // Wallet-specific methods
    getBalances() {
        return this.get('/balances');
    }
    getTransactions() {
        return this.get('/transactions');
    }
    transfer(data) {
        return this.post('/transfer', data);
    }
}
class NodeMarketplaceApiClient extends BaseApiClient {
    constructor() {
        super('/api/node-marketplace');
    }
    // Node Marketplace-specific methods
    getAvailableServices() {
        return this.get('/services');
    }
    getUserServices() {
        return this.get('/user/services');
    }
    getUserRewards() {
        return this.get('/user/rewards');
    }
    deployService(data) {
        return this.post('/deploy', data);
    }
}
class TokenomicsApiClient extends BaseApiClient {
    constructor() {
        super('/api/tokenomics');
    }
    // Tokenomics-specific methods
    getMarketData() {
        return this.get('/market');
    }
    getSupplyInfo() {
        return this.get('/supply');
    }
}
class AICoinApiClient extends BaseApiClient {
    constructor() {
        super('/api/aicoin');
    }
    // AICoin-specific methods
    getNetworkStats() {
        return this.get('/network/stats');
    }
    getUserResources() {
        return this.get('/user/resources');
    }
    allocateResources(data) {
        return this.post('/allocate', data);
    }
}
// API Client Factory
class ApiClientFactory {
    constructor() {
        this.clients = {};
        // Initialize default clients
        this.clients = {
            dashboard: new DashboardApiClient(),
            wallet: new WalletApiClient(),
            nodeMarketplace: new NodeMarketplaceApiClient(),
            tokenomics: new TokenomicsApiClient(),
            aicoin: new AICoinApiClient()
        };
    }
    /**
     * Get an API client for a specific app
     * @param appId App identifier
     * @returns API client for the specified app
     */
    getClient(appId) {
        if (!this.clients[appId]) {
            console.warn(`No specific API client found for app "${appId}". Using base client.`);
            this.clients[appId] = new BaseApiClient(`/api/${appId}`);
        }
        return this.clients[appId];
    }
    /**
     * Register a new API client
     * @param appId App identifier
     * @param client API client instance
     */
    registerClient(appId, client) {
        this.clients[appId] = client;
    }
}
// Export singleton instance
exports.apiClientFactory = new ApiClientFactory();
