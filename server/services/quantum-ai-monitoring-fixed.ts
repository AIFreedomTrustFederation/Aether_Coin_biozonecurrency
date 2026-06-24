/**
 * Quantum AI Monitoring Service
 * 
 * This service provides automated monitoring, learning, and adaptation of quantum security
 * features using LLM-based analysis. It integrates with the existing AI guidance and
 * training systems to create a self-improving quantum security layer.
 */

import OpenAI from "openai";
import { storage } from '../storage';
import { v4 as uuidv4 } from 'uuid';
import { 
  quantumSecurity, 
  QuantumSecurityLevel, 
  PostQuantumAlgorithm 
} from '../crypto/quantum';
import { quantumSecurePaymentService } from './quantumSecurePayment';
import { z } from 'zod';

// Import schemas from shared schema
import {
  quantumSecurityEventSchema,
  securityRecommendationSchema,
  securityLearningSchema,
  QuantumEventType,
  RecommendationType,
  ImpactLevel,
  LearningType
} from '../../shared/quantum-security-schema';

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Export types for use in this service
export type QuantumSecurityEvent = z.infer<typeof quantumSecurityEventSchema>;
export type SecurityRecommendation = z.infer<typeof securityRecommendationSchema>;
export type SecurityLearning = z.infer<typeof securityLearningSchema>;

// In-memory cache for recent events (would be replaced with a proper database in production)
let recentEvents: (QuantumSecurityEvent & { eventId: string })[] = [];
let securityRecommendations: SecurityRecommendation[] = [];
let securityLearnings: SecurityLearning[] = [];

// Maximum events to keep in memory
const MAX_EVENTS_IN_MEMORY = 1000;

/**
 * Log a quantum security event
 * 
 * @param event Quantum security event to log
 * @returns Event ID
 */
export async function logQuantumSecurityEvent(event: QuantumSecurityEvent): Promise<string> {
  try {
    // Validate event
    const validatedEvent = quantumSecurityEventSchema.parse(event);
    
    // Add event ID
    const eventId = uuidv4();
    const eventWithId = { ...validatedEvent, eventId };
    
    // Store in memory cache
    recentEvents.unshift(eventWithId);
    
    // Trim cache if needed
    if (recentEvents.length > MAX_EVENTS_IN_MEMORY) {
      recentEvents = recentEvents.slice(0, MAX_EVENTS_IN_MEMORY);
    }
    
    // Store in database (async)
    try {
      await storage.createQuantumSecurityEvent({
        eventId,
        eventType: eventWithId.eventType,
        securityLevel: eventWithId.securityLevel,
        algorithm: eventWithId.algorithm,
        userId: eventWithId.userId,
        walletId: eventWithId.walletId,
        success: eventWithId.success,
        metadata: eventWithId.metadata,
        timestamp: eventWithId.timestamp
      });
    } catch (dbError) {
      console.error('Failed to store quantum security event in database:', dbError);
      // Continue execution even if database storage fails
    }
    
    // Process event asynchronously
    setTimeout(() => {
      processSecurityEvent(eventWithId).catch(err => {
        console.error(`Error processing security event ${eventId}:`, err);
      });
    }, 100);
    
    return eventId;
  } catch (error) {
    console.error('Error logging quantum security event:', error);
    throw error;
  }
}

/**
 * Process a security event for anomalies and learning
 * 
 * @param event Quantum security event to process
 */
async function processSecurityEvent(event: QuantumSecurityEvent & { eventId: string }): Promise<void> {
  try {
    // Check for anomalies
    const anomalyDetected = await detectAnomalies(event);
    
    // Update event patterns for learning
    await updateEventPatterns(event);
    
    // Generate recommendations if needed
    if (anomalyDetected || shouldGenerateRecommendations(event)) {
      await generateSecurityRecommendations(event);
    }
    
    // Apply automated actions if configured
    await applyAutomatedActions(event);
  } catch (error) {
    console.error(`Error processing security event ${event.eventId}:`, error);
  }
}

/**
 * Detect anomalies in security events
 * 
 * @param event Security event to check
 * @returns Boolean indicating if anomaly was detected
 */
