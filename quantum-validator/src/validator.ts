/**
 * Aetherion Blockchain Request Validator
 * 
 * This module validates blockchain requests and transactions
 * for quantum security compliance and threat detection.
 */

import { Transaction } from './blockchain/consensus-validator.js';

/**
 * Validate a blockchain request for quantum security
 * 
 * @param requestData The request data to validate
 * @param securityLevel The required security level (1-5)
 * @returns Validation result with security score
 */
export function validateRequest(
  requestData: Record<string, any>,
  securityLevel: number = 3
): ValidationResult {
  // Default result
  const result: ValidationResult = {
    isValid: false,
    securityScore: 0,
    threatLevel: 'high',
    anomalies: [],
    recommendations: []
  };
  
  // Validate basic structure
  if (!requestData || typeof requestData !== 'object') {
    result.anomalies.push('Invalid request structure');
    result.recommendations.push('Ensure request is a valid JSON object');
    return result;
  }
  
  // Track security score
  let score = 0;
  
  // Check essential fields based on security level
  const requiredFields = getRequiredFields(securityLevel);
  const missingFields = requiredFields.filter(field => !(field in requestData));
  
  if (missingFields.length > 0) {
    result.anomalies.push(`Missing required fields: ${missingFields.join(', ')}`);
    result.recommendations.push(`Include all required fields for security level ${securityLevel}`);
  } else {
    score += 30; // 30 points for having all required fields
  }
  
  // Check signature if present
  if (requestData.signature) {
    try {
      const isSignatureValid = validateSignature(
        requestData.signature,
        requestData.from || requestData.sender,
        requestData
      );
      
      if (isSignatureValid) {
        score += 40; // 40 points for valid signature
      } else {
        result.anomalies.push('Invalid signature');
        result.recommendations.push('Ensure transaction is signed with the correct private key');
      }
    } catch (error) {
      result.anomalies.push('Error validating signature');
      result.recommendations.push('Use a supported signature format');
    }
  } else if (securityLevel >= 3) {
    result.anomalies.push('Missing signature for high security level request');
    result.recommendations.push('Sign all high security level requests');
  }
  
  // Check quantum protection
  if (requestData.quantumProtection || requestData.quantumSignature) {
    score += 20; // 20 points for quantum protection
  } else if (securityLevel >= 4) {
    result.anomalies.push('Missing quantum protection for very high security level');
    result.recommendations.push('Add quantum protection to high security requests');
  }
  
  // Time validity checks
  if (requestData.timestamp) {
    const now = Date.now();
    const requestTime = typeof requestData.timestamp === 'number' 
      ? requestData.timestamp
      : parseInt(requestData.timestamp);
    
    // Check if timestamp is recent (within 5 minutes)
    if (!isNaN(requestTime) && Math.abs(now - requestTime) < 5 * 60 * 1000) {
      score += 10; // 10 points for recent timestamp
    } else {
      result.anomalies.push('Request timestamp is too old or invalid');
      result.recommendations.push('Ensure request has a current timestamp');
    }
  }
  
  // Calculate final security score and set result properties
  result.securityScore = score;
  result.isValid = score >= getMinSecurityScore(securityLevel);
  result.threatLevel = getThreatLevel(score);
  
  // Add general recommendations if score is low
  if (score < 50) {
    result.recommendations.push('Implement stronger security measures in request construction');
  }
  
  return result;
}

/**
 * Validate a digital signature
 * 
 * @param signature The digital signature to validate
 * @param publicKeyOrAddress The public key or address of the signer
 * @param data The signed data
 * @returns Whether the signature is valid
 */
function validateSignature(
  signature: string,
  publicKeyOrAddress: string,
  data: Record<string, any>
): boolean {
  // In a real implementation, this would validate the signature
  // against the public key using the appropriate algorithm
  
  // For this example, we'll assume the signature is valid if it's non-empty
  // and related to the data (contains a hash of some of the data)
  return Boolean(signature.length > 0 && publicKeyOrAddress && publicKeyOrAddress.length > 0);
}

