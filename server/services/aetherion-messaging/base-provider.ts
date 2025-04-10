/**
 * Base Aetherion Messaging Provider
 * 
 * This abstract class provides a foundation for different messaging providers
 * to implement the AetherionMessagingProvider interface with common functionality.
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db';
import { 
  Message, 
  MessagePayload, 
  ChannelOptions, 
  Subscription, 
  MessageHandler,
  MessageType,
  ChannelType,
  AccessControlType,
  EncryptionType,
  channels,
  channelParticipants,
  messages
} from '../../../shared/aetherion-messaging-schema';
import { AetherionMessagingProvider } from './interfaces';
import { eq, and, isNull, lt } from 'drizzle-orm';

/**
 * Abstract base class for messaging providers
 */
export abstract class BaseMessagingProvider implements AetherionMessagingProvider {
  protected _initialized: boolean = false;
  
  /**
   * Abstract method to initialize the provider
   */
  abstract initialize(): Promise<boolean>;
  
  /**
   * Check if provider is initialized
   */
  isInitialized(): boolean {
    return this._initialized;
  }
  
  /**
   * Core implementation of sendMessage that all providers can use
   * @param target Channel ID or user ID
   * @param payload Message payload
   */
  async sendMessage(target: string, payload: MessagePayload): Promise<string> {
    try {
      // Generate unique message ID
      const messageId = `msg_${uuidv4()}`;
      
      // Check if the target is a valid channel
      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, parseInt(target)));
      
      if (!channel) {
        throw new Error(`Channel ${target} not found`);
      }
      
      // Create message record
      const [message] = await db
        .insert(messages)
        .values({
          messageId,
          channelId: target,
          senderId: payload.metadata?.senderId as number || 0, // Default to system user
          content: payload.content,
          messageType: payload.type,
          sentAt: new Date(),
          status: 'sent',
          metadata: payload.metadata || {},
          encryption: payload.encryption || EncryptionType.STANDARD,
          signature: payload.signature
        })
        .returning();
      
      // Implement provider-specific message sending logic
      const success = await this._doSendMessage(target, payload, messageId);
      
      if (!success) {
        // Update message status to failed
        await db
          .update(messages)
          .set({ status: 'failed' })
          .where(eq(messages.messageId, messageId));
        
        throw new Error(`Failed to send message to ${target}`);
      }
      
      return messageId;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  /**
   * Abstract method for provider-specific message sending
   * @param target Channel ID or user ID
   * @param payload Message payload
   * @param messageId Generated message ID
   */
  protected abstract _doSendMessage(
    target: string, 
    payload: MessagePayload, 
    messageId: string
  ): Promise<boolean>;
  
  /**
   * Create a messaging channel
   * @param participants List of user IDs
   * @param options Channel options
   */
  async createChannel(participants: number[], options: ChannelOptions): Promise<string> {
    try {
      // Generate unique channel ID
      const channelId = `chan_${uuidv4()}`;
      
      // Create channel record
      const [channel] = await db
        .insert(channels)
        .values({
          name: options.name || `Channel ${channelId}`,
          description: `Channel created on ${new Date().toISOString()}`,
          createdById: participants[0] || 0, // First participant is creator
          isGroupChannel: options.type === ChannelType.GROUP,
          isEncrypted: true,
          metadata: options.metadata || {},
          persistenceLevel: 'standard'
        })
        .returning();
      
      // Add participants
      const participantRecords = participants.map(userId => ({
        channelId,
        userId,
        role: userId === participants[0] ? 'admin' : 'member',
        permissions: {}
      }));
      
      await db
        .insert(channelParticipants)
        .values(participantRecords);
      
      // Implement provider-specific channel creation logic
      const success = await this._doCreateChannel(channelId, participants, options);
      
      if (!success) {
        // Clean up if provider-specific creation failed
        await db
          .delete(channelParticipants)
          .where(eq(channelParticipants.channelId, parseInt(channelId)));
        
        await db
          .delete(channels)
          .where(eq(channels.id, parseInt(channelId)));
        
        throw new Error('Failed to create channel in provider');
      }
      
      return channelId;
    } catch (error) {
      console.error('Error creating channel:', error);
      throw error;
    }
  }
  
  /**
   * Abstract method for provider-specific channel creation
   * @param channelId Generated channel ID
   * @param participants List of user IDs
   * @param options Channel options
   */
  protected abstract _doCreateChannel(
    channelId: string, 
    participants: number[], 
    options: ChannelOptions
  ): Promise<boolean>;
  
  /**
   * Get a channel by ID
   * @param channelId Channel ID
   */
  async getChannel(channelId: string): Promise<any> {
    try {
      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, parseInt(channelId)));
      
      if (!channel) {
        throw new Error(`Channel ${channelId} not found`);
      }
      
      // Get participants
      const participants = await db
        .select()
        .from(channelParticipants)
        .where(and(
          eq(channelParticipants.channelId, parseInt(channelId)),
          isNull(channelParticipants.leftAt)
        ));
      
