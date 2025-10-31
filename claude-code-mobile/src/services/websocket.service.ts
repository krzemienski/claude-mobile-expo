/**
 * WebSocket Service
 * 
 * Implements Rocket.Chat reconnection patterns:
 * - Exponential backoff: 1s → 2s → 4s → 8s → 16s → 30s (max)
 * - Heartbeat ping/pong every 30s
 * - Offline message queue
 * - Connection status tracking
 * 
 * Based on CLAUDE.md and production patterns from Rocket.Chat
 */

import {
  ClientMessage,
  ServerMessage,
  ConnectionStatus,
  WebSocketConfig,
} from '../types/websocket';

export interface WebSocketCallbacks {
  onConnected?: (connectionId: string) => void;
  onSessionInitialized?: (sessionId: string, hasContext: boolean) => void;
  onContentDelta?: (delta: string) => void;
  onToolExecution?: (tool: string, input: any) => void;
  onToolResult?: (tool: string, result?: string, error?: string) => void;
  onMessageComplete?: (tokensUsed?: any) => void;
  onSessionsList?: (sessions: any[]) => void;
  onError?: (error: string, code?: string) => void;
  onConnectionStatusChange?: (status: ConnectionStatus) => void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private callbacks: WebSocketCallbacks;
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private messageQueue: ClientMessage[] = [];
  private currentSessionId: string | null = null;

