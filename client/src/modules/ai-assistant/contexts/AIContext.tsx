import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  AIState, 
  AIAction, 
  AIContextType, 
  ChatMessage, 
  Transaction, 
  SecurityScan,
  SecurityCategory, 
  SecurityIssue,
  AIProviderProps
} from '../types';
import { transactionVerifier } from '../utils/TransactionVerifier';
import { secureStorage } from '../utils/SecureStorage';
import { formatTimestamp } from '../utils/formatters';
import { trainingData } from '../data/training-data';

// Initial AI state
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
    maxStoredMessages: 100,
    matrixNotifications: false,
    notificationThreshold: 'medium'
  }
};

// Create context
const AIContext = createContext<AIContextType | null>(null);

// Reducer for handling state updates
function aiReducer(state: AIState, action: AIAction): AIState {
  switch (action.type) {
    case 'TOGGLE_AI':
      return {
        ...state,
        isEnabled: action.payload
      };
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload
      };
    case 'ADD_MESSAGE':
      const messages = [...state.messages, action.payload];
      // Limit stored messages according to config
      if (messages.length > state.config.maxStoredMessages) {
        messages.splice(0, messages.length - state.config.maxStoredMessages);
      }
      return {
        ...state,
        messages
      };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: []
      };
    case 'ADD_SCAN':
      return {
        ...state,
        securityScans: [action.payload, ...state.securityScans]
      };
    case 'RESOLVE_ISSUE': {
      const { scanId, issueId } = action.payload;
      const securityScans = state.securityScans.map(scan => {
        if (scan.id === scanId) {
          const issues = scan.issues.map(issue => {
            if (issue.id === issueId) {
              return { ...issue, resolved: true };
            }
            return issue;
          });
          return { ...scan, issues };
        }
        return scan;
      });
      return {
        ...state,
        securityScans
      };
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
    case 'RELEASE_TRANSACTION': {
      const txId = action.payload;
      return {
        ...state,
        heldTransactions: state.heldTransactions.filter(tx => 
          tx.id !== txId && tx.id !== txId.toString()
        )
      };
    }
    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload
        }
      };
    default:
      return state;
  }
}

// Provider component
export function AIProvider({ children, userId, initialState: customInitialState }: AIProviderProps) {
  const [state, dispatch] = useReducer(aiReducer, { ...initialState, ...customInitialState });

  // Initialize secure storage
  React.useEffect(() => {
    if (userId) {
      secureStorage.initialize(`aetherion-${userId}`);
    }
  }, [userId]);

  // Verify a transaction for security issues
  const verifyTransaction = useCallback(async (tx: Transaction): Promise<SecurityScan> => {
    if (!state.isEnabled || !state.config.transactionVerification) {
      // Return empty scan if AI is disabled
      return {
        id: uuidv4(),
        timestamp: new Date(),
        type: 'transaction_verification',
        status: 'skipped',
        focus: tx.txHash || '',
        durationMs: 0,
        issues: []
      };
    }

    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    try {
      // Create loading message
      const loadingMessageId = uuidv4();
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: loadingMessageId,
          sender: 'ai',
          content: 'Analyzing transaction security...',
          timestamp: new Date().toISOString(),
          isLoading: true
        }
      });

      // Verify transaction
      const scan = await transactionVerifier.verifyTransaction(tx);
      
      // Add scan to history
      dispatch({ type: 'ADD_SCAN', payload: scan });
      
      // Add result message
      const riskScore = getRiskScore(scan);
      let messageContent = '';
      
      if (scan.issues.length === 0) {
        messageContent = `Transaction verification complete. No issues detected.`;
      } else {
        const severityCount = {
          critical: scan.issues.filter(i => i.severity === 'critical').length,
          high: scan.issues.filter(i => i.severity === 'high').length,
          medium: scan.issues.filter(i => i.severity === 'medium').length,
          low: scan.issues.filter(i => i.severity === 'low').length,
          info: scan.issues.filter(i => i.severity === 'info').length
        };
        
        messageContent = `Transaction verification complete. Found ${scan.issues.length} issue${scan.issues.length === 1 ? '' : 's'}.\n\n`;
        if (severityCount.critical > 0) {
          messageContent += `⚠️ Critical issues: ${severityCount.critical}\n`;
        }
        if (severityCount.high > 0) {
          messageContent += `⚠️ High severity: ${severityCount.high}\n`;
        }
        if (severityCount.medium > 0) {
          messageContent += `⚠️ Medium severity: ${severityCount.medium}\n`;
        }
        if (severityCount.low > 0) {
          messageContent += `ℹ️ Low severity: ${severityCount.low}\n`;
        }
        if (severityCount.info > 0) {
          messageContent += `ℹ️ Info: ${severityCount.info}\n`;
        }
        
        messageContent += `\nRisk score: ${riskScore}/100\n`;
        messageContent += shouldHoldTransaction(scan) ? 
          '\n⛔ This transaction has been put on hold for your safety. You can review details and release it if desired.' : 
          '\n✅ Transaction can proceed, but review any warnings before confirming.';
      }
      
      // Update loading message with result
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: loadingMessageId,
          sender: 'ai',
          content: messageContent,
          timestamp: new Date().toISOString(),
          isLoading: false,
          actionData: { scan }
        }
      });
      
      return scan;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      
      // Create error scan
      const errorScan: SecurityScan = {
        id: uuidv4(),
        timestamp: new Date(),
        type: 'transaction_verification',
        status: 'error',
        focus: tx.txHash || '',
        durationMs: 0,
        issues: []
      };
      
      // Add error message
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: uuidv4(),
          sender: 'ai',
          content: 'There was an error verifying your transaction. Please try again.',
          timestamp: new Date().toISOString()
        }
      });
      
      return errorScan;
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [state.isEnabled, state.config.transactionVerification]);

  // Group issues by category
  const getIssuesByCategory = useCallback((scan: SecurityScan): Record<SecurityCategory, SecurityIssue[]> => {
    const result = {} as Record<SecurityCategory, SecurityIssue[]>;
    
    // Initialize categories
    const categories: SecurityCategory[] = [
      'phishing', 'smart_contract', 'transaction', 
      'gas_optimization', 'privacy', 'general'
    ];
    categories.forEach(category => {
      result[category] = [];
    });
    
    // Group issues
    scan.issues.forEach(issue => {
      const category = issue.category as SecurityCategory;
      if (result[category]) {
        result[category].push(issue);
      } else {
        result.general.push(issue);
      }
    });
    
    return result;
  }, []);

  // Calculate risk score
  const getRiskScore = useCallback((scan: SecurityScan): number => {
    return transactionVerifier.calculateRiskScore(scan);
  }, []);

  // Should transaction be held
  const shouldHoldTransaction = useCallback((scan: SecurityScan): boolean => {
    return transactionVerifier.shouldHoldTransaction(scan);
  }, []);

  // Get reason for transaction hold
  const getHoldReason = useCallback((scan: SecurityScan): string => {
    return transactionVerifier.getHoldReason(scan);
  }, []);

  // Save a credential securely
  const saveCredential = useCallback(async (credential: any) => {
    const savedCredential = await secureStorage.storeCredential(credential);
    dispatch({ type: 'SAVE_CREDENTIAL', payload: savedCredential });
    return savedCredential;
  }, []);

  // Retrieve a credential
  const getCredential = useCallback(async (id: string) => {
    return secureStorage.getCredential(id);
  }, []);

  // Handle chat message from user
  const handleChatMessage = useCallback((message: string) => {
    // Add user message
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: uuidv4(),
        sender: 'user',
        content: message,
        timestamp: new Date().toISOString()
      }
    });

    // Process message (would connect to backend AI in real implementation)
    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    // Search for related training data
    const findBestResponse = (userMessage: string) => {
      userMessage = userMessage.toLowerCase();
      let bestMatch = null;
      let highestScore = 0;
      
      // Flatten all training data categories into a single array
      const allTrainingData = Object.values(trainingData).flat();
      
      for (const item of allTrainingData) {
        // Simple keyword matching - in a real implementation this would use more sophisticated NLP
        let score = 0;
        const queryKeywords = item.query.toLowerCase().split(' ');
        const responseKeywords = item.response.toLowerCase().split(' ');
        
        // Check how many keywords from the training data match the user message
        [...queryKeywords, ...responseKeywords].forEach(keyword => {
          if (keyword.length > 3 && userMessage.includes(keyword)) {
            score += 1;
          }
        });
        
        // Exact matches for key phrases get a higher score
        if (userMessage.includes(item.query.toLowerCase())) {
          score += 10;
        }
        
        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      }
      
      // If we have a good match, return it
      if (bestMatch && highestScore > 0) {
        return bestMatch.response;
      }
      
      return null;
    };
    
    // Simulate AI response with a delay
    setTimeout(() => {
      // Try to find a response from training data
      const trainedResponse = findBestResponse(message);
      
      // Default fallback responses if no trained response found
      const fallbackResponses = [
        "I'm Mysterion, your AI assistant for Aetherion. I can help with blockchain questions and security concerns.",
        "I'm monitoring your Aetherion wallet for security issues. Is there anything specific you'd like to know?",
        "How else can I assist you with your Aetherion blockchain needs?",
        "I'm here to help with any questions about quantum security, Singularity Coin, or the Aetherion platform."
      ];
      
      // Determine the specific response for greeting messages
      let responseContent = trainedResponse;
      if (!responseContent) {
        const lowercaseMessage = message.toLowerCase();
        if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi') || lowercaseMessage.includes('hey')) {
          responseContent = "Hello! I'm Mysterion, your AI assistant for the Aetherion platform. I can help with questions about quantum security, blockchain features, and much more. How can I assist you today?";
        } else if (lowercaseMessage.includes('help') || lowercaseMessage.includes('assist')) {
          responseContent = "I can help with various topics related to Aetherion, including quantum security features, wallet management, Singularity Coin details, and transaction verification. What would you like to know more about?";
        } else if (lowercaseMessage.includes('thank')) {
          responseContent = "You're welcome! I'm here to assist with any other questions you might have about Aetherion's features and capabilities.";
        } else {
          // Use random fallback response for unrecognized queries
          responseContent = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        }
      }
      
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: uuidv4(),
          sender: 'ai',
          content: responseContent,
          timestamp: new Date().toISOString()
        }
      });
      
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }, 1000);
  }, []);

  // Put a transaction on hold
  const holdTransaction = useCallback((tx: Transaction, reason: string, duration = 24): Transaction => {
    const heldTx: Transaction = {
      ...tx,
      id: tx.id || uuidv4(),
      status: 'held',
      holdReason: reason,
      holdUntil: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString()
    };
    
    dispatch({ type: 'HOLD_TRANSACTION', payload: heldTx });
    
    // Add system message
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: uuidv4(),
        sender: 'system',
        content: `Transaction has been placed on hold: ${reason}`,
        timestamp: new Date().toISOString()
      }
    });
    
    return heldTx;
  }, []);

  // Release a transaction from hold
  const releaseTransaction = useCallback((txId: number) => {
    dispatch({ type: 'RELEASE_TRANSACTION', payload: txId });
    
    // Add system message
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: uuidv4(),
        sender: 'system',
        content: `Transaction has been released from hold.`,
        timestamp: new Date().toISOString()
      }
    });
  }, []);

  // Clear chat history
  const clearChat = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  const contextValue = {
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

// Custom hook for using AI context
export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}

export default AIContext;