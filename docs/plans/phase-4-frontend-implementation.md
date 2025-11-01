# Phase 4: Frontend Implementation (Complete)

**Version**: 1.0.0  
**Status**: Ready for Implementation  
**Dependencies**: Phase 3 (Backend Complete)  
**Duration**: 10-12 days  
**MCP Requirements**: @react-native-expo-development, @claude-mobile-metro-manager, @claude-mobile-ios-testing

---

## Overview

Phase 4 implements the complete React Native frontend using Expo 52. All components follow the specification's design system (purple gradient background, teal #4ecdc4 accents, 8-point grid). Implementation uses proven patterns from react-native-gifted-chat (message bubbles) and Rocket.Chat (WebSocket reconnection).

**Technology Validation**: All choices validated by 2025 research (see technology-research-2025 memory):
- Zustand 5.0.2: Versatile middle ground for state management
- ws library: 40% faster than socket.io for real-time streaming
- Custom UI: Required for specification's unique design system
- React Navigation 6.1.18: Industry standard
- Reanimated 3.16.1: Best performance for animations

---

## Phase 4 Task List

### Core Implementation
- **Task 4.1**: Project Setup & Configuration
- **Task 4.2**: Design System & Theme
- **Task 4.3**: State Management (Zustand)
- **Task 4.4**: WebSocket Service
- **Task 4.5**: Navigation Structure
- **Task 4.6**: Chat Screen (Primary Interface)
- **Task 4.7**: Message Components
- **Task 4.8**: Slash Command System
- **Task 4.9**: File Browser Screen
- **Task 4.10**: Code Viewer Screen
- **Task 4.11**: Settings Screen
- **Task 4.12**: Sessions Screen
- **Task 4.13**: Error Handling & Loading States
- **Task 4.14**: Testing & Polish

### Validation
- **Gate 4A**: iOS Simulator Testing (MCP Tools)

---

## Task 4.1: Project Setup & Configuration

**Duration**: 2 hours  
**Prerequisites**: None  
**Outputs**: Configured Expo project with all dependencies

### Steps

#### 4.1.1: Initialize Expo Project

```bash
# Navigate to project root
cd /Users/nick/Desktop/claude-mobile-expo

# Initialize new Expo app
npx create-expo-app@latest mobile --template blank-typescript

# Navigate into mobile directory
cd mobile
```

**Expected Structure**:
```
mobile/
├── app/
│   └── index.tsx          # Entry point
├── assets/
│   ├── images/
│   └── fonts/
├── app.json
├── package.json
├── tsconfig.json
└── .gitignore
```

#### 4.1.2: Install Core Dependencies

```bash
# Navigation
npm install @react-navigation/native@6.1.18
npm install @react-navigation/stack@6.4.1
npm install react-native-screens@3.34.0
npm install react-native-safe-area-context@4.11.0
npm install react-native-gesture-handler@2.20.2

# State Management
npm install zustand@5.0.2
npm install @react-native-async-storage/async-storage@1.24.0

# UI Components
npm install react-native-reanimated@3.16.1
npm install react-native-markdown-display@7.0.2
npm install react-native-syntax-highlighter@2.1.0

# WebSocket (Native implementation)
# No additional package needed - use native WebSocket API

# Dev Dependencies
npm install -D @types/react@18.3.12
npm install -D @types/react-native@0.73.0
npm install -D typescript@5.3.3
npm install -D prettier@3.3.3
npm install -D eslint@8.57.0
```

#### 4.1.3: Configure app.json

**File**: `mobile/app.json`

```json
{
  "expo": {
    "name": "Claude Code Mobile",
    "slug": "claude-code-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "claudecode",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0f0c29"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.claudecodemobile",
      "buildNumber": "1",
      "infoPlist": {
        "UIBackgroundModes": ["fetch", "remote-notification"],
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": true,
          "NSExceptionDomains": {
            "localhost": {
              "NSExceptionAllowsInsecureHTTPLoads": true
            }
          }
        }
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#0f0c29"
      },
      "package": "com.yourcompany.claudecodemobile"
    },
    "web": {
      "favicon": "./assets/images/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      "expo-router",
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": false
          }
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

#### 4.1.4: Configure TypeScript

**File**: `mobile/tsconfig.json`

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "jsx": "react-native",
    "lib": ["ES2022"],
    "target": "ES2022",
    "module": "commonjs",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@screens/*": ["./src/screens/*"],
      "@services/*": ["./src/services/*"],
      "@utils/*": ["./src/utils/*"],
      "@store/*": ["./src/store/*"],
      "@types/*": ["./src/types/*"],
      "@theme/*": ["./src/theme/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"],
  "exclude": ["node_modules"]
}
```

#### 4.1.5: Configure ESLint

**File**: `mobile/.eslintrc.js`

```javascript
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react-native/no-inline-styles': 'warn',
    'react/react-in-jsx-scope': 'off',
  },
};
```

#### 4.1.6: Configure Prettier

**File**: `mobile/.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

#### 4.1.7: Create Source Directory Structure

```bash
mkdir -p src/{components,screens,services,store,utils,types,theme}
mkdir -p src/components/{chat,common,file-browser,code-viewer,settings}
mkdir -p src/screens/{ChatScreen,FileBrowserScreen,CodeViewerScreen,SettingsScreen,SessionsScreen}
```

**Expected Structure**:
```
src/
├── components/
│   ├── chat/
│   ├── common/
│   ├── file-browser/
│   ├── code-viewer/
│   └── settings/
├── screens/
│   ├── ChatScreen/
│   ├── FileBrowserScreen/
│   ├── CodeViewerScreen/
│   ├── SettingsScreen/
│   └── SessionsScreen/
├── services/
├── store/
├── utils/
├── types/
└── theme/
```

### Validation

**Command**:
```bash
# Test build
npx expo start

# Expected output:
# Metro bundler starts on port 8081
# QR code displayed for Expo Go
# No TypeScript errors
```

**Success Criteria**:
- ✅ All dependencies installed without conflicts
- ✅ TypeScript compilation successful
- ✅ Metro bundler starts without errors
- ✅ Blank app displays on iOS simulator

### Git Operations

```bash
# Initialize git (if not already)
cd mobile
git init

# Create gitignore
cat > .gitignore << 'EOF'
# OSX
.DS_Store

# Expo
.expo/
dist/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/

# Node
node_modules/
npm-debug.log
yarn-error.log

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# Environment
.env
.env.local
.env.production

# TypeScript
*.tsbuildinfo
EOF

# Initial commit
git add .
git commit -m "chore: initialize expo project with typescript and dependencies"
```

---

## Task 4.2: Design System & Theme

**Duration**: 2 hours  
**Prerequisites**: Task 4.1  
**Outputs**: Complete design system matching specification

### Files to Create

#### 4.2.1: Color Palette

**File**: `mobile/src/theme/colors.ts`

```typescript
/**
 * Color Palette - Claude Code Mobile
 * Based on specification v1.0.0
 * Dark theme with purple gradient background and teal accents
 */

