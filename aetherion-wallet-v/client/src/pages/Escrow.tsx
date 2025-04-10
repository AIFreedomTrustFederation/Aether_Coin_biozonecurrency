import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/hooks/use-users";
import { Package, Wallet, CircleDollarSign, Shield } from "lucide-react";
import EscrowCreationForm from "../components/escrow/EscrowCreationForm";
import EscrowTransactionList from "../components/escrow/EscrowTransactionList";
import { EscrowFlowChart } from "@/components/EscrowFlowChart";

export default function EscrowPage() {
  const { currentUser, isLoading } = useCurrentUser();
  const userId = currentUser?.id || 1; // Default to 1 for development
  
  return (
    <div className="container py-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Secure Escrow Service</h1>
        <p className="text-muted-foreground">
          Safely buy and sell goods or services with our quantum-secured escrow payment system.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Value proposition cards */}
        <div className="col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-primary/5 border rounded-lg p-4 flex flex-col items-center text-center">
            <div className="bg-primary/10 rounded-full p-3 mb-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Secure & Trusted</h3>
            <p className="text-sm text-muted-foreground">Protected by quantum-resistant encryption</p>
          </div>

          <div className="bg-primary/5 border rounded-lg p-4 flex flex-col items-center text-center">
            <div className="bg-primary/10 rounded-full p-3 mb-3">
              <CircleDollarSign className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Fair Transactions</h3>
            <p className="text-sm text-muted-foreground">AI dispute resolution prioritizes ethical outcomes</p>
          </div>

          <div className="bg-primary/5 border rounded-lg p-4 flex flex-col items-center text-center">
            <div className="bg-primary/10 rounded-full p-3 mb-3">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Proof System</h3>
            <p className="text-sm text-muted-foreground">Submit evidence of delivery or payment</p>
          </div>

          <div className="bg-primary/5 border rounded-lg p-4 flex flex-col items-center text-center">
            <div className="bg-primary/10 rounded-full p-3 mb-3">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">Multiple Currencies</h3>
            <p className="text-sm text-muted-foreground">Use AETH, BTC, ETH, or stablecoins</p>
          </div>
        </div>

        <div className="md:col-span-1 order-2 md:order-1">
          <div className="bg-card border rounded-lg shadow-sm p-4 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">About Escrow</h2>
            <div className="space-y-4 text-sm">
              <p>
                Our escrow service acts as a secure third party that holds payment until both buyer and seller are satisfied.
              </p>
              
              <div>
                <h3 className="font-medium mb-2">How it works:</h3>
                <EscrowFlowChart />
              </div>
              
              <div>
                <h3 className="font-medium mb-1">In case of disputes:</h3>
                <p className="text-muted-foreground">
                  Mysterion AI analyzes evidence, transaction history, and ethical principles to provide fair resolution.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-1">Matrix Communication:</h3>
                <p className="text-muted-foreground">
                  Each transaction includes a secure Matrix room for buyer and seller to communicate.
                </p>
              </div>
              
              <div className="bg-primary/10 p-3 rounded-md">
                <h3 className="font-medium mb-1">Fee Structure:</h3>
                <p className="text-xs text-muted-foreground">
                  2% fee for standard transactions
                  <br />1% for transactions over 1,000 AETH
                  <br />0.5% for transactions over 10,000 AETH
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 order-1 md:order-2">
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="transactions">My Transactions</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transactions" className="mt-4">
              <EscrowTransactionList userId={userId} />
            </TabsContent>
            
            <TabsContent value="create" className="mt-4">
              <EscrowCreationForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}