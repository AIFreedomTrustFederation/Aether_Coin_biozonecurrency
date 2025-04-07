import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

// Type for the authenticated user
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isTrustMember: boolean;
  trustMemberSince: string | null;
  trustMemberLevel: string | null;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  isActive: boolean;
}

// Interface for the authentication context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isTrustMember: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isTrustMember: false,
  login: async () => false,
  logout: async () => {},
  checkAuthStatus: async () => false,
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Check if user is authenticated
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/current-user', {
        credentials: 'include', // Important for cookies
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        // Not authenticated or error
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // Important for cookies
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${data.user.username}!`,
        });
        return true;
      } else {
        // Display error message
        toast({
          title: 'Login Failed',
          description: data.message || 'Invalid username or password',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Important for cookies
      });

      if (response.ok) {
        setUser(null);
        toast({
          title: 'Logout Successful',
          description: 'You have been logged out.',
        });
      } else {
        // Handle logout error
        const data = await response.json();
        toast({
          title: 'Logout Error',
          description: data.message || 'Error logging out',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on initial load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const isAuthenticated = !!user;
  const isTrustMember = isAuthenticated && user?.isTrustMember;

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isTrustMember,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;