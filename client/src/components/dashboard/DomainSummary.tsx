import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../context/AuthContext';
import { Globe, Server, Database, ExternalLink } from 'lucide-react';

interface DomainAnalytics {
  totalDomains: number;
  totalStorage: number;
  totalDeployments: number;
  domains: {
    domainId: number;
    domainName: string;
    domainType: string;
    status: string;
    storage: {
      total: number;
      nodeCount: number;
      cost: number;
    };
    deployments: {
      count: number;
      latest: any;
    };
  }[];
}

// Helper function to format bytes
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const DomainSummary: React.FC = () => {
  const { isAuthenticated, isTrustMember } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/domain-hosting/domains'],
    enabled: isAuthenticated,
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/domain-hosting/analytics'],
    enabled: isAuthenticated && isTrustMember,
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

  // Handle the case when no domains exist or user is not authenticated
  if (!isAuthenticated || !data || (Array.isArray(data) && data.length === 0)) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Globe className="h-5 w-5 mr-2 text-primary" />
            Domain Hosting
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-muted-foreground">No domains registered yet.</p>
        </CardContent>
        <CardFooter className="pt-0">
          <Link href="/domain-hosting-wizard">
            <Button variant="outline" size="sm" className="mt-2 w-full">
              Register Your First Domain
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // For trust members, show analytics data
  if (isTrustMember && analytics) {
    const analyticData = analytics as DomainAnalytics;
    
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Globe className="h-5 w-5 mr-2 text-primary" />
            FractalCoin Web Network
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Domains</p>
              <p className="text-lg font-semibold">{analyticData.totalDomains}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Storage</p>
              <p className="text-lg font-semibold">{formatBytes(analyticData.totalStorage)}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Deployments</p>
              <p className="text-lg font-semibold">{analyticData.totalDeployments}</p>
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            {analyticData.domains.slice(0, 2).map(domain => (
              <div key={domain.domainId} className="flex justify-between items-center text-sm border-b pb-2">
                <div className="flex items-center">
                  <Badge variant={domain.status === 'active' ? 'outline' : 'secondary'} className="mr-2">
                    {domain.domainType}
                  </Badge>
                  <span className="truncate max-w-[120px]">{domain.domainName}</span>
                </div>
                <div className="flex items-center text-muted-foreground text-xs">
                  <Server className="h-3 w-3 mr-1" />
                  <span>{domain.storage.nodeCount} nodes</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-1">
          <Link href="/domain-hosting">
            <Button variant="ghost" size="sm" className="w-full flex items-center justify-center">
              <span>Manage Domains</span>
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // For regular users, show their domains
  const domains = Array.isArray(data) ? data : [];
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Globe className="h-5 w-5 mr-2 text-primary" />
          Your Domains
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          {domains.slice(0, 3).map((domain: any) => (
            <div key={domain.id} className="flex justify-between items-center text-sm border-b pb-2">
              <div>
                <span className="font-medium">{domain.domainName}</span>
                <Badge variant={domain.status === 'active' ? 'outline' : 'secondary'} className="ml-2">
                  {domain.status}
                </Badge>
              </div>
              <div className="text-muted-foreground text-xs">
                {formatBytes(domain.storageSize)}
              </div>
            </div>
          ))}
        </div>
        
        {domains.length === 0 && (
          <p className="text-muted-foreground text-center py-2">No domains registered yet.</p>
        )}
      </CardContent>
      <CardFooter className="pt-1">
        <Link href="/domain-hosting">
          <Button variant="ghost" size="sm" className="w-full flex items-center justify-center">
            <span>{domains.length > 0 ? 'Manage Domains' : 'Register Domain'}</span>
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default DomainSummary;