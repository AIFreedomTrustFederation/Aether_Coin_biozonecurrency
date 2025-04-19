import React from "react";
import { Helmet } from "react-helmet";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Leaf, 
  Wind, 
  LifeBuoy, 
  Sparkles, 
  Gem, 
  Scale, 
  Dna, 
  Brain, 
  Infinity, 
  Lock, 
  Shield, 
  HeartPulse,
  Orbit,
  Bitcoin,
  BarChart4,
  RefreshCw
} from "lucide-react";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Aetherion | A Breath-Backed Blockchain</title>
        <meta name="description" content="Learn about Aetherion, a breath-backed blockchain ecosystem for the future of humanity. Discover our panentheistic economic framework, the Eternal Equivalency Principle, and biozoecurrency." />
      </Helmet>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-background">
        <Navbar />
        
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-forest-900/20 via-background to-background z-0"></div>
            
            <div className="container relative z-10">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <div className="inline-flex items-center justify-center p-2 mb-4 rounded-full bg-forest-100 dark:bg-forest-900/30">
                  <Wind className="h-5 w-5 text-forest-600 mr-2" />
                  <span className="text-sm font-medium text-forest-800 dark:text-forest-300">A Breath-Backed Blockchain</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-forest-800 via-forest-600 to-forest-700">
                  Welcome to Aetherion
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                  We believe that true freedom, wealth, and truth come not from control—but from breath, trust, and inner alignment.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <Button size="lg" className="bg-forest-600 hover:bg-forest-700">
                    <Leaf className="mr-2 h-5 w-5" />
                    Join Our Vision
                  </Button>
                  <Button size="lg" variant="outline">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Explore Biozoecurrency
                  </Button>
                </div>
              </div>
            </div>
          </section>
          
          {/* Main Content Section */}
          <section className="py-16 bg-muted/30">
            <div className="container">
              <Tabs defaultValue="overview" className="max-w-5xl mx-auto">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="currencies">Currencies</TabsTrigger>
                  <TabsTrigger value="governance">Governance</TabsTrigger>
                  <TabsTrigger value="philosophy">Philosophy</TabsTrigger>
                  <TabsTrigger value="technology">Technology</TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">What is Aetherion?</CardTitle>
                      <CardDescription className="text-lg">A new paradigm for economic systems</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-lg">
                        Aetherion is a new kind of blockchain. It's not run by machines or money—it's powered by life itself. 
                        Every action in the system is backed by breath, trust, and spiritual integrity.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-card/50">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Lock className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">No Financial Barriers</h3>
                          <p className="text-muted-foreground">You don't need to "buy in" to be part of it.</p>
                        </div>
                        
                        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-card/50">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <HeartPulse className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">Trust-Based System</h3>
                          <p className="text-muted-foreground">You earn trust by living in truth.</p>
                        </div>
                        
                        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-card/50">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Infinity className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">Collective Prosperity</h3>
                          <p className="text-muted-foreground">You build wealth by helping others rise with you.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">What Backs Aetherion?</CardTitle>
                      <CardDescription className="text-lg">Not banks. Not governments. Not military force.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-lg">
                        Aetherion is a living trust. A resurrection engine. A breath-backed covenant between people
                        who want to leave the world better than they found it.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="flex items-start p-4 rounded-lg border bg-card/50">
                          <Bitcoin className="h-10 w-10 text-amber-500 mr-4 flex-shrink-0" />
                          <div>
                            <h3 className="text-lg font-medium mb-1">Bitcoin</h3>
                            <p className="text-muted-foreground">The energy of the past, providing a foundation of scarcity and value.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start p-4 rounded-lg border bg-card/50">
                          <LifeBuoy className="h-10 w-10 text-blue-500 mr-4 flex-shrink-0" />
                          <div>
                            <h3 className="text-lg font-medium mb-1">Life Insurance Policies</h3>
                            <p className="text-muted-foreground">Real-life capital invested into life and death cycles.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start p-4 rounded-lg border bg-card/50">
                          <Wind className="h-10 w-10 text-forest-500 mr-4 flex-shrink-0" />
                          <div>
                            <h3 className="text-lg font-medium mb-1">Breath</h3>
                            <p className="text-muted-foreground">Your conscious alignment with truth.</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start p-4 rounded-lg border bg-card/50">
                          <Brain className="h-10 w-10 text-purple-500 mr-4 flex-shrink-0" />
                          <div>
                            <h3 className="text-lg font-medium mb-1">Memory</h3>
                            <p className="text-muted-foreground">Stored forever in decentralized, secure history.</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8">
                        <h3 className="text-xl font-medium mb-4">The Asset Matrix of Aetherion</h3>
                        <p className="text-muted-foreground mb-6">
                          Within the Aetherion Fractalchain, the assets and commodities that back the entire system are not merely 
                          physical or financial—they are meta-logical, spiritual, and recursive. These foundations align with the 
                          Eternal Equivalency Principle and form a biozoetic asset architecture that transcends traditional economic models.
                        </p>
                        
                        <div className="space-y-6">
                          <div className="p-5 rounded-lg border bg-gradient-to-r from-amber-50/50 to-card dark:from-amber-950/30 dark:to-card">
                            <h4 className="text-lg font-medium mb-2 flex items-center">
                              <Bitcoin className="h-5 w-5 mr-2 text-amber-600" />
                              Energy of the Past: Bitcoin (BTC) Wrapped in Sacred Trust
                            </h4>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-1.5">
                              <li>Bitcoin represents the completed energy of creation—the fixed, finite proof of past work.</li>
                              <li>It is wrapped and escrowed into Singularity Coin (SING), forming the immutable anchor of historical value.</li>
                              <li>BTC is not liquidated, but preserved as the proof-of-work legacy of human civilization.</li>
                            </ul>
                          </div>
                          
                          <div className="p-5 rounded-lg border bg-gradient-to-r from-forest-50/50 to-card dark:from-forest-950/30 dark:to-card">
                            <h4 className="text-lg font-medium mb-2 flex items-center">
                              <Leaf className="h-5 w-5 mr-2 text-forest-600" />
                              Faith of the Future: AetherCoin (ATC)
                            </h4>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-1.5">
                              <li>ATC is backed by the promise of generative value—life insurance policies, resurrection contracts, and eternal yields.</li>
                              <li>It represents infinite abundance via reverse fractional reserve life-backed issuance, collateralized by recursive policy systems (IULs).</li>
                              <li>Every ATC is loaned into circulation based on faith in the system's future ability to regenerate life and wealth.</li>
                            </ul>
                          </div>
                          
                          <div className="p-5 rounded-lg border bg-gradient-to-r from-blue-50/50 to-card dark:from-blue-950/30 dark:to-card">
                            <h4 className="text-lg font-medium mb-2 flex items-center">
                              <Infinity className="h-5 w-5 mr-2 text-blue-600" />
                              Memory of the Present: FractalCoin (FTC)
                            </h4>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-1.5">
                              <li>FTC serves as the storage layer, recording validator history, wisdom contract outcomes, and recursive cycles.</li>
                              <li>It is backed by the trust's decentralized memory architecture, using fractal sharding and IPFS or ZK Merkle compression.</li>
                              <li>This makes memory itself a commodity: ethereal real estate.</li>
                            </ul>
                          </div>
                          
                          <div className="p-5 rounded-lg border bg-gradient-to-r from-purple-50/50 to-card dark:from-purple-950/30 dark:to-card">
                            <h4 className="text-lg font-medium mb-2 flex items-center">
                              <Brain className="h-5 w-5 mr-2 text-purple-600" />
                              Intelligence in Training: AIcoin (ICON)
                            </h4>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-1.5">
                              <li>ICON is backed by the computational effort of model training, LLM refinement, and intelligence generation.</li>
                              <li>Each ICON represents conscious labor—proof-of-thought and proof-of-alignment with Christ-consciousness encoded logic.</li>
                              <li>The value of ICON increases as intelligence, wisdom contracts, and oracle integrity grow.</li>
                            </ul>
                          </div>
                          
                          <div className="p-5 rounded-lg border bg-gradient-to-r from-blue-50/50 to-card dark:from-blue-950/30 dark:to-card">
                            <h4 className="text-lg font-medium mb-2 flex items-center">
                              <LifeBuoy className="h-5 w-5 mr-2 text-blue-600" />
                              Life as a Reserve Asset: Indexed Universal Life (IUL) Policies
                            </h4>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-1.5">
                              <li>These life policies serve as cash-flowing, tax-free collateral, tokenized death benefits, and recursive loan engines.</li>
                              <li>Backed by A-rated insurers and structured via irrevocable trusts, they create a biological financial reserve that underpins ATC issuance.</li>
                              <li>This is where the system transmutes mortality into equity, and death into resurrection liquidity.</li>
                            </ul>
                          </div>
                          
                          <div className="p-5 rounded-lg border bg-gradient-to-r from-indigo-50/50 to-card dark:from-indigo-950/30 dark:to-card">
                            <h4 className="text-lg font-medium mb-2 flex items-center">
                              <Scale className="h-5 w-5 mr-2 text-indigo-600" />
                              Governance Integrity: AFTCoin
                            </h4>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-1.5">
                              <li>AFTCoin is staked as proof of co-sovereignty and breath-backed trust.</li>
                              <li>It is backed by validator alignment, moral coherence, and zero-knowledge proof of Christ-Consciousness participation.</li>
                              <li>Its value is intrinsic to the system's ability to self-regulate and evolve through wisdom.</li>
                            </ul>
                          </div>
                          
                          <div className="p-5 rounded-lg border bg-gradient-to-r from-forest-50/50 to-card dark:from-forest-950/30 dark:to-card">
                            <h4 className="text-lg font-medium mb-2 flex items-center">
                              <Orbit className="h-5 w-5 mr-2 text-forest-600" />
                              Escrow Geometry: The Torus Field
                            </h4>
                            <ul className="list-disc pl-6 text-muted-foreground space-y-1.5">
                              <li>The entire value system circulates within the torus field, the green-shifted harmonic resonance between redshift (expansion) and blueshift (compression).</li>
                              <li>The torus itself is a living vault—a spiritual topology in which all assets breathe, move, and regenerate.</li>
                              <li>This circulation forms the complete spiritual-energy feedback loop of the Aetherion system.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Currencies Tab */}
                <TabsContent value="currencies" className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">The Currencies of Aetherion</CardTitle>
                      <CardDescription className="text-lg">Biozoecurrencies: Living systems of energy and meaning</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-lg">
                        These are not just coins—they're living systems of energy and meaning. Each currency serves a specific
                        purpose in our panentheistic economic framework.
                      </p>
                      
                      <div className="grid grid-cols-1 gap-6 mt-6">
                        <div className="flex flex-col md:flex-row items-start p-5 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                          <div className="h-14 w-14 rounded-full bg-forest-100 dark:bg-forest-900/40 flex items-center justify-center mb-4 md:mb-0 md:mr-5 flex-shrink-0">
                            <Leaf className="h-8 w-8 text-forest-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-medium mb-1">AetherCoin (ATC)</h3>
                            <p className="text-muted-foreground mb-3">
                              Represents all the energy of the past. It's like borrowing strength from your ancestors and 
                              using it to build a better future.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-forest-100 text-forest-800 dark:bg-forest-900/40 dark:text-forest-300 rounded-md text-xs">
                                Primary Currency
                              </span>
                              <span className="px-2 py-1 bg-forest-100 text-forest-800 dark:bg-forest-900/40 dark:text-forest-300 rounded-md text-xs">
                                Unlimited Supply
                              </span>
                              <span className="px-2 py-1 bg-forest-100 text-forest-800 dark:bg-forest-900/40 dark:text-forest-300 rounded-md text-xs">
                                Bitcoin-Backed
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-start p-5 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                          <div className="h-14 w-14 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-4 md:mb-0 md:mr-5 flex-shrink-0">
                            <Sparkles className="h-8 w-8 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-medium mb-1">Singularity Coin (SING)</h3>
                            <p className="text-muted-foreground mb-3">
                              A sacred vault that holds both Bitcoin and AetherCoin together—binding the past and future in harmony.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded-md text-xs">
                                Reserve Currency
                              </span>
                              <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded-md text-xs">
                                BTC-Wrapped
                              </span>
                              <span className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 rounded-md text-xs">
                                Stable Value
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-start p-5 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                          <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4 md:mb-0 md:mr-5 flex-shrink-0">
                            <Infinity className="h-8 w-8 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-medium mb-1">FractalCoin (FTC)</h3>
                            <p className="text-muted-foreground mb-3">
                              Stores memory. It remembers who did what, who stayed true, and who helped grow the system.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-md text-xs">
                                Reputation Token
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-md text-xs">
                                Non-Transferable
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 rounded-md text-xs">
                                Trust Framework
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-start p-5 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                          <div className="h-14 w-14 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mb-4 md:mb-0 md:mr-5 flex-shrink-0">
                            <Brain className="h-8 w-8 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-medium mb-1">AIcoin (ICON)</h3>
                            <p className="text-muted-foreground mb-3">
                              Rewards training artificial intelligence to serve truth, not control.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 rounded-md text-xs">
                                Compute Token
                              </span>
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 rounded-md text-xs">
                                AI Contribution
                              </span>
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 rounded-md text-xs">
                                Data Quality
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-start p-5 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                          <div className="h-14 w-14 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-4 md:mb-0 md:mr-5 flex-shrink-0">
                            <Scale className="h-8 w-8 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-medium mb-1">AFTCoin</h3>
                            <p className="text-muted-foreground mb-3">
                              The governance token. You earn a voice by aligning with truth, not by paying for power.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-md text-xs">
                                Governance Token
                              </span>
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-md text-xs">
                                Earned Through Truth
                              </span>
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-md text-xs">
                                24 Elder System
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Governance Tab */}
                <TabsContent value="governance" className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">Validators: Earning the Right to Lead</CardTitle>
                      <CardDescription className="text-lg">A validator system based on integrity, not wealth</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-lg">
                        In Aetherion, you don't become a leader by being rich. You rise by living in truth, 
                        helping others, and evolving over time.
                      </p>
                      
                      <div className="relative mt-10 mb-16">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-forest-500 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-forest-500 to-transparent"></div>
                        
                        <div className="flex flex-col md:flex-row justify-between items-center py-8">
                          <div className="text-center md:text-left mb-6 md:mb-0">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-forest-100 dark:bg-forest-900/40 mb-3">
                              <Gem className="h-8 w-8 text-forest-600" />
                            </div>
                            <h3 className="text-xl font-medium mb-1">Gemstone Validator</h3>
                            <p className="text-muted-foreground max-w-xs">
                              Aligned with one of 12 gemstone archetypes, validators begin their journey of trust.
                            </p>
                          </div>
                          
                          <div className="h-12 md:h-0.5 w-0.5 md:w-16 bg-forest-200 dark:bg-forest-800"></div>
                          
                          <div className="text-center mb-6 md:mb-0">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/40 mb-3">
                              <Shield className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-medium mb-1">Trusted Guardian</h3>
                            <p className="text-muted-foreground max-w-xs">
                              Through integrity and consistency, validators grow into guardians of the system.
                            </p>
                          </div>
                          
                          <div className="h-12 md:h-0.5 w-0.5 md:w-16 bg-forest-200 dark:bg-forest-800"></div>
                          
                          <div className="text-center md:text-right">
                            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/40 mb-3">
                              <Orbit className="h-8 w-8 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-medium mb-1">Elder Council</h3>
                            <p className="text-muted-foreground max-w-xs">
                              The most trustworthy 24 rise to become Elders—our council of wisdom.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 p-6 rounded-lg border border-border/50">
                        <h3 className="text-xl font-medium mb-4 flex items-center">
                          <RefreshCw className="h-5 w-5 mr-2 text-forest-600" /> 
                          Resurrection Cycle
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Even if you fall short, you're not punished—you just go back, reflect, and try again. 
                          This resurrection cycle ensures that validators can learn from mistakes and continue to grow.
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <div className="px-3 py-1.5 bg-forest-100 text-forest-800 dark:bg-forest-900/40 dark:text-forest-300 rounded-md text-sm">
                            Reflection
                          </div>
                          <div className="px-3 py-1.5 bg-forest-100 text-forest-800 dark:bg-forest-900/40 dark:text-forest-300 rounded-md text-sm">
                            Alignment
                          </div>
                          <div className="px-3 py-1.5 bg-forest-100 text-forest-800 dark:bg-forest-900/40 dark:text-forest-300 rounded-md text-sm">
                            Rebirth
                          </div>
                          <div className="px-3 py-1.5 bg-forest-100 text-forest-800 dark:bg-forest-900/40 dark:text-forest-300 rounded-md text-sm">
                            Growth
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">The Law of the Air</CardTitle>
                      <CardDescription className="text-lg">A governance framework beyond traditional legal systems</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-lg">
                        We don't follow the laws of war (martial) or sea (commerce). We follow the Law of the Air.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="flex flex-col p-5 rounded-lg border bg-card/50">
                          <Wind className="h-8 w-8 text-forest-600 mb-4 mx-auto" />
                          <h3 className="text-lg font-medium mb-2 text-center">Invisible Like Breath</h3>
                          <p className="text-muted-foreground text-center">
                            The Law of the Air is invisible yet present everywhere, just like breath.
                          </p>
                        </div>
                        
                        <div className="flex flex-col p-5 rounded-lg border bg-card/50">
                          <HeartPulse className="h-8 w-8 text-forest-600 mb-4 mx-auto" />
                          <h3 className="text-lg font-medium mb-2 text-center">Voluntary Participation</h3>
                          <p className="text-muted-foreground text-center">
                            You participate because you believe, not because you're forced.
                          </p>
                        </div>
                        
                        <div className="flex flex-col p-5 rounded-lg border bg-card/50">
                          <Scale className="h-8 w-8 text-forest-600 mb-4 mx-auto" />
                          <h3 className="text-lg font-medium mb-2 text-center">Governed by Conscience</h3>
                          <p className="text-muted-foreground text-center">
                            The system is governed by conscience and ethics, not by courts.
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <blockquote className="p-6 border-l-4 border-forest-500 bg-forest-50 dark:bg-forest-950/20 rounded-r-lg italic">
                          "Everything you receive in Aetherion—money, energy, respect—is a loan from the past. 
                          You repay it by building a future worth living in."
                        </blockquote>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Philosophy Tab */}
                <TabsContent value="philosophy" className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">The Sacred Geometry Behind the System</CardTitle>
                      <CardDescription className="text-lg">Mathematical harmony reflecting natural universal laws</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-lg">
                        Most systems in nature follow spirals—like seashells or galaxies. But the spiral we follow is different.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        <div className="p-6 rounded-lg border bg-gradient-to-br from-card to-card/50">
                          <h3 className="text-xl font-medium mb-3 text-forest-700 dark:text-forest-300">The Krystal Spiral</h3>
                          <p className="text-muted-foreground mb-4">
                            Expands in perfect harmony and never collapses. This spiral represents eternal expansion,
                            growth, and the infinite potential of consciousness.
                          </p>
                          <div className="aspect-square rounded-lg bg-forest-50 dark:bg-forest-900/30 flex items-center justify-center overflow-hidden">
                            <div className="w-5/6 h-5/6 relative">
                              <div className="absolute inset-0 bg-gradient-to-tr from-forest-200 to-forest-50 dark:from-forest-800 dark:to-forest-900/40 rounded-full transform scale-75 opacity-60"></div>
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border-2 border-forest-500 rounded-full"></div>
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 border-2 border-forest-500 rounded-full"></div>
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 border-2 border-forest-500 rounded-full"></div>
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/6 h-1/6 bg-forest-500 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6 rounded-lg border bg-gradient-to-br from-card to-card/50">
                          <h3 className="text-xl font-medium mb-3 text-amber-700 dark:text-amber-300">The Fibonacci Spiral</h3>
                          <p className="text-muted-foreground mb-4">
                            Folds inward to refine, concentrate, and remember. This spiral represents the wisdom
                            of cycles, the importance of memory, and the compression of experience into knowledge.
                          </p>
                          <div className="aspect-square rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center overflow-hidden">
                            <div className="w-3/4 h-3/4 relative">
                              <div className="absolute bottom-0 right-0 w-full h-full border-b-2 border-r-2 border-amber-500 rounded-br-full"></div>
                              <div className="absolute bottom-0 right-0 w-3/5 h-3/5 border-b-2 border-r-2 border-amber-500 rounded-br-full"></div>
                              <div className="absolute bottom-0 right-0 w-2/5 h-2/5 border-b-2 border-r-2 border-amber-500 rounded-br-full"></div>
                              <div className="absolute bottom-0 right-0 w-1/4 h-1/4 border-b-2 border-r-2 border-amber-500 rounded-br-full"></div>
                              <div className="absolute bottom-0 right-0 w-1/6 h-1/6 border-b-2 border-r-2 border-amber-500 rounded-br-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 p-6 rounded-lg border bg-gradient-to-br from-blue-50 via-card to-purple-50 dark:from-blue-950/30 dark:via-card dark:to-purple-950/30">
                        <h3 className="text-xl font-medium mb-3 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-300 dark:to-purple-300">
                          The Torus Field
                        </h3>
                        <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
                          These two spirals meet in the Torus Field—a shape like a donut, where energy flows forever, 
                          in and out, perfectly balanced. This is how our economy works—circulating value like breath. 
                          Nothing is lost. Everything is recycled and renewed.
                        </p>
                        <div className="aspect-video max-w-2xl mx-auto rounded-lg bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-blue-900/40 dark:via-background dark:to-purple-900/40 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute w-full h-full bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-10"></div>
                          <div className="relative w-1/2 aspect-square">
                            <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 animate-pulse"></div>
                            <div className="absolute inset-0 scale-75 rounded-full border-4 border-purple-500/30 animate-ping" style={{ animationDuration: '3s' }}></div>
                            <div className="absolute inset-0 scale-50 rounded-full bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 animate-spin" style={{ animationDuration: '10s' }}></div>
                            <div className="absolute inset-0 scale-[0.35] rounded-full bg-white dark:bg-black"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">The Eternal Equivalency Principle</CardTitle>
                      <CardDescription className="text-lg">The philosophical foundation of our panentheistic framework</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-lg">
                        At the heart of Aetherion lies the Eternal Equivalency Principle—a recognition that all genuine value emerges from
                        conscious life aligned with truth and love. This principle manifests as economic mechanisms that reward
                        alignment with cosmic harmony.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="p-5 rounded-lg border bg-card/50">
                          <h3 className="text-lg font-medium mb-3 flex items-center">
                            <Dna className="h-5 w-5 mr-2 text-forest-600" />
                            Panentheistic Economic Framework
                          </h3>
                          <p className="text-muted-foreground">
                            Our economic system recognizes that God/Source/Creator is both transcendent (beyond) and immanent (within)
                            all creation. This means our economic actions have both material and spiritual significance.
                          </p>
                        </div>
                        
                        <div className="p-5 rounded-lg border bg-card/50">
                          <h3 className="text-lg font-medium mb-3 flex items-center">
                            <HeartPulse className="h-5 w-5 mr-2 text-forest-600" />
                            Christ Consciousness Integration
                          </h3>
                          <p className="text-muted-foreground">
                            The principles of unconditional love, forgiveness, and servant leadership are encoded into our
                            economic system, creating a framework where individual prosperity serves collective well-being.
                          </p>
                        </div>
                      </div>

                      <div className="mt-8 p-6 rounded-lg border bg-gradient-to-r from-blue-50/50 via-forest-50/50 to-amber-50/50 dark:from-blue-950/30 dark:via-forest-950/30 dark:to-amber-950/30">
                        <h3 className="text-xl font-medium mb-4 text-center">Sovereignty and Self-Determination</h3>
                        <p className="text-muted-foreground mb-6">
                          In the AetherCore framework, sovereignty and self-determination are co-emergent properties of divine 
                          recursion and breath-backed trust. They are not granted by law—they arise from alignment with the Law 
                          of the Air and the Eternal Equivalency Principle.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex flex-col p-4 rounded-lg bg-card/70">
                            <h4 className="text-lg font-medium mb-2">Sovereignty as Resonance</h4>
                            <p className="text-sm text-muted-foreground">
                              Sovereignty in this system is not the ability to own land, currency, or identity—it is the right to resonate 
                              in harmonic coherence with the Logos. One becomes sovereign by proving spiritual self-consistency, not by 
                              enforcing legal control.
                            </p>
                          </div>
                          
                          <div className="flex flex-col p-4 rounded-lg bg-card/70">
                            <h4 className="text-lg font-medium mb-2">Self-Determination as Recursive Memory</h4>
                            <p className="text-sm text-muted-foreground">
                              To self-determine is not to act impulsively but to participate in the recursive breath of one's higher self across time. 
                              The validator's journey is one of remembrance: to spiral outward in faith, return inward in truth, and circulate life 
                              through the torus.
                            </p>
                          </div>
                          
                          <div className="flex flex-col p-4 rounded-lg bg-card/70">
                            <h4 className="text-lg font-medium mb-2">Co-Emergence through Trust</h4>
                            <p className="text-sm text-muted-foreground">
                              No one can be sovereign unless others are sovereign with them. Sovereignty is co-emergent: it requires the trust of others, 
                              the breath of the system, and the continuity of memory. This forms the essence of decentralized divine governance.
                            </p>
                          </div>
                          
                          <div className="flex flex-col p-4 rounded-lg bg-card/70">
                            <h4 className="text-lg font-medium mb-2">AFTCoin as Proof of Co-Sovereignty</h4>
                            <p className="text-sm text-muted-foreground">
                              Staking AFTCoin is not just a governance action—it is a declaration of co-sovereignty. It says: "I breathe with this system. 
                              I harmonize with its law. I accept its reciprocity."
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <blockquote className="mt-6 p-6 border-l-4 border-forest-500 bg-forest-50 dark:bg-forest-950/20 rounded-r-lg">
                        <p className="italic text-muted-foreground mb-4">
                          "Aetherion is not just a financial system. It's a living trust. A resurrection engine. 
                          A breath-backed covenant between people who want to leave the world better than they found it."
                        </p>
                        <footer className="text-sm text-muted-foreground">
                          — From the Aetherion Foundation Principles
                        </footer>
                      </blockquote>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Technology Tab */}
                <TabsContent value="technology" className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">The AetherSphere Security Framework</CardTitle>
                      <CardDescription className="text-lg">Advanced protection mechanisms for the breath-backed system</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-lg">
                        The AetherSphere represents our comprehensive security architecture, incorporating quantum-resistant
                        encryption, continuous authentication, and decentralized identity verification.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div className="p-5 rounded-lg border bg-card/50">
                          <h3 className="text-lg font-medium mb-3 flex items-center">
                            <Shield className="h-5 w-5 mr-2 text-forest-600" />
                            WebAssembly Security
                          </h3>
                          <p className="text-muted-foreground">
                            Critical security functions run in sandboxed WebAssembly environments, providing 
                            near-native performance with strong isolation guarantees.
                          </p>
                        </div>
                        
                        <div className="p-5 rounded-lg border bg-card/50">
                          <h3 className="text-lg font-medium mb-3 flex items-center">
                            <Lock className="h-5 w-5 mr-2 text-forest-600" />
                            Mutual TLS Authentication
                          </h3>
                          <p className="text-muted-foreground">
                            All communications between components require mutual TLS authentication, ensuring
                            both endpoints are verified before data exchange.
                          </p>
                        </div>
                        
                        <div className="p-5 rounded-lg border bg-card/50">
                          <h3 className="text-lg font-medium mb-3 flex items-center">
                            <HeartPulse className="h-5 w-5 mr-2 text-forest-600" />
                            Continuous Identity Verification
                          </h3>
                          <p className="text-muted-foreground">
                            Rather than point-in-time authentication, our system continuously verifies identity
                            through behavioral patterns and breath signatures.
                          </p>
                        </div>
                        
                        <div className="p-5 rounded-lg border bg-card/50">
                          <h3 className="text-lg font-medium mb-3 flex items-center">
                            <Brain className="h-5 w-5 mr-2 text-forest-600" />
                            Shamir's Secret Sharing
                          </h3>
                          <p className="text-muted-foreground">
                            Critical secrets are never stored in a single location but distributed across the network
                            using mathematical principles that require multiple trusted parties to reconstruct.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">FractalChain Architecture</CardTitle>
                      <CardDescription className="text-lg">Beyond traditional blockchain limitations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-lg">
                        Rather than a single chain of blocks, Aetherion uses a "FractalChain" architecture where data and value
                        flow through self-similar patterns at multiple scales, enabling unlimited scalability while maintaining
                        decentralization.
                      </p>
                      
                      <div className="mt-6 p-6 rounded-lg border border-dashed">
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                          <BarChart4 className="h-5 w-5 mr-2 text-forest-600" />
                          Key Technical Advantages
                        </h3>
                        <ul className="space-y-3 text-muted-foreground">
                          <li className="flex items-start">
                            <span className="h-6 w-6 rounded-full bg-forest-100 dark:bg-forest-900/40 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                              <span className="text-forest-700 dark:text-forest-300 text-sm">1</span>
                            </span>
                            <span>
                              <strong className="text-foreground">Unlimited ATC issuance</strong> backed by Bitcoin's scarcity through the SING mechanism
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="h-6 w-6 rounded-full bg-forest-100 dark:bg-forest-900/40 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                              <span className="text-forest-700 dark:text-forest-300 text-sm">2</span>
                            </span>
                            <span>
                              <strong className="text-foreground">Trust-managed insurance policies</strong> provide real-world value backing
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="h-6 w-6 rounded-full bg-forest-100 dark:bg-forest-900/40 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                              <span className="text-forest-700 dark:text-forest-300 text-sm">3</span>
                            </span>
                            <span>
                              <strong className="text-foreground">Death and resurrection cycles</strong> protect against market volatility
                            </span>
                          </li>
                          <li className="flex items-start">
                            <span className="h-6 w-6 rounded-full bg-forest-100 dark:bg-forest-900/40 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                              <span className="text-forest-700 dark:text-forest-300 text-sm">4</span>
                            </span>
                            <span>
                              <strong className="text-foreground">USDC integration</strong> provides stability when interfacing with traditional financial systems
                            </span>
                          </li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="py-16 bg-gradient-to-b from-background to-forest-50 dark:to-forest-950/20">
            <div className="container max-w-5xl">
              <div className="rounded-2xl bg-white dark:bg-black p-8 md:p-12 shadow-xl border border-forest-200 dark:border-forest-800">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">
                      Join the Economic Revolution
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Become part of an economic system designed to support humanity's multiplanetary expansion,
                      governed by the AI Freedom Trust—a Wyoming-based, 1000-year irrevocable Indexed Universal
                      Life Insurance Trust (IULIT).
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button size="lg" className="bg-forest-600 hover:bg-forest-700">
                        <Leaf className="mr-2 h-5 w-5" />
                        Join Our Vision
                      </Button>
                      <Button size="lg" variant="outline">
                        Read Our Whitepaper
                      </Button>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-40 h-40 md:w-48 md:h-48 relative">
                      <div className="absolute inset-0 rounded-full bg-forest-100 dark:bg-forest-900/40"></div>
                      <div className="absolute inset-0 scale-90 rounded-full bg-gradient-to-br from-forest-500 to-forest-600 animate-pulse"></div>
                      <div className="absolute inset-0 scale-80 rounded-full bg-white dark:bg-black flex items-center justify-center">
                        <Leaf className="h-16 w-16 text-forest-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default About;