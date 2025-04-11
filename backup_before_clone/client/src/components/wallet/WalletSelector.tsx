import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { WalletType } from '@/lib/wallet-connectors';
import { useLiveMode } from '@/contexts/LiveModeContext';
import { Loader2 } from 'lucide-react';

// Wallet icons
import { 
  SiCoinbase, 
  SiBinance,
} from 'react-icons/si';
import { FaEthereum, FaBitcoin, FaWallet, FaRegCreditCard } from 'react-icons/fa';

interface WalletSelectorProps {
  onConnect?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const WalletSelector: React.FC<WalletSelectorProps> = ({ 
  onConnect,
  variant = 'default',
  size = 'default',
  className = '',
}) => {
  const [open, setOpen] = React.useState(false);
  const { 
    isLiveMode,
    connectToWeb3, 
    isConnecting, 
    connectedAddress,
    availableWallets,
    currentWalletType
  } = useLiveMode();

  const getWalletIcon = (walletType: WalletType) => {
    switch (walletType) {
      case 'MetaMask':
        return <FaEthereum className="h-5 w-5 mr-2 text-orange-500" />;
      case 'Coinbase':
        return <SiCoinbase className="h-5 w-5 mr-2 text-blue-500" />;
      case 'Binance':
        return <SiBinance className="h-5 w-5 mr-2 text-yellow-500" />;
      case 'Trust':
        return <FaRegCreditCard className="h-5 w-5 mr-2 text-blue-700" />;
      case '1inch':
        return <FaBitcoin className="h-5 w-5 mr-2 text-blue-500" />;
      case 'WalletConnect':
        return <FaWallet className="h-5 w-5 mr-2 text-purple-500" />;
      default:
        return <FaWallet className="h-5 w-5 mr-2" />;
    }
  };

  const handleWalletSelect = async (walletType: WalletType) => {
    const success = await connectToWeb3(walletType);
    if (success) {
      setOpen(false);
      if (onConnect) {
        onConnect();
      }
    }
  };

  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (!isLiveMode) {
    return (
      <Button 
        variant="outline"
        size={size}
        className={`text-yellow-500 border-yellow-500 hover:bg-yellow-500/10 ${className}`}
        disabled
      >
        Test Mode
      </Button>
    );
  }

  if (connectedAddress) {
    return (
      <Button 
        variant="outline" 
        size={size}
        className={`text-green-500 border-green-500 hover:bg-green-500/10 ${className}`}
        onClick={() => setOpen(true)}
      >
        {currentWalletType && getWalletIcon(currentWalletType)}
        {formatAddress(connectedAddress)}
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={isConnecting}>
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>Connect Wallet</>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to Aetherion. You'll be able to interact with the blockchain and use all features.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {availableWallets.length > 0 ? (
            availableWallets.map((walletType) => (
              <Button
                key={walletType}
                variant="outline"
                className="justify-start font-normal"
                onClick={() => handleWalletSelect(walletType)}
                disabled={isConnecting}
              >
                {getWalletIcon(walletType)}
                {walletType}
              </Button>
            ))
          ) : (
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground mb-4">
                No compatible wallets detected. Please install one of the following:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={() => window.open('https://metamask.io/download', '_blank')}>
                  <FaEthereum className="h-4 w-4 mr-2 text-orange-500" />
                  MetaMask
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open('https://www.coinbase.com/wallet', '_blank')}>
                  <SiCoinbase className="h-4 w-4 mr-2 text-blue-500" />
                  Coinbase
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open('https://trustwallet.com/download', '_blank')}>
                  <FaRegCreditCard className="h-4 w-4 mr-2 text-blue-700" />
                  Trust
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletSelector;