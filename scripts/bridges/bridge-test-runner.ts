import { BaseBridge } from './base-bridge';
import { EthereumBridge } from './ethereum-bridge';
import { SolanaBridge } from './solana-bridge';
import { FilecoinBridge } from './filecoin-bridge';
import { QuantumTestProtocol, QuantumTestResult } from './quantum-test-protocol';
import { BridgeStatus } from '../../shared/bridge-schema';

/**
 * Bridge Test Runner
 * 
 * A utility class to run quantum tests on different bridge implementations.
 * This allows us to evaluate the quantum resistance of various bridge protocols.
 */
export class BridgeTestRunner {
  private bridges: Map<string, BaseBridge> = new Map();
  
  constructor() {
    // Initialize available bridges
    this.initializeBridges();
  }
  
  /**
   * Registers all available bridge implementations
   */
  private initializeBridges(): void {
    // Ethereum bridge
    const ethereumBridge = new EthereumBridge();
    ethereumBridge.initialize({
      id: 1,
      name: 'Aetherion-Ethereum Bridge',
      sourceNetwork: 'AETHERION',
      targetNetwork: 'ETHEREUM',
      contractAddressSource: '0xAetherionBridgeContract',
      contractAddressTarget: '0xEthereumBridgeContract',
      status: BridgeStatus.ACTIVE,
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
    const solanaBridge = new SolanaBridge();
    solanaBridge.initialize({
      id: 2,
      name: 'Aetherion-Solana Bridge',
      sourceNetwork: 'AETHERION',
      targetNetwork: 'SOLANA',
      contractAddressSource: 'aethSolanaBridge123',
      contractAddressTarget: 'solAethBridge123',
      status: BridgeStatus.ACTIVE,
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
    const filecoinBridge = new FilecoinBridge();
    filecoinBridge.initialize({
      id: 3,
      name: 'Aetherion-Filecoin Bridge',
      sourceNetwork: 'AETHERION',
      targetNetwork: 'FILECOIN',
      contractAddressSource: 'AethFilecoinBridgeAddr',
      contractAddressTarget: 'FilecoinAethBridgeAddr',
      status: BridgeStatus.ACTIVE,
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
  getAvailableBridges(): string[] {
    return Array.from(this.bridges.keys());
  }
  
  /**
   * Runs quantum tests on a specific bridge
   */
  async testBridge(bridgeKey: string, options: TestOptions = {}): Promise<QuantumTestResult> {
    const bridge = this.bridges.get(bridgeKey);
    if (!bridge) {
      throw new Error(`Bridge with key ${bridgeKey} not found. Available bridges: ${this.getAvailableBridges().join(', ')}`);
    }
    
    const qubits = options.qubits || 4;
    const iterations = options.iterations || 10;
    
    const testProtocol = new QuantumTestProtocol(bridge, qubits, iterations);
    return await testProtocol.runTest();
  }
  
  /**
   * Runs quantum tests on all available bridges
   */
  async testAllBridges(options: TestOptions = {}): Promise<Record<string, QuantumTestResult>> {
    const results: Record<string, QuantumTestResult> = {};
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
  generateSummaryReport(results: Record<string, QuantumTestResult>): BridgeTestSummary {
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

interface TestOptions {
  qubits?: number;
  iterations?: number;
}

interface BridgeTestSummary {
  totalTestsRun: number;
  testDate: Date;
  bridgeResults: {
    bridgeName: string;
    successRate: number;
    avgConfirmationTime: number;
    quantumResistanceScore: number;
    vulnerabilitiesCount: number;
    highSeverityCount: number;
  }[];
  mostSecureBridge: string;
  vulnerableBridges: string[];
}

// Example usage:
// const testRunner = new BridgeTestRunner();
// const results = await testRunner.testAllBridges({ qubits: 6, iterations: 20 });
// const summary = testRunner.generateSummaryReport(results);
// console.log(JSON.stringify(summary, null, 2));