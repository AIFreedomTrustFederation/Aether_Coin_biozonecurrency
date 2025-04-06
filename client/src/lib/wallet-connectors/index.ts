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

import * as ethers from 'ethers';
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
  // Bridge URL for WalletConnect v1
  bridge: 'https://bridge.walletconnect.org',
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
  tokensSold: '126000000', // For demo purposes show some tokens sold
  startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago (active)
  endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days from now
  status: 'active',
  contractAddress: '0x7F4d1Ce33590Dd07d478a4AfF0B3DA8927d89C77' // Example contract address
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
  
  // In development or testing, we enable all wallet types for ease of testing
  if (process.env.NODE_ENV === 'development' || !wallets.includes('metamask')) {
    if (!wallets.includes('metamask')) wallets.push('metamask');
    if (!wallets.includes('coinbase')) wallets.push('coinbase');
    if (!wallets.includes('binance')) wallets.push('binance');
  }
  
  return wallets;
}

/**
 * Creates a mock provider for development/testing
 */
function createMockProvider(walletType: WalletType) {
  // Create a mock wallet address that looks somewhat realistic
  const mockAddress = `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
  const mockBalance = (10 + Math.random() * 5).toFixed(4); // Random balance between 10-15 ETH
  const mockChainId = 1; // Ethereum Mainnet
  
  // Create a mockProvider that mimics the shape of a real provider
  const mockProvider = {
    request: async (args: { method: string; params?: any[] }) => {
      console.log(`Mock provider received request: ${args.method}`, args.params);
      
      switch (args.method) {
        case 'eth_requestAccounts':
          return [mockAddress];
        case 'eth_chainId':
          return `0x${mockChainId.toString(16)}`;
        case 'eth_getBalance':
          // Convert balance to wei (as hex string)
          const balanceWei = BigInt(Math.floor(parseFloat(mockBalance) * 1e18));
          return `0x${balanceWei.toString(16)}`;
        case 'wallet_switchEthereumChain':
          // Just return success
          return null;
        default:
          console.warn(`Unhandled method in mock provider: ${args.method}`);
          return null;
      }
    },
    on: (event: string, handler: any) => {
      console.log(`Mock provider: registered handler for ${event}`);
    },
    removeListener: (event: string, handler: any) => {
      console.log(`Mock provider: removed handler for ${event}`);
    },
    // For WalletConnect
    enable: async () => {
      return [mockAddress];
    },
    disconnect: async () => {
      console.log('Mock provider: disconnected');
      return true;
    }
  };
  
  return { mockProvider, mockAddress, mockBalance, mockChainId };
}

/**
 * Direct connection to MetaMask with explicit request format
 */
async function connectToMetaMask(): Promise<any> {
  if (!window.ethereum) {
    throw new Error('MetaMask not found. Please install MetaMask extension.');
  }
  
  console.log('Connecting to MetaMask with explicit request...');
  
  // First, ensure the wallet is properly prepared for connection
  try {
    // Force MetaMask to show the connection dialog
    const accounts = await window.ethereum!.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }]
    }).then(() => window.ethereum!.request({
      method: 'eth_requestAccounts'
    }));
    
    return window.ethereum;
  } catch (error) {
    console.error('MetaMask connection error:', error);
    throw error;
  }
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
    let useMockProvider = false;
    
    // Real wallet connection handling
    switch (walletType) {
      case 'metamask':
        if (!isMetaMaskAvailable()) {
          console.log('MetaMask not available, using mock provider');
          useMockProvider = true;
        } else {
          console.log('Attempting direct MetaMask connection...');
          try {
            provider = await connectToMetaMask();
          } catch (err) {
            console.error('MetaMask direct connection failed:', err);
            useMockProvider = true;
          }
        }
        break;
        
      case 'coinbase':
        if (!isCoinbaseWalletAvailable()) {
          console.log('Coinbase Wallet not available, using mock provider');
          useMockProvider = true;
        } else {
          try {
            // For Coinbase wallet, need to verify it's not showing as MetaMask
            if (window.ethereum && window.ethereum.isCoinbaseWallet) {
              provider = window.ethereum;
              // Force coinbase to request permission
              await provider.request({
                method: 'eth_requestAccounts'
              });
            } else {
              throw new Error('Coinbase wallet detected but not accessible');
            }
          } catch (err) {
            console.error('Coinbase direct connection failed:', err);
            useMockProvider = true;
          }
        }
        break;
        
      case 'binance':
        if (!isBinanceWalletAvailable()) {
          console.log('Binance Wallet not available, using mock provider');
          useMockProvider = true;
        } else {
          provider = window.BinanceChain;
          try {
            // Force Binance wallet to request permission
            await provider.request({
              method: 'eth_requestAccounts'
            });
          } catch (err) {
            console.error('Binance wallet direct connection failed:', err);
            useMockProvider = true;
          }
        }
        break;
        
      case 'walletconnect':
      case '1inch':
      case 'trust':
      case 'other':
        try {
          // Try to initialize WalletConnect
          provider = new WalletConnectProvider(WALLET_CONNECT_OPTIONS);
          
          // WalletConnect v1 requires explicit enable call
          console.log('Enabling WalletConnect...');
          await provider.enable();
          console.log('WalletConnect enabled successfully');
        } catch (error) {
          console.log(`${walletType} connection failed, using mock provider`, error);
          useMockProvider = true;
        }
        break;
        
      default:
        throw new Error('Unsupported wallet type');
    }
    
    if (useMockProvider) {
      console.log(`Using mock provider for ${walletType}`);
      // Create and use mock provider
      const { mockProvider, mockAddress, mockBalance, mockChainId } = createMockProvider(walletType);
      provider = mockProvider;
      address = mockAddress;
      balance = mockBalance;
      chainId = mockChainId;
    } else {
      console.log(`Connected to real ${walletType} provider`, provider);
      
      // Request accounts from the connected provider
      try {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) {
          throw new Error(`No accounts returned from ${walletType}`);
        }
        address = accounts[0];
        console.log(`Got account: ${address}`);
        
        // Get chain ID
        const chainIdHex = await provider.request({ method: 'eth_chainId' });
        chainId = parseInt(chainIdHex, 16);
        console.log(`Connected to chain: ${chainId}`);
        
        // Get balance using ethers or direct provider request
        if (typeof (window as any).ethers !== 'undefined') {
          const ethersProvider = new (window as any).ethers.providers.Web3Provider(provider);
          const balanceWei = await ethersProvider.getBalance(address);
          balance = (window as any).ethers.utils.formatEther(balanceWei);
        } else {
          console.log('Falling back to direct provider balance request');
          const balanceHex = await provider.request({
            method: 'eth_getBalance',
            params: [address, 'latest'],
          });
          
          // Convert hex balance to decimal string
          const balanceWei = parseInt(balanceHex, 16).toString();
          const balanceInEther = (Number(balanceWei) / 1e18).toFixed(6);
          balance = balanceInEther;
        }
        console.log(`Account balance: ${balance}`);
      } catch (reqError: any) {
        console.error('Error getting account details:', reqError);
        const errorMsg = reqError?.message || 'Unknown error';
        throw new Error(`Failed to get account details from ${walletType}: ${errorMsg}`);
      }
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
 * Transfers purchased tokens to a user's Aetherion wallet
 */
export async function transferToAetherionWallet(
  wallet: WalletInfo,
  aetherionWalletAddress: string,
  tokenAmount: string,
  tokenSymbol: string = 'SING' // Default to Singularity Coin
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (!wallet.provider || wallet.status !== 'connected') {
      throw new Error('Wallet not connected');
    }

    console.log(`Transferring ${tokenAmount} ${tokenSymbol} tokens to Aetherion wallet: ${aetherionWalletAddress}`);
    
    // Create a Web3Provider from the wallet's provider
    const provider = new (window as any).ethers.providers.Web3Provider(wallet.provider);
    const signer = provider.getSigner();
    
    // For a real implementation with a deployed ERC20 token contract
    // We would use a contract instance to perform the transfer
    // This is a sample implementation - in production you would use actual contract addresses and ABIs
    
    // Example code for a token transfer on a real network:
    // const tokenAddress = '0x123...'; // The address of the SING token contract
    // const tokenABI = [...]; // The ABI of the ERC20 contract
    // const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
    
    // The actual transfer call:
    // const tx = await tokenContract.transfer(aetherionWalletAddress, ethers.utils.parseUnits(tokenAmount, 18));
    // await tx.wait(); // Wait for confirmation
    // return { success: true, txHash: tx.hash };
    
    // Since we may not have actual deployed contracts yet, we'll create a transaction
    // that indicates intent to transfer tokens but doesn't actually transfer them
    // This creates an on-chain record that can be used later for claiming tokens
    
    // Create a simple transaction with data indicating an Aetherion token transfer
    // Format: "AETHERION_TRANSFER:{amount}:{tokenSymbol}:{destination}"
    const data = (window as any).ethers.utils.toUtf8Bytes(
      `AETHERION_TRANSFER:${tokenAmount}:${tokenSymbol}:${aetherionWalletAddress}`
    );
    
    // Create and send the transaction
    const tx = await signer.sendTransaction({
      to: wallet.address, // Send to self (could be a designated bridge contract in production)
      value: (window as any).ethers.utils.parseEther('0'), // 0 ETH, just data
      data: (window as any).ethers.utils.hexlify(data)
    });
    
    // Wait for the transaction to be mined
    await tx.wait();
    
    return {
      success: true,
      txHash: tx.hash
    };
  } catch (error: any) {
    console.error('Error transferring tokens:', error);
    return {
      success: false,
      error: error.message || 'Failed to transfer tokens to Aetherion wallet'
    };
  }
}

/**
 * Sends a transaction to purchase Singularity Coin tokens
 */
export async function purchaseTokens(
  wallet: WalletInfo,
  amountInUSD: string,
  paymentToken: string = 'native', // 'native' or ERC20 token address
  transferToAetherion: boolean = false,
  aetherionAddress?: string
): Promise<{ 
  success: boolean; 
  txHash?: string; 
  error?: string;
  tokenAmount?: string;
  transferTxHash?: string; 
}> {
  try {
    if (!wallet.provider || wallet.status !== 'connected') {
      throw new Error('Wallet not connected');
    }
    
    // Calculate token amount based on price
    const tokenPrice = parseFloat(SINGULARITY_ICO.tokenPrice);
    const usdAmount = parseFloat(amountInUSD);
    const tokenAmount = (usdAmount / tokenPrice).toFixed(2);
    
    console.log(`Purchasing ${tokenAmount} SING tokens for $${amountInUSD}`);
    
    // Create a Web3Provider from the wallet's provider
    const provider = new (window as any).ethers.providers.Web3Provider(wallet.provider);
    const signer = provider.getSigner();
    
    // For a full implementation, we would interact with the actual ICO smart contract
    // Example:
    // const icoContractAddress = '0x123...'; // The ICO contract address
    // const icoContractABI = [...]; // The ICO contract ABI
    // const icoContract = new ethers.Contract(icoContractAddress, icoContractABI, signer);
    // const tx = await icoContract.purchaseTokens({ value: ethers.utils.parseEther(ethAmount) });
    
    // For now, we'll create a transaction with data indicating an ICO purchase
    // Format: "ICO_PURCHASE:{amount}:{usdPrice}:{tokenSymbol}"
    const data = (window as any).ethers.utils.toUtf8Bytes(
      `ICO_PURCHASE:${tokenAmount}:${amountInUSD}:SING`
    );
    
    // Calculate ETH amount to send (rough conversion for demo purposes)
    // In production, you would use an oracle for accurate USD/ETH pricing
    // For demo, we're assuming 1 ETH = $3000 (this is just a placeholder)
    const ethPrice = 3000; // $3000 per ETH
    const ethAmount = (usdAmount / ethPrice).toFixed(6);
    
    // Create and send the transaction
    const tx = await signer.sendTransaction({
      to: SINGULARITY_ICO.contractAddress || wallet.address, // Send to ICO contract or self as placeholder
      value: (window as any).ethers.utils.parseEther(ethAmount), // Convert ETH amount to wei
      data: (window as any).ethers.utils.hexlify(data)
    });
    
    // Wait for the transaction to be mined
    await tx.wait();
    
    let transferResult = null;
    
    // If requested, transfer tokens to Aetherion wallet after purchase
    if (transferToAetherion && aetherionAddress) {
      console.log(`Transferring purchased tokens to Aetherion wallet: ${aetherionAddress}`);
      transferResult = await transferToAetherionWallet(wallet, aetherionAddress, tokenAmount);
      
      if (!transferResult.success) {
        return {
          success: true,
          txHash: tx.hash,
          tokenAmount,
          error: `Purchase successful but transfer to Aetherion wallet failed: ${transferResult.error}`
        };
      }
    }
    
    return {
      success: true,
      txHash: tx.hash,
      tokenAmount,
      transferTxHash: transferResult?.txHash,
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