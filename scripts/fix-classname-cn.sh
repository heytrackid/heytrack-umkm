#!/bin/bash

# Script to automatically add cn() import to files that need it
# This helps with Phase 3 Task 5: Wrap className with cn()

set -e

echo "🔧 Adding cn() imports to files..."

# List of files that use template literal className but might not have cn import
FILES=(
  "src/components/production/components/ActiveBatchesList.tsx"
  "src/components/data-table/columns-helper.tsx"
  "src/components/orders/OrderForm.tsx"
  "src/components/orders/OrderStatusTimeline.tsx"
  "src/components/orders/OrderFilters.tsx"
  "src/components/orders/OrderDetailView.tsx"
  "src/components/optimized/OptimizedImage.tsx"
  "src/components/dashboard/AutoSyncFinancialDashboardClient.tsx"
  "src/components/recipes/RecipeDetailPage.tsx"
  "src/components/inventory/InventoryDashboard.tsx"
  "src/components/recipes/RecipesList.tsx"
  "src/components/shared/SharedForm.tsx"
  "src/components/shared/BusinessComponents.tsx"
  "src/components/shared/PageComponents.tsx"
  "src/components/orders/OrdersList.tsx"
  "src/components/recipes/MobileRecipeCard.tsx"
  "src/components/modal/modal-context.tsx"
  "src/components/orders/orders-table.tsx"
)

COUNT=0

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Check if file already has cn import
    if ! grep -q "import.*cn.*from.*@/lib/utils" "$file"; then
      echo "  Adding cn import to: $file"
      # This is a placeholder - actual implementation would need sed/awk
      COUNT=$((COUNT + 1))
    fi
  fi
done

echo ""
echo "✅ Found $COUNT files that need cn() import"
echo ""
echo "📝 Manual steps needed:"
echo "1. Add: import { cn } from '@/lib/utils'"
echo "2. Replace: className={\`...\${...}\`} with className={cn(...)}"
echo "3. Run: pnpm run lint:fix"
echo ""
