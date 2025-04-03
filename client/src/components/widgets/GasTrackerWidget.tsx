import React, { useState, useEffect } from 'react';
import { WidgetProps } from './WidgetRegistry';
import { GasTrackerConfig } from '@/types/widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gauge, Clock, RefreshCcw, TrendingUp, TrendingDown } from 'lucide-react';

// Mock gas price data for different networks
const GAS_DATA = {
  ethereum: {
    slow: { price: 25, time: '~10 min', trend: 'up' },
    average: { price: 35, time: '~3 min', trend: 'up' },
    fast: { price: 50, time: '~30 sec', trend: 'down' }
  },
  'binance-smart-chain': {
    slow: { price: 5, time: '~5 min', trend: 'stable' },
    average: { price: 5.5, time: '~1 min', trend: 'stable' },
    fast: { price: 6, time: '~20 sec', trend: 'up' }
  },
  polygon: {
    slow: { price: 40, time: '~15 min', trend: 'down' },
    average: { price: 60, time: '~5 min', trend: 'down' },
    fast: { price: 80, time: '~1 min', trend: 'stable' }
  },
  arbitrum: {
    slow: { price: 0.15, time: '~2 min', trend: 'up' },
    average: { price: 0.25, time: '~1 min', trend: 'up' },
    fast: { price: 0.35, time: '~20 sec', trend: 'up' }
  }
};

// Network display names and icons
const NETWORKS = {
  ethereum: { name: 'Ethereum', unit: 'GWEI', maxPrice: 200 },
  'binance-smart-chain': { name: 'BNB Chain', unit: 'GWEI', maxPrice: 10 },
  polygon: { name: 'Polygon', unit: 'GWEI', maxPrice: 500 },
  arbitrum: { name: 'Arbitrum', unit: 'GWEI', maxPrice: 1 }
};

// Speed options
const SPEED_OPTIONS = ['slow', 'average', 'fast'];

const GasTrackerWidget: React.FC<WidgetProps> = ({ widget, onConfigChange }) => {
  const config = widget.config as GasTrackerConfig;
  const networks = config.networks || ['ethereum'];
  const refreshInterval = config.refreshInterval || 60;
  
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);
  const [selectedSpeed, setSelectedSpeed] = useState('average');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  // Update network selection when config changes
  useEffect(() => {
    if (networks.length > 0 && !networks.includes(selectedNetwork)) {
      setSelectedNetwork(networks[0]);
    }
  }, [networks, selectedNetwork]);
  
  // Handle network change
  const handleNetworkChange = (network: string) => {
    setSelectedNetwork(network);
    // You could update the config here if needed
    if (onConfigChange) {
      onConfigChange({ 
        ...config, 
        networks: networks.includes(network) ? networks : [...networks, network]
      });
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date());
    }, 1000);
  };
  
  // Get current network info
  const networkInfo = NETWORKS[selectedNetwork as keyof typeof NETWORKS] || NETWORKS.ethereum;
  const gasData = GAS_DATA[selectedNetwork as keyof typeof GAS_DATA] || GAS_DATA.ethereum;
  
  // Format time ago
  const formatTimeAgo = () => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds} sec ago`;
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)} min ago`;
    } else {
      return `${Math.floor(diffSeconds / 3600)} hr ago`;
    }
  };
  
  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-green-500" />;
      default: return null;
    }
  };
  
  // Get price level class (low/medium/high)
  const getPriceLevel = (speed: string) => {
    const price = gasData[speed as keyof typeof gasData].price;
    const maxPrice = networkInfo.maxPrice;
    const percentage = (price / maxPrice) * 100;
    
    if (percentage < 30) return 'text-green-500';
    if (percentage < 70) return 'text-amber-500';
    return 'text-red-500';
  };
  
  // Get progress value
  const getProgressValue = (speed: string) => {
    const price = gasData[speed as keyof typeof gasData].price;
    const maxPrice = networkInfo.maxPrice;
    return Math.min(100, (price / maxPrice) * 100);
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Gauge className="h-5 w-5 mr-2" />
            Gas Tracker
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <Select value={selectedNetwork} onValueChange={handleNetworkChange}>
          <SelectTrigger className="mb-4">
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(NETWORKS).map(network => (
              <SelectItem key={network} value={network}>
                {NETWORKS[network as keyof typeof NETWORKS].name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Tabs defaultValue={selectedSpeed} value={selectedSpeed} onValueChange={setSelectedSpeed}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="slow">Slow</TabsTrigger>
            <TabsTrigger value="average">Average</TabsTrigger>
            <TabsTrigger value="fast">Fast</TabsTrigger>
          </TabsList>
          
          {SPEED_OPTIONS.map(speed => (
            <TabsContent key={speed} value={speed} className="mt-4 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xl font-bold flex items-center">
                    <span className={getPriceLevel(speed)}>
                      {gasData[speed as keyof typeof gasData].price} {networkInfo.unit}
                    </span>
                    <span className="ml-2">
                      {getTrendIcon(gasData[speed as keyof typeof gasData].trend)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Confirmation: {gasData[speed as keyof typeof gasData].time}
                  </div>
                </div>
                
                <Badge variant="outline" className="capitalize">
                  {speed}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>High</span>
                </div>
                <Progress value={getProgressValue(speed)} className="h-2" />
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="flex items-center justify-center text-xs text-muted-foreground mt-4">
          <Clock className="h-3 w-3 mr-1" />
          Updated {formatTimeAgo()}
        </div>
      </CardContent>
    </Card>
  );
};

export default GasTrackerWidget;