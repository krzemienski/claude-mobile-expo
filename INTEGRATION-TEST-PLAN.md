# v2.0 Integration Testing Plan - Systematic Execution

**Goal**: Test all v2.0 screens with backend APIs
**Method**: Direct API testing + UI screenshots + backend logs
**Token Budget**: 610k remaining, continue until complete

---

## Test 1: Projects Screen → Host Discovery API

**Backend Endpoint**: GET /v1/host/discover-projects
**Frontend**: ProjectsScreen.tsx calls this on mount
**Test**: Call API, verify projects returned

```bash
curl http://localhost:8001/v1/host/discover-projects
```

**Expected**: List of Claude Code projects on host
**Actual**: Testing now...

---

## Test 2: Git Screen → Git Status API

**Backend Endpoint**: GET /v1/git/status?project_path=...
**Frontend**: GitScreen.tsx calls on load
**Test**: Verify git status displayed

```bash
curl "http://localhost:8001/v1/git/status?project_path=/Users/nick/Desktop/claude-mobile-expo"
```

**Expected**: Current branch, modified files, staged, untracked
**Actual**: Already tested - WORKING ✅

---

## Test 3: Git Screen → Branches API

**Backend Endpoint**: GET /v1/git/branches
**Test**: List all branches

```bash
curl "http://localhost:8001/v1/git/branches?project_path=/Users/nick/Desktop/claude-mobile-expo"
```

**Result**: Returns [{"name":"main","is_current":true}] ✅

---

## Test 4: MCP Screen → MCP Servers API

**Backend Endpoint**: GET /v1/mcp/servers
**Frontend**: MCPManagementScreen.tsx
**Test**: List configured servers

**Result**: Returns [] (none configured) ✅

---

## Test 5: File Browser → Files List API

**Backend Endpoint**: GET /v1/files/list?path=...
**Frontend**: FileBrowserScreen.tsx
**Test**: List directory contents

```bash
curl "http://localhost:8001/v1/files/list?path=/tmp"
```

**Result**: Returns file list with metadata ✅

---

## Test 6: Code Viewer → Files Read API

**Backend Endpoint**: GET /v1/files/read?path=...
**Test**: Read file contents

---

## Continue testing systematically...
