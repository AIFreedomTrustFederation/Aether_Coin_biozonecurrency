/**
 * Aetherion Messaging Service
 * 
 * This is the main entry point for the Aetherion Messaging system.
 * It provides a unified facade for the underlying messaging providers
 * and implements the NotificationService interface.
 */

import { Server as HttpServer } from 'http';
import { 
  MessageType, 
  ChannelType, 
  AccessControlType, 
  EncryptionType,
  PersistenceLevel
} from '../../../shared/aetherion-messaging-schema';
import { AetherionMessagingProvider, NotificationService } from './interfaces';
import { WebSocketMessagingProvider } from './websocket-provider';
import { storage } from '../../storage';

/**
 * Main Aetherion Messaging Service implementation
 * This combines multiple providers and provides a unified interface
 */
export class AetherionMessagingService implements NotificationService {
  private provider: AetherionMessagingProvider;
  private initialized: boolean = false;
  private systemChannels: Map<string, string> = new Map();
  
  /**
   * Constructor
   * @param httpServer HTTP server to attach WebSocket server to
   */
  constructor(httpServer: HttpServer) {
    // Initialize the WebSocket provider
    this.provider = new WebSocketMessagingProvider(httpServer);
  }
  
  /**
   * Initialize the messaging service
   */
  async initialize(): Promise<boolean> {
    try {
      // Initialize the provider
      const success = await this.provider.initialize();
      
      if (!success) {
        console.error('Failed to initialize messaging provider');
        return false;
      }
      
      this.initialized = true;
      console.log('Aetherion Messaging Service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Error initializing Aetherion Messaging Service:', error);
      return false;
    }
  }
  
  /**
   * Check if the service is available
   */
  isAvailable(): boolean {
    return this.initialized && this.provider.isInitialized();
  }
  
  /**
   * Get the notification channel for a user
   * Creates one if it doesn't exist
   * @param userId User ID
   */
  private async _getNotificationChannel(userId: number): Promise<string> {
    try {
      const channelKey = `notification_${userId}`;
      
      // Check if we already have this channel
      if (this.systemChannels.has(channelKey)) {
        return this.systemChannels.get(channelKey)!;
      }
      
      // List user's channels to find notification channel
      const channels = await this.provider.listChannels(userId);
      
      const notificationChannel = channels.find(
        channel => channel.type === ChannelType.SYSTEM &&
                  channel.metadata?.purpose === 'notifications'
      );
      
      if (notificationChannel) {
        // Cache and return existing channel
        this.systemChannels.set(channelKey, notificationChannel.channelId);
        return notificationChannel.channelId;
      }
      
      // Create a new notification channel
      const channelId = await this.provider.createChannel(
        [userId, 0], // User and system
        {
          name: `Notifications for User ${userId}`,
          type: ChannelType.SYSTEM,
          persistence: PersistenceLevel.PERSISTENT,
          encryption: EncryptionType.STANDARD,
          accessControl: AccessControlType.PRIVATE,
          metadata: {
            purpose: 'notifications',
            createdAt: new Date().toISOString()
          }
        }
      );
      
      // Cache and return new channel
      this.systemChannels.set(channelKey, channelId);
      return channelId;
    } catch (error) {
      console.error('Error getting notification channel:', error);
      throw error;
    }
  }
  
  /**
   * Send a notification to a user
   * @param userId User ID
   * @param message Plain text message
   * @param htmlMessage Optional HTML message
   */
  async sendNotification(userId: number, message: string, htmlMessage?: string): Promise<string | null> {
    try {
      if (!this.isAvailable()) {
        console.warn('Aetherion Messaging Service not available');
        return null;
      }
      
      // Get notification channel for user
      const channelId = await this._getNotificationChannel(userId);
      
      // Send message
      const messageId = await this.provider.sendMessage(channelId, {
        content: htmlMessage || message,
        type: MessageType.NOTIFICATION,
        metadata: {
          plainText: message,
          senderId: 0, // System
          important: false,
          category: 'general'
        },
        timestamp: Date.now()
      });
      
      return messageId;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }
  
  /**
   * Send a transaction notification
   * @param userId User ID
   * @param transactionType Transaction type
   * @param amount Transaction amount
   * @param tokenSymbol Token symbol
   */
  async sendTransactionNotification(
    userId: number,
    transactionType: string,
    amount: string,
    tokenSymbol: string
  ): Promise<string | null> {
    try {
      if (!this.isAvailable()) {
        console.warn('Aetherion Messaging Service not available');
        return null;
      }
      
      // Format message based on transaction type
      let message = '';
      let emoji = '';
      
      if (transactionType === 'send') {
        emoji = '↗️';
        message = `You sent ${amount} ${tokenSymbol}`;
      } else if (transactionType === 'receive') {
        emoji = '↘️';
        message = `You received ${amount} ${tokenSymbol}`;
      } else {
        emoji = '🔄';
        message = `Transaction of ${amount} ${tokenSymbol} (${transactionType})`;
      }
      
      // Add emoji to message
      message = `${emoji} ${message}`;
      
      // Get notification channel for user
      const channelId = await this._getNotificationChannel(userId);
      
      // Send message
      const messageId = await this.provider.sendMessage(channelId, {
        content: message,
        type: MessageType.TRANSACTION,
        metadata: {
          senderId: 0, // System
          important: true,
          category: 'transaction',
          transactionType,
          amount,
          tokenSymbol
        },
        timestamp: Date.now()
      });
      
      return messageId;
    } catch (error) {
      console.error('Error sending transaction notification:', error);
      return null;
    }
  }
  
  /**
   * Send a security notification
   * @param userId User ID
   * @param securityEvent Security event
   * @param details Additional details
   */
  async sendSecurityNotification(
    userId: number,
    securityEvent: string,
    details: string
  ): Promise<string | null> {
    try {
      if (!this.isAvailable()) {
        console.warn('Aetherion Messaging Service not available');
        return null;
      }
      
      // Format message
      const message = `🔒 Security Alert: ${securityEvent}. ${details}`;
      
      // Get notification channel for user
      const channelId = await this._getNotificationChannel(userId);
      
      // Send message
      const messageId = await this.provider.sendMessage(channelId, {
        content: message,
        type: MessageType.SECURITY,
        metadata: {
          senderId: 0, // System
          important: true,
          category: 'security',
          securityEvent,
          details
        },
        timestamp: Date.now()
      });
      
      return messageId;
    } catch (error) {
      console.error('Error sending security notification:', error);
      return null;
    }
  }
  
  /**
   * Get the underlying provider
   * Useful for direct access to provider methods
   */
  getProvider(): AetherionMessagingProvider {
    return this.provider;
  }
}

// Export singleton instance
let aetherionMessagingService: AetherionMessagingService | null = null;

/**
 * Initialize the Aetherion Messaging Service
 * @param httpServer HTTP server to attach WebSocket server to
 */
export async function initializeMessagingService(httpServer: HttpServer): Promise<boolean> {
  try {
    aetherionMessagingService = new AetherionMessagingService(httpServer);
    return await aetherionMessagingService.initialize();
  } catch (error) {
    console.error('Error initializing Aetherion Messaging Service:', error);
    return false;
  }
}

/**
 * Get the Aetherion Messaging Service instance
 */
export function getMessagingService(): AetherionMessagingService {
  if (!aetherionMessagingService) {
    throw new Error('Aetherion Messaging Service not initialized');
  }
  
  return aetherionMessagingService;
}