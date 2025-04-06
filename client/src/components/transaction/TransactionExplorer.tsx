import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InfoIcon, ExternalLinkIcon, LayersIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import TransactionDetailModal from "./TransactionDetailModal";

interface TransactionExplorerProps {
  walletId?: number;
  userId?: number;
  limit?: number;
  showFilters?: boolean;
}

export default function TransactionExplorer({ 
  walletId,
  userId,
  limit = 10,
  showFilters = true 
}: TransactionExplorerProps) {
  const [activeTab, setActiveTab] = React.useState("all");
  const [selectedTransaction, setSelectedTransaction] = React.useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);
  
  // Get regular transactions (all or filtered by wallet)
  const { 
    data: transactions = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: walletId 
      ? ['/api/transactions/wallet', walletId] 
      : ['/api/transactions/recent', userId || 1, limit],
    retry: 1
  });
  
  // Get Layer 2 transactions
  const { 
    data: layer2Transactions = [], 
    isLoading: isLoadingLayer2 
  } = useQuery({
    queryKey: ['/api/transactions/layer2', activeTab !== 'all' ? activeTab : undefined],
    enabled: activeTab === 'all' || activeTab === 'optimism' || activeTab === 'arbitrum' || activeTab === 'polygon',
    retry: 1
  });
  
  // Combine and filter transactions based on active tab
  const displayTransactions = React.useMemo(() => {
    if (activeTab === 'all') {
      return [...transactions, ...layer2Transactions]
        .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
        .slice(0, limit);
    } else if (activeTab === 'optimism' || activeTab === 'arbitrum' || activeTab === 'polygon') {
      return layer2Transactions;
    } else {
      return transactions;
    }
  }, [transactions, layer2Transactions, activeTab, limit]);
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Explorer</CardTitle>
          <CardDescription>Error loading transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            Failed to load transaction data. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Transaction Explorer
          {isLoading || isLoadingLayer2 && <span className="ml-2 animate-pulse">Loading...</span>}
        </CardTitle>
        <CardDescription>
          View and explore all your blockchain transactions
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {showFilters && (
          <Tabs 
            defaultValue="all" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="mb-4"
          >
            <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="layer1">Layer 1</TabsTrigger>
              <TabsTrigger value="optimism">Optimism</TabsTrigger>
              <TabsTrigger value="arbitrum">Arbitrum</TabsTrigger>
              <TabsTrigger value="polygon">Polygon</TabsTrigger>
              <TabsTrigger value="sends">Sends</TabsTrigger>
              <TabsTrigger value="receives">Receives</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      
        <ScrollArea className="h-[400px]">
          <Table>
            <TableCaption>Your recent transactions</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {isLoading || isLoadingLayer2 
                      ? "Loading transactions..." 
                      : "No transactions found"}
                  </TableCell>
                </TableRow>
              ) : (
                displayTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Badge variant={tx.type === 'receive' ? "success" : "default"}>
                        {tx.type === 'receive' ? 'Receive' : 'Send'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={tx.type === 'receive' ? 'text-green-500' : ''}>
                        {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.tokenSymbol}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          tx.status === 'completed' ? "success" : 
                          tx.status === 'pending' ? "outline" : 
                          tx.status === 'failed' ? "destructive" : 
                          "secondary"
                        }
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tx.isLayer2 ? (
                        <span className="flex items-center gap-1">
                          <LayersIcon size={14} className="text-purple-500" />
                          {tx.layer2Type || 'L2'}
                        </span>
                      ) : (
                        'Mainnet'
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">
                              {tx.plainDescription || `${tx.type === 'receive' ? 'Received' : 'Sent'} ${tx.tokenSymbol}`}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{tx.plainDescription || `Transaction ${tx.txHash.slice(0, 10)}...`}</p>
                            {tx.fromAddress && (
                              <p className="text-xs text-muted-foreground mt-1">
                                From: {tx.fromAddress.slice(0, 6)}...{tx.fromAddress.slice(-4)}
                              </p>
                            )}
                            {tx.toAddress && (
                              <p className="text-xs text-muted-foreground">
                                To: {tx.toAddress.slice(0, 6)}...{tx.toAddress.slice(-4)}
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      {tx.timestamp 
                        ? formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true }) 
                        : 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedTransaction(tx.id);
                                  setDetailModalOpen(true);
                                }}
                              >
                                <InfoIcon size={14} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View transaction details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8"
                                onClick={() => window.open(`https://etherscan.io/tx/${tx.txHash}`, '_blank')}
                              >
                                <ExternalLinkIcon size={14} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View on Explorer</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.location.href = "/transactions"}>
          View All Transactions
        </Button>
        {displayTransactions.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(displayTransactions.length, limit)} of {transactions.length + layer2Transactions.length} transactions
          </p>
        )}
      </CardFooter>
      
      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        transactionId={selectedTransaction}
      />
    </Card>
  );
}