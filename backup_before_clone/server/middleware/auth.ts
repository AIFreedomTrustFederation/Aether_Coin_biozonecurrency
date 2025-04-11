import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users, adminPermissions } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

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
      };
    }
  }
}

// Add 'user' property to session object to fix type issues
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    user?: {
      id: number;
      username: string;
      email: string;
      name?: string;
      isTrustMember: boolean;
      role?: string;
    };
  }
}

/**
 * Middleware to authenticate users based on session data
 */
export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  // Check if there's a user in the session
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  // Get user ID from session
  const userId = req.session.userId;
  
  // Set user object on request for use in routes
  if (req.session.user) {
    req.user = req.session.user;
    return next();
  }
  
  // If we don't have the user object in session, fetch from DB
  db.select()
    .from(users)
    .where(eq(users.id, userId))
    .then(result => {
      if (result.length === 0) {
        // User not found, clear session
        req.session.destroy((err) => {
          if (err) console.error('Session destruction error:', err);
        });
        return res.status(401).json({ message: 'User not found' });
      }
      
      const user = result[0];
      
      // Set user object on request and in session for future requests
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email || '',
        name: user.name || undefined,
        isTrustMember: !!user.isTrustMember,
        role: user.role || undefined
      };
      
      req.session.user = req.user;
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
  // Check if there's a user in the session
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // If user is already set on request, proceed
  if (req.user) {
    return next();
  }
  
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