"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiGuidanceRequestSchema = void 0;
exports.processAIGuidanceRequest = processAIGuidanceRequest;
/**
 * AI Guidance Service
 * Provides OpenAI integration for wallet guidance and user assistance
 */
const openai_1 = __importDefault(require("openai"));
const zod_1 = require("zod");
// Initialize OpenAI client with API key from environment variables
const openai = new openai_1.default({ apiKey: process.env.OPENAI_API_KEY });
// Define schema for the AI guidance request
exports.aiGuidanceRequestSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    messages: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'assistant', 'system']),
        content: zod_1.z.string()
    })),
    context: zod_1.z
        .object({
        walletContext: zod_1.z
            .object({
            walletBalances: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).optional(),
            recentTransactions: zod_1.z.array(zod_1.z.any()).optional(),
            userPreferences: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional()
        })
            .optional(),
        screenContext: zod_1.z.string().optional(),
        userSkillLevel: zod_1.z.enum(['beginner', 'intermediate', 'advanced']).optional()
    })
        .optional()
});
/**
 * Process an AI guidance request
 * @param requestData Validated request data
 * @returns AI guidance response
 */
async function processAIGuidanceRequest(requestData) {
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
    }
    catch (error) {
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
function extractSuggestedActions(content) {
    const actionRegex = /\[ACTION:([^:]+):([^:]+)(?::([^\]]+))?\]/g;
    const actions = [];
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
function removeSuggestedActionMarkers(content) {
    return content.replace(/\[ACTION:[^\]]+\]/g, '').trim();
}
