import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { getBridgeTransactions, getBridgeConfigurations, getMockTransactions, getMockBridges } from '@/lib/bridgeAPI';
import { BridgeStatus, BridgeTransactionStatus } from '@/shared/schema';

const getStatusColor = (status: BridgeTransactionStatus) => {
  switch (status) {
    case BridgeTransactionStatus.COMPLETED:
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case BridgeTransactionStatus.FAILED:
    case BridgeTransactionStatus.REVERTED:
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    case BridgeTransactionStatus.PENDING_SOURCE_CONFIRMATION:
    case BridgeTransactionStatus.PENDING_VALIDATION:
    case BridgeTransactionStatus.PENDING_TARGET_EXECUTION:
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case BridgeTransactionStatus.INITIATED:
    case BridgeTransactionStatus.SOURCE_CONFIRMED:
    case BridgeTransactionStatus.VALIDATED:
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Function to shorten addresses for display
const shortenAddress = (address: string) => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const TransactionHistory = () => {
  const [selectedBridge, setSelectedBridge] = useState<string>('all');
  const [limit, setLimit] = useState<number>(10);

  // Query for bridge configurations
  const bridgesQuery = useQuery({
    queryKey: ['/api/bridges'],
    queryFn: async () => {
      try {
        // Try to fetch real data first
        const realData = await getBridgeConfigurations(BridgeStatus.ACTIVE);
        if (realData && realData.length > 0) {
          return realData;
        }
        // Fallback to mock data if real API fails or returns empty
        return getMockBridges();
      } catch (error) {
        console.warn('Using mock bridge data:', error);
        return getMockBridges();
      }
    },
  });

  // Query for transactions
  const transactionsQuery = useQuery({
    queryKey: ['/api/bridge-transactions', selectedBridge !== 'all' ? parseInt(selectedBridge) : undefined, limit],
    queryFn: async () => {
      try {
        // Try to fetch real data first
        const realData = await getBridgeTransactions(
          selectedBridge !== 'all' ? parseInt(selectedBridge) : undefined,
          undefined, // userId would be set in a real app with authentication
          limit
        );
        if (realData && realData.length > 0) {
          return realData;
        }
        // Fallback to mock data if real API fails or returns empty
        return getMockTransactions();
      } catch (error) {
        console.warn('Using mock transaction data:', error);
        return getMockTransactions();
      }
    },
  });

  const handleRefresh = () => {
    transactionsQuery.refetch();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View and track your cross-chain bridge transactions.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            {transactionsQuery.isRefetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2 hidden md:inline">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium block mb-2">Filter by Bridge</label>
            <Select
              value={selectedBridge}
              onValueChange={setSelectedBridge}
              disabled={bridgesQuery.isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a bridge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bridges</SelectItem>
                {bridgesQuery.data?.map((bridge) => (
                  <SelectItem key={bridge.id} value={bridge.id.toString()}>
                    {bridge.name} ({bridge.sourceNetwork} ⟷ {bridge.targetNetwork})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">Show Transactions</label>
            <Select
              value={limit.toString()}
              onValueChange={(value) => setLimit(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Number of transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Last 5 transactions</SelectItem>
                <SelectItem value="10">Last 10 transactions</SelectItem>
                <SelectItem value="20">Last 20 transactions</SelectItem>
                <SelectItem value="50">Last 50 transactions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {transactionsQuery.isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading transactions...</span>
          </div>
        ) : transactionsQuery.data?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found. Initiate a bridge transfer to get started.
          </div>
        ) : (
          <>
            {/* Desktop table view */}
            <div className="rounded-md border overflow-auto hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsQuery.data?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{formatDate(transaction.initiatedAt.toString())}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{shortenAddress(transaction.sourceAddress)}</span>
                          <span className="text-xs text-muted-foreground">{transaction.sourceNetwork}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{shortenAddress(transaction.targetAddress)}</span>
                          <span className="text-xs text-muted-foreground">{transaction.targetNetwork}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{transaction.amount} {transaction.tokenSymbol}</span>
                          {transaction.fee && (
                            <span className="text-xs text-muted-foreground">
                              Fee: {transaction.fee} {transaction.tokenSymbol}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status as BridgeTransactionStatus)}>
                          {transaction.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {transaction.sourceTransactionHash && (
                            <Button variant="ghost" size="sm" asChild>
                              <a 
                                href={`https://explorer.${transaction.sourceNetwork}.io/tx/${transaction.sourceTransactionHash}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                title="View source transaction"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                          {transaction.targetTransactionHash && transaction.status === BridgeTransactionStatus.COMPLETED && (
                            <Button variant="ghost" size="sm" asChild>
                              <a 
                                href={`https://explorer.${transaction.targetNetwork}.io/tx/${transaction.targetTransactionHash}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                title="View target transaction"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile card view */}
            <div className="space-y-4 md:hidden">
              {transactionsQuery.data?.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">ID: {transaction.id}</span>
                    <Badge className={getStatusColor(transaction.status as BridgeTransactionStatus)}>
                      {transaction.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  
                  <div className="text-sm">
                    {formatDate(transaction.initiatedAt.toString())}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="font-medium">From:</div>
                      <div>{shortenAddress(transaction.sourceAddress)}</div>
                      <div className="text-xs text-muted-foreground">{transaction.sourceNetwork}</div>
                    </div>
                    
                    <div>
                      <div className="font-medium">To:</div>
                      <div>{shortenAddress(transaction.targetAddress)}</div>
                      <div className="text-xs text-muted-foreground">{transaction.targetNetwork}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="font-medium">Amount:</div>
                    <div>{transaction.amount} {transaction.tokenSymbol}</div>
                    {transaction.fee && (
                      <div className="text-xs text-muted-foreground">
                        Fee: {transaction.fee} {transaction.tokenSymbol}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-2">
                    {transaction.sourceTransactionHash && (
                      <Button variant="ghost" size="sm" asChild>
                        <a 
                          href={`https://explorer.${transaction.sourceNetwork}.io/tx/${transaction.sourceTransactionHash}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          title="View source transaction"
                        >
                          <span className="text-xs mr-1">Source</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    {transaction.targetTransactionHash && transaction.status === BridgeTransactionStatus.COMPLETED && (
                      <Button variant="ghost" size="sm" asChild>
                        <a 
                          href={`https://explorer.${transaction.targetNetwork}.io/tx/${transaction.targetTransactionHash}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          title="View target transaction"
                        >
                          <span className="text-xs mr-1">Target</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;