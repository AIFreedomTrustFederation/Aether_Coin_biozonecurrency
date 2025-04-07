import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Server, Database, Upload, HardDrive, RefreshCw, Check, ChevronRight, Cloud, Globe, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FilecoinStorageIntegration } from './FilecoinStorageIntegration';
import { ResourceAllocationFeedback } from './ResourceAllocationFeedback';
import { apiRequest } from '@/lib/queryClient';

// Form schema
const formSchema = z.object({
  domainRegistrationType: z.enum(['fractalcoin', 'trust', 'traditional']),
  domainName: z.string().min(3, 'Domain name must be at least 3 characters').optional(),
  customDomain: z.string().optional(),
  tld: z.string(),
  domainType: z.enum(['standard', 'premium', 'enterprise']),
  domainOwnership: z.enum(['personal', 'organization', 'project']),
  storageSize: z.number().min(50).max(10000),
  computeUnits: z.number().min(0.5).max(8),
  enableCDN: z.boolean(),
  enableDNS: z.boolean(),
  connectedWallet: z.boolean().default(false),
  walletAddress: z.string().optional(),
  redundancyLevel: z.enum(['low', 'medium', 'high']).default('medium'),
  networkAllocation: z.enum(['fractalcoin', 'filecoin', 'hybrid']).default('hybrid'),
  enableAutoscaling: z.boolean().default(true),
  description: z.string().optional(),
  backupFrequency: z.enum(['none', 'daily', 'weekly', 'monthly']).default('weekly'),
});

type FormValues = z.infer<typeof formSchema>;

interface ResourceMetrics {
  cpu: number;
  memory: number;
  storage: number;
  bandwidth: number;
  cost: number;
}

const calculateResourceMetrics = (formValues: FormValues): ResourceMetrics => {
  const { storageSize, domainType, enableCDN, redundancyLevel, computeUnits } = formValues;
  
  const baseCost = 0.005; // FCL per MB
  const baseMemory = 512; // MB
  const baseBandwidth = 50; // GB
  
  // Type multipliers
  const typeMultiplier = 
    domainType === 'premium' ? 1.5 : 
    domainType === 'enterprise' ? 2.5 : 1;
  
  // Redundancy multipliers
  const redundancyMultiplier = 
    redundancyLevel === 'high' ? 1.8 : 
    redundancyLevel === 'medium' ? 1.3 : 1;
  
  // CDN multiplier
  const cdnMultiplier = enableCDN ? 1.2 : 1;
  
  // Calculate metrics
  const storage = storageSize;
  const cpu = computeUnits;
  const memory = baseMemory * typeMultiplier * (computeUnits / 1);
  const bandwidth = baseBandwidth * typeMultiplier * cdnMultiplier;
  const cost = (storageSize * baseCost * typeMultiplier * redundancyMultiplier) + (computeUnits * 2);
  
  return {
    cpu,
    memory,
    storage,
    bandwidth,
    cost
  };
};