export const colors = {
  // Background Gradients
  backgroundGradient: {
    start: '#0f0c29',    // Deep purple-blue
    middle: '#302b63',   // Medium purple
    end: '#24243e',      // Dark purple-gray
  },

  // Primary Actions
  primary: '#4ecdc4',        // Teal (buttons, links, highlights)
  primaryDark: '#3db0a8',    // Darker teal (hover states)
  primaryLight: '#6de3db',   // Lighter teal (disabled states)

  // Text Colors
  textPrimary: '#ecf0f1',    // Off-white (primary text)
  textSecondary: '#7f8c8d',  // Gray (secondary text)
  textTertiary: '#95a5a6',   // Light gray (tertiary text)
  textDark: '#0f0c29',       // Dark (on light backgrounds)

  // Status Colors
  success: '#2ecc71',        // Green (success states)
  warning: '#f39c12',        // Orange (warning states)
  error: '#e74c3c',          // Red (error states)
  info: '#3498db',           // Blue (info states)

  // Functional Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  border: 'rgba(255, 255, 255, 0.1)',
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceHighlight: 'rgba(255, 255, 255, 0.1)',

  // Code Highlighting
  codeBackground: '#2c3e50',
  codeText: '#ecf0f1',
  codeKeyword: '#4ecdc4',
  codeString: '#2ecc71',
  codeComment: '#7f8c8d',
  codeNumber: '#f39c12',

  // Connection Status
  connected: '#2ecc71',
  disconnected: '#e74c3c',
  connecting: '#f39c12',

  // Transparent
  transparent: 'transparent',
};

export type ColorName = keyof typeof colors;
```

#### 4.2.2: Typography

**File**: `mobile/src/theme/typography.ts`

```typescript
/**
 * Typography System - Claude Code Mobile
 * iOS native fonts with fallbacks
 */

import { Platform } from 'react-native';

export const typography = {
  // Font Families
  fontFamily: {
    primary: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
    code: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },

  // Font Sizes
  fontSize: {
    xs: 10,    // Timestamps, labels
    sm: 12,    // Secondary text
    base: 14,  // Body text
    md: 16,    // Primary text
    lg: 18,    // Headings
    xl: 20,    // Large headings
    xxl: 24,   // Extra large headings
    xxxl: 32,  // Hero text
  },

  // Font Weights
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
```

#### 4.2.3: Spacing System

**File**: `mobile/src/theme/spacing.ts`

```typescript
/**
 * Spacing System - 8-Point Grid
 * All spacing values are multiples of 4 or 8
 */

export const spacing = {
  xxs: 2,    // 2px - Minimal spacing
  xs: 4,     // 4px - Tight spacing
  sm: 8,     // 8px - Small spacing
  md: 12,    // 12px - Medium spacing
  base: 16,  // 16px - Base spacing (most common)
  lg: 20,    // 20px - Large spacing
  xl: 24,    // 24px - Extra large spacing
  xxl: 32,   // 32px - Extra extra large
  xxxl: 48,  // 48px - Maximum spacing
};

export type SpacingSize = keyof typeof spacing;
```

#### 4.2.4: Border Radius

**File**: `mobile/src/theme/borderRadius.ts`

```typescript
/**
 * Border Radius System
 */

export const borderRadius = {
  none: 0,
  sm: 4,      // Small radius (buttons)
  md: 8,      // Medium radius (cards)
  lg: 12,     // Large radius (modals)
  xl: 16,     // Extra large (sheets)
  xxl: 20,    // Message bubbles
  full: 9999, // Circular elements
};

export type BorderRadiusSize = keyof typeof borderRadius;
```

#### 4.2.5: Shadows & Elevation

**File**: `mobile/src/theme/shadows.ts`

```typescript
/**
 * Shadow System for iOS
 * Android uses elevation property
 */

import { Platform } from 'react-native';

export const shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
    },
    android: {
      elevation: 16,
    },
    default: {},
  }),
};

export type ShadowSize = keyof typeof shadows;
```

#### 4.2.6: Theme Index

**File**: `mobile/src/theme/index.ts`

```typescript
/**
 * Design System Export
 * Central export for all theme values
 */

export { colors } from './colors';
export type { ColorName } from './colors';

export { typography } from './typography';
export type { FontSize, FontWeight } from './typography';

export { spacing } from './spacing';
export type { SpacingSize } from './spacing';

export { borderRadius } from './borderRadius';
export type { BorderRadiusSize } from './borderRadius';

export { shadows } from './shadows';
export type { ShadowSize } from './shadows';

// Theme object for easy access
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export type Theme = typeof theme;
```

#### 4.2.7: Common Styles

**File**: `mobile/src/theme/commonStyles.ts`

```typescript
/**
 * Common Reusable Styles
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from './index';

export const commonStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Surfaces
  surface: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.base,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Text
  textPrimary: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  textSecondary: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  // Buttons
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '600',
  },

  // Input
  input: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    color: colors.textPrimary,
    fontSize: 16,
  },
});
```

### Validation

```bash
# Create test component to verify theme
cat > src/components/common/ThemeTest.tsx << 'EOF'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@theme';

export const ThemeTest = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Theme Test</Text>
    <View style={styles.colorBox} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundGradient.start,
    padding: theme.spacing.base,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  colorBox: {
    width: 100,
    height: 100,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.base,
  },
});
EOF
```

**Success Criteria**:
- ✅ All theme modules export without errors
- ✅ TypeScript types correctly inferred
- ✅ Colors match specification
- ✅ Spacing follows 8-point grid
- ✅ Test component renders with theme

### Git Operations

```bash
git add src/theme/
git commit -m "feat(theme): implement complete design system

- Add color palette (purple gradient + teal accents)
- Add typography system with iOS native fonts
- Add 8-point grid spacing system
- Add border radius and shadow utilities
- Add common reusable styles
- Export unified theme object

Follows specification v1.0.0 design system"
```

---

## Task 4.3: State Management (Zustand)

**Duration**: 3 hours  
**Prerequisites**: Task 4.2  
**Outputs**: Complete Zustand store with persistence

**Pattern Source**: Validated by 2025 research as "versatile middle ground" - 50% less code than Redux with better DX.

### Files to Create

#### 4.3.1: Type Definitions

**File**: `mobile/src/types/index.ts`

```typescript
/**
 * Global Type Definitions
 */

// Message Types
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  toolExecutions?: ToolExecution[];
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  modelUsed?: string;
  tokensUsed?: {
    input: number;
    output: number;
  };
  latency?: number;
  error?: string;
}

// Tool Types
export enum ToolStatus {
  PENDING = 'pending',
  EXECUTING = 'executing',
  COMPLETE = 'complete',
  ERROR = 'error',
}

