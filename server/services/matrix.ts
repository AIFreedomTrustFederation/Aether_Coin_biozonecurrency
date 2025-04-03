import * as sdk from 'matrix-js-sdk';
import dotenv from 'dotenv';

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
}

// Singleton instance
export const matrixService = new MatrixService();

export default matrixService;