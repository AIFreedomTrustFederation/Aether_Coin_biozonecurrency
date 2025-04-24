/**
 * Secure key storage for API keys
 * 
 * Provides functionality to securely store and retrieve API keys
 * locally without committing them to the repository
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class KeyStorage {
  constructor(options = {}) {
    this.storageDir = options.storageDir || '.mysterion-keys';
    this.encryptionKey = options.encryptionKey || null;
    
    // Ensure the storage directory exists
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }
  
  /**
   * Generate a storage key for a specific service and user
   * @param {string} service - Service name (e.g., 'openai')
   * @param {string} userId - User identifier
   * @returns {string} Hashed storage key
   */
  _generateStorageKey(service, userId) {
    const combined = `${service.toLowerCase()}-${userId || 'default'}`;
    return crypto.createHash('sha256').update(combined).digest('hex');
  }
  
  /**
   * Encrypt data if an encryption key is available
   * @param {string} data - Data to encrypt
   * @returns {string} Encrypted data or plain data if no encryption key
   */
  _encrypt(data) {
    if (!this.encryptionKey) {
      // Simple obfuscation if no encryption key is provided
      return Buffer.from(data).toString('base64');
    }
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc', 
      Buffer.from(this.encryptionKey.padEnd(32).slice(0, 32)), 
      iv
    );
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }
  
  /**
   * Decrypt data that was encrypted with the encryption key
   * @param {string} data - Encrypted data
   * @returns {string} Decrypted data
   */
  _decrypt(data) {
    if (!this.encryptionKey) {
      // Simple deobfuscation if no encryption key was provided
      return Buffer.from(data, 'base64').toString('utf8');
    }
    
    const [ivHex, encryptedHex] = data.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc', 
      Buffer.from(this.encryptionKey.padEnd(32).slice(0, 32)), 
      iv
    );
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  /**
   * Store an API key for a specific service and user
   * @param {string} service - Service name (e.g., 'openai')
   * @param {string} apiKey - API key to store
   * @param {string} userId - Optional user identifier
   * @returns {boolean} True if successful
   */
  storeKey(service, apiKey, userId = 'default') {
    try {
      const storageKey = this._generateStorageKey(service, userId);
      const filePath = path.join(this.storageDir, `${storageKey}.key`);
      
      const encryptedKey = this._encrypt(apiKey);
      fs.writeFileSync(filePath, encryptedKey);
      
      return true;
    } catch (error) {
      console.error('Error storing API key:', error);
      return false;
    }
  }
  
  /**
   * Retrieve an API key for a specific service and user
   * @param {string} service - Service name (e.g., 'openai')
   * @param {string} userId - Optional user identifier
   * @returns {string|null} Retrieved API key or null if not found
   */
  retrieveKey(service, userId = 'default') {
    try {
      const storageKey = this._generateStorageKey(service, userId);
      const filePath = path.join(this.storageDir, `${storageKey}.key`);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }
      
      const encryptedKey = fs.readFileSync(filePath, 'utf8');
      return this._decrypt(encryptedKey);
    } catch (error) {
      console.error('Error retrieving API key:', error);
      return null;
    }
  }
  
  /**
   * Check if a key exists for a specific service and user
   * @param {string} service - Service name (e.g., 'openai')
   * @param {string} userId - Optional user identifier
   * @returns {boolean} True if key exists
   */
  hasKey(service, userId = 'default') {
    const storageKey = this._generateStorageKey(service, userId);
    const filePath = path.join(this.storageDir, `${storageKey}.key`);
    return fs.existsSync(filePath);
  }
  
  /**
   * Delete a stored key for a specific service and user
   * @param {string} service - Service name (e.g., 'openai')
   * @param {string} userId - Optional user identifier
   * @returns {boolean} True if successfully deleted
   */
  deleteKey(service, userId = 'default') {
    try {
      const storageKey = this._generateStorageKey(service, userId);
      const filePath = path.join(this.storageDir, `${storageKey}.key`);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting API key:', error);
      return false;
    }
  }
}

export default KeyStorage;