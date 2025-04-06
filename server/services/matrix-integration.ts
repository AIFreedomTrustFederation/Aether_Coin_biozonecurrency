/**
 * Matrix Communication Integration Service
 * 
 * This service implements the integration with the Matrix communication protocol
 * to provide secure, decentralized, end-to-end encrypted communication between
 * transaction participants.
 */

import { db } from '../storage';
import {
  matrixRooms,
  matrixMessages,
  users,
  escrowTransactions,
  notificationPreferences,
  type MatrixRoom,
  type InsertMatrixMessage,
  type MatrixMessage
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import * as sdk from 'matrix-js-sdk';

// Types for Matrix integration
interface MatrixCredentials {
  userId: string;
  accessToken: string;
  baseUrl: string;
}

interface MatrixRoomConfig {
  name: string;
  topic: string;
  isEncrypted: boolean;
  userIds: string[];
}

interface SendMessageParams {
  roomId: string;
  userId: number;
  content: string;
  messageType: string;
  metadata?: any;
}

/**
 * Matrix Communication Service
 * Manages secure communication channels between transaction participants
 */
export class MatrixCommunicationService {
  private client: sdk.MatrixClient | null = null;
  private homeserverUrl: string;
  private isInitialized: boolean = false;
  
  constructor() {
    // Matrix homeserver to use - in production this might be configurable
    this.homeserverUrl = process.env.MATRIX_HOMESERVER_URL || 'https://matrix.org';
  }
  
  /**
   * Initialize the Matrix client with admin credentials
   * In production, this would use proper credentials stored securely
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }
    
    try {
      // Check if Matrix service credentials are configured
      const matrixUserId = process.env.MATRIX_USER_ID;
      const matrixAccessToken = process.env.MATRIX_ACCESS_TOKEN;
      
      if (!matrixUserId || !matrixAccessToken) {
        console.log('Matrix credentials not configured, using simulation mode');
        this.isInitialized = true;
        return false;
      }
      
      // Create and initialize the client
      this.client = sdk.createClient({
        baseUrl: this.homeserverUrl,
        userId: matrixUserId,
        accessToken: matrixAccessToken,
      });
      
      // Start the client (without syncing to save resources)
      await this.client.startClient({ syncEnabled: false });
      
      console.log('Matrix client initialized');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Matrix client:', error);
      this.isInitialized = false;
      return false;
    }
  }
  
  /**
   * Create a new Matrix room for an escrow transaction
   */
  async createTransactionRoom(escrowTransactionId: number): Promise<MatrixRoom | null> {
    try {
      await this.initialize();
      
      // Get the escrow transaction details
      const escrowTransaction = await db.query.escrowTransactions.findFirst({
        where: eq(escrowTransactions.id, escrowTransactionId),
        with: {
          buyer: true,
          seller: true,
        }
      });
      
      if (!escrowTransaction) {
        throw new Error('Escrow transaction not found');
      }
      
      // Get Matrix IDs for both parties
      const buyerPrefs = await db.query.notificationPreferences.findFirst({
        where: eq(notificationPreferences.userId, escrowTransaction.buyerId),
      });
      
      const sellerPrefs = await db.query.notificationPreferences.findFirst({
        where: eq(notificationPreferences.userId, escrowTransaction.sellerId),
      });
      
      // Room configuration
      const roomConfig: MatrixRoomConfig = {
        name: `Transaction #${escrowTransactionId}`,
        topic: `Escrow transaction for ${escrowTransaction.amount} ${escrowTransaction.tokenSymbol}`,
        isEncrypted: true,
        userIds: []
      };
      
      // Add verified Matrix IDs if available
      if (buyerPrefs?.matrixId && buyerPrefs.isMatrixVerified) {
        roomConfig.userIds.push(buyerPrefs.matrixId);
      }
      
      if (sellerPrefs?.matrixId && sellerPrefs.isMatrixVerified) {
        roomConfig.userIds.push(sellerPrefs.matrixId);
      }
      
      // Create the room (or simulate creation if no Matrix client)
      let matrixRoomId: string;
      
      if (this.client) {
        // Real Matrix room creation
        const response = await this.client.createRoom({
          name: roomConfig.name,
          topic: roomConfig.topic,
          visibility: 'private',
          invite: roomConfig.userIds,
          initial_state: roomConfig.isEncrypted ? [
            {
              type: 'm.room.encryption',
              state_key: '',
              content: { algorithm: 'm.megolm.v1.aes-sha2' }
            }
          ] : [],
        });
        
        matrixRoomId = response.room_id;
      } else {
        // Simulate room creation
        matrixRoomId = `!simulated_${Date.now()}_${escrowTransactionId}:aetherion.org`;
      }
      
      // Store room in database
      const createdRoom = await db.insert(matrixRooms).values({
        roomId: matrixRoomId,
        escrowTransactionId,
        status: 'active',
        encryptionEnabled: roomConfig.isEncrypted,
      }).returning();
      
      // Send welcome message
      if (createdRoom[0]) {
        await this.sendSystemMessage({
          roomId: matrixRoomId,
          userId: 0, // System user
          content: 'Welcome to the transaction chat room. This is a secure channel for communication regarding your transaction.',
          messageType: 'system',
          metadata: {
            transaction: {
              id: escrowTransactionId,
              amount: escrowTransaction.amount,
              tokenSymbol: escrowTransaction.tokenSymbol,
            }
          }
        });
      }
      
      return createdRoom[0];
    } catch (error) {
      console.error('Failed to create transaction room:', error);
      return null;
    }
  }
  
  /**
   * Send a message in a transaction chat room
   */
  async sendMessage(params: SendMessageParams): Promise<MatrixMessage | null> {
    try {
      await this.initialize();
      
      // Get the room from our database
      const room = await db.query.matrixRooms.findFirst({
        where: eq(matrixRooms.roomId, params.roomId),
      });
      
      if (!room) {
        throw new Error('Room not found');
      }
      
      // Get user details
      const user = await db.query.users.findFirst({
        where: eq(users.id, params.userId),
      });
      
      if (!user && params.userId !== 0) { // Allow system messages (userId=0)
        throw new Error('User not found');
      }
      
      // Prepare message for our database
      const messageData: Omit<InsertMatrixMessage, 'eventId'> = {
        roomId: room.id,
        senderId: params.userId,
        content: params.content,
        messageType: params.messageType,
        metadata: params.metadata || {},
      };
      
      let eventId: string;
      
      // Send message through Matrix if client is available
      if (this.client) {
        const result = await this.client.sendMessage(params.roomId, {
          msgtype: 'm.text',
          body: params.content,
          format: 'org.matrix.custom.html',
          formatted_body: params.content,
        });
        
        eventId = result.event_id;
      } else {
        // Simulate event ID for development without Matrix
        eventId = `$simulated_${Date.now()}_${Math.floor(Math.random() * 1000000)}:aetherion.org`;
      }
      
      // Store in our database
      const dbMessage = await db.insert(matrixMessages).values({
        ...messageData,
        eventId,
      }).returning();
      
      return dbMessage[0];
    } catch (error) {
      console.error('Failed to send message:', error);
      return null;
    }
  }
  
  /**
   * Send a system message to a room
   */
  async sendSystemMessage(params: SendMessageParams): Promise<MatrixMessage | null> {
    return this.sendMessage({
      ...params,
      userId: 0, // System user
      messageType: 'system'
    });
  }
  
  /**
   * Get messages for a transaction
   */
  async getMessagesForTransaction(escrowTransactionId: number): Promise<MatrixMessage[]> {
    try {
      // Get the room for this transaction
      const room = await db.query.matrixRooms.findFirst({
        where: eq(matrixRooms.escrowTransactionId, escrowTransactionId),
      });
      
      if (!room) {
        return [];
      }
      
      // Get messages
      const messages = await db.query.matrixMessages.findMany({
        where: eq(matrixMessages.roomId, room.id),
        orderBy: (fields, { asc }) => [asc(fields.sentAt)],
        with: {
          sender: true,
        }
      });
      
      return messages;
    } catch (error) {
      console.error('Failed to get messages:', error);
      return [];
    }
  }
  
  /**
   * Verify a user's Matrix ID
   */
  async verifyUserMatrixId(userId: number, matrixId: string): Promise<boolean> {
    try {
      await this.initialize();
      
      // In a real implementation:
      // 1. Send a verification message to the Matrix ID
      // 2. User confirms by replying with a code
      // 3. Mark as verified once confirmed
      
      // For now, we'll simulate verification
      console.log(`Verifying Matrix ID ${matrixId} for user ${userId}`);
      
      // Update user's notification preferences
      await db.update(notificationPreferences)
        .set({
          matrixId,
          isMatrixVerified: true,
          matrixEnabled: true,
        })
        .where(eq(notificationPreferences.userId, userId));
      
      return true;
    } catch (error) {
      console.error('Matrix ID verification failed:', error);
      return false;
    }
  }
  
  /**
   * Archive a transaction room when the transaction is complete
   */
  async archiveRoom(escrowTransactionId: number): Promise<boolean> {
    try {
      // Get the room
      const room = await db.query.matrixRooms.findFirst({
        where: eq(matrixRooms.escrowTransactionId, escrowTransactionId),
      });
      
      if (!room) {
        return false;
      }
      
      // If Matrix client is available, update the room state
      if (this.client) {
        await this.client.setRoomTopic(room.roomId, 'ARCHIVED: Transaction completed');
      }
      
      // Send system message about archiving
      await this.sendSystemMessage({
        roomId: room.roomId,
        userId: 0,
        content: 'This transaction has been completed. The room will now be archived.',
        messageType: 'system',
      });
      
      // Update room status in database
      await db.update(matrixRooms)
        .set({ status: 'archived' })
        .where(eq(matrixRooms.id, room.id));
      
      return true;
    } catch (error) {
      console.error('Failed to archive room:', error);
      return false;
    }
  }
}

// Singleton instance
export const matrixCommunication = new MatrixCommunicationService();