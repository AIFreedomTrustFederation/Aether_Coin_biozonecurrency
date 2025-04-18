// braintrust-integration.js
import { Eval } from 'braintrust';
import { LevenshteinScorer } from 'autoevals';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if API key is available
if (!process.env.BRAINTRUST_API_KEY) {
  console.error('Error: BRAINTRUST_API_KEY environment variable is not set');
  console.error('Please set it in your .env file or environment');
  process.exit(1);
}

/**
 * Run a Braintrust evaluation
 * @param {string} name - Name of the evaluation
 * @param {Array} dataset - Array of {input, expected} objects
 * @param {Function} taskFn - Function that takes input and returns output
 * @param {Array} scorers - Array of scorer functions
 * @returns {Promise} - Promise that resolves with evaluation results
 */
export async function runEvaluation(name, dataset, taskFn, scorers = [LevenshteinScorer]) {
  try {
    const result = await Eval(name, {
      data: () => dataset,
      task: taskFn,
      scores: scorers,
    });
    
    console.log(`Evaluation "${name}" completed successfully`);
    console.log(`View results at: ${result.url}`);
    
    return result;
  } catch (error) {
    console.error('Error running Braintrust evaluation:', error);
    throw error;
  }
}

/**
 * Example usage
 */
export async function runSampleEvaluation() {
  const dataset = [
    {
      input: "Foo",
      expected: "Hi Foo",
    },
    {
      input: "Bar",
      expected: "Hello Bar",
    },
  ];
  
  const taskFn = async (input) => {
    return "Hi " + input;
  };
  
  return runEvaluation("Sample Greeting Bot", dataset, taskFn);
}

// Allow direct execution of this file
if (import.meta.url === import.meta.main) {
  runSampleEvaluation()
    .then(result => console.log('Evaluation complete'))
    .catch(err => console.error('Evaluation failed:', err));
}