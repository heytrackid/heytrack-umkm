#!/bin/bash

# Fix floating promises in useEffect hooks
# This script adds 'void' operator to async function calls in useEffect

echo "Fixing floating promises in useEffect hooks..."

# Find all TypeScript/TSX files with useEffect patterns
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's/useEffect(() => {$/useEffect(() => {/g' \
  -e 's/^\([[:space:]]*\)\([a-zA-Z][a-zA-Z0-9]*\)()$/\1void \2()/g' \
  {} \;

echo "Done! Please review the changes."
