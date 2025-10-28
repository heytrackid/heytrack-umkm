#!/bin/bash

# Fix incorrect Supabase imports
# Pattern: from '@/utils/supabase' → from '@/utils/supabase/service-role'

echo "Fixing Supabase imports..."

# Files that need service-role import
service_role_files=(
  "src/app/api/reports/cash-flow/route.ts"
  "src/app/api/orders/[id]/status/route.ts"
  "src/app/api/ingredients/[id]/route.ts"
  "src/app/api/orders/[id]/route.ts"
  "src/app/api/recipes/[id]/route.ts"
  "src/app/api/customers/[id]/route.ts"
  "src/modules/orders/services/InventoryUpdateService.ts"
  "src/modules/hpp/services/HppCalculatorService.ts"
  "src/modules/hpp/services/HppSnapshotService.ts"
  "src/modules/hpp/services/HppAlertService.ts"
  "src/lib/cron/inventory.ts"
  "src/lib/cron/financial.ts"
  "src/lib/cron/general.ts"
  "src/lib/cron/orders.ts"
)

for file in "${service_role_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  Fixing: $file"
    sed -i '' "s|from '@/utils/supabase'|from '@/utils/supabase/service-role'|g" "$file"
  fi
done

# Files that need client import
client_files=(
  "src/hooks/enhanced-crud/useEnhancedCRUD.ts"
)

for file in "${client_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  Fixing: $file"
    sed -i '' "s|from '@/utils/supabase'|from '@/utils/supabase/client'|g" "$file"
  fi
done

echo ""
echo "✅ Supabase imports fixed!"
