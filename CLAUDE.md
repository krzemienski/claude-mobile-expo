# Claude Code Mobile - Project Documentation

**Version**: 2.0.0
**Last Updated**: 2025-10-31
**Architecture**: Python FastAPI Backend + React Native Mobile App
**Status**: Backend functional (Gate P1 PASSED), Frontend implementation next

---

## Project Overview

Claude Code Mobile replicates Claude Code CLI functionality in a native iOS mobile app using React Native + Expo with a Python FastAPI backend.

**Critical Achievement**: Solved Agent SDK "spawn node ENOENT" issue by migrating to Python FastAPI with subprocess.exec.

---

## Architecture

```
React Native Mobile App (iOS)
    ↓
HTTP/SSE (OpenAI-compatible API)
    ↓
Python FastAPI Backend (port 8001)
    ↓
asyncio.create_subprocess_exec
    ↓
Claude Code CLI (/Users/nick/.local/bin/claude)
    ↓
Claude API (Anthropic)
```

**Why Python**: Node.js Agent SDK couldn't spawn Claude CLI subprocess ("spawn node ENOENT"). Python's asyncio.create_subprocess_exec solves this completely.

---

## Directory Structure

```
/Users/nick/Desktop/claude-mobile-expo/
├── backend/                    # Python FastAPI backend (1.1 MB)
│   ├── claude_code_api/        # Python package
│   │   ├── api/                # API endpoints (chat, models, projects, sessions)
│   │   ├── core/               # Core logic (claude_manager, session_manager, database, config, auth)
│   │   ├── models/             # Pydantic models (openai.py, claude.py)
│   │   ├── utils/              # Utilities (streaming.py, parser.py)
│   │   ├── tests/              # Test suite
│   │   └── main.py             # FastAPI app entry
│   ├── pyproject.toml          # Dependencies
│   ├── Makefile                # Commands (make install, make start, make test)
│   ├── README.md               # Backend documentation
│   └── .gitignore              # Ignore *.db, *.log, __pycache__, etc.
│
├── claude-code-mobile/         # React Native + Expo app (1.4 GB)
│   ├── src/
│   │   ├── screens/            # 5 screens (Chat, Settings, FileBrowser, CodeViewer, Sessions)
│   │   ├── components/         # 6 components (MessageBubble, ToolExecutionCard, etc.)
│   │   ├── services/           # WebSocket service (TO BE REPLACED with HTTP)
│   │   ├── store/              # Zustand state management
│   │   ├── navigation/         # React Navigation stack
│   │   ├── constants/          # Theme, design system
│   │   └── types/              # TypeScript interfaces
│   ├── App.tsx                 # App entry point
│   ├── index.js                # React Native registration
│   ├── package.json            # Dependencies
│   └── app.json                # Expo configuration
│
├── docs/                       # Documentation (772 KB)
│   ├── specs/                  # Original specification
│   ├── plans/                  # Implementation plans, migration plan
│   └── validation/             # Gate specifications
│
├── scripts/                    # Test and automation scripts (56 KB)
│   ├── test-python-backend-sanity.sh       # Backend sanity check (6 tests)
│   ├── test-python-backend-functional.sh   # Comprehensive tests (20 tests)
│   └── [Other iOS/Metro management scripts]
│
├── logs/                       # Application logs
├── package.json                # Root package.json
└── CLAUDE.md                   # This file
```

---

## Backend (Python FastAPI)

### Technology Stack

- **Framework**: FastAPI 0.104.0+
- **Server**: Uvicorn with auto-reload
- **Database**: SQLite with SQLAlchemy + aiosqlite
- **Logging**: structlog (structured JSON logging)
- **Auth**: Optional (disabled for testing via `require_auth=False`)
- **Python**: 3.10+ (tested with 3.12)

### Setup & Running

```bash
# Install dependencies
cd backend
pip3 install -e .

# Start backend (development with auto-reload)
uvicorn claude_code_api.main:app --host 0.0.0.0 --port 8001 --reload

# Or use Makefile
make install  # Install
make start    # Start with reload

# Health check
curl http://localhost:8001/health
```

### API Endpoints (OpenAI-Compatible)

**Base URL**: `http://localhost:8001`

