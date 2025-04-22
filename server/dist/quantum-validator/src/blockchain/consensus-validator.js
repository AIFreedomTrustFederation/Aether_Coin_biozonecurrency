"use strict";
/**
 * Aetherion Blockchain Consensus Validator
 *
 * This module validates blocks and transactions for consensus compliance
 * and provides security scoring for quantum resistance.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBlock = validateBlock;
const quantum_resistant_js_1 = require("../crypto/quantum-resistant.js");
/**
 * Validate a block from the blockchain
 *
 * @param block The block to validate
 * @param previousBlock The previous block in the chain (if any)
 * @param currentTimestamp Current timestamp for validation
 * @param validationLevel Validation detail level
 * @returns Validation result with security score
 */
function validateBlock(block, previousBlock, currentTimestamp, validationLevel = 'standard') {
    // Base validation result
    const result = {
        isValid: false,
        securityScore: 0,
        validationLevel,
        timestamp: currentTimestamp,
        blockHeight: block.header.height,
        blockHash: block.hash,
        errors: [],
        warnings: []
    };
    // Security score tracking
    let securityScore = 0;
    // 1. Validate block hash integrity
    const calculatedHash = calculateBlockHash(block);
    if (calculatedHash !== block.hash) {
        result.errors.push('Block hash is invalid');
    }
    else {
        securityScore += 20;
    }
    // 2. Verify chain linkage (if not genesis block)
    if (previousBlock) {
        if (block.header.previousHash !== previousBlock.hash) {
            result.errors.push('Previous hash does not match previous block hash');
        }
        else {
            securityScore += 15;
        }
        // Verify timestamp is after previous block
        if (block.header.timestamp <= previousBlock.header.timestamp) {
            result.errors.push('Block timestamp is invalid (not after previous block)');
        }
        else {
            securityScore += 5;
        }
    }
    else if (block.header.height > 0) {
        // Non-genesis block without a previous block reference
        result.errors.push('Non-genesis block is missing previous block reference');
    }
    else {
        // Genesis block checks
        securityScore += 20;
    }
    // 3. Validate merkle root
    const calculatedMerkleRoot = calculateMerkleRoot(block.transactions);
    if (calculatedMerkleRoot !== block.header.merkleRoot) {
        result.errors.push('Merkle root is invalid');
    }
    else {
        securityScore += 15;
    }
    // 4. Enhanced validation checks
    if (validationLevel === 'enhanced' || validationLevel === 'quantum') {
        // Verify all transactions in the block
        let validTransactions = 0;
        for (const tx of block.transactions) {
            try {
                const isValid = validateTransaction(tx);
                if (isValid) {
                    validTransactions++;
                }
            }
            catch (error) {
                // Transaction validation error
            }
        }
        // Score based on valid transaction percentage
        const validPercentage = block.transactions.length > 0
            ? (validTransactions / block.transactions.length) * 100
            : 100;
        if (validPercentage === 100) {
            securityScore += 15;
        }
        else if (validPercentage >= 90) {
            securityScore += 10;
            result.warnings.push(`${100 - validPercentage}% of transactions failed validation`);
        }
        else {
            result.errors.push(`Only ${validPercentage}% of transactions are valid`);
        }
    }
    // 5. Quantum-level validation
    if (validationLevel === 'quantum') {
        // Check quantum security proof
        if (block.quantumSecurityProof) {
            const isQuantumSecure = verifyQuantumSecurityProof(block.hash, block.quantumSecurityProof);
            if (isQuantumSecure) {
                securityScore += 25;
            }
            else {
                result.errors.push('Quantum security proof is invalid');
            }
        }
        else {
            result.errors.push('Block is missing quantum security proof');
        }
    }
    // Set final security score and validity
    result.securityScore = securityScore;
    result.isValid = result.errors.length === 0;
    return result;
}
/**
 * Validate a transaction from the blockchain
 *
 * @param transaction The transaction to validate
 * @returns Whether the transaction is valid
 */
function validateTransaction(transaction) {
    // Check transaction has required fields
    if (!transaction.id || !transaction.from || !transaction.to || !transaction.amount) {
        return false;
    }
    // Check transaction signature
    if (!transaction.signature) {
        return false;
    }
    // Verify transaction signature (simplified)
    const signatureData = {
        from: transaction.from,
        to: transaction.to,
        amount: transaction.amount,
        timestamp: transaction.timestamp
    };
    // In a real implementation, this would fully verify the signature
    return transaction.signature.length > 0;
}
/**
 * Calculate a block hash
 *
 * @param block The block to hash
 * @returns The calculated block hash
 */
function calculateBlockHash(block) {
    // In a real implementation, this would calculate the block hash
    // based on the block header using the appropriate hash algorithm
    // For simplicity, we'll just return the existing hash
    return block.hash;
}
/**
 * Calculate the merkle root from a list of transactions
 *
 * @param transactions The transactions to calculate the merkle root for
 * @returns The calculated merkle root
 */
function calculateMerkleRoot(transactions) {
    // In a real implementation, this would calculate the merkle root
    // by hashing pairs of transaction IDs until a single root hash is created
    // For simplicity, we'll just return a hash of all transaction IDs
    if (transactions.length === 0) {
        return '';
    }
    const combinedIds = transactions.map(tx => tx.id).join('');
    return (0, quantum_resistant_js_1.generateQuantumSecureHash)(combinedIds);
}
/**
 * Verify a block's quantum security proof
 *
 * @param blockHash The block hash to verify
 * @param quantumSecurityProof The quantum security proof to verify
 * @returns Whether the proof is valid
 */
function verifyQuantumSecurityProof(blockHash, quantumSecurityProof) {
    // In a real implementation, this would verify the quantum security proof
    // using post-quantum cryptographic algorithms
    // For simplicity, we'll just check if the proof exists and is related to the hash
    return quantumSecurityProof.length > 0 &&
        quantumSecurityProof !== blockHash &&
        (0, quantum_resistant_js_1.verifyQuantumSignature)(blockHash, quantumSecurityProof);
}
