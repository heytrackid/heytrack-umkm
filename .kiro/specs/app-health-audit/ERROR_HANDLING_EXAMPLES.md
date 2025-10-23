# Error Handling Implementation Examples

This document provides practical examples of how to use the new error handling utilities in the HeyTrack UMKM application.

## Example 1: Updating an API Route

### Before (Old Pattern)

```typescript
// src/app/api/orders/route.ts (OLD)
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseAdmin()
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### After (New Pattern)

```typescript
// src/app/api/orders/route.ts (NEW)
import { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {
  validateAuth,
  createSuccessResponse,
  handleDatabaseError,
  withErrorHandling,
} from '@/lib/errors'

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = await createClient()
    
    // Validate authentication
    const { user, error: authError } = await validateAuth(() => supabase.auth.getUser())
    if (authError) return authError

    // Fetch user's orders with RLS
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
    
    if (error) {
      return handleDatabaseError(error, 'GET /api/orders')
    }

    return createSuccessResponse(data)
  })
}
```

### Benefits
- ✅ Automatic auth validation
- ✅ Consistent error responses
- ✅ Proper error logging
- ✅ RLS enforcement with user_id
- ✅ Type-safe responses

## Example 2: Updating a Client Component

### Before (Old Pattern)

```typescript
// src/app/orders/page.tsx (OLD)
'use client'

