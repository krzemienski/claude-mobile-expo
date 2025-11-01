/**
 * SSE (Server-Sent Events) Client for OpenAI-compatible streaming
 * Uses XMLHttpRequest for React Native compatibility
 *
 * Backend: Python FastAPI (port 8001)
 * Format: OpenAI chat completion chunks via SSE
 *
 * NOTE: React Native fetch + ReadableStream has issues with SSE.
 * Using XMLHttpRequest directly for reliable streaming.
 */

export interface SSEClientConfig {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: any;
  onMessage: (data: any) => void;
  onToolUse?: (data: any) => void;
  onToolResult?: (data: any) => void;
  onThinking?: (data: any) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: 'assistant';
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

/**
 * SSE Client using XMLHttpRequest for React Native compatibility
 */
export class SSEClient {
  private xhr: XMLHttpRequest | null = null;
  private isActive = false;
  private buffer = '';

  constructor(private config: SSEClientConfig) {}

  /**
   * Start SSE connection using XHR
   */
  async start(): Promise<void> {
    if (this.isActive) {
      throw new Error('SSE client already active');
    }

    console.log('[SSEClient] Starting XHR SSE connection to:', this.config.url);
    console.log('[SSEClient] Request body:', this.config.body);

    this.isActive = true;
    this.buffer = '';

    return new Promise((resolve, reject) => {
      this.xhr = new XMLHttpRequest();

      this.xhr.onreadystatechange = () => {
        if (!this.xhr) return;

        console.log('[SSEClient] ReadyState changed:', this.xhr.readyState);

        // ReadyState 3 = LOADING (receiving data)
        // ReadyState 4 = DONE (complete)
        if (this.xhr.readyState === 3 || this.xhr.readyState === 4) {
          this.processResponseText(this.xhr.responseText);
        }

        if (this.xhr.readyState === 4) {
          console.log('[SSEClient] Request complete, status:', this.xhr.status);
          if (this.xhr.status === 200) {
            this.config.onComplete?.();
            resolve();
          } else {
            const error = new Error(`HTTP ${this.xhr.status}`);
            this.config.onError?.(error);
            reject(error);
          }
          this.stop();
        }
      };

      this.xhr.onerror = () => {
        console.error('[SSEClient] XHR error');
        const error = new Error('Network error');
        this.config.onError?.(error);
        this.stop();
        reject(error);
      };

      this.xhr.open(this.config.method || 'POST', this.config.url);

      // Set headers
      this.xhr.setRequestHeader('Content-Type', 'application/json');
      this.xhr.setRequestHeader('Accept', 'text/event-stream');
      if (this.config.headers) {
        Object.entries(this.config.headers).forEach(([key, value]) => {
          this.xhr!.setRequestHeader(key, value);
        });
      }

      console.log('[SSEClient] Sending XHR request');
      this.xhr.send(this.config.body ? JSON.stringify(this.config.body) : null);
    });
  }

  /**
   * Process accumulated response text
   */
  private processResponseText(responseText: string): void {
    // Only process new text (beyond what we've already processed)
    const newText = responseText.substring(this.buffer.length);
    if (!newText) return;

    this.buffer = responseText;
    console.log('[SSEClient] Processing new text, length:', newText.length);

    // Split into lines and process SSE events
    const lines = newText.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.substring(6).trim();

        if (data === '[DONE]') {
          console.log('[SSEClient] [DONE] signal received');
          continue;
        }

        if (data) {
          try {
            const parsed = JSON.parse(data);

            // Check for tool events
            const delta = parsed.choices?.[0]?.delta;
            if (delta?.tool_use) {
              console.log('[SSEClient] Tool use event:', delta.tool_use);
              this.config.onToolUse?.(delta.tool_use);
            } else if (delta?.tool_result) {
              console.log('[SSEClient] Tool result event:', delta.tool_result);
              this.config.onToolResult?.(delta.tool_result);
            } else if (delta?.thinking) {
              console.log('[SSEClient] Thinking event:', delta.thinking);
              this.config.onThinking?.(delta.thinking);
            }

            // Always call onMessage for content
            console.log('[SSEClient] Parsed event, calling onMessage');
            this.config.onMessage(parsed);
          } catch (error) {
            console.warn('[SSEClient] Failed to parse SSE data:', data.substring(0, 100));
          }
        }
      }
    }
  }

  /**
   * Stop SSE connection
   */
  stop(): void {
    console.log('[SSEClient] Stopping XHR connection');
    if (this.xhr) {
      this.xhr.abort();
      this.xhr = null;
    }
    this.isActive = false;
  }

  /**
   * Check if client is currently streaming
   */
  isStreaming(): boolean {
    return this.isActive;
  }
}

/**
 * Helper: Create SSE client for OpenAI chat completions
 */
export function createChatCompletionStream(
  url: string,
  request: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    session_id?: string;
    project_id?: string;
  },
  callbacks: {
    onChunk: (content: string) => void;
    onToolUse?: (data: any) => void;
    onToolResult?: (data: any) => void;
    onThinking?: (data: any) => void;
    onComplete?: () => void;
    onError?: (error: Error) => void;
  }
): SSEClient {
  return new SSEClient({
    url,
    method: 'POST',
    body: {
      ...request,
      stream: true,
    },
    onMessage: (data: ChatCompletionChunk) => {
      console.log('[SSEClient] onMessage callback');
      const content = data.choices?.[0]?.delta?.content;
      if (content) {
        console.log('[SSEClient] Content chunk:', content.substring(0, 50));
        callbacks.onChunk(content);
      }
    },
    onToolUse: callbacks.onToolUse,
    onToolResult: callbacks.onToolResult,
    onThinking: callbacks.onThinking,
    onComplete: () => {
      console.log('[SSEClient] onComplete callback');
      callbacks.onComplete?.();
    },
    onError: (error) => {
      console.error('[SSEClient] onError callback:', error);
      callbacks.onError?.(error);
    },
  });
}
