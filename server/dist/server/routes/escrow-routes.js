"use strict";
/**
 * Escrow Routes
 * API endpoints for the escrow service
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const zod_1 = require("zod");
const escrow_service_1 = require("../services/escrow-service");
const schema_1 = require("../../shared/schema");
// Configure multer for memory storage (files stored in memory, not on disk)
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB file size limit
    },
    fileFilter: (req, file, callback) => {
        // Allow common file types for evidence
        const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'audio/mpeg',
            'audio/wav',
            'video/mp4',
            'application/json',
            'application/zip',
        ];
        if (allowedMimes.includes(file.mimetype)) {
            callback(null, true);
        }
        else {
            callback(new Error('Invalid file type. Allowed types: images, PDFs, documents, audio, video.'));
        }
    },
});
// Create router
const router = express_1.default.Router();
// Schema validators
const createEscrowSchema = zod_1.z.object({
    sellerId: zod_1.z.number(),
    buyerId: zod_1.z.number(),
    amount: zod_1.z.number().positive(),
    tokenSymbol: zod_1.z.string(),
    description: zod_1.z.string(),
    chain: zod_1.z.string(),
    expiresAt: zod_1.z.string().optional(),
});
const updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        schema_1.EscrowStatus.FUNDED,
        schema_1.EscrowStatus.EVIDENCE_SUBMITTED,
        schema_1.EscrowStatus.VERIFIED,
        schema_1.EscrowStatus.COMPLETED,
        schema_1.EscrowStatus.DISPUTED,
        schema_1.EscrowStatus.REFUNDED,
        schema_1.EscrowStatus.CANCELLED,
    ]),
});
const createDisputeSchema = zod_1.z.object({
    reason: zod_1.z.string(),
    description: zod_1.z.string(),
});
const ratingSchema = zod_1.z.object({
    ratedUserId: zod_1.z.number(),
    rating: zod_1.z.number().min(1).max(5),
    comment: zod_1.z.string().optional(),
});
// APIs
/**
 * Create a new escrow transaction
 * POST /api/escrow
 */
