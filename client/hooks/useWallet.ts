/**
 * Wallet Hook
 * 
 * This hook provides access to the wallet functionality from the client/hooks directory.
 * It re-exports the useWallet hook from the main implementation.
 */

import useWalletImplementation from '../src/hooks/useWallet';

// Re-export the hook
export const useWallet = useWalletImplementation;

// Default export for convenience
export default useWallet;