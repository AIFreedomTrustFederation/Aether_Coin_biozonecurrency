import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { apiRequest } from '../../lib/queryClient';

// Define the domain reservation form schema
const domainFormSchema = z.object({
  domainRegistrationType: z.enum(['fractalcoin', 'trust', 'traditional']),
  domainName: z
    .string()
    .min(3, { message: 'Domain name must be at least 3 characters' })
    .max(63, { message: 'Domain name must be less than 63 characters' })
    .regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/, {
      message: 'Domain name must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen',
    }),
  customDomain: z.string().optional(),
  tld: z.string().default('.fractalcoin.web'),
  domainType: z.enum(['standard', 'premium', 'enterprise']),
  domainOwnership: z.enum(['personal', 'organization', 'project']),
  storageSize: z.number().min(50).max(10000),
  enableCDN: z.boolean().default(false),
  enableDNS: z.boolean().default(false),
  connectWallet: z.boolean().default(false),
  walletAddress: z.string().optional(),
  description: z.string().optional(),
});

type DomainFormValues = z.infer<typeof domainFormSchema>;

export default function DomainHostingForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const form = useForm<DomainFormValues>({
    resolver: zodResolver(domainFormSchema),
    defaultValues: {
      domainRegistrationType: 'fractalcoin',
      domainName: '',
      customDomain: '',
      tld: '.fractalcoin.web',
      domainType: 'standard',
      domainOwnership: 'personal',
      storageSize: 100,
      enableCDN: false,
      enableDNS: false,
      connectWallet: false,
      walletAddress: '',
      description: '',
    },
  });
  
  // Create domain mutation
  const createDomainMutation = useMutation({
    mutationFn: async (data: DomainFormValues) => {
      return apiRequest('/api/domain-hosting/domains', 'POST', {
        data: data,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/domain-hosting/domains'] });
      toast({
        title: 'Domain Reserved',
        description: `Your domain ${data.domainName} has been successfully reserved.`,
      });
      setStep(2);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to reserve domain. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Allocate storage mutation
  const allocateStorageMutation = useMutation({
    mutationFn: async ({ domainId, storageSize }: { domainId: number; storageSize: number }) => {
      return apiRequest(`/api/domain-hosting/domains/${domainId}/allocate`, 'POST', {
        data: { storageSize },
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/domain-hosting/domains'] });
      toast({
        title: 'Storage Allocated',
        description: `Storage has been successfully allocated to your domain.`,
      });
      setStep(3);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to allocate storage. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Upload website mutation
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/domain-hosting/domains'] });
      toast({
        title: 'Website Deployed',
        description: `Your website has been successfully deployed to your domain.`,
      });
      setStep(4);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to deploy website. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };
  
  const onSubmit = (data: DomainFormValues) => {
    createDomainMutation.mutate(data);
  };
  
  const allocateStorage = (domainId: number) => {
    const storageSize = form.getValues('storageSize');
    allocateStorageMutation.mutate({ domainId, storageSize });
  };
  
  const uploadWebsite = (domainId: number) => {
    if (selectedFile) {
      uploadWebsiteMutation.mutate({ domainId, file: selectedFile });
    } else {
      toast({
        title: 'Error',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
    }
  };
  
  const formatStorageSize = (value: number) => {
    if (value < 1000) {
      return `${value} MB`;
    } else {
      return `${(value / 1000).toFixed(1)} GB`;
    }
  };
  
  const calculateEstimatedCost = (storageSize: number, domainType: string) => {
    const baseRate = 0.005; // FCL per MB per month
    let multiplier = 1;
    
    switch (domainType) {
      case 'premium':
        multiplier = 1.5;
        break;
      case 'enterprise':
        multiplier = 2;
        break;
      default:
        multiplier = 1;
    }
    
    const monthlyCost = storageSize * baseRate * multiplier;
    return monthlyCost.toFixed(4);
  };
  
  // Determine the current domain ID (would come from API in real implementation)
  const currentDomainId = 1; // Placeholder
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>FractalCoin-Filecoin Web Domain Hosting</CardTitle>
        <CardDescription>
          Reserve a domain and deploy your website on the decentralized FractalCoin-Filecoin network
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                            <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
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
                            <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
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
                            <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M20 7L12 12L4 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <h3 className="font-medium">Traditional Domain</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            Register or connect existing domains
                          </p>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {field.value === 'fractalcoin' && 'Register a domain on the FractalCoin Web3 network'}
                      {field.value === 'trust' && 'Create a .trust domain connected to your wallet'}
                      {field.value === 'traditional' && 'Register or connect traditional domains like .com, .org, etc.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="domainType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select domain type" />
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
                        defaultValue={field.value}
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
                        defaultValue={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Estimated cost: {calculateEstimatedCost(field.value, form.watch('domainType'))} FCL per month
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-4">
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
                
                {form.watch('domainRegistrationType') === 'trust' && (
                  <FormField
                    control={form.control}
                    name="connectWallet"
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
                
                {form.watch('connectWallet') && form.watch('walletAddress') && (
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <h3 className="text-sm font-medium">Wallet Connected</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 truncate">
                      {form.watch('walletAddress')}
                    </p>
                  </div>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Brief description of your domain" />
                    </FormControl>
                    <FormDescription>
                      This helps with organization and is visible in the Trust Portal
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={createDomainMutation.isPending}
              >
                {createDomainMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reserving Domain...
                  </>
                ) : 'Reserve Domain'}
              </Button>
            </form>
          </Form>
        )}
        
        {step === 2 && (
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-2">Domain Reserved Successfully</h3>
              <p className="text-muted-foreground mb-4">
                Your domain has been reserved. Now, let's allocate storage for your website.
              </p>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Domain Name:</span>
                  <span className="font-medium">
                    {form.getValues('domainRegistrationType') === 'traditional' 
                      ? form.getValues('customDomain')
                      : `${form.getValues('domainName')}${form.getValues('tld')}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Registry Type:</span>
                  <span className="font-medium">
                    {form.getValues('domainRegistrationType') === 'fractalcoin' 
                      ? 'FractalCoin Web' 
                      : form.getValues('domainRegistrationType') === 'trust' 
                        ? 'Web3 .Trust' 
                        : 'Traditional Domain'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service Tier:</span>
                  <span className="font-medium">{form.getValues('domainType')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage Size:</span>
                  <span className="font-medium">{formatStorageSize(form.getValues('storageSize'))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Cost:</span>
                  <span className="font-medium">
                    {calculateEstimatedCost(form.getValues('storageSize'), form.getValues('domainType'))} FCL per month
                  </span>
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => allocateStorage(currentDomainId)}
              className="w-full"
              disabled={allocateStorageMutation.isPending}
            >
              {allocateStorageMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Allocating Storage...
                </>
              ) : 'Allocate Storage'}
            </Button>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-medium mb-2">Storage Allocated Successfully</h3>
              <p className="text-muted-foreground mb-4">
                Storage has been allocated for your domain. Now, upload your website files.
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
            </div>
            
            <Button
              onClick={() => uploadWebsite(currentDomainId)}
              className="w-full"
              disabled={uploadWebsiteMutation.isPending || !selectedFile}
            >
              {uploadWebsiteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading... ({uploadProgress}%)
                </>
              ) : 'Deploy Website'}
            </Button>
          </div>
        )}
        
        {step === 4 && (
          <div className="space-y-6">
            <div className="rounded-lg border p-4 text-center">
              <h3 className="text-lg font-medium mb-2">Website Deployed Successfully!</h3>
              <p className="text-muted-foreground mb-4">
                {form.getValues('domainRegistrationType') === 'fractalcoin' 
                  ? 'Your website has been deployed to the FractalCoin Web network.'
                  : form.getValues('domainRegistrationType') === 'trust'
                    ? 'Your website has been deployed to the .trust Web3 network.'
                    : 'Your website has been deployed successfully.'}
              </p>
              <div className="py-4">
                <span className="px-4 py-2 bg-primary/10 rounded-lg text-primary font-medium">
                  {form.getValues('domainRegistrationType') === 'traditional' 
                    ? `https://${form.getValues('customDomain')}` 
                    : `https://${form.getValues('domainName')}${form.getValues('tld')}`}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                It may take a few moments for your website to propagate across the network.
              </p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                onClick={() => {
                  const url = form.getValues('domainRegistrationType') === 'traditional'
                    ? `https://${form.getValues('customDomain')}`
                    : `https://${form.getValues('domainName')}${form.getValues('tld')}`;
                  window.open(url, '_blank');
                }}
              >
                Visit Website
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  form.reset({
                    domainRegistrationType: 'fractalcoin',
                    domainName: '',
                    customDomain: '',
                    tld: '.fractalcoin.web',
                    domainType: 'standard',
                    domainOwnership: 'personal',
                    storageSize: 100,
                    enableCDN: false,
                    enableDNS: false,
                    connectWallet: false,
                    walletAddress: '',
                    description: '',
                  });
                  setSelectedFile(null);
                  setUploadProgress(0);
                  setStep(1);
                }}
              >
                Register Another Domain
              </Button>
            </div>
          </div>
        )}
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