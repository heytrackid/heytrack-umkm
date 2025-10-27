#!/bin/bash

# Script to remove unnecessary React imports from all files
# For Next.js 16 with automatic JSX transform

echo "🔧 Fixing unnecessary React imports..."

# Counter
fixed=0

# Find all TypeScript/TSX files with "import React from 'react'"
files=$(rg -l "import React from ['\"]react['\"]" src/ --type ts --type tsx 2>/dev/null || true)

if [ -z "$files" ]; then
  echo "✅ No files found with unnecessary React imports"
  exit 0
fi

echo "Found files to fix:"
echo "$files"
echo ""

# Process each file
for file in $files; do
  echo "Processing: $file"
  
  # Check if file uses React.* methods (React.useState, React.useEffect, etc)
  if grep -q "React\." "$file"; then
    echo "  ⚠️  Skipping - uses React.* methods (needs manual fix)"
    continue
  fi
  
  # Remove "import React from 'react'" line
  # Handle both single and double quotes
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "/^import React from ['\"]react['\"]$/d" "$file"
  else
    # Linux
    sed -i "/^import React from ['\"]react['\"]$/d" "$file"
  fi
  
  ((fixed++))
  echo "  ✅ Fixed"
done

echo ""
echo "✨ Done! Fixed $fixed files"
echo ""
echo "⚠️  Note: Files using React.* methods need manual fixing:"
echo "   Replace React.useState → useState"
echo "   Replace React.useEffect → useEffect"
echo "   etc."
