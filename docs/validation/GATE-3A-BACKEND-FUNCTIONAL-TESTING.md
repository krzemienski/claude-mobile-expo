# VALIDATION GATE 3A: Backend Functional Testing

> **Required Before**: Phase 3 (Backend) complete  
> **Required After**: Phase 6 (Integration)  
> **Skills**: @websocket-integration-testing, @systematic-debugging (if fails)  
> **Automation**: test-websocket.sh, validate-gate-3a.sh

---

## Purpose

Verify complete backend functionality using ONLY functional testing methods:
- ✅ curl for HTTP endpoints
- ✅ wscat for WebSocket protocol
- ✅ Actual file operations in filesystem
- ✅ Real git operations
- ✅ NO unit tests, NO mocks

**GATE REQUIREMENT**: ALL tests must pass before Phase 6 integration.

---

## Prerequisites

### Environment Setup

**Execute via Serena MCP**:

```typescript
// 1. Navigate to backend
mcp__serena__execute_shell_command({
  command: "cd /Users/nick/Desktop/claude-mobile-expo/backend && pwd"
});

// 2. Verify TypeScript compiled
mcp__serena__execute_shell_command({
  command: "cd /Users/nick/Desktop/claude-mobile-expo/backend && npm run build"
});

// 3. Verify .env configured
mcp__serena__read_file({
  relative_path: "backend/.env"
});
// MUST have: ANTHROPIC_API_KEY=sk-ant-...

// 4. Create test project
mcp__serena__execute_shell_command({
  command: "mkdir -p /tmp/test-project && cd /tmp/test-project && git init"
});
```

---

## Test 1: Automated WebSocket Integration Test

**Invoke Skill**: @websocket-integration-testing

**Execute Script via Serena**:

```typescript
mcp__serena__execute_shell_command({
  command: "./scripts/test-websocket.sh ws://localhost:3001/ws /tmp/test-project",
  cwd: "/Users/nick/Desktop/claude-mobile-expo"
});
```

**Expected Output**:
```
🧪 WebSocket Integration Test
==============================
Server: ws://localhost:3001/ws
Project: /tmp/test-project

🔌 Connecting to WebSocket...

✅ Validation Results:
=====================
✅ Session initialization: PASS
✅ Message streaming: PASS
✅ Tool execution: PASS
✅ Slash commands: PASS
✅ File operations: PASS

📊 Results: 5/5 tests passed
✅ All WebSocket tests PASSED
```

**Verification via Serena**:

```typescript
// Verify test file created
mcp__serena__execute_shell_command({
  command: "cat /tmp/test-project/test.txt"
});
// Expected: "WebSocket test successful"

// Check wscat responses
mcp__serena__read_file({
  relative_path: "logs/websocket-responses.log"
});
// Must contain: session_initialized, content_delta, tool_execution, tool_result
```

**Pass Criteria**:
- ✅ Script exits with code 0
- ✅ All 5 tests show PASS
- ✅ test.txt file created with correct content
- ✅ WebSocket responses logged

---

## Test 2: Health Endpoint via Serena

```typescript
mcp__serena__execute_shell_command({
  command: "curl -s http://localhost:3001/health | jq ."
});
```

**Expected**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-30T...",
  "uptime": 45.23,
  "environment": "development"
}
```

**Pass Criteria**:
- ✅ HTTP 200 status
- ✅ Valid JSON response
- ✅ status === "healthy"
- ✅ Response time < 50ms

---

## Test 3-12: Individual Tool Tests

**Each tool tested via WebSocket messages using wscat**

### Test 3: write_file Tool

```typescript
// Send via wscat (automated in test-websocket.sh)
{"type":"message","message":"Create a hello.txt file with 'Hello from Gate 3A'"}

// Verify file created via Serena
mcp__serena__read_file({
  relative_path: "../../../tmp/test-project/hello.txt" 
});
// Must return: "Hello from Gate 3A"
```

**Pass Criteria**:
- ✅ tool_execution message received
- ✅ tool_result shows "Successfully wrote"
- ✅ File exists on disk
- ✅ Content matches exactly

### Test 4-8: Remaining Tools

**All automated in test-websocket.sh script**:
- Test 4: read_file ✅
- Test 5: list_files ✅
- Test 6: execute_command ✅
- Test 7: git_status ✅
- Test 8: git_commit ✅

---

## Test 13: REST API Validation

```typescript
// Create session
mcp__serena__execute_shell_command({
  command: `curl -X POST http://localhost:3001/api/v1/sessions -H "Content-Type: application/json" -d '{"projectPath":"/tmp/test-project"}' | jq .`
});

// List sessions
mcp__serena__execute_shell_command({
  command: "curl -s http://localhost:3001/api/v1/sessions | jq ."
});

// Delete session
mcp__serena__execute_shell_command({
  command: "curl -X DELETE http://localhost:3001/api/v1/sessions/{SESSION_ID} | jq ."
});
```

**Pass Criteria**: All REST endpoints return correct status codes and data

---

## Test 14: Automated Gate Validation

**Execute Complete Gate**:

```typescript
mcp__serena__execute_shell_command({
  command: "./scripts/validate-gate-3a.sh",
  cwd: "/Users/nick/Desktop/claude-mobile-expo"
});
```

**Expected Exit Code**: 0 (success)

---

## Save Results to Serena Memory

```typescript
mcp__serena__write_memory({
  memory_name: "validation-gate-3a-results",
  content: `
# Validation Gate 3A Results
Date: 2025-10-30
Status: PASSED ✅

Automated Tests: 5/5 PASSED
- Session initialization ✅
- Message streaming ✅
- Tool execution ✅
- Slash commands ✅
- File operations ✅

REST API Tests: 4/4 PASSED
- POST /sessions ✅
- GET /sessions ✅
- GET /sessions/:id ✅
- DELETE /sessions/:id ✅

All 6 tools verified:
- read_file ✅
- write_file ✅
- list_files ✅
- execute_command ✅
- git_status ✅
- git_commit ✅

Backend is production-ready for integration.
`
});
```

---

## Failure Recovery

**If ANY test fails**:

```typescript
// 1. Invoke debugging skill
// Use @systematic-debugging

// 2. Check backend logs
mcp__serena__read_file({relative_path: "logs/combined.log"});
mcp__serena__read_file({relative_path: "logs/error.log"});

// 3. Check WebSocket test logs
mcp__serena__read_file({relative_path: "logs/websocket-responses.log"});

// 4. Verify server running
mcp__serena__execute_shell_command({
  command: "ps aux | grep 'node dist/index.js'"
});
```

---

## Gate Pass Criteria

**MUST PASS ALL** (use checklist):

- ✅ TypeScript compiles without errors
- ✅ Server starts and runs stably
- ✅ Health endpoint returns 200
- ✅ WebSocket accepts connections
- ✅ Session initialization works (UUID generation)
- ✅ Message streaming from Claude functional
- ✅ ALL 6 tools execute correctly
- ✅ Tool results match actual filesystem operations
- ✅ Slash commands work
- ✅ REST API endpoints return correct responses
- ✅ Logging comprehensive (combined.log, error.log)
- ✅ No memory leaks (stable for 5+ minutes)
- ✅ Automated test script passes (exit code 0)

**Result**: PASS → Proceed to Phase 4  
**Result**: FAIL → Use @systematic-debugging, fix issues, re-test

---

**End of Gate 3A**
