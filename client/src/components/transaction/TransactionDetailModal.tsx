import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useLiveMode } from "@/contexts/LiveModeContext";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { apiRequest } from "@/lib/queryClient";

interface TransactionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: number | null;
}

// Validation schema for the transaction description form
const formSchema = z.object({
  plainDescription: z.string().min(3, "Description must be at least 3 characters"),
  isLayer2: z.boolean().default(false),
  layer2Type: z.string().optional(),
  layer2Data: z.record(z.string()).optional(),
});

export default function TransactionDetailModal({ 
  open, 
  onOpenChange,
  transactionId 
}: TransactionDetailModalProps) {
  const queryClient = useQueryClient();
  const { isLiveMode, web3Provider } = useLiveMode();
  
  // This state will hold the transaction data in live mode
  const [web3Transaction, setWeb3Transaction] = React.useState<any>(null);
  const [isLoadingWeb3, setIsLoadingWeb3] = React.useState(false);
  
  // Query transaction details when not in live mode
  const { 
    data: transaction, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['/api/transactions', transactionId],
    enabled: !isLiveMode && !!transactionId && open,
    retry: 1
  });
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plainDescription: transaction?.plainDescription || "",
      isLayer2: transaction?.isLayer2 || false,
      layer2Type: transaction?.layer2Type || undefined,
      layer2Data: transaction?.layer2Data || {},
    },
  });
  
  // Fetch the selected web3 transaction in Live Mode
  React.useEffect(() => {
    if (!isLiveMode || !web3Provider || !open || !transactionId) {
      setWeb3Transaction(null);
      return;
    }
    
    setIsLoadingWeb3(true);
    
    // In a full implementation, we would use the Etherscan API or a similar indexer to get transaction data
    // For this example, we'll assume that transactionId represents an index in a local array
    // Similar to how we populated web3Transactions in the TransactionExplorer component
    
    // This is a simplified example - in a real app we would store transactionHashes and look them up directly
    window.web3TransactionCache?.forEach(tx => {
      if (tx.id === transactionId) {
        setWeb3Transaction(tx);
        
        // Also update the form
        form.reset({
          plainDescription: tx.plainDescription || "",
          isLayer2: tx.isLayer2 || false,
          layer2Type: tx.layer2Type || undefined,
          layer2Data: tx.layer2Data || {},
        });
      }
    });
    
    setIsLoadingWeb3(false);
  }, [isLiveMode, web3Provider, transactionId, open, form]);
  
  // Update form values when transaction data changes (when not in live mode)
  React.useEffect(() => {
    if (!isLiveMode && transaction) {
      form.reset({
        plainDescription: transaction.plainDescription || "",
        isLayer2: transaction.isLayer2 || false,
        layer2Type: transaction.layer2Type || undefined,
        layer2Data: transaction.layer2Data || {},
      });
    }
  }, [transaction, form, isLiveMode]);
  
  // Mutation to update transaction description
  const descriptionMutation = useMutation({
    mutationFn: async (description: string) => {
      return apiRequest(`/api/transactions/${transactionId}/description`, {
        method: 'PATCH',
        body: JSON.stringify({ description }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions', transactionId] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/layer2'] });
    },
  });
  
  // Mutation to update transaction Layer 2 info
  const layer2Mutation = useMutation({
    mutationFn: async (data: { isLayer2: boolean, layer2Type?: string, layer2Data?: Record<string, any> }) => {
      return apiRequest(`/api/transactions/${transactionId}/layer2`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions', transactionId] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/layer2'] });
    },
  });
  
  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Update description if changed
    if (values.plainDescription !== transaction?.plainDescription) {
      await descriptionMutation.mutateAsync(values.plainDescription);
    }
    
    // Update layer 2 info if changed
    if (values.isLayer2 !== transaction?.isLayer2 || 
        values.layer2Type !== transaction?.layer2Type) {
      await layer2Mutation.mutateAsync({
        isLayer2: values.isLayer2,
        layer2Type: values.layer2Type,
        layer2Data: values.layer2Data,
      });
    }
    
    onOpenChange(false);
  };
  
  // Handle form submission
  const onSubmitWeb3 = async (values: z.infer<typeof formSchema>) => {
    // Store updates to the transaction description in localStorage
    if (isLiveMode && web3Transaction) {
      // We would normally make API calls to Etherscan or similar services
      // For this demo, we'll just update the local cache
      if (!window.web3TransactionCache) {
        window.web3TransactionCache = [];
      }
      
      const updatedCache = window.web3TransactionCache.map(tx => {
        if (tx.id === transactionId) {
          return {
            ...tx,
            plainDescription: values.plainDescription,
            isLayer2: values.isLayer2,
            layer2Type: values.layer2Type,
            layer2Data: values.layer2Data
          };
        }
        return tx;
      });
      
      window.web3TransactionCache = updatedCache;
      setWeb3Transaction(prevState => ({
        ...prevState,
        plainDescription: values.plainDescription,
        isLayer2: values.isLayer2,
        layer2Type: values.layer2Type,
        layer2Data: values.layer2Data
      }));
    }
    
    onOpenChange(false);
  };
  
  // Render the active transaction - either from web3 in live mode or from the API
  const activeTransaction = isLiveMode ? web3Transaction : transaction;
  const isActiveLoading = isLiveMode ? isLoadingWeb3 : isLoading;
  const activeSubmitHandler = isLiveMode ? onSubmitWeb3 : onSubmit;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            {isLiveMode ? 'View and edit MetaMask transaction details' : 'View and edit transaction details'}
          </DialogDescription>
        </DialogHeader>
        
        {isActiveLoading ? (
          <div className="py-8 text-center">Loading transaction details...</div>
        ) : (!activeTransaction || (error && !isLiveMode)) ? (
          <div className="py-8 text-center text-red-500">
            Error loading transaction details
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="text-base">
                  <Badge variant={activeTransaction?.type === 'receive' ? "success" : "default"}>
                    {activeTransaction?.type === 'receive' ? 'Receive' : 'Send'}
                  </Badge>
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className={`text-base font-medium ${activeTransaction?.type === 'receive' ? 'text-green-500' : ''}`}>
                  {activeTransaction?.type === 'receive' ? '+' : '-'}{activeTransaction?.amount} {activeTransaction?.tokenSymbol || 'ETH'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-base">
                  <Badge 
                    variant={
                      activeTransaction?.status === 'completed' ? "success" : 
                      activeTransaction?.status === 'pending' ? "outline" : 
                      activeTransaction?.status === 'failed' ? "destructive" : 
                      "secondary"
                    }
                  >
                    {activeTransaction?.status || 'Unknown'}
                  </Badge>
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transaction Hash</p>
                <p className="text-base text-sm truncate font-mono">
                  {activeTransaction?.txHash || 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">From</p>
                <p className="text-base text-sm font-mono">
                  {activeTransaction?.fromAddress || 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">To</p>
                <p className="text-base text-sm font-mono">
                  {activeTransaction?.toAddress || 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-base">
                  {activeTransaction?.timestamp 
                    ? format(new Date(activeTransaction.timestamp), 'MMM dd, yyyy HH:mm:ss') 
                    : 'Unknown'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network</p>
                <p className="text-base">
                  {activeTransaction?.isLayer2 ? activeTransaction.layer2Type || 'Layer 2' : 'Mainnet'}
                </p>
              </div>
            </div>
            
            <Separator className="my-2" />
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(activeSubmitHandler)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="plainDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plain Language Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add a human-readable description of this transaction"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe what this transaction was for in plain language for easier reference.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isLayer2"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Layer 2 Transaction</FormLabel>
                        <FormDescription>
                          Mark this as a Layer 2 transaction (e.g., Optimism, Polygon, Arbitrum)
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {form.watch("isLayer2") && (
                  <FormField
                    control={form.control}
                    name="layer2Type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Layer 2 Network</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Layer 2 network" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="optimism">Optimism</SelectItem>
                            <SelectItem value="arbitrum">Arbitrum</SelectItem>
                            <SelectItem value="polygon">Polygon</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Specify which Layer 2 network this transaction was on
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={isLiveMode ? false : descriptionMutation.isPending || layer2Mutation.isPending}
                  >
                    {isLiveMode ? 'Save Changes' : 
                      (descriptionMutation.isPending || layer2Mutation.isPending) 
                      ? "Saving..." 
                      : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}