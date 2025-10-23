#!/bin/bash

# Master script to fix all HMR issues in Next.js 16 Turbopack
# Runs all fix scripts in the correct order

echo "🚀 Starting comprehensive HMR fixes..."
echo ""

# Step 1: Add React namespace import to all 'use client' files
echo "📦 Step 1/4: Adding React namespace imports..."
./scripts/fix-hmr-imports.sh
echo ""

# Step 2: Fix duplicate React imports
echo "🔄 Step 2/4: Fixing duplicate imports..."
./scripts/fix-all-react-imports.sh
echo ""

# Step 3: Fix React references (React.memo, React.FC, etc)
echo "🔗 Step 3/4: Fixing React references..."
./scripts/fix-react-references.sh
echo ""

# Step 4: Verify fixes
echo "✅ Step 4/4: Verifying fixes..."
echo ""

# Count remaining issues
client_files=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "'use client'" {} \; | wc -l)
react_imports=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "import \* as React" {} \; | wc -l)
duplicates=$(find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "import \* as React from 'react'" {} \; | xargs grep -l "import React," 2>/dev/null | wc -l)
missing_refs=$(find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "React\." | while read file; do if ! grep -q "import.*React" "$file"; then echo "$file"; fi; done | wc -l)

echo "📊 Results:"
echo "   - Client components: $client_files"
echo "   - Files with React namespace import: $react_imports"
echo "   - Duplicate imports remaining: $duplicates"
echo "   - Missing React references: $missing_refs"
echo ""

if [ "$duplicates" -eq 0 ] && [ "$missing_refs" -eq 0 ]; then
  echo "🎉 All HMR issues fixed!"
  echo ""
  echo "Next steps:"
  echo "  1. Clear cache: rm -rf .next"
  echo "  2. Restart dev server: pnpm dev"
  echo "  3. Test HMR by editing any file"
else
  echo "⚠️  Some issues may remain. Please review manually."
fi

echo ""
echo "📖 For more info, see:"
echo "   - docs/HMR_ERROR_ROOT_CAUSE.md"
echo "   - HMR_FIX_COMPLETE.md"
