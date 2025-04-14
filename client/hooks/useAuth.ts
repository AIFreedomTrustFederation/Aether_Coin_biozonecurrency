/**
 * Auth Hook
 * 
 * This hook provides access to the authentication context from the client/hooks directory.
 * It re-exports the useAuth hook from the main AuthContext.
 */

import { useAuth as useAuthContext } from '../src/context/AuthContext';

// Re-export the hook
export const useAuth = useAuthContext;

// Default export for convenience
export default useAuth;