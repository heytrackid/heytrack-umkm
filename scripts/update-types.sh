#!/bin/bash

# Script to update type imports from supabase-generated to database.ts
# This script updates all files to use the new centralized type exports

echo "🔄 Updating type imports across the codebase..."

# Find all TypeScript files in src directory
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
  # Skip the generated types file itself
  if [[ "$file" == *"supabase-generated.ts"* ]] || [[ "$file" == *"database.ts"* ]]; then
    continue
  fi
  
  # Check if file imports from supabase-generated
  if grep -q "from '@/types/supabase-generated'" "$file"; then
    echo "📝 Updating: $file"
    
    # Create a backup
    cp "$file" "$file.bak"
    
    # Replace common type imports
    # Note: These are the most common patterns, specific cases may need manual review
    
    # Replace Insert<'table'> with specific types
    sed -i '' "s/Insert<'ingredients'>/IngredientInsert/g" "$file"
    sed -i '' "s/Insert<'recipes'>/RecipeInsert/g" "$file"
    sed -i '' "s/Insert<'recipe_ingredients'>/RecipeIngredientInsert/g" "$file"
    sed -i '' "s/Insert<'orders'>/OrderInsert/g" "$file"
    sed -i '' "s/Insert<'order_items'>/OrderItemInsert/g" "$file"
    sed -i '' "s/Insert<'customers'>/CustomerInsert/g" "$file"
    sed -i '' "s/Insert<'productions'>/ProductionInsert/g" "$file"
    sed -i '' "s/Insert<'production_batches'>/ProductionBatchInsert/g" "$file"
    sed -i '' "s/Insert<'financial_records'>/FinancialRecordInsert/g" "$file"
    sed -i '' "s/Insert<'operational_costs'>/OperationalCostInsert/g" "$file"
    sed -i '' "s/Insert<'notifications'>/NotificationInsert/g" "$file"
    sed -i '' "s/Insert<'suppliers'>/SupplierInsert/g" "$file"
    sed -i '' "s/Insert<'whatsapp_templates'>/WhatsAppTemplateInsert/g" "$file"
    sed -i '' "s/Insert<'hpp_recommendations'>/HppRecommendationInsert/g" "$file"
    sed -i '' "s/Insert<'ingredient_purchases'>/IngredientPurchaseInsert/g" "$file"
    sed -i '' "s/Insert<'stock_reservations'>/StockReservationInsert/g" "$file"
    sed -i '' "s/Insert<'stock_transactions'>/StockTransactionInsert/g" "$file"
    
    # Replace Update<'table'> with specific types
    sed -i '' "s/Update<'ingredients'>/IngredientUpdate/g" "$file"
    sed -i '' "s/Update<'recipes'>/RecipeUpdate/g" "$file"
    sed -i '' "s/Update<'orders'>/OrderUpdate/g" "$file"
    sed -i '' "s/Update<'customers'>/CustomerUpdate/g" "$file"
    sed -i '' "s/Update<'productions'>/ProductionUpdate/g" "$file"
    sed -i '' "s/Update<'production_batches'>/ProductionBatchUpdate/g" "$file"
    sed -i '' "s/Update<'financial_records'>/FinancialRecordUpdate/g" "$file"
    sed -i '' "s/Update<'operational_costs'>/OperationalCostUpdate/g" "$file"
    sed -i '' "s/Update<'notifications'>/NotificationUpdate/g" "$file"
    sed -i '' "s/Update<'suppliers'>/SupplierUpdate/g" "$file"
    sed -i '' "s/Update<'whatsapp_templates'>/WhatsAppTemplateUpdate/g" "$file"
    
    # Replace Row<'table'> with specific types
    sed -i '' "s/Row<'ingredients'>/Ingredient/g" "$file"
    sed -i '' "s/Row<'recipes'>/Recipe/g" "$file"
    sed -i '' "s/Row<'recipe_ingredients'>/RecipeIngredient/g" "$file"
    sed -i '' "s/Row<'orders'>/Order/g" "$file"
    sed -i '' "s/Row<'order_items'>/OrderItem/g" "$file"
    sed -i '' "s/Row<'customers'>/Customer/g" "$file"
    sed -i '' "s/Row<'productions'>/Production/g" "$file"
    sed -i '' "s/Row<'production_batches'>/ProductionBatch/g" "$file"
    sed -i '' "s/Row<'financial_records'>/FinancialRecord/g" "$file"
    sed -i '' "s/Row<'operational_costs'>/OperationalCost/g" "$file"
    sed -i '' "s/Row<'notifications'>/Notification/g" "$file"
    sed -i '' "s/Row<'suppliers'>/Supplier/g" "$file"
    
    # Replace table-specific types
    sed -i '' "s/IngredientsTable/Ingredient/g" "$file"
    sed -i '' "s/RecipesTable/Recipe/g" "$file"
    sed -i '' "s/OrdersTable/Order/g" "$file"
    sed -i '' "s/CustomersTable/Customer/g" "$file"
    sed -i '' "s/NotificationsTable/Notification/g" "$file"
    sed -i '' "s/HppRecommendationsTable/HppRecommendation/g" "$file"
    sed -i '' "s/OperationalCostsTable/OperationalCost/g" "$file"
    sed -i '' "s/IngredientPurchasesTable/IngredientPurchase/g" "$file"
    
    # Replace enum types
    sed -i '' "s/OrderStatus/OrderStatus/g" "$file"
    sed -i '' "s/PaymentMethod/PaymentMethod/g" "$file"
    sed -i '' "s/ProductionStatus/ProductionStatus/g" "$file"
    sed -i '' "s/RecordType/RecordType/g" "$file"
    sed -i '' "s/TransactionType/TransactionType/g" "$file"
    
    # Update import statements - this is tricky, needs careful handling
    # We'll do a simple replacement for now
    if grep -q "import type.*from '@/types/supabase-generated'" "$file"; then
      echo "  ⚠️  Manual review needed for import statement in: $file"
    fi
  fi
done

echo "✅ Type updates complete!"
echo "⚠️  Please review files marked for manual review"
echo "💡 Run 'pnpm type-check' to verify changes"
