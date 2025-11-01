#!/bin/bash
# Master Validation Script - Runs all backend gate validations
# Exit code 0 only if ALL gates pass

set -e

echo "========================================="
echo "MASTER VALIDATION: ALL BACKEND GATES"
echo "========================================="
echo ""

TOTAL_PASS=0
TOTAL_FAIL=0

# Run each gate validation
for gate in backend/validate-b{1,2,3,4}.sh; do
  if [ -f "$gate" ]; then
    echo "Running $(basename $gate)..."
    if bash "$gate"; then
      TOTAL_PASS=$((TOTAL_PASS + 10))
    else
      TOTAL_FAIL=$((TOTAL_FAIL + 10))
    fi
    echo ""
  fi
done

echo "========================================="
echo "FINAL RESULT: $TOTAL_PASS PASSED, $TOTAL_FAIL FAILED"
echo "========================================="

if [ "$TOTAL_FAIL" -eq "0" ]; then
  echo "✅ ALL GATES PASSED"
  exit 0
else
  echo "❌ SOME GATES FAILED"
  exit 1
fi
