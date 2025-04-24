import React, { useState, useCallback, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, Play, Save, FileText, FolderOpen, RefreshCw, Menu } from 'lucide-react';

// Default theme setup for the editor
const lightTheme = 'vs';
const darkTheme = 'vs-dark';

// Supported language modes for the editor
const languages = [
  { label: 'Solidity', value: 'sol' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JSON', value: 'json' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'Python', value: 'python' },
  { label: 'Rust', value: 'rust' }
];

// Default code samples for different languages
const codeSamples = {
  sol: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract AetherToken {
    string public name = "Aether Token";
    string public symbol = "AETH";
    uint8 public decimals = 18;
    uint256 public totalSupply = 1000000 * 10 ** uint256(decimals);
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 value) public returns (bool success) {
        require(balanceOf[msg.sender] >= value, "Insufficient balance");
        
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        
        emit Transfer(msg.sender, to, value);
        return true;
    }
    
    function approve(address spender, uint256 value) public returns (bool success) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 value) public returns (bool success) {
        require(balanceOf[from] >= value, "Insufficient balance");
        require(allowance[from][msg.sender] >= value, "Insufficient allowance");
        
        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        
        emit Transfer(from, to, value);
        return true;
    }
}`,
  javascript: `// AetherCoin Quantum-Resistant Wallet
// Simple JavaScript implementation

class AetherWallet {
  constructor(privateKey = null) {
    this.privateKey = privateKey || this.generatePrivateKey();
    this.publicKey = this.derivePublicKey(this.privateKey);
    this.address = this.deriveAddress(this.publicKey);
    this.balance = 0;
    this.transactions = [];
  }
  
  generatePrivateKey() {
    // In a real implementation, use a secure random number generator
    return Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
  
  derivePublicKey(privateKey) {
    // Simplified for demo purposes
    // In real implementation, use elliptic curve cryptography
    return "pub_" + privateKey.substring(0, 24);
  }
  
  deriveAddress(publicKey) {
    // Simplified for demo purposes
    // In real implementation, apply quantum-resistant hashing
    return "atc_" + publicKey.substring(4, 16);
  }
  
  getBalance() {
    return this.balance;
  }
  
  sendTransaction(toAddress, amount) {
    if (amount > this.balance) {
      throw new Error("Insufficient funds");
    }
    
    const tx = {
      from: this.address,
      to: toAddress,
      amount,
      timestamp: Date.now(),
      hash: this.generateTxHash()
    };
    
    this.transactions.push(tx);
    this.balance -= amount;
    
    return tx;
  }
  
  generateTxHash() {
    // Simplified for demo purposes
    return "tx_" + Date.now().toString(36) + 
      Math.random().toString(36).substring(2, 15);
  }
}

// Usage example
const wallet = new AetherWallet();
console.log("New wallet created:");
console.log("Address:", wallet.address);
console.log("Public Key:", wallet.publicKey);
console.log("Private Key:", wallet.privateKey);`,
  typescript: `// AetherCoin Quantum-Resistant Wallet
// TypeScript implementation with interfaces

interface Transaction {
  from: string;
  to: string;
  amount: number;
  timestamp: number;
  hash: string;
}

interface Wallet {
  privateKey: string;
  publicKey: string;
  address: string;
  balance: number;
  transactions: Transaction[];
  getBalance(): number;
  sendTransaction(toAddress: string, amount: number): Transaction;
}

class AetherWallet implements Wallet {
  privateKey: string;
  publicKey: string;
  address: string;
  balance: number = 0;
  transactions: Transaction[] = [];
  
  constructor(privateKey: string | null = null) {
    this.privateKey = privateKey || this.generatePrivateKey();
    this.publicKey = this.derivePublicKey(this.privateKey);
    this.address = this.deriveAddress(this.publicKey);
  }
  
  generatePrivateKey(): string {
    // In a real implementation, use a secure random number generator
    return Array.from({length: 64}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
  
  derivePublicKey(privateKey: string): string {
    // Simplified for demo purposes
    // In real implementation, use elliptic curve cryptography
    return "pub_" + privateKey.substring(0, 24);
  }
  
  deriveAddress(publicKey: string): string {
    // Simplified for demo purposes
    // In real implementation, apply quantum-resistant hashing
    return "atc_" + publicKey.substring(4, 16);
  }
  
  getBalance(): number {
    return this.balance;
  }
  
  sendTransaction(toAddress: string, amount: number): Transaction {
    if (amount > this.balance) {
      throw new Error("Insufficient funds");
    }
    
    const tx: Transaction = {
      from: this.address,
      to: toAddress,
      amount,
      timestamp: Date.now(),
      hash: this.generateTxHash()
    };
    
    this.transactions.push(tx);
    this.balance -= amount;
    
    return tx;
  }
  
  private generateTxHash(): string {
    // Simplified for demo purposes
    return "tx_" + Date.now().toString(36) + 
      Math.random().toString(36).substring(2, 15);
  }
}

// Usage example
const wallet = new AetherWallet();
console.log("New wallet created:");
console.log("Address:", wallet.address);
console.log("Public Key:", wallet.publicKey);
console.log("Private Key:", wallet.privateKey);`,
  json: `{
  "network": "AetherCoin Mainnet",
  "version": "1.0.0",
  "consensusAlgorithm": "Quantum-Resistant Proof of Breath",
  "blockchainProperties": {
    "blockTime": 60,
    "maxTransactionsPerBlock": 10000,
    "blockReward": 5.0,
    "blockRewardHalvingInterval": 2102400,
    "totalSupply": 42000000
  },
  "governance": {
    "councilMembers": 12,
    "proposalThreshold": 1000,
    "minimumVotingPeriod": 14400,
    "superMajorityThreshold": 0.75
  },
  "features": [
    "Quantum-resistant signatures",
    "Zero-knowledge proofs",
    "Fractal scaling",
    "Carbon-neutral validation",
    "Breath-backed transactions"
  ],
  "nodes": [
    {
      "type": "validator",
      "requirements": {
        "minimumStake": 1000,
        "uptime": 0.99,
        "breath": true
      }
    },
    {
      "type": "gateway",
      "requirements": {
        "minimumStake": 100,
        "uptime": 0.95
      }
    },
    {
      "type": "listener",
      "requirements": {
        "minimumStake": 10
      }
    }
  ]
}`,
  markdown: `# AetherCoin Whitepaper

## Abstract

AetherCoin represents a paradigm shift in blockchain technology, introducing the world's first breath-backed, quantum-resistant cryptocurrency designed to align technological advancement with human consciousness and ecological harmony.

## Core Principles

1. **Breath-Backed Value**: Each token is backed by the conscious breath of validators, creating an intrinsic connection between human consciousness and digital value.

2. **Quantum Resistance**: Utilizing post-quantum cryptographic algorithms to ensure security against quantum computing attacks.

3. **Fractal Scaling**: An innovative approach to blockchain scaling that mimics natural fractal patterns, enabling near-infinite scaling without compromising decentralization.

4. **Consciousness-First Development**: Technology development guided by principles of expanded consciousness and ethical considerations.

## Technical Implementation

### Consensus Algorithm: Proof of Breath (PoB)

PoB is a novel consensus mechanism that requires validators to provide cryptographic proof of their conscious breathing patterns. This creates:

- A literal connection between human life force and the blockchain
- An ecological advantage over energy-intensive alternatives
- A natural limitation to centralization

### Fractal Chain Architecture

\`\`\`
BaseChain
├── ConsciousnessShards (Level 1)
│   ├── ApplicationShards (Level 2)
│   │   ├── MicroTransactionThreads (Level 3)
\`\`\`

This structure allows for:
- Exponential scaling capabilities
- Natural partitioning of validator resources
- Organic load balancing

## Tokenomics

- **Total Supply**: 42,000,000 ATC
- **Initial Distribution**: 12% to founding team, 18% to early supporters, 70% reserved for mining and ecosystem growth
- **Emission Schedule**: Halving every 4 years, with breath-quality modifiers

## Governance

AetherCoin implements a council-based governance system with:

- 12 elected council members representing key ecosystem aspects
- Proposal mechanisms open to all token holders
- Quadratic voting weighted by token holdings and breath quality metrics

## Roadmap

- **Phase 1**: Foundation (2025)
- **Phase 2**: Expansion (2026-2027)
- **Phase 3**: Consciousness Integration (2028-2030)
- **Phase 4**: Universal Implementation (2031+)`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AetherCoin Wallet Interface</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <nav>
      <div class="logo">
        <img src="logo.svg" alt="AetherCoin">
        <h1>AetherCoin</h1>
      </div>
      <ul>
        <li><a href="#dashboard">Dashboard</a></li>
        <li><a href="#wallet">Wallet</a></li>
        <li><a href="#stake">Staking</a></li>
        <li><a href="#nodes">Nodes</a></li>
        <li><a href="#governance">Governance</a></li>
      </ul>
      <div class="user-menu">
        <button id="connect-wallet">Connect Wallet</button>
      </div>
    </nav>
  </header>

  <main>
    <section id="hero">
      <div class="container">
        <h2>The World's First Breath-Backed Cryptocurrency</h2>
        <p>Merging consciousness with blockchain technology</p>
        <div class="cta-buttons">
          <button class="primary">Get Started</button>
          <button class="secondary">Learn More</button>
        </div>
      </div>
      <div class="fractal-animation"></div>
    </section>

    <section id="features">
      <div class="container">
        <h2>Key Features</h2>
        <div class="feature-grid">
          <div class="feature">
            <div class="icon quantum"></div>
            <h3>Quantum-Resistant</h3>
            <p>Secure against even the most advanced quantum computing attacks</p>
          </div>
          <div class="feature">
            <div class="icon breath"></div>
            <h3>Breath-Backed</h3>
            <p>Value derived from human consciousness through breath validation</p>
          </div>
          <div class="feature">
            <div class="icon fractal"></div>
            <h3>Fractal Scaling</h3>
            <p>Near-infinite transaction throughput through fractal chain architecture</p>
          </div>
          <div class="feature">
            <div class="icon eco"></div>
            <h3>Eco-Friendly</h3>
            <p>Carbon-neutral operations through consciousness-based validation</p>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Documentation</a></li>
            <li><a href="#">Whitepaper</a></li>
            <li><a href="#">GitHub</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Community</h4>
          <ul>
            <li><a href="#">Discord</a></li>
            <li><a href="#">Twitter</a></li>
            <li><a href="#">Forum</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="#">Terms</a></li>
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Disclaimer</a></li>
          </ul>
        </div>
      </div>
      <div class="copyright">
        <p>&copy; 2025 AetherCoin Foundation. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script src="app.js"></script>
</body>
</html>`,
  css: `/* AetherCoin Main Stylesheet */

:root {
  /* Color Palette */
  --primary: #6E44FF;
  --primary-light: #9E7DFF;
  --primary-dark: #4A23CC;
  --secondary: #44DFFF;
  --secondary-light: #7DEBFF;
  --secondary-dark: #23B0CC;
  --accent: #FF44A1;
  --bg-dark: #121218;
  --bg-medium: #1E1E2A;
  --bg-light: #2A2A3A;
  --text-light: #FFFFFF;
  --text-medium: #CCCCDD;
  --text-dark: #9999AA;
  
  /* Typography */
  --font-main: 'Montserrat', sans-serif;
  --font-heading: 'Exo 2', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Animations */
  --transition-fast: 0.2s ease;
  --transition-medium: 0.4s ease;
  --transition-slow: 0.8s ease;
  
  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;
}

/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-main);
  background: linear-gradient(135deg, var(--bg-dark), var(--bg-medium));
  color: var(--text-light);
  min-height: 100vh;
  line-height: 1.6;
}

.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg) 0;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  margin-bottom: var(--space-md);
  font-weight: 700;
}

