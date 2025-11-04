# v3 Screen Specifications - UX Design

**Created**: 2025-11-04
**Based On**: ui-ux-designer skill principles + 30 sequential thoughts
**Purpose**: Detailed screen designs with user-centric validation

---

## User Persona

**Name**: Alex (Mobile Developer)
**Age**: 28-35
**Role**: Full-stack developer
**Goals**:
- Work on 5-10 coding projects simultaneously
- Use Claude Code CLI on desktop for deep work
- Review code and continue conversations on mobile during commute
- Quick project status checks when away from desk

**Pain Points**:
- Can't access desktop conversations on mobile
- Loses context when switching between projects
- Needs to remember which session was about what
- Wants to continue work seamlessly across devices

**Technical Context**:
- Has Claude Code CLI installed
- Projects stored locally (/Users/nick/Desktop/...)
- Each project has .git, package.json, possibly CLAUDE.md
- Uses multiple chat sessions per project (different topics)

---

## User Journey Map

### Journey 1: Morning Commute Review

**Context**: Alex is on train, wants to review yesterday's authentication work

1. **Launch App** (Projects Screen)
   - Emotional state: Focused, slightly rushed
   - Goal: Get back into "nerve" project quickly
   - Success: Projects load fast, nerve is visible

2. **Select Project** (Tap nerve card)
   - Emotional state: Anticipating session list
   - Goal: Find "Auth Implementation" session
   - Success: Sessions screen shows filtered list

3. **Open Session** (Tap Auth session)
   - Emotional state: Ready to read
   - Goal: Review previous 12 messages
   - Success: Chat loads with full history

4. **Review Conversation** (Scroll through messages)
   - Emotional state: Understanding, analyzing
   - Goal: Remember where we left off
   - Success: Can see all previous context

5. **Ask Follow-up** (Type new message)
   - Emotional state: Engaged, problem-solving
   - Goal: Continue the auth conversation
   - Success: Response uses nerve project context

**User Satisfaction**: ⭐⭐⭐⭐⭐ (if all works)
**Time to Value**: <30 seconds

---

## Screen 1: Projects (Default Landing)

### Visual Hierarchy

```
┌─────────────────────────────────────┐
│                                     │ ← Status bar (iOS)
│  Your Projects                  ⚙️  │ ← Header (60px)
│─────────────────────────────────────│
│                                     │
│  [Search projects...]          🔍  │ ← Search bar (44px touch target)
│                                     │
│─────────────────────────────────────│
│                                     │
│  ┌─────────────────────────────┐   │ ← Project card (110px)
│  │ 📁 nerve               [⭐] │   │   Tappable
│  │ /Users/nick/nerve           │   │
│  │ ─────────────────────────── │   │
│  │ 🏷️ GIT│CLAUDE│TS  💬 5 sess│   │ ← Metadata (32px)
│  │ 2h ago                       │   │ ← Activity (20px)
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │ ← Project card
│  │ 📁 swift-coreml-diffusers   │   │
│  │ /Users/nick/Desktop/swift...│   │
│  │ ─────────────────────────── │   │
│  │ 🏷️ GIT│PY        💬 2 sess  │   │
│  │ 5h ago                       │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Pull to refresh]                  │ ← Pull-to-refresh area
│                                     │
│  [Scan for Projects]                │ ← CTA button (48px)
│                                     │
│─────────────────────────────────────│
│  💬 🗂️  ⚡ 🤖  ⚙️                │ ← Tab bar (64px)
└─────────────────────────────────────┘
```

### Design Specifications

