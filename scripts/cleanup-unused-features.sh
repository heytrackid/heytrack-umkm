#!/bin/bash

# Cleanup Script untuk Hapus Fitur Unused
# Run: bash cleanup-unused-features.sh

set -e

echo "🧹 Starting cleanup of unused features..."
echo ""

# Backup dulu
echo "📦 Creating backup..."
git add -A
git commit -m "Backup before cleanup unused features" || echo "Nothing to commit"

echo ""
echo "==================================="
echo "STEP 1: Hapus Route Duplikat"
echo "==================================="

# 1. Hapus inventory route (sudah redirect ke ingredients)
if [ -d "src/app/inventory" ]; then
  echo "❌ Removing src/app/inventory (redirect page)"
  rm -rf src/app/inventory
  echo "✅ Removed src/app/inventory"
else
  echo "⏭️  src/app/inventory already removed"
fi

echo ""
echo "==================================="
echo "STEP 2: Cleanup Type Definitions"
echo "==================================="

# 2. Remove unused type exports dari database.ts
echo "⚠️  Manual action required:"
echo "   Edit src/types/database.ts and remove:"
echo "   - export type ConversationSession = Tables<'conversation_sessions'>"
echo "   - export type ConversationHistory = Tables<'conversation_history'>"
echo "   - export type ConversationSessionInsert = TablesInsert<'conversation_sessions'>"
echo "   - export type ConversationHistoryInsert = TablesInsert<'conversation_history'>"
echo ""
echo "   These types are NOT used in codebase (only conversationHistory as property name)"

echo ""
echo "==================================="
echo "STEP 3: Database Cleanup (Manual)"
echo "==================================="

echo "⚠️  Manual action required in Supabase:"
echo ""
echo "Run these SQL commands in Supabase SQL Editor:"
echo ""
echo "-- 1. Check if tables have data"
echo "SELECT COUNT(*) as conversation_sessions_count FROM conversation_sessions;"
echo "SELECT COUNT(*) as conversation_history_count FROM conversation_history;"
echo ""
echo "-- 2. If counts are 0 or tables are unused, drop them"
echo "DROP TABLE IF EXISTS conversation_sessions CASCADE;"
echo "DROP TABLE IF EXISTS conversation_history CASCADE;"
echo ""
echo "-- 3. Regenerate types after dropping tables"
echo "-- Then run: pnpm supabase:types"

echo ""
echo "==================================="
echo "STEP 4: Verify Changes"
echo "==================================="

echo "Running type check..."
pnpm type-check || echo "⚠️  Type errors found - review manually"

echo ""
echo "Running lint..."
pnpm lint || echo "⚠️  Lint errors found - review manually"

echo ""
echo "==================================="
echo "✅ Cleanup Complete!"
echo "==================================="
echo ""
echo "Summary of changes:"
echo "  ❌ Removed: src/app/inventory (redirect page)"
echo "  ⚠️  Manual: Remove unused types from src/types/database.ts"
echo "  ⚠️  Manual: Drop unused tables in Supabase"
echo ""
echo "Next steps:"
echo "  1. Review type errors (if any)"
echo "  2. Remove unused types from database.ts"
echo "  3. Drop unused tables in Supabase"
echo "  4. Run: pnpm supabase:types"
echo "  5. Test the application"
echo "  6. Commit changes: git add -A && git commit -m 'cleanup: remove unused features'"
echo ""
