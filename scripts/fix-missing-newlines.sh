#!/bin/bash

# Fix missing newlines after type declarations
# Pattern: type X = ...type Y = ... → type X = ...\ntype Y = ...

files=(
  "src/app/production/components/EnhancedProductionPage.tsx"
  "src/app/production/components/ProductionFormDialog.tsx"
  "src/app/production/components/ProductionPage.tsx"
  "src/components/ai-chatbot/DataVisualization.tsx"
  "src/components/ingredients/MobileIngredientCard.tsx"
  "src/components/orders/EnhancedOrderForm.tsx"
  "src/components/orders/OrderForm.tsx"
  "src/components/orders/orders-table.tsx"
  "src/components/ui/whatsapp-followup.tsx"
  "src/modules/hpp/components/CostCalculationCard.tsx"
  "src/modules/hpp/components/RecipeSelector.tsx"
  "src/modules/hpp/hooks/useUnifiedHpp.ts"
  "src/modules/inventory/components/SmartReorderSuggestions.tsx"
  "src/modules/inventory/components/StockLevelVisualization.tsx"
  "src/modules/orders/components/OrderDetailView.tsx"
  "src/modules/recipes/hooks/useRecipesData.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing: $file"
    
    # Fix pattern: ]type → ]\ntype
    sed -i '' "s/\]type /]\ntype /g" "$file"
    
    # Fix pattern: ]import → ]\nimport
    sed -i '' "s/\]import /]\nimport /g" "$file"
    
    echo "  ✓ Fixed"
  else
    echo "  ✗ File not found: $file"
  fi
done

echo ""
echo "✅ All files fixed!"
echo "Run: pnpm type-check"
