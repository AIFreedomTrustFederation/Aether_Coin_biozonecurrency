/**
 * MobileDashboard.tsx
 * Mobile-optimized dashboard component for Aetherion platform
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { isMobile } from '@/lib/utils';
import { Wallet, LineChart, Activity, Send, Layers, Lock, Cpu, Settings, RefreshCw } from 'lucide-react';
import mobileFeatures from '@/core/mobile/MobileFeatures';
import biometricAuth from '@/core/mobile/BiometricAuth';
import offlineTransactionSigner from '@/core/mobile/OfflineTransactionSigner';
import { LiveModeIndicator } from '@/components/ui/LiveModeIndicator';
import { useLiveMode } from '@/contexts/LiveModeContext';

// Import from your existing wallet context
import { useWallet } from '@/context/WalletContext';

interface MobileDashboardProps {
  className?: string;
}

/**
 * Mobile-optimized dashboard component
 * Provides a streamlined interface for mobile users with quick access to essential functions
 */
const MobileDashboard: React.FC<MobileDashboardProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const { wallets, balance, transactions } = useWallet();
  const { isLiveMode, toggleLiveMode } = useLiveMode();
  
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [deviceInfo, setDeviceInfo] = useState(mobileFeatures.getDeviceInfo());
  const [offlineMode, setOfflineMode] = useState<boolean>(offlineTransactionSigner.isOfflineMode());
  const [pendingTransactions, setPendingTransactions] = useState(offlineTransactionSigner.getPendingTransactions());
  const [activeWallet, setActiveWallet] = useState<string | null>(null);
  
  // Handle refreshing dashboard data
  const refreshDashboard = async () => {
    setIsRefreshing(true);
    
    // Simulate refreshing data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update pending transactions
    setPendingTransactions(offlineTransactionSigner.getPendingTransactions());
    
    setIsRefreshing(false);
    
    toast({
      title: "Dashboard refreshed",
      description: "Your dashboard data has been updated",
    });
  };
  
  // Toggle offline mode
  const toggleOfflineMode = () => {
    const newMode = !offlineMode;
    setOfflineMode(newMode);
    offlineTransactionSigner.setOfflineMode(newMode);
    
    toast({
      title: newMode ? "Offline mode enabled" : "Offline mode disabled",
      description: newMode 
        ? "Transactions will be signed offline for enhanced security" 
        : "Transactions will be processed online",
    });
  };
  
  // Authenticate with biometrics
  const authenticateWithBiometrics = async () => {
    try {
      if (!biometricAuth.isBiometricAuthAvailable()) {
        toast({
          title: "Biometrics unavailable",
          description: "Your device doesn't support biometric authentication",
          variant: "destructive",
        });
        return;
      }
      
      if (!biometricAuth.hasRegisteredCredentials()) {
        // Register new biometric credentials
        const credential = await biometricAuth.register("user_123");
        
        if (credential) {
          toast({
            title: "Biometrics registered",
            description: "Your biometric credentials have been registered successfully",
          });
        } else {
          toast({
            title: "Registration failed",
            description: "Failed to register biometric credentials",
            variant: "destructive",
          });
        }
        
        return;
      }
      
      // Authenticate with existing credentials
      const authenticated = await biometricAuth.authenticate();
      
      if (authenticated) {
        toast({
          title: "Authentication successful",
          description: "You've been authenticated using biometrics",
        });
      } else {
        toast({
          title: "Authentication failed",
          description: "Biometric authentication failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      toast({
        title: "Authentication error",
        description: "An error occurred during biometric authentication",
        variant: "destructive",
      });
    }
  };
  
  // Submit pending transactions
  const submitPendingTransactions = async () => {
    if (offlineMode) {
      toast({
        title: "Cannot submit transactions",
        description: "Disable offline mode to submit pending transactions",
        variant: "destructive",
      });
      return;
    }
    
    setIsRefreshing(true);
    
    try {
      // This would use your actual transaction submission function
      // For now, we'll simulate it
      const submitFunction = async (tx: any) => {
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));
        return { txHash: `hash_${Math.random().toString(36).substring(2, 15)}` };
      };
      
      const results = await offlineTransactionSigner.submitPendingTransactions(submitFunction);
      
      const successCount = results.filter(r => r.success).length;
      
      toast({
        title: successCount > 0 ? "Transactions submitted" : "No transactions submitted",
        description: `${successCount} of ${results.length} transactions were submitted successfully`,
        variant: successCount > 0 ? "default" : "destructive",
      });
      
      // Update pending transactions
      setPendingTransactions(offlineTransactionSigner.getPendingTransactions());
    } catch (error) {
      console.error('Error submitting transactions:', error);
      toast({
        title: "Submission error",
        description: "An error occurred while submitting transactions",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Initialize dashboard when component mounts
  useEffect(() => {
    if (!isMobile()) {
      console.warn('MobileDashboard component is being rendered on non-mobile device');
    }
    
    // Set first wallet as active if available
    if (wallets && wallets.length > 0 && !activeWallet) {
      setActiveWallet(wallets[0].address);
    }
  }, [wallets, activeWallet]);
  
  // Display a message if not on mobile
  if (!isMobile()) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Mobile Dashboard</CardTitle>
          <CardDescription>This dashboard is optimized for mobile devices</CardDescription>
        </CardHeader>
        <CardContent>
          <p>You are viewing this on a non-mobile device. For the best experience, please access this dashboard from a mobile device.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={`${className} pb-16`}>
      {/* Dashboard header with refresh and offline toggle */}
      <div className="flex items-center justify-between px-4 py-2 bg-background sticky top-0 z-10 border-b">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Aetherion Mobile</h1>
          <LiveModeIndicator variant="badge" className="mt-1" />
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={refreshDashboard} 
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant={offlineMode ? "default" : "outline"} 
            size="sm"
            onClick={toggleOfflineMode}
          >
            {offlineMode ? (
              <><Lock className="h-4 w-4 mr-1" /> Offline</>
            ) : (
              'Online'
            )}
          </Button>
        </div>
      </div>
      
      {/* Wallet summary */}
      <Card className="mx-4 my-4 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Wallet Balance</span>
            {biometricAuth.isBiometricAuthAvailable() && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={authenticateWithBiometrics}
              >
                <Lock className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <div className="text-3xl font-bold">
              {balance ? `${balance} FRC` : '0 FRC'}
            </div>
            <div className="text-xs text-muted-foreground">
              {wallets && wallets.length > 0 ? (
                <>Active wallet: {activeWallet?.substring(0, 8)}...{activeWallet?.substring(activeWallet.length - 6)}</>
              ) : (
                'No wallet connected'
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-0">
          <Button variant="outline" size="sm" className="flex-1 mr-1">
            <Send className="h-4 w-4 mr-1" /> Send
          </Button>
          <Button variant="outline" size="sm" className="flex-1 ml-1">
            <Wallet className="h-4 w-4 mr-1" /> Receive
          </Button>
        </CardFooter>
      </Card>
      
      {/* Main dashboard content */}
      <Tabs defaultValue="activity" className="mx-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="ai-agent">
            <Cpu className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <LineChart className="h-4 w-4" />
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>
        
        {/* Activity tab - shows transactions */}
        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px]">
                <div className="px-4 py-2">
                  {transactions && transactions.length > 0 ? (
                    <div className="space-y-3">
                      {transactions.map((tx: any, index: number) => (
                        <div key={tx.id || index} className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.fromAddress === activeWallet ? 'bg-red-100' : 'bg-green-100'
                            }`}>
                              {tx.fromAddress === activeWallet ? (
                                <Send className="h-4 w-4 text-red-600" />
                              ) : (
                                <Wallet className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium">
                                {tx.fromAddress === activeWallet ? 'Sent' : 'Received'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(tx.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              tx.fromAddress === activeWallet ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {tx.fromAddress === activeWallet ? '-' : '+'}{tx.amount} FRC
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {tx.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No transactions yet</p>
                    </div>
                  )}
                
                  {/* Pending transactions from offline mode */}
                  {pendingTransactions.length > 0 && (
                    <div className="mt-4 pt-2 border-t">
                      <h3 className="text-sm font-semibold mb-2">Pending Offline Transactions</h3>
                      <div className="space-y-3">
                        {pendingTransactions.map((tx: any, index: number) => (
                          <div key={tx.id || index} className="flex items-center justify-between border-b pb-2">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-100">
                                <Layers className="h-4 w-4 text-yellow-600" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium">
                                  Pending Send
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(tx.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-yellow-600">
                                -{tx.amount} FRC
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {tx.signature ? 'Signed' : 'Unsigned'}
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <Button 
                          onClick={submitPendingTransactions} 
                          disabled={offlineMode || isRefreshing}
                          className="w-full mt-2"
                        >
                          Submit Pending Transactions
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* AI Agent tab */}
        <TabsContent value="ai-agent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Agent</CardTitle>
              <CardDescription>Your personal quantum AI assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4 text-center">
                <Cpu className="h-16 w-16 mx-auto mb-4 text-primary" />
                <p className="text-lg font-medium">
                  Quantum Assistant
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Standard Tier
                </p>
                
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <Button variant="outline" size="sm">Chat</Button>
                  <Button variant="outline" size="sm">Tasks</Button>
                  <Button variant="outline" size="sm">Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics tab */}
        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Your portfolio performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Analytics charts will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings tab */}
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mobile Settings</CardTitle>
              <CardDescription>Configure your mobile experience</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Biometric Authentication</p>
                    <p className="text-xs text-muted-foreground">Use fingerprint or face ID to secure your wallet</p>
                  </div>
                  <Button
                    variant={biometricAuth.isBiometricAuthAvailable() ? "default" : "outline"}
                    size="sm"
                    onClick={authenticateWithBiometrics}
                    disabled={!biometricAuth.isBiometricAuthAvailable()}
                  >
                    {biometricAuth.isBiometricAuthAvailable() ? (
                      biometricAuth.hasRegisteredCredentials() ? 'Enabled' : 'Enable'
                    ) : (
                      'Unavailable'
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Offline Transaction Signing</p>
                    <p className="text-xs text-muted-foreground">Sign transactions offline for enhanced security</p>
                  </div>
                  <Button
                    variant={offlineMode ? "default" : "outline"}
                    size="sm"
                    onClick={toggleOfflineMode}
                  >
                    {offlineMode ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive alerts for transactions and security events</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Operating Mode</p>
                    <p className="text-xs text-muted-foreground">
                      {isLiveMode 
                        ? 'Live Mode uses real blockchain transactions via your Web3 wallet' 
                        : 'Test Mode uses simulated blockchain transactions for testing'
                      }
                    </p>
                  </div>
                  <Button
                    variant={isLiveMode ? "default" : "outline"}
                    size="sm"
                    onClick={toggleLiveMode}
                    className="min-w-[100px]"
                  >
                    {isLiveMode ? 'Live Mode' : 'Test Mode'}
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold mb-2">Device Information</h3>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Operating System: {deviceInfo.os}</p>
                    <p>Biometrics: {deviceInfo.features.biometrics ? 'Available' : 'Unavailable'}</p>
                    <p>Push Notifications: {deviceInfo.features.pushNotifications ? 'Supported' : 'Unsupported'}</p>
                    <p>NFC: {deviceInfo.features.nfc ? 'Available' : 'Unavailable'}</p>
                    <p>AR Support: {deviceInfo.features.ar ? 'Available' : 'Unavailable'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Mobile navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="flex justify-center py-1" onClick={toggleLiveMode}>
          <LiveModeIndicator variant="text" className="text-xs cursor-pointer" showToggle={true} />
        </div>
        <div className="flex items-center justify-around p-2">
          <Button variant="ghost" size="icon">
            <Wallet className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Cpu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Activity className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;