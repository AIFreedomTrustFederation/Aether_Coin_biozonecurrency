"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coingecko_1 = require("../services/coingecko");
const blockstream_1 = require("../services/blockstream");
const etherscan_1 = require("../services/etherscan");
const cryptocompare_1 = require("../services/cryptocompare");
const matrix_1 = require("../services/matrix");
const router = (0, express_1.Router)();
// Rate limiting helper for all endpoints
const rateLimitMiddleware = (req, res, next) => {
    // Simple rate limiting - could be expanded for production
    next();
};
// --- CoinGecko API Routes ---
router.get('/coingecko/prices', rateLimitMiddleware, async (req, res) => {
    try {
        const { ids, vs_currencies } = req.query;
        if (!ids) {
            return res.status(400).json({ error: 'Missing required parameter: ids' });
        }
        const data = await coingecko_1.CoinGeckoService.getPrice(ids, vs_currencies || 'usd');
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching coin prices:', error);
        res.status(500).json({
            error: 'Failed to fetch price data',
            message: error.message
        });
    }
});
router.get('/coingecko/price-history/:id', rateLimitMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { days, interval } = req.query;
        const data = await coingecko_1.CoinGeckoService.getPriceHistory(id, days || '7', interval || 'daily');
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching price history:', error);
        res.status(500).json({
            error: 'Failed to fetch price history',
            message: error.message
        });
    }
});
router.get('/coingecko/trending', rateLimitMiddleware, async (_req, res) => {
    try {
        const data = await coingecko_1.CoinGeckoService.getTrending();
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching trending coins:', error);
        res.status(500).json({
            error: 'Failed to fetch trending coins',
            message: error.message
        });
    }
});
router.get('/coingecko/global', rateLimitMiddleware, async (_req, res) => {
    try {
        const data = await coingecko_1.CoinGeckoService.getGlobalData();
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching global market data:', error);
        res.status(500).json({
            error: 'Failed to fetch global market data',
            message: error.message
        });
    }
});
// --- Blockstream API Routes ---
router.get('/blockstream/address/:address', rateLimitMiddleware, async (req, res) => {
    try {
        const { address } = req.params;
        const data = await blockstream_1.BlockstreamService.getAddressInfo(address);
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching Bitcoin address info:', error);
        res.status(500).json({
            error: 'Failed to fetch Bitcoin address info',
            message: error.message
        });
    }
});
router.get('/blockstream/address/:address/txs', rateLimitMiddleware, async (req, res) => {
    try {
        const { address } = req.params;
        const data = await blockstream_1.BlockstreamService.getAddressTxs(address);
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching Bitcoin address transactions:', error);
        res.status(500).json({
            error: 'Failed to fetch Bitcoin address transactions',
            message: error.message
        });
    }
});
router.get('/blockstream/fees', rateLimitMiddleware, async (_req, res) => {
    try {
        const data = await blockstream_1.BlockstreamService.getFeeEstimates();
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching Bitcoin fee estimates:', error);
        res.status(500).json({
            error: 'Failed to fetch Bitcoin fee estimates',
            message: error.message
        });
    }
});
// --- Etherscan API Routes ---
router.get('/etherscan/gas', rateLimitMiddleware, async (_req, res) => {
    try {
        const data = await etherscan_1.EtherscanService.getGasPrice();
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching Ethereum gas price:', error);
        res.status(500).json({
            error: 'Failed to fetch Ethereum gas price',
            message: error.message
        });
    }
});
router.get('/etherscan/address/:address', rateLimitMiddleware, async (req, res) => {
    try {
        const { address } = req.params;
        const balance = await etherscan_1.EtherscanService.getBalance(address);
        res.json({ address, balance });
    }
    catch (error) {
        console.error('Error fetching Ethereum address balance:', error);
        res.status(500).json({
            error: 'Failed to fetch Ethereum address balance',
            message: error.message
        });
    }
});
router.get('/etherscan/address/:address/transactions', rateLimitMiddleware, async (req, res) => {
    try {
        const { address } = req.params;
        const { startblock, endblock, page, offset, sort } = req.query;
        const data = await etherscan_1.EtherscanService.getTransactions(address, startblock ? parseInt(startblock) : undefined, endblock ? parseInt(endblock) : undefined, page ? parseInt(page) : undefined, offset ? parseInt(offset) : undefined, sort || undefined);
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching Ethereum transactions:', error);
        res.status(500).json({
            error: 'Failed to fetch Ethereum transactions',
            message: error.message
        });
    }
});
// --- CryptoCompare API Routes ---
router.get('/cryptocompare/news', rateLimitMiddleware, async (req, res) => {
    try {
        const { categories, excludeCategories, limit } = req.query;
        const data = await cryptocompare_1.CryptoCompareService.getNews(categories, excludeCategories, limit ? parseInt(limit) : 10);
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching crypto news:', error);
        res.status(500).json({
            error: 'Failed to fetch crypto news',
            message: error.message
        });
    }
});
router.get('/cryptocompare/price', rateLimitMiddleware, async (req, res) => {
    try {
        const { fsyms, tsyms } = req.query;
        if (!fsyms) {
            return res.status(400).json({ error: 'Missing required parameter: fsyms' });
        }
        const data = await cryptocompare_1.CryptoCompareService.getPrice(fsyms, tsyms || 'USD');
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching crypto prices:', error);
        res.status(500).json({
            error: 'Failed to fetch crypto prices',
            message: error.message
        });
    }
});
router.get('/cryptocompare/top', rateLimitMiddleware, async (req, res) => {
    try {
        const { tsym, limit, page } = req.query;
        const data = await cryptocompare_1.CryptoCompareService.getTopByMarketCap(tsym || 'USD', limit ? parseInt(limit) : 20, page ? parseInt(page) : 0);
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching top cryptocurrencies:', error);
        res.status(500).json({
            error: 'Failed to fetch top cryptocurrencies',
            message: error.message
        });
    }
});
// --- Matrix API Routes ---
// Matrix notification testing route - for development only
router.post('/matrix/test-notification', async (req, res) => {
    try {
        const { matrixId, message, htmlMessage } = req.body;
        if (!matrixId || !message) {
            return res.status(400).json({ error: 'Missing required parameters: matrixId and message' });
        }
        // Initialize if not already done
        await matrix_1.matrixService.initialize();
        const eventId = await matrix_1.matrixService.sendNotification(matrixId, message, htmlMessage);
        res.json({
            success: true,
            eventId
        });
    }
    catch (error) {
        console.error('Error sending Matrix notification:', error);
        res.status(500).json({
            error: 'Failed to send Matrix notification',
            message: error.message
        });
    }
});
router.post('/matrix/verify', async (req, res) => {
    try {
        const { matrixId } = req.body;
        if (!matrixId) {
            return res.status(400).json({ error: 'Missing required parameter: matrixId' });
        }
        // Initialize if not already done
        await matrix_1.matrixService.initialize();
        const isValid = await matrix_1.matrixService.verifyMatrixId(matrixId);
        res.json({
            matrixId,
            isValid
        });
    }
    catch (error) {
        console.error('Error verifying Matrix ID:', error);
        res.status(500).json({
            error: 'Failed to verify Matrix ID',
            message: error.message
        });
    }
});
exports.default = router;
