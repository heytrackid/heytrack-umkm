#!/bin/bash

# Script to fix catch blocks - remove underscore prefix from error variables
# This makes the code cleaner and avoids the need for variable reassignment

echo "🔧 Fixing catch blocks in TypeScript/JavaScript files..."

# Find all .ts and .tsx files in src directory
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
  # Check if file contains catch blocks with underscore
  if grep -q "catch (_err\|catch (_error" "$file"; then
    echo "📝 Fixing: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Replace catch (_error) with catch (error)
    sed -i.tmp 's/catch (_error)/catch (error)/g' "$file"
    
    # Replace catch (_err) with catch (err)
    sed -i.tmp 's/catch (_err)/catch (err)/g' "$file"
    
    # Remove lines that reassign the error variable (const error = _error as Error)
    sed -i.tmp '/const error = _error as Error/d' "$file"
    sed -i.tmp '/const err = _err as Error/d' "$file"
    
    # Clean up temporary files
    rm -f "$file.tmp"
    
    echo "✅ Fixed: $file"
  fi
done

echo ""
echo "🎉 Done! All catch blocks have been fixed."
echo "💡 Backup files created with .bak extension"
echo ""
echo "To remove backup files, run:"
echo "  find src -name '*.bak' -delete"
