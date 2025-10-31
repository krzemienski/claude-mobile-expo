#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MOBILE_DIR="$PROJECT_ROOT/claude-code-mobile"
LOGS_DIR="$PROJECT_ROOT/logs"

echo "🚀 Starting Metro bundler..."

# Kill existing Metro
pkill -f "react-native.*start" 2>/dev/null || true
pkill -f "metro.*start" 2>/dev/null || true

# Clear cache if requested
if [[ "${1:-}" == "--clear-cache" ]]; then
  echo "🧹 Clearing Metro cache..."
  rm -rf /tmp/metro-* /tmp/haste-* ~/.metro
  watchman watch-del-all 2>/dev/null || true
  cd "$MOBILE_DIR" && rm -rf node_modules/.cache
fi

# Ensure logs directory exists
mkdir -p "$LOGS_DIR"

# Start Metro with expo-mcp support
cd "$MOBILE_DIR"
EXPO_UNSTABLE_MCP_SERVER=1 npm start > "$LOGS_DIR/metro.log" 2>&1 &
METRO_PID=$!
echo $METRO_PID > "$LOGS_DIR/metro.pid"

echo "📊 Metro PID: $METRO_PID"
echo "📄 Logs: $LOGS_DIR/metro.log"

# Wait for Metro to be ready (max 30 seconds)
echo "⏳ Waiting for Metro to be ready..."
timeout 30 bash -c "until grep -q 'Metro.*waiting\|Metro.*ready' '$LOGS_DIR/metro.log' 2>/dev/null; do sleep 1; done" || {
  echo "❌ Metro failed to start within 30 seconds"
  cat "$LOGS_DIR/metro.log"
  exit 1
}

echo "✅ Metro started successfully"
echo "🌐 Listening on: http://localhost:8081"
echo "🔌 expo-mcp: ENABLED (EXPO_UNSTABLE_MCP_SERVER=1)"
echo ""
echo "To view logs: tail -f $LOGS_DIR/metro.log"
echo "To stop Metro: ./scripts/stop-metro.sh"
