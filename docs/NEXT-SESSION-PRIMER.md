# Next Session Primer - Complete Gate 4A and Integration Testing

> **For Next Claude Instance:** Read this FIRST. All context needed to complete Gate 4A and proceed to Phase 6.

**Date Created**: 2025-10-31  
**Previous Session Token Usage**: 633k/1M (63.3%)  
**Status**: Backend complete, Frontend code complete, Gate 4A testing incomplete

---

## 🎯 YOUR MISSION

**Complete Gate 4A autonomous testing** (app runs without errors, integration verified)  
**Then proceed to Phase 6** (Integration Gates 6A-E)

**Critical**: Use **autonomous testing** - screenshots + AI vision analysis. NO user confirmation.

---

## ✅ WHAT IS ALREADY COMPLETE (7 Git Commits)

### Backend: 100% Complete, Gate 3A PASSED ✅

**Location**: `backend/src/` (8 files)

**Architecture**: Backend → Claude Agent SDK → Claude CLI → Claude API

**Key Files**:
- index.ts: Express + WebSocket server
- services/claude.service.ts: Agent SDK integration with `permissionMode: 'acceptEdits'`
- websocket/server.ts, sessionManager.ts, messageHandler.ts
- middleware/: errorHandler, rateLimiter
- utils/logger.ts: Winston logging

**Dependencies**:
- @anthropic-ai/claude-agent-sdk@0.1.30 (uses Claude CLI, no API key needed)
- express, ws, winston, helmet, cors

**Verified Working** (Gate 3A passed):
- ✅ WebSocket connection: ws://localhost:3001/ws
- ✅ Session initialization
- ✅ Message streaming via Agent SDK
- ✅ Tool execution (Write tool created file: /tmp/test-project/test.txt)
- ✅ Cost tracking automatic

**To Start Backend**:
```bash
cd backend
npm start
# Verify: curl http://localhost:3001/health
```

### Frontend: Code 100% Complete, Testing Incomplete ❌

**Location**: `claude-code-mobile/src/` (23 files)

**What's Implemented** (~4,000 lines):
- src/constants/theme.ts: Spec design system (purple gradient, teal primary)
- src/types/: models.ts, websocket.ts, navigation.ts
- src/services/websocket.service.ts: Rocket.Chat reconnection patterns
- src/store/useAppStore.ts: Zustand + AsyncStorage persistence
- src/components/: 6 components (MessageBubble, ToolExecutionCard, StreamingIndicator, SlashCommandMenu, ConnectionStatus, FileItem) - all with testIDs
- src/screens/: 5 screens (ChatScreen, SettingsScreen, FileBrowserScreen, CodeViewerScreen, SessionsScreen)
- src/navigation/AppNavigator.tsx: React Navigation Stack
- App.tsx: NavigationContainer + WebSocket initialization
- index.js: registerRootComponent

**Packages Installed**:
- zustand, @react-native-async-storage/async-storage
- expo-linear-gradient, @react-navigation/native-stack
- react-native-safe-area-context, expo-mcp (devDep)
- react-native-syntax-highlighter, react-native-markdown-display

**Build Status**:
- ✅ TypeScript compiles (no errors)
- ✅ Native iOS build succeeds
- ✅ App installs on iPhone 16 Pro simulator
- ❌ Metro bundler connection issues prevented testing

### Foundation: Complete ✅

**Skills** (`.claude/skills/`):
- claude-mobile-ios-testing (xc-mcp screenshots + AI vision)
- claude-mobile-metro-manager (EXPO_UNSTABLE_MCP_SERVER=1 required)
- claude-mobile-validation-gate (autonomous testing workflow)
- react-native-expo-development (expo-mcp patterns)
- websocket-integration-testing (NO MOCKS)
- anthropic-streaming-patterns (Agent SDK)
- claude-mobile-cost-tracking

**Scripts** (`scripts/`):
- start-metro.sh (with EXPO_UNSTABLE_MCP_SERVER=1 flag)
- validate-gate-3a.sh, validate-gate-4a.sh
- build-ios.sh, capture-screenshots.sh
- start/stop-integration-env.sh

**Documentation**:
- CLAUDE.md: Comprehensive project context
- docs/plans/: Implementation plans
- docs/validation/: Gate specifications

---

## ❌ WHAT BLOCKED PREVIOUS SESSION

### Metro Bundler Issues (Primary Blocker)

