import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { 
  Download, 
  Info, 
  RefreshCw, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Share2,
  GitMerge,
  FileText
} from 'lucide-react';

// Mathematical utility functions
const calculateFibonacciSequence = (n: number): number[] => {
  if (n <= 0) return [];
  if (n === 1) return [1];
  if (n === 2) return [1, 1];
  
  const result = [1, 1];
  for (let i = 2; i < n; i++) {
    result.push(result[i-1] + result[i-2]);
  }
  return result;
};

const getPiDigits = (n: number): number[] => {
  // PI digits for visualization (first 100 digits)
  const piDigits = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9, 3, 2, 3, 8, 4, 6, 2, 6, 4, 3, 3, 8, 3, 2, 7,
    9, 5, 0, 2, 8, 8, 4, 1, 9, 7, 1, 6, 9, 3, 9, 9, 3, 7, 5, 1, 0, 5, 8, 2, 0, 9, 7, 4, 9, 4, 4,
    5, 9, 2, 3, 0, 7, 8, 1, 6, 4, 0, 6, 2, 8, 6, 2, 0, 8, 9, 9, 8, 6, 2, 8, 0, 3, 4, 8, 2, 5, 3, 4,
    2, 1, 1, 7, 0, 6, 7, 9];
  
  return piDigits.slice(0, n);
};

// Golden ratio constant (phi)
const PHI = 1.618033988749895;

