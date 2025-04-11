import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Shield, 
  Network, 
  Lock, 
  ArrowRight, 
  RefreshCw, 
  Zap, 
  PlusCircle,
  Clock,
  Server,
  BarChart3,
  Cpu,
  Check
} from 'lucide-react';
import { useQuantumDomain } from '../contexts/QuantumDomainContext';
import SubdomainManager from '../components/domain/SubdomainManager';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { toast } from '../hooks/use-toast';
import { DomainAvailabilityResult } from '../contexts/QuantumDomainContext';

// Format date string to a readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Get days remaining until expiration
const getDaysRemaining = (expiresAt: string) => {
  const today = new Date();
  const expiry = new Date(expiresAt);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get color based on days remaining
const getExpiryColor = (daysRemaining: number) => {
  if (daysRemaining <= 30) return 'text-red-500';
  if (daysRemaining <= 90) return 'text-amber-500';
  return 'text-green-500';
};

// Get security level color
const getSecurityLevelColor = (level: 'standard' | 'enhanced' | 'maximum') => {
  switch (level) {
    case 'standard':
      return 'bg-blue-500/10 text-blue-500';
    case 'enhanced':
      return 'bg-purple-500/10 text-purple-500';
    case 'maximum':
      return 'bg-green-500/10 text-green-500';
  }
};

// Domain list component
const DomainList: React.FC = () => {
  const { userDomains, isLoading, selectDomain, currentDomain } = useQuantumDomain();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Globe className="h-5 w-5" />
          Your Quantum-Secure Domains
        </CardTitle>
        <CardDescription>
          Manage your registered .trust domains with post-quantum encryption
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading your quantum-secured domains...</p>
          </div>
        ) : userDomains.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Domains Found</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              You haven't registered any quantum-secure domains yet. Register your first .trust domain to get started with fractal distribution.
            </p>
            <Button variant="default">Register Your First Domain</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {userDomains.map(domain => (
              <Card 
                key={domain.name} 
                className={`border hover:border-primary/50 cursor-pointer transition-colors ${currentDomain?.name === domain.name ? 'border-primary/50 bg-accent/50' : ''}`}
                onClick={() => selectDomain(domain.name)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Globe className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{domain.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          Registered on {formatDate(domain.registeredAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="outline" className={getSecurityLevelColor(domain.quantumSecurityLevel)}>
                        <Shield className="h-3 w-3 mr-1" />
                        {domain.quantumSecurityLevel} Security
                      </Badge>
                      
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
                        <Network className="h-3 w-3 mr-1" />
                        {domain.shardDistribution} Shards
                      </Badge>
                      
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
                        <Lock className="h-3 w-3 mr-1" />
                        {domain.encryptionAlgorithm === 'hybrid' ? 'Hybrid Encryption' : domain.encryptionAlgorithm}
                      </Badge>
                      
                      <Badge variant="outline" className={getExpiryColor(getDaysRemaining(domain.expiresAt))}>
                        <Clock className="h-3 w-3 mr-1" />
                        Expires in {getDaysRemaining(domain.expiresAt)} days
                      </Badge>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" className="ml-auto">
                        Manage
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-muted-foreground flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Server className="h-3 w-3" />
                      <span>{domain.subdomains.length} Subdomains</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-500" />
                      <span>Quantum Secure</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Cpu className="h-3 w-3" />
                      <span>Fractal Network Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Domain registration component
const DomainRegistration: React.FC = () => {
  const [domainName, setDomainName] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [searchResult, setSearchResult] = useState<DomainAvailabilityResult | null>(null);
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
    setIsChecking(true);
    try {
      if (!domainName) {
        toast({
          title: "Error",
          description: "Please enter a domain name",
          variant: "destructive"
        });
        setIsChecking(false);
        return;
      }
      
      // Add .trust if not present
      const searchName = domainName.endsWith('.trust') ? domainName : `${domainName}.trust`;
      
      const result = await checkDomainAvailability(searchName);
      setSearchResult(result);
      setIsChecking(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while checking domain availability",
        variant: "destructive"
      });
      setIsChecking(false);
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <PlusCircle className="h-5 w-5" />
          Register a New Domain
        </CardTitle>
        <CardDescription>
          Register a new quantum-secure .trust domain with fractal distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="md:col-span-3">
            <Input
              placeholder="Enter your desired domain name (e.g., mydomain.trust)"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isChecking || isLoading} className="w-full">
            {isChecking ? 'Checking...' : 'Check Availability'}
          </Button>
        </form>
        
        {searchResult && (
          <div className="mt-6 p-4 rounded-lg border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-medium">{searchResult.name}</h3>
                {searchResult.available ? (
                  <p className="text-green-500 flex items-center gap-1 mt-1">
                    <Check className="h-4 w-4" />
                    Available for registration
                  </p>
                ) : (
                  <p className="text-red-500 flex items-center gap-1 mt-1">
                    <RefreshCw className="h-4 w-4" />
                    Already registered. Try another name.
                  </p>
                )}
              </div>
              
              {searchResult.available && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Register This Domain</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[550px]">
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
                        <p className="text-xs text-muted-foreground mt-1">
                          Determines how widely your domain is distributed across the fractal network
                        </p>
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
                        <p className="text-xs text-muted-foreground mt-1">
                          Hybrid uses multiple quantum-resistant algorithms for maximum security
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="registration-years">Registration Period</Label>
                        <Select 
                          value={String(registrationOptions.years)}
                          onValueChange={(value) => setRegistrationOptions({
                            ...registrationOptions,
                            years: parseInt(value)
                          })}
                        >
                          <SelectTrigger id="registration-years">
                            <SelectValue placeholder="Select years" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Year</SelectItem>
                            <SelectItem value="2">2 Years</SelectItem>
                            <SelectItem value="3">3 Years</SelectItem>
                            <SelectItem value="5">5 Years</SelectItem>
                            <SelectItem value="10">10 Years</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <div>
                          <Label htmlFor="fractional-ownership">Enable Fractional Ownership</Label>
                          <p className="text-xs text-muted-foreground">
                            Allow domain ownership to be divided and traded as NFTs
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleRegister} disabled={isLoading}>
                        {isLoading ? 'Registering...' : 'Register Domain'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            {!searchResult.available && searchResult.suggestions && searchResult.suggestions.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Available Alternatives:</h4>
                <div className="flex flex-wrap gap-2">
                  {searchResult.suggestions.map((suggestion) => (
                    <Badge 
                      key={suggestion} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-secondary" 
                      onClick={() => setDomainName(suggestion.replace('.trust', ''))}
                    >
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
  );
};

// Domain system stats component
const DomainSystemStats: React.FC = () => {
  const { quantumSecurityStatus } = useQuantumDomain();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Quantum Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              quantumSecurityStatus.threatLevel === 'low' ? 'bg-green-100 text-green-500 dark:bg-green-900/20 dark:text-green-400' :
              quantumSecurityStatus.threatLevel === 'medium' ? 'bg-amber-100 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400' :
              'bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium">
                {quantumSecurityStatus.threatLevel === 'low' ? 'Secured' :
                 quantumSecurityStatus.threatLevel === 'medium' ? 'Warning' : 'Alert'}
              </div>
              <p className="text-xs text-muted-foreground">
                {quantumSecurityStatus.threatLevel === 'low' ? 'Your domains are quantum secure' :
                 quantumSecurityStatus.threatLevel === 'medium' ? 'Some domains need attention' : 
                 'Critical security updates required'}
              </p>
            </div>
          </div>
          
          {quantumSecurityStatus.recommendedUpgrades.length > 0 && (
            <div className="mt-3 text-xs space-y-1">
              <div className="font-medium">Recommended Actions:</div>
              <ul className="space-y-1">
                {quantumSecurityStatus.recommendedUpgrades.map((upgrade, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{upgrade}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Network className="h-4 w-4 mr-2" />
            Fractal Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs">Network Health</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-500">Excellent</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Active Nodes</span>
              <span className="text-xs font-medium">4,928</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Avg. Response Time</span>
              <span className="text-xs font-medium">28ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Quantum Resistance</span>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-500">Level 5</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            System Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs">Global Uptime</span>
              <span className="text-xs font-medium">99.998%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">DNS Propagation</span>
              <span className="text-xs font-medium">100%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Attack Attempts Blocked</span>
              <span className="text-xs font-medium">947 today</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs">Data Availability</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-500">100%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Domains page component
const Domains: React.FC = () => {
  const [activeView, setActiveView] = useState<'manage' | 'register'>('manage');
  const { currentDomain } = useQuantumDomain();
  
  // When a domain is selected, switch to manage view
  useEffect(() => {
    if (currentDomain) {
      setActiveView('manage');
    }
  }, [currentDomain]);
  
  return (
    <div className="container py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Domain Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your quantum-secure domains with fractal distribution
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={activeView === 'manage' ? 'default' : 'outline'}
            onClick={() => setActiveView('manage')}
          >
            <Globe className="h-4 w-4 mr-2" />
            Manage Domains
          </Button>
          <Button 
            variant={activeView === 'register' ? 'default' : 'outline'}
            onClick={() => setActiveView('register')}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Register Domain
          </Button>
        </div>
      </div>
      
      <DomainSystemStats />
      
      {activeView === 'manage' ? (
        <>
          <DomainList />
          
          {currentDomain && (
            <div className="mt-6">
              <SubdomainManager domain={currentDomain} />
            </div>
          )}
        </>
      ) : (
        <DomainRegistration />
      )}
    </div>
  );
};

export default Domains;