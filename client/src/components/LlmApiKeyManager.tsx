import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from 'date-fns';
import { Copy, Eye, EyeOff, RotateCcw, Shield, ShieldAlert, Info, Database, Cpu, Zap } from 'lucide-react';

// Define the LLM API key schema
const llmApiKeyFormSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  modelAccessLevel: z.enum(['standard', 'advanced', 'quantum']),
  usageLimit: z.number().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
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

export function LlmApiKeyManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedKey, setSelectedKey] = useState<LlmApiKey | null>(null);
  const [viewConnectionsFor, setViewConnectionsFor] = useState<number | null>(null);
  const [viewUsageFor, setViewUsageFor] = useState<number | null>(null);
  const [showFullKey, setShowFullKey] = useState<number | null>(null);
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  
  // Form for creating new LLM API keys
  const form = useForm<LlmApiKeyFormValues>({
    resolver: zodResolver(llmApiKeyFormSchema),
    defaultValues: {
      name: "",
      email: "",
      modelAccessLevel: "standard",
      usageLimit: null,
      expiresAt: null,
    },
  });
  
  // Query to fetch LLM API keys
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['/api/llm/keys'],
    queryFn: () => apiRequest('/api/llm/keys'),
  });
  
  // Query to fetch connections for a specific LLM API key
  const { data: connections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ['/api/llm/keys', viewConnectionsFor, 'connections'],
    queryFn: () => apiRequest(`/api/llm/keys/${viewConnectionsFor}/connections`),
    enabled: !!viewConnectionsFor,
  });
  
  // Query to fetch usage data for a specific LLM API key
  const { data: usageData, isLoading: isLoadingUsage } = useQuery({
    queryKey: ['/api/llm/keys', viewUsageFor, 'usage'],
    queryFn: () => apiRequest(`/api/llm/keys/${viewUsageFor}/usage`),
    enabled: !!viewUsageFor,
  });
  
  // Mutation to create a new LLM API key
  const createKeyMutation = useMutation({
    mutationFn: (data: LlmApiKeyFormValues) => apiRequest('/api/llm/keys', {
      method: 'POST',
      body: data,
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/llm/keys'] });
      setIsCreating(false);
      setSelectedKey(data);
      toast({
        title: "LLM API Key created",
        description: `Your new LLM API key "${data.name}" has been created.`,
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create LLM API key. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to revoke an LLM API key
  const revokeKeyMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/llm/keys/${id}/revoke`, {
      method: 'PATCH',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/llm/keys'] });
      toast({
        title: "LLM API Key revoked",
        description: "The LLM API key has been revoked successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to revoke LLM API key. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to terminate a connection
  const terminateConnectionMutation = useMutation({
    mutationFn: ({ keyId, connectionId }: { keyId: number, connectionId: string }) => 
      apiRequest(`/api/llm/keys/${keyId}/connections/${connectionId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/llm/keys', variables.keyId, 'connections'] });
      toast({
        title: "Connection terminated",
        description: "The connection has been terminated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to terminate connection. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: LlmApiKeyFormValues) => {
    createKeyMutation.mutate(data);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The LLM API key has been copied to your clipboard.",
    });
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return format(new Date(dateString), 'MMM d, yyyy HH:mm:ss');
  };
  
  // Get icon for model access level
  const getModelAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'standard':
        return <Database className="h-4 w-4 text-blue-500" />;
      case 'advanced':
        return <Cpu className="h-4 w-4 text-violet-500" />;
      case 'quantum':
        return <Zap className="h-4 w-4 text-amber-500" />;
      default:
        return <Database className="h-4 w-4 text-blue-500" />;
    }
  };
  
  // Format the model access level for display
  const formatModelAccessLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };
  
  // Render the token counts
  const renderTokenCounts = (usage: LlmApiUsage) => {
    return (
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Prompt:</span>
          <span className="font-medium">{usage.promptTokens}</span>
        </div>
        <div className="flex justify-between">
          <span>Completion:</span>
          <span className="font-medium">{usage.completionTokens}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>{usage.totalTokens}</span>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">LLM API Key Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and monitor your API keys for the Mysterion LLM API service.
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>Create New LLM API Key</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New LLM API Key</DialogTitle>
              <DialogDescription>
                Create a new API key to access Mysterion LLM services. API keys are associated with
                specific email addresses and have defined access levels.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My LLM Application" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for your LLM API key.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormDescription>
                        Email address associated with this LLM API key.
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
                        disabled={!isAdmin && field.value !== 'standard'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select access level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="standard">
                            <div className="flex items-center">
                              <Database className="h-4 w-4 text-blue-500 mr-2" />
                              Standard
                            </div>
                          </SelectItem>
                          {isAdmin && (
                            <>
                              <SelectItem value="advanced">
                                <div className="flex items-center">
                                  <Cpu className="h-4 w-4 text-violet-500 mr-2" />
                                  Advanced
                                </div>
                              </SelectItem>
                              <SelectItem value="quantum">
                                <div className="flex items-center">
                                  <Zap className="h-4 w-4 text-amber-500 mr-2" />
                                  Quantum
                                </div>
                              </SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {isAdmin ? (
                          <span>Select the access level for LLM models. Higher levels give access to more powerful models.</span>
                        ) : (
                          <span>Only standard models are available by default. Contact an admin for higher access levels.</span>
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isAdmin && (
                  <FormField
                    control={form.control}
                    name="usageLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usage Limit</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Leave empty for unlimited" 
                            value={field.value === null ? "" : field.value}
                            onChange={(e) => {
                              const value = e.target.value === "" 
                                ? null 
                                : parseInt(e.target.value, 10);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Set a limit on the total number of API calls. Leave empty for unlimited.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <DialogFooter>
                  <Button type="submit" disabled={createKeyMutation.isPending}>
                    {createKeyMutation.isPending ? "Creating..." : "Create LLM API Key"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* New Key Dialog */}
      <Dialog open={!!selectedKey} onOpenChange={() => setSelectedKey(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>LLM API Key Created</DialogTitle>
            <DialogDescription>
              Your new LLM API key has been created successfully. Make sure to copy it now as you won't be able to see it again.
            </DialogDescription>
          </DialogHeader>
          {selectedKey && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="font-medium">LLM API Key</h3>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <code className="flex-1 overflow-auto text-sm" style={{ wordBreak: 'break-all' }}>
                    {selectedKey.key}
                  </code>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(selectedKey.key)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Name</h3>
                  <p className="text-sm text-muted-foreground">{selectedKey.name}</p>
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground">{selectedKey.email}</p>
                </div>
                <div>
                  <h3 className="font-medium">Created</h3>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedKey.createdAt)}</p>
                </div>
                <div>
                  <h3 className="font-medium">Access Level</h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    {getModelAccessLevelIcon(selectedKey.modelAccessLevel)}
                    <span className="ml-1">{formatModelAccessLevel(selectedKey.modelAccessLevel)}</span>
                  </div>
                </div>
                {selectedKey.usageLimit !== null && (
                  <div>
                    <h3 className="font-medium">Usage Limit</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedKey.usageCount} / {selectedKey.usageLimit} calls
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedKey(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* API Keys Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your LLM API Keys</CardTitle>
          <CardDescription>
            Manage your API keys for accessing Mysterion LLM services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading LLM API keys...</div>
          ) : apiKeys?.length > 0 ? (
            <Table>
              <TableCaption>A list of your LLM API keys.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key: LlmApiKey) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">
                      <div>{key.name}</div>
                      <div className="text-xs text-muted-foreground">{key.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs">
                          {showFullKey === key.id ? key.key : key.key}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(key.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowFullKey(showFullKey === key.id ? null : key.id)}
                        >
                          {showFullKey === key.id ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getModelAccessLevelIcon(key.modelAccessLevel)}
                        <span className="ml-1">{formatModelAccessLevel(key.modelAccessLevel)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {key.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Revoked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {key.usageLimit ? (
                        <span>{key.usageCount} / {key.usageLimit}</span>
                      ) : (
                        <span>{key.usageCount} / ∞</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(key.lastUsedAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewConnectionsFor(key.id)}
                          title="View active connections"
                        >
                          <Shield className="h-4 w-4 mr-1" />
                          Connections
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewUsageFor(key.id)}
                          title="View usage statistics"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Usage
                        </Button>
                        {key.isActive && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (window.confirm("Are you sure you want to revoke this LLM API key? This action cannot be undone.")) {
                                revokeKeyMutation.mutate(key.id);
                              }
                            }}
                            title="Revoke this LLM API key"
                          >
                            <ShieldAlert className="h-4 w-4 mr-1" />
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
            <div className="text-center py-4">
              <p>You don't have any LLM API keys yet.</p>
              <Button className="mt-4" onClick={() => setIsCreating(true)}>
                Create your first LLM API key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Connections Dialog */}
      <Dialog open={!!viewConnectionsFor} onOpenChange={() => setViewConnectionsFor(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Active Connections</DialogTitle>
            <DialogDescription>
              Active connections using this LLM API key. You can terminate any suspicious connections.
            </DialogDescription>
          </DialogHeader>
          {isLoadingConnections ? (
            <div className="text-center py-4">Loading connections...</div>
          ) : connections?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Connection ID</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Connected At</TableHead>
                  <TableHead>Last Ping</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connections.map((connection: LlmApiConnection) => (
                  <TableRow key={connection.id}>
                    <TableCell className="font-mono text-xs">
                      {connection.connectionId.substring(0, 10)}...
                    </TableCell>
                    <TableCell>{connection.serviceType}</TableCell>
                    <TableCell>{formatDate(connection.connectedAt)}</TableCell>
                    <TableCell>{formatDate(connection.lastPingAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to terminate this connection?")) {
                            terminateConnectionMutation.mutate({
                              keyId: viewConnectionsFor!,
                              connectionId: connection.connectionId
                            });
                          }
                        }}
                      >
                        Terminate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4">
              No active connections found for this LLM API key.
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewConnectionsFor(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Usage Dialog */}
      <Dialog open={!!viewUsageFor} onOpenChange={() => setViewUsageFor(null)}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>LLM API Key Usage</DialogTitle>
            <DialogDescription>
              Recent usage statistics for this LLM API key.
            </DialogDescription>
          </DialogHeader>
          {isLoadingUsage ? (
            <div className="text-center py-4">Loading usage data...</div>
          ) : usageData?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageData.map((usage: LlmApiUsage) => (
                  <TableRow key={usage.id}>
                    <TableCell>{formatDate(usage.timestamp)}</TableCell>
                    <TableCell className="font-mono text-xs">{usage.endpoint}</TableCell>
                    <TableCell>{usage.modelUsed}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{usage.totalTokens}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {renderTokenCounts(usage)}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>{usage.duration ? `${usage.duration} ms` : 'N/A'}</TableCell>
                    <TableCell>
                      {usage.responseCode ? (
                        <Badge 
                          variant="outline" 
                          className={
                            usage.responseCode >= 200 && usage.responseCode < 300
                              ? "bg-green-50 text-green-700 border-green-200"
                              : usage.responseCode >= 400
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          {usage.responseCode}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          N/A
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4">
              No usage data found for this LLM API key.
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewUsageFor(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}