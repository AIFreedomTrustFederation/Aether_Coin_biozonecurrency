import twilio from 'twilio';
import { storage } from '../storage';
import { NotificationPreference } from '@shared/schema';

// Initialize Twilio client with environment variables
let twilioClient: any = null;

// Initialize Twilio client if environment variables are available
function initTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
  
  if (accountSid && authToken && phoneNumber) {
    try {
      twilioClient = twilio(accountSid, authToken);
      console.log('Twilio client initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Twilio client:', error);
      return false;
    }
  } else {
    console.warn('Twilio environment variables not set. SMS notifications are disabled.');
    return false;
  }
}

// Try to initialize the client when the service is loaded
initTwilioClient();

/**
 * Send SMS notification to a user
 * @param userId User ID to send SMS to
 * @param message Message content
 * @returns Promise with the message SID or null if failed
 */
export async function sendSmsNotification(userId: number, message: string): Promise<string | null> {
  try {
    // Check if Twilio is configured
    if (!twilioClient) {
      // Try to initialize again in case environment variables were added later
      if (!initTwilioClient()) {
        console.error('Cannot send SMS: Twilio client not initialized');
        return null;
      }
    }
    
    // Get user's notification preferences
    const notificationPreference = await storage.getNotificationPreferenceByUserId(userId);
    
    if (!notificationPreference) {
      console.error(`Cannot send SMS: No notification preferences found for user ${userId}`);
      return null;
    }
    
    // Check if user has SMS notifications enabled and a verified phone number
    if (!notificationPreference.smsEnabled || !notificationPreference.isPhoneVerified) {
      console.log(`SMS notifications disabled or phone not verified for user ${userId}`);
      return null;
    }
    
    // Check if phone number exists
    if (!notificationPreference.phoneNumber) {
      console.error(`Cannot send SMS: No phone number for user ${userId}`);
      return null;
    }
    
    // Send the message via Twilio
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!twilioPhoneNumber) {
      console.error('Cannot send SMS: No Twilio phone number configured');
      return null;
    }
    
    const result = await twilioClient!.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: notificationPreference.phoneNumber
    });
    
    console.log(`SMS sent to user ${userId}, SID: ${result.sid}`);
    return result.sid;
    
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return null;
  }
}

/**
 * Send a verification code to the user's phone number
 * @param userId User ID to send verification code to
 * @param phoneNumber Phone number to verify
 * @returns Promise with verification code or null if failed
 */
export async function sendVerificationCode(userId: number, phoneNumber: string): Promise<string | null> {
  try {
    // Check if Twilio is configured
    if (!twilioClient) {
      if (!initTwilioClient()) {
        console.error('Cannot send verification: Twilio client not initialized');
        return null;
      }
    }
    
    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send the verification code via Twilio
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!twilioPhoneNumber) {
      console.error('Cannot send verification: No Twilio phone number configured');
      return null;
    }
    
    const message = `Your Aetherion Wallet verification code is: ${verificationCode}. This code expires in 10 minutes.`;
    
    const result = await twilioClient!.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber
    });
    
    console.log(`Verification code sent to ${phoneNumber}, SID: ${result.sid}`);
    
    // Update the user's notification preferences with the new phone number (unverified)
    await storage.updatePhoneNumber(userId, phoneNumber, false);
    
    return verificationCode;
    
  } catch (error) {
    console.error('Error sending verification code:', error);
    return null;
  }
}

/**
 * Verify a phone number with a verification code
 * @param userId User ID to verify phone for
 * @param verificationCode Code to verify
 * @param expectedCode Expected verification code
 * @returns Promise with boolean indicating success
 */
export async function verifyPhoneNumber(userId: number, verificationCode: string, expectedCode: string): Promise<boolean> {
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
    
    // Update the user's phone verification status
    await storage.updatePhoneNumber(userId, notificationPreference.phoneNumber!, true);
    
    console.log(`Phone number verified for user ${userId}`);
    return true;
    
  } catch (error) {
    console.error('Error verifying phone number:', error);
    return false;
  }
}

/**
 * Send a transaction notification
 * @param userId User ID to notify
 * @param transactionType Type of transaction (send/receive)
 * @param amount Amount involved
 * @param tokenSymbol Token symbol (BTC, ETH, etc.)
 * @returns Promise with message SID or null if failed
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
  
  return sendSmsNotification(userId, message);
}

/**
 * Send a security notification
 * @param userId User ID to notify
 * @param securityEvent Type of security event
 * @param details Additional details
 * @returns Promise with message SID or null if failed
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
  
  return sendSmsNotification(userId, message);
}

/**
 * Send a price alert notification
 * @param userId User ID to notify
 * @param tokenSymbol Token symbol (BTC, ETH, etc.)
 * @param price Current price
 * @param changePercent Percent change
 * @returns Promise with message SID or null if failed
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
  
  return sendSmsNotification(userId, message);
}

/**
 * Check if Twilio is properly configured
 * @returns Boolean indicating if Twilio is configured
 */
export function isTwilioConfigured(): boolean {
  return twilioClient !== null;
}