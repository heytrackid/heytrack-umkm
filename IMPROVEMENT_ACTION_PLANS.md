# 🎯 Quick Action Plans

## CRITICAL FIX #1: Enable TypeScript Error Checking

**⏱️ Time:** 5 minutes  
**📊 Impact:** HIGH - Catch production bugs early

### Step-by-Step

1. Open `next.config.ts`

2. Change:
```typescript
// BEFORE
typescript: {
  ignoreBuildErrors: true,
},

// AFTER
typescript: {
  ignoreBuildErrors: false,
},
```

3. Run `pnpm build` to see errors:
```bash
pnpm build
```

4. Fix errors one by one - write them down for analysis

5. Commit:
```bash
git add next.config.ts
git commit -m "fix: enable TypeScript error checking"
```

### What to expect
You'll likely see 5-20 type errors. This is **GOOD** - better to know now than in production!

---

## CRITICAL FIX #2: Consolidate Responsive Hooks

**⏱️ Time:** 2-3 hours  
**📊 Impact:** HIGH - Reduces confusion and bugs

### The Problem

```
❌ CURRENTLY: 3 overlapping hooks doing same thing
✅ AFTER: 1 single source of truth
```

### Step 1: Create Unified Hook

Create new file: `src/hooks/useBreakpoint.ts`

```typescript
'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'

const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

type Breakpoint = 'mobile' | 'tablet' | 'desktop'

interface BreakpointState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  current: Breakpoint
  width: number
}

/**
 * Hook for responsive design
 * @returns Current breakpoint state
 * @example
 * const { isMobile, current } = useBreakpoint()
 */
export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    current: 'desktop',
    width: 1024,
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      const newState: BreakpointState = {
        width,
        isMobile: width < BREAKPOINTS.md,
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg,
        current: width < BREAKPOINTS.md 
          ? 'mobile' 
          : width < BREAKPOINTS.lg 
          ? 'tablet' 
          : 'desktop',
      }
      
      setState(newState)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return state
}

// Backward compatibility exports
export function useIsMobile() {
  return useBreakpoint().isMobile
}

export function useResponsive() {
  return useBreakpoint()
}
```

### Step 2: Update Imports

```bash
# Find all imports
grep -r "useResponsive\|useIsMobile\|useMobile" src --include="*.tsx" --include="*.ts" -l

# Then update each file from:
import { useResponsive } from '@/hooks/use-mobile'
import { useIsMobile } from '@/hooks/use-mobile'
import { useResponsive } from '@/hooks/useResponsive'

# To:
import { useBreakpoint, useIsMobile, useResponsive } from '@/hooks/useBreakpoint'
```

### Step 3: Delete Old Files

```bash
git rm src/hooks/use-mobile.ts
git rm src/hooks/useResponsive.ts
git rm src/hooks/use-responsive.tsx
```

### Step 4: Test

```bash
pnpm dev
# Check mobile view in DevTools - should work same as before
```

### Step 5: Commit

```bash
git add .
git commit -m "refactor: consolidate responsive hooks into single useBreakpoint hook

- Created unified useBreakpoint hook in src/hooks/useBreakpoint.ts
- Provides isMobile, isTablet, isDesktop flags and current breakpoint
- Maintains backward compatibility with exported useIsMobile and useResponsive
- Removed duplicate hooks: use-mobile.ts, useResponsive.ts, use-responsive.tsx
- Updated all imports across codebase

This reduces confusion and makes it clear which hook to use."
```

---

## CRITICAL FIX #3: Centralize Utils Functions

**⏱️ Time:** 4-5 hours  
**📊 Impact:** MEDIUM-HIGH

### Current Mess
```
src/lib/utils.ts
src/utils/hpp-utils.ts
src/utils/hpp-chart-formatters.ts
src/app/operational-costs/utils.ts
src/app/profit/utils.ts
... 10+ more
```

### New Structure
```
src/utils/
├── formatting/
│   ├── currency.ts        ← Currency formatting
│   ├── date.ts           ← Date formatting
│   └── hpp.ts            ← HPP formatting
├── calculations/
│   ├── hpp.ts            ← HPP calculations
│   ├── profit.ts         ← Profit calculations
│   └── cashflow.ts       ← Cash flow calculations
├── validation/
│   ├── forms.ts          ← Form validation
│   └── data.ts           ← Data validation
└── index.ts              ← Re-exports
```

### Implementation

1. **Create new structure:**
```bash
mkdir -p src/utils/{formatting,calculations,validation}
```

2. **Move files** (consolidate & merge where appropriate):
```bash
# Move formatting utils
mv src/utils/hpp-chart-formatters.ts src/utils/formatting/hpp.ts
mv src/lib/currency.ts src/utils/formatting/currency.ts

# Create date utils
# (extract date logic from various files)

# Move calculations
# (consolidate HPP, profit, cashflow logic)
```

3. **Create re-export file** `src/utils/index.ts`:
```typescript
// Formatting
export * from './formatting/currency'
export * from './formatting/date'
export * from './formatting/hpp'

// Calculations
export * from './calculations/hpp'
export * from './calculations/profit'
export * from './calculations/cashflow'

// Validation
export * from './validation/forms'
export * from './validation/data'
```

4. **Update imports everywhere:**
```typescript
// BEFORE (scattered)
import { formatCurrency } from '@/lib/currency'
import { formatHPP } from '@/utils/hpp-formatters'

// AFTER (single import)
import { formatCurrency, formatHPP } from '@/utils'
```

5. **Delete old files:**
```bash
rm src/lib/utils.ts
rm src/app/*/utils.ts
# etc.
```

---

## Database Hooks Cleanup (Advanced)

**⏱️ Time:** 6-8 hours  
**📊 Impact:** HIGH

### Current Chaos
```
useSupabase.ts
useSupabaseClient.ts
useSupabaseData.ts
useSupabaseCRUD.ts
useDatabase.ts
useEnhancedCRUD.ts
useOptimizedDatabase.ts
```

### New Unified Hook

Create: `src/hooks/useDatabase.ts`

```typescript
'use client'

import * as React from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']

interface UseDatabaseOptions {
  enabled?: boolean
  refetchOnMount?: boolean
  staleTime?: number
}

/**
 * Unified database hook for all CRUD operations
 * @param table - Table name from database
 * @param options - Query options
 * @returns Object with data, mutations, and utilities
 * @example
 * const { data, create, update, delete: remove } = useDatabase('recipes')
 */
export function useDatabase<T extends keyof Tables>(
  table: T,
  options: UseDatabaseOptions = {}
) {
  const client = useSupabaseClient()
  const queryClient = useQueryClient()
  const queryKey = [table]

  // Read
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await client
        .from(table as string)
        .select('*')
      
      if (error) throw error
      return data
    },
    ...options,
  })

  // Create
  const createMutation = useMutation({
    mutationFn: async (newData: any) => {
      const { data, error } = await client
        .from(table as string)
        .insert([newData])
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  // Update
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await client
        .from(table as string)
        .update(updates)
        .eq('id', id)
        .select()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  // Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await client
        .from(table as string)
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    data: (data as any[]) || [],
    isLoading,
    error,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
```

### Usage Example

```typescript
// BEFORE: Confusing which hook to use
import { useEnhancedCRUD } from '@/hooks/useEnhancedCRUD'
const { data, addItem, updateItem, removeItem } = useEnhancedCRUD('recipes')

// AFTER: Clear and simple
import { useDatabase } from '@/hooks/useDatabase'
const { data, create, update, delete: remove } = useDatabase('recipes')

// Creating
await create({ name: 'Nasi Goreng', price: 15000 })

// Updating
await update({ id: '123', name: 'Nasi Goreng Updated' })

// Deleting
await remove('123')
```

### Migration Steps

1. Create new unified hook (see above)
2. Create migration guide for the team
3. Update 1-2 pages as examples
4. PR review & feedback
5. Gradually migrate other pages
6. Delete old hooks once everything is migrated

---

## Error Handling Standardization

**⏱️ Time:** 4-5 hours  
**📊 Impact:** HIGH (Reliability)

### Create Error Classes

File: `src/lib/errors/AppError.ts`

```typescript
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super('VALIDATION_ERROR', message, 400, details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401)
    this.name = 'UnauthorizedError'
  }
}
```

### Use in API Routes

```typescript
// src/app/api/recipes/[id]/route.ts
import { AppError, NotFoundError } from '@/lib/errors/AppError'
import { apiResponse } from '@/lib/api/response'

export async function GET(request: Request, { params }: any) {
  try {
    const { id } = params
    
    if (!id) {
      throw new ValidationError('Recipe ID is required')
    }

    const recipe = await db.recipes.findById(id)
    if (!recipe) {
      throw new NotFoundError('Recipe')
    }

    return Response.json(apiResponse.success(recipe))
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json(
        apiResponse.error(error.message, error.code),
        { status: error.statusCode }
      )
    }
    
    return Response.json(
      apiResponse.error('Internal Server Error', 'INTERNAL_ERROR'),
      { status: 500 }
    )
  }
}
```

---

## Quick Wins (30 minutes each)

### 1. Add JSDoc Comments
Pick 5 most-used utility functions and add JSDoc.

### 2. Enable Bundle Analyzer
```bash
pnpm add -D @next/bundle-analyzer
```

Update `next.config.ts`:
```typescript
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)
```

Run:
```bash
ANALYZE=true pnpm build
```

### 3. Fix ESLint Warnings
```bash
pnpm lint --fix
git add .
git commit -m "fix: resolve ESLint warnings"
```

---

## Suggested Timeline

**Week 1:**
- Monday: TypeScript errors + Responsive hooks
- Tuesday: Centralize utils
- Wednesday: Review & test

**Week 2:**
- Monday: Database hooks unification
- Tuesday-Wed: Testing & refinement

**Week 3:**
- Monday: Error handling
- Tuesday: API consistency
- Wed: Documentation

---

## Commands to Remember

```bash
# Find all files importing a hook
grep -r "useResponsive" src --include="*.tsx" --include="*.ts" -l

# Find & replace all imports (careful!)
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' \
  's/from.*useResponsive/from "@\/hooks\/useBreakpoint"/g' {} \;

# Check file sizes
du -sh src/*

# Type check
pnpm type-check

# Build & check for errors
pnpm build
```

---

**Ready to start? Pick one action and begin! 🚀**
