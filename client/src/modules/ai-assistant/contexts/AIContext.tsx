import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Import types
import { AIState, AIAction, AIConfig, AIProviderProps } from '../types';
import { AIContextType } from '../types';
import { ChatMessage, Transaction, SecurityScan, SecurityIssue, SecureCredential } from '../types';

// Default AI configuration
const DEFAULT_CONFIG: AIConfig = {
  enabled: true,
  transactionMonitoring: true,
  securityScanning: true,
  credentialManagement: true,
  holdPeriodHours: 24,
  autoVerification: false,
  notificationLevel: 'important',
  voiceEnabled: false,
  personalization: {
    name: 'Quantum AI',
    appearance: 'default',
    responseLength: 'balanced'
  }
};

// Initial state
const initialState: AIState = {
  initialized: false,
  config: DEFAULT_CONFIG,
  messages: [],
  pendingTransactions: [],
  securityScans: [],
  credentials: [],
  isProcessing: false,
  lastScanTimestamp: undefined
};

// Reducer function for managing state
const AIReducer = (state: AIState, action: AIAction): AIState => {
  switch (action.type) {
    case 'INITIALIZE_AI':
      return {
        ...state,
        initialized: true,
        config: {
          ...state.config,
          ...action.payload
        }
      };
      
    case 'TOGGLE_AI':
      return {
        ...state,
        config: {
          ...state.config,
          enabled: action.payload
        }
      };
      
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
        messages: [
          ...state.messages,
          {
            ...action.payload,
            id: uuidv4(),
            timestamp: new Date()
          }
        ]
      };
      
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: []
      };
      
    case 'ADD_PENDING_TRANSACTION':
      return {
        ...state,
        pendingTransactions: [
          ...state.pendingTransactions,
          {
            ...action.payload,
            id: state.pendingTransactions.length > 0 
              ? Math.max(...state.pendingTransactions.map(tx => tx.id)) + 1 
              : 1
          }
        ]
      };
      
    case 'REMOVE_PENDING_TRANSACTION':
      return {
        ...state,
        pendingTransactions: state.pendingTransactions.filter(
          tx => tx.id !== action.payload
        )
      };
      
    case 'ADD_SECURITY_SCAN':
      return {
        ...state,
        securityScans: [
          {
            ...action.payload,
            id: state.securityScans.length > 0 
              ? Math.max(...state.securityScans.map(scan => scan.id)) + 1 
              : 1
          },
          ...state.securityScans
        ],
        lastScanTimestamp: new Date()
      };
      
    case 'RESOLVE_SECURITY_ISSUE':
      return {
        ...state,
        securityScans: state.securityScans.map(scan => {
          if (scan.id === action.payload.scanId) {
            return {
              ...scan,
              issues: scan.issues.map(issue => {
                if (issue.id === action.payload.issueId) {
                  return {
                    ...issue,
                    resolved: true,
                    resolvedAt: new Date()
                  };
                }
                return issue;
              })
            };
          }
          return scan;
        })
      };
      
    case 'ADD_CREDENTIAL':
      return {
        ...state,
        credentials: [
          ...state.credentials,
          {
            ...action.payload,
            id: uuidv4()
          }
        ]
      };
      
    case 'REMOVE_CREDENTIAL':
      return {
        ...state,
        credentials: state.credentials.filter(
          cred => cred.id !== action.payload
        )
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
      
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: undefined
      };
      
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload
      };
      
    default:
      return state;
  }
};

// Create context
const AIContext = createContext<AIContextType | undefined>(undefined);

// Provider component
export const AIProvider: React.FC<AIProviderProps> = ({ 
  children, 
  initialConfig 
}) => {
  const [state, dispatch] = useReducer(AIReducer, initialState);
  
  // Initialize on first render if initial config provided
  React.useEffect(() => {
    if (initialConfig && !state.initialized) {
      dispatch({ 
        type: 'INITIALIZE_AI', 
        payload: initialConfig 
      });
      
      // Add welcome message
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          sender: 'ai',
          content: `Hello! I'm your Aetherion Quantum AI assistant. I'm here to help you safely manage your transactions and provide security insights for your blockchain activities.`,
        }
      });
    }
  }, [initialConfig, state.initialized]);
  
  // Define context methods
  const toggleAI = (enabled: boolean) => {
    dispatch({ type: 'TOGGLE_AI', payload: enabled });
  };
  
  const updateConfig = (config: Partial<AIConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
  };
  
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };
  
  const clearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };
  
  const addPendingTransaction = (transaction: Omit<Transaction, 'id'>) => {
    dispatch({ type: 'ADD_PENDING_TRANSACTION', payload: transaction });
  };
  
  const removePendingTransaction = (id: number) => {
    dispatch({ type: 'REMOVE_PENDING_TRANSACTION', payload: id });
  };
  
  const addSecurityScan = (scan: Omit<SecurityScan, 'id'>) => {
    dispatch({ type: 'ADD_SECURITY_SCAN', payload: scan });
  };
  
  const resolveSecurityIssue = (scanId: number, issueId: number) => {
    dispatch({ 
      type: 'RESOLVE_SECURITY_ISSUE', 
      payload: { scanId, issueId } 
    });
  };
  
  const addCredential = (credential: Omit<SecureCredential, 'id'>) => {
    dispatch({ type: 'ADD_CREDENTIAL', payload: credential });
  };
  
  const removeCredential = (id: string) => {
    dispatch({ type: 'REMOVE_CREDENTIAL', payload: id });
  };
  
  const value = {
    state,
    toggleAI,
    updateConfig,
    addMessage,
    clearMessages,
    addPendingTransaction,
    removePendingTransaction,
    addSecurityScan,
    resolveSecurityIssue,
    addCredential,
    removeCredential
  };
  
  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};

// Custom hook for using the AI context
export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  
  return context;
};

export default AIContext;