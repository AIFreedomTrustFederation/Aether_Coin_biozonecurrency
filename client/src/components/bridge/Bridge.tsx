import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TransactionHistory from './TransactionHistory';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getBridgeConfigurations, 
  getSupportedTokens, 
  getBridgeHealth,
  createBridgeTransaction
} from '@/lib/bridgeAPI';
import { BridgeStatus, BridgeNetwork } from '@/shared/schema';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  bridgeId: z.string().min(1, "Please select a bridge"),
  sourceNetwork: z.string().min(1, "Source network is required"),
  targetNetwork: z.string().min(1, "Target network is required"),
  sourceAddress: z.string().min(1, "Source address is required"),
  targetAddress: z.string().min(1, "Target address is required"),
  amount: z.string().min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  tokenSymbol: z.string().min(1, "Token is required"),
});

type FormValues = z.infer<typeof formSchema>;

const Bridge = () => {
  const queryClient = useQueryClient();
  const [selectedBridge, setSelectedBridge] = useState<number | null>(null);
  const [tab, setTab] = useState('send');
  const [feeEstimate, setFeeEstimate] = useState<any>(null);
  
  // Query for active bridges
  const bridgesQuery = useQuery({
    queryKey: ['/api/bridges'],
    queryFn: () => getBridgeConfigurations(),
  });
  
  // Query for supported tokens (dependent on selected bridge)
  const tokensQuery = useQuery({
    queryKey: ['/api/bridges', selectedBridge, 'tokens'],
    queryFn: () => selectedBridge ? getSupportedTokens(selectedBridge) : Promise.resolve([]),
    enabled: !!selectedBridge,
  });
  
  // Query for bridge health status (dependent on selected bridge)
  const healthQuery = useQuery({
    queryKey: ['/api/bridges', selectedBridge, 'health'],
    queryFn: () => selectedBridge ? getBridgeHealth(selectedBridge) : Promise.resolve(null),
    enabled: !!selectedBridge,
  });
  
  // Mutation for initiating a transfer
  const transferMutation = useMutation({
    mutationFn: (values: FormValues) => {
      return createBridgeTransaction({
        bridgeId: parseInt(values.bridgeId),
        sourceNetwork: values.sourceNetwork,
        targetNetwork: values.targetNetwork,
        sourceAddress: values.sourceAddress,
        targetAddress: values.targetAddress,
        amount: values.amount,
        tokenSymbol: values.tokenSymbol
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bridge-transactions'] });
      form.reset();
      setFeeEstimate(null);
    }
  });
  
  // Mutation for fee estimation
  const estimateFeeMutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (!selectedBridge) return Promise.resolve(null);
      
      // For now, we're using mock fee estimation until the real API is ready
      return Promise.resolve({
        bridgeFee: (parseFloat(values.amount) * 0.005).toFixed(6), // 0.5% fee
        sourceNetworkFee: '0.001 ETH',
        targetNetworkFee: '0.0005 AETH',
        estimatedTimeToCompleteSeconds: 180, // 3 minutes
      });
    },
    onSuccess: (data) => {
      setFeeEstimate(data);
    }
  });
  
  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bridgeId: '',
      sourceNetwork: '',
      targetNetwork: '',
      sourceAddress: '',
      targetAddress: '',
      amount: '',
      tokenSymbol: '',
    },
  });
  
  // Watch form values to update dependent fields
  const bridgeId = form.watch('bridgeId');
  const amount = form.watch('amount');
  const tokenSymbol = form.watch('tokenSymbol');
  const sourceAddress = form.watch('sourceAddress');
  const targetAddress = form.watch('targetAddress');
  
  // Update selected bridge when bridgeId changes
  useEffect(() => {
    if (bridgeId) {
      const parsedId = parseInt(bridgeId);
      setSelectedBridge(parsedId);
      
      // Find the selected bridge and auto-fill source/target networks
      const bridge = bridgesQuery.data?.find(b => b.id === parsedId);
      if (bridge) {
        form.setValue('sourceNetwork', bridge.sourceNetwork);
        form.setValue('targetNetwork', bridge.targetNetwork);
      }
    } else {
      setSelectedBridge(null);
    }
  }, [bridgeId, form, bridgesQuery.data]);
  
  // Update fee estimate when relevant fields change
  useEffect(() => {
    if (
      selectedBridge && 
      amount && 
      tokenSymbol && 
      sourceAddress && 
      targetAddress && 
      !isNaN(parseFloat(amount)) && 
      parseFloat(amount) > 0
    ) {
      const formValues = form.getValues();
      estimateFeeMutation.mutate(formValues);
    } else {
      setFeeEstimate(null);
    }
  }, [selectedBridge, amount, tokenSymbol, sourceAddress, targetAddress]);
  
  // Form submission handler
  const onSubmit = (values: FormValues) => {
    if (feeEstimate) {
      transferMutation.mutate(values);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Aetherion Multi-Chain Bridge</h1>
      
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send">Send Assets</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="send" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Chain Bridge Transfer</CardTitle>
              <CardDescription>
                Transfer assets between Aetherion and other blockchain networks.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Bridge Selection */}
                  <FormField
                    control={form.control}
                    name="bridgeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bridge</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={bridgesQuery.isLoading || transferMutation.isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a bridge" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bridgesQuery.data?.map((bridge) => (
                              <SelectItem key={bridge.id} value={bridge.id.toString()}>
                                {bridge.name} ({bridge.sourceNetwork} ⟷ {bridge.targetNetwork})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose the blockchain bridge you want to use.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Networks (read-only, auto-filled based on bridge) */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sourceNetwork"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source Network</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="targetNetwork"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Network</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Token selection */}
                  <FormField
                    control={form.control}
                    name="tokenSymbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={!selectedBridge || tokensQuery.isLoading || transferMutation.isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a token" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tokensQuery.data?.filter(token => token.isEnabled).map((token) => (
                              <SelectItem key={token.id} value={token.tokenSymbol}>
                                {token.tokenName} ({token.tokenSymbol})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the token you want to transfer.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Amount */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="any" 
                            min="0"
                            placeholder="0.00" 
                            disabled={transferMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the amount you want to transfer.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Source and Target addresses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sourceAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Source Address</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter source wallet address" 
                              disabled={transferMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="targetAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Address</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Enter target wallet address" 
                              disabled={transferMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Fee Estimate Display */}
                  {feeEstimate && (
                    <Alert className="bg-muted">
                      <AlertTitle>Fee Estimate</AlertTitle>
                      <AlertDescription>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Amount:</span>
                            <span className="font-medium">{amount} {tokenSymbol}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Bridge Fee:</span>
                            <span className="font-medium">{feeEstimate.bridgeFee} {tokenSymbol}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Source Network Fee:</span>
                            <span className="font-medium">{feeEstimate.sourceNetworkFee}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Target Network Fee:</span>
                            <span className="font-medium">{feeEstimate.targetNetworkFee}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-border">
                            <span className="font-bold">Total:</span>
                            <span className="font-bold">
                              {(parseFloat(amount) + parseFloat(feeEstimate.bridgeFee)).toFixed(6)} {tokenSymbol}
                            </span>
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                            <span>Estimated completion time:</span>
                            <span>
                              {Math.floor(feeEstimate.estimatedTimeToCompleteSeconds / 60)} minutes
                            </span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Bridge Health Status */}
                  {healthQuery.data && (
                    <div className="rounded-md bg-secondary p-3 text-sm">
                      <div className="flex items-center mb-2">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                          healthQuery.data.status === BridgeStatus.ACTIVE 
                            ? 'bg-green-500' 
                            : healthQuery.data.status === BridgeStatus.PAUSED
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`} />
                        <span className="font-medium">
                          Bridge Status: {healthQuery.data.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>Active Validators: {healthQuery.data.activeValidators}/{healthQuery.data.totalValidators}</div>
                        <div>Pending Txs: {healthQuery.data.pendingTransactions}</div>
                        <div>24h Volume: {healthQuery.data.volumeLast24h}</div>
                        <div>Avg. Completion: {Math.floor(healthQuery.data.averageCompletionTimeSeconds / 60)}min</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    disabled={
                      !feeEstimate || 
                      transferMutation.isPending || 
                      (healthQuery.data?.status !== BridgeStatus.ACTIVE)
                    }
                    className="w-full"
                  >
                    {transferMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : 'Initiate Transfer'}
                  </Button>
                  
                  {/* Success/Error Messages */}
                  {transferMutation.isSuccess && (
                    <Alert className="bg-green-50 border-green-200 text-green-800">
                      <AlertTitle>Success!</AlertTitle>
                      <AlertDescription>
                        Your transfer has been initiated. You can track its progress in the transaction history.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {transferMutation.isError && (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        {(transferMutation.error as Error)?.message || 'Failed to initiate transfer. Please try again.'}
                      </AlertDescription>
                    </Alert>
                  )}
                </form>
              </Form>
            </CardContent>
            
            <CardFooter className="flex justify-between text-sm text-muted-foreground">
              <div>* All transfers are subject to validator approval</div>
              <div>Powered by Aetherion Quantum Bridge</div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <TransactionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Bridge;