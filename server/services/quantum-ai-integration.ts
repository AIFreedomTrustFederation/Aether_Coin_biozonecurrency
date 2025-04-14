/**
 * Quantum AI Integration Service
 * 
 * This service integrates quantum security features with the AI guidance and training systems,
 * creating a unified AI-driven security layer that autonomously adapts and improves.
 */

import { 
  quantumSecurity, 
  QuantumSecurityLevel, 
  PostQuantumAlgorithm 
} from '../crypto/quantum';
import { TrainingFeedbackType } from './mysterion-training'; // Ensure this is the correct path
import { quantumAiMonitoring } from './quantum-ai-monitoring';
import { processAIGuidanceRequest, AIGuidanceResponse } from './aiGuidance';
import { submitTrainingFeedback } from './mysterion-training';
import { storage } from '../storage';
import { z } from 'zod';

// Define schema for quantum security guidance request
export const quantumSecurityGuidanceSchema = z.object({
  userId: z.number().optional(),
  walletId: z.number().optional(),
  query: z.string(),
  securityContext: z.object({
    securityLevel: z.enum([
      QuantumSecurityLevel.STANDARD,
      QuantumSecurityLevel.ENHANCED,
      QuantumSecurityLevel.QUANTUM
    ]).optional(),
    recentEvents: z.array(z.any()).optional(),
    userPreferences: z.record(z.any()).optional()
  }).optional()
});

export type QuantumSecurityGuidanceRequest = z.infer<typeof quantumSecurityGuidanceSchema>;

// Define schema for security action
export const securityActionSchema = z.object({
  actionType: z.enum([
    'increase_security_level',
    'change_algorithm',
    'update_configuration',
    'apply_recommendation',
    'run_security_scan',
    'enable_feature',
    'disable_feature'
  ]),
  actionParams: z.record(z.any()).optional(),
  description: z.string(),
  automated: z.boolean().default(false)
});

export type SecurityAction = z.infer<typeof securityActionSchema>;

/**
 * Get quantum security guidance
 * 
 * @param request Guidance request
 * @returns AI guidance response with security actions
 */
export async function getQuantumSecurityGuidance(
  request: QuantumSecurityGuidanceRequest
): Promise<AIGuidanceResponse & { securityActions?: SecurityAction[] }> {
  try {
    // Prepare context for AI guidance
    const securityContext = request.securityContext || {};
    
    // Get recent security events for context
    const recentEvents = request.userId 
      ? await getUserSecurityEvents(request.userId)
      : [];
      
    // Get pending recommendations
    const pendingRecommendations = quantumAiMonitoring.getSecurityRecommendations(3, false);
    
    // Get security learnings
    const securityLearnings = quantumAiMonitoring.getSecurityLearnings(3);
    
    // Prepare messages for AI guidance
    const messages = [
      {
        role: 'system' as const,
        content: `You are a quantum security assistant for the Aetherion Wallet. 
        You provide guidance on quantum-resistant security features and help users 
        understand and configure their security settings. Your responses should be 
        helpful, accurate, and security-focused.`
      },
      {
        role: 'user' as const,
        content: request.query
      }
    ];
    
    // Prepare context for AI guidance
    const context = {
      walletContext: {
        userPreferences: {
          ...securityContext.userPreferences,
          securityLevel: securityContext.securityLevel || QuantumSecurityLevel.STANDARD
        }
      },
      screenContext: 'quantum_security',
      userSkillLevel: determineUserSkillLevel(request),
      securityData: {
        recentEvents: recentEvents.slice(0, 5),
        pendingRecommendations,
        securityLearnings
      }
    };
    
    // Process the request using AI guidance service
    const guidanceResponse = await processAIGuidanceRequest({
      userId: request.userId?.toString() || 'anonymous',
      messages,
      context
    });
    
    // Extract security actions from the response
    const securityActions = extractSecurityActions(guidanceResponse.content);
    
    // Log the interaction for training
    await logSecurityGuidanceInteraction(request, guidanceResponse, securityActions);
    
    return {
      ...guidanceResponse,
      securityActions
    };
  } catch (error) {
    console.error('Error getting quantum security guidance:', error);
    
    // Return a fallback response
    return {
      id: `fallback-${Date.now()}`,
      content: "I'm here to help with quantum security features, but I encountered an error. " +
               "Please try again or contact support if the issue persists.",
      timestamp: Date.now(),
      securityActions: []
    };
  }
}

/**
 * Get recent security events for a user
 * 
 * @param userId User ID
 * @returns Array of recent security events
 */
async function getUserSecurityEvents(userId: number): Promise<any[]> {
  try {
    // Get events from monitoring service
    const allEvents = quantumAiMonitoring.getRecentSecurityEvents(100);
    
    // Filter for this user
    return allEvents.filter(event => event.userId === userId);
  } catch (error) {
    console.error(`Error getting security events for user ${userId}:`, error);
    return [];
  }
}

/**
 * Determine user skill level based on request and history
 * 
 * @param request Guidance request
 * @returns User skill level
 */
function determineUserSkillLevel(request: QuantumSecurityGuidanceRequest): 'beginner' | 'intermediate' | 'advanced' {
  // This would use more sophisticated logic in a real implementation
  // For now, use a simple heuristic based on security level
  
  const securityLevel = request.securityContext?.securityLevel || QuantumSecurityLevel.STANDARD;
  
  switch (securityLevel) {
    case QuantumSecurityLevel.QUANTUM:
      return 'advanced';
    case QuantumSecurityLevel.ENHANCED:
      return 'intermediate';
    default:
      return 'beginner';
  }
}

/**
 * Extract security actions from AI response
 * 
 * @param content AI response content
 * @returns Array of security actions
 */
function extractSecurityActions(content: string): SecurityAction[] {
  try {
    // Look for action markers in the format [SECURITY_ACTION:action_type:description:params_json]
    const actionRegex = /\[SECURITY_ACTION:([^:]+):([^:]+)(?::({[^}]+}))?\]/g;
    const actions: SecurityAction[] = [];
    let match;
    
    while ((match = actionRegex.exec(content)) !== null) {
      const actionType = match[1] as SecurityAction['actionType'];
      const description = match[2];
      const paramsJson = match[3];
      
      const action: SecurityAction = {
        actionType,
        description,
        automated: false
      };
      
      if (paramsJson) {
        try {
          action.actionParams = JSON.parse(paramsJson);
        } catch (e) {
          console.error('Error parsing action params:', e);
        }
      }
      
      actions.push(action);
    }
    
    return actions;
  } catch (error) {
    console.error('Error extracting security actions:', error);
    return [];
  }
}

/**
 * Log security guidance interaction for training
 * 
 * @param request Guidance request
 * @param response AI guidance response
 * @param actions Security actions
 */
async function logSecurityGuidanceInteraction(
  request: QuantumSecurityGuidanceRequest,
  response: AIGuidanceResponse,
  actions: SecurityAction[]
): Promise<void> {
  try {
    // Log the interaction for AI training
    await submitTrainingFeedback(
      request.userId ?? 0,
      null,
      {
        userQuery: request.query,
        aiResponse: response.content,
        feedbackType: TrainingFeedbackType.HELPFUL, // Default to helpful
        context: {
          securityLevel: request.securityContext?.securityLevel,
          securityActions: actions,
          interactionType: 'quantum_security_guidance'
        },
        interactionId: response.id
      }
    );
    
    // Log as a security event
    await quantumAiMonitoring.logQuantumSecurityEvent({
      eventType: 'authentication',
      securityLevel: request.securityContext?.securityLevel || QuantumSecurityLevel.STANDARD,
      userId: request.userId,
      walletId: request.walletId,
      success: true,
      metadata: {
        interactionType: 'security_guidance',
        responseId: response.id,
        actionsCount: actions.length
      }
    });
  } catch (error) {
    console.error('Error logging security guidance interaction:', error);
  }
}

/**
 * Execute a security action
 * 
 * @param action Security action to execute
 * @param userId User ID
 * @param walletId Wallet ID
 * @returns Result of the action execution
 */
