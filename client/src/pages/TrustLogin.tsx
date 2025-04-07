import React from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle2, LogIn, Shield } from 'lucide-react';

// Form validation schema using zod
const formSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Type for form values
type FormValues = z.infer<typeof formSchema>;

const TrustLogin: React.FC = () => {
  const { login, isLoading, isAuthenticated, isTrustMember } = useAuth();
  const [, setLocation] = useLocation();

  // Initialize react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // If already authenticated and is a trust member, redirect to portal
  React.useEffect(() => {
    if (isAuthenticated && isTrustMember) {
      setLocation('/trust-portal');
    }
  }, [isAuthenticated, isTrustMember, setLocation]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.username, values.password);
      // If login is successful, AuthContext will update isAuthenticated,
      // and the effect above will handle the redirect
    } catch (error) {
      // Error is already handled by the AuthContext
      console.error('Login submission error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">AI Freedom Trust Login</CardTitle>
          <CardDescription>
            Access the Trust Member portal with your credentials
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
                      <div className="relative">
                        <UserCircle2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="Enter your username"
                          className="pl-10"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
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
                      <div className="relative">
                        <Shield className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          disabled={isLoading}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login to Trust Portal
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col text-center text-sm text-muted-foreground border-t pt-4">
          <p>
            Only verified AI Freedom Trust members can access this portal.
          </p>
          <p className="mt-2">
            <Button variant="link" className="h-auto p-0" onClick={() => setLocation('/')}>
              Return to Main Site
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TrustLogin;