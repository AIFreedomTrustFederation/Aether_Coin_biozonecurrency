"use strict";
/**
 * Escrow Service
 *
 * Provides functionality for creating and managing escrow transactions,
 * handling evidence submission, disputes, and user ratings.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.escrowService = void 0;
const db_1 = require("../db");
const schema_1 = require("../../shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
const matrix_integration_1 = require("./matrix-integration");
const ipfs_service_1 = require("./ipfs-service");
// Threshold values
const MINIMUM_REQUIRED_TRUST_LEVEL = 20; // Minimum trust level for direct escrow completion
const MINIMUM_REQUIRED_REPUTATION = 50; // Minimum reputation for direct transactions
const HIGH_TRUST_THRESHOLD = 80; // Threshold for high trust level
// Mandatory cooling period in days
const DEFAULT_COOLING_PERIOD_DAYS = 3;
/**
 * Main escrow service implementation
 */
class EscrowService {
    /**
     * Create a new escrow transaction
     */
    async createEscrowTransaction(data) {
        // Ensure seller and buyer exist and are different users
        if (data.sellerId === data.buyerId) {
            throw new Error("Seller and buyer cannot be the same user");
        }
        // Check if seller has sufficient trust level
        const sellerRep = await this.getUserReputation(data.sellerId);
        if (sellerRep && sellerRep.trustLevel < MINIMUM_REQUIRED_TRUST_LEVEL) {
            throw new Error(`Seller needs a trust level of at least ${MINIMUM_REQUIRED_TRUST_LEVEL}`);
        }
        // Create escrow transaction record
        const [escrow] = await db_1.db.insert(schema_1.escrowTransactions).values({
            sellerId: data.sellerId,
            buyerId: data.buyerId,
            amount: data.amount.toString(),
            tokenSymbol: data.tokenSymbol,
            status: schema_1.EscrowStatus.INITIATED,
            description: data.description,
            chain: data.chain,
            createdAt: new Date(),
            expiresAt: data.expiresAt || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days
            updatedAt: new Date()
        }).returning();
        if (!escrow) {
            throw new Error("Failed to create escrow transaction");
        }
        // Create Matrix room for the escrow participants
        try {
            const escrowRoomId = await matrix_integration_1.matrixCommunication.createEscrowRoom(escrow.id, data.sellerId, data.buyerId, `Escrow-${escrow.id}`);
            if (escrowRoomId) {
                // Send initial message to room
                await matrix_integration_1.matrixCommunication.sendMessageToRoom(escrowRoomId, 0, // System user
                `Escrow transaction #${escrow.id} has been created. Amount: ${data.amount} ${data.tokenSymbol}.
           
           Current status: ${schema_1.EscrowStatus.INITIATED}
           
           The buyer should fund the escrow to proceed.`);
                // Insert into matrix_rooms table instead of updating escrow
                await db_1.db.insert(schema_1.matrixRooms).values({
                    roomId: escrowRoomId,
                    escrowTransactionId: escrow.id,
                    status: 'active',
                    encryptionEnabled: true
                });
            }
        }
        catch (error) {
            console.error(`Error creating Matrix room for escrow ${escrow.id}:`, error);
            // Non-blocking: we continue even if Matrix room creation fails
        }
        return escrow;
    }
    /**
     * Get a specific escrow transaction by ID
     * Only allows access for involved parties
     */
    async getEscrowById(escrowId, userId) {
        // Get escrow with validation that user is involved
        const escrow = await db_1.db.query.escrowTransactions.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.escrowTransactions.id, escrowId), (0, drizzle_orm_1.sql) `(${schema_1.escrowTransactions.sellerId} = ${userId} OR ${schema_1.escrowTransactions.buyerId} = ${userId})`)
        });
        if (!escrow) {
            return null;
        }
        // Get associated Matrix room if exists
        const matrixRoom = await db_1.db.query.matrixRooms.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.matrixRooms.escrowTransactionId, escrowId)
        });
        // Return escrow with matrix room ID if available
        return {
            ...escrow,
            matrixRoomId: matrixRoom?.roomId
        };
    }
    /**
     * Get all escrow transactions for a user
     */
    async getUserEscrows(userId, role, status, limit = 20, offset = 0) {
        let whereClause;
        if (role === 'buyer') {
            whereClause = (0, drizzle_orm_1.eq)(schema_1.escrowTransactions.buyerId, userId);
        }
        else if (role === 'seller') {
            whereClause = (0, drizzle_orm_1.eq)(schema_1.escrowTransactions.sellerId, userId);
        }
        else {
            // If no role specified, get all escrows where user is either buyer or seller
            whereClause = (0, drizzle_orm_1.sql) `(${schema_1.escrowTransactions.sellerId} = ${userId} OR ${schema_1.escrowTransactions.buyerId} = ${userId})`;
        }
        // Add status filter if provided
        if (status) {
            whereClause = (0, drizzle_orm_1.and)(whereClause, (0, drizzle_orm_1.eq)(schema_1.escrowTransactions.status, status));
        }
        const escrows = await db_1.db.select()
            .from(schema_1.escrowTransactions)
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.escrowTransactions.createdAt))
            .limit(limit)
            .offset(offset);
        // Get associated Matrix rooms
        const escrowIds = escrows.map(escrow => escrow.id);
        if (escrowIds.length === 0) {
            return escrows;
        }
        const roomEntries = await db_1.db.select()
            .from(schema_1.matrixRooms)
            .where((0, drizzle_orm_1.sql) `${schema_1.matrixRooms.escrowTransactionId} IN (${escrowIds.join(',')})`);
        // Create a map of escrowId to matrixRoomId
        const roomMap = new Map();
        for (const room of roomEntries) {
            roomMap.set(room.escrowTransactionId, room.roomId);
        }
        // Add matrixRoomId to each escrow
        return escrows.map(escrow => ({
            ...escrow,
            matrixRoomId: roomMap.get(escrow.id)
        }));
    }
    /**
     * Update the status of an escrow transaction
     */
    async updateEscrowStatus(escrowId, newStatus, userId) {
        // Get current escrow
        const escrow = await this.getEscrowById(escrowId, userId);
        if (!escrow) {
            throw new Error("Escrow transaction not found or you're not authorized to access it");
        }
        // Validate state transition
        this.validateStatusTransition(escrow.status, newStatus, userId, escrow);
        // Update escrow status
        const [updated] = await db_1.db.update(schema_1.escrowTransactions)
            .set({
            status: newStatus,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.escrowTransactions.id, escrowId))
            .returning();
        if (!updated) {
            throw new Error("Failed to update escrow status");
        }
        // If there's a Matrix room, send a status update message
        if (escrow.matrixRoomId) {
            try {
                await matrix_integration_1.matrixCommunication.sendMessageToRoom(escrow.matrixRoomId, 0, // System user
                `Escrow status updated to: ${newStatus}
           
           ${this.getStatusUpdateMessage(newStatus)}`);
            }
            catch (error) {
                console.error(`Error sending Matrix status update for escrow ${escrowId}:`, error);
                // Non-blocking
            }
        }
        // If completed or refunded, update user reputation
        if (newStatus === schema_1.EscrowStatus.COMPLETED) {
            await this.updateReputationOnCompletion(escrow);
        }
        else if (newStatus === schema_1.EscrowStatus.REFUNDED) {
            await this.updateReputationOnRefund(escrow);
        }
        return updated;
    }
    /**
     * Helper to validate escrow status transitions
     */
    validateStatusTransition(currentStatus, newStatus, userId, escrow) {
        const isBuyer = userId === escrow.buyerId;
        const isSeller = userId === escrow.sellerId;
        // Define allowed transitions based on current status
        const validTransitions = {
            [schema_1.EscrowStatus.INITIATED]: [schema_1.EscrowStatus.FUNDED, schema_1.EscrowStatus.CANCELLED],
            [schema_1.EscrowStatus.FUNDED]: [schema_1.EscrowStatus.EVIDENCE_SUBMITTED, schema_1.EscrowStatus.DISPUTED, schema_1.EscrowStatus.REFUNDED],
            [schema_1.EscrowStatus.EVIDENCE_SUBMITTED]: [schema_1.EscrowStatus.VERIFIED, schema_1.EscrowStatus.DISPUTED],
            [schema_1.EscrowStatus.VERIFIED]: [schema_1.EscrowStatus.COMPLETED, schema_1.EscrowStatus.DISPUTED],
            [schema_1.EscrowStatus.COMPLETED]: [], // Terminal state
            [schema_1.EscrowStatus.DISPUTED]: [schema_1.EscrowStatus.COMPLETED, schema_1.EscrowStatus.REFUNDED],
            [schema_1.EscrowStatus.REFUNDED]: [], // Terminal state
            [schema_1.EscrowStatus.CANCELLED]: [] // Terminal state
        };
        // Role-based permissions for transitions
        if (newStatus === schema_1.EscrowStatus.FUNDED && !isBuyer) {
            throw new Error("Only buyer can fund an escrow");
        }
        if (newStatus === schema_1.EscrowStatus.VERIFIED && !isBuyer) {
            throw new Error("Only buyer can verify the evidence");
        }
        if (newStatus === schema_1.EscrowStatus.COMPLETED) {
            // Special case: high trust seller can complete directly if threshold met
            const highTrustCase = isBuyer && escrow.sellerTrustLevel && escrow.sellerTrustLevel >= HIGH_TRUST_THRESHOLD;
            if (!isBuyer && !highTrustCase) {
                throw new Error("Only buyer can complete the escrow");
            }
        }
        if (newStatus === schema_1.EscrowStatus.REFUNDED && !isSeller && currentStatus !== schema_1.EscrowStatus.DISPUTED) {
            throw new Error("Only seller can initiate a refund unless the escrow is disputed");
        }
        if (newStatus === schema_1.EscrowStatus.CANCELLED) {
            if (currentStatus !== schema_1.EscrowStatus.INITIATED) {
                throw new Error("Can only cancel an escrow that hasn't been funded yet");
            }
            if (!isBuyer && !isSeller) {
                throw new Error("Only buyer or seller can cancel the escrow");
            }
        }
        // Check if transition is valid
        if (!validTransitions[currentStatus].includes(newStatus)) {
            throw new Error(`Invalid state transition from ${currentStatus} to ${newStatus}`);
        }
    }
    /**
     * Generate user-friendly messages for status updates
     */
    getStatusUpdateMessage(status) {
        switch (status) {
            case schema_1.EscrowStatus.FUNDED:
                return "The escrow has been funded. Seller can now proceed with the transaction.";
            case schema_1.EscrowStatus.EVIDENCE_SUBMITTED:
                return "Evidence has been submitted. Buyer should verify the evidence.";
            case schema_1.EscrowStatus.VERIFIED:
                return "Evidence has been verified. The transaction can be completed.";
            case schema_1.EscrowStatus.COMPLETED:
                return "The transaction has been completed successfully. Funds have been released to the seller.";
            case schema_1.EscrowStatus.DISPUTED:
                return "The transaction is under dispute. Please provide any requested information.";
            case schema_1.EscrowStatus.REFUNDED:
                return "The funds have been refunded to the buyer.";
            case schema_1.EscrowStatus.CANCELLED:
                return "The escrow has been cancelled.";
            default:
                return "";
        }
    }
    /**
     * Upload proof for an escrow transaction
     */
    async uploadProof(data) {
        // Get escrow and verify user is involved
        const escrow = await this.getEscrowById(data.escrowTransactionId, data.userId);
        if (!escrow) {
            throw new Error("Escrow transaction not found or you're not authorized to access it");
        }
        // Verify escrow is in an appropriate state for proof submission
        if (escrow.status !== schema_1.EscrowStatus.FUNDED &&
            escrow.status !== schema_1.EscrowStatus.EVIDENCE_SUBMITTED &&
            escrow.status !== schema_1.EscrowStatus.DISPUTED) {
            throw new Error(`Cannot upload proof when escrow is in ${escrow.status} state`);
        }
        // Upload file to IPFS
        const cid = await ipfs_service_1.ipfsService.uploadFile(data.file, data.filename, data.fileType);
        // Create proof record
        const [proof] = await db_1.db.insert(schema_1.escrowProofs).values({
            escrowTransactionId: data.escrowTransactionId,
            userId: data.userId,
            proofType: data.proofType,
            description: data.description,
            fileUrl: cid,
            mimeType: data.fileType,
            fileName: data.filename,
            uploadedAt: new Date(),
            verifiedAt: null,
            verifiedBy: null
        }).returning();
        if (!proof) {
            throw new Error("Failed to save proof record");
        }
        // Update escrow status if needed
        if (escrow.status === schema_1.EscrowStatus.FUNDED) {
            await this.updateEscrowStatus(data.escrowTransactionId, schema_1.EscrowStatus.EVIDENCE_SUBMITTED, data.userId);
        }
        // If there's a Matrix room, send a notification
        if (escrow.matrixRoomId) {
            try {
                const proofUrl = ipfs_service_1.ipfsService.getFileUrl(cid);
                await matrix_integration_1.matrixCommunication.sendMessageToRoom(escrow.matrixRoomId, data.userId, `New proof uploaded:
           Type: ${data.proofType}
           Description: ${data.description}
           File: ${data.filename}
           
           Link: ${proofUrl}`);
            }
            catch (error) {
                console.error(`Error sending Matrix proof notification for escrow ${data.escrowTransactionId}:`, error);
                // Non-blocking
            }
        }
        return proof;
    }
    /**
     * Get proofs for an escrow transaction
     */
    async getProofs(escrowId, userId) {
        // Verify user is involved in the escrow
        const escrow = await this.getEscrowById(escrowId, userId);
        if (!escrow) {
            throw new Error("Escrow transaction not found or you're not authorized to access it");
        }
        // Get all proofs for this escrow
        const proofs = await db_1.db.select()
            .from(schema_1.escrowProofs)
            .where((0, drizzle_orm_1.eq)(schema_1.escrowProofs.escrowTransactionId, escrowId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.escrowProofs.uploadedAt));
        return proofs;
    }
    /**
     * Create a dispute for an escrow transaction
     */
    async createDispute(data) {
        // Verify user is involved in the escrow
        const escrow = await this.getEscrowById(data.escrowTransactionId, data.initiatorId);
        if (!escrow) {
            throw new Error("Escrow transaction not found or you're not authorized to access it");
        }
        // Check if dispute already exists
        const existingDispute = await db_1.db.query.escrowDisputes.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.escrowDisputes.escrowTransactionId, data.escrowTransactionId)
        });
        if (existingDispute) {
            throw new Error("A dispute already exists for this escrow transaction");
        }
        // Create dispute record
        const [dispute] = await db_1.db.insert(schema_1.escrowDisputes).values({
            escrowTransactionId: data.escrowTransactionId,
            initiatorId: data.initiatorId,
            reason: data.reason,
            description: data.description,
            status: schema_1.DisputeStatus.OPENED,
            createdAt: new Date(),
            updatedAt: new Date(),
            resolvedAt: null,
            resolvedBy: null,
            resolution: null
        }).returning();
        if (!dispute) {
            throw new Error("Failed to create dispute");
        }
        // Update escrow status to disputed
        await this.updateEscrowStatus(data.escrowTransactionId, schema_1.EscrowStatus.DISPUTED, data.initiatorId);
        // If there's a Matrix room, send a notification
        if (escrow.matrixRoomId) {
            try {
                await matrix_integration_1.matrixCommunication.sendMessageToRoom(escrow.matrixRoomId, data.initiatorId, `A dispute has been opened:
           Reason: ${data.reason}
           Details: ${data.description}
           
           The escrow is now in DISPUTED status. Both parties should work together to resolve the issue.
           If needed, a moderator will be assigned to help resolve the dispute.`);
            }
            catch (error) {
                console.error(`Error sending Matrix dispute notification for escrow ${data.escrowTransactionId}:`, error);
                // Non-blocking
            }
        }
        return dispute;
    }
    /**
     * Get dispute information for an escrow
     */
    async getDispute(escrowId, userId) {
        // Verify user is involved in the escrow
        const escrow = await this.getEscrowById(escrowId, userId);
        if (!escrow) {
            throw new Error("Escrow transaction not found or you're not authorized to access it");
        }
        // Get dispute
        const dispute = await db_1.db.query.escrowDisputes.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.escrowDisputes.escrowTransactionId, escrowId)
        });
        return dispute;
    }
    /**
     * Rate another user after an escrow transaction
     */
    async rateUser(data) {
        // Verify escrow exists and user is involved
        const escrow = await this.getEscrowById(data.escrowTransactionId, data.raterId);
        if (!escrow) {
            throw new Error("Escrow transaction not found or you're not authorized to access it");
        }
        // Verify escrow is completed or refunded
        if (escrow.status !== schema_1.EscrowStatus.COMPLETED && escrow.status !== schema_1.EscrowStatus.REFUNDED) {
            throw new Error("Cannot rate until the escrow is completed or refunded");
        }
        // Prevent self-rating
        if (data.raterId === data.ratedUserId) {
            throw new Error("Cannot rate yourself");
        }
        // Verify that rated user is the other party in the escrow
        if ((data.raterId === escrow.buyerId && data.ratedUserId !== escrow.sellerId) ||
            (data.raterId === escrow.sellerId && data.ratedUserId !== escrow.buyerId)) {
            throw new Error("Can only rate the other party in the escrow transaction");
        }
        // Check if already rated
        const existingRating = await db_1.db.query.transactionRatings.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.transactionRatings.escrowTransactionId, data.escrowTransactionId), (0, drizzle_orm_1.eq)(schema_1.transactionRatings.raterId, data.raterId))
        });
        if (existingRating) {
            throw new Error("You have already submitted a rating for this transaction");
        }
        // Create rating record
        const [rating] = await db_1.db.insert(schema_1.transactionRatings).values({
            escrowTransactionId: data.escrowTransactionId,
            raterId: data.raterId,
            ratedUserId: data.ratedUserId,
            rating: data.rating,
            comment: data.comment || null,
            createdAt: new Date()
        }).returning();
        if (!rating) {
            throw new Error("Failed to save rating");
        }
        // Update user reputation based on the new rating
        await this.updateReputationFromRating(data.ratedUserId, data.rating);
        // If there's a Matrix room, send a notification
        if (escrow.matrixRoomId) {
            try {
                await matrix_integration_1.matrixCommunication.sendMessageToRoom(escrow.matrixRoomId, data.raterId, `Rating submitted:
           Rating: ${data.rating}/5
           ${data.comment ? `Comment: ${data.comment}` : ''}`);
            }
            catch (error) {
                console.error(`Error sending Matrix rating notification for escrow ${data.escrowTransactionId}:`, error);
                // Non-blocking
            }
        }
        return rating;
    }
    /**
     * Get user reputation or create if it doesn't exist
     */
    async getUserReputation(userId) {
        let reputation = await db_1.db.query.userReputation.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.userReputation.userId, userId)
        });
        if (!reputation) {
            // Create new reputation record for user
            const [newReputation] = await db_1.db.insert(schema_1.userReputation).values({
                userId,
                trustLevel: 50, // Default starting trust level
                positiveRatings: 0,
                negativeRatings: 0,
                totalTransactions: 0,
                disputesInitiated: 0,
                disputesReceived: 0,
                coolingOffPeriod: null,
                updatedAt: new Date()
            }).returning();
            reputation = newReputation;
        }
        return reputation;
    }
    /**
     * Update reputation when escrow is completed successfully
     */
    async updateReputationOnCompletion(escrow) {
        // Update seller reputation
        let sellerRep = await this.getUserReputation(escrow.sellerId);
        if (sellerRep) {
            await db_1.db.update(schema_1.userReputation)
                .set({
                trustLevel: Math.min(100, sellerRep.trustLevel + 2), // Increase trust, max 100
                totalTransactions: sellerRep.totalTransactions + 1,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.userReputation.userId, escrow.sellerId));
        }
        // Update buyer reputation
        let buyerRep = await this.getUserReputation(escrow.buyerId);
        if (buyerRep) {
            await db_1.db.update(schema_1.userReputation)
                .set({
                trustLevel: Math.min(100, buyerRep.trustLevel + 1), // Smaller increase for buyer
                totalTransactions: buyerRep.totalTransactions + 1,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.userReputation.userId, escrow.buyerId));
        }
    }
    /**
     * Update reputation when escrow is refunded
     */
    async updateReputationOnRefund(escrow) {
        // Only update transaction count, no trust level changes for refunds
        // Update seller reputation
        let sellerRep = await this.getUserReputation(escrow.sellerId);
        if (sellerRep) {
            await db_1.db.update(schema_1.userReputation)
                .set({
                totalTransactions: sellerRep.totalTransactions + 1,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.userReputation.userId, escrow.sellerId));
        }
        // Update buyer reputation
        let buyerRep = await this.getUserReputation(escrow.buyerId);
        if (buyerRep) {
            await db_1.db.update(schema_1.userReputation)
                .set({
                totalTransactions: buyerRep.totalTransactions + 1,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.userReputation.userId, escrow.buyerId));
        }
    }
    /**
     * Update user reputation based on a new rating
     */
    async updateReputationFromRating(userId, rating) {
        const userRep = await this.getUserReputation(userId);
        if (!userRep) {
            return;
        }
        // Determine if positive or negative
        const isPositive = rating >= 4; // 4-5 are positive, 1-3 are negative
        // Update counts
        const updates = {
            positiveRatings: isPositive ? userRep.positiveRatings + 1 : userRep.positiveRatings,
            negativeRatings: !isPositive ? userRep.negativeRatings + 1 : userRep.negativeRatings,
            updatedAt: new Date()
        };
        // Adjust trust level based on rating
        if (isPositive) {
            updates.trustLevel = Math.min(100, userRep.trustLevel + 1);
        }
        else {
            updates.trustLevel = Math.max(0, userRep.trustLevel - (5 - rating));
        }
        // Apply updates
        await db_1.db.update(schema_1.userReputation)
            .set(updates)
            .where((0, drizzle_orm_1.eq)(schema_1.userReputation.userId, userId));
    }
}
// Create and export singleton instance
exports.escrowService = new EscrowService();
