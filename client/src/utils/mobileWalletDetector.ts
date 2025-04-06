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
}

// Common mobile Web3 wallets
const MOBILE_WALLETS: Omit<DetectedWallet, 'installed'>[] = [
  {
    name: 'MetaMask',
    id: 'metamask',
    icon: 'metamask',
    deepLink: 'metamask://',
    download: 'https://metamask.io/download/',
  },
  {
    name: 'Trust Wallet',
    id: 'trustwallet',
    icon: 'trustwallet',
    deepLink: 'trust://',
    download: 'https://trustwallet.com/download',
  },
  {
    name: 'Coinbase Wallet',
    id: 'coinbasewallet',
    icon: 'coinbasewallet',
    deepLink: 'cbwallet://',
    download: 'https://www.coinbase.com/wallet/downloads',
  },
  {
    name: 'Rainbow',
    id: 'rainbow',
    icon: 'rainbow',
    deepLink: 'rainbow://',
    download: 'https://rainbow.me',
  },
  {
    name: 'Argent',
    id: 'argent',
    icon: 'argent',
    deepLink: 'argent://',
    download: 'https://www.argent.xyz/download/',
  },
  {
    name: 'Alpha Wallet',
    id: 'alphawallet',
    icon: 'alpha',
    deepLink: 'awallet://',
    download: 'https://alphawallet.com/',
  },
  {
    name: 'imToken',
    id: 'imtoken',
    icon: 'imtoken',
    deepLink: 'imtokenv2://',
    download: 'https://token.im/download',
  },
  {
    name: 'Spot',
    id: 'spot',
    icon: 'spot',
    deepLink: 'spot://',
    download: 'https://www.spot-wallet.com',
  },
  {
    name: 'Aetherion',
    id: 'aetherion',
    icon: 'aetherion',
    deepLink: 'aetherion://',
    download: '/download',
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
 */
export async function isWalletInstalled(deepLink: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Set a timeout in case the wallet isn't installed
    const timeout = setTimeout(() => {
      resolve(false);
    }, 500);

    // Create an iframe to test the deep link
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Set up handlers for iframe load/error events
    iframe.onload = () => {
      clearTimeout(timeout);
      document.body.removeChild(iframe);
      resolve(true);
    };
    
    iframe.onerror = () => {
      clearTimeout(timeout);
      document.body.removeChild(iframe);
      resolve(false);
    };
    
    // Try loading the deep link
    iframe.src = deepLink;
  });
}

/**
 * Detect installed wallet providers based on window objects
 * Different wallets inject different providers into the window object
 */
export function detectProvidersFromWindow(): { [key: string]: boolean } {
  const providers: { [key: string]: boolean } = {};
  
  if (typeof window !== 'undefined') {
    // Check for MetaMask
    providers.metamask = window.ethereum?.isMetaMask || false;
    
    // Check for Trust Wallet
    providers.trustwallet = window.ethereum?.isTrust || false;
    
    // Check for Coinbase Wallet
    providers.coinbasewallet = window.ethereum?.isCoinbaseWallet || false;
    
    // Check for Rainbow
    providers.rainbow = 
      window.ethereum?.isRainbow || 
      window.rainbow !== undefined || 
      false;
    
    // Generic check for any Web3 provider
    providers.generic = window.ethereum !== undefined;
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
  
  // For each wallet, check if it's installed
  const walletPromises = MOBILE_WALLETS.map(async (wallet) => {
    // If we already detected it from window providers, use that
    if (windowProviders[wallet.id]) {
      return {
        ...wallet,
        installed: true
      };
    }
    
    // Otherwise check deep link
    const installed = await isWalletInstalled(wallet.deepLink);
    return {
      ...wallet,
      installed
    };
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