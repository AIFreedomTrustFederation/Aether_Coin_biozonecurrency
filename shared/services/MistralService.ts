// MistralService.ts
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define types for our service
export interface MistralCompletionOptions {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
}

export interface MistralCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    text: string;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Service for handling Mistral AI API interactions
 */
export class MistralService {
  private apiKey: string;
  private baseUrl: string = 'https://api.mistral.ai/v1';

  constructor() {
    // Get API key from environment variable
    this.apiKey = process.env.MISTRAL_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('MISTRAL_API_KEY not found in environment variables');
      console.warn('Please set it in your .env file (never commit this file to Git)');
    } else {
      // Log only that we found the key, never log the actual key
      console.log('MISTRAL_API_KEY found in environment variables');
    }
  }

  /**
   * Check if the service is properly configured
   */
  public isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  /**
   * Set API key programmatically
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Get a completion from Mistral AI
   */
  public async getCompletion(options: MistralCompletionOptions): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Mistral service is not properly configured. Missing API key.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: options.model || 'mistral-small-latest',
          prompt: options.prompt,
          max_tokens: options.maxTokens || 100,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 1,
          stream: options.stream || false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Mistral API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json() as MistralCompletionResponse;
      return data.choices[0].text;
    } catch (error) {
      console.error('Error calling Mistral API:', error);
      throw error;
    }
  }

  /**
   * Generate a chat completion
   */
  public async getChatCompletion(messages: Array<{role: string, content: string}>, options: Omit<MistralCompletionOptions, 'prompt'> = {}): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Mistral service is not properly configured. Missing API key.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: options.model || 'mistral-small-latest',
          messages,
          max_tokens: options.maxTokens || 100,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 1,
          stream: options.stream || false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Mistral API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling Mistral Chat API:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const mistralService = new MistralService();

// Export default for convenience
export default mistralService;