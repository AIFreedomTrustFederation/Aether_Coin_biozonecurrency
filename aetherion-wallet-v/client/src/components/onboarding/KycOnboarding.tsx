/**
 * KycOnboarding.tsx
 * 
 * Onboarding component that guides users through Know Your Customer (KYC) verification
 * and connecting various wallet types (crypto wallets and bank accounts) with the platform.
 * Uses quantum-resistant fractal storage for security.
 */

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, ChevronRight, CreditCard, Shield, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import { walletConnector, WalletType, ConnectedWallet } from '../../core/wallet/WalletConnector';
import { plaidConnector, KycVerification } from '../../core/plaid/PlaidConnector';

// Schema for personal information form
const personalInfoSchema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Please enter a valid date in YYYY-MM-DD format' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters' }),
  city: z.string().min(2, { message: 'City must be at least 2 characters' }),
  country: z.string().min(2, { message: 'Country must be at least 2 characters' }),
  postalCode: z.string().min(3, { message: 'Postal code must be at least 3 characters' }),
  phoneNumber: z.string().min(8, { message: 'Phone number must be at least 8 characters' }),
  ssn: z.string().optional(),
});

// Type for personal info form values
type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

// Schema for wallet connection form
const walletConnectionSchema = z.object({
  walletType: z.enum(['bitcoin', 'ethereum', 'coinbase', 'plaid']),
});

// Type for wallet connection form values
type WalletConnectionFormValues = z.infer<typeof walletConnectionSchema>;

// Main component for KYC Onboarding
export default function KycOnboarding() {
  const [step, setStep] = useState<'personal-info' | 'wallets' | 'verification' | 'complete'>('personal-info');
  const [selectedWalletType, setSelectedWalletType] = useState<WalletType>('ethereum');
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [kycVerification, setKycVerification] = useState<KycVerification | undefined>(undefined);
  const [masterPassword, setMasterPassword] = useState<string>('');
  const [fractalCoinBalance, setFractalCoinBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form for personal information
  const personalInfoForm = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: '',
      email: '',
      dateOfBirth: '',
      address: '',
      city: '',
      country: '',
      postalCode: '',
      phoneNumber: '',
      ssn: '',
    },
  });

  // Form for wallet connection
  const walletConnectionForm = useForm<WalletConnectionFormValues>({
    resolver: zodResolver(walletConnectionSchema),
    defaultValues: {
      walletType: 'ethereum',
    },
  });

  // Initialize wallet connector when master password is set
  useEffect(() => {
    if (masterPassword) {
      try {
        walletConnector.initialize(masterPassword);
        
        // Set up listener for wallet connected events
        walletConnector.onWalletConnected(wallet => {
          setConnectedWallets(prev => [...prev.filter(w => w.id !== wallet.id), wallet]);
          
          toast({
            title: 'Wallet Connected',
            description: `Successfully connected ${wallet.name}`,
          });
          
          // Update FractalCoin balance
          setFractalCoinBalance(walletConnector.getFractalCoinBalance());
        });
        
        // Set up listener for wallet disconnected events
        walletConnector.onWalletDisconnected(walletId => {
          setConnectedWallets(prev => prev.filter(w => w.id !== walletId));
          
          toast({
            title: 'Wallet Disconnected',
            description: 'Wallet has been disconnected',
          });
          
          // Update FractalCoin balance
          setFractalCoinBalance(walletConnector.getFractalCoinBalance());
        });
        
        // Load existing wallets
        setConnectedWallets(walletConnector.getConnectedWallets());
        setFractalCoinBalance(walletConnector.getFractalCoinBalance());
      } catch (error) {
        console.error('Error initializing wallet connector:', error);
        toast({
          title: 'Initialization Error',
          description: 'Failed to initialize secure storage',
          variant: 'destructive',
        });
      }
    }
  }, [masterPassword, toast]);

  // Handler for personal info form submission
  const onPersonalInfoSubmit = async (data: PersonalInfoFormValues) => {
    setIsLoading(true);
    
    try {
      // Generate a master password for the user
      // In a real app, this would be handled more securely
      const generatedPassword = `${data.fullName.replace(/\s+/g, '-')}-${Date.now()}`;
      setMasterPassword(generatedPassword);
      
      // Initialize wallet connector and plaid connector
      walletConnector.initialize(generatedPassword);
      plaidConnector.initialize();
      
      // Initiate KYC verification process
      const userId = `user-${Date.now()}`;
      const verificationId = await plaidConnector.initiateKycVerification(userId, 'none');
      
      // Submit KYC information to verification service
      const verification = await plaidConnector.submitKycInformation(verificationId, {
        fullName: data.fullName,
        address: `${data.address}, ${data.city}, ${data.country}, ${data.postalCode}`,
        dateOfBirth: data.dateOfBirth,
        socialSecurityNumber: data.ssn,
      });
      
      setKycVerification(verification);
      
      // Move to next step
      setStep('wallets');
      
      toast({
        title: 'Identity Verified',
        description: 'Your personal information has been securely verified',
      });
    } catch (error) {
      console.error('Error in personal info submission:', error);
      toast({
        title: 'Verification Error',
        description: 'Failed to verify your information. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for wallet connection
  const onConnectWallet = async () => {
    setIsLoading(true);
    
    try {
      let wallet: ConnectedWallet;
      
      // Connect to the selected wallet type
      switch (selectedWalletType) {
        case 'ethereum':
          wallet = await walletConnector.connectEthereumWallet();
          break;
        case 'bitcoin':
          wallet = await walletConnector.connectBitcoinWallet();
          break;
        case 'coinbase':
          wallet = await walletConnector.connectCoinbaseWallet();
          break;
        case 'plaid':
          wallet = await walletConnector.connectPlaidBankAccount();
          break;
        default:
          throw new Error('Invalid wallet type');
      }
      
      toast({
        title: 'Wallet Connected',
        description: `Successfully connected ${wallet.name}`,
      });
      
      // Update connected wallets list
      setConnectedWallets(prev => [...prev.filter(w => w.id !== wallet.id), wallet]);
      
      // Update FractalCoin balance
      setFractalCoinBalance(walletConnector.getFractalCoinBalance());
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect wallet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to disconnect a wallet
  const disconnectWallet = (walletId: string) => {
    walletConnector.disconnectWallet(walletId);
    setConnectedWallets(prev => prev.filter(w => w.id !== walletId));
    
    toast({
      title: 'Wallet Disconnected',
      description: 'Wallet has been disconnected',
    });
  };

  // Handler for wallet type selection
  const toggleWalletType = (type: WalletType) => {
    setSelectedWalletType(type);
    walletConnectionForm.setValue('walletType', type);
  };

  // Handler for completing the onboarding process
  const completeOnboarding = () => {
    setStep('complete');
    
    toast({
      title: 'Onboarding Complete',
      description: 'You have successfully completed the KYC verification and wallet connection process',
    });
  };

  // Complete the verification step
  const completeVerification = () => {
    if (connectedWallets.length === 0) {
      toast({
        title: 'Connection Required',
        description: 'Please connect at least one wallet to continue',
        variant: 'destructive',
      });
      return;
    }
    
    setStep('verification');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Aetherion Secure Onboarding</h1>
        <p className="text-muted-foreground mt-2">
          Complete your profile verification and connect your wallets with quantum-resistant security
        </p>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'personal-info' || step === 'wallets' || step === 'verification' || step === 'complete' 
                ? 'bg-primary text-white' 
                : 'bg-muted text-muted-foreground'
            }`}>
              1
            </div>
            <span className="mt-2 text-sm font-medium">Identity</span>
          </div>
          
          <div className="h-1 flex-1 mx-4 bg-muted">
            <div className={`h-full bg-primary ${
              step === 'wallets' || step === 'verification' || step === 'complete' ? 'w-full' : 'w-0'
            } transition-all duration-300`}></div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'wallets' || step === 'verification' || step === 'complete' 
                ? 'bg-primary text-white' 
                : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <span className="mt-2 text-sm font-medium">Wallets</span>
          </div>
          
          <div className="h-1 flex-1 mx-4 bg-muted">
            <div className={`h-full bg-primary ${
              step === 'verification' || step === 'complete' ? 'w-full' : 'w-0'
            } transition-all duration-300`}></div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'verification' || step === 'complete' 
                ? 'bg-primary text-white' 
                : 'bg-muted text-muted-foreground'
            }`}>
              3
            </div>
            <span className="mt-2 text-sm font-medium">Verify</span>
          </div>
          
          <div className="h-1 flex-1 mx-4 bg-muted">
            <div className={`h-full bg-primary ${
              step === 'complete' ? 'w-full' : 'w-0'
            } transition-all duration-300`}></div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step === 'complete' 
                ? 'bg-primary text-white' 
                : 'bg-muted text-muted-foreground'
            }`}>
              4
            </div>
            <span className="mt-2 text-sm font-medium">Complete</span>
          </div>
        </div>
      </div>
      
      {/* Personal Information Step */}
      {step === 'personal-info' && (
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Please provide your personal details for KYC verification. All information is stored with quantum-resistant encryption.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...personalInfoForm}>
              <form onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={personalInfoForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={personalInfoForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={personalInfoForm.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={personalInfoForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={personalInfoForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={personalInfoForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={personalInfoForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={personalInfoForm.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={personalInfoForm.control}
                  name="ssn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social Security Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="XXX-XX-XXXX" {...field} />
                      </FormControl>
                      <FormDescription>
                        Providing your SSN is optional but can help expedite the verification process.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Verifying...' : 'Continue'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
      
      {/* Wallet Connection Step */}
      {step === 'wallets' && (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Wallets</CardTitle>
            <CardDescription>
              Connect your cryptocurrency wallets and bank accounts to your profile. All connections are secured with quantum-resistant storage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Connected Wallets</h3>
              {connectedWallets.length === 0 ? (
                <div className="p-4 border rounded-md bg-muted/10 text-center">
                  <p className="text-muted-foreground">No wallets connected yet. Connect your first wallet below.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {connectedWallets.map(wallet => (
                    <div key={wallet.id} className="p-4 border rounded-md flex justify-between items-center">
                      <div>
                        <div className="font-medium">{wallet.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {wallet.type === 'plaid' ? 'Bank Account' : wallet.address?.substring(0, 10) + '...'}
                          {wallet.balance && ` • Balance: ${wallet.balance}`}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => disconnectWallet(wallet.id)}>
                        Disconnect
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <Separator className="my-6" />
            
            <h3 className="text-lg font-medium mb-4">Add a New Wallet</h3>
            
            <Form {...walletConnectionForm}>
              <form className="space-y-6">
                <FormField
                  control={walletConnectionForm.control}
                  name="walletType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Type</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div
                          className={`border rounded-md p-4 cursor-pointer transition-colors ${
                            selectedWalletType === 'ethereum' ? 'border-primary bg-primary/5' : 'border-muted'
                          }`}
                          onClick={() => toggleWalletType('ethereum')}
                        >
                          <div className="flex flex-col items-center text-center">
                            <Wallet className="h-6 w-6 mb-2" />
                            <span className="text-sm font-medium">Ethereum</span>
                          </div>
                        </div>
                        
                        <div
                          className={`border rounded-md p-4 cursor-pointer transition-colors ${
                            selectedWalletType === 'bitcoin' ? 'border-primary bg-primary/5' : 'border-muted'
                          }`}
                          onClick={() => toggleWalletType('bitcoin')}
                        >
                          <div className="flex flex-col items-center text-center">
                            <Wallet className="h-6 w-6 mb-2" />
                            <span className="text-sm font-medium">Bitcoin</span>
                          </div>
                        </div>
                        
                        <div
                          className={`border rounded-md p-4 cursor-pointer transition-colors ${
                            selectedWalletType === 'coinbase' ? 'border-primary bg-primary/5' : 'border-muted'
                          }`}
                          onClick={() => toggleWalletType('coinbase')}
                        >
                          <div className="flex flex-col items-center text-center">
                            <Wallet className="h-6 w-6 mb-2" />
                            <span className="text-sm font-medium">Coinbase</span>
                          </div>
                        </div>
                        
                        <div
                          className={`border rounded-md p-4 cursor-pointer transition-colors ${
                            selectedWalletType === 'plaid' ? 'border-primary bg-primary/5' : 'border-muted'
                          }`}
                          onClick={() => toggleWalletType('plaid')}
                        >
                          <div className="flex flex-col items-center text-center">
                            <CreditCard className="h-6 w-6 mb-2" />
                            <span className="text-sm font-medium">Bank</span>
                          </div>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => completeVerification()}>
                    Skip
                  </Button>
                  <Button type="button" onClick={onConnectWallet} disabled={isLoading}>
                    {isLoading ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                </div>
              </form>
            </Form>
            
            {fractalCoinBalance > 0 && (
              <div className="mt-6 p-4 border rounded-md bg-primary/5">
                <h4 className="font-medium mb-1 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  FractalCoin Rewards
                </h4>
                <p className="text-sm text-muted-foreground">
                  You've earned {fractalCoinBalance.toFixed(2)} FractalCoins for your quantum-secured storage contributions.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex justify-end w-full">
              <Button onClick={completeVerification}>
                Continue to Verification
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
      
      {/* Verification Review Step */}
      {step === 'verification' && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Summary</CardTitle>
            <CardDescription>
              Review your identity verification and connected wallets before completing the onboarding process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="identity">
              <TabsList className="mb-4">
                <TabsTrigger value="identity">Identity Verification</TabsTrigger>
                <TabsTrigger value="wallets">Connected Wallets</TabsTrigger>
                <TabsTrigger value="security">Security Status</TabsTrigger>
              </TabsList>
              
              <TabsContent value="identity">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      kycVerification?.identityVerified ? 'bg-green-500' : 'bg-amber-500'
                    } text-white`}>
                      {kycVerification?.identityVerified ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-medium">Identity Verification</h4>
                      <p className="text-sm text-muted-foreground">
                        {kycVerification?.identityVerified ? 'Verified' : 'Pending verification'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      kycVerification?.addressVerified ? 'bg-green-500' : 'bg-amber-500'
                    } text-white`}>
                      {kycVerification?.addressVerified ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-medium">Address Verification</h4>
                      <p className="text-sm text-muted-foreground">
                        {kycVerification?.addressVerified ? 'Verified' : 'Pending verification'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      kycVerification?.documentVerified ? 'bg-green-500' : 'bg-amber-500'
                    } text-white`}>
                      {kycVerification?.documentVerified ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="font-medium">Document Verification</h4>
                      <p className="text-sm text-muted-foreground">
                        {kycVerification?.documentVerified ? 'Verified' : 'Pending verification'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-md bg-muted/10 mt-4">
                    <h4 className="font-medium mb-1">KYC Level</h4>
                    <p className="text-sm text-muted-foreground">
                      Your account has been verified at the <span className="font-medium">{kycVerification?.kycLevel || 'basic'}</span> level.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="wallets">
                <div className="space-y-4">
                  {connectedWallets.length === 0 ? (
                    <div className="p-4 border rounded-md bg-muted/10 text-center">
                      <p className="text-muted-foreground">No wallets connected. You can always add wallets later from your profile.</p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium mb-2">Connected Wallets ({connectedWallets.length})</h4>
                      <div className="space-y-2">
                        {connectedWallets.map(wallet => (
                          <div key={wallet.id} className="p-4 border rounded-md">
                            <div className="font-medium">{wallet.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {wallet.type === 'plaid' ? 'Bank Account' : wallet.address?.substring(0, 16) + '...'}
                              {wallet.balance && ` • Balance: ${wallet.balance}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="security">
                <div className="space-y-4">
                  <div className="p-4 border rounded-md bg-primary/5">
                    <h4 className="font-medium mb-1 flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Quantum-Resistant Security
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your wallet information is protected by quantum-resistant fractal storage algorithms, 
                      making it secure against both classical and quantum computing attacks.
                    </p>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Storage Complexity</span>
                      <span className="text-sm font-medium">92%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  
                  {fractalCoinBalance > 0 && (
                    <div className="p-4 border rounded-md">
                      <h4 className="font-medium mb-1">FractalCoin Balance</h4>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">{fractalCoinBalance.toFixed(2)}</span> FractalCoins earned for your secure storage contributions.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <div className="flex justify-end w-full">
              <Button onClick={completeOnboarding}>
                Complete Onboarding
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
      
      {/* Completion Step */}
      {step === 'complete' && (
        <Card>
          <CardHeader>
            <CardTitle>Onboarding Complete</CardTitle>
            <CardDescription>
              Congratulations! You have successfully completed the onboarding process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Aetherion!</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Your account has been set up with quantum-resistant security. You can now access all features of the platform.
              </p>
              
              <div className="bg-muted/10 p-6 rounded-lg max-w-md mx-auto text-left">
                <h3 className="font-medium mb-2">Account Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">KYC Level:</span>
                    <span className="font-medium">{kycVerification?.kycLevel || 'Basic'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connected Wallets:</span>
                    <span className="font-medium">{connectedWallets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">FractalCoin Balance:</span>
                    <span className="font-medium">{fractalCoinBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Security Rating:</span>
                    <span className="font-medium">92% (Excellent)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex justify-center w-full">
              <Button onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}