#!/bin/bash

# Script to replace console.log with Pino logger
# This will help identify files that need manual updates

echo "🔍 Finding console.log statements..."

# Find all console.log in src directory
echo ""
echo "📁 Files with console.log:"
echo "=========================="

grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" -l | while read file; do
  count=$(grep -c "console\.log" "$file")
  echo "  $file ($count occurrences)"
done

echo ""
echo "📊 Summary by directory:"
echo "========================"

echo ""
echo "🔧 Automation Engine:"
grep -c "console\.log" src/lib/automation-engine.ts 2>/dev/null || echo "  0 occurrences"

echo ""
echo "⏰ Cron Jobs:"
grep -c "console\.log" src/lib/cron-jobs.ts 2>/dev/null || echo "  0 occurrences"

echo ""
echo "📦 Services:"
find src/services -name "*.ts" -exec grep -l "console\.log" {} \; | wc -l

echo ""
echo "🎯 Modules:"
find src/modules -name "*.tsx" -exec grep -l "console\.log" {} \; | wc -l

echo ""
echo "💡 Recommendation:"
echo "   Replace console.log with:"
echo "   import { logger } from '@/lib/logger'"
echo "   logger.debug('message', { data })"
