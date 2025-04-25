/**
 * Collaboration Service
 * 
 * Provides WebSocket-based real-time collaboration for the Codester IDE
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

export interface CursorPosition {
  lineNumber: number;
  column: number;
}

export interface TextChange {
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  text: string;
  newContent?: string; // Full content after change (for simple implementation)
}

export interface ChatMessage {
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

export interface CollaborationSession {
  id: string;
  name: string;
  users: User[];
  files: {
    id: string;
    name: string;
    content: string;
    language: string;
  }[];
}

// Event types
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
  | 'error';

// Event handlers
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
}

/**
 * Collaboration service for real-time code editing
 */
class CollaborationService {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private sessionId: string | null = null;
  private handlers: CollaborationEventHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  /**
   * Connect to the collaboration server
   */
  connect(url: string = 'ws://localhost:8080'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve(this.userId!);
        return;
      }
      
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        console.log('Connected to collaboration server');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
          
          // Resolve the promise when we get the connected message with our user ID
          if (data.type === 'connected') {
            this.userId = data.userId;
            resolve(data.userId);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.handlers.onError) {
          this.handlers.onError('Connection error');
        }
        reject(error);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.stopHeartbeat();
        
        if (this.handlers.onDisconnected) {
          this.handlers.onDisconnected();
        }
        
        // Attempt to reconnect
        this.attemptReconnect(url);
      };
    });
  }
  
  /**
   * Disconnect from the collaboration server
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      // Leave current session if any
      if (this.sessionId) {
        this.leaveSession();
      }
      
      this.ws.close();
      this.ws = null;
    }
  }
  
  /**
   * Set event handlers
   */
  setEventHandlers(handlers: CollaborationEventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }
  
  /**
   * Create a new collaboration session
   */
  createSession(name: string, userName: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to collaboration server');
    }
    
    this.ws.send(JSON.stringify({
      type: 'create_session',
      name,
      userName
    }));
  }
  
  /**
   * Join an existing collaboration session
   */
  joinSession(sessionId: string, userName: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to collaboration server');
    }
    
    this.sessionId = sessionId;
    
    this.ws.send(JSON.stringify({
      type: 'join',
      sessionId,
      userName
    }));
  }
  
  /**
   * Leave the current collaboration session
   */
  leaveSession(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.sessionId) {
      return;
    }
    
    this.ws.send(JSON.stringify({
      type: 'leave',
      sessionId: this.sessionId
    }));
    
    this.sessionId = null;
  }
  
  /**
   * Update cursor position
   */
  updateCursor(position: CursorPosition): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.sessionId) {
      return;
    }
    
    this.ws.send(JSON.stringify({
      type: 'cursor',
      sessionId: this.sessionId,
      position
    }));
  }
  
  /**
   * Send text changes
   */
  sendChanges(fileId: string, changes: TextChange, version: number, fileName?: string, language?: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.sessionId) {
      return;
    }
    
    this.ws.send(JSON.stringify({
      type: 'edit',
      sessionId: this.sessionId,
      fileId,
      fileName,
      language,
      changes,
      version
    }));
  }
  
  /**
   * Send a chat message
   */
  sendChatMessage(message: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.sessionId) {
      return;
    }
    
    this.ws.send(JSON.stringify({
      type: 'chat',
      sessionId: this.sessionId,
      message
    }));
  }
  
  /**
   * Get the current user ID
   */
  getCurrentUserId(): string | null {
    return this.userId;
  }
  
  /**
   * Get the current session ID
   */
  getCurrentSessionId(): string | null {
    return this.sessionId;
  }
  
  /**
   * Check if connected to the collaboration server
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
  
  /**
   * Handle incoming messages
   */
  private handleMessage(data: any): void {
    switch (data.type) {
      case 'connected':
        if (this.handlers.onConnected) {
          this.handlers.onConnected(data.userId);
        }
        break;
      case 'session_created':
        this.sessionId = data.sessionId;
        if (this.handlers.onSessionCreated) {
          this.handlers.onSessionCreated({
            sessionId: data.sessionId,
            name: data.name
          });
        }
        break;
      case 'session_joined':
        if (this.handlers.onSessionJoined) {
          this.handlers.onSessionJoined({
            id: data.sessionId,
            name: data.name,
            users: data.users,
            files: data.files
          });
        }
        break;
      case 'user_joined':
        if (this.handlers.onUserJoined) {
          this.handlers.onUserJoined(data.user);
        }
        break;
      case 'user_left':
        if (this.handlers.onUserLeft) {
          this.handlers.onUserLeft(data.userId);
        }
        break;
      case 'cursor':
        if (this.handlers.onCursorUpdate) {
          this.handlers.onCursorUpdate(data.userId, data.position);
        }
        break;
      case 'edit':
        if (this.handlers.onEdit) {
          this.handlers.onEdit(data.userId, data.fileId, data.changes, data.version);
        }
        break;
      case 'chat':
        if (this.handlers.onChat) {
          this.handlers.onChat({
            userId: data.userId,
            userName: data.userName,
            message: data.message,
            timestamp: data.timestamp
          });
        }
        break;
      case 'file_update':
        if (this.handlers.onFileUpdate) {
          this.handlers.onFileUpdate(data.fileId, data.content, data.version);
        }
        break;
      case 'error':
        if (this.handlers.onError) {
          this.handlers.onError(data.message);
        }
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }
  
  /**
   * Attempt to reconnect to the server
   */
  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(url).catch(() => {
        // Connection failed, will try again
      });
    }, delay);
  }
  
  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000);
  }
  
  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Export a singleton instance
export const collaborationService = new CollaborationService();

// Export the class for testing or custom instances
export default CollaborationService;/**
 * Collaboration Service
 * 
 * Provides WebSocket-based real-time collaboration for the Codester IDE
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

export interface CursorPosition {
  lineNumber: number;
  column: number;
}

export interface TextChange {
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  text: string;
  newContent?: string; // Full content after change (for simple implementation)
}

export interface ChatMessage {
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

export interface CollaborationSession {
  id: string;
  name: string;
  users: User[];
  files: {
    id: string;
    name: string;
    content: string;
    language: string;
  }[];
}

// Event types
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
  | 'error';

// Event handlers
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
}

/**
 * Collaboration service for real-time code editing
 */
class CollaborationService {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private sessionId: string | null = null;
  private handlers: CollaborationEventHandlers = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  
  /**
   * Connect to the collaboration server
   */
  connect(url: string = 'ws://localhost:8080'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve(this.userId!);
        return;
      }
      
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        console.log('Connected to collaboration server');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
          
          // Resolve the promise when we get the connected message with our user ID
          if (data.type === 'connected') {
            this.userId = data.userId;
            resolve(data.userId);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.handlers.onError) {
          this.handlers.onError('Connection error');
        }
        reject(error);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        this.stopHeartbeat();
        
        if (this.handlers.onDisconnected) {
          this.handlers.onDisconnected();
        }
        
        // Attempt to reconnect
        this.attemptReconnect(url);
      };
    });
  }
  
  /**
   * Disconnect from the collaboration server
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      // Leave current session if any
      if (this.sessionId) {
        this.leaveSession();
      }
      
      this.ws.close();
      this.ws = null;
    }
  }
  
  /**
   * Set event handlers
   */
  setEventHandlers(handlers: CollaborationEventHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }
  
  /**
   * Create a new collaboration session
   */
  createSession(name: string, userName: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to collaboration server');
    }
    
    this.ws.send(JSON.stringify({
      type: 'create_session',
      name,
      userName
    }));
  }
  
  /**
   * Join an existing collaboration session
   */
  joinSession(sessionId: string, userName: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('Not connected to collaboration server');
    }
    
    this.sessionId = sessionId;
    
    this.ws.send(JSON.stringify({
      type: 'join',
      sessionId,
      userName
    }));
  }
  
  /**
   * Leave the current collaboration session
   */
  leaveSession(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.sessionId) {
      return;
    }
    
    this.ws.send(JSON.stringify({
      type: 'leave',
      sessionId: this.sessionId
    }));
    
    this.sessionId = null;
  }
  
  /**
   * Update cursor position
   */
  updateCursor(position: CursorPosition): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.sessionId) {
      return;
    }
    
    this.ws.send(JSON.stringify({
      type: 'cursor',
      sessionId: this.sessionId,
      position
    }));
  }
  
  /**
   * Send text changes
   */
  sendChanges(fileId: string, changes: TextChange, version: number, fileName?: string, language?: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.sessionId) {
      return;
    }
    
    this.ws.send(JSON.stringify({
      type: 'edit',
      sessionId: this.sessionId,
      fileId,
      fileName,
      language,
      changes,
      version
    }));
  }
  
  /**
   * Send a chat message
   */
  sendChatMessage(message: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.sessionId) {
      return;
    }
    
    this.ws.send(JSON.stringify({
      type: 'chat',
      sessionId: this.sessionId,
      message
    }));
  }
  
  /**
   * Get the current user ID
   */
  getCurrentUserId(): string | null {
    return this.userId;
  }
  
  /**
   * Get the current session ID
   */
  getCurrentSessionId(): string | null {
    return this.sessionId;
  }
  
  /**
   * Check if connected to the collaboration server
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
  
  /**
   * Handle incoming messages
   */
  private handleMessage(data: any): void {
    switch (data.type) {
      case 'connected':
        if (this.handlers.onConnected) {
          this.handlers.onConnected(data.userId);
        }
        break;
      case 'session_created':
        this.sessionId = data.sessionId;
        if (this.handlers.onSessionCreated) {
          this.handlers.onSessionCreated({
            sessionId: data.sessionId,
            name: data.name
          });
        }
        break;
      case 'session_joined':
        if (this.handlers.onSessionJoined) {
          this.handlers.onSessionJoined({
            id: data.sessionId,
            name: data.name,
            users: data.users,
            files: data.files
          });
        }
        break;
      case 'user_joined':
        if (this.handlers.onUserJoined) {
          this.handlers.onUserJoined(data.user);
        }
        break;
      case 'user_left':
        if (this.handlers.onUserLeft) {
          this.handlers.onUserLeft(data.userId);
        }
        break;
      case 'cursor':
        if (this.handlers.onCursorUpdate) {
          this.handlers.onCursorUpdate(data.userId, data.position);
        }
        break;
      case 'edit':
        if (this.handlers.onEdit) {
          this.handlers.onEdit(data.userId, data.fileId, data.changes, data.version);
        }
        break;
      case 'chat':
        if (this.handlers.onChat) {
          this.handlers.onChat({
            userId: data.userId,
            userName: data.userName,
            message: data.message,
            timestamp: data.timestamp
          });
        }
        break;
      case 'file_update':
        if (this.handlers.onFileUpdate) {
          this.handlers.onFileUpdate(data.fileId, data.content, data.version);
        }
        break;
      case 'error':
        if (this.handlers.onError) {
          this.handlers.onError(data.message);
        }
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }
  
  /**
   * Attempt to reconnect to the server
   */
  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }
    
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect(url).catch(() => {
        // Connection failed, will try again
      });
    }, delay);
  }
  
  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000);
  }
  
  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Export a singleton instance
export const collaborationService = new CollaborationService();

// Export the class for testing or custom instances
export default CollaborationService;