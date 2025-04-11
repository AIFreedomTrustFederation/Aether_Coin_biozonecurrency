import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { fetchWallets } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

// Form validation schema
const paymentSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  currency: z.string().min(1, 'Currency is required'),
  description: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  walletId: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface OpenSourcePaymentFormProps {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function OpenSourcePaymentForm({ onSuccess, onError }: OpenSourcePaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Fetch wallets for the wallet selection dropdown
  const { data: wallets } = useQuery({
    queryKey: ['/api/wallets'],
    queryFn: fetchWallets
  });
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: '',
      currency: 'usd',
      description: '',
      paymentMethod: 'credit_card',
      walletId: 'none',
    },
  });
  
  const handleSubmit = async (data: PaymentFormValues) => {
    try {
      setIsLoading(true);
      
      // Convert amount to cents (assuming amount is in dollars)
      const amountInCents = Math.round(parseFloat(data.amount) * 100);
      
      // Make API request to process the open-source payment
      const response = await apiRequest(
        'POST',
        '/api/payments/open-source',
        {
          amount: amountInCents,
          currency: data.currency,
          description: data.description || "Open Source Payment",
          paymentMethod: data.paymentMethod,
          walletId: data.walletId && data.walletId !== 'none' ? parseInt(data.walletId) : undefined,
        }
      );
      
      toast({
        title: 'Payment Processed',
        description: 'Your payment has been successfully processed.',
      });
      
      if (onSuccess) {
        onSuccess(response);
      }
      
      // Reset form
      form.reset();
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
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
            $
          </span>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="0.01"
            className="rounded-l-none"
            {...form.register('amount')}
          />
        </div>
        {form.formState.errors.amount && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select
          defaultValue={form.getValues('currency')}
          onValueChange={(value) => form.setValue('currency', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="usd">USD</SelectItem>
            <SelectItem value="eur">EUR</SelectItem>
            <SelectItem value="gbp">GBP</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.currency && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.currency.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select
          defaultValue={form.getValues('paymentMethod')}
          onValueChange={(value) => form.setValue('paymentMethod', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="crypto">Cryptocurrency</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.paymentMethod && (
          <p className="text-sm text-destructive mt-1">{form.formState.errors.paymentMethod.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="walletId">Destination Wallet (Optional)</Label>
        <Select
          defaultValue={form.getValues('walletId')}
          onValueChange={(value) => form.setValue('walletId', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select wallet (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No specific wallet</SelectItem>
            {wallets && wallets.map((wallet) => (
              <SelectItem key={wallet.id} value={wallet.id.toString()}>
                {wallet.name} ({wallet.symbol})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          placeholder="Payment description"
          {...form.register('description')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Process Payment
          </>
        )}
      </Button>
    </form>
  );
}

export default OpenSourcePaymentForm;