**Problem**: App cannot connect to Metro bundler to load JavaScript bundle

**Symptoms**:
- Error: "No script URL provided"
- Error: "unsanitizedScriptURLString = (null)"
- App shows blank/error screen despite Metro running

**Root Causes**:
1. Multiple conflicting Metro instances
2. EXPO_UNSTABLE_MCP_SERVER=1 flag not applying in zsh
3. App trying to open in Expo Go instead of native build
4. Metro connection URL issues

**What Was Tried** (all incomplete):
- Restarted Metro 10+ times
- Cleared cache multiple times
- Killed processes multiple times
- Never achieved stable Metro → App connection

### expo-mcp Integration: Never Worked

**Issue**: Could not use expo-mcp automation tools

**Why**:
- EXPO_UNSTABLE_MCP_SERVER=1 flag didn't set properly
- expo-mcp local tools never became available
- Had to use xc-mcp screenshot instead (which works)
- But cannot use expo-mcp tap/find by testID

**Fallback Used**:
- xc-mcp screenshot: Works ✅
- AI vision analysis: Works ✅
- xc-mcp idb-ui-tap: Connection issues ❌

---

## 🚀 START HERE - Step-by-Step for Next Session

### Step 0: Read Memories (Context Restoration)

**Required reading**:
```typescript
mcp__serena__read_memory({memory_name: "session-handoff-gate-4a-incomplete-2025-10-31"})
mcp__serena__read_memory({memory_name: "complete-codebase-analysis-2025-10-30"})
mcp__serena__read_memory({memory_name: "validation-gate-3a-PASSED-2025-10-30"})
```

### Step 1: Clean Environment Setup

**Kill everything**:
```bash
killall -9 node expo npx
lsof -ti:3001 -ti:8081 | xargs kill -9
sleep 3
```

**Verify clean**:
```bash
lsof -i:3001 -i:8081
# Should return nothing
```

### Step 2: Start Backend

```bash
cd /Users/nick/Desktop/claude-mobile-expo/backend
node dist/index.js > ../logs/backend.log 2>&1 &

# Wait 3 seconds

# Verify:
curl http://localhost:3001/health
# Expected: {"status":"healthy", ...}
```

**If backend not compiled**:
```bash
npm run build
```

### Step 3: Start Metro Bundler

**Method 1: With MCP Flag** (try this first):
```bash
cd /Users/nick/Desktop/claude-mobile-expo/claude-code-mobile
export EXPO_UNSTABLE_MCP_SERVER=1
npx expo start --clear

# Wait for "Bundler is ready" or "Waiting on http://localhost:8081"
```

