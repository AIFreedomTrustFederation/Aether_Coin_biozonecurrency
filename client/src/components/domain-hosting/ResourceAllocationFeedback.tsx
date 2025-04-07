import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Server, Database, Cloud, Zap, HardDrive } from 'lucide-react';

interface ResourceAllocationFeedbackProps {
  domainId: number;
  onAllocate: () => void;
}

export function ResourceAllocationFeedback({ domainId, onAllocate }: ResourceAllocationFeedbackProps) {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isAllocating, setIsAllocating] = useState(false);
  const [nodeAllocation, setNodeAllocation] = useState<Array<{ id: number; status: 'pending' | 'allocated' | 'failed' }>>([
    { id: 1, status: 'pending' },
    { id: 2, status: 'pending' },
    { id: 3, status: 'pending' },
  ]);
  
  const startAllocation = () => {
    setIsAllocating(true);
    
    // Simulate resource allocation process
    setTimeout(() => {
      setStep(2);
      setProgress(20);
      
      // Simulate node 1 allocation
      setTimeout(() => {
        setNodeAllocation(prev => prev.map(node => 
          node.id === 1 ? { ...node, status: 'allocated' } : node
        ));
        setProgress(40);
        
        // Simulate node 2 allocation
        setTimeout(() => {
          setNodeAllocation(prev => prev.map(node => 
            node.id === 2 ? { ...node, status: 'allocated' } : node
          ));
          setProgress(70);
          
          // Simulate node 3 allocation
          setTimeout(() => {
            setNodeAllocation(prev => prev.map(node => 
              node.id === 3 ? { ...node, status: 'allocated' } : node
            ));
            setProgress(100);
            
            setTimeout(() => {
              setStep(3);
              setIsAllocating(false);
            }, 500);
          }, 1500);
        }, 1200);
      }, 1000);
    }, 800);
  };
  
  const handleComplete = () => {
    onAllocate();
  };
  
  return (
    <div className="space-y-6">
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Resource Allocation</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                    <HardDrive className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Storage Nodes</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Distributed storage across the network
                  </p>
                  <Badge variant="outline">3 Nodes</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Compute Resources</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Processing power for your application
                  </p>
                  <Badge variant="outline">1.0 vCPUs</Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                    <Cloud className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">Network</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Hybrid FractalCoin-Filecoin network
                  </p>
                  <Badge variant="outline">CDN Enabled</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Button 
            onClick={startAllocation} 
            className="w-full mt-4"
            disabled={isAllocating}
          >
            {isAllocating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting Allocation...
              </>
            ) : 'Allocate Resources'}
          </Button>
        </div>
      )}
      
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Allocating Resources</h3>
          </div>
          
          <Progress value={progress} className="h-2 mb-6" />
          
          <div className="space-y-3">
            {nodeAllocation.map(node => (
              <div key={node.id} className="flex items-center justify-between border rounded-md p-3">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Node {node.id}</p>
                    <p className="text-xs text-muted-foreground">Fractal-File Node</p>
                  </div>
                </div>
                <div>
                  {node.status === 'pending' && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Pending</span>
                    </Badge>
                  )}
                  {node.status === 'allocated' && (
                    <Badge variant="outline" className="bg-green-100 text-green-700 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      <span>Allocated</span>
                    </Badge>
                  )}
                  {node.status === 'failed' && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <span>Failed</span>
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-muted p-3 rounded-md text-sm">
            <p>Allocating resources across the FractalCoin-Filecoin network. This may take a few moments.</p>
          </div>
        </div>
      )}
      
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-medium">Resources Allocated Successfully</h3>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 p-4 rounded-md">
            <div className="flex items-start">
              <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-300">Resource Allocation Complete</h4>
                <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                  All resources have been successfully allocated to domain #{domainId}.
                </p>
                <div className="mt-3 space-y-1 text-sm text-green-700 dark:text-green-400">
                  <p>• 3 storage nodes allocated</p>
                  <p>• 1.0 vCPUs provisioned</p>
                  <p>• Network and CDN configured</p>
                  <p>• Quantum-secure data encryption enabled</p>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleComplete} 
            className="w-full mt-4"
          >
            Continue to Next Step
          </Button>
        </div>
      )}
    </div>
  );
}