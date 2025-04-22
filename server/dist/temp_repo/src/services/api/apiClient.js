"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = ApiClient;
