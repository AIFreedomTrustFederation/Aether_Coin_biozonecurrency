"use strict";
/**
 * Singularity Coin Wallet Service
 *
 * This service integrates the Singularity Coin blockchain with the user interface,
 * providing functions for:
 * - Wallet creation and management
 * - Transaction operations
 * - Quantum wrapped asset management
 * - Blockchain status monitoring
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletService = exports.WalletService = void 0;
const index_1 = require("./index");
const quantum_crypto_1 = require("./quantum-crypto");
const fractalcoin_1 = require("../fractalcoin");
// Key storage functions for the browser
const saveKeysToLocalStorage = (credentials) => {
    // Encrypt sensitive data before storing
    const encryptedData = JSON.stringify(credentials);
    localStorage.setItem(`wallet:${credentials.address}`, encryptedData);
    // Store address in the list of wallets
    const walletList = JSON.parse(localStorage.getItem('wallet:list') || '[]');
    if (!walletList.includes(credentials.address)) {
        walletList.push(credentials.address);
        localStorage.setItem('wallet:list', JSON.stringify(walletList));
    }
};
const getKeysFromLocalStorage = (address) => {
    const encryptedData = localStorage.getItem(`wallet:${address}`);
    if (!encryptedData)
        return null;
    try {
        // Decrypt and parse credentials
        return JSON.parse(encryptedData);
    }
    catch (e) {
        console.error('Failed to parse wallet credentials', e);
        return null;
    }
};
/**
 * The WalletService provides an interface between the UI and the Singularity Coin blockchain
 */
class WalletService {
    /**
     * Get the singleton instance
     */
    static getInstance() {
        if (!WalletService.instance) {
            WalletService.instance = new WalletService();
        }
        return WalletService.instance;
    }
    constructor() {
        this.currentWallet = null;
        // Try to load the last used wallet
        this.loadLastUsedWallet();
    }
    /**
     * Create a new wallet
     * @param displayName User-friendly name for the wallet
     * @returns The new wallet credentials or null if creation failed
     */
    createWallet(displayName) {
        try {
            // Create account on the blockchain
            const account = index_1.singularityCoin.createAccount();
            if (!account)
                return null;
            // Generate quantum-resistant keys
            const kyberKeys = quantum_crypto_1.CrystalsKyber.generateKeyPair();
            const dilithiumKeys = quantum_crypto_1.CrystalsDilithium.generateKeyPair();
            const now = Date.now();
            // Create wallet credentials
            const credentials = {
                address: account.address,
                displayName,
                kyberPrivateKey: kyberKeys.privateKey,
                kyberPublicKey: kyberKeys.publicKey,
                dilithiumPrivateKey: dilithiumKeys.privateKey,
                dilithiumPublicKey: dilithiumKeys.publicKey,
                walletCreationDate: now,
                lastAccessDate: now,
            };
            // Save to local storage
            saveKeysToLocalStorage(credentials);
            // Set as current wallet
            this.currentWallet = credentials;
            // Also create a FractalCoin account linked to this address
            fractalcoin_1.fractalCoin.createAccount(account.address);
            return credentials;
        }
        catch (e) {
            console.error('Failed to create wallet', e);
            return null;
        }
    }
    /**
     * Get all wallets stored in local storage
     * @returns List of wallet addresses
     */
    getStoredWallets() {
        return JSON.parse(localStorage.getItem('wallet:list') || '[]');
    }
    /**
     * Load a wallet from local storage
     * @param address The wallet address to load
     * @returns True if successfully loaded
     */
    loadWallet(address) {
        const credentials = getKeysFromLocalStorage(address);
        if (!credentials)
            return false;
        // Update last access date
        credentials.lastAccessDate = Date.now();
        saveKeysToLocalStorage(credentials);
        // Set as current wallet
        this.currentWallet = credentials;
        return true;
    }
    /**
     * Get the currently loaded wallet
     * @returns Current wallet credentials or null if none loaded
     */
    getCurrentWallet() {
        return this.currentWallet;
    }
    /**
     * Get the current wallet's balance
     * @returns The balance as a string or null if no wallet is loaded
     */
    getBalance() {
        if (!this.currentWallet)
            return null;
        const account = index_1.singularityCoin.getAccount(this.currentWallet.address);
        return account?.balance || null;
    }
    /**
     * Get the current wallet's staked amount
     * @returns The staked amount as a string or null if no wallet is loaded
     */
    getStakedAmount() {
        if (!this.currentWallet)
            return null;
        const account = index_1.singularityCoin.getAccount(this.currentWallet.address);
        return account?.stakedAmount || null;
    }
    /**
     * Send a transaction
     * @param request Transaction request parameters
     * @returns Transaction result object
     */
    sendTransaction(request) {
        try {
            // Create and process the transaction
            const tx = index_1.singularityCoin.createTransaction(request.senderAddress, request.recipientAddress, request.amount, request.privateKey, request.type, request.data);
            if (!tx) {
                return {
                    success: false,
                    error: 'Failed to create transaction',
                    timestamp: Date.now(),
                };
            }
            // Process the transaction
            const success = index_1.singularityCoin.processTransaction(tx);
            return {
                success,
                transactionId: tx.id,
                timestamp: Date.now(),
                error: success ? undefined : 'Transaction processing failed',
            };
        }
        catch (e) {
            console.error('Transaction failed', e);
            return {
                success: false,
                error: e instanceof Error ? e.message : 'Unknown error',
                timestamp: Date.now(),
            };
        }
    }
    /**
     * Wrap an external asset with quantum security
     * @param request Wrap request parameters
     * @returns The wrapped asset or null if wrapping failed
     */
    wrapExternalAsset(request) {
        try {
            return index_1.singularityCoin.createQuantumWrappedAsset(request.ownerAddress, request.originalChain, request.originalAsset, request.amount, request.securityLevel, request.privateKey);
        }
        catch (e) {
            console.error('Asset wrapping failed', e);
            return null;
        }
    }
    /**
     * Get all wrapped assets owned by the current wallet
     * @returns Array of wrapped assets or null if no wallet is loaded
     */
    getWrappedAssets() {
        if (!this.currentWallet)
            return null;
        return index_1.singularityCoin.getWrappedAssetsByOwner(this.currentWallet.address);
    }
    /**
     * Get the current blockchain status
     * @returns Blockchain status snapshot
     */
    getBlockchainStatus() {
        const stats = index_1.singularityCoin.getNetworkStats();
        return {
            blockHeight: stats.blockHeight,
            currentConsensus: stats.currentConsensus,
            pendingTransactions: stats.pendingTransactions,
            activeValidators: stats.activeValidators,
            timestamp: Date.now(),
            aiRecommendations: stats.aiRecommendations,
        };
    }
    /**
     * Get the FractalCoin balance for the current wallet
     * @returns The FractalCoin balance or null if no wallet is loaded
     */
    getFractalCoinBalance() {
        if (!this.currentWallet)
            return null;
        const account = fractalcoin_1.fractalCoin.getAccount(this.currentWallet.address);
        return account?.balance || null;
    }
    /**
     * Get the reward rate for the current wallet's FractalCoin account
     * @returns The daily reward rate or null if no wallet is loaded
     */
    getFractalCoinRewardRate() {
        if (!this.currentWallet)
            return null;
        const account = fractalcoin_1.fractalCoin.getAccount(this.currentWallet.address);
        return account?.rewardRate || null;
    }
    /**
     * Claim accumulated FractalCoin rewards
     * @returns The amount claimed or null if claiming failed
     */
    claimFractalCoinRewards() {
        if (!this.currentWallet)
            return null;
        return fractalcoin_1.fractalCoin.claimRewards(this.currentWallet.address);
    }
    /**
     * Sign a message with quantum-resistant signatures
     * @param message The message to sign
     * @returns The hybrid signature or null if signing failed
     */
    signMessage(message) {
        if (!this.currentWallet)
            return null;
        try {
            return quantum_crypto_1.QuantumSecurityProvider.createHybridSignature(message, {
                dilithiumPrivateKey: this.currentWallet.dilithiumPrivateKey,
                sphincsPlusPrivateKey: '', // We don't have SPHINCS+ in the wallet yet
            });
        }
        catch (e) {
            console.error('Message signing failed', e);
            return null;
        }
    }
    /**
     * Load the last used wallet
     * @private
     */
    loadLastUsedWallet() {
        const lastWalletAddress = localStorage.getItem('wallet:lastUsed');
        if (lastWalletAddress) {
            this.loadWallet(lastWalletAddress);
        }
    }
}
exports.WalletService = WalletService;
// Export singleton instance
exports.walletService = WalletService.getInstance();
