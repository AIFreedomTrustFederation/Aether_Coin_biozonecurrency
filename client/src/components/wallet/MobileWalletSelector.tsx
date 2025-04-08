import React, { useEffect, useState, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { detectMobileWallets, DetectedWallet, openWallet, isMobileDevice, detectProvidersFromWindow } from '@/utils/mobileWalletDetector';
import { Smartphone, Download, ExternalLink, RefreshCcw, Check, AlertTriangle } from 'lucide-react';
import WalletIcon from './WalletIcon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MobileWalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletSelect: (wallet: DetectedWallet) => void;
}

/**
 * A component that displays available mobile Web3 wallets
 * and allows the user to connect to them
 */
const MobileWalletSelector: React.FC<MobileWalletSelectorProps> = ({
  isOpen,
  onClose,
  onWalletSelect
}) => {
  const [wallets, setWallets] = useState<DetectedWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  // Check if on mobile and detect installed wallets
  const checkWallets = useCallback(async () => {
    setIsLoading(true);
    setConnectionError(null);
    
    try {
      // First check if on mobile
      const isMobile = isMobileDevice();
      setIsAvailable(isMobile);
      
      if (isMobile) {
        // Check if any providers are already connected
        const providers = detectProvidersFromWindow();
        const hasProvider = Object.values(providers).some(val => val === true);
        
        // Get available wallets
        const detectedWallets = await detectMobileWallets();
        
        // Sort wallets: installed first, then alphabetically
        const sortedWallets = [...detectedWallets].sort((a, b) => {
          if (a.installed && !b.installed) return -1;
          if (!a.installed && b.installed) return 1;
          return a.name.localeCompare(b.name);
        });
        
        setWallets(sortedWallets);
        
        // If we detected providers but no installed wallets, add a note
        if (hasProvider && !sortedWallets.some(w => w.installed)) {
          setConnectionError(
            "A Web3 provider was detected but couldn't be identified. " +
            "Try connecting directly using your wallet's browser."
          );
        }
      }
    } catch (error) {
      console.error("Error detecting wallets:", error);
      setConnectionError("Failed to detect wallets. Please try again or use WalletConnect.");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (isOpen) {
      checkWallets();
    } else {
      // Reset state when dialog closes
      setConnectingWallet(null);
      setConnectionError(null);
    }
  }, [isOpen, checkWallets]);

  // Handle wallet selection
  const handleWalletSelect = async (wallet: DetectedWallet) => {
    try {
      setConnectingWallet(wallet.id);
      setConnectionError(null);
      
      if (wallet.installed) {
        // Try to open the wallet
        const opened = openWallet(wallet.deepLink);
        
        if (opened) {
          // Notify parent component
          onWalletSelect(wallet);
          
          // Set short timeout to allow wallet to open before closing dialog
          setTimeout(() => {
            onClose();
          }, 300);
        } else {
          setConnectionError(`Failed to open ${wallet.name}. The wallet may not be properly installed.`);
        }
      } else {
        // Open download link in new tab
        window.open(wallet.download, '_blank');
      }
    } catch (error) {
      console.error(`Error connecting to ${wallet.name}:`, error);
      setConnectionError(`Failed to connect to ${wallet.name}. Please try again.`);
    } finally {
      setConnectingWallet(null);
    }
  };

  // Group wallets by installation status
  const installedWallets = wallets.filter(wallet => wallet.installed);
  const uninstalledWallets = wallets.filter(wallet => !wallet.installed);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Smartphone className="mr-2 h-5 w-5" />
            Connect Mobile Wallet
          </DialogTitle>
          <DialogDescription>
            {isAvailable 
              ? 'Select a wallet to connect to the Aetherion quantum network'
              : 'Please open this page on a mobile device to use mobile wallets'
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3">Detecting wallets...</span>
            </div>
          ) : !isAvailable ? (
            <div className="text-center py-4">
              <Smartphone className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p>This feature is only available on mobile devices</p>
            </div>
          ) : wallets.length === 0 ? (
            <div className="text-center py-4">
              <Download className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p>No Web3 wallets detected on your device</p>
              <Button variant="outline" className="mt-4" asChild>
                <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">
                  Get MetaMask Wallet
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Display any connection errors */}
              {connectionError && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{connectionError}</p>
                </div>
              )}
              
              {/* Display installed wallets first */}
              {installedWallets.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                    Installed Wallets
                  </h3>
                  <div className="grid gap-2">
                    {installedWallets.map((wallet) => (
                      <WalletButton
                        key={wallet.id}
                        wallet={wallet}
                        isConnecting={connectingWallet === wallet.id}
                        onClick={() => handleWalletSelect(wallet)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Display available for download wallets */}
              {uninstalledWallets.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Download className="h-4 w-4 mr-1" />
                    Available Wallets
                  </h3>
                  <div className="grid gap-2">
                    {uninstalledWallets.map((wallet) => (
                      <WalletButton
                        key={wallet.id}
                        wallet={wallet}
                        isConnecting={connectingWallet === wallet.id}
                        onClick={() => handleWalletSelect(wallet)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center"
                  onClick={checkWallets}
                  disabled={isLoading}
                >
                  <RefreshCcw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Scan again for installed wallets</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Wallet button component
interface WalletButtonProps {
  wallet: DetectedWallet;
  isConnecting: boolean;
  onClick: () => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({ wallet, isConnecting, onClick }) => {
  return (
    <Button
      variant={wallet.installed ? "default" : "outline"}
      className="flex justify-between items-center w-full h-auto py-3"
      onClick={onClick}
      disabled={isConnecting}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 mr-3 flex items-center justify-center">
          <WalletIcon 
            type={(wallet.id as any) || 'unknown'} 
            size="sm"
          />
        </div>
        <div className="text-left">
          <span className="block">{wallet.name}</span>
          {!wallet.installed && (
            <span className="text-xs text-muted-foreground">Tap to download</span>
          )}
        </div>
      </div>
      
      {isConnecting ? (
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : wallet.installed ? (
        <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
          Installed
        </span>
      ) : (
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  );
};

export default MobileWalletSelector;