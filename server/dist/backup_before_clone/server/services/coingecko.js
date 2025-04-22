"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinGeckoService = void 0;
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'https://api.coingecko.com/api/v3';
/**
 * CoinGecko API Service
 * Documentation: https://www.coingecko.com/en/api/documentation
 *
 * Open source, free API with rate limiting (10-50 calls/minute)
 */
exports.CoinGeckoService = {
    /**
     * Get current prices for multiple coins
     * @param ids Comma-separated list of coin IDs (e.g., 'bitcoin,ethereum')
     * @param vsCurrencies Comma-separated list of target currencies (e.g., 'usd,eur')
     * @returns Object with prices for each coin in each currency
     */
    async getPrice(ids, vsCurrencies = 'usd') {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/simple/price`, {
                params: {
                    ids,
                    vs_currencies: vsCurrencies,
                    include_24hr_change: true,
                    include_market_cap: true,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching prices from CoinGecko:', error);
            throw error;
        }
    },
    /**
     * Get price history for a specific coin
     * @param id Coin ID (e.g., 'bitcoin')
     * @param days Number of days of data to return (1, 7, 14, 30, 90, 180, 365, max)
     * @param interval Data interval (daily, hourly)
     * @returns Array of prices with timestamps
     */
    async getPriceHistory(id, days = 7, interval = 'daily') {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/coins/${id}/market_chart`, {
                params: {
                    vs_currency: 'usd',
                    days,
                    interval,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching price history from CoinGecko:', error);
            throw error;
        }
    },
    /**
     * Get trending coins in the last 24 hours
     * @returns List of trending coins
     */
    async getTrending() {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/search/trending`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching trending coins from CoinGecko:', error);
            throw error;
        }
    },
    /**
     * Get list of supported coins with IDs
     * @returns List of all supported coins with ID and symbol
     */
    async getCoinsList() {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/coins/list`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching coins list from CoinGecko:', error);
            throw error;
        }
    },
    /**
     * Get detailed coin data by ID
     * @param id Coin ID (e.g., 'bitcoin')
     * @returns Detailed coin data
     */
    async getCoinData(id) {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/coins/${id}`, {
                params: {
                    localization: false,
                    tickers: false,
                    market_data: true,
                    community_data: false,
                    developer_data: false,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching data for coin ${id} from CoinGecko:`, error);
            throw error;
        }
    },
    /**
     * Get global cryptocurrency market data
     * @returns Global market data
     */
    async getGlobalData() {
        try {
            const response = await axios_1.default.get(`${BASE_URL}/global`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching global market data from CoinGecko:', error);
            throw error;
        }
    }
};
exports.default = exports.CoinGeckoService;
