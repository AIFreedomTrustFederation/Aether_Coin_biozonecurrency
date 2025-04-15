import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useApiHook } from "./hooks/useApiHook";
import { Badge } from "@/components/ui/badge";
import { CircleCheck, CircleDashed, LayoutDashboard, Wallet, LineChart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/**
 * Dashboard Micro-App
 * 
 * The main dashboard view that displays an overview of the user's
 * Aetherion ecosystem status, wallet balances, and key metrics.
 */
const DashboardApp: React.FC = () => {
  const { dashboardData, isLoading } = useApiHook();
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your Aetherion Dashboard</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-forest-50 text-forest-700 dark:bg-forest-950/30 dark:text-forest-400">
              <CircleCheck className="h-3 w-3 mr-1 text-forest-600" />
              All Systems Online
            </Badge>
            
            <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              <CircleDashed className="h-3 w-3 mr-1 text-amber-600 animate-spin" />
              Syncing...
            </Badge>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wallet Overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-forest-600" />
                Wallet Overview
              </CardTitle>
              <CardDescription>
                Your asset performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">ATC Balance</span>
                    <span className="font-semibold">248.56 ATC</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-muted-foreground text-sm">USD Value</span>
                    <span className="text-forest-600">$2,485.60</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground text-sm">Monthly Growth</span>
                    <span className="text-emerald-600 font-medium">+12.5%</span>
                  </div>
                  <Progress value={62} className="h-2 bg-muted" />
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                >
                  Manage Wallet
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Node Network */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <LineChart className="h-5 w-5 text-forest-600" />
                Node Network
              </CardTitle>
              <CardDescription>
                Network Performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Active Nodes</span>
                    <span className="font-semibold">37</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-muted-foreground text-sm">Network Health</span>
                    <span className="text-forest-600">Good</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground text-sm">Node Rewards</span>
                    <span className="text-emerald-600 font-medium">58.2 ATC (Last 7d)</span>
                  </div>
                  <Progress value={78} className="h-2 bg-muted" />
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                >
                  View Network
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Quantum Security */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-forest-600" />
                Security Status
              </CardTitle>
              <CardDescription>
                AetherSphere Protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Protection Level</span>
                    <span className="font-semibold">High</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-muted-foreground text-sm">Last Verification</span>
                    <span className="text-forest-600">5m ago</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-muted-foreground text-sm">Quantum Resistance</span>
                    <span className="text-emerald-600 font-medium">128-bit</span>
                  </div>
                  <Progress value={92} className="h-2 bg-muted" />
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2"
                >
                  Security Details
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Additional Content goes here */}
      </div>
    </div>
  );
};

export default DashboardApp;