  constructor(config: Partial<WebSocketConfig> = {}, callbacks: WebSocketCallbacks = {}) {
    // Rocket.Chat reconnection pattern defaults
    this.config = {
      serverUrl: config.serverUrl || 'ws://localhost:3001/ws',
      reconnectDelay: config.reconnectDelay || 1000,      // Start at 1s
      maxReconnectDelay: config.maxReconnectDelay || 30000, // Max 30s
      heartbeatInterval: config.heartbeatInterval || 30000, // Ping every 30s
      heartbeatTimeout: config.heartbeatTimeout || 5000,    // Wait 5s for pong
      maxReconnectAttempts: config.maxReconnectAttempts,
    };
    
    this.callbacks = callbacks;
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    this.setConnectionStatus(ConnectionStatus.CONNECTING);
    console.log(`[WebSocket] Connecting to ${this.config.serverUrl}...`);

    try {
      this.ws = new WebSocket(this.config.serverUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error: any) {
      console.error('[WebSocket] Connection error:', error);
      this.handleReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log('[WebSocket] Disconnecting...');
    
    this.stopHeartbeat();
    this.stopReconnect();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
  }

  /**
   * Send message to server
   */
  send(message: ClientMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const json = JSON.stringify(message);
      console.log(`[WebSocket] Sending: ${message.type}`);
      this.ws.send(json);
    } else {
      console.log(`[WebSocket] Queuing message (not connected): ${message.type}`);
      this.messageQueue.push(message);
    }
  }

  /**
   * Initialize or resume session
   */
  initSession(projectPath: string, sessionId?: string): void {
    this.send({
      type: 'init_session',
      projectPath,
      sessionId,
      metadata: {
        deviceInfo: 'iOS',
        clientVersion: '1.0.0',
      },
    });
  }

  /**
   * Send user message
   */
  sendMessage(content: string): void {
    this.send({
      type: 'message',
      content,
    });
  }

  /**
   * List all sessions
   */
  listSessions(): void {
    this.send({ type: 'list_sessions' });
  }

  /**
   * Get session data
   */
  getSession(sessionId: string): void {
    this.send({ type: 'get_session', sessionId });
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): void {
    this.send({ type: 'delete_session', sessionId });
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionStatus === ConnectionStatus.CONNECTED;
  }

  // Private methods

  private handleOpen(): void {
    console.log('[WebSocket] Connected');
    this.setConnectionStatus(ConnectionStatus.CONNECTED);
    this.reconnectAttempts = 0;
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Send queued messages
    this.flushQueue();
    
    if (this.callbacks.onConnected) {
      this.callbacks.onConnected('');
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: ServerMessage = JSON.parse(event.data);
      console.log(`[WebSocket] Received: ${message.type}`);

      switch (message.type) {
        case 'connected':
          if (this.callbacks.onConnected) {
            this.callbacks.onConnected(message.connectionId);
          }
          break;

        case 'session_initialized':
          this.currentSessionId = message.sessionId;
          if (this.callbacks.onSessionInitialized) {
            this.callbacks.onSessionInitialized(message.sessionId, message.hasContext);
          }
          break;

        case 'content_delta':
          if (this.callbacks.onContentDelta) {
            this.callbacks.onContentDelta(message.delta);
          }
          break;

        case 'tool_execution':
          if (this.callbacks.onToolExecution) {
            this.callbacks.onToolExecution(message.tool, message.input);
          }
          break;

        case 'tool_result':
          if (this.callbacks.onToolResult) {
            this.callbacks.onToolResult(message.tool, message.result, message.error);
          }
          break;

        case 'message_complete':
          if (this.callbacks.onMessageComplete) {
            this.callbacks.onMessageComplete(message.tokensUsed);
          }
          break;

        case 'sessions_list':
          if (this.callbacks.onSessionsList) {
            this.callbacks.onSessionsList(message.sessions);
          }
          break;

        case 'error':
          console.error('[WebSocket] Server error:', message.error);
          if (this.callbacks.onError) {
            this.callbacks.onError(message.error, message.code);
          }
          break;

        case 'pong':
          this.handlePong();
          break;
      }
    } catch (error: any) {
      console.error('[WebSocket] Message parse error:', error);
    }
  }

  private handleError(event: Event): void {
    console.error('[WebSocket] Error event:', event);
    this.setConnectionStatus(ConnectionStatus.ERROR);
  }

  private handleClose(event: CloseEvent): void {
    console.log(`[WebSocket] Closed: code=${event.code}, reason=${event.reason}`);
    
    this.stopHeartbeat();
    this.setConnectionStatus(ConnectionStatus.DISCONNECTED);
    
    // Auto-reconnect unless intentional close (code 1000)
    if (event.code !== 1000) {
      this.handleReconnect();
    }
  }

  private handleReconnect(): void {
    if (this.config.maxReconnectAttempts && 
        this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.log('[WebSocket] Max reconnect attempts reached');
      this.setConnectionStatus(ConnectionStatus.ERROR);
      return;
    }

    this.setConnectionStatus(ConnectionStatus.RECONNECTING);
    this.reconnectAttempts++;

    // Rocket.Chat exponential backoff: 1s → 2s → 4s → 8s → 16s → 30s (max)
    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.config.maxReconnectDelay
    );

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})...`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private stopReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.reconnectAttempts = 0;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();

    // Send ping every 30s
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log('[WebSocket] Sending ping');
        this.send({ type: 'ping' });
        
        // Set timeout for pong response
        this.heartbeatTimeout = setTimeout(() => {
          console.log('[WebSocket] Pong timeout - reconnecting');
          this.ws?.close();
        }, this.config.heartbeatTimeout);
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  private handlePong(): void {
    console.log('[WebSocket] Received pong');
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  private flushQueue(): void {
    if (this.messageQueue.length > 0) {
      console.log(`[WebSocket] Flushing ${this.messageQueue.length} queued messages`);
      
      const queue = [...this.messageQueue];
      this.messageQueue = [];
      
      queue.forEach((message) => {
        this.send(message);
      });
    }
  }

  private setConnectionStatus(status: ConnectionStatus): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      console.log(`[WebSocket] Status changed: ${status}`);
      
      if (this.callbacks.onConnectionStatusChange) {
        this.callbacks.onConnectionStatusChange(status);
      }
    }
  }
}

export default WebSocketService;
