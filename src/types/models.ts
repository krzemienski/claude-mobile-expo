/**
 * Core Data Models
 * Type definitions for all domain entities in the Claude Code Mobile app
 */

/**
 * Message Types
 */

export type MessageRole = 'user' | 'assistant';

export type MessageStatus = 'sending' | 'sent' | 'streaming' | 'complete' | 'error';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status: MessageStatus;
  toolExecutions?: ToolExecution[];
  error?: ErrorInfo;
}

/**
 * Tool Execution Types
 */

export type ToolStatus = 'pending' | 'running' | 'success' | 'error';

export interface ToolExecution {
  id: string;
  name: string;
  status: ToolStatus;
  input?: Record<string, unknown>;
  output?: string;
  error?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

/**
 * Conversation Types
 */

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  messageCount: number;
}

export interface ConversationMetadata {
  id: string;
  title: string;
  preview: string;
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
  isArchived: boolean;
}

/**
 * Connection Types
 */

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ConnectionState {
  status: ConnectionStatus;
  serverUrl: string | null;
  lastConnectedAt: Date | null;
  error?: ErrorInfo;
  retryCount: number;
  isReconnecting: boolean;
}

/**
 * Server Configuration Types
 */

export interface ServerConfig {
  url: string;
  port: number;
  protocol: 'ws' | 'wss';
  reconnectAttempts: number;
  reconnectDelay: number;
  timeout: number;
}

export interface ServerInfo {
  version: string;
  capabilities: ServerCapabilities;
  status: 'healthy' | 'degraded' | 'offline';
}

export interface ServerCapabilities {
  supportsStreaming: boolean;
  supportsToolExecution: boolean;
  supportsFileOperations: boolean;
  maxMessageLength: number;
  supportedCommands: string[];
}

/**
 * Error Types
 */

export type ErrorCode = 
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'AUTH_ERROR'
  | 'SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

export interface ErrorInfo {
  code: ErrorCode;
  message: string;
  details?: string;
  timestamp: Date;
  recoverable: boolean;
}

/**
 * Command Types
 */

export type CommandType = 
  | 'help'
  | 'clear'
  | 'init'
  | 'git'
  | 'file'
  | 'search'
  | 'custom';

export interface Command {
  type: CommandType;
  name: string;
  description: string;
  usage: string;
  examples: string[];
}

export interface CommandExecution {
  command: Command;
  args: string[];
  timestamp: Date;
}

/**
 * File Reference Types
 */

export interface FileReference {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: Date;
}

export interface FileContext {
  files: FileReference[];
  workingDirectory: string;
}

/**
 * UI State Types
 */

export interface InputState {
  text: string;
  cursorPosition: number;
  isComposing: boolean;
  height: number;
  isFocused: boolean;
}

export interface ScrollState {
  offset: number;
  isAtBottom: boolean;
  isScrolling: boolean;
}

export interface ModalState {
  isVisible: boolean;
  type: 'settings' | 'commands' | 'history' | 'error';
  data?: unknown;
}

/**
 * Settings Types
 */

export interface AppSettings {
  appearance: AppearanceSettings;
  connection: ConnectionSettings;
  behavior: BehaviorSettings;
  advanced: AdvancedSettings;
}

export interface AppearanceSettings {
  fontSize: number;
  fontFamily: string;
  enableAnimations: boolean;
  enableHaptics: boolean;
}

export interface ConnectionSettings {
  serverUrl: string;
  autoReconnect: boolean;
  reconnectAttempts: number;
  timeout: number;
}

export interface BehaviorSettings {
  autoScrollToBottom: boolean;
  showTimestamps: boolean;
  showToolExecutions: boolean;
  enableSlashCommands: boolean;
}

export interface AdvancedSettings {
  enableDebugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  maxMessageHistory: number;
  enableOfflineMode: boolean;
}

/**
 * Storage Types
 */

export interface StorageKeys {
  CONVERSATIONS: string;
  SETTINGS: string;
  CONNECTION: string;
  LAST_SERVER_URL: string;
}

export interface StoredData {
  conversations: Conversation[];
  settings: AppSettings;
  lastServerUrl: string;
}

/**
 * Analytics Types
 */

export interface AnalyticsEvent {
  name: string;
  category: 'user_action' | 'system_event' | 'error';
  properties?: Record<string, unknown>;
  timestamp: Date;
}

export interface UsageMetrics {
  totalMessages: number;
  totalToolExecutions: number;
  averageResponseTime: number;
  errorRate: number;
  activeTime: number;
}

/**
 * Notification Types
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  action?: NotificationAction;
}

export interface NotificationAction {
  label: string;
  onPress: () => void;
}

/**
 * Utility Types
 */

export type Timestamp = Date | string | number;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

/**
 * API Response Types
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ErrorInfo;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Validation Types
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * Type Guards
 */

export function isMessage(obj: unknown): obj is Message {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'role' in obj &&
    'content' in obj &&
    'timestamp' in obj
  );
}

export function isToolExecution(obj: unknown): obj is ToolExecution {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'status' in obj
  );
}

export function isErrorInfo(obj: unknown): obj is ErrorInfo {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'code' in obj &&
    'message' in obj &&
    'recoverable' in obj
  );
}
