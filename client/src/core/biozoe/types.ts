/**
 * BioZoeCurrency Core Types
 * 
 * Defines the data structures for AetherCoin (ATC) as the first BioZoeCurrency
 * implementation with Mandelbrot recursive, Fibonacci sequences, and Torus field
 * energy flows based on Golden Ratio principles.
 */

// Lifecycle states of a BioZoe token
export enum BioZoeLifecycleState {
  SEED = 'Seed',       // Initial state, newly created token
  GROWTH = 'Growth',   // Active growth phase
  FLOWERING = 'Flowering', // Peak value, ready for transformation
  LEGACY = 'Legacy'    // Transformed state, contributing to ecosystem
}

// Quantum entanglement types
export enum QuantumEntanglementType {
  PARALLEL = 'Parallel',       // Direct 1:1 entanglement
  FIBONACCI = 'Fibonacci',     // Fibonacci-based branching entanglement
  MANDELBROT = 'Mandelbrot',   // Complex recursive entanglement
  TOROIDAL = 'Toroidal'        // Circular flow entanglement
}

// AetherCoin Token (ATC) representing a BioZoeCurrency
export interface AetherCoinToken {
  // Core identifiers
  id: string;                     // Unique token identifier
  quantumSignature: string;       // Quantum-derived signature
  ownerAddress: string;           // Current token owner's address
  
  // Life state properties
  lifeState: BioZoeLifecycleState; // Current lifecycle state
  birthBlock: number;             // Block when token was created
  lifeCycles: number;             // Number of transformations undergone
  age: number;                    // Age in blocks since creation
  
  // Quantum entanglement properties
  entangledPairs: string[];       // IDs of entangled tokens
  entanglementType: QuantumEntanglementType; // Type of quantum connection
  entanglementStrength: number;   // 0-1 ratio of connection strength
  
  // Growth metrics based on natural patterns
  baseValue: number;              // Initial quantum value
  growthFactor: number;           // Current multiplier from life cycles
  potentialEnergy: number;        // Stored energy for future growth
  fibonacciIndex: number;         // Position in Fibonacci sequence
  goldenRatioFactor: number;      // Golden Ratio multiplier (φ = 1.618...)
  
  // Biological properties
  dnaSequence: string;            // Operational history hash
  mutationRate: number;           // Adaptability factor
  resilience: number;             // Ability to withstand network stress
  entropy: number;                // Measure of disorder/energy potential
  
  // Merkle tree position (for fractal validation)
  merkleProof: string[];          // Merkle proof for token verification
  merklePosition: number;         // Position in the Merkle tree

  // Torus field properties
  toroidalCoordinates: {          // Position in the torus field
    theta: number;                // Angular coordinate (0 to 2π)
    phi: number;                  // Poloidal coordinate (0 to 2π)
    r: number;                    // Radial distance from center
  };
  energyFlowDirection: number;    // Direction of energy flow in radians
  energyFlowMagnitude: number;    // Magnitude of energy flow
  
  // Visualization properties
  mandelbrotPosition: {           // Position in Mandelbrot set
    re: number;                   // Real component
    im: number;                   // Imaginary component
  };
  color: string;                  // Visual representation color
}

// BioZoe Transaction representing energy transfer between tokens
export interface BioZoeTransaction {
  id: string;                      // Transaction ID
  type: BioZoeTransactionType;     // Transaction type
  timestamp: number;               // When transaction occurred
  sourceTokenId: string | null;    // Source token (null for genesis)
  targetTokenId: string;           // Target token
  energyTransferred: number;       // Amount of energy transferred
  transformationFactor: number;    // How much the energy transforms during transfer
  fibonacciIndex: number;          // Position in Fibonacci sequence
  mandelbrotIterations: number;    // Depth in Mandelbrot recursion
  signature: string;               // Cryptographic proof
  quantumEntanglementEffect: number; // Effect on quantum entanglement
}

// Types of BioZoe transactions
export enum BioZoeTransactionType {
  GENESIS = 'Genesis',             // Creation of new token
  NURTURE = 'Nurture',             // Growth enhancement
  POLLINATE = 'Pollinate',         // Creating entanglement between tokens
  HARVEST = 'Harvest',             // Transformation of flowering token
  LEGACY_CONTRIBUTION = 'Legacy'   // Ongoing contribution from legacy tokens
}

// AetherCoin Wallet for managing BioZoeCurrency tokens
export interface AetherCoinWallet {
  address: string;                 // Wallet address
  privateKey?: string;             // Private key (should be encrypted)
  publicKey?: string;              // Public key
  tokens: AetherCoinToken[];       // Owned tokens
  entanglementNetwork: {           // Visualization of quantum connections
    nodes: string[];               // Token IDs
    edges: {                       // Connections
      source: string;
      target: string;
      strength: number;
      type: QuantumEntanglementType;
    }[];
  };
  energyPool: number;              // Uncommitted energy
  toroidalPosition: {              // Position in global torus field
    theta: number;
    phi: number;
  };
  fibonacciProgression: number[];  // Personal Fibonacci progression
}

// BioZoe Network State
export interface BioZoeNetworkState {
  totalTokens: number;             // Total tokens in existence
  activeTokens: number;            // Tokens in active states
  lifecycleDistribution: {         // Distribution across lifecycle states
    [BioZoeLifecycleState.SEED]: number;
    [BioZoeLifecycleState.GROWTH]: number;
    [BioZoeLifecycleState.FLOWERING]: number;
    [BioZoeLifecycleState.LEGACY]: number;
  };
  totalEnergy: number;             // Total energy in the system
  entanglementDensity: number;     // Average connections per token
  toroidalFlowRate: number;        // Rate of energy circulation
  mandelbrotDepth: number;         // Maximum recursion depth
  fibonacciExpansion: number;      // Latest Fibonacci number reached
  systemResilience: number;        // Overall system stability
  goldenRatioAlignment: number;    // Alignment with golden ratio (0-1)
  lastBlockHeight: number;         // Latest block height
  genesisTimestamp: number;        // When the network was created
}

// Growth Algorithm Parameters
export interface GrowthParameters {
  // Fibonacci sequence parameters
  fibonacciBase: number;           // Starting value
  fibonacciExpansionRate: number;  // How fast the sequence progresses
  
  // Mandelbrot parameters
  mandelbrotDepthWeight: number;   // How much depth affects growth
  mandelbrotBoundary: number;      // Boundary value for Mandelbrot set
  
  // Golden Ratio parameters
  goldenRatio: number;             // Golden ratio constant (φ = 1.618...)
  goldenRatioWeight: number;       // Impact of golden ratio on growth
  
  // Lifecycle parameters
  seedMaturationRate: number;      // How fast seeds mature to growth
  growthAccelerationFactor: number; // Acceleration during growth phase
  floweringThreshold: number;      // When growth transitions to flowering
  legacyContributionFactor: number; // How much legacy tokens contribute
  
  // Quantum entanglement parameters
  entanglementStrengthGrowth: number; // How fast entanglement strengthens
  entanglementEnergyTransfer: number; // Energy transfer efficiency
  
  // Torus field parameters
  toroidalFlowResistance: number;  // Resistance to energy flow
  toroidalFlowAcceleration: number; // How flow accelerates
}

// BioZoe Token Genesis Configuration
export interface TokenGenesisConfig {
  initialLifeState: BioZoeLifecycleState;
  initialBaseValue: number;
  initialEntanglementType: QuantumEntanglementType;
  initialMutationRate: number;
  initialResilience: number;
  mandelbrotPosition: {
    re: number;
    im: number;
  };
  dnaTemplate: string;          // Base DNA template to modify
  toroidalSector: number;       // 0-7, defining the sector in torus
  colorSpectrum: 'warm' | 'cool' | 'vibrant' | 'earthy' | 'quantum';
}
`