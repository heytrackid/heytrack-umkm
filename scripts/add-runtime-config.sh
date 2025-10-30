#!/bin/bash

# Script to add runtime = 'nodejs' to all API routes
# This fixes jsdom/DOMPurify compatibility issues in Vercel Edge Runtime

echo "Adding runtime = 'nodejs' to all API routes..."

# Find all route.ts files in src/app/api
find src/app/api -name "route.ts" -type f | while read -r file; do
  # Check if file already has runtime export
  if grep -q "export const runtime" "$file"; then
    echo "⏭️  Skipping $file (already has runtime config)"
  else
    echo "✅ Adding runtime config to $file"
    
    # Find the line number of the first import
    first_import_line=$(grep -n "^import" "$file" | head -1 | cut -d: -f1)
    
    if [ -n "$first_import_line" ]; then
      # Find the last import line
      last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
      
      # Add runtime config after last import with proper spacing
      sed -i.bak "${last_import_line}a\\
\\
// ✅ Force Node.js runtime (required for DOMPurify/jsdom)\\
export const runtime = 'nodejs'
" "$file"
      
      # Remove backup file
      rm "${file}.bak"
    else
      echo "⚠️  Warning: No imports found in $file"
    fi
  fi
done

echo ""
echo "✅ Done! All API routes now have runtime = 'nodejs'"
echo ""
echo "Files modified:"
find src/app/api -name "route.ts" -type f -exec grep -l "export const runtime" {} \; | wc -l
