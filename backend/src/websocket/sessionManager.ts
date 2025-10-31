import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';

/**
 * Session data structure
 */
export interface Session {
  id: string;
  projectPath: string;
  createdAt: Date;
  lastActiveAt: Date;
  conversationHistory: Message[];
  claudeContext?: string;
  metadata: {
    clientVersion?: string;
    platform?: string;
    totalMessages: number;
    totalTokensUsed?: number;
  };
}

/**
 * Message data structure
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  tokensUsed?: {
    input: number;
    output: number;
  };
}

/**
 * Tool call data structure
 */
export interface ToolCall {
  name: string;
  input: any;
  result?: any;
  error?: string;
  timestamp: Date;
}

/**
 * Connection mapping
 */
interface Connection {
  ws: WebSocket;
  sessionId: string;
  connectedAt: Date;
}

/**
 * SessionManager handles session lifecycle and WebSocket connections
 * Implements Rocket.Chat-inspired reconnection patterns with offline queue
 */
export class SessionManager {
  private sessions: Map<string, Session>;
  private connections: Map<string, Connection>;
  private sessionsDir: string;

  constructor() {
    this.sessions = new Map();
    this.connections = new Map();
    this.sessionsDir = process.env.SESSIONS_DIR || './data/sessions';
    
    this.initializeSessionsDirectory();
  }

  /**
   * Initialize sessions directory
   */
  private async initializeSessionsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.sessionsDir, { recursive: true });
      logger.info(`Sessions directory initialized: ${this.sessionsDir}`);
    } catch (error) {
      logger.error('Failed to initialize sessions directory:', error);
    }
  }

  /**
   * Create a new session
   */
  async createSession(projectPath: string): Promise<Session> {
    const sessionId = uuidv4();
    
    const session: Session = {
      id: sessionId,
      projectPath,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      conversationHistory: [],
      metadata: {
        totalMessages: 0,
      },
    };

    this.sessions.set(sessionId, session);
    
    // Persist session to disk
    await this.saveSession(session);

    logger.info(`Created new session: ${sessionId} for project: ${projectPath}`);

    return session;
  }

  /**
   * Get existing session by ID
   */
  async getSession(sessionId: string): Promise<Session | null> {
    // Check in-memory cache first
    let session = this.sessions.get(sessionId);

    // If not in memory, try to load from disk
    if (!session) {
      session = await this.loadSession(sessionId);
      if (session) {
        this.sessions.set(sessionId, session);
      }
    }

    return session || null;
  }

  /**
   * Update session with new activity
   */
  async updateSession(sessionId: string, updates: Partial<Session>): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    Object.assign(session, updates, {
      lastActiveAt: new Date(),
    });

    this.sessions.set(sessionId, session);
    
    // Persist to disk
    await this.saveSession(session);
  }

  /**
   * Add message to session
   */
  async addMessage(sessionId: string, message: Message): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.conversationHistory.push(message);
    session.metadata.totalMessages++;
    session.lastActiveAt = new Date();

    if (message.tokensUsed) {
      session.metadata.totalTokensUsed = 
        (session.metadata.totalTokensUsed || 0) + 
        message.tokensUsed.input + 
        message.tokensUsed.output;
    }

    this.sessions.set(sessionId, session);
    
    // Persist to disk
    await this.saveSession(session);
  }

  /**
   * Get session by connection ID
   */
  getSessionByConnection(connectionId: string): Session | null {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      return null;
    }

    return this.sessions.get(connection.sessionId) || null;
  }

  /**
   * Add WebSocket connection to session
   */
  addConnection(connectionId: string, ws: WebSocket, sessionId: string): void {
    this.connections.set(connectionId, {
      ws,
      sessionId,
      connectedAt: new Date(),
    });

    logger.info(`Connection ${connectionId} added to session ${sessionId}`);
  }

  /**
   * Remove connection
   */
  removeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      logger.info(`Connection ${connectionId} removed from session ${connection.sessionId}`);
      this.connections.delete(connectionId);
    }
  }

  /**
   * Get all connections for a session
   */
  getSessionConnections(sessionId: string): WebSocket[] {
    const connections: WebSocket[] = [];

    for (const [_, connection] of this.connections) {
      if (connection.sessionId === sessionId) {
        connections.push(connection.ws);
      }
    }

    return connections;
  }

  /**
   * List all sessions
   */
  async listSessions(): Promise<Session[]> {
    try {
      const files = await fs.readdir(this.sessionsDir);
      const sessionFiles = files.filter(f => f.endsWith('.json'));

      const sessions: Session[] = [];
      for (const file of sessionFiles) {
        const sessionId = file.replace('.json', '');
        const session = await this.loadSession(sessionId);
        if (session) {
          sessions.push(session);
        }
      }

      // Sort by last active date
      sessions.sort((a, b) => 
        new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
      );

      return sessions;
    } catch (error) {
      logger.error('Failed to list sessions:', error);
      return [];
    }
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    // Remove from memory
    this.sessions.delete(sessionId);

    // Remove from disk
    try {
      const sessionFile = path.join(this.sessionsDir, `${sessionId}.json`);
      await fs.unlink(sessionFile);
      logger.info(`Deleted session: ${sessionId}`);
    } catch (error) {
      logger.error(`Failed to delete session ${sessionId}:`, error);
    }

    // Close all connections for this session
    for (const [connectionId, connection] of this.connections) {
      if (connection.sessionId === sessionId) {
        connection.ws.close(1000, 'Session deleted');
        this.connections.delete(connectionId);
      }
    }
  }

  /**
   * Save session to disk
   */
  private async saveSession(session: Session): Promise<void> {
    try {
      const sessionFile = path.join(this.sessionsDir, `${session.id}.json`);
      await fs.writeFile(sessionFile, JSON.stringify(session, null, 2), 'utf-8');
    } catch (error) {
      logger.error(`Failed to save session ${session.id}:`, error);
    }
  }

  /**
   * Load session from disk
   */
  private async loadSession(sessionId: string): Promise<Session | null> {
    try {
      const sessionFile = path.join(this.sessionsDir, `${sessionId}.json`);
      const data = await fs.readFile(sessionFile, 'utf-8');
      const session = JSON.parse(data);

      // Convert date strings back to Date objects
      session.createdAt = new Date(session.createdAt);
      session.lastActiveAt = new Date(session.lastActiveAt);
      session.conversationHistory = session.conversationHistory.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));

      return session;
    } catch (error) {
      // Session file doesn't exist
      return null;
    }
  }

  /**
   * Clean up old sessions (older than 30 days)
   */
  async cleanupOldSessions(): Promise<number> {
    try {
      const sessions = await this.listSessions();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let deletedCount = 0;

      for (const session of sessions) {
        if (new Date(session.lastActiveAt) < thirtyDaysAgo) {
          await this.deleteSession(session.id);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} old sessions`);
      }

      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup old sessions:', error);
      return 0;
    }
  }

  /**
   * Get active session count
   */
  getActiveSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Get active connection count
   */
  getActiveConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Get session statistics
   */
  getStatistics() {
    return {
      activeSessions: this.sessions.size,
      activeConnections: this.connections.size,
      totalMessagesAcrossSessions: Array.from(this.sessions.values())
        .reduce((sum, session) => sum + session.metadata.totalMessages, 0),
      totalTokensUsed: Array.from(this.sessions.values())
        .reduce((sum, session) => sum + (session.metadata.totalTokensUsed || 0), 0),
    };
  }
}
