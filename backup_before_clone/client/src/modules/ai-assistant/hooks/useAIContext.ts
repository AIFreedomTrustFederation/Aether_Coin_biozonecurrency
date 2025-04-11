import { useCallback, useMemo } from 'react';
import { useAI } from '../contexts/AIContext';
import { AIIntent, Message, TransactionToVerify } from '../types';

/**
 * Custom hook for AI assistant operations
 * Provides simplified interface for common AI operations
 */
const useAIContext = () => {
  const { state, sendMessage, verifyTransaction, reverseTransaction, clearHistory, updateConfig } = useAI();
  
  // Check if the AI is initialized
  const isInitialized = useMemo(() => state.isInitialized, [state.isInitialized]);
  
  // Get chat messages
  const messages = useMemo(() => state.messages, [state.messages]);
  
  // Check if AI is typing
  const isTyping = useMemo(() => state.isTyping, [state.isTyping]);
  
  // Get unread message count
  const unreadCount = useMemo(() => state.unreadCount, [state.unreadCount]);
  
  // Get AI configuration
  const config = useMemo(() => state.config, [state.config]);
  
  // Get current session ID
  const sessionId = useMemo(() => state.currentSession, [state.currentSession]);
  
  // Send a chat message with intent analysis
  const sendChatMessage = useCallback((
    text: string, 
    attachments?: Message['attachments'],
    intent?: AIIntent
  ) => {
    // In a real implementation, we would analyze the text for intent
    // if no explicit intent is provided
    const detectedIntent = intent || AIIntent.SmallTalk;
    
    // Log the intent for analysis
    console.log(`Message intent: ${detectedIntent}`);
    
    // Send the message through the context
    sendMessage(text, attachments);
  }, [sendMessage]);

  // Helper for transaction verification
  const checkTransaction = useCallback(async (transaction: TransactionToVerify) => {
    return await verifyTransaction(transaction);
  }, [verifyTransaction]);

  // Helper for transaction reversal
  const cancelTransaction = useCallback(async (transactionId: string) => {
    return await reverseTransaction(transactionId);
  }, [reverseTransaction]);

  // Clear chat history
  const resetChat = useCallback(() => {
    clearHistory();
  }, [clearHistory]);

  // Update assistant configuration
  const setConfig = useCallback((configUpdate: Partial<typeof config>) => {
    updateConfig(configUpdate);
  }, [updateConfig]);

  return {
    isInitialized,
    messages,
    isTyping,
    unreadCount,
    config,
    sessionId,
    sendChatMessage,
    checkTransaction,
    cancelTransaction,
    resetChat,
    setConfig
  };
};

export default useAIContext;