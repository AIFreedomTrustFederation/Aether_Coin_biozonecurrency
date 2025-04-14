/**
 * Quantum AI Hook
 * 
 * This hook provides client-side integration with the quantum AI system,
 * allowing components to access AI-driven quantum security features.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../src/context/AuthContext';
import useWallet from '../src/hooks/useWallet';

// Define types
export type SecurityLevel = 'standard' | 'enhanced' | 'quantum';

export type SecurityAction = {
  actionType: 'increase_security_level' | 'change_algorithm' | 'update_configuration' | 
              'apply_recommendation' | 'run_security_scan' | 'enable_feature' | 'disable_feature';
  actionParams?: Record<string, any>;
  description: string;
  automated: boolean;
};

export type SecurityGuidance = {
  id: string;
  content: string;
  timestamp: number;
  suggestedActions?: {
    actionType: string;
    actionText: string;
    actionData?: any;
  }[];
  securityActions?: SecurityAction[];
};

export type SecurityStatus = {
  securityLevel: SecurityLevel;
  securityScore: number;
  algorithms: Record<string, string>;
  features: Record<string, boolean>;
  recommendations: number;
  vulnerabilities: number;
  lastScan: number;
};

/**
 * Hook for interacting with the quantum AI system
 */
export function useQuantumAi() {
  const { user, isAuthenticated } = useAuth();
  const { selectedWallet: activeWallet } = useWallet();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [securitySuggestions, setSecuritySuggestions] = useState<SecurityAction[]>([]);
  
  // Fetch security status
  const fetchSecurityStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/quantum/ai/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch security status');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSecurityStatus(data.status);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Fetch security suggestions
  const fetchSecuritySuggestions = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/quantum/ai/suggestions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch security suggestions');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSecuritySuggestions(data.suggestions);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Get security guidance
  const getSecurityGuidance = useCallback(async (
    query: string,
    securityLevel?: SecurityLevel
  ): Promise<SecurityGuidance> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/quantum/ai/guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id,
          walletId: activeWallet?.id,
          query,
          securityContext: {
            securityLevel: securityLevel || securityStatus?.securityLevel || 'standard',
            userPreferences: {
              // Add any user preferences here
            }
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get security guidance');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, activeWallet, securityStatus]);
  
  // Execute security action
  const executeSecurityAction = useCallback(async (
    action: SecurityAction
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/quantum/ai/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...action,
          userId: user?.id,
          walletId: activeWallet?.id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to execute security action');
      }
      
      const data = await response.json();
      
      // Refresh security status after action
      fetchSecurityStatus();
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, activeWallet, fetchSecurityStatus]);
  
  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchSecurityStatus();
      fetchSecuritySuggestions();
    }
  }, [isAuthenticated, fetchSecurityStatus, fetchSecuritySuggestions]);
  
  return {
    loading,
    error,
    securityStatus,
    securitySuggestions,
    getSecurityGuidance,
    executeSecurityAction,
    refreshSecurityStatus: fetchSecurityStatus,
    refreshSecuritySuggestions: fetchSecuritySuggestions
  };
}