/**
 * Bot Simulation API Client
 * 
 * This module provides API clients for bots to interact with the Aetherion platform.
 * It integrates with the actual API endpoints while providing simulation-specific
 * functionality like rate limiting, error handling, and activity logging.
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig, AxiosHeaders } from 'axios';
import { getRandomInt, sleep } from './utils';
import { BotProfile } from './botSystem';

// Add metadata to AxiosRequestConfig
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  metadata?: {
    startTime: number;
    retryCount: number;
  };
}

// API Client Configuration
interface ApiClientConfig {
  baseUrl: string;
  timeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
  userAgent: string;
}

// Default configuration
const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: '/api', // Will be replaced with actual API URL in production
  timeoutMs: 30000,
  retryAttempts: 3,
  retryDelayMs: 1000,
  userAgent: 'AetherionBotSimulation/1.0'
};

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Base API Client
export class BaseApiClient {
  protected axiosInstance: AxiosInstance;
  protected config: ApiClientConfig;
  protected botProfile?: BotProfile;
  protected activityLog: {
    timestamp: Date;
    endpoint: string;
    method: string;
    status: number;
    duration: number;
    success: boolean;
  }[] = [];

  constructor(config: Partial<ApiClientConfig> = {}, botProfile?: BotProfile) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.botProfile = botProfile;

    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': this.config.userAgent,
        'X-Bot-Simulation': 'true'
      }
    });

    // Add request interceptor for auth if bot profile is provided
    if (botProfile) {
      this.axiosInstance.interceptors.request.use(config => {
        config.headers = config.headers || {};
        config.headers['X-Bot-ID'] = botProfile.id;
        config.headers['X-Bot-Wallet'] = botProfile.walletAddress;
        return config;
      });
    }

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      this.handleSuccessResponse.bind(this),
      this.handleErrorResponse.bind(this)
    );
  }

  // Handle successful responses
  private handleSuccessResponse(response: AxiosResponse) {
    const { config, status, headers } = response;
    const startTime = config.metadata?.startTime || Date.now();
    const duration = Date.now() - startTime;

    this.logActivity(config.url || '', config.method || 'GET', status, duration, true);
    return response;
  }

  // Handle error responses with retry logic
  private async handleErrorResponse(error: AxiosError): Promise<any> {
    const { config, response } = error;
    const status = response?.status || 0;
    
    // Set metadata if it doesn't exist
    if (!config.metadata) {
      config.metadata = {
        startTime: Date.now(),
        retryCount: 0
      };
    }

    const { startTime, retryCount } = config.metadata;
    const duration = Date.now() - startTime;

    // Log the error
    this.logActivity(
      config.url || '',
      config.method || 'GET',
      status,
      duration,
      false
    );

    // Don't retry certain status codes
    const noRetryStatuses = [400, 401, 403, 404, 422];
    if (noRetryStatuses.includes(status)) {
      return Promise.reject(error);
    }

    // Check if we should retry
    if (retryCount < this.config.retryAttempts) {
      config.metadata.retryCount = retryCount + 1;
      
      // Calculate delay with exponential backoff and jitter
      const delay = this.config.retryDelayMs * Math.pow(2, retryCount) + getRandomInt(0, 1000);
      
      console.log(`Retrying request to ${config.url} (attempt ${retryCount + 1}/${this.config.retryAttempts}) after ${delay}ms`);
      await sleep(delay);
      
      return this.axiosInstance(config);
    }

    return Promise.reject(error);
  }

  // Log API activity
  protected logActivity(endpoint: string, method: string, status: number, duration: number, success: boolean): void {
    this.activityLog.push({
      timestamp: new Date(),
      endpoint,
      method,
      status,
      duration,
      success
    });

    // Keep log size manageable
    if (this.activityLog.length > 1000) {
      this.activityLog.shift();
    }
  }

  // Get activity log
  public getActivityLog() {
    return this.activityLog;
  }

  // Basic request methods
  protected async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      // Track request start time for measurement
      const startTime = Date.now();
      
      const response = await this.axiosInstance.get<ApiResponse<T>>(url, { params });
      
      // Log the activity
      this.logActivity(
        url,
        'GET',
        response.status,
        Date.now() - startTime,
        true
      );
      
      return response.data;
    } catch (error) {
      return this.handleError<T>(error as AxiosError);
    }
  }

  protected async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      // Track request start time for measurement
      const startTime = Date.now();
      
      const response = await this.axiosInstance.post<ApiResponse<T>>(url, data);
      
      // Log the activity
      this.logActivity(
        url,
        'POST',
        response.status,
        Date.now() - startTime,
        true
      );
      
      return response.data;
    } catch (error) {
      return this.handleError<T>(error as AxiosError);
    }
  }

  protected async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      // Track request start time for measurement
      const startTime = Date.now();
      
      const response = await this.axiosInstance.put<ApiResponse<T>>(url, data);
      
      // Log the activity
      this.logActivity(
        url,
        'PUT',
        response.status,
        Date.now() - startTime,
        true
      );
      
      return response.data;
    } catch (error) {
      return this.handleError<T>(error as AxiosError);
    }
  }

  protected async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      // Track request start time for measurement
      const startTime = Date.now();
      
      const response = await this.axiosInstance.delete<ApiResponse<T>>(url);
      
      // Log the activity
      this.logActivity(
        url,
        'DELETE',
        response.status,
        Date.now() - startTime,
        true
      );
      
      return response.data;
    } catch (error) {
      return this.handleError<T>(error as AxiosError);
    }
  }

  // Error handling
  private handleError<T>(error: AxiosError): ApiResponse<T> {
    if (error.response) {
      // The request was made and the server responded with a status code
      // outside the 2xx range
      return {
        success: false,
        error: error.response.data?.error || 'API request failed',
        timestamp: new Date().toISOString()
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        success: false,
        error: 'No response received from server',
        timestamp: new Date().toISOString()
      };
    } else {
      // Something happened in setting up the request
      return {
        success: false,
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Wallet API Client
export class WalletApiClient extends BaseApiClient {
  constructor(config: Partial<ApiClientConfig> = {}, botProfile?: BotProfile) {
    super(config, botProfile);
  }

  // Get wallet balance
  async getBalance(address: string): Promise<ApiResponse<{ address: string; balance: number }>> {
    return this.get<{ address: string; balance: number }>(`/wallet/balance/${address}`);
  }

  // Get transaction history
  async getTransactions(address: string): Promise<ApiResponse<any[]>> {
    return this.get<any[]>(`/wallet/transactions/${address}`);
  }

  // Transfer funds
  async transfer(fromAddress: string, toAddress: string, amount: number): Promise<ApiResponse<any>> {
    return this.post<any>('/wallet/send', {
      fromAddress,
      toAddress,
      amount
    });
  }

  // Create new wallet
  async createWallet(userId: string): Promise<ApiResponse<any>> {
    // Generate random keys for simulation
    const publicKey = Buffer.from(Math.random().toString()).toString('base64');
    const encryptedPrivateKey = Buffer.from(Math.random().toString()).toString('base64');

    return this.post<any>('/wallet/create', {
      userId,
      publicKey,
      encryptedPrivateKey
    });
  }
}

// Node Marketplace API Client
export class NodeMarketplaceApiClient extends BaseApiClient {
  constructor(config: Partial<ApiClientConfig> = {}, botProfile?: BotProfile) {
    super(config, botProfile);
  }

  // List available nodes
  async listNodes(page: number = 1, limit: number = 10): Promise<ApiResponse<{
    nodes: Array<{
      nodeId: string;
      price: number;
      type: string;
      owner: string;
      description: string;
      status: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }>> {
    return this.get<{
      nodes: Array<{
        nodeId: string;
        price: number;
        type: string;
        owner: string;
        description: string;
        status: string;
      }>;
      total: number;
      page: number;
      limit: number;
    }>('/node-marketplace/list', { page, limit });
  }

  // Get node details
  async getNodeDetails(nodeId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/node-marketplace/node/${nodeId}`);
  }

  // Purchase a node
  async purchaseNode(nodeId: string, buyerAddress: string): Promise<ApiResponse<any>> {
    return this.post<any>('/node-marketplace/purchase', {
      nodeId,
      buyerAddress
    });
  }

  // List a node for sale
  async sellNode(ownerAddress: string, nodeType: string, price: number, description: string): Promise<ApiResponse<any>> {
    return this.post<any>('/node-marketplace/sell', {
      ownerAddress,
      nodeType,
      price,
      description
    });
  }
}

// API Client Factory
export class SimulationApiClientFactory {
  private static instance: SimulationApiClientFactory;
  private config: Partial<ApiClientConfig>;

  private constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = config;
  }

  // Get singleton instance
  public static getInstance(config: Partial<ApiClientConfig> = {}): SimulationApiClientFactory {
    if (!SimulationApiClientFactory.instance) {
      SimulationApiClientFactory.instance = new SimulationApiClientFactory(config);
    }
    return SimulationApiClientFactory.instance;
  }

  // Create wallet API client
  public createWalletApiClient(botProfile?: BotProfile): WalletApiClient {
    return new WalletApiClient(this.config, botProfile);
  }

  // Create node marketplace API client
  public createNodeMarketplaceApiClient(botProfile?: BotProfile): NodeMarketplaceApiClient {
    return new NodeMarketplaceApiClient(this.config, botProfile);
  }
}

// Export factory instance with default configuration
export const simulationApiFactory = SimulationApiClientFactory.getInstance();