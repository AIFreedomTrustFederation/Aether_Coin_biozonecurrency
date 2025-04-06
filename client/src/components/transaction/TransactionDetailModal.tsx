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
  
  // Query transaction details
  const { 
    data: transaction, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['/api/transactions', transactionId],
    enabled: !!transactionId && open,
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
  
  // Update form values when transaction data changes
  React.useEffect(() => {
    if (transaction) {
      form.reset({
        plainDescription: transaction.plainDescription || "",
        isLayer2: transaction.isLayer2 || false,
        layer2Type: transaction.layer2Type || undefined,
        layer2Data: transaction.layer2Data || {},
      });
    }
  }, [transaction, form]);
  
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            View and edit transaction details
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-8 text-center">Loading transaction details...</div>
        ) : error || !transaction ? (
          <div className="py-8 text-center text-red-500">
            Error loading transaction details
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="text-base">
                  <Badge variant={transaction.type === 'receive' ? "success" : "default"}>
                    {transaction.type === 'receive' ? 'Receive' : 'Send'}
                  </Badge>
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className={`text-base font-medium ${transaction.type === 'receive' ? 'text-green-500' : ''}`}>
                  {transaction.type === 'receive' ? '+' : '-'}{transaction.amount} {transaction.tokenSymbol}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-base">
                  <Badge 
                    variant={
                      transaction.status === 'completed' ? "success" : 
                      transaction.status === 'pending' ? "outline" : 
                      transaction.status === 'failed' ? "destructive" : 
                      "secondary"
                    }
                  >
                    {transaction.status}
                  </Badge>
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transaction Hash</p>
                <p className="text-base text-sm truncate font-mono">
                  {transaction.txHash}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">From</p>
                <p className="text-base text-sm font-mono">
                  {transaction.fromAddress || 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">To</p>
                <p className="text-base text-sm font-mono">
                  {transaction.toAddress || 'N/A'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-base">
                  {transaction.timestamp 
                    ? format(new Date(transaction.timestamp), 'MMM dd, yyyy HH:mm:ss') 
                    : 'Unknown'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network</p>
                <p className="text-base">
                  {transaction.isLayer2 ? transaction.layer2Type || 'Layer 2' : 'Mainnet'}
                </p>
              </div>
            </div>
            
            <Separator className="my-2" />
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    disabled={descriptionMutation.isPending || layer2Mutation.isPending}
                  >
                    {descriptionMutation.isPending || layer2Mutation.isPending 
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