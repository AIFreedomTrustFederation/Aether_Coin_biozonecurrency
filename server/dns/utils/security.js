/**
 * Security utilities for FractalDNS
 * Implements request validation and response signing
 */

const crypto = require('crypto');
const { createLogger } = require('./logger');
const { verifySignature, signData } = require('./cryptography');

const logger = createLogger('security');

/**
 * Validate an incoming DNS request
 * @param {object} request - DNS request object
 * @param {object} keys - Cryptographic keys
 * @returns {boolean} - Whether the request is valid
 */
function validateRequest(request, keys) {
  // Check for empty requests
  if (!request || !request.question || request.question.length === 0) {
    logger.warn('Empty DNS request received');
    return false;
  }
  
  // Check for DNSSEC signatures if available
  if (request.additionals && request.additionals.length > 0) {
    const securityRecords = request.additionals.filter(r => 
      r.type === 48 || // DNSKEY
      r.type === 43 || // DS
      r.type === 46    // RRSIG
    );
    
    if (securityRecords.length > 0) {
      // In a real implementation, this would validate DNSSEC signatures
      logger.debug('DNSSEC records found in request');
    }
  }
  
  // Check for potential DNS amplification attacks
  if (request.question.length > 5) {
    logger.warn(`Suspicious request with ${request.question.length} questions`);
    return false;
  }
  
  // Check for custom quantum security headers
  if (request.edns && request.edns.options) {
    const quantumOption = request.edns.options.find(o => o.code === 65001); // Custom code for quantum security
    
    if (quantumOption && keys) {
      try {
        const signatureData = JSON.parse(quantumOption.data.toString());
        
        if (signatureData.signature && signatureData.timestamp) {
          // Verify the timestamp to prevent replay attacks
          const now = Date.now();
          const requestTime = parseInt(signatureData.timestamp, 10);
          
          if (isNaN(requestTime) || now - requestTime > 300000) { // 5 minutes max
            logger.warn('Quantum security signature expired or invalid timestamp');
            return false;
          }
          
          // Verify the signature
          const requestString = request.question.map(q => `${q.name}:${q.type}`).join(',');
          const dataToVerify = `${requestString}:${signatureData.timestamp}`;
          
          if (!verifySignature(dataToVerify, signatureData.signature, keys.publicKey)) {
            logger.warn('Invalid quantum security signature');
            return false;
          }
          
          logger.debug('Valid quantum security signature verified');
        }
      } catch (error) {
        logger.error('Error processing quantum security option:', error);
      }
    }
  }
  
  return true;
}

/**
 * Sign a DNS response
 * @param {object} response - DNS response object
 * @param {object} keys - Cryptographic keys
 * @returns {object} - Signed response
 */
function signResponse(response, keys) {
  if (!keys) return response;
  
  try {
    // Get the data to sign
    const answerData = response.answer.map(a => `${a.name}:${a.type}:${a.ttl}:${a.address || a.data || ''}`).join(',');
    const timestamp = Date.now().toString();
    const dataToSign = `${answerData}:${timestamp}`;
    
    // Generate signature
    const signature = signData(dataToSign, keys.privateKey);
    
    // Add the signature as a custom option
    if (!response.edns) {
      response.edns = {
        version: 0,
        rcode: 0,
        options: []
      };
    } else if (!response.edns.options) {
      response.edns.options = [];
    }
    
    // Add custom quantum security option
    response.edns.options.push({
      code: 65001, // Custom code for quantum security
      data: Buffer.from(JSON.stringify({
        signature,
        timestamp,
        algorithm: 'quantum-hybrid'
      }))
    });
    
    logger.debug('Response signed with quantum security signature');
  } catch (error) {
    logger.error('Error signing response:', error);
  }
  
  return response;
}

/**
 * Check for DNS cache poisoning attempts
 * @param {object} request - DNS request
 * @param {object} response - DNS response
 * @returns {boolean} - Whether the response is safe
 */
function detectCachePoisoning(request, response) {
  // Check for request-response matching
  if (request.header.id !== response.header.id) {
    logger.warn('Cache poisoning attempt: mismatched IDs');
    return false;
  }
  
  // Check for valid answers to questions
  for (const question of request.question) {
    const matchingAnswers = response.answer.filter(a => 
      a.name === question.name && a.type === question.type
    );
    
    if (question.type !== 2 && matchingAnswers.length === 0) { // Allow empty NS responses
      logger.warn(`Cache poisoning attempt: no matching answers for ${question.name}`);
      return false;
    }
  }
  
  return true;
}

/**
 * Generate a secure DNS response
 * @param {object} request - DNS request
 * @param {object} response - DNS response
 * @param {object} keys - Cryptographic keys
 * @returns {object} - Secure response
 */
function createSecureResponse(request, response, keys) {
  // Validate the request
  if (!validateRequest(request, keys)) {
    // Return a minimal response for invalid requests
    return {
      header: {
        id: request.header.id,
        qr: 1,
        opcode: 0,
        aa: 0,
        tc: 0,
        rd: request.header.rd,
        ra: 1,
        rcode: 2 // SERVFAIL
      },
      question: request.question,
      answer: [],
      authority: [],
      additional: []
    };
  }
  
  // Check for cache poisoning
  if (!detectCachePoisoning(request, response)) {
    logger.warn('Cache poisoning detected, sending SERVFAIL');
    response.header.rcode = 2; // SERVFAIL
    response.answer = [];
    response.authority = [];
    response.additional = [];
    return response;
  }
  
  // Add security records if keys are available
  if (keys) {
    // Add security headers
    response.header.ad = 1; // Authenticated data flag
    
    // Add a timestamp record to prevent replay attacks
    const timestamp = Math.floor(Date.now() / 1000);
    const timestampRecord = {
      name: request.question[0].name,
      ttl: 60,
      class: 1,
      type: 16, // TXT
      data: [`quantum-secure=true; timestamp=${timestamp}`]
    };
    
    if (!response.additional) {
      response.additional = [];
    }
    
    response.additional.push(timestampRecord);
    
    // Sign the response
    signResponse(response, keys);
  }
  
  return response;
}

/**
 * Generate a HPKP-like hash for DNS certification
 * @param {string} publicKey - Public key in PEM format
 * @returns {string} - Base64 hash of the public key
 */
function generateDnsPinHash(publicKey) {
  try {
    // Extract the DER format
    const pemHeader = '-----BEGIN PUBLIC KEY-----';
    const pemFooter = '-----END PUBLIC KEY-----';
    
    const pemContents = publicKey
      .replace(pemHeader, '')
      .replace(pemFooter, '')
      .replace(/\s+/g, '');
    
    const derBuffer = Buffer.from(pemContents, 'base64');
    
    // Generate SHA-256 hash
    const hash = crypto.createHash('sha256').update(derBuffer).digest('base64');
    
    return hash;
  } catch (error) {
    logger.error('Error generating DNS pin hash:', error);
    throw error;
  }
}

module.exports = {
  validateRequest,
  signResponse,
  detectCachePoisoning,
  createSecureResponse,
  generateDnsPinHash
};