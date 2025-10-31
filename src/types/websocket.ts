/**
 * WebSocket Protocol Types
 * Type definitions for WebSocket communication with Claude Code server
 */

import { Message, ToolExecution, ErrorInfo } from './models';

/**
 * WebSocket Message Types
 */

export type WebSocketMessageType =
  | 'ping'
  | 'pong'
  | 'message'
  | 'stream_start'
  | 'stream_chunk'
  | 'stream_end'
  | 'tool_start'
  | 'tool_progress'
  | 'tool_end'
  | 'error'
  | 'connection'
  | 'command';

/**
 * Base WebSocket Message Structure
 */

export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType;
  id: string;
  timestamp: number;
  payload: T;
}

/**
 * Connection Messages
 */

export interface ConnectionPayload {
  status: 'connected' | 'disconnected' | 'reconnecting';
  clientId?: string;
  serverVersion?: string;
  capabilities?: string[];
}

export type ConnectionMessage = WebSocketMessage<ConnectionPayload>;

/**
 * Chat Messages
 */

export interface ChatMessagePayload {
  role: 'user' | 'assistant';
  content: string;
  conversationId?: string;
  parentMessageId?: string;
}

export type ChatMessage = WebSocketMessage<ChatMessagePayload>;

/**
 * Streaming Messages
 */

export interface StreamStartPayload {
  messageId: string;
  conversationId?: string;
}

export interface StreamChunkPayload {
  messageId: string;
  content: string;
  index: number;
}

export interface StreamEndPayload {
  messageId: string;
  finalContent: string;
  totalChunks: number;
}

export type StreamStartMessage = WebSocketMessage<StreamStartPayload>;
export type StreamChunkMessage = WebSocketMessage<StreamChunkPayload>;
export type StreamEndMessage = WebSocketMessage<StreamEndPayload>;

/**
 * Tool Execution Messages
 */

export interface ToolStartPayload {
  executionId: string;
  toolName: string;
  input: Record<string, unknown>;
  messageId?: string;
}

export interface ToolProgressPayload {
  executionId: string;
  progress: number;
  status: string;
  output?: string;
}

export interface ToolEndPayload {
  executionId: string;
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
}

export type ToolStartMessage = WebSocketMessage<ToolStartPayload>;
export type ToolProgressMessage = WebSocketMessage<ToolProgressPayload>;
export type ToolEndMessage = WebSocketMessage<ToolEndPayload>;

/**
 * Error Messages
 */

export interface ErrorPayload {
  code: string;
  message: string;
  details?: string;
  recoverable: boolean;
}

export type ErrorMessage = WebSocketMessage<ErrorPayload>;

/**
 * Command Messages
 */

export interface CommandPayload {
  command: string;
  args: string[];
  workingDirectory?: string;
}

export type CommandMessage = WebSocketMessage<CommandPayload>;

/**
 * Ping/Pong Messages
 */

export interface PingPayload {
  timestamp: number;
}

export interface PongPayload {
  timestamp: number;
  latency?: number;
}

export type PingMessage = WebSocketMessage<PingPayload>;
export type PongMessage = WebSocketMessage<PongPayload>;

/**
 * WebSocket Events
 */

export type WebSocketEventType =
  | 'open'
  | 'close'
  | 'error'
  | 'message'
  | 'reconnecting'
  | 'reconnected';

export interface WebSocketEvent<T = unknown> {
  type: WebSocketEventType;
  timestamp: Date;
  data?: T;
}

/**
 * WebSocket Configuration
 */

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnect: boolean;
  reconnectInterval: number;
  reconnectAttempts: number;
  timeout: number;
  pingInterval: number;
  pongTimeout: number;
}

/**
 * WebSocket State
 */

export type WebSocketReadyState =
  | 'CONNECTING'
  | 'OPEN'
  | 'CLOSING'
  | 'CLOSED';

export interface WebSocketState {
  readyState: WebSocketReadyState;
  isConnected: boolean;
  isReconnecting: boolean;
  reconnectAttempts: number;
  lastPingTime?: number;
  lastPongTime?: number;
  latency?: number;
}

/**
 * WebSocket Client Interface
 */

