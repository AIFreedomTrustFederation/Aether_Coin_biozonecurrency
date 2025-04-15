import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNodeMarketplaceApi } from "./hooks/useNodeMarketplaceApi";
import NodeServiceProcessor from "../../components/NodeMarketplace/NodeServiceProcessor";
import NodeRewardCalculator from "../../components/NodeMarketplace/NodeRewardCalculator";
import { Server, Cpu, HardDrive, PlusCircle, Settings, ArrowUpDown, Activity } from "lucide-react";

/**
 * Node Marketplace Micro-App
 * 
 * A dedicated application for deploying services to the FractalCoin
 * decentralized network and managing node operations.
 */
const NodeMarketplaceApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { 
    availableServices, 
    userServices, 
    userRewards,
    isLoading 
  } = useNodeMarketplaceApi();
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Node Marketplace</h1>
            <p className="text-muted-foreground">Deploy and earn on the FractalCoin network</p>
          </div>
        </div>
        
        {/* Main Tabs Interface */}
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
            <TabsTrigger value="manage">My Services</TabsTrigger>
            <TabsTrigger value="earn">Earn</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Network Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-forest-600" />
                    Network Stats
                  </CardTitle>
                  <CardDescription>Current network status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Active Nodes</span>
                      <span className="font-medium">482</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Services Deployed</span>
                      <span className="font-medium">1,854</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Network Health</span>
                      <span className="text-emerald-600 font-medium">Excellent</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Rewards Rate</span>
                      <span className="text-forest-600 font-medium">12.4 ATC/day</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Deploy Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-forest-600" />
                    Quick Deploy
                  </CardTitle>
                  <CardDescription>Launch a new service</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Deploy your application to the FractalCoin decentralized network
                      with quantum-resistant security.
                    </p>
                    
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => {
                          setActiveTab("deploy");
                        }}
                      >
                        <Server className="h-4 w-4 mr-2" />
                        Web Application
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="justify-start"
                        onClick={() => {
                          setActiveTab("deploy");
                        }}
                      >
                        <HardDrive className="h-4 w-4 mr-2" />
                        Storage Solution
                      </Button>
                      
                      <Button 
                        variant="default" 
                        className="mt-2"
                        onClick={() => {
                          setActiveTab("deploy");
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        See All Options
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* My Resources Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-forest-600" />
                    My Resources
                  </CardTitle>
                  <CardDescription>Your network contribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">My Services</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Resource Usage</span>
                      <span className="font-medium">42%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Monthly Cost</span>
                      <span className="text-forest-600 font-medium">$75.20</span>
                    </div>
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setActiveTab("manage");
                        }}
                      >
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Manage Services
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Rewards Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-forest-600" />
                  Earnings Overview
                </CardTitle>
                <CardDescription>
                  Contribute resources and earn rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The FractalCoin network rewards node operators who contribute
                  computing resources to the ecosystem. Run nodes to earn a 
                  combination of Filecoin, FractalCoin, and AICoin.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="font-medium">FileCoin Rewards</div>
                    <div className="text-2xl font-bold text-forest-600 mt-1">
                      0.05 FIL
                      <span className="text-xs font-normal text-muted-foreground ml-1">/ day</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Based on 1TB storage contribution
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="font-medium">FractalCoin Rewards</div>
                    <div className="text-2xl font-bold text-forest-600 mt-1">
                      2.4 ATC
                      <span className="text-xs font-normal text-muted-foreground ml-1">/ day</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Based on current network participation
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="font-medium">AICoin Rewards</div>
                    <div className="text-2xl font-bold text-forest-600 mt-1">
                      5.8 AIC
                      <span className="text-xs font-normal text-muted-foreground ml-1">/ day</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Based on 8-core CPU contribution
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      setActiveTab("earn");
                    }}
                  >
                    Calculate Your Rewards
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Deploy Tab */}
          <TabsContent value="deploy" className="space-y-6">
            <NodeServiceProcessor />
          </TabsContent>
          
          {/* My Services Tab */}
          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Deployed Services</CardTitle>
                <CardDescription>Manage your services on the FractalCoin network</CardDescription>
              </CardHeader>
              <CardContent>
                {/* List of deployed services would go here */}
                <div className="text-center py-8">
                  <Server className="h-12 w-12 text-muted mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Services Deployed Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Deploy your first application on the FractalCoin network
                  </p>
                  <Button
                    onClick={() => {
                      setActiveTab("deploy");
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Deploy New Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Earn Tab */}
          <TabsContent value="earn" className="space-y-6">
            <NodeRewardCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NodeMarketplaceApp;