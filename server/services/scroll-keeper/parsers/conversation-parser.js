/**
 * Conversation Parser Service
 * 
 * Parses and processes conversations from OpenAI APIs for LLM training
 * Captures data in a standardized format suitable for training datasets
 */

/**
 * Conversation Parser Class
 * Processes raw conversation data from various OpenAI API sources
 */
class ConversationParser {
  /**
   * Initialize the conversation parser
   * @param {Object} options - Configuration options
   * @param {Object} options.logger - Logger instance
   * @param {Object} options.storage - Storage service for saving processed conversations
   * @param {Object} options.vectorizer - Optional vectorization service for embeddings
   */
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.storage = options.storage;
    this.vectorizer = options.vectorizer;
    this.logger.info('Conversation Parser initialized');
    
    // Supported API sources
    this.supportedSources = [
      'chat-completions',
      'completions',
      'assistants',
      'shared-conversations'
    ];
    
    // Initialize statistics
    this.stats = {
      parsedCount: 0,
      failedCount: 0,
      bySource: {}
    };
    
    // Initialize supported sources stats
    this.supportedSources.forEach(source => {
      this.stats.bySource[source] = {
        parsedCount: 0,
        failedCount: 0
      };
    });
  }

  /**
   * Process a conversation from any supported OpenAI API source
   * @param {Object} data - Raw API response data
   * @param {string} source - Source API type (e.g., 'chat-completions')
   * @param {Object} metadata - Additional metadata about the conversation
   * @returns {Object} - Processed conversation in standardized format
   */
  async parseConversation(data, source, metadata = {}) {
    try {
      // Validate source type
      if (!this.supportedSources.includes(source)) {
        throw new Error(`Unsupported source type: ${source}`);
      }
      
      // Process based on source type
      let processedConversation;
      
      switch (source) {
        case 'chat-completions':
          processedConversation = this.parseChatCompletions(data, metadata);
          break;
          
        case 'completions':
          processedConversation = this.parseCompletions(data, metadata);
          break;
          
        case 'assistants':
          processedConversation = this.parseAssistants(data, metadata);
          break;
          
        case 'shared-conversations':
          processedConversation = this.parseSharedConversation(data, metadata);
          break;
          
        default:
          throw new Error(`Parser not implemented for source: ${source}`);
      }
      
      // Generate embeddings if vectorizer is available
      if (this.vectorizer && processedConversation.content) {
        this.logger.debug('Generating embeddings for conversation');
        processedConversation.embeddings = await this.vectorizer.generateEmbeddings(
          processedConversation.content
        );
      }
      
      // Update statistics
      this.stats.parsedCount++;
      this.stats.bySource[source].parsedCount++;
      
      // Store conversation if storage is available
      if (this.storage) {
        await this.storage.storeConversation(processedConversation);
      }
      
      return processedConversation;
    } catch (error) {
      this.logger.error(`Failed to parse conversation from ${source}: ${error.message}`);
      
      // Update statistics
      this.stats.failedCount++;
      if (this.stats.bySource[source]) {
        this.stats.bySource[source].failedCount++;
      }
      
      throw error;
    }
  }

  /**
   * Parse chat completions API response
   * @param {Object} data - Chat completions API response data
   * @param {Object} metadata - Additional metadata
   * @returns {Object} - Processed conversation
   */
  parseChatCompletions(data, metadata = {}) {
    this.logger.debug('Parsing chat completions API response');
    
    // Extract basic information
    const id = data.id || `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = data.created ? new Date(data.created * 1000).toISOString() : new Date().toISOString();
    const model = data.model || 'unknown';
    
    // Prepare content from messages
    let content = '';
    const messages = [];
    
    // Handle direct message objects in the request
    if (data.messages && Array.isArray(data.messages)) {
      data.messages.forEach(msg => {
        const role = msg.role || 'unknown';
        const messageContent = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
        
        messages.push({
          role,
          content: messageContent
        });
        
        // Append to full content
        content += `${role}: ${messageContent}\n\n`;
      });
    }
    
    // Handle choices with message objects in the response
    if (data.choices && Array.isArray(data.choices)) {
      data.choices.forEach((choice, index) => {
        if (choice.message) {
          const role = choice.message.role || 'assistant';
          const messageContent = typeof choice.message.content === 'string' 
            ? choice.message.content 
            : JSON.stringify(choice.message.content);
          
          messages.push({
            role,
            content: messageContent,
            index
          });
          
          // Append to full content
          content += `${role}: ${messageContent}\n\n`;
        }
      });
    }
    
    // Create processed conversation object
    const processedConversation = {
      id,
      source: 'chat-completions',
      timestamp,
      model,
      messages,
      content: content.trim(),
      metadata: {
        ...metadata,
        usage: data.usage || {},
        apiVersion: data.object || 'chat.completion',
        parsedAt: new Date().toISOString()
      }
    };
    
    return processedConversation;
  }

  /**
   * Parse completions API response
   * @param {Object} data - Completions API response data
   * @param {Object} metadata - Additional metadata
   * @returns {Object} - Processed conversation
   */
  parseCompletions(data, metadata = {}) {
    this.logger.debug('Parsing completions API response');
    
    // Extract basic information
    const id = data.id || `completion-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = data.created ? new Date(data.created * 1000).toISOString() : new Date().toISOString();
    const model = data.model || 'unknown';
    
    // Prepare content and messages
    let content = '';
    const messages = [];
    
    // Handle prompt from metadata or direct property
    const prompt = metadata.prompt || data.prompt || '';
    if (prompt) {
      messages.push({
        role: 'user',
        content: prompt
      });
      
      content += `user: ${prompt}\n\n`;
    }
    
    // Handle choices with text responses
    if (data.choices && Array.isArray(data.choices)) {
      data.choices.forEach((choice, index) => {
        const text = choice.text || '';
        
        messages.push({
          role: 'assistant',
          content: text,
          index
        });
        
        content += `assistant: ${text}\n\n`;
      });
    }
    
    // Create processed conversation object
    const processedConversation = {
      id,
      source: 'completions',
      timestamp,
      model,
      messages,
      content: content.trim(),
      metadata: {
        ...metadata,
        usage: data.usage || {},
        apiVersion: data.object || 'text_completion',
        parsedAt: new Date().toISOString()
      }
    };
    
    return processedConversation;
  }

  /**
   * Parse assistants API response
   * @param {Object} data - Assistants API response data
   * @param {Object} metadata - Additional metadata
   * @returns {Object} - Processed conversation
   */
  parseAssistants(data, metadata = {}) {
    this.logger.debug('Parsing assistants API response');
    
    // Extract conversation ID and basic info
    const id = data.thread?.id || data.id || `assistant-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString();
    const model = data.model || metadata.model || 'unknown';
    
    // Process based on response type
    let messages = [];
    let content = '';
    
    // If we have a thread with messages
    if (data.thread && data.thread.messages && Array.isArray(data.thread.messages)) {
      data.thread.messages.forEach(msg => {
        const role = msg.role || 'unknown';
        const messageContent = msg.content || '';
        
        messages.push({
          role,
          content: messageContent,
          id: msg.id
        });
        
        content += `${role}: ${messageContent}\n\n`;
      });
    } 
    // If we have a run with messages
    else if (data.messages && Array.isArray(data.messages)) {
      data.messages.forEach(msg => {
        const role = msg.role || 'unknown';
        const messageContent = msg.content || '';
        
        messages.push({
          role,
          content: messageContent,
          id: msg.id
        });
        
        content += `${role}: ${messageContent}\n\n`;
      });
    }
    // If we have a single message response
    else if (data.content) {
      const role = data.role || 'assistant';
      const messageContent = data.content;
      
      messages.push({
        role,
        content: messageContent,
        id: data.id
      });
      
      content += `${role}: ${messageContent}\n\n`;
    }
    
    // Create processed conversation object
    const processedConversation = {
      id,
      source: 'assistants',
      timestamp,
      model,
      messages,
      content: content.trim(),
      metadata: {
        ...metadata,
        threadId: data.thread?.id,
        assistantId: data.assistant_id || data.id,
        status: data.status,
        parsedAt: new Date().toISOString()
      }
    };
    
    return processedConversation;
  }

  /**
   * Parse shared conversation data
   * @param {Object} data - Shared conversation data
   * @param {Object} metadata - Additional metadata
   * @returns {Object} - Processed conversation
   */
  parseSharedConversation(data, metadata = {}) {
    this.logger.debug('Parsing shared conversation data');
    
    // Extract basic information
    const id = data.id || metadata.shareId || `shared-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = data.create_time 
      ? new Date(data.create_time * 1000).toISOString() 
      : metadata.timestamp || new Date().toISOString();
    
    const title = data.title || metadata.title || 'Untitled Conversation';
    const model = data.model || metadata.model || 'unknown';
    
    // Process messages
    let content = '';
    let messages = [];
    
    if (data.messages && Array.isArray(data.messages)) {
      // Handle standard message format
      messages = data.messages.map(msg => {
        const role = msg.role || 'unknown';
        const messageContent = typeof msg.content === 'string' 
          ? msg.content 
          : (msg.content?.parts?.join('\n') || '');
        
        content += `${role}: ${messageContent}\n\n`;
        
        return {
          role,
          content: messageContent,
          id: msg.id
        };
      });
    } else if (data.mapping && typeof data.mapping === 'object') {
      // Handle mapping format (older ChatGPT exports)
      const orderedIds = data.mapping_ordering || Object.keys(data.mapping);
      messages = orderedIds.map(msgId => {
        const msg = data.mapping[msgId];
        const role = msg.message?.author?.role || 'unknown';
        const messageContent = msg.message?.content?.parts?.join('\n') || '';
        
        content += `${role}: ${messageContent}\n\n`;
        
        return {
          role,
          content: messageContent,
          id: msgId
        };
      });
    }
    
    // Create processed conversation object
    const processedConversation = {
      id,
      source: 'shared-conversations',
      timestamp,
      model,
      title,
      messages,
      content: content.trim(),
      metadata: {
        ...metadata,
        shareUrl: data.share_url || metadata.shareUrl,
        updateTime: data.update_time 
          ? new Date(data.update_time * 1000).toISOString() 
          : undefined,
        parsedAt: new Date().toISOString()
      }
    };
    
    return processedConversation;
  }

  /**
   * Get parser statistics
   * @returns {Object} - Parsing statistics
   */
  getStats() {
    return {
      ...this.stats,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Reset parser statistics
   */
  resetStats() {
    this.stats = {
      parsedCount: 0,
      failedCount: 0,
      bySource: {}
    };
    
    // Reset supported sources stats
    this.supportedSources.forEach(source => {
      this.stats.bySource[source] = {
        parsedCount: 0,
        failedCount: 0
      };
    });
  }
}

module.exports = ConversationParser;