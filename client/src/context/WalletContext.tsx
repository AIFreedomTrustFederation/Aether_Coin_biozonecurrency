import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  WalletType, 
  ICODetails,
  connectWallet,
  disconnectWallet,
  switchNetwork,
  getAvailableWallets,
  purchaseTokens,
  getICODetails,
  SUPPORTED_NETWORKS
} from '@/lib/wallet-connectors';

// Define WalletInfo interface
export interface WalletInfo {
  status: 'connected' | 'disconnected' | 'error';
  address: string;
  balance: string;
  chainId: number;
  nativeToken: string;
  provider: any;
  error?: string;
}

// Type for error response from wallet connection
export interface WalletConnectError {
  status: 'error';
  error: string;
}

interface WalletContextProps {
  wallet: WalletInfo | null;
  availableWallets: WalletType[];
  icoDetails: ICODetails & { 
    progress: number; 
    remainingTokens: string;
    raisedAmount: string;
    formattedPrice: string;
  };
  isConnecting: boolean;
  connect: (walletType: WalletType) => Promise<WalletInfo | WalletConnectError | undefined>;
  disconnect: () => Promise<void>;
  switchChain: (chainId: number) => Promise<boolean>;
  purchase: (
    amountInUSD: string, 
    paymentToken?: string, 
    transferToAetherion?: boolean,
    aetherionAddress?: string
  ) => Promise<{ 
    success: boolean; 
    txHash?: string; 
    error?: string;
    tokenAmount?: string;
    transferTxHash?: string;
  }>;
  refreshBalance: () => Promise<void>;
  refreshICODetails: () => void;
}

// Create a helper function to get formatted ICO details
const getFormattedICODetails = () => {
  const details = getICODetails();
  const tokensSold = parseFloat(details.tokensSold);
  const totalSupply = parseFloat(details.totalSupply);
  const hardCap = parseFloat(details.hardCap);
  
  // Calculate progress as percentage
  const progress = Math.min(100, (tokensSold / totalSupply) * 100);
  
  // Calculate remaining tokens
  const remainingTokens = (totalSupply - tokensSold).toString();
  
  // Calculate raised amount based on tokens sold and price
  const raisedAmount = (tokensSold * parseFloat(details.tokenPrice)).toString();
  
  // Format price for display
  const formattedPrice = `$${parseFloat(details.tokenPrice).toFixed(6)}`;
  
  return {
    ...details,
    progress,
    remainingTokens,
    raisedAmount,
    formattedPrice
  };
};

const WalletContext = createContext<WalletContextProps>({
  wallet: null,
  availableWallets: [],
  icoDetails: getFormattedICODetails(),
  isConnecting: false,
  connect: async () => undefined,
  disconnect: async () => {},
  switchChain: async () => false,
  purchase: async () => ({ success: false }),
  refreshBalance: async () => {},
  refreshICODetails: () => {},
});

