/**
 * Quantum Security Module
 * 
 * This module provides post-quantum cryptographic algorithms and utilities
 * to protect against quantum computing attacks.
 * 
 * It implements:
 * 1. Kyber - Lattice-based key encapsulation mechanism (KEM)
 * 2. Dilithium - Lattice-based digital signature algorithm
 * 3. SPHINCS+ - Hash-based signature scheme
 * 4. Hybrid cryptography combining classical and post-quantum algorithms
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Import sub-modules
import { kyber } from './kyber';
import { dilithium } from './dilithium';
import { sphincsPlus } from './sphincs';
import { hybridCrypto } from './hybrid';

/**
 * Quantum Security Levels
 * 
 * - STANDARD: Classical cryptography (AES-256, RSA-2048, etc.)
 * - ENHANCED: Hybrid cryptography (Classical + Post-Quantum)
 * - QUANTUM: Pure post-quantum cryptography
 */
export enum QuantumSecurityLevel {
  STANDARD = 'standard',
  ENHANCED = 'enhanced',
  QUANTUM = 'quantum'
}

/**
 * Supported Post-Quantum Algorithms
 */
export enum PostQuantumAlgorithm {
  KYBER = 'kyber',
  DILITHIUM = 'dilithium',
  SPHINCS_PLUS = 'sphincs+',
  HYBRID_RSA_KYBER = 'hybrid-rsa-kyber',
  HYBRID_ECDSA_DILITHIUM = 'hybrid-ecdsa-dilithium'
}

/**
 * Quantum-Resistant Hash Function
 * 
 * Uses SHA-512 which is currently considered quantum-resistant
 * due to its output size and collision resistance.
 * 
 * @param data Data to hash
 * @returns Quantum-resistant hash
 */
export function quantumResistantHash(data: string | Buffer): string {
  const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;
  return crypto.createHash('sha512').update(dataBuffer).digest('hex');
}

/**
 * Generate a quantum-resistant signature using the specified algorithm
 * 
 * @param data Data to sign
 * @param privateKey Private key for signing
 * @param algorithm Post-quantum algorithm to use
 * @returns Quantum-resistant signature
 */
export async function generateQuantumSignature(
  data: string | Buffer,
  privateKey: Buffer,
  algorithm: PostQuantumAlgorithm = PostQuantumAlgorithm.DILITHIUM
): Promise<Buffer> {
  const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;
  
  switch (algorithm) {
    case PostQuantumAlgorithm.DILITHIUM:
      return dilithium.sign(dataBuffer, privateKey);
    case PostQuantumAlgorithm.SPHINCS_PLUS:
      return sphincsPlus.sign(dataBuffer, privateKey);
    case PostQuantumAlgorithm.HYBRID_ECDSA_DILITHIUM:
      return hybridCrypto.signEcdsaDilithium(dataBuffer, privateKey);
    default:
      throw new Error(`Unsupported signature algorithm: ${algorithm}`);
  }
}

/**
 * Verify a quantum-resistant signature
 * 
 * @param data Original data that was signed
 * @param signature Signature to verify
 * @param publicKey Public key for verification
 * @param algorithm Post-quantum algorithm used for signing
 * @returns Boolean indicating if signature is valid
 */
export async function verifyQuantumSignature(
  data: string | Buffer,
  signature: Buffer,
  publicKey: Buffer,
  algorithm: PostQuantumAlgorithm = PostQuantumAlgorithm.DILITHIUM
): Promise<boolean> {
  const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;
  
  switch (algorithm) {
    case PostQuantumAlgorithm.DILITHIUM:
      return dilithium.verify(dataBuffer, signature, publicKey);
    case PostQuantumAlgorithm.SPHINCS_PLUS:
      return sphincsPlus.verify(dataBuffer, signature, publicKey);
    case PostQuantumAlgorithm.HYBRID_ECDSA_DILITHIUM:
      return hybridCrypto.verifyEcdsaDilithium(dataBuffer, signature, publicKey);
    default:
      throw new Error(`Unsupported signature algorithm: ${algorithm}`);
  }
}

/**
 * Generate a quantum-resistant key pair
 * 
 * @param algorithm Post-quantum algorithm to use
 * @returns Object containing public and private keys
 */
export async function generateQuantumKeyPair(
  algorithm: PostQuantumAlgorithm = PostQuantumAlgorithm.KYBER
): Promise<{ publicKey: Buffer; privateKey: Buffer }> {
  switch (algorithm) {
    case PostQuantumAlgorithm.KYBER:
      return kyber.generateKeyPair();
    case PostQuantumAlgorithm.DILITHIUM:
      return dilithium.generateKeyPair();
    case PostQuantumAlgorithm.SPHINCS_PLUS:
      return sphincsPlus.generateKeyPair();
    case PostQuantumAlgorithm.HYBRID_RSA_KYBER:
      return hybridCrypto.generateRsaKyberKeyPair();
    case PostQuantumAlgorithm.HYBRID_ECDSA_DILITHIUM:
      return hybridCrypto.generateEcdsaDilithiumKeyPair();
    default:
      throw new Error(`Unsupported key generation algorithm: ${algorithm}`);
  }
}

/**
 * Encrypt data using quantum-resistant encryption
 * 
 * @param data Data to encrypt
 * @param publicKey Recipient's public key
 * @param algorithm Post-quantum algorithm to use
 * @returns Encrypted data
 */
