"use strict";
/**
 * AIGuidanceService.ts
 *
 * Service to handle AI-related interactions for wallet guidance and onboarding.
 * Routes requests through organization ID instead of directly to OpenAI.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIGuidanceService = void 0;
class AIGuidanceService {
    constructor() {
        this.organizationId = 'org-zOaBdbMeIgIYrLabop4nvAu'; // Default org ID
        this.endpointUrl = '/api/ai/guidance';
        this.userId = 'user-1'; // Default user ID
        // Initialize with default values
        // Listen for auth events to update user ID
        window.addEventListener('auth:login', (event) => {
            const customEvent = event;
            this.userId = customEvent.detail.userId;
        });
    }
    static getInstance() {
        if (!AIGuidanceService.instance) {
            AIGuidanceService.instance = new AIGuidanceService();
        }
        return AIGuidanceService.instance;
    }
    /**
     * Set organization ID for API requests
     */
    setOrganizationId(orgId) {
        this.organizationId = orgId;
    }
    /**
     * Set user ID for tracking and personalization
     */
    setUserId(userId) {
        this.userId = userId;
    }
    /**
     * Get personalized guidance response for wallet onboarding
     */
    async getOnboardingGuidance(userQuery, previousMessages = [], context) {
        const systemPrompt = {
            role: 'system',
            content: 'You are an AI assistant for Aetherion quantum-resistant wallet. ' +
                'Provide concise, helpful guidance about wallet features. ' +
                'Focus on security, usability, and quantum-resistant aspects. ' +
                'If appropriate, suggest actions the user can take.'
        };
        const messages = [
            systemPrompt,
            ...previousMessages,
            { role: 'user', content: userQuery }
        ];
        try {
            const requestBody = {
                userId: this.userId,
                messages,
                context
            };
            const response = await fetch(this.endpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Organization-ID': this.organizationId
                },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                throw new Error(`Error communicating with AI service: ${response.status}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error('Error getting AI guidance:', error);
            // Fallback response if AI service is unavailable
            return {
                id: `fallback-${Date.now()}`,
                content: "I'm here to help you navigate your quantum-resistant wallet. What aspect would you like to learn more about?",
                timestamp: Date.now()
            };
        }
    }
    /**
     * Get contextual help for a specific feature or screen
     */
    async getFeatureHelp(feature, userSkillLevel = 'beginner') {
        const userQuery = `Explain the ${feature} feature in the wallet`;
        return this.getOnboardingGuidance(userQuery, [], {
            screenContext: feature,
            userSkillLevel
        });
    }
    /**
     * Answer a specific wallet-related question
     */
    async answerWalletQuestion(question, walletContext) {
        const context = {};
        if (walletContext) {
            context.walletContext = walletContext;
        }
        return this.getOnboardingGuidance(question, [], context);
    }
}
exports.AIGuidanceService = AIGuidanceService;
exports.default = AIGuidanceService.getInstance();