#### Core Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check, Claude version |
| `/` | GET | API information |
| `/v1/models` | GET | List 4 Claude models |
| `/v1/models/{model_id}` | GET | Get specific model info |
| `/v1/chat/completions` | POST | Chat with streaming or non-streaming |
| `/v1/projects` | GET/POST/DELETE | Project management |
| `/v1/sessions` | GET/POST/DELETE | Session management |

#### Chat Completions

**Non-Streaming Request**:
```json
{
  "model": "claude-3-5-haiku-20241022",
  "messages": [{"role": "user", "content": "Hello"}],
  "stream": false
}
```

**Non-Streaming Response**:
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "model": "claude-3-5-haiku-20241022",
  "choices": [{
    "index": 0,
    "message": {"role": "assistant", "content": "Response text"},
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 5,
    "total_tokens": 15
  },
  "session_id": "uuid",
  "project_id": "project-id"
}
```

**SSE Streaming** (set `"stream": true` and accept `text/event-stream`):
```
data: {"id":"chatcmpl-xxx","choices":[{"delta":{"role":"assistant","content":""}}]}

data: {"id":"chatcmpl-xxx","choices":[{"delta":{"content":"Hello"}}]}

data: {"id":"chatcmpl-xxx","choices":[{"delta":{},"finish_reason":"stop"}]}

data: [DONE]

```

### Claude CLI Integration

**How It Works**:
```python
# backend/claude_code_api/core/claude_manager.py:68-76
cmd = ["/Users/nick/.local/bin/claude", "-p", prompt]
cmd.extend(["--output-format", "stream-json", "--dangerously-skip-permissions"])

process = await asyncio.create_subprocess_exec(
    *cmd,
    cwd=src_dir,  # Runs from Python package directory
    stdout=asyncio.subprocess.PIPE,
    stderr=asyncio.subprocess.PIPE
)

stdout, stderr = await process.communicate()  # Wait for completion
```

**Claude CLI Output** (JSONL - one JSON per line):
```json
{"type":"assistant","message":{"role":"assistant","content":[{"type":"text","text":"Hello!"}]}}
{"type":"result","usage":{"input_tokens":10,"output_tokens":5},"cost_usd":0.001}
```

**Conversion Flow**:
```
Claude JSONL → parser.py → streaming.py → OpenAI format → SSE/JSON response
```

### Database Schema (SQLite)

**File**: `backend/claude_api.db` (auto-created on startup)

**Tables**:
- `projects`: Project definitions (id, name, path, created_at)
- `sessions`: Active sessions (id, project_id, model, tokens, cost)
- `messages`: Conversation history (id, session_id, role, content, tokens)
- `api_keys`: Authentication (id, key_hash, usage stats)

**Queries**:
```bash
sqlite3 backend/claude_api.db ".tables"
sqlite3 backend/claude_api.db "SELECT * FROM sessions;"
```

### Available Models (4 Total)

| Model ID | Name | Cost (Input/Output per 1k) |
|----------|------|---------------------------|
| `claude-opus-4-20250514` | Opus 4 | $15.00 / $75.00 |
| `claude-sonnet-4-20250514` | Sonnet 4 | $3.00 / $15.00 |
| `claude-3-7-sonnet-20250219` | Sonnet 3.7 | $3.00 / $15.00 |
| `claude-3-5-haiku-20241022` | Haiku 3.5 (default) | $0.25 / $1.25 |

### Testing

**Sanity Check** (6 tests):
```bash
./scripts/test-python-backend-sanity.sh
# Tests: health, models, chat, streaming, OpenAI compatibility
# Pass: Exit code 0
```

**Comprehensive Tests** (20 tests):
```bash
./scripts/test-python-backend-functional.sh
# Tests: All endpoints, tool execution, database, sessions
```

### Configuration

**Environment Variables** (optional, has defaults):
```bash
# .env file (optional)
CLAUDE_BINARY_PATH=/Users/nick/.local/bin/claude  # Auto-detected
DATABASE_URL=sqlite:///./claude_api.db
PORT=8001
REQUIRE_AUTH=false  # Disable auth for testing
PROJECT_ROOT=/tmp/claude_projects
```

**Defaults** (from `claude_code_api/core/config.py`):
- Auto-detects Claude CLI path
- No authentication required (test mode)
- Port 8001 (Docker using 8000)
- CORS: All origins allowed

---

## Frontend (React Native + Expo)

### Technology Stack

- **Framework**: React Native 0.81.5
- **Build Tool**: Expo SDK 54
- **Navigation**: React Navigation 7.1.8 (Stack Navigator)
- **State**: Zustand (with AsyncStorage persistence)
- **WebSocket**: Currently implemented (TO BE REPLACED with HTTP/SSE)
- **Animations**: Reanimated 4.1.1
- **Testing**: expo-mcp 0.1.15

### Current Status

**Implemented** (~4,000 lines):
- ✅ All 5 screens (Chat, Settings, FileBrowser, CodeViewer, Sessions)
- ✅ All 6 components (MessageBubble, ToolExecutionCard, etc.)
- ✅ Zustand store with AsyncStorage
- ✅ WebSocket service (Rocket.Chat reconnection patterns)
- ✅ Design system (purple gradient, teal primary)
- ✅ Stack navigation
- ✅ TypeScript types

**Needs Migration** (Phase 3-4):
- ❌ Replace WebSocket with HTTP/SSE service
- ❌ Install react-native-sse package
- ❌ Update Zustand store for HTTP
- ❌ Update all screens to use HTTP service
- ❌ Remove old WebSocket code

### Setup & Running

```bash
# Install dependencies
cd claude-code-mobile
npm install

# Start Metro bundler
npx expo start --clear

# Build and run on iOS
npx expo run:ios

# Specific device
npx expo run:ios --device "iPhone 16"
```

### App Structure

**Screens** (src/screens/):
- `ChatScreen.tsx`: Primary interface, message list, input, send button
- `SettingsScreen.tsx`: Server configuration, preferences
- `FileBrowserScreen.tsx`: File/directory navigation
- `CodeViewerScreen.tsx`: Syntax highlighted code display
- `SessionsScreen.tsx`: Session management (list, switch, delete)

**Components** (src/components/):
- `MessageBubble.tsx`: User/assistant message display
- `ToolExecutionCard.tsx`: Tool execution with expand/collapse
- `StreamingIndicator.tsx`: Animated typing indicator
- `SlashCommandMenu.tsx`: Command list with filter
- `ConnectionStatus.tsx`: Connection status indicator
- `FileItem.tsx`: File/directory item display

**State Management** (src/store/):
- `useAppStore.ts`: Zustand store with AsyncStorage persistence
- Current: WebSocket-based
- Migration: Will use HTTP/SSE

**Services** (src/services/):
- `websocket.service.ts`: Current WebSocket client (TO BE REPLACED)
- Future: `http/` directory with SSE streaming client

### Design System

**Colors**:
- Background: Purple gradient (#0f0c29 → #302b63 → #24243e)
- Primary: Teal (#4ecdc4)
- Text: Off-white (#ecf0f1)

**Typography**:
- Primary: System font (San Francisco on iOS)
- Mono: Menlo (code display)
- Sizes: 10px - 32px

**Spacing**: 8-point grid (2px - 48px)

---

## Testing Strategy

### Backend Testing (NO MOCKS)

**Method**: Functional testing with REAL operations

**Sanity Check**:
```bash
./scripts/test-python-backend-sanity.sh
```

**Tests**:
1. Health endpoint
2. Claude CLI availability
3. Models API (4 models)
4. Non-streaming chat completion
5. SSE streaming format
6. OpenAI compatibility

**All tests use real curl, real Claude API calls, real database writes**

### Frontend Testing (expo-mcp + xc-mcp)

**Method**: Visual autonomous testing

**Tools**:
- expo-mcp: React Native level testing (screenshots, testID tapping)
- xc-mcp: iOS simulator management (boot, install, launch)
- IDB CLI: UI automation (tap coordinates, accessibility tree)

**Pattern**:
```
1. Take screenshot
2. AI analyzes visually
3. AI fixes if wrong
4. AI retests
5. Loop until perfect
```

**No manual verification required** - AI determines pass/fail autonomously

---

## Validation Gates

### Gate P1: Python Backend Functional ✅ PASSED

**Status**: PASSED (2025-10-31)
**Tests**: 6/6 passed
**Evidence**:
- Backend starts on port 8001 ✅
- Claude CLI integration working ✅
- Chat completions functional ✅
- SSE streaming correct ✅
- Database persisting ✅

### Gate F1: Frontend HTTP Service (Next)

**Requirements**:
- Install react-native-sse
- Create HTTP service layer
- Test SSE client in isolation
- Verify OpenAI request/response handling

### Gate F2: Frontend Migration

**Requirements**:
- Update Zustand store for HTTP
- Update all screens
- Remove WebSocket code
- App builds and runs

### Gate I1: Integration Testing

**Requirements**:
- Complete environment running
- End-to-end message flow
- All screens functional
- Screenshot validation

### Gate 4A: Production Ready

**Requirements**:
- All features working
- Performance acceptable
- No crashes
- Complete testing

---

## Common Commands

### Backend

```bash
# Start backend
cd backend
uvicorn claude_code_api.main:app --host 0.0.0.0 --port 8001 --reload