**Method 2: Without MCP** (fallback if flag doesn't work):
```bash
cd /Users/nick/Desktop/claude-mobile-expo/claude-code-mobile
npx expo start --clear
```

**Verify Metro**:
```bash
curl http://localhost:8081/status
# Expected: packager-status:running
```

**Wait**: 30-60 seconds for cache rebuild on first start

### Step 4: Launch Native App

**Important**: Launch OUR native build, NOT Expo Go

```bash
# Method 1: Direct launch
xcrun simctl launch booted com.yourcompany.claudecodemobile

# Method 2: If not installed, rebuild:
cd /Users/nick/Desktop/claude-mobile-expo/claude-code-mobile
npx expo run:ios --device "iPhone 16 Pro"
# This builds AND launches
```

**Wait**: 5-10 seconds for app to fully load

### Step 5: Take First Screenshot (AUTONOMOUS)

```typescript
mcp__xc-mcp__screenshot({
  appName: "ClaudeCodeMobile",
  screenName: "InitialLoad",
  state: "fresh",
  size: "half" // Token efficiency
})
```

**AI Analyzes** (with vision):
- ✅ Purple gradient background?
- ✅ "Welcome to Claude Code Mobile" text?
- ✅ Input field visible?
- ✅ Send button visible?
- ❌ Red error screen?
- ❌ "No script URL" error?
- ❌ Blank screen?

**If ERROR** → Fix autonomously, reload, re-screenshot, re-analyze (loop until clean)

**If CLEAN** → Proceed to Step 6

### Step 6: Verify Backend Connection

**Look at screenshot**:
- Connection status (top left) should show:
  - Initially: Orange/yellow "Connecting..."
  - After 1-2 seconds: Green "Connected"

**If shows RED "Disconnected"**:
- Backend not running (go back to Step 2)
- WebSocket URL wrong in App.tsx (check: ws://localhost:3001/ws)

**If shows GREEN "Connected"** ✅:
- Backend connection working
- Proceed to Step 7

### Step 7: Test Message Send/Receive (Autonomous)

**Can use either**:
- expo-mcp automation tools (if MCP flag worked)
- xc-mcp tools (fallback)

**If expo-mcp available**:
```
"Find view with testID 'message-input'"
"Tap view with testID 'message-input'"
"Type 'Hello Claude' in the input"
"Tap button with testID 'send-button'"
"Take screenshot showing message sent"
```

**If using xc-mcp** (fallback):
```typescript
// Get UI tree
mcp__xc-mcp__idb-ui-describe({operation: "all"})

// Find input field coordinates from tree
mcp__xc-mcp__idb-ui-tap({x, y, actionName: "Focus input"})

// Type message
mcp__xc-mcp__idb-ui-input({operation: "text", text: "Hello Claude"})

// Find send button, tap
// Screenshot
```

**AI Verifies from Screenshot**:
- ✅ User message bubble visible (right-aligned, teal background)
- ✅ Streaming indicator visible
- ✅ Assistant response appears
- ✅ Tool execution cards if tools used

**If working** ✅ → Proceed to Step 8  
**If errors** ❌ → Fix autonomously, loop

### Step 8: Test All Screens Navigation

**For each screen**:
1. Navigate to screen (Settings, FileBrowser, etc.)
2. Screenshot
3. AI verifies correct rendering
4. Navigate back or to next

**Expected Screenshots**:
- Chat: Purple gradient, messages, input
- Settings: Server URL input, toggles, back button
- FileBrowser: File list, search, path indicator
- CodeViewer: Code content, file info
- Sessions: Session list, delete buttons

### Step 9: Multi-Device Testing (Optional)

**Test on 3 devices**:
- iPhone SE (small)
- iPhone 16 Pro (standard)
- iPhone 16 Pro Max (large)

**For each**: Boot, install, launch, screenshot, verify responsive

### Step 10: Declare Gate 4A Result (AUTONOMOUS)

**AI Decision Logic**:

```
IF all verified via screenshots:
  ✅ App loads without errors
  ✅ Backend connects successfully
  ✅ Messages send and receive
  ✅ All screens render correctly
  ✅ Navigation works
  ✅ No crashes or red screens
  
THEN:
  DECLARE: "Gate 4A PASSED ✅"
  Save results to Serena memory
  Git commit validation
  
ELSE:
  DECLARE: "Gate 4A FAILED ❌"
  Document specific failures
  DO NOT PROCEED to Phase 6
```

**NO asking user. AI decides from screenshot evidence.**

---

## 🔧 TROUBLESHOOTING GUIDE

### Issue: "No script URL provided"

**Cause**: Metro not accessible to app

**Fix**:
```bash
# Ensure Metro running:
curl http://localhost:8081/status

# If not running, start:
cd claude-code-mobile && npx expo start

# Wait 30s for cache rebuild

# Then reload app:
xcrun simctl openurl booted "exp://localhost:8081"
```

### Issue: "Unable to resolve module X"

**Cause**: Package not installed

**Fix**:
```bash
cd claude-code-mobile
npx expo install X

# Kill Metro
killall expo

# Restart Metro
npx expo start --clear

# Wait for cache rebuild

# Reload app
```

### Issue: App opens in Expo Go

**Cause**: Wrong app launching

**Fix**:
```bash
# Close Expo Go
xcrun simctl terminate booted host.exp.Exponent

# Launch our native build:
xcrun simctl launch booted com.yourcompany.claudecodemobile
```

### Issue: Red error screen with React error

**Autonomous Fix**:
1. Screenshot shows exact error
2. AI reads error message
3. AI identifies file and line
4. AI fixes via Serena (read file, fix issue, save)
5. Reload app: `curl -X POST http://localhost:8081/reload` OR re-launch
6. Screenshot again
7. Verify fixed

**Loop until no errors**

---

## 📋 GATE 4A AUTONOMOUS TEST CHECKLIST

Use this checklist - create TodoWrite todos for each:

**Prerequisites**:
- [ ] Backend running on port 3001 (verify health endpoint)
- [ ] Metro running on port 8081 (verify status endpoint)
- [ ] App installed on simulator
- [ ] iPhone 16 Pro simulator booted

**Visual Validation** (Screenshots + AI Analysis):
- [ ] Screenshot: App loads without red error screen
- [ ] AI verifies: Purple gradient background visible
- [ ] AI verifies: Welcome text visible
- [ ] AI verifies: Input field and send button visible
- [ ] AI verifies: Connection status shows "Connected" (green)

**Integration Testing**:
- [ ] Screenshot: Type message, tap send
- [ ] AI verifies: Message appears as user bubble (teal, right)
- [ ] AI verifies: Streaming indicator shows
- [ ] AI verifies: Assistant response appears (white, left)
- [ ] Screenshot: Tool execution if used
- [ ] AI verifies: Tool card visible, result shown

**Navigation Testing**:
- [ ] Navigate to Settings (tap gear icon)
- [ ] Screenshot Settings screen
- [ ] AI verifies: Server URL input, toggles visible
- [ ] Navigate to FileBrowser
- [ ] Screenshot FileBrowser
- [ ] AI verifies: File list, search bar visible
- [ ] Test remaining screens (CodeViewer, Sessions)

**Final Verification**:
- [ ] All screenshots analyzed
- [ ] No red error screens in any screenshot
- [ ] All expected elements visible
- [ ] Integration working (message flow tested)
- [ ] AI makes final PASS/FAIL decision
- [ ] Results saved to Serena memory
- [ ] Git commit if fixes were made

**NO user confirmation at any step - AI verifies everything via screenshots**

---

## 🛠️ TOOLS AVAILABLE

### xc-mcp (iOS Simulator - Always Works)

**Screenshot**:
```typescript
mcp__xc-mcp__screenshot({
  appName: "ClaudeCodeMobile",
  screenName: "ScreenName",
  state: "description",
  size: "half" // 50% token savings
})
// Returns inline base64 image - AI can see immediately
```

**UI Tree** (for finding tap coordinates):
```typescript
mcp__xc-mcp__idb-ui-describe({operation: "all"})
// Returns accessibility tree with coordinates
```

**Tap Element**:
```typescript
mcp__xc-mcp__idb-ui-tap({
  x: <from-tree-or-visual-estimate>,
  y: <from-tree-or-visual-estimate>,
  applyScreenshotScale: true,
  screenshotScaleX: 1.67,
  screenshotScaleY: 1.66,
  actionName: "Action description"
})
```

**Simulator Management**:
```typescript
mcp__xc-mcp__simctl-boot({deviceId: "iPhone 16 Pro"})
mcp__xc-mcp__simctl-launch({udid: "booted", bundleId: "com.yourcompany.claudecodemobile"})
mcp__xc-mcp__simctl-terminate({udid: "booted", bundleId: "..."})
```

### expo-mcp (If MCP Flag Worked)

**Note**: Previous session couldn't get EXPO_UNSTABLE_MCP_SERVER=1 flag working in zsh

**If you get it working**:
```
"Take screenshot of Chat screen"
"Find view with testID 'message-input'"
"Tap button with testID 'send-button'"
# Natural language prompts
```

**Fallback**: Use xc-mcp (proven to work)

### Serena MCP (File Operations)

```typescript
mcp__serena__read_file({relative_path: "path"})
mcp__serena__create_text_file({relative_path, content})
mcp__serena__replace_regex({relative_path, regex, repl})
mcp__serena__write_memory({memory_name, content})
```

### Git MCP (Version Control)

```typescript
mcp__git__git_add({repo_path: ".", files: [...]})
mcp__git__git_commit({repo_path: ".", message: "..."})
```

---

## 🔍 AUTONOMOUS TESTING WORKFLOW (The Correct Way)

**Pattern**:
```
1. Take screenshot
2. AI analyzes with vision
3. If error found:
   a. AI identifies error from screenshot
   b. AI fixes error (install package, fix code, etc.)
   c. AI reloads app
   d. Go to step 1 (re-screenshot)
4. If no error:
   a. Test next functionality
   b. Screenshot
   c. AI verifies worked
   d. Continue to next test
5. After all tests: AI declares PASS/FAIL based on evidence
```

**NEVER**:
- Ask user "can you check..."
- Ask user "does it work..."
- Ask user to reload
- Ask user to confirm anything

**ALWAYS**:
- Take screenshot
- AI analyzes
- AI decides
- AI proceeds or fixes

---

## 📊 PREVIOUS SESSION LEARNINGS

### What Worked

**Backend Testing** (Gate 3A):
- Manual Node.js WebSocket client
- Functional testing (real files created)
- Proved backend works completely

**Frontend Autonomous Fixes**:
- Screenshot showed "zustand not found" → AI installed zustand
- Screenshot showed "LinearGradient invalid" → AI fixed imports
- Screenshot showed "main not registered" → AI created index.js
- 4 iterations of screenshot → fix → verify loop

**AI Vision Analysis**:
- Successfully identified errors from screenshots
- Successfully verified colors, layout, text
- Successfully determined when app was working vs broken

### What Didn't Work

**Metro Bundler**:
- Consumed 300k+ tokens trying to fix Metro issues
- Never achieved stable Metro → App connection
- Multiple instances conflicted

**expo-mcp**:
- Flag wouldn't set in zsh: `EXPO_UNSTABLE_MCP_SERVER=1`
- Never got local tools (automation_*) working
- Had to fallback to xc-mcp

**Premature Success Declaration**:
- Declared "PASSED" 3 times when app had errors
- Didn't check app logs before declaring success
- Didn't test complete flows before declaring success

---

## 🎯 SUCCESS CRITERIA FOR NEXT SESSION

**Gate 4A PASSES when**:

✅ App loads showing ChatScreen (purple gradient, welcome text)  
✅ Connection status shows GREEN "Connected"  
✅ Backend health check: 200 OK  
✅ Type message → Tap send → Message appears as user bubble  
✅ Backend receives message (check logs)  
✅ Assistant response streams back  
✅ Response appears as assistant bubble  
✅ All 5 screens accessible and render correctly  
✅ All verified via SCREENSHOTS + AI VISION ANALYSIS  
✅ NO red error screens in any screenshot  
✅ NO user confirmation needed anywhere

**Then and only then**: Declare Gate 4A PASSED, save to memory, proceed to Phase 6.

---

## 📁 FILE LOCATIONS REFERENCE

**Backend**:
- Code: `/Users/nick/Desktop/claude-mobile-expo/backend/src/`
- Compiled: `/Users/nick/Desktop/claude-mobile-expo/backend/dist/`
- Start: `node dist/index.js`

**Frontend**:
- Code: `/Users/nick/Desktop/claude-mobile-expo/claude-code-mobile/src/`
- Entry: `/Users/nick/Desktop/claude-mobile-expo/claude-code-mobile/index.js`
- Metro: Run from `/Users/nick/Desktop/claude-mobile-expo/claude-code-mobile/`

**Native Build**:
- Location: `/Users/nick/Library/Developer/Xcode/DerivedData/claudecodemobile-.../claudecodemobile.app`
- Bundle ID: `com.yourcompany.claudecodemobile`

**Logs**:
- Backend: `/Users/nick/Desktop/claude-mobile-expo/logs/backend.log`
- Metro: `/Users/nick/Desktop/claude-mobile-expo/logs/metro.log`

---

## 🚦 QUICK START COMMANDS

**Terminal 1 - Backend**:
```bash
cd /Users/nick/Desktop/claude-mobile-expo/backend
node dist/index.js
```

**Terminal 2 - Metro**:
```bash
cd /Users/nick/Desktop/claude-mobile-expo/claude-code-mobile
npx expo start --clear
```

**Terminal 3 - App**:
```bash
xcrun simctl launch booted com.yourcompany.claudecodemobile
```

**Then**: Screenshot, analyze, test autonomously.

---

## 💡 CRITICAL REMINDERS

1. **Use autonomous testing**: Screenshot → AI analyze → Fix → Loop
2. **Never ask user to confirm**: AI verifies from screenshots
3. **Test complete flows**: Not just "app renders"
4. **Use xc-mcp**: expo-mcp flag issues, xc-mcp screenshot proven to work
5. **Backend connection required**: Gate 4A includes integration, not just UI
6. **All evidence via screenshots**: AI vision analysis, not assumptions

---

## 🎯 EXPECTED NEXT SESSION OUTCOME

**Time**: 1-2 hours (with working Metro)  
**Tokens**: 300-400k (testing + fixes)  
**Result**: Gate 4A PASSED, ready for Phase 6 Integration Gates

**Then**: Phases 6-12 (Integration, Production, Testing, Deployment)

---

**This primer contains everything you need to complete Gate 4A properly. Good luck!**
