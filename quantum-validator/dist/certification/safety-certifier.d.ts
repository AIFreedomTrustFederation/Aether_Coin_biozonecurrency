/**
 * Aetherion Blockchain Safety Certification Module
 *
 * This module provides comprehensive security certification for the Aetherion blockchain,
 * verifying compliance with industry standards and best practices for web3 safety.
 *
 * The certification process evaluates:
 * - Quantum resistance capabilities
 * - Consensus mechanism security
 * - Smart contract safety
 * - Network security measures
 * - Privacy protections
 * - Key management practices
 * - Governance systems
 */
import { ValidationResult } from '../blockchain/consensus-validator.js';
/**
 * Certification levels for blockchain security
 */
export declare enum CertificationLevel {
    STANDARD = "STANDARD",// Base level certification
    ENHANCED = "ENHANCED",// Higher security standards
    QUANTUM = "QUANTUM",// Full quantum resistance
    FINANCIAL = "FINANCIAL"
}
/**
 * Certification categories that are evaluated
 */
export declare enum CertificationCategory {
    CONSENSUS = "Consensus Mechanism",
    CRYPTOGRAPHY = "Cryptographic Implementation",
    NETWORK = "Network Security",
    SMART_CONTRACTS = "Smart Contract Safety",
    PRIVACY = "Privacy & Data Protection",
    GOVERNANCE = "Governance & Upgradeability",
    QUANTUM_RESISTANCE = "Quantum Attack Resistance",
    KEY_MANAGEMENT = "Key Management & Recovery",
    COMPLIANCE = "Regulatory Compliance"
}
/**
 * Certification criteria result for a specific category
 */
export interface CategoryResult {
    category: CertificationCategory;
    score: number;
    passed: boolean;
    details: string[];
    recommendations: string[];
}
/**
 * Complete certification report
 */
export interface CertificationReport {
    blockchainName: string;
    version: string;
    timestamp: number;
    overallScore: number;
    certificationLevel: CertificationLevel;
    categoryResults: CategoryResult[];
    passed: boolean;
    validUntil: number;
    certificationId: string;
    recommendations: string[];
}
/**
 * Parameters for the certification process
 */
export interface CertificationParams {
    blockchainName: string;
    version: string;
    consensusType: string;
    cryptographicPrimitives: string[];
    smartContractLanguages: string[];
    hasQuantumResistance: boolean;
    privacyFeatures: string[];
    governanceType: string;
    targetCertificationLevel: CertificationLevel;
    validationResults: ValidationResult[];
    securityIncidents?: {
        count: number;
        resolved: number;
        meanTimeToResolve: number;
    };
}
/**
 * Certifies a blockchain according to safety standards
 *
 * @param params Parameters describing the blockchain
 * @returns Comprehensive certification report
 */
export declare function certifyBlockchain(params: CertificationParams): CertificationReport;
/**
 * Get a human-readable certification grade based on score
 */
export declare function getCertificationGrade(score: number): string;
