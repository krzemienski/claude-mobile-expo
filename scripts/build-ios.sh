#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MOBILE_DIR="$PROJECT_ROOT/claude-code-mobile"
LOGS_DIR="$PROJECT_ROOT/logs"

DEVICE="${1:-iPhone 14}"
CLEAN_BUILD="${2:-}"

echo "📱 Building iOS app for: $DEVICE"

# Ensure Metro is running
if ! pgrep -f "react-native.*start" > /dev/null; then
  echo "🚀 Metro not running, starting..."
  "$SCRIPT_DIR/start-metro.sh"
  sleep 5
fi

# Clean build if requested
if [[ "$CLEAN_BUILD" == "--clean" ]]; then
  echo "🧹 Cleaning build..."
  cd "$MOBILE_DIR/ios" && xcodebuild clean
  rm -rf ~/Library/Developer/Xcode/DerivedData/claudecodemobile-*
fi

# Build and run
cd "$MOBILE_DIR"
echo "🔨 Building..."
npx expo run:ios --device "$DEVICE" 2>&1 | tee "$LOGS_DIR/ios-build.log"

BUILD_RESULT=${PIPESTATUS[0]}

if [ $BUILD_RESULT -eq 0 ]; then
  echo "✅ Build successful"
  echo "📱 App installed on $DEVICE"
else
  echo "❌ Build failed (exit code: $BUILD_RESULT)"
  echo "📄 Check logs: $LOGS_DIR/ios-build.log"
  exit 1
fi
