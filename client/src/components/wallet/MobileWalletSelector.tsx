import React, { useEffect, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { detectMobileWallets, DetectedWallet, openWallet, isMobileDevice } from '@/utils/mobileWalletDetector';
import { Smartphone, Download, ExternalLink } from 'lucide-react';

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

  // Check if on mobile and detect installed wallets
  useEffect(() => {
    const checkWallets = async () => {
      setIsLoading(true);
      
      // First check if on mobile
      const isMobile = isMobileDevice();
      setIsAvailable(isMobile);
      
      if (isMobile) {
        // Get available wallets
        const detectedWallets = await detectMobileWallets();
        setWallets(detectedWallets);
      }
      
      setIsLoading(false);
    };
    
    if (isOpen) {
      checkWallets();
    }
  }, [isOpen]);

  // Handle wallet selection
  const handleWalletSelect = (wallet: DetectedWallet) => {
    if (wallet.installed) {
      // Try to open the wallet
      const opened = openWallet(wallet.deepLink);
      
      if (opened) {
        // Notify parent component
        onWalletSelect(wallet);
        onClose();
      }
    } else {
      // Open download link in new tab
      window.open(wallet.download, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Mobile Wallet</DialogTitle>
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
            <div className="grid gap-4 py-4">
              {wallets.map((wallet) => (
                <Button
                  key={wallet.id}
                  variant={wallet.installed ? "default" : "outline"}
                  className="flex justify-between items-center w-full"
                  onClick={() => handleWalletSelect(wallet)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 mr-3 flex items-center justify-center">
                      {/* This would be replaced with actual wallet icons */}
                      <div className={`w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold`}>
                        {wallet.name.charAt(0)}
                      </div>
                    </div>
                    <span>{wallet.name}</span>
                  </div>
                  
                  {wallet.installed ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">
                      Installed
                    </span>
                  ) : (
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MobileWalletSelector;