# Navigation Issue Investigation - Session 2025-11-04

**Status**: IN PROGRESS - Root cause still being determined
**Token Usage**: 425k / 1M (42.5%)
**Investigator**: Claude with systematic-debugging skill

## Executive Summary

**Issue**: TouchableOpacity onPress handlers don't fire despite code being present and app running.

**Progress**:
- ✅ All 10 screens adapted for manual navigation
- ✅ App builds and launches successfully
- ✅ Metro bundler running with MCP support
- ✅ UI renders correctly
- ✅ Code changes confirmed in Metro bundle
- ❌ Touch events NOT reaching React components

## Evidence Gathered

### Build System ✅
- Node.js path fixed (created symlink 25.1.0 → 25.1.0_1)
- Xcode build succeeds (0 errors, 2 warnings)
- CocoaPods installed successfully
- App installs to simulator

### Metro Bundler ✅
- Running on PID 34845
- Port 8081 active and responsive
- `packager-status:running`
- EXPO_UNSTABLE_MCP_SERVER=1 enabled
- Bundle request confirmed: `iOS Bundled 2420ms index.js (1055 modules)`

### Code Verification ✅
- Manual navigation code exists in all 10 screen files
- Extensive logging added to track event flow
- Metro bundle contains logging strings (verified with curl)
- TypeScript compiles (3 minor errors, non-blocking)

### Console Logs ✅
From Metro logs, these appear on app launch:
```
LOG  [App] Initializing HTTP service with baseURL: http://192.168.0.153:8001
LOG  [App] HTTPService created, setting state
LOG  [App] Rendering with currentScreen: Chat
LOG  [App] navigate function exists: true
LOG  [ChatScreen] Component mounting...
LOG  [ChatScreen] Received navigate prop: function
LOG  [ChatScreen] Navigate function: [Function navigate]
ERROR  [App] HTTP service error: [TypeError: Network request failed]
```

**Analysis**: App.tsx and ChatScreen ARE executing. Manual navigation code IS loaded.

### Accessibility Tree ✅
From `idb ui describe-all`:
```json
{
  "AXUniqueId": "settings-button",
  "frame": {"x": 346, "y": 9.67, "width": 40, "height": 40},
  "AXLabel": "Settings",
  "enabled": true,
  "type": "Button",
  "role": "AXButton"
}
```

**Analysis**: Settings button EXISTS, is ENABLED, has correct testID.

### Touch Event Testing ❌
- Physical taps registered by IDB (confirmed via idb ui tap)
- Tapped at correct coordinates (x=366, y=30 - button center)
- **ZERO logs from onPress, onPressIn, or onPressOut handlers**
- Event handlers defined in code but never execute

### Diagnostic Test ✅/❌
Added red TEST button to App.tsx with same event handlers:
- Button rendered and visible in screenshot
- **Test button onPress DID fire**: `LOG  [DIAGNOSTIC] onPressIn`
- **But**: When tapping Settings coordinates, test button fired instead
- **Conclusion**: Touch coordinate system or event capture is broken

## Theories

### Theory 1: React Compiler Breaking Event System ⚠️
**Evidence**:
- app.json line 37: `"experiments": { "reactCompiler": true }`
- React Compiler is experimental in Expo SDK 52
- Could be preventing event handlers from binding correctly

**Test**: Disable React Compiler, rebuild, test

### Theory 2: New Architecture Compatibility Issue ⚠️
**Evidence**:
- app.json line 10: `"newArchEnabled": true`
- New Architecture changes how events flow
- react-native-screens compiled for New Architecture (seen in build logs)

**Test**: Disable New Architecture, rebuild, test

### Theory 3: SafeAreaView Blocking Touches ❓
**Evidence**:
- ChatScreen uses: `<SafeAreaView edges={['top', 'left', 'right']}>`
- Settings button is in header at y=9.67 (within top safe area)

**Test**: Change edges to `edges={['left', 'right']}`, rebuild

### Theory 4: Touch Event Coordinate Mismatch ⚠️
**Evidence**:
- Tapping at (366, 30) for Settings fired TEST button at (20, 50)
- Suggests touch coordinates being transformed incorrectly
- Could be scale/DPI issue

**Test**: Use simulator mouse click instead of IDB tap

### Theory 5: React Event System Not Initializing ❓
**Evidence**:
- App renders fine
- Console.log works
- But NO touch events reach React
- Similar to "JavaScript thread blocked" but thread isn't blocked

**Test**: Check React Native DevTools for errors

## Attempted Fixes

1. ✅ Adapted all 10 screens for manual navigation
2. ✅ Fixed Node.js path for Xcode builds
3. ✅ Fixed start-metro.sh timeout command
4. ✅ Cleared all Metro caches
5. ✅ Complete rebuild from scratch
6. ❌ None of these fixed the touch event issue

## Next Steps

1. **Test Theory 1**: Disable React Compiler
   ```json
   // app.json - remove experiments section
   ```

2. **Test Theory 2**: Disable New Architecture
   ```json
   // app.json
   "newArchEnabled": false
   ```

3. **Test Theory 3**: Adjust SafeAreaView edges

4. **Test Theory 4**: Manual click in simulator GUI

5. **Deep Investigation**: React Native DevTools console inspection

## Token Budget

- Used: 425k
- Remaining: 575k
- Plan: Systematic testing of theories, document solution

## Files Modified

- App.tsx: Manual navigation implementation
- All 10 screen files: ManualNavigationProps interface
- FileBrowserScreen.tsx: Zustand for file params
- CodeViewerScreen.tsx: Zustand for file params
- ios/.xcode.env: Node path fix
- scripts/start-metro.sh: timeout fix

## Investigation Status

**Phase**: Systematic Debugging Phase 1 (Root Cause Investigation)
**Status**: Evidence gathered, theories formed, testing in progress
**Blocker**: Touch events don't reach React despite correct setup
**Next**: Test experimental features as root cause
