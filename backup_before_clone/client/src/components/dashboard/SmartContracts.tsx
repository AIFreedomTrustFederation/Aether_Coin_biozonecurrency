import { useQuery } from '@tanstack/react-query';
import { fetchSmartContracts } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { shortenAddress, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const SmartContracts = () => {
  const { data: contracts, isLoading, error } = useQuery({
    queryKey: ['/api/contracts'],
    queryFn: fetchSmartContracts
  });

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Smart Contracts</h3>
            <Skeleton className="h-6 w-20" />
          </div>
          
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Smart Contracts</h3>
            <Button variant="ghost" size="sm">Deploy New</Button>
          </div>
          
          <div className="p-4 text-destructive text-sm">
            Failed to load smart contracts: {(error as Error).message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Smart Contracts</h3>
          <Button variant="link" size="sm" className="text-primary">Deploy New</Button>
        </div>
        
        <div className="space-y-4">
          {contracts?.map((contract) => (
            <div key={contract.id} className="bg-background rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary bg-opacity-10 flex items-center justify-center text-primary mr-2">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="text-sm text-foreground">{contract.name}</div>
                </div>
                <div className="flex items-center">
                  <Badge 
                    variant={contract.status === 'active' ? 'success' : contract.status === 'pending' ? 'warning' : 'default'}
                    className="text-xs"
                  >
                    {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                {contract.chain.charAt(0).toUpperCase() + contract.chain.slice(1)}: {shortenAddress(contract.address)}
              </div>
              <div className="flex justify-between">
                <div className="text-xs text-muted-foreground">
                  {contract.lastInteraction 
                    ? `Last interaction: ${timeAgo(contract.lastInteraction)}`
                    : `Created: ${timeAgo(contract.createdAt)}`
                  }
                </div>
                <div className="text-xs text-primary cursor-pointer flex items-center">
                  {contract.status === 'pending' ? 'Check Status' : 'Interact'}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartContracts;
