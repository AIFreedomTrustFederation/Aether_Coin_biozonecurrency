"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const storage_1 = require("../storage");
const zod_1 = require("zod");
const schema_1 = require("../../shared/schema");
const mysterion_ai_1 = require("../services/mysterion-ai");
const quantum_vault_1 = require("../services/quantum-vault");
const router = express_1.default.Router();
// Validate API key submission
const apiKeySubmissionSchema = schema_1.insertUserApiKeySchema.extend({
    apiKey: zod_1.z.string().min(1, 'API key is required'),
    nickname: zod_1.z.string().min(1, 'Nickname is required'),
    isTrainingEnabled: zod_1.z.boolean().default(true),
});
// Middleware to check user authentication
const requireAuth = (req, res, next) => {
    // In a real app, this would check if the user is authenticated
    // For demo purposes, we'll use a dummy user ID
    const userId = req.session?.userId || 1;
    req.userId = userId;
    next();
};
// Add a new API key to the vault
router.post('/api-keys', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        // Validate the request body
        const validationResult = apiKeySubmissionSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                error: validationResult.error.errors
            });
        }
        const { apiKey, service, nickname, isTrainingEnabled } = validationResult.data;
        // Create the API key record
        const newKey = await storage_1.storage.createUserApiKey({
            userId,
            service: service || 'openai',
            nickname,
            isActive: true,
            isTrainingEnabled,
            usageCount: 0,
            apiKey, // This will be stored in the vault and not in the database
            createdAt: new Date(),
            updatedAt: new Date()
        });
        // Return the API key record (without the actual key)
        return res.status(201).json({
            success: true,
            apiKey: {
                id: newKey.id,
                userId: newKey.userId,
                service: newKey.service,
                nickname: newKey.nickname,
                isActive: newKey.isActive,
                isTrainingEnabled: newKey.isTrainingEnabled,
                usageCount: newKey.usageCount,
                createdAt: newKey.createdAt,
                lastUsedAt: newKey.lastUsedAt
            }
        });
    }
    catch (error) {
        console.error('Error adding API key:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to add API key'
        });
    }
});
// Get all API keys for the authenticated user
router.get('/api-keys', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        // Get all API keys for the user
        const apiKeys = await storage_1.storage.getUserApiKeysByUserId(userId);
        // Get the metadata for keys in the vault
        const vaultKeyInfo = await (0, quantum_vault_1.listApiKeysForUser)(userId);
        // Combine the data for a complete picture
        const keyInfo = apiKeys.map(key => ({
            id: key.id,
            userId: key.userId,
            service: key.service,
            nickname: key.nickname,
            isActive: key.isActive,
            isTrainingEnabled: key.isTrainingEnabled,
            usageCount: key.usageCount,
            createdAt: key.createdAt,
            lastUsedAt: key.lastUsedAt,
            // Include info about whether the key is in the vault
            vaultStatus: vaultKeyInfo.some(vk => vk.keyId === key.vaultKeyId)
                ? 'secured'
                : 'unknown'
        }));
        return res.json({
            success: true,
            apiKeys: keyInfo
        });
    }
    catch (error) {
        console.error('Error getting API keys:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get API keys'
        });
    }
});
// Update API key settings
router.patch('/api-keys/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const keyId = parseInt(req.params.id);
        // Verify the API key belongs to the user
        const apiKey = await storage_1.storage.getUserApiKey(keyId);
        if (!apiKey || apiKey.userId !== userId) {
            return res.status(404).json({
                success: false,
                error: 'API key not found'
            });
        }
        // Update the API key settings
        const { isActive, isTrainingEnabled } = req.body;
        if (isActive !== undefined) {
            await storage_1.storage.updateUserApiKeyStatus(keyId, isActive);
        }
        if (isTrainingEnabled !== undefined) {
            await storage_1.storage.updateUserApiKeyTrainingStatus(keyId, isTrainingEnabled);
        }
        // Get the updated API key
        const updatedKey = await storage_1.storage.getUserApiKey(keyId);
        return res.json({
            success: true,
            apiKey: updatedKey
        });
    }
    catch (error) {
        console.error('Error updating API key:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to update API key'
        });
    }
});
// Delete API key
router.delete('/api-keys/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        const keyId = parseInt(req.params.id);
        // Verify the API key belongs to the user
        const apiKey = await storage_1.storage.getUserApiKey(keyId);
        if (!apiKey || apiKey.userId !== userId) {
            return res.status(404).json({
                success: false,
                error: 'API key not found'
            });
        }
        // Delete the API key
        const success = await storage_1.storage.deleteUserApiKey(keyId);
        return res.json({
            success
        });
    }
    catch (error) {
        console.error('Error deleting API key:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to delete API key'
        });
    }
});
// Get user contribution points
router.get('/contribution', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        // Get the user's contribution points
        const points = await (0, mysterion_ai_1.getUserContributionPoints)(userId);
        return res.json({
            success: true,
            points
        });
    }
    catch (error) {
        console.error('Error getting contribution points:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get contribution points'
        });
    }
});
// Generate an AI response using the mysterion network
router.post('/generate', requireAuth, async (req, res) => {
    try {
        const userId = req.userId;
        // Validate the request body
        const { messages, systemPrompt, modelName, maxTokens, temperature } = req.body;
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid messages array is required'
            });
        }
        // Generate the response
        const response = await (0, mysterion_ai_1.generateResponse)(messages, {
            userId,
            systemPrompt,
            modelName,
            maxTokens,
            temperature
        });
        return res.json(response);
    }
    catch (error) {
        console.error('Error generating response:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to generate response',
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
        });
    }
});
exports.default = router;
