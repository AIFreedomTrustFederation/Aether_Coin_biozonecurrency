import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAiMonitoringLogs, createAiMonitoringLog } from '@/lib/api';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { AlertTriangle, Shield, Zap, Lock, Layers, Cpu, Eye, RotateCw, Lightbulb } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { timeAgo } from '@/lib/utils';

const AIMonitoring = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('real-time');
  const [simulateInProgress, setSimulateInProgress] = useState(false);
  
  const { data: aiLogs, isLoading, error } = useQuery({
    queryKey: ['/api/ai/logs'],
    queryFn: () => fetchAiMonitoringLogs(5)
  });
  
  // Security metrics with animation
  const [securityMetrics, setSecurityMetrics] = useState({
    quantumResistance: { value: 95, trend: 'stable' },
    smartContractAudit: { value: 88, trend: 'increasing' },
    transactionVerification: { value: 100, trend: 'stable' },
    fractalIntegrity: { value: 92, trend: 'increasing' }
  });
  
  // Animate security metrics every 30 seconds
  useEffect(() => {
    const updateMetrics = () => {
      setSecurityMetrics(prev => ({
        quantumResistance: { 
          value: Math.min(100, prev.quantumResistance.value + (Math.random() > 0.7 ? 1 : 0)), 
          trend: prev.quantumResistance.value >= 95 ? 'stable' : 'increasing' 
        },
        smartContractAudit: { 
          value: Math.min(100, Math.max(80, prev.smartContractAudit.value + (Math.random() > 0.5 ? 1 : -1))), 
          trend: Math.random() > 0.5 ? 'increasing' : 'stable' 
        },
        transactionVerification: { 
          value: 100, 
          trend: 'stable' 
        },
        fractalIntegrity: { 
          value: Math.min(100, Math.max(85, prev.fractalIntegrity.value + (Math.random() > 0.6 ? 1 : -1))), 
          trend: Math.random() > 0.3 ? 'increasing' : 'stable' 
        }
      }));
    };
    
    const intervalId = setInterval(updateMetrics, 30000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Mutation for creating a new AI log
  const createLogMutation = useMutation({
    mutationFn: (logData: any) => createAiMonitoringLog(logData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/logs'] });
      toast({
        title: "AI Alert Generated",
        description: "New monitoring alert has been created and verified",
      });
      setSimulateInProgress(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create AI log: ${(error as Error).message}`,
        variant: "destructive",
      });
      setSimulateInProgress(false);
    }
  });
  
  // Function to simulate AI detection
  const simulateAIDetection = () => {
    setSimulateInProgress(true);
    
    // Random log types for demo
    const actions = ['threat_detected', 'transaction_verified', 'gas_optimization'];
    const severities = ['info', 'warning', 'critical'];
    const descriptions = [
      'Suspicious smart contract call with elevated permissions detected',
      'Cross-chain transaction verified with quantum resistance',
      'Gas optimization applied to recurring contract interactions',
      'Potential phishing attempt blocked from external contract',
      'Fractal integrity check passed with enhanced verification'
    ];
    
    const action = actions[Math.floor(Math.random() * actions.length)] as 'threat_detected' | 'transaction_verified' | 'gas_optimization';
    const severity = action === 'threat_detected' ? 
      (Math.random() > 0.7 ? 'critical' : 'warning') : 
      'info';
    
    // Simulate processing delay for realism
    setTimeout(() => {
      createLogMutation.mutate({
        userId: 1,
        action,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        severity,
        timestamp: new Date(),
        relatedEntityId: Math.floor(Math.random() * 5) + 1,
        relatedEntityType: action === 'threat_detected' ? 'contract' : 
                          action === 'transaction_verified' ? 'transaction' : 'wallet'
      });
    }, 1500);
  };
  
  // Helper function to get icon based on trend
  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <Zap className="w-3 h-3 text-green-500" />;
    if (trend === 'decreasing') return <AlertTriangle className="w-3 h-3 text-amber-500" />;
    return null;
  };
  
  // Helper function to get color based on security level
  const getSecurityColor = (value: number) => {
    if (value >= 90) return 'text-green-500';
    if (value >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className="lg:col-span-1">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Quantum AI Monitoring</h3>
            <Skeleton className="h-4 w-16" />
          </div>
          
          <div className="mb-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-16 w-full mb-2" />
          </div>
          
          <div className="mb-4">
            <Skeleton className="h-4 w-32 mb-2" />
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="lg:col-span-1">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Quantum AI Monitoring</h3>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
              <span className="text-xs text-red-500">Error</span>
            </div>
          </div>
          
          <div className="p-4 text-destructive text-sm">
            Failed to load AI monitoring data: {(error as Error).message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-1">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Quantum AI Monitoring</h3>
          <div className="flex items-center">
            <div className="relative w-2 h-2 mr-1">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full relative"></div>
            </div>
            <span className="text-xs text-green-500">Active</span>
          </div>
        </div>
        
        <Tabs defaultValue="real-time" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="real-time">Real-Time</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="real-time" className="mt-0">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-foreground">System Status</div>
                <Badge variant="outline" className="text-xs bg-background">
                  <Cpu className="w-3 h-3 mr-1" /> AI Active
                </Badge>
              </div>
              <div className="flex items-center justify-between bg-background rounded-lg p-3">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-foreground">All systems secure</span>
                </div>
                <span className="text-xs text-muted-foreground">Updated {timeAgo(new Date())}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-foreground mb-2">Recent AI Actions</div>
              <div className="space-y-3">
                <AnimatePresence>
                  {aiLogs?.slice(0, 3).map((log, index) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start bg-background rounded-lg p-3"
                    >
                      {log.severity === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                      ) : log.severity === 'critical' ? (
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                      ) : (
                        <Shield className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      )}
                      <div>
                        <div className="text-sm text-foreground flex items-center">
                          {log.action === 'threat_detected' ? 'Suspicious activity detected' :
                           log.action === 'gas_optimization' ? 'Gas optimization applied' :
                           'Transaction verified'}
                          <Badge 
                            variant="outline" 
                            className={`ml-2 text-xs ${
                              log.severity === 'critical' ? 'bg-red-500/10 text-red-500' : 
                              log.severity === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
                              'bg-green-500/10 text-green-500'
                            }`}
                          >
                            {log.severity}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{log.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {timeAgo(log.timestamp)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            
            <Button 
              onClick={simulateAIDetection} 
              variant="outline" 
              size="sm" 
              className="w-full"
              disabled={simulateInProgress || createLogMutation.isPending}
            >
              {simulateInProgress || createLogMutation.isPending ? (
                <>
                  <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                  Running AI Detection...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Run AI Detection Cycle
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="security" className="mt-0 space-y-4">
            <div>
              <div className="text-sm text-foreground mb-2">Quantum Resistance</div>
              <div className="bg-background rounded-lg p-3">
                <div className="mb-2 flex justify-between items-center">
                  <div className="text-xs flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Cryptographic Security</span>
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${getSecurityColor(securityMetrics.quantumResistance.value)}`}>
                    {securityMetrics.quantumResistance.value}%
                    {getTrendIcon(securityMetrics.quantumResistance.trend)}
                  </div>
                </div>
                <Progress value={securityMetrics.quantumResistance.value} className="h-1.5" />
              </div>
            </div>
            
            <div>
              <div className="text-sm text-foreground mb-2">Smart Contract Audit</div>
              <div className="bg-background rounded-lg p-3">
                <div className="mb-2 flex justify-between items-center">
                  <div className="text-xs flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>Automated Analysis</span>
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${getSecurityColor(securityMetrics.smartContractAudit.value)}`}>
                    {securityMetrics.smartContractAudit.value}%
                    {getTrendIcon(securityMetrics.smartContractAudit.trend)}
                  </div>
                </div>
                <Progress value={securityMetrics.smartContractAudit.value} className="h-1.5" />
              </div>
            </div>
            
            <div>
              <div className="text-sm text-foreground mb-2">Transaction Verification</div>
              <div className="bg-background rounded-lg p-3">
                <div className="mb-2 flex justify-between items-center">
                  <div className="text-xs flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Cross-Chain Security</span>
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${getSecurityColor(securityMetrics.transactionVerification.value)}`}>
                    {securityMetrics.transactionVerification.value}%
                    {getTrendIcon(securityMetrics.transactionVerification.trend)}
                  </div>
                </div>
                <Progress value={securityMetrics.transactionVerification.value} className="h-1.5" />
              </div>
            </div>
            
            <div>
              <div className="text-sm text-foreground mb-2">Fractal Integrity</div>
              <div className="bg-background rounded-lg p-3">
                <div className="mb-2 flex justify-between items-center">
                  <div className="text-xs flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>Recursive CID Structures</span>
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${getSecurityColor(securityMetrics.fractalIntegrity.value)}`}>
                    {securityMetrics.fractalIntegrity.value}%
                    {getTrendIcon(securityMetrics.fractalIntegrity.trend)}
                  </div>
                </div>
                <Progress value={securityMetrics.fractalIntegrity.value} className="h-1.5" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIMonitoring;
