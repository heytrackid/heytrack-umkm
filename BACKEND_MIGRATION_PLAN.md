# Backend Migration & Standardization Plan

**Project:** HeyTrack Backend Standardization  
**Duration:** 6 weeks  
**Start Date:** TBD  
**Owner:** Backend Team

---

## 🎯 OBJECTIVES

1. Achieve 100% consistency across all API routes
2. Standardize service layer architecture
3. Improve error handling and logging
4. Enhance type safety and developer experience
5. Reduce technical debt by 80%

---

## 📊 PHASE 1: CRITICAL INFRASTRUCTURE (Week 1-2)

### Task 1.1: Migrate All Routes to createApiRoute Pattern

**Priority:** 🔴 CRITICAL  
**Effort:** 3 days  
**Owner:** Backend Lead

**Files to Migrate:**
```
src/app/api/errors/route.ts
src/app/api/ingredients/import/route.ts
src/app/api/health/route.ts
src/app/api/diagnostics/route.ts
```

**Migration Steps:**

1. **Identify Old Pattern Routes**
```bash
# Find routes not using createApiRoute
grep -r "export const GET\|POST\|PUT\|DELETE" src/app/api --include="*.ts" | \
  grep -v "createApiRoute"
```

2. **Migration Template**
```typescript
// BEFORE
export async function GET(request: NextRequest) {
  const authResult = await requireAuth()
  if (isErrorResponse(authResult)) return authResult
  
  try {
    const data = await fetchData()
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// AFTER
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/resource',
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext) => {
    const { user, supabase } = context
    
    try {
      const data = await fetchData(supabase, user.id)
      return createSuccessResponse(data)
    } catch (error) {
      return handleAPIError(error, 'GET /api/resource')
    }
  }
)
```

3. **Testing Checklist**
- [ ] Authentication works correctly
- [ ] Error responses are consistent
- [ ] Logging includes proper context
- [ ] Security headers are applied
- [ ] Rate limiting works

**Acceptance Criteria:**
- ✅ All routes use `createApiRoute()`
- ✅ No manual `requireAuth()` calls
- ✅ All routes have explicit `securityPreset`
- ✅ All tests pass

---

### Task 1.2: Standardize Error Handling

**Priority:** 🔴 CRITICAL  
**Effort:** 2 days  
**Owner:** Backend Developer

**Current Issues:**
```typescript
// ❌ Issue 1: Direct NextResponse.json
return NextResponse.json({ error: 'Failed' }, { status: 500 })

// ❌ Issue 2: Inconsistent error wrapping
return handleAPIError(new Error('Message'), 'API Route')

// ❌ Issue 3: Throwing without context
throw new Error('Invalid input')
```

**Standard Pattern:**
```typescript
// ✅ CORRECT: Always use handleAPIError
try {
  // Business logic
} catch (error) {
  return handleAPIError(error, 'GET /api/resource')
}

// ✅ CORRECT: For validation errors
if (!isValid) {
  return handleAPIError(
    new Error('Validation failed: Missing required field'),
    'POST /api/resource'
  )
}
```

**Migration Script:**
```bash
# Find all direct NextResponse.json error returns
grep -r "NextResponse.json.*error" src/app/api --include="*.ts"

# Find all throw statements without try-catch
grep -r "throw new Error" src/app/api --include="*.ts"
```

**Acceptance Criteria:**
- ✅ No direct `NextResponse.json()` for errors
- ✅ All errors go through `handleAPIError()`
- ✅ Consistent error context (endpoint path)
- ✅ Error responses follow standard format

---

### Task 1.3: Consolidate Service Layer

**Priority:** 🔴 CRITICAL  
**Effort:** 4 days  
**Owner:** Backend Lead

**Current Structure:**
```
src/lib/services/          src/services/
├── base-service.ts        ├── ai/
├── customer-service.ts    ├── hpp/
├── BusinessContext...     ├── inventory/
└── ...                    └── ...
```

