import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  AIContextState, 
  Message, 
  AIAssistantConfig,
  TransactionToVerify,
  VerificationResult
} from '../types';

// Initial configuration
const defaultConfig: AIAssistantConfig = {
  userId: 0, // This will be set from auth context
  theme: 'system',
  enableVoice: false,
  enableNotifications: true,
  securityLevel: 'standard',
  language: 'en',
  transactionReversal: true,
  holdingPeriod: 24, // 24 hours by default
};

// Initial state
const initialState: AIContextState = {
  messages: [],
  isTyping: false,
  unreadCount: 0,
  lastInteraction: null,
  currentSession: null,
  config: defaultConfig,
  isInitialized: false,
};

// Action types
type AIAction = 
  | { type: 'INITIALIZE', payload: Partial<AIAssistantConfig> }
  | { type: 'SEND_MESSAGE', payload: Omit<Message, 'id' | 'timestamp'> }
  | { type: 'RECEIVE_MESSAGE', payload: Omit<Message, 'id' | 'timestamp'> }
  | { type: 'SET_TYPING', payload: boolean }
  | { type: 'MARK_READ' }
  | { type: 'UPDATE_CONFIG', payload: Partial<AIAssistantConfig> }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'START_SESSION' }
  | { type: 'END_SESSION' };

// AI Context definition
interface AIContextType {
  state: AIContextState;
  dispatch: React.Dispatch<AIAction>;
  sendMessage: (text: string, attachments?: Message['attachments']) => void;
  verifyTransaction: (transaction: TransactionToVerify) => Promise<VerificationResult>;
  reverseTransaction: (transactionId: string) => Promise<boolean>;
  clearHistory: () => void;
  updateConfig: (config: Partial<AIAssistantConfig>) => void;
}

// Create context
const AIContext = createContext<AIContextType | undefined>(undefined);

// Reducer function
function aiReducer(state: AIContextState, action: AIAction): AIContextState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload,
        },
        isInitialized: true,
      };
    case 'SEND_MESSAGE': {
      const newMessage: Message = {
        id: uuidv4(),
        timestamp: new Date(),
        ...action.payload,
      };
      return {
        ...state,
        messages: [...state.messages, newMessage],
        lastInteraction: new Date(),
      };
    }
    case 'RECEIVE_MESSAGE': {
      const newMessage: Message = {
        id: uuidv4(),
        timestamp: new Date(),
        ...action.payload,
      };
      return {
        ...state,
        messages: [...state.messages, newMessage],
        unreadCount: state.unreadCount + 1,
        isTyping: false,
        lastInteraction: new Date(),
      };
    }
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload,
      };
    case 'MARK_READ':
      return {
        ...state,
        unreadCount: 0,
        messages: state.messages.map(msg => ({
          ...msg,
          isRead: msg.sender === 'assistant' ? true : msg.isRead,
        })),
      };
    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload,
        },
      };
    case 'CLEAR_HISTORY':
      return {
        ...state,
        messages: [],
        unreadCount: 0,
      };
    case 'START_SESSION':
      return {
        ...state,
        currentSession: uuidv4(),
      };
    case 'END_SESSION':
      return {
        ...state,
        currentSession: null,
      };
    default:
      return state;
  }
}

// Provider component
interface AIProviderProps {
  children: ReactNode;
  initialConfig?: Partial<AIAssistantConfig>;
}

export const AIProvider: React.FC<AIProviderProps> = ({ 
  children, 
  initialConfig = {} 
}) => {
  const [state, dispatch] = useReducer(aiReducer, initialState);

  // Initialize AI on mount
  useEffect(() => {
    if (!state.isInitialized) {
      // Load stored configuration or use defaults
      const storedConfig = localStorage.getItem('aiAssistantConfig');
      const config = storedConfig 
        ? { ...defaultConfig, ...JSON.parse(storedConfig), ...initialConfig }
        : { ...defaultConfig, ...initialConfig };
      
      dispatch({ type: 'INITIALIZE', payload: config });
    }
  }, [initialConfig, state.isInitialized]);

  // Save config to localStorage on change
  useEffect(() => {
    if (state.isInitialized) {
      localStorage.setItem('aiAssistantConfig', JSON.stringify(state.config));
    }
  }, [state.config, state.isInitialized]);

  // Helper function to send a message
  const sendMessage = (text: string, attachments?: Message['attachments']) => {
    // First ensure we have an active session
    if (!state.currentSession) {
      dispatch({ type: 'START_SESSION' });
    }
    
    // Send user message
    dispatch({
      type: 'SEND_MESSAGE',
      payload: {
        text,
        sender: 'user',
        attachments,
      },
    });

    // Set assistant to typing
    dispatch({ type: 'SET_TYPING', payload: true });

    // Simulate AI response (will be replaced with actual API call)
    setTimeout(() => {
      dispatch({
        type: 'RECEIVE_MESSAGE',
        payload: {
          text: `I've processed your message: "${text}"`,
          sender: 'assistant',
        },
      });
    }, 1500);
  };

  // Transaction verification function
  const verifyTransaction = async (transaction: TransactionToVerify): Promise<VerificationResult> => {
    // This will be replaced with actual API verification logic
    // For now, we're simulating a verification process
    console.log('Verifying transaction:', transaction);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const isHigh = transaction.amount && parseFloat(transaction.amount) > 1000;
    
    // Sample verification result
    const result: VerificationResult = {
      transactionId: transaction.id,
      isVerified: !isHigh,
      riskLevel: isHigh ? 'high' : 'low',
      issues: isHigh ? ['Large transaction amount detected'] : [],
      recommendations: isHigh ? ['Consider splitting into smaller transactions'] : [],
      canBeReversed: state.config.transactionReversal && 
        (new Date().getTime() - new Date(transaction.timestamp).getTime()) / 3600000 < state.config.holdingPeriod
    };
    
    return result;
  };

  // Transaction reversal function
  const reverseTransaction = async (transactionId: string): Promise<boolean> => {
    // This will be replaced with actual transaction reversal API call
    console.log('Reversing transaction:', transactionId);
    
    // Find the transaction in messages
    const transactionMessage = state.messages.find(
      msg => msg.attachments?.some(att => 
        att.type === 'transaction' && att.data?.id === transactionId
      )
    );
    
    if (!transactionMessage) {
      console.error('Transaction not found in message history');
      return false;
    }
    
    // Check if within holding period
    const attachedTransaction = transactionMessage.attachments?.find(
      att => att.type === 'transaction' && att.data?.id === transactionId
    );
    
    if (!attachedTransaction?.data) {
      console.error('Transaction data not found');
      return false;
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Notify user of the result
    dispatch({
      type: 'RECEIVE_MESSAGE',
      payload: {
        text: `I've initiated the reversal process for transaction ${transactionId}. The funds should be returned to your wallet within 24-48 hours.`,
        sender: 'assistant',
        referencedTransaction: transactionId,
      },
    });
    
    return true;
  };

  // Clear chat history
  const clearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY' });
  };

  // Update configuration
  const updateConfig = (config: Partial<AIAssistantConfig>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: config });
  };

  return (
    <AIContext.Provider
      value={{
        state,
        dispatch,
        sendMessage,
        verifyTransaction,
        reverseTransaction,
        clearHistory,
        updateConfig,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

// Hook to use AI context
export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

export default AIContext;