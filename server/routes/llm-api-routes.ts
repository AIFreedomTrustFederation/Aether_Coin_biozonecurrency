import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { modelAccessLevels, insertLlmApiKeySchema } from '@shared/llm-api-schema';
import LlmApiService from '../services/llm-api-service';
import { StorageWrapper } from '../storage-wrapper';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin-auth';
import { storage } from '../fixed-storage';

const llmApiRouter = Router();
const storageWrapper = new StorageWrapper();
const llmApiService = new LlmApiService(storageWrapper);

// Validate the model access level
const validateModelAccessLevel = (level: string) => {
  return modelAccessLevels.includes(level as any) 
    ? level as typeof modelAccessLevels[number]
    : 'standard';
};

// Middleware to check admin access to LLM services
const requireLlmAdmin = async (req: any, res: any, next: any) => {
  try {
    if (!req.session || !req.session.userId) {
      console.log('Session missing or userId not in session for admin check');
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.session.userId;
    console.log(`Checking LLM admin access for user ID: ${userId}`);

    const hasAccess = await llmApiService.hasLlmAdminAccess(userId);
    if (!hasAccess) {
      console.log(`User ${userId} denied admin access to LLM services`);
      return res.status(403).json({ 
        message: 'You do not have admin access to LLM services. This requires Trust membership and admin role.' 
      });
    }

    console.log(`User ${userId} has admin access to LLM services`);
    next();
  } catch (error) {
    console.error('Error checking LLM admin access:', error);
    res.status(500).json({ message: 'Error checking admin access' });
  }
};

// Get current user's API keys
llmApiRouter.get('/keys', requireAuth, async (req: any, res) => {
  try {
    if (!req.session || !req.session.userId) {
      console.log('Session missing or userId not in session for get keys');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.session.userId;
    console.log(`Getting LLM API keys for user ID: ${userId}`);
    
    const apiKeys = await llmApiService.getApiKeysByUserId(userId);
    
    // Don't send the full key for security reasons
    const safeApiKeys = apiKeys.map(key => ({
      ...key,
      key: key.key.startsWith('sk-fractalllm-') 
        ? `${key.key.substring(0, 16)}...${key.key.substring(key.key.length - 4)}`
        : key.key
    }));
    
    console.log(`Found ${safeApiKeys.length} LLM API keys for user ${userId}`);
    res.json(safeApiKeys);
  } catch (error) {
    console.error('Error getting API keys:', error);
    res.status(500).json({ message: 'Error getting API keys' });
  }
});

// Get all API keys (admin only)
llmApiRouter.get('/admin/keys', requireAuth, requireLlmAdmin, async (req, res) => {
  try {
    const apiKeys = await llmApiService.getAllApiKeys();
    
    // Mask keys for security
    const safeApiKeys = apiKeys.map(key => ({
      ...key,
      key: key.key.startsWith('sk-fractalllm-') 
        ? `${key.key.substring(0, 16)}...${key.key.substring(key.key.length - 4)}`
        : key.key
    }));
    
    res.json(safeApiKeys);
  } catch (error) {
    console.error('Error getting all API keys:', error);
    res.status(500).json({ message: 'Error getting API keys' });
  }
});

// Direct admin auth middleware to bypass session issues
const directAdminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for admin credentials in request
    const { adminUsername, adminPassword } = req.body;
    
    if (!adminUsername || !adminPassword) {
      console.log('Direct admin auth: Missing credentials');
      return next(); // Continue to next middleware if no credentials
    }
    
    // Attempt to authenticate admin
    console.log(`Direct admin auth: Attempting to authenticate ${adminUsername}`);
    const user = await storage.getUserByUsername(adminUsername);
    
    if (!user) {
      console.log(`Direct admin auth: User ${adminUsername} not found`);
      return next();
    }
    
    // Attempt password verification
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(adminPassword, user.passwordHash);
    
    if (!isPasswordValid) {
      console.log(`Direct admin auth: Invalid password for user ${adminUsername}`);
      return next();
    }
    
    // Only set admin session if user has admin role
    if (user.role === 'admin') {
      console.log(`Direct admin auth: ${adminUsername} has admin role, setting session`);
      const authReq = req as any;
      
      // Set session properties
      authReq.session.userId = user.id;
      authReq.session.isAuthenticated = true;
      authReq.session.isAdmin = true;
      
      // Set user object on request
      authReq.user = {
        id: user.id,
        username: user.username,
        email: user.email || '',
        role: user.role || undefined,
        isTrustMember: !!user.isTrustMember
      };
      
      // Force session save
      if (authReq.session.save) {
        authReq.session.save(err => {
          if (err) {
            console.error('Error saving session in direct admin auth:', err);
          } else {
            console.log(`Direct admin auth: Session saved for admin ${adminUsername}`);
          }
        });
      }
      
      console.log(`Direct admin auth: Successfully set admin session for ${adminUsername}`);
      
      // Skip the requireAuth middleware and proceed directly
      return res.status(201).json({
        message: 'Admin authenticated successfully',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          isAdmin: true
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('Direct admin auth error:', error);
    next(); // Continue to next middleware even if there's an error
  }
};

// Create a new API key
llmApiRouter.post('/keys', directAdminAuth, requireAuth, async (req: any, res) => {
  try {
    if (!req.session || !req.session.userId) {
      console.log('Session missing or userId not in session');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.session.userId;
    console.log(`Creating LLM API key for user ID: ${userId}`);
    
    // Parse and validate the request body
    const validationSchema = insertLlmApiKeySchema
      .omit({ userId: true })
      .extend({
        modelAccessLevel: z.enum(modelAccessLevels).optional()
      });
    
    const validatedData = validationSchema.parse(req.body);
    
    // Check if user has admin rights for setting advanced model access levels
    let modelAccessLevel = validatedData.modelAccessLevel || 'standard';
    
    if (modelAccessLevel !== 'standard') {
      const hasAdminAccess = await llmApiService.hasLlmAdminAccess(userId);
      if (!hasAdminAccess) {
        console.log(`User ${userId} attempted to create key with ${modelAccessLevel} access but was denied`);
        modelAccessLevel = 'standard';
      }
    }
    
    // Create the API key
    const apiKey = await llmApiService.createApiKey({
      ...validatedData,
      userId,
      modelAccessLevel
    });
    
    console.log(`Successfully created LLM API key (ID: ${apiKey.id}) for user ${userId}`);
    res.status(201).json(apiKey);
  } catch (error) {
    console.error('Error creating API key:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Invalid request data', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Error creating API key' });
  }
});

// Revoke an API key
llmApiRouter.patch('/keys/:id/revoke', requireAuth, async (req: any, res) => {
  try {
    if (!req.session || !req.session.userId) {
      console.log('Session missing or userId not in session for key revoke');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.session.userId;
    const keyId = parseInt(req.params.id, 10);
    
    if (isNaN(keyId)) {
      return res.status(400).json({ message: 'Invalid API key ID' });
    }
    
    console.log(`User ${userId} attempting to revoke API key ${keyId}`);
    
    // Get the key to check ownership
    const key = await llmApiService.getApiKeyById(keyId);
    
    if (!key) {
      return res.status(404).json({ message: 'API key not found' });
    }
    
    // Only allow owners or admins to revoke keys
    if (key.userId !== userId) {
      const isAdmin = await llmApiService.hasLlmAdminAccess(userId);
      if (!isAdmin) {
        console.log(`User ${userId} denied permission to revoke key ${keyId} (not owner or admin)`);
        return res.status(403).json({ message: 'Not authorized to revoke this API key' });
      }
    }
    
    const updatedKey = await llmApiService.revokeApiKey(keyId);
    console.log(`API key ${keyId} successfully revoked by user ${userId}`);
    res.json(updatedKey);
  } catch (error) {
    console.error('Error revoking API key:', error);
    res.status(500).json({ message: 'Error revoking API key' });
  }
});

// Update API key model access level (admin only)
llmApiRouter.patch('/admin/keys/:id/access-level', requireAuth, requireLlmAdmin, async (req, res) => {
  try {
    const keyId = parseInt(req.params.id, 10);
    
    if (isNaN(keyId)) {
      return res.status(400).json({ message: 'Invalid API key ID' });
    }
    
    const { accessLevel } = req.body;
    
    if (!accessLevel || !modelAccessLevels.includes(accessLevel as any)) {
      return res.status(400).json({ 
        message: 'Invalid access level', 
        validLevels: modelAccessLevels 
      });
    }
    
    const updatedKey = await llmApiService.updateApiKeyAccessLevel(
      keyId, 
      accessLevel as typeof modelAccessLevels[number]
    );
    
    if (!updatedKey) {
      return res.status(404).json({ message: 'API key not found' });
    }
    
    res.json(updatedKey);
  } catch (error) {
    console.error('Error updating API key access level:', error);
    res.status(500).json({ message: 'Error updating API key access level' });
  }
});

// Update API key usage limit (admin only)
llmApiRouter.patch('/admin/keys/:id/usage-limit', requireAuth, requireLlmAdmin, async (req, res) => {
  try {
    const keyId = parseInt(req.params.id, 10);
    
    if (isNaN(keyId)) {
      return res.status(400).json({ message: 'Invalid API key ID' });
    }
    
    const { usageLimit } = req.body;
    
    // Allow null for unlimited or a positive number
    if (usageLimit !== null && (typeof usageLimit !== 'number' || usageLimit < 0)) {
      return res.status(400).json({ 
        message: 'Invalid usage limit. Must be null for unlimited or a positive number' 
      });
    }
    
    const updatedKey = await llmApiService.updateApiKeyUsageLimit(keyId, usageLimit);
    
    if (!updatedKey) {
      return res.status(404).json({ message: 'API key not found' });
    }
    
    res.json(updatedKey);
  } catch (error) {
    console.error('Error updating API key usage limit:', error);
    res.status(500).json({ message: 'Error updating API key usage limit' });
  }
});

// Get API key usage logs
llmApiRouter.get('/keys/:id/usage', requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const keyId = parseInt(req.params.id, 10);
    
    if (isNaN(keyId)) {
      return res.status(400).json({ message: 'Invalid API key ID' });
    }
    
    // Get the key to check ownership
    const key = await llmApiService.getApiKeyById(keyId);
    
    if (!key) {
      return res.status(404).json({ message: 'API key not found' });
    }
    
    // Only allow owners or admins to view usage logs
    if (key.userId !== userId) {
      const isAdmin = await llmApiService.hasLlmAdminAccess(userId);
      if (!isAdmin) {
        return res.status(403).json({ message: 'Not authorized to view usage for this API key' });
      }
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const usage = await llmApiService.getApiKeyUsage(keyId, limit);
    
    res.json(usage);
  } catch (error) {
    console.error('Error getting API key usage:', error);
    res.status(500).json({ message: 'Error getting API key usage' });
  }
});

// Get active connections for an API key
llmApiRouter.get('/keys/:id/connections', requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const keyId = parseInt(req.params.id, 10);
    
    if (isNaN(keyId)) {
      return res.status(400).json({ message: 'Invalid API key ID' });
    }
    
    // Get the key to check ownership
    const key = await llmApiService.getApiKeyById(keyId);
    
    if (!key) {
      return res.status(404).json({ message: 'API key not found' });
    }
    
    // Only allow owners or admins to view connections
    if (key.userId !== userId) {
      const isAdmin = await llmApiService.hasLlmAdminAccess(userId);
      if (!isAdmin) {
        return res.status(403).json({ message: 'Not authorized to view connections for this API key' });
      }
    }
    
    const connections = await llmApiService.getActiveConnections(keyId);
    res.json(connections);
  } catch (error) {
    console.error('Error getting API key connections:', error);
    res.status(500).json({ message: 'Error getting API key connections' });
  }
});

// Direct admin key generation endpoint - no authentication middleware required
llmApiRouter.post('/admin/direct-key-generation', async (req, res) => {
  try {
    // Extract credentials from request
    const { adminUsername, adminPassword, name, description } = req.body;
    
    if (!adminUsername || !adminPassword) {
      return res.status(400).json({ message: 'Admin credentials required' });
    }
    
    if (!name) {
      return res.status(400).json({ message: 'API key name is required' });
    }
    
    console.log(`Direct admin key generation attempt for ${adminUsername}`);
    
    // Verify admin credentials
    const user = await storage.getUserByUsername(adminUsername);
    
    if (!user) {
      console.log(`Direct admin key generation: User ${adminUsername} not found`);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    
    // Verify password
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(adminPassword, user.passwordHash);
    
    if (!isPasswordValid) {
      console.log(`Direct admin key generation: Invalid password for ${adminUsername}`);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    
    // Verify admin role
    if (user.role !== 'admin') {
      console.log(`Direct admin key generation: User ${adminUsername} is not an admin`);
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    console.log(`Admin ${adminUsername} verified, generating LLM API key`);
    
    // Generate admin API key
    const apiKey = await llmApiService.createApiKey({
      userId: user.id,
      name,
      description: description || 'Admin-generated key via direct endpoint',
      modelAccessLevel: 'quantum',
      usageLimit: null, // Unlimited
      expiresAt: null // Never expires
    });
    
    console.log(`Successfully created LLM admin API key (ID: ${apiKey.id}) for admin ${adminUsername}`);
    
    // Return the API key
    return res.status(201).json(apiKey);
  } catch (error) {
    console.error('Error in direct admin key generation:', error);
    return res.status(500).json({ message: 'Error generating admin API key' });
  }
});

// Terminate a connection
llmApiRouter.delete('/keys/:keyId/connections/:connectionId', requireAuth, async (req: any, res) => {
  try {
    const userId = req.session.userId;
    const keyId = parseInt(req.params.keyId, 10);
    const connectionId = req.params.connectionId;
    
    if (isNaN(keyId)) {
      return res.status(400).json({ message: 'Invalid API key ID' });
    }
    
    // Get the key to check ownership
    const key = await llmApiService.getApiKeyById(keyId);
    
    if (!key) {
      return res.status(404).json({ message: 'API key not found' });
    }
    
    // Only allow owners or admins to terminate connections
    if (key.userId !== userId) {
      const isAdmin = await llmApiService.hasLlmAdminAccess(userId);
      if (!isAdmin) {
        return res.status(403).json({ message: 'Not authorized to terminate connections for this API key' });
      }
    }
    
    const connection = await llmApiService.terminateConnection(connectionId);
    
    if (!connection) {
      return res.status(404).json({ message: 'Connection not found' });
    }
    
    res.json({ message: 'Connection terminated successfully' });
  } catch (error) {
    console.error('Error terminating connection:', error);
    res.status(500).json({ message: 'Error terminating connection' });
  }
});

export default llmApiRouter;