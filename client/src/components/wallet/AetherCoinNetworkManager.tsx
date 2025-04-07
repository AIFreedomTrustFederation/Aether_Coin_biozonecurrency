/**
 * AetherCoin Network Manager Component
 * 
 * Allows users to add the AetherCoin BioZoeCurrency network to their Web3 wallet
 * Uses the quantum-biological Chain ID and golden ratio principles
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Network, 
  Zap, 
  Check, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GOLDEN_RATIO, PI } from '../../core/biozoe/FractalAlgorithms';

// Network constants using mathematical principles
const QUANTUM_BIO_CHAIN_ID = 137042; // Combining quantum physics constant (137) with Answer to Life (42)
const CHAIN_ID_HEX = `0x${QUANTUM_BIO_CHAIN_ID.toString(16)}`;

const PI_BASED_TESTNET_ID = 314159; // First 6 digits of Pi
const TESTNET_CHAIN_ID_HEX = `0x${PI_BASED_TESTNET_ID.toString(16)}`;

// Golden Ratio Chain ID (for alternative network)
const GOLDEN_RATIO_CHAIN_ID = Math.round(GOLDEN_RATIO * 100000); // 161803
const GOLDEN_RATIO_CHAIN_ID_HEX = `0x${GOLDEN_RATIO_CHAIN_ID.toString(16)}`;

// Network configurations
const AETHERCOIN_NETWORK = {
  chainId: CHAIN_ID_HEX,
  chainName: 'AetherCoin BioZoe Network',
  nativeCurrency: {
    name: 'AetherCoin',
    symbol: 'ATC',
    decimals: 18
  },
  rpcUrls: ['https://rpc.aethercoin.network'],
  blockExplorerUrls: ['https://explorer.aethercoin.network']
};

// Test network with Pi-based parameters
const AETHERCOIN_TESTNET = {
  chainId: TESTNET_CHAIN_ID_HEX,
  chainName: 'AetherCoin BioZoe Testnet',
  nativeCurrency: {
    name: 'Test AetherCoin',
    symbol: 'tATC',
    decimals: 18
  },
  rpcUrls: ['https://testnet-rpc.aethercoin.network'],
  blockExplorerUrls: ['https://testnet-explorer.aethercoin.network']
};

// Golden Ratio alternative network
const AETHERCOIN_GOLDEN_NETWORK = {
  chainId: GOLDEN_RATIO_CHAIN_ID_HEX,
  chainName: 'AetherCoin Golden Network',
  nativeCurrency: {
    name: 'AetherCoin',
    symbol: 'ATC',
    decimals: 18
  },
  rpcUrls: ['https://golden-rpc.aethercoin.network'],
  blockExplorerUrls: ['https://golden-explorer.aethercoin.network']
};

export const AetherCoinNetworkManager: React.FC = () => {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // For custom network
  const [customNetworkName, setCustomNetworkName] = useState('');
  const [customRpcUrl, setCustomRpcUrl] = useState('');
  const [customChainId, setCustomChainId] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');
  const [customExplorerUrl, setCustomExplorerUrl] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  
  // Check if user is on AetherCoin network
  async function checkNetwork() {
    if (!window.ethereum) return false;
    
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId === AETHERCOIN_NETWORK.chainId) {
        setCurrentNetwork('mainnet');
        return true;
      } else if (chainId === AETHERCOIN_TESTNET.chainId) {
        setCurrentNetwork('testnet');
        return true;
      } else if (chainId === AETHERCOIN_GOLDEN_NETWORK.chainId) {
        setCurrentNetwork('golden');
        return true;
      } else {
        setCurrentNetwork(null);
        return false;
      }
    } catch (error) {
      console.error("Failed to check network:", error);
      return false;
    }
  }

  useEffect(() => {
    checkNetwork();
  }, []);
  
  // Add AetherCoin Network to wallet
  async function addAetherCoinNetwork(networkType: 'mainnet' | 'testnet' | 'golden' | 'custom' = 'mainnet') {
    if (!window.ethereum) {
      setError("Please install a Web3 wallet like MetaMask to connect to the AetherCoin BioZoeCurrency network.");
      return;
    }
    
    let networkConfig;
    
    switch (networkType) {
      case 'testnet':
        networkConfig = AETHERCOIN_TESTNET;
        break;
      case 'golden':
        networkConfig = AETHERCOIN_GOLDEN_NETWORK;
        break;
      case 'custom':
        networkConfig = {
          chainId: `0x${parseInt(customChainId).toString(16)}`,
          chainName: customNetworkName,
          nativeCurrency: {
            name: customNetworkName,
            symbol: customSymbol,
            decimals: 18
          },
          rpcUrls: [customRpcUrl],
          blockExplorerUrls: customExplorerUrl ? [customExplorerUrl] : undefined
        };
        break;
      default:
        networkConfig = AETHERCOIN_NETWORK;
    }
    
    setIsAdding(true);
    setError(null);
    
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkConfig]
      });
      
      toast({
        title: "Network Added",
        description: `${networkConfig.chainName} has been added to your wallet.`,
        variant: "default"
      });
      
      await checkNetwork();
    } catch (error: any) {
      console.error("Failed to add network:", error);
      setError(error.message || "Failed to add network. Please try again.");
      
      toast({
        title: "Network Addition Failed",
        description: error.message || "There was an error adding the network to your wallet.",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  }
  
  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: description,
      variant: "default"
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle>AetherCoin BioZoe Network</CardTitle>
          </div>
          {currentNetwork && (
            <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
              <Check className="h-3 w-3" />
              <span>Connected to {currentNetwork === 'mainnet' ? 'Mainnet' : 
                     currentNetwork === 'testnet' ? 'Testnet' : 'Golden Network'}</span>
            </Badge>
          )}
        </div>
        <CardDescription>
          Connect to the AetherCoin BioZoeCurrency network to interact with ATC tokens
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-3">
          {/* Main Network */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <h3 className="font-medium">Quantum Biological Network</h3>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-mono flex items-center gap-1">
                        <span>ID: {QUANTUM_BIO_CHAIN_ID}</span>
                        <Copy 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => copyToClipboard(
                            QUANTUM_BIO_CHAIN_ID.toString(), 
                            "Chain ID copied to clipboard"
                          )} 
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Quantum Biological Chain ID combines the Fine Structure Constant (137) with the Answer to Life (42)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                The primary AetherCoin network utilizing quantum entanglement and biological growth principles.
              </p>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div className="flex items-center gap-1 text-muted-foreground">
                  Symbol:
                </div>
                <div className="font-medium">ATC</div>
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  RPC URL:
                </div>
                <div className="font-mono text-xs flex items-center gap-1 truncate">
                  https://rpc.aethercoin.network
                  <Copy 
                    className="h-3 w-3 cursor-pointer flex-shrink-0" 
                    onClick={() => copyToClipboard(
                      "https://rpc.aethercoin.network", 
                      "RPC URL copied to clipboard"
                    )} 
                  />
                </div>
                
                <div className="flex items-center gap-1 text-muted-foreground">
                  Explorer:
                </div>
                <div className="font-mono text-xs flex items-center gap-1 truncate">
                  https://explorer.aethercoin.network
                  <ExternalLink 
                    className="h-3 w-3 cursor-pointer flex-shrink-0" 
                    onClick={() => window.open("https://explorer.aethercoin.network", "_blank")}
                  />
                </div>
              </div>
              
              <Button 
                onClick={() => addAetherCoinNetwork('mainnet')} 
                disabled={isAdding || currentNetwork === 'mainnet'}
                className="w-full"
                variant={currentNetwork === 'mainnet' ? 'outline' : 'default'}
              >
                {isAdding ? 'Adding...' : currentNetwork === 'mainnet' ? 'Connected' : 'Add to Wallet'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Test Network */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium">Pi-Based Testnet</h3>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-mono flex items-center gap-1">
                        <span>ID: {PI_BASED_TESTNET_ID}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Chain ID based on the first 6 digits of Pi (3.14159)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Testing network with free tokens for development and experimentation.
              </p>
              
              <Button 
                onClick={() => addAetherCoinNetwork('testnet')} 
                disabled={isAdding || currentNetwork === 'testnet'}
                className="w-full"
                variant="outline"
              >
                {isAdding ? 'Adding...' : currentNetwork === 'testnet' ? 'Connected' : 'Add Testnet'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Golden Ratio Network */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  <h3 className="font-medium">Golden Ratio Network</h3>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-mono flex items-center gap-1">
                        <span>ID: {GOLDEN_RATIO_CHAIN_ID}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Chain ID based on the Golden Ratio (φ ≈ 1.618033...)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Alternative network focusing on Golden Ratio principles and harmonic growth patterns.
              </p>
              
              <Button 
                onClick={() => addAetherCoinNetwork('golden')} 
                disabled={isAdding || currentNetwork === 'golden'}
                className="w-full"
                variant="outline"
              >
                {isAdding ? 'Adding...' : currentNetwork === 'golden' ? 'Connected' : 'Add Golden Network'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Custom Network Button */}
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => setShowCustomForm(!showCustomForm)}
          >
            {showCustomForm ? 'Hide Custom Network Form' : 'Add Custom BioZoe Network'}
          </Button>
          
          {/* Custom Network Form */}
          {showCustomForm && (
            <Card className="border-dashed">
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Custom BioZoe Network</h3>
                
                <div className="space-y-3">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="network-name">Network Name</Label>
                    <Input
                      id="network-name"
                      placeholder="Network Name (optional)"
                      value={customNetworkName}
                      onChange={(e) => setCustomNetworkName(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="rpc-url">RPC URL</Label>
                    <Input
                      id="rpc-url"
                      placeholder="https://"
                      value={customRpcUrl}
                      onChange={(e) => setCustomRpcUrl(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="chain-id">Chain ID</Label>
                    <Input
                      id="chain-id"
                      placeholder="Chain ID"
                      value={customChainId}
                      onChange={(e) => setCustomChainId(e.target.value.replace(/[^0-9]/g, ''))}
                      required
                    />
                  </div>
                  
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="Token Symbol"
                      value={customSymbol}
                      onChange={(e) => setCustomSymbol(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="explorer">Explorer URL (Optional)</Label>
                    <Input
                      id="explorer"
                      placeholder="https://"
                      value={customExplorerUrl}
                      onChange={(e) => setCustomExplorerUrl(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={() => addAetherCoinNetwork('custom')} 
                    disabled={isAdding || !customRpcUrl || !customChainId || !customSymbol}
                    className="w-full mt-2"
                  >
                    {isAdding ? 'Adding...' : 'Add Custom Network'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Help Text */}
        <Alert variant="default" className="bg-primary/5 border-primary/10">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle>About AetherCoin BioZoeCurrency</AlertTitle>
          <AlertDescription className="text-sm">
            AetherCoin (ATC) is the world's first BioZoeCurrency - a quantum-entangled living token
            ecosystem that grows through natural lifecycle phases following Mandelbrot recursive,
            Fibonacci sequence, and Golden Ratio patterns.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AetherCoinNetworkManager;