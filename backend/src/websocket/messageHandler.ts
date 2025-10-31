import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { SessionManager, Message } from './sessionManager';
import { ClaudeService } from '../services/claude.service';
import { logger } from '../utils/logger';

/**
 * Message types supported by the WebSocket API
 */
export enum MessageType {
  // Session management
  INIT_SESSION = 'init_session',
  SESSION_INITIALIZED = 'session_initialized',
  
  // Messaging
  MESSAGE = 'message',
  CONTENT_DELTA = 'content_delta',
  MESSAGE_COMPLETE = 'message_complete',
  
  // Tool execution
  TOOL_EXECUTION = 'tool_execution',
  TOOL_RESULT = 'tool_result',
  
  // Session operations
  LIST_SESSIONS = 'list_sessions',
  SESSIONS_LIST = 'sessions_list',
  GET_SESSION = 'get_session',
  SESSION_DATA = 'session_data',
  DELETE_SESSION = 'delete_session',
  SESSION_DELETED = 'session_deleted',
  
  // Slash commands
  SLASH_COMMAND = 'slash_command',
  SLASH_COMMAND_RESPONSE = 'slash_command_response',
  
  // Errors
  ERROR = 'error',
  
  // Connection
  CONNECTED = 'connected',
  PING = 'ping',
  PONG = 'pong',
}

/**
 * MessageHandler processes incoming WebSocket messages and routes them
 * to appropriate handlers
 */
export class MessageHandler {
  constructor(
    private sessionManager: SessionManager,
    private claudeService: ClaudeService
  ) {}

  /**
   * Main message handler - routes messages to specific handlers
   */
  async handle(ws: WebSocket, message: any, connectionId: string): Promise<void> {
    const { type, ...payload } = message;

    try {
      switch (type) {
        case MessageType.INIT_SESSION:
          await this.handleInitSession(ws, payload, connectionId);
          break;

        case MessageType.MESSAGE:
          await this.handleMessage(ws, payload, connectionId);
          break;

        case MessageType.LIST_SESSIONS:
          await this.handleListSessions(ws, connectionId);
          break;

        case MessageType.GET_SESSION:
          await this.handleGetSession(ws, payload, connectionId);
          break;

        case MessageType.DELETE_SESSION:
          await this.handleDeleteSession(ws, payload, connectionId);
          break;

        case MessageType.SLASH_COMMAND:
          await this.handleSlashCommand(ws, payload, connectionId);
          break;

        case MessageType.PING:
          this.handlePing(ws);
          break;

        default:
          logger.warn(`Unknown message type: ${type} from connection ${connectionId}`);
          this.sendError(ws, `Unknown message type: ${type}`);
      }
    } catch (error: any) {
      logger.error(`Error handling message type ${type}:`, error);
      this.sendError(ws, error.message || 'Internal server error');
    }
  }

  /**
   * Initialize or resume a session
   */
  private async handleInitSession(
    ws: WebSocket,
    payload: any,
    connectionId: string
  ): Promise<void> {
    const { sessionId, projectPath, metadata } = payload;

    // Validate project path
    if (!sessionId && !projectPath) {
      throw new Error('Either sessionId or projectPath is required');
    }

    // Get or create session
    let session;
    if (sessionId) {
      session = await this.sessionManager.getSession(sessionId);
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }
      logger.info(`Resuming session ${sessionId} for connection ${connectionId}`);
    } else {
      session = await this.sessionManager.createSession(projectPath);
      logger.info(`Created new session ${session.id} for connection ${connectionId}`);
    }

    // Update session metadata if provided
    if (metadata) {
      await this.sessionManager.updateSession(session.id, {
        metadata: { ...session.metadata, ...metadata },
      });
    }

    // Add connection to session
    this.sessionManager.addConnection(connectionId, ws, session.id);

