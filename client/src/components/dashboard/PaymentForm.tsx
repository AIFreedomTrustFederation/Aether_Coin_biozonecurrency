import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPaymentMethods, processPayment, createPaymentIntent } from '@/lib/api';
import { fetchWallets } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PaymentForm() {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [currency, setCurrency] = useState<string>('usd');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch payment methods
  const { 
    data: paymentMethods, 
    isLoading: isLoadingPaymentMethods
  } = useQuery({
    queryKey: ['/api/payment-methods'],
    queryFn: fetchPaymentMethods
  });
  
  // Fetch wallets
  const { 
    data: wallets, 
    isLoading: isLoadingWallets
  } = useQuery({
    queryKey: ['/api/wallets'],
    queryFn: fetchWallets
  });
  
  // Process payment mutation
  const processMutation = useMutation({
    mutationFn: (params: { 
      paymentMethodId: number; 
      amount: number; 
      currency: string; 
      description: string; 
      walletId?: number 
    }) => {
      return processPayment(
        params.paymentMethodId, 
        params.amount, 
        params.currency, 
        params.description, 
        params.walletId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      setPaymentStatus('success');
      toast({
        title: "Payment successful",
        description: "Your payment has been processed successfully.",
      });
      
      // Reset form after success
      setTimeout(() => {
        setAmount('');
        setDescription('');
        setPaymentMethodId('');
        setPaymentStatus('idle');
      }, 3000);
    },
    onError: (error) => {
      setPaymentStatus('error');
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Create payment intent mutation (alternative flow)
  const intentMutation = useMutation({
    mutationFn: (params: { amount: number; currency: string; metadata?: Record<string, any> }) => {
      return createPaymentIntent(params.amount, params.currency, params.metadata);
    },
    onSuccess: (data) => {
      // In a real app, this would redirect to a Stripe checkout page or use Stripe Elements
      console.log('Payment intent created:', data);
      toast({
        title: "Payment intent created",
        description: `Ready to process payment with client secret: ${data.clientSecret.substring(0, 10)}...`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create payment intent",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !paymentMethodId) {
      toast({
        title: "Missing information",
        description: "Please provide amount and select a payment method",
        variant: "destructive"
      });
      return;
    }
    
    setPaymentStatus('processing');
    
    const amountCents = parseFloat(amount) * 100; // Convert to cents
    const params = {
      paymentMethodId: parseInt(paymentMethodId),
      amount: amountCents,
      currency,
      description: description || 'Wallet funding',
      walletId: walletId ? parseInt(walletId) : undefined
    };
    
    processMutation.mutate(params);
  };
  
  const isLoading = isLoadingPaymentMethods || isLoadingWallets;
  
  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Make a Payment</CardTitle>
        <CardDescription>Add funds to your wallet</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : paymentStatus === 'success' ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h3 className="text-xl font-semibold">Payment Successful</h3>
            <p className="text-gray-500">Your payment has been processed successfully.</p>
          </div>
        ) : paymentStatus === 'error' ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <h3 className="text-xl font-semibold">Payment Failed</h3>
            <p className="text-gray-500">There was an error processing your payment. Please try again.</p>
            <Button onClick={() => setPaymentStatus('idle')}>Try Again</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded-l-none"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                  <SelectItem value="gbp">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              {paymentMethods && paymentMethods.length > 0 ? (
                <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        {method.type === 'card' ? 'Card' : 'Bank Account'} 
                        {method.last4 && ` •••• ${method.last4}`}
                        {method.isDefault ? ' (Default)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center justify-center p-4 border rounded-md">
                  <p className="text-gray-500">No payment methods available</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="wallet">Destination Wallet (Optional)</Label>
              <Select value={walletId} onValueChange={setWalletId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select wallet (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific wallet</SelectItem>
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={processMutation.isPending || !amount || !paymentMethodId}
            >
              {processMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Process Payment
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}