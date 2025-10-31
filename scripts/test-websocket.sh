#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

SERVER_URL="${1:-ws://localhost:3001/ws}"
PROJECT_PATH="${2:-/tmp/test-project}"
LOGS_DIR="$PROJECT_ROOT/logs"

echo "🧪 WebSocket Integration Test"
echo "=============================="
echo "Server: $SERVER_URL"
echo "Project: $PROJECT_PATH"
echo ""

# Setup test project
mkdir -p "$PROJECT_PATH"
cd "$PROJECT_PATH"
git init 2>/dev/null || true

# Install wscat if not available
if ! command -v wscat &> /dev/null; then
  echo "📦 Installing wscat..."
  npm install -g wscat
fi

# Create test messages file
TEST_MESSAGES="$LOGS_DIR/websocket-test-messages.json"
cat > "$TEST_MESSAGES" << 'MESSAGES'
{"type":"init_session","projectPath":"PROJECT_PATH"}
{"type":"message","message":"Say hello"}
{"type":"message","message":"Create a test.txt file with content 'WebSocket test successful'"}
{"type":"message","message":"Show me test.txt"}
{"type":"message","message":"/help"}
MESSAGES

sed -i.bak "s|PROJECT_PATH|$PROJECT_PATH|g" "$TEST_MESSAGES"

# Run tests
echo "🔌 Connecting to WebSocket..."
RESPONSE_LOG="$LOGS_DIR/websocket-responses.log"
timeout 30 wscat -c "$SERVER_URL" < "$TEST_MESSAGES" > "$RESPONSE_LOG" 2>&1 &
WSCAT_PID=$!

sleep 15
kill $WSCAT_PID 2>/dev/null || true

# Validate responses
echo ""
echo "✅ Validation Results:"
echo "====================="

TESTS_PASSED=0
TESTS_TOTAL=5

grep -q "session_initialized" "$RESPONSE_LOG" && {
  echo "✅ Session initialization: PASS"
  ((TESTS_PASSED++))
} || echo "❌ Session initialization: FAIL"

grep -q "content_delta" "$RESPONSE_LOG" && {
  echo "✅ Message streaming: PASS"
  ((TESTS_PASSED++))
} || echo "❌ Message streaming: FAIL"

grep -q "tool_execution" "$RESPONSE_LOG" && {
  echo "✅ Tool execution: PASS"
  ((TESTS_PASSED++))
} || echo "❌ Tool execution: FAIL"

grep -q "slash_command_response" "$RESPONSE_LOG" && {
  echo "✅ Slash commands: PASS"
  ((TESTS_PASSED++))
} || echo "❌ Slash commands: FAIL"

if [ -f "$PROJECT_PATH/test.txt" ]; then
  CONTENT=$(cat "$PROJECT_PATH/test.txt")
  if [[ "$CONTENT" == "WebSocket test successful" ]]; then
    echo "✅ File operations: PASS"
    ((TESTS_PASSED++))
  else
    echo "❌ File operations: FAIL (wrong content: $CONTENT)"
  fi
else
  echo "❌ File operations: FAIL (file not created)"
fi

echo ""
echo "📊 Results: $TESTS_PASSED/$TESTS_TOTAL tests passed"
echo "📄 Full log: $RESPONSE_LOG"

if [ $TESTS_PASSED -eq $TESTS_TOTAL ]; then
  echo "✅ All WebSocket tests PASSED"
  exit 0
else
  echo "❌ Some WebSocket tests FAILED"
  exit 1
fi