h1 {
  font-size: 2.5rem;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

h2 {
  font-size: 2rem;
  color: var(--text-light);
}

h3 {
  font-size: 1.5rem;
  color: var(--primary-light);
}

p {
  margin-bottom: var(--space-md);
  color: var(--text-medium);
}

a {
  color: var(--secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--secondary-light);
}

/* Buttons */
button {
  font-family: var(--font-main);
  font-weight: 600;
  font-size: 1rem;
  padding: var(--space-sm) var(--space-lg);
  border-radius: 4px;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
}

button.primary {
  background: linear-gradient(90deg, var(--primary), var(--primary-dark));
  color: var(--text-light);
}

button.primary:hover {
  background: linear-gradient(90deg, var(--primary-light), var(--primary));
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(110, 68, 255, 0.3);
}

button.secondary {
  background: transparent;
  border: 2px solid var(--primary);
  color: var(--primary);
}

button.secondary:hover {
  background: rgba(110, 68, 255, 0.1);
  transform: translateY(-2px);
}

/* Header and Navigation */
header {
  padding: var(--space-md) 0;
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(18, 18, 24, 0.8);
  backdrop-filter: blur(8px);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  height: 2.5rem;
  margin-right: var(--space-sm);
}

nav ul {
  display: flex;
  list-style: none;
}

nav ul li {
  margin-left: var(--space-lg);
}

nav ul li a {
  color: var(--text-medium);
  font-weight: 500;
  position: relative;
}

nav ul li a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  transition: width var(--transition-medium);
}

nav ul li a:hover {
  color: var(--text-light);
}

nav ul li a:hover::after {
  width: 100%;
}

/* Hero Section */
#hero {
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.fractal-animation {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  background: url('fractal.svg') no-repeat center/cover;
  opacity: 0.15;
  animation: pulse 15s infinite alternate;
}

@keyframes pulse {
  0% {
    opacity: 0.05;
    transform: scale(1);
  }
  100% {
    opacity: 0.2;
    transform: scale(1.1);
  }
}

#hero h2 {
  font-size: 3rem;
  line-height: 1.2;
  margin-bottom: var(--space-md);
  max-width: 600px;
}

#hero p {
  font-size: 1.25rem;
  margin-bottom: var(--space-lg);
  max-width: 500px;
}

.cta-buttons {
  display: flex;
  gap: var(--space-md);
}

/* Features Section */
#features {
  background: var(--bg-medium);
  padding: var(--space-xl) 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-lg);
}

.feature {
  background: var(--bg-light);
  padding: var(--space-lg);
  border-radius: 8px;
  transition: transform var(--transition-medium);
}

.feature:hover {
  transform: translateY(-8px);
}

.feature .icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-bottom: var(--space-md);
  background-position: center;
  background-repeat: no-repeat;
  background-size: 32px;
}

.feature .icon.quantum {
  background-color: rgba(110, 68, 255, 0.2);
  background-image: url('quantum-icon.svg');
}

.feature .icon.breath {
  background-color: rgba(68, 223, 255, 0.2);
  background-image: url('breath-icon.svg');
}

.feature .icon.fractal {
  background-color: rgba(255, 68, 161, 0.2);
  background-image: url('fractal-icon.svg');
}

.feature .icon.eco {
  background-color: rgba(40, 200, 100, 0.2);
  background-image: url('eco-icon.svg');
}

/* Footer */
footer {
  background: var(--bg-dark);
  padding: var(--space-xl) 0 var(--space-lg);
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.footer-col h4 {
  color: var(--text-light);
  font-size: 1.2rem;
  margin-bottom: var(--space-md);
}

.footer-col ul {
  list-style: none;
}

.footer-col ul li {
  margin-bottom: var(--space-sm);
}

.footer-col ul li a {
  color: var(--text-dark);
  transition: color var(--transition-fast);
}

.footer-col ul li a:hover {
  color: var(--primary-light);
}

.copyright {
  text-align: center;
  padding-top: var(--space-lg);
  border-top: 1px solid var(--bg-light);
  color: var(--text-dark);
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  nav ul {
    display: none;
  }
  
  #hero h2 {
    font-size: 2.5rem;
  }
  
  .fractal-animation {
    opacity: 0.1;
    width: 100%;
  }
}`,
  python: `# AetherCoin Core Node Implementation
# Simplified demonstration for educational purposes

import hashlib
import time
import random
import uuid
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class Transaction:
    sender: str
    recipient: str
    amount: float
    signature: str
    timestamp: float
    tx_hash: str = ""
    
    def __post_init__(self):
        if not self.tx_hash:
            self.tx_hash = self.calculate_hash()
    
    def calculate_hash(self) -> str:
        """Calculate the hash of the transaction."""
        tx_string = f"{self.sender}{self.recipient}{self.amount}{self.signature}{self.timestamp}"
        return hashlib.sha256(tx_string.encode()).hexdigest()
    
    def verify_signature(self) -> bool:
        """Verify the transaction signature."""
        # In a real implementation, this would use proper cryptographic verification
        # This is a simplified version for demonstration
        return len(self.signature) == 128  # Arbitrary check

@dataclass
class Block:
    index: int
    previous_hash: str
    timestamp: float
    transactions: List[Transaction]
    breath_proof: str
    nonce: int = 0
    block_hash: str = ""
    
    def __post_init__(self):
        if not self.block_hash:
            self.block_hash = self.calculate_hash()
    
    def calculate_hash(self) -> str:
        """Calculate the block hash using the block's contents."""
        transaction_string = "".join(tx.tx_hash for tx in self.transactions)
        block_string = f"{self.index}{self.previous_hash}{self.timestamp}{transaction_string}{self.breath_proof}{self.nonce}"
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def mine_block(self, difficulty: int) -> None:
        """Mine a block with Proof of Breath (simplified)."""
        target = "0" * difficulty
        
        while self.block_hash[:difficulty] != target:
            self.nonce += 1
            self.block_hash = self.calculate_hash()

