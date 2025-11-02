#!/bin/bash

# Script to fix common 'any' type patterns in TypeScript files

echo "🔧 Fixing 'any' types in TypeScript files..."

# Find all TS/TSX files
FILES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \))

for file in $FILES; do
  # Replace common patterns
  
  # (e: any) => to (e: React.FormEvent) => for form events
  sed -i '' 's/(e: any) =>/\(e: React.FormEvent\) =>/g' "$file" 2>/dev/null || sed -i 's/(e: any) =>/\(e: React.FormEvent\) =>/g' "$file"
  
  # (error: any) => to (error: unknown) =>
  sed -i '' 's/(error: any)/\(error: unknown\)/g' "$file" 2>/dev/null || sed -i 's/(error: any)/\(error: unknown\)/g' "$file"
  
  # (err: any) => to (err: unknown) =>
  sed -i '' 's/(err: any)/\(err: unknown\)/g' "$file" 2>/dev/null || sed -i 's/(err: any)/\(err: unknown\)/g' "$file"
  
  # (data: any) => to (data: unknown) =>
  sed -i '' 's/(data: any)/\(data: unknown\)/g' "$file" 2>/dev/null || sed -i 's/(data: any)/\(data: unknown\)/g' "$file"
  
  # : any[] => : unknown[]
  sed -i '' 's/: any\[\]/: unknown[]/g' "$file" 2>/dev/null || sed -i 's/: any\[\]/: unknown[]/g' "$file"
  
  # : any) => : unknown)
  sed -i '' 's/: any)/: unknown)/g' "$file" 2>/dev/null || sed -i 's/: any)/: unknown)/g' "$file"
  
  # : any; => : unknown;
  sed -i '' 's/: any;/: unknown;/g' "$file" 2>/dev/null || sed -i 's/: any;/: unknown;/g' "$file"
  
  # : any, => : unknown,
  sed -i '' 's/: any,/: unknown,/g' "$file" 2>/dev/null || sed -i 's/: any,/: unknown,/g' "$file"
  
  # : any> => : unknown>
  sed -i '' 's/: any>/: unknown>/g' "$file" 2>/dev/null || sed -i 's/: any>/: unknown>/g' "$file"
  
  # <any> => <unknown>
  sed -i '' 's/<any>/<unknown>/g' "$file" 2>/dev/null || sed -i 's/<any>/<unknown>/g' "$file"
done

echo "✅ Done! Run 'npx eslint . --ext .ts,.tsx' to check remaining issues."
