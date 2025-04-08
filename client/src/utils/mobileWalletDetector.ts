/**
 * MobileWalletDetector - Utility for detecting Web3 wallets installed on mobile devices
 * 
 * This utility detects commonly installed Web3 wallets on iOS and Android
 * by checking for deep link protocols and window provider objects.
 */

export interface DetectedWallet {
  name: string;
  id: string;
  icon: string;
  deepLink: string;
  installed: boolean;
  download: string;
  forceCheck?: boolean;
}

// Common mobile Web3 wallets
const MOBILE_WALLETS: Omit<DetectedWallet, 'installed'>[] = [
  {
    name: 'MetaMask',
    id: 'metamask',
    icon: 'metamask',
    deepLink: 'metamask://',
    download: 'https://metamask.io/download/',
    forceCheck: true  // Always check MetaMask as it's the most common
  },
  {
    name: 'Trust Wallet',
    id: 'trustwallet',
    icon: 'trustwallet',
    deepLink: 'trust://',
    download: 'https://trustwallet.com/download',
    forceCheck: true  // Always check Trust Wallet on mobile
  },
  {
    name: 'Coinbase Wallet',
    id: 'coinbasewallet',
    icon: 'coinbasewallet',
    deepLink: 'cbwallet://',
    download: 'https://www.coinbase.com/wallet/downloads',
    forceCheck: true  // Always check Coinbase Wallet
  },
  {
    name: 'Rainbow',
    id: 'rainbow',
    icon: 'rainbow',
    deepLink: 'rainbow://',
    download: 'https://rainbow.me',
    forceCheck: true  // Always check Rainbow
  },
  {
    name: 'Argent',
    id: 'argent',
    icon: 'argent',
    deepLink: 'argent://',
    download: 'https://www.argent.xyz/download/',
    forceCheck: false  // Skip if another wallet is connected
  },
  {
    name: 'Alpha Wallet',
    id: 'alphawallet',
    icon: 'alpha',
    deepLink: 'awallet://',
    download: 'https://alphawallet.com/',
    forceCheck: false  // Skip if another wallet is connected
  },
  {
    name: 'imToken',
    id: 'imtoken',
    icon: 'imtoken',
    deepLink: 'imtokenv2://',
    download: 'https://token.im/download',
    forceCheck: false  // Skip if another wallet is connected
  },
  {
    name: 'Spot',
    id: 'spot',
    icon: 'spot',
    deepLink: 'spot://',
    download: 'https://www.spot-wallet.com',
    forceCheck: false  // Skip if another wallet is connected
  },
  {
    name: 'Aetherion',
    id: 'aetherion',
    icon: 'aetherion',
    deepLink: 'aetherion://',
    download: '/wallet/download',
    forceCheck: true  // Always check the native Aetherion wallet
  }
];

/**
 * Check if the user is on a mobile device
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if a specific mobile wallet is installed by testing its deep link
 * Uses a more reliable detection method that doesn't redirect users
 * Prioritizes Aetherion native provider
 */
export async function isWalletInstalled(deepLink: string): Promise<boolean> {
  // Improved detection logic - uses multiple methods
  return new Promise((resolve) => {
    // First check window providers
    const providers = detectProvidersFromWindow();
    const walletId = deepLink.split('://')[0];
    
    // First check for Aetherion (our primary wallet)
    if (walletId === 'aetherion' && window.aetherion) {
      return resolve(true);
    }
    
    // If we're checking for Aetherion but don't have window.aetherion,
    // check if our interface is ready to load it
    if (walletId === 'aetherion' && typeof window !== 'undefined') {
      // This will attempt to initialize window.aetherion if possible
      // by loading the AetherionProvider module
      import('../core/blockchain/AetherionProvider')
        .then(() => {
          if (window.aetherion) {
            return resolve(true);
          }
          // Continue with other methods if import didn't set window.aetherion
          checkOtherProviders();
        })
        .catch(() => {
          // Continue with other methods if import failed
          checkOtherProviders();
        });
      return;
    }
    
    // Check other providers if not checking for Aetherion
    checkOtherProviders();
    
    function checkOtherProviders() {
      // Legacy checks for other wallet providers
      if (walletId === 'metamask' && providers.metamask) {
        return resolve(true);
      }
      if (walletId === 'trust' && providers.trustwallet) {
        return resolve(true);
      }
      if (walletId === 'cbwallet' && providers.coinbasewallet) {
        return resolve(true);
      }
      if (walletId === 'rainbow' && providers.rainbow) {
        return resolve(true);
      }
      if (walletId === 'aetherion' && providers.aetherion) {
        return resolve(true);
      }
      
      // Fallback to deep link detection
      attemptDeepLinkDetection();
    }
    
    function attemptDeepLinkDetection() {
      // Setup timeout for the hidden iframe method
      const timeout = setTimeout(() => {
        resolve(false);
      }, 300); // Shorter timeout for better UX
      
      try {
        // Modern approach: use hidden iframe but detect focus change
        // This prevents automatic redirects
        const initialFocus = document.hasFocus();
        
        // Create a hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        // Remove iframe when done
        const cleanupIframe = () => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        };
        
        // Listen for focus changes
        const checkFocus = () => {
          if (initialFocus && !document.hasFocus()) {
            // Focus changed, indicating app switching - likely wallet is installed
            clearTimeout(timeout);
            cleanupIframe();
            resolve(true);
            return true;
          }
          return false;
        };
        
        // Set brief interval to check focus
        const focusInterval = setInterval(() => {
          if (checkFocus()) {
            clearInterval(focusInterval);
          }
        }, 50);
        
        // Set timeout to clear interval
        setTimeout(() => {
          clearInterval(focusInterval);
        }, 300);
        
        // Handle iframe events
        iframe.onload = () => {
          if (!checkFocus()) {
            clearTimeout(timeout);
            cleanupIframe();
            resolve(true);
          }
        };
        
        iframe.onerror = () => {
          clearTimeout(timeout);
          cleanupIframe();
          clearInterval(focusInterval);
          resolve(false);
        };
        
        // Try loading the deep link in the iframe
        iframe.src = deepLink;
      } catch (error) {
        console.error("Error detecting wallet:", error);
        clearTimeout(timeout);
        resolve(false);
      }
    }
  });
}

