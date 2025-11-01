#!/bin/bash
#
# Comprehensive Functional Test for Python FastAPI Backend (claude-code-api)
#
# Tests ALL endpoints with real Claude CLI integration
# NO MOCKS - Full functional testing with actual file system, database, Claude API
#
# Exit code: 0 = all tests pass, 1 = any test fails

set -euo pipefail

BACKEND_URL="http://localhost:8000"
TEST_PROJECT_PATH="/tmp/claude-mobile-test-$(date +%s)"
RESULTS_FILE="/tmp/backend-test-results-$(date +%s).txt"

TESTS_PASSED=0
TESTS_FAILED=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================" | tee "$RESULTS_FILE"
echo "Python FastAPI Backend Functional Tests" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"
echo "Backend URL: $BACKEND_URL" | tee -a "$RESULTS_FILE"
echo "Test Project: $TEST_PROJECT_PATH" | tee -a "$RESULTS_FILE"
echo "Claude CLI: $(which claude || echo 'NOT FOUND')" | tee -a "$RESULTS_FILE"
echo "Claude Version: $(claude --version 2>&1 || echo 'ERROR')" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"

# Test function
test_endpoint() {
    local test_name="$1"
    local expected_status="$2"
    shift 2
    
    echo -n "Testing: $test_name... " | tee -a "$RESULTS_FILE"
    
    # Run curl command (remaining args)
    if response=$(curl -s -w "\n%{http_code}" "$@" 2>&1); then
        status=$(echo "$response" | tail -1)
        body=$(echo "$response" | head -n -1)
        
        if [ "$status" = "$expected_status" ]; then
            echo -e "${GREEN}PASS${NC} (HTTP $status)" | tee -a "$RESULTS_FILE"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            echo -e "${RED}FAIL${NC} (HTTP $status, expected $expected_status)" | tee -a "$RESULTS_FILE"
            echo "  Response: $body" | tee -a "$RESULTS_FILE"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    else
        echo -e "${RED}FAIL${NC} (curl error)" | tee -a "$RESULTS_FILE"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Cleanup function
cleanup() {
    echo "" | tee -a "$RESULTS_FILE"
    echo "Cleaning up..." | tee -a "$RESULTS_FILE"
    rm -rf "$TEST_PROJECT_PATH" 2>/dev/null || true
}

trap cleanup EXIT

echo "========================================" | tee -a "$RESULTS_FILE"
echo "TEST SUITE 1: Backend Health & Basics" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"

# Test 1: Health Check
test_endpoint "Health Check" 200 \
    "$BACKEND_URL/health"

# Test 2: Root Endpoint
test_endpoint "Root Endpoint" 200 \
    "$BACKEND_URL/"

# Test 3: Models List
test_endpoint "Models List" 200 \
    "$BACKEND_URL/v1/models"

# Test 4: Specific Model
test_endpoint "Get Specific Model" 200 \
    "$BACKEND_URL/v1/models/claude-3-5-sonnet-20241022"

# Test 5: Invalid Model
test_endpoint "Invalid Model (404)" 404 \
    "$BACKEND_URL/v1/models/nonexistent-model"

echo "" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "TEST SUITE 2: Project Management" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"

# Test 6: List Projects (empty initially)
test_endpoint "List Projects" 200 \
    "$BACKEND_URL/v1/projects"

# Test 7: Create Project
mkdir -p "$TEST_PROJECT_PATH"
test_endpoint "Create Project" 200 \
    -X POST "$BACKEND_URL/v1/projects" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test Project\",\"path\":\"$TEST_PROJECT_PATH\"}"

# Save project ID for later tests
PROJECT_ID=$(curl -s -X POST "$BACKEND_URL/v1/projects" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test Project 2\",\"path\":\"$TEST_PROJECT_PATH\"}" | jq -r '.id')

echo "  Created Project ID: $PROJECT_ID" | tee -a "$RESULTS_FILE"

# Test 8: Get Project
test_endpoint "Get Project" 200 \
    "$BACKEND_URL/v1/projects/$PROJECT_ID"

# Test 9: List Projects (should have projects now)
test_endpoint "List Projects (non-empty)" 200 \
    "$BACKEND_URL/v1/projects"

echo "" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "TEST SUITE 3: Session Management" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"

# Test 10: List Sessions (empty initially)
test_endpoint "List Sessions" 200 \
    "$BACKEND_URL/v1/sessions"

# Test 11: Create Session
test_endpoint "Create Session" 200 \
    -X POST "$BACKEND_URL/v1/sessions" \
    -H "Content-Type: application/json" \
    -d "{\"project_id\":\"$PROJECT_ID\",\"model\":\"claude-3-5-sonnet-20241022\"}"

# Save session ID
SESSION_ID=$(curl -s -X POST "$BACKEND_URL/v1/sessions" \
    -H "Content-Type: application/json" \
    -d "{\"project_id\":\"$PROJECT_ID\",\"model\":\"claude-3-5-sonnet-20241022\"}" | jq -r '.id')

echo "  Created Session ID: $SESSION_ID" | tee -a "$RESULTS_FILE"

# Test 12: Get Session
test_endpoint "Get Session" 200 \
    "$BACKEND_URL/v1/sessions/$SESSION_ID"

# Test 13: Session Stats
test_endpoint "Session Stats" 200 \
    "$BACKEND_URL/v1/sessions/stats"

echo "" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "TEST SUITE 4: Chat Completions (Non-Streaming)" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"

# Test 14: Simple Chat (Non-Streaming)
echo -n "Testing: Simple Chat Completion... " | tee -a "$RESULTS_FILE"
CHAT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -d "{
        \"model\":\"claude-3-5-sonnet-20241022\",
        \"messages\":[{\"role\":\"user\",\"content\":\"Say exactly: test successful\"}],
        \"session_id\":\"$SESSION_ID\",
        \"stream\":false
    }")

