import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Globe, Server, Upload, Database, Network } from 'lucide-react';
import DomainHostingPortal from '../components/domain-hosting/DomainHostingPortal';
import DomainHostingForm from '../components/domain-hosting/DomainHostingForm';

export default function DomainHosting() {
  const { isAuthenticated, isTrustMember } = useAuth();
  const [tab, setTab] = useState('register');
  
  // Fetch user's domains if authenticated
  const { data: userDomains } = useQuery({
    queryKey: ['/api/domain-hosting/domains'],
    enabled: isAuthenticated,
  });
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">FractalCoin Web Hosting</h1>
        <p className="text-muted-foreground">
          Host your website on the decentralized FractalCoin Web network with Filecoin integration
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <Globe className="h-5 w-5 text-primary mb-2" />
            <CardTitle className="text-lg">Decentralized Domains</CardTitle>
            <CardDescription>
              Register your .fractalcoin.web domain and host your content on the decentralized web
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <Server className="h-5 w-5 text-primary mb-2" />
            <CardTitle className="text-lg">FractalCoin Storage Network</CardTitle>
            <CardDescription>
              Your content is stored across multiple nodes for improved reliability and performance
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <Network className="h-5 w-5 text-primary mb-2" />
            <CardTitle className="text-lg">Filecoin Integration</CardTitle>
            <CardDescription>
              FractalCoin Web leverages Filecoin's distributed storage for enhanced durability
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                  <span>Quantum-resistant security</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                  <span>Custom domain support</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                  <span>Web3 DNS integration</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                  <span>Decentralized content delivery</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                  <span>Pay with FractalCoin (FCL)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                  <span>Automated backups</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                  <span>Filecoin storage bridge</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                  <span>IPFS compatibility</span>
                </div>
              </div>
              
              {isTrustMember && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setTab('trust-portal')}
                >
                  Access Trust Portal
                </Button>
              )}
            </CardContent>
          </Card>
          
          {isAuthenticated && userDomains && userDomains.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Domains</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {userDomains.map((domain: any) => (
                  <div key={domain.id} className="flex items-center justify-between py-1 border-b last:border-0">
                    <span>{domain.domainName}.fractalcoin.web</span>
                    <Button variant="ghost" size="sm">Manage</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="md:col-span-3">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="register">Register Domain</TabsTrigger>
              <TabsTrigger value="manage">Manage Domains</TabsTrigger>
              {isTrustMember && (
                <TabsTrigger value="trust-portal">Trust Portal</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="register" className="space-y-4">
              <DomainHostingForm />
            </TabsContent>
            
            <TabsContent value="manage" className="space-y-4">
              {isAuthenticated ? (
                userDomains && userDomains.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Your FractalCoin Web Domains</CardTitle>
                      <CardDescription>
                        Manage your domains, deployments, and storage allocations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Domain management UI would go here */}
                        <p className="text-muted-foreground">
                          Domain management interface is under development. Coming soon!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Domains Found</CardTitle>
                      <CardDescription>
                        You don't have any domains registered yet
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Register your first domain to get started with FractalCoin Web hosting.
                      </p>
                      <Button onClick={() => setTab('register')}>
                        Register Domain
                      </Button>
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Authentication Required</CardTitle>
                    <CardDescription>
                      Please log in to manage your domains
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      You need to be authenticated to view and manage your domains.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {isTrustMember && (
              <TabsContent value="trust-portal" className="space-y-4">
                <DomainHostingPortal />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
      
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>How FractalCoin Web Hosting Works</CardTitle>
          <CardDescription>
            A seamless integration between FractalCoin's network and Filecoin storage
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">1. Register Domain</h3>
            <p className="text-sm text-muted-foreground">
              Reserve your .fractalcoin.web domain and choose your hosting plan
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">2. Allocate Storage</h3>
            <p className="text-sm text-muted-foreground">
              Your storage is allocated across the FractalCoin network with Filecoin backup
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-medium">3. Deploy Website</h3>
            <p className="text-sm text-muted-foreground">
              Upload your content and it's instantly distributed across the network
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}