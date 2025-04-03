import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WidgetProps } from './WidgetRegistry';
import { isWidgetType } from '@/types/widget';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Gauge,
  Flame,
  Clock,
  RefreshCw,
  CheckCircle,
  Hourglass
} from 'lucide-react';

// Sample gas price data
const sampleGasData = {
  ethereum: {
    network: 'Ethereum',
    currentBaseFee: 22, // Gwei
    priorityFee: {
      low: 1.2,
      medium: 1.5,
      high: 2.5
    },
    totalFees: {
      low: 23.2,
      medium: 23.5,
      high: 24.5
    },
    estimatedTimes: {
      low: '3-5 min',
      medium: '1-3 min',
      high: '<1 min'
    },
    recommendations: 'Medium priority is good for most transactions.',
    trend: 'decreasing',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
    historicalData: [28, 30, 25, 23, 22, 24, 22]
  },
  polygon: {
    network: 'Polygon',
    currentBaseFee: 85, // Gwei
    priorityFee: {
      low: 30,
      medium: 45,
      high: 60
    },
    totalFees: {
      low: 115,
      medium: 130,
      high: 145
    },
    estimatedTimes: {
      low: '1-2 min',
      medium: '30-60 sec',
      high: '<30 sec'
    },
    recommendations: 'Low fees are sufficient for most use cases.',
    trend: 'stable',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 4), // 4 minutes ago
    historicalData: [100, 95, 90, 105, 95, 85, 85]
  },
  arbitrum: {
    network: 'Arbitrum',
    currentBaseFee: 0.12, // Gwei
    priorityFee: {
      low: 0.01,
      medium: 0.02,
      high: 0.04
    },
    totalFees: {
      low: 0.13,
      medium: 0.14,
      high: 0.16
    },
    estimatedTimes: {
      low: '<30 sec',
      medium: '<20 sec',
      high: '<10 sec'
    },
    recommendations: 'Low fees are perfectly fine for all transactions.',
    trend: 'stable',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 3), // 3 minutes ago
    historicalData: [0.11, 0.13, 0.12, 0.11, 0.12, 0.12, 0.12]
  },
  optimism: {
    network: 'Optimism',
    currentBaseFee: 0.09, // Gwei
    priorityFee: {
      low: 0.01,
      medium: 0.015,
      high: 0.025
    },
    totalFees: {
      low: 0.1,
      medium: 0.105,
      high: 0.115
    },
    estimatedTimes: {
      low: '<30 sec',
      medium: '<20 sec',
      high: '<10 sec'
    },
    recommendations: 'Network is running smoothly, even the lowest fee is fast.',
    trend: 'increasing',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 1), // 1 minute ago
    historicalData: [0.05, 0.06, 0.07, 0.08, 0.09, 0.09, 0.09]
  },
  base: {
    network: 'Base',
    currentBaseFee: 0.24, // Gwei
    priorityFee: {
      low: 0.02,
      medium: 0.05,
      high: 0.1
    },
    totalFees: {
      low: 0.26,
      medium: 0.29,
      high: 0.34
    },
    estimatedTimes: {
      low: '<40 sec',
      medium: '<20 sec',
      high: '<10 sec'
    },
    recommendations: 'Low fees are usually sufficient unless the network is congested.',
    trend: 'increasing',
    lastUpdated: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    historicalData: [0.18, 0.19, 0.20, 0.22, 0.23, 0.24, 0.24]
  }
};

// Format relative time
const formatRelativeTime = (timestamp: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  
  if (diffMin > 0) {
    return `${diffMin}m ago`;
  } else if (diffSec > 0) {
    return `${diffSec}s ago`;
  } else {
    return 'Just now';
  }
};

