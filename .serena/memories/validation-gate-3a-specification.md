# Validation Gate 3A: Backend Functional Testing - Specification

## Overview

Comprehensive backend validation document created for Claude Code Mobile project.

**Document Location:** `/Users/nick/Desktop/claude-mobile-expo/docs/VALIDATION-GATE-3A-BACKEND-FUNCTIONAL-TESTING.md`

## Document Statistics

- **Total Lines:** ~1,850 lines
- **Format:** Markdown with embedded code blocks
- **Sections:** 8 major sections
- **Tests Specified:** 21 detailed tests (5 automated + 16 manual core + 5 additional)
- **Code Examples:** 150+ command examples with expected outputs

## Test Coverage

### Automated Testing
1. **test-websocket.sh** - 5 automated tests:
   - WebSocket connection
   - Session initialization
   - Message streaming
   - Tool execution
   - File operations validation

2. **validate-gate-3a.sh** - Complete gate wrapper

### Manual Test Suite (21 Tests)

#### Core Functionality (Tests 1-14)
1. TypeScript Compilation
2. Server Startup
3. Health Check Endpoint
4. WebSocket Connection
5. Session Initialization
6. Message to Claude (Streaming)
7. write_file Tool Execution
8. read_file Tool Execution
9. list_files Tool Execution
10. execute_command Tool Execution
11. git_status Tool Execution
12. git_commit Tool Execution
13. Slash Command Execution
14. Logging Verification

#### REST API Tests (Tests 15-18)
15. Create Session (POST /api/v1/sessions)
16. Get Session (GET /api/v1/sessions/:id)
17. List Sessions (GET /api/v1/sessions)
18. Delete Session (DELETE /api/v1/sessions/:id)

#### Advanced Tests (Tests 19-21)
19. Memory Leak Test (5-minute stress test)
20. Concurrent Connection Test (10 simultaneous connections)
21. Error Recovery Test (4 error scenarios)

## Serena MCP Integration

### Script Execution Commands

```typescript
// Execute automated validation
mcp__serena__execute_shell_command({
  command: "cd /Users/nick/Desktop/claude-mobile-expo && ./scripts/test-websocket.sh",
  max_answer_chars: 10000
})

// Execute complete gate validation
mcp__serena__execute_shell_command({
  command: "cd /Users/nick/Desktop/claude-mobile-expo && ./scripts/validate-gate-3a.sh",
  max_answer_chars: 10000
})
```

### Result Storage

Results should be saved using:

```typescript
mcp__serena__write_memory({
  memory_name: "validation-gate-3a-backend-testing",
  content: `[Complete test results with all 26 tests]`
})
```

## Key Features

### 1. Prerequisites Section
- Environment verification (Node.js, npm, TypeScript)
- Project structure validation
- Dependencies installation checklist
- Environment configuration (.env setup)

### 2. Test Environment Setup
- Test project creation (/tmp/test-project)
- Backend build process
- Server startup procedure
- Health check verification

### 3. Automated Testing
- test-websocket.sh script documentation
- Script usage examples
- Expected outputs
- Failure handling procedures

### 4. Manual Test Suite
Each test includes:
- **Commands:** Exact commands to execute
- **Expected Output:** Complete expected responses
- **Pass Criteria:** Specific success conditions
- **Verification:** Additional checks
- **Failure Investigation:** Diagnostic commands

### 5. Test Results Documentation
- Serena Memory integration template
- Performance metrics recording
- Tool execution verification
- Logging verification checklist
- REST API verification summary

### 6. Troubleshooting Guide
10 common issues with:
- Symptoms
- Diagnosis commands
- Solutions
- General debugging tips

### 7. Gate Pass Criteria
Comprehensive checklist with 13 categories:
1. Compilation & Build (5 checks)
2. Server Startup (6 checks)
3. Health Check (5 checks)
4. WebSocket Protocol (6 checks)
5. Session Management (5 checks)
6. Message Streaming (6 checks)
7. Tool Execution - All 6 Tools (16 checks)
8. Slash Commands (5 checks)
9. Logging (7 checks)
10. REST API (6 checks)
11. Performance (5 checks)
12. Stability (5 checks)
13. Error Handling (6 checks)

**Total Pass Criteria:** 83 individual checks

## Technical Specifications

### Tools Tested
1. **write_file** - File creation with content verification
2. **read_file** - Content retrieval accuracy
3. **list_files** - Directory listing correctness
4. **execute_command** - Shell command execution with output
5. **git_status** - Git repository state reporting
6. **git_commit** - Git commit creation

### Performance Benchmarks
- Health endpoint: < 50ms
- Session initialization: < 200ms
- Message streaming first delta: < 1s
- Tool execution: < 500ms
- REST API operations: < 100ms

### Stability Requirements
- Memory increase: < 20% over 5 minutes
- Concurrent connections: 10+ successful
- Error recovery: No crashes, graceful handling
- Extended operation: 50+ message round-trips

## Usage Instructions

### For Developers
1. Read Prerequisites section to ensure environment ready
2. Follow Test Environment Setup to prepare backend
3. Run automated tests first (test-websocket.sh)
4. Execute manual tests in sequence (Tests 1-21)
5. Document results using Serena Memory template
6. Verify all pass criteria met
7. Declare gate status

### For AI Agents
1. Invoke @systematic-debugging if any test fails
2. Use mcp__serena__execute_shell_command for automated tests
3. Save results to Serena Memory after completion
4. Consult troubleshooting guide for failures
5. Do not proceed to Phase 4 until gate passes

## Validation Gate 3A Purpose

**Objective:** Verify complete backend functionality before frontend integration

**Validates:**
- TypeScript compilation
- Server stability
- API functionality (REST + WebSocket)
- Claude integration
- Tool execution (all 6 tools)
- Logging system
- Session management
- Error handling
- Performance
- Memory management

**Required Before:** Phase 4: Mobile Frontend Implementation

## Document Quality

### Completeness
- ✅ All 14 requested tests specified
- ✅ Automation integration documented
- ✅ Serena MCP commands included
- ✅ Expected outputs provided
- ✅ Pass criteria clearly defined
- ✅ Troubleshooting guide comprehensive

### Usability
- ✅ Clear table of contents
- ✅ Copy-paste ready commands
- ✅ JSON response examples
- ✅ Diagnostic procedures
- ✅ Performance metrics
- ✅ Memory templates

### Automation
- ✅ test-websocket.sh integration
- ✅ validate-gate-3a.sh wrapper
- ✅ Serena MCP execution commands
- ✅ Result storage procedures
- ✅ Script failure handling

## Key Commands

### Execute Full Validation
```bash
cd /Users/nick/Desktop/claude-mobile-expo
./scripts/validate-gate-3a.sh
```

### Execute Automated Tests Only
```bash
./scripts/test-websocket.sh
```

### Start Backend Server
```bash
cd backend
npm start
```

### View Test Logs
```bash
tail -f logs/backend-test.log
tail -f logs/websocket-responses.log
```

### Check Server Health
```bash
curl http://localhost:3001/health
```

## Success Declaration Template

```
✅ VALIDATION GATE 3A: PASSED

📊 Automated Tests: 5/5 PASSED
📊 Manual Tests: 21/21 PASSED
📊 Overall: 26/26 tests PASSED

Backend is fully functional and ready for frontend integration.

Approved to proceed to Phase 4: Mobile Frontend Implementation.
```

## Related Documentation

- **Main Plan:** `/Users/nick/Desktop/claude-mobile-expo/docs/plans/2025-10-30-claude-code-mobile.md`
- **Shell Scripts:** `/Users/nick/Desktop/claude-mobile-expo/docs/SHELL-SCRIPTS-DESIGN.md`
- **Backend Source:** `/Users/nick/Desktop/claude-mobile-expo/backend/src/`
- **Test Scripts:** `/Users/nick/Desktop/claude-mobile-expo/scripts/`

## Next Steps After Gate 3A

1. Proceed to Phase 4: Mobile Frontend Implementation
2. Execute Phase 4 tasks (4.1 - 4.11)
3. Prepare for Validation Gate 4A: Frontend Visual Testing
4. Plan for Phase 6: Integration Testing (Gates 6A, 6B, 6C)

## Document Version History

- **v1.0** - 2025-10-30: Initial comprehensive specification
  - 1,850 lines of detailed testing procedures
  - 21 manual tests + 5 automated tests
  - Complete automation integration
  - Troubleshooting guide
  - 83 pass criteria checks
