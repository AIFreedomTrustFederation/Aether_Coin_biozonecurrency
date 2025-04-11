import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSmartContracts, createSmartContract, updateContractStatus } from '@/lib/api';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileMenu from '@/components/layout/MobileMenu';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import {
  FileCode,
  Copy,
  RotateCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  PlusCircle,
  Lock,
  Zap,
  Hash,
  Server,
  Code2,
  Search,
  Trash2
} from 'lucide-react';
import { formatCrypto, shortenAddress, timeAgo } from '@/lib/utils';

const Contracts = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deployDialogOpen, setDeployDialogOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  
  // New contract form state
  const [newContract, setNewContract] = useState({
    name: '',
    address: '',
    chain: 'ethereum'
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  // Fetch smart contracts
  const { data: contracts, isLoading, error } = useQuery({
    queryKey: ['/api/contracts'],
    queryFn: fetchSmartContracts
  });
  
  // Create smart contract mutation
  const createContractMutation = useMutation({
    mutationFn: (contractData: any) => createSmartContract(contractData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      toast({
        title: "Smart Contract Deployed",
        description: "New contract has been successfully deployed and verified",
      });
      setDeployDialogOpen(false);
      setIsDeploying(false);
      setNewContract({ name: '', address: '', chain: 'ethereum' });
    },
    onError: (error) => {
      toast({
        title: "Deployment Failed",
        description: `Error deploying smart contract: ${(error as Error).message}`,
        variant: "destructive"
      });
      setIsDeploying(false);
    }
  });
  
  // Update contract status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => updateContractStatus(id, status as 'active' | 'pending' | 'inactive'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
      toast({
        title: "Status Updated",
        description: "Smart contract status has been successfully updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: `Error updating status: ${(error as Error).message}`,
        variant: "destructive"
      });
    }
  });
  
  // Filter contracts based on status and search term
  const filteredContracts = contracts?.filter(contract => {
    // Filter by status
    if (filter !== 'all' && contract.status !== filter) {
      return false;
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        contract.name.toLowerCase().includes(term) ||
        contract.address.toLowerCase().includes(term) ||
        contract.chain.toLowerCase().includes(term)
      );
    }
    
    return true;
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewContract(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle contract deployment
  const handleDeploy = () => {
    if (!newContract.name || !newContract.address || !newContract.chain) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields to deploy a contract",
        variant: "destructive"
      });
      return;
    }
    
    setIsDeploying(true);
    
    createContractMutation.mutate({
      userId: 1, // Demo user
      name: newContract.name,
      address: newContract.address,
      chain: newContract.chain,
      status: 'pending'
    });
  };
  
  // Handle status change
  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };
  
  // Copy address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Address Copied",
      description: "Contract address copied to clipboard",
    });
  };

  // Render smart contracts
  const renderContracts = () => {
    if (isLoading) {
      return Array(3).fill(0).map((_, index) => (
        <Card key={index} className="mb-4">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-6 w-48 mt-3" />
            <Skeleton className="h-4 w-72 mt-2" />
            <div className="flex justify-between items-center mt-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-32" />
            </div>
          </CardContent>
        </Card>
      ));
    }
    
    if (error) {
      return (
        <Card className="mb-4">
          <CardContent className="p-5">
            <div className="flex items-center text-destructive">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <p>Failed to load smart contracts: {(error as Error).message}</p>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (!filteredContracts?.length) {
      return (
        <Card className="mb-4">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileCode className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No contracts found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {searchTerm 
                ? `No results match your search criteria "${searchTerm}"`
                : filter !== 'all'
                  ? `No ${filter} contracts found. Try a different filter.`
                  : 'Deploy your first smart contract with quantum-resistant security.'}
            </p>
            <Button onClick={() => setDeployDialogOpen(true)} className="mt-4">
              <PlusCircle className="w-4 h-4 mr-2" />
              Deploy New Contract
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <AnimatePresence>
        {filteredContracts?.map((contract, index) => (
          <motion.div
            key={contract.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="mb-4 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      contract.chain === 'ethereum' 
                        ? 'bg-blue-500/10' 
                        : contract.chain === 'solana' 
                        ? 'bg-purple-500/10' 
                        : 'bg-amber-500/10'
                    }`}>
                      <Code2 className={`w-6 h-6 ${
                        contract.chain === 'ethereum' 
                          ? 'text-blue-500' 
                          : contract.chain === 'solana' 
                          ? 'text-purple-500' 
                          : 'text-amber-500'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">
                        {contract.name}
                      </h3>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <span className="font-mono">{shortenAddress(contract.address, 8, 8)}</span>
                        <button 
                          onClick={() => copyToClipboard(contract.address)}
                          className="ml-1 text-primary/70 hover:text-primary focus:outline-none"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center mt-2">
                        <Badge 
                          variant="outline" 
                          className="text-xs mr-2"
                        >
                          {contract.chain.charAt(0).toUpperCase() + contract.chain.slice(1)}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {contract.lastInteraction 
                            ? `Last activity: ${timeAgo(contract.lastInteraction)}` 
                            : `Created: ${timeAgo(contract.createdAt)}`}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      contract.status === 'active' 
                        ? 'bg-green-500/10 text-green-500' 
                        : contract.status === 'pending' 
                        ? 'bg-amber-500/10 text-amber-500' 
                        : 'bg-red-500/10 text-red-500'
                    }`}
                  >
                    {contract.status === 'active' ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : contract.status === 'pending' ? (
                      <Clock className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                  </Badge>
                </div>
                
                {/* Contract Actions */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex gap-2">
                    {contract.status === 'active' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleStatusChange(contract.id, 'inactive')}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Lock className="w-3.5 h-3.5 mr-2" />
                        Pause
                      </Button>
                    ) : contract.status === 'inactive' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleStatusChange(contract.id, 'active')}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Zap className="w-3.5 h-3.5 mr-2" />
                        Activate
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="opacity-60 cursor-not-allowed"
                        disabled
                      >
                        <RotateCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                        Deploying...
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Hash className="w-3.5 h-3.5 mr-2" />
                      Verify
                    </Button>
                    <Button variant="ghost" size="sm" className="text-primary">
                      <Server className="w-3.5 h-3.5 mr-2" />
                      Interact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header toggleMobileMenu={toggleMobileMenu} />
        
        {/* Smart Contracts Page */}
        <main className="flex-1 overflow-y-auto p-4 bg-background">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-1">Smart Contract Management</h2>
            <p className="text-muted-foreground">
              Deploy and manage quantum-resistant smart contracts across multiple blockchains
            </p>
          </div>
          
          {/* Contract Controls */}
          <Card className="mb-6">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by name, address, chain..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Dialog open={deployDialogOpen} onOpenChange={setDeployDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-1">
                        <PlusCircle className="w-4 h-4 mr-1" />
                        Deploy New Contract
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Deploy Smart Contract</DialogTitle>
                        <DialogDescription>
                          Deploy a new quantum-resistant smart contract with enhanced security features
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Contract Name</Label>
                          <Input 
                            id="name" 
                            name="name"
                            placeholder="e.g. Quantum NFT Marketplace" 
                            value={newContract.name}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="address">Contract Address</Label>
                          <Input 
                            id="address" 
                            name="address"
                            placeholder="e.g. 0x..." 
                            value={newContract.address}
                            onChange={handleInputChange}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="chain">Blockchain</Label>
                          <Tabs 
                            defaultValue="ethereum" 
                            value={newContract.chain}
                            onValueChange={(value) => setNewContract(prev => ({ ...prev, chain: value }))}
                            className="w-full"
                          >
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
                              <TabsTrigger value="solana">Solana</TabsTrigger>
                              <TabsTrigger value="bitcoin">Bitcoin</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeployDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleDeploy} 
                          disabled={isDeploying || !newContract.name || !newContract.address}
                        >
                          {isDeploying ? (
                            <>
                              <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                              Deploying...
                            </>
                          ) : (
                            <>
                              <FileCode className="mr-2 h-4 w-4" />
                              Deploy Contract
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Contract Filters */}
          <Tabs 
            defaultValue="all" 
            value={filter} 
            onValueChange={setFilter} 
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Smart Contracts</h3>
              <div className="flex items-center text-xs text-muted-foreground">
                <FileCode className="w-3.5 h-3.5 mr-1" />
                {isLoading ? 'Loading contracts...' : 
                 `${contracts?.length || 0} contract${contracts?.length !== 1 ? 's' : ''} deployed`}
              </div>
            </div>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="all">All Contracts</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
            
            {renderContracts()}
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Contracts;