# Claude Code Mobile API - Complete Reference

**Version**: 2.0.1
**Base URL**: http://localhost:8001 (development) / https://api.yourdomain.com (production)
**Format**: OpenAI-compatible REST + SSE
**Authentication**: Bearer token or x-api-key header (when enabled)
**Total Endpoints**: 55+

## Quick Start

```bash
# Health check
curl http://localhost:8001/health

# List models
curl http://localhost:8001/v1/models

# Chat completion (non-streaming)
curl -X POST http://localhost:8001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-3-5-haiku-20241022","messages":[{"role":"user","content":"Hello"}],"stream":false}'

# Chat completion (streaming)
curl -N -X POST http://localhost:8001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"model":"claude-3-5-haiku-20241022","messages":[{"role":"user","content":"Count to 5"}],"stream":true}'
```

## Core Endpoints

### GET /health

Basic health check.

**Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "claude_version": "2.0.31 (Claude Code)",
  "active_sessions": 0
}
```

**Status Codes**:
- 200: Healthy
- 503: Unhealthy

### GET /

API information and available endpoints.

**Response**:
```json
{
  "name": "Claude Code API Gateway",
  "version": "1.0.0",
  "description": "OpenAI-compatible API for Claude Code",
  "endpoints": {
    "chat": "/v1/chat/completions",
    "models": "/v1/models",
    "projects": "/v1/projects",
    "sessions": "/v1/sessions"
  },
  "docs": "/docs",
  "health": "/health"
}
```

## Chat API

### POST /v1/chat/completions

OpenAI-compatible chat completions with streaming support.

**Request**:
```json
{
  "model": "claude-3-5-haiku-20241022",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "stream": false,
  "session_id": "optional-session-uuid",
  "project_id": "optional-project-id",
  "project_path": "/path/to/project",
  "max_tokens": 4096,
  "temperature": 1.0
}
```

**Parameters**:
- `model` (required): One of 4 Claude models
- `messages` (required): Array of message objects
- `stream` (optional): Boolean, default false
- `session_id` (optional): UUID for continuing session
- `project_id` (optional): Project identifier
- `project_path` (optional): Filesystem path for project
- `max_tokens` (optional): Max response tokens
- `temperature` (optional): 0.0-1.0, default 1.0

**Response (Non-Streaming)**:
```json
{
  "id": "chatcmpl-uuid",
  "object": "chat.completion",
  "created": 1762228182,
  "model": "claude-3-5-haiku-20241022",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 15,
    "total_tokens": 25
  }
}
```

**Response (Streaming)** - Server-Sent Events:
```
data: {"id":"chatcmpl-uuid","object":"chat.completion.chunk","created":1762228182,"model":"claude-3-5-haiku-20241022","choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null}]}

data: {"id":"chatcmpl-uuid","object":"chat.completion.chunk","created":1762228182,"model":"claude-3-5-haiku-20241022","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-uuid","object":"chat.completion.chunk","created":1762228182,"model":"claude-3-5-haiku-20241022","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":null}]}

data: {"id":"chatcmpl-uuid","object":"chat.completion.chunk","created":1762228182,"model":"claude-3-5-haiku-20241022","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

**Tool Execution Events** (in stream):
```
data: {"id":"chatcmpl-uuid","choices":[{"index":0,"delta":{"tool_use":{"id":"toolu_xxx","name":"Write","input":{"file_path":"/tmp/test.txt","content":"Hello"}}},"finish_reason":null}]}

data: {"id":"chatcmpl-uuid","choices":[{"index":0,"delta":{"tool_result":{"id":"toolu_xxx","output":"File created successfully"}},"finish_reason":null}]}
```

**Thinking Events** (if present):
```
data: {"id":"chatcmpl-uuid","choices":[{"index":0,"delta":{"thinking":{"content":"Let me think about this...","step":1}},"finish_reason":null}]}
```

**Status Codes**:
- 200: Success
- 400: Invalid request (missing messages, validation errors)
- 401: Unauthorized (if auth enabled)
- 500: Internal error

**Slash Commands** (intercepted before Claude):
- `/help` - List commands
- `/clear` - Clear conversation
- `/status` - Session info
- `/files [path]` - List files
- `/git [status|log|branches]` - Git operations

Returns JSON instead of normal chat response:
```json
{
  "type": "slash_command_response",
  "command": "help",
  "data": {
    "commands": [...]
  },
  "timestamp": "2025-11-03T..."
}
```

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
    },
    {
      "id": "claude-sonnet-4-20250514",
      "object": "model",
      "created": 1704085201,
      "owned_by": "anthropic-claude-2.0.31 (Claude Code)"
    },
    {
      "id": "claude-3-7-sonnet-20250219",
      "object": "model",
      "created": 1704085202,
      "owned_by": "anthropic-claude-2.0.31 (Claude Code)"
    },
    {
      "id": "claude-3-5-haiku-20241022",
      "object": "model",
      "created": 1704085203,
      "owned_by": "anthropic-claude-2.0.31 (Claude Code)"
    }
  ]
}
```

## Sessions API

### GET /v1/sessions

List all sessions with pagination.

**Query Parameters**:
- `page` (optional): Page number, default 1
- `per_page` (optional): Items per page, default 20, max 100

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "project_id": "project-name",
      "model": "claude-3-5-haiku-20241022",
      "total_tokens": 1523,
      "total_cost": 0.0234,
      "message_count": 12,
      "created_at": "2025-11-03T10:00:00",
      "updated_at": "2025-11-03T10:30:00",
      "is_active": true
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_items": 4,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

### POST /v1/sessions

Create new session.

**Request**:
```json
{
  "project_id": "my-project",
  "model": "claude-3-5-haiku-20241022",
  "system_prompt": "You are a helpful coding assistant."
}
```

**Response**: Session object

### GET /v1/sessions/{id}

Get specific session details.

### DELETE /v1/sessions/{id}

Delete session.

**Response**:
```json
{
  "success": true,
  "message": "Session deleted"
}
```

## Projects API

### GET /v1/projects

List all projects.

**Response**:
```json
{
  "data": [
    {
      "id": "project-1",
      "name": "My Project",
      "description": "Project description",
      "path": "/path/to/project",
      "created_at": "2025-11-03T10:00:00",
      "is_active": true
    }
  ],
  "pagination": {...}
}
```

### POST /v1/projects

Create project.

**Request**:
```json
{
  "name": "New Project",
  "description": "Project description",
  "path": "/path/to/project"
}
```

### GET /v1/projects/{id}

Get project details.

### DELETE /v1/projects/{id}

Delete project.

## Files API

### GET /v1/files/list

List directory contents.

**Query Parameters**:
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
    "modified": "2025-11-03T12:00:00",
    "type": "file",
    "permissions": "644"
  },
  {
    "name": "directory",
    "path": "/tmp/directory",
    "size": 4096,
    "modified": "2025-11-03T11:00:00",
    "type": "directory",
    "permissions": "755"
  }
]
```

**Status Codes**:
- 200: Success
- 404: Directory not found
- 403: Path not in allowed paths
- 400: Path is not a directory

### GET /v1/files/read

Read file content.

**Query Parameters**:
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

**Status Codes**:
- 200: Success
- 404: File not found
- 403: Path not allowed
- 400: Path is directory or binary file

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
  "modified": "2025-11-03T12:00:00",
  "type": "file",
  "permissions": "644"
}
```

### DELETE /v1/files/delete

Delete file (not directories).

**Query Parameters**:
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

**Query Parameters**:
- `root` (required): Root directory to search
- `query` (required): Search query (substring match)
- `pattern` (optional): Glob pattern (default: `*`)
- `max` (optional): Max results (default: 100, max: 1000)

**Example**:
```bash
curl "http://localhost:8001/v1/files/search?root=/Users/nick/Desktop/claude-mobile-expo&query=ChatScreen&pattern=*.tsx&max=10"
```

**Response**: Array of FileInfo objects (same as list)

### GET /v1/files/info

Get detailed file metadata.

**Query Parameters**:
- `path` (required): File or directory path

**Response**: Single FileInfo object

### POST /v1/files/watch

Start watching directory for changes.

**Request**:
```json
{
  "path": "/path/to/directory",
  "patterns": ["*.ts", "*.tsx"]
}
```

**Response**:
```json
{
  "watch_id": "uuid",
  "path": "/path/to/directory",
  "patterns": ["*.ts", "*.tsx"]
}
```

## Git API

### GET /v1/git/status

Get git repository status.

**Query Parameters**:
- `project_path` (required): Repository path

**Example**:
```bash
curl "http://localhost:8001/v1/git/status?project_path=/Users/nick/Desktop/claude-mobile-expo"
```

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

**Status Codes**:
- 200: Success
- 400: Not a git repository

### POST /v1/git/commit

Create git commit.

**Request**:
```json
{
  "project_path": "/path/to/repo",
  "message": "feat: add new feature",
  "files": ["file1.txt", "file2.py"],
  "author": {
    "name": "Developer Name",
    "email": "dev@example.com"
  }
}
```

**Parameters**:
- `project_path` (required): Repository path
- `message` (required): Commit message
- `files` (optional): Specific files to commit (default: all)
- `author` (optional): Author info (default: from git config)

**Response**:
```json
{
  "sha": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0",
  "short_sha": "a1b2c3d",
  "message": "feat: add new feature",
  "author": "Developer Name",
  "email": "dev@example.com",
  "timestamp": "2025-11-03T12:00:00"
}
```

**Validation**: Verifiable via `git log`

### GET /v1/git/log

Get commit history.

**Query Parameters**:
- `project_path` (required): Repository path
- `max` (optional): Max commits (default: 50, max: 200)
- `skip` (optional): Pagination offset (default: 0)
- `file` (optional): Filter by file path

**Example**:
```bash
curl "http://localhost:8001/v1/git/log?project_path=/Users/nick/Desktop/claude-mobile-expo&max=5"
```

**Response**:
```json
[
  {
    "sha": "full-sha",
    "short_sha": "a1b2c3d",
    "message": "feat: add feature",
    "author": "Developer",
    "email": "dev@example.com",
    "timestamp": "2025-11-03T12:00:00",
    "files_changed": 3
  }
]
```

### GET /v1/git/diff

Get git diff.

**Query Parameters**:
- `project_path` (required): Repository path
- `staged` (optional): Staged vs unstaged (default: false)
- `file` (optional): Specific file
- `context` (optional): Context lines (default: 3, max: 10)

**Example**:
```bash
curl "http://localhost:8001/v1/git/diff?project_path=/Users/nick/Desktop/claude-mobile-expo&staged=false"
```

**Response**:
```json
{
  "diff": "diff --git a/file.txt b/file.txt\nindex abc123..def456 100644\n--- a/file.txt\n+++ b/file.txt\n@@ -1,3 +1,4 @@\n line 1\n+new line\n line 2"
}
```

### GET /v1/git/branches

List branches.

**Query Parameters**:
- `project_path` (required): Repository path
- `remote` (optional): Include remote branches (default: false)

**Response**:
```json
[
  {
    "name": "main",
    "is_current": true,
    "last_commit": "a1b2c3d",
    "remote": null
  },
  {
    "name": "feature-branch",
    "is_current": false,
    "last_commit": "e5f6g7h",
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

**Response**: Branch info object

### POST /v1/git/branch/checkout

Checkout branch (requires clean working tree).

**Request**:
```json
{
  "project_path": "/path/to/repo",
  "name": "feature-branch"
}
```

**Response**: Branch info

### GET /v1/git/remotes

List git remotes.

**Query Parameters**:
- `project_path` (required): Repository path

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

## Skills API (Phase 9)

### GET /v1/skills

List all skills from ~/.claude/skills/

**Response**:
```json
[
  {
    "name": "cloudflare-d1",
    "path": "/Users/nick/.claude/skills/cloudflare-d1/SKILL.md",
    "description": "|",
    "size": 23265
  },
  {
    "name": "using-superpowers",
    "path": "/Users/nick/.claude/skills/using-superpowers/SKILL.md",
    "description": "Use when starting any conversation...",
    "size": 4286
  }
]
```

**Count**: 83 skills in development environment

### GET /v1/skills/{name}

Get skill content.

**Example**:
```bash
curl http://localhost:8001/v1/skills/using-superpowers
```

**Response**:
```json
{
  "name": "using-superpowers",
  "path": "/Users/nick/.claude/skills/using-superpowers/SKILL.md",
  "description": "Use when starting any conversation...",
  "content": "---\nname: using-superpowers\n...",
  "size": 4286
}
```

### POST /v1/skills

Create new skill.

**Request**:
```json
{
  "name": "my-custom-skill",
  "description": "My skill description",
  "content": "---\nname: my-custom-skill\ndescription: My skill\n---\n\n# Skill Content\n\nSkill implementation here."
}
```

**Response**:
```json
{
  "name": "my-custom-skill",
  "path": "/Users/nick/.claude/skills/my-custom-skill/SKILL.md",
  "size": 144
}
```

**Creates**: Directory `~/.claude/skills/my-custom-skill/` with `SKILL.md` file

### DELETE /v1/skills/{name}

Delete skill.

**Example**:
```bash
curl -X DELETE http://localhost:8001/v1/skills/my-custom-skill
```

**Response**:
```json
{
  "message": "Skill 'my-custom-skill' deleted"
}
```

**Removes**: Entire skill directory from filesystem

## Agents API (Phase 9)

Same structure as Skills API, but for agents in `~/.claude/agents/`

### GET /v1/agents

List all agents.

**Response**: Array of agent objects (same structure as skills, plus `subagent_type`)

### GET /v1/agents/{name}

Get agent content.

### POST /v1/agents

Create agent.

**Request**:
```json
{
  "name": "my-agent",
  "description": "Agent description",
  "subagent_type": "general-purpose",
  "content": "---\nname: my-agent\nsubagent_type: general-purpose\n---\n\n# Agent\n\nAgent implementation."
}
```

### DELETE /v1/agents/{name}

Delete agent.

## MCP API

### GET /v1/mcp/servers

List configured MCP servers.

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "tavily",
    "url": "https://api.tavily.com",
    "transport": "http",
    "enabled": true,
    "tools_count": 0,
    "last_used": null,
    "created_at": "2025-11-03T10:00:00"
  }
]
```

### POST /v1/mcp/servers

Add MCP server.

**Request**:
```json
{
  "name": "tavily",
  "url": "https://api.tavily.com",
  "transport": "http",
  "api_key": "tvly-secret-key",
  "command": null,
  "args": [],
  "env": {}
}
```

**Parameters**:
- `transport`: "http" or "stdio"
- For HTTP: `url` and `api_key` required
- For stdio: `command` and `args` required

**Response**: MCP server object

### GET /v1/mcp/servers/import-from-cli

Import MCP servers from Claude CLI config (`~/.config/claude/mcp.json`).

**Response**:
```json
{
  "imported_count": 0,
  "message": "Imported 0 MCP servers from Claude CLI"
}
```

### DELETE /v1/mcp/servers/{name}

Delete MCP server.

### POST /v1/mcp/servers/{name}/enable

Enable MCP for session.

### POST /v1/mcp/servers/{name}/disable

Disable MCP for session.

### POST /v1/mcp/servers/{name}/test

Test MCP connection.

### GET /v1/mcp/servers/{name}/tools

List tools provided by MCP server.

## Prompts API

### GET /v1/prompts/templates

List prompt templates.

**Response**:
```json
[
  {
    "name": "Coding Assistant",
    "description": "General purpose coding assistance",
    "content": "You are an expert coding assistant..."
  },
  {
    "name": "Code Reviewer",
    "description": "Review code for quality and bugs",
    "content": "You are a thorough code reviewer..."
  },
  {
    "name": "Bug Fixer",
    "description": "Debug and fix issues",
    "content": "You are a systematic debugging expert..."
  },
  {
    "name": "Documentation Writer",
    "description": "Write comprehensive docs",
    "content": "You are a technical documentation expert..."
  },
  {
    "name": "Test Writer",
    "description": "Create test cases",
    "content": "You are a test-driven development expert..."
  },
  {
    "name": "Security Auditor",
    "description": "Security analysis",
    "content": "You are a security auditing expert..."
  }
]
```

**Count**: 6 templates

### GET /v1/prompts/system/{session_id}

Get system prompt for session.

### PUT /v1/prompts/system/{session_id}

Set system prompt (replaces existing).

**Request**:
```json
{
  "content": "You are a helpful assistant specialized in Python."
}
```

### POST /v1/prompts/append/{session_id}

Append to system prompt.

**Request**:
```json
{
  "addition": "\n\nAdditional context: Project uses FastAPI."
}
```

### POST /v1/prompts/load-claudemd

Load CLAUDE.md as system prompt.

**Request**:
```json
{
  "session_id": "uuid",
  "project_path": "/path/to/project"
}
```

**Response**:
```json
{
  "loaded": true,
  "size": 1107,
  "message": "CLAUDE.md loaded as system prompt"
}
```

## Host Discovery API

### GET /v1/host/discover-projects

Scan filesystem for Claude Code projects.

**Query Parameters**:
- `scan_path` (required): Directory to scan
- `max_depth` (optional): Max directory depth (default: 3)

**Example**:
```bash
curl "http://localhost:8001/v1/host/discover-projects?scan_path=/Users/nick/Desktop"
```

**Response**:
```json
[
  {
    "name": "claude-mobile-expo",
    "path": "/Users/nick/Desktop/claude-mobile-expo",
    "has_claudemd": true,
    "has_git": true,
    "session_count": 4,
    "last_accessed": "2025-11-03T10:00:00"
  }
]
```

**Count**: 359 projects found on /Users/nick/Desktop (verified)

**Identification**: Projects identified by:
- CLAUDE.md file exists
- .git directory exists
- .claude/ directory exists

### GET /v1/host/browse

Browse host filesystem.

**Query Parameters**:
- `path` (required): Directory path

**Response**: Directory listing (same format as files/list)

## Stats API

### GET /v1/stats/global

Global statistics across all sessions.

**Response**:
```json
{
  "total_sessions": 4,
  "total_messages": 127,
  "total_tokens": 45821,
  "total_cost_usd": 0.0382,
  "avg_messages_per_session": 31.75
}
```

### GET /v1/stats/session/{id}

Statistics for specific session.

### GET /v1/stats/project/{id}

Statistics for specific project.

### GET /v1/stats/recent

Recent activity.

## Admin API

### GET /v1/admin/stats

Admin-level statistics.

**Response**:
```json
{
  "cache_entries": 42,
  "database_size_bytes": 614400,
  "rate_limit_clients": 5,
  "total_mcp_servers": 0,
  "total_projects": 1,
  "total_sessions": 4
}
```

### GET /v1/admin/rate-limit/stats

Rate limiting statistics.

**Response**:
```json
{
  "active_clients": 5,
  "total_tracked_clients": 12,
  "total_recent_requests": 847,
  "max_per_window": 100,
  "window_seconds": 60
}
```

### GET /v1/admin/sessions/inactive

List inactive sessions.

**Response**: Array of session IDs

### POST /v1/admin/cache/clear

Clear application cache.

**Response**:
```json
{
  "cleared": null,
  "message": "Cache cleared"
}
```

### POST /v1/admin/rate-limit/reset/{client_id}

Reset rate limit for client.

### POST /v1/admin/database/vacuum

Run database vacuum (SQLite optimization).

### DELETE /v1/admin/sessions/cleanup

Cleanup inactive sessions.

## Batch API

### POST /v1/batch

Execute multiple requests in a single call.

**Request**:
```json
{
  "requests": [
    {"method": "GET", "url": "/v1/models"},
    {"method": "GET", "url": "/v1/skills"},
    {"method": "GET", "url": "/v1/projects"}
  ]
}
```

**Response**: Array of responses (1 per request)

## Webhooks API

### GET /v1/webhooks

List configured webhooks.

**Response**: Array of webhook objects (currently: `[]`)

### POST /v1/webhooks

Create webhook.

### DELETE /v1/webhooks/{id}

Delete webhook.

## Health Extended API

### GET /v1/health/detailed

Detailed health information.

**Response**:
```json
{
  "status": "healthy",
  "cpu_percent": 5.2,
  "memory": {
    "used_mb": 245,
    "available_mb": 7923,
    "percent": 3.0
  },
  "threads": 12,
  "uptime_seconds": 3652
}
```

### GET /v1/health/liveness

Liveness probe (for Kubernetes).

**Response**:
```json
{
  "alive": true
}
```

**Status Codes**:
- 200: Alive
- 500: Dead

### GET /v1/health/readiness

Readiness probe (for Kubernetes).

**Response**:
```json
{
  "ready": true,
  "status": "healthy"
}
```

**Status Codes**:
- 200: Ready
- 503: Not ready

## Monitoring API

### GET /v1/monitoring/endpoints

List monitored endpoints.

**Response**:
```json
[
  {
    "path": "/v1/chat/completions",
    "requests": 45,
    "avg_duration_ms": 285
  }
]
```

## Search API

### GET /v1/search

Search across resources.

**Query Parameters**:
- `q` (required): Search query

**Response**: Search results (structure varies)

## Error Responses

All errors follow consistent format:

```json
{
  "detail": "Error message"
}
```

Or for validation errors:

```json
{
  "error": {
    "message": "Validation failed",
    "type": "validation_error",
    "code": "INVALID_REQUEST"
  }
}
```

**Common Status Codes**:
- 200: Success
- 400: Bad request (validation error, missing fields)
- 401: Unauthorized (auth enabled, invalid key)
- 403: Forbidden (path not allowed)
- 404: Not found (session, project, file not found)
- 405: Method not allowed
- 422: Unprocessable entity (Pydantic validation)
- 429: Too many requests (rate limit exceeded)
- 500: Internal server error
- 503: Service unavailable (Claude CLI not found)

## Rate Limiting

**Default**: 100 requests per 60 seconds per client

**Headers** (when implemented):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1762228240
```

**Response when exceeded**:
```json
{
  "detail": "Rate limit exceeded. Try again in 45 seconds."
}
```

## Pagination

Used in: Sessions, Projects APIs

**Query Parameters**:
- `page`: Page number (1-indexed)
- `per_page`: Items per page (max 100)

**Response Format**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_items": 127,
    "total_pages": 7,
    "has_next": true,
    "has_prev": false
  }
}
```

## Authentication

**Development**: Disabled (`REQUIRE_AUTH=false`)

**Production**: Enable with environment variable

**Request Headers**:
```
Authorization: Bearer YOUR_API_KEY
```
Or:
```
x-api-key: YOUR_API_KEY
```

**Unauthorized Response** (401):
```json
{
  "detail": "Unauthorized"
}
```

## Examples

### Complete Chat Workflow

```bash
# 1. Create session
SESSION=$(curl -s -X POST http://localhost:8001/v1/sessions \
  -H "Content-Type: application/json" \
  -d '{"project_id":"my-project","model":"claude-3-5-haiku-20241022"}' \
  | jq -r '.id')

echo "Session: $SESSION"

# 2. Send message
curl -s -X POST http://localhost:8001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d "{\"session_id\":\"$SESSION\",\"model\":\"claude-3-5-haiku-20241022\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}],\"stream\":false}" \
  | jq -r '.choices[0].message.content'

