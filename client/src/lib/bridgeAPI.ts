import { apiRequest } from '@/lib/queryClient';
import { BridgeStatus, BridgeTransactionStatus } from '@/shared/schema';

// Get all bridge configurations
export const getBridgeConfigurations = async (status?: BridgeStatus) => {
  try {
    const url = status 
      ? `/api/bridges?status=${status}` 
      : '/api/bridges';
    return await apiRequest(url);
  } catch (error) {
    console.error('Error fetching bridge configurations:', error);
    return [];
  }
};

// Get bridge by ID
export const getBridgeById = async (id: number) => {
  try {
    return await apiRequest(`/api/bridges/${id}`);
  } catch (error) {
    console.error(`Error fetching bridge with ID ${id}:`, error);
    return null;
  }
};

// Get transactions by bridge ID or user ID
export const getBridgeTransactions = async (
  bridgeId?: number,
  userId?: number,
  limit?: number
) => {
  try {
    let url = '/api/bridge-transactions';
    const params = new URLSearchParams();
    
    if (bridgeId) params.append('bridgeId', bridgeId.toString());
    if (userId) params.append('userId', userId.toString());
    if (limit) params.append('limit', limit.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return await apiRequest(url);
  } catch (error) {
    console.error('Error fetching bridge transactions:', error);
    return [];
  }
};

// Create a new bridge transaction
export const createBridgeTransaction = async (transaction: any) => {
  try {
    return await apiRequest('/api/bridge-transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  } catch (error) {
    console.error('Error creating bridge transaction:', error);
    throw error;
  }
};

// Get bridge health status
export const getBridgeHealth = async (bridgeId: number) => {
  try {
    return await apiRequest(`/api/bridges/${bridgeId}/health`);
  } catch (error) {
    console.error(`Error fetching health for bridge ID ${bridgeId}:`, error);
    return {
      isOnline: false,
      sourceNetworkStatus: 'offline',
      targetNetworkStatus: 'offline',
      averageTransactionTime: null,
      successRate: 0,
      validatorCount: 0,
      activeValidators: 0,
    };
  }
};

// Get supported tokens for a bridge
export const getSupportedTokens = async (bridgeId: number) => {
  try {
    return await apiRequest(`/api/bridges/${bridgeId}/tokens`);
  } catch (error) {
    console.error(`Error fetching tokens for bridge ID ${bridgeId}:`, error);
    return [];
  }
};

// Run a bridge test
export const runBridgeTest = async (
  bridgeId: number, 
  qubits: number, 
  iterations: number
) => {
  try {
    return await apiRequest('/api/bridge-tests', {
      method: 'POST',
      body: JSON.stringify({ bridgeId, qubits, iterations }),
    });
  } catch (error) {
    console.error('Error running bridge test:', error);
    throw error;
  }
};

// Mock data for development purposes
// These should be replaced with actual API calls in production
export const getMockBridges = () => [
  {
    id: 1,
    name: 'Aetherion-Ethereum Bridge',
    sourceNetwork: 'aetherion',
    targetNetwork: 'ethereum',
    status: BridgeStatus.ACTIVE,
    validatorThreshold: 3,
    processingTime: 45,
    securityLevel: 9
  },
  {
    id: 2,
    name: 'Aetherion-Solana Bridge',
    sourceNetwork: 'aetherion',
    targetNetwork: 'solana',
    status: BridgeStatus.ACTIVE,
    validatorThreshold: 5,
    processingTime: 30,
    securityLevel: 8
  },
  {
    id: 3,
    name: 'Aetherion-Filecoin Bridge',
    sourceNetwork: 'aetherion',
    targetNetwork: 'filecoin',
    status: BridgeStatus.ACTIVE,
    validatorThreshold: 2,
    processingTime: 60,
    securityLevel: 7
  }
];

export const getMockTransactions = () => [
  {
    id: 1,
    bridgeId: 1,
    sourceNetwork: 'aetherion',
    targetNetwork: 'ethereum',
    sourceAddress: '0x1234567890abcdef1234567890abcdef12345678',
    targetAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    amount: '1.5',
    tokenSymbol: 'AET',
    status: BridgeTransactionStatus.COMPLETED,
    sourceTransactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    targetTransactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    fee: '0.001',
    initiatedAt: new Date(Date.now() - 3600000), // 1 hour ago
    completedAt: new Date(Date.now() - 3300000), // 55 minutes ago
  },
  {
    id: 2,
    bridgeId: 2,
    sourceNetwork: 'aetherion',
    targetNetwork: 'solana',
    sourceAddress: '0x1234567890abcdef1234567890abcdef12345678',
    targetAddress: 'SoLABCDEFGHIJKLmNOpqRsTuVwXyZ1234567890AbCdEf',
    amount: '5.0',
    tokenSymbol: 'AET',
    status: BridgeTransactionStatus.PENDING_TARGET_EXECUTION,
    sourceTransactionHash: '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef',
    targetTransactionHash: null,
    fee: '0.002',
    initiatedAt: new Date(Date.now() - 1800000), // 30 minutes ago
    completedAt: null,
  },
  {
    id: 3,
    bridgeId: 3,
    sourceNetwork: 'aetherion',
    targetNetwork: 'filecoin',
    sourceAddress: '0x1234567890abcdef1234567890abcdef12345678',
    targetAddress: 'f1abcdefghijklmnopqrstuvwxyz1234567890abc',
    amount: '10.0',
    tokenSymbol: 'AET',
    status: BridgeTransactionStatus.FAILED,
    sourceTransactionHash: '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef',
    targetTransactionHash: null,
    fee: '0.005',
    initiatedAt: new Date(Date.now() - 86400000), // 1 day ago
    completedAt: null,
    errorMessage: 'Insufficient validators available.'
  }
];

export const getMockBridgeTestResult = () => ({
  testId: 'qbt-1234-5678',
  timeElapsed: 12.5,
  bridgeId: 1,
  qubits: 6,
  iterations: 10,
  summary: {
    totalTestsRun: 320,
    successRate: 0.96,
    averageTransactionTime: 2.3,
    vulnerabilitiesDetected: 2,
    mostSecureBridge: 'Aetherion-Ethereum',
    vulnerableBridges: [],
    bridgeResults: [
      {
        bridgeName: 'Aetherion-Ethereum',
        quantumResistanceScore: 0.95,
        successRate: 0.98,
        avgConfirmationTime: 2.1,
        vulnerabilitiesCount: 0,
        highSeverityCount: 0
      },
      {
        bridgeName: 'Aetherion-Solana',
        quantumResistanceScore: 0.88,
        successRate: 0.94,
        avgConfirmationTime: 1.8,
        vulnerabilitiesCount: 1,
        highSeverityCount: 0
      },
      {
        bridgeName: 'Aetherion-Filecoin',
        quantumResistanceScore: 0.72,
        successRate: 0.85,
        avgConfirmationTime: 3.2,
        vulnerabilitiesCount: 3,
        highSeverityCount: 1
      }
    ]
  }
});