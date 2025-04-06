import { useState, useCallback, lazy, Suspense, useTransition } from 'react';
import MainLayout from '@/core/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, History,
  RefreshCw, QrCode, Copy, Shield, BarChart3, Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Lazy load the onboarding component for better performance
const WalletOnboarding = lazy(() => import('../components/WalletOnboarding'));

/**
 * Wallet page component with all wallet management functionality
 */
const WalletPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isPending, startTransition] = useTransition();
  
  // Simulate loading wallet data
  const { data: walletData, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['/api/wallet/current'],
    // queryFn is handled by the default fetcher
  });

  // Mock user data for the onboarding flow
  const userData = {
    id: 'user-1',
    name: 'Test User',
    email: 'user@example.com',
    skillLevel: 'beginner' as const
  };
  
  // Handlers
  const handleCopyAddress = useCallback(() => {
    // Copy address logic would go here
    // For now, we'll just simulate the functionality
    console.log("Address copied to clipboard");
    // In a real implementation, you would use the Clipboard API:
    // navigator.clipboard.writeText(walletAddress);
  }, []);
  
  const handleSend = useCallback(() => {
    // Send transaction logic would go here
    console.log(`Sending ${sendAmount} to ${sendAddress}`);
    // Reset form
    setSendAmount('');
    setSendAddress('');
  }, [sendAmount, sendAddress]);
  
  const handleRefresh = useCallback(() => {
    // Refresh wallet data logic would go here
  }, []);
  
  const handleOnboardingComplete = useCallback(() => {
    // Use startTransition to tell React this state update might cause a Suspense boundary
    startTransition(() => {
      setShowOnboarding(false);
      console.log('Onboarding completed');
    });
  }, [startTransition]);

  return (
    <MainLayout>
      {/* Lazy-loaded onboarding component with Suspense */}
      {showOnboarding && (
        <Suspense fallback={
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-lg font-medium text-primary">Loading onboarding experience...</p>
            </div>
          </div>
        }>
          {isPending ? (
            <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
              <div className="flex flex-col items-center">
                <p className="mt-4 text-lg font-medium text-primary">Completing onboarding...</p>
              </div>
            </div>
          ) : (
            <WalletOnboarding 
              userData={userData}
              walletData={{
                walletBalances: { 'SING': 1000, 'BTC': 0.35, 'ETH': 1.5 },
                recentTransactions: [
                  { type: 'received', asset: 'BTC', amount: 0.05, date: '2025-04-03' },
                  { type: 'sent', asset: 'ETH', amount: 0.2, date: '2025-04-02' },
                  { type: 'reward', asset: 'SING', amount: 10, date: '2025-04-01' }
                ],
                userPreferences: { theme: 'dark', notifications: true }
              }}
              onComplete={handleOnboardingComplete}
            />
          )}
        </Suspense>
      )}
      
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quantum Wallet</h1>
          <Button onClick={handleRefresh} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            startTransition(() => {
              setActiveTab(value);
            });
          }} 
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="receive">Receive</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <WalletOverview isLoading={isLoadingWallet} data={walletData} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AssetsList isLoading={isLoadingWallet} data={walletData} />
              <TransactionHistory />
            </div>
          </TabsContent>
          
          <TabsContent value="send" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowUpRight className="mr-2 h-5 w-5" />
                  Send Assets
                </CardTitle>
                <CardDescription>
                  Transfer assets to another wallet with quantum-secure encryption
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="asset">Select Asset</Label>
                  <div className="relative">
                    <select 
                      id="asset" 
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="SING">Singularity Coin (SING)</option>
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <Input 
                      id="amount" 
                      placeholder="0.00" 
                      type="number" 
                      value={sendAmount}
                      onChange={e => setSendAmount(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                      SING
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Recipient Address</Label>
                  <Input 
                    id="address" 
                    placeholder="Enter wallet address" 
                    value={sendAddress}
                    onChange={e => setSendAddress(e.target.value)}
                  />
                </div>
                
                <div className="bg-muted rounded-md p-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Quantum-Secure Transaction</p>
                      <p className="text-muted-foreground">
                        This transaction is protected by CRYSTAL-Kyber encryption and SPHINCS+ signatures
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    startTransition(() => {
                      setActiveTab('overview');
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSend} disabled={!sendAmount || !sendAddress}>
                  Send Transaction
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="receive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowDownLeft className="mr-2 h-5 w-5" />
                  Receive Assets
                </CardTitle>
                <CardDescription>
                  Share your address to receive crypto assets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-md flex items-center justify-center p-6" style={{ height: '200px' }}>
                  <QrCode className="h-24 w-24 text-primary" />
                </div>
                
                <div className="space-y-2">
                  <Label>Your Wallet Address</Label>
                  <div className="flex">
                    <div className="flex-grow bg-muted rounded-l-md p-2 text-sm font-mono overflow-x-auto whitespace-nowrap">
                      0xaF3d1c94255B0a4BcB9fEE891C8a940398cc4DDe
                    </div>
                    <Button variant="secondary" size="sm" className="rounded-l-none" onClick={handleCopyAddress}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-muted rounded-md p-3 space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Post-Quantum Protection</p>
                      <p className="text-muted-foreground">
                        Your wallet address implements quantum-resistant cryptography to ensure 
                        long-term security against future attacks
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

// Wallet overview component
const WalletOverview = ({ isLoading, data }: any) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center">
        <Wallet className="mr-2 h-5 w-5" />
        Singularity Wallet
      </CardTitle>
      <CardDescription>
        Quantum-secure multi-asset wallet
      </CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="space-y-1">
            <div className="text-4xl font-bold">$15,557.00</div>
            <div className="text-sm text-muted-foreground flex items-center">
              <span className="text-green-500 mr-1">↑ 3.2%</span> 
              <span>in the last 24 hours</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button className="w-full">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Send
            </Button>
            <Button variant="outline" className="w-full">
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Receive
            </Button>
          </div>
        </>
      )}
    </CardContent>
  </Card>
);

