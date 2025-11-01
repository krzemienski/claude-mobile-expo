# Claude Code Mobile - Complete Execution Checklist

**Date**: 2025-10-30  
**Status**: PRODUCTION-READY  
**Approach**: MCP-First, Skills-Driven, Research-Validated

---

## 🎯 **MASTER EXECUTION SEQUENCE**

This checklist consolidates ALL documentation into a single execution path.

---

## PHASE -1: FOUNDATION (Skills, Scripts, Research) ✅ READY

### ☐ Task -1.1: Verify Research Complete
- ✅ Read from Serena Memory: `technology-research-2025`
- ✅ Read from Serena Memory: `expo-mcp-complete-integration`  
- ✅ Read from Serena Memory: `mcp-ecosystem-reference`
- ✅ Review: `docs/MCP-TOOLS-SURVEY.md`
- ✅ Review: `docs/CUSTOM-SKILLS-DESIGN.md`
- ✅ Review: `docs/SHELL-SCRIPTS-DESIGN.md`

### ☐ Task -1.2: Create 7 Custom Skills

**Follow @writing-skills methodology** (RED-GREEN-REFACTOR for each):

#### Skill 1: claude-mobile-ios-testing
- ☐ RED: Run baseline scenario without skill
- ☐ GREEN: Create via Serena:
```typescript
mcp__serena__create_text_file({
  relative_path: ".claude/skills/claude-mobile-ios-testing/SKILL.md",
  content: "[Complete skill from CUSTOM-SKILLS-DESIGN.md]"
});
```
- ☐ REFACTOR: Test with @testing-skills-with-subagents
- ☐ Git commit via Git MCP

#### Skill 2-7: Repeat Pattern
- ☐ claude-mobile-metro-manager
- ☐ claude-mobile-validation-gate
- ☐ react-native-expo-development
- ☐ websocket-integration-testing
- ☐ anthropic-streaming-patterns
- ☐ claude-mobile-cost-tracking

### ☐ Task -1.3: Create 9 Shell Scripts

**All via Serena create_text_file** (from SHELL-SCRIPTS-DESIGN.md):

- ☐ scripts/start-metro.sh (with EXPO_UNSTABLE_MCP_SERVER=1)
- ☐ scripts/stop-metro.sh
- ☐ scripts/build-ios.sh
- ☐ scripts/capture-screenshots.sh
- ☐ scripts/test-websocket.sh
- ☐ scripts/start-integration-env.sh
- ☐ scripts/stop-integration-env.sh
- ☐ scripts/validate-gate-3a.sh
- ☐ scripts/validate-gate-4a.sh

**Make executable**:
```bash
chmod +x scripts/*.sh
```

### ☐ Task -1.4: Git Commit Foundation
```typescript
mcp__git__git_add({repo_path: ".", files: [".claude/skills/", "scripts/"]});
mcp__git__git_commit({repo_path: ".", message: "feat: create foundation skills and automation scripts"});
```

---

## PHASE 0: DOCUMENTATION ASSEMBLY ✅ COMPLETE

### ☐ Verify Documentation in Memory
- ✅ ReactNativeDocumentation (Memory MCP)
- ✅ ExpoDocumentation (Memory MCP)
- ✅ All framework docs already pulled
- ✅ expo-mcp provides live doc access

---

## PHASE 1: ARCHITECTURE DESIGN ✅ COMPLETE

### ☐ Review Architecture Decisions
- ✅ Saved in Serena Memory
- ✅ Sequential thinking 300+ steps completed
- ✅ Research-validated technology choices

---

## PHASE 2: GIT INITIALIZATION 🔄 PARTIALLY DONE

### ☐ Initialize Repository
```bash
cd /Users/nick/Desktop/claude-mobile-expo
git init
```

### ☐ Create .gitignore via Serena
```typescript
mcp__serena__create_text_file({
  relative_path: ".gitignore",
  content: "[From framework plan]"
});
```

### ☐ Create Directory Structure
```bash
mkdir -p backend/src/{websocket,services,routes,middleware,utils,types}
mkdir -p backend/{logs,sessions}
mkdir -p shared
mkdir -p docs/validation
mkdir -p scripts
```

