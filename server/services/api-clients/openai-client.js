/**
 * OpenAI API Client
 * 
 * Provides authenticated access to OpenAI's APIs including conversation extraction
 */

const fetch = require('node-fetch');

/**
 * OpenAI API Client Class
 * Handles interactions with OpenAI's API endpoints with authentication
 */
class OpenAIClient {
  /**
   * Initialize the OpenAI API client
   * @param {Object} options - Configuration options
   * @param {Object} options.logger - Logger instance
   * @param {Object} options.authProvider - Authentication provider instance
   * @param {string} options.baseUrl - Base URL for API requests
   */
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.authProvider = options.authProvider;
    this.baseUrl = options.baseUrl || 'https://api.openai.com/v1';
    this.chatBaseUrl = options.chatBaseUrl || 'https://chat.openai.com';
    this.logger.info('OpenAI API Client initialized');
  }

  /**
   * Make an authenticated API request
   * @param {string} endpoint - API endpoint path
   * @param {Object} options - Request options
   * @param {string} sessionId - Session identifier for authentication
   * @returns {Promise<Object>} - Promise resolving to API response
   */
  async request(endpoint, options = {}, sessionId) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    // Get authentication headers
    const authHeaders = this.authProvider.getAuthHeaders(sessionId);
    
    if (!authHeaders && !options.skipAuthCheck) {
      throw new Error('Authentication required for this request');
    }
    
    // Prepare request options
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        ...authHeaders,
        ...options.headers
      },
      ...options
    };
    
    // Remove headers from the additional options to avoid duplication
    if (requestOptions.headers) {
      delete requestOptions.headers;
    }
    
    try {
      const response = await fetch(url, requestOptions);
      
      // Check for HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      // Parse JSON response
      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error(`API request error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract a conversation using OpenAI's share API
   * @param {string} shareId - The conversation share identifier
   * @param {string} sessionId - Session identifier for authentication
   * @returns {Promise<Object>} - Promise resolving to conversation data
   */
  async extractSharedConversation(shareId, sessionId) {
    try {
      // First try unauthenticated API (public shares)
      const endpoint = `${this.chatBaseUrl}/backend-api/share/${shareId}`;
      
      try {
        // Try to get without authentication first (public shares)
        const data = await this.request(endpoint, { 
          skipAuthCheck: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        this.logger.debug(`Successfully retrieved shared conversation ${shareId} without authentication`);
        return this.normalizeConversationData(data, shareId);
      } catch (publicError) {
        this.logger.debug(`Public API failed, trying authenticated: ${publicError.message}`);
        
        // If public access fails, try with authentication
        if (!this.authProvider.getToken(sessionId)) {
          this.logger.warn('No authentication token available for private conversation');
          throw new Error('Authentication required to access this conversation');
        }
        
        // Make authenticated request
        const data = await this.request(endpoint, {
          headers: {
            'Content-Type': 'application/json'
          }
        }, sessionId);
        
        this.logger.debug(`Successfully retrieved shared conversation ${shareId} with authentication`);
        return this.normalizeConversationData(data, shareId);
      }
    } catch (error) {
      this.logger.error(`Failed to extract conversation ${shareId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Normalize conversation data from OpenAI's API
   * @param {Object} data - API response data
   * @param {string} shareId - The conversation share identifier
   * @returns {Object} - Normalized conversation object
   */
  normalizeConversationData(data, shareId) {
    // Check if we have a valid conversation
    if (!data) {
      throw new Error('No conversation data returned from API');
    }
    
    // Extract conversation title
    const title = data.title || `ChatGPT Conversation ${shareId.substring(0, 8)}`;
    
    // Initialize messages array and metadata
    let messages = [];
    const metadata = {
      source: 'chatgpt',
      extractedAt: new Date().toISOString(),
      originalShareId: shareId
    };
    
    // Process messages if available
    if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
      messages = data.messages.map(msg => {
        return {
          role: msg.author?.role || 'unknown',
          content: Array.isArray(msg.content?.parts) 
            ? msg.content.parts.join('\n') 
            : (msg.content || '')
        };
      });
      
      metadata.messageCount = messages.length;
      metadata.extractionMethod = 'api';
    } else {
      // If no messages found, create placeholder with info from metadata
      messages = [
        {
          role: 'system',
          content: 'This conversation was extracted from a ChatGPT sharing link, but only metadata was available.'
        },
        {
          role: 'user',
          content: `Topic: ${title}`
        },
        {
          role: 'assistant',
          content: 'The full conversation content could not be extracted. This is a partial reconstruction based on available metadata.'
        }
      ];
      
      metadata.messageCount = 3;
      metadata.extractionMethod = 'metadata_reconstruction';
      metadata.partialReconstruction = true;
      
      // Add any additional metadata we can find
      if (data.create_time) metadata.createTime = data.create_time;
      if (data.update_time) metadata.updateTime = data.update_time;
    }
    
    // Return full conversation object
    return {
      title,
      messages,
      metadata,
      shareUrl: `https://chat.openai.com/share/${shareId}`
    };
  }
}

module.exports = OpenAIClient;