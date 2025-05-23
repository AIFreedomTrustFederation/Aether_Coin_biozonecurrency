#!/usr/bin/env node

import { BridgeTestRunner } from './bridges/bridge-test-runner';
import * as fs from 'fs';
import * as path from 'path';

/**
 * CLI script to run quantum superposition tests on Aetherion bridges
 * This tool allows testing the quantum resistance of the bridge implementations.
 */
async function main() {
  console.log('🔮 Aetherion Quantum Superposition Test Protocol 🔮');
  console.log('=================================================');
  
  const args = process.argv.slice(2);
  const testRunner = new BridgeTestRunner();
  
  // Parse command line arguments
  const options = {
    bridge: args.find(arg => !arg.startsWith('-')) || 'all',
    qubits: parseInt(getArgValue(args, '--qubits', '-q') || '4'),
    iterations: parseInt(getArgValue(args, '--iterations', '-i') || '10'),
    saveResults: hasArg(args, '--save', '-s'),
    verbose: hasArg(args, '--verbose', '-v'),
  };

  console.log(`Running tests with ${options.qubits} qubits and ${options.iterations} iterations.`);
  
  try {
    let results: any;
    
    // Run tests on specific bridge or all bridges
    if (options.bridge === 'all') {
      console.log('Testing all available bridges...');
      results = await testRunner.testAllBridges({
        qubits: options.qubits,
        iterations: options.iterations
      });
    } else {
      console.log(`Testing ${options.bridge} bridge...`);
      const singleResult = await testRunner.testBridge(options.bridge, {
        qubits: options.qubits,
        iterations: options.iterations
      });
      results = { [options.bridge]: singleResult };
    }
    
    // Generate and display summary
    const summary = testRunner.generateSummaryReport(results);
    
    console.log('\n📊 Test Results Summary:');
    console.log(`Total tests run: ${summary.totalTestsRun}`);
    console.log(`Test date: ${summary.testDate.toISOString()}`);
    console.log(`Most secure bridge: ${summary.mostSecureBridge}`);
    
    if (summary.vulnerableBridges.length > 0) {
      console.log(`Vulnerable bridges: ${summary.vulnerableBridges.join(', ')}`);
    } else {
      console.log('No vulnerable bridges detected.');
    }
    
    console.log('\nBridge Results:');
    summary.bridgeResults.forEach((result) => {
      const resistanceScore = (result.quantumResistanceScore * 100).toFixed(2);
      console.log(`- ${result.bridgeName}: Quantum Resistance Score: ${resistanceScore}%`);
      console.log(`  Success Rate: ${(result.successRate * 100).toFixed(2)}%, Confirmation Time: ${result.avgConfirmationTime.toFixed(2)}s`);
      console.log(`  Vulnerabilities: ${result.vulnerabilitiesCount} (${result.highSeverityCount} high severity)`);
    });
    
    // Display detailed results in verbose mode
    if (options.verbose) {
      console.log('\n🔍 Detailed Vulnerabilities:');
      Object.entries(results).forEach(([bridgeKey, result]: [string, any]) => {
        console.log(`\n${bridgeKey.toUpperCase()} BRIDGE VULNERABILITIES:`);
        if (result.vulnerabilities.length === 0) {
          console.log('  No vulnerabilities detected');
        } else {
          result.vulnerabilities.forEach((vuln: any, i: number) => {
            console.log(`  ${i + 1}. ${vuln.type} (${vuln.severity}):`);
            console.log(`     ${vuln.description}`);
            if (vuln.details) {
              console.log(`     Details: ${JSON.stringify(vuln.details, null, 2)}`);
            }
          });
        }
      });
    }
    
    // Save results to file if requested
    if (options.saveResults) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const resultsDir = path.join(__dirname, '../test-results');
      
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      
      const fileName = path.join(resultsDir, `bridge-test-${timestamp}.json`);
      fs.writeFileSync(fileName, JSON.stringify({
        summary,
        detailedResults: results
      }, null, 2));
      
      console.log(`\nDetailed results saved to: ${fileName}`);
    }
    
  } catch (error) {
    console.error('Error running tests:', error);
    console.log('\nAvailable bridges: ' + testRunner.getAvailableBridges().join(', '));
    process.exit(1);
  }
}

function getArgValue(args: string[], longFlag: string, shortFlag: string): string | undefined {
  const longFlagIndex = args.findIndex(arg => arg.startsWith(`${longFlag}=`));
  if (longFlagIndex >= 0) {
    return args[longFlagIndex].split('=')[1];
  }
  
  const longFlagWithSpaceIndex = args.indexOf(longFlag);
  if (longFlagWithSpaceIndex >= 0 && args.length > longFlagWithSpaceIndex + 1) {
    return args[longFlagWithSpaceIndex + 1];
  }
  
  const shortFlagIndex = args.findIndex(arg => arg.startsWith(`${shortFlag}=`));
  if (shortFlagIndex >= 0) {
    return args[shortFlagIndex].split('=')[1];
  }
  
  const shortFlagWithSpaceIndex = args.indexOf(shortFlag);
  if (shortFlagWithSpaceIndex >= 0 && args.length > shortFlagWithSpaceIndex + 1) {
    return args[shortFlagWithSpaceIndex + 1];
  }
  
  return undefined;
}

function hasArg(args: string[], longFlag: string, shortFlag: string): boolean {
  return args.includes(longFlag) || args.includes(shortFlag);
}

// Run main function
main().catch(console.error);