# Metro Error Evidence - Complete Investigation

**Date**: 2025-11-01
**Investigation**: Systematic debugging Phase 1 (Root Cause Investigation)
**Method**: Compare working commit, analyze logs, check dependencies

---

## ERROR OBSERVED

**Symptom**: Red JavaScript error screen in app
**Error Message**: `expo/index.js: Cannot find module 'babel-plugin-module-resolver'`
**Occurrence**: BOTH in "working" commit 2cb76aa AND current main branch

---

## EVIDENCE COLLECTED

### Finding 1: Error Exists in "Working" Commit

**Test**: Checked out commit 2cb76aa (documented as last working)
**Result**: ❌ SAME ERROR - Red screen, babel-plugin-module-resolver missing
**Screenshot**: WorkingCommit2cb76aa-Initial (identical error to current)

**Conclusion**: NOT a code regression - this is an environment/dependency issue

### Finding 2: Missing Dependency

**Checked**: `node_modules/babel-plugin-module-resolver`
**Result**: ❌ MISSING (ls: No such file or directory)

**Checked**: `npm list babel-plugin-module-resolver`
**Result**: "(empty)" - no package in dependency tree requires it

**Checked**: `package.json` devDependencies + dependencies
**Result**: babel-plugin-module-resolver NOT listed

**Conclusion**: Module referenced by Expo but not in dependency tree

### Finding 3: babel.config.js Location

**Expected Location**: `claude-code-mobile/babel.config.js`
**Actual Location**: `/Users/nick/Desktop/claude-mobile-expo/babel.config.js` (PARENT directory)

**Content**:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

**Note**: Does NOT reference babel-plugin-module-resolver explicitly

**Conclusion**: babel.config.js in wrong location

### Finding 4: Missing metro.config.js

**Checked**: `claude-code-mobile/metro.config.js`
**Result**: ❌ File does not exist

**Expo Default**: Uses built-in Metro config if not present
**Issue**: May cause babel.config.js lookup issues

### Finding 5: TypeScript Compilation Errors

**Command**: `npx tsc --noEmit` (filtered to src/ only)
**Errors Found**: 4 total

**Error 1-3**: src/navigation/AppNavigator.tsx (lines 68, 75, 82)
- Type '"Projects"' not assignable to RootStackParamList
- Type '"MCPManagement"' not assignable to RootStackParamList  
- Type '"Git"' not assignable to RootStackParamList
**Cause**: New screens added but type definitions not updated

**Error 4**: src/screens/GitScreen.tsx + MCPManagementScreen.tsx
- Property 'secondary' does not exist on theme.colors
**Cause**: theme.colors.secondary not defined in constants/theme.ts

**Note**: These are NEW code additions (post 2cb76aa), but are NOT the cause of Metro crash

### Finding 6: No Configuration Changes

**git diff 2cb76aa..HEAD**: 
- package.json: NO CHANGES ✅
- app.json: NO CHANGES ✅
- tsconfig.json: NO CHANGES ✅

**Code Changes** (5 commits):
- 4e3e1bf: Create root assets directory
- c570b4d: HTTPClient visibility fix
- 064eed5: CodeViewerScreen implementation
- b4e6a3f: FileBrowserScreen backend integration
- 82c7fe2: v2.0 backend APIs + flat black UI

**Conclusion**: Code evolved but configuration stable

### Finding 7: node_modules State

**Last npm install**: 2025-11-01 13:43 (1:43 PM)
**package.json modified**: 2025-11-01 03:42 (3:42 AM)  
**Dependencies installed**: 1060 packages
**Status**: Appears up to date

**But**: babel-plugin-module-resolver still missing despite being required

---

## ROOT CAUSE HYPOTHESIS

**Primary Hypothesis**: Expo/Metro expects babel.config.js in React Native project root, but it's in parent directory. This causes Metro to look for fallback configuration which references babel-plugin-module-resolver (a common Expo Metro plugin).

**Supporting Evidence**:
1. ✅ babel.config.js in wrong location (parent vs project root)
2. ✅ metro.config.js completely missing (would specify babel config location)
3. ✅ Error occurs in BOTH commits (not code-related)
4. ✅ Error from "expo/index.js" (Expo internals, not our code)
5. ✅ babel-plugin-module-resolver not in our dependencies (but Expo may expect it)

**Alternative Hypotheses**:
- H2: node_modules corrupted (less likely - npm install shows "up to date")
- H3: Expo SDK version mismatch (less likely - no config changes)
- H4: React Native/Metro cache issue (possible - but --clear flag used)

---

## MINIMAL TEST FOR HYPOTHESIS

**If Primary Hypothesis Correct**:
1. Copy babel.config.js from parent to `claude-code-mobile/babel.config.js`
2. Restart Metro with cache clear
3. App should load without babel error

**Expected Result**: Error disappears, app loads (may have TypeScript errors but not Metro crash)

**Alternative if H1 Wrong**: 
- Install babel-plugin-module-resolver explicitly
- OR create metro.config.js to specify babel config path

---

## NEXT STEPS (Systematic Debugging Phase 1.3)

**DO NOT FIX YET** - Need to test hypothesis first:

1. Test H1: Copy babel.config.js to correct location
2. Restart Metro with --clear
3. Launch app, take screenshot
4. Analyze result:
   - ✅ If works: H1 correct, implement proper fix
   - ❌ If same error: H1 wrong, try H2/H3
   - ⚠️ If different error: Progress, investigate new error

---

**Evidence Gathering Status**: COMPLETE ✅
**Ready For**: Phase 1.2 (Hypothesis Testing)
