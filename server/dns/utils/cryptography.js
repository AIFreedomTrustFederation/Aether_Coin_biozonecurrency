/**
 * Cryptography utilities for FractalDNS
 * Implements quantum-resistant algorithms for DNS security
 */

const crypto = require('crypto');
const { promisify } = require('util');
const { createLogger } = require('./logger');

const logger = createLogger('cryptography');

/**
 * Generate a key pair for quantum-resistant cryptography
 * In a real implementation, this would use a post-quantum algorithm
 * This example uses RSA as a placeholder
 */
async function generateKeyPair() {
  try {
    const generateKeyPairAsync = promisify(crypto.generateKeyPair);
    
    // Note: In a production system, you would use a quantum-resistant algorithm
    // This is a placeholder using RSA
    const keyPair = await generateKeyPairAsync('rsa', {
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
    
    logger.info('Generated new cryptographic key pair');
    return keyPair;
  } catch (error) {
    logger.error('Failed to generate key pair:', error);
    throw error;
  }
}

/**
 * Encrypt data using hybrid encryption (quantum + classical)
 * @param {string|Buffer} data - Data to encrypt
 * @param {string} publicKey - Recipient's public key
 * @returns {object} - Encrypted data and metadata
 */
function hybridEncrypt(data, publicKey) {
  try {
    // Generate a random symmetric key
    const symmetricKey = crypto.randomBytes(32);
    
    // Encrypt the symmetric key with the public key
    const encryptedKey = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
      },
      symmetricKey
    );
    
    // Encrypt the data with the symmetric key
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, iv);
    
    let encryptedData = cipher.update(data instanceof Buffer ? data : Buffer.from(data, 'utf8'));
    encryptedData = Buffer.concat([encryptedData, cipher.final()]);
    const authTag = cipher.getAuthTag();
    
    return {
      encryptedData: encryptedData.toString('base64'),
      iv: iv.toString('base64'),
      encryptedKey: encryptedKey.toString('base64'),
      authTag: authTag.toString('base64'),
      algorithm: 'aes-256-gcm+rsa'
    };
  } catch (error) {
    logger.error('Hybrid encryption failed:', error);
    throw error;
  }
}

/**
 * Decrypt data using hybrid encryption
 * @param {object} encryptedPackage - The encrypted data package
 * @param {string} privateKey - Recipient's private key
 * @returns {Buffer} - Decrypted data
 */
function hybridDecrypt(encryptedPackage, privateKey) {
  try {
    // Decrypt the symmetric key with the private key
    const encryptedKey = Buffer.from(encryptedPackage.encryptedKey, 'base64');
    const symmetricKey = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
      },
      encryptedKey
    );
    
    // Decrypt the data with the symmetric key
    const iv = Buffer.from(encryptedPackage.iv, 'base64');
    const encryptedData = Buffer.from(encryptedPackage.encryptedData, 'base64');
    const authTag = Buffer.from(encryptedPackage.authTag, 'base64');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', symmetricKey, iv);
    decipher.setAuthTag(authTag);
    
    let decryptedData = decipher.update(encryptedData);
    decryptedData = Buffer.concat([decryptedData, decipher.final()]);
    
    return decryptedData;
  } catch (error) {
    logger.error('Hybrid decryption failed:', error);
    throw error;
  }
}

/**
 * Sign data with a private key
 * @param {string|Buffer} data - Data to sign
 * @param {string} privateKey - Private key for signing
 * @returns {string} - Base64 signature
 */
function signData(data, privateKey) {
  try {
    const sign = crypto.createSign('sha256');
    sign.update(data instanceof Buffer ? data : Buffer.from(data, 'utf8'));
    return sign.sign(privateKey, 'base64');
  } catch (error) {
    logger.error('Data signing failed:', error);
    throw error;
  }
}

/**
 * Verify a signature
 * @param {string|Buffer} data - Original data
 * @param {string} signature - Base64 signature
 * @param {string} publicKey - Public key for verification
 * @returns {boolean} - Whether the signature is valid
 */
function verifySignature(data, signature, publicKey) {
  try {
    const verify = crypto.createVerify('sha256');
    verify.update(data instanceof Buffer ? data : Buffer.from(data, 'utf8'));
    return verify.verify(publicKey, Buffer.from(signature, 'base64'));
  } catch (error) {
    logger.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Create a fractal shard distribution of data
 * @param {Array} records - Records to shard
 * @param {number} shardCount - Number of shards to create
 * @returns {Map} - Map of shard IDs to records
 */
function createFractalShards(records, shardCount = 64) {
  const shards = new Map();
  
  for (let i = 0; i < shardCount; i++) {
    shards.set(`shard-${i}`, []);
  }
  
  // Distribute records across shards
  for (const record of records) {
    const recordId = record.domain + record.type;
    const hash = crypto.createHash('sha256').update(recordId).digest('hex');
    const shardIndex = parseInt(hash.substring(0, 8), 16) % shardCount;
    
    const shardId = `shard-${shardIndex}`;
    const shard = shards.get(shardId);
    shard.push(record);
  }
  
  logger.debug(`Created ${shardCount} fractal shards from ${records.length} records`);
  return shards;
}

/**
 * Reconstruct records from fractal shards
 * @param {Map} shards - Map of shard IDs to records
 * @returns {Array} - Reconstructed records
 */
function reconstructFromShards(shards) {
  const records = [];
  
  for (const [_, shard] of shards.entries()) {
    records.push(...shard);
  }
  
  // Remove duplicates
  const uniqueRecords = [];
  const seen = new Set();
  
  for (const record of records) {
    const recordId = record.domain + record.type;
    if (!seen.has(recordId)) {
      seen.add(recordId);
      uniqueRecords.push(record);
    }
  }
  
  logger.debug(`Reconstructed ${uniqueRecords.length} unique records from ${shards.size} shards`);
  return uniqueRecords;
}

module.exports = {
  generateKeyPair,
  hybridEncrypt,
  hybridDecrypt,
  signData,
  verifySignature,
  createFractalShards,
  reconstructFromShards
};