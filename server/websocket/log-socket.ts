/**
 * Log WebSocket Server
 * 
 * Provides real-time streaming of logs and events to Mysterion
 * for monitoring and automated response
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { v4 as uuidv4 } from 'uuid';

export interface LogWebSocketOptions {
  path: string;
  authenticateClient?: (request: any) => Promise<boolean>;
  maxClients?: number;
  pingInterval?: number; // milliseconds
}

interface WebSocketClient {
  id: string;
  socket: WebSocket;
  isAlive: boolean;
  authenticated: boolean;
  subscriptions: Set<string>;
  lastActivity: number;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogEvent {
  id: string;
  timestamp: number;
  level: LogLevel;
  source: string;
  message: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
}

/**
 * WebSocket server for streaming logs
 */
export class LogWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private options: LogWebSocketOptions;
  private eventBuffer: LogEvent[] = [];
  private maxBufferSize: number = 1000;

  constructor(server: Server, options: LogWebSocketOptions) {
    this.options = {
      maxClients: 50,
      pingInterval: 30000, // 30 seconds
      ...options
    };

    this.wss = new WebSocketServer({ 
      server,
      path: options.path
    });

    this.initialize();
  }

  /**
   * Initialize the WebSocket server
   */
  private initialize(): void {
    // Handle connections
    this.wss.on('connection', (socket, request) => this.handleConnection(socket, request));

    // Set up ping interval
    if (this.options.pingInterval) {
      this.pingInterval = setInterval(() => this.ping(), this.options.pingInterval);
    }

    console.log(`Log WebSocket server initialized on path: ${this.options.path}`);
  }

  /**
   * Handle new WebSocket connections
   */
  private async handleConnection(socket: WebSocket, request: any): Promise<void> {
    // Check if max clients reached
    if (this.options.maxClients && this.clients.size >= this.options.maxClients) {
      socket.close(1013, 'Maximum number of clients reached');
      return;
    }

    // Create client
    const clientId = uuidv4();
    const client: WebSocketClient = {
      id: clientId,
      socket,
      isAlive: true,
      authenticated: false,
      subscriptions: new Set(['all']), // Default subscription
      lastActivity: Date.now()
    };

    // Add client
    this.clients.set(clientId, client);

    // Set up event handlers
    socket.on('message', async (message: WebSocket.Data) => {
      try {
        const data = JSON.parse(message.toString());
        await this.handleMessage(client, data);
      } catch (error) {
        this.sendError(client, 'Invalid message format');
      }
    });

    socket.on('close', () => {
      this.clients.delete(clientId);
      console.log(`Client ${clientId} disconnected. Connected clients: ${this.clients.size}`);
    });

    socket.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.clients.delete(clientId);
    });

    socket.on('pong', () => {
      client.isAlive = true;
    });

    // Authenticate client if needed
    let authenticated = true;
    if (this.options.authenticateClient) {
      authenticated = await this.options.authenticateClient(request);
    }

    if (!authenticated) {
      socket.close(1008, 'Authentication failed');
      this.clients.delete(clientId);
      return;
    }

    client.authenticated = authenticated;

    // Welcome message
    this.send(client, {
      type: 'welcome',
      clientId,
      message: 'Connected to Mysterion Log WebSocket',
      timestamp: Date.now()
    });

    // Send recent events from buffer
    if (this.eventBuffer.length > 0) {
      this.send(client, {
        type: 'buffer',
        events: this.eventBuffer,
        timestamp: Date.now()
      });
    }

    console.log(`Client ${clientId} connected. Connected clients: ${this.clients.size}`);
  }

  /**
   * Handle incoming messages from clients
   */
  private async handleMessage(client: WebSocketClient, data: any): Promise<void> {
    client.lastActivity = Date.now();

    switch (data.type) {
      case 'subscribe':
        this.handleSubscribe(client, data);
        break;
      
      case 'unsubscribe':
        this.handleUnsubscribe(client, data);
        break;
      
      case 'ping':
        this.handlePing(client);
        break;
      
      case 'log':
        await this.handleClientLog(client, data);
        break;
      
      default:
        this.sendError(client, `Unknown message type: ${data.type}`);
    }
  }

  /**
   * Handle subscription requests
   */
  private handleSubscribe(client: WebSocketClient, data: any): void {
    if (!data.channels || !Array.isArray(data.channels)) {
      this.sendError(client, 'Invalid channels format');
      return;
    }

    for (const channel of data.channels) {
      client.subscriptions.add(channel);
    }

    this.send(client, {
      type: 'subscription-update',
      subscriptions: Array.from(client.subscriptions),
      timestamp: Date.now()
    });
  }

  /**
   * Handle unsubscription requests
   */
  private handleUnsubscribe(client: WebSocketClient, data: any): void {
    if (!data.channels || !Array.isArray(data.channels)) {
      this.sendError(client, 'Invalid channels format');
      return;
    }

    for (const channel of data.channels) {
      if (channel !== 'all') { // Keep 'all' subscription
        client.subscriptions.delete(channel);
      }
    }

    this.send(client, {
      type: 'subscription-update',
      subscriptions: Array.from(client.subscriptions),
      timestamp: Date.now()
    });
  }

  /**
   * Handle ping requests
   */
  private handlePing(client: WebSocketClient): void {
    this.send(client, {
      type: 'pong',
      timestamp: Date.now()
    });
  }

  /**
   * Handle log messages from clients
   */
  private async handleClientLog(client: WebSocketClient, data: any): Promise<void> {
    if (!data.event || typeof data.event !== 'object') {
      this.sendError(client, 'Invalid log event format');
      return;
    }

    // Create a proper log event
    const logEvent: LogEvent = {
      id: uuidv4(),
      timestamp: data.event.timestamp || Date.now(),
      level: data.event.level || 'info',
      source: data.event.source || `client-${client.id}`,
      message: data.event.message || '',
      metadata: data.event.metadata,
      stackTrace: data.event.stackTrace
    };

    // Broadcast to other clients
    this.broadcastEvent(logEvent, client.id);

    // Add to buffer
    this.addToEventBuffer(logEvent);
  }

  /**
   * Send a message to a client
   */
  private send(client: WebSocketClient, data: any): void {
    if (client.socket.readyState === WebSocket.OPEN) {
      try {
        client.socket.send(JSON.stringify(data));
      } catch (error) {
        console.error(`Error sending message to client ${client.id}:`, error);
      }
    }
  }

  /**
   * Send an error message to a client
   */
  private sendError(client: WebSocketClient, message: string): void {
    this.send(client, {
      type: 'error',
      message,
      timestamp: Date.now()
    });
  }

  /**
   * Ping all clients to check if they're still alive
   */
  private ping(): void {
    for (const [id, client] of this.clients) {
      if (!client.isAlive) {
        client.socket.terminate();
        this.clients.delete(id);
        console.log(`Terminated inactive client ${id}`);
        continue;
      }

      client.isAlive = false;
      client.socket.ping();
    }
  }

  /**
   * Broadcast a log event to all subscribed clients
   */
  public broadcastEvent(event: LogEvent, excludeClientId?: string): void {
    // Add event type for WebSocket message
    const message = {
      type: 'log',
      event,
      timestamp: Date.now()
    };

    const channel = `level:${event.level}`;
    const sourceChannel = `source:${event.source}`;

    for (const [id, client] of this.clients) {
      // Skip excluded client
      if (excludeClientId && id === excludeClientId) {
        continue;
      }

      // Check if client is subscribed
      if (
        client.subscriptions.has('all') ||
        client.subscriptions.has(channel) ||
        client.subscriptions.has(sourceChannel)
      ) {
        this.send(client, message);
      }
    }

    // Add to buffer
    this.addToEventBuffer(event);
  }

  /**
   * Add an event to the buffer
   */
  private addToEventBuffer(event: LogEvent): void {
    this.eventBuffer.push(event);
    
    // Trim buffer if needed
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer = this.eventBuffer.slice(-this.maxBufferSize);
    }
  }

  /**
   * Get the number of connected clients
   */
  public getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Close the WebSocket server
   */
  public close(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    this.wss.close();
    console.log('Log WebSocket server closed');
  }
}

export default LogWebSocketServer;