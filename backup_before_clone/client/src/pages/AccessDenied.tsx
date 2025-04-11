import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { LockKeyhole, Home, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const AccessDenied = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/trust/login');
    setIsLoggingOut(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/20">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg overflow-hidden">
        <div className="bg-destructive p-8 flex flex-col items-center">
          <div className="bg-background rounded-full p-3 mb-4">
            <LockKeyhole className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        </div>
        
        <div className="p-8">
          <p className="text-center mb-6">
            You don't have permission to access this area. This section is restricted to AI Freedom Trust members only.
          </p>
          
          <p className="text-sm text-muted-foreground mb-8 text-center">
            If you believe you should have access, please contact the Trust administration for assistance.
          </p>
          
          <div className="flex flex-col space-y-3">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/')}
            >
              <Home className="mr-2 h-4 w-4" />
              Return to Homepage
            </Button>
            
            {isAuthenticated ? (
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Logout and Try Different Account'}
              </Button>
            ) : (
              <Button 
                variant="default" 
                className="w-full" 
                onClick={() => navigate('/trust/login')}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login with Trust Account
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;