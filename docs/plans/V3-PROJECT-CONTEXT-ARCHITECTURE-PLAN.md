# v3 Project Context Architecture - Implementation Plan

**Created**: 2025-11-04
**Based On**: 30 sequential thoughts about real user workflows
**Purpose**: Transform v3 from generic chatbot to project-aware code assistant

**Token Estimate**: 320k tokens (5 phases)
**Timeline**: 2-3 sessions

---

## Critical Discovery

During comprehensive validation (Gates 1-5), discovered **CRITICAL ARCHITECTURAL GAP**:

**Current State**: Chat works but has NO project context
- Projects display but tapping does nothing (console.log stub)
- Sessions exist but not filtered by project
- Chat sends messages without project_id
- Tools execute without knowing which project

**User Impact**: App is a generic chatbot, NOT a code assistant
- Can't work on specific projects
- Can't maintain project-specific conversation history
- Tool executions don't know which directory
- File references (@mentions) don't work
- Git operations don't know which repo

**Root Cause**: Missing `currentProject` state in architecture

---

## User Persona & Workflows

### Who Uses This App?
Developer with:
- 5-10 active coding projects
- Multiple chat sessions per project (conversations with Claude)
- Claude Code CLI on desktop
- Wants mobile access to continue work

### Core User Workflow (How It SHOULD Work)

**Scenario**: Developer on commute wants to review conversation about authentication

1. **Launch app** → Shows Projects screen
2. **See projects** → nerve, swift-coreml, player_ios, etc.
3. **Tap "nerve" project** → Navigate to nerve's Sessions screen
4. **See sessions** → "Auth Implementation" (12 messages), "DB Setup" (8 messages)
5. **Tap "Auth Implementation"** → Chat loads with full 12-message history
6. **Read conversation** → Scroll through previous messages
7. **Continue conversation** → "Let's also add 2FA support"
8. **Response streams** → Claude responds with nerve project context
9. **Tool executes** → Creates files in /Users/nick/nerve/
10. **Session auto-saves** → Next time, conversation continues

**This is how Claude Code CLI works. Mobile must match.**

---

## Architecture Changes Needed

### Phase 1: Zustand Store Enhancement

**Add State**:
```typescript
interface AppState {
  // NEW: Project context
  currentProject: Project | null;
  projects: Project[];  // Cached from scan
  lastActiveProjectPath: string | null;  // Persistence

  // EXISTING (kept)
  currentSession: Session | null;
  sessions: Session[];  // Will be filtered by currentProject
  messages: Message[];
  // ... rest
}
```

**Add Actions**:
```typescript
setCurrentProject: (project: Project) => void;
clearCurrentProject: () => void;
setProjects: (projects: Project[]) => void;
getSessionsForProject: (projectId: string) => Session[];
```

**Persistence** (AsyncStorage):
```typescript
partialize: (state) => ({
  settings: state.settings,
  lastActiveProjectPath: state.currentProject?.path,  // NEW
  lastActiveSessionId: state.currentSession?.id,      // NEW
})
```

**File**: `src/store/useAppStore.ts`
**Estimate**: 20k tokens

### Phase 2: Projects Screen - Add Navigation

**Current** (line 39):
```typescript
onPress={() => console.log('Project tapped:', item.name)}
```

**Needed**:
```typescript
onPress={() => {
  // Set as current project
  useAppStore.getState().setCurrentProject(item);

  // Navigate to Sessions screen for this project
  router.push({
    pathname: '/project-sessions',
    params: { projectId: item.path }
  });
}}
```

**New Screen Needed**: `app/project-sessions.tsx`
- Shows sessions filtered by project
- Header: "📁 {projectName} - Sessions"
- Empty state: "No sessions yet. Create first session?"

**Files**:
- `app/(tabs)/projects.tsx` (update onPress)
- `app/project-sessions.tsx` (create new)
- `app/_layout.tsx` (register route)

**Estimate**: 30k tokens

### Phase 3: Sessions Screen - Fix & Filter

**Bug Fix** (line 50):
```typescript
// CURRENT (BROKEN):
projectPath: s.project_path || 'Unknown Project'

// FIX:
projectPath: s.project_id || 'Unknown Project'
```

**Filter by Project**:
```typescript
const loadSessions = useCallback(async () => {
  const currentProject = useAppStore.getState().currentProject;
  if (!currentProject) return;

  const response = await httpService.httpClient.listSessions();
  const allSessions = response.data || [];

  // Filter to current project only
  const projectSessions = allSessions.filter(s =>
    s.project_id === currentProject.path ||
    s.project_id === currentProject.name
  );

  // Update store with filtered sessions
  useAppStore.setState({ sessions: projectSessions });
}, [httpService]);
```

**Files**: `app/sessions.tsx`
**Estimate**: 20k tokens

### Phase 4: Chat Screen - Show Project Context

**Header Enhancement**:
```typescript
const currentProject = useAppStore(state => state.currentProject);
const currentSession = useAppStore(state => state.currentSession);

<View className="header">
  <TouchableOpacity onPress={showProjectPicker}>
    <Text>📁 {currentProject?.name || 'No Project'}</Text>
  </TouchableOpacity>
  <Text> > </Text>
  <Text>{currentSession?.title || 'New Session'}</Text>
</View>
```

**Send with Project Context**:
```typescript
await httpService.sendMessageStreaming({
  model: settings.model,
  messages: httpMessages,
  session_id: currentSession?.id,
  project_id: currentProject?.path,        // ← ADD THIS
  project_path: currentProject?.path,      // ← ADD THIS
  onChunk: ...
});
```

**No Project Guard**:
```typescript
if (!currentProject) {
  return (
    <View>
      <Text>No project selected</Text>
      <Button onPress={() => router.push('/projects')}>
        Select Project
      </Button>
    </View>
  );
}
```

**Files**: `app/(tabs)/index.tsx`
**Estimate**: 40k tokens

### Phase 5: Backend API Updates

**Update http.client.ts** to send project context:
```typescript
async createChatCompletion(request: {
  model: string;
  messages: Message[];
  session_id?: string;
  project_id?: string;      // ← ADD
  project_path?: string;    // ← ADD
  stream?: boolean;
}): Promise<ChatCompletionResponse>
```

**Update Sessions API calls**:
```typescript
async listSessions(projectId?: string): Promise<SessionsResponse> {
  const url = projectId
    ? `/v1/sessions?project_id=${projectId}`
    : `/v1/sessions`;
  return this.request<SessionsResponse>(url);
}
```

**Files**: `src/services/http/http.client.ts`, `src/services/http/types.ts`
**Estimate**: 30k tokens

---

## Implementation Phases (320k tokens total)

### Phase 1: Core State (50k tokens, 1 hour)
1. Add currentProject to Zustand store
2. Add projects array to store
3. Add persistence (lastActiveProjectPath)
4. Add getSessionsForProject selector
5. Test: State updates work, AsyncStorage persists

### Phase 2: Projects → Sessions Flow (80k tokens, 1.5 hours)
6. Implement Projects screen onPress navigation
7. Create app/project-sessions.tsx (Sessions filtered by project)
8. Register route in _layout.tsx
9. Fix sessions.tsx field name bug (project_id)
10. Test: Tap project → See its sessions

### Phase 3: Chat with Project Context (90k tokens, 2 hours)
11. Add project header to Chat screen
12. Add "No project" guard
13. Include project_id in backend requests
14. Add project switcher UI
15. Test: Chat shows project, sends context to backend

### Phase 4: Files & Git Scoping (60k tokens, 1 hour)
16. Files browser: Root at currentProject.path
17. Git screen: Execute in currentProject.path
18. Settings: Show current project section
19. Test: Files and Git scoped correctly

### Phase 5: User Workflow Validation (40k tokens, 1 hour)
20. Run 10 workflow-based validation gates
21. Document with IDB automation + screenshots
22. Verify end-to-end flows work

**Total**: 320k tokens over 6.5 hours (2-3 sessions)

---

## User-Workflow Validation Gates (NEW)

