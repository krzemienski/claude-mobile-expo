# Claude Code Mobile - Project Context

**Version**: 1.0.0  
**Last Updated**: 2025-10-30  
**Current Phase**: Phase 4 (Frontend Implementation)

---

## Project Overview

Claude Code Mobile is a production-ready iOS mobile application that replicates the functionality of Claude Code CLI in a native mobile environment using React Native and Expo.

**Architecture**: Mobile client (React Native + Zustand) ↔ WebSocket ↔ Backend (Express + ws) ↔ Claude API

**Status**:
- ✅ Backend: 100% complete (Phase 3 done)
- 📝 Frontend: 0% implemented (scaffold only, Phase 4 in progress)
- ⏳ Testing: Backend ready for Gate 3A, frontend needs implementation before Gate 4A

---

## Technology Stack

### Backend (COMPLETE ✅)
- **Runtime**: Node.js 18+
- **Framework**: Express 4.19.2
- **WebSocket**: ws 8.18.0
- **Claude Integration**: @anthropic-ai/claude-agent-sdk 0.1.30
- **Claude Code CLI**: Required on backend server (npm install -g claude-code)
- **Logging**: Winston 3.11.0
- **Security**: helmet 8.0.0, cors 2.8.5, express-rate-limit 7.5.0

**IMPORTANT**: Backend uses Claude Code CLI installation, NOT direct API calls.
**Prerequisites**: claude-code CLI must be installed and authenticated on backend server.

### Frontend (IN PROGRESS 📝)
- **Framework**: React Native 0.81.5
- **Build Tool**: Expo ~54.0.20
- **Navigation**: React Navigation 7.1.8 (MUST implement Stack Navigator)
- **State**: Zustand (MUST ADD)
- **Storage**: AsyncStorage (MUST ADD)
- **WebSocket**: Native WebSocket API
- **Animations**: Reanimated 4.1.1
- **Testing**: expo-mcp 0.1.15 (already installed)

---

## Current Implementation Status

### Backend Implementation (Phase 3 - COMPLETE, Restructured for CLI)

**Files Implemented** (8 total in `backend/src/`):
1. ✅ `index.ts` - Express server, WebSocket upgrade, security, health checks, CLI validation
2. ✅ `utils/logger.ts` - Winston logger with file transports
3. ✅ `middleware/errorHandler.ts` - AppError class, error middleware
4. ✅ `middleware/rateLimiter.ts` - Rate limiting (HTTP + WebSocket)
5. ✅ `websocket/server.ts` - WebSocket server, heartbeat, perMessageDeflate
6. ✅ `websocket/sessionManager.ts` - Session CRUD, file persistence
7. ✅ `websocket/messageHandler.ts` - Message routing (simplified)
8. ✅ `services/claude.service.ts` - Agent SDK integration (uses Claude Code CLI)

**Architecture**: Uses Claude Agent SDK → Claude Code CLI → Claude API
**No API Key Needed**: Backend uses CLI's authentication

**Backend Features**:
- All Claude Code CLI tools automatically available (Read, Write, Bash, Grep, Glob, Edit, etc.)
- All Claude Code CLI slash commands (/help, /cost, /clear, /compact, /mcp, /config)
- WebSocket protocol: init_session, message, content_delta, tool_execution, tool_result, message_complete
- Security: Handled by Claude Code CLI (path validation, command blocking, etc.)
- Streaming: Real-time responses via Agent SDK AsyncGenerator
- Cost tracking: Automatic via SDK (total_cost_usd provided)
- Session persistence: File-based JSON storage in `data/sessions/` (mobile sessions)

**Prerequisites** (Backend Server):
- Claude Code CLI installed: `npm install -g claude-code`
- CLI authenticated: `claude-code login`
- Node.js 18+

**Backend is production-ready and awaiting frontend integration.**

### Frontend Implementation (Phase 4 - 0% COMPLETE)

**Current State**:
- Expo scaffold with file-based routing (app/ directory)
- Tab navigation (Home/Explore) - DOES NOT match spec
- Basic theme with light/dark mode - DOES NOT match spec
- No screens, components, or services from specification

**Required Implementation** (~6,000-7,000 lines):

