
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, ArrowRight, Clock, BarChart3, Send, Plus, Download, 
  Shield, Lock, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useZeroTrust } from "@/contexts/ZeroTrustContext";
import { QuantumLoader } from "@/components/ui/quantum-loader";
import { toast } from "sonner";

const transactions = [
  { id: 1, type: "Received", amount: "+2.5 ATC", from: "0x3a8...7b2c", date: "2 hours ago" },
  { id: 2, type: "Staked", amount: "-5.0 ATC", to: "Ecosystem Pool", date: "1 day ago" },
  { id: 3, type: "Sent", amount: "-1.2 ATC", to: "0x7f4...9d3a", date: "3 days ago" },
];

const WalletSection = () => {
  const zeroTrust = useZeroTrust();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [securityStatus, setSecurityStatus] = useState<'initializing' | 'secure' | 'warning' | 'error'>('initializing');
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  
  // Initialize security framework
  useEffect(() => {
    const checkSecurity = async () => {
      try {
        // Wait for the framework to initialize
        if (zeroTrust.isInitializing) {
          return;
        }
        
        if (zeroTrust.isInitialized) {
          setSecurityStatus('secure');
          toast.success("Zero-trust security framework active", {
            description: "Your wallet is protected by AetherSphere security"
          });
        } else {
          setSecurityStatus('warning');
          toast.warning("Security framework initialization delayed", {
            description: "Some security features may be limited"
          });
        }
      } catch (error) {
        console.error("Error initializing security framework:", error);
        setSecurityStatus('error');
        toast.error("Security framework initialization failed", {
          description: "Please try again or contact support"
        });
      }
    };
    
    checkSecurity();
  }, [zeroTrust.isInitialized, zeroTrust.isInitializing]);
  
  // Handle authentication
  const handleAuthenticate = async () => {
    try {
      // In a real implementation, we would collect credentials from a form
      const authResult = await zeroTrust.authenticateUser({
        userId: "demo_user",
        password: "secure_password",
        secondaryFactors: [
          { type: 'totp', value: '123456' }
        ]
      });
      
      if (authResult) {
        toast.success("Authentication successful", {
          description: "Your identity has been verified securely"
        });
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Authentication failed", {
        description: "Please check your credentials and try again"
      });
    }
  };
  
  // Handle sending a transaction
  const handleSendTransaction = async () => {
    if (!zeroTrust.isInitialized) {
      toast.error("Security framework not initialized");
      return;
    }
    
    try {
      // Show processing state
      toast.info("Processing secure transaction...");
      
      // In a real implementation, we would use actual transaction details
      const result = await zeroTrust.signTransaction({
        from: "0x3a8...7b2c",
        to: "0x7f4...9d3a",
        amount: "1.5",
        nonce: 42,
        tokenSymbol: "ATC",
        tokenType: "native"
      });
      
      toast.success("Transaction signed securely", {
        description: "Your transaction is being processed"
      });
    } catch (error) {
      console.error("Transaction error:", error);
      toast.error("Transaction failed", {
        description: "There was an error processing your transaction"
      });
    }
  };
  
  // Security status indicator component
  const SecurityStatusIndicator = () => {
    let icon = <AlertCircle className="h-5 w-5 text-yellow-500" />;
    let statusText = "Initializing Security";
    let statusClass = "bg-yellow-100 text-yellow-800";
    
    if (securityStatus === 'secure') {
      icon = <CheckCircle className="h-5 w-5 text-green-500" />;
      statusText = "AetherSphere Active";
      statusClass = "bg-green-100 text-green-800";
    } else if (securityStatus === 'error') {
      icon = <XCircle className="h-5 w-5 text-red-500" />;
      statusText = "Security Error";
      statusClass = "bg-red-100 text-red-800";
    } else if (securityStatus === 'warning') {
      icon = <AlertCircle className="h-5 w-5 text-yellow-500" />;
      statusText = "Limited Security";
      statusClass = "bg-yellow-100 text-yellow-800";
    }
    
    return (
      <div className="flex items-center space-x-2">
        {icon}
        <span className={`text-xs px-2 py-1 rounded-full ${statusClass}`}>
          {statusText}
        </span>
      </div>
    );
  };
  
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="gradient-text">Aether Wallet</span> Interface
          </h2>
          <p className="text-muted-foreground">
            Manage your <Link to="/tokenomics" className="text-forest-600 hover:underline">Aether Coins</Link> with our 
            intuitive wallet interface. Secure, transparent, and designed for ecosystem participation.
          </p>
          
          {/* AetherSphere Security Badge */}
          <div className="flex items-center justify-center mt-4">
            <div 
              className="flex items-center space-x-2 bg-black bg-opacity-5 rounded-full px-4 py-2 cursor-pointer transition-all hover:bg-opacity-10"
              onClick={() => setShowSecurityInfo(!showSecurityInfo)}
            >
              <Shield className="h-5 w-5 text-forest-600" />
              <span className="text-sm font-medium text-forest-800">Protected by AetherSphere™</span>
              <SecurityStatusIndicator />
            </div>
          </div>
          
          {/* Security Information Panel */}
          {showSecurityInfo && (
            <div className="mt-4 bg-black bg-opacity-5 p-4 rounded-lg text-left max-w-2xl mx-auto">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-forest-600" />
                AetherSphere Zero-Trust Security
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <div className={`h-4 w-4 rounded-full mt-0.5 mr-2 ${zeroTrust.isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div>
                    <p className="font-medium">FractalVault™ Secure Enclave</p>
                    <p className="text-muted-foreground">Isolated cryptographic operations for enhanced security</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className={`h-4 w-4 rounded-full mt-0.5 mr-2 ${zeroTrust.isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div>
                    <p className="font-medium">AetherMesh™ Zero-Trust Network</p>
                    <p className="text-muted-foreground">Encrypted, authenticated communication channels</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className={`h-4 w-4 rounded-full mt-0.5 mr-2 ${zeroTrust.isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div>
                    <p className="font-medium">QuantumGuard™ Identity Verification</p>
                    <p className="text-muted-foreground">Continuous verification & dynamic access control</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className={`h-4 w-4 rounded-full mt-0.5 mr-2 ${zeroTrust.isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <div>
                    <p className="font-medium">BioZoe™ Distributed Secrets</p>
                    <p className="text-muted-foreground">Split cryptographic secrets preventing single point failure</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  disabled={!zeroTrust.isInitialized}
                  onClick={() => setShowSecurityInfo(false)}
                >
                  {zeroTrust.isInitialized ? "Security Active" : "Initializing..."}
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="border-forest-100 overflow-hidden">
            <CardHeader className="bg-forest-50 border-b border-forest-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Aether Wallet</CardTitle>
                  <CardDescription>Your gateway to the ecosystem</CardDescription>
                </div>
                <div className="flex items-center space-x-3">
                  <SecurityStatusIndicator />
                  <Wallet className="h-8 w-8 text-forest-600" />
                </div>
              </div>
            </CardHeader>
            
            <Tabs defaultValue="dashboard" onValueChange={setActiveTab}>
              <div className="px-6 pt-6">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="stake">Staking</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
              </div>
              
              <CardContent className="p-6">
                <TabsContent value="dashboard" className="space-y-6">
                  {/* Authentication Status */}
                  {!zeroTrust.isAuthenticated && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
                        <div>
                          <h4 className="font-medium text-yellow-800">Authentication Required</h4>
                          <p className="text-sm text-yellow-700 mb-3">Please authenticate to access all wallet features</p>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-yellow-400 text-yellow-700 hover:bg-yellow-100"
                            onClick={handleAuthenticate}
                            disabled={!zeroTrust.isInitialized}
                          >
                            Authenticate Securely
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                    <h3 className="text-4xl font-bold text-forest-800">45.28 ATC</h3>
                    <p className="text-sm text-forest-600">≈ $3.29 USD</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      variant="outline" 
                      className="flex-col h-20 border-forest-200"
                      onClick={handleSendTransaction}
                      disabled={!zeroTrust.isInitialized}
                    >
                      <Send className="h-4 w-4 mb-1" />
                      <span>Send</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-20 border-forest-200">
                      <Download className="h-4 w-4 mb-1" />
                      <span>Receive</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-20 border-forest-200">
                      <Plus className="h-4 w-4 mb-1" />
                      <span>Buy</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-20 border-forest-200">
                      <BarChart3 className="h-4 w-4 mb-1" />
                      <span>Stake</span>
                    </Button>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Recent Transactions
                    </h4>
                    <div className="space-y-3">
                      {transactions.slice(0, 2).map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{tx.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {tx.from ? `From: ${tx.from}` : `To: ${tx.to}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${tx.amount.startsWith('+') ? 'text-green-600' : ''}`}>
                              {tx.amount}
                            </p>
                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-2 text-sm h-8">
                      View all transactions
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="transactions" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Transaction History</h3>
                    <div className="border rounded-lg divide-y">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{tx.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {tx.from ? `From: ${tx.from}` : `To: ${tx.to}`}
                            </p>
                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                          </div>
                          <p className={`font-medium ${tx.amount.startsWith('+') ? 'text-green-600' : ''}`}>
                            {tx.amount}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" variant="outline">
                      Load More
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="stake" className="space-y-6">
                  <div className="text-center py-4">
                    <h3 className="text-lg font-medium mb-1">Total Staked</h3>
                    <p className="text-3xl font-bold text-forest-800">12.5 ATC</p>
                    <p className="text-sm text-muted-foreground">Current APY: 8.2%</p>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-medium mb-3">Staking Options</h4>
                    <div className="space-y-3">
                      <div className="bg-background rounded border p-3">
                        <div className="flex justify-between mb-2">
                          <h5 className="font-medium">Ecosystem Pool</h5>
                          <span className="text-sm bg-forest-100 px-2 py-0.5 rounded text-forest-700">8.2% APY</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Stake your tokens to support ecosystem development and earn rewards.
                        </p>
                        <Button size="sm" className="bg-forest-600 hover:bg-forest-700">
                          Stake Now
                        </Button>
                      </div>
                      
                      <div className="bg-background rounded border p-3">
                        <div className="flex justify-between mb-2">
                          <h5 className="font-medium">Conservation Pool</h5>
                          <span className="text-sm bg-forest-100 px-2 py-0.5 rounded text-forest-700">10.5% APY</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Higher rewards for supporting direct conservation efforts.
                        </p>
                        <Button size="sm" className="bg-forest-600 hover:bg-forest-700">
                          Stake Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* New Security Tab Content */}
                <TabsContent value="security" className="space-y-6">
                  <div className="text-center mb-4">
                    {securityStatus === 'initializing' && (
                      <div className="flex flex-col items-center justify-center py-4">
                        <QuantumLoader variant="forest" size="md" />
                        <p className="mt-4 text-sm text-muted-foreground">Initializing AetherSphere Zero-Trust Framework</p>
                      </div>
                    )}
                    
                    {securityStatus === 'secure' && (
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="bg-green-100 p-3 rounded-full mb-3">
                          <Shield className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-medium text-green-800">Zero-Trust Security Active</h3>
                        <p className="text-sm text-muted-foreground mt-1">Your wallet is protected by AetherSphere</p>
                      </div>
                    )}
                    
                    {securityStatus === 'warning' && (
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="bg-yellow-100 p-3 rounded-full mb-3">
                          <AlertCircle className="h-8 w-8 text-yellow-600" />
                        </div>
                        <h3 className="text-xl font-medium text-yellow-800">Limited Security</h3>
                        <p className="text-sm text-muted-foreground mt-1">Some security features are unavailable</p>
                      </div>
                    )}
                    
                    {securityStatus === 'error' && (
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="bg-red-100 p-3 rounded-full mb-3">
                          <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-medium text-red-800">Security Framework Error</h3>
                        <p className="text-sm text-muted-foreground mt-1">Please contact support</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-medium mb-3">AetherSphere Components</h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className={`h-4 w-4 rounded-full mt-0.5 mr-2 ${zeroTrust.isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <div>
                            <p className="font-medium">FractalVault™ Secure Enclave</p>
                            <p className="text-xs text-muted-foreground">Isolated environment for cryptographic operations</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className={`h-4 w-4 rounded-full mt-0.5 mr-2 ${zeroTrust.isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <div>
                            <p className="font-medium">AetherMesh™ Zero-Trust Network</p>
                            <p className="text-xs text-muted-foreground">Secure peer-to-peer communication channels</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className={`h-4 w-4 rounded-full mt-0.5 mr-2 ${zeroTrust.isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <div>
                            <p className="font-medium">QuantumGuard™ Identity Verification</p>
                            <p className="text-xs text-muted-foreground">Multi-factor authentication with continuous verification</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className={`h-4 w-4 rounded-full mt-0.5 mr-2 ${zeroTrust.isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                          <div>
                            <p className="font-medium">BioZoe™ Distributed Secrets</p>
                            <p className="text-xs text-muted-foreground">Shamir's Secret Sharing for distributed key management</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-medium mb-3">Security Actions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          disabled={!zeroTrust.isInitialized}
                          onClick={handleAuthenticate}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          <span>Verify Identity</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          disabled={!zeroTrust.isInitialized}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          <span>Security Settings</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          disabled={!zeroTrust.isInitialized}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <span>Threat Protection</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          disabled={!zeroTrust.isInitialized}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          <span>Backup Keys</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
          
          <div className="mt-8 text-center">
            <Button className="bg-forest-600 hover:bg-forest-700" asChild>
              <Link to="/wallet">
                Access Full Wallet <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WalletSection;
