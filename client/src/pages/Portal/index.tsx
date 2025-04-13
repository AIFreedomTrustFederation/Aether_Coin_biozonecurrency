import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Zap, Coins, Shield, ChevronRight, BarChart3 } from 'lucide-react';
import { Link } from 'wouter';

const Portal: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">FractalCoin Portal</h1>
          <p className="text-muted-foreground">
            Access and manage your FractalCoin ecosystem resources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Network Status Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Network Status</CardTitle>
              </div>
              <CardDescription>Current blockchain network metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Nodes</span>
                  <span className="font-medium">1,245</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Block Height</span>
                  <span className="font-medium">3,782,910</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TPS</span>
                  <span className="font-medium">1,200</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network Health</span>
                  <div className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    <span className="font-medium">Excellent</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/network-details">
                <Button variant="outline" size="sm" className="w-full">
                  View Details <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Market Data Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle>Market Data</CardTitle>
              </div>
              <CardDescription>Latest price and market information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FractalCoin Price</span>
                  <span className="font-medium">$42.78</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Change</span>
                  <span className="font-medium text-green-500">+5.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-medium">$4.2B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume (24h)</span>
                  <span className="font-medium">$328M</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/blockchain-dashboard">
                <Button variant="outline" size="sm" className="w-full">
                  Market Analytics <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Wallet Overview Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-primary" />
                <CardTitle>Your Wallet</CardTitle>
              </div>
              <CardDescription>Quick access to your assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">FractalCoin Balance</span>
                  <span className="font-medium">125.45 FRC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">USD Value</span>
                  <span className="font-medium">$5,367.25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Staked</span>
                  <span className="font-medium">50.00 FRC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rewards (Pending)</span>
                  <span className="font-medium">0.78 FRC</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/wallet">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Wallet <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Security Center Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Security Center</CardTitle>
              </div>
              <CardDescription>Protect your assets and account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Security Score</span>
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full w-[85%]"></div>
                    </div>
                    <span className="ml-2 font-medium">85%</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">2FA</span>
                  <span className="font-medium text-green-500">Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Login</span>
                  <span className="font-medium">Today, 10:45 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Sessions</span>
                  <span className="font-medium">2</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/security">
                <Button variant="outline" size="sm" className="w-full">
                  Security Settings <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Quantum Features Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle>Quantum Features</CardTitle>
              </div>
              <CardDescription>Next-generation blockchain capabilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantum Resistance</span>
                  <span className="font-medium text-green-500">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantum Transactions</span>
                  <span className="font-medium">Available</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantum Entropy</span>
                  <span className="font-medium">87.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantum Keys</span>
                  <span className="font-medium">3 Active</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/quantum-security">
                <Button variant="outline" size="sm" className="w-full">
                  Quantum Dashboard <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Developer Tools Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Developer Tools</CardTitle>
              </div>
              <CardDescription>Resources for building on FractalCoin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Status</span>
                  <span className="font-medium text-green-500">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Keys</span>
                  <span className="font-medium">2 Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Calls (24h)</span>
                  <span className="font-medium">1,245</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate Limit</span>
                  <span className="font-medium">10,000/day</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/api-key">
                <Button variant="outline" size="sm" className="w-full">
                  Manage API Keys <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Portal;