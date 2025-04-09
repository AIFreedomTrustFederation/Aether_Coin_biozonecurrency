import { SDK } from 'matrix-js-sdk';
import { StorageWrapper } from '../storage';
import { randomBytes, createHash } from 'crypto';

/**
 * MatrixService provides integration with Matrix protocol for secure messaging
 * This service enables decentralized communication and room management
 * for the Mysterion LLM system
 */
class MatrixService {
  private storageWrapper: StorageWrapper;
  private matrixClient: any = null;
  private baseUrl: string;
  private isInitialized: boolean = false;
  private simulationMode: boolean = false;

  constructor(storageWrapper: StorageWrapper) {
    this.storageWrapper = storageWrapper;
    this.baseUrl = process.env.MATRIX_HOME_SERVER || 'https://matrix.aifreedomtrust.com';
    
    // Check if we have the required environment variables
    if (!process.env.MATRIX_USER_ID || !process.env.MATRIX_ACCESS_TOKEN) {
      console.log('Matrix credentials not provided. Running in simulation mode.');
      this.simulationMode = true;
    }

    this.initialize();
  }

  /**
   * Initialize the Matrix client
   */
  private async initialize() {
    try {
      if (this.simulationMode) {
        console.log('Matrix service running in simulation mode');
        this.isInitialized = true;
        return;
      }

      // Initialize the Matrix client with credentials
      this.matrixClient = SDK.createClient({
        baseUrl: this.baseUrl,
        userId: process.env.MATRIX_USER_ID,
        accessToken: process.env.MATRIX_ACCESS_TOKEN,
      });

      // Start the client
      await this.matrixClient.startClient({ initialSyncLimit: 10 });
      
      // Wait for the client to be ready
      await new Promise<void>((resolve) => {
        const onSync = (state: string) => {
          if (state === 'PREPARED') {
            this.matrixClient.removeListener('sync', onSync);
            resolve();
          }
        };
        this.matrixClient.on('sync', onSync);
      });

      this.isInitialized = true;
      console.log('Matrix service initialized successfully');
    } catch (error) {
      console.error('Error initializing Matrix service:', error);
      this.simulationMode = true;
      this.isInitialized = true; // Set to true even in simulation mode to prevent hanging
    }
  }

  /**
   * Wait for the service to be initialized
   */
  private async waitForInitialization() {
    if (this.isInitialized) return;
    
    // Wait for initialization with a timeout
    const timeout = 30000; // 30 seconds
    const start = Date.now();
    
    while (!this.isInitialized && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!this.isInitialized) {
      throw new Error('Matrix service initialization timed out');
    }
  }

  /**
   * Create a new room for collaboration
   * @param name Room name
   * @param topic Room topic
   * @param isPrivate Whether the room is private
   * @returns Room ID
   */
  async createRoom(name: string, topic: string, isPrivate: boolean = true): Promise<string> {
    await this.waitForInitialization();
    
    if (this.simulationMode) {
      // Generate a simulated room ID
      const randomId = randomBytes(16).toString('hex');
      return `!${randomId}:aifreedomtrust.com`;
    }
    
    try {
      const response = await this.matrixClient.createRoom({
        name,
        topic,
        visibility: isPrivate ? 'private' : 'public',
        preset: isPrivate ? 'private_chat' : 'public_chat',
      });
      
      return response.room_id;
    } catch (error) {
      console.error('Error creating Matrix room:', error);
      throw new Error('Failed to create Matrix room');
    }
  }

  /**
   * Create or get a direct message room with a user
   * @param userId Matrix user ID to start a DM with
   * @returns Room ID
   */
  async createDirectMessageRoom(userId: string): Promise<string> {
    await this.waitForInitialization();
    
    if (this.simulationMode) {
      // Generate a simulated room ID
      const randomId = randomBytes(16).toString('hex');
      return `!${randomId}:aifreedomtrust.com`;
    }
    
    try {
      // Check if we already have a DM room with this user
      const dmRooms = this.matrixClient.getDMRooms();
      const existingRoom = dmRooms.find((roomId: string) => {
        const room = this.matrixClient.getRoom(roomId);
        return room.getMember(userId)?.membership === 'join';
      });
      
      if (existingRoom) {
        return existingRoom;
      }
      
      // Create a new DM room
      const response = await this.matrixClient.createRoom({
        preset: 'trusted_private_chat',
        invite: [userId],
        is_direct: true,
      });
      
      return response.room_id;
    } catch (error) {
      console.error('Error creating Matrix DM room:', error);
      throw new Error('Failed to create Matrix DM room');
    }
  }

