/**
 * Log WebSocket Server
 * 
 * Provides a websocket server for real-time log collection from both
 * server and client components. Implements secure connections, protocol
 * validation, and message filtering.
 */

import { WebSocketServer } from 'ws';
import type { WebSocket, ServerOptions } from 'ws';
import http from 'http';
import crypto from 'crypto';

// WebSocket client representation for the server to track
interface WebSocketClient {
  id: string;
  socket: WebSocket;
  ip: string;
  userAgent: string;
  connectedAt: number;
  lastActivity: number;
  messageCount: number;
  authenticated: boolean;
}

// Log event structure
export interface LogEvent {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  source: string;
  message: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
}

/**
 * Options for configuring the Log WebSocket Server
 */
export interface LogSocketOptions extends ServerOptions {
  // Maximum number of messages per client per minute
  messageRateLimit?: number;
  
  // Maximum message size in bytes
  maxMessageSize?: number;
  
  // Heartbeat interval in milliseconds
  heartbeatInterval?: number;
  
  // Maximum clients allowed to connect
  maxClients?: number;
  
  // Enable/disable TLS verification (always true in production)
  requireTls?: boolean;
}

/**
 * WebSocket server implementation for log collection
 */
class LogWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private requestListeners: Map<string, Set<(event: LogEvent) => void>> = new Map();
  private options: LogSocketOptions;
  private intervalId: NodeJS.Timeout | null = null;
  
  /**
   * Default configuration
   */
  private readonly defaultOptions: LogSocketOptions = {
    messageRateLimit: 120, // 2 messages per second
    maxMessageSize: 1024 * 50, // 50 KB
    heartbeatInterval: 30000, // 30 seconds
    maxClients: 100,
    requireTls: process.env.NODE_ENV === 'production'
  };
  
  /**
   * Create new LogWebSocketServer
   */
  constructor(server: http.Server, options: LogSocketOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
    
    // Create WebSocket server
    this.wss = new WebSocketServer({
      server,
      path: options.path || '/ws/logs',
      ...options
    });
    
    // Setup connection handler
    this.wss.on('connection', this.handleConnection.bind(this));
    
    // Start heartbeat to keep connections alive and detect stale connections
    this.startHeartbeat();
    
    console.log(`Log WebSocket server initialized on path: ${options.path || '/ws/logs'}`);
  }
  
  /**
   * Handle new WebSocket connection
   */
  private handleConnection(socket: WebSocket, request: http.IncomingMessage): void {
    // Check if we're at max capacity
    if (this.clients.size >= this.options.maxClients!) {
      console.warn('Maximum client connections reached, rejecting new connection');
      socket.close(1013, 'Maximum number of connections reached');
      return;
    }
    
    // Generate a unique client ID
    const clientId = crypto.randomUUID();
    
    // Store client information
    const client: WebSocketClient = {
      id: clientId,
      socket,
      ip: request.socket.remoteAddress || 'unknown',
      userAgent: request.headers['user-agent'] || 'unknown',
      connectedAt: Date.now(),
      lastActivity: Date.now(),
      messageCount: 0,
      authenticated: false
    };
    
    this.clients.set(clientId, client);
    
    console.log(`[LogSocket] Client connected: ${clientId} from ${client.ip}`);
    
    // Send welcome message
    socket.send(JSON.stringify({
      type: 'welcome',
      clientId,
      timestamp: Date.now(),
      message: 'Connected to Mysterion log collection service'
    }));
    
    // Setup message handler
    socket.on('message', (data: Buffer) => {
      // Update activity timestamp
      client.lastActivity = Date.now();
      
      // Check rate limiting
      client.messageCount++;
      const messageRate = client.messageCount / ((Date.now() - client.connectedAt) / 60000);
      if (messageRate > this.options.messageRateLimit!) {
        console.warn(`[LogSocket] Rate limit exceeded for client ${clientId}`);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Rate limit exceeded',
          timestamp: Date.now()
        }));
        return;
      }
      
      // Check message size
      if (data.length > this.options.maxMessageSize!) {
        console.warn(`[LogSocket] Message size limit exceeded for client ${clientId}`);
        socket.send(JSON.stringify({
          type: 'error',
          message: 'Message size limit exceeded',
          timestamp: Date.now()
        }));
        return;
      }
      
      // Process the message
      try {
        this.handleMessage(clientId, data.toString());
      } catch (error) {
        console.error(`[LogSocket] Error handling message: ${error}`);
      }
    });
    
    // Handle disconnection
    socket.on('close', (code, reason) => {
      console.log(`[LogSocket] Client disconnected: ${clientId} - Code: ${code} Reason: ${reason || 'none'}`);
      this.clients.delete(clientId);
    });
    
    // Handle errors
    socket.on('error', (error) => {
      console.error(`[LogSocket] Client error for ${clientId}:`, error);
    });
  }
  
  /**
   * Handle incoming message from client
   */
  private handleMessage(clientId: string, rawMessage: string): void {
    let message: any;
    
    try {
      message = JSON.parse(rawMessage);
    } catch (error) {
      console.error(`[LogSocket] Invalid JSON from client ${clientId}:`, error);
      const client = this.clients.get(clientId);
      if (client && client.socket.readyState === 1) { // 1 corresponds to WebSocket.OPEN
        client.socket.send(JSON.stringify({
          type: 'error',
          message: 'Invalid JSON',
          timestamp: Date.now()
        }));
      }
      return;
    }
    
    // Process by message type
    switch (message.type) {
      case 'ping':
        this.handlePing(clientId);
        break;
        
      case 'authenticate':
        this.handleAuthentication(clientId, message);
        break;
        
      case 'log':
        this.handleLogEvent(clientId, message);
        break;
        
      default:
        console.warn(`[LogSocket] Unknown message type from client ${clientId}: ${message.type}`);
        const client = this.clients.get(clientId);
        if (client && client.socket.readyState === 1) { // 1 corresponds to WebSocket.OPEN
          client.socket.send(JSON.stringify({
            type: 'error',
            message: `Unknown message type: ${message.type}`,
            timestamp: Date.now()
          }));
        }
    }
  }
  
  /**
   * Handle ping message (heartbeat)
   */
  private handlePing(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client && client.socket.readyState === 1) { // 1 corresponds to WebSocket.OPEN
      client.socket.send(JSON.stringify({
        type: 'pong',
        timestamp: Date.now()
      }));
    }
  }
  
  /**
   * Handle authentication request
   * In a real implementation, this would validate JWT tokens or API keys
   */
  private handleAuthentication(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    // For the prototype, just mark as authenticated
    // In production, validate credentials here
    client.authenticated = true;
    
    if (client.socket.readyState === 1) { // 1 corresponds to WebSocket.OPEN
      client.socket.send(JSON.stringify({
        type: 'authentication_result',
        success: true,
        timestamp: Date.now()
      }));
    }
  }
  
  /**
   * Handle log event from client
   */
  private handleLogEvent(clientId: string, message: any): void {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    // Basic validation
    if (!message.event || !message.event.level || !message.event.message) {
      if (client.socket.readyState === 1) { // 1 corresponds to WebSocket.OPEN
        client.socket.send(JSON.stringify({
          type: 'error',
          message: 'Invalid log event format',
          timestamp: Date.now()
        }));
      }
      return;
    }
    
    // Process log event
    const logEvent: LogEvent = {
      timestamp: message.event.timestamp || Date.now(),
      level: message.event.level,
      source: message.event.source || 'client',
      message: message.event.message,
      metadata: message.event.metadata,
      stackTrace: message.event.stackTrace
    };
    
    // Add client information to metadata
    if (!logEvent.metadata) {
      logEvent.metadata = {};
    }
    
    logEvent.metadata.clientId = clientId;
    logEvent.metadata.ip = client.ip;
    logEvent.metadata.userAgent = client.userAgent;
    
    // Process the log event (e.g., store, forward, analyze)
    this.processLogEvent(logEvent);
    
    // Send acknowledgment
    if (client.socket.readyState === 1) { // 1 corresponds to WebSocket.OPEN
      client.socket.send(JSON.stringify({
        type: 'log_received',
        timestamp: Date.now()
      }));
    }
  }
  
  /**
   * Process a log event
   */
  private processLogEvent(event: LogEvent): void {
    // Log to console for debugging/monitoring
    const logPrefix = `[${new Date(event.timestamp).toISOString()}] [${event.level.toUpperCase()}] [${event.source}]`;
    
    switch (event.level) {
      case 'debug':
        console.debug(`${logPrefix} ${event.message}`);
        break;
      case 'info':
        console.info(`${logPrefix} ${event.message}`);
        break;
      case 'warn':
        console.warn(`${logPrefix} ${event.message}`);
        break;
      case 'error':
      case 'critical':
        console.error(`${logPrefix} ${event.message}`);
        if (event.stackTrace) {
          console.error(event.stackTrace);
        }
        break;
    }
    
    // Notify listeners for all log events
    this.notifyListeners('*', event);
    
    // Notify level-specific listeners
    this.notifyListeners(event.level, event);
    
    // Notify source-specific listeners
    this.notifyListeners(`source:${event.source}`, event);
    
    // For critical errors, notify all connected clients for real-time monitoring
    if (event.level === 'critical') {
      this.broadcastToClients({
        type: 'critical_error',
        event: {
          timestamp: event.timestamp,
          source: event.source,
          message: event.message
        }
      });
    }
  }
  
  /**
   * Notify registered listeners of an event
   */
  private notifyListeners(eventType: string, event: LogEvent): void {
    const listeners = this.requestListeners.get(eventType);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error(`[LogSocket] Error in event listener for ${eventType}:`, error);
        }
      }
    }
  }
  
  /**
   * Broadcast a message to all connected clients
   */
  private broadcastToClients(message: any): void {
    const serializedMessage = JSON.stringify(message);
    
    for (const [_, client] of this.clients) {
      if (client.socket.readyState === 1) { // 1 corresponds to WebSocket.OPEN
        client.socket.send(serializedMessage);
      }
    }
  }
  
  /**
   * Send a message to a specific client
   */
  public sendToClient(clientId: string, message: any): boolean {
    const client = this.clients.get(clientId);
    if (client && client.socket.readyState === 1) { // 1 corresponds to WebSocket.OPEN
      client.socket.send(JSON.stringify(message));
      return true;
    }
    return false;
  }
  
  /**
   * Add an event listener
   */
  public addEventListener(eventType: string, listener: (event: LogEvent) => void): void {
    if (!this.requestListeners.has(eventType)) {
      this.requestListeners.set(eventType, new Set());
    }
    
    this.requestListeners.get(eventType)!.add(listener);
  }
  
  /**
   * Remove an event listener
   */
  public removeEventListener(eventType: string, listener: (event: LogEvent) => void): void {
    const listeners = this.requestListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }
  
  /**
   * Start heartbeat interval to keep connections alive and detect stale connections
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.intervalId = setInterval(() => {
      const now = Date.now();
      
      // Check for stale connections
      for (const [clientId, client] of this.clients) {
        // If client hasn't sent a message in 2x heartbeat interval, consider it stale
        if (now - client.lastActivity > this.options.heartbeatInterval! * 2) {
          console.log(`[LogSocket] Closing stale connection: ${clientId}`);
          client.socket.close(1000, 'Connection stale');
          this.clients.delete(clientId);
          continue;
        }
        
        // Send heartbeat ping
        if (client.socket.readyState === 1) { // 1 corresponds to WebSocket.OPEN
          client.socket.send(JSON.stringify({
            type: 'heartbeat',
            timestamp: now
          }));
        }
      }
    }, this.options.heartbeatInterval);
  }
  
  /**
   * Stop the heartbeat interval
   */
  private stopHeartbeat(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  /**
   * Close the WebSocket server
   */
  public close(): Promise<void> {
    this.stopHeartbeat();
    
    // Close all connections
    for (const [clientId, client] of this.clients) {
      client.socket.close(1001, 'Server shutting down');
    }
    
    this.clients.clear();
    
    // Close the server
    return new Promise((resolve, reject) => {
      this.wss.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export default LogWebSocketServer;