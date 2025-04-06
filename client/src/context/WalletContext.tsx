import React, { createContext, useContext, useEffect, useState } from 'react';
import walletConnectors, { 
  WalletInfo, 
  WalletType, 
  ICODetails,
  connectWallet,
  disconnectWallet,
  switchNetwork,
  getAvailableWallets,
  purchaseTokens,
  getICODetails
} from '@/lib/wallet-connectors';

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

const WalletContext = createContext<WalletContextProps>({
  wallet: null,
  availableWallets: [],
  icoDetails: getICODetails(),
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
  const [icoDetails, setIcoDetails] = useState(getICODetails());
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
      const walletInfo = await connectWallet(walletType);
      if (walletInfo.status === 'connected') {
        setWallet(walletInfo);
        // Save connected wallet type to local storage
        localStorage.setItem('connectedWallet', JSON.stringify({ type: walletType }));
        return walletInfo;
      } else {
        console.error('Failed to connect wallet:', walletInfo);
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
      await disconnectWallet(wallet);
      setWallet(null);
      localStorage.removeItem('connectedWallet');
    }
  };
  
  // Switch to a different blockchain network
  const switchChain = async (chainId: number) => {
    if (!wallet) return false;
    
    const success = await switchNetwork(wallet, chainId);
    if (success) {
      // Update wallet with new chain information
      setWallet({
        ...wallet,
        chainId,
        nativeToken: walletConnectors.SUPPORTED_NETWORKS[chainId]?.symbol || 'ETH'
      });
    }
    return success;
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
    
    const result = await purchaseTokens(
      wallet, 
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
    setIcoDetails(getICODetails());
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
          nativeToken: walletConnectors.SUPPORTED_NETWORKS[chainId]?.symbol || 'ETH'
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