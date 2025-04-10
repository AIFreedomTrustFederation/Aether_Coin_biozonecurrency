import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WidgetProps } from './WidgetRegistry';
import { isWidgetType } from '@/types/widget';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronRight,
  Brain,
  Zap,
  Lock
} from 'lucide-react';

// Sample AI monitoring logs
const sampleLogs = [
  {
    id: 'log1',
    action: 'threat_detected',
    description: 'Suspicious smart contract interaction with your wallet',
    severity: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    relatedEntityId: 'tx3',
    relatedEntityType: 'transaction',
    actionTaken: 'Transaction blocked',
    recommendations: [
      'Review the contract at 0x1a2b3...c4d5',
      'Report to community security channel'
    ]
  },
  {
    id: 'log2',
    action: 'transaction_verified',
    description: 'Routine swap on Uniswap verified as legitimate',
    severity: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    relatedEntityId: 'tx2',
    relatedEntityType: 'transaction',
    actionTaken: 'Transaction approved',
    recommendations: []
  },
  {
    id: 'log3',
    action: 'gas_optimization',
    description: 'You could save approximately $24.50 on gas fees with better timing',
    severity: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    relatedEntityId: null,
    relatedEntityType: null,
    actionTaken: null,
    recommendations: [
      'Consider scheduling transactions for off-peak hours',
      'Use gas price prediction tools for better timing'
    ]
  },
  {
    id: 'log4',
    action: 'threat_detected',
    description: 'Potential phishing website detected: eth2-staking.com',
    severity: 'critical',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    relatedEntityId: null,
    relatedEntityType: 'url',
    actionTaken: 'Website blocked',
    recommendations: [
      'Only use official Ethereum staking platforms',
      'Verify URLs carefully before connecting wallet'
    ]
  },
  {
    id: 'log5',
    action: 'wallet_audit',
    description: 'Weekly security audit completed - wallet security score: 87/100',
    severity: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    relatedEntityId: null,
    relatedEntityType: null,
    actionTaken: null,
    recommendations: [
      'Enable 2FA for enhanced security',
      'Consider using a hardware wallet for large amounts'
    ]
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

const AiMonitorWidget: React.FC<WidgetProps> = ({ widget, isEditing, onConfigChange }) => {
  // Type guard
  if (!isWidgetType(widget, 'ai-monitor')) {
    return <div>Invalid widget configuration</div>;
  }
  
  // Default config values
  const alertLevel = widget.config.alertLevel || 'medium';
  const showRecommendations = widget.config.showRecommendations ?? true;
  const limitToSeverity = widget.config.limitToSeverity || [];
  
  // Local state for editing and expanded log
  const [editSettings, setEditSettings] = useState({
    alertLevel,
    showRecommendations,
    limitToSeverity: [...limitToSeverity],
  });
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  
  // Handle settings change
  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...editSettings, [key]: value };
    setEditSettings(newSettings);
    
    if (onConfigChange) {
      onConfigChange(newSettings);
    }
  };
  
  // Filter logs based on settings and severity thresholds
  const severityLevels = {
    info: 1,
    warning: 2,
    critical: 3
  };
  
  const alertLevelThresholds = {
    low: 1,
    medium: 2,
    high: 3
  };
  
  const filteredLogs = sampleLogs.filter(log => {
    // Filter by specific severities if any are selected
    if (editSettings.limitToSeverity.length > 0 && 
        !editSettings.limitToSeverity.includes(log.severity)) {
      return false;
    }
    
    // Filter by alert level threshold
    const severityLevel = severityLevels[log.severity as keyof typeof severityLevels] || 1;
    const threshold = alertLevelThresholds[editSettings.alertLevel as keyof typeof alertLevelThresholds] || 2;
    
    return severityLevel >= threshold;
  });
  
  // Get icon based on log action and severity
  const getLogIcon = (action: string, severity: string) => {
    if (severity === 'critical') {
      return <ShieldAlert className="h-5 w-5 text-red-500" />;
    } else if (severity === 'warning') {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    } else if (action === 'transaction_verified' || action === 'wallet_audit') {
      return <ShieldCheck className="h-5 w-5 text-emerald-500" />;
    } else {
      return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-500">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500">Warning</Badge>;
      case 'info':
        return <Badge className="bg-blue-500">Info</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 pt-4 px-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">AI Security Monitor</h3>
          </div>
          
          {!isEditing && (
            <Select 
              value={alertLevel} 
              onValueChange={(value) => handleSettingChange('alertLevel', value)}
            >
              <SelectTrigger className="h-7 text-xs w-24">
                <SelectValue placeholder="Alerts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">All</SelectItem>
                <SelectItem value="medium">Medium+</SelectItem>
                <SelectItem value="high">Critical</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alertLevel">Alert Level Threshold</Label>
              <Select 
                value={editSettings.alertLevel} 
                onValueChange={(value) => handleSettingChange('alertLevel', value)}
              >
                <SelectTrigger id="alertLevel">
                  <SelectValue placeholder="Select alert level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Show All Alerts (Low)</SelectItem>
                  <SelectItem value="medium">Medium and Critical Only</SelectItem>
                  <SelectItem value="high">Critical Alerts Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showRecommendations">Show AI Recommendations</Label>
              <Switch
                id="showRecommendations"
                checked={editSettings.showRecommendations}
                onCheckedChange={(checked) => handleSettingChange('showRecommendations', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Filter by Severity</Label>
              <div className="flex flex-wrap gap-2">
                {['info', 'warning', 'critical'].map((severity) => (
                  <Badge
                    key={severity}
                    variant={editSettings.limitToSeverity.includes(severity) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const newLimitToSeverity = editSettings.limitToSeverity.includes(severity)
                        ? editSettings.limitToSeverity.filter(s => s !== severity)
                        : [...editSettings.limitToSeverity, severity];
                      handleSettingChange('limitToSeverity', newLimitToSeverity);
                    }}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {editSettings.limitToSeverity.length === 0
                  ? 'No filters applied - showing all severity levels'
                  : `Filtering to show only: ${editSettings.limitToSeverity.join(', ')}`}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 overflow-auto">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div key={log.id} className="bg-muted/40 rounded-sm p-2">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {getLogIcon(log.action, log.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{log.description}</span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelativeTime(log.timestamp)}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-1">
                        {getSeverityBadge(log.severity)}
                        {log.actionTaken && (
                          <Badge variant="outline" className="text-xs border-primary/30 bg-primary/10">
                            <Zap className="h-3 w-3 mr-1" />
                            {log.actionTaken}
                          </Badge>
                        )}
                      </div>
                      
                      {showRecommendations && log.recommendations.length > 0 && (
                        <>
                          {expandedLogId === log.id ? (
                            <div className="mt-2 space-y-1">
                              <div className="text-xs font-medium">AI Recommendations:</div>
                              <ul className="ml-5 text-xs space-y-1 list-disc">
                                {log.recommendations.map((rec, idx) => (
                                  <li key={idx}>{rec}</li>
                                ))}
                              </ul>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs h-6 mt-1 w-full justify-start p-0 hover:bg-transparent"
                                onClick={() => setExpandedLogId(null)}
                              >
                                Show less
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs h-6 mt-1 w-full justify-start p-0 hover:bg-transparent"
                              onClick={() => setExpandedLogId(log.id)}
                            >
                              <ChevronRight className="h-3 w-3 mr-1" />
                              Show AI recommendations
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-6 space-y-2">
                <Lock className="h-8 w-8 text-primary/70" />
                <p className="text-sm text-muted-foreground text-center">
                  No security alerts at your current alert level.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AiMonitorWidget;