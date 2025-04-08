/**
 * Aetherion Blockchain Safety Module
 *
 * This module provides comprehensive security validation and certification
 * for the Aetherion blockchain, ensuring compliance with top-tier Web3 standards.
 *
 * Features:
 * - Quantum-resistant cryptography
 * - Consensus validation
 * - Safety certification
 * - Security auditing
 * - Compliance verification
 */
export * from './crypto/quantum-resistant.js';
export * from './blockchain/consensus-validator.js';
export { certifyBlockchain, getCertificationGrade, CertificationLevel, CertificationCategory } from './certification/safety-certifier.js';
export { validateRequest, analyzeQuantumThreats } from './validator.js';
/**
 * Integrated safety check for the Aetherion blockchain
 *
 * This function performs a comprehensive safety evaluation and returns
 * a detailed report on security, compliance, and quantum resistance.
 *
 * @param blockchainParams Parameters describing the blockchain configuration
 * @param validationLevel Desired validation level
 * @returns Safety evaluation results
 */
export declare function evaluateBlockchainSafety(blockchainParams: BlockchainParams, validationLevel?: 'standard' | 'enhanced' | 'quantum'): SafetyEvaluationResult;
import { Block, Transaction } from './blockchain/consensus-validator.js';
import { CertificationReport } from './certification/safety-certifier.js';
import { ThreatAnalysis } from './validator.js';
/**
 * Parameters for blockchain safety evaluation
 */
export interface BlockchainParams {
    /** Sequence of blocks to validate */
    blocks: Block[];
    /** Transactions to analyze */
    transactions: Transaction[];
    /** Blockchain configuration */
    configuration: {
        /** Blockchain version */
        version: string;
        /** Consensus mechanism type */
        consensusType: string;
        /** Governance mechanism type */
        governanceType: string;
        /** Network ID */
        networkId: number;
        /** Chain ID */
        chainId: number;
    };
    /** Security features */
    securityFeatures: {
        /** Cryptographic primitives used */
        cryptographicPrimitives: string[];
        /** Whether quantum resistance is implemented */
        quantumResistance: boolean;
        /** Key management approach */
        keyManagement: string[];
    };
    /** Smart contract languages supported */
    smartContractLanguages: string[];
    /** Privacy features implemented */
    privacyFeatures: string[];
}
/**
 * Network security analysis results
 */
export interface NetworkSecurityAnalysis {
    /** Network security level assessment */
    securityLevel: 'low' | 'medium' | 'high';
    /** Number of vulnerabilities detected */
    vulnerabilitiesDetected: number;
    /** Network resilience score (0-100) */
    networkResilience: number;
    /** DDoS protection level */
    ddosProtection: 'basic' | 'standard' | 'advanced';
    /** Peer connectivity score (0-100) */
    peerConnectivityScore: number;
    /** Security recommendations */
    recommendations: string[];
}
/**
 * Comprehensive safety evaluation result
 */
export interface SafetyEvaluationResult {
    /** Whether the blockchain passed safety evaluation */
    overallResult: boolean;
    /** Overall security score (0-100) */
    securityScore: number;
    /** Safety grade (A+ to F) */
    safetyGrade: string;
    /** Validation details */
    validationDetails: {
        /** Number of blocks validated */
        blocksValidated: number;
        /** Number of transactions validated */
        transactionsValidated: number;
        /** Number of validation failures */
        validationFailures: number;
        /** Average validation security score */
        averageValidationSecurityScore: number;
    };
    /** Full certification report */
    certificationReport: CertificationReport;
    /** Network security analysis */
    networkSecurityAnalysis: NetworkSecurityAnalysis;
    /** Quantum threat analysis */
    quantumThreatAnalysis: ThreatAnalysis;
    /** Recommendations for improvement */
    recommendations: string[];
    /** Time taken for evaluation in milliseconds */
    evaluationTimeMs: number;
    /** Timestamp of evaluation */
    timestamp: number;
    /** Unique evaluation ID */
    evaluationId: string;
}
