import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Key, 
  Lock, 
  Server, 
  Link as LinkIcon, 
  Shield, 
  Database, 
  CheckCircle, 
  Clock,
  Cpu,
  Fingerprint,
  Layers,
  GitBranch,
  Shuffle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';

// Types for the visualizer
type BlockchainConcept = 
  | 'blockchain-basics'
  | 'consensus'
  | 'smart-contracts'
  | 'quantum-security'
  | 'fractal-sharding';

interface Block {
  id: number;
  hash: string;
  prevHash: string;
  data: string;
  timestamp: number;
}

const ConceptVisualizer: React.FC = () => {
  const [activeConcept, setActiveConcept] = useState<BlockchainConcept>('blockchain-basics');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [speed, setSpeed] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const animationRef = useRef<number | null>(null);
  
  // Generate a simple blockchain for the visualization
  useEffect(() => {
    const genesis: Block = {
      id: 0,
      hash: '0000000000000000000000000000000000000000000000000000000000000000',
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      data: 'Genesis Block',
      timestamp: Date.now()
    };
    
    const newBlocks = [genesis];
    
    // Add some example blocks
    for (let i = 1; i < 5; i++) {
      const prevBlock = newBlocks[i - 1];
      const newBlock: Block = {
        id: i,
        hash: generateHash(prevBlock.hash + i + Date.now()),
        prevHash: prevBlock.hash,
        data: `Block ${i} Data`,
        timestamp: Date.now() + i * 1000
      };
      newBlocks.push(newBlock);
    }
    
    setBlocks(newBlocks);
  }, []);
  
  // For demonstration, create a simplified hash function
  const generateHash = (input: string): string => {
    let hash = '';
    const chars = '0123456789abcdef';
    
    // Create a simple hash by taking input string chars and creating a hex string
    for (let i = 0; i < 64; i++) {
      const charCode = i < input.length ? input.charCodeAt(i % input.length) : 0;
      hash += chars[charCode % 16];
    }
    
    return hash;
  };
  
  // Animation logic for the visualizations
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setStep(prevStep => {
          // Reset to beginning when reaching the end
          const maxSteps = getMaxStepsForConcept(activeConcept);
          const nextStep = prevStep + 1 < maxSteps ? prevStep + 1 : 0;
          return nextStep;
        });
        
        // Control animation speed
        const interval = 2000 - (speed * 15);
        animationRef.current = window.setTimeout(animate, interval);
      };
      
      animationRef.current = window.setTimeout(animate, 2000 - (speed * 15));
    } else if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, speed, activeConcept]);
  
  // Reset step when changing concepts
  useEffect(() => {
    setStep(0);
  }, [activeConcept]);
  
  // Get the maximum number of steps for a given concept
  const getMaxStepsForConcept = (concept: BlockchainConcept): number => {
    switch (concept) {
      case 'blockchain-basics': return 4;
      case 'consensus': return 5;
      case 'smart-contracts': return 6;
      case 'quantum-security': return 7;
      case 'fractal-sharding': return 8;
      default: return 4;
    }
  };
  
  // Function to toggle animation
  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Step through animation manually
  const nextStep = () => {
    const maxSteps = getMaxStepsForConcept(activeConcept);
    setStep(prevStep => (prevStep + 1) % maxSteps);
  };
  
  const prevStep = () => {
    const maxSteps = getMaxStepsForConcept(activeConcept);
    setStep(prevStep => (prevStep - 1 + maxSteps) % maxSteps);
  };
  
  // Render the blockchain basics concept
  const renderBlockchainBasics = () => {
    return (
      <div className="flex flex-col space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-xl font-medium">Blockchain Structure</h3>
          <p className="text-muted-foreground">
            A blockchain is a distributed, immutable ledger that records transactions across multiple computers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {blocks.map((block, index) => {
            // Only show blocks up to the current step
            if (index > step && step < 4) return null;
            
            return (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className={`${index === step ? 'border-primary shadow-lg' : ''}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Box className="mr-2 h-4 w-4" />
                      Block #{block.id}
                    </CardTitle>
                    <CardDescription className="text-xs truncate">
                      Hash: {block.hash.substring(0, 8)}...
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-xs">
                      <div className="mb-1">
                        <span className="font-semibold">Data:</span> {block.data}
                      </div>
                      <div className="truncate">
                        <span className="font-semibold">Prev:</span> {block.prevHash.substring(0, 8)}...
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(block.timestamp).toLocaleTimeString()}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>
        
        {step >= 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-muted p-4 rounded-lg mt-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h4 className="font-medium">Key Properties</h4>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Immutability: Once data is added, it cannot be altered</li>
              <li>Transparency: All transactions are publicly verifiable</li>
              <li>Security: Cryptographic links between blocks</li>
              <li>Decentralization: No single point of control</li>
            </ul>
          </motion.div>
        )}
      </div>
    );
  };
  
  // Render the consensus mechanism concept
  const renderConsensus = () => {
    // Array of nodes for consensus visualization
    const nodes = Array(6).fill(null).map((_, i) => i);
    
    return (
      <div className="flex flex-col space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-xl font-medium">Consensus Mechanism</h3>
          <p className="text-muted-foreground">
            How the network agrees on which transactions are valid without a central authority.
          </p>
        </div>
        
        <div className="relative h-64 border rounded-lg p-4 bg-muted/30">
          {nodes.map(node => {
            // Position nodes in a circle
            const angle = (node * Math.PI * 2) / nodes.length;
            const radius = 100;
            const x = Math.cos(angle) * radius + 150;
            const y = Math.sin(angle) * radius + 100;
            
            // Determine if node is active validator based on step
            const isValidator = step >= 1 && ((step === 1 && node === 0) || 
                                            (step === 2 && node < 2) || 
                                            (step >= 3 && node < 4));
            
            // Determine if node has verified transaction
            const hasVerified = step >= 3 && ((step === 3 && node < 2) || step >= 4);
            
            return (
              <motion.div
                key={node}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  x: x,
                  y: y,
                  scale: isValidator ? 1.2 : 1
                }}
                transition={{ delay: node * 0.1 }}
                className={`absolute flex items-center justify-center rounded-full
                  ${isValidator ? 'bg-primary text-primary-foreground' : 'bg-card'}
                  ${hasVerified ? 'border-green-500 border-2' : 'border'}
                  w-10 h-10 -translate-x-1/2 -translate-y-1/2`}
              >
                <Server className="h-4 w-4" />
                {hasVerified && <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-500 bg-background rounded-full" />}
              </motion.div>
            );
          })}
          
          {/* Connection lines between nodes */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            style={{ zIndex: -1 }}
          >
            {step >= 2 && nodes.map(fromNode => {
              const fromAngle = (fromNode * Math.PI * 2) / nodes.length;
              const fromX = Math.cos(fromAngle) * 100 + 150;
              const fromY = Math.sin(fromAngle) * 100 + 100;
              
              return nodes.map(toNode => {
                // Skip self and only connect some nodes for clarity
                if (fromNode === toNode || (fromNode + toNode) % 3 !== 0) return null;
                
                const toAngle = (toNode * Math.PI * 2) / nodes.length;
                const toX = Math.cos(toAngle) * 100 + 150;
                const toY = Math.sin(toAngle) * 100 + 100;
                
                // Different line styles based on step
                const isActive = 
                  (step === 2 && (fromNode < 2 || toNode < 2)) ||
                  (step >= 3 && (fromNode < 4 || toNode < 4));
                
                return (
                  <motion.line
                    key={`${fromNode}-${toNode}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke={isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                    strokeWidth={isActive ? 2 : 1}
                    strokeDasharray={isActive ? "none" : "4,4"}
                  />
                );
              });
            })}
            
            {/* Consensus achievement animation */}
            {step >= 4 && (
              <motion.circle
                initial={{ r: 0 }}
                animate={{ r: 120 }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                cx={150}
                cy={100}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeOpacity={0.3}
              />
            )}
          </svg>
          
          {/* Consensus status based on current step */}
          <div className="absolute bottom-2 left-0 right-0 text-center">
            {step === 0 && <p className="text-sm">Initializing network nodes...</p>}
            {step === 1 && <p className="text-sm">Selecting validator nodes</p>}
            {step === 2 && <p className="text-sm">Proposing transaction blocks</p>}
            {step === 3 && <p className="text-sm">Validators verifying transactions</p>}
            {step >= 4 && (
              <p className="text-sm font-medium text-green-500">
                Consensus achieved! Block added to chain
              </p>
            )}
          </div>
        </div>
        
        {step >= 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-muted p-4 rounded-lg"
          >
            <h4 className="font-medium mb-2">Singularity Consensus Mechanism</h4>
            <p className="text-sm">
              Singularity Coin uses a quantum-secured Proof of Stake consensus with fractal recursive validation,
              ensuring both security and scalability while reducing energy consumption.
            </p>
          </motion.div>
        )}
      </div>
    );
  };
  
  // Render the smart contracts concept
  const renderSmartContracts = () => {
    return (
      <div className="flex flex-col space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-xl font-medium">Smart Contracts</h3>
          <p className="text-muted-foreground">
            Self-executing contracts with the terms directly written into code.
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 h-64">
          <div className="col-span-1 flex flex-col space-y-2">
            <Card className={step >= 1 ? 'border-primary shadow-lg' : ''}>
              <CardHeader className="py-2">
                <CardTitle className="text-sm">Contract Creation</CardTitle>
              </CardHeader>
              <CardContent className="py-0">
                <div className="text-xs font-mono bg-muted p-2 rounded">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: step >= 1 ? 1 : 0 }}
                  >
                    function transfer(address to, uint amount) {'{'}<br/>
                    &nbsp;&nbsp;require(balances[msg.sender] &gt;= amount);<br/>
                    &nbsp;&nbsp;balances[msg.sender] -= amount;<br/>
                    &nbsp;&nbsp;balances[to] += amount;<br/>
                    &nbsp;&nbsp;return true;<br/>
                    {'}'}
                  </motion.div>
                </div>
              </CardContent>
            </Card>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: step >= 2 ? 1 : 0 }}
            >
              <Card className={step >= 2 ? 'border-green-500' : ''}>
                <CardContent className="p-2 text-xs">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Contract deployed to blockchain
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <div className="col-span-2 flex flex-col">
            <div className="relative h-full border rounded-lg bg-muted/30 p-4">
              {/* Contract execution visualization */}
              <AnimatePresence>
                {step >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 left-4 right-4 p-3 bg-card border rounded-md"
                  >
                    <div className="flex justify-between items-center text-sm mb-2">
                      <div className="flex items-center">
                        <Key className="h-4 w-4 mr-1" />
                        <span>User Action</span>
                      </div>
                      <span className="text-xs bg-primary/10 px-2 py-1 rounded-full">
                        Transfer Tokens
                      </span>
                    </div>
                    <div className="text-xs">
                      <code>transfer(0x71C...F3E9, 100)</code>
                    </div>
                  </motion.div>
                )}
                
                {step >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground p-2 rounded-md text-xs"
                  >
                    Contract executed
                  </motion.div>
                )}
                
                {step >= 5 && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 left-4 right-4 p-3 bg-card border rounded-md border-green-500"
                  >
                    <div className="flex justify-between items-center text-sm mb-2">
                      <div className="flex items-center">
                        <Database className="h-4 w-4 mr-1" />
                        <span>State Update</span>
                      </div>
                      <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
                        Complete
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div>Sender Balance:</div>
                        <code>900 SING (-100)</code>
                      </div>
                      <div>
                        <div>Receiver Balance:</div>
                        <code>300 SING (+100)</code>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Arrows connecting the flow */}
              {step >= 3 && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: step >= 4 ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    d="M100,60 L100,100 L180,100"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                  
                  {step >= 4 && (
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: step >= 5 ? 1 : 0 }}
                      transition={{ duration: 0.5 }}
                      d="M180,100 L180,140 L100,140"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  )}
                </svg>
              )}
            </div>
          </div>
        </div>
        
        {step >= 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-muted p-4 rounded-lg"
          >
            <h4 className="font-medium mb-2">Benefits of Quantum-Secure Smart Contracts</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Self-executing: No need for intermediaries</li>
              <li>Trustless: All parties can verify the outcome</li>
              <li>Immutable: Contract terms cannot be altered once deployed</li>
              <li>Quantum-resistant: Protected against quantum computing attacks</li>
              <li>Fractal scaling: Contracts can operate across shards</li>
            </ul>
          </motion.div>
        )}
      </div>
    );
  };
  
  // Render the quantum security concept
  const renderQuantumSecurity = () => {
    return (
      <div className="flex flex-col space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-xl font-medium">Quantum Security</h3>
          <p className="text-muted-foreground">
            How Singularity Coin protects against quantum computing threats.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-64">
          <div className="relative border rounded-lg bg-muted/30 p-4 flex items-center justify-center">
            <motion.div
              animate={{
                rotateY: step >= 1 ? [0, 360] : 0,
                scale: step === 2 ? [1, 1.1, 1] : 1
              }}
              transition={{
                rotateY: { duration: 2, repeat: step >= 3 ? Infinity : 0, repeatDelay: 1 },
                scale: { duration: 0.5, repeat: step === 2 ? 1 : 0, repeatDelay: 0.5 }
              }}
              className="relative"
            >
              <Shield className="h-24 w-24 text-primary" />
              {step >= 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Lock className="h-10 w-10 text-primary-foreground" />
                </motion.div>
              )}
            </motion.div>
            
            {/* Attack simulation */}
            {step >= 3 && (
              <>
                <motion.div
                  initial={{ x: -100, y: -100, opacity: 0 }}
                  animate={{ 
                    x: step === 6 ? [0, 0] : [-100, 0, 0, -100], 
                    y: step === 6 ? [0, 0] : [-100, 0, 0, -100],
                    opacity: step === 6 ? 0 : 1
                  }}
                  transition={{ 
                    x: { duration: 1.5, repeat: step < 6 ? Infinity : 0, repeatDelay: 0.5 },
                    y: { duration: 1.5, repeat: step < 6 ? Infinity : 0, repeatDelay: 0.5 },
                    opacity: { duration: 0.5 }
                  }}
                  className="absolute h-6 w-6 text-red-500"
                >
                  <Cpu />
                </motion.div>
                
                <motion.div
                  initial={{ x: 100, y: -100, opacity: 0 }}
                  animate={{ 
                    x: step === 6 ? [0, 0] : [100, 0, 0, 100], 
                    y: step === 6 ? [0, 0] : [-100, 0, 0, -100],
                    opacity: step === 6 ? 0 : 1
                  }}
                  transition={{ 
                    x: { duration: 1.5, delay: 0.2, repeat: step < 6 ? Infinity : 0, repeatDelay: 0.5 },
                    y: { duration: 1.5, delay: 0.2, repeat: step < 6 ? Infinity : 0, repeatDelay: 0.5 },
                    opacity: { duration: 0.5 }
                  }}
                  className="absolute h-6 w-6 text-red-500"
                >
                  <Cpu />
                </motion.div>
                
                <motion.div
                  initial={{ x: 100, y: 100, opacity: 0 }}
                  animate={{ 
                    x: step === 6 ? [0, 0] : [100, 0, 0, 100], 
                    y: step === 6 ? [0, 0] : [100, 0, 0, 100],
                    opacity: step === 6 ? 0 : 1
                  }}
                  transition={{ 
                    x: { duration: 1.5, delay: 0.4, repeat: step < 6 ? Infinity : 0, repeatDelay: 0.5 },
                    y: { duration: 1.5, delay: 0.4, repeat: step < 6 ? Infinity : 0, repeatDelay: 0.5 },
                    opacity: { duration: 0.5 }
                  }}
                  className="absolute h-6 w-6 text-red-500"
                >
                  <Cpu />
                </motion.div>
              </>
            )}
            
            {/* Quantum shield */}
            {step >= 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  rotate: step >= 5 ? [0, 360] : 0 
                }}
                transition={{
                  opacity: { duration: 0.5 },
                  scale: { duration: 0.8 },
                  rotate: { duration: 6, repeat: Infinity, ease: "linear" }
                }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className="relative">
                  <svg width="160" height="160" viewBox="0 0 100 100" className="text-primary/20">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="2" />
                    <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M50,5 L50,95" stroke="currentColor" strokeWidth="1" />
                    <path d="M5,50 L95,50" stroke="currentColor" strokeWidth="1" />
                    <path d="M20,20 L80,80" stroke="currentColor" strokeWidth="1" />
                    <path d="M20,80 L80,20" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </div>
              </motion.div>
            )}
            
            {/* Success indicator */}
            {step >= 6 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium"
              >
                Secured
              </motion.div>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            <Card className={step >= 1 ? 'border-primary' : ''}>
              <CardHeader className="py-2">
                <CardTitle className="text-sm">Quantum Threat Model</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <AnimatePresence>
                  {step >= 1 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs"
                    >
                      Traditional cryptography (RSA, ECC) could be broken by quantum computers
                      using Shor's algorithm, threatening blockchain security.
                    </motion.p>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
            
            <AnimatePresence>
              {step >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="border-primary">
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Quantum-Resistant Algorithms</CardTitle>
                    </CardHeader>
                    <CardContent className="py-0">
                      <ul className="text-xs space-y-1">
                        {step >= 3 && (
                          <motion.li
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center"
                          >
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            CRYSTAL-Kyber for key encapsulation
                          </motion.li>
                        )}
                        {step >= 4 && (
                          <motion.li
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center"
                          >
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            SPHINCS+ for digital signatures
                          </motion.li>
                        )}
                        {step >= 5 && (
                          <motion.li
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center"
                          >
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            Recursive Merkle trees
                          </motion.li>
                        )}
                        {step >= 6 && (
                          <motion.li
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center"
                          >
                            <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                            Zero-knowledge Succinct Transparent ARguments of Knowledge (zk-STARKs)
                          </motion.li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {step >= 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-muted p-4 rounded-lg"
          >
            <h4 className="font-medium mb-2">Singularity Coin Quantum Security Benefits</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Future-proof security against quantum computing attacks</li>
              <li>Multi-layered quantum-resistant cryptography</li>
              <li>Post-quantum secure transactions and smart contracts</li>
              <li>Resistant against both classical and quantum adversaries</li>
              <li>Regular cryptographic agility for algorithm updates</li>
            </ul>
          </motion.div>
        )}
      </div>
    );
  };
  
  // Render the fractal sharding concept
  const renderFractalSharding = () => {
    // Define the node type for our fractal visualization
    interface FractalNode {
      id: string;
      depth: number;
    }
    
    // Generate fractal nodes for visualization
    const generateFractalNodes = (depth: number, maxDepth: number, prefix: string = ''): FractalNode[] => {
      if (depth > maxDepth) return [];
      
      const nodes: FractalNode[] = [];
      const thisNode: FractalNode = { id: prefix || 'root', depth };
      nodes.push(thisNode);
      
      if (depth < maxDepth) {
        for (let i = 1; i <= 3; i++) {
          const childPrefix = prefix ? `${prefix}-${i}` : `${i}`;
          nodes.push(...generateFractalNodes(depth + 1, maxDepth, childPrefix));
        }
      }
      
      return nodes;
    };
    
    // Generate fractal nodes up to depth 2
    const fractalNodes = generateFractalNodes(0, 2);
    
    return (
      <div className="flex flex-col space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-xl font-medium">Fractal Sharding</h3>
          <p className="text-muted-foreground">
            How Singularity Coin scales through recursive fractal-pattern sharding.
          </p>
        </div>
        
        <div className="h-72 border rounded-lg bg-muted/30 p-4 relative">
          {/* Main shard (visible in all steps) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              scale: step >= 1 ? (step >= 4 ? 0.5 : 0.8) : 1
            }}
            transition={{ duration: 0.5 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <motion.div
              animate={{
                borderColor: step >= 2 ? 'hsl(var(--primary))' : 'hsl(var(--border))'
              }}
              className="border-2 rounded-lg w-32 h-32 bg-background flex items-center justify-center"
            >
              <Database className="h-12 w-12 text-primary" />
              <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                Main Chain
              </div>
            </motion.div>
          </motion.div>
          
          {/* First level shards (step 1 and beyond) */}
          {step >= 1 && (
            <>
              {[45, 165, 285].map((angle, i) => {
                const radius = step >= 4 ? 80 : 100;
                const x = Math.cos(angle * Math.PI / 180) * radius;
                const y = Math.sin(angle * Math.PI / 180) * radius;
                
                return (
                  <motion.div
                    key={`shard-1-${i}`}
                    initial={{ opacity: 0, x: 0, y: 0 }}
                    animate={{ 
                      opacity: 1,
                      x: x,
                      y: y
                    }}
                    transition={{ delay: i * 0.2 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  >
                    <motion.div
                      animate={{
                        borderColor: step >= 3 ? 'hsl(var(--primary))' : 'hsl(var(--border))'
                      }}
                      className="border-2 rounded-lg w-20 h-20 bg-background flex items-center justify-center"
                    >
                      <Database className="h-8 w-8 text-primary/80" />
                      <div className="absolute -top-2 -left-2 bg-primary/80 text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                        Shard {i+1}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
              
              {/* Connection lines between main and first level */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
                {[45, 165, 285].map((angle, i) => {
                  const radius = step >= 4 ? 80 : 100;
                  const x = Math.cos(angle * Math.PI / 180) * radius + 192;
                  const y = Math.sin(angle * Math.PI / 180) * radius + 144;
                  
                  return (
                    <motion.line
                      key={`line-1-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      transition={{ delay: i * 0.2 }}
                      x1={192}
                      y1={144}
                      x2={x}
                      y2={y}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      strokeDasharray={step >= 2 ? "none" : "4,4"}
                    />
                  );
                })}
              </svg>
            </>
          )}
          
          {/* Second level shards (step 4 and beyond) */}
          {step >= 4 && (
            <>
              {[0, 1, 2].map((parentIdx) => {
                const parentAngle = (parentIdx * 120 + 45) * Math.PI / 180;
                const parentRadius = 80;
                const parentX = Math.cos(parentAngle) * parentRadius;
                const parentY = Math.sin(parentAngle) * parentRadius;
                
                return [0, 1].map((childIdx) => {
                  const childAngle = ((parentIdx * 120 + 45) + (childIdx === 0 ? -30 : 30)) * Math.PI / 180;
                  const childRadius = 40;
                  const x = Math.cos(parentAngle) * parentRadius + Math.cos(childAngle) * childRadius;
                  const y = Math.sin(parentAngle) * parentRadius + Math.sin(childAngle) * childRadius;
                  
                  return (
                    <motion.div
                      key={`shard-2-${parentIdx}-${childIdx}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 1,
                        scale: 1,
                        x: x,
                        y: y
                      }}
                      transition={{ delay: parentIdx * 0.2 + childIdx * 0.1 }}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    >
                      <div className="border rounded-lg w-12 h-12 bg-background flex items-center justify-center">
                        <Database className="h-5 w-5 text-primary/60" />
                      </div>
                    </motion.div>
                  );
                });
              })}
              
              {/* Connection lines between first and second level */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
                {[0, 1, 2].map((parentIdx) => {
                  const parentAngle = (parentIdx * 120 + 45) * Math.PI / 180;
                  const parentRadius = 80;
                  const parentX = Math.cos(parentAngle) * parentRadius + 192;
                  const parentY = Math.sin(parentAngle) * parentRadius + 144;
                  
                  return [0, 1].map((childIdx) => {
                    const childAngle = ((parentIdx * 120 + 45) + (childIdx === 0 ? -30 : 30)) * Math.PI / 180;
                    const childRadius = 40;
                    const x = Math.cos(parentAngle) * parentRadius + Math.cos(childAngle) * childRadius + 192;
                    const y = Math.sin(parentAngle) * parentRadius + Math.sin(childAngle) * childRadius + 144;
                    
                    return (
                      <motion.line
                        key={`line-2-${parentIdx}-${childIdx}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: parentIdx * 0.2 + childIdx * 0.1 }}
                        x1={parentX}
                        y1={parentY}
                        x2={x}
                        y2={y}
                        stroke="hsl(var(--primary))"
                        strokeWidth={1}
                      />
                    );
                  });
                })}
              </svg>
            </>
          )}
          
          {/* Data flow animation */}
          {step >= 5 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
              {[0, 1, 2].map((pathIdx) => {
                const angle = (pathIdx * 120 + 45) * Math.PI / 180;
                const x1 = 192;
                const y1 = 144;
                const x2 = Math.cos(angle) * 80 + 192;
                const y2 = Math.sin(angle) * 80 + 144;
                
                return (
                  <motion.circle
                    key={`flow-${pathIdx}`}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      offsetDistance: ['0%', '100%']
                    }}
                    transition={{
                      duration: 1.5,
                      delay: pathIdx * 0.3,
                      repeat: Infinity,
                      repeatDelay: 0.5
                    }}
                    r={4}
                    fill="hsl(var(--primary))"
                    style={{
                      offsetPath: `path('M${x1},${y1} L${x2},${y2}')`,
                    }}
                  />
                );
              })}
            </svg>
          )}
          
          {/* Status text */}
          <div className="absolute bottom-2 left-0 right-0 text-center">
            {step === 0 && <p className="text-sm">Single blockchain</p>}
            {step === 1 && <p className="text-sm">Creating level 1 shards</p>}
            {step === 2 && <p className="text-sm">Establishing secure connections</p>}
            {step === 3 && <p className="text-sm">Activating cross-shard communication</p>}
            {step === 4 && <p className="text-sm">Expanding to recursive level 2 shards</p>}
            {step === 5 && <p className="text-sm">Processing transactions across shards</p>}
            {step >= 6 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-medium text-primary"
              >
                Fractal recursive sharding activated
              </motion.p>
            )}
          </div>
        </div>
        
        {step >= 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-muted p-4 rounded-lg"
          >
            <h4 className="font-medium mb-2">Fractal Sharding Benefits</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium flex items-center gap-1 mb-1">
                  <GitBranch className="h-4 w-4" />
                  Unlimited Scalability
                </h5>
                <p className="text-xs">
                  Recursive shards can be created infinitely to handle growing transaction volumes.
                </p>
              </div>
              <div>
                <h5 className="font-medium flex items-center gap-1 mb-1">
                  <Shuffle className="h-4 w-4" />
                  Load Distribution
                </h5>
                <p className="text-xs">
                  Transactions are distributed across shards based on fractal mathematics.
                </p>
              </div>
              <div>
                <h5 className="font-medium flex items-center gap-1 mb-1">
                  <Layers className="h-4 w-4" />
                  Composable Security
                </h5>
                <p className="text-xs">
                  Each shard inherits security properties from parent shards.
                </p>
              </div>
              <div>
                <h5 className="font-medium flex items-center gap-1 mb-1">
                  <Fingerprint className="h-4 w-4" />
                  Quantum Resistance
                </h5>
                <p className="text-xs">
                  Fractal pattern distribution enhances quantum security.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  };
  
  // Render the appropriate concept visualization based on active tab
  const renderConcept = () => {
    switch (activeConcept) {
      case 'blockchain-basics':
        return renderBlockchainBasics();
      case 'consensus':
        return renderConsensus();
      case 'smart-contracts':
        return renderSmartContracts();
      case 'quantum-security':
        return renderQuantumSecurity();
      case 'fractal-sharding':
        return renderFractalSharding();
      default:
        return renderBlockchainBasics();
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Interactive Blockchain Concept Visualizer</CardTitle>
        <CardDescription>
          Explore key blockchain concepts in Singularity Coin with interactive visualizations.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs
          defaultValue="blockchain-basics"
          value={activeConcept}
          onValueChange={(value) => setActiveConcept(value as BlockchainConcept)}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
            <TabsTrigger value="blockchain-basics">Blockchain Basics</TabsTrigger>
            <TabsTrigger value="consensus">Consensus</TabsTrigger>
            <TabsTrigger value="smart-contracts">Smart Contracts</TabsTrigger>
            <TabsTrigger value="quantum-security">Quantum Security</TabsTrigger>
            <TabsTrigger value="fractal-sharding">Fractal Sharding</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeConcept} className="mt-4">
            {renderConcept()}
          </TabsContent>
        </Tabs>
        
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleAnimation}
              variant={isPlaying ? "destructive" : "default"}
              size="sm"
            >
              {isPlaying ? "Pause" : "Auto-Play"}
            </Button>
            <Button
              onClick={prevStep}
              variant="outline"
              size="icon"
              disabled={isPlaying}
            >
              ←
            </Button>
            <Button
              onClick={nextStep}
              variant="outline"
              size="icon"
              disabled={isPlaying}
            >
              →
            </Button>
            <div className="text-sm ml-2">
              Step {step + 1} of {getMaxStepsForConcept(activeConcept)}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm">Speed:</div>
            <Slider
              value={[speed]}
              min={1}
              max={100}
              step={1}
              onValueChange={(value) => setSpeed(value[0])}
              disabled={!isPlaying}
              className="flex-1"
            />
            <div className="text-sm w-8">{speed}%</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4 text-sm text-muted-foreground">
        <div>Updated: {new Date().toLocaleDateString()}</div>
        <div>Powered by Singularity Coin</div>
      </CardFooter>
    </Card>
  );
};

export default ConceptVisualizer;