import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, QrCode, ExternalLink, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useWallet } from '@/context/WalletContext';
import { useMobileWallet } from '@/hooks/use-mobile-wallet';
import WalletIcon from './WalletIcon';
import PermissionPrompt from './PermissionPrompt';

interface MobileWalletConnectProps {
  onSuccess?: () => void;
  buttonText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  walletType?: string;
  className?: string;
  fullWidth?: boolean;
}

const MobileWalletConnect: React.FC<MobileWalletConnectProps> = ({
  onSuccess,
  buttonText = "Connect Wallet",
  variant = "default",
  walletType = "walletconnect",
  className = "",
  fullWidth = false
}) => {
  const { toast } = useToast();
  const { connect, isConnecting } = useWallet();
  const { isMobile, installedWallets, refreshWallets } = useMobileWallet();
  const [open, setOpen] = useState(false);
  const [uri, setUri] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(isMobile ? "mobile" : "qr");
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<{name: string, id?: string, deepLink?: string} | null>(null);

  // Set of popular wallet deep links for iOS and Android
  const mobileWallets = [
    { 
      name: "MetaMask", 
      icon: "https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg",
      ios: "metamask://",
      android: "metamask://",
      universal: "https://metamask.app.link/dapp/"
    },
    { 
      name: "Trust Wallet", 
      icon: "https://trustwallet.com/assets/images/favicon.png",
      ios: "trust://",
      android: "trust://",
      universal: "https://link.trustwallet.com/"
    },
    { 
      name: "Coinbase Wallet", 
      icon: "https://dynamic-assets.coinbase.com/3c15df5e2ac7d4abbe9499ed9335041f00c620f28e8de2f93474a9f4a98843bf164586565fc41b106eaeeab15d6d672523a13b150ca3d3f5e5885499150ebf7e/asset_icons/9e67b270779f5ca1f6f3de9a58458d7a7e9a42b9d8e5d18059d779c87346685e.png",
      ios: "cbwallet://",
      android: "cbwallet://",
      universal: "https://go.cb-w.com/dapp?cb_url="
    },
    { 
      name: "Rainbow", 
      icon: "https://rainbowdotme.imgix.net/rainbow-logo.png",
      ios: "rainbow://",
      android: "rainbow://",
      universal: "https://rnbwapp.com/"
    },
    { 
      name: "Argent", 
      icon: "https://argentwebsite.cdn.prismic.io/argentwebsite/22c9f8b9-ef93-4a9d-b598-a9fbd01f9040_icon-512.png",
      ios: "argent://",
      android: "argent://",
      universal: "https://argent.link/"
    }
  ];

  const handleConnect = async () => {
    setError(null);
    try {
      // Check if permissions were previously granted
      const permissionsAccepted = localStorage.getItem('walletPermissionsAccepted');
      
      if (!permissionsAccepted) {
        // Set default wallet info for main button click
        setSelectedWallet({
          name: 'WalletConnect'
        });
        setShowPermissionPrompt(true);
        return;
      }
      
      // If already accepted, proceed with connection
      await initiateWalletConnection();
    } catch (err) {
      console.error("Wallet connection error:", err);
      
      // Provide more helpful error message based on environment and device
      if (isMobile) {
        if (installedWallets.length === 0) {
          setError(`No compatible wallet detected. Please install MetaMask, Trust Wallet, or Coinbase Wallet to connect.`);
        } else {
          setError(`Connection failed. Please try selecting one of your installed wallets below.`);
        }
      } else {
        setError(`Connection failed. Please ensure your wallet extension is installed and unlocked.`);
      }
      
      // Still show options for user
      setOpen(true);
    }
  };
  
  // Separate function to start the actual connection process
  // Helper to handle connecting state safely
  const handleIsConnecting = (connecting: boolean) => {
    if (connecting !== isConnecting) {
      // Since we don't have direct access to setIsConnecting from the context
      // We'll work with what we have - updating selected wallet state
      setSelectedWallet(prev => ({...prev, isConnecting: connecting}));
      
      // This triggers a re-render with the current isConnecting state
      // The actual state is managed in the WalletContext
    }
  };
  
  const initiateWalletConnection = async () => {
    try {
      // Update connecting state
      handleIsConnecting(true);
      
      // Log connection attempt for debugging
      console.log("Initiating wallet connection...");
      
      // Check for wallet environment
      const hasEthereum = typeof window.ethereum !== 'undefined';
      const isMetaMaskInstalled = hasEthereum && window.ethereum?.isMetaMask;
      const isCoinbaseWalletInstalled = hasEthereum && window.ethereum?.isCoinbaseWallet;
      
      // Log wallet detection status
      console.log("Wallet detection:", {
        hasEthereum,
        isMetaMaskInstalled,
        isCoinbaseWalletInstalled,
        isMobile,
        installedWallets: installedWallets.map(w => w.name)
      });
      
      // First, check if MetaMask is installed (for mobile, this would be a special case)
      if (isMetaMaskInstalled) {
        try {
          console.log("Attempting direct MetaMask connection...");
          // Direct MetaMask connection on mobile
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          if (accounts && accounts.length > 0) {
            console.log("MetaMask connection successful:", accounts);
            // Successfully connected to MetaMask
            toast({
              title: "Wallet Connected",
              description: "Successfully connected to MetaMask",
            });
            
            // Store permission preference
            localStorage.setItem('walletPermissionsAccepted', 'true');
            
            if (onSuccess) {
              onSuccess();
            }
            
            setOpen(false);
            // Issue with isConnecting state management
            handleIsConnecting(false);
            return { accounts };
          }
        } catch (metaMaskError) {
          console.error("MetaMask connection error:", metaMaskError);
          // If MetaMask fails, continue to try WalletConnect
        }
      }
      
      // Try Coinbase Wallet if installed
      if (isCoinbaseWalletInstalled) {
        try {
          console.log("Attempting Coinbase Wallet direct connection...");
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          if (accounts && accounts.length > 0) {
            console.log("Coinbase Wallet connection successful:", accounts);
            toast({
              title: "Wallet Connected",
              description: "Successfully connected to Coinbase Wallet",
            });
            
            localStorage.setItem('walletPermissionsAccepted', 'true');
            
            if (onSuccess) {
              onSuccess();
            }
            
            setOpen(false);
            handleIsConnecting(false);
            return { accounts };
          }
        } catch (coinbaseError) {
          console.error("Coinbase Wallet connection error:", coinbaseError);
        }
      }
      
      // Attempt connection with any installed wallet
      if (installedWallets.length > 0) {
        for (const wallet of installedWallets) {
          try {
            console.log(`Attempting connection with detected wallet: ${wallet.name}`);
            const result = await connect(wallet.id as any);
            if (result) {
              console.log(`${wallet.name} connection successful:`, result);
              return result;
            }
          } catch (walletError) {
            console.error(`${wallet.name} connection error:`, walletError);
          }
        }
      }
      
      // Fallback to WalletConnect with enhanced error reporting
      let result;
      try {
        console.log("Attempting WalletConnect connection...");
        result = await connect('WalletConnect' as any);
        console.log("WalletConnect connection result:", result);
      } catch (walletConnectError) {
        console.error("Error connecting with WalletConnect:", walletConnectError);
        
        // Try all possible alternatives
        const alternativeConnectors = ['MetaMask', 'Coinbase', 'Trust', 'Injected'];
        
        for (const connector of alternativeConnectors) {
          try {
            console.log(`Trying alternative connector: ${connector}`);
            result = await connect(connector as any);
            if (result) {
              console.log(`${connector} connection successful:`, result);
              break;
            }
          } catch (alternativeError) {
            console.error(`${connector} fallback error:`, alternativeError);
          }
        }
        
        // If still no result after trying all alternatives
        if (!result) {
          throw new Error("Could not connect to your Web3 wallet. Please install MetaMask or another compatible wallet.");
        }
      }
      
      // If we get a URI back, it means we need to show the QR code or deep link
      if (result && 'uri' in result) {
        setUri(result.uri as string);
        setOpen(true);
        handleIsConnecting(false);
        return result;
      }
      
      // If we get an error, handle it
      if (result && 'status' in result && result.status === 'error') {
        const errorResult = result as { error?: string };
        const errorMessage = errorResult.error || 'Unknown error';
        setError(`Failed to connect: ${errorMessage}`);
        
        // Show toast with actionable message
        toast({
          title: "Connection Failed",
          description: isMobile 
            ? "Please check if you have a compatible wallet installed on your device."
            : "Please make sure your wallet extension is installed and unlocked.",
          variant: "destructive"
        });
        
        handleIsConnecting(false);
        return null;
      }
      
      // If we get here, then connection was successful
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet",
      });
      
      // Store permission preference
      localStorage.setItem('walletPermissionsAccepted', 'true');
      
      if (onSuccess) {
        onSuccess();
      }
      
      setOpen(false);
      handleIsConnecting(false);
      return result;
    } catch (err) {
      console.error("Wallet connection error:", err);
      handleIsConnecting(false);
      
      // More detailed error handling
      let errorMessage = "Connection failed. Please try again.";
      
      if (err instanceof Error) {
        if (err.message.includes("MetaMask") || err.message.includes("provider")) {
          errorMessage = "No wallet detected. Please install MetaMask or another compatible wallet.";
        } else if (err.message.includes("User rejected")) {
          errorMessage = "Request rejected. Please approve the connection in your wallet.";
        }
      }
      
      setError(errorMessage);
      
      // Show toast with actionable message
      toast({
        title: "Connection Failed",
        description: isMobile 
          ? "Please make sure you have a compatible wallet installed on your device."
          : "Please check if your wallet extension is properly installed and unlocked.",
        variant: "destructive"
      });
      
      return null;
    }
  };

  const openMobileWallet = (wallet: typeof mobileWallets[0]) => {
    const os = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios' : 'android';
    const deepLink = wallet[os as 'ios' | 'android'];
    const encodedUri = encodeURIComponent(uri);
    const universalLink = `${wallet.universal}${encodedUri}`;
    
    // Try deep link first, fallback to universal link
    window.location.href = deepLink + encodedUri;
    
    // Fallback to universal link after a short delay (in case deep link doesn't work)
    setTimeout(() => {
      window.location.href = universalLink;
    }, 500);
  };

  // Refresh wallet list when dialog opens and handle connection status
  useEffect(() => {
    if (open && isMobile) {
      refreshWallets();
    }
    
    // Add listener for WalletConnect session connection
    // This would be replaced with actual WalletConnect v2 listeners
    const checkConnectionInterval = setInterval(() => {
      const isConnected = localStorage.getItem('walletconnect') !== null;
      if (isConnected) {
        clearInterval(checkConnectionInterval);
        setOpen(false);
        if (onSuccess) {
          onSuccess();
        }
      }
    }, 1000);

    return () => {
      clearInterval(checkConnectionInterval);
    };
  }, [open, onSuccess, isMobile, refreshWallets]);

  // Handler for permission dialog acceptance
  const handlePermissionAccept = () => {
    setShowPermissionPrompt(false);
    
    if (!selectedWallet) return;
    
    // If wallet name is WalletConnect (selected from main button),
    // initiate the wallet connection flow
    if (selectedWallet.name === 'WalletConnect') {
      initiateWalletConnection();
      return;
    }
    
    // For detected wallet or specific wallet from the list
    if (!uri) {
      // We need to get the URI first
      initiateWalletConnection().then(() => {
        // After we have the URI, check if we should handle deep linking
        if (selectedWallet.deepLink && uri) {
          window.location.href = selectedWallet.deepLink + encodeURIComponent(uri);
        } else {
          // Find the wallet in the predefined list
          const wallet = mobileWallets.find(w => w.name === selectedWallet.name);
          if (wallet) {
            openMobileWallet(wallet);
          }
        }
      });
    } else {
      // We already have the URI, proceed with deep linking
      if (selectedWallet.deepLink) {
        window.location.href = selectedWallet.deepLink + encodeURIComponent(uri);
      } else {
        // Find the wallet in the predefined list
        const wallet = mobileWallets.find(w => w.name === selectedWallet.name);
        if (wallet) {
          openMobileWallet(wallet);
        }
      }
    }
  };

  return (
    <>
      <Button 
        variant={variant} 
        onClick={handleConnect} 
        disabled={isConnecting}
        className={`${className} ${fullWidth ? 'w-full' : ''}`}
      >
        {isConnecting ? 
          <div className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
            Connecting...
          </div> : 
          buttonText
        }
      </Button>

      {/* Permission prompt dialog */}
      <PermissionPrompt
        isOpen={showPermissionPrompt}
        onClose={() => setShowPermissionPrompt(false)}
        onAccept={handlePermissionAccept}
        walletName={selectedWallet?.name}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect your wallet</DialogTitle>
            <DialogDescription>
              Use the QR code or connect directly through your mobile wallet
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue={activeTab} className="mt-4" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="qr" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                <span>QR Code</span>
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>Mobile Wallet</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="qr" className="flex flex-col items-center py-4">
              {uri ? (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-3 rounded-lg mb-4">
                    <QRCodeSVG value={uri} size={250} />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan this QR code with your wallet app to connect
                  </p>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p>Initializing connection...</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="mobile" className="py-4">
              <div className="grid grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-1">
                {installedWallets.length > 0 ? (
                  // Show detected wallets on device
                  installedWallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => {
                        // Show permission dialog before connecting
                        setSelectedWallet({
                          name: wallet.name,
                          id: wallet.id,
                          deepLink: wallet.deepLink
                        });
                        setShowPermissionPrompt(true);
                      }}
                      className="flex flex-col items-center p-3 border rounded-lg bg-primary/5 border-primary hover:bg-primary/10 transition-colors"
                    >
                      <WalletIcon 
                        type={wallet.id as any} 
                        className="w-12 h-12 mb-2"
                      />
                      <span className="text-sm font-medium">{wallet.name}</span>
                      <span className="text-xs text-primary">Installed</span>
                    </button>
                  ))
                ) : (
                  // Fallback to pre-defined list
                  mobileWallets.map((wallet) => (
                    <button
                      key={wallet.name}
                      onClick={() => {
                        // Show permission dialog before connecting
                        setSelectedWallet({
                          name: wallet.name
                        });
                        setShowPermissionPrompt(true);
                      }}
                      className="flex flex-col items-center p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <img 
                        src={wallet.icon} 
                        alt={wallet.name} 
                        className="w-12 h-12 mb-2 rounded-full object-contain"
                        onError={(e) => {
                          // Fallback if image doesn't load
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiM2NzRDOUIiLz48cGF0aCBkPSJNMTcuMDAzNiA5LjYwMzdMNi41NjI4OSAxNS42Mzg2QzYuMTM3NzYgMTUuOTI0NiA1LjU3MTc4IDE1LjgxMTQgNS4yODM0NCAxNS4zODk1QzQuOTk1MDkgMTQuOTY3NiA1LjEwOTE4IDE0LjQwNTMgNS41MzQzMSAxNC4xMTkzTDE1Ljk3NSA4LjA4NDM0QzE2LjQwMDEgNy43OTgzOCAxNi45NjYxIDcuOTExNTggMTcuMjU0NSA4LjMzMzQ1QzE3LjU0MjggOC43NTUzMiAxNy40Mjg3IDkuMzE3NyAxNy4wMDM2IDkuNjAzN1oiIGZpbGw9IndoaXRlIi8+PC9zdmc+';
                        }}
                      />
                      <span className="text-sm font-medium">{wallet.name}</span>
                    </button>
                  ))
                )}
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground text-center">
                <p>Having trouble? Try using the QR code instead.</p>
                {installedWallets.length === 0 && (
                  <p className="mt-2">No wallet detected on your device. <a href="https://ethereum.org/wallets" target="_blank" rel="noopener noreferrer" className="text-primary underline">Install a wallet</a></p>
                )}
                <button 
                  onClick={refreshWallets} 
                  className="text-primary underline mt-2"
                >
                  Refresh wallet list
                </button>
              </div>
            </TabsContent>
          </Tabs>
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mt-2 flex items-start">
              <X className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p>{error}</p>
                <div className="flex gap-2 mt-2">
                  <a 
                    href="https://metamask.io/download/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs bg-primary/20 hover:bg-primary/30 text-primary px-2 py-1 rounded-md transition-colors"
                  >
                    Install MetaMask
                  </a>
                  <a 
                    href="https://ethereum.org/wallets" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-md transition-colors"
                  >
                    Get More Wallets
                  </a>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground text-center mt-4">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileWalletConnect;