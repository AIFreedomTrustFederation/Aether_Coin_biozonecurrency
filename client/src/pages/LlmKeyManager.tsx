import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Copy, Check, X, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Key type definition
interface LlmApiKey {
  id: number;
  key: string;
  name: string;
  userId: number;
  email: string;
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  lastUsedAt: string | null;
  modelAccessLevel: string;
  usageLimit: number | null;
  usageCount: number;
  callsPerMinuteLimit: number;
  isActive: boolean;
}

// Create key form
interface CreateKeyForm {
  name: string;
  email: string;
  modelAccessLevel?: string;
}

export default function LlmKeyManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyData, setNewKeyData] = useState<LlmApiKey | null>(null);
  const [createForm, setCreateForm] = useState<CreateKeyForm>({
    name: '',
    email: ''
  });

  // Get all LLM API keys
  const { data: keys = [], isLoading, error } = useQuery<LlmApiKey[]>({
    queryKey: ['/api/llm/keys'],
    retry: false
  });

  // Create a new key
  const createKeyMutation = useMutation({
    mutationFn: (data: CreateKeyForm) => 
      apiRequest('/api/llm/keys', { method: 'POST', body: data as any }),
    onSuccess: (data) => {
      setNewKeyData(data);
      queryClient.invalidateQueries({ queryKey: ['/api/llm/keys'] });
      toast({
        title: "API Key Created",
        description: "Your new LLM API key has been created successfully.",
      });
      // Reset form
      setCreateForm({
        name: '',
        email: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Creating Key",
        description: error.message || "Failed to create API key. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Revoke a key
  const revokeKeyMutation = useMutation({
    mutationFn: (keyId: number) => 
      apiRequest(`/api/llm/keys/${keyId}/revoke`, { method: 'PATCH' } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/llm/keys'] });
      toast({
        title: "API Key Revoked",
        description: "The LLM API key has been revoked successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error Revoking Key",
        description: error.message || "Failed to revoke API key. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Copy key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "The API key has been copied to your clipboard.",
    });
  };

  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submit
  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    createKeyMutation.mutate(createForm);
  };

  // Handle key revocation
  const handleRevokeKey = (keyId: number) => {
    if (window.confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      revokeKeyMutation.mutate(keyId);
    }
  };

  // Close new key dialog
  const closeNewKeyDialog = () => {
    setNewKeyData(null);
  };

  // Format date 
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">LLM API Key Manager</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create key form */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Create New LLM API Key</CardTitle>
            <CardDescription>
              Generate a new API key to access LLM services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateKey} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Key Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="My LLM Key" 
                  value={createForm.name}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  placeholder="example@example.com" 
                  value={createForm.email}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="modelAccessLevel">Access Level</Label>
                <Select 
                  onValueChange={(value) => setCreateForm(prev => ({ ...prev, modelAccessLevel: value }))}
                  defaultValue="standard"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="quantum">Quantum</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Higher access levels require admin approval.
                </p>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit"
              onClick={handleCreateKey}
              disabled={createKeyMutation.isPending || !createForm.name || !createForm.email}
              className="w-full"
            >
              {createKeyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate API Key
            </Button>
          </CardFooter>
        </Card>
        
        {/* API Keys list */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Your LLM API Keys</CardTitle>
            <CardDescription>
              Manage your existing API keys
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
                <p className="text-lg font-medium">Failed to load API keys</p>
                <p className="text-sm text-muted-foreground">
                  Please try again or contact support if the issue persists.
                </p>
              </div>
            ) : keys && keys.length > 0 ? (
              <div className="space-y-4">
                {keys.map((key: LlmApiKey) => (
                  <div key={key.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{key.name}</h3>
                        <p className="text-sm text-muted-foreground">{key.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant={key.isActive ? "default" : "destructive"}>
                          {key.isActive ? "Active" : "Revoked"}
                        </Badge>
                        <Badge variant="outline">{key.modelAccessLevel}</Badge>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-2 rounded flex justify-between items-center mb-4">
                      <code className="text-sm">{key.key}</code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(key.key)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <span className="text-muted-foreground">Created: </span>
                        {formatDate(key.createdAt)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Used: </span>
                        {formatDate(key.lastUsedAt)}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Usage Count: </span>
                        {key.usageCount}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Calls/min: </span>
                        {key.callsPerMinuteLimit}
                      </div>
                    </div>
                    
                    {key.isActive && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRevokeKey(key.id)}
                        disabled={revokeKeyMutation.isPending}
                      >
                        {revokeKeyMutation.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                        Revoke Key
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You don't have any LLM API keys yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* New key dialog */}
      <Dialog open={!!newKeyData} onOpenChange={() => newKeyData && closeNewKeyDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>
              Your new API key has been created successfully. Make sure to copy it now as you won't be able to see it again.
            </DialogDescription>
          </DialogHeader>
          
          {newKeyData && (
            <div className="bg-muted p-4 rounded-md">
              <div className="flex justify-between items-center">
                <code className="text-sm break-all">{newKeyData.key}</code>
                <Button variant="ghost" size="sm" onClick={() => newKeyData && copyToClipboard(newKeyData.key)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-center">
            <Button variant="default" onClick={closeNewKeyDialog}>
              I've Copied My Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}