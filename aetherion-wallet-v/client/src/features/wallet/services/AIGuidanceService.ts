/**
 * AIGuidanceService.ts
 * 
 * Service to handle AI-related interactions for wallet guidance and onboarding.
 * Routes requests through organization ID instead of directly to OpenAI.
 */

// Define API types
type AIGuidanceRequest = {
  userId: string;
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  context?: {
    walletContext?: {
      walletBalances: Record<string, number>;
      recentTransactions: any[];
      userPreferences: Record<string, any>;
    };
    screenContext?: string;
    userSkillLevel?: 'beginner' | 'intermediate' | 'advanced';
  };
};

type AIGuidanceResponse = {
  id: string;
  content: string;
  timestamp: number;
  suggestedActions?: {
    actionType: string;
    actionText: string;
    actionData?: any;
  }[];
};

export class AIGuidanceService {
  private static instance: AIGuidanceService;
  private organizationId: string = 'org-zOaBdbMeIgIYrLabop4nvAu'; // Default org ID
  private endpointUrl: string = '/api/ai/guidance';
  private userId: string = 'user-1'; // Default user ID
  
  constructor() {
    // Initialize with default values
    // Listen for auth events to update user ID
    window.addEventListener('auth:login', (event: Event) => {
      const customEvent = event as CustomEvent<{userId: string}>;
      this.userId = customEvent.detail.userId;
    });
  }
  
  public static getInstance(): AIGuidanceService {
    if (!AIGuidanceService.instance) {
      AIGuidanceService.instance = new AIGuidanceService();
    }
    return AIGuidanceService.instance;
  }
  
  /**
   * Set organization ID for API requests
   */
  public setOrganizationId(orgId: string): void {
    this.organizationId = orgId;
  }
  
  /**
   * Set user ID for tracking and personalization
   */
  public setUserId(userId: string): void {
    this.userId = userId;
  }
  
  /**
   * Get personalized guidance response for wallet onboarding
   */
  public async getOnboardingGuidance(
    userQuery: string, 
    previousMessages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [],
    context?: AIGuidanceRequest['context']
  ): Promise<AIGuidanceResponse> {
    const systemPrompt = {
      role: 'system' as const,
      content: 'You are an AI assistant for Aetherion quantum-resistant wallet. ' +
        'Provide concise, helpful guidance about wallet features. ' +
        'Focus on security, usability, and quantum-resistant aspects. ' +
        'If appropriate, suggest actions the user can take.'
    };
    
    const messages = [
      systemPrompt,
      ...previousMessages,
      { role: 'user' as const, content: userQuery }
    ];
    
    try {
      const requestBody: AIGuidanceRequest = {
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
      return data as AIGuidanceResponse;
    } catch (error) {
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
  public async getFeatureHelp(
    feature: string, 
    userSkillLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  ): Promise<AIGuidanceResponse> {
    const userQuery = `Explain the ${feature} feature in the wallet`;
    
    return this.getOnboardingGuidance(userQuery, [], {
      screenContext: feature,
      userSkillLevel
    });
  }
  
  /**
   * Answer a specific wallet-related question
   */
  public async answerWalletQuestion(
    question: string,
    walletContext?: AIGuidanceRequest['context']['walletContext']
  ): Promise<AIGuidanceResponse> {
    const context: AIGuidanceRequest['context'] = {};
    if (walletContext) {
      context.walletContext = walletContext;
    }
    return this.getOnboardingGuidance(question, [], context);
  }
}

export default AIGuidanceService.getInstance();