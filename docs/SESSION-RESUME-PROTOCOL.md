# Session Resume Protocol - Meticulous Context Restoration

> **For Next Claude Instance:** Follow this protocol EXACTLY before starting work.

**Created**: 2025-10-31  
**Purpose**: Complete context restoration for Gate 4A completion  
**Previous Token Usage**: 633k/1M (63.3%)

---

## 🔄 MANDATORY CONTEXT RESTORATION CHECKLIST

**Complete ALL steps in order. Create TodoWrite todos for each.**

### PHASE 1: Read All Serena Memories (10 total)

**Execute these reads in order**:

```typescript
// 1. Session handoff (START HERE)
mcp__serena__read_memory({
  memory_name: "session-handoff-gate-4a-incomplete-2025-10-31"
})

// 2. Complete codebase analysis
mcp__serena__read_memory({
  memory_name: "complete-codebase-analysis-2025-10-30"
})

// 3. Backend restructure
mcp__serena__read_memory({
  memory_name: "backend-restructured-agent-sdk-2025-10-30"
})

// 4. Gate 3A results
mcp__serena__read_memory({
  memory_name: "validation-gate-3a-PASSED-2025-10-30"
})

// 5. Phase -1 foundation
mcp__serena__read_memory({
  memory_name: "phase-0-and-minus-1-complete-CORRECTED"
})

// 6. expo-mcp integration guide
mcp__serena__read_memory({
  memory_name: "expo-mcp-complete-integration"
})

// 7. Technology research
mcp__serena__read_memory({
  memory_name: "technology-research-2025"
})

// 8. MCP ecosystem
mcp__serena__read_memory({
  memory_name: "mcp-ecosystem-reference"
})

// 9. Gate 3A specification
mcp__serena__read_memory({
  memory_name: "validation-gate-3a-specification"
})

// 10. Gate 4A attempt results
mcp__serena__read_memory({
  memory_name: "gate-4a-autonomous-validation-final"
})
```

**After reading**: You should know:
- Complete project history
- What's working (backend verified via Gate 3A)
- What's not working (Metro bundler issues)
- All architectural decisions
- All testing patterns

### PHASE 2: Read All Implementation Plans

```typescript
// Main implementation plan
mcp__serena__read_file({
  relative_path: "docs/plans/2025-10-30-claude-mobile-MCP-FIRST.md"
})

// Execution checklist
mcp__serena__read_file({
  relative_path: "docs/EXECUTION-CHECKLIST-COMPLETE.md"
})

// Autonomous testing plan
mcp__serena__read_file({
  relative_path: "docs/plans/2025-10-31-autonomous-gate-4a-testing.md"
})

// expo-mcp integration details
mcp__serena__read_file({
  relative_path: "docs/plans/EXPO-MCP-INTEGRATION-COMPLETE.md"
})
```

### PHASE 3: Read Specification (Critical Sections)

**Full spec**: 2,885 lines at `docs/specs/claude-code-expo-v1.md`

**Read these sections minimum**:
- Lines 1-100: Executive summary, architecture
- Lines 217-373: Complete design system (colors, typography, spacing)
- Lines 378-523: ChatScreen specification (primary screen)
- Lines 1748-1817: WebSocket protocol
- Lines 1824-1878: AppState interface (Zustand store)

**Or read entire file if tokens permit**

### PHASE 4: Invoke All Required Skills

**Explicitly invoke with Skill tool**:

```typescript
// 1. For overall execution
Skill({command: "executing-plans"})

// 2. For Metro management
Skill({command: "claude-mobile-metro-manager"})

// 3. For iOS testing
Skill({command: "claude-mobile-ios-testing"})

// 4. For React Native development
Skill({command: "react-native-expo-development"})

// 5. For validation gates
Skill({command: "claude-mobile-validation-gate"})

// 6. For debugging (if needed)
Skill({command: "systematic-debugging"})

// 7. For root cause tracing (if needed)
Skill({command: "root-cause-tracing"})
```

