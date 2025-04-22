"use strict";
/**
 * AetherCore Routes
 * Defines API routes for AetherCore services
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const AetherCoreBridgeService_1 = require("../services/aethercore/bridge/AetherCoreBridgeService");
const AetherBrainShardingService_1 = require("../services/aethercore/sharding/AetherBrainShardingService");
const types_1 = require("@shared/aethercore/types");
const router = express_1.default.Router();
// Schema for creating a bridge transaction
const createBridgeSchema = zod_1.z.object({
    sourceAddress: zod_1.z.string().min(1),
    destinationAddress: zod_1.z.string().min(1),
    amount: zod_1.z.string().min(1),
    direction: zod_1.z.nativeEnum(types_1.BridgeDirection)
});
// Schema for creating a brain shard
const createBrainShardSchema = zod_1.z.object({
    modelType: zod_1.z.string(),
    modelParameters: zod_1.z.record(zod_1.z.any()),
    shardsCount: zod_1.z.number().optional().default(12)
});
// Initialize services
const bridgeService = (0, AetherCoreBridgeService_1.getAetherCoreBridgeService)();
const brainShardingService = (0, AetherBrainShardingService_1.getAetherBrainShardingService)();
// Ensure services are initialized
(async () => {
    try {
        await bridgeService.initialize();
        console.log('AetherCore Bridge Service initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize AetherCore Bridge Service:', error);
    }
})();
// -------------------- BRIDGE ROUTES --------------------
// Create a new token bridge transaction
router.post('/bridge/transactions', auth_1.requireAuth, async (req, res) => {
    try {
        const validatedData = createBridgeSchema.parse(req.body);
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const transaction = await bridgeService.createBridgeTransaction(req.user.id, validatedData.sourceAddress, validatedData.destinationAddress, validatedData.amount, validatedData.direction);
        res.status(201).json(transaction);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid transaction data', details: error.errors });
        }
        console.error('Failed to create bridge transaction:', error);
        res.status(500).json({ error: 'Failed to create bridge transaction' });
    }
});
// Get a bridge transaction by ID
router.get('/bridge/transactions/:txId', auth_1.requireAuth, async (req, res) => {
    try {
        const { txId } = req.params;
        const transaction = await bridgeService.getBridgeTransaction(txId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json(transaction);
    }
    catch (error) {
        console.error('Failed to get bridge transaction:', error);
        res.status(500).json({ error: 'Failed to get bridge transaction' });
    }
});
// Get all bridge transactions for the authenticated user
router.get('/bridge/transactions', auth_1.requireAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const transactions = await bridgeService.getUserBridgeTransactions(req.user.id);
        res.json(transactions);
    }
    catch (error) {
        console.error('Failed to get bridge transactions:', error);
        res.status(500).json({ error: 'Failed to get bridge transactions' });
    }
});
// Get bridge configuration
router.get('/bridge/config/:sourceNetwork/:destinationNetwork', async (req, res) => {
    try {
        const { sourceNetwork, destinationNetwork } = req.params;
        // Validate network types
        if (!Object.values(types_1.BlockchainNetworkType).includes(sourceNetwork)) {
            return res.status(400).json({ error: 'Invalid source network' });
        }
        if (!Object.values(types_1.BlockchainNetworkType).includes(destinationNetwork)) {
            return res.status(400).json({ error: 'Invalid destination network' });
        }
        const config = await bridgeService.getBridgeConfig(sourceNetwork, destinationNetwork);
        res.json(config);
    }
    catch (error) {
        console.error('Failed to get bridge configuration:', error);
        res.status(500).json({ error: 'Failed to get bridge configuration' });
    }
});
// Calculate bridge fee
router.post('/bridge/calculate-fee', async (req, res) => {
    try {
        const { amount, direction } = req.body;
        if (!amount || !direction) {
            return res.status(400).json({ error: 'Amount and direction are required' });
        }
        // Validate direction
        if (!Object.values(types_1.BridgeDirection).includes(direction)) {
            return res.status(400).json({ error: 'Invalid direction' });
        }
        const fee = await bridgeService.calculateBridgeFee(amount, direction);
        res.json({ amount, fee });
    }
    catch (error) {
        console.error('Failed to calculate bridge fee:', error);
        res.status(500).json({ error: 'Failed to calculate bridge fee' });
    }
});
// Verify a bridge transaction on the source blockchain
router.post('/bridge/verify/:txId', auth_1.requireAuth, async (req, res) => {
    try {
        const { txId } = req.params;
        const verified = await bridgeService.verifySourceTransaction(txId);
        if (verified) {
            // Update the transaction status to CONFIRMED_SOURCE
            await bridgeService.updateBridgeTransactionStatus(txId, types_1.TokenBridgeStatus.CONFIRMED_SOURCE);
        }
        res.json({ txId, verified });
    }
    catch (error) {
        console.error('Failed to verify bridge transaction:', error);
        res.status(500).json({ error: 'Failed to verify bridge transaction' });
    }
});
// Complete a bridge transaction
router.post('/bridge/complete/:txId', auth_1.requireAuth, async (req, res) => {
    try {
        const { txId } = req.params;
        const transaction = await bridgeService.completeBridgeTransaction(txId);
        res.json(transaction);
    }
    catch (error) {
        console.error('Failed to complete bridge transaction:', error);
        res.status(500).json({ error: 'Failed to complete bridge transaction' });
    }
});
// Revert a bridge transaction
router.post('/bridge/revert/:txId', auth_1.requireAuth, async (req, res) => {
    try {
        const { txId } = req.params;
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ error: 'Reason is required' });
        }
        const transaction = await bridgeService.revertBridgeTransaction(txId, reason);
        res.json(transaction);
    }
    catch (error) {
        console.error('Failed to revert bridge transaction:', error);
        res.status(500).json({ error: 'Failed to revert bridge transaction' });
    }
});
// -------------------- BRAIN SHARDING ROUTES --------------------
// Shard and store a neural network model
router.post('/brain/shard', auth_1.requireAuth, async (req, res) => {
    try {
        const validatedData = createBrainShardSchema.parse(req.body);
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const brainRecord = await brainShardingService.shardNeuralNetwork(validatedData.modelType, validatedData.modelParameters, validatedData.shardsCount, req.user.id);
        res.status(201).json(brainRecord);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid brain data', details: error.errors });
        }
        console.error('Failed to shard neural network:', error);
        res.status(500).json({ error: 'Failed to shard neural network' });
    }
});
// Retrieve a neural network model
router.get('/brain/:brainId', auth_1.requireAuth, async (req, res) => {
    try {
        const { brainId } = req.params;
        const modelParameters = await brainShardingService.retrieveNeuralNetwork(brainId);
        res.json(modelParameters);
    }
    catch (error) {
        console.error('Failed to retrieve neural network:', error);
        res.status(500).json({ error: 'Failed to retrieve neural network' });
    }
});
// Get all brain records for the authenticated user
router.get('/brain', auth_1.requireAuth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        const brainRecords = await brainShardingService.getUserBrainRecords(req.user.id);
        res.json(brainRecords);
    }
    catch (error) {
        console.error('Failed to get brain records:', error);
        res.status(500).json({ error: 'Failed to get brain records' });
    }
});
// Get detailed information about a brain's shards
router.get('/brain/:brainId/shards', auth_1.requireAuth, async (req, res) => {
    try {
        const { brainId } = req.params;
        const shards = await brainShardingService.getBrainShards(brainId);
        res.json(shards);
    }
    catch (error) {
        console.error('Failed to get brain shards:', error);
        res.status(500).json({ error: 'Failed to get brain shards' });
    }
});
// Check the health of a brain's shards
router.get('/brain/:brainId/health', auth_1.requireAuth, async (req, res) => {
    try {
        const { brainId } = req.params;
        const healthStatus = await brainShardingService.checkBrainHealth(brainId);
        res.json(healthStatus);
    }
    catch (error) {
        console.error('Failed to check brain health:', error);
        res.status(500).json({ error: 'Failed to check brain health' });
    }
});
// Repair a brain's shards
router.post('/brain/:brainId/repair', auth_1.requireAuth, async (req, res) => {
    try {
        const { brainId } = req.params;
        const repaired = await brainShardingService.repairBrainShards(brainId);
        res.json({ brainId, repaired });
    }
    catch (error) {
        console.error('Failed to repair brain shards:', error);
        res.status(500).json({ error: 'Failed to repair brain shards' });
    }
});
// Delete a brain
router.delete('/brain/:brainId', auth_1.requireAuth, async (req, res) => {
    try {
        const { brainId } = req.params;
        const deleted = await brainShardingService.deleteBrain(brainId);
        res.json({ brainId, deleted });
    }
    catch (error) {
        console.error('Failed to delete brain:', error);
        res.status(500).json({ error: 'Failed to delete brain' });
    }
});
exports.default = router;
