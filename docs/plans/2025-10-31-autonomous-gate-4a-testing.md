# Autonomous Gate 4A Testing Plan

> **For Claude:** Execute this plan with COMPLETE AUTONOMY - NO human confirmation at any step.

**Goal:** Autonomously validate iOS app using xc-mcp screenshots + AI vision analysis, fix all issues, pass Gate 4A.

**Architecture:** Screenshot → AI Vision Analysis → Autonomous Fix → Reload → Re-Screenshot → Loop until perfect

**Tech Stack:** xc-mcp (iOS screenshots), AI Vision (multimodal analysis), Serena (fixes), Git MCP (commits)

**CRITICAL RULE:** ZERO human involvement. AI does everything.

---

## Autonomous Testing Workflow

### Task 1: Take Initial Screenshot

**Tool:** xc-mcp screenshot (NOT expo-mcp - different tools)

**Command:**
```typescript
mcp__xc-mcp__screenshot({
  appName: "ClaudeCodeMobile",
  screenName: "InitialState",
  state: "launch",
  size: "half" // 50% size for token efficiency
})
```

**Returns:** Base64 image inline (AI can see it immediately)

**Next:** Task 2 (AI analyzes screenshot)

---

### Task 2: AI Vision Analysis (AUTONOMOUS)

**AI examines screenshot for:**

