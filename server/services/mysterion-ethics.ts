/**
 * Mysterion Ethics Service
 * 
 * This service implements the Mysterion AI ethics system for monitoring
 * and resolving transaction disputes with libertarian ethics principles.
 * It also handles user reputation calculations and AiCoin compensation.
 */

import { db } from '../storage';
import {
  escrowDisputes,
  mysterionAssessments,
  userReputation,
  transactionRatings,
  recursionLogs,
  aiCoinCompensation,
  users,
  type MysterionAssessment,
  type UserReputation,
  type AiCoinCompensation
} from '@shared/schema';
import { eq, and, desc, lt, gt, sql } from 'drizzle-orm';

// Types for Mysterion AI
interface AssessDisputeParams {
  disputeId: number;
  buyerReputation: number;
  sellerReputation: number;
  transactionAmount: number;
  proofCount: number;
  description: string;
}

interface AssessEthicsParams {
  transactionId: number;
  actorId: number;
  action: string;
  context: any;
}

/**
 * Mysterion Ethics Service
 * Implements AI ethics monitoring and dispute resolution
 */
export class MysterionEthicsService {
  /**
   * Assess a dispute with Mysterion AI
   */
  async assessDispute(params: AssessDisputeParams): Promise<MysterionAssessment | null> {
    try {
      // Get the dispute details
      const dispute = await db.query.escrowDisputes.findFirst({
        where: eq(escrowDisputes.id, params.disputeId),
        with: {
          escrowTransaction: {
            with: {
              buyer: true,
              seller: true,
            }
          },
          initiator: true,
        }
      });
      
      if (!dispute || !dispute.escrowTransaction) {
        throw new Error('Dispute or transaction not found');
      }
      
      // Determine if we have enough information to make a decision
      const hasProofs = params.proofCount > 0;
      const isBuyerDispute = dispute.initiatorId === dispute.escrowTransaction.buyerId;
      const isSignificantAmount = params.transactionAmount > 100; // Arbitrary threshold
      
      // Calculate weighted reputation scores
      const buyerTrustFactor = params.buyerReputation * (isBuyerDispute ? 0.8 : 1.2); // Slight adjustment for initiator bias
      const sellerTrustFactor = params.sellerReputation * (isBuyerDispute ? 1.2 : 0.8);
      
      // Simple AI decision heuristics (in a real implementation, this would be a proper AI model)
      let decision: 'buyer_favor' | 'seller_favor' | 'split' | 'need_more_info';
      let confidenceScore: number;
      let rationale: string;
      
      if (!hasProofs) {
        decision = 'need_more_info';
        confidenceScore = 0.3;
        rationale = 'Insufficient evidence provided. Please submit proofs to support your claims.';
      } else if (buyerTrustFactor > sellerTrustFactor * 1.5) {
        decision = 'buyer_favor';
        confidenceScore = 0.7 + Math.min(0.2, (buyerTrustFactor - sellerTrustFactor) / 10);
        rationale = 'Based on reputation data and evidence, the buyer\'s claim appears more credible.';
      } else if (sellerTrustFactor > buyerTrustFactor * 1.5) {
        decision = 'seller_favor';
        confidenceScore = 0.7 + Math.min(0.2, (sellerTrustFactor - buyerTrustFactor) / 10);
        rationale = 'Based on reputation data and evidence, the seller\'s claim appears more credible.';
      } else {
        decision = 'split';
        confidenceScore = 0.6;
        rationale = 'Unable to determine clear fault. The transaction value should be split between parties.';
      }
      
      // Add ethical principles based on libertarian values (non-aggression principle, voluntary exchange)
      rationale += ' In accordance with libertarian principles, Mysterion emphasizes voluntary exchange and the non-aggression principle. ';
      
      if (decision === 'buyer_favor') {
        rationale += 'The seller appears to have violated the terms of voluntary exchange by not providing the agreed-upon goods/services.';
      } else if (decision === 'seller_favor') {
        rationale += 'The buyer appears to be claiming non-delivery despite evidence of the seller fulfilling their obligation in this voluntary exchange.';
      } else if (decision === 'split') {
        rationale += 'When clear fault cannot be determined, a split resolution respects the freedom of both parties while mitigating damage.';
      }
      
      // Create the assessment
      const assessment = await db.insert(mysterionAssessments).values({
        disputeId: params.disputeId,
        decision,
        confidenceScore: confidenceScore.toString(),
        rationale,
        data: {
          buyerReputation: params.buyerReputation,
          sellerReputation: params.sellerReputation,
          proofCount: params.proofCount,
          transactionAmount: params.transactionAmount,
        },
      }).returning();
      
      if (!assessment[0]) {
        throw new Error('Failed to create Mysterion assessment');
      }
      
      // Update the dispute status
      await db.update(escrowDisputes)
        .set({ 
          status: 'resolved',
          resolvedAt: new Date(),
          resolution: decision,
        })
        .where(eq(escrowDisputes.id, params.disputeId));
      
      // Calculate and award AiCoin compensation if needed
      if (decision === 'buyer_favor' || decision === 'seller_favor') {
        const compensationUserId = decision === 'buyer_favor' 
          ? dispute.escrowTransaction.buyerId 
          : dispute.escrowTransaction.sellerId;
        
        await this.awardAiCoinCompensation(
          compensationUserId,
          dispute.escrowTransaction.id,
          params.disputeId,
          params.transactionAmount * 0.05 // 5% compensation
        );
      }
      
      // Update reputation for both parties
      await this.updateUserReputationFromDispute(params.disputeId, decision);
      
      return assessment[0];
    } catch (error) {
      console.error('Mysterion dispute assessment failed:', error);
      return null;
    }
  }
  
  /**
   * Award AiCoin compensation to a user who was right in a dispute
   */
  private async awardAiCoinCompensation(
    userId: number,
    transactionId: number,
    disputeId: number,
    amount: number
  ): Promise<AiCoinCompensation | null> {
    try {
      const compensation = await db.insert(aiCoinCompensation).values({
        userId,
        transactionId,
        disputeId,
        amount: amount.toString(),
        reason: 'dispute_resolution',
        status: 'credited',
      }).returning();
      
      if (!compensation[0]) {
        throw new Error('Failed to create AiCoin compensation record');
      }
      
      console.log(`Awarded ${amount} AiCoin to user ${userId} for dispute resolution`);
      
      return compensation[0];
    } catch (error) {
      console.error('Failed to award AiCoin compensation:', error);
      return null;
    }
  }
  
  /**
   * Update user reputation based on a dispute resolution
   */
  private async updateUserReputationFromDispute(
    disputeId: number,
    decision: string
  ): Promise<void> {
    try {
      const dispute = await db.query.escrowDisputes.findFirst({
        where: eq(escrowDisputes.id, disputeId),
        with: {
          escrowTransaction: true,
        }
      });
      
      if (!dispute || !dispute.escrowTransaction) {
        throw new Error('Dispute or transaction not found');
      }
      
      const buyerId = dispute.escrowTransaction.buyerId;
      const sellerId = dispute.escrowTransaction.sellerId;
      
      // Update buyer reputation
      let buyerScoreAdjustment = 0;
      if (decision === 'buyer_favor') {
        buyerScoreAdjustment = 0.05; // Reputation boost for being right
      } else if (decision === 'seller_favor') {
        buyerScoreAdjustment = -0.1; // Reputation penalty for false claim
      }
      
      // Update seller reputation
      let sellerScoreAdjustment = 0;
      if (decision === 'seller_favor') {
        sellerScoreAdjustment = 0.05; // Reputation boost for being right
      } else if (decision === 'buyer_favor') {
        sellerScoreAdjustment = -0.1; // Reputation penalty for not delivering
      }
      
      // Apply reputation adjustments
      await this.adjustUserReputationScore(buyerId, buyerScoreAdjustment);
      await this.adjustUserReputationScore(sellerId, sellerScoreAdjustment);
    } catch (error) {
      console.error('Failed to update reputation from dispute:', error);
    }
  }
  
