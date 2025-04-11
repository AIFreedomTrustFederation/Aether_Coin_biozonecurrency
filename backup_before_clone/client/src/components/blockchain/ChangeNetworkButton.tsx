/**
 * ChangeNetworkButton Component
 * 
 * A UI component that allows users to easily switch between Aetherion networks
 * or add the Aetherion network to their connected wallet.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Globe, Network, NetworkIcon, Shield } from 'lucide-react';
import aetherionProvider from '../../core/blockchain/AetherionProvider';
import { default as useWallet } from '../../hooks/useWallet';
import { WalletConnectionStatus } from '../../core/blockchain/types';

// Network configuration data
const AETHERION_NETWORKS = [
  {
    id: 'mainnet',
    name: 'Aetherion Mainnet',
    chainId: '0xa37', // Hex: 2615
    networkId: '2637',
    rpcUrl: 'https://aetherion.network/rpc',
    symbol: 'ATC',
    decimals: 18,
    isDefault: true,
  },
  {
    id: 'testnet',
    name: 'Aetherion Testnet',
    chainId: '0xa38', // Hex: 2616
    networkId: '2638',
    rpcUrl: 'https://testnet.aetherion.network/rpc',
    symbol: 'tATC',
    decimals: 18,
    isDefault: false,
  },
  {
    id: 'quantum',
    name: 'Quantum Test Network',
    chainId: '0xa39', // Hex: 2617
    networkId: '2639',
    rpcUrl: 'https://quantum.aetherion.network/rpc',
    symbol: 'qATC',
    decimals: 18,
    isDefault: false,
  },
  {
    id: 'local',
    name: 'Local Development',
    chainId: '0xa3a', // Hex: 2618
    networkId: '2640',
    rpcUrl: 'http://localhost:8545',
    symbol: 'dATC',
    decimals: 18,
    isDefault: false,
  }
];

interface ChangeNetworkButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

const ChangeNetworkButton: React.FC<ChangeNetworkButtonProps> = ({ 
  variant = 'outline', 
  size = 'default',
  showLabel = true
}) => {
  const { toast } = useToast();
  const { connectionStatus, currentChainId } = useWallet();
  const [isChangingNetwork, setIsChangingNetwork] = useState(false);
  
  // Find current network based on chainId
  const currentNetwork = AETHERION_NETWORKS.find(
    network => network.chainId === currentChainId
  ) || AETHERION_NETWORKS[0];

  // Function to switch networks
  const switchNetwork = async (networkConfig: typeof AETHERION_NETWORKS[0]) => {
    try {
      setIsChangingNetwork(true);
      
      // Check if wallet is connected
      if (connectionStatus !== WalletConnectionStatus.CONNECTED) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }
      
      // Attempt to switch network
      if (window.aetherion) {
        await window.aetherion.request({
          method: 'wallet_switchAetherionChain',
          params: [{ chainId: networkConfig.chainId }]
        });
      } else if (window.ethereum) {
        try {
          // First try to switch to the network (if already added)
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: networkConfig.chainId }]
          });
        } catch (switchError: any) {
          // If the network is not added, add it first
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: networkConfig.chainId,
                chainName: networkConfig.name,
                nativeCurrency: {
                  name: networkConfig.symbol,
                  symbol: networkConfig.symbol,
                  decimals: networkConfig.decimals
                },
                rpcUrls: [networkConfig.rpcUrl]
              }]
            });
          } else {
            throw switchError;
          }
        }
      } else {
        throw new Error('No compatible wallet found');
      }
      
      toast({
        title: "Network Changed",
        description: `Successfully switched to ${networkConfig.name}`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error switching network:', error);
      toast({
        title: "Network Change Failed",
        description: (error as Error).message || 'Failed to switch network',
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsChangingNetwork(false);
    }
  };

  // Get label text based on connection status
  const getLabelText = () => {
    if (connectionStatus !== WalletConnectionStatus.CONNECTED) {
      return 'Connect Wallet';
    }
    
    return currentNetwork.name;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          disabled={isChangingNetwork || connectionStatus !== WalletConnectionStatus.CONNECTED}
          className={`${isChangingNetwork ? 'opacity-70' : ''}`}
        >
          <NetworkIcon className="h-4 w-4 mr-2" />
          {showLabel && getLabelText()}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Aetherion Networks
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {AETHERION_NETWORKS.map(network => (
          <DropdownMenuItem 
            key={network.id}
            disabled={isChangingNetwork || network.chainId === currentChainId}
            className="cursor-pointer"
            onClick={() => switchNetwork(network)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                <span>{network.name}</span>
              </div>
              
              {network.chainId === currentChainId && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChangeNetworkButton;