#!/bin/bash

# Script to fix API routes authentication
# Adds Stack Auth imports and fixes auth patterns

echo "Fixing API routes authentication..."

# Find all route.ts files in src/app/api
find src/app/api -name "route.ts" -type f | while read file; do
  echo "Processing: $file"
  
  # Check if file needs fixing (has createClient but no requireAuth)
  if grep -q "createClient" "$file" && ! grep -q "requireAuth" "$file"; then
    # Add import after existing imports
    if grep -q "import.*@/lib/logger" "$file"; then
      sed -i '' '/import.*@\/lib\/logger/a\
import { requireAuth, isErrorResponse } from '"'"'@/lib/api-auth'"'"'
' "$file"
    fi
    
    echo "  ✓ Added auth imports to $file"
  fi
done

echo "Done! Please review changes and run type-check."
