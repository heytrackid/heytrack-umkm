# 🛡️ Error Handling Guide

**Location:** `src/components/`, `src/hooks/`, `src/lib/errors/`  
**Status:** ✅ Comprehensive error handling system  
**Last Updated:** Oct 23, 2024

---

## 📚 Table of Contents

1. [Error Boundary Components](#error-boundary-components)
2. [Error Handling Hooks](#error-handling-hooks)
3. [API Route Patterns](#api-route-patterns)
4. [Best Practices](#best-practices)
5. [Examples](#examples)

---

## 🛑 Error Boundary Components

### ErrorBoundary

Class component that catches JavaScript errors in child components.

**Location:** `src/components/error-boundary.tsx`

**Usage:**
```typescript
import { ErrorBoundary } from '@/components/error-boundary'

export function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  )
}
```

**Features:**
- ✅ Catches and displays errors gracefully
- ✅ Development error details
- ✅ Reset button to retry
- ✅ Navigation to home
- ✅ Centralized error logging

**With Custom Fallback:**
```typescript
<ErrorBoundary fallback={<CustomErrorPage />}>
  <YourComponent />
</ErrorBoundary>
```

**With Error Callback:**
```typescript
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Track to monitoring service
    reportToMonitoring(error, errorInfo)
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### ErrorFallback Components

Reusable error display components.

**Location:** `src/components/error-fallback.tsx`

**Generic Fallback:**
```typescript
import { ErrorFallback } from '@/components/error-fallback'

<ErrorBoundary fallback={<ErrorFallback />}>
  <YourComponent />
</ErrorBoundary>
```

**Customized:**
```typescript
<ErrorFallback
  title="Failed to load data"
  message="Please refresh and try again"
  error={error}
  resetError={resetFn}
/>
```

**Not Found (404):**
```typescript
import { NotFoundFallback } from '@/components/error-fallback'

<ErrorBoundary fallback={<NotFoundFallback />}>
  <YourComponent />
</ErrorBoundary>
```

**Server Error (500):**
```typescript
import { ServerErrorFallback } from '@/components/error-fallback'

<ErrorBoundary fallback={<ServerErrorFallback />}>
  <YourComponent />
</ErrorBoundary>
```

---

## 🎣 Error Handling Hooks

### useErrorHandler

Handle errors in functional components.

**Usage:**
```typescript
import { useErrorHandler } from '@/hooks'

function MyComponent() {
  const { error, isError, message, handleError, resetError } = useErrorHandler()

  const handleSubmit = async () => {
    try {
      await someAsyncOperation()
    } catch (err) {
      handleError(err, 'MyComponent.handleSubmit')
    }
  }

  if (isError) {
    return <div className="text-red-600">{message}</div>
  }

  return (
    <button onClick={handleSubmit}>
      Submit
    </button>
  )
}
```

**API:**
- `error: AppError | null` - Current error
- `isError: boolean` - Has error flag
- `message: string` - Error message
- `handleError(error, context?)` - Set error
- `resetError()` - Clear error
- `throwError(error)` - Throw error

### useAsyncError

Handle async operations with loading state.

**Usage:**
```typescript
import { useAsyncError } from '@/hooks'

function MyComponent() {
  const { executeAsync, isLoading, error, isError } = useAsyncError()

  const handleAsyncAction = async () => {
    await executeAsync(async () => {
      await fetchData()
    })
  }

  return (
    <>
      <button onClick={handleAsyncAction} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Fetch Data'}
      </button>
      {isError && <div className="text-red-600">{error?.message}</div>}
    </>
  )
}
```

**API:**
- `executeAsync(fn)` - Run async function
- `isLoading: boolean` - Currently executing
- `error: AppError | null` - Error if any
- `isError: boolean` - Has error flag
- `resetError()` - Clear error

### useFormErrors

Track errors per form field.

**Usage:**
```typescript
import { useFormErrors } from '@/hooks'

function MyForm() {
  const { fieldErrors, setFieldError, clearFieldError, hasErrors } = useFormErrors()

  const handleValidation = () => {
    clearFieldError('email')
    
    if (!email) {
      setFieldError('email', 'Email is required')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        className={fieldErrors.email ? 'border-red-500' : ''}
      />
      {fieldErrors.email && (
        <p className="text-red-500 text-sm">{fieldErrors.email}</p>
      )}
      
      <button disabled={hasErrors}>Submit</button>
    </form>
  )
}
```

**API:**
- `fieldErrors: Record<string, string>` - Field errors map
- `setFieldError(field, message)` - Set field error
- `clearFieldError(field)` - Clear specific field
- `clearAllErrors()` - Clear all errors
- `hasErrors: boolean` - Has any errors

### useRetry

Retry logic with exponential backoff.

**Usage:**
```typescript
import { useRetry } from '@/hooks'

function MyComponent() {
  const { retry, isRetrying, retryCount } = useRetry(3, 1000)

  const handleFetch = async () => {
    const result = await retry(
      async () => {
        return await fetchUnreliableData()
      },
      (attempt, error) => {
        console.log(`Retry attempt ${attempt}:`, error.message)
      }
    )

    if (result) {
      // Success
    }
  }

  return (
    <div>
      <button onClick={handleFetch} disabled={isRetrying}>
        {isRetrying ? `Retrying (${retryCount})...` : 'Fetch'}
      </button>
    </div>
  )
}
```

**API:**
- `retry(asyncFn, onRetry?)` - Run with retries
- `isRetrying: boolean` - Currently retrying
- `retryCount: number` - Current retry count
- `reset()` - Reset retry state

---

## 🌐 API Route Patterns

### Standardized Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { /* your data */ },
  "message": "Success",
  "timestamp": "2024-10-23T10:30:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "statusCode": 400,
  "timestamp": "2024-10-23T10:30:00Z",
  "details": {
    "email": "Invalid email format"
  }
}
```

### Using Route Handlers

**Simple GET:**
```typescript
import { handleGET } from '@/lib'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return handleGET(request, async (params) => {
    const data = await fetchData(params)
    return data
  })
}
```

**POST with Validation:**
```typescript
import { handlePOST } from '@/lib'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  return handlePOST(
    request,
    async (body) => {
      const result = await createItem(body)
      return result
    },
    ['name', 'email'] // Required fields
  )
}
```

**PUT with ID:**
```typescript
import { handlePUT } from '@/lib'
import { NextRequest } from 'next/server'

export async function PUT(request: NextRequest) {
  return handlePUT(
    request,
    async (id, body) => {
      const result = await updateItem(id, body)
      return result
    },
    ['name'] // Required fields
  )
}
```

**DELETE:**
```typescript
import { handleDELETE } from '@/lib'
import { NextRequest } from 'next/server'

export async function DELETE(request: NextRequest) {
  return handleDELETE(request, async (id) => {
    await deleteItem(id)
    return { success: true }
  })
}
```

### Manual Route Handler

For complex scenarios:

```typescript
import { 
  successResponse, 
  errorResponse, 
  validationErrorResponse,
  createRouteHandler
} from '@/lib'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  return createRouteHandler(async () => {
    const body = await request.json()

    // Validate
    if (!body.email) {
      throw new ValidationError('Email is required')
    }

    // Process
    const result = await createUser(body)

    return {
      data: result,
      message: 'User created successfully'
    }
  })
}
```

### Response Helpers

```typescript
import { successResponse, errorResponse, paginatedResponse } from '@/lib'

// Success with data
return successResponse({ id: 1, name: 'Item' })

// Error with custom status
return errorResponse(error, 500)

// Paginated data
return paginatedResponse(items, total, page, pageSize)
```

---

## ✅ Best Practices

### Error Handling

**✅ DO:**
- Use `AppError` and subclasses instead of throwing strings
- Log errors with context using `logError()`
- Provide user-friendly error messages
- Show detailed errors in development only
- Use error boundaries at page/section level

**❌ DON'T:**
- Throw generic `Error` objects
- Show stack traces to users
- Use `console.log` for errors (use `logger`)
- Ignore async errors
- Mix error handling patterns

### API Routes

**✅ DO:**
- Use standardized response format
- Validate inputs before processing
- Return appropriate HTTP status codes
- Include error details for debugging
- Add error handling middleware

**❌ DON'T:**
- Expose sensitive error details to clients
- Return HTML in error responses
- Ignore validation
- Mix response formats
- Return 200 for errors

### Components

**✅ DO:**
- Wrap feature sections with `ErrorBoundary`
- Show loading states during async operations
- Use `useErrorHandler` for interactive errors
- Display helpful error messages
- Provide retry/recover options

**❌ DON'T:**
- Let errors crash the app
- Hide errors silently
- Show technical error messages to users
- Ignore failed async operations
- Make errors non-recoverable

---

## 📖 Examples

### Complete Form with Error Handling

```typescript
'use client'

import { useState } from 'react'
import { useFormErrors, useAsyncError } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function RegistrationForm() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const { fieldErrors, setFieldError, clearFieldError, hasErrors } = useFormErrors()
  const { executeAsync, isLoading, error } = useAsyncError()

  const validateForm = () => {
    let valid = true

    if (!formData.email) {
      setFieldError('email', 'Email is required')
      valid = false
    } else if (!/\S+@\S+/.test(formData.email)) {
      setFieldError('email', 'Invalid email format')
      valid = false
    } else {
      clearFieldError('email')
    }

    if (!formData.password) {
      setFieldError('password', 'Password is required')
      valid = false
    } else if (formData.password.length < 8) {
      setFieldError('password', 'Password must be at least 8 characters')
      valid = false
    } else {
      clearFieldError('password')
    }

    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    await executeAsync(async () => {
      const response = await fetch('/api/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      // Success!
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value })
            clearFieldError('email')
          }}
          className={fieldErrors.email ? 'border-red-500' : ''}
        />
        {fieldErrors.email && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value })
            clearFieldError('password')
          }}
          className={fieldErrors.password ? 'border-red-500' : ''}
        />
        {fieldErrors.password && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>
        )}
      </div>

      {error && (
        <p className="text-red-500 bg-red-50 p-3 rounded">
          {error.message}
        </p>
      )}

      <Button type="submit" disabled={isLoading || hasErrors}>
        {isLoading ? 'Registering...' : 'Register'}
      </Button>
    </form>
  )
}
```

### API Route with Standardized Pattern

```typescript
import { handlePOST } from '@/lib'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  return handlePOST(
    request,
    async (body) => {
      // Your business logic
      const user = await createUser(body)
      return user
    },
    ['email', 'password', 'name'] // Required fields
  )
}
```

---

**Last Updated:** Oct 23, 2024  
**Version:** 1.0