import { useEffect, useState } from 'react'
import { toast } from '@/hooks/use-toast'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      
      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch orders',
        })
        return
      }

      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return <div>{/* Render orders */}</div>
}
```

### After (New Pattern)

```typescript
// src/app/orders/page.tsx (NEW)
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { fetchWithErrorHandling, showSuccessToast } from '@/lib/errors'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const { isLoading: authLoading, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchOrders()
    }
  }, [authLoading, isAuthenticated])

  const fetchOrders = async () => {
    try {
      const data = await fetchWithErrorHandling('/api/orders')
      setOrders(data)
    } catch (error) {
      // Error already handled with toast and redirect
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) return <div>Loading...</div>

  return <div>{/* Render orders */}</div>
}
```

### Benefits
- ✅ Auth state management
- ✅ Automatic error handling
- ✅ Automatic redirect on 401
- ✅ Cleaner code
- ✅ Better user experience

## Example 3: Creating a New API Endpoint

```typescript
// src/app/api/customers/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {
  validateAuth,
  createSuccessResponse,
  handleDatabaseError,
  handleValidationError,
  withErrorHandling,
  HttpStatus,
} from '@/lib/errors'

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = await createClient()
    
    // Validate authentication
    const { user, error: authError } = await validateAuth(() => supabase.auth.getUser())
    if (authError) return authError

    // Parse request body
    const body = await request.json()
    
    // Validate input
    if (!body.name || !body.email) {
      return handleValidationError(
        'Data tidak lengkap',
        'Name and email are required'
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return handleValidationError(
        'Format email tidak valid',
        'Invalid email format'
      )
    }

    // Insert customer
    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: body.name,
        email: body.email,
        phone: body.phone,
        user_id: user.id,
      })
      .select()
      .single()
    
    if (error) {
      return handleDatabaseError(error, 'POST /api/customers')
    }

    return createSuccessResponse(
      data,
      'Customer berhasil ditambahkan',
      HttpStatus.CREATED
    )
  })
}

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = await createClient()
    
    // Validate authentication
    const { user, error: authError } = await validateAuth(() => supabase.auth.getUser())
    if (authError) return authError

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error } = await query
    
    if (error) {
      return handleDatabaseError(error, 'GET /api/customers')
    }

    return createSuccessResponse(data)
  })
}
```

## Example 4: Form Submission with Error Handling

```typescript
// src/components/forms/CustomerForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApiErrorHandler, showSuccessToast } from '@/lib/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function CustomerForm() {
  const router = useRouter()
  const { handleError } = useApiErrorHandler()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        handleError(response)
        return
      }

      const result = await response.json()
      showSuccessToast('Berhasil', result.message || 'Customer berhasil ditambahkan')
      
      // Reset form
      setFormData({ name: '', email: '', phone: '' })
      
      // Refresh data
      router.refresh()
      
    } catch (error) {
      handleError(error, 'Gagal menambahkan customer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="Nama"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <Input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <Input
        type="tel"
        placeholder="Telepon"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Menyimpan...' : 'Simpan'}
      </Button>
    </form>
  )
}
```

## Example 5: Using Error Codes

```typescript
// src/app/api/orders/[id]/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {
  validateAuth,
  createSuccessResponse,
  handleDatabaseError,
  handleNotFound,
  handleForbidden,
  withErrorHandling,
} from '@/lib/errors'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    const supabase = await createClient()
    
    // Validate authentication
    const { user, error: authError } = await validateAuth(() => supabase.auth.getUser())
    if (authError) return authError

    // Check if order exists and belongs to user
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (fetchError || !order) {
      return handleNotFound('Order')
    }

    // Check ownership
    if (order.user_id !== user.id) {
      return handleForbidden('Anda tidak memiliki akses ke order ini')
    }

    // Delete order
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', params.id)
    
    if (deleteError) {
      return handleDatabaseError(deleteError, 'DELETE /api/orders/[id]')
    }

    return createSuccessResponse(
      { id: params.id },
      'Order berhasil dihapus'
    )
  })
}
```

## Example 6: Handling Multiple Error Types

```typescript
// src/app/api/recipes/route.ts
import { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import {
  validateAuth,
  createSuccessResponse,
  handleDatabaseError,
  handleValidationError,
  withErrorHandling,
  ErrorCode,
  createErrorResponse,
} from '@/lib/errors'

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = await createClient()
    
    // Validate authentication
    const { user, error: authError } = await validateAuth(() => supabase.auth.getUser())
    if (authError) return authError

    // Parse request body
    const body = await request.json()
    
    // Validate recipe data
    if (!body.name) {
      return handleValidationError('Nama resep wajib diisi')
    }

    if (!body.ingredients || body.ingredients.length === 0) {
      return handleValidationError('Resep harus memiliki minimal 1 bahan')
    }

    // Validate ingredients exist
    const ingredientIds = body.ingredients.map((i: any) => i.ingredient_id)
    const { data: existingIngredients, error: checkError } = await supabase
      .from('bahan_baku')
      .select('id')
      .in('id', ingredientIds)
      .eq('user_id', user.id)
    
    if (checkError) {
      return handleDatabaseError(checkError, 'Check ingredients')
    }

    if (existingIngredients.length !== ingredientIds.length) {
      return createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        400,
        'Beberapa bahan tidak ditemukan'
      )
    }

    // Insert recipe
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        name: body.name,
        description: body.description,
        user_id: user.id,
      })
      .select()
      .single()
    
    if (recipeError) {
      return handleDatabaseError(recipeError, 'Insert recipe')
    }

    // Insert recipe ingredients
    const recipeIngredients = body.ingredients.map((i: any) => ({
      recipe_id: recipe.id,
      ingredient_id: i.ingredient_id,
      quantity: i.quantity,
      unit: i.unit,
    }))

    const { error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .insert(recipeIngredients)
    
    if (ingredientsError) {
      // Rollback: delete the recipe
      await supabase.from('recipes').delete().eq('id', recipe.id)
      return handleDatabaseError(ingredientsError, 'Insert recipe ingredients')
    }

    return createSuccessResponse(recipe, 'Resep berhasil ditambahkan')
  })
}
```

## Migration Checklist

When updating existing code to use the new error handling:

### API Routes
- [ ] Replace `createServerSupabaseAdmin()` with `createClient()`
- [ ] Add `validateAuth()` at the start of each endpoint
- [ ] Replace custom error responses with error handlers
- [ ] Wrap handler with `withErrorHandling()`
- [ ] Use `createSuccessResponse()` for success cases
- [ ] Add proper context to error handlers

### Client Components
- [ ] Import `useApiErrorHandler` or `fetchWithErrorHandling`
- [ ] Replace custom error handling with error handlers
- [ ] Remove manual toast notifications for errors
- [ ] Remove manual redirect logic for 401 errors
- [ ] Use `showSuccessToast()` for success messages

### Benefits Summary
- ✅ Consistent error messages across the app
- ✅ Automatic auth validation
- ✅ Automatic error logging
- ✅ Type-safe responses
- ✅ Better user experience
- ✅ Cleaner, more maintainable code
- ✅ Security best practices
