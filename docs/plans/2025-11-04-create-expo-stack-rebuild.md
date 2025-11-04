# Claude Code Mobile - Complete Rebuild with create-expo-stack

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development for parallel execution with 15 sub-agents.

**Goal:** Rebuild Claude Code Mobile app using create-expo-stack for production-ready Expo Router + NativeWind architecture with proper tab navigation.

**Architecture:** Full rebuild preserving backend (FastAPI) and core services (HTTPService, Zustand), migrating all 10 screens to Expo Router file-based structure with bottom tab navigation and NativeWind v4 styling.

**Tech Stack:**
- **New Frontend**: Expo Router v6, NativeWind v4, TypeScript, Expo SDK 54
- **Preserved**: HTTPService, SSEClient, Zustand store, all utilities, backend integration
- **Removed**: Manual navigation, AppNavigator, custom StyleSheet patterns

**Estimated Effort:** 450-500k tokens with 15 parallel sub-agents

---

## PHASE 1: Complete Codebase Analysis (COMPLETED ✅)

**Status**: Analysis complete and saved to Serena MCP

**Frontend**: 51 TypeScript files analyzed
**Backend**: 70 Python files analyzed
**Memories Created**:
- `codebase-complete-analysis-2025-11-04`
- `backend-complete-analysis-2025-11-04`

---

## PHASE 2: Initialize New Project with create-expo-stack

**Goal:** Create fresh Expo project with optimal configuration

### Task 2.1: Run create-expo-stack CLI

**Step 1: Execute CLI with optimal selections**

```bash
cd /Users/nick/Desktop/claude-mobile-expo
npx rn-new@latest claude-code-mobile-v3
```

**Interactive Selections**:
- Project name: `claude-code-mobile-v3`
- Navigation: **Expo Router with Tabs** ✅
- Styling: **NativeWind** ✅
- Authentication: **None** (using custom backend)
- TypeScript: **Yes** ✅

**Expected Output**: New project created in `claude-code-mobile-v3/` directory

**Step 2: Verify project structure**

```bash
cd claude-code-mobile-v3
ls -la
```

**Expected**:
```
app/
  (tabs)/
    index.tsx
  _layout.tsx
components/
lib/
package.json
tailwind.config.js
```

**Step 3: Test initial build**

```bash
npx expo start
# Press 'i' to launch on iOS
```

**Expected**: Default CES app runs with tab navigation

**Step 4: Commit**

```bash
git init
git add .
git commit -m "chore: initialize project with create-expo-stack"
```

**Validation**:
- ✅ Project created
- ✅ Builds successfully
- ✅ Tabs visible and working
- ✅ NativeWind configured

---

## PHASE 3: Copy Foundation Layer

**Goal:** Port all non-UI code that works well

### Task 3.1: Copy HTTPService Layer

**Files to Copy**:
```
claude-code-mobile/src/services/http/*
  → claude-code-mobile-v3/src/services/http/
```

**Step 1: Create services directory**

```bash
mkdir -p src/services/http
```

**Step 2: Copy all HTTP service files**

```bash
cp ../claude-code-mobile/src/services/http/*.ts src/services/http/
```

**Files**:
- http.service.ts (200 lines)
- http.client.ts (250 lines)
- sse.client.ts (300 lines)
- offline-queue.ts (150 lines)
- reconnection.ts (100 lines)
- types.ts (50 lines)
- index.ts (exports)
- useHTTP.ts (hook)

**Step 3: Update imports for new structure**

Fix any path imports that reference old structure.

**Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

**Expected**: 0 errors (or only type definition errors to fix)

**Step 5: Commit**

```bash
git add src/services/
git commit -m "feat: add HTTPService layer from v2"
```

### Task 3.2: Copy Zustand Store

**Step 1: Copy store file**

```bash
mkdir -p src/store
cp ../claude-code-mobile/src/store/useAppStore.ts src/store/
```

**Step 2: Install dependencies**

```bash
npx expo install zustand @react-native-async-storage/async-storage
```

**Step 3: Test store compiles**

```bash
npx tsc --noEmit
```

**Step 4: Commit**

```bash
git add src/store/ package.json
git commit -m "feat: add Zustand store with AsyncStorage persistence"
```

### Task 3.3: Copy Utilities, Hooks, Types

**Step 1: Copy utils**

```bash
mkdir -p src/utils src/hooks src/types
cp -r ../claude-code-mobile/src/utils/*.ts src/utils/
cp -r ../claude-code-mobile/src/hooks/*.ts src/hooks/
cp -r ../claude-code-mobile/src/types/*.ts src/types/
```

**Step 2: Fix imports**

