/**
 * Health API Module
 * Provides health check endpoints for the application
 */

import express from 'express';

// Create a router for this module
const router = express.Router();

// GET /api/health - Get health status
router.get('/', async (req, res) => {
  res.json({
    status: 'ok',
    api_version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// GET /api/health/detailed - Get detailed health status
router.get('/detailed', async (req, res) => {
  res.json({
    status: 'ok',
    api_version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  });
});

export default router;