/**
 * Configuration for the Aetherion blockchain network
 * These values will be used to auto-connect users to the AetherCoin network
 */

export const AETHER_COIN_CONFIG = {
  networkName: "AetherCoin MainNet",
  rpcUrl: "https://rpc.aethercoin.network",
  chainId: "0x3A42", // Hexadecimal chain ID (decimal: 14914)
  symbol: "ATC",
  blockExplorerUrl: "https://explorer.aethercoin.network",
  decimals: 18,
  logo: "/aethercoin-logo.svg" // Path to network logo in public folder
};

/**
 * Configuration for Aetherion test network
 */
export const AETHER_TESTNET_CONFIG = {
  networkName: "AetherCoin TestNet",
  rpcUrl: "https://testnet-rpc.aethercoin.network",
  chainId: "0x3A43", // Hexadecimal chain ID (decimal: 14915)
  symbol: "tATC",
  blockExplorerUrl: "https://testnet-explorer.aethercoin.network",
  decimals: 18,
  logo: "/aethercoin-testnet-logo.svg"
};

/**
 * Gets the network configuration based on environment
 */
export const getNetworkConfig = () => {
  if (process.env.NODE_ENV === 'development') {
    return AETHER_TESTNET_CONFIG;
  }
  return AETHER_COIN_CONFIG;
};