### GATE 1: First-Time User Onboarding
**User Story**: New user discovers projects and starts first chat

**Steps**:
1. Launch app → Projects screen shows (no saved state)
2. Scan for projects → 6 projects appear
3. Tap "nerve" → Navigate to nerve's Sessions
4. Sessions empty → "Create First Session" button
5. Tap Create → Navigate to Chat with nerve context
6. Chat header shows "📁 nerve > New Session"
7. Type: "Help me add authentication"
8. Send → Backend receives project_id="nerve"
9. Response streams → Mentions nerve's structure
10. Session auto-saved → Appears in nerve's sessions list

**Validation via IDB**:
```bash
# Launch and screenshot
idb ui describe-all --udid booted > /tmp/ui.json

# Tap nerve project card
PROJECT_Y=$(cat /tmp/ui.json | jq '... calculate from nerve card')
idb ui tap --udid booted X Y

# Wait for Sessions screen
sleep 2
screenshot → Verify "nerve - Sessions" header

# Tap Create First Session
idb ui tap --udid booted X Y

# Wait for Chat
sleep 1
screenshot → Verify "📁 nerve" in header

# Type and send message
idb ui tap --udid booted 181 725  # Input
idb ui text --udid booted "Help me add authentication to this project"
idb ui tap --udid booted 370 729  # Send

# Wait for response
sleep 5
screenshot → Verify response mentions "nerve" or project files

# Check backend logs
grep "project_id.*nerve" logs/backend.log
```

**Pass Criteria**:
- ✅ Projects screen loads first
- ✅ Tap navigates to Sessions
- ✅ Sessions filtered by project
- ✅ Chat header shows project name
- ✅ Backend receives project_id in request
- ✅ Session saves with project association

---

### GATE 2: Returning User - Resume Last Session
**User Story**: User reopens app, continues where they left off

**Steps**:
1. User was working on nerve > Auth session
2. Close app (kill process)
3. Wait 5 minutes
4. Reopen app
5. App restores: currentProject=nerve, currentSession=Auth
6. Chat screen loads directly (not Projects)
7. All 12 previous messages visible
8. Type new message → Appends to same session
9. Session message count increments

**Validation via IDB**:
```bash
# Before closing: Verify state saved
curl http://localhost:8001/v1/sessions | jq '.data[0].id'
# Note the session ID

# Kill app
# Wait

# Reopen
xcrun simctl openurl booted exp://localhost:8081
sleep 10

# Screenshot
screenshot → Verify Chat screen shows same session

# Check message count
idb ui describe-all | grep "12 messages"

# Send new message
# (same process as Gate 1)

# Verify session ID unchanged
curl http://localhost:8001/v1/sessions | jq '.data[0].id'
# Should match noted ID
```

**Pass Criteria**:
- ✅ App resumes to last active screen (Chat)
- ✅ Project context restored
- ✅ Session context restored
- ✅ Message history intact
- ✅ New messages append to same session

---

### GATE 3: Multi-Session Project Management
**User Story**: User works on project with 3 different conversation threads

**Steps**:
1. Working on nerve project
2. Has 3 sessions:
   - "Auth Implementation" (12 msgs)
   - "Database Setup" (8 msgs)
   - "API Design" (15 msgs)
3. In Chat with Auth session active
4. Tap session name in header → Session picker appears
5. Shows all 3 sessions for nerve
6. Tap "Database Setup" → Chat reloads with 8 DB messages
7. Scroll through DB conversation
8. Send message about database
9. Switch to "API Design" → 15 API messages load
10. All 3 sessions maintain independent state

**Validation via IDB**:
```bash
# Setup: Create 3 sessions via backend
curl -X POST http://localhost:8001/v1/sessions -d '{...}' # x3

# In app: Navigate to nerve → Sessions
# Screenshot → Count session cards (should be 3)

# Tap session 1
screenshot → Verify message count

# Switch to session 2
# (tap header, select different session)
screenshot → Verify different messages

# Send message in session 2
# (IDB automation)

# Switch to session 3
screenshot → Verify 15 messages

# Return to session 1
screenshot → Verify original 12 messages still there

# Backend verification
curl http://localhost:8001/v1/sessions/${session1_id}/messages | jq 'length'
# Should match UI count
```

