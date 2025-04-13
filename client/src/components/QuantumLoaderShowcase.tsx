import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Zap, Atom, RotateCw, Database, Code } from "lucide-react";
import { QuantumLoader } from "@/components/ui/quantum-loader";

const QuantumLoaderShowcase = () => {
  const [activeLoader, setActiveLoader] = useState<string>("transactional");
  
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-display font-bold mb-4"
          >
            <span className="gradient-text">Quantum</span> Processing
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground"
          >
            Experience our quantum-inspired animation sequences, reflecting the fundamental principles
            of quantum mechanics that underpin our panentheistic economic model.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Loader Display Card */}
          <Card className="bg-black/50 border-gray-800 overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[400px] flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black quantum-showcase-bg">
                {activeLoader === "transactional" && (
                  <div className="text-center">
                    <QuantumLoader 
                      size="lg" 
                      variant="dual" 
                      showLabel 
                      labelText="Processing Transaction" 
                    />
                    <p className="text-xs text-gray-400 mt-6 max-w-xs mx-auto">
                      Our transaction processing algorithm mirrors quantum superposition,
                      enabling parallel validation of multiple states simultaneously.
                    </p>
                  </div>
                )}
                
                {activeLoader === "consensus" && (
                  <div className="text-center">
                    <QuantumLoader 
                      size="lg" 
                      variant="forest" 
                      showLabel 
                      labelText="Fractalchain Consensus" 
                    />
                    <p className="text-xs text-gray-400 mt-6 max-w-xs mx-auto">
                      Our βίος (bios) principle manifested through distributed consensus -
                      reaching agreement across multiple validation nodes without central authority.
                    </p>
                  </div>
                )}
                
                {activeLoader === "verification" && (
                  <div className="text-center">
                    <QuantumLoader 
                      size="lg" 
                      variant="water" 
                      showLabel 
                      labelText="Quantum Verification" 
                    />
                    <p className="text-xs text-gray-400 mt-6 max-w-xs mx-auto">
                      Our ζωή (zoē) principle expressed through multi-dimensional verification,
                      ensuring immutable security through quantum-resistant signatures.
                    </p>
                  </div>
                )}
                
                {activeLoader === "integration" && (
                  <div className="text-center">
                    <QuantumLoader 
                      size="lg" 
                      variant="cosmos" 
                      showLabel 
                      labelText="Multiplanetary Integration" 
                    />
                    <p className="text-xs text-gray-400 mt-6 max-w-xs mx-auto">
                      Our πᾶς ἐν πᾶσιν (all in all) principle realized through cross-planetary
                      network integration, breaking light-speed limitations through quantum entanglement.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Control Panel Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quantum Processing Visualization</CardTitle>
              <CardDescription>
                Explore our quantum-inspired loading sequences that represent core operations
                within our pioneering FractalChain architecture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="transactional" onValueChange={setActiveLoader} className="w-full">
                <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-6">
                  <TabsTrigger value="transactional">
                    <Database className="h-4 w-4 mr-1" /> Transaction
                  </TabsTrigger>
                  <TabsTrigger value="consensus">
                    <RotateCw className="h-4 w-4 mr-1" /> Consensus
                  </TabsTrigger>
                  <TabsTrigger value="verification">
                    <Zap className="h-4 w-4 mr-1" /> Verification
                  </TabsTrigger>
                  <TabsTrigger value="integration">
                    <Atom className="h-4 w-4 mr-1" /> Integration
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="transactional" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Transaction Processing</h3>
                    <p className="text-muted-foreground text-sm">
                      Our transaction system utilizes quantum-inspired algorithms to process multiple
                      transactions in parallel states, creating a superposition of potential outcomes 
                      before collapsing to the verified state.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg text-sm">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4 text-forest-500" />
                      Technical Implementation
                    </h4>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                      <li>Multi-dimensional transaction verification</li>
                      <li>Parallel processing through Fractal computation</li>
                      <li>Death/resurrection cycle protection against failures</li>
                      <li>Superposition of validation states before commitment</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="consensus" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Fractalchain Consensus</h3>
                    <p className="text-muted-foreground text-sm">
                      Unlike traditional proof-of-work or proof-of-stake, our biozoecurrency implements
                      a βίος-inspired consensus mechanism that reflects natural growth patterns without
                      artificial scarcity.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg text-sm">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4 text-forest-500" />
                      Technical Implementation
                    </h4>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                      <li>Self-similar fractal validation patterns</li>
                      <li>Bitcoin-backed scarcity supporting infinite expansion</li>
                      <li>Holographic consensus reaching agreement across all nodes</li>
                      <li>Recursive blockchain verification with O(log n) complexity</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="verification" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Quantum Verification</h3>
                    <p className="text-muted-foreground text-sm">
                      Our ζωή principle enables quantum-resistant verification that ensures
                      security even against future quantum computers, protecting the eternal
                      life aspects of our economic model.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg text-sm">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4 text-water-500" />
                      Technical Implementation
                    </h4>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                      <li>Post-quantum cryptographic signatures</li>
                      <li>Lattice-based security protocols</li>
                      <li>Multi-dimensional transaction verification</li>
                      <li>Zero-knowledge proofs for privacy preservation</li>
                    </ul>
                  </div>
                </TabsContent>
                
                <TabsContent value="integration" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Multiplanetary Integration</h3>
                    <p className="text-muted-foreground text-sm">
                      Our πᾶς ἐν πᾶσιν principle enables multiplanetary economic coordination
                      despite interplanetary latency issues, using quantum-inspired algorithms
                      to simulate instantaneous communication.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg text-sm">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4 text-blue-500" />
                      Technical Implementation
                    </h4>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                      <li>Cross-planetary consensus despite light-speed limitations</li>
                      <li>Entanglement-inspired state synchronization</li>
                      <li>Deterministic delay tolerance through predictive algorithms</li>
                      <li>Unified planetary ledgers with eventual consistency</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-center mt-8">
                <Button 
                  variant="outline" 
                  className="border-forest-300 text-forest-700"
                >
                  <Atom className="h-4 w-4 mr-2" />
                  Explore Quantum Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default QuantumLoaderShowcase;