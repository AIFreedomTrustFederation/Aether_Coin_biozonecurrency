/**
 * WebSocket Handler
 * 
 * Manages WebSocket connections for real-time training updates
 * and conversation processing notifications
 */

const WebSocket = require('ws');

/**
 * WebSocket Handler Class
 * Handles WebSocket connections and real-time event broadcasting
 */
class WebSocketHandler {
  /**
   * Initialize the WebSocket handler
   * @param {Object} options - Configuration options
   * @param {Object} options.logger - Logger instance
   * @param {Object} options.server - HTTP server instance
   * @param {string} options.path - WebSocket endpoint path
   */
  constructor(options = {}) {
    this.logger = options.logger || console;
    this.server = options.server;
    this.path = options.path || '/ws';
    this.wss = null;
    this.clients = new Map();
    this.topics = new Map();
    
    this.logger.info('WebSocket Handler initialized');
  }

  /**
   * Initialize the WebSocket server
   */
  initialize() {
    if (this.wss) {
      this.logger.warn('WebSocket server already initialized');
      return;
    }
    
    this.logger.info(`Starting WebSocket server on path ${this.path}`);
    
    this.wss = new WebSocket.Server({ 
      server: this.server,
      path: this.path
    });
    
    // Set up connection handler
    this.wss.on('connection', this.handleConnection.bind(this));
    
    this.logger.info('WebSocket server started');
  }