/**
 * Detect installed wallet providers based on window objects
 * Different wallets inject different providers into the window object
 */
export function detectProvidersFromWindow(): { [key: string]: boolean } {
  const providers: { [key: string]: boolean } = {};
  
  // Initialize all providers as false
  providers.metamask = false;
  providers.trustwallet = false;
  providers.coinbasewallet = false;
  providers.rainbow = false;
  providers.aetherion = false;
  providers.generic = false;
  
  if (typeof window !== 'undefined') {
    // Check for native Aetherion provider first (our preferred provider)
    if (window.aetherion) {
      providers.aetherion = true;
      providers.generic = true;
      return providers; // If we have our native provider, return immediately
    }
    
    // Legacy check for Ethereum providers (for compatibility with MetaMask, etc.)
    // This is used as a fallback when native Aetherion provider is not available
    if (window.ethereum) {
      // Get the ethereum object safely
      const ethereum = window.ethereum as any;
      
      // Check for MetaMask
      providers.metamask = !!ethereum.isMetaMask;
      
      // Check for Trust Wallet - use multiple detection methods
      providers.trustwallet = 
        !!ethereum.isTrust || 
        !!ethereum.isTrustWallet ||
        (typeof ethereum.providerMap === 'object' && 
          ethereum.providerMap?.has('trust') ||
          false);
      
      // Check for Coinbase Wallet
      providers.coinbasewallet = !!ethereum.isCoinbaseWallet;
      
      // Check for Rainbow using multiple detection strategies
      providers.rainbow = !!(
        ethereum.isRainbow || 
        (window as any).rainbow !== undefined || 
        ethereum._events?.accountsChanged?.some((fn: any) => 
          fn.toString().includes('rainbow')
        ) ||
        false
      );
      
      // Check for Aetherion integration with legacy Ethereum provider
      providers.aetherion = !!(
        ethereum.isAetherion || 
        ethereum.isATC ||
        ethereum._events?.accountsChanged?.some((fn: any) => 
          fn.toString().includes('aetherion') || fn.toString().includes('atc')
        ) ||
        ethereum.chainId === '0xa37' || // Aetherion mainnet Chain ID
        false
      );
      
      // Generic check for any Web3 provider
      providers.generic = true;
    }
  }
  
  return providers;
}

/**
 * Gets a list of all available wallets on the device
 * with their installation status
 */
export async function detectMobileWallets(): Promise<DetectedWallet[]> {
  // If not on mobile, return empty list
  if (!isMobileDevice()) {
    return [];
  }
  
  // Check for window providers first
  const windowProviders = detectProvidersFromWindow();
  
  // Check if any provider is detected, this means a wallet is already connected
  const hasConnectedWallet = Object.values(windowProviders).some(val => val === true);
  
  // Map window provider detection to wallet IDs
  const detectedWalletIds = new Set<string>();
  
  if (windowProviders.metamask) detectedWalletIds.add('metamask');
  if (windowProviders.trustwallet) detectedWalletIds.add('trust');
  if (windowProviders.coinbasewallet) detectedWalletIds.add('coinbase');
  if (windowProviders.rainbow) detectedWalletIds.add('rainbow');
  if (windowProviders.aetherion) detectedWalletIds.add('aetherion');
  
  // For each wallet, check if it's installed
  const walletPromises = MOBILE_WALLETS.map(async (wallet) => {
    // If we already detected it from window providers, use that
    if (detectedWalletIds.has(wallet.id)) {
      return {
        ...wallet,
        installed: true
      };
    }
    
    // Skip deep link checking if we already have a connected wallet (optimization)
    if (hasConnectedWallet && !wallet.forceCheck) {
      // If we have a connected wallet but it's not this one, 
      // assume this wallet is not installed for faster loading
      return {
        ...wallet,
        installed: false
      };
    }
    
    // Otherwise check deep link
    try {
      const installed = await isWalletInstalled(wallet.deepLink);
      return {
        ...wallet,
        installed
      };
    } catch (error) {
      console.error(`Error checking wallet installation for ${wallet.name}:`, error);
      return {
        ...wallet,
        installed: false
      };
    }
  });
  
  return Promise.all(walletPromises);
}

/**
 * Opens a wallet using its deep link (mobile only)
 */
export function openWallet(deepLink: string): boolean {
  if (!isMobileDevice()) {
    return false;
  }
  
  try {
    window.location.href = deepLink;
    return true;
  } catch (error) {
    console.error('Failed to open wallet:', error);
    return false;
  }
}

/**
 * Get a device-appropriate connection method
 * Returns either "injected" for mobile with wallets or
 * "walletconnect" as fallback
 */
export async function getPreferredConnectionMethod(): Promise<'injected' | 'walletconnect'> {
  if (!isMobileDevice()) {
    return 'walletconnect';
  }
  
  const providers = detectProvidersFromWindow();
  
  // If any provider is detected, use injected
  if (Object.values(providers).some(val => val === true)) {
    return 'injected';
  }
  
  return 'walletconnect';
}