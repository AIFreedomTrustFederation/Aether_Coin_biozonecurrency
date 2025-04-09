import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  getNetworkConfig,
  AETHER_COIN_CONFIG,
  AETHER_TESTNET_CONFIG 
} from '../../config/blockchain-config';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Check, ExternalLink, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface NetworkParams {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

const AddAetherNetwork: React.FC = () => {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [networkType, setNetworkType] = useState<'mainnet' | 'testnet'>('mainnet');
  const [dialogOpen, setDialogOpen] = useState(false);

  // Check if MetaMask or other web3 wallet is available
  const hasWeb3Wallet = typeof window !== 'undefined' && window.ethereum !== undefined;

  const getNetworkParams = (): NetworkParams => {
    const config = networkType === 'mainnet' ? AETHER_COIN_CONFIG : AETHER_TESTNET_CONFIG;
    
    return {
      chainId: config.chainId,
      chainName: config.networkName,
      nativeCurrency: {
        name: networkType === 'mainnet' ? 'AetherCoin' : 'Test AetherCoin',
        symbol: config.symbol,
        decimals: config.decimals,
      },
      rpcUrls: [config.rpcUrl],
      blockExplorerUrls: [config.blockExplorerUrl]
    };
  };

  const addAetherNetworkToWallet = async () => {
    if (!hasWeb3Wallet) {
      toast({
        title: 'No Web3 Wallet Detected',
        description: 'Please install MetaMask or another Web3 wallet to add the AetherCoin network.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsAdding(true);
    
    try {
      const params = getNetworkParams();
      
      if (!window.ethereum) {
        throw new Error('No Web3 wallet detected');
      }
      
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [params],
      });
      
      toast({
        title: 'Success!',
        description: `${params.chainName} has been added to your wallet.`,
      });
      
      // Close the dialog after successful addition
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error adding AetherCoin network to wallet:', error);
      
      if (error.code === 4001) {
        // User rejected the request
        toast({
          title: 'Request Rejected',
          description: 'You declined the request to add the AetherCoin network to your wallet.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error Adding Network',
          description: error.message || 'Could not add AetherCoin network to your wallet.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsAdding(false);
    }
  };

  const switchToAetherNetwork = async () => {
    if (!hasWeb3Wallet) {
      toast({
        title: 'No Web3 Wallet Detected',
        description: 'Please install MetaMask or another Web3 wallet to switch networks.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsAdding(true);
    
    try {
      const config = networkType === 'mainnet' ? AETHER_COIN_CONFIG : AETHER_TESTNET_CONFIG;
      
      if (!window.ethereum) {
        throw new Error('No Web3 wallet detected');
      }
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: config.chainId }],
      });
      
      toast({
        title: 'Success!',
        description: `Switched to ${config.networkName}.`,
      });
      
      // Close the dialog
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error switching to AetherCoin network:', error);
      
      // If the error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        // Chain doesn't exist, so add it
        await addAetherNetworkToWallet();
      } else if (error.code === 4001) {
        // User rejected the request
        toast({
          title: 'Request Rejected',
          description: 'You declined the request to switch networks.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error Switching Network',
          description: error.message || 'Could not switch to AetherCoin network.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsAdding(false);
    }
  };

  const copyNetworkDetails = () => {
    const config = networkType === 'mainnet' ? AETHER_COIN_CONFIG : AETHER_TESTNET_CONFIG;
    const details = `Network Name: ${config.networkName}
RPC URL: ${config.rpcUrl}
Chain ID: ${config.chainId}
Symbol: ${config.symbol}
Block Explorer URL: ${config.blockExplorerUrl}`;

    navigator.clipboard.writeText(details).then(
      () => {
        toast({
          title: 'Copied!',
          description: 'Network details copied to clipboard.'
        });
      },
      () => {
        toast({
          title: 'Failed to copy',
          description: 'Could not copy network details to clipboard.',
          variant: 'destructive'
        });
      }
    );
  };

  return (
    <>
      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-medium mb-2">Connect to AetherCoin Network</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add the AetherCoin blockchain to your Web3 wallet automatically.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                Add AetherCoin Network
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add AetherCoin Network</DialogTitle>
                <DialogDescription>
                  Connect your wallet to the AetherCoin blockchain network.
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="mb-4">
                  <Label htmlFor="network-select">Select Network</Label>
                  <Select 
                    value={networkType} 
                    onValueChange={(value) => setNetworkType(value as 'mainnet' | 'testnet')}
                  >
                    <SelectTrigger id="network-select">
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mainnet">AetherCoin MainNet</SelectItem>
                      <SelectItem value="testnet">AetherCoin TestNet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Network:</span>
                        <span className="text-sm">
                          {networkType === 'mainnet' ? AETHER_COIN_CONFIG.networkName : AETHER_TESTNET_CONFIG.networkName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">RPC URL:</span>
                        <span className="text-sm font-mono">
                          {networkType === 'mainnet' ? AETHER_COIN_CONFIG.rpcUrl : AETHER_TESTNET_CONFIG.rpcUrl}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Chain ID:</span>
                        <span className="text-sm font-mono">
                          {networkType === 'mainnet' ? AETHER_COIN_CONFIG.chainId : AETHER_TESTNET_CONFIG.chainId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Symbol:</span>
                        <span className="text-sm">
                          {networkType === 'mainnet' ? AETHER_COIN_CONFIG.symbol : AETHER_TESTNET_CONFIG.symbol}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {!hasWeb3Wallet && (
                  <div className="mt-4 p-3 border rounded-md bg-amber-50 dark:bg-amber-950/30">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        No Web3 wallet detected. Please install MetaMask or another compatible wallet to 
                        add the AetherCoin network automatically.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={copyNetworkDetails} 
                  className="w-full sm:w-auto"
                >
                  Copy Details
                </Button>
                
                <Button
                  onClick={addAetherNetworkToWallet}
                  disabled={isAdding || !hasWeb3Wallet}
                  className="w-full sm:w-auto"
                >
                  {isAdding ? 'Adding...' : 'Add Network'}
                </Button>
                
                <Button 
                  onClick={switchToAetherNetwork} 
                  disabled={isAdding || !hasWeb3Wallet} 
                  className="w-full sm:w-auto"
                >
                  {isAdding ? 'Switching...' : 'Switch Network'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={() => window.open(getNetworkConfig().blockExplorerUrl, '_blank')}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Block Explorer
          </Button>
        </div>
      </div>
    </>
  );
};

export default AddAetherNetwork;