/**
 * Wallet Connectors Module
 * 
 * This module provides integration with various cryptocurrency wallets including:
 * - MetaMask
 * - Coinbase Wallet
 * - Binance Wallet
 * - WalletConnect (for compatibility with many other wallets)
 * - 1inch Wallet
 * 
 * It supports interaction with different blockchains for the Singularity Coin ICO and token swaps.
 */

import { ethers } from 'ethers';
import type { ExternalProvider } from '@ethersproject/providers';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { InjectedConnector } from '@web3-react/injected-connector';

// Define window extensions for global wallet providers
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      request: (args: any) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
    BinanceChain?: {
      request: (args: any) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
    };
  }
}

// Configuration for WalletConnect
const WALLET_CONNECT_OPTIONS = {
  rpc: {
    1: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Public Infura ID
    56: 'https://bsc-dataseed.binance.org',
    137: 'https://polygon-rpc.com',
    43114: 'https://api.avax.network/ext/bc/C/rpc',
    42161: 'https://arb1.arbitrum.io/rpc',
    10: 'https://mainnet.optimism.io'
  },
  qrcodeModalOptions: {
    mobileLinks: ['metamask', 'trust', 'rainbow', 'argent', 'imtoken', 'pillar']
  }
};

// Injected connector for Web3-React
export const injectedConnector = new InjectedConnector({
  supportedChainIds: [1, 56, 137, 43114, 42161, 10]
});

// Wallet connection states
export type WalletConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

// Supported wallet types
export type WalletType = 
  'metamask' | 
  'coinbase' | 
  'binance' | 
  'walletconnect' | 
  '1inch' | 
  'trust' | 
  'other';

// Wallet information
export interface WalletInfo {
  type: WalletType;
  name: string;
  address: string;
  chainId: number;
  balance: string;
  nativeToken: string;
  status: WalletConnectionStatus;
  isActive: boolean;
  provider?: any;
}

// Supported networks
export interface NetworkInfo {
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  blockExplorerUrl: string;
  rpcUrl: string;
}

// Supported networks with their details
export const SUPPORTED_NETWORKS: Record<number, NetworkInfo> = {
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    symbol: 'ETH',
    decimals: 18,
    blockExplorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://mainnet.infura.io/v3/${INFURA_KEY}'
  },
  56: {
    chainId: 56,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    decimals: 18,
    blockExplorerUrl: 'https://bscscan.com',
    rpcUrl: 'https://bsc-dataseed.binance.org'
  },
  137: {
    chainId: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    decimals: 18,
    blockExplorerUrl: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com'
  },
  43114: {
    chainId: 43114,
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
    blockExplorerUrl: 'https://snowtrace.io',
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc'
  },
  42161: {
    chainId: 42161,
    name: 'Arbitrum',
    symbol: 'ETH',
    decimals: 18,
    blockExplorerUrl: 'https://arbiscan.io',
    rpcUrl: 'https://arb1.arbitrum.io/rpc'
  },
  10: {
    chainId: 10,
    name: 'Optimism',
    symbol: 'ETH',
    decimals: 18,
    blockExplorerUrl: 'https://optimistic.etherscan.io',
    rpcUrl: 'https://mainnet.optimism.io'
  }
};

// ICO details
export interface ICODetails {
  name: string;
  symbol: string;
  tokenPrice: string; // in USD
  hardCap: string; // in USD
  softCap: string; // in USD
  minContribution: string; // in USD
  maxContribution: string; // in USD
  totalTokens: string;
  tokensSold: string;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed' | 'failed';
  contractAddress?: string;
}

// Singularity Coin ICO configuration
export const SINGULARITY_ICO: ICODetails = {
  name: 'Singularity Coin',
  symbol: 'SING',
  tokenPrice: '0.000646', // Price per token in USD
  hardCap: '646000', // $646,000
  softCap: '130000', // $130,000
  minContribution: '100', // $100
  maxContribution: '25000', // $25,000
  totalTokens: '1000000000', // 1 billion tokens
  tokensSold: '0', // initially 0
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
  endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000), // 1 month after start
  status: 'upcoming'
};

/**
 * Checks if MetaMask is available in the browser
 */
export function isMetaMaskAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.ethereum && !!window.ethereum.isMetaMask;
}

/**
 * Checks if Coinbase Wallet is available in the browser
 */
export function isCoinbaseWalletAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.ethereum && !!window.ethereum.isCoinbaseWallet;
}

/**
 * Checks if Binance Wallet is available in the browser
 */
export function isBinanceWalletAvailable(): boolean {
  return typeof window !== 'undefined' && window.BinanceChain !== undefined;
}

/**
 * Gets the available wallet providers in the browser
 */
export function getAvailableWallets(): WalletType[] {
  const wallets: WalletType[] = [];
  
  if (isMetaMaskAvailable()) {
    wallets.push('metamask');
  }
  
  if (isCoinbaseWalletAvailable()) {
    wallets.push('coinbase');
  }
  
  if (isBinanceWalletAvailable()) {
    wallets.push('binance');
  }
  
  // Always include WalletConnect as it works with many wallets
  wallets.push('walletconnect');
  
  // For simplicity, we'll assume these are potentially available through deep linking
  wallets.push('1inch');
  wallets.push('trust');
  
  return wallets;
}

/**
 * Connects to a wallet and returns the wallet info
 */
export async function connectWallet(walletType: WalletType): Promise<WalletInfo> {
  let provider: any = null;
  let address = '';
  let chainId = 1; // Default to Ethereum Mainnet
  let balance = '0';
  
  try {
    switch (walletType) {
      case 'metamask':
        if (!isMetaMaskAvailable()) {
          throw new Error('MetaMask is not installed');
        }
        provider = window.ethereum;
        break;
        
      case 'coinbase':
        if (!isCoinbaseWalletAvailable()) {
          throw new Error('Coinbase Wallet is not installed');
        }
        provider = window.ethereum;
        break;
        
      case 'binance':
        if (!isBinanceWalletAvailable()) {
          throw new Error('Binance Wallet is not installed');
        }
        provider = window.BinanceChain;
        break;
        
      case 'walletconnect':
        // Initialize WalletConnect provider
        provider = new WalletConnectProvider(WALLET_CONNECT_OPTIONS);
        // Enable session (triggers QR Code modal)
        await provider.enable();
        break;
        
      case '1inch':
        // Since 1inch wallet integration requires deep linking or their SDK
        // We'll use WalletConnect as a fallback, which supports 1inch wallet too
        provider = new WalletConnectProvider(WALLET_CONNECT_OPTIONS);
        await provider.enable();
        break;
        
      case 'trust':
        // For Trust Wallet, we also use WalletConnect as it's widely supported
        provider = new WalletConnectProvider(WALLET_CONNECT_OPTIONS);
        await provider.enable();
        break;
        
      case 'other':
        // Generic WalletConnect fallback for other wallets
        provider = new WalletConnectProvider(WALLET_CONNECT_OPTIONS);
        await provider.enable();
        
      default:
        throw new Error('Unsupported wallet type');
    }
    
    // Request accounts
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    address = accounts[0];
    
    // Get chain ID
    const chainIdHex = await provider.request({ method: 'eth_chainId' });
    chainId = parseInt(chainIdHex as string, 16);
    
    // Get balance
    // Note: We need to handle ethers v5/v6 differences
    let ethersProvider;
    let balanceWei;
    
    // For ethers v6
    if (typeof ethers.BrowserProvider === 'function') {
      ethersProvider = new ethers.BrowserProvider(provider as ExternalProvider);
      balanceWei = await ethersProvider.getBalance(address);
      balance = ethers.formatEther(balanceWei);
    } 
    // For ethers v5
    else if (ethers.providers && ethers.utils) {
      ethersProvider = new ethers.providers.Web3Provider(provider as ExternalProvider);
      balanceWei = await ethersProvider.getBalance(address);
      balance = ethers.utils.formatEther(balanceWei);
    }
    else {
      console.warn('Ethers version not fully supported, using default balance');
      balance = '0';
    }
    
    return {
      type: walletType,
      name: getWalletName(walletType),
      address,
      chainId,
      balance,
      nativeToken: SUPPORTED_NETWORKS[chainId]?.symbol || 'ETH',
      status: 'connected',
      isActive: true,
      provider
    };
  } catch (error) {
    console.error('Wallet connection error:', error);
    return {
      type: walletType,
      name: getWalletName(walletType),
      address: '',
      chainId: 1,
      balance: '0',
      nativeToken: 'ETH',
      status: 'error',
      isActive: false,
      provider: null
    };
  }
}

/**
 * Disconnects from a wallet
 */
export async function disconnectWallet(wallet: WalletInfo): Promise<void> {
  if (!wallet.provider) return;
  
  try {
    if (wallet.type === 'walletconnect' || wallet.type === '1inch' || wallet.type === 'trust') {
      // WalletConnect has a specific disconnect method
      const provider = wallet.provider as WalletConnectProvider;
      if (provider && typeof provider.disconnect === 'function') {
        await provider.disconnect();
      }
    }
    
    // For other wallet types, simply clear the state
    // (most injected wallets don't have a disconnect method)
    return Promise.resolve();
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
  }
}

/**
 * Switches to a different network
 */
export async function switchNetwork(wallet: WalletInfo, chainId: number): Promise<boolean> {
  if (!wallet.provider) return false;
  
  try {
    const hexChainId = `0x${chainId.toString(16)}`;
    
    await wallet.provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
    
    return true;
  } catch (error: any) {
    // If the chain hasn't been added to the wallet, we can add it
    if (error.code === 4902) {
      try {
        const network = SUPPORTED_NETWORKS[chainId];
        if (!network) throw new Error(`Network with chainId ${chainId} not supported`);
        
        await wallet.provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${chainId.toString(16)}`,
              chainName: network.name,
              nativeCurrency: {
                name: network.name,
                symbol: network.symbol,
                decimals: network.decimals,
              },
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: [network.blockExplorerUrl],
            },
          ],
        });
        
        // Try switching again
        return await switchNetwork(wallet, chainId);
      } catch (addError) {
        console.error('Error adding network:', addError);
        return false;
      }
    }
    
    console.error('Error switching network:', error);
    return false;
  }
}

/**
 * Sends a transaction to purchase Singularity Coin tokens
 */
export async function purchaseTokens(
  wallet: WalletInfo,
  amountInUSD: string,
  paymentToken: string = 'native' // 'native' or ERC20 token address
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (!wallet.provider || wallet.status !== 'connected') {
      throw new Error('Wallet not connected');
    }
    
    // In a real implementation, this would interact with the ICO smart contract
    // For now, we'll return a mock transaction hash
    const mockTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    // Calculate token amount based on price
    const tokenPrice = parseFloat(SINGULARITY_ICO.tokenPrice);
    const usdAmount = parseFloat(amountInUSD);
    const tokenAmount = (usdAmount / tokenPrice).toFixed(2);
    
    console.log(`Purchasing ${tokenAmount} SING tokens for $${amountInUSD}`);
    
    return {
      success: true,
      txHash: mockTxHash
    };
  } catch (error: any) {
    console.error('Error purchasing tokens:', error);
    return {
      success: false,
      error: error.message || 'Failed to purchase tokens'
    };
  }
}

/**
 * Gets detailed ICO information including progress
 */
export function getICODetails(): ICODetails & { 
  progress: number; 
  remainingTokens: string;
  raisedAmount: string;
  formattedPrice: string;
} {
  const soldTokens = parseFloat(SINGULARITY_ICO.tokensSold);
  const totalTokens = parseFloat(SINGULARITY_ICO.totalTokens);
  const progress = (soldTokens / totalTokens) * 100;
  const remainingTokens = (totalTokens - soldTokens).toString();
  const raisedAmount = (soldTokens * parseFloat(SINGULARITY_ICO.tokenPrice)).toFixed(2);
  
  return {
    ...SINGULARITY_ICO,
    progress,
    remainingTokens,
    raisedAmount,
    formattedPrice: `$${SINGULARITY_ICO.tokenPrice}`
  };
}

/**
 * Helper to get wallet display name
 */
function getWalletName(type: WalletType): string {
  switch (type) {
    case 'metamask': return 'MetaMask';
    case 'coinbase': return 'Coinbase Wallet';
    case 'binance': return 'Binance Wallet';
    case 'walletconnect': return 'WalletConnect';
    case '1inch': return '1inch Wallet';
    case 'trust': return 'Trust Wallet';
    default: return 'External Wallet';
  }
}

export default {
  connectWallet,
  disconnectWallet,
  switchNetwork,
  getAvailableWallets,
  isMetaMaskAvailable,
  isCoinbaseWalletAvailable,
  isBinanceWalletAvailable,
  purchaseTokens,
  getICODetails,
  SUPPORTED_NETWORKS,
  SINGULARITY_ICO
};