# API Development Guidelines

**Version:** 2.0  
**Last Updated:** 2025-11-07  
**Status:** ✅ Production Standards

## Overview

This document establishes **mandatory standards** for all API route development in HeyTrack. Following these guidelines ensures consistency, security, maintainability, and production readiness.

---

## 🎯 Core Principles

1. **Consistency First** - All endpoints follow the same patterns
2. **Security by Default** - Every endpoint is protected
3. **Fail Fast** - Validate early, fail gracefully
4. **Observable** - Every request is traceable
5. **Type-Safe** - TypeScript strict mode, no `any`

---

## 📋 Mandatory Checklist for Every Endpoint

Before deploying ANY API endpoint, verify:

- [ ] ✅ Runtime declaration present (`export const runtime = 'nodejs'`)
- [ ] ✅ Security middleware applied (`withSecurity()`)
- [ ] ✅ Authentication check using `requireAuth()`
- [ ] ✅ Input validation with Zod schemas
- [ ] ✅ Error handling with `handleAPIError()`
- [ ] ✅ Response using helper functions (`createSuccessResponse()`)
- [ ] ✅ Request tracing with `requestId`
- [ ] ✅ Proper logging with `apiLogger`
- [ ] ✅ User ID validation for multi-tenancy
- [ ] ✅ Type-safe throughout (no `any`)

---

## 🔧 Standard API Route Template

### Basic GET Endpoint (List)

```typescript
export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { typed } from '@/types/type-utilities'
import { withSecurity, SecurityPresets } from '@/utils/security'
import { 
  requireAuth, 
  logRequestStart, 
  extractPaginationParams,
  createPaginationMetadata 
} from '@/lib/api-helpers'
import { handleAPIError } from '@/lib/errors/api-error-handler'
import { createSuccessResponse, createPaginatedResponse } from '@/lib/api-core'
import { YourQuerySchema } from '@/lib/validations'
import { apiLogger } from '@/lib/logger'

async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = logRequestStart(request, 'GET /api/your-resource')
  const startTime = Date.now()

  try {
    // 1. Authentication
    const supabase = typed(await createClient())
    const user = await requireAuth(supabase)

    // 2. Extract & validate query parameters
    const { searchParams } = new URL(request.url)
    const { page, limit, offset } = extractPaginationParams(searchParams)
    
    const queryValidation = YourQuerySchema.safeParse({
      search: searchParams.get('search'),
      // ... other params
    })

    if (!queryValidation.success) {
      return createErrorResponse(
        'Invalid query parameters',
        400,
        queryValidation.error.issues
      )
    }

    const { search } = queryValidation.data

    // 3. Database query with user isolation
    let query = supabase
      .from('your_table')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    // 4. Create response with pagination
    const pagination = createPaginationMetadata(count ?? 0, page, limit)
    
    apiLogger.info({ requestId, count: data?.length }, 'Resources fetched')
    
    return createPaginatedResponse(data ?? [], pagination)

  } catch (error: unknown) {
    apiLogger.error({ requestId, error }, 'GET /api/your-resource failed')
    const apiError = handleAPIError(error)
    return createErrorResponse(apiError.message, apiError.statusCode)
  }
}

// Security middleware
const securedGET = withSecurity(GET, SecurityPresets.enhanced())
export { securedGET as GET }
```

### Basic POST Endpoint (Create)

```typescript
async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = logRequestStart(request, 'POST /api/your-resource')

  try {
    // 1. Authentication
    const supabase = typed(await createClient())
    const user = await requireAuth(supabase)

    // 2. Parse & validate body
    const body = await request.json() as unknown
    
    const validation = YourInsertSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        'Invalid request data',
        400,
        validation.error.issues
      )
    }

    const validatedData = validation.data

    // 3. Insert with user ID
    const { data, error } = await supabase
      .from('your_table')
      .insert({
        ...validatedData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    apiLogger.info({ requestId, resourceId: data.id }, 'Resource created')
    
    return createSuccessResponse(data, 'Resource created successfully')

  } catch (error: unknown) {
    apiLogger.error({ requestId, error }, 'POST /api/your-resource failed')
    const apiError = handleAPIError(error)
    return createErrorResponse(apiError.message, apiError.statusCode)
  }
}

const securedPOST = withSecurity(POST, SecurityPresets.enhanced())
export { securedPOST as POST }
```

