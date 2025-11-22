# Backend Standardization - Quick Reference

---

## 📦 SERVICE PATTERN

### ✅ CORRECT
```typescript
import { BaseService, type ServiceContext } from '@/services/base'

export class MyService extends BaseService {
  constructor(context: ServiceContext) {
    super(context)
  }

  async doSomething(data: Data): Promise<Result> {
    return this.executeWithAudit(
      async () => {
        const { data, error } = await this.context.supabase
          .from('table')
          .select()
          .eq('user_id', this.context.userId)
        
        if (error) throw error
        return data
      },
      'READ',
      'RESOURCE_NAME'
    )
  }
}
```

### ❌ WRONG
```typescript
// DON'T DO THIS
export class MyService {
  static async doSomething(userId: string) {
    const supabase = await createClient() // ❌ NO!
    // ...
  }
}
```

---

## 🔌 API ROUTE PATTERN

### ✅ CORRECT
```typescript
export const GET = createApiRoute(
  {
    method: 'GET',
    path: '/api/resource',
    securityPreset: SecurityPresets.basic(),
  },
  async (context: RouteContext) => {
    const { user, supabase } = context
    
    const service = new MyService({
      userId: user.id,
      supabase,
      audit: true
    })
    
    const result = await service.doSomething()
    return createSuccessResponse(result)
  }
)
```

### ❌ WRONG
```typescript
// DON'T DO THIS
export async function GET(request: NextRequest) {
  const user = await requireAuth() // ❌ Manual auth
  const supabase = await createClient() // ❌ Create client
  return NextResponse.json({ data }) // ❌ Manual response
}
```

---

## 🎯 SECURITY PRESETS

```typescript
SecurityPresets.basic()      // Standard CRUD
SecurityPresets.enhanced()   // Sensitive data (financial, orders)
SecurityPresets.polling()    // High-frequency (notifications)
SecurityPresets.maximum()    // Admin operations
```

---

## 📝 ERROR HANDLING

### ✅ CORRECT
```typescript
try {
  const result = await service.doSomething()
  return createSuccessResponse(result)
} catch (error) {
  return handleAPIError(error, 'GET /api/resource')
}
```

### ❌ WRONG
```typescript
// DON'T DO THIS
return NextResponse.json({ error: 'Failed' }, { status: 500 })
```

---

## 📊 LOGGING

### ✅ CORRECT
```typescript
apiLogger.info({ 
  userId: user.id, 
  resourceId: resource.id,
  count: items.length
}, 'Resources fetched successfully')
```

### ❌ WRONG
```typescript
// DON'T DO THIS
console.log('Resources fetched')
apiLogger.info('Resources fetched') // Missing context
```

---

## 🔄 CACHE INVALIDATION

### ✅ CORRECT
```typescript
export const POST = createApiRoute({...}, async (context) => {
  const data = await createResource(...)
  
  cacheInvalidation.resources() // ✅ Always invalidate
  
  return createSuccessResponse(data)
})
```

---

## 📚 VALIDATION

### ✅ CORRECT
```typescript
// In src/lib/validations/domains/resource.ts
export const ResourceInsertSchema = z.object({
  name: z.string().min(1),
  // ...
})

// In route
export const POST = createApiRoute({
  bodySchema: ResourceInsertSchema, // ✅ Reusable
  // ...
})
```

### ❌ WRONG
```typescript
// DON'T DO THIS - inline schema
const schema = z.object({ name: z.string() })
```

---

## 🧪 TESTING

```bash
# Type check
pnpm run type-check

# Lint
pnpm run lint

# Tests
pnpm run test

# Full validation
pnpm run validate
```

---

## 📁 FILE STRUCTURE

```
src/
├── services/
│   ├── base/
│   │   ├── BaseService.ts
│   │   └── index.ts
│   ├── production/
│   │   ├── ProductionService.ts
│   │   └── ProductionBatchService.ts
│   ├── inventory/
│   │   └── InventoryAlertService.ts
│   └── ...
├── app/api/
│   ├── production/
│   │   └── suggestions/
│   │       └── route.ts
│   └── ...
└── lib/
    └── validations/
        └── domains/
            └── resource.ts
```

---

## 🚀 MIGRATION CHECKLIST

For each service:
- [ ] Extend BaseService
- [ ] Use ServiceContext
- [ ] Remove `await createClient()`
- [ ] Use `this.context.supabase`
- [ ] Use `this.context.userId`
- [ ] Wrap in `executeWithAudit()`
- [ ] Update API routes
- [ ] Run type check
- [ ] Test endpoint

---

## 📞 HELP

**Docs:**
- `BACKEND_STANDARDIZATION_ANALYSIS.md` - Full analysis
- `PHASE1_CONTINUATION_CHECKLIST.md` - Step-by-step
- `src/services/production/ProductionBatchService.ts` - Example

**Script:**
```bash
./scripts/migrate-services.sh
```

---

**Last Updated:** 22 November 2025

