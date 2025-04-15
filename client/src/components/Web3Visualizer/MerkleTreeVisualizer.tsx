import React, { useState, useEffect } from "react";
import { GitBranch, Server, Cloud, Database, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

/**
 * MerkleTreeVisualizer Component
 * 
 * Visualizes how FractalCoin's Merkle Tree structure enables decentralized VPS hosting
 * and SaaS service delivery with verifiable integrity and scaling properties.
 */
const MerkleTreeVisualizer: React.FC = () => {
  const [treeDepth, setTreeDepth] = useState(3);
  const [nodeCount, setNodeCount] = useState(7);
  const [activeServices, setActiveServices] = useState<string[]>([]);
  const [showResourceAllocation, setShowResourceAllocation] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  
  // Update node count when tree depth changes
  useEffect(() => {
    // In a perfect binary tree, node count = 2^depth - 1
    setNodeCount(Math.pow(2, treeDepth) - 1);
  }, [treeDepth]);
  
  // Available services that can be deployed on the decentralized infrastructure
  const availableServices = [
    { id: "vps", name: "Virtual Private Servers", icon: <Server className="h-4 w-4" /> },
    { id: "db", name: "Distributed Databases", icon: <Database className="h-4 w-4" /> },
    { id: "storage", name: "Decentralized Storage", icon: <HardDrive className="h-4 w-4" /> },
    { id: "saas", name: "SaaS Applications", icon: <Cloud className="h-4 w-4" /> }
  ];
  
  // Toggle a service
  const toggleService = (serviceId: string) => {
    setActiveServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };
  
  // Simulate scaling up the network
  const scaleNetwork = () => {
    setIsScaling(true);
    
    // Animate the scaling
    const initialDepth = treeDepth;
    const targetDepth = initialDepth + 2;
    let currentDepth = initialDepth;
    
    const interval = setInterval(() => {
      currentDepth += 0.5;
      setTreeDepth(Math.floor(currentDepth));
      
      if (currentDepth >= targetDepth) {
        clearInterval(interval);
        setIsScaling(false);
      }
    }, 500);
    
    return () => clearInterval(interval);
  };
  
  // Calculate performance metrics based on tree size
  const calculateMetrics = () => {
    const totalNodes = nodeCount;
    const storageCapacity = Math.round(totalNodes * 50); // GB
    const computeUnits = Math.round(totalNodes * 2.5); // vCPUs
    const verificationTime = Math.max(0.1, Math.log2(totalNodes) * 0.05).toFixed(2); // seconds
    const faultTolerance = Math.min(99.9999, 99 + (Math.log2(totalNodes) * 0.2)).toFixed(4); // percentage
    
    return { storageCapacity, computeUnits, verificationTime, faultTolerance };
  };
  
  const metrics = calculateMetrics();
  
  // Generate the tree for visualization
  const generateTreeNodes = () => {
    // For simplicity, we'll create a perfect binary tree
    const depth = treeDepth;
    const nodes = [];
    const maxNodesInRow = Math.pow(2, depth - 1);
    
    for (let level = 0; level < depth; level++) {
      const nodesInLevel = Math.pow(2, level);
      const rowNodes = [];
      
      for (let i = 0; i < nodesInLevel; i++) {
        const nodeId = Math.pow(2, level) - 1 + i;
        
        // Determine if this node hosts any of the active services
        // We'll distribute services evenly across available nodes
        const hostedServices = activeServices.filter(
          serviceId => nodeId % availableServices.length === availableServices.findIndex(s => s.id === serviceId)
        );
        
        rowNodes.push({
          id: nodeId,
          level,
          services: hostedServices,
          isResourceNode: level === depth - 1 // Leaf nodes are resource providers
        });
      }
      
      nodes.push(rowNodes);
    }
    
    return nodes;
  };
  
  const treeNodes = generateTreeNodes();

  return (
    <div className="w-full flex flex-col items-center p-4">
      <div className="space-y-6 w-full max-w-4xl">
        <h3 className="text-lg font-medium text-center">FractalCoin Node Merkle Tree</h3>
        <p className="text-sm text-center text-muted-foreground mb-4">
          Visualize how Merkle Trees enable decentralized VPS hosting and SaaS services with verifiable integrity
        </p>
        
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Network Size</span>
                <span className="text-sm">{nodeCount} nodes</span>
              </div>
              <Slider 
                value={[treeDepth]} 
                min={2} 
                max={6} 
                step={1} 
                onValueChange={(values) => setTreeDepth(values[0])}
                disabled={isScaling}
                className="my-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Small Network</span>
                <span>Large Network</span>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-2">Active Services</div>
              <div className="flex flex-wrap gap-2">
                {availableServices.map(service => (
                  <Badge 
                    key={service.id}
                    variant={activeServices.includes(service.id) ? "default" : "outline"}
                    className="cursor-pointer flex items-center gap-1"
                    onClick={() => toggleService(service.id)}
                  >
                    {service.icon}
                    <span>{service.name}</span>
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowResourceAllocation(!showResourceAllocation)}
              >
                {showResourceAllocation ? "Hide Resources" : "Show Resources"}
              </Button>
              
              <Button 
                size="sm"
                onClick={scaleNetwork}
                disabled={isScaling || treeDepth >= 6}
              >
                {isScaling ? "Scaling..." : "Scale Network"}
              </Button>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <GitBranch className="h-4 w-4 mr-2" />
              <h4 className="text-sm font-medium">Performance Metrics</h4>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Storage Capacity:</span>
                <span>{metrics.storageCapacity} GB</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Compute Resources:</span>
                <span>{metrics.computeUnits} vCPUs</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Verification Time:</span>
                <span>{metrics.verificationTime} seconds</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fault Tolerance:</span>
                <span>{metrics.faultTolerance}%</span>
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Merkle trees provide O(log n) verification time, making resource allocation efficient and secure even as the network grows.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tree Visualization */}
        <div className="border rounded-lg p-4 overflow-auto">
          <div className="min-h-[300px] w-full">
            {treeNodes.map((level, levelIndex) => (
              <div 
                key={levelIndex} 
                className="flex justify-center items-center relative"
                style={{ 
                  marginBottom: "30px",
                  height: "60px"
                }}
              >
                {level.map(node => {
                  const hasServices = node.services.length > 0;
                  
                  return (
                    <div 
                      key={node.id} 
                      className={`
                        relative flex items-center justify-center
                        ${node.isResourceNode ? 'w-16 h-16' : 'w-12 h-12'}
                        ${hasServices ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-100 dark:bg-gray-800'}
                        ${node.isResourceNode ? 'rounded-lg' : 'rounded-full'}
                        border ${hasServices ? 'border-blue-300 dark:border-blue-700' : 'border-gray-300 dark:border-gray-600'}
                        ${node.isResourceNode && showResourceAllocation ? 'ring-2 ring-green-500' : ''}
                        z-10 transition-all
                      `}
                      style={{
                        margin: `0 ${Math.pow(2, treeDepth - node.level - 1) * 10}px`
                      }}
                    >
                      {/* Node ID */}
                      <div className="text-xs font-medium">{node.id + 1}</div>
                      
                      {/* Service indicators */}
                      {hasServices && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                          {node.services.length}
                        </div>
                      )}
                      
                      {/* Resource allocation indicators */}
                      {node.isResourceNode && showResourceAllocation && (
                        <div className="absolute -bottom-6 left-0 right-0 text-center">
                          <div className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                            {5 + Math.floor(Math.random() * 15)} vCPUs
                          </div>
                        </div>
                      )}
                      
                      {/* Connecting lines to children */}
                      {!node.isResourceNode && (
                        <>
                          {/* Left child connection */}
                          <div 
                            className="absolute bg-gray-300 dark:bg-gray-600"
                            style={{
                              width: `${Math.pow(2, treeDepth - node.level - 1) * 10}px`,
                              height: '1px',
                              top: '50%',
                              left: '100%',
                            }}
                          />
                          
                          {/* Right child connection */}
                          <div 
                            className="absolute bg-gray-300 dark:bg-gray-600"
                            style={{
                              width: `${Math.pow(2, treeDepth - node.level - 1) * 10}px`,
                              height: '1px',
                              top: '50%',
                              right: '100%',
                            }}
                          />
                          
                          {/* Vertical connection down */}
                          <div 
                            className="absolute bg-gray-300 dark:bg-gray-600"
                            style={{
                              width: '1px',
                              height: '30px',
                              top: '50%',
                              left: '50%',
                            }}
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        
        {/* Explanation */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">How It Works</h4>
          <div className="text-sm space-y-2 text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Merkle Trees for Resource Verification:</span> FractalCoin uses Merkle trees to organize network nodes, enabling efficient verification of resource allocation.
            </p>
            <p>
              <span className="font-medium text-foreground">Distributed VPS Hosting:</span> Computing resources are distributed across leaf nodes, with each node contributing processing power, storage, and memory to the network.
            </p>
            <p>
              <span className="font-medium text-foreground">SaaS Service Delivery:</span> Applications deployed on the network benefit from distributed resources while maintaining integrity through cryptographic verification.
            </p>
            <p>
              <span className="font-medium text-foreground">Efficient Scaling:</span> As the tree grows, verification remains logarithmic (O(log n)), allowing the network to scale efficiently while maintaining security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerkleTreeVisualizer;