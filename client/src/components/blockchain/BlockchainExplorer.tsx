/**
 * Blockchain Explorer Component
 * 
 * Displays blockchain blocks, transactions, and network statistics.
 */

import React, { useState, useEffect } from 'react';
import { blockchainService } from '../../core/blockchain';
import { Block, Transaction } from '../../core/blockchain/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Clock, Database, FileText, Hash, Search, Shield, Zap } from 'lucide-react';

export default function BlockchainExplorer() {
  const [blockchain, setBlockchain] = useState<any>({ chain: [], pendingTransactions: [] });
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<'block' | 'transaction'>('block');
  
  useEffect(() => {
    // Get blockchain data from service
    const updateBlockchainData = () => {
      const data = blockchainService.getBlockchainState();
      setBlockchain(data);
    };
    
    // Initial update
    updateBlockchainData();
    
    // Set up polling for updates
    const interval = setInterval(updateBlockchainData, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const truncateHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };
  
  const viewBlockDetails = (block: Block) => {
    setSelectedBlock(block);
  };
  
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Clear previous timeout if it exists
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set a timeout to prevent too many searches as the user types
    const timeout = setTimeout(() => {
      if (searchType === 'block') {
        // Search for blocks by hash or height
        if (searchQuery.length > 10) {
          // Likely searching by hash
          const block = blockchain.chain.find(
            (b: Block) => b.hash.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(block ? [block] : []);
        } else {
          // May be searching by height (block number)
          try {
            const height = parseInt(searchQuery);
            if (!isNaN(height) && height >= 0 && height < blockchain.chain.length) {
              setSearchResults([blockchain.chain[height]]);
            } else {
              setSearchResults([]);
            }
          } catch (e) {
            setSearchResults([]);
          }
        }
      } else {
        // Search for transactions by hash
        const results: Transaction[] = [];
        
        // Search in confirmed transactions
        blockchain.chain.forEach((block: Block) => {
          block.transactions.forEach((tx: Transaction) => {
            if (tx.id.toLowerCase().includes(searchQuery.toLowerCase())) {
              results.push(tx);
            }
          });
        });
        
        // Search in pending transactions
        blockchain.pendingTransactions.forEach((tx: Transaction) => {
          if (tx.id.toLowerCase().includes(searchQuery.toLowerCase())) {
            results.push(tx);
          }
        });
        
        setSearchResults(results);
      }
    }, 300);
    
    setSearchTimeout(timeout as unknown as number);
  };
  
  useEffect(() => {
    handleSearch();
  }, [searchQuery, searchType]);
  
  return (
    <div className="space-y-6">
      <Card className="w-full shadow-lg border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" /> Search Blockchain
          </CardTitle>
          <CardDescription>
            Search for blocks or transactions by hash or block height
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-grow">
              <Input
                placeholder={searchType === 'block' ? "Search by block hash or height..." : "Search by transaction hash..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:w-[230px] bg-muted rounded-md p-1">
              <Button
                variant={searchType === 'block' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSearchType('block')}
                className="flex items-center gap-1.5"
              >
                <Database className="h-4 w-4" /> Blocks
              </Button>
              <Button
                variant={searchType === 'transaction' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSearchType('transaction')}
                className="flex items-center gap-1.5"
              >
                <FileText className="h-4 w-4" /> Transactions
              </Button>
            </div>
          </div>
          
          {searchResults.length > 0 && (
            <div className="bg-muted/50 rounded-md p-4 border mb-5">
              <h3 className="text-sm font-medium mb-3">Search Results</h3>
              {searchType === 'block' ? (
                <div className="space-y-3">
                  {searchResults.map((block: Block) => (
                    <div 
                      key={block.hash} 
                      className="flex flex-col gap-2 p-3 bg-card rounded-md border cursor-pointer hover:bg-accent/5"
                      onClick={() => viewBlockDetails(block)}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-primary" />
                          <span className="font-medium">Block #{block.index}</span>
                        </div>
                        <Badge variant={block.index === 0 ? "secondary" : "outline"}>
                          {block.index === 0 ? "Genesis" : `${block.transactions.length} Transactions`}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          <span>{truncateHash(block.hash)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(block.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((tx: Transaction) => (
                    <div 
                      key={tx.id} 
                      className="flex flex-col gap-2 p-3 bg-card rounded-md border"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="font-medium">Transaction</span>
                        </div>
                        <Badge variant={tx.status === 'confirmed' ? "secondary" : "outline"}>
                          {tx.status === 'confirmed' ? "Confirmed" : "Pending"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground grid gap-1">
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          <span>{truncateHash(tx.id)}</span>
                        </div>
                        <div className="flex justify-between">
                          <div>From: {truncateHash(tx.fromAddress || 'System')}</div>
                          <div>To: {truncateHash(tx.toAddress)}</div>
                        </div>
                        <div className="flex justify-between">
                          <div>Amount: {tx.amount.toFixed(8)} AE</div>
                          <div>Fee: {tx.fee.toFixed(8)} AE</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <Tabs defaultValue="blocks">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="blocks" className="flex items-center gap-1.5">
                <Database className="h-4 w-4" /> Blocks
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Pending Transactions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="blocks" className="border rounded-md mt-3">
              <ScrollArea className="h-[350px]">
                <div className="p-3 space-y-2">
                  {blockchain.chain.slice().reverse().map((block: Block) => (
                    <div 
                      key={block.hash} 
                      className={`flex flex-col gap-2 p-3 bg-card rounded-md border cursor-pointer hover:bg-accent/5 ${
                        selectedBlock?.hash === block.hash ? 'border-primary' : ''
                      }`}
                      onClick={() => viewBlockDetails(block)}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-primary" />
                          <span className="font-medium">Block #{block.index}</span>
                        </div>
                        <Badge variant={block.index === 0 ? "secondary" : "outline"}>
                          {block.index === 0 ? "Genesis" : `${block.transactions.length} Transactions`}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          <span>{truncateHash(block.hash)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(block.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="pending" className="border rounded-md mt-3">
              <ScrollArea className="h-[350px]">
                <div className="p-3 space-y-2">
                  {blockchain.pendingTransactions.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      <Clock className="mx-auto h-10 w-10 mb-3 opacity-20" />
                      <p>No pending transactions</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {blockchain.pendingTransactions.map((tx: Transaction) => (
                        <div 
                          key={tx.id} 
                          className="flex flex-col gap-2 p-3 bg-card rounded-md border"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="font-medium">Transaction</span>
                            </div>
                            <Badge variant="outline">Pending</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground grid gap-1">
                            <div className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              <span>{truncateHash(tx.id)}</span>
                            </div>
                            <div className="flex justify-between">
                              <div>From: {truncateHash(tx.fromAddress || 'System')}</div>
                              <div>To: {truncateHash(tx.toAddress)}</div>
                            </div>
                            <div className="flex justify-between">
                              <div>Amount: {tx.amount.toFixed(8)} AE</div>
                              <div>Fee: {tx.fee.toFixed(8)} AE</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {selectedBlock && (
        <Card className="w-full shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" /> Block Details
            </CardTitle>
            <CardDescription>
              Block #{selectedBlock.index} - {formatTimestamp(selectedBlock.timestamp)}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Block Information</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Height:</span>
                    <span className="font-medium">{selectedBlock.index}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span className="font-medium">{formatTimestamp(selectedBlock.timestamp)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Nonce:</span>
                    <span className="font-medium">{selectedBlock.nonce}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <span className="font-medium">{selectedBlock.difficulty}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Transactions:</span>
                    <span className="font-medium">{selectedBlock.transactions.length}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Hash Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="py-1 border-b">
                    <div className="text-muted-foreground mb-1">Block Hash:</div>
                    <div className="font-mono break-all">{selectedBlock.hash}</div>
                  </div>
                  <div className="py-1 border-b">
                    <div className="text-muted-foreground mb-1">Previous Hash:</div>
                    <div className="font-mono break-all">{selectedBlock.previousHash || 'None (Genesis Block)'}</div>
                  </div>
                  <div className="py-1">
                    <div className="text-muted-foreground mb-1">Merkle Root:</div>
                    <div className="font-mono break-all">{selectedBlock.merkleRoot || 'N/A'}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium flex items-center gap-1.5 mb-3">
                <FileText className="h-4 w-4 text-primary" /> 
                Transactions ({selectedBlock.transactions.length})
              </h3>
              
              {selectedBlock.transactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hash</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBlock.transactions.map((tx: Transaction) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono">{truncateHash(tx.id)}</TableCell>
                        <TableCell>{tx.fromAddress ? truncateHash(tx.fromAddress) : 'System'}</TableCell>
                        <TableCell>{truncateHash(tx.toAddress)}</TableCell>
                        <TableCell>{tx.amount.toFixed(8)} AE</TableCell>
                        <TableCell>{tx.fee.toFixed(8)} AE</TableCell>
                        <TableCell>
                          <Badge variant={tx.status === 'confirmed' ? "secondary" : "default"}>
                            {tx.status === 'confirmed' ? 'Confirmed' : 'Mining Reward'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 text-muted-foreground bg-muted/30 rounded-md">
                  <FileText className="mx-auto h-10 w-10 mb-3 opacity-20" />
                  <p>No transactions in this block</p>
                </div>
              )}
            </div>
            
            {selectedBlock.index !== 0 && (
              <>
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium flex items-center gap-1.5 mb-3">
                    <Zap className="h-4 w-4 text-primary" /> 
                    Mining Information
                  </h3>
                  <div className="bg-muted/30 p-4 rounded-md grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm mb-1"><span className="text-muted-foreground">Miner Address:</span></div>
                      <div className="text-sm font-mono break-all">
                        {selectedBlock.minerAddress || 'Unknown'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mining Method:</span>
                        <Badge variant="outline" className="font-normal">
                          {selectedBlock.miningMethod || 'PoW'}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mining Time:</span>
                        <span>{selectedBlock.miningTime ? `${selectedBlock.miningTime.toFixed(2)}s` : 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Hashrate:</span>
                        <span>{selectedBlock.hashrate ? `${(selectedBlock.hashrate / 1000).toFixed(2)} kH/s` : 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}