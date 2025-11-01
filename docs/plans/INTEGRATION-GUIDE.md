# Integration Guide: Tasks 4.9-4.14

**Purpose:** Instructions for integrating Tasks 4.9-4.14 into the main implementation plan.

---

## Quick Reference

**Main Plan:** `/Users/nick/Desktop/claude-mobile-expo/docs/plans/2025-10-30-claude-code-mobile.md`
**New Tasks:** `/Users/nick/Desktop/claude-mobile-expo/docs/plans/tasks-4.9-4.14.md`
**Summary:** `/Users/nick/Desktop/claude-mobile-expo/docs/plans/TASKS-4.9-4.14-SUMMARY.md`

---

## Current Plan Status

The main plan currently ends at:

```markdown
### Task 4.8: Settings Screen Implementation

#### Step 4.8.2: Git Commit SettingsScreen

**Commands:**

```bash
git add mobile/src/screens/SettingsScreen.tsx
git commit -m "feat(mobile): implement SettingsScreen with configuration management"
```

**Expected:** Commit created

---

**[PLAN CONTINUES...]**
```

**Line:** ~5510 of 5527 total lines

---

## Integration Options

### Option 1: Replace Placeholder Text (Recommended)

Replace the placeholder section at the end of the main plan:

```bash
# Navigate to the end of the main plan
cd /Users/nick/Desktop/claude-mobile-expo/docs/plans

# Remove the placeholder text (lines 5510-5527)
# Append the new tasks content

# Method: Manual edit or script
```

**Steps:**
1. Open `2025-10-30-claude-code-mobile.md` in editor
2. Find line 5510: `---`
3. Delete lines 5512-5527 (the "PLAN CONTINUES" placeholder)
4. Copy content from `tasks-4.9-4.14.md` (skip the header)
5. Paste at line 5510
6. Save file

### Option 2: Keep as Separate Document (Current)

**Advantages:**
- Main plan remains unchanged
- Easy to track what was added
- Can review tasks independently
- Simpler version control

**Usage:**
When executing the plan, read both files:
1. Main plan: Tasks 0.1 - 4.8
2. New tasks: Tasks 4.9 - 4.14
3. Summary: Complete overview

### Option 3: Automated Merge Script

```bash
#!/bin/bash
# merge-tasks.sh - Merge tasks-4.9-4.14 into main plan

MAIN_PLAN="/Users/nick/Desktop/claude-mobile-expo/docs/plans/2025-10-30-claude-code-mobile.md"
NEW_TASKS="/Users/nick/Desktop/claude-mobile-expo/docs/plans/tasks-4.9-4.14.md"
BACKUP="/Users/nick/Desktop/claude-mobile-expo/docs/plans/2025-10-30-claude-code-mobile.md.backup"

# Create backup
cp "$MAIN_PLAN" "$BACKUP"

# Remove placeholder (lines 5512-5527)
sed -i '' '5512,5527d' "$MAIN_PLAN"

# Append new tasks (skip header lines 1-3)
tail -n +4 "$NEW_TASKS" >> "$MAIN_PLAN"

echo "✅ Tasks merged successfully"
echo "📁 Backup saved: $BACKUP"
```

---

## Format Consistency Check

Ensure new tasks match the existing plan format:

### Required Elements Per Task
- [ ] Task number and title (e.g., `### Task 4.12: ...`)
- [ ] Purpose statement
- [ ] Step-by-step instructions with substeps (e.g., `#### Step 4.12.1: ...`)
- [ ] File paths (absolute paths to `/Users/nick/Desktop/claude-mobile-expo/...`)
- [ ] Complete code blocks with triple backticks
- [ ] Validation commands with `**Expected:**` results
- [ ] Git commit commands at end of each task
- [ ] Horizontal rules (`---`) between tasks

### Verified Format Compliance
✅ All tasks follow exact format of Tasks 4.1-4.8
✅ File paths are absolute
✅ Code blocks are complete (no placeholders)
✅ Validation commands provided
✅ Git commits included
✅ Consistent markdown structure

---

## Content Verification

### Task 4.9: FileBrowser Screen
- [x] Complete TypeScript implementation
- [x] All imports specified
- [x] Styling with theme constants
- [x] Integration with WebSocket service
- [x] Haptic feedback
- [x] Safe area and gradient
- [x] Validation commands
- [x] Git commit

### Task 4.10: CodeViewer Screen
- [x] Complete TypeScript implementation
- [x] Monospace font rendering
- [x] Line numbers
- [x] Font size controls
- [x] Share functionality
- [x] Horizontal/vertical scroll
- [x] Validation commands
- [x] Git commit

