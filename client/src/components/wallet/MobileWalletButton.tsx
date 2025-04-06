import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useMobileWallet } from '@/hooks/use-mobile-wallet';
import { Wallet } from 'lucide-react';
import MobileWalletSelector from './MobileWalletSelector';
import WalletIcon from './WalletIcon';

interface MobileWalletButtonProps extends Omit<ButtonProps, 'onClick'> {
  onConnectWeb3?: () => void;
  text?: string;
  showIcon?: boolean;
}

/**
 * A button that opens the mobile wallet selector on mobile devices
 * or triggers the standard Web3 connection flow on desktop
 */
const MobileWalletButton: React.FC<MobileWalletButtonProps> = ({
  onConnectWeb3,
  text = 'Connect Wallet',
  showIcon = true,
  className = '',
  variant = 'default',
  size = 'default',
  ...props
}) => {
  const {
    isMobile,
    showWalletSelector,
    setShowWalletSelector,
    handleWalletSelect,
    selectedWallet
  } = useMobileWallet();

  const handleButtonClick = () => {
    if (isMobile) {
      setShowWalletSelector(true);
    } else if (onConnectWeb3) {
      onConnectWeb3();
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`${className} ${selectedWallet ? 'pl-2' : ''}`}
        onClick={handleButtonClick}
        {...props}
      >
        {showIcon && !selectedWallet && (
          <Wallet className="mr-2 h-4 w-4" />
        )}
        
        {selectedWallet && (
          <WalletIcon 
            type={(selectedWallet.id as any) || 'unknown'} 
            size="sm"
            className="mr-2"
          />
        )}
        
        {selectedWallet ? selectedWallet.name : text}
      </Button>

      {isMobile && (
        <MobileWalletSelector
          isOpen={showWalletSelector}
          onClose={() => setShowWalletSelector(false)}
          onWalletSelect={handleWalletSelect}
        />
      )}
    </>
  );
};

export default MobileWalletButton;