Update any imports referencing old paths.

**Step 3: Install utility dependencies**

```bash
npx expo install react-native-url-polyfill
```

**Step 4: Verify compilation**

```bash
npx tsc --noEmit
```

**Step 5: Commit**

```bash
git add src/utils/ src/hooks/ src/types/
git commit -m "feat: add utilities, hooks, and type definitions"
```

### Task 3.4: Configure Theme with NativeWind

**Step 1: Create tailwind config with flat black theme**

**File**: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#ffffff',
        card: '#1a1a1a',
        border: '#2a2a2a',
        input: '#1a1a1a',
        primary: '#4ecdc4',
        secondary: '#2a2a2a',
        muted: '#3a3a3a',
        'muted-foreground': '#6b7280',
        destructive: '#ef4444',
        success: '#10b981',
        warning: '#f59e0b',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'base': '16px',
        'md': '12px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
        'xxxl': '64px',
      },
    },
  },
  plugins: [],
};
```

**Step 2: Test NativeWind classes**

Create test component:

```typescript
// components/ThemeTest.tsx
import { View, Text } from 'react-native';

export default function ThemeTest() {
  return (
    <View className="flex-1 bg-background p-base">
      <Text className="text-foreground text-2xl">Theme Test</Text>
      <View className="bg-card p-base rounded-lg border border-border mt-base">
        <Text className="text-primary">Primary Color</Text>
      </View>
    </View>
  );
}
```

**Step 3: Verify theme works**

Add to app/(tabs)/index.tsx temporarily, view on simulator.

**Step 4: Commit**

```bash
git add tailwind.config.js components/ThemeTest.tsx
git commit -m "feat: configure NativeWind with flat black theme"
```

**Validation Gate**:
- ✅ Foundation layer copied
- ✅ HTTPService compiles
- ✅ Zustand store works
- ✅ NativeWind theme configured
- ✅ All utilities available

---

## PHASE 4: Rebuild Core Components with NativeWind

**Goal:** Rebuild all UI components using Tailwind classes

### Task 4.1: MessageBubble Component

**File**: `components/MessageBubble.tsx`

**Step 1: Copy interface and logic**

From old MessageBubble.tsx, copy the interface and rendering logic.

**Step 2: Rebuild with Tailwind**

```typescript
import { View, Text } from 'react-native';
import { Message, MessageRole } from '@/types/models';

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
}

export function MessageBubble({ message, isUser }: MessageBubbleProps) {
  return (
    <View className={`mb-base ${isUser ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[80%] p-base rounded-lg ${
          isUser
            ? 'bg-primary'
            : 'bg-card border border-border'
        }`}
      >
        <Text className={isUser ? 'text-background' : 'text-foreground'}>
          {message.content}
        </Text>
        <Text className="text-xs text-muted-foreground mt-sm">
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}
```

**Step 3: Add to test screen**

**Step 4: Verify rendering**

**Step 5: Commit**

```bash
git add components/MessageBubble.tsx
git commit -m "feat: rebuild MessageBubble with NativeWind"
```

### Task 4.2-4.15: Rebuild Remaining Components

Following same pattern, rebuild:
- ToolExecutionCard
- StreamingIndicator
- ConnectionStatus
- TabBar (may use Expo Router built-in)
- FileItem
- SlashCommandMenu
- ThinkingBlock
- ThinkingAccordion
- ErrorBoundary
- LoadingSkeleton
- Toast
- PullToRefresh
- EmptyState
- SearchBar
- ConfirmDialog

Each component: Copy logic → Rebuild styling → Test → Commit

---

## PHASE 5: Migrate Tab Screens

**Goal:** Port all 5 main tab screens to Expo Router structure

### Task 5.1: ChatScreen (Main Tab)

**File**: `app/(tabs)/index.tsx`

**Step 1: Copy ChatScreen logic**

From `claude-code-mobile/src/screens/ChatScreen.tsx`, extract:
- State management (messages, input, streaming)
- HTTP service integration
- SSE streaming setup
- Message sending logic

**Step 2: Rebuild with Expo Router + NativeWind**

```typescript
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Stack } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { useHTTP } from '@/services/http';
import { MessageBubble } from '@/components/MessageBubble';
import { useState } from 'react';

