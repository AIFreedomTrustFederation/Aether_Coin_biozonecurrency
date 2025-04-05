/**
 * Blockchain Module Entry Point
 * 
 * This file exports the main components of the blockchain implementation.
 */

// Export types
export * from './types';

// Export main blockchain implementation
export { Blockchain, blockchain } from './Blockchain';

// Export blockchain service (main integration point)
export { blockchainService } from './BlockchainService';

// Export crypto utilities
export * from './crypto/wallet';

// Export miners
export { CPUMiner } from './mining/CPUMiner';
export { GPUMiner } from './mining/GPUMiner';

// Export utilities
export * from './utils/merkle';