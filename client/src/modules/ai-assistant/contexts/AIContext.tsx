import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { 
  AIState, AIAction, AIConfig, AIProviderProps,
  AIContextType, ChatMessage, Transaction,
  SecurityScan, SecurityIssue, SecurityCategory, SecuritySeverity
} from '../types';
import { secureStorage } from '../utils/SecureStorage';
import { transactionVerifier } from '../utils/TransactionVerifier';

// Initial state
const initialState: AIState = {
  isEnabled: true,
  isProcessing: false,
  messages: [],
  securityScans: [],
  credentials: [],
  heldTransactions: [],
  config: {
    automaticScanning: true,
    transactionVerification: true,
    maxStoredMessages: 50,
    matrixNotifications: false,
    notificationThreshold: 'medium'
  }
};

// Context
const AIContext = createContext<AIContextType | null>(null);

// Reducer
function aiReducer(state: AIState, action: AIAction): AIState {
  switch (action.type) {
    case 'TOGGLE_AI':
      return { ...state, isEnabled: action.payload };
      
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
      
    case 'ADD_MESSAGE': {
      const messages = [...state.messages, action.payload];
      // Keep only the most recent messages up to maxStoredMessages
      if (messages.length > state.config.maxStoredMessages) {
        messages.shift(); // Remove oldest message
      }
      return { ...state, messages };
    }
    
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
      
    case 'ADD_SCAN':
      return { 
        ...state, 
        securityScans: [action.payload, ...state.securityScans].slice(0, 20) // Keep most recent 20
      };
      
    case 'RESOLVE_ISSUE': {
      const { scanId, issueId } = action.payload;
      const updatedScans = state.securityScans.map(scan => {
        if (scan.id === scanId) {
          const updatedIssues = scan.issues.map(issue => 
            issue.id === issueId ? { ...issue, resolved: true } : issue
          );
          return { ...scan, issues: updatedIssues };
        }
        return scan;
      });
      return { ...state, securityScans: updatedScans };
    }
    
    case 'SAVE_CREDENTIAL':
      return { 
        ...state, 
        credentials: [...state.credentials, action.payload] 
      };
      
    case 'REMOVE_CREDENTIAL':
      return { 
        ...state, 
        credentials: state.credentials.filter(cred => cred.id !== action.payload) 
      };
      
    case 'HOLD_TRANSACTION':
      return { 
        ...state, 
        heldTransactions: [...state.heldTransactions, action.payload] 
      };
      
    case 'RELEASE_TRANSACTION':
      return { 
        ...state, 
        heldTransactions: state.heldTransactions.filter(tx => tx.id !== action.payload) 
      };
      
    case 'UPDATE_CONFIG':
      return { 
        ...state, 
        config: { ...state.config, ...action.payload } 
      };
      
    default:
      return state;
  }
}

