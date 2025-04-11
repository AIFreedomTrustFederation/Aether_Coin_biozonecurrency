import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface StripePaymentElementProps {
  clientSecret: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

export function StripePaymentElement({ 
  clientSecret: propClientSecret, 
  onSuccess, 
  onError 
}: StripePaymentElementProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState(propClientSecret);

  useEffect(() => {
    if (propClientSecret) {
      setClientSecret(propClientSecret);
    }
  }, [propClientSecret]);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!clientSecret) {
      return;
    }

    // Check the payment status
    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) {
        setErrorMessage('Something went wrong. Please try again.');
        return;
      }

      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          if (onSuccess) {
            onSuccess(paymentIntent.id);
          }
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          // This is the default state, no need to show a message
          break;
        default:
          setErrorMessage('Something went wrong. Please try again.');
          break;
      }
    });
  }, [stripe, clientSecret, onSuccess]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setErrorMessage(null);

    // Confirm the payment
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/confirmation`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      // Show error to your customer
      setErrorMessage(result.error.message || 'An unexpected error occurred.');
      
      if (onError) {
        onError(result.error.message || 'An unexpected error occurred.');
      }
    } else if (result.paymentIntent) {
      // The payment succeeded
      setMessage('Payment succeeded!');
      
      if (onSuccess) {
        onSuccess(result.paymentIntent.id);
      }
    }

    setIsLoading(false);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
          {message && (
            <Alert className="mb-4">
              <AlertTitle>Payment Status</AlertTitle>
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}
          
          <PaymentElement />
        </CardContent>
        
        <CardFooter className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={isLoading || !stripe || !elements || !!message}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}