**Pass Criteria**:
- ✅ All sessions for project visible
- ✅ Switching sessions changes message history
- ✅ No message mixing between sessions
- ✅ Each session maintains state independently
- ✅ Backend keeps sessions separate

---

### GATE 4: Project Switching
**User Story**: User switches from one project to another

**Steps**:
1. Working on nerve > Auth session
2. Tap "📁 nerve" in Chat header → Project picker
3. Shows: All 6 projects
4. Tap "swift-coreml-diffusers"
5. Confirmation: "Switch to swift-coreml? Current session saved."
6. Confirm → Navigate to swift-coreml Sessions screen
7. Sessions filtered to swift-coreml only
8. Select or create session in swift-coreml
9. Chat now in swift-coreml context
10. Return to nerve later → All nerve sessions intact

**Validation via IDB**:
```bash
# Start in nerve project
screenshot → Verify "📁 nerve" in header

# Tap project name
idb ui tap --udid booted X Y

# Wait for project picker
sleep 1
screenshot → Verify all 6 projects listed

# Tap swift-coreml
idb ui tap --udid booted X Y

# Confirm switch
idb ui tap --udid booted X Y  # Confirm button

# Wait for navigation
sleep 2
screenshot → Verify "📁 swift-coreml" in header

# Verify session isolation
curl http://localhost:8001/v1/sessions?project_id=nerve | jq 'length'
curl http://localhost:8001/v1/sessions?project_id=swift-coreml | jq 'length'
# Counts should be independent
```

**Pass Criteria**:
- ✅ Project picker shows all projects
- ✅ Switching changes currentProject
- ✅ Sessions filter to new project
- ✅ Chat context updates
- ✅ Old project's sessions unchanged

---

### GATE 5: Tool Execution with Project Paths
**User Story**: Claude creates files in correct project directory

**Steps**:
1. Working on nerve project
2. Send: "Create src/auth/permissions.ts with role-based access control"
3. Claude responds with plan
4. Executes Write tool
5. Tool card shows: "✏️ Writing @src/auth/permissions.ts in nerve"
6. File created at: /Users/nick/nerve/src/auth/permissions.ts
7. Navigate: Files tab → src → auth
8. permissions.ts appears in list
9. Tap file → View content matches what Claude wrote
10. In desktop: `ls ~/nerve/src/auth/` shows permissions.ts

**Validation via IDB**:
```bash
# Send message requesting file creation
idb ui tap --udid booted 181 725
idb ui text --udid booted "Create a test file test-gate5.ts in the project root"
idb ui tap --udid booted 370 729

# Wait for tool execution
sleep 5
screenshot → Verify tool execution card visible

# Check backend logs
grep "Write.*test-gate5" logs/backend.log

# Verify file created
ls /Users/nick/nerve/test-gate5.ts
# Should exist

# In app Files tab
# Navigate to see file
screenshot → Verify test-gate5.ts in list
```

**Pass Criteria**:
- ✅ Tool executes in correct project directory
- ✅ File created at right path
- ✅ Files browser shows new file
- ✅ Desktop can see the file
- ✅ Tool card shows project-relative path

---

### GATE 6: File References (@mentions)
**User Story**: User references project files in conversation

**Steps**:
1. Working on nerve project
2. Type: "Review @src/auth/index.ts"
3. @ triggers autocomplete
4. Shows files from nerve/src/
5. Select index.ts
6. Message: "Review @src/auth/index.ts and suggest improvements"
7. Claude reads nerve/src/auth/index.ts
8. Response includes specific code from that file
9. Suggestions are contextual to nerve's architecture

**Validation via IDB**:
```bash
# Type @ to trigger autocomplete
idb ui tap --udid booted 181 725
idb ui text --udid booted "Review @"

# Wait for autocomplete
sleep 1
screenshot → Verify file picker appears

# Select file (if implemented) or complete path manually
idb ui text --udid booted "src/auth/index.ts for security issues"
idb ui tap --udid booted 370 729

# Wait for Claude to read file
sleep 5
screenshot → Verify response discusses specific code

# Check backend logs
grep "Read.*src/auth/index.ts" logs/backend.log
grep "project.*nerve" logs/backend.log
```

