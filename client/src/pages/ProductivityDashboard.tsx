import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  getActivitySummary, 
  getProductivityMetrics, 
  getDeveloperGoals, 
  getProductivityInsights,
  ActivitySummary,
  calculateProductivityScore
} from '@/services/productivity/productivityService';
import { ProductivityMetric } from '@/shared/schema';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, ResponsiveContainer, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { 
  Calendar, Clock, Code, GitMerge, FileText, CheckCircle, AlertCircle, 
  LineChart as LineChartIcon, BarChart2, PieChart as PieChartIcon, Activity,
  Target, BookOpen, Zap, Coffee, Award, TrendingUp, Grid
} from 'lucide-react';

// Color scheme
const COLORS = {
  primary: '#3050C0',
  secondary: '#5376e3',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#38bdf8',
  background: '#f8fafc',
  text: '#334155',
  // For charts
  coding: '#3050C0',
  review: '#f59e0b',
  testing: '#22c55e',
  documentation: '#38bdf8',
  planning: '#a855f7',
  meeting: '#ef4444'
};

// Helper to format time (minutes to hours and minutes)
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const ProductivityDashboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('week');
  const [selectedMetricIndex, setSelectedMetricIndex] = useState(0);

  // Get days for timeframe
  const getDays = (): number => {
    switch (timeframe) {
      case 'today': return 1;
      case 'week': return 7;
      case 'month': return 30;
      default: return 7;
    }
  };

  // Queries
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['/api/productivity/summary', timeframe],
    queryFn: () => getActivitySummary(getDays())
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/productivity/metrics', timeframe],
    queryFn: () => getProductivityMetrics(getDays())
  });

  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['/api/productivity/goals'],
    queryFn: () => getDeveloperGoals()
  });

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/productivity/insights'],
    queryFn: () => getProductivityInsights(5)
  });

  // Get latest metric for today's score
  const latestMetric = metrics && metrics.length > 0 ? metrics[0] : null;
  const productivityScore = latestMetric ? calculateProductivityScore(latestMetric) : 0;

  // Calculate score class based on productivity score
  const getScoreClass = (score: number): string => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Prepare data for activity type distribution chart
  const getActivityDistributionData = (summary?: ActivitySummary) => {
    if (!summary || !summary.activityTypes) return [];
    
    return Object.entries(summary.activityTypes).map(([name, value]) => ({
      name,
      value
    }));
  };

  // Prepare data for focus trend chart
  const getFocusTrendData = (metricData?: ProductivityMetric[]) => {
    if (!metricData) return [];
    
    return metricData.map(m => ({
      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      focus: m.focusScore || 0,
      efficiency: m.efficiencyRating || 0,
      quality: m.qualityScore || 0
    })).reverse(); // Show oldest to newest
  };

  // Loading states
  if (summaryLoading || metricsLoading || goalsLoading || insightsLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LineChartIcon className="h-16 w-16 mx-auto mb-4 text-primary animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Loading your productivity data...</h2>
            <p className="text-muted-foreground">Please wait while we analyze your development patterns</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Developer Productivity Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track, analyze, and optimize your development productivity
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
              <TabsList>
                <TabsTrigger value="today" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Today
                </TabsTrigger>
                <TabsTrigger value="week" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  This Week
                </TabsTrigger>
                <TabsTrigger value="month" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  This Month
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Log Activity
            </Button>
          </div>
        </div>
        
        {/* Productivity Score Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Productivity Score</CardTitle>
              <CardDescription>Your overall performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <div className={`text-6xl font-bold ${getScoreClass(productivityScore)}`}>
                  {productivityScore}
                </div>
                <Progress 
                  value={productivityScore} 
                  max={100} 
                  className="h-2 mt-3 w-full"
                />
                <div className="flex justify-between w-full mt-1 text-xs text-muted-foreground">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
                <div className="mt-4 text-center">
                  <Badge variant={productivityScore >= 70 ? "default" : "outline"} className="mb-2">
                    {productivityScore >= 85 ? 'Exceptional' : 
                     productivityScore >= 70 ? 'Productive' :
                     productivityScore >= 50 ? 'Average' : 'Needs Improvement'}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {productivityScore >= 85 ? 'You\'re performing exceptionally well!' : 
                     productivityScore >= 70 ? 'Great work! Keep it up.' :
                     productivityScore >= 50 ? 'You\'re doing okay. Room for improvement.' : 
                     'Let\'s find ways to boost your productivity.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Activity Summary */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Activity Summary</CardTitle>
              <CardDescription>Key metrics for {timeframe === 'today' ? 'today' : `the past ${getDays()} days`}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Time Spent</span>
                  </div>
                  <span className="text-2xl font-bold">{formatTime(summary?.totalTimeSpent || 0)}</span>
                  <span className="text-xs text-muted-foreground mt-1">Total development time</span>
                </div>
                
                <div className="flex flex-col p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Code className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Code Lines</span>
                  </div>
                  <span className="text-2xl font-bold">{summary?.totalCodeLines || 0}</span>
                  <span className="text-xs text-muted-foreground mt-1">Lines written or modified</span>
                </div>
                
                <div className="flex flex-col p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Tasks</span>
                  </div>
                  <span className="text-2xl font-bold">{summary?.taskCount || 0}</span>
                  <span className="text-xs text-muted-foreground mt-1">Activities completed</span>
                </div>
                
                <div className="flex flex-col p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <GitMerge className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Complexity</span>
                  </div>
                  <span className="text-2xl font-bold">{summary?.avgComplexity.toFixed(1) || 0}</span>
                  <span className="text-xs text-muted-foreground mt-1">Average code complexity</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Focus Trend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance Trends
              </CardTitle>
              <CardDescription>
                Focus, efficiency, and quality metrics over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getFocusTrendData(metrics)} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="focus" stroke={COLORS.primary} name="Focus Score" />
                  <Line type="monotone" dataKey="efficiency" stroke={COLORS.success} name="Efficiency" />
                  <Line type="monotone" dataKey="quality" stroke={COLORS.info} name="Quality" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Activity Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                Activity Distribution
              </CardTitle>
              <CardDescription>
                Breakdown of your development activities
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getActivityDistributionData(summary)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {getActivityDistributionData(summary).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.primary} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} activities`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        {/* Goals and Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Goals */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-4 w-4" />
                Development Goals
              </CardTitle>
              <CardDescription>
                Track your progress on personal goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals && goals.map((goal) => (
                  <div key={goal.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{goal.title}</h4>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                      <Badge variant={goal.status === 'active' ? 'default' : 'outline'}>
                        {goal.status}
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between mb-1 text-sm">
                        <span>{goal.currentValue.toFixed(0)} / {goal.targetValue.toFixed(0)}</span>
                        <span>{Math.round((goal.currentValue / goal.targetValue) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(goal.currentValue / goal.targetValue) * 100} 
                        max={100} 
                        className="h-2"
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Started: {new Date(goal.startDate).toLocaleDateString()}</span>
                      {goal.endDate && (
                        <span>Due: {new Date(goal.endDate).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Target className="h-4 w-4 mr-2" />
                Create New Goal
              </Button>
            </CardFooter>
          </Card>
          
          {/* Insights */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Productivity Insights
              </CardTitle>
              <CardDescription>
                AI-powered recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights && insights.map((insight) => (
                  <div 
                    key={insight.id} 
                    className={`p-3 border rounded-lg ${!insight.isRead ? 'bg-primary/5 border-primary/20' : ''}`}
                  >
                    <div className="flex gap-2 items-start">
                      {insight.insightType === 'pattern' && <Activity className="h-4 w-4 text-blue-500 mt-1" />}
                      {insight.insightType === 'suggestion' && <BookOpen className="h-4 w-4 text-green-500 mt-1" />}
                      {insight.insightType === 'achievement' && <Award className="h-4 w-4 text-amber-500 mt-1" />}
                      {insight.insightType === 'warning' && <AlertCircle className="h-4 w-4 text-red-500 mt-1" />}
                      <div>
                        <h4 className={`font-medium text-sm ${!insight.isRead ? 'text-primary' : ''}`}>
                          {insight.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Grid className="h-4 w-4 mr-2" />
                View All Insights
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductivityDashboard;