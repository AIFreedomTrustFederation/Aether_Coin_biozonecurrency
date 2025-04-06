/**
 * Escrow API Routes
 *
 * Implements the API endpoints for escrow transactions, proofs, and disputes.
 */

import { Router } from 'express';
import { db } from '../storage';
import { z } from 'zod';
import {
  escrowTransactions,
  escrowProofs,
  escrowDisputes,
  insertEscrowTransactionSchema,
  insertEscrowProofSchema,
  insertEscrowDisputeSchema,
} from '@shared/schema';
import { eq, and, or, desc } from 'drizzle-orm';
import { escrowService } from '../services/escrow-service';
import { mysterionEthics } from '../services/mysterion-ethics';

// Create router
const router = Router();

// Create escrow transaction
router.post('/escrow', async (req, res) => {
  try {
    // Validate request body
    const createEscrowSchema = z.object({
      sellerId: z.number(),
      amount: z.string().min(1),
      tokenSymbol: z.string().min(1),
      description: z.string().min(5),
      chain: z.string().min(1),
      expiresInDays: z.number().optional(),
    });
    
    const body = createEscrowSchema.parse(req.body);
    
    // Get current user id (normally from auth)
    // For demo, we'll use a fixed buyer ID
    const buyerId = 1; // This would normally come from auth
    
    // Check if the buyer is trying to create escrow with themselves
    if (buyerId === body.sellerId) {
      return res.status(400).json({
        error: 'You cannot create an escrow transaction with yourself',
      });
    }
    
    // Check if the user has passed ethics check 
    // (in a real app, this would use actual user IDs)
    const ethicsCheck = await mysterionEthics.assessEthics({
      transactionId: 0, // No transaction ID yet
      actorId: buyerId,
      action: 'create_escrow',
      context: {
        sellerId: body.sellerId,
        amount: body.amount,
      },
    });
    
    if (!ethicsCheck) {
      return res.status(403).json({
        error: 'Transaction blocked by Mysterion ethics assessment',
      });
    }
    
    // Create escrow transaction
    const escrow = await escrowService.createEscrow({
      buyerId,
      sellerId: body.sellerId,
      amount: body.amount,
      tokenSymbol: body.tokenSymbol,
      description: body.description,
      chain: body.chain,
      expiresInDays: body.expiresInDays,
    });
    
    if (!escrow) {
      return res.status(500).json({
        error: 'Failed to create escrow transaction',
      });
    }
    
    res.status(201).json(escrow);
  } catch (error) {
    console.error('Error creating escrow transaction:', error);
    res.status(400).json({ 
      error: error instanceof z.ZodError 
        ? error.errors 
        : 'Invalid request data' 
    });
  }
});

// Get all escrow transactions (admin only)
router.get('/escrow', async (req, res) => {
  try {
    const transactions = await db.query.escrowTransactions.findMany({
      with: {
        buyer: true,
        seller: true,
      },
      orderBy: (fields, { desc }) => [desc(fields.createdAt)],
    });
    
    res.json(transactions);
  } catch (error) {
    console.error('Error getting escrow transactions:', error);
    res.status(500).json({ error: 'Failed to retrieve escrow transactions' });
  }
});

// Get user's escrow transactions
router.get('/escrow/user', async (req, res) => {
  try {
    // Get current user id (normally from auth)
    const userId = 1; // This would normally come from auth
    
    const transactions = await escrowService.getUserTransactions(userId);
    
    res.json(transactions);
  } catch (error) {
    console.error('Error getting user escrow transactions:', error);
    res.status(500).json({ error: 'Failed to retrieve user escrow transactions' });
  }
});

// Get single escrow transaction
router.get('/escrow/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const transaction = await db.query.escrowTransactions.findFirst({
      where: eq(escrowTransactions.id, id),
      with: {
        buyer: true,
        seller: true,
      },
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Escrow transaction not found' });
    }
    
    // Get current user id (normally from auth)
    const userId = 1; // This would normally come from auth
    
    // Check if user is buyer or seller
    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error getting escrow transaction:', error);
    res.status(500).json({ error: 'Failed to retrieve escrow transaction' });
  }
});

