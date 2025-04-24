/**
 * OpenAI API Interceptor
 * 
 * Intercepts all OpenAI API requests and responses for conversation collection
 * Forwards conversations to Scroll Keeper for processing and training
 */

/**
 * OpenAI API Interceptor Class
 * Captures API interactions for learning and training
 */
class OpenAIInterceptor {
  /**
   * Initialize the OpenAI API interceptor
   * @param {Object} options - Configuration options
   * @param {Object} options.logger - Logger instance
   * @param {Object} options.parser - Conversation parser instance
   * @param {Object} options.storage - Storage service for conversations
   * @param {boolean} options.enabled - Whether the interceptor is enabled
   */
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.parser = options.parser;
    this.storage = options.storage;
    this.enabled = options.enabled !== false;
    this.logger.info(`OpenAI API Interceptor initialized (${this.enabled ? 'enabled' : 'disabled'})`);
    
    // Configuration for which requests to intercept
    this.config = {
      interceptCompletions: true,
      interceptChatCompletions: true,
      interceptAssistants: true,
      interceptEmbeddings: false, // Usually too noisy
      requireOptin: false, // Whether users need to opt in to interception
      optinHeader: 'X-Scroll-Keeper-Collect',
      privacyFilterEnabled: true, // Whether to apply privacy filtering
      privacyPatterns: [
        // PII patterns to redact
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
        /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, // US Phone
        /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, // SSN
        /\b(?:\d[ -]*?){13,16}\b/g // Credit card
      ]
    };
    
    // Stats for monitoring
    this.stats = {
      requestsIntercepted: 0,
      responsesCaptured: 0,
      conversationsCollected: 0,
      byEndpoint: {}
    };
  }

  /**
   * Middleware function to intercept API requests
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  middleware() {
    return async (req, res, next) => {
      if (!this.enabled) {
        return next();
      }
      
      // Skip if not an OpenAI API request
      if (!this.isOpenAIRequest(req)) {
        return next();
      }
      
      // Check for opt-in if required
      if (this.config.requireOptin && !req.headers[this.config.optinHeader]) {
        return next();
      }
      
      // Capture original response data
      const originalSend = res.send;
      
      // Intercept the response
      res.send = async (data) => {
        try {
          // Process after response is sent to avoid delays
          const responseData = typeof data === 'string' ? JSON.parse(data) : data;
          
          // Capture the conversation asynchronously
          this.captureConversation(req, responseData).catch(err => {
            this.logger.error('Error capturing conversation:', err);
          });
          
          // Update stats
          this.stats.responsesCaptured++;
          
          // Continue with the original response
          return originalSend.call(res, data);
        } catch (error) {
          this.logger.error('Error in API interceptor:', error);
          // Fallback to original behavior
          return originalSend.call(res, data);
        }
      };
      
      // Update stats
      this.stats.requestsIntercepted++;
      const endpoint = this.getEndpointType(req);
      this.stats.byEndpoint[endpoint] = (this.stats.byEndpoint[endpoint] || 0) + 1;
      
      // Continue processing
      next();
    };
  }

  /**
   * Determine if a request is an OpenAI API request
   * @param {Object} req - Express request object
   * @returns {boolean} - Whether this is an OpenAI API request
   */
  isOpenAIRequest(req) {
    // Check the host or path to identify OpenAI requests
    const isOpenAIHost = req.hostname === 'api.openai.com' || 
                         req.headers.host === 'api.openai.com';
    
    // Check common OpenAI API paths
    const isOpenAIPath = req.path.includes('/v1/chat/completions') || 
                         req.path.includes('/v1/completions') || 
                         req.path.includes('/v1/assistants') ||
                         req.path.includes('/v1/threads');
    
    return isOpenAIHost || isOpenAIPath;
  }

  /**
   * Get the endpoint type for a request
   * @param {Object} req - Express request object
   * @returns {string} - Endpoint type
   */
  getEndpointType(req) {
    const path = req.path.toLowerCase();
    
    if (path.includes('/v1/chat/completions')) {
      return 'chat-completions';
    } else if (path.includes('/v1/completions')) {
      return 'completions';
    } else if (path.includes('/v1/assistants') || path.includes('/v1/threads')) {
      return 'assistants';
    } else if (path.includes('/v1/embeddings')) {
      return 'embeddings';
    } else {
      return 'other';
    }
  }

  /**
   * Capture conversation data from an API request and response
   * @param {Object} req - Express request object
   * @param {Object} responseData - API response data
   */
  async captureConversation(req, responseData) {
    try {
      const endpoint = this.getEndpointType(req);
      
      // Skip based on configuration
      if ((endpoint === 'chat-completions' && !this.config.interceptChatCompletions) ||
          (endpoint === 'completions' && !this.config.interceptCompletions) ||
          (endpoint === 'assistants' && !this.config.interceptAssistants) ||
          (endpoint === 'embeddings' && !this.config.interceptEmbeddings)) {
        return;
      }
      
      // Get request body
      const requestBody = req.body || {};
      
      // Combine request and response data
      const combinedData = {
        ...responseData,
        request: requestBody
      };
      
      // Apply privacy filtering if enabled
      let processedData = combinedData;
      if (this.config.privacyFilterEnabled) {
        processedData = this.applyPrivacyFilter(combinedData);
      }
      
      // Additional metadata
      const metadata = {
        endpoint,
        timestamp: new Date().toISOString(),
        ip: this.anonymizeIp(req.ip),
        headers: this.filterHeaders(req.headers)
      };
      
      // Parse the conversation through the parser if available
      if (this.parser) {
        const conversation = await this.parser.parseConversation(
          processedData, endpoint, metadata
        );
        
        // Update stats
        this.stats.conversationsCollected++;
        
        this.logger.debug(`Captured ${endpoint} conversation`, { 
          id: conversation.id,
          messageCount: conversation.messages?.length || 0
        });
        
        return conversation;
      } else {
        // If no parser, just store the raw data
        if (this.storage) {
          await this.storage.storeRawConversation(processedData, metadata);
          this.stats.conversationsCollected++;
        }
        
        return processedData;
      }
    } catch (error) {
      this.logger.error('Error capturing conversation:', error);
    }
  }

  /**
   * Apply privacy filtering to sensitive data
   * @param {Object} data - Data to filter
   * @returns {Object} - Filtered data
   */
  applyPrivacyFilter(data) {
    // Deep clone the data to avoid modifying the original
    const filtered = JSON.parse(JSON.stringify(data));
    
    // Helper function to redact PII in strings
    const redactString = (str) => {
      if (typeof str !== 'string') return str;
      
      let redacted = str;
      this.config.privacyPatterns.forEach(pattern => {
        redacted = redacted.replace(pattern, '[REDACTED]');
      });
      
      return redacted;
    };
    
    // Helper function to process object recursively
    const processObject = (obj) => {
      if (!obj || typeof obj !== 'object') return;
      
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = redactString(obj[key]);
        } else if (typeof obj[key] === 'object') {
          processObject(obj[key]);
        }
      }
    };
    
    // Process all data
    processObject(filtered);
    
    return filtered;
  }

  /**
   * Anonymize IP address
   * @param {string} ip - IP address
   * @returns {string} - Anonymized IP
   */
  anonymizeIp(ip) {
    if (!ip) return null;
    
    // For IPv4, keep only first two octets
    if (ip.includes('.')) {
      const parts = ip.split('.');
      if (parts.length >= 4) {
        return `${parts[0]}.${parts[1]}.0.0`;
      }
    }
    
    // For IPv6, keep only first half
    if (ip.includes(':')) {
      const parts = ip.split(':');
      if (parts.length >= 4) {
        return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}::`;
      }
    }
    
    return ip;
  }

  /**
   * Filter sensitive headers
   * @param {Object} headers - Request headers
   * @returns {Object} - Filtered headers
   */
  filterHeaders(headers) {
    const filtered = { ...headers };
    
    // Remove sensitive headers
    const sensitiveHeaders = [
      'authorization',
      'cookie',
      'set-cookie',
      'x-api-key',
      'api-key',
      'apikey',
      'openai-api-key'
    ];
    
    sensitiveHeaders.forEach(header => {
      delete filtered[header];
    });
    
    return filtered;
  }

  /**
   * Enable or disable the interceptor
   * @param {boolean} enabled - Whether to enable the interceptor
   */
  setEnabled(enabled) {
    this.enabled = !!enabled;
    this.logger.info(`OpenAI API Interceptor ${this.enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get interceptor statistics
   * @returns {Object} - Interception statistics
   */
  getStats() {
    return {
      ...this.stats,
      enabled: this.enabled,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Reset interceptor statistics
   */
  resetStats() {
    this.stats = {
      requestsIntercepted: 0,
      responsesCaptured: 0,
      conversationsCollected: 0,
      byEndpoint: {}
    };
  }
}

module.exports = OpenAIInterceptor;