export interface ToolExecution {
  id: string;
  tool: string;
  input: any;
  result?: string;
  status: ToolStatus;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

// Session Types
export interface Session {
  id: string;
  projectPath: string;
  conversationHistory: Message[];
  claudeContext?: string;
  createdAt: Date;
  lastActive: Date;
  metadata: SessionMetadata;
}

export interface SessionMetadata {
  deviceInfo?: string;
  totalMessages: number;
  totalTokens?: number;
}

// Settings Types
export interface AppSettings {
  serverUrl: string;
  apiKey?: string;
  projectPath: string;
  autoScroll: boolean;
  hapticFeedback: boolean;
  darkMode: boolean;
  fontSize: number;
  maxTokens: number;
  temperature: number;
}

// File Browser Types
export enum FileType {
  FILE = 'file',
  DIRECTORY = 'directory',
  SYMLINK = 'symlink',
}

export interface FileMetadata {
  path: string;
  name: string;
  extension: string;
  size: number;
  type: FileType;
  lastModified: Date;
  permissions?: string;
  content?: string;
}

// WebSocket Message Types
export type ServerMessage =
  | SessionInitializedMessage
  | ContentDeltaMessage
  | ToolExecutionMessage
  | ToolResultMessage
  | MessageCompleteMessage
  | SlashCommandResponseMessage
  | ErrorMessage;

export interface SessionInitializedMessage {
  type: 'session_initialized';
  sessionId: string;
  hasContext: boolean;
}

export interface ContentDeltaMessage {
  type: 'content_delta';
  delta: string;
}

export interface ToolExecutionMessage {
  type: 'tool_execution';
  tool: string;
  input: any;
}

export interface ToolResultMessage {
  type: 'tool_result';
  tool: string;
  result: string;
}

export interface MessageCompleteMessage {
  type: 'message_complete';
}

export interface SlashCommandResponseMessage {
  type: 'slash_command_response';
  content: string;
}

export interface ErrorMessage {
  type: 'error';
  error: string;
  code?: string;
}

// Connection Status
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}
```

#### 4.3.2: Store Definition

**File**: `mobile/src/store/index.ts`

```typescript
/**
 * Zustand Global Store
 * State management for Claude Code Mobile
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Session,
  Message,
  AppSettings,
  FileMetadata,
  ConnectionStatus,
} from '@/types';

interface AppState {
  // Current Session
  currentSession: Session | null;
  sessions: Session[];

  // Messages
  messages: Message[];

  // Connection Status
  connectionStatus: ConnectionStatus;
  isStreaming: boolean;

  // Settings
  settings: AppSettings;

  // UI State
  currentFile: FileMetadata | null;
  isFilesBrowserOpen: boolean;
  isSettingsOpen: boolean;

  // Slash Commands
  recentCommands: string[];

  // Error State
  error: string | null;

  // Actions
  setCurrentSession: (session: Session | null) => void;
  addSession: (session: Session) => void;
  updateSession: (sessionId: string, updates: Partial<Session>) => void;
  deleteSession: (sessionId: string) => void;
  
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  
  setConnectionStatus: (status: ConnectionStatus) => void;
  setStreaming: (streaming: boolean) => void;
  
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  setCurrentFile: (file: FileMetadata | null) => void;
  toggleFilesBrowser: () => void;
  toggleSettings: () => void;
  
  addRecentCommand: (command: string) => void;
  
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Default settings
const defaultSettings: AppSettings = {
  serverUrl: 'ws://localhost:3001',
  projectPath: '',
  autoScroll: true,
  hapticFeedback: true,
  darkMode: true,
  fontSize: 16,
  maxTokens: 8192,
  temperature: 1,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentSession: null,
      sessions: [],
      messages: [],
      connectionStatus: ConnectionStatus.DISCONNECTED,
      isStreaming: false,
      settings: defaultSettings,
      currentFile: null,
      isFilesBrowserOpen: false,
      isSettingsOpen: false,
      recentCommands: [],
      error: null,

      // Session Actions
      setCurrentSession: (session) => {
        set({ currentSession: session });
        if (session) {
          set({ messages: session.conversationHistory || [] });
        }
      },

      addSession: (session) => {
        set((state) => ({
          sessions: [session, ...state.sessions],
        }));
      },

      updateSession: (sessionId, updates) => {
        set((state) => {
          const sessions = state.sessions.map((s) =>
            s.id === sessionId ? { ...s, ...updates, lastActive: new Date() } : s
          );
          const currentSession =
            state.currentSession?.id === sessionId
              ? { ...state.currentSession, ...updates, lastActive: new Date() }
              : state.currentSession;
          return { sessions, currentSession };
        });
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          currentSession:
            state.currentSession?.id === sessionId ? null : state.currentSession,
          messages: state.currentSession?.id === sessionId ? [] : state.messages,
        }));
      },

      // Message Actions
      addMessage: (message) => {
        set((state) => {
          const messages = [...state.messages, message];
          
          // Update current session
          if (state.currentSession) {
            const updatedSession = {
              ...state.currentSession,
              conversationHistory: messages,
              lastActive: new Date(),
              metadata: {
                ...state.currentSession.metadata,
                totalMessages: messages.length,
              },
            };
            
            // Update in sessions array
            const sessions = state.sessions.map((s) =>
              s.id === state.currentSession!.id ? updatedSession : s
            );
            
            return {
              messages,
              currentSession: updatedSession,
              sessions,
            };
          }
          
          return { messages };
        });
      },

      updateMessage: (messageId, updates) => {
        set((state) => {
          const messages = state.messages.map((m) =>
            m.id === messageId ? { ...m, ...updates } : m
          );
          
          // Update current session
          if (state.currentSession) {
            const updatedSession = {
              ...state.currentSession,
              conversationHistory: messages,
            };
            
            const sessions = state.sessions.map((s) =>
              s.id === state.currentSession!.id ? updatedSession : s
            );
            
            return {
              messages,
              currentSession: updatedSession,
              sessions,
            };
          }
          
          return { messages };
        });
      },

      clearMessages: () => {
        set({ messages: [] });
        const session = get().currentSession;
        if (session) {
          get().updateSession(session.id, { conversationHistory: [] });
        }
      },

      // Connection Actions
      setConnectionStatus: (status) => {
        set({ connectionStatus: status });
      },

      setStreaming: (streaming) => {
        set({ isStreaming: streaming });
      },

      // Settings Actions
      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      // File Browser Actions
      setCurrentFile: (file) => {
        set({ currentFile: file });
      },

      toggleFilesBrowser: () => {
        set((state) => ({ isFilesBrowserOpen: !state.isFilesBrowserOpen }));
      },

      toggleSettings: () => {
        set((state) => ({ isSettingsOpen: !state.isSettingsOpen }));
      },

      // Slash Commands
      addRecentCommand: (command) => {
        set((state) => {
          const recentCommands = [
            command,
            ...state.recentCommands.filter((c) => c !== command),
          ].slice(0, 10); // Keep last 10
          return { recentCommands };
        });
      },

      // Error Actions
      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'claude-code-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist settings and sessions, not ephemeral state
      partialize: (state) => ({
        settings: state.settings,
        sessions: state.sessions,
        recentCommands: state.recentCommands,
      }),
    }
  )
);

// Selectors for common queries
export const useCurrentSession = () => useAppStore((state) => state.currentSession);
export const useMessages = () => useAppStore((state) => state.messages);
export const useConnectionStatus = () => useAppStore((state) => state.connectionStatus);
export const useSettings = () => useAppStore((state) => state.settings);
export const useError = () => useAppStore((state) => state.error);
```

### Validation

**Test File**: `mobile/src/store/__tests__/store.test.ts`

```typescript
import { useAppStore } from '../index';
import { MessageRole, ConnectionStatus } from '@/types';

describe('AppStore', () => {
  beforeEach(() => {
    // Reset store
    useAppStore.setState({
      currentSession: null,
      sessions: [],
      messages: [],
      connectionStatus: ConnectionStatus.DISCONNECTED,
      error: null,
    });
  });

  it('should add a message', () => {
    const message = {
      id: '1',
      sessionId: 'session-1',
      role: MessageRole.USER,
      content: 'Test message',
      timestamp: new Date(),
    };

    useAppStore.getState().addMessage(message);
    expect(useAppStore.getState().messages).toHaveLength(1);
    expect(useAppStore.getState().messages[0]).toEqual(message);
  });

  it('should update connection status', () => {
    useAppStore.getState().setConnectionStatus(ConnectionStatus.CONNECTED);
    expect(useAppStore.getState().connectionStatus).toBe(ConnectionStatus.CONNECTED);
  });

  it('should update settings', () => {
    useAppStore.getState().updateSettings({ serverUrl: 'ws://test:3001' });
    expect(useAppStore.getState().settings.serverUrl).toBe('ws://test:3001');
  });
});
```

**Success Criteria**:
- ✅ Store initializes with default values
- ✅ All actions work correctly
- ✅ Persistence saves to AsyncStorage
- ✅ Selectors return correct values
- ✅ TypeScript types are correct

### Git Operations

```bash
git add src/types/ src/store/
git commit -m "feat(store): implement zustand state management with persistence

- Add complete type definitions for all domain models
- Implement Zustand store with AsyncStorage persistence
- Add session, message, settings, and UI state management
- Add selectors for common queries
- Configure partial persistence (settings + sessions only)
- Add unit tests for store actions

Pattern: Validated by 2025 research as best practice"
```

---

## Task 4.4: WebSocket Service

**Duration**: 4 hours  
**Prerequisites**: Task 4.3  
**Outputs**: Production-ready WebSocket service with reconnection

**Pattern Sources**:
- Rocket.Chat: Exponential backoff + jitter reconnection
- Stream Chat: Optimistic UI updates
- Research validated: ws library 40% faster than socket.io

### Files to Create

#### 4.4.1: WebSocket Service

**File**: `mobile/src/services/websocket.service.ts`

```typescript
/**
 * WebSocket Service
 * Handles real-time communication with backend
 * 
 * Pattern: Rocket.Chat exponential backoff + Stream Chat optimistic UI
 * Research: ws library 40% faster than socket.io for streaming
 */

