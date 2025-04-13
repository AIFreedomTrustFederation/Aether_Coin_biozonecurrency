/**
 * Quantum Security Routes
 * 
 * This module provides API endpoints for quantum-resistant cryptographic operations,
 * including key generation, encryption, signatures, and authentication.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { 
  quantumSecurity, 
  QuantumSecurityLevel, 
  PostQuantumAlgorithm 
} from '../crypto/quantum';
import { quantumAuth } from '../middleware/quantum-auth';
import { validateInput } from '../middleware/security';

const router = Router();

// Schema for key generation request
const keyGenSchema = z.object({
  algorithm: z.enum([
    PostQuantumAlgorithm.KYBER,
    PostQuantumAlgorithm.DILITHIUM,
    PostQuantumAlgorithm.SPHINCS_PLUS,
    PostQuantumAlgorithm.HYBRID_RSA_KYBER,
    PostQuantumAlgorithm.HYBRID_ECDSA_DILITHIUM
  ]),
  keyId: z.string().optional(),
  metadata: z.record(z.any()).optional()
});

// Schema for encryption request
const encryptSchema = z.object({
  algorithm: z.enum([
    PostQuantumAlgorithm.KYBER,
    PostQuantumAlgorithm.HYBRID_RSA_KYBER
  ]),
  data: z.string(),
  publicKey: z.string()
});

// Schema for decryption request
const decryptSchema = z.object({
  algorithm: z.enum([
    PostQuantumAlgorithm.KYBER,
    PostQuantumAlgorithm.HYBRID_RSA_KYBER
  ]),
  encryptedData: z.string(),
  privateKey: z.string()
});

// Schema for signing request
const signSchema = z.object({
  algorithm: z.enum([
    PostQuantumAlgorithm.DILITHIUM,
    PostQuantumAlgorithm.SPHINCS_PLUS,
    PostQuantumAlgorithm.HYBRID_ECDSA_DILITHIUM
  ]),
  data: z.string(),
  privateKey: z.string()
});

// Schema for signature verification request
const verifySchema = z.object({
  algorithm: z.enum([
    PostQuantumAlgorithm.DILITHIUM,
    PostQuantumAlgorithm.SPHINCS_PLUS,
    PostQuantumAlgorithm.HYBRID_ECDSA_DILITHIUM
  ]),
  data: z.string(),
  signature: z.string(),
  publicKey: z.string()
});

// Schema for authentication token request
const authTokenSchema = z.object({
  userId: z.number().int().positive(),
  expiresIn: z.number().int().positive().optional()
});

// Schema for password hashing request
const passwordHashSchema = z.object({
  password: z.string().min(8)
});

// Schema for password verification request
const passwordVerifySchema = z.object({
  password: z.string(),
  hash: z.string()
});

/**
 * Generate a quantum-resistant key pair
 * POST /api/quantum/keys
 */
