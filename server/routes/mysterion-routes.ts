import { Router } from 'express';
import { z } from 'zod';
import { StorageWrapper } from '../storage';
import LlmApiService from '../services/llm-api-service';
import MatrixService from '../services/matrix-service';
import MysterionLlmService from '../services/mysterion-llm-service';
import requireAuth from '../middleware/require-auth';
import requireAdmin from '../middleware/require-admin';

const mysterionRouter = Router();
const storageWrapper = new StorageWrapper();
const llmApiService = new LlmApiService(storageWrapper);
const matrixService = new MatrixService(storageWrapper);
const mysterionLlmService = new MysterionLlmService(storageWrapper, llmApiService, matrixService);

// Get service status
mysterionRouter.get('/status', requireAuth, async (req, res) => {
  try {
    const llmStatus = mysterionLlmService.getStatus();
    const matrixStatus = matrixService.getStatus();
    
    res.json({
      llm: llmStatus,
      matrix: matrixStatus,
      integration: {
        isReady: llmStatus.isInitialized && matrixStatus.isInitialized,
        simulationMode: llmStatus.simulationMode || matrixStatus.simulationMode
      }
    });
  } catch (error) {
    console.error('Error getting Mysterion status:', error);
    res.status(500).json({ message: 'Error getting service status' });
  }
});

// Generate code from natural language description
mysterionRouter.post('/generate-code', requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    
    // Validate request body
    const schema = z.object({
      prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
      language: z.string().min(1, 'Programming language must be specified'),
      apiKey: z.string().optional(),
    });
    
    const { prompt, language, apiKey } = schema.parse(req.body);
    
    // If API key is not provided, user must have admin access
    if (!apiKey) {
      // Check admin access
      const hasAdminAccess = await llmApiService.hasLlmAdminAccess(userId);
      if (!hasAdminAccess) {
        return res.status(403).json({ 
          message: 'API key required. Only admins can use this endpoint without an API key.' 
        });
      }
    }
    
    // Generate code
    const result = await mysterionLlmService.generateCode(prompt, language, apiKey);
    
    res.json(result);
  } catch (error) {
    console.error('Error generating code:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid request data', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Error generating code', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Analyze code
mysterionRouter.post('/analyze-code', requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    
    // Validate request body
    const schema = z.object({
      code: z.string().min(1, 'Code must not be empty'),
      language: z.string().min(1, 'Programming language must be specified'),
      apiKey: z.string().optional(),
    });
    
    const { code, language, apiKey } = schema.parse(req.body);
    
    // If API key is not provided, user must have admin access
    if (!apiKey) {
      // Check admin access
      const hasAdminAccess = await llmApiService.hasLlmAdminAccess(userId);
      if (!hasAdminAccess) {
        return res.status(403).json({ 
          message: 'API key required. Only admins can use this endpoint without an API key.' 
        });
      }
    }
    
    // Analyze code
    const result = await mysterionLlmService.analyzeCode(code, language, apiKey);
    
    res.json(result);
  } catch (error) {
    console.error('Error analyzing code:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid request data', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Error analyzing code', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Create a new BioZone Coding project with Matrix integration
mysterionRouter.post('/biozone-coding/projects', requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    
    // Validate request body
    const schema = z.object({
      name: z.string().min(3, 'Project name must be at least 3 characters'),
      description: z.string().min(10, 'Project description must be at least 10 characters'),
      inviteMatrixIds: z.array(z.string()).optional(),
    });
    
    const { name, description, inviteMatrixIds = [] } = schema.parse(req.body);
    
    // Create the project
    const project = await mysterionLlmService.bootstrapBioZoneCodingProject(
      name,
      description,
      userId,
      inviteMatrixIds
    );
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating BioZone Coding project:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid request data', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating BioZone Coding project', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Create a new Matrix room for collaboration
mysterionRouter.post('/matrix/rooms', requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    
    // Validate request body
    const schema = z.object({
      name: z.string().min(3, 'Room name must be at least 3 characters'),
      topic: z.string().min(10, 'Room topic must be at least 10 characters'),
      isPrivate: z.boolean().optional(),
      inviteUsers: z.array(z.string()).optional(),
    });
    
    const { name, topic, isPrivate = true, inviteUsers = [] } = schema.parse(req.body);
    
    // Create the room
    const roomId = await matrixService.createRoom(name, topic, isPrivate);
    
    // Invite users if specified
    for (const matrixId of inviteUsers) {
      try {
        await matrixService.inviteToRoom(roomId, matrixId);
      } catch (error) {
        console.error(`Error inviting user ${matrixId} to room:`, error);
        // Continue with other invites even if one fails
      }
    }
    
    // Generate access URL
    const accessUrl = `https://matrix.aifreedomtrust.com/#/room/${encodeURIComponent(roomId)}`;
    
    res.status(201).json({
      roomId,
      name,
      topic,
      accessUrl
    });
  } catch (error) {
    console.error('Error creating Matrix room:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid request data', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating Matrix room', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// Create a Mysterion-assisted Matrix room
mysterionRouter.post('/matrix/mysterion-rooms', requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    
    // Validate request body
    const schema = z.object({
      name: z.string().min(3, 'Room name must be at least 3 characters'),
      purpose: z.string().min(10, 'Room purpose must be at least 10 characters'),
      inviteUsers: z.array(z.string()).optional(),
    });
    
    const { name, purpose, inviteUsers = [] } = schema.parse(req.body);
    
    // Bootstrap Mysterion room
    const { roomId, accessUrl } = await matrixService.bootstrapMysterionRoom(
      name,
      purpose,
      inviteUsers
    );
    
    res.status(201).json({
      roomId,
      name,
      purpose,
      accessUrl
    });
  } catch (error) {
    console.error('Error creating Mysterion room:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid request data', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating Mysterion room', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default mysterionRouter;