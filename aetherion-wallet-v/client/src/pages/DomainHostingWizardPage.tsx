import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, ChevronRight } from 'lucide-react';
import { DomainHostingWizard } from '../components/domain-hosting/DomainHostingWizard';

export default function DomainHostingWizardPage() {
  const { isAuthenticated, isTrustMember } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>FractalCoin-Filecoin Domain Hosting</CardTitle>
          <CardDescription>Create and deploy websites on the decentralized web</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6">
            <Badge variant="destructive" className="mb-4">Authentication Required</Badge>
            <p className="text-center mb-4">You need to be logged in to use the domain hosting wizard.</p>
            <Button>Login to Continue</Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!isTrustMember) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>FractalCoin-Filecoin Domain Hosting</CardTitle>
          <CardDescription>Create and deploy websites on the decentralized web</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6">
            <Badge variant="destructive" className="mb-4">Access Restricted</Badge>
            <p className="text-center mb-4">You must be a member of the AI Freedom Trust to access this wizard.</p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Trust membership gives you access to decentralized domain hosting and other advanced features.
              </p>
              <Button variant="outline" className="flex items-center mt-2">
                Learn About Membership <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Domain Hosting Wizard</h1>
          <p className="text-muted-foreground">
            Create and deploy your website with the FractalCoin-Filecoin network
          </p>
        </div>
        <Button variant="outline" className="flex items-center">
          <Globe className="mr-2 h-4 w-4" />
          Manage Existing Domains
        </Button>
      </div>
      
      <DomainHostingWizard />
      
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        <p className="mb-2">All domains hosted on the FractalCoin-Filecoin network benefit from:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Quantum-resistant encryption and security</li>
          <li>Decentralized storage across multiple network nodes</li>
          <li>Automatic content delivery optimization</li>
          <li>High availability and resilience against outages</li>
          <li>Complete ownership and control of your data</li>
        </ul>
      </div>
    </div>
  );
}