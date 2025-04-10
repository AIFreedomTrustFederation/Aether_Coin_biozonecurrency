import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { storage } from '../fixed-storage';
import { checkAdminPrivilege } from '../middleware/admin-auth';
import { User } from '@shared/schema';

const router = express.Router();

// Extending Express Request type to include session
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    isAuthenticated?: boolean;
    user?: {
      id: number;
      username: string;
      email: string;
      name?: string;
      isTrustMember: boolean;
      role?: string;
    };
    isAdmin?: boolean;
  }
}

// Custom type to extend Express Request with session
interface AuthRequest extends Request {
  session: express.Session & {
    userId?: number;
    isAuthenticated?: boolean;
    user?: {
      id: number;
      username: string;
      email: string;
      name?: string;
      isTrustMember: boolean;
      role?: string;
    };
    isAdmin?: boolean;
  };
}

/**
 * Create authentication routes
 */
export function createAuthRoutes() {
  
  // Signup route
  router.post('/signup', async (req: Request, res: Response) => {
    try {
      // Validate signup request body
      const signupSchema = z.object({
        username: z.string().min(3, 'Username must be at least 3 characters'),
        email: z.string().email('Invalid email format'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
      });

      const result = signupSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid request data', 
          errors: result.error.issues 
        });
      }

      const { username, email, password } = result.data;

      // Check if user already exists
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(409).json({ message: 'Username already taken' });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create the user
      const newUser = await storage.createUser({
        username,
        email,
        passwordHash,
        role: 'user', // Default role
        isTrustMember: false, // Default not a trust member
      });

      // Return success response (without sensitive data)
      const safeUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isTrustMember: newUser.isTrustMember,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };

      return res.status(201).json({ 
        message: 'User created successfully', 
        user: safeUser 
      });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Login route
  router.post('/login', async (req: Request, res: Response) => {
    try {
      // Validate login request body
      const loginSchema = z.object({
        username: z.string().min(3),
        password: z.string().min(6),
      });

      const result = loginSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid request data', 
          errors: result.error.issues 
        });
      }

      const { username, password } = result.data;

      let user;
      
      // First check if input looks like an email address
      if (username.includes('@')) {
        // This is likely an email, search users by email
        console.log(`Login attempt with email: ${username}`);
        // Get all users and find the one with matching email
        const allUsers = await storage.getAllUsers();
        user = allUsers.find((u: User) => u.email.toLowerCase() === username.toLowerCase());
      } else {
        // Try to find user by username
        console.log(`Login attempt with username: ${username}`);
        user = await storage.getUserByUsername(username);
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!passwordValid) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({ message: 'Account is inactive. Please contact support.' });
      }

      // Set up session with robust approach
      const authReq = req as AuthRequest;
      
      // Set all session properties
      authReq.session.userId = user.id;
      authReq.session.isAuthenticated = true;
      
      // Also set session.user to ensure middleware compatibility
      authReq.session.user = {
        id: user.id,
        username: user.username,
        email: user.email || '',
        name: user.name || undefined,
        isTrustMember: !!user.isTrustMember,
        role: user.role || undefined
      };
      
      // Ensure admin status is properly set
      if (user.role === 'admin') {
        authReq.session.isAdmin = true;
      }
      
      // Force session save to ensure it's persisted immediately
      authReq.session.save(err => {
        if (err) {
          console.error('Session save error during login:', err);
        } else {
          console.log(`Session successfully saved for user ${user.id} with session ID ${authReq.session.id}`);
        }
      });

      // Update last login time
      await storage.updateUserLastLogin(user.id);

      // Send user data (excluding sensitive information)
      const safeUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isTrustMember: user.isTrustMember,
        trustMemberSince: user.trustMemberSince,
        trustMemberLevel: user.trustMemberLevel,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
      };

      return res.status(200).json({ 
        message: 'Login successful', 
        user: safeUser 
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Logout route
  router.post('/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.clearCookie('connect.sid');
      return res.status(200).json({ message: 'Logout successful' });
    });
  });

  // Get current user route
  router.get('/current-user', async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthRequest;
      
      // Check if user is authenticated via session
      if (!authReq.session || !authReq.session.isAuthenticated) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      const userId = authReq.session.userId;
      const user = await storage.getUserById(userId);

      if (!user) {
        // Clear invalid session
        authReq.session.destroy((err) => {
          if (err) console.error('Error destroying invalid session:', err);
        });
        return res.status(401).json({ message: 'User not found' });
      }

      // Update session.user to maintain consistency across middleware
      authReq.session.user = {
        id: user.id,
        username: user.username,
        email: user.email || '',
        name: user.name || undefined,
        isTrustMember: !!user.isTrustMember,
        role: user.role || undefined
      };
      
      // Ensure admin status is properly set
      if (user.role === 'admin') {
        authReq.session.isAdmin = true;
      }
      
      // Force session save to ensure it's persisted immediately
      authReq.session.save(err => {
        if (err) {
          console.error('Session save error during current-user fetch:', err);
        } else {
          console.log(`Session refreshed for user ${user.id}`);
        }
      });
      
      // Return user data without sensitive information
      const safeUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isTrustMember: user.isTrustMember,
        trustMemberSince: user.trustMemberSince,
        trustMemberLevel: user.trustMemberLevel,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
      };

      return res.status(200).json({ user: safeUser });
    } catch (error) {
      console.error('Error getting current user:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Middleware to protect routes requiring authentication
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;
    
    if (!authReq.session || !authReq.session.isAuthenticated) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    next();
  };

  // Middleware to protect routes requiring trust membership
  const requireTrustMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthRequest;
      
      // First check if authenticated
      if (!authReq.session || !authReq.session.isAuthenticated) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userId = authReq.session.userId;
      const user = await storage.getUserById(userId);

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!user.isTrustMember) {
        return res.status(403).json({ message: 'Trust membership required' });
      }

      next();
    } catch (error) {
      console.error('Error in trust member middleware:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  // Example protected route requiring trust membership
  router.get('/trust-data', requireTrustMember, (req: Request, res: Response) => {
    res.status(200).json({ 
      message: 'This data is only available to trust members',
      // Add trust-specific data here 
    });
  });

  // Check if user has admin privileges
  router.get('/check-admin', requireAuth, checkAdminPrivilege, (req: Request, res: Response) => {
    const authReq = req as any; // using any to avoid type issues with session.isAdmin
    
    res.status(200).json({
      isAdmin: authReq.session?.isAdmin || false,
    });
  });

  return router;
}

export default createAuthRoutes;