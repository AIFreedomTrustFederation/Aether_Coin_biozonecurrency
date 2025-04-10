import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WidgetProps } from './WidgetRegistry';
import { isWidgetType } from '@/types/widget';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Mock data for the chart
const generateChartData = (timeframe: string) => {
  // Sample price data - in real app, this would come from API
  const priceData: Record<string, number[]> = {
    '1d': [
      42103, 42300, 42150, 42400, 42600, 42200, 
      42450, 42800, 43000, 42950, 43200, 43400, 
      43100, 43300, 43500, 43200, 43400, 43600, 
      43700, 43900, 44100, 44000, 44200, 44300
    ],
    '1w': [
      40500, 41200, 42000, 41800, 42500, 43100, 44000
    ],
    '1m': [
      38200, 39500, 40300, 41200, 40800, 42000, 41800, 
      42500, 42300, 42800, 43100, 42900, 43400, 43800, 
      43500, 43900, 44300, 44100, 44500, 44800, 44600, 
      45000, 44800, 44300, 44000, 44500, 44800
    ],
    '3m': [
      30500, 32800, 35100, 33900, 36200, 38000, 36500, 
      39000, 40200, 39500, 41800, 44000
    ],
    '1y': [
      22000, 24500, 23800, 26200, 28500, 27900, 30500, 
      32000, 31500, 35000, 38000, 44000
    ],
  };
  
  // Labels (x-axis values)
  const labels: Record<string, string[]> = {
    '1d': Array.from({length: 24}, (_, i) => `${i}:00`),
    '1w': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    '1m': Array.from({length: 30}, (_, i) => `${i+1}`),
    '3m': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    '1y': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  };
  
  return {
    labels: labels[timeframe],
    datasets: [
      {
        label: 'BTC Price',
        data: priceData[timeframe],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: timeframe === '1d' ? 0 : 3,
        pointHoverRadius: 5,
      },
    ],
  };
};

const PriceChartWidget: React.FC<WidgetProps> = ({ widget, isEditing, onConfigChange }) => {
  // Type guard to ensure we're working with the right config type
  if (!isWidgetType(widget, 'price-chart')) {
    return <div>Invalid widget configuration</div>;
  }
  
  // Default values if not in config
  const symbol = widget.config.symbol || 'BTC/USD';
  const timeframe = widget.config.timeframe || '1d';
  const showVolume = widget.config.showVolume || false;
  
  // Local state for chart settings when in edit mode
  const [editSettings, setEditSettings] = useState({
    symbol,
    timeframe,
    showVolume,
  });
  
  // Handle settings change in edit mode
  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...editSettings, [key]: value };
    setEditSettings(newSettings);
    
    if (onConfigChange) {
      onConfigChange(newSettings);
    }
  };
  
  // Chart data
  const chartData = generateChartData(isEditing ? editSettings.timeframe : timeframe);
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        grid: {
          display: true,
          drawBorder: false,
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          callback: (value: number) => `$${value.toLocaleString()}`,
          maxTicksLimit: 6,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 6,
        },
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 flex flex-col p-3">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold text-lg">{symbol}</h3>
            <p className="text-2xl font-bold">$44,128.50</p>
            <span className="text-emerald-500 text-sm font-medium">+2.4%</span>
          </div>
          
          {!isEditing && (
            <Tabs defaultValue={timeframe} className="h-8">
              <TabsList className="h-8">
                <TabsTrigger value="1d" className="text-xs px-2">1D</TabsTrigger>
                <TabsTrigger value="1w" className="text-xs px-2">1W</TabsTrigger>
                <TabsTrigger value="1m" className="text-xs px-2">1M</TabsTrigger>
                <TabsTrigger value="3m" className="text-xs px-2">3M</TabsTrigger>
                <TabsTrigger value="1y" className="text-xs px-2">1Y</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
        
        {isEditing ? (
          <div className="mb-4 grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Cryptocurrency</Label>
              <Select 
                value={editSettings.symbol} 
                onValueChange={(value) => handleSettingChange('symbol', value)}
              >
                <SelectTrigger id="symbol">
                  <SelectValue placeholder="Select a cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTC/USD">Bitcoin (BTC/USD)</SelectItem>
                  <SelectItem value="ETH/USD">Ethereum (ETH/USD)</SelectItem>
                  <SelectItem value="BNB/USD">Binance Coin (BNB/USD)</SelectItem>
                  <SelectItem value="SOL/USD">Solana (SOL/USD)</SelectItem>
                  <SelectItem value="ADA/USD">Cardano (ADA/USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeframe">Default Timeframe</Label>
              <Select 
                value={editSettings.timeframe} 
                onValueChange={(value) => handleSettingChange('timeframe', value)}
              >
                <SelectTrigger id="timeframe">
                  <SelectValue placeholder="Select a timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">1 Day</SelectItem>
                  <SelectItem value="1w">1 Week</SelectItem>
                  <SelectItem value="1m">1 Month</SelectItem>
                  <SelectItem value="3m">3 Months</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-[180px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceChartWidget;