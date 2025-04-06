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
import { Loader2, Smartphone } from 'lucide-react';
import { useLiveMode } from '@/contexts/LiveModeContext';
import { useMobileWallet } from '@/hooks/use-mobile-wallet';
import MobileWalletSelector from './MobileWalletSelector';
import WalletIcon from './WalletIcon';

// Import wallet icons
import { 
  SiCoinbase, 
  SiBinance,
} from 'react-icons/si';
import { FaEthereum, FaBitcoin, FaWallet, FaRegCreditCard } from 'react-icons/fa';

interface EnhancedWalletSelectorProps {
  onConnect?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Enhanced wallet selector with mobile wallet detection
 * This component detects mobile devices and shows a device-appropriate UI
 */
const EnhancedWalletSelector: React.FC<EnhancedWalletSelectorProps> = ({ 
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
  
  const {
    isMobile,
    showWalletSelector,
    setShowWalletSelector,
    handleWalletSelect,
    selectedWallet
  } = useMobileWallet();

  // Get icon for standard wallets
  const getWalletIcon = (walletType: string) => {
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

  // Handle wallet selection for desktop wallets
  const handleDesktopWalletSelect = async (walletType: string) => {
    const success = await connectToWeb3(walletType as any);
    if (success) {
      setOpen(false);
      if (onConnect) {
        onConnect();
      }
    }
  };

  // Handle when a mobile wallet is selected
  const handleMobileSelect = async (wallet: any) => {
    handleWalletSelect(wallet);
    // Use the wallet ID to determine which Web3 wallet to connect to
    if (wallet.id === 'metamask') {
      await connectToWeb3('MetaMask');
    } else if (wallet.id === 'coinbasewallet') {
      await connectToWeb3('Coinbase');
    } else if (wallet.id === 'trustwallet') {
      await connectToWeb3('Trust');
    } else {
      // Default to WalletConnect for other wallets
      await connectToWeb3('WalletConnect');
    }
    
    if (onConnect) {
      onConnect();
    }
  };

  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // In test mode, show disabled button
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

  // When connected, show address
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

  // When on mobile, use mobile-specific connection flow
  if (isMobile) {
    return (
      <>
        <Button 
          variant={variant} 
          size={size} 
          className={className} 
          onClick={() => setShowWalletSelector(true)}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Smartphone className="mr-2 h-4 w-4" />
              Connect Mobile Wallet
            </>
          )}
        </Button>
        
        <MobileWalletSelector
          isOpen={showWalletSelector}
          onClose={() => setShowWalletSelector(false)}
          onWalletSelect={handleMobileSelect}
        />
      </>
    );
  }

  // Default desktop wallet selection
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
            <>
              <FaWallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </>
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
                onClick={() => handleDesktopWalletSelect(walletType)}
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

export default EnhancedWalletSelector;