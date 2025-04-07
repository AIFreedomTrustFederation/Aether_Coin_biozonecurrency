import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * User interface representing the authenticated user data
 */
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isTrustMember: boolean;
  trustMemberSince?: Date;
  trustMemberLevel?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  isActive: boolean;
}

/**
 * Authentication context interface defining the shape of our context
 */
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isTrustMember: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isTrustMember: false,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

/**
 * Custom hook to use the auth context
 */
export const useAuth = () => useContext(AuthContext);

/**
 * AuthProvider component to wrap around components that need authentication
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  /**
   * Check if the user is currently authenticated
   */
  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/current-user', {
        credentials: 'include', // Important for cookies
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log the user in
   */
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
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
          title: 'Login successful',
          description: `Welcome back, ${data.user.username}!`,
        });
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Please check your credentials and try again',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log the user out
   */
  const logout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
        toast({
          title: 'Logout successful',
          description: 'You have been logged out successfully',
        });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout failed',
        description: 'There was an issue logging you out',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status when the component mounts
  useEffect(() => {
    checkAuth();
  }, []);

  // Context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isTrustMember: user?.isTrustMember || false,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default AuthContext;