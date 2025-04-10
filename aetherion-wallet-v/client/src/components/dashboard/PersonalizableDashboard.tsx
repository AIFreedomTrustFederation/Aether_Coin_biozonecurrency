import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Plus, X, Move, Settings, Palette } from 'lucide-react';
import { Theme } from '@/lib/theme';

// Widget Types & Interface
export type WidgetType = 
  | 'wallet-balance' 
  | 'transaction-history' 
  | 'price-chart' 
  | 'staking-stats' 
  | 'ico-progress'
  | 'news-feed'
  | 'quantum-security'
  | 'fractal-nodes'
  | 'quick-actions';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: number;
  refreshInterval: number;
  settings: Record<string, any>;
}

interface PersonalizableDashboardProps {
  defaultWidgets?: Widget[];
  availableThemes?: Theme[];
  currentTheme?: Theme;
  onThemeChange?: (theme: Theme) => void;
}

// Mock Dashboard Widgets
const DEFAULT_WIDGETS: Widget[] = [
  {
    id: '1',
    type: 'wallet-balance',
    title: 'Wallet Balance',
    size: 'medium',
    position: 1,
    refreshInterval: 60000,
    settings: { showFiat: true, showChange: true }
  },
  {
    id: '2',
    type: 'transaction-history',
    title: 'Recent Transactions',
    size: 'medium',
    position: 2,
    refreshInterval: 120000,
    settings: { limit: 5, showAmount: true }
  },
  {
    id: '3',
    type: 'price-chart',
    title: 'SING Price',
    size: 'large',
    position: 3,
    refreshInterval: 30000,
    settings: { timeRange: '24h', showVolume: true }
  },
  {
    id: '4',
    type: 'ico-progress',
    title: 'ICO Progress',
    size: 'medium',
    position: 4,
    refreshInterval: 300000,
    settings: { showCountdown: true, showParticipants: true }
  },
  {
    id: '5',
    type: 'staking-stats',
    title: 'My Staking',
    size: 'small',
    position: 5,
    refreshInterval: 900000,
    settings: { showRewards: true, showAPR: true }
  },
];

// Mock Available Widgets for adding to dashboard
const AVAILABLE_WIDGET_TYPES: { type: WidgetType; title: string; description: string }[] = [
  { type: 'wallet-balance', title: 'Wallet Balance', description: 'Display your wallet balances and total portfolio value' },
  { type: 'transaction-history', title: 'Transaction History', description: 'Show recent transactions across your wallets' },
  { type: 'price-chart', title: 'Price Chart', description: 'Track the price of SING or other cryptocurrencies' },
  { type: 'staking-stats', title: 'Staking Statistics', description: 'View your staking positions and rewards' },
  { type: 'ico-progress', title: 'ICO Progress', description: 'Track the progress of the Singularity Coin ICO' },
  { type: 'news-feed', title: 'News Feed', description: 'Latest news about Aetherion and the crypto market' },
  { type: 'quantum-security', title: 'Quantum Security', description: 'Monitor the quantum security status of your wallets' },
  { type: 'fractal-nodes', title: 'Fractal Nodes', description: 'View the status of fractal recursive sharding nodes' },
  { type: 'quick-actions', title: 'Quick Actions', description: 'Shortcuts to common actions like send, receive, and stake' },
];

// Mock Themes
const DEFAULT_THEMES: Theme[] = [
  { id: 'quantum', name: 'Quantum Dark', mode: 'dark', primary: '#6366f1', radius: 0.5 },
  { id: 'fractal', name: 'Fractal Light', mode: 'light', primary: '#10b981', radius: 0.75 },
  { id: 'singularity', name: 'Singularity System', mode: 'system', primary: '#f43f5e', radius: 0.25 },
];

const PersonalizableDashboard: React.FC<PersonalizableDashboardProps> = ({
  defaultWidgets = DEFAULT_WIDGETS,
  availableThemes = DEFAULT_THEMES,
  currentTheme = DEFAULT_THEMES[0],
  onThemeChange
}) => {
  const { toast } = useToast();
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);
  const [editMode, setEditMode] = useState(false);
  const [addWidgetOpen, setAddWidgetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(currentTheme);
  
  // Handlers for widget management
  const addWidget = (widgetType: WidgetType) => {
    const widgetInfo = AVAILABLE_WIDGET_TYPES.find(w => w.type === widgetType);
    if (!widgetInfo) return;
    
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      title: widgetInfo.title,
      size: 'medium',
      position: widgets.length + 1,
      refreshInterval: 60000,
      settings: {}
    };
    
    setWidgets([...widgets, newWidget]);
    setAddWidgetOpen(false);
    
    toast({
      title: "Widget Added",
      description: `${widgetInfo.title} has been added to your dashboard.`,
    });
  };
  
  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
    
    toast({
      title: "Widget Removed",
      description: "The widget has been removed from your dashboard.",
    });
  };
  
  const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
    const widgetIndex = widgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) return;
    
    // Prevent moving beyond boundaries
    if (direction === 'up' && widgetIndex === 0) return;
    if (direction === 'down' && widgetIndex === widgets.length - 1) return;
    
    const newWidgets = [...widgets];
    const targetIndex = direction === 'up' ? widgetIndex - 1 : widgetIndex + 1;
    
    // Swap positions
    [newWidgets[widgetIndex], newWidgets[targetIndex]] = [newWidgets[targetIndex], newWidgets[widgetIndex]];
    
    // Update position properties
    newWidgets.forEach((widget, index) => {
      widget.position = index + 1;
    });
    
    setWidgets(newWidgets);
  };
  
  const handleThemeChange = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId);
    if (theme) {
      setSelectedTheme(theme);
      onThemeChange?.(theme);
      
      toast({
        title: "Theme Updated",
        description: `Your dashboard theme has been changed to ${theme.name}.`,
      });
    }
  };
  
  const savePreferences = () => {
    // In a real implementation, this would save to the server
    toast({
      title: "Dashboard Saved",
      description: "Your personalized dashboard preferences have been saved.",
    });
    
    setEditMode(false);
  };
  
  // Render widget based on type
  const renderWidget = (widget: Widget) => {
    let content;
    
    switch (widget.type) {
      case 'wallet-balance':
        content = (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold">2,456.78 SING</p>
                <p className="text-sm text-muted-foreground">≈ $1,586.89 USD</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-500">+5.4%</p>
                <p className="text-xs text-muted-foreground">24h change</p>
              </div>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '85%' }} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                <p className="text-muted-foreground">Tokens</p>
                <p className="font-medium">2,456.78 SING</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                <p className="text-muted-foreground">USD Value</p>
                <p className="font-medium">$1,586.89</p>
              </div>
            </div>
          </div>
        );
        break;
        
      case 'transaction-history':
        content = (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-800 rounded">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${i % 2 === 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <div>
                    <p className="text-sm font-medium">{i % 2 === 0 ? 'Received' : 'Staked'} SING</p>
                    <p className="text-xs text-muted-foreground">Today {i}:00 PM</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">{(i * 10.5).toFixed(2)} SING</p>
              </div>
            ))}
          </div>
        );
        break;
        
      case 'price-chart':
        content = (
          <div className="space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="text-2xl font-bold">$0.000646</p>
                <p className="text-sm text-green-500">+2.34% (24h)</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">1h</Button>
                <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">24h</Button>
                <Button variant="outline" size="sm">7d</Button>
                <Button variant="outline" size="sm">30d</Button>
              </div>
            </div>
            
            {/* Mock Chart */}
            <div className="h-32 w-full bg-slate-100 dark:bg-slate-800 rounded relative overflow-hidden">
              <div className="absolute inset-0 flex items-end">
                <div className="h-full w-full" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.1) 100%)' }}>
                  {/* SVG mock chart line */}
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                      d="M0,50 C10,30 20,40 30,35 C40,30 50,10 60,25 C70,40 80,20 90,15 L90,100 L0,100 Z"
                      fill="rgba(99, 102, 241, 0.2)"
                    />
                    <path
                      d="M0,50 C10,30 20,40 30,35 C40,30 50,10 60,25 C70,40 80,20 90,15"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">Market Cap</p>
                <p className="font-medium">$646,000</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Volume (24h)</p>
                <p className="font-medium">$24,500</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Circulating</p>
                <p className="font-medium">1B SING</p>
              </div>
            </div>
          </div>
        );
        break;
        
      case 'ico-progress':
        content = (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <p className="text-sm font-medium">ICO Progress</p>
                <span className="text-sm text-muted-foreground">64.6%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '64.6%' }} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                <p className="text-muted-foreground">Raised</p>
                <p className="font-medium">$646,000</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                <p className="text-muted-foreground">Target</p>
                <p className="font-medium">$1,000,000</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                <p className="text-muted-foreground">Participants</p>
                <p className="font-medium">1,256</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                <p className="text-muted-foreground">Time Left</p>
                <p className="font-medium">14d 6h</p>
              </div>
            </div>
            
            <Button className="w-full" size="sm">
              Participate Now
            </Button>
          </div>
        );
        break;
        
      case 'staking-stats':
        content = (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="font-semibold">My Staked SING</p>
              <p className="text-xl font-bold">500.00</p>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">APR</p>
                <p className="text-sm font-medium">12.5%</p>
              </div>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Earned Rewards</p>
                <p className="text-sm font-medium">16.78 SING</p>
              </div>
            </div>
            
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Unlock Date</p>
                <p className="text-sm font-medium">May 15, 2025</p>
              </div>
            </div>
            
            <Button className="w-full" size="sm" variant="outline">
              Manage Staking
            </Button>
          </div>
        );
        break;
        
      case 'fractal-nodes':
        content = (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Fractal Node Network</p>
                <p className="text-sm text-muted-foreground">16 recursive layers active</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-500"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                <p className="text-muted-foreground">Online Nodes</p>
                <p className="font-medium">254 / 256</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                <p className="text-muted-foreground">Network Health</p>
                <p className="font-medium text-green-500">99.2%</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                <p className="text-muted-foreground">My Contribution</p>
                <p className="font-medium">3 shards</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded">
                <p className="text-muted-foreground">Shard Rewards</p>
                <p className="font-medium">0.05 SING/day</p>
              </div>
            </div>
          </div>
        );
        break;
        
      case 'quantum-security':
        content = (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Quantum Security Status</p>
                <p className="text-sm text-green-500">All systems protected</p>
              </div>
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-green-100">
                <div className="h-6 w-6 text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded flex justify-between items-center">
                <span className="text-sm">CRYSTAL-Kyber Layer</span>
                <span className="text-sm text-green-500">Active</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded flex justify-between items-center">
                <span className="text-sm">SPHINCS+ Signing</span>
                <span className="text-sm text-green-500">Active</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded flex justify-between items-center">
                <span className="text-sm">Fractal Recursion</span>
                <span className="text-sm text-green-500">16 Layers</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded flex justify-between items-center">
                <span className="text-sm">Last Security Scan</span>
                <span className="text-sm">10 min ago</span>
              </div>
            </div>
          </div>
        );
        break;
        
      case 'news-feed':
        content = (
          <div className="space-y-3">
            <div className="border-l-4 border-primary pl-3 py-1">
              <p className="font-medium">Aetherion Announces Fractal Sharding Integration</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
            <div className="border-l-4 border-slate-300 pl-3 py-1">
              <p className="font-medium">Quantum Security Module Receives Certification</p>
              <p className="text-xs text-muted-foreground">Yesterday</p>
            </div>
            <div className="border-l-4 border-slate-300 pl-3 py-1">
              <p className="font-medium">ICO Phase 2 Begins with Strong Participation</p>
              <p className="text-xs text-muted-foreground">3 days ago</p>
            </div>
            <div className="border-l-4 border-slate-300 pl-3 py-1">
              <p className="font-medium">New Partnership with Quantum Computing Lab</p>
              <p className="text-xs text-muted-foreground">1 week ago</p>
            </div>
            <Button variant="link" size="sm" className="px-0">
              View all news
            </Button>
          </div>
        );
        break;
        
      case 'quick-actions':
        content = (
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="flex flex-col h-20 items-center justify-center space-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
              <span className="text-xs">Send</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 items-center justify-center space-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 2-7 20-4-9-9-4Z"/>
                <path d="M22 2 11 13"/>
              </svg>
              <span className="text-xs">Receive</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 items-center justify-center space-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2"/>
                <line x1="2" x2="22" y1="10" y2="10"/>
              </svg>
              <span className="text-xs">Buy</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 items-center justify-center space-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 2 7l10 5 10-5-10-5Z"/>
                <path d="m2 17 10 5 10-5"/>
                <path d="m2 12 10 5 10-5"/>
              </svg>
              <span className="text-xs">Stake</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 items-center justify-center space-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
              <span className="text-xs">NFTs</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-20 items-center justify-center space-y-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span className="text-xs">Secure</span>
            </Button>
          </div>
        );
        break;
        
      default:
        content = (
          <div className="flex items-center justify-center h-20 text-muted-foreground">
            Widget not available
          </div>
        );
    }
    
    // Size classes
    const sizeClass = 
      widget.size === 'small' ? 'col-span-1' : 
      widget.size === 'large' ? 'col-span-full md:col-span-2' : 'col-span-1 md:col-span-1';
    
    return (
      <Card className={sizeClass} key={widget.id}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{widget.title}</CardTitle>
            {editMode && (
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={() => moveWidget(widget.id, 'up')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 15-6-6-6 6"/>
                  </svg>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={() => moveWidget(widget.id, 'down')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-red-500" 
                  onClick={() => removeWidget(widget.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button onClick={savePreferences}>
                Save Layout
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSettingsOpen(true)}
              >
                <Palette className="h-4 w-4 mr-2" />
                Theme
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditMode(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
            </>
          )}
        </div>
      </div>
      
      {editMode && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Customize your dashboard by adding, removing, or rearranging widgets. Click "Save Layout" when you're done.
            </p>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {widgets.map(widget => renderWidget(widget))}
        
        {editMode && (
          <Card className="col-span-1 border-dashed flex flex-col items-center justify-center p-6 text-center h-full min-h-[200px]">
            <Button 
              variant="outline" 
              className="rounded-full h-12 w-12 mb-4" 
              onClick={() => setAddWidgetOpen(true)}
            >
              <Plus className="h-6 w-6" />
            </Button>
            <p className="text-sm font-medium">Add New Widget</p>
            <p className="text-xs text-muted-foreground mt-1">Customize your dashboard</p>
          </Card>
        )}
      </div>
      
      {/* Add Widget Dialog */}
      <Dialog open={addWidgetOpen} onOpenChange={setAddWidgetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
            <DialogDescription>
              Choose a widget to add to your dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 my-4 max-h-[400px] overflow-y-auto pr-1">
            {AVAILABLE_WIDGET_TYPES.map(widgetType => (
              <div 
                key={widgetType.type}
                className="border rounded p-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                onClick={() => addWidget(widgetType.type)}
              >
                <p className="font-medium">{widgetType.title}</p>
                <p className="text-sm text-muted-foreground">{widgetType.description}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Theme Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dashboard Settings</DialogTitle>
            <DialogDescription>
              Customize the appearance of your dashboard
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 my-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select 
                value={selectedTheme.id} 
                onValueChange={handleThemeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  {availableThemes.map(theme => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label>Preview</Label>
              <div 
                className="border rounded p-4 h-24 flex items-center justify-center"
                style={{ 
                  backgroundColor: selectedTheme.mode === 'dark' ? '#1e293b' : '#f8fafc',
                  color: selectedTheme.mode === 'dark' ? '#f8fafc' : '#1e293b',
                  borderColor: selectedTheme.mode === 'dark' ? '#334155' : '#e2e8f0',
                  borderRadius: `${selectedTheme.radius * 0.5}rem`
                }}
              >
                <div className="text-center">
                  <div 
                    className="h-8 w-24 mx-auto mb-2 rounded"
                    style={{ 
                      backgroundColor: selectedTheme.primary,
                      borderRadius: `${selectedTheme.radius * 0.25}rem` 
                    }}
                  ></div>
                  <p className="text-sm font-medium">Theme Preview</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Auto-refresh Widgets</Label>
                <Switch defaultChecked />
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically refresh widget data at regular intervals
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalizableDashboard;