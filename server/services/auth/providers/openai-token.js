/**
 * OpenAI Token Provider
 * 
 * Provides authentication for OpenAI services using API tokens
 */

/**
 * OpenAI Token Provider Class
 * Handles authentication with OpenAI services using API tokens
 */
class OpenAITokenProvider {
  /**
   * Initialize the OpenAI token provider
   * @param {Object} options - Configuration options
   * @param {Object} options.logger - Logger instance
   * @param {string} options.defaultToken - Optional default token from environment
   */
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.defaultToken = options.defaultToken || process.env.OPENAI_API_KEY;
    this.sessionTokens = new Map();
    this.logger.info('OpenAI Token Provider initialized');
  }

  /**
   * Store a token for a session
   * @param {string} sessionId - Unique session identifier
   * @param {string} token - OpenAI API token
   * @param {number} expiry - Optional token expiry in seconds
   */
  setToken(sessionId, token, expiry = 3600) {
    this.logger.debug(`Setting token for session ${sessionId}`);
    
    // Add token to session map with expiry
    const expiryTime = Date.now() + (expiry * 1000);
    this.sessionTokens.set(sessionId, {
      token,
      expiryTime
    });
    
    // Set up automatic cleanup after expiry
    setTimeout(() => {
      this.clearToken(sessionId);
    }, expiry * 1000);
  }

  /**
   * Get a token for a session
   * @param {string} sessionId - Unique session identifier
   * @returns {string|null} - OpenAI API token or null if not found
   */
  getToken(sessionId) {
    // Check if we have a token for this session
    const sessionData = this.sessionTokens.get(sessionId);
    
    if (sessionData) {
      // Check if token is still valid
      if (sessionData.expiryTime > Date.now()) {
        return sessionData.token;
      } else {
        // Token expired, clean up
        this.clearToken(sessionId);
      }
    }
    
    // Fall back to default token if available
    return this.defaultToken || null;
  }

  /**
   * Clear a token for a session
   * @param {string} sessionId - Unique session identifier
   */
  clearToken(sessionId) {
    this.logger.debug(`Clearing token for session ${sessionId}`);
    this.sessionTokens.delete(sessionId);
  }

  /**
   * Check if a token is valid
   * @param {string} token - OpenAI API token to validate
   * @returns {Promise<boolean>} - Promise resolving to true if token is valid
   */
  async validateToken(token) {
    try {
      // Simple validation - just check the format for now
      // In a real implementation, we would make a lightweight API call to verify
      const isValidFormat = typeof token === 'string' && token.startsWith('sk-') && token.length > 20;
      
      if (!isValidFormat) {
        return false;
      }
      
      // Optional: Make a lightweight API call to verify the token
      // This is commented out to avoid unnecessary API calls during testing
      /*
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
      */
      
      return true;
    } catch (error) {
      this.logger.error('Error validating token:', error);
      return false;
    }
  }

  /**
   * Get authorization headers for API requests
   * @param {string} sessionId - Unique session identifier
   * @returns {Object|null} - Headers object or null if no token available
   */
  getAuthHeaders(sessionId) {
    const token = this.getToken(sessionId);
    
    if (!token) {
      return null;
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
}

export default OpenAITokenProvider;