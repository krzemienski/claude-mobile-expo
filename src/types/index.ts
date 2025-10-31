/**
 * Type Definitions Index
 * Central export point for all type definitions
 */

// Core Models
export * from './models';

// WebSocket Protocol
export * from './websocket';

// Navigation
export * from './navigation';

// Re-export commonly used types for convenience
export type {
  Message,
  MessageRole,
  MessageStatus,
  Conversation,
  ConnectionState,
  ConnectionStatus,
  ToolExecution,
  ToolStatus,
  ErrorInfo,
  ErrorCode,
  Command,
  CommandType,
  AppSettings,
  Notification,
  NotificationType,
} from './models';

export type {
  WebSocketMessage,
  WebSocketMessageType,
  ChatMessage,
  StreamChunkMessage,
  ToolStartMessage,
  ToolEndMessage,
  ErrorMessage,
  WebSocketConfig,
  WebSocketState,
  WebSocketClient,
  MessageHandlers,
} from './websocket';

export type {
  RootStackParamList,
  ChatScreenProps,
  SettingsScreenProps,
  ConversationHistoryScreenProps,
  ServerConnectionScreenProps,
  NavigationHelper,
  ScreenOptions,
} from './navigation';
