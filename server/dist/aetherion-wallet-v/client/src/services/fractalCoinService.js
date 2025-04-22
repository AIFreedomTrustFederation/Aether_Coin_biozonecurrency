"use strict";
/**
 * FractalCoin Service
 *
 * Provides frontend services for interacting with the FractalCoin API
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAddress = exports.formatBytes = exports.createBridge = exports.listBridges = exports.allocateStorage = exports.getStorageMetrics = exports.transferFractalCoin = exports.getTransactions = exports.getBalance = exports.getAccountInfo = exports.TransactionType = void 0;
const axios_1 = __importDefault(require("axios"));
// Base API URL - will be proxied through our Express server
const API_BASE_URL = '/api/fractalcoin';
// Transaction types
var TransactionType;
(function (TransactionType) {
    TransactionType["SEND"] = "send";
    TransactionType["RECEIVE"] = "receive";
    TransactionType["STORAGE_ALLOCATION"] = "storage_allocation";
    TransactionType["BRIDGE_CREATION"] = "bridge_creation";
    TransactionType["REWARD"] = "reward";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
// Error handling helper
const handleAxiosError = (error) => {
    if (error.response) {
        // The request was made and the server responded with an error status
        throw new Error(`FractalCoin API Error (${error.response.status}): ${error.response.data.message || 'Unknown error'}`);
    }
    else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response received from FractalCoin API. Please check your connection.');
    }
    else {
        // Something happened in setting up the request
        throw new Error(`Error setting up request: ${error.message}`);
    }
};
/**
 * Get account information
 */
const getAccountInfo = async () => {
    try {
        const response = await axios_1.default.get(`${API_BASE_URL}/account/info`);
        return response.data;
    }
    catch (error) {
        return handleAxiosError(error);
    }
};
exports.getAccountInfo = getAccountInfo;
/**
 * Get account balance
 */
const getBalance = async () => {
    try {
        const response = await axios_1.default.get(`${API_BASE_URL}/account/balance`);
        return response.data;
    }
    catch (error) {
        return handleAxiosError(error);
    }
};
exports.getBalance = getBalance;
/**
 * Get transaction history
 * @param page Page number
 * @param limit Number of transactions per page
 */
const getTransactions = async (page = 1, limit = 20) => {
    try {
        const response = await axios_1.default.get(`${API_BASE_URL}/account/transactions`, {
            params: { page, limit }
        });
        return response.data;
    }
    catch (error) {
        return handleAxiosError(error);
    }
};
exports.getTransactions = getTransactions;
/**
 * Transfer FractalCoin
 * @param to Recipient address
 * @param amount Amount to transfer
 * @param memo Optional memo
 */
const transferFractalCoin = async (to, amount, memo) => {
    try {
        const response = await axios_1.default.post(`${API_BASE_URL}/transactions/transfer`, {
            to,
            amount,
            memo
        });
        return response.data;
    }
    catch (error) {
        return handleAxiosError(error);
    }
};
exports.transferFractalCoin = transferFractalCoin;
/**
 * Get storage metrics
 */
const getStorageMetrics = async () => {
    try {
        const response = await axios_1.default.get(`${API_BASE_URL}/storage/metrics`);
        return response.data;
    }
    catch (error) {
        return handleAxiosError(error);
    }
};
exports.getStorageMetrics = getStorageMetrics;
/**
 * Allocate storage
 * @param bytes Number of bytes to allocate
 * @param options Allocation options
 */
const allocateStorage = async (bytes, options) => {
    try {
        const response = await axios_1.default.post(`${API_BASE_URL}/storage/allocate`, {
            bytes,
            purpose: options?.purpose || 'general',
            redundancy: options?.redundancy || 3,
            encryption: options?.encryption || 'aes-256-gcm'
        });
        return response.data;
    }
    catch (error) {
        return handleAxiosError(error);
    }
};
exports.allocateStorage = allocateStorage;
/**
 * List active bridges
 */
const listBridges = async () => {
    try {
        const response = await axios_1.default.get(`${API_BASE_URL}/bridges/list`);
        return response.data;
    }
    catch (error) {
        return handleAxiosError(error);
    }
};
exports.listBridges = listBridges;
/**
 * Create a bridge to another network (like Filecoin)
 * @param type Bridge type (e.g., 'filecoin')
 * @param config Bridge configuration
 */
const createBridge = async (type, config) => {
    try {
        const response = await axios_1.default.post(`${API_BASE_URL}/bridges/create`, {
            type,
            config
        });
        return response.data;
    }
    catch (error) {
        return handleAxiosError(error);
    }
};
exports.createBridge = createBridge;
/**
 * Format bytes to human-readable string
 * @param bytes Number of bytes
 * @param decimals Number of decimal places
 */
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
exports.formatBytes = formatBytes;
/**
 * Format account address for display (truncate middle)
 * @param address Full address string
 * @param startChars Number of starting characters to keep
 * @param endChars Number of ending characters to keep
 */
const formatAddress = (address, startChars = 6, endChars = 4) => {
    if (!address)
        return '';
    if (address.length <= startChars + endChars)
        return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};
exports.formatAddress = formatAddress;
// Export all functions as a service object
const fractalCoinService = {
    getAccountInfo: exports.getAccountInfo,
    getBalance: exports.getBalance,
    getTransactions: exports.getTransactions,
    transferFractalCoin: exports.transferFractalCoin,
    getStorageMetrics: exports.getStorageMetrics,
    allocateStorage: exports.allocateStorage,
    listBridges: exports.listBridges,
    createBridge: exports.createBridge,
    formatBytes: exports.formatBytes,
    formatAddress: exports.formatAddress,
};
exports.default = fractalCoinService;
