/**
 * Aetherion Matrix Notification Service
 * 
 * This module provides an open-source messaging implementation using the Matrix protocol
 * for secure, decentralized messaging. Matrix is a robust open standard for real-time,
 * decentralized communication with strong security, privacy, and federation capabilities.
 */

import * as sdk from 'matrix-js-sdk';
import { storage } from '../storage';
import { NotificationPreference } from '@shared/schema';

// Matrix client instance
let matrixClient: sdk.MatrixClient | null = null;
// Server URL for Matrix homeserver
const MATRIX_SERVER_URL = process.env.MATRIX_SERVER_URL || 'https://matrix.org';

/**
 * Initialize Matrix client with environment variables or configuration
 */
function initMatrixClient(): boolean {
  try {
    // Check if Matrix notifications are enabled in environment
    const matrixEnabled = process.env.ENABLE_MATRIX_NOTIFICATIONS === 'true';
    if (!matrixEnabled) {
      console.info('Matrix notifications disabled in environment settings.');
      return false;
    }
    
    const userId = process.env.MATRIX_USER_ID;
    const accessToken = process.env.MATRIX_ACCESS_TOKEN;
    
    if (!userId || !accessToken) {
      console.warn('Matrix credentials not set. Notification service is disabled.');
      return false;
    }
    
    // Create the Matrix client
    matrixClient = sdk.createClient({
      baseUrl: MATRIX_SERVER_URL,
      accessToken,
      userId,
    });
    
    // Start the client
    matrixClient.startClient({ initialSyncLimit: 10 });
    
    // Set up error handlers
    matrixClient.on('Session.logged_out' as any, function() {
      console.error('Matrix session logged out');
    });
    
    // Monitor sync state
    matrixClient.on('sync' as any, function(state: string) {
      if (state === 'PREPARED') {
        console.log('Matrix client initialized and synced successfully');
      } else if (state === 'ERROR') {
        console.error('Matrix sync error');
      }
    });
    
    return true;
  } catch (error) {
    console.error('Failed to initialize Matrix client:', error);
    return false;
  }
}

// Try to initialize the client when the service is loaded
initMatrixClient();

/**
 * Send notification to a user via Matrix
 * @param userId Aetherion user ID to send notification to
 * @param message Message content
 * @returns Promise resolving to event ID if successful, null otherwise
 */
export async function sendMatrixNotification(userId: number, message: string): Promise<string | null> {
  try {
    // Check if Matrix client is configured
    if (!matrixClient) {
      // Try to initialize again in case environment variables were added later
      if (!initMatrixClient()) {
        console.error('Cannot send notification: Matrix client not initialized');
        return null;
      }
    }
    
    // Get user's notification preferences
    const notificationPreference = await storage.getNotificationPreferenceByUserId(userId);
    
    if (!notificationPreference) {
      console.error(`Cannot send notification: No notification preferences found for user ${userId}`);
      return null;
    }
    
    // Check if user has notifications enabled and a Matrix ID
    if (!notificationPreference.matrixEnabled || !notificationPreference.matrixId) {
      console.log(`Matrix notifications disabled or Matrix ID not set for user ${userId}`);
      return null;
    }
    
    // Create a direct message room or use existing one
    const roomId = await getOrCreateDirectMessageRoom(notificationPreference.matrixId);
    
    if (!roomId) {
      console.error(`Could not create or find direct message room with ${notificationPreference.matrixId}`);
      return null;
    }
    
    // Send the message
    const result = await matrixClient!.sendTextMessage(roomId, message);
    console.log(`Matrix message sent to ${notificationPreference.matrixId}, event ID: ${result.event_id}`);
    
    return result.event_id;
  } catch (error) {
    console.error('Error sending Matrix notification:', error);
    return null;
  }
}

/**
 * Get an existing direct message room with user or create a new one
 * @param matrixId Matrix ID of the user (e.g., @user:domain.com)
 * @returns Promise resolving to room ID
 */
