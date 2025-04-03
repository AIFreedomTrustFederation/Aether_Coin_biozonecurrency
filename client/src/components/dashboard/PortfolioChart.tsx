import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PortfolioChart = () => {
  const [activeRange, setActiveRange] = useState(0);
  
  const timeRanges = [
    { label: '1W', days: 7 },
    { label: '1M', days: 30 },
    { label: '3M', days: 90 },
    { label: '1Y', days: 365 },
  ];

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
        
        <div className="w-full h-[300px] border border-border rounded-lg bg-muted/20 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2">$15,557.00</div>
            <div className="text-sm text-green-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              +1.76% Last {timeRanges[activeRange].days} days
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioChart;
