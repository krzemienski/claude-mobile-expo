/**
 * TypeScript types for HTTP service
 * Matches OpenAI API format from Python backend
 */

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: Message[];
  stream?: boolean;
  session_id?: string;
  project_id?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface ChatChoice {
  index: number;
  message: {
    role: 'assistant';
    content: string;
  };
  finish_reason: 'stop' | 'length' | null;
}

export interface ChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: ChatChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  session_id?: string;
  project_id?: string;
}

export interface StreamDelta {
  role?: 'assistant';
  content?: string;
}

export interface StreamChoice {
  index: number;
  delta: StreamDelta;
  finish_reason: 'stop' | 'length' | null;
}

export interface ChatCompletionChunk {
  id: string;
  object: 'chat.completion.chunk';
  created: number;
  model: string;
  choices: StreamChoice[];
}

export interface Model {
  id: string;
  object: 'model';
  created: number;
  owned_by: string;
}

export interface ModelsListResponse {
  object: 'list';
  data: Model[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  path: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Session {
  id: string;
  project_id: string;
  title?: string;
  model: string;
  system_prompt?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  total_tokens: number;
  total_cost: number;
  message_count: number;
}

export interface APIError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  version: string;
  claude_version: string;
  active_sessions: number;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