**Announce each**: "I'm using the [skill-name] skill for [purpose]."

### PHASE 5: Read Complete Backend Codebase

**All backend files** (8 total):

```typescript
mcp__serena__read_file({relative_path: "backend/src/index.ts"})
mcp__serena__read_file({relative_path: "backend/src/utils/logger.ts"})
mcp__serena__read_file({relative_path: "backend/src/middleware/errorHandler.ts"})
mcp__serena__read_file({relative_path: "backend/src/middleware/rateLimiter.ts"})
mcp__serena__read_file({relative_path: "backend/src/websocket/server.ts"})
mcp__serena__read_file({relative_path: "backend/src/websocket/sessionManager.ts"})
mcp__serena__read_file({relative_path: "backend/src/websocket/messageHandler.ts"})
mcp__serena__read_file({relative_path: "backend/src/services/claude.service.ts"})

// Also read package.json to understand dependencies
mcp__serena__read_file({relative_path: "backend/package.json"})
```

**Understand**:
- Claude Agent SDK integration (query() function)
- WebSocket message handling
- Session management
- Tool execution via Agent SDK

### PHASE 6: Read Complete Frontend Codebase

**Core files** (23 total):

**Entry**:
```typescript
mcp__serena__read_file({relative_path: "claude-code-mobile/index.js"})
mcp__serena__read_file({relative_path: "claude-code-mobile/App.tsx"})
mcp__serena__read_file({relative_path: "claude-code-mobile/package.json"})
```

**Theme & Types**:
```typescript
mcp__serena__read_file({relative_path: "claude-code-mobile/src/constants/theme.ts"})
mcp__serena__read_file({relative_path: "claude-code-mobile/src/types/models.ts"})
mcp__serena__read_file({relative_path: "claude-code-mobile/src/types/websocket.ts"})
mcp__serena__read_file({relative_path: "claude-code-mobile/src/types/navigation.ts"})
```

**Services & Store**:
```typescript
mcp__serena__read_file({relative_path: "claude-code-mobile/src/services/websocket.service.ts"})
mcp__serena__read_file({relative_path: "claude-code-mobile/src/store/useAppStore.ts"})
```

**Components** (6 files):
```typescript
mcp__serena__read_file({relative_path: "claude-code-mobile/src/components/MessageBubble.tsx"})
mcp__serena__read_file({relative_path: "claude-code-mobile/src/components/ToolExecutionCard.tsx"})
mcp__serena__read_file({relative_path: "claude-code-mobile/src/components/StreamingIndicator.tsx"})
mcp__serena__read_file({relative_path: "claude-code-mobile/src/components/SlashCommandMenu.tsx"})
mcp__serena__read_file({relative_path: "claude-code-mobile/src/components/ConnectionStatus.tsx"})
mcp__serena__read_file({relative_path: "claude-code-mobile/src/components/FileItem.tsx"})
```

**Screens** (5 files):
```typescript
mcp__serena__read_file({relative_path: "claude-code-mobile/src/screens/ChatScreen.tsx"})
mcp__serena__read_file({relative_path: "claude-code-mobile/src/screens/SettingsScreen.tsx"})
mcp__serena__read_file({relative_path: "claude-code-mobile/src/screens/FileBrowserScreen.tsx"})
mcp__serena__read_file({relative_path: "claude-code-mobile/src/screens/CodeViewerScreen.tsx"})
mcp__serena__read_file({relative_path: "claude-code-mobile/src/screens/SessionsScreen.tsx"})
```

**Navigation**:
```typescript
mcp__serena__read_file({relative_path: "claude-code-mobile/src/navigation/AppNavigator.tsx"})
```

**Understand**:
- Complete component structure
- WebSocket integration in App.tsx
- Zustand store usage
- testID placement for testing
- All screen layouts