const FractalVisualizationDashboard = () => {
  const [activeTab, setActiveTab] = useState("token-distribution");
  const [fibonacciTerms, setFibonacciTerms] = useState(20);
  const [piDigits, setPiDigits] = useState(50);
  const [visualizationType, setVisualizationType] = useState("spiral");
  const [tokenSymbol, setTokenSymbol] = useState("ATC");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate visualization based on the active tab and settings
  const generateVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsGenerating(true);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGenerating(false);
      return;
    }
    
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    try {
      // Set background
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, width, height);
      
      switch (activeTab) {
        case "token-distribution":
          renderTokenDistribution(ctx, width, height, centerX, centerY);
          break;
        case "sacred-geometry":
          renderSacredGeometry(ctx, width, height, centerX, centerY);
          break;
        case "fibonacci-growth":
          renderFibonacciGrowth(ctx, width, height, centerX, centerY);
          break;
        case "pi-ratios":
          renderPiRatios(ctx, width, height, centerX, centerY);
          break;
        default:
          renderTokenDistribution(ctx, width, height, centerX, centerY);
      }
    } catch (error) {
      console.error("Error generating visualization:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Render token distribution based on fractal patterns
  const renderTokenDistribution = (ctx: CanvasRenderingContext2D, width: number, height: number, centerX: number, centerY: number) => {
    const fibonacci = calculateFibonacciSequence(fibonacciTerms);
    
    // Draw title
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(`${tokenSymbol} Token Distribution Pattern`, centerX, 30);
    
    if (visualizationType === "spiral") {
      // Create a Fibonacci spiral to represent token distribution
      const scaleFactor = Math.min(width, height) / (fibonacci[fibonacci.length - 1] * 3);
      
      // Draw spiral segments
      fibonacci.forEach((value, i) => {
        if (i < 1) return;
        
        const radius = value * scaleFactor;
        const startAngle = (i * Math.PI / 2) % (2 * Math.PI);
        const endAngle = ((i + 1) * Math.PI / 2) % (2 * Math.PI);
        
        // Draw arc with gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, `rgba(64, 0, 128, ${0.7 - i * 0.02})`);
        gradient.addColorStop(1, `rgba(0, 128, 255, ${0.5 - i * 0.02})`);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2 + Math.max(0, 10 - i); // Thicker lines for inner spiral
        ctx.stroke();
        
        // Add labels at key points
        if (i % 5 === 0 && i > 0) {
          const angle = (startAngle + endAngle) / 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          ctx.fillStyle = '#fff';
          ctx.font = '12px Arial';
          ctx.fillText(`F${i}: ${value}`, x, y);
        }
      });
      
      // Draw explanation
      ctx.font = '14px Arial';
      ctx.fillStyle = '#aaa';
      ctx.textAlign = 'left';
      ctx.fillText('Token distribution follows Fibonacci sequences, creating', 20, height - 60);
      ctx.fillText('natural organic growth patterns that optimize resource allocation', 20, height - 40);
      ctx.fillText('and resistance to centralization.', 20, height - 20);
    } else {
      // Create a Merkle tree representation of token distribution
      const levels = 5;
      const nodeSpacing = width / Math.pow(2, levels);
      const levelHeight = (height - 100) / levels;
      
      // Draw tree nodes
      for (let level = 0; level < levels; level++) {
        const nodes = Math.pow(2, level);
        const startX = width / 2 - (nodes * nodeSpacing) / 2 + nodeSpacing / 2;
        
        for (let node = 0; node < nodes; node++) {
          const x = startX + node * nodeSpacing;
          const y = 80 + level * levelHeight;
          
          // Node size decreases for lower levels
          const radius = 20 - level * 2;
          
          // Create gradient for node
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, 'rgba(64, 0, 128, 0.8)');
          gradient.addColorStop(1, 'rgba(0, 128, 255, 0.6)');
          
          // Draw node
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI);
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Draw connections to parent nodes
          if (level > 0) {
            const parentNode = Math.floor(node / 2);
            const parentX = startX / 2 + parentNode * (nodeSpacing * 2);
            const parentY = 80 + (level - 1) * levelHeight;
            
            ctx.beginPath();
            ctx.moveTo(x, y - radius);
            ctx.lineTo(parentX, parentY + radius);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          
          // Label leaf nodes with token values
          if (level === levels - 1) {
            const value = fibonacci[node % fibonacci.length];
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${value}`, x, y + radius + 15);
          }
        }
      }
      
      // Draw explanation
      ctx.font = '14px Arial';
      ctx.fillStyle = '#aaa';
      ctx.textAlign = 'left';
      ctx.fillText('Merkle Tree distribution ensures verifiable token allocation', 20, height - 60);
      ctx.fillText('with fractal patterns that support the biozoecurrency model', 20, height - 40);
      ctx.fillText('and recursive validation of transaction integrity.', 20, height - 20);
    }
  };
  
  // Render sacred geometry patterns
  const renderSacredGeometry = (ctx: CanvasRenderingContext2D, width: number, height: number, centerX: number, centerY: number) => {
    // Draw title
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Sacred Geometry in Biozoecurrency Architecture', centerX, 30);
    
    const radius = Math.min(width, height) * 0.4;
    
    // Draw Flower of Life pattern
    const circles = 7;
    const angleStep = (Math.PI * 2) / 6;
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius / 3, 0, Math.PI * 2);
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius / 3);
    centerGradient.addColorStop(0, 'rgba(64, 0, 128, 0.7)');
    centerGradient.addColorStop(1, 'rgba(0, 128, 255, 0.5)');
    ctx.fillStyle = centerGradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw first ring of 6 circles
    for (let i = 0; i < 6; i++) {
      const angle = i * angleStep;
      const x = centerX + Math.cos(angle) * radius / 3;
      const y = centerY + Math.sin(angle) * radius / 3;
      
      ctx.beginPath();
      ctx.arc(x, y, radius / 3, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius / 3);
      gradient.addColorStop(0, 'rgba(64, 0, 128, 0.5)');
      gradient.addColorStop(1, 'rgba(0, 128, 255, 0.3)');
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.stroke();
    }
    
    // Draw outer circles to complete Flower of Life
    for (let i = 0; i < 6; i++) {
      const angle1 = i * angleStep;
      const nextAngle = ((i + 1) % 6) * angleStep;
      
      const x1 = centerX + Math.cos(angle1) * radius / 3;
      const y1 = centerY + Math.sin(angle1) * radius / 3;
      
      const x2 = centerX + Math.cos(nextAngle) * radius / 3;
      const y2 = centerY + Math.sin(nextAngle) * radius / 3;
      
      // Draw circle at the intersection
      const intersectionX = (x1 + x2) / 2;
      const intersectionY = (y1 + y2) / 2;
      
      ctx.beginPath();
      ctx.arc(intersectionX, intersectionY, radius / 3, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(intersectionX, intersectionY, 0, intersectionX, intersectionY, radius / 3);
      gradient.addColorStop(0, 'rgba(64, 0, 128, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 128, 255, 0.2)');
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.stroke();
    }
    
    // Draw the Vesica Piscis (almond shape) overlay
    ctx.beginPath();
    const vesicaDistance = radius / 3;
    ctx.moveTo(centerX + vesicaDistance, centerY);
    ctx.arc(centerX + vesicaDistance / 2, centerY, radius / 2, -Math.PI / 3, Math.PI / 3);
    ctx.arc(centerX - vesicaDistance / 2, centerY, radius / 2, Math.PI * 2 / 3, -Math.PI * 2 / 3);
    ctx.closePath();
    
    const vesicaGradient = ctx.createLinearGradient(
      centerX - vesicaDistance, centerY,
      centerX + vesicaDistance, centerY
    );
    vesicaGradient.addColorStop(0, 'rgba(255, 128, 0, 0.2)');
    vesicaGradient.addColorStop(0.5, 'rgba(255, 200, 0, 0.3)');
    vesicaGradient.addColorStop(1, 'rgba(255, 128, 0, 0.2)');
    ctx.fillStyle = vesicaGradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
    ctx.stroke();
    
    // Label key elements
    ctx.font = '12px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Seed of Life', centerX, centerY - radius / 2 - 10);
    ctx.fillText('Vesica Piscis', centerX, centerY + 10);
    
    // Draw explanation
    ctx.font = '14px Arial';
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'left';
    ctx.fillText('Sacred geometry patterns create harmony in token distribution', 20, height - 60);
    ctx.fillText('and guide the biozoecurrency recursive growth model through', 20, height - 40);
    ctx.fillText('natural mathematical principles.', 20, height - 20);
  };
  
  // Render Fibonacci growth patterns
  const renderFibonacciGrowth = (ctx: CanvasRenderingContext2D, width: number, height: number, centerX: number, centerY: number) => {
    const fibonacci = calculateFibonacciSequence(fibonacciTerms);
    
    // Draw title
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Fibonacci Sequence in Token Growth Patterns', centerX, 30);
    
    // Scale factor to fit the visualization
    const maxFib = fibonacci[fibonacci.length - 1];
    const scaleFactor = Math.min(width, height) * 0.8 / maxFib;
    
    // Draw Fibonacci spiral using golden rectangles
    let x = centerX - (width * 0.25);
    let y = centerY + (height * 0.25);
    let size = fibonacci[fibonacci.length - 2] * scaleFactor;
    
    // Start with a square
    for (let i = fibonacci.length - 2; i >= 1; i--) {
      const currentSize = fibonacci[i] * scaleFactor;
      
      // Draw rectangle
      ctx.beginPath();
      ctx.rect(x, y - currentSize, currentSize, currentSize);
      
      // Create gradient fill
      const gradient = ctx.createLinearGradient(
        x, y - currentSize,
        x + currentSize, y
      );
      gradient.addColorStop(0, `rgba(64, 0, 128, ${0.2 + i * 0.03})`);
      gradient.addColorStop(1, `rgba(0, 128, 255, ${0.2 + i * 0.03})`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw spiral arc
      ctx.beginPath();
      
      // Calculate arc parameters based on the position in the spiral
      let arcX, arcY, startAngle, endAngle;
      
      if (i % 4 === 0) {
        arcX = x;
        arcY = y - currentSize;
        startAngle = 0;
        endAngle = Math.PI / 2;
      } else if (i % 4 === 3) {
        arcX = x + currentSize;
        arcY = y - currentSize;
        startAngle = Math.PI / 2;
        endAngle = Math.PI;
      } else if (i % 4 === 2) {
        arcX = x + currentSize;
        arcY = y;
        startAngle = Math.PI;
        endAngle = 3 * Math.PI / 2;
      } else {
        arcX = x;
        arcY = y;
        startAngle = 3 * Math.PI / 2;
        endAngle = 2 * Math.PI;
      }
      
      ctx.arc(arcX, arcY, currentSize, startAngle, endAngle);
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Add number labels for key squares
      if (i % 3 === 0 || i < 5) {
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`F${i}: ${fibonacci[i]}`, x + currentSize / 2, y - currentSize / 2);
      }
      
      // Update position for next rectangle based on the position in the spiral
      if (i % 4 === 1) {
        x += fibonacci[i-1] * scaleFactor;
      } else if (i % 4 === 2) {
        y -= fibonacci[i-1] * scaleFactor;
      } else if (i % 4 === 3) {
        x -= fibonacci[i-1] * scaleFactor;
      } else if (i % 4 === 0) {
        y += fibonacci[i-1] * scaleFactor;
      }
    }
    
    // Draw golden ratio text
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
    ctx.textAlign = 'center';
    ctx.fillText(`φ (Golden Ratio): ${PHI.toFixed(8)}`, centerX, height - 70);
    
    // Draw explanation
    ctx.font = '14px Arial';
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'left';
    ctx.fillText('Fibonacci sequences establish the growth pattern for tokens,', 20, height - 40);
    ctx.fillText('ensuring natural scaling that mirrors biological growth.', 20, height - 20);
  };
  
  // Render Pi-based ratio patterns
  const renderPiRatios = (ctx: CanvasRenderingContext2D, width: number, height: number, centerX: number, centerY: number) => {
    const digits = getPiDigits(piDigits);
    
    // Draw title
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Pi Ratios in Biozoecurrency Distributions', centerX, 30);
    
    if (visualizationType === "spiral") {
      // Create a spiral visualization of Pi digits
      const maxRadius = Math.min(width, height) * 0.4;
      const radiusStep = maxRadius / digits.length;
      
      // Start from center
      let x = centerX;
      let y = centerY;
      
      // Draw Pi spiral
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      digits.forEach((digit, i) => {
        // Calculate angle based on digit (0-9 maps to 0-2π)
        const angle = (digit / 10) * Math.PI * 2;
        // Radius increases with each digit
        const radius = radiusStep * (i + 1);
        
        // Calculate new position
        const newX = x + Math.cos(angle) * radius / 10;
        const newY = y + Math.sin(angle) * radius / 10;
        
        // Draw line to new position
        ctx.lineTo(newX, newY);
        
        // Draw digit at every 5th position
        if (i % 5 === 0) {
          ctx.fillStyle = `hsl(${(digit * 36) % 360}, 80%, 60%)`;
          ctx.font = '10px Arial';
          ctx.fillText(digit.toString(), newX + 10, newY);
        }
        
        // Update position
        x = newX;
        y = newY;
      });
      
      // Style the path
      const gradient = ctx.createLinearGradient(centerX - maxRadius, centerY - maxRadius, centerX + maxRadius, centerY + maxRadius);
      gradient.addColorStop(0, 'rgba(64, 0, 128, 0.8)');
      gradient.addColorStop(0.5, 'rgba(0, 128, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 200, 200, 0.8)');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // Create a circular visualization of Pi digits
      const radius = Math.min(width, height) * 0.35;
      
      // Draw circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw Pi digits around circle
      digits.forEach((digit, i) => {
        const angle = (i / digits.length) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        // Draw segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = `hsla(${(digit * 36) % 360}, 80%, 60%, 0.5)`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw digit
        if (i % 10 === 0) {
          ctx.fillStyle = `hsl(${(digit * 36) % 360}, 80%, 60%)`;
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          const labelX = centerX + Math.cos(angle) * (radius + 20);
          const labelY = centerY + Math.sin(angle) * (radius + 20);
          ctx.fillText(digit.toString(), labelX, labelY);
          
          // Add position marker
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
        }
      });
      
      // Draw pi symbol in center
      ctx.font = 'bold 48px serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.textAlign = 'center';
      ctx.fillText('π', centerX, centerY + 15);
    }
    
    // Draw Pi value
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';
    ctx.fillText(`π: 3.${digits.slice(1, 15).join('')}...`, centerX, height - 70);
    
    // Draw explanation
    ctx.font = '14px Arial';
    ctx.fillStyle = '#aaa';
    ctx.textAlign = 'left';
    ctx.fillText('Pi ratios establish the circular relationships in token economics,', 20, height - 40);
    ctx.fillText('creating transcendental balance in the economic model.', 20, height - 20);
  };
  
  // Resize handler for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      const container = canvasContainerRef.current;
      const canvas = canvasRef.current;
      
      if (container && canvas) {
        // Set canvas dimensions to match container
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Redraw visualization after resize
        setTimeout(generateVisualization, 100);
      }
    };
    
    // Initial setup
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Regenerate visualization when parameters change
  useEffect(() => {
    generateVisualization();
  }, [activeTab, fibonacciTerms, piDigits, visualizationType, tokenSymbol]);
  
  // Download current visualization as image
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create temporary link
    const link = document.createElement('a');
    link.download = `aetherion-${activeTab}-visualization.png`;
    link.href = canvas.toDataURL('image/png');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Fractal Visualization Dashboard</span>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={generateVisualization} disabled={isGenerating}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={downloadImage} disabled={isGenerating}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          Explore the mathematical foundations of Aetherion's biozoecurrency model
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="token-distribution">Token Distribution</TabsTrigger>
            <TabsTrigger value="sacred-geometry">Sacred Geometry</TabsTrigger>
            <TabsTrigger value="fibonacci-growth">Fibonacci Growth</TabsTrigger>
            <TabsTrigger value="pi-ratios">Pi Ratios</TabsTrigger>
          </TabsList>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <div 
                ref={canvasContainerRef}
                className="w-full h-[450px] bg-black border border-border rounded-md overflow-hidden relative"
              >
                {isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      <p className="mt-4 text-sm text-muted-foreground">Generating visualization...</p>
                    </div>
                  </div>
                )}
                
                <canvas 
                  ref={canvasRef}
                  className="w-full h-full"
                ></canvas>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Visualization Type</h3>
                <Select value={visualizationType} onValueChange={setVisualizationType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visualization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spiral">Spiral Pattern</SelectItem>
                    <SelectItem value="tree">Tree/Network Pattern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Token</h3>
                <Select value={tokenSymbol} onValueChange={setTokenSymbol}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATC">AetherCoin (ATC)</SelectItem>
                    <SelectItem value="SING">Singularity Coin (SING)</SelectItem>
                    <SelectItem value="FRAC">FractalCoin (FRAC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {activeTab === "fibonacci-growth" && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Fibonacci Terms: {fibonacciTerms}</h3>
                  <Slider
                    value={[fibonacciTerms]}
                    onValueChange={(value) => setFibonacciTerms(value[0])}
                    min={5}
                    max={30}
                    step={1}
                    className="mb-6"
                  />
                </div>
              )}
              
              {activeTab === "pi-ratios" && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Pi Digits: {piDigits}</h3>
                  <Slider
                    value={[piDigits]}
                    onValueChange={(value) => setPiDigits(value[0])}
                    min={10}
                    max={100}
                    step={5}
                    className="mb-6"
                  />
                </div>
              )}
              
              <div className="bg-secondary/20 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  About This Visualization
                </h3>
                
                {activeTab === "token-distribution" && (
                  <p className="text-sm text-muted-foreground">
                    Token distribution follows fractal patterns that ensure balanced and natural allocation,
                    using Fibonacci sequences to create resistance to centralization.
                  </p>
                )}
                
                {activeTab === "sacred-geometry" && (
                  <p className="text-sm text-muted-foreground">
                    Sacred geometry principles guide the mathematical foundation of Aetherion's 
                    recursive growth model, aligning with universal patterns found in nature.
                  </p>
                )}
                
                {activeTab === "fibonacci-growth" && (
                  <p className="text-sm text-muted-foreground">
                    Fibonacci sequences (1,1,2,3,5,8,13...) establish growth patterns with the golden 
                    ratio (φ ≈ 1.618), creating harmonious scaling of the token ecosystem.
                  </p>
                )}
                
                {activeTab === "pi-ratios" && (
                  <p className="text-sm text-muted-foreground">
                    Pi (π) ratios are incorporated into transaction validation and consensus 
                    mechanisms, creating transcendental relationships between network participants.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center text-sm text-muted-foreground">
            <GitMerge className="h-4 w-4 mr-2" />
            <span>Biozoecurrency Visualization Engine v1.0</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Button variant="link" size="sm" className="text-muted-foreground">
              <FileText className="h-4 w-4 mr-2" />
              <span>Documentation</span>
            </Button>
            <Button variant="link" size="sm" className="text-muted-foreground">
              <Share2 className="h-4 w-4 mr-2" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FractalVisualizationDashboard;