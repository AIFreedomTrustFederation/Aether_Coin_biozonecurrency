import { Request, Response, NextFunction } from 'express';
import { secureCompare } from '../utils/security';

/**
 * API Security Middleware
 * Provides authentication and authorization for API endpoints
 */

// Interface for authenticated user
export interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
  permissions: string[];
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      apiKey?: {
        id: number;
        name: string;
        permissions: string[];
      };
    }
  }
}

// Validate API key middleware
export const validateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return next(); // No API key provided, continue to other auth methods
  }
  
  try {
    // Get API key from database or cache
    // This is a placeholder - implement actual API key validation
    const validApiKey = await getApiKeyFromDatabase(apiKey);
    
    if (!validApiKey) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Set API key info on request object
    req.apiKey = {
      id: validApiKey.id,
      name: validApiKey.name,
      permissions: validApiKey.permissions,
    };
    
    // If API key is associated with a user, set user info too
    if (validApiKey.userId) {
      const user = await getUserById(validApiKey.userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        };
      }
    }
    
    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({ error: 'Internal server error during API key validation' });
  }
};

// Validate JWT token middleware
export const validateJwtToken = async (req: Request, res: Response, next: NextFunction) => {
  // Skip if already authenticated via API key
  if (req.user) {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // No token provided, continue to other auth methods
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify JWT token
    // This is a placeholder - implement actual JWT verification
    const decodedToken = await verifyJwtToken(token);
    
    if (!decodedToken) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Get user from database
    const user = await getUserById(decodedToken.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Set user info on request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };
    
    next();
  } catch (error) {
    console.error('JWT validation error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Validate session middleware
export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
  // Skip if already authenticated via API key or JWT
  if (req.user) {
    return next();
  }
  
  // Check if user is authenticated via session
  if (req.session && req.session.userId) {
    try {
      // Get user from database
      const user = await getUserById(req.session.userId);
      
      if (user) {
        // Set user info on request object
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        };
      }
    } catch (error) {
      console.error('Session validation error:', error);
      // Don't return error, just continue without authentication
    }
  }
  
  next();
};

// Require authentication middleware
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  next();
};

// Require specific role middleware
export const requireRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Require specific permission middleware
export const requirePermission = (permissions: string | string[]) => {
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user has admin role (bypass permission check)
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      req.user.permissions.includes(permission)
    );
    
    if (!hasAllPermissions) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

// Validate API key permissions middleware
export const requireApiKeyPermission = (permissions: string | string[]) => {
  const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }
    
    // Check if API key has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      req.apiKey.permissions.includes(permission)
    );
    
    if (!hasAllPermissions) {
      return res.status(403).json({ error: 'API key has insufficient permissions' });
    }
    
    next();
  };
};

// Validate request origin middleware
export const validateOrigin = (allowedOrigins: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    
    if (!origin) {
      // No origin header, could be a non-browser client
      return next();
    }
    
    // Check if origin is allowed
    if (!allowedOrigins.includes(origin)) {
      return res.status(403).json({ error: 'Origin not allowed' });
    }
    
    next();
  };
};

// Rate limit by user ID middleware
export const userRateLimit = (limit: number, windowMs: number) => {
  const requests = new Map<number, { count: number, resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(); // Skip if not authenticated
    }
    
    const userId = req.user.id;
    const now = Date.now();
    
    // Get or initialize user's request count
    let userRequests = requests.get(userId);
    
    if (!userRequests || userRequests.resetTime < now) {
      // Initialize or reset counter
      userRequests = { count: 0, resetTime: now + windowMs };
      requests.set(userId, userRequests);
    }
    
    // Increment request count
    userRequests.count++;
    
    // Check if limit exceeded
    if (userRequests.count > limit) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
      });
    }
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', (limit - userRequests.count).toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(userRequests.resetTime / 1000).toString());
    
    next();
  };
};

// Placeholder functions - implement these with actual database queries
async function getApiKeyFromDatabase(apiKey: string) {
  // This is a placeholder - implement actual database query
  // Return null if API key not found or is invalid
  return null;
}

async function verifyJwtToken(token: string) {
  // This is a placeholder - implement actual JWT verification
  // Return null if token is invalid or expired
  return null;
}

async function getUserById(userId: number) {
  // This is a placeholder - implement actual database query
  // Return null if user not found
  return null;
}

// Combined authentication middleware that tries all methods
export const authenticate = [
  validateApiKey,
  validateJwtToken,
  validateSession
];