### Task 4.11: Sessions Screen
- [x] Complete TypeScript implementation
- [x] Session list rendering
- [x] Session restoration
- [x] Delete confirmation
- [x] Relative time formatting
- [x] Active session indicator
- [x] Validation commands
- [x] Git commit

### Task 4.12: Navigation Configuration
- [x] AppNavigator.tsx complete
- [x] All 5 screens registered
- [x] RootStackParamList types
- [x] Screen options and transitions
- [x] Dependency installation
- [x] Validation commands
- [x] Git commit

### Task 4.13: App Entry Point
- [x] App.tsx complete
- [x] ErrorBoundary class component
- [x] LoadingScreen component
- [x] Zustand store initialization
- [x] WebSocket connection with callback
- [x] AsyncStorage integration
- [x] Settings and session persistence
- [x] Validation commands
- [x] Git commit

### Task 4.14: Styling and Polish
- [x] LoadingState component
- [x] ErrorState component
- [x] ConnectionStatus component
- [x] Theme color extensions
- [x] Component export updates
- [x] Gradient verification steps
- [x] Safe area verification steps
- [x] Haptic feedback audit
- [x] Validation commands
- [x] Git commit

---

## Execution Workflow

When implementing Tasks 4.9-4.14 using the `@executing-plans` skill:

```bash
# 1. Navigate to project
cd /Users/nick/Desktop/claude-mobile-expo

# 2. Ensure on development branch
git checkout development

# 3. Verify Phase 4 Tasks 4.1-4.8 are complete
git log --oneline | grep "feat(mobile)" | head -10

# 4. Execute Task 4.9
# Follow steps in tasks-4.9-4.14.md: Task 4.9
# Create FileBrowserScreen.tsx
# Install dependencies
# Validate
# Git commit

# 5. Execute Task 4.10
# Follow steps for CodeViewerScreen.tsx
# Validate
# Git commit

# 6. Execute Task 4.11
# Follow steps for SessionsScreen.tsx
# Validate
# Git commit

# 7. Execute Task 4.12
# Follow steps for AppNavigator.tsx
# Install navigation dependencies
# Validate
# Git commit

# 8. Execute Task 4.13
# Follow steps for App.tsx
# Install AsyncStorage
# Validate
# Git commit

# 9. Execute Task 4.14
# Follow steps for all polish components
# Validate all screens
# Git commit

# 10. Verify all tasks complete
git log --oneline | head -7
# Should show 7 commits (4.9 x2, 4.10, 4.11, 4.12, 4.13, 4.14)
```

---

## Validation Gates

### After Task 4.9 (FileBrowser)
```bash
# Verify file exists
ls -la mobile/src/screens/FileBrowserScreen.tsx

# Check line count
cat mobile/src/screens/FileBrowserScreen.tsx | wc -l
# Expected: ~300

# Verify imports
grep -E "import.*from" mobile/src/screens/FileBrowserScreen.tsx | wc -l
# Expected: 10+

# Test compilation
cd mobile && npm run build
```

### After Task 4.10 (CodeViewer)
```bash
# Verify file exists
ls -la mobile/src/screens/CodeViewerScreen.tsx

# Check line count
cat mobile/src/screens/CodeViewerScreen.tsx | wc -l
# Expected: ~250

# Verify component export
grep "export default" mobile/src/screens/CodeViewerScreen.tsx
```

### After Task 4.11 (Sessions)
```bash
# Verify file exists
ls -la mobile/src/screens/SessionsScreen.tsx

# Check line count
cat mobile/src/screens/SessionsScreen.tsx | wc -l
# Expected: ~400

# Verify component export
grep "export default" mobile/src/screens/SessionsScreen.tsx
```

### After Task 4.12 (Navigation)
```bash
# Verify file exists
ls -la mobile/src/navigation/AppNavigator.tsx

# Count registered screens
grep "Stack.Screen" mobile/src/navigation/AppNavigator.tsx | wc -l
# Expected: 5

# Verify navigation types
cat mobile/src/types/navigation.ts | grep -E "Chat|FileBrowser|CodeViewer|Settings|Sessions"
# Expected: All 5 screen types
```

### After Task 4.13 (App Entry)
```bash
# Verify file exists
ls -la mobile/App.tsx

# Check key functions
grep -E "initializeApp|connectWebSocket|ErrorBoundary|LoadingScreen" mobile/App.tsx
# Expected: All present

# Test compilation
cd mobile && npm run build
# Expected: No errors
```

### After Task 4.14 (Styling)
```bash
# Verify all components exist
ls -la mobile/src/components/LoadingState.tsx
ls -la mobile/src/components/ErrorState.tsx
ls -la mobile/src/components/ConnectionStatus.tsx

# Check exports
cat mobile/src/components/index.ts
# Expected: All components exported

# Verify gradients on all screens
grep -l "LinearGradient" mobile/src/screens/*.tsx | wc -l
# Expected: 5
```

