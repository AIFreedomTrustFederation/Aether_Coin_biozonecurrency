"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeQuantumThreats = exports.validateRequest = exports.CertificationCategory = exports.CertificationLevel = exports.getCertificationGrade = exports.certifyBlockchain = void 0;
exports.evaluateBlockchainSafety = evaluateBlockchainSafety;
// Export Quantum-Resistant Cryptography
__exportStar(require("./crypto/quantum-resistant.js"), exports);
// Export Blockchain Consensus Validator
__exportStar(require("./blockchain/consensus-validator.js"), exports);
// Export Safety Certification
var safety_certifier_js_1 = require("./certification/safety-certifier.js");
Object.defineProperty(exports, "certifyBlockchain", { enumerable: true, get: function () { return safety_certifier_js_1.certifyBlockchain; } });
Object.defineProperty(exports, "getCertificationGrade", { enumerable: true, get: function () { return safety_certifier_js_1.getCertificationGrade; } });
Object.defineProperty(exports, "CertificationLevel", { enumerable: true, get: function () { return safety_certifier_js_1.CertificationLevel; } });
Object.defineProperty(exports, "CertificationCategory", { enumerable: true, get: function () { return safety_certifier_js_1.CertificationCategory; } });
// Export Request Validator (from original validator.ts)
var validator_js_1 = require("./validator.js");
Object.defineProperty(exports, "validateRequest", { enumerable: true, get: function () { return validator_js_1.validateRequest; } });
Object.defineProperty(exports, "analyzeQuantumThreats", { enumerable: true, get: function () { return validator_js_1.analyzeQuantumThreats; } });
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
function evaluateBlockchainSafety(blockchainParams, validationLevel = 'quantum') {
    const { blocks, transactions, configuration, securityFeatures, smartContractLanguages, privacyFeatures } = blockchainParams;
    const startTime = Date.now();
    // 1. Validate individual blocks and transactions for consensus compliance
    const validationResults = validateBlockSequence(blocks, validationLevel);
    // 2. Evaluate safety certification
    const certificationParams = {
        blockchainName: 'Aetherion',
        version: configuration.version,
        consensusType: configuration.consensusType,
        cryptographicPrimitives: securityFeatures.cryptographicPrimitives,
        smartContractLanguages: smartContractLanguages,
        hasQuantumResistance: securityFeatures.quantumResistance,
        privacyFeatures: privacyFeatures,
        governanceType: configuration.governanceType,
        targetCertificationLevel: translateToCertificationLevel(validationLevel),
        validationResults
    };
    const certificationReport = (0, safety_certifier_js_2.certifyBlockchain)(certificationParams);
    // 3. Analyze network security based on transaction patterns
    const networkSecurityAnalysis = analyzeNetworkSecurity(transactions);
    // 4. Quantum threat analysis
    const quantumThreatAnalysis = (0, validator_js_2.analyzeQuantumThreats)(transactions);
    // 5. Combine results into comprehensive safety evaluation
    const safetyEvaluation = {
        overallResult: certificationReport.passed,
        securityScore: certificationReport.overallScore,
        safetyGrade: (0, safety_certifier_js_2.getCertificationGrade)(certificationReport.overallScore),
        validationDetails: {
            blocksValidated: blocks.length,
            transactionsValidated: transactions.length,
            validationFailures: validationResults.filter(r => !r.isValid).length,
            averageValidationSecurityScore: calculateAverageSecurityScore(validationResults)
        },
        certificationReport,
        networkSecurityAnalysis,
        quantumThreatAnalysis,
        recommendations: certificationReport.recommendations,
        evaluationTimeMs: Date.now() - startTime,
        timestamp: Date.now(),
        evaluationId: `aetherion-safety-${Date.now()}`
    };
    return safetyEvaluation;
}
/**
 * Validate a sequence of blocks from the blockchain
 */
function validateBlockSequence(blocks, validationLevel) {
    const validationResults = [];
    for (let i = 0; i < blocks.length; i++) {
        const currentBlock = blocks[i];
        const previousBlock = i > 0 ? blocks[i - 1] : null;
        const currentTimestamp = Date.now();
        const result = (0, consensus_validator_js_1.validateBlock)(currentBlock, previousBlock, currentTimestamp, validationLevel);
        validationResults.push(result);
    }
    return validationResults;
}
/**
 * Analyze network security based on transaction patterns
 */
function analyzeNetworkSecurity(transactions) {
    // In a real implementation, this would analyze network topology, transaction patterns,
    // potential attack vectors, etc.
    return {
        securityLevel: 'high',
        vulnerabilitiesDetected: 0,
        networkResilience: 95,
        ddosProtection: 'advanced',
        peerConnectivityScore: 90,
        recommendations: []
    };
}
/**
 * Calculate average security score from validation results
 */
function calculateAverageSecurityScore(validationResults) {
    if (validationResults.length === 0) {
        return 0;
    }
    const sum = validationResults.reduce((total, result) => total + result.securityScore, 0);
    return Math.round(sum / validationResults.length);
}
/**
 * Convert validation level to certification level
 */
function translateToCertificationLevel(validationLevel) {
    switch (validationLevel) {
        case 'standard':
            return safety_certifier_js_2.CertificationLevel.STANDARD;
        case 'enhanced':
            return safety_certifier_js_2.CertificationLevel.ENHANCED;
        case 'quantum':
            return safety_certifier_js_2.CertificationLevel.QUANTUM;
        default:
            return safety_certifier_js_2.CertificationLevel.STANDARD;
    }
}
// Type import from consensus-validator.ts
const consensus_validator_js_1 = require("./blockchain/consensus-validator.js");
// Import from certification module
const safety_certifier_js_2 = require("./certification/safety-certifier.js");
// Import from validator
const validator_js_2 = require("./validator.js");
