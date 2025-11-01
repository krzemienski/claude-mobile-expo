# Complete MCP Integration Strategy - Claude Code Mobile

**Date**: 2025-10-30  
**Status**: Production-Ready MCP-First Architecture

---

## 🎯 Executive Summary

This project leverages **5 Model Context Protocol (MCP) servers** for comprehensive automation:

1. ✅ **Expo MCP Server** (Official) - Expo operations & autonomous testing
2. ✅ **xc-mcp** - iOS/Xcode build operations
3. ✅ **Serena MCP** - Code and file operations
4. ✅ **Git MCP** - Version control
5. ✅ **Memory MCP** - Knowledge graph

Optional: **mobile-mcp** (2.3k stars) for cross-platform automation

---

## 📦 MCP Server Details

### 1. Expo MCP Server (Primary for Expo Operations)

**Setup**: COMPLETED ✅
```bash
# Installation
npx expo install expo-mcp --dev

# Authentication
npx expo whoami  # krzemienski

# Enable local capabilities
EXPO_UNSTABLE_MCP_SERVER=1 npx expo start
```

**Capabilities**:

**Server Tools** (No dev server needed):
- `search_documentation` - Search Expo docs with natural language
- `learn` - Get how-to guides for Expo topics
- `add_library` - Install packages with `npx expo install`
- `generate_agents_md` - Create AGENTS.md
- `generate_claude_md` - Create CLAUDE.md (Claude Code only)

**Local Tools** (Requires Metro with EXPO_UNSTABLE_MCP_SERVER=1):
- `automation_take_screenshot` - Capture full device screenshots
- `automation_tap` - Tap screen coordinates
- `automation_find_view_by_testid` - Find views by testID
- `automation_tap_by_testid` - Tap elements by testID
- `automation_take_screenshot_by_testid` - Screenshot specific views
- `open_devtools` - Open React Native DevTools
- `expo_router_sitemap` - Show app routes

**Usage Examples**:
```
"Search the Expo docs for implementing deep linking"
"Add SQLite with basic CRUD operations"
"Take a screenshot and verify the blue circle renders correctly"
"Tap the button with testID 'send-button' and verify the action"
"Generate an AGENTS.md file for the project"
```

---

### 2. xc-mcp (iOS/Xcode Operations)

**Purpose**: Build process and iOS simulator management

**Key Tools**:
- `xcodebuild-build` - Build iOS app with Xcode
- `xcodebuild-clean` - Clean build artifacts
- `simctl-boot` - Boot iOS simulator
- `simctl-install` - Install app on simulator
- `simctl-launch` - Launch installed app
- `simctl-shutdown` - Shutdown simulator

**When to Use**:
- Building the iOS app
- Managing simulators (boot, shutdown, create)
- Xcode project operations
- NOT for testing (use expo-mcp instead)

---

### 3. Serena MCP (File & Code Operations)

**Key Tools**:
- `create_text_file` - Create/overwrite files
- `read_file` - Read file contents
- `find_symbol` - Find code symbols (classes, functions)
- `replace_symbol_body` - Replace function/class implementations
- `replace_regex` - Regex-based code edits
- `write_memory` - Save project knowledge
- `read_memory` - Retrieve project knowledge

**When to Use**:
- Creating ANY file (TypeScript, config, docs)
- Reading files for analysis
- Code editing and refactoring
- Saving decisions/progress to memory

---

### 4. Git MCP (Version Control)

**Key Tools**:
- `git_status` - Show git status
- `git_add` - Stage files
- `git_commit` - Create commits
- `git_log` - View history
- `git_create_branch` - Create branches
- `git_checkout` - Switch branches

**When to Use**:
- ALL git operations instead of bash git commands
- More structured than raw git CLI

---

## 🔄 Complete Development Workflow

### Phase 1: Planning & Design
1. **Research**: Tavily/Firecrawl for ecosystem research
2. **Thinking**: Sequential MCP for deep analysis
3. **Memory**: Save architecture decisions

### Phase 2: Implementation

**Creating Files**:
```typescript
// Use Serena MCP
mcp__serena__create_text_file({
  relative_path: "app/screens/ChatScreen.tsx",
  content: "[Complete React Native code]"
});
```

**Installing Packages**:
```
// Use expo-mcp (via prompt)
"Add @react-navigation/native and show me how to set it up"
// expo-mcp installs package AND provides usage documentation
```

**Building iOS**:
```typescript
// 1. Generate native project (bash)
npx expo prebuild --platform ios

// 2. Build with xc-mcp
mcp__xc-mcp__xcodebuild-build({
  projectPath: "/Users/nick/Desktop/claude-mobile-expo/claude-code-mobile/ios",
  scheme: "claudecodemobile"
});

// 3. Boot simulator (xc-mcp)
mcp__xc-mcp__simctl-boot({deviceId: "iPhone 14"});

// 4. Install app (xc-mcp)
mcp__xc-mcp__simctl-install({
  udid: "booted",
  appPath: ".../Debug-iphonesimulator/claudecodemobile.app"
});
```

**Starting Development Server**:
```bash
# Use Bash tool with MCP flag
EXPO_UNSTABLE_MCP_SERVER=1 npx expo start
```

