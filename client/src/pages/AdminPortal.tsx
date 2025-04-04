import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { User, Fund, TokenomicsConfig } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { queryClient } from '@/lib/queryClient';
import Dashboard from '@/components/admin/Dashboard';
import AISystem from '@/components/admin/AISystem';

// Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Icons
import { 
  Users, Wallet, BarChart2, Settings, ShieldAlert, DollarSign, 
  ArrowUpRight, ArrowDownRight, Plus, Edit, Trash2, ChevronRight, 
  Loader2, LockIcon, Shield, ChevronDown, Filter, Search, RefreshCw,
  LogOut, Cpu, Network, Bot, GitBranch, Terminal, GitFork, AlertTriangle
} from 'lucide-react';

// Login schema for admin
const loginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Fund allocation schema
const fundAllocationSchema = z.object({
  fundId: z.string().min(1, { message: 'Fund is required' }),
  amount: z.string().min(1, { message: 'Amount is required' })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  purpose: z.string().min(5, { message: 'Purpose must be at least 5 characters' }),
  notes: z.string().optional(),
});

// Token distribution schema
const tokenDistributionSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  percentage: z.string().min(1, { message: 'Percentage is required' })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
      message: 'Percentage must be between 0 and 100',
    }),
  amount: z.string().min(1, { message: 'Amount is required' })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number',
    }),
  lockupPeriodDays: z.string()
    .refine((val) => val === '' || (!isNaN(parseInt(val)) && parseInt(val) >= 0), {
      message: 'Lockup period must be a positive number or empty',
    })
    .optional(),
  vestingPeriodDays: z.string()
    .refine((val) => val === '' || (!isNaN(parseInt(val)) && parseInt(val) >= 0), {
      message: 'Vesting period must be a positive number or empty',
    })
    .optional(),
});

