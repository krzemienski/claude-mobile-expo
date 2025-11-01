/**
 * HTTP Client for Python FastAPI Backend
 * Handles non-streaming requests to OpenAI-compatible API
 */

export interface HTTPClientConfig {
  baseURL: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  stream?: boolean;
  session_id?: string;
  project_id?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: 'stop' | 'length';
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  session_id?: string;
  project_id?: string;
}

export interface Model {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
}

export interface ModelsResponse {
  object: 'list';
  data: Model[];
}

/**
 * HTTP Client for FastAPI backend
 */
export class HTTPClient {
  constructor(private config: HTTPClientConfig) {}

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...options.headers,
      },
      signal: options.signal || AbortSignal.timeout(this.config.timeout || 60000),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: { message: response.statusText }
      }));
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Health check
   */
  async health(): Promise<{
    status: string;
    version: string;
    claude_version: string;
    active_sessions: number;
  }> {
    return this.request('/health');
  }

  /**
   * List available models
   */
  async listModels(): Promise<ModelsResponse> {
    return this.request('/v1/models');
  }

  /**
   * Get specific model
   */
  async getModel(modelId: string): Promise<Model> {
    return this.request(`/v1/models/${modelId}`);
  }

  /**
   * Create chat completion (non-streaming)
   */
  async createChatCompletion(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    return this.request('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify({ ...request, stream: false }),
    });
  }

  /**
   * Create project
   */
  async createProject(name: string, path?: string): Promise<{
    id: string;
    name: string;
    path: string;
  }> {
    return this.request('/v1/projects', {
      method: 'POST',
      body: JSON.stringify({ name, path }),
    });
  }

  /**
   * Create session
   */
  async createSession(
    projectId: string,
    model?: string
  ): Promise<{
    id: string;
    project_id: string;
    model: string;
  }> {
    return this.request('/v1/sessions', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        model: model || 'claude-3-5-haiku-20241022',
      }),
    });
  }

  /**
   * Get session
   */
  async getSession(sessionId: string): Promise<{
    id: string;
    project_id: string;
    model: string;
    total_tokens: number;
    total_cost: number;
    message_count: number;
  }> {
    return this.request(`/v1/sessions/${sessionId}`);
  }

  /**
   * List sessions
   */
  async listSessions(projectId?: string): Promise<{
    data: any[];
    pagination: any;
  }> {
    const query = projectId ? `?project_id=${projectId}` : '';
    return this.request(`/v1/sessions${query}`);
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.request(`/v1/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }
}
