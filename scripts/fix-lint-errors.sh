#!/bin/bash

# Batch fix common lint errors
cd "$(dirname "$0")/.."

echo "🔧 Fixing lint errors in batch..."

# Fix 1: Remove @ts-nocheck from non-critical files
echo "Removing @ts-nocheck directives..."
find src/components src/lib/validations src/lib/communications src/lib/automation src/hooks -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "^// @ts-nocheck" "$file"; then
    sed -i '' '/^\/\/ @ts-nocheck/d' "$file"
    echo "  ✓ Removed @ts-nocheck from $file"
  fi
done

# Fix 2: Prefix unused Database imports with _
echo "Fixing unused Database type imports..."
find src/modules/orders/services src/modules/inventory/services -name "*.ts" | while read file; do
  if grep -q "import type { Database" "$file"; then
    sed -i '' 's/import type { Database,/import type { /g' "$file"
    sed -i '' 's/import type { Database }/\/\/ Database type not needed/g' "$file"
    echo "  ✓ Fixed $file"
  fi
done

# Fix 3: Convert function components to arrow functions (simple cases)
echo "Converting simple function components to arrow functions..."
find src/app/customers src/app/recipes src/app/ingredients -name "*.tsx" | while read file; do
  if grep -q "^export default function.*Page()" "$file"; then
    # This is a simple sed - may need manual verification
    echo "  ⚠ Found function component in $file - needs manual conversion"
  fi
done

# Fix 4: Prefix unused caught errors with _
echo "Fixing unused caught errors..."
find src -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' 's/} catch (err) {/} catch (_err) {/g' "$file"
  sed -i '' 's/} catch (error) {$/} catch (_error) {/g' "$file"  sed -i '' 's/} catch (e) {/} catch (_e) {/g' "$file"
done

echo "✅ Batch fixes completed!"
echo "Run 'npm run lint' to check remaining errors"
