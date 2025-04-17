/**
 * WebSocket Client for Mysterion
 * 
 * Provides real-time communication with the Mysterion server
 */

import { LogEvent } from './real-time-monitor';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export type MessageHandler = (message: WebSocketMessage) => void;

/**
 * Interface for the WebSocket client
 */
export interface IWebSocketClient {
  connect(): Promise<void>;
  disconnect(): void;
  isConnected(): boolean;
  sendMessage(message: WebSocketMessage): void;
  sendLogEvent(event: {
    level: LogLevel;
    source: string;
    message: string;
    metadata?: Record<string, any>;
    stackTrace?: string;
  }): void;
  onMessage(type: string, handler: MessageHandler): void;
  offMessage(type: string, handler: MessageHandler): void;
}

/**
 * Implementation of the WebSocket client
 */
export class WebSocketClient implements IWebSocketClient {
  private socket: WebSocket | null = null;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  constructor(
    private url: string = '',
    private heartbeatIntervalMs: number = 30000
  ) {
    // Auto-generate WebSocket URL if not provided
    if (!this.url) {
      this.url = this.generateWebSocketUrl();
    }
  }
  
  /**
   * Generate WebSocket URL based on current location
   */
  private generateWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }
  
  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Ensure we're using the secure protocol if needed
        const socketUrl = this.ensureSecureUrl(this.url);
        
        this.socket = new WebSocket(socketUrl);
        
        // Setup event handlers
        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };
        
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        this.socket.onclose = (event) => {
          console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
          this.stopHeartbeat();
          
          // Attempt to reconnect if not explicitly closed by the application
          if (event.code !== 1000) {
            this.attemptReconnect();
          }
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Ensure the WebSocket URL uses the secure protocol if needed
   */
  private ensureSecureUrl(url: string): string {
    // If the page is loaded over HTTPS, ensure WebSocket uses WSS
    if (window.location.protocol === 'https:' && url.startsWith('ws:')) {
      return url.replace('ws:', 'wss:');
    }
    return url;
  }
  
  /**
   * Attempt to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnect failed:', error);
      });
    }, delay);
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.stopHeartbeat();
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
  }
  
  /**
   * Check if connected to the WebSocket server
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
  
  /**
   * Send a message to the WebSocket server
   */
  sendMessage(message: WebSocketMessage): void {
    if (!this.isConnected()) {
      console.error('Cannot send message: WebSocket not connected');
      return;
    }
    
    try {
      this.socket!.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }
  
  /**
   * Send a log event to the WebSocket server
   */
  sendLogEvent(event: {
    level: LogLevel;
    source: string;
    message: string;
    metadata?: Record<string, any>;
    stackTrace?: string;
  }): void {
    this.sendMessage({
      type: 'log',
      event: {
        timestamp: Date.now(),
        ...event
      }
    });
  }
  
  /**
   * Handle incoming messages
   */
  private handleMessage(message: WebSocketMessage): void {
    // Handle system messages
    switch (message.type) {
      case 'pong':
        // Heartbeat response, no action needed
        return;
        
      case 'welcome':
        console.log(`Connected to Mysterion: ${message.message}`);
        return;
        
      case 'error':
        console.error(`WebSocket error: ${message.message}`);
        return;
    }
    
    // Forward to message handlers
    const handlers = [
      ...(this.messageHandlers.get('*') || []),
      ...(this.messageHandlers.get(message.type) || [])
    ];
    
    for (const handler of handlers) {
      try {
        handler(message);
      } catch (error) {
        console.error(`Error in message handler for ${message.type}:`, error);
      }
    }
  }
  
  /**
   * Register a message handler
   */
  onMessage(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    
    this.messageHandlers.get(type)!.add(handler);
  }
  
  /**
   * Unregister a message handler
   */
  offMessage(type: string, handler: MessageHandler): void {
    if (this.messageHandlers.has(type)) {
      this.messageHandlers.get(type)!.delete(handler);
    }
  }
  
  /**
   * Start the heartbeat interval
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.sendMessage({ type: 'ping' });
      }
    }, this.heartbeatIntervalMs);
  }
  
  /**
   * Stop the heartbeat interval
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Create singleton instance
export const webSocketClient: IWebSocketClient = new WebSocketClient();
export default webSocketClient;