#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🧪 VALIDATION GATE 3A: Backend Functional Testing"
echo "=================================================="

# Execute test-websocket.sh
"$SCRIPT_DIR/test-websocket.sh"

RESULT=$?

if [ $RESULT -eq 0 ]; then
  echo ""
  echo "✅ VALIDATION GATE 3A: PASSED"
  exit 0
else
  echo ""
  echo "❌ VALIDATION GATE 3A: FAILED"
  exit 1
fi
