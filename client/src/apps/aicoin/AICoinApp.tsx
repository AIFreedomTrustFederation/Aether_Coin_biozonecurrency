import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cpu, Network, Database, BarChart3, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/**
 * AICoin Micro-App
 * 
 * Dedicated application for the AI resource allocation network,
 * allowing users to contribute computation resources and earn
 * AICoin tokens.
 */
const AICoinApp: React.FC = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">AICoin</h1>
            <p className="text-muted-foreground">AI resource allocation network</p>
          </div>
        </div>
        
        {/* Overview Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cpu className="h-5 w-5 text-forest-600" />
              AI Network Overview
            </CardTitle>
            <CardDescription>
              Decentralized compute resources for AI workloads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="font-medium flex items-center gap-2">
                    <Server className="h-4 w-4 text-forest-600" />
                    Active Nodes
                  </div>
                  <div className="text-2xl font-bold mt-1">1,248</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Across 42 countries
                  </div>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="font-medium flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-forest-600" />
                    Total Compute
                  </div>
                  <div className="text-2xl font-bold mt-1">84.6 PFLOPS</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Combined processing power
                  </div>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="font-medium flex items-center gap-2">
                    <Database className="h-4 w-4 text-forest-600" />
                    AIC Price
                  </div>
                  <div className="text-2xl font-bold mt-1">$4.25</div>
                  <div className="text-xs text-emerald-600 mt-1">
                    +8.2% (24h)
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Network Utilization</span>
                  <span className="text-sm font-medium">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Tabs Interface */}
        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="grid grid-cols-3 w-full md:w-auto">
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Compute Resources</CardTitle>
                <CardDescription>
                  Contribute your computing power to earn AICoin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between mb-3">
                        <h3 className="font-medium">CPU Resources</h3>
                        <span className="text-sm text-muted-foreground">4 cores active</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Usage</span>
                          <span className="text-sm">68%</span>
                        </div>
                        <Progress value={68} className="h-2" />
                        <div className="text-sm text-muted-foreground">
                          Earning: ~0.48 AIC/day
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between mb-3">
                        <h3 className="font-medium">GPU Resources</h3>
                        <span className="text-sm text-muted-foreground">Not connected</span>
                      </div>
                      <div className="space-y-3">
                        <div className="py-6 text-center text-muted-foreground text-sm">
                          Connect GPU resources to earn more AICoin
                        </div>
                        <Button className="w-full">
                          Connect GPU
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md">Resource Earnings (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32 w-full flex items-center justify-center text-muted-foreground">
                        Chart placeholder
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Computation Marketplace</CardTitle>
                <CardDescription>
                  Buy and sell AI computation resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-8 text-center">
                  <Network className="h-12 w-12 text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">AI Marketplace Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    The AICoin marketplace will allow you to buy and sell AI computation 
                    resources in a decentralized, secure environment.
                  </p>
                  <Button variant="outline">
                    Join Waitlist
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-forest-600" />
                  AICoin Analytics
                </CardTitle>
                <CardDescription>
                  Network metrics and token performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Analytics data will be displayed here</p>
                </div>
                {/* Analytics charts would go here */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AICoinApp;