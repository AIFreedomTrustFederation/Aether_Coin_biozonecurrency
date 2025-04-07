import { ethers } from 'ethers';

// Define supported wallet types
export type WalletType = 
  | 'MetaMask'
  | 'Coinbase'
  | 'WalletConnect'
  | 'Binance'
  | 'Trust'
  | '1inch';

// Detect available wallets in the browser environment
export function getAvailableWallets(): WalletType[] {
  const available: WalletType[] = [];

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
  if (typeof window !== 'undefined' && window.ethereum?.isTrust) {
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
  if (!available.includes('MetaMask')) available.push('MetaMask');
  if (!available.includes('Coinbase')) available.push('Coinbase');
  if (!available.includes('Binance')) available.push('Binance');
  if (!available.includes('Trust')) available.push('Trust');
  if (!available.includes('WalletConnect')) available.push('WalletConnect');
  if (!available.includes('1inch')) available.push('1inch');

  return available;
}

// Connection response interface
interface WalletConnectionResponse {
  provider: ethers.BrowserProvider | null;
  accounts: string[];
  walletProvider: any; // The raw wallet provider for event handling
}

// Connect to a wallet by type
export async function connectWallet(walletType: WalletType): Promise<WalletConnectionResponse> {
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
async function connectMetaMaskWallet(): Promise<WalletConnectionResponse> {
  if (!window.ethereum?.isMetaMask) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    return {
      provider,
      accounts,
      walletProvider: window.ethereum
    };
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
}

// Connect to Coinbase Wallet
async function connectCoinbaseWallet(): Promise<WalletConnectionResponse> {
  if (!window.ethereum?.isCoinbaseWallet) {
    throw new Error('Coinbase Wallet is not installed');
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    return {
      provider,
      accounts,
      walletProvider: window.ethereum
    };
  } catch (error) {
    console.error('Error connecting to Coinbase Wallet:', error);
    throw error;
  }
}

// Connect with WalletConnect
async function connectWalletConnect(): Promise<WalletConnectionResponse> {
  try {
    // Check if we're already connected through another provider that supports WalletConnect
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        return {
          provider,
          accounts,
          walletProvider: window.ethereum
        };
      } catch (error) {
        console.error('Error connecting with ethereum provider:', error);
      }
    }
    
    // If we get here, either no ethereum provider or connection failed
    throw new Error('WalletConnect requires the WalletConnect library. Please install it first.');
  } catch (error) {
    console.error('Error connecting with WalletConnect:', error);
    throw error;
  }
}

// Connect to Binance Chain Wallet
async function connectBinanceWallet(): Promise<WalletConnectionResponse> {
  if (!window.BinanceChain) {
    throw new Error('Binance Chain Wallet is not installed');
  }

  try {
    const accounts = await window.BinanceChain.request({ method: 'eth_requestAccounts' });
    // BinanceChain provides its own provider
    const provider = new ethers.BrowserProvider(window.BinanceChain);
    
    return {
      provider,
      accounts,
      walletProvider: window.BinanceChain
    };
  } catch (error) {
    console.error('Error connecting to Binance Chain Wallet:', error);
    throw error;
  }
}

// Connect to Trust Wallet
async function connectTrustWallet(): Promise<WalletConnectionResponse> {
  if (!window.ethereum?.isTrust) {
    throw new Error('Trust Wallet is not installed');
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    return {
      provider,
      accounts,
      walletProvider: window.ethereum
    };
  } catch (error) {
    console.error('Error connecting to Trust Wallet:', error);
    throw error;
  }
}

// Connect to 1inch Wallet
async function connect1inchWallet(): Promise<WalletConnectionResponse> {
  // 1inch wallet typically injects into window.ethereum
  if (!window.ethereum) {
    throw new Error('No Web3 provider detected. Please install 1inch Wallet');
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    return {
      provider,
      accounts,
      walletProvider: window.ethereum
    };
  } catch (error) {
    console.error('Error connecting to 1inch Wallet:', error);
    throw error;
  }
}

// Disconnect from a wallet
export async function disconnectWallet(walletType: WalletType): Promise<boolean> {
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
  } catch (error) {
    console.error(`Error disconnecting from ${walletType}:`, error);
    return false;
  }
}

// ICO Details interface
export interface ICODetails {
  symbol: string;
  tokenPrice: string;
  hardCap: string;
  softCap: string;
  minContribution: string;
  maxContribution: string;
  tokensSold: string;
  totalSupply: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed';
}

// Get ICO details
export function getICODetails(): ICODetails {
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
export async function purchaseTokens(
  walletType: WalletType,
  amountInUSD: string,
  paymentToken: string = 'native',
  transferToAetherion: boolean = false,
  aetherionAddress: string = ''
): Promise<{ 
  success: boolean; 
  txHash?: string; 
  error?: string;
  tokenAmount?: string;
  transferTxHash?: string;
}> {
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
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to purchase tokens'
    };
  }
}

// Network switching
export async function switchNetwork(
  walletType: WalletType,
  chainId: number
): Promise<boolean> {
  // Implementation would depend on the wallet type
  return true;
}

// Define supported networks
export const SUPPORTED_NETWORKS: {[chainId: number]: {name: string, symbol: string, rpcUrl: string}} = {
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

// Extend window interface to include wallet providers
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isTrust?: boolean;
      request: (args: any) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
      [key: string]: any;
    };
    BinanceChain?: {
      request: (args: any) => Promise<any>;
      on?: (event: string, handler: (...args: any[]) => void) => void;
      removeListener?: (event: string, handler: (...args: any[]) => void) => void;
      [key: string]: any;
    };
  }
}