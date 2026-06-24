/**
 * Quantum-Secure Authentication Middleware
 * 
 * This middleware provides quantum-resistant authentication mechanisms
 * to protect against quantum computing attacks on traditional authentication.
 */

import { Request, Response, NextFunction } from 'express';
import { 
  quantumSecurity, 
  QuantumSecurityLevel, 
  PostQuantumAlgorithm 
} from '../crypto/quantum';

// Global key pairs for authentication
// In a production system, these would be securely stored and managed
let GLOBAL_AUTH_KEY_PAIR: { publicKey: Buffer; privateKey: Buffer } | null = null;

// Initialize the quantum key pair for authentication
async function initializeAuthKeys() {
  if (!GLOBAL_AUTH_KEY_PAIR) {
    GLOBAL_AUTH_KEY_PAIR = await quantumSecurity.generateQuantumKeyPair(
      PostQuantumAlgorithm.DILITHIUM
    );
    console.log('Dilithium key pair generated for authentication');
  }
}

// Initialize keys when the module is loaded
initializeAuthKeys().catch(error => {
  console.error('Failed to initialize quantum authentication keys:', error);
});

/**
 * Create a quantum-secure authentication token
 * 
 * @param userId User ID
 * @param expiresIn Token expiration time in seconds
 * @returns Quantum-secure authentication token
 */
export async function createQuantumAuthToken(userId: number, expiresIn: number = 3600): Promise<string> {
  // Ensure the key pair is initialized
  if (!GLOBAL_AUTH_KEY_PAIR) {
    await initializeAuthKeys();
  }
  
  if (!GLOBAL_AUTH_KEY_PAIR) {
    throw new Error('Quantum authentication keys not initialized');
  }
  
  // Create the token
  return quantumSecurity.createQuantumAuthToken(
    userId,
    expiresIn,
    GLOBAL_AUTH_KEY_PAIR.privateKey,
    PostQuantumAlgorithm.DILITHIUM
  );
}

/**
 * Verify a quantum-secure authentication token
 * 
 * @param token Authentication token
 * @returns Decoded token payload if valid
 */
export async function verifyQuantumAuthToken(token: string): Promise<any> {
  // Ensure the key pair is initialized
  if (!GLOBAL_AUTH_KEY_PAIR) {
    await initializeAuthKeys();
  }
  
  if (!GLOBAL_AUTH_KEY_PAIR) {
    throw new Error('Quantum authentication keys not initialized');
  }
  
  // Verify the token
  return quantumSecurity.verifyQuantumAuthToken(
    token,
    GLOBAL_AUTH_KEY_PAIR.publicKey,
    PostQuantumAlgorithm.DILITHIUM
  );
}

/**
 * Middleware to authenticate requests using quantum-secure tokens
 * 
 * @param req Express request
 * @param res Express response
 * @param next Next middleware function
 */
export async function quantumAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Quantum ')) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Quantum authentication token required' 
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify the token
    const payload = await verifyQuantumAuthToken(token);
    
    // Set the user ID on the request
    (req as any).user = { id: payload.userId };
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: error instanceof Error ? error.message : 'Invalid authentication token' 
    });
  }
}

/**
 * Middleware to authenticate requests using hybrid authentication
 * (supports both quantum and traditional tokens)
 * 
 * @param req Express request
 * @param res Express response
 * @param next Next middleware function
 */
export async function hybridAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Authentication token required' 
    });
  }
  
  // Check the token type
  if (authHeader.startsWith('Quantum ')) {
    // Quantum token
    const token = authHeader.split(' ')[1];
    
    try {
      // Verify the quantum token
      const payload = await verifyQuantumAuthToken(token);
      
      // Set the user ID on the request
      (req as any).user = { 
        id: payload.userId,
        authType: 'quantum'
      };
      
      next();
    } catch (error) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: error instanceof Error ? error.message : 'Invalid quantum authentication token' 
      });
    }
  } else if (authHeader.startsWith('Bearer ')) {
    // Traditional JWT token
    const token = authHeader.split(' ')[1];
    
    try {
      // Verify the JWT token (using your existing JWT verification)
      // This is a placeholder - replace with your actual JWT verification
      const payload = { userId: 1 }; // Placeholder
      
      // Set the user ID on the request
      (req as any).user = { 
        id: payload.userId,
        authType: 'jwt'
      };
      
      next();
    } catch (error) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: error instanceof Error ? error.message : 'Invalid JWT token' 
      });
    }
  } else {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Unsupported authentication method' 
    });
  }
}

/**
 * Hash a password using quantum-resistant hashing
 * 
 * @param password Password to hash
 * @returns Quantum-resistant password hash
 */
export function hashPasswordQuantum(password: string): string {
  return quantumSecurity.hashPasswordQuantum(password);
}

/**
 * Verify a password against a quantum-resistant hash
 * 
 * @param password Password to verify
 * @param hash Stored password hash
 * @returns Boolean indicating if password is valid
 */
export function verifyPasswordQuantum(password: string, hash: string): boolean {
  return quantumSecurity.verifyPasswordQuantum(password, hash);
}

// Export the quantum authentication module
export const quantumAuth = {
  createQuantumAuthToken,
  verifyQuantumAuthToken,
  quantumAuthMiddleware,
  hybridAuthMiddleware,
  hashPasswordQuantum,
  verifyPasswordQuantum
};