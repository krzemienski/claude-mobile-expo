/**
 * HTTP Service - Main service orchestrating HTTP client and SSE streaming
 * Replaces WebSocketService with HTTP/SSE architecture
 */

import { HTTPClient, ChatCompletionRequest, ChatCompletionResponse } from './http.client';
import { Message } from './types';
import { SSEClient, createChatCompletionStream } from './sse.client';

export interface HTTPServiceConfig {
  baseURL: string;
  onConnectionChange?: (isConnected: boolean) => void;
  onError?: (error: Error) => void;
}

export interface StreamingChatRequest {
  model: string;
  messages: Message[];
  session_id?: string;
  project_id?: string;
  onChunk: (content: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Main HTTP Service for backend communication
 */
export class HTTPService {
  private httpClient: HTTPClient;
  private activeStreams: Map<string, SSEClient> = new Map();
  private isConnected = false;

  constructor(private config: HTTPServiceConfig) {
    this.httpClient = new HTTPClient({
      baseURL: config.baseURL,
      timeout: 60000,
    });

    // Test connection on init
    this.checkConnection();
  }

  /**
   * Check backend connection
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.httpClient.health();
      this.setConnected(true);
      return true;
    } catch (error) {
      this.setConnected(false);
      this.config.onError?.(error as Error);
      return false;
    }
  }

  /**
   * Update connection status
   */
  private setConnected(connected: boolean): void {
    if (this.isConnected !== connected) {
      this.isConnected = connected;
      this.config.onConnectionChange?.(connected);
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Send message with streaming
   */
  async sendMessageStreaming(request: StreamingChatRequest): Promise<string> {
    console.log('[HTTPService] sendMessageStreaming called');
    console.log('[HTTPService] Model:', request.model);
    console.log('[HTTPService] Messages count:', request.messages.length);
    console.log('[HTTPService] Messages:', JSON.stringify(request.messages, null, 2));

    const streamId = `stream-${Date.now()}`;

    const sseClient = createChatCompletionStream(
      `${this.config.baseURL}/v1/chat/completions`,
      {
        model: request.model,
        messages: request.messages,
        session_id: request.session_id,
        project_id: request.project_id,
      },
      {
        onChunk: request.onChunk,
        onComplete: () => {
          this.activeStreams.delete(streamId);
          request.onComplete?.();
        },
        onError: (error) => {
          this.activeStreams.delete(streamId);
          request.onError?.(error);
          this.config.onError?.(error);
        },
      }
    );

    this.activeStreams.set(streamId, sseClient);

    await sseClient.start();

    return streamId;
  }

  /**
   * Send message without streaming
   */
  async sendMessage(
    model: string,
    messages: Message[],
    sessionId?: string,
    projectId?: string
  ): Promise<ChatCompletionResponse> {
    const request: ChatCompletionRequest = {
      model,
      messages,
      stream: false,
      session_id: sessionId,
      project_id: projectId,
    };

    return this.httpClient.createChatCompletion(request);
  }

  /**
   * Cancel active stream
   */
  cancelStream(streamId: string): void {
    const stream = this.activeStreams.get(streamId);
    if (stream) {
      stream.stop();
      this.activeStreams.delete(streamId);
    }
  }

  /**
   * Cancel all active streams
   */
  cancelAllStreams(): void {
    Array.from(this.activeStreams.entries()).forEach(([id, stream]) => {
      stream.stop();
    });
    this.activeStreams.clear();
  }

  /**
   * Get available models
   */
  async getModels() {
    return this.httpClient.listModels();
  }

  /**
   * Create project
   */
  async createProject(name: string, path?: string) {
    return this.httpClient.createProject(name, path);
  }

  /**
   * Create session
   */
  async createSession(projectId: string, model?: string) {
    return this.httpClient.createSession(projectId, model);
  }

  /**
   * Get session
   */
  async getSession(sessionId: string) {
    return this.httpClient.getSession(sessionId);
  }

  /**
   * List sessions
   */
  async listSessions(projectId?: string) {
    return this.httpClient.listSessions(projectId);
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string) {
    return this.httpClient.deleteSession(sessionId);
  }

  /**
   * Cleanup on unmount
   */
  cleanup(): void {
    this.cancelAllStreams();
  }
}