async function getOrCreateDirectMessageRoom(matrixId: string): Promise<string | null> {
  try {
    if (!matrixClient) return null;
    
    // Check if we already have a DM room with this user
    const rooms = matrixClient.getRooms();
    
    // Check for direct message rooms safely
    for (const room of rooms) {
      try {
        // Check if room has exactly 2 members (user and the other person)
        // and if the other user matches the matrixId we're looking for
        if (room.getJoinedMemberCount() === 2) {
          const members = room.getJoinedMembers();
          const currentUserId = matrixClient?.getUserId() || '';
          const otherMember = members.find(m => m.userId !== currentUserId);
          if (otherMember && otherMember.userId === matrixId) {
            return room.roomId;
          }
        }
      } catch (err) {
        console.warn('Error checking room:', err);
        continue; // Skip this room if there's an error
      }
    }
    
    // Create a new DM room if none exists
    // Use type assertions to handle API differences
    const createRoomOptions: any = {
      preset: 'private_chat' as any,
      invite: [matrixId],
      is_direct: true,
      visibility: 'private' as any,
      initial_state: [
        {
          type: 'm.room.encryption',
          state_key: '',
          content: {
            algorithm: 'm.megolm.v1.aes-sha2'
          }
        }
      ]
    };
    
    const result = await matrixClient.createRoom(createRoomOptions);
    
    return result.room_id;
  } catch (error) {
    console.error('Error creating direct message room:', error);
    return null;
  }
}

/**
 * Send a verification message to confirm user's Matrix ID
 * @param userId User ID in our system
 * @param matrixId Matrix ID to verify (e.g., @user:domain.com)
 * @returns Promise with verification code or null if failed
 */
export async function sendVerificationCode(userId: number, matrixId: string): Promise<string | null> {
  try {
    // Check if Matrix client is configured
    if (!matrixClient) {
      if (!initMatrixClient()) {
        console.error('Cannot send verification: Matrix client not initialized');
        return null;
      }
    }
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create a direct message room with the user
    const roomId = await getOrCreateDirectMessageRoom(matrixId);
    
    if (!roomId) {
      console.error('Cannot create room for verification message');
      return null;
    }
    
    // Send the verification message
    const message = `Your Aetherion Wallet verification code is: ${verificationCode}. This code expires in 10 minutes.`;
    
    await matrixClient!.sendTextMessage(roomId, message);
    
    // Update the user's notification preferences with the Matrix ID (unverified)
    await storage.updateMatrixId(userId, matrixId, false);
    
    return verificationCode;
  } catch (error) {
    console.error('Error sending verification code:', error);
    return null;
  }
}

/**
 * Verify a Matrix ID with a verification code
 * @param userId User ID to verify Matrix for
 * @param verificationCode Code to verify
 * @param expectedCode Expected verification code
 * @returns Promise with boolean indicating success
 */
export async function verifyMatrixId(userId: number, verificationCode: string, expectedCode: string): Promise<boolean> {
  try {
    // Check if the verification code matches
    if (verificationCode !== expectedCode) {
      console.log(`Verification failed for user ${userId}: Code mismatch`);
      return false;
    }
    
    // Get the user's notification preferences
    const notificationPreference = await storage.getNotificationPreferenceByUserId(userId);
    
    if (!notificationPreference) {
      console.error(`Verification failed: No notification preferences found for user ${userId}`);
      return false;
    }
    
    // Update the user's Matrix verification status
    await storage.updateMatrixId(userId, notificationPreference.matrixId!, true);
    
    console.log(`Matrix ID verified for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error verifying Matrix ID:', error);
    return false;
  }
}

/**
 * Send a transaction notification via Matrix
 * @param userId User ID to notify
 * @param transactionType Type of transaction (send/receive)
 * @param amount Amount involved
 * @param tokenSymbol Token symbol (BTC, ETH, etc.)
 * @returns Promise with event ID or null if failed
 */
export async function sendTransactionNotification(
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
  
  return sendMatrixNotification(userId, message);
}

/**
 * Send a security notification via Matrix
 * @param userId User ID to notify
 * @param securityEvent Type of security event
 * @param details Additional details
 * @returns Promise with event ID or null if failed
 */
export async function sendSecurityNotification(
  userId: number,
  securityEvent: string,
  details: string
): Promise<string | null> {
  const notificationPreference = await storage.getNotificationPreferenceByUserId(userId);
  
  if (!notificationPreference?.securityAlerts) {
    return null; // Security alerts disabled
  }
  
  const message = `Aetherion Wallet SECURITY ALERT: ${securityEvent}. ${details}`;
  
  return sendMatrixNotification(userId, message);
}

/**
 * Send a price alert notification via Matrix
 * @param userId User ID to notify
 * @param tokenSymbol Token symbol (BTC, ETH, etc.)
 * @param price Current price
 * @param changePercent Percent change
 * @returns Promise with event ID or null if failed
 */
export async function sendPriceAlertNotification(
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
  
  return sendMatrixNotification(userId, message);
}

/**
 * Check if Matrix client is properly configured
 * @returns Boolean indicating if Matrix is configured
 */
export function isMatrixConfigured(): boolean {
  // Check both the client initialization and environment setting
  const matrixEnabled = process.env.ENABLE_MATRIX_NOTIFICATIONS === 'true';
  return matrixClient !== null && matrixEnabled;
}