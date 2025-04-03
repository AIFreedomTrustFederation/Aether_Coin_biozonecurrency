/**
 * AI Assistant Module
 * 
 * This module provides a comprehensive AI assistant for the wallet platform
 * with features like secure credential storage, transaction verification,
 * security scanning, and conversational interface.
 */

// Components
import AIAssistant from './components/AIAssistant';
import ChatInterface from './components/ChatInterface';
import SecurityHistory from './components/SecurityHistory';
import TransactionHold from './components/TransactionHold';
import AISettings from './components/AISettings';
import ProgressCircle from './components/ProgressCircle';

// Context
import { AIProvider, useAI } from './contexts/AIContext';

// Utils
import { 
  formatDate,
  formatDuration,
  formatAddress,
  formatTokenAmount,
  formatPercentage,
  formatCurrency
} from './utils/formatters';

// Types
import {
  AIAssistantProps,
  AIConfig,
  AIContextType,
  AIProviderProps,
  AIState,
  ChatInterfaceProps,
  ChatMessage,
  AISettingsProps,
  SecurityHistoryProps,
  SecurityIssue,
  SecurityScan,
  SecureCredential,
  Transaction,
  TransactionHoldProps,
  ProgressCircleProps
} from './types';

// Export everything
export {
  // Components
  AIAssistant,
  ChatInterface,
  SecurityHistory,
  TransactionHold,
  AISettings,
  ProgressCircle,
  
  // Context
  AIProvider,
  useAI,
  
  // Utils
  formatDate,
  formatDuration,
  formatAddress,
  formatTokenAmount,
  formatPercentage,
  formatCurrency,
  
  // Types
  type AIAssistantProps,
  type AIConfig,
  type AIContextType,
  type AIProviderProps,
  type AIState,
  type ChatInterfaceProps,
  type ChatMessage,
  type AISettingsProps,
  type SecurityHistoryProps,
  type SecurityIssue,
  type SecurityScan,
  type SecureCredential,
  type Transaction,
  type TransactionHoldProps,
  type ProgressCircleProps
};

// Default export
export default AIAssistant;