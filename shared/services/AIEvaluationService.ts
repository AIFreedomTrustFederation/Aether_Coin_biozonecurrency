// AIEvaluationService.ts
import { braintrustService, EvaluationData, EvaluationOptions } from './BraintrustService';
import { mistralService } from './MistralService';
import { apiKeyManager } from '../utils/apiKeyManager';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// Load environment variables
dotenv.config();

// Define types for our service
export interface EvaluationProvider {
  name: string;
  isConfigured: () => boolean;
  runEvaluation: (options: any) => Promise<any>;
}

export interface AIEvaluationOptions extends EvaluationOptions {
  provider?: string;
  saveResults?: boolean;
  compareWithMistral?: boolean;
}

/**
 * Service for handling AI evaluations with multiple providers
 */
export class AIEvaluationService {
  private providers: Record<string, EvaluationProvider>;
  private resultsDir: string;

  constructor() {
    this.providers = {
      braintrust: braintrustService,
      mistral: {
        name: 'Mistral AI',
        isConfigured: () => mistralService.isConfigured(),
        runEvaluation: this.runMistralEvaluation.bind(this)
      }
    };
    
    this.resultsDir = path.join(process.cwd(), 'evaluation-results');
    this.ensureResultsDir();
    
    // Log available API keys (masked for security)
    const availableKeys = apiKeyManager.getAvailableKeys();
    console.log('Available API keys:', availableKeys.map(key => {
      const hasKey = apiKeyManager.hasKey(key);
      return `${key}: ${hasKey ? 'configured' : 'not configured'}`;
    }));
  }

  /**
   * Ensure the results directory exists
   */
  private async ensureResultsDir(): Promise<void> {
    try {
      await fs.mkdir(this.resultsDir, { recursive: true });
    } catch (error) {
      console.warn('Failed to create results directory:', error);
    }
  }

  /**
   * Get available providers
   */
  public getProviders(): string[] {
    return Object.keys(this.providers).filter(key => 
      this.providers[key].isConfigured()
    );
  }

  /**
   * Check if a provider is configured
   */
  public isProviderConfigured(providerName: string): boolean {
    const provider = this.providers[providerName.toLowerCase()];
    return provider ? provider.isConfigured() : false;
  }

  /**
   * Run an evaluation with Mistral AI
   */
  private async runMistralEvaluation(options: EvaluationOptions): Promise<any> {
    const { name, dataset, taskFn } = options;
    
    console.log(`Running Mistral evaluation: ${name}`);
    
    const results = [];
    let totalScore = 0;
    
    for (const item of dataset) {
      const output = await taskFn(item.input);
      
      // Simple exact match scoring
      const score = output === item.expected ? 1 : 0;
      totalScore += score;
      
      results.push({
        input: item.input,
        output,
        expected: item.expected,
        score
      });
    }
    
    const averageScore = dataset.length > 0 ? totalScore / dataset.length : 0;
    
    const result = {
      name,
      timestamp: new Date().toISOString(),
      averageScore,
      results,
      provider: 'mistral'
    };
    
    return result;
  }

  /**
   * Run an evaluation with the specified provider
   */
  public async runEvaluation(options: AIEvaluationOptions): Promise<any> {
    const providerName = (options.provider || 'braintrust').toLowerCase();
    const provider = this.providers[providerName];
    
    if (!provider) {
      throw new Error(`Provider '${providerName}' not found`);
    }
    
    if (!provider.isConfigured()) {
      throw new Error(`Provider '${providerName}' is not properly configured`);
    }
    
    const result = await provider.runEvaluation(options);
    
    // Save results if requested
    if (options.saveResults) {
      const filename = `${options.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`;
      const filePath = path.join(this.resultsDir, filename);
      
      try {
        // Sanitize the result to remove any potential API keys before saving
        const sanitizedResult = this.sanitizeResultForStorage(result);
        
        await fs.writeFile(filePath, JSON.stringify(sanitizedResult, null, 2));
        console.log(`Evaluation results saved to ${filePath}`);
      } catch (error) {
        console.error('Failed to save evaluation results:', error);
      }
    }
    
    // Compare with Mistral if requested
    if (options.compareWithMistral && providerName !== 'mistral' && this.isProviderConfigured('mistral')) {
      try {
        const mistralResult = await this.providers.mistral.runEvaluation(options);
        return {
          primaryResult: result,
          comparisonResult: mistralResult
        };
      } catch (error) {
        console.error('Failed to run comparison with Mistral:', error);
        return result;
      }
    }
    
    return result;
  }

  /**
   * Run a batch of evaluations
   */
  public async runBatchEvaluations(evaluations: AIEvaluationOptions[]): Promise<any[]> {
    const results = [];
    
    for (const evaluation of evaluations) {
      try {
        const result = await this.runEvaluation(evaluation);
        results.push(result);
      } catch (error) {
        console.error(`Failed to run evaluation "${evaluation.name}":`, error);
      }
    }
    
    return results;
  }
  
  /**
   * Sanitize results to remove any potential API keys or sensitive data
   */
  private sanitizeResultForStorage(data: any): any {
    if (!data) return data;
    
    // For strings, check if they might be API keys and mask them if needed
    if (typeof data === 'string') {
      // Check for common API key patterns (sk-, pk-, etc.)
      if (/^(sk|pk|api|key|token|secret)-[A-Za-z0-9]{10,}$/.test(data)) {
        return apiKeyManager.maskKey(data);
      }
      return data;
    }
    
    // For arrays, sanitize each element
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeResultForStorage(item));
    }
    
    // For objects, sanitize each property
    if (typeof data === 'object' && data !== null) {
      const sanitized: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(data)) {
        // Skip properties that might contain sensitive data
        if (['apiKey', 'api_key', 'key', 'secret', 'token', 'password', 'credential'].includes(key.toLowerCase())) {
          sanitized[key] = typeof value === 'string' ? apiKeyManager.maskKey(value as string) : '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeResultForStorage(value);
        }
      }
      
      return sanitized;
    }
    
    // Return other types as is
    return data;
  }
}

// Export a singleton instance
export const aiEvaluationService = new AIEvaluationService();

// Export default for convenience
export default aiEvaluationService;