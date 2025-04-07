import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Database, ArrowRightLeft, CloudCog, HardDrive } from 'lucide-react';

interface FilecoinStorageIntegrationProps {
  allocatedStorage: number; // in MB
  usedStorage: number; // in MB
  nodeCount: number;
  cid?: string;
  status: 'allocating' | 'active' | 'inactive' | 'error';
}

export function FilecoinStorageIntegration({
  allocatedStorage,
  usedStorage,
  nodeCount,
  cid,
  status
}: FilecoinStorageIntegrationProps) {
  // Calculate usage percentage
  const usagePercentage = Math.min(100, Math.round((usedStorage / allocatedStorage) * 100));
  
  // Format storage sizes
  const formatStorage = (size: number) => {
    if (size < 1000) {
      return `${size} MB`;
    } else {
      return `${(size / 1000).toFixed(1)} GB`;
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>FractalCoin-Filecoin Bridge</CardTitle>
            <CardDescription>
              Decentralized storage powered by integrated networks
            </CardDescription>
          </div>
          <div className={`px-2 py-1 text-xs rounded-full ${
            status === 'active' ? 'bg-green-100 text-green-800' :
            status === 'allocating' ? 'bg-blue-100 text-blue-800' :
            status === 'error' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {status === 'active' ? 'Active' :
             status === 'allocating' ? 'Allocating' :
             status === 'error' ? 'Error' : 'Inactive'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Storage Usage */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Storage Usage</span>
              <span>{usedStorage > 0 ? `${usedStorage} MB / ${formatStorage(allocatedStorage)}` : 'No data stored yet'}</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>
          
          {/* Network Map */}
          <div className="py-3">
            <h4 className="text-sm font-medium mb-3">Network Integration</h4>
            <div className="flex items-center justify-between py-2">
              <div className="flex flex-col items-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <HardDrive className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs">FractalCoin</span>
              </div>
              
              <div className="grow flex-1 flex items-center justify-center">
                <div className="w-16 h-[2px] bg-muted"></div>
                <div className="bg-muted rounded-full p-1">
                  <ArrowRightLeft className="h-4 w-4" />
                </div>
                <div className="w-16 h-[2px] bg-muted"></div>
              </div>
              
              <div className="flex flex-col items-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs">Filecoin</span>
              </div>
            </div>
          </div>
          
          {/* Bridge Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-t">
              <span className="text-muted-foreground">Node Count</span>
              <span>{nodeCount}</span>
            </div>
            {cid && (
              <div className="flex justify-between py-1 border-t">
                <span className="text-muted-foreground">Bridge CID</span>
                <span className="font-mono text-xs">{`${cid.substring(0, 10)}...${cid.substring(cid.length - 6)}`}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-t">
              <span className="text-muted-foreground">Data Resilience</span>
              <span>{nodeCount > 3 ? 'High' : nodeCount > 1 ? 'Medium' : 'Low'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}