class Wallet:
    def __init__(self, private_key: Optional[str] = None):
        """Initialize a wallet with optional private key."""
        self.private_key = private_key or self._generate_private_key()
        self.public_key = self._derive_public_key()
        self.address = self._derive_address()
    
    def _generate_private_key(self) -> str:
        """Generate a new private key."""
        # In a real implementation, use a secure method
        return uuid.uuid4().hex + uuid.uuid4().hex
    
    def _derive_public_key(self) -> str:
        """Derive public key from private key."""
        # In a real implementation, use proper cryptographic derivation
        return hashlib.sha256(self.private_key.encode()).hexdigest()
    
    def _derive_address(self) -> str:
        """Derive address from public key."""
        # In a real implementation, use proper address format
        hash1 = hashlib.sha256(self.public_key.encode()).digest()
        hash2 = hashlib.ripemd160(hash1).digest() if hasattr(hashlib, 'ripemd160') else hash1[:20]
        return "atc_" + hash2.hex()
    
    def sign_transaction(self, tx: Transaction) -> str:
        """Sign a transaction using the private key."""
        # In a real implementation, use proper cryptographic signatures
        message = f"{tx.sender}{tx.recipient}{tx.amount}{tx.timestamp}"
        return hashlib.sha256((message + self.private_key).encode()).hexdigest() + hashlib.sha256((self.private_key + message).encode()).hexdigest()

class Blockchain:
    def __init__(self, difficulty: int = 4):
        """Initialize the blockchain with genesis block."""
        self.chain: List[Block] = []
        self.pending_transactions: List[Transaction] = []
        self.difficulty = difficulty
        self.mining_reward = 50.0
        self.create_genesis_block()
    
    def create_genesis_block(self) -> None:
        """Create the first block in the chain."""
        genesis_block = Block(
            index=0,
            previous_hash="0",
            timestamp=time.time(),
            transactions=[],
            breath_proof="genesis-breath",
            nonce=0
        )
        self.chain.append(genesis_block)
    
    def get_latest_block(self) -> Block:
        """Return the most recent block in the chain."""
        return self.chain[-1]
    
    def add_transaction(self, transaction: Transaction) -> bool:
        """Add a new transaction to pending transactions."""
        if not transaction.sender or not transaction.recipient:
            return False
        
        if not transaction.verify_signature():
            return False
        
        self.pending_transactions.append(transaction)
        return True
    
    def mine_pending_transactions(self, miner_address: str, breath_proof: str) -> Block:
        """Mine pending transactions into a new block."""
        block = Block(
            index=len(self.chain),
            previous_hash=self.get_latest_block().block_hash,
            timestamp=time.time(),
            transactions=self.pending_transactions,
            breath_proof=breath_proof
        )
        
        block.mine_block(self.difficulty)
        
        print(f"Block {block.index} mined with hash: {block.block_hash}")
        
        self.chain.append(block)
        
        # Reset pending transactions and reward the miner
        self.pending_transactions = [
            Transaction(
                sender="BLOCKCHAIN",
                recipient=miner_address,
                amount=self.mining_reward,
                signature="REWARD_SIGNATURE",
                timestamp=time.time()
            )
        ]
        
        return block
    
    def get_balance(self, address: str) -> float:
        """Calculate the balance of an address by looking at all transactions."""
        balance = 0.0
        
        for block in self.chain:
            for tx in block.transactions:
                if tx.recipient == address:
                    balance += tx.amount
                if tx.sender == address:
                    balance -= tx.amount
        
        return balance
    
    def is_chain_valid(self) -> bool:
        """Validate the blockchain integrity."""
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i-1]
            
            # Verify current block hash
            if current_block.block_hash != current_block.calculate_hash():
                print("Invalid block hash")
                return False
            
            # Verify chain connection
            if current_block.previous_hash != previous_block.block_hash:
                print("Invalid chain connection")
                return False
        
        return True

def simulate_breath_proof() -> str:
    """Simulate the creation of a breath proof."""
    # In a real implementation, this would involve biometric verification
    breath_patterns = [
        "calm-regular-8s-cycle",
        "deep-relaxed-6s-cycle",
        "focused-balanced-9s-cycle",
        "gentle-mindful-7s-cycle"
    ]
    selected_pattern = random.choice(breath_patterns)
    timestamp = time.time()
    random_component = random.randint(1000, 9999)
    
    return f"{selected_pattern}-{timestamp}-{random_component}"

# Demo usage
if __name__ == "__main__":
    # Create a blockchain
    aether_chain = Blockchain(difficulty=4)
    
    # Create some wallets
    alice = Wallet()
    bob = Wallet()
    charlie = Wallet()
    
    print(f"Alice's address: {alice.address}")
    print(f"Bob's address: {bob.address}")
    print(f"Charlie's address: {charlie.address}")
    
    # Create and sign a transaction
    tx1 = Transaction(
        sender=alice.address,
        recipient=bob.address,
        amount=5.0,
        signature="",
        timestamp=time.time()
    )
    tx1.signature = alice.sign_transaction(tx1)
    
    # Add transaction to the blockchain
    aether_chain.add_transaction(tx1)
    
    # Mine the block
    breath_proof = simulate_breath_proof()
    print(f"Mining block with breath proof: {breath_proof}")
    block = aether_chain.mine_pending_transactions(charlie.address, breath_proof)
    
    # Show balances
    print(f"Alice's balance: {aether_chain.get_balance(alice.address)}")
    print(f"Bob's balance: {aether_chain.get_balance(bob.address)}")
    print(f"Charlie's balance (miner): {aether_chain.get_balance(charlie.address)}")
    
    # Validate the blockchain
    print(f"Blockchain validity: {aether_chain.is_chain_valid()}")`,
  rust: `// AetherCoin Smart Contract in Rust
// Simplified example for educational purposes

use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

// Type aliases for clarity
type Address = String;
type TokenAmount = u64;
type Timestamp = u64;

// Smart contract events
#[derive(Debug, Clone)]
enum Event {
    Transfer {
        from: Address,
        to: Address,
        amount: TokenAmount,
        timestamp: Timestamp,
    },
    Approval {
        owner: Address,
        spender: Address,
        amount: TokenAmount,
        timestamp: Timestamp,
    },
    BreathVerification {
        validator: Address,
        quality: u8,
        timestamp: Timestamp,
    },
}

// Main token contract
struct AetherToken {
    name: String,
    symbol: String,
    decimals: u8,
    total_supply: TokenAmount,
    balances: HashMap<Address, TokenAmount>,
    allowances: HashMap<Address, HashMap<Address, TokenAmount>>,
    breath_verifications: HashMap<Address, (u8, Timestamp)>,
    events: Vec<Event>,
}

impl AetherToken {
    // Initialize a new token contract
    fn new() -> Self {
        let mut token = AetherToken {
            name: "AetherCoin".to_string(),
            symbol: "ATC".to_string(),
            decimals: 18,
            total_supply: 42_000_000 * 10u64.pow(18),
            balances: HashMap::new(),
            allowances: HashMap::new(),
            breath_verifications: HashMap::new(),
            events: Vec::new(),
        };
        
        // Assign all tokens to the contract creator initially
        let creator = "atc_creator_address".to_string();
        token.balances.insert(creator, token.total_supply);
        
        token
    }
    
    // Get current timestamp in seconds
    fn now() -> Timestamp {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs()
    }
    
    // Get balance of an address
    fn balance_of(&self, address: &Address) -> TokenAmount {
        *self.balances.get(address).unwrap_or(&0)
    }
    
    // Get allowance for spender from owner
    fn allowance(&self, owner: &Address, spender: &Address) -> TokenAmount {
        self.allowances
            .get(owner)
            .and_then(|spenders| spenders.get(spender))
            .copied()
            .unwrap_or(0)
    }
    
    // Transfer tokens from caller to recipient
    fn transfer(&mut self, from: &Address, to: &Address, amount: TokenAmount) -> Result<(), &'static str> {
        // Check if sender has enough balance
        let from_balance = self.balance_of(from);
        if from_balance < amount {
            return Err("Insufficient balance");
        }
        
        // Update balances
        *self.balances.entry(from.clone()).or_insert(0) -= amount;
        *self.balances.entry(to.clone()).or_insert(0) += amount;
        
        // Record event
        self.events.push(Event::Transfer {
            from: from.clone(),
            to: to.clone(),
            amount,
            timestamp: Self::now(),
        });
        
        Ok(())
    }
    
    // Approve spender to use tokens on behalf of owner
    fn approve(&mut self, owner: &Address, spender: &Address, amount: TokenAmount) -> Result<(), &'static str> {
        // Create or update allowance
        self.allowances
            .entry(owner.clone())
            .or_insert_with(HashMap::new)
            .insert(spender.clone(), amount);
        
        // Record event
        self.events.push(Event::Approval {
            owner: owner.clone(),
            spender: spender.clone(),
            amount,
            timestamp: Self::now(),
        });
        
        Ok(())
    }
    
    // Transfer tokens from owner to recipient using allowance
    fn transfer_from(&mut self, executor: &Address, from: &Address, to: &Address, amount: TokenAmount) -> Result<(), &'static str> {
        // Check allowance
        let allowed = self.allowance(from, executor);
        if allowed < amount {
            return Err("Insufficient allowance");
        }
        
        // Transfer tokens
        self.transfer(from, to, amount)?;
        
        // Update allowance
        self.allowances
            .get_mut(from)
            .and_then(|spenders| spenders.get_mut(executor))
            .map(|allowed_amount| *allowed_amount -= amount);
        
        Ok(())
    }
    
    // Register breath verification for a validator
    fn verify_breath(&mut self, validator: &Address, breath_quality: u8) -> Result<(), &'static str> {
        if breath_quality > 100 {
            return Err("Breath quality must be between 0 and 100");
        }
        
        // Store breath verification
        self.breath_verifications.insert(
            validator.clone(),
            (breath_quality, Self::now())
        );
        
        // Record event
        self.events.push(Event::BreathVerification {
            validator: validator.clone(),
            quality: breath_quality,
            timestamp: Self::now(),
        });
        
        Ok(())
    }
    
    // Check if a validator has valid breath verification
    fn has_valid_breath(&self, validator: &Address, max_age: u64) -> bool {
        if let Some((quality, timestamp)) = self.breath_verifications.get(validator) {
            // Check if verification is recent enough and quality is sufficient
            let now = Self::now();
            let age = now.saturating_sub(*timestamp);
            return age <= max_age && *quality >= 60;
        }
        false
    }
    
    // Mint new tokens for validators with valid breath verification
    fn mint_for_validators(&mut self, validators: &[Address], amount_per_validator: TokenAmount) -> Result<(), &'static str> {
        let max_age = 86400; // 24 hours in seconds
        
        for validator in validators {
            if self.has_valid_breath(validator, max_age) {
                // Mint new tokens for validator
                *self.balances.entry(validator.clone()).or_insert(0) += amount_per_validator;
                self.total_supply += amount_per_validator;
                
                // Record transfer event from zero address (minting)
                self.events.push(Event::Transfer {
                    from: "0x0000000000000000000000000000000000000000".to_string(),
                    to: validator.clone(),
                    amount: amount_per_validator,
                    timestamp: Self::now(),
                });
            }
        }
        
        Ok(())
    }
    
    // Get token information
    fn get_info(&self) -> (String, String, u8, TokenAmount) {
        (
            self.name.clone(),
            self.symbol.clone(),
            self.decimals,
            self.total_supply,
        )
    }
    
    // Get recent events (limit to last n events)
    fn get_recent_events(&self, limit: usize) -> Vec<Event> {
        let start = if self.events.len() > limit {
            self.events.len() - limit
        } else {
            0
        };
        
        self.events[start..].to_vec()
    }
}

