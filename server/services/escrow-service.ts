/**
 * Escrow Service
 * 
 * This service implements the escrow transaction system similar to eBay's model
 * for securely holding funds during transactions between buyers and sellers.
 * It integrates with Mysterion AI for dispute resolution and Matrix for communication.
 */

import { db } from '../storage';
import {
  escrowTransactions,
  escrowProofs,
  escrowDisputes,
  users,
  userReputation,
  matrixRooms,
  type EscrowTransaction,
  type EscrowProof,
  type EscrowDispute,
  type User
} from '@shared/schema';
import { eq, and, desc, or } from 'drizzle-orm';
import { matrixCommunication } from './matrix-integration';
import { mysterionEthics } from './mysterion-ethics';

// Types for escrow service
interface CreateEscrowParams {
  buyerId: number;
  sellerId: number;
  amount: string;
  tokenSymbol: string;
  description: string;
  chain: string;
  expiresInDays?: number;
  metadata?: any;
}

interface AddProofParams {
  escrowTransactionId: number;
  userId: number;
  proofType: string;
  description: string;
  fileUrl: string;
  fileCid: string;
}

interface CreateDisputeParams {
  escrowTransactionId: number;
  initiatorId: number;
  reason: string;
  description: string;
}

/**
 * Escrow Transaction Service
 * Manages secure escrow transactions between buyers and sellers
 */
export class EscrowService {
  /**
   * Create a new escrow transaction
   */
  async createEscrow(params: CreateEscrowParams): Promise<EscrowTransaction | null> {
    try {
      // Validate seller and buyer exist
      const [seller, buyer] = await Promise.all([
        db.query.users.findFirst({
          where: eq(users.id, params.sellerId),
        }),
        db.query.users.findFirst({
          where: eq(users.id, params.buyerId),
        })
      ]);
      
      if (!seller || !buyer) {
        throw new Error('Invalid buyer or seller');
      }
      
      // Calculate expiration date (default 14 days)
      const expiresInDays = params.expiresInDays || 14;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
      
      // Calculate escrow fee (0.5% of transaction)
      const amountNum = parseFloat(params.amount);
      const escrowFee = (amountNum * 0.005).toFixed(5);
      
      // Create the escrow transaction
      const escrow = await db.insert(escrowTransactions).values({
        sellerId: params.sellerId,
        buyerId: params.buyerId,
        amount: params.amount,
        tokenSymbol: params.tokenSymbol,
        description: params.description,
        status: 'created',
        expiresAt,
        chain: params.chain,
        escrowFee,
        metadata: params.metadata || {},
      }).returning();
      
      if (!escrow[0]) {
        throw new Error('Failed to create escrow transaction');
      }
      
      // Create Matrix room for communication between parties
      const room = await matrixCommunication.createTransactionRoom(escrow[0].id);
      
      if (room) {
        console.log(`Created Matrix room ${room.roomId} for escrow transaction ${escrow[0].id}`);
      }
      
      return escrow[0];
    } catch (error) {
      console.error('Failed to create escrow transaction:', error);
      return null;
    }
  }
  
  /**
   * Fund an escrow transaction
   */
  async fundEscrow(
    escrowTransactionId: number, 
    transactionHash: string
  ): Promise<EscrowTransaction | null> {
    try {
      // Get the escrow transaction
      const escrow = await db.query.escrowTransactions.findFirst({
        where: eq(escrowTransactions.id, escrowTransactionId),
      });
      
      if (!escrow) {
        throw new Error('Escrow transaction not found');
      }
      
      if (escrow.status !== 'created') {
        throw new Error('Escrow transaction cannot be funded in its current state');
      }
      
      // Update escrow status to funded
      const updated = await db.update(escrowTransactions)
        .set({
          status: 'funded',
          transactionHash,
        })
        .where(eq(escrowTransactions.id, escrowTransactionId))
        .returning();
      
      if (!updated[0]) {
        throw new Error('Failed to update escrow transaction');
      }
      
      // Notify the seller via Matrix that funds are in escrow
      const room = await db.query.matrixRooms.findFirst({
        where: eq(matrixRooms.escrowTransactionId, escrowTransactionId),
      });
      
      if (room) {
        await matrixCommunication.sendSystemMessage({
          roomId: room.roomId,
          userId: 0,
          content: `Escrow has been funded with ${escrow.amount} ${escrow.tokenSymbol}. Seller can now proceed with delivery.`,
          messageType: 'system',
        });
      }
      
      return updated[0];
    } catch (error) {
      console.error('Failed to fund escrow:', error);
      return null;
    }
  }
  
