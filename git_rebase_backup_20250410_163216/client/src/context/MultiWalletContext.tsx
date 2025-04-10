import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  WalletType, 
  connectWallet,
  disconnectWallet,
  switchNetwork,
  getAvailableWallets,
  SUPPORTED_NETWORKS
} from '@/lib/wallet-connectors';
import { useToast } from '@/hooks/use-toast';
import * as ethers from 'ethers';

// Define WalletInfo interface
export interface WalletInfo {
  id: string; // Unique ID for this connection
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  walletType: WalletType;
  name: string;  // Display name for the wallet
  address: string;
  balance: string;
  chainId: number;
  nativeToken: string;
  provider: any;
  error?: string;
  isPrimary?: boolean; // Is this the primary wallet
}

// Type for error response from wallet connection
export interface WalletConnectError {
  status: 'error';
  error: string;
}

interface MultiWalletContextProps {
  wallets: WalletInfo[];
  primaryWallet: WalletInfo | null;
  setPrimaryWallet: (walletId: string) => void;
  availableWallets: WalletType[];
  isConnecting: boolean;
  connect: (walletType: WalletType) => Promise<WalletInfo | WalletConnectError | undefined>;
  disconnect: (walletId: string) => Promise<void>;
  disconnectAll: () => Promise<void>;
  switchChain: (walletId: string, chainId: number) => Promise<boolean>;
  refreshBalance: (walletId: string) => Promise<void>;
  refreshAllBalances: () => Promise<void>;
}

// Create a helper function to format wallet name
const getWalletName = (type: WalletType): string => {
  switch (type) {
    case 'MetaMask': return 'MetaMask';
    case 'Coinbase': return 'Coinbase Wallet';
    case 'Binance': return 'Binance Wallet';
    case 'WalletConnect': return 'WalletConnect';
    case '1inch': return '1inch Wallet';
    case 'Trust': return 'Trust Wallet';
    default: return 'External Wallet';
  }
};

const MultiWalletContext = createContext<MultiWalletContextProps>({
  wallets: [],
  primaryWallet: null,
  setPrimaryWallet: () => {},
  availableWallets: [],
  isConnecting: false,
  connect: async () => undefined,
  disconnect: async () => {},
  disconnectAll: async () => {},
  switchChain: async () => false,
  refreshBalance: async () => {},
  refreshAllBalances: async () => {}
});

export function useMultiWallet() {
  return useContext(MultiWalletContext);
}

export const MultiWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [primaryWalletId, setPrimaryWalletId] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletType[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Get the primary wallet
  const primaryWallet = wallets.find(wallet => wallet.id === primaryWalletId) || null;
  
  // Set a wallet as primary
  const setPrimaryWallet = useCallback((walletId: string) => {
    const walletExists = wallets.some(w => w.id === walletId);
    if (!walletExists) {
      console.error(`Cannot set primary wallet: Wallet with ID ${walletId} does not exist`);
      return;
    }
    
    // Update primaryWalletId
    setPrimaryWalletId(walletId);
    
    // Update localStorage
    try {
      localStorage.setItem('aetherion-primary-wallet', walletId);
      
      toast({
        title: "Primary Wallet Updated",
        description: "Your primary wallet has been updated",
      });
    } catch (error) {
      console.error('Failed to save primary wallet to localStorage:', error);
    }
  }, [wallets, toast]);
  
  // Detect available wallets on mount
  useEffect(() => {
    setAvailableWallets(getAvailableWallets());
    
    // Check for any previously connected wallets in local storage
    const savedWallets = localStorage.getItem('connectedWallets');
    const savedPrimaryWallet = localStorage.getItem('aetherion-primary-wallet');
    
    if (savedWallets) {
      try {
        // Parse saved wallet data but don't auto-connect
        const walletData = JSON.parse(savedWallets);
        console.log('Previous wallet connections found:', walletData.length);
        
        // If saved primary wallet exists, set it
        if (savedPrimaryWallet) {
          setPrimaryWalletId(savedPrimaryWallet);
        }
        
        // Note: We don't auto-connect here, user must explicitly connect
      } catch (error) {
        console.error('Failed to parse wallet data:', error);
        localStorage.removeItem('connectedWallets');
        localStorage.removeItem('aetherion-primary-wallet');
      }
    }
  }, []);

  // Connect to a wallet
  const connect = async (walletType: WalletType) => {
    setIsConnecting(true);
    try {
      console.log(`Attempting to connect wallet type: ${walletType}`);
      const response = await connectWallet(walletType);
      
      // Special case for WalletConnect with URI for QR code on mobile
      if (walletType === 'WalletConnect' && response.walletProvider?.isWalletConnect && response.walletProvider?.uri) {
        console.log('WalletConnect session initiated with URI');
        
        // Create special mobile wallet response for QR display
        const walletId = `wc-${Date.now()}`;
        const mobileWalletInfo: WalletInfo = {
          id: walletId,
          status: 'pending',
          walletType,
          name: getWalletName(walletType),
          address: 'Connecting via WalletConnect...',
          balance: '0',  
          chainId: 1,
          nativeToken: 'ETH',
          provider: response.walletProvider
        };
        
        // Add this wallet to our list
        setWallets(prevWallets => [...prevWallets, mobileWalletInfo]);
        
        // If no primary wallet is set, set this one as primary
        if (!primaryWalletId) {
          setPrimaryWalletId(walletId);
          localStorage.setItem('aetherion-primary-wallet', walletId);
        }
        
        // Save connected wallet to localStorage
        saveWalletsToStorage([...wallets, mobileWalletInfo]);
        
        return mobileWalletInfo;
      }
      
      // Standard wallet connection flow
      if (response.provider && response.accounts && response.accounts.length > 0) {
        let walletInfo: WalletInfo;
        const walletId = `${walletType.toLowerCase()}-${Date.now()}`;
        
        try {
          console.log('Provider and accounts found, getting wallet details');
          // Use BrowserProvider from ethers v6
          const provider = response.provider;
          const balanceWei = await provider.getBalance(response.accounts[0]);
          const balance = parseFloat(balanceWei.toString()) / 1e18; // Manual conversion to ether
          const network = await provider.getNetwork();
          const chainId = network.chainId;
          
          walletInfo = {
            id: walletId,
            status: 'connected',
            walletType,
            name: getWalletName(walletType),
            address: response.accounts[0],
            balance: balance.toString(),
            chainId: Number(chainId),
            nativeToken: SUPPORTED_NETWORKS[Number(chainId)]?.symbol || 'ETH',
            provider: response.walletProvider
          };
        } catch (err) {
          console.error("Error getting wallet info:", err);
          
          // Fallback - create a basic wallet info object
          walletInfo = {
            id: walletId,
            status: 'connected',
            walletType,
            name: getWalletName(walletType),
            address: response.accounts[0],
            balance: '0',  // We'll refresh this later
            chainId: 1,    // Default to Ethereum mainnet
            nativeToken: 'ETH',
            provider: response.walletProvider
          };
        }
        
        console.log('Wallet connected successfully:', walletInfo);
        
        // Check if wallet with same address already exists
        const existingWalletIndex = wallets.findIndex(w => 
          w.address.toLowerCase() === walletInfo.address.toLowerCase() && 
          w.walletType === walletType
        );
        
        let updatedWallets = [...wallets];
        
        if (existingWalletIndex >= 0) {
          // Update existing wallet
          updatedWallets[existingWalletIndex] = {
            ...walletInfo,
            id: updatedWallets[existingWalletIndex].id // Keep the original ID
          };
        } else {
          // Add new wallet
          updatedWallets = [...wallets, walletInfo];
        }
        
        setWallets(updatedWallets);
        
        // If no primary wallet is set, set this one as primary
        if (!primaryWalletId) {
          setPrimaryWalletId(walletId);
          localStorage.setItem('aetherion-primary-wallet', walletId);
        }
        
        // Save connected wallets to localStorage
        saveWalletsToStorage(updatedWallets);
        
        // Set up event listeners for the wallet
        setWalletEventListeners(walletInfo);
        
        return walletInfo;
      } else {
        console.error('Failed to connect wallet:', response);
        
        // For providers without account info (may need QR code scanning)
        if (response.provider && (!response.accounts || response.accounts.length === 0)) {
          console.log('Provider found but no accounts - may need manual connection steps');
          
          // Return a special "pending" status
          const walletId = `${walletType.toLowerCase()}-${Date.now()}`;
          const pendingWalletInfo: WalletInfo = {
            id: walletId,
            status: 'pending',
            walletType,
            name: getWalletName(walletType),
            address: 'Wallet Pending Connection',
            balance: '0',
            chainId: 1,
            nativeToken: 'ETH',
            provider: response.walletProvider
          };
          
          // Add this wallet to our list
          setWallets(prevWallets => [...prevWallets, pendingWalletInfo]);
          
          // If no primary wallet is set, set this one as primary
          if (!primaryWalletId) {
            setPrimaryWalletId(walletId);
            localStorage.setItem('aetherion-primary-wallet', walletId);
          }
          
          // Save connected wallet to localStorage
          saveWalletsToStorage([...wallets, pendingWalletInfo]);
          
          return pendingWalletInfo;
        }
        
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
  
  // Set up event listeners for a wallet
  const setWalletEventListeners = (wallet: WalletInfo) => {
    if (!wallet.provider) return;
    
    try {
      // Different wallet types might have different event handling
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnect(wallet.id);
        } else if (accounts[0] !== wallet.address) {
          // Account changed, update the wallet
          updateWalletAddress(wallet.id, accounts[0]);
        }
      };
      
      const handleChainChanged = (chainIdHex: string) => {
        const chainId = typeof chainIdHex === 'string' ? parseInt(chainIdHex, 16) : Number(chainIdHex);
        updateWalletChain(wallet.id, chainId);
      };
      
      // Add event listeners based on wallet type
      if (wallet.provider.on) {
        wallet.provider.on('accountsChanged', handleAccountsChanged);
        wallet.provider.on('chainChanged', handleChainChanged);
        
        // Store the handlers in a map for cleanup
        const eventHandlersMap = new Map();
        eventHandlersMap.set(wallet.id, {
          accountsChanged: handleAccountsChanged,
          chainChanged: handleChainChanged,
          provider: wallet.provider
        });
        
        // Cleanup event listeners when component unmounts
        return () => {
          const handlers = eventHandlersMap.get(wallet.id);
          if (handlers && handlers.provider) {
            try {
              handlers.provider.removeListener('accountsChanged', handlers.accountsChanged);
              handlers.provider.removeListener('chainChanged', handlers.chainChanged);
            } catch (err) {
              console.error('Error removing wallet event listeners:', err);
            }
          }
        };
      }
    } catch (error) {
      console.error('Error setting up wallet event listeners:', error);
    }
  };
  
  // Update wallet address
  const updateWalletAddress = (walletId: string, newAddress: string) => {
    setWallets(prevWallets => 
      prevWallets.map(wallet => 
        wallet.id === walletId
          ? { ...wallet, address: newAddress }
          : wallet
      )
    );
    
    // Refresh wallet info after address change
    refreshBalance(walletId);
    
    // Update localStorage
    saveWalletsToStorage(wallets.map(wallet => 
      wallet.id === walletId
        ? { ...wallet, address: newAddress }
        : wallet
    ));
  };
  
  // Update wallet chain
  const updateWalletChain = (walletId: string, chainId: number) => {
    setWallets(prevWallets => 
      prevWallets.map(wallet => 
        wallet.id === walletId
          ? { 
              ...wallet, 
              chainId, 
              nativeToken: SUPPORTED_NETWORKS[chainId]?.symbol || 'ETH' 
            }
          : wallet
      )
    );
    
    // Refresh wallet info after chain change
    refreshBalance(walletId);
    
    // Update localStorage
    saveWalletsToStorage(wallets.map(wallet => 
      wallet.id === walletId
        ? { 
            ...wallet, 
            chainId, 
            nativeToken: SUPPORTED_NETWORKS[chainId]?.symbol || 'ETH' 
          }
        : wallet
    ));
  };
  
  // Helper to save wallets to localStorage
  const saveWalletsToStorage = (walletsToSave: WalletInfo[]) => {
    try {
      const walletData = walletsToSave.map(w => ({
        id: w.id,
        walletType: w.walletType,
        address: w.address,
        chainId: w.chainId
      }));
      
      localStorage.setItem('connectedWallets', JSON.stringify(walletData));
    } catch (error) {
      console.error('Failed to save wallets to localStorage:', error);
    }
  };
  
  // Disconnect a specific wallet
  const disconnect = async (walletId: string) => {
    const walletToDisconnect = wallets.find(w => w.id === walletId);
    
    if (!walletToDisconnect) {
      console.error(`Wallet with ID ${walletId} not found`);
      return;
    }
    
    try {
      // Use the external disconnect function with the wallet type
      await disconnectWallet(walletToDisconnect.walletType);
      
      // Remove the wallet from our state
      setWallets(wallets.filter(w => w.id !== walletId));
      
      // If this was the primary wallet, set the next available one as primary
      if (primaryWalletId === walletId) {
        const remainingWallets = wallets.filter(w => w.id !== walletId);
        if (remainingWallets.length > 0) {
          setPrimaryWalletId(remainingWallets[0].id);
          localStorage.setItem('aetherion-primary-wallet', remainingWallets[0].id);
        } else {
          setPrimaryWalletId(null);
          localStorage.removeItem('aetherion-primary-wallet');
        }
      }
      
      // Update localStorage
      saveWalletsToStorage(wallets.filter(w => w.id !== walletId));
      
      toast({
        title: "Wallet Disconnected",
        description: `Successfully disconnected ${walletToDisconnect.name}`,
      });
    } catch (error) {
      console.error(`Failed to disconnect wallet ${walletId}:`, error);
      
      toast({
        title: "Disconnect Error",
        description: "Failed to disconnect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Disconnect all wallets
  const disconnectAll = async () => {
    try {
      // Disconnect each wallet
      for (const wallet of wallets) {
        try {
          await disconnectWallet(wallet.walletType);
        } catch (error) {
          console.error(`Error disconnecting wallet ${wallet.id}:`, error);
        }
      }
      
      // Clear all wallets from state
      setWallets([]);
      setPrimaryWalletId(null);
      
      // Clear from localStorage
      localStorage.removeItem('connectedWallets');
      localStorage.removeItem('aetherion-primary-wallet');
      
      toast({
        title: "All Wallets Disconnected",
        description: "Successfully disconnected all wallets",
      });
    } catch (error) {
      console.error('Failed to disconnect all wallets:', error);
      
      toast({
        title: "Disconnect Error",
        description: "Failed to disconnect all wallets. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Switch network for a specific wallet
  const switchChain = async (walletId: string, chainId: number) => {
    const wallet = wallets.find(w => w.id === walletId);
    
    if (!wallet) {
      console.error(`Cannot switch chain: Wallet with ID ${walletId} not found`);
      return false;
    }
    
    try {
      const success = await switchNetwork(wallet.walletType, chainId);
      if (success) {
        // Update wallet with new chain information
        updateWalletChain(walletId, chainId);
        
        toast({
          title: "Network Changed",
          description: `Switched to ${SUPPORTED_NETWORKS[chainId]?.name || 'new network'}`,
        });
      }
      return success;
    } catch (error) {
      console.error(`Failed to switch network for wallet ${walletId}:`, error);
      
      toast({
        title: "Network Switch Failed",
        description: "Failed to switch blockchain network. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  // Refresh balance for a specific wallet
  const refreshBalance = async (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    
    if (!wallet || !wallet.provider) {
      console.error(`Cannot refresh balance: Wallet with ID ${walletId} not found or has no provider`);
      return;
    }
    
    try {
      // Create a new provider using the wallet's provider
      const provider = new ethers.BrowserProvider(wallet.provider);
      
      // Get the balance
      const balanceWei = await provider.getBalance(wallet.address);
      const balance = parseFloat(balanceWei.toString()) / 1e18; // Convert to ETH
      
      // Update the wallet
      setWallets(prevWallets => 
        prevWallets.map(w => 
          w.id === walletId
            ? { ...w, balance: balance.toString() }
            : w
        )
      );
    } catch (error) {
      console.error(`Failed to refresh balance for wallet ${walletId}:`, error);
    }
  };
  
  // Refresh balances for all wallets
  const refreshAllBalances = async () => {
    for (const wallet of wallets) {
      await refreshBalance(wallet.id);
    }
  };
  
  return (
    <MultiWalletContext.Provider value={{
      wallets,
      primaryWallet,
      setPrimaryWallet,
      availableWallets,
      isConnecting,
      connect,
      disconnect,
      disconnectAll,
      switchChain,
      refreshBalance,
      refreshAllBalances
    }}>
      {children}
    </MultiWalletContext.Provider>
  );
};