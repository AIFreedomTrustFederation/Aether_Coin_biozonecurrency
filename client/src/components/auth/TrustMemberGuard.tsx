import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../context/AuthContext';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Props for the TrustMemberGuard component
 */
interface TrustMemberGuardProps {
  children: React.ReactNode;
}

/**
 * A component that protects routes, ensuring only trust members can access them
 * If user is not authenticated or not a trust member, redirects to login or shows access denied
 */
export const TrustMemberGuard: React.FC<TrustMemberGuardProps> = ({ children }) => {
  const { isAuthenticated, isTrustMember, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If auth check is complete and user is not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      setLocation('/trust-login');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        <p className="mt-4 text-muted-foreground">Verifying credentials...</p>
      </div>
    );
  }

  // If authenticated but not a trust member, show access denied
  if (isAuthenticated && !isTrustMember) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="bg-card border rounded-lg p-6 max-w-md w-full text-center">
          <div className="bg-red-100 dark:bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            This area is restricted to AI Freedom Trust members only. If you believe this is an error, please contact support.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => setLocation('/')} variant="outline">
              Return Home
            </Button>
            <Button onClick={() => setLocation('/trust-login')} variant="default">
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated and is a trust member, render the protected content
  return <>{children}</>;
};

export default TrustMemberGuard;