// Fund escrow transaction
router.post('/escrow/:id/fund', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Validate request body
    const fundEscrowSchema = z.object({
      transactionHash: z.string().min(1),
    });
    
    const body = fundEscrowSchema.parse(req.body);
    
    // Get current user id (normally from auth)
    const userId = 1; // This would normally come from auth
    
    // Get the transaction
    const transaction = await db.query.escrowTransactions.findFirst({
      where: eq(escrowTransactions.id, id),
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Escrow transaction not found' });
    }
    
    // Check if user is buyer
    if (transaction.buyerId !== userId) {
      return res.status(403).json({ error: 'Only the buyer can fund the escrow' });
    }
    
    // Fund the escrow
    const updatedEscrow = await escrowService.fundEscrow(id, body.transactionHash);
    
    if (!updatedEscrow) {
      return res.status(500).json({ error: 'Failed to fund escrow transaction' });
    }
    
    res.json(updatedEscrow);
  } catch (error) {
    console.error('Error funding escrow transaction:', error);
    res.status(400).json({ 
      error: error instanceof z.ZodError 
        ? error.errors 
        : 'Invalid request data' 
    });
  }
});

// Start processing escrow transaction (seller acknowledges)
router.post('/escrow/:id/start', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get current user id (normally from auth)
    const userId = 1; // This would normally come from auth
    
    // Get the transaction
    const transaction = await db.query.escrowTransactions.findFirst({
      where: eq(escrowTransactions.id, id),
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Escrow transaction not found' });
    }
    
    // Check if user is seller
    if (transaction.sellerId !== userId) {
      return res.status(403).json({ error: 'Only the seller can start processing the escrow' });
    }
    
    // Start the transaction
    const updatedEscrow = await escrowService.startTransaction(id, userId);
    
    if (!updatedEscrow) {
      return res.status(500).json({ error: 'Failed to start escrow transaction' });
    }
    
    res.json(updatedEscrow);
  } catch (error) {
    console.error('Error starting escrow transaction:', error);
    res.status(500).json({ error: 'Failed to start escrow transaction' });
  }
});

// Complete escrow transaction (buyer confirms receipt)
router.post('/escrow/:id/complete', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get current user id (normally from auth)
    const userId = 1; // This would normally come from auth
    
    // Get the transaction
    const transaction = await db.query.escrowTransactions.findFirst({
      where: eq(escrowTransactions.id, id),
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Escrow transaction not found' });
    }
    
    // Check if user is buyer
    if (transaction.buyerId !== userId) {
      return res.status(403).json({ error: 'Only the buyer can complete the escrow' });
    }
    
    // Complete the transaction
    const updatedEscrow = await escrowService.completeTransaction(id, userId);
    
    if (!updatedEscrow) {
      return res.status(500).json({ error: 'Failed to complete escrow transaction' });
    }
    
    res.json(updatedEscrow);
  } catch (error) {
    console.error('Error completing escrow transaction:', error);
    res.status(500).json({ error: 'Failed to complete escrow transaction' });
  }
});

// Add proof to escrow transaction
router.post('/escrow/:id/proof', async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id);
    
    // Validate request body
    const addProofSchema = z.object({
      proofType: z.string().min(1),
      description: z.string().min(1),
      fileUrl: z.string().min(1),
      fileCid: z.string().optional().default(''),
    });
    
    const body = addProofSchema.parse(req.body);
    
    // Get current user id (normally from auth)
    const userId = 1; // This would normally come from auth
    
    // Add the proof
    const proof = await escrowService.addProof({
      escrowTransactionId: escrowId,
      userId,
      proofType: body.proofType,
      description: body.description,
      fileUrl: body.fileUrl,
      fileCid: body.fileCid,
    });
    
    if (!proof) {
      return res.status(500).json({ error: 'Failed to add proof' });
    }
    
    res.status(201).json(proof);
  } catch (error) {
    console.error('Error adding proof:', error);
    res.status(400).json({ 
      error: error instanceof z.ZodError 
        ? error.errors 
        : 'Invalid request data' 
    });
  }
});

