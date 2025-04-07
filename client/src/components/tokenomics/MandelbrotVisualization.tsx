/**
 * Mandelbrot Visualization Component for AetherCoin BioZoeCurrency
 * 
 * Visualizes the Mandelbrot-based tokenomics with interactive elements
 * showing fractal patterns, Fibonacci sequences, and recursive growth.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { GOLDEN_RATIO, PI } from '../../core/biozoe/FractalAlgorithms';
import { BioZoeLifecycleState } from '../../core/biozoe/types';

// Constants for visualization
const MAX_ITERATIONS = 100;
const CANVAS_SIZE = 500;

export function MandelbrotVisualization() {
  const mandelbrotCanvasRef = useRef<HTMLCanvasElement>(null);
  const torusCanvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [centerX, setCenterX] = useState<number>(-0.7);
  const [centerY, setCenterY] = useState<number>(0);
  const [colorScheme, setColorScheme] = useState<string>("lifecycle");
  const [showDistribution, setShowDistribution] = useState<boolean>(true);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [animating, setAnimating] = useState<boolean>(false);
  const animationRef = useRef<number | null>(null);
  
  // Draw the Mandelbrot set visualization
  useEffect(() => {
    if (!mandelbrotCanvasRef.current) return;
    
    const canvas = mandelbrotCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate zoom parameters
    const scale = 1.5 / zoomLevel;
    const offsetX = centerX;
    const offsetY = centerY;
    
    // Draw the Mandelbrot set
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        // Map canvas coordinates to complex plane
        const realPart = (x - canvas.width / 2) * scale / (canvas.width / 4) + offsetX;
        const imagPart = (y - canvas.height / 2) * scale / (canvas.height / 4) + offsetY;
        
        // Calculate Mandelbrot iterations
        let zReal = realPart;
        let zImag = imagPart;
        let iteration = 0;
        
        while (zReal * zReal + zImag * zImag <= 4 && iteration < MAX_ITERATIONS) {
          // z = z² + c
          const nextZReal = zReal * zReal - zImag * zImag + realPart;
          zImag = 2 * zReal * zImag + imagPart;
          zReal = nextZReal;
          iteration++;
        }
        
        // Calculate color based on iterations
        const pixelIndex = (y * canvas.width + x) * 4;
        
        if (iteration === MAX_ITERATIONS) {
          // Point is in the Mandelbrot set - use black
          data[pixelIndex] = 0;
          data[pixelIndex + 1] = 0;
          data[pixelIndex + 2] = 0;
          data[pixelIndex + 3] = 255;
        } else {
          // Choose coloring based on selected scheme
          switch (colorScheme) {
            case "lifecycle":
              // Lifecycle-based coloring (Seed, Growth, Flowering, Legacy)
              const normalizedIteration = iteration / MAX_ITERATIONS;
              if (normalizedIteration < 0.25) {
                // Seed - Green
                data[pixelIndex] = 50;
                data[pixelIndex + 1] = 205;
                data[pixelIndex + 2] = 50;
              } else if (normalizedIteration < 0.5) {
                // Growth - Blue-Green
                data[pixelIndex] = 0;
                data[pixelIndex + 1] = 150;
                data[pixelIndex + 2] = 200;
              } else if (normalizedIteration < 0.75) {
                // Flowering - Purple-Pink
                data[pixelIndex] = 186;
                data[pixelIndex + 1] = 85;
                data[pixelIndex + 2] = 211;
              } else {
                // Legacy - Blue
                data[pixelIndex] = 65;
                data[pixelIndex + 1] = 105;
                data[pixelIndex + 2] = 225;
              }
              data[pixelIndex + 3] = 255;
              break;
              
            case "fibonacci":
              // Fibonacci-based coloring
              const fibIndex = iteration % 12; // Use modulo to cycle through the sequence
              const fib = getFibonacciNumber(fibIndex + 1);
              const normalizedFib = (fib % 144) / 144; // Normalize using 12th Fibonacci number
              
              // Create a gold-purple scheme based on Fibonacci values
              const fibHue = normalizedFib * 260 + 40; // 40-300 range (gold to purple)
              const [fibR, fibG, fibB] = hslToRgb(fibHue / 360, 0.8, 0.5);
              
              data[pixelIndex] = fibR;
              data[pixelIndex + 1] = fibG;
              data[pixelIndex + 2] = fibB;
              data[pixelIndex + 3] = 255;
              break;
              
            case "golden":
              // Golden Ratio-based coloring
              const golden = (iteration * GOLDEN_RATIO) % 1.0;
              const goldenAngle = golden * 2 * Math.PI;
              
              // Use golden angle to create harmonious colors
              const [goldenR, goldenG, goldenB] = hslToRgb(golden, 0.8, 0.5);
              
              data[pixelIndex] = goldenR;
              data[pixelIndex + 1] = goldenG;
              data[pixelIndex + 2] = goldenB;
              data[pixelIndex + 3] = 255;
              break;
              
            default:
              // Default rainbow coloring
              const defaultHue = (iteration / MAX_ITERATIONS) * 360;
              const [defaultR, defaultG, defaultB] = hslToRgb(defaultHue / 360, 0.8, 0.5);
              
              data[pixelIndex] = defaultR;
              data[pixelIndex + 1] = defaultG;
              data[pixelIndex + 2] = defaultB;
              data[pixelIndex + 3] = 255;
          }
        }
      }
    }
    
    // Put the image data on the canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Draw distribution visualization if enabled
    if (showDistribution) {
      drawTokenDistribution(ctx, canvas.width, canvas.height);
    }
  }, [zoomLevel, centerX, centerY, colorScheme, showDistribution]);
  
  // Draw the Torus visualization
  useEffect(() => {
    if (!torusCanvasRef.current) return;
    
    const canvas = torusCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw torus
    drawTorus(ctx, canvas.width, canvas.height, rotationAngle);
  }, [rotationAngle]);
  
  // Animation loop for rotating the torus
  useEffect(() => {
    if (animating) {
      const animate = () => {
        setRotationAngle(prev => (prev + 0.01) % (2 * Math.PI));
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animating]);
  
  // Draw token distribution visualization on the Mandelbrot set
  const drawTokenDistribution = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Draw main cardioid (represents main token allocation)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    
    // Calculate scale to match current zoom level
    const scale = width / 4 / (1.5 / zoomLevel);
    const offsetXPx = width / 2 - centerX * scale;
    const offsetYPx = height / 2 - centerY * scale;
    
    // Draw main cardioid (70% allocation)
    ctx.beginPath();
    for (let angle = 0; angle <= 2 * Math.PI; angle += 0.01) {
      // Cardioid formula: r = 0.5 - 0.5 * cos(angle)
      const r = 0.5 - 0.5 * Math.cos(angle);
      const x = offsetXPx + (r * Math.cos(angle) - 0.25) * scale;
      const y = offsetYPx + (r * Math.sin(angle)) * scale;
      
      if (angle === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    
    // Draw main circular bulb (20% allocation)
    ctx.beginPath();
    const bulbX = offsetXPx + (-1 + 0.25) * scale;
    const bulbY = offsetYPx;
    const bulbRadius = 0.25 * scale;
    ctx.arc(bulbX, bulbY, bulbRadius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Draw distribution labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    // Main cardioid label
    ctx.fillText('70% Supply', offsetXPx, offsetYPx);
    
    // Bulb label
    ctx.fillText('20% Supply', bulbX, bulbY);
    
    // Add explanatory note about smaller bulbs (10% remaining)
    ctx.font = '12px Arial';
    ctx.fillText('Remaining 10% distributed across smaller bulbs', width / 2, height - 20);
  };
  
  // Draw torus visualization
  const drawTorus = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    rotation: number
  ) => {
    // Set up parameters
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) * 0.4;
    const innerRadius = outerRadius * 0.5;
    const torusThickness = outerRadius - innerRadius;
    
    // Clear the canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw the torus using a series of ellipses at different rotations
    for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 36) {
      const rotatedAngle = angle + rotation;
      
      // Calculate the ellipse parameters for this slice of the torus
      const ellipseWidth = outerRadius * 2;
      const ellipseHeight = torusThickness * 2 * Math.abs(Math.sin(rotatedAngle));
      
      // Skip drawing when the ellipse would be too thin (facing away)
      if (ellipseHeight < 1) continue;
      
      // Draw the ellipse
      ctx.beginPath();
      
      // Vary opacity based on position (more opaque in front, more transparent in back)
      const opacity = 0.2 + 0.8 * ((Math.sin(rotatedAngle) + 1) / 2);
      
      // Use colors based on lifecycle states for different parts of the torus
      let color: string;
      if (rotatedAngle % (Math.PI / 2) < Math.PI / 4) {
        // Seed regions (green)
        color = `rgba(76, 175, 80, ${opacity})`;
      } else if (rotatedAngle % Math.PI < Math.PI / 2) {
        // Growth regions (blue-green)
        color = `rgba(0, 188, 212, ${opacity})`;
      } else if (rotatedAngle % (Math.PI * 1.5) < Math.PI) {
        // Flowering regions (purple)
        color = `rgba(156, 39, 176, ${opacity})`;
      } else {
        // Legacy regions (blue)
        color = `rgba(63, 81, 181, ${opacity})`;
      }
      
      ctx.fillStyle = color;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 0.5;
      
      // Draw the ellipse
      ctx.ellipse(
        centerX,
        centerY,
        ellipseWidth / 2,
        Math.max(1, ellipseHeight / 2),
        0,
        0,
        2 * Math.PI
      );
      
      ctx.fill();
      ctx.stroke();
    }
    
    // Draw energy flow lines
    drawEnergyFlows(ctx, centerX, centerY, outerRadius, rotation);
    
    // Draw token positions on the torus
    drawTokenPositions(ctx, centerX, centerY, outerRadius, innerRadius, rotation);
  };
  
  // Draw energy flow visualizations on the torus
  const drawEnergyFlows = (
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    radius: number, 
    rotation: number
  ) => {
    // Number of flow lines
    const flowCount = 8;
    
    // Draw flow lines
    for (let i = 0; i < flowCount; i++) {
      const baseAngle = (i / flowCount) * 2 * Math.PI;
      const flowLength = radius * 0.8;
      
      // Start point on torus
      const startX = centerX + Math.cos(baseAngle + rotation) * radius;
      const startY = centerY + Math.sin(baseAngle + rotation) * radius;
      
      // Create gradient for flow line
      const gradient = ctx.createLinearGradient(
        startX, startY,
        centerX + Math.cos(baseAngle + rotation + Math.PI / 8) * (radius + flowLength),
        centerY + Math.sin(baseAngle + rotation + Math.PI / 8) * (radius + flowLength)
      );
      
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      
      // Draw curved flow line
      ctx.moveTo(startX, startY);
      
      // Control points for curve to create spiral effect
      const controlX1 = centerX + Math.cos(baseAngle + rotation + Math.PI / 16) * (radius + flowLength * 0.3);
      const controlY1 = centerY + Math.sin(baseAngle + rotation + Math.PI / 16) * (radius + flowLength * 0.3);
      
      const controlX2 = centerX + Math.cos(baseAngle + rotation + Math.PI / 12) * (radius + flowLength * 0.6);
      const controlY2 = centerY + Math.sin(baseAngle + rotation + Math.PI / 12) * (radius + flowLength * 0.6);
      
      const endX = centerX + Math.cos(baseAngle + rotation + Math.PI / 8) * (radius + flowLength);
      const endY = centerY + Math.sin(baseAngle + rotation + Math.PI / 8) * (radius + flowLength);
      
      ctx.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, endX, endY);
      ctx.stroke();
      
      // Draw particles along the flow line for animation
      const particleCount = 5;
      for (let p = 0; p < particleCount; p++) {
        const t = (p / particleCount + (Date.now() % 2000) / 2000) % 1;
        
        // Get point along the Bezier curve
        const pX = bezierPoint(startX, controlX1, controlX2, endX, t);
        const pY = bezierPoint(startY, controlY1, controlY2, endY, t);
        
        // Particle size based on position (smaller as it flows outward)
        const particleSize = 3 * (1 - t);
        
        // Particle color (fade out as it flows)
        ctx.fillStyle = `rgba(255, 255, 255, ${1 - t})`;
        
        ctx.beginPath();
        ctx.arc(pX, pY, particleSize, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };
  
  // Draw token positions on the torus
  const drawTokenPositions = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    outerRadius: number,
    innerRadius: number,
    rotation: number
  ) => {
    // Sample token data (in a real implementation, this would come from bioZoeService)
    const sampleTokens = [
      { lifeState: BioZoeLifecycleState.SEED, theta: 0.2, phi: 1.5, strength: 0.3 },
      { lifeState: BioZoeLifecycleState.GROWTH, theta: 1.8, phi: 3.7, strength: 0.7 },
      { lifeState: BioZoeLifecycleState.FLOWERING, theta: 3.5, phi: 2.2, strength: 0.9 },
      { lifeState: BioZoeLifecycleState.LEGACY, theta: 5.2, phi: 5.8, strength: 0.5 },
      { lifeState: BioZoeLifecycleState.SEED, theta: 4.7, phi: 0.8, strength: 0.2 },
    ];
    
    // Draw each token
    sampleTokens.forEach(token => {
      // Adjust angles based on rotation
      const adjustedTheta = token.theta + rotation;
      const adjustedPhi = token.phi + rotation / 2;
      
      // Calculate 3D position on torus
      // Torus formula: x = (R + r cos(phi)) cos(theta), y = (R + r cos(phi)) sin(theta), z = r sin(phi)
      const R = (outerRadius + innerRadius) / 2; // Major radius (to center of tube)
      const r = (outerRadius - innerRadius) / 2; // Minor radius (tube thickness)
      
      const x = (R + r * Math.cos(adjustedPhi)) * Math.cos(adjustedTheta);
      const y = (R + r * Math.cos(adjustedPhi)) * Math.sin(adjustedTheta);
      const z = r * Math.sin(adjustedPhi);
      
      // Only draw tokens that are in front (positive z)
      if (z > 0) {
        // Project to screen coordinates
        const screenX = centerX + x;
        const screenY = centerY + y;
        
        // Get state-based color
        let color;
        switch (token.lifeState) {
          case BioZoeLifecycleState.SEED:
            color = 'rgba(76, 175, 80, 0.8)'; // Green
            break;
          case BioZoeLifecycleState.GROWTH:
            color = 'rgba(0, 188, 212, 0.8)'; // Blue-green
            break;
          case BioZoeLifecycleState.FLOWERING:
            color = 'rgba(156, 39, 176, 0.8)'; // Purple
            break;
          case BioZoeLifecycleState.LEGACY:
            color = 'rgba(63, 81, 181, 0.8)'; // Blue
            break;
          default:
            color = 'rgba(255, 255, 255, 0.8)';
        }
        
        // Size based on entanglement strength and z-position
        const size = 5 + token.strength * 10;
        
        // Draw the token
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(screenX, screenY, size, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add glow effect
        const gradient = ctx.createRadialGradient(
          screenX, screenY, size * 0.5,
          screenX, screenY, size * 2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(screenX, screenY, size * 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };
  
  // Handle click on Mandelbrot canvas to zoom in
  const handleMandelbrotClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mandelbrotCanvasRef.current) return;
    
    const canvas = mandelbrotCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get click position relative to canvas
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to complex plane coordinates
    const scale = 1.5 / zoomLevel;
    const clickRealPart = (x - canvas.width / 2) * scale / (canvas.width / 4) + centerX;
    const clickImagPart = (y - canvas.height / 2) * scale / (canvas.height / 4) + centerY;
    
    // Update center and increase zoom
    setCenterX(clickRealPart);
    setCenterY(clickImagPart);
    setZoomLevel(prev => prev * 1.5);
  };
  
  // Reset zoom to default
  const resetZoom = () => {
    setCenterX(-0.7);
    setCenterY(0);
    setZoomLevel(1);
  };
  
  // Toggle torus animation
  const toggleAnimation = () => {
    setAnimating(prev => !prev);
  };
  
  // Utility function: Get nth Fibonacci number
  const getFibonacciNumber = (n: number): number => {
    if (n <= 0) return 0;
    if (n === 1 || n === 2) return 1;
    
    let a = 1, b = 1;
    for (let i = 3; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  };
  
  // Utility function: HSL to RGB conversion
  const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // Achromatic
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };
  
  // Utility function: Calculate point along Bezier curve
  const bezierPoint = (
    p0: number, p1: number, p2: number, p3: number, t: number
  ): number => {
    const oneMinusT = 1 - t;
    return (
      oneMinusT * oneMinusT * oneMinusT * p0 +
      3 * oneMinusT * oneMinusT * t * p1 +
      3 * oneMinusT * t * t * p2 +
      t * t * t * p3
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AetherCoin Fractal Tokenomics</CardTitle>
        <CardDescription>
          Visualizing the Mandelbrot-based recursive tokenomics and toroidal energy flows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mandelbrot">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mandelbrot">Mandelbrot Distribution</TabsTrigger>
            <TabsTrigger value="torus">Toroidal Energy Flows</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mandelbrot" className="space-y-4">
            <div className="relative">
              <canvas 
                ref={mandelbrotCanvasRef} 
                width={CANVAS_SIZE} 
                height={CANVAS_SIZE}
                onClick={handleMandelbrotClick}
                className="w-full aspect-square border rounded-md cursor-pointer"
              />
              
              <div className="absolute bottom-2 right-2 space-x-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={resetZoom}
                >
                  Reset Zoom
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Zoom Level: {zoomLevel.toFixed(1)}x</span>
                <span className="text-sm">Position: ({centerX.toFixed(3)}, {centerY.toFixed(3)}i)</span>
              </div>
              
              <div>
                <div className="text-sm mb-1">Color Scheme</div>
                <ToggleGroup type="single" value={colorScheme} onValueChange={(value) => value && setColorScheme(value)}>
                  <ToggleGroupItem value="lifecycle">Lifecycle States</ToggleGroupItem>
                  <ToggleGroupItem value="fibonacci">Fibonacci</ToggleGroupItem>
                  <ToggleGroupItem value="golden">Golden Ratio</ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm">
                  <input 
                    type="checkbox" 
                    checked={showDistribution} 
                    onChange={(e) => setShowDistribution(e.target.checked)}
                    className="mr-2"
                  />
                  Show Token Distribution
                </label>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h3 className="font-medium">Mandelbrot Tokenomics Explained</h3>
              <p className="text-sm text-muted-foreground">
                The Mandelbrot set visually represents AetherCoin's BioZoe tokenomics. The largest region (the 
                cardioid) represents 70% of the token supply, with the primary circular bulb holding 20%. 
                The remaining 10% is distributed across smaller recursive bulbs, creating a natural fractal pattern.
              </p>
              <p className="text-sm text-muted-foreground">
                Click anywhere on the fractal to zoom in and explore deeper regions of the Mandelbrot set.
                Each region corresponds to different token properties and growth patterns.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="torus" className="space-y-4">
            <div className="relative">
              <canvas 
                ref={torusCanvasRef} 
                width={CANVAS_SIZE} 
                height={CANVAS_SIZE}
                className="w-full aspect-square border rounded-md"
              />
              
              <div className="absolute bottom-2 right-2 space-x-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={toggleAnimation}
                >
                  {animating ? 'Stop Animation' : 'Start Animation'}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex flex-col space-y-2">
                <span className="text-sm">Rotation Angle</span>
                <Slider 
                  value={[rotationAngle * (180 / Math.PI)]} 
                  min={0} 
                  max={360} 
                  step={1}
                  onValueChange={(values) => setRotationAngle(values[0] * (Math.PI / 180))}
                  disabled={animating}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 bg-green-100 text-green-800 rounded-md">
                <span className="text-sm font-medium">Seed Tokens</span>
              </div>
              <div className="p-3 bg-cyan-100 text-cyan-800 rounded-md">
                <span className="text-sm font-medium">Growth Tokens</span>
              </div>
              <div className="p-3 bg-purple-100 text-purple-800 rounded-md">
                <span className="text-sm font-medium">Flowering Tokens</span>
              </div>
              <div className="p-3 bg-blue-100 text-blue-800 rounded-md">
                <span className="text-sm font-medium">Legacy Tokens</span>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h3 className="font-medium">Toroidal Energy Flow Explained</h3>
              <p className="text-sm text-muted-foreground">
                AetherCoin's BioZoeCurrency operates within a torus field where energy flows in circular patterns, 
                creating a self-sustaining ecosystem. Tokens exist along the surface of this torus, interacting 
                and exchanging energy based on their lifecycle state.
              </p>
              <p className="text-sm text-muted-foreground">
                Energy flows (shown as white streams) circulate through the system, nurturing tokens and enabling growth. 
                This toroidal flow ensures that value is never lost but continuously circulates through the ecosystem.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default MandelbrotVisualization;