// Provider
export function AIProvider({ children, initialState: customInitialState }: AIProviderProps) {
  const [state, dispatch] = useReducer(aiReducer, { ...initialState, ...customInitialState });
  
  // Utility functions
  const getIssuesByCategory = useCallback((scan: SecurityScan) => {
    return scan.issues.reduce((result, issue) => {
      if (!result[issue.category]) {
        result[issue.category] = [];
      }
      result[issue.category].push(issue);
      return result;
    }, {} as Record<SecurityCategory, SecurityIssue[]>);
  }, []);
  
  const getRiskScore = useCallback((scan: SecurityScan) => {
    return transactionVerifier.calculateRiskScore(scan);
  }, []);
  
  // Transaction verification
  const verifyTransaction = useCallback(async (tx: Transaction): Promise<SecurityScan> => {
    if (!state.isEnabled || !state.config.transactionVerification) {
      // Return an empty scan if AI is disabled or verification is turned off
      return {
        id: uuidv4(),
        timestamp: new Date(),
        type: 'transaction_verification',
        status: 'skipped',
        focus: tx.txHash,
        durationMs: 0,
        issues: []
      };
    }
    
    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    try {
      // Perform transaction verification
      const scan = await transactionVerifier.verifyTransaction(tx);
      
      // Add scan to history
      dispatch({ type: 'ADD_SCAN', payload: scan });
      
      // If issues detected and they're serious enough, add a message
      if (scan.issues.length > 0) {
        const riskScore = getRiskScore(scan);
        const shouldNotify = shouldNotifyUser(scan);
        
        if (shouldNotify) {
          const message: ChatMessage = {
            id: uuidv4(),
            sender: 'ai',
            content: generateSecurityAlertMessage(scan, riskScore),
            timestamp: new Date().toISOString(),
            type: 'security_alert',
            actionData: { scanId: scan.id }
          };
          
          dispatch({ type: 'ADD_MESSAGE', payload: message });
        }
      }
      
      return scan;
    } catch (error) {
      console.error('Transaction verification error:', error);
      
      // Add error message
      const message: ChatMessage = {
        id: uuidv4(),
        sender: 'system',
        content: `Error verifying transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: message });
      
      // Return a basic error scan
      return {
        id: uuidv4(),
        timestamp: new Date(),
        type: 'transaction_verification',
        status: 'error',
        focus: tx.txHash,
        durationMs: 0,
        issues: []
      };
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.isEnabled, state.config.transactionVerification, getRiskScore]);
  
  // Chat handling
  const handleChatMessage = useCallback((message: string) => {
    if (!state.isEnabled) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    // Add AI typing indicator
    const typingMessage: ChatMessage = {
      id: uuidv4(),
      sender: 'ai',
      content: '',
      timestamp: new Date().toISOString(),
      isLoading: true
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: typingMessage });
    
    // Simulate AI response (would connect to backend in real implementation)
    setTimeout(() => {
      // Remove typing indicator
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: typingMessage.id,
          sender: 'ai',
          content: generateAIResponse(message),
          timestamp: new Date().toISOString(),
          isLoading: false
        }
      });
      
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }, 1500);
  }, [state.isEnabled]);
  
  // Transaction holding
  const shouldHoldTransaction = useCallback((scan: SecurityScan): boolean => {
    if (!state.isEnabled || !state.config.transactionVerification) {
      return false;
    }
    
    return transactionVerifier.shouldHoldTransaction(scan);
  }, [state.isEnabled, state.config.transactionVerification]);
  
  const getHoldReason = useCallback((scan: SecurityScan): string => {
    return transactionVerifier.getHoldReason(scan);
  }, []);
  
  const holdTransaction = useCallback((tx: Transaction, reason: string, duration: number = 24): Transaction => {
    // Calculate hold until time (default 24 hours)
    const holdUntil = new Date();
    holdUntil.setHours(holdUntil.getHours() + duration);
    
    const heldTx: Transaction = {
      ...tx,
      status: 'held',
      holdReason: reason,
      holdUntil: holdUntil.toISOString()
    };
    
    dispatch({ type: 'HOLD_TRANSACTION', payload: heldTx });
    
    // Add message about holding
    const message: ChatMessage = {
      id: uuidv4(),
      sender: 'ai',
      content: `I've placed a hold on transaction ${tx.txHash.substring(0, 8)}... for your protection: ${reason}. You can review and release it in the Transactions section.`,
      timestamp: new Date().toISOString(),
      type: 'notification'
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: message });
    
    return heldTx;
  }, []);
  
  const releaseTransaction = useCallback((txId: number) => {
    dispatch({ type: 'RELEASE_TRANSACTION', payload: txId });
    
    // Add message about release
    const message: ChatMessage = {
      id: uuidv4(),
      sender: 'ai',
      content: `Transaction has been released and is now being processed.`,
      timestamp: new Date().toISOString(),
      type: 'notification'
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);
  
  // Secure credential management
  const saveCredential = useCallback(async (credential: any) => {
    try {
      const savedCredential = await secureStorage.storeCredential(credential);
      dispatch({ type: 'SAVE_CREDENTIAL', payload: savedCredential });
      return savedCredential;
    } catch (error) {
      console.error('Error storing credential:', error);
      throw error;
    }
  }, []);
  
  const getCredential = useCallback(async (id: string) => {
    try {
      return await secureStorage.getCredential(id);
    } catch (error) {
      console.error('Error retrieving credential:', error);
      return null;
    }
  }, []);
  
  // Clear chat
  const clearChat = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);
  
  // Helper functions
  const shouldNotifyUser = (scan: SecurityScan): boolean => {
    const thresholds: Record<SecurityThreshold, SecuritySeverity[]> = {
      high: ['critical', 'high'],
      medium: ['critical', 'high', 'medium'],
      low: ['critical', 'high', 'medium', 'low'],
      info: ['critical', 'high', 'medium', 'low', 'info']
    };
    
    const notifyFor = thresholds[state.config.notificationThreshold];
    return scan.issues.some(issue => notifyFor.includes(issue.severity));
  };
  
  const generateSecurityAlertMessage = (scan: SecurityScan, riskScore: number): string => {
    const criticalCount = scan.issues.filter(issue => issue.severity === 'critical').length;
    const highCount = scan.issues.filter(issue => issue.severity === 'high').length;
    const mediumCount = scan.issues.filter(issue => issue.severity === 'medium').length;
    
    let message = `⚠️ **Security Alert for Transaction ${scan.focus.substring(0, 8)}...**\n\n`;
    
    message += `Risk Score: ${riskScore}/100\n\n`;
    
    if (criticalCount > 0) {
      message += `🚨 **${criticalCount} Critical Issue${criticalCount > 1 ? 's' : ''}**\n`;
    }
    
    if (highCount > 0) {
      message += `⚠️ **${highCount} High Severity Issue${highCount > 1 ? 's' : ''}**\n`;
    }
    
    if (mediumCount > 0) {
      message += `⚠ **${mediumCount} Medium Severity Issue${mediumCount > 1 ? 's' : ''}**\n`;
    }
    
    message += `\nTop concern: ${scan.issues[0]?.title || 'Unknown'}\n\n`;
    
    message += 'Review the Security tab for details.';
    
    return message;
  };
  
  const generateAIResponse = (userMessage: string): string => {
    // This would connect to a real AI or backend in production
    // For now, we'll use a simple response system
    
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi ')) {
      return "Hello! I'm your AI assistant for Aetherion. I can help you with transaction security, wallet management, and answer questions about blockchain.";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('can you')) {
      return "I can help you with:\n\n• Analyzing transaction security\n• Detecting phishing attempts\n• Monitoring smart contracts\n• Setting up secure credentials\n• Optimizing gas fees\n\nJust let me know what you need assistance with!";
    }
    
    if (lowerMessage.includes('transaction') || lowerMessage.includes('transfer')) {
      return "I can analyze your transactions for security issues. If you're about to send funds, I'll automatically check for potential scams, unusual activity, and contract vulnerabilities.";
    }
    
    if (lowerMessage.includes('security') || lowerMessage.includes('safe')) {
      return "Your security is my top priority. I use advanced analysis to detect phishing attempts, screen smart contracts for vulnerabilities, and alert you to unusual activity. You can adjust my security settings in the AI Settings tab.";
    }
    
    if (lowerMessage.includes('credential') || lowerMessage.includes('api') || lowerMessage.includes('key')) {
      return "I can securely store your credentials like API keys and wallet access tokens. All data is encrypted locally on your device, and I can help you manage them in the Settings tab.";
    }
    
    // Default response
    return "I'm here to help protect your transactions and assets. You can ask me about blockchain security, transaction analysis, or managing your encrypted credentials. Is there something specific you'd like assistance with?";
  };
  
  const contextValue: AIContextType = {
    state,
    dispatch,
    verifyTransaction,
    shouldHoldTransaction,
    getHoldReason,
    getIssuesByCategory,
    getRiskScore,
    saveCredential,
    getCredential,
    handleChatMessage,
    holdTransaction,
    releaseTransaction,
    clearChat
  };
  
  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
}

// Hook
export function useAI(): AIContextType {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}