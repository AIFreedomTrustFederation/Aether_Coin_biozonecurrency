/**
 * FractalCoin Service
 * 
 * Provides frontend services for interacting with the FractalCoin API
 */

import axios from 'axios';

// Base API URL - will be proxied through our Express server
const API_BASE_URL = '/api/fractalcoin';

// Transaction types
export enum TransactionType {
  SEND = 'send',
  RECEIVE = 'receive',
  STORAGE_ALLOCATION = 'storage_allocation',
  BRIDGE_CREATION = 'bridge_creation',
  REWARD = 'reward',
}

// Transaction interface
export interface FractalTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
  type?: TransactionType;
  blockNumber?: number;
  gasPrice?: string;
  gasUsed?: string;
  metadata?: any;
}

// Storage node interface
export interface StorageNode {
  id: string;
  region: string;
  endpoint: string;
  status?: 'online' | 'offline' | 'syncing';
  usedStorage?: number;
  totalStorage?: number;
}

// Bridge interface
export interface FractalBridge {
  id: string;
  type: string;
  cid: string;
  createdAt: string;
  status: 'active' | 'inactive';
  allocatedBytes: number;
  nodes: StorageNode[];
}

// Account interface
export interface FractalAccount {
  address: string;
  balance: string;
  network: string;
  storageAllocated: number;
  storageUsed: number;
}

// Storage metrics interface
export interface StorageMetrics {
  allocated: number;
  used: number;
  available: number;
  nodes: number;
  regions: Array<{
    name: string;
    nodes: number;
  }>;
}

// Error handling helper
const handleAxiosError = (error: any): never => {
  if (error.response) {
    // The request was made and the server responded with an error status
    throw new Error(`FractalCoin API Error (${error.response.status}): ${error.response.data.message || 'Unknown error'}`);
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('No response received from FractalCoin API. Please check your connection.');
  } else {
    // Something happened in setting up the request
    throw new Error(`Error setting up request: ${error.message}`);
  }
};

/**
 * Get account information
 */
export const getAccountInfo = async (): Promise<FractalAccount> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/account/info`);
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

/**
 * Get account balance
 */
export const getBalance = async (): Promise<{
  balance: string;
  symbol: string;
  network: string;
}> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/account/balance`);
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

/**
 * Get transaction history
 * @param page Page number
 * @param limit Number of transactions per page
 */
export const getTransactions = async (
  page = 1, 
  limit = 20
): Promise<{
  transactions: FractalTransaction[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/account/transactions`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

/**
 * Transfer FractalCoin
 * @param to Recipient address
 * @param amount Amount to transfer
 * @param memo Optional memo
 */
export const transferFractalCoin = async (
  to: string,
  amount: string,
  memo?: string
): Promise<{
  success: boolean;
  transactionHash: string;
  message?: string;
}> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/transactions/transfer`, {
      to,
      amount,
      memo
    });
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

/**
 * Get storage metrics
 */
export const getStorageMetrics = async (): Promise<StorageMetrics> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/storage/metrics`);
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

/**
 * Allocate storage
 * @param bytes Number of bytes to allocate
 * @param options Allocation options
 */
export const allocateStorage = async (
  bytes: number,
  options?: {
    purpose?: string;
    redundancy?: number;
    encryption?: string;
  }
): Promise<{
  success: boolean;
  allocatedBytes: number;
  nodes: StorageNode[];
  message?: string;
}> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/storage/allocate`, {
      bytes,
      purpose: options?.purpose || 'general',
      redundancy: options?.redundancy || 3,
      encryption: options?.encryption || 'aes-256-gcm'
    });
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

/**
 * List active bridges
 */
export const listBridges = async (): Promise<{
  bridges: FractalBridge[];
  total: number;
}> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/bridges/list`);
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

/**
 * Create a bridge to another network (like Filecoin)
 * @param type Bridge type (e.g., 'filecoin')
 * @param config Bridge configuration
 */
export const createBridge = async (
  type: string,
  config: any
): Promise<{
  success: boolean;
  cid: string;
  message?: string;
}> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/bridges/create`, {
      type,
      config
    });
    return response.data;
  } catch (error) {
    return handleAxiosError(error);
  }
};

/**
 * Format bytes to human-readable string
 * @param bytes Number of bytes
 * @param decimals Number of decimal places
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format account address for display (truncate middle)
 * @param address Full address string
 * @param startChars Number of starting characters to keep
 * @param endChars Number of ending characters to keep
 */
export const formatAddress = (
  address: string, 
  startChars = 6, 
  endChars = 4
): string => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

// Export all functions as a service object
const fractalCoinService = {
  getAccountInfo,
  getBalance,
  getTransactions,
  transferFractalCoin,
  getStorageMetrics,
  allocateStorage,
  listBridges,
  createBridge,
  formatBytes,
  formatAddress,
};

export default fractalCoinService;