### Basic PUT Endpoint (Update)

```typescript
async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params
  const requestId = logRequestStart(request, `PUT /api/your-resource/${id}`)

  try {
    // 1. Validate ID format
    if (!isValidUUIDFormat(id)) {
      return createErrorResponse('Invalid ID format', 400)
    }

    // 2. Authentication
    const supabase = typed(await createClient())
    const user = await requireAuth(supabase)

    // 3. Validate body
    const body = await request.json() as unknown
    
    const validation = YourUpdateSchema.safeParse(body)
    if (!validation.success) {
      return createErrorResponse(
        'Invalid request data',
        400,
        validation.error.issues
      )
    }

    // 4. Update with ownership check
    const { data, error } = await supabase
      .from('your_table')
      .update(validation.data)
      .eq('id', id)
      .eq('user_id', user.id)  // Multi-tenancy
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Resource not found', 404)
      }
      throw error
    }

    apiLogger.info({ requestId, resourceId: id }, 'Resource updated')
    
    return createSuccessResponse(data, 'Resource updated successfully')

  } catch (error: unknown) {
    apiLogger.error({ requestId, error }, 'PUT /api/your-resource failed')
    const apiError = handleAPIError(error)
    return createErrorResponse(apiError.message, apiError.statusCode)
  }
}

const securedPUT = withSecurity(PUT, SecurityPresets.enhanced())
export { securedPUT as PUT }
```

### Basic DELETE Endpoint

```typescript
async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await context.params
  const requestId = logRequestStart(request, `DELETE /api/your-resource/${id}`)

  try {
    // 1. Validate ID
    if (!isValidUUIDFormat(id)) {
      return createErrorResponse('Invalid ID format', 400)
    }

    // 2. Authentication
    const supabase = typed(await createClient())
    const user = await requireAuth(supabase)

    // 3. Check foreign key constraints BEFORE deleting
    const fkChecks = await Promise.all([
      supabase
        .from('related_table')
        .select('id', { count: 'exact', head: true })
        .eq('your_resource_id', id)
        .limit(1),
    ])

    const [relatedCheck] = fkChecks
    
    if (relatedCheck.count && relatedCheck.count > 0) {
      return createErrorResponse(
        `Cannot delete resource: ${relatedCheck.count} related records exist`,
        409
      )
    }

    // 4. Delete with ownership check
    const { error } = await supabase
      .from('your_table')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      // Handle database constraint errors
      if (error.code === '23503') {
        return createErrorResponse(
          'Cannot delete: resource is referenced by other data',
          409
        )
      }
      throw error
    }

    apiLogger.info({ requestId, resourceId: id }, 'Resource deleted')
    
    return createSuccessResponse(null, 'Resource deleted successfully')

  } catch (error: unknown) {
    apiLogger.error({ requestId, error }, 'DELETE /api/your-resource failed')
    const apiError = handleAPIError(error)
    return createErrorResponse(apiError.message, apiError.statusCode)
  }
}

const securedDELETE = withSecurity(DELETE, SecurityPresets.enhanced())
export { securedDELETE as DELETE }
```

---

## 🔒 Security Middleware Standards

### When to Use Each Preset

```typescript
// Standard API endpoints (99% of cases)
SecurityPresets.enhanced()
// - Rate limit: 50 req/15min
// - SQL injection protection
// - XSS protection
// - Input sanitization

// Analytics & sensitive data
SecurityPresets.maximum()
// - Rate limit: 20 req/15min
// - Enhanced validation
// - Stricter checks

// ❌ DO NOT USE
SecurityPresets.basic()
// - Inconsistent with standards
// - Migrate all to enhanced()
```

### Application Pattern

```typescript
// CORRECT
const securedGET = withSecurity(GET, SecurityPresets.enhanced())
const securedPOST = withSecurity(POST, SecurityPresets.enhanced())
const securedPUT = withSecurity(PUT, SecurityPresets.enhanced())
const securedDELETE = withSecurity(DELETE, SecurityPresets.enhanced())

export { securedGET as GET, securedPOST as POST, securedPUT as PUT, securedDELETE as DELETE }
```

---

## ✅ Validation Standards

### Always Use Zod Schemas

```typescript
// ❌ BAD - No validation
const body = await request.json()
const { name, email } = body  // Unsafe!

// ✅ GOOD - Zod validation
const body = await request.json() as unknown
const validation = YourSchema.safeParse(body)

if (!validation.success) {
  return createErrorResponse(
    'Invalid request data',
    400,
    validation.error.issues  // Include detailed errors
  )
}

const { name, email } = validation.data  // Type-safe!
```

### Schema Location

```typescript
// Domain-specific schemas
src/lib/validations/domains/
  - customer.ts
  - order.ts
  - ingredient.ts
  - recipe.ts
  - supplier.ts
  - finance.ts

// Each should export:
export const YourResourceInsertSchema = z.object({ ... })
export const YourResourceUpdateSchema = YourResourceInsertSchema.partial()
```

---

## 🎭 Error Handling Standards

### NEVER Use `throw error` Directly

```typescript
// ❌ BAD - Unhandled error
if (error) {
  throw error
}

// ✅ GOOD - Proper error handling
if (error) {
  const apiError = handleAPIError(error)
  return createErrorResponse(apiError.message, apiError.statusCode)
}
```

### Catch Block Pattern

```typescript
try {
  // ... your logic
} catch (error: unknown) {
  // Always log with requestId
  apiLogger.error({ requestId, error }, 'Operation failed')
  
  // Use centralized error handler
  const apiError = handleAPIError(error)
  return createErrorResponse(apiError.message, apiError.statusCode)
}
```

### Database Error Codes

```typescript
// Common Postgres error codes
if (error.code === 'PGRST116') {
  return createErrorResponse('Resource not found', 404)
}

if (error.code === '23505') {
  return createErrorResponse('Resource already exists', 409)
}

if (error.code === '23503') {
  return createErrorResponse('Cannot delete: referenced by other data', 409)
}

if (error.code === '23502') {
  return createErrorResponse('Required field missing', 400)
}
```

---

## 📤 Response Format Standards

### Success Responses

```typescript
// Single resource
return createSuccessResponse(data, 'Optional message')
// Returns: { success: true, data, message? }

// List with pagination
return createPaginatedResponse(data, pagination, 'Optional message')
// Returns: { success: true, data, pagination, message? }

// Operation confirmation
return createSuccessResponse(null, 'Operation completed')
// Returns: { success: true, message }
```

### Error Responses

```typescript
// Simple error
return createErrorResponse('Error message', 400)
// Returns: { success: false, error: 'message' }

// With validation details
return createErrorResponse(
  'Validation failed',
  400,
  validation.error.issues
)
// Returns: { success: false, error: 'message', errors: [...] }

// With request ID (for tracing)
return createErrorResponse('Error', 500, undefined, requestId)
```

---

## 🔍 Logging Standards

### Request Lifecycle Logging

```typescript
// Start of request
const requestId = logRequestStart(request, 'GET /api/resource')

// During processing
apiLogger.info({ requestId, details }, 'Processing step')
apiLogger.debug({ requestId, data }, 'Debug info')

// On error
apiLogger.error({ requestId, error }, 'Operation failed')

// End of request (optional)
logRequestEnd(requestId, 'GET /api/resource', 200, startTime)
```

### What to Log

✅ **DO Log:**
- Request start/end with requestId
- Authentication failures
- Validation failures
- Database errors
- Business logic milestones

❌ **DON'T Log:**
- Passwords or secrets
- Full request bodies (use excerpts)
- PII without masking
- Stack traces in production (use error IDs)

---

## 🔐 Authentication & Authorization

### Always Use Helper

```typescript
// ✅ GOOD - Throws AuthenticationError
const user = await requireAuth(supabase)

// ✅ GOOD - Returns NextResponse
const authResult = await requireAuthResponse(supabase)
if (authResult instanceof NextResponse) return authResult
const user = authResult

// ❌ BAD - Repeated code
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) { ... }
```

### Multi-Tenancy Enforcement

```typescript
// ALWAYS filter by user_id
.eq('user_id', user.id)

// For GET single
.eq('id', resourceId)
.eq('user_id', user.id)
.single()

// For UPDATE
.update(data)
.eq('id', resourceId)
.eq('user_id', user.id)

// For DELETE
.delete()
.eq('id', resourceId)
.eq('user_id', user.id)
```

---

## 📊 Testing Standards

### Required Tests per Endpoint

1. **Authentication Tests**
   - Unauthorized access (no token)
   - Invalid token
   - Expired token

2. **Validation Tests**
   - Missing required fields
   - Invalid field formats
   - Out-of-range values

3. **Authorization Tests**
   - Access other user's resources
   - Multi-tenancy enforcement

4. **Business Logic Tests**
   - Happy path scenarios
   - Edge cases
   - Error scenarios

5. **Database Tests**
   - Foreign key constraints
   - Unique constraints
   - Data integrity

---

## 🚫 Common Mistakes to Avoid

### 1. Forgetting User ID Filter

```typescript
// ❌ BAD - Returns all users' data!
const { data } = await supabase
  .from('orders')
  .select()

// ✅ GOOD - User isolation
const { data } = await supabase
  .from('orders')
  .select()
  .eq('user_id', user.id)
```

### 2. Not Validating UUID Format

```typescript
// ❌ BAD - Database error on invalid UUID
const { data } = await supabase
  .from('orders')
  .select()
  .eq('id', id)

// ✅ GOOD - Validate first
if (!isValidUUIDFormat(id)) {
  return createErrorResponse('Invalid ID format', 400)
}
```

### 3. Inconsistent Error Responses

```typescript
// ❌ BAD - Different formats
return NextResponse.json({ error: 'message' }, { status: 400 })
return NextResponse.json({ message: 'error' }, { status: 400 })
return NextResponse.json({ success: false, error: 'message' })

// ✅ GOOD - Always use helper
return createErrorResponse('message', 400)
```

### 4. Missing Foreign Key Checks

```typescript
// ❌ BAD - Database error on constraint violation
await supabase.from('ingredients').delete().eq('id', id)

// ✅ GOOD - Check first
const { count } = await supabase
  .from('recipe_ingredients')
  .select('id', { count: 'exact', head: true })
  .eq('ingredient_id', id)

if (count && count > 0) {
  return createErrorResponse('Cannot delete: used in recipes', 409)
}
```

---

## 📚 Additional Resources

- **Error Handling:** `/src/lib/errors/api-error-handler.ts`
- **API Helpers:** `/src/lib/api-helpers.ts`
- **Validation Schemas:** `/src/lib/validations/domains/`
- **Security Middleware:** `/src/utils/security/api-middleware.ts`
- **Type Utilities:** `/src/types/type-utilities.ts`

---

## ✨ Quick Reference Checklist

When creating a new API endpoint, copy this checklist:

```
[ ] Runtime declaration added
[ ] Security middleware applied
[ ] Authentication helper used
[ ] Input validation with Zod
[ ] Error handling with handleAPIError()
[ ] Response helpers used
[ ] Request ID generated
[ ] User ID filter applied
[ ] Foreign key checks (for DELETE)
[ ] Logging added
[ ] Type-safe (no any)
[ ] Tests written
```

---

**Last Review:** 2025-11-07  
**Next Review:** When adding new patterns or discovering issues

**Questions?** Check existing endpoints in `/src/app/api` for reference implementations.
