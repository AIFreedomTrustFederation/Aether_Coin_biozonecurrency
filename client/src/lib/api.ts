import { WalletBalance, Transaction, SmartContract, AiMonitoringLog, CidEntry } from '../types/wallet';
import { apiRequest } from './queryClient';

// Wallet API
export const fetchWallets = async (): Promise<WalletBalance[]> => {
  const response = await fetch('/api/wallets', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch wallets');
  }
  
  const wallets = await response.json();
  
  // Transform to include additional display data
  return wallets.map((wallet: any) => {
    let dollarValue = 0;
    let percentChange = 0;
    
    // Sample price mapping
    if (wallet.chain === 'bitcoin') {
      dollarValue = parseFloat(wallet.balance) * 29865.43;
      percentChange = -2.14;
    } else if (wallet.chain === 'ethereum') {
      dollarValue = parseFloat(wallet.balance) * 2012.23;
      percentChange = 8.56;
    } else if (wallet.chain === 'solana') {
      dollarValue = parseFloat(wallet.balance) * 37.24;
      percentChange = 12.34;
    } else {
      // Default values for other chains
      dollarValue = parseFloat(wallet.balance) * 100;
      percentChange = 1.23;
    }
    
    return {
      ...wallet,
      dollarValue,
      percentChange,
      symbol: wallet.chain === 'bitcoin' ? 'BTC' : wallet.chain === 'ethereum' ? 'ETH' : wallet.chain === 'solana' ? 'SOL' : wallet.chain.toUpperCase(),
    };
  });
};

// Transaction API
export const fetchRecentTransactions = async (limit = 5): Promise<Transaction[]> => {
  const response = await fetch(`/api/transactions/recent?limit=${limit}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch recent transactions');
  }
  
  const transactions = await response.json();
  
  // Convert timestamp strings to Date objects
  return transactions.map((tx: any) => ({
    ...tx,
    timestamp: new Date(tx.timestamp),
  }));
};

export const fetchTransactionsByWallet = async (walletId: number): Promise<Transaction[]> => {
  const response = await fetch(`/api/wallets/${walletId}/transactions`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch transactions for wallet ${walletId}`);
  }
  
  const transactions = await response.json();
  
  // Convert timestamp strings to Date objects
  return transactions.map((tx: any) => ({
    ...tx,
    timestamp: new Date(tx.timestamp),
  }));
};

export const createTransaction = async (transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> => {
  const response = await apiRequest('POST', '/api/transactions', transaction);
  const newTransaction = await response.json();
  
  return {
    ...newTransaction,
    timestamp: new Date(newTransaction.timestamp),
  };
};

// Smart Contract API
export const fetchSmartContracts = async (): Promise<SmartContract[]> => {
  const response = await fetch('/api/contracts', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch smart contracts');
  }
  
  const contracts = await response.json();
  
  // Convert date strings to Date objects
  return contracts.map((contract: any) => ({
    ...contract,
    lastInteraction: contract.lastInteraction ? new Date(contract.lastInteraction) : undefined,
    createdAt: new Date(contract.createdAt),
  }));
};

export const createSmartContract = async (contract: Omit<SmartContract, 'id' | 'lastInteraction' | 'createdAt'>): Promise<SmartContract> => {
  const response = await apiRequest('POST', '/api/contracts', contract);
  const newContract = await response.json();
  
  return {
    ...newContract,
    lastInteraction: newContract.lastInteraction ? new Date(newContract.lastInteraction) : undefined,
    createdAt: new Date(newContract.createdAt),
  };
};

export const updateContractStatus = async (id: number, status: 'active' | 'pending' | 'inactive'): Promise<SmartContract> => {
  const response = await apiRequest('PATCH', `/api/contracts/${id}/status`, { status });
  const updatedContract = await response.json();
  
  return {
    ...updatedContract,
    lastInteraction: updatedContract.lastInteraction ? new Date(updatedContract.lastInteraction) : undefined,
    createdAt: new Date(updatedContract.createdAt),
  };
};

// AI Monitoring API
export const fetchAiMonitoringLogs = async (limit = 10): Promise<AiMonitoringLog[]> => {
  const response = await fetch(`/api/ai/logs?limit=${limit}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch AI monitoring logs');
  }
  
  const logs = await response.json();
  
  // Convert timestamp strings to Date objects
  return logs.map((log: any) => ({
    ...log,
    timestamp: new Date(log.timestamp),
  }));
};

export const createAiMonitoringLog = async (log: Omit<AiMonitoringLog, 'id' | 'timestamp'>): Promise<AiMonitoringLog> => {
  const response = await apiRequest('POST', '/api/ai/logs', log);
  const newLog = await response.json();
  
  return {
    ...newLog,
    timestamp: new Date(newLog.timestamp),
  };
};

// CID Management API
export const fetchCidEntries = async (): Promise<CidEntry[]> => {
  const response = await fetch('/api/cids', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch CID entries');
  }
  
  const entries = await response.json();
  
  // Convert date strings to Date objects
  return entries.map((entry: any) => ({
    ...entry,
    createdAt: new Date(entry.createdAt),
  }));
};

export const createCidEntry = async (entry: Omit<CidEntry, 'id' | 'createdAt'>): Promise<CidEntry> => {
  const response = await apiRequest('POST', '/api/cids', entry);
  const newEntry = await response.json();
  
  return {
    ...newEntry,
    createdAt: new Date(newEntry.createdAt),
  };
};

export const updateCidEntryStatus = async (id: number, status: 'active' | 'syncing' | 'inactive'): Promise<CidEntry> => {
  const response = await apiRequest('PATCH', `/api/cids/${id}/status`, { status });
  const updatedEntry = await response.json();
  
  return {
    ...updatedEntry,
    createdAt: new Date(updatedEntry.createdAt),
  };
};
