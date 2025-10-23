#!/bin/bash

# Script to fix duplicate React imports
# Removes "import React from 'react'" if "import * as React from 'react'" exists

echo "🔧 Fixing duplicate React imports..."

count=0

# Find all files with both imports
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec grep -l "import \* as React from 'react'" {} \; | while read file; do
  if grep -q "^import React from 'react'" "$file"; then
    echo "  📝 Fixing: $file"
    
    # Remove the duplicate "import React from 'react'" line
    sed -i.bak "/^import React from 'react'/d" "$file"
    
    # Remove backup file
    rm -f "${file}.bak"
    
    count=$((count + 1))
  fi
done

echo ""
echo "✅ Duplicate import fixes complete!"
echo "   Fixed $count files"
echo ""
echo "🔄 Restart your dev server to apply changes"
