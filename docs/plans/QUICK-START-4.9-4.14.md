# Quick Start: Tasks 4.9-4.14

**One-page reference for executing Tasks 4.9-4.14**

---

## Prerequisites

- ✅ Tasks 4.1-4.8 complete
- ✅ On `development` branch
- ✅ In directory: `/Users/nick/Desktop/claude-mobile-expo`

---

## Task 4.9: FileBrowser Screen (5 steps)

```bash
# Step 1: Create FileBrowserScreen.tsx (~300 lines)
# Copy from: tasks-4.9-4.14.md Task 4.9 Step 4.9.1

# Step 2: Install haptics
npx expo install expo-haptics

# Step 3: Validate
cat mobile/src/screens/FileBrowserScreen.tsx | wc -l  # ~300

# Step 4: Git commit
git add mobile/src/screens/FileBrowserScreen.tsx
git commit -m "feat(mobile): implement FileBrowserScreen with directory navigation"
```

---

## Task 4.10: CodeViewer Screen (2 steps)

```bash
# Step 1: Create CodeViewerScreen.tsx (~250 lines)
# Copy from: tasks-4.9-4.14.md Task 4.10 Step 4.10.1

# Step 2: Validate & commit
cat mobile/src/screens/CodeViewerScreen.tsx | wc -l  # ~250
git add mobile/src/screens/CodeViewerScreen.tsx
git commit -m "feat(mobile): implement CodeViewerScreen with syntax display and font controls"
```

---

## Task 4.11: Sessions Screen (2 steps)

```bash
# Step 1: Create SessionsScreen.tsx (~400 lines)
# Copy from: tasks-4.9-4.14.md Task 4.11 Step 4.11.1

# Step 2: Validate & commit
cat mobile/src/screens/SessionsScreen.tsx | wc -l  # ~400
git add mobile/src/screens/SessionsScreen.tsx
git commit -m "feat(mobile): implement SessionsScreen with session management and restoration"
```

---

## Task 4.12: Navigation (4 steps)

```bash
# Step 1: Create AppNavigator.tsx (~80 lines)
# Copy from: tasks-4.9-4.14.md Task 4.12 Step 4.12.1

# Step 2: Verify navigation types
cat mobile/src/types/navigation.ts | grep -E "Chat|FileBrowser|CodeViewer|Settings|Sessions"

# Step 3: Install dependencies
cd mobile
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

# Step 4: Validate & commit
grep "Stack.Screen" mobile/src/navigation/AppNavigator.tsx | wc -l  # 5
git add mobile/src/navigation/AppNavigator.tsx
git commit -m "feat(mobile): implement AppNavigator with 5 screens and typed navigation"
```

---

## Task 4.13: App Entry Point (5 steps)

```bash
# Step 1: Create App.tsx (~250 lines)
# Copy from: tasks-4.9-4.14.md Task 4.13 Step 4.13.1

# Step 2: Install AsyncStorage
npx expo install @react-native-async-storage/async-storage

# Step 3: Verify integration
grep -E "useAppStore|websocketService" mobile/App.tsx

# Step 4: Test compilation
cd mobile && npm run build  # Should succeed

# Step 5: Commit
git add mobile/App.tsx
git commit -m "feat(mobile): implement App.tsx with initialization, error boundary, and WebSocket connection"
```

---

## Task 4.14: Styling & Polish (10 steps)

```bash
# Step 1: Verify gradients on all screens
grep -l "LinearGradient" mobile/src/screens/*.tsx | wc -l  # 5

# Step 2: Verify safe areas
grep -l "SafeAreaView" mobile/src/screens/*.tsx | wc -l  # 5

# Step 3: Create LoadingState.tsx (~50 lines)
# Copy from: tasks-4.9-4.14.md Task 4.14 Step 4.14.3

# Step 4: Create ErrorState.tsx (~70 lines)
# Copy from: tasks-4.9-4.14.md Task 4.14 Step 4.14.4

# Step 5: Create ConnectionStatus.tsx (~50 lines)
# Copy from: tasks-4.9-4.14.md Task 4.14 Step 4.14.6

# Step 6: Update theme.ts (add colors)
# Add: success, warning, info, codeBackground

# Step 7: Update components/index.ts
# Export: LoadingState, ErrorState, ConnectionStatus

# Step 8: Verify haptics
grep -n "Haptics\." mobile/src/screens/*.tsx

# Step 9: Test compilation
npm run build  # Should succeed

# Step 10: Commit
git add mobile/src/components/LoadingState.tsx
git add mobile/src/components/ErrorState.tsx
git add mobile/src/components/ConnectionStatus.tsx
git add mobile/src/components/index.ts
git add mobile/src/constants/theme.ts
git commit -m "feat(mobile): add LoadingState, ErrorState, ConnectionStatus components and theme polish"
```

---

## Final Validation

```bash
# 1. Check all files exist
ls -la mobile/src/screens/FileBrowserScreen.tsx
ls -la mobile/src/screens/CodeViewerScreen.tsx
ls -la mobile/src/screens/SessionsScreen.tsx
ls -la mobile/src/navigation/AppNavigator.tsx
ls -la mobile/App.tsx
ls -la mobile/src/components/LoadingState.tsx
ls -la mobile/src/components/ErrorState.tsx
ls -la mobile/src/components/ConnectionStatus.tsx

# 2. Verify git commits
git log --oneline | head -7
# Expected: 7 commits (4.9, 4.10, 4.11, 4.12, 4.13, 4.14)

# 3. Test compilation
cd mobile && npm run build
# Expected: No errors

# 4. Launch app
npm start
# Then: Press 'i' for iOS simulator
```

---

## Troubleshooting

### TypeScript errors
```bash
cd mobile
rm -rf node_modules
npm install
npm run build
```

### Metro bundler issues
```bash
npx expo start --clear
```

### Missing dependencies
```bash
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-native-async-storage/async-storage
npx expo install expo-haptics
```

---

## Success Checklist

- [ ] All 8 files created
- [ ] All dependencies installed
- [ ] TypeScript compiles without errors
- [ ] 7 git commits created
- [ ] App launches in simulator
- [ ] All 5 screens accessible
- [ ] Navigation works
- [ ] No console errors

---

## Time Estimate

- Task 4.9: 30 minutes
- Task 4.10: 20 minutes
- Task 4.11: 30 minutes
- Task 4.12: 15 minutes
- Task 4.13: 25 minutes
- Task 4.14: 30 minutes
- **Total: ~2.5 hours**

---

## Next Phase

After completion, proceed to:

**Phase 5: Integration Testing**
- Test backend-frontend communication
- Verify WebSocket message flow
- Test all slash commands
- Screenshot documentation

---

## Full Documentation

- **Detailed Steps:** `tasks-4.9-4.14.md`
- **Summary:** `TASKS-4.9-4.14-SUMMARY.md`
- **Integration:** `INTEGRATION-GUIDE.md`
- **Main Plan:** `2025-10-30-claude-code-mobile.md`
