import React, { useState } from 'react';
import { useAI } from '../contexts/AIContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  ShieldCheck, 
  Shield, 
  AlertTriangle, 
  AlarmClock, 
  Fingerprint, 
  CheckCircle2,
  BarChart3,
  Zap,
  GaugeCircle,
  ShieldX,
  AlertOctagon,
  Info,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { ProgressCircle } from './ProgressCircle';
import { formatDate } from '../utils/formatters';
import { SecurityHistoryProps, SecurityIssue } from '../types';

// Badge variant for different severity levels
const getSeverityBadge = (severity: string) => {
  switch(severity.toLowerCase()) {
    case 'critical':
      return <Badge variant="destructive" className="bg-red-600">Critical</Badge>;
    case 'high':
      return <Badge variant="destructive">High</Badge>;
    case 'medium':
      return <Badge variant="secondary" className="bg-orange-500 text-white">Medium</Badge>;
    case 'low':
      return <Badge variant="secondary" className="bg-blue-500 text-white">Low</Badge>;
    default:
      return null;
  }
};

// Issue card component
interface IssueCardProps {
  issue: SecurityIssue;
  onResolve: (id: number) => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onResolve }) => {
  const [expanded, setExpanded] = useState(false);
  
  const severityIcon = {
    critical: <AlertOctagon className="h-5 w-5 text-red-600" />,
    high: <AlertTriangle className="h-5 w-5 text-red-500" />,
    medium: <AlertTriangle className="h-5 w-5 text-orange-500" />,
    low: <Info className="h-5 w-5 text-blue-500" />
  }[issue.severity.toLowerCase()] || <Info className="h-5 w-5" />;
  
  return (
    <Card className={`mb-4 ${issue.resolved ? 'bg-muted/30' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            {severityIcon}
            <div>
              <CardTitle className="text-base">
                {issue.title}
              </CardTitle>
              <CardDescription className="text-xs">
                Detected on {formatDate(issue.detectedAt)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getSeverityBadge(issue.severity)}
            {issue.resolved && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800">
                Resolved
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm mb-3">
          {expanded ? issue.description : issue.description.substring(0, 100) + (issue.description.length > 100 ? '...' : '')}
        </p>
        
        {expanded && (
          <div className="space-y-3 mt-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Category</h4>
              <p className="text-sm text-muted-foreground">{issue.category}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Recommendation</h4>
              <p className="text-sm text-muted-foreground">{issue.recommendation}</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-auto font-normal"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <span className="flex items-center">
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </span>
          ) : (
            <span className="flex items-center">
              <ChevronDown className="h-4 w-4 mr-1" />
              Show More
            </span>
          )}
        </Button>
        
        {!issue.resolved && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
            onClick={() => onResolve(issue.id)}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Mark as Resolved
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// Score summary card component
interface ScoreSummaryProps {
  score: number;
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const ScoreSummary: React.FC<ScoreSummaryProps> = ({ score, title, icon, description, color }) => {
  return (
    <div className="flex items-start gap-3">
      <div className={`rounded-full p-2 ${color}`}>
        {icon}
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <h3 className="font-medium">{title}</h3>
          <span className="text-lg font-bold">{score}/100</span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

// Main component
const SecurityHistory: React.FC<SecurityHistoryProps> = ({ className = '' }) => {
  const { state, resolveSecurityIssue } = useAI();
  const { securityScans } = state;
  
  const [activeTab, setActiveTab] = useState<string>('all');
  const [activeScore, setActiveScore] = useState<string>('overall');
  
  const handleResolveIssue = (scanId: number, issueId: number) => {
    resolveSecurityIssue(scanId, issueId);
  };
  
  // Filter issues based on active tab
  const filterIssues = (scan: any) => {
    switch (activeTab) {
      case 'critical':
        return scan.issues.filter((issue: any) => issue.severity.toLowerCase() === 'critical' && !issue.resolved);
      case 'high':
        return scan.issues.filter((issue: any) => issue.severity.toLowerCase() === 'high' && !issue.resolved);
      case 'medium':
        return scan.issues.filter((issue: any) => issue.severity.toLowerCase() === 'medium' && !issue.resolved);
      case 'low':
        return scan.issues.filter((issue: any) => issue.severity.toLowerCase() === 'low' && !issue.resolved);
      case 'resolved':
        return scan.issues.filter((issue: any) => issue.resolved);
      default:
        return scan.issues;
    }
  };
  
  // Get counts of issues by severity and resolved status
  const getIssueCounts = () => {
    if (securityScans.length === 0) return { critical: 0, high: 0, medium: 0, low: 0, resolved: 0, total: 0 };
    
    // Get most recent scan
    const latestScan = securityScans[0];
    
    const counts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      resolved: 0,
      total: latestScan.issues.length
    };
    
    latestScan.issues.forEach(issue => {
      if (issue.resolved) {
        counts.resolved++;
      } else {
        counts[issue.severity.toLowerCase() as keyof typeof counts] += 1;
      }
    });
    
    return counts;
  };
  
  const issueCounts = getIssueCounts();
  
  // If there are no scans, show empty state
  if (securityScans.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${className}`}>
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Security Scans Available</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Your wallet hasn't been scanned for security vulnerabilities yet. Security scans help identify potential risks and improve your wallet security.
        </p>
        <Button className="gap-2">
          <ShieldCheck className="h-4 w-4" /> 
          Run Security Scan
        </Button>
      </div>
    );
  }
  
  // Get the most recent scan
  const latestScan = securityScans[0];
  
  // Get score based on active score tab
  const getActiveScore = () => {
    switch (activeScore) {
      case 'security':
        return latestScan.securityScore;
      case 'diversification':
        return latestScan.diversificationScore;
      case 'activity':
        return latestScan.activityScore;
      case 'gas':
        return latestScan.gasOptimizationScore;
      default:
        return latestScan.overallScore;
    }
  };
  
  const scoreValue = getActiveScore();
  
  // Generate color for score value
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };
  
  const scoreColor = getScoreColor(scoreValue);
  
  // Get background color based on score for the circle
  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };
  
  const scoreBgColor = getScoreBgColor(scoreValue);
  
  // Get score description
  const getScoreDescription = () => {
    switch (activeScore) {
      case 'security':
        return "Measures how well your wallet is protected against vulnerabilities and threats.";
      case 'diversification':
        return "Evaluates how well your assets are diversified across different tokens and chains.";
      case 'activity':
        return "Assesses your wallet's transaction patterns and frequency of use.";
      case 'gas':
        return "Analyzes how efficiently you're spending on gas fees across transactions.";
      default:
        return "Composite score reflecting your wallet's overall health and security posture.";
    }
  };
  
  const scoreDescription = getScoreDescription();
  
  // Generate score status text
  const getScoreStatus = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 40) return "Needs Improvement";
    return "Poor";
  };
  
  const scoreStatus = getScoreStatus(scoreValue);
  
  const filteredIssues = filterIssues(latestScan);
  
  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-semibold flex items-center">
            <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
            Wallet Security Health
          </h2>
          <p className="text-sm text-muted-foreground">
            Last scan: {formatDate(latestScan.timestamp)}
          </p>
        </div>
        <p className="text-muted-foreground mb-4">
          Monitor your wallet security and resolve detected issues
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Score Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Wallet Health Score</CardTitle>
            <CardDescription>
              Comprehensive assessment of your wallet's security posture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative flex flex-col items-center">
                <ProgressCircle 
                  value={scoreValue} 
                  size={150} 
                  strokeWidth={10} 
                  className={scoreBgColor}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${scoreColor}`}>{scoreValue}</span>
                  <span className="text-sm text-muted-foreground">out of 100</span>
                </div>
              </div>
              
              <div>
                <Badge 
                  className={`
                    ${scoreValue >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                      scoreValue >= 75 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' :
                      scoreValue >= 60 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' :
                      scoreValue >= 40 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }
                  `}
                >
                  {scoreStatus}
                </Badge>
              </div>
              
              <p className="text-sm text-center text-muted-foreground">
                {scoreDescription}
              </p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-2 gap-4 pt-3">
              <Button 
                variant={activeScore === 'overall' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setActiveScore('overall')}
              >
                <Award className="h-4 w-4 mr-1" />
                Overall
              </Button>
              <Button 
                variant={activeScore === 'security' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setActiveScore('security')}
              >
                <Shield className="h-4 w-4 mr-1" />
                Security
              </Button>
              <Button 
                variant={activeScore === 'diversification' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setActiveScore('diversification')}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Diversification
              </Button>
              <Button 
                variant={activeScore === 'activity' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setActiveScore('activity')}
              >
                <AlarmClock className="h-4 w-4 mr-1" />
                Activity
              </Button>
              <Button 
                variant={activeScore === 'gas' ? 'default' : 'outline'} 
                size="sm" 
                className="col-span-2"
                onClick={() => setActiveScore('gas')}
              >
                <Zap className="h-4 w-4 mr-1" />
                Gas Optimization
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Score Breakdown Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Breakdown</CardTitle>
            <CardDescription>
              Detailed view of score components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Overall</span>
                <span className="font-medium">{latestScan.overallScore}/100</span>
              </div>
              <Progress value={latestScan.overallScore} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Security</span>
                <span className="font-medium">{latestScan.securityScore}/100</span>
              </div>
              <Progress value={latestScan.securityScore} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Diversification</span>
                <span className="font-medium">{latestScan.diversificationScore}/100</span>
              </div>
              <Progress value={latestScan.diversificationScore} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Activity</span>
                <span className="font-medium">{latestScan.activityScore}/100</span>
              </div>
              <Progress value={latestScan.activityScore} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Gas Optimization</span>
                <span className="font-medium">{latestScan.gasOptimizationScore}/100</span>
              </div>
              <Progress value={latestScan.gasOptimizationScore} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Security Issues */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Security Issues & Recommendations</h3>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6">
            <TabsTrigger value="all">All ({issueCounts.total})</TabsTrigger>
            <TabsTrigger value="critical" className="text-red-600">Critical ({issueCounts.critical})</TabsTrigger>
            <TabsTrigger value="high" className="text-red-500">High ({issueCounts.high})</TabsTrigger>
            <TabsTrigger value="medium" className="text-orange-500">Medium ({issueCounts.medium})</TabsTrigger>
            <TabsTrigger value="low" className="text-blue-500">Low ({issueCounts.low})</TabsTrigger>
            <TabsTrigger value="resolved" className="text-green-600">Resolved ({issueCounts.resolved})</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="pt-4">
            <ScrollArea className="h-[400px] pr-4">
              {filteredIssues.length > 0 ? (
                <div className="space-y-4">
                  {filteredIssues.map(issue => (
                    <IssueCard 
                      key={issue.id} 
                      issue={issue}
                      onResolve={(id) => handleResolveIssue(latestScan.id, id)} 
                    />
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-10">
                  <ShieldCheck className="h-10 w-10 text-green-500 mb-2" />
                  <p className="text-muted-foreground">No issues in this category</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SecurityHistory;