import { apiRequest, queryClient } from './queryClient';
import { BridgeStatus, BridgeTransactionStatus } from '../../shared/bridge-schema';

// Types for bridges and transactions
export interface Bridge {
  id: number;
  name: string;
  sourceNetwork: string;
  targetNetwork: string;
  contractAddressSource?: string;
  contractAddressTarget?: string;
  status: BridgeStatus;
  feePercentage: string;
  minTransferAmount?: string;
  maxTransferAmount?: string;
  requiredConfirmations: number;
  validatorThreshold: number;
  createdAt: Date;
  updatedAt: Date;
  config: Record<string, any>;
  securityLevel: string;
}

export interface BridgeToken {
  id: number;
  bridgeId: number;
  tokenSymbol: string;
  tokenName: string;
  sourceTokenAddress?: string;
  targetTokenAddress?: string;
  decimals: number;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

export interface BridgeTransaction {
  id: number;
  bridgeId: number;
  userId: number;
  walletId: number;
  sourceTransactionHash?: string;
  targetTransactionHash?: string;
  sourceNetwork: string;
  targetNetwork: string;
  sourceAddress: string;
  targetAddress: string;
  amount: string;
  fee?: string;
  tokenSymbol: string;
  status: BridgeTransactionStatus;
  initiatedAt: Date;
  completedAt?: Date;
  validations: Array<{
    validatorId: number;
    signature: string;
    timestamp: Date;
  }>;
  metadata: Record<string, any>;
  errorMessage?: string;
}

// Bridge API
export const getBridges = async () => {
  return apiRequest<Bridge[]>('/api/bridges');
};

export const getBridgeById = async (id: number) => {
  return apiRequest<Bridge>(`/api/bridges/${id}`);
};

export const getBridgeByNetworks = async (sourceNetwork: string, targetNetwork: string) => {
  return apiRequest<Bridge>(`/api/bridges/networks/${sourceNetwork}/${targetNetwork}`);
};

export const getSupportedTokensForBridge = async (bridgeId: number) => {
  return apiRequest<BridgeToken[]>(`/api/bridges/${bridgeId}/tokens`);
};

export const getBridgeTransactions = async (userId: number) => {
  return apiRequest<BridgeTransaction[]>(`/api/bridges/transactions/user/${userId}`);
};

export const getBridgeTransactionById = async (id: number) => {
  return apiRequest<BridgeTransaction>(`/api/bridges/transactions/${id}`);
};

export const initiateTokenTransfer = async (data: {
  userId: number;
  walletId: number;
  bridgeId: number;
  sourceNetwork: string;
  targetNetwork: string;
  sourceAddress: string;
  targetAddress: string;
  amount: string;
  tokenSymbol: string;
}) => {
  return apiRequest<BridgeTransaction>(
    '/api/bridges/transactions', 
    'POST', 
    data
  );
};

// Invalidate transaction cache when a new transaction is created
export const invalidateTransactionsCache = () => {
  queryClient.invalidateQueries({ queryKey: ['/api/bridges/transactions'] });
};