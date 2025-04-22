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
Object.defineProperty(exports, "__esModule", { value: true });
exports.collaborationService = exports.CollaborationService = void 0;
/**
 * CollaborationService: Manages real-time collaborative editing features
 * Handles user sessions, cursor positions, and synchronization of edits.
 */
const db_1 = require("../../db");
const dapp_schema_1 = require("../../../shared/dapp-schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto = __importStar(require("crypto"));
class CollaborationService {
    constructor() {
        // In-memory store of active collaborations for real-time updates
        // In a production application, this would use Redis or a similar service
        this.activeCollaborations = new Map();
        this.userPresence = new Map();
    }
    /**
     * Creates a new collaborative session
     * @param data Session data
     * @returns Created session
     */
    async createSession(data) {
        // Generate a unique session token
        const sessionToken = this.generateSessionToken();
        const [session] = await db_1.db.insert(dapp_schema_1.collaborativeSessions).values({
            ...data,
            sessionToken,
            status: 'active',
            createdAt: new Date()
        }).returning();
        // Add the creator as the first participant with owner role
        await db_1.db.insert(dapp_schema_1.collaborativeParticipants).values({
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
    async addParticipant(sessionId, data) {
        // Check if participant already exists
        const existingParticipant = await db_1.db.select().from(dapp_schema_1.collaborativeParticipants)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.collaborativeParticipants.sessionId, sessionId), (0, drizzle_orm_1.eq)(dapp_schema_1.collaborativeParticipants.userId, data.userId)));
        if (existingParticipant.length > 0) {
            // Update existing participant
            const [updated] = await db_1.db.update(dapp_schema_1.collaborativeParticipants)
                .set({
                lastActiveAt: new Date(),
                role: data.role || existingParticipant[0].role
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.collaborativeParticipants.sessionId, sessionId), (0, drizzle_orm_1.eq)(dapp_schema_1.collaborativeParticipants.userId, data.userId)))
                .returning();
            return updated;
        }
        else {
            // Add new participant
            const [participant] = await db_1.db.insert(dapp_schema_1.collaborativeParticipants).values({
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
    async getSessionParticipants(sessionId) {
        return await db_1.db.select().from(dapp_schema_1.collaborativeParticipants)
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.collaborativeParticipants.sessionId, sessionId));
    }
    /**
     * Updates a participant's cursor position and activity timestamp
     * @param sessionToken Session token
     * @param userId User ID
     * @param cursorData Cursor position data
     */
    updateUserCursor(sessionToken, userId, cursorData) {
        // Update in-memory presence data
        if (!this.userPresence.has(sessionToken)) {
            this.userPresence.set(sessionToken, new Map());
        }
        const sessionPresence = this.userPresence.get(sessionToken);
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
        db_1.db.update(dapp_schema_1.collaborativeParticipants)
            .set({
            lastActiveAt: new Date(),
            cursor: cursorData
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.collaborativeParticipants.sessionId, this.getSessionIdFromToken(sessionToken)), (0, drizzle_orm_1.eq)(dapp_schema_1.collaborativeParticipants.userId, userId)))
            .execute()
            .catch(error => console.error('Failed to update participant activity:', error));
    }
    /**
     * Gets the current presence state for all users in a session
     * @param sessionToken Session token
     * @returns Map of user presences
     */
    getUsersPresence(sessionToken) {
        return this.userPresence.get(sessionToken) || new Map();
    }
    /**
     * Registers a WebSocket connection for a session
     * @param sessionToken Session token
     * @param connection WebSocket connection
     */
    registerConnection(sessionToken, connection) {
        if (!this.activeCollaborations.has(sessionToken)) {
            this.activeCollaborations.set(sessionToken, new Set());
        }
        this.activeCollaborations.get(sessionToken).add(connection);
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
    removeConnection(sessionToken, connection) {
        if (this.activeCollaborations.has(sessionToken)) {
            this.activeCollaborations.get(sessionToken).delete(connection);
            // If no more connections for this session, clean up
            if (this.activeCollaborations.get(sessionToken).size === 0) {
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
    broadcastToSession(sessionToken, message) {
        if (this.activeCollaborations.has(sessionToken)) {
            const connections = this.activeCollaborations.get(sessionToken);
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
    async createCommentThread(data) {
        const [thread] = await db_1.db.insert(dapp_schema_1.codeCommentThreads).values({
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
    async addComment(data) {
        const [comment] = await db_1.db.insert(dapp_schema_1.codeComments).values({
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
    async getThreadComments(threadId) {
        return await db_1.db.select().from(dapp_schema_1.codeComments)
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.codeComments.threadId, threadId))
            .orderBy(dapp_schema_1.codeComments.createdAt);
    }
    /**
     * Gets all comment threads for a file
     * @param fileId File ID
     * @returns List of threads with their comments
     */
    async getFileCommentThreads(fileId) {
        const threads = await db_1.db.select().from(dapp_schema_1.codeCommentThreads)
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.codeCommentThreads.fileId, fileId));
        // For each thread, get its comments
        const threadsWithComments = await Promise.all(threads.map(async (thread) => {
            const comments = await this.getThreadComments(thread.id);
            return {
                ...thread,
                comments
            };
        }));
        return threadsWithComments;
    }
    /**
     * Resolves a comment thread
     * @param threadId Thread ID
     * @param userId User ID resolving the thread
     * @returns Updated thread
     */
    async resolveThread(threadId, userId) {
        const [thread] = await db_1.db.update(dapp_schema_1.codeCommentThreads)
            .set({
            status: 'resolved',
            resolvedAt: new Date(),
            resolvedBy: userId
        })
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.codeCommentThreads.id, threadId))
            .returning();
        return thread;
    }
    /**
     * Ends a collaborative session
     * @param sessionId Session ID
     * @returns Updated session
     */
    async endSession(sessionId) {
        const [session] = await db_1.db.update(dapp_schema_1.collaborativeSessions)
            .set({
            status: 'ended',
            endedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(dapp_schema_1.collaborativeSessions.id, sessionId))
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
    generateSessionToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    /**
     * Utility: Generates a random color for a user
     * @returns CSS-compatible color string
     */
    generateUserColor() {
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
    getSessionIdFromToken(token) {
        // In a real implementation, we would query the database
        // For now, we'll just return a dummy value
        return 1;
    }
}
exports.CollaborationService = CollaborationService;
exports.collaborationService = new CollaborationService();
