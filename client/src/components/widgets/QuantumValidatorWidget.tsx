import React, { useState, useEffect } from 'react';
import { WidgetProps } from './WidgetRegistry';
import { QuantumValidatorConfig } from '@/types/widget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ShieldCheck, 
  Clock, 
  RefreshCcw, 
  ShieldAlert, 
  CheckCircle2, 
  Lock,
  AlertTriangle
} from 'lucide-react';

// Mock security score data
const SECURITY_SCORE = {
  score: 85,
  lastScan: new Date('2025-04-02T16:45:00Z'),
  status: 'secure',
  quantum: {
    resistant: true,
    vulnerableAlgorithms: 0,
    totalAlgorithms: 5
  },
  wallets: {
    total: 3,
    secure: 2,
    vulnerable: 1
  },
  tests: [
    { name: 'Key Encryption', passed: true, score: 100 },
    { name: 'Signature Scheme', passed: true, score: 100 },
    { name: 'Entropy Source', passed: true, score: 95 },
    { name: 'Key Management', passed: true, score: 80 },
    { name: 'Transport Layer', passed: false, score: 65 }
  ]
};

const QuantumValidatorWidget: React.FC<WidgetProps> = ({ widget }) => {
  const config = widget.config as QuantumValidatorConfig;
  const scanInterval = config.scanInterval || 3600; // seconds
  const alertThreshold = config.alertThreshold || 'medium';
  
  const [isScanning, setIsScanning] = useState(false);
  const [securityData, setSecurityData] = useState(SECURITY_SCORE);
  
  // Handle scan action
  const handleScan = () => {
    setIsScanning(true);
    
    // Simulate scan delay
    setTimeout(() => {
      setIsScanning(false);
      setSecurityData({
        ...SECURITY_SCORE,
        lastScan: new Date()
      });
    }, 2000);
  };
  
  // Format time since last scan
  const formatTimeSince = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
    
    if (diff < 60) {
      return `${diff} seconds ago`;
    } else if (diff < 3600) {
      return `${Math.floor(diff / 60)} minutes ago`;
    } else if (diff < 86400) {
      return `${Math.floor(diff / 3600)} hours ago`;
    } else {
      return `${Math.floor(diff / 86400)} days ago`;
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'vulnerable': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };
  
  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Quantum Security
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={handleScan}
            disabled={isScanning}
          >
            <RefreshCcw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        {isScanning ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <Progress 
                  value={securityData.score} 
                  className="w-24 h-24 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(securityData.score)}`}>
                      {securityData.score}%
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 text-center">
                <Badge 
                  variant="outline" 
                  className={getStatusColor(securityData.status)}
                >
                  {securityData.status === 'secure' ? (
                    <div className="flex items-center">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Quantum Secure
                    </div>
                  ) : securityData.status === 'warning' ? (
                    <div className="flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Needs Attention
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <ShieldAlert className="h-3 w-3 mr-1" />
                      Vulnerable
                    </div>
                  )}
                </Badge>
                
                <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Last scan: {formatTimeSince(securityData.lastScan)}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Security Tests</h3>
              
              {securityData.tests.map((test, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/40"
                >
                  <div className="flex items-center">
                    {test.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                    )}
                    <span>{test.name}</span>
                  </div>
                  <Badge 
                    variant={test.passed ? "default" : "outline"}
                    className={!test.passed ? "bg-amber-100 text-amber-800 border-amber-200" : ""}
                  >
                    {test.score}%
                  </Badge>
                </div>
              ))}
              
              <div className="text-xs text-muted-foreground mt-1">
                <div className="flex justify-between mt-2">
                  <span>Total Wallets: {securityData.wallets.total}</span>
                  <span className="text-green-500">Secure: {securityData.wallets.secure}</span>
                  {securityData.wallets.vulnerable > 0 && (
                    <span className="text-amber-500">Needs Attention: {securityData.wallets.vulnerable}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground text-center mt-4">
          Auto-scans every {Math.floor(scanInterval / 60)} minutes
        </div>
      </CardContent>
    </Card>
  );
};

export default QuantumValidatorWidget;