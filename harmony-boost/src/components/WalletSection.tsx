
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, ArrowRight, Clock, BarChart3, Send, Plus, Download } from "lucide-react";
import { Link } from "react-router-dom";

const transactions = [
  { id: 1, type: "Received", amount: "+2.5 ATC", from: "0x3a8...7b2c", date: "2 hours ago" },
  { id: 2, type: "Staked", amount: "-5.0 ATC", to: "Ecosystem Pool", date: "1 day ago" },
  { id: 3, type: "Sent", amount: "-1.2 ATC", to: "0x7f4...9d3a", date: "3 days ago" },
];

const WalletSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="gradient-text">Aether Wallet</span> Interface
          </h2>
          <p className="text-muted-foreground">
            Manage your <Link to="/tokenomics" className="text-forest-600 hover:underline">Aether Coins</Link> with our 
            intuitive wallet interface. Secure, transparent, and designed for ecosystem participation.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card className="border-forest-100 overflow-hidden">
            <CardHeader className="bg-forest-50 border-b border-forest-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Aether Wallet</CardTitle>
                  <CardDescription>Your gateway to the ecosystem</CardDescription>
                </div>
                <Wallet className="h-8 w-8 text-forest-600" />
              </div>
            </CardHeader>
            
            <Tabs defaultValue="dashboard">
              <div className="px-6 pt-6">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="stake">Staking</TabsTrigger>
                </TabsList>
              </div>
              
              <CardContent className="p-6">
                <TabsContent value="dashboard" className="space-y-6">
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                    <h3 className="text-4xl font-bold text-forest-800">45.28 ATC</h3>
                    <p className="text-sm text-forest-600">≈ $3.29 USD</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="flex-col h-20 border-forest-200">
                      <Send className="h-4 w-4 mb-1" />
                      <span>Send</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-20 border-forest-200">
                      <Download className="h-4 w-4 mb-1" />
                      <span>Receive</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-20 border-forest-200">
                      <Plus className="h-4 w-4 mb-1" />
                      <span>Buy</span>
                    </Button>
                    <Button variant="outline" className="flex-col h-20 border-forest-200">
                      <BarChart3 className="h-4 w-4 mb-1" />
                      <span>Stake</span>
                    </Button>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Recent Transactions
                    </h4>
                    <div className="space-y-3">
                      {transactions.slice(0, 2).map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{tx.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {tx.from ? `From: ${tx.from}` : `To: ${tx.to}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${tx.amount.startsWith('+') ? 'text-green-600' : ''}`}>
                              {tx.amount}
                            </p>
                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-2 text-sm h-8">
                      View all transactions
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="transactions" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Transaction History</h3>
                    <div className="border rounded-lg divide-y">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{tx.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {tx.from ? `From: ${tx.from}` : `To: ${tx.to}`}
                            </p>
                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                          </div>
                          <p className={`font-medium ${tx.amount.startsWith('+') ? 'text-green-600' : ''}`}>
                            {tx.amount}
                          </p>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" variant="outline">
                      Load More
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="stake" className="space-y-6">
                  <div className="text-center py-4">
                    <h3 className="text-lg font-medium mb-1">Total Staked</h3>
                    <p className="text-3xl font-bold text-forest-800">12.5 ATC</p>
                    <p className="text-sm text-muted-foreground">Current APY: 8.2%</p>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-medium mb-3">Staking Options</h4>
                    <div className="space-y-3">
                      <div className="bg-background rounded border p-3">
                        <div className="flex justify-between mb-2">
                          <h5 className="font-medium">Ecosystem Pool</h5>
                          <span className="text-sm bg-forest-100 px-2 py-0.5 rounded text-forest-700">8.2% APY</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Stake your tokens to support ecosystem development and earn rewards.
                        </p>
                        <Button size="sm" className="bg-forest-600 hover:bg-forest-700">
                          Stake Now
                        </Button>
                      </div>
                      
                      <div className="bg-background rounded border p-3">
                        <div className="flex justify-between mb-2">
                          <h5 className="font-medium">Conservation Pool</h5>
                          <span className="text-sm bg-forest-100 px-2 py-0.5 rounded text-forest-700">10.5% APY</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Higher rewards for supporting direct conservation efforts.
                        </p>
                        <Button size="sm" className="bg-forest-600 hover:bg-forest-700">
                          Stake Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
          
          <div className="mt-8 text-center">
            <Button className="bg-forest-600 hover:bg-forest-700" asChild>
              <Link to="/wallet">
                Access Full Wallet <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WalletSection;
