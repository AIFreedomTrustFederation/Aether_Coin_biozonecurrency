import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { isMobile } from '@/lib/utils';
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
  const [open, setOpen] = useState(false);
  const [uri, setUri] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(isMobile() ? "mobile" : "qr");

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
      // Connect using WalletConnect
      const result = await connect('walletconnect');
      
      // If we get a URI back, it means we need to show the QR code or deep link
      if (result && 'uri' in result) {
        setUri(result.uri as string);
        setOpen(true);
        return;
      }
      
      // If we get an error, handle it
      if (result && 'status' in result && result.status === 'error') {
        const errorResult = result as { error?: string };
        setError(`Failed to connect: ${errorResult.error || 'Unknown error'}`);
        return;
      }
      
      // If we get here, then connection was successful
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      setOpen(false);
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(`Connection failed. Please try again.`);
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

  // Close the dialog when connection is successful
  useEffect(() => {
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
  }, [onSuccess]);

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
              <div className="grid grid-cols-2 gap-3">
                {mobileWallets.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => openMobileWallet(wallet)}
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
                ))}
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground text-center">
                <p>Having trouble? Try using the QR code instead.</p>
              </div>
            </TabsContent>
          </Tabs>
          
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mt-2 flex items-start">
              <X className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
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