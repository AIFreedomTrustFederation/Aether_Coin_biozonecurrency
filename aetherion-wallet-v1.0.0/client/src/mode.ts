/**
 * Aetherion Wallet Mode Configuration
 * 
 * This file explicitly sets the application mode to ensure the full Aetherion Wallet
 * is displayed instead of just the CodeStar Platform interface.
 */

// Force the full Aetherion Wallet system to load
export const FULL_SYSTEM = true;
export const SECURITY_LEVEL = 'optimal';

// Set the global window objects
if (typeof window !== 'undefined') {
  (window as any).AETHERION_FULL_SYSTEM = true;
  (window as any).AETHERION_SECURITY_LEVEL = 'optimal';
  (window as any).APP_MODE = 'full';
  
  console.log('Aetherion Mode: Full System Enabled');
}

// Export functions to check application mode
export function isFullSystem(): boolean {
  return true;
}

export function getSecurityLevel(): string {
  return 'optimal';
}

export default {
  FULL_SYSTEM,
  SECURITY_LEVEL,
  isFullSystem,
  getSecurityLevel
};