import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, CircleDollarSign, Layers, BarChart } from "lucide-react";

/**
 * Tokenomics Micro-App
 * 
 * Dedicated application for exploring the tokenomics of FractalCoin,
 * including supply mechanisms, economic models, and governance.
 */
const TokenomicsApp: React.FC = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tokenomics</h1>
            <p className="text-muted-foreground">FractalCoin economic mechanisms</p>
          </div>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-forest-600" />
                Market Cap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$124.8M</div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+2.4% (24h)</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <Layers className="h-4 w-4 text-forest-600" />
                Circulating Supply
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.48M ATC</div>
              <div className="text-muted-foreground text-sm mt-1">
                of 21M ATC max supply
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <BarChart className="h-4 w-4 text-forest-600" />
                Current Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$10.05</div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+3.2% (24h)</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-forest-600" />
                Network Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4,285 tx/day</div>
              <div className="flex items-center gap-1 text-emerald-600 text-sm mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+18.7% (7d)</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FractalChain Architecture */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>FractalChain Architecture</CardTitle>
              <CardDescription>
                Understanding the FractalChain tokenomics model
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  The FractalCoin ecosystem operates on a "FractalChain" architecture 
                  rather than a traditional blockchain. This innovative approach uses 
                  four purpose-specific tokens that work together to create a stable and 
                  scalable economic framework.
                </p>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Key Components</h3>
                  <ul className="space-y-2">
                    <li className="flex gap-2">
                      <span className="h-2 w-2 rounded-full bg-forest-500 mt-1.5"></span>
                      <div>
                        <span className="font-medium">Trust-Managed Insurance</span>
                        <p className="text-sm text-muted-foreground">
                          FractalCoin includes trust-managed insurance policies to 
                          protect user assets and network stability.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="h-2 w-2 rounded-full bg-forest-500 mt-1.5"></span>
                      <div>
                        <span className="font-medium">Death & Resurrection Cycles</span>
                        <p className="text-sm text-muted-foreground">
                          Market volatility protection through automated death and 
                          resurrection cycles with USDC reserves.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-2">
                      <span className="h-2 w-2 rounded-full bg-forest-500 mt-1.5"></span>
                      <div>
                        <span className="font-medium">Bitcoin-Backed Growth</span>
                        <p className="text-sm text-muted-foreground">
                          Unlimited ATC issuance backed by Bitcoin's scarcity, 
                          creating sustainable support for multiplanetary expansion.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Additional Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Supply Schedule</CardTitle>
              <CardDescription>
                FractalCoin emission and distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Emission Rate</span>
                  <span className="font-medium">144,000 ATC/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Network Rewards</span>
                  <span className="font-medium">67%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Development Fund</span>
                  <span className="font-medium">20%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Community Treasury</span>
                  <span className="font-medium">10%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">FractalVault Reserve</span>
                  <span className="font-medium">3%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TokenomicsApp;