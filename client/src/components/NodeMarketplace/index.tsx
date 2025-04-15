import React, { useState } from "react";
import { 
  Layers, 
  Server, 
  Cloud, 
  Database, 
  HardDrive, 
  CreditCard,
  Cpu,
  Memory,
  Wifi,
  Lock,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

/**
 * NodeMarketplace Component
 * 
 * Provides an interface for users to deploy SaaS applications on the FractalCoin
 * node network, with rewards in Filecoin, FractalCoin, and AICoin as the network expands.
 */
const NodeMarketplace: React.FC = () => {
  const [activeTab, setActiveTab] = useState("deploy");
  const [resourceLevel, setResourceLevel] = useState(2);
  const [deploymentDuration, setDeploymentDuration] = useState(3); // months
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [deploymentName, setDeploymentName] = useState("");
  const [deploymentType, setDeploymentType] = useState("webapp");
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();

  // Resource tiers based on deployment needs
  const resourceTiers = [
    { level: 1, cpu: 2, memory: 4, storage: 50, bandwidth: 500, price: 25 },
    { level: 2, cpu: 4, memory: 8, storage: 100, bandwidth: 1000, price: 45 },
    { level: 3, cpu: 8, memory: 16, storage: 250, bandwidth: 2000, price: 85 },
    { level: 4, cpu: 16, memory: 32, storage: 500, bandwidth: 5000, price: 160 },
    { level: 5, cpu: 32, memory: 64, storage: 1000, bandwidth: 10000, price: 300 }
  ];

  // Deployment duration options (in months)
  const durationOptions = [1, 3, 6, 12];

  // Deployment types
  const deploymentTypes = [
    { id: "webapp", name: "Web Application", icon: <Cloud className="h-4 w-4" /> },
    { id: "database", name: "Database Service", icon: <Database className="h-4 w-4" /> },
    { id: "storage", name: "Storage Solution", icon: <HardDrive className="h-4 w-4" /> },
    { id: "api", name: "API Service", icon: <Wifi className="h-4 w-4" /> },
    { id: "ml", name: "ML/AI Model", icon: <Cpu className="h-4 w-4" /> }
  ];

  // Prebundled deployment plans
  const deploymentPlans = [
    { 
      id: "starter",
      name: "Starter SaaS", 
      description: "Perfect for MVPs and small applications",
      resourceLevel: 1,
      deploymentDuration: 3,
      deploymentType: "webapp",
      price: 65,
      popular: false
    },
    { 
      id: "business",
      name: "Business SaaS", 
      description: "For growing businesses with moderate traffic",
      resourceLevel: 3,
      deploymentDuration: 6,
      deploymentType: "webapp",
      price: 450,
      popular: true
    },
    { 
      id: "enterprise",
      name: "Enterprise SaaS", 
      description: "High-performance for demanding applications",
      resourceLevel: 5,
      deploymentDuration: 12,
      deploymentType: "webapp",
      price: 2800,
      popular: false
    }
  ];

  // Calculate price based on resource level and duration
  const calculatePrice = () => {
    const selectedTier = resourceTiers.find(tier => tier.level === resourceLevel);
    const basePrice = selectedTier ? selectedTier.price : 0;
    const durationMultiplier = deploymentDuration === 12 ? 10 : deploymentDuration / 1.25; // discount for longer commitments
    return Math.round(basePrice * durationMultiplier);
  };

  // Calculate rewards based on resource level and duration
  const calculateRewards = () => {
    const basePrice = calculatePrice();
    const rewards = {
      fractalcoin: Math.round(basePrice * 2.5), // 2.5 FractalCoin per dollar spent
      filecoin: basePrice * 0.1, // 0.1 Filecoin per dollar spent
      aicoin: Math.round(basePrice * 5) // 5 AICoin per dollar spent
    };
    return rewards;
  };

  // Select a pre-bundled plan
  const selectPlan = (planId: string) => {
    const plan = deploymentPlans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlanId(planId);
      setResourceLevel(plan.resourceLevel);
      setDeploymentDuration(plan.deploymentDuration);
      setDeploymentType(plan.deploymentType);
    }
  };

  // Handle deployment submission
  const handleDeploy = () => {
    if (!deploymentName.trim()) {
      toast({
        title: "Deployment name required",
        description: "Please provide a name for your deployment",
        variant: "destructive"
      });
      return;
    }

    setIsDeploying(true);
    
    // Simulate deployment process
    setTimeout(() => {
      toast({
        title: "Deployment successful!",
        description: `${deploymentName} has been deployed on the FractalCoin node network.`,
        variant: "default"
      });
      
      // Reset form and show success
      setIsDeploying(false);
      setDeploymentName("");
      setActiveTab("manage");
    }, 2500);
  };

  // Get details for the current resource tier
  const currentResourceTier = resourceTiers.find(tier => tier.level === resourceLevel) || resourceTiers[0];
  
  // Calculate current price and rewards
  const currentPrice = calculatePrice();
  const currentRewards = calculateRewards();
  
  // Deployment type details
  const selectedDeploymentType = deploymentTypes.find(type => type.id === deploymentType) || deploymentTypes[0];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center p-1 px-3 mb-4 border border-forest-200 rounded-full bg-forest-50 dark:bg-forest-900/30">
            <Server className="w-4 h-4 mr-2 text-forest-600 dark:text-forest-400" />
            <span className="text-xs font-medium text-forest-600 dark:text-forest-400">Decentralized Deployment</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            FractalCoin <span className="gradient-text">Node Marketplace</span>
          </h2>
          <p className="text-muted-foreground">
            Deploy your SaaS applications on our secure, decentralized node network.
            Earn rewards in Filecoin, FractalCoin, and AICoin as the network expands.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <Card>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Node Network Marketplace</CardTitle>
                    <CardDescription>Deploy, manage, and earn from the network</CardDescription>
                  </div>
                  <Layers className="h-8 w-8 text-forest-600 dark:text-forest-400" />
                </div>
                
                <TabsList className="grid grid-cols-3 mt-6">
                  <TabsTrigger value="deploy">Deploy Services</TabsTrigger>
                  <TabsTrigger value="manage">Manage Nodes</TabsTrigger>
                  <TabsTrigger value="earn">Earn Rewards</TabsTrigger>
                </TabsList>
              </CardHeader>
              
              <CardContent className="p-6">
                <TabsContent value="deploy" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Deploy Your SaaS Application</h3>
                    <p className="text-sm text-muted-foreground">
                      Deploy your application on our distributed node network with quantum-resistant security.
                    </p>
                    
                    {/* Deployment Name Input */}
                    <div className="space-y-2">
                      <Label htmlFor="deployment-name">Deployment Name</Label>
                      <Input 
                        id="deployment-name" 
                        placeholder="My SaaS Application" 
                        value={deploymentName}
                        onChange={(e) => setDeploymentName(e.target.value)}
                      />
                    </div>
                    
                    {/* Deployment Type Selection */}
                    <div className="space-y-2">
                      <Label>Deployment Type</Label>
                      <div className="flex flex-wrap gap-2">
                        {deploymentTypes.map(type => (
                          <Badge 
                            key={type.id}
                            variant={deploymentType === type.id ? "default" : "outline"}
                            className="cursor-pointer flex items-center gap-1"
                            onClick={() => setDeploymentType(type.id)}
                          >
                            {type.icon}
                            <span>{type.name}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Resource Level Selection */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Resource Level</Label>
                          <span className="text-sm">{resourceLevel} - {currentResourceTier.cpu} vCPUs / {currentResourceTier.memory} GB RAM</span>
                        </div>
                        <Slider 
                          value={[resourceLevel]} 
                          min={1} 
                          max={5} 
                          step={1} 
                          onValueChange={(values) => setResourceLevel(values[0])}
                          className="my-4"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Basic</span>
                          <span>Professional</span>
                          <span>Enterprise</span>
                        </div>
                      </div>
                      
                      {/* Resource details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg flex flex-col items-center text-center">
                          <Cpu className="h-5 w-5 mb-1 text-blue-500" />
                          <span className="text-xs text-muted-foreground">CPU</span>
                          <span className="text-sm font-medium">{currentResourceTier.cpu} vCPUs</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg flex flex-col items-center text-center">
                          <Memory className="h-5 w-5 mb-1 text-purple-500" />
                          <span className="text-xs text-muted-foreground">Memory</span>
                          <span className="text-sm font-medium">{currentResourceTier.memory} GB</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg flex flex-col items-center text-center">
                          <HardDrive className="h-5 w-5 mb-1 text-green-500" />
                          <span className="text-xs text-muted-foreground">Storage</span>
                          <span className="text-sm font-medium">{currentResourceTier.storage} GB</span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg flex flex-col items-center text-center">
                          <Wifi className="h-5 w-5 mb-1 text-yellow-500" />
                          <span className="text-xs text-muted-foreground">Bandwidth</span>
                          <span className="text-sm font-medium">{currentResourceTier.bandwidth} GB/mo</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Deployment Duration */}
                    <div className="space-y-2">
                      <Label>Deployment Duration</Label>
                      <div className="flex gap-2">
                        {durationOptions.map(months => (
                          <Button 
                            key={months}
                            variant={deploymentDuration === months ? "default" : "outline"}
                            size="sm"
                            onClick={() => setDeploymentDuration(months)}
                          >
                            {months} {months === 1 ? 'month' : 'months'}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Pre-bundled plans */}
                    <div className="space-y-3">
                      <Label>Recommended Plans</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {deploymentPlans.map(plan => (
                          <Card 
                            key={plan.id}
                            className={`
                              cursor-pointer transition-all border-2 overflow-hidden
                              ${selectedPlanId === plan.id ? 'border-forest-500 dark:border-forest-400' : 'border-transparent'}
                              ${plan.popular ? 'relative' : ''}
                            `}
                            onClick={() => selectPlan(plan.id)}
                          >
                            {plan.popular && (
                              <div className="absolute top-0 right-0">
                                <div className="bg-forest-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                                  Popular
                                </div>
                              </div>
                            )}
                            <CardHeader className="p-4">
                              <CardTitle className="text-base">{plan.name}</CardTitle>
                              <CardDescription className="text-xs">{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="text-xl font-bold mb-2">${plan.price}</div>
                              <div className="text-xs text-muted-foreground">
                                for {plan.deploymentDuration} months
                              </div>
                              <div className="mt-3 space-y-2">
                                <div className="flex items-center text-sm">
                                  <Cpu className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                  {resourceTiers[plan.resourceLevel - 1].cpu} vCPUs
                                </div>
                                <div className="flex items-center text-sm">
                                  <Memory className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                  {resourceTiers[plan.resourceLevel - 1].memory} GB RAM
                                </div>
                                <div className="flex items-center text-sm">
                                  <HardDrive className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                  {resourceTiers[plan.resourceLevel - 1].storage} GB Storage
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    {/* Pricing and rewards summary */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Price</span>
                        <span className="text-2xl font-bold">${currentPrice}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium mb-1">Rewards</div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center">
                            <div className="text-sm text-forest-600 dark:text-forest-400 font-medium">{currentRewards.fractalcoin}</div>
                            <div className="text-xs text-muted-foreground">FractalCoin</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center">
                            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">{currentRewards.filecoin.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">Filecoin</div>
                          </div>
                          <div className="bg-white dark:bg-gray-800 p-2 rounded-lg text-center">
                            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">{currentRewards.aicoin}</div>
                            <div className="text-xs text-muted-foreground">AICoin</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="manage" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Manage Your Deployments</h3>
                    <p className="text-sm text-muted-foreground">
                      View and manage your applications running on the FractalCoin node network.
                    </p>
                    
                    {/* Active deployments list */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-6 bg-gray-50 dark:bg-gray-900/50 p-3 border-b text-sm font-medium">
                        <div className="col-span-2">Name</div>
                        <div>Type</div>
                        <div>Resources</div>
                        <div>Status</div>
                        <div>Actions</div>
                      </div>
                      
                      <div className="divide-y">
                        <div className="grid grid-cols-6 p-3 items-center">
                          <div className="col-span-2 font-medium">Example SaaS App</div>
                          <div><Badge variant="outline">Web App</Badge></div>
                          <div>Tier 3 (8 vCPUs)</div>
                          <div><Badge className="bg-green-500">Running</Badge></div>
                          <div>
                            <Button variant="outline" size="sm">Manage</Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-6 p-3 items-center">
                          <div className="col-span-2 font-medium">API Service</div>
                          <div><Badge variant="outline">API</Badge></div>
                          <div>Tier 2 (4 vCPUs)</div>
                          <div><Badge className="bg-green-500">Running</Badge></div>
                          <div>
                            <Button variant="outline" size="sm">Manage</Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-6 p-3 items-center">
                          <div className="col-span-2 font-medium">ML Model Endpoint</div>
                          <div><Badge variant="outline">ML/AI</Badge></div>
                          <div>Tier 4 (16 vCPUs)</div>
                          <div><Badge className="bg-amber-500">Updating</Badge></div>
                          <div>
                            <Button variant="outline" size="sm">Manage</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Performance metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">CPU Usage</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">CPU usage chart</span>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Average: 62% utilization
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">Memory Usage</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">Memory usage chart</span>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Average: 48% utilization
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">Network Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">Network activity chart</span>
                          </div>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Average: 1.2 GB/hour
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="earn" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Earn by Contributing Resources</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect your hardware to the FractalCoin node network and earn rewards in multiple currencies.
                    </p>
                    
                    {/* Resource contribution overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Your Contribution Status</Label>
                          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                            <div className="flex justify-between mb-2">
                              <span className="text-sm">Status</span>
                              <Badge className="bg-green-500">Active</Badge>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm">Resources Contributed</span>
                              <span className="text-sm font-medium">4 vCPUs, 8 GB RAM, 200 GB Storage</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Uptime</span>
                              <span className="text-sm font-medium">99.2%</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Add new resource */}
                        <div className="space-y-2">
                          <Label>Add New Resource</Label>
                          <Card>
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <Label htmlFor="node-name">Node Name</Label>
                                  <Input id="node-name" placeholder="My FractalCoin Node" />
                                </div>
                                <div className="space-y-1">
                                  <Label htmlFor="node-ip">Node IP Address</Label>
                                  <Input id="node-ip" placeholder="123.45.67.89" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <Label htmlFor="node-cpu">vCPUs</Label>
                                    <Input id="node-cpu" type="number" min="1" defaultValue="4" />
                                  </div>
                                  <div className="space-y-1">
                                    <Label htmlFor="node-ram">RAM (GB)</Label>
                                    <Input id="node-ram" type="number" min="1" defaultValue="8" />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <Label htmlFor="node-storage">Storage (GB)</Label>
                                    <Input id="node-storage" type="number" min="10" defaultValue="200" />
                                  </div>
                                  <div className="space-y-1">
                                    <Label htmlFor="node-bandwidth">Bandwidth (GB/mo)</Label>
                                    <Input id="node-bandwidth" type="number" min="100" defaultValue="1000" />
                                  </div>
                                </div>
                                <Button className="w-full">Add Node</Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                      
                      {/* Earnings overview */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Your Earnings</Label>
                          <div className="grid grid-cols-3 gap-4">
                            <Card>
                              <CardHeader className="p-3">
                                <CardTitle className="text-sm">FractalCoin</CardTitle>
                              </CardHeader>
                              <CardContent className="p-3 pt-0">
                                <div className="text-2xl font-bold">1,245</div>
                                <div className="text-xs text-muted-foreground">
                                  ~$124.50 USD
                                </div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="p-3">
                                <CardTitle className="text-sm">Filecoin</CardTitle>
                              </CardHeader>
                              <CardContent className="p-3 pt-0">
                                <div className="text-2xl font-bold">4.8</div>
                                <div className="text-xs text-muted-foreground">
                                  ~$192.00 USD
                                </div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader className="p-3">
                                <CardTitle className="text-sm">AICoin</CardTitle>
                              </CardHeader>
                              <CardContent className="p-3 pt-0">
                                <div className="text-2xl font-bold">2,850</div>
                                <div className="text-xs text-muted-foreground">
                                  ~$85.50 USD
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                        
                        {/* Recent payouts */}
                        <div className="space-y-2">
                          <Label>Recent Payouts</Label>
                          <div className="border rounded-lg divide-y">
                            <div className="p-3 flex justify-between items-center">
                              <div>
                                <div className="font-medium">420 FractalCoin</div>
                                <div className="text-xs text-muted-foreground">April 10, 2025</div>
                              </div>
                              <Badge variant="outline" className="text-green-600">Completed</Badge>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                              <div>
                                <div className="font-medium">1.2 Filecoin</div>
                                <div className="text-xs text-muted-foreground">April 1, 2025</div>
                              </div>
                              <Badge variant="outline" className="text-green-600">Completed</Badge>
                            </div>
                            <div className="p-3 flex justify-between items-center">
                              <div>
                                <div className="font-medium">950 AICoin</div>
                                <div className="text-xs text-muted-foreground">March 28, 2025</div>
                              </div>
                              <Badge variant="outline" className="text-green-600">Completed</Badge>
                            </div>
                          </div>
                        </div>
                        
                        {/* Projection */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Award className="h-4 w-4 mr-2 text-yellow-500" />
                            <span className="font-medium">Earnings Projection</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Based on your current contribution and network growth:
                          </p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Next Month</span>
                              <span className="font-medium">~$180 USD</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>6 Months</span>
                              <span className="font-medium">~$1,350 USD</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>12 Months</span>
                              <span className="font-medium">~$3,240 USD</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
              
              <CardFooter className="px-6 py-4 border-t flex justify-between items-center">
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-forest-600" />
                  <span className="text-sm text-muted-foreground">Secured by AetherSphere zero-trust framework</span>
                </div>
                
                {activeTab === 'deploy' && (
                  <Button disabled={isDeploying} onClick={handleDeploy}>
                    {isDeploying ? "Deploying..." : "Deploy Now"}
                  </Button>
                )}
              </CardFooter>
            </Tabs>
          </Card>
          
          <div className="mt-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-medium mb-4 text-center">How the FractalCoin Node Network Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center p-4">
                <div className="h-12 w-12 rounded-full bg-forest-100 dark:bg-forest-900/50 flex items-center justify-center mb-4">
                  <Server className="h-6 w-6 text-forest-600 dark:text-forest-400" />
                </div>
                <h4 className="font-medium mb-1">Resource Contribution</h4>
                <p className="text-sm text-muted-foreground">
                  Community members contribute computing resources to the network, expanding its capacity.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4">
                <div className="h-12 w-12 rounded-full bg-forest-100 dark:bg-forest-900/50 flex items-center justify-center mb-4">
                  <Layers className="h-6 w-6 text-forest-600 dark:text-forest-400" />
                </div>
                <h4 className="font-medium mb-1">Merkle Tree Verification</h4>
                <p className="text-sm text-muted-foreground">
                  FractalCoin uses Merkle Trees to organize and verify resources with mathematical precision.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4">
                <div className="h-12 w-12 rounded-full bg-forest-100 dark:bg-forest-900/50 flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6 text-forest-600 dark:text-forest-400" />
                </div>
                <h4 className="font-medium mb-1">Multi-Currency Rewards</h4>
                <p className="text-sm text-muted-foreground">
                  Contributors earn Filecoin, FractalCoin, and AICoin, creating a sustainable incentive system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NodeMarketplace;