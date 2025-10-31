/**
 * Core Data Models
 * Based on specification lines 1547-1879
 */

/**
 * User Model (spec lines 1554-1579)
 */
export interface User {
  id: string;                    // UUID
  email: string;                 // Unique email
  username: string;              // Unique username
  passwordHash?: string;         // Hashed password (optional for OAuth)
  firstName?: string;            // Optional first name
  lastName?: string;             // Optional last name
  avatarUrl?: string;           // Profile picture URL
  role: UserRole;               // User role
  status: UserStatus;           // Account status
  emailVerified: boolean;       // Email verification status
  createdAt: Date;              // Account creation
  updatedAt: Date;              // Last update
  lastLoginAt?: Date;           // Last login
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

/**
 * Session Model (spec lines 1585-1603)
 */
export interface Session {
  id: string;                    // UUID
  userId?: string;               // Optional user ID
  projectPath: string;           // Project directory path
  conversationHistory: Message[]; // Message history
  claudeContext?: string;        // CLAUDE.md content
  createdAt: Date;              // Session creation
  lastActive: Date;             // Last activity
  metadata: SessionMetadata;     // Additional data
}

export interface SessionMetadata {
  deviceInfo?: string;           // Device information
  ipAddress?: string;            // Client IP
  userAgent?: string;            // Browser user agent
  totalMessages: number;         // Total message count
  totalTokensUsed?: number;      // Total tokens
}

/**
 * Message Model (spec lines 1608-1633)
 */
export interface Message {
  id: string;                    // Unique message ID
  sessionId?: string;            // Parent session ID
  role: MessageRole;             // Sender role
  content: string;               // Message content
  timestamp: Date;               // Message timestamp
  isStreaming?: boolean;         // Streaming status
  toolExecutions?: ToolExecution[]; // Tool results
  metadata?: MessageMetadata;    // Additional data
  tokensUsed?: {
    input: number;
    output: number;
  };
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface MessageMetadata {
  modelUsed?: string;            // Claude model version
  tokensUsed?: {
    input: number;
    output: number;
  };
  latency?: number;              // Response time in ms
  error?: string;                // Error message if failed
}

/**
 * Tool Execution Model (spec lines 1639-1655)
 */
export interface ToolExecution {
  id: string;                    // Execution ID
  tool: string;                  // Tool name
  input: any;                    // Tool input parameters
  result?: string;               // Execution result
  status: ToolStatus;            // Execution status
  startedAt: Date;               // Start timestamp
  completedAt?: Date;            // Completion timestamp
  error?: string;                // Error message
}

export enum ToolStatus {
  PENDING = 'pending',
  EXECUTING = 'executing',
  COMPLETE = 'complete',
  ERROR = 'error',
}

/**
 * File Model (spec lines 1661-1676)
 */
export interface FileMetadata {
  path: string;                  // File path relative to project
  name: string;                  // File name
  extension: string;             // File extension
  size: number;                  // File size in bytes
  type: FileType;                // File or directory
  lastModified: Date;            // Last modification
  permissions?: string;          // File permissions
  content?: string;              // File content (when loaded)
}

export enum FileType {
  FILE = 'file',
  DIRECTORY = 'directory',
  SYMLINK = 'symlink',
}

/**
 * Application Settings (spec lines 1868-1878)
 */
export interface AppSettings {
  serverUrl: string;
  apiKey?: string;
  projectPath: string;
  autoScroll: boolean;
  hapticFeedback: boolean;
  darkMode: boolean;
  fontSize: number;
  maxTokens: number;
  temperature: number;
}
