#!/bin/bash

# Comprehensive script to fix all React reference issues
# Adds React import to files that use React.* but don't have import

echo "🔧 Fixing React references..."

count=0

# Find files that use React. but don't have React imported
find src -type f \( -name "*.tsx" -o -name "*.ts" \) | while read file; do
  # Check if file uses React. (like React.memo, React.FC, React.FormEvent, etc)
  if grep -q "React\." "$file" && ! grep -q "import.*React" "$file"; then
    echo "  📝 Fixing: $file"
    
    # Check if file has 'use client'
    if grep -q "'use client'" "$file"; then
      # Add import after 'use client'
      sed -i.bak "/^'use client'/a\\
import * as React from 'react'
" "$file"
    else
      # Add import at the beginning
      sed -i.bak "1i\\
import * as React from 'react'
" "$file"
    fi
    
    rm -f "${file}.bak"
    count=$((count + 1))
  fi
done

echo ""
echo "✅ React reference fixes complete!"
echo "   Fixed $count files"
echo ""
echo "🔄 Restart your dev server to apply changes"
