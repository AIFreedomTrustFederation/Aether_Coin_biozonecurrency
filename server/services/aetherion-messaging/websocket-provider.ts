/**
 * WebSocket Messaging Provider
 * 
 * This provider implements the Aetherion Messaging interface using WebSockets
 * for real-time communication. It's a self-contained solution that doesn't
 * rely on third-party services.
 */

import { Server as HttpServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { db } from '../../db';
import { v4 as uuidv4 } from 'uuid';
import { 
  Message, 
  MessagePayload, 
  ChannelOptions, 
  Subscription, 
  MessageHandler,
  MessageType,
  ChannelType,
  AccessControlType,
  EncryptionType
} from '../../../shared/aetherion-messaging-schema';
import { BaseMessagingProvider } from './base-provider';

// Define the WebSocket message structure
interface WebSocketMessage {
  type: 'message' | 'channel_created' | 'participant_added' | 'participant_removed' | 'message_read';
  channelId?: string;
  messageId?: string;
  payload?: any;
  userId?: number;
  timestamp: number;
}

/**
 * WebSocket implementation of the Aetherion Messaging Provider
 */
export class WebSocketMessagingProvider extends BaseMessagingProvider {
  private wss: WebSocketServer | null = null;
  private clients: Map<number, Set<WebSocket>> = new Map();
  
  /**
   * Constructor
   * @param httpServer HTTP server to attach WebSocket server to
   */
  constructor(private httpServer: HttpServer) {
    super();
  }
  
  /**
   * Initialize the WebSocket server
   */
  async initialize(): Promise<boolean> {
    try {
      // Create WebSocket server
      this.wss = new WebSocketServer({ 
        server: this.httpServer,
        path: '/ws/messaging'
      });
      
      // Set up connection handler
      this.wss.on('connection', async (ws: WebSocket, req) => {
        try {
          // Extract user ID from request
          const userId = this._extractUserId(req);
          
          if (!userId) {
            ws.close(4001, 'Unauthorized');
            return;
          }
          
          // Add client to clients map
          if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
          }
          this.clients.get(userId)!.add(ws);
          
          console.log(`User ${userId} connected to WebSocket`);
          
          // Set up message handler
          ws.on('message', async (data: any) => {
            try {
              const message = JSON.parse(data.toString());
              await this._handleIncomingMessage(userId, message, ws);
            } catch (error) {
              console.error('Error handling WebSocket message:', error);
              ws.send(JSON.stringify({
                type: 'error',
                error: 'Invalid message format',
                timestamp: Date.now()
              }));
            }
          });
          
          // Set up close handler
          ws.on('close', () => {
            this._removeClient(userId, ws);
            console.log(`User ${userId} disconnected from WebSocket`);
          });
          
          // Set up error handler
          ws.on('error', (error) => {
            console.error(`WebSocket error for user ${userId}:`, error);
            this._removeClient(userId, ws);
          });
          
          // Send welcome message
          ws.send(JSON.stringify({
            type: 'welcome',
            userId,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.error('Error handling WebSocket connection:', error);
          ws.close(4002, 'Internal Server Error');
        }
      });
      
      this._initialized = true;
      console.log('WebSocket messaging provider initialized');
      
      return true;
    } catch (error) {
      console.error('Error initializing WebSocket messaging provider:', error);
      return false;
    }
  }
  
  /**
   * Extract user ID from request
   * @param req HTTP request
   */
  private _extractUserId(req: any): number | null {
    try {
      // Check for JWT token in query parameter
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (token) {
        // Simple token format: 'user_<userId>'
        if (token.startsWith('user_')) {
          const userId = parseInt(token.substring(5), 10);
          return userId || null;
        }
        
        // In a real implementation, verify the JWT token and extract user ID
        // For now, just return null
        return null;
      }
      
      // No token found
      return null;
    } catch (error) {
      console.error('Error extracting user ID from request:', error);
      return null;
    }
  }
  
  /**
   * Remove client from clients map
   * @param userId User ID
   * @param ws WebSocket connection
   */
  private _removeClient(userId: number, ws: WebSocket): void {
    try {
      if (this.clients.has(userId)) {
        this.clients.get(userId)!.delete(ws);
        
        if (this.clients.get(userId)!.size === 0) {
          this.clients.delete(userId);
        }
      }
    } catch (error) {
      console.error('Error removing client:', error);
    }
  }
  
  /**
   * Handle incoming WebSocket message
   * @param userId User ID
   * @param message Parsed WebSocket message
   * @param ws WebSocket connection
   */
  private async _handleIncomingMessage(userId: number, message: any, ws: WebSocket): Promise<void> {
    try {
      // Check message format
      if (!message.type) {
        throw new Error('Invalid message format: missing type');
      }
      
      // Handle different message types
      switch (message.type) {
        case 'message':
          // Send message to channel
          if (!message.channelId || !message.payload) {
            throw new Error('Invalid message format: missing channelId or payload');
          }
          
          const messageId = await this.sendMessage(message.channelId, {
            content: message.payload.content,
            type: message.payload.type || MessageType.DIRECT,
            metadata: {
              ...message.payload.metadata,
              senderId: userId
            },
            encryption: message.payload.encryption,
            timestamp: Date.now()
          });
          
          // Confirm message receipt
          ws.send(JSON.stringify({
            type: 'message_sent',
            messageId,
            channelId: message.channelId,
            timestamp: Date.now()
          }));
          
          break;
        
        case 'mark_read':
          // Mark message as read
          if (!message.messageId) {
            throw new Error('Invalid message format: missing messageId');
          }
          
          await this.markAsRead(message.messageId, userId);
          
          // Confirm read receipt
          ws.send(JSON.stringify({
            type: 'marked_read',
            messageId: message.messageId,
            timestamp: Date.now()
          }));
          
          break;
        
        case 'subscribe':
          // Subscribe to channel
          if (!message.channelId) {
            throw new Error('Invalid message format: missing channelId');
          }
          
          // Client subscription is handled by the WebSocket connection itself
          // Just confirm subscription
          ws.send(JSON.stringify({
            type: 'subscribed',
            channelId: message.channelId,
            timestamp: Date.now()
          }));
          
          break;
        
        default:
          console.warn(`Unknown message type: ${message.type}`);
          break;
      }
    } catch (error) {
      console.error('Error handling incoming message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message,
        timestamp: Date.now()
      }));
    }
  }
  
  /**
   * Implementation of the abstract method from BaseMessagingProvider
   * @param target Channel ID
   * @param payload Message payload
   * @param messageId Generated message ID
   */
  protected async _doSendMessage(
    target: string, 
    payload: MessagePayload, 
    messageId: string
  ): Promise<boolean> {
    try {
      // Get channel participants
      const channel = await this.getChannel(target);
      const participants = channel.participants;
      
      if (!participants || participants.length === 0) {
        console.warn(`No participants found for channel ${target}`);
        return false;
      }
      
      // Prepare message to send
      const wsMessage: WebSocketMessage = {
        type: 'message',
        channelId: target,
        messageId,
        payload: {
          content: payload.content,
          type: payload.type,
          metadata: payload.metadata,
          encryption: payload.encryption
        },
        userId: payload.metadata?.senderId as number,
        timestamp: Date.now()
      };
      
      // Send message to all participants
      const messageStr = JSON.stringify(wsMessage);
      let sentToAny = false;
      
      for (const participant of participants) {
        const userId = participant.userId;
        
        if (this.clients.has(userId)) {
          for (const client of this.clients.get(userId)!) {
            client.send(messageStr);
            sentToAny = true;
          }
        }
      }
      
      return true; // Consider it successful even if not sent to anyone
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }
  
  /**
   * Implementation of the abstract method from BaseMessagingProvider
   * @param channelId Channel ID
   * @param participants List of user IDs
   * @param options Channel options
   */
  protected async _doCreateChannel(
    channelId: string, 
    participants: number[], 
    options: ChannelOptions
  ): Promise<boolean> {
    try {
      // Prepare channel creation message
      const wsMessage: WebSocketMessage = {
        type: 'channel_created',
        channelId,
        payload: {
          name: options.name,
          type: options.type,
          participants,
          createdBy: participants[0],
          metadata: options.metadata
        },
        timestamp: Date.now()
      };
      
      // Send message to all participants
      const messageStr = JSON.stringify(wsMessage);
      
      for (const userId of participants) {
        if (this.clients.has(userId)) {
          for (const client of this.clients.get(userId)!) {
            client.send(messageStr);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in WebSocket channel creation:', error);
      return false;
    }
  }
  
  /**
   * Implementation of the abstract method from BaseMessagingProvider
   * @param channelId Channel ID
   * @param participants List of user IDs
   */
  protected async _doAddParticipants(
    channelId: string, 
    participants: number[]
  ): Promise<boolean> {
    try {
      // Get all channel participants (including existing ones)
      const channel = await this.getChannel(channelId);
      const allParticipants = channel.participants.map(p => p.userId);
      
      // Prepare participant added message
      const wsMessage: WebSocketMessage = {
        type: 'participant_added',
        channelId,
        payload: {
          newParticipants: participants
        },
        timestamp: Date.now()
      };
      
      // Send message to all participants
      const messageStr = JSON.stringify(wsMessage);
      
      for (const userId of allParticipants) {
        if (this.clients.has(userId)) {
          for (const client of this.clients.get(userId)!) {
            client.send(messageStr);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in WebSocket add participants:', error);
      return false;
    }
  }
  
  /**
   * Implementation of the abstract method from BaseMessagingProvider
   * @param channelId Channel ID
   * @param participants List of user IDs
   */
  protected async _doRemoveParticipants(
    channelId: string, 
    participants: number[]
  ): Promise<boolean> {
    try {
      // Get remaining channel participants
      const channel = await this.getChannel(channelId);
      const remainingParticipants = channel.participants
        .filter(p => !participants.includes(p.userId))
        .map(p => p.userId);
      
      // Prepare participant removed message
      const wsMessage: WebSocketMessage = {
        type: 'participant_removed',
        channelId,
        payload: {
          removedParticipants: participants
        },
        timestamp: Date.now()
      };
      
      // Send message to all remaining participants
      const messageStr = JSON.stringify(wsMessage);
      
      for (const userId of remainingParticipants) {
        if (this.clients.has(userId)) {
          for (const client of this.clients.get(userId)!) {
            client.send(messageStr);
          }
        }
      }
      
      // Also send to removed participants so they know they've been removed
      for (const userId of participants) {
        if (this.clients.has(userId)) {
          for (const client of this.clients.get(userId)!) {
            client.send(messageStr);
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in WebSocket remove participants:', error);
      return false;
    }
  }
  
  /**
   * Implementation of the abstract method from BaseMessagingProvider
   * @param messageId Message ID
   * @param userId User ID
   */
  protected async _doMarkAsRead(
    messageId: string, 
    userId: number
  ): Promise<boolean> {
    try {
      // Get the message
      // Implementation would get the message and channel
      
      // Prepare message read notification
      const wsMessage: WebSocketMessage = {
        type: 'message_read',
        messageId,
        userId,
        timestamp: Date.now()
      };
      
      // In a real implementation, you'd send this to relevant participants
      // For now, just return true
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }
  
  /**
   * Implementation of listenForMessages from AetherionMessagingProvider
   * @param channelId Channel ID
   * @param callback Message handler
   */
  async listenForMessages(channelId: string, callback: MessageHandler): Promise<Subscription> {
    // This is typically used on the client side
    // For server-side implementation, we'll return a dummy subscription
    return {
      unsubscribe: async () => {},
      isActive: () => false
    };
  }
  
  /**
   * Implementation of verifyIdentity from AetherionMessagingProvider
   * @param userId User ID
   * @param challenge Challenge string
   * @param signature Signature of the challenge
   */
  async verifyIdentity(userId: string, challenge: string, signature: string): Promise<boolean> {
    // In a real implementation, verify the signature
    // For now, just return true
    return true;
  }
}