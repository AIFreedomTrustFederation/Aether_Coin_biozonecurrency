import { 
  WalletBalance, 
  Transaction, 
  SmartContract, 
  AiMonitoringLog, 
  CidEntry, 
  PaymentMethod, 
  Payment,
  WalletHealthScore,
  WalletHealthIssue
} from '../types/wallet';
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

// Payment Methods API
export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await fetch('/api/payment-methods', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch payment methods');
  }
  
  const paymentMethods = await response.json();
  
  // Convert date strings to Date objects
  return paymentMethods.map((method: any) => ({
    ...method,
    createdAt: new Date(method.createdAt),
  }));
};

export const createPaymentMethod = async (paymentMethod: Omit<PaymentMethod, 'id' | 'createdAt'>): Promise<PaymentMethod> => {
  const response = await apiRequest('POST', '/api/payment-methods', paymentMethod);
  const newPaymentMethod = await response.json();
  
  return {
    ...newPaymentMethod,
    createdAt: new Date(newPaymentMethod.createdAt),
  };
};

export const updatePaymentMethodDefault = async (id: number, isDefault: boolean): Promise<PaymentMethod> => {
  const response = await apiRequest('PATCH', `/api/payment-methods/${id}/default`, { isDefault });
  const updatedPaymentMethod = await response.json();
  
  return {
    ...updatedPaymentMethod,
    createdAt: new Date(updatedPaymentMethod.createdAt),
  };
};

export const deletePaymentMethod = async (id: number): Promise<void> => {
  await apiRequest('DELETE', `/api/payment-methods/${id}`);
};

// Payments API
export const fetchPayments = async (): Promise<Payment[]> => {
  const response = await fetch('/api/payments', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch payments');
  }
  
  const payments = await response.json();
  
  // Convert date strings to Date objects
  return payments.map((payment: any) => ({
    ...payment,
    createdAt: new Date(payment.createdAt),
    processedAt: payment.processedAt ? new Date(payment.processedAt) : undefined,
  }));
};

export const createPayment = async (payment: Omit<Payment, 'id' | 'createdAt' | 'processedAt'>): Promise<Payment> => {
  const response = await apiRequest('POST', '/api/payments', payment);
  const newPayment = await response.json();
  
  return {
    ...newPayment,
    createdAt: new Date(newPayment.createdAt),
    processedAt: newPayment.processedAt ? new Date(newPayment.processedAt) : undefined,
  };
};

export const getPaymentStatus = async (id: number): Promise<Payment> => {
  const response = await fetch(`/api/payments/${id}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch payment status for payment ${id}`);
  }
  
  const payment = await response.json();
  
  return {
    ...payment,
    createdAt: new Date(payment.createdAt),
    processedAt: payment.processedAt ? new Date(payment.processedAt) : undefined,
  };
};

// Stripe specific APIs
export const createPaymentIntent = async (amount: number, currency: string, metadata?: Record<string, any>): Promise<{ clientSecret: string, id: string }> => {
  const response = await apiRequest('POST', '/api/payments/intent', { 
    amount, 
    currency,
    metadata
  });
  
  return await response.json();
};

export const saveStripePaymentMethod = async (stripePaymentMethodId: string, isDefault: boolean = false): Promise<PaymentMethod> => {
  const response = await apiRequest('POST', '/api/payment-methods', {
    stripePaymentMethodId,
    isDefault
  });
  
  const newPaymentMethod = await response.json();
  return {
    ...newPaymentMethod,
    createdAt: new Date(newPaymentMethod.createdAt)
  };
};

export const processPayment = async (paymentMethodId: number, amount: number, currency: string, description: string, walletId?: number): Promise<Payment> => {
  const response = await apiRequest('POST', '/api/payments/process', {
    paymentMethodId,
    amount,
    currency,
    description,
    walletId
  });
  
  const payment = await response.json();
  return {
    ...payment,
    createdAt: new Date(payment.createdAt),
    processedAt: payment.processedAt ? new Date(payment.processedAt) : undefined
  };
};

// Wallet Health API
export const fetchWalletHealthScores = async (): Promise<WalletHealthScore[]> => {
  const response = await fetch('/api/wallet-health/scores', {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch wallet health scores');
  }
  
  const scores = await response.json();
  
  // Convert date strings to Date objects
  return scores.map((score: any) => ({
    ...score,
    createdAt: score.createdAt ? new Date(score.createdAt) : null,
    backgroundScanTimestamp: score.backgroundScanTimestamp ? new Date(score.backgroundScanTimestamp) : null,
  }));
};

export const fetchWalletHealthScoreByWalletId = async (walletId: number): Promise<WalletHealthScore> => {
  const response = await fetch(`/api/wallet-health/scores/wallet/${walletId}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch health score for wallet ${walletId}`);
  }
  
  const score = await response.json();
  
  return {
    ...score,
    createdAt: score.createdAt ? new Date(score.createdAt) : null,
    backgroundScanTimestamp: score.backgroundScanTimestamp ? new Date(score.backgroundScanTimestamp) : null,
  };
};

export const fetchWalletHealthIssues = async (scoreId: number): Promise<WalletHealthIssue[]> => {
  const response = await fetch(`/api/wallet-health/issues/${scoreId}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch health issues for score ${scoreId}`);
  }
  
  const issues = await response.json();
  
  // Convert date strings to Date objects
  return issues.map((issue: any) => ({
    ...issue,
    createdAt: issue.createdAt ? new Date(issue.createdAt) : null,
    resolvedAt: issue.resolvedAt ? new Date(issue.resolvedAt) : null,
  }));
};

export const createWalletHealthScore = async (score: Omit<WalletHealthScore, 'id' | 'createdAt'>): Promise<WalletHealthScore> => {
  const response = await apiRequest('POST', '/api/wallet-health/scores', score);
  const newScore = await response.json();
  
  return {
    ...newScore,
    createdAt: newScore.createdAt ? new Date(newScore.createdAt) : null,
    backgroundScanTimestamp: newScore.backgroundScanTimestamp ? new Date(newScore.backgroundScanTimestamp) : null,
  };
};

export const createWalletHealthIssue = async (issue: Omit<WalletHealthIssue, 'id' | 'createdAt' | 'resolvedAt'>): Promise<WalletHealthIssue> => {
  const response = await apiRequest('POST', '/api/wallet-health/issues', issue);
  const newIssue = await response.json();
  
  return {
    ...newIssue,
    createdAt: newIssue.createdAt ? new Date(newIssue.createdAt) : null,
    resolvedAt: newIssue.resolvedAt ? new Date(newIssue.resolvedAt) : null,
  };
};

export const updateWalletHealthIssueResolved = async (id: number, resolved: boolean): Promise<WalletHealthIssue> => {
  const response = await apiRequest('PATCH', `/api/wallet-health/issues/${id}/resolved`, { resolved });
  const updatedIssue = await response.json();
  
  return {
    ...updatedIssue,
    createdAt: updatedIssue.createdAt ? new Date(updatedIssue.createdAt) : null,
    resolvedAt: updatedIssue.resolvedAt ? new Date(updatedIssue.resolvedAt) : null,
  };
};
