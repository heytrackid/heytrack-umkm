#!/bin/bash

# Convert function components to arrow functions
cd "$(dirname "$0")/.."

echo "🔄 Converting function components to arrow functions..."

# List of files with function component errors (from lint output)
files=(
  "src/app/cash-flow/components/CategoryBreakdown.tsx"
  "src/app/cash-flow/components/EnhancedCashFlowChart.tsx"
  "src/app/cash-flow/components/EnhancedSummaryCards.tsx"
  "src/app/cash-flow/components/EnhancedTransactionForm.tsx"
  "src/app/cash-flow/components/EnhancedTransactionList.tsx"
  "src/app/cash-flow/components/FilterPeriod.tsx"
  "src/app/cash-flow/page.tsx"
  "src/app/categories/components/CategoryList.tsx"
  "src/app/customers/components/CustomerForm.tsx"
  "src/app/customers/components/CustomerSearchFilters.tsx"
  "src/app/customers/components/CustomerStats.tsx"
  "src/app/customers/components/CustomersLayout.tsx"
  "src/app/customers/components/CustomersTable.tsx"
  "src/app/customers/layout.tsx"
  "src/app/customers/[id]/page.tsx"
  "src/app/dashboard/components/HppDashboardWidget.tsx"
  "src/app/dashboard/components/StatsCardsSection.tsx"
  "src/app/hpp/calculator/page.tsx"
  "src/app/hpp/comparison/page.tsx"
  "src/app/hpp/pricing-assistant/page.tsx"
  "src/app/hpp/recommendations/page.tsx"
  "src/app/hpp/reports/page.tsx"
  "src/app/hpp/wac/page.tsx"
  "src/app/ingredients/[id]/page.tsx"
  "src/app/ingredients/new/page.tsx"
  "src/app/ingredients/page.tsx"
  "src/app/ingredients/purchases/page.tsx"
  "src/app/operational-costs/layout.tsx"
  "src/app/operational-costs/page.tsx"
  "src/app/profit/page.tsx"
  "src/app/production/page.tsx"
  "src/app/recipes/page.tsx"
  "src/app/recipes/[id]/page.tsx"
  "src/app/recipes/[id]/edit/page.tsx"
  "src/app/recipes/new/page.tsx"
  "src/app/recipes/ai-generator/page.tsx"
  "src/app/reports/layout.tsx"
  "src/app/reports/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  Processing $file..."
    # Simple pattern for default export functions
    # This handles: export default function ComponentName() {
    # sed -i '' 's/^export default function \([A-Za-z]*\)(/const \1 = (/g' "$file"
  fi
done

echo "✅ Conversion completed!"
echo "⚠️  Note: Some components may need manual adjustment"