async function detectAnomalies(event: QuantumSecurityEvent & { eventId: string }): Promise<boolean> {
  // Skip anomaly detection for already identified anomalies
  if (event.eventType === QuantumEventType.ANOMALY) {
    return true;
  }
  
  // Check for failed operations
  if (!event.success) {
    // Log as anomaly if it's a critical operation
    if ([QuantumEventType.AUTHENTICATION, QuantumEventType.PAYMENT, QuantumEventType.SIGNATURE, QuantumEventType.VERIFICATION].includes(event.eventType)) {
      await logQuantumSecurityEvent({
        eventType: QuantumEventType.ANOMALY,
        securityLevel: event.securityLevel,
        algorithm: event.algorithm,
        userId: event.userId,
        walletId: event.walletId,
        success: true, // The anomaly detection itself succeeded
        metadata: {
          relatedEventId: event.eventId,
          anomalyType: 'operation_failure',
          description: `Failed ${event.eventType} operation detected`,
          severity: 'medium'
        },
        timestamp: Date.now()
      });
      return true;
    }
  }
  
  // Check for unusual patterns (e.g., multiple failed authentication attempts)
  if (event.eventType === QuantumEventType.AUTHENTICATION && !event.success && event.userId) {
    const recentFailedAttempts = recentEvents.filter(e => 
      e.eventType === QuantumEventType.AUTHENTICATION && 
      !e.success && 
      e.userId === event.userId &&
      e.timestamp > Date.now() - 3600000 // Last hour
    );
    
    if (recentFailedAttempts.length >= 3) {
      await logQuantumSecurityEvent({
        eventType: QuantumEventType.ANOMALY,
        securityLevel: event.securityLevel,
        algorithm: event.algorithm,
        userId: event.userId,
        walletId: event.walletId,
        success: true,
        metadata: {
          relatedEventId: event.eventId,
          anomalyType: 'multiple_failed_attempts',
          description: `Multiple failed authentication attempts detected for user ${event.userId}`,
          severity: 'high',
          attemptCount: recentFailedAttempts.length
        },
        timestamp: Date.now()
      });
      return true;
    }
  }
  
  // Use LLM to analyze complex patterns (batched for efficiency)
  if (shouldPerformLLMAnalysis(event)) {
    const isAnomaly = await analyzePatternsWithLLM(event);
    if (isAnomaly) {
      return true;
    }
  }
  
  return false;
}

/**
 * Determine if we should perform LLM analysis on this event
 * 
 * @param event Security event
 * @returns Boolean indicating if LLM analysis should be performed
 */
function shouldPerformLLMAnalysis(event: QuantumSecurityEvent): boolean {
  // Only analyze a subset of events to conserve API usage
  // Focus on high-value security events
  if ([QuantumEventType.PAYMENT, QuantumEventType.AUTHENTICATION, QuantumEventType.ATTACK_ATTEMPT].includes(event.eventType)) {
    return true;
  }
  
  // Analyze a sample of other events (e.g., 5%)
  if (Math.random() < 0.05) {
    return true;
  }
  
  return false;
}

/**
 * Analyze patterns using LLM
 * 
 * @param event Security event to analyze
 * @returns Boolean indicating if anomaly was detected
 */
