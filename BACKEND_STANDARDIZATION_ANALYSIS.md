# Analisis Standardisasi Backend HeyTrack

**Tanggal Analisis:** 22 November 2025  
**Scope:** Backend API Routes & Services Layer  
**Status:** 🔴 Memerlukan Standardisasi Signifikan

---

## 📊 Executive Summary

Setelah melakukan analisis mendalam terhadap backend HeyTrack, ditemukan **15 area inkonsistensi kritis** yang memerlukan standardisasi. Backend saat ini menggunakan campuran pola lama dan baru, dengan beberapa API routes masih menggunakan pendekatan manual sementara yang lain sudah menggunakan `createApiRoute` factory.

**Tingkat Standardisasi Saat Ini:** ~65%  
**Target:** 95%+

---

## 🔴 CRITICAL ISSUES - Prioritas Tinggi

### 1. **Inkonsistensi Penggunaan API Route Factory**

**Masalah:**
- Beberapa routes masih menggunakan `requireAuth()` manual + `NextResponse.json()` langsung
- Tidak semua routes menggunakan `createApiRoute()` wrapper
- Mixing antara old pattern dan new pattern

**Contoh Inkonsistensi:**

```typescript
// ❌ OLD PATTERN (src/app/api/errors/route.ts)
import { requireAuth } from '@/lib/api-auth'
import { NextResponse } from 'next/server'

export const GET = async (request: NextRequest) => {
  const authResult = await requireAuth()
  if (isErrorResponse(authResult)) {
    return authResult
  }
  // ... manual handling
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ✅ NEW PATTERN (src/app/api/customers/[[...slug]]/route.ts)
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/customers',
    querySchema: ListQuerySchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, validatedQuery) => {
    // Automatic auth, validation, error handling
    return createSuccessResponse(data)
  }
)
```

**Files Affected:**
- `src/app/api/errors/route.ts` - Manual auth + response
- `src/app/api/ingredients/import/route.ts` - Partial migration
- `src/app/api/health/route.ts` - Manual handling

**Impact:** 🔴 High - Inconsistent error handling, security, dan logging

**Rekomendasi:**
1. Migrate semua routes ke `createApiRoute()` pattern
2. Remove manual `requireAuth()` calls
3. Standardize response format dengan `createSuccessResponse()`

---

### 2. **Error Handling Tidak Konsisten**

**Masalah:**
- Mixing antara `handleAPIError()`, `NextResponse.json()`, dan `throw Error`
- Beberapa routes return error langsung, yang lain throw
- Inconsistent error message format

**Contoh Inkonsistensi:**

```typescript
// ❌ Pattern 1: Direct NextResponse.json
return NextResponse.json(
  { error: ERROR_MESSAGES.SAVE_FAILED },
  { status: 500 }
)

// ❌ Pattern 2: handleAPIError with new Error
return handleAPIError(new Error('Request body is required'), 'API Route')

// ❌ Pattern 3: handleAPIError with caught error
return handleAPIError(error, 'GET /api/orders')

// ❌ Pattern 4: Throw error (caught by route factory)
throw new Error('Invalid status transition')

// ✅ SHOULD BE: Consistent pattern
return handleAPIError(error, 'GET /api/customers')
```

**Files Affected:**
- `src/app/api/ingredients/import/route.ts` - Direct NextResponse
- `src/app/api/orders/import/route.ts` - Mixed patterns
- `src/app/api/whatsapp-templates/[[...slug]]/route.ts` - Inconsistent error wrapping

**Impact:** 🔴 High - Sulit debugging, inconsistent error responses ke client

**Rekomendasi:**
1. Standardize: Semua errors harus melalui `handleAPIError()`
2. Remove direct `NextResponse.json()` untuk errors
3. Consistent error context naming (endpoint path)

---

### 3. **Service Layer Tidak Konsisten**

**Masalah:**
- Ada 2 lokasi services: `src/lib/services/` dan `src/services/`
- Beberapa services extend `BaseService`, yang lain tidak
- Inconsistent constructor patterns

**Struktur Saat Ini:**

```
src/lib/services/          src/services/
├── base-service.ts        ├── ai/
├── customer-service.ts    ├── hpp/
├── BusinessContext...     ├── inventory/
├── ChatSession...         ├── orders/
├── AIFallback...          ├── production/
└── RateLimiter...         ├── recipes/
                           └── reports/
```

**Contoh Inkonsistensi:**

```typescript
// ❌ Pattern 1: Extends BaseService (src/lib/services/customer-service.ts)
export class CustomerService extends BaseService {
  constructor(context: ServiceContext) {
    super(context)
  }
}

// ❌ Pattern 2: Standalone with Supabase injection (src/services/production/ProductionService.ts)
export class ProductionService {
  constructor(private supabase: SupabaseClient<Database>) {}
}

// ❌ Pattern 3: Static methods only (src/services/production/ProductionBatchService.ts)
export class ProductionBatchService {
  static async getSuggestedBatches(userId: string) {
    const supabase = await createClient()
    // ...
  }
}
```

**Impact:** 🔴 High - Sulit maintain, no consistent audit logging, mixed DI patterns

**Rekomendasi:**
1. **Consolidate:** Pindahkan semua services ke `src/services/` dengan struktur domain
2. **Standardize:** Semua services harus extend `BaseService`
3. **Consistent DI:** Gunakan `ServiceContext` pattern untuk semua services
4. **Audit Trail:** Leverage `executeWithAudit()` dari BaseService

---

### 4. **Supabase Client Creation Tidak Konsisten**

**Masalah:**
- Mixing antara `createClient()`, `createServiceRoleClient()`, dan `context.supabase`
- Beberapa services create client sendiri, yang lain inject via constructor
- Potential RLS bypass issues

**Contoh Inkonsistensi:**

```typescript
// ❌ Pattern 1: Create client inside service method
static async getSuggestedBatches(userId: string) {
  const supabase = await createClient()  // ❌ Creates new client every call
  // ...
}

// ❌ Pattern 2: Import and create in route
import { createClient } from '@/utils/supabase/server'
const supabase = await createClient()

// ✅ Pattern 3: Use context.supabase (CORRECT)
export const GET = createApiRoute(
  { ... },
  async (context: RouteContext) => {
    const { supabase } = context  // ✅ Reuse from context
    // ...
  }
)

// ✅ Pattern 4: Inject via constructor (CORRECT)
export class ReportService {
  constructor(private supabase: SupabaseClient<Database>) {}
}
```

**Files Affected:**
- `src/services/production/ProductionBatchService.ts` - Creates client in static methods
- `src/app/api/errors/route.ts` - Creates client manually
- `src/app/api/ai/generate-recipe/services/hpp-calculator.ts` - Creates client inside function

**Impact:** 🔴 High - Performance overhead, potential RLS issues, connection pool exhaustion

**Rekomendasi:**
1. **NEVER** create Supabase client inside service methods
2. **ALWAYS** use `context.supabase` in API routes
3. **ALWAYS** inject Supabase via constructor in services
4. Remove all `await createClient()` calls from services

---

### 5. **Validation Schema Tidak Konsisten**

**Masalah:**
- Beberapa routes define schema inline, yang lain import dari validations
- Mixing antara Zod schema di route file vs validation file
- Inconsistent schema naming

**Contoh Inkonsistensi:**

```typescript
// ❌ Pattern 1: Inline schema in route file
const RecipeUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  // ... defined in route.ts
})

// ✅ Pattern 2: Import from validations (CORRECT)
import { CustomerInsertSchema, CustomerUpdateSchema } from '@/lib/validations/domains/customer'

export const POST = createApiRoute({
  bodySchema: CustomerInsertSchema  // ✅ Reusable, centralized
})
```

**Files Affected:**
- `src/app/api/recipes/[[...slug]]/route.ts` - Inline `RecipeUpdateSchema`
- `src/app/api/orders/calculate-price/route.ts` - Inline `OrderItemSchema`
- `src/app/api/production/suggestions/route.ts` - Inline `CreateBatchSchema`

**Impact:** 🟡 Medium - Schema duplication, sulit maintain validation rules

**Rekomendasi:**
1. Move semua schemas ke `src/lib/validations/domains/`
2. Consistent naming: `{Entity}InsertSchema`, `{Entity}UpdateSchema`, `{Entity}QuerySchema`
3. Remove inline schemas dari route files

---

## 🟡 MEDIUM PRIORITY ISSUES

### 6. **Response Format Tidak Konsisten**

**Masalah:**
- Mixing antara `createSuccessResponse()` dan manual `NextResponse.json()`
- Inconsistent pagination metadata format
- Some routes return raw data, others wrap in `{ data: ... }`

**Contoh Inkonsistensi:**

```typescript
// ❌ Pattern 1: Manual NextResponse
return NextResponse.json({ alerts })

// ❌ Pattern 2: Inconsistent success wrapper
return NextResponse.json({ success: true, data: ingredients })

// ✅ Pattern 3: Standard createSuccessResponse (CORRECT)
return createSuccessResponse(data, message, pagination)
```

