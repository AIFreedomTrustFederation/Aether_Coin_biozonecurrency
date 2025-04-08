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
export declare function validateRequest(requestData: Record<string, any>, securityLevel?: number): ValidationResult;
/**
 * Analyze transactions for quantum computing threats
 *
 * @param transactions The transactions to analyze
 * @returns Threat analysis results
 */
export declare function analyzeQuantumThreats(transactions: Transaction[]): ThreatAnalysis;
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
