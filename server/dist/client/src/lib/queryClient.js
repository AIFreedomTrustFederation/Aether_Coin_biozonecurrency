"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = exports.defaultQueryFn = exports.apiRequest = void 0;
const axios_1 = __importDefault(require("axios"));
// Basic axios instance for API requests
const apiClient = axios_1.default.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json',
    },
});
exports.apiClient = apiClient;
// Helper function for making API requests 
const apiRequest = async (url, method = 'GET', data) => {
    try {
        const response = await apiClient({
            method,
            url,
            data,
        });
        return response.data;
    }
    catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};
exports.apiRequest = apiRequest;
// Default query function for react-query
const defaultQueryFn = async ({ queryKey }) => {
    // If queryKey is an array, the first element is the path
    const path = Array.isArray(queryKey) ? queryKey[0] : queryKey;
    // If there's an ID in the queryKey as the second element
    let url = path;
    if (Array.isArray(queryKey) && queryKey.length > 1 && queryKey[1] !== undefined) {
        url = `${path}/${queryKey[1]}`;
    }
    return (0, exports.apiRequest)(url);
};
exports.defaultQueryFn = defaultQueryFn;
