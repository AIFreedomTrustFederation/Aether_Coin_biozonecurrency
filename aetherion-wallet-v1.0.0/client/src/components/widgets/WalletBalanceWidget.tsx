import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WidgetProps } from './WidgetRegistry';
import { isWidgetType } from '@/types/widget';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  ChevronUp, 
  ChevronDown, 
  Wallet,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Sample wallet data
const sampleWallets = [
  {
    id: '1',
    name: 'Main Wallet',
    address: '0x8f2d3...7b26',
    chain: 'Ethereum',
    balance: '3.42',
    symbol: 'ETH',
    dollarValue: 15025.38,
    percentChange: 2.4,
  },
  {
    id: '2',
    name: 'Savings',
    address: '0x7a91c...3f12',
    chain: 'Solana',
    balance: '82.5',
    symbol: 'SOL',
    dollarValue: 7507.65,
    percentChange: -1.2,
  },
  {
    id: '3',
    name: 'Staking',
    address: '0x2d5e8...9c44',
    chain: 'Cardano',
    balance: '2450',
    symbol: 'ADA',
    dollarValue: 1225.00,
    percentChange: 0.8,
  }
];

const WalletBalanceWidget: React.FC<WidgetProps> = ({ widget, isEditing, onConfigChange }) => {
  // Type guard
  if (!isWidgetType(widget, 'wallet-balance')) {
    return <div>Invalid widget configuration</div>;
  }
  
  // Default config values
  const showFiat = widget.config.showFiat ?? true;
  const showChange = widget.config.showChange ?? true;
  const filterChains = widget.config.filterChains || [];
  
  // Local state for editing
  const [editSettings, setEditSettings] = useState({
    showFiat,
    showChange,
    filterChains: [...filterChains],
    newAddress: '',
  });
  
  // Total balance calculation
  const totalBalance = sampleWallets.reduce((sum, wallet) => sum + wallet.dollarValue, 0);
  const highestShare = Math.max(...sampleWallets.map(w => w.dollarValue));
  
  // Handle settings change
  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...editSettings, [key]: value };
    setEditSettings(newSettings);
    
    if (onConfigChange) {
      const { newAddress, ...configToSave } = newSettings;
      onConfigChange(configToSave);
    }
  };
  
  // Handle toggle changes
  const handleToggleChange = (key: string) => {
    handleSettingChange(key, !editSettings[key as keyof typeof editSettings]);
  };
  
  // Filter wallets based on settings
  const filteredWallets = sampleWallets.filter(wallet => 
    editSettings.filterChains.length === 0 || 
    editSettings.filterChains.includes(wallet.chain)
  );
  
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 pt-4 px-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Wallet Balance</h3>
          <div className="text-right">
            <p className="text-xl font-bold">${totalBalance.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Balance</p>
          </div>
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showFiat">Show Fiat Values</Label>
              <Switch
                id="showFiat"
                checked={editSettings.showFiat}
                onCheckedChange={() => handleToggleChange('showFiat')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showChange">Show Percentage Changes</Label>
              <Switch
                id="showChange"
                checked={editSettings.showChange}
                onCheckedChange={() => handleToggleChange('showChange')}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Filter by Blockchain</Label>
              <div className="grid grid-cols-2 gap-2">
                {['Ethereum', 'Solana', 'Cardano', 'Polkadot', 'Avalanche'].map((chain) => (
                  <div key={chain} className="flex items-center space-x-2">
                    <Checkbox
                      id={`chain-${chain}`}
                      checked={editSettings.filterChains.includes(chain)}
                      onCheckedChange={(checked) => {
                        const chains = checked 
                          ? [...editSettings.filterChains, chain]
                          : editSettings.filterChains.filter(c => c !== chain);
                        handleSettingChange('filterChains', chains);
                      }}
                    />
                    <Label htmlFor={`chain-${chain}`}>{chain}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredWallets.map((wallet) => (
              <div key={wallet.id} className="flex flex-col space-y-1">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <Wallet className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-sm">{wallet.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{wallet.address}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {wallet.balance} {wallet.symbol}
                    </div>
                    {showFiat && (
                      <div className="text-sm text-muted-foreground">
                        ${wallet.dollarValue.toLocaleString()}
                      </div>
                    )}
                    {showChange && (
                      <div className={`text-xs flex items-center justify-end ${wallet.percentChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {wallet.percentChange >= 0 ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                        {Math.abs(wallet.percentChange)}%
                      </div>
                    )}
                  </div>
                </div>
                <Progress 
                  value={(wallet.dollarValue / highestShare) * 100} 
                  className="h-1.5" 
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletBalanceWidget;