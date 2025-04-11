/**
 * Matrix Communication Service
 * 
 * Integrates Matrix protocol for secure messaging and real-time communication.
 * This service establishes encrypted communication channels for users
 * and provides notifications about transactions, wallet activities, and DApp updates.
 */

import * as sdk from 'matrix-js-sdk';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Message payload for Matrix communication
 */
interface MatrixMessagePayload {
  roomId: string;
  userId: number;
  content: string;
  messageType: string;
  metadata?: Record<string, any>;
}

/**
 * System message payload for Matrix communication
 */
interface SystemMessagePayload {
  roomId: string;
  userId: number;
  content: string;
  messageType: 'system';
  metadata?: Record<string, any>;
}

/**
 * Matrix communication service for secure messaging
 */
class MatrixCommunicationService {
  private client: sdk.MatrixClient | null = null;
  private initialized: boolean = false;
  
  /**
   * Constructor initializes the Matrix client
   * In a real implementation, this would configure the client properly
   */
  constructor() {
    try {
      // Check for Matrix homeserver and credentials
      const homeserverUrl = process.env.MATRIX_HOMESERVER_URL;
      const accessToken = process.env.MATRIX_ACCESS_TOKEN;
      
      if (homeserverUrl && accessToken) {
        this.client = sdk.createClient({
          baseUrl: homeserverUrl,
          accessToken,
          userId: process.env.MATRIX_USER_ID || '@aetherion:matrix.org',
        });
        this.initialized = true;
        console.log('Matrix client initialized');
      } else {
        console.log('Matrix configuration not found. Running in simulation mode.');
      }
    } catch (error) {
      console.error('Error initializing Matrix client:', error);
    }
  }
  
  /**
   * Check if Matrix service is properly configured
   * @returns True if Matrix is configured, false otherwise
   */
  isMatrixConfigured(): boolean {
    return !!process.env.MATRIX_HOMESERVER_URL && !!process.env.MATRIX_ACCESS_TOKEN;
  }
  
  /**
   * Initialize the Matrix client
   * This is used to (re)initialize the client when needed
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    
    try {
      const homeserverUrl = process.env.MATRIX_HOMESERVER_URL;
      const accessToken = process.env.MATRIX_ACCESS_TOKEN;
      
      if (homeserverUrl && accessToken) {
        this.client = sdk.createClient({
          baseUrl: homeserverUrl,
          accessToken,
          userId: process.env.MATRIX_USER_ID || '@aetherion:matrix.org',
        });
        this.initialized = true;
        console.log('Matrix client initialized');
      } else {
        console.log('Matrix configuration not found. Cannot initialize client.');
      }
    } catch (error) {
      console.error('Error initializing Matrix client:', error);
      throw new Error('Failed to initialize Matrix client');
    }
  }
  
  /**
   * Verify if the given Matrix ID is valid
   * @param matrixId Matrix ID to verify
   * @returns True if valid, false otherwise
   */
  async verifyMatrixId(matrixId: string): Promise<boolean> {
    if (!matrixId || typeof matrixId !== 'string') {
      return false;
    }
    
    // Basic validation for Matrix ID format
    const matrixIdRegex = /@[\w-]+:[\w.-]+\.\w+/;
    if (!matrixIdRegex.test(matrixId)) {
      return false;
    }
    
    // If client is available, try to check the user's existence
    if (this.client) {
      try {
        // In a real implementation, we would check if the user exists
        // For now, we just check format and assume it exists
        return true;
      } catch (error) {
        console.error('Error verifying Matrix ID:', error);
        return false;
      }
    }
    
    // In simulation mode, assume it's valid if it matches the format
    return matrixIdRegex.test(matrixId);
  }
  
  /**
   * Sends a message in a Matrix room
   * @param payload Message payload
   * @returns Event ID if successful, null otherwise
   */
  async sendMessage(payload: MatrixMessagePayload): Promise<string | null> {
    try {
      // If client is available, send the actual message
      if (this.client) {
        const user = await db.query.users.findFirst({
          where: eq(users.id, payload.userId),
        });
        
        // Special handling for different message types
        let messageContent: any = {
          msgtype: 'm.room.message',
          body: payload.content,
          format: 'org.matrix.custom.html',
          formatted_body: payload.content,
        };
        
        // Add metadata if available
        if (payload.metadata) {
          messageContent.metadata = payload.metadata;
        }
        
        // Add message type
        messageContent.type = payload.messageType;
        
        // Send message
        const result = await this.client.sendEvent(
          payload.roomId,
          'm.room.message',
          messageContent,
          ''
        );
        
        return result.event_id;
      }
      
      // Simulation mode - log the message
      console.log(`[Matrix Simulation] Message to room ${payload.roomId}: ${payload.content}`);
      console.log(`[Matrix Simulation] Type: ${payload.messageType}, Metadata:`, payload.metadata);
      
      return `sim_event_${Date.now()}`;
    } catch (error) {
      console.error('Error sending Matrix message:', error);
      return null;
    }
  }
  
  /**
   * Sends a system message (for administrative notifications)
   * @param payload System message payload
   * @returns Event ID if successful, null otherwise
   */
  async sendSystemMessage(payload: SystemMessagePayload): Promise<string | null> {
    try {
      // Special formatting for system messages
      const messagePayload = {
        ...payload,
        content: `🔔 System Notice: ${payload.content}`,
      };
      
      return this.sendMessage(messagePayload);
    } catch (error) {
      console.error('Error sending system message:', error);
      return null;
    }
  }
  
  /**
   * Sends a notification to a specific user
   * @param userId User ID
   * @param message Plain text message
   * @param htmlMessage Optional HTML formatted message
   * @returns Event ID if successful, null otherwise
   */
  async sendUserNotification(
    userId: number, 
    message: string, 
    htmlMessage?: string
  ): Promise<string | null> {
    try {
      // Get user's Matrix room ID (in real implementation, this would be stored in user preferences)
      // For now, we generate a simulated room ID
      const roomId = `!user_${userId}_notifications:aetherion.org`;
      
      return this.sendMessage({
        roomId,
        userId,
        content: htmlMessage || message,
        messageType: 'notification',
        metadata: {
          type: 'user_notification',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return null;
    }
  }
  
  /**
   * Sends a transaction notification
   * @param userId User ID
   * @param transactionType Transaction type (send, receive, etc.)
   * @param amount Transaction amount
   * @param tokenSymbol Token symbol
   * @returns Event ID if successful, null otherwise
   */
  async sendTransactionNotification(
    userId: number,
    transactionType: string,
    amount: string,
    tokenSymbol: string
  ): Promise<string | null> {
    try {
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
      
      // Get user's Matrix room ID
      const roomId = `!user_${userId}_notifications:aetherion.org`;
      
      return this.sendMessage({
        roomId,
        userId,
        content: message,
        messageType: 'transaction',
        metadata: {
          type: 'transaction',
          transactionType,
          amount,
          tokenSymbol,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error sending transaction notification:', error);
      return null;
    }
  }
  
  /**
   * Creates a direct message room between users
   * @param userId1 First user ID
   * @param userId2 Second user ID
   * @returns Room ID if successful, null otherwise
   */
  async createDirectMessageRoom(userId1: number, userId2: number): Promise<string | null> {
    try {
      // In a real implementation, this would create an actual Matrix room
      // For now, we generate a simulated room ID
      const roomId = `!dm_${Math.min(userId1, userId2)}_${Math.max(userId1, userId2)}_${Date.now()}:aetherion.org`;
      
      // Log the creation
      console.log(`[Matrix Simulation] Created DM room ${roomId} between users ${userId1} and ${userId2}`);
      
      return roomId;
    } catch (error) {
      console.error('Error creating direct message room:', error);
      return null;
    }
  }
  
  /**
   * Creates a room for escrow transaction participants
   * @param escrowId Escrow transaction ID
   * @param sellerId Seller user ID
   * @param buyerId Buyer user ID
   * @param roomName Room name
   * @returns Room ID if successful, null otherwise
   */
  async createEscrowRoom(
    escrowId: number,
    sellerId: number,
    buyerId: number,
    roomName: string
  ): Promise<string | null> {
    try {
      // In a real implementation, this would create an actual Matrix room
      // For now, we generate a simulated room ID
      const roomId = `!escrow_${escrowId}_${Date.now()}:aetherion.org`;
      
      // Log the creation
      console.log(`[Matrix Simulation] Created escrow room ${roomId} for transaction ${escrowId}`);
      console.log(`[Matrix Simulation] Participants: Seller ID ${sellerId}, Buyer ID ${buyerId}`);
      
      return roomId;
    } catch (error) {
      console.error('Error creating escrow room:', error);
      return null;
    }
  }
  
  /**
   * Sends a message to a specific room
   * @param roomId Matrix room ID
   * @param userId User ID (0 for system messages)
   * @param message Message content
   * @returns Event ID if successful, null otherwise
   */
  async sendMessageToRoom(
    roomId: string,
    userId: number,
    message: string
  ): Promise<string | null> {
    try {
      // Determine message type based on user ID
      const messageType = userId === 0 ? 'system' : 'user';
      
      // Send the message
      return this.sendMessage({
        roomId,
        userId,
        content: message,
        messageType,
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error sending message to room:', error);
      return null;
    }
  }
  
  /**
   * Checks if a user has Matrix integration enabled
   * @param userId User ID
   * @returns True if Matrix is enabled, false otherwise
   */
  async isMatrixEnabled(userId: number): Promise<boolean> {
    try {
      // Check user preferences in database
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      
      // In a real implementation, this would check a specific setting
      // For now, assume all users with IDs have Matrix enabled
      return !!user;
    } catch (error) {
      console.error('Error checking Matrix integration status:', error);
      return false;
    }
  }
}

// Singleton instance
export const matrixCommunication = new MatrixCommunicationService();