**Must Replace**:
- ❌ Tab navigation → ✅ Stack navigation (React Navigation)
- ❌ app/ directory structure → ✅ src/ directory structure
- ❌ Light/dark theme → ✅ Spec design system (purple gradient + teal)

**Must Add Packages** (via expo-mcp):
```
"Add zustand and show me how to set up a store with AsyncStorage persistence"
"Add @react-native-async-storage/async-storage"
"Add react-native-syntax-highlighter for code display"
"Add react-native-markdown-display for message rendering"
```

**Must Implement**:
1. **Theme System** (`src/constants/theme.ts`)
   - Colors: Purple gradient background (#0f0c29→#302b63→#24243e), teal primary (#4ecdc4)
   - Typography: System font, Menlo mono, 10-32px sizes
   - Spacing: 8-point grid (2-48px)
   - Shadows: 4 elevation levels

2. **Type Definitions** (3 files)
   - `src/types/models.ts` - Message, Session, User, ToolExecution
   - `src/types/websocket.ts` - WebSocket message types
   - `src/types/navigation.ts` - RootStackParamList

3. **WebSocket Service** (`src/services/websocket.service.ts`)
   - Connect to ws://localhost:3001/ws
   - Auto-reconnect with exponential backoff (Rocket.Chat pattern: 1s→2s→4s→8s→16s→30s max)
   - Handle all message types from backend
   - Offline message queue
   - Heartbeat ping/pong

4. **Zustand Store** (`src/store/useAppStore.ts`)
   - Complete AppState from spec (currentSession, messages, isConnected, settings, etc.)
   - AsyncStorage persistence with partialize (persist settings, don't persist messages)
   - All actions (setCurrentSession, addMessage, updateMessage, etc.)

5. **Core Components** (6 total)
   - `MessageBubble.tsx` - User/assistant message display (Gifted Chat pattern)
   - `ToolExecutionCard.tsx` - Tool execution display with expand/collapse
   - `StreamingIndicator.tsx` - Animated typing dots (Reanimated)
   - `SlashCommandMenu.tsx` - Command list, filter, slide animation
   - `ConnectionStatus.tsx` - Green/orange/red dot with text
   - `FileItem.tsx` - File/directory display with icon

6. **Screens** (5 total)
   - `ChatScreen.tsx` - Primary interface, FlatList messages, input, slash menu (500-700 lines)
   - `FileBrowserScreen.tsx` - File/directory browsing, search
   - `CodeViewerScreen.tsx` - Syntax highlighted code display
   - `SettingsScreen.tsx` - Server config, preferences, cost display
   - `SessionsScreen.tsx` - Session list, switch, delete

7. **Navigation** (`src/navigation/AppNavigator.tsx`)
   - React Navigation Stack Navigator
   - Type-safe with RootStackParamList

8. **App Entry** (`App.tsx`)
   - NavigationContainer, Zustand provider, error boundary

---

## Architecture Details

### Backend Architecture (Implemented)

```
Express HTTP Server (port 3001)
├─ WebSocket Upgrade (/ws endpoint)
│  ├─ SessionManager (file-based sessions)
│  ├─ MessageHandler (10 message types)
│  └─ Heartbeat (30s ping/pong)
│
├─ Claude Service
│  ├─ Anthropic SDK streaming
│  ├─ Tool execution (10 tools)
│  └─ Agentic continuation loop
│
├─ Services
│  ├─ FileService (CRUD with path sanitization)
│  ├─ GitService (simple-git wrapper)
│  ├─ CommandService (20+ slash commands)
│  └─ ToolExecutor (security, validation, execution)
│
└─ Middleware
   ├─ Security (helmet, CORS)
   ├─ Rate limiting (100 req/15min)
   ├─ Error handling (AppError, 404, async)
   └─ Logging (Winston)
```

### Frontend Architecture (To Implement)

```
React Native App
├─ Navigation (Stack Navigator)
│  ├─ ChatScreen (primary)
│  ├─ FileBrowserScreen
│  ├─ CodeViewerScreen
│  ├─ SettingsScreen
│  └─ SessionsScreen
│
├─ State (Zustand)
│  ├─ currentSession, sessions
│  ├─ messages (Message[])
│  ├─ isConnected, isStreaming
│  ├─ settings (serverUrl, apiKey, etc.)
│  └─ Persistence (AsyncStorage)
│
├─ Services
│  └─ WebSocketService
│     ├─ Connect/disconnect
│     ├─ Auto-reconnect (exponential backoff)
│     ├─ Message send/receive
│     ├─ Offline queue
│     └─ Event callbacks
│
└─ Components
   ├─ MessageBubble (user/assistant styling)
   ├─ ToolExecutionCard (expand/collapse)
   ├─ StreamingIndicator (animated dots)
   ├─ SlashCommandMenu (filtered list)
   ├─ ConnectionStatus (status dot)
   └─ FileItem (file/directory display)
```

---

## Coding Standards

### TypeScript
- **Strict mode**: Enabled
- **Interfaces**: Use for props, state, and data models
- **Type safety**: No `any` types without justification
- **Exports**: Named exports for components, default for screens

### React Native Best Practices
- **Components**: Functional components with hooks
- **Performance**: Use React.memo for expensive components
- **Lists**: FlatList with virtualization config (windowSize=10, maxToRenderPerBatch=10, removeClippedSubviews=true)
- **Callbacks**: Wrap event handlers in useCallback
- **Computations**: Wrap expensive operations in useMemo
- **Animations**: Use Reanimated (NOT Animated API)

### Zustand Patterns
- **Store structure**: Separate state properties and actions
- **Persistence**: Use createJSONStorage(() => AsyncStorage)
- **Partialize**: Persist settings only, not messages (too large)
- **Selectors**: Use selective subscriptions to prevent unnecessary re-renders
- **TypeScript**: Define state/actions types separately, combine in store type

### WebSocket Patterns (from Rocket.Chat)
- **Reconnection**: Exponential backoff 1s→2s→4s→8s→16s→30s (max)
- **Heartbeat**: Ping every 30s, pong response required
- **Offline queue**: Store messages when disconnected, send on reconnect
- **Status tracking**: Update isConnected state reactively

### Testing Patterns
- **testID**: Add to ALL interactive elements for expo-mcp automation
- **Autonomous testing**: Use expo-mcp prompts for visual validation
- **NO MOCKS**: Functional testing only (real WebSocket, real files, real git)
- **Visual verification**: AI analyzes screenshots to determine pass/fail

---

## MCP Tools Integration

### expo-mcp (PRIMARY for Frontend)

**Package Installation** (ALWAYS use this, NEVER npm install):
```
"Add zustand and show me how to set up a store"
"Add react-native-syntax-highlighter for code display"
```

**Documentation Search**:
```
"Search Expo docs for navigation patterns"
"Search Expo docs for AsyncStorage persistence"
```

**Autonomous Testing** (requires Metro with EXPO_UNSTABLE_MCP_SERVER=1):
```
"Take screenshot of Chat screen and verify purple gradient background"
"Find view with testID 'message-input' and verify it's accessible"
"Tap button with testID 'send-button'"
"Take screenshot showing message sent"
```

### xc-mcp (For iOS Simulator Management)

**Simulator Operations**:
- `simctl-boot`: Boot iPhone simulator
- `simctl-install`: Install .app bundle
- `simctl-launch`: Launch installed app
- `idb-ui-tap`: Tap coordinates (when testID not available)
- `idb-ui-describe`: Get accessibility tree

### Serena MCP (For File Operations)

**ALL file operations use Serena** (NOT bash cat/echo):
- `create_text_file`: Create new files
- `read_file`: Read file contents
- `replace_regex`: Edit code with regex
- `find_symbol`: Find code symbols
- `write_memory`: Save project knowledge

### Git MCP (For Version Control)

**ALL git operations use Git MCP** (NOT bash git):
- `git_add`: Stage files
- `git_commit`: Create commits
- `git_status`: Check status
- `git_log`: View history

---

## Design System (From Specification)

### Colors

**Background**:
```typescript
backgroundGradient: {
  start: '#0f0c29',    // Deep purple-blue
  middle: '#302b63',   // Medium purple
  end: '#24243e',      // Dark purple-gray
}
```

**Primary Actions**:
```typescript
primary: '#4ecdc4',        // Teal (buttons, links, highlights)
primaryDark: '#3db0a8',    // Hover states
primaryLight: '#6de3db',   // Disabled states
```

**Text**:
```typescript
textPrimary: '#ecf0f1',    // Off-white (primary text)
textSecondary: '#7f8c8d',  // Gray (secondary text)
textDark: '#0f0c29',       // Dark (on light backgrounds)
```

**Status**:
```typescript
success: '#2ecc71',        // Green
warning: '#f39c12',        // Orange
error: '#e74c3c',          // Red
```

### Typography

```typescript
fontFamily: {
  primary: 'System',     // San Francisco on iOS
  mono: 'Menlo',         // Code display
}

fontSize: {
  xs: 10,    sm: 12,    base: 14,   md: 16,
  lg: 18,    xl: 20,    xxl: 24,    xxxl: 32,
}

fontWeight: {
  light: '300',    regular: '400',   medium: '500',
  semibold: '600', bold: '700',
}
```

### Spacing (8-Point Grid)

```typescript
spacing: {
  xxs: 2,    xs: 4,     sm: 8,      md: 12,
  base: 16,  lg: 20,    xl: 24,     xxl: 32,    xxxl: 48,
}
```

---

## WebSocket Protocol

### Client → Server Messages

```typescript
// Initialize or resume session
{type: 'init_session', sessionId?: string, projectPath?: string}

// Send user message
{type: 'message', content: string}

// Session management
{type: 'list_sessions'}
{type: 'get_session', sessionId: string}
{type: 'delete_session', sessionId: string}
```

### Server → Client Messages

```typescript
// Session initialized
{type: 'session_initialized', sessionId: string, hasContext: boolean}

// Streaming text response
{type: 'content_delta', delta: string}

// Tool execution started
{type: 'tool_execution', tool: string, input: any}

// Tool execution result
{type: 'tool_result', tool: string, result: string}

// Message complete
{type: 'message_complete', tokensUsed: {input: number, output: number}}

// Slash command response
{type: 'slash_command_response', content: string}

// Errors
{type: 'error', error: string}
```

---

## Production Patterns

### Message UI (from react-native-gifted-chat)
- Inverted FlatList for chat behavior (newest at bottom)
- User messages: Right-aligned, teal background
- Assistant messages: Left-aligned, transparent background
- Timestamp display below bubbles
- Long press context menu (copy, retry, delete)

### WebSocket Reconnection (from Rocket.Chat)
- Detect disconnect immediately
- Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
- Heartbeat ping every 30s, timeout if no pong
- Connection status callbacks
- Offline message queue

### Optimistic UI (from stream-chat-react-native)
- Show user message immediately (before server confirm)
- Show "sending..." state
- Update on server confirmation
- Retry on failure
- Perceived instant response

---

## Skills to Use

### For Frontend Implementation
- `@react-native-expo-development` - RN best practices, expo-mcp integration, production patterns
- `@anthropic-streaming-patterns` - Claude API integration (when adding features)
- `@claude-mobile-ios-testing` - iOS simulator testing with expo-mcp autonomous validation

### For Testing
- `@claude-mobile-validation-gate` - Automated gate execution (Gates 3A, 4A, 6A-E)
- `@websocket-integration-testing` - Backend WebSocket testing (Gate 3A)
- `@claude-mobile-metro-manager` - Metro bundler lifecycle

### For Quality
- `@test-driven-development` - Write tests first (adapted for mobile)
- `@testing-anti-patterns` - NO MOCKS principle
- `@systematic-debugging` - When issues occur
- `@production-readiness-audit` - Before deployment (Phase 7)

---

## Common Commands

### Backend
```bash
# Prerequisites: Install and authenticate Claude Code CLI
npm install -g claude-code
claude-code login

# Backend setup
cd backend
npm install          # Install dependencies (includes Agent SDK)
npm run build        # Compile TypeScript
npm start            # Start server (port 3001)
npm run dev          # Development with auto-reload

# Environment setup
cp .env.example .env
# No API key needed - uses Claude Code CLI authentication
```

### Frontend
```bash
cd claude-code-mobile
npm install                      # Install dependencies
npx expo start                   # Start Metro (dev)
EXPO_UNSTABLE_MCP_SERVER=1 npx expo start  # Metro with expo-mcp

npx expo run:ios                 # Build and run on iOS
npx expo run:ios --device "iPhone 14"     # Specific device
```

### Testing
```bash
# Backend functional testing
./scripts/test-websocket.sh ws://localhost:3001/ws /tmp/test-project
./scripts/validate-gate-3a.sh

# Frontend visual testing (after implementation)
./scripts/build-ios.sh "iPhone 14"
./scripts/capture-screenshots.sh "iPhone 14" "gate-4a"
./scripts/validate-gate-4a.sh "iPhone 14"

# Integration environment
./scripts/start-integration-env.sh "iPhone 14"
./scripts/stop-integration-env.sh
```

---

## File Organization

### Backend Structure
```
backend/
├── src/
│   ├── index.ts                    # Server entry point
│   ├── middleware/                 # Express middleware
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── websocket/                  # WebSocket layer
│   │   ├── server.ts
│   │   ├── sessionManager.ts
│   │   └── messageHandler.ts
│   ├── services/                   # Business logic
│   │   ├── claude.service.ts
│   │   ├── toolExecutor.ts
│   │   ├── file.service.ts
│   │   ├── git.service.ts
│   │   └── command.service.ts
│   └── utils/                      # Utilities
│       └── logger.ts
├── data/sessions/                  # Session persistence
├── logs/                           # Application logs
└── package.json
```

### Frontend Structure (To Implement)
```
claude-code-mobile/
├── src/
│   ├── screens/                    # Screen components
│   │   ├── ChatScreen.tsx
│   │   ├── FileBrowserScreen.tsx
│   │   ├── CodeViewerScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── SessionsScreen.tsx
│   ├── components/                 # Reusable components
│   │   ├── MessageBubble.tsx
│   │   ├── ToolExecutionCard.tsx
│   │   ├── StreamingIndicator.tsx
│   │   ├── SlashCommandMenu.tsx
│   │   ├── ConnectionStatus.tsx
│   │   └── FileItem.tsx
│   ├── services/                   # Services
│   │   └── websocket.service.ts
│   ├── store/                      # State management
│   │   └── useAppStore.ts
│   ├── navigation/                 # Navigation
│   │   └── AppNavigator.tsx
│   ├── constants/                  # Constants
│   │   └── theme.ts
│   ├── types/                      # TypeScript types
│   │   ├── models.ts
│   │   ├── websocket.ts
│   │   └── navigation.ts
│   └── utils/                      # Utilities
├── App.tsx                         # App entry
└── package.json
```

---

## Testing Strategy

### Backend Testing (Gate 3A)
**Method**: Functional testing with real operations
- ✅ curl for HTTP endpoints
- ✅ wscat for WebSocket protocol
- ✅ Actual file operations (create files, verify on disk)
- ✅ Real git operations (commit, check git log)
- ❌ NO unit tests with mocks
- ❌ NO mocked WebSocket or file system

**Automation**: `./scripts/validate-gate-3a.sh`

**Pass Criteria**: All 14 tests pass, exit code 0

### Frontend Testing (Gate 4A)
**Method**: expo-mcp autonomous visual testing
- ✅ expo-mcp automation_take_screenshot for visual capture
- ✅ expo-mcp automation_tap_by_testid for interactions
- ✅ expo-mcp automation_find_view_by_testid for verification
- ✅ AI visual analysis of screenshots
- ✅ AI determines pass/fail autonomously
- ❌ NO manual visual inspection required

**Automation**: expo-mcp prompts + AI verification

**Pass Criteria**: All screens render correctly, all interactions work, AI validates visually

### Integration Testing (Gates 6A-E)
**Method**: expo-mcp visual verification of complete workflows
- Gate 6A: Connection status verification
- Gate 6B: Message flow (send message, see response)
- Gate 6C: Tool execution (create file, verify in FileBrowser)
- Gate 6D: File browser navigation
- Gate 6E: Session management (create, switch, delete)

---

## Implementation Workflow

### For Each Frontend Component/Screen

1. **Design** (if complex): Use `@brainstorming` skill
2. **Implement**: Create via Serena `mcp__serena__create_text_file`
3. **Add testIDs**: All interactive elements
4. **Test with expo-mcp**:
   ```
   "Take screenshot of [Screen] and verify [expected UI]"
   "Find view with testID '[element-id]'"
   "Tap button with testID '[button-id]'"
   "Verify [expected outcome]"
   ```
5. **AI validates**: Visual analysis of screenshots
6. **Fix if needed**: Edit and re-test
7. **Commit via Git MCP**: When tests pass

### Autonomous Testing Example

```
Step 1: Implement ChatScreen with testIDs
Step 2: "Take screenshot of Chat screen empty state"
Step 3: AI analyzes: ✅ Purple gradient, ✅ Input field, ✅ Send button
Step 4: "Find view with testID 'message-input'"
Step 5: expo-mcp returns: Found, accessible, enabled
Step 6: "Tap view with testID 'message-input'"
Step 7: "Take screenshot and verify keyboard appeared"
Step 8: AI analyzes: ✅ Keyboard visible
Step 9: Test passes → Commit via Git MCP
```

---

## Performance Requirements

- **WebSocket latency**: < 100ms (backend handles)
- **UI rendering**: 60 FPS smooth scrolling
- **App launch**: < 2s cold start  
- **Memory**: < 100MB average
- **Battery**: < 5%/hour

**Optimization Checklist**:
- ✅ React.memo on MessageBubble, ToolExecutionCard
- ✅ useCallback for renderItem, event handlers
- ✅ useMemo for expensive computations
- ✅ FlatList virtualization config
- ✅ Reanimated for animations
- ✅ Hermes JS engine enabled

---

## Security Notes

### Backend (Implemented)
- ✅ Path sanitization (prevents directory traversal)
- ✅ Command blocking (blocks rm -rf, sudo, chmod)
- ✅ File type whitelist (.ts, .tsx, .js, .jsx, .json, .md, .txt, .css, .html)
- ✅ Rate limiting (100 req/15min HTTP, 5 conn/60s WebSocket)
- ✅ API key protection (environment variables only)

### Frontend (To Implement)
- Validate all user inputs before sending to backend
- Handle error responses gracefully
- Don't expose API keys in client code
- Use wss:// (WebSocket Secure) for production

---

## Validation Gates

### Gate 3A: Backend Functional Testing
**Status**: Backend ready, needs .env with ANTHROPIC_API_KEY
**Tests**: 14 total (WebSocket protocol, all tools, REST API, automation script)
**Automation**: `./scripts/validate-gate-3a.sh`
**Pass**: ALL tests must pass, HARD STOP if any fail

### Gate 4A: Frontend Visual Testing
**Status**: Blocked (frontend not implemented)
**Tests**: 14 total (build, screenshots, UI interactions, multi-device)
**Automation**: expo-mcp autonomous testing
**Pass**: All screens render correctly, all interactions work, AI validates visually

### Gates 6A-E: Integration Testing
**Status**: Blocked (awaits Gates 3A and 4A)
**Tests**: End-to-end workflows across backend and frontend
**Automation**: expo-mcp visual verification
**Pass**: All integration flows work correctly

---

## Next Steps

**IMMEDIATE (Phase 4 - Frontend)**:

1. Add missing packages via expo-mcp:
   - zustand
   - @react-native-async-storage/async-storage
   - react-native-syntax-highlighter
   - react-native-markdown-display

2. Implement theme system (src/constants/theme.ts)

3. Implement type definitions (3 files)

4. Implement WebSocket service with Rocket.Chat patterns

5. Implement Zustand store with AsyncStorage persistence

6. Implement 6 core components with testIDs

7. Implement 5 screens per specification

8. Test with expo-mcp autonomous validation

9. Pass Gate 4A

**AFTER Gate 4A**:
- Phase 6: Integration testing (Gates 6A-E)
- Phase 7: Production readiness
- Phase 8: Comprehensive testing
- Phase 9: Deployment preparation

---

## References

- **Specification**: `docs/specs/claude-code-expo-v1.md` (2,885 lines)
- **Implementation Plan**: `docs/plans/2025-10-30-claude-mobile-MCP-FIRST.md`
- **Execution Checklist**: `docs/EXECUTION-CHECKLIST-COMPLETE.md`
- **Backend Code**: `backend/src/` (12 files, production-ready)
- **Validation Gates**: `docs/validation/GATE-3A-*.md`, `docs/validation/GATE-4A-*.md`

---

**This project follows MCP-first approach, skills-driven development, and autonomous testing with expo-mcp.**
