#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEVICE="${1:-iPhone 14}"

echo "🚀 Starting Integration Environment"
echo "===================================="
echo "Device: $DEVICE"
echo ""

# 1. Start backend
echo "⚙️  [1/3] Starting backend server..."
cd "$PROJECT_ROOT/backend"
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
echo "✅ Backend PID: $BACKEND_PID"

# Wait for backend ready
echo "⏳ Waiting for backend..."
timeout 15 bash -c 'until curl -sf http://localhost:3001/health > /dev/null; do sleep 1; done' || {
  echo "❌ Backend failed to start"
  cat ../logs/backend.log | tail -50
  exit 1
}
echo "✅ Backend ready: http://localhost:3001"

# 2. Start Metro
echo ""
echo "⚙️  [2/3] Starting Metro bundler..."
"$SCRIPT_DIR/start-metro.sh"

# 3. Build and launch iOS
echo ""
echo "⚙️  [3/3] Building and launching iOS app..."
"$SCRIPT_DIR/build-ios.sh" "$DEVICE"

echo ""
echo "✅ Integration Environment Ready!"
echo "================================="
echo "🖥️  Backend: http://localhost:3001 (PID: $BACKEND_PID)"
echo "📦 Metro: http://localhost:8081 (expo-mcp enabled)"
echo "📱 iOS: $DEVICE simulator"
echo ""
echo "📄 Logs:"
echo "  - Backend: logs/backend.log"
echo "  - Metro: logs/metro.log"
echo "  - iOS Build: logs/ios-build.log"
echo ""
echo "🛑 To stop: ./scripts/stop-integration-env.sh"
