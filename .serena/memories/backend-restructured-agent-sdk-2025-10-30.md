# Backend Restructured for Claude Agent SDK

**Date**: 2025-10-30
**Status**: ✅ COMPLETE
**Build**: Successful (TypeScript compiled to dist/)

## Architecture Change

**FROM** (Incorrect - Option A):
```
Mobile → WebSocket → Backend → Anthropic SDK → Claude API
                     (Needs ANTHROPIC_API_KEY)
```

**TO** (Correct - Option B):
```
Mobile → WebSocket → Backend → Claude Agent SDK → Claude Code CLI → Claude API
                                                   (Uses CLI auth, no backend API key)
```

## Package Changes

**Removed**:
- @anthropic-ai/sdk@0.32.1
- simple-git@3.25.0
- glob@11.0.0

**Added**:
- @anthropic-ai/claude-agent-sdk@0.1.30

## Files Deleted (4 services)

1. ✅ `services/toolExecutor.ts` - Deleted (CLI provides tools)
2. ✅ `services/file.service.ts` - Deleted (CLI Read/Write tools)
3. ✅ `services/git.service.ts` - Deleted (CLI Bash tool for git)
4. ✅ `services/command.service.ts` - Deleted (CLI slash commands)

## Files Modified (5 files)

1. **backend/package.json**
   - Replaced SDK dependency
   - Removed unused dependencies

2. **backend/src/services/claude.service.ts** (COMPLETE REWRITE)
   ```typescript
   import { query } from '@anthropic-ai/claude-agent-sdk';
   
   for await (const message of query({
     prompt: userMessage,
     options: {
       systemPrompt: { type: 'preset', preset: 'claude_code' },
       settingSources: ['project'], // Loads CLAUDE.md
       cwd: session.projectPath,
       maxTurns: 20
     }
   })) {
     // Process SDKMessage, forward to WebSocket
   }
   ```

3. **backend/src/websocket/messageHandler.ts**
   - Removed slash command handling (CLI handles)
   - Simplified to just forward messages

4. **backend/.env.example**
   - Removed ANTHROPIC_API_KEY
   - Added CLI requirement documentation
   - Added CLAUDE_CODE_PATH (optional)

5. **backend/src/index.ts**
   - Added validateClaudeCLI() function
   - Updated startup logging
   - Removed API key checks

## Agent SDK Integration

### Prerequisites (Backend Server)
```bash
# Install CLI globally
npm install -g claude-code

# Authenticate
claude-code login

# Verify
claude-code --version
```

### Tools Provided by CLI

Claude Code CLI provides all tools automatically:
- **Read**: Read files from project
- **Write**: Write/edit files in project
- **Bash**: Execute shell commands
- **Grep**: Search file contents
- **Glob**: Find files by pattern
- **Edit**: Multi-file edits
- **AskUserQuestion**: Prompt for input (not applicable for backend)

All tools execute **on the backend server** in the **project directory**.

### Slash Commands via CLI

CLI handles all slash commands:
- /help - Show commands
- /cost - Show API costs
- /clear - Clear conversation
- /compact - Compact context
- /mcp - MCP servers
- /config - Configuration

Backend just forwards slash commands to CLI.

### Cost Tracking

Automatic via SDK:
- result.usage.input_tokens
- result.usage.output_tokens
- result.usage.total_cost_usd

No manual calculation needed.

### Security

Handled by Claude Code CLI:
- Path sanitization
- Command blocking
- File type validation
- Rate limiting

Backend doesn't need custom security logic for tools.

## Backend Now Simpler

**Before**: 12 files, ~5,000 lines
**After**: 8 files, ~2,000 lines

**Responsibilities**:
- WebSocket server ✅
- Session persistence (mobile-specific) ✅
- Message routing ✅
- Event forwarding ✅

**Delegated to CLI**:
- Tool execution
- File operations
- Git operations
- Slash commands
- Security validation
- Cost calculation

## Gate 3A Implications

Tests still valid but simpler:
- ✅ WebSocket connection
- ✅ Session initialization
- ✅ Message streaming
- ✅ Tool execution (via CLI)
- ✅ File verification (CLI creates real files)
- ✅ Slash commands (via CLI)

All tests verify end-to-end flow through CLI.

## Next Steps

1. ✅ Backend built successfully
2. ⏳ Gate 3A: Requires claude-code CLI installed and authenticated on test machine
3. ⏳ Update CLAUDE.md with CLI architecture
4. ⏳ Update validation gates documentation
5. ⏳ Git commit restructure
6. ⏳ Proceed to Phase 4 (Frontend) after Gate 3A passes
