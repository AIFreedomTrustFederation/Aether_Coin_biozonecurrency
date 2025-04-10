import React, { useState, useCallback, lazy, Suspense, useEffect, startTransition } from 'react';
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
import { TokenManagementService, TokenBalance } from '@/features/integration/services/TokenManagementService';
import { useWallet } from '@/context/WalletContext';
import { useMultiWallet } from '@/context/MultiWalletContext';

// Lazy load the onboarding component for better performance
// Use React.memo to prevent unnecessary re-renders
const WalletOnboarding = React.memo(lazy(() => import('../components/WalletOnboarding')));

/**
 * Helper function to get appropriate background color for token symbol
 */
const getTokenColorClass = (symbol: string): string => {
  switch (symbol) {
    case 'ATC':
      return 'bg-purple-500/20';
    case 'SING':
      return 'bg-primary/20';
    case 'ICON':
      return 'bg-teal-500/20';
    case 'FTC':
      return 'bg-amber-500/20';
    default:
      return 'bg-gray-500/20';
  }
};

/**
 * Helper function to get full token name
 */
const getTokenFullName = (symbol: string): string => {
  switch (symbol) {
    case 'ATC':
      return 'AetherCoin';
    case 'SING':
      return 'Singularity Coin';
    case 'ICON':
      return 'IconToken';
    case 'FTC':
      return 'FractalCoin';
    default:
      return symbol;
  }
};

/**
 * Main wallet page component
 */
const WalletPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [readyToShowOnboarding, setReadyToShowOnboarding] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [tokenService] = useState(() => new TokenManagementService());
  const { wallet } = useWallet();
  const { primaryWallet, wallets } = useMultiWallet();
  
  // Use the primary wallet from MultiWalletContext if available, otherwise use the single wallet
  const activeWallet = primaryWallet || wallet;
  
  // Fetch token balances
  const { data: tokenBalances, isLoading: isLoadingTokens, refetch: refetchTokens } = useQuery({
    queryKey: ['tokenBalances', activeWallet?.address],
    queryFn: async () => {
      if (!activeWallet?.address) return [];
      return tokenService.getTokenBalances(activeWallet.address);
    },
    enabled: !!activeWallet?.address
  });
  
  // Calculate total portfolio value
  const totalPortfolioValue = tokenBalances?.reduce((total, token) => {
    return total + parseFloat(token.usdValue);
  }, 0) || 0;
  
  // Fetch wallet data (other info)
  const { data: walletData, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['/api/wallet/current'],
    // queryFn is handled by the default fetcher
  });
  
  // Set the selected asset when tokens are loaded
  useEffect(() => {
    if (tokenBalances?.length && !selectedAsset) {
      setSelectedAsset(tokenBalances[0].symbol);
    }
  }, [tokenBalances, selectedAsset]);
  
  // Defer loading of onboarding component until after initial render
  useEffect(() => {
    // Use requestAnimationFrame to ensure we're in a non-blocking cycle
    const timer = requestAnimationFrame(() => {
      // Set pending state before starting the transition
      setIsPending(true);
      
      // Use the startTransition function
      startTransition(() => {
        setReadyToShowOnboarding(true);
        setShowOnboarding(true);
        // Clear pending state after the transition
        setTimeout(() => setIsPending(false), 100);
      });
    });
    
    return () => cancelAnimationFrame(timer);
  }, []);

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
    console.log(`Sending ${sendAmount} ${selectedAsset} to ${sendAddress}`);
    // Reset form
    setSendAmount('');
    setSendAddress('');
  }, [sendAmount, sendAddress, selectedAsset]);
  
  const handleRefresh = useCallback(() => {
    // Refresh wallet and token data
    refetchTokens();
  }, [refetchTokens]);
  
  const handleOnboardingComplete = useCallback(() => {
    // Set a pending state first
    setIsPending(true);
    
    // Use startTransition to tell React this state update might cause a Suspense boundary
    startTransition(() => {
      setShowOnboarding(false);
      setIsPending(false);
      console.log('Onboarding completed');
    });
  }, []);

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
            <RefreshCw className={`h-4 w-4 ${isLoadingTokens ? 'animate-spin' : ''}`} />
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
            <WalletOverview 
              isLoading={isLoadingWallet || isLoadingTokens} 
              totalValue={totalPortfolioValue} 
              address={activeWallet?.address}
              onRefresh={handleRefresh}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AssetsList 
                isLoading={isLoadingTokens} 
                tokens={tokenBalances || []} 
              />
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
                      disabled={isLoadingTokens || !tokenBalances?.length}
                      value={selectedAsset}
                      onChange={(e) => setSelectedAsset(e.target.value)}
                    >
                      {tokenBalances?.length ? (
                        tokenBalances.map((token) => (
                          <option key={token.symbol} value={token.symbol}>
                            {`${getTokenFullName(token.symbol)} (${token.symbol}) - ${parseFloat(token.balance).toLocaleString()}`}
                          </option>
                        ))
                      ) : (
                        <option value="">No assets available</option>
                      )}
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
                      {selectedAsset || 'SING'}
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
                <Button onClick={handleSend} disabled={!sendAmount || !sendAddress || !selectedAsset}>
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
                {!activeWallet?.address ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Wallet className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="font-medium">No wallet connected</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                      Connect a wallet first to see your receiving address
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-muted rounded-md flex items-center justify-center p-6" style={{ height: '200px' }}>
                      <QrCode className="h-24 w-24 text-primary" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Your Wallet Address</Label>
                      <div className="flex">
                        <div className="flex-grow bg-muted rounded-l-md p-2 text-sm font-mono overflow-x-auto whitespace-nowrap">
                          {activeWallet?.address}
                        </div>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="rounded-l-none" 
                          onClick={() => {
                            if (activeWallet?.address) {
                              navigator.clipboard.writeText(activeWallet.address);
                              handleCopyAddress();
                            }
                          }}
                        >
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
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

// Wallet overview component
interface WalletOverviewProps {
  isLoading: boolean;
  totalValue: number;
  address?: string;
  onRefresh?: () => void;
}

const WalletOverview = ({ isLoading, totalValue, address, onRefresh }: WalletOverviewProps) => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <div>
          <CardTitle className="flex items-center">
            <Wallet className="mr-2 h-5 w-5" />
            Quantum Wallet
          </CardTitle>
          <CardDescription>
            {address ? `Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Wallet not connected'}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="space-y-1">
            <div className="text-4xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
interface AssetsListProps {
  isLoading: boolean;
  tokens: TokenBalance[];
}

const AssetsList = ({ isLoading, tokens }: AssetsListProps) => {
  return (
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
        ) : tokens.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Wallet className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No assets found in this wallet</p>
            <p className="text-xs text-muted-foreground mt-1">Connect a wallet or add assets to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tokens.map((token) => (
              <div 
                key={token.symbol}
                className="flex items-center justify-between p-3 bg-background rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 ${getTokenColorClass(token.symbol)} rounded-full flex items-center justify-center mr-3`}>
                    <span className="text-xs font-bold">{token.symbol}</span>
                  </div>
                  <div>
                    <div className="font-medium">{getTokenFullName(token.symbol)}</div>
                    <div className="text-xs text-muted-foreground">{token.symbol}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{parseFloat(token.balance).toLocaleString()} {token.symbol}</div>
                  <div className="text-xs text-muted-foreground">${token.usdValue}</div>
                  {token.pendingRewards && (
                    <div className="text-xs text-green-500 mt-1">
                      +{token.pendingRewards} {token.symbol} pending
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

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