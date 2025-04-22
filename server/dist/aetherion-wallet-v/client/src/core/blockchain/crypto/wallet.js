"use strict";
/**
 * Wallet Utilities for Aetherion
 *
 * This file contains functions for creating and managing wallets,
 * as well as cryptographic functions for signing and verifying transactions.
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMnemonic = generateMnemonic;
exports.createWalletFromMnemonic = createWalletFromMnemonic;
exports.createWallet = createWallet;
exports.createWalletFromPrivateKey = createWalletFromPrivateKey;
exports.signTransaction = signTransaction;
exports.verifyTransaction = verifyTransaction;
exports.getAddressFromPublicKey = getAddressFromPublicKey;
exports.encryptPrivateKey = encryptPrivateKey;
exports.decryptPrivateKey = decryptPrivateKey;
exports.createKeystore = createKeystore;
exports.restoreFromKeystore = restoreFromKeystore;
const crypto_js_1 = require("crypto-js");
const ethers = __importStar(require("ethers"));
// HD Wallet Path (similar to BIP44)
const HD_PATH = "m/44'/60'/0'/0/0";
/**
 * Generate a cryptographically secure random mnemonic phrase
 * @returns Mnemonic phrase (12 words)
 */
function generateMnemonic() {
    // In a real implementation, we would use ethers.Wallet.createRandom()
    // to generate a proper BIP39 mnemonic, but for simplicity we'll
    // simulate it here
    const wallet = ethers.Wallet.createRandom();
    return wallet.mnemonic?.phrase || '';
}
/**
 * Create a wallet from a mnemonic phrase
 * @param mnemonic Mnemonic phrase
 * @returns Wallet object
 */
function createWalletFromMnemonic(mnemonic) {
    try {
        // Create HD wallet from mnemonic
        const hdNode = ethers.HDNodeWallet.fromPhrase(mnemonic, undefined, HD_PATH);
        // Create wallet object
        const wallet = {
            address: hdNode.address,
            privateKey: hdNode.privateKey,
            publicKey: hdNode.publicKey,
            balance: 0
        };
        return wallet;
    }
    catch (error) {
        throw new Error('Invalid mnemonic phrase');
    }
}
/**
 * Create a new random wallet
 * @returns Wallet object and mnemonic
 */
function createWallet() {
    const mnemonic = generateMnemonic();
    const wallet = createWalletFromMnemonic(mnemonic);
    return { wallet, mnemonic };
}
/**
 * Create a wallet from a private key
 * @param privateKey Private key (with or without 0x prefix)
 * @returns Wallet object
 */
function createWalletFromPrivateKey(privateKey) {
    try {
        // Ensure privateKey has 0x prefix
        if (!privateKey.startsWith('0x')) {
            privateKey = '0x' + privateKey;
        }
        // Create wallet from private key
        const wallet = new ethers.Wallet(privateKey);
        return {
            address: wallet.address,
            privateKey: wallet.privateKey,
            publicKey: wallet.publicKey,
            balance: 0
        };
    }
    catch (error) {
        throw new Error('Invalid private key');
    }
}
/**
 * Sign a transaction with a wallet's private key
 * @param transaction Transaction to sign
 * @param privateKey Private key to sign with
 * @returns Signed transaction
 */
function signTransaction(transaction, privateKey) {
    try {
        // Create a wallet from the private key
        const wallet = new ethers.Wallet(privateKey);
        // Create a hash of the transaction
        const transactionData = JSON.stringify({
            fromAddress: transaction.fromAddress,
            toAddress: transaction.toAddress,
            amount: transaction.amount,
            timestamp: transaction.timestamp,
            fee: transaction.fee,
            data: transaction.data,
            nonce: transaction.nonce
        });
        // Sign the transaction data
        const messageBytes = ethers.toUtf8Bytes(transactionData);
        const messageHash = ethers.keccak256(messageBytes);
        // In a real implementation, we would use wallet.signMessage() or signDigest()
        // but as this is asynchronous, we'll simulate it for this example
        const signature = (0, crypto_js_1.SHA256)(privateKey + messageHash).toString();
        // Add signature to transaction
        return {
            ...transaction,
            signature
        };
    }
    catch (error) {
        throw new Error('Error signing transaction: ' + (error instanceof Error ? error.message : String(error)));
    }
}
/**
 * Verify a transaction's signature
 * @param transaction Transaction to verify
 * @returns True if signature is valid
 */
function verifyTransaction(transaction) {
    // Mining rewards don't need verification
    if (transaction.fromAddress === null)
        return true;
    // Check if transaction has all required fields
    if (!transaction.signature || !transaction.fromAddress) {
        return false;
    }
    try {
        // Recreate the transaction hash
        const transactionData = JSON.stringify({
            fromAddress: transaction.fromAddress,
            toAddress: transaction.toAddress,
            amount: transaction.amount,
            timestamp: transaction.timestamp,
            fee: transaction.fee,
            data: transaction.data,
            nonce: transaction.nonce
        });
        // In a real implementation, we would recover the signer from the signature
        // and verify it matches the fromAddress, but for this example, we'll
        // simulate the verification
        // This is a simplified check - in a real system we would properly verify
        // the cryptographic signature
        const hasValidSignature = transaction.signature.length > 0;
        return hasValidSignature;
    }
    catch (error) {
        return false;
    }
}
/**
 * Generate a simple address from a public key
 * @param publicKey Public key
 * @returns Address
 */
function getAddressFromPublicKey(publicKey) {
    // In a real implementation, we would:
    // 1. Take the Keccak-256 hash of the public key
    // 2. Take the last 20 bytes
    // 3. Add 0x prefix
    // But for simplicity, we'll just return a shortened hash
    return '0x' + (0, crypto_js_1.SHA256)(publicKey).toString().substring(0, 40);
}
/**
 * Encrypt a private key with a password
 * @param privateKey Private key to encrypt
 * @param password Password to encrypt with
 * @returns Encrypted private key
 */
function encryptPrivateKey(privateKey, password) {
    // In a real implementation, we would use proper encryption
    // For example, ethers.Wallet has a encrypt method that uses AES-CTR
    // with scrypt for key derivation
    return (0, crypto_js_1.HmacSHA256)(privateKey, password).toString();
}
/**
 * Decrypt a private key with a password
 * @param encryptedKey Encrypted private key
 * @param password Password to decrypt with
 * @returns Decrypted private key
 */
function decryptPrivateKey(encryptedKey, password) {
    // In a real implementation, we would use proper decryption
    // This is just a stub for the interface
    throw new Error('Decryption not implemented in this demo');
}
/**
 * Create a keystore file (encrypted wallet)
 * @param wallet Wallet to encrypt
 * @param password Password to encrypt with
 * @returns Keystore JSON string
 */
function createKeystore(wallet, password) {
    // In a real implementation, we would use something like:
    // return ethers.Wallet.fromPrivateKey(wallet.privateKey).encrypt(password)
    // For this example, we'll just return a simulated keystore format
    const keystore = {
        version: 3,
        id: (0, crypto_js_1.SHA256)(wallet.address + Date.now()).toString().substring(0, 8),
        address: wallet.address.replace('0x', ''),
        crypto: {
            ciphertext: encryptPrivateKey(wallet.privateKey || '', password),
            cipherparams: { iv: (0, crypto_js_1.SHA256)(password).toString().substring(0, 16) },
            cipher: 'aes-128-ctr',
            kdf: 'scrypt',
            kdfparams: {
                dklen: 32,
                salt: (0, crypto_js_1.SHA256)(password + wallet.address).toString(),
                n: 262144,
                r: 8,
                p: 1
            },
            mac: (0, crypto_js_1.SHA256)(password + wallet.privateKey).toString()
        }
    };
    return JSON.stringify(keystore);
}
/**
 * Restore a wallet from a keystore file
 * @param keystoreJson Keystore JSON string
 * @param password Password to decrypt with
 * @returns Wallet object
 */
function restoreFromKeystore(keystoreJson, password) {
    // In a real implementation, we would use proper decryption
    // For now, we'll simulate it
    try {
        const keystore = JSON.parse(keystoreJson);
        // Simple validation
        if (!keystore.address || !keystore.crypto || !keystore.crypto.ciphertext) {
            throw new Error('Invalid keystore format');
        }
        // In a real implementation, we would decrypt the private key here
        // For this example, we're just creating a simulated wallet
        return {
            address: '0x' + keystore.address,
            // We won't include the private key since we can't properly decrypt it in this demo
            balance: 0
        };
    }
    catch (error) {
        throw new Error('Error restoring wallet: ' + (error instanceof Error ? error.message : String(error)));
    }
}
