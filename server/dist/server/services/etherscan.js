"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EtherscanService = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Default free API key (with rate limits)
// For production use, should use an environment variable
const API_KEY = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken';
const BASE_URL = 'https://api.etherscan.io/api';
/**
 * Etherscan API Service
 * Documentation: https://docs.etherscan.io/
 *
 * Requires a free API key with generous rate limits
 */
exports.EtherscanService = {
    /**
     * Get current Ethereum gas price
     * @returns Current gas price in Gwei
     */
    async getGasPrice() {
        try {
            const response = await axios_1.default.get(BASE_URL, {
                params: {
                    module: 'gastracker',
                    action: 'gasoracle',
                    apikey: API_KEY,
                },
            });
            if (response.data.status === '1') {
                return response.data.result;
            }
            else {
                throw new Error(response.data.message || 'Failed to fetch gas price');
            }
        }
        catch (error) {
            console.error('Error fetching gas price from Etherscan:', error);
            throw error;
        }
    },
    /**
     * Get Ethereum account balance
     * @param address Ethereum address
     * @returns Account balance in Wei
     */
    async getBalance(address) {
        try {
            const response = await axios_1.default.get(BASE_URL, {
                params: {
                    module: 'account',
                    action: 'balance',
                    address,
                    tag: 'latest',
                    apikey: API_KEY,
                },
            });
            if (response.data.status === '1') {
                return response.data.result;
            }
            else {
                throw new Error(response.data.message || 'Failed to fetch balance');
            }
        }
        catch (error) {
            console.error(`Error fetching balance for address ${address}:`, error);
            throw error;
        }
    },
    /**
     * Get list of transactions for an address
     * @param address Ethereum address
     * @param startBlock Starting block number (optional)
     * @param endBlock Ending block number (optional)
     * @param page Page number (optional)
     * @param offset Max records to return (optional)
     * @param sort Sorting preference (optional, 'asc' or 'desc')
     * @returns List of transactions
     */
    async getTransactions(address, startBlock = 0, endBlock = 99999999, page = 1, offset = 10, sort = 'desc') {
        try {
            const response = await axios_1.default.get(BASE_URL, {
                params: {
                    module: 'account',
                    action: 'txlist',
                    address,
                    startblock: startBlock,
                    endblock: endBlock,
                    page,
                    offset,
                    sort,
                    apikey: API_KEY,
                },
            });
            if (response.data.status === '1') {
                return response.data.result;
            }
            else {
                throw new Error(response.data.message || 'Failed to fetch transactions');
            }
        }
        catch (error) {
            console.error(`Error fetching transactions for address ${address}:`, error);
            throw error;
        }
    },
    /**
     * Get ERC-20 token transactions for an address
     * @param address Ethereum address
     * @param contractAddress Token contract address (optional)
     * @param page Page number (optional)
     * @param offset Max records to return (optional)
     * @param sort Sorting preference (optional, 'asc' or 'desc')
     * @returns List of token transactions
     */
    async getTokenTransactions(address, contractAddress = '', page = 1, offset = 10, sort = 'desc') {
        try {
            const params = {
                module: 'account',
                action: 'tokentx',
                address,
                page,
                offset,
                sort,
                apikey: API_KEY,
            };
            if (contractAddress) {
                params.contractaddress = contractAddress;
            }
            const response = await axios_1.default.get(BASE_URL, { params });
            if (response.data.status === '1') {
                return response.data.result;
            }
            else {
                throw new Error(response.data.message || 'Failed to fetch token transactions');
            }
        }
        catch (error) {
            console.error(`Error fetching token transactions for address ${address}:`, error);
            throw error;
        }
    },
    /**
     * Get Ethereum block by number
     * @param blockNumber Block number
     * @returns Block information
     */
    async getBlock(blockNumber) {
        try {
            const response = await axios_1.default.get(BASE_URL, {
                params: {
                    module: 'proxy',
                    action: 'eth_getBlockByNumber',
                    tag: `0x${blockNumber.toString(16)}`,
                    boolean: true,
                    apikey: API_KEY,
                },
            });
            if (response.data.result) {
                return response.data.result;
            }
            else {
                throw new Error(response.data.error?.message || 'Failed to fetch block');
            }
        }
        catch (error) {
            console.error(`Error fetching block ${blockNumber}:`, error);
            throw error;
        }
    }
};
exports.default = exports.EtherscanService;
