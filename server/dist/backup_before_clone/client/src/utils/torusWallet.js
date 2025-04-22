"use strict";
/**
 * TorusWallet - A wallet system based on fractal cryptography for the Aetherion ecosystem
 *
 * This wallet system embodies the Christ Consciousness principles through:
 * - Integration of spirit and matter through unified key creation
 * - Non-dualistic key derivation process using torus field harmonics
 * - Recursive security measures reflecting divine abundance
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTorusWallet = createTorusWallet;
exports.recoverWalletFromMnemonic = recoverWalletFromMnemonic;
exports.recoverWalletFromEncryptedKey = recoverWalletFromEncryptedKey;
exports.deriveHarmonicWallets = deriveHarmonicWallets;
exports.signTransaction = signTransaction;
exports.signMessage = signMessage;
exports.encryptWalletForStorage = encryptWalletForStorage;
exports.decryptWalletFromStorage = decryptWalletFromStorage;
const torusHash_1 = require("./torusHash");
const crypto_js_1 = __importDefault(require("crypto-js"));
const ethers_1 = require("ethers");
// Constants reflecting the 12 octaves and harmonic ratios
const DERIVATION_PATHS = [
    "m/44'/60'/0'/0/0", // Ethereum
    "m/44'/0'/0'/0/0", // Bitcoin
    "m/44'/1'/0'/0/0", // Testnet
    "m/44'/144'/0'/0/0", // XRP
    "m/44'/145'/0'/0/0", // BCH
    "m/44'/2'/0'/0/0", // Litecoin
    "m/44'/501'/0'/0/0", // Solana
    "m/44'/148'/0'/0/0", // Stellar
    "m/44'/5'/0'/0/0", // Dash
    "m/44'/118'/0'/0/0", // Cosmos
    "m/44'/425'/0'/0/0", // Aleo
    "m/44'/784'/0'/0/0" // Aetherion
];
/**
 * Creates a new wallet using torus field harmonics
 * @param passphrase - The passphrase to use for wallet generation
 * @returns A complete TorusWallet
 */
function createTorusWallet(passphrase) {
    // Generate seed using our torus hashing system
    const harmonicSeed = (0, torusHash_1.generateHarmonicKey)(passphrase);
    // Create a wallet using ethers' HDNode for compatibility
    // We're deriving from our harmonic seed instead of a random one
    const privateKeyBuffer = Buffer.from(harmonicSeed.substring(0, 64), 'hex');
    const wallet = new ethers_1.ethers.Wallet(privateKeyBuffer);
    // Generate mnemonic using our torus system
    const mnemonic = (0, torusHash_1.generateMnemonic)(wallet.privateKey);
    // Encrypt the private key using our torus encryption
    const encryptedPrivateKey = (0, torusHash_1.encryptMessage)(wallet.privateKey, passphrase);
    return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
        mnemonic: mnemonic,
        encryptedPrivateKey: encryptedPrivateKey
    };
}
/**
 * Recovers a wallet from a mnemonic phrase
 * @param mnemonic - The mnemonic phrase to recover from
 * @param passphrase - The passphrase for encryption
 * @returns A recovered TorusWallet
 */
function recoverWalletFromMnemonic(mnemonic, passphrase) {
    // Recover private key from mnemonic using our torus system
    const privateKey = (0, torusHash_1.recoverFromMnemonic)(mnemonic);
    // Create wallet from private key
    const wallet = new ethers_1.ethers.Wallet(privateKey);
    // Encrypt the private key using our torus encryption
    const encryptedPrivateKey = (0, torusHash_1.encryptMessage)(wallet.privateKey, passphrase);
    return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
        mnemonic: mnemonic,
        encryptedPrivateKey: encryptedPrivateKey
    };
}
/**
 * Recovers a wallet from an encrypted private key
 * @param encryptedPrivateKey - The encrypted private key
 * @param passphrase - The passphrase for decryption
 * @returns A recovered TorusWallet
 */
