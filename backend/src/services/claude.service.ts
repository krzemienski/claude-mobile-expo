import Anthropic from '@anthropic-ai/sdk';
import { WebSocket } from 'ws';
import { MessageStream } from '@anthropic-ai/sdk/lib/MessageStream';
import { logger } from '../utils/logger';
import { ToolExecutor } from './toolExecutor';
import { Session } from '../websocket/sessionManager';

/**
 * Claude API streaming event types
 */
interface StreamEvent {
  type: 'content_block_delta' | 'tool_use' | 'tool_result' | 'message_stop' | 'error';
  delta?: { text: string };
  name?: string;
  input?: any;
  result?: any;
  error?: string;
  usage?: {
    input: number;
    output: number;
  };
}

/**
 * Message content block for Anthropic API
 */
type ContentBlock = 
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: any }
  | { type: 'tool_result'; tool_use_id: string; content: string };

/**
 * ClaudeService handles communication with Claude API
 * Implements Anthropic streaming patterns for real-time responses
 * Based on @anthropic-ai/sdk MessageStream implementation
 */
export class ClaudeService {
  private client: Anthropic;
  private toolExecutor: ToolExecutor;
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor() {
    // Validate API key
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }

    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.toolExecutor = new ToolExecutor();

    // Configuration
    this.model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
    this.maxTokens = parseInt(process.env.ANTHROPIC_MAX_TOKENS || '8192');
    this.temperature = parseFloat(process.env.ANTHROPIC_TEMPERATURE || '1');