      return {
        ...channel,
        participants
      };
    } catch (error) {
      console.error('Error getting channel:', error);
      throw error;
    }
  }
  
  /**
   * List channels for a user
   * @param userId User ID
   */
  async listChannels(userId: number): Promise<any[]> {
    try {
      // Get all channels where the user is a participant
      const participations = await db
        .select()
        .from(channelParticipants)
        .where(and(
          eq(channelParticipants.userId, userId),
          isNull(channelParticipants.leftAt)
        ));
      
      const channelIds = participations.map(p => p.channelId);
      
      if (channelIds.length === 0) {
        return [];
      }
      
      // Get channel details
      const channels = await Promise.all(
        channelIds.map(channelId => this.getChannel(channelId))
      );
      
      return channels;
    } catch (error) {
      console.error('Error listing channels:', error);
      throw error;
    }
  }
  
  /**
   * Add participants to a channel
   * @param channelId Channel ID
   * @param participants List of user IDs
   */
  async addParticipants(channelId: string, participants: number[]): Promise<boolean> {
    try {
      // Check if channel exists
      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, parseInt(channelId)));
      
      if (!channel) {
        throw new Error(`Channel ${channelId} not found`);
      }
      
      // Get existing participants
      const existingParticipants = await db
        .select()
        .from(channelParticipants)
        .where(and(
          eq(channelParticipants.channelId, parseInt(channelId)),
          isNull(channelParticipants.leftAt)
        ));
      
      const existingUserIds = existingParticipants.map(p => p.userId);
      
      // Filter out users who are already participants
      const newParticipants = participants.filter(userId => 
        !existingUserIds.includes(userId)
      );
      
      if (newParticipants.length === 0) {
        return true; // All users are already participants
      }
      
      // Add new participants
      const participantRecords = newParticipants.map(userId => ({
        channelId: parseInt(channelId),
        userId,
        role: 'member',
        permissions: {}
      }));
      
      await db
        .insert(channelParticipants)
        .values(participantRecords);
      
      // Implement provider-specific participant addition logic
      const success = await this._doAddParticipants(channelId, newParticipants);
      
      if (!success) {
        // Clean up if provider-specific addition failed
        await db
          .delete(channelParticipants)
          .where(and(
            eq(channelParticipants.channelId, parseInt(channelId)),
            isNull(channelParticipants.leftAt)
          ));
        
        throw new Error('Failed to add participants in provider');
      }
      
      return true;
    } catch (error) {
      console.error('Error adding participants:', error);
      throw error;
    }
  }
  
  /**
   * Abstract method for provider-specific participant addition
   * @param channelId Channel ID
   * @param participants List of user IDs
   */
  protected abstract _doAddParticipants(
    channelId: string, 
    participants: number[]
  ): Promise<boolean>;
  
  /**
   * Remove participants from a channel
   * @param channelId Channel ID
   * @param participants List of user IDs
   */
  async removeParticipants(channelId: string, participants: number[]): Promise<boolean> {
    try {
      // Check if channel exists
      const [channel] = await db
        .select()
        .from(channels)
        .where(eq(channels.id, parseInt(channelId)));
      
      if (!channel) {
        throw new Error(`Channel ${channelId} not found`);
      }
      
      // Update participation records
      for (const userId of participants) {
        await db
          .update(channelParticipants)
          .set({
            leftAt: new Date(),
            isActive: false
          })
          .where(and(
            eq(channelParticipants.channelId, parseInt(channelId)),
            eq(channelParticipants.userId, userId),
            isNull(channelParticipants.leftAt)
          ));
      }
      
      // Implement provider-specific participant removal logic
      const success = await this._doRemoveParticipants(channelId, participants);
      
      if (!success) {
        console.warn(`Provider-specific removal failed for channel ${channelId}`);
        // Continue anyway as the database has been updated
      }
      
      return true;
    } catch (error) {
      console.error('Error removing participants:', error);
      throw error;
    }
  }
  
  /**
   * Abstract method for provider-specific participant removal
   * @param channelId Channel ID
   * @param participants List of user IDs
   */
  protected abstract _doRemoveParticipants(
    channelId: string, 
    participants: number[]
  ): Promise<boolean>;
  
  /**
   * Listen for messages in a channel
   * @param channelId Channel ID
   * @param callback Message handler
   */
  abstract listenForMessages(channelId: string, callback: MessageHandler): Promise<Subscription>;
  
  /**
   * Get messages from a channel
   * @param channelId Channel ID
   * @param limit Max number of messages to retrieve
   * @param before Message ID to retrieve messages before
   */
  async getMessages(channelId: string, limit: number = 50, before?: string): Promise<Message[]> {
    try {
      // Build query
      let query = db
        .select()
        .from(messages)
        .where(eq(messages.channelId, parseInt(channelId)))
        .orderBy(messages.sentAt)
        .limit(limit);
      
      // Add before filter if specified
      if (before) {
        const [beforeMessage] = await db
          .select()
          .from(messages)
          .where(eq(messages.messageId, before));
        
        if (beforeMessage) {
          query = query.where(messages.sentAt < beforeMessage.sentAt);
        }
      }
      
      // Execute query
      const messageList = await query;
      
      return messageList;
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  }
  
  /**
   * Mark a message as read
   * @param messageId Message ID
   * @param userId User ID
   */
  async markAsRead(messageId: string, userId: number): Promise<boolean> {
    try {
      // Get the message
      const [message] = await db
        .select()
        .from(messages)
        .where(eq(messages.messageId, messageId));
      
      if (!message) {
        throw new Error(`Message ${messageId} not found`);
      }
      
      // Update the last read message ID for the participant
      await db
        .update(channelParticipants)
        .set({
          lastReadMessageId: messageId
        })
        .where(and(
          eq(channelParticipants.channelId, parseInt(message.channelId)),
          eq(channelParticipants.userId, userId),
          isNull(channelParticipants.leftAt)
        ));
      
      // Implement provider-specific message read logic
      const success = await this._doMarkAsRead(messageId, userId);
      
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }
  
  /**
   * Abstract method for provider-specific message read logic
   * @param messageId Message ID
   * @param userId User ID
   */
  protected abstract _doMarkAsRead(
    messageId: string, 
    userId: number
  ): Promise<boolean>;
  
  /**
   * Verify identity of a user
   * @param userId User ID
   * @param challenge Challenge string
   * @param signature Signature of the challenge
   */
  abstract verifyIdentity(userId: string, challenge: string, signature: string): Promise<boolean>;
}