  /**
   * Invite a user to a room
   * @param roomId Room ID
   * @param userId User ID to invite
   */
  async inviteToRoom(roomId: string, userId: string): Promise<void> {
    await this.waitForInitialization();
    
    if (this.simulationMode) {
      return;
    }
    
    try {
      await this.matrixClient.invite(roomId, userId);
    } catch (error) {
      console.error('Error inviting user to Matrix room:', error);
      throw new Error('Failed to invite user to Matrix room');
    }
  }

  /**
   * Send a message to a room
   * @param roomId Room ID
   * @param message Message to send
   * @returns Event ID of the sent message
   */
  async sendMessage(roomId: string, message: string): Promise<string> {
    await this.waitForInitialization();
    
    if (this.simulationMode) {
      // Generate a simulated event ID
      const randomId = randomBytes(16).toString('hex');
      return `$${randomId}:aifreedomtrust.com`;
    }
    
    try {
      const response = await this.matrixClient.sendMessage(roomId, {
        msgtype: 'm.room.message',
        body: message,
      });
      
      return response.event_id;
    } catch (error) {
      console.error('Error sending Matrix message:', error);
      throw new Error('Failed to send Matrix message');
    }
  }

  /**
   * Check if a user account exists
   * @param userId Matrix user ID
   * @returns True if the user exists
   */
  async userExists(userId: string): Promise<boolean> {
    await this.waitForInitialization();
    
    if (this.simulationMode) {
      // In simulation mode, assume the user exists if it has a valid format
      return userId.match(/@[\w.-]+:\w+\.\w+/) !== null;
    }
    
    try {
      await this.matrixClient.getProfileInfo(userId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a dedicated room for a project
   * @param projectName Project name
   * @param users User IDs to invite to the room
   * @returns Room ID
   */
  async createProjectRoom(projectName: string, description: string, users: string[] = []): Promise<string> {
    await this.waitForInitialization();
    
    const roomId = await this.createRoom(
      `${projectName} - Aetherion Project`,
      description || `Collaboration space for ${projectName}`,
      true
    );
    
    if (!this.simulationMode && users.length > 0) {
      for (const userId of users) {
        try {
          await this.inviteToRoom(roomId, userId);
        } catch (error) {
          // Log error but continue with other invites
          console.error(`Error inviting ${userId} to room ${roomId}:`, error);
        }
      }
    }
    
    return roomId;
  }

  /**
   * Bootstrap a room with Mysterion integration
   * This sets up a room that is ready for LLM-assisted collaboration
   * @param roomName Name of the room
   * @param purpose Purpose of the room (for LLM context)
   * @param participants Array of Matrix user IDs to invite
   * @returns Room ID and access details
   */
  async bootstrapMysterionRoom(
    roomName: string, 
    purpose: string,
    participants: string[] = []
  ): Promise<{roomId: string, accessUrl: string}> {
    await this.waitForInitialization();
    
    // Create the room
    const roomId = await this.createRoom(
      `${roomName} [Mysterion-Assisted]`,
      purpose,
      true
    );
    
    // Send initial setup message
    await this.sendMessage(roomId, 
      `# Welcome to ${roomName}\n\n` +
      `This room is configured with Mysterion LLM integration for enhanced collaboration.\n\n` +
      `## Purpose\n${purpose}\n\n` +
      `## Guidelines\n` +
      `- Use @Mysterion to interact with the AI assistant\n` +
      `- Share code and ideas for real-time feedback\n` +
      `- Collaborative editing is enabled for all members\n\n` +
      `The Mysterion AI is now active and ready to assist.`
    );
    
    // Invite participants
    if (!this.simulationMode && participants.length > 0) {
      for (const userId of participants) {
        try {
          await this.inviteToRoom(roomId, userId);
        } catch (error) {
          console.error(`Error inviting ${userId} to Mysterion room:`, error);
        }
      }
    }
    
    // Also invite the Mysterion bot if we're not in simulation mode
    if (!this.simulationMode && process.env.MYSTERION_MATRIX_ID) {
      try {
        await this.inviteToRoom(roomId, process.env.MYSTERION_MATRIX_ID);
      } catch (error) {
        console.error(`Error inviting Mysterion bot to room:`, error);
      }
    }
    
    // Generate access URL
    const accessUrl = this.simulationMode 
      ? `https://matrix.aifreedomtrust.com/#/room/${encodeURIComponent(roomId)}` 
      : `${this.baseUrl}/#/room/${encodeURIComponent(roomId)}`;
    
    return {
      roomId,
      accessUrl
    };
  }

  /**
   * Get the status of the Matrix service
   * @returns Status object
   */
  getStatus(): { isInitialized: boolean, simulationMode: boolean, baseUrl: string } {
    return {
      isInitialized: this.isInitialized,
      simulationMode: this.simulationMode,
      baseUrl: this.baseUrl
    };
  }
}

export default MatrixService;