
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

export default ApiClient;
