import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { 
  Button,
  Alert,
  AlertTitle,
  AlertDescription,
  Badge
} from "@/components/ui";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Loader2,
  AlertTriangle,
  LayoutGrid,
  Lock,
  Zap,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { walletService } from '@/lib/singularity-coin/wallet-service';
import { TransactionType, ConsensusType } from '@/lib/singularity-coin';

const SingularityWalletOverview: React.FC = () => {
  const [currentWallet, setCurrentWallet] = useState(walletService.getCurrentWallet());
  const [balance, setBalance] = useState<string | null>(null);
  const [stakedAmount, setStakedAmount] = useState<string | null>(null);
  const [blockchainStatus, setBlockchainStatus] = useState(walletService.getBlockchainStatus());
  const [wrappedAssets, setWrappedAssets] = useState(walletService.getWrappedAssets() || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fractalBalance, setFractalBalance] = useState<string | null>(null);
  const [fractalRewardRate, setFractalRewardRate] = useState<number | null>(null);
  
  // Load wallet data
  useEffect(() => {
    if (!currentWallet) {
      // For demo purposes, create a wallet if none exists
      const storedWallets = walletService.getStoredWallets();
      if (storedWallets.length > 0) {
        walletService.loadWallet(storedWallets[0]);
        setCurrentWallet(walletService.getCurrentWallet());
      } else {
        const newWallet = walletService.createWallet("Primary Wallet");
        setCurrentWallet(newWallet);
      }
    }
    
    refreshWalletData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(refreshWalletData, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const refreshWalletData = () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Refresh wallet balances
      setBalance(walletService.getBalance());
      setStakedAmount(walletService.getStakedAmount());
      
      // Refresh blockchain status
      setBlockchainStatus(walletService.getBlockchainStatus());
      
      // Refresh wrapped assets
      setWrappedAssets(walletService.getWrappedAssets() || []);
      
      // Refresh fractalcoin data
      setFractalBalance(walletService.getFractalCoinBalance());
      setFractalRewardRate(walletService.getFractalCoinRewardRate());
    } catch (e) {
      setError("Failed to refresh wallet data");
      console.error("Wallet refresh error:", e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendTransaction = () => {
    // This would open a send transaction modal in a real implementation
    console.log("Open send transaction modal");
  };
  
  const handleReceiveTransaction = () => {
    // This would open a receive address modal in a real implementation
    console.log("Open receive address modal");
  };
  
  const handleWrapAsset = () => {
    // This would open a wrap asset modal in a real implementation
    console.log("Open wrap asset modal");
  };
  
  const handleStake = () => {
    // This would open a staking modal in a real implementation
    console.log("Open stake modal");
  };
  
  const handleClaimRewards = () => {
    // This would claim FractalCoin rewards
    const claimed = walletService.claimFractalCoinRewards();
    if (claimed) {
      setFractalBalance(walletService.getFractalCoinBalance());
      console.log(`Claimed ${claimed} FRC`);
    }
  };
  
  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Get CSS class for consensus type
  const getConsensusClass = (consensus: ConsensusType) => {
    switch (consensus) {
      case ConsensusType.POW:
        return "bg-yellow-100 text-yellow-800";
      case ConsensusType.POS:
        return "bg-green-100 text-green-800";
      case ConsensusType.HYBRID:
        return "bg-blue-100 text-blue-800";
      case ConsensusType.QUANTUM_STAKE:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Singularity Wallet</h2>
        <Button size="sm" variant="outline" onClick={refreshWalletData} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Quantum Assets</TabsTrigger>
          <TabsTrigger value="network">Network Status</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Main Wallet Card */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="mr-2 h-5 w-5" />
                  Singularity Coin Wallet
                </CardTitle>
                <CardDescription>
                  Quantum-secure cryptocurrency
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Address: {currentWallet ? formatAddress(currentWallet.address) : 'Loading...'}
                      </div>
                      <div className="text-4xl font-bold">{balance || '0.00'} SING</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Shield className="mr-1 h-4 w-4 text-primary" /> 
                        <span>Quantum-protected with CRYSTALS-Kyber &amp; Dilithium</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <Button className="w-full" onClick={handleSendTransaction}>
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Send
                      </Button>
                      <Button variant="outline" className="w-full" onClick={handleReceiveTransaction}>
                        <ArrowDownLeft className="mr-2 h-4 w-4" />
                        Receive
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            {/* Staking Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  Staking
                </CardTitle>
                <CardDescription>
                  Earn rewards by staking SING
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{stakedAmount || '0.00'} SING</div>
                  <div className="text-sm text-muted-foreground">
                    Current consensus: 
                    <Badge variant="outline" className={`ml-2 ${getConsensusClass(blockchainStatus.currentConsensus)}`}>
                      {blockchainStatus.currentConsensus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={handleStake}>
                  Manage Stake
                </Button>
              </CardFooter>
            </Card>
            
            {/* FractalCoin Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LayoutGrid className="mr-2 h-5 w-5" />
                  FractalCoin
                </CardTitle>
                <CardDescription>
                  Layer 2 rewards for network participation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{fractalBalance || '0.00'} FRC</div>
                  <div className="text-sm text-muted-foreground">
                    Earning {fractalRewardRate?.toFixed(2) || '0.00'} FRC/day
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={handleClaimRewards}>
                  <Zap className="mr-2 h-4 w-4" />
                  Claim Rewards
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Quantum-Wrapped Assets
              </CardTitle>
              <CardDescription>
                External assets wrapped with quantum-resistant security
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {wrappedAssets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
                      <p>No quantum-wrapped assets yet</p>
                      <p className="text-sm">Wrap external assets to protect them with quantum security</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {wrappedAssets.map(asset => (
                        <div key={asset.assetId} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                          <div className="flex items-center">
                            <Shield className="h-10 w-10 p-2 bg-primary/10 rounded-full text-primary mr-3" />
                            <div>
                              <div className="font-medium">{asset.wrappedAmount} {asset.originalAssetSymbol}</div>
                              <div className="text-xs text-muted-foreground">From {asset.originalChain} • Security Level: {asset.securityLevel}/10</div>
                            </div>
                          </div>
                          <Badge variant={asset.securityLevel >= 8 ? "default" : "outline"}>
                            {asset.securityLevel >= 8 ? "Max Security" : "Standard"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <Button onClick={handleWrapAsset}>
                      <Shield className="mr-2 h-4 w-4" />
                      Wrap External Asset
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Singularity Network Status
              </CardTitle>
              <CardDescription>
                Current blockchain statistics and AI recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">Block Height</div>
                    <div className="text-xl font-medium">{blockchainStatus.blockHeight}</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">Consensus Mechanism</div>
                    <div className="text-xl font-medium">
                      <Badge className={getConsensusClass(blockchainStatus.currentConsensus)}>
                        {blockchainStatus.currentConsensus}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">Active Validators</div>
                    <div className="text-xl font-medium">{blockchainStatus.activeValidators}</div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-md">
                    <div className="text-sm text-muted-foreground">Pending Transactions</div>
                    <div className="text-xl font-medium">{blockchainStatus.pendingTransactions}</div>
                  </div>
                </div>
                
                {blockchainStatus.aiRecommendations?.consensusSwitchRecommended && (
                  <Alert className="mt-4">
                    <Zap className="h-4 w-4" />
                    <AlertTitle>AI Consensus Recommendation</AlertTitle>
                    <AlertDescription>
                      Network conditions suggest switching to {blockchainStatus.aiRecommendations.recommendedConsensus} 
                      consensus for optimal performance.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SingularityWalletOverview;
