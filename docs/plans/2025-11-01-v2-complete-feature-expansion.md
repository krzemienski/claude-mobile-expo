# Claude Code Mobile v2.0 - Complete Feature Expansion Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform functional chat app into complete Claude Code mobile experience with project management, file operations, git integration, MCP management, professional flat-black UI, and full Claude CLI feature parity.

**Architecture:** Python FastAPI backend with comprehensive Claude CLI integration + React Native frontend with React Native Reusables (shadcn/ui style), flat-black professional theme.

**Tech Stack:**
- Backend: Python 3.11+, FastAPI, GitPython, aiofiles, watchdog, SQLite
- Frontend: React Native 0.81, Expo 54, React Native Reusables, NativeWind v4
- UI: Flat black theme (shadcn/ui dark mode), professional code editor aesthetic
- Testing: pytest (backend), IDB automation (frontend), validation gates

**Research Completed:**
- shadcn/ui → React Native Reusables (6.8k stars, active)
- Claude Code CLI architecture and MCP integration
- File/git operations best practices
- Syntax highlighting libraries

**Estimated Effort:** 350-400k tokens across 8 phases with 15 validation gates

---

## CURRENT STATE (v1.0 - PRODUCTION READY)

### What Works ✅
- Chat completions with SSE streaming (XHR-based, tested 10+ messages)
- Sessions API (CRUD operations, database-backed)
- Projects API (basic CRUD)
- Models API (4 Claude models selectable)
- Tool execution (Claude CLI with Write verified - file created)
- Tool event forwarding via SSE (just added to streaming.py)
- Navigation (Chat ↔ Settings ↔ Sessions)
- Purple gradient theme (spec-compliant)
- TypeScript: 0 errors in src/
- Backend: 6/6 sanity tests passing

### What's Missing ❌
- File operations API (browse, read, write host files)
- Git operations API (status, commit, log, diff)
- MCP server management API
- System prompt control
- Project discovery on host
- Flat black UI (still has purple gradient)
- Tool display in UI (events forwarded but not shown)
- Code viewer with syntax highlighting
- File browser with actual backend
- Thinking/reasoning display
- Skills/agents/hooks management

---

## PHASE 1: Backend - Comprehensive File Operations

**Goal:** Full filesystem access from mobile - browse directories, read files, write files, search, watch changes

**Skills to Invoke:**
- @python-expert (file I/O, pathlib)
- @test-driven-development (write tests first)
- @security-expert (path validation, sandboxing)

**MCP Servers to Use:**
- None (native Python file operations)

### Task 1.1: FileOperationsService Core