**Impact:** 🟡 Medium - Frontend harus handle multiple response formats

**Rekomendasi:**
1. **ALWAYS** use `createSuccessResponse()` untuk success responses
2. Standardize pagination format via `createPaginationMeta()`
3. Remove manual `NextResponse.json()` calls

---

### 7. **Logging Tidak Konsisten**

**Masalah:**
- Mixing antara `apiLogger`, `dbLogger`, dan `console.log`
- Inconsistent log levels (info vs debug vs warn)
- Missing structured logging context

**Contoh Inkonsistensi:**

```typescript
// ❌ Pattern 1: Console.log (NEVER USE)
console.log('Order created:', orderId)

// ❌ Pattern 2: Inconsistent context
apiLogger.info('Recipe created')  // Missing userId, recipeId

// ✅ Pattern 3: Structured logging (CORRECT)
apiLogger.info({ 
  userId: user.id, 
  recipeId: recipe.id,
  ingredientsCount: ingredients.length 
}, 'Recipe created successfully')
```

**Impact:** 🟡 Medium - Sulit debugging production issues

**Rekomendasi:**
1. **NEVER** use `console.log/error/warn` - use `apiLogger` only
2. **ALWAYS** include structured context: `{ userId, resourceId, ... }`
3. Consistent log messages: `'{Action} {Resource} {Status}'`

---

### 8. **Security Preset Tidak Konsisten**

**Masalah:**
- Beberapa routes tidak specify `securityPreset`
- Mixing antara `basic()`, `enhanced()`, `polling()`
- Tidak ada guideline kapan pakai preset apa

**Contoh Inkonsistensi:**

```typescript
// ❌ No security preset specified
export const GET = createApiRoute({
  method: 'GET',
  path: '/api/customers'
  // Missing securityPreset!
})

// ✅ Explicit security preset (CORRECT)
export const GET = createApiRoute({
  method: 'GET',
  path: '/api/customers',
  securityPreset: SecurityPresets.basic()  // ✅ Explicit
})
```

**Impact:** 🟡 Medium - Inconsistent security posture

**Rekomendasi:**
1. **ALWAYS** specify `securityPreset` explicitly
2. Guidelines:
   - `basic()` - Standard CRUD operations
   - `enhanced()` - Sensitive data (financial, user data)
   - `polling()` - High-frequency endpoints (notifications)
   - `maximum()` - Admin/critical operations

---

### 9. **Cache Invalidation Tidak Konsisten**

**Masalah:**
- Beberapa mutations invalidate cache, yang lain tidak
- Inconsistent cache key generation
- Missing cache invalidation di beberapa critical paths

**Contoh Inkonsistensi:**

```typescript
// ❌ Missing cache invalidation
export const POST = createApiRoute({...}, async (context) => {
  await supabase.from('recipes').insert(data)
  // ❌ Missing: cacheInvalidation.recipes()
  return createSuccessResponse(data)
})

// ✅ Proper cache invalidation (CORRECT)
export const POST = createApiRoute({...}, async (context) => {
  await supabase.from('recipes').insert(data)
  cacheInvalidation.recipes()  // ✅ Invalidate cache
  return createSuccessResponse(data)
})
```

**Files Affected:**
- `src/app/api/ingredients/[[...slug]]/route.ts` - Missing invalidation
- `src/app/api/production/batches/[[...slug]]/route.ts` - Missing invalidation
- `src/app/api/suppliers/[[...slug]]/route.ts` - Inconsistent invalidation

**Impact:** 🟡 Medium - Stale data di frontend

**Rekomendasi:**
1. **ALWAYS** invalidate cache after mutations (POST/PUT/DELETE)
2. Use `cacheInvalidation.{resource}()` helper
3. Document cache dependencies

---

### 10. **Type Safety Tidak Konsisten**

**Masalah:**
- Mixing antara typed dan untyped Supabase queries
- Inconsistent use of Database types
- Some services use `any` or loose typing

**Contoh Inkonsistensi:**

```typescript
// ❌ Untyped Supabase client
const { data } = await supabase.from('recipes').select('*')
// data is 'any'

// ✅ Typed Supabase client (CORRECT)
const typedSupabase = supabase as SupabaseClient<Database>
const { data } = await typedSupabase.from('recipes').select('*')
// data is properly typed
```

**Impact:** 🟡 Medium - Runtime errors, poor IDE support

**Rekomendasi:**
1. **ALWAYS** cast to `SupabaseClient<Database>` when needed
2. Use generated types from `src/types/database.ts`
3. Avoid `any` types - use `unknown` and type guards

---

## 🟢 LOW PRIORITY ISSUES

### 11. **Runtime Declaration Tidak Konsisten**

**Masalah:**
- Beberapa routes declare `export const runtime = 'nodejs'`, yang lain tidak
- Inconsistent placement (top vs after imports)

**Rekomendasi:**
1. **ALWAYS** declare runtime di top of file (after comments)
2. Use `nodejs` runtime untuk semua API routes (required for DOMPurify)

---

### 12. **Import Organization Tidak Konsisten**

**Masalah:**
- Inconsistent import grouping
- Mixing relative dan absolute imports
- No consistent ordering

**Rekomendasi:**
1. Standardize import order:
   ```typescript
   // External libraries
   import { z } from 'zod'
   
   // Internal modules - Core
   import { createApiRoute } from '@/lib/api/route-factory'
   
   // Internal modules - Utils
   import { apiLogger } from '@/lib/logger'
   
   // Types and schemas
   import type { Database } from '@/types/database'
   
   // Constants and config
   import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
   ```

---

### 13. **Query Parameter Handling Tidak Konsisten**

**Masalah:**
- Beberapa routes parse query params manual, yang lain via schema
- Inconsistent default values
- Missing validation untuk query params

**Rekomendasi:**
1. **ALWAYS** use `querySchema` in `createApiRoute()`
2. Define default values in schema, not in handler
3. Use Zod coercion untuk type conversion

---

### 14. **Success Message Tidak Konsisten**

**Masalah:**
- Beberapa routes return success message, yang lain tidak
- Mixing Indonesian dan English messages
- Inconsistent message format

**Rekomendasi:**
1. **ALWAYS** use constants from `SUCCESS_MESSAGES`
2. Consistent language (Indonesian for user-facing)
3. Format: `{Entity} {Action} successfully` (e.g., "Resep berhasil dibuat")

---

### 15. **API Route Naming Tidak Konsisten**

**Masalah:**
- Mixing antara `[[...slug]]` dan `[...slug]` dan `[id]`
- Inconsistent catch-all route patterns
- Confusing route structure

**Current Structure:**
```
/api/customers/[[...slug]]/route.ts  ✅ Optional catch-all
/api/recipes/[[...slug]]/route.ts    ✅ Optional catch-all
/api/orders/[[...slug]]/route.ts     ✅ Optional catch-all
/api/reports/[...slug]/route.ts      ❌ Required catch-all (inconsistent)
/api/hpp/[...slug]/route.ts          ❌ Required catch-all (inconsistent)
```

**Rekomendasi:**
1. **Standardize:** Use `[[...slug]]` (optional catch-all) untuk semua CRUD routes
2. Use `[...slug]` (required) hanya untuk dynamic routing yang memang required
3. Document routing patterns di README

---

## 📋 STANDARDIZATION CHECKLIST

### API Route Standards

```typescript
// ✅ STANDARD API ROUTE TEMPLATE
export const runtime = 'nodejs'

// External libraries
import { z } from 'zod'

// Internal modules
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createSuccessResponse } from '@/lib/api-core'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { SecurityPresets } from '@/utils/security/api-middleware'
import { cacheInvalidation } from '@/lib/cache'
import { apiLogger } from '@/lib/logger'

// Types and schemas
import { EntityInsertSchema, EntityUpdateSchema } from '@/lib/validations/domains/entity'
import type { Database } from '@/types/database'

// Constants
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'

// GET /api/entities or /api/entities/[id]
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/entities',
    querySchema: ListQuerySchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, validatedQuery) => {
    const { user, supabase } = context
    
    try {
      // Business logic here
      const data = await fetchData(supabase, user.id)
      
      apiLogger.info({ 
        userId: user.id, 
        count: data.length 
      }, 'Entities fetched successfully')
      
      return createSuccessResponse(data)
    } catch (error) {
      return handleAPIError(error, 'GET /api/entities')
    }
  }
)

// POST /api/entities
export const POST = createApiRoute(
  {
    method: 'POST',
    path: '/api/entities',
    bodySchema: EntityInsertSchema,
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext, _query, body) => {
    const { user, supabase } = context
    
    try {
      const data = await createEntity(supabase, user.id, body)
      
      cacheInvalidation.entities()
      
      apiLogger.info({ 
        userId: user.id, 
        entityId: data.id 
      }, 'Entity created successfully')
      
      return createSuccessResponse(data, SUCCESS_MESSAGES.ENTITY_CREATED, undefined, 201)
    } catch (error) {
      return handleAPIError(error, 'POST /api/entities')
    }
  }
)
```

### Service Standards

```typescript
// ✅ STANDARD SERVICE TEMPLATE
import type { SupabaseClient } from '@supabase/supabase-js'
import { BaseService, type ServiceContext } from '@/lib/services/base-service'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/database'

export class EntityService extends BaseService {
  constructor(context: ServiceContext) {
    super(context)
  }

  async getEntity(entityId: string): Promise<Entity> {
    return this.executeWithAudit(
      async () => {
        const { data, error } = await this.context.supabase
          .from('entities')
          .select('*')
          .eq('id', entityId)
          .eq('user_id', this.context.userId)
          .single()

        if (error) throw error
        if (!data) throw new Error('Entity not found')

        return data
      },
      'READ',
      'ENTITY',
      entityId
    )
  }

  async createEntity(input: EntityInsert): Promise<Entity> {
    return this.executeWithAudit(
      async () => {
        const { data, error } = await this.context.supabase
          .from('entities')
          .insert({
            ...input,
            user_id: this.context.userId
          })
          .select()
          .single()

        if (error) throw error
        return data
      },
      'CREATE',
      'ENTITY',
      undefined,
      { input }
    )
  }
}
```

---

## 🎯 ACTION PLAN

### Phase 1: Critical Fixes (Week 1-2)
1. ✅ Migrate semua routes ke `createApiRoute()` pattern
2. ✅ Standardize error handling dengan `handleAPIError()`
3. ✅ Consolidate services ke `src/services/` dengan BaseService
4. ✅ Fix Supabase client creation patterns

### Phase 2: Medium Priority (Week 3-4)
5. ✅ Standardize response format dengan `createSuccessResponse()`
6. ✅ Fix logging patterns (remove console.log, add structured context)
7. ✅ Add explicit security presets ke semua routes
8. ✅ Fix cache invalidation di semua mutations

### Phase 3: Polish (Week 5-6)
9. ✅ Move inline schemas ke validation files
10. ✅ Improve type safety dengan proper Database types
11. ✅ Standardize import organization
12. ✅ Add missing query parameter validation
13. ✅ Standardize success messages
14. ✅ Fix route naming inconsistencies
15. ✅ Add comprehensive documentation

---

## 📈 METRICS

### Current State
- **Routes using createApiRoute:** ~70%
- **Routes with proper error handling:** ~60%
- **Services extending BaseService:** ~30%
- **Proper Supabase client usage:** ~75%
- **Consistent logging:** ~50%

### Target State (Post-Standardization)
- **Routes using createApiRoute:** 100%
- **Routes with proper error handling:** 100%
- **Services extending BaseService:** 100%
- **Proper Supabase client usage:** 100%
- **Consistent logging:** 100%

---

## 🔧 TOOLS & AUTOMATION

### Recommended Tools
1. **ESLint Rules:** Add custom rules untuk enforce patterns
2. **Pre-commit Hooks:** Validate route structure before commit
3. **Code Generator:** Template generator untuk new routes/services
4. **Migration Scripts:** Automated migration untuk old patterns

### Example ESLint Rule
```javascript
// .eslintrc.js
rules: {
  'no-console': 'error',  // Prevent console.log
  'no-restricted-imports': ['error', {
    patterns: ['**/utils/supabase/server']  // Prevent direct createClient import in services
  }]
}
```

---

## 📚 DOCUMENTATION NEEDS

1. **API Route Development Guide**
   - Standard template
   - Best practices
   - Common patterns

2. **Service Layer Guide**
   - BaseService usage
   - Dependency injection
   - Audit logging

3. **Error Handling Guide**
   - Error types
   - Error messages
   - Client error handling

4. **Security Guide**
   - Security presets
   - RLS patterns
   - Authentication flow

---

## ✅ CONCLUSION

Backend HeyTrack memerlukan **standardisasi signifikan** untuk meningkatkan maintainability, consistency, dan developer experience. Dengan mengikuti action plan di atas, kita bisa mencapai:

1. **100% consistent API patterns**
2. **Improved error handling & debugging**
3. **Better type safety**
4. **Easier onboarding untuk new developers**
5. **Reduced bugs & technical debt**

**Estimated Effort:** 4-6 weeks untuk complete standardization  
**Priority:** 🔴 HIGH - Should start immediately

---

**Next Steps:**
1. Review dokumen ini dengan team
2. Prioritize critical issues
3. Create detailed migration plan
4. Start Phase 1 implementation
5. Setup monitoring & metrics

