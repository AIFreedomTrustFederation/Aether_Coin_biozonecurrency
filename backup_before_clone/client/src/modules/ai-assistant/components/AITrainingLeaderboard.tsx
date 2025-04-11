import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Medal, Trophy, RefreshCcw } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  tier: string;
  totalPoints: number;
  totalSingTokens: number;
  totalContributions: number;
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

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-medium">{rank}</span>;
};

const AITrainingLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Default limit is 10, can be customized
      const response = await fetch('/api/ai-training/leaderboard?limit=20');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.leaderboard) {
        setLeaderboard(data.leaderboard);
      } else {
        throw new Error(data.error || 'Failed to load leaderboard data');
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      toast({
        title: 'Failed to load leaderboard',
        description: 'The leaderboard could not be loaded',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Training Leaderboard</CardTitle>
          <CardDescription>Loading leaderboard data...</CardDescription>
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
          <CardTitle>AI Training Leaderboard</CardTitle>
          <CardDescription>There was a problem loading the leaderboard</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            onClick={fetchLeaderboard} 
            className="mt-4"
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>AI Training Leaderboard</CardTitle>
          <CardDescription>No contributors found yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Be the first to contribute to Mysterion AI training and earn SING tokens!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Top AI Training Contributors</CardTitle>
          <CardDescription>
            Users who've contributed the most to Mysterion AI training
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchLeaderboard}>
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">SING</TableHead>
              <TableHead className="text-right">Contributions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry) => (
              <TableRow key={entry.userId} className={entry.rank <= 3 ? 'bg-muted/30' : ''}>
                <TableCell className="flex justify-center">
                  {getRankIcon(entry.rank)}
                </TableCell>
                <TableCell className="font-medium">{entry.username}</TableCell>
                <TableCell>
                  <Badge className={getTierColor(entry.tier)}>
                    {entry.tier.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{entry.totalPoints.toLocaleString()}</TableCell>
                <TableCell className="text-right">{entry.totalSingTokens.toLocaleString()}</TableCell>
                <TableCell className="text-right">{entry.totalContributions.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AITrainingLeaderboard;