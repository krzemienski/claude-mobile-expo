/**
 * App Configuration Constants
 * Centralized configuration for the application
 */

// ============================================
// API CONFIGURATION
// ============================================

export const API_CONFIG = {
  // Default backend URL (localhost for development)
  DEFAULT_BASE_URL: 'http://localhost:8001',

  // Timeout for API requests (60 seconds)
  REQUEST_TIMEOUT_MS: 60000,

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,

  // Streaming configuration
  STREAMING_TIMEOUT_MS: 300000, // 5 minutes for long responses
  HEARTBEAT_INTERVAL_MS: 30000, // 30 seconds

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ============================================
// OFFLINE QUEUE CONFIGURATION
// ============================================

export const OFFLINE_CONFIG = {
  // Maximum messages in offline queue
  MAX_QUEUE_SIZE: 50,

  // Maximum retry attempts per message
  MAX_RETRY_COUNT: 3,

  // Storage key for AsyncStorage
  STORAGE_KEY: '@claude-mobile/offline-queue',
} as const;

// ============================================
// RECONNECTION CONFIGURATION
// ============================================

export const RECONNECTION_CONFIG = {
  // Initial retry delay (1 second)
  INITIAL_DELAY_MS: 1000,

  // Maximum retry delay (30 seconds)
  MAX_DELAY_MS: 30000,

  // Backoff multiplier
  BACKOFF_MULTIPLIER: 2,

  // Maximum reconnection attempts (infinite if 0)
  MAX_ATTEMPTS: 0,
} as const;

// ============================================
// UI CONFIGURATION
// ============================================

export const UI_CONFIG = {
  // Message input
  MAX_MESSAGE_LENGTH: 10000,
  MESSAGE_PLACEHOLDER: 'Message Claude Code...',

  // FlatList optimization
  WINDOW_SIZE: 10,
  MAX_TO_RENDER_PER_BATCH: 10,
  INITIAL_NUM_TO_RENDER: 10,

  // Animation durations
  ANIMATION_DURATION_MS: 300,
  TOAST_DURATION_MS: 3000,

  // Keyboard
  KEYBOARD_AVOID_BEHAVIOR: 'padding' as const,
  KEYBOARD_VERTICAL_OFFSET: 0,
} as const;

// ============================================
// STORAGE KEYS
// ============================================

export const STORAGE_KEYS = {
  APP_SETTINGS: '@claude-mobile/settings',
  OFFLINE_QUEUE: '@claude-mobile/offline-queue',
  CACHED_SESSIONS: '@claude-mobile/sessions',
  CACHED_PROJECTS: '@claude-mobile/projects',
} as const;

// ============================================
// MODELS
// ============================================

export const CLAUDE_MODELS = {
  OPUS_4: 'claude-opus-4-20250514',
  SONNET_4: 'claude-sonnet-4-20250514',
  SONNET_37: 'claude-3-7-sonnet-20250219',
  HAIKU_35: 'claude-3-5-haiku-20241022',
} as const;

export const DEFAULT_MODEL = CLAUDE_MODELS.HAIKU_35;

// ============================================
// FILE BROWSER
// ============================================

export const FILE_BROWSER_CONFIG = {
  MAX_FILE_SIZE_FOR_PREVIEW: 1024 * 1024, // 1MB
  MAX_DIRECTORY_DEPTH: 10,
  HIDDEN_FILES_VISIBLE: false,
  CODE_EXTENSIONS: [
    'ts', 'tsx', 'js', 'jsx', 'py', 'java', 'cpp', 'c', 'h',
    'swift', 'kt', 'rs', 'go', 'rb', 'php', 'cs', 'sh',
    'json', 'yaml', 'yml', 'xml', 'md',
  ],
} as const;

// ============================================
// GIT CONFIGURATION
// ============================================

export const GIT_CONFIG = {
  MAX_LOG_ENTRIES: 50,
  MAX_DIFF_LINES: 1000,
  DEFAULT_AUTHOR: {
    name: 'Claude Code Mobile',
    email: 'mobile@claudecode.ai',
  },
} as const;

// ============================================
// FEATURE FLAGS
// ============================================

export const FEATURES = {
  ENABLE_THINKING_DISPLAY: true,
  ENABLE_TOOL_CARDS: true,
  ENABLE_SLASH_COMMANDS: true,
  ENABLE_FILE_BROWSER: true,
  ENABLE_GIT_OPERATIONS: true,
  ENABLE_MCP_MANAGEMENT: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_COST_TRACKING: true,
} as const;

// ============================================
// DEVELOPMENT
// ============================================

export const DEV_CONFIG = {
  ENABLE_CONSOLE_LOGS: __DEV__,
  ENABLE_REDUX_DEVTOOLS: __DEV__,
  ENABLE_PERFORMANCE_MONITOR: __DEV__,
} as const;
