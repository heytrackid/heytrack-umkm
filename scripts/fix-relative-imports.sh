#!/bin/bash
# Automated script to convert relative imports to absolute imports
# Following AGENTS.md guideline: "Absolute only, group external→internal→types"

echo "🔧 Converting relative imports to absolute..."
echo "This will modify 163 files with relative imports"
echo ""

# Confirm before proceeding
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Counter
fixed=0
total=0

# Find all TS/TSX files
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
  # Skip node_modules and .next
  if [[ "$file" == *"node_modules"* ]] || [[ "$file" == *".next"* ]]; then
    continue
  fi
  
  total=$((total + 1))
  
  # Backup original
  cp "$file" "$file.bak"
  
  # Convert common relative import patterns to absolute
  # Pattern: ../../../lib → @/lib
  sed -i '' \
    -e "s|from ['\"]\.\.\/\.\.\/\.\./lib|from '@/lib|g" \
    -e "s|from ['\"]\.\.\/\.\./lib|from '@/lib|g" \
    -e "s|from ['\"]\.\.\/lib|from '@/lib|g" \
    -e "s|from ['\"]\.\.\/\.\.\/\.\./components|from '@/components|g" \
    -e "s|from ['\"]\.\.\/\.\./components|from '@/components|g" \
    -e "s|from ['\"]\.\.\/components|from '@/components|g" \
    -e "s|from ['\"]\.\.\/\.\.\/\.\./hooks|from '@/hooks|g" \
    -e "s|from ['\"]\.\.\/\.\./hooks|from '@/hooks|g" \
    -e "s|from ['\"]\.\.\/hooks|from '@/hooks|g" \
    -e "s|from ['\"]\.\.\/\.\.\/\.\./types|from '@/types|g" \
    -e "s|from ['\"]\.\.\/\.\./types|from '@/types|g" \
    -e "s|from ['\"]\.\.\/types|from '@/types|g" \
    -e "s|from ['\"]\.\.\/\.\.\/\.\./utils|from '@/utils|g" \
    -e "s|from ['\"]\.\.\/\.\./utils|from '@/utils|g" \
    -e "s|from ['\"]\.\.\/utils|from '@/utils|g" \
    -e "s|from ['\"]\.\.\/\.\.\/\.\./services|from '@/services|g" \
    -e "s|from ['\"]\.\.\/\.\./services|from '@/services|g" \
    -e "s|from ['\"]\.\.\/services|from '@/services|g" \
    -e "s|from ['\"]\.\.\/\.\.\/\.\./modules|from '@/modules|g" \
    -e "s|from ['\"]\.\.\/\.\./modules|from '@/modules|g" \
    -e "s|from ['\"]\.\.\/modules|from '@/modules|g" \
    -e "s|from ['\"]\.\.\/\.\.\/\.\./app|from '@/app|g" \
    -e "s|from ['\"]\.\.\/\.\./app|from '@/app|g" \
    -e "s|from ['\"]\.\.\/app|from '@/app|g" \
    -e "s|from ['\"]\.\.\/\.\.\/\.\./shared|from '@/shared|g" \
    -e "s|from ['\"]\.\.\/\.\./shared|from '@/shared|g" \
    -e "s|from ['\"]\.\.\/shared|from '@/shared|g" \
    "$file"
  
  # Check if file changed
  if ! cmp -s "$file" "$file.bak"; then
    echo "✅ Fixed: $file"
    fixed=$((fixed + 1))
  fi
  
  # Remove backup
  rm "$file.bak"
done

echo ""
echo "🎉 Done!"
echo "Fixed: $fixed files"
echo ""
echo "Next steps:"
echo "1. Run: npm run lint"
echo "2. Run: npm run type-check"
echo "3. If issues, rollback with: git checkout src/"
echo ""
echo "📝 Note: Some imports might need manual adjustment if they reference"
echo "   same-directory files (./file) - these are kept as-is."