**Target Structure:**
```
src/services/
├── base/
│   ├── BaseService.ts
│   └── ServiceContext.ts
├── customers/
│   └── CustomerService.ts
├── recipes/
│   └── RecipeService.ts
├── orders/
│   ├── OrderService.ts
│   └── OrderImportService.ts
├── production/
│   ├── ProductionService.ts
│   └── ProductionBatchService.ts
├── hpp/
│   ├── HppService.ts
│   └── HppCalculatorService.ts
├── inventory/
│   └── InventoryAlertService.ts
├── reports/
│   └── ReportService.ts
└── ai/
    └── AiService.ts
```

**Migration Steps:**

1. **Move BaseService to new location**
```bash
mkdir -p src/services/base
mv src/lib/services/base-service.ts src/services/base/BaseService.ts
```

2. **Update all service imports**
```typescript
// Update from:
import { BaseService } from '@/lib/services/base-service'

// To:
import { BaseService } from '@/services/base/BaseService'
```

3. **Migrate each service to extend BaseService**
```typescript
// BEFORE
export class ProductionService {
  constructor(private supabase: SupabaseClient<Database>) {}
  
  async getBatches(userId: string) {
    const { data } = await this.supabase
      .from('production_batches')
      .select('*')
      .eq('user_id', userId)
    return data
  }
}

// AFTER
export class ProductionService extends BaseService {
  constructor(context: ServiceContext) {
    super(context)
  }
  
  async getBatches(): Promise<ProductionBatch[]> {
    return this.executeWithAudit(
      async () => {
        const { data, error } = await this.context.supabase
          .from('production_batches')
          .select('*')
          .eq('user_id', this.context.userId)
        
        if (error) throw error
        return data || []
      },
      'READ',
      'PRODUCTION_BATCH'
    )
  }
}
```

4. **Update API routes to use new service pattern**
```typescript
// BEFORE
const productionService = new ProductionService(context.supabase)
const batches = await productionService.getBatches(user.id)

// AFTER
const productionService = new ProductionService({
  userId: user.id,
  supabase: context.supabase,
  audit: true
})
const batches = await productionService.getBatches()
```

**Acceptance Criteria:**
- ✅ All services in `src/services/` with domain structure
- ✅ All services extend `BaseService`
- ✅ No services create Supabase client internally
- ✅ All services use `ServiceContext` pattern
- ✅ Audit logging works for all operations

---

### Task 1.4: Fix Supabase Client Usage

**Priority:** 🔴 CRITICAL  
**Effort:** 2 days  
**Owner:** Backend Developer

**Issues to Fix:**

1. **Remove client creation in services**
```typescript
// ❌ BEFORE
static async getSuggestedBatches(userId: string) {
  const supabase = await createClient()  // ❌ BAD
  // ...
}

// ✅ AFTER
async getSuggestedBatches(): Promise<Batch[]> {
  const { data } = await this.context.supabase  // ✅ GOOD
    .from('production_batches')
    .select('*')
  return data || []
}
```

2. **Remove manual client creation in routes**
```typescript
// ❌ BEFORE
import { createClient } from '@/utils/supabase/server'
const supabase = await createClient()

// ✅ AFTER
const { supabase } = context  // Already available
```

3. **Convert static methods to instance methods**
```typescript
// ❌ BEFORE
export class ProductionBatchService {
  static async getSuggestedBatches(userId: string) {
    const supabase = await createClient()
    // ...
  }
}

// ✅ AFTER
export class ProductionBatchService extends BaseService {
  async getSuggestedBatches(): Promise<Batch[]> {
    // Use this.context.supabase
  }
}
```

**Files to Fix:**
- `src/services/production/ProductionBatchService.ts`
- `src/app/api/errors/route.ts`
- `src/app/api/ai/generate-recipe/services/hpp-calculator.ts`

**Acceptance Criteria:**
- ✅ No `await createClient()` in services
- ✅ No `await createClient()` in routes (except health check)
- ✅ All services use injected Supabase client
- ✅ Performance improved (no redundant client creation)

---

## 📊 PHASE 2: CONSISTENCY & QUALITY (Week 3-4)

### Task 2.1: Standardize Response Format

**Priority:** 🟡 HIGH  
**Effort:** 2 days

**Migration:**
```typescript
// ❌ BEFORE
return NextResponse.json({ alerts })
return NextResponse.json({ success: true, data: ingredients })

// ✅ AFTER
return createSuccessResponse(alerts)
return createSuccessResponse(ingredients)
```

