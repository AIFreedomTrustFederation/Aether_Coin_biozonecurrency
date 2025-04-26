import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, BarChart3, Target, ArrowRight, Zap, BookOpen, FileText, Coffee, Brain } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import ActivityForm from '@/components/productivity/ActivityForm';
import TimeBlockScheduler from '@/components/productivity/TimeBlockScheduler';
import ProductivityInsights from '@/components/productivity/ProductivityInsights';
import DeveloperGoalTracker from '@/components/productivity/DeveloperGoalTracker';

const ProductivityDashboardDetailed: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('schedule');
  
  // Fetch user's productivity metrics
  const { data: productivityData, isLoading: productivityLoading } = useQuery({
    queryKey: ['/api/productivity/metrics'],
    retry: false,
    enabled: true
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Developer Productivity Dashboard</h1>
            <p className="text-muted-foreground">Track, analyze, and optimize your development workflow</p>
          </div>
          <div className="flex mt-4 md:mt-0">
            <Button variant="outline" className="mr-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">View Calendar</span>
            </Button>
            <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
              <Zap className="h-4 w-4" />
              <span>Optimize Workflow</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Coding Hours" 
            value={productivityLoading ? null : "28.5"}
            change="+12.3%"
            trend="up"
            icon={<Clock className="h-5 w-5 text-blue-500" />}
          />
          <StatCard 
            title="Tasks Completed" 
            value={productivityLoading ? null : "17"}
            change="+5"
            trend="up"
            icon={<FileText className="h-5 w-5 text-green-500" />}
          />
          <StatCard 
            title="Focus Score" 
            value={productivityLoading ? null : "8.4"}
            change="-0.2"
            trend="down"
            icon={<Target className="h-5 w-5 text-red-500" />}
          />
          <StatCard 
            title="Learning Hours" 
            value={productivityLoading ? null : "4.5"}
            change="+1.5"
            trend="up"
            icon={<BookOpen className="h-5 w-5 text-purple-500" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="schedule" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Schedule</span>
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Activity</span>
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Insights</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="schedule" className="space-y-4">
                <TimeBlockScheduler />
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <ActivityForm />
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <ProductivityInsights />
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Developer Goals
                </CardTitle>
                <CardDescription>
                  Track your progress towards development goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeveloperGoalTracker />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Productivity Tips
                </CardTitle>
                <CardDescription>
                  Personalized suggestions to boost your productivity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="bg-blue-100 dark:bg-blue-900 p-1.5 rounded-full mt-0.5">
                      <Coffee className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <h4 className="font-medium">Optimize break patterns</h4>
                      <p className="text-sm text-muted-foreground">
                        Your focus peaks after 25 minutes. Try using the Pomodoro technique.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="bg-green-100 dark:bg-green-900 p-1.5 rounded-full mt-0.5">
                      <FileText className="h-4 w-4 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                      <h4 className="font-medium">Document more frequently</h4>
                      <p className="text-sm text-muted-foreground">
                        Adding documentation during development reduces long-term technical debt.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button variant="link" className="w-full flex items-center justify-center gap-1 mt-2">
                  <span>View all recommendations</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | null;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon }) => {
  const trendColor = 
    trend === 'up' ? 'text-green-500' : 
    trend === 'down' ? 'text-red-500' : 
    'text-gray-500';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {value ? (
          <div className="text-2xl font-bold">{value}</div>
        ) : (
          <Skeleton className="h-8 w-20" />
        )}
        <p className={`text-xs ${trendColor} flex items-center mt-1`}>
          {change}
          {trend === 'up' && <span className="ml-1">↑</span>}
          {trend === 'down' && <span className="ml-1">↓</span>}
        </p>
      </CardContent>
    </Card>
  );
};

export default ProductivityDashboardDetailed;