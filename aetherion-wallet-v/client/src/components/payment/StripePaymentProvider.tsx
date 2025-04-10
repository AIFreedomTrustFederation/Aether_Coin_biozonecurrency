import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Skeleton } from '@/components/ui/skeleton';

// Create a type for the component props (children)
interface StripePaymentProviderProps {
  children: React.ReactNode;
}

// This component wraps the Stripe Elements provider
export function StripePaymentProvider({ children }: StripePaymentProviderProps) {
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load Stripe asynchronously on component mount
    async function loadStripePublishableKey() {
      try {
        // This would ideally come from an API call to your backend
        // For security, the publishable key should be retrieved from your server
        const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
          'pk_test_placeholder_key_for_development';

        // Don't proceed if we don't have a valid key
        if (!publishableKey || publishableKey.startsWith('pk_test_placeholder')) {
          console.warn('Using Stripe test key. Set VITE_STRIPE_PUBLISHABLE_KEY for production.');
        }

        // Initialize Stripe
        const stripeInstance = loadStripe(publishableKey);
        setStripePromise(stripeInstance);
      } catch (error) {
        console.error('Failed to load Stripe:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadStripePublishableKey();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-10 w-1/2 mx-auto" />
      </div>
    );
  }

  // If we failed to load Stripe, show an error
  if (!stripePromise) {
    return (
      <div className="p-4 border border-destructive text-destructive rounded-md">
        <h3 className="font-semibold">Payment processing unavailable</h3>
        <p className="text-sm mt-1">
          The payment system could not be initialized. Please try again later or contact support.
        </p>
      </div>
    );
  }

  // Render children with Stripe Elements context
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}

export default StripePaymentProvider;