/**
 * Aetherion Messaging Service Interfaces
 * 
 * This file defines the core interfaces for the Aetherion Messaging system,
 * providing a flexible, blockchain-oriented communication layer.
 */

import { 
  Message, 
  MessagePayload, 
  ChannelOptions, 
  Subscription, 
  MessageHandler,
  ChannelType,
  MessageType,
  AccessControlType
} from '../../../shared/aetherion-messaging-schema';

/**
 * Core messaging provider interface
 */
export interface AetherionMessagingProvider {
  /**
   * Initialize the messaging provider
   */
  initialize(): Promise<boolean>;
  
  /**
   * Check if messaging provider is initialized
   */
  isInitialized(): boolean;

  /**
   * Send a message to a specific target
   * @param target Channel ID or user ID
   * @param payload Message payload
   * @returns Promise with message ID
   */
  sendMessage(target: string, payload: MessagePayload): Promise<string>;

  /**
   * Create a messaging channel
   * @param participants List of user IDs
   * @param options Channel options
   * @returns Promise with channel ID
   */
  createChannel(participants: number[], options: ChannelOptions): Promise<string>;

  /**
   * Get a channel by ID
   * @param channelId Channel ID
   * @returns Promise with channel details
   */
  getChannel(channelId: string): Promise<any>;

  /**
   * List channels for a user
   * @param userId User ID
   * @returns Promise with list of channels
   */
  listChannels(userId: number): Promise<any[]>;

  /**
   * Add participants to a channel
   * @param channelId Channel ID
   * @param participants List of user IDs
   * @returns Promise with success status
   */
  addParticipants(channelId: string, participants: number[]): Promise<boolean>;

  /**
   * Remove participants from a channel
   * @param channelId Channel ID
   * @param participants List of user IDs
   * @returns Promise with success status
   */
  removeParticipants(channelId: string, participants: number[]): Promise<boolean>;

  /**
   * Listen for messages in a channel
   * @param channelId Channel ID
   * @param callback Message handler
   * @returns Promise with subscription
   */
  listenForMessages(channelId: string, callback: MessageHandler): Promise<Subscription>;

  /**
   * Get messages from a channel
   * @param channelId Channel ID
   * @param limit Max number of messages to retrieve
   * @param before Message ID to retrieve messages before
   * @returns Promise with list of messages
   */
  getMessages(channelId: string, limit?: number, before?: string): Promise<Message[]>;

  /**
   * Mark a message as read
   * @param messageId Message ID
   * @param userId User ID
   * @returns Promise with success status
   */
  markAsRead(messageId: string, userId: number): Promise<boolean>;

  /**
   * Verify identity of a user
   * @param userId User ID
   * @param challenge Challenge string
   * @param signature Signature of the challenge
   * @returns Promise with verification status
   */
  verifyIdentity(userId: string, challenge: string, signature: string): Promise<boolean>;
}

/**
 * Notification service interface, to be used as a facade for sending notifications
 */
export interface NotificationService {
  /**
   * Send a notification to a user
   * @param userId User ID
   * @param message Plain text message
   * @param htmlMessage Optional HTML message
   * @returns Promise with notification ID or null
   */
  sendNotification(userId: number, message: string, htmlMessage?: string): Promise<string | null>;

  /**
   * Send a transaction notification
   * @param userId User ID
   * @param transactionType Transaction type
   * @param amount Transaction amount
   * @param tokenSymbol Token symbol
   * @returns Promise with notification ID or null
   */
  sendTransactionNotification(
    userId: number,
    transactionType: string,
    amount: string,
    tokenSymbol: string
  ): Promise<string | null>;

  /**
   * Send a security notification
   * @param userId User ID
   * @param securityEvent Security event
   * @param details Additional details
   * @returns Promise with notification ID or null
   */
  sendSecurityNotification(
    userId: number,
    securityEvent: string,
    details: string
  ): Promise<string | null>;

  /**
   * Check if notification service is available
   * @returns Boolean indicating availability
   */
  isAvailable(): boolean;
}