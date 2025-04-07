import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { Network, Shield, Cpu, Activity, Users, ExternalLink } from 'lucide-react';

interface NetworkHealthData {
  blockHeight: number;
  nodes: number;
  transactions: number;
  validators: number;
  uptime: number;
  trustMembers: number;
  status: 'healthy' | 'warning' | 'critical';
  latestUpdate: string;
}

// Sample data for demonstration
const sampleNetworkData: NetworkHealthData = {
  blockHeight: 1254693,
  nodes: 427,
  transactions: 42819,
  validators: 32,
  uptime: 99.98,
  trustMembers: 12,
  status: 'healthy',
  latestUpdate: new Date().toISOString()
};

const NetworkStatus: React.FC = () => {
  const { isTrustMember } = useAuth();
  
  // In a real app, this would be a real API call
  const { data, isLoading } = useQuery({
    queryKey: ['/api/network/status'],
    queryFn: () => new Promise(resolve => setTimeout(() => resolve(sampleNetworkData), 800)),
    initialData: sampleNetworkData,
    refetchInterval: 60000, // Refresh every minute
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-4 w-24 mb-2 mt-1" />
          <Skeleton className="h-8 w-36 mb-2" />
          <Skeleton className="h-4 w-32 mt-3" />
        </CardContent>
      </Card>
    );
  }
  
  const networkData = data as NetworkHealthData;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Network className="h-5 w-5 mr-2 text-primary" />
          Network Status
          <div className={`ml-auto h-3 w-3 rounded-full ${
            networkData.status === 'healthy' ? 'bg-green-500' : 
            networkData.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
          }`}></div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center">
            <div className="flex flex-col items-center">
              <Cpu className="h-4 w-4 text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Nodes</p>
              <p className="text-base font-semibold">{networkData.nodes}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="flex flex-col items-center">
              <Activity className="h-4 w-4 text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Uptime</p>
              <p className="text-base font-semibold">{networkData.uptime}%</p>
            </div>
          </div>
          <div className="text-center">
            <div className="flex flex-col items-center">
              <Shield className="h-4 w-4 text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Validators</p>
              <p className="text-base font-semibold">{networkData.validators}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-sm">
          <div className="flex justify-between mb-1">
            <span className="text-muted-foreground">Block Height:</span>
            <span className="font-medium">{networkData.blockHeight.toLocaleString()}</span>
          </div>
          
          {isTrustMember && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trust Members:</span>
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1 text-primary" />
                <span className="font-medium">{networkData.trustMembers}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Link href={isTrustMember ? "/trust/portal" : "/network-details"}>
          <Button variant="ghost" size="sm" className="w-full flex items-center justify-center">
            <span>{isTrustMember ? "Trust Portal" : "Network Details"}</span>
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default NetworkStatus;