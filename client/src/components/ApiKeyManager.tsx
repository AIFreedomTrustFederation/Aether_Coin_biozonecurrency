import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from 'date-fns';
import { Copy, Eye, EyeOff, RotateCcw, Shield, ShieldAlert } from 'lucide-react';

// Define the API key schema
const apiKeyFormSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  scopes: z.array(z.string()).min(1, {
    message: "At least one scope is required.",
  }),
});

type ApiKeyFormValues = z.infer<typeof apiKeyFormSchema>;

// Interface for API Key data
interface ApiKey {
  id: number;
  key: string;
  name: string;
  email: string;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  isActive: boolean;
  lastUsedAt: string | null;
  scopes: string[];
}

export function ApiKeyManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [viewConnectionsFor, setViewConnectionsFor] = useState<number | null>(null);
  const [viewUsageFor, setViewUsageFor] = useState<number | null>(null);
  const [showFullKey, setShowFullKey] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  
  // Form for creating new API keys
  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      name: "",
      email: "",
      scopes: ["read"],
    },
  });
  
  // Query to fetch API keys
  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['/api/keys'],
    queryFn: () => apiRequest('/api/keys'),
  });
  
  // Query to fetch connections for a specific API key
  const { data: connections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ['/api/keys', viewConnectionsFor, 'connections'],
    queryFn: () => apiRequest(`/api/keys/${viewConnectionsFor}/connections`),
    enabled: !!viewConnectionsFor,
  });
  
  // Query to fetch usage data for a specific API key
  const { data: usageData, isLoading: isLoadingUsage } = useQuery({
    queryKey: ['/api/keys', viewUsageFor, 'usage'],
    queryFn: () => apiRequest(`/api/keys/${viewUsageFor}/usage`),
    enabled: !!viewUsageFor,
  });
  
  // Mutation to create a new API key
  const createKeyMutation = useMutation({
    mutationFn: (data: ApiKeyFormValues) => apiRequest('/api/keys', {
      method: 'POST',
      body: data,
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
      setIsCreating(false);
      setSelectedKey(data);
      toast({
        title: "API Key created",
        description: `Your new API key "${data.name}" has been created.`,
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create API key. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to revoke an API key
  const revokeKeyMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/keys/${id}/revoke`, {
      method: 'PATCH',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys'] });
      toast({
        title: "API Key revoked",
        description: "The API key has been revoked successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to revoke API key. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation to terminate a connection
  const terminateConnectionMutation = useMutation({
    mutationFn: ({ keyId, connectionId }: { keyId: number, connectionId: string }) => 
      apiRequest(`/api/keys/${keyId}/connections/${connectionId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/keys', variables.keyId, 'connections'] });
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
  
  const onSubmit = (data: ApiKeyFormValues) => {
    createKeyMutation.mutate(data);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The API key has been copied to your clipboard.",
    });
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return format(new Date(dateString), 'MMM d, yyyy HH:mm:ss');
  };
  
  // Render the scope badges
  const renderScopes = (scopes: string[]) => {
    return scopes.map((scope) => (
      <Badge key={scope} variant="outline" className="mr-1">
        {scope}
      </Badge>
    ));
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">API Key Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and monitor your API keys for the FractalCoin API.
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>Create New API Key</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key to access FractalCoin services. API keys are associated with
                specific email addresses and have defined scopes.
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
                        <Input placeholder="My Application" {...field} />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for your API key.
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
                        Email address associated with this API key.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scopes"
                  render={() => (
                    <FormItem>
                      <FormLabel>Scopes</FormLabel>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="scope-read"
                            checked={form.watch("scopes").includes("read")}
                            onChange={(e) => {
                              const scopes = new Set(form.watch("scopes"));
                              if (e.target.checked) {
                                scopes.add("read");
                              } else {
                                scopes.delete("read");
                              }
                              form.setValue("scopes", Array.from(scopes));
                            }}
                          />
                          <label htmlFor="scope-read">Read</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="scope-write"
                            checked={form.watch("scopes").includes("write")}
                            onChange={(e) => {
                              const scopes = new Set(form.watch("scopes"));
                              if (e.target.checked) {
                                scopes.add("write");
                              } else {
                                scopes.delete("write");
                              }
                              form.setValue("scopes", Array.from(scopes));
                            }}
                          />
                          <label htmlFor="scope-write">Write</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="scope-admin"
                            checked={form.watch("scopes").includes("admin")}
                            onChange={(e) => {
                              const scopes = new Set(form.watch("scopes"));
                              if (e.target.checked) {
                                scopes.add("admin");
                              } else {
                                scopes.delete("admin");
                              }
                              form.setValue("scopes", Array.from(scopes));
                            }}
                          />
                          <label htmlFor="scope-admin">Admin</label>
                        </div>
                      </div>
                      <FormDescription>
                        Select the scopes this API key will have access to.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createKeyMutation.isPending}>
                    {createKeyMutation.isPending ? "Creating..." : "Create API Key"}
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
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Your new API key has been created successfully. Make sure to copy it now as you won't be able to see it again.
            </DialogDescription>
          </DialogHeader>
          {selectedKey && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="font-medium">API Key</h3>
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
                  <h3 className="font-medium">Scopes</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {renderScopes(selectedKey.scopes)}
                  </div>
                </div>
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
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Manage your API keys for accessing FractalCoin services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading API keys...</div>
          ) : apiKeys?.length > 0 ? (
            <Table>
              <TableCaption>A list of your API keys.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key: ApiKey) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">
                      <div>{key.name}</div>
                      <div className="text-xs text-muted-foreground">{key.email}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {renderScopes(key.scopes)}
                      </div>
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
                    <TableCell>{formatDate(key.createdAt)}</TableCell>
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
                              if (window.confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
                                revokeKeyMutation.mutate(key.id);
                              }
                            }}
                            title="Revoke this API key"
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
              <p>You don't have any API keys yet.</p>
              <Button className="mt-4" onClick={() => setIsCreating(true)}>
                Create your first API key
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
              Active connections using this API key. You can terminate any suspicious connections.
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
                {connections.map((connection: any) => (
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
              No active connections found for this API key.
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
            <DialogTitle>API Key Usage</DialogTitle>
            <DialogDescription>
              Recent usage statistics for this API key.
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
                  <TableHead>IP Address</TableHead>
                  <TableHead>Response Code</TableHead>
                  <TableHead>Response Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageData.map((usage: any) => (
                  <TableRow key={usage.id}>
                    <TableCell>{formatDate(usage.timestamp)}</TableCell>
                    <TableCell className="font-mono text-xs">{usage.endpoint}</TableCell>
                    <TableCell>{usage.ipAddress || 'N/A'}</TableCell>
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
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {usage.responseTime ? `${usage.responseTime}ms` : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4">
              No usage data found for this API key.
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