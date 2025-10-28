# API Route Development Guide

## Quick Start Template

Copy this template when creating new API routes:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { handleAPIError, APIError } from '@/lib/errors/api-error-handler'
import { apiLogger } from '@/lib/logger'
import { cacheInvalidation } from '@/lib/cache'
import { YourSchema } from '@/lib/validations/domains/your-domain'

// GET - List resources
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const { data, error } = await supabase
      .from('your_table')
      .select('*')
      .eq('user_id', user.id)
      .range((page - 1) * limit, page * limit - 1)
    
    if (error) throw error

    return NextResponse.json(data)
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}

// POST - Create resource
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    const body = await request.json()
    const validation = YourSchema.safeParse(body)
    
    if (!validation.success) {
      throw new APIError(
        'Invalid request data',
        400,
        'VALIDATION_ERROR',
        validation.error.issues
      )
    }

    const { data, error } = await supabase
      .from('your_table')
      .insert({
        ...validation.data,
        user_id: user.id
      })
      .select()
      .single()
    
    if (error) throw error

    cacheInvalidation.yourResource()

    return NextResponse.json(data, { status: 201 })
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}

// PUT/PATCH - Update resource
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    const { id } = await params
    const body = await request.json()
    const validation = YourSchema.safeParse(body)
    
    if (!validation.success) {
      throw new APIError(
        'Invalid request data',
        400,
        'VALIDATION_ERROR',
        validation.error.issues
      )
    }

    const { data, error } = await supabase
      .from('your_table')
      .update(validation.data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new APIError('Resource not found', 404, 'NOT_FOUND')
      }
      throw error
    }

    cacheInvalidation.yourResource(id)

    return NextResponse.json(data)
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}

// DELETE - Remove resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
    }

    const { id } = await params

    const { error } = await supabase
      .from('your_table')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error

    cacheInvalidation.yourResource(id)

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error: unknown) {
    return handleAPIError(error)
  }
}
```

## Common Patterns

### 1. Authentication

```typescript
const supabase = await createClient()
const { data: { user }, error: authError } = await supabase.auth.getUser()

if (authError || !user) {
  throw new APIError('Unauthorized', 401, 'AUTH_REQUIRED')
}
```

### 2. Validation

```typescript
const body = await request.json()
const validation = Schema.safeParse(body)

if (!validation.success) {
  throw new APIError(
    'Invalid request data',
    400,
    'VALIDATION_ERROR',
    validation.error.issues
  )
}
```

### 3. Database Query with RLS

```typescript
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('user_id', user.id)  // Always filter by user_id

if (error) throw error
```

### 4. Error Handling

```typescript
try {
  // Your code
} catch (error: unknown) {
  return handleAPIError(error)
}
```

### 5. Cache Invalidation

```typescript
// After create/update/delete
cacheInvalidation.recipes()
cacheInvalidation.recipes(recipeId)  // Specific resource
```

## Error Codes

### Standard HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Auth required |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate/constraint violation |
| 500 | Internal Server Error | Unexpected error |

### Custom Error Codes

| Code | Meaning |
|------|---------|
| AUTH_REQUIRED | User not authenticated |
| VALIDATION_ERROR | Input validation failed |
| NOT_FOUND | Resource not found |
| DUPLICATE_EMAIL | Email already exists |
| INSUFFICIENT_STOCK | Not enough inventory |

## Best Practices

### ✅ DO

```typescript
// Use consistent error variable name
catch (error: unknown) { }

// Use APIError for known errors
throw new APIError('Not found', 404, 'NOT_FOUND')

// Use handleAPIError in catch
catch (error: unknown) {
  return handleAPIError(error)
}

// Always filter by user_id
.eq('user_id', user.id)

// Invalidate cache after mutations
cacheInvalidation.resource()

// Use structured logging
apiLogger.info({ userId, orderId }, 'Order created')
```

### ❌ DON'T

```typescript
// Don't use inconsistent error names
catch (err: unknown) { }
catch (e: unknown) { }

// Don't return manual error responses
return NextResponse.json({ error: 'Failed' }, { status: 500 })

// Don't use console.log
console.log('Debug info')

// Don't forget user_id filter
.select('*')  // Missing .eq('user_id', user.id)

// Don't forget cache invalidation
// After mutation, no cacheInvalidation call
```

## Testing

### Manual Testing

```bash
# GET request
curl http://localhost:3000/api/your-endpoint

# POST request
curl -X POST http://localhost:3000/api/your-endpoint \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'

# With auth
curl http://localhost:3000/api/your-endpoint \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Unit Testing

```typescript
import { POST } from './route'
import { NextRequest } from 'next/server'

describe('POST /api/your-endpoint', () => {
  it('should create resource', async () => {
    const request = new NextRequest('http://localhost:3000/api/your-endpoint', {
      method: 'POST',
      body: JSON.stringify({ field: 'value' })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toHaveProperty('id')
  })

  it('should return 401 without auth', async () => {
    // Test without auth token
  })

  it('should return 400 with invalid data', async () => {
    // Test with invalid data
  })
})
```

## Debugging

### Check Logs

```bash
# View API logs
tail -f logs/api.log

# Filter by error
grep "ERROR" logs/api.log

# Filter by endpoint
grep "/api/recipes" logs/api.log
```

### Common Issues

1. **401 Unauthorized**
   - Check if user is authenticated
   - Verify token is valid
   - Check middleware configuration

2. **400 Validation Error**
   - Check request body format
   - Verify required fields
   - Check Zod schema

3. **404 Not Found**
   - Verify resource exists
   - Check user_id filter
   - Verify RLS policies

4. **500 Internal Server Error**
   - Check server logs
   - Verify database connection
   - Check for unhandled errors

## Resources

- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Zod Validation](https://zod.dev/)
- [API Error Handler](../src/lib/errors/api-error-handler.ts)
- [Code Quality Standards](../.kiro/steering/code-quality.md)

## Checklist

Before deploying new API route:

- [ ] Follows standard template
- [ ] Has proper authentication
- [ ] Validates input with Zod
- [ ] Filters by user_id for RLS
- [ ] Uses handleAPIError
- [ ] Invalidates cache after mutations
- [ ] Has proper error handling
- [ ] Uses structured logging
- [ ] Has tests
- [ ] Documented in API docs

---

**Last Updated:** October 28, 2025