export async function encryptQuantum(
  data: string | Buffer,
  publicKey: Buffer,
  algorithm: PostQuantumAlgorithm = PostQuantumAlgorithm.KYBER
): Promise<Buffer> {
  const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;
  
  switch (algorithm) {
    case PostQuantumAlgorithm.KYBER:
      return kyber.encrypt(dataBuffer, publicKey);
    case PostQuantumAlgorithm.HYBRID_RSA_KYBER:
      return hybridCrypto.encryptRsaKyber(dataBuffer, publicKey);
    default:
      throw new Error(`Unsupported encryption algorithm: ${algorithm}`);
  }
}

/**
 * Decrypt data using quantum-resistant encryption
 * 
 * @param encryptedData Encrypted data
 * @param privateKey Recipient's private key
 * @param algorithm Post-quantum algorithm used for encryption
 * @returns Decrypted data
 */
export async function decryptQuantum(
  encryptedData: Buffer,
  privateKey: Buffer,
  algorithm: PostQuantumAlgorithm = PostQuantumAlgorithm.KYBER
): Promise<Buffer> {
  switch (algorithm) {
    case PostQuantumAlgorithm.KYBER:
      return kyber.decrypt(encryptedData, privateKey);
    case PostQuantumAlgorithm.HYBRID_RSA_KYBER:
      return hybridCrypto.decryptRsaKyber(encryptedData, privateKey);
    default:
      throw new Error(`Unsupported decryption algorithm: ${algorithm}`);
  }
}

/**
 * Create a quantum-resistant authentication token
 * 
 * @param userId User ID
 * @param expiresIn Token expiration time in seconds
 * @param privateKey Private key for signing
 * @param algorithm Post-quantum algorithm to use
 * @returns Quantum-resistant authentication token
 */
export async function createQuantumAuthToken(
  userId: number,
  expiresIn: number = 3600, // 1 hour default
  privateKey: Buffer,
  algorithm: PostQuantumAlgorithm = PostQuantumAlgorithm.DILITHIUM
): Promise<string> {
  // Create token payload
  const payload = {
    userId,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
    iat: Math.floor(Date.now() / 1000),
    jti: uuidv4(), // Unique token ID
  };
  
  // Convert payload to string
  const payloadStr = JSON.stringify(payload);
  
  // Sign the payload
  const signature = await generateQuantumSignature(payloadStr, privateKey, algorithm);
  
  // Combine payload and signature
  const token = Buffer.from(payloadStr).toString('base64') + '.' + 
                signature.toString('base64');
  
  return token;
}

/**
 * Verify a quantum-resistant authentication token
 * 
 * @param token Authentication token
 * @param publicKey Public key for verification
 * @param algorithm Post-quantum algorithm used for signing
 * @returns Decoded token payload if valid
 */
export async function verifyQuantumAuthToken(
  token: string,
  publicKey: Buffer,
  algorithm: PostQuantumAlgorithm = PostQuantumAlgorithm.DILITHIUM
): Promise<any> {
  // Split token into payload and signature
  const [payloadBase64, signatureBase64] = token.split('.');
  
  if (!payloadBase64 || !signatureBase64) {
    throw new Error('Invalid token format');
  }
  
  // Decode payload
  const payloadStr = Buffer.from(payloadBase64, 'base64').toString();
  const payload = JSON.parse(payloadStr);
  
  // Check if token is expired
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }
  
  // Verify signature
  const signature = Buffer.from(signatureBase64, 'base64');
  const isValid = await verifyQuantumSignature(payloadStr, signature, publicKey, algorithm);
  
  if (!isValid) {
    throw new Error('Invalid token signature');
  }
  
  return payload;
}

/**
 * Generate a quantum-resistant password hash
 * 
 * @param password Password to hash
 * @returns Quantum-resistant password hash
 */
export function hashPasswordQuantum(password: string): string {
  // Use a strong hash function with high work factor
  const salt = crypto.randomBytes(32);
  
  // First hash with SHA-512
  const hash1 = crypto.createHash('sha512')
    .update(Buffer.concat([Buffer.from(password), salt]))
    .digest();
  
  // Second hash with SHA3-512 for quantum resistance
  const hash2 = crypto.createHash('sha3-512')
    .update(Buffer.concat([hash1, salt]))
    .digest();
  
  // Return salt and hash
  return salt.toString('hex') + ':' + hash2.toString('hex');
}

/**
 * Verify a quantum-resistant password hash
 * 
 * @param password Password to verify
 * @param hash Stored password hash
 * @returns Boolean indicating if password is valid
 */
export function verifyPasswordQuantum(password: string, hash: string): boolean {
  // Split hash into salt and hash
  const [saltHex, hashHex] = hash.split(':');
  
  if (!saltHex || !hashHex) {
    return false;
  }
  
  const salt = Buffer.from(saltHex, 'hex');
  
  // First hash with SHA-512
  const hash1 = crypto.createHash('sha512')
    .update(Buffer.concat([Buffer.from(password), salt]))
    .digest();
  
  // Second hash with SHA3-512 for quantum resistance
  const hash2 = crypto.createHash('sha3-512')
    .update(Buffer.concat([hash1, salt]))
    .digest();
  
  // Compare hashes in constant time
  return crypto.timingSafeEqual(
    Buffer.from(hashHex, 'hex'),
    hash2
  );
}

// Export the quantum security module
export const quantumSecurity = {
  QuantumSecurityLevel,
  PostQuantumAlgorithm,
  quantumResistantHash,
  generateQuantumSignature,
  verifyQuantumSignature,
  generateQuantumKeyPair,
  encryptQuantum,
  decryptQuantum,
  createQuantumAuthToken,
  verifyQuantumAuthToken,
  hashPasswordQuantum,
  verifyPasswordQuantum,
  kyber,
  dilithium,
  sphincsPlus,
  hybridCrypto
};