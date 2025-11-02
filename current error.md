  Analisis Komprehensif: Build Errors & Type System di HeyTrack
 📊 STATUS BUILD SAAT INI

 Current Error:


 typescript
   '"IN_PROGRESS" | "CANCELLED" | "PLANNED" | "COMPLETED"' to parameter of type

   Location: src/app/recipes/hooks/use-production.ts:94:62

 ──────────────────────────────────────────

 🚨 KATEGORI ERROR UTAMA

 1. **Type Mismatch Errors** (CRITICAL - Blocking Build)

 •  Problem: ProductionStatus filter menggunakan string padahal harus menggunakan
    enum literal
 •  File: src/app/recipes/hooks/use-production.ts (line 94)
    Root Cause: Type guard tidak proper untuk enum comparison
 2. **Unknown Type Issues** (HIGH PRIORITY)

 Total 234+ files menggunakan parameter unknown yang perlu specific types:

 **App Layer (56 files)**

 •  /app/api/**/*.ts - 45 route handlers
 •  /app/**/hooks/*.ts - 11 custom hooks
    /app/**/components/*.tsx - Multiple UI components
 **Components Layer (68 files)**

 •  /components/operational-costs/*.tsx - 4 files
 •  /components/orders/*.tsx - 8 files
 •  /components/recipes/*.tsx - 6 files
 •  /components/ui/*.tsx - 25+ UI primitives
    Other feature components
 **Hooks Layer (24 files)**

 •  /hooks/ai-powered/*.ts - 5 AI hooks
 •  /hooks/supabase/*.ts - Core database hooks
 •  /hooks/error-handler/*.ts - Error handling hooks
    /hooks/enhanced-crud/*.ts - CRUD operations
 **Services/Lib Layer (86 files)**

 •  /services/**/*.ts - Business logic services
 •  /lib/**/*.ts - Utility libraries
    /modules/**/*.ts - Feature modules
 ──────────────────────────────────────────

 🎯 FILES YANG HARUS MENGIMPORT TYPE UTILITIES

 **Priority 1: CRITICAL (Blocking Build)**

 1. `src/app/recipes/hooks/use-production.ts`


 typescript
   import { ProductionStatus, isString } from '@/types/database'

   // FIX:
   Line 94: filters.status.includes(batchObj.status as ProductionStatus)

 **Priority 2: HIGH (Type Safety)**

 Hooks dengan Unknown Parameters (11 files)


 typescript
     MUST IMPORT: Row, Insert, Update, isRecord, hasKeys, safeGet
   Files:
   1. src/app/orders/hooks/use-orders.ts
   2. src/app/recipes/hooks/use-production.ts
   3. src/app/cash-flow/hooks/useEnhancedCashFlow.ts
   4. src/app/profit/hooks/useProfitData.ts
   5. src/app/profit/hooks/useProfitReport.ts
   6. src/app/settings/hooks/useSettingsManager.ts
   7. src/app/ai-chatbot/hooks/useChatMessages.ts
   8. src/app/ai-chatbot/hooks/useAIService.ts
   9. src/app/categories/hooks/useCategories.ts
   10. src/app/orders/new/hooks/useOrderLogic.ts
   11. src/app/auth/register/hooks/useRegistration.ts

 API Routes dengan Any/Unknown (45 files)


 typescript
     MUST IMPORT: Row, Insert, Update, Json, typed, assertRecord
   Pattern:
   - All routes in /app/api/**/route.ts
   - Use typed() for Supabase client
   - Use assertRecord() for request validation
   - Use Insert<'table'> for POST payloads
   - Use Update<'table'> for PATCH payloads

 Components dengan Type Issues (25+ files)


 typescript
     MUST IMPORT: isRecord, hasKeys, isArray, safeGet, ensureArray
   High Priority Components:
   1. src/components/operational-costs/EnhancedOperationalCostsPage.tsx
   2. src/components/orders/*.tsx (8 files)
   3. src/app/dashboard/components/RecentOrdersSection.tsx
   4. src/app/hpp/**/page.tsx (5 pages)
   5. src/app/customers/components/*.tsx
   6. src/app/settings/components/BusinessInfoSettings.tsx

 **Priority 3: MEDIUM (Code Quality)**

 Service Layer (30+ files)


 typescript
     RECOMMENDED IMPORT: All type utilities for consistency
   Services needing updates:
   - src/services/hpp/HppCalculatorService.ts
   - src/services/production/*.ts (4 files)
   - src/services/inventory/*.ts (3 files)
   - src/services/orders/*.ts (5 files)
   - src/modules/**/services/*.ts (15+ files)

 ──────────────────────────────────────────

 📝 SPECIFIC FIXES NEEDED

 **Fix 1: Production Status Filter**


 typescript
    / FILE: src/app/recipes/hooks/use-production.ts
   // CURRENT (BROKEN):
   if (filters.status?.length && !filters.status.includes(batchObj.status as
   string)) {
     return false
   }

   // FIX TO:
   import { ProductionStatus, isRecord } from '@/types/database'

   if (filters.status?.length) {
     const batchStatus = isRecord(batch) && 'status' in batch
       ? batch.status as ProductionStatus
       : undefined

     if (batchStatus && !filters.status.includes(batchStatus)) {
       return false
     }
   }

 **Fix 2: Unknown Function Parameters**

 Pattern in 234+ locations:

 typescript
   const handleSubmit = async (data: unknown) => { ... }
   const toggleFilter = (filter: unknown) => { ... }
   const getStatusBadge = (status: unknown) => { ... }

   // AFTER:
   import type { Insert, isRecord, hasKeys } from '@/types/database'

   const handleSubmit = async (data: Insert<'table_name'>) => { ... }
   const toggleFilter = (filter: string) => { ... }
   const getStatusBadge = (status: OrderStatus) => { ... }


 **Fix 3: API Route Handlers**

 Pattern for all 45 route files:

 typescript
   import { typed, Row, Insert, Update, assertRecord } from '@/types/database'
   import { NextRequest, NextResponse } from 'next/server'

   export async function POST(request: NextRequest) {
     try {
       const body = await request.json()
       assertRecord(body, 'Invalid request body')

       const supabase = createClient()
       const client = typed(supabase)

       const payload: Insert<'your_table'> = {
         // typed payload
       }

       const { data, error } = await client
         .from('your_table')
         .insert(payload)
         .select()
         .single()

       if (error) throw error
       return NextResponse.json(data as Row<'your_table'>)
     } catch (error) {
       // error handling
     }
   }


 ──────────────────────────────────────────

 🔧 IMPLEMENTATION PLAN

 **Phase 1: Fix Critical Build Error** (15 mins)
 1. Fix use-production.ts ProductionStatus type
 2. Run build to verify fix
 3. Commit: "fix: production status type mismatch"

 **Phase 2: Fix App Layer Hooks** (30 mins)
 1. Update 11 custom hooks with proper types
 2. Replace all unknown with specific types
 3. Add proper imports from @/types/database
 4. Commit: "refactor: fix type safety in custom hooks"

 **Phase 3: Fix API Routes** (45 mins)
 1. Add type imports to all 45 route files
 2. Use typed(), Insert<>, Update<> properly
 3. Add assertRecord() for validation
 4. Commit: "refactor: add type safety to API routes"

 **Phase 4: Fix Components** (60 mins)
 1. Fix operational costs components (4 files)
 2. Fix order components (8 files)
 3. Fix dashboard/HPP pages (10 files)
 4. Fix remaining UI components
 5. Commit: "refactor: fix type safety in components"

 **Phase 5: Final Cleanup** (30 mins)
 1. Fix services layer
 2. Update lib utilities
 3. Final build test
 4. Commit: "refactor: complete type system migration"

 Total Estimated Time: 3 hours

 ──────────────────────────────────────────

 📚 IMPORT PATTERNS CHEAT SHEET

 **For Hooks:**

 typescript
     Row, Insert, Update,
     isRecord, hasKeys, safeGet, isDefined
   } from '@/types/database'


 **For API Routes:**

 typescript
     Row, Insert, Update, Json,
     typed, assertRecord, assertNonNull
   } from '@/types/database'


 **For Components:**

 typescript
   import { pe { Row } from '@/types/database'
     isRecord, isArray, ensureArray,
     safeGet, isDefined
   } from '@/types/database'


 **For Services:**

 typescript
     Row, Insert, Update,
     TypedSupabaseClient
   } from '@/types/database'
   import { typed, isRecipe, isIngredient } from '@/types/database'


 ──────────────────────────────────────────

 ✅ SUCCESS CRITERIA

 1. ✅ Build passes without type errors
 2. ✅ No unknown types in function parameters
 3. ✅ All API routes use typed Supabase client
 4. ✅ All database operations use Row<>, Insert<>, Update<>
 5. ✅ Type guards used for runtime validation
 6. ✅ No as any castings in codebase
