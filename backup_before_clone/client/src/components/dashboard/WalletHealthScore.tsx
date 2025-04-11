import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWalletHealthScores, fetchWalletHealthIssues, updateWalletHealthIssueResolved } from '../../lib/api';
import { WalletHealthScore as WalletHealthScoreType, WalletHealthIssue } from '../../types/wallet';
import { queryClient } from '../../lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, ShieldAlert, ShieldCheck, Activity, TrendingUp, Zap, CheckCircle, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categoryIcons = {
  security: <ShieldAlert className="h-4 w-4 mr-2" />,
  diversification: <TrendingUp className="h-4 w-4 mr-2" />,
  activity: <Activity className="h-4 w-4 mr-2" />,
  gasOptimization: <Zap className="h-4 w-4 mr-2" />
};

const severityColors = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500'
};

const WalletHealthScore: React.FC = () => {
  const { toast } = useToast();
  const [selectedScore, setSelectedScore] = useState<WalletHealthScoreType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: healthScores, isLoading: scoresLoading, error: scoresError } = useQuery({ 
    queryKey: ['/api/wallet-health/scores'],
    queryFn: fetchWalletHealthScores
  });

  const { data: healthIssues, isLoading: issuesLoading, error: issuesError } = useQuery({
    queryKey: ['/api/wallet-health/issues', selectedScore?.id],
    queryFn: () => selectedScore ? fetchWalletHealthIssues(selectedScore.id) : Promise.resolve([]),
    enabled: !!selectedScore,
  });

  useEffect(() => {
    if (healthScores && healthScores.length > 0 && !selectedScore) {
      setSelectedScore(healthScores[0]);
    }
  }, [healthScores, selectedScore]);

  const markIssueResolved = async (issueId: number) => {
    try {
      const updatedIssue = await updateWalletHealthIssueResolved(issueId, true);
      toast({
        title: "Issue marked as resolved",
        description: "The issue has been marked as resolved.",
      });
      
      // Invalidate the query to refresh the issues list
      queryClient.invalidateQueries({ queryKey: ['/api/wallet-health/issues', selectedScore?.id] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark issue as resolved.",
        variant: "destructive",
      });
      console.error("Error resolving issue:", error);
    }
  };

  const filteredIssues = healthIssues?.filter(issue => 
    selectedCategory === 'all' || issue.category === selectedCategory
  ) || [];

  if (scoresLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2" /> Wallet Health Score
          </CardTitle>
          <CardDescription>Loading your wallet health data...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-6 bg-muted animate-pulse rounded-full" />
          <div className="h-28 bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (scoresError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldAlert className="mr-2 text-destructive" /> Wallet Health Score Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Failed to load health scores</AlertTitle>
            <AlertDescription>
              We couldn't load your wallet health data. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!healthScores || healthScores.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2" /> Wallet Health Score
          </CardTitle>
          <CardDescription>No wallet health data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>No wallet health data</AlertTitle>
            <AlertDescription>
              We haven't analyzed your wallet health yet. Select a wallet to analyze.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <ShieldCheck className="mr-2" /> Wallet Health Score
          </CardTitle>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                {selectedScore?.walletId ? `Wallet #${selectedScore.walletId}` : 'Select Wallet'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {healthScores.map((score) => (
                <DropdownMenuItem key={score.id} onClick={() => setSelectedScore(score)}>
                  Wallet #{score.walletId} - {score.overallScore}/100
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>
          {selectedScore?.backgroundScanTimestamp 
            ? `Last scanned: ${selectedScore.backgroundScanTimestamp.toLocaleString()}` 
            : 'Wallet health assessment'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {selectedScore && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Overall Score</span>
                <span className="font-bold">{selectedScore.overallScore}/100</span>
              </div>
              <Progress value={selectedScore.overallScore} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Security</span>
                  <span>{selectedScore.securityScore}/100</span>
                </div>
                <Progress value={selectedScore.securityScore} className="h-1.5" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Diversification</span>
                  <span>{selectedScore.diversificationScore}/100</span>
                </div>
                <Progress value={selectedScore.diversificationScore} className="h-1.5" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Activity</span>
                  <span>{selectedScore.activityScore}/100</span>
                </div>
                <Progress value={selectedScore.activityScore} className="h-1.5" />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Gas Optimization</span>
                  <span>{selectedScore.gasOptimizationScore}/100</span>
                </div>
                <Progress value={selectedScore.gasOptimizationScore} className="h-1.5" />
              </div>
            </div>
            
            {/* Issues Tab List */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="all" onClick={() => setSelectedCategory('all')}>All</TabsTrigger>
                <TabsTrigger value="security" onClick={() => setSelectedCategory('security')}>Security</TabsTrigger>
                <TabsTrigger value="diversification" onClick={() => setSelectedCategory('diversification')}>Diversity</TabsTrigger>
                <TabsTrigger value="activity" onClick={() => setSelectedCategory('activity')}>Activity</TabsTrigger>
                <TabsTrigger value="gasOptimization" onClick={() => setSelectedCategory('gasOptimization')}>Gas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                {issuesLoading ? (
                  <div className="text-center py-4">Loading issues...</div>
                ) : (
                  <>
                    {filteredIssues.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No issues found in this category
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {filteredIssues.map((issue) => (
                          <div 
                            key={issue.id} 
                            className="p-3 border rounded-lg flex items-start justify-between"
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center">
                                {categoryIcons[issue.category as keyof typeof categoryIcons]}
                                <span className={`text-xs px-2 py-0.5 rounded-full text-white ${severityColors[issue.severity as keyof typeof severityColors]} mr-2`}>
                                  {issue.severity}
                                </span>
                                <h4 className="font-medium">{issue.title}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">{issue.description}</p>
                              <p className="text-sm font-medium">Recommendation: {issue.recommendation}</p>
                            </div>
                            <Button 
                              variant={issue.resolved ? "outline" : "default"} 
                              size="sm"
                              className="ml-4 shrink-0"
                              onClick={() => markIssueResolved(issue.id)}
                              disabled={issue.resolved}
                            >
                              {issue.resolved ? (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-1" />
                              )}
                              {issue.resolved ? "Resolved" : "Resolve"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
              
              <TabsContent value="security" className="mt-0">
                {/* Content automatically filtered by selectedCategory */}
              </TabsContent>
              
              <TabsContent value="diversification" className="mt-0">
                {/* Content automatically filtered by selectedCategory */}
              </TabsContent>
              
              <TabsContent value="activity" className="mt-0">
                {/* Content automatically filtered by selectedCategory */}
              </TabsContent>
              
              <TabsContent value="gasOptimization" className="mt-0">
                {/* Content automatically filtered by selectedCategory */}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
      
      <CardFooter className="justify-between border-t pt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            if (selectedScore) {
              toast({
                title: "Scan initiated",
                description: "A new wallet health scan has been initiated. Results will be available shortly.",
              });
              
              // Invalidate the query to refresh the scores after a delay (simulating a scan)
              setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['/api/wallet-health/scores'] });
                queryClient.invalidateQueries({ queryKey: ['/api/wallet-health/issues', selectedScore.id] });
              }, 2000);
            }
          }}
        >
          Run New Scan
        </Button>
        <Button 
          size="sm" 
          onClick={() => {
            if (selectedScore) {
              // Navigate to a detailed report view (future enhancement)
              toast({
                title: "Detailed report",
                description: "Full report feature coming soon.",
              });
            }
          }}
        >
          View Full Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WalletHealthScore;