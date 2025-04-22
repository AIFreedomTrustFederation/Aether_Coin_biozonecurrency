"use strict";
/**
 * FractalCoin API Routes
 *
 * These routes serve as a proxy between the frontend and the FractalCoin API
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fractalcoin_api_1 = require("../services/fractalcoin-api");
const router = express_1.default.Router();
const fractalCoinAPI = (0, fractalcoin_api_1.getFractalCoinAPI)();
// Get account info
router.get('/account/info', async (req, res) => {
    try {
        const accountInfo = await fractalCoinAPI.getAccountInfo();
        res.json(accountInfo);
    }
    catch (error) {
        console.error('Error fetching account info:', error);
        res.status(500).json({
            error: 'Failed to fetch account information',
            message: error.message
        });
    }
});
// Get account balance
router.get('/account/balance', async (req, res) => {
    try {
        const balance = await fractalCoinAPI.getBalance();
        res.json(balance);
    }
    catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({
            error: 'Failed to fetch balance',
            message: error.message
        });
    }
});
// Get transactions
router.get('/account/transactions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const transactions = await fractalCoinAPI.getTransactions(page, limit);
        res.json(transactions);
    }
    catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            error: 'Failed to fetch transactions',
            message: error.message
        });
    }
});
// Transfer FractalCoin
router.post('/transactions/transfer', async (req, res) => {
    try {
        const { to, amount, memo } = req.body;
        if (!to || !amount) {
            return res.status(400).json({
                error: 'Missing required parameters',
                message: 'Recipient address and amount are required'
            });
        }
        const result = await fractalCoinAPI.transfer(to, amount, memo);
        res.json(result);
    }
    catch (error) {
        console.error('Error transferring FractalCoin:', error);
        res.status(500).json({
            error: 'Failed to transfer FractalCoin',
            message: error.message
        });
    }
});
// Get storage metrics
router.get('/storage/metrics', async (req, res) => {
    try {
        const metrics = await fractalCoinAPI.getStorageMetrics();
        res.json(metrics);
    }
    catch (error) {
        console.error('Error fetching storage metrics:', error);
        res.status(500).json({
            error: 'Failed to fetch storage metrics',
            message: error.message
        });
    }
});
// Allocate storage
router.post('/storage/allocate', async (req, res) => {
    try {
        const { bytes, purpose, redundancy, encryption } = req.body;
        if (!bytes || bytes <= 0) {
            return res.status(400).json({
                error: 'Invalid parameters',
                message: 'Bytes must be a positive number'
            });
        }
        const options = { purpose, redundancy, encryption };
        const result = await fractalCoinAPI.allocateStorage(bytes, options);
        res.json(result);
    }
    catch (error) {
        console.error('Error allocating storage:', error);
        res.status(500).json({
            error: 'Failed to allocate storage',
            message: error.message
        });
    }
});
// Create a bridge
router.post('/bridges/create', async (req, res) => {
    try {
        const { type, config } = req.body;
        if (!type || !config) {
            return res.status(400).json({
                error: 'Missing required parameters',
                message: 'Bridge type and configuration are required'
            });
        }
        const result = await fractalCoinAPI.registerBridge({ type, config });
        res.json(result);
    }
    catch (error) {
        console.error('Error creating bridge:', error);
        res.status(500).json({
            error: 'Failed to create bridge',
            message: error.message
        });
    }
});
exports.default = router;
