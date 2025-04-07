import { Router, Request, Response } from 'express';
import { submitTrainingFeedback, getUserContributionStats, getContributorLeaderboard } from '../services/mysterion-training';
import { TrainingFeedbackType } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Validate feedback submission request
const feedbackSubmissionSchema = z.object({
  feedbackType: z.enum([
    TrainingFeedbackType.HELPFUL,
    TrainingFeedbackType.NOT_HELPFUL,
    TrainingFeedbackType.INCORRECT, 
    TrainingFeedbackType.OFFENSIVE,
    TrainingFeedbackType.OTHER
  ]),
  qualityRating: z.number().min(1).max(5).optional(),
  feedbackText: z.string().min(10).max(2000),
  responseId: z.string(),
  promptText: z.string(),
  responseText: z.string(),
  context: z.record(z.any()).optional()
});

/**
 * Submit feedback for AI training
 * POST /api/ai-training/feedback
 */
router.post('/feedback', async (req: Request, res: Response) => {
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
    const result = await submitTrainingFeedback(userId || undefined, null, feedback);
    
    return res.json(result);
  } catch (error) {
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
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Verify user is authenticated
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Get user stats
    const result = await getUserContributionStats(req.session.userId);
    
    return res.json(result);
  } catch (error) {
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
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    // Parse limit parameter (default: 10)
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    // Get leaderboard
    const result = await getContributorLeaderboard(limit);
    
    return res.json(result);
  } catch (error) {
    console.error('Error in get leaderboard route:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve leaderboard',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;