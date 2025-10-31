#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOGS_DIR="$PROJECT_ROOT/logs"

echo "🛑 Stopping Metro bundler..."

# Read PID if available
if [ -f "$LOGS_DIR/metro.pid" ]; then
  METRO_PID=$(cat "$LOGS_DIR/metro.pid")
  kill $METRO_PID 2>/dev/null || true
  rm "$LOGS_DIR/metro.pid"
fi

# Kill any remaining Metro processes
pkill -f "react-native.*start" 2>/dev/null || true
pkill -f "metro.*start" 2>/dev/null || true

echo "✅ Metro stopped"
