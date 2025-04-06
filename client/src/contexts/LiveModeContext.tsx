import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import { walletConnector } from '../core/wallet/WalletConnector';
import { connectWallet, disconnectWallet, WalletType, getAvailableWallets } from '@/lib/wallet-connectors';

interface LiveModeContextType {
  isLiveMode: boolean;
  toggleLiveMode: () => void;
  web3Provider: ethers.BrowserProvider | null;
  connectToWeb3: (walletType?: WalletType) => Promise<boolean>;
  isConnecting: boolean;
  connectedAddress: string | null;
  disconnectWeb3: () => void;
  availableWallets: WalletType[];
  currentWalletType: WalletType | null;
}

const LiveModeContext = createContext<LiveModeContextType>({
  isLiveMode: false,
  toggleLiveMode: () => {},
  web3Provider: null,
  connectToWeb3: async () => false,
  isConnecting: false,
  connectedAddress: null,
  disconnectWeb3: () => {},
  availableWallets: [],
  currentWalletType: null,
});

export const useLiveMode = () => useContext(LiveModeContext);

interface LiveModeProviderProps {
  children: React.ReactNode;
}

export const LiveModeProvider: React.FC<LiveModeProviderProps> = ({ children }) => {
  const { toast } = useToast();
  
  // Get the stored mode from localStorage, defaulting to false (test mode)
  const [isLiveMode, setIsLiveMode] = useState<boolean>(() => {
    try {
      const storedMode = localStorage.getItem('aetherion-live-mode');
      return storedMode ? JSON.parse(storedMode) : false;
    } catch (e) {
      console.error('Error reading live mode from localStorage:', e);
      return false;
    }
  });
  
  const [web3Provider, setWeb3Provider] = useState<ethers.BrowserProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletType[]>([]);
  const [currentWalletType, setCurrentWalletType] = useState<WalletType | null>(null);

  // Initialize available wallets
  useEffect(() => {
    const wallets = getAvailableWallets();
    setAvailableWallets(wallets);
  }, []);

  // Update localStorage when mode changes
  useEffect(() => {
    try {
      localStorage.setItem('aetherion-live-mode', JSON.stringify(isLiveMode));
      
      // When switching to live mode, attempt to reconnect if previously connected
      if (isLiveMode && !web3Provider && currentWalletType) {
        connectToWeb3(currentWalletType);
      }
      
      // When switching to test mode, disconnect if connected
      if (!isLiveMode && web3Provider) {
        disconnectWeb3();
      }
    } catch (e) {
      console.error('Error saving live mode to localStorage:', e);
    }
  }, [isLiveMode]);
  
  // Connect to Web3 provider using selected wallet type
  const connectToWeb3 = async (walletType?: WalletType): Promise<boolean> => {
    setIsConnecting(true);
    
    try {
      // If no wallet type specified, try to use previously connected wallet or default to MetaMask
      const selectedWalletType = walletType || currentWalletType || 'MetaMask';
      
      // Connect to the selected wallet
      const { provider, accounts, walletProvider } = await connectWallet(selectedWalletType);
      
      if (!provider || !accounts || accounts.length === 0) {
        throw new Error(`Failed to connect to ${selectedWalletType}`);
      }

      // Save the current provider and address
      setWeb3Provider(provider);
      setConnectedAddress(accounts[0]);
      setCurrentWalletType(selectedWalletType);
      
      // Save wallet type to localStorage for reconnection
      localStorage.setItem('aetherion-wallet-type', selectedWalletType);
      
      // Set up event listeners for the wallet provider
      if (walletProvider) {
        // Different wallets might have different event handling
        if (selectedWalletType === 'MetaMask' && walletProvider.on) {
          walletProvider.on('accountsChanged', accountsChangedHandler);
          walletProvider.on('chainChanged', chainChangedHandler);
        }
      }
      
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${selectedWalletType}`,
        variant: "default",
      });
      
      setIsConnecting(false);
      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      
      toast({
        title: "Connection Failed",
        description: walletType 
          ? `Failed to connect to ${walletType}. Please try another wallet.` 
          : "Failed to connect to wallet. Please try again.",
        variant: "destructive",
      });
      
      setIsConnecting(false);
      
      // Don't revert to test mode automatically - let the user decide
      return false;
    }
  };
  
  // Store event handlers to be able to remove them later
  const accountsChangedHandler = (newAccounts: string[]) => {
    if (newAccounts.length === 0) {
      // User disconnected their wallet
      disconnectWeb3();
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
        variant: "default",
      });
    } else {
      setConnectedAddress(newAccounts[0]);
      
      toast({
        title: "Account Changed",
        description: "Your connected wallet account has changed.",
        variant: "default",
      });
    }
  };
  
  const chainChangedHandler = () => {
    toast({
      title: "Network Changed",
      description: "The blockchain network has changed. Refreshing application...",
      variant: "default",
    });
    
    // Reload the page on chain change
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };
  
  // Disconnect from Web3 provider
  const disconnectWeb3 = async () => {
    // Clean up event listeners based on wallet type
    if (currentWalletType && web3Provider) {
      try {
        // Clean up event listeners for specific wallet types
        if (currentWalletType === 'MetaMask' && window.ethereum) {
          window.ethereum.removeListener('accountsChanged', accountsChangedHandler);
          window.ethereum.removeListener('chainChanged', chainChangedHandler);
        }
        
        // Use our disconnectWallet utility to handle wallet-specific disconnect logic
        await disconnectWallet(currentWalletType);
        
        toast({
          title: "Wallet Disconnected",
          description: `Disconnected from ${currentWalletType}`,
          variant: "default",
        });
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
      }
    }
    
    // Reset state
    setWeb3Provider(null);
    setConnectedAddress(null);
    setCurrentWalletType(null);
    
    // Clear wallet type from localStorage
    localStorage.removeItem('aetherion-wallet-type');
  };

  const toggleLiveMode = () => {
    setIsLiveMode((prev) => !prev);
  };

  return (
    <LiveModeContext.Provider value={{ 
      isLiveMode, 
      toggleLiveMode,
      web3Provider,
      connectToWeb3,
      isConnecting,
      connectedAddress,
      disconnectWeb3,
      availableWallets,
      currentWalletType
    }}>
      {children}
    </LiveModeContext.Provider>
  );
};