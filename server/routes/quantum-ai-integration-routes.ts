/**
 * Quantum AI Integration Routes
 * 
 * This module provides API endpoints for the quantum AI integration system,
 * allowing access to AI-driven quantum security guidance and actions.
 */

import { Router, Request, Response } from 'express';
import { 
  quantumAiIntegration,
  quantumSecurityGuidanceSchema,
  securityActionSchema
} from '../services/quantum-ai-integration';
import { validateInput } from '../middleware/security';
import { quantumAuth } from '../middleware/quantum-auth';

const router = Router();

/**
 * Get quantum security guidance
 * POST /api/quantum/ai/guidance
 */
router.post('/guidance', validateInput(quantumSecurityGuidanceSchema), async (req: Request, res: Response) => {
  try {
    const guidanceResponse = await quantumAiIntegration.getQuantumSecurityGuidance(req.body);
    
    res.status(200).json(guidanceResponse);
  } catch (error) {
    console.error('Error getting quantum security guidance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get quantum security guidance',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Execute a security action
 * POST /api/quantum/ai/actions
 */
router.post('/actions', validateInput(securityActionSchema), async (req: Request, res: Response) => {
  try {
    // Get user ID from session if authenticated
    const userId = (req as any).user?.id || req.body.userId;
    const walletId = req.body.walletId;
    
    const result = await quantumAiIntegration.executeSecurityAction(
      req.body,
      userId,
      walletId
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error executing security action:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute security action',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get security action suggestions
 * GET /api/quantum/ai/suggestions
 */
router.get('/suggestions', quantumAuth.hybridAuthMiddleware, async (req: Request, res: Response) => {
  try {
    // Get user ID from session
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // In a real implementation, this would get personalized suggestions
    // For now, we'll return some sample suggestions
    
    res.status(200).json({
      success: true,
      suggestions: [
        {
          actionType: 'increase_security_level',
          description: 'Upgrade to quantum security level for maximum protection',
          actionParams: {
            targetLevel: 'quantum',
            previousLevel: 'enhanced'
          },
          automated: false
        },
        {
          actionType: 'change_algorithm',
          description: 'Switch to SPHINCS+ for signature verification',
          actionParams: {
            algorithm: 'sphincs+',
            purpose: 'signature',
            previousAlgorithm: 'dilithium'
          },
          automated: false
        },
        {
          actionType: 'enable_feature',
          description: 'Enable quantum-resistant authentication',
          actionParams: {
            featureName: 'quantumAuth'
          },
          automated: false
        }
      ]
    });
  } catch (error) {
    console.error('Error getting security suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get security suggestions',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get security status
 * GET /api/quantum/ai/status
 */
router.get('/status', quantumAuth.hybridAuthMiddleware, async (req: Request, res: Response) => {
  try {
    // Get user ID from session
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // In a real implementation, this would get the actual security status
    // For now, we'll return a sample status
    
    res.status(200).json({
      success: true,
      status: {
        securityLevel: 'enhanced',
        securityScore: 85,
        algorithms: {
          encryption: 'kyber',
          signature: 'dilithium',
          authentication: 'hybrid-ecdsa-dilithium'
        },
        features: {
          quantumAuth: true,
          quantumPayments: true,
          temporalEntanglement: false
        },
        recommendations: 2,
        vulnerabilities: 0,
        lastScan: Date.now() - 86400000 // 1 day ago
      }
    });
  } catch (error) {
    console.error('Error getting security status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get security status',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;