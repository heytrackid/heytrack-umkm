#!/bin/bash

# Script to automatically add missing type imports
# Usage: ./scripts/fix-type-imports.sh

echo "🔍 Finding files that need type imports..."

# Find files using JsonValue, DataObject, or CatchError without importing them
FILES=$(grep -rl "JsonValue\|DataObject\|CatchError" src --include="*.ts" --include="*.tsx" | \
  xargs -I {} sh -c 'grep -L "from.*type-utilities" {} 2>/dev/null' | \
  grep -v "type-utilities.ts")

if [ -z "$FILES" ]; then
  echo "✅ No files need type imports!"
  exit 0
fi

echo "📝 Files to fix:"
echo "$FILES"
echo ""

read -p "Do you want to add imports to these files? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Cancelled"
  exit 1
fi

# Add import to each file
for file in $FILES; do
  echo "📝 Fixing: $file"
  
  # Check if file already has imports
  if grep -q "^import" "$file"; then
    # Find the last import line and add after it
    awk '/^import/ {last=NR} last && NR==last+1 && !done {print "import type { JsonValue, DataObject, CatchError } from '\''@/types/type-utilities'\''"; done=1} {print}' "$file" > "$file.tmp"
    mv "$file.tmp" "$file"
  else
    # No imports, add at top
    echo "import type { JsonValue, DataObject, CatchError } from '@/types/type-utilities'" | cat - "$file" > "$file.tmp"
    mv "$file.tmp" "$file"
  fi
done

echo ""
echo "✅ Done! Run 'npx tsc --noEmit' to check for remaining errors."
