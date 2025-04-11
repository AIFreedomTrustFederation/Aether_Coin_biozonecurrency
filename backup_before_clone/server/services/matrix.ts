import * as sdk from 'matrix-js-sdk';
import dotenv from 'dotenv';
import { storage } from '../storage';
import { NotificationPreference } from '@shared/schema';

dotenv.config();

const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://matrix.org';
const MATRIX_USER = process.env.MATRIX_USER || '';
const MATRIX_PASSWORD = process.env.MATRIX_PASSWORD || '';
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN || '';

/**
 * Matrix Service for secure, open-source notifications
 * Uses matrix-js-sdk for integration with Matrix open messaging protocol
 */
export class MatrixService {
  private client: sdk.MatrixClient | null = null;
  private isInitialized: boolean = false;
  private roomsByUser: Record<string, string> = {};

  /**
   * Initialize the Matrix client
   * @returns Promise that resolves when client is initialized
   */
  async initialize(): Promise<void> {
    // If already initialized, return
    if (this.isInitialized) return;

    try {
      if (MATRIX_ACCESS_TOKEN) {
        // Initialize with access token
        this.client = sdk.createClient({
          baseUrl: MATRIX_HOME_SERVER,
          accessToken: MATRIX_ACCESS_TOKEN,
          userId: MATRIX_USER,
        });
      } else if (MATRIX_USER && MATRIX_PASSWORD) {
        // Initialize with username/password
        this.client = sdk.createClient({
          baseUrl: MATRIX_HOME_SERVER,
        });
        
        // Login
        const loginResponse = await this.client.login('m.login.password', {
          user: MATRIX_USER,
          password: MATRIX_PASSWORD,
        });
        
        // Recreate client with access token
        this.client = sdk.createClient({
          baseUrl: MATRIX_HOME_SERVER,
          accessToken: loginResponse.access_token,
          userId: loginResponse.user_id,
        });
      } else {
        console.warn('Matrix credentials not provided. Notifications disabled.');
        return;
      }

      // Start client
      await this.client.startClient({ initialSyncLimit: 10 });
      
      // Set up event listeners
      this.client.on("Room.timeline" as any, (event: any, room: any) => {
        // Handle incoming messages if needed
      });
      
      // Mark as initialized
      this.isInitialized = true;
      console.log('Matrix client initialized successfully');
    } catch (error) {
      console.error('Error initializing Matrix client:', error);
      this.client = null;
    }
  }

  /**
   * Get or create direct message room with a user
   * @param matrixId Matrix ID (e.g., @user:matrix.org)
   * @returns Room ID
   */
  async getOrCreateDirectRoom(matrixId: string): Promise<string> {
    if (!this.isInitialized || !this.client) {
      await this.initialize();
      if (!this.client) throw new Error('Matrix client not initialized');
    }

    // Check if we already have this room
    if (this.roomsByUser[matrixId]) {
      return this.roomsByUser[matrixId];
    }

    try {
      // Try to find existing DM room
      const rooms = this.client.getRooms();
      for (const room of rooms) {
        if (room.getDMInviter() === matrixId) {
          this.roomsByUser[matrixId] = room.roomId;
          return room.roomId;
        }
      }

      // Create new DM room
      const response = await this.client.createRoom({
        preset: 'trusted_private_chat' as any,
        invite: [matrixId],
        is_direct: true,
      });

      this.roomsByUser[matrixId] = response.room_id;
      return response.room_id;
    } catch (error) {
      console.error(`Error creating direct room with ${matrixId}:`, error);
      throw error;
    }
  }

  /**
   * Send notification to a Matrix user
   * @param matrixId Matrix ID to send notification to
   * @param message Message content
   * @param htmlMessage Optional HTML-formatted message
   * @returns Event ID of sent message
   */
  async sendNotification(
    matrixId: string, 
    message: string,
    htmlMessage?: string
  ): Promise<string> {
    if (!this.isInitialized || !this.client) {
      await this.initialize();
      if (!this.client) throw new Error('Matrix client not initialized');
    }

    try {
      // Get or create room
      const roomId = await this.getOrCreateDirectRoom(matrixId);
      
      // Send message
      const content: any = {
        body: message,
        msgtype: 'm.text',
      };
      
      // Add HTML content if provided
      if (htmlMessage) {
        content.formatted_body = htmlMessage;
        content.format = 'org.matrix.custom.html';
      }
      
      const response = await this.client.sendEvent(roomId, 'm.room.message', content, '');
      return response.event_id;
    } catch (error) {
      console.error(`Error sending notification to ${matrixId}:`, error);
      throw error;
    }
  }

  /**
   * Verify if a Matrix ID exists and is valid
   * @param matrixId Matrix ID to verify
   * @returns Boolean indicating if the ID is valid
   */
  async verifyMatrixId(matrixId: string): Promise<boolean> {
    if (!this.client) {
      await this.initialize();
      if (!this.client) throw new Error('Matrix client not initialized');
    }

    try {
      // Try to search for user
      const searchResult = await this.client.searchUserDirectory({
        term: matrixId,
      });
      
      // Check if user exists in results
      return searchResult.results.some(user => user.user_id === matrixId);
    } catch (error) {
      console.error(`Error verifying Matrix ID ${matrixId}:`, error);
      return false;
    }
  }

  /**
   * Stop the Matrix client
   */
  stopClient(): void {
    if (this.client) {
      this.client.stopClient();
      this.isInitialized = false;
      this.client = null;
      this.roomsByUser = {};
    }
  }
  
  /**
   * Check if Matrix is properly configured
   * @returns Boolean indicating if Matrix client is configured
   */
  isMatrixConfigured(): boolean {
    return this.client !== null || !!(MATRIX_USER && (MATRIX_PASSWORD || MATRIX_ACCESS_TOKEN));
  }
  
  /**
   * Send notification to a user by userId
   * @param userId User ID to send notification to
   * @param message Message content
   * @param htmlMessage Optional HTML-formatted message
   * @returns Event ID of sent message or null if failed
   */
  async sendUserNotification(userId: number, message: string, htmlMessage?: string): Promise<string | null> {
    try {
      // Get user's notification preferences
      const notificationPreference = await storage.getNotificationPreferenceByUserId(userId);
      
      if (!notificationPreference) {
        console.error(`Cannot send Matrix notification: No notification preferences found for user ${userId}`);
        return null;
      }
      
      // Check if user has Matrix notifications enabled and a verified Matrix ID
      if (!notificationPreference.matrixEnabled || !notificationPreference.isMatrixVerified) {
        console.log(`Matrix notifications disabled or Matrix ID not verified for user ${userId}`);
        return null;
      }
      
      // Check if Matrix ID exists
      if (!notificationPreference.matrixId) {
        console.error(`Cannot send Matrix notification: No Matrix ID for user ${userId}`);
        return null;
      }
      
      // Send notification via Matrix
      const eventId = await this.sendNotification(
        notificationPreference.matrixId,
        message,
        htmlMessage
      );
      
      console.log(`Matrix notification sent to user ${userId}, event ID: ${eventId}`);
      return eventId;
    } catch (error) {
      console.error('Error sending Matrix notification:', error);
      return null;
    }
  }
  
  /**
   * Send a transaction notification
   * @param userId User ID to notify
   * @param transactionType Type of transaction (send/receive)
   * @param amount Amount involved
   * @param tokenSymbol Token symbol (BTC, ETH, etc.)
   * @returns Event ID of sent message or null if failed
   */
  async sendTransactionNotification(
    userId: number, 
    transactionType: string, 
    amount: string, 
    tokenSymbol: string
  ): Promise<string | null> {
    const notificationPreference = await storage.getNotificationPreferenceByUserId(userId);
    
    if (!notificationPreference?.transactionAlerts) {
      return null; // Transaction alerts disabled
    }
    
    const message = `Aetherion Wallet: ${transactionType.toUpperCase()} transaction of ${amount} ${tokenSymbol} has been ${transactionType === 'receive' ? 'received' : 'sent'}.`;
    
    const htmlMessage = `<b>Aetherion Wallet</b>: ${transactionType.toUpperCase()} transaction of <b>${amount} ${tokenSymbol}</b> has been ${transactionType === 'receive' ? 'received' : 'sent'}.`;
    
    return this.sendUserNotification(userId, message, htmlMessage);
  }
  
  /**
   * Send a security notification
   * @param userId User ID to notify
   * @param securityEvent Type of security event
   * @param details Additional details
   * @returns Event ID of sent message or null if failed
   */
  async sendSecurityNotification(
    userId: number,
    securityEvent: string,
    details: string
  ): Promise<string | null> {
    const notificationPreference = await storage.getNotificationPreferenceByUserId(userId);
    
    if (!notificationPreference?.securityAlerts) {
      return null; // Security alerts disabled
    }
    
    const message = `Aetherion Wallet SECURITY ALERT: ${securityEvent}. ${details}`;
    
    const htmlMessage = `<b>Aetherion Wallet SECURITY ALERT</b>: ${securityEvent}. <i>${details}</i>`;
    
    return this.sendUserNotification(userId, message, htmlMessage);
  }
  
  /**
   * Send a price alert notification
   * @param userId User ID to notify
   * @param tokenSymbol Token symbol (BTC, ETH, etc.)
   * @param price Current price
   * @param changePercent Percent change
   * @returns Event ID of sent message or null if failed
   */
  async sendPriceAlertNotification(
    userId: number,
    tokenSymbol: string,
    price: string,
    changePercent: string
  ): Promise<string | null> {
    const notificationPreference = await storage.getNotificationPreferenceByUserId(userId);
    
    if (!notificationPreference?.priceAlerts) {
      return null; // Price alerts disabled
    }
    
    const direction = parseFloat(changePercent) >= 0 ? 'up' : 'down';
    const message = `Aetherion Wallet PRICE ALERT: ${tokenSymbol} is ${direction} ${Math.abs(parseFloat(changePercent))}% at $${price}.`;
    
    const htmlMessage = `<b>Aetherion Wallet PRICE ALERT</b>: ${tokenSymbol} is ${direction} <span style="color:${parseFloat(changePercent) >= 0 ? 'green' : 'red'}">${Math.abs(parseFloat(changePercent))}%</span> at $${price}.`;
    
    return this.sendUserNotification(userId, message, htmlMessage);
  }
}

// Singleton instance
export const matrixService = new MatrixService();

// Initialize on startup
matrixService.initialize().catch(err => {
  console.error('Failed to initialize Matrix service on startup:', err);
});

export default matrixService;