**Card Design**:
- Background: `bg-card` (#1a1a1a)
- Border: `border-border` (1px, #2a2a2a)
- Radius: `rounded-lg` (8px)
- Padding: `p-base` (16px)
- Margin: `mx-base my-sm` (16px horizontal, 8px vertical)
- Shadow: Subtle lift on card

**Touch Targets**:
- Entire card: Minimum 88px height ✅
- Star icon: 44x44px ✅
- All interactive elements meet 44x44px minimum ✅

**Typography**:
- Project name: `text-lg font-semibold text-foreground` (18px)
- Project path: `text-sm text-muted-foreground` (14px, gray)
- Metadata badges: `text-xs font-semibold` (12px)
- Activity: `text-xs text-muted-foreground` (12px)

**Color Palette** (Flat Black Theme):
- Background: #0a0a0a
- Card: #1a1a1a
- Border: #2a2a2a
- Primary (teal): #4ecdc4
- Foreground: #ffffff
- Muted: #6b7280

**Accessibility**:
- Color contrast: 13:1 (white on black) ✅
- Touch targets: 44px minimum ✅
- Screen reader: Each card announces "nerve project, has git, has CLAUDE.md, 5 sessions, last active 2 hours ago"
- Keyboard: Tab through cards, Enter to select

### Interaction States

**Idle**:
- Card: bg-card, border-border
- No shadow

**Hover** (iPad with cursor):
- Card: bg-card brightness increased 10%
- Border: border-primary
- Subtle shadow increases

**Pressed** (Tap):
- Card: bg-card brightness decreased 5%
- Quick scale animation (0.98)
- Haptic feedback (if enabled)

**Loading**:
- Skeleton cards with pulse animation
- Loading indicator at top

**Empty**:
- Large icon: 📂 (64px)
- Message: "No projects found"
- CTA: "Scan for Projects" button (primary color)

### User Actions & Expected Behavior

| Action | Result | Animation | Haptic |
|--------|--------|-----------|--------|
| Tap card | Navigate to project's Sessions | Push transition (300ms) | Light impact |
| Long press | Context menu (Star, Set default, Delete) | Menu fade in (200ms) | Medium impact |
| Tap star | Toggle favorite, move to top | Star fill animation | Light impact |
| Pull down | Refresh projects list | Spinner appears | None |
| Swipe left on card | Quick actions (Git, Files, Delete) | Slide in (250ms) | None |
| Tap Scan | Re-scan for projects | Button disabled, spinner | None |
| Tap Search | Focus search bar, keyboard appears | None | None |

### Empty State Design

```
┌─────────────────────────────────────┐
│                                     │
│         🔍                          │ ← Large icon (80px)
│                                     │
│    No Projects Found                │ ← text-xl font-semibold
│                                     │
│  Scan your computer to discover     │ ← text-base text-muted
│  coding projects automatically.     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  🔄  Scan for Projects       │   │ ← Primary button (48px)
│  └─────────────────────────────┘   │
│                                     │
│  Projects with .git or CLAUDE.md    │ ← Helpful hint
│  will appear here.                  │
└─────────────────────────────────────┘
```

---

## Screen 2: Sessions (Project-Filtered)

### Visual Hierarchy

```
┌─────────────────────────────────────┐
│  ← 📁 nerve              [+] [⋮]   │ ← Header with back, new, menu
│─────────────────────────────────────│
│                                     │
│  ┌─────────────────────────────┐   │ ← Session card (100px)
│  │ 💬 Auth Implementation       │   │
│  │ 12 messages • 2h ago         │   │
│  │ ─────────────────────────── │   │
│  │ "Let me help you set up..."  │   │ ← Last message preview
│  │ ✏️ Write  📖 Read  ⚡ Bash   │   │ ← Tools used
│  │                          [🗑]│   │ ← Delete button
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │ ← Session card
│  │ 💬 Database Migration        │   │
│  │ 8 messages • 5h ago          │   │
│  │ ─────────────────────────── │   │
│  │ "The migration file needs..." │   │
│  │ ✏️ Write  📖 Read  🔧 Git    │   │
│  │                          [🗑]│   │
│  └─────────────────────────────┘   │
│                                     │
│  [Pull to refresh]                  │
│                                     │
└─────────────────────────────────────┘
```

### Design Specifications

**Header**:
- Height: 60px
- Back button: 44x44px touch target
- Project name: text-lg font-semibold with folder icon
- New (+): 44x44px, creates new session
- More (⋮): 44x44px, shows bulk actions menu

**Session Card**:
- Background: bg-card
- Border: 1px border-border
- Radius: 8px rounded-lg
- Padding: 16px
- Minimum height: 100px
- Swipeable: Swipe left reveals Delete

**Session Title**:
- Text: text-base font-semibold text-foreground (16px)
- Icon: 💬 emoji (or message icon)
- Truncates if too long with ellipsis

**Session Metadata**:
- Message count + time: text-sm text-muted-foreground
- Format: "12 messages • 2h ago"
- Updates in real-time

**Last Message Preview**:
- Text: text-sm text-muted-foreground/80 (slightly faded)
- Italic style
- 1-2 lines max with ellipsis
- Gives context of conversation topic

**Tools Used**:
- Small badges: 6px height
- Icons + tool names
- bg-muted text-muted-foreground
- Rounded badges

**Accessibility**:
- Each card announces: "Auth Implementation session, 12 messages, last active 2 hours ago, last message: Let me help you set up..."
- Delete button: "Delete Auth Implementation session"
- Swipe actions: Screen reader friendly

### Empty State

```
┌─────────────────────────────────────┐
│  ← 📁 nerve                  [+]   │
│─────────────────────────────────────│
│                                     │
│         💬                          │
│                                     │
│    No Sessions Yet                  │
│                                     │
│  Start working on this project by   │
│  creating your first chat session.  │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  + Create First Session      │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Screen 3: Chat (Project + Session Context)

### Visual Hierarchy

```
┌─────────────────────────────────────┐
│  [≡]  📁 nerve > Auth          ⚙️  │ ← Contextual header (60px)
│      ✅ Connected • Haiku           │ ← Status bar (30px)
│─────────────────────────────────────│
│                                     │ ← Message area (scrollable)
│  [Earlier messages...]              │   Fills available space
│                                     │
│  ┌─────────────────────────────┐   │ ← User message (right)
│  │ How do I add JWT tokens?    │   │   bg-primary (teal)
│  │                      2:05 PM │   │   Max width 85%
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │ ← Assistant message (left)
│  │ I'll help you add JWT to    │   │   bg-card (dark gray)
│  │ nerve. Let me check your    │   │   Max width 85%
│  │ current auth setup...        │   │
│  │                              │   │
│  │ ┌───────────────────────┐   │   │ ← Tool card (nested)
│  │ │ ✏️ Read                │   │   │   bg-black/30
│  │ │ @src/auth/index.ts    │   │   │   border-l-4 primary
│  │ │ Success ✓             │   │   │
│  │ └───────────────────────┘   │   │
│  │                              │   │
│  │ Based on your code, here's  │   │
│  │ how to add JWT...            │   │
│  │ 2:05 PM                      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │ ← Streaming message
│  │ Let me implement this...    │   │
│  │ ● ● ●                        │   │ ← Streaming indicator
│  └─────────────────────────────┘   │
│                                     │
│─────────────────────────────────────│
│  Working on nerve/src/auth...       │ ← Context hint (20px)
│  ┌───────────────────────────┐ [▲]│ ← Input area (80px min)
│  │ Message about nerve...     │    │   Auto-expanding
│  └───────────────────────────┘    │   Max 120px
│  / commands • @ files              │ ← Helper text
│─────────────────────────────────────│
│  💬 Projects ⚡ 🤖  ⚙️            │ ← Tab bar (64px)
└─────────────────────────────────────┘
```

### Header Design (Context Critical!)

**Left Section** (Menu + Project):
```
[≡ Menu]  📁 nerve > Auth
```
- Menu (≡): 44x44px, opens project switcher
- Project: Tappable, shows project picker overlay
- Session: Tappable, shows session picker for current project
- Breadcrumb style with ">" separator

**Right Section** (Settings):
- Settings gear: 44x44px
- Navigates to Settings tab

**Status Bar** (Second row):
```
✅ Connected • Haiku • nerve/src/auth
```
- Connection: Green dot + text
- Model: Current Claude model
- Context: Current working directory (if relevant)
- All text-xs text-muted-foreground

### Message Design Principles

**User Messages** (Right-aligned):
- Background: bg-primary (#4ecdc4 teal)
- Text: text-background (black for contrast)
- Border radius: rounded-3xl (24px) - chat bubble feel
- Max width: 85% of screen
- Padding: p-base (16px)
- Margin bottom: mb-base (16px)
- Shadow: Subtle elevation

**Assistant Messages** (Left-aligned):
- Background: bg-card (#1a1a1a)
- Text: text-foreground (white)
- Border: border border-border
- Border radius: rounded-3xl (24px)
- Max width: 85%
- Padding: p-base (16px)
- Margin bottom: mb-base (16px)

**Thinking Blocks** (Nested in assistant message):
- Background: bg-muted/50 (semi-transparent)
- Border-left: 4px border-l-primary
- Padding: p-sm (8px)
- Margin: my-xs (4px vertical)
- Collapsible: Tap to expand/collapse
- Icon: 🧠 thinking icon

**Tool Execution Cards** (Nested in assistant message):
- Background: bg-black/30 (transparent overlay)
- Border-left: 4px border-l-primary
- Radius: rounded-lg (8px)
- Padding: p-md (12px)
- Margin: my-xs (4px vertical)

**Tool Structure**:
```
┌──────────────────────────┐
│ ✏️ Write                 │ ← Tool name + icon
│ @src/auth/jwt.ts        │ ← File path (monospace font)
│ ────────────────────────│
│ Creating new file...     │ ← Status text
│ Success ✓ (124 lines)   │ ← Result
└──────────────────────────┘
```

**Streaming Indicator**:
- 3 dots: ● ● ●
- Color: text-primary
- Animation: Pulse/bounce
- Position: After last chunk
- Disappears on [DONE]

### Input Area Design

**Context Hint** (Above input):
```
Working on nerve/src/auth...
```
- Shows current working directory
- Updates based on tool executions
- text-xs text-muted-foreground
- Helps user know the context

**Input Field**:
- Background: bg-input (#1a1a1a)
- Border: border border-border
- Radius: rounded-3xl (pill shape)
- Padding: px-base py-sm (16px horizontal, 8px vertical)
- Min height: 40px
- Max height: 120px (auto-expanding)
- Font: text-base (16px) - prevents zoom on iOS

**Send Button**:
- Size: 36x36px (slightly smaller than 44px, but in combo with input = 44px)
- Icon: ▲ triangle
- Background: bg-primary when enabled, bg-muted when disabled
- Shape: rounded-full (circle)
- Position: Absolute right, vertically centered

**Helper Text**:
- "/ for commands • @ for files"
- text-xs text-muted-foreground/60
- Below input field
- Educates user about features

### Accessibility Features

**Screen Reader Announcements**:
- New message: "New message from Assistant: [first 50 chars]..."
- Tool execution: "Tool Write executed on file jwt.ts"
- Streaming: "Assistant is typing..."
- Message sent: "Message sent"

**Keyboard Shortcuts** (if iPad with keyboard):
- Cmd+Enter: Send message
- Cmd+K: Project switcher
- Cmd+L: Session switcher
- Cmd+/: Command palette

**VoiceOver Navigation**:
- Focus order: Header → Messages (top to bottom) → Input → Send
- Message containers: "Message from You/Assistant, [content]"
- Timestamps: "Sent at 2:05 PM"
- Tools: "Tool execution: Write file, Status: Success"

---

## Screen 4: Files (Project-Scoped Browser)

### Visual Hierarchy

```
┌─────────────────────────────────────┐
│  ← 📁 nerve/src/auth        [🏠]   │ ← Breadcrumb nav (60px)
│─────────────────────────────────────│
│  [Search in auth...]           🔍  │ ← Search (44px)
│─────────────────────────────────────│
│                                     │
│  📂 middleware              →       │ ← Folder (60px height)
│     3 files                         │   Right chevron
│                                     │
│  📂 providers               →       │ ← Folder
│     2 files                         │
│                                     │
│  📄 index.ts               →       │ ← File (60px height)
│     2.3 KB • TypeScript             │   Size + type
│                                     │
│  📄 jwt.ts                 →       │ ← File
│     5.1 KB • TypeScript             │
│                                     │
│  📄 permissions.ts         →       │ ← File
│     1.8 KB • TypeScript             │
│                                     │
│  [Pull to refresh]                  │
│                                     │
└─────────────────────────────────────┘
```

### Design Specifications

**Breadcrumb Navigation**:
```
📁 nerve > src > auth        [🏠 Root]
```
- Each segment tappable (jump to that level)
- Separator: " > "
- Home button: Returns to project root
- Truncates if too long: "...rc > auth"

**File/Folder Rows**:
- Height: 60px minimum (44px + 16px padding)
- Entire row tappable
- Clear tap area (no gaps)

**Folder Design**:
- Icon: 📂 folder emoji (or icon)
- Name: text-base font-medium text-foreground
- File count: text-sm text-muted-foreground
- Chevron: → (indicates navigation)

**File Design**:
- Icon: 📄 file emoji (or type-specific: 📜 for .ts, 📗 for .md)
- Name: text-base font-medium text-foreground
- Size + Type: text-sm text-muted-foreground
- Chevron: → (indicates will open)

**Tap Behaviors**:
- Tap folder → Navigate into folder
- Tap file → Open in CodeViewer
- Long press folder → Context menu (Copy path, Git status)
- Long press file → Context menu (Copy path, Reference in chat, Share)

**Search**:
- Filters current directory
- Fuzzy matching on file names
- Highlights matches
- Shows match count: "3 of 12 files"

---

## Screen 5: Git (Project-Scoped Operations)

### Visual Hierarchy

```
┌─────────────────────────────────────┐
│  ← 📁 nerve - Git           [🔄]   │ ← Header with refresh
│─────────────────────────────────────│
│                                     │
│  Branch: main ✓                     │ ← Current branch (pill badge)
│  ────────────────────────────────────│
│                                     │
│  📝 Staged (2)                      │ ← Section header
│  ┌─────────────────────────────┐   │
│  │ ✅ src/auth/jwt.ts          │   │ ← Staged file
│  │ ✅ src/auth/index.ts        │   │
│  └─────────────────────────────┘   │
│                                     │
│  ⚠️  Modified (3)                   │ ← Section header
│  ┌─────────────────────────────┐   │
│  │ M  src/middleware/auth.ts   │   │ ← Modified file
│  │ M  tests/auth.test.ts       │   │   Tap to see diff
│  │ M  package.json             │   │
│  └─────────────────────────────┘   │
│                                     │
│  ❓ Untracked (1)                   │ ← Section header
│  ┌─────────────────────────────┐   │
│  │ ?? src/auth/session.ts      │   │ ← Untracked
│  └─────────────────────────────┘   │
│                                     │
│─────────────────────────────────────│
│  [Commit Message]                   │ ← Input (100px)
│  ┌─────────────────────────────┐   │   Multi-line
│  │ Add JWT authentication      │   │
│  │ system with refresh tokens   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      Create Commit           │   │ ← Primary button
│  └─────────────────────────────┘   │   Disabled if no staged
│                                     │
│  Recent Commits                     │ ← Collapsible section
│  abc123 Fix login (2h ago)          │
│─────────────────────────────────────│
└─────────────────────────────────────┘
```

### Design Specifications

**File Status Indicators**:
- ✅ Staged: Green checkmark, text-success
- M Modified: Yellow "M", text-warning
- ?? Untracked: Gray "??", text-muted
- D Deleted: Red "D", text-destructive

**Section Headers**:
- Text: text-sm font-semibold text-foreground
- Icon: Emoji or icon for status type
- Count: "(2)" in text-muted-foreground
- Collapsible: Tap to hide/show section

**Commit Button States**:
- Enabled: bg-primary, text-white, "Create Commit"
- Disabled: bg-muted, text-muted-foreground, "No changes staged"
- Loading: Spinner, "Creating commit..."
- Success: Checkmark animation, brief success state

**Validation**:
- Commit message required (min 10 chars)
- At least 1 file must be staged
- Button disabled until both criteria met
- Real-time validation feedback

---

## User-Workflow Validation Gates (Revised)

### GATE 1: Project Discovery & Selection
**Validates**: First-time user can find and select a project

**User Flow**:
1. Launch app → Projects screen
2. See "No projects found"
3. Tap "Scan for Projects"
4. Loading indicator appears
5. 6 projects appear
6. Tap "nerve" project card
7. Navigate to nerve's Sessions screen

**IDB Validation**:
```bash
# Screenshot initial state
screenshot → Verify empty state

# Tap Scan
idb ui tap --udid booted 196 400
sleep 3
screenshot → Verify 6 project cards

# Tap nerve
idb ui tap --udid booted X Y
sleep 2
screenshot → Verify "nerve - Sessions" header

# Verify backend
grep "POST /v1/host/discover" logs/backend.log
# Should show 200 OK, 6 projects returned
```

**Pass Criteria**:
- ✅ Empty state shows helpful CTA
- ✅ Scan button triggers API call
- ✅ 6 projects load and display
- ✅ Tap navigates to Sessions
- ✅ Sessions header shows project name
- ✅ Back button returns to Projects

---

### GATE 2: Session Creation & First Message
**Validates**: User can start a conversation in a project

**User Flow**:
1. On nerve Sessions screen (empty)
2. See "No sessions yet" empty state
3. Tap "Create First Session"
4. Navigate to Chat tab
5. Chat header shows "📁 nerve > New Session"
6. Input field shows "Message about nerve..."
7. Type: "Help me implement JWT authentication"
8. Tap send
9. Message appears in teal bubble
10. Response streams in with project context

**IDB Validation**:
```bash
# Verify empty state
screenshot → "No sessions yet"

# Tap Create
idb ui tap --udid booted X Y
sleep 2
screenshot → Verify Chat screen, nerve in header

# Type and send
idb ui tap --udid booted 181 725
idb ui text --udid booted "Help me implement JWT authentication for this project"
idb ui tap --udid booted 370 729

# Capture streaming
sleep 1; screenshot → User message visible
sleep 3; screenshot → Streaming indicator
sleep 6; screenshot → Full response

# Verify context
grep "project.*nerve\|project_id" logs/backend.log
curl http://localhost:8001/v1/sessions | jq '.data[-1]'
# Should show project_id matches nerve
```

**Pass Criteria**:
- ✅ Empty state clear and actionable
- ✅ Create button navigates to Chat
- ✅ Header shows project context
- ✅ Message sends successfully
- ✅ Backend receives project_id
- ✅ Session saves with project association
- ✅ Response references project (mentions "nerve")

---

### GATE 3: Multi-Message Conversation
**Validates**: Conversation continues with full history

**User Flow**:
1. In nerve > Auth session with 1 message
2. Send message 2: "What about refresh tokens?"
3. Response streams
4. Send message 3: "Show me the code"
5. Response streams with code block
6. Scroll up to see message 1
7. All 3 exchanges visible
8. Send message 4
9. Session now has 4 user + 4 assistant messages

**IDB Validation**:
```bash
# Send message 2
idb ui tap 181 725
idb ui text "What about refresh tokens?"
idb ui tap 370 729
sleep 6; screenshot

# Send message 3
idb ui tap 181 725
idb ui text "Show me the implementation code"
idb ui tap 370 729
sleep 8; screenshot

# Scroll to top
idb ui swipe 200 300 200 600
sleep 1; screenshot → Verify message 1 still visible

# Scroll to bottom
idb ui swipe 200 600 200 300
sleep 1; screenshot → Verify all messages visible

# Check backend
curl http://localhost:8001/v1/sessions/${SESSION_ID}/messages | jq 'length'
# Should return 8 (4 user + 4 assistant)
```

**Pass Criteria**:
- ✅ Each message appears in order
- ✅ Streaming works for all responses
- ✅ Scroll maintains position
- ✅ History fully preserved
- ✅ No messages lost
- ✅ Backend stores all messages

---

### GATE 4: Project Switching with Context
**Validates**: User can work on multiple projects

**User Flow**:
1. In nerve > Auth session (4 messages)
2. Tap "📁 nerve" in header
3. Project picker overlay appears
4. Shows all 6 projects
5. Tap "swift-coreml-diffusers"
6. Confirmation: "Switch to swift-coreml? nerve session will be saved."
7. Confirm
8. Navigate to swift-coreml Sessions
9. Create new session
10. Chat now in swift-coreml context
11. Send message about CoreML
12. Response uses swift-coreml context
13. Switch back to nerve
14. Auth session intact with 4 messages

**IDB Validation**:
```bash
# In nerve context
screenshot → Verify "nerve" in header

# Tap project name
idb ui tap X Y
sleep 1; screenshot → Verify project picker

# Select swift-coreml
idb ui tap X Y

# Confirm switch
idb ui tap X Y  # Confirm button
sleep 2; screenshot → Verify "swift-coreml" in header

# Send test message
idb ui tap 181 725
idb ui text "Help with CoreML model optimization"
idb ui tap 370 729
sleep 6; screenshot

# Verify context switch
grep "project.*swift-coreml" logs/backend.log

# Switch back to nerve
# Verify original session intact
screenshot → Verify 4 original messages still there
```

**Pass Criteria**:
- ✅ Project picker shows all projects
- ✅ Confirmation prevents accidental switches
- ✅ Context switches completely
- ✅ Sessions don't mix
- ✅ Backend tracks separate projects
- ✅ Original session preserved

---

### GATE 5: Tool Execution in Project Directory
**Validates**: Claude creates files in correct project

**User Flow**:
1. In nerve project, Auth session
2. Send: "Create src/auth/permissions.ts with role-based access"
3. Claude responds with plan
4. Tool executes: Write @src/auth/permissions.ts
5. Tool card shows: "Creating in nerve/src/auth/..."
6. File created at: /Users/nick/nerve/src/auth/permissions.ts
7. Tool status: Success ✓ (87 lines)
8. Navigate: Files tab → src → auth
9. See permissions.ts in list
10. Tap file → View content

**IDB Validation**:
```bash
# Send request
idb ui tap 181 725
idb ui text "Create src/auth/permissions.ts with basic role checking (Owner, Admin, User roles)"
idb ui tap 370 729

# Wait for tool execution
sleep 10
screenshot → Verify tool card visible

# Check file created
ls /Users/nick/nerve/src/auth/permissions.ts
# Should exist

# In app: Navigate to Files tab
idb ui tap 58 815  # Files icon (if exists)
# Or Settings → Browse Files

# Navigate: src → auth
# Screenshot
screenshot → Verify permissions.ts in list

# Tap to view
idb ui tap X Y
sleep 1
screenshot → Verify file content displayed
```

**Pass Criteria**:
- ✅ Tool executes in correct project directory
- ✅ File created at right absolute path
- ✅ Tool card shows project-relative path
- ✅ File appears in Files browser
- ✅ Content viewable in CodeViewer
- ✅ Desktop can see the file (real filesystem operation)

---

### GATE 6: File References (@mentions)
**Validates**: User can reference project files in conversation

**User Flow**:
1. In nerve project
2. Type: "Review @src/"
3. Autocomplete appears showing nerve/src/ files
4. Select @src/auth/index.ts
5. Complete: "Review @src/auth/index.ts for security issues"
6. Send
7. Claude reads the file
8. Response includes specific code snippets from that file
9. Suggestions are contextual to nerve's architecture

**IDB Validation**:
```bash
# Type @ to trigger autocomplete
idb ui tap 181 725
idb ui text "Review @"
sleep 1
screenshot → Verify autocomplete appears (if implemented)

# Complete path manually or select from list
idb ui text "src/auth/index.ts for security vulnerabilities"
idb ui tap 370 729

# Wait for response
sleep 8
screenshot → Verify response discusses actual code

# Check backend logs
grep "Read.*src/auth/index.ts" logs/backend.log
grep "project.*nerve" logs/backend.log
```

**Pass Criteria**:
- ✅ @ autocomplete shows project files (if implemented)
- ✅ File paths are project-relative
- ✅ Claude reads correct file from correct project
- ✅ Response includes actual code from the file
- ✅ No cross-project file access

---

### GATE 7: Git Commit in Project Repo
**Validates**: Git operations scoped to project

**User Flow**:
1. Working on nerve project
2. Navigate: Settings → Git Operations
3. Git screen shows nerve's repository status
4. See modified files: src/auth/jwt.ts, src/auth/permissions.ts
5. Type commit message: "Add JWT authentication and permissions system"
6. Tap "Create Commit" button
7. Backend executes: `git add` and `git commit` in /Users/nick/nerve/
8. Success toast appears
9. Commit appears in "Recent Commits" section
10. Desktop: `cd ~/nerve && git log` shows the commit

**IDB Validation**:
```bash
# Setup: Make a change in nerve
echo "// Test change" >> /Users/nick/nerve/test-gate7.ts

# Navigate to Git screen
# (Settings → Git Operations)
idb ui tap 301 815  # Settings
idb ui swipe ...scroll to Git
idb ui tap X Y  # Git Operations
sleep 2
screenshot → Verify test-gate7.ts in modified/untracked

# Type commit message
idb ui tap X Y  # Message input
idb ui text "GATE 7: Test git commit in nerve project"

# Commit
idb ui tap X Y  # Create Commit button
sleep 2
screenshot → Verify success message/updated status

# Verify on desktop
cd /Users/nick/nerve
git log --oneline | head -1
# Should show "GATE 7: Test git commit"

# Verify isolation (other projects unchanged)
cd /Users/nick/swift-coreml-diffusers
git log --oneline | head -1
# Should NOT show gate 7 commit
```

**Pass Criteria**:
- ✅ Git status for correct project only
- ✅ Commit creates in right repository
- ✅ Desktop git log shows the commit
- ✅ Other projects' repositories unaffected
- ✅ Proper directory and repo isolation

---

## Implementation Checklist

Based on UI/UX skill principles:

### Design Phase ✅
- [x] User persona defined (Alex the Developer)
- [x] User journeys mapped (4 scenarios)
- [x] Pain points identified (no project context)
- [x] Task analysis completed (Projects→Sessions→Chat)
- [x] Information architecture designed
- [x] Wireframes created (ASCII diagrams above)
- [x] Interaction patterns specified
- [x] Accessibility requirements documented

### Development Phase (Next Session)
- [ ] Implement Zustand store changes (currentProject)
- [ ] Build Projects screen navigation
- [ ] Create project-sessions stack screen
- [ ] Fix Sessions screen bugs
- [ ] Enhance Chat with project context
- [ ] Scope Files browser to project
- [ ] Scope Git screen to project

### Validation Phase (Next Session)
- [ ] Run 7 user-workflow gates
- [ ] Screenshot each step
- [ ] Verify with IDB automation
- [ ] Test on iPhone 16 Pro
- [ ] Document any UX issues found

---

**Design Complete**: 500k tokens used, 500k remaining
**Ready for**: Implementation with clear UX specifications
**Expected Outcome**: Natural, intuitive mobile code assistant