# 3. Get session stats
curl -s http://localhost:8001/v1/stats/session/$SESSION | jq '.'

# 4. Delete session
curl -s -X DELETE http://localhost:8001/v1/sessions/$SESSION
```

### File Operations Workflow

```bash
# 1. List files
curl -s "http://localhost:8001/v1/files/list?path=/tmp&pattern=*.txt" | jq -r '.[].name'

# 2. Read file
curl -s "http://localhost:8001/v1/files/read?path=/tmp/test.txt" | jq -r '.content'

# 3. Write file
curl -s -X POST http://localhost:8001/v1/files/write \
  -H "Content-Type: application/json" \
  -d '{"path":"/tmp/new.txt","content":"Hello World"}' \
  | jq -r '.name, .size'

# 4. Search files
curl -s "http://localhost:8001/v1/files/search?root=/tmp&query=test" | jq -r '.[].name'

# 5. Delete file
curl -s -X DELETE "http://localhost:8001/v1/files/delete?path=/tmp/new.txt"
```

### Git Operations Workflow

```bash
PROJECT="/Users/nick/Desktop/claude-mobile-expo"

# 1. Check status
curl -s "http://localhost:8001/v1/git/status?project_path=$PROJECT" | jq '.'

# 2. View changes
curl -s "http://localhost:8001/v1/git/diff?project_path=$PROJECT&staged=false" | jq -r '.diff'

# 3. Create commit
curl -s -X POST http://localhost:8001/v1/git/commit \
  -H "Content-Type: application/json" \
  -d "{\"project_path\":\"$PROJECT\",\"message\":\"feat: add feature\",\"files\":[\"file.txt\"]}" \
  | jq -r '.short_sha, .message'

# 4. View log
curl -s "http://localhost:8001/v1/git/log?project_path=$PROJECT&max=5" | jq -r '.[].short_sha + " " + .[].message'

# 5. List branches
curl -s "http://localhost:8001/v1/git/branches?project_path=$PROJECT" | jq -r '.[].name'
```

---

**API Reference Status**: Complete for 45/55 tested endpoints
**Token Usage**: 363k/1M
**Next**: Performance testing, security testing, continuous validation
