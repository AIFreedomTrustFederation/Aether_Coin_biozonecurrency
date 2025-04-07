import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress'; 
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ChevronRight, Loader2, Award, Star, Coins, BarChart3 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ContributionData {
  id: number;
  date: string;
  feedbackType: string;
  pointsAwarded: number;
  singTokensAwarded: number;
}

interface TrainingStats {
  totalContributions: number;
  totalPointsEarned: number;
  totalSingTokens: number;
  contributorTier: string;
  contributorRank: number | null;
  lastContribution: string | null;
  recentContributions: ContributionData[];
}

const getTierColor = (tier: string): string => {
  switch (tier.toLowerCase()) {
    case 'bronze':
      return 'bg-amber-700';
    case 'silver':
      return 'bg-gray-400';
    case 'gold':
      return 'bg-amber-400';
    case 'platinum':
      return 'bg-blue-300';
    default:
      return 'bg-gray-700';
  }
};

const getFeedbackTypeLabel = (type: string): string => {
  switch (type) {
    case 'helpful':
      return 'Helpful';
    case 'not_helpful':
      return 'Not Helpful';
    case 'incorrect':
      return 'Incorrect';
    case 'offensive':
      return 'Offensive';
    case 'other':
      return 'Other';
    default:
      return type;
  }
};

const AITrainingStats: React.FC = () => {
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai-training/stats');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch training stats: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.stats) {
        setStats(data.stats);
      } else {
        throw new Error(data.error || 'Failed to load training statistics');
      }
    } catch (err) {
      console.error('Error fetching training stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast({
        title: 'Failed to load stats',
        description: 'Your training statistics could not be loaded',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Helper to calculate tier progress
  const calculateTierProgress = (): number => {
    if (!stats) return 0;
    
    const tierThresholds = {
      bronze: { min: 0, max: 100 },
      silver: { min: 100, max: 500 },
      gold: { min: 500, max: 2000 },
      platinum: { min: 2000, max: 5000 }
    };
    
    const currentTier = stats.contributorTier.toLowerCase() as keyof typeof tierThresholds;
    const { min, max } = tierThresholds[currentTier];
    
    // Calculate progress within current tier
    const pointsInTier = stats.totalPointsEarned - min;
    const tierRange = max - min;
    
    return Math.min(Math.floor((pointsInTier / tierRange) * 100), 100);
  };

  // Progress to next tier
  const getNextTier = (): string => {
    if (!stats) return '';
    
    const currentTier = stats.contributorTier.toLowerCase();
    if (currentTier === 'bronze') return 'Silver';
    if (currentTier === 'silver') return 'Gold';
    if (currentTier === 'gold') return 'Platinum';
    return 'Max Tier';
  };

  // Points needed for next tier
  const getPointsNeededForNextTier = (): number => {
    if (!stats) return 0;
    
    const tierThresholds = {
      bronze: 100,
      silver: 500,
      gold: 2000,
      platinum: 0 // Already at max
    };
    
    const currentTier = stats.contributorTier.toLowerCase() as keyof typeof tierThresholds;
    const threshold = tierThresholds[currentTier];
    
    if (threshold === 0) return 0; // Already at max tier
    return Math.max(0, threshold - stats.totalPointsEarned);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Training Contributions</CardTitle>
          <CardDescription>Loading your training statistics...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Training Contributions</CardTitle>
          <CardDescription>There was a problem loading your data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            onClick={fetchStats} 
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalContributions === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Training Contributions</CardTitle>
          <CardDescription>You haven't made any contributions yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Start training Mysterion AI by providing feedback on responses. You'll earn SING tokens for your contributions!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2" />
          AI Training Contributions
        </CardTitle>
        <CardDescription>
          Your Mysterion AI training statistics and rewards
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Contributor tier */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Badge className={`${getTierColor(stats.contributorTier)} mr-2`}>
                {stats.contributorTier.toUpperCase()}
              </Badge>
              <span className="text-sm font-medium">
                {stats.contributorRank && `Rank #${stats.contributorRank}`}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {getPointsNeededForNextTier() > 0 
                ? `${getPointsNeededForNextTier()} points to ${getNextTier()}`
                : 'Max tier reached!'}
            </span>
          </div>
          
          <Progress 
            value={calculateTierProgress()} 
            className="h-2"
          />
        </div>
        
        {/* Statistics overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-3 bg-card border rounded-lg">
            <div className="flex items-center text-primary mb-1">
              <BarChart3 className="h-4 w-4 mr-1" />
              <span className="text-xs">TOTAL</span>
            </div>
            <span className="text-2xl font-bold">{stats.totalContributions}</span>
            <span className="text-xs text-muted-foreground">Contributions</span>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-card border rounded-lg">
            <div className="flex items-center text-primary mb-1">
              <Star className="h-4 w-4 mr-1" />
              <span className="text-xs">EARNED</span>
            </div>
            <span className="text-2xl font-bold">{stats.totalPointsEarned}</span>
            <span className="text-xs text-muted-foreground">Points</span>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-card border rounded-lg">
            <div className="flex items-center text-primary mb-1">
              <Coins className="h-4 w-4 mr-1" />
              <span className="text-xs">TOTAL</span>
            </div>
            <span className="text-2xl font-bold">{stats.totalSingTokens}</span>
            <span className="text-xs text-muted-foreground">SING Tokens</span>
          </div>
        </div>
        
        {/* Recent contributions */}
        {stats.recentContributions.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Recent Contributions</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>SING</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentContributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell className="text-xs">
                      {contribution.date
                        ? formatDistanceToNow(new Date(contribution.date), { addSuffix: true })
                        : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getFeedbackTypeLabel(contribution.feedbackType)}
                      </Badge>
                    </TableCell>
                    <TableCell>{contribution.pointsAwarded}</TableCell>
                    <TableCell>{contribution.singTokensAwarded}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" size="sm" className="ml-auto">
          View Leaderboard
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AITrainingStats;