# Error Handling Utilities

This directory contains centralized error handling utilities for both client-side and server-side code.

## Overview

The error handling system provides:
- **Consistent error messages** in Indonesian
- **Error codes** for different failure scenarios
- **Client-side utilities** for handling API errors with toast notifications
- **Server-side utilities** for creating standardized API responses
- **Automatic redirects** on authentication failures

## Usage

### Client-Side Error Handling

#### Using the Error Handler Hook

```typescript
'use client'

import { useApiErrorHandler } from '@/lib/errors'

export function MyComponent() {
  const { handleError } = useApiErrorHandler()

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data')
      if (!response.ok) {
        handleError(response)
        return
      }
      const data = await response.json()
      // Handle success
    } catch (error) {
      handleError(error)
    }
  }

  return <button onClick={fetchData}>Fetch Data</button>
}
```

#### Using the Fetch Wrapper

```typescript
import { fetchWithErrorHandling } from '@/lib/errors'

async function getData() {
  try {
    const data = await fetchWithErrorHandling<MyDataType>(
      '/api/data',
      { method: 'GET' },
      { customMessage: 'Gagal mengambil data' }
    )
    return data
  } catch (error) {
    // Error already handled with toast
    return null
  }
}
```

#### Showing Toast Notifications

```typescript
import { showSuccessToast, showErrorToast } from '@/lib/errors'

// Success notification
showSuccessToast('Berhasil', 'Data berhasil disimpan')

// Error notification
showErrorToast('Gagal menyimpan data')
```

### Server-Side Error Handling

#### Basic API Route Pattern

```typescript
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
    const { user, error } = await validateAuth(() => supabase.auth.getUser())
    if (error) return error

    // Perform database operations
    const { data, error: dbError } = await supabase
      .from('table_name')
      .select('*')
      .eq('user_id', user.id)
    
    if (dbError) {
      return handleDatabaseError(dbError, 'GET /api/endpoint')
    }

    return createSuccessResponse(data)
  })
}
```

#### Handling Different Error Types

```typescript
import {
  handleAuthError,
  handleDatabaseError,
  handleValidationError,
  handleUnauthorized,
  handleForbidden,
  handleNotFound,
} from '@/lib/errors'

// Authentication error
if (authError) {
  return handleAuthError(authError, 'login')
}

// Database error
if (dbError) {
  return handleDatabaseError(dbError, 'fetch users')
}

// Validation error
if (!isValid) {
  return handleValidationError('Data tidak valid', 'Email format salah')
}

// Unauthorized access
if (!user) {
  return handleUnauthorized()
}

// Forbidden access
if (!hasPermission) {
  return handleForbidden('Anda tidak memiliki izin')
}

// Not found
if (!resource) {
  return handleNotFound('User')
}
```

#### Creating Custom Responses

```typescript
import { createErrorResponse, createSuccessResponse, ErrorCode } from '@/lib/errors'

// Success response
return createSuccessResponse(
  { id: 1, name: 'John' },
  'Data berhasil diambil',
  200
)

// Error response with error code
return createErrorResponse(
  ErrorCode.VALIDATION_ERROR,
  400,
  'Email sudah terdaftar'
)

// Error response with custom message
return createErrorResponse(
  'Custom error message',
  500
)
```

## Error Codes

The system uses standardized error codes:

### Authentication Errors
- `AUTH_ERROR` - Authentication verification failed
- `NO_USER` - User must be logged in
- `SESSION_EXPIRED` - Session has expired
- `INVALID_CREDENTIALS` - Invalid email or password
- `EMAIL_NOT_CONFIRMED` - Email not confirmed
- `WEAK_PASSWORD` - Password too weak
- `EMAIL_ALREADY_EXISTS` - Email already registered

### API Errors
- `UNAUTHORIZED` - Unauthorized access (401)
- `FORBIDDEN` - Forbidden access (403)
- `NOT_FOUND` - Resource not found (404)
- `VALIDATION_ERROR` - Validation failed (400)
- `DATABASE_ERROR` - Database operation failed (500)
- `INTERNAL_ERROR` - Internal server error (500)

### Network Errors
- `NETWORK_ERROR` - Network connection issue
- `TIMEOUT_ERROR` - Request timeout

## Error Messages

All error messages are in Indonesian for better user experience:

```typescript
import { ERROR_MESSAGES, ErrorCode } from '@/lib/errors'

const message = ERROR_MESSAGES[ErrorCode.SESSION_EXPIRED]
// "Sesi Anda telah berakhir. Silakan login kembali."
```

## Automatic Redirects

The client-side error handler automatically redirects to login on 401 errors:

```typescript
// When a 401 error occurs:
// 1. Shows toast notification
// 2. Redirects to /auth/login?redirectTo=/current-path
// 3. User can return to original page after login
```

## Best Practices

1. **Always use error handlers** - Don't create custom error responses
2. **Log errors appropriately** - Use console.error for debugging
3. **Don't expose sensitive data** - Error details are hidden in production
4. **Use error codes** - Makes error handling consistent
5. **Provide context** - Include operation context in error logs
6. **Handle all error types** - Network, auth, database, validation

## Examples

### Complete API Route Example

```typescript
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
    
    // Validate auth
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

    // Insert data
    const { data, error: dbError } = await supabase
      .from('customers')
      .insert({
        name: body.name,
        email: body.email,
        user_id: user.id,
      })
      .select()
      .single()
    
    if (dbError) {
      return handleDatabaseError(dbError, 'POST /api/customers')
    }

    return createSuccessResponse(
      data,
      'Customer berhasil ditambahkan',
      HttpStatus.CREATED
    )
  })
}
```

### Complete Client Component Example

```typescript
'use client'

import { useState } from 'react'
import { useApiErrorHandler, showSuccessToast } from '@/lib/errors'

export function CustomerForm() {
  const [loading, setLoading] = useState(false)
  const { handleError } = useApiErrorHandler()

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
        }),
      })

      if (!response.ok) {
        handleError(response)
        return
      }

      const result = await response.json()
      showSuccessToast('Berhasil', result.message)
      
    } catch (error) {
      handleError(error, 'Gagal menambahkan customer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleSubmit(new FormData(e.currentTarget))
    }}>
      {/* Form fields */}
    </form>
  )
}
```

## Migration Guide

If you have existing error handling code, migrate it to use these utilities:

### Before
```typescript
// Old way
if (!response.ok) {
  toast({
    variant: 'destructive',
    title: 'Error',
    description: 'Something went wrong',
  })
  if (response.status === 401) {
    router.push('/auth/login')
  }
}
```

### After
```typescript
// New way
import { useApiErrorHandler } from '@/lib/errors'

const { handleError } = useApiErrorHandler()

if (!response.ok) {
  handleError(response)
}
```

## Testing

When testing components that use error handlers:

```typescript
import { handleApiError } from '@/lib/errors'

// Mock the error handler
jest.mock('@/lib/errors', () => ({
  handleApiError: jest.fn(),
}))

// Test error handling
it('handles API errors', async () => {
  const error = new Response('Error', { status: 500 })
  await handleApiError(error)
  expect(handleApiError).toHaveBeenCalledWith(error)
})
```
