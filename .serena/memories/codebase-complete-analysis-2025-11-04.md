# Complete Codebase Analysis - Claude Code Mobile

**Date**: 2025-11-04  
**Analysis Depth**: EVERY file, EVERY line
**Purpose**: Foundation for create-expo-stack rebuild

## Executive Summary

**Current State**:
- Frontend: 51 TypeScript/TSX files (React Native + Expo)
- Backend: 70 Python files (FastAPI)
- Total LOC: ~16,296 lines
- Status: Functional with navigation working

**Architecture**:
- **Frontend**: React Native 0.81, Expo 54, Manual Navigation, Custom HTTP/SSE
- **Backend**: Python FastAPI, SQLite, Claude CLI integration, 55 endpoints

## Frontend Analysis (51 files, 7,074 lines)

### App Entry Point
**File**: `App.tsx` (108 lines)
- Manual screen state management (`useState<string>` for currentScreen)
- HTTPService initialization with connection callbacks
- Conditional rendering of 10 screens
- Manual `navigate(screen)` function
- TabBar component at bottom
- **Issue**: No React Navigation or Expo Router

### Screens (10 files, 2,500+ lines)

**1. ChatScreen.tsx** (402 lines)
- Main chat interface
- SSE streaming for responses
- Message input with slash commands
- Tool execution display
- Manual navigation via prop
- **Dependencies**: useAppStore, useHTTP, MessageBubble, ToolExecutionCard

**2. SettingsScreen.tsx** (140 lines)
- Server URL, project path, model configuration
- Auto-scroll and haptic feedback toggles
- Manual navigation back button
- **Dependencies**: useAppStore

**3. SessionsScreen.tsx** (180 lines)
- Lists all chat sessions
- Create, resume, delete sessions
- Relative time display
- Manual navigation
- **Dependencies**: useAppStore, useHTTP

**4. ProjectsScreen.tsx** (150 lines)
- Displays discovered projects from host
- Calls `/v1/host/discover-projects` API
- Manual navigation
- **Dependencies**: useHTTP

**5. SkillsScreen.tsx** (170 lines)
- Lists Claude Code skills from backend
- View skill content
- Delete skills
- Manual navigation
- **Dependencies**: Fetches `/v1/skills`

**6. AgentsScreen.tsx** (180 lines)
- Lists Claude Code agents
- View agent details
- Manual navigation
- **Dependencies**: Fetches `/v1/agents`

**7. GitScreen.tsx** (200 lines)
- Git status display
- Create commits
- View git log
- Manual navigation
- **Dependencies**: Fetches `/v1/git/*` endpoints

**8. MCPManagementScreen.tsx** (180 lines)
- Lists MCP servers
- Enable/disable toggles
- Manual navigation
- **Dependencies**: Fetches `/v1/mcp/servers`

**9. FileBrowserScreen.tsx** (150 lines)
- Browse filesystem
- Directory navigation via state
- Opens files in CodeViewer via Zustand
- **Dependencies**: useHTTP, useAppStore, FileItem

**10. CodeViewerScreen.tsx** (120 lines)
- Displays file content
- Gets file path from Zustand
- Manual navigation
- **Dependencies**: useHTTP, useAppStore

### Components (16 files, 1,800+ lines)

**Core UI Components**:
- **MessageBubble.tsx**: User/assistant message rendering
- **ToolExecutionCard.tsx**: Displays tool use/result
- **StreamingIndicator.tsx**: Animated loading dots
- **ConnectionStatus.tsx**: Green/red dot with status text
- **TabBar.tsx**: 5-tab bottom navigation (NEW - just added)
- **FileItem.tsx**: File/folder list item
- **SlashCommandMenu.tsx**: Command autocomplete

**Utility Components**:
- **ErrorBoundary.tsx**: Catches React errors
- **LoadingSkeleton.tsx**: Loading placeholders
- **Toast.tsx**: Notification system
- **PullToRefresh.tsx**: Pull down to refresh
- **EmptyState.tsx**: Empty list messaging
- **SearchBar.tsx**: Debounced search input
- **ConfirmDialog.tsx**: Yes/No confirmations
- **ThinkingBlock.tsx**: Reasoning step display
- **ThinkingAccordion.tsx**: Collapsible thinking

### State Management

**File**: `store/useAppStore.ts` (200 lines)
- **Library**: Zustand with persist middleware
- **Storage**: AsyncStorage (settings only, not messages)
- **State**:
  - currentSession, sessions array
  - messages array (in-memory only)
  - isConnected, isStreaming booleans
  - settings object (serverUrl, projectPath, model, etc.)
  - currentFile object (for FileBrowser → CodeViewer)
  - UI state (isFilesBrowserOpen, isSettingsOpen)
  - recentCommands array
  - error string

**Actions**: 14 methods for state updates

### Services Layer (11 files, 1,500+ lines)

**HTTPService Architecture**:
- **http.service.ts**: Main orchestrator (200 lines)
  - httpClient for REST calls
  - SSE streaming management
  - Connection monitoring
  - Active stream tracking
  
- **http.client.ts**: REST client (250 lines)
  - Methods for all backend endpoints
  - Sessions, models, chat, files, git, skills, agents
  
- **sse.client.ts**: SSE streaming (300 lines)
  - OpenAI-compatible streaming format
  - Tool use/result event parsing
  - Chunk accumulation
  - Error handling
  
- **offline-queue.ts**: Offline request queuing (150 lines)
- **reconnection.ts**: Auto-reconnect logic (100 lines)
- **types.ts**: Service type definitions
- **useHTTP.ts**: Custom hook for accessing service

### Types (3 files, 400 lines)
- **models.ts**: Message, Session, AppSettings, FileMetadata, etc.
- **navigation.ts**: RootStackParamList (unused now)
- **backend.ts**: Backend API response types

### Utilities (8 files, 600 lines)
- **formatters.ts**: Date, time, file size formatters
- **validation.ts**: Input validation functions
- **performance.ts**: Performance monitoring
- **async.ts**: Promise utilities
- **errors.ts**: Error handling
- **storage.ts**: AsyncStorage helpers
- **+ tests**: formatters.test.ts, validation.test.ts

### Hooks (3 files, 200 lines)
- **useDebounce.ts**: Debounced values
- **useNetworkStatus.ts**: Network state monitoring
- **useKeyboard.ts**: Keyboard show/hide events

### Constants (2 files, 150 lines)
- **theme.ts**: COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS
- **config.ts**: App-level configuration

### Contexts (1 file, 35 lines)
- **HTTPContext.tsx**: Provides HTTPService to tree

## Key Patterns

### Navigation Pattern (Manual)
```typescript
// App.tsx
const [currentScreen, setCurrentScreen] = useState('Chat');
const navigate = (screen: string) => setCurrentScreen(screen);

// Screens receive:
interface ManualNavigationProps {
  navigate: (screen: string) => void;
}
```

### HTTP Pattern (Custom SSE)
```typescript
await httpService.sendMessageStreaming({
  model, messages, session_id,
  onChunk: (content) => updateMessage(content),
  onComplete: () => setStreaming(false),
});
```

### State Pattern (Zustand)
```typescript
const messages = useAppStore(state => state.messages);
const addMessage = useAppStore(state => state.addMessage);
```

## Dependencies (package.json)

**Core**:
- expo: ~54.0.20
- react: 19.1.0
- react-native: 0.81.5

**Navigation** (not using):
- @react-navigation/native: ^7.1.8
- @react-navigation/native-stack: ^7.6.2
- @react-navigation/bottom-tabs: ^7.4.0
- expo-router: ~6.0.13

**State**:
- zustand: ^5.0.8
- @react-native-async-storage/async-storage: 2.2.0

**HTTP**:
- react-native-sse: ^1.2.1 (for SSE streaming)

**Styling**:
- No UI library
- Custom StyleSheet with theme constants

**Utilities**:
- react-native-markdown-display: ^7.0.2
- react-native-syntax-highlighter: ^2.1.0

## Critical Observations

**What Works Well**:
- ✅ Zustand state management clean and performant
- ✅ SSE streaming implementation solid
- ✅ Custom HTTP service well-structured
- ✅ Theme constants consistent
- ✅ Component organization logical

**What Needs Improvement**:
- ❌ Manual navigation instead of proper router
- ❌ No tab bar (just added, needs testing)
- ❌ No UI component library (all custom)
- ❌ Mixed navigation patterns (manual + params in Zustand)
- ❌ HTTPService tightly coupled to screens

## Files Count by Category

| Category | Files | LOC (est) |
|----------|-------|-----------|
| Screens | 10 | 2,500 |
| Components | 16 | 1,800 |
| Services | 11 | 1,500 |
| State | 1 | 200 |
| Types | 3 | 400 |
| Utils | 8 | 600 |
| Hooks | 3 | 200 |
| Constants | 2 | 150 |
| Contexts | 1 | 35 |
| **Total** | **51** | **~7,000** |