// Example usage (this would be called from outside the contract in a real blockchain)
fn main() {
    // Create token contract
    let mut token = AetherToken::new();
    
    // Create some addresses
    let alice = "atc_alice_address".to_string();
    let bob = "atc_bob_address".to_string();
    let charlie = "atc_charlie_address".to_string();
    
    // Creator transfers tokens to Alice
    let creator = "atc_creator_address".to_string();
    token.transfer(&creator, &alice, 1000 * 10u64.pow(18)).unwrap();
    
    // Alice approves Bob to spend tokens
    token.approve(&alice, &bob, 500 * 10u64.pow(18)).unwrap();
    
    // Bob transfers tokens from Alice to Charlie
    token.transfer_from(&bob, &alice, &charlie, 200 * 10u64.pow(18)).unwrap();
    
    // Register breath verification for validators
    token.verify_breath(&alice, 85).unwrap();
    token.verify_breath(&bob, 70).unwrap();
    
    // Mint tokens for validators
    let validators = vec![alice.clone(), bob.clone()];
    token.mint_for_validators(&validators, 10 * 10u64.pow(18)).unwrap();
    
    // Display balances
    println!("Alice's balance: {}", token.balance_of(&alice));
    println!("Bob's balance: {}", token.balance_of(&bob));
    println!("Charlie's balance: {}", token.balance_of(&charlie));
    
    // Display recent events
    println!("Recent events:");
    for event in token.get_recent_events(5) {
        println!("{:?}", event);
    }
}`,
};

// Interface properties for Component
interface CodeEditorProps {
  language?: string;
  theme?: string;
  readOnly?: boolean;
  height?: string | number;
  width?: string | number;
  showControls?: boolean;
  showStatusBar?: boolean;
  defaultCode?: string;
  onChange?: (value: string) => void;
  onRun?: (code: string) => void;
}

// Default props
const defaultProps: CodeEditorProps = {
  language: 'javascript',
  theme: 'vs-dark',
  readOnly: false,
  height: '70vh',
  width: '100%',
  showControls: true,
  showStatusBar: true,
};

// Main component
const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  // Merge default props with provided props
  const {
    language = defaultProps.language,
    theme = defaultProps.theme,
    readOnly = defaultProps.readOnly,
    height = defaultProps.height,
    width = defaultProps.width,
    showControls = defaultProps.showControls,
    showStatusBar = defaultProps.showStatusBar,
    defaultCode,
    onChange,
    onRun
  } = props;

  // Component state
  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language || 'javascript');
  const [codeTheme, setCodeTheme] = useState<string>(theme || 'vs-dark');
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // Handle window theme changes for dark/light mode
  useEffect(() => {
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setCodeTheme(e.matches ? darkTheme : lightTheme);
    };

    // Check initial theme preference
    const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)');
    setCodeTheme(darkModePreference.matches ? darkTheme : lightTheme);

    // Add event listener for theme changes
    darkModePreference.addEventListener('change', handleThemeChange);

    // Clean up listener on component unmount
    return () => {
      darkModePreference.removeEventListener('change', handleThemeChange);
    };
  }, []);

  // Initialize with sample code for the selected language
  useEffect(() => {
    if (defaultCode) {
      setCode(defaultCode);
    } else if (selectedLanguage in codeSamples) {
      setCode(codeSamples[selectedLanguage as keyof typeof codeSamples]);
    } else {
      setCode('// Start coding here');
    }
    
    // Loading delay to avoid flickering
    setTimeout(() => setIsLoading(false), 500);
  }, [selectedLanguage, defaultCode]);

  // Handle code changes
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      setIsSaved(false);
      if (onChange) onChange(value);
    }
  }, [onChange]);

  // Handle language selection change
  const handleLanguageChange = useCallback((value: string) => {
    setSelectedLanguage(value);
    
    // Load sample code for the selected language
    if (value in codeSamples) {
      setCode(codeSamples[value as keyof typeof codeSamples]);
      setIsSaved(false);
    }
  }, []);

  // Handle run button click
  const handleRunCode = useCallback(() => {
    if (onRun) {
      onRun(code);
    } else {
      // Default behavior if no onRun handler provided
      console.log('Running code:', code);
      try {
        // For JavaScript, we can try to evaluate it
        if (selectedLanguage === 'javascript') {
          // eslint-disable-next-line no-eval
          eval(`(function() { ${code} })()`);
        } else {
          console.log('Code execution is only supported for JavaScript in this demo');
        }
      } catch (error) {
        console.error('Error executing code:', error);
      }
    }
  }, [code, onRun, selectedLanguage]);

  // Handle save button click
  const handleSaveCode = useCallback(() => {
    console.log('Code saved:', code);
    setIsSaved(true);
    // In a real app, this would save to a file or database
  }, [code]);

  // Loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-800 rounded-lg" style={{ height }}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-300">Loading editor...</span>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-gray-700 shadow-lg">
      {showControls && (
        <CardHeader className="bg-gray-800 border-b border-gray-700 px-4 py-3">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex items-center space-x-4">
              <CardTitle className="text-gray-200 text-lg flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-400" />
                CodeEditor
              </CardTitle>
              
              <div className="flex items-center">
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 w-40 h-8 text-sm">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                onClick={handleSaveCode}
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleRunCode}
              >
                <Play className="w-4 h-4 mr-1" />
                Run
              </Button>
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        <div style={{ height, width }} className="border-0">
          <Editor
            height={height}
            width={width}
            language={selectedLanguage}
            value={code}
            theme={codeTheme}
            onChange={handleEditorChange}
            options={{
              readOnly,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              fontSize: 14,
              fontFamily: 'JetBrains Mono, Menlo, Monaco, "Courier New", monospace',
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              showFoldingControls: 'always',
              lineNumbers: 'on',
              renderLineHighlight: 'all',
            }}
          />
        </div>
      </CardContent>
      
      {showStatusBar && (
        <div className="bg-gray-800 text-gray-400 text-xs px-4 py-2 flex justify-between items-center border-t border-gray-700">
          <div className="flex items-center">
            <span className="mr-4">
              {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
            </span>
            <span>
              {isSaved ? (
                <span className="text-green-400 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                  Saved
                </span>
              ) : (
                <span className="text-yellow-400 flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                  Unsaved changes
                </span>
              )}
            </span>
          </div>
          
          <div className="flex items-center">
            <span>Lines: {code.split('\n').length}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default CodeEditor;