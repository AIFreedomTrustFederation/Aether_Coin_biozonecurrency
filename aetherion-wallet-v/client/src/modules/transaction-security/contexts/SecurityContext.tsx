import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  SecurityContextState, 
  SecurityAlert, 
  SecurityMetrics,
  Transaction,
  SecurityRule,
  PhishingDetectionResult,
  RiskAssessment
} from '../types';
import PhishingDetector from '../utils/PhishingDetector';
import TransactionAnalyzer from '../utils/TransactionAnalyzer';

// Initial metrics
const defaultMetrics: SecurityMetrics = {
  totalTransactions: 0,
  flaggedTransactions: 0,
  phishingAttempts: 0,
  riskScore: 0,
  securityScore: 100,
  lastUpdated: new Date()
};

// Initial state
const initialState: SecurityContextState = {
  alerts: [],
  metrics: defaultMetrics,
  rules: [],
  isMonitoring: false,
  securityLevel: 'standard',
  unreadAlertCount: 0
};

// Action types
type SecurityAction = 
  | { type: 'START_MONITORING' }
  | { type: 'STOP_MONITORING' }
  | { type: 'ADD_ALERT', payload: Omit<SecurityAlert, 'id' | 'timestamp' | 'isRead'> }
  | { type: 'MARK_ALERTS_READ' }
  | { type: 'UPDATE_METRICS', payload: Partial<SecurityMetrics> }
  | { type: 'SET_SECURITY_LEVEL', payload: 'standard' | 'high' | 'paranoid' }
  | { type: 'ADD_RULE', payload: Omit<SecurityRule, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_RULE', payload: { id: string, updates: Partial<SecurityRule> } }
  | { type: 'REMOVE_RULE', payload: string }
  | { type: 'CLEAR_ALERTS' };

// Security Context definition
interface SecurityContextType {
  state: SecurityContextState;
  dispatch: React.Dispatch<SecurityAction>;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  checkUrl: (url: string) => Promise<PhishingDetectionResult>;
  analyzeTransaction: (transaction: Transaction) => Promise<RiskAssessment>;
  setSecurityLevel: (level: 'standard' | 'high' | 'paranoid') => void;
  getSecurityMetrics: () => SecurityMetrics;
}

// Create context
const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

// Reducer function
function securityReducer(state: SecurityContextState, action: SecurityAction): SecurityContextState {
  switch (action.type) {
    case 'START_MONITORING':
      return {
        ...state,
        isMonitoring: true,
      };
    case 'STOP_MONITORING':
      return {
        ...state,
        isMonitoring: false,
      };
    case 'ADD_ALERT': {
      const newAlert: SecurityAlert = {
        id: uuidv4(),
        timestamp: new Date(),
        isRead: false,
        ...action.payload,
      };
      return {
        ...state,
        alerts: [newAlert, ...state.alerts],
        unreadAlertCount: state.unreadAlertCount + 1,
      };
    }
    case 'MARK_ALERTS_READ':
      return {
        ...state,
        alerts: state.alerts.map(alert => ({ ...alert, isRead: true })),
        unreadAlertCount: 0,
      };
    case 'UPDATE_METRICS':
      return {
        ...state,
        metrics: {
          ...state.metrics,
          ...action.payload,
          lastUpdated: new Date()
        },
      };
    case 'SET_SECURITY_LEVEL':
      return {
        ...state,
        securityLevel: action.payload,
      };
    case 'ADD_RULE': {
      const newRule: SecurityRule = {
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...action.payload,
      };
      return {
        ...state,
        rules: [...state.rules, newRule],
      };
    }
    case 'UPDATE_RULE': {
      const { id, updates } = action.payload;
      return {
        ...state,
        rules: state.rules.map(rule => 
          rule.id === id 
            ? { ...rule, ...updates, updatedAt: new Date() } 
            : rule
        ),
      };
    }
    case 'REMOVE_RULE':
      return {
        ...state,
        rules: state.rules.filter(rule => rule.id !== action.payload),
      };
    case 'CLEAR_ALERTS':
      return {
        ...state,
        alerts: [],
        unreadAlertCount: 0,
      };
    default:
      return state;
  }
}

// Provider component
interface SecurityProviderProps {
  children: ReactNode;
  initialSecurityLevel?: 'standard' | 'high' | 'paranoid';
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ 
  children, 
  initialSecurityLevel = 'standard' 
}) => {
  const [state, dispatch] = useReducer(securityReducer, {
    ...initialState,
    securityLevel: initialSecurityLevel
  });

  // Initialize security components when security level changes
  useEffect(() => {
    // Configure PhishingDetector and TransactionAnalyzer
    PhishingDetector.initialize();
    TransactionAnalyzer.initialize(undefined, state.securityLevel);
    
    // Load default rules
    if (state.rules.length === 0) {
      loadDefaultRules();
    }
  }, [state.securityLevel]);

  // Load default security rules
  const loadDefaultRules = () => {
    // Example default rules
    const defaultRules: Omit<SecurityRule, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Large Transaction Alert',
        description: 'Alert on transactions over 1000 tokens',
        isEnabled: true,
        conditions: [
          {
            field: 'amount',
            operator: 'greaterThan',
            value: '1000'
          }
        ],
        actions: [
          {
            type: 'flag'
          },
          {
            type: 'notify'
          }
        ],
        priority: 10
      },
      {
        name: 'Unknown Address Warning',
        description: 'Warn when sending to a new address',
        isEnabled: true,
        conditions: [
          {
            field: 'isNewAddress',
            operator: 'equals',
            value: true
          }
        ],
        actions: [
          {
            type: 'notify'
          }
        ],
        priority: 20
      }
    ];
    
    // Add default rules
    defaultRules.forEach(rule => {
      dispatch({
        type: 'ADD_RULE',
        payload: rule
      });
    });
  };

  // Start monitoring for security threats
  const startMonitoring = () => {
    dispatch({ type: 'START_MONITORING' });
    
    // In a real implementation, we might:
    // 1. Start websocket connections for real-time alerts
    // 2. Begin periodic background checks
    // 3. Initialize monitoring services
    
    console.log('Security monitoring started');
  };

  // Stop security monitoring
  const stopMonitoring = () => {
    dispatch({ type: 'STOP_MONITORING' });
    console.log('Security monitoring stopped');
  };

  // Check URL for phishing
  const checkUrl = async (url: string): Promise<PhishingDetectionResult> => {
    const result = await PhishingDetector.checkUrl(url);
    
    // Create an alert if phishing is detected
    if (result.isPhishing) {
      dispatch({
        type: 'ADD_ALERT',
        payload: {
          type: 'phishing',
          severity: result.confidence > 80 ? 'critical' : 'high',
          message: 'Potential phishing site detected',
          details: `The URL ${url} was flagged as a potential phishing site with ${result.confidence}% confidence.`,
          relatedUrl: url
        }
      });
      
      // Update metrics
      dispatch({
        type: 'UPDATE_METRICS',
        payload: {
          phishingAttempts: state.metrics.phishingAttempts + 1,
          securityScore: Math.max(0, state.metrics.securityScore - 5)
        }
      });
    }
    
    return result;
  };

  // Analyze transaction risk
  const analyzeTransaction = async (transaction: Transaction): Promise<RiskAssessment> => {
    // Ensure the analyzer is using the current security level
    TransactionAnalyzer.updateConfig(state.securityLevel);
    
    // Analyze the transaction
    const analysis = await TransactionAnalyzer.analyzeTransaction(transaction);
    const { riskAssessment } = analysis;
    
    // Create an alert for high or critical risk transactions
    if (riskAssessment.level === 'high' || riskAssessment.level === 'critical') {
      dispatch({
        type: 'ADD_ALERT',
        payload: {
          type: 'transaction',
          severity: riskAssessment.level,
          message: `High-risk transaction detected`,
          details: `Transaction ${transaction.id} was flagged with ${riskAssessment.level} risk (score: ${riskAssessment.score}/100). ${riskAssessment.recommendation}`,
          relatedTransactionId: transaction.id
        }
      });
      
      // Update metrics
      dispatch({
        type: 'UPDATE_METRICS',
        payload: {
          totalTransactions: state.metrics.totalTransactions + 1,
          flaggedTransactions: state.metrics.flaggedTransactions + 1,
          riskScore: Math.max(state.metrics.riskScore, riskAssessment.score)
        }
      });
    } else {
      // Just update transaction count for normal transactions
      dispatch({
        type: 'UPDATE_METRICS',
        payload: {
          totalTransactions: state.metrics.totalTransactions + 1
        }
      });
    }
    
    return riskAssessment;
  };

  // Set security level
  const setSecurityLevel = (level: 'standard' | 'high' | 'paranoid') => {
    dispatch({ type: 'SET_SECURITY_LEVEL', payload: level });
    
    // Update the TransactionAnalyzer with the new security level
    TransactionAnalyzer.updateConfig(level);
  };

  // Get current security metrics
  const getSecurityMetrics = (): SecurityMetrics => {
    return state.metrics;
  };

  return (
    <SecurityContext.Provider
      value={{
        state,
        dispatch,
        startMonitoring,
        stopMonitoring,
        checkUrl,
        analyzeTransaction,
        setSecurityLevel,
        getSecurityMetrics
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

// Hook to use security context
export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export default SecurityContext;