export interface WebSocketClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  send<T>(message: WebSocketMessage<T>): Promise<void>;
  on<T>(event: WebSocketEventType, handler: (event: WebSocketEvent<T>) => void): void;
  off(event: WebSocketEventType, handler: Function): void;
  getState(): WebSocketState;
  isConnected(): boolean;
}

/**
 * Message Handlers
 */

export type MessageHandler<T = unknown> = (message: WebSocketMessage<T>) => void | Promise<void>;

export interface MessageHandlers {
  onMessage?: MessageHandler<ChatMessagePayload>;
  onStreamStart?: MessageHandler<StreamStartPayload>;
  onStreamChunk?: MessageHandler<StreamChunkPayload>;
  onStreamEnd?: MessageHandler<StreamEndPayload>;
  onToolStart?: MessageHandler<ToolStartPayload>;
  onToolProgress?: MessageHandler<ToolProgressPayload>;
  onToolEnd?: MessageHandler<ToolEndPayload>;
  onError?: MessageHandler<ErrorPayload>;
  onConnection?: MessageHandler<ConnectionPayload>;
  onCommand?: MessageHandler<CommandPayload>;
  onPing?: MessageHandler<PingPayload>;
  onPong?: MessageHandler<PongPayload>;
}

/**
 * Request/Response Pattern
 */

export interface RequestMessage<T = unknown> extends WebSocketMessage<T> {
  requestId: string;
  expectsResponse: boolean;
}

export interface ResponseMessage<T = unknown> extends WebSocketMessage<T> {
  requestId: string;
  success: boolean;
  error?: ErrorPayload;
}

/**
 * Batch Messages
 */

export interface BatchMessage {
  type: 'batch';
  id: string;
  timestamp: number;
  messages: WebSocketMessage[];
}

/**
 * Message Queue
 */

export interface QueuedMessage<T = unknown> {
  message: WebSocketMessage<T>;
  priority: number;
  timestamp: number;
  retries: number;
}

/**
 * WebSocket Metrics
 */

export interface WebSocketMetrics {
  messagesSent: number;
  messagesReceived: number;
  bytesSent: number;
  bytesReceived: number;
  averageLatency: number;
  reconnectCount: number;
  errorCount: number;
  uptime: number;
}

/**
 * Type Guards
 */

export function isWebSocketMessage(obj: unknown): obj is WebSocketMessage {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'type' in obj &&
    'id' in obj &&
    'timestamp' in obj &&
    'payload' in obj
  );
}

export function isChatMessage(msg: WebSocketMessage): msg is ChatMessage {
  return msg.type === 'message';
}

export function isStreamChunkMessage(msg: WebSocketMessage): msg is StreamChunkMessage {
  return msg.type === 'stream_chunk';
}

export function isToolStartMessage(msg: WebSocketMessage): msg is ToolStartMessage {
  return msg.type === 'tool_start';
}

export function isToolEndMessage(msg: WebSocketMessage): msg is ToolEndMessage {
  return msg.type === 'tool_end';
}

export function isErrorMessage(msg: WebSocketMessage): msg is ErrorMessage {
  return msg.type === 'error';
}

/**
 * Message Factory Functions
 */

export function createChatMessage(
  content: string,
  role: 'user' | 'assistant' = 'user'
): ChatMessage {
  return {
    type: 'message',
    id: generateMessageId(),
    timestamp: Date.now(),
    payload: {
      role,
      content,
    },
  };
}

export function createToolStartMessage(
  toolName: string,
  input: Record<string, unknown>
): ToolStartMessage {
  return {
    type: 'tool_start',
    id: generateMessageId(),
    timestamp: Date.now(),
    payload: {
      executionId: generateExecutionId(),
      toolName,
      input,
    },
  };
}

export function createErrorMessage(
  code: string,
  message: string,
  recoverable = true
): ErrorMessage {
  return {
    type: 'error',
    id: generateMessageId(),
    timestamp: Date.now(),
    payload: {
      code,
      message,
      recoverable,
    },
  };
}

/**
 * Utility Functions
 */

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateExecutionId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Protocol Version
 */

export const WEBSOCKET_PROTOCOL_VERSION = '1.0.0';

export interface ProtocolInfo {
  version: string;
  supportedMessageTypes: WebSocketMessageType[];
  features: string[];
}
