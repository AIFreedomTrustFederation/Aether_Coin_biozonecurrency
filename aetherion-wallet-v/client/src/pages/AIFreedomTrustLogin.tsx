import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../context/AuthContext';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Lock, GitBranch } from 'lucide-react';
import { Link } from 'wouter';

// Form schema for login
const loginFormSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Form values type
type LoginFormValues = z.infer<typeof loginFormSchema>;

/**
 * AI Freedom Trust Login Component
 * Special login portal dedicated to AI Freedom Trust members
 */
const AIFreedomTrustLogin = () => {
  const { login, isLoading, user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form definition using react-hook-form with zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const success = await login(data.username, data.password);
      
      if (success) {
        // Redirect to trust portal on successful login
        navigate('/trust/portal');
        toast({
          title: 'Welcome to AI Freedom Trust Portal',
          description: 'You have successfully logged in to the trust portal.',
        });
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is already logged in and is a trust member, redirect to portal
  if (user && user.isTrustMember && !isSubmitting) {
    navigate('/trust/portal');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">AI Freedom Trust</h1>
          <p className="text-muted-foreground">
            Secure access for trust members
          </p>
        </div>
        
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Lock className="h-5 w-5" /> Trust Member Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the AI Freedom Trust portal
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          {...field}
                          disabled={isSubmitting || isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          disabled={isSubmitting || isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {error && (
                  <div className="text-destructive text-sm font-medium">
                    {error}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting || isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    'Access Trust Portal'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4">
            <div className="text-sm text-muted-foreground w-full text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <GitBranch className="h-4 w-4" />
                <Link href="https://github.com/AIFreedomTrustFederation/Aether_Coin_biozonecurrency" className="text-primary hover:underline">
                  View Aether Coin Biozone Currency Project
                </Link>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <GitBranch className="h-4 w-4 rotate-180" />
                <Link href="https://github.com/AIFreedomTrustFederation/Aetherion-Quantum-Wallet" className="text-primary hover:underline">
                  View Aetherion Quantum Wallet Repository
                </Link>
              </div>
              <div className="border-t pt-2 mt-2">
                <p className="mb-2 font-medium text-sm">Trust Member?</p>
                <Link href="/trust/portal" className="inline-flex items-center justify-center text-sm rounded-md bg-primary px-3 py-1.5 text-primary-foreground shadow-sm hover:bg-primary/80">
                  <Shield className="h-3.5 w-3.5 mr-1.5" /> Go to Trust Portal
                </Link>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AIFreedomTrustLogin;