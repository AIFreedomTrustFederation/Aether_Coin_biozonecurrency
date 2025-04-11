import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Database, 
  Layers, 
  Clock, 
  Shield, 
  ArrowRightLeft, 
  FileText, 
  BarChart3,
  User,
  Cpu,
  Coins,
  Wind
} from 'lucide-react';

interface BlockchainDetails {
  name: string;
  symbol: string;
  tagline: string;
  description: string;
  type: 'Layer 1' | 'Layer 2';
  icon: React.ReactNode;
  latestBlock: number;
  totalTransactions: string;
  activeNodes: number;
  marketCap: string;
  supplyInfo: string;
  color: string;
}

const BlockchainExplorer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBlockchain, setActiveBlockchain] = useState('singularity');
  
  const blockchains: Record<string, BlockchainDetails> = {
    singularity: {
      name: 'Singularity Coin',
      symbol: 'SING',
      tagline: 'Secure Intelligent Networked Gateway',
      description: 'Layer 1 quantum-resistant blockchain with fractal security architecture',
      type: 'Layer 1',
      icon: <Shield className="h-5 w-5" />,
      latestBlock: 4392801,
      totalTransactions: '129.4M',
      activeNodes: 2842,
      marketCap: '$1.28B',
      supplyInfo: '310M SING / 1B max',
      color: 'bg-blue-500/10 text-blue-500'
    },
    fractalcoin: {
      name: 'FractalCoin',
      symbol: 'FTC',
      tagline: 'Fractal Tokenized Currency',
      description: 'Layer 2 solution with recursive sharding for maximum scalability',
      type: 'Layer 2',
      icon: <Layers className="h-5 w-5" />,
      latestBlock: 8731902,
      totalTransactions: '482.7M',
      activeNodes: 5128,
      marketCap: '$742.5M',
      supplyInfo: '628M FTC / 2.5B max',
      color: 'bg-purple-500/10 text-purple-500'
    },
    aicoin: {
      name: 'AICoin',
      symbol: 'ICON',
      tagline: 'Intelligent Coin Optimizing Networks',
      description: 'Specialized network for AI computation and training incentivization',
      type: 'Layer 2',
      icon: <Cpu className="h-5 w-5" />,
      latestBlock: 2981245,
      totalTransactions: '98.3M',
      activeNodes: 1687,
      marketCap: '$384.2M',
      supplyInfo: '210M ICON / 800M max',
      color: 'bg-emerald-500/10 text-emerald-500'
    },
    winnation: {
      name: 'WINNation Coin',
      symbol: 'WIN',
      tagline: 'Wealth Integration Network',
      description: 'Governance token for the AI Freedom Trust Federation of Tribes',
      type: 'Layer 2',
      icon: <Wind className="h-5 w-5" />,
      latestBlock: 1489302,
      totalTransactions: '42.1M',
      activeNodes: 1024,
      marketCap: '$157.9M',
      supplyInfo: '185M WIN / 1B max',
      color: 'bg-amber-500/10 text-amber-500'
    },
    iulcoin: {
      name: 'IUL Coin',
      symbol: 'IULC',
      tagline: 'Indexed Universal Life Coin',
      description: 'Specialized token for managing Indexed Universal Life systems and loan recycling',
      type: 'Layer 2',
      icon: <Coins className="h-5 w-5" />,
      latestBlock: 892481,
      totalTransactions: '18.5M',
      activeNodes: 576,
      marketCap: '$92.4M',
      supplyInfo: '120M IULC / 500M max',
      color: 'bg-sky-500/10 text-sky-500'
    }
  };
  
  // Recent transactions for demo purposes
  const recentTransactions = [
    {
      hash: '0xe8d5c3b12a9f79c03ca79eacc9e853d293bcd70942894a13d5b0fd58ffc3f24b',
      from: '0x7b24119c4277bEcEaBA1E2A4b9Ce70b42fEf57b3',
      to: '0x2392750891C1e813C8514f1C5Fb822C7f4222ec6',
      value: '24.58 SING',
      timestamp: '2 mins ago',
      status: 'Confirmed'
    },
    {
      hash: '0xa5e18f3b6cf72e4de8df72d6f5ffc4de7d131af0c46c8f9e9dc54c0da1ea814d',
      from: '0x5cB11C34088f24DfB52917AD8dF5b592f6ADB8B7',
      to: '0xF7256d01A3C6C0a3C9726b54A6111FdBc6C9C1E2',
      value: '128.9 FTC',
      timestamp: '5 mins ago',
      status: 'Confirmed'
    },
    {
      hash: '0x7a29fba5992aa4c485a82f386a8c5bc6fa8c49c3b8bc5e3bd19851b38c8e3e12',
      from: '0x3B8C94189932Ac6B2EEc65d3C38734ba4bD65E56',
      to: '0xD2f3736e802C4d898A0CA183D9a1b72F53529Fd7',
      value: '50.0 ICON',
      timestamp: '14 mins ago',
      status: 'Confirmed'
    },
    {
      hash: '0x2e8b19b5c75195a7f5d8df79b8b7d5e7e8f9ab27d83fda35d72c868f8f82b5c3',
      from: '0x9D2c5E21A7F42bb8BfC49f6A5c4E31f5D2F1b2D9',
      to: '0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B',
      value: '75.25 WIN',
      timestamp: '27 mins ago',
      status: 'Confirmed'
    },
    {
      hash: '0x4f7e6d5c4b3a2918d7e6f5d4c3b2a19d8e7f6d5c4b3a2918d7e6f5d4c3b2a19d',
      from: '0x1D2e3F4a5B6c7D8e9F0a1B2c3D4e5F6a7B8c9D0e',
      to: '0xA1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0',
      value: '32.4 IULC',
      timestamp: '51 mins ago',
      status: 'Confirmed'
    }
  ];
  
  // Mining stats for demo purposes
  const miningStats = {
    hashRate: '1.78 PH/s',
    difficulty: '32.4T',
    blockTime: '17.3 seconds',
    rewardPerBlock: '0.475 SING',
    activeMiners: '12,847',
    totalStaked: '245.8M SING'
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would search the blockchain
    console.log(`Searching for: ${searchQuery}`);
    // Reset search field
    setSearchQuery('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Blockchain Explorer</h1>
      <p className="text-muted-foreground mb-8">
        Explore all blockchains in the Aetherion ecosystem - blocks, transactions, accounts, and more
      </p>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex items-stretch w-full max-w-3xl">
          <Input
            type="text"
            placeholder="Search by address, transaction hash, block number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-r-none"
          />
          <Button type="submit" className="rounded-l-none">
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </div>
      </form>
      
      {/* Blockchain Selector */}
      <div className="mb-8">
        <Tabs value={activeBlockchain} onValueChange={setActiveBlockchain}>
          <TabsList className="mb-4">
            <TabsTrigger value="singularity" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              SING
            </TabsTrigger>
            <TabsTrigger value="fractalcoin" className="flex items-center">
              <Layers className="mr-2 h-4 w-4" />
              FTC
            </TabsTrigger>
            <TabsTrigger value="aicoin" className="flex items-center">
              <Cpu className="mr-2 h-4 w-4" />
              ICON
            </TabsTrigger>
            <TabsTrigger value="winnation" className="flex items-center">
              <Wind className="mr-2 h-4 w-4" />
              WIN
            </TabsTrigger>
            <TabsTrigger value="iulcoin" className="flex items-center">
              <Coins className="mr-2 h-4 w-4" />
              IULC
            </TabsTrigger>
          </TabsList>
          
          {Object.entries(blockchains).map(([key, blockchain]) => (
            <TabsContent key={key} value={key}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="mb-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div>
                        <CardTitle className="text-2xl font-bold">
                          {blockchain.name} ({blockchain.symbol})
                        </CardTitle>
                        <CardDescription>
                          {blockchain.tagline} - {blockchain.description}
                        </CardDescription>
                      </div>
                      <div className={`flex items-center space-x-2 text-sm rounded-full px-3 py-1 ${blockchain.color}`}>
                        {blockchain.type === 'Layer 1' ? (
                          <Database className="h-4 w-4" />
                        ) : (
                          <Layers className="h-4 w-4" />
                        )}
                        <span>{blockchain.type}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-card rounded-lg border p-4">
                          <div className="text-muted-foreground text-sm mb-1 flex items-center">
                            <Layers className="h-4 w-4 mr-1" /> Blocks
                          </div>
                          <div className="text-2xl font-bold">{blockchain.latestBlock.toLocaleString()}</div>
                        </div>
                        
                        <div className="bg-card rounded-lg border p-4">
                          <div className="text-muted-foreground text-sm mb-1 flex items-center">
                            <ArrowRightLeft className="h-4 w-4 mr-1" /> Transactions
                          </div>
                          <div className="text-2xl font-bold">{blockchain.totalTransactions}</div>
                        </div>
                        
                        <div className="bg-card rounded-lg border p-4">
                          <div className="text-muted-foreground text-sm mb-1 flex items-center">
                            <User className="h-4 w-4 mr-1" /> Active Nodes
                          </div>
                          <div className="text-2xl font-bold">{blockchain.activeNodes.toLocaleString()}</div>
                        </div>
                        
                        <div className="bg-card rounded-lg border p-4">
                          <div className="text-muted-foreground text-sm mb-1 flex items-center">
                            <Coins className="h-4 w-4 mr-1" /> Market Cap
                          </div>
                          <div className="text-2xl font-bold">{blockchain.marketCap}</div>
                          <div className="text-xs text-muted-foreground">{blockchain.supplyInfo}</div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left text-muted-foreground border-b">
                                <th className="pb-2">Tx Hash</th>
                                <th className="pb-2">From</th>
                                <th className="pb-2">To</th>
                                <th className="pb-2">Value</th>
                                <th className="pb-2">Age</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentTransactions.map((tx, index) => (
                                <tr key={index} className="border-b border-border/40 hover:bg-muted/50">
                                  <td className="py-3 pr-4">
                                    <div className="font-mono text-blue-500 truncate max-w-[120px]">
                                      {tx.hash.substring(0, 10)}...
                                    </div>
                                  </td>
                                  <td className="py-3 pr-4">
                                    <div className="font-mono truncate max-w-[120px]">
                                      {tx.from.substring(0, 8)}...
                                    </div>
                                  </td>
                                  <td className="py-3 pr-4">
                                    <div className="font-mono truncate max-w-[120px]">
                                      {tx.to.substring(0, 8)}...
                                    </div>
                                  </td>
                                  <td className="py-3 pr-4">{tx.value}</td>
                                  <td className="py-3">{tx.timestamp}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-4 text-center">
                          <Button variant="link">View All Transactions</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Mining & Staking</CardTitle>
                      <CardDescription>
                        Current network statistics for mining and staking
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Hash Rate:</span>
                          <span className="font-medium">{miningStats.hashRate}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Difficulty:</span>
                          <span className="font-medium">{miningStats.difficulty}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Block Time:</span>
                          <span className="font-medium">{miningStats.blockTime}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Block Reward:</span>
                          <span className="font-medium">{miningStats.rewardPerBlock}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">Active Miners:</span>
                          <span className="font-medium">{miningStats.activeMiners}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Staked:</span>
                          <span className="font-medium">{miningStats.totalStaked}</span>
                        </div>
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <div className="flex flex-col space-y-4">
                        <Button className="w-full">Start Mining</Button>
                        <Button variant="outline" className="w-full">Stake Tokens</Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Resources</CardTitle>
                      <CardDescription>
                        Helpful tools and documentation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Button variant="ghost" className="w-full justify-start">
                          <FileText className="mr-2 h-4 w-4" />
                          Technical Documentation
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Network Statistics
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          <Cpu className="mr-2 h-4 w-4" />
                          Node Setup Guide
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                          <ArrowRightLeft className="mr-2 h-4 w-4" />
                          API Documentation
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default BlockchainExplorer;