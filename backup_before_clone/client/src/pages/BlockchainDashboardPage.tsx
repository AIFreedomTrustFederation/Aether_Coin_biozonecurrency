/**
 * Blockchain Dashboard Page
 * 
 * A comprehensive blockchain dashboard with mining controls,
 * transaction management, and blockchain exploration.
 */

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { blockchainService } from '../core/blockchain';
import MiningControl from '../components/blockchain/MiningControl';
import BlockchainTransactions from '../components/blockchain/BlockchainTransactions';
import BlockchainExplorer from '../components/blockchain/BlockchainExplorer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Blocks, Cpu, FileDigit, Gauge, Info, ServerCrash, Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function BlockchainDashboardPage() {
  // Initialize blockchain service
  useEffect(() => {
    blockchainService.initialize();
  }, []);
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <Helmet>
        <title>Blockchain Dashboard | Aetherion</title>
      </Helmet>
      
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Blocks className="h-8 w-8 text-primary" />
          Aetherion Blockchain Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage mining operations, transactions, and explore the blockchain.
        </p>
      </div>
      
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4" />
        <AlertTitle>Test Network Active</AlertTitle>
        <AlertDescription>
          You are currently on Aetherion's test network. Transactions and mining are for testing purposes only.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Tabs defaultValue="explorer" className="space-y-6">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="explorer" className="flex items-center gap-1">
                <Blocks className="h-4 w-4" /> Explorer
              </TabsTrigger>
              <TabsTrigger value="transactions" className="flex items-center gap-1">
                <FileDigit className="h-4 w-4" /> Transactions
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-1">
                <ServerCrash className="h-4 w-4" /> Network
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="explorer" className="space-y-4 m-0">
              <BlockchainExplorer />
            </TabsContent>
            
            <TabsContent value="transactions" className="space-y-4 m-0">
              <BlockchainTransactions />
            </TabsContent>
            
            <TabsContent value="network" className="space-y-4 m-0">
              <Card className="w-full shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ServerCrash className="h-6 w-6" /> Network Statistics
                  </CardTitle>
                  <CardDescription>
                    Overview of the Aetherion blockchain network
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Shield className="h-4 w-4 text-primary" />
                          Consensus Mechanism
                        </h3>
                        <div className="bg-primary/5 p-4 rounded-lg">
                          <h4 className="font-medium">Quantum Proof of Work</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Aetherion uses a quantum-resistant proof of work consensus algorithm
                            that is designed to be resistant to attacks from quantum computers.
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Cpu className="h-4 w-4 text-primary" />
                          Mining Algorithm
                        </h3>
                        <div className="bg-primary/5 p-4 rounded-lg">
                          <h4 className="font-medium">Aetherion Quantum</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            The mining algorithm is designed to be efficient on both CPU and GPU,
                            with quantum-resistant properties to ensure long-term security.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Gauge className="h-4 w-4 text-primary" />
                          Network Parameters
                        </h3>
                        <div className="bg-primary/5 p-4 rounded-lg space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Target Block Time:</span>
                            <span className="font-medium">60 seconds</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Block Reward:</span>
                            <span className="font-medium">50 AE</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Difficulty Adjustment:</span>
                            <span className="font-medium">Every 10 blocks</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Maximum Supply:</span>
                            <span className="font-medium">21,000,000 AE</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <Shield className="h-4 w-4 text-primary" />
                          Security Features
                        </h3>
                        <div className="bg-primary/5 p-4 rounded-lg space-y-1">
                          <div className="flex items-start gap-2">
                            <div className="bg-primary text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">✓</div>
                            <div>
                              <span className="font-medium">Quantum-Resistant Signatures</span>
                              <p className="text-xs text-muted-foreground">Resistant to attacks from quantum computers</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="bg-primary text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">✓</div>
                            <div>
                              <span className="font-medium">Advanced Merkle Tree</span>
                              <p className="text-xs text-muted-foreground">Enhanced transaction verification</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="bg-primary text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">✓</div>
                            <div>
                              <span className="font-medium">Adaptive Difficulty</span>
                              <p className="text-xs text-muted-foreground">Responds to network hashrate changes</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Network Status</h3>
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm text-green-500 font-medium mb-2">
                        <div className="bg-green-500 rounded-full h-2 w-2"></div>
                        <span>All Systems Operational</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        The Aetherion blockchain network is running normally. You can mine blocks,
                        create transactions, and explore the blockchain without issues.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <MiningControl />
        </div>
      </div>
    </div>
  );
}