### ☐ Git Commit
```typescript
mcp__git__git_commit({repo_path: ".", message: "chore: initialize project structure"});
```

---

## PHASE 3: BACKEND IMPLEMENTATION 📝 READY TO EXECUTE

**Reference**: Agent outputs have complete code for Tasks 3.2-3.11

### Pattern for ALL Backend Files:

**Step 1**: Create via Serena
```typescript
mcp__serena__create_text_file({
  relative_path: "backend/src/[filename].ts",
  content: "[Complete TypeScript from agent output or spec]"
});
```

**Step 2**: Install dependencies
```bash
cd backend && npm install
```

**Step 3**: Build
```bash
npm run build
```

**Step 4**: Git commit
```typescript
mcp__git__git_commit({repo_path: ".", message: "feat(backend): [description]"});
```

### ☐ Task 3.2: Core Infrastructure
- ☐ logger.ts (via Serena)
- ☐ errorHandler.ts (via Serena)
- ☐ rateLimiter.ts (via Serena)
- ☐ index.ts (via Serena)
- ☐ Git commit

### ☐ Task 3.3: WebSocket Server
- ☐ server.ts (via Serena)
- ☐ sessionManager.ts (via Serena)
- ☐ messageHandler.ts (via Serena)
- ☐ Git commit

### ☐ Task 3.4: Claude API Integration
**INVOKE**: @anthropic-streaming-patterns
- ☐ claude.service.ts (via Serena) - with streaming patterns
- ☐ toolExecutor.ts (via Serena) - 6 tools
- ☐ Git commit

### ☐ Task 3.5: File Service
- ☐ file.service.ts (via Serena) - with path sanitization
- ☐ Git commit

### ☐ Task 3.6: Git Service
- ☐ git.service.ts (via Serena) - simple-git wrapper
- ☐ Git commit

### ☐ Task 3.7: Command Service
- ☐ command.service.ts (via Serena) - slash commands
- ☐ Git commit

### ☐ Task 3.8: REST API
- ☐ sessions.routes.ts (via Serena)
- ☐ routes/index.ts (via Serena)
- ☐ Git commit

### ☐ Task 3.9: Type Definitions
- ☐ types/models.ts (via Serena)
- ☐ types/websocket.ts (via Serena)
- ☐ types/api.ts (via Serena)
- ☐ Git commit

### ☐ Task 3.10: Configuration
- ☐ .env.example (via Serena)
- ☐ config/environment.ts (via Serena)
- ☐ Git commit

### ☐ Task 3.11: Cost Tracking (NEW from research)
- ☐ cost.service.ts (via Serena) - Claude API cost tracking
- ☐ Integrate with claude.service.ts
- ☐ Add /cost slash command
- ☐ Git commit

---

## VALIDATION GATE 3A: BACKEND TESTING 🧪 AUTOMATED

**Reference**: `docs/validation/GATE-3A-BACKEND-FUNCTIONAL-TESTING.md`

**INVOKE**: @websocket-integration-testing

### ☐ Setup
```bash
cp backend/.env.example backend/.env
# Add your ANTHROPIC_API_KEY
```

### ☐ Build
```bash
cd backend && npm run build
```

### ☐ Start Server
```bash
npm start
```

### ☐ Run Automated Tests
**INVOKE**: @claude-mobile-validation-gate
```bash
./scripts/test-websocket.sh
./scripts/validate-gate-3a.sh
```

### ☐ Verify All Tests Pass
- ✅ TypeScript compilation
- ✅ Server startup
- ✅ Health endpoint
- ✅ WebSocket connection
- ✅ Session initialization
- ✅ Message streaming
- ✅ All 6 tools execute
- ✅ Slash commands work
- ✅ REST API functional

### ☐ Save Results to Serena Memory
```typescript
mcp__serena__write_memory({
  memory_name: "gate-3a-results",
  content: "All tests passed. Backend ready for integration."
});
```

**🚫 HARD STOP**: Do NOT proceed to Phase 4 until ALL Gate 3A tests pass.

---

## PHASE 4: FRONTEND IMPLEMENTATION 📱 READY TO EXECUTE