# Or use Makefile
make start

# Run tests
./scripts/test-python-backend-sanity.sh

# Check health
curl http://localhost:8001/health

# List models
curl http://localhost:8001/v1/models

# Chat completion
curl -X POST http://localhost:8001/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"model":"claude-3-5-haiku-20241022","messages":[{"role":"user","content":"Hello"}],"stream":false}'
```

### Frontend

```bash
# Install dependencies
cd claude-code-mobile
npm install

# Start Metro
npx expo start --clear

# Build iOS
npx expo run:ios

# With MCP server (for testing)
EXPO_UNSTABLE_MCP_SERVER=1 npx expo start
```

### Database

```bash
# View sessions
sqlite3 backend/claude_api.db "SELECT id, model, total_tokens FROM sessions;"

# View messages
sqlite3 backend/claude_api.db "SELECT role, content FROM messages LIMIT 5;"

# List tables
sqlite3 backend/claude_api.db ".tables"
```

---

## Skills

### Backend Testing

**python-fastapi-claude-backend-testing**:
- Complete OpenAI API spec
- SSE format specification
- curl test patterns
- Verification methods

**Location**: `~/.claude/skills/python-fastapi-claude-backend-testing/SKILL.md`

**Usage**: Reference when testing backend, writing API clients, debugging SSE

### Other Skills

- `systematic-debugging`: 4-phase debugging framework
- `test-driven-development`: RED-GREEN-REFACTOR for code
- `writing-skills`: TDD for documentation
- `executing-plans`: Batch execution with review gates

---

## Prerequisites

### Backend Prerequisites

1. **Python 3.10+**: `python3 --version`
2. **Claude CLI**: `/Users/nick/.local/bin/claude --version`
3. **Claude Authenticated**: `claude config list | grep api_key`
4. **pip**: For installing dependencies

### Frontend Prerequisites

1. **Node.js 18+**: `node --version`
2. **npm**: `npm --version`
3. **Expo CLI**: `npx expo --version`
4. **Xcode**: For iOS builds
5. **iOS Simulator**: For testing

---

## Migration History

### Original Architecture (Node.js - FAILED)

```
Mobile → WebSocket → Node.js Express → Agent SDK → Claude CLI
                                          ❌ spawn node ENOENT
```

**Problem**: Agent SDK couldn't spawn Claude CLI subprocess
**Attempts**: 4+ fixes (PATH, env vars, explicit paths)
**Result**: All failed, 410k tokens consumed

### New Architecture (Python - SUCCESS)

```
Mobile → HTTP/SSE → Python FastAPI → subprocess.exec → Claude CLI
                                          ✅ WORKING
