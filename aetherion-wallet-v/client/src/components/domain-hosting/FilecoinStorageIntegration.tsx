import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Cloud, Database, HardDrive, Server } from 'lucide-react';

interface FilecoinStorageIntegrationProps {
  allocatedStorage: number;
  usedStorage: number;
  nodeCount: number;
  status: 'allocating' | 'active' | 'error';
}

export function FilecoinStorageIntegration({
  allocatedStorage,
  usedStorage,
  nodeCount,
  status
}: FilecoinStorageIntegrationProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'allocating':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const getStatusLabel = () => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'allocating':
        return 'Allocating';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };
  
  const storageUsagePercent = usedStorage ? Math.min(100, Math.max(0, (usedStorage / allocatedStorage) * 100)) : 0;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-base font-medium mb-2">Storage Network Distribution</h3>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-2">
                <div className="p-4 flex flex-col items-center text-center bg-primary/5 border-r">
                  <HardDrive className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-medium">FractalCoin</h4>
                  <p className="text-xs text-muted-foreground mb-1">Primary Network</p>
                  <Badge variant="secondary">Hot Storage</Badge>
                </div>
                <div className="p-4 flex flex-col items-center text-center">
                  <Database className="h-8 w-8 text-primary mb-2" />
                  <h4 className="font-medium">Filecoin</h4>
                  <p className="text-xs text-muted-foreground mb-1">Secondary Network</p>
                  <Badge variant="secondary">Cold Storage</Badge>
                </div>
              </div>
              
              <div className="px-4 pb-4">
                <div className="h-2 mt-4 flex rounded-full overflow-hidden">
                  <div 
                    className="bg-primary"
                    style={{ width: '60%' }}
                  ></div>
                  <div 
                    className="bg-blue-500"
                    style={{ width: '40%' }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <div>FractalCoin: 60%</div>
                  <div>Filecoin: 40%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <h3 className="text-base font-medium mb-2">Storage Usage</h3>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium">{formatStorage(allocatedStorage)}</h4>
                  <p className="text-xs text-muted-foreground">Total Allocated</p>
                </div>
                <Badge className={getStatusColor()}>
                  {getStatusLabel()}
                </Badge>
              </div>
              
              <Progress value={storageUsagePercent} className="h-2 mb-1" />
              
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <div>Used: {formatStorage(usedStorage)}</div>
                <div>Free: {formatStorage(allocatedStorage - usedStorage)}</div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{nodeCount} Storage Nodes</span>
                </div>
                <div className="text-xs px-2 py-1 rounded-full bg-muted">
                  Redundancy: {nodeCount > 3 ? 'High' : nodeCount > 1 ? 'Medium' : 'Low'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="text-base font-medium mb-3">FractalCoin-Filecoin Bridge</h3>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Cloud className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Hybrid Storage Model</h4>
              <p className="text-sm text-muted-foreground">
                Your content is intelligently distributed across both networks
              </p>
            </div>
          </div>
          
          <div className="rounded-md bg-muted p-3 text-sm">
            <p>FractalCoin provides fast, quantum-secured access while Filecoin ensures long-term archival storage. Frequently accessed content stays on FractalCoin nodes, while less accessed data is automatically moved to Filecoin for cost efficiency.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="border rounded-md p-3">
              <h4 className="text-sm font-medium mb-1">Advantages</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Optimized performance</li>
                <li>• Lower storage costs</li>
                <li>• Automatic content distribution</li>
                <li>• Multi-layer redundancy</li>
              </ul>
            </div>
            <div className="border rounded-md p-3">
              <h4 className="text-sm font-medium mb-1">Features</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Content-aware caching</li>
                <li>• Automatic data migration</li>
                <li>• Quantum-secured encryption</li>
                <li>• Network acceleration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatStorage(bytes: number): string {
  if (bytes < 1000) {
    return `${bytes} MB`;
  } else {
    return `${(bytes / 1000).toFixed(1)} GB`;
  }
}