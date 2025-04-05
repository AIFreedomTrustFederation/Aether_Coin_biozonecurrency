/**
 * Blockchain Transactions Component
 * 
 * Displays blockchain transactions and provides transaction creation functionality.
 */

import React, { useState, useEffect } from 'react';
import { blockchainService } from '../../core/blockchain';
import { Transaction } from '../../core/blockchain/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Clock, FileText, CheckCircle, AlertTriangle, ArrowRight, ArrowLeft, Wallet, ArrowDownRight, ArrowUpRight, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define the form schema with validation
const transactionFormSchema = z.object({
  toAddress: z.string().min(1, "Recipient address is required"),
  amount: z.coerce.number().positive("Amount must be positive").min(0.000001, "Minimum amount is 0.000001 AE"),
  fee: z.coerce.number().positive("Fee must be positive").min(0.000001, "Minimum fee is 0.000001 AE"),
  data: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export default function BlockchainTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingTxs, setPendingTxs] = useState<Transaction[]>([]);
  const [confirmingTx, setConfirmingTx] = useState<string | null>(null);
  const [confirmingTimeout, setConfirmingTimeout] = useState<number | null>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any | null>(null);
  const { toast } = useToast();
  
  // Define form
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      toAddress: '',
      amount: 1,
      fee: 0.001,
      data: '',
    }
  });
  
  // Get transactions and wallets on component mount
  useEffect(() => {
    const fetchData = () => {
      // Get blockchain state which contains all transactions
      const blockchainState = blockchainService.getBlockchainState();
      
      // Extract pending transactions
      const pendingTxs = blockchainState.pendingTransactions;
      setPendingTxs(pendingTxs);
      
      // Extract confirmed transactions from blocks
      const confirmedTxs: Transaction[] = [];
      blockchainState.chain.forEach(block => {
        if (block.transactions) {
          block.transactions.forEach(tx => {
            confirmedTxs.push(tx);
          });
        }
      });
      setTransactions(confirmedTxs);
      
      // Get available wallets
      const availableWallets = blockchainService.getAllWallets();
      setWallets(availableWallets);
      
      // Set first wallet as selected by default if no wallet is selected
      if (availableWallets.length > 0 && !selectedWallet) {
        setSelectedWallet(availableWallets[0]);
      }
    };
    
    // Initial fetch
    fetchData();
    
    // Set up interval to fetch data periodically
    const interval = setInterval(fetchData, 5000);
    
    return () => clearInterval(interval);
  }, [selectedWallet]);
  
  const handleSubmit = (values: TransactionFormValues) => {
    if (!selectedWallet) {
      toast({
        title: "No wallet selected",
        description: "Please select a wallet to make transactions",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const tx = blockchainService.createTransaction({
        fromWalletId: selectedWallet.id,
        toAddress: values.toAddress,
        amount: values.amount,
        fee: values.fee,
        data: values.data || '',
      });
      
      // Show success toast with confirmation animation
      toast({
        title: "Transaction created",
        description: "Your transaction has been added to the pending pool",
        variant: "default",
      });
      
      // Reset form
      form.reset();
      
      // Simulate transaction confirmation after a delay
      if (confirmingTimeout) {
        clearTimeout(confirmingTimeout);
      }
      
      setConfirmingTx(tx.id);
      const timeout = setTimeout(() => {
        setConfirmingTx(null);
        
        // Get updated blockchain state
        const blockchainState = blockchainService.getBlockchainState();
        
        // Extract pending transactions
        setPendingTxs(blockchainState.pendingTransactions);
        
        // Extract confirmed transactions
        const confirmedTxs: Transaction[] = [];
        blockchainState.chain.forEach(block => {
          if (block.transactions) {
            block.transactions.forEach(tx => {
              confirmedTxs.push(tx);
            });
          }
        });
        setTransactions(confirmedTxs);
        
        toast({
          title: "Transaction confirmed",
          description: "Your transaction has been confirmed and added to the blockchain",
          variant: "default",
        });
      }, 10000);
      
      setConfirmingTimeout(timeout as unknown as number);
    } catch (error: any) {
      toast({
        title: "Transaction failed",
        description: error.message || "An error occurred while creating the transaction",
        variant: "destructive",
      });
    }
  };
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Truncate hash for display
  const truncateHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Transaction History
              </CardTitle>
              <CardDescription>
                View all confirmed and pending transactions on the blockchain
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-2">
              <Tabs defaultValue="all">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="all" className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" /> All
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> Pending
                  </TabsTrigger>
                  <TabsTrigger value="my" className="flex items-center gap-1.5">
                    <Wallet className="h-4 w-4" /> My Transactions
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="m-0">
                  {transactions.length === 0 ? (
                    <div className="text-center p-10 text-muted-foreground bg-muted/30 rounded-lg">
                      <FileText className="mx-auto h-10 w-10 mb-3 opacity-20" />
                      <p>No transactions found</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px] border rounded-lg">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background">
                          <TableRow>
                            <TableHead className="w-[100px]">Type</TableHead>
                            <TableHead>Transaction Hash</TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>To</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Fee</TableHead>
                            <TableHead className="text-right">Timestamp</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((tx) => (
                            <TableRow 
                              key={tx.id}
                              className={confirmingTx === tx.id ? 'bg-primary/5' : ''}
                            >
                              <TableCell>
                                <Badge 
                                  variant={tx.fromAddress ? 'outline' : 'secondary'} 
                                  className="flex items-center gap-1 w-fit"
                                >
                                  {tx.fromAddress ? (
                                    <>
                                      <ArrowRight className="h-3 w-3" /> Transfer
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-3 w-3" /> Mining Reward
                                    </>
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">{truncateHash(tx.id)}</TableCell>
                              <TableCell className="font-mono text-xs">
                                {tx.fromAddress ? truncateHash(tx.fromAddress) : 'System'}
                              </TableCell>
                              <TableCell className="font-mono text-xs">{truncateHash(tx.toAddress)}</TableCell>
                              <TableCell className="text-right">{tx.amount.toFixed(8)} AE</TableCell>
                              <TableCell className="text-right">{tx.fee.toFixed(8)} AE</TableCell>
                              <TableCell className="text-right text-xs">{formatDate(tx.timestamp)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </TabsContent>
                
                <TabsContent value="pending" className="m-0">
                  {pendingTxs.length === 0 ? (
                    <div className="text-center p-10 text-muted-foreground bg-muted/30 rounded-lg">
                      <Clock className="mx-auto h-10 w-10 mb-3 opacity-20" />
                      <p>No pending transactions</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px] border rounded-lg">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background">
                          <TableRow>
                            <TableHead>Transaction Hash</TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>To</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Fee</TableHead>
                            <TableHead className="text-right">Timestamp</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingTxs.map((tx) => (
                            <TableRow 
                              key={tx.id}
                              className={confirmingTx === tx.id ? 'bg-primary/5' : ''}
                            >
                              <TableCell className="font-mono text-xs">{truncateHash(tx.id)}</TableCell>
                              <TableCell className="font-mono text-xs">{truncateHash(tx.fromAddress || 'System')}</TableCell>
                              <TableCell className="font-mono text-xs">{truncateHash(tx.toAddress)}</TableCell>
                              <TableCell className="text-right">{tx.amount.toFixed(8)} AE</TableCell>
                              <TableCell className="text-right">{tx.fee.toFixed(8)} AE</TableCell>
                              <TableCell className="text-right text-xs">{formatDate(tx.timestamp)}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={confirmingTx === tx.id ? 'outline' : 'secondary'} 
                                  className="flex items-center gap-1 w-fit"
                                >
                                  {confirmingTx === tx.id ? (
                                    <>
                                      <Clock className="h-3 w-3 animate-spin" /> Confirming...
                                    </>
                                  ) : (
                                    <>
                                      <Clock className="h-3 w-3" /> Pending
                                    </>
                                  )}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  )}
                </TabsContent>
                
                <TabsContent value="my" className="m-0">
                  {!selectedWallet ? (
                    <div className="text-center p-10 text-muted-foreground bg-muted/30 rounded-lg">
                      <Wallet className="mx-auto h-10 w-10 mb-3 opacity-20" />
                      <p>Select a wallet to view your transactions</p>
                    </div>
                  ) : (
                    <>
                      {transactions.filter(tx => 
                        tx.fromAddress === selectedWallet.address || 
                        tx.toAddress === selectedWallet.address
                      ).length === 0 ? (
                        <div className="text-center p-10 text-muted-foreground bg-muted/30 rounded-lg">
                          <FileText className="mx-auto h-10 w-10 mb-3 opacity-20" />
                          <p>No transactions found for this wallet</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[400px] border rounded-lg">
                          <Table>
                            <TableHeader className="sticky top-0 bg-background">
                              <TableRow>
                                <TableHead className="w-[100px]">Type</TableHead>
                                <TableHead>Transaction Hash</TableHead>
                                <TableHead>Details</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="text-right">Fee</TableHead>
                                <TableHead className="text-right">Timestamp</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {transactions
                                .filter(tx => 
                                  tx.fromAddress === selectedWallet.address || 
                                  tx.toAddress === selectedWallet.address
                                )
                                .map((tx) => (
                                  <TableRow key={tx.id}>
                                    <TableCell>
                                      <Badge 
                                        variant={
                                          tx.fromAddress === selectedWallet.address
                                            ? 'outline'
                                            : tx.toAddress === selectedWallet.address
                                            ? 'secondary'
                                            : 'default'
                                        } 
                                        className="flex items-center gap-1 w-fit"
                                      >
                                        {tx.fromAddress === selectedWallet.address ? (
                                          <>
                                            <ArrowUpRight className="h-3 w-3" /> Sent
                                          </>
                                        ) : tx.toAddress === selectedWallet.address ? (
                                          <>
                                            <ArrowDownRight className="h-3 w-3" /> Received
                                          </>
                                        ) : (
                                          <>
                                            <CheckCircle className="h-3 w-3" /> Other
                                          </>
                                        )}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{truncateHash(tx.id)}</TableCell>
                                    <TableCell>
                                      {tx.fromAddress === selectedWallet.address ? (
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs text-muted-foreground">To:</span>
                                          <span className="font-mono text-xs">{truncateHash(tx.toAddress)}</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1">
                                          <span className="text-xs text-muted-foreground">From:</span>
                                          <span className="font-mono text-xs">{truncateHash(tx.fromAddress || 'System')}</span>
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell className={`text-right ${tx.fromAddress === selectedWallet.address ? 'text-red-500' : 'text-green-500'}`}>
                                      {tx.fromAddress === selectedWallet.address ? '-' : '+'}{tx.amount.toFixed(8)} AE
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {tx.fromAddress === selectedWallet.address ? tx.fee.toFixed(8) : '0.00000000'} AE
                                    </TableCell>
                                    <TableCell className="text-right text-xs">{formatDate(tx.timestamp)}</TableCell>
                                  </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" /> Create Transaction
              </CardTitle>
              <CardDescription>
                Send AE tokens to another wallet on the blockchain
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {wallets.length === 0 ? (
                <div className="text-center p-6 bg-muted/30 rounded-lg mb-4">
                  <AlertTriangle className="mx-auto h-10 w-10 mb-3 text-yellow-500" />
                  <p className="font-medium">No wallets available</p>
                  <p className="text-sm text-muted-foreground mt-1">Create or import a wallet to make transactions</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Select wallet</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {wallets.map((wallet) => (
                        <Button
                          key={wallet.id}
                          variant={selectedWallet?.id === wallet.id ? 'default' : 'outline'}
                          className={`justify-start ${
                            selectedWallet?.id === wallet.id ? '' : 'hover:bg-primary/5'
                          }`}
                          onClick={() => setSelectedWallet(wallet)}
                        >
                          <div className="flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{wallet.name || 'Wallet'}</span>
                              <span className="text-xs font-mono">{truncateHash(wallet.address)}</span>
                            </div>
                          </div>
                          <div className="ml-auto flex items-center">
                            <span className="font-medium">{wallet.balance.toFixed(4)}</span>
                            <span className="ml-1 text-xs text-muted-foreground">AE</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="toAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recipient Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter recipient wallet address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input type="number" step="0.000001" {...field} />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    AE
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="fee"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Transaction Fee</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input type="number" step="0.000001" {...field} />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    AE
                                  </div>
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs">
                                Higher fees get processed faster
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="data"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Add optional transaction data" {...field} />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Attach a message or data to your transaction
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={!selectedWallet || form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? (
                          "Processing..."
                        ) : (
                          <>
                            <ArrowRight className="mr-2 h-4 w-4" /> Send Transaction
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col items-start">
              <p className="text-xs text-muted-foreground">
                <AlertTriangle className="inline-block mr-1 h-3 w-3" />
                Transactions are irreversible once confirmed on the blockchain.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}