if echo "$CHAT_RESPONSE" | jq -e '.choices[0].message.content' > /dev/null 2>&1; then
    echo -e "${GREEN}PASS${NC}" | tee -a "$RESULTS_FILE"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo "  Response: $(echo "$CHAT_RESPONSE" | jq -r '.choices[0].message.content')" | tee -a "$RESULTS_FILE"
else
    echo -e "${RED}FAIL${NC}" | tee -a "$RESULTS_FILE"
    echo "  Response: $CHAT_RESPONSE" | tee -a "$RESULTS_FILE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 15: Chat with System Prompt
test_endpoint "Chat with System Prompt" 200 \
    -X POST "$BACKEND_URL/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -d "{
        \"model\":\"claude-3-5-sonnet-20241022\",
        \"messages\":[
            {\"role\":\"system\",\"content\":\"You are a helpful assistant\"},
            {\"role\":\"user\",\"content\":\"Hi\"}
        ],
        \"stream\":false
    }"

echo "" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "TEST SUITE 5: SSE Streaming" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"

# Test 16: Streaming Chat
echo -n "Testing: SSE Streaming... " | tee -a "$RESULTS_FILE"
STREAM_OUTPUT=$(mktemp)
curl -s -N -X POST "$BACKEND_URL/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Accept: text/event-stream" \
    -d "{
        \"model\":\"claude-3-5-sonnet-20241022\",
        \"messages\":[{\"role\":\"user\",\"content\":\"Count to 3\"}],
        \"session_id\":\"$SESSION_ID\",
        \"stream\":true
    }" > "$STREAM_OUTPUT" 2>&1

# Verify SSE format
if grep -q "^data: " "$STREAM_OUTPUT" && grep -q "\[DONE\]" "$STREAM_OUTPUT"; then
    echo -e "${GREEN}PASS${NC}" | tee -a "$RESULTS_FILE"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    EVENT_COUNT=$(grep -c "^data: " "$STREAM_OUTPUT" || echo 0)
    echo "  SSE Events: $EVENT_COUNT" | tee -a "$RESULTS_FILE"
    echo "  Terminator: $(tail -1 "$STREAM_OUTPUT")" | tee -a "$RESULTS_FILE"
