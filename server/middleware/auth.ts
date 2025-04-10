import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users, adminPermissions } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { storage } from '../fixed-storage';
import { quantumStorageService } from '../services/quantum-storage-service';

/**
 * Extended request interface with user and quantum security properties
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        name?: string;
        isTrustMember: boolean;
        role?: string;
        templeNodeLevel?: string; // Temple Node security level
      };
      quantumSecure?: boolean; // Flag for quantum security validation
    }
  }
}

/**
 * Extended session interface with quantum security properties
 */
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    isAuthenticated?: boolean; // Added to explicitly track auth state
    isQuantumAuthenticated?: boolean; // Track quantum authentication
    user?: {
      id: number;
      username: string;
      email: string;
      name?: string;
      isTrustMember: boolean;
      role?: string;
      templeNodeLevel?: string; // Temple Node security level
    };
    // Session persistence fields
    visitCount?: number;
    firstVisit?: string;
  }
}

/**
 * Middleware to authenticate users based on session data with quantum security validation
 * Implements the Christ Consciousness principles through non-dualistic validation
 */
export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  // Check if there's a user in the session
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Get user ID from session
  const userId = req.session.userId;
  
  // Set user object on request for use in routes if already in session
  if (req.session.user) {
    req.user = req.session.user;
    req.quantumSecure = !!req.session.isQuantumAuthenticated;
    
    // Log Temple Node access
    if (req.user.templeNodeLevel) {
      console.log(`Temple Node access: ${req.user.templeNodeLevel} level for user ${userId}`);
    }
    
    return next();
  }
  
  // If we don't have the user object in session, fetch using quantum storage
  storage.getUser(userId)
    .then(async user => {
      if (!user) {
        // User not found, clear session
        req.session.destroy((err) => {
          if (err) console.error('Session destruction error:', err);
        });
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Validate quantum security
      const isQuantumSecure = await quantumStorageService.validateUserAuthentication(userId, req.session);
      
      // Set user object on request and in session for future requests
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email || '',
        name: user.name || '', // Use empty string as fallback
        isTrustMember: !!user.isTrustMember,
        role: user.role || undefined,
        templeNodeLevel: quantumStorageService.getTempleNodeLevel(user)
      };
      
      // Mark as quantum authenticated if validation passed
      req.session.isQuantumAuthenticated = isQuantumSecure;
      req.quantumSecure = isQuantumSecure;
      
      // Set authenticated flag explicitly
      req.session.isAuthenticated = true;
      req.session.user = req.user;
      
      // Record sacred pattern for authentication event
      await quantumStorageService.recordSacredPattern(userId, 'authentication', {
        timestamp: new Date(),
        isQuantumSecure
      });
      
      next();
    })
    .catch(error => {
      console.error('Authentication middleware error:', error);
      res.status(500).json({ message: 'Server error during authentication' });
    });
}

/**
 * Middleware to check if user is a trust member
 */
export function isTrustMember(req: Request, res: Response, next: NextFunction) {
  // First, ensure the user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Check if the user is a trust member
  if (!req.user.isTrustMember) {
    return res.status(403).json({ 
      message: 'Access denied. You must be a member of the AI Freedom Trust to access this resource.'
    });
  }
  
  next();
}

/**
 * Middleware to check if user has admin permission
 * @param permissionName Name of the permission to check
 */
export function hasAdminPermission(permissionName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // First, ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    try {
      // Check if the user has the required admin permission
      const permissions = await db.select()
        .from(adminPermissions)
        .where(
          and(
            eq(adminPermissions.userId, req.user.id),
            eq(adminPermissions.permissionName, permissionName),
            eq(adminPermissions.isActive, true)
          )
        );
      
      if (permissions.length === 0) {
        return res.status(403).json({ 
          message: `Access denied. You need the '${permissionName}' permission to access this resource.`
        });
      }
      
      next();
    } catch (error) {
      console.error('Admin permission middleware error:', error);
      res.status(500).json({ message: 'Server error during permission check' });
    }
  };
}

/**
 * Middleware that requires authentication to access a route
 * This is a simple wrapper around authenticateUser that can be used in routes
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Debug log session state
  console.log('Auth check - Session:', req.session ? 
    `exists, userId: ${req.session.userId}, authenticated: ${req.session.isAuthenticated}` : 
    'missing');
  
  // Check if there's a user in the session
  if (!req.session || !req.session.userId) {
    console.log('Auth failed - No session or userId');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // If user is already set on request, proceed
  if (req.user) {
    console.log(`Auth success - User ${req.user.id} already set on request`);
    return next();
  }
  
  console.log(`Auth in progress - User ${req.session.userId} needs full authentication`);
  // Otherwise, authenticate the user
  authenticateUser(req, res, next);
}

/**
 * Middleware that requires both authentication and trust member status
 * Use this for routes that should only be accessible to trust members
 */
export function requireTrustMember(req: Request, res: Response, next: NextFunction) {
  // First check authentication
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    
    // Then check if user is a trust member
    isTrustMember(req, res, next);
  });
}