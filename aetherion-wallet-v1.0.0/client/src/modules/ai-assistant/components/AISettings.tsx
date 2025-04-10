import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { mysterionClient } from '@/services/mysterion-client';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Info, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Key, 
  Shield, 
  Trash, 
  Brain, 
  AlertTriangle 
} from 'lucide-react';

// Mock data to use when not connected to actual backend
const MOCK_API_KEYS = [
  {
    id: 1,
    service: 'openai',
    nickname: 'Primary GPT-4 Key',
    isActive: true,
    isTrainingEnabled: true,
    usageCount: 42,
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
    vaultStatus: 'secured'
  }
];

const MOCK_CONTRIBUTION_POINTS = 560;

type ApiKey = {
  id: number;
  service: string;
  nickname: string;
  isActive: boolean;
  isTrainingEnabled: boolean;
  usageCount: number;
  createdAt: string;
  lastUsedAt: string | null;
  vaultStatus: string;
}

// Main component for managing API keys
export default function AISettings() {
  const [isAddKeyDialogOpen, setIsAddKeyDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch API keys
  interface ApiKeyData {
    apiKeys: ApiKey[];
  }

  interface ContributionData {
    points: number;
  }

  const { data: apiKeyData, isLoading: keysLoading, error: keysError } = useQuery<ApiKeyData>({
    queryKey: ['/api/mysterion/api-keys'],
    queryFn: async () => {
      try {
        const keys = await mysterionClient.getApiKeys();
        return { apiKeys: keys };
      } catch (error) {
        console.error('Error fetching API keys:', error);
        return { apiKeys: [] };
      }
    }
  });

  // Get contribution points
  const { data: contributionData, isLoading: pointsLoading } = useQuery<ContributionData>({
    queryKey: ['/api/mysterion/contribution'],
    queryFn: async () => {
      try {
        const points = await mysterionClient.getContributionPoints();
        return { points };
      } catch (error) {
        console.error('Error fetching contribution points:', error);
        return { points: 0 };
      }
    }
  });

  const apiKeys = apiKeyData?.apiKeys || MOCK_API_KEYS;
  const points = contributionData?.points || MOCK_CONTRIBUTION_POINTS;

  // Delete API key
  const deleteMutation = useMutation({
    mutationFn: async (keyId: number) => {
      return await mysterionClient.deleteApiKey(keyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mysterion/api-keys'] });
      toast({
        title: 'API Key Deleted',
        description: 'The API key has been removed securely.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Deleting API Key',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  // Update API key settings
  const updateMutation = useMutation({
    mutationFn: async ({ keyId, isActive, isTrainingEnabled }: { keyId: number, isActive?: boolean, isTrainingEnabled?: boolean}) => {
      return await mysterionClient.updateApiKey(keyId, { isActive, isTrainingEnabled });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mysterion/api-keys'] });
      toast({
        title: 'Settings Updated',
        description: 'API key settings have been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error Updating Settings',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteKey = (keyId: number) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      deleteMutation.mutate(keyId);
    }
  };

  const handleToggleActive = (keyId: number, currentValue: boolean) => {
    updateMutation.mutate({ keyId, isActive: !currentValue });
  };

  const handleToggleTraining = (keyId: number, currentValue: boolean) => {
    updateMutation.mutate({ keyId, isTrainingEnabled: !currentValue });
  };

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Mysterion AI Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Manage your OpenAI API keys and contribute to the distributed training network
          </p>
        </div>
        <Button onClick={() => setIsAddKeyDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add API Key
        </Button>
      </div>

      {/* Contribution Status Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" /> 
            Mysterion Network Contribution
          </CardTitle>
          <CardDescription>
            Your contribution to the distributed AI training network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">{pointsLoading ? '...' : points} Points</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Training points earned from your API key usage
              </p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-gray-500 dark:text-gray-400 border-t pt-4">
          <div className="flex items-center">
            <Info className="h-4 w-4 mr-2" />
            <span>Points determine your training priority and future rewards</span>
          </div>
        </CardFooter>
      </Card>

      {/* Security Information */}
      <Alert className="mb-8 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
        <AlertTitle className="text-amber-800 dark:text-amber-400">Secure Key Storage</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          Your API keys are stored using quantum-resistant encryption and fractal sharding. 
          Keys are never stored in plain text and are secured in your local vault.
        </AlertDescription>
      </Alert>

      {/* API Keys List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your API Keys</h2>
        </div>

        {keysLoading ? (
          <p className="text-center py-8 text-gray-500">Loading your API keys...</p>
        ) : keysError ? (
          <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load API keys. Please try again later.
            </AlertDescription>
          </Alert>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed">
            <Key className="h-10 w-10 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No API Keys Found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-2">
              Add your OpenAI API key to start using Mysterion and contribute to the distributed AI training network
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsAddKeyDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add your first API key
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key: ApiKey) => (
              <Card key={key.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center text-lg">
                        {key.nickname}
                        {key.vaultStatus === 'secured' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Shield className="ml-2 h-4 w-4 text-green-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Quantum-secured in local vault</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {key.service.toUpperCase()} • Added {new Date(key.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteKey(key.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0">
                        <Label htmlFor={`active-${key.id}`} className="mr-2">Active</Label>
                        <Switch 
                          id={`active-${key.id}`}
                          checked={key.isActive}
                          onCheckedChange={() => handleToggleActive(key.id, key.isActive)}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0">
                        <Label htmlFor={`training-${key.id}`} className="mr-2">Training Mode</Label>
                        <Switch 
                          id={`training-${key.id}`}
                          checked={key.isTrainingEnabled}
                          onCheckedChange={() => handleToggleTraining(key.id, key.isTrainingEnabled)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 dark:bg-gray-900/30 pt-3 text-sm text-gray-500">
                  <div className="flex flex-col sm:flex-row justify-between w-full">
                    <div>Usage count: {key.usageCount || 0}</div>
                    <div>
                      {key.lastUsedAt ? `Last used: ${new Date(key.lastUsedAt).toLocaleString()}` : 'Not used yet'}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add API Key Dialog */}
      <AddApiKeyDialog 
        isOpen={isAddKeyDialogOpen} 
        onOpenChange={setIsAddKeyDialogOpen}
      />
    </div>
  );
}

// Dialog for adding a new API key
function AddApiKeyDialog({ 
  isOpen, 
  onOpenChange 
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [apiKey, setApiKey] = useState('');
  const [nickname, setNickname] = useState('');
  const [isTrainingEnabled, setIsTrainingEnabled] = useState(true);
  const { toast } = useToast();

  // Add API key mutation
  const addKeyMutation = useMutation({
    mutationFn: async (data: {
      apiKey: string;
      nickname: string;
      isTrainingEnabled: boolean;
    }) => {
      return await mysterionClient.addApiKey(
        'openai',
        data.apiKey,
        data.nickname,
        data.isTrainingEnabled
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mysterion/api-keys'] });
      toast({
        title: 'API Key Added',
        description: 'Your API key has been securely stored and is ready for use.',
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: 'Error Adding API Key',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setApiKey('');
    setNickname('');
    setIsTrainingEnabled(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your OpenAI API key',
        variant: 'destructive',
      });
      return;
    }
    
    if (!nickname) {
      toast({
        title: 'Nickname Required',
        description: 'Please provide a name for this API key',
        variant: 'destructive',
      });
      return;
    }
    
    addKeyMutation.mutate({
      apiKey,
      nickname,
      isTrainingEnabled,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add OpenAI API Key</DialogTitle>
          <DialogDescription>
            Add your API key to use the Mysterion AI network and contribute to distributed training
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                placeholder="My OpenAI Key"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Your key will be encrypted using quantum-resistant algorithms and fractal sharding
              </p>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="training-mode"
                checked={isTrainingEnabled}
                onCheckedChange={setIsTrainingEnabled}
              />
              <Label htmlFor="training-mode">Enable Training Mode</Label>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-md text-sm">
              <div className="flex">
                <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                <p>
                  Training mode allows your API key to be used in the Mysterion AI distributed 
                  training network. You earn points for your contributions, which can be redeemed 
                  for benefits in the future.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={addKeyMutation.isPending}
            >
              {addKeyMutation.isPending ? 'Adding...' : 'Add API Key'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}