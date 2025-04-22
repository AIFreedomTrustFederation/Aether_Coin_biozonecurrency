"use strict";
/**
 * WalletConnector.ts
 *
 * Module for connecting to different types of cryptocurrency wallets and bank accounts
 * Provides a unified interface for wallet management with real Web3 connections
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletConnector = void 0;
const events_1 = require("events");
const crypto_js_1 = __importDefault(require("crypto-js"));
const ethers = __importStar(require("ethers"));
const units_1 = require("@ethersproject/units");
// Mock data for Plaid integration (until we implement real Plaid API)
const MOCK_PLAID = {
    type: 'plaid',
    name: 'Bank Account',
    metadata: {
        accountNumber: 'XXXX1234',
        bankName: 'Virtual Bank'
    },
    balance: '$4,532.78'
};
// Network mapping for chain IDs
const NETWORKS = {
    1: { name: 'Ethereum Mainnet', symbol: 'ETH' },
    56: { name: 'BNB Smart Chain', symbol: 'BNB' },
    137: { name: 'Polygon', symbol: 'MATIC' },
    43114: { name: 'Avalanche', symbol: 'AVAX' },
    42161: { name: 'Arbitrum One', symbol: 'ETH' },
    10: { name: 'Optimism', symbol: 'ETH' },
    5: { name: 'Goerli Testnet', symbol: 'ETH' },
    80001: { name: 'Mumbai Testnet', symbol: 'MATIC' }
};
class WalletConnector extends events_1.EventEmitter {
    constructor() {
        super();
        this.initialized = false;
        this.encryptionKey = '';
        this.connectedWallets = [];
        this.fractalCoinBalance = 0;
        this.storageMetrics = {};
        // Set max listeners to avoid memory leak warnings
        this.setMaxListeners(20);
    }
    /**
     * Initialize the wallet connector with an encryption key
     * @param encryptionKey - Master password for securing wallet data
     */
    initialize(encryptionKey) {
        if (this.initialized)
            return;
        // Set encryption key (hash it for security)
        const hash = crypto_js_1.default.SHA256(encryptionKey).toString();
        this.encryptionKey = hash;
        // Initialize storage metrics for test mode
        this.storageMetrics = {
            totalNodes: 0,
            ethereumWallets: 0,
            bitcoinWallets: 0,
            coinbaseWallets: 0,
            plaidConnections: 0,
            storagePoints: 0,
            quantumComplexity: 0,
            lastUpdate: new Date().toISOString()
        };
        // Start with some initial FractalCoin balance
        this.fractalCoinBalance = 25.0;
        this.initialized = true;
    }
    /**
     * Connect an Ethereum wallet (MetaMask)
     * @returns Promise that resolves to a connected wallet object
     */
    async connectEthereumWallet() {
        this.checkInitialized();
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask not installed. Please install MetaMask to connect your Ethereum wallet.');
            }
            // Request account access from MetaMask
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            if (!accounts || accounts.length === 0) {
                throw new Error('No Ethereum accounts found. Please check your MetaMask extension.');
            }
            // Get the connected account
            const address = accounts[0];
            // Get the chain ID
            const chainIdHex = await window.ethereum.request({
                method: 'eth_chainId'
            });
            const chainId = parseInt(chainIdHex, 16);
            // Create a Web3Provider from MetaMask
            const provider = new ethers.BrowserProvider(window.ethereum);
            // Get the wallet balance
            const balanceWei = await provider.getBalance(address);
            const balanceEth = (0, units_1.formatEther)(balanceWei);
            // Format the balance with network symbol
            const networkInfo = NETWORKS[chainId] || { name: 'Unknown Network', symbol: 'ETH' };
            const formattedBalance = `${parseFloat(balanceEth).toFixed(4)} ${networkInfo.symbol}`;
            // Create wallet object
            const walletId = `eth-${Date.now()}`;
            const wallet = {
                id: walletId,
                type: 'ethereum',
                name: window.ethereum.isMetaMask ? 'MetaMask' : 'Ethereum Wallet',
                address: address,
                balance: formattedBalance,
                chainId: chainId,
                provider: provider
            };
            // Register event handler for account changes
            const accountsChangedHandler = (newAccounts) => {
                // If the user switches accounts, update the wallet
                if (newAccounts.length === 0) {
                    // User disconnected their wallet
                    this.disconnectWallet(walletId);
                }
                else if (newAccounts[0] !== address) {
                    // Account changed, update the wallet
                    this.disconnectWallet(walletId);
                    this.connectEthereumWallet();
                }
            };
            // Register event handler for chain changes
            const chainChangedHandler = () => {
                // Chain changed, reconnect
                this.disconnectWallet(walletId);
                this.connectEthereumWallet();
            };
            // Add event listeners
            window.ethereum.on('accountsChanged', accountsChangedHandler);
            window.ethereum.on('chainChanged', chainChangedHandler);
            // Store event handlers for cleanup during disconnect
            wallet.metadata = {
                ...wallet.metadata,
                eventHandlers: {
                    accountsChanged: accountsChangedHandler,
                    chainChanged: chainChangedHandler
                }
            };
            // Save the wallet
            this.connectedWallets.push(wallet);
            this.storageMetrics.ethereumWallets++;
            this.updateStorageMetrics();
            // Emit wallet connected event
            this.emit('walletConnected', wallet);
            return wallet;
        }
        catch (error) {
            console.error('Error connecting Ethereum wallet:', error);
            throw new Error('Failed to connect Ethereum wallet. ' + (error instanceof Error ? error.message : ''));
        }
    }
    /**
     * Connect a Bitcoin wallet
     * @returns Promise that resolves to a connected wallet object
     */
    async connectBitcoinWallet() {
        this.checkInitialized();
        try {
            // Currently, there's no standardized Bitcoin wallet API for browsers like MetaMask
            // We could integrate with specific Bitcoin wallets in the future
            // For now, inform the user this functionality is not implemented yet
            throw new Error('Bitcoin wallet connection is not implemented yet. Please use Ethereum or Coinbase wallets for now.');
        }
        catch (error) {
            console.error('Error connecting Bitcoin wallet:', error);
            throw new Error('Failed to connect Bitcoin wallet. ' + (error instanceof Error ? error.message : ''));
        }
    }
    /**
     * Connect a Coinbase wallet
     * @returns Promise that resolves to a connected wallet object
     */
    async connectCoinbaseWallet() {
        this.checkInitialized();
        try {
            // Check if the Coinbase wallet extension is available
            if (!window.ethereum?.isCoinbaseWallet && !window.coinbaseWalletExtension) {
                throw new Error('Coinbase Wallet not installed. Please install Coinbase Wallet to connect.');
            }
            // Determine which provider to use
            const provider = window.ethereum?.isCoinbaseWallet ? window.ethereum : window.coinbaseWalletExtension;
            // Request account access
            const accounts = await provider.request({
                method: 'eth_requestAccounts'
            });
            if (!accounts || accounts.length === 0) {
                throw new Error('No Coinbase Wallet accounts found.');
            }
            // Get the connected account
            const address = accounts[0];
            // Get the chain ID
            const chainIdHex = await provider.request({
                method: 'eth_chainId'
            });
            const chainId = parseInt(chainIdHex, 16);
            // Create an ethers provider
            const ethersProvider = new ethers.BrowserProvider(provider);
            // Get the wallet balance
            const balanceWei = await ethersProvider.getBalance(address);
            const balanceEth = (0, units_1.formatEther)(balanceWei);
            // Format the balance with network symbol
            const networkInfo = NETWORKS[chainId] || { name: 'Unknown Network', symbol: 'ETH' };
            const formattedBalance = `${parseFloat(balanceEth).toFixed(4)} ${networkInfo.symbol}`;
            // Create wallet object
            const walletId = `cb-${Date.now()}`;
            const wallet = {
                id: walletId,
                type: 'coinbase',
                name: 'Coinbase Wallet',
                address: address,
                balance: formattedBalance,
                chainId: chainId,
                provider: ethersProvider
            };
            // Register event handler for account changes
            const accountsChangedHandler = (newAccounts) => {
                if (newAccounts.length === 0) {
                    // User disconnected their wallet
                    this.disconnectWallet(walletId);
                }
                else if (newAccounts[0] !== address) {
                    // Account changed, update the wallet
                    this.disconnectWallet(walletId);
                    this.connectCoinbaseWallet();
                }
            };
            // Register event handler for chain changes
            const chainChangedHandler = () => {
                // Chain changed, reconnect
                this.disconnectWallet(walletId);
                this.connectCoinbaseWallet();
            };
            // Add event listeners
            provider.on('accountsChanged', accountsChangedHandler);
            provider.on('chainChanged', chainChangedHandler);
            // Store event handlers for cleanup during disconnect
            wallet.metadata = {
                ...wallet.metadata,
                eventHandlers: {
                    accountsChanged: accountsChangedHandler,
                    chainChanged: chainChangedHandler
                }
            };
            // Save the wallet
            this.connectedWallets.push(wallet);
            this.storageMetrics.coinbaseWallets++;
            this.updateStorageMetrics();
            // Emit wallet connected event
            this.emit('walletConnected', wallet);
            return wallet;
        }
        catch (error) {
            console.error('Error connecting Coinbase wallet:', error);
            throw new Error('Failed to connect Coinbase wallet. ' + (error instanceof Error ? error.message : ''));
        }
    }
    /**
     * Connect a Plaid bank account
     * @returns Promise that resolves to a connected wallet object
     */
    async connectPlaidBankAccount() {
        this.checkInitialized();
        try {
            // For Plaid integration, we would normally use their Link SDK
            // As we don't have a Plaid API key in this environment, simulate the connection
            await this.simulateConnection(1500);
            const walletId = `plaid-${Date.now()}`;
            const wallet = {
                id: walletId,
                type: 'plaid',
                name: MOCK_PLAID.name,
                balance: MOCK_PLAID.balance,
                metadata: MOCK_PLAID.metadata
            };
            this.connectedWallets.push(wallet);
            this.storageMetrics.plaidConnections++;
            this.updateStorageMetrics();
            // Emit wallet connected event
            this.emit('walletConnected', wallet);
            return wallet;
        }
        catch (error) {
            console.error('Error connecting Plaid bank account:', error);
            throw new Error('Failed to connect Plaid bank account. ' + (error instanceof Error ? error.message : ''));
        }
    }
    /**
     * Disconnect a wallet
     * @param walletId - ID of the wallet to disconnect
     */
    disconnectWallet(walletId) {
        this.checkInitialized();
        const walletIndex = this.connectedWallets.findIndex(w => w.id === walletId);
        if (walletIndex === -1) {
            throw new Error(`Wallet with ID ${walletId} not found`);
        }
        const wallet = this.connectedWallets[walletIndex];
        // Update metrics
        if (wallet.type === 'ethereum')
            this.storageMetrics.ethereumWallets--;
        if (wallet.type === 'bitcoin')
            this.storageMetrics.bitcoinWallets--;
        if (wallet.type === 'coinbase')
            this.storageMetrics.coinbaseWallets--;
        if (wallet.type === 'plaid')
            this.storageMetrics.plaidConnections--;
        // Remove wallet from connected wallets
        this.connectedWallets.splice(walletIndex, 1);
        // Update storage metrics
        this.updateStorageMetrics();
        // Emit wallet disconnected event
        this.emit('walletDisconnected', walletId);
    }
    /**
     * Get all connected wallets
     * @returns Array of connected wallet objects
     */
    getConnectedWallets() {
        this.checkInitialized();
        return [...this.connectedWallets];
    }
    /**
     * Add a wallet that's been verified with a passphrase
     * This bypasses the normal connection flow since the wallet has already been verified
     * @param wallet - The verified wallet to add
     */
    addVerifiedWallet(wallet) {
        this.checkInitialized();
        console.log("Adding verified wallet:", wallet.id, wallet.type);
        // Remove any existing wallet with the same ID or address to prevent duplicates
        this.connectedWallets = this.connectedWallets.filter(w => w.id !== wallet.id && w.address?.toLowerCase() !== wallet.address?.toLowerCase());
        // Add the wallet
        this.connectedWallets.push(wallet);
        // Update metrics based on wallet type
        if (wallet.type === 'ethereum')
            this.storageMetrics.ethereumWallets++;
        if (wallet.type === 'bitcoin')
            this.storageMetrics.bitcoinWallets++;
        // Emit a connection event
        this.emit('wallet-connected', wallet);
        console.log("Wallet connected successfully:", wallet.id);
        if (wallet.type === 'coinbase')
            this.storageMetrics.coinbaseWallets++;
        if (wallet.type === 'plaid')
            this.storageMetrics.plaidConnections++;
        // Update storage metrics
        this.updateStorageMetrics();
        // Emit wallet connected event
        this.emit('walletConnected', wallet);
    }
    /**
     * Get FractalCoin balance
     * @returns Current FractalCoin balance
     */
    getFractalCoinBalance() {
        this.checkInitialized();
        return this.fractalCoinBalance;
    }
    /**
     * Get storage metrics
     * @returns Object containing storage metrics
     */
    getStorageMetrics() {
        this.checkInitialized();
        return { ...this.storageMetrics };
    }
    /**
     * Add wallet connected event listener
     * @param listener - Callback function that will be called when a wallet is connected
     */
    onWalletConnected(listener) {
        this.on('walletConnected', listener);
    }
    /**
     * Add wallet disconnected event listener
     * @param listener - Callback function that will be called when a wallet is disconnected
     */
    onWalletDisconnected(listener) {
        this.on('walletDisconnected', listener);
    }
    /**
     * Determine if wallet connector is initialized
     * @returns True if initialized, false otherwise
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * Private method to check if wallet connector is initialized
     * @throws Error if not initialized
     */
    checkInitialized() {
        if (!this.initialized) {
            throw new Error('WalletConnector not initialized. Call initialize() first.');
        }
    }
    /**
     * Simulate a connection delay
     * @param ms - Milliseconds to delay
     * @returns Promise that resolves after the delay
     */
    simulateConnection(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
    /**
     * Update storage metrics
     */
    updateStorageMetrics() {
        const totalWallets = this.storageMetrics.ethereumWallets +
            this.storageMetrics.bitcoinWallets +
            this.storageMetrics.coinbaseWallets +
            this.storageMetrics.plaidConnections;
        this.storageMetrics.totalNodes = totalWallets * 3;
        this.storageMetrics.storagePoints = totalWallets * 150;
        this.storageMetrics.quantumComplexity = Math.min(totalWallets * 25, 100);
        this.storageMetrics.lastUpdate = new Date().toISOString();
        // Increase FractalCoin balance based on contributions
        this.fractalCoinBalance += totalWallets * 5;
    }
}
// Export singleton instance
exports.walletConnector = new WalletConnector();
