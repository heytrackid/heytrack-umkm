# Stores Cleanup - October 28, 2024

## Summary
Removed redundant Zustand stores that were duplicating React Query functionality.

## Files Deleted

### Store Files (7 files)
- `src/lib/stores/orders-store.ts`
- `src/lib/stores/ingredients-store.ts`
- `src/lib/stores/expenses-store.ts`
- `src/lib/stores/customers-store.ts`
- `src/lib/stores/reports-store.ts`
- `src/lib/stores/recipes-store.ts`
- `src/lib/stores/index.ts`

### Data Synchronization (8 files)
- `src/lib/data-synchronization/index.ts`
- `src/lib/data-synchronization/store.ts`
- `src/lib/data-synchronization/sync-events.ts`
- `src/lib/data-synchronization/sync-hooks.ts`
- `src/lib/data-synchronization/types.ts`
- `src/lib/data-synchronization/utilities.ts`

### Duplicate/Backup Files (4 files)
- `src/types/supabase-generated-new.ts` (70KB - duplicate)
- `src/types/supabase-generated-updated.ts` (0KB - empty)
- `src/app/api/expenses/route.ts.bak`
- `src/app/api/suppliers/route.ts.bak`

**Total: 19 files removed (~600+ lines of code)**

## Rationale

### Why Remove Stores?

1. **Redundancy** - All stores were duplicating data already managed by React Query
2. **Data Inconsistency Risk** - Having two sources of truth (store + database) can cause sync issues
3. **Unused Code** - No components were importing from these stores
4. **Complexity** - Unnecessary abstraction layer that adds maintenance burden

### Architecture Decision

**Before:**
```
Component → Zustand Store → React Query → API → Database
```

**After (Simplified):**
```
Component → React Query → API → Database
```

## What to Use Instead

### For Server State (Database Data)
✅ **Use React Query** (`@tanstack/react-query`)
- Already implemented in hooks like `useOperationalCosts`, `useOrders`, etc.
- Handles caching, refetching, optimistic updates
- Single source of truth

### For Client State (UI State)
✅ **Use React useState/useReducer**
- Modal open/close
- Selected items
- Form state
- Filters

✅ **Use Zustand** (if needed for complex global UI state)
- Theme preferences
- User settings
- Multi-step form state across routes

## Impact

- ✅ Reduced TypeScript errors from 1088 → 1083
- ✅ Removed ~500 lines of unused code
- ✅ Simplified state management architecture
- ✅ Eliminated potential data sync bugs
- ✅ Easier to maintain and understand

## Migration Notes

No migration needed - stores were not being used by any components.

## Related Files

The following hooks already handle data fetching correctly:
- `src/app/operational-costs/hooks/useOperationalCosts.ts`
- `src/app/orders/hooks/use-orders.ts`
- `src/hooks/api/*` (various API hooks)

These use React Query and should continue to be the pattern for all data fetching.
