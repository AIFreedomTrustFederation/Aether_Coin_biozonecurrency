import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  EscrowContextState, 
  EscrowTransaction, 
  EscrowDispute,
  EscrowTemplate,
  EscrowStats,
  EscrowCondition
} from '../types';
import EscrowService from '../utils/EscrowService';

// Initial state
const initialState: EscrowContextState = {
  transactions: [],
  disputes: [],
  templates: [],
  stats: {
    totalTransactions: 0,
    activeTransactions: 0,
    completedTransactions: 0,
    disputedTransactions: 0,
    totalValueLocked: '0',
    averageEscrowDuration: 0,
    disputeRate: 0
  },
  isInitialized: false,
  defaultHoldingPeriod: 24 // Default: 24 hours
};

// Action types
type EscrowAction = 
  | { type: 'INITIALIZE', payload: Partial<EscrowContextState> }
  | { type: 'SET_TRANSACTIONS', payload: EscrowTransaction[] }
  | { type: 'ADD_TRANSACTION', payload: EscrowTransaction }
  | { type: 'UPDATE_TRANSACTION', payload: EscrowTransaction }
  | { type: 'SET_DISPUTES', payload: EscrowDispute[] }
  | { type: 'ADD_DISPUTE', payload: EscrowDispute }
  | { type: 'UPDATE_DISPUTE', payload: EscrowDispute }
  | { type: 'SET_TEMPLATES', payload: EscrowTemplate[] }
  | { type: 'SET_STATS', payload: EscrowStats }
  | { type: 'SET_HOLDING_PERIOD', payload: number };

// Escrow Context definition
interface EscrowContextType {
  state: EscrowContextState;
  dispatch: React.Dispatch<EscrowAction>;
  createEscrow: (
    senderAddress: string,
    recipientAddress: string,
    amount: string,
    tokenSymbol: string,
    network: string,
    holdingPeriod?: number,
    conditions?: Omit<EscrowCondition, 'id' | 'isMet' | 'metAt'>[]
  ) => Promise<EscrowTransaction>;
  fundEscrow: (escrowId: string, senderAddress: string) => Promise<EscrowTransaction>;
  approveEscrow: (escrowId: string, approverAddress: string) => Promise<EscrowTransaction>;
  cancelEscrow: (escrowId: string, cancellerAddress: string) => Promise<EscrowTransaction>;
  createDispute: (
    escrowId: string,
    disputerAddress: string,
    reason: string,
    details: string
  ) => Promise<EscrowDispute>;
  resolveDispute: (
    disputeId: string,
    outcome: 'sender' | 'recipient' | 'split',
    reason: string,
    splitRatio?: number,
    resolverAddress?: string
  ) => Promise<EscrowDispute>;
  getEscrowsByAddress: (
    address: string,
    role?: 'sender' | 'recipient' | 'both'
  ) => EscrowTransaction[];
  getEscrowTemplates: (category?: string) => EscrowTemplate[];
  updateHoldingPeriod: (hours: number) => void;
  refreshStats: () => void;
}

// Create context
const EscrowContext = createContext<EscrowContextType | undefined>(undefined);

// Reducer function
function escrowReducer(state: EscrowContextState, action: EscrowAction): EscrowContextState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        ...action.payload,
        isInitialized: true
      };
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload]
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(tx => 
          tx.id === action.payload.id ? action.payload : tx
        )
      };
    case 'SET_DISPUTES':
      return {
        ...state,
        disputes: action.payload
      };
    case 'ADD_DISPUTE':
      return {
        ...state,
        disputes: [...state.disputes, action.payload]
      };
    case 'UPDATE_DISPUTE':
      return {
        ...state,
        disputes: state.disputes.map(dispute => 
          dispute.id === action.payload.id ? action.payload : dispute
        )
      };
    case 'SET_TEMPLATES':
      return {
        ...state,
        templates: action.payload
      };
    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload
      };
    case 'SET_HOLDING_PERIOD':
      return {
        ...state,
        defaultHoldingPeriod: action.payload
      };
    default:
      return state;
  }
}

// Provider component
interface EscrowProviderProps {
  children: ReactNode;
  defaultHoldingPeriod?: number;
}

