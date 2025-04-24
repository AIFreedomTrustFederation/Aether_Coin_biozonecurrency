/**
 * API Client Factory
 * 
 * Factory for creating API clients for different services
 */

const OpenAIClient = require('./openai-client');

/**
 * API Client Factory Class
 * Creates and configures API clients for different services
 */
class ApiClientFactory {
  /**
   * Initialize the API client factory
   * @param {Object} options - Configuration options
   * @param {Object} options.logger - Logger instance
   * @param {Object} options.authProviders - Map of auth providers for different services
   */
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.authProviders = options.authProviders || {};
    this.clients = new Map();
    this.logger.info('API Client Factory initialized');
  }

  /**
   * Get a configured client for a specific service
   * @param {string} service - Service identifier (e.g., 'openai', 'huggingface')
   * @param {Object} options - Additional client options
   * @returns {Object} - Configured API client
   */
  getClient(service, options = {}) {
    // Check if we already have an instance for this service
    if (this.clients.has(service)) {
      return this.clients.get(service);
    }
    
    // Get the auth provider for this service
    const authProvider = this.authProviders[service];
    if (!authProvider) {
      throw new Error(`No auth provider configured for service: ${service}`);
    }
    
    // Create a new client instance based on the service type
    let client;
    
    switch (service.toLowerCase()) {
      case 'openai':
        client = new OpenAIClient({
          logger: this.logger,
          authProvider,
          ...options
        });
        break;
        
      // Add cases for other services as needed
      
      default:
        throw new Error(`Unsupported service type: ${service}`);
    }
    
    // Cache the client instance
    this.clients.set(service, client);
    return client;
  }

  /**
   * Clear cached client instances
   * @param {string} service - Optional service identifier to clear specific client
   */
  clearClients(service) {
    if (service) {
      this.clients.delete(service);
    } else {
      this.clients.clear();
    }
  }
}

module.exports = ApiClientFactory;