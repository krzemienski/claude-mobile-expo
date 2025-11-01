# MCP Ecosystem Complete Reference - Claude Code Mobile

## Available MCP Servers: 11

### PRIMARY MCPS

**1. Serena MCP** - Code operations (create_text_file, find_symbol, execute_shell_command)
**2. xc-mcp** - iOS automation (simctl-*, xcodebuild-*, screenshot, idb-*)
**3. Git MCP** - Version control (git_add, git_commit, git_status)
**4. Memory MCP** - Knowledge graph (create_entities, add_observations)
**5. Context7 MCP** - Documentation (get-library-docs) [already used]

### USAGE PATTERNS

**Creating Files** - Use Serena:
```
mcp__serena__create_text_file({
  relative_path: "backend/src/index.ts",
  content: "import express..."
})
```

**Git Operations** - Use Git MCP:
```
mcp__git__git_add({repo_path: ".", files: ["backend/src/index.ts"]})
mcp__git__git_commit({repo_path: ".", message: "feat: implement server"})
```

**iOS Build** - Use xc-mcp:
```
mcp__xc-mcp__xcodebuild-build({
  projectPath: "/Users/nick/Desktop/claude-mobile-expo/mobile",
  scheme: "ClaudeCodeMobile"
})
```

**Screenshots** - Use xc-mcp:
```
mcp__xc-mcp__screenshot({
  appName: "ClaudeCodeMobile",
  screenName: "Chat",
  state: "empty"
})
```

**Saving Knowledge** - Use Serena write_memory:
```
mcp__serena__write_memory({
  memory_name: "architecture-decisions",
  content: "Backend uses Express + ws..."
})
```

## All Phases Use MCP Tools

Phase -1: Serena (skills/scripts), Memory (research)
Phase 0: Context7 (docs), Memory (storage)
Phase 1: Sequential (thinking), Memory (decisions)
Phase 2-4: Serena (files), Git MCP (commits)
Gate 4A: xc-mcp (iOS), Serena (scripts)
Phase 5-12: Serena (all ops), Git MCP (all commits)

## Token Count: ~300 tokens
