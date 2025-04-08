/**
 * Aetherion Blockchain Safety Module Example
 * 
 * This example demonstrates how to use the safety module to evaluate
 * and certify an Aetherion blockchain implementation for security compliance.
 */

import { 
  evaluateBlockchainSafety, 
  BlockchainParams,
  SafetyEvaluationResult,
  generateKyberKeyPair,
  signBlockchainTransaction,
  Block,
  Transaction,
  CertificationLevel
} from '../index.js';

// Create a mock block for demonstration purposes
function createMockBlock(
  index: number, 
  previousHash: string, 
  transactions: Transaction[]
): Block {
  const timestamp = Date.now() - (index * 60000); // Each block 1 minute apart
  
  // Calculate transaction fees
  let totalFees = "0";
  for (const tx of transactions) {
    totalFees = (BigInt(totalFees) + BigInt(tx.fee)).toString();
  }
  
  // Calculate merkle root
  const txIds = transactions.map(tx => tx.id);
  const merkleRoot = calculateMockMerkleRoot(txIds);
  
  // Create block header
  const header = {
    version: 1,
    previousHash,
    merkleRoot,
    timestamp,
    difficulty: 4,
    nonce: Math.floor(Math.random() * 1000000),
    height: index
  };
  
  // Create block hash (simplified for demo)
  const headerString = JSON.stringify(header);
  const hash = require('crypto')
    .createHash('sha256')
    .update(headerString)
    .digest('hex');
  
  // Create quantum security proof (simplified for demo)
  const quantumSecurityProof = require('crypto')
    .createHash('sha512')
    .update(hash)
    .digest('hex');
  
  return {
    header,
    transactions,
    hash,
    totalFees,
    size: headerString.length + JSON.stringify(transactions).length,
    quantumSecurityProof
  };
}

// Calculate a mock merkle root
function calculateMockMerkleRoot(txIds: string[]): string {
  if (txIds.length === 0) {
    return require('crypto').createHash('sha256').update('').digest('hex');
  }
  
  if (txIds.length === 1) {
    return txIds[0];
  }
  
  // Simplified merkle root calculation for demo
  const combinedString = txIds.join('');
  return require('crypto')
    .createHash('sha256')
    .update(combinedString)
    .digest('hex');
}

// Create a mock transaction
function createMockTransaction(
  from: string,
  to: string,
  amount: string,
  privateKey: Uint8Array
): Transaction {
  const timestamp = Date.now();
  const fee = "1000000000000000"; // Example gas fee
  
  const txData = {
    from,
    to,
    amount,
    timestamp,
    fee
  };
  
  // Calculate transaction ID
  const id = require('crypto')
    .createHash('sha256')
    .update(JSON.stringify(txData))
    .digest('hex');
  
  // Generate signature using quantum-resistant algorithm
  const signature = signBlockchainTransaction(txData, privateKey);
  
  return {
    id,
    from,
    to,
    amount,
    timestamp,
    fee,
    signature,
    data: { type: 'transfer' }
  };
}

