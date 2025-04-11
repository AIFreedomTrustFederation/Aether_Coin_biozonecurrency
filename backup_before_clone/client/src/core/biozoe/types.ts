/**
 * AetherCoin BioZoeCurrency Types
 * 
 * Contains all the type definitions for the AetherCoin BioZoeCurrency ecosystem.
 * Defines the token lifecycle states, transaction types, and quantum entanglement types.
 */

/**
 * BioZoe Token Lifecycle States
 * 
 * Tokens progress through four stages following natural biological patterns:
 * - SEED: Initial token creation state (like a seed in nature)
 * - GROWTH: Developing token with increasing potential (growing plant)
 * - FLOWERING: Peak value and energy state (flowering plant)
 * - LEGACY: Transformed state that enables new generation (fruit/seed bearing)
 */
export enum BioZoeLifecycleState {
  SEED = 'seed',
  GROWTH = 'growth',
  FLOWERING = 'flowering',
  LEGACY = 'legacy'
}

/**
 * Quantum Entanglement Types
 * 
 * Defines how tokens can be quantum entangled with each other:
 * - SYMBIOTIC: Both tokens grow together
 * - COMPETITIVE: One token's growth can diminish the other
 * - CATALYTIC: One token accelerates another's growth
 * - REGENERATIVE: Tokens help each other recover
 */
export enum QuantumEntanglementType {
  SYMBIOTIC = 'symbiotic',
  COMPETITIVE = 'competitive',
  CATALYTIC = 'catalytic',
  REGENERATIVE = 'regenerative'
}

/**
 * BioZoe Transaction Types
 * 
 * Defines the various operations that can occur in the ecosystem:
 * - GENESIS: Creation of a new token
 * - NURTURE: Transferring energy to accelerate growth
 * - POLLINATE: Connecting tokens for entanglement
 * - HARVEST: Transforming a flowering token to legacy
 * - TRANSFER: Moving token between wallets
 * - LEGACY_CONTRIBUTION: Energy contribution from legacy token
 */
export enum BioZoeTransactionType {
  GENESIS = 'genesis',
  NURTURE = 'nurture',
  POLLINATE = 'pollinate',
  HARVEST = 'harvest',
  TRANSFER = 'transfer',
  LEGACY_CONTRIBUTION = 'legacy_contribution'
}

/**
 * Complex number position in Mandelbrot set
 */
export interface MandelbrotPosition {
  re: number;  // Real part
  im: number;  // Imaginary part
}

/**
 * Position on the toroidal field
 */
export interface ToroidalCoordinates {
  theta: number;  // Angle around the tube (0 to 2π)
  phi: number;    // Angle around the circle (0 to 2π)
}

/**
 * AetherCoin Token Interface
 * 
 * Represents a BioZoeCurrency token with all its properties
 */
export interface AetherCoinToken {
  id: string;
  quantumSignature: string;
  ownerAddress: string;
  lifeState: BioZoeLifecycleState;
  birthBlock: number;
  lifeCycles: number;
  age: number;
  entangledPairs: string[];
  entanglementType: QuantumEntanglementType;
  entanglementStrength: number;
  baseValue: number;
  growthFactor: number;
  potentialEnergy: number;
  fibonacciIndex: number;
  goldenRatioFactor: number;
  dnaSequence: string;
  mutationRate: number;
  resilience: number;
  entropy: number;
  merkleProof: string[];
  merklePosition: number;
  toroidalCoordinates: ToroidalCoordinates;
  energyFlowDirection: number;
  energyFlowMagnitude: number;
  mandelbrotPosition: MandelbrotPosition;
  color: string;
}

/**
 * Structure for tracking token entanglement visualizations
 */
export interface EntanglementNetwork {
  nodes: string[];
  edges: Array<{source: string, target: string, strength: number}>;
}

/**
 * AetherCoin Wallet Interface
 * 
 * Represents a user's wallet in the BioZoeCurrency ecosystem
 */
export interface AetherCoinWallet {
  address: string;
  tokens: AetherCoinToken[];
  entanglementNetwork: {
    nodes: string[];
    edges: Array<{source: string, target: string, strength: number}>;
  };
  energyPool: number;
  toroidalPosition: ToroidalCoordinates;
  fibonacciProgression: number[];
}

/**
 * BioZoe Transaction Interface
 * 
 * Represents operations in the BioZoeCurrency ecosystem
 */
export interface BioZoeTransaction {
  id: string;
  type: BioZoeTransactionType;
  timestamp: number;
  sourceTokenId: string | null;
  targetTokenId: string;
  energyTransferred: number;
  transformationFactor: number;
  fibonacciIndex: number;
  mandelbrotIterations: number;
  signature: string;
  quantumEntanglementEffect: number;
}

/**
 * Network state interface for ecosystem metrics
 */
export interface BioZoeNetworkState {
  totalTokens: number;
  activeTokens: number;
  lifecycleDistribution: {
    [key in BioZoeLifecycleState]: number;
  };
  totalEnergy: number;
  entanglementDensity: number;
  toroidalFlowRate: number;
  mandelbrotDepth: number;
  fibonacciExpansion: number;
  systemResilience: number;
  goldenRatioAlignment: number;
  lastBlockHeight: number;
  genesisTimestamp: number;
}

/**
 * Token genesis configuration
 */
export interface TokenGenesisConfig {
  initialLifeState: BioZoeLifecycleState;
  initialBaseValue: number;
  initialEntanglementType: QuantumEntanglementType;
  initialMutationRate: number;
  initialResilience: number;
  mandelbrotPosition?: MandelbrotPosition;
  dnaTemplate?: string;
  toroidalSector?: number;
  colorSpectrum?: string;
}

/**
 * Growth parameters for the ecosystem
 */
export interface GrowthParameters {
  lifecycleThresholds: {
    [key in BioZoeLifecycleState]: number;
  };
  mandelbrotGrowthFactor: number;
  entanglementAmplification: number;
  fibonacciProgressionRate: number;
  mutationProbability: number;
  toroidalFlowStrength: number;
  goldenRatioInfluence: number;
  entropicDecayRate: number;
}