### PHASE 7: Verify File System State

**Check what's actually on disk**:

```bash
# Backend build status
ls -la backend/dist/
# Should show compiled JavaScript files

# Frontend node_modules
ls -la claude-code-mobile/node_modules/zustand
ls -la claude-code-mobile/node_modules/expo-linear-gradient
ls -la claude-code-mobile/node_modules/@react-native-async-storage/async-storage
# All should exist

# iOS build
ls -la claude-code-mobile/ios/
# Should show Xcode project

# Verify app.json and package.json
cat claude-code-mobile/app.json | jq '.expo.plugins'
# Should NOT include "expo-router"

cat claude-code-mobile/package.json | jq '.main'
# Should be "./index.js"
```

### PHASE 8: Check Git Status

```typescript
mcp__git__git_status({repo_path: "/Users/nick/Desktop/claude-mobile-expo"})
mcp__git__git_log({repo_path: ".", max_count: 10})
```

**Verify**: 
- Latest commit: 70d8de9 (session primer docs)
- 8 commits total
- Working directory clean or known changes

### PHASE 9: Review Previous Session Failures

**Read what didn't work**:

**Metro Bundler**:
- Multiple Metro instances conflicted
- EXPO_UNSTABLE_MCP_SERVER=1 flag wouldn't set in zsh
- App couldn't connect to Metro ("No script URL")
- Consumed 300k tokens without resolution

**expo-mcp**:
- Local tools never became available
- Flag issues prevented MCP server from starting
- Had to fallback to xc-mcp

**Premature Success**:
- Declared "PASSED" 3 times when app had errors
- Didn't verify complete flows
- Didn't test backend integration

**Learn from these to avoid repeating**

### PHASE 10: Define Success Criteria

**Gate 4A PASSES when these are ALL verified via screenshots**:

1. ✅ App loads showing ChatScreen (purple gradient visible)
2. ✅ No red error screens
3. ✅ Connection status: GREEN "Connected" (backend integration working)
4. ✅ Can type in message input
5. ✅ Can tap send button
6. ✅ User message appears in chat (teal bubble, right-aligned)
7. ✅ Backend logs show message received
8. ✅ Assistant response streams back
9. ✅ Assistant message appears (white bubble, left-aligned)
10. ✅ Settings screen accessible and renders
11. ✅ All 5 screens accessible
12. ✅ No crashes during testing

**Evidence**: Multiple screenshots analyzed with AI vision  
**Method**: Autonomous (zero user confirmation)  
**Decision**: AI declares PASS/FAIL based on screenshot evidence

---

## 🎯 EXECUTION PROTOCOL FOR NEXT SESSION

### Step 1: Context Restoration (30-60 minutes)

**Do ALL of Phase 1-9 above**:
- Read 10 Serena memories
- Read 4 plan documents
- Read specification key sections
- Invoke 7 skills explicitly
- Read all 31 code files
- Verify file system
- Check git status
- Review failures

**Create TodoWrite with ALL steps**

**Don't skip** - this is critical context

### Step 2: Clean Environment Start (5 minutes)

```bash
# Kill everything
killall -9 node expo npx
lsof -ti:3001 -ti:8081 | xargs kill -9
sleep 5

# Verify clean
lsof -i:3001 -i:8081
# Should return empty

# Start backend
cd backend && node dist/index.js > ../logs/backend.log 2>&1 &
sleep 3
curl http://localhost:3001/health
# Should return {"status":"healthy"}

# Start Metro (try WITH MCP flag first)
cd claude-code-mobile
export EXPO_UNSTABLE_MCP_SERVER=1
npx expo start --clear > ../logs/metro.log 2>&1 &

# Wait 60s for cache rebuild
sleep 60

# Verify Metro
curl http://localhost:8081/status
# Should return: packager-status:running
```

### Step 3: Launch App

