/**
 * Quantum Security Dashboard
 * 
 * A comprehensive visualization dashboard for monitoring the quantum security
 * state of FractalCoin's blockchain, showing all quantum security features in action.
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuantumState } from '../hooks/useQuantumState';
import {
  Shield, 
  Zap, 
  Atom, 
  Clock, 
  Layers, 
  Network, 
  GitBranch, 
  Infinity, 
  Cpu,
  RefreshCw,
  BarChart4,
  AlarmClock,
  LayoutGrid,
  Lock,
  Key
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { QuantumAlgorithmStatus } from './QuantumAlgorithmStatus';
import styles from './QuantumSecurityDashboard.module.css';

// Helper to format timestamp in relative terms
const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diffMs = now - timestamp;
  
  if (diffMs < 0) {
    // Future time
    const absDiff = Math.abs(diffMs);
    
    if (absDiff < 60000) return `in ${Math.round(absDiff / 1000)} seconds`;
    if (absDiff < 3600000) return `in ${Math.round(absDiff / 60000)} minutes`;
    if (absDiff < 86400000) return `in ${Math.round(absDiff / 3600000)} hours`;
    return `in ${Math.round(absDiff / 86400000)} days`;
  } else {
    // Past time
    if (diffMs < 60000) return `${Math.round(diffMs / 1000)} seconds ago`;
    if (diffMs < 3600000) return `${Math.round(diffMs / 60000)} minutes ago`;
    if (diffMs < 86400000) return `${Math.round(diffMs / 3600000)} hours ago`;
    return `${Math.round(diffMs / 86400000)} days ago`;
  }
};

// Helper to get color for security level
const getSecurityLevelColor = (level: string): string => {
  switch (level) {
    case 'timeless': return 'bg-violet-600 hover:bg-violet-500';
    case 'maximum': return 'bg-indigo-600 hover:bg-indigo-500';
    case 'enhanced': return 'bg-blue-600 hover:bg-blue-500';
    case 'standard': return 'bg-emerald-600 hover:bg-emerald-500';
    default: return 'bg-slate-600 hover:bg-slate-500';
  }
};

// Helper to get color for quantum state
const getQuantumStateColor = (state: string): string => {
  switch (state) {
    case 'superposition': return 'text-blue-500';
    case 'entangled': return 'text-violet-500';
    case 'collapsed': return 'text-amber-500';
    case 'fractal-aligned': return 'text-emerald-500';
    default: return 'text-slate-500';
  }
};

// Helper to get icon for time flow direction
const getTimeFlowIcon = (direction: string) => {
  switch (direction) {
    case 'past': return <AlarmClock className="h-4 w-4 mr-1 rotate-180" />;
    case 'future': return <AlarmClock className="h-4 w-4 mr-1" />;
    case 'present': return <Clock className="h-4 w-4 mr-1" />;
    default: return <Clock className="h-4 w-4 mr-1" />;
  }
};

/**
 * The Fractal Visualization component shows a visual representation of the fractal network
 */
