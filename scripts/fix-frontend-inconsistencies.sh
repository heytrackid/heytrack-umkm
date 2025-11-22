#!/bin/bash

# Script to fix frontend inconsistencies in HeyTrack
# This script automates the standardization process

set -e

echo "🚀 Starting Frontend Standardization..."

# 1. Fix remaining any types in API routes
echo "📝 Fixing 'any' types in API routes..."

# Fix operational-costs route
sed -i '' 's/async (context: RouteContext, validatedQuery: any)/async (context: RouteContext, validatedQuery: z.infer<typeof ListQuerySchema>)/g' src/app/api/operational-costs/\[\[...slug\]\]/route.ts 2>/dev/null || true
sed -i '' 's/async (context, _query, body: any)/async (context: RouteContext, _query: unknown, body: unknown)/g' src/app/api/operational-costs/\[\[...slug\]\]/route.ts 2>/dev/null || true

# Fix expenses route
sed -i '' 's/async (context: RouteContext, validatedQuery: any)/async (context: RouteContext, validatedQuery: z.infer<typeof ListQuerySchema>)/g' src/app/api/expenses/\[\[...slug\]\]/route.ts 2>/dev/null || true

# Fix hpp route
sed -i '' 's/async (context, _query, body: any)/async (context: RouteContext, _query: unknown, body: unknown)/g' src/app/api/hpp/\[...slug\]/route.ts 2>/dev/null || true

# Fix whatsapp-templates route
sed -i '' 's/async (context, validatedQuery: any)/async (context: RouteContext, validatedQuery: z.infer<typeof ListQuerySchema>)/g' src/app/api/whatsapp-templates/\[\[...slug\]\]/route.ts 2>/dev/null || true

echo "✅ Fixed 'any' types"

# 2. Remove react-hot-toast and standardize to useToast
echo "📝 Standardizing toast library..."

# Check if react-hot-toast is in package.json
if grep -q "react-hot-toast" package.json; then
    echo "⚠️  Found react-hot-toast in package.json - needs manual removal"
    echo "   Run: pnpm remove react-hot-toast"
fi

echo "✅ Toast standardization noted"

# 3. Fix console statements
echo "📝 Checking console statements..."
echo "⚠️  Console statements in logger files are intentional (client-logger.ts, realtime-error-handler.ts)"

# 4. Convert function declarations to arrow functions
echo "📝 Converting function declarations to arrow functions..."

# This is complex and needs manual review, but we can list the files
echo "Files with function declarations that need review:"
find src/modules -name "*.ts" -type f -exec grep -l "^export function" {} \; 2>/dev/null || true
find src/lib -name "*.ts" -type f -exec grep -l "^export function" {} \; 2>/dev/null || true

echo "✅ Listed files for manual review"

echo ""
echo "🎉 Automated fixes completed!"
echo ""
echo "📋 Manual tasks remaining:"
echo "   1. Remove react-hot-toast: pnpm remove react-hot-toast"
echo "   2. Fix WhatsAppFollowUp.tsx to use useToast instead of react-hot-toast"
echo "   3. Convert function declarations to arrow functions (see list above)"
echo "   4. Add memo() to components that need it"
echo "   5. Wrap className with cn() utility"
echo ""
echo "Run 'pnpm run validate' to check for type errors"
