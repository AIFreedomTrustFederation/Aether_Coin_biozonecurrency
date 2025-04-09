import * as React from "react";
import { Container } from "@/components/ui/container";
import TransactionExplorer from "@/components/transaction/TransactionExplorer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Info, Wallet } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

export default function TransactionsPage() {
  // Check if there are any wallets
  const { data: wallets = [], isLoading: isLoadingWallets } = useQuery({
    queryKey: ['/api/wallets'],
    retry: 1
  });

  return (
    <Container size="2xl" className="py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transaction Explorer</h1>
          <p className="text-muted-foreground">
            View all of your transactions, including Layer 2 transactions with plain language descriptions
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      {wallets.length === 0 && !isLoadingWallets ? (
        // No wallets state
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 p-4 bg-primary/10 rounded-full">
              <Wallet className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">No Wallets Found</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-lg">
              To view transactions, you need to create or connect a wallet first. 
              Transactions will be displayed here once you've made some using your wallet.
            </p>
            <div className="flex gap-4">
              <Link href="/wallet">
                <Button>Set Up Wallet</Button>
              </Link>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Normal state - show transaction explorer
        <TransactionExplorer limit={50} showFilters={true} />
      )}
      
      {/* Information card */}
      <Card className="bg-muted/40">
        <CardContent className="py-6">
          <div className="flex gap-4">
            <div className="bg-primary/10 p-3 rounded-full h-fit">
              <Info className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">About Transactions</h3>
              <p className="text-muted-foreground">
                This page displays all your blockchain transactions across different networks.
                Layer 2 transactions (Optimism, Arbitrum, etc.) are also included and can be filtered.
                All transaction details are presented in plain language for easier understanding.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}