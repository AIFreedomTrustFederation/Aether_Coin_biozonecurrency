import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  FileText, 
  GitMerge, 
  BarChart2, 
  RefreshCw, 
  Zap, 
  Leaf, 
  Cpu, 
  ArrowRight, 
  Download,
  Coins,
  Share2 
} from 'lucide-react';

const BiozoecurrencyDocumentation = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          Biozoecurrency Documentation
        </CardTitle>
        <CardDescription>
          Understanding Aetherion's revolutionary approach to blockchain economics
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mathematical-foundations">Mathematical Foundations</TabsTrigger>
            <TabsTrigger value="inverse-model">Inverse Model</TabsTrigger>
            <TabsTrigger value="ecosystem">Ecosystem</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h3>What is Biozoecurrency?</h3>
              <p>
                Biozoecurrency is a revolutionary paradigm that transcends traditional cryptocurrency models 
                by aligning digital economic systems with natural biological processes, creating an 
                ecosystem that prioritizes sustainable growth over speculative value extraction.
              </p>
              
              <p>
                Unlike conventional cryptocurrencies that often follow a "race to the bottom" with diminishing 
                returns for later participants, Aetherion implements an inverse model where later adopters 
                benefit from accumulated system growth through mechanisms such as airdrops from the death 
                and resurrection process, IUL (Indexed Universal Life) policy loans, and recursive fractal 
                growth patterns.
              </p>
              
              <div className="bg-primary/10 p-4 rounded-lg my-4 border border-primary/20">
                <h4 className="text-primary mt-0 flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Core Principles
                </h4>
                <ul className="mt-2">
                  <li>
                    <strong>Natural Mathematical Foundations:</strong> Built on sacred geometry, Pi ratios, 
                    Fibonacci sequences, fractal recursive Mandelbrot sets, and Merkle tree growth patterns.
                  </li>
                  <li>
                    <strong>Recursive Transformation:</strong> Implements death and resurrection cycles in 
                    which tokens are transformed rather than depleted, maintaining ecosystem balance.
                  </li>
                  <li>
                    <strong>Inverse Incentive Structure:</strong> Later participants face lower barriers to 
                    entry through natural distribution mechanisms, unlike traditional first-mover advantage systems.
                  </li>
                  <li>
                    <strong>Sustainable Growth:</strong> Growth is aligned with natural limits and patterns rather 
                    than unbounded exponential expectations that lead to boom-bust cycles.
                  </li>
                </ul>
              </div>
              
              <h3>Key Components</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
                <Card className="bg-secondary/10">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center">
                      <Coins className="h-4 w-4 mr-2 text-primary" />
                      Token Triad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm">
                    <p>AetherCoin (ATC), Singularity Coin (SING), and FractalCoin (FRAC) form an interconnected 
                    system that maintains ecological balance through transformation cycles.</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-secondary/10">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center">
                      <RefreshCw className="h-4 w-4 mr-2 text-primary" />
                      Recursive Cycles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm">
                    <p>Death and resurrection cycles transform tokens through natural processes, 
                    creating a balanced ecosystem that rewards participation over time.</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-secondary/10">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center">
                      <Leaf className="h-4 w-4 mr-2 text-primary" />
                      Organic Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-sm">
                    <p>Growth patterns follow natural mathematical principles, creating 
                    resilience against economic shocks and promoting long-term stability.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex flex-col md:flex-row items-center gap-6 bg-card p-6 rounded-lg border">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                  <Cpu className="h-12 w-12 text-primary" />
                </div>
              </div>
              
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl font-medium">Aetherion: Beyond Cryptocurrency</h3>
                <p className="text-muted-foreground">
                  Aetherion establishes a biozoecurrency framework that transcends traditional 
                  crypto economic models by implementing recursive fractal patterns aligned with 
                  natural growth. This creates an ecosystem where technology advancement harmonizes 
                  with ecological sustainability.
                </p>
                <div className="pt-2">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Read Whitepaper
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="mathematical-foundations" className="space-y-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h3>Sacred Mathematical Foundations</h3>
              <p>
                Aetherion's biozoecurrency model is built upon timeless mathematical principles that 
                govern natural growth patterns throughout the universe. These mathematical foundations 
                ensure that the economic system follows sustainable, balanced development rather than 
                unsustainable exponential growth.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Fibonacci Sequences</CardTitle>
                    <CardDescription>1, 1, 2, 3, 5, 8, 13, 21, 34...</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm">
                      The Fibonacci sequence, where each number is the sum of the two preceding ones, 
                      creates a growth pattern that appears throughout nature. In Aetherion, this sequence 
                      governs token distribution rates and network growth patterns.
                    </p>
                    <div className="mt-3 p-3 bg-secondary/10 rounded-md font-mono text-xs">
                      F(n) = F(n-1) + F(n-2)<br />
                      Ratio approaches φ = 1.6180339887...
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Pi Ratios</CardTitle>
                    <CardDescription>π = 3.14159265358979...</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm">
                      Pi, the ratio of a circle's circumference to its diameter, represents perfect 
                      cyclical relationships. Aetherion uses Pi ratios to govern the transformation 
                      cycles between tokens and establish balanced distribution mechanisms.
                    </p>
                    <div className="mt-3 p-3 bg-secondary/10 rounded-md font-mono text-xs">
                      Cycle(t) = f(sin(πt))<br />
                      Creates natural oscillation patterns
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Mandelbrot Sets</CardTitle>
                    <CardDescription>z = z² + c</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm">
                      The Mandelbrot set, the most famous fractal, demonstrates infinite complexity 
                      emerging from simple recursive equations. Aetherion's governance and consensus 
                      mechanisms incorporate these recursive patterns to ensure system stability.
                    </p>
                    <div className="mt-3 p-3 bg-secondary/10 rounded-md font-mono text-xs">
                      For each point c in the complex plane:<br />
                      z₀ = 0<br />
                      z&#8201;&#8321; = z&#8201;&#8320;² + c
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Merkle Tree Growth</CardTitle>
                    <CardDescription>Hash-based data structures</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm">
                      Merkle trees provide efficient and secure verification of large data structures. 
                      Aetherion extends this concept to create fractal data organization patterns that 
                      scale naturally with network growth while maintaining security.
                    </p>
                    <div className="mt-3 p-3 bg-secondary/10 rounded-md font-mono text-xs">
                      ParentHash = Hash(ChildLeft + ChildRight)<br />
                      Creates verifiable recursive structures
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <h3 className="mt-6">Applied Sacred Geometry</h3>
              <p>
                Beyond pure mathematical formulas, Aetherion incorporates sacred geometry principles 
                that have guided architectural, artistic, and scientific understanding for millennia. 
                These principles manifest in the token distribution, governance structure, and consensus 
                mechanisms.
              </p>
              
              <div className="bg-secondary/10 p-4 rounded-lg my-4 border">
                <h4 className="mt-0 mb-2">Key Applications</h4>
                <ul className="space-y-2 mb-0">
                  <li>
                    <strong>Vesica Piscis:</strong> Used to model interaction zones between different 
                    token types, establishing natural overlap patterns.
                  </li>
                  <li>
                    <strong>Flower of Life:</strong> Provides the template for network node 
                    organization, ensuring balanced distribution and resilience.
                  </li>
                  <li>
                    <strong>Golden Ratio (φ):</strong> Applied to fee structures and reward 
                    calculations to create naturally pleasing economic incentives.
                  </li>
                  <li>
                    <strong>Metatron's Cube:</strong> Forms the structural foundation for the 
                    multi-dimensional relationships between network participants.
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="inverse-model" className="space-y-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h3>The Inverse Model: Beyond the Race to the Bottom</h3>
              <p>
                Traditional cryptocurrency models often create a "race to the bottom" where early adopters 
                gain disproportionate advantages, creating unsustainable concentration of wealth and diminishing 
                returns for new participants. Aetherion's biozoecurrency implements an inverse model that 
                reverses this dynamic.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                <Card className="bg-red-500/10 dark:bg-red-900/20 border-red-500/30">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Traditional Cryptocurrency</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-red-500/20 p-1 rounded">
                        <ArrowRight className="h-4 w-4 text-red-500" />
                      </div>
                      <p className="text-sm">Early adopters receive exponential returns</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-red-500/20 p-1 rounded">
                        <ArrowRight className="h-4 w-4 text-red-500" />
                      </div>
                      <p className="text-sm">High barriers to entry for later participants</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-red-500/20 p-1 rounded">
                        <ArrowRight className="h-4 w-4 text-red-500" />
                      </div>
                      <p className="text-sm">Wealth concentration accelerates over time</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-red-500/20 p-1 rounded">
                        <ArrowRight className="h-4 w-4 text-red-500" />
                      </div>
                      <p className="text-sm">Rewards diminish as network grows</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-red-500/20 p-1 rounded">
                        <ArrowRight className="h-4 w-4 text-red-500" />
                      </div>
                      <p className="text-sm">Value extraction prioritized over ecosystem health</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-500/10 dark:bg-green-900/20 border-green-500/30">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Aetherion Biozoecurrency</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-500/20 p-1 rounded">
                        <ArrowRight className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-sm">Fair initial distribution with sustainable growth</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-green-500/20 p-1 rounded">
                        <ArrowRight className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-sm">Lower barriers to entry for later participants</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-green-500/20 p-1 rounded">
                        <ArrowRight className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-sm">Wealth distribution through recursive cycles</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-green-500/20 p-1 rounded">
                        <ArrowRight className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-sm">New participants benefit from system maturity</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-green-500/20 p-1 rounded">
                        <ArrowRight className="h-4 w-4 text-green-500" />
                      </div>
                      <p className="text-sm">Ecosystem health prioritized over extraction</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <h3 className="mt-6">Key Mechanisms of the Inverse Model</h3>
              
              <h4>1. Death and Resurrection Process</h4>
              <p>
                Unlike traditional blockchains where tokens are permanent, Aetherion implements a natural 
                lifecycle for tokens. AetherCoin (ATC) gradually transforms into Singularity Coin (SING) 
                through a process that mimics natural recycling. This transformation follows mathematical 
                principles that ensure balance in the ecosystem:
              </p>
              <div className="bg-secondary/10 p-3 rounded-md font-mono text-xs not-prose">
                ATC_decay(t) = ATC_total(t) * decay_rate * (1 - e^(-t/τ))<br />
                SING_generated(t) = ATC_decay(t) * transformation_efficiency<br />
                Where τ is the characteristic time constant based on Pi ratios
              </div>
              
              <h4>2. Indexed Universal Life (IUL) Policy Loans</h4>
              <p>
                The system enables over-collateralized loans ranging from 150% to 200% of USDC-denominated 
                IUL policies through liquidity pools. These loans are self-repaying through transaction fees, 
                creating a revolutionary paradigm where:
              </p>
              <ul>
                <li>Participants can access liquidity without selling tokens</li>
                <li>Loan repayment occurs naturally through system participation</li>
                <li>Collateral grows in value through the natural transformation cycle</li>
                <li>Risk is distributed across the ecosystem rather than concentrated</li>
              </ul>
              
              <h4>3. Airdrops from System Maturation</h4>
              <p>
                As the system matures, new participants receive airdrops that reflect the accumulated 
                wisdom and resources of the ecosystem. This creates increasingly favorable conditions 
                for late adopters:
              </p>
              <ul>
                <li>Initial airdrops provide baseline participation capability</li>
                <li>Airdrop amount scales with system maturity</li>
                <li>Distribution follows Fibonacci patterns for natural allocation</li>
                <li>Creates an equitable onboarding process regardless of entry timing</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="ecosystem" className="space-y-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h3>The Biozoecurrency Ecosystem</h3>
              <p>
                Aetherion's ecosystem consists of interconnected components that work together to create 
                a self-balancing economic environment. This ecosystem mimics natural systems where resources 
                flow through cycles of creation, transformation, and renewal.
              </p>
              
              <div className="my-6 p-6 bg-secondary/10 rounded-lg border not-prose">
                <h4 className="text-lg font-medium mb-4">Token Ecosystem Relationships</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
                      <span className="text-xl font-bold">ATC</span>
                    </div>
                    <h5 className="font-medium mb-1">AetherCoin</h5>
                    <p className="text-sm text-muted-foreground">
                      Mainnet native token powering governance, transaction validation, and rewards
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
                      <span className="text-xl font-bold">SING</span>
                    </div>
                    <h5 className="font-medium mb-1">Singularity Coin</h5>
                    <p className="text-sm text-muted-foreground">
                      Ultimate reward mechanism tied to macroevolutionary achievements
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                      <span className="text-xl font-bold">FRAC</span>
                    </div>
                    <h5 className="font-medium mb-1">FractalCoin</h5>
                    <p className="text-sm text-muted-foreground">
                      Storage utility token for the fractal layer 2 storage sharding system
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <svg width="320" height="60" viewBox="0 0 320 60" className="overflow-visible">
                    {/* ATC to SING arrows */}
                    <path d="M90,30 C120,10 140,10 165,30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="4 2" />
                    <path d="M170,30 L165,25 L165,35 Z" fill="currentColor" fillOpacity="0.6" />
                    <text x="120" y="15" fontSize="10" textAnchor="middle" fill="currentColor" fillOpacity="0.8">Transformation</text>
                    
                    {/* SING to ATC arrows */}
                    <path d="M170,40 C140,60 110,60 90,40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="4 2" />
                    <path d="M85,40 L90,45 L90,35 Z" fill="currentColor" fillOpacity="0.6" />
                    <text x="120" y="55" fontSize="10" textAnchor="middle" fill="currentColor" fillOpacity="0.8">Resurrection</text>
                    
                    {/* ATC to FRAC arrows */}
                    <path d="M90,20 C140,0 190,0 230,20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
                    <path d="M235,20 L230,15 L230,25 Z" fill="currentColor" fillOpacity="0.6" />
                    <text x="160" y="5" fontSize="10" textAnchor="middle" fill="currentColor" fillOpacity="0.8">Storage Allocation</text>
                    
                    {/* FRAC to SING arrows */}
                    <path d="M230,40 C180,65 130,55 170,40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
                    <path d="M175,40 L170,35 L170,45 Z" fill="currentColor" fillOpacity="0.6" />
                    <text x="195" y="55" fontSize="10" textAnchor="middle" fill="currentColor" fillOpacity="0.8">Reward</text>
                  </svg>
                </div>
              </div>
              
              <h3>Governance and Evolution</h3>
              <p>
                Aetherion's governance model follows fractal principles, creating nested levels of decision-making 
                that balance global consensus with local autonomy. This structure ensures that the ecosystem can 
                evolve naturally while maintaining overall alignment with its foundational principles.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 not-prose">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center">
                      <GitMerge className="h-4 w-4 mr-2 text-primary" />
                      Fractal Governance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ul className="space-y-2 text-sm">
                      <li>
                        <strong>Level 1:</strong> Core protocol parameters governed by ATC holders 
                        through recursive consensus
                      </li>
                      <li>
                        <strong>Level 2:</strong> Ecosystem development and resource allocation through 
                        delegated fractal councils
                      </li>
                      <li>
                        <strong>Level 3:</strong> Application-specific governance through contextual 
                        sub-DAOs
                      </li>
                      <li>
                        <strong>Level 4:</strong> Individual agent autonomy within established parameters
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center">
                      <BarChart2 className="h-4 w-4 mr-2 text-primary" />
                      Ecological Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ul className="space-y-2 text-sm">
                      <li>
                        <strong>Transformation Rate:</strong> Measures ATC to SING conversion efficiency
                      </li>
                      <li>
                        <strong>Ecosystem Diversity:</strong> Distribution of tokens and participation across 
                        the network
                      </li>
                      <li>
                        <strong>Recursive Depth:</strong> Fractal complexity of system interactions
                      </li>
                      <li>
                        <strong>Resiliency Index:</strong> System ability to maintain stability during 
                        external pressures
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <h3 className="mt-6">Real-World Integration</h3>
              <p>
                The biozoecurrency model extends beyond digital assets to create meaningful connections 
                with real-world ecological and economic systems. This integration ensures that value creation 
                in the Aetherion ecosystem contributes to broader sustainability goals:
              </p>
              
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-lg border my-4 not-prose">
                <h4 className="font-medium mb-2">Key Integration Points</h4>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                      <Leaf className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium">Ecological Regeneration</h5>
                      <p className="text-xs text-muted-foreground">
                        Transaction fees partially allocated to ecological restoration projects, 
                        creating a direct link between digital activity and physical regeneration.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                      <Cpu className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium">Computational Resource Allocation</h5>
                      <p className="text-xs text-muted-foreground">
                        FractalCoin's storage sharding system makes efficient use of physical computing 
                        resources, reducing waste through dynamic allocation.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium">Energy Efficiency</h5>
                      <p className="text-xs text-muted-foreground">
                        Quantum-resistant algorithms are designed to minimize energy consumption 
                        while maximizing security, creating sustainable long-term operation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="flex justify-between w-full">
          <Button variant="link" size="sm" className="text-muted-foreground">
            <FileText className="h-4 w-4 mr-2" />
            Read Full Whitepaper
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BiozoecurrencyDocumentation;