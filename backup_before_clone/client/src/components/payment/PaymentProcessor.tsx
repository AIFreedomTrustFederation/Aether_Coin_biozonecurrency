import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StripePaymentElement } from './StripePaymentElement';
import { OpenSourcePaymentForm } from './OpenSourcePaymentForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { StripePaymentProvider } from './StripePaymentProvider';

interface PaymentProcessorProps {
  amount: number;
  currency?: string;
  description?: string;
  walletId?: number;
  metadata?: Record<string, any>;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
}

export function PaymentProcessor({
  amount,
  currency = 'USD',
  description = 'Wallet funding',
  walletId,
  metadata = {},
  onSuccess,
  onError,
}: PaymentProcessorProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'open_source'>('stripe');

  // Fetch Stripe payment intent client secret when needed
  const { data: stripeData, error: stripeError, isLoading: isStripeLoading } = useQuery({
    queryKey: ['stripe-payment-intent', amount, currency, selectedPaymentMethod],
    queryFn: async () => {
      if (selectedPaymentMethod !== 'stripe') return null;
      
      const response = await apiRequest('/api/payments/stripe/create-intent', {
        method: 'POST',
        data: {
          amount,
          currency,
          description,
          walletId,
          metadata,
        },
      });
      
      return response;
    },
    enabled: selectedPaymentMethod === 'stripe',
    refetchOnWindowFocus: false,
  });

  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentMethod(value as 'stripe' | 'open_source');
  };

  const handleStripeSuccess = (paymentIntentId: string) => {
    if (onSuccess) {
      onSuccess({
        id: paymentIntentId,
        provider: 'stripe',
        status: 'completed',
        amount,
        currency,
      });
    }
  };

  const handleOpenSourceSuccess = (data: any) => {
    if (onSuccess) {
      onSuccess({
        ...data,
        provider: 'open_source',
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Choose Payment Method</CardTitle>
        <CardDescription>
          Select your preferred payment method to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stripe" onValueChange={handlePaymentMethodChange}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="stripe">Stripe Payment</TabsTrigger>
            <TabsTrigger value="open_source">Open Source Payment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stripe" className="mt-0">
            {stripeError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error loading Stripe</AlertTitle>
                <AlertDescription>
                  {stripeError instanceof Error ? stripeError.message : 'Failed to initialize Stripe payment.'}
                </AlertDescription>
              </Alert>
            ) : isStripeLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : stripeData?.clientSecret ? (
              <StripePaymentProvider>
                <StripePaymentElement 
                  clientSecret={stripeData.clientSecret} 
                  onSuccess={handleStripeSuccess} 
                  onError={onError}
                />
              </StripePaymentProvider>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Stripe Client Secret</AlertTitle>
                <AlertDescription>
                  Unable to initialize Stripe payment processor. Please try the open source payment option.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="open_source" className="mt-0">
            <OpenSourcePaymentForm 
              onSuccess={handleOpenSourceSuccess} 
              onError={onError}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}