import React, { useState } from 'react';
import { 
  Shield, 
  Globe, 
  Server, 
  Lock, 
  RefreshCw, 
  Plus, 
  Check, 
  X, 
  Cpu,
  Network, 
  Layers,
  Workflow,
  AlertTriangle,
  Share2
} from 'lucide-react';
import { useQuantumDomain } from '../contexts/QuantumDomainContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { toast } from '../hooks/use-toast';

export interface DomainHostingStats {
  uptime: number;
  visitors: number;
  bandwidth: string;
  fractalNodeCount: number;
  fractalQueryCount: number;
  availabilityScore: number;
  queryLatency: number;
}

// Formats a date to a human-readable string
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Gets security level color
const getSecurityLevelColor = (level: 'standard' | 'enhanced' | 'maximum') => {
  switch (level) {
    case 'standard':
      return 'bg-blue-500/10 text-blue-500';
    case 'enhanced':
      return 'bg-purple-500/10 text-purple-500';
    case 'maximum':
      return 'bg-green-500/10 text-green-500';
    default:
      return 'bg-slate-500/10 text-slate-500';
  }
};

// Domain Search and Register component
const DomainSearch: React.FC = () => {
  const [domainName, setDomainName] = useState('');
  const [searchResult, setSearchResult] = useState<{ 
    available: boolean; 
    name: string;
    suggestions?: string[];
    quantumSecure: boolean;
  } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [registrationOptions, setRegistrationOptions] = useState({
    encryptionAlgorithm: 'hybrid' as const,
    quantumSecurityLevel: 'maximum' as const,
    years: 1,
    fractionalOwnership: false
  });
  
  const { checkDomainAvailability, registerDomain, isLoading } = useQuantumDomain();
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!domainName) {
        toast({
          title: "Error",
          description: "Please enter a domain name",
          variant: "destructive"
        });
        return;
      }
      
      // Add .trust if not present
      const searchName = domainName.endsWith('.trust') ? domainName : `${domainName}.trust`;
      
      const result = await checkDomainAvailability(searchName);
      setSearchResult(result);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while checking domain availability",
        variant: "destructive"
      });
    }
  };
  
  const handleRegister = async () => {
    try {
      if (!searchResult || !searchResult.available) return;
      
      const success = await registerDomain(searchResult.name, registrationOptions);
      
      if (success) {
        toast({
          title: "Success",
          description: `Domain ${searchResult.name} has been registered successfully!`,
        });
        setIsDialogOpen(false);
        setSearchResult(null);
        setDomainName('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while registering the domain",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Register a Quantum-Secure Domain
          </CardTitle>
          <CardDescription>
            Search for and register .trust domains with quantum-resistant security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter domain name (e.g. yourdomain.trust)"
                value={domainName}
                onChange={(e) => setDomainName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>
          
          {searchResult && (
            <div className="mt-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{searchResult.name}</h3>
                {searchResult.available ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500">
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Available
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-500/10 text-red-500">
                    <X className="h-3.5 w-3.5 mr-1" />
                    Unavailable
                  </Badge>
                )}
              </div>
              
              {searchResult.available && (
                <div className="mt-4">
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>Register This Domain</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Register {searchResult.name}</DialogTitle>
                        <DialogDescription>
                          Configure quantum security options for your new domain
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="quantum-security">Quantum Security Level</Label>
                          <Select 
                            value={registrationOptions.quantumSecurityLevel}
                            onValueChange={(value) => setRegistrationOptions({
                              ...registrationOptions,
                              quantumSecurityLevel: value as any
                            })}
                          >
                            <SelectTrigger id="quantum-security">
                              <SelectValue placeholder="Select security level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard (32 shards)</SelectItem>
                              <SelectItem value="enhanced">Enhanced (64 shards)</SelectItem>
                              <SelectItem value="maximum">Maximum (128 shards)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="encryption-algorithm">Encryption Algorithm</Label>
                          <Select 
                            value={registrationOptions.encryptionAlgorithm}
                            onValueChange={(value) => setRegistrationOptions({
                              ...registrationOptions,
                              encryptionAlgorithm: value as any
                            })}
                          >
                            <SelectTrigger id="encryption-algorithm">
                              <SelectValue placeholder="Select algorithm" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kyber">CRYSTALS-Kyber</SelectItem>
                              <SelectItem value="falcon">FALCON</SelectItem>
                              <SelectItem value="sphincs">SPHINCS+</SelectItem>
                              <SelectItem value="hybrid">Hybrid (Most Secure)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="registration-years">Registration Period</Label>
                          <div className="flex items-center gap-4">
                            <Slider
                              id="registration-years"
                              min={1}
                              max={10}
                              step={1}
                              value={[registrationOptions.years]}
                              onValueChange={(values) => setRegistrationOptions({
                                ...registrationOptions,
                                years: values[0]
                              })}
                              className="flex-1"
                            />
                            <span className="w-12 text-center">{registrationOptions.years} {registrationOptions.years === 1 ? 'year' : 'years'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            id="fractional-ownership"
                            checked={registrationOptions.fractionalOwnership}
                            onCheckedChange={(checked) => setRegistrationOptions({
                              ...registrationOptions,
                              fractionalOwnership: checked
                            })}
                          />
                          <Label htmlFor="fractional-ownership">Enable Fractional Ownership</Label>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button onClick={handleRegister} disabled={isLoading}>
                          {isLoading ? 'Registering...' : 'Register Domain'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              
              {!searchResult.available && searchResult.suggestions && searchResult.suggestions.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Suggested Alternatives:</h4>
                  <div className="flex flex-wrap gap-2">
                    {searchResult.suggestions.map((suggestion) => (
                      <Badge key={suggestion} variant="outline" className="cursor-pointer" onClick={() => setDomainName(suggestion.replace('.trust', ''))}>
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Domain Management component
const DomainManagement: React.FC = () => {
  const { userDomains, isLoading, selectDomain, currentDomain } = useQuantumDomain();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(
    currentDomain ? currentDomain.name : userDomains.length > 0 ? userDomains[0].name : null
  );
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock hosting stats
  const [hostingStats, setHostingStats] = useState<DomainHostingStats>({
    uptime: 99.98,
    visitors: 1482,
    bandwidth: '328.7 MB',
    fractalNodeCount: 128,
    fractalQueryCount: 24967,
    availabilityScore: 100,
    queryLatency: 28
  });
  
  const handleDomainSelect = (domainName: string) => {
    setSelectedDomain(domainName);
    selectDomain(domainName);
  };
  
  const domain = userDomains.find(d => d.name === selectedDomain) || null;
  
  if (isLoading) {
    return <div className="flex justify-center p-8">Loading your domains...</div>;
  }
  
  if (userDomains.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>No Domains Found</CardTitle>
          <CardDescription>You haven't registered any quantum-secure domains yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Use the search and registration form above to register your first domain.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Quantum-Secure Domains
          </CardTitle>
          <CardDescription>
            Manage your registered .trust domains and their security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {userDomains.map((domain) => (
              <Button
                key={domain.name}
                variant={selectedDomain === domain.name ? "default" : "outline"}
                size="sm"
                onClick={() => handleDomainSelect(domain.name)}
                className="flex items-center gap-1"
              >
                <Globe className="h-3.5 w-3.5" />
                {domain.name}
              </Button>
            ))}
          </div>
          
          {domain && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="hosting">Hosting</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 grid-cols-2 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Domain Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-2 gap-1 text-sm">
                        <dt className="font-medium">Registered:</dt>
                        <dd>{formatDate(domain.registeredAt)}</dd>
                        <dt className="font-medium">Expires:</dt>
                        <dd>{formatDate(domain.expiresAt)}</dd>
                        <dt className="font-medium">Owner:</dt>
                        <dd className="truncate">{domain.owner.slice(0, 8)}...{domain.owner.slice(-6)}</dd>
                        <dt className="font-medium">Security:</dt>
                        <dd>
                          <Badge variant="outline" className={getSecurityLevelColor(domain.quantumSecurityLevel)}>
                            {domain.quantumSecurityLevel}
                          </Badge>
                        </dd>
                        <dt className="font-medium">Shards:</dt>
                        <dd>{domain.shardDistribution}</dd>
                        <dt className="font-medium">Algorithm:</dt>
                        <dd>{domain.encryptionAlgorithm}</dd>
                      </dl>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Hosting Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-2 gap-1 text-sm">
                        <dt className="font-medium">Uptime:</dt>
                        <dd>{hostingStats.uptime}%</dd>
                        <dt className="font-medium">Visitors:</dt>
                        <dd>{hostingStats.visitors.toLocaleString()}</dd>
                        <dt className="font-medium">Bandwidth:</dt>
                        <dd>{hostingStats.bandwidth}</dd>
                        <dt className="font-medium">Availability:</dt>
                        <dd>
                          <div className="flex items-center gap-2">
                            <Progress value={hostingStats.availabilityScore} className="h-2 w-14" />
                            <span>{hostingStats.availabilityScore}%</span>
                          </div>
                        </dd>
                        <dt className="font-medium">Nodes:</dt>
                        <dd>{hostingStats.fractalNodeCount}</dd>
                        <dt className="font-medium">Query Latency:</dt>
                        <dd>{hostingStats.queryLatency} ms</dd>
                      </dl>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Fractal Network Distribution</CardTitle>
                    <CardDescription>
                      Your domain is distributed across {domain.shardDistribution} shards in the FractalCoin network
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-lg">
                      <div className="text-center">
                        <Workflow className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Fractal shard visualization</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Quantum Security Status
                    </CardTitle>
                    <CardDescription>
                      Current security configuration and quantum resistance level
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Security Level</h4>
                        <Badge variant="outline" className={getSecurityLevelColor(domain.quantumSecurityLevel)}>
                          {domain.quantumSecurityLevel === 'maximum' ? 'Maximum Protection' :
                           domain.quantumSecurityLevel === 'enhanced' ? 'Enhanced Protection' : 'Standard Protection'}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          {domain.quantumSecurityLevel === 'maximum' ? 
                            'The highest level of quantum-resistance using advanced lattice-based and hash-based algorithms' :
                           domain.quantumSecurityLevel === 'enhanced' ? 
                            'Strong quantum-resistance with optimized computational requirements' :
                            'Basic quantum-resistance suitable for most applications'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Encryption Algorithm</h4>
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
                          {domain.encryptionAlgorithm === 'hybrid' ? 'Hybrid (Multi-Algorithm)' : 
                           domain.encryptionAlgorithm === 'kyber' ? 'CRYSTALS-Kyber' :
                           domain.encryptionAlgorithm === 'falcon' ? 'FALCON' : 'SPHINCS+'}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-2">
                          {domain.encryptionAlgorithm === 'hybrid' ? 
                            'Combines multiple quantum-resistant algorithms for maximum security' :
                           domain.encryptionAlgorithm === 'kyber' ? 
                            'Module lattice-based key encapsulation mechanism' :
                           domain.encryptionAlgorithm === 'falcon' ? 
                            'Fast-Fourier lattice-based compact signatures' :
                            'Stateless hash-based signature scheme with minimal security assumptions'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Fractal Shard Distribution</h4>
                      <Progress value={(domain.shardDistribution / 128) * 100} className="h-2" />
                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        <span>32 shards (minimum)</span>
                        <span>128 shards (maximum)</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Your domain is distributed across {domain.shardDistribution} fractal shards,
                        providing {domain.shardDistribution >= 100 ? 'exceptional' : 
                                  domain.shardDistribution >= 60 ? 'very good' : 'good'} resistance 
                        to both classical and quantum attacks.
                      </p>
                    </div>
                    
                    <div className="pt-4">
                      <h4 className="text-sm font-medium mb-4">Security Upgrade Options</h4>
                      <div className="space-y-3">
                        {domain.quantumSecurityLevel !== 'maximum' && (
                          <Button variant="outline" className="w-full justify-start">
                            <Shield className="h-4 w-4 mr-2" />
                            Upgrade to Maximum Security Level
                          </Button>
                        )}
                        {domain.encryptionAlgorithm !== 'hybrid' && (
                          <Button variant="outline" className="w-full justify-start">
                            <Lock className="h-4 w-4 mr-2" />
                            Upgrade to Hybrid Encryption Algorithm
                          </Button>
                        )}
                        {domain.shardDistribution < 128 && (
                          <Button variant="outline" className="w-full justify-start">
                            <Layers className="h-4 w-4 mr-2" />
                            Increase Fractal Shard Distribution
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Quantum Threat Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <Shield className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">Quantum-Safe Status: Secure</h4>
                        <p className="text-sm text-muted-foreground">
                          Your domain is currently protected against all known quantum computing threats
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Shor's Algorithm Resistance</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">Strong</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Grover's Algorithm Resistance</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">Strong</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">BQP Class Attack Resistance</span>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">Strong</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="hosting" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      Quantum-Secure Hosting
                    </CardTitle>
                    <CardDescription>
                      Configure decentralized hosting with quantum-resistant content delivery
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ipfs-hash">IPFS Content Hash</Label>
                        <div className="flex mt-1.5">
                          <Input 
                            id="ipfs-hash" 
                            placeholder="QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco" 
                          />
                          <Button variant="outline" size="sm" className="ml-2 whitespace-nowrap">
                            Upload Content
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Content will be distributed across the fractal network
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="server-ip">Traditional Server IP (Optional)</Label>
                        <div className="flex mt-1.5">
                          <Input 
                            id="server-ip" 
                            placeholder="123.45.67.89" 
                          />
                          <Button variant="outline" size="sm" className="ml-2 whitespace-nowrap">
                            Verify
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          For hybrid deployments with traditional servers
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="quantum-cdn">Quantum-Resistant CDN</Label>
                          <p className="text-xs text-muted-foreground">
                            Enables content delivery with post-quantum encryption
                          </p>
                        </div>
                        <Switch id="quantum-cdn" checked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="fractal-distribution">Fractal Distribution</Label>
                          <p className="text-xs text-muted-foreground">
                            Number of fractal shards to distribute content across
                          </p>
                        </div>
                        <div className="w-[180px]">
                          <div className="flex items-center gap-2">
                            <Slider
                              id="fractal-distribution"
                              min={32}
                              max={128}
                              step={32}
                              value={[128]}
                              className="flex-1"
                            />
                            <span className="w-12 text-center text-sm">128</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="auto-scaling">Automatic Scaling</Label>
                          <p className="text-xs text-muted-foreground">
                            Dynamically adjust resources based on traffic
                          </p>
                        </div>
                        <Switch id="auto-scaling" checked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="quantum-firewall">Quantum-Secure Firewall</Label>
                          <p className="text-xs text-muted-foreground">
                            Protect against quantum and classical attack vectors
                          </p>
                        </div>
                        <Select defaultValue="maximum">
                          <SelectTrigger id="quantum-firewall" className="w-[180px]">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="enhanced">Enhanced</SelectItem>
                            <SelectItem value="maximum">Maximum</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button>
                        Update Hosting Configuration
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      Hosting Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Latency</span>
                          <span className="text-sm">{hostingStats.queryLatency} ms</span>
                        </div>
                        <Progress value={100 - (hostingStats.queryLatency / 100 * 100)} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Availability</span>
                          <span className="text-sm">{hostingStats.availabilityScore}%</span>
                        </div>
                        <Progress value={hostingStats.availabilityScore} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Shard Distribution</span>
                          <span className="text-sm">{hostingStats.fractalNodeCount} nodes</span>
                        </div>
                        <Progress value={(hostingStats.fractalNodeCount / 128) * 100} className="h-2" />
                      </div>
                      
                      <div className="pt-2">
                        <h4 className="text-sm font-medium mb-2">Recent Statistics</h4>
                        <dl className="grid grid-cols-2 gap-y-2">
                          <dt className="text-sm text-muted-foreground">Total Queries</dt>
                          <dd className="text-sm font-medium">{hostingStats.fractalQueryCount.toLocaleString()}</dd>
                          <dt className="text-sm text-muted-foreground">Bandwidth Used</dt>
                          <dd className="text-sm font-medium">{hostingStats.bandwidth}</dd>
                          <dt className="text-sm text-muted-foreground">Unique Visitors</dt>
                          <dd className="text-sm font-medium">{hostingStats.visitors.toLocaleString()}</dd>
                          <dt className="text-sm text-muted-foreground">Uptime</dt>
                          <dd className="text-sm font-medium">{hostingStats.uptime}%</dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="h-5 w-5" />
                      Domain Renewal
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Current Expiration Date</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(domain.expiresAt)}
                        </p>
                      </div>
                      <Button>
                        Renew Domain
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-5 w-5" />
                      Domain Resolvers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {domain.resolvers.map((resolver, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                          <span className="text-sm font-medium">{resolver}</span>
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input placeholder="Add a new resolver" />
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Share2 className="h-5 w-5" />
                      Domain Transfer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Current Owner</h4>
                        <p className="text-sm text-muted-foreground">
                          {domain.owner.slice(0, 8)}...{domain.owner.slice(-6)}
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            Transfer Domain
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Transfer {domain.name}</DialogTitle>
                            <DialogDescription>
                              This will transfer ownership of your domain to another address.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="new-owner">New Owner Address</Label>
                              <Input id="new-owner" placeholder="0x..." />
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 p-3 rounded-md text-sm">
                              <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                              Warning: This action cannot be undone. Please verify the recipient address.
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button variant="destructive">Transfer Domain</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                      <X className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive" className="w-full">
                      Delete Domain
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Warning: This will permanently delete your domain and all associated data.
                      This action cannot be undone.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Main Domains page component
const Domains: React.FC = () => {
  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quantum-Secure Domains</h1>
          <p className="text-muted-foreground">
            Register and manage .trust domains with quantum-resistant security
          </p>
        </div>
      </div>
      
      <div className="grid gap-6">
        <DomainSearch />
        <DomainManagement />
      </div>
    </div>
  );
};

export default Domains;