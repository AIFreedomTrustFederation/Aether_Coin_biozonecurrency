import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, LogIn, AlertCircle, KeyRound, UserCheck } from 'lucide-react';
import { Link } from 'wouter';

// Define the login form schema with zod
const loginFormSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
});

// Infer the type from the schema
type LoginFormValues = z.infer<typeof loginFormSchema>;

/**
 * Login Component
 * Allows users to log in with username and password
 */
export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, checkAuthStatus, user } = useAuth();
  const [location, navigate] = useLocation();
  
  // Check if this is a trust login by looking for trust=true in the URL
  const isTrustLogin = location.includes('trust=true') || location.includes('trust/login');

  // Initialize the form with react-hook-form and zodResolver
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await login(data.username, data.password);
      if (success) {
        // After login, check authentication status to get updated user
        await checkAuthStatus();
        
        // User will now be updated, we can check for trust membership
        if (user?.isTrustMember) {
          // If user is a trust member, redirect to trust portal
          navigate('/trust/portal');
        } else {
          // Otherwise redirect to dashboard
          navigate('/dashboard');
        }
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isTrustLogin ? 'AI Freedom Trust' : 'Aetherion'}
          </CardTitle>
          <CardDescription>
            {isTrustLogin 
              ? 'Enter your credentials to access the Trust portal' 
              : 'Enter your credentials to access your account'
            }
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-green-400 hover:bg-green-500 text-black"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    {isTrustLogin ? 'Login to Trust Portal' : 'Login to Aetherion'}
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {!isTrustLogin && (
            <div className="text-sm text-muted-foreground text-center">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          )}
          
          {isTrustLogin ? (
            <div className="text-center text-sm text-muted-foreground">
              <p>The Trust portal is accessible to authorized members only.</p>
              <Button 
                variant="link" 
                onClick={() => navigate('/')}
                className="text-sm"
              >
                Return to Main Platform
              </Button>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground text-center">
              By logging in, you agree to our{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}