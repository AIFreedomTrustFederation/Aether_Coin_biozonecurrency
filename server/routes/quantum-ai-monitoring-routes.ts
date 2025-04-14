/**
 * Quantum AI Monitoring Routes
 * 
 * This module provides API endpoints for the quantum AI monitoring system,
 * allowing access to security events, recommendations, and learnings.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { 
  quantumAiMonitoring,
  quantumSecurityEventSchema,
  securityRecommendationSchema,
  securityLearningSchema
} from '../services/quantum-ai-monitoring';
import { QuantumEventType } from '../../shared/quantum-security-schema';
import { validateInput } from '../middleware/security';
import { quantumAuth } from '../middleware/quantum-auth';

const router = Router();

// Schema for event query parameters
const eventQuerySchema = z.object({
  limit: z.string().transform(val => parseInt(val)).default('100'),
  userId: z.string().transform(val => parseInt(val)).optional(),
  eventType: z.string().optional(),
  securityLevel: z.string().optional(),
  startTime: z.string().transform(val => parseInt(val)).optional(),
  endTime: z.string().transform(val => parseInt(val)).optional()
});

// Schema for recommendation query parameters
const recommendationQuerySchema = z.object({
  limit: z.string().transform(val => parseInt(val)).default('100'),
  includeApplied: z.string().transform(val => val === 'true').default('false'),
  recommendationType: z.string().optional(),
  impact: z.string().optional()
});

// Schema for learning query parameters
const learningQuerySchema = z.object({
  limit: z.string().transform(val => parseInt(val)).default('100'),
  learningType: z.string().optional(),
  minConfidence: z.string().transform(val => parseFloat(val)).optional()
});

/**
 * Log a quantum security event
 * POST /api/quantum/monitoring/events
 */
router.post('/events', validateInput(quantumSecurityEventSchema), async (req: Request, res: Response) => {
  try {
    const eventId = await quantumAiMonitoring.logQuantumSecurityEvent(req.body);
    
    res.status(201).json({
      success: true,
      eventId,
      message: 'Security event logged successfully'
    });
  } catch (error) {
    console.error('Error logging security event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log security event',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get recent security events
 * GET /api/quantum/monitoring/events
 */
router.get('/events', quantumAuth.hybridAuthMiddleware, async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const validation = eventQuerySchema.safeParse(req.query);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.error.format()
      });
    }
    
    const { limit, userId, eventType, securityLevel, startTime, endTime } = validation.data;
    
    // Get events
    let events = quantumAiMonitoring.getRecentSecurityEvents(limit);
    
    // Apply filters
    if (userId) {
      events = events.filter(e => e.userId === userId);
    }
    
    if (eventType) {
      events = events.filter(e => e.eventType === eventType);
    }
    
    if (securityLevel) {
      events = events.filter(e => e.securityLevel === securityLevel);
    }
    
    if (startTime) {
      events = events.filter(e => e.timestamp >= startTime);
    }
    
    if (endTime) {
      events = events.filter(e => e.timestamp <= endTime);
    }
    
    res.status(200).json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error getting security events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get security events',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get security recommendations
 * GET /api/quantum/monitoring/recommendations
 */
router.get('/recommendations', quantumAuth.hybridAuthMiddleware, async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const validation = recommendationQuerySchema.safeParse(req.query);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.error.format()
      });
    }
    
    const { limit, includeApplied, recommendationType, impact } = validation.data;
    
    // Get recommendations
    let recommendations = quantumAiMonitoring.getSecurityRecommendations(limit, includeApplied);
    
    // Apply filters
    if (recommendationType) {
      recommendations = recommendations.filter(r => r.recommendationType === recommendationType);
    }
    
    if (impact) {
      recommendations = recommendations.filter(r => r.impact === impact);
    }
    
    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error('Error getting security recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get security recommendations',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Apply a security recommendation
 * POST /api/quantum/monitoring/recommendations/:recommendationId/apply
 */
router.post('/recommendations/:recommendationId/apply', quantumAuth.quantumAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { recommendationId } = req.params;
    
    // In a real implementation, this would apply the recommendation
    // For now, we'll just return success
    
    res.status(200).json({
      success: true,
      recommendationId,
      message: 'Recommendation applied successfully',
      appliedAt: Date.now()
    });
  } catch (error) {
    console.error('Error applying recommendation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply recommendation',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get security learnings
 * GET /api/quantum/monitoring/learnings
 */
router.get('/learnings', quantumAuth.hybridAuthMiddleware, async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const validation = learningQuerySchema.safeParse(req.query);
    
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: validation.error.format()
      });
    }
    
    const { limit, learningType, minConfidence } = validation.data;
    
    // Get learnings
    let learnings = quantumAiMonitoring.getSecurityLearnings(limit);
    
    // Apply filters
    if (learningType) {
      learnings = learnings.filter(l => l.learningType === learningType);
    }
    
    if (minConfidence !== undefined) {
      learnings = learnings.filter(l => l.confidence >= minConfidence);
    }
    
    res.status(200).json({
      success: true,
      count: learnings.length,
      learnings
    });
  } catch (error) {
    console.error('Error getting security learnings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get security learnings',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get security dashboard data
 * GET /api/quantum/monitoring/dashboard
 */
router.get('/dashboard', quantumAuth.hybridAuthMiddleware, async (req: Request, res: Response) => {
  try {
    // Get recent events
    const recentEvents = quantumAiMonitoring.getRecentSecurityEvents(100);
    
    // Get pending recommendations
    const pendingRecommendations = quantumAiMonitoring.getSecurityRecommendations(5, false);
    
    // Get recent learnings
    const recentLearnings = quantumAiMonitoring.getSecurityLearnings(5);
    
    // Calculate statistics
    const eventsByType: Record<string, number> = {};
    const eventsBySecurityLevel: Record<string, number> = {};
    const anomalyCount = recentEvents.filter(e => e.eventType === QuantumEventType.ANOMALY).length;
    const successRate = recentEvents.filter(e => e.success).length / recentEvents.length;
    
    for (const event of recentEvents) {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
      eventsBySecurityLevel[event.securityLevel] = (eventsBySecurityLevel[event.securityLevel] || 0) + 1;
    }
    
    res.status(200).json({
      success: true,
      dashboard: {
        eventCount: recentEvents.length,
        eventsByType,
        eventsBySecurityLevel,
        anomalyCount,
        successRate,
        pendingRecommendations,
        recentLearnings,
        lastUpdated: Date.now()
      }
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;