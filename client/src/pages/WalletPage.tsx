import React, { useEffect, useState } from 'react';
import WalletCreation from '../components/wallet/WalletCreation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useLiveMode } from '../contexts/LiveModeContext';
import { Wallet, Zap, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Configuration for the external wallet app
const EXTERNAL_WALLET_URL = "https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency";
// Use the deployed URL when available, you will need to update this with the actual URL
const DEPLOYED_WALLET_URL = ""; // e.g., "https://aether-coin.example.com"

const WalletPage: React.FC = () => {
  const { isLiveMode, toggleLiveMode, connectToWeb3, connectedAddress } = useLiveMode();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [externalWalletUrl, setExternalWalletUrl] = useState("");
  
  // Check if we should redirect to external wallet app
  useEffect(() => {
    // Prioritize the deployed URL if available
    const targetUrl = DEPLOYED_WALLET_URL || EXTERNAL_WALLET_URL;
    
    // Store the URL for use in the interface
    setExternalWalletUrl(targetUrl);
    
    // Automatic redirect option - uncomment if you want automatic redirect
    // window.location.href = targetUrl;
  }, []);
  
  // Handle redirect to external wallet
  const handleRedirectToExternalWallet = () => {
    setIsRedirecting(true);
    
    // Show toast notification
    toast({
      title: "Redirecting to Aether Coin Wallet",
      description: "You'll be taken to the external wallet application shortly."
    });
    
    // Redirect after a short delay to allow toast to be seen
    setTimeout(() => {
      window.open(externalWalletUrl, '_blank');
      setIsRedirecting(false);
    }, 1500);
  };

  const handleConnectWallet = async () => {
    if (!isLiveMode) {
      // First switch to Live Mode
      toggleLiveMode();
      toast({
        title: "Switching to Live Mode",
        description: "Live Mode activated to connect with real blockchain wallets"
      });
    } else {
      // Already in Live Mode, connect wallet
      const success = await connectToWeb3();
      if (!success) {
        toast({
          title: "Connection Failed",
          description: "Could not connect to your Web3 wallet. Please install MetaMask or another compatible wallet.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <h1 className="text-3xl font-bold">Wallet Management</h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleRedirectToExternalWallet}
              disabled={isRedirecting}
            >
              {isRedirecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  Open Aether Coin Wallet
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* External Wallet Banner */}
        <div className="mb-8 bg-primary/10 border border-primary/20 rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-primary/20 p-4 rounded-full">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-medium mb-2">Aether Coin Wallet Now Available</h2>
              <p className="text-muted-foreground mb-4">
                Experience our new dedicated Aether Coin wallet application with enhanced features and improved security.
              </p>
              <Button 
                onClick={handleRedirectToExternalWallet}
                className="gap-2"
                disabled={isRedirecting}
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    Launch Aether Coin Wallet
                    <ExternalLink className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="create-wallet" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="create-wallet">
              <span className="hidden sm:inline">Create/Import Wallet</span>
              <span className="sm:hidden">Create</span>
            </TabsTrigger>
            <TabsTrigger value="web3-connect">
              <span className="hidden sm:inline">Web3 Connect</span>
              <span className="sm:hidden">Connect</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create-wallet">
            <WalletCreation />
          </TabsContent>
          
          <TabsContent value="web3-connect">
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Web3 Connect</h2>
              <p className="text-muted-foreground mb-6">
                {isLiveMode 
                  ? "Connect to external wallets like MetaMask or Coinbase Wallet to manage your real crypto assets." 
                  : "Switch to Live Mode to connect external wallets like MetaMask or Coinbase Wallet."}
              </p>
              
              {connectedAddress ? (
                <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-2 rounded-lg">
                  <Wallet className="h-5 w-5" />
                  <span>Connected: {`${connectedAddress.substring(0, 6)}...${connectedAddress.substring(connectedAddress.length - 4)}`}</span>
                </div>
              ) : (
                <Button 
                  onClick={handleConnectWallet}
                  className="gap-2"
                >
                  {isLiveMode ? (
                    <>Connect Wallet</>
                  ) : (
                    <><Zap className="h-4 w-4" /> Switch to Live Mode</>
                  )}
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WalletPage;