```bash
# Launch native build (NOT Expo Go)
xcrun simctl launch booted com.yourcompany.claudecodemobile

# Wait for load
sleep 8
```

### Step 4: Autonomous Testing Loop

```typescript
// Screenshot 1: Initial load
mcp__xc-mcp__screenshot({
  appName: "ClaudeCodeMobile",
  screenName: "InitialLoad",
  state: "fresh",
  size: "half"
})

// AI ANALYZES:
// - Purple gradient? ✅/❌
// - Welcome text? ✅/❌
// - Input field? ✅/❌
// - Red errors? ❌ should be none
// - Connection status? Should show green "Connected"

// If errors → Fix autonomously → Reload → Re-screenshot → Re-analyze

// Screenshot 2: After typing message
// (Use xc-mcp or expo-mcp to interact)
// AI verifies message visible

// Screenshot 3: After send
// AI verifies user bubble appears

// Screenshot 4-8: Each screen
// AI verifies each renders correctly

// Final: AI aggregates all evidence
// AI declares PASS/FAIL
```

**Complete autonomous workflow - no user interaction**

### Step 5: Save Results and Proceed

**If PASSED**:
```typescript
mcp__serena__write_memory({
  memory_name: "gate-4a-PASSED-complete-validation",
  content: "[All evidence, all screenshots analyzed, final verdict]"
})

// Git commit any final fixes

// Proceed to Phase 6 (Integration Gates 6A-E)
```

**If FAILED**:
- Document specific failures
- Continue autonomous fix loop
- DO NOT PROCEED to Phase 6

---

## 📚 COMPLETE CODEBASE INVENTORY

### Backend (8 files, ~2,000 lines)

**Location**: `backend/src/`

