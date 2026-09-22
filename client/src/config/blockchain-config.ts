export type AetherionNetworkStatus = 'planned' | 'devnet' | 'testnet' | 'mainnet';

export interface AetherionWalletNetworkConfig {
  networkName: string;
  canonicalChainId: string;
  evmAdapterChainId: string;
  symbol: string;
  decimals: number;
  rpcUrl: string;
  blockExplorerUrl: string;
  logo: string;
  status: AetherionNetworkStatus;
  walletAddSupported: boolean;
  notice: string;
}

const env = typeof import.meta !== 'undefined' ? (import.meta as any).env ?? {} : {};

/**
 * Production network metadata.
 *
 * Aetherion's canonical sovereign Layer 1 chain id is `aetherion-1`.
 * The EVM-style id is reserved only for a future compatibility adapter and is
 * not evidence that a MetaMask-compatible Aetherion mainnet exists today.
 */
export const AETHER_COIN_CONFIG: AetherionWalletNetworkConfig = {
  networkName: 'Aetherion Production (not launched)',
  canonicalChainId: 'aetherion-1',
  evmAdapterChainId: '0x3a42',
  symbol: 'ATC',
  decimals: 18,
  rpcUrl: env.VITE_AETHERION_MAINNET_RPC_URL ?? '',
  blockExplorerUrl: env.VITE_AETHERION_MAINNET_EXPLORER_URL ?? '',
  logo: '/aethercoin-logo.svg',
  status: 'planned',
  walletAddSupported: false,
  notice: 'No verified production Aetherion network is configured in this repository.',
};

/**
 * Test network metadata. Endpoints must be supplied explicitly by environment
 * after a real testnet exists. Until then the wallet connector stays disabled.
 */
export const AETHER_TESTNET_CONFIG: AetherionWalletNetworkConfig = {
  networkName: 'Aetherion Testnet (unconfigured)',
  canonicalChainId: 'aetherion-testnet-1',
  evmAdapterChainId: '0x3a43',
  symbol: 'tATC',
  decimals: 18,
  rpcUrl: env.VITE_AETHERION_TESTNET_RPC_URL ?? '',
  blockExplorerUrl: env.VITE_AETHERION_TESTNET_EXPLORER_URL ?? '',
  logo: '/aethercoin-testnet-logo.svg',
  status: env.VITE_AETHERION_TESTNET_RPC_URL ? 'testnet' : 'planned',
  walletAddSupported: Boolean(
    env.VITE_AETHERION_ENABLE_EVM_ADAPTER === 'true' &&
    env.VITE_AETHERION_TESTNET_RPC_URL &&
    env.VITE_AETHERION_TESTNET_EXPLORER_URL
  ),
  notice: env.VITE_AETHERION_TESTNET_RPC_URL
    ? 'Testnet endpoints are environment configured. Verify their operator and status before use.'
    : 'No verified Aetherion testnet endpoint is configured.',
};

export const getNetworkConfig = () => {
  return env.DEV ? AETHER_TESTNET_CONFIG : AETHER_COIN_CONFIG;
};