  /**
   * Handle new WebSocket connections
   * @param {WebSocket} ws - WebSocket connection
   * @param {Object} req - HTTP request
   */
  handleConnection(ws, req) {
    const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    this.logger.debug(`New WebSocket connection: ${clientId}`);
    
    // Send welcome message
    this.sendToClient(ws, {
      type: 'welcome',
      message: 'Connected to Scroll Keeper WebSocket Server',
      clientId
    });
    
    // Store client information
    this.clients.set(clientId, {
      ws,
      clientId,
      ip: req.socket.remoteAddress,
      connectedAt: new Date().toISOString(),
      subscriptions: new Set(),
      metadata: {}
    });
    
    // Set up message handler
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(clientId, message);
      } catch (error) {
        this.logger.error(`Error handling WebSocket message: ${error.message}`);
        this.sendToClient(ws, {
          type: 'error',
          error: 'Invalid message format'
        });
      }
    });
    
    // Set up close handler
    ws.on('close', () => {
      this.logger.debug(`WebSocket connection closed: ${clientId}`);
      this.handleDisconnect(clientId);
    });
    
    // Set up error handler
    ws.on('error', (error) => {
      this.logger.error(`WebSocket error for ${clientId}: ${error.message}`);
    });
    
    // Broadcast connected client count
    this.broadcast('system', {
      type: 'status',
      connectedClients: this.clients.size
    });
    
    console.log("Client connected to WebSocket");
  }

  /**
   * Handle incoming WebSocket messages
   * @param {string} clientId - Client identifier
   * @param {Object} message - Parsed message object
   */
  handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    
    if (!client) {
      this.logger.warn(`Message from unknown client: ${clientId}`);
      return;
    }
    
    this.logger.debug(`Received message from ${clientId}: ${message.type}`);
    
    // Handle different message types
    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(clientId, message.topics);
        break;
        
      case 'unsubscribe':
        this.handleUnsubscribe(clientId, message.topics);
        break;
        
      case 'metadata':
        this.handleMetadataUpdate(clientId, message.metadata);
        break;
        
      case 'ping':
        this.sendToClient(client.ws, { type: 'pong', timestamp: Date.now() });
        break;
        
      case 'request':
        this.handleRequest(clientId, message);
        break;
        
      default:
        this.logger.warn(`Unknown message type from ${clientId}: ${message.type}`);
        this.sendToClient(client.ws, {
          type: 'error',
          error: `Unknown message type: ${message.type}`
        });
    }
  }

  /**
   * Handle client subscription requests
   * @param {string} clientId - Client identifier
   * @param {Array} topics - Topics to subscribe to
   */
  handleSubscribe(clientId, topics) {
    const client = this.clients.get(clientId);
    
    if (!client) {
      return;
    }
    
    if (!Array.isArray(topics)) {
      topics = [topics];
    }
    
    // Subscribe to each topic
    topics.forEach(topic => {
      // Add client to topic subscribers
      if (!this.topics.has(topic)) {
        this.topics.set(topic, new Set());
      }
      
      this.topics.get(topic).add(clientId);
      
      // Add topic to client subscriptions
      client.subscriptions.add(topic);
    });
    
    this.logger.debug(`Client ${clientId} subscribed to topics: ${topics.join(', ')}`);
    
    // Confirm subscription
    this.sendToClient(client.ws, {
      type: 'subscribed',
      topics: Array.from(client.subscriptions)
    });
  }

  /**
   * Handle client unsubscribe requests
   * @param {string} clientId - Client identifier
   * @param {Array} topics - Topics to unsubscribe from
   */
  handleUnsubscribe(clientId, topics) {
    const client = this.clients.get(clientId);
    
    if (!client) {
      return;
    }
    
    if (!Array.isArray(topics)) {
      topics = [topics];
    }
    
    // Unsubscribe from each topic
    topics.forEach(topic => {
      // Remove client from topic subscribers
      if (this.topics.has(topic)) {
        this.topics.get(topic).delete(clientId);
        
        // Clean up empty topics
        if (this.topics.get(topic).size === 0) {
          this.topics.delete(topic);
        }
      }
      
      // Remove topic from client subscriptions
      client.subscriptions.delete(topic);
    });
    
    this.logger.debug(`Client ${clientId} unsubscribed from topics: ${topics.join(', ')}`);
    
    // Confirm unsubscription
    this.sendToClient(client.ws, {
      type: 'unsubscribed',
      topics
    });
  }

  /**
   * Handle client metadata updates
   * @param {string} clientId - Client identifier
   * @param {Object} metadata - Client metadata
   */
  handleMetadataUpdate(clientId, metadata) {
    const client = this.clients.get(clientId);
    
    if (!client || !metadata || typeof metadata !== 'object') {
      return;
    }
    
    // Update client metadata
    client.metadata = {
      ...client.metadata,
      ...metadata
    };
    
    this.logger.debug(`Updated metadata for client ${clientId}`);
    
    // Confirm update
    this.sendToClient(client.ws, {
      type: 'metadata_updated',
      metadata: client.metadata
    });
  }

  /**
   * Handle specific client requests
   * @param {string} clientId - Client identifier
   * @param {Object} message - Request message
   */
  handleRequest(clientId, message) {
    const client = this.clients.get(clientId);
    
    if (!client) {
      return;
    }
    
    const requestType = message.request;
    const requestId = message.requestId || `req-${Date.now()}`;
    
    switch (requestType) {
      case 'training_status':
        // This would normally query training service for status
        this.sendToClient(client.ws, {
          type: 'response',
          requestId,
          data: {
            isTraining: false,
            status: 'idle',
            lastUpdated: new Date().toISOString()
          }
        });
        break;
        
      case 'conversation_count':
        // This would normally query storage service for counts
        this.sendToClient(client.ws, {
          type: 'response',
          requestId,
          data: {
            count: 0,
            lastUpdated: new Date().toISOString()
          }
        });
        break;
        
      default:
        this.sendToClient(client.ws, {
          type: 'error',
          requestId,
          error: `Unknown request type: ${requestType}`
        });
    }
  }

  /**
   * Handle client disconnection
   * @param {string} clientId - Client identifier
   */
  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    
    if (!client) {
      return;
    }
    
    // Remove client from all subscribed topics
    if (client.subscriptions.size > 0) {
      client.subscriptions.forEach(topic => {
        if (this.topics.has(topic)) {
          this.topics.get(topic).delete(clientId);
          
          // Clean up empty topics
          if (this.topics.get(topic).size === 0) {
            this.topics.delete(topic);
          }
        }
      });
    }
    
    // Remove client from clients map
    this.clients.delete(clientId);
    
    // Broadcast connected client count
    this.broadcast('system', {
      type: 'status',
      connectedClients: this.clients.size
    });
  }

  /**
   * Send a message to a specific client
   * @param {WebSocket} ws - WebSocket connection
   * @param {Object} message - Message to send
   */
  sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
      } catch (error) {
        this.logger.error(`Error sending message: ${error.message}`);
      }
    }
  }

  /**
   * Broadcast a message to all subscribed clients
   * @param {string} topic - Topic to broadcast to
   * @param {Object} message - Message to broadcast
   */
  broadcast(topic, message) {
    if (!this.topics.has(topic)) {
      return;
    }
    
    this.logger.debug(`Broadcasting to topic ${topic} (${this.topics.get(topic).size} subscribers)`);
    
    // Include topic in message
    const completeMessage = {
      ...message,
      topic
    };
    
    // Send to all subscribers
    this.topics.get(topic).forEach(clientId => {
      const client = this.clients.get(clientId);
      
      if (client && client.ws.readyState === WebSocket.OPEN) {
        try {
          client.ws.send(JSON.stringify(completeMessage));
        } catch (error) {
          this.logger.error(`Error broadcasting to ${clientId}: ${error.message}`);
        }
      }
    });
  }

  /**
   * Broadcast training updates to subscribed clients
   * @param {Object} update - Training update data
   */
  broadcastTrainingUpdate(update) {
    this.broadcast('training', {
      type: 'training_update',
      data: update,
      timestamp: Date.now()
    });
  }

  /**
   * Broadcast conversation processing updates
   * @param {Object} update - Conversation processing update
   */
  broadcastConversationUpdate(update) {
    this.broadcast('conversations', {
      type: 'conversation_update',
      data: update,
      timestamp: Date.now()
    });
  }

  /**
   * Get all connected clients
   * @returns {Array} - Array of client information
   */
  getClients() {
    return Array.from(this.clients.values()).map(client => ({
      clientId: client.clientId,
      connectedAt: client.connectedAt,
      subscriptions: Array.from(client.subscriptions),
      metadata: client.metadata
    }));
  }

  /**
   * Close all connections and shut down the server
   */
  shutdown() {
    this.logger.info('Shutting down WebSocket server');
    
    // Close all connections
    this.clients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.close(1000, 'Server shutting down');
      }
    });
    
    // Clear maps
    this.clients.clear();
    this.topics.clear();
    
    // Close server
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
    
    this.logger.info('WebSocket server shut down');
  }
}

module.exports = WebSocketHandler;