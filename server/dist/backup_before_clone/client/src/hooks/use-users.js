"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useUsers = useUsers;
exports.useUser = useUser;
exports.useCurrentUser = useCurrentUser;
const react_query_1 = require("@tanstack/react-query");
/**
 * Hook to fetch all users
 */
function useUsers() {
    const { data, isLoading, error } = (0, react_query_1.useQuery)({
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
        users: data || [],
        isLoading,
        error
    };
}
/**
 * Hook to fetch a single user by ID
 */
function useUser(userId) {
    const { data, isLoading, error } = (0, react_query_1.useQuery)({
        queryKey: ['/api/users', userId],
        queryFn: async () => {
            if (!userId)
                return null;
            const response = await fetch(`/api/users/${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            return response.json();
        },
        enabled: !!userId,
    });
    return {
        user: data,
        isLoading,
        error
    };
}
/**
 * Hook to fetch the current authenticated user
 */
function useCurrentUser() {
    const { data, isLoading, error } = (0, react_query_1.useQuery)({
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
        currentUser: data,
        isLoading,
        error,
        isAuthenticated: !!data
    };
}
