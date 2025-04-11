import { Router } from 'express';
import { aiGuidanceRequestSchema, processAIGuidanceRequest } from '../services/aiGuidance';

const router = Router();

/**
 * Route to get AI guidance for wallet onboarding and assistance
 * Uses OpenAI to generate personalized responses
 */
router.post('/guidance', async (req, res) => {
  try {
    // Validate request body using schema from the service
    const validationResult = aiGuidanceRequestSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request body',
        details: validationResult.error.format()
      });
    }
    
    // Log organization ID for tracking
    const organizationId = req.header('X-Organization-ID') || 'org-zOaBdbMeIgIYrLabop4nvAu';
    console.log(`Processing AI guidance request for organization: ${organizationId}`);
    
    // Process the request using our AI guidance service with OpenAI integration
    const guidanceResponse = await processAIGuidanceRequest(validationResult.data);
    
    return res.json(guidanceResponse);
  } catch (error) {
    console.error('Error processing AI guidance request:', error);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;