**Reference**: Agent outputs + spec + expo-mcp

**INVOKE**: @react-native-expo-development (for all components)

### Pattern for ALL Frontend Files:

**Step 1**: Create via Serena
```typescript
mcp__serena__create_text_file({
  relative_path: "claude-code-mobile/app/[filename].tsx",
  content: "[Complete React Native code]"
});
```

**Step 2**: Install packages via expo-mcp
```
"Add [package-name] and show me how to use it"
```

**Step 3**: Git commit
```typescript
mcp__git__git_commit({repo_path: ".", message: "feat(mobile): [description]"});
```

### ☐ Task 4.1: Project Setup
- ✅ Already done (claude-code-mobile/ exists)
- ☐ Verify package.json has all dependencies
- ☐ Git commit if updated

### ☐ Task 4.2: Theme System
- ☐ src/constants/theme.ts (via Serena) - complete design system
- ☐ Git commit

### ☐ Task 4.3: Type Definitions
- ☐ src/types/models.ts (via Serena)
- ☐ src/types/websocket.ts (via Serena)
- ☐ src/types/navigation.ts (via Serena)
- ☐ Git commit

### ☐ Task 4.4: WebSocket Service
- ☐ src/services/websocket.service.ts (via Serena) - Rocket.Chat patterns
- ☐ Git commit

### ☐ Task 4.5: Zustand Store
- ☐ src/store/useAppStore.ts (via Serena) - with AsyncStorage persistence
- ☐ Git commit

### ☐ Task 4.6: Core Components
**INVOKE**: @react-native-expo-development
- ☐ MessageBubble.tsx (Gifted Chat patterns)
- ☐ ToolExecutionCard.tsx
- ☐ StreamingIndicator.tsx (Reanimated)
- ☐ SlashCommandMenu.tsx
- ☐ ConnectionStatus.tsx (Reanimated)
- ☐ FileItem.tsx
- ☐ Git commit

### ☐ Task 4.7-4.11: Screens
**INVOKE**: @react-native-expo-development (for each)
- ☐ ChatScreen.tsx (via Serena)
- ☐ SettingsScreen.tsx (via Serena)
- ☐ FileBrowserScreen.tsx (via Serena)
- ☐ CodeViewerScreen.tsx (via Serena)
- ☐ SessionsScreen.tsx (via Serena)
- ☐ Git commits

### ☐ Task 4.12: Navigation
- ☐ AppNavigator.tsx (via Serena) - React Navigation stack
- ☐ Git commit

### ☐ Task 4.13: App Entry
- ☐ App.tsx (via Serena) - with error boundary
- ☐ Git commit

### ☐ Task 4.14: Styling Polish
- ☐ Apply gradient backgrounds
- ☐ Safe area handling
- ☐ Git commit

---

## VALIDATION GATE 4A: FRONTEND TESTING 🎨 AUTONOMOUS

**Reference**: `docs/validation/GATE-4A-FRONTEND-VISUAL-TESTING.md`

**INVOKE**: @claude-mobile-ios-testing, @claude-mobile-metro-manager

### ☐ Setup Metro with expo-mcp
```bash
EXPO_UNSTABLE_MCP_SERVER=1 npx expo start
```
**Status**: ✅ ALREADY RUNNING (PID 94406)

### ☐ Build and Run
```bash
cd claude-code-mobile
npx expo run:ios --device "iPhone 14"
```

### ☐ Autonomous Visual Testing via expo-mcp

**expo-mcp provides these tools automatically when Metro running with MCP:**

Test each screen via natural language:
```
"Take screenshot of Chat screen empty state"
"Tap the button with testID 'send-button'"
"Verify gradient background renders correctly"
"Find input field with testID 'message-input'"
"Take screenshot after tapping input to verify keyboard"
"Navigate to Settings and screenshot"
"Test all 5 screens"
```

### ☐ AI Autonomous Validation
- ☐ expo-mcp: automation_take_screenshot (all screens)
- ☐ AI analyzes screenshots visually
- ☐ expo-mcp: automation_tap_by_testid (test interactions)
- ☐ AI verifies interactions work
- ☐ AI fixes issues if found
- ☐ AI re-validates
- ☐ Loop until perfect

