/**
 * Credential Manager
 * 
 * Securely manages API credentials in memory without persistent storage.
 * Provides encryption utilities for secure credential handling.
 */

const crypto = require('crypto');

/**
 * Credential Manager Class
 * Handles secure storage and management of API credentials
 */
class CredentialManager {
  /**
   * Initialize the credential manager
   * @param {Object} options - Configuration options
   * @param {Object} options.logger - Logger instance
   * @param {number} options.defaultTTL - Default credential time-to-live in seconds
   * @param {string} options.encryptionKey - Optional encryption key for temporary persistence
   */
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.defaultTTL = options.defaultTTL || 3600; // 1 hour default
    this.encryptionKey = options.encryptionKey || null;
    this.credentials = new Map();
    this.logger.info('Credential Manager initialized');
  }

  /**
   * Generate a secure encryption key
   * @returns {Object} - Generated key and initialization vector
   */
  generateEncryptionKey() {
    const key = crypto.randomBytes(32); // 256 bits
    const iv = crypto.randomBytes(16); // 128 bits
    return { key, iv };
  }

  /**
   * Encrypt sensitive data
   * @param {string} data - Data to encrypt
   * @param {Buffer} key - Encryption key
   * @param {Buffer} iv - Initialization vector
   * @returns {string} - Encrypted data as hex string
   */
  encrypt(data, key, iv) {
    if (!key || !iv) {
      throw new Error('Encryption key and IV are required');
    }
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypt sensitive data
   * @param {string} encryptedData - Encrypted data as hex string
   * @param {Buffer} key - Encryption key
   * @param {Buffer} iv - Initialization vector
   * @returns {string} - Decrypted data
   */
  decrypt(encryptedData, key, iv) {
    if (!key || !iv) {
      throw new Error('Encryption key and IV are required');
    }
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Store credentials for a session
   * @param {string} sessionId - Unique session identifier
   * @param {string} service - Service identifier (e.g., 'openai', 'huggingface')
   * @param {Object} credentials - Credential object
   * @param {number} ttl - Optional time-to-live in seconds
   */
  setCredentials(sessionId, service, credentials, ttl = this.defaultTTL) {
    this.logger.debug(`Setting ${service} credentials for session ${sessionId}`);
    
    const expiryTime = Date.now() + (ttl * 1000);
    const key = `${sessionId}:${service}`;
    
    this.credentials.set(key, {
      credentials,
      expiryTime
    });
    
    // Set up automatic cleanup after expiry
    setTimeout(() => {
      this.clearCredentials(sessionId, service);
    }, ttl * 1000);
  }

  /**
   * Get credentials for a session
   * @param {string} sessionId - Unique session identifier
   * @param {string} service - Service identifier (e.g., 'openai', 'huggingface')
   * @returns {Object|null} - Credentials object or null if not found
   */
  getCredentials(sessionId, service) {
    const key = `${sessionId}:${service}`;
    const data = this.credentials.get(key);
    
    if (!data) {
      return null;
    }
    
    // Check if credentials are still valid
    if (data.expiryTime > Date.now()) {
      return data.credentials;
    } else {
      // Credentials expired, clean up
      this.clearCredentials(sessionId, service);
      return null;
    }
  }

  /**
   * Clear credentials for a session
   * @param {string} sessionId - Unique session identifier
   * @param {string} service - Service identifier (e.g., 'openai', 'huggingface')
   */
  clearCredentials(sessionId, service) {
    const key = `${sessionId}:${service}`;
    this.logger.debug(`Clearing ${service} credentials for session ${sessionId}`);
    this.credentials.delete(key);
  }

  /**
   * Clear all credentials for a session
   * @param {string} sessionId - Unique session identifier
   */
  clearAllCredentials(sessionId) {
    this.logger.debug(`Clearing all credentials for session ${sessionId}`);
    
    // Find and remove all credentials for this session
    for (const key of this.credentials.keys()) {
      if (key.startsWith(`${sessionId}:`)) {
        this.credentials.delete(key);
      }
    }
  }

  /**
   * Check if credentials exist for a session
   * @param {string} sessionId - Unique session identifier
   * @param {string} service - Service identifier (e.g., 'openai', 'huggingface')
   * @returns {boolean} - True if valid credentials exist
   */
  hasCredentials(sessionId, service) {
    return this.getCredentials(sessionId, service) !== null;
  }
}

module.exports = CredentialManager;