export default function ChatScreen() {
  const [inputText, setInputText] = useState('');
  const messages = useAppStore(state => state.messages);
  const isStreaming = useAppStore(state => state.isStreaming);
  const { httpService } = useHTTP();

  const handleSend = async () => {
    if (!inputText.trim() || !httpService) return;

    // Copy sendMessageStreaming logic from old ChatScreen
    await httpService.sendMessageStreaming({
      model: 'claude-3-5-haiku-20241022',
      messages: [...],
      onChunk: (content) => {...},
      onComplete: () => {...},
    });
  };

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ title: 'Claude Code', headerShown: false }} />

      {/* Header */}
      <View className="h-15 flex-row items-center justify-between px-base bg-card border-b border-border">
        {/* Connection status */}
        {/* Settings button */}
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        renderItem={({item}) => <MessageBubble message={item} isUser={item.role === 'user'} />}
        className="flex-1"
      />

      {/* Input */}
      <View className="bg-card border-t border-border p-base">
        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Message Claude Code..."
          placeholderTextColor="#6b7280"
          className="bg-input border border-border rounded-3xl px-base py-sm text-foreground"
        />
      </View>
    </View>
  );
}
```

**Step 3: Test**

Run on simulator, verify:
- Screen renders
- Input works
- Message sending works
- Streaming works

**Step 4: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "feat: migrate ChatScreen to Expo Router with NativeWind"
```

### Task 5.2-5.5: Migrate Other Tab Screens

**app/(tabs)/projects.tsx**: Copy ProjectsScreen logic
**app/(tabs)/skills.tsx**: Copy SkillsScreen logic
**app/(tabs)/agents.tsx**: Copy AgentsScreen logic
**app/(tabs)/settings.tsx**: Copy SettingsScreen logic

Same process: Copy logic → Rebuild with Tailwind → Test → Commit

---

## PHASE 6: Migrate Stack Screens

**Goal:** Add non-tab screens as stack routes

### Task 6.1: Sessions Screen

**File**: `app/sessions.tsx`

**Step 1: Copy SessionsScreen logic**

**Step 2: Rebuild as modal presentation**

```typescript
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { router, Stack } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';

export default function SessionsScreen() {
  const sessions = useAppStore(state => state.sessions);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          presentation: 'modal',
          title: 'Your Sessions'
        }}
      />

      <FlatList
        data={sessions}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => {
              // Set session and navigate back
              useAppStore.getState().setCurrentSession(item);
              router.back();
            }}
            className="bg-card p-base mb-sm border border-border rounded-lg"
          >
            <Text className="text-foreground text-lg">{item.title}</Text>
          </TouchableOpacity>
        )}
        className="p-base"
      />
    </View>
  );
}
```

**Step 3: Add navigation from ChatScreen**

In Chat screen, add button:

```typescript
<TouchableOpacity onPress={() => router.push('/sessions')}>
  <Text>Sessions</Text>
</TouchableOpacity>
```

**Step 4: Test navigation**

**Step 5: Commit**

### Task 6.2-6.5: Other Stack Screens

**app/git.tsx**: GitScreen
**app/mcp.tsx**: MCPManagementScreen
**app/files/index.tsx**: FileBrowserScreen
**app/files/[...path].tsx**: CodeViewerScreen (dynamic route)

---

## PHASE 7: Configure Tab Bar

**Goal:** Set up proper tab bar with icons

### Task 7.1: Configure Tab Layout

**File**: `app/(tabs)/_layout.tsx`

```typescript
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4ecdc4',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#2a2a2a',
          borderTopWidth: 1,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <Text style={{fontSize: 24}}>💬</Text>,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => <Text style={{fontSize: 24}}>📁</Text>,
        }}
      />
      <Tabs.Screen
        name="skills"
        options={{
          title: 'Skills',
          tabBarIcon: ({ color }) => <Text style={{fontSize: 24}}>⚡</Text>,
        }}
      />
      <Tabs.Screen
        name="agents"
        options={{
          title: 'Agents',
          tabBarIcon: ({ color }) => <Text style={{fontSize: 24}}>🤖</Text>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{fontSize: 24}}>⚙️</Text>,
        }}
      />
    </Tabs>
  );
}
```

**Validation**:
- ✅ 5 tabs visible
- ✅ Icons shown
- ✅ Teal color for active tab
- ✅ Navigation between tabs works

---

## PHASE 8: HTTPContext Setup

**Goal:** Provide HTTPService to all screens

### Task 8.1: Create HTTPProvider

**File**: `src/contexts/HTTPContext.tsx`

Copy from old project, may need minor adjustments.

**Step 1: Copy file**

```bash
cp ../claude-code-mobile/src/contexts/HTTPContext.tsx src/contexts/
```

**Step 2: Wrap app in provider**

**File**: `app/_layout.tsx`

