"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockstreamService = void 0;
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'https://blockstream.info/api';
/**
 * Blockstream API Service for Bitcoin blockchain data
 * Documentation: https://github.com/Blockstream/esplora/blob/master/API.md
 *
 * Open source Bitcoin explorer API with no API key required
 */
exports.BlockstreamService = {
    /**
     * Get address information and transaction history
     * @param address Bitcoin address
     * @returns Address information and transaction history
     */
    async getAddressInfo(address) {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/address/${address}`);
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching address info for ${address}:`, error);
            throw error;
        }
    },
    /**
     * Get address transactions
     * @param address Bitcoin address
     * @returns List of transactions
     */
    async getAddressTxs(address) {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/address/${address}/txs`);
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching transactions for address ${address}:`, error);
            throw error;
        }
    },
    /**
     * Get transaction details
     * @param txid Transaction ID
     * @returns Transaction details
     */
    async getTransaction(txid) {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/tx/${txid}`);
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching transaction ${txid}:`, error);
            throw error;
        }
    },
    /**
     * Get current Bitcoin blockchain information
     * @returns Current blockchain tip information
     */
    async getBlockchainInfo() {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/blocks/tip/status`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching blockchain info:', error);
            throw error;
        }
    },
    /**
     * Get current Bitcoin mempool information
     * @returns Current mempool statistics
     */
    async getMempoolInfo() {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/mempool`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching mempool info:', error);
            throw error;
        }
    },
    /**
     * Get fee estimates for different confirmation targets
     * @returns Fee estimates in satoshis per vbyte
     */
    async getFeeEstimates() {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/fee-estimates`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching fee estimates:', error);
            throw error;
        }
    },
    /**
     * Get block information by height or hash
     * @param blockId Block height or hash
     * @returns Block details
     */
    async getBlock(blockId) {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/block/${blockId}`);
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching block ${blockId}:`, error);
            throw error;
        }
    }
};
exports.default = exports.BlockstreamService;