// Main AdminPortal component
const AdminPortal: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Fund allocation form
  const fundAllocationForm = useForm<z.infer<typeof fundAllocationSchema>>({
    resolver: zodResolver(fundAllocationSchema),
    defaultValues: {
      fundId: '',
      amount: '',
      purpose: '',
      notes: '',
    },
  });

  // Token distribution form
  const tokenDistributionForm = useForm<z.infer<typeof tokenDistributionSchema>>({
    resolver: zodResolver(tokenDistributionSchema),
    defaultValues: {
      name: '',
      percentage: '',
      amount: '',
      lockupPeriodDays: '',
      vestingPeriodDays: '',
    },
  });

  // Mock data for UI development - will be replaced with API calls
  const mockFunds = [
    { id: 1, name: 'Development Fund', amount: 2500000, currency: 'USD', fundType: 'development', status: 'active' },
    { id: 2, name: 'Marketing Fund', amount: 1200000, currency: 'USD', fundType: 'marketing', status: 'active' },
    { id: 3, name: 'Operational Fund', amount: 800000, currency: 'USD', fundType: 'operational', status: 'active' },
    { id: 4, name: 'Reserve Fund', amount: 5000000, currency: 'USD', fundType: 'reserve', status: 'locked' },
  ];

  const mockTokenomics = {
    id: 1,
    totalSupply: '10000000000',
    circulatingSupply: '1000000000',
    symbol: 'SING',
    name: 'Singularity Coin',
    decimals: 18,
    initialPrice: '0.000646',
    currentPrice: '0.000710',
    marketCap: '710000',
    status: 'active',
    version: 1,
  };

  const mockDistributions = [
    { id: 1, name: 'ICO', percentage: 10, amount: 1000000000, lockupPeriodDays: 0, vestingPeriodDays: 0 },
    { id: 2, name: 'Team', percentage: 15, amount: 1500000000, lockupPeriodDays: 365, vestingPeriodDays: 730 },
    { id: 3, name: 'Foundation', percentage: 25, amount: 2500000000, lockupPeriodDays: 180, vestingPeriodDays: 1095 },
    { id: 4, name: 'Ecosystem', percentage: 30, amount: 3000000000, lockupPeriodDays: 90, vestingPeriodDays: 365 },
    { id: 5, name: 'Development', percentage: 20, amount: 2000000000, lockupPeriodDays: 180, vestingPeriodDays: 730 },
  ];

  const mockTransactions = [
    { id: 1, fundId: 1, amount: 250000, type: 'withdrawal', description: 'Developer salaries Q2', status: 'completed', timestamp: '2025-03-15T10:30:00Z', recipient: 'Tech Team' },
    { id: 2, fundId: 2, amount: 100000, type: 'withdrawal', description: 'Marketing campaign - Asia', status: 'completed', timestamp: '2025-03-10T14:45:00Z', recipient: 'Marketing Agency XYZ' },
    { id: 3, fundId: 3, amount: 50000, type: 'withdrawal', description: 'Office rent Q2', status: 'pending', timestamp: '2025-04-01T09:00:00Z', recipient: 'Corporate Office Spaces Inc.' },
    { id: 4, fundId: 4, amount: 1000000, type: 'deposit', description: 'Initial reserve allocation', status: 'completed', timestamp: '2025-01-15T08:30:00Z', recipient: 'Reserve Fund' },
  ];

  // Query for Admin Auth status - replace with actual API call
  const { data: adminUser, isLoading: isLoadingAdmin } = useQuery({
    queryKey: ['/api/admin/auth-status'],
    queryFn: async () => {
      // Just a mockup for now, would normally get from API
      if (isAuthenticated) {
        // Cast to unknown first to avoid type issues during development
        return { 
          id: 1, 
          username: 'admin', 
          email: 'admin@aifreedomtrust.org', 
          role: 'admin',
          passwordHash: 'hashed_password_here',
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: new Date(),
          isActive: true
        } as unknown as User;
      }
      return null;
    },
    enabled: isAuthenticated
  });

  // Query for admin funds - replace with actual API call
  const { data: funds, isLoading: isLoadingFunds } = useQuery({
    queryKey: ['/api/admin/funds'],
    queryFn: async () => {
      // Just a mockup for now, would normally get from API
      // Create properly typed fund objects
      return mockFunds.map(fund => ({
        id: fund.id,
        name: fund.name,
        description: "",
        amount: fund.amount.toString(),
        currency: fund.currency,
        fundType: fund.fundType,
        status: fund.status,
        createdBy: 1, // Admin ID
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as unknown as Fund[];
    },
    enabled: isAuthenticated && activeTab === 'funds'
  });

  // Query for tokenomics - replace with actual API call
  const { data: tokenomics, isLoading: isLoadingTokenomics } = useQuery({
    queryKey: ['/api/admin/tokenomics'],
    queryFn: async () => {
      // Just a mockup for now, would normally get from API
      return mockTokenomics as TokenomicsConfig;
    },
    enabled: isAuthenticated && activeTab === 'tokenomics'
  });

  const handleLogin = (data: z.infer<typeof loginSchema>) => {
    // Temporarily use a simple authentication check - in production would call API
    if (data.username === 'admin' && data.password === 'password') {
      setIsAuthenticated(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the Admin Portal.",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLocation('/');
    toast({
      title: "Logged Out",
      description: "You have been logged out of the Admin Portal.",
    });
  };

  const handleFundAllocation = (data: z.infer<typeof fundAllocationSchema>) => {
    console.log('Allocating fund:', data);
    toast({
      title: "Fund Allocation Requested",
      description: `Requested $${parseFloat(data.amount).toLocaleString()} from ${mockFunds.find(f => f.id.toString() === data.fundId)?.name}.`,
    });
    fundAllocationForm.reset();
  };

  const handleTokenDistribution = (data: z.infer<typeof tokenDistributionSchema>) => {
    console.log('Adding token distribution:', data);
    toast({
      title: "Token Distribution Added",
      description: `Added ${data.name} distribution of ${data.percentage}% (${parseFloat(data.amount).toLocaleString()} tokens).`,
    });
    tokenDistributionForm.reset();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">AI Freedom Trust</CardTitle>
            <CardDescription>Admin Portal Login</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" size="lg">
                  {loginForm.formState.isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LockIcon className="mr-2 h-4 w-4" />
                  )}
                  Login
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground">
            <p>For AI Freedom Trust administrators only</p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div className="hidden w-64 flex-shrink-0 flex-col bg-white dark:bg-slate-800 shadow-md md:flex">
        <div className="flex h-14 items-center border-b border-slate-200 dark:border-slate-700 px-4">
          <h2 className="text-lg font-bold">Admin Portal</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            <li>
              <Button 
                variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('dashboard')}
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === 'funds' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('funds')}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Fund Management
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === 'tokenomics' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('tokenomics')}
              >
                <Wallet className="mr-2 h-4 w-4" />
                Tokenomics
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === 'users' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('users')}
              >
                <Users className="mr-2 h-4 w-4" />
                User Management
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === 'security' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('security')}
              >
                <Shield className="mr-2 h-4 w-4" />
                Security
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === 'settings' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </li>
            <li>
              <Button 
                variant={activeTab === 'ai-system' ? 'secondary' : 'ghost'} 
                className="w-full justify-start" 
                onClick={() => setActiveTab('ai-system')}
              >
                <Cpu className="mr-2 h-4 w-4" />
                AI System
              </Button>
            </li>
          </ul>
        </nav>
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          <Button variant="outline" className="w-full justify-start text-red-500" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-6 h-16">
          <Button variant="ghost" className="flex flex-col items-center justify-center rounded-none h-full" onClick={() => setActiveTab('dashboard')}>
            <BarChart2 className="h-4 w-4" />
            <span className="text-xs mt-1">Dashboard</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center justify-center rounded-none h-full" onClick={() => setActiveTab('funds')}>
            <DollarSign className="h-4 w-4" />
            <span className="text-xs mt-1">Funds</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center justify-center rounded-none h-full" onClick={() => setActiveTab('tokenomics')}>
            <Wallet className="h-4 w-4" />
            <span className="text-xs mt-1">Tokenomics</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center justify-center rounded-none h-full" onClick={() => setActiveTab('users')}>
            <Users className="h-4 w-4" />
            <span className="text-xs mt-1">Users</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center justify-center rounded-none h-full" onClick={() => setActiveTab('security')}>
            <Shield className="h-4 w-4" />
            <span className="text-xs mt-1">Security</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center justify-center rounded-none h-full" onClick={() => setActiveTab('ai-system')}>
            <Cpu className="h-4 w-4" />
            <span className="text-xs mt-1">AI System</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
        <header className="sticky top-0 z-10 flex h-14 items-center border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <h1 className="text-lg font-bold">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'funds' && 'Fund Management'}
              {activeTab === 'tokenomics' && 'Tokenomics'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'security' && 'Security'}
              {activeTab === 'settings' && 'Settings'}
              {activeTab === 'ai-system' && 'AI System'}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-medium">{adminUser?.username}</span>
              <Badge variant="outline" className="ml-1">{adminUser?.role}</Badge>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="p-4 md:p-6">
          {/* Dashboard tab */}
          {activeTab === 'dashboard' && (
            <Dashboard />
          )}

          {/* Fund Management tab */}
          {activeTab === 'funds' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Fund Management</h1>
                <div className="flex items-center gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Request Allocation
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Request Fund Allocation</SheetTitle>
                        <SheetDescription>
                          Fill out this form to request an allocation from a fund. Your request will need approval.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6">
                        <Form {...fundAllocationForm}>
                          <form onSubmit={fundAllocationForm.handleSubmit(handleFundAllocation)} className="space-y-4">
                            <FormField
                              control={fundAllocationForm.control}
                              name="fundId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Select Fund</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a fund" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {mockFunds.map((fund) => (
                                        <SelectItem key={fund.id} value={fund.id.toString()}>
                                          {fund.name} (${fund.amount.toLocaleString()})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={fundAllocationForm.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Amount (USD)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="10000" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={fundAllocationForm.control}
                              name="purpose"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Purpose</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Marketing campaign, development sprint, etc." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={fundAllocationForm.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Additional Notes (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Provide additional details about this allocation request" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" className="w-full">
                              Submit Request
                            </Button>
                          </form>
                        </Form>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {mockFunds.map((fund) => (
                  <Card key={fund.id} className={fund.status === 'locked' ? 'border-amber-500' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{fund.name}</CardTitle>
                        {fund.status === 'locked' && <LockIcon className="h-4 w-4 text-amber-500" />}
                      </div>
                      <CardDescription>{fund.fundType}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${fund.amount.toLocaleString()}</div>
                      <Badge variant={fund.status === 'active' ? 'outline' : 'secondary'} className="mt-2">
                        {fund.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <h2 className="text-xl font-semibold mt-8">Recent Transactions</h2>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-medium">{tx.description}</TableCell>
                        <TableCell>${tx.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={tx.type === 'deposit' ? 'default' : 'secondary'}>
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={tx.status === 'completed' ? 'outline' : 'secondary'}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(tx.timestamp).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Tokenomics tab */}
          {activeTab === 'tokenomics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Tokenomics Management</h1>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button>
                      <Edit className="mr-2 h-4 w-4" />
                      Update Distribution
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Add Token Distribution</SheetTitle>
                      <SheetDescription>
                        Create a new distribution category for the Singularity Coin token supply.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                      <Form {...tokenDistributionForm}>
                        <form onSubmit={tokenDistributionForm.handleSubmit(handleTokenDistribution)} className="space-y-4">
                          <FormField
                            control={tokenDistributionForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="ICO, Team, Foundation, etc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={tokenDistributionForm.control}
                            name="percentage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Percentage (%)</FormLabel>
                                <FormControl>
                                  <Input placeholder="10" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={tokenDistributionForm.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Amount (Tokens)</FormLabel>
                                <FormControl>
                                  <Input placeholder="1000000000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={tokenDistributionForm.control}
                            name="lockupPeriodDays"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lockup Period (Days)</FormLabel>
                                <FormControl>
                                  <Input placeholder="365" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={tokenDistributionForm.control}
                            name="vestingPeriodDays"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Vesting Period (Days)</FormLabel>
                                <FormControl>
                                  <Input placeholder="730" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full">
                            Add Distribution
                          </Button>
                        </form>
                      </Form>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Singularity Coin Overview</CardTitle>
                    <CardDescription>
                      Current token metrics and market data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Symbol</h3>
                        <p className="text-lg font-bold">{mockTokenomics.symbol}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Decimals</h3>
                        <p className="text-lg font-bold">{mockTokenomics.decimals}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Total Supply</h3>
                        <p className="text-lg font-bold">{parseInt(mockTokenomics.totalSupply).toLocaleString()}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Circulating Supply</h3>
                        <p className="text-lg font-bold">{parseInt(mockTokenomics.circulatingSupply).toLocaleString()}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Initial Price</h3>
                        <p className="text-lg font-bold">${mockTokenomics.initialPrice}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Current Price</h3>
                        <p className="text-lg font-bold">${mockTokenomics.currentPrice}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Market Cap</h3>
                        <p className="text-lg font-bold">${parseInt(mockTokenomics.marketCap).toLocaleString()}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                        <Badge className="mt-1" variant="outline">{mockTokenomics.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Distribution Metrics</CardTitle>
                    <CardDescription>
                      Current allocation of token supply
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockDistributions.map((dist) => (
                        <div key={dist.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{dist.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {dist.lockupPeriodDays > 0 && `${dist.lockupPeriodDays} days lockup`}
                              {dist.lockupPeriodDays > 0 && dist.vestingPeriodDays > 0 && ', '}
                              {dist.vestingPeriodDays > 0 && `${dist.vestingPeriodDays} days vesting`}
                              {dist.lockupPeriodDays === 0 && dist.vestingPeriodDays === 0 && 'No lockup or vesting'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{dist.percentage}%</p>
                            <p className="text-sm text-muted-foreground">{dist.amount.toLocaleString()} tokens</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>ICO Details</CardTitle>
                  <CardDescription>
                    Information about the Initial Coin Offering
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">ICO Supply</h3>
                      <p className="text-lg font-bold">1,000,000,000 SING</p>
                      <p className="text-sm text-muted-foreground">10% of total supply</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">ICO Price</h3>
                      <p className="text-lg font-bold">$0.000646 per SING</p>
                      <p className="text-sm text-muted-foreground">Initial offering price</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Hardcap</h3>
                      <p className="text-lg font-bold">$646,000</p>
                      <p className="text-sm text-muted-foreground">Maximum funding target</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">ICO Progress</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Funds Raised</p>
                        <p className="text-sm font-medium">$452,200 / $646,000</p>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '70%' }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">70% complete</p>
                        <p className="text-sm text-muted-foreground">194 participants</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* User Management tab - Placeholder for now */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">User Management</h1>
              <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>This section is under development</AlertTitle>
                <AlertDescription>
                  User management features will be available in the next release.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Security tab - Placeholder for now */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Security</h1>
              <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>This section is under development</AlertTitle>
                <AlertDescription>
                  Security management features will be available in the next release.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Settings tab - Placeholder for now */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Settings</h1>
              <Alert>
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>This section is under development</AlertTitle>
                <AlertDescription>
                  Settings configuration will be available in the next release.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* AI System tab */}
          {activeTab === 'ai-system' && (
            <AISystem />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminPortal;