import { ReactNode, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface TrustMemberGuardProps {
  children: ReactNode;
  fallbackPath?: string;
}

/**
 * TrustMemberGuard component to protect routes that should only be accessible
 * to AI Freedom Trust members.
 * 
 * Redirects non-trust members to the login page or another specified page.
 */
const TrustMemberGuard = ({ 
  children, 
  fallbackPath = '/trust/login' 
}: TrustMemberGuardProps) => {
  const { isTrustMember, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect after we're done loading and confirmed not a trust member
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not logged in, redirect to login
        setLocation(fallbackPath);
      } else if (!isTrustMember) {
        // Logged in but not a trust member
        setLocation('/access-denied');
      }
    }
  }, [isLoading, isAuthenticated, isTrustMember, fallbackPath, setLocation]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2 text-lg">Verifying trust membership...</p>
      </div>
    );
  }

  return isTrustMember ? <>{children}</> : null;
};

export default TrustMemberGuard;