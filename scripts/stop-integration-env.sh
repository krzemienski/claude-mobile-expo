#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOGS_DIR="$PROJECT_ROOT/logs"

echo "🛑 Stopping Integration Environment..."

# Stop backend
if [ -f "$LOGS_DIR/backend.pid" ]; then
  kill $(cat "$LOGS_DIR/backend.pid") 2>/dev/null || true
  rm "$LOGS_DIR/backend.pid"
fi
pkill -f "node dist/index.js" 2>/dev/null || true
echo "✅ Backend stopped"

# Stop Metro
"$SCRIPT_DIR/stop-metro.sh"

# Terminate app on simulator (but don't close simulator)
pkill -f "Claude Code Mobile" 2>/dev/null || true

echo "✅ Integration environment stopped"
