// run-ai-evaluation.js
import { aiEvaluationService } from '../shared/services/AIEvaluationService.js';
import { mistralService } from '../shared/services/MistralService.js';

// Sample task function that uses Mistral AI
async function mistralGreetingTask(input) {
  try {
    const prompt = `Generate a friendly greeting for a person named "${input}".`;
    const response = await mistralService.getCompletion({
      prompt,
      maxTokens: 50,
      temperature: 0.7
    });
    
    return response.trim();
  } catch (error) {
    console.error('Error in Mistral greeting task:', error);
    return `Hello ${input}`;
  }
}

// Simple task function
async function simpleGreetingTask(input) {
  return `Hello ${input}`;
}

// Run the evaluation
async function runEvaluation() {
  console.log('Available providers:', aiEvaluationService.getProviders());
  
  const dataset = [
    { input: 'John', expected: 'Hello John' },
    { input: 'Mary', expected: 'Hello Mary' },
    { input: 'Alex', expected: 'Hello Alex' },
    { input: 'Sarah', expected: 'Hello Sarah' }
  ];
  
  try {
    // Run with Braintrust
    console.log('Running evaluation with Braintrust...');
    const braintrustResult = await aiEvaluationService.runEvaluation({
      name: 'Greeting Bot Evaluation - Braintrust',
      dataset,
      taskFn: simpleGreetingTask,
      provider: 'braintrust',
      saveResults: true
    });
    
    console.log('Braintrust evaluation completed');
    
    // Run with Mistral if configured
    if (aiEvaluationService.isProviderConfigured('mistral')) {
      console.log('Running evaluation with Mistral...');
      const mistralResult = await aiEvaluationService.runEvaluation({
        name: 'Greeting Bot Evaluation - Mistral',
        dataset,
        taskFn: mistralGreetingTask,
        provider: 'mistral',
        saveResults: true
      });
      
      console.log('Mistral evaluation completed');
    } else {
      console.log('Mistral provider is not configured');
    }
    
    // Run with comparison
    console.log('Running evaluation with comparison...');
    const comparisonResult = await aiEvaluationService.runEvaluation({
      name: 'Greeting Bot Evaluation - Comparison',
      dataset,
      taskFn: simpleGreetingTask,
      provider: 'braintrust',
      compareWithMistral: true,
      saveResults: true
    });
    
    console.log('Comparison evaluation completed');
    
    console.log('All evaluations completed successfully');
  } catch (error) {
    console.error('Error running evaluations:', error);
  }
}

// Run the evaluation
runEvaluation();