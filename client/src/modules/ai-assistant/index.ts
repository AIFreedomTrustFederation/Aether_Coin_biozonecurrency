/**
 * AI Assistant Module
 * 
 * Provides AI-powered assistance for cryptocurrency wallet operations, including:
 * - Transaction security verification
 * - Credential management with secure storage
 * - Transaction holds for suspicious activities
 * - Chat interface for user interactions
 */

// Components
import ProgressCircle from './components/ProgressCircle';
import TransactionHold from './components/TransactionHold';

// Context
// import { AIProvider, useAIContext } from './contexts/AIContext';

// Utilities
import { secureStorage } from './utils/SecureStorage';
import { transactionVerifier } from './utils/TransactionVerifier';
import { 
  formatAddress,
  formatTokenAmount,
  formatCurrency,
  formatDate,
  formatDuration,
  formatLargeNumber,
  formatPercentage,
  convertWeiToGwei
} from './utils/formatters';

// Export components and utilities
export {
  // Components
  ProgressCircle,
  TransactionHold,
  
  // Context
  // AIProvider,
  // useAIContext,
  
  // Utilities
  secureStorage,
  transactionVerifier,
  formatAddress,
  formatTokenAmount,
  formatCurrency,
  formatDate,
  formatDuration,
  formatLargeNumber,
  formatPercentage,
  convertWeiToGwei
};

// Export types
export * from './types';