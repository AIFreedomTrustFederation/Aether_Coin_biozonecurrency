"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploymentService = exports.DeploymentService = exports.NETWORK_CONFIGS = exports.DeploymentNetwork = void 0;
/**
 * DeploymentService: Manages multi-chain deployments for smart contracts
 * Handles deployments to testnets and mainnets across different blockchains.
 */
const db_1 = require("../../db");
const dapp_schema_1 = require("../../../shared/dapp-schema");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * Supported deployment networks
 */
var DeploymentNetwork;
(function (DeploymentNetwork) {
    DeploymentNetwork["ETHEREUM_MAINNET"] = "ethereum_mainnet";
    DeploymentNetwork["ETHEREUM_GOERLI"] = "ethereum_goerli";
    DeploymentNetwork["ETHEREUM_SEPOLIA"] = "ethereum_sepolia";
    DeploymentNetwork["POLYGON_MAINNET"] = "polygon_mainnet";
    DeploymentNetwork["POLYGON_MUMBAI"] = "polygon_mumbai";
    DeploymentNetwork["ARBITRUM_MAINNET"] = "arbitrum_mainnet";
    DeploymentNetwork["OPTIMISM_MAINNET"] = "optimism_mainnet";
    DeploymentNetwork["AVALANCHE_MAINNET"] = "avalanche_mainnet";
})(DeploymentNetwork || (exports.DeploymentNetwork = DeploymentNetwork = {}));
/**
 * Network configurations for deployments
 */
exports.NETWORK_CONFIGS = {
    [DeploymentNetwork.ETHEREUM_MAINNET]: {
        chainId: 1,
        name: 'Ethereum Mainnet',
        rpcUrl: 'https://mainnet.infura.io/v3/${INFURA_KEY}',
        blockExplorerUrl: 'https://etherscan.io',
        networkType: 'mainnet',
        chain: 'ethereum'
    },
    [DeploymentNetwork.ETHEREUM_GOERLI]: {
        chainId: 5,
        name: 'Ethereum Goerli Testnet',
        rpcUrl: 'https://goerli.infura.io/v3/${INFURA_KEY}',
        blockExplorerUrl: 'https://goerli.etherscan.io',
        networkType: 'testnet',
        chain: 'ethereum'
    },
    [DeploymentNetwork.ETHEREUM_SEPOLIA]: {
        chainId: 11155111,
        name: 'Ethereum Sepolia Testnet',
        rpcUrl: 'https://sepolia.infura.io/v3/${INFURA_KEY}',
        blockExplorerUrl: 'https://sepolia.etherscan.io',
        networkType: 'testnet',
        chain: 'ethereum'
    },
    [DeploymentNetwork.POLYGON_MAINNET]: {
        chainId: 137,
        name: 'Polygon Mainnet',
        rpcUrl: 'https://polygon-rpc.com',
        blockExplorerUrl: 'https://polygonscan.com',
        networkType: 'mainnet',
        chain: 'polygon'
    },
    [DeploymentNetwork.POLYGON_MUMBAI]: {
        chainId: 80001,
        name: 'Polygon Mumbai Testnet',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
        blockExplorerUrl: 'https://mumbai.polygonscan.com',
        networkType: 'testnet',
        chain: 'polygon'
    },
    [DeploymentNetwork.ARBITRUM_MAINNET]: {
        chainId: 42161,
        name: 'Arbitrum One',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        blockExplorerUrl: 'https://arbiscan.io',
        networkType: 'mainnet',
        chain: 'arbitrum'
    },
    [DeploymentNetwork.OPTIMISM_MAINNET]: {
        chainId: 10,
        name: 'Optimism',
        rpcUrl: 'https://mainnet.optimism.io',
        blockExplorerUrl: 'https://optimistic.etherscan.io',
        networkType: 'mainnet',
        chain: 'optimism'
    },
    [DeploymentNetwork.AVALANCHE_MAINNET]: {
        chainId: 43114,
        name: 'Avalanche C-Chain',
        rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
        blockExplorerUrl: 'https://snowtrace.io',
        networkType: 'mainnet',
        chain: 'avalanche'
    }
};
class DeploymentService {
    /**
     * Creates a new deployment record
     * @param data Deployment data
     * @returns The created deployment
     */
    async createDeployment(data) {
        const [deployment] = await db_1.db.insert(dapp_schema_1.chainDeployments).values(data).returning();
        return deployment;
    }
    /**
     * Gets all deployments for a DApp
     * @param userDappId DApp ID
     * @returns List of deployments
     */
    async getDappDeployments(userDappId) {
        return await db_1.db.select().from(dapp_schema_1.chainDeployments)
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.chainDeployments.userDappId, userDappId));
    }
    /**
     * Gets all deployments for a specific version of a DApp
     * @param dappVersionId DApp version ID
     * @returns List of deployments
     */
    async getVersionDeployments(dappVersionId) {
        return await db_1.db.select().from(dapp_schema_1.chainDeployments)
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.chainDeployments.dappVersionId, dappVersionId));
    }
    /**
     * Gets a specific deployment
     * @param deploymentId Deployment ID
     * @returns The deployment
     */
    async getDeployment(deploymentId) {
        const deployments = await db_1.db.select().from(dapp_schema_1.chainDeployments)
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.chainDeployments.id, deploymentId));
        return deployments[0] || null;
    }
    /**
     * Updates a deployment record
     * @param deploymentId Deployment ID
     * @param data Updated data
     * @returns The updated deployment
     */
    async updateDeployment(deploymentId, data) {
        const [updated] = await db_1.db.update(dapp_schema_1.chainDeployments)
            .set(data)
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.chainDeployments.id, deploymentId))
            .returning();
        return updated;
    }
    /**
     * Checks if a contract is verified on the block explorer
     * @param network Deployment network
     * @param contractAddress Contract address
     * @returns Verification status
     */
    async checkVerificationStatus(network, contractAddress) {
        // In a real implementation, this would query the block explorer's API
        // For now, we'll return a mock result
        return {
            verified: Math.random() > 0.5, // Mock result
            timestamp: new Date()
        };
    }
    /**
     * Gets deployment costs for different networks
     * @returns Estimated gas costs by network
     */
    async getDeploymentCosts() {
        // These would be fetched from gas price APIs in a real implementation
        return {
            [DeploymentNetwork.ETHEREUM_MAINNET]: {
                gasPrice: '50 gwei',
                estimatedCost: '0.015 ETH',
                usdEquivalent: '$30'
            },
            [DeploymentNetwork.POLYGON_MAINNET]: {
                gasPrice: '100 gwei',
                estimatedCost: '0.001 MATIC',
                usdEquivalent: '$1'
            },
            [DeploymentNetwork.ARBITRUM_MAINNET]: {
                gasPrice: '0.1 gwei',
                estimatedCost: '0.0001 ETH',
                usdEquivalent: '$0.20'
            },
            [DeploymentNetwork.OPTIMISM_MAINNET]: {
                gasPrice: '0.001 gwei',
                estimatedCost: '0.0001 ETH',
                usdEquivalent: '$0.20'
            },
            [DeploymentNetwork.AVALANCHE_MAINNET]: {
                gasPrice: '25 nAVAX',
                estimatedCost: '0.01 AVAX',
                usdEquivalent: '$0.30'
            }
        };
    }
    /**
     * Gets all supported networks
     * @returns List of supported networks
     */
    getSupportedNetworks() {
        return Object.keys(exports.NETWORK_CONFIGS).map(key => ({
            id: key,
            ...exports.NETWORK_CONFIGS[key]
        }));
    }
    /**
     * Gets deployment instructions for a specific network
     * @param network Deployment network
     * @returns Deployment instructions
     */
    getDeploymentInstructions(network) {
        const config = exports.NETWORK_CONFIGS[network];
        return {
            preDeploymentChecks: [
                `Ensure you have sufficient ${config.chain.toUpperCase()} for gas`,
                'Verify contract compilation succeeds without errors',
                'Check constructor parameters are correct'
            ],
            deploymentSteps: [
                `Configure wallet to connect to ${config.name} (Chain ID: ${config.chainId})`,
                `Set RPC URL to ${config.rpcUrl.replace('${INFURA_KEY}', 'YOUR_INFURA_KEY')}`,
                'Deploy contract with specified parameters',
                'Wait for transaction confirmation',
                `Verify contract on ${config.blockExplorerUrl}`
            ],
            postDeploymentChecks: [
                'Verify contract initialization is correct',
                'Test basic contract functionality',
                'Check events are emitted correctly',
                'Ensure admin functions are restricted properly'
            ]
        };
    }
    /**
     * Validates a contract for compatibility with a specific network
     * @param contractCode Contract code
     * @param network Deployment network
     * @returns Validation results
     */
    validateContractForNetwork(contractCode, network) {
        // In a real implementation, this would analyze the contract code
        // for compatibility issues with the target network
        // Mock implementation with some common issues
        const issues = [];
        const networkConfig = exports.NETWORK_CONFIGS[network];
        // Check for Ethereum-specific calls if not deploying to Ethereum
        if (networkConfig.chain !== 'ethereum' && contractCode.includes('block.coinbase')) {
            issues.push({
                severity: 'high',
                message: 'Usage of block.coinbase is not supported on ' + networkConfig.name,
                line: 0, // In a real implementation, we would locate the line number
                recommendation: 'Remove dependence on block.coinbase'
            });
        }
        // Check for gas price assumptions
        if (contractCode.includes('gasPrice') && networkConfig.chain === 'optimism') {
            issues.push({
                severity: 'medium',
                message: 'Optimism has different gas price mechanics than Ethereum',
                line: 0,
                recommendation: 'Revise gas price assumptions for Optimism'
            });
        }
        // Check for chain-specific precompiles
        if (networkConfig.chain !== 'avalanche' && contractCode.includes('0x0100000000000000000000000000000000000001')) {
            issues.push({
                severity: 'high',
                message: 'Usage of Avalanche-specific precompiled contracts',
                line: 0,
                recommendation: 'Remove Avalanche-specific precompiles'
            });
        }
        return {
            compatible: issues.length === 0,
            issues,
            recommendations: issues.map(issue => issue.recommendation)
        };
    }
}
exports.DeploymentService = DeploymentService;
exports.deploymentService = new DeploymentService();
