---
inclusion: always
---

# API Route Development Checklist

Gunakan checklist ini setiap kali membuat atau memodifikasi API route.

## ✅ Pre-Development Checklist

Sebelum menulis code, pastikan:
- [ ] Endpoint sudah didesain dengan benar (GET/POST/PUT/DELETE)
- [ ] Validation schema sudah dibuat di `src/lib/validations/`
- [ ] Database table sudah ada dan RLS policy sudah aktif

---

## 🔒 Security Checklist (WAJIB!)

### 1. Authentication
```typescript
// ✅ ALWAYS add this at the start
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 2. RLS Enforcement
```typescript
// ✅ ALWAYS filter by user_id
.eq('user_id', user.id)

// ✅ ALWAYS set user_id on insert
const insertPayload = {
  ...data,
  user_id: user.id
}
```

### 3. Ownership Verification (for [id] routes)
```typescript
// ✅ Verify ownership before update/delete
const { data: existing } = await supabase
  .from('table')
  .select('id')
  .eq('id', id)
  .eq('user_id', user.id)
  .single()

if (!existing) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
```

---

## 📝 Code Structure Checklist

### Route Signature (Next.js 15)
```typescript
type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    // ...
  } catch (error: unknown) {
    // ...
  }
}
```

### Imports
```typescript
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'
import { cacheInvalidation } from '@/lib/cache'
import type { Database } from '@/types/supabase-generated'
```

---

## 🎯 Implementation Checklist

### GET Endpoint
- [ ] Auth check
- [ ] Filter by `user_id`
- [ ] Pagination (if list)
- [ ] Search/filter support
- [ ] Proper error handling
- [ ] Logging

### POST Endpoint
- [ ] Auth check
- [ ] Request validation (Zod schema)
- [ ] Set `user_id` in insert
- [ ] Cache invalidation
- [ ] Return created resource
- [ ] Proper error handling
- [ ] Logging

### PUT Endpoint
- [ ] Auth check
- [ ] Request validation (Zod schema)
- [ ] Ownership verification
- [ ] Filter by `user_id` in update
- [ ] Cache invalidation
- [ ] Return updated resource
- [ ] Proper error handling
- [ ] Logging

### DELETE Endpoint
- [ ] Auth check
- [ ] Ownership verification
- [ ] Check dependencies (prevent orphaned data)
- [ ] Filter by `user_id` in delete
- [ ] Cache invalidation
- [ ] Return success message
- [ ] Proper error handling
- [ ] Logging

---

## 🔍 Validation Checklist

### Request Validation
```typescript
const validation = Schema.safeParse(body)
if (!validation.success) {
  return NextResponse.json(
    { error: 'Invalid request data', details: validation.error.issues },
    { status: 400 }
  )
}
```

### Query Parameter Validation
```typescript
const { searchParams } = new URL(request.url)
const validation = QuerySchema.safeParse({
  page: searchParams.get('page'),
  limit: searchParams.get('limit'),
})
```

---

## 🗄️ Database Checklist

### Query Pattern
```typescript
const { data, error } = await supabase
  .from('table')
  .select('specific, fields, only')  // ✅ Don't use SELECT *
  .eq('user_id', user.id)  // ✅ ALWAYS filter by user_id
  .single()  // or .maybeSingle() if optional

if (error) {
  if (error.code === 'PGRST116') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  apiLogger.error({ error }, 'Error message')
  return NextResponse.json({ error: 'Failed' }, { status: 500 })
}
```

### Insert Pattern
```typescript
const insertPayload: Database['public']['Tables']['table']['Insert'] = {
  ...validatedData,
  user_id: user.id  // ✅ ALWAYS set user_id
}

const { data, error } = await supabase
  .from('table')
  .insert(insertPayload)
  .select('*')
  .single()
```

---

## 🚀 Performance Checklist

### Caching
```typescript
// After mutations (POST/PUT/DELETE)
await cacheInvalidation.specificResource()

// Or for related resources
await cacheInvalidation.all()
```

### Query Optimization
- [ ] Use specific field selection (not `SELECT *`)
- [ ] Add indexes for frequently queried fields
- [ ] Use pagination for large datasets
- [ ] Limit joined data

---

## 📊 Logging Checklist

### Success Logging
```typescript
apiLogger.info({ userId: user.id, resourceId }, 'Resource created')
```

### Error Logging
```typescript
apiLogger.error({ error, context: { userId, resourceId } }, 'Operation failed')
```

---

## ❌ Error Handling Checklist

### Standard Pattern
```typescript
try {
  // ... operation
} catch (error: unknown) {
  apiLogger.error({ error }, 'Error in METHOD /api/route')
  return NextResponse.json(
    { error: 'User-friendly message' },
    { status: 500 }
  )
}
```

### Common Error Codes
- `401` - Unauthorized (no auth)
- `403` - Forbidden (auth but no permission)
- `404` - Not found (PGRST116)
- `409` - Conflict (unique constraint, dependencies)
- `400` - Bad request (validation failed)
- `500` - Internal server error

---

## 🧪 Testing Checklist

Before committing:
- [ ] Test without auth token (should return 401)
- [ ] Test with different user (should not see other user's data)
- [ ] Test validation errors
- [ ] Test not found scenarios
- [ ] Test dependency constraints (for DELETE)
- [ ] Check diagnostics: `getDiagnostics(['path/to/route.ts'])`

---

## 🚫 Common Mistakes to Avoid

### ❌ DON'T:
```typescript
// Missing auth check
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select('*')
  // ❌ Anyone can access this!
}

// Missing user_id filter
.select('*')  // ❌ Returns all users' data!

// Using service role without 'server-only'
import { createServiceRoleClient } from '@/utils/supabase/service-role'
// ❌ Missing: import 'server-only'

// Inconsistent error naming
} catch (err: unknown) {  // ❌ Use 'error' not 'err'

// No cache invalidation
await supabase.from('table').insert(data)
return NextResponse.json(data)  // ❌ Cache not invalidated!
```

### ✅ DO:
```typescript
// Proper auth + RLS
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

const { data } = await supabase
  .from('table')
  .select('specific, fields')
  .eq('user_id', user.id)  // ✅ RLS enforced

// Proper error handling
} catch (error: unknown) {
  apiLogger.error({ error }, 'Message')
  return NextResponse.json({ error: 'Message' }, { status: 500 })
}

// Cache invalidation
await supabase.from('table').insert(data)
await cacheInvalidation.resource()
return NextResponse.json(data)
```

---

## 📚 References

- **Steering Rules:** `.kiro/steering/`
- **Code Quality:** `.kiro/steering/code-quality.md`
- **API Patterns:** `.kiro/steering/api-patterns.md`
- **Service Role Security:** `.kiro/steering/service-role-security.md`
- **Generated Types:** `src/types/supabase-generated.ts`
- **Validations:** `src/lib/validations/`

---

**Remember:** Security first, consistency always!
