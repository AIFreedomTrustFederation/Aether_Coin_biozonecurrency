import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HelpCircle, Link2, Link2Off, NetworkIcon, RefreshCw, Trash2, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@lib/queryClient";
import { format, formatDistanceToNow } from 'date-fns';

interface ConnectionManagerProps {
  apiKey: string;
}

interface Connection {
  id: number;
  serviceType: string;
  connectionId: string;
  connectedAt: string;
  lastPingAt: string;
  metadata: string;
}

export function ConnectionManager({ apiKey }: ConnectionManagerProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const { toast } = useToast();

  // Get service type color
  const getServiceTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'llm':
        return 'bg-purple-100 text-purple-800';
      case 'filecoin':
        return 'bg-blue-100 text-blue-800';
      case 'fractalcoin':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format metadata for display
  const formatMetadata = (metadata: string) => {
    try {
      const parsedMetadata = JSON.parse(metadata);
      return parsedMetadata;
    } catch (error) {
      return metadata;
    }
  };
  
  // Load connections
  const loadConnections = async () => {
    if (!apiKey) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiRequest(`/api/keys/connections?apiKey=${apiKey}`);
      setConnections(response.connections || []);
    } catch (error) {
      setError('Failed to load connections. Please try again.');
      console.error('Error loading connections:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Disconnect a service
  const disconnectService = async (serviceType: string, connectionId?: string) => {
    setIsDisconnecting(true);
    
    try {
      const response = await apiRequest('/api/keys/connection/disconnect', {
        method: 'POST',
        body: JSON.stringify({
          apiKey,
          serviceType,
          connectionId
        })
      });
      
      if (response.success) {
        toast({
          title: "Service Disconnected",
          description: "The service has been disconnected successfully.",
        });
        
        // Reload connections
        loadConnections();
      } else {
        toast({
          variant: "destructive",
          title: "Disconnection Failed",
          description: "Failed to disconnect the service. Please try again.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Disconnection Failed",
        description: "An error occurred while disconnecting the service.",
      });
      console.error('Error disconnecting service:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };
  
  // Load connections on mount or when apiKey changes
  useEffect(() => {
    if (apiKey) {
      loadConnections();
    }
  }, [apiKey]);

  // Handle disconnecting an individual connection
  const handleDisconnect = (connection: Connection) => {
    setSelectedConnection(connection);
  };
  
  // Disconnect all connections for a service type
  const disconnectAllForService = (serviceType: string) => {
    disconnectService(serviceType);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <NetworkIcon className="h-5 w-5" />
          Active Connections
        </CardTitle>
        <CardDescription>
          Manage all active service connections for your API key
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadConnections}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          
          {connections.length > 0 && (
            <Badge variant="outline">
              {connections.length} Active Connection{connections.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        {connections.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <NetworkIcon className="mx-auto h-12 w-12 opacity-20 mb-2" />
            <p>No active connections found.</p>
            <p className="text-sm mt-1">
              Connections will appear here when services connect using your API key.
            </p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Connected Since</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connections.map((connection) => (
                  <TableRow key={connection.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <Badge className={`w-fit mb-1 ${getServiceTypeColor(connection.serviceType)}`}>
                          {connection.serviceType}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono truncate max-w-[150px]">
                          {connection.connectionId.substring(0, 12)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(connection.connectedAt), { addSuffix: true })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(connection.connectedAt), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(connection.lastPingAt), { addSuffix: true })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(connection.lastPingAt), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Connection Details</DialogTitle>
                              <DialogDescription>
                                Detailed information about this connection
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <h4 className="font-medium">Service Type</h4>
                                <Badge className={getServiceTypeColor(connection.serviceType)}>
                                  {connection.serviceType}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium">Connection ID</h4>
                                <p className="font-mono text-sm bg-muted p-2 rounded">{connection.connectionId}</p>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium">Connected At</h4>
                                <p>{format(new Date(connection.connectedAt), 'PPpp')}</p>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium">Last Activity</h4>
                                <p>{format(new Date(connection.lastPingAt), 'PPpp')}</p>
                              </div>
                              {connection.metadata && (
                                <div className="space-y-2">
                                  <h4 className="font-medium">Metadata</h4>
                                  <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                                    {JSON.stringify(formatMetadata(connection.metadata), null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Link2Off className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Disconnect Service</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to disconnect this service?
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <p>
                                This will disconnect the <strong>{connection.serviceType}</strong> service 
                                with ID <code className="bg-muted px-1">{connection.connectionId.substring(0, 12)}...</code>
                              </p>
                              <p className="text-sm text-muted-foreground mt-2">
                                The service will need to reconnect using your API key to regain access.
                              </p>
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="destructive"
                                onClick={() => disconnectService(connection.serviceType, connection.connectionId)}
                                disabled={isDisconnecting}
                              >
                                {isDisconnecting ? (
                                  <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Disconnecting...
                                  </>
                                ) : (
                                  <>
                                    <Link2Off className="mr-2 h-4 w-4" />
                                    Disconnect
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row justify-between border-t p-4">
        <Button variant="outline" onClick={loadConnections} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        {connections.length > 0 && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Disconnect All
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Disconnect All Services</DialogTitle>
                <DialogDescription>
                  Are you sure you want to disconnect all services?
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p>
                  This will disconnect all <strong>{connections.length}</strong> active service connections.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  All services will need to reconnect using your API key to regain access.
                </p>
              </div>
              <DialogFooter>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    // Get unique service types
                    const serviceTypes = [...new Set(connections.map(c => c.serviceType))];
                    // Disconnect each service type
                    serviceTypes.forEach(type => disconnectService(type));
                  }}
                  disabled={isDisconnecting}
                >
                  {isDisconnecting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Link2Off className="mr-2 h-4 w-4" />
                      Disconnect All
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}