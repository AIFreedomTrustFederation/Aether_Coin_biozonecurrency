/**
 * CollaborationService: Manages real-time collaborative editing features
 * Handles user sessions, cursor positions, and synchronization of edits.
 */
import { db } from '../../db';
import { 
  collaborativeSessions, 
  collaborativeParticipants, 
  codeCommentThreads, 
  codeComments,
  InsertCollaborativeSession, 
  InsertCollaborativeParticipant, 
  InsertCodeCommentThread, 
  InsertCodeComment 
} from '../../../shared/dapp-schema';
import { eq, and, desc } from 'drizzle-orm';
import * as crypto from 'crypto';

// Define user cursor and presence data format
export interface UserPresence {
  userId: number;
  userName: string;
  color: string;
  cursor?: {
    fileId: number;
    line: number;
    column: number;
  };
  selection?: {
    fileId: number;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  lastActive: Date;
}

export class CollaborationService {
  // In-memory store of active collaborations for real-time updates
  // In a production application, this would use Redis or a similar service
  private activeCollaborations: Map<string, Set<WebSocket>> = new Map();
  private userPresence: Map<string, Map<number, UserPresence>> = new Map();
  
  /**
   * Creates a new collaborative session
   * @param data Session data
   * @returns Created session
   */
  async createSession(data: InsertCollaborativeSession) {
    // Generate a unique session token
    const sessionToken = this.generateSessionToken();
    
    const [session] = await db.insert(collaborativeSessions).values({
      ...data,
      sessionToken,
      status: 'active',
      createdAt: new Date()
    }).returning();
    
    // Add the creator as the first participant with owner role
    await db.insert(collaborativeParticipants).values({
      sessionId: session.id,
      userId: data.createdBy,
      role: 'owner',
      joinedAt: new Date(),
      lastActiveAt: new Date(),
      color: this.generateUserColor()
    });
    
    // Initialize in-memory tracking for this session
    this.activeCollaborations.set(sessionToken, new Set());
    this.userPresence.set(sessionToken, new Map());
    
    return session;
  }

  /**
   * Adds a participant to a session
   * @param sessionId Session ID
   * @param data Participant data
   * @returns Created participant record
   */
  async addParticipant(sessionId: number, data: Omit<InsertCollaborativeParticipant, 'sessionId'>) {
    // Check if participant already exists
    const existingParticipant = await db.select().from(collaborativeParticipants)
      .where(and(
        eq(collaborativeParticipants.sessionId, sessionId),
        eq(collaborativeParticipants.userId, data.userId)
      ));
    
    if (existingParticipant.length > 0) {
      // Update existing participant
      const [updated] = await db.update(collaborativeParticipants)
        .set({
          lastActiveAt: new Date(),
          role: data.role || existingParticipant[0].role
        })
        .where(and(
          eq(collaborativeParticipants.sessionId, sessionId),
          eq(collaborativeParticipants.userId, data.userId)
        ))
        .returning();
      
      return updated;
    } else {
      // Add new participant
      const [participant] = await db.insert(collaborativeParticipants).values({
        sessionId,
        userId: data.userId,
        role: data.role || 'viewer',
        joinedAt: new Date(),
        lastActiveAt: new Date(),
        color: data.color || this.generateUserColor()
      }).returning();
      
      return participant;
    }
  }

  /**
   * Retrieves all participants in a session
   * @param sessionId Session ID
   * @returns List of participants
   */
  async getSessionParticipants(sessionId: number) {
    return await db.select().from(collaborativeParticipants)
      .where(eq(collaborativeParticipants.sessionId, sessionId));
  }

  /**
   * Updates a participant's cursor position and activity timestamp
   * @param sessionToken Session token
   * @param userId User ID
   * @param cursorData Cursor position data
   */
  updateUserCursor(sessionToken: string, userId: number, cursorData: UserPresence) {
    // Update in-memory presence data
    if (!this.userPresence.has(sessionToken)) {
      this.userPresence.set(sessionToken, new Map());
    }
    
    const sessionPresence = this.userPresence.get(sessionToken)!;
    sessionPresence.set(userId, {
      ...cursorData,
      lastActive: new Date()
    });
    
    // Broadcast the cursor update to all connected clients
    this.broadcastToSession(sessionToken, {
      type: 'cursor_update',
      userId,
      cursor: cursorData
    });
    
    // Update the last active timestamp in the database
    db.update(collaborativeParticipants)
      .set({ 
        lastActiveAt: new Date(),
        cursor: cursorData
      })
      .where(and(
        eq(collaborativeParticipants.sessionId, this.getSessionIdFromToken(sessionToken)),
        eq(collaborativeParticipants.userId, userId)
      ))
      .execute()
      .catch(error => console.error('Failed to update participant activity:', error));
  }

  /**
   * Gets the current presence state for all users in a session
   * @param sessionToken Session token
   * @returns Map of user presences
   */
  getUsersPresence(sessionToken: string): Map<number, UserPresence> {
    return this.userPresence.get(sessionToken) || new Map();
  }

