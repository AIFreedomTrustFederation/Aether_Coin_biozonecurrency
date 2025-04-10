import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Info, 
  Hash, 
  GitMerge,
  Share2,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import BlockchainSecurityVisualizer from '../components/fractal/BlockchainSecurityVisualizer';

const FractalExplorer = () => {
  const [activeTab, setActiveTab] = useState("mandelbrot");
  const [iterations, setIterations] = useState(100);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [colorScheme, setColorScheme] = useState("cosmic");
  const [centerX, setCenterX] = useState(-0.5);
  const [centerY, setCenterY] = useState(0);
  const [showInfoCard, setShowInfoCard] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fractalType, setFractalType] = useState("mandelbrot");
  const [juliaConstant, setJuliaConstant] = useState({ re: -0.7, im: 0.27 });
  
  const colorSchemes = {
    cosmic: {
      name: "Cosmic Aetheria",
      colors: [
        [0, 0, 0],       // Black
        [48, 25, 52],    // Deep Purple
        [96, 50, 104],   // Purple
        [144, 75, 156],  // Light Purple
        [85, 10, 156],   // Violet
        [30, 30, 255],   // Blue
        [10, 10, 125],   // Dark Blue
        [5, 5, 75]       // Very Dark Blue
      ]
    },
    quantum: {
      name: "Quantum Field",
      colors: [
        [0, 0, 0],       // Black
        [10, 50, 10],    // Dark Green
        [20, 100, 20],   // Green
        [30, 150, 30],   // Light Green
        [40, 200, 100],  // Turquoise
        [50, 125, 200],  // Sky Blue
        [25, 60, 150],   // Blue
        [10, 30, 75]     // Dark Blue
      ]
    },
    blockchain: {
      name: "Blockchain Flow",
      colors: [
        [0, 0, 0],       // Black
        [40, 20, 0],     // Dark Brown
        [80, 40, 0],     // Brown
        [120, 60, 0],    // Light Brown
        [180, 100, 0],   // Orange
        [220, 140, 30],  // Light Orange
        [255, 180, 60],  // Gold
        [255, 220, 90]   // Light Gold
      ]
    },
    fractal: {
      name: "Fractal Energy",
      colors: [
        [0, 0, 0],       // Black
        [20, 0, 40],     // Deep Violet
        [40, 0, 80],     // Violet
        [60, 0, 120],    // Purple
        [100, 0, 140],   // Magenta
        [140, 0, 100],   // Pink
        [180, 0, 60],    // Red
        [220, 0, 20]     // Dark Red
      ]
    }
  };
  
  // Mathematical functions for fractal generation
  const mandelbrotFunction = (x0: number, y0: number, maxIter: number) => {
    let x = 0, y = 0;
    let iter = 0;
    while (x*x + y*y <= 4 && iter < maxIter) {
      const xTemp = x*x - y*y + x0;
      y = 2*x*y + y0;
      x = xTemp;
      iter++;
    }
    return iter;
  };
  
  const juliaFunction = (x0: number, y0: number, maxIter: number) => {
    let x = x0, y = y0;
    let iter = 0;
    const cx = juliaConstant.re;
    const cy = juliaConstant.im;
    
    while (x*x + y*y <= 4 && iter < maxIter) {
      const xTemp = x*x - y*y + cx;
      y = 2*x*y + cy;
      x = xTemp;
      iter++;
    }
    return iter;
  };
  
  const burningShipFunction = (x0: number, y0: number, maxIter: number) => {
    let x = 0, y = 0;
    let iter = 0;
    while (x*x + y*y <= 4 && iter < maxIter) {
      const xTemp = x*x - y*y + x0;
      y = Math.abs(2*x*y) + y0;
      x = xTemp;
      iter++;
    }
    return iter;
  };
  
  // Color calculation function
  const getColor = (iterations: number, maxIterations: number, colorScheme: string) => {
    if (iterations === maxIterations) return [0, 0, 0]; // Black for points in the set
    
    // Get the selected color scheme
    const scheme = colorSchemes[colorScheme as keyof typeof colorSchemes].colors;
    
    // Map iterations to color range
    const colorIndex = iterations % scheme.length;
    const nextColorIndex = (colorIndex + 1) % scheme.length;
    const ratio = (iterations % 1);
    
    // Linear interpolation between colors
    return [
      scheme[colorIndex][0] * (1 - ratio) + scheme[nextColorIndex][0] * ratio,
      scheme[colorIndex][1] * (1 - ratio) + scheme[nextColorIndex][1] * ratio,
      scheme[colorIndex][2] * (1 - ratio) + scheme[nextColorIndex][2] * ratio
    ];
  };
  
  // Generate fractal image
  const generateFractal = React.useCallback(() => {
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
    
    if (width <= 0 || height <= 0) {
      setIsGenerating(false);
      return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    try {
      // Create image data
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      
      // Scale factor based on zoom level (smaller value means more zoom)
      const scale = 4 / zoomLevel;
      
      // For each pixel in the canvas
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          // Map pixel coordinates to complex plane
          const x0 = centerX + (x - width / 2) * scale / width;
          const y0 = centerY + (y - height / 2) * scale / height;
          
          // Calculate iterations using the appropriate fractal function
          let iterationCount;
          switch (fractalType) {
            case "julia":
              iterationCount = juliaFunction(x0, y0, iterations);
              break;
            case "burningShip":
              iterationCount = burningShipFunction(x0, y0, iterations);
              break;
            case "mandelbrot":
            default:
              iterationCount = mandelbrotFunction(x0, y0, iterations);
          }
          
          // Calculate color based on iteration count
          const color = getColor(iterationCount, iterations, colorScheme);
          
          // Set pixel color
          const pixelIndex = (y * width + x) * 4;
          data[pixelIndex] = color[0];     // R
          data[pixelIndex + 1] = color[1]; // G
          data[pixelIndex + 2] = color[2]; // B
          data[pixelIndex + 3] = 255;      // A (fully opaque)
        }
      }
      
      // Draw the image data to the canvas
      ctx.putImageData(imageData, 0, 0);
    } catch (error) {
      console.error("Error generating fractal:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [zoomLevel, centerX, centerY, fractalType, iterations, colorScheme, juliaConstant]);
  
  // Initial generation and regeneration on parameter change
  useEffect(() => {
    // Only generate when component is fully mounted
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      // Make sure canvas has dimensions before generating
      if (canvas.width > 0 && canvas.height > 0) {
        generateFractal();
      }
    }
  }, [generateFractal]);
  
  // Handle canvas click for zooming in at specific point
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Get click coordinates relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Map click to complex plane coordinates
    const scale = 4 / zoomLevel;
    const newCenterX = centerX + (x - canvas.width / 2) * scale / canvas.width;
    const newCenterY = centerY + (y - canvas.height / 2) * scale / canvas.height;
    
    // Update center and zoom
    setCenterX(newCenterX);
    setCenterY(newCenterY);
    setZoomLevel(zoomLevel * 2); // Double the zoom level
  };
  
  // Reset to default view
  const resetView = () => {
    setCenterX(-0.5);
    setCenterY(0);
    setZoomLevel(1);
    setIterations(100);
    if (fractalType === "julia") {
      setJuliaConstant({ re: -0.7, im: 0.27 });
    }
  };
  
  // Handle zoom buttons
  const zoomIn = () => setZoomLevel(zoomLevel * 1.5);
  const zoomOut = () => setZoomLevel(Math.max(0.1, zoomLevel / 1.5));
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFractalType(value);
    resetView();
  };
  
  // Download fractal as image
  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Create temporary link
    const link = document.createElement('a');
    link.download = `aetherion-${fractalType}-fractal.png`;
    link.href = canvas.toDataURL('image/png');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Resize handler for responsive canvas and initial setup
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const container = canvas.parentElement;
        if (container) {
          const width = container.clientWidth;
          const height = container.clientHeight;
          
          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;
          
          // Redraw fractal after resize
          if (width > 0 && height > 0) {
            setTimeout(() => {
              generateFractal();
            }, 100); // Small delay to ensure canvas is ready
          }
        }
      }
    };
    
    // Set up initial dimensions when component mounts
    setTimeout(() => {
      handleResize();
    }, 200);
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [generateFractal]); // Only depend on the generateFractal function
  
  return (
    <div className="flex h-full w-full bg-background">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">
        <motion.div
          className="space-y-6 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Recursive Fractal Explorer</h1>
              <p className="text-muted-foreground">
                Explore the mathematical foundations of Aetherion's recursive fractal architecture
              </p>
            </div>
            
            <Button variant="outline" size="icon" onClick={() => setShowInfoCard(!showInfoCard)}>
              <Info className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator className="my-6" />
          
          {showInfoCard && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-secondary/30 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-primary" />
                    Understanding Recursive Fractals
                  </CardTitle>
                  <CardDescription>
                    How mathematical fractals relate to Aetherion's architecture
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose dark:prose-invert max-w-none">
                    <p>
                      Fractals are infinitely complex patterns that are self-similar across different scales. 
                      They are created by repeating a simple process over and over in an ongoing feedback loop.
                    </p>
                    <p>
                      In Aetherion, we use recursive fractal patterns as a foundational principle for several key components:
                    </p>
                    <ul>
                      <li><strong>Data Structures:</strong> Our Merkle Trees use recursive patterns to efficiently verify data integrity</li>
                      <li><strong>Governance:</strong> Fractal DAOs are organized in recursive, nested decision-making structures</li>
                      <li><strong>Economic Model:</strong> The Fractal Decay and Transformation Protocol follows natural fractal patterns</li>
                      <li><strong>Human-AI Interaction:</strong> Our LLM training models employ recursive self-improvement</li>
                    </ul>
                    <p>
                      By exploring these mathematical models, you can better understand the powerful concepts that make 
                      Aetherion quantum-resistant, scalable, and resilient against centralization.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-card rounded-md border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="text-lg font-medium">
                    {fractalType === "mandelbrot" ? "Mandelbrot Set" : 
                     fractalType === "julia" ? "Julia Set" : 
                     "Burning Ship Fractal"}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={zoomIn}
                      disabled={isGenerating}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={zoomOut}
                      disabled={isGenerating || zoomLevel <= 0.1}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={resetView}
                      disabled={isGenerating}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={downloadImage}
                      disabled={isGenerating}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div 
                  className="relative w-full aspect-square"
                  style={{ height: 'calc(100% - 56px)' }}
                >
                  {isGenerating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <span className="mt-4 text-sm">Generating fractal...</span>
                      </div>
                    </div>
                  )}
                  <canvas 
                    ref={canvasRef} 
                    className="w-full h-full cursor-crosshair"
                    onClick={handleCanvasClick}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GitMerge className="mr-2 h-5 w-5 text-primary" />
                    Fractal Parameters
                  </CardTitle>
                  <CardDescription>
                    Configure the mathematical properties
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="mandelbrot">Mandelbrot</TabsTrigger>
                      <TabsTrigger value="julia">Julia</TabsTrigger>
                      <TabsTrigger value="burningShip">Burning Ship</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="mandelbrot" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Iterations: {iterations}</label>
                          </div>
                          <Slider 
                            value={[iterations]} 
                            min={10} 
                            max={1000} 
                            step={10} 
                            onValueChange={(values) => setIterations(values[0])}
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Zoom Level: {zoomLevel.toFixed(1)}x</label>
                          </div>
                          <Slider 
                            value={[zoomLevel]} 
                            min={0.1} 
                            max={100} 
                            step={0.1} 
                            onValueChange={(values) => setZoomLevel(values[0])}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="julia" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Iterations: {iterations}</label>
                          </div>
                          <Slider 
                            value={[iterations]} 
                            min={10} 
                            max={1000} 
                            step={10} 
                            onValueChange={(values) => setIterations(values[0])}
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Zoom Level: {zoomLevel.toFixed(1)}x</label>
                          </div>
                          <Slider 
                            value={[zoomLevel]} 
                            min={0.1} 
                            max={100} 
                            step={0.1} 
                            onValueChange={(values) => setZoomLevel(values[0])}
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Real Component: {juliaConstant.re.toFixed(3)}</label>
                          </div>
                          <Slider 
                            value={[juliaConstant.re]} 
                            min={-2} 
                            max={2} 
                            step={0.01} 
                            onValueChange={(values) => setJuliaConstant({...juliaConstant, re: values[0]})}
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Imaginary Component: {juliaConstant.im.toFixed(3)}</label>
                          </div>
                          <Slider 
                            value={[juliaConstant.im]} 
                            min={-2} 
                            max={2} 
                            step={0.01} 
                            onValueChange={(values) => setJuliaConstant({...juliaConstant, im: values[0]})}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="burningShip" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Iterations: {iterations}</label>
                          </div>
                          <Slider 
                            value={[iterations]} 
                            min={10} 
                            max={1000} 
                            step={10} 
                            onValueChange={(values) => setIterations(values[0])}
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Zoom Level: {zoomLevel.toFixed(1)}x</label>
                          </div>
                          <Slider 
                            value={[zoomLevel]} 
                            min={0.1} 
                            max={100} 
                            step={0.1} 
                            onValueChange={(values) => setZoomLevel(values[0])}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Hash className="mr-2 h-5 w-5 text-primary" />
                    Visualization Settings
                  </CardTitle>
                  <CardDescription>
                    Adjust how the fractal is displayed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Color Scheme</label>
                    <Select 
                      value={colorScheme} 
                      onValueChange={setColorScheme}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color scheme" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(colorSchemes).map(scheme => (
                          <SelectItem key={scheme} value={scheme}>
                            {colorSchemes[scheme as keyof typeof colorSchemes].name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Share2 className="mr-2 h-5 w-5 text-primary" />
                    Practical Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p className="text-muted-foreground">
                      Aetherion uses fractal patterns for:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Self-similar data structures</li>
                      <li>Quantum-resistant key generation</li>
                      <li>Recursive governance DAOs</li>
                      <li>Adaptive AI training models</li>
                      <li>Economic stability mechanisms</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" disabled>
                    Connect to Blockchain Data (Coming Soon)
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          
          {/* Quantum Security Visualizer Section */}
          <Separator className="my-6" />
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-1">Quantum-Resistant Security Layer</h2>
              <p className="text-muted-foreground">
                Visualize how Aetherion's fractal security model protects cryptocurrency transactions
              </p>
            </div>
          </div>
          
          <BlockchainSecurityVisualizer />
        </motion.div>
      </div>
    </div>
  );
};

export default FractalExplorer;