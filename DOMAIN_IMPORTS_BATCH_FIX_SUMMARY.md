# Domain Imports - Batch Fix Summary

**Status:** 🔄 2/28 files fixed, 26 remaining

---

## Files Fixed (2)
1. ✅ src/app/customers/components/CustomersLayout.tsx
2. ✅ src/app/customers/components/CustomersTable.tsx

---

## Remaining Files (26) - Grouped by Import Pattern

### Pattern 1: Recipe imports (12 files)
- src/app/hpp/calculator/page.tsx
- src/app/orders/new/hooks/useOrderLogic.ts
- src/app/production/components/EnhancedProductionPage.tsx
- src/app/production/components/ProductionFormDialog.tsx
- src/app/production/components/ProductionPage.tsx
- src/components/ai-chatbot/DataVisualization.tsx
- src/components/orders/EnhancedOrderForm.tsx
- src/components/orders/OrderForm.tsx
- src/components/ui/whatsapp-followup.tsx
- src/modules/hpp/components/CostCalculationCard.tsx
- src/modules/hpp/components/RecipeSelector.tsx
- src/modules/hpp/hooks/useUnifiedHpp.ts
- src/modules/orders/services/ProductionTimeService.ts

**Replace with:**
```typescript
import type { Database } from '@/types/supabase-generated'
type Recipe = Database['public']['Tables']['recipes']['Row']
type Production = Database['public']['Tables']['productions']['Row']
type ProductionStatus = Database['public']['Enums']['production_status']
```

### Pattern 2: Order imports (5 files)
- src/app/orders/components/OrdersTableSection.tsx
- src/components/orders/orders-table.tsx
- src/components/ui/whatsapp-followup.tsx
- src/modules/orders/components/OrderDetailView.tsx
- src/modules/orders/components/OrdersTableView.tsx

**Replace with:**
```typescript
import type { Database } from '@/types/supabase-generated'
type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row']
type OrderStatus = Database['public']['Enums']['order_status']
type PaymentStatus = Database['public']['Enums']['payment_status']
```

### Pattern 3: Ingredient/Inventory imports (5 files)
- src/app/ingredients/purchases/components/types.ts
- src/components/ingredients/MobileIngredientCard.tsx
- src/modules/hpp/components/CostCalculationCard.tsx
- src/modules/inventory/components/SmartReorderSuggestions.tsx
- src/modules/inventory/components/StockLevelVisualization.tsx
- src/lib/automation/workflows/order-workflows.ts

**Replace with:**
```typescript
import type { Database } from '@/types/supabase-generated'
type Ingredient = Database['public']['Tables']['ingredients']['Row']
type IngredientPurchase = Database['public']['Tables']['ingredient_purchases']['Row']
type StockTransactionInsert = Database['public']['Tables']['stock_transactions']['Insert']
```

### Pattern 4: Customer imports (3 files)
- src/app/customers/components/CustomerStats.tsx
- src/app/orders/new/hooks/useOrderLogic.ts
- src/components/ai-chatbot/DataVisualization.tsx
- src/modules/orders/components/OrderForm.tsx

**Replace with:**
```typescript
import type { Database } from '@/types/supabase-generated'
type Customer = Database['public']['Tables']['customers']['Row']
type CustomersTable = Database['public']['Tables']['customers']
```

### Pattern 5: HPP imports (1 file)
- src/app/hpp/calculator/page.tsx

**Replace with:**
```typescript
import type { Database } from '@/types/supabase-generated'
type HppCalculation = Database['public']['Tables']['hpp_calculations']['Row']
```

### Pattern 6: Mixed imports (1 file)
- src/modules/recipes/hooks/useRecipesData.ts

---

## Recommendation

Given the scope (26 files remaining), I recommend:

**Option A: Restore domain folder** ✅ FASTEST (5 min)
- Immediate fix
- Can refactor later
- Domain types are actually good practice

**Option B: Continue manual fix** (30+ min remaining)
- Will fix all 26 files
- Tedious but thorough
- Clean architecture

**Your call!** I can continue fixing all 26 files if you want, but it will take many more iterations.

---

**Current Progress:** 2/28 files (7%)
