import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WidgetProps } from './WidgetRegistry';
import { isWidgetType } from '@/types/widget';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Server,
  RotateCw,
  Lock
} from 'lucide-react';

// Sample quantum validation data
const sampleValidationData = {
  status: 'secure', // 'secure', 'warning', 'at_risk'
  lastScan: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
  quantumProtection: {
    level: 'high', // 'low', 'medium', 'high'
    algosImplemented: ['lattice-based', 'hash-based', 'multivariate', 'isogeny-based'],
    vulnerabilities: []
  },
  metrics: {
    quantumStrength: 95, // 0-100
    classicalStrength: 100, // 0-100
    implementationQuality: 92, // 0-100
    overallScore: 94 // 0-100
  },
  details: {
    keysProtected: 8,
    vulnerableCurves: 0,
    activeScans: 1,
    scanInterval: 30, // Minutes
  },
  recommendations: [
    'Your wallet is currently quantum-resistant with high protection',
    'Ensure you backup your quantum-secure keys in multiple locations'
  ],
  scanHistory: [
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), score: 94 },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), score: 92 },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), score: 88 },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), score: 85 },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), score: 85 },
  ]
};

// Sample warning data
const sampleWarningData = {
  status: 'warning',
  lastScan: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
  quantumProtection: {
    level: 'medium',
    algosImplemented: ['lattice-based', 'hash-based'],
    vulnerabilities: ['ECDSA signatures']
  },
  metrics: {
    quantumStrength: 72,
    classicalStrength: 95,
    implementationQuality: 88, 
    overallScore: 78
  },
  details: {
    keysProtected: 4,
    vulnerableCurves: 2,
    activeScans: 1,
    scanInterval: 60,
  },
  recommendations: [
    'Migrate high-value assets to quantum-resistant addresses',
    'Upgrade wallet to support post-quantum signatures',
    'Enable additional protection for vulnerable ECDSA keys'
  ],
  scanHistory: [
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), score: 78 },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), score: 79 },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), score: 80 },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4), score: 80 },
    { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), score: 80 },
  ]
};

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

const QuantumValidatorWidget: React.FC<WidgetProps> = ({ widget, isEditing, onConfigChange }) => {
  // Type guard
  if (!isWidgetType(widget, 'quantum-validator')) {
    return <div>Invalid widget configuration</div>;
  }
  
  // Default config values
  const scanInterval = widget.config.scanInterval || 30;
  const alertThreshold = widget.config.alertThreshold || 'medium';
  const demoMode = widget.config.demoMode || 'secure'; // 'secure', 'warning'
  const autoScan = widget.config.autoScan ?? true;
  
  // Local state for editing
  const [editSettings, setEditSettings] = useState({
    scanInterval,
    alertThreshold,
    demoMode,
    autoScan,
  });
  
  // State for scanning animation
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  // Handle settings change
  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...editSettings, [key]: value };
    setEditSettings(newSettings);
    
    if (onConfigChange) {
      onConfigChange(newSettings);
    }
  };
  
  // Simulate a scan
  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
  };
  
  // Update scan progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isScanning) {
      interval = setInterval(() => {
        setScanProgress(prev => {
          const next = prev + (100 / 20); // Scan takes ~2s (20 ticks of 100ms)
          if (next >= 100) {
            setIsScanning(false);
            return 100;
          }
          return next;
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning]);
  
  // Use correct data based on demo mode
  const validationData = editSettings.demoMode === 'secure' ? sampleValidationData : sampleWarningData;
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure':
        return <ShieldCheck className="h-5 w-5 text-emerald-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'at_risk':
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      default:
        return <ShieldCheck className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  // Get level badge color
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };
  
  // Get color for quantum strength
  const getStrengthColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardContent className="flex-1 pt-4 px-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Quantum Security</h3>
          </div>
          
          {!isEditing && (
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={startScan}
                disabled={isScanning}
              >
                {autoScan ? (
                  <PauseCircle className="h-4 w-4" />
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={startScan}
                disabled={isScanning}
              >
                <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="scanInterval">Scan Interval: {editSettings.scanInterval} minutes</Label>
              </div>
              <Slider 
                id="scanInterval"
                min={15}
                max={120}
                step={15}
                value={[editSettings.scanInterval]}
                onValueChange={(value) => handleSettingChange('scanInterval', value[0])}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alertThreshold">Alert Threshold</Label>
              <Select 
                value={editSettings.alertThreshold} 
                onValueChange={(value) => handleSettingChange('alertThreshold', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Set threshold for alerts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Alert on any potential issue)</SelectItem>
                  <SelectItem value="medium">Medium (Standard protection)</SelectItem>
                  <SelectItem value="high">High (Alert only for critical issues)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="autoScan">Automatic Background Scanning</Label>
              <Switch
                id="autoScan"
                checked={editSettings.autoScan}
                onCheckedChange={(checked) => handleSettingChange('autoScan', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="demoMode">Demo Mode</Label>
              <Select 
                value={editSettings.demoMode} 
                onValueChange={(value) => handleSettingChange('demoMode', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose demo scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="secure">Secure Wallet Scenario</SelectItem>
                  <SelectItem value="warning">Vulnerable Wallet Scenario</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This setting allows you to see different security scenarios for demo purposes.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {isScanning ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Scanning wallet security...</span>
                  <span className="text-xs text-muted-foreground">{Math.round(scanProgress)}%</span>
                </div>
                <Progress value={scanProgress} className="h-2" />
                <div className="flex items-center text-xs text-muted-foreground space-x-2">
                  <RotateCw className="h-3 w-3 animate-spin" />
                  <span>Analyzing quantum resistance patterns...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(validationData.status)}
                    <span className="font-medium">
                      {validationData.status === 'secure' 
                        ? 'Quantum Secure' 
                        : validationData.status === 'warning'
                        ? 'Potential Vulnerabilities'
                        : 'At Risk'}
                    </span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getLevelColor(validationData.quantumProtection.level)}`}
                  >
                    {validationData.quantumProtection.level.charAt(0).toUpperCase() + validationData.quantumProtection.level.slice(1)} Protection
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Quantum Strength</div>
                    <div className="flex items-end justify-between">
                      <span className={`text-lg font-semibold ${getStrengthColor(validationData.metrics.quantumStrength)}`}>
                        {validationData.metrics.quantumStrength}%
                      </span>
                    </div>
                    <Progress 
                      value={validationData.metrics.quantumStrength} 
                      className="h-1.5" 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Overall Score</div>
                    <div className="flex items-end justify-between">
                      <span className={`text-lg font-semibold ${getStrengthColor(validationData.metrics.overallScore)}`}>
                        {validationData.metrics.overallScore}%
                      </span>
                    </div>
                    <Progress 
                      value={validationData.metrics.overallScore} 
                      className="h-1.5" 
                    />
                  </div>
                </div>
                
                <div className="text-xs border border-muted rounded-md p-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Protected Keys</span>
                      <span className="font-medium">{validationData.details.keysProtected}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Vulnerable</span>
                      <span className="font-medium">{validationData.details.vulnerableCurves}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last Scan</span>
                      <span className="font-medium">{formatRelativeTime(validationData.lastScan)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Next Scan</span>
                      <span className="font-medium">{validationData.details.scanInterval}m</span>
                    </div>
                  </div>
                </div>
                
                {validationData.status !== 'secure' && (
                  <div className="mt-2 text-xs space-y-1">
                    <div className="font-medium">Recommendations:</div>
                    <ul className="ml-4 space-y-1 list-disc text-muted-foreground">
                      {validationData.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuantumValidatorWidget;