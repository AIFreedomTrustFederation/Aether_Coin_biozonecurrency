/**
 * Computational Rewards API Routes
 * Handles all API endpoints for the computational rewards system
 */

import express from 'express';
import { storage } from '../storage';
import { insertComputationContributionSchema, insertRewardDistributionSchema } from '../../shared/schema';
import { z } from 'zod';

const router = express.Router();

// Contribution Routes

// List contributions with optional filtering
router.get('/contributions', async (req, res) => {
  try {
    const userId = req.query.userId as string | undefined;
    const nodeId = req.query.nodeId as string | undefined;
    
    const contributions = await storage.listComputationContributions(userId, nodeId);
    res.json(contributions);
  } catch (error) {
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
    
    const contribution = await storage.getComputationContribution(id);
    
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }
    
    res.json(contribution);
  } catch (error) {
    console.error(`Error fetching contribution ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch contribution' });
  }
});

// Register a new contribution
router.post('/contributions', async (req, res) => {
  try {
    const result = insertComputationContributionSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }
    
    const contribution = await storage.createComputationContribution(result.data);
    res.status(201).json(contribution);
  } catch (error) {
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
    const updateSchema = z.object({
      endTime: z.date().optional(),
      resourceAmount: z.number().positive().optional(),
      quality: z.number().min(0).max(1).optional()
    });
    
    const result = updateSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }
    
    const { endTime, resourceAmount, quality } = result.data;
    
    if (!endTime && !resourceAmount && quality === undefined) {
      return res.status(400).json({ error: 'At least one field must be updated' });
    }
    
    const updatedContribution = await storage.updateComputationContribution(
      id,
      endTime || new Date(),
      resourceAmount || 0,
      quality !== undefined ? quality : 1.0
    );
    
    if (!updatedContribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }
    
    res.json(updatedContribution);
  } catch (error) {
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
    const verificationSchema = z.object({
      verified: z.boolean(),
      verificationMethod: z.string()
    });
    
    const result = verificationSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }
    
    const { verified, verificationMethod } = result.data;
    
    const updatedContribution = await storage.verifyComputationContribution(
      id,
      verified,
      verificationMethod
    );
    
    if (!updatedContribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }
    
    res.json(updatedContribution);
  } catch (error) {
    console.error(`Error verifying contribution ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to verify contribution' });
  }
});

// Reward Distribution Routes

// List reward distributions for a contribution
router.get('/distributions', async (req, res) => {
  try {
    const contributionId = req.query.contributionId ? parseInt(req.query.contributionId as string) : undefined;
    
    if (contributionId !== undefined && isNaN(contributionId)) {
      return res.status(400).json({ error: 'Invalid contribution ID' });
    }
    
    const distributions = await storage.listRewardDistributions(contributionId);
    res.json(distributions);
  } catch (error) {
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
    
    const distribution = await storage.getRewardDistribution(id);
    
    if (!distribution) {
      return res.status(404).json({ error: 'Reward distribution not found' });
    }
    
    res.json(distribution);
  } catch (error) {
    console.error(`Error fetching reward distribution ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch reward distribution' });
  }
});

// Distribute FractalCoin rewards
router.post('/distributions/fractal-coin', async (req, res) => {
  try {
    // Validate distribution fields
    const distributionSchema = z.object({
      contributionId: z.number().int().positive(),
      fractalCoinAmount: z.number().positive(),
      aiCoinAmount: z.number().min(0),
      computeCredits: z.number().int().min(0)
    });
    
    const result = distributionSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }
    
    // Check if contribution exists
    const contribution = await storage.getComputationContribution(result.data.contributionId);
    
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }
    
    const distribution = await storage.createRewardDistribution(result.data);
    res.status(201).json(distribution);
  } catch (error) {
    console.error('Error distributing FractalCoin rewards:', error);
    res.status(500).json({ error: 'Failed to distribute FractalCoin rewards' });
  }
});

// Distribute AICoin rewards
router.post('/distributions/ai-coin', async (req, res) => {
  try {
    // Validate distribution fields
    const distributionSchema = z.object({
      contributionId: z.number().int().positive(),
      fractalCoinAmount: z.number().min(0),
      aiCoinAmount: z.number().positive(),
      computeCredits: z.number().int().min(0)
    });
    
    const result = distributionSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }
    
    // Check if contribution exists
    const contribution = await storage.getComputationContribution(result.data.contributionId);
    
    if (!contribution) {
      return res.status(404).json({ error: 'Contribution not found' });
    }
    
    const distribution = await storage.createRewardDistribution(result.data);
    res.status(201).json(distribution);
  } catch (error) {
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
    const statusSchema = z.object({
      status: z.enum(['pending', 'processed', 'failed']),
      transactionHash: z.string().optional()
    });
    
    const result = statusSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }
    
    const { status, transactionHash } = result.data;
    
    const updatedDistribution = await storage.updateRewardDistributionStatus(
      id,
      status,
      transactionHash
    );
    
    if (!updatedDistribution) {
      return res.status(404).json({ error: 'Reward distribution not found' });
    }
    
    res.json(updatedDistribution);
  } catch (error) {
    console.error(`Error updating distribution ${req.params.id} status:`, error);
    res.status(500).json({ error: 'Failed to update distribution status' });
  }
});

// Reward Calculation Routes

// Calculate reward for a contribution
router.post('/calculate', async (req, res) => {
  try {
    // Validate calculation parameters
    const calcSchema = z.object({
      contributionType: z.string(),
      resourceAmount: z.number().positive(),
      quality: z.number().min(0).max(1),
      duration: z.number().int().positive()
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
    const rateMap: {[key: string]: {fractal: number, ai: number, credits: number}} = {
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
  } catch (error) {
    console.error('Error calculating reward:', error);
    res.status(500).json({ error: 'Failed to calculate reward' });
  }
});

// Estimate reward for resource contribution
router.get('/estimate', async (req, res) => {
  try {
    const resourceType = req.query.resourceType as string;
    const amount = parseFloat(req.query.amount as string);
    const duration = parseInt(req.query.duration as string);
    
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
    const rateMap: {[key: string]: {fractal: number, ai: number, credits: number}} = {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    console.error('Error updating incentive rates:', error);
    res.status(500).json({ error: 'Failed to update incentive rates' });
  }
});

export default router;