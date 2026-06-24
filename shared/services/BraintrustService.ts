// BraintrustService.ts
import { Eval } from 'braintrust';
import { LevenshteinScorer } from 'autoevals';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define types for our service
export interface EvaluationData {
  input: any;
  expected: any;
}

export interface EvaluationOptions {
  name: string;
  dataset: EvaluationData[];
  taskFn: (input: any) => Promise<any>;
  scorers?: any[];
}

export interface EvaluationResult {
  url: string;
  scores: any;
  // Add other properties as needed
}

/**
 * Service for handling Braintrust evaluations
 */
export class BraintrustService {
  private apiKey: string;

  constructor() {
    // Get API key from environment variable
    this.apiKey = process.env.BRAINTRUST_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('BRAINTRUST_API_KEY not found in environment variables');
      console.warn('Please set it in your .env file (never commit this file to Git)');
    } else {
      // Log only that we found the key, never log the actual key
      console.log('BRAINTRUST_API_KEY found in environment variables');
    }
  }

  /**
   * Check if the service is properly configured
   */
  public isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  /**
   * Run a Braintrust evaluation
   */
  public async runEvaluation(options: EvaluationOptions): Promise<EvaluationResult> {
    if (!this.isConfigured()) {
      throw new Error('Braintrust service is not properly configured. Missing API key.');
    }

    try {
      const result = await Eval(options.name, {
        data: () => options.dataset,
        task: options.taskFn,
        scores: options.scorers || [LevenshteinScorer],
      });
      
      console.log(`Evaluation "${options.name}" completed successfully`);
      console.log(`View results at: ${result.url}`);
      
      return result;
    } catch (error) {
      console.error('Error running Braintrust evaluation:', error);
      throw error;
    }
  }

  /**
   * Run a batch of evaluations
   */
  public async runBatchEvaluations(evaluations: EvaluationOptions[]): Promise<EvaluationResult[]> {
    const results: EvaluationResult[] = [];
    
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
}

// Export a singleton instance
export const braintrustService = new BraintrustService();

// Export default for convenience
export default braintrustService;