**Specification:**
- Service class with methods: list_files, read_file, write_file, delete_file, search_files, get_file_info, watch_directory
- Path validation to prevent directory traversal (security critical)
- Support glob patterns for filtering (*.py, **/*.ts, etc.)
- Return structured metadata (name, path, size, modified, type, permissions)
- Handle encoding detection for text files
- Binary file support (return base64 or error)
- Symlink handling

**Testing Requirements:**
- pytest test suite with 15+ test cases
- Test valid paths, invalid paths, permission errors
- Test glob patterns (*, **, ?, [])
- Test edge cases (empty dir, hidden files, large files)
- Test security: attempts to escape allowed paths must fail

**Acceptance Criteria:**
- All pytest tests pass
- Can list /tmp directory
- Can read text file with correct content
- Can write file and verify creation
- Invalid path returns proper exception
- Directory traversal blocked (../../../etc/passwd fails)

**Files to Create:**
- backend/claude_code_api/services/file_operations.py (~300 lines)
- backend/claude_code_api/tests/test_file_operations.py (~200 lines)

**MCP Research:**
Use @research-agent to find:
- Python libraries for safe path handling
- File watching libraries (watchdog vs alternatives)
- Best practices for file size limits

### Task 1.2: File Operations API Endpoints

**Specification:**

**Endpoints Required:**
1. `GET /v1/files/list?path={path}&pattern={glob}&hidden={bool}`
   - Lists directory contents with metadata
   - Supports glob filtering
   - Option to include/exclude hidden files
   - Returns: `[{name, path, type, size, modified, permissions}]`
   - Errors: 404 (not found), 403 (permission), 400 (not a directory)

2. `GET /v1/files/read?path={path}&encoding={enc}`
   - Reads file contents
   - Supports encoding selection (utf-8, latin1, etc.)
   - Binary files: return base64 or error
   - Returns: `{content, path, encoding, size}`
   - Errors: 404, 403, 400 (is directory)

3. `POST /v1/files/write {path, content, encoding, create_dirs}`
   - Writes content to file
   - Optional: create parent directories
   - Returns: File metadata after write
   - Errors: 403, 400 (invalid path)

4. `DELETE /v1/files/delete?path={path}`
   - Deletes file (not directories for safety)
   - Returns: Success confirmation
   - Errors: 404, 403, 400 (is directory)

5. `GET /v1/files/search?root={path}&query={q}&pattern={glob}&max={n}`
   - Searches for files by name
   - Optional content search (future)
   - Glob pattern filtering
   - Max results limit
   - Returns: `[{name, path, size, modified, relevance_score}]`

6. `GET /v1/files/info?path={path}`
   - Get detailed file metadata
   - Returns: size, created, modified, accessed, permissions, owner, is_git_tracked

7. `POST /v1/files/watch {path, patterns[]}`
   - Start watching directory for changes
   - Returns: watch_id
   - Future: WebSocket/SSE events on file changes

**Skills for This Task:**
- @fastapi-expert (endpoint design, error handling)
- @test-driven-development (API test-first)
- @security-auditor (validate all inputs, prevent injection)

**Testing Requirements:**
- pytest test suite for each endpoint (integration tests)
- Use TestClient to call APIs
- Verify response schemas (Pydantic models)
- Test error conditions (404, 403, 400, 500)
- Verify files actually created/read/deleted on filesystem

**Acceptance Criteria:**
- All 7 endpoints respond correctly
- All pytest tests pass (20+ tests)
- Can list user's home directory from API
- Can read package.json from project
- Can write test file and verify
- Invalid paths return proper HTTP errors
- File search finds files by name

**Files to Create:**
- backend/claude_code_api/api/files.py (~250 lines)
- backend/claude_code_api/tests/test_api_files.py (~300 lines)
- backend/claude_code_api/models/files.py (Pydantic models ~80 lines)

### Task 1.3: File Browser Backend Integration

**Specification:**
- Enhance existing Projects API to discover projects on host
- Add endpoint: `GET /v1/host/discover-projects?scan_path={path}`
  - Scans directory tree for Claude Code projects
  - Identifies by: CLAUDE.md existence, .git directory, or .claude/ directory
  - Returns: `[{name, path, has_claudemd, has_git, session_count}]`
- Add endpoint: `GET /v1/host/browse?path={path}`
  - Browse host filesystem from mobile
  - Returns directory tree
  - Security: Configurable allowed paths

**Testing Requirements:**
- Can discover at least 2 projects on developer's machine
- Returns accurate project metadata
- Can browse from root (/) on dev machine
- Respects path restrictions in production

**Skills:**
- @python-expert (directory scanning, path traversal)
- @database-admin (update projects table schema)

**Acceptance Criteria:**
- Discovers real Claude Code projects
- Returns project list with metadata
- Mobile app can browse host directories
- Path security enforced

### GATE B1: Backend File Operations Complete

**Validation Checklist:**
1. ✅ FileOperationsService: All methods implemented and tested
2. ✅ All 7 file API endpoints functional
3. ✅ pytest test suite: 30+ tests, all passing
4. ✅ Can list /tmp via API call
5. ✅ Can read actual file from host
6. ✅ Can write file and verify creation
7. ✅ Search finds files correctly
8. ✅ Directory traversal attacks blocked
9. ✅ Proper HTTP error codes (404, 403, 400)
10. ✅ Project discovery finds real projects

**Validation Commands:**
```bash
cd backend
pytest tests/test_file_operations.py tests/test_api_files.py -v --tb=short
curl "http://localhost:8001/v1/files/list?path=/tmp" | jq
curl "http://localhost:8001/v1/host/discover-projects?scan_path=$HOME" | jq
```

**Pass Criteria:** 10/10 tests must pass

**DO NOT PROCEED to Phase 2 until Gate B1 PASSES.**

---

## PHASE 2: Backend - Complete Git Integration

**Goal:** Full git operations from mobile - status, commit, log, diff, branch management

**Skills to Invoke:**
- @python-expert (GitPython library usage)
- @git-expert (git operations best practices)
- @test-driven-development

**MCP Servers to Use:**
- @mcp-git (if available for validation)

### Task 2.1: GitOperationsService Implementation

**Specification:**

**Required Methods:**
1. `get_status(repo_path)` - Full git status
   - Returns: modified, untracked, staged, current_branch, has_commits, conflicted
   - Handles: non-git repos (error), detached HEAD, empty repos

2. `create_commit(repo_path, message, files=None, author=None)`
   - Stages files (all if None)
   - Creates commit with message
   - Optional custom author
   - Returns: commit_sha, short_sha, message, author, timestamp

3. `get_log(repo_path, max_count=50, skip=0, file_path=None)`
   - Paginated commit history
   - Optional: commits affecting specific file
   - Returns: `[{sha, short_sha, message, author, email, timestamp, files_changed}]`

4. `get_diff(repo_path, staged=False, file_path=None, context_lines=3)`
   - Unified diff format
   - Staged vs unstaged
   - Optional: diff for specific file
   - Returns: diff string with syntax

5. `get_branches(repo_path, include_remote=False)`
   - List all branches
   - Local only or include remotes
   - Returns: `[{name, is_current, last_commit, remote}]`

6. `create_branch(repo_path, branch_name, from_branch=None)`
   - Create new branch
   - Optional: from specific branch/commit
   - Returns: branch info

7. `checkout_branch(repo_path, branch_name)`
   - Switch branches
   - Validates clean working directory
   - Returns: new branch info

8. `get_remote_info(repo_path)`
   - List remotes
   - Returns: `[{name, url, fetch_url, push_url}]`

**Testing Requirements:**
- pytest suite with git test repository fixture
- Test all git states: clean, dirty, untracked, staged, conflicted
- Test empty repo, repo with history
- Test branch operations
- Test error conditions (not a git repo, conflicts, etc.)
- 25+ test cases covering all methods

**Acceptance Criteria:**
- All methods handle edge cases
- Proper exceptions for error states
- All tests pass
- Can get status of real git repo
- Can create commit in test repo
- Branch operations work correctly

**Files to Create:**
- backend/claude_code_api/services/git_operations.py (~400 lines)
- backend/claude_code_api/tests/test_git_operations.py (~350 lines)
- backend/claude_code_api/tests/fixtures/git_repo.py (test fixtures ~100 lines)

### Task 2.2: Git API Endpoints

**Specification:**

**Endpoints Required:**
1. `GET /v1/git/status?project_path={path}`
2. `POST /v1/git/commit {project_path, message, files[], author{}}`
3. `GET /v1/git/log?project_path={path}&max={n}&skip={n}&file={path}`
4. `GET /v1/git/diff?project_path={path}&staged={bool}&file={path}`
5. `GET /v1/git/branches?project_path={path}&remote={bool}`
6. `POST /v1/git/branch/create {project_path, name, from}`
7. `POST /v1/git/branch/checkout {project_path, name}`
8. `GET /v1/git/remotes?project_path={path}`

**Skills:**
- @fastapi-expert
- @api-documenter (OpenAPI schemas)

**Testing Requirements:**
- Integration tests with real git repository
- Test all HTTP methods
- Verify response schemas
- Test error responses
- 20+ API test cases

**Acceptance Criteria:**
- All 8 endpoints functional
- Proper HTTP status codes
- OpenAI-compatible error format
- Works with projects table integration
- All tests pass

**Files to Create:**
- backend/claude_code_api/api/git.py (~300 lines)
- backend/claude_code_api/tests/test_api_git.py (~250 lines)

### GATE B2: Backend Git Operations Complete

**Validation Checklist:**
1. ✅ GitOperationsService: 8 methods, all tested
2. ✅ Git API: 8 endpoints, all functional
3. ✅ pytest: 45+ tests, all passing
4. ✅ Git status returns accurate data
5. ✅ Can create commit via API
6. ✅ Can get commit log
7. ✅ Can get diff (staged and unstaged)
8. ✅ Branch operations work
9. ✅ Non-git directory returns 400
10. ✅ All HTTP errors proper format

**Validation Commands:**
```bash
pytest tests/test_git_operations.py tests/test_api_git.py -v
# In git repo:
curl "http://localhost:8001/v1/git/status?project_path=$(pwd)" | jq
curl "http://localhost:8001/v1/git/log?project_path=$(pwd)&max=5" | jq
```

**Pass Criteria:** 10/10 checklist items ✅

---

## PHASE 3: Backend - MCP Server Management

**Goal:** Complete MCP server lifecycle management from mobile

**Skills to Invoke:**
- @python-expert
- @mcp-integration-engineer
- @mcp-server-architect

**MCP Research Required:**
Use @mcp-registry-navigator to:
- Find all available public MCP servers
- Get connection specifications (HTTP vs stdio)
- Understand authentication patterns
- Get tool schemas

### Task 3.1: MCP Configuration Storage

**Specification:**
- Store MCP server configs in SQLite database
- Table: `mcp_servers` with fields:
  - id (UUID), name (unique), url, transport (http/stdio)
  - command, args (JSON), env_vars (JSON), api_key (encrypted)
  - enabled (bool), created_at, last_used, tools_count
- Encryption for sensitive data (API keys)
- Migration script to add table

**Testing:**
- Database schema validation
- CRUD operations on mcp_servers table
- Encryption/decryption of API keys
- 10+ database tests

**Acceptance Criteria:**
- Table created with proper schema
- Can store MCP configurations
- API keys encrypted at rest
- All CRUD operations work

**Files:**
- backend/claude_code_api/core/database.py (modify, add MCPServer model)
- backend/claude_code_api/core/encryption.py (new, Fernet encryption)
- backend/claude_code_api/tests/test_mcp_storage.py

### Task 3.2: MCP Manager Service

**Specification:**

**MCPManagerService methods:**
1. `list_servers()` - Get all configured MCPs
2. `add_server(name, config)` - Add new MCP with validation
3. `remove_server(name)` - Remove MCP
4. `enable_server(name, session_id)` - Enable for session
5. `disable_server(name, session_id)` - Disable for session
6. `test_connection(name)` - Verify MCP is reachable
7. `get_tools(name)` - List available tools from MCP
8. `execute_tool(name, tool_name, input)` - Call MCP tool
9. `sync_with_claude_cli()` - Read Claude CLI's .mcp.json and import

**Integration with Claude CLI:**
- Claude CLI stores MCPs in ~/.config/claude/mcp.json
- Service should READ that file to discover existing MCPs
- Service should WRITE to that file when mobile adds MCP
- Sync bidirectionally (mobile ↔ CLI)

**Testing:**
- Mock MCP server for testing
- Test all CRUD operations
- Test tool execution
- Test CLI config file sync
- 20+ tests

**Acceptance Criteria:**
- All methods work
- Can add/remove/list MCPs
- Can sync with Claude CLI config
- Test connection works
- All tests pass

**Files:**
- backend/claude_code_api/services/mcp_manager.py (~350 lines)
- backend/claude_code_api/tests/test_mcp_manager.py (~280 lines)
- backend/claude_code_api/tests/fixtures/mock_mcp_server.py

### Task 3.3: MCP API Endpoints

**Specification:**

**Endpoints:**
1. `GET /v1/mcp/servers` - List all MCPs
2. `POST /v1/mcp/servers` - Add new MCP
3. `DELETE /v1/mcp/servers/{name}` - Remove MCP
4. `PUT /v1/mcp/servers/{name}` - Update MCP config
5. `POST /v1/mcp/servers/{name}/test` - Test connection
6. `GET /v1/mcp/servers/{name}/tools` - List tools
7. `POST /v1/mcp/servers/{name}/enable` - Enable for session
8. `POST /v1/mcp/servers/{name}/disable` - Disable
9. `GET /v1/mcp/servers/import-from-cli` - Sync from Claude CLI config

**Request/Response Schemas:**
```
AddMCPRequest:
  name: string (unique)
  url: string
  transport: "http" | "stdio"
  command?: string (for stdio)
  args?: string[]
  env?: {[key: string]: string}
  api_key?: string

MCPServerResponse:
  id: string
  name: string
  url: string
  transport: string
  enabled: boolean
  tools_count: number
  last_used: string | null
  status: "connected" | "disconnected" | "error"
```

**Testing:**
- API integration tests with TestClient
- Test adding Tavily, Notion, Cloudflare MCPs
- Test tool listing
- Test enable/disable
- Test sync from CLI
- 15+ API tests

**Acceptance:**
- All 9 endpoints work
- Can add real MCP (Tavily)
- Can list its tools
- Can enable/disable
- All tests pass

**Files:**
- backend/claude_code_api/api/mcp.py (~280 lines)
- backend/claude_code_api/tests/test_api_mcp.py (~240 lines)

### GATE B3: MCP Management Complete

**Validation:**
1. ✅ MCP database table created
2. ✅ MCPManagerService: All methods tested
3. ✅ MCP API: 9 endpoints functional
4. ✅ Can add Tavily MCP via API
5. ✅ Can list Tavily tools
6. ✅ Can sync from Claude CLI config
7. ✅ API keys encrypted
8. ✅ All pytest tests pass (50+)
9. ✅ Can enable MCP for specific session
10. ✅ Connection testing works

**Validation Commands:**
```bash
pytest tests/test_mcp_*.py -v
curl -X POST "http://localhost:8001/v1/mcp/servers" -d '{...tavily config...}'
curl "http://localhost:8001/v1/mcp/servers" | jq
curl "http://localhost:8001/v1/mcp/servers/tavily/tools" | jq
```

**Pass:** 10/10 ✅

---

## PHASE 4: Backend - Advanced Claude CLI Integration

**Goal:** System prompts, hooks, thinking display, session replay

### Task 4.1: System Prompt Management

**Specification:**

**Requirements:**
- Each session can have custom system prompt
- Default system prompt loaded from config
- Support prompt templates (coding assistant, code reviewer, etc.)
- Append mode (add to existing prompt)
- Replace mode (full override)

**Database:**
- Sessions table already has `system_prompt TEXT` field ✅
- Just need to USE it in chat completions

**Service Methods:**
1. `get_system_prompt(session_id)` - Get current prompt
2. `set_system_prompt(session_id, content)` - Replace prompt
3. `append_system_prompt(session_id, addition)` - Append
4. `list_prompt_templates()` - Get predefined templates
5. `load_claudemd_as_prompt(project_path)` - Use CLAUDE.md as system context

**API Endpoints:**
1. `GET /v1/prompts/system/{session_id}`
2. `PUT /v1/prompts/system/{session_id}`
3. `POST /v1/prompts/append/{session_id}`
4. `GET /v1/prompts/templates`
5. `POST /v1/prompts/load-claudemd {session_id, project_path}`

**Integration with Chat:**
- Modify chat.py to include system_prompt in Claude CLI invocation
- Use `--system-prompt` flag when spawning subprocess
- Store prompt with session in database

**Testing:**
- Test prompt CRUD operations
- Test template loading
- Test CLAUDE.md integration
- Verify system prompt appears in Claude's context
- 12+ tests

**Acceptance:**
- Can set custom system prompt
- Appears in chat completions
- Templates available
- CLAUDE.md loaded correctly

**Files:**
- backend/claude_code_api/services/prompt_manager.py (~180 lines)
- backend/claude_code_api/api/prompts.py (~150 lines)
- backend/claude_code_api/tests/test_prompts.py (~200 lines)
- backend/claude_code_api/data/prompt_templates.json (templates)

### Task 4.2: Thinking/Reasoning Output Capture

**Specification:**

**Goal:** Display Claude's internal thinking process in mobile app

**Claude CLI Integration:**
- Claude CLI with extended thinking outputs reasoning steps
- These appear in JSONL as message type variations
- Parser needs to extract and forward via SSE

**Parser Enhancement:**
- Check if parser.py handles "thinking" or "reasoning" message types
- If not, add extraction methods
- Return structured thinking blocks

**SSE Event Type:**
- Add new delta type: `delta.thinking`
- Format: `{thinking: {content: string, step: number}}`
- Mobile app can display in collapsible section

**Testing:**
- Prompt Claude with complex reasoning task
- Verify thinking blocks parsed
- Verify SSE events sent
- Mobile app receives events
- 8+ tests

**Acceptance:**
- Thinking blocks extracted from Claude output
- SSE events include thinking
- Mobile app logs thinking events
- (UI display in Phase 5)

**Files:**
- backend/claude_code_api/utils/parser.py (modify, add extract_thinking)
- backend/claude_code_api/utils/streaming.py (modify, add thinking SSE events)
- backend/claude_code_api/tests/test_thinking_capture.py

### Task 4.3: Host System Discovery

**Specification:**

**Features:**
- Discover all Claude Code projects on host machine
- Scan common locations: ~/Documents, ~/Projects, ~/Code, ~/Developer
- Identify by CLAUDE.md, .git, or recent `claude` command usage
- Return project metadata with last accessed time

**Service:**
- `HostDiscoveryService.scan_for_projects(scan_paths[])`
- Uses file operations service
- Efficient scanning (skip node_modules, .git internals, etc.)
- Caches results (refresh on demand)

**API:**
- `GET /v1/host/projects/scan?paths[]={paths}&force_refresh={bool}`
- Returns: `[{name, path, type, last_accessed, git_status, claudemd_preview}]`

**Testing:**
- Can find real projects on dev machine
- Returns accurate metadata
- Skips irrelevant directories (node_modules)
- Performance: Scans home directory in <5 seconds
- 10+ tests

**Acceptance:**
- Finds developer's actual Claude Code projects
- Returns useful metadata
- Performance acceptable
- All tests pass

**Files:**
- backend/claude_code_api/services/host_discovery.py (~250 lines)
- backend/claude_code_api/api/host.py (~180 lines)
- backend/claude_code_api/tests/test_host_discovery.py

### GATE B4: Advanced Backend Integration Complete

**Validation:**
1. ✅ System prompt API: 5 endpoints working
2. ✅ Can set/get/append system prompts
3. ✅ Templates available
4. ✅ CLAUDE.md loaded as context
5. ✅ Thinking blocks extracted from CLI output
6. ✅ Thinking SSE events sent
7. ✅ Host discovery scans filesystem
8. ✅ Finds real projects
9. ✅ All pytest tests pass (30+)
10. ✅ Performance acceptable

**Pass:** 10/10 ✅

---

## PHASE 5: Frontend - React Native Reusables Integration

**Goal:** Complete UI rebuild with flat black theme, shadcn/ui components

**Skills:**
- @react-native-expert
- @tailwind-expert
- @ui-ux-designer

**MCP Servers:**
- @shadcn-ui (for component examples and patterns)

### Task 5.1: Install and Configure React Native Reusables

**Specification:**

**Installation Steps:**
1. Install RNR CLI: `npm install -g @react-native-reusables/cli`
2. Initialize in project: `npx rn-reusables init`
3. Install NativeWind v4: `npm install nativewind@^4.0.0`
4. Install dependencies: `class-variance-authority clsx tailwind-merge`
5. Install primitives: `@rn-primitives/slot @rn-primitives/types`

**Configuration:**
- Create `global.css` with flat black theme variables
- Configure `tailwind.config.js` for React Native
- Set up `metro.config.js` for CSS processing
- Create `lib/utils.ts` with cn() helper

**Theme Specifications:**

**Flat Black Color System:**
```
Background: #000000 (pure black) or #0a0a0a (slightly warm black)
Card/Surface: #1a1a1a (elevated elements)
Border: #2a2a2a (subtle borders)
Primary: #4ecdc4 (teal - keep for continuity)
Foreground: #ffffff (pure white text)
Muted: #6b7280 (gray-500)
Success: #10b981 (green-500)
Error: #ef4444 (red-500)
Warning: #f59e0b (amber-500)
```

**Typography:**
- Keep System font (San Francisco on iOS)
- Keep Menlo for code
- Sizes remain same (10-32px scale)

**Testing:**
- Verify NativeWind classes work
- Test theme variables in CSS
- Build succeeds
- TypeScript compiles
- 5 tests

**Acceptance:**
- RNR installed and configured
- Flat black theme defined
- cn() helper works
- TypeScript happy
- No build errors

**Files:**
- claude-code-mobile/global.css
- claude-code-mobile/tailwind.config.js
- claude-code-mobile/metro.config.js (modify)
- claude-code-mobile/lib/utils.ts

### Task 5.2: Generate Core UI Components

**Specification:**

**Components to Generate via CLI:**
1. `npx rn-reusables add button` - Primary action buttons
2. `npx rn-reusables add card` - Message bubbles, containers
3. `npx rn-reusables add input` - Text inputs
4. `npx rn-reusables add text` - Typography component
5. `npx rn-reusables add separator` - Dividers
6. `npx rn-reusables add badge` - Status indicators
7. `npx rn-reusables add avatar` - User avatars (future)
8. `npx rn-reusables add switch` - Toggle switches
9. `npx rn-reusables add select` - Dropdowns
10. `npx rn-reusables add dialog` - Modals
11. `npx rn-reusables add tabs` - Tab navigation
12. `npx rn-reusables add toast` - Notifications

**Customization:**
- Each component gets flat black theme
- Teal accent for interactive elements
- White text on dark backgrounds
- Subtle borders (#2a2a2a)

**Testing:**
- Create ThemeShowcase screen
- Render all components
- Verify colors match spec
- Screenshot comparison
- 12 components × 2 tests = 24 tests

**Acceptance:**
- All 12 components generated
- All use flat black theme
- All render without errors
- Visual inspection matches VS Code aesthetic

**Files:**
- components/ui/button.tsx (generated)
- components/ui/card.tsx (generated)
- ... (10 more components)
- src/screens/ThemeShowcaseScreen.tsx (test screen)

### Task 5.3: Rebuild Existing Screens with New Theme

**Specification:**

**Screens to Rebuild:**
1. ChatScreen - Replace LinearGradient with flat black View
2. SettingsScreen - Use Card components for sections
3. SessionsScreen - Card-based session list
4. MessageBubble - Flat design with subtle shadows
5. ConnectionStatus - Badge component instead of custom

**Design Patterns:**
- Consistent card-based layouts
- Subtle borders instead of gradients
- Flat colors (no gradients)
- Spacing remains same (8-point grid)
- Icons: Keep existing emojis or add lucide-react-native

**Testing for Each Screen:**
- Build and run on iOS
- Screenshot comparison (before/after)
- Verify all interactions still work
- Navigation still works
- TypeScript compiles
- 5 screens × 5 tests = 25 tests

**Acceptance:**
- All 5 screens rebuilt with flat theme
- No visual regressions
- All functionality preserved
- User can't tell it's rebuilt (same features)
- Professional aesthetic achieved

**Files:**
- src/screens/*.tsx (modify all 5)
- src/components/MessageBubble.tsx (modify)
- src/components/ConnectionStatus.tsx (modify)

### GATE F1: UI Rebuild Complete

**Validation:**
1. ✅ RNR installed, 12 components generated
2. ✅ Flat black theme configured
3. ✅ All 5 screens rebuilt
4. ✅ ChatScreen: Black background, working
5. ✅ Settings: Card layout, working
6. ✅ Sessions: New UI, working
7. ✅ MessageBubble: Flat design, rendering
8. ✅ Navigation: All transitions work
9. ✅ TypeScript: 0 errors
10. ✅ Screenshots: Professional dark theme

**Visual Validation:**
- Compare screenshots to VS Code dark mode
- Teal accent visible and pleasant
- Text readable (white on black, good contrast)
- No purple gradient anywhere
- Professional, not playful

**Pass:** 10/10 ✅

---

## PHASE 6: Frontend - New Feature Screens

**Goal:** Add 6 new screens for complete Claude Code experience

### Task 6.1: Projects List Screen

**Specification:**

**Purpose:** Show all Claude Code projects discovered on host system

**UI Layout:**
- Header: "Projects" title + "+ New" button
- Grid/List of project cards
- Each card shows:
  - Project name (bold, large)
  - Full path (gray, small)
  - Last accessed (relative time)
  - Session count
  - Git status badge (if git repo)
  - CLAUDE.md indicator
- Empty state: "No projects found" + "Scan Host" button
- Pull to refresh

**Interactions:**
- Tap project → Navigate to ProjectDetailScreen
- Tap "+ New" → Navigate to CreateProjectScreen
- Tap "Scan Host" → Call discover API, show loading
- Long press → Context menu (delete, open in files)

**Data Flow:**
1. Screen mounts → Call GET /v1/host/projects/scan
2. Display loading spinner
3. Receive projects array → Store in Zustand
4. Render grid of project cards
5. Tap project → Load sessions for that project

**Testing:**
- Renders with empty state
- Loads projects from API
- Displays project cards correctly
- Navigation to detail works
- Pull to refresh updates list
- 8+ tests

**Acceptance:**
- Screen renders
- Shows real projects from host
- All interactions work
- Loading states shown
- Empty state handled

**Files:**
- src/screens/ProjectsScreen.tsx (~250 lines)
- src/components/ProjectCard.tsx (~120 lines)
- src/hooks/useProjects.ts (data fetching ~80 lines)

### Task 6.2: Project Detail Screen

**Specification:**

**Purpose:** Show all sessions within a selected project

**UI Layout:**
- Header: Back button + Project name + "New Session" button
- Project info card:
  - Path
  - CLAUDE.md preview (first 200 chars)
  - Git branch (if git repo)
  - Last used
- Sessions list (FlatList):
  - Each session card shows:
    - Title (if set) or "Session" + short ID
    - Created date
    - Message count
    - Model used
    - Status (active/archived)
  - Tap to resume session
  - Swipe to delete

**Data Flow:**
1. Receive projectId from navigation params
2. Call GET /v1/sessions?project_id={id}
3. Display sessions for this project only
4. Tap session → Navigate to Chat with session_id
5. Create new → POST /v1/sessions {project_id} → Navigate to Chat

**Testing:**
- Renders project info
- Lists sessions correctly
- Create session works
- Resume session works
- Delete session works
- 10+ tests

**Files:**
- src/screens/ProjectDetailScreen.tsx (~280 lines)
- src/components/SessionCard.tsx (~150 lines)

### Task 6.3: MCP Management Screen

**Specification:**

**Purpose:** Configure and manage MCP servers from mobile

**UI Layout:**
- Header: "MCP Servers" + "+ Add" button
- List of configured MCPs (Card per MCP):
  - Name (bold)
  - URL or command
  - Transport type badge (HTTP / stdio)
  - Tools count badge
  - Enabled toggle switch
  - "Test Connection" button
  - "View Tools" button
- Empty state: "No MCP servers" + "Add First MCP"

**Add MCP Flow:**
1. Tap "+ Add" → Navigate to AddMCPScreen
2. Form with fields:
   - Name (text input)
   - Transport (HTTP / stdio selector)
   - URL (if HTTP)
   - Command (if stdio)
   - API Key (secure input, optional)
3. "Test Connection" before saving
4. Save → POST /v1/mcp/servers
5. Return to list

**View Tools Modal:**
- Shows all tools available from MCP
- Tool name, description, parameters
- "Try Tool" button (future)

**Testing:**
- Renders MCP list
- Can add Tavily MCP
- Shows tools count
- Enable/disable toggle works
- Test connection shows result
- 12+ tests

**Files:**
- src/screens/MCPManagementScreen.tsx (~300 lines)
- src/screens/AddMCPScreen.tsx (~280 lines)
- src/components/MCPCard.tsx (~180 lines)
- src/components/MCPToolsModal.tsx (~150 lines)

### Task 6.4: System Prompt Editor Screen

**Specification:**

**Purpose:** Edit session system prompt from mobile

**UI Layout:**
- Header: "System Prompt" + Save button
- Current prompt display (read-only text)
- Editable TextInput (multiline, 500px height)
- Template selector dropdown
- "Load CLAUDE.md" button (if project has it)
- Character count
- "Append" vs "Replace" mode toggle

**Templates:**
- Coding Assistant
- Code Reviewer
- Bug Fixer
- Documentation Writer
- Test Writer
- Security Auditor
- (Load from /v1/prompts/templates)

**Data Flow:**
1. Load current: GET /v1/prompts/system/{session_id}
2. Edit in TextInput
3. Tap Save → PUT /v1/prompts/system/{session_id}
4. Return to Chat (prompt updated)

**Testing:**
- Loads current prompt
- Can edit and save
- Templates apply correctly
- CLAUDE.md loads
- Append mode works
- 10+ tests

**Files:**
- src/screens/SystemPromptEditorScreen.tsx (~240 lines)
- src/components/PromptTemplateSelector.tsx (~120 lines)

### Task 6.5: Enhanced Settings Screen

**Specification:**

**New Settings to Add:**
- Model selection (dropdown with 4 Claude models)
- System prompt quick edit (tap to open full editor)
- MCP servers quick toggle (enable/disable common MCPs)
- File operations settings:
  - Default browse path
  - Show hidden files toggle
  - Auto-save enabled
- Git settings:
  - Default commit author
  - Auto-stage before commit
  - Show branch in header
- Appearance:
  - Theme: Flat Black (fixed for now)
  - Font size slider (12-20px)
  - Line height selector
  - Syntax theme (for code viewer)

**Layout:**
- Grouped sections (cards)
- Each section collapsible
- Search bar at top
- Much cleaner than current

**Testing:**
- All settings save to AsyncStorage
- All settings apply immediately
- Model selection changes active model
- File/git settings persist
- 15+ tests

**Files:**
- src/screens/SettingsScreen.tsx (expand from 106 → ~400 lines)
- src/components/SettingsSection.tsx (~100 lines)
- src/hooks/useSettings.ts (centralized settings logic ~150 lines)

### Task 6.6: File Browser Screen (Complete Rebuild)

**Specification:**

**Purpose:** Browse host filesystem, preview files, open in code viewer

**UI Layout:**
- Header: Back + Current path + "New File" button
- Path breadcrumbs (tappable to go up)
- Search bar (filters current directory)
- File/folder list (FlatList):
  - Folders: 📁 icon, name, item count
  - Files: Icon by extension, name, size
  - Tap folder → Navigate into
  - Tap file → Open in CodeViewerScreen
  - Long press → Context menu (rename, delete, copy path)
- Floating "+" button:
  - New file
  - New folder
  - Upload file (future)

**Data Flow:**
1. Mount → Load current path or default to project root
2. Call GET /v1/files/list?path={currentPath}
3. Display files/folders
4. Tap folder → Update currentPath → Re-fetch
5. Tap file → Navigate to CodeViewer with filePath

**Search:**
- Local filter (current directory)
- API search (recursive, uses /v1/files/search)
- Debounced input
- Shows results in same list

**Testing:**
- Can navigate directories
- Can go up with breadcrumbs
- File list accurate
- Search filters correctly
- Can open files in viewer
- 15+ tests

**Files:**
- src/screens/FileBrowserScreen.tsx (rebuild, ~380 lines)
- src/components/FileListItem.tsx (~180 lines)
- src/components/PathBreadcrumbs.tsx (~120 lines)
- src/hooks/useFileBrowser.ts (state management ~200 lines)

### Task 6.7: Code Viewer Screen (Complete Implementation)

**Specification:**

**Purpose:** View file contents with syntax highlighting, line numbers, copy

**UI Layout:**
- Header: Back + File name + Action buttons (Copy, Share, Edit)
- File info bar:
  - File path (small, gray)
  - Size, lines, language
- Code display:
  - Syntax highlighted
  - Line numbers (toggleable)
  - Word wrap (toggleable)
  - Horizontal scroll if no wrap
  - Pinch to zoom (font size)
- Footer toolbar:
  - Line numbers toggle
  - Wrap toggle
  - Theme selector (light/dark syntax)
  - Font size +/-

**Syntax Highlighting:**
- Use @rivascva/react-native-code-editor
- Supports: TypeScript, JavaScript, Python, JSON, Markdown, CSS, HTML
- Prism.js based
- Multiple themes available

**Features:**
- Read-only (edit mode future)
- Copy file content to clipboard
- Share file (native share sheet)
- Jump to line (future)
- Search in file (future)

**Data Flow:**
1. Receive filePath from navigation
2. Call GET /v1/files/read?path={filePath}
3. Detect language from extension
4. Render with syntax highlighting
5. Copy button → Clipboard.setString()

**Testing:**
- Renders file content
- Syntax highlighting applied
- Line numbers show correctly
- Copy to clipboard works
- All toolbar buttons work
- 12+ tests

**Files:**
- src/screens/CodeViewerScreen.tsx (rebuild, ~340 lines)
- src/components/CodeEditor.tsx (wrapper around library ~150 lines)
- src/components/CodeToolbar.tsx (~100 lines)
- src/utils/languageDetection.ts (extension → language mapping)

### GATE F2: New/Rebuilt Screens Complete

**Validation:**
1. ✅ ProjectsScreen: Functional with real project data
2. ✅ ProjectDetailScreen: Shows sessions for project
3. ✅ MCPManagementScreen: Lists and manages MCPs
4. ✅ AddMCPScreen: Can add Tavily MCP
5. ✅ SystemPromptEditorScreen: Can edit prompts
6. ✅ Enhanced SettingsScreen: All new settings
7. ✅ FileBrowserScreen: Browse host filesystem
8. ✅ CodeViewerScreen: Syntax highlighting works
9. ✅ All screens: Flat black theme
10. ✅ All screens: Proper navigation
11. ✅ TypeScript: 0 errors
12. ✅ All interactions: Smooth, no crashes

**Visual Validation:**
- Take screenshots of all screens
- Compare to VS Code / Cursor aesthetics
- Verify teal accent throughout
- Verify text contrast (AA compliant)

**Pass:** 12/12 ✅

---

## PHASE 7: Frontend - Tool Execution Display

**Goal:** Show Claude CLI tool executions in chat UI with expand/collapse

### Task 7.1: ToolExecutionCard Enhancement

**Specification:**

**Current:** Component exists but not integrated

**Requirements:**
- Card showing tool execution
- Header: Tool icon + Tool name + Status badge
- Collapsible body:
  - Tool input (JSON formatted)
  - Tool result (syntax highlighted if code)
  - Execution time
  - Error message (if failed)
- Visual states:
  - Executing: Spinner, gray background
  - Success: Green border, checkmark
  - Error: Red border, error icon
- Animations: Smooth expand/collapse

**Design:**
- Flat black card (#1a1a1a)
- Teal border when executing
- Green/red border when done
- Monospace font for input/output
- Syntax highlighting for code results

**Testing:**
- Renders in collapsed state
- Expands on tap
- Shows all data correctly
- Status colors correct
- 8+ tests

**Files:**
- src/components/ToolExecutionCard.tsx (enhance, ~200 lines)

### Task 7.2: Integrate Tool Display into ChatScreen

**Specification:**

**Requirements:**
- MessageBubble renders ToolExecutionCard for each tool
- Tools appear in order of execution
- Multiple tools supported
- Smooth animations when tool added
- Doesn't break message layout

**SSEClient Updates:**
- Parse tool_use from SSE delta.tool_use
- Parse tool_result from SSE delta.tool_result
- Call callbacks: onToolUse(data), onToolResult(data)

**ChatScreen Updates:**
- Add onToolUse callback to sendMessageStreaming
- Add onToolResult callback
- Update message.toolExecutions array as tools arrive
- MessageBubble automatically renders ToolExecutionCard

**Data Model:**
```
Message {
  ...
  toolExecutions: [{
    id: string
    tool: string (Read, Write, Bash, etc.)
    input: object
    result?: string
    status: 'executing' | 'complete' | 'error'
    startedAt: Date
    completedAt?: Date
  }]
}
```

**Testing:**
- Send prompt requiring Write tool
- Verify ToolExecutionCard appears
- Shows tool name (Write)
- Shows input (file path, content)
- Shows result after execution
- Status transitions: executing → complete
- 10+ tests

**Acceptance:**
- Tool events parsed from SSE
- Tool cards render in messages
- Expand/collapse works
- Status updates in real-time
- File creation confirmed

**Files:**
- src/screens/ChatScreen.tsx (modify, add tool callbacks)
- src/services/http/sse.client.ts (modify, parse tool events)
- src/components/MessageBubble.tsx (modify, render tools)

### GATE I1: Tool Display Integration Complete

**Validation:**
1. ✅ Tool events parsed from SSE (tool_use, tool_result)
2. ✅ ToolExecutionCard appears in message
3. ✅ Shows tool name correctly
4. ✅ Shows tool input (JSON formatted)
5. ✅ Shows tool result after completion
6. ✅ Status badge updates (executing → complete)
7. ✅ Collapse/expand works
8. ✅ Multiple tools in one message supported
9. ✅ Animations smooth
10. ✅ File creation visible in tool result

**Test Prompt:** "Use the Write tool to create hello.txt with 'Hello World', then use the Read tool to read it back"

**Expected:** 2 ToolExecutionCards appear, both show success ✅

**Pass:** 10/10 ✅

---

## PHASE 8: Integration - File and Git Operations

**Goal:** Mobile app can fully interact with host filesystem and git

### Task 8.1: File Browser ↔ Backend Integration

**Specification:**

**Features to Wire Up:**
1. Directory listing from real host paths
2. File navigation (folders expand/collapse)
3. File opening in CodeViewer
4. Search functionality
5. Create new file from mobile
6. Delete files from mobile
7. Refresh on pull

**HTTP Service:**
- Add file operations methods to HTTPService
- fileService.listFiles(path, pattern)
- fileService.readFile(path)
- fileService.writeFile(path, content)
- fileService.searchFiles(root, query)

**Testing:**
- Start at project root
- Navigate to src/ directory
- Open a .tsx file in viewer
- Create new test file
- Verify file exists on host
- Delete test file
- Verify deletion on host
- 15+ integration tests

**Acceptance:**
- Can browse entire project
- Can open any file
- Can create files from mobile
- All files immediately accessible on host
- Search finds files

**Files:**
- src/services/http/http.client.ts (add file methods)
- src/screens/FileBrowserScreen.tsx (wire up API calls)

### Task 8.2: Git Operations ↔ Mobile UI

**Specification:**

**Git Screen (New):**
- Shows current git status
- Modified files list (with diffs preview)
- Untracked files list
- Staged files list
- Commit message input
- "Stage All" button
- "Commit" button
- Recent commits log (scrollable)

**Commit Flow:**
1. User taps "Git" from Settings or floating button
2. Navigate to GitScreen
3. Load: GET /v1/git/status?project_path={path}
4. Show modified/untracked files
5. User enters commit message
6. Tap "Commit" → POST /v1/git/commit
7. Show success toast
8. Refresh status

**Diff Viewer:**
- Tap modified file → Show diff
- Syntax highlighted (red/green lines)
- Line numbers
- Collapsible hunks

**Testing:**
- Can view git status
- Can create commit
- Commit appears in log
- Diff shows correctly
- Branch name displayed
- 12+ tests

**Files:**
- src/screens/GitScreen.tsx (~380 lines)
- src/components/GitStatusCard.tsx (~150 lines)
- src/components/GitDiffViewer.tsx (~220 lines)

### GATE I2: File and Git Integration Complete

**Validation:**
1. ✅ File browser shows real host files
2. ✅ Can navigate directories
3. ✅ Can open file in code viewer
4. ✅ File content displayed correctly
5. ✅ Can create file from mobile
6. ✅ File appears on host immediately
7. ✅ Git screen shows real status
8. ✅ Can create commit from mobile
9. ✅ Commit appears in git log
10. ✅ Diff viewer shows changes
11. ✅ Search finds files
12. ✅ All backend APIs responding 200 OK

**Integration Tests:**
```bash
# IDB automation script
1. Open FileBrowser
2. Navigate to src/
3. Tap on ChatScreen.tsx
4. Verify code appears in viewer
5. Go back
6. Create new file "test-from-mobile.txt"
7. Open Git screen
8. Verify file shows as untracked
9. Stage and commit
10. Verify commit in log
```

**Pass:** 12/12 ✅

---

## PHASE 9: Advanced Features

### Task 9.1: Thinking/Reasoning Display

**Specification:**

**Goal:** Show Claude's internal reasoning process

**UI:**
- Collapsible "Show Thinking" section in each message
- Accordion-style steps
- Each thought numbered
- Timestamp per thought
- Collapse all / Expand all buttons

**Backend:**
- Parser extracts thinking blocks from Claude JSONL
- SSE event: `delta.thinking {content, step_number}`
- Stored in message metadata

**Frontend:**
- New component: ThinkingAccordion
- Renders in MessageBubble
- Expandable per thought
- Copy thinking to clipboard

**Testing:**
- Prompt with complex reasoning
- Verify thinking steps appear
- Expand/collapse works
- All thoughts visible
- 8+ tests

### Task 9.2: Skills Management

**Specification:**

**Backend:**
- Read skills from ~/.claude/skills/
- API: GET /v1/skills (list all)
- API: GET /v1/skills/{name} (get skill content)
- API: POST /v1/skills (create new)
- API: DELETE /v1/skills/{name}

**Frontend:**
- Skills screen
- List available skills
- View skill content
- Enable/disable for session
- Create custom skill (textarea)

**Testing:**
- Lists real skills from host
- Can view skill details
- Can create simple skill
- Skill appears in CLI
- 10+ tests

### Task 9.3: Agents Management

**Specification:**

**Backend:**
- Claude CLI agents are in ~/.claude/agents/
- Similar CRUD to skills
- Support agent spawning from mobile

**Frontend:**
- Agents screen
- List agents
- Create agent from template
- Configure agent parameters

### Task 9.4: Slash Commands

**Specification:**

**Backend:**
- Parse slash commands in chat.py before sending to Claude
- Built-in commands: /help, /clear, /status, /files, /git
- Custom commands from skills
- Return JSON response

**Frontend:**
- Slash menu shows on "/" typed
- Autocomplete available commands
- Command execution shows in chat
- Result formatted nicely

---

## VALIDATION GATE SUMMARY

**Phase 1 - Backend File Ops:**
- Gate B1: File Operations API Complete (10 tests)

**Phase 2 - Backend Git Ops:**
- Gate B2: Git Operations API Complete (10 tests)

**Phase 3 - Backend MCP:**
- Gate B3: MCP Management Complete (10 tests)

**Phase 4 - Backend Advanced:**
- Gate B4: Prompts/Host/Thinking Complete (10 tests)

**Phase 5 - Frontend UI Rebuild:**
- Gate F1: Flat Black Theme Complete (10 tests)

**Phase 6 - Frontend New Screens:**
- Gate F2: 6 New Screens Complete (12 tests)

**Phase 7 - Frontend Tool Display:**
- Gate I1: Tool Cards Rendering (10 tests)

**Phase 8 - Integration File/Git:**
- Gate I2: File/Git Mobile Integration (12 tests)

**Phase 9 - Advanced Features:**
- Gate A1: Thinking/Skills/Agents (15 tests)

**Total:** 99 specific validation tests across 9 gates

---

## SKILLS TO INVOKE BY PHASE

**Phase 1 (Backend File Ops):**
- @python-expert - File I/O, pathlib, security
- @test-driven-development - Write tests first
- @security-auditor - Path validation, sandboxing
- @fastapi-expert - Endpoint design

**Phase 2 (Backend Git):**
- @python-expert - GitPython integration
- @git-expert - Git operations patterns
- @test-driven-development
- @database-admin - Schema updates

**Phase 3 (Backend MCP):**
- @mcp-server-architect - MCP protocol
- @mcp-integration-engineer - Connection handling
- @python-expert
- @security-engineer - API key encryption

**Phase 4 (Backend Advanced):**
- @python-expert - File scanning, subprocess
- @ai-engineer - Thinking capture patterns
- @system-architect - Host integration design

**Phase 5 (Frontend UI):**
- @react-native-expert - RNR integration
- @tailwind-expert - NativeWind configuration
- @ui-ux-designer - Theme design
- @css-expert - Flat black aesthetic

**Phase 6 (Frontend Screens):**
- @react-native-expert - Screen implementation
- @typescript-expert - Type safety
- @frontend-architect - Data flow design

**Phase 7 (Tool Display):**
- @react-native-expert
- @ui-ux-designer - Collapsible UI
- @frontend-developer - Component integration

**Phase 8 (Integration):**
- @debugger - Integration issues
- @quality-engineer - End-to-end testing
- @ios-simulator-expert - IDB automation

**Phase 9 (Advanced):**
- @ai-engineer - Thinking display
- @system-architect - Skills/agents integration

---

## MCP SERVERS TO LEVERAGE

**During Development:**
- @shadcn-ui - Get component examples and patterns
- @Context7 - Access React Native / FastAPI docs on demand
- @tavily - Research best practices during implementation
- @github - Push commits, create PRs

**For Feature Implementation:**
- @mcp-git - Validate git operations
- @file-operations (if exists) - Validate file ops

**For Testing:**
- @playwright - E2E testing strategies
- @expo-mcp - iOS simulator automation

---

## TECHNICAL SPECIFICATIONS

### Flat Black Theme Exact Colors

**Global CSS Variables:**
```
--background: #0a0a0a (slightly warm black)
--foreground: #ffffff (pure white)
--card: #1a1a1a (elevated surfaces)
--card-foreground: #ffffff
--primary: #4ecdc4 (teal accent - unchanged)
--primary-foreground: #0a0a0a
--secondary: #2a2a2a (subtle elements)
--secondary-foreground: #ffffff
--muted: #3a3a3a (disabled/muted)
--muted-foreground: #6b7280
--border: #2a2a2a (subtle borders)
--input: #1a1a1a
--ring: #4ecdc4 (focus ring)
--destructive: #ef4444 (red-500)
--destructive-foreground: #ffffff
```

### Component Specifications

**Button:**
- Primary: bg-primary text-primary-foreground
- Secondary: bg-secondary text-secondary-foreground
- Ghost: transparent hover:bg-secondary/50
- Destructive: bg-destructive
- Sizes: sm (32px), md (40px), lg (48px)
- Border radius: 6px (subtle, not too rounded)

**Card:**
- Background: bg-card (#1a1a1a)
- Border: 1px border-border (#2a2a2a)
- Padding: p-4 (16px)
- Border radius: rounded-lg (12px)
- Shadow: subtle (elevation-2)

**Input:**
- Background: bg-input (#1a1a1a)
- Border: border-border
- Focus: ring-2 ring-ring (teal)
- Text: text-foreground (white)
- Placeholder: text-muted-foreground (gray)
- Height: h-10 (40px)

**Text:**
- Default: text-foreground (white)
- Muted: text-muted-foreground (gray)
- Sizes: text-xs through text-4xl
- Weights: 300, 400, 500, 600, 700

### Backend API Response Formats

**Success Response Standard:**
```json
{
  "success": true,
  "data": { /* actual data */ }
}
```

**Error Response Standard:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

**Pagination Standard:**
```json
{
  "data": [],
  "pagination": {
    "total": 100,
    "page": 1,
    "page_size": 20,
    "has_next": true
  }
}
```

---

## TESTING REQUIREMENTS

### Backend Testing (pytest)

**Coverage Requirements:**
- Services: 90%+ line coverage
- APIs: 85%+ line coverage
- Models: 95%+ line coverage

**Test Categories:**
1. Unit tests (services/*.py) - Test each method
2. Integration tests (api/*.py) - Test endpoints
3. Database tests (models, CRUD)
4. Security tests (path traversal, injection)
5. Performance tests (file ops <100ms, git ops <500ms)

**Test Fixtures:**
- Git repository with commits
- File tree with various file types
- Mock MCP server
- Database with sample data

### Frontend Testing (IDB + Manual)

**Automated Tests (IDB):**
- Screen navigation flow
- Button interactions
- Form submissions
- List scrolling
- Search functionality

**Manual Tests:**
- Visual inspection (theme)
- Animation smoothness
- Keyboard behavior
- Gesture recognition
- Accessibility

**Screenshot Tests:**
- All screens in both empty and populated states
- All components in all variants
- Error states
- Loading states

---

## DOCUMENTATION REQUIREMENTS

### Update After Each Phase:

**README.md:**
- Add v2.0 features section
- Update architecture diagram
- List new dependencies
- Update quick start

**CLAUDE.md:**
- Document file ops API usage
- Document git ops API usage
- Document MCP management
- Code examples for each feature

**API Documentation:**
- OpenAPI/Swagger spec (auto-generated)
- Endpoint descriptions
- Request/response examples
- Error codes reference

**User Guide:**
- How to browse files
- How to use git features
- How to configure MCPs
- How to edit system prompts

---

## IMPLEMENTATION SEQUENCE

**Week 1:**
- Phase 1: Backend file ops (B1)
- Phase 2: Backend git ops (B2)
- Phase 3: Backend MCP (B3)

**Week 2:**
- Phase 4: Backend advanced (B4)
- Phase 5: Frontend UI rebuild (F1)

**Week 3:**
- Phase 6: Frontend new screens (F2)
- Phase 7: Tool display (I1)

**Week 4:**
- Phase 8: Integration testing (I2)
- Phase 9: Advanced features (A1)
- Final validation and documentation

---

## SUCCESS CRITERIA FOR v2.0

**Must Have:**
1. ✅ All 9 validation gates passed
2. ✅ Flat black theme throughout
3. ✅ File operations working (browse, read, write)
4. ✅ Git operations working (status, commit, log)
5. ✅ MCP management functional
6. ✅ System prompts editable
7. ✅ Tool executions visible in UI
8. ✅ Projects screen shows host projects
9. ✅ Code viewer with syntax highlighting
10. ✅ All TypeScript compiles (0 errors)
11. ✅ All pytest tests pass (150+)
12. ✅ IDB automation tests pass (50+)

**Nice to Have:**
- Thinking/reasoning display
- Skills management
- Agents management
- Hooks configuration
- Advanced git (branches, remotes)

---

## ESTIMATED TOKEN BREAKDOWN

**Phase 1 (File Ops):** 80-100k
**Phase 2 (Git Ops):** 70-90k
**Phase 3 (MCP):** 60-80k
**Phase 4 (Advanced):** 50-70k
**Phase 5 (UI Rebuild):** 100-120k
**Phase 6 (New Screens):** 80-100k
**Phase 7 (Tool Display):** 40-50k
**Phase 8 (Integration):** 60-80k
**Phase 9 (Advanced):** 50-70k

**Total:** 590-760k tokens
**Available:** 396k tokens

**Approach:** Implement Phases 1-8 fully (core features), Phase 9 if tokens allow.

---

**Plan Status:** COMPREHENSIVE SPECIFICATION COMPLETE
**Next Step:** Invoke superpowers:executing-plans to begin Phase 1
**Saved:** docs/plans/2025-11-01-v2-complete-feature-expansion.md

---

## APPENDIX: Research Sources

**React Native UI:**
- React Native Reusables (https://reactnativereusables.com)
- GlueStack UI v2
- shadcn/ui dark theme patterns
- NativeWind v4 documentation

**Claude Code CLI:**
- Official docs: https://docs.claude.com/en/docs/claude-code
- MCP integration patterns
- Hook system architecture
- Project discovery mechanisms

**Python Backend:**
- FastAPI file upload/download patterns
- GitPython library documentation
- Secure subprocess execution (shlex, pathlib)
- File watching with watchdog

**Testing:**
- pytest best practices
- FastAPI TestClient patterns
- IDB UI automation for React Native
- Screenshot comparison testing
