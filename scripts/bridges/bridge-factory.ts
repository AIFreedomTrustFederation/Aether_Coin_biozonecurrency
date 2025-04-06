/**
 * Bridge Factory
 * 
 * This file provides a factory for creating and managing bridges to different blockchain networks.
 */

import { BaseBridge } from './base-bridge';
import { EthereumBridge } from './ethereum-bridge';
import { SolanaBridge } from './solana-bridge';
import { FilecoinBridge } from './filecoin-bridge';
import { BridgeNetwork, BridgeStatus, BridgeConfiguration } from '../../shared/bridge-schema';
import { storage } from '../../server/storage';

// Map of active bridges
const activeBridges: Map<number, BaseBridge> = new Map();

/**
 * Create a bridge instance based on the bridge configuration
 * @param bridgeConfig Bridge configuration from the database
 * @returns A bridge instance
 */
export async function createBridge(bridgeConfig: BridgeConfiguration): Promise<BaseBridge> {
  // Check if bridge already exists
  if (activeBridges.has(bridgeConfig.id)) {
    return activeBridges.get(bridgeConfig.id)!;
  }
  
  // Create bridge based on source network type
  let bridge: BaseBridge;
  
  switch (bridgeConfig.sourceNetwork as BridgeNetwork) {
    case BridgeNetwork.ETHEREUM:
      // Load environment variables for Ethereum
      const ethRpcUrl = process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-project-id';
      const ethPrivateKey = process.env.ETHEREUM_VALIDATOR_PRIVATE_KEY; // Optional
      
      bridge = new EthereumBridge(
        bridgeConfig.id,
        {
          name: bridgeConfig.name,
          sourceNetwork: bridgeConfig.sourceNetwork as BridgeNetwork,
          targetNetwork: bridgeConfig.targetNetwork as BridgeNetwork,
          contractAddressSource: bridgeConfig.contractAddressSource || undefined,
          contractAddressTarget: bridgeConfig.contractAddressTarget || undefined,
          feePercentage: bridgeConfig.feePercentage,
          minTransferAmount: bridgeConfig.minTransferAmount || undefined,
          maxTransferAmount: bridgeConfig.maxTransferAmount || undefined,
          requiredConfirmations: bridgeConfig.requiredConfirmations,
          validatorThreshold: bridgeConfig.validatorThreshold,
          securityLevel: bridgeConfig.securityLevel as 'low' | 'standard' | 'high',
          config: bridgeConfig.config as Record<string, any>
        },
        ethRpcUrl,
        ethPrivateKey
      );
      break;
      
    case BridgeNetwork.SOLANA:
      // Load environment variables for Solana
      const solRpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
      const solPrivateKey = process.env.SOLANA_VALIDATOR_PRIVATE_KEY; // Optional
      
      bridge = new SolanaBridge(
        bridgeConfig.id,
        {
          name: bridgeConfig.name,
          sourceNetwork: bridgeConfig.sourceNetwork as BridgeNetwork,
          targetNetwork: bridgeConfig.targetNetwork as BridgeNetwork,
          contractAddressSource: bridgeConfig.contractAddressSource || undefined,
          contractAddressTarget: bridgeConfig.contractAddressTarget || undefined,
          feePercentage: bridgeConfig.feePercentage,
          minTransferAmount: bridgeConfig.minTransferAmount || undefined,
          maxTransferAmount: bridgeConfig.maxTransferAmount || undefined,
          requiredConfirmations: bridgeConfig.requiredConfirmations,
          validatorThreshold: bridgeConfig.validatorThreshold,
          securityLevel: bridgeConfig.securityLevel as 'low' | 'standard' | 'high',
          config: bridgeConfig.config as Record<string, any>
        },
        solRpcUrl,
        solPrivateKey ? Buffer.from(solPrivateKey, 'hex') : undefined
      );
      break;
      
    case BridgeNetwork.FILECOIN:
      // Load environment variables for Filecoin
      const filRpcUrl = process.env.FILECOIN_RPC_URL || 'https://api.node.glif.io/rpc/v0';
      const filAuthToken = process.env.FILECOIN_VALIDATOR_TOKEN; // Optional
      
      bridge = new FilecoinBridge(
        bridgeConfig.id,
        {
          name: bridgeConfig.name,
          sourceNetwork: bridgeConfig.sourceNetwork as BridgeNetwork,
          targetNetwork: bridgeConfig.targetNetwork as BridgeNetwork,
          contractAddressSource: bridgeConfig.contractAddressSource || undefined,
          contractAddressTarget: bridgeConfig.contractAddressTarget || undefined,
          feePercentage: bridgeConfig.feePercentage,
          minTransferAmount: bridgeConfig.minTransferAmount || undefined,
          maxTransferAmount: bridgeConfig.maxTransferAmount || undefined,
          requiredConfirmations: bridgeConfig.requiredConfirmations,
          validatorThreshold: bridgeConfig.validatorThreshold,
          securityLevel: bridgeConfig.securityLevel as 'low' | 'standard' | 'high',
          config: bridgeConfig.config as Record<string, any>
        },
        filRpcUrl,
        filAuthToken
      );
      break;
      
    // Add more bridge types as they are implemented
    // case BridgeNetwork.NEAR:
    // case BridgeNetwork.BINANCE_SMART_CHAIN:
    // etc.
    
    default:
      throw new Error(`Unsupported bridge network: ${bridgeConfig.sourceNetwork}`);
  }
  
  // Initialize the bridge
  await bridge.initialize();
  
  // Store in active bridges map
  activeBridges.set(bridgeConfig.id, bridge);
  
  return bridge;
}

/**
 * Get a bridge instance by ID
 * @param bridgeId ID of the bridge
 * @returns The bridge instance or undefined if not found
 */
export function getBridge(bridgeId: number): BaseBridge | undefined {
  return activeBridges.get(bridgeId);
}

/**
 * Get all active bridges
 * @returns Array of active bridge instances
 */
export function getAllBridges(): BaseBridge[] {
  return Array.from(activeBridges.values());
}

/**
 * Shut down a bridge by ID
 * @param bridgeId ID of the bridge to shut down
 */
export async function shutdownBridge(bridgeId: number): Promise<void> {
  const bridge = activeBridges.get(bridgeId);
  if (bridge) {
    await bridge.shutdown();
    activeBridges.delete(bridgeId);
  }
}

/**
 * Shut down all active bridges
 */
export async function shutdownAllBridges(): Promise<void> {
  for (const bridge of activeBridges.values()) {
    await bridge.shutdown();
  }
  activeBridges.clear();
}

/**
 * Initialize all active bridges from the database
 */
export async function initializeAllBridges(): Promise<void> {
  // Get all active bridge configurations from the database
  const bridgeConfigs = await storage.getBridgeConfigurations(BridgeStatus.ACTIVE);
  
  // Initialize each bridge
  for (const config of bridgeConfigs) {
    try {
      await createBridge(config);
      console.log(`Initialized bridge ${config.id} (${config.name})`);
    } catch (error) {
      console.error(`Failed to initialize bridge ${config.id} (${config.name}):`, error);
    }
  }
}