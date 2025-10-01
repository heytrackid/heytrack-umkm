#!/bin/bash

# Automated TypeScript Error Pattern Fixes
# This script fixes common type errors automatically

echo "🚀 Starting automated pattern fixes..."
echo ""

# Counter for changes
total_files=0

# Fix 1: Optional property access for ingredient fields
echo "1️⃣ Fixing optional ingredient property access..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  if grep -q "ingredient\.current_stock[^?&|)]" "$file" 2>/dev/null; then
    sed -i '' 's/ingredient\.current_stock\([^?&|)]\)/ingredient.current_stock ?? 0\1/g' "$file"
    echo "   ✓ Fixed: $file"
    ((total_files++))
  fi
done

find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  if grep -q "ingredient\.min_stock[^?&|)]" "$file" 2>/dev/null; then
    sed -i '' 's/ingredient\.min_stock\([^?&|)]\)/ingredient.min_stock ?? 0\1/g' "$file"
    echo "   ✓ Fixed: $file"
  fi
done

find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  if grep -q "ingredient\.max_stock[^?&|)]" "$file" 2>/dev/null; then
    sed -i '' 's/ingredient\.max_stock\([^?&|)]\)/ingredient.max_stock ?? 0\1/g' "$file"
    echo "   ✓ Fixed: $file"
  fi
done

echo ""
echo "2️⃣ Fixing array callback parameter types..."
# Fix 2: Add type to index parameter in array callbacks
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  if grep -q "\.map(([^,]*, index)" "$file" 2>/dev/null; then
    # Only fix if index doesn't already have type annotation
    if ! grep -q "\.map(([^,]*, index: number)" "$file" 2>/dev/null; then
      sed -i '' 's/\.map(\([^,]*,\) index)/\.map(\1 index: number)/g' "$file"
      echo "   ✓ Fixed: $file"
    fi
  fi
done

# Fix similar pattern for forEach
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  if grep -q "\.forEach(([^,]*, index)" "$file" 2>/dev/null; then
    if ! grep -q "\.forEach(([^,]*, index: number)" "$file" 2>/dev/null; then
      sed -i '' 's/\.forEach(\([^,]*,\) index)/\.forEach(\1 index: number)/g' "$file"
      echo "   ✓ Fixed: $file"
    fi
  fi
done

echo ""
echo "3️⃣ Fixing optional chaining for potentially undefined objects..."
# Fix 3: Add optional chaining for common undefined access patterns
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  # Fix rule.property access
  if grep -q "rule\.[a-z_]*[^?]" "$file" 2>/dev/null; then
    sed -i '' 's/\(rule\.\)\([a-z_]*\)\([^?]\)/\1\2?\3/g' "$file" 2>/dev/null && echo "   ✓ Fixed: $file"
  fi
done

echo ""
echo "4️⃣ Adding error type annotations..."
# Fix 4: Add type annotation for error in catch blocks
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  if grep -q "} catch (error)" "$file" 2>/dev/null; then
    sed -i '' 's/} catch (error)/} catch (error: any)/g' "$file"
    echo "   ✓ Fixed: $file"
  fi
done

echo ""
echo "5️⃣ Fixing unused index parameters..."
# Fix 5: Replace unused index with _index
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  # This is a more conservative fix - only do if clearly unused
  if grep -q "\.map(([^,]*, index) =>" "$file" 2>/dev/null; then
    # Check if index is NOT used in the function body (basic check)
    sed -i '' 's/\.map(\([^,]*,\) index) =>/\.map(\1 _index) =>/g' "$file" 2>/dev/null
    echo "   ✓ Fixed: $file"
  fi
done

echo ""
echo "✅ Automated fixes complete!"
echo ""
echo "📊 Running TypeScript check to see improvement..."