export const EscrowProvider: React.FC<EscrowProviderProps> = ({ 
  children, 
  defaultHoldingPeriod = 24 
}) => {
  const [state, dispatch] = useReducer(escrowReducer, {
    ...initialState,
    defaultHoldingPeriod
  });

  // Initialize escrow service
  useEffect(() => {
    if (!state.isInitialized) {
      // Initialize the escrow service
      EscrowService.initialize(undefined, state.defaultHoldingPeriod);
      
      // Load templates
      const templates = EscrowService.getEscrowTemplates();
      
      // Get initial stats
      const stats = EscrowService.getEscrowStats();
      
      // Initialize context state
      dispatch({
        type: 'INITIALIZE',
        payload: {
          templates,
          stats
        }
      });
    }
  }, [state.isInitialized, state.defaultHoldingPeriod]);

  // Create a new escrow transaction
  const createEscrow = async (
    senderAddress: string,
    recipientAddress: string,
    amount: string,
    tokenSymbol: string,
    network: string,
    holdingPeriod?: number,
    conditions?: Omit<EscrowCondition, 'id' | 'isMet' | 'metAt'>[]
  ): Promise<EscrowTransaction> => {
    const escrow = await EscrowService.createEscrow(
      senderAddress,
      recipientAddress,
      amount,
      tokenSymbol,
      network,
      holdingPeriod,
      conditions
    );
    
    // Update state
    dispatch({ type: 'ADD_TRANSACTION', payload: escrow });
    
    // Refresh stats
    refreshStats();
    
    return escrow;
  };

  // Fund an escrow transaction
  const fundEscrow = async (
    escrowId: string, 
    senderAddress: string
  ): Promise<EscrowTransaction> => {
    const updatedEscrow = await EscrowService.fundEscrow(escrowId, senderAddress);
    
    // Update state
    dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedEscrow });
    
    // Refresh stats
    refreshStats();
    
    return updatedEscrow;
  };

  // Approve and complete an escrow transaction
  const approveEscrow = async (
    escrowId: string, 
    approverAddress: string
  ): Promise<EscrowTransaction> => {
    const updatedEscrow = await EscrowService.approveEscrow(escrowId, approverAddress);
    
    // Update state
    dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedEscrow });
    
    // Refresh stats
    refreshStats();
    
    return updatedEscrow;
  };

  // Cancel an escrow transaction
  const cancelEscrow = async (
    escrowId: string, 
    cancellerAddress: string
  ): Promise<EscrowTransaction> => {
    const updatedEscrow = await EscrowService.cancelEscrow(escrowId, cancellerAddress);
    
    // Update state
    dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedEscrow });
    
    // Refresh stats
    refreshStats();
    
    return updatedEscrow;
  };

  // Create a dispute for an escrow transaction
  const createDispute = async (
    escrowId: string,
    disputerAddress: string,
    reason: string,
    details: string
  ): Promise<EscrowDispute> => {
    const dispute = await EscrowService.createDispute(
      escrowId,
      disputerAddress,
      reason,
      details
    );
    
    // Get the updated escrow
    const updatedEscrow = EscrowService.getEscrow(escrowId);
    
    if (updatedEscrow) {
      // Update transaction state
      dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedEscrow });
    }
    
    // Update disputes state
    dispatch({ type: 'ADD_DISPUTE', payload: dispute });
    
    // Refresh stats
    refreshStats();
    
    return dispute;
  };

  // Resolve a dispute
  const resolveDispute = async (
    disputeId: string,
    outcome: 'sender' | 'recipient' | 'split',
    reason: string,
    splitRatio?: number,
    resolverAddress?: string
  ): Promise<EscrowDispute> => {
    const updatedDispute = await EscrowService.resolveDispute(
      disputeId,
      outcome,
      reason,
      splitRatio,
      resolverAddress
    );
    
    // Get the updated escrow
    const escrowId = updatedDispute.escrowId;
    const updatedEscrow = EscrowService.getEscrow(escrowId);
    
    if (updatedEscrow) {
      // Update transaction state
      dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedEscrow });
    }
    
    // Update dispute state
    dispatch({ type: 'UPDATE_DISPUTE', payload: updatedDispute });
    
    // Refresh stats
    refreshStats();
    
    return updatedDispute;
  };

  // Get escrow transactions for an address
  const getEscrowsByAddress = (
    address: string, 
    role: 'sender' | 'recipient' | 'both' = 'both'
  ): EscrowTransaction[] => {
    return EscrowService.getEscrowsByAddress(address, role);
  };

  // Get escrow templates
  const getEscrowTemplates = (category?: string): EscrowTemplate[] => {
    return EscrowService.getEscrowTemplates(category);
  };

  // Update the default holding period
  const updateHoldingPeriod = (hours: number): void => {
    if (hours > 0) {
      EscrowService.updateDefaultHoldingPeriod(hours);
      dispatch({ type: 'SET_HOLDING_PERIOD', payload: hours });
    }
  };

  // Refresh escrow statistics
  const refreshStats = (): void => {
    const stats = EscrowService.getEscrowStats();
    dispatch({ type: 'SET_STATS', payload: stats });
  };

  return (
    <EscrowContext.Provider
      value={{
        state,
        dispatch,
        createEscrow,
        fundEscrow,
        approveEscrow,
        cancelEscrow,
        createDispute,
        resolveDispute,
        getEscrowsByAddress,
        getEscrowTemplates,
        updateHoldingPeriod,
        refreshStats
      }}
    >
      {children}
    </EscrowContext.Provider>
  );
};

// Hook to use escrow context
export const useEscrow = () => {
  const context = useContext(EscrowContext);
  if (context === undefined) {
    throw new Error('useEscrow must be used within an EscrowProvider');
  }
  return context;
};

export default EscrowContext;