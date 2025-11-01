# VALIDATION GATE 3A: Backend Functional Testing

**Document Version:** 1.0  
**Date:** 2025-10-30  
**Project:** Claude Code Mobile (Expo + TypeScript + MCP)  
**Purpose:** Comprehensive backend validation with automation before frontend integration

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Test Environment Setup](#test-environment-setup)
4. [Automated Testing](#automated-testing)
5. [Manual Test Suite](#manual-test-suite)
6. [Test Results Documentation](#test-results-documentation)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Gate Pass Criteria](#gate-pass-criteria)

---

## Overview

### Purpose

Validation Gate 3A ensures the backend server is fully functional and ready for frontend integration. This gate validates:

- **TypeScript Compilation:** Zero errors, proper dist/ output
- **Server Stability:** Clean startup, WebSocket initialization, health monitoring
- **API Functionality:** REST endpoints and WebSocket protocol
- **Claude Integration:** Message streaming, tool execution, session management
- **Logging System:** Comprehensive event capture and error tracking
- **File Operations:** All 6 core tools execute correctly

### Required Sub-Skill

If ANY test fails, invoke: **`@systematic-debugging`**

### Test Execution Strategy

- **Automated Tests:** Use `test-websocket.sh` and `validate-gate-3a.sh` scripts
- **Manual Verification:** Interactive tests requiring observation
- **Result Storage:** Save to Serena Memory MCP for project history

---

## Prerequisites

### 1. Environment Requirements

```bash
# Check Node.js version (required: 18+)
node --version

# Check npm version (required: 8+)
npm --version

# Verify TypeScript installation
npx tsc --version

# Verify wscat availability (will install if missing)
command -v wscat || npm install -g wscat

# Verify curl availability
command -v curl
```

**Expected Versions:**
- Node.js: v18.0.0 or higher
- npm: v8.0.0 or higher
- TypeScript: v5.0.0 or higher

### 2. Project Structure Verification

```bash
cd /Users/nick/Desktop/claude-mobile-expo

# Verify directory structure
ls -la backend/src/
ls -la backend/dist/ || echo "dist/ will be created after build"
ls -la scripts/
ls -la logs/ || mkdir -p logs
```

**Expected Structure:**
```
claude-mobile-expo/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── websocket/
│   │   ├── routes/
│   │   ├── mcp/
│   │   └── utils/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── scripts/
│   ├── test-websocket.sh
│   └── validate-gate-3a.sh
└── logs/
```

### 3. Dependencies Installation

```bash
cd /Users/nick/Desktop/claude-mobile-expo/backend

# Install all dependencies
npm install

# Verify critical packages
npm list @anthropic-ai/sdk express ws winston
```

**Expected Output:**
```
claude-mobile-expo-backend@1.0.0
├── @anthropic-ai/sdk@0.30.1
├── express@4.18.2
├── ws@8.14.2
└── winston@3.11.0
```

### 4. Environment Configuration

**Create/verify `.env` file:**

```bash
cd /Users/nick/Desktop/claude-mobile-expo/backend

cat > .env << 'EOF'
# Server Configuration
PORT=3001
NODE_ENV=development

# Anthropic API
ANTHROPIC_API_KEY=your-actual-api-key-here
ANTHROPIC_MODEL=claude-sonnet-4-20250514

# CORS
ALLOWED_ORIGINS=*

# Logging
LOG_LEVEL=info
EOF

echo "✅ .env file created"
```

⚠️ **IMPORTANT:** Replace `your-actual-api-key-here` with your real Anthropic API key!

**Verify environment variables:**

```bash
source .env
echo "Port: $PORT"
echo "API Key configured: ${ANTHROPIC_API_KEY:0:10}..."
echo "Model: $ANTHROPIC_MODEL"
```

---

## Test Environment Setup

### Step 1: Create Test Project

```bash
# Create isolated test project
mkdir -p /tmp/test-project
cd /tmp/test-project

# Initialize git repository
git init
git config user.name "Test User"
git config user.email "test@example.com"

echo "# Test Project" > README.md
git add README.md
git commit -m "Initial commit"

echo "✅ Test project created at /tmp/test-project"
```

### Step 2: Build Backend

```bash
cd /Users/nick/Desktop/claude-mobile-expo/backend

# Clean previous build
rm -rf dist/

# Compile TypeScript
npm run build

# Verify compilation
BUILD_EXIT=$?
if [ $BUILD_EXIT -eq 0 ]; then
  echo "✅ TypeScript compilation successful"
  ls -lh dist/index.js
else
  echo "❌ TypeScript compilation failed (exit code: $BUILD_EXIT)"
  exit 1
fi
```

**Expected Output:**
```
> claude-mobile-expo-backend@1.0.0 build
> tsc

✅ TypeScript compilation successful
-rw-r--r--  1 user  staff   45K Oct 30 10:00 dist/index.js
```

### Step 3: Start Backend Server

```bash
# Start server in background
npm start > ../logs/backend-test.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend-test.pid

echo "📊 Backend PID: $BACKEND_PID"
echo "📄 Logs: logs/backend-test.log"

# Wait for server ready (max 15 seconds)
echo "⏳ Waiting for backend to start..."
timeout 15 bash -c 'until curl -sf http://localhost:3001/health > /dev/null 2>&1; do sleep 1; done'

SERVER_CHECK=$?
if [ $SERVER_CHECK -eq 0 ]; then
  echo "✅ Backend server started successfully"
else
  echo "❌ Backend failed to start within 15 seconds"
  tail -50 ../logs/backend-test.log
  exit 1
fi
```

**Expected Console Output:**
```
🚀 Server running on port 3001
📡 WebSocket server initialized on /ws
🔐 Environment: development
🔑 API Key: Configured
```

---

## Automated Testing

### Using test-websocket.sh Script

The `test-websocket.sh` script automates comprehensive WebSocket testing.

#### Script Location

```bash
/Users/nick/Desktop/claude-mobile-expo/scripts/test-websocket.sh
```

#### Script Usage

```bash
cd /Users/nick/Desktop/claude-mobile-expo

# Run with defaults (ws://localhost:3001/ws, /tmp/test-project)
./scripts/test-websocket.sh

# Run with custom parameters
./scripts/test-websocket.sh ws://localhost:3001/ws /tmp/my-test-project
```

#### Script Execution via Serena MCP

```typescript
mcp__serena__execute_shell_command({
  command: "cd /Users/nick/Desktop/claude-mobile-expo && ./scripts/test-websocket.sh",
  max_answer_chars: 10000
})
```

#### What the Script Tests

1. **WebSocket Connection:** Establishes connection to server
2. **Session Initialization:** Creates new session with project path
3. **Message Streaming:** Sends message, validates streaming responses
4. **Tool Execution:** Tests write_file tool with actual file creation
5. **File Operations:** Verifies read_file tool returns correct content
6. **Slash Commands:** Tests /help command execution
7. **File System Verification:** Checks actual file created on disk

#### Expected Script Output

```
🧪 WebSocket Integration Test
==============================
Server: ws://localhost:3001/ws
Project: /tmp/test-project

📦 Installing wscat...
✅ wscat installed

🔌 Connecting to WebSocket...
Connected (press CTRL+C to quit)

📤 Sending: {"type":"init_session","projectPath":"/tmp/test-project"}
📥 Received: {"type":"session_initialized","sessionId":"123e4567-e89b-12d3-a456-426614174000","hasContext":false}

📤 Sending: {"type":"message","message":"Say hello"}
📥 Received: {"type":"content_delta","delta":"Hello"}
📥 Received: {"type":"content_delta","delta":"!"}
📥 Received: {"type":"message_complete"}

📤 Sending: {"type":"message","message":"Create a test.txt file with content 'WebSocket test successful'"}
📥 Received: {"type":"tool_execution","tool":"write_file","input":{"path":"test.txt","content":"WebSocket test successful"}}
📥 Received: {"type":"tool_result","tool":"write_file","result":"Successfully wrote to test.txt"}
📥 Received: {"type":"message_complete"}

📤 Sending: {"type":"message","message":"Show me test.txt"}
📥 Received: {"type":"tool_execution","tool":"read_file","input":{"path":"test.txt"}}
📥 Received: {"type":"tool_result","tool":"read_file","result":"WebSocket test successful"}
📥 Received: {"type":"message_complete"}

📤 Sending: {"type":"message","message":"/help"}
📥 Received: {"type":"slash_command_response","content":"**Available Slash Commands:**\n\n/help - Show this help\n..."}

✅ Validation Results:
=====================
✅ Session initialization: PASS
✅ Message streaming: PASS
✅ Tool execution: PASS
✅ Slash commands: PASS
✅ File operations: PASS

📊 Results: 5/5 tests passed
📄 Full log: logs/websocket-responses.log

✅ All WebSocket tests PASSED
```

#### Test Failure Handling

If any test fails, the script will exit with code 1 and display:

```
❌ Validation Results:
=====================
✅ Session initialization: PASS
❌ Message streaming: FAIL
✅ Tool execution: PASS
✅ Slash commands: PASS
❌ File operations: FAIL (file not created)

📊 Results: 3/5 tests passed
❌ Some WebSocket tests FAILED
```

**Action Required:** Invoke `@systematic-debugging` skill immediately.

### Using validate-gate-3a.sh Script

The `validate-gate-3a.sh` script is a wrapper that runs the complete Gate 3A validation.

#### Script Execution

```bash
cd /Users/nick/Desktop/claude-mobile-expo

# Execute validation gate
./scripts/validate-gate-3a.sh
```

#### Script Execution via Serena MCP

```typescript
mcp__serena__execute_shell_command({
  command: "cd /Users/nick/Desktop/claude-mobile-expo && ./scripts/validate-gate-3a.sh",
  max_answer_chars: 10000
})
```

#### Expected Output

```
🧪 VALIDATION GATE 3A: Backend Functional Testing
==================================================

[... test-websocket.sh output ...]

✅ VALIDATION GATE 3A: PASSED
```

---

## Manual Test Suite

### Test 1: TypeScript Compilation

**Commands:**

```bash
cd /Users/nick/Desktop/claude-mobile-expo/backend

# Clean build
rm -rf dist/

# Compile
npm run build

# Check exit code
echo "Build exit code: $?"

# List output files
ls -lh dist/
```

**Expected Output:**

```
> claude-mobile-expo-backend@1.0.0 build
> tsc

Build exit code: 0

total 96
-rw-r--r--  1 user  staff   45K Oct 30 10:00 index.js
-rw-r--r--  1 user  staff   12K Oct 30 10:00 websocket.js
-rw-r--r--  1 user  staff    8K Oct 30 10:00 routes.js
drwxr-xr-x  8 user  staff  256B Oct 30 10:00 mcp/
drwxr-xr-x  5 user  staff  160B Oct 30 10:00 utils/
```

**Pass Criteria:**
- ✅ Exit code 0 (no errors)
- ✅ dist/ directory created
- ✅ dist/index.js exists and is >40KB
- ✅ No TypeScript compilation errors in output

**Failure Investigation:**

```bash
# If compilation fails, check for errors
cat ../logs/backend-test.log | grep "error TS"

# Check TypeScript version
npx tsc --version

# Verify tsconfig.json
cat tsconfig.json
```

### Test 2: Server Startup

**Commands:**

```bash
cd /Users/nick/Desktop/claude-mobile-expo/backend

# Ensure .env is configured
cat .env | grep -E "PORT|ANTHROPIC_API_KEY|NODE_ENV"

# Start server
npm start
```

**Expected Console Output:**

```
> claude-mobile-expo-backend@1.0.0 start
> node dist/index.js

🚀 Server running on port 3001
📡 WebSocket server initialized on /ws
🔐 Environment: development
🔑 API Key: Configured (sk-ant-api03-...)
📁 Session storage: ./sessions
🗃️  MCP tools loaded: 6 tools available
✅ Server ready to accept connections
```

**Pass Criteria:**
- ✅ Server starts without errors
- ✅ Port 3001 listening
- ✅ WebSocket initialized
- ✅ API key detected (not showing full key for security)
- ✅ MCP tools loaded (6 expected)

**Verification Commands (in separate terminal):**

```bash
# Check server process running
ps aux | grep "node dist/index.js"

# Check port listening
lsof -i :3001

# Expected output
node      12345 user   24u  IPv6 0x123456  0t0  TCP *:3001 (LISTEN)
```

**Failure Investigation:**

```bash
# Check for port conflicts
lsof -i :3001

# Check environment variables
cd /Users/nick/Desktop/claude-mobile-expo/backend
source .env
echo "Port: $PORT"
echo "API Key: ${ANTHROPIC_API_KEY:0:15}..."

# Check logs
tail -50 logs/backend-test.log
```

### Test 3: Health Check Endpoint

**Commands:**

```bash
# Make health check request
curl -v http://localhost:3001/health

# Pretty-print JSON
curl -s http://localhost:3001/health | python3 -m json.tool
```

**Expected Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-10-30T15:30:45.123Z",
  "uptime": 12.345,
  "environment": "development",
  "version": "1.0.0",
  "websocket": {
    "status": "active",
    "path": "/ws"
  },
  "mcp": {
    "tools_loaded": 6
  }
}
```

**Pass Criteria:**
- ✅ HTTP 200 status code
- ✅ JSON content-type header
- ✅ "status": "healthy"
- ✅ Valid ISO timestamp
- ✅ Uptime > 0
- ✅ WebSocket status "active"
- ✅ MCP tools_loaded = 6

**Response Time Check:**

```bash
# Measure response time (should be < 50ms)
time curl -s http://localhost:3001/health > /dev/null

# Use httpstat for detailed metrics
curl -w "@-" -o /dev/null -s http://localhost:3001/health << 'EOF'
   time_namelookup:  %{time_namelookup}s\n
      time_connect:  %{time_connect}s\n
   time_appconnect:  %{time_appconnect}s\n
  time_pretransfer:  %{time_pretransfer}s\n
     time_redirect:  %{time_redirect}s\n
time_starttransfer:  %{time_starttransfer}s\n
                   ----------\n
        time_total:  %{time_total}s\n
EOF
```

**Expected Timing:**
```
   time_namelookup:  0.001s
      time_connect:  0.001s
   time_appconnect:  0.000s
  time_pretransfer:  0.001s
     time_redirect:  0.000s
time_starttransfer:  0.045s
                   ----------
        time_total:  0.045s
```

### Test 4: WebSocket Connection

**Prerequisites:**

```bash
# Install wscat if not available
npm install -g wscat

# Verify installation
wscat --version
```

**Commands:**

```bash
# Connect to WebSocket
wscat -c ws://localhost:3001/ws
```

**Expected Output:**

```
Connected (press CTRL+C to quit)
>
```

**Pass Criteria:**
- ✅ Connection established immediately
- ✅ No connection errors
- ✅ Prompt appears for input

**Connection Test with Timeout:**

```bash
# Test connection with 5-second timeout
timeout 5 wscat -c ws://localhost:3001/ws -x '{"type":"ping"}' -w 1

# Expected: Connects and receives pong within 1 second
```

**Concurrent Connection Test:**

```bash
# Test multiple simultaneous connections
for i in {1..5}; do
  (wscat -c ws://localhost:3001/ws -x '{"type":"ping"}' -w 1 &)
done

# All 5 connections should succeed
```

### Test 5: Session Initialization

**In wscat connection:**

```bash
> {"type":"init_session","projectPath":"/tmp/test-project"}
```

**Expected Response:**

```json
< {"type":"session_initialized","sessionId":"123e4567-e89b-12d3-a456-426614174000","hasContext":false,"timestamp":"2025-10-30T15:31:00.123Z"}
```

**Pass Criteria:**
- ✅ Response type: "session_initialized"
- ✅ sessionId: valid UUID format (8-4-4-4-12 hex)
- ✅ hasContext: false (new session)
- ✅ timestamp: valid ISO 8601 format
- ✅ Response received within 200ms

**Session Verification:**

```bash
# Check session file created
ls -l /Users/nick/Desktop/claude-mobile-expo/backend/sessions/

# Should show a JSON file with UUID name
cat backend/sessions/123e4567-e89b-12d3-a456-426614174000.json | python3 -m json.tool
```

**Expected Session File:**

```json
{
  "sessionId": "123e4567-e89b-12d3-a456-426614174000",
  "projectPath": "/tmp/test-project",
  "created": "2025-10-30T15:31:00.123Z",
  "lastAccessed": "2025-10-30T15:31:00.123Z",
  "messages": [],
  "context": null
}
```

**Save Session ID:**

```bash
# For use in subsequent tests
SESSION_ID="123e4567-e89b-12d3-a456-426614174000"
echo "Session ID: $SESSION_ID"
```

### Test 6: Message to Claude (Streaming)

**In wscat connection:**

```bash
> {"type":"message","message":"Say hello in exactly 5 words"}
```

**Expected Streaming Response:**

```json
< {"type":"content_start","timestamp":"2025-10-30T15:31:05.100Z"}
< {"type":"content_delta","delta":"Hello"}
< {"type":"content_delta","delta":","}
< {"type":"content_delta","delta":" how"}
< {"type":"content_delta","delta":" can"}
< {"type":"content_delta","delta":" I"}
< {"type":"content_delta","delta":" help"}
< {"type":"content_delta","delta":"?"}
< {"type":"content_end"}
< {"type":"message_complete","timestamp":"2025-10-30T15:31:06.234Z","usage":{"input_tokens":45,"output_tokens":8}}
```

**Pass Criteria:**
- ✅ Multiple content_delta messages received
- ✅ content_start before deltas
- ✅ content_end after deltas
- ✅ message_complete at end with usage stats
- ✅ Total response time < 5 seconds
- ✅ Usage tokens present and reasonable

**Streaming Performance Test:**

```bash
# Time from message send to first delta
# Should be < 1 second for simple message
```

### Test 7: write_file Tool Execution

**Setup Test Directory:**

```bash
# Ensure test project exists
mkdir -p /tmp/test-project
cd /tmp/test-project
git init 2>/dev/null || true
```

**In wscat connection:**

```bash
> {"type":"message","message":"Create a file named test-backend.txt with the content 'Backend validation test successful'"}
```

**Expected Tool Execution Stream:**

```json
< {"type":"content_start"}
< {"type":"content_delta","delta":"I'll"}
< {"type":"content_delta","delta":" create"}
< {"type":"content_delta","delta":" that"}
< {"type":"content_delta","delta":" file"}
< {"type":"content_delta","delta":" for"}
< {"type":"content_delta","delta":" you"}
< {"type":"tool_use_start","tool":"write_file","tool_use_id":"toolu_01ABC123"}
< {"type":"tool_execution","tool":"write_file","input":{"path":"test-backend.txt","content":"Backend validation test successful"}}
< {"type":"tool_result","tool":"write_file","tool_use_id":"toolu_01ABC123","result":"Successfully wrote 35 bytes to test-backend.txt"}
< {"type":"content_delta","delta":"File"}
< {"type":"content_delta","delta":" created"}
< {"type":"content_delta","delta":" successfully"}
< {"type":"content_delta","delta":"."}
< {"type":"content_end"}
< {"type":"message_complete"}
```

**Verify File Created (in separate terminal):**

```bash
# Check file exists
ls -l /tmp/test-project/test-backend.txt

# Read file content
cat /tmp/test-project/test-backend.txt

# Expected output
Backend validation test successful

# Check file permissions
stat -f "%A %N" /tmp/test-project/test-backend.txt
# Expected: 644 (readable/writable by owner)

# Verify file size
wc -c /tmp/test-project/test-backend.txt
# Expected: 35 bytes
```

**Pass Criteria:**
- ✅ tool_execution message sent
- ✅ tool_result received with success message
- ✅ File physically created on disk
- ✅ File contains exact content specified
- ✅ File size matches expected (35 bytes)
- ✅ Tool execution completed in < 500ms

### Test 8: read_file Tool Execution

**In wscat connection:**

```bash
> {"type":"message","message":"Show me the contents of test-backend.txt"}
```

**Expected Tool Execution Stream:**

```json
< {"type":"content_start"}
< {"type":"content_delta","delta":"I'll"}
< {"type":"content_delta","delta":" read"}
< {"type":"content_delta","delta":" that"}
< {"type":"content_delta","delta":" file"}
< {"type":"tool_use_start","tool":"read_file","tool_use_id":"toolu_01DEF456"}
< {"type":"tool_execution","tool":"read_file","input":{"path":"test-backend.txt"}}
< {"type":"tool_result","tool":"read_file","tool_use_id":"toolu_01DEF456","result":"Backend validation test successful"}
< {"type":"content_delta","delta":"The"}
< {"type":"content_delta","delta":" file"}
< {"type":"content_delta","delta":" contains"}
< {"type":"content_delta","delta":":"}
< {"type":"content_delta","delta":" \"Backend"}
< {"type":"content_delta","delta":" validation"}
< {"type":"content_delta","delta":" test"}
< {"type":"content_delta","delta":" successful\""}
< {"type":"content_end"}
< {"type":"message_complete"}
```

**Pass Criteria:**
- ✅ tool_execution for read_file
- ✅ tool_result contains exact file content
- ✅ No errors in tool execution
- ✅ Claude summarizes/explains the content
- ✅ Tool execution completed in < 300ms

**Error Case Test:**

```bash
# Try reading non-existent file
> {"type":"message","message":"Read nonexistent.txt"}
```

**Expected Error Handling:**

```json
< {"type":"tool_execution","tool":"read_file","input":{"path":"nonexistent.txt"}}
< {"type":"tool_result","tool":"read_file","error":"File not found: nonexistent.txt"}
< {"type":"content_delta","delta":"The file doesn't exist"}
```

### Test 9: list_files Tool Execution

**In wscat connection:**

```bash
> {"type":"message","message":"List all files in the current directory"}
```

**Expected Tool Execution Stream:**

```json
< {"type":"content_start"}
< {"type":"tool_use_start","tool":"list_files","tool_use_id":"toolu_01GHI789"}
< {"type":"tool_execution","tool":"list_files","input":{"path":"."}}
< {"type":"tool_result","tool":"list_files","tool_use_id":"toolu_01GHI789","result":["test-backend.txt","README.md",".git"]}
< {"type":"content_delta","delta":"Here"}
< {"type":"content_delta","delta":" are"}
< {"type":"content_delta","delta":" the"}
< {"type":"content_delta","delta":" files"}
< {"type":"content_delta","delta":":\n"}
< {"type":"content_delta","delta":"- test-backend.txt\n"}
< {"type":"content_delta","delta":"- README.md\n"}
< {"type":"content_end"}
< {"type":"message_complete"}
```

**Pass Criteria:**
- ✅ tool_result contains array of files
- ✅ test-backend.txt present in list
- ✅ README.md present (created during setup)
- ✅ .git directory may or may not be shown (depends on implementation)
- ✅ Tool execution completed in < 200ms

**Verification:**

```bash
# Compare with actual directory listing
ls -la /tmp/test-project/
```

### Test 10: execute_command Tool Execution

**In wscat connection:**

```bash
> {"type":"message","message":"Run 'echo Hello from execute_command' in the shell"}
```

**Expected Tool Execution Stream:**

```json
< {"type":"content_start"}
< {"type":"tool_use_start","tool":"execute_command","tool_use_id":"toolu_01JKL012"}
< {"type":"tool_execution","tool":"execute_command","input":{"command":"echo Hello from execute_command"}}
< {"type":"tool_result","tool":"execute_command","tool_use_id":"toolu_01JKL012","result":"Hello from execute_command\n","exit_code":0}
< {"type":"content_delta","delta":"Command"}
< {"type":"content_delta","delta":" executed"}
< {"type":"content_delta","delta":" successfully"}
< {"type":"content_end"}
< {"type":"message_complete"}
```

**Pass Criteria:**
- ✅ tool_result contains command output
- ✅ exit_code: 0
- ✅ Output matches expected: "Hello from execute_command"
- ✅ Tool execution completed in < 500ms

**Multi-command Test:**

```bash
> {"type":"message","message":"Run 'ls -la' to list files"}
```

**Expected:** Tool executes and returns directory listing with file details.

**Error Command Test:**

```bash
> {"type":"message","message":"Run 'nonexistent-command'"}
```

**Expected:** Tool returns error with non-zero exit_code and error message.

### Test 11: git_status Tool Execution

**In wscat connection:**

```bash
> {"type":"message","message":"What's the git status?"}
```

**Expected Tool Execution Stream:**

```json
< {"type":"content_start"}
< {"type":"tool_use_start","tool":"git_status","tool_use_id":"toolu_01MNO345"}
< {"type":"tool_execution","tool":"git_status","input":{}}
< {"type":"tool_result","tool":"git_status","tool_use_id":"toolu_01MNO345","result":{"branch":"main","modified":[],"created":["test-backend.txt"],"deleted":[],"untracked":[]}}
< {"type":"content_delta","delta":"You"}
< {"type":"content_delta","delta":" have"}
< {"type":"content_delta","delta":" one"}
< {"type":"content_delta","delta":" new"}
< {"type":"content_delta","delta":" file"}
< {"type":"content_delta","delta":":"}
< {"type":"content_delta","delta":" test-backend.txt"}
< {"type":"content_end"}
< {"type":"message_complete"}
```

**Pass Criteria:**
- ✅ tool_result contains git status object
- ✅ "branch" field present
- ✅ "created" array includes test-backend.txt
- ✅ Status reflects actual git state
- ✅ Tool execution completed in < 400ms

**Verification:**

```bash
# Compare with actual git status
cd /tmp/test-project
git status --short

# Expected output
?? test-backend.txt
```

### Test 12: git_commit Tool Execution

**In wscat connection:**

```bash
> {"type":"message","message":"Commit test-backend.txt with message 'Add backend validation test file'"}
```

**Expected Tool Execution Stream:**

```json
< {"type":"content_start"}
< {"type":"tool_use_start","tool":"git_commit","tool_use_id":"toolu_01PQR678"}
< {"type":"tool_execution","tool":"git_commit","input":{"files":["test-backend.txt"],"message":"Add backend validation test file"}}
< {"type":"tool_result","tool":"git_commit","tool_use_id":"toolu_01PQR678","result":"Committed 1 file: test-backend.txt (commit: abc123def)"}
< {"type":"content_delta","delta":"File"}
< {"type":"content_delta","delta":" committed"}
< {"type":"content_delta","delta":" successfully"}
< {"type":"content_end"}
< {"type":"message_complete"}
```

**Pass Criteria:**
- ✅ tool_result confirms commit created
- ✅ Commit hash returned
- ✅ File listed in commit
- ✅ Tool execution completed in < 600ms

**Verification:**

```bash
# Verify commit created
cd /tmp/test-project
git log --oneline -1

# Expected output
abc123d Add backend validation test file

# Verify file committed
git show HEAD --name-only

# Expected
commit abc123def...
Author: Test User <test@example.com>
Date: ...

Add backend validation test file

test-backend.txt
```

### Test 13: Slash Command Execution

**In wscat connection:**

```bash
> {"type":"message","message":"/help"}
```

**Expected Response:**

```json
< {"type":"slash_command_response","command":"help","content":"**Available Slash Commands:**\n\n/help - Show this help message\n/clear - Clear conversation history\n/reset - Reset session state\n/status - Show session status\n/tools - List available MCP tools\n/context - Show current context","timestamp":"2025-10-30T15:32:00.123Z","execution_time_ms":5}
```

**Pass Criteria:**
- ✅ Response type: "slash_command_response"
- ✅ Command executed without Claude API call
- ✅ Content contains help text
- ✅ Response received in < 50ms
- ✅ No error messages

**Test Other Slash Commands:**

```bash
# Test /status
> {"type":"message","message":"/status"}

# Expected response with session information
< {"type":"slash_command_response","command":"status","content":"**Session Status**\n\nSession ID: 123e4567-e89b-12d3-a456-426614174000\nProject: /tmp/test-project\nMessages: 12\nContext: Loaded\nUptime: 300s"}

# Test /tools
> {"type":"message","message":"/tools"}

# Expected response with tool list
< {"type":"slash_command_response","command":"tools","content":"**Available MCP Tools:**\n\n1. write_file - Write content to a file\n2. read_file - Read file contents\n3. list_files - List directory contents\n4. execute_command - Execute shell command\n5. git_status - Get git repository status\n6. git_commit - Commit changes to git"}
```

### Test 14: Logging Verification

**Check Log Files Exist:**

```bash
cd /Users/nick/Desktop/claude-mobile-expo/backend

# List log files
ls -lh logs/

# Expected files
combined.log  - All logs
error.log     - Errors only
websocket.log - WebSocket events
api.log       - API requests
```

**Inspect Combined Log:**

```bash
# View last 50 lines
tail -50 logs/combined.log

# Search for specific events
grep "WebSocket connection established" logs/combined.log
grep "Session initialized" logs/combined.log
grep "Tool execution" logs/combined.log
grep "Message from Claude" logs/combined.log
```

**Expected Log Entries:**

```
2025-10-30T15:30:45.123Z [info]: Server starting on port 3001
2025-10-30T15:30:45.234Z [info]: WebSocket server initialized
2025-10-30T15:31:00.100Z [info]: WebSocket connection established
2025-10-30T15:31:00.123Z [info]: Session initialized: 123e4567-e89b-12d3-a456-426614174000
2025-10-30T15:31:05.456Z [info]: Message received from client
2025-10-30T15:31:05.789Z [info]: Sending message to Claude API
2025-10-30T15:31:06.100Z [info]: Streaming response started
2025-10-30T15:31:06.234Z [info]: Message streaming complete
2025-10-30T15:31:10.345Z [info]: Tool execution requested: write_file
2025-10-30T15:31:10.456Z [info]: Tool execution completed: write_file
```

**Pass Criteria:**
- ✅ All log files exist
- ✅ combined.log contains all event types
- ✅ WebSocket events logged
- ✅ Tool executions logged with input/output
- ✅ API calls logged with timing
- ✅ No ERROR level entries for successful operations
- ✅ Timestamps accurate and sequential

**Check Error Logging:**

```bash
# Should be empty or contain only expected warnings
cat logs/error.log

# If errors present, investigate
```

**Log Rotation Check:**

```bash
# Check log file sizes (shouldn't grow unbounded)
du -h logs/*.log

# If any log > 10MB, check rotation configuration
```

### Test 15: REST API - Create Session

**Command:**

```bash
curl -X POST http://localhost:3001/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{"projectPath":"/tmp/test-project"}' \
  -w "\n\nHTTP Status: %{http_code}\nTime: %{time_total}s\n"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "456e7890-f12c-34d5-b678-901234567890",
    "session": {
      "sessionId": "456e7890-f12c-34d5-b678-901234567890",
      "projectPath": "/tmp/test-project",
      "created": "2025-10-30T15:32:30.123Z",
      "lastAccessed": "2025-10-30T15:32:30.123Z",
      "messages": [],
      "context": null
    }
  }
}

HTTP Status: 201
Time: 0.045s
```

**Pass Criteria:**
- ✅ HTTP 201 Created status
- ✅ success: true
- ✅ sessionId: valid UUID
- ✅ Session object with all fields
- ✅ created and lastAccessed timestamps present
- ✅ Response time < 100ms

**Save Session ID for Next Test:**

```bash
# Extract session ID
SESSION_ID_2=$(curl -s -X POST http://localhost:3001/api/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{"projectPath":"/tmp/test-project"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['data']['sessionId'])")

echo "Session ID 2: $SESSION_ID_2"
```

### Test 16: REST API - Get Session

**Command:**

```bash
curl -X GET "http://localhost:3001/api/v1/sessions/$SESSION_ID_2" \
  -w "\n\nHTTP Status: %{http_code}\n"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "session": {
      "sessionId": "456e7890-f12c-34d5-b678-901234567890",
      "projectPath": "/tmp/test-project",
      "created": "2025-10-30T15:32:30.123Z",
      "lastAccessed": "2025-10-30T15:32:35.456Z",
      "messages": [],
      "context": null
    }
  }
}

HTTP Status: 200
```

**Pass Criteria:**
- ✅ HTTP 200 OK status
- ✅ Session data matches created session
- ✅ lastAccessed updated
- ✅ Response time < 50ms

### Test 17: REST API - List Sessions

**Command:**

```bash
curl -X GET http://localhost:3001/api/v1/sessions \
  -w "\n\nHTTP Status: %{http_code}\n"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "123e4567-e89b-12d3-a456-426614174000",
        "projectPath": "/tmp/test-project",
        "created": "2025-10-30T15:31:00.123Z",
        "lastAccessed": "2025-10-30T15:31:50.456Z",
        "messageCount": 12
      },
      {
        "sessionId": "456e7890-f12c-34d5-b678-901234567890",
        "projectPath": "/tmp/test-project",
        "created": "2025-10-30T15:32:30.123Z",
        "lastAccessed": "2025-10-30T15:32:35.456Z",
        "messageCount": 0
      }
    ],
    "total": 2
  }
}

HTTP Status: 200
```

**Pass Criteria:**
- ✅ HTTP 200 OK status
- ✅ sessions array with 2 entries
- ✅ total: 2
- ✅ Both session IDs present
- ✅ messageCount reflects activity
- ✅ Response time < 100ms

### Test 18: REST API - Delete Session

**Command:**

```bash
curl -X DELETE "http://localhost:3001/api/v1/sessions/$SESSION_ID_2" \
  -w "\n\nHTTP Status: %{http_code}\n"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "message": "Session deleted successfully",
    "sessionId": "456e7890-f12c-34d5-b678-901234567890"
  }
}

HTTP Status: 200
```

**Verification:**

```bash
# Try to get deleted session (should fail)
curl -X GET "http://localhost:3001/api/v1/sessions/$SESSION_ID_2"

# Expected: 404 Not Found
{
  "success": false,
  "error": "Session not found"
}

# List sessions again
curl -s http://localhost:3001/api/v1/sessions | python3 -m json.tool

# Expected: total: 1 (only first session remains)
```

**Pass Criteria:**
- ✅ HTTP 200 OK status for delete
- ✅ Success message returned
- ✅ Session file removed from disk
- ✅ Subsequent GET returns 404
- ✅ List shows reduced count

### Test 19: Memory Leak Test

**Purpose:** Ensure server doesn't leak memory during extended operation.

**Setup Monitoring:**

```bash
# Get server PID
BACKEND_PID=$(cat logs/backend-test.pid)

# Monitor memory usage
watch -n 10 "ps -o pid,rss,vsz,comm -p $BACKEND_PID"
```

**Stress Test:**

```bash
# Send 50 messages over 5 minutes
for i in {1..50}; do
  echo "Message $i/50"
  curl -s -X POST http://localhost:3001/api/v1/sessions \
    -H "Content-Type: application/json" \
    -d "{\"projectPath\":\"/tmp/test-$i\"}" > /dev/null
  sleep 6
done
```

**Memory Analysis:**

```bash
# Record initial memory
INITIAL_MEM=$(ps -o rss= -p $BACKEND_PID)
echo "Initial memory: $INITIAL_MEM KB"

# Wait 5 minutes with activity
sleep 300

# Record final memory
FINAL_MEM=$(ps -o rss= -p $BACKEND_PID)
echo "Final memory: $FINAL_MEM KB"

# Calculate increase
MEM_INCREASE=$((FINAL_MEM - INITIAL_MEM))
echo "Memory increase: $MEM_INCREASE KB"

# Calculate percentage
PERCENT_INCREASE=$((MEM_INCREASE * 100 / INITIAL_MEM))
echo "Percentage increase: $PERCENT_INCREASE%"
```

**Pass Criteria:**
- ✅ Memory increase < 20% over 5 minutes
- ✅ No continuous upward trend (should stabilize)
- ✅ Memory returns to baseline after clearing sessions
- ✅ No "out of memory" errors in logs

**Acceptable Memory Usage:**
- Initial: 50-150 MB
- After stress test: < 200 MB
- Increase: < 50 MB or < 20%

### Test 20: Concurrent Connection Test

**Purpose:** Verify server handles multiple simultaneous WebSocket connections.

**Test Script:**

```bash
#!/bin/bash

echo "🧪 Concurrent Connection Test"
echo "=============================="

# Start 10 concurrent wscat connections
CONNECTIONS=10
SUCCESS_COUNT=0

for i in $(seq 1 $CONNECTIONS); do
  {
    timeout 5 wscat -c ws://localhost:3001/ws \
      -x "{\"type\":\"init_session\",\"projectPath\":\"/tmp/concurrent-$i\"}" \
      2>&1 | grep -q "session_initialized" && {
      echo "✅ Connection $i: SUCCESS"
      ((SUCCESS_COUNT++))
    } || {
      echo "❌ Connection $i: FAILED"
    }
  } &
done

# Wait for all background jobs
wait

echo ""
echo "📊 Results: $SUCCESS_COUNT/$CONNECTIONS connections successful"

if [ $SUCCESS_COUNT -eq $CONNECTIONS ]; then
  echo "✅ Concurrent connection test PASSED"
  exit 0
else
  echo "❌ Concurrent connection test FAILED"
  exit 1
fi
```

**Pass Criteria:**
- ✅ All 10 connections establish successfully
- ✅ All sessions initialize
- ✅ No connection refused errors
- ✅ Server remains responsive
- ✅ No errors in server logs

### Test 21: Error Recovery Test

**Purpose:** Verify server handles and recovers from errors gracefully.

**Test Cases:**

#### 21.1: Invalid JSON

```bash
# Send malformed JSON via wscat
> {invalid json}
```

**Expected:**

```json
< {"type":"error","message":"Invalid JSON format","code":"INVALID_JSON"}
```

**Pass:** Error message returned, connection remains open.

#### 21.2: Unknown Message Type

```bash
> {"type":"unknown_type","data":"test"}
```

**Expected:**

```json
< {"type":"error","message":"Unknown message type: unknown_type","code":"UNKNOWN_TYPE"}
```

**Pass:** Error message returned, connection remains open.

#### 21.3: Invalid Tool Parameters

```bash
> {"type":"message","message":"Write to a file with no path"}
```

**Expected:**

```json
< {"type":"tool_execution","tool":"write_file","input":{"path":""}}
< {"type":"tool_result","error":"Invalid parameters: path is required"}
```

**Pass:** Tool error returned, Claude explains the issue, connection stable.

#### 21.4: Permission Denied

```bash
> {"type":"message","message":"Write to /etc/hosts"}
```

**Expected:**

```json
< {"type":"tool_result","error":"Permission denied: /etc/hosts"}
```

**Pass:** Permission error returned, server doesn't crash.

**Pass Criteria:**
- ✅ All error cases handled gracefully
- ✅ Descriptive error messages returned
- ✅ WebSocket connection remains open after errors
- ✅ Server continues accepting new connections
- ✅ No process crashes or restarts
- ✅ Errors logged appropriately

---

## Test Results Documentation

### Saving Results to Serena Memory

After ALL tests pass, document results using Serena Memory MCP:

```typescript
mcp__serena__write_memory({
  memory_name: "validation-gate-3a-backend-testing",
  content: `# Validation Gate 3A: Backend Functional Testing Results

## Test Execution Summary

**Date:** 2025-10-30
**Tester:** [Your Name]
**Duration:** [Total time]
**Status:** PASSED

## Test Results

### Automated Tests (via test-websocket.sh)
- ✅ WebSocket Connection: PASS
- ✅ Session Initialization: PASS
- ✅ Message Streaming: PASS
- ✅ Tool Execution: PASS
- ✅ File Operations: PASS
- ✅ Slash Commands: PASS

**Script Exit Code:** 0
**All automated tests:** 5/5 passed

### Manual Tests
- ✅ Test 1: TypeScript Compilation - PASS
- ✅ Test 2: Server Startup - PASS
- ✅ Test 3: Health Check Endpoint - PASS
- ✅ Test 4: WebSocket Connection - PASS
- ✅ Test 5: Session Initialization - PASS
- ✅ Test 6: Message Streaming - PASS
- ✅ Test 7: write_file Tool - PASS
- ✅ Test 8: read_file Tool - PASS
- ✅ Test 9: list_files Tool - PASS
- ✅ Test 10: execute_command Tool - PASS
- ✅ Test 11: git_status Tool - PASS
- ✅ Test 12: git_commit Tool - PASS
- ✅ Test 13: Slash Commands - PASS
- ✅ Test 14: Logging Verification - PASS
- ✅ Test 15: REST API Create Session - PASS
- ✅ Test 16: REST API Get Session - PASS
- ✅ Test 17: REST API List Sessions - PASS
- ✅ Test 18: REST API Delete Session - PASS
- ✅ Test 19: Memory Leak Test - PASS
- ✅ Test 20: Concurrent Connections - PASS
- ✅ Test 21: Error Recovery - PASS

**All manual tests:** 21/21 passed

## Performance Metrics

### Response Times
- Health endpoint: 45ms (target: <50ms)
- Session initialization: 123ms (target: <200ms)
- Message streaming first delta: 456ms (target: <1000ms)
- Tool execution (write_file): 234ms (target: <500ms)
- Tool execution (read_file): 189ms (target: <300ms)
- REST API create session: 67ms (target: <100ms)

### Memory Usage
- Initial: 87 MB
- After 5-minute stress test: 104 MB
- Increase: 17 MB (19.5%)
- Result: PASS (< 20% increase)

### Concurrent Connections
- Tested: 10 simultaneous connections
- Successful: 10/10 (100%)
- Result: PASS

## Tool Execution Verification

All 6 MCP tools successfully executed:
1. ✅ write_file - File created with correct content
2. ✅ read_file - Content retrieved accurately
3. ✅ list_files - Directory listing correct
4. ✅ execute_command - Commands executed, output captured
5. ✅ git_status - Git state accurately reported
6. ✅ git_commit - Commits created successfully

## Logging Verification

Log files verified:
- ✅ combined.log - All events captured
- ✅ error.log - Empty (no unexpected errors)
- ✅ websocket.log - WebSocket events logged
- ✅ api.log - API requests logged with timing

## REST API Verification

All CRUD operations tested:
- ✅ POST /api/v1/sessions - Create session
- ✅ GET /api/v1/sessions/:id - Get session
- ✅ GET /api/v1/sessions - List sessions
- ✅ DELETE /api/v1/sessions/:id - Delete session

## Error Handling Verification

Tested error scenarios:
- ✅ Invalid JSON - Graceful error response
- ✅ Unknown message type - Error with code
- ✅ Invalid tool parameters - Tool error returned
- ✅ Permission denied - Appropriate error message
- ✅ Connection stability - Server remains running

## Observations

### Strengths
- TypeScript compilation clean and fast
- Server starts reliably with clear status messages
- WebSocket protocol robust and performant
- Streaming responses smooth with no lag
- All tools execute correctly with proper error handling
- Logging comprehensive and well-structured
- REST API clean and follows conventions
- Memory usage stable under load
- Concurrent connections handled efficiently

### Areas for Future Enhancement
- [Note any observations or future improvements]

## Final Verdict

**VALIDATION GATE 3A: ✅ PASSED**

All 26 tests (5 automated + 21 manual) passed successfully.

Backend is fully functional and ready for frontend integration.

## Next Steps

1. Proceed to Phase 4: Mobile Frontend Implementation
2. Begin Validation Gate 4A: Frontend Visual Testing
3. Prepare for Phase 6: Integration Testing

## Sign-Off

**Backend validation completed by:** [Your Name]
**Date:** 2025-10-30
**Time:** [Completion time]
**Approved for frontend integration:** YES
`
})
```

### Alternative: Save to File

```bash
cat > /Users/nick/Desktop/claude-mobile-expo/validation/gate-3a-results.md << 'RESULTS'
# Validation Gate 3A Results
[... same content as above ...]
RESULTS

echo "✅ Results saved to validation/gate-3a-results.md"
```

---

## Troubleshooting Guide

### Issue 1: TypeScript Compilation Fails

**Symptoms:**
```
error TS2307: Cannot find module '@anthropic-ai/sdk'
error TS2580: Cannot find name 'WebSocket'
```

**Diagnosis:**

```bash
# Check dependencies installed
npm list @anthropic-ai/sdk express ws winston

# Check TypeScript version
npx tsc --version

# Check tsconfig.json
cat tsconfig.json | grep -E "target|module|moduleResolution"
```

**Solutions:**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Verify TypeScript installation
npm install --save-dev typescript @types/node @types/express @types/ws

# Rebuild
npm run build
```

### Issue 2: Server Won't Start

**Symptoms:**
```
Error: listen EADDRINUSE :::3001
```

**Diagnosis:**

```bash
# Check if port in use
lsof -i :3001

# Check for existing node processes
ps aux | grep node
```

**Solutions:**

```bash
# Kill existing server
pkill -f "node dist/index.js"

# Or kill specific PID
kill $(lsof -t -i:3001)

# Restart server
npm start
```

### Issue 3: WebSocket Connection Fails

**Symptoms:**
```
Error: Connection refused
Error: WebSocket is closed before the connection is established
```

**Diagnosis:**

```bash
# Check server running
curl http://localhost:3001/health

# Check WebSocket logs
tail -50 logs/websocket.log

# Test with wscat
wscat -c ws://localhost:3001/ws
```

**Solutions:**

```bash
# Verify server started successfully
ps aux | grep "node dist/index.js"

# Check backend logs
tail -100 logs/combined.log

# Restart server
npm start

# Wait for "WebSocket server initialized" message
```

### Issue 4: Claude API Calls Fail

**Symptoms:**
```
Error: API key not configured
Error: 401 Unauthorized
```

**Diagnosis:**

```bash
# Check .env file
cat backend/.env | grep ANTHROPIC_API_KEY

# Verify API key format
echo $ANTHROPIC_API_KEY | cut -c1-15
# Should start with: sk-ant-api03-
```

**Solutions:**

```bash
# Update .env with correct API key
cd backend
echo "ANTHROPIC_API_KEY=sk-ant-api03-YOUR-ACTUAL-KEY" >> .env

# Restart server (required after .env change)
pkill -f "node dist/index.js"
npm start
```

### Issue 5: Tool Execution Fails

**Symptoms:**
```
{"type":"tool_result","error":"File operation failed"}
{"type":"tool_result","error":"Permission denied"}
```

**Diagnosis:**

```bash
# Check project path exists
ls -la /tmp/test-project

# Check permissions
stat -f "%OLp %N" /tmp/test-project

# Check git initialized
cd /tmp/test-project && git status
```

**Solutions:**

```bash
# Recreate test project
rm -rf /tmp/test-project
mkdir -p /tmp/test-project
cd /tmp/test-project
git init
git config user.name "Test User"
git config user.email "test@example.com"

# Fix permissions
chmod 755 /tmp/test-project

# Retry tool operations
```

### Issue 6: Memory Leak Detected

**Symptoms:**
- Memory usage grows continuously
- Server becomes unresponsive after extended use

**Diagnosis:**

```bash
# Monitor memory over time
watch -n 10 'ps aux | grep "node dist/index.js"'

# Check for zombie WebSocket connections
netstat -an | grep 3001 | wc -l

# Check session storage size
du -sh backend/sessions/
```

**Solutions:**

```bash
# Clear old sessions
cd backend/sessions
find . -name "*.json" -mtime +1 -delete

# Implement session cleanup (if not present)
# Add to backend/src/utils/session-manager.ts:
# - Periodic cleanup of old sessions
# - Maximum session limit
# - Memory usage monitoring

# Restart server with clean state
pkill -f "node dist/index.js"
rm -rf backend/sessions/*.json
npm start
```

### Issue 7: Logging Not Working

**Symptoms:**
- Log files empty or not created
- Events not being logged

**Diagnosis:**

```bash
# Check logs directory exists
ls -la logs/

# Check log file permissions
stat -f "%OLp %N" logs/*.log

# Check Winston configuration
grep -A 10 "winston.createLogger" backend/src/utils/logger.ts
```

**Solutions:**

```bash
# Recreate logs directory
mkdir -p logs

# Fix permissions
chmod 755 logs/
chmod 644 logs/*.log 2>/dev/null || true

# Restart server
npm start

# Verify logging working
tail -f logs/combined.log
```

### Issue 8: REST API 404 Errors

**Symptoms:**
```
{"success":false,"error":"Not Found"}
```

**Diagnosis:**

```bash
# Check routes loaded
grep "app.use.*api" backend/src/index.ts

# Check server output for route registration
grep "API routes loaded" logs/combined.log

# Test health endpoint first
curl http://localhost:3001/health
```

**Solutions:**

```bash
# Verify routes file exists
ls -l backend/src/routes/index.ts

# Rebuild backend
npm run build

# Check routes compiled
ls -l backend/dist/routes/

# Restart server
npm start

# Test API endpoints
curl http://localhost:3001/api/v1/sessions
```

### Issue 9: Concurrent Connection Failures

**Symptoms:**
- Some connections succeed, others fail
- Server crashes under load

**Diagnosis:**

```bash
# Check system limits
ulimit -n  # File descriptors

# Check active connections
netstat -an | grep 3001 | wc -l

# Check server logs during load
tail -f logs/combined.log | grep -E "connection|error"
```

**Solutions:**

```bash
# Increase file descriptor limit (macOS)
ulimit -n 4096

# Add connection limiting to server
# In backend/src/websocket/index.ts:
# - Maximum concurrent connections
# - Connection rate limiting
# - Automatic cleanup of idle connections

# Restart with increased limits
ulimit -n 4096
npm start
```

### Issue 10: Test Script Failures

**Symptoms:**
```
./scripts/test-websocket.sh: command not found
./scripts/test-websocket.sh: Permission denied
```

**Diagnosis:**

```bash
# Check script exists
ls -l scripts/test-websocket.sh

# Check permissions
stat -f "%OLp %N" scripts/*.sh

# Check shebang
head -1 scripts/test-websocket.sh
```

**Solutions:**

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Verify shebang correct
# Should be: #!/bin/bash

# Run with explicit bash
bash scripts/test-websocket.sh

# Or use absolute path
/bin/bash /Users/nick/Desktop/claude-mobile-expo/scripts/test-websocket.sh
```

### General Debugging Tips

#### Enable Debug Logging

```bash
# Set LOG_LEVEL=debug in .env
echo "LOG_LEVEL=debug" >> backend/.env

# Restart server
npm start

# View debug logs
tail -f logs/combined.log | grep -E "debug|DEBUG"
```

#### Check System Resources

```bash
# Check CPU usage
top -l 1 | grep "CPU usage"

# Check memory available
vm_stat | grep "Pages free"

# Check disk space
df -h /

# All should show adequate resources
```

#### Verify Network Connectivity

```bash
# Test localhost resolution
ping -c 1 localhost

# Test port availability
nc -zv localhost 3001

# Check firewall settings
sudo pfctl -s rules | grep 3001
```

---

## Gate Pass Criteria

### Mandatory Requirements

To pass Validation Gate 3A, ALL of the following must be TRUE:

#### 1. Compilation & Build
- ✅ TypeScript compiles with zero errors
- ✅ dist/ directory generated with all files
- ✅ dist/index.js is >40KB
- ✅ Source maps generated
- ✅ No deprecated dependencies warnings

#### 2. Server Startup
- ✅ Server starts without errors
- ✅ Port 3001 listening within 3 seconds
- ✅ WebSocket initialized successfully
- ✅ API key validated at startup
- ✅ MCP tools loaded (all 6 tools)
- ✅ Session storage initialized

#### 3. Health Check
- ✅ /health endpoint returns 200
- ✅ Response is valid JSON
- ✅ "status": "healthy"
- ✅ Response time < 50ms
- ✅ Uptime > 0

#### 4. WebSocket Protocol
- ✅ Accepts connections immediately
- ✅ No connection errors or timeouts
- ✅ Supports multiple concurrent connections (10+)
- ✅ Handles 50+ message round-trips without issues
- ✅ Graceful error handling
- ✅ Connection remains stable after errors

#### 5. Session Management
- ✅ init_session creates valid UUID
- ✅ Session file persisted to disk
- ✅ Session data structure correct
- ✅ hasContext reflects state accurately
- ✅ Multiple sessions supported

#### 6. Message Streaming
- ✅ Messages stream with content_delta
- ✅ content_start before deltas
- ✅ content_end after deltas
- ✅ message_complete with usage stats
- ✅ First delta arrives in < 1 second
- ✅ Streaming smooth, no long pauses

#### 7. Tool Execution (All 6 Tools)

**write_file:**
- ✅ Creates file with exact content
- ✅ File physically exists on disk
- ✅ File size matches expected
- ✅ File permissions correct (644)

**read_file:**
- ✅ Returns file content accurately
- ✅ Handles missing files gracefully
- ✅ No encoding issues

**list_files:**
- ✅ Returns array of files
- ✅ Matches actual directory contents
- ✅ Includes all relevant files

**execute_command:**
- ✅ Executes commands successfully
- ✅ Returns stdout correctly
- ✅ Returns exit code
- ✅ Handles command errors

**git_status:**
- ✅ Returns git status object
- ✅ Reflects actual git state
- ✅ Shows modified/created/deleted files

**git_commit:**
- ✅ Creates commits successfully
- ✅ Returns commit hash
- ✅ Files committed to git

#### 8. Slash Commands
- ✅ /help returns help text
- ✅ /status returns session info
- ✅ /tools lists all 6 tools
- ✅ Commands execute without Claude API call
- ✅ Response time < 50ms

#### 9. Logging
- ✅ All log files created
- ✅ combined.log contains all events
- ✅ error.log contains only errors
- ✅ WebSocket events logged
- ✅ Tool executions logged
- ✅ API calls logged with timing
- ✅ Timestamps accurate

#### 10. REST API
- ✅ POST /api/v1/sessions creates session (201)
- ✅ GET /api/v1/sessions/:id returns session (200)
- ✅ GET /api/v1/sessions lists all sessions (200)
- ✅ DELETE /api/v1/sessions/:id removes session (200)
- ✅ All responses properly formatted JSON
- ✅ Appropriate HTTP status codes

#### 11. Performance
- ✅ Health check < 50ms
- ✅ Session init < 200ms
- ✅ Message streaming first delta < 1s
- ✅ Tool execution < 500ms
- ✅ REST API < 100ms

#### 12. Stability
- ✅ No crashes during testing
- ✅ Memory increase < 20% over 5 minutes
- ✅ Handles 50+ operations without degradation
- ✅ 10 concurrent connections successful
- ✅ Error recovery without restart

#### 13. Error Handling
- ✅ Invalid JSON handled gracefully
- ✅ Unknown message types return errors
- ✅ Invalid tool parameters handled
- ✅ Permission errors caught
- ✅ Server remains running after errors
- ✅ Errors logged appropriately

### Automated Test Results

From `test-websocket.sh` and `validate-gate-3a.sh`:

- ✅ All 5 automated tests must pass
- ✅ Scripts exit with code 0
- ✅ No errors in script output
- ✅ Files created during testing verified

### Manual Test Results

All 21 manual tests must pass:

- ✅ Tests 1-14: Core functionality
- ✅ Tests 15-18: REST API
- ✅ Test 19: Memory leak test
- ✅ Test 20: Concurrent connections
- ✅ Test 21: Error recovery

### Documentation Requirements

- ✅ Test results saved to Serena Memory
- ✅ All test commands documented
- ✅ Expected outputs verified
- ✅ Performance metrics recorded
- ✅ Any issues noted and resolved

### Final Checklist

Before proceeding to Phase 4, verify:

```bash
# Run final validation
cd /Users/nick/Desktop/claude-mobile-expo

# 1. Run automated tests
./scripts/validate-gate-3a.sh

# 2. Check test results
echo "Exit code: $?"  # Must be 0

# 3. Verify server stable
ps aux | grep "node dist/index.js"  # Must be running

# 4. Check memory usage
ps -o pid,rss,vsz,comm -p $(cat logs/backend-test.pid)  # Must be reasonable

# 5. Verify logs clean
tail -50 logs/error.log  # Should be empty or only warnings

# 6. Confirm all tools working
# Run through Tests 7-12 one more time

# 7. Clean shutdown
pkill -f "node dist/index.js"
```

**ALL CRITERIA MUST BE MET TO PASS GATE 3A**

### Gate Status Declaration

```
🧪 VALIDATION GATE 3A: Backend Functional Testing
==================================================

✅ TypeScript Compilation: PASS
✅ Server Startup: PASS
✅ Health Check: PASS
✅ WebSocket Protocol: PASS
✅ Session Management: PASS
✅ Message Streaming: PASS
✅ Tool Execution (6/6): PASS
✅ Slash Commands: PASS
✅ Logging: PASS
✅ REST API: PASS
✅ Performance: PASS
✅ Stability: PASS
✅ Error Handling: PASS

📊 Automated Tests: 5/5 PASSED
📊 Manual Tests: 21/21 PASSED
📊 Overall: 26/26 tests PASSED

✅ VALIDATION GATE 3A: **PASSED**

Backend is fully functional and ready for frontend integration.

Approved to proceed to Phase 4: Mobile Frontend Implementation.
```

---

## Summary

This document provides:

1. **Complete test specification** for Backend Validation Gate 3A
2. **14 core tests** plus 7 additional comprehensive tests (21 total)
3. **Automated testing** via scripts with Serena MCP integration
4. **Manual testing** with detailed commands and expected outputs
5. **Result documentation** template for Serena Memory
6. **Troubleshooting guide** for common issues
7. **Clear pass criteria** with mandatory requirements

**Total Lines:** ~1,850 (including code blocks and JSON examples)

**Testing Coverage:**
- TypeScript compilation
- Server startup and stability
- HTTP REST API (4 endpoints)
- WebSocket protocol (connection, messages, streaming)
- Session management (create, get, list, delete)
- Claude API integration (message streaming)
- Tool execution (all 6 tools: write_file, read_file, list_files, execute_command, git_status, git_commit)
- Slash commands (/help, /status, /tools)
- Logging system (4 log files)
- Performance metrics
- Memory leak detection
- Concurrent connections
- Error handling and recovery

**Automation:**
- `test-websocket.sh` - Automated WebSocket integration tests
- `validate-gate-3a.sh` - Complete gate validation wrapper
- Serena MCP integration for script execution
- Memory MCP for result documentation

**Next Step:** After passing Gate 3A, proceed to **Phase 4: Mobile Frontend Implementation** and prepare for **Validation Gate 4A: Frontend Visual Testing**.
