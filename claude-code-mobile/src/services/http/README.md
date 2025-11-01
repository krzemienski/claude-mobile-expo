# HTTP Service Layer

HTTP/SSE service layer for Python FastAPI backend communication.

**Replaces**: WebSocket service
**Backend**: Python FastAPI (port 8001)
**Protocol**: OpenAI-compatible HTTP/SSE API

---

## Architecture

```
React Native App
    ↓
HTTP Service (this layer)
    ↓
HTTP/SSE (OpenAI format)
    ↓
Python FastAPI Backend (port 8001)
    ↓
Claude Code CLI
```

---

## Files

1. **sse.client.ts** - SSE streaming client using native Expo fetch + ReadableStream
2. **http.client.ts** - HTTP client for non-streaming requests
3. **http.service.ts** - Main service orchestrating HTTP + SSE
4. **offline-queue.ts** - Queue messages when offline, send on reconnect
5. **reconnection.ts** - Exponential backoff reconnection (Rocket.Chat pattern)
6. **types.ts** - TypeScript interfaces for OpenAI API
7. **useHTTP.ts** - React hooks for components
8. **index.ts** - Barrel exports

---

## Usage

### Basic Setup

```typescript
import { HTTPService } from '@/services/http';

const service = new HTTPService({
  baseURL: 'http://localhost:8001',
  onConnectionChange: (isConnected) => {
    console.log('Connected:', isConnected);
  },
  onError: (error) => {
    console.error('Service error:', error);
  },
});

// Check connection
await service.checkConnection();
```

### Streaming Chat

```typescript
await service.sendMessageStreaming({
  model: 'claude-3-5-haiku-20241022',
  messages: [{ role: 'user', content: 'Hello' }],
  onChunk: (content) => {
    console.log('Received:', content);
  },
  onComplete: () => {
    console.log('Stream complete');
  },
  onError: (error) => {
    console.error('Stream error:', error);
  },
});
```

### Non-Streaming Chat

```typescript
const response = await service.sendMessage(
  'claude-3-5-haiku-20241022',
  [{ role: 'user', content: 'Hello' }]
);

console.log(response.choices[0].message.content);
```

### React Hooks

```typescript
import { useHTTPService, useStreamingChat } from '@/services/http/useHTTP';

function ChatScreen() {
  const { service, connectionStatus } = useHTTPService('http://localhost:8001');
  const { sendMessage, isStreaming, streamedContent } = useStreamingChat(service);

  const handleSend = () => {
    sendMessage({
      model: 'claude-3-5-haiku-20241022',
      messages: [{ role: 'user', content: 'Hello' }],
    });
  };

  return (
    <>
      <Text>Status: {connectionStatus}</Text>
      <Text>Response: {streamedContent}</Text>
      <Button onPress={handleSend} disabled={isStreaming} />
    </>
  );
}
```

---

## SSE Format

Backend sends OpenAI-compatible SSE:

```
data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"delta":{"role":"assistant","content":""}}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"delta":{"content":"Hello"}}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"delta":{},"finish_reason":"stop"}]}

data: [DONE]

```

SSE Client parses this using:
- Native `fetch` from `expo/fetch`
- `ReadableStream` for chunk reading
- `TextDecoder` for UTF-8 decoding
- Line-by-line parsing for "data: " format

---

## Features

### Exponential Backoff Reconnection
- 1s → 2s → 4s → 8s → 16s → 30s max
- Automatic retry on connection loss
- Configurable via ReconnectionManager

### Offline Queue
- Stores messages in AsyncStorage when offline
- Automatic retry on reconnect
- Max 3 retry attempts per message
- FIFO with 50 message limit

### Connection Status
- `connected`: Backend healthy
- `connecting`: Reconnection in progress
- `disconnected`: No connection
- `error`: Connection error occurred

### Error Handling
- HTTP errors surfaced via callbacks
- SSE parsing errors logged but don't crash
- Timeout support (default 60s)
- Graceful stream cancellation

---

## Testing

Test HTTP service independently before integration:

```typescript
import { HTTPService } from '@/services/http';

const service = new HTTPService({
  baseURL: 'http://localhost:8001'
});

// Test connection
const healthy = await service.checkConnection();
console.log('Backend healthy:', healthy);

// Test models
const models = await service.getModels();
console.log('Models:', models.data.map(m => m.id));

// Test chat
const response = await service.sendMessage(
  'claude-3-5-haiku-20241022',
  [{ role: 'user', content: 'Test' }]
);
console.log('Response:', response.choices[0].message.content);
```

---

## Migration from WebSocket

**Before** (WebSocket):
```typescript
wsService.connect(url);
wsService.on('message', handler);
wsService.send({ type: 'message', content: 'Hello' });
```

**After** (HTTP/SSE):
```typescript
await httpService.sendMessageStreaming({
  model: 'claude-3-5-haiku-20241022',
  messages: [{ role: 'user', content: 'Hello' }],
  onChunk: (content) => handler(content),
});
```

**Key Differences**:
- No persistent connection (HTTP is stateless)
- Sessions managed via `session_id` parameter
- Reconnection happens per-request, not connection-level
- Offline queue replaces WebSocket buffering

---

## Next Steps

1. Test HTTP service in isolation (Gate F1)
2. Update Zustand store to use HTTP service
3. Update all screens to use HTTP hooks
4. Remove old WebSocket service
5. Integration testing

---

**Status**: 6/8 files complete, ready for integration testing
