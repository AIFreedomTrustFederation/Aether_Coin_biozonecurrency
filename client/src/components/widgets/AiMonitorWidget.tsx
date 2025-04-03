import React, { useState } from 'react';
import { WidgetProps } from './WidgetRegistry';
import { AiMonitorConfig } from '@/types/widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Shield, CheckCircle, XCircle, ChevronDown, ChevronUp, BotMessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock AI alerts (would come from API in real implementation)
const AI_ALERTS = [
  {
    id: 'alert1',
    severity: 'high',
    title: 'Suspicious Transaction Detected',
    description: 'A transaction to an unknown address has been detected with an unusually high amount.',
    timestamp: new Date('2025-04-03T12:15:00Z'),
    walletAddress: '0x5e6f...7g8h',
    transactionHash: '0xabc123...',
    resolved: false
  },
  {
    id: 'alert2',
    severity: 'medium',
    title: 'New DeFi Smart Contract Interaction',
    description: 'Your wallet interacted with a recently deployed DeFi contract that has not been audited.',
    timestamp: new Date('2025-04-02T09:45:22Z'),
    walletAddress: '0x5e6f...7g8h',
    transactionHash: '0xdef456...',
    resolved: false
  },
  {
    id: 'alert3',
    severity: 'low',
    title: 'Gas Price Surge',
    description: 'Network congestion detected. Gas prices have increased by 300% in the last hour.',
    timestamp: new Date('2025-04-01T22:30:15Z'),
    walletAddress: null,
    transactionHash: null,
    resolved: true
  },
  {
    id: 'alert4',
    severity: 'medium',
    title: 'Phishing Domain Detection',
    description: 'A website you visited recently has been flagged as a potential phishing attempt.',
    timestamp: new Date('2025-03-31T15:12:40Z'),
    walletAddress: null,
    transactionHash: null,
    resolved: true
  }
];

// Mock security recommendations
const SECURITY_RECOMMENDATIONS = [
  'Enable two-factor authentication for all your crypto exchange accounts',
  'Consider using a hardware wallet for long-term storage of your assets',
  'Regularly review your connected dApps and revoke access for unused applications',
  'Set up spending limits on your wallets to prevent unauthorized large transfers',
  'Conduct regular security audits of your wallet permissions'
];

const AiMonitorWidget: React.FC<WidgetProps> = ({ widget }) => {
  const config = widget.config as AiMonitorConfig;
  const alertLevel = config.alertLevel || 'medium';
  const showRecommendations = config.showRecommendations !== false;
  
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>('alert1');
  
  // Filter alerts based on alertLevel
  const getAlertWeight = (severity: string) => {
    switch (severity) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };
  
  const getAlertLevelWeight = (level: string) => {
    switch (level) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  };
  
  const filteredAlerts = AI_ALERTS.filter(alert => 
    getAlertWeight(alert.severity) >= getAlertLevelWeight(alertLevel)
  );
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-100';
      case 'medium': return 'text-amber-500 bg-amber-100';
      case 'low': return 'text-green-500 bg-green-100';
      default: return 'text-blue-500 bg-blue-100';
    }
  };
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Shield className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60); // minutes
    
    if (diff < 60) {
      return `${diff} min ago`;
    } else if (diff < 1440) {
      return `${Math.floor(diff / 60)} hr ago`;
    } else {
      return `${Math.floor(diff / 1440)} days ago`;
    }
  };
  
  const toggleAlert = (alertId: string) => {
    setExpandedAlertId(expandedAlertId === alertId ? null : alertId);
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <BotMessageSquare className="h-5 w-5 mr-2" />
            AI Security Monitor
          </CardTitle>
          <Badge variant="outline" className={cn(
            filteredAlerts.some(a => a.severity === 'high' && !a.resolved)
              ? 'bg-red-100 text-red-700 border-red-200'
              : 'bg-green-100 text-green-700 border-green-200'
          )}>
            {filteredAlerts.some(a => a.severity === 'high' && !a.resolved)
              ? 'Issues Detected'
              : 'All Clear'
            }
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 overflow-auto">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
            <h3 className="font-medium">All Clear</h3>
            <p className="text-sm text-muted-foreground mt-1">
              No security issues have been detected.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map(alert => (
              <div key={alert.id} className={cn(
                "border rounded-md transition-all",
                alert.resolved 
                  ? "opacity-70 border-muted"
                  : "border-muted-foreground/20"
              )}>
                <div 
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleAlert(alert.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn("p-1.5 rounded-full", getSeverityColor(alert.severity))}>
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div>
                      <div className="font-medium flex items-center">
                        {alert.title}
                        {alert.resolved && (
                          <Badge variant="outline" className="ml-2 bg-green-100 text-green-700 border-green-200 text-xs">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(alert.timestamp)}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                    {expandedAlertId === alert.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                
                {expandedAlertId === alert.id && (
                  <div className="p-3 pt-0 border-t border-border/50">
                    <p className="text-sm mb-2">{alert.description}</p>
                    
                    {(alert.walletAddress || alert.transactionHash) && (
                      <div className="text-xs text-muted-foreground mb-2">
                        {alert.walletAddress && (
                          <div className="mb-1">
                            <span className="font-medium">Wallet:</span> {alert.walletAddress}
                          </div>
                        )}
                        {alert.transactionHash && (
                          <div>
                            <span className="font-medium">Transaction:</span> {alert.transactionHash}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!alert.resolved && (
                      <div className="flex justify-end space-x-2 mt-2">
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          Investigate
                        </Button>
                        <Button size="sm" className="text-xs h-7">
                          Mark as Resolved
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {showRecommendations && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Security Recommendations</h3>
                <ul className="space-y-1">
                  {SECURITY_RECOMMENDATIONS.slice(0, 3).map((rec, idx) => (
                    <li key={idx} className="text-xs text-muted-foreground flex items-start">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiMonitorWidget;