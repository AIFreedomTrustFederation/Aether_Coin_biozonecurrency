"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const AIContext_1 = require("../contexts/AIContext");
const types_1 = require("../types");
/**
 * Custom hook for AI assistant operations
 * Provides simplified interface for common AI operations
 */
const useAIContext = () => {
    const { state, sendMessage, verifyTransaction, reverseTransaction, clearHistory, updateConfig } = (0, AIContext_1.useAI)();
    // Check if the AI is initialized
    const isInitialized = (0, react_1.useMemo)(() => state.isInitialized, [state.isInitialized]);
    // Get chat messages
    const messages = (0, react_1.useMemo)(() => state.messages, [state.messages]);
    // Check if AI is typing
    const isTyping = (0, react_1.useMemo)(() => state.isTyping, [state.isTyping]);
    // Get unread message count
    const unreadCount = (0, react_1.useMemo)(() => state.unreadCount, [state.unreadCount]);
    // Get AI configuration
    const config = (0, react_1.useMemo)(() => state.config, [state.config]);
    // Get current session ID
    const sessionId = (0, react_1.useMemo)(() => state.currentSession, [state.currentSession]);
    // Send a chat message with intent analysis
    const sendChatMessage = (0, react_1.useCallback)((text, attachments, intent) => {
        // In a real implementation, we would analyze the text for intent
        // if no explicit intent is provided
        const detectedIntent = intent || types_1.AIIntent.SmallTalk;
        // Log the intent for analysis
        console.log(`Message intent: ${detectedIntent}`);
        // Send the message through the context
        sendMessage(text, attachments);
    }, [sendMessage]);
    // Helper for transaction verification
    const checkTransaction = (0, react_1.useCallback)(async (transaction) => {
        return await verifyTransaction(transaction);
    }, [verifyTransaction]);
    // Helper for transaction reversal
    const cancelTransaction = (0, react_1.useCallback)(async (transactionId) => {
        return await reverseTransaction(transactionId);
    }, [reverseTransaction]);
    // Clear chat history
    const resetChat = (0, react_1.useCallback)(() => {
        clearHistory();
    }, [clearHistory]);
    // Update assistant configuration
    const setConfig = (0, react_1.useCallback)((configUpdate) => {
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
exports.default = useAIContext;
