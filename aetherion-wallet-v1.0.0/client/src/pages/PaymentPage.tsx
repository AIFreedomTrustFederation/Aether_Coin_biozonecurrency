import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentForm } from '@/components/dashboard/PaymentForm';
import { StripePaymentProvider } from '@/components/payment/StripePaymentProvider';
import { OpenSourcePaymentForm } from '@/components/payment/OpenSourcePaymentForm';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CreditCard, Bitcoin } from 'lucide-react';

export function PaymentPage() {
  const [paymentError, setPaymentError] = useState<string | null>(null);

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Payment Center</h1>
          <p className="text-muted-foreground">
            Choose your preferred payment method to fund your Aetherion wallet
          </p>
        </div>

        <Separator />

        {paymentError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{paymentError}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="credit-card" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="credit-card">
              <CreditCard className="mr-2 h-4 w-4" />
              Credit Card
            </TabsTrigger>
            <TabsTrigger value="crypto">
              <Bitcoin className="mr-2 h-4 w-4" />
              Cryptocurrency
            </TabsTrigger>
            <TabsTrigger value="open-source">
              <svg
                className="mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M7 10.5h3v3H7z" />
                <path d="M14 10.5h3v3h-3z" />
                <path d="M12 7.5V9" />
                <path d="M12 15v1.5" />
              </svg>
              Open Source
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credit-card" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Credit Card Payment</CardTitle>
                <CardDescription>
                  Process secure payments via credit or debit card
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StripePaymentProvider>
                  <PaymentForm />
                </StripePaymentProvider>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crypto" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cryptocurrency Payment</CardTitle>
                <CardDescription>
                  Fund your wallet with Bitcoin, Ethereum, or other cryptocurrencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
                  <div className="flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5" />
                    <div>
                      <p className="font-medium">Cryptocurrency payments are coming soon</p>
                      <p className="mt-1 text-sm opacity-80">
                        Direct cryptocurrency deposits will be supported in the next update.
                        For now, please use one of our other payment methods.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="open-source" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Open Source Payment</CardTitle>
                <CardDescription>
                  Support our project with alternative open-source payment options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OpenSourcePaymentForm 
                  onSuccess={(data) => {
                    console.log('Open source payment successful:', data);
                    setPaymentError(null);
                  }}
                  onError={(error) => {
                    console.error('Open source payment error:', error);
                    setPaymentError(error);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Payment Security</CardTitle>
            <CardDescription>
              Information about our secure payment processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                  <svg
                    className="h-5 w-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Secure Transactions</h3>
                  <p className="text-sm text-muted-foreground">
                    All payment information is encrypted with industry-standard SSL/TLS.
                    We never store your full credit card details.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                  <svg
                    className="h-5 w-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Fraud Protection</h3>
                  <p className="text-sm text-muted-foreground">
                    Our payment system includes advanced fraud detection to protect
                    both you and our platform from unauthorized transactions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                  <svg
                    className="h-5 w-5 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M7 15h0M2 9.5h20" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold">Payment Processors</h3>
                  <p className="text-sm text-muted-foreground">
                    We work with established payment processors like Stripe to ensure
                    your payment information is handled according to the highest
                    security standards.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

export default PaymentPage;