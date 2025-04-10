import { useQuery } from '@tanstack/react-query';
import { fetchRecentTransactions } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Copy, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { shortenAddress, timeAgo } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const RecentTransactions = () => {
  const { toast } = useToast();
  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['/api/transactions/recent'],
    queryFn: () => fetchRecentTransactions()
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Address copied",
        description: "The address has been copied to your clipboard",
      });
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Recent Transactions</h3>
            <Skeleton className="h-6 w-16" />
          </div>
          
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-20 mb-1 ml-auto" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
              </div>
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
            <h3 className="font-bold text-foreground">Recent Transactions</h3>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          
          <div className="p-4 text-destructive text-sm">
            Failed to load transactions: {(error as Error).message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Recent Transactions</h3>
          <Button variant="link" size="sm" className="text-primary">View All</Button>
        </div>
        
        <div className="space-y-4">
          {transactions?.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  tx.type === 'receive' 
                    ? 'bg-green-500 bg-opacity-10 text-green-500' 
                    : tx.type === 'send' 
                    ? 'bg-red-500 bg-opacity-10 text-red-500'
                    : 'bg-amber-500 bg-opacity-10 text-amber-500'
                }`}>
                  {tx.type === 'receive' ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : tx.type === 'send' ? (
                    <TrendingDown className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-sm text-foreground">
                    {tx.type === 'receive' ? `Received ${tx.tokenSymbol}` :
                     tx.type === 'send' ? `Sent ${tx.tokenSymbol}` :
                     'Contract Interaction'}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    {tx.type === 'receive' ? 'From: ' : 'To: '}
                    {shortenAddress(tx.type === 'receive' ? tx.fromAddress || '' : tx.toAddress || '')}
                    <button 
                      className="text-primary ml-1 inline-flex items-center" 
                      onClick={() => copyToClipboard(tx.type === 'receive' ? tx.fromAddress || '' : tx.toAddress || '')}
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  tx.type === 'receive' ? 'text-green-500' : tx.type === 'send' ? 'text-red-500' : 'text-foreground'
                }`}>
                  {tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : ''}
                  {tx.amount} {tx.tokenSymbol}
                </div>
                <div className="text-xs text-muted-foreground">{timeAgo(tx.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
