import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WidgetProps } from './WidgetRegistry';
import { isWidgetType } from '@/types/widget';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import {
  Gauge,
  Flame,
  Clock,
  RefreshCw,
  CheckCircle,
  Hourglass,
  AlertTriangle
} from 'lucide-react';

// Type for Etherscan gas price data
interface EtherscanGasResponse {
  LastBlock: string;
  SafeGasPrice: string;
  ProposeGasPrice: string;
  FastGasPrice: string;
  suggestBaseFee: string;
  gasUsedRatio: string;
}

// Type for Bitcoin fee estimates
interface BlockstreamFeesResponse {
  [blocks: string]: number;
  '1': number;
  '3': number;
  '6': number;
  '144': number;
}

// Define the network gas data interface
interface NetworkGasData {
  network: string;
  currentBaseFee: number;
  priorityFee: {
    low: number;
    medium: number;
    high: number;
  };
  totalFees: {
    low: number;
    medium: number;
    high: number;
  };
  estimatedTimes: {
    low: string;
    medium: string;
    high: string;
  };
  recommendations: string;
  trend: string;
  lastUpdated: Date;
  historicalData?: number[];
}

// Fallback sample data for networks without real-time API integration yet
const sampleGasData: Record<string, NetworkGasData> = {
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
    lastUpdated: new Date(),
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
    lastUpdated: new Date(),
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
    lastUpdated: new Date(),
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
    lastUpdated: new Date(),
    historicalData: [0.18, 0.19, 0.20, 0.22, 0.23, 0.24, 0.24]
  },
  bitcoin: {
    network: 'Bitcoin',
    currentBaseFee: 0,
    priorityFee: {
      low: 0,
      medium: 0,
      high: 0
    },
    totalFees: {
      low: 0,
      medium: 0,
      high: 0
    },
    estimatedTimes: {
      low: 'Next day',
      medium: 'Several hours',
      high: 'Next block'
    },
    recommendations: 'Choose fee based on urgency of transaction.',
    trend: 'stable',
    lastUpdated: new Date(),
    historicalData: []
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
  
  // Fetch real-time data
  const {
    data: ethereumGasData,
    isLoading: isEthereumLoading,
    error: ethereumError,
    refetch: refetchEthereum
  } = useQuery({
    queryKey: ['/api/services/etherscan/gas'],
    enabled: editSettings.networks.includes('ethereum'),
    refetchInterval: refreshInterval * 1000,
  });

  const {
    data: bitcoinFeeData,
    isLoading: isBitcoinLoading,
    error: bitcoinError,
    refetch: refetchBitcoin
  } = useQuery({
    queryKey: ['/api/services/blockstream/fees'],
    enabled: editSettings.networks.includes('bitcoin'),
    refetchInterval: refreshInterval * 1000,
  });

  // Process Ethereum data
  const ethereumData: NetworkGasData | undefined = React.useMemo(() => {
    if (!ethereumGasData) return undefined;

    // Cast the data to the proper type
    const gasData = ethereumGasData as unknown as EtherscanGasResponse;
    
    const baseFee = parseFloat(gasData.suggestBaseFee);
    const safeGasPrice = parseFloat(gasData.SafeGasPrice);
    const proposeGasPrice = parseFloat(gasData.ProposeGasPrice);
    const fastGasPrice = parseFloat(gasData.FastGasPrice);

    // Calculate trend based on gas price comparison
    let trend = 'stable';
    // Compare current base fee with average of other prices to determine trend
    const avgOtherPrices = (safeGasPrice + proposeGasPrice + fastGasPrice) / 3;
    if (baseFee < avgOtherPrices * 0.8) {
      trend = 'decreasing';
    } else if (baseFee > avgOtherPrices * 1.2) {
      trend = 'increasing';
    }

    return {
      network: 'Ethereum',
      currentBaseFee: baseFee,
      priorityFee: {
        low: safeGasPrice - baseFee > 0 ? safeGasPrice - baseFee : 0.1,
        medium: proposeGasPrice - baseFee > 0 ? proposeGasPrice - baseFee : 0.5,
        high: fastGasPrice - baseFee > 0 ? fastGasPrice - baseFee : 1.0,
      },
      totalFees: {
        low: safeGasPrice,
        medium: proposeGasPrice,
        high: fastGasPrice,
      },
      estimatedTimes: {
        low: '5-10 min',
        medium: '1-3 min',
        high: '<1 min',
      },
      recommendations: baseFee < 1 
        ? 'Gas prices are very low. Great time for transactions!'
        : baseFee > 10
          ? 'Gas prices are high. Consider waiting for non-urgent transactions.'
          : 'Gas prices are moderate. Standard priority should work for most transactions.',
      trend: trend,
      lastUpdated: new Date(),
    };
  }, [ethereumGasData]);

  // Process Bitcoin data
  const bitcoinData: NetworkGasData | undefined = React.useMemo(() => {
    if (!bitcoinFeeData) return undefined;

    // Cast to proper type
    const feeData = bitcoinFeeData as unknown as BlockstreamFeesResponse;
    
    // Extract fee estimates for different confirmation targets
    const nextBlockFee = feeData['1'] || 0;
    const hourlyFee = feeData['3'] || 0;
    const economyFee = feeData['6'] || 0;
    const lowPriorityFee = feeData['144'] || 0; // 24 hours (1 day)

    // Determine trend based on fee comparison
    let trend = 'stable';
    if (nextBlockFee > hourlyFee * 1.5) {
      trend = 'increasing';
    } else if (nextBlockFee < hourlyFee * 0.8) {
      trend = 'decreasing';
    }

    return {
      network: 'Bitcoin',
      currentBaseFee: 0, // Bitcoin doesn't have a base fee concept like Ethereum
      priorityFee: {
        low: lowPriorityFee,
        medium: economyFee,
        high: nextBlockFee,
      },
      totalFees: {
        low: lowPriorityFee,
        medium: economyFee,
        high: nextBlockFee,
      },
      estimatedTimes: {
        low: '~24 hours',
        medium: '~1 hour',
        high: 'Next block',
      },
      recommendations: nextBlockFee < 2
        ? 'Fees are low. Good time for transactions.'
        : nextBlockFee > 10
          ? 'Fees are high. Consider waiting for non-urgent transactions.'
          : 'Fees are moderate. Choose priority based on urgency.',
      trend: trend,
      lastUpdated: new Date(),
    };
  }, [bitcoinFeeData]);

  // Combine real data with sample data
  const combinedNetworkData: Record<string, NetworkGasData> = {
    ...sampleGasData,
    ...(ethereumData ? { ethereum: ethereumData } : {}),
    ...(bitcoinData ? { bitcoin: bitcoinData } : {}),
  };

  // Get the active network's data
  const primaryNetworkData = combinedNetworkData[editSettings.primaryNetwork];
  
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
                onClick={() => {
                  if (editSettings.primaryNetwork === 'ethereum') {
                    refetchEthereum();
                  } else if (editSettings.primaryNetwork === 'bitcoin') {
                    refetchBitcoin();
                  }
                }}
              >
                <RefreshCw className={`h-4 w-4 ${
                  (editSettings.primaryNetwork === 'ethereum' && isEthereumLoading) ||
                  (editSettings.primaryNetwork === 'bitcoin' && isBitcoinLoading)
                    ? 'animate-spin' 
                    : ''
                }`} />
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