/**
 * Mining Control Component
 * 
 * A comprehensive UI for controlling blockchain mining operations
 * with support for CPU and GPU mining, algorithm selection, and
 * real-time performance monitoring.
 */

import React, { useState, useEffect } from 'react';
import { blockchainService } from '../../core/blockchain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Cpu, Gauge, Zap, AlertTriangle, Info, HardDrive, BarChart3, Clock, Settings, RefreshCw, Power } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MiningControl() {
  const [isMining, setIsMining] = useState(false);
  const [miningMethod, setMiningMethod] = useState<'cpu' | 'gpu'>('cpu');
  const [cpuThreads, setCpuThreads] = useState(4);
  const [cpuPriority, setCpuPriority] = useState(50); // 0-100
  const [algorithm, setAlgorithm] = useState('quantum-resistant');
  const [autoAdjustDifficulty, setAutoAdjustDifficulty] = useState(true);
  const [difficulty, setDifficulty] = useState(4);
  const [hashRate, setHashRate] = useState(0);
  const [totalHashes, setTotalHashes] = useState(0);
  const [lastMinedBlock, setLastMinedBlock] = useState<any>(null);
  const [blockReward, setBlockReward] = useState(50);
  const [pendingTxCount, setPendingTxCount] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [availableWallets, setAvailableWallets] = useState<any[]>([]);
  const [networkStats, setNetworkStats] = useState({
    difficulty: 4,
    blockTime: 60, // target block time in seconds
    lastBlockTime: 0,
    networkHashRate: 0,
  });
  const { toast } = useToast();
  
  // Initialize data
  useEffect(() => {
    // Get available wallets
    const wallets = blockchainService.getAllWallets();
    setAvailableWallets(wallets);
    
    // Set mining wallet to first wallet if available
    if (wallets.length > 0) {
      setWalletAddress(wallets[0].address);
    }
    
    // Set up interval to update mining stats
    const interval = setInterval(() => {
      if (isMining) {
        // Simulate mining stats for development purposes
        // This will be replaced with actual blockchain data when available
        setHashRate(prevHashRate => prevHashRate + Math.random() * 50);
        setTotalHashes(prevHashes => prevHashes + Math.floor(Math.random() * 1000));
        
        // Get blockchain state (includes difficulty)
        const blockchainState = blockchainService.getBlockchainState();
        setDifficulty(blockchainState.difficulty);
        
        // Get pending transactions count from blockchain state
        setPendingTxCount(blockchainState.pendingTransactions.length);
      }
      
      // Get network stats regardless of mining state
      // For now, we'll use simulated data until we have actual methods
      setNetworkStats(prev => ({
        ...prev,
        lastBlockTime: prev.lastBlockTime + 1 > prev.blockTime ? 0 : prev.lastBlockTime + 1
      }));
      
      // When we have proper event handling, this would come from the real blockchain
      // For now, we'll use the blockchain state
      const blockchainState = blockchainService.getBlockchainState();
      if (blockchainState.chain.length > 0) {
        const latestBlock = blockchainState.chain[blockchainState.chain.length - 1];
        if (!lastMinedBlock || latestBlock.hash !== lastMinedBlock.hash) {
          setLastMinedBlock(latestBlock);
          
          if (isMining && lastMinedBlock) { // Only show notification if we were mining and not first load
            // Show toast notification for new block
            toast({
              title: "New Block Mined!",
              description: `Block #${latestBlock.index} has been successfully mined`,
              variant: "default",
            });
          }
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isMining, lastMinedBlock]);
  
  // Handle mining start/stop
  const toggleMining = () => {
    if (!walletAddress) {
      toast({
        title: "No wallet selected",
        description: "Please select a wallet to receive mining rewards",
        variant: "destructive",
      });
      return;
    }
    
    if (isMining) {
      // Stop mining
      blockchainService.stopMining();
      setIsMining(false);
      toast({
        title: "Mining stopped",
        description: `Mining operations have been stopped`,
      });
    } else {
      // Start mining with the current wallet address
      // We pass any needed configuration through startMining directly
      const config = {
        threads: cpuThreads,
        algorithm: algorithm
      };
      
      blockchainService.startMining(config);
      setIsMining(true);
      toast({
        title: "Mining started",
        description: `Mining with ${miningMethod.toUpperCase()} using ${algorithm} algorithm`,
      });
    }
  };
  
  // Handle mining method change
  const handleMiningMethodChange = (method: 'cpu' | 'gpu') => {
    setMiningMethod(method);
    // We'll update the method directly in the component state
    // The actual mining configuration will be applied when mining starts
  };
  
  // Handle CPU threads change
  const handleThreadsChange = (value: number[]) => {
    const threads = value[0];
    setCpuThreads(threads);
    // We'll update thread count in the component state
    // The actual mining configuration will be applied when mining starts
  };
  
  // Handle algorithm change
  const handleAlgorithmChange = (value: string) => {
    setAlgorithm(value);
    // We'll update algorithm in the component state
    // The actual mining configuration will be applied when mining starts
  };
  
  // Handle wallet change
  const handleWalletChange = (value: string) => {
    setWalletAddress(value);
    // We'll update wallet address in the component state
    // The actual mining configuration will be applied when mining starts
  };
  
  // Format hash rate for display
  const formatHashRate = (hashRate: number) => {
    if (hashRate < 1000) {
      return `${hashRate.toFixed(2)} H/s`;
    } else if (hashRate < 1000000) {
      return `${(hashRate / 1000).toFixed(2)} kH/s`;
    } else {
      return `${(hashRate / 1000000).toFixed(2)} MH/s`;
    }
  };
  
  // Format large numbers with comma separators
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" /> Mining Control
          </CardTitle>
          <CardDescription>
            Mine new blocks and earn rewards on the Aetherion blockchain
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Mining Status */}
          <div className="bg-primary/5 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <Power className="h-4 w-4 text-primary" /> Mining Status
              </h3>
              <Badge variant={isMining ? "outline" : "secondary"} className="capitalize">
                {isMining ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Hash Rate</p>
                <p className="font-medium">{formatHashRate(hashRate)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Difficulty</p>
                <p className="font-medium">{difficulty}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Reward</p>
                <p className="font-medium">{blockReward} AE</p>
              </div>
            </div>
            
            <Button 
              onClick={toggleMining} 
              variant={isMining ? "outline" : "default"} 
              className="w-full"
            >
              {isMining ? (
                <>
                  <Power className="mr-2 h-4 w-4" /> Stop Mining
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" /> Start Mining
                </>
              )}
            </Button>
          </div>
          
          {/* Mining Method Selection */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-1.5">
              <Settings className="h-4 w-4 text-primary" /> Mining Configuration
            </h3>
            <Tabs defaultValue="cpu" onValueChange={(v) => handleMiningMethodChange(v as 'cpu' | 'gpu')}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="cpu" className="flex items-center gap-1.5">
                  <Cpu className="h-4 w-4" /> CPU Mining
                </TabsTrigger>
                <TabsTrigger value="gpu" className="flex items-center gap-1.5">
                  <HardDrive className="h-4 w-4" /> GPU Mining
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="cpu" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="cpu-threads">CPU Threads: {cpuThreads}</Label>
                    <span className="text-xs text-muted-foreground">
                      {navigator.hardwareConcurrency} available
                    </span>
                  </div>
                  <Slider 
                    id="cpu-threads"
                    min={1} 
                    max={navigator.hardwareConcurrency || 8} 
                    step={1} 
                    value={[cpuThreads]} 
                    onValueChange={handleThreadsChange}
                    disabled={isMining}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="cpu-priority">Mining Priority: {cpuPriority}%</Label>
                  </div>
                  <Slider 
                    id="cpu-priority"
                    min={10} 
                    max={100} 
                    step={10} 
                    value={[cpuPriority]} 
                    onValueChange={(value) => setCpuPriority(value[0])}
                    disabled={isMining}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower priority allows other apps to run more smoothly
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="gpu" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gpu-device">GPU Device</Label>
                  <Select
                    disabled={isMining || true} // Currently disabled for demo
                    value="default"
                    onValueChange={() => {}}
                  >
                    <SelectTrigger id="gpu-device">
                      <SelectValue placeholder="Select GPU" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default GPU</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    GPU detection requires hardware permissions
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="gpu-intensity">GPU Intensity: 80%</Label>
                  </div>
                  <Slider 
                    id="gpu-intensity"
                    min={10} 
                    max={100} 
                    step={10} 
                    defaultValue={[80]} 
                    disabled={isMining || true} // Currently disabled for demo
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher intensity increases heat and power consumption
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Wallet and Algorithm Selection */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reward-wallet">Reward Wallet</Label>
              <Select
                value={walletAddress}
                onValueChange={handleWalletChange}
                disabled={isMining}
              >
                <SelectTrigger id="reward-wallet">
                  <SelectValue placeholder="Select wallet for rewards" />
                </SelectTrigger>
                <SelectContent>
                  {availableWallets.map(wallet => (
                    <SelectItem key={wallet.address} value={wallet.address}>
                      {wallet.name || 'Wallet'} ({wallet.address.substring(0, 8)}...)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableWallets.length === 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 text-yellow-500">
                  <AlertTriangle className="h-3 w-3" />
                  No wallets available. Create a wallet to receive mining rewards.
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="algorithm">Mining Algorithm</Label>
              <Select
                value={algorithm}
                onValueChange={handleAlgorithmChange}
                disabled={isMining}
              >
                <SelectTrigger id="algorithm">
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quantum-resistant">Quantum Resistant (Default)</SelectItem>
                  <SelectItem value="sha256">SHA-256</SelectItem>
                  <SelectItem value="keccak">Keccak-256</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Quantum Resistant is more secure but may be slower
              </p>
            </div>
            
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col">
                <Label htmlFor="auto-difficulty" className="mb-1">Auto-adjust Difficulty</Label>
                <p className="text-xs text-muted-foreground">Automatically adapt to network changes</p>
              </div>
              <Switch
                id="auto-difficulty"
                checked={autoAdjustDifficulty}
                onCheckedChange={setAutoAdjustDifficulty}
                disabled={isMining}
              />
            </div>
          </div>
          
          {/* Advanced Options (Only when not mining) */}
          {!isMining && (
            <div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium flex items-center gap-1.5">
                  <Settings className="h-4 w-4 text-primary" /> Advanced Options
                </h3>
              </div>
              
              <RadioGroup defaultValue="regular" className="grid grid-cols-1 gap-2">
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="regular" id="regular" />
                  <Label htmlFor="regular" className="flex flex-col">
                    <span>Regular Mining</span>
                    <span className="text-xs text-muted-foreground">
                      Process transactions and create new blocks (Recommended)
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="solo" id="solo" />
                  <Label htmlFor="solo" className="flex flex-col">
                    <span>Solo Mining</span>
                    <span className="text-xs text-muted-foreground">
                      Mine blocks without processing transactions
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </CardContent>
        
        {isMining && (
          <CardFooter className="flex flex-col border-t pt-6 px-6">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-1.5 w-full">
              <BarChart3 className="h-4 w-4 text-primary" /> Mining Statistics
            </h3>
            
            <div className="w-full space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total Hashes</p>
                  <p className="font-medium">{formatNumber(totalHashes)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending Transactions</p>
                  <p className="font-medium">{pendingTxCount}</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-xs text-muted-foreground">Network Target</p>
                  <p className="text-xs">{(1 / networkStats.blockTime * 60).toFixed(1)} blocks/hour</p>
                </div>
                <Progress value={(networkStats.lastBlockTime / networkStats.blockTime) * 100} />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Next block estimate
                  </p>
                  <p className="text-xs">
                    {Math.max(0, networkStats.blockTime - networkStats.lastBlockTime).toFixed(0)}s
                  </p>
                </div>
              </div>
              
              {lastMinedBlock && (
                <div className="bg-primary/5 p-3 rounded-lg space-y-1">
                  <div className="flex justify-between">
                    <p className="text-xs font-medium">Last Mined Block</p>
                    <p className="text-xs">#{lastMinedBlock.index}</p>
                  </div>
                  <p className="text-xs font-mono truncate">{lastMinedBlock.hash.substring(0, 20)}...</p>
                  <div className="flex justify-between">
                    <p className="text-xs text-muted-foreground">Reward</p>
                    <p className="text-xs font-medium">{blockReward} AE</p>
                  </div>
                </div>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
      
      {/* Tooltip Provider for the entire component */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-primary/5 p-4 rounded-lg border flex items-center justify-between cursor-help">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Network Difficulty</h3>
                  <p className="text-sm text-muted-foreground">Current: {networkStats.difficulty}</p>
                </div>
              </div>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Network difficulty adjusts every 10 blocks to maintain a target block time of 60 seconds</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}