export function useWallet() {
  return useContext(WalletContext);
}

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletType[]>([]);
  // Format ICO details with additional properties
  const formatICODetails = (details: ICODetails) => {
    const tokensSold = parseFloat(details.tokensSold);
    const totalSupply = parseFloat(details.totalSupply);
    const hardCap = parseFloat(details.hardCap);
    
    // Calculate progress as percentage
    const progress = Math.min(100, (tokensSold / totalSupply) * 100);
    
    // Calculate remaining tokens
    const remainingTokens = (totalSupply - tokensSold).toString();
    
    // Calculate raised amount based on tokens sold and price
    const raisedAmount = (tokensSold * parseFloat(details.tokenPrice)).toString();
    
    // Format price for display
    const formattedPrice = `$${parseFloat(details.tokenPrice).toFixed(6)}`;
    
    return {
      ...details,
      progress,
      remainingTokens,
      raisedAmount,
      formattedPrice
    };
  };
  
  const [icoDetails, setIcoDetails] = useState(formatICODetails(getICODetails()));
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Detect available wallets on mount
  useEffect(() => {
    setAvailableWallets(getAvailableWallets());
    
    // Check for any previously connected wallet in local storage
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet) {
      try {
        const walletData = JSON.parse(savedWallet);
        if (walletData && walletData.type) {
          connect(walletData.type as WalletType).catch(console.error);
        }
      } catch (error) {
        console.error('Failed to restore wallet connection:', error);
        localStorage.removeItem('connectedWallet');
      }
    }
  }, []);
  
  // Connect to a wallet
  const connect = async (walletType: WalletType) => {
    setIsConnecting(true);
    try {
      const response = await connectWallet(walletType);
      
      if (response.provider && response.accounts.length > 0) {
        // Convert the connection response to our WalletInfo format
        const provider = new (window as any).ethers.providers.Web3Provider(response.provider);
        const balanceWei = await provider.getBalance(response.accounts[0]);
        const balance = (window as any).ethers.utils.formatEther(balanceWei);
        const network = await provider.getNetwork();
        
        const walletInfo: WalletInfo = {
          status: 'connected',
          address: response.accounts[0],
          balance,
          chainId: network.chainId,
          nativeToken: SUPPORTED_NETWORKS[network.chainId]?.symbol || 'ETH',
          provider: response.walletProvider
        };
        
        setWallet(walletInfo);
        // Save connected wallet type to local storage
        localStorage.setItem('connectedWallet', JSON.stringify({ type: walletType }));
        return walletInfo;
      } else {
        console.error('Failed to connect wallet:', response);
        const result: WalletConnectError = {
          status: 'error',
          error: 'Failed to connect wallet'
        };
        return result;
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      const result: WalletConnectError = {
        status: 'error',
        error: error?.message || 'Unknown error connecting wallet'
      };
      return result;
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Disconnect from wallet
  const disconnect = async () => {
    if (wallet) {
      const savedWallet = localStorage.getItem('connectedWallet');
      if (savedWallet) {
        try {
          const walletData = JSON.parse(savedWallet);
          if (walletData && walletData.type) {
            await disconnectWallet(walletData.type);
          }
        } catch (error) {
          console.error('Failed to disconnect wallet:', error);
        }
      }
      setWallet(null);
      localStorage.removeItem('connectedWallet');
    }
  };
  
  // Switch to a different blockchain network
  const switchChain = async (chainId: number) => {
    if (!wallet) return false;
    
    // Get the wallet type from local storage
    const savedWallet = localStorage.getItem('connectedWallet');
    if (!savedWallet) return false;
    
    try {
      const walletData = JSON.parse(savedWallet);
      const walletType = walletData.type as WalletType;
      
      const success = await switchNetwork(walletType, chainId);
      if (success) {
        // Update wallet with new chain information
        setWallet({
          ...wallet,
          chainId,
          nativeToken: SUPPORTED_NETWORKS[chainId]?.symbol || 'ETH'
        });
      }
      return success;
    } catch (error) {
      console.error('Failed to switch network:', error);
      return false;
    }
  };
  
  // Purchase tokens in the ICO
  const purchase = async (
    amountInUSD: string, 
    paymentToken: string = 'native',
    transferToAetherion: boolean = false,
    aetherionAddress?: string
  ) => {
    if (!wallet) {
      return { 
        success: false, 
        error: 'No wallet connected' 
      };
    }
    
    // Get the wallet type from local storage
    const savedWallet = localStorage.getItem('connectedWallet');
    if (!savedWallet) {
      return { 
        success: false, 
        error: 'Wallet connection information not found' 
      };
    }
    
    try {
      const walletData = JSON.parse(savedWallet);
      const walletType = walletData.type as WalletType;
      
      const result = await purchaseTokens(
        walletType, 
        amountInUSD, 
        paymentToken,
        transferToAetherion,
        aetherionAddress
      );
      
      if (result.success) {
        // Update ICO details after successful purchase
        refreshICODetails();
        // Refresh wallet balance
        await refreshBalance();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to process purchase:', error);
      return {
        success: false,
        error: 'Error during purchase transaction'
      };
    }
  };
  
  // Refresh wallet balance
  const refreshBalance = async () => {
    if (!wallet || !wallet.provider) return;
    
    try {
      const provider = new (window as any).ethers.providers.Web3Provider(wallet.provider);
      const balanceWei = await provider.getBalance(wallet.address);
      const balance = (window as any).ethers.utils.formatEther(balanceWei);
      
      setWallet({
        ...wallet,
        balance
      });
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };
  
  // Refresh ICO details
  const refreshICODetails = () => {
    setIcoDetails(formatICODetails(getICODetails()));
  };
  
  // Setup wallet event listeners
  useEffect(() => {
    if (!wallet?.provider) return;
    
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnect();
      } else if (wallet && accounts[0] !== wallet.address) {
        // User switched accounts
        setWallet({
          ...wallet,
          address: accounts[0]
        });
        refreshBalance();
      }
    };
    
    const handleChainChanged = (chainIdHex: string) => {
      // Chain ID comes as a hex string
      const chainId = parseInt(chainIdHex, 16);
      if (wallet && chainId !== wallet.chainId) {
        setWallet({
          ...wallet,
          chainId,
          nativeToken: SUPPORTED_NETWORKS[chainId]?.symbol || 'ETH'
        });
        refreshBalance();
      }
    };
    
    // Add event listeners
    try {
      wallet.provider.on('accountsChanged', handleAccountsChanged);
      wallet.provider.on('chainChanged', handleChainChanged);
    } catch (error) {
      console.error('Failed to add event listeners:', error);
    }
    
    // Remove event listeners on cleanup
    return () => {
      try {
        if (wallet?.provider) {
          wallet.provider.removeListener('accountsChanged', handleAccountsChanged);
          wallet.provider.removeListener('chainChanged', handleChainChanged);
        }
      } catch (error) {
        console.error('Failed to remove event listeners:', error);
      }
    };
  }, [wallet?.provider]);
  
  return (
    <WalletContext.Provider value={{
      wallet,
      availableWallets,
      icoDetails,
      isConnecting,
      connect,
      disconnect,
      switchChain,
      purchase,
      refreshBalance,
      refreshICODetails
    }}>
      {children}
    </WalletContext.Provider>
  );
};