import { useQuery } from '@tanstack/react-query';
import { fetchPayments } from '@/lib/api';
import { Payment } from '@/types/wallet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function PaymentHistory() {
  // Fetch payment history
  const { 
    data: payments, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/payments'],
    queryFn: fetchPayments
  });
  
  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Recent payment transactions</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Recent payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading payment history</p>
        </CardContent>
      </Card>
    );
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'failed':
      case 'refunded':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };
  
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>Recent payment transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {payments && payments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left font-medium">Date</th>
                  <th className="py-3 px-4 text-left font-medium">Description</th>
                  <th className="py-3 px-4 text-left font-medium">Amount</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: Payment) => (
                  <tr key={payment.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm">
                      {format(payment.createdAt, 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-primary" />
                        <span>{payment.description || 'Payment'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {formatCurrency(payment.amount, payment.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getStatusIcon(payment.status)}
                        <span className="ml-2 capitalize">{payment.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <CreditCard className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No payment history</h3>
            <p className="text-gray-500 mt-2">You haven't made any payments yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}