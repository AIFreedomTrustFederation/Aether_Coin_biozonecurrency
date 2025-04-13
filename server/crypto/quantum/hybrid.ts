/**
 * Hybrid Cryptography Module
 * 
 * This module provides hybrid cryptographic algorithms that combine
 * classical cryptography (RSA, ECDSA) with post-quantum algorithms
 * for enhanced security during the transition period.
 * 
 * The hybrid approach ensures that even if one algorithm is broken
 * (either classical by quantum computers or post-quantum by unforeseen attacks),
 * the overall security remains intact.
 */

import crypto from 'crypto';
import { kyber } from './kyber';
import { dilithium } from './dilithium';

/**
 * Generate a hybrid RSA+Kyber key pair
 * 
 * @returns Object containing hybrid public and private keys
 */
async function generateRsaKyberKeyPair(): Promise<{ publicKey: Buffer; privateKey: Buffer }> {
  // Generate RSA key pair
  const rsaKeyPair = crypto.generateKeyPairSync('rsa', {
    modulusLength: 3072, // 3072 bits for ~128-bit security
    publicKeyEncoding: {
      type: 'spki',
      format: 'der'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'der'
    }
  });
  
  // Generate Kyber key pair
  const kyberKeyPair = await kyber.generateKeyPair(kyber.KyberMode.KYBER_1024);
  
  // Combine the keys with headers
  const publicKey = Buffer.concat([
    Buffer.from('HYBRID-RSA-KYBER-PUBLIC:'),
    Buffer.from([rsaKeyPair.publicKey.length >> 8, rsaKeyPair.publicKey.length & 0xff]), // 2-byte length prefix
    rsaKeyPair.publicKey,
    Buffer.from([kyberKeyPair.publicKey.length >> 8, kyberKeyPair.publicKey.length & 0xff]), // 2-byte length prefix
    kyberKeyPair.publicKey
  ]);
  
  const privateKey = Buffer.concat([
    Buffer.from('HYBRID-RSA-KYBER-PRIVATE:'),
    Buffer.from([rsaKeyPair.privateKey.length >> 8, rsaKeyPair.privateKey.length & 0xff]), // 2-byte length prefix
    rsaKeyPair.privateKey,
    Buffer.from([kyberKeyPair.privateKey.length >> 8, kyberKeyPair.privateKey.length & 0xff]), // 2-byte length prefix
    kyberKeyPair.privateKey
  ]);
  
  return { publicKey, privateKey };
}

/**
 * Generate a hybrid ECDSA+Dilithium key pair
 * 
 * @returns Object containing hybrid public and private keys
 */
async function generateEcdsaDilithiumKeyPair(): Promise<{ publicKey: Buffer; privateKey: Buffer }> {
  // Generate ECDSA key pair
  const ecdsaKeyPair = crypto.generateKeyPairSync('ec', {
    namedCurve: 'secp384r1', // P-384 curve for ~192-bit security
    publicKeyEncoding: {
      type: 'spki',
      format: 'der'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'der'
    }
  });
  
  // Generate Dilithium key pair
  const dilithiumKeyPair = await dilithium.generateKeyPair(dilithium.DilithiumMode.DILITHIUM_5);
  
  // Combine the keys with headers
  const publicKey = Buffer.concat([
    Buffer.from('HYBRID-ECDSA-DILITHIUM-PUBLIC:'),
    Buffer.from([ecdsaKeyPair.publicKey.length >> 8, ecdsaKeyPair.publicKey.length & 0xff]), // 2-byte length prefix
    ecdsaKeyPair.publicKey,
    Buffer.from([dilithiumKeyPair.publicKey.length >> 8, dilithiumKeyPair.publicKey.length & 0xff]), // 2-byte length prefix
    dilithiumKeyPair.publicKey
  ]);
  
  const privateKey = Buffer.concat([
    Buffer.from('HYBRID-ECDSA-DILITHIUM-PRIVATE:'),
    Buffer.from([ecdsaKeyPair.privateKey.length >> 8, ecdsaKeyPair.privateKey.length & 0xff]), // 2-byte length prefix
    ecdsaKeyPair.privateKey,
    Buffer.from([dilithiumKeyPair.privateKey.length >> 8, dilithiumKeyPair.privateKey.length & 0xff]), // 2-byte length prefix
    dilithiumKeyPair.privateKey
  ]);
  
  return { publicKey, privateKey };
}

