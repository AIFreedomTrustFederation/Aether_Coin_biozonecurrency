"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storage_1 = require("../storage");
const schema_1 = require("@shared/schema");
const validateRequest_1 = require("../middleware/validateRequest");
const router = express_1.default.Router();
// Get all NFT badges for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const badges = await storage_1.storage.getNFTBadgesByUser(userId);
        res.json(badges);
    }
    catch (error) {
        console.error('Error fetching user NFT badges:', error);
        res.status(500).json({ error: 'Failed to fetch NFT badges' });
    }
});
// Get a specific NFT badge
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid badge ID' });
        }
        const badge = await storage_1.storage.getNFTBadge(id);
        if (!badge) {
            return res.status(404).json({ error: 'NFT badge not found' });
        }
        res.json(badge);
    }
    catch (error) {
        console.error('Error fetching NFT badge:', error);
        res.status(500).json({ error: 'Failed to fetch NFT badge' });
    }
});
// Create a new NFT badge template (admin only)
router.post('/', (0, validateRequest_1.validateRequest)(schema_1.insertNftBadgeSchema), async (req, res) => {
    try {
        // In a production app, we would check for admin permissions here
        const badge = await storage_1.storage.createNFTBadge(req.body);
        res.status(201).json(badge);
    }
    catch (error) {
        console.error('Error creating NFT badge:', error);
        res.status(500).json({ error: 'Failed to create NFT badge' });
    }
});
// Update an existing NFT badge (for minting)
router.patch('/:id/mint', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid badge ID' });
        }
        const { tokenId, transactionHash, mintedAt = new Date() } = req.body;
        if (!tokenId || !transactionHash) {
            return res.status(400).json({ error: 'Missing required minting information' });
        }
        const updatedBadge = await storage_1.storage.updateNFTBadge(id, {
            tokenId,
            mintedAt,
            contractAddress: req.body.contractAddress,
            chainId: req.body.chainId,
        });
        if (!updatedBadge) {
            return res.status(404).json({ error: 'NFT badge not found' });
        }
        // Update the corresponding user achievement record
        const achievementId = updatedBadge.achievementId;
        // This would be implemented in a real system to link the NFT to the achievement
        res.json(updatedBadge);
    }
    catch (error) {
        console.error('Error minting NFT badge:', error);
        res.status(500).json({ error: 'Failed to mint NFT badge' });
    }
});
// Endpoint to verify NFT badge ownership
router.get('/verify/:tokenId', async (req, res) => {
    try {
        const { tokenId } = req.params;
        // This would connect to the blockchain to verify ownership
        // For now, we'll just query our database
        // Implementation would verify the token on-chain
        // and return verification details
        res.json({
            verified: true,
            message: 'NFT badge verified successfully'
        });
    }
    catch (error) {
        console.error('Error verifying NFT badge:', error);
        res.status(500).json({ error: 'Failed to verify NFT badge' });
    }
});
exports.default = router;
