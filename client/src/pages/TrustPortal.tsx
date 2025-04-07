import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import TrustMemberGuard from '../components/auth/TrustMemberGuard';
import { useLocation } from 'wouter';

import { 
  Shield, 
  UserCircle2, 
  FileText, 
  Settings, 
  LogOut, 
  Clock, 
  Zap,
  BarChart3,
  ArrowRight,
  Users,
  CheckCircle,
  BadgeCheck,
  Bell
} from 'lucide-react';

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

const TrustPortal: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [, setLocation] = useLocation();

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Format date to readable string
  const formatDate = (date: Date | undefined | string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Mock data for recent trust activities
  const recentActivities = [
    { 
      id: 1, 
      type: 'Proposal Vote', 
      description: 'Voted on AI Safety Proposal #28', 
      date: new Date(2025, 3, 4), 
      status: 'Approved'
    },
    { 
      id: 2, 
      type: 'Verification', 
      description: 'Verified new member certification', 
      date: new Date(2025, 3, 2), 
      status: 'Completed'
    },
    { 
      id: 3, 
      type: 'Document Review', 
      description: 'Reviewed AI Ethics Guidelines v3.2', 
      date: new Date(2025, 3, 1), 
      status: 'Completed'
    },
    { 
      id: 4, 
      type: 'Contribution', 
      description: 'Contributed to Governance Framework', 
      date: new Date(2025, 2, 28), 
      status: 'Published'
    },
  ];

  // Mock data for upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: 'Quarterly Trust Member Meeting',
      date: new Date(2025, 3, 15),
      time: '10:00 AM PST',
      location: 'Virtual',
      required: true,
    },
    {
      id: 2,
      title: 'AI Safety Working Group',
      date: new Date(2025, 3, 18),
      time: '2:00 PM PST',
      location: 'Virtual',
      required: false,
    },
    {
      id: 3,
      title: 'Trust Governance Review',
      date: new Date(2025, 3, 25),
      time: '1:00 PM PST',
      location: 'Virtual',
      required: true,
    },
  ];

  // Mock data for trust documents
  const trustDocuments = [
    {
      id: 1,
      title: 'AI Freedom Trust Charter',
      type: 'Governance',
      lastUpdated: new Date(2025, 1, 15),
      version: '2.3',
    },
    {
      id: 2,
      title: 'Member Responsibilities',
      type: 'Policy',
      lastUpdated: new Date(2025, 2, 10),
      version: '1.7',
    },
    {
      id: 3,
      title: 'AI Safety Guidelines',
      type: 'Technical',
      lastUpdated: new Date(2025, 3, 1),
      version: '3.2',
    },
    {
      id: 4,
      title: 'Ethical Framework for AI Development',
      type: 'Ethics',
      lastUpdated: new Date(2025, 2, 22),
      version: '2.1',
    },
    {
      id: 5,
      title: 'Trust Member Onboarding Guide',
      type: 'Process',
      lastUpdated: new Date(2025, 2, 5),
      version: '1.4',
    },
  ];

  // Return the protected portal content wrapped in TrustMemberGuard
  return (
    <TrustMemberGuard>
      <div className="container mx-auto p-4 py-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Trust Member Portal
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.username} | Trust Member since {formatDate(user?.trustMemberSince)}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left sidebar with member info */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Member Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <UserCircle2 className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="font-medium text-lg">{user?.username}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                    <span>{user?.trustMemberLevel || 'Full Member'}</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Member Since</span>
                    <span className="font-medium">{formatDate(user?.trustMemberSince)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium">{user?.role}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Status</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-1">
                <Button variant="outline" className="w-full text-sm" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Profile
                </Button>
              </CardFooter>
            </Card>

            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <nav className="space-y-1">
                  {[
                    { name: 'Trust Documentation', icon: <FileText className="h-4 w-4" /> },
                    { name: 'Voting Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
                    { name: 'AI Safety Working Group', icon: <Shield className="h-4 w-4" /> },
                    { name: 'Member Directory', icon: <Users className="h-4 w-4" /> },
                    { name: 'Announcements', icon: <Bell className="h-4 w-4" /> },
                  ].map((item, index) => (
                    <Button 
                      key={index} 
                      variant="ghost" 
                      className="w-full justify-start text-sm h-9" 
                      size="sm"
                    >
                      {item.icon}
                      <span className="ml-2">{item.name}</span>
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main content area with tabs */}
          <div className="md:col-span-3">
            <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="dashboard" className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  <span>Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Activity</span>
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>Documents</span>
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard">
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Your Trust Status</CardTitle>
                      <CardDescription>Current member standing and participation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Participation Score</span>
                            <span className="text-sm text-muted-foreground">92%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Based on meeting attendance and contributions</p>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Voting Activity</span>
                            <span className="text-sm text-muted-foreground">87%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Based on governance proposal voting participation</p>
                        </div>

                        <div className="pt-2">
                          <h4 className="font-medium text-sm mb-2">Current Responsibilities</h4>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm">Technical Committee Member</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm">AI Safety Documentation Reviewer</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-sm">New Member Verification Panel</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl">Upcoming Events</CardTitle>
                      <CardDescription>Trust meetings and responsibilities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {upcomingEvents.map((event) => (
                          <div key={event.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                            <div className="bg-primary/10 text-primary rounded p-2 shrink-0">
                              <Clock className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">{event.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(event.date)} | {event.time}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <span className={`text-xs px-1.5 py-0.5 rounded-sm font-medium ${
                                  event.required 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {event.required ? 'Required' : 'Optional'}
                                </span>
                                <span className="text-xs text-muted-foreground">{event.location}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full text-sm" size="sm">
                        View Full Calendar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-xl">Recent Trust Activity</CardTitle>
                      <CardDescription>Your recent actions and contributions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivities.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                            <div className="bg-primary/10 text-primary rounded p-2 shrink-0">
                              {activity.type === 'Proposal Vote' && <BarChart3 className="h-5 w-5" />}
                              {activity.type === 'Verification' && <CheckCircle className="h-5 w-5" />}
                              {activity.type === 'Document Review' && <FileText className="h-5 w-5" />}
                              {activity.type === 'Contribution' && <Zap className="h-5 w-5" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{activity.type}</h4>
                                <span className="text-sm text-muted-foreground">
                                  {formatDate(activity.date)}
                                </span>
                              </div>
                              <p className="text-sm">{activity.description}</p>
                              <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-sm inline-block mt-1">
                                {activity.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full text-sm" size="sm">
                        View All Activity
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Trust Member Activity</CardTitle>
                    <CardDescription>
                      Comprehensive view of your contributions and participation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableCaption>A list of your recent trust activity.</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentActivities.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell className="font-medium">{activity.type}</TableCell>
                            <TableCell>{activity.description}</TableCell>
                            <TableCell>{formatDate(activity.date)}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                {activity.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Add more mock data to fill out the table */}
                        <TableRow>
                          <TableCell className="font-medium">Meeting</TableCell>
                          <TableCell>Attended monthly trust member meeting</TableCell>
                          <TableCell>{formatDate(new Date(2025, 2, 25))}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Attended
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Training</TableCell>
                          <TableCell>Completed AI safety certification</TableCell>
                          <TableCell>{formatDate(new Date(2025, 2, 20))}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Proposal</TableCell>
                          <TableCell>Submitted enhancement to governance framework</TableCell>
                          <TableCell>{formatDate(new Date(2025, 2, 15))}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Under Review
                            </span>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Trust Documentation</CardTitle>
                    <CardDescription>
                      Access important trust documents and policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableCaption>Trust documents available to members.</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Document</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Last Updated</TableHead>
                          <TableHead>Version</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trustDocuments.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">{doc.title}</TableCell>
                            <TableCell>{doc.type}</TableCell>
                            <TableCell>{formatDate(doc.lastUpdated)}</TableCell>
                            <TableCell>v{doc.version}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <FileText className="h-4 w-4 mr-1" /> View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TrustMemberGuard>
  );
};

export default TrustPortal;