# Domain Types Migration Plan

## Goal
Migrate from direct `supabase-generated` imports to cleaner domain re-exports

## Pattern

### Before (Current - Verbose)
```typescript
import type { Database } from '@/types/supabase-generated'
type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeInsert = Database['public']['Tables']['recipes']['Insert']
```

### After (Target - Clean)
```typescript
import type { Recipe, RecipeInsert } from '@/types/domain/recipes'
```

## Files to Migrate (Priority Order)

### High Priority - API Routes (31 files)
- [x] All API routes already have generated types
- [ ] Refactor to use domain re-exports

### Medium Priority - Services & Agents
- [ ] src/agents/automations/HppAlertAgent.ts
- [ ] src/agents/automations/DailySnapshotsAgent.ts
- [ ] src/modules/orders/services/OrderPricingService.ts
- [ ] src/modules/orders/services/InventoryUpdateService.ts
- [ ] src/lib/cron/*.ts files

### Low Priority - Hooks & Components
- [ ] src/hooks/useRealtimeAlerts.ts
- [ ] src/hooks/useAuth.ts
- [ ] Components that use database types

## Benefits
1. ✅ Cleaner, more readable imports
2. ✅ Easier to refactor
3. ✅ Better organization
4. ✅ Consistent with best practices

## Status
- Phase 1: Add generated types ✅ DONE
- Phase 2: Refactor to domain re-exports 🔄 IN PROGRESS
