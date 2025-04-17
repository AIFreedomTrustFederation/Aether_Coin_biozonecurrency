/**
 * API Routes and WebSocket setup for AI Freedom Trust Framework
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import { Storage } from './storage';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import LogWebSocketServer from './websocket/log-socket';

export const createRouter = (storage: Storage) => {
  const router = express.Router();

  // Apply middleware
  router.use(express.json());
  router.use(cors());
  router.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
  }));

  // Apply rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  router.use('/api/', apiLimiter);

  // Health check endpoint
  router.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- Mysterion Knowledge System Routes ---

  // Get all knowledge nodes
  router.get('/api/mysterion/knowledge/nodes', async (req, res) => {
    try {
      const nodes = await storage.getAllKnowledgeNodes();
      res.json(nodes);
    } catch (error) {
      console.error('Error getting knowledge nodes:', error);
      res.status(500).json({ error: 'Failed to retrieve knowledge nodes' });
    }
  });

  // Create a knowledge node
  router.post('/api/mysterion/knowledge/nodes', async (req, res) => {
    try {
      const node = await storage.createKnowledgeNode(req.body);
      res.status(201).json(node);
    } catch (error) {
      console.error('Error creating knowledge node:', error);
      res.status(500).json({ error: 'Failed to create knowledge node' });
    }
  });

  // Get a specific knowledge node
  router.get('/api/mysterion/knowledge/nodes/:id', async (req, res) => {
    try {
      const node = await storage.getKnowledgeNode(parseInt(req.params.id));
      if (!node) {
        return res.status(404).json({ error: 'Knowledge node not found' });
      }
      res.json(node);
    } catch (error) {
      console.error(`Error getting knowledge node ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to retrieve knowledge node' });
    }
  });

  // Update a knowledge node
  router.patch('/api/mysterion/knowledge/nodes/:id', async (req, res) => {
    try {
      const node = await storage.updateKnowledgeNode(parseInt(req.params.id), req.body);
      if (!node) {
        return res.status(404).json({ error: 'Knowledge node not found' });
      }
      res.json(node);
    } catch (error) {
      console.error(`Error updating knowledge node ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to update knowledge node' });
    }
  });

  // Delete a knowledge node
  router.delete('/api/mysterion/knowledge/nodes/:id', async (req, res) => {
    try {
      const success = await storage.deleteKnowledgeNode(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: 'Knowledge node not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting knowledge node ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to delete knowledge node' });
    }
  });

  // --- Improvement Routes ---

  // Get all improvements
  router.get('/api/mysterion/knowledge/improvements', async (req, res) => {
    try {
      const improvements = await storage.getAllImprovements();
      res.json(improvements);
    } catch (error) {
      console.error('Error getting improvements:', error);
      res.status(500).json({ error: 'Failed to retrieve improvements' });
    }
  });

  // Create an improvement
  router.post('/api/mysterion/knowledge/improvements', async (req, res) => {
    try {
      const improvement = await storage.createImprovement(req.body);
      res.status(201).json(improvement);
    } catch (error) {
      console.error('Error creating improvement:', error);
      res.status(500).json({ error: 'Failed to create improvement' });
    }
  });

  // Get a specific improvement
  router.get('/api/mysterion/knowledge/improvements/:id', async (req, res) => {
    try {
      const improvement = await storage.getImprovement(parseInt(req.params.id));
      if (!improvement) {
        return res.status(404).json({ error: 'Improvement not found' });
      }
      res.json(improvement);
    } catch (error) {
      console.error(`Error getting improvement ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to retrieve improvement' });
    }
  });

  // Update improvement status
  router.patch('/api/mysterion/knowledge/improvements/:id/status', async (req, res) => {
    try {
      if (!req.body.status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      const improvement = await storage.updateImprovementStatus(
        parseInt(req.params.id), 
        req.body.status
      );
      
      if (!improvement) {
        return res.status(404).json({ error: 'Improvement not found' });
      }
      
      res.json(improvement);
    } catch (error) {
      console.error(`Error updating improvement ${req.params.id} status:`, error);
      res.status(500).json({ error: 'Failed to update improvement status' });
    }
  });

  // --- Agent System Routes ---

  // Get all agent instances
  router.get('/api/agents/instances', async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error) {
      console.error('Error getting agents:', error);
      res.status(500).json({ error: 'Failed to retrieve agents' });
    }
  });

  // Create an agent instance
  router.post('/api/agents/instances', async (req, res) => {
    try {
      const agent = await storage.createAgent(req.body);
      res.status(201).json(agent);
    } catch (error) {
      console.error('Error creating agent:', error);
      res.status(500).json({ error: 'Failed to create agent' });
    }
  });

  // Get a specific agent
  router.get('/api/agents/instances/:id', async (req, res) => {
    try {
      const agent = await storage.getAgent(parseInt(req.params.id));
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      res.json(agent);
    } catch (error) {
      console.error(`Error getting agent ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to retrieve agent' });
    }
  });

  // Update agent config
  router.patch('/api/agents/instances/:id/config', async (req, res) => {
    try {
      if (!req.body.config) {
        return res.status(400).json({ error: 'Configuration is required' });
      }
      
      const agent = await storage.updateAgentConfig(
        parseInt(req.params.id), 
        req.body.config
      );
      
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      
      res.json(agent);
    } catch (error) {
      console.error(`Error updating agent ${req.params.id} config:`, error);
      res.status(500).json({ error: 'Failed to update agent configuration' });
    }
  });

  // --- Agent Tasks Routes ---

  // Get all tasks for an agent
  router.get('/api/agents/instances/:id/tasks', async (req, res) => {
    try {
      const tasks = await storage.getAgentTasks(parseInt(req.params.id));
      res.json(tasks);
    } catch (error) {
      console.error(`Error getting tasks for agent ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to retrieve agent tasks' });
    }
  });

  // Create a task for an agent
  router.post('/api/agents/instances/:id/tasks', async (req, res) => {
    try {
      const task = await storage.createAgentTask(parseInt(req.params.id), req.body);
      res.status(201).json(task);
    } catch (error) {
      console.error(`Error creating task for agent ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to create agent task' });
    }
  });

  // Update task status
  router.patch('/api/agents/tasks/:id/status', async (req, res) => {
    try {
      if (!req.body.status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      const task = await storage.updateTaskStatus(
        parseInt(req.params.id), 
        req.body.status,
        req.body.result
      );
      
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      res.json(task);
    } catch (error) {
      console.error(`Error updating task ${req.params.id} status:`, error);
      res.status(500).json({ error: 'Failed to update task status' });
    }
  });

  // --- Rewards System Routes ---

  // Get all contributions
  router.get('/api/rewards/contributions', async (req, res) => {
    try {
      const contributions = await storage.getAllContributions();
      res.json(contributions);
    } catch (error) {
      console.error('Error getting contributions:', error);
      res.status(500).json({ error: 'Failed to retrieve contributions' });
    }
  });

  // Register a new contribution
  router.post('/api/rewards/contributions', async (req, res) => {
    try {
      const contribution = await storage.createContribution(req.body);
      res.status(201).json(contribution);
    } catch (error) {
      console.error('Error creating contribution:', error);
      res.status(500).json({ error: 'Failed to create contribution' });
    }
  });

  // --- Training Data Routes ---

  // Get all datasets
  router.get('/api/training-data/datasets', async (req, res) => {
    try {
      const datasets = await storage.getAllDatasets();
      res.json(datasets);
    } catch (error) {
      console.error('Error getting datasets:', error);
      res.status(500).json({ error: 'Failed to retrieve datasets' });
    }
  });

  // Create a new dataset
  router.post('/api/training-data/datasets', async (req, res) => {
    try {
      const dataset = await storage.createDataset(req.body);
      res.status(201).json(dataset);
    } catch (error) {
      console.error('Error creating dataset:', error);
      res.status(500).json({ error: 'Failed to create dataset' });
    }
  });

  return router;
};

export const setupServer = (app: express.Express) => {
  // Create HTTP server
  const httpServer = http.createServer(app);
  
  // Create WebSocket server for logs
  const logWebSocketServer = new LogWebSocketServer(httpServer, {
    path: '/ws/logs'
  });

  // Create WebSocket server for real-time events but on a distinct path
  // so it doesn't conflict with Vite's HMR websocket
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (socket) => {
    console.log('WebSocket client connected');
    
    socket.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Echo back to confirm receipt
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({
            type: 'echo',
            data,
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    socket.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return { httpServer, wss, logWebSocketServer };
};