    logger.info(`Claude Service initialized with model: ${this.model}`);
  }

  /**
   * Stream message to Claude and handle response
   * Implements agentic loop: message → tool use → tool result → continue
   */
  async streamMessage(
    ws: WebSocket,
    userMessage: string,
    session: Session,
    onEvent: (event: StreamEvent) => Promise<void>
  ): Promise<void> {
    try {
      // Build conversation messages
      const messages = this.buildMessages(userMessage, session);
      
      // Get available tools
      const tools = this.toolExecutor.getTools();

      logger.info(`Starting Claude stream for session ${session.id}`);

      // Start streaming
      const stream = this.client.messages.stream({
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        messages,
        tools,
        stream: true,
      });

      // Track current tool use
      let currentToolUse: {
        id: string;
        name: string;
        input: any;
      } | null = null;

      // Track all tool uses in this turn
      const toolUses: Array<{
        id: string;
        name: string;
        input: any;
      }> = [];

      // Track usage
      let inputTokens = 0;
      let outputTokens = 0;

      /**
       * Handle text delta events
       * Fires for each chunk of text in Claude's response
       */
      stream.on('text', (text: string) => {
        onEvent({
          type: 'content_block_delta',
          delta: { text },
        });
      });

      /**
       * Handle content block start
       * Fires when a new content block begins (text or tool use)
       */
      stream.on('contentBlockStart', (block: any) => {
        if (block.type === 'tool_use') {
          currentToolUse = {
            id: block.id,
            name: block.name,
            input: {},
          };
          toolUses.push(currentToolUse);

          logger.debug(`Tool use started: ${block.name}`);
        }
      });

      /**
       * Handle content block delta
       * Fires for incremental updates to content blocks (e.g., tool input JSON)
       */
      stream.on('contentBlockDelta', (delta: any) => {
        if (delta.type === 'input_json_delta' && currentToolUse) {
          try {
            // Parse incremental JSON
            const partialInput = JSON.parse(delta.partial_json || '{}');
            currentToolUse.input = {
              ...currentToolUse.input,
              ...partialInput,
            };
          } catch (error) {
            logger.warn('Failed to parse partial tool input JSON');
          }
        }
      });

      /**
       * Handle content block stop
       * Fires when a content block is complete
       */
      stream.on('contentBlockStop', async () => {
        if (currentToolUse) {
          // Notify client that tool is being executed
          await onEvent({
            type: 'tool_use',
            name: currentToolUse.name,
            input: currentToolUse.input,
          });

          // Execute tool
          try {
            const result = await this.toolExecutor.execute(
              currentToolUse.name,
              currentToolUse.input,
              session.projectPath
            );

            logger.debug(`Tool executed successfully: ${currentToolUse.name}`);

            // Send result to client
            await onEvent({
              type: 'tool_result',
              name: currentToolUse.name,
              result,
            });

            // Store result for continuation
            currentToolUse.input._result = result;
          } catch (error: any) {
            logger.error(`Tool execution failed: ${currentToolUse.name}`, error);

            // Send error to client
            await onEvent({
              type: 'tool_result',
              name: currentToolUse.name,
              error: error.message,
            });

            // Store error for continuation
            currentToolUse.input._error = error.message;
          }

          currentToolUse = null;
        }
      });

      /**
       * Handle message stop
       * Fires when Claude's message is complete
       */
      stream.on('messageStop', () => {
        logger.info(`Claude stream complete for session ${session.id}`);

        onEvent({
          type: 'message_stop',
          usage: {
            input: inputTokens,
            output: outputTokens,
          },
        });
      });

      /**
       * Handle usage information
       * Fires when token usage data is available
       */
      stream.on('message', (message: any) => {
        if (message.usage) {
          inputTokens = message.usage.input_tokens || 0;
          outputTokens = message.usage.output_tokens || 0;

          logger.debug(`Token usage - Input: ${inputTokens}, Output: ${outputTokens}`);
        }
      });

      /**
       * Handle errors
       * Fires when an error occurs during streaming
       */
      stream.on('error', (error: Error) => {
        logger.error('Claude API streaming error:', error);

        onEvent({
          type: 'error',
          error: error.message || 'Claude API error',
        });
      });

      /**
       * Wait for stream completion
       * This is critical - ensures the stream completes before returning
       */
      await stream.finalMessage();

      /**
       * AGENTIC LOOP: If tools were used, continue the conversation
       * This implements the tool use → tool result → continue pattern
       */
      if (toolUses.length > 0) {
        logger.info(`Continuing conversation with ${toolUses.length} tool results`);

        // Build tool result messages
        const toolResults: ContentBlock[] = toolUses.map((toolUse) => ({
          type: 'tool_result' as const,
          tool_use_id: toolUse.id,
          content: toolUse.input._result || toolUse.input._error || 'No result',
        }));

        // Add assistant's tool uses to conversation
        session.conversationHistory.push({
          id: `tool-turn-${Date.now()}`,
          role: 'assistant',
          content: JSON.stringify(toolUses.map(tu => ({
            type: 'tool_use',
            name: tu.name,
            input: tu.input,
          }))),
          timestamp: new Date(),
        });

        // Add tool results to conversation
        session.conversationHistory.push({
          id: `tool-results-${Date.now()}`,
          role: 'user',
          content: JSON.stringify(toolResults),
          timestamp: new Date(),
        });

        // Continue streaming with tool results
        // This allows Claude to see the results and respond naturally
        await this.streamMessage(ws, '', session, onEvent);
      }

    } catch (error: any) {
      logger.error('Error in Claude stream:', error);
      
      await onEvent({
        type: 'error',
        error: error.message || 'Failed to process message',
      });
    }
  }

  /**
   * Build messages array for Claude API
   * Includes conversation history and context
   */
  private buildMessages(userMessage: string, session: Session): Anthropic.MessageParam[] {
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history (last 10 messages to stay within context window)
    const recentHistory = session.conversationHistory.slice(-10);
    
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      });
    }

    // Add current user message if provided
    if (userMessage) {
      // Add context if this is the first message
      if (messages.length === 0 && session.claudeContext) {
        messages.push({
          role: 'user',
          content: `Project Context:\n${session.claudeContext}\n\nUser Request: ${userMessage}`,
        });
      } else {
        messages.push({
          role: 'user',
          content: userMessage,
        });
      }
    }

    return messages;
  }

  /**
   * Test Claude API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hi',
          },
        ],
      });

      logger.info('Claude API connection test successful');
      return true;
    } catch (error: any) {
      logger.error('Claude API connection test failed:', error);
      return false;
    }
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature,
      provider: 'Anthropic',
      streaming: true,
      toolsEnabled: true,
    };
  }
}