  /**
   * Add a proof to an escrow transaction (photo, delivery confirmation, etc.)
   */
  async addProof(params: AddProofParams): Promise<EscrowProof | null> {
    try {
      // Validate escrow transaction exists
      const escrow = await db.query.escrowTransactions.findFirst({
        where: eq(escrowTransactions.id, params.escrowTransactionId),
      });
      
      if (!escrow) {
        throw new Error('Escrow transaction not found');
      }
      
      // Validate user is involved in this transaction
      if (escrow.buyerId !== params.userId && escrow.sellerId !== params.userId) {
        throw new Error('User not authorized for this escrow transaction');
      }
      
      // Create the proof
      const proof = await db.insert(escrowProofs).values({
        escrowTransactionId: params.escrowTransactionId,
        userId: params.userId,
        proofType: params.proofType,
        description: params.description,
        fileUrl: params.fileUrl,
        fileCid: params.fileCid,
      }).returning();
      
      if (!proof[0]) {
        throw new Error('Failed to create proof');
      }
      
      // Notify via Matrix about the new proof
      const room = await db.query.matrixRooms.findFirst({
        where: eq(matrixRooms.escrowTransactionId, params.escrowTransactionId),
      });
      
      if (room) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, params.userId),
        });
        
        const userRole = escrow.sellerId === params.userId ? 'Seller' : 'Buyer';
        const username = user ? user.username : userRole;
        
        await matrixCommunication.sendSystemMessage({
          roomId: room.roomId,
          userId: 0,
          content: `${username} added a new ${params.proofType} proof: "${params.description}". View it at ${params.fileUrl}`,
          messageType: 'system',
          metadata: {
            proofId: proof[0].id,
            proofType: params.proofType,
            fileCid: params.fileCid,
          }
        });
      }
      
      return proof[0];
    } catch (error) {
      console.error('Failed to add proof:', error);
      return null;
    }
  }
  
  /**
   * Mark an escrow transaction as in progress (seller acknowledged)
   */
  async startTransaction(
    escrowTransactionId: number, 
    sellerId: number
  ): Promise<EscrowTransaction | null> {
    try {
      // Get the escrow transaction
      const escrow = await db.query.escrowTransactions.findFirst({
        where: and(
          eq(escrowTransactions.id, escrowTransactionId),
          eq(escrowTransactions.sellerId, sellerId)
        ),
      });
      
      if (!escrow) {
        throw new Error('Escrow transaction not found or unauthorized');
      }
      
      if (escrow.status !== 'funded') {
        throw new Error('Escrow transaction must be funded before starting');
      }
      
      // Update escrow status to in_progress
      const updated = await db.update(escrowTransactions)
        .set({ status: 'in_progress' })
        .where(eq(escrowTransactions.id, escrowTransactionId))
        .returning();
      
      if (!updated[0]) {
        throw new Error('Failed to update escrow transaction');
      }
      
      // Notify via Matrix
      const room = await db.query.matrixRooms.findFirst({
        where: eq(matrixRooms.escrowTransactionId, escrowTransactionId),
      });
      
      if (room) {
        await matrixCommunication.sendSystemMessage({
          roomId: room.roomId,
          userId: 0,
          content: 'Seller has acknowledged the transaction and is now processing the order.',
          messageType: 'system',
        });
      }
      
      return updated[0];
    } catch (error) {
      console.error('Failed to start transaction:', error);
      return null;
    }
  }
  
  /**
   * Complete an escrow transaction (buyer confirms receipt)
   */
  async completeTransaction(
    escrowTransactionId: number, 
    buyerId: number
  ): Promise<EscrowTransaction | null> {
    try {
      // Get the escrow transaction
      const escrow = await db.query.escrowTransactions.findFirst({
        where: and(
          eq(escrowTransactions.id, escrowTransactionId),
          eq(escrowTransactions.buyerId, buyerId)
        ),
      });
      
      if (!escrow) {
        throw new Error('Escrow transaction not found or unauthorized');
      }
      
      if (escrow.status !== 'in_progress') {
        throw new Error('Escrow transaction must be in progress before completing');
      }
      
      // Update escrow status to completed
      const updated = await db.update(escrowTransactions)
        .set({ 
          status: 'completed',
          completedAt: new Date(),
        })
        .where(eq(escrowTransactions.id, escrowTransactionId))
        .returning();
      
      if (!updated[0]) {
        throw new Error('Failed to update escrow transaction');
      }
      
      // Notify via Matrix
      const room = await db.query.matrixRooms.findFirst({
        where: eq(matrixRooms.escrowTransactionId, escrowTransactionId),
      });
      
      if (room) {
        await matrixCommunication.sendSystemMessage({
          roomId: room.roomId,
          userId: 0,
          content: 'Buyer has confirmed receipt. Transaction completed successfully!',
          messageType: 'system',
        });
        
        // Archive the room after completion
        await matrixCommunication.archiveRoom(escrowTransactionId);
      }
      
      // Update reputation for both parties
      await mysterionEthics.updateUserReputation(escrow.buyerId);
      await mysterionEthics.updateUserReputation(escrow.sellerId);
      
      return updated[0];
    } catch (error) {
      console.error('Failed to complete transaction:', error);
      return null;
    }
  }
  
  /**
   * Create a dispute for an escrow transaction
   */
  async createDispute(params: CreateDisputeParams): Promise<EscrowDispute | null> {
    try {
      // Get the escrow transaction
      const escrow = await db.query.escrowTransactions.findFirst({
        where: eq(escrowTransactions.id, params.escrowTransactionId),
      });
      
      if (!escrow) {
        throw new Error('Escrow transaction not found');
      }
      
      // Verify initiator is part of this transaction
      if (escrow.buyerId !== params.initiatorId && escrow.sellerId !== params.initiatorId) {
        throw new Error('User not authorized to dispute this transaction');
      }
      
      // Verify transaction is in a disputable state
      const validStates = ['funded', 'in_progress'];
      if (!validStates.includes(escrow.status)) {
        throw new Error(`Transaction cannot be disputed in '${escrow.status}' state`);
      }
      
      // Create the dispute
      const dispute = await db.insert(escrowDisputes).values({
        escrowTransactionId: params.escrowTransactionId,
        initiatorId: params.initiatorId,
        reason: params.reason,
        description: params.description,
        status: 'opened',
      }).returning();
      
      if (!dispute[0]) {
        throw new Error('Failed to create dispute');
      }
      
      // Update escrow status
      await db.update(escrowTransactions)
        .set({ 
          status: 'disputed',
          disputedAt: new Date(),
        })
        .where(eq(escrowTransactions.id, params.escrowTransactionId));
      
      // Notify via Matrix
      const room = await db.query.matrixRooms.findFirst({
        where: eq(matrixRooms.escrowTransactionId, params.escrowTransactionId),
      });
      
      if (room) {
        const initiator = await db.query.users.findFirst({
          where: eq(users.id, params.initiatorId),
        });
        
        const initiatorRole = escrow.sellerId === params.initiatorId ? 'Seller' : 'Buyer';
        const username = initiator ? initiator.username : initiatorRole;
        
        await matrixCommunication.sendSystemMessage({
          roomId: room.roomId,
          userId: 0,
          content: `DISPUTE OPENED: ${username} has opened a dispute: "${params.reason}". Mysterion AI will analyze the case and provide a resolution.`,
          messageType: 'system',
          metadata: {
            disputeId: dispute[0].id,
            reason: params.reason,
          }
        });
      }
      
      return dispute[0];
    } catch (error) {
      console.error('Failed to create dispute:', error);
      return null;
    }
  }
  
  /**
   * Get proofs for an escrow transaction
   */
  async getProofs(escrowTransactionId: number): Promise<EscrowProof[]> {
    try {
      const proofs = await db.query.escrowProofs.findMany({
        where: eq(escrowProofs.escrowTransactionId, escrowTransactionId),
        orderBy: (fields, { desc }) => [desc(fields.timestamp)],
        with: {
          user: true,
        }
      });
      
      return proofs;
    } catch (error) {
      console.error('Failed to get proofs:', error);
      return [];
    }
  }
  
  /**
   * Get escrow transactions for a user (as buyer or seller)
   */
  async getUserTransactions(userId: number): Promise<EscrowTransaction[]> {
    try {
      const transactions = await db.query.escrowTransactions.findMany({
        where: or(
          eq(escrowTransactions.buyerId, userId),
          eq(escrowTransactions.sellerId, userId)
        ),
        orderBy: (fields, { desc }) => [desc(fields.createdAt)],
        with: {
          buyer: true,
          seller: true,
        }
      });
      
      return transactions;
    } catch (error) {
      console.error('Failed to get user transactions:', error);
      return [];
    }
  }
  
  /**
   * Process a dispute with Mysterion AI
   */
  async processDispute(disputeId: number): Promise<EscrowDispute | null> {
    try {
      // Get the dispute details
      const dispute = await db.query.escrowDisputes.findFirst({
        where: eq(escrowDisputes.id, disputeId),
        with: {
          escrowTransaction: true,
        }
      });
      
      if (!dispute || !dispute.escrowTransaction) {
        throw new Error('Dispute or transaction not found');
      }
      
      // Get proofs submitted for this transaction
      const proofs = await this.getProofs(dispute.escrowTransactionId);
      
      // Get reputation for both parties
      const buyerRep = await db.query.userReputation.findFirst({
        where: eq(userReputation.userId, dispute.escrowTransaction.buyerId),
      });
      
      const sellerRep = await db.query.userReputation.findFirst({
        where: eq(userReputation.userId, dispute.escrowTransaction.sellerId),
      });
      
      // Update dispute status to investigating
      await db.update(escrowDisputes)
        .set({ status: 'investigating' })
        .where(eq(escrowDisputes.id, disputeId));
      
      // Have Mysterion AI assess the dispute
      const assessment = await mysterionEthics.assessDispute({
        disputeId,
        buyerReputation: buyerRep?.overallScore ? parseFloat(buyerRep.overallScore) : 0.5,
        sellerReputation: sellerRep?.overallScore ? parseFloat(sellerRep.overallScore) : 0.5,
        transactionAmount: parseFloat(dispute.escrowTransaction.amount),
        proofCount: proofs.length,
        description: dispute.description,
      });
      
      // Get the updated dispute with assessment
      const updatedDispute = await db.query.escrowDisputes.findFirst({
        where: eq(escrowDisputes.id, disputeId),
        with: {
          mysterionAssessment: true,
          escrowTransaction: true,
        }
      });
      
      // Notify via Matrix about the resolution
      if (updatedDispute) {
        const room = await db.query.matrixRooms.findFirst({
          where: eq(matrixRooms.escrowTransactionId, updatedDispute.escrowTransactionId),
        });
        
        if (room) {
          let resolutionMessage = 'Mysterion AI has assessed this dispute. ';
          
          if (updatedDispute.mysterionAssessment) {
            resolutionMessage += `Decision: ${updatedDispute.mysterionAssessment.decision}. `;
            resolutionMessage += updatedDispute.mysterionAssessment.rationale;
          }
          
          await matrixCommunication.sendSystemMessage({
            roomId: room.roomId,
            userId: 0,
            content: resolutionMessage,
            messageType: 'system',
          });
        }
      }
      
      return updatedDispute;
    } catch (error) {
      console.error('Failed to process dispute:', error);
      return null;
    }
  }
}

// Singleton instance
export const escrowService = new EscrowService();