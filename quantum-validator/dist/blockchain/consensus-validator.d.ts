/**
 * Aetherion Blockchain Consensus Validator
 *
 * This module validates blocks and transactions for consensus compliance
 * and provides security scoring for quantum resistance.
 */
/**
 * Validate a block from the blockchain
 *
 * @param block The block to validate
 * @param previousBlock The previous block in the chain (if any)
 * @param currentTimestamp Current timestamp for validation
 * @param validationLevel Validation detail level
 * @returns Validation result with security score
 */
export declare function validateBlock(block: Block, previousBlock: Block | null, currentTimestamp: number, validationLevel?: 'standard' | 'enhanced' | 'quantum'): ValidationResult;
/**
 * Block header in the blockchain
 */
export interface BlockHeader {
    /** Block version */
    version: number;
    /** Hash of the previous block */
    previousHash: string;
    /** Merkle root of transaction hashes */
    merkleRoot: string;
    /** Block creation timestamp */
    timestamp: number;
    /** Mining difficulty target */
    difficulty: number;
    /** Mining nonce */
    nonce: number;
    /** Block height in the chain */
    height: number;
}
/**
 * Block in the blockchain
 */
export interface Block {
    /** Block header containing metadata */
    header: BlockHeader;
    /** Transactions included in the block */
    transactions: Transaction[];
    /** Block hash */
    hash: string;
    /** Total transaction fees */
    totalFees: string;
    /** Block size in bytes */
    size: number;
    /** Quantum security proof */
    quantumSecurityProof?: string;
}
/**
 * Transaction in the blockchain
 */
export interface Transaction {
    /** Transaction ID */
    id: string;
    /** Sender address */
    from: string;
    /** Recipient address */
    to: string;
    /** Transaction amount */
    amount: string;
    /** Transaction timestamp */
    timestamp: number;
    /** Transaction fee */
    fee: string;
    /** Transaction signature */
    signature: string;
    /** Additional transaction data */
    data?: {
        /** Transaction type */
        type?: string;
        /** Custom blockchain-specific data */
        [key: string]: any;
    };
}
/**
 * Validation result for blockchain consensus
 */
export interface ValidationResult {
    /** Whether the block or transaction passed validation */
    isValid: boolean;
    /** Security score (0-100) */
    securityScore: number;
    /** Validation detail level */
    validationLevel: 'standard' | 'enhanced' | 'quantum';
    /** Validation timestamp */
    timestamp: number;
    /** Height of the validated block */
    blockHeight: number;
    /** Hash of the validated block */
    blockHash: string;
    /** Validation errors */
    errors: string[];
    /** Validation warnings */
    warnings: string[];
}