  /**
   * Registers a WebSocket connection for a session
   * @param sessionToken Session token
   * @param connection WebSocket connection
   */
  registerConnection(sessionToken: string, connection: WebSocket) {
    if (!this.activeCollaborations.has(sessionToken)) {
      this.activeCollaborations.set(sessionToken, new Set());
    }
    
    this.activeCollaborations.get(sessionToken)!.add(connection);
    
    // Send the current state to the new connection
    const presenceData = Array.from(this.getUsersPresence(sessionToken).values());
    connection.send(JSON.stringify({
      type: 'presence_state',
      users: presenceData
    }));
  }

  /**
   * Removes a WebSocket connection from a session
   * @param sessionToken Session token
   * @param connection WebSocket connection
   */
  removeConnection(sessionToken: string, connection: WebSocket) {
    if (this.activeCollaborations.has(sessionToken)) {
      this.activeCollaborations.get(sessionToken)!.delete(connection);
      
      // If no more connections for this session, clean up
      if (this.activeCollaborations.get(sessionToken)!.size === 0) {
        this.activeCollaborations.delete(sessionToken);
        this.userPresence.delete(sessionToken);
      }
    }
  }

  /**
   * Broadcasts a message to all connections in a session
   * @param sessionToken Session token
   * @param message Message to broadcast
   */
  broadcastToSession(sessionToken: string, message: any) {
    if (this.activeCollaborations.has(sessionToken)) {
      const connections = this.activeCollaborations.get(sessionToken)!;
      const messageStr = JSON.stringify(message);
      
      for (const connection of connections) {
        if (connection.readyState === WebSocket.OPEN) {
          connection.send(messageStr);
        }
      }
    }
  }

  /**
   * Creates a comment thread on code
   * @param data Comment thread data
   * @returns Created thread
   */
  async createCommentThread(data: InsertCodeCommentThread) {
    const [thread] = await db.insert(codeCommentThreads).values({
      ...data,
      status: 'open',
      createdAt: new Date()
    }).returning();
    
    return thread;
  }

  /**
   * Adds a comment to a thread
   * @param data Comment data
   * @returns Created comment
   */
  async addComment(data: InsertCodeComment) {
    const [comment] = await db.insert(codeComments).values({
      ...data,
      createdAt: new Date()
    }).returning();
    
    return comment;
  }

  /**
   * Gets all comments for a thread
   * @param threadId Thread ID
   * @returns List of comments
   */
  async getThreadComments(threadId: number) {
    return await db.select().from(codeComments)
      .where(eq(codeComments.threadId, threadId))
      .orderBy(codeComments.createdAt);
  }

  /**
   * Gets all comment threads for a file
   * @param fileId File ID
   * @returns List of threads with their comments
   */
  async getFileCommentThreads(fileId: number) {
    const threads = await db.select().from(codeCommentThreads)
      .where(eq(codeCommentThreads.fileId, fileId));
    
    // For each thread, get its comments
    const threadsWithComments = await Promise.all(
      threads.map(async thread => {
        const comments = await this.getThreadComments(thread.id);
        return {
          ...thread,
          comments
        };
      })
    );
    
    return threadsWithComments;
  }

  /**
   * Resolves a comment thread
   * @param threadId Thread ID
   * @param userId User ID resolving the thread
   * @returns Updated thread
   */
  async resolveThread(threadId: number, userId: number) {
    const [thread] = await db.update(codeCommentThreads)
      .set({
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: userId
      })
      .where(eq(codeCommentThreads.id, threadId))
      .returning();
    
    return thread;
  }

  /**
   * Ends a collaborative session
   * @param sessionId Session ID
   * @returns Updated session
   */
  async endSession(sessionId: number) {
    const [session] = await db.update(collaborativeSessions)
      .set({
        status: 'ended',
        endedAt: new Date()
      })
      .where(eq(collaborativeSessions.id, sessionId))
      .returning();
    
    // Get the session token to clean up in-memory data
    const sessionToken = session.sessionToken;
    
    // Clean up in-memory session data
    if (this.activeCollaborations.has(sessionToken)) {
      // Notify all clients that the session has ended
      this.broadcastToSession(sessionToken, {
        type: 'session_ended'
      });
      
      // Clean up resources
      this.activeCollaborations.delete(sessionToken);
      this.userPresence.delete(sessionToken);
    }
    
    return session;
  }

  /**
   * Utility: Generates a random session token
   * @returns Unique session token
   */
  private generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Utility: Generates a random color for a user
   * @returns CSS-compatible color string
   */
  private generateUserColor(): string {
    // Generate pastel colors for better visibility
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 70%)`;
  }

  /**
   * Utility: Gets the session ID from a token
   * This is a placeholder implementation - in reality, we would look up the session
   * @param token Session token
   * @returns Session ID
   */
  private getSessionIdFromToken(token: string): number {
    // In a real implementation, we would query the database
    // For now, we'll just return a dummy value
    return 1;
  }
}

export const collaborationService = new CollaborationService();