"use strict";
/**
 * Bridge Factory
 *
 * This file provides a factory for creating and managing bridges to different blockchain networks.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBridge = createBridge;
exports.getBridge = getBridge;
exports.getAllBridges = getAllBridges;
exports.shutdownBridge = shutdownBridge;
exports.shutdownAllBridges = shutdownAllBridges;
exports.initializeAllBridges = initializeAllBridges;
const ethereum_bridge_1 = require("./ethereum-bridge");
const solana_bridge_1 = require("./solana-bridge");
const filecoin_bridge_1 = require("./filecoin-bridge");
const bridge_schema_1 = require("../../shared/bridge-schema");
const storage_1 = require("../../server/storage");
// Map of active bridges
const activeBridges = new Map();
/**
 * Create a bridge instance based on the bridge configuration
 * @param bridgeConfig Bridge configuration from the database
 * @returns A bridge instance
 */
async function createBridge(bridgeConfig) {
    // Check if bridge already exists
    if (activeBridges.has(bridgeConfig.id)) {
        return activeBridges.get(bridgeConfig.id);
    }
    // Create bridge based on source network type
    let bridge;
    switch (bridgeConfig.sourceNetwork) {
        case bridge_schema_1.BridgeNetwork.ETHEREUM:
            // Load environment variables for Ethereum
            const ethRpcUrl = process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-project-id';
            const ethPrivateKey = process.env.ETHEREUM_VALIDATOR_PRIVATE_KEY; // Optional
            bridge = new ethereum_bridge_1.EthereumBridge(bridgeConfig.id, {
                name: bridgeConfig.name,
                sourceNetwork: bridgeConfig.sourceNetwork,
                targetNetwork: bridgeConfig.targetNetwork,
                contractAddressSource: bridgeConfig.contractAddressSource || undefined,
                contractAddressTarget: bridgeConfig.contractAddressTarget || undefined,
                feePercentage: bridgeConfig.feePercentage,
                minTransferAmount: bridgeConfig.minTransferAmount || undefined,
                maxTransferAmount: bridgeConfig.maxTransferAmount || undefined,
                requiredConfirmations: bridgeConfig.requiredConfirmations,
                validatorThreshold: bridgeConfig.validatorThreshold,
                securityLevel: bridgeConfig.securityLevel,
                config: bridgeConfig.config
            }, ethRpcUrl, ethPrivateKey);
            break;
        case bridge_schema_1.BridgeNetwork.SOLANA:
            // Load environment variables for Solana
            const solRpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
            const solPrivateKey = process.env.SOLANA_VALIDATOR_PRIVATE_KEY; // Optional
            bridge = new solana_bridge_1.SolanaBridge(bridgeConfig.id, {
                name: bridgeConfig.name,
                sourceNetwork: bridgeConfig.sourceNetwork,
                targetNetwork: bridgeConfig.targetNetwork,
                contractAddressSource: bridgeConfig.contractAddressSource || undefined,
                contractAddressTarget: bridgeConfig.contractAddressTarget || undefined,
                feePercentage: bridgeConfig.feePercentage,
                minTransferAmount: bridgeConfig.minTransferAmount || undefined,
                maxTransferAmount: bridgeConfig.maxTransferAmount || undefined,
                requiredConfirmations: bridgeConfig.requiredConfirmations,
                validatorThreshold: bridgeConfig.validatorThreshold,
                securityLevel: bridgeConfig.securityLevel,
                config: bridgeConfig.config
            }, solRpcUrl, solPrivateKey ? Buffer.from(solPrivateKey, 'hex') : undefined);
            break;
        case bridge_schema_1.BridgeNetwork.FILECOIN:
            // Load environment variables for Filecoin
            const filRpcUrl = process.env.FILECOIN_RPC_URL || 'https://api.node.glif.io/rpc/v0';
            const filAuthToken = process.env.FILECOIN_VALIDATOR_TOKEN; // Optional
            bridge = new filecoin_bridge_1.FilecoinBridge(bridgeConfig.id, {
                name: bridgeConfig.name,
                sourceNetwork: bridgeConfig.sourceNetwork,
                targetNetwork: bridgeConfig.targetNetwork,
                contractAddressSource: bridgeConfig.contractAddressSource || undefined,
                contractAddressTarget: bridgeConfig.contractAddressTarget || undefined,
                feePercentage: bridgeConfig.feePercentage,
                minTransferAmount: bridgeConfig.minTransferAmount || undefined,
                maxTransferAmount: bridgeConfig.maxTransferAmount || undefined,
                requiredConfirmations: bridgeConfig.requiredConfirmations,
                validatorThreshold: bridgeConfig.validatorThreshold,
                securityLevel: bridgeConfig.securityLevel,
                config: bridgeConfig.config
            }, filRpcUrl, filAuthToken);
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
function getBridge(bridgeId) {
    return activeBridges.get(bridgeId);
}
/**
 * Get all active bridges
 * @returns Array of active bridge instances
 */
function getAllBridges() {
    return Array.from(activeBridges.values());
}
/**
 * Shut down a bridge by ID
 * @param bridgeId ID of the bridge to shut down
 */
async function shutdownBridge(bridgeId) {
    const bridge = activeBridges.get(bridgeId);
    if (bridge) {
        await bridge.shutdown();
        activeBridges.delete(bridgeId);
    }
}
/**
 * Shut down all active bridges
 */
async function shutdownAllBridges() {
    for (const bridge of activeBridges.values()) {
        await bridge.shutdown();
    }
    activeBridges.clear();
}
/**
 * Initialize all active bridges from the database
 */
async function initializeAllBridges() {
    // Get all active bridge configurations from the database
    const bridgeConfigs = await storage_1.storage.getBridgeConfigurations(bridge_schema_1.BridgeStatus.ACTIVE);
    // Initialize each bridge
    for (const config of bridgeConfigs) {
        try {
            await createBridge(config);
            console.log(`Initialized bridge ${config.id} (${config.name})`);
        }
        catch (error) {
            console.error(`Failed to initialize bridge ${config.id} (${config.name}):`, error);
        }
    }
}
