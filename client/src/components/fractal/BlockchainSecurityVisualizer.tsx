import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bitcoin, 
  ShieldCheck, 
  Key, 
  LockKeyhole, 
  Layers, 
  ScrollText, 
  Cpu,
  SquareCode,
  Network
} from 'lucide-react';

// Types for blockchain and security models
interface BlockchainTransaction {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  currency: string;
  timestamp: number;
  hash: string;
}

interface SecurityLayer {
  name: string;
  description: string;
  algorithm: string;
  bitStrength: number;
  color: string;
}

const BlockchainSecurityVisualizer: React.FC = () => {
  // State for controlling the visualization
  const [activeTab, setActiveTab] = useState("transaction");
  const [securityLayers, setSecurityLayers] = useState<number>(3);
  const [selectedCurrency, setSelectedCurrency] = useState("bitcoin");
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  
  // Canvas reference for rendering
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Sample transaction data
  const sampleTransaction: BlockchainTransaction = {
    id: "tx-" + Math.random().toString(36).substring(2, 10),
    sender: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    receiver: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
    amount: 0.05,
    currency: selectedCurrency,
    timestamp: Date.now(),
    hash: "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f"
  };
  
  // Security layer definitions
  const securityLayersData: SecurityLayer[] = [
    {
      name: "CRYSTAL-Kyber",
      description: "Lattice-based quantum-resistant key encapsulation",
      algorithm: "Module-LWE",
      bitStrength: 256,
      color: "#3b82f6" // Blue
    },
    {
      name: "SPHINCS+",
      description: "Hash-based quantum-resistant signatures",
      algorithm: "Merkle Tree + Few-Time Signatures",
      bitStrength: 256,
      color: "#10b981" // Green
    },
    {
      name: "Recursive Merkle Trees",
      description: "Self-similar tree structures for advanced verification",
      algorithm: "Fractal Hash Chains",
      bitStrength: 384,
      color: "#8b5cf6" // Purple
    },
    {
      name: "zk-STARK Proofs",
      description: "Zero-knowledge scalable transparent knowledge proofs",
      algorithm: "FRI (Fast Reed-Solomon IOP)",
      bitStrength: 512,
      color: "#ec4899" // Pink
    },
    {
      name: "Multivariate Polynomials",
      description: "Backup quantum-resistant signature scheme",
      algorithm: "Oil and Vinegar",
      bitStrength: 128,
      color: "#f59e0b" // Amber
    }
  ];
  
  // Cryptocurrency data
  const cryptoData = {
    bitcoin: {
      name: "Bitcoin",
      color: "#f7931a",
      algorithm: "SHA-256",
      bitStrength: 256
    },
    ethereum: {
      name: "Ethereum",
      color: "#627eea",
      algorithm: "Keccak-256",
      bitStrength: 256
    },
    solana: {
      name: "Solana",
      color: "#00ffa3",
      algorithm: "SHA-256",
      bitStrength: 256
    },
    singularity: {
      name: "Singularity Coin",
      color: "#9333ea",
      algorithm: "CRYSTALS-Kyber + SPHINCS+",
      bitStrength: 512
    }
  };
  
  // Start animation
  const startAnimation = () => {
    setIsAnimating(true);
    // Animation logic would go here
    setTimeout(() => {
      setIsAnimating(false);
    }, 5000 / animationSpeed);
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Draw fractal security model
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw based on active tab
    if (activeTab === "transaction") {
      drawTransactionSecurity(ctx, width, height);
    } else if (activeTab === "recursive") {
      drawRecursiveSecurity(ctx, width, height);
    } else if (activeTab === "holographic") {
      drawHolographicSecurity(ctx, width, height);
    }
  }, [activeTab, securityLayers, selectedCurrency, isAnimating]);

  // Draw transaction security visualization
  const drawTransactionSecurity = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);
    
    // Transaction block
    const centerX = width / 2;
    const centerY = height / 2;
    const blockSize = Math.min(width, height) * 0.2;
    
    // Draw security layers as concentric shapes
    for (let i = securityLayers; i > 0; i--) {
      const layerSize = blockSize + (securityLayers - i + 1) * 40;
      const layer = securityLayersData[i - 1];
      
      // Draw security layer
      ctx.beginPath();
      ctx.arc(centerX, centerY, layerSize, 0, 2 * Math.PI);
      ctx.fillStyle = layer.color + "33"; // Add transparency
      ctx.fill();
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Layer name at random position on the circle
      const angle = Math.random() * 2 * Math.PI;
      const textX = centerX + Math.cos(angle) * layerSize * 0.8;
      const textY = centerY + Math.sin(angle) * layerSize * 0.8;
      
      ctx.font = "12px sans-serif";
      ctx.fillStyle = layer.color;
      ctx.fillText(layer.name, textX, textY);
    }
    
    // Draw transaction block
    ctx.fillStyle = cryptoData[selectedCurrency as keyof typeof cryptoData].color;
    ctx.fillRect(centerX - blockSize/2, centerY - blockSize/2, blockSize, blockSize);
    
    // Draw Bitcoin symbol in the center
    ctx.font = "30px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const symbol = selectedCurrency === "bitcoin" ? "₿" : 
                  selectedCurrency === "ethereum" ? "Ξ" : 
                  selectedCurrency === "solana" ? "◎" : "Ϟ";
    
    ctx.fillText(symbol, centerX, centerY);
  };
  
  // Draw recursive security visualization
  const drawRecursiveSecurity = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);
    
    // Draw recursive fractal pattern
    const drawFractal = (x: number, y: number, size: number, depth: number) => {
      if (depth <= 0) return;
      
      // Draw this level
      const layer = securityLayersData[depth % securityLayersData.length];
      
      ctx.fillStyle = layer.color + "40"; // Transparent fill
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = 2;
      
      // Draw a square
      ctx.beginPath();
      ctx.rect(x - size/2, y - size/2, size, size);
      ctx.fill();
      ctx.stroke();
      
      // Recursive calls for corners
      const newSize = size * 0.4;
      const offset = size * 0.35;
      
      // Top left
      drawFractal(x - offset, y - offset, newSize, depth - 1);
      // Top right
      drawFractal(x + offset, y - offset, newSize, depth - 1);
      // Bottom left
      drawFractal(x - offset, y + offset, newSize, depth - 1);
      // Bottom right
      drawFractal(x + offset, y + offset, newSize, depth - 1);
    };
    
    // Start the recursion from the center
    drawFractal(width/2, height/2, Math.min(width, height) * 0.6, securityLayers);
  };
  
  // Draw holographic security visualization
  const drawHolographicSecurity = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Background
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);
    
    // Grid dimensions
    const gridSize = 5;
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;
    
    // Draw connected cells
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = i * cellWidth + cellWidth / 2;
        const y = j * cellHeight + cellHeight / 2;
        
        // Draw cell
        const cellSize = Math.min(cellWidth, cellHeight) * 0.6;
        const layer = securityLayersData[Math.floor(Math.random() * securityLayers)];
        
        ctx.fillStyle = layer.color + "40"; // Transparent fill
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.arc(x, y, cellSize/2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Connect to neighbors
        ctx.strokeStyle = "#ffffff20"; // Subtle connections
        ctx.lineWidth = 1;
        
        // Connect right
        if (i < gridSize - 1) {
          ctx.beginPath();
          ctx.moveTo(x + cellSize/2, y);
          ctx.lineTo(x + cellWidth - cellSize/2, y);
          ctx.stroke();
        }
        
        // Connect down
        if (j < gridSize - 1) {
          ctx.beginPath();
          ctx.moveTo(x, y + cellSize/2);
          ctx.lineTo(x, y + cellHeight - cellSize/2);
          ctx.stroke();
        }
      }
    }
    
    // Highlight the holographic nature by drawing a large overlay
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.beginPath();
    ctx.arc(width/2, height/2, Math.min(width, height) * 0.4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw text in the center
    ctx.font = "16px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Holographic Verification", width/2, height/2);
  };
  
  // Resize canvas to fit container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Redraw on resize
      const ctx = canvas.getContext('2d');
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        if (activeTab === "transaction") {
          drawTransactionSecurity(ctx, canvas.width, canvas.height);
        } else if (activeTab === "recursive") {
          drawRecursiveSecurity(ctx, canvas.width, canvas.height);
        } else if (activeTab === "holographic") {
          drawHolographicSecurity(ctx, canvas.width, canvas.height);
        }
      }
    };
    
    // Set up initial dimensions
    setTimeout(handleResize, 100);
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTab, securityLayers, selectedCurrency]);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
            Quantum-Resistant Security Model
          </CardTitle>
          <CardDescription>
            Visualize how {cryptoData[selectedCurrency as keyof typeof cryptoData].name} transactions are protected by fractal quantum security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="transaction">Transaction Security</TabsTrigger>
              <TabsTrigger value="recursive">Recursive Protection</TabsTrigger>
              <TabsTrigger value="holographic">Holographic Verification</TabsTrigger>
            </TabsList>
            
            <div className="flex mb-4">
              <Select
                value={selectedCurrency}
                onValueChange={setSelectedCurrency}
              >
                <SelectTrigger className="w-[180px] mr-4">
                  <SelectValue placeholder="Select Cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bitcoin">Bitcoin</SelectItem>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="solana">Solana</SelectItem>
                  <SelectItem value="singularity">Singularity Coin</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex-1 flex items-center space-x-2">
                <span className="text-sm">Security Layers:</span>
                <Slider
                  value={[securityLayers]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(values) => setSecurityLayers(values[0])}
                  className="w-[120px]"
                />
                <span className="text-sm">{securityLayers}</span>
              </div>
              
              <Button
                variant="outline"
                onClick={startAnimation}
                disabled={isAnimating}
                className="ml-auto"
              >
                {isAnimating ? "Simulating..." : "Simulate Attack"}
              </Button>
            </div>

            <div 
              className="relative w-full border rounded-md bg-background overflow-hidden"
              style={{ height: "300px" }}
            >
              <canvas 
                ref={canvasRef} 
                className="w-full h-full"
              />
            </div>
          </Tabs>
        </CardContent>
        
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <CardFooter className="border-t bg-muted/50 flex flex-col items-start pt-4">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Key className="mr-2 h-4 w-4 text-primary" />
                Active Security Layers
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 w-full">
                {securityLayersData.slice(0, securityLayers).map((layer, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Badge style={{ backgroundColor: layer.color }}>{index + 1}</Badge>
                    <div>
                      <h5 className="text-sm font-medium">{layer.name}</h5>
                      <p className="text-xs text-muted-foreground">{layer.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="w-full mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <ScrollText className="mr-2 h-4 w-4 text-primary" />
                  Key Features of the Quantum Security Model
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-start">
                    <LockKeyhole className="h-3 w-3 mr-2 mt-0.5 text-primary" />
                    Lattice-based cryptography resistant to quantum computing attacks
                  </li>
                  <li className="flex items-start">
                    <Layers className="h-3 w-3 mr-2 mt-0.5 text-primary" />
                    Multiple independent security layers provide defense in depth
                  </li>
                  <li className="flex items-start">
                    <Network className="h-3 w-3 mr-2 mt-0.5 text-primary" />
                    Fractal recursive verification enables part-to-whole security validation
                  </li>
                  <li className="flex items-start">
                    <Cpu className="h-3 w-3 mr-2 mt-0.5 text-primary" />
                    Quantum-resistant signatures through hash-based cryptography
                  </li>
                  <li className="flex items-start">
                    <SquareCode className="h-3 w-3 mr-2 mt-0.5 text-primary" />
                    Zero-knowledge proofs maintain privacy while ensuring security
                  </li>
                </ul>
              </div>
            </CardFooter>
          </motion.div>
        )}
      </Card>
    </div>
  );
};

export default BlockchainSecurityVisualizer;