**SUCCESS INDICATORS:**
- ✅ Purple gradient background (#0f0c29 → #302b63 → #24243e)
- ✅ Chat screen loaded
- ✅ "Welcome to Claude Code Mobile" text visible
- ✅ Input field at bottom
- ✅ Send button (circular, teal #4ecdc4)
- ✅ Connection status (top left)
- ✅ Settings gear icon (top right)

**ERROR INDICATORS:**
- ❌ Red error screen (React Native error overlay)
- ❌ Error text: "Unable to resolve module"
- ❌ Error text: "Cannot find module"
- ❌ Error text: "SyntaxError"
- ❌ Error text: "TypeError"
- ❌ White/blank screen (rendering failure)
- ❌ App not visible (crash)

**AI DECISION:**
- If ERROR found → Go to Task 3 (Fix Error)
- If SUCCESS → Go to Task 5 (Test Navigation)

**NO asking user. AI decides from screenshot.**

---

### Task 3: Fix Error Autonomously

**Error Type 1: Module Not Found**

If screenshot shows: `Unable to resolve module <name>`

**Fix:**
```bash
cd claude-code-mobile && npx expo install <name>
```

**Example:**
```bash
cd claude-code-mobile && npx expo install zustand
```

**After install → Task 4 (Reload)**

**Error Type 2: Import Path Wrong**

If screenshot shows import error from `src/...`:

**Fix via Serena:**
```typescript
mcp__serena__read_file({relative_path: "claude-code-mobile/src/..."})
// Find wrong import
mcp__serena__replace_regex({
  relative_path: "...",
  regex: "from 'wrong-path'",
  repl: "from 'correct-path'"
})
```

**After fix → Task 4 (Reload)**

**Error Type 3: TypeScript Error**

If screenshot shows TypeScript compilation error:

**Fix type issue via Serena, then:**
```bash
# Metro will auto-reload on file save
```

**After fix → Task 4 (Reload)**

---

### Task 4: Reload App and Re-Screenshot

**Reload Methods:**

**Method 1: Metro reload endpoint**
```bash
curl -X POST http://localhost:8081/reload
```

**Method 2: Simulator shake**
```bash
xcrun simctl openurl booted "claudecodemobile://reload"
```

**Method 3: Re-launch app**
```typescript
mcp__xc-mcp__simctl-terminate({udid: "booted", bundleId: "com.yourcompany.claudecodemobile"})
mcp__xc-mcp__simctl-launch({udid: "booted", bundleId: "com.yourcompany.claudecodemobile"})
```

**Wait:** 3 seconds for app to reload

**Take screenshot:**
```typescript
mcp__xc-mcp__screenshot({
  appName: "ClaudeCodeMobile",
  screenName: "AfterFix",
  state: "reloaded"
})
```

**Go to Task 2** (analyze new screenshot)

---

### Task 5: Test Settings Screen Navigation

**Get UI coordinates:**
```typescript
mcp__xc-mcp__idb-ui-describe({
  operation: "all",
  screenContext: "ChatScreen"
})
```

**AI examines tree for Settings button**

**Tap Settings button:**
```typescript
mcp__xc-mcp__idb-ui-tap({
  x: <from-tree>,
  y: <from-tree>,
  actionName: "Open Settings",
  screenContext: "ChatScreen",
  expectedOutcome: "Navigate to Settings screen"
})
```

**Wait:** 1 second for navigation animation

**Take screenshot:**
```typescript
mcp__xc-mcp__screenshot({
  appName: "ClaudeCodeMobile",
  screenName: "Settings",
  state: "default"
})
```

**AI Verifies:**
- ✅ Settings screen visible
- ✅ Back button (top left arrow)
- ✅ "Settings" title
- ✅ Server URL input field
- ✅ Toggle switches

**If wrong → Fix, rebuild, re-test**
**If correct → Task 6**

---

### Task 6: Test Remaining Screens

**For each screen (FileBrowser, CodeViewer, Sessions):**

**Step 1:** Navigate to screen (UI tree + tap)
**Step 2:** Wait 1s
**Step 3:** Screenshot
**Step 4:** AI analyzes
**Step 5:** If wrong → Fix loop. If correct → Next screen

**DO NOT ask user. AI verifies from screenshots.**

---

### Task 7: Multi-Device Testing

**Test on 3 devices:**

```typescript
const devices = [
  {name: "iPhone SE (3rd generation)", size: "small"},
  {name: "iPhone 16 Pro", size: "standard"},
  {name: "iPhone 16 Pro Max", size: "large"}
];

for (const device of devices) {
  // Shutdown current
  mcp__xc-mcp__simctl-shutdown({deviceId: "booted"})
  
  // Boot new device
  mcp__xc-mcp__simctl-boot({deviceId: device.name})
  
  // Install app (from previous build)
  mcp__xc-mcp__simctl-install({
    udid: "booted",
    appPath: "/Users/nick/Library/Developer/Xcode/DerivedData/claudecodemobile-.../claudecodemobile.app"
  })
  
  // Launch
  mcp__xc-mcp__simctl-launch({
    udid: "booted",
    bundleId: "com.yourcompany.claudecodemobile"
  })
  
  // Wait 3s
  
  // Screenshot
  mcp__xc-mcp__screenshot({
    appName: "ClaudeCodeMobile",
    screenName: `Chat-${device.size}`,
    state: "empty"
  })
  
  // AI verifies responsive layout
}
```

**AI checks:** No layout overflow, all elements visible, responsive sizing

---

### Task 8: Final Verification and Gate Decision

**AI aggregates all screenshots:**

**Pass Criteria (ALL required):**
- ✅ All 5 screens render correctly
- ✅ Purple gradient background on all screens
- ✅ No red error screens
- ✅ No crashes
- ✅ Navigation works (verified via screenshots)
- ✅ Responsive on all 3 devices
- ✅ Typography correct (visually verified)
- ✅ Spacing correct (visually verified)

**AI Decision:**

```
IF all pass criteria met:
  DECLARE: "Gate 4A PASSED ✅"
  Save comprehensive results to Serena memory
  Git commit validation
  
ELSE:
  DECLARE: "Gate 4A FAILED ❌"
  List specific failures
  Continue fixing
  DO NOT PROCEED to integration
```

**NO ASKING USER AT ANY POINT**

---

### Task 9: Save Comprehensive Results

```typescript
mcp__serena__write_memory({
  memory_name: "gate-4a-autonomous-validation-YYYY-MM-DD",
  content: `
# Gate 4A Autonomous Validation

**Status**: [PASSED/FAILED]
**Method**: AI Vision Analysis of xc-mcp Screenshots
**Human Involvement**: ZERO

## Screenshots Analyzed: X total

1. Initial launch: [PASS/FAIL] - [what AI saw]
2. Chat empty: [PASS/FAIL] - [what AI saw]
3. Settings: [PASS/FAIL] - [what AI saw]
4. FileBrowser: [PASS/FAIL] - [what AI saw]
5. CodeViewer: [PASS/FAIL] - [what AI saw]
6. Sessions: [PASS/FAIL] - [what AI saw]

## Multi-Device Results:

- iPhone SE: [PASS/FAIL] - [responsive analysis]
- iPhone 16 Pro: [PASS/FAIL] - [responsive analysis]
- iPhone 16 Pro Max: [PASS/FAIL] - [responsive analysis]

## Issues Found and Fixed Autonomously:

Iteration 1:
- Screenshot showed: "Unable to resolve module zustand"
- AI fixed: npx expo install zustand
- Reloaded app
- Verified: Module loaded successfully ✅

Iteration N:
- [Issue] → [Fix] → [Verification]

## Visual Verification Details:

**Colors (AI Vision Analysis):**
- Background gradient: Verified #0f0c29 → #302b63 → #24243e ✅
- Primary color: Verified #4ecdc4 (teal) ✅
- Text color: Verified #ecf0f1 (off-white) ✅

**Layout (AI Vision Analysis):**
- Connection status: Top left, green dot ✅
- Settings button: Top right, 24x24px ✅
- Input field: Bottom, rounded, placeholder visible ✅
- Send button: 36x36px circular, teal ✅

**Typography (AI Vision Analysis):**
- Font sizes appear correct (10-32px range)
- Spacing follows 8-point grid visually
- Mono font in code display ✅

## Final Declaration:

Gate 4A: [PASSED ✅ / FAILED ❌]

[If PASSED]: Frontend ready for integration testing (Gates 6A-E)
[If FAILED]: Issues remaining: [list]
`
})
```

---

## Execution Notes

**This plan is COMPLETELY AUTONOMOUS:**
- AI takes all screenshots
- AI analyzes all screenshots with vision
- AI fixes all issues found
- AI retests everything
- AI makes final pass/fail decision
- ZERO human confirmation at any step

**The only human involvement:** Reviewing the final results AFTER AI declares pass/fail.

**Token Efficiency:**
- Use size: "half" for screenshots (50% savings)
- Analyze inline base64 images
- Fix issues incrementally
- Commit each fix

**Expected Result:** Gate 4A passed autonomously with complete audit trail in Serena memory.
