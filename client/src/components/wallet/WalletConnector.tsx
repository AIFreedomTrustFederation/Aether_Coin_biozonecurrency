import React, { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { WalletType } from '@/lib/wallet-connectors';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { FaEthereum, FaBitcoin } from 'react-icons/fa';
import { SiCoinbase, SiBinance, Si1Password } from 'react-icons/si';

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
      <div className="text-3xl">{icon}</div>
      <div>
        <h3 className="font-medium">{name}</h3>
        {disabled && <p className="text-sm text-muted-foreground">Not detected</p>}
      </div>
    </CardContent>
  </Card>
);

const WalletConnector: React.FC = () => {
  const { wallet, availableWallets, connect, disconnect, isConnecting } = useWallet();
  const [open, setOpen] = useState(false);
  
  const handleConnect = async (walletType: WalletType) => {
    await connect(walletType);
    setOpen(false);
  };
  
  // Truncate wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const getWalletIcon = (type: WalletType) => {
    switch (type) {
      case 'metamask':
        return <FaEthereum />;
      case 'coinbase':
        return <SiCoinbase />;
      case 'binance':
        return <SiBinance />;
      case '1inch':
        return <Si1Password />;
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
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {isConnecting ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <WalletOption 
                    type="metamask"
                    name="MetaMask"
                    icon={<FaEthereum />}
                    onClick={handleConnect}
                    disabled={!availableWallets.includes('metamask')}
                  />
                  
                  <WalletOption 
                    type="coinbase"
                    name="Coinbase Wallet"
                    icon={<SiCoinbase />}
                    onClick={handleConnect}
                    disabled={!availableWallets.includes('coinbase')}
                  />
                  
                  <WalletOption 
                    type="binance"
                    name="Binance Wallet"
                    icon={<SiBinance />}
                    onClick={handleConnect}
                    disabled={!availableWallets.includes('binance')}
                  />
                  
                  <WalletOption 
                    type="walletconnect"
                    name="WalletConnect"
                    icon={<FaBitcoin />}
                    onClick={handleConnect}
                  />
                  
                  <WalletOption 
                    type="1inch"
                    name="1inch Wallet"
                    icon={<Si1Password />}
                    onClick={handleConnect}
                    disabled={!availableWallets.includes('1inch')}
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