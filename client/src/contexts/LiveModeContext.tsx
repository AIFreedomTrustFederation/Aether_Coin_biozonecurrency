import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import { walletConnector } from '../core/wallet/WalletConnector';

interface LiveModeContextType {
  isLiveMode: boolean;
  toggleLiveMode: () => void;
  web3Provider: ethers.BrowserProvider | null;
  connectToWeb3: () => Promise<boolean>;
  isConnecting: boolean;
  connectedAddress: string | null;
  disconnectWeb3: () => void;
}

const LiveModeContext = createContext<LiveModeContextType>({
  isLiveMode: false,
  toggleLiveMode: () => {},
  web3Provider: null,
  connectToWeb3: async () => false,
  isConnecting: false,
  connectedAddress: null,
  disconnectWeb3: () => {},
});

export const useLiveMode = () => useContext(LiveModeContext);

interface LiveModeProviderProps {
  children: React.ReactNode;
}

export const LiveModeProvider: React.FC<LiveModeProviderProps> = ({ children }) => {
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

  // Update localStorage when mode changes
  useEffect(() => {
    try {
      localStorage.setItem('aetherion-live-mode', JSON.stringify(isLiveMode));
      
      // When switching to live mode, attempt to connect if ethereum is available
      if (isLiveMode && !web3Provider && window.ethereum) {
        connectToWeb3();
      }
      
      // When switching to test mode, disconnect if connected
      if (!isLiveMode && web3Provider) {
        disconnectWeb3();
      }
    } catch (e) {
      console.error('Error saving live mode to localStorage:', e);
    }
  }, [isLiveMode]);
  
  // Connect to Web3 provider (Metamask, etc.)
  const connectToWeb3 = async (): Promise<boolean> => {
    if (!window.ethereum) {
      console.error('Web3 provider not found. Please install MetaMask or another compatible wallet.');
      return false;
    }
    
    setIsConnecting(true);
    
    try {
      // Request accounts from the provider
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create an ethers.js provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      setWeb3Provider(provider);
      setConnectedAddress(accounts[0]);
      
      // Connect wallet through our WalletConnector
      try {
        // Use the built-in ethereum wallet connection method instead
        const wallet = await walletConnector.connectEthereumWallet();
        console.log('Connected wallet through connector:', wallet);
      } catch (walletError) {
        console.error('Error connecting wallet through connector:', walletError);
      }
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', accountsChangedHandler);
      
      // Listen for chain changes
      window.ethereum.on('chainChanged', chainChangedHandler);
      
      setIsConnecting(false);
      return true;
    } catch (error) {
      console.error('Failed to connect to Web3 provider:', error);
      setIsConnecting(false);
      setIsLiveMode(false); // Revert to test mode if connection fails
      return false;
    }
  };
  
  // Store event handlers to be able to remove them later
  const accountsChangedHandler = (newAccounts: string[]) => {
    if (newAccounts.length === 0) {
      // User disconnected their wallet
      disconnectWeb3();
    } else {
      setConnectedAddress(newAccounts[0]);
    }
  };
  
  const chainChangedHandler = () => {
    // Reload the page on chain change as recommended by MetaMask
    window.location.reload();
  };
  
  // Disconnect from Web3 provider
  const disconnectWeb3 = () => {
    setWeb3Provider(null);
    setConnectedAddress(null);
    
    // Clean up event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', accountsChangedHandler);
      window.ethereum.removeListener('chainChanged', chainChangedHandler);
    }
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
      disconnectWeb3
    }}>
      {children}
    </LiveModeContext.Provider>
  );
};