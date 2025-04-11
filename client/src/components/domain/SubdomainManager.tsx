import React, { useState } from 'react';
import { PlusCircle, Copy, ExternalLink, Shield, Server, Lock, Globe, Edit, Trash2, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { toast } from '../../hooks/use-toast';
import { type SubdomainRecord, type QuantumDomainRecord, useQuantumDomain } from '../../contexts/QuantumDomainContext';

interface SubdomainManagerProps {
  domain: QuantumDomainRecord;
  onUpdate?: () => void;
}

// Format date string to a readable format
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Get status badge variant and text based on enabled state
const getStatusBadge = (enabled: boolean) => {
  if (enabled) {
    return { variant: 'default' as const, text: 'Active' };
  }
  return { variant: 'secondary' as const, text: 'Inactive' };
};

// Get subdomain type human-readable name
const getSubdomainTypeLabel = (type: SubdomainRecord['type']) => {
  switch (type) {
    case 'a':
      return 'A Record (IP Address)';
    case 'cname':
      return 'CNAME Record (Domain Alias)';
    case 'ipfs':
      return 'IPFS (Decentralized Storage)';
    case 'fractalNode':
      return 'Fractal Node (Quantum Network)';
    case 'quantumSecure':
      return 'Quantum Secure Domain';
    default:
      return type;
  }
};

// Get color for security level
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

const SubdomainManager: React.FC<SubdomainManagerProps> = ({ domain, onUpdate }) => {
  const { isLoading, error } = useQuantumDomain();
  const [activeTab, setActiveTab] = useState('subdomains');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSubdomain, setSelectedSubdomain] = useState<SubdomainRecord | null>(null);
  
  const [newSubdomain, setNewSubdomain] = useState<{
    prefix: string; 
    pointsTo: string;
    type: SubdomainRecord['type'];
    quantumSecurityLevel: 'standard' | 'enhanced' | 'maximum';
    customSSL: boolean;
  }>({
    prefix: '',
    pointsTo: '',
    type: 'a',
    quantumSecurityLevel: 'enhanced',
    customSSL: true
  });
  
  // Handle add subdomain
  const handleAddSubdomain = () => {
    // Form validation
    if (!newSubdomain.prefix.trim()) {
      toast({
        title: "Error",
        description: "Subdomain prefix is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!newSubdomain.pointsTo.trim()) {
      toast({
        title: "Error",
        description: "Destination is required",
        variant: "destructive"
      });
      return;
    }
    
    // In a real application, this would call an API
    // Create the subdomain record
    const newRecord: SubdomainRecord = {
      name: `${newSubdomain.prefix}.${domain.name}`,
      createdAt: new Date().toISOString(),
      pointsTo: newSubdomain.pointsTo,
      type: newSubdomain.type,
      quantumSecurityLevel: newSubdomain.quantumSecurityLevel,
      shardDistribution: newSubdomain.quantumSecurityLevel === 'maximum' ? 128 : 
                         newSubdomain.quantumSecurityLevel === 'enhanced' ? 64 : 32,
      enabled: true,
      customSSL: newSubdomain.customSSL
    };
    
    // This is a simulated operation - in a real app this would make an API call
    // Add to domain.subdomains
    domain.subdomains.push(newRecord);
    
    // Notify success
    toast({
      title: "Subdomain Created",
      description: `${newRecord.name} has been successfully created`,
    });
    
    // Reset form
    setNewSubdomain({
      prefix: '',
      pointsTo: '',
      type: 'a',
      quantumSecurityLevel: 'enhanced',
      customSSL: true
    });
    
    // Close dialog
    setIsAddDialogOpen(false);
    
    // Execute callback if provided
    if (onUpdate) onUpdate();
  };
  
  // Handle edit subdomain
  const handleEditSubdomain = () => {
    if (!selectedSubdomain) return;
    
    // Find the subdomain in the array
    const index = domain.subdomains.findIndex(s => s.name === selectedSubdomain.name);
    if (index !== -1) {
      // Update the subdomain
      domain.subdomains[index] = selectedSubdomain;
      
      // Notify success
      toast({
        title: "Subdomain Updated",
        description: `${selectedSubdomain.name} has been successfully updated`,
      });
      
      // Close dialog
      setIsEditDialogOpen(false);
      
      // Reset selected subdomain
      setSelectedSubdomain(null);
      
      // Execute callback if provided
      if (onUpdate) onUpdate();
    }
  };
  
  // Handle delete subdomain
  const handleDeleteSubdomain = (name: string) => {
    // Find the subdomain index
    const index = domain.subdomains.findIndex(s => s.name === name);
    if (index !== -1) {
      // Remove the subdomain
      domain.subdomains.splice(index, 1);
      
      // Notify success
      toast({
        title: "Subdomain Deleted",
        description: `${name} has been successfully deleted`,
      });
      
      // Execute callback if provided
      if (onUpdate) onUpdate();
    }
  };
  
  // Handle toggle subdomain status
  const handleToggleStatus = (name: string) => {
    // Find the subdomain
    const subdomain = domain.subdomains.find(s => s.name === name);
    if (subdomain) {
      // Toggle enabled status
      subdomain.enabled = !subdomain.enabled;
      
      // Notify success
      toast({
        title: subdomain.enabled ? "Subdomain Activated" : "Subdomain Deactivated",
        description: `${name} has been ${subdomain.enabled ? 'activated' : 'deactivated'}`,
      });
      
      // Execute callback if provided
      if (onUpdate) onUpdate();
    }
  };
  
  // Copy subdomain URL to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description: "URL copied to clipboard",
      });
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Subdomain Manager</CardTitle>
            <CardDescription>
              Manage subdomains for {domain.name} with quantum security
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <PlusCircle className="h-4 w-4" />
                Add Subdomain
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Subdomain</DialogTitle>
                <DialogDescription>
                  Add a new subdomain to {domain.name} with quantum-secure protection
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4 space-y-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="col-span-1">
                    <Label htmlFor="subdomain-prefix">Subdomain</Label>
                    <Input 
                      id="subdomain-prefix"
                      value={newSubdomain.prefix}
                      onChange={(e) => setNewSubdomain(prev => ({ ...prev, prefix: e.target.value }))}
                      className="mt-1"
                      placeholder="blog"
                    />
                  </div>
                  <div className="col-span-2 pt-7">
                    <span className="text-muted-foreground">.{domain.name}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-3">
                    <Label htmlFor="subdomain-type">Type</Label>
                    <Select 
                      value={newSubdomain.type}
                      onValueChange={(value) => setNewSubdomain(prev => ({ 
                        ...prev, 
                        type: value as SubdomainRecord['type'] 
                      }))}
                    >
                      <SelectTrigger id="subdomain-type" className="mt-1">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a">A Record (IP)</SelectItem>
                        <SelectItem value="cname">CNAME (Alias)</SelectItem>
                        <SelectItem value="ipfs">IPFS Storage</SelectItem>
                        <SelectItem value="fractalNode">Fractal Node</SelectItem>
                        <SelectItem value="quantumSecure">Quantum Secure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-9">
                    <Label htmlFor="points-to">Points To</Label>
                    <Input 
                      id="points-to"
                      value={newSubdomain.pointsTo}
                      onChange={(e) => setNewSubdomain(prev => ({ ...prev, pointsTo: e.target.value }))}
                      className="mt-1"
                      placeholder={
                        newSubdomain.type === 'a' ? '203.0.113.15' :
                        newSubdomain.type === 'cname' ? 'example.com' :
                        newSubdomain.type === 'ipfs' ? 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco' :
                        newSubdomain.type === 'fractalNode' ? 'fractal://node-cluster/myservice' :
                        'quantum://secure-endpoint/myapp'
                      }
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-12 items-center gap-4">
                  <div className="col-span-6">
                    <Label htmlFor="security-level">Quantum Security Level</Label>
                    <Select 
                      value={newSubdomain.quantumSecurityLevel}
                      onValueChange={(value) => setNewSubdomain(prev => ({ 
                        ...prev, 
                        quantumSecurityLevel: value as 'standard' | 'enhanced' | 'maximum' 
                      }))}
                    >
                      <SelectTrigger id="security-level" className="mt-1">
                        <SelectValue placeholder="Select security level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (32 shards)</SelectItem>
                        <SelectItem value="enhanced">Enhanced (64 shards)</SelectItem>
                        <SelectItem value="maximum">Maximum (128 shards)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-6 flex flex-col justify-end">
                    <div className="flex items-center space-x-2 mt-7">
                      <Switch 
                        id="custom-ssl" 
                        checked={newSubdomain.customSSL}
                        onCheckedChange={(checked) => setNewSubdomain(prev => ({ ...prev, customSSL: checked }))}
                      />
                      <Label htmlFor="custom-ssl">Enable Quantum SSL</Label>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSubdomain}>Create Subdomain</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subdomains">All Subdomains</TabsTrigger>
            <TabsTrigger value="quantum">Quantum Security</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent>
        <TabsContent value="subdomains" className="space-y-4">
          {domain.subdomains.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <Globe className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-1">No Subdomains Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Add your first subdomain to start utilizing quantum-secure hosting with fractal distribution across the network.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Your First Subdomain
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Subdomain</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead className="w-[100px]">Security</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[120px]">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domain.subdomains.map((subdomain) => (
                    <TableRow key={subdomain.name}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => copyToClipboard(`https://${subdomain.name}`)}
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy URL</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <span>{subdomain.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getSubdomainTypeLabel(subdomain.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs truncate max-w-[120px]" title={subdomain.pointsTo}>
                        {subdomain.pointsTo}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getSecurityLevelColor(subdomain.quantumSecurityLevel)}>
                          {subdomain.quantumSecurityLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={subdomain.enabled ? "default" : "secondary"}>
                          {subdomain.enabled ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDate(subdomain.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => window.open(`https://${subdomain.name}`, '_blank')}
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Visit</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    setSelectedSubdomain(subdomain);
                                    setIsEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleToggleStatus(subdomain.name)}
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{subdomain.enabled ? 'Deactivate' : 'Activate'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => handleDeleteSubdomain(subdomain.name)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="quantum" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Quantum Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Domain Encryption</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                      {domain.encryptionAlgorithm === 'hybrid' ? 'Multi-Algorithm' : domain.encryptionAlgorithm}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Shard Distribution</span>
                    <Badge variant="outline">
                      {domain.shardDistribution} Shards
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quantum Resistance</span>
                    <Badge variant="outline" className={getSecurityLevelColor(domain.quantumSecurityLevel)}>
                      {domain.quantumSecurityLevel} Protection
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">SSL Protection</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500">
                      Quantum-Resistant TLS
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  <Server className="h-4 w-4 mr-2" />
                  Subdomain Security Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Subdomains</span>
                    <Badge variant="outline">{domain.subdomains.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Maximum Security</span>
                    <Badge variant="outline">
                      {domain.subdomains.filter(s => s.quantumSecurityLevel === 'maximum').length} Subdomains
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Custom SSL Enabled</span>
                    <Badge variant="outline">
                      {domain.subdomains.filter(s => s.customSSL).length} Subdomains
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Fractal Nodes</span>
                    <Badge variant="outline">
                      {domain.subdomains.filter(s => s.type === 'fractalNode').length} Subdomains
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Security Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {domain.subdomains.some(s => s.quantumSecurityLevel !== 'maximum') && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 rounded-md text-sm">
                    <div className="font-medium">Upgrade Subdomain Security</div>
                    <p className="text-xs mt-1">
                      {domain.subdomains.filter(s => s.quantumSecurityLevel !== 'maximum').length} subdomains are not using maximum quantum security. Consider upgrading for enhanced protection.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">Upgrade All</Button>
                  </div>
                )}
                
                {domain.subdomains.some(s => !s.customSSL) && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-200 rounded-md text-sm">
                    <div className="font-medium">Enable Quantum SSL</div>
                    <p className="text-xs mt-1">
                      {domain.subdomains.filter(s => !s.customSSL).length} subdomains do not have quantum-resistant SSL certificates. Enable SSL for all connections.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">Enable All</Button>
                  </div>
                )}
                
                {domain.encryptionAlgorithm !== 'hybrid' && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-200 rounded-md text-sm">
                    <div className="font-medium">Upgrade Root Domain Encryption</div>
                    <p className="text-xs mt-1">
                      Your root domain is using {domain.encryptionAlgorithm} algorithm. Upgrade to hybrid multi-algorithm for maximum quantum resistance.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">Upgrade Now</Button>
                  </div>
                )}
                
                {!domain.subdomains.some(s => s.type === 'fractalNode') && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200 rounded-md text-sm">
                    <div className="font-medium">Add Fractal Node Subdomain</div>
                    <p className="text-xs mt-1">
                      Deploy a service on the fractal node network for maximum distribution and quantum-secure availability.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">Add Node</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  12,483
                  <span className="text-green-500 text-xs ml-2">+8.2%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last 30 days across all subdomains
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Bandwidth Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  1.82 TB
                  <span className="text-amber-500 text-xs ml-2">+12.4%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Split across fractal nodes and IPFS
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Attack Attempts Blocked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  947
                  <span className="text-red-500 text-xs ml-2">+23.5%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Quantum resistant firewall protection
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subdomain Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {domain.subdomains.map(subdomain => (
                  <div key={subdomain.name} className="flex flex-col space-y-1">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Badge variant={subdomain.enabled ? "default" : "secondary"} className="mr-2 h-2 w-2 rounded-full p-1" />
                        <span>{subdomain.name}</span>
                      </div>
                      <span className="text-sm">
                        {Math.floor(Math.random() * 3000 + 500).toLocaleString()} visits
                      </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${Math.random() * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </CardContent>
      
      {/* Edit Subdomain Dialog */}
      <Dialog open={isEditDialogOpen && selectedSubdomain !== null} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Subdomain</DialogTitle>
            <DialogDescription>
              Update settings for {selectedSubdomain?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubdomain && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-12 items-center gap-4">
                <div className="col-span-3">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select 
                    value={selectedSubdomain.type}
                    onValueChange={(value) => setSelectedSubdomain({
                      ...selectedSubdomain,
                      type: value as SubdomainRecord['type']
                    })}
                  >
                    <SelectTrigger id="edit-type" className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a">A Record (IP)</SelectItem>
                      <SelectItem value="cname">CNAME (Alias)</SelectItem>
                      <SelectItem value="ipfs">IPFS Storage</SelectItem>
                      <SelectItem value="fractalNode">Fractal Node</SelectItem>
                      <SelectItem value="quantumSecure">Quantum Secure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-9">
                  <Label htmlFor="edit-points-to">Points To</Label>
                  <Input 
                    id="edit-points-to"
                    value={selectedSubdomain.pointsTo}
                    onChange={(e) => setSelectedSubdomain({
                      ...selectedSubdomain,
                      pointsTo: e.target.value
                    })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-12 items-center gap-4">
                <div className="col-span-6">
                  <Label htmlFor="edit-security-level">Quantum Security Level</Label>
                  <Select 
                    value={selectedSubdomain.quantumSecurityLevel}
                    onValueChange={(value) => setSelectedSubdomain({
                      ...selectedSubdomain,
                      quantumSecurityLevel: value as 'standard' | 'enhanced' | 'maximum',
                      shardDistribution: value === 'maximum' ? 128 : value === 'enhanced' ? 64 : 32
                    })}
                  >
                    <SelectTrigger id="edit-security-level" className="mt-1">
                      <SelectValue placeholder="Select security level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (32 shards)</SelectItem>
                      <SelectItem value="enhanced">Enhanced (64 shards)</SelectItem>
                      <SelectItem value="maximum">Maximum (128 shards)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-6">
                  <div className="flex items-center justify-between space-x-2 mt-7">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="edit-status" 
                        checked={selectedSubdomain.enabled}
                        onCheckedChange={(checked) => setSelectedSubdomain({
                          ...selectedSubdomain,
                          enabled: checked
                        })}
                      />
                      <Label htmlFor="edit-status">Active</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="edit-ssl" 
                        checked={selectedSubdomain.customSSL ?? false}
                        onCheckedChange={(checked) => setSelectedSubdomain({
                          ...selectedSubdomain,
                          customSSL: checked
                        })}
                      />
                      <Label htmlFor="edit-ssl">SSL</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubdomain}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SubdomainManager;