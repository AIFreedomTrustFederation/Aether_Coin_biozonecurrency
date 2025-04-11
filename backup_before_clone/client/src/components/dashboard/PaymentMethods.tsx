import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPaymentMethods, saveStripePaymentMethod, deletePaymentMethod, updatePaymentMethodDefault } from '@/lib/api';
import { PaymentMethod } from '@/types/wallet';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Trash2 } from 'lucide-react';

// Mock Stripe Elements replacement (in a real app you'd use @stripe/react-stripe-js)
// This is just for demonstration purposes
const StripeCardElement = () => {
  return (
    <div className="p-4 border rounded-md bg-slate-50">
      <div className="mb-2">
        <Label htmlFor="card-number">Card Number</Label>
        <Input id="card-number" placeholder="4242 4242 4242 4242" className="bg-white" />
      </div>
      <div className="mb-2 grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="expiry">Expiry (MM/YY)</Label>
          <Input id="expiry" placeholder="12/25" className="bg-white" />
        </div>
        <div>
          <Label htmlFor="cvc">CVC</Label>
          <Input id="cvc" placeholder="123" className="bg-white" />
        </div>
      </div>
    </div>
  );
};

export function PaymentMethods() {
  const [showAddCard, setShowAddCard] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch payment methods
  const { 
    data: paymentMethods, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['/api/payment-methods'],
    queryFn: fetchPaymentMethods
  });
  
  // Add a new payment method
  const addPaymentMethod = useMutation({
    mutationFn: (stripePaymentMethodId: string) => {
      return saveStripePaymentMethod(stripePaymentMethodId, isDefault);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      toast({
        title: "Payment method added",
        description: "Your new payment method has been successfully added."
      });
      setShowAddCard(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to add payment method",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Delete a payment method
  const removePaymentMethod = useMutation({
    mutationFn: (id: number) => {
      return deletePaymentMethod(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      toast({
        title: "Payment method removed",
        description: "The payment method has been successfully removed."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove payment method",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Set a payment method as default
  const setDefaultPaymentMethod = useMutation({
    mutationFn: (id: number) => {
      return updatePaymentMethodDefault(id, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      toast({
        title: "Default payment method updated",
        description: "Your default payment method has been updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update default payment method",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  // In a real app, this would use the Stripe SDK to create a payment method
  const handleAddCard = () => {
    // Mock creating a Stripe payment method
    const mockStripePaymentMethodId = `pm_${Math.random().toString(36).substring(2, 15)}`;
    addPaymentMethod.mutate(mockStripePaymentMethodId);
  };
  
  const handleRemoveCard = (id: number) => {
    removePaymentMethod.mutate(id);
  };
  
  const handleSetDefault = (id: number) => {
    setDefaultPaymentMethod.mutate(id);
  };
  
  if (isLoading) {
    return (
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading payment methods</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>Manage your payment methods</CardDescription>
      </CardHeader>
      <CardContent>
        {paymentMethods && paymentMethods.length > 0 ? (
          <div className="space-y-4">
            {paymentMethods.map((method: PaymentMethod) => (
              <div key={method.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center space-x-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">
                      {method.type === 'card' ? 'Card' : 'Bank Account'} 
                      {method.last4 && <span> •••• {method.last4}</span>}
                    </p>
                    {method.expiryMonth && method.expiryYear && (
                      <p className="text-sm text-gray-500">
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </p>
                    )}
                    {method.isDefault && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!method.isDefault && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                      disabled={setDefaultPaymentMethod.isPending}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => handleRemoveCard(method.id)}
                    disabled={removePaymentMethod.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No payment methods added yet</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
          <DialogTrigger asChild>
            <Button className="w-full">Add Payment Method</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new payment method</DialogTitle>
              <DialogDescription>
                Add a credit or debit card to your account
              </DialogDescription>
            </DialogHeader>
            
            <StripeCardElement />
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="default" 
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
              <Label htmlFor="default">Make this my default payment method</Label>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowAddCard(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddCard}
                disabled={addPaymentMethod.isPending}
              >
                {addPaymentMethod.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Add Card
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}