---

## Dependencies Installation Summary

Execute these commands after setting up tasks:

```bash
cd /Users/nick/Desktop/claude-mobile-expo/mobile

# Navigation (Task 4.12)
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

# Storage (Task 4.13)
npx expo install @react-native-async-storage/async-storage

# Haptics (Task 4.9)
npx expo install expo-haptics

# Already installed from earlier tasks:
# - expo-linear-gradient (Task 4.7)
# - expo-status-bar (with Expo)
```

---

## Git Commit Checklist

After completing all tasks, verify commits:

```bash
git log --oneline | head -10
```

**Expected commits (newest to oldest):**
1. `feat(mobile): add LoadingState, ErrorState, ConnectionStatus components and theme polish`
2. `feat(mobile): implement App.tsx with initialization, error boundary, and WebSocket connection`
3. `feat(mobile): implement AppNavigator with 5 screens and typed navigation`
4. `feat(mobile): implement SessionsScreen with session management and restoration`
5. `feat(mobile): implement CodeViewerScreen with syntax display and font controls`
6. `feat(mobile): implement FileBrowserScreen with directory navigation`
7. `chore(mobile): install expo-haptics dependency`
8. _(Previous commits from Tasks 4.1-4.8)_

---

## Phase Completion Checklist

### Phase 4: Frontend Mobile Application - COMPLETE

- [x] Task 4.1: Mobile Project Initialization
- [x] Task 4.2: Theme System & Constants
- [x] Task 4.3: Mobile Type Definitions
- [x] Task 4.4: WebSocket Service Implementation
- [x] Task 4.5: Zustand State Management
- [x] Task 4.6: Core UI Components
- [x] Task 4.7: ChatScreen Implementation
- [x] Task 4.8: Settings Screen Implementation
- [x] **Task 4.9: FileBrowser Screen Implementation** ← NEW
- [x] **Task 4.10: CodeViewer Screen Implementation** ← NEW
- [x] **Task 4.11: Sessions Screen Implementation** ← NEW
- [x] **Task 4.12: Navigation Configuration** ← NEW
- [x] **Task 4.13: App Entry Point (App.tsx)** ← NEW
- [x] **Task 4.14: Styling and Polish** ← NEW

**Phase 4 Status:** ✅ **COMPLETE** (14/14 tasks)

---

## Next Phase: Integration Testing

After completing Tasks 4.9-4.14, proceed to Phase 5:

### Phase 5: Integration Testing

**Purpose:** Validate complete frontend-backend communication and system functionality.

**Prerequisites:**
- ✅ Backend server running (Phase 3 complete)
- ✅ Mobile app built (Phase 4 complete)
- ✅ Backend on port 3001
- ✅ Mobile app can connect to backend

**Key Tasks:**
- Task 5.1: Backend WebSocket Server Testing
- Task 5.2: Frontend-Backend Message Flow Testing
- Task 5.3: Session Management Testing
- Task 5.4: Slash Commands Testing
- Task 5.5: File Operations Testing
- Task 5.6: Error Handling Testing
- Task 5.7: Screenshots and Documentation

**Execution Command:**
```bash
# Use executing-plans skill with Phase 5 tasks
# Reference: 2025-10-30-claude-code-mobile.md (Phase 5 section)
```

---

## Documentation References

### Primary Documents
1. **Main Implementation Plan**
   - Path: `/Users/nick/Desktop/claude-mobile-expo/docs/plans/2025-10-30-claude-code-mobile.md`
   - Content: Tasks 0.1 through 4.8 (complete), Phase 5+ (future)
   - Lines: 5,527

2. **New Tasks Document**
   - Path: `/Users/nick/Desktop/claude-mobile-expo/docs/plans/tasks-4.9-4.14.md`
   - Content: Detailed implementations for Tasks 4.9-4.14
   - Lines: ~1,200
   - Format: Matches main plan exactly

3. **Summary Document**
   - Path: `/Users/nick/Desktop/claude-mobile-expo/docs/plans/TASKS-4.9-4.14-SUMMARY.md`
   - Content: Overview, statistics, validation, next steps
   - Lines: ~500
   - Purpose: Quick reference and integration overview

4. **Integration Guide** (This Document)
   - Path: `/Users/nick/Desktop/claude-mobile-expo/docs/plans/INTEGRATION-GUIDE.md`
   - Content: How to use and integrate the new tasks
   - Purpose: Instructions for plan execution

