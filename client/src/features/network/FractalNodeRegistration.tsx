/**
 * FractalNodeRegistration.tsx
 * 
 * This component handles the automatic registration of users as nodes in the
 * FractalCoin distributed network with high-availability fractal sharding.
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Shield, Network, Server, Database, Zap, Wrench } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

// Fractal shard configuration types
interface FractalShard {
  id: string;
  level: number;
  parentId: string | null;
  connectedNodes: number;
  maxNodes: number;
  availability: number; // 0-100
}

interface NodeStatus {
  id: string;
  registered: boolean;
  shardId: string | null;
  fractalLevel: number;
  status: 'connecting' | 'syncing' | 'active' | 'standby' | 'offline';
  syncProgress: number;
  storageContribution: number; // in MB
  computeContribution: number; // relative units
  rewards: number;
  uptime: number; // in seconds
  lastSeen: Date;
}

const FractalNodeRegistration: React.FC = () => {
  const { toast } = useToast();
  const [nodeStatus, setNodeStatus] = useState<NodeStatus | null>(null);
  const [networkShards, setNetworkShards] = useState<FractalShard[]>([]);
  const [registrationStep, setRegistrationStep] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isHAEnabled, setIsHAEnabled] = useState(false);
  
  // Simulate node registration process
  useEffect(() => {
    // Check if already registered
    const checkRegistration = async () => {
      try {
        // In a real implementation, this would check with the backend
        // to see if this wallet is already registered as a node
        
        // For now we'll simulate by checking localStorage
        const existingNodeId = localStorage.getItem('fractalNodeId');
        
        if (existingNodeId) {
          // Get existing node status
          fetchNodeStatus(existingNodeId);
        } else {
          // Not registered yet
          console.log('No existing node registration found');
        }
      } catch (error) {
        console.error('Error checking node registration:', error);
      }
    };
    
    checkRegistration();
    fetchNetworkShards();
    
    // Auto-start registration if query param is set
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autoRegister') === 'true') {
      handleRegisterNode();
    }
  }, []);
  
  // Fetch current network shard information
  const fetchNetworkShards = async () => {
    try {
      // Fetch network shards from our API
      const response = await fetch('/api/fractal-network/shards');
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.shards)) {
        setNetworkShards(data.shards);
      } else {
        // Fallback to mock data if the API call fails or returns unexpected format
        console.warn('API returned unexpected data format, using fallback data');
        const shards: FractalShard[] = [
          { id: 'genesis', level: 0, parentId: null, connectedNodes: 87, maxNodes: 100, availability: 99.99 },
          { id: 'alpha-1', level: 1, parentId: 'genesis', connectedNodes: 64, maxNodes: 75, availability: 99.95 },
          { id: 'beta-1', level: 1, parentId: 'genesis', connectedNodes: 58, maxNodes: 75, availability: 99.94 },
          { id: 'gamma-1', level: 1, parentId: 'genesis', connectedNodes: 52, maxNodes: 75, availability: 99.92 },
          { id: 'alpha-1-1', level: 2, parentId: 'alpha-1', connectedNodes: 42, maxNodes: 50, availability: 99.9 },
          { id: 'alpha-1-2', level: 2, parentId: 'alpha-1', connectedNodes: 21, maxNodes: 50, availability: 99.85 },
          { id: 'beta-1-1', level: 2, parentId: 'beta-1', connectedNodes: 37, maxNodes: 50, availability: 99.88 },
        ];
        
        setNetworkShards(shards);
      }
    } catch (error) {
      console.error('Error fetching network shards:', error);
      toast({
        title: "Network Error",
        description: "Unable to fetch network shard information",
        variant: "destructive",
      });
    }
  };
  
  // Fetch node status
  const fetchNodeStatus = async (nodeId: string) => {
    try {
      // Fetch node status from our API
      const response = await fetch(`/api/fractal-network/nodes/${nodeId}`);
      
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.node) {
        // Convert lastSeen string to Date object if needed
        const nodeData = data.node;
        if (typeof nodeData.lastSeen === 'string') {
          nodeData.lastSeen = new Date(nodeData.lastSeen);
        }
        
        setNodeStatus(nodeData);
      } else {
        // Fallback to mock data if the API call fails or returns unexpected format
        console.warn('API returned unexpected data format, using fallback data');
        
        // Create a fallback status
        const status: NodeStatus = {
          id: nodeId,
          registered: true,
          shardId: 'alpha-1-2',
          fractalLevel: 2,
          status: 'active',
          syncProgress: 100,
          storageContribution: 512, // 512 MB
          computeContribution: 8,
          rewards: 213.75,
          uptime: 3 * 24 * 60 * 60, // 3 days in seconds
          lastSeen: new Date()
        };
        
        setNodeStatus(status);
      }
    } catch (error) {
      console.error('Error fetching node status:', error);
      toast({
        title: "Network Error",
        description: "Unable to fetch node status information",
        variant: "destructive",
      });
    }
  };
  
  // Handle node registration
  const handleRegisterNode = async () => {
    if (isRegistering) return;
    
    setIsRegistering(true);
    setRegistrationStep(1);
    
    try {
      // Step 1: Generate node identity
      await simulateStep(1000); // Shorter wait for better UX
      setRegistrationStep(2);
      toast({
        title: "Node identity created",
        description: "Your unique fractal node identity has been generated",
      });
      
      // Step 2: Find optimal shard placement using fractal algorithm
      const optimalShard = getOptimalShard();
      await simulateStep(1000); // Shorter wait for better UX
      setRegistrationStep(3);
      toast({
        title: "Optimal shard located",
        description: `Found the best fractal shard: ${optimalShard?.id || 'Unknown'}`,
      });
      
      // Step 3: Register with the network and set up high availability
      // Create registration payload
      const registrationData = {
        nodeType: 'hybrid', // Default to hybrid node type
        highAvailability: true, // Enable high availability by default
        resources: {
          storageCapacity: 512, // Default storage contribution (MB)
          computeUnits: 8, // Default compute contribution
          bandwidth: 25, // Default bandwidth contribution (Mbps)
          reliability: 0.95 // Default reliability score (0-1)
        },
        ownerWalletAddress: localStorage.getItem('walletAddress') || 'unknown'
      };
      
      // Register node with network
      const response = await fetch('/api/fractal-network/nodes/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });
      
      if (!response.ok) {
        throw new Error(`Network registration failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Node registration failed');
      }
      
      setRegistrationStep(4);
      setIsHAEnabled(true);
      toast({
        title: "Node registered successfully",
        description: "Your node is now part of the FractalCoin network",
      });
      
      // We should have a nodeId from the registration response
      const nodeId = data.nodeId || `node-${Math.random().toString(36).substring(2, 10)}`;
      
      // Store the node ID
      localStorage.setItem('fractalNodeId', nodeId);
      
      // Step 4: Begin initial sync
      await simulateStep(1500); // Shorter wait for better UX
      setRegistrationStep(5);
      
      // Update node status to syncing
      await fetch(`/api/fractal-network/nodes/${nodeId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'syncing',
          syncProgress: 50
        }),
      });
      
      toast({
        title: "Initial sync in progress",
        description: "Your node is synchronizing with the network",
      });
      
      // Step 5: Activate node for the network
      await simulateStep(1500); // Shorter wait for better UX
      setRegistrationStep(6);
      
      // Update node status to active
      await fetch(`/api/fractal-network/nodes/${nodeId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'active',
          syncProgress: 100
        }),
      });
      
      // Fetch the new node status with all details
      fetchNodeStatus(nodeId);
      
      toast({
        title: "Node activation complete",
        description: "Your node is active and earning rewards in the network",
        variant: "default",
      });
    } catch (error) {
      console.error('Error registering node:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred while registering your node",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };
  
  // Simulate an async operation
  const simulateStep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  // Get the optimal shard for this node
  const getOptimalShard = () => {
    // In a real implementation, this would run the fractal allocation algorithm
    // to find the optimal shard placement based on network conditions
    
    // For simplicity, we'll find the shard with the most space available
    if (networkShards.length === 0) return null;
    
    return networkShards.reduce((best, current) => {
      const bestSpace = best.maxNodes - best.connectedNodes;
      const currentSpace = current.maxNodes - current.connectedNodes;
      return currentSpace > bestSpace ? current : best;
    });
  };
  
  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  };
  
  // Enable high availability mode
  const enableHighAvailability = async () => {
    try {
      const nodeId = localStorage.getItem('fractalNodeId');
      
      if (!nodeId) {
        throw new Error('No node ID found, cannot enable high availability');
      }
      
      // Call the API to enable high availability
      const response = await fetch(`/api/fractal-network/nodes/${nodeId}/high-availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: true
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to enable high availability: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to enable high availability');
      }
      
      // Update local state
      setIsHAEnabled(true);
      
      // Refetch node status to get updated information
      fetchNodeStatus(nodeId);
      
      toast({
        title: "High Availability Enabled",
        description: "Your node will now participate in the fractal redundancy network",
      });
    } catch (error) {
      console.error('Error enabling high availability:', error);
      toast({
        title: "Failed to Enable High Availability",
        description: error instanceof Error ? error.message : "An error occurred while enabling high availability",
        variant: "destructive",
      });
    }
  };
  
  // Render registration steps
  const renderRegistrationSteps = () => {
    const steps = [
      { name: "Generate Identity", icon: <Shield className="h-4 w-4" /> },
      { name: "Find Optimal Shard", icon: <Database className="h-4 w-4" /> },
      { name: "Register with Network", icon: <Network className="h-4 w-4" /> },
      { name: "Initial Sync", icon: <Zap className="h-4 w-4" /> },
      { name: "Activate Node", icon: <Server className="h-4 w-4" /> },
    ];
    
    return (
      <div className="flex justify-between relative mb-8">
        <div className="absolute h-1 bg-muted top-4 left-0 right-0 z-0"></div>
        {steps.map((step, index) => (
          <div key={index} className="z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ 
                scale: index < registrationStep ? 1 : 0.8,
                opacity: index < registrationStep ? 1 : 0.5,
                backgroundColor: index < registrationStep ? 'var(--primary)' : 'var(--muted)'
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center mb-2"
            >
              {index < registrationStep ? (
                <svg className="h-4 w-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className="text-muted-foreground">{step.icon}</div>
              )}
            </motion.div>
            <span className="text-xs text-muted-foreground">{step.name}</span>
          </div>
        ))}
      </div>
    );
  };
  
  // Render the optimal shard card
  const renderOptimalShardCard = () => {
    const optimalShard = getOptimalShard();
    if (!optimalShard) return null;
    
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Recommended Shard Placement</CardTitle>
          <CardDescription>Fractal allocation algorithm suggestion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{optimalShard.id}</div>
              <div className="text-sm text-muted-foreground">Level {optimalShard.level} Shard</div>
            </div>
            <div className="text-right">
              <div className="font-medium">{optimalShard.connectedNodes}/{optimalShard.maxNodes} Nodes</div>
              <div className="text-sm text-muted-foreground">{optimalShard.availability}% Uptime</div>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Capacity</span>
              <span>{Math.round((optimalShard.connectedNodes / optimalShard.maxNodes) * 100)}%</span>
            </div>
            <Progress value={(optimalShard.connectedNodes / optimalShard.maxNodes) * 100} className="h-1" />
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Render active node status
  const renderNodeStatus = () => {
    if (!nodeStatus) return null;
    
    const shard = networkShards.find(s => s.id === nodeStatus.shardId) || null;
    
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium">Node Status</CardTitle>
            <CardDescription>Your FractalCoin Network Node</CardDescription>
          </div>
          <Badge 
            variant={nodeStatus.status === 'active' ? 'default' : 'outline'}
            className="capitalize"
          >
            {nodeStatus.status}
          </Badge>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Node ID</div>
              <div className="font-mono text-xs truncate">{nodeStatus.id}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Shard</div>
              <div className="font-medium">{nodeStatus.shardId} (L{nodeStatus.fractalLevel})</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Uptime</div>
              <div className="font-medium">{formatUptime(nodeStatus.uptime)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Rewards Earned</div>
              <div className="font-medium">{nodeStatus.rewards.toFixed(2)} FRC</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Storage Contributed</div>
              <div className="font-medium">{nodeStatus.storageContribution} MB</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Compute Units</div>
              <div className="font-medium">{nodeStatus.computeContribution} CU</div>
            </div>
          </div>
          
          {!isHAEnabled && (
            <Button 
              variant="outline" 
              className="mt-4 w-full"
              onClick={enableHighAvailability}
            >
              <Wrench className="h-4 w-4 mr-2" />
              Enable High Availability
            </Button>
          )}
          
          {isHAEnabled && (
            <div className="mt-4 p-2 bg-muted/30 rounded-lg">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <div className="text-xs font-medium">High Availability Mode Active</div>
              </div>
              <div className="text-xs text-muted-foreground mt-1 pl-4">
                Your node is part of the fractal redundancy network
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">FractalCoin Network Node</h2>
        <p className="text-sm text-muted-foreground">
          Participate in the FractalCoin network as a high-availability node
        </p>
      </div>
      
      {nodeStatus ? (
        renderNodeStatus()
      ) : (
        <>
          {renderOptimalShardCard()}
          
          {registrationStep > 0 && renderRegistrationSteps()}
          
          <Button 
            onClick={handleRegisterNode} 
            disabled={isRegistering}
            className="w-full"
          >
            {isRegistering ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering Node...
              </>
            ) : (
              <>
                <Server className="mr-2 h-4 w-4" />
                Register as Network Node
              </>
            )}
          </Button>
          
          <div className="text-xs text-muted-foreground mt-2">
            By registering as a node, you'll contribute to the network and earn FractalCoin rewards
          </div>
        </>
      )}
    </div>
  );
};

export default FractalNodeRegistration;