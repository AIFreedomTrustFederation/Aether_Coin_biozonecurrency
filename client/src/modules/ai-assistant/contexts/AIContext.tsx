import React, { createContext, useContext, useReducer } from 'react';
import { v4 as uuid } from 'uuid';
import { 
  AIState, 
  AIAction, 
  AIConfig, 
  AIProviderProps,
  AIContextType,
  ChatMessage, 
  Transaction, 
  SecurityScan, 
  SecurityIssue, 
  SecureCredential 
} from '../types';

// Default AI configuration
const defaultConfig: AIConfig = {
  enabled: true,
  transactionMonitoring: true,
  securityScanning: true,
  credentialManagement: true,
  holdPeriodHours: 24,
  autoVerification: true,
  notificationLevel: 'important',
  voiceEnabled: false,
  personalization: {
    name: 'Aetherion Assistant',
    appearance: 'default',
    responseLength: 'balanced'
  }
};

// Initial state for the AI assistant
const initialState: AIState = {
  initialized: false,
  config: defaultConfig,
  messages: [],
  pendingTransactions: [],
  securityScans: [],
  credentials: [],
  isProcessing: false
};

// Create context
const AIContext = createContext<AIContextType | undefined>(undefined);

// AI state reducer
const aiReducer = (state: AIState, action: AIAction): AIState => {
  switch (action.type) {
    case 'INITIALIZE_AI':
      return {
        ...state,
        initialized: true,
        config: action.payload
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
        messages: [...state.messages, action.payload]
      };
      
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: []
      };
      
    case 'ADD_PENDING_TRANSACTION':
      return {
        ...state,
        pendingTransactions: [...state.pendingTransactions, action.payload]
      };
      
    case 'REMOVE_PENDING_TRANSACTION':
      return {
        ...state,
        pendingTransactions: state.pendingTransactions.filter(tx => tx.id !== action.payload)
      };
      
    case 'ADD_SECURITY_SCAN':
      return {
        ...state,
        securityScans: [...state.securityScans, action.payload],
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
        credentials: [...state.credentials, action.payload]
      };
      
    case 'REMOVE_CREDENTIAL':
      return {
        ...state,
        credentials: state.credentials.filter(cred => cred.id !== action.payload)
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

// AI Provider component
export const AIProvider: React.FC<AIProviderProps> = ({ 
  children,
  initialConfig = {}
}) => {
  const [state, dispatch] = useReducer(aiReducer, {
    ...initialState,
    config: {
      ...defaultConfig,
      ...initialConfig
    }
  });
  
  // Initialize AI assistant
  React.useEffect(() => {
    if (!state.initialized) {
      dispatch({ 
        type: 'INITIALIZE_AI', 
        payload: {
          ...state.config,
          ...initialConfig
        }
      });
      
      // Add welcome message
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: uuid(),
          sender: 'ai',
          timestamp: new Date(),
          content: `Hello! I'm ${state.config.personalization.name}, your AI assistant. How can I help you today?`
        }
      });
    }
  }, [state.initialized, state.config, initialConfig]);
  
  // Set up context functions
  const toggleAI = (enabled: boolean) => {
    dispatch({ type: 'TOGGLE_AI', payload: enabled });
  };
  
  const updateConfig = (config: Partial<AIConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
  };
  
  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        ...message,
        id: uuid(),
        timestamp: new Date()
      }
    });
  };
  
  const clearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };
  
  const addPendingTransaction = (transaction: Omit<Transaction, 'id'>) => {
    dispatch({
      type: 'ADD_PENDING_TRANSACTION',
      payload: {
        ...transaction,
        id: Math.floor(Math.random() * 1000000) // In a real app, this would be a DB-generated ID
      }
    });
  };
  
  const removePendingTransaction = (id: number) => {
    dispatch({ type: 'REMOVE_PENDING_TRANSACTION', payload: id });
  };
  
  const addSecurityScan = (scan: Omit<SecurityScan, 'id'>) => {
    dispatch({
      type: 'ADD_SECURITY_SCAN',
      payload: {
        ...scan,
        id: Math.floor(Math.random() * 1000000) // In a real app, this would be a DB-generated ID
      }
    });
  };
  
  const resolveSecurityIssue = (scanId: number, issueId: number) => {
    dispatch({
      type: 'RESOLVE_SECURITY_ISSUE',
      payload: { scanId, issueId }
    });
  };
  
  const addCredential = (credential: Omit<SecureCredential, 'id'>) => {
    dispatch({
      type: 'ADD_CREDENTIAL',
      payload: {
        ...credential,
        id: uuid()
      }
    });
  };
  
  const removeCredential = (id: string) => {
    dispatch({ type: 'REMOVE_CREDENTIAL', payload: id });
  };
  
  // Context value
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

// Custom hook to use the AI context
export const useAI = (): AIContextType => {
  const context = useContext(AIContext);
  
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  
  return context;
};

export default AIContext;