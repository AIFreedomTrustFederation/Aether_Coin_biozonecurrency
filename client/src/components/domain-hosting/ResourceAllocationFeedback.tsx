import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, RefreshCw, Database, Server, Cpu, HardDrive } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ResourceAllocationFeedbackProps {
  domainId: number;
  onAllocate?: (resources: ResourceAllocation) => void;
}

interface ResourceAllocation {
  storage: number; // in MB
  compute: number; // in vCPUs
  enableAutoscaling: boolean;
  network: 'fractalcoin' | 'filecoin' | 'hybrid';
  redundancyLevel: 'low' | 'medium' | 'high';
}

export function ResourceAllocationFeedback({ domainId, onAllocate }: ResourceAllocationFeedbackProps) {
  const [allocation, setAllocation] = useState<ResourceAllocation>({
    storage: 100,
    compute: 1,
    enableAutoscaling: true,
    network: 'hybrid',
    redundancyLevel: 'medium'
  });
  
  const [isAllocating, setIsAllocating] = useState(false);
  
  const handleAllocate = () => {
    setIsAllocating(true);
    // Simulate allocation process
    setTimeout(() => {
      setIsAllocating(false);
      if (onAllocate) {
        onAllocate(allocation);
      }
    }, 2000);
  };
  
  const formatStorage = (value: number) => {
    if (value < 1000) {
      return `${value} MB`;
    } else {
      return `${(value / 1000).toFixed(1)} GB`;
    }
  };
  
  const calculateFCLCost = () => {
    // Simple cost model
    const storageCost = allocation.storage * 0.005; // 0.005 FCL per MB
    const computeCost = allocation.compute * 2; // 2 FCL per vCPU
    const redundancyMultiplier = 
      allocation.redundancyLevel === 'high' ? 1.5 : 
      allocation.redundancyLevel === 'medium' ? 1.2 : 1.0;
    
    return (storageCost + computeCost) * redundancyMultiplier;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <RefreshCw className="h-5 w-5 mr-2" />
          Two-Way Resource Feedback Loop
        </CardTitle>
        <CardDescription>
          Allocate and optimize compute and storage resources across networks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="allocate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="allocate">Allocate Resources</TabsTrigger>
            <TabsTrigger value="monitor">Monitor Usage</TabsTrigger>
          </TabsList>
          
          <TabsContent value="allocate" className="space-y-4 pt-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Storage Allocation: {formatStorage(allocation.storage)}</Label>
                  <Badge variant="outline">{allocation.network === 'filecoin' ? 'Filecoin' : allocation.network === 'fractalcoin' ? 'FractalCoin' : 'Hybrid Storage'}</Badge>
                </div>
                <Slider
                  min={50}
                  max={10000}
                  step={50}
                  value={[allocation.storage]}
                  onValueChange={(value) => setAllocation({...allocation, storage: value[0]})}
                />
                <p className="text-xs text-muted-foreground">Minimum 50MB, Maximum 10GB</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Compute Resources: {allocation.compute} vCPU{allocation.compute > 1 ? 's' : ''}</Label>
                </div>
                <Slider
                  min={0.5}
                  max={8}
                  step={0.5}
                  value={[allocation.compute]}
                  onValueChange={(value) => setAllocation({...allocation, compute: value[0]})}
                />
                <p className="text-xs text-muted-foreground">Minimum 0.5 vCPU, Maximum 8 vCPUs</p>
              </div>
              
              <div className="space-y-3">
                <Label>Network Configuration</Label>
                <Select 
                  value={allocation.network}
                  onValueChange={(value: 'fractalcoin' | 'filecoin' | 'hybrid') => 
                    setAllocation({...allocation, network: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fractalcoin">FractalCoin Network</SelectItem>
                    <SelectItem value="filecoin">Filecoin Network</SelectItem>
                    <SelectItem value="hybrid">Hybrid (Recommended)</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select 
                  value={allocation.redundancyLevel}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setAllocation({...allocation, redundancyLevel: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select redundancy level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Redundancy</SelectItem>
                    <SelectItem value="medium">Medium Redundancy (Recommended)</SelectItem>
                    <SelectItem value="high">High Redundancy</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center justify-between space-x-2 pt-2">
                  <Label htmlFor="autoscaling">Enable Dynamic Scaling</Label>
                  <Switch
                    id="autoscaling"
                    checked={allocation.enableAutoscaling}
                    onCheckedChange={(checked) => 
                      setAllocation({...allocation, enableAutoscaling: checked})
                    }
                  />
                </div>
              </div>
              
              <div className="pt-4 space-y-2">
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="text-sm">Estimated Monthly Cost:</span>
                  <span className="font-semibold">{calculateFCLCost().toFixed(4)} FCL</span>
                </div>
                
                <div className="rounded-md bg-primary/5 p-3 text-sm">
                  <div className="flex items-start mb-2">
                    <div className="flex-shrink-0 w-6 h-6 mr-2 flex items-center justify-center">
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                    <p>
                      Resources will be automatically balanced between FractalCoin and Filecoin networks for optimal performance and cost efficiency.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="monitor" className="pt-4">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-md p-3 text-center">
                  <HardDrive className="h-8 w-8 mx-auto mb-2 text-primary/70" />
                  <div className="text-2xl font-semibold">{formatStorage(allocation.storage)}</div>
                  <p className="text-xs text-muted-foreground">Total Storage</p>
                </div>
                <div className="border rounded-md p-3 text-center">
                  <Cpu className="h-8 w-8 mx-auto mb-2 text-primary/70" />
                  <div className="text-2xl font-semibold">{allocation.compute} vCPU</div>
                  <p className="text-xs text-muted-foreground">Compute Resources</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Network Distribution</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-24 font-medium text-sm">FractalCoin</div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{width: `${allocation.network === 'fractalcoin' ? 100 : allocation.network === 'hybrid' ? 60 : 20}%`}}
                      />
                    </div>
                    <div className="w-12 text-right text-sm ml-2">
                      {allocation.network === 'fractalcoin' ? '100%' : allocation.network === 'hybrid' ? '60%' : '20%'}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 font-medium text-sm">Filecoin</div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{width: `${allocation.network === 'filecoin' ? 100 : allocation.network === 'hybrid' ? 40 : 0}%`}}
                      />
                    </div>
                    <div className="w-12 text-right text-sm ml-2">
                      {allocation.network === 'filecoin' ? '100%' : allocation.network === 'hybrid' ? '40%' : '0%'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <h4 className="text-sm font-medium">Resource Metrics</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between py-1 border-t">
                    <span className="text-muted-foreground">Bridge Status</span>
                    <Badge variant="outline" className="font-normal bg-green-50 text-green-700 hover:bg-green-50">Active</Badge>
                  </div>
                  <div className="flex justify-between py-1 border-t">
                    <span className="text-muted-foreground">Data Replication</span>
                    <span>
                      {allocation.redundancyLevel === 'high' ? '3x' : allocation.redundancyLevel === 'medium' ? '2x' : '1x'} 
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-t">
                    <span className="text-muted-foreground">Node Count</span>
                    <span>
                      {allocation.redundancyLevel === 'high' ? 5 : allocation.redundancyLevel === 'medium' ? 3 : 1}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-t">
                    <span className="text-muted-foreground">Auto-Scaling</span>
                    <span>{allocation.enableAutoscaling ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button 
          onClick={handleAllocate} 
          className="w-full" 
          disabled={isAllocating}
        >
          {isAllocating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Allocating Resources...
            </>
          ) : 'Apply Resource Configuration'}
        </Button>
      </CardFooter>
    </Card>
  );
}