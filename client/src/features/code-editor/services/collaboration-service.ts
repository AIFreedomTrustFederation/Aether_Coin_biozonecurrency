/**
 * Collaboration Service
 * 
 * Provides WebSocket-based real-time collaboration for the Codester IDE.
 * Features:
 * - Real-time code editing
 * - Cursor position tracking
 * - Chat messaging
 * - Session management
 */

// Types
export interface User {
  id: string;
  name: string;
  color: string;
  isAdmin: boolean;
}

export type CollaborationEventType =
  | 'connected'
  | 'disconnected'
  | 'session_created'
  | 'session_joined'
  | 'user_joined'
  | 'user_left'
  | 'cursor'
  | 'edit'
  | 'chat'
  | 'file_update'
  | 'error'
  | 'ack'
  | 'session_expired';

export interface CollaborationSession {
  sessionId: string;
  sessionName: string;
  users: User[];
  files: { id: string; name: string; content: string; language: string }[];
}

export interface CursorPosition {
  line: number;
  column: number;
}

export interface TextChange {
  range: { start: number; end: number };
  text: string;
}

export interface ChatMessage {
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

// Event Handlers
export interface CollaborationEventHandlers {
  onConnected?: (userId: string) => void;
  onDisconnected?: () => void;
  onSessionCreated?: (session: { sessionId: string; name: string }) => void;
  onSessionJoined?: (session: CollaborationSession) => void;
  onUserJoined?: (user: User) => void;
  onUserLeft?: (userId: string) => void;
  onCursorUpdate?: (userId: string, position: CursorPosition) => void;
  onEdit?: (userId: string, fileId: string, changes: TextChange, version: number) => void;
  onChat?: (message: ChatMessage) => void;
  onFileUpdate?: (fileId: string, content: string, version: number) => void;
  onError?: (message: string) => void;
  onSessionExpired?: () => void;
}

/**
 * Collaboration service for real-time code editing
 */
export class CollaborationService {
  private static instance: CollaborationService;

  private ws!: WebSocket;
  private userId!: string;
  private sessionId!: string;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private heartbeatInterval: number | null = null;
  private handlers: CollaborationEventHandlers = {};
  private metrics = {
    messagesSent: 0,
    messagesReceived: 0,
    connectionDuration: 0,
  };

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance of the CollaborationService
   */
  public static getInstance(): CollaborationService {
    if (!this.instance) {
      this.instance = new CollaborationService();
    }
    return this.instance;
  }

  /**
   * Connect to the collaboration server
   * @param url WebSocket server URL
   * @param authToken Authentication token
   */
  connect(url: string, authToken: string): void {
    this.ws = new WebSocket(`${url}?token=${authToken}`);

    const startTime = Date.now();

    this.ws.onopen = () => {
      console.log('Connected to collaboration server');
      this.startHeartbeat();
      this.metrics.connectionDuration = Date.now() - startTime;
    };

    this.ws.onclose = () => {
      console.log('Disconnected from collaboration server');
      this.stopHeartbeat();
      this.attemptReconnect(url, authToken);
    };

    this.ws.onerror = (error: Event) => {
      this.handleWebSocketError(error);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        this.metrics.messagesReceived++;
        this.handleMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }

  /**
   * Disconnect from the collaboration server
   */
  disconnect(): void {
    this.clearReconnectTimeout();
    this.stopHeartbeat();

    if (this.ws) {
      if (this.sessionId) {
        this.leaveSession();
      }

      this.ws.close();
      this.ws = null!;
    }
  }

  /**
   * Set event handlers for collaboration events
   * @param handlers Event handlers
   */
  setEventHandlers(handlers: CollaborationEventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  // Session Management
  createSession(name: string, userName: string): void {
    this.sendMessage('create_session', { name, userName });
  }

  joinSession(sessionId: string, userName: string): void {
    this.sessionId = sessionId;
    this.sendMessage('join', { sessionId, userName });
  }

  leaveSession(): void {
    if (this.sessionId) {
      this.sendMessage('leave', { sessionId: this.sessionId });
      this.sessionId = null!;
    }
  }

  // Messaging
  updateCursor(position: CursorPosition): void {
    this.sendMessage('cursor', { sessionId: this.sessionId, position });
  }

  sendChanges(fileId: string, changes: TextChange, version: number): void {
    this.sendMessage('edit', { sessionId: this.sessionId, fileId, changes, version });
  }

  sendChatMessage(message: string): void {
    this.sendMessage('chat', { sessionId: this.sessionId, message });
  }

  synchronizeFile(fileId: string, content: string): void {
    this.sendMessage('file_sync', { sessionId: this.sessionId, fileId, content });
  }

  broadcastEvent(eventType: string, payload: Record<string, any>): void {
    this.sendMessage('broadcast', { sessionId: this.sessionId, eventType, ...payload });
  }

  // Private Helpers
  private sendMessage(type: string, payload: Record<string, any>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...payload }));
      this.metrics.messagesSent++;
    } else {
      console.warn(`WebSocket is not open. Cannot send message of type: ${type}`);
    }
  }

  private handleMessage(data: any): void {
    switch (data.type) {
      case 'connected':
        this.handlers.onConnected?.(data.userId);
        break;
      case 'session_created':
        this.sessionId = data.sessionId;
        this.handlers.onSessionCreated?.({ sessionId: data.sessionId, name: data.name });
        break;
      case 'session_joined':
        this.handlers.onSessionJoined?.({
          sessionId: data.sessionId,
          sessionName: data.name,
          users: data.users,
          files: data.files,
        });
        break;
      case 'user_joined':
        this.handlers.onUserJoined?.(data.user);
        break;
      case 'user_left':
        this.handlers.onUserLeft?.(data.userId);
        break;
      case 'cursor':
        this.handlers.onCursorUpdate?.(data.userId, data.position);
        break;
      case 'edit':
        this.handlers.onEdit?.(data.userId, data.fileId, data.changes, data.version);
        break;
      case 'chat':
        this.handlers.onChat?.(data);
        break;
      case 'file_update':
        this.handlers.onFileUpdate?.(data.fileId, data.content, data.version);
        break;
      case 'session_expired':
        console.warn('Session expired. Please rejoin.');
        this.handlers.onSessionExpired?.();
        break;
      case 'ack':
        console.log(`Acknowledgment received for message ID: ${data.messageId}`);
        break;
      case 'error':
        this.handlers.onError?.(data.message);
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  }

  private handleWebSocketError(error: Event): void {
    console.error('WebSocket error:', error);
    this.handlers.onError?.('WebSocket connection error');
  }

  private attemptReconnect(url: string, authToken: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    const baseDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    const jitter = Math.random() * 1000; // Add up to 1 second of jitter
    const delay = baseDelay + jitter;

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(url, authToken);
    }, delay) as unknown as number;
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendMessage('heartbeat', {});
    }, 30000) as unknown as number;
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Export a singleton instance
export const collaborationService = CollaborationService.getInstance();
