/**
 * AI Guidance Service
 * Provides OpenAI integration for wallet guidance and user assistance
 */
import OpenAI from "openai";
import { z } from 'zod';

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define schema for the AI guidance request
export const aiGuidanceRequestSchema = z.object({
  userId: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string()
    })
  ),
  context: z
    .object({
      walletContext: z
        .object({
          walletBalances: z.record(z.string(), z.number()).optional(),
          recentTransactions: z.array(z.any()).optional(),
          userPreferences: z.record(z.string(), z.any()).optional()
        })
        .optional(),
      screenContext: z.string().optional(),
      userSkillLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional()
    })
    .optional()
});

// Define the response type
export type AIGuidanceResponse = {
  id: string;
  content: string;
  timestamp: number;
  suggestedActions?: {
    actionType: string;
    actionText: string;
    actionData?: any;
  }[];
};

/**
 * Process an AI guidance request
 * @param requestData Validated request data 
 * @returns AI guidance response
 */
export async function processAIGuidanceRequest(
  requestData: z.infer<typeof aiGuidanceRequestSchema>
): Promise<AIGuidanceResponse> {
  const { userId, messages, context } = requestData;
  
  try {
    // Add context information to the system message if available
    let systemMessage = messages.find(msg => msg.role === 'system');
    
    if (systemMessage && context) {
      let contextInfo = '';
      
      if (context.walletContext) {
        const balancesText = context.walletContext.walletBalances 
          ? Object.entries(context.walletContext.walletBalances)
              .map(([token, amount]) => `${token}: ${amount}`)
              .join(', ')
          : 'None';
        
        contextInfo += `\nUser wallet balances: ${balancesText}\n`;
        
        if (context.walletContext.recentTransactions?.length) {
          contextInfo += `Recent transactions: ${context.walletContext.recentTransactions.length} transactions\n`;
        }
      }
      
      if (context.screenContext) {
        contextInfo += `Current screen: ${context.screenContext}\n`;
      }
      
      if (context.userSkillLevel) {
        contextInfo += `User skill level: ${context.userSkillLevel}\n`;
      }
      
      // Append the context to the system message
      systemMessage.content += contextInfo;
    }
    
    // Call OpenAI API
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      temperature: 0.7,
      max_tokens: 500,
    });
    
    // Extract suggested actions if there are any in the response
    // This uses a pattern to detect actions in the format [ACTION:action_type:action_text:action_data]
    const content = response.choices[0].message.content || '';
    const suggestedActions = extractSuggestedActions(content);
    
    // Clean content by removing the action markers
    const cleanedContent = removeSuggestedActionMarkers(content);
    
    return {
      id: response.id,
      content: cleanedContent,
      timestamp: Date.now(),
      suggestedActions
    };
  } catch (error) {
    console.error('Error processing AI guidance request:', error);
    
    // Provide a fallback response if OpenAI fails
    return {
      id: `fallback-${Date.now()}`,
      content: "I'm here to help you navigate your quantum-resistant wallet. " +
               "What aspect would you like to learn more about?",
      timestamp: Date.now(),
      suggestedActions: [
        {
          actionType: 'NAVIGATE',
          actionText: 'Learn about quantum security',
          actionData: { screen: 'security' }
        },
        {
          actionType: 'NAVIGATE',
          actionText: 'View wallet features',
          actionData: { screen: 'features' }
        }
      ]
    };
  }
}

/**
 * Extract suggested actions from content using regex
 * @param content Text content with action markers
 * @returns Array of suggested actions
 */
function extractSuggestedActions(content: string): AIGuidanceResponse['suggestedActions'] {
  const actionRegex = /\[ACTION:([^:]+):([^:]+)(?::([^\]]+))?\]/g;
  const actions: AIGuidanceResponse['suggestedActions'] = [];
  let match;
  
  while ((match = actionRegex.exec(content)) !== null) {
    actions.push({
      actionType: match[1],
      actionText: match[2],
      actionData: match[3] ? JSON.parse(match[3]) : undefined
    });
  }
  
  return actions.length > 0 ? actions : undefined;
}

/**
 * Remove action markers from content
 * @param content Text content with action markers
 * @returns Cleaned content
 */
function removeSuggestedActionMarkers(content: string): string {
  return content.replace(/\[ACTION:[^\]]+\]/g, '').trim();
}