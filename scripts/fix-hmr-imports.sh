#!/bin/bash

# Script to fix HMR issues by adding React namespace import
# This prevents module factory deletion errors in Next.js 16 Turbopack

echo "🔧 Fixing HMR imports in client components..."

count=0

# Find all files with 'use client' that import from 'react'
# and don't already have 'import * as React'

find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "'use client'" {} \; | while read file; do
  # Check if file imports from react but doesn't have React namespace import
  if grep -q "from 'react'" "$file" && ! grep -q "import \* as React" "$file"; then
    echo "  📝 Fixing: $file"
    
    # Use sed to add import after 'use client' line
    # This is more reliable than awk for this use case
    sed -i.bak "/^'use client'/a\\
import * as React from 'react'
" "$file"
    
    # Remove backup file
    rm -f "${file}.bak"
    
    count=$((count + 1))
  fi
done

echo ""
echo "✅ HMR import fixes complete!"
echo "   Fixed $count files"
echo ""
echo "📋 Summary:"
echo "   - Added 'import * as React from react' to client components"
echo "   - This prevents module factory deletion during HMR"
echo ""
echo "🔄 Please restart your dev server for changes to take effect"