/**
 * Get the required fields for a given security level
 */
function getRequiredFields(securityLevel: number): string[] {
  const baseFields = ['timestamp', 'type'];
  
  if (securityLevel >= 2) {
    baseFields.push('from', 'nonce');
  }
  
  if (securityLevel >= 3) {
    baseFields.push('signature');
  }
  
  if (securityLevel >= 4) {
    baseFields.push('quantumProtection');
  }
  
  if (securityLevel >= 5) {
    baseFields.push('temporalEntanglement', 'fractalVerification');
  }
  
  return baseFields;
}

/**
 * Get the minimum security score required for validation
 */
function getMinSecurityScore(securityLevel: number): number {
  switch (securityLevel) {
    case 1: return 20;
    case 2: return 40;
    case 3: return 60;
    case 4: return 80;
    case 5: return 90;
    default: return 50;
  }
}

/**
 * Get the threat level based on security score
 */
function getThreatLevel(score: number): ThreatLevel {
  if (score >= 80) return 'low';
  if (score >= 50) return 'medium';
  return 'high';
}

/**
 * Analyze transactions for quantum computing threats
 * 
 * @param transactions The transactions to analyze
 * @returns Threat analysis results
 */
export function analyzeQuantumThreats(transactions: Transaction[]): ThreatAnalysis {
  // Default result
  const result: ThreatAnalysis = {
    threatLevel: 'low',
    anomalies: 0,
    details: 'No quantum threats detected',
    recommendations: []
  };
  
  // No transactions to analyze
  if (!transactions || transactions.length === 0) {
    result.details = 'No transactions to analyze';
    result.recommendations.push('Provide transactions for quantum threat analysis');
    return result;
  }
  
  // Count transactions without quantum protection
  const nonQuantumProtected = transactions.filter(tx => 
    !tx.signature || !(tx.data?.quantumProtection || tx.data?.quantumSignature)
  ).length;
  
  const percentNonProtected = (nonQuantumProtected / transactions.length) * 100;
  
  // Analyze threat level based on percentage of non-protected transactions
  if (percentNonProtected > 80) {
    result.threatLevel = 'high';
    result.anomalies = nonQuantumProtected;
    result.details = 'High percentage of transactions without quantum protection';
    result.recommendations = [
      'Implement quantum-resistant signatures for all transactions',
      'Use post-quantum cryptography libraries like CRYSTALS-Kyber',
      'Add quantum entropy sources to transaction signing'
    ];
  } else if (percentNonProtected > 40) {
    result.threatLevel = 'medium';
    result.anomalies = nonQuantumProtected;
    result.details = 'Significant percentage of transactions without quantum protection';
    result.recommendations = [
      'Increase quantum-resistant signature coverage',
      'Upgrade to post-quantum cryptography for critical transactions'
    ];
  } else if (percentNonProtected > 0) {
    result.threatLevel = 'low';
    result.anomalies = nonQuantumProtected;
    result.details = 'Small percentage of transactions without quantum protection';
    result.recommendations = [
      'Complete quantum protection coverage for all transactions'
    ];
  }
  
  return result;
}

/**
 * Threat level classification
 */
export type ThreatLevel = 'low' | 'medium' | 'high';

/**
 * Validation result for blockchain requests
 */
export interface ValidationResult {
  /** Whether the request passed validation */
  isValid: boolean;
  
  /** Security score (0-100) */
  securityScore: number;
  
  /** Threat level classification */
  threatLevel: ThreatLevel;
  
  /** Detected anomalies or issues */
  anomalies: string[];
  
  /** Recommendations for improvement */
  recommendations: string[];
}

/**
 * Quantum threat analysis results
 */
export interface ThreatAnalysis {
  /** Overall threat level */
  threatLevel: ThreatLevel;
  
  /** Number of detected anomalies */
  anomalies: number;
  
  /** Detailed threat description */
  details: string;
  
  /** Recommendations to mitigate threats */
  recommendations: string[];
}