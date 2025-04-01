import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCidEntries, createCidEntry } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { timeAgo, generateCID } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const CIDManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: cidEntries, isLoading, error } = useQuery({
    queryKey: ['/api/cids'],
    queryFn: fetchCidEntries
  });

  const generateNewCidMutation = useMutation({
    mutationFn: (newEntry: any) => createCidEntry(newEntry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cids'] });
      toast({
        title: "CID Generated",
        description: "New recursive fractal CID has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate CID: ${(error as Error).message}`,
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
      data: {}
    });
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
          <h3 className="font-bold text-foreground">Recursive Fractal CID Management</h3>
          <Button 
            onClick={handleGenerateNewCID} 
            disabled={generateNewCidMutation.isPending}
            className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90"
          >
            {generateNewCidMutation.isPending ? 'Generating...' : 'Generate New CID'}
          </Button>
        </div>
        
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
              {cidEntries?.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 text-sm font-mono text-foreground">{entry.cid}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {entry.type === 'wallet_backup' ? 'Wallet Backup' :
                     entry.type === 'smart_contract' ? 'Smart Contract' :
                     'Transaction Log'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge 
                      variant={entry.status === 'active' ? 'success' : entry.status === 'syncing' ? 'warning' : 'default'}
                      className="text-xs px-2 py-0.5"
                    >
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{timeAgo(entry.createdAt)}</td>
                  <td className="px-4 py-3 text-sm text-primary cursor-pointer">View</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CIDManagement;