router.post('/', async (req, res) => {
    try {
        // Parse and validate request body
        const data = createEscrowSchema.parse(req.body);
        // Get user ID from header for development/testing
        // In production, this would come from a proper auth middleware
        const userIdHeader = req.header('User-Id');
        const userId = userIdHeader ? parseInt(userIdHeader) : 1;
        // Convert expiry date if present
        if (data.expiresAt) {
            data.expiresAt = new Date(data.expiresAt);
        }
        // Create escrow transaction
        const escrow = await escrow_service_1.escrowService.createEscrowTransaction({
            ...data,
        });
        res.status(201).json(escrow);
    }
    catch (error) {
        console.error('Error creating escrow:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }
        res.status(500).json({ error: 'Failed to create escrow transaction' });
    }
});
/**
 * Get escrow transactions for the authenticated user
 * GET /api/escrow
 */
router.get('/', async (req, res) => {
    try {
        // Get user ID from header for development/testing
        // In production, this would come from a proper auth middleware
        const userIdHeader = req.header('User-Id');
        const userId = userIdHeader ? parseInt(userIdHeader) : 1;
        // Parse optional query parameters
        const role = req.query.role;
        const status = req.query.status;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        // Get escrows for user
        const escrows = await escrow_service_1.escrowService.getUserEscrows(userId, role, status, limit, offset);
        res.json(escrows);
    }
    catch (error) {
        console.error('Error getting escrows:', error);
        res.status(500).json({ error: 'Failed to get escrow transactions' });
    }
});
/**
 * Get a specific escrow transaction by ID
 * GET /api/escrow/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const escrowId = parseInt(req.params.id);
        if (isNaN(escrowId)) {
            return res.status(400).json({ error: 'Invalid escrow ID' });
        }
        // Get user ID from header for development/testing
        // In production, this would come from a proper auth middleware
        const userIdHeader = req.header('User-Id');
        const userId = userIdHeader ? parseInt(userIdHeader) : 1;
        // Get escrow
        const escrow = await escrow_service_1.escrowService.getEscrowById(escrowId, userId);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow transaction not found' });
        }
        res.json(escrow);
    }
    catch (error) {
        console.error('Error getting escrow:', error);
        res.status(500).json({ error: 'Failed to get escrow transaction' });
    }
});
/**
 * Update escrow status
 * PUT /api/escrow/:id/status
 */
router.put('/:id/status', async (req, res) => {
    try {
        const escrowId = parseInt(req.params.id);
        if (isNaN(escrowId)) {
            return res.status(400).json({ error: 'Invalid escrow ID' });
        }
        // Get user ID from header for development/testing
        // In production, this would come from a proper auth middleware
        const userIdHeader = req.header('User-Id');
        const userId = userIdHeader ? parseInt(userIdHeader) : 1;
        // Parse and validate status
        const { status } = updateStatusSchema.parse(req.body);
        // Update status
        const updated = await escrow_service_1.escrowService.updateEscrowStatus(escrowId, status, userId);
        res.json(updated);
    }
    catch (error) {
        console.error('Error updating escrow status:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }
        if (error instanceof Error) {
            // Check for known error messages
            if (error.message.includes('not authorized') ||
                error.message.includes('Only buyer') ||
                error.message.includes('Only seller')) {
                return res.status(403).json({ error: error.message });
            }
            if (error.message.includes('Invalid state transition')) {
                return res.status(400).json({ error: error.message });
            }
            if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }
        }
        res.status(500).json({ error: 'Failed to update escrow status' });
    }
});
/**
 * Upload proof for an escrow transaction
 * POST /api/escrow/:id/proof
 */
router.post('/:id/proof', upload.single('file'), async (req, res) => {
    try {
        const escrowId = parseInt(req.params.id);
        if (isNaN(escrowId)) {
            return res.status(400).json({ error: 'Invalid escrow ID' });
        }
        // Get user ID from header for development/testing
        // In production, this would come from a proper auth middleware
        const userIdHeader = req.header('User-Id');
        const userId = userIdHeader ? parseInt(userIdHeader) : 1;
        // Verify file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        // Validate required fields
        if (!req.body.proofType || !req.body.description) {
            return res.status(400).json({ error: 'Missing required fields: proofType, description' });
        }
        // Upload proof
        const proof = await escrow_service_1.escrowService.uploadProof({
            escrowTransactionId: escrowId,
            userId,
            proofType: req.body.proofType,
            description: req.body.description,
            file: req.file.buffer,
            fileType: req.file.mimetype,
            filename: req.file.originalname,
        });
        res.status(201).json(proof);
    }
    catch (error) {
        console.error('Error uploading proof:', error);
        if (error instanceof Error) {
            if (error.message.includes('not authorized') ||
                error.message.includes('not found')) {
                return res.status(403).json({ error: error.message });
            }
        }
        res.status(500).json({ error: 'Failed to upload proof' });
    }
});
/**
 * Create a dispute for an escrow transaction
 * POST /api/escrow/:id/dispute
 */
router.post('/:id/dispute', async (req, res) => {
    try {
        const escrowId = parseInt(req.params.id);
        if (isNaN(escrowId)) {
            return res.status(400).json({ error: 'Invalid escrow ID' });
        }
        // Get user ID from header for development/testing
        // In production, this would come from a proper auth middleware
        const userIdHeader = req.header('User-Id');
        const userId = userIdHeader ? parseInt(userIdHeader) : 1;
        // Parse and validate dispute data
        const dispute = createDisputeSchema.parse(req.body);
        // Create dispute
        const created = await escrow_service_1.escrowService.createDispute({
            escrowTransactionId: escrowId,
            initiatorId: userId,
            reason: dispute.reason,
            description: dispute.description,
        });
        res.status(201).json(created);
    }
    catch (error) {
        console.error('Error creating dispute:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }
        if (error instanceof Error) {
            if (error.message.includes('already exists')) {
                return res.status(409).json({ error: error.message });
            }
            if (error.message.includes('not authorized') ||
                error.message.includes('not found')) {
                return res.status(403).json({ error: error.message });
            }
        }
        res.status(500).json({ error: 'Failed to create dispute' });
    }
});
/**
 * Rate another user after an escrow transaction
 * POST /api/escrow/:id/rate
 */
router.post('/:id/rate', async (req, res) => {
    try {
        const escrowId = parseInt(req.params.id);
        if (isNaN(escrowId)) {
            return res.status(400).json({ error: 'Invalid escrow ID' });
        }
        // Get user ID from header for development/testing
        // In production, this would come from a proper auth middleware
        const userIdHeader = req.header('User-Id');
        const userId = userIdHeader ? parseInt(userIdHeader) : 1;
        // Parse and validate rating data
        const rating = ratingSchema.parse(req.body);
        // Submit rating
        const created = await escrow_service_1.escrowService.rateUser({
            escrowTransactionId: escrowId,
            raterId: userId,
            ratedUserId: rating.ratedUserId,
            rating: rating.rating,
            comment: rating.comment,
        });
        res.status(201).json(created);
    }
    catch (error) {
        console.error('Error rating user:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: 'Invalid request data', details: error.errors });
        }
        if (error instanceof Error) {
            if (error.message.includes('not authorized') ||
                error.message.includes('Cannot rate until') ||
                error.message.includes('Cannot rate yourself') ||
                error.message.includes('Can only rate the other party') ||
                error.message.includes('already submitted a rating')) {
                return res.status(400).json({ error: error.message });
            }
            if (error.message.includes('not found')) {
                return res.status(404).json({ error: error.message });
            }
        }
        res.status(500).json({ error: 'Failed to submit rating' });
    }
});
exports.default = router;
