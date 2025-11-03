#!/bin/bash

# Quick type check script with summary
# Usage: ./scripts/check-types.sh

echo "🔍 Running TypeScript type check..."
echo ""

# Run tsc and capture output
OUTPUT=$(npx tsc --noEmit 2>&1)
ERROR_COUNT=$(echo "$OUTPUT" | grep "error TS" | wc -l | tr -d ' ')

if [ "$ERROR_COUNT" -eq 0 ]; then
  echo "✅ No TypeScript errors! 🎉"
  exit 0
fi

echo "❌ Found $ERROR_COUNT TypeScript errors"
echo ""
echo "📊 Error breakdown:"
echo "$OUTPUT" | grep "error TS" | cut -d: -f3 | sort | uniq -c | sort -rn | head -10
echo ""
echo "📝 Most affected files:"
echo "$OUTPUT" | grep "error TS" | cut -d'(' -f1 | sort | uniq -c | sort -rn | head -10
echo ""
echo "💡 To see full errors: npx tsc --noEmit"
echo "📚 See TYPE_SAFETY_CHECKLIST.md for fix guide"
