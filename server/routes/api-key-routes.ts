/**
 * API Key Routes
 * 
 * This module provides routes for managing API keys, tracking usage,
 * and viewing active connections to the FractalCoin API.
 */

import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { storage } from "../fixed-storage";
import { apiKeyService } from "../services/api-key-service";
import { 
  insertApiKeySchema, 
  insertApiKeyConnectionSchema 
} from "@shared/api-key-schema";
import { checkAdminPrivilege } from "../middleware/admin-auth";

// Auth request interface for TypeScript
interface AuthRequest extends Request {
  session?: {
    userId: number;
    isAuthenticated: boolean;
    isAdmin?: boolean;
  };
}

// Middleware to require authentication
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  
  if (!authReq.session || !authReq.session.isAuthenticated) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  next();
};

// Create a router for API key routes with admin check middleware
const router = Router();

/**
 * GET /api/keys
 * 
 * Get all API keys for the currently authenticated user
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    // In a real app, this would be from req.session.userId
    const userId = 1;
    const keys = await apiKeyService.getApiKeysByUserId(userId);
    
    // Don't send the actual key in the response
    const sanitizedKeys = keys.map(key => {
      const { key: _, ...rest } = key;
      return {
        ...rest,
        key: `${key.key.substring(0, 8)}...${key.key.substring(key.key.length - 8)}`
      };
    });
    
    res.json(sanitizedKeys);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    res.status(500).json({ message: "Failed to fetch API keys" });
  }
});

/**
 * POST /api/keys
 * 
 * Create a new API key for the authenticated user
 */
router.post("/", requireAuth, checkAdminPrivilege, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    
    // Validate incoming data
    const keyData = insertApiKeySchema
      .extend({
        scopes: z.array(z.string()).min(1, "At least one scope is required")
      })
      .parse(req.body);
    
    // Check if user is trying to create a key with admin scope but doesn't have admin privileges
    if (keyData.scopes.includes("admin") && (!authReq.session?.isAdmin)) {
      return res.status(403).json({ 
        message: "Admin privilege required to create keys with admin scope",
        code: "ADMIN_PRIVILEGE_REQUIRED"
      });
    }
    
    // Get user ID from session
    const userId = authReq.session?.userId || 1; // Fallback for development
    
    // Create the new API key
    const apiKey = await apiKeyService.createApiKey({
      ...keyData,
      userId
    });
    
    res.status(201).json(apiKey);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid API key data", 
        errors: error.errors 
      });
    }
    console.error("Error creating API key:", error);
    res.status(500).json({ message: "Failed to create API key" });
  }
});

/**
 * GET /api/keys/:id
 * 
 * Get details for a specific API key
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid API key ID" });
    }
    
    // In a real app, we'd check that the key belongs to the authenticated user
    const userId = 1;
    
    const key = await apiKeyService.getApiKeyById(id);
    
    if (!key) {
      return res.status(404).json({ message: "API key not found" });
    }
    
    if (key.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized access to API key" });
    }
    
    // Don't send the actual key in the response
    const { key: fullKey, ...rest } = key;
    const sanitizedKey = {
      ...rest,
      key: `${fullKey.substring(0, 8)}...${fullKey.substring(fullKey.length - 8)}`
    };
    
    res.json(sanitizedKey);
  } catch (error) {
    console.error("Error fetching API key:", error);
    res.status(500).json({ message: "Failed to fetch API key" });
  }
});

/**
 * PATCH /api/keys/:id/revoke
 * 
 * Revoke an API key
 */
router.patch("/:id/revoke", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid API key ID" });
    }
    
    // In a real app, we'd check that the key belongs to the authenticated user
    const userId = 1;
    
    const key = await apiKeyService.getApiKeyById(id);
    
    if (!key) {
      return res.status(404).json({ message: "API key not found" });
    }
    
    if (key.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized access to API key" });
    }
    
    const revokedKey = await apiKeyService.revokeApiKey(id);
    
    // Don't send the actual key in the response
    const { key: fullKey, ...rest } = revokedKey;
    const sanitizedKey = {
      ...rest,
      key: `${fullKey.substring(0, 8)}...${fullKey.substring(fullKey.length - 8)}`
    };
    
    res.json(sanitizedKey);
  } catch (error) {
    console.error("Error revoking API key:", error);
    res.status(500).json({ message: "Failed to revoke API key" });
  }
});

/**
 * GET /api/keys/:id/usage
 * 
 * Get usage statistics for a specific API key
 */
router.get("/:id/usage", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid API key ID" });
    }
    
    // In a real app, we'd check that the key belongs to the authenticated user
    const userId = 1;
    
    const key = await apiKeyService.getApiKeyById(id);
    
    if (!key) {
      return res.status(404).json({ message: "API key not found" });
    }
    
    if (key.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized access to API key" });
    }
    
    const usage = await apiKeyService.getApiKeyUsage(id);
    
    res.json(usage);
  } catch (error) {
    console.error("Error fetching API key usage:", error);
    res.status(500).json({ message: "Failed to fetch API key usage" });
  }
});

/**
 * GET /api/keys/:id/connections
 * 
 * Get active connections for a specific API key
 */
router.get("/:id/connections", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid API key ID" });
    }
    
    // In a real app, we'd check that the key belongs to the authenticated user
    const userId = 1;
    
    const key = await apiKeyService.getApiKeyById(id);
    
    if (!key) {
      return res.status(404).json({ message: "API key not found" });
    }
    
    if (key.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized access to API key" });
    }
    
    const connections = await apiKeyService.getApiKeyConnections(id);
    
    res.json(connections);
  } catch (error) {
    console.error("Error fetching API key connections:", error);
    res.status(500).json({ message: "Failed to fetch API key connections" });
  }
});

/**
 * DELETE /api/keys/:id/connections/:connectionId
 * 
 * Terminate a specific connection
 */
router.delete("/:id/connections/:connectionId", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const connectionId = req.params.connectionId;
    
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid API key ID" });
    }
    
    // In a real app, we'd check that the key belongs to the authenticated user
    const userId = 1;
    
    const key = await apiKeyService.getApiKeyById(id);
    
    if (!key) {
      return res.status(404).json({ message: "API key not found" });
    }
    
    if (key.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized access to API key" });
    }
    
    const success = await apiKeyService.terminateConnection(connectionId);
    
    if (!success) {
      return res.status(404).json({ message: "Connection not found" });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error("Error terminating connection:", error);
    res.status(500).json({ message: "Failed to terminate connection" });
  }
});

/**
 * API key validation middleware for external routes
 * This middleware checks if a valid API key is provided in the request headers
 */
export const validateApiKey = async (req: Request, res: Response, next: Function) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;
    
    if (!apiKey) {
      return res.status(401).json({ message: "API key is required" });
    }
    
    const keyDetails = await apiKeyService.validateApiKey(apiKey);
    
    if (!keyDetails) {
      return res.status(401).json({ message: "Invalid API key" });
    }
    
    // Add the API key details to the request for downstream use
    (req as any).apiKey = keyDetails;
    
    // Track API key usage
    await apiKeyService.trackApiKeyUsage(keyDetails.id, req.path, req.ip);
    
    next();
  } catch (error) {
    console.error("Error validating API key:", error);
    res.status(500).json({ message: "Failed to validate API key" });
  }
};

export default router;