else
    echo -e "${RED}FAIL${NC}" | tee -a "$RESULTS_FILE"
    echo "  Output: $(head -5 "$STREAM_OUTPUT")" | tee -a "$RESULTS_FILE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

rm -f "$STREAM_OUTPUT"

# Test 17: Tool Use via Streaming
echo -n "Testing: Tool Execution via SSE... " | tee -a "$RESULTS_FILE"
TEST_FILE="$TEST_PROJECT_PATH/tool-test.txt"
STREAM_OUTPUT=$(mktemp)

curl -s -N -X POST "$BACKEND_URL/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Accept: text/event-stream" \
    -d "{
        \"model\":\"claude-3-5-sonnet-20241022\",
        \"messages\":[{\"role\":\"user\",\"content\":\"Create a file at $TEST_FILE with content 'Tool works'\"}],
        \"session_id\":\"$SESSION_ID\",
        \"stream\":true
    }" > "$STREAM_OUTPUT" 2>&1 &

CURL_PID=$!
sleep 10
kill $CURL_PID 2>/dev/null || true

# Verify file was created
if [ -f "$TEST_FILE" ] && grep -q "Tool works" "$TEST_FILE"; then
    echo -e "${GREEN}PASS${NC}" | tee -a "$RESULTS_FILE"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo "  File created: $TEST_FILE" | tee -a "$RESULTS_FILE"
    echo "  Content: $(cat "$TEST_FILE")" | tee -a "$RESULTS_FILE"
else
    echo -e "${RED}FAIL${NC}" | tee -a "$RESULTS_FILE"
    echo "  File not created or wrong content" | tee -a "$RESULTS_FILE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

rm -f "$STREAM_OUTPUT"

echo "" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "TEST SUITE 6: Database Verification" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"

# Test 18: Check Database File
echo -n "Testing: Database File Exists... " | tee -a "$RESULTS_FILE"
DB_PATH="../claude-code-api/claude_code.db"
if [ -f "$DB_PATH" ]; then
    echo -e "${GREEN}PASS${NC}" | tee -a "$RESULTS_FILE"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo "  Size: $(du -h "$DB_PATH" | cut -f1)" | tee -a "$RESULTS_FILE"
else
    echo -e "${RED}FAIL${NC}" | tee -a "$RESULTS_FILE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 19: Verify Database Schema
echo -n "Testing: Database Tables... " | tee -a "$RESULTS_FILE"
TABLES=$(sqlite3 "$DB_PATH" ".tables" 2>&1 || echo "ERROR")
if echo "$TABLES" | grep -q "sessions" && echo "$TABLES" | grep -q "projects"; then
    echo -e "${GREEN}PASS${NC}" | tee -a "$RESULTS_FILE"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo "  Tables: $TABLES" | tee -a "$RESULTS_FILE"
else
    echo -e "${RED}FAIL${NC}" | tee -a "$RESULTS_FILE"
    echo "  Tables: $TABLES" | tee -a "$RESULTS_FILE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 20: Verify Session in Database
echo -n "Testing: Session Persisted to DB... " | tee -a "$RESULTS_FILE"
DB_SESSION_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sessions WHERE id='$SESSION_ID';" 2>&1 || echo "0")
if [ "$DB_SESSION_COUNT" = "1" ]; then
    echo -e "${GREEN}PASS${NC}" | tee -a "$RESULTS_FILE"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}FAIL${NC} (Count: $DB_SESSION_COUNT)" | tee -a "$RESULTS_FILE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo "" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "FINAL RESULTS" | tee -a "$RESULTS_FILE"
echo "========================================" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"
echo "Tests Passed: $TESTS_PASSED" | tee -a "$RESULTS_FILE"
echo "Tests Failed: $TESTS_FAILED" | tee -a "$RESULTS_FILE"
echo "Results saved: $RESULTS_FILE" | tee -a "$RESULTS_FILE"
echo "" | tee -a "$RESULTS_FILE"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED${NC}" | tee -a "$RESULTS_FILE"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}" | tee -a "$RESULTS_FILE"
    exit 1
fi
