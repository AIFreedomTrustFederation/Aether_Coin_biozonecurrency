# Aetherion Quantum Validator

A comprehensive security and validation module for the Aetherion blockchain network, providing post-quantum cryptographic security and transaction validation.

## Features

- **Post-quantum cryptography** - Implementation of quantum-resistant algorithms (CRYSTALS-Kyber, SPHINCS+)
- **Blockchain consensus validation** - Validation of blocks and transactions for consensus compliance
- **Blockchain safety certification** - Certification of blockchain implementations for security compliance
- **Quantum threat analysis** - Detection and analysis of potential quantum computing threats

## Basic Usage

### Quantum-Resistant Cryptography

```typescript
import { generateKyberKeyPair, signBlockchainTransaction } from "quantum-validator";

// Generate a quantum-resistant key pair
const keyPair = generateKyberKeyPair(3); // Security level 3

// Sign a transaction with the private key
const transaction = { amount: "100", to: "recipient", from: "sender" };
const signature = signBlockchainTransaction(transaction, keyPair.privateKey);
```

### Blockchain Validation

```typescript
import { validateBlock } from "quantum-validator";

// Validate a block
const validationResult = validateBlock(block, previousBlock, Date.now(), "quantum");

if (validationResult.isValid) {
  console.log(`Block valid with security score: ${validationResult.securityScore}`);
} else {
  console.error(`Block invalid: ${validationResult.errors.join(", ")}`);
}
```

### Safety Certification

```typescript
import { evaluateBlockchainSafety } from "quantum-validator";

// Evaluate the safety of a blockchain implementation
const result = evaluateBlockchainSafety(blockchainParams, "quantum");

console.log(`Safety grade: ${result.safetyGrade}`);
console.log(`Security score: ${result.securityScore}/100`);
```

### Request Validation

```typescript
import { validateRequest } from "quantum-validator";

// Validate a transaction request
const requestData = {
  from: "sender",
  to: "recipient",
  amount: "1.5",
  signature: "...",
  timestamp: Date.now(),
  type: "transfer"
};

const validationResult = validateRequest(requestData, 3);

if (validationResult.isValid) {
  // Process the request
} else {
  // Handle invalid request
  console.error(validationResult.anomalies);
}
```

## Documentation

For more detailed usage instructions, see the [Integration Guide](./INTEGRATING.md).

## Security Features

### Quantum Resistance

The quantum-resistant cryptography module uses post-quantum algorithms that are designed to be secure against attacks from quantum computers:

- CRYSTALS-Kyber for key encapsulation
- SPHINCS+ for signatures
- Hybrid classical-quantum cryptography

### Temporal Entanglement

Temporal entanglement is a unique security feature that creates timestamped proofs of data integrity:

```typescript
import { createTemporalEntanglement, verifyTemporalEntanglement } from "quantum-validator";

// Create a temporal entanglement proof
const data = "important data";
const entanglement = createTemporalEntanglement(data, 3);

// Later, verify the data hasnt been modified
const isValid = verifyTemporalEntanglement(data, entanglement);
```

## License

MIT License