### ☐ Multi-Device Testing
```bash
./scripts/capture-screenshots.sh "iPhone SE"
./scripts/capture-screenshots.sh "iPhone 14"
./scripts/capture-screenshots.sh "iPhone 14 Pro Max"
```

### ☐ Gate Pass Criteria
- ✅ All screenshots show correct UI (AI verified)
- ✅ All interactions work (expo-mcp tested)
- ✅ Navigation works (AI tested)
- ✅ Responsive on all devices
- ✅ No crashes

### ☐ Save Results
```typescript
mcp__serena__write_memory({
  memory_name: "gate-4a-results",
  content: "All visual tests passed. Frontend ready."
});
```

**🚫 HARD STOP**: Do NOT proceed until Gate 4A passes.

---

## PHASE 5: SHARED TYPES 🔗

### ☐ Create Shared Types
```typescript
mcp__serena__create_text_file({
  relative_path: "shared/types.ts",
  content: "[WebSocket message interfaces from both backend and frontend]"
});
```

### ☐ Update Backend Imports
- ☐ Replace local types with shared imports
- ☐ Test compilation

### ☐ Update Frontend Imports  
- ☐ Replace local types with shared imports
- ☐ Test compilation

### ☐ Git Commit
```typescript
mcp__git__git_commit({repo_path: ".", message: "feat: unify types across backend and frontend"});
```

---

## PHASE 6: INTEGRATION 🔌

**INVOKE**: @claude-mobile-validation-gate (for EACH gate)

### ☐ Task 6.1: Integration Setup
```bash
./scripts/start-integration-env.sh
```
This starts: Backend + Metro + iOS app

---

### GATE 6A: CONNECTION TESTING

**expo-mcp autonomous testing**:

```
"Take screenshot of connection status"
AI verifies: Green dot shows "Connected"
```

- ☐ Backend running on port 3001
- ☐ Mobile app running on simulator
- ☐ Settings configured with ws://localhost:3001
- ☐ Connection status: green dot "Connected"
- ☐ expo-mcp screenshot verification
- ☐ Save to Serena memory

---

### GATE 6B: MESSAGE FLOW TESTING

**expo-mcp autonomous testing**:

```
"Type 'Hello Claude' and send"
"Take screenshot showing user message"
"Take screenshot showing assistant response streaming"
"Verify slash command menu appears when typing '/'"
```

- ☐ Message sent appears as user bubble
- ☐ Streaming indicator shows
- ☐ Assistant response appears
- ☐ expo-mcp visual verification of all states
- ☐ Save to Serena memory

---

### GATE 6C: TOOL EXECUTION TESTING

**expo-mcp autonomous testing**:

```
"Type 'Create a test.txt file' and send"
"Screenshot showing tool execution card"
"Verify file created in filesystem"
"Test all 6 tools visually"
```

- ☐ Tool execution card appears
- ☐ Tool results display correctly
- ☐ Actual file operations verified
- ☐ All 6 tools tested
- ☐ expo-mcp visual validation
- ☐ Save to Serena memory

---

### GATE 6D: FILE BROWSER TESTING

**expo-mcp autonomous testing**:

```
"Navigate to File Browser"
"Screenshot file list"
"Tap directory and screenshot"
"Open file in CodeViewer and screenshot"
```

- ☐ Files displayed correctly
- ☐ Directory navigation works
- ☐ File opens in viewer
- ☐ Syntax highlighting works
- ☐ expo-mcp visual validation
- ☐ Save to Serena memory

---

### GATE 6E: SESSION MANAGEMENT

**expo-mcp autonomous testing**:

```
"Create new session"
"Navigate to Sessions screen and screenshot"
"Switch sessions and verify context changes"
"Delete session and verify removal"
```

- ☐ Sessions save to backend
- ☐ Sessions list displays
- ☐ Session switching works
- ☐ Deletion works
- ☐ expo-mcp visual validation
- ☐ Save to Serena memory

---

## PHASE 7: PRODUCTION READINESS 🏭

**INVOKE**: @production-readiness-audit (MANDATORY)

