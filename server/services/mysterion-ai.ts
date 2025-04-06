import { OpenAI } from 'openai';
import { retrieveApiKey } from './quantum-vault';
import { storage } from '../storage';
import { createHash } from 'crypto';

// This service acts as a frontend to distributed OpenAI integration
// It selects the appropriate API key, handles usage logging, and manages contribution metrics

type MysterionOptions = {
  userId: number;
  contributorId?: number; // For tracking who contributed the API key
  systemPrompt?: string;
  modelName?: string;
  maxTokens?: number;
  temperature?: number;
};

type MysterionResponse = {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  success: boolean;
  error?: string;
  points?: number;
};

// Cache OpenAI clients to avoid creating a new client for each request
const openaiClients: Record<string, OpenAI> = {};

/**
 * Create a unique identifier for an OpenAI instance based on API key
 * We don't store the API key directly, but use a hash to identify unique clients
 */
const getClientKey = (apiKey: string): string => {
  return createHash('sha256').update(apiKey).digest('hex').substring(0, 16);
};

/**
 * Get or create an OpenAI client for the given API key
 */
const getOpenAIClient = (apiKey: string): OpenAI => {
  const clientKey = getClientKey(apiKey);
  
  if (!openaiClients[clientKey]) {
    openaiClients[clientKey] = new OpenAI({
      apiKey,
    });
  }
  
  return openaiClients[clientKey];
};

/**
 * Find the next available API key from the user's own keys or the distributed network
 * Uses a fair round-robin selection from active, training-enabled keys
 */
const selectNextApiKey = async (userId: number): Promise<{ apiKey: string; keyRecord: any } | null> => {
  try {
    // First try to get user's own keys
    const userKeys = await storage.getUserApiKeysByService(userId, 'openai');
    
    // Filter for active and training-enabled keys
    const activeKeys = userKeys.filter(key => key.isActive && key.isTrainingEnabled);
    
    if (activeKeys.length > 0) {
      // Simple round-robin by using the least recently used key
      const sortedKeys = [...activeKeys].sort((a, b) => {
        const aDate = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
        const bDate = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
        return aDate - bDate; // Oldest first
      });
      
      const selectedKey = sortedKeys[0];
      
      // Retrieve the actual API key from the vault
      if (selectedKey.vaultKeyId) {
        const { apiKey, isSuccess } = await retrieveApiKey(userId, selectedKey.vaultKeyId);
        
        if (isSuccess && apiKey) {
          return { apiKey, keyRecord: selectedKey };
        }
      }
    }
    
    // If no valid key found for the user, we could implement a feature to use
    // other network participants' keys with proper permissions and tracking
    
    return null;
  } catch (error) {
    console.error('Error selecting API key:', error);
    return null;
  }
};

/**
 * Log the usage of an API key for training contributions
 */
const logApiKeyUsage = async (
  keyId: number,
  userId: number,
  contributorId: number,
  promptTokens: number,
  completionTokens: number,
  totalTokens: number
): Promise<number> => {
  try {
    // First increment the usage count
    await storage.incrementUserApiKeyUsage(keyId);
    
    // Calculate contribution points
    // This could use any formula, but here we use a simple calculation based on tokens
    const basePoints = totalTokens / 100; // 1 point per 100 tokens
    const points = Math.max(1, Math.round(basePoints)); // Minimum 1 point
    
    // Log the training contribution
    const trainingData = await storage.createMysterionTrainingData({
      apiKeyId: keyId,
      userId,
      contributorId,
      promptTokens,
      completionTokens,
      totalTokens,
      points,
      status: 'completed',
      notes: `Training contribution using key #${keyId}`
    });
    
    return trainingData.points;
  } catch (error) {
    console.error('Error logging API key usage:', error);
    return 0;
  }
};

/**
 * Generate a response using the Mysterion AI network
 */
export const generateResponse = async (
  messages: { role: string; content: string }[],
  options: MysterionOptions
): Promise<MysterionResponse> => {
  try {
    // Select the next API key to use
    const keySelection = await selectNextApiKey(options.userId);
    
    if (!keySelection) {
      return {
        content: '',
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        success: false,
        error: 'No valid API key available. Please add your OpenAI API key to contribute to the network.'
      };
    }
    
    const { apiKey, keyRecord } = keySelection;
    const contributorId = keyRecord.userId; // The owner of the API key
    
    // Create the OpenAI client
    const openai = getOpenAIClient(apiKey);
    
    // Prepare the messages array, including the system prompt if provided
    const requestMessages = [...messages];
    if (options.systemPrompt) {
      requestMessages.unshift({
        role: 'system',
        content: options.systemPrompt
      });
    }
    
    // Make the API request
    const response = await openai.chat.completions.create({
      model: options.modelName || 'gpt-3.5-turbo',
      messages: requestMessages,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
    });
    
    // Extract the response content
    const content = response.choices[0]?.message?.content || '';
    
    // Extract usage
    const usage = {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0
    };
    
    // Log the API key usage and calculate points
    const points = await logApiKeyUsage(
      keyRecord.id,
      options.userId,
      contributorId,
      usage.promptTokens,
      usage.completionTokens,
      usage.totalTokens
    );
    
    return {
      content,
      usage,
      success: true,
      points
    };
  } catch (error) {
    console.error('Error generating response from Mysterion AI:', error);
    
    return {
      content: '',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Get the total contribution points for a user
 */
export const getUserContributionPoints = async (userId: number): Promise<number> => {
  try {
    // Get all the user's API keys
    const userKeys = await storage.getUserApiKeysByService(userId, 'openai');
    let totalPoints = 0;
    
    // Sum up points from all training records for each key
    for (const key of userKeys) {
      const trainingRecords = await storage.getMysterionTrainingDataByApiKeyId(key.id);
      const keyPoints = trainingRecords.reduce((sum, record) => sum + (record.points || 0), 0);
      totalPoints += keyPoints;
    }
    
    return totalPoints;
  } catch (error) {
    console.error('Error getting user contribution points:', error);
    return 0;
  }
};