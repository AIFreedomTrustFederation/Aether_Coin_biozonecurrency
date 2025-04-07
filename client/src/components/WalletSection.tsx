import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletIcon, ArrowRight, CreditCard, Landmark, History, ShieldCheck } from "lucide-react";
import { Link } from "wouter";

interface WalletSectionProps {
  balances?: Record<string, string>;
  className?: string;
}

const WalletSection: React.FC<WalletSectionProps> = ({ 
  balances = {
    "AETHER": "12,450.00",
    "ETH": "3.25",
    "SINGULARITY": "5,000.00"
  }, 
  className = "" 
}) => {
  return (
    <section className={`mt-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <WalletIcon className="mr-2 h-5 w-5" />
            Wallet Overview
          </CardTitle>
          <CardDescription>
            Manage your wallets, crypto assets, and transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(balances).map(([token, amount]) => (
                <Card key={token} className="bg-secondary/30">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">{token}</div>
                    <div className="text-2xl font-bold mt-1">{amount}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/wallet">
                <Button variant="outline" className="w-full flex items-center justify-between">
                  <span className="flex items-center">
                    <WalletIcon className="mr-2 h-4 w-4" /> My Wallets
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="/payments">
                <Button variant="outline" className="w-full flex items-center justify-between">
                  <span className="flex items-center">
                    <CreditCard className="mr-2 h-4 w-4" /> Payments
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="/transactions">
                <Button variant="outline" className="w-full flex items-center justify-between">
                  <span className="flex items-center">
                    <History className="mr-2 h-4 w-4" /> Transactions
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="/security">
                <Button variant="outline" className="w-full flex items-center justify-between">
                  <span className="flex items-center">
                    <ShieldCheck className="mr-2 h-4 w-4" /> Security
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default WalletSection;