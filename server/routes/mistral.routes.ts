// mistral.routes.ts
import express from 'express';
import { mistralService } from '../../shared/services/MistralService';

const router = express.Router();

/**
 * Check if Mistral service is configured
 * GET /api/mistral/status
 */
router.get('/status', (req, res) => {
  const isConfigured = mistralService.isConfigured();
  
  res.json({
    status: isConfigured ? 'configured' : 'not_configured',
    message: isConfigured 
      ? 'Mistral service is properly configured' 
      : 'Mistral service is missing API key configuration'
  });
});

/**
 * Get a completion from Mistral AI
 * POST /api/mistral/completion
 * 
 * Request body:
 * {
 *   prompt: string,
 *   model?: string,
 *   maxTokens?: number,
 *   temperature?: number,
 *   topP?: number
 * }
 */
router.post('/completion', async (req, res) => {
  try {
    const { prompt, model, maxTokens, temperature, topP } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        error: 'Invalid request. Required field: prompt' 
      });
    }
    
    const completion = await mistralService.getCompletion({
      prompt,
      model,
      maxTokens,
      temperature,
      topP
    });
    
    res.json({
      success: true,
      completion
    });
  } catch (err) {
    console.error('Error getting completion:', err);
    res.status(500).json({ 
      error: `Failed to get completion: ${err instanceof Error ? err.message : String(err)}` 
    });
  }
});

/**
 * Get a chat completion from Mistral AI
 * POST /api/mistral/chat
 * 
 * Request body:
 * {
 *   messages: Array<{ role: string, content: string }>,
 *   model?: string,
 *   maxTokens?: number,
 *   temperature?: number,
 *   topP?: number
 * }
 */
router.post('/chat', async (req, res) => {
  try {
    const { messages, model, maxTokens, temperature, topP } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request. Required field: messages (array)' 
      });
    }
    
    const completion = await mistralService.getChatCompletion(messages, {
      model,
      maxTokens,
      temperature,
      topP
    });
    
    res.json({
      success: true,
      completion
    });
  } catch (err) {
    console.error('Error getting chat completion:', err);
    res.status(500).json({ 
      error: `Failed to get chat completion: ${err instanceof Error ? err.message : String(err)}` 
    });
  }
});

export default router;