import { Platform } from 'react-native';
import { useAppStore } from '@/store';
import {
  ServerMessage,
  Message,
  MessageRole,
  ToolExecution,
  ToolStatus,
  ConnectionStatus,
} from '@/types';

interface MessageCallbacks {
  onContentDelta?: (delta: string) => void;
  onToolExecution?: (tool: string, input: any) => void;
  onToolResult?: (tool: string, result: string) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private serverUrl: string = '';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageCallbacks: Map<string, MessageCallbacks> = new Map();
  private currentMessageId: string | null = null;
  private messageBuffer: string = '';

  /**
   * Initialize WebSocket connection
   */
  async initialize(serverUrl: string): Promise<void> {
    this.serverUrl = serverUrl;
    await this.connect();
  }

  /**
   * Connect to WebSocket server
   */
  private async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    try {
      useAppStore.getState().setConnectionStatus(ConnectionStatus.CONNECTING);

      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('[WebSocket] Connection failed:', error);
      useAppStore.getState().setConnectionStatus(ConnectionStatus.ERROR);
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('[WebSocket] Connected');
    this.reconnectAttempts = 0;
    useAppStore.getState().setConnectionStatus(ConnectionStatus.CONNECTED);
    useAppStore.getState().clearError();

    // Start heartbeat
    this.startHeartbeat();

    // Initialize session
    this.initializeSession();
  }

  /**
   * Handle WebSocket message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: ServerMessage = JSON.parse(event.data);
      console.log('[WebSocket] Received:', message.type);

      switch (message.type) {
        case 'session_initialized':
          this.handleSessionInitialized(message);
          break;

        case 'content_delta':
          this.handleContentDelta(message);
          break;

        case 'tool_execution':
          this.handleToolExecution(message);
          break;

        case 'tool_result':
          this.handleToolResult(message);
          break;

        case 'message_complete':
          this.handleMessageComplete();
          break;

        case 'slash_command_response':
          this.handleSlashCommandResponse(message);
          break;

        case 'error':
          this.handleServerError(message);
          break;

        default:
          console.warn('[WebSocket] Unknown message type:', message);
      }
    } catch (error) {
      console.error('[WebSocket] Failed to parse message:', error);
    }
  }

  /**
   * Handle WebSocket error
   */
  private handleError(event: Event): void {
    console.error('[WebSocket] Error:', event);
    useAppStore.getState().setConnectionStatus(ConnectionStatus.ERROR);
    useAppStore.getState().setError('WebSocket connection error');
  }

