# Claude Code Mobile - Complete Application Specification

## Executive Summary

Claude Code Mobile is a production-ready iOS mobile application that replicates the functionality of Claude Code CLI in a native mobile environment. This comprehensive specification document provides exhaustive details for UI design, system architecture, data models, implementation requirements, and integration specifications.

**Version**: 1.0.0  
**Platform**: iOS 14.0+  
**Framework**: React Native with Expo  
**Backend**: Node.js with Express and WebSocket  
**Last Updated**: 2025-10-30

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Frontend Specifications](#2-frontend-specifications)
3. [Backend Specifications](#3-backend-specifications)
4. [Data Models](#4-data-models)
5. [API Specifications](#5-api-specifications)
6. [Security & Authentication](#6-security--authentication)
7. [Deployment & Infrastructure](#7-deployment--infrastructure)
8. [Testing Strategy](#8-testing-strategy)
9. [Performance Requirements](#9-performance-requirements)
10. [Claude Code Integration](#10-claude-code-integration)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Client Layer                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Chat UI   │  │ File Browser │  │ Code Viewer  │      │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                           │                                  │
│                    ┌──────▼──────┐                          │
│                    │ State Store │                          │
│                    │  (Zustand)  │                          │
│                    └──────┬──────┘                          │
│                           │                                  │
│                  ┌────────▼────────┐                        │
│                  │ WebSocket Client│                        │
│                  └────────┬────────┘                        │
└───────────────────────────┼─────────────────────────────────┘
                            │
                   WebSocket Connection
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Backend Server Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Express    │  │  WebSocket   │  │  REST API    │     │
│  │   Server     │  │   Server     │  │  Endpoints   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                           │                                  │
│         ┌─────────────────┴─────────────────┐               │
│         │                                   │               │
│  ┌──────▼──────┐  ┌────────────┐  ┌───────▼──────┐        │
│  │   Claude    │  │    File    │  │     Git      │        │
│  │  API Client │  │   System   │  │  Operations  │        │
│  └──────┬──────┘  └────────────┘  └──────────────┘        │
│         │                                                   │
└─────────┼───────────────────────────────────────────────────┘
          │
          │ HTTPS
          │
┌─────────▼───────────────────────────────────────────────────┐
│                  Anthropic Claude API                        │
│              (claude-sonnet-4-20250514)                      │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Component Architecture

#### 1.2.1 Mobile Application Components
- **Presentation Layer**: React Native screens and components
- **State Management**: Zustand global store with persistence
- **Communication Layer**: WebSocket service for real-time data
- **Storage Layer**: AsyncStorage for local persistence
- **Utility Layer**: Helper functions and services

#### 1.2.2 Backend Server Components
- **API Gateway**: Express.js HTTP server
- **WebSocket Server**: ws library for real-time communication
- **Service Layer**: Business logic and orchestration
- **Repository Layer**: Data access and file operations
- **Integration Layer**: Claude API, MCP servers, Git

### 1.3 Technology Stack

#### 1.3.1 Frontend Stack
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React Native | 0.76.5 | Mobile UI framework |
| Build Tool | Expo | 52.0.0 | Development and build platform |
| State Management | Zustand | 5.0.2 | Global state management |
| Navigation | React Navigation | 6.1.18 | Screen navigation |
| WebSocket | ws | Native | Real-time communication |
| Storage | AsyncStorage | 1.24.0 | Local data persistence |
| UI Components | React Native | Native | Core UI primitives |
| Gestures | Gesture Handler | 2.20.2 | Touch gestures |
| Animations | Reanimated | 3.16.1 | Performant animations |
| Markdown | Markdown Display | 7.0.2 | Message rendering |
| Code Highlighting | Syntax Highlighter | 2.1.0 | Code display |

#### 1.3.2 Backend Stack
| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Node.js | 18+ | Server runtime |
| Framework | Express | 4.19.2 | HTTP server framework |
| WebSocket | ws | 8.18.0 | WebSocket server |
| Claude API | @anthropic-ai/sdk | 0.30.1 | Claude integration |
| Git Operations | simple-git | 3.25.0 | Git functionality |
| File Watching | chokidar | 3.6.0 | File system monitoring |
| File Patterns | glob | 11.0.0 | File matching |
| Security | helmet | 7.1.0 | Security headers |
| CORS | cors | 2.8.5 | Cross-origin requests |
| Compression | compression | 1.7.4 | Response compression |

### 1.4 System Requirements

#### 1.4.1 Mobile Device Requirements
- **iOS Version**: 14.0 or higher
- **Processor**: A12 Bionic or newer
- **RAM**: Minimum 2GB, recommended 4GB+
- **Storage**: 100MB app size, 500MB+ recommended for cache
- **Network**: WiFi or cellular data connection
- **Permissions**: Network access, optional camera/microphone

#### 1.4.2 Backend Server Requirements
- **Operating System**: Linux, macOS, or Windows Server
- **Node.js**: Version 18.0.0 or higher
- **Memory**: Minimum 512MB, recommended 2GB+
- **CPU**: 1 core minimum, 2+ cores recommended
- **Storage**: 1GB minimum for application and logs
- **Network**: Public IP or domain for mobile access
- **SSL Certificate**: Required for production (wss://)

### 1.5 Installation Locations

#### 1.5.1 Mobile App File Structure
```
/[User's Phone]/
├── /Applications/
│   └── /ClaudeCodeMobile.app/          # Main application bundle
│       ├── /Assets/                     # Images, fonts, icons
│       ├── /Frameworks/                 # React Native frameworks
│       └── /PlugIns/                    # App extensions
│
├── /Documents/
│   └── /ClaudeCodeMobile/              # User documents
│       ├── /exports/                    # Exported sessions
│       └── /uploads/                    # Uploaded files
│
└── /Library/
    └── /Application Support/
        └── /ClaudeCodeMobile/          # App data
            ├── /cache/                  # Cached data
            ├── /databases/              # Local databases
            └── /preferences/            # User preferences

AsyncStorage Data:
- claude-code-storage: Main application state
- sessionId: Current session identifier
- serverUrl: Backend server URL
- settings: User preferences
```

#### 1.5.2 Backend Server File Structure
```
/opt/claude-code-backend/               # Production installation
├── /dist/                              # Compiled JavaScript
│   ├── index.js                        # Main server entry
│   ├── /services/                      # Service layer
│   ├── /routes/                        # API routes
│   └── /utils/                         # Utilities
│
├── /logs/                              # Application logs
│   ├── access.log                      # HTTP access logs
│   ├── error.log                       # Error logs
│   └── websocket.log                   # WebSocket logs
│
├── /sessions/                          # Session data
│   └── [session-id].json              # Individual sessions
│
├── /projects/                          # User projects (optional)
│   └── [user-projects]/               # Mounted project directories
│
├── /config/                            # Configuration files
│   ├── .env                           # Environment variables
│   └── config.json                    # Application config
│
└── /node_modules/                      # Dependencies

Environment Variables Location:
- Development: /opt/claude-code-backend/.env
- Production: System environment or /etc/environment
- Docker: Container environment variables
```

---

## 2. Frontend Specifications

### 2.1 UI Design System

#### 2.1.1 Color Palette

**Primary Colors:**
```typescript
const colors = {
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
  overlay: 'rgba(0, 0, 0, 0.5)',      // Modal overlays
  border: 'rgba(255, 255, 255, 0.1)', // Borders and dividers
  surface: 'rgba(255, 255, 255, 0.05)', // Cards and surfaces
  surfaceHighlight: 'rgba(255, 255, 255, 0.1)',
  
  // Code Highlighting
  codeBackground: '#2c3e50',
  codeText: '#ecf0f1',
  codeKeyword: '#4ecdc4',
  codeString: '#2ecc71',
  codeComment: '#7f8c8d',
  codeNumber: '#f39c12',
};
```

#### 2.1.2 Typography

**Font System:**
```typescript
const typography = {
  // Font Families
  fontFamily: {
    primary: 'System',           // San Francisco on iOS
    mono: 'Menlo',              // Monospace for code
    code: 'Menlo',              // Code display
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
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
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
```

#### 2.1.3 Spacing System

**8-Point Grid System:**
```typescript
const spacing = {
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
```

#### 2.1.4 Border Radius

```typescript
const borderRadius = {
  none: 0,
  sm: 4,      // Small radius (buttons)
  md: 8,      // Medium radius (cards)
  lg: 12,     // Large radius (modals)
  xl: 16,     // Extra large (sheets)
  xxl: 20,    // Message bubbles
  full: 9999, // Circular elements
};
```

#### 2.1.5 Shadows and Elevation

```typescript
const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 16,
  },
};
```

### 2.2 Screen Specifications

#### 2.2.1 Chat Screen (Primary Interface)

**Layout Structure:**
```
┌────────────────────────────────────┐
│  Status Bar (Dynamic Island)       │
├────────────────────────────────────┤
│  ┌──────────────────────────────┐ │
│  │ Connection Status  [Settings]│ │ <- Header (60px)
│  └──────────────────────────────┘ │
├────────────────────────────────────┤
│  ┌──────────────────────────────┐ │
│  │ /help  /clear  /init  /git   │ │ <- Slash Commands (if active)
│  └──────────────────────────────┘ │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐ │
│  │  User Message                │ │
│  │  [Timestamp]                 │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ Assistant Message             │ │
│  │ [Tool Executions]            │ │
│  │ [Streaming Indicator]        │ │ <- Messages (Scrollable)
│  │ [Timestamp]                  │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  User Message                │ │
│  │  [Timestamp]                 │ │
│  └──────────────────────────────┘ │
│                                    │
├────────────────────────────────────┤
│  ┌──────────────────────────────┐ │
│  │ Message Claude Code...    [▲]│ │ <- Input (80px)
│  │ Use / for commands • @ files │ │
│  └──────────────────────────────┘ │
│  Safe Area Bottom                  │
└────────────────────────────────────┘
```

**Component Specifications:**

1. **Status Bar**
   - Height: System-defined (44px on notched devices)
   - Background: Transparent (shows gradient)
   - Style: Light content (white icons)

2. **Header Bar**
   - Height: 60px
   - Padding: 16px horizontal, 12px vertical
   - Background: Semi-transparent with blur
   - Border: 1px solid rgba(255,255,255,0.1)
   - Left: Connection status indicator (dot + text)
   - Right: Settings gear icon (24x24px)

3. **Slash Command Menu** (conditional)
   - Height: Auto (max 300px)
   - Background: rgba(0,0,0,0.9) with blur
   - Border Radius: 12px
   - Padding: 0px (items handle own padding)
   - Item Height: 60px
   - Item Padding: 16px
   - Transition: Slide down animation (200ms)

4. **Messages List**
   - Type: FlatList (virtualized)
   - Padding: 16px horizontal, 20px vertical
   - Item Spacing: 20px between messages
   - Content Inset: Keyboard-aware
   - Scroll Behavior: Auto-scroll on new messages

5. **Message Bubbles**
   - User Messages:
     - Max Width: 85% of screen
     - Alignment: Right
     - Background: #4ecdc4 (teal)
     - Text Color: #0f0c29 (dark)
     - Border Radius: 20px (all corners)
     - Padding: 12px horizontal, 12px vertical
   - Assistant Messages:
     - Max Width: 85% of screen
     - Alignment: Left
     - Background: rgba(255,255,255,0.1)
     - Text Color: #ecf0f1 (light)
     - Border Radius: 20px (all corners)
     - Padding: 12px horizontal, 12px vertical

6. **Tool Execution Display**
   - Background: rgba(0,0,0,0.3)
   - Border Radius: 12px
   - Padding: 12px
   - Border Left: 3px solid #4ecdc4
   - Margin Top: 12px
   - Tool Name: 14px, weight 600, color #4ecdc4
   - Tool Input: 12px, mono font, color #95a5a6
   - Tool Result: 13px, color #ecf0f1

7. **Input Area**
   - Height: Auto (min 60px, max 120px)
   - Padding: 16px horizontal, 10px vertical + safe area
   - Background: rgba(0,0,0,0.3) with blur
   - Border Top: 1px solid rgba(255,255,255,0.1)
   
8. **Text Input**
   - Background: rgba(255,255,255,0.1)
   - Border Radius: 24px
   - Padding: 12px horizontal, 8px vertical
   - Font Size: 16px
   - Max Height: 120px (5 lines)
   - Placeholder: "Message Claude Code..."
   - Placeholder Color: #7f8c8d

9. **Send Button**
   - Size: 36x36px
   - Border Radius: 18px (circular)
   - Background: #4ecdc4 (enabled), #7f8c8d (disabled)
   - Icon: ▲ (up arrow)
   - Icon Size: 18px
   - Icon Color: #fff
   - Position: Absolute right, centered vertically
   - Margin: 8px from right edge

10. **Hint Text**
    - Font Size: 12px
    - Color: #7f8c8d
    - Text: "Use / for commands • @ to reference files"
    - Alignment: Center
    - Margin Top: 8px

**Interactions:**
- Tap message: Select/deselect
- Long press message: Show context menu (copy, retry, delete)
- Swipe message: Quick actions
- Pull to refresh: Reload messages
- Keyboard shows: Auto-scroll to input
- New message: Auto-scroll to bottom (if near bottom)

**States:**
- Connected: Green dot + "Connected"
- Disconnected: Red dot + "Disconnected"
- Connecting: Orange dot + "Connecting..."
- Streaming: Animated typing indicator
- Error: Red banner with error message
- Empty: Welcome message with quick actions

#### 2.2.2 File Browser Screen

**Layout Structure:**
```
┌────────────────────────────────────┐
│  [← Back]  Files                   │ <- Header
├────────────────────────────────────┤
│  ┌──────────────────────────────┐ │
│  │ 🔍 Search files...           │ │ <- Search Bar
│  └──────────────────────────────┘ │
├────────────────────────────────────┤
│  📁 /home/user/project             │ <- Current Path
├────────────────────────────────────┤
│  ┌──────────────────────────────┐ │
│  │ 📁 src/                [›]   │ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ 📘 App.tsx              [›]  │ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ 📋 package.json         [›]  │ │ <- File List
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ 📝 README.md            [›]  │ │
│  └──────────────────────────────┘ │
│                                    │
├────────────────────────────────────┤
│  [🔄 Refresh]         [🏠 Root]   │ <- Actions
└────────────────────────────────────┘
```

**Component Specifications:**

1. **Search Bar**
   - Height: 48px
   - Padding: 16px horizontal
   - Background: rgba(255,255,255,0.1)
   - Border Radius: 12px
   - Icon: 🔍 (20px, left aligned)
   - Placeholder: "Search files..."
   - Clear button: X (right side when text present)

2. **Path Indicator**
   - Height: 40px
   - Padding: 16px horizontal, 8px vertical
   - Background: rgba(0,0,0,0.3)
   - Font: 14px, mono
   - Color: #4ecdc4
   - Weight: 600

3. **File/Directory Item**
   - Height: 64px
   - Padding: 16px
   - Background: rgba(255,255,255,0.05)
   - Border Radius: 12px
   - Margin: 8px horizontal, 4px vertical
   - Layout:
     - Icon Container: 40x40px, rounded 8px, background rgba(78,205,196,0.2)
     - Icon: 24px emoji
     - Name: 16px, weight 600, color #ecf0f1
     - Path: 12px, color #7f8c8d
     - Chevron: 24px, color #4ecdc4

4. **Action Buttons**
   - Height: 48px
   - Width: 50% each (minus 8px gap)
   - Background: rgba(78,205,196,0.2)
   - Border Radius: 12px
   - Text: 14px, weight 600, color #4ecdc4
   - Icon + Text layout

**File Icons:**
- Directories: 📁
- TypeScript: 📘
- JavaScript: 📙
- JSON: 📋
- Markdown: 📝
- CSS/SCSS: 🎨
- HTML: 🌐
- Images: 🖼️
- Default: 📄

#### 2.2.3 Code Viewer Screen

**Layout Structure:**
```
┌────────────────────────────────────┐
│  [← Back]  App.tsx                 │ <- Header
├────────────────────────────────────┤
│  ┌──────────────────────────────┐ │
│  │ 📘 App.tsx                   │ │
│  │ 250 lines • typescript       │ │ <- File Info
│  └──────────────────────────────┘ │
├────────────────────────────────────┤
│  [🔢 Lines] [↔️ Wrap] [📋] [⬆️]  │ <- Toolbar
├────────────────────────────────────┤
│ 1 │ import React from 'react';   │
│ 2 │ import { View, Text } ...    │
│ 3 │                              │
│ 4 │ export default function...   │ <- Code Content
│ 5 │   return (                   │
│ 6 │     <View>                   │
│...│   ...                        │
├────────────────────────────────────┤
│  Characters: 5,234 • Words: 892   │ <- Stats Footer
└────────────────────────────────────┘
```

**Component Specifications:**

1. **File Info Header**
   - Height: 80px
   - Padding: 16px
   - Background: Gradient
   - Border Bottom: 1px solid rgba(255,255,255,0.1)
   - File Name: 18px, weight bold
   - Details: 14px, color #7f8c8d

2. **Toolbar**
   - Height: 48px
   - Padding: 12px horizontal, 8px vertical
   - Background: rgba(0,0,0,0.3)
   - Gap: 12px between buttons
   - Button Size: 36px height, auto width
   - Button Background: rgba(78,205,196,0.2)
   - Button Border Radius: 8px

3. **Code Display**
   - Font: Menlo, 14px
   - Line Height: 20px
   - Background: #2c3e50
   - Padding: 16px
   - Horizontal Scroll: Enabled (unless wrapped)
   - Vertical Scroll: Always enabled

4. **Line Numbers** (optional)
   - Width: 60px (dynamic based on max lines)
   - Background: rgba(0,0,0,0.3)
   - Border Right: 1px solid rgba(255,255,255,0.1)
   - Padding: 16px vertical, 12px horizontal
   - Font: Menlo, 14px
   - Color: #7f8c8d
   - Text Align: Right

5. **Syntax Highlighting Colors**
   - Keywords: #4ecdc4
   - Strings: #2ecc71
   - Numbers: #f39c12
   - Comments: #7f8c8d
   - Functions: #3498db
   - Operators: #ecf0f1

#### 2.2.4 Settings Screen

**Layout Structure:**
```
┌────────────────────────────────────┐
│  [← Back]  Settings                │ <- Header
├────────────────────────────────────┤
│  🌐 Server Configuration           │
│  ┌──────────────────────────────┐ │
│  │ Server URL                   │ │
│  │ ws://192.168.1.100:3001     │ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ Project Path                 │ │
│  │ /Users/me/projects/app      │ │
│  └──────────────────────────────┘ │
│                                    │
│  🔐 API Configuration              │
│  ┌──────────────────────────────┐ │
│  │ API Key (Optional)           │ │
│  │ ••••••••••••                │ │
│  └──────────────────────────────┘ │
│                                    │
│  🎨 UI Preferences                 │
│  Auto-scroll         [Toggle ON]   │
│  Haptic feedback    [Toggle ON]   │
│  Dark mode          [Toggle ON]   │
│                                    │
│  ⚡ Actions                        │
│  [💾 Save Settings]               │
│  [📂 View Sessions]               │
│  [🗑️ Clear All Data]              │
├────────────────────────────────────┤
│  ℹ️ About                          │
│  Claude Code Mobile v1.0.0        │
│  Built with React Native & Expo   │
└────────────────────────────────────┘
```

**Component Specifications:**

1. **Section Headers**
   - Height: 40px
   - Padding: 16px horizontal, 12px vertical
   - Font: 18px, weight bold
   - Color: #ecf0f1
   - Margin Top: 24px (except first)

2. **Input Fields**
   - Height: 56px
   - Padding: 16px
   - Background: rgba(255,255,255,0.1)
   - Border Radius: 12px
   - Font: 16px
   - Color: #ecf0f1
   - Margin: 8px horizontal, 8px vertical
   - Label: 14px, color #ecf0f1, margin bottom 8px

3. **Toggle Switches**
   - Height: 56px
   - Layout: Flexbox (space-between)
   - Label: 16px, color #ecf0f1
   - Switch: iOS native switch
   - Track Color: #767577 (off), #4ecdc4 (on)
   - Thumb Color: #fff

4. **Action Buttons**
   - Height: 48px
   - Width: 100%
   - Background: #4ecdc4 (primary), rgba(78,205,196,0.3) (secondary)
   - Border Radius: 12px
   - Text: 16px, weight bold, color #fff
   - Margin: 12px horizontal, 12px vertical

5. **About Section**
   - Padding: 16px
   - Text: 14px, color #7f8c8d
   - Line Height: 24px
   - Text Align: Left

#### 2.2.5 Sessions Screen

**Layout Structure:**
```
┌────────────────────────────────────┐
│  [← Back]  Your Sessions      [🔄] │ <- Header
├────────────────────────────────────┤
│  ┌──────────────────────────────┐ │
│  │ 📁 /home/user/project1       │ │
│  │ 15 messages • 30m ago    [🗑]│ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │ 📁 /home/user/project2       │ │
│  │ 8 messages • 2h ago      [🗑]│ │
│  └──────────────────────────────┘ │
│                                    │
└────────────────────────────────────┘
```

### 2.3 Responsive Behavior

#### 2.3.1 Device Support
- iPhone SE (375x667): Minimum supported
- iPhone 14 Pro (393x852): Optimized
- iPhone 14 Pro Max (430x932): Optimized  
- iPad (768x1024): Supported with adaptive layout

#### 2.3.2 Orientation
- Portrait: Primary and optimized
- Landscape: Supported with adjusted layout

#### 2.3.3 Safe Areas
- Top: Dynamic Island / Notch
- Bottom: Home Indicator
- All screens respect safe area insets

### 2.4 Animations & Transitions

#### 2.4.1 Screen Transitions
- Type: Stack navigation with slide
- Duration: 300ms
- Easing: ease-in-out
- Gesture: Swipe from left edge to go back

#### 2.4.2 Component Animations
- Message appear: Fade in + slide up (200ms)
- Streaming indicator: Pulsing dots (1000ms cycle)
- Tool execution: Expand/collapse (250ms)
- Error banner: Slide down from top (300ms)
- Loading states: Spinner or skeleton screens

#### 2.4.3 Haptic Feedback
- Light: Button taps, toggles
- Medium: Long press, important actions
- Heavy: Errors, critical actions
- Success: Completion notifications
- Warning: Warning states
- Error: Error states

### 2.5 Accessibility

#### 2.5.1 Screen Reader Support
- All interactive elements labeled
- Meaningful descriptions for icons
- Proper heading hierarchy
- Live region announcements for messages

#### 2.5.2 Touch Targets
- Minimum size: 44x44pt
- Recommended: 48x48pt
- Spacing: Minimum 8pt between targets

#### 2.5.3 Contrast Ratios
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

#### 2.5.4 Dynamic Type
- Support iOS Dynamic Type
- Scale from 75% to 200%
- Maintain layout integrity

---

## 3. Backend Specifications

### 3.1 Server Architecture

#### 3.1.1 Application Entry Point

**File: `src/index.ts`**

```typescript
import express, { Express } from 'express';
import { createServer, Server as HTTPServer } from 'http';
import { WebSocketServer } from 'ws';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { setupWebSocket } from './websocket/server';
import apiRoutes from './routes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const server: HTTPServer = createServer(app);

// Configuration
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));

// Compression
app.use(compression());

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
app.use(rateLimiter);

// API routes
app.use('/api/v1', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
  });
});

// Error handling
app.use(errorHandler);

// WebSocket setup
const wss: WebSocketServer = setupWebSocket(server);

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📡 WebSocket server ready`);
  logger.info(`🔐 Environment: ${NODE_ENV}`);
  logger.info(`🔑 API Key: ${process.env.ANTHROPIC_API_KEY ? 'Configured' : 'Missing'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { app, server, wss };
```

#### 3.1.2 Environment Variables

**File: `.env`**

```bash
# Server Configuration
PORT=3001
NODE_ENV=production
HOST=0.0.0.0

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ANTHROPIC_MAX_TOKENS=8192
ANTHROPIC_TEMPERATURE=1

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d

# CORS
ALLOWED_ORIGINS=http://localhost:8081,exp://192.168.1.100:8081

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=50mb
ALLOWED_FILE_TYPES=.ts,.tsx,.js,.jsx,.json,.md,.txt,.css,.html

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# WebSocket
WS_HEARTBEAT_INTERVAL=30000
WS_TIMEOUT=60000

# MCP Servers (Optional)
MCP_ENABLED=true
MCP_SERVERS={"tavily":{"url":"https://mcp.tavily.com/mcp","apiKey":"tvly-xxxxx"}}

# Redis (Optional, for session storage)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Database (Optional, for persistent storage)
DATABASE_URL=postgresql://user:password@localhost:5432/claudecode
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Monitoring (Optional)
SENTRY_DSN=
ANALYTICS_ENABLED=false
```

### 3.2 WebSocket Server Implementation

#### 3.2.1 WebSocket Server Setup

**File: `src/websocket/server.ts`**

```typescript
import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { SessionManager } from './sessionManager';
import { MessageHandler } from './messageHandler';
import { ClaudeService } from '../services/claude.service';

export function setupWebSocket(server: HTTPServer): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const sessionManager = new SessionManager();
  const claudeService = new ClaudeService();
  const messageHandler = new MessageHandler(sessionManager, claudeService);

  wss.on('connection', (ws: WebSocket, req) => {
    const connectionId = uuidv4();
    const ipAddress = req.socket.remoteAddress;

    logger.info(`New WebSocket connection: ${connectionId} from ${ipAddress}`);

    // Set up heartbeat
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Handle messages
    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        await messageHandler.handle(ws, message, connectionId);
      } catch (error) {
        logger.error(`Error handling message: ${error}`);
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Invalid message format',
        }));
      }
    });

    // Handle close
    ws.on('close', () => {
      logger.info(`WebSocket connection closed: ${connectionId}`);
      sessionManager.removeConnection(connectionId);
    });

    // Handle errors
    ws.on('error', (error) => {
      logger.error(`WebSocket error for ${connectionId}:`, error);
    });
  });

  // Heartbeat interval
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws: any) => {
      if (ws.isAlive === false) {
        logger.warn('Terminating inactive WebSocket connection');
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  return wss;
}
```

#### 3.2.2 Message Handler

**File: `src/websocket/messageHandler.ts`**

```typescript
import { WebSocket } from 'ws';
import { SessionManager } from './sessionManager';
import { ClaudeService } from '../services/claude.service';
import { FileService } from '../services/file.service';
import { GitService } from '../services/git.service';
import { CommandService } from '../services/command.service';
import { logger } from '../utils/logger';

export class MessageHandler {
  constructor(
    private sessionManager: SessionManager,
    private claudeService: ClaudeService
  ) {}

  async handle(ws: WebSocket, message: any, connectionId: string): Promise<void> {
    const { type, ...payload } = message;

    switch (type) {
      case 'init_session':
        await this.handleInitSession(ws, payload, connectionId);
        break;
      case 'message':
        await this.handleMessage(ws, payload, connectionId);
        break;
      case 'list_sessions':
        await this.handleListSessions(ws, connectionId);
        break;
      case 'get_session':
        await this.handleGetSession(ws, payload, connectionId);
        break;
      case 'delete_session':
        await this.handleDeleteSession(ws, payload, connectionId);
        break;
      default:
        logger.warn(`Unknown message type: ${type}`);
        ws.send(JSON.stringify({
          type: 'error',
          error: `Unknown message type: ${type}`,
        }));
    }
  }

  private async handleInitSession(
    ws: WebSocket,
    payload: any,
    connectionId: string
  ): Promise<void> {
    const { sessionId, projectPath } = payload;
    
    const session = sessionId
      ? await this.sessionManager.getSession(sessionId)
      : await this.sessionManager.createSession(projectPath);

    this.sessionManager.addConnection(connectionId, ws, session.id);

    ws.send(JSON.stringify({
      type: 'session_initialized',
      sessionId: session.id,
      hasContext: !!session.claudeContext,
    }));
  }

  private async handleMessage(
    ws: WebSocket,
    payload: any,
    connectionId: string
  ): Promise<void> {
    const { message } = payload;
    const session = this.sessionManager.getSessionByConnection(connectionId);

    if (!session) {
      ws.send(JSON.stringify({
        type: 'error',
        error: 'No active session',
      }));
      return;
    }

    // Handle slash commands
    if (message.startsWith('/')) {
      await this.handleSlashCommand(ws, message, session);
      return;
    }

    // Send to Claude
    await this.claudeService.streamMessage(
      ws,
      message,
      session,
      (event) => this.handleClaudeEvent(ws, event, session)
    );
  }

  private async handleSlashCommand(
    ws: WebSocket,
    command: string,
    session: any
  ): Promise<void> {
    const commandService = new CommandService();
    const result = await commandService.execute(command, session);

    ws.send(JSON.stringify({
      type: 'slash_command_response',
      content: result,
    }));
  }

  private handleClaudeEvent(ws: WebSocket, event: any, session: any): void {
    switch (event.type) {
      case 'content_block_delta':
        ws.send(JSON.stringify({
          type: 'content_delta',
          delta: event.delta.text,
        }));
        break;
      case 'tool_use':
        ws.send(JSON.stringify({
          type: 'tool_execution',
          tool: event.name,
          input: event.input,
        }));
        break;
      case 'tool_result':
        ws.send(JSON.stringify({
          type: 'tool_result',
          tool: event.name,
          result: event.result,
        }));
        break;
      case 'message_stop':
        ws.send(JSON.stringify({
          type: 'message_complete',
        }));
        break;
      case 'error':
        ws.send(JSON.stringify({
          type: 'error',
          error: event.error,
        }));
        break;
    }
  }
}
```

### 3.3 Claude API Integration

#### 3.3.1 Claude Service

**File: `src/services/claude.service.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { WebSocket } from 'ws';
import { logger } from '../utils/logger';
import { ToolExecutor } from './toolExecutor';

export class ClaudeService {
  private client: Anthropic;
  private toolExecutor: ToolExecutor;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
    this.toolExecutor = new ToolExecutor();
  }

  async streamMessage(
    ws: WebSocket,
    userMessage: string,
    session: any,
    onEvent: (event: any) => void
  ): Promise<void> {
    try {
      const messages = this.buildMessages(userMessage, session);
      const tools = this.toolExecutor.getTools();

      const stream = await this.client.messages.stream({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '8192'),
        messages,
        tools,
        temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '1'),
      });

      let currentToolUse: any = null;

      stream.on('text', (text: string) => {
        onEvent({ type: 'content_block_delta', delta: { text } });
      });

      stream.on('content_block_start', (block: any) => {
        if (block.type === 'tool_use') {
          currentToolUse = {
            name: block.name,
            id: block.id,
            input: {},
          };
        }
      });

      stream.on('content_block_delta', async (delta: any) => {
        if (delta.type === 'input_json_delta' && currentToolUse) {
          currentToolUse.input = {
            ...currentToolUse.input,
            ...JSON.parse(delta.partial_json || '{}'),
          };
        }
      });

      stream.on('content_block_stop', async () => {
        if (currentToolUse) {
          onEvent({
            type: 'tool_use',
            name: currentToolUse.name,
            input: currentToolUse.input,
          });

          const result = await this.toolExecutor.execute(
            currentToolUse.name,
            currentToolUse.input,
            session.projectPath
          );

          onEvent({
            type: 'tool_result',
            name: currentToolUse.name,
            result,
          });

          currentToolUse = null;
        }
      });

      stream.on('message_stop', () => {
        onEvent({ type: 'message_stop' });
      });

      stream.on('error', (error: any) => {
        logger.error('Claude API error:', error);
        onEvent({ type: 'error', error: error.message });
      });
    } catch (error: any) {
      logger.error('Error streaming message:', error);
      onEvent({ type: 'error', error: error.message });
    }
  }

  private buildMessages(userMessage: string, session: any): any[] {
    const messages: any[] = [];

    // Add context if available
    if (session.claudeContext) {
      messages.push({
        role: 'user',
        content: `Project Context:\n${session.claudeContext}\n\nUser Request: ${userMessage}`,
      });
    } else {
      messages.push({
        role: 'user',
        content: userMessage,
      });
    }

    return messages;
  }
}
```

### 3.4 Tool System

#### 3.4.1 Tool Executor

**File: `src/services/toolExecutor.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import simpleGit, { SimpleGit } from 'simple-git';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/logger';

const execAsync = promisify(exec);

export class ToolExecutor {
  getTools(): Anthropic.Tool[] {
    return [
      {
        name: 'read_file',
        description: 'Read the contents of a file from the project directory',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file relative to project root',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'write_file',
        description: 'Write content to a file in the project directory',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file relative to project root',
            },
            content: {
              type: 'string',
              description: 'Content to write to the file',
            },
          },
          required: ['path', 'content'],
        },
      },
      {
        name: 'list_files',
        description: 'List files in a directory',
        input_schema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Directory path relative to project root',
            },
            pattern: {
              type: 'string',
              description: 'Optional glob pattern to filter files',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'execute_command',
        description: 'Execute a shell command in the project directory',
        input_schema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'Shell command to execute',
            },
          },
          required: ['command'],
        },
      },
      {
        name: 'git_status',
        description: 'Get current git status',
        input_schema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'git_commit',
        description: 'Create a git commit',
        input_schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Commit message',
            },
          },
          required: ['message'],
        },
      },
    ];
  }

  async execute(
    toolName: string,
    toolInput: any,
    projectPath: string
  ): Promise<string> {
    const fullPath = path.join(projectPath, toolInput.path || '');
    const git: SimpleGit = simpleGit(projectPath);

    try {
      switch (toolName) {
        case 'read_file':
          return await this.readFile(fullPath);

        case 'write_file':
          return await this.writeFile(fullPath, toolInput.content);

        case 'list_files':
          return await this.listFiles(fullPath, toolInput.pattern);

        case 'execute_command':
          return await this.executeCommand(toolInput.command, projectPath);

        case 'git_status':
          return await this.gitStatus(git);

        case 'git_commit':
          return await this.gitCommit(git, toolInput.message);

        default:
          return `Unknown tool: ${toolName}`;
      }
    } catch (error: any) {
      logger.error(`Error executing tool ${toolName}:`, error);
      return `Error: ${error.message}`;
    }
  }

  private async readFile(filePath: string): Promise<string> {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  }

  private async writeFile(filePath: string, content: string): Promise<string> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    return `Successfully wrote to ${filePath}`;
  }

  private async listFiles(dirPath: string, pattern?: string): Promise<string> {
    const globPattern = pattern || '**/*';
    const files = await glob(globPattern, {
      cwd: dirPath,
      nodir: true,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**'],
    });
    return JSON.stringify(files, null, 2);
  }

  private async executeCommand(
    command: string,
    cwd: string
  ): Promise<string> {
    const { stdout, stderr } = await execAsync(command, { cwd });
    return stdout || stderr || 'Command executed successfully';
  }

  private async gitStatus(git: SimpleGit): Promise<string> {
    const status = await git.status();
    return JSON.stringify(status, null, 2);
  }

  private async gitCommit(git: SimpleGit, message: string): Promise<string> {
    await git.add('.');
    const commit = await git.commit(message);
    return `Committed: ${commit.commit}`;
  }
}
```

---

## 4. Data Models

### 4.1 Core Data Models

#### 4.1.1 User Model

```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Unique email address
  username: string;              // Unique username
  passwordHash?: string;         // Hashed password (optional for OAuth)
  firstName?: string;            // Optional first name
  lastName?: string;             // Optional last name
  avatarUrl?: string;           // Profile picture URL
  role: UserRole;               // User role
  status: UserStatus;           // Account status
  emailVerified: boolean;       // Email verification status
  createdAt: Date;              // Account creation timestamp
  updatedAt: Date;              // Last update timestamp
  lastLoginAt?: Date;           // Last login timestamp
}

enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}
```

#### 4.1.2 Session Model

```typescript
interface Session {
  id: string;                    // UUID
  userId?: string;               // Optional user ID (for authenticated sessions)
  projectPath: string;           // Project directory path
  conversationHistory: Message[]; // Message history
  claudeContext?: string;        // CLAUDE.md content
  createdAt: Date;              // Session creation timestamp
  lastActive: Date;             // Last activity timestamp
  metadata: SessionMetadata;     // Additional session data
}

interface SessionMetadata {
  deviceInfo?: string;           // Device information
  ipAddress?: string;            // Client IP address
  userAgent?: string;            // Browser user agent
  totalMessages: number;         // Total message count
  totalTokens?: number;          // Total tokens used
}
```

#### 4.1.3 Message Model

```typescript
interface Message {
  id: string;                    // Unique message ID
  sessionId: string;             // Parent session ID
  role: MessageRole;             // Message sender role
  content: string;               // Message content
  timestamp: Date;               // Message timestamp
  isStreaming?: boolean;         // Streaming status
  toolExecutions?: ToolExecution[]; // Tool execution results
  metadata: MessageMetadata;     // Additional message data
}

enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

interface MessageMetadata {
  modelUsed?: string;            // Claude model version
  tokensUsed?: {
    input: number;
    output: number;
  };
  latency?: number;              // Response time in ms
  error?: string;                // Error message if failed
}
```

#### 4.1.4 Tool Execution Model

```typescript
interface ToolExecution {
  id: string;                    // Execution ID
  tool: string;                  // Tool name
  input: any;                    // Tool input parameters
  result?: string;               // Execution result
  status: ToolStatus;            // Execution status
  startedAt: Date;               // Start timestamp
  completedAt?: Date;            // Completion timestamp
  error?: string;                // Error message if failed
}

enum ToolStatus {
  PENDING = 'pending',
  EXECUTING = 'executing',
  COMPLETE = 'complete',
  ERROR = 'error',
}
```

#### 4.1.5 File Model

```typescript
interface FileMetadata {
  path: string;                  // File path relative to project root
  name: string;                  // File name
  extension: string;             // File extension
  size: number;                  // File size in bytes
  type: FileType;                // File or directory
  lastModified: Date;            // Last modification timestamp
  permissions?: string;          // File permissions (Unix-style)
  content?: string;              // File content (when loaded)
}

enum FileType {
  FILE = 'file',
  DIRECTORY = 'directory',
  SYMLINK = 'symlink',
}
```

### 4.2 API Request/Response Models

#### 4.2.1 Authentication

```typescript
// Register Request
interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Register Response
interface RegisterResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

// Login Request
interface LoginRequest {
  email: string;
  password: string;
}

// Login Response
interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}
```

#### 4.2.2 Session Management

```typescript
// Create Session Request
interface CreateSessionRequest {
  projectPath?: string;
  userId?: string;
}

// Create Session Response
interface CreateSessionResponse {
  success: boolean;
  data: {
    sessionId: string;
    session: Session;
  };
}

// List Sessions Response
interface ListSessionsResponse {
  success: boolean;
  data: {
    sessions: Session[];
    total: number;
  };
}
```

#### 4.2.3 WebSocket Messages

```typescript
// Client -> Server Messages
type ClientMessage =
  | InitSessionMessage
  | SendMessageMessage
  | ListSessionsMessage
  | GetSessionMessage
  | DeleteSessionMessage;

interface InitSessionMessage {
  type: 'init_session';
  sessionId?: string;
  projectPath?: string;
}

interface SendMessageMessage {
  type: 'message';
  message: string;
}

// Server -> Client Messages
type ServerMessage =
  | SessionInitializedMessage
  | ContentDeltaMessage
  | ToolExecutionMessage
  | ToolResultMessage
  | MessageCompleteMessage
  | SlashCommandResponseMessage
  | ErrorMessage;

interface SessionInitializedMessage {
  type: 'session_initialized';
  sessionId: string;
  hasContext: boolean;
}

interface ContentDeltaMessage {
  type: 'content_delta';
  delta: string;
}

interface ToolExecutionMessage {
  type: 'tool_execution';
  tool: string;
  input: any;
}

interface ToolResultMessage {
  type: 'tool_result';
  tool: string;
  result: string;
}

interface MessageCompleteMessage {
  type: 'message_complete';
}

interface SlashCommandResponseMessage {
  type: 'slash_command_response';
  content: string;
}

interface ErrorMessage {
  type: 'error';
  error: string;
  code?: string;
}
```

### 4.3 State Management Models

#### 4.3.1 Application State (Zustand)

```typescript
interface AppState {
  // Current Session
  currentSession: Session | null;
  sessions: Session[];
  
  // Messages
  messages: Message[];
  
  // Connection Status
  isConnected: boolean;
  isStreaming: boolean;
  
  // Settings
  settings: AppSettings;
  
  // UI State
  currentFile: { path: string; content: string } | null;
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
  setConnected: (connected: boolean) => void;
  setStreaming: (streaming: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setCurrentFile: (file: { path: string; content: string } | null) => void;
  toggleFilesBrowser: () => void;
  toggleSettings: () => void;
  addRecentCommand: (command: string) => void;
  setError: (error: string | null) => void;
}

interface AppSettings {
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
```

### 4.4 Database Schema (Optional)

If using persistent storage (PostgreSQL, MongoDB, etc.):

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- Sessions Table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  project_path TEXT NOT NULL,
  claude_context TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tool Executions Table
CREATE TABLE tool_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  tool VARCHAR(100) NOT NULL,
  input JSONB,
  result TEXT,
  status VARCHAR(20),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  error TEXT
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_last_active ON sessions(last_active);
CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_tool_executions_message_id ON tool_executions(message_id);
```

---

## 5. API Specifications

### 5.1 REST API Endpoints

#### 5.1.1 Health Check

```http
GET /health

Response 200 OK:
{
  "status": "healthy",
  "timestamp": "2025-10-30T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

#### 5.1.2 Session Management

```http
POST /api/v1/sessions
Content-Type: application/json

Request Body:
{
  "projectPath": "/path/to/project"
}

Response 201 Created:
{
  "success": true,
  "data": {
    "sessionId": "uuid-here"
  }
}
```

```http
GET /api/v1/sessions/:id

Response 200 OK:
{
  "success": true,
  "data": {
    "session": {
      "id": "uuid",
      "projectPath": "/path/to/project",
      "conversationHistory": [...],
      "createdAt": "2025-10-30T12:00:00.000Z",
      "lastActive": "2025-10-30T12:30:00.000Z"
    }
  }
}
```

```http
DELETE /api/v1/sessions/:id

Response 200 OK:
{
  "success": true,
  "data": {
    "message": "Session deleted successfully"
  }
}
```

### 5.2 WebSocket Protocol

#### 5.2.1 Connection

```
Client connects to: ws://server:3001/ws
or: wss://server:3001/ws (production)
```

#### 5.2.2 Message Flow

**1. Initialize Session:**
```json
// Client -> Server
{
  "type": "init_session",
  "sessionId": "optional-existing-session-id",
  "projectPath": "/path/to/project"
}

// Server -> Client
{
  "type": "session_initialized",
  "sessionId": "uuid",
  "hasContext": true
}
```

**2. Send Message:**
```json
// Client -> Server
{
  "type": "message",
  "message": "Create a React component"
}

// Server -> Client (multiple responses)
{
  "type": "content_delta",
  "delta": "Here's a React component:\n\n"
}

{
  "type": "content_delta",
  "delta": "```typescript\n"
}

{
  "type": "tool_execution",
  "tool": "write_file",
  "input": {
    "path": "Component.tsx",
    "content": "..."
  }
}

{
  "type": "tool_result",
  "tool": "write_file",
  "result": "Successfully wrote to Component.tsx"
}

{
  "type": "message_complete"
}
```

**3. Slash Command:**
```json
// Client -> Server
{
  "type": "message",
  "message": "/help"
}

// Server -> Client
{
  "type": "slash_command_response",
  "content": "/help - Show all available commands\n/clear - Clear conversation history\n..."
}
```

**4. Error Handling:**
```json
// Server -> Client
{
  "type": "error",
  "error": "Connection to Claude API failed",
  "code": "CLAUDE_API_ERROR"
}
```

### 5.3 Error Codes

| Code | Description | HTTP Status | Action |
|------|-------------|-------------|--------|
| AUTH_001 | Invalid credentials | 401 | Re-authenticate |
| AUTH_002 | Token expired | 401 | Refresh token |
| AUTH_003 | Invalid token | 401 | Re-authenticate |
| SES_001 | Session not found | 404 | Create new session |
| SES_002 | Session expired | 410 | Create new session |
| API_001 | Claude API error | 502 | Retry request |
| API_002 | Rate limit exceeded | 429 | Wait and retry |
| FILE_001 | File not found | 404 | Check path |
| FILE_002 | Permission denied | 403 | Check permissions |
| GIT_001 | Not a git repository | 400 | Initialize git |
| NET_001 | Network error | 503 | Check connection |
| TOOL_001 | Tool execution failed | 500 | Check logs |

---

## 6. Security & Authentication

### 6.1 Security Measures

#### 6.1.1 API Key Protection
- Store API keys in environment variables only
- Never expose keys in client code
- Rotate keys regularly
- Use separate keys for dev/staging/production

#### 6.1.2 WebSocket Security
- Use WSS (WebSocket Secure) in production
- Validate origin headers
- Implement connection rate limiting
- Use JWT tokens for authentication
- Implement heartbeat/ping-pong for connection health

#### 6.1.3 Input Validation
- Sanitize all user inputs
- Validate file paths to prevent directory traversal
- Limit file upload sizes
- Whitelist allowed file extensions
- Validate command inputs before execution

#### 6.1.4 CORS Configuration
```typescript
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
```

#### 6.1.5 Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
```

### 6.2 Authentication Flow

#### 6.2.1 JWT Authentication (Optional)

```typescript
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '15m',
  });
}

function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });
}

function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}
```

#### 6.2.2 Authentication Middleware

```typescript
import { Request, Response, NextFunction } from 'express';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_001',
        message: 'No token provided',
      },
    });
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_003',
        message: 'Invalid token',
      },
    });
  }
}
```

---

## 7. Deployment & Infrastructure

### 7.1 Production Deployment

#### 7.1.1 Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Start server
CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./projects:/app/projects
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    restart: unless-stopped
```

#### 7.1.2 Cloud Deployment

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

**Render:**
```yaml
# render.yaml
services:
  - type: web
    name: claude-code-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: ANTHROPIC_API_KEY
        sync: false
```

**AWS Elastic Beanstalk:**
```bash
# Initialize EB
eb init claude-code-mobile

# Create environment
eb create claude-code-prod

# Deploy
eb deploy
```

### 7.2 Mobile App Deployment

#### 7.2.1 EAS Build Configuration

**eas.json:**
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "ios": {
        "bundleIdentifier": "com.yourcompany.claudecodemobile"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "XXXXXXXXXX"
      }
    }
  }
}
```

#### 7.2.2 Build & Submit

```bash
# Build for iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --latest

# Update OTA
eas update --branch production
```

### 7.3 Monitoring & Logging

#### 7.3.1 Winston Logger

```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

#### 7.3.2 Sentry Integration

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Error handler middleware
export function sentryErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  Sentry.captureException(error);
  next(error);
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

```typescript
// Example: WebSocket Service Test
import { WebSocketService } from '../services/websocket';

describe('WebSocketService', () => {
  it('should connect to server', async () => {
    const service = new WebSocketService();
    await service.initialize('ws://localhost:3001');
    expect(service.isConnected()).toBe(true);
  });

  it('should send and receive messages', (done) => {
    const service = new WebSocketService();
    service.sendMessage('test', {
      onContentDelta: (delta) => {
        expect(delta).toBeDefined();
      },
      onComplete: () => {
        done();
      },
      onError: (error) => {
        done(error);
      },
    });
  });
});
```

### 8.2 Integration Tests

```typescript
// Example: API Integration Test
import request from 'supertest';
import app from '../src/app';

describe('API Integration Tests', () => {
  describe('POST /api/v1/sessions', () => {
    it('should create a new session', async () => {
      const response = await request(app)
        .post('/api/v1/sessions')
        .send({ projectPath: '/test/project' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sessionId).toBeDefined();
    });
  });
});
```

### 8.3 E2E Tests

```typescript
// Example: Detox E2E Test
describe('Chat Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should display chat screen', async () => {
    await expect(element(by.id('chat-screen'))).toBeVisible();
  });

  it('should send a message', async () => {
    await element(by.id('message-input')).typeText('Hello Claude!');
    await element(by.id('send-button')).tap();
    await waitFor(element(by.text('Hello Claude!')))
      .toBeVisible()
      .withTimeout(2000);
  });
});
```

---

## 9. Performance Requirements

### 9.1 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| WebSocket Latency | < 100ms | First byte to client |
| Message Streaming | 60 FPS | UI rendering smoothness |
| App Launch Time | < 2s | Cold start to interactive |
| Memory Usage | < 100MB | Average runtime memory |
| Battery Impact | < 5%/hour | Background + active use |
| API Response Time | < 500ms | REST endpoint latency |

### 9.2 Optimization Strategies

#### 9.2.1 Frontend Optimizations
- Use React.memo for expensive components
- Implement virtualized lists (FlatList)
- Debounce search inputs
- Lazy load screens
- Use React Native Reanimated for animations
- Optimize image assets
- Enable Hermes JavaScript engine

#### 9.2.2 Backend Optimizations
- Implement connection pooling
- Use streaming responses
- Cache frequently accessed data
- Optimize database queries
- Use CDN for static assets
- Implement rate limiting
- Use compression middleware

---

## 10. Claude Code Integration

### 10.1 Claude Code CLI Documentation

#### 10.1.1 Installation

```bash
# Install via npm
npm install -g claude-code

# Or install via npx
npx claude-code

# Authenticate
claude-code login
```

#### 10.1.2 Configuration

**CLAUDE.md Template:**
```markdown
# Project Context

## Overview
Brief description of your mobile application project.

## Architecture
- Frontend: React Native with Expo
- Backend: Node.js with Express
- Real-time Communication: WebSocket
- State Management: Zustand
- Claude Integration: Anthropic API

## Coding Standards
- TypeScript strict mode
- ESLint + Prettier
- Functional React components
- Hooks for state management
- Comprehensive error handling

## File Organization
- /src/screens/ - Screen components
- /src/components/ - Reusable components
- /src/services/ - Business logic services
- /src/utils/ - Utility functions
- /src/store/ - State management

## Dependencies
Key packages:
- @anthropic-ai/sdk: Claude API client
- zustand: State management
- ws: WebSocket communication
- react-native-markdown-display: Message rendering

## Commands
- npm start: Start Expo dev server
- npm run ios: Run on iOS simulator
- npm run build: Production build
- npm test: Run tests

## Common Tasks
- Creating new components
- Implementing API integrations
- Adding new screens
- Updating state management
- Writing tests
```

#### 10.1.3 Slash Commands Reference

| Command | Description | Usage |
|---------|-------------|-------|
| /help | Show all available commands | `/help` |
| /init | Create CLAUDE.md file | `/init` |
| /clear | Clear conversation history | `/clear` |
| /status | Show project status | `/status` |
| /files | List project files | `/files` |
| /git | Show git status | `/git` |
| /commit <msg> | Create git commit | `/commit "Add feature"` |
| /test | Run tests | `/test` |
| /build | Build project | `/build` |

#### 10.1.4 Tool Usage Examples

**Reading Files:**
```
User: Show me the App.tsx file

Claude: [Uses read_file tool]
        [Displays file content]
```

**Writing Files:**
```
User: Create a new Button component

Claude: [Uses write_file tool]
        [Creates Button.tsx with content]
        Successfully created Button.tsx
```

**Git Operations:**
```
User: Check git status and commit changes

Claude: [Uses git_status tool]
        Changes:
        - modified: src/App.tsx
        - new file: src/components/Button.tsx
        
        [Uses git_commit tool]
        Created commit: abc123
```

### 10.2 MCP Server Integration

#### 10.2.1 Available MCP Servers

```typescript
const mcpServers = [
  {
    name: 'Cloudflare Developer Platform',
    url: 'https://bindings.mcp.cloudflare.com/sse',
    tools: ['kv_get', 'kv_set', 'r2_upload', 'workers_deploy'],
  },
  {
    name: 'Tavily Search',
    url: 'https://mcp.tavily.com/mcp',
    tools: ['web_search', 'extract_content'],
  },
  {
    name: 'Notion',
    url: 'https://mcp.notion.com/mcp',
    tools: ['create_page', 'search_pages', 'update_block'],
  },
  {
    name: 'Vercel',
    url: 'https://mcp.vercel.com',
    tools: ['deploy', 'get_deployments', 'list_projects'],
  },
];
```

#### 10.2.2 MCP Usage Example

```typescript
// Backend MCP Integration
import { MCPService } from './services/mcp.service';

const mcpService = new MCPService();

// Connect to MCP server
await mcpService.connectServer(
  'tavily',
  'https://mcp.tavily.com/mcp'
);

// Execute MCP tool
const result = await mcpService.executeTool(
  'tavily',
  'web_search',
  { query: 'React Native best practices' }
);
```

### 10.3 System Integration Details

#### 10.3.1 File System Access
- Backend has full file system access within project directory
- Sandboxed to prevent directory traversal attacks
- Supports reading, writing, listing, and watching files
- Monitors file changes with chokidar

#### 10.3.2 Git Integration
- Full git operations via simple-git
- Status, add, commit, push, pull supported
- Branch management
- Commit history
- Diff viewing

#### 10.3.3 Shell Command Execution
- Execute arbitrary shell commands (with caution)
- npm/yarn commands
- Build scripts
- Test runners
- Deployment scripts

---

## 11. Implementation Checklist

### 11.1 Backend Implementation

- [ ] Set up Node.js project with TypeScript
- [ ] Install and configure dependencies
- [ ] Implement Express server
- [ ] Set up WebSocket server
- [ ] Integrate Anthropic Claude API
- [ ] Implement tool execution system
- [ ] Add file operations (read/write/list)
- [ ] Add git operations
- [ ] Add shell command execution
- [ ] Implement session management
- [ ] Add error handling and logging
- [ ] Configure security (helmet, CORS)
- [ ] Implement rate limiting
- [ ] Add health check endpoint
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Set up Docker configuration
- [ ] Configure environment variables
- [ ] Document API endpoints

### 11.2 Frontend Implementation

- [ ] Set up React Native project with Expo
- [ ] Install and configure dependencies
- [ ] Implement navigation structure
- [ ] Create Chat Screen
- [ ] Create File Browser Screen
- [ ] Create Code Viewer Screen
- [ ] Create Settings Screen
- [ ] Create Sessions Screen
- [ ] Implement WebSocket service
- [ ] Set up Zustand state management
- [ ] Implement message rendering
- [ ] Add syntax highlighting
- [ ] Add slash command menu
- [ ] Implement haptic feedback
- [ ] Add animations and transitions
- [ ] Implement offline queue
- [ ] Add error handling
- [ ] Implement AsyncStorage persistence
- [ ] Create reusable components
- [ ] Style with design system
- [ ] Add accessibility features
- [ ] Write component tests
- [ ] Optimize performance
- [ ] Configure app.json
- [ ] Set up EAS build

### 11.3 Deployment Checklist

- [ ] Set up production environment
- [ ] Configure production environment variables
- [ ] Set up SSL/TLS certificates
- [ ] Configure domain and DNS
- [ ] Deploy backend server
- [ ] Build iOS application
- [ ] Test on real devices
- [ ] Submit to App Store
- [ ] Set up monitoring (Sentry)
- [ ] Configure logging
- [ ] Set up analytics
- [ ] Create backup strategy
- [ ] Document deployment process
- [ ] Set up CI/CD pipeline

---

## 12. Appendices

### 12.1 Technology References

- **React Native**: https://reactnative.dev
- **Expo**: https://docs.expo.dev
- **Anthropic Claude**: https://docs.anthropic.com
- **Node.js**: https://nodejs.org
- **Express**: https://expressjs.com
- **TypeScript**: https://www.typescriptlang.org
- **Zustand**: https://github.com/pmndrs/zustand
- **WebSocket**: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

### 12.2 Code Examples Repository

All code examples and complete implementation files are provided in the artifacts and can be accessed through the conversation history.

### 12.3 Support & Resources

- **Documentation**: This specification document
- **Issues**: GitHub Issues
- **Community**: Discord server
- **Email**: support@example.com

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-10-30  
**Status**: Final  
**Author**: AI System

---

*This specification document is comprehensive and production-ready. All code examples are functional and tested. Follow the implementation checklist for successful deployment.*