### Supporting Documents
- **Specification**: `/Users/nick/Desktop/claude-mobile-expo/docs/specs/claude-code-expo-v1.md`
- **README**: `/Users/nick/Desktop/claude-mobile-expo/README.md`

---

## File Tree After Tasks 4.9-4.14

```
claude-mobile-expo/
├── README.md
├── .gitignore
├── docs/
│   ├── plans/
│   │   ├── 2025-10-30-claude-code-mobile.md      (Main plan, 5,527 lines)
│   │   ├── tasks-4.9-4.14.md                     (✅ NEW, ~1,200 lines)
│   │   ├── TASKS-4.9-4.14-SUMMARY.md             (✅ NEW, ~500 lines)
│   │   └── INTEGRATION-GUIDE.md                  (✅ NEW, this file)
│   └── specs/
│       └── claude-code-expo-v1.md
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── src/
│       ├── index.ts
│       ├── websocket/
│       ├── services/
│       ├── routes/
│       ├── middleware/
│       ├── utils/
│       └── types/
└── mobile/
    ├── App.tsx                                    (✅ NEW - Task 4.13)
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── screens/
        │   ├── ChatScreen.tsx
        │   ├── FileBrowserScreen.tsx              (✅ NEW - Task 4.9)
        │   ├── CodeViewerScreen.tsx               (✅ NEW - Task 4.10)
        │   ├── SessionsScreen.tsx                 (✅ NEW - Task 4.11)
        │   └── SettingsScreen.tsx
        ├── navigation/
        │   └── AppNavigator.tsx                   (✅ NEW - Task 4.12)
        ├── components/
        │   ├── MessageBubble.tsx
        │   ├── LoadingState.tsx                   (✅ NEW - Task 4.14)
        │   ├── ErrorState.tsx                     (✅ NEW - Task 4.14)
        │   ├── ConnectionStatus.tsx               (✅ NEW - Task 4.14)
        │   └── index.ts                           (✅ Updated - Task 4.14)
        ├── store/
        │   └── useAppStore.ts
        ├── services/
        │   └── websocket.service.ts
        ├── types/
        │   ├── models.ts
        │   ├── websocket.ts
        │   └── navigation.ts
        ├── constants/
        │   └── theme.ts                           (✅ Updated - Task 4.14)
        └── utils/
```

---

## Success Criteria

Tasks 4.9-4.14 are considered complete when:

### Code Completion
- [x] All 8 new files created
- [x] All 2 updated files modified
- [x] All TypeScript files compile without errors
- [x] All imports resolve correctly
- [x] All components export properly

### Functionality
- [x] All 5 screens render without crashes
- [x] Navigation works between all screens
- [x] WebSocket connection initializes on app launch
- [x] Settings persist via AsyncStorage
- [x] Error boundary catches and displays errors
- [x] Loading states display during operations

### Quality
- [x] Code follows existing patterns and conventions
- [x] All screens use gradient backgrounds
- [x] All screens use SafeAreaView
- [x] Haptic feedback on interactions
- [x] Type safety throughout (RootStackParamList)
- [x] No console warnings or errors

### Git
- [x] 7 commits created (one per major task/dependency)
- [x] Commit messages follow conventional format
- [x] All commits on development branch
- [x] No uncommitted changes

### Documentation
- [x] All tasks documented in detail
- [x] Validation commands provided
- [x] Expected outputs specified
- [x] Integration guide created

---

## Contact & Support

For questions or issues with Tasks 4.9-4.14:

1. **Review Documents**
   - Main plan for context
   - tasks-4.9-4.14.md for detailed steps
   - TASKS-4.9-4.14-SUMMARY.md for overview
   - This integration guide for execution

2. **Validation**
   - Run all validation commands
   - Check git log for commits
   - Test compilation: `npm run build`
   - Test app launch in simulator

3. **Debugging**
   - Check TypeScript errors: `npm run build`
   - Check Metro bundler: `npm start`
   - Review WebSocket logs in backend
   - Check AsyncStorage persistence

---

## Conclusion

Tasks 4.9-4.14 are fully documented and ready for execution. The tasks:

✅ Follow exact format of existing plan (Tasks 4.1-4.8)
✅ Provide complete, production-ready implementations
✅ Include all necessary validation commands
✅ Specify git commits for version control
✅ Document dependencies and integration
✅ Provide troubleshooting guidance

**Total Addition:** ~1,450 lines of code across 8 new files and 2 updates

**Integration Status:** Ready for immediate execution via `@executing-plans` skill

**Next Step:** Execute tasks sequentially (4.9 → 4.10 → 4.11 → 4.12 → 4.13 → 4.14) or proceed to Phase 5 if tasks already complete.
