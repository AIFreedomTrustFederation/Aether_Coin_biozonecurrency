import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  PieChart, 
  Activity, 
  LineChart, 
  Clock, 
  Calendar, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Info
} from 'lucide-react';

const ProductivityInsights: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [chartType, setChartType] = useState('activities');
  
  // Fetch productivity insights
  const { data: insights, isLoading } = useQuery({
    queryKey: ['/api/productivity/insights', timeRange],
    retry: false,
    enabled: true,
  });

  // Sample data if insights aren't loaded yet
  const sampleInsights = {
    timeSpent: {
      coding: 28.5,
      learning: 7.5,
      planning: 5.0,
      meeting: 6.5,
      review: 4.0,
      other: 2.5
    },
    focusMetrics: {
      averageFocusTime: 52,
      deepWorkSessions: 12,
      interruptions: 24,
      timeOfDayProductivity: [
        { hour: '9-10', score: 75 },
        { hour: '10-11', score: 85 },
        { hour: '11-12', score: 70 },
        { hour: '13-14', score: 60 },
        { hour: '14-15', score: 80 },
        { hour: '15-16', score: 90 },
        { hour: '16-17', score: 75 },
        { hour: '17-18', score: 65 }
      ]
    },
    performance: {
      tasksCompleted: 27,
      productivity: [
        { day: 'Mon', score: 68 },
        { day: 'Tue', score: 78 },
        { day: 'Wed', score: 82 },
        { day: 'Thu', score: 75 },
        { day: 'Fri', score: 85 },
        { day: 'Sat', score: 72 },
        { day: 'Sun', score: 60 }
      ],
      efficiency: 78,
      changeFromPrevious: 12,
    },
    recommendations: [
      {
        id: 1,
        title: 'Schedule deep work sessions',
        description: 'Your most productive hours are 10-11 AM and 2-4 PM. Consider scheduling focused work during these times.',
        impact: 'high'
      },
      {
        id: 2,
        title: 'Take more strategic breaks',
        description: 'Short breaks every 50 minutes improve overall productivity. You currently average 90 minutes between breaks.',
        impact: 'medium'
      },
      {
        id: 3,
        title: 'Reduce context switching',
        description: 'You switch between different tasks approximately 14 times per day. Try batching similar tasks.',
        impact: 'high'
      }
    ]
  };

  // Use loaded insights or sample data
  const displayInsights = (insights as typeof sampleInsights) || sampleInsights;
  
  // Calculate total time spent
  const totalTimeSpent = Object.values(displayInsights.timeSpent).reduce((sum, time) => sum + time, 0);

  // Helper to format time display
  const formatTime = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    if (wholeHours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${wholeHours}h`;
    } else {
      return `${wholeHours}h ${minutes}m`;
    }
  };

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Productivity Insights</h2>
          <p className="text-muted-foreground">
            Gain insights into your development productivity patterns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select 
            value={timeRange} 
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
              <SelectItem value="quarter">This quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Time Tracked
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalTimeSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {displayInsights.performance.changeFromPrevious > 0 ? (
                <span className="text-green-500 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {displayInsights.performance.changeFromPrevious}% vs. previous {timeRange}
                </span>
              ) : (
                <span className="text-red-500 flex items-center">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  {Math.abs(displayInsights.performance.changeFromPrevious)}% vs. previous {timeRange}
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Focus Score
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayInsights.performance.efficiency}/100</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2">
              <div 
                className="bg-green-500 h-1.5 rounded-full" 
                style={{ width: `${displayInsights.performance.efficiency}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasks Completed
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayInsights.performance.tasksCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg. {(displayInsights.performance.tasksCompleted / (timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30)).toFixed(1)} per day
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Activity</span>
          </TabsTrigger>
          <TabsTrigger value="focus" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>Focus</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>Recommendations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Distribution</CardTitle>
              <CardDescription>
                Breakdown of how your development time is spent
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px] flex items-center justify-center">
                <div className="max-w-md mx-auto w-full">
                  {Object.entries(displayInsights.timeSpent).map(([category, hours], index) => {
                    const percentage = (hours / totalTimeSpent) * 100;
                    let color;
                    
                    switch(category) {
                      case 'coding':
                        color = 'bg-blue-500';
                        break;
                      case 'learning':
                        color = 'bg-purple-500';
                        break;
                      case 'planning':
                        color = 'bg-green-500';
                        break;
                      case 'meeting':
                        color = 'bg-yellow-500';
                        break;
                      case 'review':
                        color = 'bg-red-500';
                        break;
                      default:
                        color = 'bg-gray-500';
                    }
                    
                    return (
                      <div key={category} className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{category}</span>
                          <span className="text-sm font-medium">{percentage.toFixed(1)}% ({formatTime(hours)})</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full">
                          <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="focus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Focus Metrics</CardTitle>
              <CardDescription>
                Understand your focus patterns throughout the day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-medium mb-3">Productivity by Time of Day</h4>
                  <div className="h-[200px] flex items-end justify-between gap-2">
                    {displayInsights.focusMetrics.timeOfDayProductivity.map((hour, i) => (
                      <div key={i} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-blue-500 dark:bg-blue-600 rounded-t"
                          style={{ height: `${hour.score * 1.6}px` }}
                        ></div>
                        <span className="text-xs mt-2">{hour.hour}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Average Focus Session</h4>
                    <div className="text-2xl font-bold">{displayInsights.focusMetrics.averageFocusTime} min</div>
                    <p className="text-xs text-muted-foreground">Optimal: 50-90 minutes</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Deep Work Sessions</h4>
                    <div className="text-2xl font-bold">{displayInsights.focusMetrics.deepWorkSessions}</div>
                    <p className="text-xs text-muted-foreground">Sessions {`>`} 45 minutes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productivity Recommendations</CardTitle>
              <CardDescription>
                Personalized suggestions to improve your development workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayInsights.recommendations.map((rec, index) => (
                  <div key={rec.id} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${getImpactColor(rec.impact)} bg-opacity-10 mt-0.5`}>
                        <Info className={`h-4 w-4 ${getImpactColor(rec.impact)}`} />
                      </div>
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {rec.title}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getImpactColor(rec.impact)} bg-opacity-10 ${getImpactColor(rec.impact)}`}>
                            {rec.impact} impact
                          </span>
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Recommendations
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductivityInsights;