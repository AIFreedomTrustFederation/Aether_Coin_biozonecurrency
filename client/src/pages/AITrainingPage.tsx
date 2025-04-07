import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AITrainingStats, AITrainingLeaderboard } from '../modules/ai-assistant/components';
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';
import { ChevronRight, Award, BarChart, Coins, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const AITrainingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div className="container mx-auto p-4 py-8 space-y-8 max-w-7xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          AI Training & SING Tokens
        </h1>
        <p className="text-muted-foreground">
          Contribute to Mysterion AI training and earn SING tokens for your feedback
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Earn SING Tokens
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SING Rewards</div>
            <p className="text-xs text-muted-foreground">
              Earn tokens by providing quality training feedback 
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" asChild>
              <Link to="/mysterion">
                Start Training
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contributor Tiers
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">Bronze → Platinum</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Earn more SING tokens as your tier increases
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('stats')}>
              View Your Tier
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Leaderboard
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">Top Contributors</span>
            </div>
            <p className="text-xs text-muted-foreground">
              See where you rank among all contributors
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" onClick={() => setActiveTab('leaderboard')}>
              View Leaderboard
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Main content with tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" /> Your Stats
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Leaderboard
          </TabsTrigger>
        </TabsList>
        <TabsContent value="stats" className="mt-6">
          <AITrainingStats />
        </TabsContent>
        <TabsContent value="leaderboard" className="mt-6">
          <AITrainingLeaderboard />
        </TabsContent>
      </Tabs>

      {/* How it works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            How Mysterion AI Training Works
          </CardTitle>
          <CardDescription>
            Train our AI and earn rewards with your feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4 space-y-2">
              <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mb-2">
                <span className="font-bold">1</span>
              </div>
              <h3 className="font-medium">Provide Feedback</h3>
              <p className="text-sm text-muted-foreground">
                After receiving a response from Mysterion, rate how helpful it was and provide details on how it could be improved.
              </p>
            </div>
            
            <div className="border rounded-lg p-4 space-y-2">
              <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mb-2">
                <span className="font-bold">2</span>
              </div>
              <h3 className="font-medium">Earn Points & Tokens</h3>
              <p className="text-sm text-muted-foreground">
                Quality feedback earns you points that are converted to SING tokens based on your contributor tier.
              </p>
            </div>
            
            <div className="border rounded-lg p-4 space-y-2">
              <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mb-2">
                <span className="font-bold">3</span>
              </div>
              <h3 className="font-medium">Increase Your Tier</h3>
              <p className="text-sm text-muted-foreground">
                As you contribute more, you'll progress through tiers from Bronze to Platinum, earning more SING tokens per contribution.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link to="/mysterion">
              Start Training Mysterion
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AITrainingPage;