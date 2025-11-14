---
inclusion: always
---

# Stack Auth Quick Reference

## Standard API Route Pattern

```typescript
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isErrorResponse } from '@/lib/api-auth'
import { withSecurity, SecurityPresets } from '@/utils/security/index'
import { createClient } from '@/utils/supabase/server'
import { handleAPIError } from '@/lib/errors/api-error-handler'

async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authenticate
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) {
      return authResult
    }
    const user = authResult

    // 2. Create Supabase client
    const supabase = await createClient()

    // 3. Query data (RLS filters by user_id)
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
      .eq('user_id', user.id)

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    return handleAPIError(error, 'GET /api/your-route')
  }
}

const securedGET = withSecurity(GET, SecurityPresets.enhanced())
export { securedGET as GET }
```

## Key Functions

### `requireAuth()`
Returns authenticated user or 401 response.

```typescript
const authResult = await requireAuth()
if (isErrorResponse(authResult)) {
  return authResult // 401 Unauthorized
}
const user = authResult // { id, email, displayName }
```

### `createClient()`
Creates authenticated Supabase client with Stack Auth JWT.

```typescript
const supabase = await createClient()
// Automatically includes JWT with user ID for RLS
```

### `withSecurity()`
Applies security middleware to route.

```typescript
const securedGET = withSecurity(GET, SecurityPresets.enhanced())
export { securedGET as GET }
```

## Common Patterns

### POST with Validation
```typescript
async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) return authResult
    const user = authResult

    const body = await request.json()
    const validation = Schema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.issues },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('table')
      .insert({ ...validation.data, user_id: user.id })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return handleAPIError(error, 'POST /api/route')
  }
}
```

### Dynamic Route
```typescript
async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const authResult = await requireAuth()
    if (isErrorResponse(authResult)) return authResult
    const user = authResult

    const { id } = params
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns resource
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    return handleAPIError(error, 'GET /api/items/[id]')
  }
}
```

## Required Imports

```typescript
// Authentication
import { requireAuth, isErrorResponse } from '@/lib/api-auth'

// Supabase
import { createClient } from '@/utils/supabase/server'

// Security
import { withSecurity, SecurityPresets } from '@/utils/security/index'

// Error Handling
import { handleAPIError } from '@/lib/errors/api-error-handler'

// Logging
import { apiLogger } from '@/lib/logger'

// Validation
import { z } from 'zod'
```

## Checklist for New Routes

- [ ] `export const runtime = 'nodejs'`
- [ ] Import `requireAuth` and `isErrorResponse`
- [ ] Use `requireAuth()` pattern
- [ ] Use `createClient()` from `@/utils/supabase/server`
- [ ] Include `user_id` in inserts
- [ ] Apply `withSecurity()` middleware
- [ ] Use `apiLogger` instead of `console`
- [ ] Add proper error handling
- [ ] Test with authenticated requests

## Environment Variables

```bash
NEXT_PUBLIC_STACK_PROJECT_ID=your-project-id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your-key
STACK_SECRET_SERVER_KEY=your-secret
SUPABASE_JWT_SECRET=your-jwt-secret
```

## Testing

```bash
# Verify all routes
bash scripts/verify-stack-auth.sh

# Manual test
curl http://localhost:3000/api/your-route \
  -H "Cookie: stack-session=..." \
  -H "Content-Type: application/json"
```

## Common Errors

### 401 Unauthorized
User not signed in. Redirect to `/handler/sign-in`.

### RLS Policy Violation
Check `SUPABASE_JWT_SECRET` and RLS policies.

### Type Error
Use `isErrorResponse()` type guard after `requireAuth()`.

## Resources

- Full Guide: `STACK_AUTH_API_GUIDE.md`
- Summary: `STACK_AUTH_SUMMARY.md`
- Stack Auth Docs: https://docs.stack-auth.com
