# Manual Type Definitions Audit

## ❌ Files with Manual Table Type Definitions (MUST FIX)

### 1. src/types/supabase/tables/recipes.ts
**Problem:** Manually defines `RecipesTable` and `RecipeIngredientsTable`
**Status:** 🔴 DUPLICATE - Already in supabase-generated.ts
**Action:** DELETE or convert to re-export

```typescript
// ❌ CURRENT (Manual definition)
export interface RecipesTable {
  Row: { ... }
  Insert: { ... }
  Update: { ... }
}

// ✅ SHOULD BE (Re-export from generated)
import type { Database } from '@/types/supabase-generated'
export type RecipesTable = Database['public']['Tables']['recipes']
export type RecipeIngredientsTable = Database['public']['Tables']['recipe_ingredients']
```

### 2. src/types/features/sync.ts
**Problem:** Manually defines `SyncEventsTable` and `SystemMetricsTable`
**Status:** 🟡 CHECK - Verify if exists in generated types
**Action:** If exists in generated, convert to re-export

### 3. src/types/features/auth.ts
**Problem:** Manually defines `UserProfilesTable`
**Status:** 🟡 CHECK - Verify if exists in generated types
**Action:** If exists in generated, convert to re-export

### 4. src/types/features/notifications.ts
**Problem:** Manually defines `NotificationsTable`
**Status:** 🟡 CHECK - Verify if exists in generated types
**Action:** If exists in generated, convert to re-export

## ✅ Files That Are OK (Re-exports or Extensions)

### src/types/database.ts
✅ Only re-exports from generated types

### src/types/recipes.ts
✅ Only re-exports from generated types

### src/types/query-results.ts
✅ Extends generated types for query results (not table definitions)

## Action Plan

1. **Check Generated Types**
   - Verify which tables exist in `supabase-generated.ts`
   - List tables that are manually defined but should be generated

2. **Fix Manual Definitions**
   - Convert manual definitions to re-exports
   - Delete duplicate definitions
   - Update imports in files that use these types

3. **Verify Build**
   - Run type check after fixes
   - Ensure no breaking changes

## Commands to Check

```bash
# Check if table exists in generated types
grep -A 5 "sync_events:" src/types/supabase-generated.ts
grep -A 5 "system_metrics:" src/types/supabase-generated.ts
grep -A 5 "user_profiles:" src/types/supabase-generated.ts
grep -A 5 "notifications:" src/types/supabase-generated.ts
```

## Priority

1. 🔴 HIGH: src/types/supabase/tables/recipes.ts (confirmed duplicate)
2. 🟡 MEDIUM: Check other feature tables
3. 🟢 LOW: Verify all re-exports are correct
