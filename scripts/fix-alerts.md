# Alert to Toast Migration Script

This document tracks all alert() replacements with toast notifications for better UX.

## Files to Fix

### High Priority (User-facing)
1. ✅ `src/app/categories/hooks/useCategories.ts` - DONE
2. ✅ `src/app/customers/page.tsx` - DONE
3. ⏳ `src/app/cash-flow/hooks/useCashFlow.ts`
4. ⏳ `src/app/operational-costs/hooks/useOperationalCosts.ts`
5. ⏳ `src/app/operational-costs/page.tsx`
6. ⏳ `src/app/hpp/hooks/useHPPLogic.ts`
7. ⏳ `src/app/ingredients/purchases/page.tsx`
8. ⏳ `src/app/profit/hooks/useProfitReport.ts`
9. ⏳ `src/app/operational-costs/components/CostForm.tsx`

### Pattern to Replace

```typescript
// Before
alert('Message')

// After  
toast.success('Message')  // for success
toast.error('Message')    // for errors
toast('Message', { icon: 'ℹ️' })  // for info
```

### Import Required

```typescript
import { toast } from 'react-hot-toast'
```

## Status
- Total files: 9
- Fixed: 2
- Remaining: 7