const GasTrackerWidget: React.FC<WidgetProps> = ({ widget, isEditing, onConfigChange }) => {
  // Type guard
  if (!isWidgetType(widget, 'gas-tracker')) {
    return <div>Invalid widget configuration</div>;
  }
  
  // Default config values
  const networks = widget.config.networks || ['ethereum'];
  const refreshInterval = widget.config.refreshInterval || 30;
  const showRecommendations = widget.config.showRecommendations ?? true;
  
  // Local state for editing
  const [editSettings, setEditSettings] = useState({
    networks: [...networks],
    refreshInterval,
    showRecommendations,
    primaryNetwork: networks[0] || 'ethereum',
  });
  
  // Handle settings change
  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...editSettings, [key]: value };
    setEditSettings(newSettings);
    
    if (onConfigChange) {
      onConfigChange(newSettings);
    }
  };
  
  // Toggle network selection
  const toggleNetwork = (network: string): void => {
    let newNetworks = [...editSettings.networks];
    if (newNetworks.includes(network)) {
      // Don't allow removing the last network
      if (newNetworks.length > 1) {
        newNetworks = newNetworks.filter(n => n !== network);
        
        // If we're removing the primary network, set a new one
        if (editSettings.primaryNetwork === network) {
          handleSettingChange('primaryNetwork', newNetworks[0]);
        }
      }
    } else {
      newNetworks.push(network);
    }
    
    handleSettingChange('networks', newNetworks);
  };
  
  // Set primary network
  const setPrimaryNetwork = (network: string) => {
    // Make sure the network is in the selected networks list
    if (!editSettings.networks.includes(network)) {
      const newNetworks = [...editSettings.networks, network];
      handleSettingChange('networks', newNetworks);
    }
    
    handleSettingChange('primaryNetwork', network);
  };
  
  // Get the active network's data
  const primaryNetworkData = sampleGasData[editSettings.primaryNetwork as keyof typeof sampleGasData];
  
  // Get max gas for the progress bars
  const getMaxGasForProgress = (): number => {
    switch (editSettings.primaryNetwork) {
      case 'ethereum':
        return 100;
      case 'polygon':
        return 300;
      case 'arbitrum':
      case 'optimism':
      case 'base':
        return 1;
      default:
        return 100;
    }
  };
  
  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <Flame className="h-4 w-4 text-orange-500" />;
      case 'decreasing':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'stable':
      default:
        return <Hourglass className="h-4 w-4 text-blue-500" />;
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 pt-4 px-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Gauge className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Gas Tracker</h3>
          </div>
          
          {!isEditing && (
            <div className="flex items-center space-x-2">
              {networks.length > 1 && (
                <Select 
                  value={editSettings.primaryNetwork} 
                  onValueChange={setPrimaryNetwork}
                >
                  <SelectTrigger className="h-7 text-xs w-28">
                    <SelectValue placeholder="Network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network: string) => (
                      <SelectItem key={network} value={network}>
                        {sampleGasData[network as keyof typeof sampleGasData]?.network || network}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={() => {/* Would refresh gas data */}}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Networks to Track</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(sampleGasData).map((network: string) => (
                  <div key={network} className="flex items-center space-x-2">
                    <Switch
                      checked={editSettings.networks.includes(network)}
                      onCheckedChange={() => toggleNetwork(network)}
                      id={`network-${network}`}
                    />
                    <Label htmlFor={`network-${network}`}>
                      {sampleGasData[network as keyof typeof sampleGasData].network}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="primary">Primary Network</Label>
              <Select 
                value={editSettings.primaryNetwork} 
                onValueChange={setPrimaryNetwork}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select primary network" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(sampleGasData).map((network: string) => (
                    <SelectItem key={network} value={network}>
                      {sampleGasData[network as keyof typeof sampleGasData].network}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="refreshInterval">Refresh Interval: {editSettings.refreshInterval}s</Label>
              </div>
              <Slider 
                id="refreshInterval"
                min={15}
                max={120}
                step={15}
                value={[editSettings.refreshInterval]}
                onValueChange={(value) => handleSettingChange('refreshInterval', value[0])}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showRecommendations">Show Recommendations</Label>
              <Switch
                id="showRecommendations"
                checked={editSettings.showRecommendations}
                onCheckedChange={(checked) => handleSettingChange('showRecommendations', checked)}
              />
            </div>
          </div>
        ) : primaryNetworkData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-base">{primaryNetworkData.network}</h4>
                {getTrendIcon(primaryNetworkData.trend)}
              </div>
              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatRelativeTime(primaryNetworkData.lastUpdated)}</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Low</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{primaryNetworkData.totalFees.low} Gwei</span>
                    <span className="text-xs text-muted-foreground">{primaryNetworkData.estimatedTimes.low}</span>
                  </div>
                </div>
                <Progress value={(primaryNetworkData.totalFees.low / getMaxGasForProgress()) * 100} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Medium</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{primaryNetworkData.totalFees.medium} Gwei</span>
                    <span className="text-xs text-muted-foreground">{primaryNetworkData.estimatedTimes.medium}</span>
                  </div>
                </div>
                <Progress value={(primaryNetworkData.totalFees.medium / getMaxGasForProgress()) * 100} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>High</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{primaryNetworkData.totalFees.high} Gwei</span>
                    <span className="text-xs text-muted-foreground">{primaryNetworkData.estimatedTimes.high}</span>
                  </div>
                </div>
                <Progress value={(primaryNetworkData.totalFees.high / getMaxGasForProgress()) * 100} className="h-2" />
              </div>
            </div>
            
            <div className="flex justify-between text-sm border-t border-muted pt-2">
              <span className="text-muted-foreground">Base Fee</span>
              <span className="font-medium">{primaryNetworkData.currentBaseFee} Gwei</span>
            </div>
            
            {showRecommendations && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Recommendation:</span> {primaryNetworkData.recommendations}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-muted-foreground">No network data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GasTrackerWidget;