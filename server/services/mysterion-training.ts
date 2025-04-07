/**
 * Mysterion AI Training Service
 * 
 * This service handles the processing of AI training data from users,
 * evaluates contributions, and awards SING tokens as rewards.
 */

import { storage } from '../storage';
import { 
  TrainingFeedbackType, 
  TrainingProcessingStatus,
  InsertAiTrainingData,
  InsertAiTrainingContributor
} from '@shared/schema';
import crypto from 'crypto';

// Constants for reward calculation
const BASE_POINTS = {
  [TrainingFeedbackType.HELPFUL]: 5,
  [TrainingFeedbackType.NOT_HELPFUL]: 3,
  [TrainingFeedbackType.INCORRECT]: 4,
  [TrainingFeedbackType.OFFENSIVE]: 2,
  [TrainingFeedbackType.OTHER]: 1
};

// Constants for contributor tiers
const CONTRIBUTOR_TIERS = {
  BRONZE: { name: 'bronze', minPoints: 0, singTokenRate: 0.1 },
  SILVER: { name: 'silver', minPoints: 100, singTokenRate: 0.15 },
  GOLD: { name: 'gold', minPoints: 500, singTokenRate: 0.2 },
  PLATINUM: { name: 'platinum', minPoints: 2000, singTokenRate: 0.25 }
};

// Helper to calculate tier based on points
const calculateTierFromPoints = (points: number): string => {
  if (points >= CONTRIBUTOR_TIERS.PLATINUM.minPoints) return CONTRIBUTOR_TIERS.PLATINUM.name;
  if (points >= CONTRIBUTOR_TIERS.GOLD.minPoints) return CONTRIBUTOR_TIERS.GOLD.name;
  if (points >= CONTRIBUTOR_TIERS.SILVER.minPoints) return CONTRIBUTOR_TIERS.SILVER.name;
  return CONTRIBUTOR_TIERS.BRONZE.name;
};

// Helper to get token conversion rate based on tier
const getTokenConversionRate = (tier: string): number => {
  switch (tier) {
    case CONTRIBUTOR_TIERS.PLATINUM.name: return CONTRIBUTOR_TIERS.PLATINUM.singTokenRate;
    case CONTRIBUTOR_TIERS.GOLD.name: return CONTRIBUTOR_TIERS.GOLD.singTokenRate;
    case CONTRIBUTOR_TIERS.SILVER.name: return CONTRIBUTOR_TIERS.SILVER.singTokenRate;
    default: return CONTRIBUTOR_TIERS.BRONZE.singTokenRate;
  }
};

// Helper to calculate data size in bytes
const calculateDataSizeBytes = (data: InsertAiTrainingData): number => {
  const userQueryBytes = Buffer.byteLength(data.userQuery, 'utf8');
  const aiResponseBytes = Buffer.byteLength(data.aiResponse, 'utf8');
  const feedbackDetailsBytes = data.feedbackDetails ? Buffer.byteLength(data.feedbackDetails, 'utf8') : 0;
  const contextBytes = data.context ? Buffer.byteLength(JSON.stringify(data.context), 'utf8') : 0;
  
  return userQueryBytes + aiResponseBytes + feedbackDetailsBytes + contextBytes;
};

// Helper to generate a hash for deduplication
const generateDataHash = (data: InsertAiTrainingData): string => {
  const hashInput = `${data.userQuery}:${data.aiResponse}:${data.feedbackType}`;
  return crypto.createHash('sha256').update(hashInput).digest('hex');
};

// Helper to calculate points based on feedback type and quality
const calculateBasePoints = (
  feedbackType: TrainingFeedbackType, 
  qualityRating?: number | null, 
  dataSize?: number
): number => {
  let points = BASE_POINTS[feedbackType] || 1;
  
  // Adjust based on quality rating if provided
  if (qualityRating) {
    points *= (qualityRating / 3); // Normalize by average rating
  }
  
  // Bonus for detailed feedback (based on data size)
  if (dataSize && dataSize > 1000) {
    points += Math.min(5, Math.floor(dataSize / 1000));
  }
  
  return Math.round(points);
};

/**
 * Submit feedback for AI training
 */
export const submitTrainingFeedback = async (
  userId: number,
  apiKeyId: number | null,
  feedback: {
    userQuery: string;
    aiResponse: string;
    feedbackType: TrainingFeedbackType;
    feedbackDetails?: string;
    qualityRating?: number;
    context?: Record<string, any>;
    interactionId?: string;
  }
): Promise<{ success: boolean; message: string; data?: any; error?: any }> => {
  try {
    // Create training data record
    const trainingData: InsertAiTrainingData = {
      userId,
      userApiKeyId: apiKeyId,
      userQuery: feedback.userQuery,
      aiResponse: feedback.aiResponse,
      feedbackType: feedback.feedbackType,
      feedbackDetails: feedback.feedbackDetails,
      qualityRating: feedback.qualityRating,
      context: feedback.context,
      interactionId: feedback.interactionId,
      dataSizeBytes: 0, // Will be calculated
      dataHash: '', // Will be generated
      processingStatus: TrainingProcessingStatus.QUEUED
    };
    
    // Calculate data size
    trainingData.dataSizeBytes = calculateDataSizeBytes(trainingData);
    
    // Generate hash for deduplication
    trainingData.dataHash = generateDataHash(trainingData);
    
    // Save training data
    const savedData = await storage.createAiTrainingData(trainingData);
    
    // Process contributor profile/stats
    if (userId) {
      await updateContributorStats(userId, savedData.id, trainingData);
    }
    
    // Queue for further processing
    setTimeout(() => {
      processTrainingData(savedData.id).catch(err => {
        console.error(`Error processing training data ${savedData.id}:`, err);
      });
    }, 100);
    
    return {
      success: true,
      message: 'Thank you for your feedback! Your contribution helps improve Mysterion AI.',
      data: {
        id: savedData.id,
        status: savedData.processingStatus
      }
    };
  } catch (error) {
    console.error('Error submitting training feedback:', error);
    return {
      success: false,
      message: 'Failed to submit training feedback',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Update contributor statistics after a new contribution
 */
const updateContributorStats = async (
  userId: number,
  trainingDataId: number,
  trainingData: InsertAiTrainingData
): Promise<void> => {
  try {
    // Get existing contributor record or create new one
    let contributor = await storage.getAiTrainingContributorByUserId(userId);
    
    if (!contributor) {
      // Create new contributor record
      const newContributor: InsertAiTrainingContributor = {
        userId,
        totalContributions: 1,
        totalPointsEarned: 0, // Will calculate and update later
        totalSingTokens: 0,
        contributorTier: CONTRIBUTOR_TIERS.BRONZE.name
      };
      
      contributor = await storage.createAiTrainingContributor(newContributor);
    } else {
      // Update existing contributor stats
      await storage.updateAiTrainingContributor(
        contributor.id,
        contributor.totalContributions + 1,
        contributor.totalPointsEarned, // Unchanged until processed
        contributor.totalSingTokens // Unchanged until processed
      );
    }
  } catch (error) {
    console.error(`Error updating contributor stats for user ${userId}:`, error);
    // Don't throw error to prevent breaking the main flow
  }
};

/**
 * Process training data (called asynchronously after submission)
 */
const processTrainingData = async (trainingDataId: number): Promise<void> => {
  try {
    // Get training data record
    const data = await storage.getAiTrainingData(trainingDataId);
    if (!data) {
      throw new Error(`Training data with ID ${trainingDataId} not found`);
    }
    
    // Update status to processing
    await storage.updateAiTrainingDataStatus(
      trainingDataId,
      TrainingProcessingStatus.PROCESSING,
      'Initial quality evaluation in progress'
    );
    
    // Simple content validation
    if (!validateContentQuality(data.userQuery, data.aiResponse)) {
      await storage.updateAiTrainingDataStatus(
        trainingDataId,
        TrainingProcessingStatus.REJECTED,
        'Content quality does not meet minimum standards'
      );
      return;
    }
    
    // Mark as completed and calculate rewards
    await storage.updateAiTrainingDataStatus(
      trainingDataId,
      TrainingProcessingStatus.COMPLETED,
      'Successfully processed and rewards calculated'
    );
    
    // Calculate and award points
    await calculateAndAwardPoints(trainingDataId, data.userId);
    
  } catch (error) {
    console.error(`Error processing training data ${trainingDataId}:`, error);
    
    // Update status to failed
    await storage.updateAiTrainingDataStatus(
      trainingDataId,
      TrainingProcessingStatus.FAILED,
      `Processing error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Validate content quality with basic checks
 */
const validateContentQuality = (userQuery: string, aiResponse: string): boolean => {
  // Skip validation for empty content
  if (!userQuery || !aiResponse) {
    return false;
  }
  
  // Minimum length check
  if (userQuery.length < 5 || aiResponse.length < 20) {
    return false;
  }
  
  // Repetitive content check (e.g., duplicate characters)
  const repetitionThreshold = 0.7;
  if (hasExcessiveRepetition(userQuery, repetitionThreshold) || 
      hasExcessiveRepetition(aiResponse, repetitionThreshold)) {
    return false;
  }
  
  return true;
};

/**
 * Check for excessive repetition in text
 */
const hasExcessiveRepetition = (text: string, threshold: number): boolean => {
  const chars = text.split('');
  const charCount: Record<string, number> = {};
  
  chars.forEach(char => {
    charCount[char] = (charCount[char] || 0) + 1;
  });
  
  const mostFrequentChar = Object.entries(charCount)
    .sort((a, b) => b[1] - a[1])[0];
    
  return mostFrequentChar[1] / text.length > threshold;
};

/**
 * Calculate and award points for a training data contribution
 */
const calculateAndAwardPoints = async (
  trainingDataId: number,
  userId: number | null | undefined
): Promise<void> => {
  if (!userId) return; // Skip for anonymous contributions
  
  try {
    // Get training data record
    const data = await storage.getAiTrainingData(trainingDataId);
    if (!data) {
      throw new Error(`Training data with ID ${trainingDataId} not found`);
    }
    
    // Calculate base points
    let points = calculateBasePoints(
      data.feedbackType as TrainingFeedbackType,
      data.qualityRating,
      data.dataSizeBytes
    );
    
    // Get contributor record
    const contributor = await storage.getAiTrainingContributor(userId);
    if (!contributor) {
      throw new Error(`Contributor with user ID ${userId} not found`);
    }
    
    // Determine contributor tier
    const currentTier = contributor.contributorTier;
    const newTotalPoints = contributor.totalPointsEarned + points;
    const newTier = calculateTierFromPoints(newTotalPoints);
    
    // Update tier if changed
    if (currentTier !== newTier) {
      await storage.updateAiTrainingContributorTier(contributor.id, newTier);
    }
    
    // Calculate SING tokens
    const tokenRate = getTokenConversionRate(newTier);
    const singTokens = Math.floor(points * tokenRate);
    
    // Award points and tokens
    await storage.updateAiTrainingDataRewards(trainingDataId, points, singTokens);
    
    // Update contributor totals
    await storage.updateAiTrainingContributor(
      contributor.id,
      contributor.totalContributions,
      newTotalPoints,
      contributor.totalSingTokens + singTokens
    );
    
    // Refresh contributor rankings
    await updateContributorRankings();
    
  } catch (error) {
    console.error(`Error calculating rewards for training data ${trainingDataId}:`, error);
  }
};

/**
 * Update rankings for all contributors
 */
const updateContributorRankings = async (): Promise<void> => {
  try {
    // Get top contributors ordered by points
    const topContributors = await storage.getTopAiTrainingContributors(1000);
    
    // Update ranks
    for (let i = 0; i < topContributors.length; i++) {
      const rank = i + 1;
      await storage.updateAiTrainingContributorRank(topContributors[i].id, rank);
    }
  } catch (error) {
    console.error('Error updating contributor rankings:', error);
  }
};

/**
 * Get user's contribution statistics
 */
export const getUserContributionStats = async (
  userId: number
): Promise<{ success: boolean; stats?: any; error?: string }> => {
  try {
    // Get contributor record
    const contributor = await storage.getAiTrainingContributorByUserId(userId);
    if (!contributor) {
      return {
        success: true,
        stats: {
          totalContributions: 0,
          totalPointsEarned: 0,
          totalSingTokens: 0,
          contributorTier: CONTRIBUTOR_TIERS.BRONZE.name,
          contributorRank: null,
          lastContribution: null,
          recentContributions: []
        }
      };
    }
    
    // Get recent contributions
    const recentContributions = await storage.getAiTrainingDataByUserId(userId);
    
    return {
      success: true,
      stats: {
        totalContributions: contributor.totalContributions,
        totalPointsEarned: contributor.totalPointsEarned,
        totalSingTokens: contributor.totalSingTokens,
        contributorTier: contributor.contributorTier,
        contributorRank: contributor.contributorRank,
        lastContribution: contributor.lastContribution,
        recentContributions: recentContributions.slice(0, 10).map(c => ({
          id: c.id,
          date: c.contributionDate,
          feedbackType: c.feedbackType,
          pointsAwarded: c.pointsAwarded,
          singTokensAwarded: c.singTokensAwarded
        }))
      }
    };
  } catch (error) {
    console.error(`Error fetching contribution stats for user ${userId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

/**
 * Get leaderboard of top contributors
 */
export const getContributorLeaderboard = async (
  limit = 10
): Promise<{ success: boolean; leaderboard?: any[]; error?: string }> => {
  try {
    // Get top contributors
    const topContributors = await storage.getTopAiTrainingContributors(limit);
    
    // Format for display
    const leaderboard = await Promise.all(
      topContributors.map(async (contributor) => {
        // Get user info
        const user = await storage.getUser(contributor.userId);
        
        return {
          rank: contributor.contributorRank,
          userId: contributor.userId,
          username: user?.username || 'Anonymous',
          tier: contributor.contributorTier,
          totalPoints: contributor.totalPointsEarned,
          totalSingTokens: contributor.totalSingTokens,
          totalContributions: contributor.totalContributions
        };
      })
    );
    
    return {
      success: true,
      leaderboard
    };
  } catch (error) {
    console.error('Error fetching contributor leaderboard:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};