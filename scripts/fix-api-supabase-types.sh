#!/bin/bash

# Script to fix Supabase type issues in API routes
# Replaces pattern: const supabase = await createClient()
# With: const client = await createClient(); const supabase = typed(client)

set -e

echo "🔧 Fixing Supabase type issues in API routes..."

# Find all route.ts files in src/app/api
find src/app/api -name "route.ts" -type f | while read -r file; do
    echo "Processing: $file"
    
    # Check if file needs import update
    if ! grep -q "import.*typed" "$file"; then
        # Add typed import if not present
        if grep -q "from '@/types/type-utilities'" "$file"; then
            # Update existing import
            sed -i.bak "s/import { \(.*\) } from '@\/types\/type-utilities'/import { \1, typed } from '@\/types\/type-utilities'/" "$file"
        elif grep -q "from '@/types/database'" "$file"; then
            # Update database import
            sed -i.bak "s/import.*from '@\/types\/database'/&\nimport { typed } from '@\/types\/type-utilities'/" "$file"
        else
            # Add new import after other imports
            sed -i.bak "/^import/a\\
import { typed } from '@/types/type-utilities'
" "$file"
        fi
    fi
    
    # Replace supabase client pattern
    # Pattern 1: const supabase = await createClient()
    sed -i.bak 's/const supabase = await createClient()/const client = await createClient()\n    const supabase = typed(client)/g' "$file"
    
    # Pattern 2: Fix auth calls to use client instead of supabase
    sed -i.bak 's/await supabase\.auth\.getUser()/await client.auth.getUser()/g' "$file"
    
    # Remove backup files
    rm -f "${file}.bak"
done

echo "✅ Done! Fixed all API routes."
echo "Run 'pnpm tsc --noEmit' to verify fixes."
