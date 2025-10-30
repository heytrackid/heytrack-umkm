# API Route Authentication Template

Quick reference untuk membuat API route yang secure.

## Standard Template

```typescript
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { apiLogger } from '@/lib/logger'
import { cacheInvalidation } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    // 1. ✅ AUTHENTICATION (WAJIB!)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. ✅ VALIDATION (jika ada query params)
    const { searchParams } = new URL(request.url)
    const validation = QuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: validation.error.issues },
        { status: 400 }
      )
    }

    // 3. ✅ DATABASE QUERY dengan RLS
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('user_id', user.id) // ✅ WAJIB untuk RLS!
    
    if (error) {
      apiLogger.error({ error, userId: user.id }, 'Query failed')
      throw error
    }

    // 4. ✅ LOGGING
    apiLogger.info({ userId: user.id, count: data.length }, 'Data fetched')

    // 5. ✅ RETURN
    return NextResponse.json(data)

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/route')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. ✅ AUTHENTICATION
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. ✅ VALIDATION
    const body = await request.json()
    const validation = CreateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.issues },
        { status: 400 }
      )
    }

    // 3. ✅ INSERT dengan user_id
    const { data, error } = await supabase
      .from('table')
      .insert({
        ...validation.data,
        user_id: user.id // ✅ WAJIB!
      })
      .select()
      .single()
    
    if (error) {
      apiLogger.error({ error, userId: user.id }, 'Insert failed')
      throw error
    }

    // 4. ✅ CACHE INVALIDATION
    await cacheInvalidation.table()

    // 5. ✅ LOGGING
    apiLogger.info({ userId: user.id, id: data.id }, 'Record created')

    // 6. ✅ RETURN
    return NextResponse.json(data, { status: 201 })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in POST /api/route')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Dynamic Route Template ([id])

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
    
    // 1. ✅ AUTHENTICATION
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. ✅ QUERY dengan OWNERSHIP CHECK
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id) // ✅ Ownership check
      .single()
    
    if (error?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    if (error) throw error

    return NextResponse.json(data)

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in GET /api/route/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // 1. ✅ AUTHENTICATION
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. ✅ VALIDATION
    const body = await request.json()
    const validation = UpdateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error.issues },
        { status: 400 }
      )
    }

    // 3. ✅ UPDATE dengan OWNERSHIP CHECK
    const { data, error } = await supabase
      .from('table')
      .update(validation.data)
      .eq('id', id)
      .eq('user_id', user.id) // ✅ Ownership check
      .select()
      .single()
    
    if (error?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    if (error) throw error

    // 4. ✅ CACHE INVALIDATION
    await cacheInvalidation.table()

    return NextResponse.json(data)

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in PUT /api/route/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    
    // 1. ✅ AUTHENTICATION
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. ✅ DELETE dengan OWNERSHIP CHECK
    const { error } = await supabase
      .from('table')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id) // ✅ Ownership check
    
    if (error?.code === 'PGRST116') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    if (error) throw error

    // 3. ✅ CACHE INVALIDATION
    await cacheInvalidation.table()

    return NextResponse.json({ message: 'Deleted successfully' })

  } catch (error: unknown) {
    apiLogger.error({ error }, 'Error in DELETE /api/route/[id]')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Quick Checklist

Sebelum commit, pastikan:

- [ ] ✅ Auth check di awal handler
- [ ] ✅ `.eq('user_id', user.id)` di semua query
- [ ] ✅ Validation dengan Zod schema
- [ ] ✅ Error handling dengan try-catch
- [ ] ✅ Logging dengan apiLogger + userId
- [ ] ✅ Cache invalidation setelah mutation
- [ ] ✅ Return proper HTTP status codes
- [ ] ✅ Tidak expose internal error ke client

## Common Mistakes

### ❌ JANGAN:
```typescript
// Missing auth check
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data } = await supabase.from('table').select('*')
  // ❌ No auth check!
}

// Missing user_id filter
const { data } = await supabase
  .from('table')
  .select('*')
  // ❌ Returns all users' data!

// Using service role without auth
import { createServiceRoleClient } from '@/utils/supabase/service-role'
const supabase = createServiceRoleClient()
// ❌ Bypasses RLS!
```

### ✅ LAKUKAN:
```typescript
// Proper auth check
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { data } = await supabase
    .from('table')
    .select('*')
    .eq('user_id', user.id) // ✅ RLS enforced
}
```

## Copy-Paste Snippets

### Auth Check
```typescript
const supabase = await createClient()
const { data: { user }, error: authError } = await supabase.auth.getUser()

if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Query with RLS
```typescript
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('user_id', user.id)
```

### Insert with user_id
```typescript
const { data, error } = await supabase
  .from('table')
  .insert({
    ...validatedData,
    user_id: user.id
  })
  .select()
  .single()
```

### Update with ownership
```typescript
const { data, error } = await supabase
  .from('table')
  .update(validatedData)
  .eq('id', id)
  .eq('user_id', user.id)
  .select()
  .single()
```

### Delete with ownership
```typescript
const { error } = await supabase
  .from('table')
  .delete()
  .eq('id', id)
  .eq('user_id', user.id)
```

### Error handling
```typescript
} catch (error: unknown) {
  apiLogger.error({ error, userId: user?.id }, 'Operation failed')
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```
