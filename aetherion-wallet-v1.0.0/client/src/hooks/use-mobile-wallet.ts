import { useState, useCallback, useEffect } from 'react';
import { 
  isMobileDevice, 
  detectMobileWallets, 
  getPreferredConnectionMethod, 
  DetectedWallet 
} from '@/utils/mobileWalletDetector';

interface UseMobileWalletReturn {
  isMobile: boolean;
  isLoading: boolean;
  installedWallets: DetectedWallet[];
  preferredMethod: 'injected' | 'walletconnect';
  showWalletSelector: boolean;
  setShowWalletSelector: (show: boolean) => void;
  selectedWallet: DetectedWallet | null;
  handleWalletSelect: (wallet: DetectedWallet) => void;
  refreshWallets: () => Promise<void>;
}

/**
 * Hook for handling mobile wallet detection and connection
 * Use this to implement wallet connections on mobile devices
 */
export function useMobileWallet(): UseMobileWalletReturn {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [installedWallets, setInstalledWallets] = useState<DetectedWallet[]>([]);
  const [preferredMethod, setPreferredMethod] = useState<'injected' | 'walletconnect'>('walletconnect');
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<DetectedWallet | null>(null);

  // Detect mobile device and wallets on mount
  useEffect(() => {
    const detectDevice = async () => {
      const mobile = isMobileDevice();
      setIsMobile(mobile);
      
      if (mobile) {
        await refreshWallets();
      } else {
        setIsLoading(false);
      }
    };
    
    detectDevice();
  }, []);

  // Function to refresh the list of wallets
  const refreshWallets = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Get available wallets
      const wallets = await detectMobileWallets();
      setInstalledWallets(wallets);
      
      // Get preferred connection method
      const method = await getPreferredConnectionMethod();
      setPreferredMethod(method);
    } catch (error) {
      console.error('Error detecting wallets:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle wallet selection
  const handleWalletSelect = useCallback((wallet: DetectedWallet) => {
    setSelectedWallet(wallet);
    setShowWalletSelector(false);
  }, []);

  return {
    isMobile,
    isLoading,
    installedWallets,
    preferredMethod,
    showWalletSelector,
    setShowWalletSelector,
    selectedWallet,
    handleWalletSelect,
    refreshWallets
  };
}