**Files to Update:**
- All routes returning manual `NextResponse.json()`
- Ensure pagination uses `createPaginationMeta()`

---

### Task 2.2: Fix Logging Patterns

**Priority:** 🟡 HIGH  
**Effort:** 2 days

**Standards:**
```typescript
// ❌ NEVER
console.log('Order created')
apiLogger.info('Recipe created')

// ✅ ALWAYS
apiLogger.info({ 
  userId: user.id, 
  orderId: order.id,
  totalAmount: order.total_amount
}, 'Order created successfully')
```

**Migration Script:**
```bash
# Find all console.log usage
grep -r "console\.\(log\|error\|warn\)" src/app/api --include="*.ts"

# Find logging without context
grep -r "apiLogger\.\(info\|error\|warn\)('[^']*')" src/app/api --include="*.ts"
```

---

### Task 2.3: Add Security Presets

**Priority:** 🟡 HIGH  
**Effort:** 1 day

**Guidelines:**
- `basic()` - Standard CRUD (customers, recipes, ingredients)
- `enhanced()` - Sensitive data (financial, orders, hpp)
- `polling()` - High-frequency (notifications, alerts)
- `maximum()` - Admin operations (error logs, diagnostics)

**Audit:**
```bash
# Find routes without securityPreset
grep -r "createApiRoute" src/app/api --include="*.ts" -A 5 | \
  grep -v "securityPreset"
```

---

### Task 2.4: Fix Cache Invalidation

**Priority:** 🟡 HIGH  
**Effort:** 1 day

**Pattern:**
```typescript
export const POST = createApiRoute({...}, async (context) => {
  const data = await createResource(...)
  
  cacheInvalidation.resources()  // ✅ Always invalidate
  
  return createSuccessResponse(data)
})
```

**Checklist:**
- [ ] All POST routes invalidate cache
- [ ] All PUT routes invalidate cache
- [ ] All DELETE routes invalidate cache
- [ ] Related caches also invalidated (e.g., orders → customers)

---

## 📊 PHASE 3: POLISH & DOCUMENTATION (Week 5-6)

### Task 3.1: Move Inline Schemas

**Priority:** 🟢 MEDIUM  
**Effort:** 2 days

**Target Structure:**
```
src/lib/validations/domains/
├── customer.ts
├── recipe.ts
├── order.ts
├── production.ts
├── hpp.ts
└── ...
```

**Pattern:**
```typescript
// src/lib/validations/domains/recipe.ts
export const RecipeInsertSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  // ...
})

export const RecipeUpdateSchema = RecipeInsertSchema.partial()

export const RecipeQuerySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().default(50),
  search: z.string().optional(),
})
```

---

### Task 3.2: Improve Type Safety

**Priority:** 🟢 MEDIUM  
**Effort:** 2 days

**Actions:**
1. Add explicit Database type casting where needed
2. Remove all `any` types
3. Add proper return types to all functions
4. Use type guards for runtime validation

---

### Task 3.3: Standardize Imports

**Priority:** 🟢 LOW  
**Effort:** 1 day

**Standard Order:**
```typescript
// External libraries
import { z } from 'zod'
import type { SupabaseClient } from '@supabase/supabase-js'

// Internal modules - Core
import { createApiRoute, type RouteContext } from '@/lib/api/route-factory'
import { createSuccessResponse } from '@/lib/api-core'

// Internal modules - Utils
import { apiLogger } from '@/lib/logger'
import { cacheInvalidation } from '@/lib/cache'

// Types and schemas
import type { Database } from '@/types/database'
import { EntityInsertSchema } from '@/lib/validations/domains/entity'

// Constants and config
import { SUCCESS_MESSAGES } from '@/lib/constants/messages'
```

---

### Task 3.4: Documentation

**Priority:** 🟢 MEDIUM  
**Effort:** 3 days

**Documents to Create:**

1. **API Route Development Guide**
   - Standard template
   - Best practices
   - Common patterns
   - Error handling guide

2. **Service Layer Guide**
   - BaseService usage
   - ServiceContext pattern
   - Audit logging
   - Testing services

3. **Security Guide**
   - Security presets
   - RLS patterns
   - Authentication flow
   - Authorization patterns

4. **Type Safety Guide**
   - Database types
   - Type guards
   - Generic patterns
   - Common pitfalls

---

## 🧪 TESTING STRATEGY

### Unit Tests
```typescript
describe('CustomerService', () => {
  it('should create customer with audit log', async () => {
    const service = new CustomerService(mockContext)
    const customer = await service.createCustomer(mockData)
    
    expect(customer).toBeDefined()
    expect(mockAuditLogger).toHaveBeenCalledWith(
      mockContext.userId,
      'CREATE',
      'CUSTOMER',
      customer.id
    )
  })
})
```

### Integration Tests
```typescript
describe('POST /api/customers', () => {
  it('should create customer and return 201', async () => {
    const response = await POST(mockRequest, mockParams)
    
    expect(response.status).toBe(201)
    expect(response.json()).toMatchObject({
      success: true,
      data: expect.objectContaining({ id: expect.any(String) })
    })
  })
})
```

### E2E Tests
- Test complete user flows
- Verify cache invalidation
- Check audit logs
- Validate error responses

---

## 📈 SUCCESS METRICS

### Code Quality Metrics
- **Test Coverage:** 80%+ for services, 70%+ for routes
- **Type Safety:** 0 `any` types, 100% explicit return types
- **Consistency:** 100% routes using `createApiRoute()`
- **Error Handling:** 100% using `handleAPIError()`

### Performance Metrics
- **Response Time:** < 200ms for simple queries
- **Cache Hit Rate:** > 80% for frequently accessed data
- **Database Connections:** Stable pool usage (no leaks)

### Developer Experience
- **Onboarding Time:** < 1 day for new developers
- **Code Review Time:** -50% (more consistent patterns)
- **Bug Rate:** -60% (better error handling)

---

## 🚀 ROLLOUT PLAN

### Week 1-2: Phase 1 (Critical)
- Day 1-3: Migrate routes to createApiRoute
- Day 4-5: Standardize error handling
- Day 6-8: Consolidate service layer
- Day 9-10: Fix Supabase client usage

### Week 3-4: Phase 2 (Quality)
- Day 11-12: Standardize responses
- Day 13-14: Fix logging
- Day 15: Add security presets
- Day 16: Fix cache invalidation
- Day 17-20: Testing & bug fixes

### Week 5-6: Phase 3 (Polish)
- Day 21-22: Move schemas
- Day 23-24: Improve type safety
- Day 25: Standardize imports
- Day 26-28: Documentation
- Day 29-30: Final review & deployment

---

## ⚠️ RISKS & MITIGATION

### Risk 1: Breaking Changes
**Mitigation:**
- Comprehensive test suite before migration
- Feature flags for gradual rollout
- Rollback plan for each phase

### Risk 2: Performance Regression
**Mitigation:**
- Performance benchmarks before/after
- Load testing for critical endpoints
- Monitoring & alerting

### Risk 3: Developer Resistance
**Mitigation:**
- Clear documentation
- Training sessions
- Code review support
- Gradual adoption

---

## 📞 SUPPORT & COMMUNICATION

### Daily Standups
- Progress updates
- Blocker discussion
- Next steps planning

### Weekly Reviews
- Demo completed work
- Metrics review
- Adjust plan if needed

### Communication Channels
- Slack: #backend-standardization
- Docs: Notion/Confluence
- Issues: GitHub/Jira

---

## ✅ DEFINITION OF DONE

### Phase 1 Complete When:
- [ ] All routes use `createApiRoute()`
- [ ] All errors use `handleAPIError()`
- [ ] All services extend `BaseService`
- [ ] No manual Supabase client creation
- [ ] All tests pass
- [ ] Code review approved

### Phase 2 Complete When:
- [ ] All responses use `createSuccessResponse()`
- [ ] All logging is structured
- [ ] All routes have security presets
- [ ] Cache invalidation works correctly
- [ ] Performance benchmarks met

### Phase 3 Complete When:
- [ ] All schemas in validation files
- [ ] Type safety at 100%
- [ ] Imports standardized
- [ ] Documentation complete
- [ ] Team trained
- [ ] Production deployment successful

---

**Last Updated:** 22 November 2025  
**Version:** 1.0  
**Status:** Ready for Review

