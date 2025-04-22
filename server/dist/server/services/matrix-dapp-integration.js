"use strict";
/**
 * Matrix DApp Builder Integration Service
 *
 * This service extends the Matrix communication service to integrate with the DApp Builder,
 * enabling collaborative development, notifications about DApp updates, and
 * secure communication for DApp developers.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.matrixDappIntegration = exports.MatrixDappIntegrationService = void 0;
const db_1 = require("../db");
const dapp_schema_1 = require("../../shared/dapp-schema");
const drizzle_orm_1 = require("drizzle-orm");
const matrix_integration_1 = require("./matrix-integration");
/**
 * Matrix DApp Builder Integration Service
 * Manages secure communication channels for DApp developers
 */
class MatrixDappIntegrationService {
    constructor() {
        this.collaborationRooms = new Map();
    }
    /**
     * Creates a new collaboration room for a DApp
     * @param dappId DApp ID
     * @param ownerId Owner user ID
     * @param collaboratorIds IDs of initial collaborators
     * @returns The created room details
     */
    async createDappCollaborationRoom(dappId, ownerId, collaboratorIds = []) {
        try {
            // Get DApp details
            const dapp = await db_1.db.select().from(dapp_schema_1.userDapps).where((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.id, dappId));
            if (!dapp.length) {
                throw new Error('DApp not found');
            }
            // Create list of all collaborators including owner
            const allCollaborators = [ownerId, ...collaboratorIds.filter(id => id !== ownerId)];
            // Create room name
            const roomName = `DApp: ${dapp[0].name} [${dappId}]`;
            // Create a simulated Matrix room ID
            // In a real implementation, this would create an actual Matrix room
            const roomId = `!dapp_${dappId}_${Date.now()}:aetherion.org`;
            // Store room details
            const collaborationRoom = {
                roomId,
                dappId,
                name: roomName,
                collaborators: allCollaborators
            };
            // Store in our in-memory map
            this.collaborationRooms.set(dappId, collaborationRoom);
            // Use the Matrix service to send a welcome message
            await matrix_integration_1.matrixCommunication.sendSystemMessage({
                roomId,
                userId: 0, // System user
                content: `Welcome to the collaboration room for DApp: ${dapp[0].name}. This is a secure channel for communication regarding development.`,
                messageType: 'system',
                metadata: {
                    dapp: {
                        id: dappId,
                        name: dapp[0].name
                    }
                }
            });
            return collaborationRoom;
        }
        catch (error) {
            console.error('Failed to create DApp collaboration room:', error);
            return null;
        }
    }
    /**
     * Sends a notification about a DApp update
     * @param dappId DApp ID
     * @param versionId Version ID
     * @param userId User who made the update
     * @param message Update message
     * @returns Success status
     */
    async sendDappUpdateNotification(dappId, versionId, userId, message) {
        try {
            // Get the collaboration room
            let room = this.collaborationRooms.get(dappId);
            // If room doesn't exist, create it
            if (!room) {
                const dapp = await db_1.db.select().from(dapp_schema_1.userDapps).where((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.id, dappId));
                if (!dapp.length) {
                    throw new Error('DApp not found');
                }
                room = await this.createDappCollaborationRoom(dappId, dapp[0].userId);
                if (!room) {
                    throw new Error('Failed to create collaboration room');
                }
            }
            // Get version details
            const versions = await db_1.db.select().from(dapp_schema_1.dappVersions).where((0, drizzle_orm_1.eq)(dapp_schema_1.dappVersions.id, versionId));
            const version = versions.length ? versions[0] : null;
            // Send notification through Matrix
            await matrix_integration_1.matrixCommunication.sendMessage({
                roomId: room.roomId,
                userId,
                content: message,
                messageType: 'dapp_update',
                metadata: {
                    dappId,
                    versionId,
                    version: version?.version,
                    timestamp: new Date().toISOString()
                }
            });
            return true;
        }
        catch (error) {
            console.error('Failed to send DApp update notification:', error);
            return false;
        }
    }
    /**
     * Sends a notification about a new code comment
     * @param commentThreadId Comment thread ID
     * @returns Success status
     */
    async sendCodeCommentNotification(commentThreadId) {
        try {
            // Get the comment thread
            const thread = await db_1.db.query.codeCommentThreads.findFirst({
                where: (0, drizzle_orm_1.eq)(dapp_schema_1.codeCommentThreads.id, commentThreadId),
                with: {
                    comments: {
                        orderBy: (fields, { asc }) => [asc(fields.createdAt)],
                        limit: 1
                    }
                }
            });
            if (!thread || !thread.comments.length) {
                throw new Error('Comment thread not found');
            }
            // Get the file and DApp
            const file = await db_1.db.query.dappFiles.findFirst({
                where: (0, drizzle_orm_1.eq)(dapp_schema_1.codeCommentThreads.fileId, thread.fileId),
                with: {
                    dapp: true
                }
            });
            if (!file) {
                throw new Error('File not found');
            }
            const dappId = file.userDappId;
            // Get the collaboration room
            let room = this.collaborationRooms.get(dappId);
            // If room doesn't exist, create it
            if (!room) {
                room = await this.createDappCollaborationRoom(dappId, file.dapp.userId);
                if (!room) {
                    throw new Error('Failed to create collaboration room');
                }
            }
            // Create message content
            const comment = thread.comments[0];
            const location = `${file.fileName}:${thread.startLine}-${thread.endLine}`;
            const content = `New comment by User ${comment.userId} at ${location}: ${comment.content}`;
            // Send notification through Matrix
            await matrix_integration_1.matrixCommunication.sendMessage({
                roomId: room.roomId,
                userId: comment.userId,
                content,
                messageType: 'code_comment',
                metadata: {
                    threadId: commentThreadId,
                    fileId: thread.fileId,
                    fileName: file.fileName,
                    location: {
                        startLine: thread.startLine,
                        endLine: thread.endLine
                    }
                }
            });
            return true;
        }
        catch (error) {
            console.error('Failed to send code comment notification:', error);
            return false;
        }
    }
    /**
     * Sends a notification about a collaborative session
     * @param sessionId Collaborative session ID
     * @param eventType Event type (started, joined, ended)
     * @param userId User who triggered the event
     * @returns Success status
     */
    async sendCollaborationSessionEvent(sessionId, eventType, userId) {
        try {
            // Get session details
            const session = await db_1.db.query.collaborativeSessions.findFirst({
                where: (0, drizzle_orm_1.eq)(dapp_schema_1.collaborativeSessions.id, sessionId)
            });
            if (!session) {
                throw new Error('Session not found');
            }
            const dappId = session.userDappId;
            // Get the collaboration room
            let room = this.collaborationRooms.get(dappId);
            // If room doesn't exist, create it
            if (!room) {
                room = await this.createDappCollaborationRoom(dappId, session.createdBy);
                if (!room) {
                    throw new Error('Failed to create collaboration room');
                }
            }
            // Create message content based on event type
            let content = '';
            switch (eventType) {
                case 'started':
                    content = `User ${userId} started a new collaborative editing session`;
                    break;
                case 'joined':
                    content = `User ${userId} joined the collaborative editing session`;
                    break;
                case 'ended':
                    content = `User ${userId} ended the collaborative editing session`;
                    break;
            }
            // Send notification through Matrix
            await matrix_integration_1.matrixCommunication.sendMessage({
                roomId: room.roomId,
                userId,
                content,
                messageType: 'collaboration_event',
                metadata: {
                    sessionId,
                    eventType,
                    timestamp: new Date().toISOString()
                }
            });
            return true;
        }
        catch (error) {
            console.error('Failed to send collaboration session event:', error);
            return false;
        }
    }
    /**
     * Sends a notification about a deployment event
     * @param dappId DApp ID
     * @param deploymentId Deployment ID
     * @param userId User who triggered the deployment
     * @param status Deployment status
     * @param network Network deployed to
     * @returns Success status
     */
    async sendDeploymentNotification(dappId, deploymentId, userId, status, network) {
        try {
            // Get the collaboration room
            let room = this.collaborationRooms.get(dappId);
            // If room doesn't exist, create it
            if (!room) {
                const dapp = await db_1.db.select().from(dapp_schema_1.userDapps).where((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.id, dappId));
                if (!dapp.length) {
                    throw new Error('DApp not found');
                }
                room = await this.createDappCollaborationRoom(dappId, dapp[0].userId);
                if (!room) {
                    throw new Error('Failed to create collaboration room');
                }
            }
            // Create message content based on status
            let content = '';
            switch (status) {
                case 'started':
                    content = `User ${userId} started deployment to ${network}`;
                    break;
                case 'success':
                    content = `Deployment to ${network} by User ${userId} was successful`;
                    break;
                case 'failed':
                    content = `Deployment to ${network} by User ${userId} failed`;
                    break;
            }
            // Send notification through Matrix
            await matrix_integration_1.matrixCommunication.sendMessage({
                roomId: room.roomId,
                userId,
                content,
                messageType: 'deployment_event',
                metadata: {
                    dappId,
                    deploymentId,
                    status,
                    network,
                    timestamp: new Date().toISOString()
                }
            });
            return true;
        }
        catch (error) {
            console.error('Failed to send deployment notification:', error);
            return false;
        }
    }
}
exports.MatrixDappIntegrationService = MatrixDappIntegrationService;
// Singleton instance
exports.matrixDappIntegration = new MatrixDappIntegrationService();
