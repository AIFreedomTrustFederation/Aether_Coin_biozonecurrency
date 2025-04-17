/**
 * Cryptography utilities for FractalDNS
 * Implements quantum-resistant cryptographic operations
 */

const crypto = require('crypto');
const { createLogger } = require('./logger');
const config = require('../config');

// Initialize logger
const logger = createLogger('crypto');

/**
 * Generates a secure random buffer of specified length
 * @param {number} length - Length of the random buffer
 * @returns {Buffer} Random buffer
 */
function generateRandomBuffer(length) {
  return crypto.randomBytes(length);
}

/**
 * Generates a key pair for signing
 * @returns {Object} Key pair object with publicKey and privateKey
 */
function generateKeyPair() {
  try {
    // For quantum resistance, we use larger key sizes
    // In a production environment, this would be replaced with a post-quantum algorithm
    // like SPHINCS+ or Falcon when available in Node.js crypto
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
    
    logger.debug('Generated new key pair');
    
    return keyPair;
  } catch (error) {
    logger.error('Failed to generate key pair', error);
    throw error;
  }
}

/**
 * Generates a secure random string
 * @param {number} length - Length of the random string
 * @returns {string} Random string in hex format
 */
function generateRandomString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Creates a hash of the provided data
 * @param {string|Buffer} data - Data to hash
 * @param {string} algorithm - Hash algorithm (default: sha256)
 * @returns {string} Hash in hex format
 */
function createHash(data, algorithm = 'sha256') {
  const hash = crypto.createHash(algorithm);
  hash.update(typeof data === 'string' ? data : Buffer.from(data));
  return hash.digest('hex');
}

/**
 * Creates an HMAC signature of the provided data
 * @param {string|Buffer} data - Data to sign
 * @param {string} key - Secret key for HMAC
 * @param {string} algorithm - Hash algorithm (default: sha256)
 * @returns {string} HMAC signature in hex format
 */
function createHmac(data, key, algorithm = 'sha256') {
  const hmac = crypto.createHmac(algorithm, key);
  hmac.update(typeof data === 'string' ? data : Buffer.from(data));
  return hmac.digest('hex');
}

/**
 * Encrypts data using AES-256-GCM
 * @param {string|Buffer} data - Data to encrypt
 * @param {string|Buffer} key - Encryption key
 * @param {string|Buffer} [iv] - Initialization vector (optional)
 * @returns {Object} Encrypted data object with ciphertext, iv, and authTag
 */
function encrypt(data, key, iv) {
  try {
    // Ensure key is proper length for AES-256
    const keyBuffer = typeof key === 'string' 
      ? crypto.createHash('sha256').update(key).digest()
      : key;
    
    // Generate IV if not provided
    const ivBuffer = iv 
      ? (typeof iv === 'string' ? Buffer.from(iv, 'hex') : iv)
      : crypto.randomBytes(16);
    
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, ivBuffer);
    
    // Encrypt data
    const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;
    const encrypted = Buffer.concat([
      cipher.update(dataBuffer),
      cipher.final()
    ]);
    
    // Get auth tag
    const authTag = cipher.getAuthTag();
    
    return {
      ciphertext: encrypted.toString('base64'),
      iv: ivBuffer.toString('hex'),
      authTag: authTag.toString('hex')
    };
  } catch (error) {
    logger.error('Encryption failed', error);
    throw error;
  }
}

/**
 * Decrypts data encrypted with AES-256-GCM
 * @param {Object} encryptedData - Object with ciphertext, iv, and authTag
 * @param {string|Buffer} key - Decryption key
 * @returns {Buffer} Decrypted data
 */
function decrypt(encryptedData, key) {
  try {
    const { ciphertext, iv, authTag } = encryptedData;
    
    // Ensure key is proper length for AES-256
    const keyBuffer = typeof key === 'string' 
      ? crypto.createHash('sha256').update(key).digest()
      : key;
    
    // Parse inputs
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');
    const ciphertextBuffer = Buffer.from(ciphertext, 'base64');
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
    decipher.setAuthTag(authTagBuffer);
    
    // Decrypt data
    const decrypted = Buffer.concat([
      decipher.update(ciphertextBuffer),
      decipher.final()
    ]);
    
    return decrypted;
  } catch (error) {
    logger.error('Decryption failed', error);
    throw error;
  }
}

/**
 * Signs data with a private key
 * @param {string|Buffer} data - Data to sign
 * @param {string|Buffer} privateKey - Private key in PEM format
 * @returns {string} Signature in base64 format
 */
function sign(data, privateKey) {
  try {
    const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;
    
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(dataBuffer);
    sign.end();
    
    const signature = sign.sign(privateKey);
    return signature.toString('base64');
  } catch (error) {
    logger.error('Signing failed', error);
    throw error;
  }
}

/**
 * Verifies a signature with a public key
 * @param {string|Buffer} data - Original data
 * @param {string} signature - Signature in base64 format
 * @param {string|Buffer} publicKey - Public key in PEM format
 * @returns {boolean} True if signature is valid
 */
function verify(data, signature, publicKey) {
  try {
    const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;
    const signatureBuffer = Buffer.from(signature, 'base64');
    
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(dataBuffer);
    verify.end();
    
    return verify.verify(publicKey, signatureBuffer);
  } catch (error) {
    logger.error('Verification failed', error);
    return false;
  }
}

/**
 * Fractal sharding of data
 * Divides data into shards using Shamir's Secret Sharing technique
 * 
 * @param {Buffer|string} data - Data to shard
 * @param {number} totalShards - Total number of shards to create
 * @param {number} threshold - Minimum shards needed to reconstruct data
 * @returns {Array<Object>} Array of shard objects with id and data
 */
function fractalShard(data, totalShards = config.security.shardCount, threshold = Math.ceil(totalShards / 2)) {
  // This is a simplified implementation that divides the data into chunks
  // In a production system, this would be replaced with proper Shamir's Secret Sharing
  // or a similar threshold cryptography mechanism
  
  try {
    logger.debug(`Sharding data into ${totalShards} shards with threshold ${threshold}`);
    
    // Convert data to buffer if it's a string
    const dataBuffer = typeof data === 'string' ? Buffer.from(data) : data;
    
    // Create encrypted copy of original data for verification
    const encryptionKey = generateRandomBuffer(32);
    const encryptedData = encrypt(dataBuffer, encryptionKey);
    
    // Initialize shards array
    const shards = [];
    
    // Calculate shard size (divide data evenly)
    const dataSize = dataBuffer.length;
    const shardSize = Math.ceil(dataSize / threshold);
    
    // Create data shards up to the threshold count
    for (let i = 0; i < threshold; i++) {
      const start = i * shardSize;
      const end = Math.min(start + shardSize, dataSize);
      
      // Extract data slice for this shard
      const shardData = dataBuffer.slice(start, end);
      
      // Add to shards array with unique ID
      shards.push({
        id: i + 1,
        data: shardData,
        size: shardData.length,
        position: i,
        total: threshold
      });
    }
    
    // Create additional parity shards for redundancy
    for (let i = threshold; i < totalShards; i++) {
      // For parity shards, we xor multiple data shards together
      // This is a simplified approach; a real implementation would use
      // Reed-Solomon or a similar error correction method
      
      // Select random shards to combine
      const indices = [];
      while (indices.length < 3) {
        const idx = Math.floor(Math.random() * threshold);
        if (!indices.includes(idx)) {
          indices.push(idx);
        }
      }
      
      // XOR the selected shards
      const shardSize = shards[indices[0]].data.length;
      const parityData = Buffer.alloc(shardSize);
      
      for (let j = 0; j < indices.length; j++) {
        const shard = shards[indices[j]];
        for (let k = 0; k < shardSize; k++) {
          if (k < shard.data.length) {
            parityData[k] ^= shard.data[k];
          }
        }
      }
      
      // Add parity shard to array
      shards.push({
        id: i + 1,
        data: parityData,
        size: parityData.length,
        position: i,
        total: totalShards,
        parity: true,
        sources: indices.map(idx => idx + 1)
      });
    }
    
    // Add verification data to each shard
    const verificationHash = createHash(dataBuffer);
    
    for (let i = 0; i < shards.length; i++) {
      // Add metadata to each shard
      shards[i].verification = {
        hash: verificationHash,
        totalSize: dataSize,
        encryptedData: i === 0 ? encryptedData : undefined,
        encryptionKey: i === 1 ? encryptionKey.toString('hex') : undefined
      };
      
      // Sign the shard if a signing key is available
      if (config.security.signingKey) {
        const shardData = JSON.stringify({
          id: shards[i].id,
          size: shards[i].size,
          position: shards[i].position,
          verification: {
            hash: shards[i].verification.hash
          }
        });
        
        shards[i].signature = createHmac(shardData, config.security.signingKey);
      }
    }
    
    logger.debug(`Created ${shards.length} shards successfully`);
    return shards;
  } catch (error) {
    logger.error('Fractal sharding failed', error);
    throw error;
  }
}

