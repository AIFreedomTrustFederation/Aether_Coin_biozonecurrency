/**
 * AutoConnectWallet Component
 * 
 * This component automatically attempts to connect to any previously connected wallet
 * when the dashboard loads. It provides a user interface to:
 * 1. Auto-connect to the last used wallet
 * 2. Display connection status
 * 3. Allow for quick wallet connection/disconnection
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, ShieldAlert, ShieldCheck, WalletIcon } from "lucide-react";
import aetherionProvider from "../../core/blockchain/AetherionProvider";
import { default as useWallet } from "../../hooks/useWallet";
import { WalletConnectionStatus } from '../../core/blockchain/types';

// Local storage key for auto-connect preference
const AUTO_CONNECT_PREF_KEY = 'aetherion_auto_connect_enabled';
const LAST_CONNECTED_WALLET_KEY = 'aetherion_last_connected_wallet';

/**
 * Props for the AutoConnectWallet component
 */
interface AutoConnectWalletProps {
  onConnectionChange?: (connected: boolean) => void;
}

/**
 * AutoConnectWallet Component
 */
const AutoConnectWallet: React.FC<AutoConnectWalletProps> = ({ onConnectionChange }) => {
  const { toast } = useToast();
  const { connectWallet, disconnectWallet, connectionStatus, connectedAccounts } = useWallet();
  
  // State for auto-connect preference
  const [autoConnectEnabled, setAutoConnectEnabled] = useState<boolean>(() => {
    // Initialize from local storage preference, default to true
    const savedPref = localStorage.getItem(AUTO_CONNECT_PREF_KEY);
    return savedPref ? savedPref === 'true' : true;
  });
  
  // State to track if we've attempted auto-connect
  const [hasAttemptedAutoConnect, setHasAttemptedAutoConnect] = useState<boolean>(false);
  
  // State to track the last connection error
  const [lastError, setLastError] = useState<string | null>(null);

  // Handle auto-connect preference change
  const handleAutoConnectChange = (checked: boolean) => {
    setAutoConnectEnabled(checked);
    localStorage.setItem(AUTO_CONNECT_PREF_KEY, checked.toString());
    
    // Show confirmation toast
    toast({
      title: checked ? "Auto-connect enabled" : "Auto-connect disabled",
      description: checked 
        ? "Your wallet will automatically reconnect when you visit the dashboard." 
        : "You'll need to manually connect your wallet each time.",
      duration: 3000,
    });
  };

  // Function to get saved wallet details from local storage
  const getSavedWalletDetails = () => {
    const savedWallet = localStorage.getItem(LAST_CONNECTED_WALLET_KEY);
    return savedWallet ? JSON.parse(savedWallet) : null;
  };

  // Function to save wallet details to local storage
  const saveWalletDetails = (address: string) => {
    const walletInfo = {
      address,
      timestamp: Date.now(),
    };
    localStorage.setItem(LAST_CONNECTED_WALLET_KEY, JSON.stringify(walletInfo));
  };

  // Attempt to connect to the wallet
  const attemptWalletConnection = async () => {
    try {
      setLastError(null);
      
      // If provider is available, use it directly
      if (window.aetherion) {
        await connectWallet();
        
        // If we have accounts, save the first one
        if (connectedAccounts && connectedAccounts.length > 0) {
          saveWalletDetails(connectedAccounts[0]);
        }
        
        return true;
      }
      
      // Fall back to saved wallet details (for future implementation)
      const savedWallet = getSavedWalletDetails();
      if (savedWallet) {
        // In a real implementation, this might try to connect using the saved details
        await connectWallet();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setLastError((error as Error).message || 'Unknown error connecting to wallet');
      return false;
    }
  };

  // Effect to auto-connect on component mount
  useEffect(() => {
    if (!hasAttemptedAutoConnect && autoConnectEnabled) {
      // Only try to auto-connect once
      setHasAttemptedAutoConnect(true);
      
      // Add a small delay to ensure the blockchain provider is initialized
      const timer = setTimeout(() => {
        attemptWalletConnection().then(success => {
          if (success) {
            toast({
              title: "Wallet connected",
              description: "Your wallet has been automatically connected.",
              duration: 3000,
            });
          }
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [autoConnectEnabled, hasAttemptedAutoConnect]);

  // Effect to notify parent of connection changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(connectionStatus === WalletConnectionStatus.CONNECTED);
    }
  }, [connectionStatus, onConnectionChange]);

  // Handle manual connection
  const handleConnect = async () => {
    const success = await attemptWalletConnection();
    if (!success && !lastError) {
      setLastError('Unable to connect to wallet. Please try again.');
    }
  };

  // Handle manual disconnection
  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected.",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast({
        title: "Error disconnecting",
        description: (error as Error).message || 'Unknown error disconnecting wallet',
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Render different content based on connection status
  const renderConnectionContent = () => {
    switch (connectionStatus) {
      case WalletConnectionStatus.CONNECTED:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck size={20} className="text-green-500" />
                <span className="font-semibold">Connected to Aetherion</span>
              </div>
              <Button variant="ghost" size="sm" className="h-8" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </div>
            
            {connectedAccounts && connectedAccounts.length > 0 && (
              <div className="p-3 rounded-md bg-secondary/30">
                <p className="text-xs font-mono mb-1">Wallet Address:</p>
                <p className="text-sm font-mono truncate">{connectedAccounts[0]}</p>
              </div>
            )}
          </div>
        );
        
      case WalletConnectionStatus.CONNECTING:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Loader2 size={20} className="animate-spin text-blue-500" />
              <span>Connecting to wallet...</span>
            </div>
          </div>
        );
        
      case WalletConnectionStatus.ERROR:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldAlert size={20} className="text-red-500" />
              <span>Connection error</span>
            </div>
            
            {lastError && (
              <div className="p-3 rounded-md bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200">
                <p className="text-sm">{lastError}</p>
              </div>
            )}
            
            <Button onClick={handleConnect} className="w-full">
              Try Again
            </Button>
          </div>
        );
        
      case WalletConnectionStatus.DISCONNECTED:
      default:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <WalletIcon size={20} className="text-gray-500" />
              <span>Not connected</span>
            </div>
            
            <Button onClick={handleConnect} className="w-full">
              Connect Wallet
            </Button>
          </div>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Shield className="h-5 w-5" /> Wallet Connection
            </CardTitle>
            <CardDescription>
              Connect to your Aetherion wallet
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {renderConnectionContent()}
      </CardContent>
      
      <CardFooter className="pt-1 border-t flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Switch 
            id="auto-connect"
            checked={autoConnectEnabled}
            onCheckedChange={handleAutoConnectChange}
          />
          <Label htmlFor="auto-connect" className="text-sm">
            Auto-connect wallet
          </Label>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Using Aetherion secure protocol
        </div>
      </CardFooter>
    </Card>
  );
};

export default AutoConnectWallet;