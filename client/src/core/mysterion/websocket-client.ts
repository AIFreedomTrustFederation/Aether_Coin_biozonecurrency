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
        
        console.log(`Attempting to connect to WebSocket at: ${socketUrl}`);
        
        // Use HTTP connection in development for easier testing
        // In production environment, this should always use WSS
        if (process.env.NODE_ENV === 'development') {
          // For development, try to connect even if there's a protocol mismatch
          this.socket = new WebSocket(socketUrl.replace('wss:', 'ws:'));
        } else {
          this.socket = new WebSocket(socketUrl);
        }
        
        // Setup event handlers
        this.socket.onopen = () => {
          console.log('WebSocket connected successfully');
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
          
          // Special handling for common security errors 
          // (when trying to connect ws:// from https:// or vice versa)
          const errorString = String(error);
          if (errorString.includes('SecurityError') || 
              errorString.includes('Mixed Content') || 
              errorString.includes('blocked by CORS policy')) {
            console.warn('WebSocket security error detected. Will try to use alternative connection method.');
            
            // Close the errored socket
            if (this.socket) {
              this.socket.close();
              this.socket = null;
            }
            
            // Use REST fallback for now
            console.log('Using REST fallback for log transmission');
            resolve(); // Resolve anyway so the application can continue
          } else {
            reject(error);
          }
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
    const logEvent = {
      timestamp: Date.now(),
      ...event
    };
    
    // Try to use WebSocket if connected
    if (this.isConnected()) {
      this.sendMessage({
        type: 'log',
        event: logEvent
      });
      return;
    }
    
    // Fallback to HTTP endpoint if WebSocket is not available
    this.sendLogViaHttp(logEvent).catch(error => {
      console.error('Failed to send log via HTTP fallback:', error);
    });
  }
  
  /**
   * Fallback method to send logs via HTTP when WebSocket isn't available
   */
  private async sendLogViaHttp(event: any): Promise<void> {
    try {
      const response = await fetch('/api/mysterion/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'log',
          event
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Just log and continue - we don't want to interrupt the application
      console.error('Failed to send log via HTTP:', error);
    }
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