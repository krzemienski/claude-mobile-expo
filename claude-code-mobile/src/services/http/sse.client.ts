/**
 * SSE (Server-Sent Events) Client for OpenAI-compatible streaming
 * Uses native Expo fetch with ReadableStream support (SDK 52+)
 *
 * Backend: Python FastAPI (port 8001)
 * Format: OpenAI chat completion chunks via SSE
 */

import { fetch } from 'expo/fetch';

export interface SSEClientConfig {
  url: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: any;
  onMessage: (data: any) => void;
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
 * SSE Client using native Expo fetch and ReadableStream
 * Parses Server-Sent Events format: "data: {json}\n\n"
 */
export class SSEClient {
  private abortController: AbortController | null = null;
  private isActive = false;

  constructor(private config: SSEClientConfig) {}

  /**
   * Start SSE connection and stream events
   */
  async start(): Promise<void> {
    if (this.isActive) {
      throw new Error('SSE client already active');
    }

    this.abortController = new AbortController();
    this.isActive = true;

    try {
      const response = await fetch(this.config.url, {
        method: this.config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          ...this.config.headers,
        },
        body: this.config.body ? JSON.stringify(this.config.body) : undefined,
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      // Read stream using native ReadableStream API
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (this.isActive) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events in buffer
        const events = this.parseSSEBuffer(buffer);

        for (const event of events) {
          if (event === '[DONE]') {
            this.config.onComplete?.();
            this.stop();
            return;
          }

          try {
            const data = JSON.parse(event);
            this.config.onMessage(data);
          } catch (error) {
            console.warn('Failed to parse SSE event:', event, error);
          }
        }

        // Remove processed events from buffer
        buffer = this.getUnprocessedBuffer(buffer);
      }

      this.config.onComplete?.();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Connection aborted - normal
        return;
      }

      this.config.onError?.(error as Error);
      throw error;
    } finally {
      this.isActive = false;
    }
  }

  /**
   * Parse SSE events from buffer
   * SSE format: "data: {json}\n\n"
   */
  private parseSSEBuffer(buffer: string): string[] {
    const events: string[] = [];
    const lines = buffer.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.substring(6); // Remove "data: " prefix

        if (data === '[DONE]') {
          events.push('[DONE]');
        } else if (data.trim()) {
          events.push(data);
        }
      }
    }

    return events;
  }

  /**
   * Get unprocessed buffer (incomplete events)
   */
  private getUnprocessedBuffer(buffer: string): string {
    // Keep lines that don't form complete events yet
    const lines = buffer.split('\n');
    const lastCompleteEventIndex = buffer.lastIndexOf('\n\n');

    if (lastCompleteEventIndex === -1) {
      return buffer; // No complete events, keep entire buffer
    }

    return buffer.substring(lastCompleteEventIndex + 2);
  }

  /**
   * Stop SSE connection
   */
  stop(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
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
    onComplete?: () => void;
    onError?: (error: Error) => void;
  }
): SSEClient {
  return new SSEClient({
    url,
    method: 'POST',
    body: {
      ...request,
      stream: true, // Enable streaming
    },
    onMessage: (data: ChatCompletionChunk) => {
      // Extract content from delta
      const content = data.choices?.[0]?.delta?.content;
      if (content) {
        callbacks.onChunk(content);
      }
    },
    onComplete: callbacks.onComplete,
    onError: callbacks.onError,
  });
}
