import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RocketIcon, KeyIcon, RefreshCwIcon, ShieldAlertIcon, BadgeAlertIcon, ClockIcon, CheckIcon, XIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Define the LLM API Key form schema
const llmApiKeyFormSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters."
  }),
  modelAccessLevel: z.enum(['standard', 'advanced', 'quantum']).default('standard'),
  usageLimit: z.number().nullable().default(null),
  callsPerMinuteLimit: z.number().min(1).max(1000).default(60),
  expiresAt: z.string().optional().nullable()
});

type LlmApiKeyFormValues = z.infer<typeof llmApiKeyFormSchema>;

// Interface for LLM API Key data
interface LlmApiKey {
  id: number;
  key: string;
  name: string;
  email: string;
  userId: number;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  lastUsedAt: string | null;
  isActive: boolean;
  modelAccessLevel: 'standard' | 'advanced' | 'quantum';
  usageLimit: number | null;
  usageCount: number;
  callsPerMinuteLimit: number;
}

// Interface for LLM API Usage
interface LlmApiUsage {
  id: string;
  keyId: number;
  timestamp: string;
  endpoint: string;
  modelUsed: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  duration: number | null;
  ipAddress: string | null;
  responseCode: number | null;
  errorMessage: string | null;
  requestId: string | null;
}

// Interface for LLM API Connection
interface LlmApiConnection {
  id: string;
  keyId: number;
  connectionId: string;
  serviceType: string;
  ipAddress: string | null;
  userAgent: string | null;
  connectedAt: string;
  lastPingAt: string;
  disconnectedAt: string | null;
  sessionData: string | null;
}

// Function to format date strings
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString();
};

const LlmApiKeyManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('keys');

  // Query to fetch API keys
  const { data: apiKeys, isLoading: isLoadingKeys } = useQuery({
    queryKey: ['/api/llm/keys'],
    select: (data: LlmApiKey[]) => data,
  });

  // Query to fetch usage data for selected key
  const { data: keyUsage, isLoading: isLoadingUsage } = useQuery({
    queryKey: ['/api/llm/keys', selectedKeyId, 'usage'],
    enabled: selectedKeyId !== null,
    select: (data: LlmApiUsage[]) => data,
  });

  // Query to fetch active connections for selected key
  const { data: keyConnections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ['/api/llm/keys', selectedKeyId, 'connections'],
    enabled: selectedKeyId !== null,
    select: (data: LlmApiConnection[]) => data,
  });

  // Form for creating new API keys
  const form = useForm<LlmApiKeyFormValues>({
    resolver: zodResolver(llmApiKeyFormSchema),
    defaultValues: {
      name: '',
      modelAccessLevel: 'standard',
      usageLimit: null,
      callsPerMinuteLimit: 60,
      expiresAt: null
    },
  });

  // Mutation for creating a new API key
  const createKeyMutation = useMutation({
    mutationFn: (values: LlmApiKeyFormValues) => {
      return apiRequest('/api/llm/keys', {
        method: 'POST',
        body: values
      });
    },
    onSuccess: () => {
      toast({
        title: 'API Key Created',
        description: 'New LLM API key has been created successfully.',
        variant: 'default',
      });
      setIsCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/llm/keys'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create API key: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation for revoking an API key
  const revokeKeyMutation = useMutation({
    mutationFn: (keyId: number) => {
      return apiRequest(`/api/llm/keys/${keyId}/revoke`, {
        method: 'PATCH'
      });
    },
    onSuccess: () => {
      toast({
        title: 'API Key Revoked',
        description: 'The LLM API key has been revoked successfully.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/llm/keys'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to revoke API key: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });

  // Handler for submitting the new API key form
  const onSubmit = (values: LlmApiKeyFormValues) => {
    createKeyMutation.mutate(values);
  };

  // Handler for revoking an API key
  const handleRevokeKey = (keyId: number) => {
    if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      revokeKeyMutation.mutate(keyId);
    }
  };

  // Handle selecting a key for details view
  const handleSelectKey = (keyId: number) => {
    setSelectedKeyId(keyId);
    setActiveTab('usage');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">LLM API Key Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <KeyIcon className="mr-2 h-4 w-4" />
              Create New API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New LLM API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for accessing the quantum-resistant LLM services.
                This key will be shown only once after creation.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My LLM API Key" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name to identify this API key
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="modelAccessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Access Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select access level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="quantum">Quantum</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determines which LLM models this key can access
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="callsPerMinuteLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate Limit (calls per minute)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1}
                          max={1000}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))} 
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of API calls allowed per minute
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expiresAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Date (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank for no expiration date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={createKeyMutation.isPending}>
                    {createKeyMutation.isPending ? (
                      <>
                        <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create API Key'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {selectedKeyId ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <Button variant="outline" onClick={() => setSelectedKeyId(null)}>
                Back to all keys
              </Button>
              {apiKeys?.find(k => k.id === selectedKeyId)?.isActive && (
                <Button 
                  variant="destructive" 
                  onClick={() => handleRevokeKey(selectedKeyId)}
                  disabled={revokeKeyMutation.isPending}
                >
                  {revokeKeyMutation.isPending ? 'Revoking...' : 'Revoke Key'}
                </Button>
              )}
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>
                  {apiKeys?.find(k => k.id === selectedKeyId)?.name}
                  {!apiKeys?.find(k => k.id === selectedKeyId)?.isActive && (
                    <Badge variant="destructive" className="ml-2">Revoked</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Key: {apiKeys?.find(k => k.id === selectedKeyId)?.key}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Access Level</p>
                    <p className="text-sm text-muted-foreground">
                      {apiKeys?.find(k => k.id === selectedKeyId)?.modelAccessLevel}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Created At</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(apiKeys?.find(k => k.id === selectedKeyId)?.createdAt || null)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Last Used</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(apiKeys?.find(k => k.id === selectedKeyId)?.lastUsedAt || null)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Expires At</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(apiKeys?.find(k => k.id === selectedKeyId)?.expiresAt || null)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Usage Count</p>
                    <p className="text-sm text-muted-foreground">
                      {apiKeys?.find(k => k.id === selectedKeyId)?.usageCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Rate Limit</p>
                    <p className="text-sm text-muted-foreground">
                      {apiKeys?.find(k => k.id === selectedKeyId)?.callsPerMinuteLimit || 60} calls/minute
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="usage">Usage History</TabsTrigger>
                <TabsTrigger value="connections">Active Connections</TabsTrigger>
              </TabsList>
              
              <TabsContent value="usage" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Usage History</CardTitle>
                    <CardDescription>
                      Recent API calls made with this key
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingUsage ? (
                      <div className="flex justify-center items-center py-8">
                        <RefreshCwIcon className="animate-spin h-8 w-8 text-muted-foreground" />
                      </div>
                    ) : keyUsage && keyUsage.length > 0 ? (
                      <ScrollArea className="h-[400px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Timestamp</TableHead>
                              <TableHead>Endpoint</TableHead>
                              <TableHead>Model</TableHead>
                              <TableHead>Tokens</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {keyUsage.map((usage) => (
                              <TableRow key={usage.id}>
                                <TableCell>{formatDate(usage.timestamp)}</TableCell>
                                <TableCell>{usage.endpoint}</TableCell>
                                <TableCell>{usage.modelUsed}</TableCell>
                                <TableCell>{usage.totalTokens}</TableCell>
                                <TableCell>
                                  {usage.responseCode && usage.responseCode >= 200 && usage.responseCode < 300 ? (
                                    <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Success</Badge>
                                  ) : (
                                    <Badge variant="destructive">Error</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    ) : (
                      <Alert>
                        <RocketIcon className="h-4 w-4" />
                        <AlertTitle>No usage data yet</AlertTitle>
                        <AlertDescription>
                          This API key hasn't been used yet or no usage data is available.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="connections" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Connections</CardTitle>
                    <CardDescription>
                      Current active connections using this API key
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingConnections ? (
                      <div className="flex justify-center items-center py-8">
                        <RefreshCwIcon className="animate-spin h-8 w-8 text-muted-foreground" />
                      </div>
                    ) : keyConnections && keyConnections.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Connection ID</TableHead>
                            <TableHead>Service Type</TableHead>
                            <TableHead>Connected At</TableHead>
                            <TableHead>Last Ping</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {keyConnections.map((connection) => (
                            <TableRow key={connection.id}>
                              <TableCell>{connection.connectionId}</TableCell>
                              <TableCell>{connection.serviceType}</TableCell>
                              <TableCell>{formatDate(connection.connectedAt)}</TableCell>
                              <TableCell>{formatDate(connection.lastPingAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Alert>
                        <ShieldAlertIcon className="h-4 w-4" />
                        <AlertTitle>No active connections</AlertTitle>
                        <AlertDescription>
                          This API key doesn't have any active connections at the moment.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your LLM API Keys</CardTitle>
              <CardDescription>
                Manage your quantum-resistant LLM API keys for secure access to large language models
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingKeys ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCwIcon className="animate-spin h-8 w-8 text-muted-foreground" />
                </div>
              ) : apiKeys && apiKeys.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Access Level</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell>{key.key}</TableCell>
                        <TableCell>
                          <Badge variant={
                            key.modelAccessLevel === 'quantum' ? 'default' :
                            key.modelAccessLevel === 'advanced' ? 'secondary' : 'outline'
                          }>
                            {key.modelAccessLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(key.createdAt)}</TableCell>
                        <TableCell>
                          {key.isActive ? (
                            <Badge variant="success" className="flex items-center">
                              <CheckIcon className="mr-1 h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="flex items-center">
                              <XIcon className="mr-1 h-3 w-3" />
                              Revoked
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSelectKey(key.id)}
                            >
                              Details
                            </Button>
                            {key.isActive && (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleRevokeKey(key.id)}
                                disabled={revokeKeyMutation.isPending}
                              >
                                Revoke
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <KeyIcon className="h-4 w-4" />
                  <AlertTitle>No API Keys Found</AlertTitle>
                  <AlertDescription>
                    You haven't created any LLM API keys yet. Create your first key to get started.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex items-center"
              >
                <KeyIcon className="mr-2 h-4 w-4" />
                Create New API Key
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LlmApiKeyManager;