  /**
   * Handle WebSocket close
   */
  private handleClose(event: CloseEvent): void {
    console.log('[WebSocket] Closed:', event.code, event.reason);
    useAppStore.getState().setConnectionStatus(ConnectionStatus.DISCONNECTED);

    // Clear heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Attempt reconnect
    if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection with exponential backoff + jitter
   * Pattern from Rocket.Chat
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
    const baseDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    // Add jitter: ±20%
    const jitter = baseDelay * 0.2 * (Math.random() - 0.5);
    const delay = baseDelay + jitter;

    console.log(`[WebSocket] Reconnecting in ${Math.round(delay / 1000)}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Start heartbeat ping
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30 seconds
  }

  /**
   * Initialize or restore session
   */
  private initializeSession(): void {
    const { currentSession, settings } = useAppStore.getState();

    const message = {
      type: 'init_session',
      sessionId: currentSession?.id,
      projectPath: settings.projectPath,
    };

    this.send(message);
  }

  /**
   * Handle session initialized
   */
  private handleSessionInitialized(message: ServerMessage & { type: 'session_initialized' }): void {
    const { currentSession } = useAppStore.getState();

    // If we don't have a session, create one
    if (!currentSession) {
      const newSession = {
        id: message.sessionId,
        projectPath: useAppStore.getState().settings.projectPath,
        conversationHistory: [],
        createdAt: new Date(),
        lastActive: new Date(),
        metadata: {
          totalMessages: 0,
        },
      };

      useAppStore.getState().setCurrentSession(newSession);
      useAppStore.getState().addSession(newSession);
    }
  }

  /**
   * Send message to Claude
   * Implements optimistic UI pattern from Stream Chat
   */
  async sendMessage(content: string, callbacks?: MessageCallbacks): Promise<void> {
    const { currentSession } = useAppStore.getState();

    if (!currentSession) {
      throw new Error('No active session');
    }

    // Create optimistic user message
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      sessionId: currentSession.id,
      role: MessageRole.USER,
      content,
      timestamp: new Date(),
    };

    // Add immediately to UI (optimistic update)
    useAppStore.getState().addMessage(userMessage);

    // Create assistant message placeholder
    const assistantMessageId = `temp-assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      sessionId: currentSession.id,
      role: MessageRole.ASSISTANT,
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    useAppStore.getState().addMessage(assistantMessage);
    useAppStore.getState().setStreaming(true);

    // Store callbacks
    if (callbacks) {
      this.messageCallbacks.set(assistantMessageId, callbacks);
    }
    
    this.currentMessageId = assistantMessageId;
    this.messageBuffer = '';

    // Send to server
    this.send({
      type: 'message',
      message: content,
    });
  }

  /**
   * Handle content delta (streaming)
   */
  private handleContentDelta(message: ServerMessage & { type: 'content_delta' }): void {
    if (!this.currentMessageId) return;

    this.messageBuffer += message.delta;

    // Update message in store
    useAppStore.getState().updateMessage(this.currentMessageId, {
      content: this.messageBuffer,
    });

    // Trigger callback
    const callbacks = this.messageCallbacks.get(this.currentMessageId);
    callbacks?.onContentDelta?.(message.delta);
  }

  /**
   * Handle tool execution
   */
  private handleToolExecution(message: ServerMessage & { type: 'tool_execution' }): void {
    if (!this.currentMessageId) return;

    const toolExecution: ToolExecution = {
      id: `tool-${Date.now()}`,
      tool: message.tool,
      input: message.input,
      status: ToolStatus.EXECUTING,
      startedAt: new Date(),
    };

    // Get current message
    const currentMessage = useAppStore.getState().messages.find(
      (m) => m.id === this.currentMessageId
    );

    if (currentMessage) {
      const toolExecutions = [...(currentMessage.toolExecutions || []), toolExecution];
      useAppStore.getState().updateMessage(this.currentMessageId, {
        toolExecutions,
      });
    }

    // Trigger callback
    const callbacks = this.messageCallbacks.get(this.currentMessageId);
    callbacks?.onToolExecution?.(message.tool, message.input);
  }

  /**
   * Handle tool result
   */
  private handleToolResult(message: ServerMessage & { type: 'tool_result' }): void {
    if (!this.currentMessageId) return;

    const currentMessage = useAppStore.getState().messages.find(
      (m) => m.id === this.currentMessageId
    );

    if (currentMessage?.toolExecutions) {
      // Find the tool execution and update it
      const toolExecutions = currentMessage.toolExecutions.map((te) =>
        te.tool === message.tool && te.status === ToolStatus.EXECUTING
          ? {
              ...te,
              result: message.result,
              status: ToolStatus.COMPLETE,
              completedAt: new Date(),
            }
          : te
      );

      useAppStore.getState().updateMessage(this.currentMessageId, {
        toolExecutions,
      });
    }

    // Trigger callback
    const callbacks = this.messageCallbacks.get(this.currentMessageId);
    callbacks?.onToolResult?.(message.tool, message.result);
  }

  /**
   * Handle message complete
   */
  private handleMessageComplete(): void {
    if (!this.currentMessageId) return;

    useAppStore.getState().updateMessage(this.currentMessageId, {
      isStreaming: false,
    });

    useAppStore.getState().setStreaming(false);

    // Trigger callback
    const callbacks = this.messageCallbacks.get(this.currentMessageId);
    callbacks?.onComplete?.();

    // Cleanup
    this.messageCallbacks.delete(this.currentMessageId);
    this.currentMessageId = null;
    this.messageBuffer = '';
  }

  /**
   * Handle slash command response
   */
  private handleSlashCommandResponse(message: ServerMessage & { type: 'slash_command_response' }): void {
    const { currentSession } = useAppStore.getState();

    if (currentSession) {
      const systemMessage: Message = {
        id: `system-${Date.now()}`,
        sessionId: currentSession.id,
        role: MessageRole.SYSTEM,
        content: message.content,
        timestamp: new Date(),
      };

      useAppStore.getState().addMessage(systemMessage);
    }
  }

  /**
   * Handle server error
   */
  private handleServerError(message: ServerMessage & { type: 'error' }): void {
    console.error('[WebSocket] Server error:', message.error);
    useAppStore.getState().setError(message.error);
    useAppStore.getState().setStreaming(false);

    // Trigger callback
    if (this.currentMessageId) {
      const callbacks = this.messageCallbacks.get(this.currentMessageId);
      callbacks?.onError?.(message.error);
      this.messageCallbacks.delete(this.currentMessageId);
      this.currentMessageId = null;
    }
  }

  /**
   * Send data to server
   */
  private send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('[WebSocket] Cannot send - not connected');
      throw new Error('WebSocket not connected');
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    useAppStore.getState().setConnectionStatus(ConnectionStatus.DISCONNECTED);
  }

  /**
   * Destroy service
   */
  destroy(): void {
    this.disconnect();
    this.messageCallbacks.clear();
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
```

#### 4.4.2: WebSocket Hook

**File**: `mobile/src/services/useWebSocket.ts`

```typescript
/**
 * React Hook for WebSocket Service
 */

import { useEffect, useCallback } from 'react';
import { websocketService } from './websocket.service';
import { useAppStore, useConnectionStatus, useSettings } from '@/store';
import { ConnectionStatus } from '@/types';

export const useWebSocket = () => {
  const connectionStatus = useConnectionStatus();
  const settings = useSettings();

  // Initialize connection
  useEffect(() => {
    if (settings.serverUrl) {
      websocketService.initialize(settings.serverUrl);
    }

    return () => {
      // Don't disconnect on unmount - keep connection alive
    };
  }, [settings.serverUrl]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    try {
      await websocketService.sendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
      useAppStore.getState().setError('Failed to send message');
    }
  }, []);

  // Reconnect manually
  const reconnect = useCallback(async () => {
    websocketService.disconnect();
    await websocketService.initialize(settings.serverUrl);
  }, [settings.serverUrl]);

  return {
    connectionStatus,
    isConnected: connectionStatus === ConnectionStatus.CONNECTED,
    isConnecting: connectionStatus === ConnectionStatus.CONNECTING,
    sendMessage,
    reconnect,
  };
};
```

### Validation

**Test Connection**:
```typescript
// In App.tsx for testing
import { useWebSocket } from '@services/useWebSocket';

const { connectionStatus, sendMessage } = useWebSocket();

// Test sending a message
sendMessage('Hello Claude!');
```

**Success Criteria**:
- ✅ Connects to WebSocket server
- ✅ Handles reconnection with exponential backoff
- ✅ Streams messages correctly
- ✅ Handles tool executions
- ✅ Optimistic UI updates work
- ✅ Error handling functional

### Git Operations

```bash
git add src/services/
git commit -m "feat(websocket): implement production websocket service

- Add WebSocket service with native WS API
- Implement Rocket.Chat reconnection pattern (exponential backoff + jitter)
- Add Stream Chat optimistic UI updates
- Implement heartbeat ping/pong
- Add session initialization and restoration
- Handle all server message types
- Add React hook wrapper
- Support tool execution streaming

Research validated: ws 40% faster than socket.io"
```

---

## Task 4.5: Navigation Structure

**Duration**: 2 hours  
**Prerequisites**: Tasks 4.2, 4.3  
**Outputs**: Complete navigation with stack navigator

### Files to Create

#### 4.5.1: Navigation Types

**File**: `mobile/src/navigation/types.ts`

```typescript
/**
 * Navigation Type Definitions
 */

import { FileMetadata } from '@/types';

export type RootStackParamList = {
  Chat: undefined;
  FileBrowser: {
    projectPath: string;
  };
  CodeViewer: {
    file: FileMetadata;
  };
  Settings: undefined;
  Sessions: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

#### 4.5.2: Navigator Configuration

**File**: `mobile/src/navigation/RootNavigator.tsx`

```typescript
/**
 * Root Navigation Stack
 */

import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { theme } from '@/theme';
import { RootStackParamList } from './types';

// Screens (will be created in next tasks)
import ChatScreen from '@/screens/ChatScreen';
import FileBrowserScreen from '@/screens/FileBrowserScreen';
import CodeViewerScreen from '@/screens/CodeViewerScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import SessionsScreen from '@/screens/SessionsScreen';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Chat"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: {
          backgroundColor: theme.colors.backgroundGradient.start,
        },
        ...TransitionPresets.SlideFromRightIOS,
      }}
    >
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: 'Claude Code',
        }}
      />
      <Stack.Screen
        name="FileBrowser"
        component={FileBrowserScreen}
        options={{
          title: 'Files',
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <Stack.Screen
        name="CodeViewer"
        component={CodeViewerScreen}
        options={{
          title: 'Code Viewer',
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          presentation: 'modal',
          ...TransitionPresets.ModalSlideFromBottomIOS,
        }}
      />
      <Stack.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{
          title: 'Sessions',
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
    </Stack.Navigator>
  );
};
```

#### 4.5.3: App Container

**File**: `mobile/App.tsx`

```typescript
/**
 * App Entry Point
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { theme } from './src/theme';
import { StyleSheet } from 'react-native';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: theme.colors.primary,
              background: theme.colors.backgroundGradient.start,
              card: theme.colors.surface,
              text: theme.colors.textPrimary,
              border: theme.colors.border,
              notification: theme.colors.error,
            },
          }}
        >
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

### Validation

```bash
# Start app
npx expo start

# Test navigation
# - Should see blank screens for each route
# - Swipe from left should navigate back
# - Settings should present as modal
```

**Success Criteria**:
- ✅ Navigation stack configured
- ✅ Screen transitions work
- ✅ Back gesture functional
- ✅ Modal presentation for Settings
- ✅ TypeScript types correct

### Git Operations

```bash
git add src/navigation/ App.tsx
git commit -m "feat(navigation): implement stack navigation

- Add React Navigation stack with 5 screens
- Configure iOS slide transitions
- Add modal presentation for Settings
- Configure dark theme
- Add TypeScript navigation types
- Set up GestureHandler and SafeArea"
```

---

## Task 4.6: Chat Screen (Primary Interface)

**Duration**: 6 hours  
**Prerequisites**: Tasks 4.2-4.5  
**Outputs**: Complete chat screen with message rendering

**MCP Requirement**: Invoke @react-native-expo-development skill

### Files to Create

#### 4.6.1: Chat Screen Container

**File**: `mobile/src/screens/ChatScreen/index.tsx`

```typescript
/**
 * Chat Screen - Primary Interface
 * Main chat interface for Claude Code Mobile
 */

import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme';
import { useMessages, useCurrentSession, useAppStore } from '@/store';
import { useWebSocket } from '@/services/useWebSocket';

// Components (will create next)
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { InputBar } from './components/InputBar';
import { SlashCommandMenu } from './components/SlashCommandMenu';
import { EmptyState } from './components/EmptyState';
import { ErrorBanner } from './components/ErrorBanner';

const ChatScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  
  const messages = useMessages();
  const currentSession = useCurrentSession();
  const settings = useAppStore((state) => state.settings);
  const error = useAppStore((state) => state.error);
  
  const { isConnected, sendMessage } = useWebSocket();

  const [showSlashMenu, setShowSlashMenu] = React.useState(false);
  const [inputText, setInputText] = React.useState('');

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (settings.autoScroll && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, settings.autoScroll]);

