#!/bin/bash

# TypeScript Error Fix Script
# Fixes common TypeScript errors automatically

echo "🔧 Fixing TypeScript Errors..."
echo ""

# Count initial errors
INITIAL_ERRORS=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l | tr -d ' ')
echo "📊 Initial errors: $INITIAL_ERRORS"
echo ""

# Fix 1: Replace .errors with .issues in Zod validation
echo "✅ Fix 1: Zod validation (.errors → .issues)"
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/error\.errors\.map/error.issues.map/g'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/\.errors\s*\?/\.issues?/g'
echo "   Done!"
echo ""

# Fix 2: Add missing React imports where JSX is used
echo "✅ Fix 2: Adding missing React imports"
# This would need more complex logic, skipping for now
echo "   Skipped (manual fix needed)"
echo ""

# Fix 3: Fix duplicate imports
echo "✅ Fix 3: Removing duplicate imports"
# Already done manually
echo "   Done!"
echo ""

# Fix 4: Add @ts-expect-error for complex type issues
echo "✅ Fix 4: Adding @ts-expect-error comments"
# This needs manual review
echo "   Skipped (manual review needed)"
echo ""

# Count final errors
FINAL_ERRORS=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l | tr -d ' ')
FIXED=$((INITIAL_ERRORS - FINAL_ERRORS))

echo ""
echo "📊 Results:"
echo "   Initial errors: $INITIAL_ERRORS"
echo "   Final errors: $FINAL_ERRORS"
echo "   Fixed: $FIXED errors"
echo ""

if [ $FIXED -gt 0 ]; then
  echo "✅ Successfully fixed $FIXED errors!"
else
  echo "⚠️  No errors were fixed automatically"
fi

echo ""
echo "🔍 Remaining error categories:"
npx tsc --noEmit 2>&1 | grep "error TS" | cut -d':' -f4 | sort | uniq -c | sort -rn | head -10
