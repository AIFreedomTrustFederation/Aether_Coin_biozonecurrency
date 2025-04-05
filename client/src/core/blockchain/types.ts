/**
 * Core blockchain types for Aetherion
 * Defines the data structures used throughout the blockchain implementation
 */

// Block structure for the blockchain
export interface Block {
  index: number;           // Position in blockchain
  timestamp: number;       // Block creation timestamp
  transactions: Transaction[]; // List of transactions in block
  previousHash: string;    // Hash of the previous block (ensures chain integrity)
  hash: string;            // Hash of this block
  nonce: number;           // Value used for mining (proof of work)
  difficulty: number;      // How many leading zeros required in hash
  merkleRoot: string;      // Root of merkle tree of transactions
  miner: string;           // Address of miner who found this block
  reward: number;          // Mining reward amount
  size: number;            // Block size in bytes
  version: number;         // Protocol version
  stateRoot?: string;      // Optional: Root hash of the state trie (for Ethereum-like chains)
  receiptsRoot?: string;   // Optional: Root hash of the transaction receipts
  extraData?: string;      // Optional: Additional data field
}

// Transaction structure
export interface Transaction {
  id: string;              // Transaction ID (hash)
  fromAddress: string | null; // Sender address (null for mining rewards)
  toAddress: string;       // Recipient address
  amount: number;          // Amount to transfer
  timestamp: number;       // Transaction creation time
  fee: number;             // Transaction fee
  signature?: string;      // Digital signature proving ownership
  data?: string;           // Optional data payload for smart contracts
  nonce?: number;          // Transaction sequence number (prevents replay attacks)
  status?: 'pending' | 'confirmed' | 'failed'; // Transaction status
  confirmations?: number;  // Number of confirmations
  gasLimit?: number;       // Maximum gas units (for smart contract execution)
  gasPrice?: number;       // Price per gas unit
}

// Wallet interface
export interface AetherionWallet {
  address: string;         // Public address
  privateKey?: string;     // Private key (should be encrypted or not exposed)
  publicKey?: string;      // Public key
  balance: number;         // Current balance
  transactions?: Transaction[]; // Transaction history
  keystore?: any;          // Encrypted keystore file
}

// Node in the P2P network
export interface NetworkNode {
  url: string;             // Node URL
  lastSeen: number;        // Last communication timestamp
  version: string;         // Node software version
  height: number;          // Current blockchain height
  status: 'active' | 'inactive' | 'syncing'; // Node status
  latency?: number;        // Network latency in ms
  peerId?: string;         // Unique peer identifier
}

// Mining configuration
export interface MiningConfig {
  enabled: boolean;        // Is mining enabled
  threads: number;         // CPU mining threads
  gpuMining: boolean;      // Use GPU for mining
  gpuDevices: number[];    // GPU device indices to use
  algorithm: MiningAlgorithm; // Mining algorithm to use
  miningAddress: string;   // Address to receive rewards
  autoAdjustDifficulty: boolean; // Automatically adjust difficulty
  targetBlockTime: number; // Target time between blocks in seconds
  minimumTransactionFee: number; // Minimum fee to include transaction
  maxTransactionsPerBlock: number; // Maximum txs in a block
}

// Mining algorithms supported
export enum MiningAlgorithm {
  SHA256 = 'sha256',       // Bitcoin's algorithm
  ETHASH = 'ethash',       // Ethereum's algorithm
  CRYPTONIGHT = 'cryptonight', // Monero's algorithm
  SCRYPT = 'scrypt',       // Litecoin's algorithm
  RANDOMX = 'randomx',     // Monero's newer algorithm (CPU-friendly)
  QUANTUM = 'quantum',     // Our quantum-resistant algorithm
}

// Consensus mechanisms
export enum ConsensusType {
  PROOF_OF_WORK = 'pow',
  PROOF_OF_STAKE = 'pos',
  DELEGATED_PROOF_OF_STAKE = 'dpos',
  QUANTUM_PROOF_OF_WORK = 'qpow', // Our quantum-resistant PoW
  PRACTICAL_BYZANTINE_FAULT_TOLERANCE = 'pbft',
}

// Blockchain state
export interface BlockchainState {
  chain: Block[];          // Full blockchain
  pendingTransactions: Transaction[]; // Mempool
  difficulty: number;      // Current mining difficulty
  miningReward: number;    // Current block reward
  lastBlockTime: number;   // Timestamp of last block
  nodes: NetworkNode[];    // Known network nodes
  isMining: boolean;       // Mining status
  syncStatus: SyncStatus;  // Blockchain sync status
  consensusType: ConsensusType; // Active consensus mechanism
  networkHashrate: number; // Estimated network hashrate
  version: string;         // Software version
  genesisBlock: Block;     // First block in the chain
}

// Sync status
export interface SyncStatus {
  isSyncing: boolean;      // Currently syncing
  currentBlock: number;    // Current block processed
  highestBlock: number;    // Highest known block
  startingBlock: number;   // Block where sync started
  pulledStates?: number;   // Number of state entries downloaded
  knownStates?: number;    // Number of states to download
  percentage?: number;     // Sync percentage complete
}

// Mining performance metrics
export interface MiningMetrics {
  hashrate: number;        // Hashes per second
  acceptedShares: number;  // Accepted shares count
  rejectedShares: number;  // Rejected shares count
  blocksFound: number;     // Number of blocks found
  lastShareTime: number;   // Last share timestamp
  uptime: number;          // Mining uptime in seconds
  cpuUsage: number;        // CPU usage percentage
  memoryUsage: number;     // Memory usage in MB
  gpuTemperature?: number[]; // GPU temperatures
  gpuFanSpeed?: number[];  // GPU fan speeds in percentage
  gpuPowerUsage?: number[]; // GPU power usage in watts
  expectedTimeToFind?: number; // Estimated time to find a block
}

// Hash function interface
export interface HashFunction {
  (data: string): string;  // Function that takes data and returns a hash
}

// Difficulty adjustment parameters
export interface DifficultyParams {
  targetBlockTime: number; // Target time between blocks in seconds
  difficultyAdjustmentInterval: number; // Blocks between difficulty adjustments
  maxDifficultyChange: number; // Maximum % change in difficulty
  minimumDifficulty: number; // Minimum difficulty value
}