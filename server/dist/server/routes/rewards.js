"use strict";
/**
 * Computational Rewards API Routes
 * Handles all API endpoints for the computational rewards system
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storage_1 = require("../storage");
const schema_1 = require("../../shared/schema");
const zod_1 = require("zod");
const router = express_1.default.Router();
// Contribution Routes
// List contributions with optional filtering
router.get('/contributions', async (req, res) => {
    try {
        const userId = req.query.userId;
        const nodeId = req.query.nodeId;
        const contributions = await storage_1.storage.listComputationContributions(userId, nodeId);
        res.json(contributions);
    }
    catch (error) {
        console.error('Error fetching contributions:', error);
        res.status(500).json({ error: 'Failed to fetch contributions' });
    }
});
// Get a specific contribution
router.get('/contributions/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid contribution ID' });
        }
        const contribution = await storage_1.storage.getComputationContribution(id);
        if (!contribution) {
            return res.status(404).json({ error: 'Contribution not found' });
        }
        res.json(contribution);
    }
    catch (error) {
        console.error(`Error fetching contribution ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch contribution' });
    }
});
// Register a new contribution
router.post('/contributions', async (req, res) => {
    try {
        const result = schema_1.insertComputationContributionSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const contribution = await storage_1.storage.createComputationContribution(result.data);
        res.status(201).json(contribution);
    }
    catch (error) {
        console.error('Error registering contribution:', error);
        res.status(500).json({ error: 'Failed to register contribution' });
    }
});
// Update a contribution
router.patch('/contributions/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid contribution ID' });
        }
        // Validate update fields
        const updateSchema = zod_1.z.object({
            endTime: zod_1.z.date().optional(),
            resourceAmount: zod_1.z.number().positive().optional(),
            quality: zod_1.z.number().min(0).max(1).optional()
        });
        const result = updateSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const { endTime, resourceAmount, quality } = result.data;
        if (!endTime && !resourceAmount && quality === undefined) {
            return res.status(400).json({ error: 'At least one field must be updated' });
        }
        const updatedContribution = await storage_1.storage.updateComputationContribution(id, endTime || new Date(), resourceAmount || 0, quality !== undefined ? quality : 1.0);
        if (!updatedContribution) {
            return res.status(404).json({ error: 'Contribution not found' });
        }
        res.json(updatedContribution);
    }
    catch (error) {
        console.error(`Error updating contribution ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to update contribution' });
    }
});
// Verify a contribution
router.post('/contributions/:id/verify', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid contribution ID' });
        }
        // Validate verification fields
        const verificationSchema = zod_1.z.object({
            verified: zod_1.z.boolean(),
            verificationMethod: zod_1.z.string()
        });
        const result = verificationSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const { verified, verificationMethod } = result.data;
        const updatedContribution = await storage_1.storage.verifyComputationContribution(id, verified, verificationMethod);
        if (!updatedContribution) {
            return res.status(404).json({ error: 'Contribution not found' });
        }
        res.json(updatedContribution);
    }
    catch (error) {
        console.error(`Error verifying contribution ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to verify contribution' });
    }
});
// Reward Distribution Routes
// List reward distributions for a contribution
router.get('/distributions', async (req, res) => {
    try {
        const contributionId = req.query.contributionId ? parseInt(req.query.contributionId) : undefined;
        if (contributionId !== undefined && isNaN(contributionId)) {
            return res.status(400).json({ error: 'Invalid contribution ID' });
        }
        const distributions = await storage_1.storage.listRewardDistributions(contributionId);
        res.json(distributions);
    }
    catch (error) {
        console.error('Error fetching reward distributions:', error);
        res.status(500).json({ error: 'Failed to fetch reward distributions' });
    }
});
// Get a specific reward distribution
router.get('/distributions/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid distribution ID' });
        }
        const distribution = await storage_1.storage.getRewardDistribution(id);
        if (!distribution) {
            return res.status(404).json({ error: 'Reward distribution not found' });
        }
        res.json(distribution);
    }
    catch (error) {
        console.error(`Error fetching reward distribution ${req.params.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch reward distribution' });
    }
});
// Distribute FractalCoin rewards
router.post('/distributions/fractal-coin', async (req, res) => {
    try {
        // Validate distribution fields
        const distributionSchema = zod_1.z.object({
            contributionId: zod_1.z.number().int().positive(),
            fractalCoinAmount: zod_1.z.number().positive(),
            aiCoinAmount: zod_1.z.number().min(0),
            computeCredits: zod_1.z.number().int().min(0)
        });
        const result = distributionSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        // Check if contribution exists
        const contribution = await storage_1.storage.getComputationContribution(result.data.contributionId);
        if (!contribution) {
            return res.status(404).json({ error: 'Contribution not found' });
        }
        const distribution = await storage_1.storage.createRewardDistribution(result.data);
        res.status(201).json(distribution);
    }
    catch (error) {
        console.error('Error distributing FractalCoin rewards:', error);
        res.status(500).json({ error: 'Failed to distribute FractalCoin rewards' });
    }
});
// Distribute AICoin rewards
router.post('/distributions/ai-coin', async (req, res) => {
    try {
        // Validate distribution fields
        const distributionSchema = zod_1.z.object({
            contributionId: zod_1.z.number().int().positive(),
            fractalCoinAmount: zod_1.z.number().min(0),
            aiCoinAmount: zod_1.z.number().positive(),
            computeCredits: zod_1.z.number().int().min(0)
        });
        const result = distributionSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        // Check if contribution exists
        const contribution = await storage_1.storage.getComputationContribution(result.data.contributionId);
        if (!contribution) {
            return res.status(404).json({ error: 'Contribution not found' });
        }
        const distribution = await storage_1.storage.createRewardDistribution(result.data);
        res.status(201).json(distribution);
    }
    catch (error) {
        console.error('Error distributing AICoin rewards:', error);
        res.status(500).json({ error: 'Failed to distribute AICoin rewards' });
    }
});
// Update distribution status
router.patch('/distributions/:id/status', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid distribution ID' });
        }
        // Validate status update
        const statusSchema = zod_1.z.object({
            status: zod_1.z.enum(['pending', 'processed', 'failed']),
            transactionHash: zod_1.z.string().optional()
        });
        const result = statusSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const { status, transactionHash } = result.data;
        const updatedDistribution = await storage_1.storage.updateRewardDistributionStatus(id, status, transactionHash);
        if (!updatedDistribution) {
            return res.status(404).json({ error: 'Reward distribution not found' });
        }
        res.json(updatedDistribution);
    }
    catch (error) {
        console.error(`Error updating distribution ${req.params.id} status:`, error);
        res.status(500).json({ error: 'Failed to update distribution status' });
    }
});
// Reward Calculation Routes
// Calculate reward for a contribution
router.post('/calculate', async (req, res) => {
    try {
        // Validate calculation parameters
        const calcSchema = zod_1.z.object({
            contributionType: zod_1.z.string(),
            resourceAmount: zod_1.z.number().positive(),
            quality: zod_1.z.number().min(0).max(1),
            duration: zod_1.z.number().int().positive()
        });
        const result = calcSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.format() });
        }
        const { contributionType, resourceAmount, quality, duration } = result.data;
        // Calculate rewards based on contribution parameters
        // This is a simplified calculation - in a real implementation, this would be more complex
        let fractalCoin = 0;
        let aiCoin = 0;
        let computeCredits = 0;
        // Base reward rate for different contribution types
        const rateMap = {
            'cpu': { fractal: 0.01, ai: 0.05, credits: 1 },
            'gpu': { fractal: 0.05, ai: 0.2, credits: 2 },
            'storage': { fractal: 0.005, ai: 0.01, credits: 0.5 },
            'bandwidth': { fractal: 0.002, ai: 0.01, credits: 0.2 },
            'data': { fractal: 0.02, ai: 0.1, credits: 1 }
        };
        const rate = rateMap[contributionType] || { fractal: 0.01, ai: 0.01, credits: 1 };
        // Calculate rewards
        fractalCoin = rate.fractal * resourceAmount * quality * (duration / 3600); // Per hour
        aiCoin = rate.ai * resourceAmount * quality * (duration / 3600); // Per hour
        computeCredits = Math.floor(rate.credits * resourceAmount * quality * (duration / 3600)); // Per hour
        res.json({
            fractalCoin,
            aiCoin,
            computeCredits
        });
    }
    catch (error) {
        console.error('Error calculating reward:', error);
        res.status(500).json({ error: 'Failed to calculate reward' });
    }
});
// Estimate reward for resource contribution
router.get('/estimate', async (req, res) => {
    try {
        const resourceType = req.query.resourceType;
        const amount = parseFloat(req.query.amount);
        const duration = parseInt(req.query.duration);
        if (!resourceType) {
            return res.status(400).json({ error: 'Resource type is required' });
        }
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid resource amount' });
        }
        if (isNaN(duration) || duration <= 0) {
            return res.status(400).json({ error: 'Invalid duration' });
        }
        // Similar calculation as in /calculate but with default quality of 1.0
        const quality = 1.0;
        // Base reward rate for different contribution types
        const rateMap = {
            'cpu': { fractal: 0.01, ai: 0.05, credits: 1 },
            'gpu': { fractal: 0.05, ai: 0.2, credits: 2 },
            'storage': { fractal: 0.005, ai: 0.01, credits: 0.5 },
            'bandwidth': { fractal: 0.002, ai: 0.01, credits: 0.2 },
            'data': { fractal: 0.02, ai: 0.1, credits: 1 }
        };
        const rate = rateMap[resourceType] || { fractal: 0.01, ai: 0.01, credits: 1 };
        // Calculate rewards
        const fractalCoin = rate.fractal * amount * quality * (duration / 3600); // Per hour
        const aiCoin = rate.ai * amount * quality * (duration / 3600); // Per hour
        const computeCredits = Math.floor(rate.credits * amount * quality * (duration / 3600)); // Per hour
        res.json({
            fractalCoin,
            aiCoin,
            computeCredits
        });
    }
    catch (error) {
        console.error('Error estimating reward:', error);
        res.status(500).json({ error: 'Failed to estimate reward' });
    }
});
// Incentive Management Routes
// Get current incentive rates
router.get('/incentives/rates', (req, res) => {
    try {
        // This would be fetched from a database or configuration in a real implementation
        res.json({
            'cpu': { fractalCoin: 0.01, aiCoin: 0.05, computeCredits: 1 },
            'gpu': { fractalCoin: 0.05, aiCoin: 0.2, computeCredits: 2 },
            'storage': { fractalCoin: 0.005, aiCoin: 0.01, computeCredits: 0.5 },
            'bandwidth': { fractalCoin: 0.002, aiCoin: 0.01, computeCredits: 0.2 },
            'data': { fractalCoin: 0.02, aiCoin: 0.1, computeCredits: 1 }
        });
    }
    catch (error) {
        console.error('Error fetching incentive rates:', error);
        res.status(500).json({ error: 'Failed to fetch incentive rates' });
    }
});
// Get incentivized resource types
router.get('/incentives/resource-types', (req, res) => {
    try {
        // This would be fetched from a database or configuration in a real implementation
        res.json([
            'cpu',
            'gpu',
            'storage',
            'bandwidth',
            'data'
        ]);
    }
    catch (error) {
        console.error('Error fetching incentivized resource types:', error);
        res.status(500).json({ error: 'Failed to fetch incentivized resource types' });
    }
});
// Update incentive rates
router.put('/incentives/rates', (req, res) => {
    try {
        const rates = req.body;
        // Validate the rates structure
        if (!rates || typeof rates !== 'object') {
            return res.status(400).json({ error: 'Invalid incentive rates format' });
        }
        // In a real implementation, this would update the rates in the database or configuration
        res.json({
            success: true,
            message: 'Incentive rates updated successfully',
            rates
        });
    }
    catch (error) {
        console.error('Error updating incentive rates:', error);
        res.status(500).json({ error: 'Failed to update incentive rates' });
    }
});
exports.default = router;
