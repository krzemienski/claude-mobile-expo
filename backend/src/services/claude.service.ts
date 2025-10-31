import { query } from '@anthropic-ai/claude-agent-sdk';
import { WebSocket } from 'ws';
import { logger } from '../utils/logger';
import { Session } from '../websocket/sessionManager';

/**
 * Claude Agent SDK integration service
 * 
 * Uses @anthropic-ai/claude-agent-sdk which proxies to Claude Code CLI.
 * No API key needed - uses user's authenticated Claude Code CLI on backend server.
 * 
 * Prerequisites:
 * - Claude Code CLI: npm install -g claude-code
 * - Authenticated: claude-code login
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
    total_cost_usd?: number;
  };
}

export class ClaudeService {
  constructor() {
    logger.info('Claude Service initialized with Agent SDK (uses Claude Code CLI)');
  }

  /**
   * Stream message to Claude Code CLI via Agent SDK
   */
  async streamMessage(
    _ws: WebSocket,
    userMessage: string,
    session: Session,
    onEvent: (event: StreamEvent) => Promise<void>
  ): Promise<void> {
    try {
      logger.info(`[ClaudeService] Starting stream for session ${session.id}`);
      logger.info(`[ClaudeService] Project path: ${session.projectPath}`);
      logger.info(`[ClaudeService] User message: ${userMessage.substring(0, 100)}`);

      let totalCostUSD = 0;
      let totalInputTokens = 0;
      let totalOutputTokens = 0;

      // Use Agent SDK query() - returns AsyncGenerator
      for await (const message of query({
        prompt: userMessage,
        options: {
          // Path to Claude CLI (SDK auto-detects at /Users/nick/.local/bin/claude)
          // pathToClaudeCodeExecutable: '/Users/nick/.local/bin/claude',
          
          // Use Claude Code system prompt
          systemPrompt: { type: 'preset', preset: 'claude_code' },
          
          // Load CLAUDE.md from project
          settingSources: ['project'],
          
          // Set working directory
          cwd: session.projectPath,
          
          // Max turns to prevent infinite loops
          maxTurns: 20,
          
          // Permission mode: auto-accept file edits for mobile use case
          permissionMode: 'acceptEdits',
        }
      })) {
        logger.debug(`SDK message type: ${message.type}`);

        // Assistant messages
        if (message.type === 'assistant') {
          // Extract content from Anthropic SDK message structure
          const apiMessage = message.message;
          
          if (apiMessage.content) {
            for (const block of apiMessage.content) {
              if (block.type === 'text') {
                // Send text delta
                await onEvent({
                  type: 'content_block_delta',
                  delta: { text: block.text }
                });
              } else if (block.type === 'tool_use') {
                // Tool execution
                await onEvent({
                  type: 'tool_use',
                  name: block.name,
                  input: block.input
                });
                
                // Tool result would come in subsequent messages
              }
            }
          }
        }

        // Final result with usage
        if (message.type === 'result') {
          totalCostUSD = message.total_cost_usd;
          totalInputTokens = message.usage.input_tokens;
          totalOutputTokens = message.usage.output_tokens;
        }
      }

      // Send completion
      await onEvent({
        type: 'message_stop',
        usage: {
          input: totalInputTokens,
          output: totalOutputTokens,
          total_cost_usd: totalCostUSD
        }
      });

      logger.info(`Claude stream complete for session ${session.id}`);

    } catch (error: any) {
      logger.error('Error in Agent SDK:', error);
      await onEvent({
        type: 'error',
        error: error.message || 'Failed to communicate with Claude Code CLI'
      });
    }
  }

  /**
   * Test Claude Code CLI availability
   */
  async testConnection(): Promise<{success: boolean; message: string}> {
    try {
      // Simple test
      for await (const message of query({
        prompt: 'Hi',
        options: {
          maxTurns: 1
        }
      })) {
        if (message.type === 'assistant') {
          logger.info('Claude Code CLI test successful');
          return {
            success: true,
            message: 'Claude Code CLI available'
          };
        }
      }

      return {
        success: false,
        message: 'No response from Claude Code CLI'
      };
    } catch (error: any) {
      logger.error('CLI test failed:', error);
      return {
        success: false,
        message: `CLI error: ${error.message}`
      };
    }
  }

  getInfo() {
    return {
      provider: 'Claude Agent SDK',
      backend: 'Claude Code CLI',
      streaming: true,
      authentication: 'Via Claude Code CLI (no API key needed)',
    };
  }
}