**Testing with Expo MCP** (via prompts):
```
"Take a screenshot of the Chat screen"
"Tap the button with testID 'send-message'"
"Find the view with testID 'message-list' and verify it's visible"
"Take a screenshot of the input field after tapping it"
```

**Version Control**:
```typescript
// Use Git MCP
mcp__git__git_add({repo_path: ".", files: ["app/screens/ChatScreen.tsx"]});
mcp__git__git_commit({repo_path: ".", message: "feat: implement ChatScreen"});
```

---

## 🧪 Autonomous Visual Testing Pattern

**Revolutionary Capability**: AI can validate its own UI work using expo-mcp

### Example: Validate Button Renders Correctly

**Traditional Approach** (Manual):
1. Developer writes button code
2. Developer builds app
3. Developer manually checks simulator
4. Developer confirms looks correct
5. Time: 5-10 minutes

**Expo MCP Approach** (Autonomous):
1. AI writes button code with testID
2. AI: "Take screenshot and verify blue button renders at bottom"
3. expo-mcp takes screenshot
4. AI analyzes screenshot: "Button present? Correct color? Correct position?"
5. If incorrect: AI modifies code, repeats step 2
6. If correct: AI: "Tap button with testID 'submit-btn'"
7. expo-mcp taps button
8. AI: "Take screenshot and verify button pressed state"
9. AI analyzes: "Button shows pressed state?"
10. Test complete - Time: 30 seconds

**Benefits**:
- ✅ Zero human intervention
- ✅ Instant visual feedback
- ✅ AI fixes its own mistakes
- ✅ Repeatable and reliable
- ✅ Can run 100+ visual tests autonomously

---

## 📋 Validation Gate Updates

### Gate 3A: Backend (No Change)
- Uses Bash for curl/wscat
- Tests WebSocket protocol
- Functional testing

### Gate 4A: Frontend (MAJOR UPDATE)

**Setup**:
```bash
# 1. Install expo-mcp ✅
npx expo install expo-mcp --dev

# 2. Start Metro with MCP ✅
EXPO_UNSTABLE_MCP_SERVER=1 npx expo start

# 3. Build and run
npx expo run:ios
```

**Automated Tests** (via expo-mcp):
```
Test 1: "Take screenshot of Chat screen empty state"
Test 2: "Verify gradient background renders correctly"
Test 3: "Find input field with testID 'message-input'"
Test 4: "Tap input field and verify keyboard appears"
Test 5: "Take screenshot of slash menu when typing '/'"
Test 6: "Tap Settings button and verify Settings screen loads"
Test 7: "Navigate through all 5 screens and screenshot each"
```

**AI Autonomous Validation**:
- AI requests screenshots via expo-mcp
- AI analyzes visually (multimodal)
- AI confirms UI correctness
- AI tests interactions
- AI determines pass/fail
- AI fixes issues if found

### Gates 6A-E: Integration (ENHANCED)

**Gate 6A: Connection**
```
"Take screenshot of Chat screen connection status"
AI verifies green dot shows "Connected"
```

**Gate 6B: Message Flow**
```
"Type 'Hello Claude' in message input"
"Tap send button"
"Take screenshot and verify message appears"
"Take screenshot and verify assistant response streams in"
```

**Gate 6C: Tool Execution**
```
"Type 'Create a test.txt file'"
"Tap send"
"Take screenshot and verify tool execution card appears"
"Verify tool result shows in screenshot"
```

All gates now have VISUAL VERIFICATION via expo-mcp!

---

## 🎓 Skills Updated with Expo MCP

### claude-mobile-ios-testing (Updated)
**Primary Tool**: expo-mcp automation_*
**Secondary**: xc-mcp (for builds)

### claude-mobile-metro-manager (Updated)
**Command**: EXPO_UNSTABLE_MCP_SERVER=1 npx expo start
**Why**: Enables expo-mcp local capabilities

### react-native-expo-development (Updated)
**Pattern**: Use expo-mcp add_library for packages
**Example**: "Add camera with expo-mcp and show usage"

---

## 🚀 Final Architecture

```
┌─────────────────────────────────────────┐
│ Claude Code with 5 MCP Servers          │
├─────────────────────────────────────────┤
│ 1. expo-mcp (Expo operations)           │
│ 2. xc-mcp (iOS builds)                  │
│ 3. Serena MCP (files/code)              │
│ 4. Git MCP (version control)            │
│ 5. Memory MCP (knowledge)               │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│ Development Workflow                     │
├─────────────────────────────────────────┤
│ Serena → Create files                   │
│ expo-mcp → Install packages             │
│ Bash → Build commands                   │
│ xc-mcp → Xcode build                    │
│ expo-mcp → Test & verify                │
│ Git MCP → Commit                        │
└─────────────────────────────────────────┘
            ↓
┌─────────────────────────────────────────┐
│ Autonomous Validation                    │
├─────────────────────────────────────────┤
│ expo-mcp → Screenshot                   │
│ AI → Analyze visually                   │
│ expo-mcp → Tap & test                   │
│ AI → Verify interactions                │
│ expo-mcp → Fix if needed                │
│ AI → Re-verify                          │
│ → PASS when perfect                     │
└─────────────────────────────────────────┘
```

---

**This is the most advanced React Native development setup possible in 2025.**
