import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, Globe, Database, Server, HardDrive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '../../context/AuthContext';

interface DomainAnalytics {
  totalDomains: number;
  totalStorage: number;
  totalDeployments: number;
  domains: DomainStat[];
}

interface DomainStat {
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
}

export default function DomainHostingPortal() {
  const { toast } = useToast();
  const [tab, setTab] = useState('overview');
  const { isAuthenticated, isTrustMember } = useAuth();
  
  // Fetch domain analytics from the API
  const { data: analytics, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/domain-hosting/analytics'],
    enabled: isAuthenticated && isTrustMember,
    retry: 1
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load domain hosting analytics. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Format bytes to human-readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!isAuthenticated || !isTrustMember) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Domain Hosting Portal</CardTitle>
          <CardDescription>Monitor and manage FractalCoin Web domain hosting</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6">
            <Badge variant="destructive" className="mb-4">Access Restricted</Badge>
            <p>You must be a member of the AI Freedom Trust to access this portal.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Domain Hosting Portal</CardTitle>
          <CardDescription>Loading domain hosting analytics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const data: DomainAnalytics = analytics || {
    totalDomains: 0,
    totalStorage: 0,
    totalDeployments: 0,
    domains: []
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>FractalCoin Web Domain Hosting</CardTitle>
            <CardDescription>Manage domains, storage allocations, and deployments</CardDescription>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Refresh Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="deployments">Deployments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Domains</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="text-2xl font-bold">{data.totalDomains}</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Database className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="text-2xl font-bold">{formatBytes(data.totalStorage)}</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Deployments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Upload className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="text-2xl font-bold">{data.totalDeployments}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Storage Distribution</h3>
              <div className="space-y-2">
                {data.domains.map(domain => (
                  <div key={domain.domainId} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{domain.domainName}</span>
                      <span>{formatBytes(domain.storage.total)}</span>
                    </div>
                    <Progress value={
                      data.totalStorage > 0 
                        ? (domain.storage.total / data.totalStorage) * 100 
                        : 0
                    } className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="domains">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead>Node Count</TableHead>
                  <TableHead>Deployments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.domains.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No domains found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.domains.map(domain => (
                    <TableRow key={domain.domainId}>
                      <TableCell className="font-medium">{domain.domainName}</TableCell>
                      <TableCell>
                        <Badge variant={
                          domain.domainType === 'premium' ? 'default' :
                          domain.domainType === 'enterprise' ? 'secondary' : 'outline'
                        }>
                          {domain.domainType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={domain.status === 'active' ? 'success' : 'destructive'}>
                          {domain.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatBytes(domain.storage.total)}</TableCell>
                      <TableCell>{domain.storage.nodeCount}</TableCell>
                      <TableCell>{domain.deployments.count}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="storage">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Storage Allocations by Node Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">FractalCoin Nodes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Server className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="text-2xl font-bold">
                        {/* Calculate total nodes across all domains */}
                        {data.domains.reduce((sum, domain) => sum + domain.storage.nodeCount, 0)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Cost (FCL)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <HardDrive className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="text-2xl font-bold">
                        {/* Calculate total cost across all domains */}
                        {data.domains.reduce((sum, domain) => sum + domain.storage.cost, 0).toFixed(4)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Cost per GB</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {data.totalStorage > 0 ? 
                        (data.domains.reduce((sum, domain) => sum + domain.storage.cost, 0) / 
                        (data.totalStorage / (1024 * 1024 * 1024))).toFixed(4) : 
                        '0.0000'} FCL
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-4">Storage Allocation Details</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Storage</TableHead>
                  <TableHead>Nodes</TableHead>
                  <TableHead>Cost (FCL)</TableHead>
                  <TableHead>Cost per GB</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.domains.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No storage allocations found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.domains.map(domain => (
                    <TableRow key={domain.domainId}>
                      <TableCell className="font-medium">{domain.domainName}</TableCell>
                      <TableCell>{formatBytes(domain.storage.total)}</TableCell>
                      <TableCell>{domain.storage.nodeCount}</TableCell>
                      <TableCell>{domain.storage.cost.toFixed(4)}</TableCell>
                      <TableCell>
                        {domain.storage.total > 0 ? 
                          (domain.storage.cost / (domain.storage.total / (1024 * 1024 * 1024))).toFixed(4) : 
                          '0.0000'} FCL
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="deployments">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deployment Count</TableHead>
                  <TableHead>Latest Deployment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.domains.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No deployments found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.domains.map(domain => (
                    <TableRow key={domain.domainId}>
                      <TableCell className="font-medium">{domain.domainName}</TableCell>
                      <TableCell>
                        <Badge variant={domain.status === 'active' ? 'success' : 'destructive'}>
                          {domain.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{domain.deployments.count}</TableCell>
                      <TableCell>
                        {domain.deployments.latest ? 
                          formatDate(domain.deployments.latest.deploymentDate) : 
                          'No deployments'}
                      </TableCell>
                      <TableCell>
                        {domain.deployments.latest && (
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}