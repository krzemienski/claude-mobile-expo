/**
 * HTTP Service - Barrel export
 * Main entry point for HTTP/SSE communication with Python FastAPI backend
 */

export { HTTPClient } from './http.client';
export { SSEClient, createChatCompletionStream } from './sse.client';
export { HTTPService } from './http.service';
export { OfflineQueue } from './offline-queue';
export { ReconnectionManager } from './reconnection';

export type {
  HTTPClientConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  Model,
  ModelsResponse,
} from './http.client';

export type {
  SSEClientConfig,
  ChatCompletionChunk,
} from './sse.client';

export type {
  HTTPServiceConfig,
  StreamingChatRequest,
} from './http.service';

export type {
  QueuedMessage,
} from './offline-queue';

export type {
  ReconnectionConfig,
} from './reconnection';

export type {
  Message,
  ChatRequest,
  ChatChoice,
  StreamDelta,
  StreamChoice,
  Project,
  Session,
  APIError,
  HealthResponse,
  ConnectionStatus,
} from './types';
