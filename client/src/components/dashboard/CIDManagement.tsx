import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCidEntries, createCidEntry, updateCidEntryStatus } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Hash, Database, FileCode, FileText, RotateCw, 
  Check, Shuffle, Clock, Search, Shield, Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { timeAgo, generateCID } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { CidEntry } from '@/types/wallet';

const CIDManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCid, setSelectedCid] = useState<CidEntry | null>(null);
  const [fractalVisualization, setFractalVisualization] = useState(false);
  
  const { data: cidEntries, isLoading, error } = useQuery({
    queryKey: ['/api/cids'],
    queryFn: fetchCidEntries
  });

  const generateNewCidMutation = useMutation({
    mutationFn: (newEntry: any) => createCidEntry(newEntry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cids'] });
      toast({
        title: "Fractal CID Generated",
        description: "New recursive fractal CID has been created successfully",
      });
      setFractalVisualization(true);
      
      // Reset visualization after animation completes
      setTimeout(() => {
        setFractalVisualization(false);
      }, 3000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate CID: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  });
  
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      updateCidEntryStatus(id, status as 'active' | 'syncing' | 'inactive'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cids'] });
      toast({
        title: "Status Updated",
        description: "CID entry status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  });

  const handleGenerateNewCID = () => {
    // Generate a random type for demo
    const types = ['wallet_backup', 'smart_contract', 'transaction_log'];
    const type = types[Math.floor(Math.random() * types.length)] as 'wallet_backup' | 'smart_contract' | 'transaction_log';
    
    generateNewCidMutation.mutate({
      userId: 1, // Demo user
      cid: generateCID(),
      type,
      status: 'active',
    });
  };
  
  const handleStatusChange = (id: number, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };
  
  const handleViewDetails = (entry: CidEntry) => {
    setSelectedCid(entry);
  };
  
  const closeDetails = () => {
    setSelectedCid(null);
  };
  
  // Filter CIDs based on active tab
  const getFilteredCids = () => {
    if (!cidEntries) return [];
    if (activeTab === 'all') return cidEntries;
    return cidEntries.filter(entry => entry.type === activeTab);
  };
  
  // Calculate CID hierarchy visualization (recursive structure)
  const getCidHierarchy = (cidString: string) => {
    // Create a simulated hierarchical structure from the CID
    const segments = [
      cidString.substring(0, 10),
      cidString.substring(10, 20),
      cidString.substring(20)
    ];
    
    return segments;
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Recursive Fractal CID Management</h3>
            <Skeleton className="h-9 w-36" />
          </div>
          
          <div className="overflow-x-auto">
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Recursive Fractal CID Management</h3>
            <Button onClick={handleGenerateNewCID}>Generate New CID</Button>
          </div>
          
          <div className="p-4 text-destructive text-sm">
            Failed to load CID entries: {(error as Error).message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-foreground flex items-center">
              <Layers className="w-5 h-5 mr-2 text-primary" />
              Recursive Fractal CID Management
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage distributed content identifiers with quantum-resistant fractal structures
            </p>
          </div>
          <Button 
            onClick={handleGenerateNewCID} 
            disabled={generateNewCidMutation.isPending}
            className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
          >
            {generateNewCidMutation.isPending ? (
              <>
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Hash className="mr-2 h-4 w-4" />
                Generate New Fractal CID
              </>
            )}
          </Button>
        </div>
        
        {/* Fractal visualization animation */}
        {fractalVisualization && (
          <div className="relative w-full h-24 mb-4 overflow-hidden bg-gradient-to-r from-background/50 to-background rounded-lg border border-border">
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <motion.div 
                  className="flex items-center justify-center mb-2"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                >
                  <div className="relative">
                    <motion.div 
                      className="absolute -inset-1"
                      animate={{ 
                        boxShadow: ['0 0 10px rgba(106, 90, 205, 0.5)', '0 0 20px rgba(106, 90, 205, 0.8)', '0 0 10px rgba(106, 90, 205, 0.5)'] 
                      }}
                      transition={{ duration: 2, repeat: 1, repeatType: 'reverse' }}
                    />
                    <Layers className="w-12 h-12 text-primary" />
                  </div>
                </motion.div>
                <motion.p 
                  className="text-sm text-foreground"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 3 }}
                >
                  Recursive fractal CID generated successfully
                </motion.p>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* CID Filtering Tabs */}
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full mb-4"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All CIDs</TabsTrigger>
            <TabsTrigger value="wallet_backup">Wallet Backups</TabsTrigger>
            <TabsTrigger value="smart_contract">Smart Contracts</TabsTrigger>
            <TabsTrigger value="transaction_log">Transaction Logs</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* CID details modal */}
        {selectedCid && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={closeDetails}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-background rounded-lg shadow-lg max-w-2xl w-full p-6 m-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Fractal CID Details</h3>
                <Button variant="ghost" size="sm" onClick={closeDetails}>
                  <Check className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {selectedCid.type === 'wallet_backup' ? (
                    <Database className="w-10 h-10 text-primary" />
                  ) : selectedCid.type === 'smart_contract' ? (
                    <FileCode className="w-10 h-10 text-primary" />
                  ) : (
                    <FileText className="w-10 h-10 text-primary" />
                  )}
                  
                  <div>
                    <p className="font-medium">
                      {selectedCid.type === 'wallet_backup' ? 'Wallet Backup' :
                       selectedCid.type === 'smart_contract' ? 'Smart Contract' :
                       'Transaction Log'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Created {timeAgo(selectedCid.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="bg-background/50 p-4 rounded-md border border-border">
                  <p className="text-sm font-semibold mb-2">Complete CID</p>
                  <p className="font-mono text-xs break-all">{selectedCid.cid}</p>
                </div>
                
                <div>
                  <p className="text-sm font-semibold mb-2">Recursive Structure</p>
                  <div className="bg-background/50 p-4 rounded-md border border-border">
                    <div className="flex flex-col space-y-2">
                      {getCidHierarchy(selectedCid.cid).map((segment, index) => (
                        <div key={index} className="flex items-center">
                          <div 
                            className={`w-${index + 1} h-4 border-l-2 border-t-2 border-primary/70 mr-2`}
                            style={{ width: `${(index + 1) * 12}px` }}
                          />
                          <code className="text-xs font-mono">{segment}</code>
                          {index === 0 && <Badge className="ml-2 text-[10px]">Root</Badge>}
                          {index === 1 && <Badge variant="outline" className="ml-2 text-[10px]">Subnode</Badge>}
                          {index === 2 && <Badge variant="secondary" className="ml-2 text-[10px]">Leaf</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(
                      selectedCid.id, 
                      selectedCid.status === 'active' ? 'inactive' : 'active'
                    )}
                    disabled={updateStatusMutation.isPending}
                  >
                    {selectedCid.status === 'active' ? (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Activate
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedCid.id, 'syncing')}
                    disabled={updateStatusMutation.isPending || selectedCid.status === 'syncing'}
                  >
                    <Shuffle className="mr-2 h-4 w-4" />
                    Sync
                  </Button>
                  
                  <Button
                    variant="default"
                    size="sm"
                    className="ml-auto"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Verify
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">CID</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">Type</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">Created</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence>
                {getFilteredCids().map((entry) => (
                  <motion.tr 
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-background/60"
                  >
                    <td className="px-4 py-3 text-sm font-mono text-foreground flex items-center">
                      {entry.type === 'wallet_backup' ? (
                        <Database className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                      ) : entry.type === 'smart_contract' ? (
                        <FileCode className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                      )}
                      {`${entry.cid.substring(0, 14)}...`}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {entry.type === 'wallet_backup' ? 'Wallet Backup' :
                       entry.type === 'smart_contract' ? 'Smart Contract' :
                       'Transaction Log'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge 
                        variant={entry.status === 'active' ? 'default' : entry.status === 'syncing' ? 'outline' : 'secondary'}
                        className={`text-xs px-2 py-0.5 flex items-center w-fit ${
                          entry.status === 'active' ? 'bg-green-500/10 text-green-500' : 
                          entry.status === 'syncing' ? 'bg-amber-500/10 text-amber-500' : 
                          'bg-muted text-muted-foreground'
                        }`}
                      >
                        {entry.status === 'active' ? (
                          <Check className="w-3 h-3 mr-1" />
                        ) : entry.status === 'syncing' ? (
                          <RotateCw className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Clock className="w-3 h-3 mr-1" />
                        )}
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{timeAgo(entry.createdAt)}</td>
                    <td className="px-4 py-3 text-sm">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary/80"
                        onClick={() => handleViewDetails(entry)}
                      >
                        View Details
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              
              {getFilteredCids().length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <Shield className="w-8 h-8 mb-2 text-muted-foreground/60" />
                      <p>No CID entries found</p>
                      <p className="text-xs mt-1">Generate a new fractal CID to get started</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CIDManagement;