| File | Lines | Purpose | Key Details |
|------|-------|---------|-------------|
| index.ts | ~150 | Express server, WebSocket upgrade | Health /health, Info /info, Port 3001 |
| utils/logger.ts | ~80 | Winston logger | File transports (error.log, combined.log) |
| middleware/errorHandler.ts | ~100 | AppError class, error handling | Custom error class with statusCode |
| middleware/rateLimiter.ts | ~150 | Rate limiting | 100 req/15min, WebSocket 5 conn/60s |
| websocket/server.ts | ~200 | WebSocket server setup | Heartbeat ping/pong 30s, perMessageDeflate |
| websocket/sessionManager.ts | ~300 | Session CRUD, persistence | File-based ./data/sessions/*.json, 30-day cleanup |
| websocket/messageHandler.ts | ~250 | Message routing | 10 message types, forwards to claude.service |
| services/claude.service.ts | ~180 | Agent SDK integration | query() function, AsyncGenerator pattern, permissionMode: 'acceptEdits' |

**Dependencies** (package.json):
- @anthropic-ai/claude-agent-sdk@0.1.30
- express@4.19.2, ws@8.18.0
- winston@3.11.0, helmet@8.0.0, cors@2.8.5
- uuid@11.0.3, dotenv@16.4.7

**NO LONGER USED** (deleted in restructure):
- @anthropic-ai/sdk (replaced with Agent SDK)
- simple-git (CLI handles git)
- glob (CLI handles file operations)
- toolExecutor.ts, file.service.ts, git.service.ts, command.service.ts (all deleted - CLI handles)

### Frontend (23 files, ~4,000 lines)

**Entry Points**:
| File | Purpose |
|------|---------|
| index.js | registerRootComponent(App) - AppRegistry registration |
| App.tsx | NavigationContainer, WebSocket service init, Zustand integration |

**Theme & Types**:
| File | Lines | Purpose |
|------|-------|---------|
| src/constants/theme.ts | ~180 | Complete design system from spec |
| src/types/models.ts | ~150 | User, Session, Message, ToolExecution, FileMetadata, AppSettings |
| src/types/websocket.ts | ~180 | All WebSocket message types, ConnectionStatus |
| src/types/navigation.ts | ~45 | RootStackParamList, screen props |

**Services & Store**:
| File | Lines | Purpose | Key Details |
|------|-------|---------|-------------|
| src/services/websocket.service.ts | ~350 | WebSocket client | Rocket.Chat reconnection (1s→30s), heartbeat, offline queue |
| src/store/useAppStore.ts | ~200 | Zustand global store | AsyncStorage persistence (settings only), all actions |

**Components** (6 files, ~800 lines total):
| File | Lines | testIDs | Purpose |
|------|-------|---------|---------|
| MessageBubble.tsx | ~120 | message-bubble-{id}, message-text-{id} | User/assistant bubbles, Gifted Chat pattern, React.memo |
| ToolExecutionCard.tsx | ~130 | tool-card-{tool}, tool-details-{tool} | Tool display, expand/collapse |
| StreamingIndicator.tsx | ~90 | streaming-indicator | Reanimated pulsing dots |
| SlashCommandMenu.tsx | ~120 | slash-command-menu, slash-command-{name} | Filtered command list |
| ConnectionStatus.tsx | ~110 | connection-status, connection-dot-{status} | Animated status dot (green/orange/red) |
| FileItem.tsx | ~90 | file-item-{path}, file-name-{name} | File/directory display with icons |

**Screens** (5 files, ~1,500 lines total):
| File | Lines | testIDs | Purpose |
|------|-------|---------|---------|
| ChatScreen.tsx | ~300 | chat-header, message-list, message-input, send-button, settings-button | Primary interface, FlatList, input, slash menu |
| SettingsScreen.tsx | ~150 | settings-header, server-url-input, project-path-input, toggles | Configuration, server URL, preferences |
| FileBrowserScreen.tsx | ~130 | filebrowser-header, file-search-input, file-list, current-path | File navigation, search |
| CodeViewerScreen.tsx | ~120 | codeviewer-header, code-content, code-text | Syntax highlighted code display |
| SessionsScreen.tsx | ~130 | sessions-header, sessions-list, session-item-{id}, delete-session-{id} | Session management |

**Navigation**:
| File | Lines | Purpose |
|------|-------|---------|
| src/navigation/AppNavigator.tsx | ~50 | Stack Navigator, 5 screens registered |

**Packages Installed** (package.json dependencies):
- zustand@latest
- @react-native-async-storage/async-storage@latest
- expo-linear-gradient@latest
- @react-navigation/native@7.1.8, @react-navigation/native-stack@latest
- react-native-safe-area-context@5.6.0
- react-native-syntax-highlighter, react-native-markdown-display
- expo-mcp@0.1.15 (devDependencies)

### Foundation (7 skills, 9 scripts)

**Skills** (`.claude/skills/`):
- claude-mobile-ios-testing: xc-mcp screenshot + AI vision, navigation via tap
- claude-mobile-metro-manager: EXPO_UNSTABLE_MCP_SERVER=1 flag requirement
- claude-mobile-validation-gate: HARD STOP on failures, autonomous verification
- react-native-expo-development: expo-mcp integration, production patterns
- websocket-integration-testing: NO MOCKS principle
- anthropic-streaming-patterns: Agent SDK event handling
- claude-mobile-cost-tracking: Exact pricing formulas

**Scripts** (`scripts/`):
- start-metro.sh: Includes EXPO_UNSTABLE_MCP_SERVER=1
- stop-metro.sh
- build-ios.sh
- capture-screenshots.sh
- test-websocket.sh
- start/stop-integration-env.sh
- validate-gate-3a.sh, validate-gate-4a.sh

---

## 🎬 IMMEDIATE FIRST ACTIONS

**After completing context restoration above:**

1. **Start backend**: `cd backend && node dist/index.js &`
2. **Start Metro**: `cd claude-code-mobile && npx expo start --clear &`
3. **Wait 60s**: For Metro cache rebuild
4. **Launch app**: `xcrun simctl launch booted com.yourcompany.claudecodemobile`
5. **Screenshot**: Use xc-mcp screenshot
6. **Analyze**: AI vision - what do you see?
7. **Fix or Test**: Based on screenshot
8. **Loop**: Until Gate 4A passed

---

## 🔑 CRITICAL SUCCESS FACTORS

### Use Autonomous Testing

**Pattern**:
```
Screenshot → AI Analyze → AI Fix (if needed) → Reload → Re-Screenshot → Loop
```

**NEVER**:
- "Can you check if..."
- "Please reload and tell me..."
- "Does it look correct?"

**ALWAYS**:
- Take screenshot
- AI examines screenshot
- AI decides next action
- AI proceeds

### Verify Backend Integration

**Not just** "app renders"

**Must verify**:
- WebSocket connects (green status in app)
- Message sends to backend (check backend logs)
- Response streams back (check app for assistant bubble)
- Tool execution works through integration

### Don't Declare Success Prematurely

**Previous session mistakes**:
- Declared PASSED when app had red errors
- Declared PASSED when WebSocket not connected
- Declared PASSED before testing flows

**This session**:
- Test COMPLETE user flows
- Verify EVERY screen
- Check backend logs for integration
- Only declare PASSED when ALL evidence confirms

---

## 📊 ESTIMATED EFFORT FOR NEXT SESSION

**If Metro works cleanly**: 200-300k tokens, 1-2 hours
- Context restoration: 100k tokens
- Testing + fixes: 100-200k tokens
- Documentation: 50k tokens

**If Metro issues persist**: 400-500k tokens, 2-3 hours
- Additional debugging: 200k tokens
- Alternative approaches: 100k tokens

**Total available**: 1M tokens fresh session

---

## 🎯 DELIVERABLES FOR NEXT SESSION

**Minimum for Gate 4A PASS**:
1. ✅ Backend running and verified
2. ✅ Frontend app loading without errors
3. ✅ Backend ↔ Frontend WebSocket connection working
4. ✅ Message send/receive flow working
5. ✅ All 5 screens accessible and rendering
6. ✅ All verified via screenshots + AI vision analysis
7. ✅ Results documented in Serena memory
8. ✅ "Gate 4A PASSED" declared with evidence

**Then Proceed To**:
- Phase 6: Integration Gates (6A: Connection, 6B: Message flow, 6C: Tool execution, 6D: File browser, 6E: Sessions)
- Phase 7: Production readiness
- Phases 8-12: Testing, deployment, final validation

---

## 💾 MEMORY REFERENCE

**All context saved in Serena**:
- session-handoff-gate-4a-incomplete-2025-10-31 (THIS SESSION)
- complete-codebase-analysis-2025-10-30 (ARCHITECTURE)
- backend-restructured-agent-sdk-2025-10-30 (BACKEND)
- validation-gate-3a-PASSED-2025-10-30 (BACKEND VERIFIED)
- gate-4a-autonomous-validation-final (TESTING ATTEMPTS)
- plus 5 more with research, patterns, foundation details

**Read ALL memories at session start**

---

## ✅ CHECKLIST FOR YOU (Next Claude Instance)

**Before taking ANY action**:
- [ ] Read this primer completely
- [ ] Read all 10 Serena memories
- [ ] Read all 4 plan documents
- [ ] Read specification key sections
- [ ] Invoke all 7 skills explicitly (announce each)
- [ ] Read all 31 code files (8 backend + 23 frontend)
- [ ] Verify file system state
- [ ] Check git status
- [ ] Review previous failures
- [ ] Create TodoWrite for all remaining tasks

**Then and only then**: Start execution

**Goal**: Complete Gate 4A autonomously with full integration testing

**Method**: Screenshots + AI vision + autonomous fixes

**Success**: All flows working, all screens verified, backend integration confirmed

---

**This primer is your complete starting point. Follow it precisely.**
