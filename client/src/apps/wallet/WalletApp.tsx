import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, ArrowUpDown, BarChart3, Clock, Shield } from "lucide-react";

/**
 * Wallet Micro-App
 * 
 * Dedicated application for managing digital assets, viewing balances,
 * and tracking transaction history.
 */
const WalletApp: React.FC = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Wallet</h1>
            <p className="text-muted-foreground">Manage your digital assets</p>
          </div>
        </div>
        
        {/* Wallet Balance Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-forest-600" />
              Total Balance
            </CardTitle>
            <CardDescription>
              Your combined assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="pt-2">
              <div className="text-3xl font-bold">$3,482.56</div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm mt-1">
                <ArrowUpDown className="h-3 w-3" />
                <span>+5.6% (24h)</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Tabs Interface */}
        <Tabs defaultValue="assets" className="w-full">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="transactions">History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          {/* Assets Tab */}
          <TabsContent value="assets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ATC Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-md">FractalCoin (ATC)</CardTitle>
                    <div className="bg-forest-100 dark:bg-forest-900/30 text-forest-800 dark:text-forest-300 text-xs font-medium px-2.5 py-1 rounded">
                      Native
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <div className="text-2xl font-bold">248.62 ATC</div>
                      <div className="text-muted-foreground">$2,486.20</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">Available</div>
                      <div className="text-xs">248.62 ATC</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">Staked</div>
                      <div className="text-xs">0.00 ATC</div>
                    </div>
                    <div className="flex justify-between items-center text-emerald-600 text-xs">
                      <div>24h Change</div>
                      <div>+3.2%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* AIC Card */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-md">AICoin (AIC)</CardTitle>
                    <div className="bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300 text-xs font-medium px-2.5 py-1 rounded">
                      Utility
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <div className="text-2xl font-bold">186.05 AIC</div>
                      <div className="text-muted-foreground">$744.20</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">Available</div>
                      <div className="text-xs">162.55 AIC</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">Allocated</div>
                      <div className="text-xs">23.50 AIC</div>
                    </div>
                    <div className="flex justify-between items-center text-emerald-600 text-xs">
                      <div>24h Change</div>
                      <div>+1.8%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Add more asset cards here */}
            </div>
          </TabsContent>
          
          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-forest-600" />
                  Transaction History
                </CardTitle>
                <CardDescription>
                  Your recent transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Transaction history will appear here</p>
                </div>
                {/* Transaction list would go here */}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-forest-600" />
                  Portfolio Analytics
                </CardTitle>
                <CardDescription>
                  Track your portfolio performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Portfolio analytics will appear here</p>
                </div>
                {/* Analytics charts would go here */}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-forest-600" />
                  Wallet Security
                </CardTitle>
                <CardDescription>
                  Secure your wallet with quantum-resistant protection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Security settings will appear here</p>
                </div>
                {/* Security settings would go here */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WalletApp;