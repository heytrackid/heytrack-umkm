#!/bin/bash

# Script to migrate all Link imports to PrefetchLink
# Usage: bash scripts/migrate-to-prefetch-link.sh

echo "🚀 Starting prefetch migration..."

# Array of files to update
files=(
  "src/app/cash-flow/page.tsx"
  "src/app/customers/page.tsx"
  "src/app/categories/page.tsx"
  "src/app/resep/page.tsx"
  "src/app/hpp/page.tsx"
  "src/app/settings/page.tsx"
  "src/app/ingredients/page.tsx"
  "src/app/ingredients/new/page.tsx"
  "src/app/orders/page-new.tsx"
  "src/app/operational-costs/page.tsx"
  "src/app/ai/page.tsx"
  "src/app/ai/chat/page.tsx"
  "src/app/ai/insights/page.tsx"
  "src/app/ai/pricing/page.tsx"
  "src/app/ai/components/AIQuickActions.tsx"
  "src/app/settings/whatsapp-templates/page.tsx"
)

# Counter
updated=0
skipped=0

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Processing: $file"
    
    # Check if file already uses PrefetchLink
    if grep -q "PrefetchLink" "$file"; then
      echo "  ✅ Already using PrefetchLink, skipping..."
      ((skipped++))
      continue
    fi
    
    # Check if file uses Link
    if ! grep -q "import.*Link.*from.*'next/link'" "$file" && ! grep -q 'import.*Link.*from.*"next/link"' "$file"; then
      echo "  ⚠️  No Link import found, skipping..."
      ((skipped++))
      continue
    fi
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Replace Link import with PrefetchLink
    sed -i '' "s/import Link from 'next\/link'/import PrefetchLink from '@\/components\/ui\/prefetch-link'/g" "$file"
    sed -i '' 's/import Link from "next\/link"/import PrefetchLink from "@\/components\/ui\/prefetch-link"/g' "$file"
    
    # Replace <Link with <PrefetchLink
    sed -i '' 's/<Link /<PrefetchLink /g' "$file"
    sed -i '' 's/<\/Link>/<\/PrefetchLink>/g' "$file"
    
    echo "  ✅ Updated!"
    ((updated++))
  else
    echo "  ❌ File not found: $file"
  fi
done

echo ""
echo "🎉 Migration complete!"
echo "  Updated: $updated files"
echo "  Skipped: $skipped files"
echo ""
echo "📋 Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Test the app: npm run dev"
echo "  3. If issues occur, restore backups: find . -name '*.backup' -exec bash -c 'mv \"\$0\" \"\${0%.backup}\"' {} \;"
echo ""