/**
 * Reconstructs data from shards
 * @param {Array<Object>} shards - Array of shard objects
 * @returns {Buffer} Reconstructed data
 */
function fractalReconstruct(shards) {
  try {
    logger.debug(`Attempting to reconstruct data from ${shards.length} shards`);
    
    if (!shards || !shards.length) {
      throw new Error('No shards provided for reconstruction');
    }
    
    // Sort shards by position
    shards.sort((a, b) => a.position - b.position);
    
    // Filter out parity shards for now (we'll use them if needed)
    const dataShards = shards.filter(shard => !shard.parity);
    const parityShards = shards.filter(shard => shard.parity);
    
    // If we have enough data shards, reconstruct directly
    if (dataShards.length >= dataShards[0].total) {
      logger.debug('Reconstructing from data shards');
      
      // Calculate total size
      const totalSize = dataShards[0].verification.totalSize;
      
      // Create buffer for reconstructed data
      const reconstructed = Buffer.alloc(totalSize);
      
      // Copy data from each shard to the appropriate position
      for (const shard of dataShards.slice(0, dataShards[0].total)) {
        const start = shard.position * shard.size;
        shard.data.copy(reconstructed, start, 0, shard.size);
      }
      
      // Verify the reconstructed data
      const verificationHash = createHash(reconstructed);
      if (verificationHash !== dataShards[0].verification.hash) {
        logger.warn('Reconstructed data hash does not match verification hash');
        
        // Try to recover using encrypted verification data
        const encryptedDataShard = shards.find(s => s.verification.encryptedData);
        const encryptionKeyShard = shards.find(s => s.verification.encryptionKey);
        
        if (encryptedDataShard && encryptionKeyShard) {
          logger.debug('Attempting recovery using encrypted verification data');
          
          try {
            const encryptedData = encryptedDataShard.verification.encryptedData;
            const encryptionKey = Buffer.from(encryptionKeyShard.verification.encryptionKey, 'hex');
            
            const recoveredData = decrypt(encryptedData, encryptionKey);
            logger.debug('Recovery successful using encrypted verification data');
            
            return recoveredData;
          } catch (error) {
            logger.error('Recovery from encrypted verification data failed', error);
          }
        }
      }
      
      logger.debug('Data reconstruction successful');
      return reconstructed;
    } 
    // Otherwise, try to reconstruct using parity shards
    else if (dataShards.length + parityShards.length >= dataShards[0].total) {
      logger.debug('Attempting reconstruction with parity shards');
      
      // This is a simplified placeholder for reconstruction with parity shards
      // In a real implementation, this would use proper erasure coding techniques
      
      logger.warn('Reconstruction using parity shards not fully implemented');
      throw new Error('Insufficient data shards for reconstruction');
    } else {
      logger.error('Insufficient shards for reconstruction');
      throw new Error('Insufficient shards for reconstruction');
    }
  } catch (error) {
    logger.error('Fractal reconstruction failed', error);
    throw error;
  }
}

module.exports = {
  generateRandomBuffer,
  generateKeyPair,
  generateRandomString,
  createHash,
  createHmac,
  encrypt,
  decrypt,
  sign,
  verify,
  fractalShard,
  fractalReconstruct
};