import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import TrustMemberGuard from '@/components/auth/TrustMemberGuard';
import { format } from 'date-fns';
import { 
  Layers, 
  Settings, 
  Users, 
  FileText, 
  Shield, 
  LogOut, 
  BarChart3,
  Database,
  AlertCircle,
  Clock,
  UserCheck
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Mock trust activity data for demonstration purposes
const trustActivities = [
  { 
    id: 1, 
    type: 'validation', 
    description: 'Validated quantum transaction buffer', 
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago 
    status: 'completed'
  },
  { 
    id: 2, 
    type: 'governance', 
    description: 'Voted on protocol update FRC-291', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    status: 'completed'
  },
  { 
    id: 3, 
    type: 'security', 
    description: 'Reviewed access patterns for neural bridge', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    status: 'completed'
  },
  { 
    id: 4, 
    type: 'governance', 
    description: 'Monthly resource allocation audit', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    status: 'pending'
  },
];

// Component to display user trust information
const TrustInfoCard = () => {
  const { user } = useAuth();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Trust Status</CardTitle>
        <CardDescription>Your membership information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <Avatar className="h-20 w-20 border-2 border-primary">
            <AvatarFallback className="text-xl bg-primary/10 text-primary">
              {user?.username?.substring(0, 2).toUpperCase() || 'TM'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">{user?.username}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center mt-1">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {user?.trustMemberLevel || 'Member'}
              </Badge>
            </div>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">
              {user?.trustMemberSince && user.trustMemberSince !== null ? format(new Date(user.trustMemberSince), 'PPP') : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last login</span>
            <span className="font-medium">
              {user?.lastLogin && user.lastLogin !== null ? format(new Date(user.lastLogin), 'PPP HH:mm') : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium flex items-center">
              <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Active
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Activity feed component
const ActivityFeed = () => {
  return (
    <div className="space-y-4">
      {trustActivities.map(activity => (
        <Card key={activity.id} className="overflow-hidden">
          <div className="flex">
            <div className={`w-2 ${
              activity.type === 'validation' ? 'bg-blue-500' : 
              activity.type === 'governance' ? 'bg-purple-500' : 
              'bg-yellow-500'
            }`}></div>
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{activity.description}</h4>
                  <p className="text-sm text-muted-foreground">
                    {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} activity
                  </p>
                </div>
                <Badge variant={activity.status === 'completed' ? 'outline' : 'secondary'}>
                  {activity.status}
                </Badge>
              </div>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {format(activity.timestamp, 'PPP p')}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Main portal component
const TrustPortal = () => {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/trust/login');
    setIsLoggingOut(false);
  };

  return (
    <TrustMemberGuard>
      <div className="min-h-screen bg-muted/10">
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <header className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold">AI Freedom Trust Portal</h1>
                <p className="text-muted-foreground">Secure access for trust governance and operations</p>
              </div>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Sign Out'}
              </Button>
            </div>
            <div className="bg-primary/5 rounded-lg p-4 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-primary" />
              <p>
                Welcome back, <span className="font-medium">{user?.username}</span>. 
                You're authenticated with {user?.trustMemberLevel || 'Member'} privileges.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-6">
              <TrustInfoCard />
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Protocols
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    View Trust Documents
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="h-4 w-4 mr-2" />
                    Quantum Data Vault
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-8">
              <Tabs defaultValue="activity" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="activity" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Recent Activity
                  </TabsTrigger>
                  <TabsTrigger value="governance" className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Governance
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="activity" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Activity Feed</CardTitle>
                      <CardDescription>
                        Your recent trust-related activities
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ActivityFeed />
                    </CardContent>
                    <CardFooter className="border-t bg-muted/5 px-6 py-3">
                      <Button variant="link" className="ml-auto">View All Activities</Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
                
                <TabsContent value="governance" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Trust Governance</CardTitle>
                      <CardDescription>
                        Participate in trust decision-making and protocol management
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
                        <div className="text-center">
                          <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">Trust Governance Module</h3>
                          <p className="text-muted-foreground mb-4">
                            Access to advanced governance features requires additional authorization.
                          </p>
                          <Button variant="outline">Request Access</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="analytics" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Trust Analytics</CardTitle>
                      <CardDescription>
                        Insights and metrics on trust operations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
                        <div className="text-center">
                          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                          <p className="text-muted-foreground mb-4">
                            The analytics module is currently under development.
                          </p>
                          <Badge variant="outline">Coming Soon</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </TrustMemberGuard>
  );
};

export default TrustPortal;