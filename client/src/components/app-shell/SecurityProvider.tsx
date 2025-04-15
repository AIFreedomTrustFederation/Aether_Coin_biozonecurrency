import React from 'react';
import { useZeroTrust } from '@/contexts/ZeroTrustContext';

interface SecurityProviderProps {
  children: React.ReactNode;
}

/**
 * Security Provider Component
 * 
 * Provides a security wrapper for the application shell,
 * integrating the AetherSphere security framework components.
 * 
 * Note: This component uses the ZeroTrustContext for initialization,
 * which is already set up in the ZeroTrustProvider.
 */
export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  // Access security context
  const { isInitialized, isInitializing, securityLevel } = useZeroTrust();
  
  // The initialization is now handled by the ZeroTrustProvider
  // We just use this component as a convenient place to show security status if needed
  
  return (
    <>
      {children}
    </>
  );
};