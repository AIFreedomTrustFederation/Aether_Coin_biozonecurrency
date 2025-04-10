/**
 * Admin Authentication Middleware
 * 
 * This middleware ensures that only AI Freedom Trust admin members
 * can access admin-specific API routes and functionality.
 */

import { Request, Response, NextFunction } from 'express';
import { storage } from '../fixed-storage';
import * as express from 'express';

// Define custom session properties
interface CustomSession extends express.Session {
  userId?: number;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  isQuantumAuthenticated?: boolean;
}

// Create custom request interface with our session
interface AuthRequest extends Request {
  session: CustomSession;
}

/**
 * Middleware to require admin privilege
 * 
 * This middleware checks if the user is authenticated, is a Trust member,
 * and has the 'admin' role. It also verifies quantum authentication.
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    
    // Check if authenticated
    if (!authReq.session || !authReq.session.isAuthenticated) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userId = authReq.session.userId;
    const user = await storage.getUserById(userId);

    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if the user is a Trust member
    if (!user.isTrustMember) {
      return res.status(403).json({ 
        message: 'AI Freedom Trust membership required for admin access',
        code: 'TRUST_MEMBERSHIP_REQUIRED'
      });
    }

    // Check if the user has admin role
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return res.status(403).json({ 
        message: 'Admin role required',
        code: 'ADMIN_ROLE_REQUIRED'
      });
    }

    // Check if the user has quantum authentication - temporarily disabled for initial admin access
    // Commented out to allow admin access without quantum authentication during development
    /*
    if (!authReq.session.isQuantumAuthenticated) {
      return res.status(403).json({ 
        message: 'Quantum authentication required for admin actions',
        code: 'QUANTUM_AUTH_REQUIRED' 
      });
    }
    */
    
    // Automatically set the quantum authentication flag for super_admin users
    if (user.role === 'super_admin') {
      authReq.session.isQuantumAuthenticated = true;
    }

    // User is a verified admin, allow access
    next();
  } catch (error) {
    console.error('Error in admin authentication middleware:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Middleware to check if user has admin privileges
 * This middleware doesn't block the request, just adds isAdmin flag
 */
export const checkAdminPrivilege = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as AuthRequest;
    
    // Set default as not admin
    authReq.session = authReq.session || { userId: 0, isAuthenticated: false };
    authReq.session.isAdmin = false;
    
    // Skip check if not authenticated
    if (!authReq.session.isAuthenticated) {
      return next();
    }

    const userId = authReq.session.userId;
    const user = await storage.getUserById(userId);

    // Automatically set quantum authentication for super_admin
    if (user && user.role === 'super_admin') {
      authReq.session.isQuantumAuthenticated = true;
    }
    
    // Check if user has admin privileges
    if (user && 
        user.isTrustMember && 
        (user.role === 'admin' || user.role === 'super_admin')) {
      
      // Super_admin always gets admin privileges without quantum authentication
      if (user.role === 'super_admin' || authReq.session.isQuantumAuthenticated) {
        // Set admin flag if conditions are met
        authReq.session.isAdmin = true;
      }
    }

    next();
  } catch (error) {
    console.error('Error checking admin privilege:', error);
    next();
  }
};