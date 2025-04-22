"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mysterion_training_1 = require("../services/mysterion-training");
const schema_1 = require("@shared/schema");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Validate feedback submission request
const feedbackSubmissionSchema = zod_1.z.object({
    feedbackType: zod_1.z.enum([
        schema_1.TrainingFeedbackType.HELPFUL,
        schema_1.TrainingFeedbackType.NOT_HELPFUL,
        schema_1.TrainingFeedbackType.INCORRECT,
        schema_1.TrainingFeedbackType.OFFENSIVE,
        schema_1.TrainingFeedbackType.OTHER
    ]),
    qualityRating: zod_1.z.number().min(1).max(5).optional(),
    feedbackText: zod_1.z.string().min(10).max(2000),
    responseId: zod_1.z.string(),
    promptText: zod_1.z.string(),
    responseText: zod_1.z.string(),
    context: zod_1.z.record(zod_1.z.any()).optional()
});
/**
 * Submit feedback for AI training
 * POST /api/ai-training/feedback
 */
router.post('/feedback', async (req, res) => {
    try {
        // Validate request body
        const validation = feedbackSubmissionSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                error: 'Invalid feedback data',
                details: validation.error.format()
            });
        }
        // Get user ID from session (if authenticated)
        const userId = req.session.userId || null;
        // Convert feedback format
        const feedback = {
            userQuery: validation.data.promptText,
            aiResponse: validation.data.responseText,
            feedbackType: validation.data.feedbackType,
            feedbackDetails: validation.data.feedbackText,
            qualityRating: validation.data.qualityRating,
            context: validation.data.context,
            interactionId: validation.data.responseId
        };
        // Process feedback
        const result = await (0, mysterion_training_1.submitTrainingFeedback)(userId || undefined, null, feedback);
        return res.json(result);
    }
    catch (error) {
        console.error('Error in feedback submission route:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to process feedback',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});
/**
 * Get user's AI training statistics
 * GET /api/ai-training/stats
 */
router.get('/stats', async (req, res) => {
    try {
        // Verify user is authenticated
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }
        // Get user stats
        const result = await (0, mysterion_training_1.getUserContributionStats)(req.session.userId);
        return res.json(result);
    }
    catch (error) {
        console.error('Error in get user stats route:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve user statistics',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});
/**
 * Get AI training contributor leaderboard
 * GET /api/ai-training/leaderboard
 */
router.get('/leaderboard', async (req, res) => {
    try {
        // Parse limit parameter (default: 10)
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        // Get leaderboard
        const result = await (0, mysterion_training_1.getContributorLeaderboard)(limit);
        return res.json(result);
    }
    catch (error) {
        console.error('Error in get leaderboard route:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve leaderboard',
            message: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.default = router;
