import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { AppRegistry } from "../registry/AppRegistry";

/**
 * API Client Factory
 * 
 * Creates and manages API clients for different micro-apps
 * to ensure proper namespacing and consistent configuration.
 */
class ApiClientFactory {
  private baseClient: AxiosInstance;
  private clientMap: Record<string, AxiosInstance> = {};
  
  constructor() {
    // Create base client for general API requests
    this.baseClient = axios.create({
      baseURL: "/api",
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 30000 // 30 second default timeout
    });
    
    // Add global interceptors for authentication, etc.
    this.setupInterceptors(this.baseClient);
    
    // Create specialized clients for each app
    AppRegistry.getAvailableApps().forEach(app => {
      const client = axios.create({
        baseURL: `/api/${app.apiNamespace}`,
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 30000
      });
      
      // Add app-specific interceptors if needed
      this.setupInterceptors(client);
      
      this.clientMap[app.id] = client;
    });
  }
  
  /**
   * Setup request/response interceptors for an Axios instance
   */
  private setupInterceptors(client: AxiosInstance): void {
    // Request interceptor
    client.interceptors.request.use(
      (config) => {
        // Get authentication token from localStorage if available
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add quantum security headers
        config.headers["X-Quantum-Request-ID"] = this.generateRequestId();
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Response interceptor
    client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response) {
          // Handle specific error codes
          switch (error.response.status) {
            case 401:
              // Unauthorized - could trigger auth refresh or logout
              console.warn("API authentication error:", error.response.data);
              break;
            case 403:
              console.warn("API authorization error:", error.response.data);
              break;
            case 429:
              console.warn("API rate limit exceeded:", error.response.data);
              break;
          }
        } else if (error.request) {
          // No response received
          console.error("No response received from API:", error.request);
        } else {
          // Error setting up request
          console.error("Error setting up API request:", error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Generate a unique request ID for quantum security tracking
   */
  private generateRequestId(): string {
    return `qr-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }
  
  /**
   * Get the API client for a specific app
   */
  getClient(appId: string): AxiosInstance {
    return this.clientMap[appId] || this.baseClient;
  }
  
  /**
   * Get the base API client for general endpoints
   */
  getBaseClient(): AxiosInstance {
    return this.baseClient;
  }
  
  /**
   * Set authentication token for all clients
   */
  setAuthToken(token: string): void {
    // Set token in localStorage for persistence
    localStorage.setItem("auth_token", token);
    
    // Update all client instances
    this.baseClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    
    Object.values(this.clientMap).forEach(client => {
      client.defaults.headers.common.Authorization = `Bearer ${token}`;
    });
  }
  
  /**
   * Clear authentication token from all clients
   */
  clearAuthToken(): void {
    // Remove token from localStorage
    localStorage.removeItem("auth_token");
    
    // Remove from all client instances
    delete this.baseClient.defaults.headers.common.Authorization;
    
    Object.values(this.clientMap).forEach(client => {
      delete client.defaults.headers.common.Authorization;
    });
  }
}

// Export a singleton instance
export const apiClientFactory = new ApiClientFactory();