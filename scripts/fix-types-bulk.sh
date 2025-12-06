#!/bin/bash

# Bulk fix for type imports - replace common patterns

echo "🔄 Fixing type imports..."

# Fix Row<'table'> imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s/import type { Row } from '@\/types\/supabase-generated'/import type { Ingredient, Recipe, Order, Customer, Production, Notification } from '@\/types\/database'/g" \
  -e "s/import type { Row, /import type { /g" \
  -e "s/, Row } from '@\/types\/supabase-generated'/ } from '@\/types\/database'/g" \
  {} \;

# Fix Insert imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s/import type { Insert } from '@\/types\/supabase-generated'/import type { IngredientInsert, RecipeInsert, OrderInsert, CustomerInsert } from '@\/types\/database'/g" \
  -e "s/import type { Insert, /import type { /g" \
  -e "s/, Insert } from '@\/types\/supabase-generated'/ } from '@\/types\/database'/g" \
  {} \;

# Fix Update imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s/import type { Update } from '@\/types\/supabase-generated'/import type { IngredientUpdate, RecipeUpdate, OrderUpdate, CustomerUpdate } from '@\/types\/database'/g" \
  -e "s/import type { Update, /import type { /g" \
  -e "s/, Update } from '@\/types\/supabase-generated'/ } from '@\/types\/database'/g" \
  {} \;

# Fix enum imports
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s/import type { OrderStatus } from '@\/types\/supabase-generated'/import type { OrderStatus } from '@\/types\/database'/g" \
  -e "s/import type { PaymentMethod } from '@\/types\/supabase-generated'/import type { PaymentMethod } from '@\/types\/database'/g" \
  -e "s/import type { ProductionStatus } from '@\/types\/supabase-generated'/import type { ProductionStatus } from '@\/types\/database'/g" \
  {} \;

# Fix table-specific type names
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e "s/IngredientsTable/Ingredient/g" \
  -e "s/RecipesTable/Recipe/g" \
  -e "s/OrdersTable/Order/g" \
  -e "s/CustomersTable/Customer/g" \
  -e "s/NotificationsTable/Notification/g" \
  -e "s/HppRecommendationsTable/HppRecommendation/g" \
  -e "s/OperationalCostsTable/OperationalCost/g" \
  -e "s/IngredientPurchasesTable/IngredientPurchase/g" \
  {} \;

echo "✅ Type imports fixed!"
echo "Run 'pnpm type-check' to verify"
