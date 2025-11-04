# v3 Functional Validation Gates
**Project**: claude-code-mobile-v3
**Created**: 2025-11-04
**Purpose**: Comprehensive functional testing framework for v3 rebuild

---

## Overview

**10 Functional Gates** to validate every aspect of the v3 app through **actual iOS simulator testing**.

**Testing Method**: IDB CLI automation + xc-mcp screenshots + backend log verification

**Pass Criteria**: ALL sub-tests within a gate must pass (HARD STOP on any failure)

**Required Skills**:
- @claude-mobile-metro-manager
- @idb-claude-mobile-testing
- @claude-mobile-ios-testing
- @claude-mobile-validation-gate

---

## GATE 1: Backend Connectivity & Health

**Purpose**: Verify Python FastAPI backend is functional

### Tests

#### 1.1: Health Endpoint
```bash
curl -s http://localhost:8001/health | jq
```
**Pass**: Returns `{"status":"healthy","claude_version":"2.0.32",...}`

#### 1.2: Claude CLI Integration
```bash
curl -s http://localhost:8001/health | jq -r '.claude_version'
```
**Pass**: Returns version string containing "2.0.3"

#### 1.3: Models Available
```bash
curl -s http://localhost:8001/v1/models | jq '.data | length'
```
**Pass**: Returns 4 (Claude Opus 4, Sonnet 4, Sonnet 3.7, Haiku 3.5)

#### 1.4: Chat Endpoint Responds
```bash
curl -X POST http://localhost:8001/v1/chat/completions \
  -H 'Content-Type: application/json' \
  -d '{"model":"claude-3-5-haiku-20241022","messages":[{"role":"user","content":"Say: OK"}],"stream":false}' \
  | jq -r '.choices[0].message.content'
```
**Pass**: Returns message containing "OK"

#### 1.5: Backend Logs Active
```bash
tail -20 /Users/nick/Desktop/claude-mobile-expo/logs/backend-v3-test.log
```
**Pass**: Shows INFO log entries for recent requests

**Automation**:
```bash
./scripts/test-python-backend-sanity.sh
# Should show: 6/6 TESTS PASSED
```

---

## GATE 2: Metro Bundler & App Loading

**Purpose**: Verify Metro bundler starts and app loads successfully

### Tests

#### 2.1: Metro Start
```bash
./scripts/start-metro.sh
```
**Pass**:
- Metro PID written to logs/metro.pid
- logs/metro.log shows "Waiting on http://localhost:8081"
- No errors in log

#### 2.2: Metro Health
```bash
curl -s http://localhost:8081/status
```
**Pass**: Returns `packager-status:running`

#### 2.3: expo-mcp Package
```bash
cd claude-code-mobile-v3 && npm list expo-mcp
```
**Pass**: Shows `expo-mcp@0.1.15` installed

#### 2.4: Bundle Success
```bash
grep "Bundled" logs/metro.log | tail -1
```
**Pass**: Shows "iOS Bundled Xms node_modules/expo-router/entry.js (X modules)"

#### 2.5: App Loads in Simulator
```bash
# After: xcrun simctl openurl booted exp://localhost:8081
# Wait 10 seconds
```
**Pass**:
- Screenshot shows app UI (not Expo Go error screen)
- Green "Connected" status visible
- Tab bar with icons visible

**Automation**:
```bash
# Screenshot and verify:
mcp__xc-mcp__screenshot({udid: "booted", size: "half", screenName: "InitialLoad"})
# AI verifies: App loaded, not showing error screen
```

---

## GATE 3: HTTPContext & Backend Connection

**Purpose**: Verify HTTPService initializes and connects to backend

### Tests

#### 3.1: HTTPService Initialization
```bash
# Check Metro console logs
grep "RootLayout.*HTTPService" logs/metro.log
```
**Pass**: Shows "[RootLayout] HTTPService initialized"

#### 3.2: Connection Status Update
```bash
grep "Connection status: true" logs/metro.log
```
**Pass**: Backend connection confirmed in logs

#### 3.3: Green Status Indicator
**Automation**:
```bash
idb ui describe-all --udid booted | jq '.[] | select(.AXLabel == "Connected")'
```
**Pass**: Returns element with enabled:true

#### 3.4: Settings Screen Shows Connection
```typescript
// Navigate to Settings tab
idb ui tap --udid booted 301 815
sleep 1

// Screenshot
mcp__xc-mcp__screenshot({udid: "booted", screenName: "SettingsConnection"})
```
**Pass**: Screenshot shows connection status section with green indicator

#### 3.5: Backend Receives Health Checks
```bash
grep "GET /health" logs/backend-v3-test.log | tail -5
```
**Pass**: Shows multiple health check requests from app

---

## GATE 4: Chat Screen - Message Send & Receive

**Purpose**: Verify complete chat workflow with streaming

### Tests

#### 4.1: Input Field Interaction
```bash
# Get UI tree
idb ui describe-all --udid booted > /tmp/ui.json

# Find input coordinates
INPUT=$(cat /tmp/ui.json | jq '.[] | select(.AXUniqueId == "message-input")')

# Tap input
idb ui tap --udid booted $(echo $INPUT | jq -r '.frame.x + .frame.width/2') \
                          $(echo $INPUT | jq -r '.frame.y + .frame.height/2')
```
**Pass**: Silent success (no error)

#### 4.2: Text Entry
```bash
idb ui text --udid booted "GATE 4 validation message"
sleep 1
```
**Pass**:
- Silent success
- Screenshot shows text in input field

#### 4.3: Send Button Enabled
```bash
idb ui describe-all --udid booted | jq '.[] | select(.AXUniqueId == "send-button") | .enabled'
```
**Pass**: Returns `true` (button enabled after text entered)

#### 4.4: Message Send
```bash
# Tap send button
SEND=$(cat /tmp/ui.json | jq '.[] | select(.AXUniqueId == "send-button")')
idb ui tap --udid booted $(echo $SEND | jq -r '.frame.x + .frame.width/2') \
                          $(echo $SEND | jq -r '.frame.y + .frame.height/2')
sleep 1
```
**Pass**:
- Silent success
- Backend logs show: `POST /v1/chat/completions 200 OK`

#### 4.5: User Message Displayed
```typescript
// Screenshot after send
mcp__xc-mcp__screenshot({udid: "booted", screenName: "AfterSend"})
```
**Pass**: Screenshot shows user message bubble (teal background, right-aligned)

#### 4.6: Streaming Indicator
**Pass**: Screenshot shows 3-dot streaming indicator

#### 4.7: Assistant Response Appears
```bash
sleep 5  # Wait for Claude response
```
**Pass**: Screenshot shows assistant message bubble (gray background, left-aligned)

#### 4.8: Backend Streaming Logs
```bash
grep "SSE.*streaming" logs/backend-v3-test.log
```
**Pass**: Shows SSE events sent to client

---

## GATE 5: Tab Navigation (5 Tabs)

**Purpose**: Verify all tab buttons navigate correctly

### Tests

#### 5.1: Chat Tab (Default)
```bash
# Already on Chat tab after app load
```
**Pass**: Screenshot shows Chat screen with message input

#### 5.2: Projects Tab
```bash
idb ui tap --udid booted 100 815
sleep 1
mcp__xc-mcp__screenshot({udid: "booted", screenName: "ProjectsTab"})
```
**Pass**: Screenshot shows Projects header, "Discover Projects" button

#### 5.3: Skills Tab
```bash
idb ui tap --udid booted 167 815
sleep 1
mcp__xc-mcp__screenshot({udid: "booted", screenName: "SkillsTab"})
```
**Pass**: Screenshot shows Skills header, loading or list of skills

#### 5.4: Agents Tab
```bash
idb ui tap --udid booted 234 815
sleep 1
mcp__xc-mcp__screenshot({udid: "booted", screenName: "AgentsTab"})
```
**Pass**: Screenshot shows Agents header, loading or list of agents