  // Handle send message
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || !isConnected) return;

    const message = inputText.trim();
    setInputText('');
    Keyboard.dismiss();

    // Check for slash command
    if (message.startsWith('/')) {
      useAppStore.getState().addRecentCommand(message);
    }

    await sendMessage(message);
  }, [inputText, isConnected, sendMessage]);

  // Handle input change
  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
    
    // Show slash menu if starts with /
    if (text.startsWith('/') && text.length > 1) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  }, []);

  // Handle slash command select
  const handleSlashCommandSelect = useCallback((command: string) => {
    setInputText(command + ' ');
    setShowSlashMenu(false);
  }, []);

  // Navigate to settings
  const handleSettingsPress = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          theme.colors.backgroundGradient.start,
          theme.colors.backgroundGradient.middle,
          theme.colors.backgroundGradient.end,
        ]}
        style={styles.gradient}
      >
        {/* Header */}
        <Header
          isConnected={isConnected}
          onSettingsPress={handleSettingsPress}
        />

        {/* Error Banner */}
        {error && <ErrorBanner error={error} />}

        {/* Main Content */}
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top}
        >
          {/* Messages or Empty State */}
          {messages.length === 0 ? (
            <EmptyState onQuickAction={setInputText} />
          ) : (
            <MessageList
              ref={flatListRef}
              messages={messages}
            />
          )}

          {/* Slash Command Menu */}
          {showSlashMenu && (
            <SlashCommandMenu
              searchQuery={inputText.slice(1)}
              onSelect={handleSlashCommandSelect}
              onDismiss={() => setShowSlashMenu(false)}
            />
          )}

          {/* Input Bar */}
          <InputBar
            value={inputText}
            onChangeText={handleInputChange}
            onSend={handleSendMessage}
            disabled={!isConnected}
          />
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
});

export default ChatScreen;
```

#### 4.6.2: Header Component

**File**: `mobile/src/screens/ChatScreen/components/Header.tsx`

```typescript
/**
 * Chat Screen Header
 * Shows connection status and settings button
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  isConnected: boolean;
  onSettingsPress: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  onSettingsPress,
}) => {
  const insets = useSafeAreaInsets();

  const statusColor = isConnected
    ? theme.colors.connected
    : theme.colors.disconnected;
  const statusText = isConnected ? 'Connected' : 'Disconnected';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* Connection Status */}
        <View style={styles.status}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.statusText}>{statusText}</Text>
        </View>

        {/* Settings Button */}
        <TouchableOpacity
          onPress={onSettingsPress}
          style={styles.settingsButton}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="settings-outline" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  content: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.base,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  statusText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  settingsButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

#### 4.6.3: Message List Component

**File**: `mobile/src/screens/ChatScreen/components/MessageList.tsx`

```typescript
/**
 * Message List Component
 * Renders chat messages with virtualization
 * Pattern: react-native-gifted-chat FlatList optimization
 */

import React, { forwardRef } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Message } from '@/types';
import { theme } from '@/theme';
import { MessageBubble } from '@/components/chat/MessageBubble';

interface MessageListProps {
  messages: Message[];
}

export const MessageList = forwardRef<FlatList, MessageListProps>(
  ({ messages }, ref) => {
    const renderMessage = ({ item }: { item: Message }) => (
      <MessageBubble message={item} />
    );

    const keyExtractor = (item: Message) => item.id;

    const getItemLayout = (_: any, index: number) => ({
      length: 100, // Estimated height
      offset: 100 * index,
      index,
    });

    return (
      <FlatList
        ref={ref}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.contentContainer}
        style={styles.list}
        // Optimization from react-native-gifted-chat
        windowSize={10}
        maxToRenderPerBatch={10}
        removeClippedSubviews={true}
        initialNumToRender={15}
        // getItemLayout={getItemLayout} // Uncomment if all messages same height
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    );
  }
);

MessageList.displayName = 'MessageList';

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
});
```

#### 4.6.4: Input Bar Component

**File**: `mobile/src/screens/ChatScreen/components/InputBar.tsx`

