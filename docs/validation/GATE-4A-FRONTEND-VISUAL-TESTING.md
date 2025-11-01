# VALIDATION GATE 4A: Frontend Visual Testing

> **Required Before**: Phase 4 (Frontend) complete  
> **Required After**: Phase 6 (Integration)  
> **Skills**: @claude-mobile-ios-testing, @claude-mobile-metro-manager, @systematic-debugging (if fails)  
> **Automation**: build-ios.sh, capture-screenshots.sh, validate-gate-4a.sh  
> **MCP Tools**: xc-mcp (ALL iOS operations)

---

## Purpose

Verify complete frontend functionality using iOS simulator and xc-mcp automation:
- ✅ Build iOS app via xc-mcp::xcodebuild-build
- ✅ Boot simulator via xc-mcp::simctl-boot
- ✅ Install app via xc-mcp::simctl-install
- ✅ Screenshots via xc-mcp::screenshot
- ✅ UI testing via xc-mcp::idb-ui-tap and idb-ui-input
- ✅ Visual verification (manual with screenshots)

**GATE REQUIREMENT**: ALL screens must render correctly, NO backend needed yet.

---

## Prerequisites

**Invoke Skill**: @claude-mobile-metro-manager

### Start Metro Bundler

```typescript
// Use Metro manager skill
mcp__serena__execute_shell_command({
  command: "./scripts/start-metro.sh",
  cwd: "/Users/nick/Desktop/claude-mobile-expo"
});

// Verify Metro ready
mcp__morphllm__read_file({
  path: "/Users/nick/Desktop/claude-mobile-expo/logs/metro.log",
  head: 50
});
// Must contain: "Metro.*waiting" or "Metro.*ready"
```

---

## Test 1: iOS Build via xc-mcp

**Use xc-mcp** (not npx react-native run-ios):

```typescript
// Build iOS app
mcp__xc-mcp__xcodebuild-build({
  projectPath: "/Users/nick/Desktop/claude-mobile-expo/mobile",
  scheme: "ClaudeCodeMobile",
  configuration: "Debug",
  destination: "platform=iOS Simulator,name=iPhone 14"
});
```

**Expected**:
- Build succeeds
- .app bundle created
- No compilation errors

**Pass Criteria**:
- ✅ xcodebuild-build returns success
- ✅ Build completes in < 5 minutes (first build)
- ✅ No TypeScript errors
- ✅ No React Native errors

---

## Test 2: Boot Simulator via xc-mcp

**Invoke Skill**: @claude-mobile-ios-testing

```typescript
// Suggest best simulator
mcp__xc-mcp__simctl-suggest({
  projectPath: "/Users/nick/Desktop/claude-mobile-expo/mobile"
});

// Boot iPhone 14
mcp__xc-mcp__simctl-boot({
  deviceId: "iPhone 14",
  waitForBoot: true,
  openGui: true
});
```

**Expected**:
- Simulator boots
- GUI opens
- Ready for app installation

**Pass Criteria**:
- ✅ Simulator booted successfully
- ✅ Boot time < 30 seconds
- ✅ GUI visible on screen

---

## Test 3: Install App via xc-mcp

```typescript
mcp__xc-mcp__simctl-install({
  udid: "booted", // or specific UUID
  appPath: "/Users/nick/Desktop/claude-mobile-expo/mobile/ios/build/Build/Products/Debug-iphonesimulator/ClaudeCodeMobile.app"
});
```

**Expected**: App installed on simulator

**Pass Criteria**:
- ✅ Installation succeeds
- ✅ App icon appears on home screen

---

## Test 4: Launch App via xc-mcp

```typescript
mcp__xc-mcp__simctl-launch({
  udid: "booted",
  bundleId: "com.yourcompany.claudecodemobile"
});
```

**Expected**: App launches, shows ChatScreen

**Pass Criteria**:
- ✅ App launches without crash
- ✅ Launch time < 3 seconds
- ✅ ChatScreen visible

---

## Test 5-11: Screenshot Capture via xc-mcp

**Use xc-mcp screenshot** (not xcrun simctl io):

```typescript
// Screenshot 1: Chat empty state
mcp__xc-mcp__screenshot({
  appName: "ClaudeCodeMobile",
  screenName: "Chat",
  state: "empty",
  size: "half" // Token optimization
});

// Screenshot 2: Settings screen
// (Navigate manually, then capture)
mcp__xc-mcp__screenshot({
  appName: "ClaudeCodeMobile",
  screenName: "Settings",
  state: "default",
  size: "half"
});

// Screenshot 3: FileBrowser
mcp__xc-mcp__screenshot({
  appName: "ClaudeCodeMobile",
  screenName: "FileBrowser",
  state: "default",
  size: "half"
});

// Screenshot 4: CodeViewer
mcp__xc-mcp__screenshot({
  appName: "ClaudeCodeMobile",
  screenName: "CodeViewer",
  state: "with-file",
  size: "half"
});

// Screenshot 5: Sessions
mcp__xc-mcp__screenshot({
  appName: "ClaudeCodeMobile",
  screenName: "Sessions",
  state: "empty",
  size: "half"
});

// Screenshot 6: Slash menu
mcp__xc-mcp__screenshot({
  appName: "ClaudeCodeMobile",
  screenName: "Chat",
  state: "slash-menu-open",
  size: "half"
});

// Screenshot 7: Chat with messages
mcp__xc-mcp__screenshot({
  appName: "ClaudeCodeMobile",
  screenName: "Chat",
  state: "with-messages",
  size: "half"
});
```

**Automated via Script**:

```typescript
mcp__serena__execute_shell_command({
  command: "./scripts/capture-screenshots.sh 'iPhone 14' 'gate-4a'",
  cwd: "/Users/nick/Desktop/claude-mobile-expo"
});
```

**Pass Criteria**:
- ✅ All 7 screenshots captured
- ✅ Screenshots saved to validation/gate-4a-screenshots/
- ✅ No blank/white screens
- ✅ All UI elements visible

---

## Test 12: UI Interaction via xc-mcp

**Get UI Accessibility Tree**:

```typescript
mcp__xc-mcp__idb-ui-describe({
  operation: "all",
  screenContext: "ChatScreen"
});
```

**Tap Input Field**:

```typescript
mcp__xc-mcp__idb-ui-tap({
  x: 200,
  y: 700,
  actionName: "Tap message input",
  screenContext: "ChatScreen"
});
```

**Type Text**:

```typescript
mcp__xc-mcp__idb-ui-input({
  operation: "text",
  text: "Test message",
  fieldContext: "Message input"
});
```

**Pass Criteria**:
- ✅ UI tree shows expected elements
- ✅ Tap registers (keyboard appears)
- ✅ Text appears in input field

---

## Test 13: Multi-Device Testing

**Test on 3 devices**:

```typescript
const devices = ["iPhone SE (3rd generation)", "iPhone 14", "iPhone 14 Pro Max"];

for (const device of devices) {
  // Boot device
  mcp__xc-mcp__simctl-boot({deviceId: device, waitForBoot: true});
  
  // Install app (same path)
  mcp__xc-mcp__simctl-install({udid: "booted", appPath: "..."});
  
  // Launch
  mcp__xc-mcp__simctl-launch({udid: "booted", bundleId: "com.yourcompany.claudecodemobile"});
  
  // Capture screenshot
  mcp__xc-mcp__screenshot({
    appName: "ClaudeCodeMobile",
    screenName: `Chat-${device}`,
    state: "empty"
  });
  
  // Shutdown
  mcp__xc-mcp__simctl-shutdown({deviceId: "booted"});
}
```

**Pass Criteria**:
- ✅ Renders correctly on iPhone SE (small screen)
- ✅ Renders correctly on iPhone 14 (standard)
- ✅ Renders correctly on iPhone 14 Pro Max (large screen)
- ✅ No layout overflow on any device
- ✅ All interactive elements accessible

---

## Test 14: Automated Gate Validation

**Execute Complete Gate**:

```typescript
mcp__serena__execute_shell_command({
  command: "./scripts/validate-gate-4a.sh 'iPhone 14'",
  cwd: "/Users/nick/Desktop/claude-mobile-expo"
});
```

**Expected**:
```
🧪 VALIDATION GATE 4A: Frontend Visual Testing
===============================================
Device: iPhone 14

⚙️ Test 1: Building iOS app...
✅ Build: PASS

⚙️ Test 2: Capturing screenshots...
✅ Screenshots: PASS

⚙️ Test 3: Verifying screenshot count...
✅ Screenshot count: PASS (7/7)

⚙️ Test 4: Visual inspection required...
[Manual review]
✅ Visual inspection: PASS

⚙️ Test 5: App stability (60 second test)...
✅ Stability: PASS

📊 Results: 5/5 tests passed
✅ VALIDATION GATE 4A: PASSED
```

---

## Manual Visual Verification

**For each screenshot, verify**:

### Colors (from spec lines 217-257)
- ✅ Background: Purple gradient (#0f0c29 → #302b63 → #24243e)
- ✅ Primary: Teal (#4ecdc4)
- ✅ Text: Off-white (#ecf0f1)

### Typography (from spec lines 260-308)
- ✅ Font sizes: 10-32px range visible
- ✅ Weights: Light to bold used appropriately
- ✅ Monospace: Menlo for code

### Spacing (from spec lines 310-325)
- ✅ 8-point grid: 8px, 16px, 24px, 32px spacing visible
- ✅ Consistent padding throughout

### Components
- ✅ Message bubbles: User (teal, right), Assistant (transparent, left)
- ✅ Input field: Rounded, bottom, safe area respected
- ✅ Buttons: Circular send button visible
- ✅ Navigation: Settings gear icon visible

---

## Save Results

```typescript
mcp__serena__write_memory({
  memory_name: "validation-gate-4a-results",
  content: `
# Validation Gate 4A Results
Date: 2025-10-30
Status: PASSED ✅

Build: ✅ Success via xc-mcp::xcodebuild-build
Simulator: ✅ iPhone 14 booted via xc-mcp::simctl-boot
Install: ✅ App installed via xc-mcp::simctl-install
Launch: ✅ App launched successfully

Screenshots: 7/7 captured via xc-mcp::screenshot
- Chat (empty) ✅
- Chat (with messages) ✅
- Settings ✅
- FileBrowser ✅
- CodeViewer ✅
- Sessions ✅
- Slash menu ✅

Visual Verification:
- Colors match spec ✅
- Typography correct ✅
- Spacing consistent ✅
- Layout correct on all devices ✅

Multi-device: iPhone SE, 14, Pro Max all pass ✅

Frontend ready for backend integration (Phase 6).
`
});
```

---

## Gate Pass Criteria

- ✅ xc-mcp::xcodebuild-build succeeds
- ✅ All xc-mcp::simctl-* operations work
- ✅ App installs and launches via xc-mcp
- ✅ 7 screenshots via xc-mcp::screenshot
- ✅ Visual verification passes
- ✅ UI interactions work (via xc-mcp::idb-ui-*)
- ✅ Multi-device responsive
- ✅ No crashes during testing
- ✅ validate-gate-4a.sh exits with code 0

**Result**: PASS → Proceed to Phase 6 Integration  
**Result**: FAIL → @systematic-debugging, fix, re-test

---

**End of Gate 4A**
