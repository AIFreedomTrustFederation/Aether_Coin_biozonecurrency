import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Activity,
  BarChart3,
  Clock,
  Code,
  ExternalLink,
  Lock,
  Shield,
  Zap,
  Cpu,
  ArrowRight,
  Coins,
  RefreshCcw,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Import the Singularity Coin module
import singularityCoin, { 
  QuantumWrappedAsset, 
  SingularityNetworkStats, 
  SingularityTransaction, 
  StakingInfo
} from '../lib/singularity-coin';

const SingularityCoinPage: React.FC = () => {
  // State for Singularity Coin data
  const [singularityBalance, setSingularityBalance] = useState('0');
  const [singularityValue, setSingularityValue] = useState('$0.00');
  const [wrappedAssets, setWrappedAssets] = useState<QuantumWrappedAsset[]>([]);
  const [totalWrappedValue, setTotalWrappedValue] = useState('$0.00');
  const [networkStats, setNetworkStats] = useState<SingularityNetworkStats | null>(null);
  const [transactions, setTransactions] = useState<SingularityTransaction[]>([]);
  const [stakingInfo, setStakingInfo] = useState<StakingInfo | null>(null);
  const [securityStatus, setSecurityStatus] = useState({ 
    crystalKyber: 0, 
    sphincsPlus: 0, 
    zkStarks: 0, 
    lastUpdate: new Date() 
  });
  
  // Load data on component mount
  useEffect(() => {
    // Get balance and value
    setSingularityBalance(singularityCoin.getBalance());
    setSingularityValue(singularityCoin.getBalanceValue());
    
    // Get wrapped assets
    setWrappedAssets(singularityCoin.getWrappedAssets());
    setTotalWrappedValue(singularityCoin.getTotalWrappedValue());
    
    // Get network stats
    setNetworkStats(singularityCoin.getNetworkStats());
    
    // Get transactions
    setTransactions(singularityCoin.getTransactions());
    
    // Get staking info
    const staking = singularityCoin.getStakingInfo();
    if (staking) {
      setStakingInfo(staking);
    }
    
    // Get security status
    setSecurityStatus(singularityCoin.getQuantumSecurityStatus());
  }, []);
  
  return (
    <>
      <Helmet>
        <title>Singularity Coin | Aetherion</title>
      </Helmet>
      
      <div className="p-4 container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Singularity Coin</h1>
            <p className="text-muted-foreground mt-1">Quantum-resistant cryptocurrency</p>
          </div>
          <div className="mt-2 md:mt-0 flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <ExternalLink className="h-4 w-4" />
              <span>Explorer</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              <span>Documentation</span>
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: SING Balance */}
          <Card className="col-span-full md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="h-5 w-5 text-primary" />
                SING Balance
              </CardTitle>
              <CardDescription>Your Singularity Coin holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{singularityBalance} SING</div>
              <div className="text-lg text-muted-foreground">{singularityValue}</div>
              <div className="mt-3 flex items-center text-green-500 text-sm">
                <Activity className="h-4 w-4 mr-1" />
                <span>+8.5% last 24 hours</span>
              </div>
            </CardContent>
            <CardFooter className="pt-0 gap-2">
              <Button size="sm" variant="default">
                Send
              </Button>
              <Button size="sm" variant="outline">
                Receive
              </Button>
              <Button size="sm" variant="outline">
                Stake
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: Quantum Security */}
          <Card className="col-span-full md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="h-5 w-5 text-primary" />
                Quantum Security
              </CardTitle>
              <CardDescription>Encryption status and security</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>CRYSTAL-Kyber</span>
                    <span className="font-medium">{securityStatus.crystalKyber}%</span>
                  </div>
                  <Progress value={securityStatus.crystalKyber} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>SPHINCS+</span>
                    <span className="font-medium">{securityStatus.sphincsPlus}%</span>
                  </div>
                  <Progress value={securityStatus.sphincsPlus} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>zk-STARKs</span>
                    <span className="font-medium">{securityStatus.zkStarks}%</span>
                  </div>
                  <Progress value={securityStatus.zkStarks} className="h-2" />
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Last algorithm update: {securityStatus.lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Network Status */}
          <Card className="col-span-full md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="h-5 w-5 text-primary" />
                Network Status
              </CardTitle>
              <CardDescription>Singularity blockchain metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Block Height</span>
                  <span className="font-medium">{networkStats?.blockHeight.toLocaleString() || 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TPS</span>
                  <span className="font-medium">{networkStats?.tps.toLocaleString() || 'Loading...'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validators</span>
                  <span className="font-medium">{networkStats?.activeValidators || 0} active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Health</span>
                  <span className={`font-medium ${
                    networkStats?.networkHealth === 'Excellent' ? 'text-green-500' :
                    networkStats?.networkHealth === 'Good' ? 'text-green-400' :
                    networkStats?.networkHealth === 'Fair' ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {networkStats?.networkHealth || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Block</span>
                  <span className="font-medium">
                    {networkStats?.lastBlockTime ? 
                      `${Math.floor((Date.now() - networkStats.lastBlockTime.getTime()) / 1000)} seconds ago` : 
                      'Unknown'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="wrapped" className="mt-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="wrapped">Quantum Wrapping</TabsTrigger>
            <TabsTrigger value="staking">Staking</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wrapped">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Quantum-Wrapped Assets
                  </CardTitle>
                  <CardDescription>
                    Traditional cryptocurrencies secured with quantum-resistant encryption
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-muted/40 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-full">
                            <Coins className="h-5 w-5 text-orange-500" />
                          </div>
                          <div>
                            <div className="font-medium">Wrapped Bitcoin</div>
                            <div className="text-sm text-muted-foreground">QBTC</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{wrappedAssets[0]?.amount || '0.00'} BTC</div>
                          <div className="text-sm text-muted-foreground">≈ $22,500.00</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-2">
                        <div className="flex items-center gap-1 text-green-500">
                          <Shield className="h-3 w-3" />
                          <span>Quantum-secured</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Wrapped 3 days ago</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/40 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                            <Coins className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <div className="font-medium">Wrapped Ethereum</div>
                            <div className="text-sm text-muted-foreground">QETH</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{wrappedAssets[1]?.amount || '0.00'} ETH</div>
                          <div className="text-sm text-muted-foreground">≈ $15,000.00</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-2">
                        <div className="flex items-center gap-1 text-green-500">
                          <Shield className="h-3 w-3" />
                          <span>Quantum-secured</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Wrapped 1 week ago</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <div className="text-muted-foreground">Total Wrapped Value</div>
                        <div className="font-bold text-lg">{totalWrappedValue}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    Wrap New Asset
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="col-span-full md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCcw className="h-5 w-5 text-primary" />
                    Quantum Wrapping Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-4 list-decimal list-inside">
                    <li className="text-sm">
                      <span className="font-medium">Asset Deposit</span>
                      <p className="text-muted-foreground ml-5">Deposit your cryptocurrency into the wrapping smart contract.</p>
                    </li>
                    <li className="text-sm">
                      <span className="font-medium">Quantum Encryption</span> 
                      <p className="text-muted-foreground ml-5">Your asset is secured with CRYSTAL-Kyber and SPHINCS+ algorithms.</p>
                    </li>
                    <li className="text-sm">
                      <span className="font-medium">Fractal Sharding</span>
                      <p className="text-muted-foreground ml-5">Asset information is recursively sharded across the network.</p>
                    </li>
                    <li className="text-sm">
                      <span className="font-medium">Wrapped Token Issuance</span>
                      <p className="text-muted-foreground ml-5">Receive quantum-secured tokens representing your assets.</p>
                    </li>
                  </ol>
                </CardContent>
              </Card>
              
              <Card className="col-span-full md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Security Benefits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Cpu className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <span className="font-medium text-sm">Quantum Resistance</span>
                        <p className="text-xs text-muted-foreground">Protection against quantum computing attacks.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Activity className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <span className="font-medium text-sm">Real-time Monitoring</span>
                        <p className="text-xs text-muted-foreground">Continuous security assessment and threat detection.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lock className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <span className="font-medium text-sm">Multi-layer Protection</span>
                        <p className="text-xs text-muted-foreground">Redundant security mechanisms with fallback protection.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <BarChart3 className="h-4 w-4 text-primary mt-1" />
                      <div>
                        <span className="font-medium text-sm">Security Analytics</span>
                        <p className="text-xs text-muted-foreground">Detailed metrics and analytics on security posture.</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="staking">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="col-span-full md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Proof of Quantum Stake (PoQS)
                  </CardTitle>
                  <CardDescription>
                    Stake your SING to secure the network and earn rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/40 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Your Stake</span>
                        <span className="font-medium">{stakingInfo?.amount || '0'} SING</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Staking Period</span>
                        <span className="font-medium">{stakingInfo?.stakingPeriod || 0} days</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">APY</span>
                        <span className="font-medium text-green-500">{stakingInfo?.apy || 0}%</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">Rewards Earned</span>
                        <span className="font-medium">{stakingInfo?.rewardsEarned || '0'} SING</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Reward</span>
                        <span className="font-medium">
                          {stakingInfo ? new Date(stakingInfo.nextRewardDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button>Stake More SING</Button>
                      <Button variant="outline">Claim Rewards</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-full md:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Staking Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Network Stake</span>
                        <span className="font-medium">42% of supply</span>
                      </div>
                      <Progress value={42} className="h-2" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Validator Capacity</span>
                        <span className="font-medium">72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-muted/40 rounded-lg p-3">
                        <div className="text-muted-foreground text-xs">Total Validators</div>
                        <div className="font-bold mt-1">720</div>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-3">
                        <div className="text-muted-foreground text-xs">Average APY</div>
                        <div className="font-bold mt-1 text-green-500">9.8%</div>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-3">
                        <div className="text-muted-foreground text-xs">Minimum Stake</div>
                        <div className="font-bold mt-1">500 SING</div>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-3">
                        <div className="text-muted-foreground text-xs">Lock Period</div>
                        <div className="font-bold mt-1">7-90 days</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  Your Singularity Coin transaction history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((tx, index) => (
                    <div key={tx.id || index} className="flex justify-between items-center p-3 bg-muted/40 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          tx.type === 'receive' ? 'bg-green-100 dark:bg-green-900/30' :
                          tx.type === 'wrap' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          tx.type === 'send' ? 'bg-red-100 dark:bg-red-900/30' :
                          'bg-purple-100 dark:bg-purple-900/30'
                        }`}>
                          {tx.type === 'receive' && <ArrowRight className="h-4 w-4 text-green-500 rotate-180" />}
                          {tx.type === 'wrap' && <RefreshCcw className="h-4 w-4 text-blue-500" />}
                          {tx.type === 'send' && <ArrowRight className="h-4 w-4 text-red-500" />}
                          {tx.type === 'stake' && <Zap className="h-4 w-4 text-purple-500" />}
                        </div>
                        <div>
                          <div className="font-medium">
                            {tx.type === 'receive' && `Received ${tx.asset}`}
                            {tx.type === 'wrap' && `Wrapped ${tx.asset}`}
                            {tx.type === 'send' && `Sent ${tx.asset}`}
                            {tx.type === 'stake' && `Staked ${tx.asset}`}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {tx.type === 'receive' && tx.fromAddress && `From: ${tx.fromAddress}`}
                            {tx.type === 'send' && tx.toAddress && `To: ${tx.toAddress}`}
                            {tx.type === 'wrap' && `Contract: 0x71e9...a853`}
                            {tx.type === 'stake' && `Validator Pool #5`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${
                          tx.type === 'receive' ? 'text-green-500' :
                          tx.type === 'send' ? 'text-red-500' : ''
                        }`}>
                          {tx.type === 'receive' && `+${tx.amount} ${tx.asset}`}
                          {tx.type === 'send' && `-${tx.amount} ${tx.asset}`}
                          {tx.type === 'wrap' && `${tx.amount} ${tx.asset} → Q${tx.asset}`}
                          {tx.type === 'stake' && `${tx.amount} ${tx.asset}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tx.timestamp.toLocaleDateString()} • {tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {transactions.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      No transactions found.
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline">View All Transactions</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default SingularityCoinPage;