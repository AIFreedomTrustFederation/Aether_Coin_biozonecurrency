import { useState, useEffect } from 'react';
import MainLayout from "@/core/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Clock, AlertTriangle, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

/**
 * Dashboard page component with wallet overview and activity widgets
 */
const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Simulate loading wallet balances data
  const { data: walletData, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['/api/wallet/balances'],
    // queryFn is handled by the default fetcher
  });

  // Simulate loading recent transactions data
  const { data: transactionsData, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['/api/wallet/transactions/recent'],
    // queryFn is handled by the default fetcher
  });
  
  return (
    <MainLayout>
      <div className="container mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <WalletOverviewCard isLoading={isLoadingWallet} data={walletData} />
              <SecurityStatusCard />
              <RecentActivityCard isLoading={isLoadingTransactions} data={transactionsData} />
            </div>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuantumSecurityOverview />
              <SecurityHealthCard />
            </div>
          </TabsContent>
          
          <TabsContent value="activity" className="space-y-4">
            <FullActivityFeed isLoading={isLoadingTransactions} data={transactionsData} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

// Component for wallet balance overview
const WalletOverviewCard = ({ isLoading, data }: any) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <TrendingUp className="mr-2 h-5 w-5" />
        Wallet Balance
      </CardTitle>
      <CardDescription>Your current balance across all assets</CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold mb-2">$15,557.00</div>
          <div className="text-sm text-muted-foreground">
            <span className="text-green-500 font-medium">↑ 3.2%</span> from last week
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span>Bitcoin (BTC)</span>
              <span className="font-medium">0.35000000 ($12,250.00)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Ethereum (ETH)</span>
              <span className="font-medium">1.50000000 ($3,307.00)</span>
            </div>
          </div>
        </>
      )}
    </CardContent>
  </Card>
);

// Component for security status
const SecurityStatusCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Shield className="mr-2 h-5 w-5" />
        Security Status
      </CardTitle>
      <CardDescription>Current quantum security status</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-medium">Quantum Resistance</span>
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
          Active
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>CRYSTAL-Kyber</span>
          <span className="text-green-500">✓ Enabled</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>SPHINCS+</span>
          <span className="text-green-500">✓ Enabled</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>zk-STARKs</span>
          <span className="text-green-500">✓ Enabled</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Component for recent activity
const RecentActivityCard = ({ isLoading, data }: any) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Clock className="mr-2 h-5 w-5" />
        Recent Activity
      </CardTitle>
      <CardDescription>Latest transactions and events</CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <div className="font-medium">Received BTC</div>
              <div className="text-xs text-muted-foreground">2 hours ago</div>
            </div>
            <div className="text-green-500 font-medium">+0.05 BTC</div>
          </div>
          <div className="flex justify-between items-center pb-2 border-b">
            <div>
              <div className="font-medium">Sent ETH</div>
              <div className="text-xs text-muted-foreground">Yesterday</div>
            </div>
            <div className="text-red-500 font-medium">-0.2 ETH</div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Staking Reward</div>
              <div className="text-xs text-muted-foreground">2 days ago</div>
            </div>
            <div className="text-green-500 font-medium">+10 SING</div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

// Component for quantum security overview
const QuantumSecurityOverview = () => (
  <Card>
    <CardHeader>
      <CardTitle>Quantum Security Layers</CardTitle>
      <CardDescription>Your protection against quantum attacks</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-1">Layer 1: Quantum Key Protection</h3>
          <p className="text-sm text-muted-foreground">CRYSTAL-Kyber algorithm active with 256-bit security strength</p>
        </div>
        <div>
          <h3 className="font-medium mb-1">Layer 2: Fractal Signature Defense</h3>
          <p className="text-sm text-muted-foreground">SPHINCS+ hash-based signatures with recursive Merkle trees</p>
        </div>
        <div>
          <h3 className="font-medium mb-1">Layer 3: Zero-Knowledge Proofs</h3>
          <p className="text-sm text-muted-foreground">zk-STARKs providing post-quantum security for transaction privacy</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Component for security health
const SecurityHealthCard = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <AlertTriangle className="mr-2 h-5 w-5" />
        Security Health
      </CardTitle>
      <CardDescription>Identified security issues and recommendations</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
          <h3 className="font-medium text-amber-800 mb-1">Consider Enabling 2FA</h3>
          <p className="text-sm text-amber-700">Additional authentication would enhance your security.</p>
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-medium text-green-800 mb-1">Fractal Security Active</h3>
          <p className="text-sm text-green-700">Your wallet is protected by our highest security standards.</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Component for full activity feed
const FullActivityFeed = ({ isLoading, data }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Transaction History</CardTitle>
      <CardDescription>Complete log of your recent wallet activity</CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-background rounded-md">
            <div>
              <div className="font-medium">Received BTC</div>
              <div className="text-xs text-muted-foreground">April 3, 2025 - 14:25</div>
              <div className="text-xs text-muted-foreground">Transaction ID: 0x8f4...3b2f</div>
            </div>
            <div className="text-green-500 font-medium">+0.05 BTC</div>
          </div>
          <div className="flex justify-between items-center p-3 bg-background rounded-md">
            <div>
              <div className="font-medium">Sent ETH</div>
              <div className="text-xs text-muted-foreground">April 2, 2025 - 10:12</div>
              <div className="text-xs text-muted-foreground">Transaction ID: 0x3d2...9c4a</div>
            </div>
            <div className="text-red-500 font-medium">-0.2 ETH</div>
          </div>
          <div className="flex justify-between items-center p-3 bg-background rounded-md">
            <div>
              <div className="font-medium">Staking Reward</div>
              <div className="text-xs text-muted-foreground">April 1, 2025 - 00:00</div>
              <div className="text-xs text-muted-foreground">Transaction ID: 0xa7c...5e21</div>
            </div>
            <div className="text-green-500 font-medium">+10 SING</div>
          </div>
          <div className="flex justify-between items-center p-3 bg-background rounded-md">
            <div>
              <div className="font-medium">Purchased SING</div>
              <div className="text-xs text-muted-foreground">March 29, 2025 - 16:45</div>
              <div className="text-xs text-muted-foreground">Transaction ID: 0x6f1...8d3e</div>
            </div>
            <div className="text-green-500 font-medium">+25 SING</div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

export default DashboardPage;