router.post('/keys', validateInput(keyGenSchema), async (req: Request, res: Response) => {
  try {
    const { algorithm, keyId, metadata } = req.body;
    
    // Generate the key pair
    const keyPair = await quantumSecurity.generateQuantumKeyPair(algorithm);
    
    // Return the keys as base64 strings
    res.status(201).json({
      algorithm,
      keyId: keyId || crypto.randomUUID(),
      publicKey: keyPair.publicKey.toString('base64'),
      privateKey: keyPair.privateKey.toString('base64'),
      metadata: metadata || {},
      created: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating quantum key pair:', error);
    res.status(500).json({ 
      error: 'Failed to generate key pair',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Encrypt data using quantum-resistant encryption
 * POST /api/quantum/encrypt
 */
router.post('/encrypt', validateInput(encryptSchema), async (req: Request, res: Response) => {
  try {
    const { algorithm, data, publicKey } = req.body;
    
    // Encrypt the data
    const encryptedData = await quantumSecurity.encryptQuantum(
      Buffer.from(data),
      Buffer.from(publicKey, 'base64'),
      algorithm
    );
    
    // Return the encrypted data as a base64 string
    res.status(200).json({
      algorithm,
      encryptedData: encryptedData.toString('base64')
    });
  } catch (error) {
    console.error('Error encrypting data:', error);
    res.status(500).json({ 
      error: 'Failed to encrypt data',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Decrypt data using quantum-resistant encryption
 * POST /api/quantum/decrypt
 */
router.post('/decrypt', validateInput(decryptSchema), async (req: Request, res: Response) => {
  try {
    const { algorithm, encryptedData, privateKey } = req.body;
    
    // Decrypt the data
    const decryptedData = await quantumSecurity.decryptQuantum(
      Buffer.from(encryptedData, 'base64'),
      Buffer.from(privateKey, 'base64'),
      algorithm
    );
    
    // Return the decrypted data as a string
    res.status(200).json({
      algorithm,
      decryptedData: decryptedData.toString()
    });
  } catch (error) {
    console.error('Error decrypting data:', error);
    res.status(500).json({ 
      error: 'Failed to decrypt data',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Sign data using quantum-resistant signatures
 * POST /api/quantum/sign
 */
router.post('/sign', validateInput(signSchema), async (req: Request, res: Response) => {
  try {
    const { algorithm, data, privateKey } = req.body;
    
    // Sign the data
    const signature = await quantumSecurity.generateQuantumSignature(
      Buffer.from(data),
      Buffer.from(privateKey, 'base64'),
      algorithm
    );
    
    // Return the signature as a base64 string
    res.status(200).json({
      algorithm,
      signature: signature.toString('base64')
    });
  } catch (error) {
    console.error('Error signing data:', error);
    res.status(500).json({ 
      error: 'Failed to sign data',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Verify a quantum-resistant signature
 * POST /api/quantum/verify
 */
router.post('/verify', validateInput(verifySchema), async (req: Request, res: Response) => {
  try {
    const { algorithm, data, signature, publicKey } = req.body;
    
    // Verify the signature
    const isValid = await quantumSecurity.verifyQuantumSignature(
      Buffer.from(data),
      Buffer.from(signature, 'base64'),
      Buffer.from(publicKey, 'base64'),
      algorithm
    );
    
    // Return the verification result
    res.status(200).json({
      algorithm,
      valid: isValid
    });
  } catch (error) {
    console.error('Error verifying signature:', error);
    res.status(500).json({ 
      error: 'Failed to verify signature',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Generate a quantum-resistant authentication token
 * POST /api/quantum/auth/token
 */
router.post('/auth/token', validateInput(authTokenSchema), async (req: Request, res: Response) => {
  try {
    const { userId, expiresIn } = req.body;
    
    // Generate the token
    const token = await quantumAuth.createQuantumAuthToken(userId, expiresIn);
    
    // Return the token
    res.status(200).json({
      token,
      userId,
      expiresIn: expiresIn || 3600,
      tokenType: 'Quantum',
      created: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating authentication token:', error);
    res.status(500).json({ 
      error: 'Failed to generate authentication token',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Verify a quantum-resistant authentication token
 * POST /api/quantum/auth/verify
 */
router.post('/auth/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
    
    // Verify the token
    const payload = await quantumAuth.verifyQuantumAuthToken(token);
    
    // Return the payload
    res.status(200).json({
      valid: true,
      payload
    });
  } catch (error) {
    res.status(401).json({ 
      valid: false,
      error: 'Invalid token',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Protected route example
 * GET /api/quantum/protected
 */
router.get('/protected', quantumAuth.quantumAuthMiddleware, (req: Request, res: Response) => {
  res.status(200).json({
    message: 'This is a protected route',
    user: (req as any).user,
    timestamp: new Date().toISOString()
  });
});

/**
 * Hash a password using quantum-resistant hashing
 * POST /api/quantum/password/hash
 */
router.post('/password/hash', validateInput(passwordHashSchema), (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    
    // Hash the password
    const hash = quantumAuth.hashPasswordQuantum(password);
    
    // Return the hash
    res.status(200).json({
      hash
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ 
      error: 'Failed to hash password',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Verify a password against a quantum-resistant hash
 * POST /api/quantum/password/verify
 */
router.post('/password/verify', validateInput(passwordVerifySchema), (req: Request, res: Response) => {
  try {
    const { password, hash } = req.body;
    
    // Verify the password
    const isValid = quantumAuth.verifyPasswordQuantum(password, hash);
    
    // Return the verification result
    res.status(200).json({
      valid: isValid
    });
  } catch (error) {
    console.error('Error verifying password:', error);
    res.status(500).json({ 
      error: 'Failed to verify password',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get information about available quantum security algorithms
 * GET /api/quantum/info
 */
router.get('/info', (req: Request, res: Response) => {
  res.status(200).json({
    algorithms: {
      encryption: [
        {
          id: PostQuantumAlgorithm.KYBER,
          name: 'Kyber',
          type: 'Lattice-based KEM',
          securityLevel: 'Quantum-resistant',
          standardization: 'NIST Round 3 Selection'
        },
        {
          id: PostQuantumAlgorithm.HYBRID_RSA_KYBER,
          name: 'Hybrid RSA-Kyber',
          type: 'Hybrid classical/post-quantum',
          securityLevel: 'Quantum-resistant with classical fallback',
          standardization: 'Transitional approach'
        }
      ],
      signatures: [
        {
          id: PostQuantumAlgorithm.DILITHIUM,
          name: 'Dilithium',
          type: 'Lattice-based signature',
          securityLevel: 'Quantum-resistant',
          standardization: 'NIST Round 3 Selection'
        },
        {
          id: PostQuantumAlgorithm.SPHINCS_PLUS,
          name: 'SPHINCS+',
          type: 'Hash-based signature',
          securityLevel: 'Quantum-resistant (strongest)',
          standardization: 'NIST Round 3 Alternate'
        },
        {
          id: PostQuantumAlgorithm.HYBRID_ECDSA_DILITHIUM,
          name: 'Hybrid ECDSA-Dilithium',
          type: 'Hybrid classical/post-quantum',
          securityLevel: 'Quantum-resistant with classical fallback',
          standardization: 'Transitional approach'
        }
      ]
    },
    securityLevels: [
      {
        id: QuantumSecurityLevel.STANDARD,
        name: 'Standard',
        description: 'Basic security using SHA-512 (still quantum-resistant for hashing)'
      },
      {
        id: QuantumSecurityLevel.ENHANCED,
        name: 'Enhanced',
        description: 'Hybrid approach combining classical and post-quantum algorithms'
      },
      {
        id: QuantumSecurityLevel.QUANTUM,
        name: 'Quantum',
        description: 'Full post-quantum security using NIST-selected algorithms'
      }
    ]
  });
});

export default router;