```typescript
/**
 * Input Bar Component
 * Message input with send button
 */

import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';

interface InputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({
  value,
  onChangeText,
  onSend,
  disabled = false,
}) => {
  const insets = useSafeAreaInsets();

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || theme.spacing.md }]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Message Claude Code..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          maxLength={10000}
          editable={!disabled}
          returnKeyType="default"
          blurOnSubmit={false}
        />
        
        <TouchableOpacity
          onPress={onSend}
          disabled={!canSend}
          style={[
            styles.sendButton,
            {
              backgroundColor: canSend
                ? theme.colors.primary
                : theme.colors.textSecondary,
            },
          ]}
        >
          <Ionicons
            name="arrow-up"
            size={18}
            color={theme.colors.textDark}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          Use / for commands • @ to reference files
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceHighlight,
    borderRadius: theme.borderRadius.xxl,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    paddingRight: 52, // Space for send button
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.md,
    maxHeight: 120,
    ...Platform.select({
      ios: {
        paddingTop: theme.spacing.md,
      },
    }),
  },
  sendButton: {
    position: 'absolute',
    right: theme.spacing.sm,
    bottom: theme.spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintContainer: {
    marginTop: theme.spacing.sm,
    alignItems: 'center',
  },
  hintText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
```

#### 4.6.5: Empty State Component

**File**: `mobile/src/screens/ChatScreen/components/EmptyState.tsx`

```typescript
/**
 * Empty State Component
 * Shown when no messages exist
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@/theme';

interface EmptyStateProps {
  onQuickAction: (text: string) => void;
}

const quickActions = [
  { id: '1', text: '/help', label: 'Show help' },
  { id: '2', text: '/init', label: 'Initialize project' },
  { id: '3', text: 'Create a React component', label: 'Create component' },
  { id: '4', text: '/git', label: 'Git status' },
];

export const EmptyState: React.FC<EmptyStateProps> = ({ onQuickAction }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Claude Code</Text>
      <Text style={styles.subtitle}>
        Your AI-powered mobile development assistant
      </Text>

      <View style={styles.quickActions}>
        <Text style={styles.quickActionsTitle}>Quick Actions:</Text>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionButton}
            onPress={() => onQuickAction(action.text)}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  quickActions: {
    width: '100%',
    maxWidth: 300,
  },
  quickActionsTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.base,
  },
  actionButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.base,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});
```

#### 4.6.6: Error Banner Component

**File**: `mobile/src/screens/ChatScreen/components/ErrorBanner.tsx`

```typescript
/**
 * Error Banner Component
 * Displays error messages
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { useAppStore } from '@/store';

interface ErrorBannerProps {
  error: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error }) => {
  const clearError = useAppStore((state) => state.clearError);

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
      <Text style={styles.errorText} numberOfLines={2}>
        {error}
      </Text>
      <TouchableOpacity onPress={clearError} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
        <Ionicons name="close" size={20} color={theme.colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.error,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  errorText: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.sm,
  },
});
```

#### 4.6.7: Slash Command Menu Component

**File**: `mobile/src/screens/ChatScreen/components/SlashCommandMenu.tsx`

```typescript
/**
 * Slash Command Menu Component
 * Shows available slash commands
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { theme } from '@/theme';

interface SlashCommandMenuProps {
  searchQuery: string;
  onSelect: (command: string) => void;
  onDismiss: () => void;
}

const commands = [
  { command: '/help', description: 'Show all available commands' },
  { command: '/init', description: 'Create CLAUDE.md file' },
  { command: '/clear', description: 'Clear conversation history' },
  { command: '/status', description: 'Show project status' },
  { command: '/files', description: 'List project files' },
  { command: '/git', description: 'Show git status' },
  { command: '/commit', description: 'Create git commit' },
  { command: '/test', description: 'Run tests' },
  { command: '/build', description: 'Build project' },
];

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  searchQuery,
  onSelect,
  onDismiss,
}) => {
  const filteredCommands = useMemo(() => {
    if (!searchQuery) return commands;
    return commands.filter(
      (cmd) =>
        cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  if (filteredCommands.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        {filteredCommands.map((cmd) => (
          <TouchableOpacity
            key={cmd.command}
            style={styles.commandItem}
            onPress={() => onSelect(cmd.command)}
          >
            <Text style={styles.commandText}>{cmd.command}</Text>
            <Text style={styles.descriptionText}>{cmd.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // Above input bar
    left: theme.spacing.base,
    right: theme.spacing.base,
    maxHeight: 300,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.lg,
  },
  scrollView: {
    flex: 1,
  },
  commandItem: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  commandText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  descriptionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
```

### Validation

**Test Chat Screen**:
```bash
# Run app
npx expo start --ios

# Expected:
# - Purple gradient background
# - Header with connection status
# - Empty state with quick actions
# - Input bar at bottom
# - Type "/" to see slash command menu
```

**Success Criteria**:
- ✅ Screen renders with gradient background
- ✅ Header shows connection status
- ✅ Empty state displays when no messages
- ✅ Input bar functional
- ✅ Slash command menu appears on "/"
- ✅ Send button enabled/disabled correctly

### Git Operations

```bash
git add src/screens/ChatScreen/
git commit -m "feat(chat): implement chat screen with message list

- Add chat screen container with gradient background
- Implement header with connection status
- Add message list with FlatList virtualization
- Create input bar with send button
- Add slash command menu with filtering
- Implement empty state with quick actions
- Add error banner component
- Configure keyboard avoidance
- Apply react-native-gifted-chat optimization patterns"
```

---

## Task 4.7: Message Components

**Duration**: 4 hours  
**Prerequisites**: Task 4.6  
**Outputs**: Message bubbles and tool execution displays

**Pattern Source**: react-native-gifted-chat message bubble structure

### Files to Create

#### 4.7.1: Message Bubble Component

**File**: `mobile/src/components/chat/MessageBubble.tsx`

```typescript
/**
 * Message Bubble Component
 * Renders individual chat messages
 * Pattern: react-native-gifted-chat bubble structure
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message, MessageRole } from '@/types';
import { theme } from '@/theme';
import { ToolExecutionDisplay } from './ToolExecutionDisplay';
import { StreamingIndicator } from './StreamingIndicator';
import { MessageMarkdown } from './MessageMarkdown';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === MessageRole.USER;
  const isSystem = message.role === MessageRole.SYSTEM;

  // Format timestamp
  const timestamp = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser && styles.userBubble,
          (message.role === MessageRole.ASSISTANT || isSystem) && styles.assistantBubble,
        ]}
      >
        {/* Message Content */}
        {message.content.length > 0 && (
          <MessageMarkdown content={message.content} isUser={isUser} />
        )}

        {/* Streaming Indicator */}
        {message.isStreaming && <StreamingIndicator />}

        {/* Tool Executions */}
        {message.toolExecutions && message.toolExecutions.length > 0 && (
          <View style={styles.toolsContainer}>
            {message.toolExecutions.map((tool) => (
              <ToolExecutionDisplay key={tool.id} execution={tool} />
            ))}
          </View>
        )}

        {/* Timestamp */}
        <Text
          style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.assistantTimestamp,
          ]}
        >
          {timestamp}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.xs,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: theme.borderRadius.xxl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
  },
  assistantBubble: {
    backgroundColor: theme.colors.surfaceHighlight,
  },
  toolsContainer: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  timestamp: {
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.sm,
  },
  userTimestamp: {
    color: theme.colors.textDark,
    opacity: 0.7,
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: theme.colors.textSecondary,
    textAlign: 'left',
  },
});
```

#### 4.7.2: Message Markdown Component

