/**
 * AetherCore.trust Demo Page
 * 
 * This page demonstrates the HTTQS protocol and hosting capabilities
 * of the FractalCoin node storage system. It allows users to deploy
 * and manage the AetherCore.trust website.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Shield, Server, Code, FileCode, RefreshCw, CheckCircle, Clock, Lock, Upload, Download, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fractalNodeHostingService, WebsiteContent, HostingStatus } from '../../services/hosting/fractalNodeHostingService';
import { HTTPQSVerificationStatus } from '../../services/protocols/httqsProtocol';
import { QuantumEncryptionAlgorithm } from '../../types/quantum';

const DOMAIN_NAME = "www.AetherCore.trust";

const AetherCoreTrust: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [websiteData, setWebsiteData] = useState<{content: WebsiteContent, status: HostingStatus} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<HTTPQSVerificationStatus | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [htmlContent, setHtmlContent] = useState(DEFAULT_HTML_CONTENT);
  const [cssContent, setCssContent] = useState(DEFAULT_CSS_CONTENT);
  const [jsContent, setJsContent] = useState(DEFAULT_JS_CONTENT);
  const [encryptionAlgorithm, setEncryptionAlgorithm] = useState<QuantumEncryptionAlgorithm>('hybrid');
  const [shardCount, setShardCount] = useState(128);
  
  useEffect(() => {
    loadWebsiteData();
  }, []);
  
  const loadWebsiteData = async () => {
    setIsLoading(true);
    try {
      // Get website data if it exists
      const data = fractalNodeHostingService.getWebsite(DOMAIN_NAME);
      setWebsiteData(data ? { content: data.content, status: data.status } : null);
    } catch (error) {
      console.error('Error loading website data:', error);
      toast({
        title: "Error",
        description: "Failed to load website data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      const websiteContent: WebsiteContent = {
        html: htmlContent,
        css: cssContent,
        js: jsContent,
        assets: {},
        metadata: {
          title: 'AetherCore.trust - Quantum Secure Web3 Platform',
          description: 'Official webpage for the AetherCore quantum-resistant blockchain ecosystem',
          keywords: ['quantum', 'blockchain', 'secure', 'aetherion', 'fractalcoin', 'aicoin'],
          author: 'AI Freedom Trust',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      
      let result: boolean;
      
      if (websiteData) {
        // Update existing website
        result = await fractalNodeHostingService.updateWebsite(DOMAIN_NAME, websiteContent, {
          encryptionAlgorithm,
          fractalSharding: {
            enabled: true,
            shards: shardCount,
            globalDistribution: true
          }
        });
      } else {
        // Deploy new website
        result = await fractalNodeHostingService.deployWebsite(DOMAIN_NAME, websiteContent, {
          encryptionAlgorithm,
          fractalSharding: {
            enabled: true,
            shards: shardCount,
            globalDistribution: true
          }
        });
      }
      
      if (result) {
        toast({
          title: "Success",
          description: websiteData ? "AetherCore.trust website updated successfully" : "AetherCore.trust website deployed successfully",
          variant: "default"
        });
        
        // Reload website data
        await loadWebsiteData();
      } else {
        throw new Error("Deployment failed");
      }
    } catch (error) {
      console.error('Error deploying website:', error);
      toast({
        title: "Error",
        description: "Failed to deploy website. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };
  
  const handleVerifySecurity = async () => {
    if (!websiteData) return;
    
    setIsVerifying(true);
    try {
      const status = await fractalNodeHostingService.verifyWebsiteSecurity(DOMAIN_NAME);
      setSecurityStatus(status);
      
      if (status) {
        toast({
          title: "Security Verification Complete",
          description: status.secure ? "The website is quantum secure" : "Security issues detected",
          variant: status.secure ? "default" : "destructive"
        });
      } else {
        throw new Error("Verification failed");
      }
    } catch (error) {
      console.error('Error verifying security:', error);
      toast({
        title: "Error",
        description: "Failed to verify website security. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleToggleStatus = async () => {
    if (!websiteData) return;
    
    try {
      const result = await fractalNodeHostingService.toggleWebsiteStatus(DOMAIN_NAME);
      
      if (result) {
        toast({
          title: "Success",
          description: websiteData.status.active ? "Website deactivated" : "Website activated",
          variant: "default"
        });
        
        // Reload website data
        await loadWebsiteData();
      } else {
        throw new Error("Failed to toggle status");
      }
    } catch (error) {
      console.error('Error toggling website status:', error);
      toast({
        title: "Error",
        description: "Failed to toggle website status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'maximum':
        return 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400';
      case 'enhanced':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400';
      case 'standard':
        return 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/20 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };
  
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Globe className="h-8 w-8 text-primary" />
          AetherCore.trust Webpage
        </h1>
        <p className="text-muted-foreground">
          Quantum-secure webpage hosted on FractalCoin node storage using HTTQS protocol
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Security Protocol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="font-medium">HTTQS (HTTP Quantum Secure)</div>
              <p className="text-sm text-muted-foreground mb-2">
                Advanced quantum-resistant protocol using post-quantum cryptography
              </p>
              <Badge className={getSecurityLevelColor(securityStatus?.verificationLevel || 'standard')}>
                {securityStatus?.verificationLevel || 'Not Verified'} Security
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Hosting Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${websiteData?.status.active ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <div className="font-medium">{websiteData?.status.active ? 'Active' : 'Inactive'}</div>
              </div>
              <p className="text-sm text-muted-foreground">
                {websiteData ? 
                  `Deployed on ${new Date(websiteData.status.lastDeployed || '').toLocaleString()}` : 
                  'Not yet deployed'}
              </p>
              {websiteData && (
                <div className="mt-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{websiteData.status.uptimePercentage}% Uptime</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="font-medium">{websiteData?.status.securityScore || 0}/100</div>
              <Progress value={websiteData?.status.securityScore || 0} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {securityStatus ? 
                  `Quantum Resistance: ${securityStatus.quantumResistance}%` : 
                  'Not verified yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="editor">Content Editor</TabsTrigger>
          <TabsTrigger value="security">Security Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AetherCore.trust Overview</CardTitle>
              <CardDescription>
                Information about your quantum-secure webpage hosted on FractalCoin node storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Domain Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Domain:</span>
                      <span className="font-medium">{DOMAIN_NAME}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Protocol:</span>
                      <Badge variant="outline" className="capitalize">{websiteData?.status.protocol || 'httqs'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Encryption:</span>
                      <Badge variant="outline" className="capitalize">{encryptionAlgorithm}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={websiteData?.status.active ? 'default' : 'secondary'}>
                        {websiteData?.status.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Fractal Distribution</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shard Count:</span>
                      <span className="font-medium">{websiteData?.status.shardDistribution || shardCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Global Distribution:</span>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">DDOS Protection:</span>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantum Firewall:</span>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-2">Website Preview</h3>
                <div className="rounded-md border overflow-hidden h-[300px] relative">
                  {websiteData ? (
                    <div className="p-6 h-full overflow-auto bg-slate-50 dark:bg-slate-950">
                      <div dangerouslySetInnerHTML={{ __html: websiteData.content.html }}></div>
                      <style>{websiteData.content.css}</style>
                      <script>{websiteData.content.js}</script>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-950">
                      <div className="text-center">
                        <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No Website Deployed Yet</h3>
                        <p className="text-muted-foreground">Deploy your website to see the preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center gap-2">
                {websiteData && (
                  <Button variant="outline" onClick={handleToggleStatus}>
                    {websiteData.status.active ? 'Deactivate Website' : 'Activate Website'}
                  </Button>
                )}
                <Button variant="outline" onClick={loadWebsiteData} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              <Button onClick={() => setActiveTab('editor')}>
                {websiteData ? 'Edit Website' : 'Create Website'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Website Content Editor</CardTitle>
              <CardDescription>
                Edit your AetherCore.trust webpage content and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="encryption-algorithm">Encryption Algorithm</Label>
                    <Select value={encryptionAlgorithm} onValueChange={(value) => setEncryptionAlgorithm(value as QuantumEncryptionAlgorithm)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select encryption algorithm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hybrid">Hybrid Multi-Algorithm (Maximum Security)</SelectItem>
                        <SelectItem value="sphincs">SPHINCS+ (Very High Security)</SelectItem>
                        <SelectItem value="kyber">CRYSTALS-Kyber (High Security)</SelectItem>
                        <SelectItem value="falcon">FALCON (High Security)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="shard-count">Fractal Shard Count</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        id="shard-count" 
                        type="number" 
                        min="16" 
                        max="256" 
                        step="16" 
                        value={shardCount}
                        onChange={(e) => setShardCount(parseInt(e.target.value))}
                      />
                      <Button variant="outline" onClick={() => setShardCount(Math.max(16, shardCount - 16))}>-</Button>
                      <Button variant="outline" onClick={() => setShardCount(Math.min(256, shardCount + 16))}>+</Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      More shards improves security but requires more resources
                    </p>
                  </div>
                </div>
                
                <div>
                  <Alert className="mb-4">
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Security Information</AlertTitle>
                    <AlertDescription>
                      Your content will be distributed across {shardCount} fractal shards using the {encryptionAlgorithm} quantum encryption algorithm.
                    </AlertDescription>
                  </Alert>
                  
                  {websiteData && (
                    <div className="text-sm text-muted-foreground">
                      <p>Last deployed: {new Date(websiteData.status.lastDeployed || '').toLocaleString()}</p>
                      <p>Current status: {websiteData.status.active ? 'Active' : 'Inactive'}</p>
                      <p>Visitor count: {websiteData.status.visitorCount}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="html-content">HTML Content</Label>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setHtmlContent(DEFAULT_HTML_CONTENT)}
                    >
                      Reset to Default
                    </Button>
                  </div>
                  <Textarea 
                    id="html-content" 
                    className="font-mono text-sm h-64" 
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="css-content">CSS Styles</Label>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setCssContent(DEFAULT_CSS_CONTENT)}
                      >
                        Reset to Default
                      </Button>
                    </div>
                    <Textarea 
                      id="css-content" 
                      className="font-mono text-sm h-52" 
                      value={cssContent}
                      onChange={(e) => setCssContent(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="js-content">JavaScript</Label>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setJsContent(DEFAULT_JS_CONTENT)}
                      >
                        Reset to Default
                      </Button>
                    </div>
                    <Textarea 
                      id="js-content" 
                      className="font-mono text-sm h-52" 
                      value={jsContent}
                      onChange={(e) => setJsContent(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('overview')}>
                Cancel
              </Button>
              <Button onClick={handleDeploy} disabled={isDeploying}>
                {isDeploying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {websiteData ? 'Update Website' : 'Deploy Website'}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quantum Security Details</CardTitle>
              <CardDescription>
                Detailed information about the quantum security features of your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium mb-1">Security Verification</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Verify the quantum security status of your website
                  </p>
                </div>
                <Button 
                  onClick={handleVerifySecurity} 
                  disabled={isVerifying || !websiteData?.status.active}
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Security
                    </>
                  )}
                </Button>
              </div>
              
              {websiteData?.status.active ? (
                securityStatus ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Security Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            {securityStatus.secure ? (
                              <>
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="font-medium">Secure</span>
                              </>
                            ) : (
                              <>
                                <Shield className="h-5 w-5 text-red-500" />
                                <span className="font-medium">Vulnerable</span>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Quantum Resistance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="font-medium">{securityStatus.quantumResistance}%</div>
                          <Progress value={securityStatus.quantumResistance} className="h-2" />
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-muted/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Threat Detection</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            {securityStatus.threats.detected ? (
                              <>
                                <Shield className="h-5 w-5 text-red-500" />
                                <span className="font-medium">{securityStatus.threats.level} Threat</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="font-medium">No Threats</span>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <Card className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Security Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Protocol:</span>
                              <span className="font-medium">HTTQS (HTTP Quantum Secure)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Verification Level:</span>
                              <Badge className={getSecurityLevelColor(securityStatus.verificationLevel)}>
                                {securityStatus.verificationLevel}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Encryption Algorithm:</span>
                              <span className="font-medium capitalize">{encryptionAlgorithm}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Fractal Distribution:</span>
                              <span className="font-medium">{securityStatus.fractalDistribution} Shards</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">HTTPS Proxy:</span>
                              <Badge variant={websiteData.status.httpsProxyEnabled ? 'default' : 'secondary'}>
                                {websiteData.status.httpsProxyEnabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last Verified:</span>
                              <span className="font-medium">{new Date().toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>No Verification Performed</AlertTitle>
                    <AlertDescription>
                      Click the "Verify Security" button to check the quantum security status of your website.
                    </AlertDescription>
                  </Alert>
                )
              ) : (
                <Alert variant="destructive">
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Website Inactive</AlertTitle>
                  <AlertDescription>
                    Your website is currently inactive. Please activate it from the Overview tab to perform security verification.
                  </AlertDescription>
                </Alert>
              )}
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">HTTQS Protocol Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Quantum-Resistant Algorithms</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary font-medium">1</span>
                          </div>
                          <div>
                            <span className="font-medium">CRYSTALS-Kyber</span>
                            <p className="text-sm text-muted-foreground">
                              Lattice-based key encapsulation mechanism
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary font-medium">2</span>
                          </div>
                          <div>
                            <span className="font-medium">FALCON</span>
                            <p className="text-sm text-muted-foreground">
                              Lattice-based digital signature scheme
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary font-medium">3</span>
                          </div>
                          <div>
                            <span className="font-medium">SPHINCS+</span>
                            <p className="text-sm text-muted-foreground">
                              Hash-based stateless signature scheme
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Key Security Features</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary font-medium">1</span>
                          </div>
                          <div>
                            <span className="font-medium">Fractal Distribution</span>
                            <p className="text-sm text-muted-foreground">
                              Content is sharded and distributed across multiple nodes
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary font-medium">2</span>
                          </div>
                          <div>
                            <span className="font-medium">Quantum Firewall</span>
                            <p className="text-sm text-muted-foreground">
                              Protection against quantum-based attacks
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                            <span className="text-xs text-primary font-medium">3</span>
                          </div>
                          <div>
                            <span className="font-medium">HTTPS Compatibility</span>
                            <p className="text-sm text-muted-foreground">
                              Automatic proxy for HTTPS clients
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setActiveTab('overview')}>
                Back to Overview
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Default HTML content for AetherCore.trust
const DEFAULT_HTML_CONTENT = `
<div class="aether-container">
  <div class="aether-header">
    <div class="logo">AetherCore.trust</div>
    <div class="tagline">Quantum-Secure Web3 Platform</div>
  </div>
  
  <div class="aether-hero">
    <h1>Welcome to the Future of <span class="highlight">Quantum-Secure</span> Web</h1>
    <p class="lead">
      AetherCore.trust represents the next generation of blockchain websites,
      utilizing fractal distribution and post-quantum cryptography to ensure
      complete security against both classical and quantum threats.
    </p>
    <div class="cta-buttons">
      <button class="cta-primary">Explore Ecosystem</button>
      <button class="cta-secondary">Learn More</button>
    </div>
  </div>
  
  <div class="features-grid">
    <div class="feature-card">
      <div class="icon"><span class="material-icons">shield</span></div>
      <h3>Quantum-Resistant</h3>
      <p>Protected using post-quantum cryptographic algorithms</p>
    </div>
    <div class="feature-card">
      <div class="icon"><span class="material-icons">storage</span></div>
      <h3>Fractal Distribution</h3>
      <p>Content distributed across FractalCoin node storage</p>
    </div>
    <div class="feature-card">
      <div class="icon"><span class="material-icons">language</span></div>
      <h3>HTTQS Protocol</h3>
      <p>Advanced HTTP Quantum Secure protocol</p>
    </div>
    <div class="feature-card">
      <div class="icon"><span class="material-icons">auto_awesome</span></div>
      <h3>AI Integration</h3>
      <p>Powered by AICoin for intelligent features</p>
    </div>
  </div>
  
  <div class="aether-footer">
    <p>&copy; 2025 AetherCore.trust | A project of AI Freedom Trust</p>
  </div>
</div>
`;

// Default CSS styles for AetherCore.trust
const DEFAULT_CSS_CONTENT = `
.aether-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  max-width: 100%;
  color: #1a202c;
  line-height: 1.6;
}

.aether-header {
  padding: 1.5rem 0;
  text-align: center;
}

.logo {
  font-size: 2rem;
  font-weight: bold;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tagline {
  font-size: 1rem;
  color: #64748b;
  margin-top: 0.5rem;
}

.aether-hero {
  text-align: center;
  padding: 3rem 1rem;
}

h1 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.highlight {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.lead {
  font-size: 1.125rem;
  color: #64748b;
  max-width: 42rem;
  margin: 0 auto 2rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
}

.cta-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
}

.cta-secondary {
  background: transparent;
  color: #6366f1;
  border: 1px solid #6366f1;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 3rem 1rem;
}

.feature-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.icon {
  background: rgba(99, 102, 241, 0.1);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: #6366f1;
}

.material-icons {
  font-family: 'Material Icons';
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #64748b;
  font-size: 0.875rem;
}

.aether-footer {
  text-align: center;
  padding: 2rem 1rem;
  color: #64748b;
  border-top: 1px solid #e2e8f0;
  font-size: 0.875rem;
}

@media (prefers-color-scheme: dark) {
  .aether-container {
    color: #e2e8f0;
    background-color: #0f172a;
  }
  
  .tagline {
    color: #94a3b8;
  }
  
  .lead {
    color: #94a3b8;
  }
  
  .feature-card {
    background: #1e293b;
  }
  
  .feature-card p {
    color: #94a3b8;
  }
  
  .aether-footer {
    color: #94a3b8;
    border-top: 1px solid #1e293b;
  }
}
`;

// Default JavaScript content for AetherCore.trust
const DEFAULT_JS_CONTENT = `
// Add Material Icons font for icons
(function() {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
})();

// Add Inter font
(function() {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
})();

// Simple animation for the hero section
document.addEventListener('DOMContentLoaded', function() {
  const hero = document.querySelector('.aether-hero');
  if (hero) {
    hero.style.opacity = '0';
    hero.style.transform = 'translateY(20px)';
    hero.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    
    setTimeout(() => {
      hero.style.opacity = '1';
      hero.style.transform = 'translateY(0)';
    }, 300);
  }
  
  // Animate feature cards
  const cards = document.querySelectorAll('.feature-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 600 + (index * 150));
  });
});

// Handle button clicks
document.addEventListener('click', function(event) {
  if (event.target.classList.contains('cta-primary')) {
    console.log('Explore Ecosystem clicked');
    // Add your action here
  } else if (event.target.classList.contains('cta-secondary')) {
    console.log('Learn More clicked');
    // Add your action here
  }
});
`;

export default AetherCoreTrust;