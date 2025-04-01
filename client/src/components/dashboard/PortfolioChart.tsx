import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Sample data
const generateChartData = (days: number, trend: 'up' | 'down' | 'mixed') => {
  const data = [];
  let value = 40000 + Math.random() * 2000;
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate the next value based on trend
    if (trend === 'up') {
      value = value + (Math.random() * 1000) - 200;
    } else if (trend === 'down') {
      value = value - (Math.random() * 800) + 200;
    } else {
      value = value + (Math.random() * 1600) - 800;
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(value, 1000), // Ensure we don't go below 1000
      formattedDate: date.toLocaleDateString('en-US', { weekday: 'short' }),
    });
  }
  
  return data;
};

const timeRanges = [
  { label: '1W', days: 7, trend: 'up' as const },
  { label: '1M', days: 30, trend: 'mixed' as const },
  { label: '3M', days: 90, trend: 'up' as const },
  { label: '1Y', days: 365, trend: 'mixed' as const },
];

const PortfolioChart = () => {
  const [activeRange, setActiveRange] = useState(0);
  const data = generateChartData(
    timeRanges[activeRange].days,
    timeRanges[activeRange].trend
  );
  
  const formatYAxis = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };

  return (
    <Card className="lg:col-span-2">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Portfolio Performance</h3>
          <div className="flex">
            {timeRanges.map((range, index) => (
              <Button
                key={range.label}
                variant={activeRange === index ? "secondary" : "ghost"}
                className={`text-sm px-2 h-8 mr-2 ${
                  activeRange === index 
                    ? '' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveRange(index)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 5, left: 5, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="formattedDate" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tickFormatter={formatYAxis} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                fill="url(#colorGradient)" 
                strokeWidth={3}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioChart;
