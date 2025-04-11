import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Cpu,
  Terminal,
  GitBranch,
  GitFork,
  Network,
  Bot,
  AlertTriangle,
  Shield,
  PlayCircle,
  PauseCircle,
  RotateCw,
  Upload,
  Download,
  CheckCircle,
  RefreshCw,
  HelpCircle,
  Lock,
  Send
} from 'lucide-react';

// Interface for the AI agent deployment
interface AIAgent {
  id: number;
  name: string;
  type: 'smart-contract' | 'monitoring' | 'security' | 'utility';
  status: 'active' | 'idle' | 'error';
  deploymentDate: Date;
  lastActiveTime: Date;
  version: string;
  processor: 'quantum' | 'fractal' | 'standard';
  memoryUsage: number;
  cpuUsage: number;
  deployedByUserId: number;
}

// Interface for learning stats
interface LearningStats {
  totalDataPoints: number;
  modelAccuracy: number;
  trainingIterations: number;
  lastTrainingDate: Date;
  improvementRate: number;
  categoriesLearned: string[];
}

// Interface for fractal network nodes
interface FractalNode {
  id: string;
  status: 'online' | 'offline' | 'syncing';
  type: 'primary' | 'secondary' | 'recursive';
  connections: number;
  region: string;
  latency: number;
  quantumState: 'stable' | 'entangled' | 'superposition';
  lastSyncTime: Date;
}

// Mock data for AI agents
const mockAgents: AIAgent[] = [
  {
    id: 1,
    name: 'ContractValidator',
    type: 'smart-contract',
    status: 'active',
    deploymentDate: new Date('2025-03-15'),
    lastActiveTime: new Date(),
    version: '1.2.0',
    processor: 'quantum',
    memoryUsage: 45,
    cpuUsage: 32,
    deployedByUserId: 1
  },
  {
    id: 2,
    name: 'TransactionGuardian',
    type: 'security',
    status: 'active',
    deploymentDate: new Date('2025-02-20'),
    lastActiveTime: new Date(),
    version: '2.1.0',
    processor: 'fractal',
    memoryUsage: 60,
    cpuUsage: 55,
    deployedByUserId: 1
  },
  {
    id: 3,
    name: 'QuantumEntangler',
    type: 'utility',
    status: 'idle',
    deploymentDate: new Date('2025-01-10'),
    lastActiveTime: new Date('2025-04-02'),
    version: '1.0.5',
    processor: 'quantum',
    memoryUsage: 15,
    cpuUsage: 5,
    deployedByUserId: 1
  },
  {
    id: 4,
    name: 'FractalMonitor',
    type: 'monitoring',
    status: 'active',
    deploymentDate: new Date('2025-03-01'),
    lastActiveTime: new Date(),
    version: '1.3.2',
    processor: 'fractal',
    memoryUsage: 50,
    cpuUsage: 40,
    deployedByUserId: 1
  },
  {
    id: 5,
    name: 'SecurityAnalyzer',
    type: 'security',
    status: 'error',
    deploymentDate: new Date('2025-02-15'),
    lastActiveTime: new Date('2025-04-01'),
    version: '1.1.0',
    processor: 'standard',
    memoryUsage: 75,
    cpuUsage: 90,
    deployedByUserId: 1
  },
];

// Mock learning stats
const mockLearningStats: LearningStats = {
  totalDataPoints: 2457892,
  modelAccuracy: 96.7,
  trainingIterations: 348,
  lastTrainingDate: new Date('2025-04-01'),
  improvementRate: 0.03,
  categoriesLearned: [
    'Transaction Patterns',
    'Smart Contract Vulnerabilities',
    'Quantum Attack Vectors',
    'User Behavior Analysis',
    'Network Anomalies',
    'Fractal Optimization'
  ]
};

// Mock fractal nodes
const mockFractalNodes: FractalNode[] = [
  {
    id: 'node-001',
    status: 'online',
    type: 'primary',
    connections: 24,
    region: 'North America',
    latency: 12,
    quantumState: 'stable',
    lastSyncTime: new Date()
  },
  {
    id: 'node-002',
    status: 'online',
    type: 'secondary',
    connections: 16,
    region: 'Europe',
    latency: 45,
    quantumState: 'entangled',
    lastSyncTime: new Date()
  },
  {
    id: 'node-003',
    status: 'syncing',
    type: 'recursive',
    connections: 8,
    region: 'Asia',
    latency: 78,
    quantumState: 'superposition',
    lastSyncTime: new Date()
  },
  {
    id: 'node-004',
    status: 'offline',
    type: 'secondary',
    connections: 0,
    region: 'South America',
    latency: 0,
    quantumState: 'stable',
    lastSyncTime: new Date('2025-04-01')
  },
  {
    id: 'node-005',
    status: 'online',
    type: 'recursive',
    connections: 32,
    region: 'Australia',
    latency: 60,
    quantumState: 'entangled',
    lastSyncTime: new Date()
  },
];

