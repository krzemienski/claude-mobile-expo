# Frontend Validation - REAL Plan (Not Code Writing, Actual Testing)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:systematic-debugging to fix Metro error, then claude-mobile-validation-gate to validate each gate with visual proof.

**Current Honest Status**:
- Backend: 40/40 tests PASSED ✅ (proven with curl)
- Frontend: 0/22 tests PASSED ❌ (app crashes, zero visual proof)
- Integration: 0/22 tests PASSED ❌ (no working app to test)
- Completion: 40/99 = 40.4%

**The Problem**: App shows red JavaScript error screen in ALL screenshots. Until this is fixed, NO frontend validation possible.

**Token Budget**: 438k remaining (plenty for systematic debugging)

---

## PHASE 1: Systematic Metro Error Resolution (MANDATORY)

**Goal**: Get app launching without red error screen

### Task 1.1: Evidence Gathering (Debugging Phase 1)

**Do NOT skip this. Gather ALL evidence first.**

**Step 1: Compare to working commit**

```bash
# Check out last known working commit
git checkout 2cb76aa  # From memory: XHR SSE working

# Start Metro
npx expo start

# Launch app, take screenshot
xcrun simctl io booted screenshot /tmp/working-commit.png

# Return to current
git checkout main
```

**Expected**: Screenshot shows app working OR also crashes (reveals if error is old)

**Step 2: Read Metro log completely**

```bash
# Start Metro with output to file
npx expo start > metro-full.log 2>&1

# Read entire log for JavaScript errors
cat metro-full.log | grep -A 50 "error:"
```

**Expected**: Find actual JavaScript error message

**Step 3: Use ios-simulator-skill log monitor**

```bash
python ~/.claude/skills/ios-simulator-skill/skill/scripts/log_monitor.py \
  --app com.yourcompany.claudecodemobile \
  --severity error \
  --duration 30s \
  --verbose
```

**Expected**: Capture actual iOS runtime error

**Step 4: Check TypeScript errors in src/ only**

```bash
cd claude-code-mobile
npx tsc --noEmit 2>&1 | grep "claude-code-mobile/src/" | head -20
```

**Expected**: See if MY code has TypeScript errors (not just node_modules)

**Step 5: Document all evidence**

Create `METRO-ERROR-EVIDENCE.md` with:
- Exact error messages from logs
- Screenshot analysis (describe what error text says)
- TypeScript errors in src/
- Comparison to working commit

**Validation**: Have complete evidence before attempting ANY fix

---

### Task 1.2: Root Cause Analysis (Debugging Phase 2)

**After gathering evidence, analyze patterns**

**Step 1: Compare file differences**

```bash
git diff 2cb76aa..HEAD --name-only | grep claude-code-mobile/
```

**Step 2: Check for breaking changes**

Look for:
- New imports causing module errors
- Changed App.tsx structure
- Navigation setup changes
- Package.json dependency changes

**Step 3: Form hypothesis**

Document in `METRO-ERROR-HYPOTHESIS.md`:
- "The error is [X] because [Y]"
- Evidence supporting this
- Minimal test to verify

**Validation**: Have specific, testable hypothesis

---

### Task 1.3: Hypothesis Testing (Debugging Phase 3)

**ONE change at a time, verify result**

**Step 1: Test hypothesis with minimal change**

Make smallest possible change to test hypothesis

**Step 2: Restart Metro completely**

```bash
pkill -9 -f metro && pkill -9 -f expo
rm -rf node_modules/.cache .expo
npx expo start --clear
```

**Step 3: Take screenshot**

```bash
sleep 60  # Wait for bundle
xcrun simctl io booted screenshot /tmp/after-fix-attempt.png
```

**Step 4: Analyze result**

- Still red screen? Hypothesis wrong, form new one
- Different error? Progress, note what changed
- App works? Hypothesis correct, proceed

**Validation**: Clear result from hypothesis test

---

### Task 1.4: Fix Implementation (Debugging Phase 4)

**Once hypothesis verified, implement proper fix**

**Step 1: Implement fix completely**

**Step 2: Test app launches**

**Step 3: Take screenshot showing working UI**

**Step 4: Verify basic interaction (tap button, type text)**

**Validation**: Screenshot showing actual UI (not red error screen)

**Exit Criteria**: App launches successfully, can see ChatScreen UI, no crashes

**DO NOT PROCEED to Gate F1 until app launches successfully.**

---

## PHASE 2: Gate F1 Validation (10 tests with visual proof)

**Prerequisites**: App must launch successfully from Phase 1

### Task 2.1: Visual Theme Verification

**Step 1: Take screenshot of ChatScreen**

```bash
xcrun simctl io booted screenshot /tmp/chatscreen-black-theme.png
```

**Analyze screenshot**:
- Background color: Should be #0a0a0a (flat black), not purple gradient
- Card colors: Should be #1a1a1a
- Primary button: Should be #4ecdc4 (teal)
- Text: Should be #ffffff (white)

**Pass Criteria**: Screenshot shows flat black, no purple gradient

**Step 2: Navigate to Settings**

Use expo-mcp or ios-simulator-skill:
```bash
python scripts/navigator.py --find-text "Settings" --tap
xcrun simctl io booted screenshot /tmp/settings-black-theme.png
```

**Verify**: Settings screen has flat black theme

**Step 3: Test all 5 core screens**

Take screenshot of each, verify flat black theme

**Step 4: Verify MessageBubble rendering**

Send test message, screenshot shows:
- User bubble: teal background
- Assistant bubble: card (#1a1a1a) background
- No purple anywhere

**Validation**: 10/10 visual tests with screenshot proof

---

## PHASE 3: Gate F2 Validation (12 tests with functional proof)

**Test each new screen actually works**

### Task 3.1: ProjectsScreen Functional

**Step 1: Navigate to Projects screen**

**Step 2: Verify shows real projects**

Screenshot should show list of discovered projects from backend API

**Step 3: Tap a project**

**Validation**: Navigation works, shows project details

### Task 3.2-3.7: Test remaining screens

Each screen gets:
- Navigate to it
- Screenshot showing it loaded
- Test primary interaction
- Verify backend data appears

**Validation**: All 12 F2 tests pass with screenshots

---

## PHASE 4: Integration Gate I1 (10 tests)

**Tool execution display working**

**Step 1: Send prompt that uses tools**

```
User: "Use Write tool to create hello.txt, then Read it back"
```

**Step 2: Verify tool cards appear**

Screenshot showing:
- Write tool card with input/output
- Read tool card with result
- Both cards expanded showing details

**Validation**: Tool display works with visual proof

---

## PHASE 5: Integration Gate I2 (12 tests)

**End-to-end workflows**

**Test workflow**:
1. Open FileBrowser
2. Navigate to src/
3. Tap ChatScreen.tsx
4. Verify code appears in viewer
5. Create new file from mobile
6. Go to Git screen
7. Verify file shows as untracked
8. Create commit
9. Verify commit in log

**Use**: ios-simulator-skill scripts for navigation
**Evidence**: Screenshot at each step
**Validation**: Complete workflow works

---

## HONEST SUCCESS CRITERIA

**Phase 1 Success**: App launches, see actual UI (not red screen)
**Phase 2 Success**: 10 screenshots showing flat black theme
**Phase 3 Success**: 12 screenshots showing all screens work
**Phase 4 Success**: Screenshots of tool cards rendering
**Phase 5 Success**: Screenshots of complete e2e flow

**NO MORE**:
- Claiming complete without screenshots
- "Code exists" = validation
- Moving on while app crashes
- Giving up on debugging

**Current Reality**: I'm at 40/99 (40.4% complete), not 95% or "nearly done"
