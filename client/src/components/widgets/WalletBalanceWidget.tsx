import React from 'react';
import { WidgetProps } from './WidgetRegistry';
import { WalletBalanceConfig } from '@/types/widget';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown } from 'lucide-react';

// Mock wallet data (would come from API in real implementation)
const WALLET_DATA = [
  { currency: 'BTC', balance: 0.375, fiatValue: 18750, change: 2.3 },
  { currency: 'ETH', balance: 4.2, fiatValue: 12600, change: -1.5 },
  { currency: 'SOL', balance: 32.5, fiatValue: 3250, change: 5.7 },
  { currency: 'ADA', balance: 2420, fiatValue: 1210, change: -0.8 }
];

const WalletBalanceWidget: React.FC<WidgetProps> = ({ widget }) => {
  const config = widget.config as WalletBalanceConfig;
  const showFiat = config.showFiat !== false;
  const showChange = config.showChange !== false;
  
  // Sort by value descending
  const sortedWallets = [...WALLET_DATA].sort((a, b) => b.fiatValue - a.fiatValue);
  const totalValue = sortedWallets.reduce((acc, item) => acc + item.fiatValue, 0);
  
  const formatFiat = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="text-muted-foreground text-sm">Total Balance</div>
          <div className="text-2xl font-bold">{formatFiat(totalValue)}</div>
        </div>
        
        <div className="space-y-2">
          {sortedWallets.map((wallet) => (
            <div key={wallet.currency} className="flex justify-between items-center p-2 rounded-lg bg-muted/40">
              <div className="font-medium">
                {wallet.currency}
                <span className="text-xs text-muted-foreground ml-1">
                  {wallet.balance}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {showFiat && (
                  <div className="text-sm font-medium">
                    {formatFiat(wallet.fiatValue)}
                  </div>
                )}
                {showChange && (
                  <Badge variant={wallet.change >= 0 ? "default" : "destructive"} className="text-xs">
                    <span className="flex items-center">
                      {wallet.change >= 0 ? <ChevronUp className="h-3 w-3 mr-0.5" /> : <ChevronDown className="h-3 w-3 mr-0.5" />}
                      {Math.abs(wallet.change).toFixed(1)}%
                    </span>
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalanceWidget;