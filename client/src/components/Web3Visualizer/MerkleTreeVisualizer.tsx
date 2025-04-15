import React from "react";
import { GitBranch, Server, Cloud, Database, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * MerkleTreeVisualizer Component
 * 
 * Visualizes how FractalCoin's Merkle Tree structure enables decentralized VPS hosting
 * and SaaS service delivery with verifiable integrity and scaling properties.
 */
const MerkleTreeVisualizer: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center p-4">
      <div className="space-y-6 w-full max-w-4xl">
        <h3 className="text-lg font-medium text-center">FractalCoin Node Merkle Tree</h3>
        <p className="text-sm text-center text-muted-foreground mb-4">
          Visualize how Merkle Trees enable decentralized VPS hosting and SaaS services with verifiable integrity
        </p>
        
        {/* Simple static visualization */}
        <div className="border rounded-lg p-4">
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <GitBranch className="h-16 w-16 mx-auto mb-4 text-forest-500" />
              <h4 className="text-lg font-medium mb-2">FractalCoin Node Network</h4>
              <p className="text-sm text-muted-foreground max-w-md">
                The FractalCoin node network uses a Merkle Tree structure to organize distributed computing resources,
                enabling efficient verification and secure service deployment.
              </p>
              
              <div className="flex gap-2 mt-6 justify-center">
                <div className="flex items-center gap-1 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                  <Server className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium">VPS Services</span>
                </div>
                <div className="flex items-center gap-1 p-2 bg-green-50 dark:bg-green-900/30 rounded-md">
                  <Database className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-medium">Storage</span>
                </div>
                <div className="flex items-center gap-1 p-2 bg-purple-50 dark:bg-purple-900/30 rounded-md">
                  <Cloud className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-medium">SaaS Apps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Performance metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <GitBranch className="h-4 w-4 mr-2" />
              <h4 className="text-sm font-medium">Network Performance</h4>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Storage Capacity:</span>
                <span>350 GB</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Compute Resources:</span>
                <span>17 vCPUs</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Verification Time:</span>
                <span>0.14 seconds</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fault Tolerance:</span>
                <span>99.8112%</span>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Server className="h-4 w-4 mr-2" />
              <h4 className="text-sm font-medium">Resource Allocation</h4>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active Nodes:</span>
                <span>7</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Services Deployed:</span>
                <span>4</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Merkle Tree Depth:</span>
                <span>3 levels</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Verification Complexity:</span>
                <span>O(log n)</span>
              </div>
            </div>
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