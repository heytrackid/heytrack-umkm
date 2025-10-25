# TypeScript Errors Summary

## Progress
- **Starting errors:** 1148
- **Current errors:** 1027
- **Fixed:** 121 errors ✅

## Errors Fixed

### 1. Syntax Errors (4 fixed)
- Fixed `ri.(ingredient as any)` → `(ri.ingredient as any)` in ProductionDataIntegration.ts

### 2. Type System Errors (50+ fixed)
- Fixed type guards in `src/types/guards.ts` - added proper imports
- Fixed database type exports in `src/types/database.ts` - uncommented all exports
- Fixed function type imports in `src/types/functions.ts` - changed from @/components to ./index

### 3. Module/Import Errors (40+ fixed)
- Fixed duplicate `createClient` export in `src/utils/supabase/index.ts`
- Added logger imports in 3 files (hpp-calculator, useHPPCalculation, HPPCalculationService)
- Fixed 75+ incorrect exports in `src/lib/index.ts`
- Fixed shared API module exports in `src/shared/api/index.ts`
- Fixed shared components exports in `src/shared/components/index.ts`
- Fixed import paths in `src/app/profit/hooks/useProfitReport.ts`

### 4. Configuration (2 fixed)
- Excluded `supabase/functions/**/*` from tsconfig (Deno runtime)
- Excluded `vitest.config.ts` from tsconfig

### 5. Code Quality (20+ fixed)
- Replaced all `as any as any` with single `as any` casts

## Remaining Errors (1027)

### By Category:

#### 1. Supabase Type Inference (~400 errors)
**Problem:** Properties showing as `never` type
```typescript
// Example error:
error TS2339: Property 'name' does not exist on type 'never'
```

**Root Cause:** Supabase client queries not properly typed

**Solution Options:**
1. Regenerate Supabase types: `npx supabase gen types typescript --project-id <id>`
2. Add type assertions where needed
3. Create typed wrapper functions for common queries

#### 2. Missing Dependencies (~50 errors)
**Missing Radix UI Components:**
- `@radix-ui/react-navigation-menu`
- `@radix-ui/react-menubar`
- `@radix-ui/react-context-menu`
- `@radix-ui/react-aspect-ratio`
- `@radix-ui/react-toggle-group`
- `@radix-ui/react-hover-card`

**Missing shadcn/ui Components:**
- `@/components/ui/command`

**Solution:**
```bash
npm install @radix-ui/react-navigation-menu @radix-ui/react-menubar @radix-ui/react-context-menu @radix-ui/react-aspect-ratio @radix-ui/react-toggle-group @radix-ui/react-hover-card
npx shadcn-ui@latest add command
```

#### 3. Property Access on unknown/never (~300 errors)
**Problem:** Accessing properties without type checking
```typescript
// Example:
const value = (data as any).property // inferred as unknown
```

**Solution:** Add proper type guards or assertions

#### 4. Missing Internal Modules (~50 errors)
**Files with issues:**
- `src/components/ai-chatbot/ChatbotInterface.tsx` → missing `@/lib/ai-chatbot/types`
- `src/hooks/use-mobile.ts` → missing file
- Various module barrel exports

**Solution:** Create missing files or update imports

#### 5. Complex Type Issues (~227 errors)
Various TypeScript type mismatches, overload issues, and advanced type errors

## Recommended Action Plan

### Priority 1: Fix Supabase Types
```bash
# 1. Regenerate types from Supabase
npx supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public > src/types/supabase-generated.ts

# 2. Update Database type to use generated types
# 3. Test key API routes
```

### Priority 2: Install Missing Dependencies
```bash
npm install @radix-ui/react-navigation-menu @radix-ui/react-menubar @radix-ui/react-context-menu @radix-ui/react-aspect-ratio @radix-ui/react-toggle-group @radix-ui/react-hover-card
npx shadcn-ui@latest add command
```

### Priority 3: Create Missing Utilities
```bash
# Create missing utility files:
touch src/hooks/use-mobile.ts
touch src/lib/ai-chatbot/types.ts
```

### Priority 4: Add Type Assertions Helper
Create `src/lib/type-assertions.ts` for common type assertion patterns.

### Priority 5: Gradual Cleanup
- Fix property access errors file by file
- Add proper type guards
- Update function signatures

## Files with Most Errors

1. `src/lib/ai-chatbot-service.ts` - 41 errors
2. `src/lib/automation-engine.ts` - 40 errors  
3. `src/lib/services/AutoSyncFinancialService.ts` - 34 errors
4. `src/hooks/useOptimizedDatabase.ts` - 31 errors
5. `src/components/lazy/chart-lazy-loader.tsx` - 31 errors
6. `src/app/api/reports/profit/route.ts` - 27 errors

## Quick Wins

Files that can be fixed quickly:
- Import/export errors (~50 remaining)
- Missing type imports (~30)
- Simple type assertions (~100)

## Notes

- Many errors are cascading from core type definition issues
- Fixing Supabase types will likely resolve 30-40% of remaining errors
- Some files may need to be refactored for better type safety
- Consider enabling stricter TypeScript checks gradually

## Commands

```bash
# Check current error count
npm run type-check 2>&1 | grep "error TS" | wc -l

# See errors by file
npm run type-check 2>&1 | grep "error TS" | sed 's/\(.*\.ts[x]*\).*/\1/' | sort | uniq -c | sort -rn | head -20

# See error types
npm run type-check 2>&1 | grep "error TS" | sed 's/.*error \(TS[0-9]*\).*/\1/' | sort | uniq -c | sort -rn
```