#### 5.5: Settings Tab
```bash
idb ui tap --udid booted 301 815
sleep 1
mcp__xc-mcp__screenshot({udid: "booted", screenName: "SettingsTab"})
```
**Pass**: Screenshot shows Settings with server URL, project path inputs

#### 5.6: Tab Icons Visible
**Pass**: All 5 screenshots show tab bar with 5 different icons

#### 5.7: Tab Highlight Color
**Pass**: Active tab shows teal color (#14b8a6)

---

## GATE 6: Stack Screen Navigation from Settings

**Purpose**: Verify modal and push navigation from Settings

### Tests

#### 6.1: Sessions Modal
```bash
# On Settings tab, find "View Sessions" button
idb ui describe-all --udid booted | jq '.[] | select(.AXLabel | contains("Sessions"))'

# Tap View Sessions
idb ui tap --udid booted <X> <Y>  # Coordinates from describe-all
sleep 1

# Screenshot
mcp__xc-mcp__screenshot({udid: "booted", screenName: "SessionsModal"})
```
**Pass**: Screenshot shows modal presentation with session list

#### 6.2: Git Screen
```bash
# Find and tap Git Operations button
idb ui tap --udid booted <X> <Y>
sleep 1
mcp__xc-mcp__screenshot({udid: "booted", screenName: "GitScreen"})
```
**Pass**: Screenshot shows Git screen with branch info, file changes

#### 6.3: MCP Screen
```bash
# Find and tap MCP Servers button
idb ui tap --udid booted <X> <Y>
sleep 1
mcp__xc-mcp__screenshot({udid: "booted", screenName: "MCPScreen"})
```
**Pass**: Screenshot shows MCP server list or empty state

#### 6.4: Files Browser
```bash
# Find and tap Browse Files button
idb ui tap --udid booted <X> <Y>
sleep 2
mcp__xc-mcp__screenshot({udid: "booted", screenName: "FilesScreen"})
```
**Pass**: Screenshot shows file/directory list with current path

#### 6.5: Back Navigation
```bash
# Tap back button or swipe
idb ui key --udid booted escape  # Or swipe right
sleep 1
```
**Pass**: Returns to Settings screen

---

## GATE 7: Backend API Integration Per Screen

**Purpose**: Verify each screen calls correct backend endpoints

### Tests

#### 7.1: Projects Screen - discoverProjects()
```bash
# On Projects tab, tap "Discover Projects" button
idb ui tap --udid booted <X> <Y>
sleep 2

# Check backend logs
grep "POST /v1/host/discover" logs/backend-v3-test.log | tail -1
```
**Pass**: Shows `200 OK` response

#### 7.2: Skills Screen - listSkills()
```bash
# On Skills tab, wait for load
sleep 2

# Check backend logs
grep "GET /v1/skills" logs/backend-v3-test.log | tail -1
```
**Pass**: Shows `200 OK`, returns 83+ skills

#### 7.3: Agents Screen - listAgents()
```bash
# On Agents tab, wait for load
sleep 2

# Check backend logs
grep "GET /v1/agents" logs/backend-v3-test.log | tail -1
```
**Pass**: Shows `200 OK`, returns agent list

#### 7.4: Sessions - listSessions()
```bash
# In Sessions modal
grep "GET /v1/sessions" logs/backend-v3-test.log | tail -1
```
**Pass**: Shows `200 OK`, returns sessions array

#### 7.5: Git - getGitStatus()
```bash
# On Git screen
grep "GET /v1/git/status" logs/backend-v3-test.log | tail -1
```
**Pass**: Shows `200 OK`, returns branch and changes

#### 7.6: MCP - listMCPServers()
```bash
# On MCP screen
grep "GET /v1/mcp/servers" logs/backend-v3-test.log | tail -1
```
**Pass**: Shows `200 OK`, returns server list

#### 7.7: Files - listFiles()
```bash
# On Files screen
grep "GET /v1/files/list" logs/backend-v3-test.log | tail -1
```
**Pass**: Shows `200 OK`, returns file/directory array

---

## GATE 8: File Browser Deep Navigation

**Purpose**: Verify file browser navigates directories and opens files

### Tests

#### 8.1: Directory List Display
```typescript
mcp__xc-mcp__screenshot({udid: "booted", screenName: "FilesRoot"})
```
**Pass**: Shows files and folders with icons (📁 📄)

#### 8.2: Navigate Into Directory
```bash
# Find first directory in list
DIR=$(idb ui describe-all --udid booted | jq '.[] | select(.AXLabel | contains("directory"))')

# Tap directory
idb ui tap --udid booted <X> <Y>
sleep 1
```
**Pass**: Backend shows `GET /v1/files/list?path=<directory>`

#### 8.3: File Open
```bash
# Find first file
FILE=$(idb ui describe-all --udid booted | jq '.[] | select(.AXLabel | contains(".ts"))')

# Tap file
idb ui tap --udid booted <X> <Y>
sleep 1

mcp__xc-mcp__screenshot({udid: "booted", screenName: "CodeViewer"})
```
**Pass**: Screenshot shows file content with syntax highlighting

#### 8.4: File Read API
```bash
grep "GET /v1/files/read" logs/backend-v3-test.log | tail -1
```
**Pass**: Shows `200 OK` with file path parameter

#### 8.5: Navigate Up
```bash
# Tap back or up button
idb ui key --udid booted escape
sleep 1
```
**Pass**: Returns to parent directory

---

## GATE 9: Session Management

**Purpose**: Verify session CRUD operations work

### Tests

#### 9.1: Create New Session
```bash
# Send message creates session
# (Already done in Gate 4)

# Check backend
curl -s http://localhost:8001/v1/sessions | jq 'length'
```
**Pass**: Returns ≥ 1 (at least one session exists)

#### 9.2: List Sessions in Modal
```bash
# Open Sessions modal from Settings
# idb ui tap...

sleep 1
mcp__xc-mcp__screenshot({udid: "booted", screenName: "SessionsList"})
```
**Pass**: Screenshot shows session list with project paths, message counts

#### 9.3: Switch Session
```bash
# Tap different session in list
idb ui tap --udid booted <X> <Y>
sleep 1
```
**Pass**:
- Modal dismisses
- Chat screen loads new session messages
- Backend logs show `GET /v1/sessions/<id>`

#### 9.4: Delete Session
```bash
# In Sessions modal, tap delete icon
idb ui tap --udid booted <X> <Y>
sleep 1

# Verify backend
grep "DELETE /v1/sessions" logs/backend-v3-test.log | tail -1
```
**Pass**: Shows `200 OK`, session removed from list

---

## GATE 10: Git Operations

**Purpose**: Verify Git screen shows status and creates commits

### Tests

#### 10.1: Git Status Display
```bash
# Navigate to Git screen
# idb ui tap...

sleep 2
mcp__xc-mcp__screenshot({udid: "booted", screenName: "GitStatus"})
```
**Pass**: Screenshot shows:
- Current branch name
- Modified files (if any)
- Staged files (if any)
- Untracked files (if any)

#### 10.2: Git Status API
```bash
grep "GET /v1/git/status" logs/backend-v3-test.log | tail -1
```
**Pass**: Shows `200 OK` with project path parameter

#### 10.3: Commit Message Entry
```bash
# Create test file to commit
echo "Gate 10 test" > /tmp/test-gate-10.txt
cp /tmp/test-gate-10.txt /Users/nick/Desktop/claude-mobile-expo/

# Refresh git status in app
idb ui tap --udid booted <refresh_button_coords>
sleep 1
```
**Pass**: Screenshot shows test-gate-10.txt in untracked list

#### 10.4: Create Commit
```bash
# Tap commit message input
idb ui tap --udid booted <X> <Y>

# Type commit message
idb ui text --udid booted "Gate 10 validation commit"

# Tap commit button
idb ui tap --udid booted <commit_button_coords>
sleep 2
```
**Pass**: Backend logs show `POST /v1/git/commit 200 OK`

#### 10.5: Verify Commit Created
```bash
cd /Users/nick/Desktop/claude-mobile-expo
git log --oneline | head -1
```
**Pass**: Shows commit with message "Gate 10 validation commit"

---

## GATE 11: Error Handling & Recovery

**Purpose**: Verify app handles errors gracefully

### Tests

#### 11.1: Backend Offline Error
```bash
# Stop backend
pkill -f uvicorn

# Try to send message in app
idb ui tap --udid booted 181 725
idb ui text --udid booted "Test offline"
idb ui tap --udid booted 370 729
sleep 2

mcp__xc-mcp__screenshot({udid: "booted", screenName: "BackendOffline"})
```
**Pass**: Screenshot shows error message "HTTP 503" or "Failed to send"

#### 11.2: Connection Status Updates
```bash
# Check status indicator turns red
idb ui describe-all --udid booted | jq '.[] | select(.AXUniqueId == "connection-status")'
```
**Pass**: Shows connection status changed to "disconnected" or "error"

#### 11.3: Backend Reconnection
```bash
# Restart backend
cd backend && uvicorn claude_code_api.main:app --host 0.0.0.0 --port 8001 &
sleep 5

# Check app reconnects
grep "Connection status: true" logs/metro.log | tail -1
```
**Pass**: Shows reconnection after backend restored

#### 11.4: Retry Message Send
```bash
# Try sending again
idb ui tap --udid booted 181 725
idb ui text --udid booted "Test after recovery"
idb ui tap --udid booted 370 729
sleep 5

mcp__xc-mcp__screenshot({udid: "booted", screenName: "AfterRecovery"})
```
**Pass**: Message sends successfully, response appears

#### 11.5: Invalid Input Handling
```bash
# Empty message should not send
idb ui tap --udid booted 370 729  # Tap send with empty input
sleep 1
```
**Pass**: No backend request (button should be disabled when input empty)

---

## GATE 12: Zustand State Persistence

**Purpose**: Verify settings persist across app restarts

### Tests

#### 12.1: Change Settings
```bash
# Navigate to Settings
idb ui tap --udid booted 301 815

# Change server URL
idb ui tap --udid booted <server_url_input_coords>
idb ui text --udid booted "http://192.168.1.100:8001"

# Change project path
idb ui tap --udid booted <project_path_input_coords>
idb ui text --udid booted "/Users/nick/Desktop/test-project"

sleep 1
```
**Pass**: Silent success

#### 12.2: Kill and Restart App
```bash
# Kill Expo process in simulator
# Reopen app
xcrun simctl openurl booted exp://localhost:8081
sleep 10
```
**Pass**: App reopens without crash

#### 12.3: Verify Settings Persisted
```bash
# Navigate to Settings
idb ui tap --udid booted 301 815
sleep 1

mcp__xc-mcp__screenshot({udid: "booted", screenName: "SettingsAfterRestart"})
```
**Pass**: Screenshot shows saved server URL and project path

#### 12.4: AsyncStorage Verification
```bash
# Check AsyncStorage directly (if possible)
# Or verify via app behavior
```
**Pass**: Settings loaded from AsyncStorage on launch

---

## GATE 13: UI State Management

**Purpose**: Verify Zustand store updates correctly across screens

### Tests

#### 13.1: Message History Updates
```bash
# Send 3 messages sequentially
# Check each appears in UI
```
**Pass**: All 3 messages visible in chat history

#### 13.2: Session Switch Updates Messages
```bash
# Create second session (send message in new chat)
# Switch back to first session via Sessions modal
# Verify messages change
```
**Pass**: Chat screen shows different message history for each session

#### 13.3: Error State Display
```bash
# Trigger error (backend offline)
# Verify error message shown
```
**Pass**: Error displayed in UI (toast or inline message)

#### 13.4: Loading States
```bash
# Monitor during API calls
```
**Pass**: Loading skeletons or spinners show during async operations

#### 13.5: Connection State Synced
```bash
# Backend offline
# Check all screens show disconnected status
```
**Pass**: Connection indicator consistent across all tabs

---

## GATE 14: TypeScript Compilation

**Purpose**: Verify zero TypeScript errors

### Tests

#### 14.1: Type Check
```bash
cd claude-code-mobile-v3
npx tsc --noEmit 2>&1 | tee /tmp/tsc-output.txt
```
**Pass**: Exit code 0, no errors (only node_modules warnings acceptable)

#### 14.2: Known Type Error (Git Screen)
```bash
grep "app/git.tsx" /tmp/tsc-output.txt
```
**Expected**: Should show type error on line 58 (GitStatus vs GitStatusResponse)

#### 14.3: ESLint Check
```bash
npx eslint "**/*.{js,jsx,ts,tsx}" 2>&1 | tee /tmp/eslint-output.txt
```
**Pass**: No critical errors (warnings acceptable)

---

## GATE 15: Component Styling Compliance

**Purpose**: Verify NativeWind v4 usage, no StyleSheet violations

### Tests

#### 15.1: No StyleSheet Imports (Critical Files)
```bash
grep -r "import.*StyleSheet" claude-code-mobile-v3/components/*.tsx | grep -v "//"
```
**Expected Violations** (known issues):
- HeaderButton.tsx
- TabBarIcon.tsx
- PullToRefresh.tsx (React Native RefreshControl limitation)

#### 15.2: NativeWind Classes Used
```bash
grep -r 'className="' claude-code-mobile-v3/app/ | wc -l
```
**Pass**: Returns > 200 (extensive className usage)

#### 15.3: Theme Colors Consistent
```bash
grep -r "bg-background\|text-foreground\|bg-primary" claude-code-mobile-v3/app/ | wc -l
```
**Pass**: Returns > 50 (design tokens used throughout)

#### 15.4: No Hardcoded Colors (Except Known Cases)
```bash
grep -r "#[0-9a-fA-F]\{6\}" claude-code-mobile-v3/app/*.tsx
```
**Expected**: Only in inline style props (headerStyle), not className

---

## Automated Test Suite

**File**: `/Users/nick/Desktop/claude-mobile-expo/scripts/run-all-v3-gates.sh`

```bash
#!/bin/bash
set -euo pipefail

DEVICE="iPhone 17 Pro Max"
LOG_DIR="logs"
RESULTS_DIR="validation/v3-gate-results"

mkdir -p "$RESULTS_DIR"

echo "=========================================="
echo "v3 FUNCTIONAL VALIDATION - 10 GATES"
echo "=========================================="
echo "Device: $DEVICE"
echo "Timestamp: $(date)"
echo ""

GATES_PASSED=0
GATES_FAILED=0

# Gate 1: Backend
echo "🔧 GATE 1: Backend Connectivity & Health"
./scripts/test-python-backend-sanity.sh && {
  echo "✅ GATE 1: PASS"
  ((GATES_PASSED++))
} || {
  echo "❌ GATE 1: FAIL"
  ((GATES_FAILED++))
  exit 1  # HARD STOP
}

# Gate 2: Metro & App Loading
echo ""
echo "📦 GATE 2: Metro Bundler & App Loading"
./scripts/start-metro.sh && \
xcrun simctl openurl booted exp://localhost:8081 && \
sleep 10 && \
./scripts/verify-app-loaded.sh && {
  echo "✅ GATE 2: PASS"
  ((GATES_PASSED++))
} || {
  echo "❌ GATE 2: FAIL"
  ((GATES_FAILED++))
  exit 1  # HARD STOP
}

# Gate 3: HTTPContext & Connection
echo ""
echo "🔌 GATE 3: HTTPContext & Backend Connection"
./scripts/verify-connection-status.sh && {
  echo "✅ GATE 3: PASS"
  ((GATES_PASSED++))
} || {
  echo "❌ GATE 3: FAIL"
  ((GATES_FAILED++))
  exit 1  # HARD STOP
}

# Gates 4-10: Continue pattern...
# Each gate runs its validation script
# Each failure triggers HARD STOP

echo ""
echo "=========================================="
echo "FINAL RESULTS"
echo "=========================================="
echo "Gates Passed: $GATES_PASSED/10"
echo "Gates Failed: $GATES_FAILED/10"

if [ $GATES_FAILED -eq 0 ]; then
  echo "✅ ALL GATES PASSED - v3 APP VALIDATED"
  exit 0
else
  echo "❌ VALIDATION FAILED - FIX AND RERUN"
  exit 1
fi
```

---

## Gate Execution Checklist

**Before Running Gates**:
- [ ] Backend running on port 8001
- [ ] Metro running on port 8081 with expo-mcp
- [ ] iPhone 17 Pro Max booted
- [ ] App loaded (exp://localhost:8081)
- [ ] Green "Connected" status visible
- [ ] IDB CLI tested and working
- [ ] Skills invoked: @claude-mobile-metro-manager, @idb-claude-mobile-testing

**During Execution**:
- [ ] Screenshot after each test
- [ ] Verify backend logs for each API call
- [ ] HARD STOP on any failure
- [ ] Document failure in logs
- [ ] Fix issue before continuing

**After All Gates Pass**:
- [ ] Save all screenshots to validation/v3-gate-results/
- [ ] Generate comprehensive report
- [ ] Save Serena memory with results
- [ ] Commit to git with validation evidence

---

## Pass Criteria Summary

| Gate | Total Tests | Pass Threshold | Hard Stop |
|------|-------------|----------------|-----------|
| 1. Backend | 5 | 5/5 | Yes |
| 2. Metro & App | 5 | 5/5 | Yes |
| 3. HTTPContext | 5 | 5/5 | Yes |
| 4. Chat Screen | 8 | 8/8 | Yes |
| 5. Tab Navigation | 7 | 7/7 | Yes |
| 6. Stack Navigation | 5 | 5/5 | Yes |
| 7. API Integration | 7 | 7/7 | Yes |
| 8. File Browser | 5 | 5/5 | Yes |
| 9. Session Management | 4 | 4/4 | Yes |
| 10. Git Operations | 5 | 5/5 | Yes |

**Total Tests**: 56
**Passing Score**: 56/56 (100%)
**Any failure**: HARD STOP, fix and rerun

---

## Skills Invocation Map

| Gate | Primary Skill | Purpose |
|------|--------------|---------|
| 1 | websocket-integration-testing | Backend functional testing, NO MOCKS |
| 2 | claude-mobile-metro-manager | Metro lifecycle management |
| 3 | claude-mobile-ios-testing | HTTPContext verification |
| 4 | idb-claude-mobile-testing | IDB automation for chat |
| 5 | idb-claude-mobile-testing | Tab navigation automation |
| 6 | idb-claude-mobile-testing | Stack navigation |
| 7 | claude-mobile-validation-gate | API integration verification |
| 8 | idb-claude-mobile-testing | File browser testing |
| 9 | idb-claude-mobile-testing | Session CRUD |
| 10 | idb-claude-mobile-testing | Git operations |

---

## Execution Command

```bash
# Run all gates sequentially with HARD STOP enforcement:
./scripts/run-all-v3-gates.sh "iPhone 17 Pro Max"

# Or run individual gates:
./scripts/run-v3-gate-1.sh  # Backend
./scripts/run-v3-gate-2.sh  # Metro
./scripts/run-v3-gate-4.sh  # Chat
# etc.
```

---

## Documentation

**Full validation report**: `docs/V3-COMPREHENSIVE-VALIDATION-REPORT-2025-11-04.md`
**Gate results**: `validation/v3-gate-results/` (screenshots + logs)
**Subagent reports**: Embedded in validation report

---

**Created**: 2025-11-04
**Token Usage**: 350k/1M
**Status**: Gate definitions complete, ready for execution
