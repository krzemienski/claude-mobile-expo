# Changelog

All notable changes to Claude Code Mobile backend.

## [2.0.0] - 2025-11-01

### Added - Complete v2.0 Backend Implementation

**File Operations** (Phase 1):
- FileOperationsService with 7 methods
- 7 REST API endpoints for file management
- Security: Path validation prevents directory traversal
- Glob pattern support (*.py, **/*.ts, etc.)
- File metadata extraction
- File watching (basic implementation)

**Git Integration** (Phase 2):
- GitOperationsService using GitPython
- 8 Git API endpoints (status, commit, log, diff, branches, etc.)
- Create commits from mobile app
- View commit history and diffs
- Branch management

**MCP Server Management** (Phase 3):
- MCP database table with encryption
- MCPManagerService for CRUD operations
- 9 MCP API endpoints
- Fernet encryption for API keys
- Claude CLI config sync

**System Prompts** (Phase 4):
- PromptManagerService with templates
- 5 Prompts API endpoints
- 6 built-in templates (Coding Assistant, Code Reviewer, etc.)
- CLAUDE.md loading as context
- Thinking/reasoning capture in parser
- Tool event forwarding via SSE

**Additional Features**:
- Session statistics and analytics
- File upload (multipart/form-data)
- Git remote operations (safety stubs)
- Caching service
- Batch operations API
- Unified search
- Webhooks for notifications
- Admin endpoints (cache, system info)

**Frontend**:
- Flat black theme (#0a0a0a, #1a1a1a, #2a2a2a)
- Removed ALL LinearGradient components
- 3 new screens (Projects, MCP, Git)
- HTTP client methods for all new APIs
- Tool display integrated in MessageBubble
- SSE event parsing (tool_use, tool_result, thinking)

### Changed

**Theme**:
- Purple gradient → Flat black (VS Code aesthetic)
- Teal accent preserved (#4ecdc4)
- Professional code editor look

**Configuration**:
- Port 8000 → 8001
- HTTP client now public for screen access

### Validation

**Systematic Testing**:
- Gate B1: File operations (10/10 PASSED)
- Gate B2: Git operations (10/10 PASSED)
- Gate B3: MCP management (10/10 PASSED)
- Gate B4: Advanced backend (10/10 PASSED)

**Test Scripts**:
- validate-b1.sh through validate-b4.sh
- validate-all-gates.sh (master script)
- comprehensive-api-tests.sh
- error-handling-tests.sh

**Total**: 85+ tests, all passing

### Security

- Path traversal prevention (validated)
- API key encryption (Fernet)
- HTTP error codes (404, 403, 400, 500)
- Security tests included in validation

### Documentation

- API-REFERENCE.md (40+ endpoints)
- ARCHITECTURE.md (system design)
- TESTING.md (validation guide)
- DEPLOYMENT.md (deployment guide)
- QUICKSTART.md (5-minute setup)
- 10+ additional documentation files
- 4,500+ lines of documentation

### Technical

**Backend**:
- 49 Python files
- 6,654 lines of code
- 8 services
- 40+ API endpoints
- SQLite database with 5 tables

**Frontend**:
- 28 TypeScript files
- 8 screens with flat black theme
- Backend API integration
- Tool display ready

## [1.0.0] - 2025-11-01 (Before this session)

### Initial Release

- WebSocket → HTTP/SSE migration
- Python FastAPI backend
- React Native mobile app
- Basic chat functionality
- XHR-based SSE streaming (React Native compatible)

---

**Version 2.0.0 represents a massive expansion** from basic chat app to full-featured Claude Code mobile experience with file operations, git integration, MCP management, and comprehensive documentation.
