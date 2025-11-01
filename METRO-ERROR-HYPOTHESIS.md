# Metro Error - Root Cause Hypothesis

**Date**: 2025-11-01
**Phase**: Systematic Debugging Phase 1.2 (Pattern Analysis)

---

## PRIMARY HYPOTHESIS (H1): babel.config.js Location Error

**Statement**: Metro bundler expects `babel.config.js` in the React Native project root (`claude-code-mobile/`) but it's located in the parent directory (`/Users/nick/Desktop/claude-mobile-expo/`). This causes Metro to use fallback Expo configuration which references `babel-plugin-module-resolver`, but this plugin is not installed in node_modules.

### Evidence Supporting H1:

1. ✅ **babel.config.js is in WRONG location**
   - Expected: `claude-code-mobile/babel.config.js`
   - Actual: `/Users/nick/Desktop/claude-mobile-expo/babel.config.js` (parent)
   - Metro runs from claude-code-mobile/, won't find config in parent

2. ✅ **metro.config.js is MISSING**
   - File: `claude-code-mobile/metro.config.js` does not exist
   - Without it: Metro uses default config
   - Default config: May not know to look in parent for babel.config.js

3. ✅ **Error references Expo internals**
   - Error from: `expo/index.js`
   - Not our code: Expo's code trying to load babel plugin
   - Suggests: Expo's default Metro config expects the plugin

4. ✅ **Error identical in both commits**
   - Working commit 2cb76aa: Same error
   - Current HEAD: Same error
   - Proves: NOT a code change issue

5. ✅ **babel-plugin-module-resolver not in dependencies**
   - Not in package.json
   - Not in node_modules
   - npm list: "(empty)"
   - But Expo may include it transitively if config correct

### Working Example Pattern:

Standard Expo project structure:
```
my-expo-app/
├── babel.config.js          ← Should be HERE
├── metro.config.js           ← Should exist
├── app.json
├── package.json
└── node_modules/
```

Our structure:
```
claude-mobile-expo/
├── babel.config.js           ← Currently HERE (wrong level)
├── claude-code-mobile/
│   ├── babel.config.js       ← Should be HERE (missing)
│   ├── metro.config.js       ← Missing entirely
│   ├── app.json
│   └── package.json
```

---

## MINIMAL TEST FOR H1

**Single Change**: Copy babel.config.js to correct location

```bash
cp /Users/nick/Desktop/claude-mobile-expo/babel.config.js \
   /Users/nick/Desktop/claude-mobile-expo/claude-code-mobile/babel.config.js
```

**Restart Metro**:
```bash
pkill -f "expo start"
cd claude-code-mobile
rm -rf .expo node_modules/.cache
npx expo start --clear
```

**Launch App & Screenshot**:
```bash
xcrun simctl launch booted com.yourcompany.claudecodemobile
sleep 15
# Screenshot with xc-mcp
```

### Expected Results:

**If H1 Correct**:
- ✅ babel-plugin-module-resolver error DISAPPEARS
- ✅ App loads (may show TypeScript errors but not Metro crash)
- ✅ Can see UI or different errors

**If H1 Wrong**:
- ❌ Same babel error persists
- → Try H2 (install plugin explicitly)
- → Try H3 (fresh npm install)

---

## ALTERNATIVE HYPOTHESES (If H1 Fails)

### H2: Missing Transitive Dependency

**Theory**: babel-plugin-module-resolver should be installed by babel-preset-expo but isn't

**Test**:
```bash
cd claude-code-mobile
npm install --save-dev babel-plugin-module-resolver
```

### H3: Corrupted node_modules

**Theory**: npm install incomplete or corrupted

**Test**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### H4: Expo SDK / Metro Version Issue

**Theory**: Expo 54 expects different babel setup

**Test**:
```bash
npx expo-doctor
npx expo install --fix
```

---

## DECISION TREE

```
Test H1 (babel.config location)
  ├─ Success → Implement proper fix, continue to TypeScript errors
  └─ Failure
      ├─ Test H2 (install plugin)
      │   ├─ Success → Document why needed, continue
      │   └─ Failure → Test H3
      └─ Test H3 (fresh npm install)
          ├─ Success → Document corruption, continue
          └─ Failure → Deep investigation needed
```

---

## CONFIDENCE LEVEL

**H1 Confidence**: 85%
- Strong evidence (wrong location, missing metro.config)
- Common Expo setup issue
- Explains all symptoms

**If H1 Fails**: 
- H2 Confidence: 60% (transitive dependency issue)
- H3 Confidence: 40% (corruption less likely with "up to date" status)

---

**Status**: Ready for Phase 1.3 (Hypothesis Testing)
**Next Action**: Test H1 with minimal change, analyze result