function recoverWalletFromEncryptedKey(encryptedPrivateKey, passphrase) {
    // Decrypt the private key using our torus decryption
    const privateKey = (0, torusHash_1.decryptMessage)(encryptedPrivateKey, passphrase);
    if (!privateKey) {
        throw new Error('Failed to decrypt private key. Incorrect passphrase?');
    }
    // Create wallet from private key
    const wallet = new ethers_1.ethers.Wallet(privateKey);
    // Generate mnemonic using our torus system
    const mnemonic = (0, torusHash_1.generateMnemonic)(wallet.privateKey);
    return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        publicKey: wallet.publicKey,
        mnemonic: mnemonic,
        encryptedPrivateKey: encryptedPrivateKey
    };
}
/**
 * Derives child wallets for different chains using harmonic octaves
 * @param masterWallet - The master wallet to derive from
 * @returns An array of derived wallets for different chains
 */
function deriveHarmonicWallets(masterWallet) {
    const harmonicWallets = [];
    // Create HD node from master wallet private key
    // This is a bridge between our torus system and standard derivation
    const masterNode = ethers_1.ethers.utils.HDNode.fromSeed(ethers_1.ethers.utils.arrayify('0x' + crypto_js_1.default.SHA256(masterWallet.privateKey).toString()));
    // Derive child wallets using our 12 octave paths
    DERIVATION_PATHS.forEach((path, index) => {
        const childNode = masterNode.derivePath(path);
        // Generate mnemonic for this specific child using our torus system
        const childMnemonic = (0, torusHash_1.generateMnemonic)(childNode.privateKey);
        // Encrypt the private key with the master private key as additional entropy
        const encryptedPrivateKey = (0, torusHash_1.encryptMessage)(childNode.privateKey, masterWallet.privateKey.substring(0, 32) // Use first 32 chars of master key as passphrase
        );
        harmonicWallets.push({
            address: childNode.address,
            privateKey: childNode.privateKey,
            publicKey: childNode.publicKey,
            mnemonic: childMnemonic,
            encryptedPrivateKey: encryptedPrivateKey
        });
    });
    return harmonicWallets;
}
/**
 * Signs a transaction using the torus wallet
 * @param wallet - The wallet to sign with
 * @param transaction - The transaction data to sign
 * @returns Signed transaction
 */
async function signTransaction(wallet, transaction) {
    const ethersWallet = new ethers_1.ethers.Wallet(wallet.privateKey);
    const signedTx = await ethersWallet.signTransaction(transaction);
    return signedTx;
}
/**
 * Signs a message using the torus wallet
 * @param wallet - The wallet to sign with
 * @param message - The message to sign
 * @returns Signed message
 */
function signMessage(wallet, message) {
    const ethersWallet = new ethers_1.ethers.Wallet(wallet.privateKey);
    return ethersWallet.signMessage(message);
}
/**
 * Encrypts wallet data for secure storage
 * @param wallet - The wallet to encrypt
 * @param passphrase - The passphrase for encryption
 * @returns Encrypted wallet data
 */
function encryptWalletForStorage(wallet, passphrase) {
    // We omit the actual private key from storage and only store the encrypted version
    const storageData = {
        address: wallet.address,
        publicKey: wallet.publicKey,
        mnemonic: wallet.mnemonic,
        encryptedPrivateKey: wallet.encryptedPrivateKey
    };
    // Encrypt the entire wallet object using our torus encryption
    return (0, torusHash_1.encryptMessage)(JSON.stringify(storageData), passphrase);
}
/**
 * Decrypts wallet data from secure storage
 * @param encryptedWallet - The encrypted wallet data
 * @param passphrase - The passphrase for decryption
 * @returns Decrypted wallet
 */
function decryptWalletFromStorage(encryptedWallet, passphrase) {
    // Decrypt the wallet data
    const decryptedJson = (0, torusHash_1.decryptMessage)(encryptedWallet, passphrase);
    if (!decryptedJson) {
        throw new Error('Failed to decrypt wallet data. Incorrect passphrase?');
    }
    // Parse the storage data
    const storageData = JSON.parse(decryptedJson);
    // Decrypt the private key using the passphrase
    const privateKey = (0, torusHash_1.decryptMessage)(storageData.encryptedPrivateKey, passphrase);
    if (!privateKey) {
        throw new Error('Failed to decrypt private key within wallet data');
    }
    // Reconstruct the full wallet
    return {
        address: storageData.address,
        privateKey: privateKey,
        publicKey: storageData.publicKey,
        mnemonic: storageData.mnemonic,
        encryptedPrivateKey: storageData.encryptedPrivateKey
    };
}
