import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const paymentSchema = z.object({
  amount: z.string()
    .min(1, { message: 'Amount is required' })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  currency: z.string().min(1, { message: 'Currency is required' }),
  description: z.string().optional(),
  paymentMethod: z.string().min(1, { message: 'Payment method is required' }),
  walletId: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface OpenSourcePaymentFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function OpenSourcePaymentForm({ onSuccess, onError }: OpenSourcePaymentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: '',
      currency: 'USD',
      description: 'Wallet funding',
      paymentMethod: 'bank_transfer',
      walletId: '',
    },
  });

  const handleSubmit = async (data: PaymentFormValues) => {
    try {
      setIsLoading(true);
      
      // Convert amount to cents (assuming amount is in dollars)
      const amountInCents = Math.round(parseFloat(data.amount) * 100);
      
      // Make API request to process the open-source payment
      const response = await apiRequest('/api/payments/open-source', {
        method: 'POST',
        data: {
          amount: amountInCents,
          currency: data.currency,
          description: data.description,
          paymentMethod: data.paymentMethod,
          walletId: data.walletId ? parseInt(data.walletId) : undefined,
        },
      });
      
      toast({
        title: 'Payment Processed',
        description: 'Your payment has been successfully processed.',
      });
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      toast({
        title: 'Payment Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Open Source Payment</CardTitle>
        <CardDescription>
          Process your payment using our open-source payment option. 
          This option is free of processing fees and uses open standards.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency</SelectItem>
                      <SelectItem value="open_collective">Open Collective</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the open-source payment method you'd like to use
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Payment purpose" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="flex justify-end pt-4 px-0">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Complete Payment'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}