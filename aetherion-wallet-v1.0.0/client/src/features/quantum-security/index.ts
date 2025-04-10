/**
 * Quantum Security Module
 * 
 * This module implements advanced quantum-resistant security features for
 * the FractalCoin blockchain, including:
 * 
 * 1. Quantum Bridge - Connection to post-quantum cryptography
 * 2. Fractal Consensus - Mathematical pattern-based consensus algorithm
 * 3. Temporal Entanglement - Non-linear time-based security
 * 4. Eternal Now Engine - Time convergence system
 */

// Export all components
export { QuantumBridge } from './lib/quantumBridge';
export { FractalConsensus } from './lib/fractalConsensus';
export { TemporalEntanglement } from './lib/temporalEntanglement';
export { getEternalNowEngine, useEternalNow } from './lib/eternalNowEngine';
export { default as QuantumSecurityDashboard } from './components/QuantumSecurityDashboard';
export { useQuantumState } from './hooks/useQuantumState';

// Export types
export type { 
  QuantumSecurityLevel,
  QuantumState,
  TemporalDirection,
  QuantumSecurityState
} from './hooks/useQuantumState';