async function analyzePatternsWithLLM(event: QuantumSecurityEvent & { eventId: string }): Promise<boolean> {
  try {
    // Get relevant context for the event
    const relevantEvents = getRelevantEvents(event, 10);
    
    // Prepare context for LLM
    const context = {
      currentEvent: event,
      recentEvents: relevantEvents,
      securityLevel: event.securityLevel,
      algorithm: event.algorithm,
      userContext: event.userId ? await getUserSecurityContext(event.userId) : null
    };
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a quantum security analysis system. Analyze the provided security event and context to determine if there's an anomaly or security concern. 
          Respond with a JSON object with the following structure:
          {
            "isAnomaly": boolean,
            "anomalyType": string or null,
            "description": string,
            "severity": "low" | "medium" | "high" | "critical",
            "confidence": number (0-1),
            "recommendedAction": string or null
          }`
        },
        {
          role: "user",
          content: JSON.stringify(context, null, 2)
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      return false;
    }
    
    const analysis = JSON.parse(content);
    
    // Log anomaly if detected
    if (analysis.isAnomaly) {
      await logQuantumSecurityEvent({
        eventType: QuantumEventType.ANOMALY,
        securityLevel: event.securityLevel,
        algorithm: event.algorithm,
        userId: event.userId,
        walletId: event.walletId,
        success: true,
        metadata: {
          relatedEventId: event.eventId,
          anomalyType: analysis.anomalyType || 'llm_detected_anomaly',
          description: analysis.description,
          severity: analysis.severity,
          confidence: analysis.confidence,
          recommendedAction: analysis.recommendedAction
        },
        timestamp: Date.now()
      });
      
      // Generate recommendation if provided
      if (analysis.recommendedAction) {
        const recommendation: SecurityRecommendation = {
          recommendationId: uuidv4(),
          eventId: event.eventId,
          recommendationType: mapToRecommendationType(analysis.anomalyType),
          description: analysis.recommendedAction,
          impact: analysis.severity,
          automated: false,
          createdAt: Date.now()
        };
        
        securityRecommendations.push(recommendation);
        
        // Store in database
        try {
          await storage.createQuantumSecurityRecommendation(recommendation);
        } catch (dbError) {
          console.error('Failed to store security recommendation in database:', dbError);
        }
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error analyzing patterns with LLM:', error);
    return false;
  }
}

/**
 * Map anomaly type to recommendation type
 * 
 * @param anomalyType Anomaly type
 * @returns Recommendation type
 */
function mapToRecommendationType(anomalyType: string | null): SecurityRecommendation['recommendationType'] {
  if (!anomalyType) return RecommendationType.SYSTEM_UPDATE;
  
  if (anomalyType.includes('algorithm')) return RecommendationType.ALGORITHM_CHANGE;
  if (anomalyType.includes('security_level')) return RecommendationType.SECURITY_LEVEL_INCREASE;
  if (anomalyType.includes('config')) return RecommendationType.CONFIGURATION_CHANGE;
  if (anomalyType.includes('user')) return RecommendationType.USER_EDUCATION;
  
  return RecommendationType.SYSTEM_UPDATE;
}

/**
 * Get relevant events for context
 * 
 * @param event Current event
 * @param count Number of events to retrieve
 * @returns Array of relevant events
 */
function getRelevantEvents(event: QuantumSecurityEvent & { eventId: string }, count: number): (QuantumSecurityEvent & { eventId: string })[] {
  // Get events related to the same user or wallet
  const userEvents = event.userId 
    ? recentEvents.filter(e => e.userId === event.userId)
    : [];
    
  const walletEvents = event.walletId
    ? recentEvents.filter(e => e.walletId === event.walletId)
    : [];
    
  // Get events of the same type
  const typeEvents = recentEvents.filter(e => e.eventType === event.eventType);
  
  // Combine events
  const allEvents = [...userEvents, ...walletEvents, ...typeEvents];
  
  // Deduplicate events by using timestamp as a unique identifier
  // This is a simple approach - in a real system we'd use a proper ID
  const seen = new Set<string>();
  const combinedEvents = allEvents.filter(event => {
    if (seen.has(event.eventId)) {
      return false;
    }
    seen.add(event.eventId);
    return true;
  });
  
  // Sort by timestamp (newest first) and limit
  return combinedEvents
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, count);
}

/**
 * Get user security context
 * 
 * @param userId User ID
 * @returns User security context
 */
async function getUserSecurityContext(userId: number): Promise<any> {
  try {
    // Get user data
    const user = await storage.getUser(userId);
    if (!user) {
      return null;
    }
    
    // Get user's security events
    const userEvents = recentEvents.filter(e => e.userId === userId);
    
    // Calculate statistics
    const failedAuthAttempts = userEvents.filter(e => 
      e.eventType === QuantumEventType.AUTHENTICATION && !e.success
    ).length;
    
    const successfulAuthAttempts = userEvents.filter(e => 
      e.eventType === QuantumEventType.AUTHENTICATION && e.success
    ).length;
    
    const anomalies = userEvents.filter(e => e.eventType === QuantumEventType.ANOMALY).length;
    
    // Return context
    return {
      userId,
      username: user.username,
      securityLevel: QuantumSecurityLevel.STANDARD, // Default to standard security level
      failedAuthAttempts,
      successfulAuthAttempts,
      anomalies,
      lastActivity: userEvents.length > 0 
        ? Math.max(...userEvents.map(e => e.timestamp))
        : null
    };
  } catch (error) {
    console.error(`Error getting user security context for user ${userId}:`, error);
    return null;
  }
}

/**
 * Update event patterns for learning
 * 
 * @param event Security event
 */
async function updateEventPatterns(event: QuantumSecurityEvent): Promise<void> {
  // This would be implemented with a proper machine learning system in production
  // For now, we'll use a simple pattern recognition approach
  
  // Skip certain event types
  if ([QuantumEventType.ANOMALY].includes(event.eventType)) {
    return;
  }
  
  // Track algorithm usage patterns
  if (event.algorithm) {
    await updateAlgorithmUsageStats(event.algorithm, event.success);
  }
  
  // Track security level usage
  await updateSecurityLevelStats(event.securityLevel, event.success);
  
  // Periodically generate learnings
  if (shouldGenerateLearnings()) {
    await generateSecurityLearnings();
  }
}

/**
 * Update algorithm usage statistics
 * 
 * @param algorithm Algorithm name
 * @param success Whether the operation succeeded
 */
async function updateAlgorithmUsageStats(algorithm: string, success: boolean): Promise<void> {
  try {
    // In a real implementation, this would update a database
    // For now, we'll just log it
    console.log(`Algorithm usage: ${algorithm}, success: ${success}`);
  } catch (error) {
    console.error(`Error updating algorithm usage stats for ${algorithm}:`, error);
  }
}

/**
 * Update security level statistics
 * 
 * @param securityLevel Security level
 * @param success Whether the operation succeeded
 */
async function updateSecurityLevelStats(securityLevel: string, success: boolean): Promise<void> {
  try {
    // In a real implementation, this would update a database
    // For now, we'll just log it
    console.log(`Security level usage: ${securityLevel}, success: ${success}`);
  } catch (error) {
    console.error(`Error updating security level stats for ${securityLevel}:`, error);
  }
}

/**
 * Determine if we should generate learnings
 * 
 * @returns Boolean indicating if learnings should be generated
 */
function shouldGenerateLearnings(): boolean {
  // In a real implementation, this would be based on time elapsed, event count, etc.
  // For now, we'll just do it randomly (1% chance)
  return Math.random() < 0.01;
}

/**
 * Determine if we should generate recommendations
 * 
 * @param event Security event
 * @returns Boolean indicating if recommendations should be generated
 */
function shouldGenerateRecommendations(event: QuantumSecurityEvent): boolean {
  // In a real implementation, this would be based on event type, user history, etc.
  // For now, we'll just do it for certain event types
  return [QuantumEventType.AUTHENTICATION, QuantumEventType.PAYMENT].includes(event.eventType) && !event.success;
}

/**
 * Generate security recommendations
 * 
 * @param event Security event
 */
async function generateSecurityRecommendations(event: QuantumSecurityEvent & { eventId: string }): Promise<void> {
  try {
    // In a real implementation, this would use ML/AI to generate recommendations
    // For now, we'll just use simple rules
    
    // Skip certain event types
    if (event.eventType === QuantumEventType.ANOMALY) {
      // Anomalies already generate recommendations
      return;
    }
    
    // Generate recommendation based on event type
    let recommendation: SecurityRecommendation | null = null;
    
    switch (event.eventType) {
      case QuantumEventType.AUTHENTICATION:
        if (!event.success) {
          recommendation = {
            recommendationId: uuidv4(),
            eventId: event.eventId,
            recommendationType: RecommendationType.USER_EDUCATION,
            description: 'Consider implementing multi-factor authentication for enhanced security',
            impact: ImpactLevel.MEDIUM,
            automated: false,
            createdAt: Date.now()
          };
        }
        break;
        
      case QuantumEventType.PAYMENT:
        if (!event.success) {
          recommendation = {
            recommendationId: uuidv4(),
            eventId: event.eventId,
            recommendationType: RecommendationType.SECURITY_LEVEL_INCREASE,
            description: 'Increase quantum security level for payment operations',
            impact: ImpactLevel.HIGH,
            automated: false,
            createdAt: Date.now()
          };
        }
        break;
        
      case QuantumEventType.SIGNATURE:
      case QuantumEventType.VERIFICATION:
        if (!event.success) {
          recommendation = {
            recommendationId: uuidv4(),
            eventId: event.eventId,
            recommendationType: RecommendationType.ALGORITHM_CHANGE,
            description: 'Consider upgrading to a more robust post-quantum signature algorithm',
            impact: ImpactLevel.MEDIUM,
            automated: false,
            createdAt: Date.now()
          };
        }
        break;
    }
    
    // Store recommendation if generated
    if (recommendation) {
      securityRecommendations.push(recommendation);
      
      // Store in database
      try {
        await storage.createQuantumSecurityRecommendation(recommendation);
      } catch (dbError) {
        console.error('Failed to store security recommendation in database:', dbError);
      }
    }
  } catch (error) {
    console.error(`Error generating security recommendations for event ${event.eventId}:`, error);
  }
}

/**
 * Generate security learnings
 */
async function generateSecurityLearnings(): Promise<void> {
  try {
    // In a real implementation, this would analyze patterns and generate learnings
    // For now, we'll just create a simple learning
    
    const learning: SecurityLearning = {
      learningId: uuidv4(),
      learningType: LearningType.PATTERN_RECOGNITION,
      description: 'System has observed recent security patterns and is adapting',
      confidence: 0.75,
      dataPoints: recentEvents.length,
      metadata: {
        generatedAt: Date.now(),
        eventCount: recentEvents.length,
        anomalyCount: recentEvents.filter(e => e.eventType === QuantumEventType.ANOMALY).length
      },
      createdAt: Date.now()
    };
    
    securityLearnings.push(learning);
    
    // Store in database
    try {
      await storage.createQuantumSecurityLearning(learning);
    } catch (dbError) {
      console.error('Failed to store security learning in database:', dbError);
    }
  } catch (error) {
    console.error('Error generating security learnings:', error);
  }
}

/**
 * Apply automated actions based on recommendations
 */
async function applyAutomatedRecommendations(): Promise<void> {
  try {
    // Get unapplied recommendations
    const unappliedRecommendations = securityRecommendations.filter(r => !r.appliedAt);
    
    // Apply each recommendation
    for (const recommendation of unappliedRecommendations) {
      await applyRecommendation(recommendation);
    }
  } catch (error) {
    console.error('Error applying automated recommendations:', error);
  }
}

/**
 * Apply a specific recommendation
 * 
 * @param recommendation Security recommendation to apply
 */
async function applyRecommendation(recommendation: SecurityRecommendation): Promise<void> {
  try {
    // Skip if already applied
    if (recommendation.appliedAt) {
      return;
    }
    
    // Apply based on recommendation type
    switch (recommendation.recommendationType) {
      case RecommendationType.ALGORITHM_CHANGE:
        await applyAlgorithmChange(recommendation);
        break;
        
      case RecommendationType.SECURITY_LEVEL_INCREASE:
        await applySecurityLevelIncrease(recommendation);
        break;
        
      case RecommendationType.CONFIGURATION_CHANGE:
        await applyConfigurationChange(recommendation);
        break;
        
      case RecommendationType.SYSTEM_UPDATE:
        await applySystemUpdate(recommendation);
        break;
        
      case RecommendationType.USER_EDUCATION:
        await scheduleUserEducation(recommendation);
        break;
    }
    
    // Mark as applied
    recommendation.appliedAt = Date.now();
    
    // Update in database
    try {
      await storage.updateQuantumSecurityRecommendation(
        recommendation.recommendationId,
        { appliedAt: recommendation.appliedAt }
      );
    } catch (dbError) {
      console.error('Failed to update recommendation in database:', dbError);
    }
  } catch (error) {
    console.error(`Error applying recommendation ${recommendation.recommendationId}:`, error);
  }
}

/**
 * Apply algorithm change recommendation
 * 
 * @param recommendation Security recommendation
 */
async function applyAlgorithmChange(recommendation: SecurityRecommendation): Promise<void> {
  // This would implement the algorithm change in a real system
  console.log(`Applied algorithm change: ${recommendation.description}`);
}

/**
 * Apply security level increase recommendation
 * 
 * @param recommendation Security recommendation
 */
async function applySecurityLevelIncrease(recommendation: SecurityRecommendation): Promise<void> {
  // This would implement the security level increase in a real system
  console.log(`Applied security level increase: ${recommendation.description}`);
}

/**
 * Apply configuration change recommendation
 * 
 * @param recommendation Security recommendation
 */
async function applyConfigurationChange(recommendation: SecurityRecommendation): Promise<void> {
  // This would implement the configuration change in a real system
  console.log(`Applied configuration change: ${recommendation.description}`);
}

/**
 * Apply system update recommendation
 * 
 * @param recommendation Security recommendation
 */
async function applySystemUpdate(recommendation: SecurityRecommendation): Promise<void> {
  // This would implement the system update in a real system
  console.log(`Applied system update: ${recommendation.description}`);
}

/**
 * Schedule user education based on recommendation
 * 
 * @param recommendation Security recommendation
 */
async function scheduleUserEducation(recommendation: SecurityRecommendation): Promise<void> {
  // This would schedule user education in a real system
  console.log(`Scheduled user education: ${recommendation.description}`);
}

/**
 * Apply automated actions based on event
 * 
 * @param event Security event
 */
async function applyAutomatedActions(event: QuantumSecurityEvent): Promise<void> {
  // Apply automated actions based on event type
  switch (event.eventType) {
    case QuantumEventType.ANOMALY:
      await handleAnomalyAutomation(event);
      break;
      
    case QuantumEventType.ATTACK_ATTEMPT:
      await handleAttackAttemptAutomation(event);
      break;
      
    case QuantumEventType.AUTHENTICATION:
      await handleAuthenticationAutomation(event);
      break;
  }
}

/**
 * Handle anomaly automation
 * 
 * @param event Anomaly event
 */
async function handleAnomalyAutomation(event: QuantumSecurityEvent): Promise<void> {
  // Handle based on anomaly type
  const anomalyType = event.metadata?.anomalyType;
  const severity = event.metadata?.severity;
  
  if (severity === 'critical') {
    // Critical anomalies trigger immediate response
    console.log(`Critical anomaly detected: ${anomalyType}`);
    
    // Notify security team
    // await notifySecurityTeam(event);
    
    // Increase security level for affected user/wallet
    if (event.userId) {
      // await increaseUserSecurityLevel(event.userId);
    }
  }
}

/**
 * Handle attack attempt automation
 * 
 * @param event Attack attempt event
 */
async function handleAttackAttemptAutomation(event: QuantumSecurityEvent): Promise<void> {
  // Log attack attempt
  console.log(`Attack attempt detected: ${event.metadata?.attackType}`);
  
  // Implement countermeasures
  // await implementAttackCountermeasures(event);
}

/**
 * Handle authentication automation
 * 
 * @param event Authentication event
 */
async function handleAuthenticationAutomation(event: QuantumSecurityEvent): Promise<void> {
  // Only handle failed authentication
  if (!event.success && event.userId) {
    // Check for repeated failures
    const recentFailures = recentEvents.filter(e => 
      e.eventType === QuantumEventType.AUTHENTICATION && 
      !e.success && 
      e.userId === event.userId &&
      e.timestamp > Date.now() - 86400000 // Last 24 hours
    );
    
    if (recentFailures.length >= 5) {
      // Implement account protection measures
      console.log(`Implementing account protection for user ${event.userId} after ${recentFailures.length} failed attempts`);
      // await protectUserAccount(event.userId);
    }
  }
}

/**
 * Get recent security events
 * 
 * @param limit Maximum number of events to return
 * @returns Array of recent security events
 */
export function getRecentSecurityEvents(limit: number = 100): (QuantumSecurityEvent & { eventId: string })[] {
  return recentEvents.slice(0, limit);
}

/**
 * Get security recommendations
 * 
 * @param limit Maximum number of recommendations to return
 * @param includeApplied Whether to include applied recommendations
 * @returns Array of security recommendations
 */
export function getSecurityRecommendations(
  limit: number = 100,
  includeApplied: boolean = false
): SecurityRecommendation[] {
  let filteredRecommendations = securityRecommendations;
  
  if (!includeApplied) {
    filteredRecommendations = filteredRecommendations.filter(r => !r.appliedAt);
  }
  
  return filteredRecommendations
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

/**
 * Get security learnings
 * 
 * @param limit Maximum number of learnings to return
 * @returns Array of security learnings
 */
export function getSecurityLearnings(limit: number = 100): SecurityLearning[] {
  return securityLearnings
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

// Export the schemas for validation
export {
  quantumSecurityEventSchema,
  securityRecommendationSchema,
  securityLearningSchema
};

// Export the quantum AI monitoring service
export const quantumAiMonitoring = {
  logQuantumSecurityEvent,
  getRecentSecurityEvents,
  getSecurityRecommendations,
  getSecurityLearnings
};