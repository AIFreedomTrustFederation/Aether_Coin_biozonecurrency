
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Base API client for shared configuration
class ApiClient {
  client: AxiosInstance;
  
  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    });
    
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API request failed:', error);
        return Promise.reject(error);
      }
    );
  }
  
  // Method to set auth token
  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // Clear auth token (for logout)
  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }
}

// Create a default API client instance
const defaultClient = new ApiClient('/api');

// Generic API request function
export const apiRequest = async <T = any>({
  url,
  method = 'GET',
  data = undefined,
  params = undefined,
  headers = {}
}: {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  params?: any;
  headers?: Record<string, string>;
}): Promise<T> => {
  try {
    const response = await defaultClient.client.request<T>({
      url,
      method,
      data,
      params,
      headers
    });
    
    return response.data;
  } catch (error) {
    console.error(`API ${method} request to ${url} failed:`, error);
    throw error;
  }
};

export default ApiClient;
