# Claude Code Mobile API - Complete Endpoint Reference

**Version**: 2.0
**Base URL**: http://localhost:8001
**Format**: OpenAI-compatible REST + SSE
**Total Endpoints**: 55

## Core Endpoints

### Health & Info

#### GET /health
```bash
curl http://localhost:8001/health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "claude_version": "2.0.31 (Claude Code)",
  "active_sessions": 0
}
```

#### GET /
Root endpoint with API information and available endpoints.

## Chat Completions

### POST /v1/chat/completions
OpenAI-compatible chat completions with streaming support.

**Request**:
```json
{
  "model": "claude-3-5-haiku-20241022",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "stream": true,
  "session_id": "uuid",
  "project_id": "project-name"
}
```

**Response** (streaming):
```
data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","created":1234567890,"model":"claude-3-5-haiku-20241022","choices":[{"index":0,"delta":{"role":"assistant","content":"Hello"},"finish_reason":null}]}

data: [DONE]
```

**Slash Commands** (intercepted before Claude):
- `/help` - List commands
- `/clear` - Clear conversation
- `/status` - Session info
- `/files [path]` - List files
- `/git [status|log|branches]` - Git operations

### GET /v1/chat/completions/{session_id}
Get chat completion for specific session.

### GET /v1/chat/completions/{session_id}/status
Get status of ongoing chat completion.

### POST /v1/chat/completions/debug
Debug endpoint for chat system.

## Files API (7 endpoints)

### GET /v1/files/list
List files in directory with glob pattern support.

**Parameters**:
- `path` (required): Directory path
- `pattern` (optional): Glob pattern (default: `*`)
- `hidden` (optional): Include hidden files (default: `false`)

**Example**:
```bash
curl "http://localhost:8001/v1/files/list?path=/tmp&pattern=*.txt&hidden=false"
```

**Response**:
```json
[
  {
    "name": "file.txt",
    "path": "/tmp/file.txt",
    "size": 1234,
    "modified": "2025-11-01T12:00:00",
    "type": "file",
    "permissions": "644"
  }
]
```

**Errors**:
- 404: Directory not found
- 403: Path not in allowed paths
- 400: Path is not a directory

### GET /v1/files/read
Read file content.

**Parameters**:
- `path` (required): File path
- `encoding` (optional): Text encoding (default: `utf-8`)

**Response**:
```json
{
  "content": "file content here",
  "path": "/tmp/file.txt",
  "encoding": "utf-8",
  "size": 17
}
```

**Errors**:
- 404: File not found
- 403: Path not allowed
- 400: Path is a directory or binary file

### POST /v1/files/write
Write content to file.

**Request**:
```json
{
  "path": "/tmp/new-file.txt",
  "content": "Hello World",
  "encoding": "utf-8",
  "create_dirs": false
}
```

**Response**:
```json
{
  "name": "new-file.txt",
  "path": "/tmp/new-file.txt",
  "size": 11,
  "modified": "2025-11-01T12:00:00",
  "type": "file",
  "permissions": "644"
}
```

### DELETE /v1/files/delete
Delete file (not directories for safety).

**Parameters**:
- `path` (required): File path

**Response**:
```json
{
  "success": true,
  "message": "File deleted: /tmp/file.txt"
}
```

### GET /v1/files/search
Search for files by name.

**Parameters**:
- `root` (required): Root directory
- `query` (required): Search query (substring match)
- `pattern` (optional): Glob pattern (default: `*`)
- `max` (optional): Max results (default: 100, max: 1000)

**Response**: Array of FileInfo objects (same as list)

### GET /v1/files/info
Get detailed file metadata.

**Parameters**:
- `path` (required): File or directory path

**Response**: Single FileInfo object

### POST /v1/files/watch
Start watching directory for changes (returns watch_id).

## Git API (8 endpoints)

### GET /v1/git/status
Get git status for repository.

**Parameters**:
- `project_path` (required): Repository path

**Response**:
```json
{
  "current_branch": "main",
  "modified": ["file1.txt", "file2.py"],
  "staged": [],
  "untracked": ["new-file.js"],
  "conflicted": [],
  "has_commits": true,
  "is_detached": false
}
```

**Errors**:
- 400: Not a git repository

### POST /v1/git/commit
Create git commit.

**Request**:
```json
{
  "project_path": "/path/to/repo",
  "message": "feat: add new feature",
  "files": ["file1.txt"],
  "author": {
    "name": "User",
    "email": "user@example.com"
  }
}
```

**Response**:
```json
{
  "sha": "a1b2c3d4...",
  "short_sha": "a1b2c3d",
  "message": "feat: add new feature",
  "author": "User",
  "email": "user@example.com",
  "timestamp": "2025-11-01T12:00:00"
}
```

### GET /v1/git/log
Get commit history.

**Parameters**:
- `project_path` (required)
- `max` (optional): Max commits (default: 50, max: 200)
- `skip` (optional): Pagination offset (default: 0)
- `file` (optional): Filter by file path

**Response**: Array of commit objects

### GET /v1/git/diff
Get git diff (unified format).

**Parameters**:
- `project_path` (required)
- `staged` (optional): Staged vs unstaged (default: false)
- `file` (optional): Specific file
- `context` (optional): Context lines (default: 3, max: 10)

**Response**:
```json
{
  "diff": "diff --git a/file.txt...\n+new line\n-old line"
}
```

### GET /v1/git/branches
List branches.

**Parameters**:
- `project_path` (required)
- `remote` (optional): Include remote branches (default: false)

**Response**:
```json
[
  {
    "name": "main",
    "is_current": true,
    "last_commit": "a1b2c3d",
    "remote": null
  }
]
```

### POST /v1/git/branch/create
Create new branch.

**Request**:
```json
{
  "project_path": "/path/to/repo",
  "name": "feature-branch",
  "from_branch": "main"
}
```

### POST /v1/git/branch/checkout
Checkout branch (requires clean working tree).

### GET /v1/git/remotes
List configured remotes.

**Response**:
```json
[
  {
    "name": "origin",
    "url": "https://github.com/user/repo.git",
    "fetch_url": "https://github.com/user/repo.git",
    "push_url": "https://github.com/user/repo.git"
  }
]
```

## MCP API (9 endpoints)

### GET /v1/mcp/servers
List all configured MCP servers.

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "tavily",
    "url": "http://localhost:3000",
    "transport": "http",
    "enabled": true,
    "tools_count": 0,
    "last_used": "2025-11-01T12:00:00"
  }
]
```

### POST /v1/mcp/servers
Add new MCP server.

**Request**:
```json
{
  "name": "tavily",
  "url": "http://localhost:3000",
  "transport": "http",
  "api_key": "secret-key"
}
```

### DELETE /v1/mcp/servers/{name}
Remove MCP server.

### PUT /v1/mcp/servers/{name}
Update MCP configuration.

### POST /v1/mcp/servers/{name}/test
Test connection to MCP server.

**Response**:
```json
{
  "status": "success",
  "message": "Connection test not yet implemented"
}
```

### GET /v1/mcp/servers/{name}/tools
List tools available from MCP.

**Response**: `[]` (v2.0 limitation)

### POST /v1/mcp/servers/{name}/enable
Enable MCP for session.

**Request**:
```json
{
  "session_id": "uuid"
}
```

### POST /v1/mcp/servers/{name}/disable
Disable MCP for session.

### GET /v1/mcp/servers/import-from-cli
Sync from ~/.config/claude/mcp.json.

**Response**:
```json
{
  "success": true,
  "imported": 0,
  "message": "Imported 0 MCP servers from Claude CLI"
}
```

## Prompts API (5 endpoints)

### GET /v1/prompts/system/{session_id}
Get system prompt for session.

### PUT /v1/prompts/system/{session_id}
Set system prompt for session.

**Request**:
```json
{
  "content": "You are a helpful assistant"
}
```

### POST /v1/prompts/append/{session_id}
Append to system prompt.

**Request**:
```json
{
  "addition": "Be concise in responses."
}
```

### GET /v1/prompts/templates
List available prompt templates.

**Response**:
```json
[
  {
    "name": "Coding Assistant",
    "content": "You are an expert coding assistant...",
    "category": "development"
  }
]
```

### POST /v1/prompts/load-claudemd
Load CLAUDE.md as system prompt.

**Request**:
```json
{
  "project_path": "/path/to/project"
}
```

**Response**:
```json
{
  "success": true,
  "content": "# Claude Code Mobile\n...",
  "length": 1107
}
```

## Skills API (4 endpoints) - Phase 9

### GET /v1/skills
List all skills from ~/.claude/skills/.

**Response**:
```json
[
  {
    "name": "claude-mobile-validation-gate",
    "path": "/Users/user/.claude/skills/claude-mobile-validation-gate/SKILL.md",
    "description": "Validation gate automation",
    "size": 4523
  }
]
```

### GET /v1/skills/{name}
Get skill content.

**Response**:
```json
{
  "name": "skill-name",
  "content": "---\nname: skill-name\n...",
  "path": "/path/to/SKILL.md",
  "size": 1234
}
```

### POST /v1/skills
Create new skill.

**Request**:
```json
{
  "name": "my-skill",
  "description": "Custom skill",
  "content": "# My Skill\n\nSkill content..."
}
```

### DELETE /v1/skills/{name}
Delete skill.

## Agents API (4 endpoints) - Phase 9

### GET /v1/agents
List all agents from ~/.claude/agents/.

### GET /v1/agents/{name}
Get agent content with metadata.

### POST /v1/agents
Create new agent.

**Request**:
```json
{
  "name": "my-agent",
  "description": "Custom agent",
  "subagent_type": "general-purpose",
  "content": "# My Agent\n\nAgent content..."
}
```

### DELETE /v1/agents/{name}
Delete agent.

## Host API (2 endpoints)

### GET /v1/host/discover-projects
Discover Claude Code projects on host.

**Parameters**:
- `scan_path`: Path to scan (default: /Users/nick)
- `max_depth`: Max recursion depth (default: 3, max: 5)

**Response**:
```json
[
  {
    "name": "my-project",
    "path": "/Users/nick/Desktop/my-project",
    "has_claudemd": true,
    "has_git": true,
    "session_count": 0
  }
]
```

**Note**: Scans for CLAUDE.md, .git, or .claude/ directories

### GET /v1/host/browse
Browse host filesystem.

**Parameters**:
- `path` (required): Directory path

**Response**: Array of files/directories (same format as /v1/files/list)

## Stats API (4 endpoints)

### GET /v1/stats/global
System-wide statistics.

**Response**:
```json
{
  "total_sessions": 66,
  "total_messages": 0,
  "total_tokens": 0,
  "total_cost_usd": 0.0,
  "avg_messages_per_session": 0.0
}
```

### GET /v1/stats/session/{session_id}
Session-specific statistics.

**Response**:
```json
{
  "session_id": "uuid",
  "project_id": "project-name",
  "model": "claude-3-5-haiku-20241022",
  "created_at": "2025-11-01T12:00:00",
  "duration_seconds": 698,
  "message_count": 0,
  "input_tokens": 0,
  "output_tokens": 0,
  "total_cost_usd": 0.0,
  "messages_per_minute": 0.0
}
```

### GET /v1/stats/project/{project_id}
Project-level statistics.

### GET /v1/stats/recent
Recent session activity.

**Parameters**:
- `hours` (optional): Hours to look back (default: 24, max: 168)

## Sessions API

### GET /v1/sessions
List all sessions.

**Parameters**:
- `project_id` (optional): Filter by project

### POST /v1/sessions
Create new session.

**Request**:
```json
{
  "project_id": "my-project",
  "model": "claude-3-5-haiku-20241022"
}
```

### GET /v1/sessions/{session_id}
Get specific session.

### DELETE /v1/sessions/{session_id}
Delete session.

### GET /v1/sessions/stats
Aggregate session statistics.

## Projects API

### GET /v1/projects
List all projects.

### POST /v1/projects
Create new project.

### GET /v1/projects/{project_id}
Get specific project.

### DELETE /v1/projects/{project_id}
Delete project.

## Models API

### GET /v1/models
List available Claude models.

**Response**:
```json
{
  "object": "list",
  "data": [
    {
      "id": "claude-opus-4-20250514",
      "object": "model",
      "created": 1704085200,
      "owned_by": "anthropic-claude-2.0.31 (Claude Code)"
    }
  ]
}
```

### GET /v1/models/{model_id}
Get specific model info.

### GET /v1/models/capabilities
Get model capabilities (v2.0: returns 404).

## File Upload API

### POST /v1/files/upload
Upload single file.

### POST /v1/files/upload/multiple
Upload multiple files.

## Git Remote API (3 endpoints)

### POST /v1/git/push
**Status**: 501 Not Implemented (safety feature)

### POST /v1/git/pull
**Status**: 501 Not Implemented (safety feature)

### POST /v1/git/fetch
**Status**: 501 Not Implemented

**Note**: Use local git client for remote operations

## Security

**Path Validation**:
- Allowed paths: /Users, /tmp, /var
- Blocks: ../../../etc/passwd → 404
- Blocks: /etc/shadow → 403
- Blocks: Encoded traversal → 404
- Blocks: Null bytes → 400

**Rate Limiting**:
- Sliding window algorithm
- Per-client tracking
- 429 when exceeded

**Authentication**:
- API key via headers (future)
- Session-based tracking

## Error Codes

- **200**: Success
- **400**: Bad Request (invalid parameters)
- **403**: Forbidden (unauthorized path)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error
- **501**: Not Implemented (intentional)

## Performance

**Benchmarks** (tested):
- Health: 0.299s
- List files: 0.007s
- Git status: 0.051s
- List skills: 0.020s
- Read 1MB file: 0.022s

**Concurrency**: 15+ concurrent requests tested ✓

## Examples

### Complete Chat Flow

```bash
# 1. Create session
SESSION=$(curl -s -X POST http://localhost:8001/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{"project_id":"test","model":"claude-3-5-haiku-20241022"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

# 2. Send message
curl -X POST http://localhost:8001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d "{\"model\":\"claude-3-5-haiku-20241022\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}],\"session_id\":\"$SESSION\",\"stream\":false}"

# 3. Get stats
curl http://localhost:8001/v1/stats/session/$SESSION
```

### File Operations

```bash
# List project files
curl "http://localhost:8001/v1/files/list?path=/Users/nick/Desktop/claude-mobile-expo&pattern=*.md"

# Read README
curl "http://localhost:8001/v1/files/read?path=/Users/nick/Desktop/claude-mobile-expo/README.md"

# Write new file
curl -X POST http://localhost:8001/v1/files/write \
  -H "Content-Type: application/json" \
  -d '{"path":"/tmp/test.txt","content":"Hello World"}'
```

### Git Operations

```bash
# Get status
curl "http://localhost:8001/v1/git/status?project_path=/Users/nick/Desktop/claude-mobile-expo"

# View log
curl "http://localhost:8001/v1/git/log?project_path=/Users/nick/Desktop/claude-mobile-expo&max=5"

# Create commit
curl -X POST http://localhost:8001/v1/git/commit \
  -H "Content-Type: application/json" \
  -d '{"project_path":"/Users/nick/Desktop/claude-mobile-expo","message":"test commit"}'
```

## Testing

All endpoints tested with:
- Success cases ✓
- Error cases (404, 403, 400) ✓
- Edge cases (empty, long names) ✓
- Security (traversal, injection) ✓
- Performance (response times) ✓
- Concurrency (parallel requests) ✓

**Validation**: 80+ test scenarios executed

**Tools**: curl, python, wscat, xc-mcp, expo-mcp

**Approach**: Functional testing only (NO MOCKS)
