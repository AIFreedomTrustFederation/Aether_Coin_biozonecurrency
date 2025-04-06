import * as React from "react";
import { Container } from "@/components/ui/container";
import TransactionExplorer from "@/components/transaction/TransactionExplorer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function TransactionsPage() {
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
      
      <TransactionExplorer limit={50} showFilters={true} />
    </Container>
  );
}