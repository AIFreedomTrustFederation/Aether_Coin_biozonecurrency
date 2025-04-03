import React from 'react';
import { WidgetProps } from './WidgetRegistry';
import { TransactionFeedConfig } from '@/types/widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft, Clock, Calendar, CheckCircle2, XCircle } from 'lucide-react';

// Mock transaction data (would come from API in real implementation)
const TRANSACTION_DATA = [
  {
    id: 'tx1',
    type: 'send',
    amount: 0.05,
    currency: 'BTC',
    fiatValue: 2500,
    timestamp: new Date('2025-04-02T14:32:10Z'),
    status: 'confirmed',
    to: '0x1a2b...3c4d',
    from: '0x5e6f...7g8h',
    fee: 0.0003,
    confirmations: 6
  },
  {
    id: 'tx2',
    type: 'receive',
    amount: 500,
    currency: 'ADA',
    fiatValue: 250,
    timestamp: new Date('2025-04-01T23:15:42Z'),
    status: 'confirmed',
    to: '0x5e6f...7g8h',
    from: '0x9i10...11j12',
    fee: 0.2,
    confirmations: 24
  },
  {
    id: 'tx3',
    type: 'send',
    amount: 1.75,
    currency: 'ETH',
    fiatValue: 5250,
    timestamp: new Date('2025-04-01T18:07:33Z'),
    status: 'pending',
    to: '0xab12...cd34',
    from: '0x5e6f...7g8h',
    fee: 0.002,
    confirmations: 0
  },
  {
    id: 'tx4',
    type: 'receive',
    amount: 15.3,
    currency: 'SOL',
    fiatValue: 1530,
    timestamp: new Date('2025-03-31T10:22:15Z'),
    status: 'confirmed',
    to: '0x5e6f...7g8h',
    from: '0xef56...gh78',
    fee: 0.00005,
    confirmations: 256
  },
  {
    id: 'tx5',
    type: 'send',
    amount: 150,
    currency: 'XRP',
    fiatValue: 120,
    timestamp: new Date('2025-03-30T09:11:25Z'),
    status: 'failed',
    to: '0xij90...kl12',
    from: '0x5e6f...7g8h',
    fee: 0.01,
    confirmations: 0
  }
];

const TransactionFeedWidget: React.FC<WidgetProps> = ({ widget }) => {
  const config = widget.config as TransactionFeedConfig;
  const limit = config.limit || 5;
  const showDetails = config.showDetails !== false;
  
  // Get transactions limited by the config
  const transactions = TRANSACTION_DATA.slice(0, limit);
  
  const formatFiat = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'pending': return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'failed': return <XCircle className="h-3 w-3 text-red-500" />;
      default: return null;
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg">Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No transactions found
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className={`p-2 rounded-full ${tx.type === 'receive' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {tx.type === 'receive' ? (
                    <ArrowDownLeft className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="font-medium truncate">
                      {tx.type === 'receive' ? 'Received' : 'Sent'} {tx.currency}
                    </div>
                    <div className="font-medium">
                      {tx.type === 'receive' ? '+' : '-'}{tx.amount} {tx.currency}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <div className="flex items-center mr-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(tx.timestamp)}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(tx.timestamp)}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-xs text-muted-foreground mr-1">
                        {formatFiat(tx.fiatValue)}
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(tx.status)}
                      </div>
                    </div>
                  </div>
                  
                  {showDetails && (
                    <div className="mt-2 pt-2 border-t border-muted text-xs text-muted-foreground">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div>From: {tx.from}</div>
                        <div>To: {tx.to}</div>
                        <div>Fee: {tx.fee} {tx.currency}</div>
                        <div>Confirmations: {tx.confirmations}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionFeedWidget;