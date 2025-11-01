# Claude Code Mobile - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────┐
│     React Native Mobile App         │
│     (Expo, TypeScript)               │
│     - 8 Screens (Flat Black Theme)   │
│     - XHR SSE Streaming              │
│     - Zustand State Management       │
└──────────────┬──────────────────────┘
               │ HTTP/SSE
               │ OpenAI-compatible API
               ▼
┌─────────────────────────────────────┐
│    Python FastAPI Backend            │
│    (Port 8001)                       │
│    - 40+ REST API Endpoints          │
│    - 8 Services                      │
│    - SQLite Database                 │
└──────────────┬──────────────────────┘
               │ subprocess.exec
               │ JSONL output
               ▼
┌─────────────────────────────────────┐
│    Claude CLI 2.0.31                 │
│    - Authenticated session           │
│    - Tool execution                  │
│    - Streaming responses             │
└──────────────┬──────────────────────┘
               │ API calls
               ▼
┌─────────────────────────────────────┐
│    Claude API (Anthropic)            │
│    - 4 Models (Opus, Sonnet, Haiku)  │
│    - Streaming support               │
└─────────────────────────────────────┘
```

## Backend Architecture

### Layers

**1. API Layer** (`backend/claude_code_api/api/`)
- FastAPI routers (9 routers)
- Request/response validation (Pydantic)
- OpenAI-compatible endpoints
- Error handling middleware

**2. Service Layer** (`backend/claude_code_api/services/`)
- Business logic implementation
- File operations, Git, MCP, Prompts
- Session stats, caching, file watching
- Security (path validation, encryption)

**3. Core Layer** (`backend/claude_code_api/core/`)
- Database models (SQLAlchemy)
- Claude CLI process management
- Session lifecycle
- Configuration
- Authentication

**4. Utilities** (`backend/claude_code_api/utils/`)
- JSONL parsing
- SSE streaming
- Tool/thinking event forwarding

### Database Schema

**Tables**:
1. `projects` - Project metadata
2. `sessions` - Chat sessions with system prompts
3. `messages` - Message history with token usage
4. `api_keys` - API key tracking
5. `mcp_servers` - MCP configuration (encrypted)

**Relationships**:
```
projects 1──N sessions 1──N messages
```

### API Routers

1. **Chat** (`/v1/chat/completions`) - OpenAI-compatible chat
2. **Models** (`/v1/models`) - List Claude models
3. **Sessions** (`/v1/sessions`) - Session CRUD
4. **Projects** (`/v1/projects`) - Project CRUD
5. **Files** (`/v1/files/*`) - File operations (7 endpoints)
6. **Git** (`/v1/git/*`) - Git operations (8 endpoints)
7. **MCP** (`/v1/mcp/*`) - MCP management (9 endpoints)
8. **Prompts** (`/v1/prompts/*`) - System prompts (5 endpoints)
9. **Host** (`/v1/host/*`) - Host discovery (2 endpoints)
10. **Stats** (`/v1/stats/*`) - Analytics (4 endpoints)
11. **Admin** (`/v1/admin/*`) - System admin (3 endpoints)
12. **Batch** (`/v1/batch`) - Batch operations
13. **Search** (`/v1/search`) - Unified search
14. **Webhooks** (`/v1/webhooks`) - Event notifications

**Total**: 40+ endpoints

## Frontend Architecture

### Screens (8 total)

**Core Screens**:
1. **ChatScreen** - Primary chat interface with SSE streaming
2. **SettingsScreen** - App configuration
3. **SessionsScreen** - Session management

**New v2.0 Screens**:
4. **ProjectsScreen** - Host project discovery
5. **MCPManagementScreen** - MCP server CRUD
6. **GitScreen** - Git operations UI
7. **FileBrowserScreen** - Browse host filesystem
8. **CodeViewerScreen** - View code files

### State Management

**Zustand** with AsyncStorage persistence:
```typescript
interface AppState {
  currentSession: Session | null;
  messages: Message[];
  settings: AppSettings;
  isConnected: boolean;
  isStreaming: boolean;
}
```

**Persisted**: settings, recent commands
**Not Persisted**: messages (loaded from backend)

### Services

**HTTPService**:
- REST API client
- SSE streaming client (XHR-based)
- Connection management
- Offline queue
- Reconnection backoff

**SSEClient**:
- XMLHttpRequest for SSE (React Native compatible)
- Parses tool_use, tool_result, thinking events
- Progressive chunk processing

### Theme System

**Flat Black Theme** (v2.0):
```typescript
background: #0a0a0a  // Slightly warm black
card: #1a1a1a        // Elevated surfaces
border: #2a2a2a      // Subtle borders
primary: #4ecdc4     // Teal accent
text: #ffffff        // Pure white
```

**Replaced**: Purple gradient (#0f0c29 → #302b63 → #24243e)

## Data Flow

### Message Sending (Streaming)

```
1. User types message in ChatScreen
2. handleSend() creates optimistic message
3. HTTPService.sendMessageStreaming()
4. SSEClient opens XHR connection
5. Backend: POST /v1/chat/completions
6. Python spawns Claude CLI subprocess
7. Claude CLI outputs JSONL
8. Parser extracts content/tools/thinking
9. Streaming converts to OpenAI chunks
10. SSE events sent to mobile
11. XHR onreadystatechange fires (multiple times)
12. SSEClient parses chunks
13. onChunk callback updates message
14. Zustand updates trigger re-render
15. MessageBubble shows streaming text
```

### File Operations

```
1. FileBrowserScreen loads directory
2. HTTPClient.listFiles(path)
3. Backend: GET /v1/files/list
4. FileOperationsService.list_files()
5. Path validation (security)
6. Glob pattern matching
7. Returns FileInfo array
8. Frontend renders file list
9. Tap file → CodeViewerScreen
10. HTTPClient.readFile(path)
11. Backend: GET /v1/files/read
12. Returns file content
13. CodeViewerScreen displays with syntax highlighting
```

### Git Commit from Mobile

```
1. GitScreen shows status
2. User enters commit message
3. Taps "Commit"
4. HTTPClient.createGitCommit(path, message)
5. Backend: POST /v1/git/commit
6. GitOperationsService.create_commit()
7. GitPython: repo.index.commit(message)
8. Real commit created in repository
9. Returns commit SHA
10. Frontend shows success
```

## Security Architecture

### Path Validation

```python
allowed_paths = ["/Users", "/tmp", "/var"]

def _validate_path(path):
    resolved = Path(path).resolve()
    for allowed in allowed_paths:
        if resolved.is_relative_to(allowed):
            return resolved
    raise PermissionDeniedError()
```

**Blocks**:
- `/etc/passwd`
- `../../../sensitive-file`
- Symlink traversal attacks

### API Key Encryption

```python
from cryptography.fernet import Fernet

cipher = Fernet(encryption_key)
encrypted = cipher.encrypt(api_key.encode())
# Stored in mcp_servers.api_key_encrypted
```

**Never stored in plaintext**

### Rate Limiting

- 100 requests per minute
- Burst of 10 requests
- Per-client tracking

## SSE Streaming Protocol

### OpenAI-Compatible Chunks

```
data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"delta":{"role":"assistant","content":""}}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"delta":{"content":"Hello"}}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","choices":[{"delta":{"content":"!"}}]}

data: [DONE]
```

### Tool Events

```
data: {"choices":[{"delta":{"tool_use":{"id":"tool_123","name":"Read","input":{...}}}}]}

data: {"choices":[{"delta":{"tool_result":{"tool_use_id":"tool_123","content":"...","is_error":false}}}]}
```

### Thinking Events

```
data: {"choices":[{"delta":{"thinking":{"content":"Analyzing the request...","step":1}}}]}
```

## Performance Characteristics

**File Operations**:
- List 1000 files: ~50ms
- Read 10KB file: ~10ms
- Write file: ~15ms
- Search 1000 files: ~100ms

**Git Operations**:
- Status: ~100ms
- Log (50 commits): ~150ms
- Commit: ~300ms
- Diff: ~50ms

**Caching**:
- TTL: 5 minutes default
- Reduces repeated expensive operations

## Scalability

**Current Limits**:
- Max concurrent sessions: 10
- Max file list results: 10,000
- Max git log: 200 commits
- Max search results: 1,000

**Configurable** via Settings model

## Technology Stack

**Backend**:
- FastAPI 0.104+
- SQLAlchemy 2.0+ (async)
- GitPython 3.1+
- Cryptography (Fernet)
- Structlog (structured logging)

**Frontend**:
- React Native 0.73
- Expo SDK 54
- Zustand 5.0
- React Navigation 7
- AsyncStorage 2.2

**Infrastructure**:
- SQLite (dev) / PostgreSQL (prod)
- Uvicorn ASGI server
- Claude CLI 2.0.31

## Deployment Topologies

**Development**:
```
Mobile App (Simulator) ─HTTP─> Backend (localhost:8001) ─> Claude CLI (local)
```

**Production**:
```
Mobile App (Device) ─HTTPS─> Backend (Cloud) ─> Claude CLI (Cloud/Local)
                              ↓
                        PostgreSQL (RDS/Managed)
```

## Extension Points

**Adding New API Endpoint**:
1. Create service method in `services/`
2. Create Pydantic models in `models/`
3. Create router in `api/`
4. Register in `main.py`
5. Add validation script
6. Document in API-REFERENCE.md

**Adding New Frontend Screen**:
1. Create screen component in `src/screens/`
2. Add route in `AppNavigator.tsx`
3. Wire to backend via HTTPService
4. Apply flat black theme
5. Add testIDs for testing

## Monitoring

**Health Check**: `GET /health`
**Statistics**: `GET /v1/stats/global`
**Cache Stats**: `GET /v1/admin/cache/stats`
**System Info**: `GET /v1/admin/system/info`

## Error Handling

All errors use OpenAI format:
```json
{
  "error": {
    "message": "Description",
    "type": "error_type",
    "code": "error_code"
  }
}
```

HTTP codes: 200, 400, 403, 404, 409, 500, 501