// Main example function
async function runSafetyCheckExample(): Promise<void> {
  console.log("\n====== Aetherion Blockchain Safety Check Example ======\n");
  
  // Generate key pairs for sample addresses
  console.log("Generating quantum-resistant key pairs...");
  const aliceKeys = generateKyberKeyPair(5); // Highest security level
  const bobKeys = generateKyberKeyPair(5);
  
  // Create mock addresses (simplified)
  const aliceAddress = require('crypto')
    .createHash('sha256')
    .update(Buffer.from(aliceKeys.publicKey))
    .digest('hex');
  
  const bobAddress = require('crypto')
    .createHash('sha256')
    .update(Buffer.from(bobKeys.publicKey))
    .digest('hex');
  
  console.log(`Generated addresses:\n- Alice: ${aliceAddress.substring(0, 10)}...\n- Bob: ${bobAddress.substring(0, 10)}...`);
  
  // Create sample transactions
  console.log("\nCreating sample transactions...");
  const transactions: Transaction[] = [
    createMockTransaction(aliceAddress, bobAddress, "5000000000000000000", aliceKeys.privateKey),
    createMockTransaction(bobAddress, aliceAddress, "2500000000000000000", bobKeys.privateKey),
    createMockTransaction(aliceAddress, bobAddress, "1000000000000000000", aliceKeys.privateKey)
  ];
  
  console.log(`Created ${transactions.length} sample transactions`);
  
  // Create sample blocks
  console.log("\nCreating sample blockchain...");
  const blocks: Block[] = [];
  
  // Genesis block
  blocks.push(createMockBlock(0, "0000000000000000000000000000000000000000000000000000000000000000", []));
  
  // Regular blocks with transactions
  for (let i = 1; i <= 3; i++) {
    const transactionsInBlock = i === 2 ? transactions : []; // Put transactions in block 2
    blocks.push(createMockBlock(i, blocks[i-1].hash, transactionsInBlock));
  }
  
  console.log(`Created ${blocks.length} blocks`);
  
  // Configure blockchain parameters
  const blockchainParams: BlockchainParams = {
    blocks,
    transactions,
    configuration: {
      version: "1.0.0",
      consensusType: "PoS-BFT", // Proof of Stake with Byzantine Fault Tolerance
      governanceType: "DAO-Fractal", // DAO with fractal governance
      networkId: 1,
      chainId: 161803 // Golden ratio based
    },
    securityFeatures: {
      cryptographicPrimitives: [
        "CRYSTALS-Kyber", // Post-quantum key encapsulation
        "SPHINCS+",      // Post-quantum signatures
        "SHA-256",       // Hash function
        "SHA-3",         // Advanced hash function
        "AES-256"        // Symmetric encryption
      ],
      quantumResistance: true,
      keyManagement: [
        "quantum-resistant-derivation",
        "hierarchical-deterministic",
        "multi-signature"
      ]
    },
    smartContractLanguages: [
      "AetherScript 1.0", // Native quantum-resistant language
      "Solidity >=0.8",   // For compatibility
      "Rust"              // For systems programming
    ],
    privacyFeatures: [
      "zero-knowledge-proofs",
      "stealth-addresses",
      "confidential-transactions"
    ]
  };
  
  // Run the safety evaluation
  console.log("\nEvaluating blockchain safety...");
  console.time("Evaluation Time");
  
  const evaluationResult = evaluateBlockchainSafety(blockchainParams, 'quantum');
  
  console.timeEnd("Evaluation Time");
  
  // Display results
  console.log("\n====== Evaluation Results ======");
  console.log(`Overall Result: ${evaluationResult.overallResult ? 'PASSED' : 'FAILED'}`);
  console.log(`Security Score: ${evaluationResult.securityScore}/100`);
  console.log(`Safety Grade: ${evaluationResult.safetyGrade}`);
  console.log(`Certification Level: ${evaluationResult.certificationReport.certificationLevel}`);
  
  console.log("\n====== Security Category Scores ======");
  evaluationResult.certificationReport.categoryResults.forEach((category: { passed: boolean; category: string; score: number }) => {
    const passSymbol = category.passed ? '✓' : '✗';
    console.log(`${passSymbol} ${category.category}: ${category.score}/100`);
  });
  
  console.log("\n====== Recommendations ======");
  evaluationResult.recommendations.forEach((rec: string, i: number) => {
    console.log(`${i+1}. ${rec}`);
  });
  
  console.log("\n====== Quantum Threat Analysis ======");
  console.log(`Threat Level: ${evaluationResult.quantumThreatAnalysis.threatLevel}`);
  console.log(`Anomalies: ${evaluationResult.quantumThreatAnalysis.anomalies}`);
  console.log(`Recommendations: ${evaluationResult.quantumThreatAnalysis.recommendations}`);
  
  console.log("\n====== Blockchain Safety Evaluation Complete ======\n");
}

// Run the example
runSafetyCheckExample().catch(console.error);

// Export the example function for external use
export default runSafetyCheckExample;