import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WidgetProps } from './WidgetRegistry';
import { isWidgetType } from '@/types/widget';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';

// Sample transaction data
const sampleTransactions = [
  {
    id: 'tx1',
    type: 'receive',
    amount: '0.45',
    symbol: 'ETH',
    fromAddress: '0x7a91c...3f12',
    toAddress: '0x8f2d3...7b26',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    status: 'confirmed',
    hash: '0x7ad8173b3a...',
    fee: '0.003',
    aiVerified: true,
  },
  {
    id: 'tx2',
    type: 'send',
    amount: '150',
    symbol: 'USDC',
    fromAddress: '0x8f2d3...7b26',
    toAddress: '0x2d5e8...9c44',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: 'confirmed',
    hash: '0x8bc0923da1...',
    fee: '0.002',
    aiVerified: true,
  },
  {
    id: 'tx3',
    type: 'contract',
    amount: '0.05',
    symbol: 'ETH',
    fromAddress: '0x8f2d3...7b26',
    toAddress: '0x1a2b3...c4d5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    status: 'pending',
    hash: '0x9ac1674be2...',
    fee: '0.004',
    aiVerified: false,
  },
  {
    id: 'tx4',
    type: 'receive',
    amount: '200',
    symbol: 'USDT',
    fromAddress: '0x3f4c5...d6e7',
    toAddress: '0x8f2d3...7b26',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    status: 'confirmed',
    hash: '0x6bd9834fc1...',
    fee: '0.001',
    aiVerified: true,
  },
  {
    id: 'tx5',
    type: 'send',
    amount: '0.25',
    symbol: 'ETH',
    fromAddress: '0x8f2d3...7b26',
    toAddress: '0x5a6b7...c8d9',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    status: 'confirmed',
    hash: '0x3ac6789fe2...',
    fee: '0.002',
    aiVerified: true,
  },
  {
    id: 'tx6',
    type: 'contract',
    amount: '75',
    symbol: 'LINK',
    fromAddress: '0x8f2d3...7b26',
    toAddress: '0xf1e2d...3c4b',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    status: 'failed',
    hash: '0x2bd5467ac3...',
    fee: '0.003',
    aiVerified: false,
  }
];

// Format relative time
const formatRelativeTime = (timestamp: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) {
    return `${diffDay}d ago`;
  } else if (diffHour > 0) {
    return `${diffHour}h ago`;
  } else if (diffMin > 0) {
    return `${diffMin}m ago`;
  } else {
    return 'Just now';
  }
};

const TransactionFeedWidget: React.FC<WidgetProps> = ({ widget, isEditing, onConfigChange }) => {
  // Type guard
  if (!isWidgetType(widget, 'transaction-feed')) {
    return <div>Invalid widget configuration</div>;
  }
  
  // Default config values
  const limit = widget.config.limit || 5;
  const showDetails = widget.config.showDetails ?? true;
  const filterType = widget.config.filterType || 'all';
  
  // Local state for editing
  const [editSettings, setEditSettings] = useState({
    limit,
    showDetails,
    filterType,
  });
  
  // Handle settings change
  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...editSettings, [key]: value };
    setEditSettings(newSettings);
    
    if (onConfigChange) {
      onConfigChange(newSettings);
    }
  };
  
  // Filter transactions based on settings
  const filteredTransactions = sampleTransactions
    .filter(tx => {
      if (editSettings.filterType === 'all') return true;
      return tx.type === editSettings.filterType;
    })
    .slice(0, editSettings.limit);
  
  // Get icon based on transaction type and status
  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') return <Clock className="h-5 w-5 text-amber-500" />;
    if (status === 'failed') return <AlertTriangle className="h-5 w-5 text-red-500" />;
    
    if (type === 'receive') return <ArrowDownRight className="h-5 w-5 text-emerald-500" />;
    if (type === 'send') return <ArrowUpRight className="h-5 w-5 text-blue-500" />;
    if (type === 'contract') return <RefreshCw className="h-5 w-5 text-purple-500" />;
    
    return <CheckCircle2 className="h-5 w-5 text-primary" />;
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 pt-4 px-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Transaction History</h3>
          
          {!isEditing && (
            <Select 
              value={filterType} 
              onValueChange={(value) => handleSettingChange('filterType', value)}
            >
              <SelectTrigger className="h-7 text-xs w-28">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Txns</SelectItem>
                <SelectItem value="receive">Received</SelectItem>
                <SelectItem value="send">Sent</SelectItem>
                <SelectItem value="contract">Contracts</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="limit">Number of transactions: {editSettings.limit}</Label>
              </div>
              <Slider 
                id="limit"
                min={1}
                max={10}
                step={1}
                value={[editSettings.limit]}
                onValueChange={(value) => handleSettingChange('limit', value[0])}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showDetails">Show Transaction Details</Label>
              <Switch
                id="showDetails"
                checked={editSettings.showDetails}
                onCheckedChange={(checked) => handleSettingChange('showDetails', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="filterType">Default Filter</Label>
              <Select 
                value={editSettings.filterType} 
                onValueChange={(value) => handleSettingChange('filterType', value)}
              >
                <SelectTrigger id="filterType">
                  <SelectValue placeholder="Filter transactions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="receive">Received Only</SelectItem>
                  <SelectItem value="send">Sent Only</SelectItem>
                  <SelectItem value="contract">Contract Interactions Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="space-y-3 overflow-hidden">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {getTransactionIcon(tx.type, tx.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {tx.type === 'receive' ? 'Received' : tx.type === 'send' ? 'Sent' : 'Contract'}
                      </span>
                      <span className="font-semibold">
                        {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.symbol}
                      </span>
                    </div>
                    
                    {showDetails && (
                      <>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground truncate pr-2">
                            {tx.type === 'receive' ? 'From: ' : 'To: '}
                            {tx.type === 'receive' ? tx.fromAddress : tx.toAddress}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatRelativeTime(tx.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          {getStatusBadge(tx.status)}
                          {tx.aiVerified && (
                            <Badge variant="outline" className="text-xs bg-primary-50 text-primary border-primary-200">
                              AI Verified
                            </Badge>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No transactions found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionFeedWidget;