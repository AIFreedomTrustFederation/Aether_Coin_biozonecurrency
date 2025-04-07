import React from 'react';
import WalletCreation from '../components/wallet/WalletCreation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useLiveMode } from '../contexts/LiveModeContext';
import { Wallet, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WalletPage: React.FC = () => {
  const { isLiveMode, toggleLiveMode, connectToWeb3, connectedAddress } = useLiveMode();
  const { toast } = useToast();

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
        <h1 className="text-3xl font-bold mb-8">Wallet Management</h1>
        
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