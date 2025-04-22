"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoCompareService = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const BASE_URL = 'https://min-api.cryptocompare.com/data';
// API key is optional for basic usage but recommended for production
const API_KEY = process.env.CRYPTOCOMPARE_API_KEY || '';
/**
 * CryptoCompare API Service
 * Documentation: https://min-api.cryptocompare.com/documentation
 *
 * Free API with higher rate limits when using an API key
 */
exports.CryptoCompareService = {
    /**
     * Get latest cryptocurrency news
     * @param categories News categories (e.g., 'BTC,ETH,Technology')
     * @param excludeCategories Categories to exclude
     * @param limit Number of news articles to return (max 50)
     * @returns Array of news articles
     */
    async getNews(categories = '', excludeCategories = '', limit = 10) {
        try {
            const params = {
                lang: 'EN',
                sortOrder: 'latest',
                limit: Math.min(limit, 50),
            };
            if (categories) {
                params.categories = categories;
            }
            if (excludeCategories) {
                params.excludeCategories = excludeCategories;
            }
            const headers = {};
            if (API_KEY) {
                headers['authorization'] = `Apikey ${API_KEY}`;
            }
            const response = await axios_1.default.get(`${BASE_URL}/v2/news/`, {
                params,
                headers,
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching news from CryptoCompare:', error);
            throw error;
        }
    },
    /**
     * Get current cryptocurrency prices
     * @param fsyms From symbols (comma-separated list of cryptocurrencies)
     * @param tsyms To symbols (comma-separated list of target currencies)
     * @returns Current prices
     */
    async getPrice(fsyms, tsyms = 'USD') {
        try {
            const headers = {};
            if (API_KEY) {
                headers['authorization'] = `Apikey ${API_KEY}`;
            }
            const response = await axios_1.default.get(`${BASE_URL}/pricemultifull`, {
                params: {
                    fsyms,
                    tsyms,
                },
                headers,
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching prices from CryptoCompare:', error);
            throw error;
        }
    },
    /**
     * Get historical OHLCV data
     * @param fsym From symbol (cryptocurrency)
     * @param tsym To symbol (target currency)
     * @param aggregate Aggregation level (e.g., 1 for hourly, 24 for daily)
     * @param limit Number of data points to return
     * @returns Historical OHLCV data
     */
    async getHistoricalData(fsym, tsym = 'USD', aggregate = 1, limit = 30) {
        try {
            const headers = {};
            if (API_KEY) {
                headers['authorization'] = `Apikey ${API_KEY}`;
            }
            const response = await axios_1.default.get(`${BASE_URL}/v2/histoday`, {
                params: {
                    fsym,
                    tsym,
                    limit,
                    aggregate,
                },
                headers,
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching historical data from CryptoCompare:', error);
            throw error;
        }
    },
    /**
     * Get top market cap cryptocurrencies
     * @param tsym Target currency (e.g., 'USD')
     * @param limit Number of currencies to return
     * @param page Page number
     * @returns Top cryptocurrencies by market cap
     */
    async getTopByMarketCap(tsym = 'USD', limit = 20, page = 0) {
        try {
            const headers = {};
            if (API_KEY) {
                headers['authorization'] = `Apikey ${API_KEY}`;
            }
            const response = await axios_1.default.get(`${BASE_URL}/top/mktcapfull`, {
                params: {
                    tsym,
                    limit,
                    page,
                },
                headers,
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching top cryptocurrencies from CryptoCompare:', error);
            throw error;
        }
    },
    /**
     * Get all available trading pairs for a coin
     * @param fsym From symbol (cryptocurrency)
     * @returns Available trading pairs
     */
    async getTradingPairs(fsym) {
        try {
            const headers = {};
            if (API_KEY) {
                headers['authorization'] = `Apikey ${API_KEY}`;
            }
            const response = await axios_1.default.get(`${BASE_URL}/v2/pair/mapping/fsym`, {
                params: {
                    fsym,
                },
                headers,
            });
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching trading pairs for ${fsym} from CryptoCompare:`, error);
            throw error;
        }
    }
};
exports.default = exports.CryptoCompareService;
