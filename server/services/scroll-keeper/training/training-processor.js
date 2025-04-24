/**
 * Training Data Processor
 * 
 * Processes parsed conversations into formats suitable for LLM training
 * Supports integration with Langs billion-parameter models
 */

/**
 * Training Data Processor Class
 * Converts parsed conversations into training datasets
 */
class TrainingProcessor {
  /**
   * Initialize the training data processor
   * @param {Object} options - Configuration options
   * @param {Object} options.logger - Logger instance
   * @param {Object} options.storage - Storage service for training data
   * @param {Object} options.config - Training configuration options
   */
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.storage = options.storage;
    this.config = options.config || {};
    this.logger.info('Training Data Processor initialized');
    
    // Default training format config
    this.defaultConfig = {
      contextWindowSize: 4096,
      includeRoles: true,
      includeTimestamps: false,
      formatType: 'chat',
      tokenizationMethod: 'gpt2', // Default tokenizer
      validationSplit: 0.1,
      augmentation: false,
      deduplicate: true,
      minConversationLength: 2,
      maxExamplesPerConversation: 10,
      promptTemplate: '### Instruction:\n{instruction}\n\n### Response:\n'
    };
    
    // Merge default config with provided config
    this.config = { ...this.defaultConfig, ...this.config };
    
    // Initialize counters
    this.stats = {
      conversationsProcessed: 0,
      examplesGenerated: 0,
      tokensProcessed: 0,
      bytesProcessed: 0
    };
  }

  /**
   * Process a batch of conversations into training data
   * @param {Array} conversations - Array of parsed conversations
   * @param {Object} options - Processing options
   * @returns {Object} - Processed training data
   */
  async processConversations(conversations, options = {}) {
    const startTime = Date.now();
    this.logger.info(`Processing ${conversations.length} conversations into training data`);
    
    // Merge options with config
    const config = { ...this.config, ...options };
    
    // Validate conversations
    const validConversations = this.validateConversations(conversations, config);
    this.logger.debug(`${validConversations.length} valid conversations after filtering`);
    
    // Convert to training format
    const trainingData = await this.convertToTrainingFormat(validConversations, config);
    
    // Update stats
    this.stats.conversationsProcessed += validConversations.length;
    this.stats.examplesGenerated += trainingData.examples.length;
    this.stats.tokensProcessed += trainingData.stats.totalTokens;
    this.stats.bytesProcessed += trainingData.stats.totalBytes;
    
    // Save to storage if available
    if (this.storage) {
      await this.storage.storeTrainingData(trainingData);
    }
    
    const elapsedMs = Date.now() - startTime;
    this.logger.info(`Training data processing complete (${elapsedMs}ms)`, {
      examples: trainingData.examples.length,
      tokens: trainingData.stats.totalTokens,
      bytes: trainingData.stats.totalBytes
    });
    
    return trainingData;
  }

  /**
   * Validate and filter conversations for training
   * @param {Array} conversations - Array of parsed conversations
   * @param {Object} config - Processing configuration
   * @returns {Array} - Filtered valid conversations
   */
  validateConversations(conversations, config) {
    return conversations.filter(conv => {
      // Must have messages array
      if (!conv.messages || !Array.isArray(conv.messages) || conv.messages.length === 0) {
        return false;
      }
      
      // Minimum conversation length
      if (conv.messages.length < config.minConversationLength) {
        return false;
      }
      
      // Check for valid content
      const hasValidContent = conv.messages.every(msg => 
        msg.content && typeof msg.content === 'string' && msg.content.trim().length > 0
      );
      
      if (!hasValidContent) {
        return false;
      }
      
      // Check for required message roles if includeRoles is true
      if (config.includeRoles) {
        const hasRequiredRoles = conv.messages.every(msg => 
          msg.role && typeof msg.role === 'string' && msg.role.trim().length > 0
        );
        
        if (!hasRequiredRoles) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Convert conversations to training format
   * @param {Array} conversations - Array of validated conversations
   * @param {Object} config - Processing configuration
   * @returns {Object} - Processed training data
   */
  async convertToTrainingFormat(conversations, config) {
    // Training examples container
    const examples = [];
    
    // Stats for processing
    const stats = {
      totalTokens: 0,
      totalBytes: 0,
      byConversation: {}
    };
    
    // Process each conversation
    for (const conversation of conversations) {
      const conversationId = conversation.id;
      const conversationExamples = [];
      
      // Get training examples from this conversation
      const convExamples = this.extractTrainingExamples(conversation, config);
      conversationExamples.push(...convExamples);
      
      // Limit examples per conversation if needed
      const limitedExamples = config.maxExamplesPerConversation > 0 
        ? conversationExamples.slice(0, config.maxExamplesPerConversation)
        : conversationExamples;
        
      // Add to main examples array
      examples.push(...limitedExamples);
      
      // Update stats
      stats.byConversation[conversationId] = {
        exampleCount: limitedExamples.length,
        tokens: limitedExamples.reduce((total, ex) => total + (ex.tokenCount || 0), 0),
        bytes: limitedExamples.reduce((total, ex) => total + (ex.byteLength || 0), 0)
      };
      
      stats.totalTokens += stats.byConversation[conversationId].tokens;
      stats.totalBytes += stats.byConversation[conversationId].bytes;
    }
    
    // Calculate validation/training split if needed
    let validationSet = [];
    let trainingSet = examples;
    
    if (config.validationSplit > 0 && examples.length > 10) {
      const validationCount = Math.max(1, Math.floor(examples.length * config.validationSplit));
      
      // Shuffle and split
      const shuffled = [...examples].sort(() => 0.5 - Math.random());
      validationSet = shuffled.slice(0, validationCount);
      trainingSet = shuffled.slice(validationCount);
    }
    
    return {
      format: config.formatType,
      config,
      examples: trainingSet,
      validation: validationSet,
      stats,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Extract training examples from a single conversation
   * @param {Object} conversation - Parsed conversation
   * @param {Object} config - Processing configuration
   * @returns {Array} - Array of training examples
   */
  extractTrainingExamples(conversation, config) {
    const examples = [];
    const messages = conversation.messages;
    const formatType = config.formatType;
    
    // Different extraction strategies based on format type
    switch (formatType) {
      case 'chat':
        // For chat format, extract prompt-response pairs
        for (let i = 0; i < messages.length - 1; i++) {
          // Skip assistant-assistant or user-user pairs
          if ((messages[i].role === 'assistant' && messages[i+1].role === 'assistant') ||
              (messages[i].role === 'user' && messages[i+1].role === 'user')) {
            continue;
          }
          
          // Extract based on the role pattern
          const example = this.formatChatExample(messages[i], messages[i+1], conversation, config);
          examples.push(example);
        }
        break;
        
      case 'completion':
        // For completion format, use entire conversation as context and extract completions
        for (let i = 2; i < messages.length; i++) {
          if (messages[i].role === 'assistant') {
            // Use all previous messages as context
            const contextMessages = messages.slice(0, i);
            const completionMessage = messages[i];
            
            const example = this.formatCompletionExample(contextMessages, completionMessage, conversation, config);
            examples.push(example);
          }
        }
        break;
        
      case 'instruction':
        // For instruction format, extract user-assistant pairs as instruction-response
        for (let i = 0; i < messages.length - 1; i++) {
          if (messages[i].role === 'user' && messages[i+1].role === 'assistant') {
            const example = this.formatInstructionExample(messages[i], messages[i+1], conversation, config);
            examples.push(example);
          }
        }
        break;
        
      default:
        this.logger.warn(`Unknown format type: ${formatType}, falling back to chat format`);
        return this.extractTrainingExamples(conversation, { ...config, formatType: 'chat' });
    }
    
    return examples;
  }

  /**
   * Format a chat example for training
   * @param {Object} promptMessage - The prompt message
   * @param {Object} responseMessage - The response message
   * @param {Object} conversation - Full conversation data
   * @param {Object} config - Processing configuration
   * @returns {Object} - Formatted training example
   */
  formatChatExample(promptMessage, responseMessage, conversation, config) {
    // Format the prompt message
    let promptText = promptMessage.content;
    if (config.includeRoles) {
      promptText = `${promptMessage.role}: ${promptText}`;
    }
    
    // Format the response message
    let responseText = responseMessage.content;
    if (config.includeRoles) {
      responseText = `${responseMessage.role}: ${responseText}`;
    }
    
    // Calculate approximate token counts
    const promptTokens = this.estimateTokenCount(promptText);
    const responseTokens = this.estimateTokenCount(responseText);
    
    // Combine into a training example
    const example = {
      id: `${conversation.id}-${promptMessage.id || promptMessage.index || 0}-${responseMessage.id || responseMessage.index || 0}`,
      prompt: promptText,
      response: responseText,
      tokenCount: promptTokens + responseTokens,
      byteLength: Buffer.byteLength(promptText, 'utf8') + Buffer.byteLength(responseText, 'utf8'),
      metadata: {
        source: conversation.source,
        model: conversation.model,
        timestamp: conversation.timestamp,
        promptRole: promptMessage.role,
        responseRole: responseMessage.role
      }
    };
    
    return example;
  }

  /**
   * Format a completion example for training
   * @param {Array} contextMessages - Context messages
   * @param {Object} completionMessage - The completion message
   * @param {Object} conversation - Full conversation data
   * @param {Object} config - Processing configuration
   * @returns {Object} - Formatted training example
   */
  formatCompletionExample(contextMessages, completionMessage, conversation, config) {
    // Format the context
    let contextText = '';
    for (const msg of contextMessages) {
      let messageText = msg.content;
      if (config.includeRoles) {
        messageText = `${msg.role}: ${messageText}`;
      }
      contextText += messageText + '\n\n';
    }
    contextText = contextText.trim();
    
    // Format the completion
    const completionText = completionMessage.content;
    
    // Calculate approximate token counts
    const contextTokens = this.estimateTokenCount(contextText);
    const completionTokens = this.estimateTokenCount(completionText);
    
    // Check if the context is too long
    if (contextTokens > config.contextWindowSize * 0.8) {
      // Truncate context to fit within 80% of context window
      // This is a simplistic approach - a real tokenizer would be more accurate
      const maxContextChars = Math.floor(config.contextWindowSize * 0.8 * 4); // Rough char estimate
      contextText = contextText.substring(contextText.length - maxContextChars);
    }
    
    // Combine into a training example
    const example = {
      id: `${conversation.id}-completion-${completionMessage.id || completionMessage.index || 0}`,
      context: contextText,
      completion: completionText,
      tokenCount: contextTokens + completionTokens,
      byteLength: Buffer.byteLength(contextText, 'utf8') + Buffer.byteLength(completionText, 'utf8'),
      metadata: {
        source: conversation.source,
        model: conversation.model,
        timestamp: conversation.timestamp,
        contextMessageCount: contextMessages.length
      }
    };
    
    return example;
  }

  /**
   * Format an instruction example for training
   * @param {Object} instructionMessage - The instruction message
   * @param {Object} responseMessage - The response message
   * @param {Object} conversation - Full conversation data
   * @param {Object} config - Processing configuration
   * @returns {Object} - Formatted training example
   */
  formatInstructionExample(instructionMessage, responseMessage, conversation, config) {
    // Use the instruction template from config
    const instructionText = instructionMessage.content;
    const responseText = responseMessage.content;
    
    // Apply prompt template
    let formattedExample = config.promptTemplate
      .replace('{instruction}', instructionText)
      .replace('{response}', ''); // Empty response for the prompt
    
    // Calculate approximate token counts
    const instructionTokens = this.estimateTokenCount(formattedExample);
    const responseTokens = this.estimateTokenCount(responseText);
    
    // Combine into a training example
    const example = {
      id: `${conversation.id}-instruction-${instructionMessage.id || instructionMessage.index || 0}`,
      instruction: instructionText,
      response: responseText,
      formatted: formattedExample,
      tokenCount: instructionTokens + responseTokens,
      byteLength: Buffer.byteLength(instructionText, 'utf8') + Buffer.byteLength(responseText, 'utf8'),
      metadata: {
        source: conversation.source,
        model: conversation.model,
        timestamp: conversation.timestamp
      }
    };
    
    return example;
  }

  /**
   * Estimate token count for a text string
   * Simple estimation for GPT-style tokenizers
   * @param {string} text - Text to estimate tokens for
   * @returns {number} - Estimated token count
   */
  estimateTokenCount(text) {
    // This is a very rough estimation
    // In production, we would use a proper tokenizer like tiktoken or GPT-2 tokenizer
    if (!text) return 0;
    return Math.ceil(text.split(/\s+/).length * 1.5);
  }

  /**
   * Get processor statistics
   * @returns {Object} - Processing statistics
   */
  getStats() {
    return {
      ...this.stats,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Reset processor statistics
   */
  resetStats() {
    this.stats = {
      conversationsProcessed: 0,
      examplesGenerated: 0,
      tokensProcessed: 0,
      bytesProcessed: 0
    };
  }
}

module.exports = TrainingProcessor;