import React, { createContext, useReducer, useContext, useCallback } from 'react';
import { AIState, AIAction, AIConfig, ChatMessage, Transaction, SecurityScan, SecurityIssue } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Default AI configuration
const defaultConfig: AIConfig = {
  enableVoice: false,
  language: 'en',
  aiResponseStyle: 'detailed',
  notificationLevel: 'important',
  maxAlertThreshold: 5,
  enablePhishingDetection: true,
  autoVerifyTransactions: true
};

// Initial state
const initialState: AIState = {
  config: defaultConfig,
  chatHistory: [],
  pendingTransactions: [],
  securityScans: [],
  storedCredentials: [],
  isAssistantActive: true,
  currentView: 'chat'
};

// Reducer for handling actions
const aiReducer = (state: AIState, action: AIAction): AIState => {
  switch (action.type) {
    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload
        }
      };
      
    case 'ADD_MESSAGE':
      return {
        ...state,
        chatHistory: [action.payload, ...state.chatHistory]
      };
      
    case 'CLEAR_HISTORY':
      return {
        ...state,
        chatHistory: []
      };
      
    case 'ADD_PENDING_TRANSACTION':
      return {
        ...state,
        pendingTransactions: [action.payload, ...state.pendingTransactions]
      };
      
    case 'REMOVE_PENDING_TRANSACTION':
      return {
        ...state,
        pendingTransactions: state.pendingTransactions.filter(tx => tx.id !== action.payload)
      };
      
    case 'ADD_SECURITY_SCAN':
      return {
        ...state,
        securityScans: [action.payload, ...state.securityScans]
      };
      
    case 'RESOLVE_SECURITY_ISSUE':
      return {
        ...state,
        securityScans: state.securityScans.map(scan => 
          scan.id === action.payload.scanId 
            ? {
                ...scan,
                issues: scan.issues.map(issue => 
                  issue.id === action.payload.issueId 
                    ? { ...issue, resolved: true, resolvedAt: new Date() } 
                    : issue
                )
              }
            : scan
        )
      };
      
    case 'SET_ACTIVE':
      return {
        ...state,
        isAssistantActive: action.payload
      };
      
    case 'SET_VIEW':
      return {
        ...state,
        currentView: action.payload
      };
      
    case 'ADD_CREDENTIAL':
      return {
        ...state,
        storedCredentials: [...state.storedCredentials, action.payload]
      };
      
    case 'REMOVE_CREDENTIAL':
      return {
        ...state,
        storedCredentials: state.storedCredentials.filter(cred => cred !== action.payload)
      };
      
    default:
      return state;
  }
};

// Define context type
interface AIContextType {
  state: AIState;
  dispatch: React.Dispatch<AIAction>;
  sendMessage: (content: string) => void;
  clearHistory: () => void;
  updateConfig: (config: Partial<AIConfig>) => void;
  setActive: (active: boolean) => void;
  setView: (view: AIState['currentView']) => void;
  addPendingTransaction: (transaction: Transaction) => void;
  removePendingTransaction: (id: number) => void;
  addSecurityScan: (scan: SecurityScan) => void;
  resolveSecurityIssue: (scanId: number, issueId: number) => void;
  storeCredential: (credential: string) => void;
  removeCredential: (id: string) => void;
}

// Create context
const AIContext = createContext<AIContextType | undefined>(undefined);

// Provider component
export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(aiReducer, initialState);
  
  // Helper function to send a message
  const sendMessage = useCallback((content: string) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `I'm processing your request: "${content}". This is a placeholder response. In the real implementation, this would be a response from the actual AI model.`,
        timestamp: new Date()
      };
      
      dispatch({ type: 'ADD_MESSAGE', payload: aiResponse });
    }, 1000);
  }, []);
  
  // Helper function to clear chat history
  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);
  
  // Helper function to update config
  const updateConfig = useCallback((config: Partial<AIConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
  }, []);
  
  // Helper function to set assistant active state
  const setActive = useCallback((active: boolean) => {
    dispatch({ type: 'SET_ACTIVE', payload: active });
  }, []);
  
  // Helper function to set current view
  const setView = useCallback((view: AIState['currentView']) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  }, []);
  
  // Helper function to add a pending transaction
  const addPendingTransaction = useCallback((transaction: Transaction) => {
    dispatch({ type: 'ADD_PENDING_TRANSACTION', payload: transaction });
  }, []);
  
  // Helper function to remove a pending transaction
  const removePendingTransaction = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_PENDING_TRANSACTION', payload: id });
  }, []);
  
  // Helper function to add a security scan
  const addSecurityScan = useCallback((scan: SecurityScan) => {
    dispatch({ type: 'ADD_SECURITY_SCAN', payload: scan });
  }, []);
  
  // Helper function to resolve a security issue
  const resolveSecurityIssue = useCallback((scanId: number, issueId: number) => {
    dispatch({ type: 'RESOLVE_SECURITY_ISSUE', payload: { scanId, issueId } });
  }, []);
  
  // Helper function to store a credential
  const storeCredential = useCallback((credential: string) => {
    dispatch({ type: 'ADD_CREDENTIAL', payload: credential });
  }, []);
  
  // Helper function to remove a credential
  const removeCredential = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_CREDENTIAL', payload: id });
  }, []);
  
  const value = {
    state,
    dispatch,
    sendMessage,
    clearHistory,
    updateConfig,
    setActive,
    setView,
    addPendingTransaction,
    removePendingTransaction,
    addSecurityScan,
    resolveSecurityIssue,
    storeCredential,
    removeCredential
  };
  
  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

// Custom hook to use the AI context
export const useAI = () => {
  const context = useContext(AIContext);
  
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  
  return context;
};