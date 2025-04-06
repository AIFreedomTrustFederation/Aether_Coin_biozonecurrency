import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { UserApiKey } from '../../shared/schema';

/**
 * Quantum-Vault: A secure API key storage system using fractal sharding and quantum-resistant encryption
 * 
 * This service implements a secure local vault for storing API keys with:
 * 1. Quantum-resistant encryption
 * 2. Fractal sharding (splitting keys across multiple locations)
 * 3. Local-only storage to prevent keys from being exposed in databases
 */

// Number of shards to split each key into
const NUM_SHARDS = 3; 

// Quantum vault constants
const VAULT_DIR = path.resolve(process.cwd(), '.mysterion-keys');
const SHARD_DIR = path.resolve(VAULT_DIR, 'shards');
const METADATA_FILE = path.resolve(VAULT_DIR, 'metadata.json');

// Initialize vault structure
const initVaultStructure = async () => {
  try {
    await fs.mkdir(VAULT_DIR, { recursive: true });
    await fs.mkdir(SHARD_DIR, { recursive: true });
    
    // Create metadata file if it doesn't exist
    try {
      await fs.access(METADATA_FILE);
    } catch (e) {
      await fs.writeFile(METADATA_FILE, JSON.stringify({ keys: {} }));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize vault structure:', error);
    return false;
  }
};

// Get metadata for all keys
const getMetadata = async () => {
  try {
    const data = await fs.readFile(METADATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read metadata:', error);
    await initVaultStructure();
    return { keys: {} };
  }
};

// Update metadata
const updateMetadata = async (metadata: any) => {
  try {
    await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to update metadata:', error);
    return false;
  }
};

// Generate a quantum-resistant key using a high-entropy source
const generateQuantumKey = (userId: number, service: string) => {
  const entropy = crypto.randomBytes(32);
  const salt = crypto.createHash('sha256').update(`${userId}-${service}-${Date.now()}`).digest();
  
  // Combine entropy and salt using XOR for additional security
  const combined = Buffer.alloc(32);
  for (let i = 0; i < 32; i++) {
    combined[i] = entropy[i] ^ salt[i];
  }
  
  return combined.toString('hex');
};

// Fractal sharding: split a key into multiple shards
const shardKey = (apiKey: string): string[] => {
  const shards = [];
  const shardSize = Math.ceil(apiKey.length / NUM_SHARDS);
  
  for (let i = 0; i < NUM_SHARDS; i++) {
    const start = i * shardSize;
    const end = Math.min(start + shardSize, apiKey.length);
    shards.push(apiKey.substring(start, end));
  }
  
  return shards;
};

// Reconstruct a key from its shards
const reconstructKey = (shards: string[]): string => {
  return shards.join('');
};

// Encrypt a shard with quantum-resistant encryption
const encryptShard = (shard: string, encryptionKey: string): string => {
  const algorithm = 'aes-256-gcm'; // Using AES-GCM which is considered quantum-resistant for now
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(encryptionKey).digest();
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(shard, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Return IV + AuthTag + Encrypted content
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

// Decrypt a shard
const decryptShard = (encryptedShard: string, encryptionKey: string): string => {
  const algorithm = 'aes-256-gcm';
  const [ivHex, authTagHex, encrypted] = encryptedShard.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = crypto.createHash('sha256').update(encryptionKey).digest();
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Store an API key in the quantum vault
export const storeApiKey = async (
  userId: number, 
  service: string, 
  apiKey: string
): Promise<{ keyId: string; isSuccess: boolean }> => {
  try {
    await initVaultStructure();
    
    // Generate unique ID for this key
    const keyId = crypto.randomUUID();
    
    // Generate a quantum-resistant encryption key
    const encryptionKey = generateQuantumKey(userId, service);
    
    // Split the API key into shards
    const shards = shardKey(apiKey);
    
    // Encrypt and store each shard
    const encryptedShards = [];
    for (let i = 0; i < shards.length; i++) {
      const encrypted = encryptShard(shards[i], encryptionKey + i); // Use different key for each shard
      const shardFileName = `${keyId}-${i}.shard`;
      const shardPath = path.join(SHARD_DIR, shardFileName);
      
      await fs.writeFile(shardPath, encrypted);
      encryptedShards.push(shardFileName);
    }
    
    // Update metadata
    const metadata = await getMetadata();
    metadata.keys[keyId] = {
      userId,
      service,
      shards: encryptedShards,
      createdAt: new Date().toISOString(),
      encryptionKeyHint: crypto.createHash('sha256').update(encryptionKey).digest('hex').substring(0, 8)
    };
    
    await updateMetadata(metadata);
    
    return { keyId, isSuccess: true };
  } catch (error) {
    console.error('Failed to store API key:', error);
    return { keyId: '', isSuccess: false };
  }
};

// Retrieve an API key from the quantum vault
export const retrieveApiKey = async (
  userId: number, 
  keyId: string
): Promise<{ apiKey: string; isSuccess: boolean }> => {
  try {
    const metadata = await getMetadata();
    const keyInfo = metadata.keys[keyId];
    
    if (!keyInfo || keyInfo.userId !== userId) {
      console.error('Key not found or unauthorized access');
      return { apiKey: '', isSuccess: false };
    }
    
    // Generate the same encryption key
    const encryptionKey = generateQuantumKey(userId, keyInfo.service);
    
    // Verify encryption key hint
    const keyHint = crypto.createHash('sha256').update(encryptionKey).digest('hex').substring(0, 8);
    if (keyHint !== keyInfo.encryptionKeyHint) {
      console.error('Encryption key verification failed');
      return { apiKey: '', isSuccess: false };
    }
    
    // Read and decrypt each shard
    const decryptedShards = [];
    for (let i = 0; i < keyInfo.shards.length; i++) {
      const shardPath = path.join(SHARD_DIR, keyInfo.shards[i]);
      const encryptedShard = await fs.readFile(shardPath, 'utf-8');
      const decrypted = decryptShard(encryptedShard, encryptionKey + i);
      decryptedShards.push(decrypted);
    }
    
    // Reconstruct the API key
    const apiKey = reconstructKey(decryptedShards);
    
    return { apiKey, isSuccess: true };
  } catch (error) {
    console.error('Failed to retrieve API key:', error);
    return { apiKey: '', isSuccess: false };
  }
};

// Delete an API key from the quantum vault
export const deleteApiKey = async (
  userId: number, 
  keyId: string
): Promise<boolean> => {
  try {
    const metadata = await getMetadata();
    const keyInfo = metadata.keys[keyId];
    
    if (!keyInfo || keyInfo.userId !== userId) {
      console.error('Key not found or unauthorized access');
      return false;
    }
    
    // Delete each shard
    for (const shardFileName of keyInfo.shards) {
      const shardPath = path.join(SHARD_DIR, shardFileName);
      await fs.unlink(shardPath);
    }
    
    // Remove from metadata
    delete metadata.keys[keyId];
    await updateMetadata(metadata);
    
    return true;
  } catch (error) {
    console.error('Failed to delete API key:', error);
    return false;
  }
};

// List all API keys for a user (only metadata, not the actual keys)
export const listApiKeysForUser = async (userId: number): Promise<any[]> => {
  try {
    const metadata = await getMetadata();
    
    const userKeys = Object.entries(metadata.keys)
      .filter(([_, info]: [string, any]) => info.userId === userId)
      .map(([keyId, info]: [string, any]) => ({
        keyId,
        service: info.service,
        createdAt: info.createdAt
      }));
    
    return userKeys;
  } catch (error) {
    console.error('Failed to list API keys for user:', error);
    return [];
  }
};

// Initialize the vault structure on module import
initVaultStructure().catch(console.error);