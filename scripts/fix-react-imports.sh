#!/bin/bash

# Script to standardize React imports across the codebase
# Converts: import * as React from 'react'
# To: import { useState, useEffect, ... } from 'react'

echo "🔍 Finding files with React namespace imports..."

# Count files before
BEFORE_COUNT=$(find src/app src/components/shared src/contexts -name "*.tsx" -type f -exec grep -l "^import \* as React from 'react'" {} \; 2>/dev/null | wc -l | tr -d ' ')
echo "📊 Found $BEFORE_COUNT files to process"

# Process app pages and components
echo "🔧 Processing app pages..."
find src/app -name "*.tsx" -type f -exec grep -l "^import \* as React from 'react'" {} \; 2>/dev/null | while read -r file; do
  echo "  ✏️  Fixing: $file"
  
  # Check if file already has hook imports
  if grep -q "import { .* } from 'react'" "$file"; then
    # File already has hook imports, just remove the namespace import
    sed -i '' '/^import \* as React from '\''react'\''/d' "$file"
  else
    # Replace namespace import with common hooks
    sed -i '' "s/^import \* as React from 'react'/import { useState, useEffect, useMemo, useCallback } from 'react'/" "$file"
  fi
done

# Process shared components
echo "🔧 Processing shared components..."
find src/components/shared -name "*.tsx" -type f -exec grep -l "^import \* as React from 'react'" {} \; 2>/dev/null | while read -r file; do
  echo "  ✏️  Fixing: $file"
  
  if grep -q "import { .* } from 'react'" "$file"; then
    sed -i '' '/^import \* as React from '\''react'\''/d' "$file"
  else
    sed -i '' "s/^import \* as React from 'react'/import { useState, useEffect, useMemo } from 'react'/" "$file"
  fi
done

# Process contexts
echo "🔧 Processing contexts..."
find src/contexts -name "*.tsx" -type f -exec grep -l "^import \* as React from 'react'" {} \; 2>/dev/null | while read -r file; do
  echo "  ✏️  Fixing: $file"
  
  if grep -q "import { .* } from 'react'" "$file"; then
    sed -i '' '/^import \* as React from '\''react'\''/d' "$file"
  else
    sed -i '' "s/^import \* as React from 'react'/import { createContext, useContext, useState, useEffect } from 'react'/" "$file"
  fi
done

# Process remaining form components
echo "🔧 Processing form components..."
find src/components/forms -name "*.tsx" -type f -exec grep -l "^import \* as React from 'react'" {} \; 2>/dev/null | while read -r file; do
  echo "  ✏️  Fixing: $file"
  
  if grep -q "import { .* } from 'react'" "$file"; then
    sed -i '' '/^import \* as React from '\''react'\''/d' "$file"
  else
    sed -i '' "s/^import \* as React from 'react'/import { useState, useEffect } from 'react'/" "$file"
  fi
done

# Count files after
AFTER_COUNT=$(find src/app src/components/shared src/contexts -name "*.tsx" -type f -exec grep -l "^import \* as React from 'react'" {} \; 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo "✅ Done!"
echo "📊 Files processed: $(($BEFORE_COUNT - $AFTER_COUNT))"
echo "📊 Files remaining: $AFTER_COUNT"
echo ""
echo "Note: UI primitives with Radix UI were intentionally skipped"
