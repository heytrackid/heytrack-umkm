---
inclusion: always
---

# API Route Patterns & Best Practices

## Standard API Route Structure

Every API route should follow this consistent structure:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    // 1. Create authenticated client
    const supabase = await createClient()
    
    // 2. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    // 3. Validate query parameters
    const { searchParams } = new URL(request.url)
    const validation = QuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    
    if (!validation.success) {
      throw new APIError('Invalid query parameters', 400, 'VALIDATION_ERROR')
    }

    // 4. Execute business logic with RLS
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('user_id', user.id)  // Always filter by user_id
    
    if (error) throw error

    // 5. Return success response
    return NextResponse.json(data)

  } catch (error: unknown) {
    return handleAPIError(error)
  }
}
```

## CRUD Patterns

### GET - List with Pagination

```typescript
const page = parseInt(searchParams.get('page') || '1')
const limit = parseInt(searchParams.get('limit') || '10')
const offset = (page - 1) * limit

let query = supabase
  .from('table')
  .select('*', { count: 'exact' })
  .eq('user_id', user.id)
  .range(offset, offset + limit - 1)

const { data, error, count } = await query
```

### POST - Create Resource

```typescript
const body = await request.json()
const validation = CreateSchema.safeParse(body)

if (!validation.success) {
  throw new APIError('Invalid request data', 400, 'VALIDATION_ERROR')
}

const { data, error } = await supabase
  .from('table')
  .insert({
    ...validation.data,
    user_id: user.id  // Always set user_id
  })
  .select()
  .single()

// Invalidate cache after mutation
cacheInvalidation.table()

return NextResponse.json(data, { status: 201 })
```

### PUT - Update Resource

```typescript
const { data, error } = await supabase
  .from('table')
  .update(validation.data)
  .eq('id', params.id)
  .eq('user_id', user.id)  // RLS enforcement
  .select()
  .single()

if (error?.code === 'PGRST116') {
  throw new APIError('Resource not found', 404, 'NOT_FOUND')
}
```

### DELETE - Remove Resource

```typescript
const { error } = await supabase
  .from('table')
  .delete()
  .eq('id', params.id)
  .eq('user_id', user.id)  // RLS enforcement

return NextResponse.json({ message: 'Deleted successfully' })
```

## Security Checklist

- [ ] Authentication check at route start
- [ ] Input validation with Zod schemas
- [ ] RLS enforcement (user_id filter)
- [ ] Proper error handling
- [ ] Cache invalidation after mutations
- [ ] Use apiLogger (not console)

## Common Patterns

**Authentication:**
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
  throw new APIError('Unauthorized', 401)
}
```

**Validation:**
```typescript
const validation = Schema.safeParse(body)
if (!validation.success) {
  throw new APIError('Invalid data', 400, 'VALIDATION_ERROR')
}
```

**RLS Filter:**
```typescript
.eq('user_id', user.id)  // Always include this
```

**Error Handling:**
```typescript
} catch (error: unknown) {
  return handleAPIError(error)
}
```
