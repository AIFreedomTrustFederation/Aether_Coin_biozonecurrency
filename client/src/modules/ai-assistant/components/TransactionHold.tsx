import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertCircle, 
  ClockIcon,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  EyeIcon,
  History,
  Hourglass
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  formatAddress, 
  formatDate, 
  formatDuration,
  formatTokenAmount 
} from '../utils/formatters';
import { useAI } from '../contexts/AIContext';
import { TransactionHoldProps } from '../types';

/**
 * TransactionHold component manages funds during the reporting period.
 * It allows users to view transactions on hold and release or cancel them.
 */
const TransactionHold: React.FC<TransactionHoldProps> = ({ className = '' }) => {
  const { state, removePendingTransaction } = useAI();
  const { pendingTransactions } = state;
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'release' | 'cancel' | null>(null);
  
  // Calculate remaining time for hold period
  const calculateRemainingTime = (transaction: any): { 
    remainingMs: number, 
    percentComplete: number 
  } => {
    const currentTime = new Date().getTime();
    const createdTime = new Date(transaction.timestamp).getTime();
    const holdDurationMs = transaction.holdPeriodHours * 60 * 60 * 1000;
    const expiryTime = createdTime + holdDurationMs;
    const remainingMs = Math.max(0, expiryTime - currentTime);
    const elapsedMs = currentTime - createdTime;
    const percentComplete = Math.min(100, (elapsedMs / holdDurationMs) * 100);
    
    return { remainingMs, percentComplete };
  };
  
  // Format remaining time in human-readable format
  const formatRemainingTime = (remainingMs: number): string => {
    if (remainingMs <= 0) return 'Expired';
    
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
      return `${minutes}m ${seconds}s remaining`;
    }
  };
  
  // Open transaction details dialog
  const openTransactionDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };
  
  // Open confirmation dialog for releasing or canceling a transaction
  const openConfirmDialog = (transaction: any, type: 'release' | 'cancel') => {
    setSelectedTransaction(transaction);
    setActionType(type);
    setConfirmDialogOpen(true);
  };
  
  // Handle release transaction
  const handleReleaseTransaction = () => {
    if (!selectedTransaction) return;
    
    // In a real app, we would call an API to release the transaction
    removePendingTransaction(selectedTransaction.id);
    
    toast({
      title: 'Transaction Released',
      description: 'The funds have been released to the recipient.',
    });
    
    setConfirmDialogOpen(false);
    setDialogOpen(false);
  };
  
  // Handle cancel transaction
  const handleCancelTransaction = () => {
    if (!selectedTransaction) return;
    
    // In a real app, we would call an API to cancel the transaction
    removePendingTransaction(selectedTransaction.id);
    
    toast({
      title: 'Transaction Cancelled',
      description: 'The transaction has been cancelled and funds returned to your wallet.',
    });
    
    setConfirmDialogOpen(false);
    setDialogOpen(false);
  };
  
  // Get status badge based on transaction status
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on_hold':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30">
            <Hourglass className="h-3 w-3 mr-1" />
            On Hold
          </Badge>
        );
      case 'released':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Released
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      case 'suspicious':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Suspicious
          </Badge>
        );
      case 'verified':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30">
            <ShieldCheck className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };
  
  // Render confirmation dialog
  const renderConfirmDialog = () => {
    if (!selectedTransaction) return null;
    
    const isRelease = actionType === 'release';
    const title = isRelease ? 'Release Transaction' : 'Cancel Transaction';
    const description = isRelease
      ? 'Are you sure you want to release this transaction? This action cannot be undone.'
      : 'Are you sure you want to cancel this transaction? The funds will be returned to your wallet.';
    
    return (
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isRelease ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              {title}
            </DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border rounded-md p-3 bg-muted/40">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Amount:</div>
                <div className="font-medium text-right">
                  {formatTokenAmount(selectedTransaction.amount, 6, selectedTransaction.tokenSymbol)}
                </div>
                
                <div className="text-muted-foreground">To:</div>
                <div className="font-medium text-right">
                  {formatAddress(selectedTransaction.toAddress)}
                </div>
                
                <div className="text-muted-foreground">Created:</div>
                <div className="font-medium text-right">
                  {formatDate(selectedTransaction.timestamp, false, true)}
                </div>
              </div>
            </div>
            
            {selectedTransaction.riskFactors && selectedTransaction.riskFactors.length > 0 && (
              <div className="border border-destructive/20 rounded-md p-3 bg-destructive/5">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <div className="font-medium">Risk Factors Detected</div>
                </div>
                <ul className="text-sm space-y-1 pl-6 list-disc text-destructive/90">
                  {selectedTransaction.riskFactors.map((factor: string, idx: number) => (
                    <li key={idx}>{factor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            
            <Button
              variant={isRelease ? "default" : "destructive"}
              onClick={isRelease ? handleReleaseTransaction : handleCancelTransaction}
            >
              {isRelease ? "Release Transaction" : "Cancel Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Render transaction details dialog
  const renderTransactionDetailsDialog = () => {
    if (!selectedTransaction) return null;
    
    const { remainingMs, percentComplete } = calculateRemainingTime(selectedTransaction);
    const remainingTimeText = formatRemainingTime(remainingMs);
    const isExpired = remainingMs <= 0;
    
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Transaction Details
            </DialogTitle>
            <DialogDescription>
              Transaction is on hold for {selectedTransaction.holdPeriodHours} 
              hours to allow time for verification
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5">
            {/* Transaction Status */}
            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="font-medium flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-yellow-500" />
                  Hold Status
                </div>
                {getStatusBadge(selectedTransaction.status)}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Hold Period:</span>
                  <span>{isExpired ? 'Expired' : remainingTimeText}</span>
                </div>
                
                <Progress value={percentComplete} className="h-2" />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Created {formatDate(selectedTransaction.timestamp, false, true)}</span>
                  <span>
                    Expires {formatDate(
                      new Date(
                        new Date(selectedTransaction.timestamp).getTime() +
                        selectedTransaction.holdPeriodHours * 60 * 60 * 1000
                      )
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Transaction Details */}
            <div>
              <h3 className="text-sm font-medium mb-3">Transaction Details</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-muted-foreground">Type:</div>
                <div>{selectedTransaction.type}</div>
                
                <div className="text-muted-foreground">Amount:</div>
                <div>{formatTokenAmount(selectedTransaction.amount, 6, selectedTransaction.tokenSymbol)}</div>
                
                <div className="text-muted-foreground">From:</div>
                <div className="flex items-center gap-1">
                  {formatAddress(selectedTransaction.fromAddress)}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => window.open(`https://etherscan.io/address/${selectedTransaction.fromAddress}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View on explorer</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="text-muted-foreground">To:</div>
                <div className="flex items-center gap-1">
                  {formatAddress(selectedTransaction.toAddress)}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => window.open(`https://etherscan.io/address/${selectedTransaction.toAddress}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View on explorer</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {selectedTransaction.txHash && (
                  <>
                    <div className="text-muted-foreground">Transaction Hash:</div>
                    <div className="flex items-center gap-1">
                      {formatAddress(selectedTransaction.txHash, 10, 6)}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => window.open(`https://etherscan.io/tx/${selectedTransaction.txHash}`, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View on explorer</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </>
                )}
                
                <div className="text-muted-foreground">Network:</div>
                <div>{selectedTransaction.network}</div>
                
                {selectedTransaction.fee && (
                  <>
                    <div className="text-muted-foreground">Network Fee:</div>
                    <div>{selectedTransaction.fee}</div>
                  </>
                )}
              </div>
            </div>
            
            {/* AI Verification */}
            {selectedTransaction.aiVerification && (
              <Collapsible>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    AI Verification Results
                  </h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent>
                  <div className="mt-2 border rounded-md p-3 text-sm space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedTransaction.aiVerification.trustScore > 70 ? 'outline' : 'destructive'}>
                        Trust Score: {selectedTransaction.aiVerification.trustScore}%
                      </Badge>
                      
                      <Badge variant={
                        selectedTransaction.aiVerification.riskLevel === 'low' 
                          ? 'outline' 
                          : selectedTransaction.aiVerification.riskLevel === 'medium'
                            ? 'secondary'
                            : 'destructive'
                      }>
                        Risk: {selectedTransaction.aiVerification.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    
                    {selectedTransaction.aiVerification.findings.length > 0 && (
                      <div>
                        <div className="font-medium">Findings:</div>
                        <ul className="list-disc pl-5 space-y-1 mt-1">
                          {selectedTransaction.aiVerification.findings.map((finding: string, idx: number) => (
                            <li key={idx}>{finding}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedTransaction.aiVerification.recommendations && (
                      <div>
                        <div className="font-medium">Recommendations:</div>
                        <div className="mt-1">
                          {selectedTransaction.aiVerification.recommendations}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Verified on {formatDate(selectedTransaction.aiVerification.timestamp)}</span>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 p-0 gap-1"
                        onClick={() => {/* In a real app, this would show detailed verification report */}}
                      >
                        <EyeIcon className="h-3 w-3" />
                        <span>View Full Report</span>
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {/* Risk Factors */}
            {selectedTransaction.riskFactors && selectedTransaction.riskFactors.length > 0 && (
              <div className="border border-destructive/20 rounded-md p-3 bg-destructive/5">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <div className="font-medium">Risk Factors Detected</div>
                </div>
                <ul className="text-sm space-y-1 pl-6 list-disc text-destructive/90">
                  {selectedTransaction.riskFactors.map((factor: string, idx: number) => (
                    <li key={idx}>{factor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <Separator />
          
          <DialogFooter className="gap-2 sm:gap-0">
            <div className="flex gap-2 flex-1 sm:flex-auto">
              <Button
                variant="outline"
                className="flex-1 sm:flex-initial"
                onClick={() => openConfirmDialog(selectedTransaction, 'cancel')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Transaction
              </Button>
              
              <Button
                variant="default"
                className="flex-1 sm:flex-initial"
                onClick={() => openConfirmDialog(selectedTransaction, 'release')}
                disabled={!isExpired && selectedTransaction.status === 'suspicious'}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isExpired ? 'Release Now' : 'Approve Release'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Render each transaction card
  const renderTransactionCard = (transaction: any) => {
    const { remainingMs, percentComplete } = calculateRemainingTime(transaction);
    const remainingTimeText = formatRemainingTime(remainingMs);
    
    return (
      <Card key={transaction.id} className="overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base">
                {formatTokenAmount(transaction.amount, 6, transaction.tokenSymbol)}
              </CardTitle>
              <CardDescription>
                To: {formatAddress(transaction.toAddress)}
              </CardDescription>
            </div>
            {getStatusBadge(transaction.status)}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2 pb-3">
          <div className="space-y-3 mb-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Hold period:</span>
              <span>{remainingTimeText}</span>
            </div>
            
            <Progress value={percentComplete} className="h-1.5" />
          </div>
          
          {transaction.riskFactors && transaction.riskFactors.length > 0 && (
            <div className="mt-3 flex items-start gap-2 text-xs border border-destructive/30 p-2 rounded bg-destructive/5">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-destructive">
                  Suspicious activity detected
                </span>
                <span className="block mt-1">
                  AI has flagged this transaction as potentially suspicious.
                </span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-3 pt-0 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8"
            onClick={() => openConfirmDialog(transaction, 'cancel')}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm" 
            className="text-xs h-8"
            onClick={() => openTransactionDetails(transaction)}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2">
        <ClockIcon className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Transaction Hold</h2>
      </div>
      
      {pendingTransactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Pending Transactions</h3>
            <p className="text-muted-foreground max-w-md">
              You don't have any transactions currently on hold. Transactions are temporarily held to provide time for review and allow for cancellation if needed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingTransactions.map(renderTransactionCard)}
        </div>
      )}
      
      {renderTransactionDetailsDialog()}
      {renderConfirmDialog()}
    </div>
  );
};

export default TransactionHold;