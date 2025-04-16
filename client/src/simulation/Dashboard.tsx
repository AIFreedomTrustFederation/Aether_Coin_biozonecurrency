/**
 * Bot Simulation Dashboard
 * 
 * This component provides a visual interface for:
 * - Creating and managing bot swarms
 * - Monitoring bot activity in real-time
 * - Viewing analytics and performance metrics
 * - Configuring simulation parameters
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, 
  Bot, 
  UserCog, 
  Users, 
  Activity as ActivityIcon, 
  BarChart2, 
  Settings, 
  PlayCircle, 
  StopCircle,
  Plus,
  Trash2,
  RefreshCw,
  Save,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { BotFactory, BotOrchestrator, BotProfile } from './botSystem';
import { formatNumber } from './utils';

// Create a bot orchestrator instance
const botOrchestrator = new BotOrchestrator();

const SimulationDashboard: React.FC = () => {
  // State for bot management
  const [bots, setBots] = useState<BotProfile[]>([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [swarmSize, setSwarmSize] = useState(20);
  const [activityReports, setActivityReports] = useState<any[]>([]);
  const [networkStats, setNetworkStats] = useState({ botCount: 0, messageCount: 0 });
  const [selectedTab, setSelectedTab] = useState('overview');
  const [filterTerm, setFilterTerm] = useState('');
  
  // References
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effect to clear interval on unmount
  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);
  
  // Initialize bot swarm
  const initializeSwarm = () => {
    // Clear existing bots first
    setBots([]);
    
    // Create new bot swarm
    const newBots = BotFactory.createBotSwarm(swarmSize);
    setBots(newBots);
    
    // Initialize in orchestrator
    botOrchestrator.createBotSwarm(swarmSize);
    
    // Update stats
    setNetworkStats({ botCount: swarmSize, messageCount: 0 });
    setActivityReports([]);
  };
  
  // Start simulation
  const startSimulation = () => {
    if (bots.length === 0) {
      initializeSwarm();
    }
    
    botOrchestrator.startAll();
    setIsSimulationRunning(true);
    
    // Start periodic updates
    updateIntervalRef.current = setInterval(() => {
      setActivityReports(botOrchestrator.getActivityReports());
      setNetworkStats(botOrchestrator.getNetworkStats());
    }, 2000);
  };
  
  // Stop simulation
  const stopSimulation = () => {
    botOrchestrator.stopAll();
    setIsSimulationRunning(false);
    
    // Stop periodic updates
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  };
  
  // Reset simulation
  const resetSimulation = () => {
    stopSimulation();
    setBots([]);
    setActivityReports([]);
    setNetworkStats({ botCount: 0, messageCount: 0 });
  };
  
  // Filter bots by name or behavior
  const filteredBots = bots.filter(bot => 
    bot.name.toLowerCase().includes(filterTerm.toLowerCase()) || 
    bot.behavior.toLowerCase().includes(filterTerm.toLowerCase())
  );
  
  // Calculate activity stats
  const activityStats = {
    totalActivities: activityReports.reduce((sum, report) => sum + report.activityCount, 0),
    activeBotsCount: activityReports.filter(report => report.activityCount > 0).length,
    averageActivitiesPerBot: activityReports.length > 0 
      ? activityReports.reduce((sum, report) => sum + report.activityCount, 0) / activityReports.length 
      : 0
  };
  
  // Bot type distribution
  const botTypeDistribution = bots.reduce((acc, bot) => {
    acc[bot.behavior] = (acc[bot.behavior] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold flex items-center">
        <Bot className="mr-2 h-6 w-6" />
        Aetherion Bot Simulation Dashboard
      </h1>
      <p className="text-muted-foreground">
        Monitor and control autonomous bots interacting with the Aetherion ecosystem
      </p>
      
      <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="overview" className="flex items-center">
            <ActivityIcon className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="bots" className="flex items-center">
            <UserCog className="mr-2 h-4 w-4" />
            Bot Management
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center">
            <Activity className="mr-2 h-4 w-4" />
            Activity Logs
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart2 className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bots</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{networkStats.botCount}</div>
                <p className="text-xs text-muted-foreground">
                  {activityStats.activeBotsCount} active bots
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatNumber(activityStats.totalActivities)}</div>
                <p className="text-xs text-muted-foreground">
                  Avg: {activityStats.averageActivitiesPerBot.toFixed(1)} per bot
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Message Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{networkStats.messageCount}</div>
                <p className="text-xs text-muted-foreground">
                  Messages in processing queue
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Simulation Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Badge variant={isSimulationRunning ? "default" : "secondary"} className={isSimulationRunning ? "bg-green-500" : ""}>
                    {isSimulationRunning ? "Running" : "Stopped"}
                  </Badge>
                  
                  {isSimulationRunning ? (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={stopSimulation}
                      className="flex items-center"
                    >
                      <StopCircle className="mr-1 h-4 w-4" />
                      Stop
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={startSimulation}
                      className="flex items-center"
                    >
                      <PlayCircle className="mr-1 h-4 w-4" />
                      Start
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Bot Type Distribution</CardTitle>
                <CardDescription>
                  Distribution of bot behaviors in the current swarm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(botTypeDistribution).map(([type, count]) => (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{type.replace('-', ' ')}</span>
                        <span>{count} bots</span>
                      </div>
                      <Progress value={(count / bots.length) * 100} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Simulation Controls</CardTitle>
                <CardDescription>
                  Manage your bot simulation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="swarm-size">Swarm Size</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="swarm-size"
                      type="number"
                      min="1"
                      max="100"
                      value={swarmSize}
                      onChange={(e) => setSwarmSize(parseInt(e.target.value) || 1)}
                      disabled={isSimulationRunning}
                    />
                    <Button 
                      onClick={initializeSwarm} 
                      disabled={isSimulationRunning}
                      className="flex items-center"
                    >
                      <RefreshCw className="mr-1 h-4 w-4" />
                      Generate
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <Button 
                    onClick={resetSimulation} 
                    variant="outline"
                    className="flex items-center justify-center"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Reset Simulation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Bot Management Tab */}
        <TabsContent value="bots" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bots..."
                  className="pl-8"
                  value={filterTerm}
                  onChange={(e) => setFilterTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="mr-1 h-4 w-4" />
                Filter
              </Button>
            </div>
            
            <div className="space-x-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Plus className="mr-1 h-4 w-4" />
                Add Bot
              </Button>
              <Button variant="default" size="sm" className="flex items-center">
                <Download className="mr-1 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Behavior</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <Bot className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No bots found</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={initializeSwarm}
                          >
                            Generate Bot Swarm
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBots.map((bot) => {
                      const activity = activityReports.find(r => r.botId === bot.id);
                      return (
                        <TableRow key={bot.id}>
                          <TableCell className="font-medium">{bot.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {bot.behavior.replace('-', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">{bot.specialization.replace('-', ' ')}</TableCell>
                          <TableCell>{formatNumber(bot.balance)} ATC</TableCell>
                          <TableCell>
                            {activity ? (
                              <div className="flex items-center space-x-2">
                                <span>{activity.activityCount}</span>
                                <span className="text-xs text-muted-foreground">actions</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No activity</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">View</Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Activity Logs Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>
                Recent activities from all bots in the simulation
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bot</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Total Activities</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <Activity className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No activity recorded yet</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Start the simulation to see bot activities
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    activityReports
                      .sort((a, b) => (b.lastActivity?.getTime() || 0) - (a.lastActivity?.getTime() || 0))
                      .map((report) => (
                        <TableRow key={report.botId}>
                          <TableCell className="font-medium">{report.botName}</TableCell>
                          <TableCell>
                            {report.lastActivity ? (
                              <span className="text-sm">
                                {new Date(report.lastActivity).toLocaleTimeString()}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">No activity</span>
                            )}
                          </TableCell>
                          <TableCell>{report.activityCount}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">Details</Button>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulation Analytics</CardTitle>
              <CardDescription>
                Performance metrics and simulation insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <BarChart2 className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  Analytics and metrics visualization will be implemented in the next version.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Simulation Settings</CardTitle>
              <CardDescription>
                Configure the bot simulation parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Bot Behavior</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trader-ratio">Trader Ratio</Label>
                    <Slider 
                      id="trader-ratio" 
                      defaultValue={[20]} 
                      max={100}
                      step={1}
                      disabled={isSimulationRunning}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hodler-ratio">Hodler Ratio</Label>
                    <Slider 
                      id="hodler-ratio" 
                      defaultValue={[15]} 
                      max={100}
                      step={1}
                      disabled={isSimulationRunning}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="node-operator-ratio">Node Operator Ratio</Label>
                    <Slider 
                      id="node-operator-ratio" 
                      defaultValue={[25]} 
                      max={100}
                      step={1}
                      disabled={isSimulationRunning}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="developer-ratio">Developer Ratio</Label>
                    <Slider 
                      id="developer-ratio" 
                      defaultValue={[15]} 
                      max={100}
                      step={1}
                      disabled={isSimulationRunning}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Network Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-url">API Base URL</Label>
                    <Input
                      id="api-url"
                      defaultValue="/api"
                      disabled={isSimulationRunning}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeout">Request Timeout (ms)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      defaultValue={30000}
                      disabled={isSimulationRunning}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="enable-retry" defaultChecked disabled={isSimulationRunning} />
                  <Label htmlFor="enable-retry">Enable automatic retry on failure</Label>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Activity Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="activity-level">Default Activity Level</Label>
                    <Select defaultValue="medium" disabled={isSimulationRunning}>
                      <SelectTrigger id="activity-level">
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="min-interval">Min Interval (sec)</Label>
                    <Input
                      id="min-interval"
                      type="number"
                      defaultValue={10}
                      disabled={isSimulationRunning}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-interval">Max Interval (sec)</Label>
                    <Input
                      id="max-interval"
                      type="number"
                      defaultValue={60}
                      disabled={isSimulationRunning}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" disabled={isSimulationRunning}>Reset Defaults</Button>
                <Button className="flex items-center" disabled={isSimulationRunning}>
                  <Save className="mr-1 h-4 w-4" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimulationDashboard;