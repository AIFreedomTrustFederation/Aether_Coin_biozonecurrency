"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matrixService = exports.MatrixService = void 0;
const sdk = __importStar(require("matrix-js-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
const storage_1 = require("../storage");
dotenv_1.default.config();
const MATRIX_HOME_SERVER = process.env.MATRIX_HOME_SERVER || 'https://matrix.org';
const MATRIX_USER = process.env.MATRIX_USER || '';
const MATRIX_PASSWORD = process.env.MATRIX_PASSWORD || '';
const MATRIX_ACCESS_TOKEN = process.env.MATRIX_ACCESS_TOKEN || '';
/**
 * Matrix Service for secure, open-source notifications
 * Uses matrix-js-sdk for integration with Matrix open messaging protocol
 */
class MatrixService {
    constructor() {
        this.client = null;
        this.isInitialized = false;
        this.roomsByUser = {};
    }
    /**
     * Initialize the Matrix client
     * @returns Promise that resolves when client is initialized
     */
    async initialize() {
        // If already initialized, return
        if (this.isInitialized)
            return;
        try {
            if (MATRIX_ACCESS_TOKEN) {
                // Initialize with access token
                this.client = sdk.createClient({
                    baseUrl: MATRIX_HOME_SERVER,
                    accessToken: MATRIX_ACCESS_TOKEN,
                    userId: MATRIX_USER,
                });
            }
            else if (MATRIX_USER && MATRIX_PASSWORD) {
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
            }
            else {
                console.warn('Matrix credentials not provided. Notifications disabled.');
                return;
            }
            // Start client
            await this.client.startClient({ initialSyncLimit: 10 });
            // Set up event listeners
            this.client.on("Room.timeline", (event, room) => {
                // Handle incoming messages if needed
            });
            // Mark as initialized
            this.isInitialized = true;
            console.log('Matrix client initialized successfully');
        }
        catch (error) {
            console.error('Error initializing Matrix client:', error);
            this.client = null;
        }
    }
    /**
     * Get or create direct message room with a user
     * @param matrixId Matrix ID (e.g., @user:matrix.org)
     * @returns Room ID
     */
    async getOrCreateDirectRoom(matrixId) {
        if (!this.isInitialized || !this.client) {
            await this.initialize();
            if (!this.client)
                throw new Error('Matrix client not initialized');
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
                preset: 'trusted_private_chat',
                invite: [matrixId],
                is_direct: true,
            });
            this.roomsByUser[matrixId] = response.room_id;
            return response.room_id;
        }
        catch (error) {
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
    async sendNotification(matrixId, message, htmlMessage) {
        if (!this.isInitialized || !this.client) {
            await this.initialize();
            if (!this.client)
                throw new Error('Matrix client not initialized');
        }
        try {
            // Get or create room
            const roomId = await this.getOrCreateDirectRoom(matrixId);
            // Send message
            const content = {
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
        }
        catch (error) {
            console.error(`Error sending notification to ${matrixId}:`, error);
            throw error;
        }
    }
    /**
     * Verify if a Matrix ID exists and is valid
     * @param matrixId Matrix ID to verify
     * @returns Boolean indicating if the ID is valid
     */
    async verifyMatrixId(matrixId) {
        if (!this.client) {
            await this.initialize();
            if (!this.client)
                throw new Error('Matrix client not initialized');
        }
        try {
            // Try to search for user
            const searchResult = await this.client.searchUserDirectory({
                term: matrixId,
            });
            // Check if user exists in results
            return searchResult.results.some(user => user.user_id === matrixId);
        }
        catch (error) {
            console.error(`Error verifying Matrix ID ${matrixId}:`, error);
            return false;
        }
    }
    /**
     * Stop the Matrix client
     */
    stopClient() {
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
    isMatrixConfigured() {
        return this.client !== null || !!(MATRIX_USER && (MATRIX_PASSWORD || MATRIX_ACCESS_TOKEN));
    }
    /**
     * Send notification to a user by userId
     * @param userId User ID to send notification to
     * @param message Message content
     * @param htmlMessage Optional HTML-formatted message
     * @returns Event ID of sent message or null if failed
     */
    async sendUserNotification(userId, message, htmlMessage) {
        try {
            // Get user's notification preferences
            const notificationPreference = await storage_1.storage.getNotificationPreferenceByUserId(userId);
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
            const eventId = await this.sendNotification(notificationPreference.matrixId, message, htmlMessage);
            console.log(`Matrix notification sent to user ${userId}, event ID: ${eventId}`);
            return eventId;
        }
        catch (error) {
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
    async sendTransactionNotification(userId, transactionType, amount, tokenSymbol) {
        const notificationPreference = await storage_1.storage.getNotificationPreferenceByUserId(userId);
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
    async sendSecurityNotification(userId, securityEvent, details) {
        const notificationPreference = await storage_1.storage.getNotificationPreferenceByUserId(userId);
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
    async sendPriceAlertNotification(userId, tokenSymbol, price, changePercent) {
        const notificationPreference = await storage_1.storage.getNotificationPreferenceByUserId(userId);
        if (!notificationPreference?.priceAlerts) {
            return null; // Price alerts disabled
        }
        const direction = parseFloat(changePercent) >= 0 ? 'up' : 'down';
        const message = `Aetherion Wallet PRICE ALERT: ${tokenSymbol} is ${direction} ${Math.abs(parseFloat(changePercent))}% at $${price}.`;
        const htmlMessage = `<b>Aetherion Wallet PRICE ALERT</b>: ${tokenSymbol} is ${direction} <span style="color:${parseFloat(changePercent) >= 0 ? 'green' : 'red'}">${Math.abs(parseFloat(changePercent))}%</span> at $${price}.`;
        return this.sendUserNotification(userId, message, htmlMessage);
    }
}
exports.MatrixService = MatrixService;
// Singleton instance
exports.matrixService = new MatrixService();
// Initialize on startup
exports.matrixService.initialize().catch(err => {
    console.error('Failed to initialize Matrix service on startup:', err);
});
exports.default = exports.matrixService;
