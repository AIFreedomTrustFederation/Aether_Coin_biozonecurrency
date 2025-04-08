/**
 * Network Info Component
 * 
 * Displays information about the Aetherion blockchain network
 * and allows users to easily copy configuration details
 */

import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Network configuration data
const AETHERION_NETWORKS = [
  {
    id: 'mainnet',
    name: 'Aetherion Mainnet',
    chainId: '0xa37', // Hex: 2615
    networkId: '2637',
    rpcUrl: 'https://aetherion.network/rpc',
    explorerUrl: 'https://scan.aetherion.network',
    symbol: 'ATC',
    decimals: 18,
    blockTime: 12,
    isDefault: true,
  },
  {
    id: 'testnet',
    name: 'Aetherion Testnet',
    chainId: '0xa38', // Hex: 2616
    networkId: '2638',
    rpcUrl: 'https://testnet.aetherion.network/rpc',
    explorerUrl: 'https://testscan.aetherion.network',
    symbol: 'tATC',
    decimals: 18,
    blockTime: 6,
    isDefault: false,
  },
  {
    id: 'quantum',
    name: 'Quantum Test Network',
    chainId: '0xa39', // Hex: 2617
    networkId: '2639',
    rpcUrl: 'https://quantum.aetherion.network/rpc',
    explorerUrl: 'https://quantum-scan.aetherion.network',
    symbol: 'qATC',
    decimals: 18,
    blockTime: 3,
    isDefault: false,
  },
  {
    id: 'local',
    name: 'Local Development',
    chainId: '0xa3a', // Hex: 2618
    networkId: '2640',
    rpcUrl: 'http://localhost:8545',
    explorerUrl: '',
    symbol: 'dATC',
    decimals: 18,
    blockTime: 1,
    isDefault: false,
  }
];

/**
 * Network Info component
 */
const NetworkInfo: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>(AETHERION_NETWORKS[0].id);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Get the currently selected network
  const selectedNetwork = AETHERION_NETWORKS.find(n => n.id === activeTab) || AETHERION_NETWORKS[0];

  // Handle copying to clipboard
  const handleCopy = (value: string, fieldName: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(fieldName);

    toast({
      title: "Copied to clipboard",
      description: `${fieldName} has been copied to your clipboard.`,
      duration: 2000,
    });

    // Reset the copied field after 2 seconds
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Add network to wallet
  const addToWallet = async () => {
    try {
      if (window.aetherion) {
        await window.aetherion.request({
          method: 'wallet_addAetherionChain',
          params: [{
            chainId: selectedNetwork.chainId,
            chainName: selectedNetwork.name,
            nativeCurrency: {
              name: selectedNetwork.symbol,
              symbol: selectedNetwork.symbol,
              decimals: selectedNetwork.decimals
            },
            rpcUrls: [selectedNetwork.rpcUrl],
            blockExplorerUrls: selectedNetwork.explorerUrl ? [selectedNetwork.explorerUrl] : undefined,
          }]
        });
        toast({
          title: "Network Added",
          description: `${selectedNetwork.name} has been added to your wallet.`,
          duration: 3000,
        });
      } else if (window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: selectedNetwork.chainId,
            chainName: selectedNetwork.name,
            nativeCurrency: {
              name: selectedNetwork.symbol,
              symbol: selectedNetwork.symbol,
              decimals: selectedNetwork.decimals
            },
            rpcUrls: [selectedNetwork.rpcUrl],
            blockExplorerUrls: selectedNetwork.explorerUrl ? [selectedNetwork.explorerUrl] : undefined,
          }]
        });
        toast({
          title: "Network Added",
          description: `${selectedNetwork.name} has been added to your wallet.`,
          duration: 3000,
        });
      } else {
        toast({
          title: "Wallet Not Found",
          description: "No compatible wallet was detected. Please install a Web3 wallet.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error adding network:', error);
      toast({
        title: "Error Adding Network",
        description: "There was an error adding the network to your wallet. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Open block explorer
  const openExplorer = () => {
    if (selectedNetwork.explorerUrl) {
      window.open(selectedNetwork.explorerUrl, '_blank');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Aetherion Network Information</CardTitle>
        <CardDescription>
          View and copy network connection details to connect to the Aetherion blockchain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={AETHERION_NETWORKS[0].id} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            {AETHERION_NETWORKS.map(network => (
              <TabsTrigger key={network.id} value={network.id}>
                {network.name.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {AETHERION_NETWORKS.map(network => (
            <TabsContent key={network.id} value={network.id} className="space-y-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="network-name">Network Name</Label>
                  <div className="flex gap-2">
                    <Input
                      id="network-name"
                      value={network.name}
                      readOnly
                      className="flex-grow"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(network.name, 'Network Name')}
                    >
                      {copiedField === 'Network Name' ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="rpc-url">RPC URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="rpc-url"
                      value={network.rpcUrl}
                      readOnly
                      className="flex-grow"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(network.rpcUrl, 'RPC URL')}
                    >
                      {copiedField === 'RPC URL' ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="chain-id">Chain ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="chain-id"
                      value={network.chainId}
                      readOnly
                      className="flex-grow"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(network.chainId, 'Chain ID')}
                    >
                      {copiedField === 'Chain ID' ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <div className="flex gap-2">
                    <Input
                      id="symbol"
                      value={network.symbol}
                      readOnly
                      className="flex-grow"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(network.symbol, 'Symbol')}
                    >
                      {copiedField === 'Symbol' ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>

                {network.explorerUrl && (
                  <div className="grid gap-2">
                    <Label htmlFor="explorer-url">Block Explorer URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="explorer-url"
                        value={network.explorerUrl}
                        readOnly
                        className="flex-grow"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(network.explorerUrl, 'Explorer URL')}
                      >
                        {copiedField === 'Explorer URL' ? <Check size={16} /> : <Copy size={16} />}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-6">
                  <Button className="flex-grow" onClick={addToWallet}>
                    Add to Wallet
                  </Button>
                  {network.explorerUrl && (
                    <Button variant="outline" className="flex gap-2" onClick={openExplorer}>
                      <ExternalLink size={16} /> Block Explorer
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NetworkInfo;