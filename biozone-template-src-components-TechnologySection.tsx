import React from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Check, Bot } from "lucide-react";

const TechnologySection = () => {
  return (
    <section id="technology" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold"
          >
            Our Technology
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Exploring the innovative technologies powering the AetherCore ecosystem
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="fractalchain" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="fractalchain">FractalChain</TabsTrigger>
              <TabsTrigger value="aethersphere">AetherSphere</TabsTrigger>
              <TabsTrigger value="botsystem">Bot System</TabsTrigger>
              <TabsTrigger value="biozoe">BioZoe Currency</TabsTrigger>
            </TabsList>

            <TabsContent value="fractalchain" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">FractalChain Architecture</h3>
                  <p className="text-muted-foreground">
                    Unlike traditional blockchains, FractalChain uses a recursive 
                    structure that scales efficiently through self-similar patterns, 
                    enabling superior throughput and security.
                  </p>
                  
                  <ul className="space-y-2 mt-6">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Self-healing network topology</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Nested consensus mechanisms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Quantum-resistant cryptography</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Multi-dimensional state channels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Hierarchical block structure</span>
                    </li>
                  </ul>
                </div>
                
                <div className="relative aspect-square max-w-md mx-auto">
                  <div className="sacred-rotate absolute inset-0">
                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                      <g fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/20">
                        <circle cx="50" cy="50" r="48" />
                        <circle cx="50" cy="50" r="42" />
                        <circle cx="50" cy="50" r="36" />
                        <circle cx="50" cy="50" r="30" />
                        <circle cx="50" cy="50" r="24" />
                        <circle cx="50" cy="50" r="18" />
                        <circle cx="50" cy="50" r="12" />
                        <circle cx="50" cy="50" r="6" />
                      </g>
                    </svg>
                  </div>
                  
                  <div className="sacred-rotate absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '25s' }}>
                    <svg viewBox="0 0 100 100" width="100%" height="100%">
                      <g fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/30">
                        <path d="M2,50 L98,50 M50,2 L50,98" />
                        <path d="M14.6,14.6 L85.4,85.4 M14.6,85.4 L85.4,14.6" />
                        <path d="M2,25 L98,75 M2,75 L98,25" />
                        <path d="M25,2 L75,98 M75,2 L25,98" />
                      </g>
                    </svg>
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-3/4 h-3/4">
                      {/* Fractal blocks representation */}
                      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-primary/50 bg-primary/10 rounded-lg flex items-center justify-center">
                        <div className="absolute left-0 top-0 right-0 bottom-0 flex flex-wrap justify-center items-center gap-1 p-2">
                          <div className="w-[30%] h-[30%] bg-primary/40 rounded"></div>
                          <div className="w-[30%] h-[30%] bg-primary/40 rounded"></div>
                          <div className="w-[30%] h-[30%] bg-primary/40 rounded"></div>
                          <div className="w-[30%] h-[30%] bg-primary/40 rounded"></div>
                          <div className="w-[30%] h-[30%] bg-primary/40 rounded"></div>
                          <div className="w-[30%] h-[30%] bg-primary/40 rounded"></div>
                          <div className="w-[30%] h-[30%] bg-primary/40 rounded"></div>
                          <div className="w-[30%] h-[30%] bg-primary/40 rounded"></div>
                          <div className="w-[30%] h-[30%] bg-primary/40 rounded"></div>
                        </div>
                      </div>
                      
                      {/* Connection lines */}
                      <div className="absolute inset-0">
                        <svg viewBox="0 0 100 100" width="100%" height="100%">
                          <g stroke="currentColor" strokeWidth="1" className="text-primary/30">
                            <line x1="0" y1="0" x2="25" y2="25" />
                            <line x1="100" y1="0" x2="75" y2="25" />
                            <line x1="0" y1="100" x2="25" y2="75" />
                            <line x1="100" y1="100" x2="75" y2="75" />
                          </g>
                        </svg>
                      </div>
                      
                      {/* Corner blocks */}
                      <div className="absolute top-0 left-0 w-[20%] h-[20%] border border-primary/50 bg-primary/20 rounded-md"></div>
                      <div className="absolute top-0 right-0 w-[20%] h-[20%] border border-primary/50 bg-primary/20 rounded-md"></div>
                      <div className="absolute bottom-0 left-0 w-[20%] h-[20%] border border-primary/50 bg-primary/20 rounded-md"></div>
                      <div className="absolute bottom-0 right-0 w-[20%] h-[20%] border border-primary/50 bg-primary/20 rounded-md"></div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="aethersphere" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">AetherSphere Security Framework</h3>
                  <p className="text-muted-foreground">
                    AetherSphere is our zero-trust decentralized security framework that 
                    provides comprehensive protection through multiple layers of defense 
                    and continuous verification.
                  </p>
                  
                  <ul className="space-y-2 mt-6">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>WebAssembly isolated operations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Mutual TLS authentication</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Continuous identity verification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Shamir's Secret Sharing protocol</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Multi-connection browser security</span>
                    </li>
                  </ul>
                </div>
                
                <div className="relative max-w-md mx-auto">
                  <div className="relative aspect-square">
                    {/* Sphere representation */}
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20 flex items-center justify-center aether-shift">
                      <div className="w-[85%] h-[85%] rounded-full border-4 border-primary/30 flex items-center justify-center">
                        <div className="w-[70%] h-[70%] rounded-full border-4 border-primary/40 flex items-center justify-center">
                          <div className="w-[55%] h-[55%] rounded-full bg-primary/10 border-4 border-primary/50 flex items-center justify-center">
                            <div className="w-[60%] h-[60%] rounded-full bg-primary/20 flex items-center justify-center">
                              <div className="w-[60%] h-[60%] rounded-full bg-primary/30 quantum-pulse"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Security nodes */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-md shadow-primary/50"></div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full shadow-md shadow-primary/50"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-md shadow-primary/50"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-md shadow-primary/50"></div>
                    
                    <div className="absolute top-[15%] left-[15%] w-3 h-3 bg-primary/80 rounded-full shadow-md shadow-primary/30"></div>
                    <div className="absolute top-[15%] right-[15%] w-3 h-3 bg-primary/80 rounded-full shadow-md shadow-primary/30"></div>
                    <div className="absolute bottom-[15%] left-[15%] w-3 h-3 bg-primary/80 rounded-full shadow-md shadow-primary/30"></div>
                    <div className="absolute bottom-[15%] right-[15%] w-3 h-3 bg-primary/80 rounded-full shadow-md shadow-primary/30"></div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="botsystem" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Autonomous Economic Bot Framework</h3>
                  <p className="text-muted-foreground">
                    Our innovative bot framework enables AI agents to self-fund and execute 
                    economic activities through a decentralized, secure, and intelligent 
                    infrastructure with configurable autonomy levels.
                  </p>
                  
                  <ul className="space-y-2 mt-6">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Economic decision-making models</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Learning capabilities with performance feedback</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Automated fund management features</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Owner relationship and permission models</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Bot-to-bot interaction protocols</span>
                    </li>
                  </ul>
                </div>
                
                <div className="relative max-w-md mx-auto">
                  <div className="bg-card/60 backdrop-blur-sm border border-border/60 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-md flex items-center justify-center mr-3">
                        <Bot className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Economic Bot #42</h4>
                        <p className="text-xs text-muted-foreground">Autonomy Level: 3</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-background/80 rounded-md p-3 border border-border/60">
                        <div className="text-xs text-muted-foreground mb-1">Decision Making</div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[85%] rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="bg-background/80 rounded-md p-3 border border-border/60">
                        <div className="text-xs text-muted-foreground mb-1">Learning Capability</div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[70%] rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="bg-background/80 rounded-md p-3 border border-border/60">
                        <div className="text-xs text-muted-foreground mb-1">Fund Management</div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[60%] rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="bg-background/80 rounded-md p-3 border border-border/60">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">ATC Balance</div>
                            <div className="font-medium">3,240.85</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Efficiency</div>
                            <div className="font-medium">94.2%</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground">Connected to 8 other bots</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="biozoe" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">BioZoe Currency System</h3>
                  <p className="text-muted-foreground">
                    BioZoe Currency (pronounced "biozoecurrency") combines both economic 
                    principles and spiritual concepts, deriving from the Greek words βίος (bios) 
                    and ζωή (zoe) to represent physical and spiritual life.
                  </p>
                  
                  <ul className="space-y-2 mt-6">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Death and resurrection economic cycles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>USDC-backed volatility protection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Bitcoin-backed infinite issuance model</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Trust-managed insurance policies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>Four-token economic framework</span>
                    </li>
                  </ul>
                </div>
                
                <div className="relative max-w-md mx-auto bg-card/60 backdrop-blur-sm rounded-lg border border-border/60 overflow-hidden">
                  <div className="absolute inset-0 opacity-5">
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                      <pattern id="biozoe-pattern" patternUnits="userSpaceOnUse" width="10" height="10">
                        <circle cx="5" cy="5" r="1.5" fill="currentColor" />
                      </pattern>
                      <rect x="0" y="0" width="100%" height="100%" fill="url(#biozoe-pattern)" />
                    </svg>
                  </div>
                  
                  <div className="p-6 relative z-10">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-bold text-lg">BioZoe Token System</h4>
                      <div className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">Multiplanetary Ready</div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="font-bold text-blue-500">ATC</span>
                        </div>
                        <div>
                          <div className="font-medium">AetherCore Token</div>
                          <div className="text-xs text-muted-foreground">Main currency, infinitely expandable</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <span className="font-bold text-purple-500">QTC</span>
                        </div>
                        <div>
                          <div className="font-medium">Quantum Token</div>
                          <div className="text-xs text-muted-foreground">Security and validation operations</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                          <span className="font-bold text-green-500">BZC</span>
                        </div>
                        <div>
                          <div className="font-medium">BioZoe Cycle</div>
                          <div className="text-xs text-muted-foreground">Death & resurrection economic cycles</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <span className="font-bold text-amber-500">FRC</span>
                        </div>
                        <div>
                          <div className="font-medium">Fractal Reserve</div>
                          <div className="text-xs text-muted-foreground">Governance and treasury management</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
};

export default TechnologySection;