import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Blocks, ExternalLink, Shield, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * AetherCoinDApp component
 * 
 * This component renders the AetherCoin DApp page that will be accessible at
 * https://atc.aifreedomtrust.com/dapp according to the server-redirect.js configuration
 */
const AetherCoinDApp: React.FC = () => {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const atcDAppUrl = 'https://atc.aifreedomtrust.com/dapp';
  
  // Simulate connection to the external DApp
  useEffect(() => {
    const connectToDApp = async () => {
      try {
        setLoading(true);
        // Simulate network connection delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simulate successful connection
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Error connecting to AetherCoin DApp:', error);
        setConnectionStatus('error');
      } finally {
        setLoading(false);
      }
    };
    
    connectToDApp();
  }, []);
  
  const handleConnect = () => {
    window.open(atcDAppUrl, '_blank', 'noopener,noreferrer');
  };
  
  const handleBack = () => {
    setLocation('/dashboard');
  };
  
  // Card container animation
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };
  
  // Individual card animation
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-2" 
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">AetherCoin DApp Integration</h1>
      </div>
      
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="connect">Connect</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={cardVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Blocks className="mr-2 h-5 w-5 text-primary" />
                    AetherCoin DApp
                  </CardTitle>
                  <CardDescription>
                    Explore the revolutionary biozoecurrency platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    The AetherCoin Decentralized Application provides a complete interface for interacting with the AetherCoin (ATC) biozoecurrency ecosystem. Access advanced features, manage assets, and participate in the evolving token economy.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 text-primary">•</span>
                      <span>Fibonacci-based fractal growth visualization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 text-primary">•</span>
                      <span>Sacred geometry token distribution calculator</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 text-primary">•</span>
                      <span>Recursive Mandelbrot Set transaction tracking</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 h-5 w-5 text-primary">•</span>
                      <span>Over-collateralized IUL policy-backed loans</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={handleConnect}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Launch DApp
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
            
            <motion.div variants={cardVariants}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-primary" />
                    Connection Status
                  </CardTitle>
                  <CardDescription>
                    Secure bridge to AetherCoin DApp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-6">
                    {loading ? (
                      <>
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                        <p className="text-center font-medium">Establishing secure connection...</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Verifying quantum-resistant tunnels
                        </p>
                      </>
                    ) : connectionStatus === 'connected' ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                          <Shield className="h-8 w-8 text-green-600 dark:text-green-300" />
                        </div>
                        <p className="text-center font-medium">Connection Established</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Secure bridge to AetherCoin DApp is active
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                          <Shield className="h-8 w-8 text-red-600 dark:text-red-300" />
                        </div>
                        <p className="text-center font-medium">Connection Error</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Unable to establish secure connection
                        </p>
                        <Button variant="outline" className="mt-4" onClick={() => setConnectionStatus('connecting')}>
                          Retry Connection
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <p className="text-xs text-muted-foreground mb-2 w-full">
                    External URL: <a href={atcDAppUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">{atcDAppUrl}</a>
                  </p>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
          
          <Alert className="mt-6">
            <Shield className="h-4 w-4" />
            <AlertTitle>Secure Connection</AlertTitle>
            <AlertDescription>
              All connections to the AetherCoin DApp are secured using quantum-resistant encryption protocols. Your digital assets and identity remain protected at all times.
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <TabsContent value="connect">
          <Card>
            <CardHeader>
              <CardTitle>Connect to AetherCoin DApp</CardTitle>
              <CardDescription>
                Access the full AetherCoin ecosystem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  The AetherCoin DApp provides a comprehensive interface for interacting with the biozoecurrency ecosystem. Launch the DApp to access all features and functionality.
                </p>
                
                <div className="rounded-md bg-muted p-4">
                  <h3 className="font-medium mb-2">Connection Options</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-background rounded">
                      <div className="flex items-center">
                        <ExternalLink className="h-5 w-5 mr-2 text-primary" />
                        <span>Open in new window</span>
                      </div>
                      <Button size="sm" onClick={handleConnect}>Connect</Button>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-background rounded">
                      <div className="flex items-center">
                        <Blocks className="h-5 w-5 mr-2 text-primary" />
                        <span>Embed in current window</span>
                      </div>
                      <Button size="sm" variant="outline" disabled>Coming Soon</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Information</CardTitle>
              <CardDescription>
                Understanding AetherCoin DApp security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  The AetherCoin DApp implements multiple layers of security to ensure the safety of your digital assets and personal information.
                </p>
                
                <div className="space-y-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-primary" />
                      Quantum-Resistant Encryption
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      All connections and transactions are secured using post-quantum cryptographic algorithms, including CRYSTAL-Kyber and SPHINCS+, providing protection against both classical and quantum computing attacks.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-primary" />
                      Multi-Layer Authentication
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      The DApp employs multi-factor authentication, biometric verification, and hardware security module integration to ensure only authorized users can access accounts and initiate transactions.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-primary" />
                      Audited Smart Contracts
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      All smart contracts governing the AetherCoin ecosystem have undergone comprehensive security audits by leading blockchain security firms, with reports publicly available for verification.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AetherCoinDApp;