// Get proofs for an escrow transaction
router.get('/escrow/:id/proofs', async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id);
    
    // Get current user id (normally from auth)
    const userId = 1; // This would normally come from auth
    
    // Get the transaction
    const transaction = await db.query.escrowTransactions.findFirst({
      where: eq(escrowTransactions.id, escrowId),
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Escrow transaction not found' });
    }
    
    // Check if user is buyer or seller
    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Get proofs
    const proofs = await escrowService.getProofs(escrowId);
    
    res.json(proofs);
  } catch (error) {
    console.error('Error getting proofs:', error);
    res.status(500).json({ error: 'Failed to retrieve proofs' });
  }
});

// Create dispute for escrow transaction
router.post('/escrow/:id/dispute', async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id);
    
    // Validate request body
    const createDisputeSchema = z.object({
      reason: z.string().min(1),
      description: z.string().min(5),
    });
    
    const body = createDisputeSchema.parse(req.body);
    
    // Get current user id (normally from auth)
    const userId = 1; // This would normally come from auth
    
    // Create the dispute
    const dispute = await escrowService.createDispute({
      escrowTransactionId: escrowId,
      initiatorId: userId,
      reason: body.reason,
      description: body.description,
    });
    
    if (!dispute) {
      return res.status(500).json({ error: 'Failed to create dispute' });
    }
    
    // Process the dispute with Mysterion AI
    // This would typically be done asynchronously in a real application
    const assessment = await escrowService.processDispute(dispute.id);
    
    res.status(201).json({
      dispute,
      assessment: assessment?.mysterionAssessment || null,
    });
  } catch (error) {
    console.error('Error creating dispute:', error);
    res.status(400).json({ 
      error: error instanceof z.ZodError 
        ? error.errors 
        : 'Invalid request data' 
    });
  }
});

// Get Matrix room messages for an escrow transaction
router.get('/escrow/:id/messages', async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id);
    
    // Get current user id (normally from auth)
    const userId = 1; // This would normally come from auth
    
    // Get the transaction
    const transaction = await db.query.escrowTransactions.findFirst({
      where: eq(escrowTransactions.id, escrowId),
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Escrow transaction not found' });
    }
    
    // Check if user is buyer or seller
    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Get messages
    const { matrixCommunication } = require('../services/matrix-integration');
    const messages = await matrixCommunication.getMessagesForTransaction(escrowId);
    
    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// Reverse transaction using quantum fractal recursive AI
router.post('/escrow/:id/reverse', async (req, res) => {
  try {
    const escrowId = parseInt(req.params.id);
    
    // Validate request body
    const reverseTransactionSchema = z.object({
      reason: z.string().min(5),
    });
    
    const body = reverseTransactionSchema.parse(req.body);
    
    // Get current user id (normally from auth)
    const userId = 1; // This would normally come from auth
    
    // Get the transaction
    const transaction = await db.query.escrowTransactions.findFirst({
      where: eq(escrowTransactions.id, escrowId),
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Escrow transaction not found' });
    }
    
    // Check if user is buyer or seller
    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check if transaction is in a state that can be reversed
    if (!['completed', 'disputed'].includes(transaction.status)) {
      return res.status(400).json({ 
        error: 'Transaction cannot be reversed in its current state' 
      });
    }
    
    // Reverse the transaction
    const success = await mysterionEthics.reverseTransaction(
      escrowId,
      body.reason,
      userId
    );
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to reverse transaction' });
    }
    
    // Update transaction status
    const updatedTransaction = await db.update(escrowTransactions)
      .set({ 
        status: 'reversed',
        updatedAt: new Date(),
      })
      .where(eq(escrowTransactions.id, escrowId))
      .returning();
    
    res.json({
      success: true,
      transaction: updatedTransaction[0],
      message: 'Transaction successfully reversed through quantum fractal recursion',
    });
  } catch (error) {
    console.error('Error reversing transaction:', error);
    res.status(400).json({ 
      error: error instanceof z.ZodError 
        ? error.errors 
        : 'Failed to reverse transaction' 
    });
  }
});

export default router;