export function DomainHostingWizard() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resourceMetrics, setResourceMetrics] = useState<ResourceMetrics | null>(null);
  const [activeTab, setActiveTab] = useState('configure');
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [domainId, setDomainId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domainRegistrationType: 'fractalcoin',
      domainName: '',
      customDomain: '',
      tld: '.fractalcoin.web',
      domainType: 'standard',
      domainOwnership: 'personal',
      storageSize: 100,
      computeUnits: 1,
      enableCDN: false,
      enableDNS: false,
      connectedWallet: false,
      walletAddress: '',
      redundancyLevel: 'medium',
      networkAllocation: 'hybrid',
      enableAutoscaling: true,
      description: '',
      backupFrequency: 'weekly'
    }
  });
  
  // Update resource metrics when form values change
  useEffect(() => {
    const formValues = form.getValues();
    const metrics = calculateResourceMetrics(formValues);
    setResourceMetrics(metrics);
  }, [form.watch()]);
  
  // Domain registration mutation
  const registerDomainMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return apiRequest('/api/domain-hosting/domains', 'POST', {
        data: data,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/domain-hosting/domains'] });
      toast({
        title: 'Domain Registered',
        description: `Your domain has been successfully registered.`,
      });
      setDomainId(data.id);
      setRegistrationComplete(true);
      setStep(2);
    },
    onError: (error) => {
      toast({
        title: 'Registration Failed',
        description: 'Failed to register domain. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  });
  
  // Resource allocation mutation
  const allocateResourcesMutation = useMutation({
    mutationFn: async (data: { domainId: number, resources: any }) => {
      return apiRequest(`/api/domain-hosting/domains/${data.domainId}/resources`, 'POST', {
        data: data.resources
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domain-hosting/domains'] });
      toast({
        title: 'Resources Allocated',
        description: 'Resources have been successfully allocated to your domain.',
      });
      setStep(3);
    },
    onError: () => {
      toast({
        title: 'Resource Allocation Failed',
        description: 'Failed to allocate resources. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  });
  
  // Website upload mutation
  const uploadWebsiteMutation = useMutation({
    mutationFn: async ({ domainId, file }: { domainId: number; file: File }) => {
      const formData = new FormData();
      formData.append('websiteZip', file);
      
      return apiRequest(`/api/domain-hosting/domains/${domainId}/deploy`, 'POST', 
        { formData }, 
        {
          onUploadProgress: (event: ProgressEvent) => {
            if (event.total) {
              setUploadProgress(Math.round((event.loaded * 100) / event.total));
            }
          }
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/domain-hosting/domains'] });
      toast({
        title: 'Website Deployed',
        description: 'Your website has been successfully deployed.',
      });
      setStep(4);
    },
    onError: () => {
      toast({
        title: 'Deployment Failed',
        description: 'Failed to deploy website. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  });
  
  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);
    registerDomainMutation.mutate(data);
  };
  
  const handleAllocateResources = () => {
    if (!domainId) return;
    
    setIsSubmitting(true);
    const formValues = form.getValues();
    
    allocateResourcesMutation.mutate({
      domainId,
      resources: {
        storageSize: formValues.storageSize,
        computeUnits: formValues.computeUnits,
        enableCDN: formValues.enableCDN,
        redundancyLevel: formValues.redundancyLevel,
        networkAllocation: formValues.networkAllocation,
        enableAutoscaling: formValues.enableAutoscaling,
        backupFrequency: formValues.backupFrequency
      }
    });
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };
  
  const handleDeployWebsite = () => {
    if (!domainId || !selectedFile) return;
    
    setIsSubmitting(true);
    uploadWebsiteMutation.mutate({ domainId, file: selectedFile });
  };
  
  const handleStartNew = () => {
    setStep(1);
    setRegistrationComplete(false);
    setDomainId(null);
    setSelectedFile(null);
    setUploadProgress(0);
    form.reset();
  };
  
  // Format helpers
  const formatStorageSize = (value: number) => {
    if (value < 1000) {
      return `${value} MB`;
    } else {
      return `${(value / 1000).toFixed(1)} GB`;
    }
  };
  
  const formatMemory = (value: number) => {
    if (value < 1024) {
      return `${Math.round(value)} MB`;
    } else {
      return `${(value / 1024).toFixed(1)} GB`;
    }
  };
  
  const formatUrl = () => {
    const formValues = form.getValues();
    if (formValues.domainRegistrationType === 'traditional' && formValues.customDomain) {
      return `https://${formValues.customDomain}`;
    } else if (formValues.domainName) {
      return `https://${formValues.domainName}${formValues.tld}`;
    }
    return 'https://yourdomain.example';
  };
  
  const getDomainRegistryLabel = () => {
    const type = form.watch('domainRegistrationType');
    return type === 'fractalcoin' ? 'FractalCoin Web' 
      : type === 'trust' ? 'Web3 .Trust' 
      : 'Traditional Domain';
  };
  
  const getBackupFrequencyLabel = () => {
    const freq = form.watch('backupFrequency');
    return freq === 'none' ? 'No backups'
      : freq === 'daily' ? 'Daily backups'
      : freq === 'weekly' ? 'Weekly backups'
      : 'Monthly backups';
  };
  
  // Step 1: Domain Configuration
  const renderStep1 = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="configure">Configure Domain</TabsTrigger>
            <TabsTrigger value="preview">Resource Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="configure" className="space-y-6">
            {/* Domain Registry Type */}
            <FormField
              control={form.control}
              name="domainRegistrationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain Registry Type</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div 
                        className={`border rounded-md p-3 cursor-pointer flex flex-col items-center text-center hover:border-primary/50 ${field.value === 'fractalcoin' ? 'bg-primary/5 border-primary' : ''}`}
                        onClick={() => {
                          field.onChange('fractalcoin');
                          form.setValue('tld', '.fractalcoin.web');
                        }}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                          <HardDrive className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-medium">FractalCoin Web</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Native domains on the FractalCoin network
                        </p>
                      </div>
                      
                      <div 
                        className={`border rounded-md p-3 cursor-pointer flex flex-col items-center text-center hover:border-primary/50 ${field.value === 'trust' ? 'bg-primary/5 border-primary' : ''}`}
                        onClick={() => {
                          field.onChange('trust');
                          form.setValue('tld', '.trust');
                        }}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-medium">Web3 .Trust</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Web3 domains linked to your wallet
                        </p>
                      </div>
                      
                      <div 
                        className={`border rounded-md p-3 cursor-pointer flex flex-col items-center text-center hover:border-primary/50 ${field.value === 'traditional' ? 'bg-primary/5 border-primary' : ''}`}
                        onClick={() => {
                          field.onChange('traditional');
                          form.setValue('tld', '');
                        }}
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                          <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="font-medium">Traditional Domain</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Register or connect existing domains
                        </p>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    {field.value === 'fractalcoin' && 'Register a domain on the FractalCoin-Filecoin network'}
                    {field.value === 'trust' && 'Create a .trust domain connected to your wallet'}
                    {field.value === 'traditional' && 'Register or connect traditional domains like .com, .org, etc.'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Domain Name */}
            {form.watch('domainRegistrationType') === 'traditional' ? (
              <FormField
                control={form.control}
                name="customDomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Domain</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="example.com" />
                    </FormControl>
                    <FormDescription>
                      Enter your existing domain or search for a new one to register
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="domainName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain Name</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input {...field} placeholder="yourdomain" className="rounded-r-none" />
                        <div className="bg-muted px-3 py-2 rounded-r-md border border-l-0 border-input">
                          {form.watch('tld')}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your domain will be accessible at {field.value || 'yourdomain'}{form.watch('tld')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Domain Type and Ownership */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="domainType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Tier</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {field.value === 'standard' && 'Basic features, suitable for personal websites'}
                      {field.value === 'premium' && 'Enhanced performance, ideal for business sites'}
                      {field.value === 'enterprise' && 'Maximum performance, for high-traffic applications'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="domainOwnership"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ownership Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ownership type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="organization">Organization</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Categorizes your domain for analytics and permissions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Resource Allocation */}
            <div className="space-y-6">
              <h3 className="text-base font-medium">Resource Allocation</h3>
              
              <FormField
                control={form.control}
                name="storageSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage Allocation: {formatStorageSize(field.value)}</FormLabel>
                    <FormControl>
                      <Slider
                        min={50}
                        max={10000}
                        step={50}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Storage space for your website and content
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="computeUnits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compute Resources: {field.value} vCPUs</FormLabel>
                    <FormControl>
                      <Slider
                        min={0.5}
                        max={8}
                        step={0.5}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Processing power for your application
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="redundancyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Redundancy</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select redundancy level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low (1x)</SelectItem>
                          <SelectItem value="medium">Medium (2x)</SelectItem>
                          <SelectItem value="high">High (3x)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determines how many copies of your data are stored
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="backupFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Backup Frequency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select backup frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No backups</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How often your data is backed up across the network
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="networkAllocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Network Allocation</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div 
                          className={`border rounded-md p-3 cursor-pointer flex flex-col items-center text-center hover:border-primary/50 ${field.value === 'fractalcoin' ? 'bg-primary/5 border-primary' : ''}`}
                          onClick={() => field.onChange('fractalcoin')}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                            <HardDrive className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-medium">FractalCoin</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Optimized for performance
                          </p>
                        </div>
                        
                        <div 
                          className={`border rounded-md p-3 cursor-pointer flex flex-col items-center text-center hover:border-primary/50 ${field.value === 'filecoin' ? 'bg-primary/5 border-primary' : ''}`}
                          onClick={() => field.onChange('filecoin')}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                            <Database className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-medium">Filecoin</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Optimized for cost-efficiency
                          </p>
                        </div>
                        
                        <div 
                          className={`border rounded-md p-3 cursor-pointer flex flex-col items-center text-center hover:border-primary/50 ${field.value === 'hybrid' ? 'bg-primary/5 border-primary' : ''}`}
                          onClick={() => field.onChange('hybrid')}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                            <RefreshCw className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-medium">Hybrid</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Balance of performance and cost
                          </p>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Determines how resources are distributed between networks
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Additional Options */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">Additional Options</h3>
              
              <FormField
                control={form.control}
                name="enableCDN"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable FractalCDN</FormLabel>
                      <FormDescription>
                        Improves performance by distributing your content across multiple nodes
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {(form.watch('domainRegistrationType') === 'traditional' || form.watch('domainRegistrationType') === 'trust') && (
                <FormField
                  control={form.control}
                  name="enableDNS"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable DNS Management</FormLabel>
                        <FormDescription>
                          Manage DNS records directly from the Trust Portal
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="enableAutoscaling"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Auto-scaling</FormLabel>
                      <FormDescription>
                        Automatically adjust resources based on demand
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch('domainRegistrationType') === 'trust' && (
                <FormField
                  control={form.control}
                  name="connectedWallet"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Connect to Wallet</FormLabel>
                        <FormDescription>
                          Link this domain to your Web3 wallet for verification
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              // Here you would normally trigger wallet connection
                              // For now, we'll just set a placeholder address
                              form.setValue('walletAddress', '0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
                            } else {
                              form.setValue('walletAddress', '');
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            {/* Optional Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Describe your website or project" />
                  </FormControl>
                  <FormDescription>
                    Helps you identify this domain in your dashboard
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="space-y-6">
              {/* Visual Resource Allocation Preview */}
              <div className="rounded-lg border p-6 space-y-6">
                <h3 className="text-lg font-medium">Resource Allocation Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Domain Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">URL:</dt>
                          <dd className="font-medium">{formatUrl()}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Registry Type:</dt>
                          <dd className="font-medium">{getDomainRegistryLabel()}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Service Tier:</dt>
                          <dd className="font-medium capitalize">{form.watch('domainType')}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Ownership:</dt>
                          <dd className="font-medium capitalize">{form.watch('domainOwnership')}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Network Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Network:</dt>
                          <dd className="font-medium capitalize">{form.watch('networkAllocation')}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">CDN:</dt>
                          <dd className="font-medium">{form.watch('enableCDN') ? 'Enabled' : 'Disabled'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Auto-scaling:</dt>
                          <dd className="font-medium">{form.watch('enableAutoscaling') ? 'Enabled' : 'Disabled'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Data Redundancy:</dt>
                          <dd className="font-medium capitalize">{form.watch('redundancyLevel')}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-base font-medium">Resource Metrics</h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Storage</p>
                      <p className="text-lg font-bold">{formatStorageSize(form.watch('storageSize'))}</p>
                    </div>
                    
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Compute</p>
                      <p className="text-lg font-bold">{form.watch('computeUnits')} vCPUs</p>
                    </div>
                    
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Memory</p>
                      <p className="text-lg font-bold">
                        {resourceMetrics ? formatMemory(resourceMetrics.memory) : '512 MB'}
                      </p>
                    </div>
                    
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Bandwidth</p>
                      <p className="text-lg font-bold">
                        {resourceMetrics ? `${resourceMetrics.bandwidth} GB` : '50 GB'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="rounded-lg bg-primary/5 p-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Estimated Monthly Cost:</span>
                      <span className="font-bold">
                        {resourceMetrics ? `${resourceMetrics.cost.toFixed(4)} FCL` : '0.5000 FCL'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-base font-medium">Additional Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {form.watch('enableCDN') && (
                      <Badge variant="secondary">FractalCDN</Badge>
                    )}
                    {form.watch('enableDNS') && (
                      <Badge variant="secondary">DNS Management</Badge>
                    )}
                    {form.watch('connectedWallet') && (
                      <Badge variant="secondary">Wallet Connected</Badge>
                    )}
                    {form.watch('enableAutoscaling') && (
                      <Badge variant="secondary">Auto-scaling</Badge>
                    )}
                    <Badge variant="secondary">{getBackupFrequencyLabel()}</Badge>
                    <Badge variant="secondary">
                      {form.watch('redundancyLevel') === 'high' ? 'High Redundancy' : 
                       form.watch('redundancyLevel') === 'medium' ? 'Medium Redundancy' : 'Low Redundancy'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Network Visualization */}
              <div className="rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-4">FractalCoin-Filecoin Integration</h3>
                <FilecoinStorageIntegration
                  allocatedStorage={form.watch('storageSize')}
                  usedStorage={0}
                  nodeCount={form.watch('redundancyLevel') === 'high' ? 5 : form.watch('redundancyLevel') === 'medium' ? 3 : 1}
                  status="allocating"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="pt-2">
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering Domain...
              </>
            ) : 'Register Domain'}
          </Button>
        </div>
      </form>
    </Form>
  );
  
  // Step 2: Resource Allocation
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="rounded-lg border p-6">
        <div className="flex items-center mb-4">
          <Check className="h-6 w-6 text-green-500 mr-2" />
          <h3 className="text-lg font-medium">Domain Registration Complete</h3>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Your domain has been successfully registered. Now, let's allocate resources to your domain.
        </p>
        
        <ResourceAllocationFeedback 
          domainId={domainId || 1}
          onAllocate={handleAllocateResources}
        />
      </div>
    </div>
  );
  
  // Step 3: Upload Website
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="rounded-lg border p-6">
        <div className="flex items-center mb-4">
          <Check className="h-6 w-6 text-green-500 mr-2" />
          <h3 className="text-lg font-medium">Resources Allocated Successfully</h3>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Resources have been allocated to your domain. Now, upload your website files.
        </p>
        
        <div className="space-y-4">
          <p className="text-sm">
            Upload a zip file containing your website files. The root of the zip file will be the root of your website.
          </p>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop your zip file here, or click to browse
            </p>
            <Input
              id="website-file"
              type="file"
              accept=".zip"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('website-file')?.click()}
            >
              Select Zip File
            </Button>
            {selectedFile && (
              <p className="mt-2 text-sm">Selected: {selectedFile.name}</p>
            )}
          </div>
        </div>
        
        <Button
          onClick={handleDeployWebsite}
          className="w-full mt-4"
          disabled={isSubmitting || !selectedFile}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deploying... ({uploadProgress}%)
            </>
          ) : 'Deploy Website'}
        </Button>
      </div>
    </div>
  );
  
  // Step 4: Deployment Complete
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="rounded-lg border p-6 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-medium">Website Deployed Successfully!</h3>
        </div>
        
        <p className="text-muted-foreground mb-6">
          {form.watch('domainRegistrationType') === 'fractalcoin' 
            ? 'Your website has been deployed to the FractalCoin-Filecoin network.'
            : form.watch('domainRegistrationType') === 'trust'
              ? 'Your website has been deployed to the .trust Web3 network.'
              : 'Your website has been deployed successfully.'}
        </p>
        
        <div className="py-4">
          <span className="px-4 py-2 bg-primary/10 rounded-lg text-primary font-medium">
            {formatUrl()}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground mt-4 mb-6">
          It may take a few moments for your website to propagate across the network.
        </p>
        
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            onClick={() => {
              window.open(formatUrl(), '_blank');
            }}
          >
            Visit Website
          </Button>
          <Button
            variant="secondary"
            onClick={handleStartNew}
          >
            Register Another Domain
          </Button>
        </div>
      </div>
    </div>
  );
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>FractalCoin-Filecoin Web Domain Hosting</CardTitle>
        <CardDescription>
          Create and manage your decentralized web presence
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <span className="text-xs mt-1">Configure</span>
            </div>
            
            <div className="w-full h-[2px] bg-muted mx-2 relative">
              <div className={`absolute top-0 left-0 h-full bg-primary transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="text-xs mt-1">Resources</span>
            </div>
            
            <div className="w-full h-[2px] bg-muted mx-2 relative">
              <div className={`absolute top-0 left-0 h-full bg-primary transition-all duration-300 ${step >= 3 ? 'w-full' : 'w-0'}`}></div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                3
              </div>
              <span className="text-xs mt-1">Upload</span>
            </div>
            
            <div className="w-full h-[2px] bg-muted mx-2 relative">
              <div className={`absolute top-0 left-0 h-full bg-primary transition-all duration-300 ${step >= 4 ? 'w-full' : 'w-0'}`}></div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                4
              </div>
              <span className="text-xs mt-1">Complete</span>
            </div>
          </div>
        </div>
        
        {/* Step Content */}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          {form.watch('domainRegistrationType') === 'traditional' 
            ? 'Powered by the FractalCDN Network with Traditional DNS Integration'
            : form.watch('domainRegistrationType') === 'trust'
              ? 'Powered by the FractalCoin-Web3 Bridge with Wallet Verification'
              : 'Powered by the FractalCoin-Filecoin Bridge'}
        </p>
        <p className="text-xs text-muted-foreground">
          {step} of 4
        </p>
      </CardFooter>
    </Card>
  );
}