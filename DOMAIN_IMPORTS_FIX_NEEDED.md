# Domain Imports Fix Needed

**Date:** October 28, 2025  
**Status:** ❌ 28 FILES NEED FIXING

---

## Problem

After removing `src/types/domain/` folder, **28 files** still have imports from the deleted folder, causing TypeScript errors.

---

## Files That Need Fixing (28 files)

### App Components (10 files)
1. `src/app/customers/components/CustomersLayout.tsx`
2. `src/app/customers/components/CustomersTable.tsx`
3. `src/app/customers/components/CustomerStats.tsx`
4. `src/app/hpp/calculator/page.tsx`
5. `src/app/ingredients/purchases/components/types.ts`
6. `src/app/orders/components/OrdersTableSection.tsx`
7. `src/app/orders/new/hooks/useOrderLogic.ts`
8. `src/app/production/components/EnhancedProductionPage.tsx`
9. `src/app/production/components/ProductionFormDialog.tsx`
10. `src/app/production/components/ProductionPage.tsx`

### Components (6 files)
11. `src/components/ai-chatbot/DataVisualization.tsx`
12. `src/components/ingredients/MobileIngredientCard.tsx`
13. `src/components/orders/EnhancedOrderForm.tsx`
14. `src/components/orders/OrderForm.tsx`
15. `src/components/orders/orders-table.tsx`
16. `src/components/ui/whatsapp-followup.tsx`

### Modules (11 files)
17. `src/modules/hpp/components/CostCalculationCard.tsx`
18. `src/modules/hpp/components/RecipeSelector.tsx`
19. `src/modules/hpp/hooks/useUnifiedHpp.ts`
20. `src/modules/inventory/components/SmartReorderSuggestions.tsx`
21. `src/modules/inventory/components/StockLevelVisualization.tsx`
22. `src/modules/orders/components/OrderDetailView.tsx`
23. `src/modules/orders/components/OrderForm.tsx`
24. `src/modules/orders/components/OrdersTableView.tsx`
25. `src/modules/orders/services/ProductionTimeService.ts`
26. `src/modules/recipes/components/SmartPricingAssistant.tsx`
27. `src/modules/recipes/hooks/useRecipesData.ts`

### Lib (1 file)
28. `src/lib/automation/workflows/order-workflows.ts`

---

## Fix Pattern

### Before (Broken)
```typescript
import type { Recipe } from '@/types/domain/recipes'
import type { Order } from '@/types/domain/orders'
import type { Customer } from '@/types/domain/customers'
```

### After (Fixed)
```typescript
import type { Database } from '@/types/supabase-generated'

type Recipe = Database['public']['Tables']['recipes']['Row']
type Order = Database['public']['Tables']['orders']['Row']
type Customer = Database['public']['Tables']['customers']['Row']
```

---

## Common Imports to Replace

| Old Import | New Pattern |
|------------|-------------|
| `from '@/types/domain/recipes'` | `Database['public']['Tables']['recipes']['Row']` |
| `from '@/types/domain/orders'` | `Database['public']['Tables']['orders']['Row']` |
| `from '@/types/domain/customers'` | `Database['public']['Tables']['customers']['Row']` |
| `from '@/types/domain/inventory'` | `Database['public']['Tables']['ingredients']['Row']` |
| `from '@/types/domain/hpp'` | `Database['public']['Tables']['hpp_calculations']['Row']` |

---

## Impact

**Current State:**
- ❌ 17 TypeScript errors from missing domain imports
- ❌ 28 files broken
- ❌ Cannot build/deploy

**After Fix:**
- ✅ All imports resolved
- ✅ TypeScript errors reduced
- ✅ Can build/deploy

---

## Recommendation

**Option 1: Fix All Now (Recommended)**
- Time: ~30-45 minutes
- Impact: Immediate resolution
- Benefit: Clean codebase

**Option 2: Restore Domain Folder**
- Time: 5 minutes
- Impact: Quick fix
- Downside: Goes against user preference

**Option 3: Fix Gradually**
- Time: Over multiple sessions
- Impact: Partial resolution
- Downside: Codebase stays broken

---

## Next Steps

1. Choose option (recommend Option 1)
2. Fix all 28 files with pattern replacement
3. Run type-check to verify
4. Commit changes

---

**Status:** Waiting for decision on how to proceed
