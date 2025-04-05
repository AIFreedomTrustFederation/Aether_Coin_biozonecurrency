import React, { useState } from 'react';
import { useWallet, WalletConnectError } from '@/context/WalletContext';
import { WalletType } from '@/lib/wallet-connectors';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import { FaEthereum, FaBitcoin } from 'react-icons/fa';
import { SiCoinbase, SiBinance, Si1Password } from 'react-icons/si';
import { useToast } from '@/hooks/use-toast';

interface WalletOptionProps {
  type: WalletType;
  name: string;
  icon: React.ReactNode;
  onClick: (type: WalletType) => void;
  disabled?: boolean;
}

const WalletOption: React.FC<WalletOptionProps> = ({ type, name, icon, onClick, disabled }) => (
  <Card 
    className={`cursor-pointer hover:border-primary transition-all duration-200 ${disabled ? 'opacity-50' : ''}`}
    onClick={() => !disabled && onClick(type)}
  >
    <CardContent className="flex items-center p-4 gap-3">
      <div className="text-3xl text-primary">{icon}</div>
      <div>
        <h3 className="font-medium">{name}</h3>
        {disabled && <p className="text-sm text-muted-foreground">Not detected</p>}
      </div>
    </CardContent>
  </Card>
);

const WalletConnector: React.FC = () => {
  const { toast } = useToast();
  const { wallet, availableWallets, connect, disconnect, isConnecting } = useWallet();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleConnect = async (walletType: WalletType) => {
    setError(null);
    try {
      const result = await connect(walletType);
      if (result && 'status' in result && result.status === 'error') {
        setError(`Failed to connect to ${walletType}: ${result.error}`);
        return;
      }
      setOpen(false);
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${getWalletName(walletType)}`,
      });
    } catch (err) {
      console.error("Wallet connection error:", err);
      setError(`Connection failed. Please try again.`);
    }
  };
  
  // Truncate wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const getWalletName = (type: WalletType): string => {
    switch (type) {
      case 'metamask': return 'MetaMask';
      case 'coinbase': return 'Coinbase Wallet';
      case 'binance': return 'Binance Wallet';
      case 'walletconnect': return 'WalletConnect';
      case '1inch': return '1inch Wallet';
      case 'trust': return 'Trust Wallet';
      default: return 'External Wallet';
    }
  };
  
  const getWalletIcon = (type: WalletType) => {
    switch (type) {
      case 'metamask':
        return <img src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" alt="MetaMask" className="h-6 w-6" />;
      case 'coinbase':
        return <SiCoinbase />;
      case 'binance':
        return <SiBinance />;
      case 'walletconnect':
        return <img src="https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg" alt="WalletConnect" className="h-6 w-6" />;
      case '1inch':
        return <Si1Password />;
      case 'trust':
        return <img src="https://trustwallet.com/assets/images/media/assets/trust_platform.svg" alt="Trust Wallet" className="h-6 w-6" />;
      default:
        return <FaBitcoin />;
    }
  };
  
  return (
    <div>
      {wallet ? (
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            {getWalletIcon(wallet.type)}
            <span>{formatAddress(wallet.address)}</span>
            <span className="text-xs bg-primary/10 px-2 py-1 rounded-full">
              {wallet.balance.slice(0, 6)} {wallet.nativeToken}
            </span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => disconnect()}>
            <span className="sr-only">Disconnect wallet</span>
            ×
          </Button>
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
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
                    type="metamask"
                    name="MetaMask"
                    icon={getWalletIcon('metamask')}
                    onClick={handleConnect}
                    disabled={!availableWallets.includes('metamask')}
                  />
                  
                  <WalletOption 
                    type="coinbase"
                    name="Coinbase Wallet"
                    icon={getWalletIcon('coinbase')}
                    onClick={handleConnect}
                    disabled={!availableWallets.includes('coinbase')}
                  />
                  
                  <WalletOption 
                    type="binance"
                    name="Binance Wallet"
                    icon={getWalletIcon('binance')}
                    onClick={handleConnect}
                    disabled={!availableWallets.includes('binance')}
                  />
                  
                  <WalletOption 
                    type="walletconnect"
                    name="WalletConnect"
                    icon={getWalletIcon('walletconnect')}
                    onClick={handleConnect}
                  />
                  
                  <WalletOption 
                    type="1inch"
                    name="1inch Wallet"
                    icon={getWalletIcon('1inch')}
                    onClick={handleConnect}
                  />
                  
                  <WalletOption 
                    type="trust"
                    name="Trust Wallet"
                    icon={getWalletIcon('trust')}
                    onClick={handleConnect}
                  />
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default WalletConnector;