**Pass Criteria**:
- ✅ @ autocomplete shows project files
- ✅ File paths are project-relative
- ✅ Claude reads correct file
- ✅ Response references actual code
- ✅ No cross-project file access

---

### GATE 7: Git Operations Scoped to Project
**User Story**: User commits changes in specific project

**Steps**:
1. Working on nerve project
2. Navigate: Settings → Git Operations
3. Git screen shows nerve's status
4. Modified files: src/auth/permissions.ts
5. Type commit message: "Add permission system"
6. Tap Commit
7. Backend executes: `git commit` in /Users/nick/nerve/
8. Commit appears in nerve's git log
9. Desktop: `cd ~/nerve && git log` shows the commit
10. Other projects unaffected

**Validation via IDB**:
```bash
# Create test change in nerve
echo "test" >> /Users/nick/nerve/test-git-gate.txt

# In app: Navigate to Git screen
idb ui tap --udid booted 301 815  # Settings
idb ui swipe ...  # Scroll to Git
idb ui tap --udid booted X Y  # Git Operations

# Wait for git status load
sleep 2
screenshot → Verify test-git-gate.txt in untracked

# Commit
idb ui tap --udid booted X Y  # Commit message input
idb ui text --udid booted "Gate 7 test commit"
idb ui tap --udid booted X Y  # Commit button

# Verify on desktop
cd /Users/nick/nerve && git log --oneline | head -1
# Should show "Gate 7 test commit"

# Verify other projects unaffected
cd /Users/nick/swift-coreml-diffusers && git log --oneline | head -1
# Should NOT show gate 7 commit
```

**Pass Criteria**:
- ✅ Git status for correct project
- ✅ Commit creates in right repo
- ✅ Desktop sees the commit
- ✅ Other projects' git unchanged
- ✅ Proper directory isolation

---

### GATE 8: Files Browser Scoped to Project
**User Story**: User browses project files

**Steps**:
1. Working on nerve project
2. Navigate: Settings → Browse Files
3. Files screen shows nerve/ root directory
4. Navigate: src → auth
5. View: permissions.ts file
6. File content from nerve/src/auth/permissions.ts
7. Can't navigate outside nerve directory
8. Tap file → Content shown in CodeViewer
9. Back to Files → Still in nerve/src/auth
10. Switch project → Files root changes to new project

**Validation via IDB**:
```bash
# Navigate to Files
screenshot → Verify root is project directory

# Navigate into folders
idb ui tap --udid booted X Y  # src folder
sleep 1
screenshot → Verify breadcrumb shows "nerve > src"

# Open file
idb ui tap --udid booted X Y  # some .ts file
sleep 1
screenshot → Verify CodeViewer shows file content

# Verify security (can't escape project)
# Files screen shouldn't show .. past project root

# Switch project
# Navigate to Files again
screenshot → Verify root changed to new project
```

**Pass Criteria**:
- ✅ Files scoped to project directory
- ✅ Navigation within project works
- ✅ Can't escape project directory
- ✅ File paths project-relative
- ✅ Project switch changes Files root

---

### GATE 9: Session History Persistence
**User Story**: User closes app mid-conversation, resumes later

**Steps**:
1. Working on nerve > Auth session
2. Conversation has 12 messages
3. Send message 13, get response
4. App now has 14 messages total
5. Close app (don't kill, just background)
6. Wait 10 minutes
7. Reopen app
8. Chat screen shows same 14 messages
9. Scroll up → All messages intact
10. Send message 15 → Conversation continues

**Validation via IDB**:
```bash
# Before closing: Note message count
MESSAGE_COUNT=$(idb ui describe-all --udid booted | grep "messages" | ...)

# Close app
idb ui button --udid booted HOME
sleep 600  # Wait 10 min (or simulate)

# Reopen
xcrun simctl openurl booted exp://localhost:8081
sleep 10

# Verify same message count
screenshot → Count messages visually
idb ui describe-all → Parse message count
# Should match $MESSAGE_COUNT

# Send new message
# Verify it's #15 in the session
```

**Pass Criteria**:
- ✅ Message history persists
- ✅ Session state intact
- ✅ Project context maintained
- ✅ No data loss
- ✅ Conversation continuity

---

### GATE 10: Multi-Project Context Isolation
**User Story**: User works on 3 projects, no data mixing

**Steps**:
1. Project A (nerve) > Auth session: 12 messages about JWT
2. Switch to Project B (swift-coreml) > Training session: 5 messages about ML
3. Send message about CoreML → Response uses swift-coreml context
4. Switch to Project C (player_ios) > UI session: 8 messages about SwiftUI
5. Send message about layouts → Response uses player_ios context
6. Return to Project A (nerve) > Auth session
7. Still shows 12 original JWT messages (no ML or SwiftUI messages)
8. Send message about auth → Response uses nerve context again
9. All 3 projects maintain independent sessions
10. No cross-contamination

**Validation via IDB**:
```bash
# Setup: Have 3 projects with sessions
# nerve: 1 session (12 messages)
# swift-coreml: 1 session (5 messages)
# player_ios: 1 session (8 messages)

# Automated script:
for project in nerve swift-coreml player_ios; do
  # Switch to project
  # Navigate to its session
  # Screenshot
  # Count messages
  # Send test message
  # Verify backend gets correct project_id
  # Return to Projects
done

# Final verification
curl http://localhost:8001/v1/sessions | jq '.data[] | {project: .project_id, messages: .message_count}'
# Should show 3 separate sessions:
# nerve: 13, swift-coreml: 6, player_ios: 9
# (each incremented by 1 from our test messages)
```

**Pass Criteria**:
- ✅ Each project's sessions isolated
- ✅ Messages don't mix
- ✅ Context switches correctly
- ✅ Backend tracks all independently
- ✅ No data leakage between projects

---

## Success Metrics

### Technical Validation
- ✅ 10 user workflow gates pass
- ✅ Zero data integrity issues
- ✅ All IDB tests automated
- ✅ Backend logs confirm project context in all requests

### User Experience Validation
- ✅ Flow is intuitive (no confusion during testing)
- ✅ Project context always visible
- ✅ Navigation feels natural
- ✅ No dead ends or broken flows

### Code Quality
- ✅ TypeScript compilation clean
- ✅ All components use NativeWind
- ✅ No console.log stubs
- ✅ Proper error handling

---

## Execution Strategy

### Session 1 (This session - COMPLETE)
- ✅ Validated existing v3 code
- ✅ Identified critical gaps
- ✅ Designed proper UX
- ✅ Created this plan

### Session 2 (Next - 250k tokens)
- Implement Phases 1-3 (Core state, navigation, Chat context)
- Test Gates 1-5
- Fix all critical bugs

### Session 3 (Final - 150k tokens)
- Implement Phases 4-5 (Files/Git scoping, final validation)
- Test Gates 6-10
- Production ready

---

## Files to Create/Modify

### Create:
1. `app/project-sessions.tsx` - Sessions filtered by project
2. `docs/UX-DESIGN-SPECIFICATION.md` - Detailed screen designs
3. `scripts/test-user-workflows.sh` - Automated gate testing

### Modify:
4. `src/store/useAppStore.ts` - Add project state
5. `app/(tabs)/projects.tsx` - Add navigation
6. `app/(tabs)/index.tsx` - Add project context
7. `app/sessions.tsx` - Fix bug + filter
8. `src/services/http/http.client.ts` - Add project params
9. `app/git.tsx` - Add project scope
10. `app/files/index.tsx` - Add project scope

**Total**: 3 new files, 7 modified files

---

**Plan Complete**: Ready for execution with clear user-centric goals
**Token Budget**: 320k estimate vs 509k available (189k buffer)
**Outcome**: Transform v3 into genuinely useful mobile code assistant
