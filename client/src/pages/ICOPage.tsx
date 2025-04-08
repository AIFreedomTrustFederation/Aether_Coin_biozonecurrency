import React from 'react';
import { 
  Coins, 
  BarChart, 
  Clock, 
  Wallet, 
  Zap, 
  ShieldCheck,
  Users,
  ArrowRightLeft,
  Share2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { WalletProvider } from '../context/WalletContext';
import ICOParticipation from '../components/wallet/ICOParticipation';
import CelebratingWalletConnector from '../components/wallet/CelebratingWalletConnector';

const ICOPage: React.FC = () => {
  return (
    <WalletProvider>
      <div className="p-4 container mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Singularity Coin ICO</h1>
          <p className="text-muted-foreground text-lg">
            Participate in the Initial Coin Offering of the world's first quantum-resistant blockchain currency
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main ICO participation area */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-2xl font-bold">Join the Quantum Revolution</CardTitle>
                  <CardDescription>
                    Singularity Coin (SING) offers unparalleled security in the post-quantum era
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2 text-sm bg-primary/10 text-primary rounded-full px-3 py-1">
                  <Clock className="h-4 w-4" />
                  <span>ICO Active</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="my-4">
                  <ICOParticipation />
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
                <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>About Singularity Coin</CardTitle>
                    <CardDescription>The future of quantum-resistant blockchain currency</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium flex items-center">
                          <ShieldCheck className="h-5 w-5 mr-2 text-primary" />
                          Quantum Resistance
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          Built on CRYSTAL-Kyber and SPHINCS+ algorithms that remain secure against quantum computer attacks.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium flex items-center">
                          <Zap className="h-5 w-5 mr-2 text-primary" />
                          Fractal Security
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          Leverages recursive Mandelbrot sharding for unprecedented transaction throughput and security.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium flex items-center">
                          <ArrowRightLeft className="h-5 w-5 mr-2 text-primary" />
                          Layer 2 Capabilities
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          Wrap existing cryptocurrencies with our quantum-resistant protocols for future-proof protection.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium flex items-center">
                          <Share2 className="h-5 w-5 mr-2 text-primary" />
                          Open Source Technology
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          Built exclusively on open-source technologies that can be easily upgraded as new options emerge.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">The Vision</h3>
                      <p className="text-muted-foreground">
                        Singularity Coin is designed to be the foundation of a new financial ecosystem that remains 
                        secure in the quantum computing era. Our network architecture uses fractal recursive Mandelbrot sets
                        to create a self-similar security structure that scales with network growth. The result is a
                        blockchain that becomes more secure as it grows, rather than more vulnerable.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tokenomics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Economics</CardTitle>
                    <CardDescription>Distribution and usage of SING tokens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Token Distribution</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-card rounded-lg border p-4">
                            <div className="text-4xl font-bold mb-1">1B</div>
                            <div className="text-muted-foreground">Total Supply</div>
                          </div>
                          
                          <div className="bg-card rounded-lg border p-4">
                            <div className="text-4xl font-bold mb-1">30%</div>
                            <div className="text-muted-foreground">ICO Allocation</div>
                          </div>
                          
                          <div className="bg-card rounded-lg border p-4">
                            <div className="text-4xl font-bold mb-1">25%</div>
                            <div className="text-muted-foreground">Ecosystem Development</div>
                          </div>
                          
                          <div className="bg-card rounded-lg border p-4">
                            <div className="text-4xl font-bold mb-1">20%</div>
                            <div className="text-muted-foreground">Team & Advisors (3yr vesting)</div>
                          </div>
                          
                          <div className="bg-card rounded-lg border p-4">
                            <div className="text-4xl font-bold mb-1">15%</div>
                            <div className="text-muted-foreground">Treasury & Operations</div>
                          </div>
                          
                          <div className="bg-card rounded-lg border p-4">
                            <div className="text-4xl font-bold mb-1">10%</div>
                            <div className="text-muted-foreground">Community Rewards</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Token Utility</h3>
                        <ul className="space-y-2">
                          <li className="flex gap-2">
                            <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                              <Zap className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="font-medium">Network Fees</span>
                              <p className="text-muted-foreground text-sm">Pay for transactions and smart contract executions</p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                              <Zap className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="font-medium">Quantum Wrapping</span>
                              <p className="text-muted-foreground text-sm">Used as collateral when wrapping existing cryptocurrencies</p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                              <Zap className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="font-medium">Governance</span>
                              <p className="text-muted-foreground text-sm">Vote on protocol upgrades and parameter changes</p>
                            </div>
                          </li>
                          <li className="flex gap-2">
                            <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                              <Zap className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <span className="font-medium">Staking Rewards</span>
                              <p className="text-muted-foreground text-sm">Earn passive income by contributing to network security</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="roadmap" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Development Roadmap</CardTitle>
                    <CardDescription>Our path to becoming the standard in quantum-secure blockchain technology</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative border-l border-muted pl-6 pb-2">
                      <div className="mb-8 relative">
                        <div className="absolute -left-[25px] flex h-6 w-6 items-center justify-center rounded-full border bg-primary text-white">
                          1
                        </div>
                        <div className="text-lg font-medium mb-1">Q2 2025</div>
                        <div className="text-primary font-medium">ICO Launch & Network Genesis</div>
                        <ul className="mt-2 space-y-1 text-muted-foreground">
                          <li>• Initial Coin Offering completion</li>
                          <li>• Mainnet launch with core quantum resistance features</li>
                          <li>• First quantum-resistant wallet releases</li>
                        </ul>
                      </div>
                      
                      <div className="mb-8 relative">
                        <div className="absolute -left-[25px] flex h-6 w-6 items-center justify-center rounded-full border border-primary bg-background text-primary">
                          2
                        </div>
                        <div className="text-lg font-medium mb-1">Q3 2025</div>
                        <div className="text-muted-foreground font-medium">Layer 2 Integration</div>
                        <ul className="mt-2 space-y-1 text-muted-foreground">
                          <li>• Layer 2 quantum wrapper protocol launch</li>
                          <li>• Integration with first 5 major cryptocurrencies</li>
                          <li>• DEX listings and liquidity pool establishment</li>
                        </ul>
                      </div>
                      
                      <div className="mb-8 relative">
                        <div className="absolute -left-[25px] flex h-6 w-6 items-center justify-center rounded-full border border-primary bg-background text-primary">
                          3
                        </div>
                        <div className="text-lg font-medium mb-1">Q4 2025</div>
                        <div className="text-muted-foreground font-medium">Ecosystem Expansion</div>
                        <ul className="mt-2 space-y-1 text-muted-foreground">
                          <li>• Smart contract functionality with quantum resistance</li>
                          <li>• Developer SDK and API releases</li>
                          <li>• Cross-chain compatibility features</li>
                        </ul>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute -left-[25px] flex h-6 w-6 items-center justify-center rounded-full border border-primary bg-background text-primary">
                          4
                        </div>
                        <div className="text-lg font-medium mb-1">Q1-Q2 2026</div>
                        <div className="text-muted-foreground font-medium">Global Adoption Phase</div>
                        <ul className="mt-2 space-y-1 text-muted-foreground">
                          <li>• Enterprise integration partnerships</li>
                          <li>• Regulatory compliance framework</li>
                          <li>• Advanced quantum security enhancements</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="faq" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Common questions about the Singularity Coin ICO</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">What is the minimum investment?</h3>
                        <p className="text-muted-foreground mt-1">
                          The minimum investment is $50 USD equivalent. There is no maximum investment limit during the public ICO phase.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Which payment methods are accepted?</h3>
                        <p className="text-muted-foreground mt-1">
                          We accept ETH, BTC, USDT, and USDC for ICO participation. All transactions are processed through secure smart contracts.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">When will tokens be distributed?</h3>
                        <p className="text-muted-foreground mt-1">
                          SING tokens will be distributed immediately after purchase, but they will be locked until the 
                          network genesis. You'll be able to view your balance in your wallet right after purchase.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">How is Singularity Coin quantum-resistant?</h3>
                        <p className="text-muted-foreground mt-1">
                          We implement post-quantum cryptographic algorithms like CRYSTAL-Kyber for key exchanges and SPHINCS+ 
                          for digital signatures. These are NIST-approved algorithms designed to resist attacks from quantum computers.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">What happens if the ICO doesn't reach its target?</h3>
                        <p className="text-muted-foreground mt-1">
                          If the soft cap is not reached, participants will have the option to receive a full refund or maintain their 
                          token allocation with adjusted tokenomics. All decisions will be made transparently with community input.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium">Is there a vesting period?</h3>
                        <p className="text-muted-foreground mt-1">
                          ICO participants receive tokens without vesting restrictions. Team and advisor allocations 
                          are subject to a 3-year vesting schedule with a 6-month cliff to ensure long-term commitment.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Connect Your Wallet</CardTitle>
                <CardDescription>
                  Connect a wallet to participate in the ICO
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CelebratingWalletConnector />
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>ICO Progress</CardTitle>
                <CardDescription>Current token sale statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span className="font-medium">42%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tokens Sold</span>
                    <span>126,000,000 SING</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining</span>
                    <span>174,000,000 SING</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Funds Raised</span>
                    <span>$81,396,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token Price</span>
                    <span>$0.000646</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
                <CardDescription>Join these early adopters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary mr-2" />
                    <span className="font-medium">5,387 participants</span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm">View All</Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Coming soon</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium">AB</span>
                      </div>
                      <div className="text-sm">0x7F3a...e82B</div>
                    </div>
                    <div className="text-sm font-medium">1,250,000 SING</div>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium">CD</span>
                      </div>
                      <div className="text-sm">0x3B7d...a91F</div>
                    </div>
                    <div className="text-sm font-medium">850,000 SING</div>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium">EF</span>
                      </div>
                      <div className="text-sm">0x9A2c...f47D</div>
                    </div>
                    <div className="text-sm font-medium">625,000 SING</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Last updated: April 4, 2025, 14:32 UTC
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </WalletProvider>
  );
};

export default ICOPage;