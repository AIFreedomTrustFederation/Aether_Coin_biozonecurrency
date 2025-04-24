/**
 * OpenAI API Client for Mysterion/Scroll Keeper
 * 
 * This module provides a unified interface for making API calls to OpenAI services
 * and automatically captures conversations for training purposes.
 */

import OpenAI from 'openai';

class OpenAIClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.OPENAI_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    this.openai = new OpenAI({
      apiKey: this.apiKey
    });
    
    this.interceptCallback = options.interceptCallback || null;
  }
  
  /**
   * Create a chat completion via OpenAI API
   * 
   * @param {Object} options - Chat completion options
   * @param {Array} options.messages - Array of message objects
   * @param {string} options.model - Model to use (defaults to gpt-4o)
   * @param {number} options.temperature - Temperature for response generation
   * @returns {Promise<Object>} The completion response
   */
  async createChatCompletion(options) {
    try {
      const defaultOptions = {
        model: 'gpt-4o', // Default to the newest model (gpt-4o)
        temperature: 0.7,
        max_tokens: 1000
      };
      
      const requestOptions = { ...defaultOptions, ...options };
      const response = await this.openai.chat.completions.create(requestOptions);
      
      // Intercept for training if callback is defined
      if (this.interceptCallback) {
        this.interceptCallback('chat/completions', requestOptions, response);
      }
      
      return response;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
  
  /**
   * Set a callback for intercepting API requests and responses
   * Used for capturing training data
   * 
   * @param {Function} callback - Function(endpoint, request, response)
   */
  setInterceptCallback(callback) {
    if (typeof callback === 'function') {
      this.interceptCallback = callback;
    }
  }
}

export default OpenAIClient;