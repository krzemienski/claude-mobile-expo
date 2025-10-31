#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEVICE="${1:-iPhone 14}"

echo "🧪 VALIDATION GATE 4A: Frontend Visual Testing"
echo "==============================================="
echo "Device: $DEVICE"
echo ""
echo "💡 RECOMMENDED: Use expo-mcp autonomous testing instead:"
echo "   \"Take screenshot of Chat screen and verify purple gradient\""
echo "   \"Find view with testID 'message-input' and verify accessible\""
echo "   \"Tap button with testID 'send-button' and verify message sent\""
echo ""
echo "This script provides baseline manual testing."
echo ""

TESTS_PASSED=0
TESTS_TOTAL=5

# Test 1: Build
echo "⚙️  Test 1: Building iOS app..."
"$SCRIPT_DIR/build-ios.sh" "$DEVICE" && {
  echo "✅ Build: PASS"
  ((TESTS_PASSED++))
} || {
  echo "❌ Build: FAIL"
}

# Test 2: Screenshots
echo ""
echo "⚙️  Test 2: Capturing screenshots..."
"$SCRIPT_DIR/capture-screenshots.sh" "$DEVICE" "gate-4a" && {
  echo "✅ Screenshots: PASS"
  ((TESTS_PASSED++))
} || {
  echo "❌ Screenshots: FAIL"
}

# Test 3: Screenshot count
echo ""
echo "⚙️  Test 3: Verifying screenshot count..."
SCREENSHOT_COUNT=$(ls "$PROJECT_ROOT/validation/gate-4a-screenshots"/*.png 2>/dev/null | wc -l)
if [ $SCREENSHOT_COUNT -ge 7 ]; then
  echo "✅ Screenshot count: PASS ($SCREENSHOT_COUNT/7)"
  ((TESTS_PASSED++))
else
  echo "❌ Screenshot count: FAIL ($SCREENSHOT_COUNT/7)"
fi

# Test 4: Visual inspection
echo ""
echo "⚙️  Test 4: Visual inspection (manual or expo-mcp)..."
echo "For expo-mcp: AI analyzes screenshots autonomously"
echo "For manual: Review validation/gate-4a-screenshots/"
echo "Pass visual inspection? (y/n): "
read -r VISUAL_CHECK
if [[ "$VISUAL_CHECK" =~ ^[Yy]$ ]]; then
  echo "✅ Visual inspection: PASS"
  ((TESTS_PASSED++))
else
  echo "❌ Visual inspection: FAIL"
fi

# Test 5: Stability
echo ""
echo "⚙️  Test 5: App stability (60s test)..."
sleep 60
echo "App still running? (y/n): "
read -r STABILITY_CHECK
if [[ "$STABILITY_CHECK" =~ ^[Yy]$ ]]; then
  echo "✅ Stability: PASS"
  ((TESTS_PASSED++))
else
  echo "❌ Stability: FAIL"
fi

echo ""
echo "📊 Results: $TESTS_PASSED/$TESTS_TOTAL tests passed"

if [ $TESTS_PASSED -eq $TESTS_TOTAL ]; then
  echo "✅ VALIDATION GATE 4A: PASSED"
  exit 0
else
  echo "❌ VALIDATION GATE 4A: FAILED"
  exit 1
fi