### ☐ Task 7.1: Error Handling
**INVOKE**: Sequential Thinking (20+ thoughts)
- ☐ Add comprehensive error handling to backend
- ☐ Add error boundaries to frontend
- ☐ Test error scenarios
- ☐ Git commit

### ☐ Task 7.2: Performance Optimization
**INVOKE**: @performance-engineer (agent)
- ☐ Backend: Caching, throttling
- ☐ Frontend: React.memo, FlatList optimization
- ☐ Git commit

### ☐ Task 7.3: Security Hardening
**INVOKE**: @security-auditor (agent)
- ☐ Input validation
- ☐ Path sanitization
- ☐ CORS configuration
- ☐ Git commit

### ☐ Task 7.4: Logging Enhancement
- ☐ Comprehensive logging both sides
- ☐ Log rotation
- ☐ Git commit

### ☐ Task 7.5: Documentation
- ☐ Backend README.md (via Serena)
- ☐ Frontend README.md (via Serena)
- ☐ Git commit

---

## PHASE 8: TESTING SUITE 🧪

**INVOKE**: @testing-anti-patterns (ensure no mocks)

### ☐ Backend Comprehensive Testing
- ☐ Test all REST endpoints (curl)
- ☐ Test all WebSocket messages (wscat)
- ☐ Test all tools individually
- ☐ Test error scenarios
- ☐ Document results to Serena memory

### ☐ Frontend Comprehensive Testing
**Use expo-mcp automation**:
```
"Test all screens individually with screenshots"
"Test navigation flows between all screens"
"Test state persistence across app restarts"
"Test on iPhone SE, 14, Pro Max"
```
- ☐ All screens tested
- ☐ All navigation tested
- ☐ State management tested
- ☐ Multi-device tested
- ☐ Document to Serena memory

### ☐ Integration Testing
**Use expo-mcp for visual validation**:
```
"Test complete workflow: install → setup → first message"
"Test file operations workflow"
"Test session switching workflow"
```
- ☐ User workflows tested
- ☐ Edge cases tested
- ☐ Concurrent operations tested
- ☐ Document to Serena memory

---

## PHASE 9: DEPLOYMENT PREPARATION 🚀

### ☐ Backend Deployment
- ☐ Create Dockerfile (via Serena)
- ☐ Create docker-compose.yml (via Serena)
- ☐ Test local deployment
- ☐ Git commit

### ☐ Mobile Build Preparation
**Use EAS Build** (not expo-mcp):
```bash
# Configure EAS
eas build:configure

# Create eas.json
```

- ☐ Configure eas.json (via Serena)
- ☐ Set up signing certificates
- ☐ Test build: `eas build --platform ios --profile preview --local`
- ☐ Git commit

---

## PHASE 10: FINAL DOCUMENTATION 📚

**Use expo-mcp** for automated doc generation:

### ☐ Generate AGENTS.md
```
"Generate an AGENTS.md file for the project"
```
expo-mcp automatically creates comprehensive AGENTS.md

### ☐ Generate Additional Docs via Serena
- ☐ Architecture diagrams
- ☐ API documentation  
- ☐ User guide
- ☐ Developer guide
- ☐ Git commit

---

## PHASE 11: RELEASE 🎉

**INVOKE**: @finishing-a-development-branch

### ☐ Final Review
```typescript
mcp__git__git_status({repo_path: "."});
```

### ☐ Merge to Main
```typescript
mcp__git__git_checkout({repo_path: ".", branch_name: "main"});
// Merge development branch
```

### ☐ Create Tag
```bash
git tag -a v1.0.0 -m "Initial release"
```

### ☐ Push (if remote configured)
```bash
git push origin main --tags
```

---

## PHASE 12: VALIDATION REPORT 📊

**INVOKE**: Sequential Thinking (200+ thoughts REQUIRED)

### ☐ Deep Analysis
```typescript
mcp__sequential-thinking__sequentialthinking({
  thought: "Analyzing complete implementation...",
  thoughtNumber: 1,
  totalThoughts: 200,
  nextThoughtNeeded: true
});
// Continue for 200 thoughts minimum
```

