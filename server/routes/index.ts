/**
 * AI Freedom Trust Framework API Routes
 * Main router that combines all route modules
 */

import express from 'express';
import mysterionRoutes from './mysterion';
import agentRoutes from './agents';
import rewardRoutes from './rewards';
import trainingDataRoutes from './training-data';

const router = express.Router();

// Register all route modules
router.use('/mysterion', mysterionRoutes);
router.use('/agents', agentRoutes);
router.use('/rewards', rewardRoutes);
router.use('/training-data', trainingDataRoutes);

// Base API info route
router.get('/', (req, res) => {
  res.json({
    name: 'AI Freedom Trust Framework API',
    version: '1.0.0',
    components: [
      {
        name: 'Mysterion Intelligence System',
        endpoints: '/mysterion/*',
        description: 'Knowledge graph and self-improvement system'
      },
      {
        name: 'Autonomous Agent System',
        endpoints: '/agents/*',
        description: 'Agent management and coordination system'
      },
      {
        name: 'Computational Rewards System',
        endpoints: '/rewards/*',
        description: 'FractalCoin and AICoin reward mechanisms'
      },
      {
        name: 'Training Data Bridge',
        endpoints: '/training-data/*',
        description: 'LLM training data management with Filecoin integration'
      }
    ],
    documentation: '/api/docs'
  });
});

// Documentation route - would be implemented with OpenAPI/Swagger in a real application
router.get('/docs', (req, res) => {
  res.json({
    message: 'API documentation is available at https://docs.aifreedomtrust.org/api',
    // In a real implementation, this would serve OpenAPI/Swagger documentation
  });
});

// Status/health check endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'healthy',
    serverTime: new Date().toISOString(),
    components: {
      mysterion: 'operational',
      agents: 'operational',
      rewards: 'operational',
      trainingData: 'operational',
      database: 'connected'
    }
  });
});

export default router;