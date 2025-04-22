"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apiClient_1 = __importDefault(require("./apiClient"));
class FractalCoinApi {
    constructor(baseURL, apiKey) {
        this.apiClient = new apiClient_1.default(baseURL);
        // Set API key if provided
        if (apiKey) {
            this.apiClient.setAuthToken(apiKey);
        }
    }
    // Get current coin data
    async getCoinData() {
        const response = await this.apiClient.client.get('/coin/data');
        return response.data;
    }
    // Get user wallet information
    async getWalletInfo(walletAddress) {
        const response = await this.apiClient.client.get(`/wallet/${walletAddress}`);
        return response.data;
    }
    // Get transaction history
    async getTransactions(walletAddress, limit = 10) {
        const response = await this.apiClient.client.get(`/transactions/${walletAddress}`, {
            params: { limit }
        });
        return response.data;
    }
    // Send transaction
    async sendTransaction(fromAddress, toAddress, amount) {
        const response = await this.apiClient.client.post('/transactions', {
            fromAddress,
            toAddress,
            amount
        });
        return response.data;
    }
    // Get staking information
    async getStakingInfo(walletAddress) {
        const response = await this.apiClient.client.get(`/staking/${walletAddress}`);
        return response.data;
    }
}
exports.default = FractalCoinApi;
