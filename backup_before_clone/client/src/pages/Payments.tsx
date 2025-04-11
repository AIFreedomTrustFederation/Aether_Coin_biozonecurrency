import { PaymentMethods } from "@/components/dashboard/PaymentMethods";
import { PaymentForm } from "@/components/dashboard/PaymentForm";
import { PaymentHistory } from "@/components/dashboard/PaymentHistory";

export default function Payments() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Payments</h1>
        <p className="text-muted-foreground">
          Manage your payment methods and fund your wallets
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentMethods />
        <PaymentForm />
      </div>
      
      <PaymentHistory />
    </div>
  );
}