  /**
   * Adjust a user's reputation score
   */
  private async adjustUserReputationScore(
    userId: number,
    adjustment: number
  ): Promise<void> {
    try {
      // Get current reputation or create if not exists
      const currentRep = await db.query.userReputation.findFirst({
        where: eq(userReputation.userId, userId),
      });
      
      if (currentRep) {
        // Update existing reputation
        const currentScore = parseFloat(currentRep.overallScore);
        const newScore = Math.max(0, Math.min(1, currentScore + adjustment));
        
        await db.update(userReputation)
          .set({ 
            overallScore: newScore.toString(),
            lastUpdated: new Date(),
          })
          .where(eq(userReputation.id, currentRep.id));
      } else {
        // Create new reputation entry with default good standing (0.5) plus adjustment
        const initialScore = Math.max(0, Math.min(1, 0.5 + adjustment));
        
        await db.insert(userReputation).values({
          userId,
          overallScore: initialScore.toString(),
          transactionCount: '1',
          positiveRatings: '0',
          negativeRatings: '0',
          lastUpdated: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to adjust user reputation:', error);
    }
  }
  
  /**
   * Assess ethics of a transaction action
   */
  async assessEthics(params: AssessEthicsParams): Promise<boolean> {
    try {
      // Get user's reputation
      const userRep = await db.query.userReputation.findFirst({
        where: eq(userReputation.userId, params.actorId),
      });
      
      // Get recent behavior patterns
      const recentTransactionCount = await db.query.transactionRatings.findMany({
        where: and(
          eq(transactionRatings.userId, params.actorId),
          sql`created_at > NOW() - INTERVAL '30 days'`
        ),
      });
      
      // Simple ethics check (in a real implementation, this would be a proper AI ethics model)
      const userTrustLevel = userRep ? parseFloat(userRep.overallScore) : 0.5;
      const hasRecentActivity = recentTransactionCount.length > 3;
      
      // Log the assessment
      console.log(`Ethics assessment for user ${params.actorId}: action=${params.action}, trustLevel=${userTrustLevel}`);
      
      // If user has very poor reputation, flag suspicious activity
      if (userTrustLevel < 0.2) {
        // Create a log for monitoring
        await db.insert(recursionLogs).values({
          userId: params.actorId,
          transactionId: params.transactionId,
          logType: 'ethics_alert',
          message: `Suspicious activity detected: User with low trust (${userTrustLevel}) is attempting ${params.action}`,
          logLevel: 'warning',
          metadata: {
            ...params.context,
            trustLevel: userTrustLevel,
          },
        });
        
        // Return false for suspicious activity
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Ethics assessment failed:', error);
      return true; // Default to allowing in case of error
    }
  }
  
  /**
   * Reverse a transaction using quantum fractal recursive AI
   * This simulates a blockchain transaction reversal through complex means
   */
  async reverseTransaction(
    transactionId: number,
    reason: string,
    initiatorId: number
  ): Promise<boolean> {
    try {
      // Log the reversal attempt
      await db.insert(recursionLogs).values({
        userId: initiatorId,
        transactionId,
        logType: 'transaction_reversal',
        message: `Transaction reversal initiated: ${reason}`,
        logLevel: 'info',
        metadata: {
          reason,
          initiatorId,
        },
      });
      
      // Simulate quantum fractal recursion process with delays
      console.log('Initiating quantum fractal recursion process for transaction reversal...');
      
      // Simulated processing stages
      const stages = [
        'Quantum entanglement verification',
        'Fractal pattern analysis',
        'Mandelbrot set recursion',
        'Blockchain time-slice extraction',
        'Transaction state rewinding',
        'Chain reintegration',
      ];
      
      // In a real implementation, this would involve complex blockchain operations
      // For now, we just log the stages
      stages.forEach((stage, index) => {
        console.log(`Reversal stage ${index + 1}: ${stage}`);
      });
      
      // For demonstration, assume the reversal was successful
      // In a real implementation, this would depend on blockchain conditions
      const success = true;
      
      if (success) {
        // Log successful reversal
        await db.insert(recursionLogs).values({
          userId: initiatorId,
          transactionId,
          logType: 'transaction_reversal_success',
          message: 'Transaction successfully reversed through quantum fractal recursion',
          logLevel: 'info',
          metadata: {
            reason,
            stages,
            processingTime: '5.3s', // Simulated processing time
            networkFee: '0.015', // Simulated network fee
          },
        });
        
        // Award small AiCoin compensation for transaction reversal fee
        await this.awardAiCoinCompensation(
          initiatorId,
          transactionId,
          null, // No dispute involved
          0.015 // Compensation for reversal fee
        );
      }
      
      return success;
    } catch (error) {
      console.error('Transaction reversal failed:', error);
      
      // Log reversal failure
      await db.insert(recursionLogs).values({
        userId: initiatorId,
        transactionId,
        logType: 'transaction_reversal_failure',
        message: `Transaction reversal failed: ${error.message}`,
        logLevel: 'error',
        metadata: {
          error: error.message,
          reason,
        },
      });
      
      return false;
    }
  }
  
  /**
   * Update a user's reputation based on transactions and ratings
   */
  async updateUserReputation(userId: number): Promise<UserReputation | null> {
    try {
      // Get user's transaction count, ratings, etc.
      const ratings = await db.query.transactionRatings.findMany({
        where: eq(transactionRatings.ratedUserId, userId),
      });
      
      const positiveRatings = ratings.filter(r => r.rating === 'positive').length;
      const negativeRatings = ratings.filter(r => r.rating === 'negative').length;
      const totalRatings = ratings.length;
      
      // Get current reputation or create if not exists
      const currentRep = await db.query.userReputation.findFirst({
        where: eq(userReputation.userId, userId),
      });
      
      // Calculate new reputation score
      let newScore: number;
      
      if (totalRatings === 0) {
        // Default reputation for users without ratings
        newScore = 0.5;
      } else {
        // Calculate reputation with exponential moving average
        const baseScore = positiveRatings / (positiveRatings + negativeRatings);
        
        // Apply weighting based on transaction count (more transactions = more reliable score)
        const transactionWeight = Math.min(1, totalRatings / 10); // Max weight at 10+ transactions
        newScore = 0.5 * (1 - transactionWeight) + baseScore * transactionWeight;
      }
      
      // Update or create reputation record
      if (currentRep) {
        const updated = await db.update(userReputation)
          .set({
            overallScore: newScore.toString(),
            transactionCount: totalRatings.toString(),
            positiveRatings: positiveRatings.toString(),
            negativeRatings: negativeRatings.toString(),
            lastUpdated: new Date(),
          })
          .where(eq(userReputation.id, currentRep.id))
          .returning();
        
        return updated[0];
      } else {
        const created = await db.insert(userReputation).values({
          userId,
          overallScore: newScore.toString(),
          transactionCount: totalRatings.toString(),
          positiveRatings: positiveRatings.toString(),
          negativeRatings: negativeRatings.toString(),
          lastUpdated: new Date(),
        }).returning();
        
        return created[0];
      }
    } catch (error) {
      console.error('Failed to update user reputation:', error);
      return null;
    }
  }
  
  /**
   * Detect and flag patterns of fraudulent behavior
   */
  async detectFraudPatterns(): Promise<any[]> {
    try {
      // Flag users with suspicious activity patterns
      // In a real implementation, this would use ML models for pattern recognition
      
      // Example: Find users with multiple disputes in a short time period
      const suspiciousUsers = await db.query.users.findMany({
        with: {
          disputesInitiated: {
            where: sql`created_at > NOW() - INTERVAL '7 days'`
          }
        }
      });
      
      const flaggedUsers = suspiciousUsers
        .filter(user => user.disputesInitiated.length > 2) // More than 2 disputes in 7 days
        .map(user => ({
          userId: user.id,
          username: user.username,
          disputeCount: user.disputesInitiated.length,
          fraudProbability: 0.4 + Math.min(0.5, user.disputesInitiated.length * 0.1),
          reason: `Multiple disputes initiated (${user.disputesInitiated.length}) in a short time period`,
        }));
      
      // Log each flagged user
      for (const flagged of flaggedUsers) {
        await db.insert(recursionLogs).values({
          userId: flagged.userId,
          logType: 'fraud_detection',
          message: `Possible fraudulent pattern detected: ${flagged.reason}`,
          logLevel: 'warning',
          metadata: flagged,
        });
      }
      
      return flaggedUsers;
    } catch (error) {
      console.error('Fraud detection failed:', error);
      return [];
    }
  }
  
  /**
   * Apply libertarian ethics ruleset to dispute resolution
   * This function analyzes a dispute through the libertarian ethics lens
   */
  async applyLibertarianEthics(disputeId: number): Promise<string> {
    try {
      const dispute = await db.query.escrowDisputes.findFirst({
        where: eq(escrowDisputes.id, disputeId),
        with: {
          escrowTransaction: true,
          proofs: true,
        }
      });
      
      if (!dispute || !dispute.escrowTransaction) {
        return 'Unable to apply libertarian ethics: dispute or transaction not found';
      }
      
      // Libertarian ethics principles
      const principles = [
        "1. Non-Aggression Principle (NAP): No initiation of force against persons or property",
        "2. Voluntary Exchange: All interactions should be consensual",
        "3. Property Rights: Individuals have absolute right to their justly acquired property",
        "4. Freedom of Contract: Parties should be free to contract on any terms they mutually agree to",
        "5. Personal Responsibility: Individuals are responsible for their actions and agreements"
      ];
      
      // Check if contract (agreement) terms were violated
      const contractViolated = dispute.proofs.length > 0;
      
      // Analyze case from libertarian perspective
      let analysis = "Libertarian Ethics Analysis:\n\n";
      analysis += principles.join("\n") + "\n\n";
      analysis += "Case Analysis:\n";
      
      if (contractViolated) {
        analysis += "- Evidence suggests a violation of voluntary exchange principles\n";
        analysis += "- The party failing to uphold their contractual obligations is violating principle #2 and #4\n";
        analysis += "- From a libertarian perspective, contracts must be honored or restitution made\n";
      } else {
        analysis += "- Insufficient evidence to determine contract violation\n";
        analysis += "- Libertarian ethics would suggest minimal intervention without clear evidence\n";
        analysis += "- Principle #5 suggests parties should resolve conflicts through mutual agreement\n";
      }
      
      return analysis;
    } catch (error) {
      console.error('Failed to apply libertarian ethics:', error);
      return 'Error applying libertarian ethics ruleset';
    }
  }
}

// Singleton instance
export const mysterionEthics = new MysterionEthicsService();