#!/bin/bash

# Script to fix all React import duplicates
# Handles multiple patterns of duplicate imports

echo "🔧 Fixing all React import duplicates..."

count=0

# Pattern 1: Remove "import React from 'react'"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "import \* as React from 'react'" {} \; | while read file; do
  if grep -q "^import React from 'react'" "$file"; then
    echo "  📝 Pattern 1 - Fixing: $file"
    sed -i.bak "/^import React from 'react'/d" "$file"
    rm -f "${file}.bak"
    count=$((count + 1))
  fi
done

# Pattern 2: Replace "import React, { ... } from 'react'" with "import { ... } from 'react'"
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "import \* as React from 'react'" {} \; | while read file; do
  if grep -q "^import React, {" "$file"; then
    echo "  📝 Pattern 2 - Fixing: $file"
    # Remove "React, " from the import statement
    sed -i.bak "s/^import React, {/import {/" "$file"
    rm -f "${file}.bak"
    count=$((count + 1))
  fi
done

echo ""
echo "✅ All React import duplicates fixed!"
echo "   Fixed $count files"
echo ""
echo "🔄 Restart your dev server to apply changes"
