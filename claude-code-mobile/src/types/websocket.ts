/**
 * WebSocket Message Types
 * Based on specification lines 1748-1817 and backend implementation
 */

import { Message, Session, ToolExecution } from './models';

/**
 * Client → Server Messages
 */
export type ClientMessage =
  | InitSessionMessage
  | SendMessageMessage
  | ListSessionsMessage
  | GetSessionMessage
  | DeleteSessionMessage
  | PingMessage;

export interface InitSessionMessage {
  type: 'init_session';
  sessionId?: string;
  projectPath?: string;
  metadata?: {
    deviceInfo?: string;
    clientVersion?: string;
  };
}

export interface SendMessageMessage {
  type: 'message';
  content: string;
}

export interface ListSessionsMessage {
  type: 'list_sessions';
}

export interface GetSessionMessage {
  type: 'get_session';
  sessionId: string;
}

export interface DeleteSessionMessage {
  type: 'delete_session';
  sessionId: string;
}

export interface PingMessage {
  type: 'ping';
}

/**
 * Server → Client Messages
 */
export type ServerMessage =
  | ConnectedMessage
  | SessionInitializedMessage
  | ContentDeltaMessage
  | ToolExecutionMessage
  | ToolResultMessage
  | MessageCompleteMessage
  | SessionsListMessage
  | SessionDataMessage
  | SessionDeletedMessage
  | SlashCommandResponseMessage
  | ErrorMessage
  | PongMessage;

export interface ConnectedMessage {
  type: 'connected';
  connectionId: string;
  timestamp: string;
  server: string;
  version: string;
}

export interface SessionInitializedMessage {
  type: 'session_initialized';
  sessionId: string;
  projectPath: string;
  hasContext: boolean;
  messageCount: number;
  createdAt: Date | string;
  lastActiveAt: Date | string;
  timestamp: string;
}

export interface ContentDeltaMessage {
  type: 'content_delta';
  delta: string;
  timestamp: string;
}

export interface ToolExecutionMessage {
  type: 'tool_execution';
  tool: string;
  input: any;
  timestamp: string;
}

export interface ToolResultMessage {
  type: 'tool_result';
  tool: string;
  result?: string;
  error?: string;
  timestamp: string;
}

export interface MessageCompleteMessage {
  type: 'message_complete';
  messageId: string;
  tokensUsed?: {
    input: number;
    output: number;
    total_cost_usd?: number;
  };
  timestamp: string;
}

export interface SessionsListMessage {
  type: 'sessions_list';
  sessions: Array<{
    id: string;
    projectPath: string;
    createdAt: Date | string;
    lastActiveAt: Date | string;
    messageCount: number;
    totalTokensUsed?: number;
  }>;
  count: number;
  timestamp: string;
}

export interface SessionDataMessage {
  type: 'session_data';
  session: Session;
  timestamp: string;
}

export interface SessionDeletedMessage {
  type: 'session_deleted';
  sessionId: string;
  timestamp: string;
}

export interface SlashCommandResponseMessage {
  type: 'slash_command_response';
  command: string;
  response: string;
  timestamp: string;
}

export interface ErrorMessage {
  type: 'error';
  error: string;
  code?: string;
  timestamp: string;
}

export interface PongMessage {
  type: 'pong';
  timestamp: string;
}

/**
 * WebSocket Connection Status
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

/**
 * WebSocket Service Configuration
 */
export interface WebSocketConfig {
  serverUrl: string;
  reconnectDelay: number;        // Initial delay in ms
  maxReconnectDelay: number;     // Maximum delay in ms (30s per Rocket.Chat)
  heartbeatInterval: number;     // Ping interval in ms (30s)
  heartbeatTimeout: number;      // Pong timeout in ms
  maxReconnectAttempts?: number; // Optional max attempts
}
