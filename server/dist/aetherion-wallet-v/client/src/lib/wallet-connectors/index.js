"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_NETWORKS = void 0;
exports.getAvailableWallets = getAvailableWallets;
exports.connectWallet = connectWallet;
exports.disconnectWallet = disconnectWallet;
exports.getICODetails = getICODetails;
exports.purchaseTokens = purchaseTokens;
exports.switchNetwork = switchNetwork;
const ethers_1 = require("ethers");
// Detect available wallets in the browser environment
function getAvailableWallets() {
    const available = [];
    // Check for MetaMask
    if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
        available.push('MetaMask');
    }
    // Check for Coinbase Wallet
    if (typeof window !== 'undefined' && window.ethereum?.isCoinbaseWallet) {
        available.push('Coinbase');
    }
    // Check for Binance Chain Wallet
    if (typeof window !== 'undefined' && window.BinanceChain) {
        available.push('Binance');
    }
    // Check for Trust Wallet
    // Trust Wallet doesn't have a specific identifier like isTrust
    // We'll rely on other detection methods like mobile detection in the wallet component
    if (typeof window !== 'undefined' && window.ethereum) {
        // Always add Trust as an option for mobile users
        available.push('Trust');
    }
    // Most wallets don't expose a unique identifier
    // So we add WalletConnect and other options if we have an injected provider
    if (typeof window !== 'undefined' && window.ethereum) {
        available.push('WalletConnect');
        // 1inch is a popular DEX aggregator wallet
        available.push('1inch');
    }
    // Always add all major wallet types so users have options
    // even if not detected directly
    if (!available.includes('MetaMask'))
        available.push('MetaMask');
    if (!available.includes('Coinbase'))
        available.push('Coinbase');
    if (!available.includes('Binance'))
        available.push('Binance');
    if (!available.includes('Trust'))
        available.push('Trust');
    if (!available.includes('WalletConnect'))
        available.push('WalletConnect');
    if (!available.includes('1inch'))
        available.push('1inch');
    return available;
}
// Connect to a wallet by type
async function connectWallet(walletType) {
    switch (walletType) {
        case 'MetaMask':
            return connectMetaMaskWallet();
        case 'Coinbase':
            return connectCoinbaseWallet();
        case 'WalletConnect':
            return connectWalletConnect();
        case 'Binance':
            return connectBinanceWallet();
        case 'Trust':
            return connectTrustWallet();
        case '1inch':
            return connect1inchWallet();
        default:
            throw new Error(`Unsupported wallet type: ${walletType}`);
    }
}
// Connect to MetaMask
async function connectMetaMaskWallet() {
    if (!window.ethereum?.isMetaMask) {
        throw new Error('MetaMask is not installed');
    }
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers_1.ethers.BrowserProvider(window.ethereum);
        return {
            provider,
            accounts,
            walletProvider: window.ethereum
        };
    }
    catch (error) {
        console.error('Error connecting to MetaMask:', error);
        throw error;
    }
}
// Connect to Coinbase Wallet
async function connectCoinbaseWallet() {
    if (!window.ethereum?.isCoinbaseWallet) {
        throw new Error('Coinbase Wallet is not installed');
    }
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers_1.ethers.BrowserProvider(window.ethereum);
        return {
            provider,
            accounts,
            walletProvider: window.ethereum
        };
    }
    catch (error) {
        console.error('Error connecting to Coinbase Wallet:', error);
        throw error;
    }
}
// Connect with WalletConnect
async function connectWalletConnect() {
    try {
        console.log("Starting WalletConnect connection attempt");
        // Debug environment
        if (typeof window !== 'undefined') {
            console.log("Browser environment check:", {
                hasEthereum: !!window.ethereum,
                hasBinanceChain: !!window.BinanceChain,
                userAgent: navigator.userAgent,
                isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
            });
        }
        // Check if we're already connected through another provider that supports WalletConnect
        if (window.ethereum) {
            try {
                console.log("Found ethereum provider, attempting direct connection");
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers_1.ethers.BrowserProvider(window.ethereum);
                console.log("Successfully connected via ethereum provider", { accounts });
                return {
                    provider,
                    accounts,
                    walletProvider: window.ethereum
                };
            }
            catch (error) {
                console.error('Error connecting with ethereum provider:', error);
            }
        }
        // Mobile deep linking fallback
        const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            console.log("Mobile device detected, providing WalletConnect URI for deep linking");
            // Create mock WalletConnect response for mobile
            // The actual URI would be generated by the WalletConnect library
            // For now, we'll provide a fake one to show the QR code / deep link UI
            const mockProvider = new ethers_1.ethers.BrowserProvider(window.ethereum || {});
            return {
                provider: mockProvider,
                accounts: [],
                walletProvider: {
                    uri: "wc:00000000-0000-0000-0000-000000000000@1?bridge=https://bridge.walletconnect.org&key=00000000000000000000000000000000000000000000000000000000000000",
                    isWalletConnect: true
                }
            };
        }
        // Desktop fallback - suggest wallet installation
        console.error("No compatible wallet or WalletConnect provider found");
        throw new Error('Could not connect to your Web3 wallet. Please install MetaMask or another compatible wallet.');
    }
    catch (error) {
        console.error('Error connecting with WalletConnect:', error);
        throw error;
    }
}
// Connect to Binance Chain Wallet
async function connectBinanceWallet() {
    if (!window.BinanceChain) {
        throw new Error('Binance Chain Wallet is not installed');
    }
    try {
        const accounts = await window.BinanceChain.request({ method: 'eth_requestAccounts' });
        // BinanceChain provides its own provider
        const provider = new ethers_1.ethers.BrowserProvider(window.BinanceChain);
        return {
            provider,
            accounts,
            walletProvider: window.BinanceChain
        };
    }
    catch (error) {
        console.error('Error connecting to Binance Chain Wallet:', error);
        throw error;
    }
}
// Connect to Trust Wallet
async function connectTrustWallet() {
    // Trust wallet uses standard ethereum provider, we can't detect it specifically
    if (!window.ethereum) {
        throw new Error('No Web3 provider detected. Please install Trust Wallet');
    }
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers_1.ethers.BrowserProvider(window.ethereum);
        return {
            provider,
            accounts,
            walletProvider: window.ethereum
        };
    }
    catch (error) {
        console.error('Error connecting to Trust Wallet:', error);
        throw error;
    }
}
// Connect to 1inch Wallet
async function connect1inchWallet() {
    // 1inch wallet typically injects into window.ethereum
    if (!window.ethereum) {
        throw new Error('No Web3 provider detected. Please install 1inch Wallet');
    }
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers_1.ethers.BrowserProvider(window.ethereum);
        return {
            provider,
            accounts,
            walletProvider: window.ethereum
        };
    }
    catch (error) {
        console.error('Error connecting to 1inch Wallet:', error);
        throw error;
    }
}
// Disconnect from a wallet
async function disconnectWallet(walletType) {
    try {
        // Different wallet types may have different disconnect methods
        switch (walletType) {
            case 'MetaMask':
                // MetaMask doesn't have a disconnect method, we just remove event listeners
                // This is handled in the LiveModeContext
                return true;
            case 'Coinbase':
                // Same for Coinbase Wallet
                return true;
            case 'WalletConnect':
                // WalletConnect typically has a disconnect method but we're using the injected provider
                return true;
            case 'Binance':
                // Binance Chain Wallet doesn't expose a disconnect method
                return true;
            case 'Trust':
                // Trust Wallet doesn't expose a disconnect method
                return true;
            case '1inch':
                // 1inch wallet doesn't expose a disconnect method
                return true;
            default:
                return false;
        }
    }
    catch (error) {
        console.error(`Error disconnecting from ${walletType}:`, error);
        return false;
    }
}
// Get ICO details
function getICODetails() {
    // This would normally fetch from an API or blockchain, but for now it's hardcoded
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 30); // Started 30 days ago
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + 30); // Ends in 30 days
    // Sample ICO details
    return {
        symbol: 'SING',
        tokenPrice: '0.000646',
        hardCap: '646000',
        softCap: '200000',
        minContribution: '100',
        maxContribution: '50000',
        tokensSold: '700000000',
        totalSupply: '10000000000',
        startDate,
        endDate,
        status: 'active'
    };
}
// ICO Token Purchase
async function purchaseTokens(walletType, amountInUSD, paymentToken = 'native', transferToAetherion = false, aetherionAddress = '') {
    try {
        // Simulate token purchase
        await new Promise(resolve => setTimeout(resolve, 2000));
        const tokenPrice = parseFloat('0.000646');
        const purchaseAmount = parseFloat(amountInUSD);
        const tokenAmount = (purchaseAmount / tokenPrice).toString();
        // Mock transaction hash
        const txHash = '0x' + Array.from(Array(64), () => Math.floor(Math.random() * 16).toString(16)).join('');
        let transferTxHash = undefined;
        if (transferToAetherion && aetherionAddress) {
            // Simulate secondary transaction for Aetherion transfer
            await new Promise(resolve => setTimeout(resolve, 1500));
            transferTxHash = '0x' + Array.from(Array(64), () => Math.floor(Math.random() * 16).toString(16)).join('');
        }
        return {
            success: true,
            txHash,
            tokenAmount,
            transferTxHash
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message || 'Failed to purchase tokens'
        };
    }
}
// Network switching
async function switchNetwork(walletType, chainId) {
    // Implementation would depend on the wallet type
    return true;
}
// Define supported networks
exports.SUPPORTED_NETWORKS = {
    1: {
        name: 'Ethereum Mainnet',
        symbol: 'ETH',
        rpcUrl: 'https://mainnet.infura.io/v3/your-api-key'
    },
    56: {
        name: 'Binance Smart Chain',
        symbol: 'BNB',
        rpcUrl: 'https://bsc-dataseed.binance.org/'
    },
    137: {
        name: 'Polygon Mainnet',
        symbol: 'MATIC',
        rpcUrl: 'https://polygon-rpc.com/'
    },
    42161: {
        name: 'Arbitrum One',
        symbol: 'ETH',
        rpcUrl: 'https://arb1.arbitrum.io/rpc'
    },
    10: {
        name: 'Optimism',
        symbol: 'ETH',
        rpcUrl: 'https://mainnet.optimism.io'
    }
};