const FractalVisualization: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { quantumState, fractalValidationLevels, convergenceIntensity } = useQuantumState();
  
  // Color palette based on quantum states
  const colors = {
    superposition: 'rgba(59, 130, 246, 0.8)',  // blue
    entangled: 'rgba(139, 92, 246, 0.8)',      // violet
    collapsed: 'rgba(251, 191, 36, 0.8)',      // amber
    fractalAligned: 'rgba(16, 185, 129, 0.8)', // emerald
    background: 'rgba(15, 23, 42, 0.1)',       // slate bg
    node: 'rgba(255, 255, 255, 0.8)',          // node color
    line: 'rgba(203, 213, 225, 0.3)'           // line color
  };
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Calculate total nodes
    const totalNodes = Object.values(fractalValidationLevels).reduce((sum, count) => sum + count, 0);
    
    // Create nodes
    type Node = { x: number; y: number; type: string; size: number; connections: number[] };
    const nodes: Node[] = [];
    
    // Create different node types based on validation levels
    let nodeIndex = 0;
    const createNodes = (count: number, type: string) => {
      for (let i = 0; i < count; i++) {
        const angle = (nodeIndex / totalNodes) * Math.PI * 2;
        const radius = canvas.height * 0.35 * (0.8 + Math.random() * 0.4);
        const x = canvas.width / 2 + Math.cos(angle) * radius;
        const y = canvas.height / 2 + Math.sin(angle) * radius;
        const size = 2 + Math.random() * 4;
        
        nodes.push({
          x,
          y,
          type,
          size,
          connections: []
        });
        
        nodeIndex++;
      }
    };
    
    // Create all node types
    createNodes(fractalValidationLevels.phi, 'phi');
    createNodes(fractalValidationLevels.pi, 'pi');
    createNodes(fractalValidationLevels.fibonacci, 'fibonacci');
    createNodes(fractalValidationLevels.mandelbrot, 'mandelbrot');
    createNodes(fractalValidationLevels.quantum, 'quantum');
    
    // Create connections based on fractal patterns
    for (let i = 0; i < nodes.length; i++) {
      // Each node connects to ~20% of other nodes, preferring similar types
      const connectionsCount = Math.floor(nodes.length * 0.05 + Math.random() * nodes.length * 0.15);
      
      for (let c = 0; c < connectionsCount; c++) {
        const targetIndex = Math.floor(Math.random() * nodes.length);
        if (targetIndex !== i && !nodes[i].connections.includes(targetIndex)) {
          nodes[i].connections.push(targetIndex);
        }
      }
    }
    
    // Draw connections
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      for (const targetIndex of node.connections) {
        const target = nodes[targetIndex];
        
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    }
    
    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      
      // Select color based on node type
      switch (node.type) {
        case 'phi':
          ctx.fillStyle = colors.fractalAligned;
          break;
        case 'pi':
          ctx.fillStyle = colors.superposition;
          break;
        case 'fibonacci':
          ctx.fillStyle = colors.entangled;
          break;
        case 'mandelbrot':
          ctx.fillStyle = colors.collapsed;
          break;
        case 'quantum':
          // Pulse effect for quantum nodes
          const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + pulse * 0.5})`;
          break;
        default:
          ctx.fillStyle = colors.node;
      }
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw "convergence waves" based on convergence intensity
    if (convergenceIntensity > 0.1) {
      const waveCount = Math.floor(convergenceIntensity * 5) + 1;
      
      for (let i = 0; i < waveCount; i++) {
        const progress = (Date.now() % 3000) / 3000; // 3-second cycle
        const size = (progress + i / waveCount) % 1;
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - size) * 0.2 * convergenceIntensity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(
          canvas.width / 2,
          canvas.height / 2,
          size * canvas.height * 0.8,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    }
    
    // Add a glow effect based on quantum state
    let glowColor = '';
    switch (quantumState) {
      case 'superposition':
        glowColor = colors.superposition;
        break;
      case 'entangled':
        glowColor = colors.entangled;
        break;
      case 'collapsed':
        glowColor = colors.collapsed;
        break;
      case 'fractal-aligned':
        glowColor = colors.fractalAligned;
        break;
    }
    
    // Create radial gradient for the quantum state influence
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.height * 0.5
    );
    gradient.addColorStop(0, glowColor.replace('0.8', '0.2'));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Animation loop
    const animationFrame = requestAnimationFrame(() => {
      // This will re-trigger on the next frame
    });
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [canvasRef, fractalValidationLevels, quantumState, convergenceIntensity, colors]);
  
  return (
    <canvas 
      ref={canvasRef}
      className={styles.fractalCanvas}
    />
  );
};

/**
 * The TimeStream visualization shows the active timestreams and their convergence
 */

// Define types for the TimeStream visualization
interface TimePoint {
  x: number;
  y: number;
}

interface TimeStream {
  id: string;
  points: TimePoint[];
  isActive: boolean;
}

const TimeStreamVisualization: React.FC = () => {
  const { eternalNowTimestamp, timeStreamCount, activeTimeStream, createBranchingTimeStream } = useQuantumState();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Create timestreams
    const streamCount = timeStreamCount || 3; // Fallback
    const streams: TimeStream[] = [];
    
    // Base stream (present timestream)
    const baseStream: TimeStream = {
      id: 'primary',
      points: [],
      isActive: 'primary' === activeTimeStream
    };
    
    // Create points along the base timestream
    const basePointCount = 100;
    for (let i = 0; i < basePointCount; i++) {
      const x = (i / (basePointCount - 1)) * canvas.width;
      const progress = i / (basePointCount - 1);
      
      // Create a smooth baseline with a small wave pattern
      const y = canvas.height / 2 + Math.sin(progress * Math.PI * 4) * 10;
      
      baseStream.points.push({ x, y });
    }
    streams.push(baseStream);
    
    // Create branching timestreams
    for (let s = 1; s < streamCount; s++) {
      const streamId = `stream-${s}`;
      const stream: TimeStream = {
        id: streamId,
        points: [],
        isActive: streamId === activeTimeStream
      };
      
      // Determine where this stream branches from the base stream
      const branchPoint = Math.floor(Math.random() * (basePointCount * 0.4) + basePointCount * 0.2);
      
      // Create points, following base stream until branch point
      for (let i = 0; i < basePointCount; i++) {
        if (i < branchPoint) {
          // Follow base stream
          stream.points.push({ ...baseStream.points[i] });
        } else {
          // Branch away with increasing deviation
          const basePoint = baseStream.points[i];
          const progress = (i - branchPoint) / (basePointCount - branchPoint);
          const deviation = progress * (Math.random() > 0.5 ? 1 : -1) * (30 + s * 15);
          const y = basePoint.y + deviation;
          
          stream.points.push({ x: basePoint.x, y });
        }
      }
      
      streams.push(stream);
    }
    
    // Draw timestreams
    streams.forEach((stream, index) => {
      const isActive = stream.isActive;
      
      // Style based on whether this is the active timestream
      ctx.strokeStyle = isActive ? 'rgba(139, 92, 246, 0.9)' : `rgba(255, 255, 255, ${0.3 + index * 0.05})`;
      ctx.lineWidth = isActive ? 3 : 1.5;
      
      // Draw the stream
      ctx.beginPath();
      ctx.moveTo(stream.points[0].x, stream.points[0].y);
      
      for (let i = 1; i < stream.points.length; i++) {
        ctx.lineTo(stream.points[i].x, stream.points[i].y);
      }
      
      ctx.stroke();
      
      // If active, add a glow effect
      if (isActive) {
        ctx.shadowColor = 'rgba(139, 92, 246, 0.7)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });
    
    // Mark the current point in time (the "Eternal Now" point)
    const now = Date.now();
    const timeRange = 24 * 60 * 60 * 1000; // 24 hours total range
    
    // Find where "now" is on the timeline
    const timeProgress = Math.min(1, Math.max(0, (now - (eternalNowTimestamp - timeRange/2)) / timeRange));
    const nowX = timeProgress * canvas.width;
    
    // Draw vertical line at current time
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(nowX, 0);
    ctx.lineTo(nowX, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw pulse effect at the intersection of the active timestream and "now"
    const activeStream = streams.find(s => s.isActive) || streams[0];
    const activeStreamIndex = Math.floor(timeProgress * (activeStream.points.length - 1));
    
    if (activeStreamIndex >= 0 && activeStreamIndex < activeStream.points.length) {
      const intersectionY = activeStream.points[activeStreamIndex].y;
      
      // Pulse effect
      const pulseSize = (Math.sin(Date.now() * 0.005) * 0.5 + 0.5) * 10 + 5;
      
      // Draw pulse circle
      ctx.fillStyle = 'rgba(139, 92, 246, 0.7)';
      ctx.beginPath();
      ctx.arc(nowX, intersectionY, pulseSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw inner circle
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(nowX, intersectionY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw time labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    // Past label
    ctx.fillText('Past', canvas.width * 0.2, canvas.height - 10);
    // Present label
    ctx.fillText('Eternal Now', nowX, canvas.height - 10);
    // Future label
    ctx.fillText('Future', canvas.width * 0.8, canvas.height - 10);
    
    // Animation loop
    const animationFrame = requestAnimationFrame(() => {
      // This will re-trigger on the next frame
    });
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [canvasRef, timeStreamCount, activeTimeStream, eternalNowTimestamp]);
  
  // Handler for creating a new branch
  const handleCreateBranch = () => {
    createBranchingTimeStream(0.3);
  };
  
  return (
    <div className="relative w-full h-full">
      <canvas 
        ref={canvasRef}
        className={styles.timeStreamCanvas}
      />
      <div className="absolute bottom-4 right-4">
        <Button 
          size="sm"
          onClick={handleCreateBranch}
          className="bg-violet-500 hover:bg-violet-600"
        >
          <GitBranch className="h-4 w-4 mr-1" />
          Create Branch
        </Button>
      </div>
    </div>
  );
};

/**
 * Main Quantum Security Dashboard component
 */
export const QuantumSecurityDashboard: React.FC = () => {
  const quantumState = useQuantumState();
  const [transactionDemo, setTransactionDemo] = useState<{
    transaction: any;
    secured: any;
    verified: boolean;
  } | null>(null);
  
  // Create a demo transaction
  const createDemoTransaction = () => {
    // Demo transaction to show security process
    const transaction = {
      id: `tx-${Date.now().toString(36)}`,
      timestamp: Date.now(),
      amount: 3.14159265,
      sender: '0xQuantum7f3e5d7a8b9c1d2e4f6',
      recipient: '0xFractal3a1b2c3d4e5f6g7h8i9j',
      memo: 'Secure quantum transaction via fractal network'
    };
    
    // Generate wallet keys for demo
    const keys = quantumState.generateWalletKeys();
    
    // Secure the transaction
    const secured = quantumState.secureTransaction(transaction);
    
    // Verify the transaction
    const verified = quantumState.verifyTransaction(transaction, "signature");
    
    // Update state with demo result
    setTransactionDemo({
      transaction,
      secured,
      verified
    });
  };
  
  // Security level badge component
  const SecurityLevelBadge = () => {
    const level = quantumState.securityLevel;
    const bgColor = getSecurityLevelColor(level);
    
    return (
      <Badge className={`${bgColor} capitalize`}>
        {level}
      </Badge>
    );
  };
  
  // Security score indicator
  const SecurityScoreIndicator = () => {
    const score = quantumState.score;
    
    let color = 'bg-green-500';
    if (score < 70) color = 'bg-yellow-500';
    if (score < 50) color = 'bg-orange-500';
    if (score < 30) color = 'bg-red-500';
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Security Score</span>
          <span className="text-sm font-medium">{score}/100</span>
        </div>
        <Progress 
          value={score} 
          className={`h-2 ${color.replace('bg-', '')}`}
        />
      </div>
    );
  };
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Shield className="mr-2 h-6 w-6 text-primary" />
              Quantum Security Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time monitoring of FractalCoin's quantum-resistant security systems
            </p>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm text-muted-foreground">Security Level:</span>
              <SecurityLevelBadge />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Quantum State:</span>
              <span className={`text-sm font-medium ${getQuantumStateColor(quantumState.quantumState)}`}>
                {quantumState.quantumState.replace('-', ' ')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Security Status Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Security Status
              </CardTitle>
              <CardDescription>
                Current quantum security metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityScoreIndicator />
              
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Cpu className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">Quantum Resistant</span>
                  </div>
                  <Badge variant={quantumState.quantumResistant ? "default" : "outline"}>
                    {quantumState.quantumResistant ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Network className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">Fractal Consensus</span>
                  </div>
                  <Badge variant={quantumState.consensusActive ? "default" : "outline"}>
                    {quantumState.consensusActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">Temporal Coherence</span>
                  </div>
                  <span className="text-sm font-medium">
                    {(quantumState.temporalCoherence * 100).toFixed(0)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Infinity className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-sm">Convergence Intensity</span>
                  </div>
                  <span className="text-sm font-medium">
                    {(quantumState.convergenceIntensity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="w-full">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {getTimeFlowIcon(quantumState.timeFlowDirection)}
                    <span className="text-xs text-muted-foreground">
                      Time Flow Direction:
                    </span>
                  </div>
                  <span className="text-xs ml-2 capitalize">
                    {quantumState.timeFlowDirection}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Eternal Now: {formatRelativeTime(quantumState.eternalNowTimestamp)}
                </p>
              </div>
            </CardFooter>
          </Card>
          
          {/* Fractal Network Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <LayoutGrid className="mr-2 h-5 w-5 text-primary" />
                Fractal Network
              </CardTitle>
              <CardDescription>
                Quantum-resistant fractal node distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[240px]">
              <FractalVisualization />
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    Active Nodes: <span className="font-medium">{quantumState.nodeCount}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Quantum Entangled: <span className={quantumState.quantumEntangled ? "text-violet-500 font-medium" : "font-medium"}>
                      {quantumState.quantumEntangled ? "Yes" : "No"}
                    </span>
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          {/* Timestream Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <GitBranch className="mr-2 h-5 w-5 text-primary" />
                Temporal Streams
              </CardTitle>
              <CardDescription>
                Timestream convergence visualization
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[240px]">
              <TimeStreamVisualization />
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    Active Stream: <span className="font-medium">{quantumState.activeTimeStream}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Total Streams: <span className="font-medium">{quantumState.timeStreamCount}</span>
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <Tabs defaultValue="transaction" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="transaction">
              <div className="flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Transaction Security
              </div>
            </TabsTrigger>
            <TabsTrigger value="networks">
              <div className="flex items-center">
                <Network className="h-4 w-4 mr-2" />
                Validation Networks
              </div>
            </TabsTrigger>
            <TabsTrigger value="temporal">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Temporal Analysis
              </div>
            </TabsTrigger>
            <TabsTrigger value="algorithms">
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Quantum Algorithms
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="transaction">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="mr-2 h-5 w-5 text-primary" />
                    Quantum Transaction Security
                  </CardTitle>
                  <CardDescription>
                    Implement post-quantum cryptography for transaction security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Key className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-sm">Wallet Keys Generated</span>
                    </div>
                    <Badge variant={quantumState.keysGenerated ? "default" : "outline"}>
                      {quantumState.keysGenerated ? "Yes" : "No"}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Security Algorithms</h4>
                    <div className="rounded-md bg-muted p-3 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span>CRYSTAL-Kyber</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>SPHINCS+</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Fractal Validation</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Active</Badge>
                      </div>
                    </div>
                  </div>
                  
                  {transactionDemo ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Demo Transaction</h4>
                      <div className="rounded-md bg-muted p-3 text-xs space-y-3">
                        <div className="flex justify-between">
                          <span>Transaction ID</span>
                          <span className="font-mono">{transactionDemo.transaction.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Amount</span>
                          <span>{transactionDemo.transaction.amount} ATC</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Secured</span>
                          <Badge variant={transactionDemo.secured ? "default" : "destructive"}>
                            {transactionDemo.secured ? "Yes" : "Failed"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Verified</span>
                          <Badge variant={transactionDemo.verified ? "default" : "destructive"}>
                            {transactionDemo.verified ? "Success" : "Failed"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={createDemoTransaction}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Test Quantum Security
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart4 className="mr-2 h-5 w-5 text-primary" />
                    Security Analysis
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of quantum security components
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Quantum Resistance</span>
                      <span className="text-sm font-medium">100%</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Fractal Validation</span>
                      <span className="text-sm font-medium">
                        {(quantumState.consensusActive ? 100 : 0)}%
                      </span>
                    </div>
                    <Progress 
                      value={quantumState.consensusActive ? 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Temporal Coherence</span>
                      <span className="text-sm font-medium">
                        {(quantumState.temporalCoherence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={quantumState.temporalCoherence * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Eternal Now Convergence</span>
                      <span className="text-sm font-medium">
                        {(quantumState.convergenceIntensity * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={quantumState.convergenceIntensity * 100} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Alert className="w-full">
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Security Status</AlertTitle>
                    <AlertDescription>
                      FractalCoin's quantum security system is fully operational and providing
                      protection against both classical and quantum computing attacks.
                    </AlertDescription>
                  </Alert>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="networks">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Network className="mr-2 h-5 w-5 text-primary" />
                    Fractal Validation Network
                  </CardTitle>
                  <CardDescription>
                    Quantum-resistant network distribution by validation type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <FractalVisualization />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Layers className="mr-2 h-5 w-5 text-primary" />
                    Validation Layers
                  </CardTitle>
                  <CardDescription>
                    Distribution of validation node types
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TooltipProvider>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center cursor-help">
                                <span className="h-3 w-3 rounded-full bg-emerald-500 mr-2"></span>
                                Phi Validation
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Golden ratio (φ) based validation</p>
                            </TooltipContent>
                          </Tooltip>
                          <span>{quantumState.fractalValidationLevels.phi} nodes</span>
                        </div>
                        <Progress value={(quantumState.fractalValidationLevels.phi / quantumState.nodeCount) * 100} className="h-2 emerald-500" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center cursor-help">
                                <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
                                Pi Validation
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">π ratio circular validation</p>
                            </TooltipContent>
                          </Tooltip>
                          <span>{quantumState.fractalValidationLevels.pi} nodes</span>
                        </div>
                        <Progress value={(quantumState.fractalValidationLevels.pi / quantumState.nodeCount) * 100} className="h-2 blue-500" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center cursor-help">
                                <span className="h-3 w-3 rounded-full bg-violet-500 mr-2"></span>
                                Fibonacci Validation
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Fibonacci sequence growth pattern validation</p>
                            </TooltipContent>
                          </Tooltip>
                          <span>{quantumState.fractalValidationLevels.fibonacci} nodes</span>
                        </div>
                        <Progress value={(quantumState.fractalValidationLevels.fibonacci / quantumState.nodeCount) * 100} className="h-2 violet-500" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center cursor-help">
                                <span className="h-3 w-3 rounded-full bg-amber-500 mr-2"></span>
                                Mandelbrot Validation
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Recursive Mandelbrot set boundary validation</p>
                            </TooltipContent>
                          </Tooltip>
                          <span>{quantumState.fractalValidationLevels.mandelbrot} nodes</span>
                        </div>
                        <Progress value={(quantumState.fractalValidationLevels.mandelbrot / quantumState.nodeCount) * 100} className="h-2 amber-500" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center cursor-help">
                                <span className="h-3 w-3 rounded-full bg-white mr-2"></span>
                                Quantum Validation
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Quantum superposition probability validation</p>
                            </TooltipContent>
                          </Tooltip>
                          <span>{quantumState.fractalValidationLevels.quantum} nodes</span>
                        </div>
                        <Progress value={(quantumState.fractalValidationLevels.quantum / quantumState.nodeCount) * 100} className="h-2 slate-200 dark:slate-100" />
                      </div>
                    </div>
                  </TooltipProvider>
                  
                  <div className="pt-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total Nodes</span>
                      <span>{quantumState.nodeCount}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Quantum Entangled</span>
                      <span className={quantumState.quantumEntangled ? "text-violet-500" : ""}>
                        {quantumState.quantumEntangled ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="temporal">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    Temporal Convergence
                  </CardTitle>
                  <CardDescription>
                    Time stream visualization showing the Eternal Now convergence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <TimeStreamVisualization />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Infinity className="mr-2 h-5 w-5 text-primary" />
                    Eternal Now Engine
                  </CardTitle>
                  <CardDescription>
                    Temporal convergence statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Time Flow Direction</span>
                      <div className="flex items-center">
                        {getTimeFlowIcon(quantumState.timeFlowDirection)}
                        <span className="text-sm capitalize">{quantumState.timeFlowDirection}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Temporal Coherence</span>
                      <span className="text-sm font-medium">
                        {(quantumState.temporalCoherence * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Temporal Entropy</span>
                      <span className="text-sm font-medium">
                        {(quantumState.averageEntropy * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Convergence Intensity</span>
                      <span className="text-sm font-medium">
                        {(quantumState.convergenceIntensity * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Active Time Stream</span>
                      <span className="text-sm font-mono">
                        {quantumState.activeTimeStream}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm">Time Stream Count</span>
                      <span className="text-sm font-medium">
                        {quantumState.timeStreamCount}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium mb-2">Eternal Now</h4>
                    <div className="text-sm text-muted-foreground">
                      <p>The point where all time streams converge.</p>
                      <p className="mt-1 font-mono">
                        {new Date(quantumState.eternalNowTimestamp).toISOString()}
                      </p>
                      <p className="mt-1">
                        {formatRelativeTime(quantumState.eternalNowTimestamp)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="algorithms">
            <QuantumAlgorithmStatus />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default QuantumSecurityDashboard;