```typescript
import { HTTPProvider } from '@/contexts/HTTPContext';
import { HTTPService } from '@/services/http';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  const [httpService, setHttpService] = useState<HTTPService | null>(null);

  useEffect(() => {
    const service = new HTTPService({
      baseURL: 'http://localhost:8001',
      onConnectionChange: (connected) => {
        useAppStore.getState().setConnected(connected);
      },
      onError: (error) => {
        useAppStore.getState().setError(error.message);
      },
    });
    setHttpService(service);

    return () => service.cleanup();
  }, []);

  if (!httpService) return null;

  return (
    <HTTPProvider httpService={httpService}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="sessions" options={{ presentation: 'modal' }} />
        <Stack.Screen name="git" />
        <Stack.Screen name="mcp" />
        <Stack.Screen name="files" />
      </Stack>
    </HTTPProvider>
  );
}
```

**Validation**:
- ✅ HTTPService initializes
- ✅ Backend connection works
- ✅ All screens can access useHTTP()

---

## PHASE 9: Testing & Validation

**Goal:** Verify complete feature parity with old app

### Task 9.1: Test All Navigation Flows

**Test Matrix**:
1. ✅ Tap each tab → Screen loads
2. ✅ Chat → Sessions (modal) → Back
3. ✅ Settings → Git → Back
4. ✅ Files → Select file → Code viewer → Back
5. ✅ All screens accessible
6. ✅ No navigation errors

### Task 9.2: Test Backend Integration

**Tests**:
1. ✅ Send message → Response streams
2. ✅ Tool execution → Result shows
3. ✅ Projects → Load from API
4. ✅ Skills → Load 83 skills
5. ✅ Agents → Load agents
6. ✅ Git → Show status
7. ✅ Files → List directory
8. ✅ Sessions → Create/resume/delete

### Task 9.3: Visual Validation

**Screenshots**:
- All 10 screens in dark theme
- Tab bar visible
- Navigation transitions smooth
- Flat black theme consistent
- Teal accent visible

### Task 9.4: Production Build

```bash
npx expo export
eas build --platform ios --profile production
```

**Validation**:
- ✅ Build succeeds
- ✅ App runs in production mode
- ✅ All features work
- ✅ No console errors

---

## VALIDATION GATES

**Gate 1: Foundation**
- HTTPService working
- Zustand store persisting
- Backend connection successful

**Gate 2: Components**
- All components render
- NativeWind classes apply
- Dark theme consistent

**Gate 3: Screens**
- All 10 screens migrated
- Backend data loading
- Navigation working

**Gate 4: Integration**
- Complete workflows functional
- No regressions from old app
- Production build succeeds

---

## SUB-AGENT ALLOCATION (15 Agents)

**Analysis (completed)**:
- Agents 1-3: Codebase analysis ✅

**Foundation (3 agents)**:
- Agent 4: Initialize CES project
- Agent 5: Copy HTTPService layer
- Agent 6: Configure NativeWind theme

**Components (3 agents)**:
- Agent 7: Rebuild MessageBubble, ToolCard, Streaming
- Agent 8: Rebuild Connection, Toast, Error components
- Agent 9: Rebuild File, Search, Thinking components

**Screens (5 agents)**:
- Agent 10: Migrate ChatScreen
- Agent 11: Migrate Projects + Skills
- Agent 12: Migrate Agents + Settings
- Agent 13: Migrate Sessions + Git + MCP
- Agent 14: Migrate FileBrowser + CodeViewer

**Integration (4 agents)**:
- Agent 15: HTTPContext setup
- Agent 16: Tab navigation configuration
- Agent 17: End-to-end testing
- Agent 18: Production validation

---

## SUCCESS CRITERIA

**Must Have**:
1. ✅ All 10 screens accessible via tabs/navigation
2. ✅ Backend integration working
3. ✅ SSE streaming functional
4. ✅ Tool execution displaying
5. ✅ Files/Git/MCP operations working
6. ✅ Flat black theme throughout
7. ✅ Production build succeeds
8. ✅ No regressions from v2
9. ✅ Expo Router navigation clean
10. ✅ NativeWind styling consistent

**Nice to Have**:
- Deep linking configured
- Gestures smooth
- Animations polished
- Accessibility complete

---

## EXECUTION STRATEGY

**Approach**: Subagent-Driven Development (this session)

**Process**:
1. Spawn fresh sub-agent per task
2. Sub-agent executes task
3. Review code before continuing
4. Fast iteration with oversight

**Timeline**: 15 agents × ~30k tokens = ~450k tokens
**Remaining Budget**: 471k tokens ✅

---

## PLAN COMPLETE

**Saved to**: `docs/plans/2025-11-04-create-expo-stack-rebuild.md`

Ready for execution with superpowers:subagent-driven-development.
