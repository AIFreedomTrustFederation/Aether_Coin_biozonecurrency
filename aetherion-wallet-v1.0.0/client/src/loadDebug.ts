/**
 * Debug utility to log application mode loading status
 * This helps diagnose issues with the CodeStar Platform vs Full Aetherion Wallet display
 */

// Configuration flags
const debugActive = true;
let initialized = false;

// Debug logging function
function logDebug(source: string, message: string, data?: any) {
  if (!debugActive) return;
  
  console.log(`[AETHERION DEBUG] ${source}: ${message}`, data || '');
}

// Initialize debug monitoring
export function initLoadDebug() {
  if (initialized) return;
  initialized = true;
  
  logDebug('loadDebug', 'Debug monitoring initialized');
  
  // Log window flags
  if (typeof window !== 'undefined') {
    logDebug('window', 'AETHERION_FULL_SYSTEM', (window as any).AETHERION_FULL_SYSTEM);
    logDebug('window', 'AETHERION_SECURITY_LEVEL', (window as any).AETHERION_SECURITY_LEVEL);
    logDebug('window', 'APP_MODE', (window as any).APP_MODE);
    
    // Log environment variables if accessible
    try {
      logDebug('env', 'import.meta.env.VITE_AETHERION_FULL_SYSTEM', import.meta.env.VITE_AETHERION_FULL_SYSTEM);
      logDebug('env', 'import.meta.env.VITE_APP_MODE', import.meta.env.VITE_APP_MODE);
    } catch (e) {
      logDebug('env', 'Error accessing environment variables', e);
    }
  }
  
  // Monitor DOM for important elements
  const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.type === 'childList') {
        // Check for CodeStar Platform elements
        const codestarElements = document.querySelectorAll('[data-codestar-platform]');
        if (codestarElements.length > 0) {
          logDebug('DOM', 'CodeStar Platform elements detected', codestarElements.length);
        }
        
        // Check for full wallet elements
        const walletElements = document.querySelectorAll('[data-aetherion-wallet]');
        if (walletElements.length > 0) {
          logDebug('DOM', 'Aetherion Wallet elements detected', walletElements.length);
        }
      }
    }
  });
  
  // Start observing
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Listen for our custom event
  window.addEventListener('aetherion:fullSystemEnabled', () => {
    logDebug('event', 'Full system enabled event received');
  });
  
  // Return a function to log custom messages
  return (source: string, message: string, data?: any) => logDebug(source, message, data);
}

// Export the debug logger
export default {
  initLoadDebug,
  log: (source: string, message: string, data?: any) => logDebug(source, message, data)
};