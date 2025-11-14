#!/bin/bash

# Script to fix RLS TypeScript errors by adding type assertions
# This is a workaround for Supabase TypeScript inference issues with RLS

echo "🔧 Fixing RLS TypeScript errors..."

# Find all API route files
find src/app/api -name "*.ts" -type f | while read file; do
  echo "Processing: $file"
  
  # Add 'as never' to .insert() calls that don't have it
  sed -i '' 's/\.insert(\([^)]*\))$/\.insert(\1 as never)/g' "$file" 2>/dev/null || true
  
  # Add 'as never' to .update() calls that don't have it  
  sed -i '' 's/\.update(\([^)]*\))$/\.update(\1 as never)/g' "$file" 2>/dev/null || true
done

echo "✅ Done! Run 'pnpm type-check' to verify."