    // Send response
    ws.send(
      JSON.stringify({
        type: MessageType.SESSION_INITIALIZED,
        sessionId: session.id,
        projectPath: session.projectPath,
        hasContext: !!session.claudeContext,
        messageCount: session.conversationHistory.length,
        createdAt: session.createdAt,
        lastActiveAt: session.lastActiveAt,
        timestamp: new Date().toISOString(),
      })
    );
  }

  /**
   * Handle user message - send to Claude and stream response
   */
  private async handleMessage(
    ws: WebSocket,
    payload: any,
    connectionId: string
  ): Promise<void> {
    const { content } = payload;

    if (!content || typeof content !== 'string') {
      throw new Error('Message content is required and must be a string');
    }

    const session = this.sessionManager.getSessionByConnection(connectionId);
    if (!session) {
      throw new Error('No active session. Please initialize a session first.');
    }

    // Check for slash commands
    if (content.startsWith('/')) {
      await this.handleSlashCommand(ws, { command: content }, connectionId);
      return;
    }

    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Add to session history
    await this.sessionManager.addMessage(session.id, userMessage);

    // Create assistant message placeholder
    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      toolCalls: [],
    };

    // Stream response from Claude
    try {
      await this.claudeService.streamMessage(
        ws,
        content,
        session,
        async (event) => {
          await this.handleClaudeEvent(ws, event, session, assistantMessage);
        }
      );

      // Add complete assistant message to history
      if (assistantMessage.content || assistantMessage.toolCalls?.length) {
        await this.sessionManager.addMessage(session.id, assistantMessage);
      }
    } catch (error: any) {
      logger.error(`Error processing message for session ${session.id}:`, error);
      this.sendError(ws, error.message || 'Failed to process message');
    }
  }

  /**
   * Handle Claude API events and forward to client
   */
  private async handleClaudeEvent(
    ws: WebSocket,
    event: any,
    session: any,
    assistantMessage: Message
  ): Promise<void> {
    switch (event.type) {
      case 'content_block_delta':
        // Append text delta to message
        assistantMessage.content += event.delta.text;

        // Send delta to client
        ws.send(
          JSON.stringify({
            type: MessageType.CONTENT_DELTA,
            delta: event.delta.text,
            timestamp: new Date().toISOString(),
          })
        );
        break;

      case 'tool_use':
        // Record tool call
        const toolCall = {
          name: event.name,
          input: event.input,
          timestamp: new Date(),
        };

        if (!assistantMessage.toolCalls) {
          assistantMessage.toolCalls = [];
        }
        assistantMessage.toolCalls.push(toolCall);

        // Notify client
        ws.send(
          JSON.stringify({
            type: MessageType.TOOL_EXECUTION,
            tool: event.name,
            input: event.input,
            timestamp: new Date().toISOString(),
          })
        );
        break;

      case 'tool_result':
        // Update tool call with result
        if (assistantMessage.toolCalls) {
          const toolCall = assistantMessage.toolCalls.find(
            (tc) => tc.name === event.name && !tc.result && !tc.error
          );
          if (toolCall) {
            if (event.error) {
              toolCall.error = event.error;
            } else {
              toolCall.result = event.result;
            }
          }
        }

        // Notify client
        ws.send(
          JSON.stringify({
            type: MessageType.TOOL_RESULT,
            tool: event.name,
            result: event.result,
            error: event.error,
            timestamp: new Date().toISOString(),
          })
        );
        break;

      case 'message_stop':
        // Message complete
        ws.send(
          JSON.stringify({
            type: MessageType.MESSAGE_COMPLETE,
            messageId: assistantMessage.id,
            tokensUsed: event.usage,
            timestamp: new Date().toISOString(),
          })
        );

        // Update token usage
        if (event.usage) {
          assistantMessage.tokensUsed = event.usage;
        }
        break;

      case 'error':
        this.sendError(ws, event.error);
        break;
    }
  }

  /**
   * List all sessions
   */
  private async handleListSessions(ws: WebSocket, connectionId: string): Promise<void> {
    const sessions = await this.sessionManager.listSessions();

    // Send session list (without full conversation history)
    const sessionSummaries = sessions.map((session) => ({
      id: session.id,
      projectPath: session.projectPath,
      createdAt: session.createdAt,
      lastActiveAt: session.lastActiveAt,
      messageCount: session.conversationHistory.length,
      totalTokensUsed: session.metadata.totalTokensUsed,
    }));

    ws.send(
      JSON.stringify({
        type: MessageType.SESSIONS_LIST,
        sessions: sessionSummaries,
        count: sessionSummaries.length,
        timestamp: new Date().toISOString(),
      })
    );
  }

  /**
   * Get full session data
   */
  private async handleGetSession(ws: WebSocket, payload: any, connectionId: string): Promise<void> {
    const { sessionId } = payload;

    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    ws.send(
      JSON.stringify({
        type: MessageType.SESSION_DATA,
        session,
        timestamp: new Date().toISOString(),
      })
    );
  }

  /**
   * Delete session
   */
  private async handleDeleteSession(
    ws: WebSocket,
    payload: any,
    connectionId: string
  ): Promise<void> {
    const { sessionId } = payload;

    if (!sessionId) {
      throw new Error('sessionId is required');
    }

    await this.sessionManager.deleteSession(sessionId);

    ws.send(
      JSON.stringify({
        type: MessageType.SESSION_DELETED,
        sessionId,
        timestamp: new Date().toISOString(),
      })
    );
  }

  /**
   * Handle slash commands
   */
  private async handleSlashCommand(
    ws: WebSocket,
    payload: any,
    connectionId: string
  ): Promise<void> {
    const { command } = payload;

    if (!command || typeof command !== 'string') {
      throw new Error('Command is required and must be a string');
    }

    const session = this.sessionManager.getSessionByConnection(connectionId);
    if (!session) {
      throw new Error('No active session');
    }

    // Parse command
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    let response = '';

    try {
      switch (cmd) {
        case '/help':
          response = this.getHelpText();
          break;

        case '/stats':
          response = this.getSessionStats(session);
          break;

        case '/clear':
          session.conversationHistory = [];
          await this.sessionManager.updateSession(session.id, {
            conversationHistory: [],
          });
          response = 'Conversation history cleared.';
          break;

        case '/cost':
          response = this.getCostEstimate(session);
          break;

        default:
          response = `Unknown command: ${cmd}. Type /help for available commands.`;
      }

      ws.send(
        JSON.stringify({
          type: MessageType.SLASH_COMMAND_RESPONSE,
          command: cmd,
          response,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error: any) {
      this.sendError(ws, `Command error: ${error.message}`);
    }
  }

  /**
   * Handle ping
   */
  private handlePing(ws: WebSocket): void {
    ws.send(
      JSON.stringify({
        type: MessageType.PONG,
        timestamp: new Date().toISOString(),
      })
    );
  }

  /**
   * Send error message
   */
  private sendError(ws: WebSocket, error: string): void {
    ws.send(
      JSON.stringify({
        type: MessageType.ERROR,
        error,
        timestamp: new Date().toISOString(),
      })
    );
  }

  /**
   * Get help text
   */
  private getHelpText(): string {
    return `
Available Commands:
/help    - Show this help message
/stats   - Show session statistics
/clear   - Clear conversation history
/cost    - Show estimated API costs
    `.trim();
  }

  /**
   * Get session statistics
   */
  private getSessionStats(session: any): string {
    return `
Session Statistics:
- Session ID: ${session.id}
- Messages: ${session.conversationHistory.length}
- Total Tokens: ${session.metadata.totalTokensUsed || 0}
- Created: ${new Date(session.createdAt).toLocaleString()}
- Last Active: ${new Date(session.lastActiveAt).toLocaleString()}
    `.trim();
  }

  /**
   * Get cost estimate
   */
  private getCostEstimate(session: any): string {
    const tokens = session.metadata.totalTokensUsed || 0;
    // Claude Sonnet 4 pricing (approximate)
    const inputCost = 0.003; // per 1K tokens
    const outputCost = 0.015; // per 1K tokens
    const avgCost = (inputCost + outputCost) / 2;
    const estimatedCost = (tokens / 1000) * avgCost;

    return `
Cost Estimate:
- Total Tokens: ${tokens.toLocaleString()}
- Estimated Cost: $${estimatedCost.toFixed(4)}
Note: This is an estimate based on average token costs.
    `.trim();
  }
}