```

**Solution**: Python's asyncio.create_subprocess_exec
**Result**: Claude CLI spawns successfully
**Validation**: Gate P1 PASSED (6/6 tests)

---

## Current Phase: Frontend Migration

### Next Steps

1. **Phase 3: Frontend HTTP Service**
   - Install react-native-sse via expo-mcp
   - Create `src/services/http/` directory
   - Implement SSE streaming client
   - Test HTTP service in isolation
   - **Gate F1**: HTTP service functional

2. **Phase 4: Frontend Migration**
   - Update `src/store/useAppStore.ts` (HTTP instead of WebSocket)
   - Update all 5 screens to use HTTP service
   - Remove `src/services/websocket.service.ts`
   - Remove WebSocket context
   - Build and verify compilation
   - **Gate F2**: Frontend migrated

3. **Phase 5: Integration Testing**
   - Start complete environment (Python + Metro + iOS)
   - Test end-to-end message flow
   - Test all screens with IDB automation
   - Screenshot validation
   - **Gate I1**: Integration validated

4. **Phase 6-8: Skills, Testing, Documentation**
   - Create testing skills
   - Comprehensive validation
   - **Gate 4A**: Production ready

---

## Key Files Reference

### Backend Critical Files

- `backend/claude_code_api/core/claude_manager.py`: Claude CLI subprocess management
- `backend/claude_code_api/api/chat.py`: Chat completions endpoint
- `backend/claude_code_api/utils/streaming.py`: SSE formatting (FIXED: removed max_chunks limit)
- `backend/claude_code_api/models/openai.py`: Request/response schemas
- `backend/claude_code_api/core/database.py`: SQLAlchemy models

### Frontend Critical Files

- `claude-code-mobile/App.tsx`: App entry, WebSocket initialization
- `claude-code-mobile/src/store/useAppStore.ts`: Zustand store
- `claude-code-mobile/src/services/websocket.service.ts`: WebSocket client (TO REPLACE)
- `claude-code-mobile/src/screens/ChatScreen.tsx`: Primary UI (500+ lines)
- `claude-code-mobile/src/constants/theme.ts`: Design system

### Documentation

- `docs/specs/claude-code-expo-v1.md`: Original specification (2,885 lines)
- `docs/plans/2025-10-31-python-fastapi-migration-plan.md`: Migration plan (247 tasks)
- `docs/SESSION-RESUME-PROTOCOL.md`: Context restoration guide

### Scripts

- `scripts/test-python-backend-sanity.sh`: Quick backend validation (6 tests)
- `scripts/test-python-backend-functional.sh`: Comprehensive tests (20 tests)

---

## Troubleshooting

### Backend Won't Start

```bash
# Check Python version
python3 --version  # Need 3.10+

# Check Claude CLI
/Users/nick/.local/bin/claude --version

# Check port availability
lsof -i:8001

# View logs (if started in background)
tail -f logs/python-backend-8001.log
```

### Backend Tests Failing

```bash
# Check backend is running
curl http://localhost:8001/health

# Check Claude CLI authenticated
claude config list | grep api_key

# Run sanity check with output
./scripts/test-python-backend-sanity.sh | tee /tmp/test-output.txt
```

### Frontend Build Errors

```bash
# Clean and rebuild
cd claude-code-mobile
rm -rf node_modules
npm install
npx expo start --clear
```

---

## Performance

**Backend**:
- Request latency: < 100ms (excluding Claude API)
- Claude CLI spawn: 5-10 seconds
- SSE streaming: Real-time chunks
- Database: SQLite (sufficient for mobile backend)

**Frontend**:
- Target: 60 FPS UI
- Launch: < 2s cold start
- Memory: < 100MB average

---

## Security Notes

### Backend

- ✅ No API key needed (Claude CLI handles auth)
- ✅ CORS configurable (default: allow all for development)
- ✅ Auth optional (disabled for testing)
- ✅ Rate limiting available (100 req/min)
- ⚠️ Currently uses `--dangerously-skip-permissions` for Claude CLI

### Frontend

- Validate inputs before sending
- Handle errors gracefully
- Use HTTPS in production
- Don't expose sensitive data

---

## Token Budget

**Total Available**: 1M tokens per session
**Phase 1 (Backend)**: ~350k consumed
- Analysis: 150k
- Setup: 50k
- Testing: 100k
- Debugging: 50k

**Remaining**: ~650k for frontend migration

---

## Skills Created This Session

1. **python-fastapi-claude-backend-testing**: Complete backend API reference
   - OpenAI request/response schemas
   - SSE format spec
   - curl test patterns
   - Verification methods

---

## Git Repository

**Location**: `/Users/nick/Desktop/claude-mobile-expo/`
**Branch**: master
**Latest Commit**: c8f525f - Python FastAPI migration

**Important Commits**:
- c8f525f: Python backend migration (Gate P1)
- da0e4ef: Migration plan and test script
- a3eb994: WebSocket integration fixes
- db54594: Session resume protocol
- 70d8de9: Next session primer

---

## Contact & Resources

**Claude Code CLI**: https://docs.claude.com/en/docs/claude-code
**FastAPI Docs**: https://fastapi.tiangolo.com
**React Native**: https://reactnative.dev
**Expo**: https://docs.expo.dev

---

**For next session**: Read `gate-p1-PASSED-python-backend-validated-2025-10-31` memory to restore complete context.
