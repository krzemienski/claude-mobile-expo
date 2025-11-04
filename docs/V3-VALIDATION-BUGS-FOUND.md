# v3 Validation - Bugs Found

**Session**: 2025-11-04
**Gates Completed**: 1-7 (partial)
**Method**: IDB CLI automation + xc-mcp screenshots

---

## Critical Bugs (Must Fix)

### 1. Projects Screen - No Navigation (HIGH)
**File**: `app/(tabs)/projects.tsx:39`
**Issue**: `onPress={() => console.log('Project tapped:', item.name)}`
**Expected**: Navigate to project's sessions
**Impact**: Projects→Sessions→Chat workflow completely broken
**Severity**: CRITICAL - Core feature missing

### 2. Sessions Modal - Field Name Mismatch (HIGH)
**File**: `app/sessions.tsx:50`  
**Issue**: Code expects `s.project_path` but backend returns `s.project_id`
**Fix**: Change to `projectPath: s.project_id || 'Unknown Project'`
**Impact**: Sessions modal shows empty even when backend has sessions
**Evidence**: Backend has 4 sessions, UI shows "No sessions yet"

### 3. Git Screen - TypeScript Type Error (MEDIUM)
**File**: `app/git.tsx:58-59`
**Issue**: Response type mismatch (GitStatus vs GitStatusResponse)
**Fix**: Add type annotation
**Impact**: Compiler should error, runtime may work if types match

### 4. Extra "Two" Tab - Legacy Code (LOW)
**Files**: `app/(tabs)/_layout.tsx:64-69`, `app/(tabs)/two.tsx`
**Issue**: 6 tabs instead of 5
**Fix**: Remove tab registration + delete file
**Impact**: UI clutter, confusion

---

## Code Quality Issues

### 5. Skills/Agents - Raw Fetch (MEDIUM)
**Files**: `app/(tabs)/skills.tsx`, `app/(tabs)/agents.tsx`
**Issue**: Use `fetch('http://localhost:8001/...')` instead of HTTPService
**Fix**: Use `httpService.httpClient.listSkills()`, etc.
**Impact**: Hardcoded URLs, no settings integration

### 6. StyleSheet Usage - 3 Components (MEDIUM)
**Files**: `components/HeaderButton.tsx`, `components/TabBarIcon.tsx`, `components/PullToRefresh.tsx`
**Issue**: Use StyleSheet instead of NativeWind
**Fix**: Convert to className prop  
**Impact**: Inconsistent styling approach

---

## Functional Test Results

✅ **Working**:
- Backend connectivity (5/5 tests)
- Metro bundler & app loading (5/5 tests)
- HTTPContext integration (5/5 tests)
- Chat messaging with SSE streaming (8/8 tests) 
- Tab navigation all 5 tabs (7/7 tests)
- Projects discovery API (6 projects found)
- Skills API (83+ skills loaded)

⚠️ **Partially Working**:
- Sessions modal opens but shows empty (bug #2)
- Projects display but don't navigate (bug #1)

❌ **Not Tested**:
- Git Operations screen
- MCP Servers screen
- Files browser
- Session switching
- Message history persistence across sessions

---

## Automation Status

✅ **Proven Working**:
- IDB CLI: describe-all, tap, text, swipe
- xc-mcp screenshots: Half-size optimization
- Backend log verification
- Metro log analysis

**Total Screenshots**: 15+ captured
**Total IDB commands**: 25+ executed
**Success Rate**: ~95%

---

**Status**: 50% validation complete, critical bugs identified
**Next**: Fix bugs, complete remaining gates
# Sessions Modal Bug

**File**: app/sessions.tsx:50
**Issue**: Field name mismatch

**Backend returns**:
```json
{
  "project_id": "default-testclient",
  ...
}
```

**Code expects** (line 50):
```typescript
projectPath: s.project_path || 'Unknown Project'
```

**Fix**:
```typescript
projectPath: s.project_id || 'Unknown Project',  // Use project_id not project_path
```

**Impact**: Sessions don't display in modal (empty array after mapping)
