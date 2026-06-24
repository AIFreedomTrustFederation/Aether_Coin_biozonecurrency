// braintrust.routes.ts
import express from 'express';
import { braintrustService } from '../../shared/services/BraintrustService';

const router = express.Router();

/**
 * Check if Braintrust service is configured
 * GET /api/braintrust/status
 */
router.get('/status', (req, res) => {
  const isConfigured = braintrustService.isConfigured();
  
  res.json({
    status: isConfigured ? 'configured' : 'not_configured',
    message: isConfigured 
      ? 'Braintrust service is properly configured' 
      : 'Braintrust service is missing API key configuration'
  });
});

/**
 * Run a Braintrust evaluation
 * POST /api/braintrust/evaluate
 * 
 * Request body:
 * {
 *   name: string,
 *   dataset: Array<{ input: any, expected: any }>,
 *   taskModule: string (path to module that exports the task function)
 * }
 */
router.post('/evaluate', async (req, res) => {
  try {
    const { name, dataset, taskModule } = req.body;
    
    if (!name || !dataset || !Array.isArray(dataset) || !taskModule) {
      return res.status(400).json({ 
        error: 'Invalid request. Required fields: name, dataset (array), taskModule (string)' 
      });
    }
    
    // Dynamically import the task function
    let taskFn;
    try {
      const module = await import(`../../${taskModule}`);
      taskFn = module.default || module.task;
      
      if (typeof taskFn !== 'function') {
        return res.status(400).json({ 
          error: `Module ${taskModule} does not export a default or 'task' function` 
        });
      }
    } catch (err) {
      return res.status(400).json({ 
        error: `Failed to import task module: ${err instanceof Error ? err.message : String(err)}` 
      });
    }
    
    // Run the evaluation
    const result = await braintrustService.runEvaluation({
      name,
      dataset,
      taskFn
    });
    
    res.json({
      success: true,
      result
    });
  } catch (err) {
    console.error('Error running evaluation:', err);
    res.status(500).json({ 
      error: `Failed to run evaluation: ${err instanceof Error ? err.message : String(err)}` 
    });
  }
});

/**
 * Run a predefined evaluation
 * POST /api/braintrust/evaluate/predefined/:evaluationId
 */
router.post('/evaluate/predefined/:evaluationId', async (req, res) => {
  try {
    const { evaluationId } = req.params;
    
    // This would be replaced with your actual predefined evaluations
    const predefinedEvaluations: Record<string, any> = {
      'greeting': {
        name: 'Greeting Bot Evaluation',
        dataset: [
          { input: 'John', expected: 'Hello John' },
          { input: 'Mary', expected: 'Hello Mary' },
        ],
        taskFn: async (input: string) => `Hello ${input}`
      },
      // Add more predefined evaluations as needed
    };
    
    const evaluation = predefinedEvaluations[evaluationId];
    
    if (!evaluation) {
      return res.status(404).json({ error: `Predefined evaluation '${evaluationId}' not found` });
    }
    
    const result = await braintrustService.runEvaluation(evaluation);
    
    res.json({
      success: true,
      result
    });
  } catch (err) {
    console.error('Error running predefined evaluation:', err);
    res.status(500).json({ 
      error: `Failed to run evaluation: ${err instanceof Error ? err.message : String(err)}` 
    });
  }
});

export default router;