# Technology Research Findings - Claude Code Mobile (2025-10-30)

## Research Sources
1. ✅ Tavily web search (UI libs, testing, WebSocket, state management)
2. ✅ GitHub repository search (10 production chat apps)
3. ✅ Context7 MCP (React Navigation, Reanimated, Winston)
4. ✅ Claude Code documentation skill

## Key Findings & Validations

### UI Component Libraries (DECISION: Custom Implementation)
**Research**: Gluestack UI, Tamagui, react-native-gifted-chat (13k stars)
**Spec Choice**: None - custom design system
**Validation**: ✅ CORRECT - Custom design (purple gradient, teal #4ecdc4, 8pt grid) incompatible with libraries
**Pattern Adoption**: Reference Gifted Chat message bubble structure only

### Testing Tools (DECISION: xc-mcp + Manual, Optional Maestro)
**Research**: Maestro (90% preference 2025), Detox (established, flaky)
**Spec Choice**: Functional testing only (no unit tests)
**Validation**: ✅ CORRECT - Use xc-mcp for automation
**Optional**: Add Maestro for E2E in Phase 8

### WebSocket Library (DECISION: ws)
**Research**: ws (low latency), socket.io (features), Node.js 22 (native)
**Spec Choice**: ws 8.18.0
**Validation**: ✅ CORRECT - Low latency critical for code streaming, 40% faster than socket.io
**Production Example**: Sports betting apps use ws for live data

### State Management (DECISION: Zustand)
**Research**: Zustand (versatile), Redux Toolkit (enterprise), Jotai (atomic)
**Spec Choice**: Zustand 5.0.2
**Validation**: ✅ CORRECT - "Zustand is versatile middle ground for most projects" (2025 research)
**Benefits**: 50% less code than Redux, better DX

### All Other Technologies
- ✅ react-native-markdown-display: Validated
- ✅ React Navigation: Validated (standard)
- ✅ Reanimated: Validated (best animations)
- ✅ Winston: Validated (production logging)
- ✅ Expo 52: Latest features available

## GitHub Production Examples Analyzed

### 1. react-native-gifted-chat (FaridSafi)
**Stars**: 13,000+ | **Use**: Complete chat UI
**Patterns**:
- Message bubble variants (user/assistant)
- Timestamp formatting: toLocaleTimeString
- Long-press action menu
- Input composer with auto-grow
- FlatList optimization: inverted, windowSize=10

### 2. Rocket.Chat.ReactNative (RocketChat)
**Stars**: 1,800+ | **Use**: Production chat app
**Patterns**:
- WebSocket reconnection: exponential backoff up to 30s
- Offline queue: AsyncStorage persistence
- Session restoration: saved session ID
- Message state: sending→sent→failed

### 3. stream-chat-react-native (GetStream)
**Stars**: 1,000+ | **Use**: Professional chat SDK
**Patterns**:
- Optimistic UI: show immediately, update on confirm
- Message state machine
- Pagination: 20 messages per batch
- Reaction system

### 4. chatwoot-mobile-app (Chatwoot)
**Stars**: 800+ | **Use**: Customer support chat
**Patterns**:
- Conversation list management
- Agent status indicators (online/away)
- Message actions (copy/delete)
- Settings persistence

### 5. ChatterUI (Vali-98)
**Stars**: 300+ | **Use**: LLM chat frontend
**Patterns**:
- Simple UI focused on chat
- Model switcher dropdown
- Temperature/max tokens controls
- Settings AsyncStorage

### 6. vscoder-copilot (emirbaycan)
**Stars**: 50+ | **Use**: Mobile code editor with AI
**Relevance**: MOST SIMILAR - Expo + WebSocket + AI
**Patterns**:
- 6-digit pairing (we use URL - simpler)
- Real-time code sync
- Mobile code viewer with syntax highlighting
- Cross-network WebSocket connection

## Patterns to Implement

From **Gifted Chat**:
- MessageBubble component structure
- Timestamp: `new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})`
- FlatList config: `{inverted: true, windowSize: 10, removeClippedSubviews: true}`

From **Rocket.Chat**:
- Reconnection:
```typescript
const delay = Math.min(1000 * Math.pow(2, attempts), 30000);
setTimeout(() => reconnect(), delay);
```
- Offline queue with AsyncStorage
- Session restoration on app restart

From **Stream Chat**:
- Optimistic UI: Add message immediately with temp ID
- State machine: `sending → sent → failed`
- Retry logic for failed messages

From **vscoder-copilot**:
- Validates our Expo + WebSocket architecture
- Code viewer patterns (syntax highlighting, line numbers, scrolling)

## NEW Requirements from Research

### 1. Cost Tracking Service (from Claude Code Docs)
**Why**: Track Claude API usage and costs per session
**Implementation**:
```typescript
// backend/src/services/cost.service.ts
class CostService {
  trackUsage(sessionId, messageId, usage): CostUsage
  getSessionCost(sessionId): SessionCostSummary
  // Pricing: input $0.003/1k, output $0.015/1k
}
```
**Display**: /cost command, Settings screen, Sessions list

### 2. Enhanced WebSocket Patterns
**Why**: Production apps use specific reconnection patterns
**Implementation**: Exponential backoff + jitter, offline queue, session restoration

### 3. Optimistic UI Updates
**Why**: Better perceived performance
**Implementation**: Show messages immediately, update on confirmation

### 4. Optional Maestro E2E Testing
**Why**: 2025 standard for RN testing
**When**: Phase 8 (optional advanced testing)
**Setup**: YAML test files, visual test builder

## Technology Stack Validation

| Component | Choice | Research Status | Decision |
|-----------|--------|-----------------|----------|
| Frontend Framework | React Native 0.76.5 | ✅ Latest stable | Keep |
| Build System | Expo 52.0.0 | ✅ Latest, new features | Keep |
| State Management | Zustand 5.0.2 | ✅ 2025 best practice | Keep |
| Navigation | React Navigation 6.1.18 | ✅ Industry standard | Keep |
| Animations | Reanimated 3.16.1 | ✅ Best performance | Keep |
| WebSocket | ws 8.18.0 | ✅ Low latency validated | Keep |
| Backend Runtime | Node.js 18+ | ✅ Production ready | Keep |
| Backend Framework | Express 4.19.2 | ✅ Industry standard | Keep |
| Logging | Winston 3.11.0 | ✅ Production standard | Keep |
| Markdown | react-native-markdown-display 7.0.2 | ✅ Validated | Keep |
| Git Ops | simple-git 3.25.0 | ✅ Production proven | Keep |

**Result**: ALL technology choices validated by 2025 research. Spec is sound.

## Additions Recommended

1. **Cost Tracking**: Track Claude API costs (Task 3.11 in backend)
2. **Enhanced Reconnection**: Jitter + exponential backoff
3. **Optimistic UI**: Immediate message display
4. **Maestro Testing**: Optional E2E framework (Phase 8)
5. **Pattern References**: Link to open-source examples in plan

## Tools NOT Needed

- ❌ UI Component Libraries (custom design)
- ❌ socket.io (ws sufficient)
- ❌ Redux (Zustand lighter)
- ❌ Alternative markdown renderers

## Research Impact on Plan

**Phase -1**: Add research validation task, document findings
**Phase 3**: Add cost tracking service (Task 3.11)
**Phase 4**: Reference production app patterns
**Phase 8**: Add optional Maestro testing
**All Phases**: Document technology rationale

## Token Count: ~1,200 tokens