/**
 * Encrypt data using hybrid RSA+Kyber encryption
 * 
 * @param data Data to encrypt
 * @param publicKey Recipient's hybrid public key
 * @returns Encrypted data
 */
async function encryptRsaKyber(data: Buffer, publicKey: Buffer): Promise<Buffer> {
  // Extract the public keys
  const publicKeyStr = publicKey.toString();
  if (!publicKeyStr.startsWith('HYBRID-RSA-KYBER-PUBLIC:')) {
    throw new Error('Invalid hybrid RSA+Kyber public key format');
  }
  
  const headerLength = 'HYBRID-RSA-KYBER-PUBLIC:'.length;
  
  // Extract RSA public key
  const rsaKeyLength = (publicKey[headerLength] << 8) | publicKey[headerLength + 1];
  const rsaPublicKey = publicKey.subarray(headerLength + 2, headerLength + 2 + rsaKeyLength);
  
  // Extract Kyber public key
  const kyberKeyOffset = headerLength + 2 + rsaKeyLength;
  const kyberKeyLength = (publicKey[kyberKeyOffset] << 8) | publicKey[kyberKeyOffset + 1];
  const kyberPublicKey = publicKey.subarray(kyberKeyOffset + 2, kyberKeyOffset + 2 + kyberKeyLength);
  
  // Generate a random symmetric key
  const symmetricKey = crypto.randomBytes(32);
  
  // Encrypt the symmetric key with both RSA and Kyber
  const rsaEncryptedKey = crypto.publicEncrypt(
    {
      key: Buffer.from(rsaPublicKey),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    symmetricKey
  );
  
  const kyberEncryptedKey = await kyber.encrypt(symmetricKey, kyberPublicKey);
  
  // Encrypt the data with AES-256-GCM using the symmetric key
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', symmetricKey, iv);
  
  const encryptedData = Buffer.concat([
    cipher.update(data),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Combine all components
  return Buffer.concat([
    Buffer.from('HYBRID-RSA-KYBER-ENCRYPTED:'),
    // RSA encrypted key
    Buffer.from([rsaEncryptedKey.length >> 8, rsaEncryptedKey.length & 0xff]), // 2-byte length prefix
    rsaEncryptedKey,
    // Kyber encrypted key
    Buffer.from([kyberEncryptedKey.length >> 8, kyberEncryptedKey.length & 0xff]), // 2-byte length prefix
    kyberEncryptedKey,
    // IV and auth tag
    iv,
    authTag,
    // Encrypted data
    encryptedData
  ]);
}

/**
 * Decrypt data using hybrid RSA+Kyber encryption
 * 
 * @param encryptedData Encrypted data
 * @param privateKey Recipient's hybrid private key
 * @returns Decrypted data
 */
async function decryptRsaKyber(encryptedData: Buffer, privateKey: Buffer): Promise<Buffer> {
  // Extract the private keys
  const privateKeyStr = privateKey.toString();
  if (!privateKeyStr.startsWith('HYBRID-RSA-KYBER-PRIVATE:')) {
    throw new Error('Invalid hybrid RSA+Kyber private key format');
  }
  
  const headerLength = 'HYBRID-RSA-KYBER-PRIVATE:'.length;
  
  // Extract RSA private key
  const rsaKeyLength = (privateKey[headerLength] << 8) | privateKey[headerLength + 1];
  const rsaPrivateKey = privateKey.subarray(headerLength + 2, headerLength + 2 + rsaKeyLength);
  
  // Extract Kyber private key
  const kyberKeyOffset = headerLength + 2 + rsaKeyLength;
  const kyberKeyLength = (privateKey[kyberKeyOffset] << 8) | privateKey[kyberKeyOffset + 1];
  const kyberPrivateKey = privateKey.subarray(kyberKeyOffset + 2, kyberKeyOffset + 2 + kyberKeyLength);
  
  // Extract the encrypted components
  const encryptedDataStr = encryptedData.toString();
  if (!encryptedDataStr.startsWith('HYBRID-RSA-KYBER-ENCRYPTED:')) {
    throw new Error('Invalid hybrid RSA+Kyber encrypted data format');
  }
  
  const encHeaderLength = 'HYBRID-RSA-KYBER-ENCRYPTED:'.length;
  
  // Extract RSA encrypted key
  const rsaEncKeyLength = (encryptedData[encHeaderLength] << 8) | encryptedData[encHeaderLength + 1];
  const rsaEncryptedKey = encryptedData.subarray(encHeaderLength + 2, encHeaderLength + 2 + rsaEncKeyLength);
  
  // Extract Kyber encrypted key
  const kyberEncKeyOffset = encHeaderLength + 2 + rsaEncKeyLength;
  const kyberEncKeyLength = (encryptedData[kyberEncKeyOffset] << 8) | encryptedData[kyberEncKeyOffset + 1];
  const kyberEncryptedKey = encryptedData.subarray(kyberEncKeyOffset + 2, kyberEncKeyOffset + 2 + kyberEncKeyLength);
  
  // Extract IV, auth tag, and encrypted data
  const ivOffset = kyberEncKeyOffset + 2 + kyberEncKeyLength;
  const iv = encryptedData.subarray(ivOffset, ivOffset + 12);
  const authTag = encryptedData.subarray(ivOffset + 12, ivOffset + 12 + 16);
  const encryptedContent = encryptedData.subarray(ivOffset + 12 + 16);
  
  // Try to decrypt the symmetric key with both RSA and Kyber
  let symmetricKey: Buffer;
  
  try {
    // First try RSA decryption
    symmetricKey = crypto.privateDecrypt(
      {
        key: Buffer.from(rsaPrivateKey),
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      rsaEncryptedKey
    );
  } catch (rsaError) {
    try {
      // If RSA fails, try Kyber decryption
      symmetricKey = await kyber.decrypt(kyberEncryptedKey, kyberPrivateKey);
    } catch (kyberError) {
      throw new Error('Failed to decrypt with both RSA and Kyber: ' + 
                     (rsaError as Error).message + ', ' + 
                     (kyberError as Error).message);
    }
  }
  
  // Decrypt the data with AES-256-GCM
  const decipher = crypto.createDecipheriv('aes-256-gcm', symmetricKey, iv);
  decipher.setAuthTag(authTag);
  
  return Buffer.concat([
    decipher.update(encryptedContent),
    decipher.final()
  ]);
}

/**
 * Sign data using hybrid ECDSA+Dilithium signatures
 * 
 * @param data Data to sign
 * @param privateKey Signer's hybrid private key
 * @returns Hybrid signature
 */
async function signEcdsaDilithium(data: Buffer, privateKey: Buffer): Promise<Buffer> {
  // Extract the private keys
  const privateKeyStr = privateKey.toString();
  if (!privateKeyStr.startsWith('HYBRID-ECDSA-DILITHIUM-PRIVATE:')) {
    throw new Error('Invalid hybrid ECDSA+Dilithium private key format');
  }
  
  const headerLength = 'HYBRID-ECDSA-DILITHIUM-PRIVATE:'.length;
  
  // Extract ECDSA private key
  const ecdsaKeyLength = (privateKey[headerLength] << 8) | privateKey[headerLength + 1];
  const ecdsaPrivateKey = privateKey.subarray(headerLength + 2, headerLength + 2 + ecdsaKeyLength);
  
  // Extract Dilithium private key
  const dilithiumKeyOffset = headerLength + 2 + ecdsaKeyLength;
  const dilithiumKeyLength = (privateKey[dilithiumKeyOffset] << 8) | privateKey[dilithiumKeyOffset + 1];
  const dilithiumPrivateKey = privateKey.subarray(dilithiumKeyOffset + 2, dilithiumKeyOffset + 2 + dilithiumKeyLength);
  
  // Sign with ECDSA
  const ecdsaSign = crypto.createSign('SHA384');
  ecdsaSign.update(data);
  const ecdsaSignature = ecdsaSign.sign({
    key: Buffer.from(ecdsaPrivateKey),
    format: 'der'
  });
  
  // Sign with Dilithium
  const dilithiumSignature = await dilithium.sign(data, dilithiumPrivateKey);
  
  // Combine the signatures
  return Buffer.concat([
    Buffer.from('HYBRID-ECDSA-DILITHIUM-SIGNATURE:'),
    Buffer.from([ecdsaSignature.length >> 8, ecdsaSignature.length & 0xff]), // 2-byte length prefix
    ecdsaSignature,
    Buffer.from([dilithiumSignature.length >> 8, dilithiumSignature.length & 0xff]), // 2-byte length prefix
    dilithiumSignature
  ]);
}

/**
 * Verify a hybrid ECDSA+Dilithium signature
 * 
 * @param data Original data that was signed
 * @param signature Hybrid signature to verify
 * @param publicKey Signer's hybrid public key
 * @returns Boolean indicating if signature is valid
 */
async function verifyEcdsaDilithium(data: Buffer, signature: Buffer, publicKey: Buffer): Promise<boolean> {
  // Extract the public keys
  const publicKeyStr = publicKey.toString();
  if (!publicKeyStr.startsWith('HYBRID-ECDSA-DILITHIUM-PUBLIC:')) {
    throw new Error('Invalid hybrid ECDSA+Dilithium public key format');
  }
  
  const headerLength = 'HYBRID-ECDSA-DILITHIUM-PUBLIC:'.length;
  
  // Extract ECDSA public key
  const ecdsaKeyLength = (publicKey[headerLength] << 8) | publicKey[headerLength + 1];
  const ecdsaPublicKey = publicKey.subarray(headerLength + 2, headerLength + 2 + ecdsaKeyLength);
  
  // Extract Dilithium public key
  const dilithiumKeyOffset = headerLength + 2 + ecdsaKeyLength;
  const dilithiumKeyLength = (publicKey[dilithiumKeyOffset] << 8) | publicKey[dilithiumKeyOffset + 1];
  const dilithiumPublicKey = publicKey.subarray(dilithiumKeyOffset + 2, dilithiumKeyOffset + 2 + dilithiumKeyLength);
  
  // Extract the signatures
  const signatureStr = signature.toString();
  if (!signatureStr.startsWith('HYBRID-ECDSA-DILITHIUM-SIGNATURE:')) {
    throw new Error('Invalid hybrid ECDSA+Dilithium signature format');
  }
  
  const sigHeaderLength = 'HYBRID-ECDSA-DILITHIUM-SIGNATURE:'.length;
  
  // Extract ECDSA signature
  const ecdsaSigLength = (signature[sigHeaderLength] << 8) | signature[sigHeaderLength + 1];
  const ecdsaSignature = signature.subarray(sigHeaderLength + 2, sigHeaderLength + 2 + ecdsaSigLength);
  
  // Extract Dilithium signature
  const dilithiumSigOffset = sigHeaderLength + 2 + ecdsaSigLength;
  const dilithiumSigLength = (signature[dilithiumSigOffset] << 8) | signature[dilithiumSigOffset + 1];
  const dilithiumSignature = signature.subarray(dilithiumSigOffset + 2, dilithiumSigOffset + 2 + dilithiumSigLength);
  
  // Verify ECDSA signature
  const ecdsaVerify = crypto.createVerify('SHA384');
  ecdsaVerify.update(data);
  const ecdsaValid = ecdsaVerify.verify({
    key: Buffer.from(ecdsaPublicKey),
    format: 'der'
  }, ecdsaSignature);
  
  // Verify Dilithium signature
  const dilithiumValid = await dilithium.verify(data, dilithiumSignature, dilithiumPublicKey);
  
  // Both signatures must be valid
  return ecdsaValid && dilithiumValid;
}

// Export the hybrid cryptography module
export const hybridCrypto = {
  generateRsaKyberKeyPair,
  generateEcdsaDilithiumKeyPair,
  encryptRsaKyber,
  decryptRsaKyber,
  signEcdsaDilithium,
  verifyEcdsaDilithium
};