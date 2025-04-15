import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Interface for API Clients
export interface ApiClient {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

// Base API Client implementation
class BaseApiClient implements ApiClient {
  protected client: AxiosInstance;
  protected baseUrl: string;
  
  constructor(baseUrl: string = '/api', config: AxiosRequestConfig = {}) {
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });
    
    this.setupInterceptors();
  }
  
  protected setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`
          };
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Directly return data from response
        return response.data;
      },
      (error) => {
        // Handle common errors
        if (error.response) {
          switch (error.response.status) {
            case 401:
              // Handle unauthorized
              console.error('Unauthorized access');
              // Redirect to login or refresh token
              break;
            case 403:
              // Handle forbidden
              console.error('Forbidden resource');
              break;
            case 404:
              // Handle not found
              console.error('Resource not found');
              break;
            case 500:
              // Handle server error
              console.error('Server error');
              break;
            default:
              console.error(`Error ${error.response.status}`, error.response.data);
          }
        } else if (error.request) {
          // Handle network errors
          console.error('Network error', error.request);
        } else {
          // Handle other errors
          console.error('Error', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config);
  }
  
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.post(url, data, config);
  }
  
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.put(url, data, config);
  }
  
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }
  
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.client.patch(url, data, config);
  }
}

// Specialized API clients for each micro-app
class DashboardApiClient extends BaseApiClient {
  constructor() {
    super('/api/dashboard');
  }
  
  // Dashboard-specific methods
  getDashboardStats(): Promise<any> {
    return this.get('/stats');
  }
  
  getRecentActivity(): Promise<any> {
    return this.get('/activity');
  }
}

class WalletApiClient extends BaseApiClient {
  constructor() {
    super('/api/wallet');
  }
  
  // Wallet-specific methods
  getBalances(): Promise<any> {
    return this.get('/balances');
  }
  
  getTransactions(): Promise<any> {
    return this.get('/transactions');
  }
  
  transfer(data: { to: string; amount: number; asset: string }): Promise<any> {
    return this.post('/transfer', data);
  }
}

class NodeMarketplaceApiClient extends BaseApiClient {
  constructor() {
    super('/api/node-marketplace');
  }
  
  // Node Marketplace-specific methods
  getAvailableServices(): Promise<any> {
    return this.get('/services');
  }
  
  getUserServices(): Promise<any> {
    return this.get('/user/services');
  }
  
  getUserRewards(): Promise<any> {
    return this.get('/user/rewards');
  }
  
  deployService(data: any): Promise<any> {
    return this.post('/deploy', data);
  }
}

class TokenomicsApiClient extends BaseApiClient {
  constructor() {
    super('/api/tokenomics');
  }
  
  // Tokenomics-specific methods
  getMarketData(): Promise<any> {
    return this.get('/market');
  }
  
  getSupplyInfo(): Promise<any> {
    return this.get('/supply');
  }
}

class AICoinApiClient extends BaseApiClient {
  constructor() {
    super('/api/aicoin');
  }
  
  // AICoin-specific methods
  getNetworkStats(): Promise<any> {
    return this.get('/network/stats');
  }
  
  getUserResources(): Promise<any> {
    return this.get('/user/resources');
  }
  
  allocateResources(data: any): Promise<any> {
    return this.post('/allocate', data);
  }
}

// API Client Factory
class ApiClientFactory {
  private clients: Record<string, ApiClient> = {};
  
  constructor() {
    // Initialize default clients
    this.clients = {
      dashboard: new DashboardApiClient(),
      wallet: new WalletApiClient(),
      nodeMarketplace: new NodeMarketplaceApiClient(),
      tokenomics: new TokenomicsApiClient(),
      aicoin: new AICoinApiClient()
    };
  }
  
  /**
   * Get an API client for a specific app
   * @param appId App identifier
   * @returns API client for the specified app
   */
  getClient(appId: string): ApiClient {
    if (!this.clients[appId]) {
      console.warn(`No specific API client found for app "${appId}". Using base client.`);
      this.clients[appId] = new BaseApiClient(`/api/${appId}`);
    }
    
    return this.clients[appId];
  }
  
  /**
   * Register a new API client
   * @param appId App identifier
   * @param client API client instance
   */
  registerClient(appId: string, client: ApiClient): void {
    this.clients[appId] = client;
  }
}

// Export singleton instance
export const apiClientFactory = new ApiClientFactory();