// Assets list component
const AssetsList = ({ isLoading, data }: any) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <BarChart3 className="mr-2 h-5 w-5" />
        Your Assets
      </CardTitle>
      <CardDescription>
        All cryptocurrencies in your wallet
      </CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-background rounded-md">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold">SING</span>
              </div>
              <div>
                <div className="font-medium">Singularity Coin</div>
                <div className="text-xs text-muted-foreground">SING</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">1,000.00 SING</div>
              <div className="text-xs text-muted-foreground">$8,200.00</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-background rounded-md">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold">BTC</span>
              </div>
              <div>
                <div className="font-medium">Bitcoin</div>
                <div className="text-xs text-muted-foreground">BTC</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">0.35000000 BTC</div>
              <div className="text-xs text-muted-foreground">$12,250.00</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-background rounded-md">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                <span className="text-xs font-bold">ETH</span>
              </div>
              <div>
                <div className="font-medium">Ethereum</div>
                <div className="text-xs text-muted-foreground">ETH</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">1.50000000 ETH</div>
              <div className="text-xs text-muted-foreground">$3,307.00</div>
            </div>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

// Transaction history component
const TransactionHistory = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <History className="mr-2 h-5 w-5" />
        Recent Transactions
      </CardTitle>
      <CardDescription>
        Latest activity in your wallet
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-background rounded-md">
          <div>
            <div className="font-medium flex items-center">
              <ArrowDownLeft className="h-4 w-4 mr-1 text-green-500" />
              Received BTC
            </div>
            <div className="text-xs text-muted-foreground">April 3, 2025</div>
          </div>
          <div className="text-right">
            <div className="font-medium text-green-500">+0.05 BTC</div>
            <div className="text-xs text-muted-foreground">$1,750.00</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-background rounded-md">
          <div>
            <div className="font-medium flex items-center">
              <ArrowUpRight className="h-4 w-4 mr-1 text-red-500" />
              Sent ETH
            </div>
            <div className="text-xs text-muted-foreground">April 2, 2025</div>
          </div>
          <div className="text-right">
            <div className="font-medium text-red-500">-0.2 ETH</div>
            <div className="text-xs text-muted-foreground">-$440.94</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-background rounded-md">
          <div>
            <div className="font-medium flex items-center">
              <ArrowDownLeft className="h-4 w-4 mr-1 text-green-500" />
              Staking Reward
            </div>
            <div className="text-xs text-muted-foreground">April 1, 2025</div>
          </div>
          <div className="text-right">
            <div className="font-medium text-green-500">+10 SING</div>
            <div className="text-xs text-muted-foreground">$82.00</div>
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button variant="ghost" size="sm" className="w-full">
        View All Transactions
      </Button>
    </CardFooter>
  </Card>
);

export default WalletPage;