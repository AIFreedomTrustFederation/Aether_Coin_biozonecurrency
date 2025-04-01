import { useQuery } from '@tanstack/react-query';
import { fetchAiMonitoringLogs } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Shield, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { timeAgo } from '@/lib/utils';

const AIMonitoring = () => {
  const { data: aiLogs, isLoading, error } = useQuery({
    queryKey: ['/api/ai/logs'],
    queryFn: () => fetchAiMonitoringLogs(5)
  });

  // Render loading state
  if (isLoading) {
    return (
      <Card className="lg:col-span-1">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">AI Monitoring</h3>
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
            <h3 className="font-bold text-foreground">AI Monitoring</h3>
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
          <h3 className="font-bold text-foreground">AI Monitoring</h3>
          <div className="flex items-center">
            <div className="relative w-2 h-2 mr-1">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full relative"></div>
            </div>
            <span className="text-xs text-green-500">Active</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm text-foreground mb-2">Security Status</div>
          <div className="flex items-center justify-between bg-background rounded-lg p-3">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-foreground">All systems secure</span>
            </div>
            <span className="text-xs text-muted-foreground">Updated 2m ago</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm text-foreground mb-2">Recent AI Actions</div>
          <div className="space-y-3">
            {aiLogs?.slice(0, 2).map((log) => (
              <div key={log.id} className="flex items-start bg-background rounded-lg p-3">
                {log.severity === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                ) : log.severity === 'critical' ? (
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                ) : (
                  <Shield className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                )}
                <div>
                  <div className="text-sm text-foreground">
                    {log.action === 'threat_detected' ? 'Suspicious contract detected' :
                     log.action === 'gas_optimization' ? 'Gas optimization applied' :
                     'Transaction verified'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{log.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-foreground mb-2">Security Analysis</div>
          <div className="bg-background rounded-lg p-3">
            <div className="mb-2 flex justify-between items-center">
              <div className="text-xs text-foreground">Quantum Resistance</div>
              <div className="text-xs text-green-500">Strong</div>
            </div>
            <Progress value={95} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIMonitoring;
