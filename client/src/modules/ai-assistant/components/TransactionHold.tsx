import React, { useState } from 'react';
import { useAI } from '../contexts/AIContext';
import { 
  AlertTriangle,
  TimerIcon,
  ChevronsRight,
  ShieldAlert,
  Clock10,
  HelpCircle,
  ArrowRight,
  XCircle,
  CheckCircle,
  CalendarClock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDate, formatAddress, formatTokenAmount } from '../utils/formatters';
import { TransactionHoldProps, Transaction } from '../types';

// Helper components
const RiskBadge = ({ level }: { level: 'high' | 'medium' | 'low' | 'none' }) => {
  switch (level) {
    case 'high':
      return <Badge variant="destructive" className="ml-2">High Risk</Badge>;
    case 'medium':
      return <Badge variant="secondary" className="bg-orange-500 text-white ml-2">Medium Risk</Badge>;
    case 'low':
      return <Badge variant="warning" className="ml-2">Low Risk</Badge>;
    case 'none':
    default:
      return <Badge variant="outline" className="text-green-600 border-green-600 ml-2">Verified</Badge>;
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status.toLowerCase()) {
    case 'held':
      return <Badge variant="secondary" className="bg-amber-500 text-white ml-2">On Hold</Badge>;
    case 'pending':
      return <Badge variant="secondary" className="ml-2">Pending</Badge>;
    case 'confirmed':
      return <Badge variant="outline" className="text-green-600 border-green-600 ml-2">Confirmed</Badge>;
    case 'failed':
      return <Badge variant="destructive" className="ml-2">Failed</Badge>;
    default:
      return <Badge variant="outline" className="ml-2">{status}</Badge>;
  }
};

// Main component
const TransactionHold: React.FC<TransactionHoldProps> = ({ className = '' }) => {
  const { state, removePendingTransaction } = useAI();
  const { pendingTransactions } = state;
  
  // State to track which transaction details are expanded
  const [expandedTxId, setExpandedTxId] = useState<number | null>(null);
  
  const toggleDetails = (id: number) => {
    if (expandedTxId === id) {
      setExpandedTxId(null);
    } else {
      setExpandedTxId(id);
    }
  };
  
  // If there are no pending transactions, show empty state
  if (pendingTransactions.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${className}`}>
        <Clock10 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Transactions On Hold</h3>
        <p className="text-muted-foreground text-center max-w-md">
          When suspicious transactions are detected, they will be placed on hold and displayed here for your review.
        </p>
      </div>
    );
  }
  
  // Calculate time remaining in escrow
  const getTimeRemaining = (tx: Transaction) => {
    if (!tx.escrowEndsAt) return null;
    
    const now = new Date();
    const escrowEnd = new Date(tx.escrowEndsAt);
    const diffMs = escrowEnd.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Escrow period ended';
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m remaining`;
  };
  
  // Get risk level based on transaction properties
  const getRiskLevel = (tx: Transaction) => {
    if (tx.aiVerified) return 'none';
    if (tx.riskReason && tx.riskReason.includes('high')) return 'high';
    if (tx.riskReason && tx.riskReason.includes('medium')) return 'medium';
    return 'low';
  };
  
  // Handle releasing a transaction from hold
  const handleReleaseTransaction = (id: number) => {
    // In a real implementation, this would call an API to release the transaction
    // For now, we'll just remove it from the pending list
    removePendingTransaction(id);
  };
  
  // Handle canceling a transaction
  const handleCancelTransaction = (id: number) => {
    // In a real implementation, this would call an API to cancel the transaction
    // For now, we'll just remove it from the pending list
    removePendingTransaction(id);
  };
  
  // Sort transactions - held and highest risk first
  const sortedTransactions = [...pendingTransactions].sort((a, b) => {
    // First by status - held transactions come first
    if (a.status === 'held' && b.status !== 'held') return -1;
    if (a.status !== 'held' && b.status === 'held') return 1;
    
    // Then by risk level
    const riskLevelA = getRiskLevel(a);
    const riskLevelB = getRiskLevel(b);
    
    const riskPriority = { high: 0, medium: 1, low: 2, none: 3 };
    return (riskPriority[riskLevelA as keyof typeof riskPriority] - riskPriority[riskLevelB as keyof typeof riskPriority]);
  });
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <h2 className="text-xl font-semibold mb-1 flex items-center">
          <TimerIcon className="mr-2 h-5 w-5 text-primary" />
          Transaction Escrow
        </h2>
        <p className="text-muted-foreground">
          Review and manage transactions placed on hold for security verification
        </p>
      </div>
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {sortedTransactions.map(transaction => (
            <Card key={transaction.id} className={transaction.status === 'held' ? 'border-amber-500 dark:border-amber-500/50' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <CardTitle className="text-base">
                        {transaction.type === 'send' ? 'Send' : 
                         transaction.type === 'receive' ? 'Receive' : 
                         transaction.type === 'swap' ? 'Swap' : 'Stake'}
                      </CardTitle>
                      <StatusBadge status={transaction.status} />
                      <RiskBadge level={getRiskLevel(transaction)} />
                    </div>
                    <CardDescription>
                      {formatDate(transaction.timestamp)}
                    </CardDescription>
                  </div>
                  
                  {transaction.status === 'held' && transaction.escrowEndsAt && (
                    <div className="flex items-center text-sm">
                      <CalendarClock className="h-4 w-4 mr-1 text-amber-500" />
                      <span>{getTimeRemaining(transaction)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {formatTokenAmount(transaction.amount, 4, transaction.tokenSymbol)}
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="truncate max-w-[120px]">{formatAddress(transaction.fromAddress)}</span>
                      <ArrowRight className="mx-1 h-3 w-3" />
                      <span className="truncate max-w-[120px]">{formatAddress(transaction.toAddress)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleDetails(transaction.id)}
                    className="gap-1"
                  >
                    {expandedTxId === transaction.id ? 'Hide Details' : 'View Details'}
                    <ChevronsRight className={`h-4 w-4 transition-transform ${expandedTxId === transaction.id ? 'rotate-90' : ''}`} />
                  </Button>
                </div>
                
                {expandedTxId === transaction.id && (
                  <div className="mt-4 space-y-4">
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="font-medium">Transaction Hash</div>
                      <div className="text-muted-foreground truncate">{formatAddress(transaction.txHash, 10, 6)}</div>
                      
                      <div className="font-medium">Network Fee</div>
                      <div className="text-muted-foreground">{transaction.fee || 'Not available'}</div>
                      
                      <div className="font-medium">Block Number</div>
                      <div className="text-muted-foreground">{transaction.blockNumber || 'Pending'}</div>
                      
                      <div className="font-medium">From</div>
                      <div className="text-muted-foreground">{transaction.fromAddress}</div>
                      
                      <div className="font-medium">To</div>
                      <div className="text-muted-foreground">{transaction.toAddress}</div>
                    </div>
                    
                    {transaction.riskReason && (
                      <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-md border border-amber-200 dark:border-amber-800 mt-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-amber-800 dark:text-amber-300">Risk Detected</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                              {transaction.riskReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {transaction.status === 'held' && (
                      <div className="mt-3">
                        <div className="text-sm mb-2">
                          This transaction is being held in escrow for your protection. You can choose to:
                        </div>
                        <div className="flex gap-2 justify-end">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                                  onClick={() => handleCancelTransaction(transaction.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Cancel Transaction
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-52 text-xs">
                                  Permanently cancel this transaction. Funds will be returned to the sending wallet minus any network fees.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950"
                                  onClick={() => handleReleaseTransaction(transaction.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Release from Escrow
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-52 text-xs">
                                  Release this transaction from escrow, allowing it to be processed on the blockchain. This action cannot be reversed.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TransactionHold;