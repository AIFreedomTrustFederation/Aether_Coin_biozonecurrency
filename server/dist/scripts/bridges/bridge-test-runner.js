"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeTestRunner = void 0;
const ethereum_bridge_1 = require("./ethereum-bridge");
const solana_bridge_1 = require("./solana-bridge");
const filecoin_bridge_1 = require("./filecoin-bridge");
const quantum_test_protocol_1 = require("./quantum-test-protocol");
const bridge_schema_1 = require("../../shared/bridge-schema");
/**
 * Bridge Test Runner
 *
 * A utility class to run quantum tests on different bridge implementations.
 * This allows us to evaluate the quantum resistance of various bridge protocols.
 */
class BridgeTestRunner {
    constructor() {
        this.bridges = new Map();
        // Initialize available bridges
        this.initializeBridges();
    }
    /**
     * Registers all available bridge implementations
     */
    initializeBridges() {
        // Ethereum bridge
        const ethereumBridge = new ethereum_bridge_1.EthereumBridge();
        ethereumBridge.initialize({
            id: 1,
            name: 'Aetherion-Ethereum Bridge',
            sourceNetwork: 'AETHERION',
            targetNetwork: 'ETHEREUM',
            contractAddressSource: '0xAetherionBridgeContract',
            contractAddressTarget: '0xEthereumBridgeContract',
            status: bridge_schema_1.BridgeStatus.ACTIVE,
            feePercentage: '0.001',
            requiredConfirmations: 12,
            validatorThreshold: 7,
            createdAt: new Date(),
            updatedAt: new Date(),
            config: {
                gasLimit: 350000,
                maxGasPrice: '50', // gwei
                timeoutSeconds: 300,
            },
            securityLevel: 'HIGH'
        });
        this.bridges.set('ethereum', ethereumBridge);
        // Solana bridge
        const solanaBridge = new solana_bridge_1.SolanaBridge();
        solanaBridge.initialize({
            id: 2,
            name: 'Aetherion-Solana Bridge',
            sourceNetwork: 'AETHERION',
            targetNetwork: 'SOLANA',
            contractAddressSource: 'aethSolanaBridge123',
            contractAddressTarget: 'solAethBridge123',
            status: bridge_schema_1.BridgeStatus.ACTIVE,
            feePercentage: '0.0005',
            requiredConfirmations: 32,
            validatorThreshold: 5,
            createdAt: new Date(),
            updatedAt: new Date(),
            config: {
                maxRetries: 3,
                timeoutSeconds: 240,
            },
            securityLevel: 'HIGH'
        });
        this.bridges.set('solana', solanaBridge);
        // Filecoin bridge
        const filecoinBridge = new filecoin_bridge_1.FilecoinBridge();
        filecoinBridge.initialize({
            id: 3,
            name: 'Aetherion-Filecoin Bridge',
            sourceNetwork: 'AETHERION',
            targetNetwork: 'FILECOIN',
            contractAddressSource: 'AethFilecoinBridgeAddr',
            contractAddressTarget: 'FilecoinAethBridgeAddr',
            status: bridge_schema_1.BridgeStatus.ACTIVE,
            feePercentage: '0.001',
            requiredConfirmations: 5,
            validatorThreshold: 4,
            createdAt: new Date(),
            updatedAt: new Date(),
            config: {
                maxRetries: 3,
                timeoutSeconds: 180,
            },
            securityLevel: 'MEDIUM'
        });
        this.bridges.set('filecoin', filecoinBridge);
    }
    /**
     * Gets available bridge implementations
     */
    getAvailableBridges() {
        return Array.from(this.bridges.keys());
    }
    /**
     * Runs quantum tests on a specific bridge
     */
    async testBridge(bridgeKey, options = {}) {
        const bridge = this.bridges.get(bridgeKey);
        if (!bridge) {
            throw new Error(`Bridge with key ${bridgeKey} not found. Available bridges: ${this.getAvailableBridges().join(', ')}`);
        }
        const qubits = options.qubits || 4;
        const iterations = options.iterations || 10;
        const testProtocol = new quantum_test_protocol_1.QuantumTestProtocol(bridge, qubits, iterations);
        return await testProtocol.runTest();
    }
    /**
     * Runs quantum tests on all available bridges
     */
    async testAllBridges(options = {}) {
        const results = {};
        const bridgeKeys = this.getAvailableBridges();
        for (const bridgeKey of bridgeKeys) {
            console.log(`Running quantum tests on ${bridgeKey} bridge...`);
            results[bridgeKey] = await this.testBridge(bridgeKey, options);
        }
        return results;
    }
    /**
     * Gets a summary report of test results across all bridges
     */
    generateSummaryReport(results) {
        const bridgeResults = Object.entries(results).map(([bridgeKey, result]) => ({
            bridgeName: bridgeKey,
            successRate: result.metrics.successRate,
            avgConfirmationTime: result.metrics.avgConfirmationTime,
            quantumResistanceScore: result.metrics.quantumResistanceScore,
            vulnerabilitiesCount: result.vulnerabilities.length,
            highSeverityCount: result.vulnerabilities.filter(v => v.severity === 'HIGH' || v.severity === 'CRITICAL').length
        }));
        // Sort bridges by quantum resistance score (descending)
        bridgeResults.sort((a, b) => b.quantumResistanceScore - a.quantumResistanceScore);
        return {
            totalTestsRun: Object.values(results).reduce((sum, r) => sum + r.transactions.length, 0),
            testDate: new Date(),
            bridgeResults,
            mostSecureBridge: bridgeResults[0]?.bridgeName || 'None',
            vulnerableBridges: bridgeResults
                .filter(r => r.quantumResistanceScore < 0.7)
                .map(r => r.bridgeName)
        };
    }
}
exports.BridgeTestRunner = BridgeTestRunner;
// Example usage:
// const testRunner = new BridgeTestRunner();
// const results = await testRunner.testAllBridges({ qubits: 6, iterations: 20 });
// const summary = testRunner.generateSummaryReport(results);
// console.log(JSON.stringify(summary, null, 2));
