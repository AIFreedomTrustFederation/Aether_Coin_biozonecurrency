import { useState, useCallback } from 'react';
import axios from 'axios';

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  token: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      setAuthState({
        isAuthenticated: true,
        user: response.data.user,
        token: response.data.token,
      });
      // Store the token in local storage or cookies as needed
    } catch (error) {
      console.error('Login failed:', error);
    }
  }, []);

  const logout = useCallback(() => {
    setAuthState({ isAuthenticated: false, user: null, token: null });
    // Clear token from storage
  }, []);

  const verifyTwoFactor = useCallback(async (code: string) => {
    try {
      const response = await axios.post('/api/auth/verify-2fa', { code });
      if (response.data.success) {
        // Handle successful 2FA
      }
    } catch (error) {
      console.error('2FA verification failed:', error);
    }
  }, []);

  return {
    authState,
    login,
    logout,
    verifyTwoFactor,
  };
}
