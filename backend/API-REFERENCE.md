# Claude Code Mobile API Reference

**Version**: 2.0.0
**Base URL**: `http://localhost:8001`
**Total Endpoints**: 40+

---

## Chat Completions

### POST /v1/chat/completions
OpenAI-compatible chat completions with streaming support.

**Request**:
```json
{
  "model": "claude-3-5-haiku-20241022",
  "messages": [{"role": "user", "content": "Hello"}],
  "stream": true,
  "session_id": "optional-session-id",
  "project_id": "optional-project-id"
}
```

**Streaming Response**: Server-Sent Events (SSE)
**Non-streaming Response**: JSON

**Tool Events**: `delta.tool_use`, `delta.tool_result`
**Thinking Events**: `delta.thinking`

---

## File Operations (7 endpoints)

### GET /v1/files/list
List directory contents with glob filtering.

**Parameters**:
- `path` (required): Directory path
- `pattern`: Glob pattern (e.g., `*.py`, `**/*.ts`)
- `hidden`: Include hidden files (default: false)
- `limit`: Max results (default: 1000)
- `offset`: Skip first N (default: 0)

**Example**:
```bash
curl "http://localhost:8001/v1/files/list?path=/tmp&pattern=*.txt&limit=10"
```

### GET /v1/files/read
Read file content.

**Parameters**:
- `path` (required): File path
- `encoding`: Text encoding (default: utf-8)

**Returns**: `{content, path, size, encoding}`

### POST /v1/files/write
Write file content.

**Body**:
```json
{
  "path": "/tmp/test.txt",
  "content": "File content",
  "encoding": "utf-8",
  "create_dirs": true
}
```

### DELETE /v1/files/delete
Delete file (not directories).

**Parameters**:
- `path` (required): File path

**Safety**: Cannot delete directories

### GET /v1/files/search
Search for files by name.

**Parameters**:
- `root` (required): Root directory
- `query` (required): Search query (substring match)
- `pattern`: Glob filter (default: *)
- `max`: Max results (default: 100)

### GET /v1/files/info
Get file metadata.

**Parameters**:
- `path` (required): File or directory path

**Returns**: name, path, size, modified, type, permissions

### POST /v1/files/upload
Upload file via multipart/form-data.

**Form Data**:
- `file`: File to upload
- `destination`: Destination path
- `overwrite`: Overwrite if exists (default: false)

---

## Git Operations (8 endpoints)

### GET /v1/git/status
Get working directory status.

**Parameters**:
- `project_path` (required): Repository path

**Returns**: `{current_branch, modified[], staged[], untracked[], conflicted[], has_commits}`

### POST /v1/git/commit
Create git commit.

**Body**:
```json
{
  "project_path": "/path/to/repo",
  "message": "Commit message",
  "files": ["file1.txt", "file2.py"],
  "author": {"name": "User", "email": "user@example.com"}
}
```

**Returns**: `{sha, short_sha, message, author, timestamp}`

### GET /v1/git/log
Get commit history.

**Parameters**:
- `project_path` (required)
- `max`: Max commits (default: 50)
- `skip`: Skip first N (pagination)
- `file`: Filter by file path

### GET /v1/git/diff
Get unified diff.

**Parameters**:
- `project_path` (required)
- `staged`: Show staged changes (default: false)
- `file`: Specific file
- `context`: Context lines (default: 3)

### GET /v1/git/branches
List branches.

**Parameters**:
- `project_path` (required)
- `remote`: Include remote branches (default: false)

### POST /v1/git/branch/create
Create new branch.

**Body**:
```json
{
  "project_path": "/path/to/repo",
  "name": "feature/new-branch",
  "from_branch": "main"
}
```

### POST /v1/git/branch/checkout
Switch to branch.

**Body**:
```json
{
  "project_path": "/path/to/repo",
  "name": "main"
}
```

### GET /v1/git/remotes
Get remote information.

**Parameters**:
- `project_path` (required)

---

## MCP Management (9 endpoints)

### GET /v1/mcp/servers
List all MCP servers.

### POST /v1/mcp/servers
Add new MCP server.

**Body**:
```json
{
  "name": "tavily",
  "url": "http://localhost:3000",
  "transport": "http",
  "api_key": "secret-key"
}
```

**Security**: API keys encrypted with Fernet

### DELETE /v1/mcp/servers/{name}
Remove MCP server.

### GET /v1/mcp/servers/{name}/tools
List tools available from MCP.

### POST /v1/mcp/servers/{name}/enable
Enable MCP for session.

**Body**: `{session_id}`

### POST /v1/mcp/servers/{name}/disable
Disable MCP for session.

### GET /v1/mcp/servers/import-from-cli
Sync MCPs from ~/.config/claude/mcp.json.

---

## System Prompts (5 endpoints)

### GET /v1/prompts/system/{session_id}
Get current system prompt.

### PUT /v1/prompts/system/{session_id}
Set/replace system prompt.

**Body**: `{content}`

### POST /v1/prompts/append/{session_id}
Append to system prompt.

**Body**: `{addition}`

### GET /v1/prompts/templates
List prompt templates (6 available).

**Templates**:
- Coding Assistant
- Code Reviewer
- Bug Fixer
- Documentation Writer
- Test Writer
- Security Auditor

### POST /v1/prompts/load-claudemd
Load CLAUDE.md as system context.

**Body**: `{project_path}`

---

## Host Discovery (2 endpoints)

### GET /v1/host/discover-projects
Scan filesystem for Claude Code projects.

**Parameters**:
- `scan_path`: Root path to scan
- `max_depth`: Recursion depth (default: 3)

**Finds**:
- Directories with CLAUDE.md
- Directories with .git
- Directories with .claude/

### GET /v1/host/browse
Browse host filesystem.

**Parameters**:
- `path` (required): Directory to browse

---

## Statistics (4 endpoints)

### GET /v1/stats/global
System-wide statistics.

**Returns**: total_sessions, total_messages, total_tokens, total_cost

### GET /v1/stats/session/{session_id}
Detailed session statistics.

### GET /v1/stats/project/{project_id}
Aggregate stats for all sessions in project.

### GET /v1/stats/recent
Recent session activity.

**Parameters**:
- `hours`: Lookback window (default: 24)

---

## Admin (3 endpoints)

### GET /v1/admin/cache/stats
Get cache statistics.

### POST /v1/admin/cache/clear
Clear cache (all or by namespace).

### GET /v1/admin/system/info
Get system information (CPU, memory, disk).

### GET /v1/admin/routes
List all registered routes.

---

## Security

**Path Validation**:
- All file operations validate paths against allowed directories
- Directory traversal prevented (`../../../etc/passwd` blocked)
- Returns 403 Forbidden for unauthorized paths

**API Key Encryption**:
- MCP API keys encrypted with Fernet (symmetric encryption)
- Keys never stored in plain text

**Rate Limiting**:
- 100 requests per minute (configurable)
- Burst of 10 requests

**Authentication**:
- Optional (disabled by default for development)
- Bearer token or x-api-key header
- Configurable via `REQUIRE_AUTH` environment variable

---

## Error Responses

All errors follow OpenAI format:
```json
{
  "error": {
    "message": "Human-readable error",
    "type": "error_type",
    "code": "error_code"
  }
}
```

**HTTP Status Codes**:
- 200: Success
- 400: Bad Request (invalid parameters)
- 403: Forbidden (permission denied)
- 404: Not Found
- 409: Conflict (duplicate resource)
- 500: Internal Server Error
- 501: Not Implemented

---

## Validation

**All endpoints validated with systematic tests**:
- Gate B1: File operations (10/10 PASSED)
- Gate B2: Git operations (10/10 PASSED)
- Gate B3: MCP management (10/10 PASSED)
- Gate B4: Advanced features (10/10 PASSED)

**Total**: 40/40 backend tests passing

**Validation Scripts**:
```bash
./backend/validate-b1.sh  # File ops
./backend/validate-b2.sh  # Git ops
./backend/validate-b3.sh  # MCP
./backend/validate-b4.sh  # Advanced
./backend/validate-all-gates.sh  # Run all 40 tests
```

---

## OpenAPI Documentation

Interactive API documentation available at:
- Swagger UI: `http://localhost:8001/docs`
- ReDoc: `http://localhost:8001/redoc`
- OpenAPI JSON: `http://localhost:8001/openapi.json`
