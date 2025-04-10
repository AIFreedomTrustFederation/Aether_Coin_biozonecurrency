import React, { useState } from 'react';
import { 
  Search, Filter, ArrowDownRight, ArrowUpRight, 
  Wallet, Shield, Link, Layers, Activity, RefreshCw, 
  ExternalLink, FileText, AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Sample blockchain data (would normally come from API)
const blockchains = [
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', color: 'bg-blue-500' },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', color: 'bg-orange-500' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', color: 'bg-purple-500' },
  { id: 'aetherion', name: 'Aetherion', symbol: 'AET', color: 'bg-green-500' },
];

// Sample transaction data (would normally come from API)
const sampleTransactions = [
  { 
    id: 1, 
    hash: '0x8f4e2d5a1c7b9a3f6e0d4c2b5a8c7d6e5f4a3b2c1', 
    type: 'receive', 
    amount: '0.25', 
    symbol: 'ETH', 
    from: '0x1234...5678', 
    to: '0x8765...4321',
    blockNumber: 17825302,
    timestamp: new Date('2025-04-04T14:32:15'),
    status: 'confirmed',
    fee: '0.002',
    chain: 'ethereum',
    securityScore: 95,
    riskFactors: []
  },
  { 
    id: 2, 
    hash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b', 
    type: 'send', 
    amount: '1.5', 
    symbol: 'SOL', 
    from: '0x8765...4321', 
    to: '0x2468...1357',
    blockNumber: 212459637,
    timestamp: new Date('2025-04-03T09:15:43'),
    status: 'confirmed',
    fee: '0.00025',
    chain: 'solana',
    securityScore: 98,
    riskFactors: []
  },
  { 
    id: 3, 
    hash: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 
    type: 'receive', 
    amount: '0.005', 
    symbol: 'BTC', 
    from: 'bc1q...v98r', 
    to: '3FZbg...XYZ1',
    blockNumber: 834926,
    timestamp: new Date('2025-04-02T22:05:11'),
    status: 'confirmed',
    fee: '0.0001',
    chain: 'bitcoin',
    securityScore: 100,
    riskFactors: []
  },
  { 
    id: 4, 
    hash: '0x6f5e4d3c2b1a0f9e8d7c6b5a4d3c2b1a0f9e8d7c', 
    type: 'send', 
    amount: '125', 
    symbol: 'AET', 
    from: 'qAet...z8P3', 
    to: 'qAet...f7K2',
    blockNumber: 564738,
    timestamp: new Date('2025-04-01T11:23:59'),
    status: 'confirmed',
    fee: '0.01',
    chain: 'aetherion',
    securityScore: 100,
    riskFactors: []
  },
  { 
    id: 5, 
    hash: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t', 
    type: 'receive', 
    amount: '10', 
    symbol: 'ETH', 
    from: '0x9876...5432', 
    to: '0x8765...4321',
    blockNumber: 17825000,
    timestamp: new Date('2025-03-30T16:42:37'),
    status: 'confirmed',
    fee: '0.003',
    chain: 'ethereum',
    securityScore: 85,
    riskFactors: ['Contract interaction with unverified contract']
  }
];

// Helper function to format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const MobileChainActivity = () => {
  const [selectedChain, setSelectedChain] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Filter transactions based on selected chain and search term
  const filteredTransactions = sampleTransactions.filter(tx => {
    const matchesChain = selectedChain === 'all' || tx.chain === selectedChain;
    const matchesSearch = 
      tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesChain && (searchTerm === '' || matchesSearch);
  });
  
  // Refresh data handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate API fetch
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };
  
  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Select value={selectedChain} onValueChange={setSelectedChain}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select blockchain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blockchains</SelectItem>
              {blockchains.map(chain => (
                <SelectItem key={chain.id} value={chain.id}>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${chain.color} mr-2`}></div>
                    {chain.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button size="icon" variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            placeholder="Search by address or tx hash" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      {/* Security Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Shield className="h-5 w-5 mr-2 text-primary" />
            Quantum Security Analysis
          </CardTitle>
          <CardDescription>
            AI-powered blockchain activity security scanner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Overall Security Score</span>
              <span className="font-medium">95/100</span>
            </div>
            <Progress value={95} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="bg-muted/30 p-2 rounded-md text-center">
              <div className="text-xs text-muted-foreground">Malicious Contracts</div>
              <div className="font-medium">0 Detected</div>
            </div>
            <div className="bg-muted/30 p-2 rounded-md text-center">
              <div className="text-xs text-muted-foreground">Phishing Attempts</div>
              <div className="font-medium">0 Detected</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between py-2 px-3 bg-amber-50 dark:bg-amber-950/30 rounded-md mt-2 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Advisory</span>
            </div>
            <span className="text-xs text-amber-600 dark:text-amber-400">High gas period</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Transaction List */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Recent Activity</h3>
          <Badge variant="outline" className="text-xs">
            {filteredTransactions.length} transactions
          </Badge>
        </div>
        
        <ScrollArea className="h-[400px]">
          <div className="space-y-3 py-1">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(tx => {
                // Get chain details
                const chain = blockchains.find(c => c.id === tx.chain);
                
                return (
                  <Card key={tx.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          {tx.type === 'receive' ? (
                            <ArrowDownRight className="h-4 w-4 text-green-500 mr-2" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-500 mr-2" />
                          )}
                          <div>
                            <div className="font-medium">
                              {tx.type === 'receive' ? 'Received' : 'Sent'} {tx.amount} {tx.symbol}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(tx.timestamp)}
                            </div>
                          </div>
                        </div>
                        <Badge className={`${chain?.color} text-white`}>
                          {chain?.name}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-1">From:</span>
                          <span className="font-mono">{tx.from}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-1">To:</span>
                          <span className="font-mono">{tx.to}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-1">Block:</span>
                          <span>{tx.blockNumber}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-1">Fee:</span>
                          <span>{tx.fee} {tx.symbol}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex justify-between items-center">
                        <div className="flex items-center">
                          <Shield className={`h-4 w-4 ${tx.securityScore > 90 ? 'text-green-500' : tx.securityScore > 80 ? 'text-amber-500' : 'text-red-500'} mr-1`} />
                          <span className="text-xs">Security: {tx.securityScore}/100</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Activity className="h-4 w-4 mr-1" />
                              <span className="text-xs">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View in Explorer
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              View Transaction Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="h-4 w-4 mr-2" />
                              Verify Security
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {tx.riskFactors.length > 0 && (
                        <div className="mt-2 py-1 px-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded text-xs text-red-700 dark:text-red-400">
                          <div className="flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span>{tx.riskFactors[0]}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No transactions found</p>
                {searchTerm && (
                  <Button 
                    variant="link" 
                    onClick={() => setSearchTerm('')}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default MobileChainActivity;