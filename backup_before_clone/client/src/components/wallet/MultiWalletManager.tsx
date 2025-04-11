import React, { useState } from 'react';
import { useMultiWallet, WalletInfo } from '@/context/MultiWalletContext';
import { WalletType } from '@/lib/wallet-connectors';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Loader2, 
  AlertTriangle, 
  PlusCircle, 
  Wallet, 
  Check, 
  X, 
  RefreshCw,
  Star, 
  StarOff, 
  ExternalLink 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SUPPORTED_NETWORKS } from '@/lib/wallet-connectors';

const MultiWalletManager: React.FC = () => {
  const { toast } = useToast();
  const { 
    wallets, 
    primaryWallet, 
    setPrimaryWallet,
    availableWallets, 
    isConnecting, 
    connect, 
    disconnect,
    disconnectAll,
    refreshBalance,
    refreshAllBalances
  } = useMultiWallet();
  
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('connected');
  
  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (!address || address.includes('Connecting') || address.includes('Pending')) {
      return address;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Get wallet icon
  const getWalletIcon = (type: WalletType) => {
    switch (type) {
      case 'MetaMask':
        return <img src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" alt="MetaMask" className="h-6 w-6" />;
      case 'Coinbase':
        return <img src="https://avatars.githubusercontent.com/u/1885080" alt="Coinbase" className="h-6 w-6 rounded-full" />;
      case 'Binance':
        return <img src="https://public.bnbstatic.com/static/images/common/favicon.ico" alt="Binance" className="h-6 w-6" />;
      case 'WalletConnect':
        return <img src="https://avatars.githubusercontent.com/u/37784886" alt="WalletConnect" className="h-6 w-6 rounded-full" />;
      case '1inch':
        return <img src="https://avatars.githubusercontent.com/u/43341799" alt="1inch" className="h-6 w-6 rounded-full" />;
      case 'Trust':
        return <img src="https://avatars.githubusercontent.com/u/32179889" alt="Trust Wallet" className="h-6 w-6 rounded-full" />;
      default:
        return <Wallet className="h-6 w-6" />;
    }
  };
  
  // Handle wallet connection
  const handleConnect = async (walletType: WalletType) => {
    setError(null);
    try {
      const result = await connect(walletType);
      
      if (result && 'status' in result && result.status === 'error') {
        setError(`Failed to connect: ${result.error}`);
        return;
      }
      
      setConnectDialogOpen(false);
      toast({
        title: "Wallet Connected",
        description: `Successfully connected ${walletType}`,
      });
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Connection failed. Please try again.');
    }
  };
  
  // Get network details for a wallet
  const getNetworkDetails = (chainId: number) => {
    const network = SUPPORTED_NETWORKS[chainId];
    if (network) {
      return {
        name: network.name,
        symbol: network.symbol
      };
    }
    return {
      name: 'Unknown Network',
      symbol: 'ETH'
    };
  };
  
  // Handle making a wallet primary
  const handleSetPrimary = (walletId: string) => {
    setPrimaryWallet(walletId);
  };
  
  // Handle disconnecting a wallet
  const handleDisconnect = async (walletId: string, walletName: string) => {
    await disconnect(walletId);
    toast({
      title: "Wallet Disconnected",
      description: `${walletName} has been disconnected`,
    });
  };
  
  // Handle disconnecting all wallets
  const handleDisconnectAll = async () => {
    await disconnectAll();
    setManageDialogOpen(false);
  };
  
  // Refresh all wallet balances
  const handleRefreshAll = async () => {
    await refreshAllBalances();
    toast({
      title: "Balances Updated",
      description: "Refreshed all wallet balances",
    });
  };
  
  // Render a connected wallet card
  const renderWalletCard = (wallet: WalletInfo) => {
    const networkDetails = getNetworkDetails(wallet.chainId);
    const isPending = wallet.status === 'pending' || wallet.address.includes('Connecting') || wallet.address.includes('Pending');
    
    return (
      <Card key={wallet.id} className={`border ${primaryWallet?.id === wallet.id ? 'border-primary' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {getWalletIcon(wallet.walletType)}
              <CardTitle className="text-base">{wallet.name}</CardTitle>
              {primaryWallet?.id === wallet.id && (
                <Badge variant="outline" className="ml-1 text-xs bg-primary/10">Primary</Badge>
              )}
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => refreshBalance(wallet.id)}
                disabled={isPending}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
              </Button>
              
              {primaryWallet?.id !== wallet.id ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-yellow-500"
                  onClick={() => handleSetPrimary(wallet.id)}
                  disabled={isPending}
                >
                  <Star className="h-4 w-4" />
                  <span className="sr-only">Set as Primary</span>
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-yellow-500 opacity-50"
                  disabled
                >
                  <StarOff className="h-4 w-4" />
                  <span className="sr-only">Primary Wallet</span>
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive"
                onClick={() => handleDisconnect(wallet.id, wallet.name)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Disconnect</span>
              </Button>
            </div>
          </div>
          <CardDescription>
            <div className="flex items-center gap-1 text-xs">
              <span>{isPending ? wallet.address : formatAddress(wallet.address)}</span>
              {!isPending && (
                <Button variant="ghost" size="icon" className="h-5 w-5 p-0" asChild>
                  <a 
                    href={`https://etherscan.io/address/${wallet.address}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="sr-only">View on Explorer</span>
                  </a>
                </Button>
              )}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Waiting for connection...</span>
            </div>
          ) : (
            <div className="grid gap-1">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Balance:</span>
                <span className="font-medium">
                  {parseFloat(wallet.balance).toFixed(4)} {wallet.nativeToken}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Network:</span>
                <span className="font-medium">{networkDetails.name}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  // Wallet connector component
  const WalletOption = ({ type, name, onClick, disabled }: {
    type: WalletType;
    name: string;
    onClick: (type: WalletType) => void;
    disabled?: boolean;
  }) => (
    <Card 
      className={`cursor-pointer hover:border-primary transition-all duration-200 ${disabled ? 'opacity-50' : ''}`}
      onClick={() => !disabled && onClick(type)}
    >
      <CardContent className="flex items-center p-4 gap-3">
        <div className="text-3xl text-primary">{getWalletIcon(type)}</div>
        <div>
          <h3 className="font-medium">{name}</h3>
          {disabled && <p className="text-sm text-muted-foreground">Not detected</p>}
        </div>
      </CardContent>
    </Card>
  );
  
  // Main display - show either a single connected wallet or wallet management buttons
  return (
    <div>
      {/* Display connected wallets or connect button */}
      {wallets.length > 0 ? (
        <div className="space-y-2">
          {/* Show primary wallet */}
          {primaryWallet && (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button 
                variant="outline" 
                className="gap-1 sm:gap-2 text-xs sm:text-sm py-1 px-2 sm:py-2 sm:px-3 h-auto"
                onClick={() => setManageDialogOpen(true)}
              >
                {getWalletIcon(primaryWallet.walletType)}
                <span className="hidden xs:inline">{formatAddress(primaryWallet.address)}</span>
                <span className="text-xs bg-primary/10 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                  {parseFloat(primaryWallet.balance).toFixed(4)} {primaryWallet.nativeToken}
                </span>
              </Button>
              
              {wallets.length === 1 ? (
                <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0" onClick={() => disconnect(primaryWallet.id)}>
                  <span className="sr-only">Disconnect wallet</span>
                  ×
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0" 
                  onClick={() => setManageDialogOpen(true)}
                >
                  <span className="sr-only">Manage wallets</span>
                  <Badge variant="secondary" className="px-1.5 h-5">{wallets.length}</Badge>
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">Connect Wallet</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Connect your wallet</DialogTitle>
              <DialogDescription>
                Select your preferred wallet to connect to the Aetherion platform
              </DialogDescription>
            </DialogHeader>
            
            {error && (
              <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-md flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            <div className="grid gap-4 py-4">
              {isConnecting ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Connecting to wallet...</p>
                </div>
              ) : (
                <>
                  <WalletOption 
                    type="MetaMask"
                    name="MetaMask"
                    onClick={handleConnect}
                    disabled={!availableWallets.includes('MetaMask')}
                  />
                  
                  <WalletOption 
                    type="Coinbase"
                    name="Coinbase Wallet"
                    onClick={handleConnect}
                    disabled={!availableWallets.includes('Coinbase')}
                  />
                  
                  <WalletOption 
                    type="Binance"
                    name="Binance Wallet"
                    onClick={handleConnect}
                    disabled={!availableWallets.includes('Binance')}
                  />
                  
                  <WalletOption 
                    type="WalletConnect"
                    name="WalletConnect"
                    onClick={handleConnect}
                  />
                  
                  <WalletOption 
                    type="Trust"
                    name="Trust Wallet"
                    onClick={handleConnect}
                  />
                  
                  <WalletOption 
                    type="1inch"
                    name="1inch Wallet"
                    onClick={handleConnect}
                  />
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Wallet management dialog */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Wallets</DialogTitle>
            <DialogDescription>
              Connect and manage multiple wallets for your Aetherion account
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="connected">Connected ({wallets.length})</TabsTrigger>
              <TabsTrigger value="add">Add Wallet</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connected" className="space-y-4">
              {wallets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                  <Wallet className="h-12 w-12 text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground">No wallets connected</p>
                  <Button variant="outline" onClick={() => setSelectedTab('add')}>
                    Connect a Wallet
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Your Connected Wallets</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleRefreshAll}>
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh All
                      </Button>
                      <Button size="sm" variant="destructive" onClick={handleDisconnectAll}>
                        Disconnect All
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-4">
                    {wallets.map(renderWalletCard)}
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="add">
              <div className="grid gap-4 py-4">
                {isConnecting ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Connecting to wallet...</p>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-md flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5" />
                        <p className="text-sm">{error}</p>
                      </div>
                    )}
                    
                    <WalletOption 
                      type="MetaMask"
                      name="MetaMask"
                      onClick={handleConnect}
                      disabled={!availableWallets.includes('MetaMask')}
                    />
                    
                    <WalletOption 
                      type="Coinbase"
                      name="Coinbase Wallet"
                      onClick={handleConnect}
                      disabled={!availableWallets.includes('Coinbase')}
                    />
                    
                    <WalletOption 
                      type="Binance"
                      name="Binance Wallet"
                      onClick={handleConnect}
                      disabled={!availableWallets.includes('Binance')}
                    />
                    
                    <WalletOption 
                      type="WalletConnect"
                      name="WalletConnect"
                      onClick={handleConnect}
                    />
                    
                    <WalletOption 
                      type="Trust"
                      name="Trust Wallet"
                      onClick={handleConnect}
                    />
                    
                    <WalletOption 
                      type="1inch"
                      name="1inch Wallet"
                      onClick={handleConnect}
                    />
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MultiWalletManager;