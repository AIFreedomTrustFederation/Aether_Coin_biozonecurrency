import React from 'react';
import {
  Download,
  FileText,
  Shield,
  Layers,
  BarChart,
  Zap,
  Lock,
  RefreshCw,
  LucideProps,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define the Network component that was imported but doesn't exist in lucide-react
const Network = (props: LucideProps) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="6" height="6" rx="1" />
      <rect x="16" y="16" width="6" height="6" rx="1" />
      <rect x="16" y="2" width="6" height="6" rx="1" />
      <rect x="2" y="16" width="6" height="6" rx="1" />
      <path d="M5 8v8" />
      <path d="M19 8v8" />
      <path d="M8 5h8" />
      <path d="M8 19h8" />
    </svg>
  );
};

// Define the Vote component that was imported but doesn't exist in lucide-react
const Vote = (props: LucideProps) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 7h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
      <path d="m22 10-3 3 3 3" />
    </svg>
  );
};

const WhitepaperPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Aetherion Whitepaper</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Pioneering the Quantum-Resistant Blockchain Ecosystem
        </p>
        <div className="flex justify-center gap-4">
          <Button className="gap-2">
            <Download size={16} />
            Download PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <FileText size={16} />
            View Full Version
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="md:col-span-3 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Abstract</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">
              Aetherion establishes a universally secure, decentralized infrastructure built on quantum-resilient 
              protocols, recursive fractal governance, and innovative tokenomics. The platform's technical architecture 
              provides a secure, scalable, and quantum-resistant blockchain ecosystem built around the Singularity Coin (SING) 
              Layer 1 blockchain. AI-driven systems and quantum computing advancements ensure the network scales to 
              universal proportions while maintaining security against emerging threats.
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="architecture" className="mb-12">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 w-full">
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
          <TabsTrigger value="security">Security & Compliance</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="mt-6">
          <h2 className="text-2xl font-bold mb-6">Technical Architecture & Infrastructure</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="h-5 w-5 text-primary" />
                  <CardTitle>Layer 1: Singularity Coin (SING)</CardTitle>
                </div>
                <CardDescription>
                  The foundation of the Aetherion ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Singularity Coin forms the backbone of the Aetherion ecosystem, providing a quantum-resistant 
                  blockchain layer with advanced consensus mechanisms and security protocols.
                </p>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="hybrid-consensus">
                    <AccordionTrigger className="text-base font-medium">
                      Hybrid Consensus Mechanism
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-2">
                      <p>• Combines Proof-of-Work (PoW) for security and Proof-of-Stake (PoS) for energy efficiency.</p>
                      <p>• Dynamic consensus switching allows optimization based on network demand and energy availability.</p>
                      <p>• AI-Assisted Consensus Optimization for real-time performance enhancements.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="quantum-protocols">
                    <AccordionTrigger className="text-base font-medium">
                      Quantum-Resilient Security Protocols
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-2">
                      <p>• CRYSTALS-Kyber: Lattice-based key exchange protocol providing quantum-secure connections.</p>
                      <p>• CRYSTALS-Dilithium: Lattice-based digital signature scheme ensuring robust security against quantum threats.</p>
                      <p>• Falcon: Optimized lattice-based signature protocol for low-latency transactions.</p>
                      <p>• NTRU: Lattice-based encryption protocol enhancing speed and security.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="governance">
                    <AccordionTrigger className="text-base font-medium">
                      Recursive Fractal Governance Protocol (RFGP)
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-2">
                      <p>• Recursive fractal partitioning protocols for dynamic sharding and network scaling.</p>
                      <p>• Self-correcting governance model inspired by recursive structures of the Mandelbrot Set.</p>
                      <p>• Supports decentralized, peer-to-peer governance systems with integrated voting and revenue-sharing mechanisms.</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Network className="h-5 w-5 text-primary" />
                  <CardTitle>Interoperability & Data Integrity</CardTitle>
                </div>
                <CardDescription>
                  Connecting blockchains while ensuring data security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Aetherion's architecture enables seamless integration with existing blockchain ecosystems while
                  maintaining quantum-resistant security for all data.
                </p>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="interoperability">
                    <AccordionTrigger className="text-base font-medium">
                      Interoperability Framework
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-2">
                      <p>• Cross-chain compatibility with Bitcoin, Ethereum, Polkadot, Cosmos, Solana, and others.</p>
                      <p>• Universal Smart Contract Interface (USCI) for dApp integration.</p>
                      <p>• Quantum-Enhanced Data Oracles providing reliable real-time data feeds.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="data-integrity">
                    <AccordionTrigger className="text-base font-medium">
                      Quantum-Enhanced Data Integrity
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground space-y-2">
                      <p>• Recursive Merkle Trees (RMTs) for quantum-resistant data indexing and retrieval.</p>
                      <p>• Quantum Vaults for secure backend storage of funds and data.</p>
                      <p>• Immutable Smart Contract Voting for tamper-proof governance.</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-card border rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-primary" />
              Fractalcoin Layer 2 Technology
            </h3>
            <p className="text-muted-foreground mb-4">
              Fractalcoin (FCT) operates as a Layer 2 solution built on top of the Singularity Coin blockchain, 
              providing enhanced scalability through recursive fractal sharding protocols. This technology enables:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <li className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-primary/10 p-1 flex-shrink-0">
                  <RefreshCw className="h-4 w-4 text-primary" />
                </div>
                <span>Dynamic network scaling without compromising security</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-primary/10 p-1 flex-shrink-0">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <span>Enhanced transaction throughput with minimal latency</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-primary/10 p-1 flex-shrink-0">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <span>Quantum-resistant security across all sharded partitions</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-primary/10 p-1 flex-shrink-0">
                  <Share2 className="h-4 w-4 text-primary" />
                </div>
                <span>Interoperability with major Layer 1 blockchains</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              The fractal recursive approach ensures that as the network grows, its security and performance 
              characteristics improve, creating a self-reinforcing ecosystem that becomes stronger with adoption.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="tokenomics" className="mt-6">
          <h2 className="text-2xl font-bold mb-6">Tokenomics & Fundraising Strategy</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Token Structure</CardTitle>
                <CardDescription>
                  Aetherion's dual-token ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-primary" />
                      Singularity Coin (SING)
                    </h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p><span className="font-medium">Total Supply:</span> 10 Billion coins</p>
                      <p><span className="font-medium">Initial Distribution:</span> 1 Billion coins allocated for the Founders' Round</p>
                      <p><span className="font-medium">Use Cases:</span> Governance, staking, transaction fees, liquidity pool creation, interoperability mechanisms, and smart contract deployment</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <RefreshCw className="h-5 w-5 mr-2 text-primary" />
                      Fractalcoin (FCT)
                    </h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p><span className="font-medium">Total Supply:</span> 100 Billion coins</p>
                      <p><span className="font-medium">Use Cases:</span> Fractal sharding rewards, gas fee compensation, liquidity provision incentives, and cross-chain integrations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market-Making Mechanisms</CardTitle>
                <CardDescription>
                  Ensuring liquidity and price stability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Liquidity Pool Creation</h3>
                    <p className="text-muted-foreground text-sm">Transaction fees fund liquidity pools for various trading pairs. Liquidity providers rewarded with native tokens (SING, FCT) and other assets.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Bonding Curves</h3>
                    <p className="text-muted-foreground text-sm">Dynamic bonding curves ensure fair token distribution and price stability. Automatic market making adjusts token prices based on supply and demand.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Automated Market Analysis</h3>
                    <p className="text-muted-foreground text-sm">AI-powered systems continuously optimize staking mechanisms and liquidity provision. Governance participation maximized for economic efficiency.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Burn Mechanisms & Recursive Fractal Bonding</h3>
                    <p className="text-muted-foreground text-sm">Token burns act as a fractal decay and transformation process. Burned tokens converted into energy to power recursive fractal bonding mechanisms, enhancing liquidity pools and promoting coin value appreciation.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Fundraising Rounds</h3>
            <Table>
              <TableCaption>Aetherion's token allocation and fundraising strategy</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Round</TableHead>
                  <TableHead>Token Allocation</TableHead>
                  <TableHead>Price Range</TableHead>
                  <TableHead>Goal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Founders' Round</TableCell>
                  <TableCell>1 Billion SING coins</TableCell>
                  <TableCell>$0.000646 per coin</TableCell>
                  <TableCell>Establish AI Freedom Trust as a Wyoming-based Irrevocable Indexed Universal Life Insurance Trust (IULIT)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Seed Round</TableCell>
                  <TableCell>2 Billion SING coins</TableCell>
                  <TableCell>$0.001 - $0.005 per coin</TableCell>
                  <TableCell>Fund development of the Singularity Coin Layer 1 blockchain and initial interoperability protocols</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Private Round</TableCell>
                  <TableCell>3 Billion SING coins</TableCell>
                  <TableCell>$0.005 - $0.01 per coin</TableCell>
                  <TableCell>Finance Layer 2 Fractalcoin network expansion and recursive fractal sharding protocol development</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Public Sale</TableCell>
                  <TableCell>4 Billion SING coins</TableCell>
                  <TableCell>$0.01 - $0.05 per coin</TableCell>
                  <TableCell>Establish liquidity pools, integrate with exchanges, and promote mass adoption</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <h2 className="text-2xl font-bold mb-6">Security, Compliance, & Legal Structure</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Quantum-Resilient Security</CardTitle>
                </div>
                <CardDescription>
                  Advanced cryptographic protocols ensuring future-proof security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Aetherion implements cutting-edge quantum-resistant cryptographic protocols to ensure that all
                  transactions and data remain secure even against attacks from quantum computers.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-card rounded-lg border p-4">
                    <h4 className="font-medium mb-2">CRYSTALS-Kyber</h4>
                    <p className="text-sm text-muted-foreground">Lattice-based key exchange protocol providing quantum-secure connections for all network communications.</p>
                  </div>
                  
                  <div className="bg-card rounded-lg border p-4">
                    <h4 className="font-medium mb-2">CRYSTALS-Dilithium</h4>
                    <p className="text-sm text-muted-foreground">Lattice-based digital signature scheme ensuring robust security against quantum threats for transaction validation.</p>
                  </div>
                  
                  <div className="bg-card rounded-lg border p-4">
                    <h4 className="font-medium mb-2">Falcon</h4>
                    <p className="text-sm text-muted-foreground">Optimized lattice-based signature protocol designed specifically for low-latency transactions and fast verification.</p>
                  </div>
                  
                  <div className="bg-card rounded-lg border p-4">
                    <h4 className="font-medium mb-2">NTRU</h4>
                    <p className="text-sm text-muted-foreground">Lattice-based encryption protocol enhancing both speed and security for data protection across the network.</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  These protocols work together with Recursive Merkle Trees to create a comprehensive security 
                  framework that protects user data and transactions at every level of the network.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Vote className="h-5 w-5 text-primary" />
                  <CardTitle>Legal Structure</CardTitle>
                </div>
                <CardDescription>
                  Compliant foundation for global operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  The AI Freedom Trust forms the legal backbone of the Aetherion ecosystem, ensuring compliance
                  with regulations while protecting the interests of all network participants.
                </p>
                
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>• Structured as a Wyoming-based Irrevocable Indexed Universal Life Insurance Trust (IULIT)</p>
                  <p>• Ensures compliance with international blockchain regulations</p>
                  <p>• Provides protection through veil-piercing protected tax-free accounts</p>
                  <p>• Enables sustainable growth and development of the network</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Privacy & Data Protection Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-primary/10 p-1 flex-shrink-0">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Zero-Knowledge Proofs</h4>
                  <p className="text-sm text-muted-foreground">Ensure transaction privacy while maintaining verifiability and security against quantum attacks.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-primary/10 p-1 flex-shrink-0">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Recursive Merkle Trees</h4>
                  <p className="text-sm text-muted-foreground">Enhance data integrity and transaction validation with quantum-resistant verification processes.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-primary/10 p-1 flex-shrink-0">
                  <Network className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Secure Multi-party Computation</h4>
                  <p className="text-sm text-muted-foreground">Enables collaborative computation without revealing sensitive input data to participating parties.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="mt-1 rounded-full bg-primary/10 p-1 flex-shrink-0">
                  <RefreshCw className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Homomorphic Encryption</h4>
                  <p className="text-sm text-muted-foreground">Allows computation on encrypted data without decryption, protecting user privacy at all times.</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="mt-6">
          <h2 className="text-2xl font-bold mb-6">Development Roadmap</h2>
          
          <div className="relative border-l-2 border-primary/30 pl-8 pb-8 ml-4">
            <div className="mb-12 relative">
              <div className="absolute -left-[38px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary">Singularity Coin Layer 1 Blockchain Development</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Implement hybrid PoW and PoS consensus model</p>
                <p>• Integrate quantum-resilient cryptographic protocols</p>
                <p>• Establish AI Freedom Trust's IULIT framework</p>
              </div>
            </div>
            
            <div className="mb-12 relative">
              <div className="absolute -left-[38px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary">Fractalcoin Layer 2 Blockchain Development</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Implement recursive fractal partitioning protocols for scalable sharding rewards</p>
                <p>• Develop Fractalcoin (FCT) as a utility token for Layer 2 operations</p>
                <p>• Ensure compatibility with cross-network storage systems</p>
              </div>
            </div>
            
            <div className="mb-12 relative">
              <div className="absolute -left-[38px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary">Governance & Interoperability Enhancements</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Deploy Recursive Fractal Governance Protocol (RFGP)</p>
                <p>• Expand interoperability frameworks for multi-chain compatibility</p>
                <p>• Implement automated market analysis systems for liquidity optimization</p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -left-[38px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                <span className="text-primary font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-primary">Public Launch & Integration</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>• Launch Public ICO with dynamic bonding curves</p>
                <p>• Establish liquidity pools for trading pairs</p>
                <p>• Integrate with major wallets (Metamask, Coinbase, Binance, etc.)</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border rounded-lg p-6 mt-8">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-primary" />
              Milestones & Progress Tracking
            </h3>
            <p className="text-muted-foreground mb-6">
              Current development is focused on the Founders' Round and initial Layer 1 blockchain infrastructure. 
              The team is actively working on implementing quantum-resilient security protocols and establishing the 
              legal framework for the AI Freedom Trust.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-background rounded-lg p-4 text-center">
                <h4 className="font-bold text-xl mb-1">30%</h4>
                <p className="text-sm text-muted-foreground">Layer 1 Development</p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              
              <div className="bg-background rounded-lg p-4 text-center">
                <h4 className="font-bold text-xl mb-1">15%</h4>
                <p className="text-sm text-muted-foreground">Layer 2 Development</p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
              
              <div className="bg-background rounded-lg p-4 text-center">
                <h4 className="font-bold text-xl mb-1">45%</h4>
                <p className="text-sm text-muted-foreground">Security Protocols</p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div className="bg-background rounded-lg p-4 text-center">
                <h4 className="font-bold text-xl mb-1">25%</h4>
                <p className="text-sm text-muted-foreground">Legal Framework</p>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <Card className="mb-8 bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">Conclusion</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed">
            Aetherion establishes a universally secure, decentralized infrastructure built on quantum-resilient 
            protocols, recursive fractal governance, and innovative tokenomics. AI-driven systems and quantum 
            computing advancements ensure the network scales to universal proportions while providing the security 
            and flexibility needed for global adoption. Through its unique approach to blockchain technology, 
            Aetherion is positioned to become a leader in the next generation of decentralized infrastructure.
          </p>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <p className="text-muted-foreground mb-4">This whitepaper is regularly updated as the project evolves.</p>
        <p className="text-sm text-muted-foreground">Last Updated: April 4, 2025</p>
      </div>
    </div>
  );
};

export default WhitepaperPage;