// Mock terminal commands and responses
const mockTerminalHistory = [
  { type: 'command', content: 'system status', timestamp: new Date('2025-04-03T08:15:00Z') },
  { type: 'response', content: 'Singularity AI System Status: OPERATIONAL\nTotal Agents: 39\nActive Agents: 35\nIdle Agents: 3\nError Agents: 1\nFractal Network: STABLE\nQuantum Security Layer: ACTIVE', timestamp: new Date('2025-04-03T08:15:01Z') },
  { type: 'command', content: 'agent list --status=error', timestamp: new Date('2025-04-03T08:15:10Z') },
  { type: 'response', content: 'Error Agents:\n- SecurityAnalyzer (ID: 5)\n  Error: Quantum state decoherence detected\n  Last Active: 2025-04-01 12:34:56', timestamp: new Date('2025-04-03T08:15:11Z') },
  { type: 'command', content: 'repair agent 5', timestamp: new Date('2025-04-03T08:15:20Z') },
  { type: 'response', content: 'Initiating quantum state realignment for agent SecurityAnalyzer...\nRealignment complete. Agent status changed to IDLE.', timestamp: new Date('2025-04-03T08:15:25Z') },
];

const AISystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('metrics');
  const [agents, setAgents] = useState<AIAgent[]>(mockAgents);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState(mockTerminalHistory);
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll terminal to bottom when new commands/responses are added
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };
  
  // Terminal command handler
  const handleTerminalCommand = () => {
    if (!terminalInput.trim()) return;
    
    // Add user command to history
    const newCommand = { 
      type: 'command', 
      content: terminalInput, 
      timestamp: new Date() 
    };
    
    setTerminalHistory([...terminalHistory, newCommand]);
    setIsProcessing(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      let responseContent = '';
      
      // Very basic command parsing
      if (terminalInput.toLowerCase().includes('status')) {
        responseContent = 'Singularity AI System Status: OPERATIONAL\nTotal Agents: 39\nActive Agents: 35\nIdle Agents: 3\nError Agents: 1\nFractal Network: STABLE\nQuantum Security Layer: ACTIVE\nCurrent Threat Level: LOW';
      } else if (terminalInput.toLowerCase().includes('help')) {
        responseContent = 'Available commands:\n- system status - Check the overall system status\n- agent list - List all agents\n- agent list --status=<status> - List agents with specific status\n- agent deploy <name> <type> - Deploy a new agent\n- repair agent <id> - Attempt to fix an agent in error state\n- fractal status - Check fractal network status\n- quantum status - Check quantum security layer status';
      } else if (terminalInput.toLowerCase().includes('agent list')) {
        if (terminalInput.toLowerCase().includes('error')) {
          responseContent = 'Error Agents:\n- SecurityAnalyzer (ID: 5)\n  Error: Quantum state decoherence detected\n  Last Active: 2025-04-01 12:34:56';
        } else {
          responseContent = 'Active Agents:\n- ContractValidator (ID: 1) - Type: smart-contract\n- TransactionGuardian (ID: 2) - Type: security\n- FractalMonitor (ID: 4) - Type: monitoring\n\nIdle Agents:\n- QuantumEntangler (ID: 3) - Type: utility\n\nError Agents:\n- SecurityAnalyzer (ID: 5) - Type: security';
        }
      } else if (terminalInput.toLowerCase().includes('repair')) {
        const agentId = parseInt(terminalInput.split(' ').pop() || '0');
        responseContent = `Initiating quantum state realignment for agent ID ${agentId}...\nRealignment complete. Agent status changed to IDLE.`;
        
        // Update agent status in the UI
        setAgents(agents.map(agent => 
          agent.id === agentId 
            ? {...agent, status: 'idle', lastActiveTime: new Date()} 
            : agent
        ));
      } else if (terminalInput.toLowerCase().includes('deploy')) {
        responseContent = 'Deployment process initiated. Creating quantum-fractal secure environment...\nInitializing agent parameters...\nConnecting to fractal network...\nDeployment successful. New agent now active.';
      } else {
        responseContent = 'Command not recognized. Type "help" for available commands.';
      }
      
      // Add system response to history
      const newResponse = { 
        type: 'response', 
        content: responseContent, 
        timestamp: new Date() 
      };
      
      setTerminalHistory(prev => [...prev, newResponse]);
      setTerminalInput('');
      setIsProcessing(false);
    }, 800);
  };
  
  // Get color based on agent status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'idle':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'online':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'offline':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      case 'syncing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };
  
  // Get icon for agent type
  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'smart-contract':
        return <GitBranch className="h-4 w-4" />;
      case 'monitoring':
        return <Network className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'utility':
        return <Bot className="h-4 w-4" />;
      case 'primary':
        return <Cpu className="h-4 w-4" />;
      case 'secondary':
        return <GitFork className="h-4 w-4" />;
      case 'recursive':
        return <RotateCw className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Singularity AI System</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">
            <Cpu className="mr-2 h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Bot className="mr-2 h-4 w-4" />
            Agent Deployment
          </TabsTrigger>
          <TabsTrigger value="learning">
            <GitBranch className="mr-2 h-4 w-4" />
            Learning Statistics
          </TabsTrigger>
          <TabsTrigger value="terminal">
            <Terminal className="mr-2 h-4 w-4" />
            Terminal Interface
          </TabsTrigger>
        </TabsList>
        
        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">Operational</Badge>
                  </div>
                  <p className="text-sm">Uptime: 142 days</p>
                </div>
                <Progress value={98} className="h-2 mb-1" />
                <p className="text-xs text-muted-foreground">System health: 98%</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">Protected</Badge>
                  </div>
                  <p className="text-sm">Threats blocked: 1,452</p>
                </div>
                <Progress value={100} className="h-2 mb-1" />
                <p className="text-xs text-muted-foreground">Quantum encryption: Active</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <GitFork className="h-4 w-4 text-primary" />
                  Network Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">Connected</Badge>
                  </div>
                  <p className="text-sm">Nodes: 27/30</p>
                </div>
                <Progress value={90} className="h-2 mb-1" />
                <p className="text-xs text-muted-foreground">Fractal synchronization: 90%</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  Active Agents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">35</div>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {mockAgents.filter(a => a.status === 'active').length} System
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    31 Custom
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Last deployment: {new Date().toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-primary" />
                  Smart Contracts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">147</div>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    138 Active
                  </Badge>
                  <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    9 Issues
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Automated audits: 2,843
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                    2 Warnings
                  </Badge>
                  <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                    1 Critical
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Last alert: 35 minutes ago
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Fractal Network Nodes</CardTitle>
              <CardDescription>
                Quantum-secure fractal recursive network status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                  {mockFractalNodes.map((node) => (
                    <div key={node.id} className="flex flex-col space-y-2 p-2 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getAgentTypeIcon(node.type)}
                          <span className="font-medium">{node.id}</span>
                        </div>
                        <Badge className={getStatusColor(node.status)}>
                          {node.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type:</span> {node.type}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Region:</span> {node.region}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Connections:</span> {node.connections}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Latency:</span> {node.latency}ms
                        </div>
                        <div>
                          <span className="text-muted-foreground">State:</span> {node.quantumState}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Sync:</span> {node.status === 'online' ? 'Now' : formatDate(node.lastSyncTime)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Deployed AI Agents</h2>
            <Button>
              <Bot className="mr-2 h-4 w-4" />
              Deploy New Agent
            </Button>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <div className="grid gap-4 p-4">
              {agents.map((agent) => (
                <Card key={agent.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getAgentTypeIcon(agent.type)}
                          <h3 className="font-medium">{agent.name}</h3>
                        </div>
                        <Badge className={getStatusColor(agent.status)}>
                          {agent.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-2">
                        <div>
                          <span className="text-muted-foreground">Type:</span> {agent.type}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Processor:</span> {agent.processor}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Version:</span> {agent.version}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Active:</span> {formatDate(agent.lastActiveTime)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Deployed:</span> {formatDate(agent.deploymentDate)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border-t md:border-t-0 md:border-l bg-slate-50 dark:bg-slate-800 w-full md:w-56">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Memory</span>
                            <span>{agent.memoryUsage}%</span>
                          </div>
                          <Progress value={agent.memoryUsage} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">CPU</span>
                            <span>{agent.cpuUsage}%</span>
                          </div>
                          <Progress value={agent.cpuUsage} className="h-2" />
                        </div>
                        <div className="pt-2 space-x-2">
                          {agent.status === 'active' ? (
                            <Button size="sm" variant="outline">
                              <PauseCircle className="mr-1 h-3 w-3" />
                              Pause
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline">
                              <PlayCircle className="mr-1 h-3 w-3" />
                              Start
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <RefreshCw className="mr-1 h-3 w-3" />
                            Restart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        
        {/* Learning Statistics Tab */}
        <TabsContent value="learning" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>
                  AI system learning metrics and statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Model Accuracy</span>
                    <span className="font-medium">{mockLearningStats.modelAccuracy}%</span>
                  </div>
                  <Progress value={mockLearningStats.modelAccuracy} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Data Points</h3>
                    <p className="text-lg font-bold">{mockLearningStats.totalDataPoints.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Training Iterations</h3>
                    <p className="text-lg font-bold">{mockLearningStats.trainingIterations}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Last Training</h3>
                    <p className="text-lg font-bold">{formatDate(mockLearningStats.lastTrainingDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Improvement Rate</h3>
                    <p className="text-lg font-bold">+{(mockLearningStats.improvementRate * 100).toFixed(2)}%</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <h3 className="text-sm font-medium mb-2">Categories Learned</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockLearningStats.categoriesLearned.map((category, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Learning Data
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quantum Model Training</CardTitle>
                <CardDescription>
                  Training configuration and controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Training in Progress</AlertTitle>
                  <AlertDescription>
                    Quantum model training is currently active. Estimated completion: 3 hours 24 minutes.
                  </AlertDescription>
                </Alert>
                
                <div className="rounded-md border p-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Current Training:</span>
                    <Badge>Fractal Pattern Recognition</Badge>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>47%</span>
                    </div>
                    <Progress value={47} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Quantum Processors:</span> 8
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data Processed:</span> 1.2TB
                    </div>
                    <div>
                      <span className="text-muted-foreground">Batch Size:</span> 20,000
                    </div>
                    <div>
                      <span className="text-muted-foreground">Learning Rate:</span> 0.00032
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      <PauseCircle className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                    <Button variant="destructive" className="flex-1">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Abort
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <Button className="w-full" variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Training Data
                </Button>
                <Button className="w-full" disabled>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Start New Training
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Metrics</CardTitle>
              <CardDescription>
                Performance comparison across different operational domains
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Transaction Analysis</span>
                    <span>98.3%</span>
                  </div>
                  <Progress value={98.3} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Smart Contract Auditing</span>
                    <span>94.7%</span>
                  </div>
                  <Progress value={94.7} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Quantum Attack Detection</span>
                    <span>99.2%</span>
                  </div>
                  <Progress value={99.2} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>User Behavior Analysis</span>
                    <span>97.5%</span>
                  </div>
                  <Progress value={97.5} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fractal Optimization</span>
                    <span>91.8%</span>
                  </div>
                  <Progress value={91.8} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Natural Language Processing</span>
                    <span>95.9%</span>
                  </div>
                  <Progress value={95.9} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Terminal Interface Tab */}
        <TabsContent value="terminal" className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold">Singularity Terminal</h2>
              <p className="text-muted-foreground">Direct access to the Singularity AI System</p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800">
              <CheckCircle className="mr-1 h-3 w-3" />
              Connected
            </Badge>
            <Button size="sm" variant="outline">
              <HelpCircle className="mr-1 h-3 w-3" />
              Help
            </Button>
          </div>
          
          <Card className="border-2 border-primary/20">
            <CardContent className="p-0">
              <div className="bg-black text-green-400 font-mono text-sm p-0">
                <div className="flex items-center bg-slate-900 px-4 py-2 border-b border-slate-700">
                  <Terminal className="h-4 w-4 mr-2" />
                  <span>Singularity Terminal v3.2.1</span>
                  <div className="ml-auto flex gap-2">
                    <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-600">
                      <Lock className="mr-1 h-3 w-3" />
                      Quantum Encrypted
                    </Badge>
                  </div>
                </div>
                
                <ScrollArea className="h-[400px] p-4">
                  <div>
                    <p className="mb-4 text-yellow-400">
                      Singularity AI System Terminal Interface<br />
                      Copyright © 2025 AI Freedom Trust. All rights reserved.<br />
                      Type "help" for available commands.
                    </p>
                    
                    {terminalHistory.map((entry, index) => (
                      <div key={index} className="mb-2">
                        {entry.type === 'command' ? (
                          <div>
                            <span className="text-blue-400">admin@singularity-ai &gt; </span>
                            <span>{entry.content}</span>
                          </div>
                        ) : (
                          <div className="pl-7 whitespace-pre-line">{entry.content}</div>
                        )}
                      </div>
                    ))}
                    
                    <div ref={terminalEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="border-t border-slate-700 p-4 flex gap-2">
                  <span className="text-blue-400">admin@singularity-ai &gt; </span>
                  <Input 
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTerminalCommand()}
                    className="flex-1 bg-transparent border-0 text-green-400 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Type command..."
                    disabled={isProcessing}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleTerminalCommand}
                    disabled={isProcessing || !terminalInput.trim()}
                  >
                    {isProcessing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AISystem;