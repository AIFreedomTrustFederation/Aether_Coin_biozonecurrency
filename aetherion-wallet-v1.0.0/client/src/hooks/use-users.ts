import { useQuery } from '@tanstack/react-query';

// Define user type based on the schema
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date | null;
  lastLogin: Date | null;
}

/**
 * Hook to fetch all users
 */
export function useUsers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  });

  return {
    users: data as User[] || [],
    isLoading,
    error
  };
}

/**
 * Hook to fetch a single user by ID
 */
export function useUser(userId: number | null) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/users', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },
    enabled: !!userId,
  });

  return {
    user: data as User | null,
    isLoading,
    error
  };
}

/**
 * Hook to fetch the current authenticated user
 */
export function useCurrentUser() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/users/me'],
    queryFn: async () => {
      const response = await fetch('/api/users/me');
      if (response.status === 401) {
        return null; // Not authenticated
      }
      if (!response.ok) {
        throw new Error('Failed to fetch current user');
      }
      return response.json();
    },
  });

  return {
    currentUser: data as User | null,
    isLoading,
    error,
    isAuthenticated: !!data
  };
}