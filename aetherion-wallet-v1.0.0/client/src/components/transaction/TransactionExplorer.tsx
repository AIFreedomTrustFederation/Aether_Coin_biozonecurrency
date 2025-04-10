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
import { InfoIcon, ExternalLinkIcon, LayersIcon, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import TransactionDetailModal from "./TransactionDetailModal";
import { useLiveMode } from "@/contexts/LiveModeContext";
import { walletConnector } from "@/core/wallet/WalletConnector";
import { ethers } from "ethers";

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
  const { isLiveMode, web3Provider, connectedAddress } = useLiveMode();
  const [web3Transactions, setWeb3Transactions] = React.useState<any[]>([]);
  const [isLoadingWeb3, setIsLoadingWeb3] = React.useState(false);
  const [web3Error, setWeb3Error] = React.useState<string | null>(null);
  
  // Get regular transactions (all or filtered by wallet) when NOT in live mode
  const { 
    data: transactions = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: walletId 
      ? ['/api/transactions/wallet', walletId] 
      : ['/api/transactions/recent', userId || 1, limit],
    retry: 1,
    enabled: !isLiveMode // Only fetch API data when not in live mode
  });
  
  // Get Layer 2 transactions when NOT in live mode
  const { 
    data: layer2Transactions = [], 
    isLoading: isLoadingLayer2 
  } = useQuery({
    queryKey: ['/api/transactions/layer2', activeTab !== 'all' ? activeTab : undefined],
    enabled: (!isLiveMode) && (activeTab === 'all' || activeTab === 'optimism' || activeTab === 'arbitrum' || activeTab === 'polygon'),
    retry: 1
  });
  
  // Fetch transactions directly from Ethereum when in live mode
  React.useEffect(() => {
    async function fetchWeb3Transactions() {
      if (!isLiveMode || !web3Provider || !connectedAddress) {
        setWeb3Transactions([]);
        return;
      }
      
      setIsLoadingWeb3(true);
      setWeb3Error(null);
      
      try {
        // Get transaction history - in a real app, we would use an indexer like Etherscan API
        // For now, we'll just get the most recent transactions by scanning the last few blocks
        const currentBlock = await web3Provider.getBlockNumber();
        const transactionList: any[] = [];
        
        // Scan the last 10 blocks (this is simplified, real apps would use APIs)
        for (let i = 0; i < 10; i++) {
          if (currentBlock - i < 0) break;
          
          const block = await web3Provider.getBlock(currentBlock - i, true);
          if (block && block.transactions) {
            for (const tx of block.transactions) {
              // Filter for transactions involving the current address
              if (tx.from.toLowerCase() === connectedAddress.toLowerCase() || 
                  (tx.to && tx.to.toLowerCase() === connectedAddress.toLowerCase())) {
                
                // Get full transaction details
                const fullTx = await web3Provider.getTransaction(tx.hash);
                const receipt = await web3Provider.getTransactionReceipt(tx.hash);
                
                const formattedTx = {
                  id: transactionList.length + 1, // Local ID for rendering
                  txHash: tx.hash,
                  fromAddress: tx.from,
                  toAddress: tx.to || 'Contract Creation',
                  amount: ethers.formatEther(tx.value),
                  tokenSymbol: 'ETH',
                  timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
                  status: receipt?.status ? 'completed' : 'failed',
                  type: tx.from.toLowerCase() === connectedAddress.toLowerCase() ? 'send' : 'receive',
                  plainDescription: tx.from.toLowerCase() === connectedAddress.toLowerCase() 
                    ? `Sent ${ethers.formatEther(tx.value)} ETH to ${tx.to ? tx.to.substring(0, 8) + '...' : 'Contract'}`
                    : `Received ${ethers.formatEther(tx.value)} ETH from ${tx.from.substring(0, 8) + '...'}`,
                  isLayer2: false, // Determine based on chainId
                  blockNumber: tx.blockNumber,
                  gasUsed: receipt?.gasUsed.toString() || '0',
                  gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : '0'
                };
                
                transactionList.push(formattedTx);
              }
            }
          }
        }
        
        setWeb3Transactions(transactionList);
      } catch (err) {
        console.error('Error fetching web3 transactions:', err);
        setWeb3Error(err instanceof Error ? err.message : 'Failed to fetch blockchain transactions');
      } finally {
        setIsLoadingWeb3(false);
      }
    }
    
    if (isLiveMode && web3Provider && connectedAddress) {
      fetchWeb3Transactions();
    }
  }, [isLiveMode, web3Provider, connectedAddress, activeTab]);
  
  // Combine and filter transactions based on active tab and live mode
  const displayTransactions = React.useMemo(() => {
    // If live mode is enabled, use web3 transactions
    if (isLiveMode) {
      // Filter based on active tab
      if (activeTab === 'sends') {
        return web3Transactions.filter(tx => tx.type === 'send');
      } else if (activeTab === 'receives') {
        return web3Transactions.filter(tx => tx.type === 'receive');
      } else if (activeTab.startsWith('layer')) {
        // For simplicity, we're not implementing L2 filtering in this demo
        // In a full implementation, we would check chainId to determine L2 type
        return [];
      } else {
        // 'all' or other tabs
        return web3Transactions;
      }
    } else {
      // Not in live mode, use API data
      if (activeTab === 'all') {
        return [...transactions, ...layer2Transactions]
          .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
          .slice(0, limit);
      } else if (activeTab === 'optimism' || activeTab === 'arbitrum' || activeTab === 'polygon') {
        return layer2Transactions;
      } else {
        return transactions;
      }
    }
  }, [isLiveMode, web3Transactions, transactions, layer2Transactions, activeTab, limit]);
  
  // Error handling for regular API fetch errors
  if (error && !isLiveMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Explorer</CardTitle>
          <CardDescription>No transactions available</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="mb-4 p-3 bg-primary/10 rounded-full">
            <InfoIcon className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Transaction History</h3>
          <p className="text-center text-muted-foreground mb-6 max-w-md">
            There are currently no transactions in your history. Transactions will appear here once you start using your wallet.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Show Web3 connection prompt when in live mode but not connected
  if (isLiveMode && !web3Provider) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Explorer</CardTitle>
          <CardDescription>Live Mode Active</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">MetaMask Connection Required</h3>
          <p className="text-center text-muted-foreground mb-6 max-w-md">
            Live mode requires a connection to MetaMask to display your actual blockchain transactions.
            No placeholders or demo data will be shown.
          </p>
          <Button 
            onClick={() => window.ethereum ? window.ethereum.request({ method: 'eth_requestAccounts' }) : null}
            disabled={isLoadingWeb3}
          >
            {isLoadingWeb3 ? 'Connecting...' : 'Connect MetaMask'}
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Show web3 error if there was an error fetching transactions in live mode
  if (isLiveMode && web3Error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Explorer</CardTitle>
          <CardDescription>Error loading blockchain transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            {web3Error}
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
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