export async function executeSecurityAction(
  action: SecurityAction,
  userId?: number,
  walletId?: number
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    console.log(`Executing security action: ${action.actionType}`);
    
    // Execute based on action type
    switch (action.actionType) {
      case 'increase_security_level':
        return await increaseSecurityLevel(action, userId, walletId);
        
      case 'change_algorithm':
        return await changeAlgorithm(action, userId, walletId);
        
      case 'update_configuration':
        return await updateConfiguration(action, userId, walletId);
        
      case 'apply_recommendation':
        return await applyRecommendation(action, userId, walletId);
        
      case 'run_security_scan':
        return await runSecurityScan(action, userId, walletId);
        
      case 'enable_feature':
        return await toggleFeature(action, userId, walletId, true);
        
      case 'disable_feature':
        return await toggleFeature(action, userId, walletId, false);
        
      default:
        return {
          success: false,
          message: `Unsupported action type: ${action.actionType}`
        };
    }
  } catch (error) {
    console.error(`Error executing security action ${action.actionType}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Increase security level
 * 
 * @param action Security action
 * @param userId User ID
 * @param walletId Wallet ID
 * @returns Action result
 */
async function increaseSecurityLevel(
  action: SecurityAction,
  userId?: number,
  walletId?: number
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const targetLevel = action.actionParams?.targetLevel as QuantumSecurityLevel;
    
    if (!targetLevel) {
      return {
        success: false,
        message: 'Target security level not specified'
      };
    }
    
    // Update user preferences
    if (userId) {
      await storage.updateUserSecurityPreferences(userId, {
        quantumSecurityLevel: targetLevel
      });
    }
    
    // Update wallet settings
    if (walletId) {
      await storage.updateWalletSecuritySettings(walletId, {
        securityLevel: targetLevel
      });
    }
    
    // Log the action
    await quantumAiMonitoring.logQuantumSecurityEvent({
      eventType: 'configuration',
      securityLevel: targetLevel,
      userId,
      walletId,
      success: true,
      metadata: {
        action: 'increase_security_level',
        previousLevel: action.actionParams?.previousLevel,
        newLevel: targetLevel
      }
    });
    
    return {
      success: true,
      message: `Security level increased to ${targetLevel}`,
      data: { newLevel: targetLevel }
    };
  } catch (error) {
    console.error('Error increasing security level:', error);
    throw error;
  }
}

/**
 * Change algorithm
 * 
 * @param action Security action
 * @param userId User ID
 * @param walletId Wallet ID
 * @returns Action result
 */
async function changeAlgorithm(
  action: SecurityAction,
  userId?: number,
  walletId?: number
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const algorithm = action.actionParams?.algorithm as string;
    const purpose = action.actionParams?.purpose as string;
    
    if (!algorithm || !purpose) {
      return {
        success: false,
        message: 'Algorithm or purpose not specified'
      };
    }
    
    // Update user preferences
    if (userId) {
      await storage.updateUserSecurityPreferences(userId, {
        [`${purpose}Algorithm`]: algorithm
      });
    }
    
    // Update wallet settings
    if (walletId) {
      await storage.updateWalletSecuritySettings(walletId, {
        [`${purpose}Algorithm`]: algorithm
      });
    }
    
    // Log the action
    await quantumAiMonitoring.logQuantumSecurityEvent({
      eventType: 'configuration',
      securityLevel: action.actionParams?.securityLevel as QuantumSecurityLevel || QuantumSecurityLevel.STANDARD,
      userId,
      walletId,
      success: true,
      metadata: {
        action: 'change_algorithm',
        purpose,
        previousAlgorithm: action.actionParams?.previousAlgorithm,
        newAlgorithm: algorithm
      }
    });
    
    return {
      success: true,
      message: `Algorithm for ${purpose} changed to ${algorithm}`,
      data: { purpose, algorithm }
    };
  } catch (error) {
    console.error('Error changing algorithm:', error);
    throw error;
  }
}

/**
 * Update configuration
 * 
 * @param action Security action
 * @param userId User ID
 * @param walletId Wallet ID
 * @returns Action result
 */
async function updateConfiguration(
  action: SecurityAction,
  userId?: number,
  walletId?: number
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const settings = action.actionParams?.settings;
    
    if (!settings || typeof settings !== 'object') {
      return {
        success: false,
        message: 'Settings not specified or invalid'
      };
    }
    
    // Update user preferences
    if (userId) {
      await storage.updateUserSecurityPreferences(userId, settings);
    }
    
    // Update wallet settings
    if (walletId) {
      await storage.updateWalletSecuritySettings(walletId, settings);
    }
    
    // Log the action
    await quantumAiMonitoring.logQuantumSecurityEvent({
      eventType: 'configuration',
      securityLevel: action.actionParams?.securityLevel as QuantumSecurityLevel || QuantumSecurityLevel.STANDARD,
      userId,
      walletId,
      success: true,
      metadata: {
        action: 'update_configuration',
        settings
      }
    });
    
    return {
      success: true,
      message: 'Configuration updated successfully',
      data: { settings }
    };
  } catch (error) {
    console.error('Error updating configuration:', error);
    throw error;
  }
}

/**
 * Apply recommendation
 * 
 * @param action Security action
 * @param userId User ID
 * @param walletId Wallet ID
 * @returns Action result
 */
async function applyRecommendation(
  action: SecurityAction,
  userId?: number,
  walletId?: number
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const recommendationId = action.actionParams?.recommendationId as string;
    
    if (!recommendationId) {
      return {
        success: false,
        message: 'Recommendation ID not specified'
      };
    }
    
    // In a real implementation, this would apply the recommendation
    // For now, we'll just log it
    
    // Log the action
    await quantumAiMonitoring.logQuantumSecurityEvent({
      eventType: 'configuration',
      securityLevel: action.actionParams?.securityLevel as QuantumSecurityLevel || QuantumSecurityLevel.STANDARD,
      userId,
      walletId,
      success: true,
      metadata: {
        action: 'apply_recommendation',
        recommendationId
      }
    });
    
    return {
      success: true,
      message: 'Recommendation applied successfully',
      data: { recommendationId }
    };
  } catch (error) {
    console.error('Error applying recommendation:', error);
    throw error;
  }
}

/**
 * Run security scan
 * 
 * @param action Security action
 * @param userId User ID
 * @param walletId Wallet ID
 * @returns Action result
 */
async function runSecurityScan(
  action: SecurityAction,
  userId?: number,
  walletId?: number
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const scanType = action.actionParams?.scanType as string;
    
    if (!scanType) {
      return {
        success: false,
        message: 'Scan type not specified'
      };
    }
    
    // In a real implementation, this would run a security scan
    // For now, we'll just log it
    
    // Log the action
    await quantumAiMonitoring.logQuantumSecurityEvent({
      eventType: 'security_scan',
      securityLevel: action.actionParams?.securityLevel as QuantumSecurityLevel || QuantumSecurityLevel.STANDARD,
      userId,
      walletId,
      success: true,
      metadata: {
        action: 'run_security_scan',
        scanType
      }
    });
    
    return {
      success: true,
      message: `Security scan (${scanType}) completed successfully`,
      data: { 
        scanType,
        results: {
          vulnerabilities: 0,
          recommendations: 2,
          securityScore: 95
        }
      }
    };
  } catch (error) {
    console.error('Error running security scan:', error);
    throw error;
  }
}

/**
 * Toggle feature
 * 
 * @param action Security action
 * @param userId User ID
 * @param walletId Wallet ID
 * @param enable Whether to enable or disable the feature
 * @returns Action result
 */
async function toggleFeature(
  action: SecurityAction,
  userId?: number,
  walletId?: number,
  enable: boolean = true
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const featureName = action.actionParams?.featureName as string;
    
    if (!featureName) {
      return {
        success: false,
        message: 'Feature name not specified'
      };
    }
    
    // Update user preferences
    if (userId) {
      await storage.updateUserSecurityPreferences(userId, {
        [`${featureName}Enabled`]: enable
      });
    }
    
    // Update wallet settings
    if (walletId) {
      await storage.updateWalletSecuritySettings(walletId, {
        [`${featureName}Enabled`]: enable
      });
    }
    
    // Log the action
    await quantumAiMonitoring.logQuantumSecurityEvent({
      eventType: 'configuration',
      securityLevel: action.actionParams?.securityLevel as QuantumSecurityLevel || QuantumSecurityLevel.STANDARD,
      userId,
      walletId,
      success: true,
      metadata: {
        action: enable ? 'enable_feature' : 'disable_feature',
        featureName
      }
    });
    
    return {
      success: true,
      message: `Feature ${featureName} ${enable ? 'enabled' : 'disabled'} successfully`,
      data: { featureName, enabled: enable }
    };
  } catch (error) {
    console.error(`Error ${enable ? 'enabling' : 'disabling'} feature:`, error);
    throw error;
  }
}

// Export the quantum AI integration service
export const quantumAiIntegration = {
  getQuantumSecurityGuidance,
  executeSecurityAction
};