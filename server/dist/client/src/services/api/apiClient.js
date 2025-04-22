"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRequest = void 0;
const axios_1 = __importDefault(require("axios"));
// Base API client for shared configuration
class ApiClient {
    constructor(baseURL, config) {
        this.client = axios_1.default.create({
            baseURL,
            timeout: 30000, // 30 seconds timeout
            headers: {
                'Content-Type': 'application/json',
            },
            ...config,
        });
        // Response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            console.error('API request failed:', error);
            return Promise.reject(error);
        });
    }
    // Method to set auth token
    setAuthToken(token) {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    // Clear auth token (for logout)
    clearAuthToken() {
        delete this.client.defaults.headers.common['Authorization'];
    }
}
// Create a default API client instance
const defaultClient = new ApiClient('/api');
// Generic API request function
const apiRequest = async ({ url, method = 'GET', data = undefined, params = undefined, headers = {} }) => {
    try {
        const response = await defaultClient.client.request({
            url,
            method,
            data,
            params,
            headers
        });
        return response.data;
    }
    catch (error) {
        console.error(`API ${method} request to ${url} failed:`, error);
        throw error;
    }
};
exports.apiRequest = apiRequest;
exports.default = ApiClient;