**File**: `mobile/src/components/chat/MessageMarkdown.tsx`

```typescript
/**
 * Message Markdown Component
 * Renders markdown content in messages
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { theme } from '@/theme';

interface MessageMarkdownProps {
  content: string;
  isUser: boolean;
}

export const MessageMarkdown: React.FC<MessageMarkdownProps> = ({
  content,
  isUser,
}) => {
  const markdownStyles = StyleSheet.create({
    body: {
      color: isUser ? theme.colors.textDark : theme.colors.textPrimary,
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.fontSize.base * theme.typography.lineHeight.normal,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: theme.spacing.sm,
    },
    heading1: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      marginBottom: theme.spacing.sm,
      color: isUser ? theme.colors.textDark : theme.colors.textPrimary,
    },
    heading2: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      marginBottom: theme.spacing.sm,
      color: isUser ? theme.colors.textDark : theme.colors.textPrimary,
    },
    code_inline: {
      backgroundColor: isUser
        ? 'rgba(0, 0, 0, 0.2)'
        : theme.colors.codeBackground,
      color: isUser ? theme.colors.textDark : theme.colors.codeText,
      fontFamily: theme.typography.fontFamily.code,
      fontSize: theme.typography.fontSize.sm,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xxs,
      borderRadius: theme.borderRadius.sm,
    },
    code_block: {
      backgroundColor: theme.colors.codeBackground,
      color: theme.colors.codeText,
      fontFamily: theme.typography.fontFamily.code,
      fontSize: theme.typography.fontSize.sm,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginVertical: theme.spacing.sm,
    },
    fence: {
      backgroundColor: theme.colors.codeBackground,
      color: theme.colors.codeText,
      fontFamily: theme.typography.fontFamily.code,
      fontSize: theme.typography.fontSize.sm,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginVertical: theme.spacing.sm,
    },
    link: {
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
    list_item: {
      flexDirection: 'row',
      marginBottom: theme.spacing.xs,
    },
    bullet_list_icon: {
      marginLeft: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      color: isUser ? theme.colors.textDark : theme.colors.textPrimary,
    },
    ordered_list_icon: {
      marginLeft: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      color: isUser ? theme.colors.textDark : theme.colors.textPrimary,
    },
    blockquote: {
      backgroundColor: isUser
        ? 'rgba(0, 0, 0, 0.1)'
        : 'rgba(255, 255, 255, 0.05)',
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
      paddingLeft: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginVertical: theme.spacing.sm,
    },
  });

  return <Markdown style={markdownStyles}>{content}</Markdown>;
};
```

#### 4.7.3: Streaming Indicator Component

**File**: `mobile/src/components/chat/StreamingIndicator.tsx`

```typescript
/**
 * Streaming Indicator Component
 * Animated dots shown during message streaming
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '@/theme';

export const StreamingIndicator: React.FC = () => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = Animated.parallel([
      createAnimation(dot1Anim, 0),
      createAnimation(dot2Anim, 200),
      createAnimation(dot3Anim, 400),
    ]);

    animations.start();

    return () => {
      animations.stop();
    };
  }, []);

  const dotStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, dotStyle(dot1Anim)]} />
      <Animated.View style={[styles.dot, dotStyle(dot2Anim)]} />
      <Animated.View style={[styles.dot, dotStyle(dot3Anim)]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textSecondary,
  },
});
```

#### 4.7.4: Tool Execution Display Component

**File**: `mobile/src/components/chat/ToolExecutionDisplay.tsx`

```typescript
/**
 * Tool Execution Display Component
 * Shows tool execution details and results
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ToolExecution, ToolStatus } from '@/types';
import { theme } from '@/theme';

interface ToolExecutionDisplayProps {
  execution: ToolExecution;
}

export const ToolExecutionDisplay: React.FC<ToolExecutionDisplayProps> = ({
  execution,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (execution.status) {
      case ToolStatus.PENDING:
        return 'time-outline';
      case ToolStatus.EXECUTING:
        return 'reload-outline';
      case ToolStatus.COMPLETE:
        return 'checkmark-circle-outline';
      case ToolStatus.ERROR:
        return 'alert-circle-outline';
      default:
        return 'help-outline';
    }
  };

  const getStatusColor = () => {
    switch (execution.status) {
      case ToolStatus.COMPLETE:
        return theme.colors.success;
      case ToolStatus.ERROR:
        return theme.colors.error;
      case ToolStatus.EXECUTING:
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => setIsExpanded(!isExpanded)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name={getStatusIcon()}
          size={16}
          color={getStatusColor()}
          style={styles.statusIcon}
        />
        <Text style={styles.toolName}>{execution.tool}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={theme.colors.textSecondary}
          style={styles.chevron}
        />
      </View>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.content}>
          {/* Input */}
          {execution.input && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Input:</Text>
              <Text style={styles.codeText}>
                {JSON.stringify(execution.input, null, 2)}
              </Text>
            </View>
          )}

          {/* Result */}
          {execution.result && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Result:</Text>
              <Text style={styles.resultText}>{execution.result}</Text>
            </View>
          )}

          {/* Error */}
          {execution.error && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.error }]}>
                Error:
              </Text>
              <Text style={[styles.resultText, { color: theme.colors.error }]}>
                {execution.error}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginRight: theme.spacing.sm,
  },
  toolName: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  chevron: {
    marginLeft: theme.spacing.sm,
  },
  content: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  section: {
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  codeText: {
    fontFamily: theme.typography.fontFamily.code,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  resultText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
  },
});
```

### Validation

**Test Message Components**:
```bash
# Run app and send messages
npx expo start --ios

# Test:
# - Send user message (should show blue bubble)
# - Wait for assistant response (should stream with dots)
# - Check tool executions display
# - Verify markdown rendering (code, links, lists)
# - Check timestamps format correctly
```

**Success Criteria**:
- ✅ User messages appear on right (teal)
- ✅ Assistant messages appear on left (dark)
- ✅ Streaming indicator animates
- ✅ Tool executions expand/collapse
- ✅ Markdown renders correctly
- ✅ Timestamps formatted properly

### Git Operations

```bash
git add src/components/chat/
git commit -m "feat(components): implement message bubble components

- Add MessageBubble with user/assistant styling
- Implement MessageMarkdown with syntax highlighting
- Add StreamingIndicator with animated dots
- Create ToolExecutionDisplay with expand/collapse
- Apply react-native-gifted-chat bubble patterns
- Configure markdown styles for light/dark content
- Add timestamp formatting

Pattern source: react-native-gifted-chat (13k stars)"
```

---

Due to length limitations, I'll continue with the remaining tasks in the next response. The plan so far covers:

✅ Task 4.1: Project Setup
✅ Task 4.2: Design System
✅ Task 4.3: State Management
✅ Task 4.4: WebSocket Service
✅ Task 4.5: Navigation
✅ Task 4.6: Chat Screen
✅ Task 4.7: Message Components

**Remaining** to generate:
- Task 4.8: Slash Command System
- Task 4.9: File Browser Screen
- Task 4.10: Code Viewer Screen
- Task 4.11: Settings Screen
- Task 4.12: Sessions Screen
- Task 4.13: Error Handling
- Task 4.14: Testing & Polish
- Gate 4A: iOS Simulator Testing

Would you like me to continue generating the complete remaining tasks now?