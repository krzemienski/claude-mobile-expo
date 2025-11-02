# Context7 + XC-MCP Documentation - Complete Reference

**Date**: 2025-11-01
**Purpose**: Foundation knowledge for v2.0 iOS validation and testing
**Session**: Comprehensive validation with ultrathink

## React Native Core (Context7)

**Fundamental Components**:
- View: Flexbox container, maps to UIView (iOS) / ViewGroup (Android)
- Text: Text display with styling, maps to UITextView / TextView
- Image: Display images from network/local, maps to UIImageView / ImageView
- TextInput: User input, maps to UITextField / EditText
- ScrollView: Scrollable container, maps to UIScrollView / ScrollView
- FlatList: Efficient scrolling lists with virtualization
- SectionList: Grouped lists with section headers
- Pressable: Modern touch handler (replaces TouchableOpacity)

**Platform-Specific**:
- Android: BackHandler (hardware back), PermissionsAndroid, ToastAndroid, DrawerLayoutAndroid
- iOS: ActionSheetIOS, InputAccessoryView, SafeAreaView

**Styling**: StyleSheet.create() for optimized styles, full flexbox support

## Expo Development Workflow (Context7)

**Metro Bundler**:
- Start: `npx expo start` (default port 8081)
- **MCP Support**: `EXPO_UNSTABLE_MCP_SERVER=1 npx expo start` (CRITICAL for expo-mcp local tools)
- Config: metro.config.js with `getDefaultConfig` from expo/metro-config
- Bundle splitting: Automatic for web with @expo/metro-runtime

**Commands**:
- `npx expo run:ios` - Build and run on iOS
- `npx expo run:android` - Build and run on Android  
- `npx expo export` - Production bundle
- `npx expo start --web` - Web development

**Key Features**:
- Development builds support
- Monorepo support built-in
- Hot reloading default
- EAS Workflows for automation

## FastAPI Backend (Context7)

**WebSockets**:
- Decorator: `@app.websocket("/path")`
- Dependencies: `Depends()` for auth (Cookie, Query)
- Connection: `await websocket.accept()`
- Send/Receive: `await websocket.send_text()` / `await websocket.receive_text()`
- Exception: `WebSocketException` with status codes

**Background Tasks**:
- Parameter: `BackgroundTasks` in endpoints
- Add task: `background_tasks.add_task(func, *args)`
- Execution: After response sent (non-blocking)
- Dependency injection: Can use in dependencies AND path operations

**Testing**:
- TestClient for HTTP + WebSocket
- WebSocket: `client.websocket_connect("/ws")`
- Assertions: `response.json()`, `websocket.receive_json()`

**Patterns**:
- Dependency injection with Annotated[Type, Depends(func)]
- Lifespan context for startup/shutdown
- APIRouter for modular organization
- Progressive error handling

## XC-MCP Tools (rtfm Documentation)

### xcodebuild-build
- **Advantages**: Learns successful configs, tracks performance, structured errors
- **Caching**: Intelligent caching of build results
- **Progressive disclosure**: Large logs returned with cache IDs
- **Use**: Build iOS apps with learning system

### simctl-boot
- **Parameters**: deviceId (UDID or "booted"), waitForBoot (default: true), openGui (default: true)
- **Advantages**: Performance tracking, learning which devices work best, smart wait management
- **Handles**: Already booted case gracefully (treats as success)
- **Returns**: Boot status, device info, boot time metrics

### simctl-install
- **Purpose**: Deploy .app bundle to simulator
- **Parameters**: udid (simulator), appPath (path to .app)
- **Returns**: Installation status, app name, guidance
- **Prerequisite**: Simulator must be booted

### simctl-launch
- **Parameters**: udid, bundleId (required), arguments (optional array), environment (optional object)
- **Returns**: Process ID of launched app
- **Use cases**: Debug launches, API environment switching, feature flags
- **Note**: Environment vars auto-prefixed with SIMCTL_CHILD_

### idb-ui-tap
- **Coordinates**: Absolute device coordinates (0,0 = top-left)
- **Screenshot transform**: applyScreenshotScale: true + screenshotScaleX/Y for automatic coordinate translation
- **Optional**: numberOfTaps, duration (long press), actionName, screenContext (for LLM tracking)
- **Works**: Both simulators and physical devices

### idb-ui-input  
- **Operations**: text (type string), key (single key press), key-sequence (multiple keys)
- **Keys**: home, lock, siri, delete, return, space, escape, tab, arrows
- **Prerequisite**: Text field must be focused first
- **Sensitive**: isSensitive flag for passwords

### screenshot (simctl-screenshot-inline)
- **Returns**: Base64-encoded image directly in MCP response
- **Sizes**: half (256×512, ~170 tokens DEFAULT), full (native, ~340 tokens), quarter, thumb
- **Optimization**: Automatic WebP/JPEG compression at 60%
- **Interactive elements**: Top 20 tappable elements extracted from accessibility tree
- **Coordinate transform**: scaleX/Y provided for mapping screenshot coords to device coords
- **Semantic naming**: appName, screenName, state params for organization
- **Use**: Visual analysis, UI automation, bug reporting

## expo-mcp Tool Categories (from skill)

**Server Tools** (always available):
- search_documentation: Search Expo docs
- add_library: Add Expo library with usage docs
- generate_agents_md: Create AGENTS.md
- generate_claude_md: Create CLAUDE.md  
- learn: Teach Expo how-tos

**Local Tools** (require EXPO_UNSTABLE_MCP_SERVER=1):
- automation_take_screenshot: Capture React Native screenshots
- automation_tap_by_testid: Tap element by testID prop
- automation_find_view_by_testid: Find element by testID
- open_devtools: Open React DevTools

## Critical Integration Points

**Metro + expo-mcp**:
- Must start Metro with `EXPO_UNSTABLE_MCP_SERVER=1` to enable local automation tools
- Without flag: Only server tools available (search, add_library)
- With flag: Full autonomous testing capabilities (screenshot, tap, find)

**XC-MCP + IDB**:
- XC-MCP handles simulator lifecycle (boot, install, launch)
- IDB handles UI automation (tap, input, gestures)
- Screenshot tool provides coordinate transforms for accurate tapping
- Works on both simulators and physical devices

**Validation Workflow**:
1. Start Metro with MCP flag
2. Start backend server
3. Boot simulator with simctl-boot
4. Build with xcodebuild-build
5. Install with simctl-install
6. Launch with simctl-launch
7. Screenshot with screenshot tool (get coords)
8. Interact with idb-ui-tap (using coordinate transforms)
9. Verify with expo-mcp automation tools (testID-based)

## Next Steps

- List expo-mcp tools to confirm availability
- Read validation gate skills completely
- Execute validation gates in sequence
- Fix issues with systematic-debugging
- Document results to memory
