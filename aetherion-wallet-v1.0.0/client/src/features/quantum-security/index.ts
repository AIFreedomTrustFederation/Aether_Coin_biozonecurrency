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

// Export all components with correct implementations
export * as quantumBridge from './lib/quantumBridge';
export * as fractalConsensus from './lib/fractalConsensus';
export * as temporalEntanglement from './lib/temporalEntanglement';
export * as temporalState from './lib/temporalState';
export { getEternalNowEngine } from './lib/eternalNowEngine';
export { default as QuantumSecurityDashboard } from './components/QuantumSecurityDashboard';
export { useQuantumState } from './hooks/useQuantumState';

// Log active exports for debugging
console.log('Quantum Security Module loaded with the following exports:', {
  quantumBridge: true,
  fractalConsensus: true,
  temporalEntanglement: true,
  temporalState: true,
  eternalNowEngine: true,
  QuantumSecurityDashboard: true,
  useQuantumState: true
});

// Export types
export type { 
  QuantumSecurityLevel,
  QuantumState,
  TemporalDirection,
  QuantumSecurityState
} from './hooks/useQuantumState';