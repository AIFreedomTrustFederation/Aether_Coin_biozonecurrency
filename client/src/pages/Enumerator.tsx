import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wallet, Server, Shield, Cpu, TrendingUp, BarChart3, AlertTriangle, Network, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import { eventBus } from "@/registry/EventBus";

// Define types for network stats
interface NetworkStats {
  activeNodes: number;
  averageLatency: number;
  throughputPerSecond: number;
  lastUpdated: Date;
}

/**
 * Simple implementation of the FractalNetworkService 
 * This is directly embedded to ensure it works without module loading issues
 */
class FractalNetworkService {
  private isRunning: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private networkStats = {
    activeNodes: 0,
    averageLatency: 0,
    throughputPerSecond: 0,
    lastUpdated: new Date()
  };

  constructor() {
    console.log('FractalNetworkService initialized');
  }

  public start(): void {
    if (this.isRunning) return;
    
    console.log('Starting FractalNetworkService');
    this.isRunning = true;
    
    // Simulate network activity with periodic health checks
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 10000); // Every 10 seconds
    
    // Initialize with random data
    this.simulateNetworkActivity();
    
    // Announce service started
    eventBus.publish('service:started', {
      serviceId: 'fractalNetwork',
      name: 'Fractal Network Service'
    });
  }

  public stop(): void {
    if (!this.isRunning) return;
    
    console.log('Stopping FractalNetworkService');
    this.isRunning = false;
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    // Announce service stopped
    eventBus.publish('service:stopped', {
      serviceId: 'fractalNetwork',
      name: 'Fractal Network Service'
    });
  }

  public requestStats(): void {
    // Publish current stats
    eventBus.publish('network:stats', {
      ...this.networkStats,
      lastUpdated: new Date()
    });
  }

  private performHealthCheck(): void {
    // Simulate some network activity
    this.simulateNetworkActivity();
    
    // Publish updated stats
    eventBus.publish('network:stats', {
      ...this.networkStats,
      lastUpdated: new Date()
    });
  }

  private simulateNetworkActivity(): void {
    // Simulate network stats with random values
    this.networkStats = {
      activeNodes: Math.floor(30 + Math.random() * 20), // 30-50 nodes
      averageLatency: Math.floor(50 + Math.random() * 100), // 50-150ms
      throughputPerSecond: Math.floor(1000 + Math.random() * 4000), // 1000-5000 tx/s
      lastUpdated: new Date()
    };
  }
}

/**
 * Enumerator Dashboard
 * 
 * Simplified standalone version to ensure reliable loading
 */
const Enumerator: React.FC = () => {
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [services, setServices] = useState<string[]>([]);
  const [networkService] = useState(() => new FractalNetworkService());
  
  // Handle services and network data
  useEffect(() => {
    // Start the network service
    networkService.start();

    // Subscribe to network stats
    const statsSubscription = eventBus.subscribe('network:stats', (data) => {
      setNetworkStats(data);
    });
    
    // Subscribe to service events
    const startSubscription = eventBus.subscribe('service:started', (data) => {
      setServices(prev => [...prev.filter(s => s !== data.name), data.name]);
    });
    
    const stopSubscription = eventBus.subscribe('service:stopped', (data) => {
      setServices(prev => prev.filter(s => s !== data.name));
    });
    
    // Request initial network stats
    setTimeout(() => {
      networkService.requestStats();
    }, 500);
    
    // Cleanup subscriptions when component unmounts
    return () => {
      networkService.stop();
      eventBus.unsubscribe(statsSubscription);
      eventBus.unsubscribe(startSubscription);
      eventBus.unsubscribe(stopSubscription);
    };
  }, [networkService]);
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-6 px-4 bg-background min-h-screen">
        <div className="flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">Enumerator Dashboard</h1>
              <p className="text-muted-foreground">Welcome to the modular Aetherion ecosystem</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1">
                {services.length} Active Services
              </Badge>
              
              <Button size="sm" variant="outline" onClick={() => networkService.requestStats()}>
                <Activity className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Wallet Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-forest-600" />
                  Wallet Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">248.56 ATC</div>
                <div className="text-muted-foreground text-sm mt-1">
                  $2,485.60
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-sm mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>+12.5% (30d)</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Nodes Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <Server className="h-4 w-4 text-forest-600" />
                  Active Nodes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {networkStats ? networkStats.activeNodes : 37}
                </div>
                <div className="text-muted-foreground text-sm mt-1">
                  Network Status: Good
                </div>
                <div className="flex items-center gap-1 text-emerald-600 text-sm mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>~58.2 ATC/day rewards</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Security Status Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <Shield className="h-4 w-4 text-forest-600" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">High</div>
                <div className="text-muted-foreground text-sm mt-1">
                  Last verification: 5m ago
                </div>
                <div className="text-sm mt-1">
                  128-bit quantum resistance
                </div>
              </CardContent>
            </Card>
            
            {/* AI Network Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-forest-600" />
                  AI Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">72%</div>
                <div className="text-muted-foreground text-sm mt-1">
                  Network Utilization
                </div>
                <Progress value={72} className="h-2 mt-2" />
              </CardContent>
            </Card>
          </div>
          
          {/* Network Stats Card (only visible when there are stats) */}
          {networkStats && (
            <Card className="border-blue-200 dark:border-blue-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-md flex items-center gap-2">
                  <Network className="h-4 w-4 text-blue-600" />
                  Network Stats from FractalNetworkService
                </CardTitle>
                <CardDescription>
                  Real-time data provided by the background service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Active Nodes</div>
                    <div className="text-xl font-medium">{networkStats.activeNodes}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Average Latency</div>
                    <div className="text-xl font-medium">{networkStats.averageLatency} ms</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Throughput</div>
                    <div className="text-xl font-medium">{networkStats.throughputPerSecond.toLocaleString()} tx/s</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground border-t pt-3">
                Last updated: {new Date(networkStats.lastUpdated).toLocaleTimeString()}
              </CardFooter>
            </Card>
          )}
          
          {/* Active Services */}
          <Card>
            <CardHeader>
              <CardTitle>Active Services</CardTitle>
              <CardDescription>Background services in the Enumerator architecture</CardDescription>
            </CardHeader>
            <CardContent>
              {services.length === 0 ? (
                <div className="text-muted-foreground py-3 text-center">No services are currently running</div>
              ) : (
                <div className="space-y-2">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <div className="font-medium">{service}</div>
                      <Badge variant="outline" className="ml-auto">Active</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest transactions and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full text-green-600">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">Reward Received</p>
                        <p className="text-sm text-muted-foreground">2 hours ago</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Received 3.2 ATC from node operations
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full text-blue-600">
                      <Server className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">Node Status Update</p>
                        <p className="text-sm text-muted-foreground">5 hours ago</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Node #{Math.floor(Math.random() * 20)} performance optimized, +8% efficiency
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-full text-amber-600">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">Security Alert</p>
                        <p className="text-sm text-muted-foreground">8 hours ago</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Quantum resistance audit completed successfully
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-full text-purple-600">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">Market Update</p>
                        <p className="text-sm text-muted-foreground">12 hours ago</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        ATC price increased by 3.2% in the last 24 hours
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and navigation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/wallet">
                      <Wallet className="mr-2 h-4 w-4" />
                      View Wallet
                    </a>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/node-marketplace">
                      <Server className="mr-2 h-4 w-4" />
                      Manage Nodes
                    </a>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/aicoin">
                      <Cpu className="mr-2 h-4 w-4" />
                      AI Resources
                    </a>
                  </Button>
                  
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="/tokenomics">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Tokenomics
                    </a>
                  </Button>
                  
                  <Button variant="default" className="w-full mt-4">
                    Deploy New Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Enumerator;