### ☐ Compile Report via Serena
```typescript
mcp__serena__create_text_file({
  relative_path: "docs/IMPLEMENTATION_REPORT.md",
  content: `[Comprehensive report:
- All phases completed
- All gates passed
- Screenshots inventory
- Performance metrics
- Known issues
- Recommendations]`
});
```

### ☐ Save to Serena Memory
```typescript
mcp__serena__write_memory({
  memory_name: "implementation-complete",
  content: "All 12 phases done. All gates passed. Production ready."
});
```

---

## 🎯 **MCP TOOL REFERENCE**

**EVERY operation uses proper MCP tool**:

| Operation | Tool | Example |
|-----------|------|---------|
| Create file | Serena MCP | `mcp__serena__create_text_file` |
| Read file | Serena MCP | `mcp__serena__read_file` |
| Shell command | Bash | `npm install`, `npx expo start` |
| Git add | Git MCP | `mcp__git__git_add` |
| Git commit | Git MCP | `mcp__git__git_commit` |
| Expo package | expo-mcp | "Add package-name" |
| Screenshot | expo-mcp | "Take screenshot" |
| UI testing | expo-mcp | "Tap testID 'button'" |
| iOS build | xc-mcp | `mcp__xc-mcp__xcodebuild-build` |
| Simulator | xc-mcp | `mcp__xc-mcp__simctl-boot` |
| Save knowledge | Serena Memory | `mcp__serena__write_memory` |
| Deep thinking | Sequential MCP | `mcp__sequential-thinking__sequentialthinking` |

---

## 🔑 **CRITICAL REQUIREMENTS**

### Sequential Thinking - MANDATORY

**MUST USE Sequential MCP for**:
- ✅ Architecture decisions (50+ thoughts minimum)
- ✅ Complex implementation decisions (20+ thoughts)
- ✅ Error recovery strategies (15+ thoughts)
- ✅ Final validation report (200+ thoughts)

### Skills - MUST INVOKE

**Explicitly invoke with @ syntax**:
- Phase -1: @writing-skills, @testing-skills-with-subagents
- Phase 1: @brainstorming
- Phase 3: @anthropic-streaming-patterns, @test-driven-development
- Phase 4: @react-native-expo-development
- Gates: @claude-mobile-validation-gate, @websocket-integration-testing, @claude-mobile-ios-testing
- Phase 7: @production-readiness-audit (MANDATORY)
- Phase 11: @finishing-a-development-branch

### Serena Memory - ALWAYS

**Save after every major milestone**:
```typescript
mcp__serena__write_memory({
  memory_name: "phase-X-complete",
  content: "Summary of work done, decisions made, issues resolved"
});
```

---

## 📦 **SUPPORTING DOCUMENTATION**

**Read First**: `docs/IMPLEMENTATION-GUIDE-EXECUTIVE-SUMMARY.md`

**For MCP Usage**: `docs/plans/EXPO-MCP-INTEGRATION-COMPLETE.md`

**For Framework**: `docs/plans/2025-10-30-claude-mobile-MCP-FIRST.md`

**For Code**: Agent outputs (complete implementations)

**For Validation**: `docs/validation/GATE-*.md`

**For Research**: Serena memories (technology-research-2025, etc.)

---

## ✅ **EXECUTION STATUS**

**Environment**: ✅ Ready
- Metro: Running with expo-mcp (PID 94406)
- expo-mcp: Authenticated and active
- Serena: Project activated
- All MCP servers: Available

**Documentation**: ✅ Complete
- 12 comprehensive documents
- All code provided
- All patterns documented
- All MCPs integrated

**Research**: ✅ Complete
- Technology validated
- Production patterns extracted
- Expo/Metro/EAS understood
- Cost tracking designed

---

## 🚀 **READY FOR EXECUTION**

**This checklist + documentation = Complete executable plan.**

**Follow checkbox by checkbox. Use proper MCP tools. Invoke skills. Think sequentially.**

**Everything needed for production-ready implementation is documented.**

---

**Total Documentation**: ~25,000 lines across all files  
**Status**: COMPLETE and READY  
**Next Step**: Execute Phase -1, Task -1.2 (Create first skill)
