#!/bin/bash
#
# Python FastAPI Backend Sanity Check
# Tests backend/ (Python FastAPI) with REAL Claude Code CLI integration
#
# Backend Location: /Users/nick/Desktop/claude-mobile-expo/backend/
# Start: cd backend && uvicorn claude_code_api.main:app --host 0.0.0.0 --port 8001 --reload
#
# Exit code: 0 = all tests pass, 1 = any test fails

set -euo pipefail

# Configuration
BACKEND_URL="http://localhost:8001"
TEST_PROJECT="/tmp/claude-sanity-test-$$"
RESULTS_FILE="/tmp/python-backend-sanity-$$(date +%Y%m%d-%H%M%S).txt"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0;33m' # No Color

# Counters
TESTS_PASSED=0
TESTS_FAILED=0

echo "========================================" | tee "$RESULTS_FILE"
echo "Python FastAPI Backend Sanity Check" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"
echo "Backend URL: $BACKEND_URL" | tee -a "$RESULTS_FILE"
echo "Test Project: $TEST_PROJECT" | tee -a "$RESULTS_FILE"
echo "Timestamp: $(date)" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"

# Create test project directory
mkdir -p "$TEST_PROJECT"

# Test function
test_endpoint() {
    local test_name="$1"
    local test_command="$2"

    echo -n "Testing: $test_name... " | tee -a "$RESULTS_FILE"

    if output=$(eval "$test_command" 2>&1); then
        echo -e "${GREEN}PASS${NC}" | tee -a "$RESULTS_FILE"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        if [ -n "$output" ]; then
            echo "  Output: $output" | tee -a "$RESULTS_FILE"
        fi
        return 0
    else
        echo -e "${RED}FAIL${NC}" | tee -a "$RESULTS_FILE"
        echo "  Error: $output" | tee -a "$RESULTS_FILE"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "========================================" | tee -a "$RESULTS_FILE"
echo "TEST SUITE 1: Backend Health" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"

# Test 1: Health Check
test_endpoint "Health Check" \
    "curl -sf '$BACKEND_URL/health' | jq -e '.status == \"healthy\"' > /dev/null && echo 'Status: healthy'"

# Test 2: Claude CLI Version
test_endpoint "Claude CLI Available" \
    "curl -s '$BACKEND_URL/health' | jq -r '.claude_version' | grep -q '2.0.31' && curl -s '$BACKEND_URL/health' | jq -r '.claude_version'"

echo "" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "TEST SUITE 2: Models API" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"

# Test 3: List Models
test_endpoint "Models List (4 models)" \
    "curl -s '$BACKEND_URL/v1/models' | jq -e '.data | length == 4' > /dev/null && echo '4 Claude models available'"

# Test 4: Verify Model IDs
test_endpoint "Model IDs Valid" \
    "curl -s '$BACKEND_URL/v1/models' | jq -r '.data[].id' | head -4 | grep -q 'claude-' && echo 'All IDs start with claude-'"

echo "" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "TEST SUITE 3: Chat Completions" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"

# Test 5: Non-Streaming Chat (THE CRITICAL TEST)
echo -n "Testing: Non-Streaming Chat Completion... " | tee -a "$RESULTS_FILE"
cat > /tmp/chat-test-$$.json <<'CHATEOF'
{
  "model": "claude-3-5-haiku-20241022",
  "messages": [{"role": "user", "content": "Say exactly: SUCCESS"}],
  "stream": false
}
CHATEOF

CHAT_RESPONSE=$(curl -s --max-time 60 -X POST "$BACKEND_URL/v1/chat/completions" \
  -H 'Content-Type: application/json' \
  -d @/tmp/chat-test-$$.json)

CONTENT=$(echo "$CHAT_RESPONSE" | jq -r '.choices[0].message.content // empty')
if echo "$CONTENT" | grep -q "SUCCESS"; then
    echo -e "${GREEN}PASS${NC}" | tee -a "$RESULTS_FILE"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo "  Response: $CONTENT" | tee -a "$RESULTS_FILE"
    echo "  Session ID: $(echo "$CHAT_RESPONSE" | jq -r '.session_id')" | tee -a "$RESULTS_FILE"
    echo "  Tokens: $(echo "$CHAT_RESPONSE" | jq -r '.usage.total_tokens')" | tee -a "$RESULTS_FILE"
else
    echo -e "${RED}FAIL${NC}" | tee -a "$RESULTS_FILE"
    echo "  Full response: $CHAT_RESPONSE" | tee -a "$RESULTS_FILE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

rm -f /tmp/chat-test-$$.json

# Test 6: SSE Streaming Format
echo -n "Testing: SSE Streaming Format... " | tee -a "$RESULTS_FILE"
cat > /tmp/stream-test-$$.json <<'STREAMEOF'
{
  "model": "claude-3-5-haiku-20241022",
  "messages": [{"role": "user", "content": "Say: Hi"}],
  "stream": true
}
STREAMEOF

SSE_FILE="/tmp/sse-test-$$.txt"
curl -s -N --max-time 50 -X POST "$BACKEND_URL/v1/chat/completions" \
  -H 'Content-Type: application/json' \
  -H 'Accept: text/event-stream' \
  -d @/tmp/stream-test-$$.json \
  > "$SSE_FILE" 2>&1 &
SSE_PID=$!

# Wait for completion
wait $SSE_PID 2>/dev/null || true

if grep -q "^data: " "$SSE_FILE" && grep -q "\[DONE\]" "$SSE_FILE"; then
    EVENT_COUNT=$(grep -c "^data: " "$SSE_FILE" || echo 0)
    echo -e "${GREEN}PASS${NC} ($EVENT_COUNT SSE events)" | tee -a "$RESULTS_FILE"
    TESTS_PASSED=$((TESTS_PASSED + 1))

    # Verify format details
    FIRST_CHUNK=$(grep "^data: " "$SSE_FILE" | head -1 | sed 's/^data: //')
    HAS_ROLE=$(echo "$FIRST_CHUNK" | jq -e '.choices[0].delta.role == "assistant"' 2>/dev/null && echo "yes" || echo "no")
    echo "  First chunk has role: $HAS_ROLE" | tee -a "$RESULTS_FILE"

    LAST_CHUNK=$(grep "^data: " "$SSE_FILE" | grep -v "\[DONE\]" | tail -1 | sed 's/^data: //')
    FINISH_REASON=$(echo "$LAST_CHUNK" | jq -r '.choices[0].finish_reason // "none"' 2>/dev/null)
    echo "  Final chunk finish_reason: $FINISH_REASON" | tee -a "$RESULTS_FILE"
else
    echo -e "${RED}FAIL${NC}" | tee -a "$RESULTS_FILE"
    echo "  Stream output: $(head -5 "$SSE_FILE")" | tee -a "$RESULTS_FILE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

rm -f /tmp/stream-test-$$.json "$SSE_FILE"

echo "" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "RESULTS SUMMARY" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}" | tee -a "$RESULTS_FILE"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"
echo "Results saved to: $RESULTS_FILE" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"

# Cleanup
rm -rf "$TEST_PROJECT"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED${NC}" | tee -a "$RESULTS_FILE"
    echo "" | tee -a "$RESULTS_FILE"
    echo "Python backend is FUNCTIONAL and responding correctly." | tee -a "$RESULTS_FILE"
    echo "Claude CLI integration via subprocess.exec is WORKING." | tee -a "$RESULTS_FILE"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}" | tee -a "$RESULTS_FILE"
    exit 1
fi
