/**
 * Aetherion Quantum-Resistant Cryptography Module
 *
 * This module provides post-quantum cryptographic algorithms for the
 * Aetherion blockchain, ensuring security against quantum computing attacks.
 *
 * Implements:
 * - Kyber key encapsulation mechanism (KEM)
 * - SPHINCS+ signatures
 * - Falcon signatures
 * - Hybrid classical-quantum cryptography
 */
/**
 * Generate a quantum-resistant key pair using CRYSTALS-Kyber
 *
 * @param securityLevel Security level (1-5, with 5 being highest security)
 * @returns Key pair with public and private keys
 */
export declare function generateKyberKeyPair(securityLevel?: number): KeyPair;
/**
 * Sign a blockchain transaction using quantum-resistant signatures
 *
 * @param transactionData The transaction data to sign
 * @param privateKey The private key to sign with
 * @returns Quantum-resistant signature
 */
export declare function signBlockchainTransaction(transactionData: any, privateKey: Uint8Array): string;
/**
 * Verify a quantum signature
 *
 * @param message Original message that was signed
 * @param signature Quantum-resistant signature
 * @returns Whether the signature is valid
 */
export declare function verifyQuantumSignature(message: string, signature: string): boolean;
/**
 * Generate a quantum-secure hash for the given data
 *
 * @param data The data to hash
 * @returns Quantum-secure hash
 */
export declare function generateQuantumSecureHash(data: string): string;
/**
 * Encrypt data using quantum-resistant encryption
 *
 * @param data The data to encrypt
 * @param publicKey The recipient's public key
 * @returns Encrypted data and encapsulated key
 */
export declare function encryptWithKyber(data: string, publicKey: Uint8Array): EncryptedData;
/**
 * Decrypt data using quantum-resistant decryption
 *
 * @param encryptedData The encrypted data
 * @param encapsulatedKey The encapsulated key
 * @param privateKey The recipient's private key
 * @returns Decrypted data
 */
export declare function decryptWithKyber(encryptedData: string, encapsulatedKey: string, privateKey: Uint8Array): string;
/**
 * Generate a quantum-secure random number
 *
 * @param min Minimum value (inclusive)
 * @param max Maximum value (exclusive)
 * @returns Random number
 */
export declare function generateQuantumSecureRandom(min: number, max: number): number;
/**
 * Create a temporal entanglement proof for quantum security
 *
 * @param data The data to entangle
 * @param depth Entanglement depth (higher is more secure)
 * @returns Temporal entanglement proof
 */
export declare function createTemporalEntanglement(data: string, depth?: number): TemporalEntanglement;
/**
 * Verify a temporal entanglement proof
 *
 * @param data The original data
 * @param entanglement The temporal entanglement proof
 * @returns Whether the entanglement is valid
 */
export declare function verifyTemporalEntanglement(data: string, entanglement: TemporalEntanglement): boolean;
/**
 * Quantum-resistant key pair
 */
export interface KeyPair {
    /** Public key (can be shared) */
    publicKey: Uint8Array;
    /** Private key (must be kept secret) */
    privateKey: Uint8Array;
}
/**
 * Encrypted data with encapsulated key
 */
export interface EncryptedData {
    /** Encrypted data (base64 encoded) */
    encryptedData: string;
    /** Encapsulated key (base64 encoded) */
    encapsulatedKey: string;
}
/**
 * Temporal entanglement proof
 */
export interface TemporalEntanglement {
    /** Hash of the original data */
    originalDataHash: string;
    /** Layers of the entanglement chain */
    entanglementLayers: string[];
    /** Final entanglement hash */
    finalEntanglement: string;
    /** Timestamp when entanglement was created */
    timestamp: number;
    /** Entanglement depth */
    depth: number;
}
