import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import aetherionProvider from '../core/blockchain/AetherionProvider';
import { WalletConnectionStatus } from '../core/blockchain/types';

export interface Wallet {
  id: number;
  name: string;
  address: string;
  balance: string;
  currency: string;
  network: string;
  userId: number;
  lastSynced?: Date;
  status: string;
  type: string;
  isDefault: boolean;
}

export interface AetherionConnection {
  connectionStatus: WalletConnectionStatus;
  connectedAccounts: string[];
  currentChainId: string;
  currentBalance: string;
}

/**
 * Custom hook to manage wallet-related functionality
 * Includes both database wallet management and blockchain connections
 */
export default function useWallet() {
  const queryClient = useQueryClient();
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  
  // Blockchain connection state
  const [connectionStatus, setConnectionStatus] = useState<WalletConnectionStatus>(WalletConnectionStatus.DISCONNECTED);
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [currentChainId, setCurrentChainId] = useState<string>('0xa37'); // Default to Aetherion mainnet
  const [currentBalance, setCurrentBalance] = useState<string>('0');

  // Get user wallets
  const {
    data: wallets = [],
    isLoading: isLoadingWallets,
    error: walletsError,
  } = useQuery({
    queryKey: ['/api/wallets'],
    queryFn: () => apiRequest('/api/wallets')
  });

  // Create a new wallet
  const createWalletMutation = useMutation({
    mutationFn: (data: { name: string; currency: string; network: string; type: string }) => 
      apiRequest('/api/wallets', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
    }
  });

  // Set default wallet
  const setDefaultWalletMutation = useMutation({
    mutationFn: (walletId: number) => 
      apiRequest(`/api/wallets/${walletId}/default`, 'POST'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
    }
  });

  // Connect to blockchain wallet
  const connectWallet = useCallback(async () => {
    try {
      // Update connection status
      setConnectionStatus(WalletConnectionStatus.CONNECTING);
      
      // Check if provider is available
      if (!window.aetherion && !window.ethereum) {
        throw new Error('No compatible wallet found. Please install a wallet extension.');
      }
      
      // Request accounts from the provider
      let accounts;
      if (window.aetherion) {
        accounts = await window.aetherion.request({ method: 'atc_requestAccounts' });
        // Get current chain ID
        const chainId = await window.aetherion.request({ method: 'atc_chainId' });
        setCurrentChainId(chainId);
      } else if (window.ethereum) {
        accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        // Get current chain ID
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setCurrentChainId(chainId);
      } else {
        throw new Error('No compatible wallet found');
      }
      
      // Update state with connected accounts
      setConnectedAccounts(accounts);
      setConnectionStatus(WalletConnectionStatus.CONNECTED);
      
      // Sync the wallet with the database if not already there
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        const existingWallet = wallets.find((w: Wallet) => w.address.toLowerCase() === address.toLowerCase());
        
        if (!existingWallet) {
          // Create a wallet record in the database
          await createWalletMutation.mutate({
            name: `Aetherion Wallet ${wallets.length + 1}`,
            currency: 'ATC',
            network: 'aetherion',
            type: 'browser'
          });
        }
      }
      
      return accounts;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setConnectionStatus(WalletConnectionStatus.ERROR);
      throw error;
    }
  }, [wallets, createWalletMutation]);

  // Disconnect from blockchain wallet
  const disconnectWallet = useCallback(async () => {
    // Update connection status
    setConnectionStatus(WalletConnectionStatus.DISCONNECTED);
    setConnectedAccounts([]);
    
    // For now, there's no standard method to disconnect in Web3 providers
    // We simply update our state to reflect disconnection
    
    // In a real implementation, we might clear storage data
    return true;
  }, []);

  // Effect to select default wallet when wallets are loaded
  useEffect(() => {
    if (wallets && wallets.length > 0 && !selectedWallet) {
      // Find default wallet or use the first one
      const defaultWallet = wallets.find((wallet: Wallet) => wallet.isDefault) || wallets[0];
      setSelectedWallet(defaultWallet);
    }
  }, [wallets, selectedWallet]);

  // Effect to set up blockchain event listeners
  useEffect(() => {
    // Store event handler references so we can remove them later
    const eventHandlers: Record<string, ((...args: any[]) => void)> = {};
    
    const setupListeners = async () => {
      if (window.aetherion) {
        // Listen for account changes
        const accountsChangedHandler = (accounts: string[]) => {
          setConnectedAccounts(accounts);
          
          // If accounts is empty, user disconnected
          if (!accounts || accounts.length === 0) {
            setConnectionStatus(WalletConnectionStatus.DISCONNECTED);
          }
        };
        window.aetherion.on('accountsChanged', accountsChangedHandler);
        eventHandlers.aetherionAccountsChanged = accountsChangedHandler;
        
        // Listen for chain changes
        const chainChangedHandler = (chainId: string) => {
          setCurrentChainId(chainId);
        };
        window.aetherion.on('chainChanged', chainChangedHandler);
        eventHandlers.aetherionChainChanged = chainChangedHandler;
        
        // Listen for connect events
        const connectHandler = () => {
          setConnectionStatus(WalletConnectionStatus.CONNECTED);
        };
        window.aetherion.on('connect', connectHandler);
        eventHandlers.aetherionConnect = connectHandler;
        
        // Listen for disconnect events
        const disconnectHandler = () => {
          setConnectionStatus(WalletConnectionStatus.DISCONNECTED);
          setConnectedAccounts([]);
        };
        window.aetherion.on('disconnect', disconnectHandler);
        eventHandlers.aetherionDisconnect = disconnectHandler;
      } else if (window.ethereum) {
        // Listen for account changes
        const accountsChangedHandler = (accounts: string[]) => {
          setConnectedAccounts(accounts);
          
          // If accounts is empty, user disconnected
          if (!accounts || accounts.length === 0) {
            setConnectionStatus(WalletConnectionStatus.DISCONNECTED);
          }
        };
        window.ethereum.on('accountsChanged', accountsChangedHandler);
        eventHandlers.ethereumAccountsChanged = accountsChangedHandler;
        
        // Listen for chain changes
        const chainChangedHandler = (chainId: string) => {
          setCurrentChainId(chainId);
        };
        window.ethereum.on('chainChanged', chainChangedHandler);
        eventHandlers.ethereumChainChanged = chainChangedHandler;
        
        // Listen for connect events
        const connectHandler = () => {
          setConnectionStatus(WalletConnectionStatus.CONNECTED);
        };
        window.ethereum.on('connect', connectHandler);
        eventHandlers.ethereumConnect = connectHandler;
        
        // Listen for disconnect events
        const disconnectHandler = () => {
          setConnectionStatus(WalletConnectionStatus.DISCONNECTED);
          setConnectedAccounts([]);
        };
        window.ethereum.on('disconnect', disconnectHandler);
        eventHandlers.ethereumDisconnect = disconnectHandler;
      }
    };
    
    setupListeners();
    
    // Cleanup listeners on unmount
    return () => {
      if (window.aetherion && window.aetherion.removeAllListeners) {
        window.aetherion.removeAllListeners();
      } else if (window.aetherion) {
        // Remove individual listeners if removeAllListeners is not available
        if (eventHandlers.aetherionAccountsChanged) {
          window.aetherion.removeListener('accountsChanged', eventHandlers.aetherionAccountsChanged);
        }
        if (eventHandlers.aetherionChainChanged) {
          window.aetherion.removeListener('chainChanged', eventHandlers.aetherionChainChanged);
        }
        if (eventHandlers.aetherionConnect) {
          window.aetherion.removeListener('connect', eventHandlers.aetherionConnect);
        }
        if (eventHandlers.aetherionDisconnect) {
          window.aetherion.removeListener('disconnect', eventHandlers.aetherionDisconnect);
        }
      }
      
      if (window.ethereum) {
        // Ethereum providers typically have removeListener but not removeAllListeners
        if (eventHandlers.ethereumAccountsChanged) {
          window.ethereum.removeListener('accountsChanged', eventHandlers.ethereumAccountsChanged);
        }
        if (eventHandlers.ethereumChainChanged) {
          window.ethereum.removeListener('chainChanged', eventHandlers.ethereumChainChanged);
        }
        if (eventHandlers.ethereumConnect) {
          window.ethereum.removeListener('connect', eventHandlers.ethereumConnect);
        }
        if (eventHandlers.ethereumDisconnect) {
          window.ethereum.removeListener('disconnect', eventHandlers.ethereumDisconnect);
        }
      }
    };
  }, []);

  // Periodically update balance
  useEffect(() => {
    if (connectionStatus === WalletConnectionStatus.CONNECTED && connectedAccounts.length > 0) {
      const updateBalance = async () => {
        try {
          if (window.aetherion) {
            const balance = await window.aetherion.request({
              method: 'atc_getBalance',
              params: [connectedAccounts[0], 'latest']
            });
            setCurrentBalance(balance);
          } else if (window.ethereum) {
            const balance = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [connectedAccounts[0], 'latest']
            });
            setCurrentBalance(balance);
          }
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      };
      
      // Update balance immediately
      updateBalance();
      
      // Set up interval for updates
      const intervalId = setInterval(updateBalance, 15000);
      
      return () => clearInterval(intervalId);
    }
  }, [connectionStatus, connectedAccounts]);

  return {
    // Database wallet management
    wallets,
    isLoadingWallets,
    walletsError,
    selectedWallet,
    setSelectedWallet,
    createWallet: createWalletMutation.mutate,
    isCreatingWallet: createWalletMutation.isPending,
    setDefaultWallet: setDefaultWalletMutation.mutate,
    isSettingDefaultWallet: setDefaultWalletMutation.isPending,
    
    // Blockchain connection
    connectionStatus,
    connectedAccounts,
    currentChainId,
    currentBalance,
    connectWallet,
    disconnectWallet
  };
}