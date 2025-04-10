import React, { useEffect } from 'react';
import { AlertCircle, Zap, Wallet, ExternalLink } from 'lucide-react';
import { useLiveMode } from '../../contexts/LiveModeContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import EnhancedWalletSelector from '@/components/wallet/EnhancedWalletSelector';
import { WalletType } from '@/lib/wallet-connectors';

interface LiveModeIndicatorProps {
  className?: string;
  variant?: 'badge' | 'button' | 'text';
  showToggle?: boolean;
}

export function LiveModeIndicator({ 
  className = '', 
  variant = 'badge',
  showToggle = false
}: LiveModeIndicatorProps) {
  const { 
    isLiveMode, 
    toggleLiveMode, 
    connectToWeb3, 
    connectedAddress, 
    isConnecting 
  } = useLiveMode();
  
  const { toast } = useToast();
  
  // Note: We intentionally do NOT auto-connect when switching to live mode
  // This is to prevent automatic wallet popups which can be disruptive
  // Users must explicitly connect their wallet after entering live mode
  useEffect(() => {
    // If user has previously connected and we switch back to test mode, disconnect
    if (!isLiveMode && connectedAddress) {
      // We don't need to show a toast for this, it's expected behavior
    }
  }, [isLiveMode, connectedAddress]);
  
  // Helper function to truncate address
  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Open blockchain explorer when clicking on the address
  const openExplorer = (address: string) => {
    window.open(`https://etherscan.io/address/${address}`, '_blank');
  };

  // Button variant
  if (variant === 'button') {
    // If in Live Mode but not connected, show WalletSelector
    if (isLiveMode && !connectedAddress) {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            className={`gap-2 ${className}`}
            onClick={showToggle ? toggleLiveMode : undefined}
          >
            <Zap className="h-4 w-4" />
            <span>Live Mode</span>
          </Button>
          <EnhancedWalletSelector size="sm" variant="outline" className="h-9" />
        </div>
      );
    }
    
    return (
      <Button
        variant={isLiveMode ? "default" : "outline"}
        size="sm"
        className={`gap-2 ${className}`}
        onClick={showToggle ? toggleLiveMode : undefined}
      >
        {isLiveMode ? (
          <>
            <Zap className="h-4 w-4" />
            <span>Live Mode</span>
            {connectedAddress && (
              <div className="flex items-center ml-2 bg-primary-foreground/20 rounded-full px-2 py-0.5 text-xs">
                <Wallet className="h-3 w-3 mr-1" />
                <span onClick={(e) => {
                  e.stopPropagation();
                  openExplorer(connectedAddress);
                }} className="cursor-pointer hover:underline flex items-center">
                  {truncateAddress(connectedAddress)}
                  <ExternalLink className="h-2.5 w-2.5 ml-1" />
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4" />
            <span>Test Mode</span>
          </>
        )}
      </Button>
    );
  }

  // Badge variant
  if (variant === 'badge') {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant={isLiveMode ? "default" : "outline"} 
          className={`gap-1 cursor-${showToggle ? 'pointer' : 'default'} ${className}`}
          onClick={showToggle ? toggleLiveMode : undefined}
        >
          {isLiveMode ? (
            <>
              <Zap className="h-3 w-3" />
              <span>Live</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3" />
              <span>Test</span>
            </>
          )}
        </Badge>
        
        {isLiveMode && !connectedAddress && (
          <EnhancedWalletSelector size="sm" variant="outline" className="h-6 py-0 px-2 text-xs" />
        )}
        
        {isLiveMode && connectedAddress && (
          <Badge variant="outline" className="gap-1">
            <Wallet className="h-3 w-3" />
            <span 
              onClick={() => openExplorer(connectedAddress)}
              className="cursor-pointer hover:underline flex items-center"
            >
              {truncateAddress(connectedAddress)}
              <ExternalLink className="h-2.5 w-2.5 ml-1" />
            </span>
          </Badge>
        )}
      </div>
    );
  }

  // Text variant
  return (
    <div className="flex items-center gap-2">
      <div 
        className={`flex items-center gap-1 text-sm ${className} cursor-${showToggle ? 'pointer' : 'default'}`}
        onClick={showToggle ? toggleLiveMode : undefined}
      >
        {isLiveMode ? (
          <>
            <Zap className="h-4 w-4 text-green-500" />
            <span className="text-green-500 font-medium">Live Mode</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-amber-500 font-medium">Test Mode</span>
          </>
        )}
      </div>
      
      {isLiveMode && !connectedAddress && (
        <EnhancedWalletSelector size="sm" variant="outline" className="h-6 py-0 px-2 text-xs" />
      )}
      
      {isLiveMode && connectedAddress && (
        <div className="flex items-center text-xs gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
          <Wallet className="h-3 w-3" />
          <span 
            onClick={() => openExplorer(connectedAddress)}
            className="cursor-pointer hover:underline flex items-center"
          >
            {truncateAddress(connectedAddress)}
            <ExternalLink className="h-2.5 w-2.5 ml-1" />
          </span>
        </div>
      )}
    </div>
  );
}