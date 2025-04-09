import React, { useState } from 'react';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Key, Shield, Database } from 'lucide-react';
import { Link } from 'wouter';

export default function ApiKeyPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">API Key Management</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex gap-2 items-center">
            <Database className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex gap-2 items-center">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="security" className="flex gap-2 items-center">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>FractalCoin API Overview</CardTitle>
              <CardDescription>
                Access the power of FractalCoin APIs to build integrations and applications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API Keys
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Create and manage API keys to access FractalCoin services securely.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4" 
                    onClick={() => setActiveTab('api-keys')}
                  >
                    Manage Keys
                  </Button>
                </div>
                
                <div className="p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Review active connections and ensure your API access is secure.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4" 
                    onClick={() => setActiveTab('security')}
                  >
                    Review Security
                  </Button>
                </div>
                
                <div className="p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Documentation
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    Access comprehensive API documentation and integration guides.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4" 
                    onClick={() => {
                      window.open('/api-docs', '_blank');
                      toast({
                        title: "API Documentation",
                        description: "Opening API documentation in a new tab."
                      });
                    }}
                  >
                    View Docs
                  </Button>
                </div>
              </div>
              
              <div className="p-6 border rounded-lg shadow-sm mt-6">
                <h3 className="text-xl font-semibold mb-4">Getting Started</h3>
                <ol className="list-decimal space-y-3 ml-6">
                  <li>
                    <strong>Create an API Key</strong> - Navigate to the API Keys tab and create a new key
                  </li>
                  <li>
                    <strong>Choose appropriate scopes</strong> - Select the permissions your application needs
                  </li>
                  <li>
                    <strong>Integrate with your application</strong> - Use the API key in your HTTP requests with the header <code className="bg-muted px-1 py-0.5 rounded">X-API-Key: YOUR_API_KEY</code>
                  </li>
                  <li>
                    <strong>Monitor usage</strong> - Keep track of your API usage and active connections
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api-keys" className="mt-6">
          <ApiKeyManager />
        </TabsContent>
        
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>API Security</CardTitle>
              <CardDescription>
                Review and manage security settings for your API access.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold">API Request Limits</h3>
                  <p className="text-muted-foreground mt-2">
                    FractalCoin API implements rate limiting to ensure fair usage and system stability.
                  </p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-md">
                      <h4 className="font-medium">Default Rate Limits</h4>
                      <ul className="mt-2 space-y-1">
                        <li>• 100 requests per minute per API key</li>
                        <li>• 5,000 requests per hour per API key</li>
                        <li>• 100,000 requests per day per API key</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-md">
                      <h4 className="font-medium">Enhanced Rate Limits</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Available for enterprise accounts and approved partners.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => {
                          toast({
                            title: "Enterprise API Access",
                            description: "Contact us to discuss enterprise API access and enhanced rate limits.",
                          });
                        }}
                      >
                        Contact Us
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 border rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold">Best Practices</h3>
                  <div className="mt-4 space-y-4">
                    <div className="p-4 border rounded-md">
                      <h4 className="font-medium">Secure Your Keys</h4>
                      <p className="text-muted-foreground mt-1">
                        Never embed API keys directly in client-side code. Use backend services to proxy requests.
                      </p>
                    </div>
                    <div className="p-4 border rounded-md">
                      <h4 className="font-medium">Use Specific Scopes</h4>
                      <p className="text-muted-foreground mt-1">
                        Always use the minimum required scopes for your API keys to enhance security.
                      </p>
                    </div>
                    <div className="p-4 border rounded-md">
                      <h4 className="font-medium">Rotate Keys Regularly</h4>
                      <p className="text-muted-foreground mt-1">
                        We recommend rotating your API keys every 90 days or immediately if compromised.
                      </p>
                    </div>
                    <div className="p-4 border rounded-md">
                      <h4 className="font-medium">Monitor Usage</h4>
                      <p className="text-muted-foreground mt-1">
                        Regularly check your API key usage and connections to detect unauthorized access.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Security Audit",
                    description: "Security audit feature coming soon.",
                  });
                }}
              >
                Request Security Audit
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}